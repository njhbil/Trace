import { motion, useInView } from "framer-motion";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span";
}

/** Animasi muncul saat masuk viewport — halus dan tidak berlebihan. */
export default function Reveal({ children, delay = 0, y = 30, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as RefObject<Element>, { once: true, margin: "-12% 0px -8% 0px" });
  const M = motion[as] as typeof motion.div;

  return (
    <M
      ref={ref as never}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </M>
  );
}
