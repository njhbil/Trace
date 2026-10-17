import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { groundTexture, labelTexture, mulberry32 } from "./textures";
import { ZONA } from "../data/fakultas";

/* ------------------------------------------------------------------ */
/*  Jalan: dua lingkar kampus + penyambung + jalan keluar kota         */
/* ------------------------------------------------------------------ */
function roadAngle(dx: number, dz: number) {
  return Math.atan2(dz, dx);
}

function RoadSeg({
  a,
  b,
  w = 3.2,
  shadows,
  y = 0.055,
}: {
  a: { x: number; z: number };
  b: { x: number; z: number };
  w?: number;
  shadows: boolean;
  y?: number;
}) {
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  const ang = roadAngle(b.x - a.x, b.z - a.z);
  return (
    <mesh rotation={[-Math.PI / 2, 0, -ang]} position={[(a.x + b.x) / 2, y, (a.z + b.z) / 2]} receiveShadow={shadows}>
      <planeGeometry args={[len, w]} />
      <meshStandardMaterial color="#2A241D" roughness={1} />
    </mesh>
  );
}

function RingRoad({
  c,
  inner,
  outer,
  shadows,
}: {
  c: { x: number; z: number };
  inner: number;
  outer: number;
  shadows: boolean;
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[c.x, 0.05, c.z]} receiveShadow={shadows}>
        <ringGeometry args={[inner, outer, 64]} />
        <meshStandardMaterial color="#2A241D" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[c.x, 0.068, c.z]}>
        <ringGeometry args={[(inner + outer) / 2 - 0.09, (inner + outer) / 2 + 0.09, 96]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function Roads({ shadows }: { shadows: boolean }) {
  const A = { x: -10, z: -1 };
  const B = { x: 10, z: 1 };
  const M = { x: 27, z: 10 }; // arah Magetan

  return (
    <group>
      <RingRoad c={A} inner={10.4} outer={12.8} shadows={shadows} />
      <RingRoad c={B} inner={10.4} outer={12.8} shadows={shadows} />

      {/* penyambung selatan (di bawah pendopo) */}
      <RoadSeg a={{ x: -10, z: -12.4 }} b={{ x: 10, z: -10.6 }} shadows={shadows} />

      {/* jalan penghubung dua kampus */}
      <RoadSeg a={{ x: -10, z: 11.6 }} b={{ x: 10, z: 11.8 }} shadows={shadows} />

      {/* jalan keluar kota menuju Magetan */}
      <RoadSeg a={{ x: 21.4, z: 5.4 }} b={M} w={2.8} shadows={shadows} />
      <RoadSeg a={M} b={{ x: 32.5, z: 13.5 }} w={2.8} shadows={shadows} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Rute tur (jalur emas bercahaya) + "komet" penunjuk arah            */
/* ------------------------------------------------------------------ */
export function RoutePath({ points, visible }: { points: { x: number; z: number }[]; visible: boolean }) {
  const comet = useRef<THREE.Group>(null);
  const flow = useRef(0);

  const curve = useMemo(() => {
    if (points.length < 2) return null;
    const pts = points.map((p) => new THREE.Vector3(p.x, 0.55, p.z));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
  }, [points]);

  const tubeGeo = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 220, 0.14, 8, false);
  }, [curve]);

  useFrame((_, dt) => {
    if (!visible || !curve || !comet.current) return;
    flow.current = (flow.current + dt * 0.045) % 1;
    const p = curve.getPointAt(flow.current);
    comet.current.position.copy(p);
    comet.current.visible = true;
  });

  if (!curve || !tubeGeo) return null;

  return (
    <group>
      <mesh geometry={tubeGeo} visible={visible} raycast={() => null}>
        <meshStandardMaterial
          color="#C9A227"
          emissive="#E3BF6D"
          emissiveIntensity={1.5}
          roughness={0.35}
          metalness={0.5}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* penanda arah berjalan */}
      <group ref={comet} visible={visible}>
        <mesh raycast={() => null}>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial color="#FFF0C4" transparent opacity={0.95} />
        </mesh>
        <mesh raycast={() => null} scale={2.6}>
          <sphereGeometry args={[0.42, 12, 12]} />
          <meshBasicMaterial
            color="#E3BF6D"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Pohon (instanced)                                                  */
/* ------------------------------------------------------------------ */

/** jarak titik ke ruas garis */
function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

/** true bila titik jatuh di atas aspal (lingkar kampus + jalan penghubung) */
function onRoad(x: number, z: number) {
  // dua lingkar jalan kampus
  for (const c of [
    { x: -10, z: -1 },
    { x: 10, z: 1 },
  ]) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d > 9.9 && d < 13.5) return true;
  }
  // penyambung selatan, penghubung utara, dan jalan keluar kota
  return (
    segDist(x, z, -10, -12.4, 10, -10.6) < 2.6 ||
    segDist(x, z, -10, 11.6, 10, 11.8) < 2.6 ||
    segDist(x, z, 21.4, 5.4, 27, 10) < 2.6 ||
    segDist(x, z, 27, 10, 32.5, 13.5) < 2.6
  );
}

function Trees({ count = 64, shadows, avoid }: { count?: number; shadows: boolean; avoid: { x: number; z: number }[] }) {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const canopy = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const rng = mulberry32(77123);
    const out: { x: number; z: number; s: number; r: number }[] = [];
    let guard = 0;
    while (out.length < count && guard < count * 40) {
      guard++;
      const band = rng();
      const radius = band < 0.55 ? 19.8 + rng() * 4.5 : band < 0.85 ? 25 + rng() * 4 : 7.6 + rng() * 6;
      const a = rng() * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const clash = avoid.some((p) => Math.hypot(p.x - x, p.z - z) < 4.6);
      if (clash || onRoad(x, z)) continue;
      out.push({ x, z, s: 0.75 + rng() * 0.7, r: rng() * Math.PI });
    }
    return out;
  }, [count, avoid]);

  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    data.forEach((d, i) => {
      m.position.set(d.x, 0, d.z);
      m.rotation.set(0, d.r, 0);
      m.scale.setScalar(d.s);
      m.updateMatrix();
      trunk.current?.setMatrixAt(i, m.matrix);

      m.position.set(d.x, 1.5 * d.s, d.z);
      m.updateMatrix();
      canopy.current?.setMatrixAt(i, m.matrix);
    });
    if (trunk.current) trunk.current.instanceMatrix.needsUpdate = true;
    if (canopy.current) canopy.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, data.length]} castShadow={shadows} raycast={() => null}>
        <cylinderGeometry args={[0.16, 0.24, 1.6, 6]} />
        <meshStandardMaterial color="#4A3826" roughness={1} />
      </instancedMesh>

      <instancedMesh ref={canopy} args={[undefined, undefined, data.length]} castShadow={shadows} raycast={() => null}>
        <coneGeometry args={[1.35, 3.2, 7]} />
        <meshStandardMaterial color="#3F6B3C" roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Pendopo pusat (landmark)                                           */
/* ------------------------------------------------------------------ */
function Pendopo({ shadows }: { shadows: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.3, 0]} receiveShadow={shadows} castShadow={shadows}>
        <cylinderGeometry args={[5.4, 5.8, 0.6, 8]} />
        <meshStandardMaterial color="#3E3226" roughness={1} />
      </mesh>

      {/* pilar */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 4.2, 2.5, Math.sin(a) * 4.2]} castShadow={shadows}>
            <cylinderGeometry args={[0.18, 0.2, 3.8, 8]} />
            <meshStandardMaterial color="#C9A227" roughness={0.42} metalness={0.7} />
          </mesh>
        );
      })}

      {/* atap tumpang tiri khas joglo */}
      <mesh position={[0, 4.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows}>
        <coneGeometry args={[7.0, 2.6, 4]} />
        <meshStandardMaterial color="#7A4A2E" roughness={0.88} />
      </mesh>
      <mesh position={[0, 6.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={shadows}>
        <coneGeometry args={[4.0, 1.9, 4]} />
        <meshStandardMaterial color="#6B4128" roughness={0.9} />
      </mesh>
      <mesh position={[0, 7.7, 0]}>
        <sphereGeometry args={[0.32, 14, 14]} />
        <meshStandardMaterial color="#E3BF6D" emissive="#E3BF6D" emissiveIntensity={1.6} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* lentera kuningan mengelilingi pendopo */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} position={[Math.cos(a) * 6.6, 1.5, Math.sin(a) * 6.6]} raycast={() => null}>
            <cylinderGeometry args={[0.1, 0.1, 3, 6]} />
            <meshStandardMaterial color="#6D5410" metalness={0.7} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Debu / kunang-kunang                                               */
/* ------------------------------------------------------------------ */
function Motes({ count = 340 }: { count?: number }) {
  const pts = useRef<THREE.Points>(null);

  const geo = useMemo(() => {
    const rng = mulberry32(4242);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const r = 4 + rng() * 30;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = 0.6 + rng() * 13;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  useFrame((state, dt) => {
    if (!pts.current) return;
    pts.current.rotation.y += dt * 0.012;
    pts.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.5;
  });

  return (
    <points ref={pts} geometry={geo} raycast={() => null}>
      <pointsMaterial
        size={0.16}
        color="#E3BF6D"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Plakat nama kampus (dicetak di tanah)                              */
/* ------------------------------------------------------------------ */
function Plaques() {
  const texes = useMemo(() => ZONA.map((z) => ({ z, tex: labelTexture(z.label) })), []);
  useEffect(
    () => () => {
      texes.forEach((t) => t.tex.dispose());
    },
    [texes]
  );

  return (
    <group>
      {texes.map(({ z, tex }) => {
        const img = tex.image as HTMLCanvasElement;
        const aspect = img ? img.height / img.width : 0.25;
        return (
          <mesh
            key={z.kode}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[z.x, 0.185, z.z]}
            raycast={() => null}
            renderOrder={2}
          >
            <planeGeometry args={[z.lebar, z.lebar * aspect]} />
            <meshBasicMaterial map={tex} transparent opacity={0.85} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Papan jalan ke Magetan                                             */
/* ------------------------------------------------------------------ */
function MagetanSign({ shadows }: { shadows: boolean }) {
  const tex = useMemo(() => labelTexture("MAGETAN · ±120 KM", "#4FB3C9"), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const img = tex.image as HTMLCanvasElement;
  const aspect = img ? img.height / img.width : 0.25;
  const pos = { x: 23.5, z: 7.2 };
  const rot = Math.atan2(-pos.x, -pos.z);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, rot, 0]}>
      {[-1.9, 1.9].map((px) => (
        <mesh key={px} position={[px, 1.6, 0]} castShadow={shadows}>
          <cylinderGeometry args={[0.12, 0.14, 3.2, 8]} />
          <meshStandardMaterial color="#5A4426" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.4, 0]} castShadow={shadows}>
        <boxGeometry args={[5.6, 1.5, 0.16]} />
        <meshStandardMaterial color="#241C14" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.4, 0.1]}>
        <planeGeometry args={[5.2, 5.2 * aspect]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
      <mesh position={[0, 4.25, 0]} castShadow={shadows}>
        <boxGeometry args={[6.0, 0.2, 0.5]} />
        <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Tanah + seluruh isian                                              */
/* ------------------------------------------------------------------ */
export default function Terrain({
  avoid,
  shadows,
  motes = true,
}: {
  avoid: { x: number; z: number }[];
  shadows: boolean;
  motes?: boolean;
}) {
  const tex = useMemo(() => groundTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <group>
      {/* plat tanah */}
      <mesh position={[0, -0.55, 0]} receiveShadow={shadows}>
        <cylinderGeometry args={[34, 36, 1.4, 72]} />
        <meshStandardMaterial color="#241C14" roughness={1} />
      </mesh>

      {/* permukaan kampus bertekstur */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} receiveShadow={shadows} raycast={() => null}>
        <circleGeometry args={[33.6, 72]} />
        <meshStandardMaterial map={tex} color="#A8B894" roughness={1} />
      </mesh>

      {/* tepian kuningan */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} raycast={() => null}>
        <ringGeometry args={[33.5, 34.1, 72]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.55} />
      </mesh>

      <Roads shadows={shadows} />
      <Pendopo shadows={shadows} />
      <Plaques />
      <MagetanSign shadows={shadows} />
      <Trees shadows={shadows} avoid={avoid} />
      {motes && <Motes />}
    </group>
  );
}
