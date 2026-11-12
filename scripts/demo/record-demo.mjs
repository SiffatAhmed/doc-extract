/**
 * Records a demo of the app using Playwright, then edits it with ffmpeg into
 * docs/demo.mp4 and docs/demo.gif (the slow model call is fast-forwarded).
 *
 * Requirements: Ollama running locally with DEMO_MODEL pulled, and ffmpeg
 * (set FFMPEG=path/to/ffmpeg if it's not on PATH).
 *
 *   node scripts/demo/record-demo.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.join(root, "docs");
const rawDir = path.join(here, ".raw-video");

const MODEL = process.env.DEMO_MODEL ?? "qwen3.6:35b-A3B";
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const SIZE = { width: 1100, height: 760 };
const INSTRUCTIONS =
  "Extract every shipped item as a row with columns: date, item, model, quantity, unit_price, total.";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A visible fake cursor, since headless recordings don't show the mouse.
const cursorScript = () => {
  addEventListener("DOMContentLoaded", () => {
    const c = document.createElement("div");
    c.style.cssText =
      "position:fixed;z-index:99999;width:18px;height:18px;border-radius:50%;pointer-events:none;" +
      "background:rgba(31,95,74,.35);border:2px solid #1f5f4a;transform:translate(-50%,-50%);" +
      "left:-50px;top:-50px;transition:width .1s,height .1s";
    document.body.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", () => { c.style.width = c.style.height = "12px"; }, true);
    addEventListener("mouseup", () => { c.style.width = c.style.height = "18px"; }, true);
  });
};

async function main() {
  rmSync(rawDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const server = await createServer({ root, logLevel: "error", server: { port: 5199, strictPort: true } });
  await server.listen();
  const url = "http://localhost:5199/";

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: SIZE,
    colorScheme: "light",
    recordVideo: { dir: rawDir, size: SIZE },
    acceptDownloads: true,
  });
  await context.addInitScript(cursorScript);
  const page = await context.newPage();
  const t0 = Date.now();
  const mark = () => (Date.now() - t0) / 1000;

  // Helper: glide the cursor to an element, then click it.
  let mouse = { x: SIZE.width / 2, y: SIZE.height / 2 };
  async function moveTo(locator) {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    const target = { x: box.x + Math.min(box.width / 2, 120), y: box.y + box.height / 2 };
    await page.mouse.move(target.x, target.y, { steps: 25 });
    mouse = target;
  }
  async function click(locator) {
    await moveTo(locator);
    await sleep(250);
    await page.mouse.down();
    await page.mouse.up();
  }
  async function scrollTo(y) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "smooth" }), y);
    await sleep(900);
  }

  await page.goto(url);
  await page.getByText(/Connected\./).waitFor({ timeout: 30_000 });
  const tStart = mark();
  await page.mouse.move(mouse.x, mouse.y);
  await sleep(1200);

  // 1. Pick a model
  const modelInput = page.locator("#model");
  await click(modelInput);
  await modelInput.fill("");
  await modelInput.pressSequentially(MODEL, { delay: 60 });
  await sleep(500);

  // 2. Choose the PDF (Playwright can't drive the native file dialog, so we set it directly)
  await moveTo(page.locator('input[type="file"]'));
  await sleep(400);
  await page.locator('input[type="file"]').setInputFiles(path.join(here, "sample-invoice.pdf"));
  await page.getByText(/characters read/).waitFor();
  await sleep(1200);

  // 3. Write instructions
  const prompt = page.locator("#prompt");
  await click(prompt);
  await prompt.fill("");
  await prompt.pressSequentially(INSTRUCTIONS, { delay: 22 });
  await sleep(600);

  // Run extraction
  await click(page.getByRole("button", { name: "Extract to table" }));
  const tRunStart = mark();
  await page.getByText(/^Done\./).waitFor({ timeout: 300_000 });
  const tRunEnd = mark();
  await sleep(600);

  // 4. Show results and download
  const result = page.getByRole("heading", { name: "4. Review and save" });
  const resultTop = await result.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 20);
  await scrollTo(resultTop);
  await sleep(2500);
  const downloadPromise = page.waitForEvent("download");
  await click(page.getByRole("button", { name: "Download CSV" }));
  const download = await downloadPromise;
  await download.saveAs(path.join(outDir, "demo-output.csv"));
  await sleep(2000);
  const tEnd = mark();

  await context.close(); // flushes the video
  await browser.close();
  await server.close();

  const raw = path.join(rawDir, readdirSync(rawDir).find((f) => f.endsWith(".webm")));
  console.log({ tStart, tRunStart, tRunEnd, tEnd, raw });
  edit(raw, { tStart, tRunStart, tRunEnd, tEnd });
  rmSync(rawDir, { recursive: true, force: true });
}

/** Cut off the page-load, fast-forward the model wait to ~2s, export MP4 + GIF. */
function edit(raw, { tStart, tRunStart, tRunEnd, tEnd }) {
  const a = Math.max(0, tStart - 0.3);
  const b = tRunStart + 1.5; // show "Processing chunk…" for a moment
  const c = Math.max(b + 0.5, tRunEnd - 0.3);
  const fastForward = Math.max(1, (c - b) / 2); // squeeze the wait into ~2s
  const filter =
    `[0:v]trim=${a}:${b},setpts=PTS-STARTPTS[v1];` +
    `[0:v]trim=${b}:${c},setpts=(PTS-STARTPTS)/${fastForward.toFixed(2)}[v2];` +
    `[0:v]trim=${c}:${tEnd},setpts=PTS-STARTPTS[v3];` +
    `[v1][v2][v3]concat=n=3:v=1:a=0,fps=25[out]`;

  const mp4 = path.join(outDir, "demo.mp4");
  const gif = path.join(outDir, "demo.gif");
  const run = (args) => execFileSync(FFMPEG, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

  run(["-i", raw, "-filter_complex", filter, "-map", "[out]", "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-crf", "20", "-movflags", "+faststart", mp4]);
  run(["-i", mp4, "-filter_complex",
    "fps=12,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];" +
    "[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle", gif]);
  console.log(`Wrote ${mp4}\nWrote ${gif}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
