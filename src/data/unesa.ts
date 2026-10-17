/** Info umum Universitas Negeri Surabaya — dipakai untuk pengantar & narasi halaman utama. */

export interface KampusInfo {
  kode: string;
  nama: string;
  julukan: string;
  alamat: string;
  catatan: string;
}

export const UNESA = {
  singkatan: "UNESA",
  nama: "Universitas Negeri Surabaya",
  namaPanjang: "Universitas Negeri Surabaya (UNESA)",
  berdiri: 1964,
  berubahNama: 1999,
  status: "Perguruan Tinggi Negeri Badan Hukum (PP No. 37 Tahun 2022)",
  jumlahFakultas: 14,
  moto: "Growing with Character",
  visi:
    "Universitas kependidikan yang tangguh, adaptif, dan inovatif yang berbasis kewirausahaan.",
  rektor: "Prof. Dr. H. Nurhasan, M.Kes.",
  alamatSingkat: "Jl. Ketintang, Gayungan, Kota Surabaya, Jawa Timur",
  kalimatPembuka:
    "TRACE adalah panduan wisata edukatif digital untuk menjelajah Universitas Negeri Surabaya — kampus yang menyimpan jejak sejarah pendidikan Indonesia sejak 1964, budaya Jawa Timur, fasilitas riset, komunitas, dan denyut kehidupan mahasiswanya.",

  /** Sorotan angka untuk halaman pengantar. */
  angka: [
    { nilai: "1964", label: "Tonggak berdiri", ket: "SK PTIP No. 182/1964" },
    { nilai: "14", label: "Fakultas & unit", ket: "Titik wisata edukatif" },
    { nilai: "196", label: "Program studi", ket: "S1, S2, S3 & vokasi" },
    { nilai: "72.528", label: "Mahasiswa aktif", ket: "154 guru besar · 668 dosen S3" },
  ],

  /** Linimasa sejarah singkat. */
  timeline: [
    {
      tahun: "1950-an",
      judul: "Embrio kursus keguruan",
      isi: "Kursus B-I dan B-II Ilmu Kimia serta Ilmu Pasti berdiri di Surabaya — benih dari lahirnya kampus keguruan di Jawa Timur.",
    },
    {
      tahun: "1964",
      judul: "IKIP Surabaya berdiri sendiri",
      isi: "SK Menteri PT dan IP No. 182/1964 menetapkan IKIP Surabaya dengan lima fakultas awal, salah satunya cikal bakal FMIPA. Kampus menetap di kawasan Ketintang.",
    },
    {
      tahun: "1981",
      judul: "Reorganisasi fakultas",
      isi: "PP No. 27 Tahun 1981 membentuk ulang struktur fakultas: FKIT menjadi FPTK, FKIE menjadi FPMIPA, dan FKIS menjadi FPIPS.",
    },
    {
      tahun: "1999",
      judul: "IKIP Surabaya menjadi UNESA",
      isi: "Kepres No. 93 Tahun 1999 mengubah IKIP Surabaya menjadi Universitas Negeri Surabaya — tonggak lahirnya fakultas-fakultas non-keguruan seperti FT, FMIPA, FIP, dan FIS.",
    },
    {
      tahun: "Kini",
      judul: "Universitas riset & budaya",
      isi: "Empat belas fakultas dan unit pendidikan di beberapa kampus, menjadi rumah bagi puluhan ribu mahasiswa dari seluruh Indonesia.",
    },
  ],

  /** Empat pilar pengalaman wisata edukatif TRACE. */
  pilar: [
    {
      kode: "sejarah",
      judul: "Sejarah",
      isi: "Jejak dari kursus keguruan 1950-an hingga universitas riset hari ini — gedung-gedung tua, nama-nama yang berubah, dan SK yang membentuk fakultas.",
      aksara: "ꦱꦺꦗꦫꦃ",
    },
    {
      kode: "budaya",
      judul: "Budaya",
      isi: "Nuansa Jawa Timur: batik, pendopo, gamelan, sampai tradisi paguyuban yang masih hidup di ruang-ruang kelas dan unit kegiatan mahasiswa.",
      aksara: "ꦧꦸꦢꦪ",
    },
    {
      kode: "fasilitas",
      judul: "Fasilitas",
      isi: "Laboratorium, studio, pusat riset, perpustakaan, hingga kebun konservasi — etalase cara kampus ini belajar dan berinovasi.",
      aksara: "ꦥꦱꦶꦭꦶꦠꦱ꧀",
    },
    {
      kode: "komunitas",
      judul: "Komunitas",
      isi: "UKM, tim robotik, klub olahraga, sanggar seni, dan organisasi mahasiswa yang membuat kampus terasa hidup dari pagi sampai malam.",
      aksara: "ꦏꦸꦩꦸꦤꦶꦠꦱ꧀",
    },
  ],

  /** Kumpulan kampus UNESA (5 kampus resmi). */
  kampus: [
    {
      kode: "ketintang",
      nama: "Kampus 1 Ketintang",
      julukan: "Kampus induk",
      alamat: "Jl. Ketintang, Gayungan, Kota Surabaya",
      catatan: "Rumah FT, FEB, FMIPA, FISIPOL (gedung i1–i9), FV, dan FH — juga kawasan gedung-gedung bersejarah.",
    },
    {
      kode: "lidah",
      nama: "Kampus 2 Lidah Wetan",
      julukan: "Kampus terluas",
      alamat: "Jl. Lidah Wetan, Lakarsantri, Kota Surabaya",
      catatan: "Rektorat, Graha Sawunggaling, Labmer, FIP, FBS, FIKK, FPsi, FK, serta Sekolah Pascasarjana (Gedung Q1).",
    },
    {
      kode: "kampus3",
      nama: "Kampus 3 Moestopo",
      julukan: "Kampus kota",
      alamat: "Jl. Prof. Dr. Moestopo No. 4, Pacar Keling, Surabaya",
      catatan: "Gedung cagar budaya di tengah kota — menjadi rumah Fakultas Ketahanan Pangan (FKP).",
    },
    {
      kode: "kampus4",
      nama: "Kampus 4 Ketajen",
      julukan: "Kampus Sidoarjo",
      alamat: "Ketajen, Gedangan, Sidoarjo",
      catatan: "Bersebelahan dengan Kecamatan Taman, Sidoarjo.",
    },
    {
      kode: "magetan",
      nama: "Kampus 5 Magetan (PSDKU)",
      julukan: "Titik terjauh",
      alamat: "Jl. Maospati – Barat No. 358-360, Magetan 63392",
      catatan: "Program Studi di Luar Kampus Utama di lahan hibah 13,5 hektar — ±120 km dari Surabaya.",
    },
  ] satisfies KampusInfo[],
};

export type Pilar = (typeof UNESA.pilar)[number];
