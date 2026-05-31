import { useEffect, useRef, useState } from 'react';
import type { Kajian } from '../types';
import { KajianCard } from './KajianCard';

interface KajianGridProps {
  items: Kajian[];
  /** Number of items revealed per "page" for infinite scroll. */
  pageSize?: number;
  emptyMessage?: string;
}

/** Responsive grid of kajian cards with infinite scroll. */
export function KajianGrid({ items, pageSize = 10, emptyMessage }: KajianGridProps) {
  const [visible, setVisible] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when the underlying list changes (e.g. new filter).
  useEffect(() => {
    setVisible(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + pageSize, items.length));
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length, pageSize]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {emptyMessage ?? 'Tidak ada kajian ditemukan.'}
      </div>
    );
  }

  const shown = items.slice(0, visible);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((k) => (
          <div key={k.id} className="animate-fade-in">
            <KajianCard kajian={k} queue={items} />
          </div>
        ))}
      </div>
      {visible < items.length && <div ref={sentinelRef} className="h-10" />}
    </>
  );
}
