/** Effets sonores (fichiers CC0 Kenney, voir public/sounds). Lecture via Web Audio, tolérante aux échecs. */
export const SOUNDS = ['correct', 'wrong', 'combo', 'finish', 'levelup', 'click', 'reveal'] as const;
export type SoundName = (typeof SOUNDS)[number];

let ctx: AudioContext | null = null;
let enabled = true;
const buffers = new Map<SoundName, Promise<AudioBuffer | null>>();

function context(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  ctx ??= new AudioContext();
  return ctx;
}

function load(name: SoundName): Promise<AudioBuffer | null> {
  let p = buffers.get(name);
  if (!p) {
    p = fetch(`/sounds/${name}.wav`)
      .then((r) => r.arrayBuffer())
      .then((data) => context()?.decodeAudioData(data) ?? null)
      .catch(() => null);
    buffers.set(name, p);
  }
  return p;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

export function preloadSounds() {
  for (const s of SOUNDS) void load(s);
}

export function playSound(name: SoundName, volume = 0.6) {
  if (!enabled) return;
  const c = context();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  void load(name).then((buffer) => {
    if (!buffer) return;
    const src = c.createBufferSource();
    const gain = c.createGain();
    gain.gain.value = volume;
    src.buffer = buffer;
    src.connect(gain).connect(c.destination);
    src.start();
  });
}
