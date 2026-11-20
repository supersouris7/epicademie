import type { Chapter, Level, Skill } from '../types.ts';
import { choice } from '../build.ts';
import { CONJUGAISONS, RAE_FETCHED_ON } from './conjugaisons.generated.ts';

/**
 * Espagnol, de la 5e à la 3e (LV2 au cycle 4 ; docs/adr/0024-contenus-hors-maths.md).
 * Règle : sources institutionnelles seulement (21/11/2026).
 * - Toutes les formes conjuguées viennent du Diccionario de la lengua española de la Real
 *   Academia Española (dle.rae.es, tableaux « Indicativo »), récupérées par scripts/rae.ts.
 * - Progression par niveau du CECRL (A1 en 5e, A2 en fin de cycle) : Éduscol, repères annuels
 *   de progression du cycle 4 en langues vivantes.
 */

type Verb = keyof typeof CONJUGAISONS;
type Tense = 'present' | 'passeSimple' | 'futur' | 'passeCompose';
const PERSONS = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'] as const;
type Person = (typeof PERSONS)[number];
const PRONOUN: Record<Person, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él / ella',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ellos / ellas',
};
const TENSE_NAME: Record<Tense, string> = {
  present: 'présent',
  passeSimple: 'passé simple (pretérito indefinido)',
  futur: 'futur',
  passeCompose: 'passé composé (pretérito perfecto compuesto)',
};
const SOURCE = (notion: string) =>
  `Espagnol, cycle 4 : ${notion}. Formes : Real Academia Española, Diccionario de la lengua española (dle.rae.es, relevé du ${RAE_FETCHED_ON}).`;

const REGULAR: readonly Verb[] = [
  'hablar',
  'trabajar',
  'estudiar',
  'cantar',
  'bailar',
  'escuchar',
  'comer',
  'beber',
  'aprender',
  'vivir',
  'escribir',
  'abrir',
];
const IRREGULAR: readonly Verb[] = ['tener', 'ir', 'hacer', 'poder', 'querer', 'decir', 'venir'];

const form = (v: Verb, t: Tense, p: Person): string => CONJUGAISONS[v][t][p];

/** Personnes du niveau : yo, tú, él d'abord, puis toutes. */
const personFor = (rng: { pick<T>(l: readonly T[]): T }, level: Level): Person =>
  rng.pick(level === 1 ? (['yo', 'tu', 'el'] as const) : PERSONS);

/** QCM : la bonne forme parmi celles des autres personnes du même temps (erreur de personne). */
interface ConjugationSpec {
  readonly id: string;
  readonly title: string;
  readonly memo: string[];
  readonly notion: string;
  readonly verbs: readonly Verb[];
  readonly tense: Tense;
}

function conjugation({ id, title, memo, notion, verbs, tense }: ConjugationSpec): Skill {
  return {
    id,
    title,
    lesson: { memo, source: SOURCE(notion) },
    generate: (rng, level) => {
      const v = rng.pick(verbs);
      const p = personFor(rng, level);
      const right = form(v, tense, p);
      const others = PERSONS.filter((q) => q !== p && form(v, tense, q) !== right);
      const picked = rng.shuffle(others).slice(0, 3);
      const { answer, traps } = choice(
        rng,
        right,
        picked.map((q) => ({
          label: form(v, tense, q),
          why: `« ${form(v, tense, q)} » va avec « ${PRONOUN[q]} », pas avec « ${PRONOUN[p]} ».`,
        })),
      );
      return {
        prompt: `Conjugue **${v}** au ${TENSE_NAME[tense]} avec **${PRONOUN[p]}**.`,
        answer,
        traps,
        hint: `Repère la terminaison qui va avec « ${PRONOUN[p]} ».`,
        steps: [
          `${v} au ${TENSE_NAME[tense]} : ${PERSONS.map((q) => `${PRONOUN[q]} ${form(v, tense, q)}`).join(', ')}.`,
          `Avec « ${PRONOUN[p]} » : **${right}**.`,
        ],
      };
    },
  };
}

const presentRegular = conjugation({
  id: 'e5-present-reguliers',
  title: 'Le présent des verbes réguliers',
  memo: [
    'Les verbes en -ar, -er, -ir changent de terminaison selon la personne : hablo, hablas, habla, hablamos, habláis, hablan.',
    'comer : como, comes, come… ; vivir : vivo, vives, vive…',
  ],
  notion: 'présent des verbes réguliers',
  verbs: REGULAR,
  tense: 'present',
});

const serEstar = conjugation({
  id: 'e5-ser-estar',
  title: 'Ser et estar au présent',
  memo: ['ser : soy, eres, es, somos, sois, son.', 'estar : estoy, estás, está, estamos, estáis, están.'],
  notion: 'ser et estar au présent',
  verbs: ['ser', 'estar'],
  tense: 'present',
});

const presentIrregular = conjugation({
  id: 'e4-present-irreguliers',
  title: 'Le présent des verbes irréguliers',
  memo: [
    'Certains verbes très courants sont irréguliers : tener → tengo, tienes… ; ir → voy, vas, va…',
    'Ils s’apprennent par cœur.',
  ],
  notion: 'présent des verbes irréguliers',
  verbs: IRREGULAR,
  tense: 'present',
});

const pastSimple = conjugation({
  id: 'e4-preterito-indefinido',
  title: 'Le passé simple (pretérito indefinido)',
  memo: [
    'Pour une action passée et terminée : hablé, hablaste, habló… ; comí, comiste, comió…',
    'Attention : ser et ir ont les mêmes formes (fui, fuiste, fue…).',
  ],
  notion: 'pretérito indefinido',
  verbs: [...REGULAR, 'ser', 'ir'],
  tense: 'passeSimple',
});

const future = conjugation({
  id: 'e3-futur',
  title: 'Le futur',
  memo: [
    'Futur des verbes réguliers : l’infinitif + é, ás, á, emos, éis, án (hablaré, comerás, vivirá).',
    'Quelques verbes changent de radical : tener → tendré, hacer → haré, decir → diré.',
  ],
  notion: 'futur',
  verbs: [...REGULAR, 'tener', 'hacer', 'decir', 'poder', 'querer', 'venir'],
  tense: 'futur',
});

const pastCompound = conjugation({
  id: 'e3-preterito-perfecto',
  title: 'Le passé composé (pretérito perfecto compuesto)',
  memo: ['haber au présent (he, has, ha, hemos, habéis, han) + participe passé : he hablado, has comido.'],
  notion: 'pretérito perfecto compuesto',
  verbs: [...REGULAR, 'ser', 'estar', 'tener', 'ir', 'poder', 'querer'],
  tense: 'passeCompose',
});

const chapter = (id: string, grade: Chapter['grade'], title: string, skills: readonly Skill[]): Chapter => ({
  id,
  subject: 'espagnol',
  grade,
  domain: 'langue',
  title,
  skills,
});

export const ESPAGNOL_CHAPTERS: readonly Chapter[] = [
  chapter('e5-present', '5e', 'Le présent', [presentRegular, serEstar]),
  chapter('e4-irreguliers', '4e', 'Les verbes irréguliers', [presentIrregular]),
  chapter('e4-passe', '4e', 'Raconter au passé', [pastSimple]),
  chapter('e3-futur', '3e', 'Le futur', [future]),
  chapter('e3-passe-compose', '3e', 'Le passé composé', [pastCompound]),
];
