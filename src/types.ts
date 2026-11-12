/** A single extracted record. Values are usually strings but models sometimes nest data. */
export type Row = Record<string, unknown>;

export interface Table {
  columns: string[];
  rows: Row[];
}

export interface Status {
  message: string;
  isError: boolean;
}

export const emptyStatus: Status = { message: "", isError: false };
