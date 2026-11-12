import { useState } from "react";
import { extractText } from "../lib/extractText";
import { emptyStatus, type Status } from "../types";

/** Holds the selected file and its extracted plain text. */
export function useDocumentText() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>(emptyStatus);

  async function load(next: File | null) {
    setFile(next);
    setText("");
    if (!next) return setStatus(emptyStatus);

    setStatus({ message: "Reading…", isError: false });
    try {
      const extracted = await extractText(next);
      setText(extracted);
      setStatus({ message: `${next.name}: ${extracted.length.toLocaleString()} characters read.`, isError: false });
    } catch (e) {
      setStatus({ message: `Could not read this file: ${(e as Error).message}.`, isError: true });
    }
  }

  return { file, text, status, load };
}
