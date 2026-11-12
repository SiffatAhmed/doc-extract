import { MIN_CHUNK_SIZE } from "../config";
import type { Status } from "../types";
import { Section } from "./Section";
import { StatusMessage } from "./StatusMessage";

interface Props {
  instructions: string;
  onInstructionsChange: (value: string) => void;
  chunkSize: number;
  onChunkSizeChange: (value: number) => void;
  canRun: boolean;
  running: boolean;
  onRun: () => void;
  onCancel: () => void;
  progress: { done: number; total: number };
  status: Status;
  rawLog: string;
}

export function ExtractionPanel(props: Props) {
  const { instructions, chunkSize, canRun, running, progress, status, rawLog } = props;

  return (
    <Section title="3. Say what to extract">
      <label htmlFor="prompt">Instructions</label>
      <textarea id="prompt" value={instructions} onChange={(e) => props.onInstructionsChange(e.target.value)} />

      <div className="row">
        <div>
          <label htmlFor="chunk">Characters per chunk</label>
          <input
            id="chunk"
            type="number"
            min={MIN_CHUNK_SIZE}
            step={500}
            value={chunkSize}
            onChange={(e) => props.onChunkSizeChange(e.target.valueAsNumber)}
          />
        </div>
      </div>

      <div className="actions">
        <button onClick={props.onRun} disabled={!canRun || running}>
          Extract to table
        </button>
        {running && (
          <button className="secondary" onClick={props.onCancel}>
            Cancel
          </button>
        )}
      </div>

      {progress.total > 0 && <progress value={progress.done} max={progress.total} />}
      <StatusMessage status={status} />

      {rawLog && (
        <details className="raw">
          <summary>Show raw model replies</summary>
          <pre>{rawLog}</pre>
        </details>
      )}
    </Section>
  );
}
