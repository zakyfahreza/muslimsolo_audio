import type { StudioConfig } from './config';
import { getToken } from './authService';

/**
 * Direct-to-R2 upload via presigned URLs.
 *
 * Flow:
 *   1. Ask the Cloudflare Worker for a presigned PUT URL (the Worker holds the
 *      R2 credentials; the browser never sees them).
 *   2. PUT the file straight to R2 from the browser (handles large files and
 *      keeps traffic off the Worker).
 *
 * In mock mode the upload is simulated locally with an object URL so the whole
 * studio is usable before any Cloudflare setup exists.
 */

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface UploadResult {
  publicUrl: string;
  key: string;
}

export type ProgressFn = (percent: number) => void;

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build the object key for an upload, e.g. "audio/ad-durar/01.mp3". */
export function buildKey(folder: string, filename: string): string {
  return `audio/${sanitizeName(folder)}/${sanitizeName(filename)}`;
}

export function buildCoverKey(folder: string, filename: string): string {
  return `covers/${sanitizeName(folder)}/${sanitizeName(filename)}`;
}

async function requestPresign(
  config: StudioConfig,
  key: string,
  contentType: string,
): Promise<PresignResult> {
  const workerUrl = config.workerUrl.replace(/\/$/, '');
  if (!/^https?:\/\//i.test(workerUrl)) {
    throw new Error('URL Worker belum diisi dengan benar di Pengaturan (harus diawali https://).');
  }

  let res: Response;
  try {
    res = await fetch(`${workerUrl}/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ key, contentType }),
    });
  } catch {
    throw new Error('Tidak dapat menghubungi Worker (jaringan/CORS). Periksa URL Worker & koneksi.');
  }

  if (res.status === 405 || res.status === 404) {
    throw new Error(
      'URL Worker tidak valid (405/404). Pastikan Cloudflare Worker sudah di-deploy dan URL-nya benar (bukan URL situs/GitHub Pages).',
    );
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      'Worker menolak permintaan (izin). Pastikan login GitHub dengan token yang berhak menulis ke repo.',
    );
  }
  if (!res.ok) {
    throw new Error(`Gagal meminta izin upload (${res.status}).`);
  }

  // A valid worker returns JSON. HTML usually means the URL points elsewhere.
  const ctype = res.headers.get('content-type') ?? '';
  if (!ctype.includes('application/json')) {
    throw new Error(
      'Respons Worker tidak sesuai. URL Worker mungkin salah (mengarah ke situs, bukan Worker).',
    );
  }
  return (await res.json()) as PresignResult;
}

function putWithProgress(url: string, file: Blob, onProgress?: ProgressFn): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload gagal (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error('Kesalahan jaringan saat upload.'));
    xhr.send(file);
  });
}

/** Simulate an upload locally (mock mode). */
function mockUpload(
  config: StudioConfig,
  key: string,
  _file: Blob,
  onProgress?: ProgressFn,
): Promise<UploadResult> {
  return new Promise((resolve) => {
    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(100, pct + 20);
      onProgress?.(pct);
      if (pct >= 100) {
        clearInterval(tick);
        resolve({
          publicUrl: `${config.audioPublicBase.replace(/\/$/, '')}/${key}`,
          key,
        });
      }
    }, 180);
  });
}

/** Upload a file to R2, returning its public URL and object key. */
export async function uploadFile(
  config: StudioConfig,
  key: string,
  file: Blob,
  onProgress?: ProgressFn,
): Promise<UploadResult> {
  if (config.mockMode || !config.workerUrl) {
    return mockUpload(config, key, file, onProgress);
  }
  const contentType = file.type || 'application/octet-stream';
  const { uploadUrl, publicUrl, key: confirmedKey } = await requestPresign(config, key, contentType);
  await putWithProgress(uploadUrl, file, onProgress);
  return { publicUrl, key: confirmedKey };
}

/**
 * Verify the Worker is reachable and authorized; used by the Settings
 * "Test Koneksi" button. Requests a presign for a throwaway key but does not
 * actually upload anything.
 */
export async function testWorker(config: StudioConfig): Promise<void> {
  if (config.mockMode) {
    throw new Error('Mode masih Demo. Pilih Mode Live dahulu untuk menguji Worker.');
  }
  await requestPresign(config, 'audio/_healthcheck/ping.txt', 'text/plain');
}
