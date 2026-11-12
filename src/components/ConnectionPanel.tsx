import type { Status } from "../types";
import { Section } from "./Section";
import { StatusMessage } from "./StatusMessage";

interface Props {
  url: string;
  onUrlChange: (url: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  models: string[];
  status: Status;
  onConnect: () => void;
}

export function ConnectionPanel({ url, onUrlChange, model, onModelChange, models, status, onConnect }: Props) {
  return (
    <Section title="1. Connect to Ollama">
      <div className="row">
        <div>
          <label htmlFor="url">Ollama address</label>
          <input id="url" value={url} onChange={(e) => onUrlChange(e.target.value)} />
        </div>
        <div>
          <label htmlFor="model">Model (pick or type the name)</label>
          <input
            id="model"
            list="models"
            placeholder="e.g. llama3.2"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
          />
          <datalist id="models">
            {models.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="actions">
        <button className="secondary" onClick={onConnect}>
          Connect and list models
        </button>
      </div>
      <StatusMessage status={status} />
    </Section>
  );
}
