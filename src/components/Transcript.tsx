import { useState } from 'react';
import { DownloadIcon } from './icons';
import { cn } from '../lib/utils';

interface TranscriptProps {
  text: string;
  title: string;
  speaker: string;
}

const PREVIEW_LENGTH = 480;

/** Readable transcript with "read more" and PDF download. */
export function Transcript({ text, title, speaker }: TranscriptProps) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const isLong = text.length > PREVIEW_LENGTH;
  const shown = expanded || !isLong ? text : `${text.slice(0, PREVIEW_LENGTH).trim()}…`;

  const downloadPdf = async () => {
    setGenerating(true);
    try {
      // Loaded on demand so jsPDF stays out of the initial page bundle.
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 48;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const titleLines = doc.splitTextToSize(title, maxWidth);
      doc.text(titleLines, margin, margin);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(speaker, margin, margin + titleLines.length * 18 + 6);

      doc.setTextColor(20);
      doc.setFontSize(12);
      const bodyLines = doc.splitTextToSize(text, maxWidth);
      let y = margin + titleLines.length * 18 + 36;
      const lineHeight = 18;
      const pageHeight = doc.internal.pageSize.getHeight();

      bodyLines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });

      doc.save(`${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
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
