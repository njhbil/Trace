import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { groundTexture, labelTexture, mulberry32, windowGridTexture } from "./textures";
import { ZONA, PULAU_TERHUBUNG, type ZonaPeta } from "../data/fakultas";

type Titik = { x: number; z: number };

const zona = (kode: string) => ZONA.find((z) => z.kode === kode)!;

/* ------------------------------------------------------------------ */
/*  Jembatan penghubung antar pulau kampus                             */
/* ------------------------------------------------------------------ */

/** panjang jalan masuk ke masing-masing pulau (unit peta) */
const EXT: Record<string, { extA: number; extB: number }> = {
  "ketintang-lidah": { extA: 2.6, extB: 2.6 },
  "lidah-kampus3": { extA: 2.6, extB: 1.4 },
  "kampus3-magetan": { extA: 1.4, extB: 1.4 },
};

/** ujung ruas jalan yang melewati celah antar pulau */
function ujungJalan(a: ZonaPeta, b: ZonaPeta) {
  const ext = EXT[`${a.kode}-${b.kode}`] ?? { extA: 1.4, extB: 1.4 };
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  const ux = dx / len;
  const uz = dz / len;
  return {
    kode: `${a.kode}-${b.kode}`,
    pa: { x: a.x + ux * (a.radius - ext.extA), z: a.z + uz * (a.radius - ext.extA) },
    pb: { x: b.x - ux * (b.radius - ext.extB), z: b.z - uz * (b.radius - ext.extB) },
  };
}

const JALAN_ANTAR = PULAU_TERHUBUNG.map(([a, b]) => ujungJalan(zona(a), zona(b)));

function Jembatan({ pa, pb, shadows }: { pa: Titik; pb: Titik; shadows: boolean }) {
  const len = Math.hypot(pb.x - pa.x, pb.z - pa.z);
  const ang = Math.atan2(pb.z - pa.z, pb.x - pa.x);
  const mid = { x: (pa.x + pb.x) / 2, z: (pa.z + pb.z) / 2 };
  const tiang = Math.max(1, Math.floor(len / 5));

  return (
    <group>
      {/* pelat struktur */}
      <mesh position={[mid.x, -0.1, mid.z]} rotation={[0, -ang, 0]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[len, 0.26, 2.6]} />
        <meshStandardMaterial color="#3E3226" roughness={1} />
      </mesh>

      {/* permukaan aspal */}
      <mesh rotation={[-Math.PI / 2, 0, -ang]} position={[mid.x, 0.045, mid.z]} receiveShadow={shadows}>
        <planeGeometry args={[len, 2.3]} />
        <meshStandardMaterial color="#2A241D" roughness={1} />
      </mesh>

      {/* garis tengah emas */}
      <mesh rotation={[-Math.PI / 2, 0, -ang]} position={[mid.x, 0.06, mid.z]}>
        <planeGeometry args={[len, 0.12]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.4} />
      </mesh>

      {/* pagar kuningan kiri-kanan */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[mid.x - Math.sin(ang) * 1.1 * s, 0.3, mid.z + Math.cos(ang) * 1.1 * s]}
          rotation={[0, -ang, 0]}
          castShadow={shadows}
        >
          <boxGeometry args={[len, 0.07, 0.07]} />
          <meshStandardMaterial color="#C9A227" metalness={0.65} roughness={0.4} />
        </mesh>
      ))}
      {[-1, 1].map((s) =>
        [0.12, 0.88].map((t) => (
          <mesh
            key={`${s}-${t}`}
            position={[
              pa.x + (pb.x - pa.x) * t - Math.sin(ang) * 1.1 * s,
              0.17,
              pa.z + (pb.z - pa.z) * t + Math.cos(ang) * 1.1 * s,
            ]}
            castShadow={shadows}
          >
            <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
            <meshStandardMaterial color="#C9A227" metalness={0.65} roughness={0.4} />
          </mesh>
        ))
      )}

      {/* tiang penyangga ke dasar air */}
      {Array.from({ length: tiang }, (_, i) => {
        const t = (i + 0.5) / tiang;
        return (
          <mesh key={i} position={[pa.x + (pb.x - pa.x) * t, -0.9, pa.z + (pb.z - pa.z) * t]} castShadow={shadows}>
            <cylinderGeometry args={[0.17, 0.22, 1.6, 8]} />
            <meshStandardMaterial color="#3E3226" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Jalan: lingkar tiap kampus + jembatan penghubung                   */
/* ------------------------------------------------------------------ */

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
  return (
    <group>
      {/* lingkar dua kampus utama — menempel di tepi pulau */}
      <RingRoad c={zona("ketintang")} inner={13.0} outer={14.4} shadows={shadows} />
      <RingRoad c={zona("lidah")} inner={13.0} outer={14.4} shadows={shadows} />
      {/* lingkar kecil kampus pendamping */}
      <RingRoad c={zona("kampus3")} inner={4.4} outer={5.6} shadows={shadows} />
      <RingRoad c={zona("magetan")} inner={4.6} outer={5.8} shadows={shadows} />

      {/* jembatan penghubung antar pulau */}
      {JALAN_ANTAR.map((j) => (
        <Jembatan key={j.kode} pa={j.pa} pb={j.pb} shadows={shadows} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Rute tur (jalur emas bercahaya) + "komet" penunjuk arah            */
/* ------------------------------------------------------------------ */
export function RoutePath({ points, visible }: { points: { x: number; z: number }[]; visible: boolean }) {
  const curve = useMemo(() => {
    if (points.length < 2) return null;
    const pts = points.map((p) => new THREE.Vector3(p.x, 0.42, p.z));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
  }, [points]);

  const tubeGeo = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 220, 0.11, 8, false);
  }, [curve]);

  if (!curve || !tubeGeo) return null;

  return (
    <mesh geometry={tubeGeo} visible={visible} raycast={() => null}>
      <meshStandardMaterial color="#C9A227" roughness={0.4} metalness={0.5} transparent opacity={0.8} />
    </mesh>
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

/** true bila titik jatuh di atas aspal, alun-alun, atau pelataran landmark */
function onRoad(x: number, z: number) {
  const lingkar: [ZonaPeta, number, number][] = [
    [zona("ketintang"), 13.0, 14.4],
    [zona("lidah"), 13.0, 14.4],
    [zona("kampus3"), 4.4, 5.6],
    [zona("magetan"), 4.6, 5.8],
  ];
  for (const [c, inner, outer] of lingkar) {
    const dist = Math.hypot(x - c.x, z - c.z);
    if (dist > inner - 0.8 && dist < outer + 0.8) return true;
  }
  for (const j of JALAN_ANTAR) {
    if (segDist(x, z, j.pa.x, j.pa.z, j.pb.x, j.pb.z) < 2.1) return true;
  }
  // pelataran landmark di pusat dua kampus utama (pendopo & rektorat)
  if (Math.hypot(x - zona("ketintang").x, z - zona("ketintang").z) < 5.9) return true;
  return Math.hypot(x - zona("lidah").x, z - zona("lidah").z) < 5.9;
}

function Trees({ count = 76, shadows, avoid }: { count?: number; shadows: boolean; avoid: Titik[] }) {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const canopy = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const rng = mulberry32(77123);
    const out: { x: number; z: number; s: number; r: number }[] = [];
    // pulau yang cukup luas untuk ditanami pohon
    const pulau = ZONA.filter((z) => z.radius >= 6.4);
    let guard = 0;
    while (out.length < count && guard < count * 60) {
      guard++;
      const p = pulau[Math.floor(rng() * pulau.length)];
      const radius = (0.45 + rng() * 0.52) * (p.radius - 1.2);
      const a = rng() * Math.PI * 2;
      const x = p.x + Math.cos(a) * radius;
      const zz = p.z + Math.sin(a) * radius;
      const clash = avoid.some((q) => Math.hypot(q.x - x, q.z - zz) < 4.8);
      if (clash || onRoad(x, zz)) continue;
      out.push({ x, z: zz, s: 0.75 + rng() * 0.7, r: rng() * Math.PI });
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
/*  Pulau kampus (plateau bertingkat, tepi pasir, tepi kuningan)       */
/* ------------------------------------------------------------------ */

const WARNA_RUMPUT: Record<string, string> = {
  ketintang: "#A8B894",
  lidah: "#A2B492",
  kampus3: "#9FB08C",
  magetan: "#C2A684",
};

function Pulau({ z, tex, shadows }: { z: ZonaPeta; tex: THREE.Texture; shadows: boolean }) {
  const tint = WARNA_RUMPUT[z.kode] ?? "#A8B894";
  return (
    <group>
      {/* dinding pulau (tebing) */}
      <mesh position={[z.x, -1.2, z.z]} castShadow={shadows} receiveShadow={shadows}>
        <cylinderGeometry args={[z.radius, z.radius * 1.05, 2.4, 56]} />
        <meshStandardMaterial color="#2A2118" roughness={1} />
      </mesh>

      {/* tepian pasir di permukaan air */}
      <mesh position={[z.x, -1.5, z.z]}>
        <cylinderGeometry args={[z.radius + 0.75, z.radius + 1.0, 0.5, 56]} />
        <meshStandardMaterial color="#6B5B43" roughness={1} />
      </mesh>

      {/* permukaan rumput bertekstur */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[z.x, 0.001, z.z]}
        receiveShadow={shadows}
        raycast={() => null}
      >
        <circleGeometry args={[z.radius, 56]} />
        <meshStandardMaterial map={tex} color={tint} roughness={1} />
      </mesh>

      {/* tepi kuningan */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[z.x, 0.02, z.z]} raycast={() => null}>
        <ringGeometry args={[z.radius - 0.14, z.radius + 0.05, 56]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Air (ombak halus antar pulau)                                      */
/* ------------------------------------------------------------------ */
function Air({ animasi }: { animasi: boolean }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(900, 900, 48, 48), []);
  const dasar = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((state) => {
    if (!animasi) return;
    const pos = geo.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const px = dasar[i * 3];
      const py = dasar[i * 3 + 1];
      pos.array[i * 3 + 2] = Math.sin(px * 0.16 + t * 0.7) * 0.12 + Math.cos(py * 0.21 + t * 0.5) * 0.09;
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, -1.75, 8]} geometry={geo} raycast={() => null}>
      <meshStandardMaterial color="#131F29" roughness={0.95} metalness={0} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Kendaraan yang melintas (memberi kesan kampus hidup)               */
/* ------------------------------------------------------------------ */

type Kendaraan =
  | { tipe: "lingkar"; c: Titik; r: number; laju: number; fase: number; warna: string }
  | { tipe: "jalan"; a: Titik; b: Titik; laju: number; fase: number; warna: string };

function Mobil({ warna, bus, shadows }: { warna: string; bus: boolean; shadows: boolean }) {
  const badan = useMemo(
    () => new THREE.MeshStandardMaterial({ color: warna, roughness: 0.5, metalness: 0.3 }),
    [warna]
  );
  const lampuDpn = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFF3D0",
        emissive: new THREE.Color("#FFF3D0"),
        emissiveIntensity: 1.3,
      }),
    []
  );
  const lampuBlkg = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#E5533B",
        emissive: new THREE.Color("#E5533B"),
        emissiveIntensity: 1.2,
      }),
    []
  );
  const kacaBus = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#14100A",
        emissive: new THREE.Color("#FFD98A"),
        emissiveIntensity: 0.4,
        roughness: 0.3,
      }),
    []
  );
  useEffect(
    () => () => {
      badan.dispose();
      lampuDpn.dispose();
      lampuBlkg.dispose();
      kacaBus.dispose();
    },
    [badan, lampuDpn, lampuBlkg, kacaBus]
  );

  const lampu = (pos: [number, number, number], mat: THREE.MeshStandardMaterial, r: number) => (
    <mesh position={pos} material={mat}>
      <sphereGeometry args={[r, 8, 8]} />
    </mesh>
  );

  if (bus) {
    // panjang badan di sumbu Z — searah "maju" (rotasi konvoi memakai +Z)
    return (
      <group>
        <mesh position={[0, 0.35, 0]} castShadow={shadows} material={badan}>
          <boxGeometry args={[0.78, 0.62, 2.0]} />
        </mesh>
        <mesh position={[0, 0.76, 0]} castShadow={shadows} material={badan}>
          <boxGeometry args={[0.7, 0.3, 1.8]} />
        </mesh>
        <mesh position={[0, 0.58, 1.01]} material={kacaBus}>
          <planeGeometry args={[0.62, 0.24]} />
        </mesh>
        {lampu([0.24, 0.24, 1.0], lampuDpn, 0.06)}
        {lampu([-0.24, 0.24, 1.0], lampuDpn, 0.06)}
        {lampu([0.24, 0.24, -1.0], lampuBlkg, 0.05)}
        {lampu([-0.24, 0.24, -1.0], lampuBlkg, 0.05)}
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 0.19, 0]} castShadow={shadows} material={badan}>
        <boxGeometry args={[0.5, 0.28, 0.95]} />
      </mesh>
      <mesh position={[0, 0.4, -0.06]} castShadow={shadows} material={badan}>
        <boxGeometry args={[0.44, 0.2, 0.5]} />
      </mesh>
      {lampu([0.16, 0.17, 0.45], lampuDpn, 0.05)}
      {lampu([-0.16, 0.17, 0.45], lampuDpn, 0.05)}
      {lampu([0.16, 0.17, -0.45], lampuBlkg, 0.045)}
      {lampu([-0.16, 0.17, -0.45], lampuBlkg, 0.045)}
    </group>
  );
}

function Traffic({ shadows }: { shadows: boolean }) {
  const grup = useRef<(THREE.Group | null)[]>([]);

  const jalur = useMemo<Kendaraan[]>(() => {
    const A = zona("ketintang");
    const B = zona("lidah");
    const bus = JALAN_ANTAR.find((j) => j.kode === "kampus3-magetan")!;
    return [
      { tipe: "lingkar", c: A, r: 13.7, laju: 0.24, fase: 0, warna: "#C85F36" },
      { tipe: "lingkar", c: A, r: 13.7, laju: -0.19, fase: Math.PI, warna: "#D9CDB4" },
      { tipe: "lingkar", c: B, r: 13.7, laju: 0.21, fase: 1.2, warna: "#35957F" },
      { tipe: "lingkar", c: B, r: 13.7, laju: -0.26, fase: 4.0, warna: "#5668A3" },
      { tipe: "jalan", a: bus.pa, b: bus.pb, laju: 0.14, fase: 0, warna: "#E3BF6D" },
      { tipe: "jalan", a: bus.pa, b: bus.pb, laju: 0.14, fase: Math.PI, warna: "#D9CDB4" },
    ];
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    jalur.forEach((j, i) => {
      const g = grup.current[i];
      if (!g) return;
      if (j.tipe === "lingkar") {
        const a = j.fase + t * j.laju;
        g.position.set(j.c.x + Math.cos(a) * j.r, 0.05, j.c.z + Math.sin(a) * j.r);
        g.rotation.y = -a;
      } else {
        // bolak-balik antara dua pulau, berputar arah saat berbalik
        const sudut = t * j.laju * 2 + j.fase;
        const u = (Math.sin(sudut) + 1) / 2;
        const dx = j.b.x - j.a.x;
        const dz = j.b.z - j.a.z;
        g.position.set(j.a.x + dx * u, 0.05, j.a.z + dz * u);
        const maju = Math.cos(sudut) >= 0;
        g.rotation.y = Math.atan2(maju ? dx : -dx, maju ? dz : -dz);
      }
    });
  });

  return (
    <group>
      {jalur.map((j, i) => (
        <group
          key={i}
          ref={(el) => {
            grup.current[i] = el;
          }}
        >
          <Mobil warna={j.warna} bus={j.tipe === "jalan"} shadows={shadows} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Pendopo budaya — kini berdiri di alun-alun Kampus Ketintang        */
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
/*  Gedung Rektorat — pusat Kampus Lidah Wetan                         */
/* ------------------------------------------------------------------ */
function Rektorat({ shadows }: { shadows: boolean }) {
  const winTex = useMemo(() => windowGridTexture(6, 9, "#FFD98A"), []);
  const signTex = useMemo(() => labelTexture("UNESA", "#C9A227"), []);
  useEffect(
    () => () => {
      winTex.dispose();
      signTex.dispose();
    },
    [winTex, signTex]
  );

  /** pita jendela kaca di salah satu sisi menara */
  const pitaJendela = (pos: [number, number, number], rotY: number, lebar: number) => (
    <mesh position={pos} rotation={[0, rotY, 0]} raycast={() => null}>
      <planeGeometry args={[lebar, 6.4]} />
      <meshBasicMaterial map={winTex} transparent opacity={0.9} />
    </mesh>
  );

  return (
    <group>
      {/* pelataran batu + undakan masuk */}
      <mesh position={[0, 0.15, 0]} receiveShadow={shadows} castShadow={shadows}>
        <cylinderGeometry args={[5.1, 5.35, 0.3, 32]} />
        <meshStandardMaterial color="#6B5B43" roughness={1} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.08, 3.4 + i * 0.45]} castShadow={shadows} receiveShadow={shadows}>
          <boxGeometry args={[4.4 - i * 0.5, 0.16, 0.9]} />
          <meshStandardMaterial color="#8A7A5E" roughness={1} />
        </mesh>
      ))}

      {/* podium dua lantai + pita kuningan */}
      <mesh position={[0, 1.25, 0]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[7.4, 1.8, 6.0]} />
        <meshStandardMaterial color="#B7AC97" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.22, 0]}>
        <boxGeometry args={[7.56, 0.16, 6.16]} />
        <meshStandardMaterial color="#C9A227" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* pintu utama kaca */}
      <mesh position={[0, 1.2, 3.02]}>
        <boxGeometry args={[2.4, 1.6, 0.12]} />
        <meshStandardMaterial color="#14243A" metalness={0.4} roughness={0.2} />
      </mesh>

      {/* menara utama berpita jendela */}
      <mesh position={[0, 6.2, -0.3]} castShadow={shadows} receiveShadow={shadows}>
        <boxGeometry args={[5.2, 7.8, 4.4]} />
        <meshStandardMaterial color="#C4B99F" roughness={0.9} />
      </mesh>
      {pitaJendela([0, 6.0, 1.92], 0, 4.4)}
      {pitaJendela([0, 6.0, -2.52], Math.PI, 4.4)}
      {pitaJendela([2.62, 6.0, -0.3], Math.PI / 2, 3.6)}
      {pitaJendela([-2.62, 6.0, -0.3], -Math.PI / 2, 3.6)}
      {[4.0, 5.9, 7.8].map((yy) => (
        <mesh key={yy} position={[0, yy, -0.3]}>
          <boxGeometry args={[5.32, 0.12, 4.52]} />
          <meshStandardMaterial color="#C9A227" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* mahkota atap + papan nama UNESA */}
      <mesh position={[0, 10.25, -0.3]} castShadow={shadows}>
        <boxGeometry args={[5.6, 0.4, 4.8]} />
        <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 9.4, 1.94]} raycast={() => null}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={signTex} transparent />
      </mesh>

      {/* sayap kiri-kanan rendah */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 3.6, 1.0, -0.6]} castShadow={shadows} receiveShadow={shadows}>
          <boxGeometry args={[2.0, 1.4, 3.4]} />
          <meshStandardMaterial color="#ABA08B" roughness={0.92} />
        </mesh>
      ))}

      {/* tiang bendera merah-putih di halaman depan */}
      {[-2.9, 2.9].map((px) => (
        <group key={px}>
          <mesh position={[px, 2.85, 3.4]} castShadow={shadows}>
            <cylinderGeometry args={[0.055, 0.07, 5.2, 6]} />
            <meshStandardMaterial color="#9C9585" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[px + 0.42, 5.12, 3.4]}>
            <boxGeometry args={[0.8, 0.32, 0.04]} />
            <meshStandardMaterial color="#C63A2E" />
          </mesh>
          <mesh position={[px + 0.42, 4.8, 3.4]}>
            <boxGeometry args={[0.8, 0.32, 0.04]} />
            <meshStandardMaterial color="#EFE9DC" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Plakat nama kampus (dicetak di tanah)                              */
/* ------------------------------------------------------------------ */
function Plaques() {
  const texes = useMemo(
    () => ZONA.filter((z) => z.lebar > 0).map((z) => ({ z, tex: labelTexture(z.label) })),
    []
  );
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
        const pos = z.plakat ?? { x: z.x, z: z.z };
        // plakat diputar sejajar lengkung pulau agar muat di halaman masuk
        const phi = Math.atan2(pos.z - z.z, pos.x - z.x);
        return (
          <mesh
            key={z.kode}
            rotation={[-Math.PI / 2, 0, -(Math.PI / 2 + phi)]}
            position={[pos.x, 0.185, pos.z]}
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
  const pos = { x: 30.2, z: 20.4 };
  const rot = Math.atan2(-pos.x, -pos.z);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, rot, 0]}>
      {[-1.9, 1.9].map((px) => (
        <mesh key={px} position={[px, 0.7, 0]} castShadow={shadows}>
          <cylinderGeometry args={[0.12, 0.14, 5.0, 8]} />
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
/*  Pulau + seluruh isian                                              */
/* ------------------------------------------------------------------ */
export default function Terrain({
  avoid,
  shadows,
  animasi = true,
}: {
  avoid: Titik[];
  shadows: boolean;
  animasi?: boolean;
}) {
  const tex = useMemo(() => groundTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <group>
      {/* air mengelilingi seluruh pulau kampus */}
      <Air animasi={animasi} />

      {/* pulau-pulau kampus */}
      {ZONA.map((z) => (
        <Pulau key={z.kode} z={z} tex={tex} shadows={shadows} />
      ))}

      <Roads shadows={shadows} />

      {/* landmark pusat: pendopo budaya di Ketintang, rektorat di Lidah Wetan */}
      <group position={[zona("ketintang").x, 0, zona("ketintang").z]} scale={0.7}>
        <Pendopo shadows={shadows} />
      </group>
      <group position={[zona("lidah").x, 0, zona("lidah").z]} rotation={[0, -1.193, 0]}>
        <Rektorat shadows={shadows} />
      </group>

      <Plaques />
      <MagetanSign shadows={shadows} />
      <Trees shadows={shadows} avoid={avoid} />
      <Traffic shadows={shadows} />

    </group>
  );
}
