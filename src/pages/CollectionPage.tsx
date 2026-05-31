import { useState } from 'react';
import { Seo } from '../components/Seo';
import { KajianGrid } from '../components/KajianGrid';
import { HeartIcon, BookmarkIcon, ClockIcon } from '../components/icons';
import { useLibraryStore } from '../store/libraryStore';
import { getKajianById } from '../lib/data';
import type { Kajian } from '../types';
import { cn } from '../lib/utils';

type Tab = 'favorites' | 'bookmarks' | 'recent';

const TABS: { key: Tab; label: string; Icon: typeof HeartIcon }[] = [
  { key: 'favorites', label: 'Favorit', Icon: HeartIcon },
  { key: 'bookmarks', label: 'Bookmark', Icon: BookmarkIcon },
  { key: 'recent', label: 'Baru Diputar', Icon: ClockIcon },
];

export function CollectionPage() {
  const [tab, setTab] = useState<Tab>('favorites');
  const favorites = useLibraryStore((s) => s.favorites);
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const recent = useLibraryStore((s) => s.recentlyPlayed);

  const ids = tab === 'favorites' ? favorites : tab === 'bookmarks' ? bookmarks : recent;
  const items = ids
    .map(getKajianById)
    .filter((k): k is Kajian => Boolean(k));

  const emptyMessages: Record<Tab, string> = {
    favorites: 'Belum ada kajian favorit. Tekan ikon hati pada kajian untuk menambahkannya.',
    bookmarks: 'Belum ada bookmark. Simpan kajian untuk dibaca atau didengar nanti.',
    recent: 'Belum ada riwayat. Mulai dengarkan kajian untuk melihat riwayat di sini.',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo title="Koleksi Saya" description="Kajian favorit, bookmark, dan riwayat dengar Anda." />

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Koleksi Saya
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Tersimpan di perangkat ini secara otomatis.
        </p>
      </header>

      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-thin">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === key
                ? 'bg-brand-primary text-white shadow dark:bg-brand-accent dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            <Icon className="h-4 w-4" filled={tab === key} />
            {label}
          </button>
        ))}
      </div>

      <KajianGrid items={items} pageSize={10} emptyMessage={emptyMessages[tab]} />
    </div>
  );
}
