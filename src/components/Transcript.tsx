import { useState } from 'react';
import { DownloadIcon } from './icons';
import { cn } from '../lib/utils';

interface TranscriptProps {
  text: string;
  title: string;
  speaker: string;
}

const PREVIEW_LENGTH = 480;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Readable transcript with "read more" and PDF download. */
export function Transcript({ text, title, speaker }: TranscriptProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > PREVIEW_LENGTH;
  const shown = expanded || !isLong ? text : `${text.slice(0, PREVIEW_LENGTH).trim()}…`;

  /**
   * Generate the PDF using the browser's print engine instead of jsPDF.
   * jsPDF's built-in fonts can't shape Arabic (RTL + letter joining), so
   * Arabic text came out garbled. The browser renders Arabic and Latin
   * correctly with system fonts; the user picks "Save as PDF" in the dialog.
   */
  const downloadPdf = () => {
    const win = window.open('', '_blank', 'width=820,height=900');
    if (!win) {
      alert('Mohon izinkan popup untuk mengunduh PDF.');
      return;
    }
    const html = `<!doctype html>
<html lang="id" dir="auto">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { margin: 20mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Noto Naskh Arabic", "Segoe UI", "Times New Roman", serif;
    color: #1e293b;
    line-height: 1.9;
    margin: 0;
    padding: 24px;
  }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #64748b; font-size: 13px; margin: 0 0 20px; }
  .brand { color: #0F766E; font-weight: 700; }
  .transcript {
    font-size: 15px;
    white-space: pre-wrap;
    word-wrap: break-word;
    text-align: justify;
  }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${escapeHtml(speaker)} &middot; <span class="brand">Muslimsolo Audio</span></p>
  <hr />
  <div class="transcript" dir="auto">${escapeHtml(text)}</div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 300);
    };
  </script>
</body>
</html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transkrip Kajian</h2>
        <button
          onClick={downloadPdf}
          className="btn-ghost text-sm"
          aria-label="Unduh transkrip sebagai PDF"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Unduh PDF</span>
        </button>
      </div>

      <div
        className={cn(
          'prose-transcript whitespace-pre-wrap text-[15px] leading-7 text-slate-700 dark:text-slate-300',
          !expanded && isLong && 'relative',
        )}
      >
        {shown}
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-sm font-semibold text-brand-primary hover:underline dark:text-brand-accent"
        >
          {expanded ? 'Tampilkan lebih sedikit' : 'Baca Selengkapnya'}
        </button>
      )}
    </section>
  );
}
