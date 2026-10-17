import { FAKULTAS, ZONA, PULAU_TERHUBUNG } from "../data/fakultas";

const S = 4.1; // skala: dunia (meter) → piksel SVG (muat sampai Magetan)
const C = 200; // pusat kanvas SVG

export const toSvg = (x: number, z: number) => ({ cx: C + x * S, cy: C + z * S });

function kanvasToDunia(cx: number, cy: number) {
  return { x: (cx - C) / S, z: (cy - C) / S };
}

interface Props {
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
  showRoute?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Denah kampus 2D (SVG) — dipakai di halaman fakultas, rute, dan panel peta.
 * Koordinatnya mengikuti `peta` di data fakultas, jadi selalu sinkron dengan 3D.
 */
export default function MiniMap({ activeSlug, onSelect, showRoute = true, compact = false, className = "" }: Props) {
  const route = [...FAKULTAS].sort((a, b) => a.no - b.no);
  const line = route.map((f) => toSvg(f.peta.x, f.peta.z));
  const path = line.map((p, i) => `${i === 0 ? "M" : "L"}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(" ");

  const zonaBy = (kode: string) => ZONA.find((z) => z.kode === kode)!;
  const A = toSvg(zonaBy("ketintang").x, zonaBy("ketintang").z);
  const B = toSvg(zonaBy("lidah").x, zonaBy("lidah").z);
  const K3 = toSvg(2, 19.6);
  const MGT = toSvg(37, 11.1);
  const P1 = toSvg(zonaBy("ketintang").plakat!.x, zonaBy("ketintang").plakat!.z);
  const P2 = toSvg(zonaBy("lidah").plakat!.x, zonaBy("lidah").plakat!.z);

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Denah rute kampus UNESA">
      <defs>
        <radialGradient id="mm-island" cx="35%" cy="25%">
          <stop offset="0%" stopColor="#2C3A24" />
          <stop offset="100%" stopColor="#1A1F14" />
        </radialGradient>
        <filter id="mm-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* pulau-pulau kampus */}
      {ZONA.map((z) => {
        const p = toSvg(z.x, z.z);
        return (
          <g key={z.kode}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r={z.radius * S}
              fill="url(#mm-island)"
              stroke="rgba(227,191,109,0.4)"
              strokeWidth="2"
            />
            <circle
              cx={p.cx}
              cy={p.cy}
              r={(z.radius - 0.9) * S}
              fill="none"
              stroke="rgba(227,191,109,0.16)"
              strokeDasharray="3 7"
            />
          </g>
        );
      })}

      {/* jembatan penghubung antar pulau */}
      {PULAU_TERHUBUNG.map(([ka, kb]) => {
        const za = zonaBy(ka);
        const zb = zonaBy(kb);
        const pa = toSvg(za.x, za.z);
        const pb = toSvg(zb.x, zb.z);
        const dx = pb.cx - pa.cx;
        const dy = pb.cy - pa.cy;
        const len = Math.hypot(dx, dy) || 1;
        return (
          <line
            key={`${ka}-${kb}`}
            x1={pa.cx + (dx / len) * za.radius * S}
            y1={pa.cy + (dy / len) * za.radius * S}
            x2={pb.cx - (dx / len) * zb.radius * S}
            y2={pb.cy - (dy / len) * zb.radius * S}
            stroke="#2A241D"
            strokeWidth={7}
            strokeLinecap="round"
          />
        );
      })}

      {/* landmark pusat: lingkaran = pendopo (Ketintang), persegi = rektorat (Lidah) */}
      <g opacity="0.75">
        <circle cx={A.cx} cy={A.cy} r={13} fill="none" stroke="#C9A227" strokeWidth="1.5" />
        <circle cx={A.cx} cy={A.cy} r={5.5} fill="#C9A227" opacity="0.55" />
        <rect x={B.cx - 6.5} y={B.cy - 6.5} width={13} height={13} fill="none" stroke="#C9A227" strokeWidth="1.5" />
        <rect x={B.cx - 2.5} y={B.cy - 2.5} width={5} height={5} fill="#C9A227" opacity="0.55" />
      </g>

      {/* jalur rute */}
      {showRoute && (
        <>
          <path d={path} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={path}
            fill="none"
            stroke="#E3BF6D"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 9"
            className="mm-flow"
          />
        </>
      )}

      {/* penanda arah Magetan (pojok kanan atas, di luar pulau) */}
      <text x={396} y={46} className="mm-note" textAnchor="end">
        MAGETAN ±120 KM ↓
      </text>

      {/* titik fakultas */}
      {FAKULTAS.map((f) => {
        const p = toSvg(f.peta.x, f.peta.z);
        const active = f.slug === activeSlug;
        return (
          <g
            key={f.slug}
            className={`mm-node ${active ? "active" : ""}`}
            onClick={() => onSelect?.(f.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect?.(f.slug);
            }}
            aria-label={`Titik ${f.no}: ${f.akronim}`}
          >
            <circle cx={p.cx} cy={p.cy} r={active ? 14 : 11} fill="#120D09" stroke={f.warna} strokeWidth={active ? 3.5 : 2.4} />
            <text x={p.cx} y={p.cy + 4} textAnchor="middle" className="mm-num">
              {f.no}
            </text>
            {active && (
              <>
                <circle cx={p.cx} cy={p.cy} r={22} fill="none" stroke={f.warna} strokeWidth="1.4" filter="url(#mm-glow)" />
                <rect x={p.cx - 46} y={p.cy - 44} width={92} height={20} rx={10} fill="#120D09" stroke={f.warna} />
                <text x={p.cx} y={p.cy - 30} textAnchor="middle" className="mm-label">
                  {f.akronim}
                </text>
              </>
            )}
          </g>
        );
      })}

      {!compact && (
        <>
          <text x={P1.cx} y={P1.cy + 4} textAnchor="middle" className="mm-zone">
            KAMPUS 1
          </text>
          <text x={P2.cx} y={P2.cy + 4} textAnchor="middle" className="mm-zone">
            KAMPUS 2
          </text>
          <text x={K3.cx} y={K3.cy + 4} textAnchor="middle" className="mm-zone">
            KAMPUS 3
          </text>
          <text x={MGT.cx} y={MGT.cy + 4} textAnchor="middle" className="mm-zone">
            MAGETAN
          </text>
        </>
      )}

      {/* arah utara */}
      <g transform={`translate(${C - 160}, ${C - 150})`} opacity="0.8">
        <path d="M0,14 L6,-10 L0,-4 L-6,-10 Z" fill="#E3BF6D" />
        <text x="0" y="26" textAnchor="middle" className="mm-note">
          U
        </text>
      </g>
    </svg>
  );
}
