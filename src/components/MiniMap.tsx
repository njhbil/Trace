import { FAKULTAS } from "../data/fakultas";

const S = 5.5; // skala: dunia (meter) → piksel SVG
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

  const A = toSvg(-10, -1);
  const B = toSvg(10, 1);

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

      {/* pulau */}
      <circle cx={C} cy={C} r={187} fill="url(#mm-island)" stroke="rgba(227,191,109,0.35)" strokeWidth="2" />
      <circle cx={C} cy={C} r={179} fill="none" stroke="rgba(227,191,109,0.14)" strokeDasharray="2 8" />

      {/* cincin kluster kampus */}
      <circle cx={A.cx} cy={A.cy} r={9.2 * S} fill="none" stroke="rgba(227,191,109,0.22)" strokeDasharray="5 7" />
      <circle cx={B.cx} cy={B.cy} r={9.6 * S} fill="none" stroke="rgba(227,191,109,0.22)" strokeDasharray="5 7" />

      {/* pendopo pusat */}
      <g opacity="0.75">
        <circle cx={C} cy={C} r={16} fill="none" stroke="#C9A227" strokeWidth="1.5" />
        <circle cx={C} cy={C} r={7} fill="#C9A227" opacity="0.55" />
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

      {/* penanda arah Magetan */}
      <text x={396} y={toSvg(27, 10).cy - 24} className="mm-note" textAnchor="end">
        ← MAGETAN ±120 KM
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
          <text x={A.cx} y={A.cy + 4} textAnchor="middle" className="mm-zone">
            KAMPUS 1
          </text>
          <text x={B.cx} y={B.cy + 4} textAnchor="middle" className="mm-zone">
            KAMPUS 2
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
