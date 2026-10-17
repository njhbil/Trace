# TRACE — Tourism Resource & Cultural Experience

Panduan wisata edukatif **Universitas Negeri Surabaya (UNESA)** dalam bentuk situs
React + TypeScript. Murni *frontend*: tanpa backend, tanpa database, tanpa layanan
berbayar. Semuanya jalan di browser pengunjung.

Isinya:

1. **Intro & pengenalan UNESA** — angka kunci, moto, jejak sejarah singkat, 5 kampus.
2. **Peta 3D game-like** — kampus bergaya *low-poly*, bisa diseret/dizoom, dengan
   penanda bernomor yang jika diklik akan "terbang" ke gedung lalu membuka halaman fakultas.
3. **Rute tur 1 titik → 14 titik** — satu jalur berurutan dengan ceklis kunjungan
   (tersimpan otomatis di perangkat) dan bisa dicetak.
4. **14 halaman mini-guide fakultas** — sejarah, tahun berdiri, jumlah & daftar prodi,
   dekan/wakil dekan, gedung/fasilitas, daya tarik, denah mini, serta sumber referensi.

---

## Menjalankan

```bash
npm install
npm run dev      # server pengembangan → http://localhost:5173
npm run build    # cek tipe + bundel ke dist/
npm run preview  # pratinjau hasil build
```

`vite.config.ts` memakai `base: "./"`, sehingga isi folder `dist/` bisa langsung
dibuka lewat `file://` atau di-drop ke hosting apa pun (GitHub Pages, Netlify,
USB, folder bersama) tanpa mengubah apa pun.

### Rute halaman

Router memakai **hash** (`#/`, `#/peta`, `#/rute`, `#/fakultas/ft`), jadi setiap
halaman punya tautan stabil yang aman dibagikan atau dipindai — tidak perlu
konfigurasi *rewrite* apa pun di hosting.

---

## Struktur

```
public/assets/fakultas/   foto gedung 14 fakultas (ganti bebas, nama file di data)
public/favicon.svg        ikon tab TRACE
src/data/fakultas.ts      ⭐ DATABASE — semua isi 14 halaman fakultas ada di sini
src/data/unesa.ts         narasi umum UNESA, angka, timeline, 5 kampus
src/lib/speech.ts         sapaan suara "Selamat datang di Fakultas …" (Web Speech API)
src/lib/gamelan.ts        iringan gamelan & efek klik (WebAudio, disintesis, nol aset)
src/lib/gesture.ts        penunda eksekusi sampai interaksi pertama pengunjung
src/lib/teks.ts           utilitas teks bersama (tahun, nama singkat, domain sumber)
src/three/                peta 3D (react-three-fiber): pulau, gedung joglo, penanda, rute
src/components/           navigasi, footer, logo, mini denah SVG, animasi reveal, foto fallback
src/pages/                Home, Peta, Rute, FakultasPage, NotFound
src/styles/               sistem desain (tema batik gelap + emas)
research/                 catatan riset awal: sumber resmi, data per fakultas, kredit foto
```

### Mengubah isi halaman fakultas

Semua teks bisa diedit dari `src/data/fakultas.ts` tanpa menyentuh komponen:
`sejarah`, `prodi`, `pimpinan`, `gedung`, `dayaTarik`, `fakta`, `suara` (kalimat TTS),
`peta` (posisi di peta 3D), dan `sumber` (tautan referensi).

### Mengganti foto

Taruh gambar di `public/assets/fakultas/` lalu ubah field `foto`, contoh
`foto: img("FISIPOL.jpeg")`. Kalau file tidak ada, halaman tetap tampil rapi dengan
placeholder aksara Jawa — tidak akan ada gambar rusak.

### Menambah/mengurangi titik

Tambah objek baru di array `FAKULTAS` dan atur koordinat `peta` (ilustratif, satuan
"unit peta", pusat pulau = 0,0). Angka `no` menentukan urutan rute.

---

## Deploy ke Vercel

1. Push repositori ini ke GitHub.
2. Di Vercel: **Add New → Project → Import** repositori tersebut.
3. Vercel otomatis mendeteksi Vite. Bila diminta, isi:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klik **Deploy**. Karena router memakai hash, tidak ada konfigurasi
   *rewrites*/*redirects* yang perlu ditambahkan — `vercel.json` di repo ini
   hanya memuat header dasar.

Alternatif statis: jalankan `npm run build`, lalu unggah isi folder `dist/`
ke hosting apa pun.

---

## Suara

Sambutan memakai **Web Speech API** bahasa Indonesia (`id-ID`) — tanpa file audio,
tanpa TTS online. Iringan gamelan disintesis langsung dengan WebAudio. Keduanya
otomatis diam bila perangkat tidak mendukung, dan bisa dinyalakan dari tombol
pengeras suara di pojok kanan bawah.

---

## Catatan akurasi data

Konten dirangkum dari situs resmi UNESA (`unesa.ac.id`), website/Instagram tiap
fakultas, dan PDDikti pada 2025–2026. Beberapa hal yang perlu diketahui:

- Jumlah prodi tiap jenjang kadang berbeda antar sumber (mis. FT, FIKK, FKP,
  Pascasarjana). Angka total mengikuti sumber terbaru, dan halaman menampilkan
  catatan bila daftar prodi belum lengkap.
- Susunan Wakil Dekan III umumnya belum tersedia di kanal publik sehingga tidak
  dicantumkan.
- Penempatan gedung di peta 3D dan denah SVG **ilustratif**, bukan peta teknis.
- PSDKU Magetan berjarak ±120 km dari Surabaya; di peta ditandai sebagai titik
  terpisah di tepi kanan.

Untuk kebutuhan tugas/konten resmi, silakan cek ulang ke sumber yang tercantum di
bagian bawah tiap halaman fakultas.

---

## Teknologi

React 19 · TypeScript · Vite · react-three-fiber + drei (Three.js) · framer-motion ·
react-router-dom · Google Fonts (Fraunces, Plus Jakarta Sans, Noto Serif Javanese)

Dibuat untuk keperluan edukatif non-komersial.
