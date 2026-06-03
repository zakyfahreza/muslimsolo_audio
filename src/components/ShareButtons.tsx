import { useState } from 'react';
import { WhatsAppIcon, TelegramIcon, FacebookIcon, LinkIcon } from './icons';

interface ShareButtonsProps {
  title: string;
}

/** Social share + copy-link buttons for the current page URL. */
export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `${title} — muslimsolo.id`;

  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const base =
    'inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-105';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-slate-500 dark:text-slate-400">Bagikan:</span>
      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Bagikan ke WhatsApp" className={`${base} bg-[#25D366]`}>
        <WhatsAppIcon className="h-5 w-5" />
      </a>
      <a href={links.telegram} target="_blank" rel="noopener noreferrer" aria-label="Bagikan ke Telegram" className={`${base} bg-[#229ED9]`}>
        <TelegramIcon className="h-5 w-5" />
      </a>
      <a href={links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Bagikan ke Facebook" className={`${base} bg-[#1877F2]`}>
        <FacebookIcon className="h-5 w-5" />
      </a>
      <button onClick={copyLink} aria-label="Salin tautan" className={`${base} bg-slate-600 dark:bg-slate-500`}>
        <LinkIcon className="h-5 w-5" />
      </button>
      {copied && <span className="text-xs font-medium text-brand-primary dark:text-brand-accent">Tautan disalin!</span>}
    </div>
  );
}
