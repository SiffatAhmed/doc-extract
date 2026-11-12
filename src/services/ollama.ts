import { MODEL_OPTIONS, SYSTEM_PROMPT } from "../config";

/** Minimal client for the parts of the Ollama HTTP API this app uses. */

export const normalizeBaseUrl = (url: string) => url.trim().replace(/\/+$/, "");

interface TagsResponse {
  models: { name: string }[];
}

interface ChatResponse {
  message?: { content?: string; thinking?: string };
}

export interface ChatReply {
  content: string;
  thinking?: string;
}

/** List installed models. */
export async function listModels(baseUrl: string): Promise<string[]> {
  const res = await fetch(`${normalizeBaseUrl(baseUrl)}/api/tags`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { models }: TagsResponse = await res.json();
  return models.map((m) => m.name);
}

/** Ask the model to extract rows from one chunk of text. Returns the raw reply. */
export async function extractChunk(
  baseUrl: string,
  model: string,
  instructions: string,
  chunk: string,
  signal?: AbortSignal,
): Promise<ChatReply> {
  const res = await fetch(`${normalizeBaseUrl(baseUrl)}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      think: false,
      options: MODEL_OPTIONS,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${instructions}\n\nTEXT:\n${chunk}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama returned HTTP ${res.status}`);
  const json: ChatResponse = await res.json();
  return { content: json.message?.content ?? "", thinking: json.message?.thinking };
}
