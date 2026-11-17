/**
 * À partir du catalogue (src/design/assets.ts) :
 * - crée l'arborescence public/assets/** et assets-src/originals/** ;
 * - recense les images finales déjà livrées (src/design/assets.available.ts) ;
 * - génère le guide de génération ChatGPT (docs/ASSETS-CHATGPT.md).
 * Usage : pnpm --filter @questeo/web assets:plan
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KINDS, PLANNED_ASSETS, QUESTY_LOOK, type AssetKind, type PlannedAsset } from '../../src/design/assets.ts';
import { PALETTE } from '../../src/design/palette.ts';

const WEB = fileURLToPath(new URL('../../', import.meta.url));
const PUBLIC = join(WEB, 'public/assets');
const ORIGINALS = join(WEB, 'assets-src/originals');
const DOC = join(WEB, '../../docs/ASSETS-CHATGPT.md');
const AVAILABLE = join(WEB, 'src/design/assets.available.ts');

const original = (p: PlannedAsset) => p.file.replace(/\.webp$/, '.png');
const size = (g: string) => g.replace('x', '×');
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface Sheet {
  readonly name: string;
  readonly items: readonly PlannedAsset[];
  readonly grid: NonNullable<AssetKind['grid']>;
  readonly kind: AssetKind;
  readonly first: PlannedAsset;
}

/** Planches groupées : un nom de planche = une image, découpée selon la grille du type d'asset. */
export function sheets(): Sheet[] {
  const groups = new Map<string, PlannedAsset[]>();
  for (const p of PLANNED_ASSETS) if (p.sheet) groups.set(p.sheet, [...(groups.get(p.sheet) ?? []), p]);
  return [...groups].map(([name, items]) => {
    const [first] = items;
    if (!first) throw new Error(`Planche vide : ${name}`);
    const kind: AssetKind = KINDS[first.kind];
    if (!kind.grid) throw new Error(`Type sans grille dans la planche ${name}`);
    if (items.some((p) => p.kind !== first.kind)) throw new Error(`Types mélangés dans la planche ${name}`);
    if (items.length > kind.grid.cols * kind.grid.rows) throw new Error(`Planche ${name} trop remplie`);
    return { name, items, grid: kind.grid, kind, first };
  });
}

const hex = (k: keyof typeof PALETTE) => PALETTE[k].toUpperCase();

const MASTER = `Tu es directeur artistique et illustrateur d'un jeu vidéo éducatif pour tablette, « Academy Fighters », destiné aux élèves de 5e (11-13 ans).
Je joins les planches de référence : elles fixent la direction artistique (personnages, mascotte, boss, interface). Toutes les images que je vais te demander doivent appartenir à cet univers et à ce style, comme si un seul illustrateur les avait dessinées. Ne recopie pas le texte des planches.

STYLE (à respecter pour CHAQUE image)
- Illustration 2D cartoon de jeu mobile moderne, rendu propre façon vectoriel, très lisible en petit sur tablette.
- Contour extérieur épais et régulier violet très foncé ${hex('ink')} (environ 3 % de la taille du sujet), contours intérieurs plus fins.
- Ombrage cel-shading en deux tons (ombre franche en bas à droite), un reflet blanc net en haut à gauche, lumière venant du haut à gauche.
- Couleurs saturées. Dominantes : violet ${hex('violet-500')} / ${hex('violet-700')}, orange ${hex('orange-500')}, crème ${hex('cream-100')}. Secondaires : cyan ${hex('cyan-500')}, vert ${hex('green-500')}, rose ${hex('pink-500')}, or ${hex('gold-400')}, rouge ${hex('red-500')}.
- Formes arrondies et épaisses, volumes simples, silhouettes reconnaissables au premier coup d'œil.
- Héros : proportions « héroïques chibi » (tête ≈ 1/3,5 de la hauteur), grands yeux expressifs, ados de 12 ans, sympathiques et dynamiques.
- Mascotte : ${QUESTY_LOOK}. Son visage n'existe que sous forme de LED sur la visière.
- Ennemis et boss : menaçants mais comiques, jamais effrayants ni gores.
- Armes : jouets futuristes aux formes rondes et aux couleurs vives, jamais réalistes.
- Éléments d'interface (cadres, boutons, tuiles) : épais, en relief, coins arrondis, bas plus sombre, reflet en haut, comme sur les planches.
- Création 100 % originale : ne copie ni personnage, ni logo, ni interface de Brawl Stars, Clash of Clans, Fortnite ou d'un autre jeu.

INTERDITS (sauf mention contraire dans la demande)
- Aucun texte, lettre, chiffre, logo, signature ou filigrane. Les libellés seront ajoutés par l'application.
- Pas de décor, pas de sol, pas d'ombre portée au sol, pas de cadre autour du sujet.
- Pas de grand halo lumineux flou ni de particules décoratives autour du sujet, pas d'étoiles décoratives.

FOND ET FORMAT
- Fond transparent si tu sais le produire. Sinon : fond uni magenta pur #FF00FF, parfaitement plat (sans dégradé, texture, ombre ni vignettage), et aucune teinte magenta dans le sujet.
- Exception : les illustrations « plein cadre » (fonds de décor, illustration principale, sols) ont un vrai décor et aucun fond magenta.
- Le sujet ne touche jamais les bords de l'image (sauf plein cadre et sols).
- L'application est uniquement en thème sombre : les images seront posées sur un fond violet très sombre (${hex('violet-950')}). Garde un contour bien visible et des couleurs lumineuses pour qu'elles ressortent.
- Respecte exactement la taille d'image demandée (1024×1024, 1536×1024 ou 1024×1536).

MÉTHODE
- Je t'envoie une demande par message. Réponds à chaque fois par UNE seule image, sans commentaire.
- Quand je joins une image de référence (fiche de Questy, portrait ou boss validé), reproduis exactement le même personnage : couleurs, coiffure, vêtements, proportions.
- Pour une planche en grille, respecte l'ordre et la grille : je découperai l'image automatiquement case par case.

Réponds simplement « Prêt » si tu as compris.`;

function individual(p: PlannedAsset, n: number): string {
  const k: AssetKind = KINDS[p.kind];
  const refAsset = PLANNED_ASSETS.find((q) => q.id === p.reference);
  const ref = refAsset ? `\n> 📎 Joindre l'image validée \`${original(refAsset)}\`.` : '';
  const flags = [k.opaque ? 'plein cadre (pas de fond magenta)' : '', k.nineSlice ? 'étirable en 9 parts' : '']
    .filter(Boolean)
    .join(', ');
  return [
    `#### ${n}. ${p.name}`,
    `Enregistrer sous \`assets-src/originals/${original(p)}\` · ${size(k.gen)} → final ${k.final.join('×')}${flags ? ` · ${flags}` : ''}${ref}`,
    '',
    '```text',
    `Image ${size(k.gen)}. ${capital(p.prompt)}${/[.!?]$/.test(p.prompt) ? '' : '.'}`,
    `Cadrage : ${k.framing}.`,
    'Style, fond et interdits : ceux du message de départ.',
    '```',
  ].join('\n');
}

function sheetPrompt(s: Sheet, n: number): string {
  const { gen, cols, rows } = s.grid;
  const [w, h] = gen.split('x').map(Number) as [number, number];
  const k = s.kind;
  const list = s.items.map((p, i) => `${i + 1}. ${p.prompt.replace(/\.$/, '')}`).join('\n');
  const files = s.items.map((p, i) => `${i + 1} → \`${p.file.replace(/\.webp$/, '')}\``).join(' · ');
  const refAsset = PLANNED_ASSETS.find((q) => q.id === s.first.reference);
  const ref = refAsset ? `\n> 📎 Joindre l'image validée \`${original(refAsset)}\`.` : '';
  return [
    `#### ${n}. Planche « ${s.name} » (${s.items.length} éléments)`,
    `Enregistrer sous \`assets-src/originals/sheets/${s.name}.png\` · ${size(gen)}, grille ${cols}×${rows} → chaque case finale ${k.final.join('×')}${ref}`,
    `Cases : ${files}`,
    '',
    '```text',
    `Image ${size(gen)} : planche de ${s.items.length} éléments de jeu disposés sur une grille invisible de ${cols} colonnes × ${rows} lignes (cases de ${Math.round(w / cols)}×${Math.round(h / rows)} px).`,
    'Ordre : de gauche à droite, puis de haut en bas. Chaque élément est centré dans sa case et ne déborde jamais sur une autre ; les cases en trop restent vides.',
    `Cadrage de chaque élément : ${k.framing}.`,
    'Tous les éléments ont la même épaisseur de contour, la même lumière et la même échelle visuelle.',
    '',
    list,
    '',
    'Style, fond et interdits : ceux du message de départ (une seule couleur de fond pour toute la planche).',
    '```',
  ].join('\n');
}

interface Lot {
  readonly title: string;
  readonly pick: (p: PlannedAsset) => boolean;
  readonly note?: string;
}

const LOTS: readonly Lot[] = [
  {
    title: 'Lot 1 — Marque et fonds de menu',
    pick: (p) => p.file.startsWith('branding/') && p.kind !== 'keyart',
  },
  {
    title: 'Lot 2 — Kit d’interface : cadres, boutons, tuiles',
    pick: (p) => p.file.startsWith('hud/'),
    note: 'Ces éléments sont vides : l’application y écrit les textes et y pose les pictogrammes. Ils seront étirés : les bords doivent rester droits et réguliers.',
  },
  { title: 'Lot 3 — Pictogrammes blancs (boutons)', pick: (p) => p.kind === 'glyph' },
  {
    title: 'Lot 4 — Icônes en couleur',
    pick: (p) => p.kind === 'icon' && !p.file.startsWith('characters/'),
  },
  {
    title: 'Lot 5 — Questy, la mascotte',
    pick: (p) => p.file.startsWith('characters/questy/'),
    note: 'Commencer par la fiche de modèle, la valider, puis la joindre à chaque demande de ce lot.',
  },
  {
    title: 'Lot 6 — Héros',
    pick: (p) => p.file.startsWith('characters/') || p.kind === 'keyart',
    note: 'Commencer par les 4 portraits. Pour les expressions et les poses d’un héros, joindre son portrait validé. L’illustration principale vient en dernier : joindre la fiche de Questy et les portraits d’Alex et de Zoé.',
  },
  {
    title: 'Lot 7 — Boss et ennemis',
    pick: (p) => p.file.startsWith('bosses/'),
    note: 'Pour le portrait et la version « touché » d’un boss, joindre l’image validée de ce boss.',
  },
  {
    title: 'Lot 8 — Armes et projectiles',
    pick: (p) => p.file.startsWith('weapons/') || p.file.startsWith('projectiles/'),
  },
  { title: 'Lot 9 — Effets', pick: (p) => p.kind === 'effect' },
  { title: 'Lot 10 — Environnements de combat', pick: (p) => p.file.startsWith('environments/') },
];

export function guide(): string {
  const all = sheets();
  const sheetOf = new Map(all.flatMap((s) => s.items.map((p) => [p.id, s] as const)));
  let n = 0;
  const done = new Set<string>();
  const summary: string[] = [];
  const lots: string[] = [];
  for (const lot of LOTS) {
    const items = PLANNED_ASSETS.filter((p) => !done.has(p.id) && lot.pick(p));
    if (!items.length) continue;
    const parts: string[] = [`### ${lot.title}`, ...(lot.note ? [`> ${lot.note}`] : [])];
    const seen = new Set<string>();
    const first = n + 1;
    for (const p of items) {
      if (done.has(p.id)) continue;
      const s = sheetOf.get(p.id);
      if (s) {
        if (seen.has(s.name)) continue;
        seen.add(s.name);
        for (const q of s.items) done.add(q.id);
        parts.push(sheetPrompt(s, ++n));
      } else {
        done.add(p.id);
        parts.push(individual(p, ++n));
      }
    }
    const count = items.length;
    summary.push(`| ${lot.title.replace(/^Lot (\d+) — /, '$1 | ')} | ${count} | ${first}–${n} |`);
    lots.push(parts.join('\n\n'));
  }
  const missed = PLANNED_ASSETS.filter((p) => !done.has(p.id));
  if (missed.length) throw new Error(`Assets non couverts par le guide : ${missed.map((p) => p.id).join(', ')}`);

  return `<!-- Fichier généré par apps/web/scripts/assets/plan.ts à partir de apps/web/src/design/assets.ts — ne pas modifier à la main. -->
# Academy Fighters — génération des images avec ChatGPT

${PLANNED_ASSETS.length} images finales, produites en ${n} demandes.

| Lot | Contenu | Images | Demandes |
|---|---|---|---|
${summary.join('\n')}

## Modèle à utiliser

Utilise **ChatGPT Images**, le générateur d’images intégré à ChatGPT, qui s’appuie sur le modèle GPT Image le plus récent :

- GPT Image 2.5 est sorti le 8 septembre 2026 ;
- GPT Image 2.6 est sorti le 4 novembre 2026.

Ces dates viennent de l’article Wikipédia « GPT Image ». OpenAI ne précise pas quelle version tourne dans l’application.

**Transparence**
- Dans l’application ChatGPT, le fond transparent est peu fiable. Le message de départ demande donc un fond magenta uni : le script d’import le retirera et vérifiera la transparence.
- Par l’API OpenAI, la série 2.5 (\`gpt-image-2.5\`) gérerait le fond transparent avec \`background: "transparent"\` et une sortie PNG. Cette information vient d’un blog tiers et n’est pas confirmée par la documentation d’OpenAI.

## Mode d’emploi

1. Ouvre **une conversation par lot**, pour que le style reste cohérent sans que la conversation ne s’allonge trop.
2. Dans chaque conversation, joins **toutes les planches de référence** et colle le **message de départ** ci-dessous.
3. Envoie ensuite les demandes du lot **une par une**, dans l’ordre.
4. Si une image ne convient pas, demande une correction précise (« contour plus épais », « même personnage mais sans sac ») plutôt que de tout régénérer.
5. Télécharge chaque image en PNG et enregistre-la exactement au chemin indiqué. Les dossiers existent déjà, dans \`apps/web/\`.
6. Les planches en grille seront découpées automatiquement. Garde toujours les originaux : ils restent dans \`assets-src/originals\`.
7. Dis-moi quand un lot est déposé. Je le détoure, je le convertis en WebP aux dimensions finales, je contrôle la transparence et je mets à jour le manifeste.

Aucune image ne contient de texte, sauf le logo et le badge « XP ». Les libellés (« Jouer », « Collection », noms des matières, chiffres) sont écrits par l’application, pour rester lisibles et modifiables.

## Message de départ (à coller dans chaque conversation)

\`\`\`text
${MASTER}
\`\`\`

## Demandes

${lots.join('\n\n')}
`;
}

export function availableFile(): string {
  const present = PLANNED_ASSETS.filter((p) => existsSync(join(PUBLIC, p.file))).map((p) => p.file);
  return `// Fichier généré par scripts/assets/plan.ts — images finales présentes dans public/assets.\nexport const AVAILABLE: readonly string[] = ${JSON.stringify(present, null, 2)};\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dirs = new Set<string>();
  for (const p of PLANNED_ASSETS) {
    dirs.add(join(PUBLIC, dirname(p.file)));
    dirs.add(join(ORIGINALS, dirname(p.file)));
  }
  dirs.add(join(ORIGINALS, 'sheets'));
  for (const d of dirs) {
    mkdirSync(d, { recursive: true });
    const keep = join(d, '.gitkeep');
    if (!existsSync(keep)) writeFileSync(keep, '');
  }
  writeFileSync(DOC, guide());
  writeFileSync(AVAILABLE, availableFile());
  console.log(
    `${dirs.size} dossiers, ${PLANNED_ASSETS.length} assets, ${sheets().length} planches → docs/ASSETS-CHATGPT.md`,
  );
}
