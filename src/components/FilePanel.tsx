import { ACCEPTED_FILE_TYPES } from "../config";
import type { Status } from "../types";
import { Section } from "./Section";
import { StatusMessage } from "./StatusMessage";

interface Props {
  onFileSelected: (file: File | null) => void;
  status: Status;
}

export function FilePanel({ onFileSelected, status }: Props) {
  return (
    <Section title="2. Choose a PDF or Word file">
      <input
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        aria-label="Document file"
        onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
      />
      <StatusMessage status={status} />
    </Section>
  );
}
