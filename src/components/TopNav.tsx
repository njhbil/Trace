import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { tick } from "../lib/gamelan";
import Logo from "./Logo";

const LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/peta", label: "Peta 3D" },
  { to: "/rute", label: "Rute Tur" },
  { to: "/fakultas/fisipol", label: "14 Fakultas" },
];

export default function TopNav({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const activeClass = (to: string) => (pathname === to || (to !== "/" && pathname.startsWith(to)) ? "active" : "");

  return (
    <header className={`topnav ${scrolled || open ? "scrolled" : ""}`}>
      <a
        className="brand"
        href="#/"
        onClick={() => {
          tick(880);
          onNavigate?.("/");
        }}
      >
        <Logo size={30} title="TRACE" />
        <span className="brand-text">
          <b>TRACE</b>
          <small>Panduan Wisata Kampus UNESA</small>
        </span>
      </a>

      <nav className={`nav-links ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className={activeClass(l.to)} onClick={() => tick(720)}>
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/rute" className="rute-cta" onClick={() => tick(960)}>
          Mulai Tur →
        </NavLink>
      </nav>

      <div className="nav-tools">
        <button
          className="icon-btn nav-burger"
          aria-label="Buka menu"
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v);
            tick(520);
          }}
        >
          <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.3 }} style={{ display: "grid" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {open ? (
                <path
                  d="M4 4l10 10M14 4L4 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              )}
            </svg>
          </motion.span>
        </button>
      </div>
    </header>
  );
}
