import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingTop: 180, paddingBottom: 140, textAlign: "center" }}>
      <div className="aksara-mark" aria-hidden>
        ꦢꦸꦧ꧀ꦢꦸ
      </div>
      <span className="eyebrow center">404</span>
      <h1 className="display" style={{ fontSize: "clamp(2.4rem,7vw,4.6rem)", margin: "14px 0" }}>
        Titik tidak ditemukan
      </h1>
      <p className="lead" style={{ margin: "0 auto 28px" }}>
        Tautan yang kamu buka tidak ada di dalam rute. Mungkin salah ketik, atau fakultasnya belum tercatat di peta.
      </p>
      <div className="hero-cta" style={{ justifyContent: "center" }}>
        <Link className="btn btn-primary" to="/">
          Kembali ke beranda
        </Link>
        <Link className="btn btn-ghost" to="/peta">
          Buka peta 3D
        </Link>
      </div>
    </div>
  );
}
