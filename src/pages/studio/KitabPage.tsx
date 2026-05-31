import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Field';
import { BookIcon, PlusIcon, ClockIcon, EditIcon, ChevronRightIcon } from '../../components/icons';
import { CoverPicker } from '../../components/studio/CoverPicker';
import { CATEGORIES, type Category, type Kitab } from '../../types';
import { listKitab, listKajianByKitab, saveKitab, makeKitabId } from '../../services/contentRepo';
import { durationToSeconds, formatTime, slugify } from '../../lib/utils';
import { toast } from '../../store/toastStore';

const todayIso = () => new Date().toISOString().slice(0, 10);

function emptyKitab(): Kitab {
  return {
    id: '',
    title: '',
    slug: '',
    description: '',
    category: 'Aqidah',
    cover: '',
    coverSeed: '',
    createdAt: todayIso(),
    updatedAt: todayIso(),
  };
}

export function KitabPage() {
  const [version, setVersion] = useState(0); // re-read after mutations
  const [editing, setEditing] = useState<Kitab | null>(null);
  const [saving, setSaving] = useState(false);

  const kitab = listKitab();

  const openNew = () => setEditing(emptyKitab());

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error('Nama kitab wajib diisi.');
      return;
    }
    setSaving(true);
    const slug = editing.slug || slugify(editing.title);
    const record: Kitab = {
      ...editing,
      slug,
      id: editing.id || makeKitabId(editing.title),
      coverSeed: editing.coverSeed || slug,
      updatedAt: todayIso(),
    };
    try {
      await saveKitab(record);
      toast.success('Kitab disimpan.');
      setEditing(null);
      setVersion((v) => v + 1);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" key={version}>
      <Seo title="Kelola Kitab" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Kitab</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {kitab.length} kitab. Setiap kitab memiliki daftar kajiannya sendiri.
          </p>
        </div>
        <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openNew}>
          Tambah Kitab
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kitab.map((k) => {
          const kajian = listKajianByKitab(k.id);
          const total = kajian.reduce((acc, x) => acc + durationToSeconds(x.duration), 0);
          return (
            <div
              key={k.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-slate-900"
            >
              <div className="relative bg-gradient-to-br from-brand-primary to-brand-secondary p-5 text-white">
                {k.cover ? (
                  <>
                    <img
                      src={k.cover}
                      alt={k.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                  </>
                ) : null}
                <div className="relative">
                  <BookIcon className="h-6 w-6 text-brand-accent" />
                  <h3 className="mt-3 line-clamp-2 text-base font-extrabold leading-tight drop-shadow">
                    {k.title}
                  </h3>
                </div>
                <button
                  onClick={() => setEditing(k)}
                  aria-label="Edit kitab"
                  className="absolute right-3 top-3 z-10 rounded-lg bg-white/15 p-1.5 opacity-0 transition group-hover:opacity-100 hover:bg-white/25"
                >
                  <EditIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
                <span>{kajian.length} kajian</span>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {formatTime(total)}
                </span>
              </div>
              <Link
                to={`/studio/kitab/${k.id}`}
                className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm font-semibold text-brand-primary transition hover:bg-slate-50 dark:border-white/5 dark:text-brand-accent dark:hover:bg-white/5"
              >
                Lihat kajian
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Kitab' : 'Tambah Kitab'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving}>
              Simpan
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Input
              label="Nama Kitab"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="mis. Kitabul Jami'"
              autoFocus
            />
            <CoverPicker
              value={editing.cover ?? ''}
              onChange={(cover) => setEditing({ ...editing, cover })}
              previewSeed={editing.coverSeed || slugify(editing.title)}
              previewTitle={editing.title}
            />
            <Select
              label="Kategori default"
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Textarea
              label="Deskripsi"
              rows={3}
              value={editing.description ?? ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Deskripsi singkat kitab"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
