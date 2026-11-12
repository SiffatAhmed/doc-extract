import type { Table } from "../types";
import { DataTable } from "./DataTable";
import { Section } from "./Section";

interface Props {
  table: Table;
  onDownload: () => void;
}

export function ResultPanel({ table, onDownload }: Props) {
  return (
    <Section title="4. Review and save">
      <DataTable table={table} />
      <div className="actions">
        <button onClick={onDownload}>Download CSV</button>
      </div>
    </Section>
  );
}
