import { useCallback, useEffect, useState } from "react";
import { DEFAULT_OLLAMA_URL } from "../config";
import { listModels } from "../services/ollama";
import { emptyStatus, type Status } from "../types";

const CORS_HINT =
  'You can still type a model name above. Most likely cause is browser access (CORS): restart Ollama with OLLAMA_ORIGINS="*" ' +
  "(see the note below), then click Connect again.";

export function useOllamaConnection() {
  const [url, setUrl] = useState(DEFAULT_OLLAMA_URL);
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>(emptyStatus);

  const connect = useCallback(async () => {
    setStatus({ message: "Connecting…", isError: false });
    try {
      const names = await listModels(url);
      if (!names.length) throw new Error("Ollama is running but has no models. Run: ollama pull llama3.2");
      setModels(names);
      setModel((current) => current || names[0]);
      setStatus({ message: `Connected. ${names.length} model(s) found: ${names.join(", ")}`, isError: false });
    } catch (e) {
      setStatus({ message: `Could not load the model list (${(e as Error).message}). ${CORS_HINT}`, isError: true });
    }
  }, [url]);

  // Try once on first load with the default address (later attempts are via the Connect button).
  useEffect(() => void connect(), []);

  return { url, setUrl, model, setModel, models, status, connect };
}
