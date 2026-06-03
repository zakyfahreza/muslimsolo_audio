import { useMemo, useState } from 'react';
import { DownloadIcon, BookIcon } from './icons';
import { cn } from '../lib/utils';
import { parseTranscript, type TranscriptBlock } from '../lib/transcript';

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

/** Render parsed blocks to HTML for the PDF (preserves headings + Arabic). */
function blocksToHtml(blocks: TranscriptBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === 'h1')
        return `<h2 style="font-size:18px;margin:20px 0 8px;color:#0f172a;font-weight:800;">${escapeHtml(b.text)}</h2>`;
      if (b.type === 'h2')
        return `<h3 style="font-size:15px;margin:16px 0 6px;color:#0F766E;font-weight:700;">${escapeHtml(b.text)}</h3>`;
      return `<p style="margin:0 0 12px;white-space:pre-wrap;word-wrap:break-word;text-align:justify;">${escapeHtml(b.text)}</p>`;
    })
    .join('');
}

/** Readable transcript with table of contents, headings, and PDF download. */
export function Transcript({ text, title, speaker }: TranscriptProps) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);

  const parsed = useMemo(() => parseTranscript(text), [text]);
  const { blocks, toc, hasHeadings } = parsed;

  const isLong = text.length > PREVIEW_LENGTH;

  // Scroll to a heading; auto-expand first so the target isn't hidden.
  const goTo = (id: string) => {
    setExpanded(true);
    // Wait a tick for the full transcript to render before scrolling.
    setTimeout(() => {
      const el = document.getElementById(`tr-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  /**
   * Download the transcript directly as a PDF (no preview window).
   * Rendered offscreen as HTML so the browser shapes Arabic correctly, then
   * rasterized with html2canvas into a multi-page PDF.
   */
  const downloadPdf = async () => {
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const tocHtml =
        toc.length > 0
          ? `<div style="margin:0 0 18px;padding:12px 16px;background:#f1f5f9;border-radius:8px;">
              <p style="margin:0 0 6px;font-weight:700;color:#0f172a;font-size:13px;">Daftar Isi</p>
              <ol style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.7;">
                ${toc
                  .map(
                    (t) =>
                      `<li style="${t.level === 2 ? 'margin-left:14px;list-style:circle;' : ''}">${escapeHtml(t.text)}</li>`,
                  )
                  .join('')}
              </ol>
            </div>`
          : '';

      const node = document.createElement('div');
      node.style.cssText =
        'position:fixed;left:-10000px;top:0;width:794px;padding:48px;background:#ffffff;' +
        'font-family:"Noto Naskh Arabic","Segoe UI","Times New Roman",serif;color:#1e293b;font-size:15px;line-height:1.9;';
      node.dir = 'auto';
      node.innerHTML = `
        <h1 style="font-size:22px;margin:0 0 4px;color:#0f172a;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 16px;color:#64748b;font-size:14px;">
          ${escapeHtml(speaker)} &middot; <span style="color:#0F766E;font-weight:700;">muslimsolo.id</span>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;" />
        ${tocHtml}
        <div dir="auto">${blocksToHtml(blocks)}</div>`;
      document.body.appendChild(node);

      try {
        const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' });
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        // Map canvas pixels <-> PDF points using the rendered width.
        const nodeRect = node.getBoundingClientRect();
        const scale = canvas.width / nodeRect.width; // CSS px -> canvas px
        const ptPerPx = pageW / canvas.width; // canvas px -> PDF pt
        const pageHeightPx = pageH / ptPerPx; // one PDF page in canvas px

        // Collect "safe" vertical break points: the top edge of every block.
        // Cutting only at these boundaries means a text line is never split.
        const blockEls = node.querySelectorAll('h1, h2, h3, p, hr, ol');
        const cuts: number[] = [];
        blockEls.forEach((el) => {
          const top = (el.getBoundingClientRect().top - nodeRect.top) * scale;
          if (top > 1) cuts.push(top);
        });
        cuts.sort((a, b) => a - b);

        // Paginate: each page spans [startY, endY); endY snaps back to the
        // nearest block boundary that still fits, so no block is cut mid-line.
        let startY = 0;
        let first = true;
        while (startY < canvas.height - 1) {
          const idealEnd = startY + pageHeightPx;
          let endY: number;
          if (idealEnd >= canvas.height) {
            endY = canvas.height;
          } else {
            // Largest break point that fits on this page (and makes progress).
            let candidate = -1;
            for (const c of cuts) {
              if (c > startY + 1 && c <= idealEnd) candidate = c;
              else if (c > idealEnd) break;
            }
            // Fallback (a single block taller than a page): hard cut.
            endY = candidate > 0 ? candidate : idealEnd;
          }

          const sliceH = Math.max(1, Math.round(endY - startY));
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = sliceH;
          const ctx = slice.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, slice.width, slice.height);
            ctx.drawImage(canvas, 0, startY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          }

          if (!first) pdf.addPage();
          first = false;
          pdf.addImage(
            slice.toDataURL('image/jpeg', 0.95),
            'JPEG',
            0,
            0,
            pageW,
            sliceH * ptPerPx,
          );
          startY = endY;
        }

        const fileName = `${title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'transkrip'}.pdf`;
        pdf.save(fileName);
      } finally {
        document.body.removeChild(node);
      }
    } catch {
      alert('Gagal membuat PDF. Coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  // Decide which blocks to render. When collapsed and long, show a clipped
  // preview of the first paragraph(s) up to PREVIEW_LENGTH characters.
  const renderBlocks = useMemo(() => {
    if (expanded || !isLong) return blocks;
    const out: TranscriptBlock[] = [];
    let budget = PREVIEW_LENGTH;
    for (const b of blocks) {
      if (budget <= 0) break;
      if (b.type === 'p') {
        if (b.text.length <= budget) {
          out.push(b);
          budget -= b.text.length;
        } else {
          out.push({ type: 'p', text: `${b.text.slice(0, budget).trim()}…` });
          budget = 0;
        }
      } else {
        out.push(b);
      }
    }
    return out;
  }, [blocks, expanded, isLong]);

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transkrip Kajian</h2>
        <button
          onClick={downloadPdf}
          disabled={generating}
          className="btn-ghost text-sm"
          aria-label="Unduh transkrip sebagai PDF"
        >
          <DownloadIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{generating ? 'Menyiapkan…' : 'Unduh PDF'}</span>
        </button>
      </div>

      {/* Table of contents (only when headings exist) */}
      {hasHeadings && (
        <nav className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <BookIcon className="h-4 w-4 text-brand-primary dark:text-brand-accent" />
            Daftar Isi
          </p>
          <ol className="space-y-1">
            {toc.map((t) => (
              <li key={t.id} className={t.level === 2 ? 'ml-4' : ''}>
                <button
                  onClick={() => goTo(t.id)}
                  className={cn(
                    'text-left transition hover:text-brand-primary dark:hover:text-brand-accent',
                    t.level === 1
                      ? 'text-sm font-semibold text-slate-700 dark:text-slate-200'
                      : 'text-sm text-slate-500 dark:text-slate-400',
                  )}
                >
                  {t.level === 2 && <span className="mr-1.5 text-slate-300">•</span>}
                  {t.text}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Transcript body */}
      <div className="prose-transcript text-[15px] leading-7 text-slate-700 dark:text-slate-300">
        {renderBlocks.map((b, i) => {
          if (b.type === 'h1')
            return (
              <h3
                key={i}
                id={`tr-${b.id}`}
                className="mt-6 scroll-mt-24 text-lg font-extrabold text-slate-900 first:mt-0 dark:text-white"
              >
                {b.text}
              </h3>
            );
          if (b.type === 'h2')
            return (
              <h4
                key={i}
                id={`tr-${b.id}`}
                className="mt-5 scroll-mt-24 text-base font-bold text-brand-primary dark:text-brand-accent"
              >
                {b.text}
              </h4>
            );
          return (
            <p key={i} className="mt-3 whitespace-pre-wrap first:mt-0">
              {b.text}
            </p>
          );
        })}
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
