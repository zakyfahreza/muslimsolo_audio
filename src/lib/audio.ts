import { formatTime } from './utils';

export interface AudioMeta {
  /** Duration in seconds. */
  seconds: number;
  /** Formatted "M:SS" / "H:MM:SS". */
  duration: string;
}

/**
 * Read audio metadata (duration) directly in the browser using the HTML5
 * Audio element. Works on a local File (object URL) or a remote URL.
 */
export function readAudioMeta(source: File | string): Promise<AudioMeta> {
  return new Promise((resolve, reject) => {
    const isFile = source instanceof File;
    const url = isFile ? URL.createObjectURL(source) : source;
    const audio = document.createElement('audio');
    audio.preload = 'metadata';

    const cleanup = () => {
      if (isFile) URL.revokeObjectURL(url);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      const seconds = Number.isFinite(audio.duration) ? audio.duration : 0;
      cleanup();
      resolve({ seconds, duration: formatTime(seconds) });
    };
    const onError = () => {
      cleanup();
      reject(new Error('Gagal membaca metadata audio.'));
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.src = url;
  });
}

/** Validate that a file looks like a playable audio file. */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/') || /\.(mp3|m4a|aac|ogg|wav|flac)$/i.test(file.name);
}

/**
 * Extract a leading sequence number from a filename, e.g. "01.mp3" -> 1,
 * "kajian-12.mp3" -> 12. Returns null when none is found. Used to order
 * bulk-uploaded files into kajian numbers.
 */
export function extractFileNumber(filename: string): number | null {
  const match = filename.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
