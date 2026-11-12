import type { Row, Table } from "../types";

const isObject = (v: unknown): v is Row => v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Parse a model reply into rows. Tolerates replies wrapped in prose,
 * bare arrays, `{ rows: [...] }`, any object holding an array, or a single object.
 * Throws if the reply contains no parseable JSON.
 */
export function parseRows(reply: string): Row[] {
  let data: unknown;
  try {
    data = JSON.parse(reply);
  } catch {
    const match = reply.match(/[[{][\s\S]*[\]}]/);
    data = match ? JSON.parse(match[0]) : [];
  }

  if (Array.isArray(data)) return data.filter(isObject);
  if (isObject(data)) {
    if (Array.isArray(data.rows)) return data.rows.filter(isObject);
    const nested = Object.values(data).find(Array.isArray);
    if (nested) return nested.filter(isObject);
    return [data];
  }
  return [];
}

/** Build a table from rows, using the union of all keys (in first-seen order) as columns. */
export function buildTable(rows: Row[]): Table {
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return { columns, rows };
}

/** Convert a cell value to display/export text. */
export function cellText(value: unknown): string {
  if (value == null) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
