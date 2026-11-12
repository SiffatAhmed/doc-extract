import { useEffect, useRef, useState } from "react";
import { chunkText } from "../lib/chunkText";
import { buildTable, parseRows } from "../lib/parseRows";
import { extractChunk } from "../services/ollama";
import { emptyStatus, type Row, type Status, type Table } from "../types";

export interface ExtractionRequest {
  baseUrl: string;
  model: string;
  instructions: string;
  text: string;
  chunkSize: number;
}

/** Runs the chunk-by-chunk extraction against Ollama and collects the resulting table. */
export function useExtraction() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState<Status>(emptyStatus);
  const [rawLog, setRawLog] = useState("");
  const [table, setTable] = useState<Table | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function run({ baseUrl, model, instructions, text, chunkSize }: ExtractionRequest) {
    const controller = new AbortController();
    abortRef.current = controller;

    const chunks = chunkText(text, chunkSize);
    const rows: Row[] = [];
    let log = "";

    setTable(null);
    setRawLog("");
    setRunning(true);
    setProgress({ done: 0, total: chunks.length });

    try {
      for (let i = 0; i < chunks.length; i++) {
        setStatus({ message: `Processing chunk ${i + 1} of ${chunks.length}…`, isError: false });
        const reply = await extractChunk(baseUrl, model, instructions, chunks[i], controller.signal);

        log += `--- chunk ${i + 1} ---\n`;
        log += reply.content || "(empty reply)" + (reply.thinking ? `\n[thinking only]: ${reply.thinking.slice(0, 500)}` : "");
        log += "\n\n";
        try {
          rows.push(...parseRows(reply.content));
        } catch {
          log += "(could not parse this reply as JSON)\n";
        }
        setRawLog(log);
        setProgress({ done: i + 1, total: chunks.length });
      }

      if (!rows.length) {
        throw new Error("The model returned no rows. Open 'Show raw model replies' below to see what it actually said.");
      }
      const result = buildTable(rows);
      setTable(result);
      setStatus({ message: `Done. ${result.rows.length} row(s), ${result.columns.length} column(s).`, isError: false });
    } catch (e) {
      const aborted = (e as Error).name === "AbortError";
      setStatus({ message: aborted ? "Cancelled." : (e as Error).message, isError: !aborted });
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  const cancel = () => abortRef.current?.abort();

  return { run, cancel, running, progress, status, rawLog, table };
}
