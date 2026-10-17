import { useEffect, useState } from "react";
import { isGamelanRunning, startGamelan, stopGamelan, tick } from "../lib/gamelan";
import { isSpeechEnabled, setSpeechEnabled, isSpeechSupported } from "../lib/speech";
import { onFirstGesture } from "../lib/gesture";

const PREF = "trace-gamelan";

/**
 * Dock bawah kanan: kontrol suasana (gamelan) + suara pemandu (TTS).
 * Gamelan menyala otomatis pada sentuhan pertama (kecuali dimatikan pengunjung).
 */
export default function AudioDock() {
  const [gamelan, setGamelan] = useState(false);
  const [voice, setVoice] = useState(true);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    setVoice(isSpeechEnabled());
    setGamelan(isGamelanRunning());

    let preferedOn = true;
    try {
      preferedOn = localStorage.getItem(PREF) !== "off";
    } catch {
      /* mode privat: anggap mau menyala */
    }

    // browser memblokir audio sampai ada interaksi — tunggu gestur pertama
    const off = preferedOn
      ? onFirstGesture(() => {
          if (isGamelanRunning()) return;
          startGamelan(0.42).then(setGamelan);
        })
      : () => undefined;

    const t = window.setTimeout(() => setHint(true), 1200);
    const t2 = window.setTimeout(() => setHint(false), 9000);
    return () => {
      off();
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, []);

  const toggleGamelan = async () => {
    tick(600);
    if (isGamelanRunning()) {
      stopGamelan();
      setGamelan(false);
      try {
        localStorage.setItem(PREF, "off");
      } catch {
        /* noop */
      }
    } else {
      const ok = await startGamelan();
      setGamelan(ok);
      try {
        localStorage.setItem(PREF, "on");
      } catch {
        /* noop */
      }
    }
  };

  const toggleVoice = () => {
    tick(760);
    const next = !isSpeechEnabled();
    setSpeechEnabled(next);
    setVoice(next);
    if (!next) window.speechSynthesis?.cancel();
  };

  return (
    <div className="audio-dock" role="group" aria-label="Kontrol suasana">
      <div className={`dock-hint ${hint ? "show" : ""}`}>Gamelan &amp; sapaan pemandu menyala otomatis ✨</div>

      <button
        className={`icon-btn ${gamelan ? "on" : ""}`}
        onClick={toggleGamelan}
        aria-pressed={gamelan}
        aria-label={gamelan ? "Matikan gamelan" : "Nyalakan gamelan"}
        title={gamelan ? "Matikan gamelan" : "Nyalakan gamelan"}
      >
        <span aria-hidden>{gamelan ? "♪" : "♫"}</span>
      </button>

      {isSpeechSupported() && (
        <button
          className={`icon-btn ${voice ? "on" : ""}`}
          onClick={toggleVoice}
          aria-pressed={voice}
          aria-label={voice ? "Matikan suara pemandu" : "Nyalakan suara pemandu"}
          title={voice ? "Suara pemandu aktif" : "Suara pemandu mati"}
        >
          <span aria-hidden>{voice ? "🔊" : "🔇"}</span>
        </button>
      )}
    </div>
  );
}
