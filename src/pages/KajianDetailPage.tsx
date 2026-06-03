import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { SeekBar } from '../components/SeekBar';
import { SpeedControl } from '../components/SpeedControl';
import { ShareButtons } from '../components/ShareButtons';
import { Transcript } from '../components/Transcript';
import { YouTubeEmbed } from '../components/YouTubeEmbed';
import { KajianGrid } from '../components/KajianGrid';
import { SectionHeader } from '../components/SectionHeader';
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PrevIcon,
  HeartIcon,
  BookmarkIcon,
  BookIcon,
  UserIcon,
  ClockIcon,
} from '../components/icons';
import { getKajianById, ALL_KAJIAN } from '../lib/data';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatDate, slugify, cn } from '../lib/utils';
import { asset } from '../lib/assets';

export function KajianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const kajian = id ? getKajianById(id) : undefined;

  const playKajian = usePlayerStore((s) => s.playKajian);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const currentId = usePlayerStore((s) => s.current()?.id);

  const isFavorite = useLibraryStore((s) => (kajian ? s.favorites.includes(kajian.id) : false));
  const isBookmarked = useLibraryStore((s) => (kajian ? s.bookmarks.includes(kajian.id) : false));
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const toggleBookmark = useLibraryStore((s) => s.toggleBookmark);

  if (!kajian) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kajian tidak ditemukan</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Kajian yang Anda cari mungkin telah dipindahkan atau dihapus.
        </p>
        <Link to="/kajian" className="btn-primary mt-6">
          Lihat Semua Kajian
        </Link>
      </div>
    );
  }

  const isActive = currentId === kajian.id;
  const isThisPlaying = isActive && isPlaying;

  // Related: same book first, then same speaker, excluding current.
  const related = ALL_KAJIAN.filter(
    (k) => k.id !== kajian.id && (k.book === kajian.book || k.speaker === kajian.speaker),
  ).slice(0, 5);

  const queue = ALL_KAJIAN.filter((k) => k.book === kajian.book);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: kajian.title,
    description: kajian.description,
    contentUrl: kajian.audioUrl,
    uploadDate: kajian.publishedAt,
    duration: kajian.duration,
    creator: { '@type': 'Person', name: kajian.speaker },
    genre: kajian.category,
  };

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playKajian(kajian, queue.length > 1 ? queue : ALL_KAJIAN);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Seo
        title={kajian.title}
        description={kajian.description}
        image={asset(kajian.cover)}
        jsonLd={jsonLd}
      />

      {/* Header */}
      <div>
        <div className="flex flex-col">
          <span className="chip w-fit bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
            {kajian.category}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl">
            {kajian.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
            <Link
              to={`/ustadz/${slugify(kajian.speaker)}`}
              className="inline-flex items-center gap-1.5 hover:text-brand-primary dark:hover:text-brand-accent"
            >
              <UserIcon className="h-4 w-4" />
              {kajian.speaker}
            </Link>
            <Link
              to={`/kitab/${slugify(kajian.book)}`}
              className="inline-flex items-center gap-1.5 hover:text-brand-primary dark:hover:text-brand-accent"
            >
              <BookIcon className="h-4 w-4" />
              {kajian.book}
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              {kajian.duration}
            </span>
          </div>

          <p className="mt-4 text-slate-600 dark:text-slate-300">{kajian.description}</p>
          <p className="mt-2 text-xs text-slate-400">Dipublikasikan {formatDate(kajian.publishedAt)}</p>

          {/* Action buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => toggleFavorite(kajian.id)}
              aria-label="Favorit"
              className={cn(
                'rounded-full border p-3 transition',
                isFavorite
                  ? 'border-rose-300 bg-rose-50 text-rose-500 dark:border-rose-500/30 dark:bg-rose-500/10'
                  : 'border-slate-200 text-slate-500 hover:border-rose-300 dark:border-white/10 dark:text-slate-300',
              )}
            >
              <HeartIcon className="h-5 w-5" filled={isFavorite} />
            </button>
            <button
              onClick={() => toggleBookmark(kajian.id)}
              aria-label="Bookmark"
              className={cn(
                'rounded-full border p-3 transition',
                isBookmarked
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary dark:border-brand-accent/40 dark:text-brand-accent'
                  : 'border-slate-200 text-slate-500 hover:border-brand-primary dark:border-white/10 dark:text-slate-300',
              )}
            >
              <BookmarkIcon className="h-5 w-5" filled={isBookmarked} />
            </button>
          </div>
        </div>
      </div>

      {/* YouTube video (when provided) */}
      {kajian.youtubeUrl && (
        <div className="mt-8">
          <YouTubeEmbed url={kajian.youtubeUrl} title={kajian.title} />
        </div>
      )}

      {/* Inline audio player */}
      <section className="card mt-8 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={previous}
            aria-label="Sebelumnya"
            className="text-slate-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-accent"
          >
            <PrevIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handlePlay}
            aria-label={isThisPlaying ? 'Jeda' : 'Putar'}
            className="grid h-14 w-14 place-items-center rounded-full bg-brand-primary text-white shadow-lg transition hover:scale-105 dark:bg-brand-accent dark:text-slate-900"
          >
            {isThisPlaying ? <PauseIcon className="h-7 w-7" /> : <PlayIcon className="h-7 w-7" />}
          </button>
          <button
            onClick={next}
            aria-label="Berikutnya"
            className="text-slate-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-accent"
          >
            <NextIcon className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <SeekBar showTime />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Kecepatan Pemutaran
          </span>
          <SpeedControl />
        </div>
        {isActive && (
          <p className="mt-3 text-xs text-slate-400">
            Audio tetap berjalan saat Anda berpindah halaman.
          </p>
        )}
      </section>

      {/* Share */}
      <div className="mt-6">
        <ShareButtons title={kajian.title} />
      </div>

      {/* Transcript */}
      <div className="mt-8">
        <Transcript text={kajian.transcript} title={kajian.title} speaker={kajian.speaker} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <SectionHeader title="Kajian Terkait" subtitle="Dari kitab atau ustadz yang sama" />
          <KajianGrid items={related} pageSize={5} />
        </div>
      )}
    </div>
  );
}
