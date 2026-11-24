// Fonds de cartes SVG simplifiés (ADR 0034, figure `map`).
// Sources :
// - IGN Admin Express (Licence Ouverte 2.0), via la version simplifiée de gregoiredavid/france-geojson :
//   régions et départements de France métropolitaine ;
// - Natural Earth 1:110m (domaine public) : pays, continents, fleuves.
// Les océans sont des zones dessinées à la main (Natural Earth ne les découpe pas).
//
// Usage (les fichiers GeoJSON sont téléchargés avant, dans un dossier vide) :
//   node apps/web/scripts/fonds-cartes.mjs <dossier-geojson> <dossier-sortie-web> <fichier-zones-content>
//   <dossier-geojson> : regions-version-simplifiee.geojson, departements-version-simplifiee.geojson,
//     ne_110m_admin_0_countries.geojson, ne_110m_rivers_lake_centerlines.geojson
// Lancer ensuite `pnpm exec prettier --write` sur les fichiers écrits.
// Écrit un fichier `fonds-<carte>.ts` par carte (chargé à la demande par l'appli) et le registre des zones.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dirIn, dirOut, zonesFile] = process.argv.slice(2);
if (!dirIn || !dirOut || !zonesFile) throw new Error('Usage : fonds-cartes.mjs <geojson> <sortie-web> <zones-content>');
const read = (f) => JSON.parse(readFileSync(join(dirIn, f), 'utf8'));

const rad = Math.PI / 180;

/** Projection équirectangulaire corrigée de la latitude centrale ; renvoie un projecteur lon/lat → x/y. */
function projection({ lon0, lon1, lat0, lat1, k, midLat }) {
  const c = Math.cos(midLat * rad);
  return {
    width: Math.round((lon1 - lon0) * c * k),
    height: Math.round((lat1 - lat0) * k),
    xy: ([lon, lat]) => [(lon - lon0) * c * k, (lat1 - lat) * k],
  };
}

/** Douglas-Peucker (anneau ouvert). */
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let dmax = 0;
    let at = -1;
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const len = Math.hypot(bx - ax, by - ay) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
      if (d > dmax) {
        dmax = d;
        at = i;
      }
    }
    if (dmax > tol && at > 0) {
      keep[at] = 1;
      stack.push([a, at], [at, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Anneau fermé : coupé au point le plus éloigné du départ, chaque moitié est simplifiée. */
function simplifyRing(ring, tol) {
  const pts =
    ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? ring.slice(0, -1) : ring;
  if (pts.length < 4) return pts;
  let far = 1;
  for (let i = 1; i < pts.length; i++) {
    if (
      Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]) >
      Math.hypot(pts[far][0] - pts[0][0], pts[far][1] - pts[0][1])
    )
      far = i;
  }
  const a = simplify(pts.slice(0, far + 1), tol);
  const b = simplify([...pts.slice(far), pts[0]], tol);
  return [...a, ...b.slice(1, -1)];
}

const area = (r) => {
  let s = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i];
    const [x2, y2] = r[(i + 1) % r.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
};

/** Découpe d'un anneau par un rectangle (Sutherland-Hodgman) en lon/lat. */
function clipRect(ring, [x0, y0, x1, y1]) {
  const edges = [
    [([x]) => x >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [([x]) => x <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [([, y]) => y >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [([, y]) => y <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (out.length === 0) break;
  }
  return out.length >= 3 ? out : null;
}

/** Anneaux (premier = contour, suivants = trous) de chaque polygone d'une géométrie GeoJSON. */
const polygonsOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);

/** Zone : { id, name, rings: [[pt]] (x/y), k } -> chemin SVG, centre. */
function pathOf(rings, tol) {
  const parts = [];
  let best = null;
  for (const ring of rings) {
    const s = simplifyRing(ring, tol);
    if (s.length < 3 || Math.abs(area(s)) < tol * tol * 2) continue;
    parts.push(`M${s.map(([x, y]) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`).join(' ')}Z`);
    if (!best || Math.abs(area(s)) > Math.abs(area(best))) best = s;
  }
  let c = [0, 0];
  if (best) {
    const [xs, ys] = [best.map((p) => p[0]), best.map((p) => p[1])];
    c = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  return { d: parts.join(''), c: c.map((v) => Math.round(v)) };
}

const lineOf = (pts, tol) => {
  const s = simplify(pts, tol);
  return `M${s.map(([x, y]) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`).join(' ')}`;
};

const projectRings = (poly, proj) => poly.map((r) => r.map(proj.xy));

const maps = {};
const zones = {};

// --- France : régions et départements métropolitains (IGN Admin Express) ---
const FR = projection({ lon0: -5.5, lon1: 10, lat0: 41, lat1: 51.2, k: 74, midLat: 46 });
for (const [id, file, tol] of [
  ['france-regions', 'regions-version-simplifiee.geojson', 0.9],
  ['france-departements', 'departements-version-simplifiee.geojson', 1],
]) {
  const out = [];
  zones[id] = {};
  for (const f of read(file).features) {
    const code = f.properties.code;
    // France métropolitaine seulement : régions 11 à 94, départements à deux caractères (01 à 95, 2A, 2B).
    if (code.length > 2 || (id === 'france-regions' && Number(code) < 11)) continue;
    const rings = polygonsOf(f.geometry).flatMap((p) => projectRings(p, FR));
    const { d, c } = pathOf(rings, tol);
    out.push({ id: code, d, c });
    zones[id][code] = f.properties.nom;
  }
  maps[id] = { w: FR.width, h: FR.height, zones: out, back: '' };
}

// --- Europe : pays (Natural Earth), fenêtre lon -25..45, lat 34..72 ---
const countries = read('ne_110m_admin_0_countries.geojson').features;
const EU = projection({ lon0: -25, lon1: 45, lat0: 34, lat1: 72, k: 20, midLat: 53 });
const EUROPE =
  'FRA ESP PRT ITA DEU GBR IRL BEL NLD CHE AUT POL CZE HUN ROU BGR GRC SWE NOR FIN DNK ISL UKR BLR LTU LVA EST SVK SVN HRV SRB BIH ALB MKD MNE MDA LUX RUS'.split(
    ' ',
  );
{
  const WIN = [-25, 34, 45, 72];
  const zs = [];
  const back = [];
  zones.europe = {};
  for (const f of countries) {
    const a3 = f.properties.ADM0_A3;
    const rings = polygonsOf(f.geometry).flatMap((p) =>
      p
        .map((r) => clipRect(r, WIN))
        .filter(Boolean)
        .map((r) => r.map(EU.xy)),
    );
    if (rings.length === 0) continue;
    const { d, c } = pathOf(rings, 1);
    if (!d) continue;
    if (EUROPE.includes(a3)) {
      zs.push({ id: a3.toLowerCase(), d, c });
      zones.europe[a3.toLowerCase()] = f.properties.NAME_FR;
    } else back.push(d);
  }
  maps.europe = { w: EU.width, h: EU.height, zones: zs, back: back.join('') };
}

// --- Monde : continents, océans, grands fleuves ---
{
  const W = projection({ lon0: -180, lon1: 180, lat0: -90, lat1: 85, k: 2.5, midLat: 0 });
  const CONT = {
    Africa: 'afrique',
    Antarctica: 'antarctique',
    Asia: 'asie',
    Europe: 'europe',
    Oceania: 'oceanie',
    'North America': 'amerique-nord',
    'South America': 'amerique-sud',
  };
  const NAMES = {
    afrique: 'Afrique',
    antarctique: 'Antarctique',
    asie: 'Asie',
    europe: 'Europe',
    oceanie: 'Océanie',
    'amerique-nord': 'Amérique du Nord',
    'amerique-sud': 'Amérique du Sud',
  };
  // Océans : polygones lon/lat simplifiés (limites conventionnelles approchées), sous les continents.
  const OCEANS = {
    arctique: [
      'Océan Arctique',
      [
        [
          [-180, 66],
          [180, 66],
          [180, 90],
          [-180, 90],
        ],
      ],
    ],
    atlantique: [
      'Océan Atlantique',
      [
        [
          [-100, 66],
          [20, 66],
          [20, -60],
          [-68, -60],
          [-68, -40],
          [-80, -5],
          [-84, 8],
          [-100, 18],
        ],
      ],
    ],
    pacifique: [
      'Océan Pacifique',
      [
        [
          [-180, 66],
          [-100, 66],
          [-100, 18],
          [-84, 8],
          [-80, -5],
          [-68, -40],
          [-68, -60],
          [-180, -60],
        ],
        [
          [100, 66],
          [180, 66],
          [180, -60],
          [147, -60],
          [147, -45],
          [114, -35],
          [114, -22],
          [105, -6],
          [100, 8],
        ],
      ],
    ],
    indien: [
      'Océan Indien',
      [
        [
          [20, -60],
          [20, 28],
          [78, 26],
          [100, 8],
          [105, -6],
          [114, -22],
          [114, -35],
          [147, -45],
          [147, -60],
        ],
      ],
    ],
  };
  const RIVERS = {
    Nile: ['nil', 'Nil'],
    Amazonas: ['amazone', 'Amazone'],
    Mississippi: ['mississippi', 'Mississippi'],
    Congo: ['congo', 'Congo'],
    Donau: ['danube', 'Danube'],
  };
  zones.monde = {};
  const sea = Object.entries(OCEANS).map(([id, [name, polys]]) => {
    zones.monde[id] = name;
    const { d, c } = pathOf(
      polys.map((p) => p.map(W.xy)),
      0.01,
    );
    return { id, d, c, k: 'sea' };
  });
  const byCont = {};
  for (const f of countries) {
    const id = CONT[f.properties.CONTINENT];
    if (!id) continue;
    for (const poly of polygonsOf(f.geometry)) {
      const parts =
        f.properties.ADM0_A3 === 'RUS' && poly[0].some(([lon]) => lon > 60) && poly[0].some(([lon]) => lon < 60)
          ? [
              ['europe', clipRect(poly[0], [-180, -90, 60, 90])],
              ['asie', clipRect(poly[0], [60, -90, 180, 90])],
            ]
          : [[id, poly[0]]];
      for (const [cid, ring] of parts) {
        if (!ring) continue;
        (byCont[cid] ??= []).push([ring.map(W.xy), ...poly.slice(1).map((r) => r.map(W.xy))]);
      }
    }
  }
  const land = Object.entries(byCont).map(([id, polys]) => {
    zones.monde[id] = NAMES[id];
    const { d } = pathOf(polys.flat(), 0.8);
    // Centre : celui du plus grand polygone.
    const biggest = polys.reduce((a, p) => (Math.abs(area(p[0])) > Math.abs(area(a[0])) ? p : a));
    const { c } = pathOf([biggest[0]], 0.5);
    return { id, d, c, k: 'land' };
  });
  const rivers = [];
  for (const f of read('ne_110m_rivers_lake_centerlines.geojson').features) {
    const hit = RIVERS[f.properties.name];
    if (!hit) continue;
    const pts = f.geometry.coordinates.map(W.xy);
    const mid = pts[Math.floor(pts.length / 2)].map((v) => Math.round(v));
    rivers.push({ id: hit[0], d: lineOf(pts, 0.4), c: mid, k: 'river' });
    zones.monde[hit[0]] = hit[1];
  }
  maps.monde = { w: W.width, h: W.height, zones: [...sea, ...land, ...rivers], back: '' };
}

// --- Écriture ---
const header = '// Fichier généré par apps/web/scripts/fonds-cartes.mjs : ne pas modifier à la main.\n';
for (const [id, m] of Object.entries(maps)) {
  const body = `${header}import type { FondCarte } from './types.ts';\n\nexport const fond: FondCarte = ${JSON.stringify(m)};\n`;
  writeFileSync(join(dirOut, `fonds-${id}.ts`), body);
}
const keys = Object.keys(zones)
  .map((k) => `'${k}'`)
  .join(' | ');
const registry = `${header}export const ZONES: Record<${keys}, Record<string, string>> = ${JSON.stringify(zones)};\n`;
writeFileSync(zonesFile, registry);
for (const [id, m] of Object.entries(maps)) {
  console.log(id, m.zones.length, 'zones', JSON.stringify(m).length, 'octets');
}
