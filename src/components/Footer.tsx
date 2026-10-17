import { Link } from "react-router-dom";
import { FAKULTAS } from "../data/fakultas";
import { UNESA } from "../data/unesa";
import Logo from "./Logo";

/** Kolom footer dikelompokkan per kampus, bukan per rentang nomor. */
const GRUP_KAMPUS = [
  { kode: "ketintang", label: "Kampus 1 Ketintang" },
  { kode: "lidah", label: "Kampus 2 Lidah Wetan" },
  { kode: "kampus3", label: "Kampus 3 Moestopo" },
  { kode: "magetan", label: "PSDKU Magetan" },
];

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

          {GRUP_KAMPUS.map((grup) => {
            const anggota = FAKULTAS.filter((f) => f.kampusKode === grup.kode).sort((a, b) => a.no - b.no);
            if (!anggota.length) return null;

            return (
              <div key={grup.kode}>
                <h5>{grup.label}</h5>
                <div className="footer-list">
                  {anggota.map((f) => (
                    <Link key={f.slug} to={`/fakultas/${f.slug}`}>
                      {String(f.no).padStart(2, "0")}. {f.akronim}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
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
