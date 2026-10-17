/**
 * Gamelan mini — dibangkitkan langsung dengan WebAudio (tanpa berkas audio).
 * Nada slendro disusun perkiraan; setiap pasangan oscillator sedikit bergeser
 * (detune) agar terdengar seperti bonang kembar pada gamelan asli.
 */

type Ctx = AudioContext & { _gamelan?: boolean };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let step = 0;
let running = false;
let nextTime = 0;

const BPM = 68;
const STEP_DUR = 60 / BPM / 2; // seperdelapan ketukan

// slendro (perkiraan, 5 nada dalam satu oktaf)
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0];
const OMBAK = 6; // cent detune pasangan

// pola bonang (indeks nada) — berjalan lambat tanpa pola repetitif yang membosankan
const PATTERN = [
  0, 2, 1, 3, 2, 4, 3, 1, 0, 3, 4, 2, 1, 0, 2, 4,
  3, 4, 1, 2, 0, 1, 3, 2, 4, 3, 2, 0, 1, 4, 2, 3,
];

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const shelf = ctx.createBiquadFilter();
    shelf.type = "lowpass";
    shelf.frequency.value = 2600;
    master.connect(shelf);
    shelf.connect(ctx.destination);
  }
  return ctx;
}

function strike(ac: AudioContext, freq: number, t: number, gain: number, decay: number) {
  const out = master;
  if (!out) return;

  // nada utama + pasangan kembar (ombak)
  [freq, freq * Math.pow(2, OMBAK / 1200)].forEach((f, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = i === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(f, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain * (i === 0 ? 1 : 0.55), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + decay + 0.05);
  });

  // serapan (harmonik lembut)
  const h = ac.createOscillator();
  const hg = ac.createGain();
  h.type = "sine";
  h.frequency.setValueAtTime(freq * 3.02, t);
  hg.gain.setValueAtTime(0.0001, t);
  hg.gain.exponentialRampToValueAtTime(gain * 0.18, t + 0.008);
  hg.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.4);
  h.connect(hg);
  hg.connect(out);
  h.start(t);
  h.stop(t + decay);
}

function gong(ac: AudioContext, t: number) {
  const out = master;
  if (!out) return;
  [65.4, 98.0, 130.8].forEach((f, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.985, t + 3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22 / (i + 1), t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + 3.6);
  });
}

function scheduler() {
  if (!ctx || !running) return;
  const ahead = 0.25;

  while (nextTime < ctx.currentTime + ahead) {
    const bar = Math.floor(step / 16);
    const i = step % PATTERN.length;
    const n = PATTERN[i];

    // bonang: dipukul pada langkah genap, kadang diselang langkah ganjil
    if (step % 2 === 0 || Math.random() > 0.55) {
      strike(ctx, SCALE[n], nextTime, 0.075, 1.5);
    }

    // kenong: ketuk tiap 4 ketuk
    if (step % 8 === 4) {
      strike(ctx, SCALE[(n + 2) % SCALE.length] / 2, nextTime, 0.06, 2.4);
    }

    // gong: tiap akhir 8 bar
    if (bar % 8 === 7 && i === PATTERN.length - 1) {
      gong(ctx, nextTime);
    }

    nextTime += STEP_DUR;
    step++;
  }
}

export function isGamelanRunning() {
  return running;
}

export async function startGamelan(volume = 0.5): Promise<boolean> {
  const ac = ensureContext();
  if (!ac || !master) return false;

  if (ac.state === "suspended") {
    try {
      await ac.resume();
    } catch {
      return false;
    }
  }

  if (running) {
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.linearRampToValueAtTime(volume * 0.45, ac.currentTime + 1.2);
    return true;
  }

  running = true;
  step = 0;
  nextTime = ac.currentTime + 0.12;

  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  master.gain.linearRampToValueAtTime(volume * 0.45, ac.currentTime + 2.2);

  if (timer !== null) window.clearInterval(timer);
  timer = window.setInterval(scheduler, 60);
  scheduler();
  return true;
}

export function stopGamelan() {
  if (!ctx || !master) {
    running = false;
    return;
  }
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
  running = false;
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

/** Satu bunyi "kendang/gong" kecil — untuk umpan balik klik. */
export function tick(freq = 660) {
  const ac = ensureContext();
  if (!ac || !master || ac.state !== "running") return;
  strike(ac, freq, ac.currentTime + 0.005, 0.05, 0.28);
}

/** Bunyi masuk halaman fakultas: keris sepintas + gong pendek. */
export function playEntrance() {
  const ac = ensureContext();
  if (!ac || !master) return;
  if (ac.state === "suspended") void ac.resume();
  const t = ac.currentTime + 0.02;
  [0, 0.09, 0.19].forEach((d, i) => strike(ac, SCALE[i + 1], t + d, 0.07, 1.1));
  gong(ac, t + 0.34);
}
