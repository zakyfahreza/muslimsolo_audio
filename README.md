# MuslimSolo Audio

Website streaming kajian Islam modern bergaya SoundCloud / Spotify, lengkap dengan **MuslimSolo Studio** — dashboard admin khusus pengelolaan audio kajian ala Spotify Creator / YouTube Studio. Dibangun sebagai aplikasi statis tanpa backend server tradisional.

## Tech Stack

- **Vite** + **React** + **TypeScript** (strict mode)
- **Tailwind CSS** (dark mode `class` strategy)
- **React Router** untuk routing (publik `/` + studio `/studio`)
- **Zustand** untuk state management (audio, koleksi, auth, upload, toast)
- **Cloudflare R2** sebagai storage audio (upload langsung via presigned URL)
- **Cloudflare Worker** (edge) untuk menandatangani presigned URL — bukan backend tradisional
- **GitHub Contents API** untuk menyimpan metadata JSON (tanpa database)
- **GitHub Pages** untuk deploy statis
- **PWA** (offline cache, installable)

Semua data disimpan sebagai file JSON: kitab di `src/content/kitab/`, kajian di `src/content/kajian/`. Studio menulis file ini via GitHub API; situs publik membacanya saat build.

## Menjalankan secara lokal

```bash
npm install
npm run dev      # http://localhost:5173/muslimsolo_audio/
npm run build    # output ke ./dist
npm run preview  # uji hasil build
```

Studio: buka `/studio`. Secara default berjalan dalam **Mode Demo** (tanpa setup) — login dengan sandi bebas, perubahan tersimpan di browser. Untuk **Mode Live** (R2 + GitHub) lihat `docs/DEPLOYMENT.md`.

## Fitur Situs Publik

- 🎧 Floating audio player ala Spotify — audio tetap berjalan saat pindah halaman
- ▶️ Player detail dengan Play/Pause/Seek dan kecepatan 0.5x–2x
- 🔎 Pencarian realtime (debounce) judul / ustadz / kitab
- 🏷️ Filter multi-select kategori (Aqidah, Fiqih, Hadits, Tafsir, Akhlak)
- 📚 Telusuri per Kitab dan per Ustadz
- 📝 Transkrip + unduh PDF, 🔗 Share, 🌙 Dark mode
- ⭐ Favorit, Bookmark, Baru Diputar, Lanjutkan Mendengar
- 📱 Mobile-first, skeleton loading, infinite scroll, PWA, SEO + JSON-LD

## Fitur MuslimSolo Studio (Admin)

- 🧭 Layout modern: sidebar + topbar + breadcrumb (responsive desktop & tablet)
- 🏠 Dashboard ringkasan (kitab, kajian, ustadz, jam audio) + aktivitas terbaru
- 📚 Koleksi berbasis **Kitab** — setiap kitab punya daftar kajiannya sendiri
- 🎧 Tabel kajian modern: search, filter (kitab/status), pagination, edit/hapus
- 🪄 Wizard tambah kajian 5 langkah: Kitab → Info → Audio → Transkrip → Preview
- 📤 Upload langsung ke R2 (presigned URL) — tanpa menyalin URL manual
- ⏱️ Deteksi durasi otomatis (HTML5 Audio Metadata API)
- 🔢 Nomor kajian otomatis berurutan per kitab
- 🎚️ Audio preview (play/pause/seek/speed) sebelum publish
- 📦 Bulk upload banyak file → kajian #1, #2, #3 otomatis dari urutan nama file
- 🖼️ Cover generator otomatis (Canvas) bila cover tidak diunggah
- 📊 Statistik analitik + ⚙️ Pengaturan koneksi (GitHub/R2, mode demo/live)

## Struktur Folder

```
public/
  images/ icons/ 404.html robots.txt
src/
  components/
    ui/            # Primitif reusable (Button, Field, Modal, ...)
    studio/        # Komponen admin (Sidebar, Topbar, DataTable, wizard/, ...)
    *.tsx          # Komponen publik (AudioEngine, FloatingPlayer, ...)
  pages/
    studio/        # Halaman admin (Dashboard, Kitab, Kajian, Wizard, ...)
    *.tsx          # Halaman publik
  routes/          # PublicRoutes + StudioRoutes
  services/        # I/O eksternal: config, auth, github, r2, contentRepo
  store/           # Zustand stores
  hooks/           # useDebounce, useDropzone, usePagination
  lib/             # audio, cover, utils, assets, data loader
  content/
    kitab/         # Satu JSON per kitab
    kajian/        # Satu JSON per kajian
  types/           # Tipe TypeScript (common, kitab, kajian)
worker/            # Cloudflare Worker presign R2 (deploy terpisah)
```

## Arsitektur tanpa backend

| Kebutuhan | Mekanisme |
|-----------|-----------|
| Login admin | GitHub PAT (atau mode demo) |
| Simpan metadata | GitHub Contents API → commit JSON → rebuild Pages |
| Upload audio | Browser → Worker (presign) → PUT langsung ke R2 |
| Deteksi durasi | HTML5 Audio Metadata API (browser) |
| Generate cover | Canvas API (browser) |

Tidak ada Laravel/PHP/MySQL/MongoDB/Firebase. Worker adalah edge function bagian dari ekosistem Cloudflare R2.

## Dokumentasi Deploy

Lihat [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) untuk konfigurasi GitHub Pages, login GitHub, dan Cloudflare R2 + Worker.
