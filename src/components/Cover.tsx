import { useState } from 'react';
import { asset } from '../lib/assets';
import { cn } from '../lib/utils';

interface CoverProps {
  src?: string;
  alt: string;
  className?: string;
  /** Shown in the generated fallback when there is no image. */
  fallbackText?: string;
  /** Optional small label (e.g. "#3") in the fallback. */
  fallbackBadge?: string;
}

// Deterministic gradient pick from a string, mirrors lib/cover palettes.
const GRADIENTS = [
  'from-brand-primary to-brand-secondary',
  'from-brand-secondary to-brand-primary',
  'from-brand-primary to-surface-dark',
  'from-surface-dark to-brand-secondary',
  'from-brand-primary to-brand-accent',
  'from-brand-secondary to-brand-accent',
];
function pickGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

/**
 * Cover image with a lightweight CSS fallback. When `src` is empty (kajian
 * whose cover is auto-generated) it renders a branded gradient with text
 * instead of loading an image — cheap enough for large grids.
 */
export function Cover({ src, alt, className, fallbackText, fallbackBadge }: CoverProps) {
  const [errored, setErrored] = useState(false);
  const hasImage = Boolean(src) && !errored;

  if (!hasImage) {
    const label = fallbackText ?? alt;
    return (
      <div
        className={cn(
          'flex flex-col justify-between bg-gradient-to-br p-3 text-white',
          pickGradient(label),
          className,
        )}
        aria-label={alt}
      >
        {fallbackBadge && (
          <span className="text-sm font-extrabold text-brand-accent">{fallbackBadge}</span>
        )}
        <span className="line-clamp-3 text-sm font-bold leading-tight drop-shadow">{label}</span>
        <span className="text-[10px] font-semibold opacity-70">muslimsolo.id</span>
      </div>
    );
  }

  return (
    <img
      src={asset(src as string)}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn('object-cover', className)}
    />
  );
}
