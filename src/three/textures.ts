import * as THREE from "three";

/** Badge nomor rute — digambar di canvas, dipakai sebagai sprite agar selalu menghadap kamera. */
export function numberTexture(label: string, accent = "#E3BF6D"): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;

  // bayangan lembut
  g.fillStyle = "rgba(10,7,5,0.55)";
  g.beginPath();
  g.arc(size / 2, size / 2 + 6, 88, 0, Math.PI * 2);
  g.fill();

  // cincin
  const grad = g.createLinearGradient(20, 20, 236, 236);
  grad.addColorStop(0, "#F6E3AC");
  grad.addColorStop(0.5, accent);
  grad.addColorStop(1, "#8C6B14");
  g.fillStyle = "#15100A";
  g.beginPath();
  g.arc(size / 2, size / 2, 84, 0, Math.PI * 2);
  g.fill();

  g.lineWidth = 9;
  g.strokeStyle = grad;
  g.beginPath();
  g.arc(size / 2, size / 2, 84, 0, Math.PI * 2);
  g.stroke();

  g.lineWidth = 2;
  g.strokeStyle = "rgba(244,235,218,0.35)";
  g.beginPath();
  g.arc(size / 2, size / 2, 70, 0, Math.PI * 2);
  g.stroke();

  g.fillStyle = "#F4EBDA";
  g.font = "700 96px Fraunces, Georgia, 'Times New Roman', serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(label, size / 2, size / 2 + 4);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Tekstur halus buat permukaan tanah kampus (grid + bintik + noda batik). */
export function groundTexture(): THREE.CanvasTexture {
  const w = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = w;
  const g = c.getContext("2d")!;

  g.fillStyle = "#1d2618";
  g.fillRect(0, 0, w, w);

  // blok-blok rerumputan / lapangan
  const rng = mulberry32(20240817);
  for (let i = 0; i < 46; i++) {
    const bw = 60 + rng() * 190;
    const bh = 60 + rng() * 190;
    const x = rng() * (w - bw);
    const y = rng() * (w - bh);
    g.fillStyle = rng() > 0.5 ? "rgba(46,66,38,0.55)" : "rgba(30,42,26,0.6)";
    g.fillRect(x, y, bw, bh);
  }

  // garis grid halus (kavling)
  g.strokeStyle = "rgba(227,191,109,0.07)";
  g.lineWidth = 1;
  for (let i = 0; i <= w; i += 64) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, w);
    g.stroke();
    g.beginPath();
    g.moveTo(0, i);
    g.lineTo(w, i);
    g.stroke();
  }

  // bintik jalan setapak
  g.fillStyle = "rgba(180,150,110,0.10)";
  for (let i = 0; i < 900; i++) {
    g.beginPath();
    g.arc(rng() * w, rng() * w, 1 + rng() * 2.4, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Label nama fakultas (dipakai sprite di atas gedung). */
export function labelTexture(text: string, accent = "#E3BF6D"): THREE.CanvasTexture {
  const pad = 40;
  const fs = 64;
  const c = document.createElement("canvas");
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `600 ${fs}px Fraunces, Georgia, serif`;
  const tw = Math.ceil(measure.measureText(text).width);
  c.width = Math.max(128, tw + pad * 2);
  c.height = fs + pad;
  const g = c.getContext("2d")!;

  g.fillStyle = "rgba(13,9,6,0.86)";
  const r = 22;
  g.beginPath();
  g.moveTo(r, 0);
  g.lineTo(c.width - r, 0);
  g.quadraticCurveTo(c.width, 0, c.width, r);
  g.lineTo(c.width, c.height - r);
  g.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
  g.lineTo(r, c.height);
  g.quadraticCurveTo(0, c.height, 0, c.height - r);
  g.lineTo(0, r);
  g.quadraticCurveTo(0, 0, r, 0);
  g.fill();

  g.strokeStyle = accent;
  g.lineWidth = 3;
  g.stroke();

  g.fillStyle = "#F4EBDA";
  g.font = `600 ${fs}px Fraunces, Georgia, serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, c.width / 2, c.height / 2 + 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Tekstur deret jendela — satu panel berisi grid jendela menyala/gelap.
 * Dipakai pada fasad gedung agar terlihat hidup tanpa menambah banyak mesh.
 */
export function windowGridTexture(cols: number, rows: number, accent = "#FFD98A"): THREE.CanvasTexture {
  const cell = 24;
  const c = document.createElement("canvas");
  c.width = Math.max(cols * cell, cell);
  c.height = Math.max(rows * cell, cell);
  const g = c.getContext("2d")!;

  const rng = mulberry32(cols * 977 + rows * 131);
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cell + 4;
      const y = r * cell + 5;
      const w = cell - 8;
      const h = cell - 10;
      const nyala = rng() > 0.45;
      if (nyala) {
        // sekeliling jendela sedikit bercahaya (halo tipis)
        g.globalAlpha = 0.22;
        g.fillStyle = "#FFF3D0";
        g.fillRect(x - 2, y - 2, w + 4, h + 4);
        g.globalAlpha = 0.55 + rng() * 0.45;
        g.fillStyle = accent;
        g.fillRect(x, y, w, h);
      } else {
        g.globalAlpha = 0.92;
        g.fillStyle = "rgba(26,20,12,0.95)";
        g.fillRect(x, y, w, h);
      }
    }
  }
  g.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** PRNG kecil agar penyebaran pohon deterministik (sama pada setiap pemuatan). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
