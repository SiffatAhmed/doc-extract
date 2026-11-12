/**
 * Split text into chunks of roughly `size` characters, preferring paragraph
 * boundaries. Paragraphs much longer than `size` are hard-split.
 */
export function chunkText(text: string, size: number): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current && (current + "\n\n" + para).length > size) {
      chunks.push(current);
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
    while (current.length > size * 1.5) {
      chunks.push(current.slice(0, size));
      current = current.slice(size);
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
