import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  /** kode fakultas buat fallback */
  kode: string;
  className?: string;
  /** posisi objek foto */
  pos?: string;
}

/**
 * <img> dengan jaring pengaman: kalau file belum ada / gagal dimuat,
 * tampil placeholder gradasi + aksara (tetap estetik, bukan ikon rusak).
 */
export default function Foto({ src, alt, kode, className = "", pos = "center" }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`photo photo-tint ${className}`} style={{ ["--tint" as string]: "rgba(201,162,39,0.14)" }}>
      {failed ? (
        <div className="photo-fallback" role="img" aria-label={alt}>
          <span className="aksara-mark">ꦥꦶ</span>
          <b>{kode}</b>
          <small>Foto belum tersedia</small>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: pos }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
