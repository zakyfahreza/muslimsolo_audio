import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/studio/Pagination';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '../../components/icons';
import { listKajian, listKitab, removeKajian } from '../../services/contentRepo';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { formatDate } from '../../lib/utils';
import { toast } from '../../store/toastStore';
import type { Kajian, PublishStatus } from '../../types';

export function KajianPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [kitabFilter, setKitabFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | PublishStatus>('');
  const [toDelete, setToDelete] = useState<Kajian | null>(null);
  const debounced = useDebounce(query, 250);

  const kitab = listKitab();
  const all = listKajian();

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return all.filter((k) => {
      const matchQ =
        !q ||
        k.title.toLowerCase().includes(q) ||
        k.speaker.toLowerCase().includes(q) ||
        k.book.toLowerCase().includes(q);
      const matchKitab = !kitabFilter || k.kitabId === kitabFilter;
      const matchStatus = !statusFilter || k.status === statusFilter;
      return matchQ && matchKitab && matchStatus;
    });
  }, [all, debounced, kitabFilter, statusFilter]);

  const { page, pageCount, pageItems, setPage } = usePagination(filtered, 8);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const result = await removeKajian(toDelete.id);
      toast[result.committed ? 'success' : 'info'](
        result.committed
          ? 'Kajian dihapus dari GitHub. Situs publik diperbarui dalam ~1-2 menit.'
          : 'Dihapus lokal (Mode Demo). Aktifkan Mode Live agar berlaku di situs publik.',
      );
      setToDelete(null);
      setVersion((v) => v + 1);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6" key={version}>
      <Seo title="Kelola Kajian" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Kajian</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{filtered.length} kajian</p>
        </div>
        <Link to="/studio/kajian/baru">
          <Button icon={<PlusIcon className="h-4 w-4" />}>Tambah Kajian</Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, ustadz, kitab..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 dark:border-white/10 dark:bg-slate-900"
          />
        </div>
        <Select
          value={kitabFilter}
          onChange={(e) => setKitabFilter(e.target.value)}
          className="sm:w-52"
        >
          <option value="">Semua kitab</option>
          {kitab.map((k) => (
            <option key={k.id} value={k.id}>
              {k.title}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | PublishStatus)}
          className="sm:w-36"
        >
          <option value="">Semua status</option>
          <option value="published">Publish</option>
          <option value="draft">Draft</option>
        </Select>
      </div>

      {/* List: card layout on mobile, table on >= sm screens */}
      {pageItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400 dark:border-white/15">
          Tidak ada kajian yang cocok.
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-3 sm:hidden">
            {pageItems.map((k) => (
              <li
                key={k.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-primary/10 text-xs font-bold text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
                    #{k.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-slate-900 dark:text-white">
                      {k.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {k.book} · {k.speaker}
                    </p>
                  </div>
                  <StatusBadge status={k.status} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {k.duration} · {formatDate(k.publishedAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/studio/kajian/${k.id}/edit`)}
                      aria-label="Edit"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-primary dark:hover:bg-white/10"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(k)}
                      aria-label="Hapus"
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 sm:block">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Judul</th>
                    <th className="hidden px-4 py-3 font-semibold lg:table-cell">Kitab</th>
                    <th className="px-4 py-3 font-semibold">Ustadz</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">Durasi</th>
                    <th className="hidden px-4 py-3 font-semibold lg:table-cell">Tanggal</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {pageItems.map((k) => (
                    <tr key={k.id} className="transition hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-xs font-bold text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
                            #{k.number}
                          </span>
                          <span className="line-clamp-1 font-semibold text-slate-900 dark:text-white">
                            {k.title}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 lg:table-cell">
                        {k.book}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{k.speaker}</td>
                      <td className="hidden px-4 py-3 tabular-nums text-slate-500 dark:text-slate-400 md:table-cell">
                        {k.duration}
                      </td>
                      <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 lg:table-cell">
                        {formatDate(k.publishedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/studio/kajian/${k.id}/edit`)}
                            aria-label="Edit"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-primary dark:hover:bg-white/10"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(k)}
                            aria-label="Hapus"
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Hapus kajian?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Yakin ingin menghapus <strong>{toDelete?.title}</strong>? Tindakan ini akan menghapus
          metadata kajian. File audio di R2 tidak ikut terhapus.
        </p>
      </Modal>
    </div>
  );
}
