export interface CoverOptions {
  kitab: string;
  speaker: string;
  number: number;
  /** Seed for a stable gradient (e.g. kitab slug). */
  seed?: string;
  size?: number;
}

// Brand gradient palettes; chosen deterministically from the seed.
const PALETTES: Array<[string, string]> = [
  ['#0F766E', '#134E4A'],
  ['#134E4A', '#0F766E'],
  ['#0F766E', '#0F172A'],
  ['#0F172A', '#134E4A'],
  ['#0F766E', '#F59E0B'],
  ['#134E4A', '#F59E0B'],
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    // Ellipsize the last line if content remains.
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      let trimmed = last;
      while (ctx.measureText(`${trimmed}…`).width > maxWidth && trimmed.length > 0) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[maxLines - 1] = `${trimmed}…`;
    }
  }
  return lines;
}

function draw(canvas: HTMLCanvasElement, opts: CoverOptions): void {
  const size = opts.size ?? 600;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const seed = opts.seed ?? opts.kitab;
  const [c1, c2] = PALETTES[hashString(seed) % PALETTES.length];

  // Background gradient.
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Decorative circles.
  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
  ctx.beginPath();
  ctx.arc(size * 0.8, size * 0.2, size * 0.27, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.beginPath();
  ctx.arc(size * 0.2, size * 0.85, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  const pad = size * 0.085;

  // Kajian number badge.
  ctx.fillStyle = '#F59E0B';
  ctx.font = `800 ${size * 0.13}px Inter, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(`#${opts.number}`, pad, pad);

  // Kitab title (wrapped, up to 3 lines).
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${size * 0.072}px Inter, sans-serif`;
  const titleLines = wrapText(ctx, opts.kitab, size - pad * 2, 3);
  const lineHeight = size * 0.085;
  let y = size * 0.42;
  for (const line of titleLines) {
    ctx.fillText(line, pad, y);
    y += lineHeight;
  }

  // Speaker.
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = `600 ${size * 0.042}px Inter, sans-serif`;
  ctx.fillText(opts.speaker, pad, size - pad - size * 0.09);

  // Brand.
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `600 ${size * 0.034}px Inter, sans-serif`;
  ctx.fillText('muslimsolo.id', pad, size - pad - size * 0.04);
}

/** Render a generated cover and return it as a PNG data URL. */
export function generateCoverDataUrl(opts: CoverOptions): string {
  const canvas = document.createElement('canvas');
  draw(canvas, opts);
  return canvas.toDataURL('image/png');
}

/** Render a generated cover and return it as a PNG Blob (for upload to R2). */
export function generateCoverBlob(opts: CoverOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    draw(canvas, opts);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Gagal membuat cover.'))),
      'image/png',
    );
  });
}

/**
 * Read an uploaded image File and return a square PNG data URL (center-cropped
 * and resized). Used for kitab cover uploads so every cover is consistent.
 */
export function imageFileToSquareDataUrl(file: File, size = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas tidak didukung.'));
        return;
      }
      // Center-crop to a square.
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal memuat gambar.'));
    };
    img.src = url;
  });
}
