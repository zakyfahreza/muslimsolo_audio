# Panduan Deploy Muslimsolo Audio (Langkah demi Langkah)

Panduan ini ditulis khusus untuk proyek Anda. Ikuti berurutan. Ada 4 bagian:

1. Publikasikan situs ke GitHub Pages (situs sudah online setelah ini).
2. Siapkan Cloudflare R2 (tempat menyimpan file audio).
3. Deploy Cloudflare Worker (penandatangan upload).
4. Sambungkan semuanya di Studio + buat token GitHub.

> Mode Demo tetap berfungsi tanpa bagian 2–4. Lakukan bagian 2–4 hanya bila Anda
> ingin upload audio sungguhan dan menyimpan kajian secara permanen (Mode Live).

Catatan setup Anda saat ini:
- Nama repo yang disarankan: **`muslimsolo_audio`** (cocok dengan `base` di `vite.config.ts`).
- Git lokal sudah diinisialisasi dan commit pertama sudah dibuat.

---

## BAGIAN 1 — Deploy ke GitHub Pages

### 1.1 Buat repository di GitHub
1. Buka https://github.com/new
2. **Repository name**: `muslimsolo_audio`
3. Pilih **Public** (GitHub Pages gratis untuk repo publik).
4. JANGAN centang "Add a README/.gitignore/license" (proyek sudah punya).
5. Klik **Create repository**.

### 1.2 Hubungkan & push (jalankan di folder proyek)
Ganti `USERNAME` dengan username GitHub Anda.

```bash
git remote add origin https://github.com/USERNAME/muslimsolo_audio.git
git push -u origin main
```

Saat diminta login, gunakan username GitHub + **Personal Access Token** sebagai
password (bukan password akun). Cara membuat token ada di Bagian 4.1 —
token yang sama bisa dipakai untuk push dan untuk Studio.

### 1.3 Aktifkan GitHub Pages
1. Di repo: **Settings → Pages**.
2. **Build and deployment → Source**: pilih **GitHub Actions**.
3. Selesai. Workflow `.github/workflows/deploy.yml` otomatis berjalan tiap push
   ke `main`.

### 1.4 Tunggu build & buka situs
1. Buka tab **Actions** di repo → tunggu workflow "Deploy to GitHub Pages"
   selesai (centang hijau, ±1–2 menit).
2. Situs Anda online di:
   ```
   https://USERNAME.github.io/muslimsolo_audio/
   ```
3. Studio: `https://USERNAME.github.io/muslimsolo_audio/studio`

> Penting soal `base path`: proyek di-set untuk path `/muslimsolo_audio/`. Jika
> nama repo Anda BUKAN `muslimsolo_audio`, ubah dua tempat agar cocok:
> - `vite.config.ts` → `const base = '/NAMA-REPO/';`
> - `.github/workflows/deploy.yml` → `BASE_PATH: /NAMA-REPO/`
> lalu commit & push lagi.

Sampai sini situs sudah bisa diakses dari internet (Mode Demo).

---

## BAGIAN 2 — Cloudflare R2 (penyimpanan audio)

### 2.1 Buat akun & bucket
1. Daftar/masuk di https://dash.cloudflare.com
2. Menu kiri **R2** → aktifkan (perlu verifikasi, tetap ada free tier).
3. **Create bucket**, nama: `muslimsolo-audio` → Create.

### 2.2 Aktifkan akses publik (untuk MEMUTAR audio)
Pilih salah satu:

- **Cara cepat (r2.dev):** buka bucket → **Settings → Public access →**
  aktifkan **Allow Access** pada **r2.dev subdomain**. Anda dapat URL seperti
  `https://pub-xxxxxxxx.r2.dev`. Catat URL ini.
- **Cara rapi (custom domain):** **Settings → Public access → Connect Domain**,
  mis. `audio.domainanda.com` (perlu domain di Cloudflare). URL jadi
  `https://audio.domainanda.com`.

URL inilah yang nanti diisi sebagai **Base URL Audio Publik** di Studio.

### 2.3 Atur CORS bucket (agar upload & seek berfungsi)
Bucket → **Settings → CORS Policy → Edit** → tempel (sesuaikan origin dengan
URL GitHub Pages Anda):

```json
[
  {
    "AllowedOrigins": [
      "https://USERNAME.github.io",
      "http://localhost:5173",
      "http://localhost:4173"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"],
    "MaxAgeSeconds": 3600
  }
]
```

### 2.4 Buat R2 API Token (kredensial untuk Worker)
1. R2 → **Manage R2 API Tokens** → **Create API token**.
2. Permissions: **Object Read & Write**, dibatasi ke bucket `muslimsolo-audio`.
3. Create → salin **Access Key ID** dan **Secret Access Key** (Secret hanya
   tampil sekali — simpan baik-baik).
4. Catat juga **Account ID** Anda (ada di halaman utama R2 / sidebar).

---

## BAGIAN 3 — Deploy Cloudflare Worker (penandatangan upload)

Worker ini yang membuat "izin upload" sementara agar browser bisa mengunggah
langsung ke R2 tanpa membocorkan kredensial. Bukan server tradisional — gratis
di free tier Cloudflare.

### 3.1 Isi konfigurasi worker
Buka `worker/wrangler.toml`, isi nilai berikut:

```toml
[vars]
R2_ACCOUNT_ID = "ACCOUNT_ID_ANDA"
R2_BUCKET = "muslimsolo-audio"
AUDIO_PUBLIC_BASE = "https://pub-xxxx.r2.dev"     # dari langkah 2.2
GITHUB_REPO = "USERNAME/muslimsolo_audio"
ALLOWED_ORIGINS = "https://USERNAME.github.io,http://localhost:5173,http://localhost:4173"
```

### 3.2 Install & login wrangler (jalankan di folder worker)
```bash
cd worker
npm install
npx wrangler login        # membuka browser untuk otorisasi Cloudflare
```

### 3.3 Simpan kredensial R2 sebagai secret (jangan ditaruh di file)
```bash
npx wrangler secret put R2_ACCESS_KEY_ID
# tempel Access Key ID, Enter
npx wrangler secret put R2_SECRET_ACCESS_KEY
# tempel Secret Access Key, Enter
```

### 3.4 Deploy
```bash
npx wrangler deploy
```
Setelah sukses, wrangler menampilkan URL Worker, mis.:
```
https://muslimsolo-r2-presign.NAMA-SUBDOMAIN.workers.dev
```
Catat URL ini untuk Bagian 4.

---

## BAGIAN 4 — Sambungkan semuanya (Mode Live)

### 4.1 Buat GitHub Personal Access Token (untuk simpan kajian)
1. https://github.com/settings/tokens → **Fine-grained tokens** →
   **Generate new token**.
2. **Repository access**: Only select repositories → `muslimsolo_audio`.
3. **Permissions → Repository permissions → Contents**: **Read and write**.
4. Generate → salin token (`github_pat_...`). Token ini juga bisa dipakai untuk
   `git push` di Bagian 1.2.

### 4.2 Login Studio & isi pengaturan
1. Buka `https://USERNAME.github.io/muslimsolo_audio/studio/login`
2. **Step 1 — Login Admin**: ID `admin`, kata sandi `mediamuslimsolo13245`.
3. **Step 2 — GitHub**: tempel token dari 4.1 → **Hubungkan GitHub & Masuk**.
4. Di Studio → **Pengaturan**:
   - **Mode Operasi**: pilih **Live (R2 + GitHub)**.
   - **GitHub → Repository**: `USERNAME/muslimsolo_audio`, Branch: `main`.
   - **Cloudflare R2 → URL Worker**: URL dari langkah 3.4.
   - **Base URL Audio Publik**: URL publik R2 dari langkah 2.2.
   - **Simpan Pengaturan**.

### 4.3 Uji alur lengkap
1. Studio → **Tambah Kajian** atau **Upload Audio**.
2. Pilih kitab, unggah MP3 → durasi terbaca, file terupload ke R2.
3. **Publish** → kajian di-commit ke repo, GitHub Actions build ulang
   (±1–2 menit), lalu kajian muncul di situs publik.

Selesai. Situs siap diakses publik dan admin bisa menambah kajian dari mana saja.

---

## Mengubah konten / kode setelah online
Setiap perubahan kode cukup:
```bash
git add -A
git commit -m "pesan perubahan"
git push
```
GitHub Actions otomatis build & deploy ulang.

## Ringkasan nilai yang perlu Anda kumpulkan
| Nilai | Diperoleh dari | Dipakai di |
|-------|----------------|------------|
| Username GitHub | akun Anda | remote git, repo, origin |
| GitHub PAT (Contents R/W) | github.com/settings/tokens | push & Studio (4.2) |
| Account ID Cloudflare | dashboard R2 | wrangler.toml |
| R2 Access Key + Secret | R2 API Token (2.4) | wrangler secret (3.3) |
| URL publik R2 | R2 Public access (2.2) | wrangler.toml + Studio |
| URL Worker | hasil wrangler deploy (3.4) | Studio Pengaturan |

## Masalah umum
- **Halaman blank / aset 404** → `base` di `vite.config.ts` dan `BASE_PATH` di
  workflow harus sama persis dengan `/NAMA-REPO/`.
- **Refresh halaman dalam (mis. /studio) jadi 404** → sudah ditangani
  `public/404.html`. Pastikan `pathSegmentsToKeep = 1` (untuk project site).
- **Upload gagal / CORS error** → cek origin di CORS R2 (2.3) dan
  `ALLOWED_ORIGINS` Worker (3.1) sama dengan URL GitHub Pages Anda.
- **Audio tidak bisa diputar** → pastikan akses publik R2 aktif (2.2) dan
  Base URL Audio benar di Studio.
