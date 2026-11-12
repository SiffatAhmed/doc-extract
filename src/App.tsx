import { useState } from "react";
import { ConnectionPanel } from "./components/ConnectionPanel";
import { ExtractionPanel } from "./components/ExtractionPanel";
import { FilePanel } from "./components/FilePanel";
import { HelpPanel } from "./components/HelpPanel";
import { ResultPanel } from "./components/ResultPanel";
import { DEFAULT_CHUNK_SIZE, DEFAULT_INSTRUCTIONS } from "./config";
import { useDocumentText } from "./hooks/useDocumentText";
import { useExtraction } from "./hooks/useExtraction";
import { useOllamaConnection } from "./hooks/useOllamaConnection";
import { csvFilenameFor, downloadCsv } from "./lib/csv";

export default function App() {
  const ollama = useOllamaConnection();
  const doc = useDocumentText();
  const extraction = useExtraction();

  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);

  const canRun = Boolean(doc.text && ollama.model.trim());

  const handleRun = () =>
    extraction.run({
      baseUrl: ollama.url,
      model: ollama.model.trim(),
      instructions,
      text: doc.text,
      chunkSize: chunkSize || DEFAULT_CHUNK_SIZE,
    });

  return (
    <main>
      <h1>Doc Extract</h1>
      <p className="sub">
        Everything runs on your machine. The document is read in your browser and only sent to your local Ollama.
      </p>

      <ConnectionPanel
        url={ollama.url}
        onUrlChange={ollama.setUrl}
        model={ollama.model}
        onModelChange={ollama.setModel}
        models={ollama.models}
        status={ollama.status}
        onConnect={ollama.connect}
      />

      <FilePanel onFileSelected={doc.load} status={doc.status} />

      <ExtractionPanel
        instructions={instructions}
        onInstructionsChange={setInstructions}
        chunkSize={chunkSize}
        onChunkSizeChange={setChunkSize}
        canRun={canRun}
        running={extraction.running}
        onRun={handleRun}
        onCancel={extraction.cancel}
        progress={extraction.progress}
        status={extraction.status}
        rawLog={extraction.rawLog}
      />

      {extraction.table && (
        <ResultPanel
          table={extraction.table}
          onDownload={() => downloadCsv(extraction.table!, csvFilenameFor(doc.file?.name))}
        />
      )}

      <HelpPanel />
    </main>
  );
}
