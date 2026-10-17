import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Campus3D from "../three/Campus3D";
import Foto from "../components/Foto";
import { FAKULTAS, getFakultas } from "../data/fakultas";
import { UNESA } from "../data/unesa";
import { tick } from "../lib/gamelan";
import "../styles/peta.css";

export default function Peta() {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(true);
  const fak = getFakultas(active ?? undefined);

  const groups = useMemo(() => {
    return UNESA.kampus
      .map((k) => ({ kampus: k, items: FAKULTAS.filter((f) => f.kampusKode === k.kode) }))
      .filter((g) => g.items.length > 0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const masuk = (slug: string) => {
    tick(880);
    navigate(`/fakultas/${slug}`);
  };

  return (
    <div className={`peta-page ${fak ? "has-detail" : ""}`}>
      {/* ---------------- HUD atas ---------------- */}
      <header className="peta-hud">
        <div className="peta-hud-text">
          <span className="eyebrow">Peta Interaktif</span>
          <h1 className="h3" style={{ marginTop: 8 }}>
            Jelajahi {UNESA.jumlahFakultas} Titik Wisata
          </h1>
          <p className="peta-sub">Seret untuk memutar · scroll untuk zoom · klik penanda</p>
        </div>

        <div className="peta-tools">
          <button
            className={`chip peta-tool ${showRoute ? "is-on" : ""}`}
            onClick={() => {
              tick(660);
              setShowRoute((v) => !v);
            }}
            aria-pressed={showRoute}
            title="Tampilkan atau sembunyikan jalur tur antar titik"
          >
            <i className="tool-dot" />
            Jalur rute
          </button>
          <button
            className="chip peta-tool"
            onClick={() => {
              tick(520);
              setActive(null);
            }}
            title="Kembalikan posisi kamera ke awal"
          >
            Atur ulang
          </button>
        </div>
      </header>

      {/* ---------------- panggung 3D ---------------- */}
      <div className="peta-stage">
        <Campus3D
          mode="full"
          activeSlug={active}
          showRoute={showRoute}
          onSelect={(f) => {
            tick(880);
            setActive(f.slug);
          }}
        />
      </div>

      {/* ---------------- rail daftar ---------------- */}
      <aside className="peta-rail">
        <div className="rail-title">Daftar Titik</div>
        {groups.map((g) => (
          <div className="rail-group" key={g.kampus.kode}>
            <div className="rail-group-name">{g.kampus.nama}</div>
            {g.items.map((f) => (
              <button
                key={f.slug}
                className={`rail-item ${active === f.slug ? "on" : ""}`}
                style={{ ["--c" as string]: f.warna }}
                onClick={() => {
                  tick(760);
                  setActive(f.slug);
                }}
              >
                <b>{f.no}</b>
                <span>
                  {f.akronim}
                  <small>{f.namaPendek}</small>
                </span>
              </button>
            ))}
          </div>
        ))}

        <div className="rail-foot">
          <span>
            <i className="dot" style={{ background: "#E3BF6D" }} /> Jumlah prodi tiap titik: klik untuk masuk
          </span>
        </div>
      </aside>

      {/* ---------------- kartu detail ---------------- */}
      <AnimatePresence>
        {fak && (
          <motion.aside
            key={fak.slug}
            className="peta-card"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="peta-card-close" onClick={() => setActive(null)} aria-label="Tutup kartu">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
                <path
                  d="m4 4 8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="peta-card-top">
              <Foto src={fak.foto} alt={fak.nama} kode={fak.akronim} className="peta-card-foto" />
              <div>
                <div className="titik-head" style={{ marginBottom: 8 }}>
                  <span className="badge-no">{fak.no}</span>
                  <span className="chip" style={{ borderColor: fak.warna, color: fak.warna }}>
                    {fak.akronim}
                  </span>
                </div>
                <h2 className="h3">{fak.nama}</h2>
                <p className="peta-card-kampus">{fak.kampus}</p>
              </div>
            </div>

            <dl className="kv" style={{ margin: "16px 0" }}>
              <dt>Berdiri</dt>
              <dd>{fak.berdiri}</dd>
              <dt>Program studi</dt>
              <dd>{fak.prodiTotal} prodi</dd>
              <dt>Pimpinan</dt>
              <dd>{fak.dekan}</dd>
            </dl>

            <p className="peta-card-desc">{fak.dayaTarik}</p>

            <div className="peta-card-cta">
              <button className="btn btn-primary btn-sm" onClick={() => masuk(fak.slug)}>
                Buka panduan
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setActive(null)}>
                Lihat peta
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ---------------- legenda bawah ---------------- */}
      {!fak && (
        <div className="peta-legend">
          <span>
            <i className="legend-num">1–14</i> nomor rute
          </span>
          <span>
            <i className="legend-ring" /> penanda siap diklik
          </span>
          <span>
            <i className="legend-line" /> jalur tur kampus
          </span>
        </div>
      )}
    </div>
  );
}
