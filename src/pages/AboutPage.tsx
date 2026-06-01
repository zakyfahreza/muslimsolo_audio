import { Seo } from '../components/Seo';
import { PlayIcon, BookIcon, UserIcon, DownloadIcon } from '../components/icons';

const FEATURES = [
  { Icon: PlayIcon, title: 'Streaming Tanpa Batas', desc: 'Dengarkan kajian kapan saja dengan pemutar yang tetap berjalan saat berpindah halaman.' },
  { Icon: BookIcon, title: 'Telusuri per Kitab', desc: 'Ikuti kajian secara berurutan berdasarkan kitab yang sedang dibahas.' },
  { Icon: UserIcon, title: 'Telusuri per Ustadz', desc: 'Temukan seluruh kajian dari ustadz pilihan Anda dalam satu halaman.' },
  { Icon: DownloadIcon, title: 'Transkrip & PDF', desc: 'Baca transkrip kajian dan unduh sebagai PDF untuk dibaca kapan saja.' },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Seo
        title="Tentang"
        description="Muslimsolo Audio adalah platform streaming kajian Islam tanpa iklan, dibuat untuk memudahkan menuntut ilmu."
      />

      <div className="text-center">
        <span className="chip bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
          Tentang Kami
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Muslimsolo Audio
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
          Platform streaming kajian Islam kota Solo dengan pengalaman seperti aplikasi musik favorit
          Anda, namun khusus untuk koleksi kajian Islam dari berbagai kitab dan ustadz.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ Icon, title, desc }) => (
          <div key={title} className="card p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
