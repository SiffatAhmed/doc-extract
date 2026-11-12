/** App-wide defaults. Change these to tune extraction behaviour. */

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

export const DEFAULT_CHUNK_SIZE = 6000;
export const MIN_CHUNK_SIZE = 1000;

export const ACCEPTED_FILE_TYPES = ".pdf,.docx";

export const DEFAULT_INSTRUCTIONS =
  "Extract every distinct record, item or entry from the text as a row. " +
  "Use short, consistent column names (for example: name, category, description, date, amount). " +
  "Only include information that is in the text.";

export const SYSTEM_PROMPT =
  'You extract structured data from text. Reply with JSON only, in the form {"rows":[{...},{...}]}. ' +
  "Every row is a flat object with string values. Use the same column names for all rows. " +
  'If nothing matches, reply {"rows":[]}.';

export const MODEL_OPTIONS = {
  temperature: 0,
  num_ctx: 8192,
} as const;
