import { Link } from "react-router-dom";
import { FAKULTAS } from "../data/fakultas";
import { UNESA } from "../data/unesa";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand">
              <Logo size={34} title="TRACE" />
              <span className="brand-text">
                <b>TRACE</b>
                <small>Panduan Wisata Kampus UNESA</small>
              </span>
            </div>
            <p>
              Panduan wisata edukatif {UNESA.singkatan}: {UNESA.jumlahFakultas} fakultas, satu rute, tersedia sebagai
              situs web — tanpa aplikasi dan tanpa pendaftaran.
            </p>
          </div>

          <div>
            <h5>Jelajah</h5>
            <div className="footer-list">
              <Link to="/">Beranda</Link>
              <Link to="/peta">Peta 3D Kampus</Link>
              <Link to="/rute">Rute Tur</Link>
            </div>
          </div>

          <div>
            <h5>Kampus 1 &amp; 2</h5>
            <div className="footer-list">
              {FAKULTAS.filter((f) => f.no <= 8).map((f) => (
                <Link key={f.slug} to={`/fakultas/${f.slug}`}>
                  {f.no}. {f.akronim}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5>Titik Lainnya</h5>
            <div className="footer-list">
              {FAKULTAS.filter((f) => f.no > 8).map((f) => (
                <Link key={f.slug} to={`/fakultas/${f.slug}`}>
                  {f.no}. {f.akronim}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} TRACE · {UNESA.nama}
          </span>
          <span className="footer-note">
            Foto dari kanal resmi UNESA &amp; dokumentasi tiap fakultas (hak cipta pemilik asli). Peta dan ilustrasi 3D
            dibuat untuk TRACE, bersifat ilustratif.
          </span>
        </div>
      </div>
    </footer>
  );
}
