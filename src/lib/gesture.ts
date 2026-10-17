/**
 * Utilitas "gestur pertama".
 *
 * Browser memblokir suara (WebAudio & speechSynthesis) sampai pengunjung
 * melakukan interaksi apa pun — klik, sentuh, ketik, atau gulir.
 * Helper ini menunggu interaksi itu lalu menjalankan callback satu kali,
 * sehingga gamelan dan sapaan pemandu tetap bisa berbunyi otomatis.
 */

type Handler = () => void;

const EVENTS: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart", "wheel"];

/**
 * Jalankan `cb` pada interaksi pertama.
 * Return fungsi untuk membatalkan listener.
 */
export function onFirstGesture(cb: Handler): () => void {
  if (typeof window === "undefined") return () => undefined;

  let done = false;

  const off = () => EVENTS.forEach((e) => window.removeEventListener(e, run));

  function run() {
    if (done) return;
    done = true;
    off();
    cb();
  }

  EVENTS.forEach((e) => window.addEventListener(e, run, { passive: true }));
  return off;
}
