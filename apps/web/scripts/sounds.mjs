// Synthèse déterministe des bruitages (sauf « correct », conservé de Kenney Interface Sounds, CC0).
// Usage : node apps/web/scripts/sounds.mjs   -> écrit apps/web/public/sounds/*.wav
// Mono, 16 bits, 22,05 kHz, normalisés au même niveau RMS (volumes harmonisés), < 50 ko chacun.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sounds');
const TARGET_RMS = 0.16;
const PEAK_MAX = 0.89;

let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;

/** Génère `dur` secondes ; f(t, i) renvoie l'échantillon. */
const make = (dur, f) => Float32Array.from({ length: Math.round(dur * RATE) }, (_, i) => f(i / RATE, i));
const env = (t, a, d) => Math.min(t / a, 1) * Math.exp(-t / d);
/** Oscillateur à fréquence variable (phase intégrée). */
const sweep = (dur, f0, f1, shape = Math.sin) => {
  let ph = 0;
  return make(dur, (t) => {
    ph += (2 * Math.PI * (f0 + (f1 - f0) * (t / dur))) / RATE;
    return shape(ph);
  });
};
const square = (p) => (Math.sin(p) >= 0 ? 0.6 : -0.6);
const mul = (a, f) => a.map((v, i) => v * f(i / RATE));
const mix = (...parts) => {
  const n = Math.max(...parts.map(([, off, a]) => Math.round(off * RATE) + a.length));
  const o = new Float32Array(n);
  for (const [gain, off, a] of parts) a.forEach((v, i) => (o[Math.round(off * RATE) + i] += v * gain));
  return o;
};
const note = (freq, dur, shape = Math.sin, decay = 0.12) =>
  mul(sweep(dur, freq, freq, shape), (t) => env(t, 0.004, decay));
const lowpass = (a, k) => {
  let y = 0;
  return a.map((v) => (y += k * (v - y)));
};

const sounds = {
  click: mul(sweep(0.07, 900, 600), (t) => env(t, 0.002, 0.02)),
  wrong: mix(
    [1, 0, mul(sweep(0.38, 220, 110, square), (t) => env(t, 0.005, 0.18))],
    [0.5, 0, mul(sweep(0.38, 233, 117), (t) => env(t, 0.005, 0.18))],
  ),
  combo: mix(
    [1, 0, note(659, 0.12, Math.sin, 0.08)],
    [1, 0.08, note(784, 0.12, Math.sin, 0.08)],
    [1, 0.16, note(988, 0.12, Math.sin, 0.08)],
    [1, 0.24, note(1319, 0.4, Math.sin, 0.2)],
  ),
  hit: mix(
    [
      1,
      0,
      mul(
        lowpass(
          make(0.25, () => rnd()),
          0.35,
        ),
        (t) => env(t, 0.001, 0.05),
      ),
    ],
    [1.2, 0, mul(sweep(0.25, 180, 50), (t) => env(t, 0.001, 0.07))],
  ),
  hurt: mix(
    [
      0.8,
      0,
      mul(
        lowpass(
          make(0.35, () => rnd()),
          0.2,
        ),
        (t) => env(t, 0.001, 0.09),
      ),
    ],
    [1, 0, mul(sweep(0.35, 330, 90, square), (t) => env(t, 0.002, 0.12))],
  ),
  victory: mix(
    [1, 0, note(523, 0.16, Math.sin, 0.1)],
    [1, 0.14, note(659, 0.16, Math.sin, 0.1)],
    [1, 0.28, note(784, 0.16, Math.sin, 0.1)],
    [1, 0.42, note(1047, 0.5, Math.sin, 0.3)],
    [0.6, 0.42, note(1319, 0.5, Math.sin, 0.3)],
    [0.5, 0.42, note(784, 0.5, Math.sin, 0.3)],
  ),
  defeat: mix(
    [1, 0, note(392, 0.3, Math.sin, 0.2)],
    [1, 0.28, note(311, 0.3, Math.sin, 0.2)],
    [1, 0.56, note(262, 0.4, Math.sin, 0.25)],
    [0.4, 0.56, note(131, 0.4, square, 0.2)],
  ),
  chest: mix(
    [1, 0, mul(sweep(0.3, 200, 500), (t) => env(t, 0.01, 0.2))],
    [1, 0.25, note(1047, 0.5, Math.sin, 0.25)],
    [0.8, 0.32, note(1568, 0.45, Math.sin, 0.2)],
    [0.6, 0.4, note(2093, 0.4, Math.sin, 0.15)],
  ),
  levelup: mix(
    [1, 0, note(523, 0.12, Math.sin, 0.07)],
    [1, 0.1, note(659, 0.12, Math.sin, 0.07)],
    [1, 0.2, note(784, 0.12, Math.sin, 0.07)],
    [1, 0.3, note(1047, 0.12, Math.sin, 0.07)],
    [1, 0.4, note(1319, 0.7, Math.sin, 0.35)],
    [0.5, 0.4, note(2637, 0.7, Math.sin, 0.2)],
  ),
  appear: mix(
    [1, 0, mul(sweep(0.4, 150, 900), (t) => env(t, 0.1, 0.3))],
    [
      0.5,
      0.05,
      mul(
        lowpass(
          make(0.4, () => rnd()),
          0.1,
        ),
        (t) => env(t, 0.15, 0.2),
      ),
    ],
  ),
};

function wav(samples) {
  const rms = Math.sqrt(samples.reduce((s, v) => s + v * v, 0) / samples.length);
  const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  const gain = Math.min(TARGET_RMS / rms, PEAK_MAX / peak);
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  // Fondu final de 10 ms pour éviter les clics.
  const fade = Math.round(0.01 * RATE);
  samples.forEach((v, i) => {
    const f = Math.min(1, (n - i) / fade);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * gain * f)) * 32767), 44 + i * 2);
  });
  return buf;
}

for (const [name, s] of Object.entries(sounds)) writeFileSync(join(OUT, `${name}.wav`), wav(s));
console.log(`Sons écrits : ${Object.keys(sounds).join(', ')}`);
