import type { Figure, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';

/** Fait cité du programme : question à choix, texte à trous, citation exacte. */
export interface Fait {
  readonly q: string;
  readonly a: string;
  /** Erreurs typiques : les deux premières sont très différentes (niveau 1), toutes servent au niveau 2. */
  readonly wrong: readonly { readonly label: string; readonly why: string }[];
  /** Avant le trou, après le trou, réponses acceptées. */
  readonly gap: readonly [string, string, readonly string[]];
  /** Citation exacte du programme. */
  readonly quote: string;
  readonly explain: string;
}

export interface Libre {
  readonly q: string;
  readonly accepted: readonly string[];
  readonly traps: readonly { readonly text: string; readonly why: string }[];
  readonly quote: string;
  readonly explain: string;
}

export interface DocQuestion {
  readonly q: string;
  readonly a: string;
  readonly wrong: readonly { readonly label: string; readonly why: string }[];
  readonly quote: string;
  readonly explain: string;
}

export interface Notion {
  readonly id: string;
  readonly title: string;
  readonly hint: string;
  readonly memo: readonly string[];
  readonly faits: readonly Fait[];
  readonly paires3: readonly (readonly [string, string])[];
  readonly paires5: readonly (readonly [string, string])[];
  /** Repères dans l'ordre du temps (au moins 4). */
  readonly ordre?: readonly string[];
  readonly libres: readonly Libre[];
  readonly docs: readonly {
    readonly title: string;
    readonly lines: readonly string[];
    readonly qs: readonly DocQuestion[];
  }[];
}

const PROG = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), histoire, classe de CM1';

/** Mélange jusqu'à ce que l'ordre ne soit pas déjà le bon (validate.ts l'exige). */
export function shuffled<T>(rng: Rng, items: readonly T[]): T[] {
  let out = rng.shuffle([...items]);
  for (let i = 0; i < 20 && out.every((x, k) => x === items[k]); i++) out = rng.shuffle([...items]);
  if (out.every((x, k) => x === items[k])) out = [...items.slice(1), items[0] as T];
  return out;
}

const steps = (quote: string, explain: string, answer: string) => [
  `Cherchons ce que dit le programme : « ${quote} ».`,
  explain,
  `La réponse est donc **${answer}**.`,
];

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
    steps: steps(f.quote, f.explain, f.a),
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
    steps: steps(f.quote, f.explain, f.a),
    targetSeconds: 25,
  };
}

function level3(rng: Rng, n: Notion): QuestionDraft {
  if (n.ordre && rng.int(0, 1) === 0) {
    const items = shuffled(rng, n.ordre);
    return {
      prompt: 'Remets ces repères dans l’ordre du temps, du plus ancien au plus récent.',
      answer: { kind: 'order', items, correct: n.ordre.map((o) => items.indexOf(o)) },
      hint: 'Cherche d’abord le repère le plus ancien : regarde les siècles et les années.',
      steps: [
        'On range du plus ancien au plus récent, d’après les siècles et les années.',
        ...n.ordre.map((o, i) => `${i + 1}. ${o}.`),
        `Le premier repère est **${n.ordre[0]}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const f = rng.pick(n.faits);
  const [before, after, accepted] = f.gap;
  return {
    prompt: `Complète la phrase : « ${before}…${after} »`,
    answer: { kind: 'cloze', parts: [before, after], blanks: [{ mode: 'text', accepted }] },
    hint: n.hint,
    steps: steps(f.quote, f.explain, accepted[0] ?? ''),
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
    steps: steps(l.quote, l.explain, l.accepted[0] ?? ''),
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
    credit: 'Texte écrit pour l’exercice, d’après le programme de CM1.',
  };
  return {
    prompt: `Lis le texte, puis réponds. ${dq.q}`,
    figure,
    ...choice(rng, dq.a, dq.wrong),
    hint: 'Relis le texte ligne par ligne : la réponse s’y appuie.',
    steps: steps(dq.quote, dq.explain, dq.a),
    targetSeconds: 60,
  };
}

/** Notion à 5 niveaux (grille de docs/contenus/README.md §1). */
export function notion(n: Notion, source: string): Skill {
  return {
    id: n.id,
    title: n.title,
    levels: 5,
    version: 1,
    lesson: { memo: n.memo, source: PROG, sources: [source] },
    generate: (rng: Rng, level: Level): QuestionDraft => {
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
