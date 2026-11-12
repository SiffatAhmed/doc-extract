import { Section } from "./Section";

export function HelpPanel() {
  return (
    <Section title="If the model list stays empty">
      <p className="help">
        Ollama only accepts pages from <code>localhost</code> by default, so open this app via <code>npm run dev</code>{" "}
        (it serves on <code>http://localhost:5173</code>) rather than as a <code>file://</code> page. If that still
        fails, fully quit Ollama, then start it with access allowed. Windows (PowerShell):{" "}
        <code>$env:OLLAMA_ORIGINS="*"; ollama serve</code>. Mac/Linux: <code>OLLAMA_ORIGINS="*" ollama serve</code>.
        Reload this page afterwards.
      </p>
    </Section>
  );
}
