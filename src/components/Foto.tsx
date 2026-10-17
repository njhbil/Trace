import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  /** kode fakultas untuk pratinjau */
  kode: string;
  className?: string;
  /** posisi objek foto */
  pos?: string;
}

/**
 * Elemen <img> dengan pengaman: bila berkas belum tersedia atau gagal dimuat,
 * diganti placeholder gradasi + aksara sehingga tampilan tetap rapi.
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
