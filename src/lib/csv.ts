import type { Table } from "../types";
import { cellText } from "./parseRows";

function escapeCell(value: unknown): string {
  const text = cellText(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Serialize a table to RFC 4180 CSV. */
export function toCsv({ columns, rows }: Table): string {
  const header = columns.map(escapeCell).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCell(row[c])).join(","));
  return [header, ...body].join("\r\n");
}

/** Trigger a browser download of the table as CSV (with BOM so Excel detects UTF-8). */
export function downloadCsv(table: Table, filename: string): void {
  const UTF8_BOM = String.fromCharCode(0xfeff);
  const blob = new Blob([UTF8_BOM, toCsv(table)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** "report.pdf" -> "report.csv" */
export function csvFilenameFor(sourceName: string | undefined): string {
  return (sourceName?.replace(/\.(docx|pdf)$/i, "") || "output") + ".csv";
}
