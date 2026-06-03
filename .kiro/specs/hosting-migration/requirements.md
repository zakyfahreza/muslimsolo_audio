# Requirements Document

## Introduction

Saat ini **Muslimsolo Audio** berjalan sebagai aplikasi statis murni tanpa server:

- Situs publik + Studio admin dilayani **GitHub Pages**.
- Metadata kitab/kajian disimpan sebagai file JSON di repo dan ditulis lewat **GitHub Contents API** (tiap commit memicu rebuild Pages).
- Berkas audio disimpan di **Cloudflare R2** dan diunggah langsung dari browser memakai **presigned URL** yang ditandatangani sebuah **Cloudflare Worker**.
- Login admin berupa gerbang id+sandi di sisi browser, ditambah **GitHub Personal Access Token** untuk commit.

Fitur ini bertujuan **memigrasikan seluruh penyimpanan (metadata + audio) ke satu server hosting tradisional** sehingga aplikasi tidak lagi bergantung pada GitHub maupun Cloudflare. Admin cukup mengelola satu tempat: server hosting milik sendiri.

### Asumsi & Batasan Penting (perlu dikonfirmasi)

1. **Aplikasi statis murni tidak lagi cukup.** Mengunggah dan menyimpan berkas audio serta metadata di server tradisional secara dinamis **mewajibkan adanya backend**. Karena itu, batasan lama "tanpa backend" otomatis dilonggarkan untuk fitur ini.
2. **Batasan teknologi sebelumnya tetap dihormati:** tidak memakai **PHP/Laravel**, **MySQL**, **MongoDB**, atau **Firebase**. Migrasi ini diasumsikan memakai **backend Node.js** (mis. Express/Fastify) dengan penyimpanan metadata berbasis berkas (JSON di disk) atau **SQLite** (berbasis berkas, bukan server DB terpisah). Mekanisme final ditetapkan pada fase Desain.
3. **Target hosting** diasumsikan mampu menjalankan proses Node.js jangka panjang (VPS, atau hosting dengan dukungan Node), bukan shared-hosting PHP-only. Spesifik penyedia ditetapkan kemudian.
4. **Tidak boleh ada kehilangan data.** Seluruh kitab, kajian, transkrip, dan berkas audio yang sudah ada wajib ikut bermigrasi.

## Glossary

- **Backend**: proses server Node.js yang melayani API, autentikasi, penyimpanan metadata, serta unggah dan streaming audio.
- **Frontend**: aplikasi React (situs publik `/` + Studio admin `/studio`) hasil build Vite.
- **Metadata**: data deskriptif kitab dan kajian (judul, ustadz, kategori, transkrip, status, dll.) di luar berkas audio.
- **Penyimpanan berkas (file storage)**: direktori di server tempat berkas audio dan cover disimpan.
- **Range request**: permintaan HTTP dengan header `Range` untuk mengambil sebagian byte berkas, dipakai pemutar audio untuk seek/streaming.
- **Sesi**: status login admin yang terverifikasi di server (cookie sesi atau JWT).
- **Migrasi**: proses memindahkan metadata JSON dan berkas audio yang ada (GitHub + Cloudflare R2) ke server hosting baru.

---

## Requirements

### Requirement 1: Backend server aplikasi

**User Story:** Sebagai pemilik situs, saya ingin satu server backend yang melayani situs publik, Studio admin, dan API data, sehingga seluruh aplikasi berjalan dari satu hosting tanpa GitHub Pages.

#### Acceptance Criteria

1. WHEN server dijalankan di hosting THEN sistem SHALL melayani aset frontend hasil build (situs publik di `/` dan Studio di `/studio`) lewat HTTP/HTTPS.
2. WHEN permintaan masuk ke rute API (mis. berawalan `/api`) THEN sistem SHALL menanganinya di sisi server dan mengembalikan JSON.
3. WHEN pengguna membuka deep link SPA (mis. `/studio/kajian`) THEN sistem SHALL mengembalikan `index.html` agar React Router menangani rute (fallback SPA), bukan 404.
4. WHEN aplikasi dibangun untuk produksi THEN sistem SHALL menggunakan base path `/` (bukan `/<repo>/`) yang sesuai dengan hosting domain sendiri.

### Requirement 2: Penyimpanan metadata di server (pengganti GitHub Contents API)

**User Story:** Sebagai admin, saya ingin metadata kitab dan kajian tersimpan di server hosting, sehingga perubahan tidak lagi memerlukan commit ke GitHub.

#### Acceptance Criteria

1. WHEN admin membuat atau mengubah kitab/kajian THEN sistem SHALL menyimpan metadatanya secara persisten di server (berkas JSON di disk atau SQLite).
2. WHEN admin menghapus kitab/kajian THEN sistem SHALL menghapus metadata terkait dari server secara permanen.
3. WHEN situs publik atau Studio meminta daftar kitab/kajian THEN sistem SHALL membacanya dari penyimpanan server, bukan dari berkas yang di-bundle saat build.
4. WHEN metadata disimpan THEN sistem SHALL mempertahankan struktur data `Kitab` dan `Kajian` yang ada (id, kitabId, number, title, speaker, category, audioUrl, audioKey, duration, transcript, status, dll.) tanpa kehilangan field.
5. IF dua permintaan tulis terjadi hampir bersamaan THEN sistem SHALL menjaga konsistensi data (tidak korup/terpotong).

### Requirement 3: Upload & penyimpanan audio di server (pengganti R2 + Worker)

**User Story:** Sebagai admin, saya ingin mengunggah berkas audio langsung ke server hosting, sehingga audio tersimpan di server dan tidak lagi memakai Cloudflare R2 maupun Worker.

#### Acceptance Criteria

1. WHEN admin mengunggah berkas audio dari Studio THEN sistem SHALL menerima berkas tersebut di server dan menyimpannya ke penyimpanan berkas server.
2. WHILE berkas sedang diunggah THE sistem SHALL melaporkan progres unggah ke UI Studio.
3. WHEN unggah selesai THEN sistem SHALL mengembalikan URL publik audio yang dilayani oleh server (mis. `/media/audio/<kitab>/<file>.mp3`) beserta key penyimpanannya.
4. WHEN admin mengunggah cover (atau cover dibuat otomatis) THEN sistem SHALL menyimpan berkas gambar di server dan mengembalikan URL publiknya.
5. IF ukuran berkas melebihi batas yang dikonfigurasi THEN sistem SHALL menolak unggahan dengan pesan kesalahan yang jelas.
6. WHEN berkas audio yang dipakai sebuah kajian dihapus dari Studio THEN sistem SHALL (sesuai kebijakan yang disepakati) menghapus atau menandai berkas audio terkait di server.

### Requirement 4: Streaming audio dengan dukungan seek (range request)

**User Story:** Sebagai pendengar, saya ingin memutar dan menggeser posisi audio dengan lancar, sehingga pengalaman mendengar tetap seperti sebelumnya.

#### Acceptance Criteria

1. WHEN pemutar audio meminta berkas dengan header `Range` THEN sistem SHALL membalas `206 Partial Content` dengan header `Content-Range` dan `Accept-Ranges: bytes`.
2. WHEN audio dilayani THEN sistem SHALL menyetel `Content-Type` yang benar (mis. `audio/mpeg`) dan header cache yang sesuai.
3. WHEN pendengar menggeser (seek) ke posisi mana pun THEN sistem SHALL melayani potongan byte yang diminta tanpa harus mengunduh seluruh berkas.

### Requirement 5: Autentikasi admin sisi server

**User Story:** Sebagai pemilik situs, saya ingin login admin diverifikasi di server, sehingga hanya admin sah yang dapat menambah/mengubah/menghapus konten dan token GitHub tidak lagi diperlukan.

#### Acceptance Criteria

1. WHEN admin login dengan id dan kata sandi yang benar THEN sistem SHALL membuat sesi terautentikasi di sisi server (mis. cookie sesi atau JWT).
2. WHEN permintaan tulis (buat/ubah/hapus/unggah) diterima tanpa sesi yang valid THEN sistem SHALL menolaknya dengan status `401`/`403`.
3. WHEN admin keluar (logout) THEN sistem SHALL membatalkan sesi sehingga tidak dapat dipakai lagi.
4. WHERE kredensial admin disimpan THE sistem SHALL menyimpan kata sandi dalam bentuk hash (bukan teks polos) dan tidak mengeksposnya ke klien.
5. WHEN fitur ini selesai THEN sistem SHALL menghapus ketergantungan pada GitHub Personal Access Token untuk operasi penyimpanan.

### Requirement 6: Studio mengelola konten melalui API server

**User Story:** Sebagai admin, saya ingin seluruh aksi di Studio (tambah/edit/hapus kitab & kajian, unggah audio) bekerja lewat API server, sehingga perubahan langsung tersimpan dan tampil.

#### Acceptance Criteria

1. WHEN admin menyimpan kajian/kitab di Studio THEN sistem SHALL mengirim data ke API server dan menyimpannya tanpa memerlukan rebuild/deploy.
2. WHEN penyimpanan berhasil THEN sistem SHALL menampilkan status sukses yang jujur ("Tersimpan di server"), dan WHEN gagal THEN menampilkan pesan kesalahan yang jelas.
3. WHEN admin sudah menyimpan perubahan THEN situs publik SHALL menampilkan perubahan itu tanpa langkah deploy manual.
4. WHEN layanan lama (`githubService`, `r2Service`, Worker) tidak lagi dipakai THEN sistem SHALL menggantinya dengan klien API server, sambil menjaga kompatibilitas tipe data yang dipakai komponen UI.

### Requirement 7: Situs publik membaca konten dari server

**User Story:** Sebagai pengunjung, saya ingin melihat daftar kitab dan kajian terbaru yang selalu mutakhir, sehingga konten yang baru ditambahkan admin langsung muncul.

#### Acceptance Criteria

1. WHEN pengunjung membuka beranda/halaman kitab/halaman kajian THEN sistem SHALL menampilkan data dari server (bukan snapshot build-time).
2. WHEN kajian baru ditambahkan admin THEN situs publik SHALL menampilkannya pada permintaan berikutnya tanpa rebuild.
3. WHERE kajian berstatus `draft` THE sistem SHALL menyembunyikannya dari situs publik dan hanya menampilkannya di Studio.
4. IF server tidak dapat dijangkau THEN situs publik SHALL menampilkan keadaan kesalahan/loading yang wajar, bukan layar putih.

### Requirement 8: Migrasi data lama tanpa kehilangan data

**User Story:** Sebagai pemilik situs, saya ingin seluruh kitab, kajian, transkrip, dan audio yang sudah ada dipindahkan ke server, sehingga tidak ada konten yang hilang setelah migrasi.

#### Acceptance Criteria

1. WHEN proses migrasi dijalankan THEN sistem SHALL mengimpor seluruh berkas JSON kitab dan kajian yang ada (`src/content/kitab/*`, `src/content/kajian/*`) ke penyimpanan server.
2. WHEN proses migrasi dijalankan THEN sistem SHALL memindahkan/mengunduh berkas audio yang ada (saat ini di R2) ke penyimpanan server, dan memperbarui `audioUrl` setiap kajian agar menunjuk ke URL server yang baru.
3. WHEN migrasi selesai THEN sistem SHALL menyediakan cara verifikasi bahwa jumlah kitab, kajian, dan berkas audio cocok dengan sumber lama.
4. IF sebuah berkas audio gagal dimigrasikan THEN sistem SHALL mencatat (log) kegagalan tersebut tanpa menghentikan migrasi item lainnya.

### Requirement 9: Deployment ke hosting

**User Story:** Sebagai pemilik situs, saya ingin panduan dan konfigurasi untuk men-deploy aplikasi (frontend + backend) ke hosting, sehingga situs dapat diakses publik lewat domain sendiri.

#### Acceptance Criteria

1. WHEN aplikasi di-deploy THEN sistem SHALL menyediakan langkah membangun frontend dan menjalankan backend di server (mis. proses Node yang dikelola PM2/systemd atau setara).
2. WHEN diakses lewat domain `audio.muslimsolo.web.id` THEN sistem SHALL dilayani melalui HTTPS.
3. WHERE konfigurasi runtime diperlukan (port, lokasi penyimpanan, kredensial admin, batas ukuran unggah) THE sistem SHALL membacanya dari variabel lingkungan/berkas konfigurasi server, bukan hardcode.
4. WHEN dokumentasi deploy diperbarui THEN sistem SHALL menggantikan instruksi GitHub Pages + Cloudflare lama dengan instruksi hosting baru.

### Requirement 10: Keamanan & ketahanan

**User Story:** Sebagai pemilik situs, saya ingin server aman dan tahan terhadap kesalahan umum, sehingga konten dan akses admin terlindungi.

#### Acceptance Criteria

1. WHEN endpoint unggah/tulis diakses THEN sistem SHALL memvalidasi tipe dan ukuran berkas serta membersihkan nama/path berkas untuk mencegah path traversal.
2. WHEN kredensial atau sesi diproses THEN sistem SHALL tidak pernah menuliskannya ke log atau respons klien.
3. WHERE backend mengekspos API THE sistem SHALL menerapkan kontrol akses pada seluruh rute tulis (tidak ada endpoint tulis tanpa autentikasi).
4. WHEN backend dipasang THEN sistem SHALL menyediakan cara backup penyimpanan metadata + audio (atau mendokumentasikan prosedur backup).
