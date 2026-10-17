import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "../components/Reveal";
import Foto from "../components/Foto";
import MiniMap from "../components/MiniMap";
import { FAKULTAS, getFakultas } from "../data/fakultas";
import { isSpeechSupported, primeVoices, speak, stopSpeaking } from "../lib/speech";
import { onFirstGesture } from "../lib/gesture";
import { playEntrance, tick } from "../lib/gamelan";
import NotFound from "./NotFound";
import "../styles/fakultas.css";

/** Ambil tahun pertama dari teks berdiri, mis. "1964 (FKIE) · 1981 …" → "1964". */
const tahunPertama = (t: string) => t.match(/\d{4}/)?.[0] ?? t;

/** Nama domain untuk tombol sumber — aman meski URL tidak valid. */
const hostName = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u.replace(/^https?:\/\//, "").split("/")[0];
  }
};

/** "Prof. Dr. Wiwik Sri Utami, M.P." → "Wiwik Sri Utami". */
const namaPendek = (n: string) =>
  n
    .replace(/\([^)]*\)/g, "")
    .replace(/^(Prof\.(IR\.)?|Dr\.(Hj\.)?|dr\.)\s+/gi, "")
    .split(",")[0]
    .trim();

export default function FakultasPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const fak = getFakultas(slug);

  const [speaking, setSpeaking] = useState(false);
  const spoken = useRef(false);

  const idx = useMemo(() => FAKULTAS.findIndex((f) => f.slug === slug), [slug]);
  const prev = idx > 0 ? FAKULTAS[idx - 1] : null;
  const next = idx >= 0 && idx < FAKULTAS.length - 1 ? FAKULTAS[idx + 1] : null;

  /* --- sapaan otomatis: dicoba langsung, dan diulang pada gestur pertama
         bila browser memblokir autoplay --- */
  const ucapkan = useCallback(() => {
    if (!fak || spoken.current) return;
    spoken.current = true;
    const ok = speak(fak.suara, { rate: 0.94, pitch: 1.05, onEnd: () => setSpeaking(false) });
    setSpeaking(ok);
    if (ok) playEntrance();
  }, [fak]);

  useEffect(() => {
    if (!fak) return;
    spoken.current = false;
    primeVoices();

    const t = window.setTimeout(ucapkan, 600);
    const offGesture = onFirstGesture(() => {
      if (!spoken.current) ucapkan();
    });

    return () => {
      window.clearTimeout(t);
      offGesture();
      stopSpeaking();
    };
  }, [fak, ucapkan]);

  /* --- sapaan otomatis --- */
  if (!fak) return <NotFound />;

  const ulangUcapan = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    spoken.current = false;
    ucapkan();
  };

  const pergi = (to: string) => {
    tick(880);
    navigate(to);
  };

  return (
    <div className="fp" style={{ ["--c" as string]: fak.warna }}>
      {/* ============================= HERO ============================= */}
      <section className="fp-hero">
        <Foto src={fak.foto} alt={`Gedung ${fak.nama}`} kode={fak.akronim} className="fp-hero-foto" />
        <div className="fp-hero-mask" />

        <div className="wrap fp-hero-inner">
          <button className="fp-back" onClick={() => pergi("/peta")}>
            ← Kembali ke peta
          </button>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="fp-hero-tags">
              <span className="badge-no">{fak.no}</span>
              <span className="chip">{fak.kampus}</span>
              <span className="chip">Berdiri {tahunPertama(fak.berdiri)}</span>
            </div>

            <h1 className="fp-title">{fak.nama}</h1>
            <p className="fp-akronim">{fak.akronim}</p>

            <div className="fp-hero-actions">
              <button className={`voice-btn ${speaking ? "speaking" : ""}`} onClick={ulangUcapan}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
                  <path
                    d="M8.5 2.2 4.8 5.3H2.4v5.4h2.4l3.7 3.1V2.2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 5.4a3.6 3.6 0 0 1 0 5.2M12.8 3.4a6.2 6.2 0 0 1 0 9.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {speaking ? "Sedang menyapa" : "Dengar sapaan"}
              </button>
              {!isSpeechSupported() && <span className="chip">Perangkat ini belum mendukung suara</span>}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================ FAKTA ============================ */}
      <div className="wrap">
        <div className="fp-fakta">
          {[
            { l: "Tahun berdiri", v: tahunPertama(fak.berdiri), k: fak.berdiri },
            { l: "Program studi", v: `${fak.prodiTotal} prodi`, k: "jenjang S1, S2, S3, D3–D4" },
            { l: "Dekan / Direktur", v: namaPendek(fak.dekan), k: `${fak.pimpinan.length} pejabat` },
            { l: "Lokasi", v: fak.kampus, k: fak.alamat.split(",")[0] },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.06}>
              <div className="fp-fakta-item">
                <span>{s.l}</span>
                <b>{s.v}</b>
                <small>{s.k}</small>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ============================ ISI ============================ */}
      <div className="wrap fp-main">
        {/* ---------------- kolom utama ---------------- */}
        <div className="fp-content">
          {/* sejarah */}
          <section className="fp-block">
            <Reveal>
              <span className="eyebrow">Sejarah</span>
              <h2 className="h2">Lahir dari masa ke masa</h2>
            </Reveal>
            <div className="fp-sejarah">
              {fak.sejarah.map((p, i) => (
                <Reveal key={i} delay={0.05 + i * 0.06} y={18}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <div className="fp-tahun">
                <span>Tahun berdiri</span>
                <b>{fak.berdiri}</b>
                <p>{fak.berdiriKet}</p>
              </div>
            </Reveal>
          </section>

          {/* prodi */}
          <section className="fp-block">
            <Reveal>
              <span className="eyebrow">Program studi</span>
              <h2 className="h2">{fak.prodiTotal} prodi tersedia</h2>
            </Reveal>
            <ol className="prodi-list">
              {fak.prodi.map((p, i) => (
                <Reveal key={p} delay={Math.min(i * 0.025, 0.4)} y={12} as="li">
                  <span className="prodi-no">{String(i + 1).padStart(2, "0")}</span>
                  {p}
                </Reveal>
              ))}
            </ol>
            {fak.prodi.length < fak.prodiTotal && (
              <p className="fp-note">
                Catatan: {fak.prodiTotal - fak.prodi.length} prodi lain belum tercantum di daftar ini — silakan cek
                menu resmi fakultas pada bagian sumber di bawah.
              </p>
            )}
          </section>

          {/* pimpinan */}
          <section className="fp-block">
            <Reveal>
              <span className="eyebrow">Pimpinan</span>
              <h2 className="h2">Dekan &amp; wakil dekan</h2>
            </Reveal>
            <div className="fp-pimpinan">
              {fak.pimpinan.map((p, i) => (
                <Reveal key={p.jabatan + p.nama} delay={i * 0.06} y={16}>
                  <article className="pimpinan-row">
                    <span className="pimpinan-avatar" aria-hidden>
                      {p.nama
                        .replace(/^(Prof\.|Dr\.|dr\.)\s*/g, "")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <div>
                      <span className="pimpinan-jabatan">{p.jabatan}</span>
                      <h3>{p.nama}</h3>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            {fak.catatanPimpinan && <p className="fp-note">{fak.catatanPimpinan}</p>}
          </section>

          {/* gedung */}
          <section className="fp-block">
            <Reveal>
              <span className="eyebrow">Bangunan &amp; fasilitas</span>
              <h2 className="h2">Gedung apa saja yang ada</h2>
            </Reveal>
            <ol className="gedung-list">
              {fak.gedung.map((g, i) => (
                <Reveal key={g.nama} delay={Math.min(i * 0.05, 0.35)} y={16} as="li">
                  <span className="gedung-no">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{g.nama}</h3>
                    <p>{g.ket}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </section>
        </div>

        {/* ---------------- kolom samping ---------------- */}
        <aside className="fp-aside">
          <Reveal delay={0.08}>
            <div className="fp-aside-card">
              <span className="eyebrow">Daya tarik</span>
              <p className="fp-dayatarik">{fak.dayaTarik}</p>
              <div className="fp-fakta-list">
                {fak.fakta.map((x) => (
                  <span key={x} className="chip">
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="fp-aside-card">
              <span className="eyebrow">Lokasi di kampus</span>
              <div className="minimap minimap-compact">
                <MiniMap activeSlug={fak.slug} onSelect={(s) => pergi(`/fakultas/${s}`)} />
              </div>
              <p className="fp-note" style={{ marginTop: 10 }}>
                Titik {fak.no} dari 14. Klik titik lain untuk berpindah panduan.
              </p>
            </div>
          </Reveal>
        </aside>
      </div>

      {/* ============================ SUMBER ============================ */}
      <section className="wrap fp-sumber">
        <div className="orn">
          <span>ꦊꦛꦫꦃ</span>
        </div>
        <div className="fp-sumber-links">
          {fak.sumber.map((s) => (
            <a key={s} href={s} target="_blank" rel="noreferrer noopener" className="chip">
              {hostName(s)}
            </a>
          ))}
        </div>
        <p className="fp-note" style={{ textAlign: "center", marginTop: 14 }}>
          Konten dirangkum dari kanal resmi UNESA untuk keperluan edukatif non-komersial.
        </p>
      </section>

      {/* ============================ NAV ============================ */}
      <nav className="fp-nav" aria-label="Navigasi antar fakultas">
        <div className="fp-nav-side">
          {prev ? (
            <button className="fp-nav-item" onClick={() => pergi(`/fakultas/${prev.slug}`)}>
              <span className="fp-nav-dir">Sebelumnya</span>
              <b>
                <i aria-hidden>←</i> {prev.akronim}
              </b>
            </button>
          ) : (
            <span />
          )}
        </div>

        <Link className="fp-nav-home" to="/rute" onClick={() => tick(880)}>
          Lihat rute lengkap
        </Link>

        <div className="fp-nav-side fp-nav-right">
          <button
            className="fp-nav-item"
            onClick={() => (next ? pergi(`/fakultas/${next.slug}`) : pergi("/"))}
          >
            <span className="fp-nav-dir">{next ? "Selanjutnya" : "Selesai"}</span>
            <b>
              {next ? next.akronim : "Beranda"} <i aria-hidden>→</i>
            </b>
          </button>
        </div>
      </nav>
    </div>
  );
}
