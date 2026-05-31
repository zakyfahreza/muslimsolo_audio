import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <Seo title="Halaman Tidak Ditemukan" />
      <p className="text-7xl font-extrabold text-brand-primary dark:text-brand-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Maaf, halaman yang Anda cari tidak tersedia.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
