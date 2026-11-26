import type { ClozeBlank, Figure, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';

/** Source du programme (registre `sources.ts`) : valeur par défaut des faits. */
export const PROGRAMME = 'cycle3-2020';
/** Programme du cycle 4 (registre `sources.ts`) : source par défaut des notions de 5e, 4e et 3e. */
export const PROGRAMME_C4 = 'cycle4-2020';

/** Fait cité : question à choix, texte à trous, citation exacte de la source `src`. */
export interface Fait {
  readonly q: string;
  readonly a: string;
  /** Erreurs typiques : les deux premières sont très différentes (niveau 1), toutes servent au niveau 2. */
  readonly wrong: readonly { readonly label: string; readonly why: string }[];
  /** Avant le trou, après le trou, réponses acceptées. */
  readonly gap: readonly [string, string, readonly string[]];
  /** Trou à liste (quand la saisie libre admettrait des synonymes) : la première réponse acceptée y figure. */
  readonly choix?: readonly string[];
  readonly quote: string;
  readonly explain: string;
  /** Identifiant du registre des sources (le programme si absent). */
  readonly src?: string;
  /** Première bulle rédigée, quand la citation (ligne de fichier officiel) est illisible pour un élève. */
  readonly montre?: string;
}

export interface Libre {
  readonly q: string;
  readonly accepted: readonly string[];
  readonly traps: readonly { readonly text: string; readonly why: string }[];
  readonly quote: string;
  readonly explain: string;
  readonly src?: string;
  readonly montre?: string;
}

export interface DocQuestion {
  readonly q: string;
  readonly a: string;
  readonly wrong: readonly { readonly label: string; readonly why: string }[];
  readonly quote: string;
  readonly explain: string;
  readonly src?: string;
  readonly montre?: string;
}

export interface Notion {
  /** Classe citée dans la source de la leçon et sous les textes à lire (CM1 si absente). */
  readonly classe?: 'CM1' | 'CM2' | '6e' | '5e' | '4e' | '3e';
  readonly id: string;
  readonly title: string;
  readonly hint: string;
  readonly memo: readonly string[];
  readonly faits: readonly Fait[];
  readonly paires3: readonly (readonly [string, string])[];
  readonly paires5: readonly (readonly [string, string])[];
  /** Repères dans l'ordre (au moins 4). */
  readonly ordre?: readonly string[];
  /** Consigne et règle citée d'un ordre autre que « du plus petit au plus grand ». */
  readonly consigne?: {
    readonly prompt: string;
    readonly hint: string;
    readonly why: string;
    readonly fin: string;
    readonly quote: string;
    readonly src: string;
    readonly montre?: string;
  };
  readonly libres: readonly Libre[];
  readonly docs: readonly {
    readonly title: string;
    readonly lines: readonly string[];
    readonly qs: readonly DocQuestion[];
  }[];
  /** Sources citées hors des faits (carte). */
  readonly sources?: readonly string[];
  /** Question de carte facultative (une fois sur deux, quand elle existe pour le niveau). */
  readonly carte?: (rng: Rng, level: Level) => QuestionDraft | undefined;
}

const NOMS: Readonly<Record<string, string>> = {
  '6e': 'sixième',
  '5e': 'cinquième',
  '4e': 'quatrième',
  '3e': 'troisième',
};
const nomClasse = (classe: string) => NOMS[classe] ?? classe;

const cycle4 = (classe: string) => classe === '5e' || classe === '4e' || classe === '3e';

/** Programme de la classe : cycle 4 de la 5e à la 3e, cycle 3 sinon. */
const programmeOf = (classe: string) => (cycle4(classe) ? PROGRAMME_C4 : PROGRAMME);

const prog = (classe: string) =>
  cycle4(classe)
    ? `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020), géographie, classe de ${nomClasse(classe)}`
    : `Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), géographie, classe de ${nomClasse(classe)}`;

/** Mélange jusqu'à ce que l'ordre ne soit pas déjà le bon (validate.ts l'exige). */
function shuffled<T>(rng: Rng, items: readonly T[]): T[] {
  let out = rng.shuffle([...items]);
  for (let i = 0; i < 20 && out.every((x, k) => x === items[k]); i++) out = rng.shuffle([...items]);
  if (out.every((x, k) => x === items[k])) out = [...items.slice(1), items[0] as T];
  return out;
}

/** Première bulle selon l’éditeur de la source (préfixe de son identifiant) ; dictionnaire par défaut. */
const lookup = (src: string): string => {
  if (src === PROGRAMME || src === PROGRAMME_C4) return 'Cherchons ce que dit le programme';
  if (src.startsWith('eduscol-')) return 'Cherchons ce que dit la ressource Éduscol';
  if (src.startsWith('ghsl-')) return 'Cherchons ce que dit l’atlas de la Commission européenne (en anglais)';
  if (src.startsWith('insee-')) return 'Cherchons ce que dit l’INSEE';
  if (src.startsWith('geoconfluences-')) return 'Cherchons ce que dit le site de géographie Géoconfluences';
  if (src.startsWith('ademe-')) return 'Cherchons ce que dit l’ADEME';
  if (src.startsWith('ue-')) return 'Cherchons ce que dit l’Union européenne';
  if (src.startsWith('bnf-')) return 'Cherchons dans la notice de la Bibliothèque nationale de France';
  if (src.startsWith('viepublique-')) return 'Cherchons ce que dit le site public vie-publique.fr';
  if (src === 'ecologie-lgv') return 'Cherchons ce que dit le ministère chargé des transports';
  if (src.startsWith('ecologie-')) return 'Cherchons ce que dit le ministère de la Transition écologique';
  return 'Cherchons dans le dictionnaire';
};

const firstStep = (f: { readonly quote: string; readonly src?: string; readonly montre?: string }) =>
  f.montre ?? `${lookup(f.src ?? PROGRAMME)} : « ${f.quote} ».`;

const steps = (
  f: { readonly quote: string; readonly explain: string; readonly src?: string; readonly montre?: string },
  answer: string,
) => [firstStep(f), f.explain, `La réponse est donc **${answer}**.`];

function match(rng: Rng, prompt: string, pairs: readonly (readonly [string, string])[], hint: string): QuestionDraft {
  const left = pairs.map((p) => p[0]);
  const right = shuffled(
    rng,
    pairs.map((p) => p[1]),
  );
  return {
    prompt,
    answer: { kind: 'match', left, right, pairs: pairs.map((p) => right.indexOf(p[1])) },
    hint,
    steps: [
      'Regarde chaque mot, puis cherche ce qui lui correspond.',
      ...pairs.map((p) => `**${p[0]}** : ${p[1]}.`),
      'Vérifie que chaque définition n’est utilisée qu’une fois.',
    ],
    targetSeconds: 40,
  };
}

function level1(rng: Rng, n: Notion): QuestionDraft {
  const f = rng.pick(n.faits);
  return {
    prompt: f.q,
    ...choice(rng, f.a, f.wrong.slice(0, 2)),
    hint: n.hint,
    steps: steps(f, f.a),
    targetSeconds: 20,
  };
}

function level2(rng: Rng, n: Notion): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    return match(rng, 'Associe chaque mot à ce qui lui correspond.', n.paires3, n.hint);
  }
  const f = rng.pick(n.faits);
  return {
    prompt: `Attention aux pièges ! ${f.q}`,
    ...choice(rng, f.a, f.wrong),
    hint: n.hint,
    steps: steps(f, f.a),
    targetSeconds: 25,
  };
}

function blank(rng: Rng, accepted: readonly string[], choix?: readonly string[]): ClozeBlank {
  if (!choix) return { mode: 'text', accepted };
  const options = rng.shuffle([...choix]);
  return { mode: 'list', options, correct: options.indexOf(accepted[0] ?? '') };
}

function level3(rng: Rng, n: Notion): QuestionDraft {
  if (n.ordre && rng.int(0, 1) === 0) {
    const items = shuffled(rng, n.ordre);
    const c = n.consigne;
    return {
      prompt: c?.prompt ?? 'Remets ces repères dans l’ordre, du plus petit au plus grand.',
      answer: { kind: 'order', items, correct: n.ordre.map((o) => items.indexOf(o)) },
      hint: c?.hint ?? 'Commence par le lieu où tu habites : il est le plus petit.',
      steps: [
        ...(c ? [firstStep(c)] : []),
        c?.why ?? 'On range du plus petit au plus grand territoire, comme dans le programme.',
        ...n.ordre.map((o, i) => `${i + 1}. ${o}.`),
        `${c?.fin ?? 'Le plus petit est'} **${n.ordre[0]}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const f = rng.pick(n.faits);
  const [before, after, accepted] = f.gap;
  return {
    prompt: `Complète la phrase : « ${before}…${after} »`,
    answer: { kind: 'cloze', parts: [before, after], blanks: [blank(rng, accepted, f.choix)] },
    hint: n.hint,
    steps: steps(f, accepted[0] ?? ''),
    targetSeconds: 30,
  };
}

function level4(rng: Rng, n: Notion): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    return match(
      rng,
      'Sans aide : associe chaque mot à ce qui lui correspond.',
      n.paires5,
      'Commence par les associations dont tu es sûr.',
    );
  }
  const l = rng.pick(n.libres);
  const traps: Trap[] = l.traps.map((t) => ({ text: t.text, why: t.why }));
  return {
    prompt: `Sans proposition : ${l.q}`,
    answer: { kind: 'text', accepted: l.accepted },
    traps,
    hint: n.hint,
    steps: steps(l, l.accepted[0] ?? ''),
    targetSeconds: 30,
  };
}

function level5(rng: Rng, n: Notion): QuestionDraft {
  const d = rng.pick(n.docs);
  const dq = rng.pick(d.qs);
  const figure: Figure = {
    kind: 'document',
    title: d.title,
    lines: d.lines,
    credit: `Texte écrit pour l’exercice, d’après le programme de ${nomClasse(n.classe ?? 'CM1')}.`,
  };
  return {
    prompt: `Lis le texte, puis réponds. ${dq.q}`,
    figure,
    ...choice(rng, dq.a, dq.wrong),
    hint: 'Relis le texte ligne par ligne : la réponse s’y appuie.',
    steps: steps(dq, dq.a),
    targetSeconds: 60,
  };
}

/** Sources du registre citées par une notion (le programme de sa classe, plus celles de ses faits). */
export function sourcesOf(n: Notion): string[] {
  const programme = programmeOf(n.classe ?? 'CM1');
  const all = [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)].map((f) => f.src ?? programme);
  if (n.consigne) all.push(n.consigne.src);
  return [...new Set([programme, ...all, ...(n.sources ?? [])])];
}

/** Notion à 5 niveaux (grille de docs/contenus/README.md §1). */
export function notion(n: Notion): Skill {
  return {
    id: n.id,
    title: n.title,
    levels: 5,
    version: 1,
    lesson: { memo: n.memo, source: prog(n.classe ?? 'CM1'), sources: sourcesOf(n) },
    generate: (rng: Rng, level: Level): QuestionDraft => {
      const carte = n.carte && rng.int(0, 1) === 0 ? n.carte(rng, level) : undefined;
      if (carte) return carte;
      switch (level) {
        case 1:
          return level1(rng, n);
        case 2:
          return level2(rng, n);
        case 3:
          return level3(rng, n);
        case 4:
          return level4(rng, n);
        default:
          return level5(rng, n);
      }
    },
  };
}
