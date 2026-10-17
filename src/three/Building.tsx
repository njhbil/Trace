import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Fakultas, RagamGedung } from "../data/fakultas";
import { labelTexture, numberTexture, windowGridTexture } from "./textures";

interface Props {
  f: Fakultas;
  index: number;
  active: boolean;
  dimmed: boolean;
  routeVisible: boolean;
  shadows: boolean;
  onHover: (slug: string | null) => void;
  onSelect: (f: Fakultas) => void;
}

/** Bawaan ukuran tiap ragam gedung (satuan peta; bisa ditimpa `dimensiGedung`). */
const DIM: Record<RagamGedung, { w: number; d: number; h: number }> = {
  menara: { w: 5.2, d: 4.4, h: 7.0 },
  kolonial: { w: 6.5, d: 4.6, h: 3.6 },
  industri: { w: 7.2, d: 5.0, h: 3.2 },
  riset: { w: 5.6, d: 4.8, h: 4.4 },
  joglo: { w: 5.4, d: 4.6, h: 3.2 },
  olahraga: { w: 7.4, d: 6.2, h: 4.2 },
  minimalis: { w: 5.8, d: 4.4, h: 4.6 },
  medis: { w: 5.6, d: 4.8, h: 6.0 },
  kecil: { w: 4.4, d: 3.6, h: 2.8 },
};

/** Warna badan & atap per ragam (plester sogan, tembaga, kayu jati). */
const PALET: Record<RagamGedung, { badan: string; atap: string }> = {
  menara: { badan: "#6E6252", atap: "#43382B" },
  kolonial: { badan: "#8A7355", atap: "#6B3A2A" },
  industri: { badan: "#7A6A55", atap: "#4E4436" },
  riset: { badan: "#5F6B72", atap: "#3E474D" },
  joglo: { badan: "#7A5236", atap: "#6B4128" },
  olahraga: { badan: "#6D7A6A", atap: "#C4BCA6" },
  minimalis: { badan: "#7C7568", atap: "#3A362E" },
  medis: { badan: "#C6BFAE", atap: "#55554C" },
  kecil: { badan: "#867052", atap: "#6B4128" },
};

/**
 * Satu gedung fakultas. Bentuknya mengikuti `ragamGedung` di data — meniru
 * ciri khas bangunan asli tiap fakultas (menara kuliah, fasad kolonial,
 * bangsal industri, kubah riset, joglo, gimnasium, blok minimalis,
 * menara medis, atau gedung kecil). Semua ilustratif, bukan salinan persis.
 */
export default function Building({
  f,
  index,
  active,
  dimmed,
  shadows,
  onHover,
  onSelect,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  const { x, z, rotasi = 0 } = f.peta;
  const ragam = f.ragamGedung;

  // ukuran gedung: bawaan ragam, sedikit bervariasi bila data tidak menentukan
  const size = useMemo(() => {
    const custom = f.dimensiGedung;
    if (custom) return custom;
    const base = DIM[ragam];
    const v = 1 + ((index * 7) % 3) * 0.05;
    return { w: +(base.w * v).toFixed(2), d: +(base.d * (2 - v)).toFixed(2), h: +(base.h * v).toFixed(2) };
  }, [index, ragam, f.dimensiGedung]);
  const { w, d, h } = size;

  const accent = useMemo(() => new THREE.Color(f.warna), [f.warna]);
  const winHex = useMemo(
    () => new THREE.Color(f.warna).lerp(new THREE.Color("#FFD98A"), 0.55).getStyle(),
    [f.warna]
  );

  const numTex = useMemo(() => numberTexture(String(f.no), f.warna), [f.no, f.warna]);
  const labTex = useMemo(() => labelTexture(f.akronim, f.warna), [f.akronim, f.warna]);
  const rows = Math.max(2, Math.round(h * 0.9));
  const winDepan = useMemo(
    () => windowGridTexture(Math.max(3, Math.round(w * 1.1)), rows, winHex),
    [w, rows, winHex]
  );
  const winSamping = useMemo(
    () => windowGridTexture(Math.max(2, Math.round(d * 1.1)), rows, winHex),
    [d, rows, winHex]
  );

  // material bersama per gedung (dibuang saat komponen lepas)
  const m = useMemo(() => {
    const p = PALET[ragam];
    return {
      badan: new THREE.MeshStandardMaterial({ color: p.badan, roughness: 0.9, metalness: 0.05 }),
      atap: new THREE.MeshStandardMaterial({ color: p.atap, roughness: 0.85, metalness: 0.05 }),
      pilar: new THREE.MeshStandardMaterial({ color: "#C9A227", roughness: 0.45, metalness: 0.65 }),
      putih: new THREE.MeshStandardMaterial({ color: "#D9CDB4", roughness: 0.8 }),
      kayu: new THREE.MeshStandardMaterial({ color: "#7A5236", roughness: 0.95 }),
      tembaga: new THREE.MeshStandardMaterial({ color: "#B98A3E", roughness: 0.35, metalness: 0.7 }),
      bata: new THREE.MeshStandardMaterial({ color: "#8A4A32", roughness: 0.95 }),
      rumput: new THREE.MeshStandardMaterial({ color: "#3F6B3C", roughness: 1 }),
      kaca: new THREE.MeshStandardMaterial({
        color: "#14100A",
        roughness: 0.3,
        metalness: 0.4,
        emissive: new THREE.Color(winHex),
        emissiveIntensity: 0.5,
      }),
      aksen: new THREE.MeshStandardMaterial({
        color: f.warna,
        emissive: accent,
        emissiveIntensity: 0.55,
        roughness: 0.4,
      }),
      mahkota: new THREE.MeshStandardMaterial({
        color: f.warna,
        emissive: accent,
        emissiveIntensity: 1.4,
        roughness: 0.3,
        metalness: 0.7,
      }),
      jam: new THREE.MeshStandardMaterial({
        color: "#F4EBDA",
        emissive: new THREE.Color("#E3BF6D"),
        emissiveIntensity: 0.5,
        roughness: 0.5,
      }),
    };
  }, [ragam, f.warna, winHex, accent]);

  useEffect(
    () => () => {
      numTex.dispose();
      labTex.dispose();
      winDepan.dispose();
      winSamping.dispose();
      Object.values(m).forEach((b) => b.dispose());
    },
    [numTex, labTex, winDepan, winSamping, m]
  );

  useFrame((_, dt) => {
    // aksen kuningan menyala saat disorot
    const glowTarget = active ? 1.3 : hover ? 0.95 : 0.5;
    m.aksen.emissiveIntensity += (glowTarget - m.aksen.emissiveIntensity) * Math.min(1, dt * 6);

    // skala saat hover / aktif
    if (group.current) {
      const target = dimmed && !active ? 0.92 : hover || active ? 1.06 : 1;
      const s = group.current.scale.x + (target - group.current.scale.x) * Math.min(1, dt * 7);
      group.current.scale.setScalar(s);
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onSelect(f);
  };

  /** fasad jendela: pita kaca menyala di muka badan */
  const jendela = (posisi: [number, number, number], lebar: number, rotY = 0, tex = winDepan) => (
    <mesh position={posisi} rotation={[0, rotY, 0]}>
      <planeGeometry args={[lebar, h * 0.78]} />
      <meshBasicMaterial map={tex} transparent />
    </mesh>
  );

  return (
    <group position={[x, 0, z]} rotation={[0, rotasi, 0]}>
      {/* ---- badan gedung ---- */}
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          onHover(f.slug);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={handleClick}
      >
        {/* plinta */}
        <mesh position={[0, 0.18, 0]} receiveShadow={shadows} castShadow={shadows} material={m.badan}>
          <boxGeometry args={[w + 0.9, 0.36, d + 0.9]} />
        </mesh>

        {/* ========== ragam khas tiap fakultas ========== */}
        {ragam === "menara" && (
          <group>
            {/* podium rendah */}
            <mesh position={[0, 0.85, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w + 1.8, 1.0, d + 1.5]} />
            </mesh>
            {/* menara utama bertingkat */}
            <mesh position={[0, 1.35 + h / 2, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w, h, d]} />
            </mesh>
            {/* pita aksen antar lantai */}
            {[0.3, 0.62].map((k) => (
              <mesh key={k} position={[0, 1.35 + h * k, 0]} material={m.aksen}>
                <boxGeometry args={[w + 0.14, 0.12, d + 0.14]} />
              </mesh>
            ))}
            {/* fasad kaca depan & samping */}
            {jendela([0, 1.35 + h / 2, d / 2 + 0.03], w * 0.82)}
            {jendela([w / 2 + 0.03, 1.35 + h / 2, 0], d * 0.8, Math.PI / 2, winSamping)}
            {/* sayap rendah di belakang (menjaga lebar tapak) */}
            <mesh position={[-(w * 0.22), 1.05, -(d * 0.35)]} castShadow={shadows} material={m.badan}>
              <boxGeometry args={[2.4, 1.4, d * 0.5]} />
            </mesh>
            {/* mahkota atap + tiang bendera */}
            <mesh position={[0, 1.35 + h + 0.13, 0]} castShadow={shadows} material={m.atap}>
              <boxGeometry args={[w + 0.4, 0.26, d + 0.4]} />
            </mesh>
            <mesh position={[w * 0.3, 1.35 + h + 1.2, 0]} material={m.pilar}>
              <cylinderGeometry args={[0.05, 0.05, 2.0, 6]} />
            </mesh>
            <mesh position={[w * 0.3, 1.35 + h + 2.25, 0]} material={m.mahkota}>
              <sphereGeometry args={[0.1, 10, 10]} />
            </mesh>
          </group>
        )}

        {ragam === "kolonial" && (
          <group>
            {/* badan utama + atap pelana */}
            <mesh position={[0, h / 2 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w, h, d]} />
            </mesh>
            <mesh position={[0, h + 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows} material={m.atap}>
              <coneGeometry args={[Math.max(w, d) * 0.74, 0.95, 4]} />
            </mesh>
            {/* deret kolom depan */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh
                key={i}
                position={[-w * 0.4 + (i * w * 0.8) / 5, h * 0.45 + 0.36, d / 2 + 0.5]}
                castShadow={shadows}
                material={m.putih}
              >
                <cylinderGeometry args={[0.13, 0.15, h * 0.9, 10]} />
              </mesh>
            ))}
            {/* entablatur + pediment segitiga */}
            <mesh position={[0, h * 0.9 + 0.42, d / 2 + 0.5]} castShadow={shadows} material={m.putih}>
              <boxGeometry args={[w * 0.94, 0.26, 0.66]} />
            </mesh>
            <mesh
              position={[0, h * 0.9 + 0.42 + 0.13 + 0.3, d / 2 + 0.5]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow={shadows}
              material={m.atap}
            >
              <cylinderGeometry args={[0.6, 0.6, w * 0.94, 3]} />
            </mesh>
            {/* jendela klasik & pintu utama */}
            {jendela([-w * 0.28, h * 0.55, d / 2 + 0.03], w * 0.3)}
            {jendela([w * 0.28, h * 0.55, d / 2 + 0.03], w * 0.3)}
            {jendela([w / 2 + 0.03, h * 0.55, 0], d * 0.7, Math.PI / 2, winSamping)}
            <mesh position={[0, h * 0.3 + 0.36, d / 2 + 0.03]} material={m.kaca}>
              <planeGeometry args={[w * 0.22, h * 0.55]} />
            </mesh>
            {/* pita aksen kuningan di garis atap */}
            <mesh position={[0, h + 0.38, 0]} material={m.aksen}>
              <boxGeometry args={[w + 0.16, 0.1, d + 0.16]} />
            </mesh>
          </group>
        )}

        {ragam === "industri" && (
          <group>
            {/* bangsal kerja lebar */}
            <mesh position={[0, h * 0.55 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w, h * 1.1, d]} />
            </mesh>
            {/* atap gerigi (sawtooth) khas bengkel & pabrik */}
            {[0, 1, 2, 3].map((i) => (
              <group key={i} position={[-w * 0.34 + (i * w * 0.68) / 3, h * 1.1 + 0.75, 0]}>
                <mesh rotation={[0, 0, -0.45]} castShadow={shadows} material={m.atap}>
                  <boxGeometry args={[w * 0.22, 0.12, d * 0.98]} />
                </mesh>
                <mesh position={[w * 0.1, -0.28, 0]} rotation={[0, 0, Math.PI / 2 - 0.45]} material={m.kaca}>
                  <boxGeometry args={[d * 0.9, 0.5, 0.08]} />
                </mesh>
              </group>
            ))}
            {/* cerobong asap bata */}
            <mesh position={[w * 0.42, h * 0.6 + 2.1, -d * 0.3]} castShadow={shadows} material={m.bata}>
              <cylinderGeometry args={[0.22, 0.3, 3.6, 12]} />
            </mesh>
            {[1.4, 2.6].map((yy) => (
              <mesh key={yy} position={[w * 0.42, yy + 0.36, -d * 0.3]} material={m.atap}>
                <cylinderGeometry args={[0.32, 0.32, 0.18, 12]} />
              </mesh>
            ))}
            {/* aneks rendah di belakang (menjaga lebar tapak) */}
            <mesh position={[-(w * 0.28), 0.95, -(d * 0.32)]} castShadow={shadows} material={m.badan}>
              <boxGeometry args={[2.0, 1.2, d * 0.56]} />
            </mesh>
            <mesh position={[0, h * 0.62, d / 2 + 0.5]} castShadow={shadows} material={m.atap}>
              <boxGeometry args={[w * 0.5, 0.14, 1.0]} />
            </mesh>
            {/* pita jendela memanjang */}
            {jendela([0, h * 0.62, d / 2 + 0.03], w * 0.86)}
            {jendela([w / 2 + 0.03, h * 0.62, 0], d * 0.8, Math.PI / 2, winSamping)}
            {/* pita aksen */}
            <mesh position={[0, h * 1.1 + 0.36, 0]} material={m.aksen}>
              <boxGeometry args={[w + 0.14, 0.12, d + 0.14]} />
            </mesh>
          </group>
        )}

        {ragam === "riset" && (
          <group>
            {/* blok laboratorium */}
            <mesh position={[0, h / 2 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w, h, d]} />
            </mesh>
            {/* kubah observatorium tembaga */}
            <group position={[w * 0.26, h + 0.36, -d * 0.16]}>
              <mesh position={[0, 0.5, 0]} castShadow={shadows} material={m.tembaga}>
                <cylinderGeometry args={[1.15, 1.25, 1.0, 20]} />
              </mesh>
              <mesh position={[0, 1.0, 0]} castShadow={shadows} material={m.tembaga}>
                <sphereGeometry args={[1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
            </group>
            {/* silo tabung (ruang reaktor/simulasi) di belakang blok */}
            <mesh position={[-(w * 0.28), h * 0.4 + 0.36, -(d * 0.3)]} castShadow={shadows} material={m.badan}>
              <cylinderGeometry args={[0.9, 0.95, h * 0.8, 16]} />
            </mesh>
            <mesh position={[-(w * 0.28), h * 0.8 + 0.55, -(d * 0.3)]} material={m.aksen}>
              <cylinderGeometry args={[0.98, 0.98, 0.16, 16]} />
            </mesh>
            {/* pagar atap */}
            <mesh position={[0, h + 0.55, d / 2 - 0.3]} material={m.pilar}>
              <boxGeometry args={[w * 0.9, 0.08, 0.08]} />
            </mesh>
            {jendela([0, h * 0.52, d / 2 + 0.03], w * 0.84)}
            {jendela([w / 2 + 0.03, h * 0.52, 0], d * 0.8, Math.PI / 2, winSamping)}
            <mesh position={[0, h + 0.1, 0]} material={m.aksen}>
              <boxGeometry args={[w + 0.14, 0.1, d + 0.14]} />
            </mesh>
          </group>
        )}

        {ragam === "joglo" && (
          <group>
            {/* badan pendopo bertingkat */}
            <mesh position={[0, h * 0.35 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows} material={m.kayu}>
              <boxGeometry args={[w, h * 0.7, d]} />
            </mesh>
            {/* pilar depan kuningan */}
            {[0, 1, 2, 3].map((i) => (
              <mesh
                key={i}
                position={[-w * 0.36 + (i * w * 0.72) / 3, h * 0.35 + 0.36, d / 2 + 0.35]}
                castShadow={shadows}
                material={m.pilar}
              >
                <cylinderGeometry args={[0.1, 0.12, h * 0.7, 8]} />
              </mesh>
            ))}
            {/* atap tumpang dua khas joglo */}
            <mesh position={[0, h * 0.7 + 1.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows} material={m.atap}>
              <coneGeometry args={[Math.max(w, d) * 0.8, 1.5, 4]} />
            </mesh>
            <mesh position={[0, h * 0.7 + 2.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows} material={m.atap}>
              <coneGeometry args={[Math.max(w, d) * 0.45, 1.1, 4]} />
            </mesh>
            <mesh position={[0, h * 0.7 + 2.9, 0]} material={m.mahkota}>
              <sphereGeometry args={[0.17, 12, 12]} />
            </mesh>
            {/* teras depan beratap kecil — dangkal agar tak menyerbu alun-alun */}
            <group position={[0, 0, d / 2 + 0.45]}>
              <mesh position={[0, 0.13, 0]} receiveShadow={shadows} material={m.badan}>
                <boxGeometry args={[w * 0.8, 0.26, 1.4]} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * w * 0.3, h * 0.35, 0.5]} material={m.pilar}>
                  <cylinderGeometry args={[0.08, 0.09, h * 0.7, 8]} />
                </mesh>
              ))}
              <mesh position={[0, h * 0.7 + 0.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows} material={m.atap}>
                <coneGeometry args={[w * 0.26, 0.8, 4]} />
              </mesh>
            </group>
            {jendela([0, h * 0.38, d / 2 + 0.03], w * 0.7)}
            <mesh position={[0, h * 0.7 + 0.42, 0]} material={m.aksen}>
              <boxGeometry args={[w + 0.14, 0.1, d + 0.14]} />
            </mesh>
          </group>
        )}

        {ragam === "olahraga" && (
          <group>
            {/* badan gimnasium */}
            <mesh position={[0, h * 0.42 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w, h * 0.84, d]} />
            </mesh>
            {/* atap lengkung (half-barrel) khas gedung olahraga */}
            <mesh
              position={[0, h * 0.84 + 0.36, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              castShadow={shadows}
              material={m.atap}
            >
              <cylinderGeometry args={[w / 2, w / 2, d * 0.96, 24, 1, false, 0, Math.PI]} />
            </mesh>
            {/* menara tiketing + jam (rapat dalam tapak) */}
            <mesh position={[w * 0.36, h * 0.75 + 0.36, d * 0.3]} castShadow={shadows} material={m.badan}>
              <boxGeometry args={[1.2, h * 1.5, 1.2]} />
            </mesh>
            <mesh position={[w * 0.36, h * 1.2 + 0.36, d * 0.3 + 0.61]} material={m.jam}>
              <circleGeometry args={[0.42, 20]} />
            </mesh>
            {/* lapangan latihan di depan */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, d / 2 + 1.9]} receiveShadow={shadows} material={m.rumput}>
              <planeGeometry args={[w * 0.9, 2.4]} />
            </mesh>
            {jendela([-w * 0.2, h * 0.5, d / 2 + 0.03], w * 0.34)}
            {jendela([w * 0.2, h * 0.5, d / 2 + 0.03], w * 0.34)}
            <mesh position={[0, h * 0.84 + 0.4, 0]} material={m.aksen}>
              <boxGeometry args={[w + 0.14, 0.12, d + 0.14]} />
            </mesh>
          </group>
        )}

        {ragam === "minimalis" && (
          <group>
            {/* slab bawah */}
            <mesh position={[0, h * 0.24 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w, h * 0.48, d]} />
            </mesh>
            {/* pita kaca melingkari tengah */}
            <mesh position={[0, h * 0.48 + 0.66, 0]} material={m.kaca}>
              <boxGeometry args={[w * 0.99, 0.56, d * 0.99]} />
            </mesh>
            {/* slab atas yang menggantung sedikit ke samping */}
            <mesh
              position={[w * 0.08, h * 0.48 + 0.94 + h * 0.23, 0]}
              castShadow={shadows}
              material={m.badan}
            >
              <boxGeometry args={[w * 0.84, h * 0.46, d * 0.9]} />
            </mesh>
            {/* atap datar + pot tanaman */}
            <mesh position={[w * 0.08, h * 0.48 + 0.94 + h * 0.46 + 0.09, 0]} material={m.atap}>
              <boxGeometry args={[w * 0.88, 0.18, d * 0.94]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * w * 0.26, 0.5, d / 2 + 0.7]} castShadow={shadows} material={m.badan}>
                <boxGeometry args={[1.1, 0.5, 0.6]} />
              </mesh>
            ))}
            {[-1, 1].map((s) => (
              <mesh key={`r${s}`} position={[s * w * 0.26, 0.85, d / 2 + 0.7]} material={m.rumput}>
                <boxGeometry args={[1.0, 0.24, 0.5]} />
              </mesh>
            ))}
            {jendela([0, h * 0.26, d / 2 + 0.03], w * 0.8)}
            {jendela([w * 0.08, h * 0.78, (d * 0.9) / 2 + 0.03], w * 0.7)}
            <mesh position={[w * 0.08, h * 0.94 + h * 0.46 + 0.1, 0]} material={m.aksen}>
              <boxGeometry args={[w * 0.86, 0.1, d * 0.92]} />
            </mesh>
          </group>
        )}

        {ragam === "medis" && (
          <group>
            {/* podium + menara bertingkat */}
            <mesh position={[0, 0.62, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w + 1.6, 1.24, d + 1.2]} />
            </mesh>
            <mesh
              position={[0, 1.24 + h / 2, -d * 0.08]}
              castShadow={shadows}
              receiveShadow={shadows}
              material={m.badan}
            >
              <boxGeometry args={[w * 0.9, h, d * 0.85]} />
            </mesh>
            {/* pita aksen warna fakultas (identitas medis) */}
            <mesh position={[0, 1.24 + h * 0.55, -d * 0.08]} material={m.aksen}>
              <boxGeometry args={[w * 0.92, 0.34, d * 0.87]} />
            </mesh>
            {/* jendela kamar rawat */}
            {jendela([0, 1.24 + h * 0.62, (d * 0.85) / 2 - d * 0.08 + 0.03], w * 0.78)}
            {jendela([(w * 0.9) / 2 + 0.03, 1.24 + h * 0.62, -d * 0.08], d * 0.72, Math.PI / 2, winSamping)}
            {/* kanopi IGD + tiang */}
            <mesh position={[0, 1.55, d / 2 + 0.6]} castShadow={shadows} material={m.atap}>
              <boxGeometry args={[w * 0.72, 0.16, 1.5]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * w * 0.3, 0.95, d / 2 + 1.25]} material={m.pilar}>
                <cylinderGeometry args={[0.09, 0.1, 1.2, 8]} />
              </mesh>
            ))}
            {/* mahkota menara: gudang mesin + lampu navigasi */}
            <mesh position={[0, 1.24 + h + 0.22, -d * 0.08]} castShadow={shadows} material={m.atap}>
              <boxGeometry args={[w * 0.5, 0.44, d * 0.5]} />
            </mesh>
            <mesh position={[0, 1.24 + h + 0.8, -d * 0.08]} material={m.pilar}>
              <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
            </mesh>
            <mesh position={[0, 1.24 + h + 1.3, -d * 0.08]} material={m.mahkota}>
              <sphereGeometry args={[0.09, 10, 10]} />
            </mesh>
          </group>
        )}

        {ragam === "kecil" && (
          <group>
            {/* gedung utama dua lantai */}
            <mesh position={[0, h / 2 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows} material={m.badan}>
              <boxGeometry args={[w, h, d]} />
            </mesh>
            {/* serambi joglo kecil */}
            <group position={[0, 0, d / 2 + 1.0]}>
              <mesh position={[0, 0.12, 0]} receiveShadow={shadows} material={m.badan}>
                <boxGeometry args={[w * 0.7, 0.24, 1.6]} />
              </mesh>
              {[-1, 1].map((s) => (
                <mesh key={s} position={[s * w * 0.28, h * 0.32, 0.6]} material={m.pilar}>
                  <cylinderGeometry args={[0.08, 0.09, h * 0.64, 8]} />
                </mesh>
              ))}
              <mesh position={[0, h * 0.64 + 0.42, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows} material={m.atap}>
                <coneGeometry args={[w * 0.52, 0.8, 4]} />
              </mesh>
            </group>
            {jendela([-w * 0.24, h * 0.62, d / 2 + 0.03], w * 0.3)}
            {jendela([w * 0.24, h * 0.62, d / 2 + 0.03], w * 0.3)}
            {jendela([-w * 0.24, h * 0.28, d / 2 + 0.03], w * 0.3)}
            <mesh position={[0, h + 0.4, 0]} material={m.aksen}>
              <boxGeometry args={[w + 0.14, 0.1, d + 0.14]} />
            </mesh>
          </group>
        )}
      </group>

      {/* ---- rambu bernomor: tiang kuningan + plat datar di depan gedung ---- */}
      <group ref={marker} position={[0, 0, d / 2 + 0.9]}>
        {/* tiang */}
        <mesh position={[0, (h + 2.4) / 2 + 0.36, 0]} material={m.pilar}>
          <cylinderGeometry args={[0.05, 0.05, h + 2.4, 8]} />
        </mesh>
        {/* plat nomor — menghadap kamera, tanpa animasi */}
        <sprite
          position={[0, h + 2.7, 0]}
          scale={[1.25, 1.25, 1]}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
            onHover(f.slug);
          }}
          onPointerOut={() => {
            setHover(false);
            onHover(null);
          }}
        >
          <spriteMaterial map={numTex} transparent />
        </sprite>

        {/* label nama — muncul saat hover / aktif */}
        {(hover || active) && (
          <sprite position={[0, h + 3.8, 0]} scale={[3.4, 0.85, 1]} raycast={() => null}>
            <spriteMaterial map={labTex} transparent />
          </sprite>
        )}
      </group>

      {/* label ringkas ala UI game saat hover */}
      {hover && !active && (
        <Html
          position={[0, h + 4.6, d / 2 + 0.9]}
          center
          distanceFactor={26}
          style={{ pointerEvents: "none" }}
          zIndexRange={[40, 0]}
        >
          <div className="marker-tip">
            <b>{f.akronim}</b>
            <span>{f.namaPendek}</span>
            <em>Klik untuk masuk →</em>
          </div>
        </Html>
      )}
    </group>
  );
}
