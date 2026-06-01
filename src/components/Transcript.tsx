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
  const [generating, setGenerating] = useState(false);
  const isLong = text.length > PREVIEW_LENGTH;
  const shown = expanded || !isLong ? text : `${text.slice(0, PREVIEW_LENGTH).trim()}…`;

  /**
   * Download the transcript directly as a PDF (no preview window).
   *
   * jsPDF's built-in fonts cannot shape Arabic (RTL + letter joining), so we
   * render the transcript as HTML offscreen — where the browser shapes Arabic
   * and Latin correctly — then rasterize it with html2canvas and place the
   * image into a multi-page PDF. Heavy libs are imported on demand.
   */
  const downloadPdf = async () => {
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // Build an offscreen, print-styled node.
      const node = document.createElement('div');
      node.style.cssText =
        'position:fixed;left:-10000px;top:0;width:794px;padding:48px;background:#ffffff;' +
        'font-family:"Noto Naskh Arabic","Segoe UI","Times New Roman",serif;color:#1e293b;';
      node.dir = 'auto';
      node.innerHTML = `
        <h1 style="font-size:22px;margin:0 0 4px;color:#0f172a;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 16px;color:#64748b;font-size:14px;">
          ${escapeHtml(speaker)} &middot; <span style="color:#0F766E;font-weight:700;">Muslimsolo Audio</span>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;" />
        <div dir="auto" style="font-size:15px;line-height:1.9;white-space:pre-wrap;word-wrap:break-word;text-align:justify;">${escapeHtml(
          text,
        )}</div>`;
      document.body.appendChild(node);

      try {
        const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' });
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const imgW = pageW;
        const imgH = (canvas.height * imgW) / canvas.width;

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        let heightLeft = imgH;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
        heightLeft -= pageH;
        // Add extra pages by shifting the same tall image upward.
        while (heightLeft > 0) {
          position -= pageH;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
          heightLeft -= pageH;
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
