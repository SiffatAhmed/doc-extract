/**
 * Text extraction for PDF and DOCX files. The parsing libraries are large,
 * so they're loaded on demand the first time a file of that type is opened.
 */

/** Extract text from a PDF, rebuilding lines from item Y positions. */
async function pdfToText(buffer: ArrayBuffer): Promise<string> {
  const [pdfjs, { default: workerUrl }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let out = "";

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let line = "";
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!("str" in item)) continue; // skip marked-content entries
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        out += line.trim() + "\n";
        line = "";
      }
      line += item.str + (item.hasEOL ? " " : "");
      lastY = y;
    }
    out += line.trim() + "\n\n";
  }
  return out;
}

async function docxToText(buffer: ArrayBuffer): Promise<string> {
  const { default: mammoth } = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/** Read a PDF or DOCX file and return its plain text. Throws if no text is found. */
export async function extractText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const text = /\.pdf$/i.test(file.name) ? await pdfToText(buffer) : await docxToText(buffer);
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("No text found. This looks like a scanned PDF (images only), which needs OCR first");
  }
  return trimmed;
}
