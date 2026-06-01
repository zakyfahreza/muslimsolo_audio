import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { StatsSection } from '../components/StatsSection';
import { SectionHeader } from '../components/SectionHeader';
import { KajianGrid } from '../components/KajianGrid';
import { Cover } from '../components/Cover';
import { Equalizer } from '../components/Equalizer';
import { SeekBar } from '../components/SeekBar';
import { SpeedControl } from '../components/SpeedControl';
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PrevIcon,
  BookIcon,
  ClockIcon,
  ChevronRightIcon,
} from '../components/icons';
import { ALL_KAJIAN, getKitabStats } from '../lib/data';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getKajianById } from '../lib/data';
import { formatTime } from '../lib/utils';

function HeroPlayerCard() {
  // ALL_KAJIAN is sorted newest-first, so index 0 is the latest kajian.
  const featured = ALL_KAJIAN[0];
  const playKajian = usePlayerStore((s) => s.playKajian);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentId = usePlayerStore((s) => s.current()?.id);

  if (!featured) {
    return (
      <div className="relative mx-auto w-full max-w-sm">
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/30 to-brand-accent/20 blur-2xl" />
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
            <PlayIcon className="h-6 w-6" />
          </span>
          <p className="font-semibold text-slate-700 dark:text-slate-200">Belum ada kajian</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Telusuri kitab untuk mulai mendengarkan.
          </p>
          <Link to="/kitab" className="btn-primary mt-2">
            <BookIcon className="h-5 w-5" />
            Lihat Kitab
          </Link>
        </div>
      </div>
    );
  }

  const isActive = currentId === featured.id;
  const isThisPlaying = isActive && isPlaying;

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playKajian(featured, ALL_KAJIAN);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-primary/30 to-brand-accent/20 blur-2xl" />
      <div className="card overflow-hidden p-4 sm:p-5">
        <Link to={`/kajian/${featured.id}`} className="block">
          <div className="relative overflow-hidden rounded-2xl">
            <Cover
              src={featured.cover}
              alt={featured.title}
              fallbackText={featured.book}
              fallbackBadge={featured.number ? `#${featured.number}` : undefined}
              className="aspect-square w-full"
            />
            {isActive && (
              <span className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-brand-accent backdrop-blur">
                <Equalizer />
              </span>
            )}
          </div>
        </Link>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary dark:text-brand-accent">
            Terbaru
          </p>
          <Link to={`/kajian/${featured.id}`}>
            <h3 className="mt-1 line-clamp-2 text-lg font-bold text-slate-900 hover:text-brand-primary dark:text-white dark:hover:text-brand-accent">
              {featured.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">{featured.speaker}</p>
        </div>

        {/* Seek bar — live when this track is active, otherwise a hint. */}
        <div className="mt-4">
          {isActive ? (
            <SeekBar showTime />
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-10 text-right text-xs tabular-nums text-slate-400">0:00</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" />
              <span className="w-10 text-xs tabular-nums text-slate-400">{featured.duration}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-5">
          <button
            onClick={previous}
            aria-label="Sebelumnya"
            className="text-slate-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-accent"
          >
            <PrevIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handlePlay}
            className="grid h-14 w-14 place-items-center rounded-full bg-brand-primary text-white shadow-lg transition hover:scale-105 dark:bg-brand-accent dark:text-slate-900"
            aria-label={isThisPlaying ? 'Jeda' : 'Putar'}
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
        </div>

        {/* Speed (only meaningful while active) */}
        {isActive && (
          <div className="mt-4 flex justify-center">
            <SpeedControl />
          </div>
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const books = getKitabStats();
  const recentIds = useLibraryStore((s) => s.recentlyPlayed);
  const progress = useLibraryStore((s) => s.progress);

  const recent = recentIds
    .map((id) => getKajianById(id))
    .filter((k): k is NonNullable<typeof k> => Boolean(k))
    .slice(0, 5);

  const continueListening = recentIds
    .map((id) => ({ kajian: getKajianById(id), p: progress[id] }))
    .filter((x) => x.kajian && x.p && x.p.duration > 0 && x.p.position > 5 && x.p.position < x.p.duration - 10)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Muslimsolo Audio',
    description: 'Streaming kajian Islam kota Solo dari berbagai kitab dan ustadz.',
  };

  return (
    <div>
      <Seo jsonLd={jsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-primary/10 to-transparent dark:from-brand-primary/5" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-in">
            <span className="chip bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
              🎧 Platform Kajian Audio
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl">
              Dengarkan Kajian Islam{' '}
              <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                Kapan Saja
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600 dark:text-slate-300">
              Kajian Islam dari berbagai kitab dan ustadz. Streaming, baca transkrip, dan simpan
              favorit Anda.
            </p>
            <div className="mt-8">
              <Link to="/kajian" className="btn-accent w-full justify-center sm:w-auto sm:min-w-[210px]">
                <PlayIcon className="h-5 w-5" />
                Lihat Kajian Terbaru
              </Link>
            </div>
          </div>
          <HeroPlayerCard />
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 pb-10 sm:px-6">
        {/* Stats */}
        <section>
          <StatsSection />
        </section>

        {/* Continue listening */}
        {continueListening.length > 0 && (
          <section>
            <SectionHeader title="Lanjutkan Mendengar" subtitle="Sambung dari tempat Anda berhenti" />
            <div className="grid gap-3 sm:grid-cols-2">
              {continueListening.map(({ kajian, p }) => {
                if (!kajian || !p) return null;
                const pct = Math.round((p.position / p.duration) * 100);
                return (
                  <Link
                    key={kajian.id}
                    to={`/kajian/${kajian.id}`}
                    className="card flex items-center gap-4 p-3 hover:shadow-md"
                  >
                    <Cover
                      src={kajian.cover}
                      alt={kajian.title}
                      fallbackText={kajian.book}
                      fallbackBadge={kajian.number ? `#${kajian.number}` : undefined}
                      className="h-16 w-16 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">
                        {kajian.title}
                      </p>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {kajian.speaker}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-brand-primary dark:bg-brand-accent"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] tabular-nums text-slate-400">
                          {formatTime(p.position)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recently played */}
        {recent.length > 0 && (
          <section>
            <SectionHeader title="Baru Diputar" subtitle="Riwayat dengar terbaru Anda" />
            <KajianGrid items={recent} pageSize={5} />
          </section>
        )}

        {/* Daftar Kitab — klik untuk membuka playlist kajian kitab */}
        <section>
          <SectionHeader
            title="Daftar Kitab"
            subtitle="Pilih kitab untuk membuka playlist kajiannya"
            actionLabel="Lihat semua"
            actionTo="/kitab"
          />
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {books.map((book) => (
                <li key={book.slug}>
                  <Link
                    to={`/kitab/${book.slug}`}
                    className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50 dark:hover:bg-white/5 sm:px-5"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow">
                      <BookIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900 hover:text-brand-primary dark:text-white dark:hover:text-brand-accent">
                        {book.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{book.kajianCount} kajian</span>
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {formatTime(book.totalSeconds)}
                        </span>
                      </p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />
                  </Link>
                </li>
              ))}
              {books.length === 0 && (
                <li className="px-5 py-10 text-center text-sm text-slate-400">
                  Belum ada kitab.
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
