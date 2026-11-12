import { describe, expect, it } from "vitest";
import { chunkText } from "./chunkText";
import { csvFilenameFor, toCsv } from "./csv";
import { buildTable, parseRows } from "./parseRows";

describe("chunkText", () => {
  it("keeps short text in one chunk", () => {
    expect(chunkText("a\n\nb", 100)).toEqual(["a\n\nb"]);
  });

  it("splits on paragraph boundaries", () => {
    expect(chunkText("aaaa\n\nbbbb\n\ncccc", 10)).toEqual(["aaaa\n\nbbbb", "cccc"]);
  });

  it("hard-splits very long paragraphs", () => {
    const chunks = chunkText("x".repeat(25), 10);
    expect(chunks.join("")).toBe("x".repeat(25));
    expect(Math.max(...chunks.map((c) => c.length))).toBeLessThanOrEqual(15);
  });
});

describe("parseRows", () => {
  it("reads { rows: [...] }", () => {
    expect(parseRows('{"rows":[{"a":"1"}]}')).toEqual([{ a: "1" }]);
  });

  it("reads a bare array", () => {
    expect(parseRows('[{"a":"1"},{"a":"2"}]')).toHaveLength(2);
  });

  it("finds an array under any key", () => {
    expect(parseRows('{"items":[{"a":"1"}]}')).toEqual([{ a: "1" }]);
  });

  it("wraps a single object", () => {
    expect(parseRows('{"a":"1"}')).toEqual([{ a: "1" }]);
  });

  it("extracts JSON surrounded by prose", () => {
    expect(parseRows('Here you go: {"rows":[{"a":"1"}]} hope that helps')).toEqual([{ a: "1" }]);
  });

  it("drops non-object entries", () => {
    expect(parseRows('{"rows":[{"a":"1"}, "junk", null]}')).toEqual([{ a: "1" }]);
  });

  it("throws on unparseable JSON", () => {
    expect(() => parseRows("{not json}")).toThrow();
  });
});

describe("csv", () => {
  it("builds columns from all keys and escapes cells", () => {
    const table = buildTable([{ name: 'A "quoted", value' }, { name: "B", note: "line\nbreak" }]);
    expect(toCsv(table)).toBe('name,note\r\n"A ""quoted"", value",\r\nB,"line\nbreak"');
  });

  it("stringifies nested values", () => {
    expect(toCsv(buildTable([{ x: { y: 1 } }]))).toBe('x\r\n"{""y"":1}"');
  });

  it("derives the output filename", () => {
    expect(csvFilenameFor("Report.PDF")).toBe("Report.csv");
    expect(csvFilenameFor(undefined)).toBe("output.csv");
  });
});
