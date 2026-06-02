import { slugify } from './utils';

export type TranscriptBlock =
  | { type: 'h1' | 'h2'; id: string; text: string }
  | { type: 'p'; text: string };

export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2;
}

export interface ParsedTranscript {
  blocks: TranscriptBlock[];
  toc: TocItem[];
  /** True when at least one heading marker was found. */
  hasHeadings: boolean;
}

/**
 * Parse a plain-text transcript into structured blocks.
 *
 * Convention (lightweight markdown):
 *   "# Judul"   -> level 1 heading
 *   "## Sub"    -> level 2 heading
 * Any other line is treated as paragraph text. Consecutive non-heading
 * lines are kept together (newlines preserved) so existing transcripts
 * without markers render exactly as before.
 */
export function parseTranscript(text: string): ParsedTranscript {
  const lines = text.split('\n');
  const blocks: TranscriptBlock[] = [];
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();
  let paragraph: string[] = [];

  const uniqueId = (raw: string): string => {
    const base = slugify(raw) || 'bagian';
    let id = base;
    let n = 1;
    while (usedIds.has(id)) id = `${base}-${++n}`;
    usedIds.add(id);
    return id;
  };

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const joined = paragraph.join('\n').trim();
    if (joined) blocks.push({ type: 'p', text: joined });
    paragraph = [];
  };

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line.trim());
    const h1 = /^#\s+(.+)$/.exec(line.trim());
    if (h2) {
      flushParagraph();
      const t = h2[1].trim();
      const id = uniqueId(t);
      blocks.push({ type: 'h2', id, text: t });
      toc.push({ id, text: t, level: 2 });
    } else if (h1) {
      flushParagraph();
      const t = h1[1].trim();
      const id = uniqueId(t);
      blocks.push({ type: 'h1', id, text: t });
      toc.push({ id, text: t, level: 1 });
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();

  return { blocks, toc, hasHeadings: toc.length > 0 };
}
