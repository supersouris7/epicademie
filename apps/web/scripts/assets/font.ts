/**
 * Texte vectorisé avec Lilita One (SIL OFL 1.1, via @fontsource/lilita-one).
 * Les SVG affichés dans <img> n'ont pas accès aux polices de la page : le texte doit être en chemins.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
let cached: opentype.Font | undefined;

function font(): opentype.Font {
  if (!cached) {
    const file = require.resolve('@fontsource/lilita-one/files/lilita-one-latin-400-normal.woff');
    const buf = readFileSync(file);
    cached = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return cached;
}

export interface TextPath {
  readonly d: string;
  readonly width: number;
}

/** Chemin du texte, centré horizontalement sur `cx`, ligne de base en `y`. */
export function textPath(text: string, cx: number, y: number, size: number, tracking = 0): TextPath {
  const f = font();
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(text);
  const advances = glyphs.map((g, i) => {
    const next = glyphs[i + 1];
    const kern = next ? f.getKerningValue(g, next) : 0;
    return ((g.advanceWidth ?? 0) + kern) * scale + (next ? tracking : 0);
  });
  const width = advances.reduce((s, a) => s + a, 0);
  let x = cx - width / 2;
  const parts = glyphs.map((g, i) => {
    const d = g.getPath(x, y, size).toPathData(1);
    x += advances[i] ?? 0;
    return d;
  });
  return { d: parts.join(''), width };
}
