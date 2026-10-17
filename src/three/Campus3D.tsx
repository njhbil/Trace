import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import Building from "./Building";
import Terrain, { RoutePath } from "./Terrain";
import { FAKULTAS, type Fakultas } from "../data/fakultas";
import { tick } from "../lib/gamelan";

export interface Campus3DProps {
  mode?: "hero" | "full";
  activeSlug?: string | null;
  showRoute?: boolean;
  onSelect?: (f: Fakultas) => void;
  className?: string;
}

function useIsSmall() {
  const [small, setSmall] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 820 : false));
  useEffect(() => {
    const on = () => setSmall(window.innerWidth < 820);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return small;
}

/* ----------------------------- isi scene ----------------------------- */
function Scene({
  mode,
  activeSlug,
  showRoute,
  onSelect,
}: Required<Pick<Campus3DProps, "mode" | "showRoute">> & { activeSlug?: string | null; onSelect?: (f: Fakultas) => void }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const flyUntil = useRef(0);
  const small = useIsSmall();
  const { camera, scene } = useThree();

  // framing berubah saat layar melewati ambang (mis. HP diputar ke landscape)
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = small ? 58 : 40;
    cam.position.set(0, small ? 58 : 32, small ? 78 : 50);
    cam.updateProjectionMatrix();
    scene.fog = new THREE.FogExp2("#241C14", small ? 0.0042 : 0.0056);
  }, [small, camera, scene]);

  const positions = useMemo(() => FAKULTAS.map((f) => ({ x: f.peta.x, z: f.peta.z })), []);
  const routePoints = useMemo(
    () => [...FAKULTAS].sort((a, b) => a.no - b.no).map((f) => ({ x: f.peta.x, z: f.peta.z })),
    []
  );

  const active = useMemo(() => FAKULTAS.find((f) => f.slug === activeSlug) ?? null, [activeSlug]);

  // setiap kali target berganti, kamera "terbang" sebentar ke sana
  useEffect(() => {
    if (active) flyUntil.current = performance.now() + 1700;
  }, [activeSlug, active]);

  useFrame((state, dt) => {
    const c = controls.current;
    if (!c) return;
    const k = Math.min(1, dt * 2.4);
    const flying = performance.now() < flyUntil.current;

    if (active && flying) {
      const target = new THREE.Vector3(active.peta.x, 3.2, active.peta.z);
      c.target.lerp(target, k);

      const dir = new THREE.Vector3(active.peta.x, 0, active.peta.z);
      if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
      dir.normalize().multiplyScalar(15);
      const camPos = target.clone().add(dir).add(new THREE.Vector3(0, 12, 0));
      state.camera.position.lerp(camPos, k * 0.85);
      state.camera.updateProjectionMatrix();
    } else if (!active && mode === "full" && !small) {
      // kembali ke tampilan kompak
      c.target.lerp(new THREE.Vector3(0, 2.4, 0), k * 0.5);
    }
    c.update();
  });

  const stopFly = () => {
    flyUntil.current = 0;
  };

  const dimOthers = Boolean(active);

  return (
    <>
      {/* cahaya */}
      <ambientLight intensity={0.72} color="#FFE2B8" />
      <hemisphereLight intensity={0.62} color="#8FB2D8" groundColor="#3A2A1A" />
      <directionalLight
        position={[22, 34, 16]}
        intensity={2.9}
        color="#FFEBCB"
        castShadow
        shadow-mapSize-width={small ? 1024 : 2048}
        shadow-mapSize-height={small ? 1024 : 2048}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={110}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-26, 16, -20]} intensity={0.75} color="#7FA6D8" />
      <pointLight position={[0, 12, 0]} intensity={260} distance={34} decay={2} color="#E3BF6D" />

      {/* tanah, jalan, pendopo, pohon, rute */}
      <Terrain avoid={positions} shadows motes={!small} />
      <RoutePath points={routePoints} visible={showRoute} />

      {/* 14 gedung fakultas */}
      {FAKULTAS.map((f, i) => (
        <Building
          key={f.slug}
          f={f}
          index={i}
          active={f.slug === activeSlug}
          dimmed={dimOthers && f.slug !== activeSlug}
          routeVisible={showRoute}
          shadows
          onHover={setHovered}
          onSelect={(ff) => onSelect?.(ff)}
        />
      ))}

      {/* kontrol orbit kamera */}
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={small}
        screenSpacePanning={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={16}
        maxDistance={small ? 170 : 96}
        minPolarAngle={0.18}
        maxPolarAngle={1.3}
        autoRotate={mode === "hero" && !active && !small && !hovered}
        autoRotateSpeed={0.3}
        onStart={stopFly}
        target={[0, 2.4, 0]}
      />
    </>
  );
}

/* ----------------------------- pembungkus ----------------------------- */
export default function Campus3D({ mode = "hero", activeSlug, showRoute = false, onSelect, className }: Campus3DProps) {
  const small = useIsSmall();
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // berhenti merender saat kanvas tidak terlihat (hemat baterai/GPU)
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reduced =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /**
   * Di beranda, kanvas mengisi layar pertama sepenuhnya. Pada perangkat sentuh,
   * `touch-action` dipaksa `pan-y` agar geseran vertikal tetap menggulir halaman,
   * sementara geseran mendatar memutar kamera. Pengunjung tidak lagi bingung
   * antara menggulir ke bawah dan memutar peta.
   */
  useEffect(() => {
    if (mode !== "hero") return;
    const el = wrap.current;
    if (!el || typeof window === "undefined") return;
    if (!window.matchMedia?.("(pointer: coarse)").matches) return;

    let batal = false;
    let langkah = 0;
    const atur = () => {
      if (batal) return;
      const canvas = el.querySelector("canvas");
      if (canvas) canvas.style.touchAction = "pan-y";
      // OrbitControls memasang touch-action sendiri saat terhubung; ulangi
      // beberapa frame agar pengaturan kita yang menang.
      if (langkah++ < 120) requestAnimationFrame(atur);
    };
    atur();
    return () => {
      batal = true;
    };
  }, [mode]);

  return (
    <div className={`canvas3d ${className ?? ""}`} ref={wrap} aria-hidden>
      <Canvas
        shadows
        frameloop={inView ? "always" : "never"}
        dpr={[1, small ? 1.35 : 1.75]}
        camera={{
          position: small ? [0, 58, 78] : [0, 32, 50],
          fov: small ? 58 : 40,
          near: 0.5,
          far: 420,
        }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ scene, gl }) => {
          scene.fog = new THREE.FogExp2("#241C14", small ? 0.0042 : 0.0056);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Scene
          mode={mode}
          activeSlug={activeSlug}
          showRoute={showRoute}
          onSelect={(f) => {
            if (!reduced) tick(880);
            onSelect?.(f);
          }}
        />
      </Canvas>
    </div>
  );
}
