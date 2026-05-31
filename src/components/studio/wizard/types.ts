import type { Category, PublishStatus } from '../../../types';

export interface WizardData {
  id?: string;
  kitabId: string;
  number: number;
  title: string;
  speaker: string;
  description: string;
  category: Category;
  /** Local file pending upload (null when editing without re-upload). */
  audioFile: File | null;
  /** Public R2 URL once uploaded. */
  audioUrl: string;
  audioKey: string;
  /** Session-only blob URL for instant preview. */
  localAudioUrl: string;
  duration: string;
  durationSeconds: number;
  transcript: string;
  /** Data URL of a generated/selected cover, or '' for auto. */
  cover: string;
  status: PublishStatus;
}

export interface StepProps {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
}
