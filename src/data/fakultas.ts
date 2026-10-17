/**
 * DATABASE GUIDE — 14 titik wisata edukatif UNESA.
 * Seluruh isi dapat diedit manual tanpa mengubah komponen mana pun.
 *
 * Foto: letakkan berkas di `public/assets/fakultas/` lalu tulis namanya pada field `foto`.
 * Posisi `peta` adalah koordinat di peta 3D (meter, pusat pulau = 0,0) — ilustratif, bukan denah teknis.
 */

export interface Gedung {
  nama: string;
  ket: string;
}

export interface Pimpinan {
  jabatan: string;
  nama: string;
}

export interface Fakultas {
  /** urutan rute 1..14 */
  no: number;
  slug: string;
  akronim: string;
  nama: string;
  namaPendek: string;
  /** aksen warna di peta 3D & UI (hex) */
  warna: string;
  berdiri: string;
  berdiriKet: string;
  sejarah: string[];
  prodiTotal: number;
  prodi: string[];
  dekan: string;
  pimpinan: Pimpinan[];
  catatanPimpinan?: string;
  kampus: string;
  kampusKode: string;
  alamat: string;
  gedung: Gedung[];
  dayaTarik: string;
  fakta: string[];
  /** kalimat yang diucapkan TTS saat halaman dibuka */
  suara: string;
  foto: string;
  /** ragam bentuk gedung di peta 3D — meniru ciri khas tiap fakultas (ilustratif) */
  ragamGedung: RagamGedung;
  /** penyesuaian ukuran gedung di peta 3D (opsional, menimpa bawaan ragam) */
  dimensiGedung?: { w: number; d: number; h: number };
  peta: { x: number; z: number; rotasi?: number };
  sumber: string[];
}

/**
 * Ragam bentuk gedung di peta 3D. Setiap fakultas memakai ragam yang
 * meniru ciri khas bangunan aslinya (menara, kolonial, bangsal industri,
 * kubah riset, joglo, gimnasium, blok minimalis, menara medis, gedung kecil).
 */
export type RagamGedung =
  | "menara"
  | "kolonial"
  | "industri"
  | "riset"
  | "joglo"
  | "olahraga"
  | "minimalis"
  | "medis"
  | "kecil";

const img = (name: string) => `${import.meta.env.BASE_URL}assets/fakultas/${name}`;

/* ---------- helper penempatan di peta (ilustratif, bukan denah teknis) ---------- */
const zonaA = { x: -17.5, z: -3 }; // Kampus 1 Ketintang
const zonaB = { x: 17.5, z: 3 }; // Kampus 2 Lidah Wetan
const R_ARC = 9.6; // jari-jari lingkar gedung fakultas

/** arahkan pintu gedung menghadap pusat pulau sendiri (alun-alun) */
function face(p: { x: number; z: number }, center: { x: number; z: number }) {
  return +Math.atan2(center.x - p.x, center.z - p.z).toFixed(3);
}

/**
 * Gedung fakultas ditaruh melingkar mengelilingi alun-alun pusat pulau,
 * bukan berjajar rapat di satu sisi. Jarak antartitik ~3,4 unit sehingga
 * lebar gedung mana pun masih menyisakan celah — tidak terlihat menumpuk.
 * Busur dibuka 60° ke arah jembatan; bagian kosong itu jadi halaman masuk.
 */
function arc(center: { x: number; z: number }, index: number, total: number, from: number) {
  const a = ((from + (360 / total) * index) * Math.PI) / 180;
  const p = { x: +(center.x + R_ARC * Math.cos(a)).toFixed(2), z: +(center.z + R_ARC * Math.sin(a)).toFixed(2) };
  return { ...p, rotasi: face(p, center) };
}

/** 6 fakultas Kampus Ketintang — lingkar penuh, terbuka ke arah jembatan (9,75°) */
const petaKetintang = (i: number) => arc(zonaA, i, 6, 39.75);
/** 6 unit Kampus Lidah Wetan — terbuka ke arah dua jembatan (158,4°) */
const petaLidah = (i: number) => arc(zonaB, i, 6, 188.4);
/** titik di luar dua kampus utama */
const petaMagetan = { x: 39, z: 16.5, rotasi: face({ x: 39, z: 16.5 }, { x: 0, z: 0 }) };
const petaKampus3 = { x: 2, z: 23.5, rotasi: face({ x: 2, z: 23.5 }, { x: 0, z: 0 }) };
/** Pasca Sarjana kampusnya di Lidah Wetan — ujung lingkar yang sama */
const petaPasca = petaLidah(5);

/**
 * Pulau-pulau kampus di peta 3D (juga dipakai mini denah & plakat tanah).
 * `radius` = jari-jari pulau, `lebar` = lebar plakat nama (0 = tanpa plakat),
 * `plakat` = posisi plakat bila tidak di pusat pulau.
 */
export interface ZonaPeta {
  kode: string;
  label: string;
  x: number;
  z: number;
  radius: number;
  lebar: number;
  plakat?: { x: number; z: number };
}

export const ZONA: ZonaPeta[] = [
  {
    kode: "ketintang",
    label: "KAMPUS 1 · KETINTANG",
    x: zonaA.x,
    z: zonaA.z,
    radius: 15.5,
    lebar: 8,
    plakat: { x: -7.84, z: -1.34 },
  },
  {
    kode: "lidah",
    label: "KAMPUS 2 · LIDAH WETAN",
    x: zonaB.x,
    z: zonaB.z,
    radius: 15.5,
    lebar: 8,
    plakat: { x: 8.36, z: 6.58 },
  },
  { kode: "kampus3", label: "KAMPUS 3 · KEPUTIH", x: 2, z: 23.5, radius: 6.8, lebar: 5.5, plakat: { x: 2, z: 20.4 } },
  { kode: "magetan", label: "PSDKU · MAGETAN", x: 39, z: 16.5, radius: 6.4, lebar: 5.5, plakat: { x: 39, z: 13.1 } },
];

/** pasangan pulau kampus yang dihubungkan jembatan */
export const PULAU_TERHUBUNG: [string, string][] = [
  ["ketintang", "lidah"],
  ["lidah", "kampus3"],
  ["kampus3", "magetan"],
];

export const FAKULTAS: Fakultas[] = [
  {
    no: 1,
    slug: "fisipol",
    akronim: "FISIPOL",
    nama: "Fakultas Ilmu Sosial dan Ilmu Politik",
    namaPendek: "Ilmu Sosial & Politik",
    warna: "#5B7FD4",
    berdiri: "1 April 2024",
    berdiriKet: "Nama FISIPOL dipakai sejak SK Rektor No. 415/UN38/HK/2024; akarnya jauh lebih tua, dari FKIS 1964.",
    sejarah: [
      "Jejak FISIPOL dimulai tahun 1964 sebagai FKIS — Fakultas Keguruan Ilmu Sosial — salah satu fakultas pendiri IKIP Surabaya. Bersama fakultas lain, ia menemani kampus keguruan pertama di Jawa Timur ini meniti tahun-tahun awalnya.",
      "Berganti nama mengikuti kebijakan nasional: menjadi FPIPS pada 1981 (PP No. 27/1981), lalu FIS ketika IKIP Surabaya berubah menjadi UNESA pada 4 Agustus 1999 lewat Kepres No. 93 Tahun 1999.",
      "Nama FISIPOL — Fakultas Ilmu Sosial dan Ilmu Politik — resmi dipakai sejak 1 April 2024. Di balik pergantian nama itu, fakultas ini tetap ruang yang sama: tempat ilmu sosial, politik, dan kajian kemanusiaan diajarkan sejak setengah abad lalu.",
    ],
    prodiTotal: 16,
    prodi: [
      "S1 Ilmu Politik",
      "S1 Ilmu Administrasi Negara",
      "S1 Ilmu Hubungan Internasional",
      "S1 Sosiologi",
      "S1 Antropologi",
      "S1 Pendidikan IPS",
      "S1 Sains Informasi Geografi",
      "S1 Ilmu Komunikasi",
      "S2 Ilmu Politik",
      "S2 Administrasi Publik",
      "S2 Sosiologi",
      "S2 Pendidikan IPS",
      "S2 Ilmu Komunikasi",
      "S3 Pendidikan IPS",
    ],
    dekan: "Prof. Dr. Wiwik Sri Utami, M.P.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Prof. Dr. Wiwik Sri Utami, M.P." },
      { jabatan: "Wakil Dekan I", nama: "Dr. Harmanto, S.Pd., M.Pd." },
      { jabatan: "Wakil Dekan II", nama: "Dr. Indah Prabawati, S.Sos., M.Si." },
    ],
    catatanPimpinan: "Wakil Dekan III tidak ditampilkan pada kanal resmi yang diakses (belum dikonfirmasi).",
    kampus: "Kampus Ketintang (Kampus 1)",
    kampusKode: "ketintang",
    alamat: "Jl. Ketintang, Gayungan, Kota Surabaya, Jawa Timur",
    gedung: [
      { nama: "Gedung i1 – i9", ket: "Kompleks Fakultas Ilmu Sosial dan Hukum, Kampus Ketintang" },
      { nama: "Studio Televisi & Radio", ket: "Dua studio produksi untuk praktik jurnalistik dan broadcast" },
      { nama: "Auditorium FISIPOL", ket: "Ruang berskala besar untuk seminar, debat, dan pentas" },
    ],
    dayaTarik:
      "Lima belas laboratorium, dua studio siaran, satu auditorium, dan enam pusat kajian — etalase paling lengkap untuk melihat bagaimana ilmu sosial dipelajari secara praktis: dari sidang semu sampai produksi berita.",
    fakta: [
      "15 laboratorium & 2 studio siaran",
      "6 pusat kajian multidisiplin",
      "Jargon: “Pasti Melaju, Kreatif”",
      "Cikal bakal fakultas sosial tertua di UNESA (1964)",
    ],
    suara:
      "Selamat datang di Fakultas Ilmu Sosial dan Ilmu Politik, atau FISIPOL, Universitas Negeri Surabaya. Fakultas ini lahir tahun seribu sembilan ratus enam puluh empat, dan kini memiliki enam belas program studi. Selamat berkeliling!",
    foto: img("FISIPOL.jpeg"),
    peta: petaKetintang(0),
    ragamGedung: "menara",
    dimensiGedung: { w: 4.8, d: 4.6, h: 8.2 },
    sumber: ["https://fisipol.unesa.ac.id/"],
  },

  {
    no: 2,
    slug: "feb",
    akronim: "FEB",
    nama: "Fakultas Ekonomi dan Bisnis",
    namaPendek: "Ekonomi & Bisnis",
    warna: "#C9A227",
    berdiri: "16 Maret 2006",
    berdiriKet: "Berdiri sendiri sebagai Fakultas Ekonomi (FE) sejak 16 Maret 2006, berganti nama menjadi FEB pada 2021.",
    sejarah: [
      "Seperti fakultas sosial lainnya, FEB berawal dari FKIS dalam struktur awal IKIP Surabaya 1964, lalu sempat menjadi FPIPS (1977) dan FIS (1999) setelah UNESA lahir.",
      "Pada 16 Maret 2006, ilmu ekonomi resmi memisahkan diri dan berdiri sendiri sebagai Fakultas Ekonomi. Perubahan besar berikutnya terjadi pada 2021, saat nama Fakultas Ekonomi berganti menjadi Fakultas Ekonomi dan Bisnis — menandai pergeseran fokus dari ekonomi semata ke manajemen, akuntansi, dan kewirausahaan.",
    ],
    prodiTotal: 16,
    prodi: [
      "S1 Manajemen",
      "S1 Akuntansi",
      "S1 Ekonomi Pembangunan",
      "S1 Ekonomi Syariah",
      "S1 Kewirausahaan",
      "S2 Manajemen",
      "S2 Akuntansi",
      "S2 Ekonomi Pembangunan",
      "S2 Magister Akuntansi",
      "S2 Magister Manajemen",
      "S3 Manajemen",
      "S3 Akuntansi",
    ],
    dekan: "Prof. Dr. Anang Kistyanto",
    pimpinan: [
      { jabatan: "Dekan", nama: "Prof. Dr. Anang Kistyanto" },
      { jabatan: "Wakil Dekan I", nama: "Dr. H. Moch. Khoirul Anwar" },
      { jabatan: "Wakil Dekan II", nama: "Prof. Dr. Susanti" },
    ],
    catatanPimpinan: "Wakil Dekan III tidak ditampilkan pada kanal resmi yang diakses (belum dikonfirmasi).",
    kampus: "Kampus Ketintang (Kampus 1)",
    kampusKode: "ketintang",
    alamat: "Jl. Ketintang No. 2, Gayungan, Kota Surabaya, Jawa Timur",
    gedung: [
      { nama: "Gedung FEB", ket: "Ruang kelas, aula, dan kantor pimpinan di Jl. Ketintang No. 2" },
      { nama: "Galeri Investasi Bursa Efek Indonesia", ket: "Simulasi bursa saham yang dikelola mahasiswa" },
      { nama: "Ruang Diskusi & Coworking", ket: "Tempat ngobrol ide bisnis antar mahasiswa" },
    ],
    dayaTarik:
      "Galeri Investasi Bursa Efek Indonesia yang dikelola mahasiswa adalah favorit pengunjung: layar berjalan, papan harga, dan meja dealing yang biasanya hanya terlihat di gedung bursa bisa ditemui di kampus.",
    fakta: [
      "16 program studi: 9 S1, 5 S2, 2 S3",
      "Anggota AACSB — akreditasi internasional",
      "Galeri Investasi Bursa Efek Indonesia",
      "Berdiri sendiri sejak 16 Maret 2006",
    ],
    suara:
      "Selamat datang di Fakultas Ekonomi dan Bisnis, atau FEB, Universitas Negeri Surabaya. Fakultas ini berdiri sendiri sejak tahun dua ribu enam, dan mengelola enam belas program studi. Selamat menjelajah!",
    foto: img("FEB.jpeg"),
    peta: petaKetintang(1),
    ragamGedung: "kolonial",
    dimensiGedung: { w: 5.8, d: 4.8, h: 3.8 },
    sumber: ["https://feb.unesa.ac.id/"],
  },

  {
    no: 3,
    slug: "fv",
    akronim: "FV",
    nama: "Fakultas Vokasi",
    namaPendek: "Vokasi",
    warna: "#C0562F",
    berdiri: "2020",
    berdiriKet: "Terbentuk tahun 2020 dari pemisahan (demerger) program DIII Fakultas Teknik.",
    sejarah: [
      "Selama puluhan tahun, pendidikan vokasi DIII di UNESA berada di bawah naungan Fakultas Teknik. Pada 2020, program-program itu dilepas lewat kebijakan demerger dan membentuk rumah baru: Fakultas Vokasi.",
      "Langkah ini menempatkan vokasi sebagai fakultas mandiri dengan jalur karier yang jelas — D3 dan D4 (terapan) yang dirancang langsung terjun ke industri, ditambah magang ke luar negeri dan laboratorium keterampilan yang lengkap.",
    ],
    prodiTotal: 21,
    prodi: [
      "D4 Teknik Listrik",
      "D4 Teknik Mesin",
      "D4 Manajemen Informatika",
      "D4 Teknik Sipil",
      "D4 Transportasi",
      "D4 Tata Boga",
      "D4 Tata Busana",
      "D4 Kepelatihan Olahraga",
      "D4 Administrasi Negara",
      "D4 Desain Grafis",
      "D4 Teknologi Rekayasa Otomotif",
      "S2 Terapan Industri Kreatif",
      "D3 Transportasi",
      "D3 Teknik Mesin",
      "D3 Teknik Listrik",
      "D3 Tata Boga",
      "D3 Tata Busana",
      "D3 Teknik Sipil",
      "D3 Manajemen Informatika",
      "D3 Administrasi Negara",
      "D3 Desain Grafis",
    ],
    dekan: "Dr. Suprapto, S.Pd., M.T.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Dr. Suprapto, S.Pd., M.T." },
      { jabatan: "Wakil Dekan I", nama: "Reza Rahmadian, S.ST., M.T." },
      { jabatan: "Wakil Dekan II", nama: "Dr. Abdul Hafidz, S.Pd., M.Pd." },
    ],
    catatanPimpinan: "Struktur organisasi FV hanya memiliki Wakil Dekan I dan II (tanpa WD III).",
    kampus: "Kampus Ketintang (Kampus 1)",
    kampusKode: "ketintang",
    alamat: "Jl. Ketintang, Gayungan, Kota Surabaya, Jawa Timur",
    gedung: [
      { nama: "Kompleks Fakultas Vokasi", ket: "Bengkel, studio tata boga, dan kelas terapan" },
      { nama: "Bengkel Otomotif & Elektrikal", ket: "Ruang praktik mesin, kendaraan, dan kelistrikan" },
      { nama: "Disability Corner Ketintang", ket: "Pusat layanan inklusi PUID di kawasan Ketintang" },
    ],
    dayaTarik:
      "Satu-satunya tempat di kampus di mana kamu bisa melihat mahasiswa menjahit busana, memasak di dapur perhotelan, dan merakit panel listrik dalam satu kunjungan. Ditambah kerja sama magang ke perusahaan Jepang serta inovasi kakao “Rumah Coklat Bodag”.",
    fakta: [
      "21 program studi (11 D4, 9 D3, 1 S2 Terapan)",
      "Jargon: “Rumah Para Juara”",
      "Pusat pembinaan Petanque Jawa Timur",
      "Layanan digital SILVI (e-letter, e-complaint)",
    ],
    suara:
      "Selamat datang di Fakultas Vokasi, Universitas Negeri Surabaya. Fakultas ini berdiri sejak tahun dua ribu dua puluh, dan menaungi dua puluh satu program studi terapan. Selamat menyaksikan!",
    foto: img("FV.jpeg"),
    peta: petaKetintang(2),
    ragamGedung: "industri",
    dimensiGedung: { w: 6.0, d: 5.2, h: 3.2 },
    sumber: ["https://vokasi.unesa.ac.id/", "https://ft.unesa.ac.id/"],
  },

  {
    no: 4,
    slug: "fh",
    akronim: "FH",
    nama: "Fakultas Hukum",
    namaPendek: "Hukum",
    warna: "#7C6BC4",
    berdiri: "2009 (prodi) · Fakultas mandiri pasca-2019",
    berdiriKet: "Izin prodi S1 Ilmu Hukum terbit 13 Maret 2009 (SK Dirjen Dikti No. 366/D/T/2009); Jurusan Hukum dibentuk di FISH pada 2016.",
    sejarah: [
      "Sejarah FH dimulai bukan dari fakultas, melainkan dari izin program studi: 13 Maret 2009, SK Dirjen Dikti No. 366/D/T/2009 mengizinkan penyelenggaraan S1 Ilmu Hukum di bawah Jurusan PMPKN.",
      "Pada 2016 Jurusan Hukum resmi dibentuk di lingkungan Fakultas Ilmu Sosial dan Hukum (FISH). Usulan pendirian fakultas mandiri diajukan sejak 2018, sempat tertahan kebijakan moratorium pendirian fakultas baru pada 2019, lalu menjadi Fakultas Hukum seperti hari ini.",
    ],
    prodiTotal: 2,
    prodi: ["S1 Ilmu Hukum", "S1 Ilmu Hukum (International Undergraduate Program)", "S2 Hukum"],
    dekan: "Arinto Nugroho, S.H., S.Pd., M.H.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Arinto Nugroho, S.H., S.Pd., M.H." },
      {
        jabatan: "Wakil Dekan I",
        nama: "Muh. Ali Masnun, S.H., M.H. (Pembelajaran, Penelitian, Pengabdian, Kemahasiswaan)",
      },
      { jabatan: "Wakil Dekan II", nama: "Dr. Hananto Widodo, S.H., M.H. (Perencanaan, Keuangan, Umum)" },
    ],
    catatanPimpinan: "Wakil Dekan III tidak ditampilkan pada kanal resmi yang diakses (belum dikonfirmasi).",
    kampus: "Kampus Ketintang (Kampus 1)",
    kampusKode: "ketintang",
    alamat: "Jl. Ketintang, Ketintang, Gayungan, Kota Surabaya, Jawa Timur 60231",
    gedung: [
      { nama: "Gedung FH", ket: "Kelas, ruang pimpinan, dan perpustakaan fakultas" },
      { nama: "Laboratorium Peradilan Semu (Moot Court)", ket: "Ruang sidang tiruan lengkap dengan toga dan palu" },
      { nama: "ULBH", ket: "Unit Layanan dan Bantuan Hukum — konsultasi hukum gratis untuk masyarakat" },
      { nama: "Auditorium FH", ket: "Moot court competition, seminar, dan diskusi hukum" },
    ],
    dayaTarik:
      "Laboratorium Peradilan Semu-nya adalah pemandangan paling dramatis: ruang sidang dengan mimbar hakim, kursi terdakwa, dan pagar pembatas — persis seperti pengadilan sungguhan, tempat mahasiswa berlatih beracara.",
    fakta: [
      "Hanya 2 prodi: S1 dan S2 Hukum",
      "Laboratorium Peradilan Semu (Moot Court)",
      "ULBH: bantuan hukum untuk masyarakat",
      "Menyiapkan UNESA Law Firm & akreditasi internasional S2",
    ],
    suara:
      "Selamat datang di Fakultas Hukum, Universitas Negeri Surabaya. Program studi pertamanya berdiri tahun dua ribu sembilan. Selamat menelusuri ruang peradilan semu kami!",
    foto: img("FH.jpeg"),
    peta: petaKetintang(3),
    ragamGedung: "kolonial",
    dimensiGedung: { w: 5.8, d: 4.6, h: 3.6 },
    sumber: ["https://fh.unesa.ac.id/", "https://fh.unesa.ac.id/page/sejarah-jurusan-hukum"],
  },

  {
    no: 5,
    slug: "fmipa",
    akronim: "FMIPA",
    nama: "Fakultas Matematika dan Ilmu Pengetahuan Alam",
    namaPendek: "Matematika & IPA",
    warna: "#2F8675",
    berdiri: "1964 (FKIE) · 1981 (FPMIPA) · 1999 (FMIPA)",
    berdiriKet: "Cikal bakal FKIE lahir 19 Desember 1964; menjadi FPMIPA pada 1981 dan FMIPA setelah UNESA lahir 1999.",
    sejarah: [
      "Embrio FMIPA jauh lebih tua dari kampusnya sendiri: sekitar 1950-an telah ada kursus B-I dan B-II Ilmu Kimia serta Ilmu Pasti di Surabaya. Kursus itulah benih ilmu eksakta di kota ini.",
      "19 Desember 1964, IKIP Surabaya berdiri sendiri dengan lima fakultas — satu di antaranya FKIE, Fakultas Keguruan Ilmu Eksakta. PP No. 27 Tahun 1981 mengubahnya menjadi FPMIPA dengan empat jurusan; laboratorium di Ketintang mulai dipakai tahun 1986.",
      "Setelah Kepres No. 93/1999, FPMIPA berubah menjadi FMIPA. Hari ini ia dikenal sebagai “Kampus Konservasi” dengan program edu-ecopreneurship yang memadukan sains dan pelestarian lingkungan.",
    ],
    prodiTotal: 23,
    prodi: [
      "S1 Pendidikan Matematika",
      "S1 Matematika",
      "S1 Pendidikan Fisika",
      "S1 Fisika",
      "S1 Pendidikan Kimia",
      "S1 Kimia",
      "S1 Pendidikan Biologi",
      "S1 Biologi",
      "S1 Pendidikan IPA",
      "S1 Sains Data",
      "S1 Sains Aktuaria",
      "S1 Kecerdasan Artifisial",
      "S1 Geofisika",
      "S2 Matematika",
      "S2 Fisika",
      "S2 Kimia",
      "S2 Biologi",
      "S2 Pendidikan Biologi",
      "S3 Pendidikan Matematika",
      "S3 Pendidikan Sains",
    ],
    dekan: "Prof. Dr. Wasis, M.Si.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Prof. Dr. Wasis, M.Si." },
      { jabatan: "Wakil Dekan I", nama: "Prof. Dr. Fida Rachmadiarti, M.Kes." },
      { jabatan: "Wakil Dekan II", nama: "Dr. Dian Novita" },
    ],
    catatanPimpinan: "Periode jabatan 2023–2027. Wakil Dekan III tidak ditampilkan pada kanal resmi (belum dikonfirmasi).",
    kampus: "Kampus Ketintang (Kampus 1)",
    kampusKode: "ketintang",
    alamat: "Gedung D1, Jl. Ketintang, Kota Surabaya, Jawa Timur 60231",
    gedung: [
      { nama: "Gedung D1", ket: "Kantor pimpinan dan ruang kuliah FMIPA" },
      { nama: "Laboratorium Terpadu", ket: "Fisika, kimia, dan biologi dalam satu bangunan" },
      { nama: "Eco Campus & Botanical Clearinghouse", ket: "Akuarium, akuaponik, eco-enzyme, dan konservasi tanaman" },
      { nama: "Unit Laboratorium Pembelajaran (ULAKOM)", ket: "Ruang praktikum pembelajaran IPA" },
    ],
    dayaTarik:
      "Kampus konservasi: ada kebun botani, akuarium dan sistem akuaponik, sampai dapur eco-enzyme. Di sini sains tidak berhenti di buku — terlihat dari teras kampus yang tumbuh dan berubah setiap semester.",
    fakta: [
      "23 program studi: 13 S1, 8 S2, 2 S3",
      "Eco Campus: akuaponik & eco-enzyme",
      "Botanical Clearinghouse UNESA",
      "Rengganis Robot Club & P4MRI",
      "Jargon: “Kampus Konservasi, Tangguh Berprestasi”",
    ],
    suara:
      "Selamat datang di Fakultas Matematika dan Ilmu Pengetahuan Alam, FMIPA, Universitas Negeri Surabaya. Dengan dua puluh tiga program studi, ini adalah fakultas dengan prodi terbanyak di kampus. Selamat berkeliling!",
    foto: img("FMIPA.jpeg"),
    peta: petaKetintang(4),
    ragamGedung: "riset",
    dimensiGedung: { w: 5.4, d: 5.0, h: 4.4 },
    sumber: ["https://fmipa.unesa.ac.id/", "https://fmipa.unesa.ac.id/2026/01/selayang-pandang/"],
  },

  {
    no: 6,
    slug: "ft",
    akronim: "FT",
    nama: "Fakultas Teknik",
    namaPendek: "Teknik",
    warna: "#D98034",
    berdiri: "1964 (FKIT)",
    berdiriKet: "Berdiri sebagai FKIT pada 1964, menjadi FPTK (1979/1981), lalu Fakultas Teknik sejak 1999.",
    sejarah: [
      "FT lahir bersama IKIP Surabaya pada 1964 dengan nama FKIT — Fakultas Keguruan Ilmu Teknik. PP No. 27/1981 mengubahnya menjadi FPTK (Fakultas Pendidikan Teknik dan Kejuruan).",
      "Kepres No. 93 Tahun 1999 membawanya menjadi Fakultas Teknik dalam keadaan universitas. Pada 2020 program DIII “demerger” keluar dan digabungkan ke Fakultas Vokasi, menyisakan FT sebagai rumah ilmu rekayasa S1 hingga S3.",
    ],
    prodiTotal: 17,
    prodi: [
      "S1 Teknik Informatika",
      "S1 Teknik Komputer",
      "S1 Teknik Elektro",
      "S1 Teknik Mesin",
      "S1 Teknik Sipil",
      "S1 Teknik Lingkungan",
      "S1 Teknik Industri",
      "S1 Teknik Arsitektur",
      "S1 Pendidikan Teknik Mesin",
      "S1 Pendidikan Teknik Elektro",
      "S1 Pendidikan Teknik Sipil",
      "S1 Pariwisata",
      "S1 Pertambangan",
      "S1 Metalurgi",
      "S2 Teknik Sipil",
      "S2 Teknik Elektro",
      "S3 Teknik Elektro dan Informatika",
    ],
    dekan: "Prof. Dr. Suparji, S.Pd., M.Pd.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Prof. Dr. Suparji, S.Pd., M.Pd." },
      { jabatan: "Wakil Dekan I", nama: "Prof. Dr. Agus Wiyono" },
      { jabatan: "Wakil Dekan II", nama: "Aries Dwi Indriyanti" },
    ],
    catatanPimpinan:
      "Wakil Dekan III tidak ditampilkan pada kanal resmi. Rincian jumlah prodi perlu dicocokkan dengan menu resmi halaman FT (antara 15–17 prodi).",
    kampus: "Kampus Ketintang (Kampus 1)",
    kampusKode: "ketintang",
    alamat: "Gedung E1, Jl. Ketintang, Kota Surabaya, Jawa Timur",
    gedung: [
      { nama: "Gedung E1", ket: "Kantor pimpinan dan ruang kuliah utama FT" },
      { nama: "Bengkel & Workshop Teknik", ket: "Mesin, listrik, dan fabrikasi untuk praktikum" },
      { nama: "Laboratorium Komputer & Robotik", ket: "Basis kerja tim robotik Dewa Robotic" },
      { nama: "Gedung Arsitektur & Studio Desain", ket: "Studio model dan meja gambar" },
    ],
    dayaTarik:
      "Hari kerja biasa bisa berubah jadi pemandangan menarik: robot merayap di lantai bengkel, mobil hemat energi Garnesa Racing Team disetel di sudut lorong, dan prototipe UI/UX dipajang di studio desain.",
    fakta: [
      "Tim robotik “Dewa Robotic”",
      "Garnesa Racing Team (kompetisi KMHE)",
      "GAYATAMA — komunitas desain UI/UX",
      "S1 Pariwisata, Pertambangan, dan Metalurgi",
    ],
    suara:
      "Selamat datang di Fakultas Teknik, Universitas Negeri Surabaya. Fakultas ini berdiri bersama kampus sejak tahun seribu sembilan ratus enam puluh empat. Selamat melihat-lihat bengkel dan studio kami!",
    foto: img("FT.PNG"),
    peta: petaKetintang(5),
    ragamGedung: "industri",
    dimensiGedung: { w: 6.0, d: 5.0, h: 3.4 },
    sumber: ["https://ft.unesa.ac.id/"],
  },

  {
    no: 7,
    slug: "fip",
    akronim: "FIP",
    nama: "Fakultas Ilmu Pendidikan",
    namaPendek: "Ilmu Pendidikan",
    warna: "#4E9AC7",
    berdiri: "1964",
    berdiriKet: "Didirikan sebagai cikal bakal IKIP di Kampus Pecindilan (1964), pindah ke Lidah Wetan pada 1994.",
    sejarah: [
      "FIP adalah salah satu pendiri IKIP Surabaya. Ia lahir tahun 1964 di Kampus Pecindilan, kawasan tengah Kota Surabaya, bersama fakultas keguruan lain.",
      "Seiring pertumbuhan kampus, FIP pindah ke Kampus Lidah Wetan pada 1994. Di sinilah fakultas terbesar dalam urusan pendidikan ini berkembang: ilmu pendidikan, bimbingan konseling, teknologi pendidikan, sampai pendidikan luar biasa.",
    ],
    prodiTotal: 16,
    prodi: [
      "S1 Pendidikan Guru Sekolah Dasar",
      "S1 Pendidikan Anak Usia Dini",
      "S1 Bimbingan dan Konseling",
      "S1 Pendidikan Luar Sekolah",
      "S1 Pendidikan Luar Biasa",
      "S1 Teknologi Pendidikan",
      "S1 Manajemen Pendidikan",
      "S1 Pendidikan Dasar",
      "S2 Manajemen Pendidikan",
      "S2 Teknologi Pendidikan",
      "S2 Bimbingan dan Konseling",
      "S2 Pendidikan Dasar",
      "S2 Pendidikan Luar Sekolah",
      "S2 Pendidikan Luar Biasa",
      "S3 Manajemen Pendidikan",
      "S3 Teknologi Pendidikan",
    ],
    dekan: "Prof. Dr. Mochamad Nursalim, M.Pd.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Prof. Dr. Mochamad Nursalim, M.Pd." },
      { jabatan: "Wakil Dekan Bidang Akademik", nama: "Prof. Dr. Budi Purwoko, M.Pd." },
      { jabatan: "Wakil Dekan Bidang Umum dan Keuangan", nama: "Prof. Dr. Andi Kristanto, M.Pd." },
    ],
    catatanPimpinan: "Wakil Dekan III (Kemahasiswaan) tidak dikonfirmasi di kanal resmi yang diakses.",
    kampus: "Kampus Lidah Wetan (Kampus 2)",
    kampusKode: "lidah",
    alamat: "Jl. Lidah Wetan, Lakarsantri, Kota Surabaya, Jawa Timur",
    gedung: [
      { nama: "Kompleks FIP Lidah Wetan", ket: "Gedung perkuliahan dan kantor pimpinan fakultas" },
      { nama: "Day Care FIP", ket: "Tempat praktik pendidikan anak usia dini sekaligus layanan anak" },
      { nama: "Laboratorium Bimbingan Konseling", ket: "Ruang konseling latihan dengan one-way mirror" },
      { nama: "Ruang Teknologi Pendidikan", ket: "Studio media pembelajaran dan produksi konten" },
    ],
    dayaTarik:
      "FIP adalah fakultas dengan jumlah program studi pendidikan terbanyak, dan punya Day Care — taman kanak-kanak kecil yang jadi tempat praktik mahasiswa PGPAUD. Suasana kampus di sini terasa paling “sekolah”.",
    fakta: [
      "16 program studi S1–S3",
      "Day Care untuk praktik PAUD",
      "Bermigrasi dari Kampus Pecindilan ke Lidah Wetan (1994)",
      "Pusat layanan bimbingan konseling (GLBK/ULABK)",
    ],
    suara:
      "Selamat datang di Fakultas Ilmu Pendidikan, Universitas Negeri Surabaya. Fakultas ini berdiri sejak tahun seribu sembilan ratus enam puluh empat dan kini berada di Kampus Lidah Wetan. Selamat berkeliling!",
    foto: img("FIP.jpeg"),
    peta: petaLidah(0),
    ragamGedung: "joglo",
    dimensiGedung: { w: 5.4, d: 4.6, h: 3.2 },
    sumber: ["https://fip.unesa.ac.id/"],
  },

  {
    no: 8,
    slug: "fbs",
    akronim: "FBS",
    nama: "Fakultas Bahasa dan Seni",
    namaPendek: "Bahasa & Seni",
    warna: "#C25E7A",
    berdiri: "1964 (FKSS)",
    berdiriKet: "Salah satu dari lima fakultas pendiri IKIP Surabaya; namanya berubah FPBS (1981) lalu FBS (1999).",
    sejarah: [
      "Tanggal 19 Desember 1964, IKIP Surabaya resmi berdiri dengan lima fakultas — satu di antaranya Fakultas Keguruan Sastra dan Seni (FKSS). Dari sanalah FBS lahir, bersama FIP, FKPS, FKIE, dan FKT.",
      "PP No. 27 Tahun 1981 mengubahnya menjadi Fakultas Pendidikan Bahasa dan Seni (FPBS), sebelum SK Presiden No. 93 Tahun 1999 menetapkannya sebagai Fakultas Bahasa dan Seni (FBS) saat IKIP Surabaya melebarkan mandat menjadi UNESA.",
      "Hari ini FBS menempati kawasan yang oleh situs resminya disebut “Kawasan Berseni” — deretan gedung T1 sampai T14 di Kampus Lidah Wetan yang penuh studio, ruang gambar, dan ruang latihan seni.",
    ],
    prodiTotal: 22,
    prodi: [
      "S1 Pendidikan Bahasa dan Sastra Indonesia",
      "S1 Sastra Indonesia",
      "S1 Pendidikan Bahasa Inggris",
      "S1 Sastra Inggris",
      "S1 Pendidikan Bahasa Jerman",
      "S1 Sastra Jerman",
      "S1 Pendidikan Bahasa Jepang",
      "S1 Pendidikan Bahasa Mandarin",
      "S1 Pendidikan Bahasa dan Sastra Jawa",
      "S1 Pendidikan Seni Rupa",
      "S1 Seni Rupa Murni",
      "S1 Pendidikan Seni Drama, Tari, dan Musik",
      "S1 Musik",
      "S1 Desain Komunikasi Visual",
      "S1 Film dan Animasi",
      "S2 Pendidikan Bahasa dan Sastra",
      "S2 Pendidikan Bahasa Inggris",
      "S2 Pendidikan Seni Budaya",
      "S3 Pendidikan Bahasa dan Sastra",
      "S3 Pendidikan Seni",
    ],
    dekan: "Syafi'ul Anam, Ph.D.",
    pimpinan: [
      { jabatan: "Dekan (2022–2026)", nama: "Syafi'ul Anam, Ph.D." },
      { jabatan: "Wakil Dekan I (Akademik)", nama: "Prof. Dr. Anas Ahmadi, M.Pd." },
      { jabatan: "Wakil Dekan II", nama: "Didik Nurhadi, Ph.D." },
    ],
    catatanPimpinan:
      "Struktur resmi FBS hanya menampilkan Dekan, WD Bidang I, dan WD Bidang II (WD III belum dikonfirmasi).",
    kampus: "Kampus Lidah Wetan (Kampus 2)",
    kampusKode: "lidah",
    alamat: "Jl. Lidah Wetan, Lakarsantri, Kota Surabaya, Jawa Timur 60213",
    gedung: [
      { nama: "Gedung T1 – T14", ket: "Ruang kuliah, studio, dan kantor fakultas" },
      { nama: "Auditorium FBS (T14 Lt. 4)", ket: "Pentas, konferensi, dan acara berskala besar" },
      { nama: "Studio Seni Rupa", ket: "Ruang melukis dan pameran karya mahasiswa" },
      { nama: "Studio Sendratasik", ket: "Latihan drama, tari, dan musik" },
      { nama: "Studio Microteaching & Desain", ket: "Praktik mengajar dan produksi karya visual" },
    ],
    dayaTarik:
      "Kawasan paling “berisik seni” di kampus: suara gamelan dari studio sendratasik bercampur dengan latihan vokal, dinding studio seni rupa dipenuhi kanvas, dan tiap akhir pekan ada saja pameran atau pentas kecil.",
    fakta: [
      "22 program studi: 15 S1, 4 S2, 3 S3",
      "Ada prodi Sastra Jerman, Jepang, dan Mandarin",
      "Svara Pertiwi Ensemble — Juara 2 Osaka International Music Competition 2026",
      "Kanal BIPA (Bahasa Indonesia untuk penutur asing) & LSP",
      "Identitas resmi: “Kawasan Berseni”",
    ],
    suara:
      "Selamat datang di Fakultas Bahasa dan Seni, FBS, Universitas Negeri Surabaya. Fakultas ini lahir tahun seribu sembilan ratus enam puluh empat dan mengelola dua puluh dua program studi. Selamat menikmati kawasan berseni kami!",
    foto: img("FBS.jpeg"),
    peta: petaLidah(1),
    ragamGedung: "joglo",
    dimensiGedung: { w: 5.4, d: 4.8, h: 3.4 },
    sumber: ["https://fbs.unesa.ac.id/", "https://fbs.unesa.ac.id/page/sejarah"],
  },

  {
    no: 9,
    slug: "fikk",
    akronim: "FIKK",
    nama: "Fakultas Ilmu Keolahragaan dan Kesehatan",
    namaPendek: "Keolahragaan & Kesehatan",
    warna: "#5FBF6B",
    berdiri: "1963 (STO) · 1977 (FKIK)",
    berdiriKet: "Berawal dari Sekolah Tinggi Olahraga 1963, masuk IKIP Surabaya 29 Maret 1977, dan berganti nama jadi FIKK pada 25 Januari 2023.",
    sejarah: [
      "Sejarah FIKK lebih tua dari UNESA sendiri: tahun 1963 berdiri Sekolah Tinggi Olahraga (STO) yang berakar dari kursus B-1 di Bandung tahun 1951. Pada 29 Maret 1977 STO diintegrasikan ke IKIP Surabaya menjadi FKIK.",
      "Selama tiga dekade kampus ini menempati gedung di Jl. Kawung Surabaya, sebelum kegiatan belajar-mengajar pindah ke Kampus Lidah Wetan pada 1996. Pada 1999 namanya menjadi Fakultas Ilmu Keolahragaan (FIK), lalu FIO (Fakultas Ilmu Olahraga) pada 2018.",
      "SK Rektor No. 195/UN38/HK/KL/2023 menetapkan nama Fakultas Ilmu Keolahragaan dan Kesehatan (FIKK) pada 25 Januari 2023, sekaligus membawa prodi S1 Gizi yang sebelumnya berada di Fakultas Teknik.",
    ],
    prodiTotal: 11,
    prodi: [
      "S1 Pendidikan Jasmani, Kesehatan dan Rekreasi",
      "S1 Pendidikan Kepelatihan Olahraga",
      "S1 Ilmu Keolahragaan",
      "S1 Ilmu Gizi",
      "S1 Manajemen Olahraga",
      "S1 Masase",
      "S2 Pendidikan Olahraga",
      "S2 Ilmu Keolahragaan",
      "S2 Manajemen Olahraga",
      "S3 Ilmu Keolahragaan",
      "S3 Pendidikan Jasmani",
    ],
    dekan: "Dr. Irmantara Subagio, M.Kes.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Dr. Irmantara Subagio, M.Kes." },
      { jabatan: "Wakil Dekan I", nama: "Prof. Dr. Or. Gigih Siantoro, S.Pd., M.Pd." },
      { jabatan: "Wakil Dekan II", nama: "Dr. Taufiq Hidayat, S.Pd., M.Kes." },
    ],
    catatanPimpinan:
      "Situs resmi menyebut 11 prodi; laman Admisi memuat tambahan S2 Kepelatihan Olahraga & PJJ (12–13 prodi) — perlu verifikasi ulang. WD III tidak dicantumkan.",
    kampus: "Kampus Lidah Wetan (Kampus 2)",
    kampusKode: "lidah",
    alamat: "Jl. Lidah Wetan, Lakarsantri, Kota Surabaya, Jawa Timur 60213",
    gedung: [
      { nama: "Gedung U2", ket: "Ruang kuliah dan kantor pimpinan FIKK" },
      { nama: "Kolam Renang Standar Internasional", ket: "Kolam latihan renang bersertifikat" },
      { nama: "Lintasan Atletik “Oentoeng Poedjadi”", ket: "Track and field standar internasional" },
      { nama: "International Futsal Stadium", ket: "Stadion futsal indoor + lapangan tenis, bola voli, basket" },
      { nama: "Lapangan Berkuda & Petanque", ket: "Fasilitas olahraga khusus yang jarang ada di kampus lain" },
      { nama: "Laboratorium Spa dan Masase", ket: "Satu-satunya lab masase di lingkungan perguruan tinggi" },
    ],
    dayaTarik:
      "Taman bermain terbesar di UNESA: kolam renang standar internasional, lintasan atletik, stadion futsal, lapangan berkuda, sampai laboratorium spa dan masase. Kalau beruntung, kamu tiba saat latihan tim atletik di lintasan “Oentoeng Poedjadi”.",
    fakta: [
      "Akreditasi AQAS 2022–2028",
      "Juara Umum LPTK Cup 2025",
      "Lintasan atletik & kolam renang standar internasional",
      "Lab spa dan masase — langka di kampus",
      "Menerima mahasiswa internasional & bekerja sama dengan Shanghai University",
    ],
    suara:
      "Selamat datang di Fakultas Ilmu Keolahragaan dan Kesehatan, FIKK, Universitas Negeri Surabaya. Fakultas ini berawal dari Sekolah Tinggi Olahraga tahun seribu sembilan ratus enam puluh tiga. Selamat menyaksikan latihan kami!",
    foto: img("FIKK.jpeg"),
    peta: petaLidah(2),
    ragamGedung: "olahraga",
    dimensiGedung: { w: 6.2, d: 5.6, h: 4.2 },
    sumber: ["https://fikk.unesa.ac.id/page/sejarah", "https://fikk.unesa.ac.id/page/laboratorium"],
  },

  {
    no: 10,
    slug: "fpsi",
    akronim: "FPSI",
    nama: "Fakultas Psikologi",
    namaPendek: "Psikologi",
    warna: "#A665C1",
    berdiri: "27 Januari 2007",
    berdiriKet: "Prodi Psikologi berdiri di bawah FIP (2007), menjadi Fakultas Psikologi dan Pendidikan (2017), lalu Fakultas Psikologi.",
    sejarah: [
      "Psikologi di UNESA dimulai sebagai program studi di bawah Fakultas Ilmu Pendidikan: izin Dirjen Dikti No. 172/DT/2007 tertanggal 29 Januari 2007 untuk penyelenggaraan S1 Psikologi.",
      "Pada 2017 program studi ini bertransformasi menjadi Fakultas Psikologi dan Pendidikan (FPPsi), yang kemudian disempurnakan menjadi Fakultas Psikologi seutuhnya. S2 Psikologi menyusul dibuka sekitar 2024.",
      "Tonggak terbaru: gedung baru tujuh lantai diresmikan 2 Juli 2024 di sisi barat Lab Merdeka Belajar Kampus 2 — rumah bagi laboratorium dan assessment center yang selama ini hanya ada di kampus-kampus besar.",
    ],
    prodiTotal: 2,
    prodi: ["S1 Psikologi", "S2 Psikologi"],
    dekan: "Dr. Diana Rahmasari, S.Psi., M.Si., Psikolog",
    pimpinan: [
      { jabatan: "Dekan", nama: "Dr. Diana Rahmasari, S.Psi., M.Si., Psikolog" },
      { jabatan: "Wakil Dekan Akademik", nama: "Dr. Olievia Prabandini Mulyana, S.Psi., M.Psi., Psikolog" },
      { jabatan: "Wakil Dekan Umum dan Keuangan", nama: "Onny Fransinata Anggara, M.Psi., Psikolog" },
    ],
    catatanPimpinan:
      "WD III tidak dicantumkan di halaman resmi (belum dikonfirmasi). Sumber resmi cukup: Sejarah menyebut 2007, Selayang Pandang menyebut 1999.",
    kampus: "Kampus Lidah Wetan (Kampus 2)",
    kampusKode: "lidah",
    alamat: "Jl. Lidah Wetan, Lakarsantri, Kota Surabaya, Jawa Timur 60213",
    gedung: [
      { nama: "Gedung Baru FPsi (7 lantai)", ket: "Diresmikan 2 Juli 2024, di sisi barat Labmer" },
      { nama: "Gedung Q1", ket: "Integrated Sports Psychology Building — menampung Sekolah Pascasarjana di Lt. 2" },
      { nama: "Assessment Center", ket: "Layanan asesmen di bawah Quality of Life Center UNESA" },
      { nama: "Co-Working Space Outdoor", ket: "Ruang kerja terbuka yang baru diresmikan" },
    ],
    dayaTarik:
      "Gedung tujuh lantai berisi laboratorium Tumbuh Kembang Anak, Ruang Relaksasi, tiga smart class, sampai Laboratorium Psikologi Olahraga. Tiap Oktober ada Bulan Kesehatan Mental yang berpuncak di Graha Sawunggaling, plus layanan konseling terbuka untuk publik.",
    fakta: [
      "Hanya 2 prodi: S1 (Unggul) dan S2",
      "Gedung baru 7 lantai diresmikan 2 Juli 2024",
      "Assessment Center — satu dari sedikit di Indonesia",
      "Selalu masuk 3 fakultas paling diminati di UNESA",
      "Layanan konseling gratis di Taman Bungkul",
    ],
    suara:
      "Selamat datang di Fakultas Psikologi, Universitas Negeri Surabaya. Program studinya berdiri tahun dua ribu tujuh, dan kini menempati gedung tujuh lantai yang baru. Selamat menjelajah!",
    foto: img("FPSI.png"),
    peta: petaLidah(3),
    ragamGedung: "minimalis",
    dimensiGedung: { w: 5.6, d: 4.4, h: 4.8 },
    sumber: ["https://psikologi.unesa.ac.id/page/sejarah", "https://psikologi.unesa.ac.id/page/struktur-organisasi"],
  },

  {
    no: 11,
    slug: "fk",
    akronim: "FK",
    nama: "Fakultas Kedokteran",
    namaPendek: "Kedokteran",
    warna: "#D8554F",
    berdiri: "2023",
    berdiriKet: "Dibuka lewat SK Rektor No. 700/UN.38/HK/KL/2023 — fakultas termuda UNESA bersama FKP.",
    sejarah: [
      "Pendirian fakultas ini melewati jalur yang panjang: rekomendasi Kementerian Kesehatan, visitasi Konsil Kedokteran Indonesia, hingga rekomendasi LAM-PTKes. UNESA juga menggandeng Universitas Jember untuk mematangkan persiapan.",
      "Pada 2023 UNESA resmi membuka Fakultas Kedokteran dengan S1 Kedokteran dan Pendidikan Profesi Dokter. Setahun kemudian, 2024, tiga prodi bertambah: Fisioterapi, Keperawatan, dan Kebidanan.",
      "Pada 2025 fakultas ini menyiapkan S1 Kedokteran Gigi dan Pendidikan Profesi Dokter Gigi. Yang membedakan dari kampus lain: muatan kedokteran olahraga di hampir seluruh prodi — karakter UNESA yang keolahragaan.",
    ],
    prodiTotal: 9,
    prodi: [
      "S1 Kedokteran",
      "S1 Kedokteran Gigi",
      "S1 Fisioterapi",
      "S1 Keperawatan",
      "S1 Kebidanan",
      "Pendidikan Profesi Dokter",
      "Pendidikan Profesi Dokter Gigi",
      "Pendidikan Profesi Ners",
      "Pendidikan Profesi Bidan",
    ],
    dekan: "Dr. dr. Endang Sri Wahjuni, M.Kes.",
    pimpinan: [
      { jabatan: "Dekan", nama: "Dr. dr. Endang Sri Wahjuni, M.Kes." },
      { jabatan: "Wakil Dekan I", nama: "dr. Febrita Ardianingsih, M.Si." },
      { jabatan: "Wakil Dekan II", nama: "dr. Nur Shanti Retno Pembayun, M.Or." },
    ],
    catatanPimpinan: "Wakil Dekan III tidak muncul di struktur resmi (belum dikonfirmasi).",
    kampus: "Kampus Lidah Wetan (Kampus 2)",
    kampusKode: "lidah",
    alamat: "Jl. Lidah Wetan, Lakarsantri, Kota Surabaya, Jawa Timur 60213",
    gedung: [
      { nama: "Kompleks FK Kampus 2", ket: "Ruang kuliah, ruang keterampilan klinik, dan kantor pimpinan" },
      { nama: "Auditorium FK", ket: "Tempat visitasi LAM-PTKes dan kegiatan fakultas" },
      { nama: "Ruang Keterampilan Klinik & Blok", ket: "Pembelajaran sistem blok — satu mata kuliah tuntas dalam 6 minggu" },
    ],
    dayaTarik:
      "Fakultas termuda yang paling cepat berkembang: dari 2 prodi jadi 9 dalam tiga tahun. Kuncinya adalah kedokteran olahraga — fisioterapi prestasi, sportdentistry, dan keperawatan keolahragaan yang jarang ditemui di fakultas kedokteran lain.",
    fakta: [
      "Dibuka 2023, kini 9 prodi (5 S1 + 4 profesi)",
      "UNESA: PTN pertama di Jawa Timur dengan S1 Fisioterapi",
      "98 dosen bergelar magister, doktor, dan spesialis",
      "Pembelajaran sistem blok (6 minggu per mata kuliah)",
      "Agenda rutin: Open House “One Fine Day” & UNESA MedicRun",
    ],
    suara:
      "Selamat datang di Fakultas Kedokteran, Universitas Negeri Surabaya. Fakultas ini dibuka tahun dua ribu dua puluh tiga dan kini menaungi sembilan program studi. Selamat berkeliling!",
    foto: img("FK.jpeg"),
    peta: petaLidah(4),
    ragamGedung: "medis",
    dimensiGedung: { w: 5.4, d: 5.0, h: 6.6 },
    sumber: ["https://fk.unesa.ac.id/", "https://fk.unesa.ac.id/page/akreditasi"],
  },

  {
    no: 12,
    slug: "psdku-magetan",
    akronim: "PSDKU",
    nama: "Kampus UNESA 5 — PSDKU Magetan",
    namaPendek: "PSDKU Magetan",
    warna: "#4FB3C9",
    berdiri: "2021 (hibah tanah) · 2025 (16 prodi)",
    berdiriKet: "PSDKU = Program Studi di Luar Kampus Utama. Lahan dihibahkan Pemkab Magetan 20 November 2021.",
    sejarah: [
      "PSDKU bukan kampus terpisah, melainkan Program Studi di Luar Kampus Utama UNESA — kini bernama Kampus UNESA 5 Magetan. Mahasiswa tetap tercatat sebagai mahasiswa Universitas Negeri Surabaya.",
      "Segalanya dimulai dari niat baik daerah: 20 November 2021 Pemerintah Kabupaten Magetan menghibahkan tanah seluas 13,5 hektar kepada UNESA, diikat dalam Naskah Hibah No. 028/29/NH/403.013/2021.",
      "PP No. 37 Tahun 2022 yang menetapkan UNESA sebagai PTN Badan Hukum membuka jalan bagi pengembangan pesat. Jumlah prodi melompat dari 9 menjadi 16 pada 2025, dan 6 Oktober 2026 groundbreaking gedung kuliah baru dilakukan Rektor UNESA bersama Sekda Kabupaten Magetan.",
    ],
    prodiTotal: 16,
    prodi: [
      "S1 Pendidikan Guru Sekolah Dasar",
      "S1 Pendidikan Jasmani, Kesehatan dan Rekreasi",
      "S1 Ilmu Hukum",
      "S1 Ilmu Komunikasi",
      "S1 Ilmu Manajemen",
      "S1 Pendidikan Matematika",
      "S1 Sastra Inggris",
      "S1 Pendidikan Tata Rias",
      "S1 Informatika",
      "S1 Pendidikan Guru PAUD",
      "S1 Teknologi Pendidikan",
      "S1 Bimbingan dan Konseling",
      "S1 Pendidikan Kepelatihan Olahraga",
      "S1 Pendidikan Bahasa dan Sastra Indonesia",
      "S1 Ilmu Administrasi Negara",
      "S1 Akuntansi",
    ],
    dekan: "Prof. Dr. Sarmini, M.Hum. (Direktur)",
    pimpinan: [
      { jabatan: "Direktur", nama: "Prof. Dr. Sarmini, M.Hum." },
      { jabatan: "Wakil Direktur I", nama: "Dr. Anna Noordia, S.TP., M.Kes." },
      { jabatan: "Wakil Direktur II", nama: "Gading Gamaputra, S.AP., MPA" },
    ],
    catatanPimpinan: "Unit ini dipimpin Direktur (bukan Dekan) karena berbentuk kampus/PSDKU.",
    kampus: "Kampus UNESA 5 — Magetan",
    kampusKode: "magetan",
    alamat:
      "Jl. Maospati – Barat No. 358-360, Kel. Maospati, Kec. Maospati, Kab. Magetan, Jawa Timur 63392",
    gedung: [
      { nama: "Kompleks Kampus UNESA 5", ket: "Lahan 13,5 hektar, hasil hibah Pemkab Magetan" },
      { nama: "Gedung Kuliah Baru (proses)", ket: "Groundbreaking 6 Oktober 2026, ditargetkan selesai Maret 2027" },
      { nama: "Area UNESA Harvest Program", ket: "Budidaya unggas & jagung kampus yang hasilnya dibagikan ke dosen dan tendik" },
    ],
    dayaTarik:
      "Titik paling jauh dalam rute, dan paling penuh cerita: kampus yang lahir dari tanah hibah daerah, tumbuh dari 9 menjadi 16 prodi dalam setahun, dan sedang membangun gedung barunya hari demi hari. Kampus yang benar-benar “sedang dibuat” di depan mata.",
    fakta: [
      "16 prodi S1 — semuanya jenjang sarjana",
      "Lahan 13,5 ha hibah Kabupaten Magetan",
      "Prodi melompat 9 → 16 hanya dalam satu tahun (2025)",
      "UNESA Harvest Program: panen unggas & jagung kampus",
      "Gedung kuliah baru: groundbreaking Okt 2026",
    ],
    suara:
      "Selamat datang di Kampus UNESA Lima Magetan, Program Studi di Luar Kampus Utama Universitas Negeri Surabaya. Kampus ini berdiri di atas lahan hibah seluas tiga belas setengah hektar, dan kini mengelola enam belas program studi. Selamat menjelajah!",
    foto: img("PSDKU.jpg"),
    peta: petaMagetan,
    ragamGedung: "kecil",
    dimensiGedung: { w: 4.6, d: 3.8, h: 2.8 },
    sumber: [
      "https://kampusunesamagetan.unesa.ac.id/page/selayang-pandang-unesa-5",
      "https://admisi.unesa.ac.id/page/psdku-magetan",
    ],
  },

  {
    no: 13,
    slug: "fkp",
    akronim: "FKP",
    nama: "Fakultas Ketahanan Pangan",
    namaPendek: "Ketahanan Pangan",
    warna: "#C6A93B",
    berdiri: "15 Januari 2025",
    berdiriKet: "Diresmikan dengan SK Rektor No. 113/UN38/HK/2025 — fakultas termuda di lingkungan UNESA.",
    sejarah: [
      "FKP lahir dari keprihatinan atas krisis pangan global, perubahan iklim, dan degradasi lingkungan, ditambah kebutuhan sumber daya manusia untuk ketahanan pangan menuju Indonesia Emas 2045.",
      "Diresmikan 15 Januari 2025 melalui SK Rektor No. 113/UN38/HK/2025. Kehadirannya memperluas mandat UNESA — dari kampus yang dahulu dikenal sebagai pencetak tenaga pendidik, menjadi pusat pengembangan sains dan teknologi pangan.",
      "Menariknya, lokasinya menempati gedung cagar budaya di Kampus 3 Jl. Prof. Dr. Moestopo No. 4 Surabaya — perpaduan bangunan bersejarah dengan riset pangan masa depan.",
    ],
    prodiTotal: 5,
    prodi: [
      "S1 Teknologi Pangan dan Hasil Pertanian",
      "S1 Akuakultur",
      "S1 Biosains Hewan",
      "S1 Bioteknologi",
      "S1 Agribisnis Digital",
    ],
    dekan: "Prof. Dr. Nining Widyah Kusnanik, S.Pd., M.Appl.Sc",
    pimpinan: [
      { jabatan: "Dekan", nama: "Prof. Dr. Nining Widyah Kusnanik, S.Pd., M.Appl.Sc" },
      { jabatan: "Wakil Dekan I", nama: "Prof. Dr. Isnawati, M.Si." },
      { jabatan: "Wakil Dekan II", nama: "Dr. Ahmad Ajib Ridlwan, S.Pd., M.SEI." },
    ],
    catatanPimpinan: "Wakil Dekan III tidak dicantumkan di halaman resmi (belum dikonfirmasi).",
    kampus: "Kampus 3 — Jl. Prof. Dr. Moestopo",
    kampusKode: "kampus3",
    alamat: "Jl. Prof. Dr. Moestopo No. 4, Pacar Keling, Tambak Sari, Kota Surabaya, Jawa Timur 60286",
    gedung: [
      { nama: "Gedung Cagar Budaya Kampus 3", ket: "Bangunan bersejarah yang kini jadi rumah FKP" },
      { nama: "Laboratorium Pangan & Bioteknologi", ket: "Tempat praktikum teknologi pangan dan agribisnis" },
      { nama: "Area Budidaya", ket: "Urban farming, budidaya maggot, dan penanaman jagung" },
    ],
    dayaTarik:
      "Satu-satunya fakultas di UNESA yang menempati gedung cagar budaya. Di sini mahasiswa mengolah pangan masa depan — smart agriculture, urban farming, hilirisasi riset — di dalam bangunan yang sudah berdiri puluhan tahun.",
    fakta: [
      "Fakultas termuda UNESA (15 Januari 2025)",
      "5 prodi S1, termasuk Agribisnis Digital & Akuakultur",
      "Menempati gedung cagar budaya Kampus 3",
      "Dekan: Tokoh Mitra Bhayangkara Hoegeng Awards 2025",
      "Juara 1 Fakultas Penggerak Komunitas Ketahanan Pangan 2025",
    ],
    suara:
      "Selamat datang di Fakultas Ketahanan Pangan, Universitas Negeri Surabaya. Fakultas termuda ini baru diresmikan tahun dua ribu dua puluh lima, dan menempati gedung cagar budaya. Selamat berkeliling!",
    foto: img("FKP.jpeg"),
    peta: petaKampus3,
    ragamGedung: "minimalis",
    dimensiGedung: { w: 5.4, d: 4.2, h: 4.4 },
    sumber: ["https://fkp.unesa.ac.id/page/history", "https://fkp.unesa.ac.id/page/profil-pimpinan"],
  },

  {
    no: 14,
    slug: "pascasarjana",
    akronim: "PASCA",
    nama: "Sekolah Pascasarjana",
    namaPendek: "Pascasarjana",
    warna: "#B08968",
    berdiri: "1981 (S2 pertama) · 1992 (mandiri)",
    berdiriKet: "S2 Pendidikan Matematika dibuka TA 1981/1982; mandiri lewat SK Dirjen Dikti No. 516/DIKTI/1992.",
    sejarah: [
      "Pascasarjana UNESA dimulai dari sebuah percobaan lintas negara: TA 1981/1982 dibuka S2 Pendidikan Matematika yang dikelola sebagai kegiatan pengumpulan kredit di bawah Fakultas Pascasarjana IKIP Malang.",
      "Mahasiswa angkatan pertama kuliah dua semester di ITB, lalu tiga semester di Surabaya — berkolaborasi dengan The University of Western Australia, Curtin University, dan Fakultas Pascasarjana ITB.",
      "Setelah sempat dihentikan kebijakan nasional, program ini kembali TA 1989/1990 dan mandiri pada akhir 1992 lewat SK Dirjen Dikti No. 516/DIKTI/1992. Pada 2023 terjadi restrukturisasi besar: prodi linear diserahkan ke fakultas, prodi multidisiplin tetap di bawah Sekolah Pascasarjana.",
    ],
    prodiTotal: 5,
    prodi: [
      "S2 Pendidikan Teknologi dan Kejuruan",
      "S2 Pengembangan Sumber Daya Manusia",
      "S2 Manajemen Inovasi",
      "S3 Pendidikan Vokasi",
      "S3 Penelitian dan Evaluasi Pendidikan",
    ],
    dekan: "Prof. Dr. H. Bambang Yulianto, M.Pd. (Direktur)",
    pimpinan: [
      { jabatan: "Direktur", nama: "Prof. Dr. H. Bambang Yulianto, M.Pd." },
      { jabatan: "Wakil Direktur I", nama: "Dr. Warju, S.Pd., S.T., M.T." },
    ],
    catatanPimpinan:
      "Wakil Direktur II/III belum dikonfirmasi. Laman resmi menyebut “tiga prodi”, sedangkan footer & Admisi menampilkan 5 prodi PASCA (perlu klarifikasi internal UNESA).",
    kampus: "Kampus Lidah Wetan (Kampus 2)",
    kampusKode: "lidah",
    alamat: "Gedung Q1 Lt. 2, Jl. Lidah Wetan, Lakarsantri, Kota Surabaya, Jawa Timur 60213",
    gedung: [
      { nama: "Gedung Q1 Lt. 2", ket: "Sekretariat Sekolah Pascasarjana (berbagi dengan Fakultas Psikologi)" },
      { nama: "Ruang Kelas Pascasarjana", ket: "Kelas malam untuk mahasiswa s2/s3 multidisiplin" },
    ],
    dayaTarik:
      "Tempat kelahiran program pascasarjana tertua di UNESA — dan satu-satunya tempat di kampus di mana jejak kerja sama internasional sejak 1981 (ITB, Australia) masih terasa dalam tradisi risetnya.",
    fakta: [
      "Program pascasarjana pertama UNESA (TA 1981/1982)",
      "Mandiri sejak SK Dirjen Dikti No. 516/DIKTI/1992",
      "Berawal dari kolaborasi dengan ITB, UWA, dan Curtin University",
      "5 prodi multidisiplin S2 & S3",
      "Bantuan beasiswa S2 Fresh Graduate untuk mahasiswa baru",
    ],
    suara:
      "Selamat datang di Sekolah Pascasarjana Universitas Negeri Surabaya. Program pascasarjana pertamanya dibuka tahun seribu sembilan ratus delapan puluh satu. Selamat menapaki jenjang studi yang lebih tinggi!",
    foto: img("PASCA SARJANA.jpeg"),
    peta: petaPasca,
    ragamGedung: "menara",
    dimensiGedung: { w: 5.0, d: 4.4, h: 7.4 },
    sumber: [
      "https://sekolahpascasarjana.unesa.ac.id/page/profile-pascasarjana-unesa",
      "https://sekolahpascasarjana.unesa.ac.id/",
    ],
  },
];

export const getFakultas = (slug?: string) => FAKULTAS.find((f) => f.slug === slug);

/** Titik rute berurutan 1→14 untuk dipetakan di 3D dan halaman rute. */
export const RUTE = [...FAKULTAS].sort((a, b) => a.no - b.no);
