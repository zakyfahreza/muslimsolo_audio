import { Input, Textarea, Select } from '../../ui/Field';
import { CATEGORIES, type Category } from '../../../types';
import { listKajianByKitab, getKitab } from '../../../services/contentRepo';
import { youtubeEmbedUrl } from '../../../lib/utils';
import type { StepProps } from './types';

export function Step2Info({ data, update }: StepProps) {
  const kitab = getKitab(data.kitabId);

  const ytEmbed = data.youtubeUrl.trim() ? youtubeEmbedUrl(data.youtubeUrl) : null;
  const ytInvalid = Boolean(data.youtubeUrl.trim()) && !ytEmbed;

  // Suggest a default title based on kitab + number when empty.
  const suggestTitle = () => {
    if (!kitab) return;
    update({ title: `${kitab.title} #${data.number}` });
  };

  // Suggest speaker from the most common speaker already in the kitab.
  const suggestSpeaker = () => {
    const existing = listKajianByKitab(data.kitabId);
    if (existing.length > 0) update({ speaker: existing[existing.length - 1].speaker });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informasi Kajian</h2>

      <div>
        <Input
          label="Judul"
          value={data.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder={kitab ? `${kitab.title} #${data.number}` : 'Judul kajian'}
        />
        {!data.title && kitab && (
          <button
            type="button"
            onClick={suggestTitle}
            className="mt-1.5 text-xs font-semibold text-brand-primary hover:underline dark:text-brand-accent"
          >
            Gunakan judul otomatis
          </button>
        )}
      </div>

      <div>
        <Input
          label="Nama Ustadz"
          value={data.speaker}
          onChange={(e) => update({ speaker: e.target.value })}
          placeholder="mis. Ustadz Fulan"
        />
        {!data.speaker && listKajianByKitab(data.kitabId).length > 0 && (
          <button
            type="button"
            onClick={suggestSpeaker}
            className="mt-1.5 text-xs font-semibold text-brand-primary hover:underline dark:text-brand-accent"
          >
            Pakai ustadz dari kajian sebelumnya
          </button>
        )}
      </div>

      <Select
        label="Kategori"
        value={data.category}
        onChange={(e) => update({ category: e.target.value as Category })}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <Textarea
        label="Deskripsi"
        rows={4}
        value={data.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Ringkasan singkat isi kajian"
      />

      <div>
        <Input
          label="Link YouTube (opsional)"
          value={data.youtubeUrl}
          onChange={(e) => update({ youtubeUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Tempel link video YouTube agar tampil sebagai video tersemat di halaman kajian. Kosongkan
          bila tidak ada.
        </p>
        {ytInvalid && (
          <p className="mt-1 text-xs font-medium text-rose-500">
            Link YouTube tidak dikenali. Gunakan format watch?v=, youtu.be/, atau embed/.
          </p>
        )}
        {ytEmbed && (
          <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            <iframe
              src={ytEmbed}
              title="Pratinjau YouTube"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}
