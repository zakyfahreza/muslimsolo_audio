import { useRef, useState } from 'react';
import { imageFileToSquareDataUrl, generateCoverDataUrl } from '../../lib/cover';
import { BookIcon, UploadIcon, TrashIcon } from '../icons';
import { Spinner } from '../ui/Spinner';
import { toast } from '../../store/toastStore';

interface CoverPickerProps {
  /** Current cover value (data URL or image URL), or empty. */
  value: string;
  onChange: (dataUrl: string) => void;
  /** Used to render a live "auto" preview when no cover is set. */
  previewSeed: string;
  previewTitle: string;
}

/**
 * Square cover picker for a kitab. Upload an image (auto center-cropped to a
 * square) or leave empty to use the auto-generated gradient cover.
 */
export function CoverPicker({ value, onChange, previewSeed, previewTitle }: CoverPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const autoPreview = generateCoverDataUrl({
    kitab: previewTitle || 'Kitab',
    speaker: 'Muslimsolo Audio',
    number: 0,
    seed: previewSeed || previewTitle || 'kitab',
  });

  const pick = () => inputRef.current?.click();

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Pilih berkas gambar (JPG/PNG).');
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await imageFileToSquareDataUrl(file);
      onChange(dataUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const shown = value || autoPreview;

  return (
    <div>
      <p className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        Cover Kitab
        <span className="ml-1 font-normal text-slate-400">
          — dipakai otomatis oleh setiap kajian
        </span>
      </p>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl shadow ring-1 ring-slate-200 dark:ring-white/10">
          <img src={shown} alt="Pratinjau cover" className="h-full w-full object-cover" />
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-black/40 text-white">
              <Spinner className="h-5 w-5" />
            </span>
          )}
          {!value && (
            <span className="absolute bottom-0 inset-x-0 bg-black/40 py-0.5 text-center text-[9px] font-semibold text-white">
              otomatis
            </span>
          )}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={pick}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <UploadIcon className="h-4 w-4" />
            {value ? 'Ganti cover' : 'Unggah cover'}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Hapus, pakai otomatis
            </button>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <BookIcon className="h-3.5 w-3.5" />
              Tanpa unggahan, cover dibuat otomatis.
            </p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
