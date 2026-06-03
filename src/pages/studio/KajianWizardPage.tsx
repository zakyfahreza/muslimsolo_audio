import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Stepper } from '../../components/studio/Stepper';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '../../components/icons';
import { Step1Kitab } from '../../components/studio/wizard/Step1Kitab';
import { Step2Info } from '../../components/studio/wizard/Step2Info';
import { Step3Audio } from '../../components/studio/wizard/Step3Audio';
import { Step4Transcript } from '../../components/studio/wizard/Step4Transcript';
import { Step5Preview } from '../../components/studio/wizard/Step5Preview';
import type { WizardData } from '../../components/studio/wizard/types';
import {
  getKajian,
  getKitab,
  saveKajian,
  newKajianId,
  nextNumber,
} from '../../services/contentRepo';
import { generateCoverDataUrl } from '../../lib/cover';
import { toast } from '../../store/toastStore';
import type { Kajian } from '../../types';

const STEPS = ['Kitab', 'Informasi', 'Audio', 'Transkrip', 'Preview'];

function emptyData(kitabId = ''): WizardData {
  return {
    kitabId,
    number: kitabId ? nextNumber(kitabId) : 1,
    title: '',
    speaker: '',
    description: '',
    category: 'Aqidah',
    audioFile: null,
    audioUrl: '',
    audioKey: '',
    localAudioUrl: '',
    duration: '',
    durationSeconds: 0,
    transcript: '',
    youtubeUrl: '',
    cover: '',
    status: 'published',
  };
}

function fromKajian(k: Kajian): WizardData {
  return {
    id: k.id,
    kitabId: k.kitabId,
    number: k.number,
    title: k.title,
    speaker: k.speaker,
    description: k.description,
    category: k.category,
    audioFile: null,
    audioUrl: k.audioUrl,
    audioKey: k.audioKey,
    localAudioUrl: '',
    duration: k.duration,
    durationSeconds: 0,
    transcript: k.transcript,
    youtubeUrl: k.youtubeUrl ?? '',
    cover: k.cover && !k.cover.startsWith('/images') ? k.cover : '',
    status: k.status,
  };
}

export function KajianWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const presetKitab = searchParams.get('kitab') ?? '';

  const existing = id ? getKajian(id) : undefined;
  const isEdit = Boolean(existing);

  const [data, setData] = useState<WizardData>(
    existing ? fromKajian(existing) : emptyData(presetKitab),
  );
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(isEdit ? STEPS.length - 1 : 0);
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<WizardData>) => setData((d) => ({ ...d, ...patch }));

  // Per-step validation gates.
  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(data.kitabId);
      case 1:
        return Boolean(data.title.trim() && data.speaker.trim());
      case 2:
        return Boolean(data.audioUrl || data.localAudioUrl);
      default:
        return true;
    }
  }, [step, data]);

  const goTo = (next: number) => {
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
  };

  const next = () => {
    if (!canAdvance) {
      toast.error('Lengkapi langkah ini terlebih dahulu.');
      return;
    }
    goTo(Math.min(step + 1, STEPS.length - 1));
  };
  const prev = () => goTo(Math.max(step - 1, 0));

  const publish = async () => {
    const kitab = getKitab(data.kitabId);
    if (!kitab) {
      toast.error('Pilih kitab terlebih dahulu.');
      return;
    }
    if (!data.audioUrl && !data.localAudioUrl) {
      toast.error('Audio belum diupload.');
      return;
    }
    setSaving(true);
    try {
      const kajianId = data.id ?? newKajianId(kitab.slug, data.number);
      // Cover priority: explicit kajian cover > kitab cover > auto-generated.
      const cover =
        data.cover ||
        kitab.cover ||
        generateCoverDataUrl({
          kitab: kitab.title,
          speaker: data.speaker || 'Ustadz',
          number: data.number,
          seed: kitab.coverSeed || kitab.slug,
        });

      const record: Kajian = {
        id: kajianId,
        kitabId: kitab.id,
        number: data.number,
        title: data.title.trim(),
        speaker: data.speaker.trim(),
        book: kitab.title,
        category: data.category,
        description: data.description.trim(),
        cover,
        audioUrl: data.audioUrl,
        audioKey: data.audioKey,
        youtubeUrl: data.youtubeUrl.trim() || undefined,
        duration: data.duration || '0:00',
        // Full ISO timestamp so kajian created on the same day still sort
        // correctly (date-only values tied and made "terbaru" ambiguous).
        publishedAt: existing?.publishedAt ?? new Date().toISOString(),
        transcript: data.transcript.trim(),
        status: data.status,
      };

      const result = await saveKajian(record);
      if (result.committed) {
        toast.success(
          isEdit
            ? 'Kajian diperbarui & dikirim ke GitHub. Situs publik diperbarui dalam ~1-2 menit.'
            : 'Kajian dipublish ke GitHub. Situs publik diperbarui dalam ~1-2 menit.',
        );
      } else {
        toast.info('Tersimpan lokal (Mode Demo). Aktifkan Mode Live di Pengaturan agar tampil di situs publik.');
      }
      navigate('/studio/kajian');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Seo title={isEdit ? 'Edit Kajian' : 'Tambah Kajian'} />

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {isEdit ? 'Edit Kajian' : 'Tambah Kajian'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isEdit
            ? 'Perbarui informasi, audio, atau transkrip kajian.'
            : 'Ikuti langkah-langkah untuk menambah kajian baru.'}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <Stepper steps={STEPS} current={step} onStepClick={goTo} maxReachable={maxReached} />

        <div className="mt-7 min-h-[320px]">
          {step === 0 && <Step1Kitab data={data} update={update} />}
          {step === 1 && <Step2Info data={data} update={update} />}
          {step === 2 && <Step3Audio data={data} update={update} />}
          {step === 3 && <Step4Transcript data={data} update={update} />}
          {step === 4 && <Step5Preview data={data} update={update} />}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/5">
          <Button
            variant="ghost"
            onClick={prev}
            disabled={step === 0}
            icon={<ChevronLeftIcon className="h-4 w-4" />}
          >
            Kembali
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!canAdvance}>
              Lanjut
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={publish} disabled={saving} icon={!saving && <CheckIcon className="h-4 w-4" />}>
              {saving && <Spinner />}
              {data.status === 'draft' ? 'Simpan Draft' : isEdit ? 'Simpan Perubahan' : 'Publish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
