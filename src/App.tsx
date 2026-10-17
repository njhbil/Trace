import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import AudioDock from "./components/AudioDock";
import Home from "./pages/Home";
import Peta from "./pages/Peta";
import Rute from "./pages/Rute";
import FakultasPage from "./pages/FakultasPage";
import NotFound from "./pages/NotFound";
import { FAKULTAS } from "./data/fakultas";

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/** Judul tab selalu ikut rute, supaya enak dibuka langsung dari tautan. */
function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const parts = pathname.split("/");
    const fak = FAKULTAS.find((f) => f.slug === parts[2]);
    document.title = fak
      ? `${fak.akronim} — ${fak.nama} · TRACE UNESA`
      : pathname === "/"
        ? "TRACE — Tourism Resource & Cultural Experience · Guide Kampus UNESA"
        : pathname === "/peta"
          ? "Peta 3D Kampus · TRACE UNESA"
          : pathname === "/rute"
            ? "Rute Tur Kampus · TRACE UNESA"
            : "TRACE · UNESA";
  }, [pathname]);
  return null;
}

const pageMotion = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <ScrollManager />
      <TitleManager />
      <TopNav onNavigate={(to) => navigate(to)} />
      <AudioDock />

      <AnimatePresence mode="wait">
        <motion.main key={location.pathname} {...pageMotion}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/peta" element={<Peta />} />
            <Route path="/rute" element={<Rute />} />
            <Route path="/fakultas/:slug" element={<FakultasPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
