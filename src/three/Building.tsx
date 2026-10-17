import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Fakultas } from "../data/fakultas";
import { labelTexture, numberTexture } from "./textures";

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

/**
 * Satu gedung fakultas: badan bangunan rendah + atap joglo bertingkat,
 * pilar pendopo di depan, jendela menyala, dan penanda bernomor rute.
 */
export default function Building({
  f,
  index,
  active,
  dimmed,
  routeVisible,
  shadows,
  onHover,
  onSelect,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const [hover, setHover] = useState(false);

  const { x, z, rotasi = 0 } = f.peta;

  // variasi ukuran gedung yang deterministik per fakultas
  const size = useMemo(() => {
    const w = 4.4 + ((index * 7) % 5) * 0.42;
    const d = 3.6 + ((index * 3) % 4) * 0.4;
    const h = 3.0 + ((index * 5) % 4) * 0.55;
    return { w, d, h };
  }, [index]);

  const numTex = useMemo(() => numberTexture(String(f.no), f.warna), [f.no, f.warna]);
  const labTex = useMemo(() => labelTexture(f.akronim, f.warna), [f.akronim, f.warna]);

  useEffect(
    () => () => {
      numTex.dispose();
      labTex.dispose();
    },
    [numTex, labTex]
  );

  const accent = useMemo(() => new THREE.Color(f.warna), [f.warna]);
  const winColor = useMemo(
    () => new THREE.Color(f.warna).lerp(new THREE.Color("#FFD98A"), 0.55),
    [f.warna]
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    // animasi melayang penanda + goyang halus
    if (marker.current) {
      marker.current.position.y = size.h + 3.1 + Math.sin(t * 1.1 + index) * 0.22;
      marker.current.rotation.y += dt * (hover || active ? 1.1 : 0.35);
    }
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial;
      const target = active ? 0.42 : hover ? 0.3 : dimmed ? 0.05 : 0.16;
      m.opacity += (target - m.opacity) * Math.min(1, dt * 6);
    }
    if (glow.current) {
      const target = active ? 1.4 : hover ? 1.0 : 0.5;
      glow.current.emissiveIntensity += (target - glow.current.emissiveIntensity) * Math.min(1, dt * 6);
    }

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

  const roofMat = (
        <meshStandardMaterial color="#6B4128" roughness={0.85} metalness={0.05} />
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
        <mesh position={[0, 0.18, 0]} receiveShadow={shadows} castShadow={shadows}>
          <boxGeometry args={[size.w + 0.9, 0.36, size.d + 0.9]} />
          <meshStandardMaterial color="#3E3226" roughness={1} />
        </mesh>

        {/* badan utama */}
        <mesh position={[0, size.h / 2 + 0.36, 0]} castShadow={shadows} receiveShadow={shadows}>
          <boxGeometry args={[size.w, size.h, size.d]} />
          <meshStandardMaterial color="#5C4A36" roughness={0.92} metalness={0.04} />
        </mesh>

        {/* sayap kiri-kanan (gedung menyilang ala kampus) */}
        <mesh position={[-size.w * 0.62, size.h * 0.36 + 0.36, 0]} castShadow={shadows}>
          <boxGeometry args={[size.w * 0.36, size.h * 0.72, size.d * 0.82]} />
          <meshStandardMaterial color="#50412F" roughness={0.95} />
        </mesh>
        <mesh position={[size.w * 0.62, size.h * 0.36 + 0.36, 0]} castShadow={shadows}>
          <boxGeometry args={[size.w * 0.36, size.h * 0.72, size.d * 0.82]} />
          <meshStandardMaterial color="#50412F" roughness={0.95} />
        </mesh>

        {/* atap joglo bertingkat */}
        <mesh position={[0, size.h + 1.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows}>
          <coneGeometry args={[Math.max(size.w, size.d) * 0.78, 1.7, 4]} />
          {roofMat}
        </mesh>
        <mesh position={[0, size.h + 2.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows}>
          <coneGeometry args={[Math.max(size.w, size.d) * 0.44, 1.2, 4]} />
          {roofMat}
        </mesh>
        {/* mahkota atap */}
        <mesh position={[0, size.h + 2.85, 0]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial
            color={f.warna}
            emissive={f.warna}
            emissiveIntensity={1.2}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* pilar pendopo di depan */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[-size.w * 0.36 + (i * size.w * 0.72) / 3, (size.h * 0.72) / 2 + 0.36, size.d * 0.56]}
            castShadow={shadows}
          >
            <cylinderGeometry args={[0.11, 0.13, size.h * 0.72, 8]} />
            <meshStandardMaterial color="#C9A227" roughness={0.45} metalness={0.65} />
          </mesh>
        ))}

        {/* kanopi pintu masuk */}
        <mesh position={[0, size.h * 0.78, size.d * 0.56]} castShadow={shadows}>
          <boxGeometry args={[size.w * 0.72, 0.16, 1.1]} />
          <meshStandardMaterial color="#6D5410" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* jendela menyala */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * size.w * 0.28, size.h * 0.55, size.d / 2 + 0.02]}>
            <planeGeometry args={[size.w * 0.24, size.h * 0.3]} />
            <meshStandardMaterial
              ref={s === 1 ? glow : undefined}
              color="#1B1309"
              emissive={winColor}
              emissiveIntensity={0.5}
              roughness={0.4}
            />
          </mesh>
        ))}

        {/* garis aksen kuningan di badan gedung */}
        <mesh position={[0, size.h + 0.4, 0]}>
          <boxGeometry args={[size.w + 0.16, 0.1, size.d + 0.16]} />
          <meshStandardMaterial color={f.warna} emissive={accent} emissiveIntensity={0.55} roughness={0.4} />
        </mesh>
      </group>

      {/* ---- berkas cahaya penunjuk ---- */}
      <mesh ref={beam} position={[0, (size.h + 3) / 2 + 0.4, 0]}>
        <cylinderGeometry args={[0.5, 1.5, size.h + 3, 16, 1, true]} />
        <meshBasicMaterial
          color={f.warna}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ---- penanda bernomor ---- */}
      <group ref={marker} position={[0, size.h + 3.1, 0]}>
        {/* cincin berdiri — berputar seperti koin, terlihat dari segala sisi */}
        <mesh>
          <torusGeometry args={[1.0, 0.055, 8, 40]} />
          <meshStandardMaterial
            color={f.warna}
            emissive={accent}
            emissiveIntensity={active ? 2.4 : 1.1}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        <sprite
          position={[0, 0, 0]}
          scale={[1.5, 1.5, 1]}
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
          <spriteMaterial map={numTex} transparent depthTest={false} />
        </sprite>

        {/* label nama — muncul saat hover / aktif */}
        {(hover || active) && (
          <sprite position={[0, 1.7, 0]} scale={[3.4, 0.85, 1]} raycast={() => null}>
            <spriteMaterial map={labTex} transparent depthTest={false} />
          </sprite>
        )}
      </group>

      {/* label ringkas ala UI game saat hover */}
      {hover && !active && (
        <Html
          position={[0, size.h + 5.0, 0]}
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
