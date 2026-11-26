import type { Chapter, Level, Skill } from '../types.ts';
import { choice, num, traps } from '../build.ts';
import { div, fmt, mul, r } from '../rational.ts';
import { circuitsSerieDerivation } from './circuits.ts';
import { conducteursIsolants } from './conducteurs.ts';
import { conservationMasse } from './conservation.ts';
import { conversionsEnergie } from './conversions-energie.ts';
import { etats } from './etats.ts';
import { sourcesFormesEnergie } from './formes-energie.ts';
import { masseVolumique } from './masse-volumique.ts';
import { corpsPurs } from './melanges.ts';
import { mouvementUniforme } from './mouvement-uniforme.ts';
import { referentielNotion } from './referentiel.ts';
import { solubiliteNotion } from './solubilite.ts';
import { trajectoireNotion } from './trajectoire.ts';
import { vitesseMoyenne } from './vitesse-moyenne.ts';

/**
 * Physique-chimie, cycle 4 (docs/adr/0024-contenus-hors-maths.md). Sources institutionnelles :
 * - relations au programme : programme de physique-chimie du cycle 4 (BOEN n° 31 du
 *   30 juillet 2020) : relation vitesse–distance–durée (mouvement
 *   uniforme), loi d'Ohm, puissance électrique P = U × I, relation énergie–puissance–durée ;
 * - unités, symboles et préfixes : BIPM, Le Système international d'unités (SI), 9e édition,
 *   résumé en français (tableaux 1 à 3 : unités de base, unités dérivées à nom spécial —
 *   ohm = V/A, watt = J/s — et préfixes).
 * Le programme est écrit pour tout le cycle : la répartition 5e / 4e / 3e est un choix de
 * progression (des relations les plus simples aux plus composées).
 * Le chapitre 5e « Organisation de la matière » (5 niveaux) a ses fichiers et ses faits cités
 * (`donnees-matiere.ts`), de même que les chapitres 5e « Mouvement » (`donnees-mouvement.ts`) et « Énergie et
 * circuits » (`donnees-energie.ts`).
 */

const PROG = 'Physique-chimie, cycle 4 (BOEN n° 31 du 30 juillet 2020)';
const BIPM = 'BIPM, Le Système international d’unités, 9e édition (résumé)';

type Rng = { int(min: number, max: number): number; pick<T>(l: readonly T[]): T };

// ——— Unités et préfixes (BIPM) ———
const UNITS: readonly { readonly grandeur: string; readonly unite: string; readonly symbole: string }[] = [
  { grandeur: 'longueur', unite: 'mètre', symbole: 'm' },
  { grandeur: 'masse', unite: 'kilogramme', symbole: 'kg' },
  { grandeur: 'temps (durée)', unite: 'seconde', symbole: 's' },
  { grandeur: 'intensité du courant électrique', unite: 'ampère', symbole: 'A' },
  { grandeur: 'température thermodynamique', unite: 'kelvin', symbole: 'K' },
  { grandeur: 'force', unite: 'newton', symbole: 'N' },
  { grandeur: 'énergie', unite: 'joule', symbole: 'J' },
  { grandeur: 'puissance', unite: 'watt', symbole: 'W' },
  { grandeur: 'tension électrique (différence de potentiel)', unite: 'volt', symbole: 'V' },
  { grandeur: 'résistance électrique', unite: 'ohm', symbole: 'Ω' },
  { grandeur: 'fréquence', unite: 'hertz', symbole: 'Hz' },
  { grandeur: 'pression', unite: 'pascal', symbole: 'Pa' },
];

const PREFIXES: readonly {
  readonly nom: string;
  readonly symbole: string;
  readonly facteur: string;
  readonly tier: Level;
}[] = [
  { nom: 'kilo', symbole: 'k', facteur: '1 000 (10^3)', tier: 1 },
  { nom: 'milli', symbole: 'm', facteur: '0,001 (10^-3)', tier: 1 },
  { nom: 'centi', symbole: 'c', facteur: '0,01 (10^-2)', tier: 1 },
  { nom: 'méga', symbole: 'M', facteur: '1 000 000 (10^6)', tier: 2 },
  { nom: 'micro', symbole: 'μ', facteur: '0,000 001 (10^-6)', tier: 2 },
  { nom: 'giga', symbole: 'G', facteur: '10^9', tier: 3 },
  { nom: 'nano', symbole: 'n', facteur: '10^-9', tier: 3 },
];

const units: Skill = {
  id: 'p5-unites',
  title: 'Les unités du Système international',
  lesson: {
    memo: [
      'Chaque grandeur a son unité : la force en newtons (N), l’énergie en joules (J), la puissance en watts (W), la tension en volts (V).',
    ],
    source: `${BIPM} : tableaux 1 et 2.`,
  },
  generate: (rng) => {
    const u = rng.pick(UNITS);
    const others = UNITS.filter((x) => x.unite !== u.unite);
    const wrong = [rng.pick(others), rng.pick(others), rng.pick(others)];
    const { answer, traps: t } = choice(
      rng,
      `${u.unite} (${u.symbole})`,
      wrong.map((w) => ({ label: `${w.unite} (${w.symbole})`, why: `Le ${w.unite} mesure la ${w.grandeur}.` })),
    );
    return {
      prompt: `Dans quelle unité du Système international exprime-t-on la **${u.grandeur}** ?`,
      answer,
      traps: t,
      hint: 'Pense aux grandeurs du cours : force, énergie, puissance, tension…',
      steps: [`La ${u.grandeur} s’exprime en ${u.unite}s.`, `Unité : **${u.unite} (${u.symbole})**.`],
    };
  },
};

const prefixes: Skill = {
  id: 'p5-prefixes',
  title: 'Les préfixes du SI',
  lesson: {
    memo: [
      'kilo (k) = × 1 000, milli (m) = × 0,001 : 1 km = 1 000 m, 1 mA = 0,001 A.',
      'méga (M) = × 1 000 000, micro (μ) = × 0,000 001.',
    ],
    source: `${BIPM} : tableau 3.`,
  },
  generate: (rng, level) => {
    const p = rng.pick(PREFIXES.filter((x) => x.tier <= level));
    const others = PREFIXES.filter((x) => x.nom !== p.nom);
    const { answer, traps: t } = choice(
      rng,
      p.facteur,
      [rng.pick(others), rng.pick(others)].map((o) => ({ label: o.facteur, why: `C’est le facteur de « ${o.nom} ».` })),
    );
    return {
      prompt: `Que vaut le préfixe **${p.nom}** (${p.symbole}) ?`,
      answer,
      traps: t,
      hint: 'kilo = mille ; milli = un millième.',
      steps: [`Le préfixe ${p.nom} (${p.symbole}) multiplie l’unité par ${p.facteur}.`, `Réponse : **${p.facteur}**.`],
    };
  },
};

// ——— Relations (programme) ———
interface RelationSpec {
  readonly id: string;
  readonly title: string;
  readonly memo: string[];
  readonly source: string;
  /** Tire deux grandeurs entières et demande la 3e (produit ou quotient exact). */
  readonly draw: (
    rng: Rng,
    level: Level,
  ) => {
    readonly prompt: string;
    readonly value: ReturnType<typeof r>;
    readonly unit: string;
    readonly wrong: ReturnType<typeof r>;
    readonly why: string;
    readonly steps: string[];
  };
}

function relation(spec: RelationSpec): Skill {
  return {
    id: spec.id,
    title: spec.title,
    lesson: { memo: spec.memo, source: spec.source },
    generate: (rng, level) => {
      const d = spec.draw(rng, level);
      return {
        prompt: d.prompt,
        answer: num(d.value, d.unit),
        traps: traps(d.value, [[d.wrong, d.why]]),
        hint: 'Écris d’abord la relation, puis remplace chaque lettre par sa valeur.',
        steps: d.steps,
      };
    },
  };
}

/** Facteur entier et produit, pour un quotient exact. */
const pair = (rng: Rng, level: Level): [number, number] => {
  const a = rng.int(2, level === 1 ? 9 : 20);
  const b = rng.int(2, level === 3 ? 60 : 12);
  return [a, b];
};

const speed = relation({
  id: 'p4-vitesse',
  title: 'La vitesse',
  memo: [
    'Mouvement uniforme : vitesse = distance ÷ durée (v = d ÷ t).',
    'En km/h si d est en km et t en h ; en m/s si d est en m et t en s.',
  ],
  source: `${PROG} : « Utiliser la relation liant vitesse, distance et durée dans le cas d’un mouvement uniforme ».`,
  draw: (rng, level) => {
    const [v, t] = pair(rng, level);
    const d = v * t;
    return {
      prompt: `Un objet parcourt ${d} m en ${t} s à vitesse constante. Quelle est sa vitesse, en m/s ?`,
      value: r(v),
      unit: 'm/s',
      wrong: div(r(t), r(d)),
      why: 'La vitesse, c’est la distance divisée par la durée (pas l’inverse).',
      steps: ['v = d ÷ t.', `v = ${d} ÷ ${t} = **${v} m/s**.`],
    };
  },
});

const ohm = relation({
  id: 'p4-loi-ohm',
  title: 'La loi d’Ohm',
  memo: [
    'Loi d’Ohm : U = R × I (tension en volts, résistance en ohms, intensité en ampères).',
    'L’ohm vaut un volt par ampère (Ω = V/A).',
  ],
  source: `${PROG} : « Relation tension – courant : loi d’Ohm » ; ${BIPM} : ohm = V/A.`,
  draw: (rng, level) => {
    const [rr, i] = pair(rng, level);
    const u = rr * i;
    const askU = rng.pick([true, false]);
    return askU
      ? {
          prompt: `Une résistance de ${rr} Ω est traversée par un courant de ${i} A. Quelle est la tension à ses bornes, en V ?`,
          value: r(u),
          unit: 'V',
          wrong: r(rr + i),
          why: 'U = R × I : on multiplie (on n’additionne pas).',
          steps: ['U = R × I.', `U = ${rr} × ${i} = **${u} V**.`],
        }
      : {
          prompt: `Une tension de ${u} V est appliquée à une résistance de ${rr} Ω. Quelle est l’intensité du courant, en A ?`,
          value: r(i),
          unit: 'A',
          wrong: r(u * rr),
          why: 'I = U ÷ R : on divise la tension par la résistance.',
          steps: ['U = R × I, donc I = U ÷ R.', `I = ${u} ÷ ${rr} = **${i} A**.`],
        };
  },
});

const power = relation({
  id: 'p3-puissance',
  title: 'La puissance électrique',
  memo: ['P = U × I : puissance (W) = tension (V) × intensité (A).'],
  source: `${PROG} : « Puissance électrique P = U.I ».`,
  draw: (rng, level) => {
    const [u, i] = pair(rng, level);
    return {
      prompt: `Un appareil fonctionne sous ${u} V et est traversé par ${i} A. Quelle est sa puissance, en W ?`,
      value: r(u * i),
      unit: 'W',
      wrong: r(u + i),
      why: 'P = U × I : on multiplie la tension par l’intensité.',
      steps: ['P = U × I.', `P = ${u} × ${i} = **${u * i} W**.`],
    };
  },
});

const energy = relation({
  id: 'p3-energie',
  title: 'L’énergie électrique',
  memo: ['E = P × t : énergie (J) = puissance (W) × durée (s), car un watt vaut un joule par seconde.'],
  source: `${PROG} : « Relation liant l’énergie, la puissance électrique et la durée » ; ${BIPM} : watt = J/s.`,
  draw: (rng, level) => {
    const [p, t] = pair(rng, level);
    return {
      prompt: `Un appareil de ${p} W fonctionne pendant ${t} s. Quelle énergie consomme-t-il, en J ?`,
      value: mul(r(p), r(t)),
      unit: 'J',
      wrong: div(r(p), r(t)),
      why: 'E = P × t : on multiplie la puissance par la durée.',
      steps: ['E = P × t (1 W = 1 J/s).', `E = ${p} × ${t} = **${fmt(mul(r(p), r(t)))} J**.`],
    };
  },
});

const chapter = (id: string, grade: Chapter['grade'], title: string, skills: readonly Skill[]): Chapter => ({
  id,
  subject: 'sciences',
  grade,
  domain: 'physique-chimie',
  title,
  skills,
});

export const PHYSIQUE_CHAPTERS: readonly Chapter[] = [
  chapter('p5-unites', '5e', 'Unités et préfixes', [units, prefixes]),
  chapter('p5-matiere', '5e', 'Organisation de la matière', [
    etats,
    corpsPurs,
    masseVolumique,
    solubiliteNotion,
    conservationMasse,
  ]),
  chapter('p5-mouvement', '5e', 'Mouvement', [trajectoireNotion, referentielNotion, mouvementUniforme, vitesseMoyenne]),
  chapter('p5-energie', '5e', 'Énergie et circuits', [
    sourcesFormesEnergie,
    conversionsEnergie,
    circuitsSerieDerivation,
    conducteursIsolants,
  ]),
  chapter('p4-mouvement', '4e', 'La vitesse', [speed]),
  chapter('p4-electricite', '4e', 'La loi d’Ohm', [ohm]),
  chapter('p3-energie', '3e', 'Puissance et énergie', [power, energy]),
];
