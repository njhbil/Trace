import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "Menyiapkan peta kampus…",
  "Menata 14 titik wisata…",
  "Menyalakan gamelan…",
  "Hampir siap, selamat datang.",
];

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let v = 0;
    const id = window.setInterval(() => {
      v = Math.min(100, v + Math.random() * 13 + 5);
      setPct(Math.round(v));
      setStep(Math.min(STEPS.length - 1, Math.floor(v / 26)));
      if (v >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setGone(true);
          onDone();
        }, 520);
      }
    }, 190);
    return () => window.clearInterval(id);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="preloader"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pre-inner">
            <div className="pre-ring">
              <span>ꦠꦿꦺ</span>
            </div>

            <div>
              <div className="display" style={{ fontSize: "clamp(2rem,7vw,3.6rem)" }}>
                TRACE
              </div>
              <div className="pre-label" style={{ marginTop: 6 }}>
                Tourism Resource &amp; Cultural Experience
              </div>
            </div>

            <div className="pre-bar">
              <i style={{ width: `${pct}%` }} />
            </div>
            <div className="pre-label">{STEPS[step]}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
