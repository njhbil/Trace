/**
 * Utilitas pemrosesan teks yang dipakai lintas halaman.
 * Berjalan penuh di sisi klien tanpa dependensi eksternal.
 */

/** Mengambil tahun pertama dari teks, mis. "1 April 2024" → "2024". */
export const tahunPertama = (teks: string): string => teks.match(/\d{4}/)?.[0] ?? teks;

/**
 * Menyingkat nama pejabat beserta gelar akhirnya,
 * mis. "Prof. Dr. Wiwik Sri Utami, M.P." → "Wiwik Sri Utami".
 */
export const namaPendek = (nama: string): string =>
  nama
    .replace(/\([^)]*\)/g, "")
    .replace(/^(Prof\.(IR\.)?|Dr\.(Hj\.)?|dr\.)\s+/gi, "")
    .split(",")[0]
    .trim();

/** Menampilkan nama domain dari URL sumber, tetap aman bila URL tidak valid. */
export const hostName = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
};
