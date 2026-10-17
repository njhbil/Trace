import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import Foto from "../components/Foto";
import MiniMap from "../components/MiniMap";
import { FAKULTAS } from "../data/fakultas";
import { UNESA } from "../data/unesa";
import { tick } from "../lib/gamelan";
import { tahunPertama } from "../lib/teks";
import "../styles/rute.css";

const KEY = "trace-rute-selesai";

export default function Rute() {
  const navigate = useNavigate();
  const [done, setDone] = useState<number[]>([]);
  const [onMap, setOnMap] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw) as number[]);
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch {
      /* abaikan */
    }
  }, [done]);

  const route = useMemo(() => [...FAKULTAS].sort((a, b) => a.no - b.no), []);

  const progress = Math.round((done.length / route.length) * 100);
  const menitPerTitik = 12;
  const sisaMenit = (route.length - done.length) * menitPerTitik;

  const toggle = (no: number) => {
    tick(done.includes(no) ? 520 : 960);
    setDone((d) => (d.includes(no) ? d.filter((x) => x !== no) : [...d, no]));
  };

  const reset = () => {
    tick(440);
    setDone([]);
  };

  const masuk = (slug: string) => {
    tick(880);
    navigate(`/fakultas/${slug}`);
  };

  return (
    <div className="rute-page">
      <div className="wrap">
        {/* ---------------- kepala ---------------- */}
        <header className="rute-head">
          <div>
            <span className="eyebrow">Campus Tourism Route</span>
            <h1 className="h2" style={{ margin: "14px 0 14px" }}>
              Rute Tur <span className="gold-text">{route.length} Titik</span>
            </h1>
            <p className="lead">
              Satu jalur berurutan dari Kampus 1 Ketintang, melintasi Kampus 2 Lidah Wetan, Kampus 3 Moestopo, hingga
              titik terjauh di Magetan. Centang setiap titik yang sudah kamu kunjungi — progres tersimpan otomatis di
              perangkat ini, dan bisa dicetak jadi lembar ceklis fisik.
            </p>

            <div className="rute-chips">
              <span className="chip chip-solid">±{route.length * menitPerTitik} menit tur</span>
              <span className="chip">5 kampus</span>
              <span className="chip">Progres {progress}%</span>
              <span className="chip">Disimpan lokal</span>
            </div>
          </div>

          <div className="rute-progress-card panel panel-pad">
            <div className="rute-progress-num">
              <b>{String(done.length).padStart(2, "0")}</b>
              <span>/ {route.length}</span>
            </div>
            <div className="rute-progress-label">Titik selesai</div>

            <div className="rute-bar">
              <i style={{ width: `${progress}%` }} />
            </div>

            <div className="rute-eta">
              {done.length === route.length
                ? "Rute lengkap — semua titik sudah dikunjungi."
                : `Sisa waktu kunjungan ± ${sisaMenit} menit`}
            </div>

            <div className="rute-actions">
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none">
                  <path
                    d="M4.5 6V2.5h7V6M4.5 11.5h7v2h-7v-2Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.5 11.5h-2v-5a1.5 1.5 0 0 1 1.5-1.5M11.5 11.5h2v-5a1.5 1.5 0 0 0-1.5-1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                Cetak ceklis
              </button>
              <button className="btn btn-ghost btn-sm" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
        </header>

        {/* ---------------- denah ---------------- */}
        <section className="rute-map">
          <Reveal>
            <div className="minimap">
              <MiniMap
                activeSlug={onMap ? FAKULTAS.find((f) => f.no === onMap)?.slug : null}
                onSelect={(slug) => masuk(slug)}
              />
              <div className="minimap-caption">Denah ilustratif · angka = urutan rute</div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rute-key">
              <h3 className="h3">Petunjuk rute</h3>
              <ol className="rute-key-list">
                <li>
                  <b>Mulai dari Kampus 1 Ketintang</b> — titik 1 sampai 6 berada dalam satu kawasan, jarak antar gedung
                  bisa ditempuh jalan kaki 3–5 menit.
                </li>
                <li>
                  <b>Menyeberang ke Kampus 2 Lidah Wetan</b> — titik 7 sampai 11, plus titik 14 Pascasarjana (Gedung Q1).
                </li>
                <li>
                  <b>Mampir ke Kampus 3 Moestopo</b> — titik 13 FKP menempati gedung cagar budaya di tengah kota.
                </li>
                <li>
                  <b>Titik 12 Magetan ±120 km</b> — dilaporkan terpisah; bisa dikunjungi sendiri lewat jalan darat
                  sekitar 2,5–3 jam.
                </li>
              </ol>
              <p className="rute-note">
                Angka pada denah mengikuti urutan rute, bukan skala jarak sebenarnya.
              </p>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/peta")}>
                Buka di peta 3D →
              </button>
            </div>
          </Reveal>
        </section>

        {/* ---------------- daftar titik ---------------- */}
        <section className="rute-list">
          <div className="rute-line" aria-hidden />

          {route.map((f, i) => {
            const selesai = done.includes(f.no);
            return (
              <Reveal key={f.slug} delay={(i % 3) * 0.05} y={24}>
                <article
                  className={`stop panel ${selesai ? "selesai" : ""}`}
                  onMouseEnter={() => setOnMap(f.no)}
                  onMouseLeave={() => setOnMap(null)}
                  style={{ ["--c" as string]: f.warna }}
                >
                  <button
                    className="stop-check"
                    aria-pressed={selesai}
                    aria-label={`Tandai ${f.akronim} selesai`}
                    onClick={() => toggle(f.no)}
                  >
                    {selesai ? "✓" : f.no}
                  </button>

                  <Foto src={f.foto} alt={f.nama} kode={f.akronim} className="stop-foto" />

                  <div className="stop-body">
                    <div className="stop-top">
                      <h3>{f.nama}</h3>
                      <span className="chip" style={{ borderColor: f.warna, color: f.warna }}>
                        {f.akronim}
                      </span>
                    </div>

                    <div className="stop-meta">
                      <span>{f.kampus}</span>
                      <span>{f.prodiTotal} program studi</span>
                      <span>Berdiri {tahunPertama(f.berdiri)}</span>
                    </div>

                    <p>{f.dayaTarik}</p>

                    <div className="stop-foot">
                      <span className="stop-eta">Kunjungan ± {menitPerTitik} menit</span>
                      <button className="stop-link" style={{ color: f.warna }} onClick={() => masuk(f.slug)}>
                        Lihat panduan
                        <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" fill="none">
                          <path
                            d="M4 8h8M8.5 4.5 12 8l-3.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </section>

        {/* ---------------- penutup ---------------- */}
        <section className="rute-end">
          <div className="orn">
            <span>ꦧꦩ꧀ꦢ꧀ꦮꦤ꧀ꦧꦤ꧀</span>
          </div>
          <h2 className="h3" style={{ marginTop: 22 }}>
            {done.length === route.length
              ? "Tur selesai — sampai jumpa di kunjungan berikutnya"
              : `Masih ada ${route.length - done.length} titik yang menunggu`}
          </h2>
          <p className="lead" style={{ margin: "12px auto 24px" }}>
            Setiap titik punya halaman panduannya sendiri — buka langsung dari daftar di atas.
          </p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => masuk(route.find((f) => !done.includes(f.no))?.slug ?? route[0].slug)}>
              Lanjut ke titik berikutnya
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/peta")}>
              Kembali ke peta
            </button>
          </div>

          <p className="rute-src">
            Sumber data: {UNESA.nama} (unesa.ac.id) dan subdomain resmi tiap fakultas · {new Date().getFullYear()}
          </p>
        </section>
      </div>
    </div>
  );
}
