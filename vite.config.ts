import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Ollama accepts browser requests from localhost origins by default,
  // so serving the app from the Vite dev server avoids most CORS problems.
  server: { host: "localhost", port: 5173 },
  preview: { host: "localhost", port: 4173 },
});
