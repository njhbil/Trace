import { useEffect, useState } from "react";
import { isGamelanRunning, startGamelan, stopGamelan, tick } from "../lib/gamelan";
import { isSpeechEnabled, setSpeechEnabled, isSpeechSupported } from "../lib/speech";
import { onFirstGesture } from "../lib/gesture";

const PREF = "trace-gamelan";

/**
 * Panel bawah kanan: kontrol suasana (gamelan) + suara pemandu (TTS).
 * Gamelan menyala otomatis pada interaksi pertama (kecuali dimatikan pengunjung).
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
      /* mode privat: asumsikan pengguna mengizinkan suara */
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
        /* abaikan */
      }
    } else {
      const ok = await startGamelan();
      setGamelan(ok);
      try {
        localStorage.setItem(PREF, "on");
      } catch {
        /* abaikan */
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
      <div className={`dock-hint ${hint ? "show" : ""}`}>Suara gamelan dan sapaan pemandu menyala otomatis</div>

      <button
        className={`icon-btn ${gamelan ? "on" : ""}`}
        onClick={toggleGamelan}
        aria-pressed={gamelan}
        aria-label={gamelan ? "Matikan gamelan" : "Nyalakan gamelan"}
        title={gamelan ? "Matikan gamelan" : "Nyalakan gamelan"}
      >
        <span aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <ellipse
              cx="5.4"
              cy="11.6"
              rx="2.1"
              ry="1.7"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M7.5 11.6V3.9l5 1.4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {isSpeechSupported() && (
        <button
          className={`icon-btn ${voice ? "on" : ""}`}
          onClick={toggleVoice}
          aria-pressed={voice}
          aria-label={voice ? "Matikan suara pemandu" : "Nyalakan suara pemandu"}
          title={voice ? "Suara pemandu aktif" : "Suara pemandu mati"}
        >
          <span aria-hidden>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M7.5 3.3 4.4 6H2.4v4h2l3.1 2.7V3.3Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {voice ? (
                <path
                  d="M9.9 5.6a3.2 3.2 0 0 1 0 4.8M11.7 4a5.6 5.6 0 0 1 0 8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="m10 6.2 3.4 3.6M13.4 6.2 10 9.8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
