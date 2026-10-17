/**
 * Modul suara — Web Speech API (tanpa file audio, tanpa backend).
 * Dipakai untuk sapaan pemandu: "Selamat datang di Fakultas Teknik ..."
 */

let cachedVoice: SpeechSynthesisVoice | null = null;
let enabled = true;

export function setSpeechEnabled(v: boolean) {
  enabled = v;
  if (!v) stopSpeaking();
}

export function isSpeechEnabled() {
  return enabled;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const score = (v: SpeechSynthesisVoice) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    let s = 0;
    if (lang.startsWith("id")) s += 100;
    if (lang.startsWith("ms")) s += 40;
    if (/google/i.test(v.name)) s += 12;
    if (/female|wanita|damayanti|gadis/i.test(v.name)) s += 6;
    if (/natural/i.test(v.name)) s += 5;
    return s;
  };

  cachedVoice = [...voices].sort((a, b) => score(b) - score(a))[0] ?? null;
  return cachedVoice;
}

/** Voice list sering baru terisi setelah event pertama. */
export function primeVoices(cb?: () => void) {
  if (!isSpeechSupported()) return;
  const load = () => {
    cachedVoice = null;
    pickVoice();
    cb?.();
  };
  load();
  window.speechSynthesis.addEventListener("voiceschanged", load, { once: true });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
}

export function stopSpeaking() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

/**
 * Ucapkan teks dengan aksen Indonesia.
 * Mengembalikan false bila perangkat tidak mendukung atau fitur dinonaktifkan.
 */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!enabled || !isSpeechSupported() || !text.trim()) return false;

  stopSpeaking();

  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "id-ID";
  u.rate = opts.rate ?? 0.94;
  u.pitch = opts.pitch ?? 1.02;
  u.volume = opts.volume ?? 1;
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();

  // jeda singkat agar pemanggilan cancel() sebelumnya benar-benar berakhir
  window.setTimeout(() => {
    try {
      window.speechSynthesis.speak(u);
    } catch {
      opts.onEnd?.();
    }
  }, 60);

  return true;
}

/** Cek apakah teks ini kemungkinan akan diucapkan (sudah ada voice id/ms). */
export function hasIndonesianVoice(): boolean {
  const v = pickVoice();
  if (!v) return false;
  const lang = (v.lang || "").toLowerCase();
  return lang.startsWith("id") || lang.startsWith("ms");
}
