import { useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon } from '../icons';
import { formatTime } from '../../lib/utils';

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

interface AudioPreviewProps {
  src: string;
  title?: string;
}

/**
 * Self-contained preview player for the wizard. Independent from the public
 * global player so previewing a draft never interrupts public playback.
 */
export function AudioPreview({ src, title }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    setPlaying(false);
    setTime(0);
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play().catch(() => setPlaying(false));
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {title && (
        <p className="mb-3 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? 'Jeda' : 'Putar'}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-primary text-white shadow-md transition hover:scale-105 dark:bg-brand-accent dark:text-slate-900"
        >
          {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
        <div className="flex-1">
          <div className="relative">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-brand-primary dark:bg-brand-accent"
                style={{ width: `${pct}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={time}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = v;
                setTime(v);
              }}
              aria-label="Geser posisi"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-slate-400">
            <span>{formatTime(time)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <button
          onClick={cycleSpeed}
          className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
}
