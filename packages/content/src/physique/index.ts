import type { Chapter, Level, Skill } from '../types.ts';
import { num, traps } from '../build.ts';
import { div, fmt, mul, r } from '../rational.ts';
import { atomesMolecules } from './atomes.ts';
import { circuitsSerieDerivation } from './circuits.ts';
import { combustions } from './combustions.ts';
import { conducteursIsolants } from './conducteurs.ts';
import { conservationTransformation } from './conservation-transformation.ts';
import { conservationMasse } from './conservation.ts';
import { conversionsEnergie } from './conversions-energie.ts';
import { etats } from './etats.ts';
import { forcesNotion } from './forces.ts';
import { sourcesFormesEnergie } from './formes-energie.ts';
import { formulesChimiques } from './formules.ts';
import { intensiteNotion } from './intensite.ts';
import { interactionsNotion } from './interactions.ts';
import { loiOhm } from './loi-ohm.ts';
import { loisCircuits } from './lois-circuits.ts';
import { masseVolumique } from './masse-volumique.ts';
import { corpsPurs } from './melanges.ts';
import { mouvementForce } from './mouvement-force.ts';
import { mouvementUniforme } from './mouvement-uniforme.ts';
import { prefixesSi } from './prefixes.ts';
import { propagationLumiere } from './propagation-lumiere.ts';
import { propagationSon } from './propagation-son.ts';
import { referentielNotion } from './referentiel.ts';
import { solubiliteNotion } from './solubilite.ts';
import { tensionNotion } from './tension.ts';
import { trajectoireNotion } from './trajectoire.ts';
import { transformationChimique } from './transformation.ts';
import { unitesSi } from './unites.ts';
import { vitesseCaracteres } from './vitesse-caracteres.ts';
import { vitesseMoyenne } from './vitesse-moyenne.ts';

/**
 * Physique-chimie, cycle 4 (docs/adr/0024-contenus-hors-maths.md). Sources institutionnelles :
 * - relations au programme : programme de physique-chimie du cycle 4 (BOEN n° 31 du
 *   30 juillet 2020) : puissance électrique P = U × I, relation énergie–puissance–durée ;
 * - unités : BIPM, Le Système international d'unités (SI), 9e édition, résumé en français
 *   (unité dérivée à nom spécial : watt = J/s).
 * Le programme est écrit pour tout le cycle : la répartition 5e / 4e / 3e est un choix de
 * progression (des relations les plus simples aux plus composées).
 * Le chapitre 5e « Organisation de la matière » (5 niveaux) a ses fichiers et ses faits cités
 * (`donnees-matiere.ts`), de même que les chapitres 5e « Mouvement » (`donnees-mouvement.ts`), « Énergie et
 * circuits » (`donnees-energie.ts`) et « Signaux et unités » (`donnees-signaux.ts`, identifiant historique
 * `p5-unites`).
 * Les chapitres 4e « Atomes et transformations » (`donnees-atomes.ts`) et « Mouvement et interactions »
 * (`donnees-interactions.ts`) suivent le même modèle, comme le chapitre 4e « Électricité »
 * (`donnees-electricite.ts`).
 */

const PROG = 'Physique-chimie, cycle 4 (BOEN n° 31 du 30 juillet 2020)';
const BIPM = 'BIPM, Le Système international d’unités, 9e édition (résumé)';

type Rng = { int(min: number, max: number): number; pick<T>(l: readonly T[]): T };

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
  chapter('p5-unites', '5e', 'Signaux et unités', [propagationLumiere, propagationSon, unitesSi, prefixesSi]),
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
  chapter('p4-atomes', '4e', 'Atomes et transformations', [
    atomesMolecules,
    formulesChimiques,
    transformationChimique,
    combustions,
    conservationTransformation,
  ]),
  chapter('p4-mouvement', '4e', 'Mouvement et interactions', [
    vitesseCaracteres,
    interactionsNotion,
    forcesNotion,
    mouvementForce,
  ]),
  chapter('p4-electricite', '4e', 'Électricité', [tensionNotion, intensiteNotion, loisCircuits, loiOhm]),
  chapter('p3-energie', '3e', 'Puissance et énergie', [power, energy]),
];
