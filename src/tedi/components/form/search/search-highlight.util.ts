export interface SearchHighlightPart {
  text: string;
  match: boolean;
}

/** Splits `text` so the segment matching `query` can be emphasised. */
export function highlightParts(
  text: string,
  query: string,
): SearchHighlightPart[] {
  const trimmed = query.trim();
  const index = trimmed
    ? text.toLowerCase().indexOf(trimmed.toLowerCase())
    : -1;

  if (index === -1) {
    return [{ text, match: false }];
  }

  const parts: SearchHighlightPart[] = [];

  if (index > 0) {
    parts.push({ text: text.slice(0, index), match: false });
  }

  parts.push({
    text: text.slice(index, index + trimmed.length),
    match: true,
  });

  if (index + trimmed.length < text.length) {
    parts.push({ text: text.slice(index + trimmed.length), match: false });
  }

  return parts;
}
