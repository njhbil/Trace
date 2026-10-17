import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Campus3D from "../three/Campus3D";
import Preloader from "../components/Preloader";
import Reveal from "../components/Reveal";
import Foto from "../components/Foto";
import MiniMap from "../components/MiniMap";
import { FAKULTAS } from "../data/fakultas";
import { UNESA } from "../data/unesa";
import { tick } from "../lib/gamelan";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [showPre, setShowPre] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("trace-pre") !== "1";
  });

  useEffect(() => {
    if (!showPre) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showPre]);

  const finishPre = useCallback(() => {
    sessionStorage.setItem("trace-pre", "1");
    setShowPre(false);
    document.body.style.overflow = "";
  }, []);

  const masuk = (slug: string) => {
    tick(880);
    navigate(`/fakultas/${slug}`);
  };

  return (
    <>
      {showPre && <Preloader onDone={finishPre} />}

      {/* ============================= HERO ============================= */}
      <section className="hero" ref={heroRef}>
        <Campus3D mode="hero" className="hero-canvas" onSelect={(f) => masuk(f.slug)} />

        <div className="hero-vignette" />
        <div className="hero-overlay">
          <div className="hero-top">
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {UNESA.nama} · Est. {UNESA.berdiri}
            </motion.span>
          </div>

          <div className="hero-copy">
            <motion.h1
              className="display hero-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              TRACE
            </motion.h1>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9 }}
            >
              Tourism Resource <span>&amp;</span> Cultural Experience
            </motion.p>

            <motion.p
              className="hero-lead"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88, duration: 0.9 }}
            >
              Panduan wisata edukatif {UNESA.singkatan}: 14 titik, 1 rute, 1 pengalaman. Jelajahi sejarah, budaya,
              fasilitas, komunitas, dan kehidupan mahasiswa lewat peta kampus tiga dimensi.
            </motion.p>

            <motion.div
              className="hero-cta"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.04, duration: 0.9 }}
            >
              <button
                className="btn btn-primary"
                onClick={() => {
                  tick(760);
                  document.getElementById("kenali")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Mulai Menjelajah
              </button>
              <button className="btn btn-ghost" onClick={() => masuk("fisipol")}>
                Masuk Titik Pertama →
              </button>
            </motion.div>
          </div>

          <motion.div
            className="hero-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
          >
            <span className="hint-dot" /> Gulir untuk turun · geser mendatar untuk memutar kampus · ketuk penanda
            bernomor untuk masuk
          </motion.div>
        </div>

        <div className="hero-scroll" aria-hidden>
          <i />
          <span>SCROLL</span>
        </div>
      </section>

      {/* ========================= KENALI UNESA ========================= */}
      <section className="section" id="kenali">
        <div className="wrap">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">Pengenalan</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="h2">
                Kenali <span className="gold-text">{UNESA.singkatan}</span> sebelum berjalan
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="lead">{UNESA.kalimatPembuka}</p>
            </Reveal>
          </div>

          <div className="stats-row">
            {UNESA.angka.map((a, i) => (
              <Reveal key={a.label} delay={i * 0.07}>
                <div className="stat">
                  <b>{a.nilai}</b>
                  <span>{a.label}</span>
                  <small>{a.ket}</small>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="timeline">
            {UNESA.timeline.map((t, i) => (
              <Reveal key={t.tahun} delay={i * 0.08} className="tl-item">
                <div className="tl-tahun">{t.tahun}</div>
                <div className="tl-isi">
                  <h4>{t.judul}</h4>
                  <p>{t.isi}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PILAR ============================ */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head center">
            <Reveal>
              <span className="eyebrow center">Empat Pilar</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="h2">Yang kamu temui di dalam rute</h2>
            </Reveal>
          </div>

          <div className="grid grid-4 pilar-grid">
            {UNESA.pilar.map((p, i) => (
              <Reveal key={p.kode} delay={i * 0.07}>
                <article className="panel panel-pad pilar-card">
                  <span className="pilar-aksara" aria-hidden>
                    {p.aksara}
                  </span>
                  <span className="pilar-no">0{i + 1}</span>
                  <h3 className="h3">{p.judul}</h3>
                  <p>{p.isi}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= PETA + RUTE ======================= */}
      <section className="section" id="peta-rute">
        <div className="wrap peta-rute-grid">
          <div>
            <Reveal>
              <span className="eyebrow">Peta &amp; Rute</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="h2" style={{ margin: "16px 0 18px" }}>
                Satu rute,
                <br />
                empat belas titik
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="lead">
                Rute disusun mengikuti denah kampus: enam fakultas di Kampus 1 Ketintang, lima unit di Kampus 2 Lidah
                Wetan, lalu menyempatkan diri ke Kampus 3 dan titik terjauh di Magetan. Setiap titik punya nomor yang
                sama dengan yang muncul di peta 3D.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="route-quick">
                {FAKULTAS.map((f) => (
                  <button
                    key={f.slug}
                    className="rq-item"
                    style={{ ["--c" as string]: f.warna }}
                    onClick={() => masuk(f.slug)}
                    title={`${f.akronim} — ${f.nama}`}
                  >
                    <b>{f.no}</b>
                    <span>{f.akronim}</span>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="hero-cta" style={{ marginTop: 26 }}>
                <button className="btn btn-primary" onClick={() => navigate("/rute")}>
                  Lihat Rute Lengkap
                </button>
                <button className="btn btn-ghost" onClick={() => navigate("/peta")}>
                  Buka Peta 3D Penuh
                </button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="minimap-wrap">
            <div className="minimap">
              <MiniMap onSelect={masuk} />
              <div className="minimap-caption">
                Denah ilustratif · ketuk titik untuk membuka panduan fakultas
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= 14 TITIK ======================= */}
      <section className="section section-alt" id="titik">
        <div className="wrap">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">Titik Wisata</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="h2">Empat belas panduan fakultas</h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="lead">
                Setiap titik membuka panduan lengkapnya sendiri: sejarah, program studi, pimpinan, gedung, dan lokasi
                persisnya di peta kampus.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-3 titik-grid">
            {FAKULTAS.map((f, i) => (
              <Reveal key={f.slug} delay={(i % 3) * 0.06}>
                <a
                  className="panel titik-card"
                  href={`#/fakultas/${f.slug}`}
                  onClick={() => tick(880)}
                  style={{ ["--c" as string]: f.warna }}
                >
                  <Foto src={f.foto} alt={`Gedung ${f.nama}`} kode={f.akronim} className="titik-foto" />
                  <div className="titik-body">
                    <div className="titik-head">
                      <span className="badge-no">{f.no}</span>
                      <span className="chip" style={{ borderColor: f.warna, color: f.warna }}>
                        {f.akronim}
                      </span>
                    </div>
                    <h3>{f.nama}</h3>
                    <div className="titik-meta">
                      <span>{f.kampus}</span>
                      <span>{f.prodiTotal} prodi</span>
                    </div>
                    <span className="titik-join" style={{ color: f.warna }}>
                      Lihat panduan
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= CARA PAKAI ======================= */}
      <section className="section">
        <div className="wrap">
          <div className="section-head center">
            <Reveal>
              <span className="eyebrow center">Cara Pakai</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="h2">Tiga langkah, tanpa aplikasi</h2>
            </Reveal>
          </div>

          <div className="grid grid-3">
            {[
              {
                t: "Buka peta",
                d: "Putar kampus dengan digeser mendatar. Untuk zoom penuh dan kontrol kamera lengkap, buka halaman Peta.",
              },
              {
                t: "Pilih titik",
                d: "Tekan satu fakultas untuk ringkasan singkatnya, atau langsung masuk ke halaman panduan lengkapnya.",
              },
              {
                t: "Dengar sapaan",
                d: "Tekan tombol suara untuk mendengar “Selamat datang di Fakultas …”, ditemani gamelan latar.",
              },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div className="panel panel-pad step-card">
                  <span className="step-no">0{i + 1}</span>
                  <h3 className="h3">{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
