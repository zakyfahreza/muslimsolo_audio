# Panduan Deploy MuslimSolo Audio

Situs ini terdiri dari tiga bagian, semuanya tanpa backend tradisional:

1. **Situs publik + Studio admin** — aplikasi React statis di GitHub Pages (`/` dan `/studio`).
2. **Penyimpanan metadata** — file JSON di repo, ditulis lewat **GitHub Contents API**.
3. **Penyimpanan audio** — **Cloudflare R2**, upload langsung dari browser lewat **presigned URL** yang ditandatangani sebuah **Cloudflare Worker**.

> Studio bisa langsung dipakai dalam **Mode Demo** tanpa setup apa pun (perubahan disimpan di browser). Mode **Live** memerlukan langkah 2 & 3 di bawah.

---

## 1. GitHub Pages

### Project site (default)
Dilayani dari `https://<user>.github.io/<repo>/`.

1. Push repo ke GitHub (nama default `muslimsolo_audio`).
2. **Settings → Pages → Source → GitHub Actions**.
3. Pastikan `BASE_PATH` di `.github/workflows/deploy.yml` = `/<repo>/` dan `base` di `vite.config.ts` cocok.
4. Push ke `main` → build & deploy otomatis.

### Custom domain / user site
- Set `BASE_PATH=/` di workflow, `pathSegmentsToKeep = 0` di `public/404.html`, dan tambahkan `public/CNAME`.

Deep link (mis. `/studio/kajian`) ditangani oleh `public/404.html` + decoder di `index.html`.

---

## 2. Login Studio & GitHub (Mode Live)

Studio punya dua cara masuk:

- **Mode Demo**: pilih tab "Mode Demo", isi sandi bebas. Perubahan tersimpan di `localStorage` browser. Cocok untuk mencoba.
- **GitHub**: tab "GitHub", tempel **fine-grained Personal Access Token**.

### Membuat token GitHub
1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. **Repository access**: pilih repo konten.
3. **Permissions → Repository permissions → Contents: Read and write**.
4. Generate, salin token (format `github_pat_...`).
5. Di Studio → **Pengaturan** → set Repository (`owner/nama`) & branch, pilih **Mode Live**, lalu login GitHub dengan token tersebut.

Token hanya disimpan di browser Anda dan dipakai untuk commit file JSON via API. Setiap commit memicu rebuild GitHub Pages sehingga kajian baru muncul di situs publik.

---

## 3. Cloudflare R2 + Worker (Upload Audio)

Audio diupload langsung dari browser ke R2 memakai presigned URL. Kredensial R2 **tidak pernah** ada di browser; hanya Worker yang memegangnya.

### 3.1 Buat bucket R2
1. Cloudflare → **R2 → Create bucket**, mis. `muslimsolo-audio`.
2. Aktifkan akses publik untuk **read**:
   - **Custom domain** (disarankan): hubungkan `audio.muslimsolo.id`.
   - atau aktifkan **r2.dev subdomain** untuk uji coba.

### 3.2 Buat R2 API Token
- **R2 → Manage R2 API Tokens → Create** dengan izin **Object Read & Write** pada bucket.
- Catat **Access Key ID** dan **Secret Access Key**.

### 3.3 Deploy Worker
```bash
cd worker
npm install
# Edit wrangler.toml: isi R2_ACCOUNT_ID, R2_BUCKET, AUDIO_PUBLIC_BASE,
# GITHUB_REPO, ALLOWED_ORIGINS (origin GitHub Pages + localhost).
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler deploy
```
Worker akan tersedia di `https://muslimsolo-r2-presign.<subdomain>.workers.dev`.

### 3.4 CORS pada bucket R2
Agar PUT presigned dan streaming/seek berfungsi (R2 → bucket → **Settings → CORS Policy**):
```json
[
  {
    "AllowedOrigins": ["https://your-org.github.io", "https://muslimsolo.id"],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3.5 Hubungkan ke Studio
Di Studio → **Pengaturan**:
- URL Worker = URL Worker dari 3.3.
- Base URL Audio Publik = domain publik R2 (mis. `https://audio.muslimsolo.id`).
- Pilih **Mode Live**.

Atau set lewat `.env.local` (lihat `.env.example`) saat build.

---

## Alur kerja admin (Mode Live)

1. Buka `/studio`, login GitHub.
2. **Upload Audio** atau **Tambah Kajian** → pilih MP3.
   - Durasi terbaca otomatis (HTML5 Audio Metadata API).
   - File diupload langsung ke R2 via presigned URL.
   - Nomor kajian dibuat otomatis berurutan per kitab.
   - Cover dibuat otomatis (Canvas) jika tidak diunggah.
3. **Publish** → metadata JSON di-commit ke repo via GitHub API.
4. GitHub Actions build ulang → kajian muncul di situs publik.

---

## Checklist go-live
- [ ] `base` (vite.config.ts) & `BASE_PATH` (workflow) cocok dengan path Pages.
- [ ] Worker ter-deploy, secret R2 di-set, `wrangler.toml` terisi.
- [ ] CORS R2 mengizinkan PUT dari origin Pages.
- [ ] Studio → Pengaturan: repo, branch, Worker URL, audio base terisi, **Mode Live**.
- [ ] Token GitHub punya izin Contents: Read & Write.
- [ ] `public/robots.txt` & domain meta diperbarui.
