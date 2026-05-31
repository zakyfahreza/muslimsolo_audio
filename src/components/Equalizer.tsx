/** Animated 3-bar equalizer shown on the currently playing card. */
export function Equalizer({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-end gap-0.5 ${className}`} aria-hidden>
      <span className="h-3 w-1 origin-bottom animate-equalizer-1 rounded-full bg-current" />
      <span className="h-3 w-1 origin-bottom animate-equalizer-2 rounded-full bg-current" />
      <span className="h-3 w-1 origin-bottom animate-equalizer-3 rounded-full bg-current" />
    </span>
  );
}
