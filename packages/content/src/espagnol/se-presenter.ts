import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { CONJUGAISONS } from './conjugaisons.generated.ts';
import {
  FORMULAS,
  GENDER,
  LETTERS,
  LLAMAR,
  NAMES,
  NO_ACCENT,
  PERSONS,
  PRONOUN,
  REFLEXIVE,
  WRITTEN_ACCENT,
  numberWord,
  type Formula,
  type Name,
  type Person,
  type Word,
} from './se-presenter-faits.ts';

/**
 * Espagnol 5e — « Se présenter » (lot es-5e-01, docs/adr/0034). Programme : annexe 9 de l'arrêté du 5 mai 2025
 * (saluer, se présenter en indiquant son nom et son âge, accent tonique). Formes et règles : Real Academia Española
 * (voir se-presenter-faits.ts : chaque fait y porte sa source et sa citation).
 */

const PROGRAMME = 'Programme d’espagnol du collège (arrêté du 5 mai 2025, annexe 9), classe de 5e';
const lesson = (memo: readonly string[], detail: string, sources: readonly string[]) => ({
  memo,
  source: `${PROGRAMME} — ${detail}`,
  sources: ['espagnol-college-2025', 'lv-college-2025', ...sources],
});

/** Élément d'une liste à un indice valide (erreur de programmation sinon). */
const at = <T>(list: readonly T[], i: number): T => {
  const x = list[i];
  if (x === undefined) throw new Error(`indice ${i} hors liste`);
  return x;
};

/** Mélange une liste jusqu'à ce qu'elle ne soit plus dans l'ordre de départ. */
function shuffledOther<T>(rng: Rng, list: readonly T[]): T[] {
  let out = rng.shuffle(list);
  while (out.every((x, i) => x === list[i])) out = rng.shuffle(list);
  return out;
}

/** « de » suivi d’un prénom, élidé devant une voyelle. */
const de = (name: string) => (/^[AEIOU]/.test(name) ? `d’${name}` : `de ${name}`);

const options = (rng: Rng, right: string, wrong: readonly (readonly [string, string])[]) =>
  choice(
    rng,
    right,
    wrong.map(([label, why]) => ({ label, why })),
  );

/** Retire les accents écrits (le ñ est gardé : c'est une autre lettre). */
const noAccent = (s: string) => s.normalize('NFD').replace(/́/g, '').normalize('NFC');

/**
 * Écritures acceptées quand la notion ne porte pas sur les accents ni la ponctuation : avec ou sans accent
 * écrit, avec ou sans la ponctuation (« ¿? » pour une question, « ¡! » ou le point sinon) et sans la virgule.
 */
function lenient(...forms: readonly string[]): string[] {
  const out = forms.flatMap((f) => {
    const bare = f.replace(/[¿?¡!.]/g, '');
    const spelt = [bare, noAccent(bare)].flatMap((b) => [b, b.replaceAll(',', '')]);
    return spelt.flatMap((b) => (f.includes('?') ? [b, `${b}?`, `¿${b}?`] : [b, `${b}.`, `${b}!`, `¡${b}!`]));
  });
  return [...new Set(out)];
}

/** Association : trois paires ou plus, colonne de droite mélangée. */
function matching(rng: Rng, pairs: readonly (readonly [string, string])[]) {
  const left = pairs.map(([l]) => l);
  const values = pairs.map(([, r]) => r);
  const right = shuffledOther(rng, values);
  return { kind: 'match' as const, left, right, pairs: values.map((v) => right.indexOf(v)) };
}

// ——— 1. Saluer ———

const formulaOf = (es: string): Formula =>
  at(
    FORMULAS,
    FORMULAS.findIndex((f) => f.es === es),
  );
const meaning = (f: Formula) => `« ${f.es} » veut dire « ${f.fr} »`;
const capital = (s: string) => s.replace(/\p{L}/u, (c) => c.toUpperCase());

/** Même formule, ou l'une contient l'autre (« gracias » et « bien, gracias »). */
const overlap = (a: Formula, b: Formula) => a.es.includes(b.es) || b.es.includes(a.es);

/** Consigne de la saisie (niveau 4) quand le sens du tableau admettrait plusieurs formules. */
const ASKED: Readonly<Record<string, string>> = {
  'buenos días': 'bonjour (la formule réservée au matin)',
  'buenas tardes': 'bonjour (la formule de l’après-midi)',
  'buenas noches': 'bonne nuit (la formule de la nuit)',
  '¿qué tal?': 'comment ça va ? (en tutoyant)',
};
/** Autres formules du programme ou du dictionnaire également justes pour la même consigne. */
const ALSO_RIGHT: Readonly<Record<string, readonly string[]>> = {
  adiós: ['hasta luego'],
  // « perdona » et « perdone » : impératif régulier de « perdonar » (tú, usted).
  perdón: ['lo siento', 'disculpa', 'disculpe', 'perdona', 'perdone'],
  '¿qué tal?': ['¿cómo estás?'],
};

/**
 * Distracteurs d'une situation. Pour une salutation, ni départ, ni demande de nouvelles, ni « hola » (qui convient à
 * toute heure) : ces formules peuvent aussi saluer. Contre « hola », aucune autre salutation.
 */
function compatible(target: Formula, other: Formula): boolean {
  if (overlap(target, other)) return false;
  // « au revoir » se dit aussi bien avec une autre formule de départ : on n'en propose aucune contre « adiós ».
  if (target.es === 'adiós') return other.family !== 'conge';
  if (target.family !== 'salut') return true;
  if (other.es === 'hola' || other.family === 'conge' || other.family === 'nouvelles') return false;
  return target.es !== 'hola' || other.family !== 'salut';
}

interface Dialogue {
  readonly title: string;
  readonly lines: readonly string[];
  /** Répliques à retrouver : numéro de ligne, formule juste, distracteurs et situation. */
  readonly slots: readonly {
    readonly line: number;
    readonly right: string;
    readonly wrong: readonly string[];
    readonly desc: string;
  }[];
}

const DIALOGUES: readonly Dialogue[] = [
  {
    title: 'Le matin, devant le collège',
    lines: [
      'Clara : ¡Buenos días, Javier!',
      'Javier : ¡Hola, Clara! ¿Qué tal?',
      'Clara : Bien, gracias.',
      'Javier : Hasta luego.',
    ],
    slots: [
      {
        line: 1,
        right: 'buenos días',
        wrong: ['buenas noches', 'de nada', 'hasta luego'],
        desc: 'Clara salue Javier le matin.',
      },
      {
        line: 3,
        right: 'bien, gracias',
        wrong: ['buenas noches', 'perdón', 'de nada'],
        desc: 'Clara répond à la question sur ses nouvelles.',
      },
      {
        line: 4,
        right: 'hasta luego',
        wrong: ['buenas noches', 'perdón', '¿qué tal?'],
        desc: 'Javier s’en va et dit « à plus tard ».',
      },
    ],
  },
  {
    title: 'En classe',
    lines: [
      'Inés : ¡Perdón! Un lápiz, por favor.',
      'Antonio : Toma.',
      'Inés : Gracias.',
      'Antonio : De nada.',
      'Inés : Hasta mañana.',
    ],
    slots: [
      { line: 3, right: 'gracias', wrong: ['de nada', 'buenas noches', '¿qué tal?'], desc: 'Inés remercie Antonio.' },
      { line: 4, right: 'de nada', wrong: ['gracias', 'hola', '¿qué tal?'], desc: 'Antonio répond « de rien ».' },
      {
        line: 5,
        right: 'hasta mañana',
        wrong: ['buenos días', 'de nada', '¿qué tal?'],
        desc: 'Inés s’en va et dit « à demain ».',
      },
    ],
  },
  {
    title: 'L’après-midi, dans la rue',
    lines: [
      'Alicia : ¡Buenas tardes, Gonzalo!',
      'Gonzalo : ¡Hola, Alicia! ¿Qué tal?',
      'Alicia : Bien, gracias.',
      'Gonzalo : Hasta pronto.',
    ],
    slots: [
      {
        line: 1,
        right: 'buenas tardes',
        wrong: ['buenos días', 'de nada', 'perdón'],
        desc: 'Alicia salue Gonzalo l’après-midi.',
      },
      {
        line: 2,
        right: '¿qué tal?',
        wrong: ['de nada', 'hasta mañana', 'perdón'],
        desc: 'Gonzalo demande des nouvelles à Alicia.',
      },
      {
        line: 3,
        right: 'bien, gracias',
        wrong: ['de nada', 'perdón', 'buenas noches'],
        desc: 'Alicia répond à la question sur ses nouvelles.',
      },
    ],
  },
];

/** Réplique écrite dans le dialogue à partir de la formule (majuscule, ponctuation de la ligne gardée). */
const blank = (line: string, es: string): string => {
  const shown = line.toLowerCase();
  const bare = es.replace(/[¿?]/g, '');
  const i = shown.indexOf(bare);
  if (i < 0) throw new Error(`formule « ${es} » absente de « ${line} »`);
  return `${line.slice(0, i)}……${line.slice(i + bare.length)}`;
};

const saluer: Skill = {
  id: 'e5-saluer',
  title: 'Saluer et prendre congé',
  levels: 5,
  version: 1,
  lesson: lesson(
    [
      'Les **formules de politesse** changent avec le moment : buenos días (le matin), buenas tardes (l’après-midi), buenas noches (la nuit) ; hola convient à toute heure entre proches.',
      'Pour **prendre congé** : adiós, hasta luego, hasta mañana, hasta pronto. À « ¿Qué tal? », tu peux répondre « Bien, gracias. ».',
      'Pour remercier : gracias (on répond « de nada ») ; pour demander pardon : perdón.',
    ],
    'Utiliser des formules de politesse élémentaires pour saluer, prendre congé, remercier, s’excuser.',
    [
      'rae-dle-hola',
      'rae-dle-adios',
      'rae-dle-dia',
      'rae-dle-tarde',
      'rae-dle-noche',
      'rae-dle-luego',
      'rae-dle-gracia',
      'rae-dle-perdon',
    ],
  ),
  generate: (rng, level): QuestionDraft => {
    const f = rng.pick(FORMULAS);
    if (level === 1) {
      const others = rng.shuffle(FORMULAS.filter((o) => o.family !== f.family && !overlap(f, o))).slice(0, 2);
      const { answer, traps } = options(
        rng,
        f.fr,
        others.map((o) => [o.fr, `« ${o.fr} » se dit « ${o.es} ». ${capital(meaning(f))}.`]),
      );
      return {
        prompt: `Que veut dire « ${f.es} » ?`,
        answer,
        traps,
        hint: 'Demande-toi à quel moment d’une rencontre on prononce ces mots : arrivée, départ ou politesse ?',
        steps: [`On cherche le sens de « ${f.es} ».`, `${capital(meaning(f))} : réponse **${f.fr}**.`],
      };
    }
    if (level === 2) {
      const others = rng.shuffle(FORMULAS.filter((o) => compatible(f, o))).slice(0, 3);
      const { answer, traps } = options(
        rng,
        f.es,
        others.map((o) => [o.es, `${capital(meaning(o))} : cela ne convient pas à cette situation.`]),
      );
      return {
        prompt: `${f.situation} Que dis-tu en espagnol ?`,
        answer,
        traps,
        hint: 'Repère le moment (arrivée, départ, remerciement, excuse) avant de choisir.',
        steps: [`Situation : ${f.situation}`, `${capital(meaning(f))}.`, `Réponse : **${f.es}**`],
      };
    }
    if (level === 3) {
      if (rng.int(0, 1) === 0) {
        const farewell = rng.pick(['Adiós.', 'Hasta luego.', 'Hasta mañana.', 'Hasta pronto.']);
        const name = rng.pick(NAMES);
        const base = [`¡Hola, ${name}! ¿Qué tal?`, 'Bien, gracias. ¿Y tú?', 'Muy bien, gracias.', farewell];
        const items = shuffledOther(rng, base);
        return {
          prompt: `${name} arrive : c’est toi qui salues en premier, en disant son prénom. Remets la conversation dans l’ordre : chaque question reçoit sa réponse avant le départ (« ${farewell} »).`,
          answer: { kind: 'order', items, correct: base.map((b) => items.indexOf(b)) },
          hint: 'Repère la réplique qui contient le prénom, puis celle qui renvoie la question (« ¿Y tú? » : et toi ?).',
          steps: [
            'Le salut avec le prénom ouvre la conversation et demande des nouvelles ; la réponse renvoie la question (« ¿Y tú? ») ; on y répond, puis on prend congé.',
            `Réponse : **${base.join(' → ')}**`,
          ],
        };
      }
      const gap = rng.pick([
        { es: 'buenos días', asked: 'tu salues ton professeur le matin', start: 'Buenos', word: 'días' },
        { es: 'buenas tardes', asked: 'tu salues une voisine l’après-midi', start: 'Buenas', word: 'tardes' },
        { es: 'buenas noches', asked: 'tu salues ta famille avant de dormir', start: 'Buenas', word: 'noches' },
        { es: 'hasta mañana', asked: 'tu veux dire « à demain »', start: 'Hasta', word: 'mañana' },
        { es: 'hasta luego', asked: 'tu veux dire « à plus tard »', start: 'Hasta', word: 'luego' },
      ]);
      return {
        prompt: `Complète la formule : ${gap.asked}.`,
        answer: {
          kind: 'cloze',
          parts: [`${gap.start} `, '.'],
          blanks: [{ mode: 'text', accepted: lenient(gap.word) }],
        },
        hint: `La formule commence par « ${gap.start} » : le mot qui suit précise le moment.`,
        steps: [`La formule est « ${gap.es} » (${formulaOf(gap.es).fr}).`, `Le mot qui manque est **${gap.word}**.`],
      };
    }
    if (level === 4) {
      const french = ASKED[f.es] ?? f.fr;
      const right = [f.es, ...(ALSO_RIGHT[f.es] ?? [])];
      const near = FORMULAS.filter((o) => o.family === f.family && compatible(f, o)).slice(0, 3);
      const agreement: Readonly<Record<string, string>> = {
        'buenos días': 'buenas días',
        'buenas tardes': 'buenos tardes',
        'buenas noches': 'buenos noches',
      };
      const wrongAgreement = agreement[f.es];
      return {
        prompt: `Écris en espagnol : « ${french} ».`,
        answer: { kind: 'text', accepted: lenient(...right) },
        traps: [
          ...(wrongAgreement
            ? [
                {
                  text: wrongAgreement,
                  why: `Accorde avec le nom : on écrit « ${f.es} » (día est masculin ; tarde et noche sont féminins).`,
                },
              ]
            : []),
          ...near.map((o) => ({ text: o.es, why: `${capital(meaning(o))}, pas « ${french} ».` })),
          { text: french, why: 'Il faut écrire la formule en espagnol, pas en français.' },
        ],
        hint: `La formule commence par la lettre « ${f.es.replace(/[¿¡]/g, '').slice(0, 1)} ».`,
        steps: [`On cherche la formule espagnole pour « ${french} ».`, `Réponse : **${f.es}**`],
      };
    }
    const dialogue = rng.pick(DIALOGUES);
    const slot = rng.pick(dialogue.slots);
    const lines = dialogue.lines.map((l, i) => (i === slot.line - 1 ? blank(l, slot.right) : l));
    const { answer, traps } = options(
      rng,
      slot.right,
      slot.wrong.map((es) => [es, `${capital(meaning(formulaOf(es)))} : relis la ligne ${slot.line}.`]),
    );
    return {
      prompt: `Lis le dialogue. Quelle formule manque à la ligne ${slot.line} ?`,
      figure: { kind: 'document', title: dialogue.title, lines, credit: 'Dialogue écrit pour l’exercice.' },
      answer,
      traps,
      hint: 'Lis la réplique d’avant et celle d’après : que fait le personnage à ce moment ?',
      steps: [
        `Ligne ${slot.line} : ${slot.desc}`,
        `${capital(meaning(formulaOf(slot.right)))}.`,
        `Réponse : **${slot.right}**`,
      ],
    };
  },
};

// ——— 2. Se présenter : llamarse, tener… años ———

const reflexive = (p: Person) => `${REFLEXIVE[p]} ${LLAMAR[p]}`;
const have = (p: Person): string => CONJUGAISONS.tener.present[p];
/** Nombre placé devant un nom masculin : « uno » est raccourci en « un » (« veintiún »). */
const beforeNoun = (n: number) =>
  numberWord(n)
    .replace(/veintiuno$/, 'veintiún')
    .replace(/uno$/, 'un');
const ageWords = (n: number) => `${beforeNoun(n)} años`;
const ageAccepted = (core: string, n: number) => lenient(`${core} ${ageWords(n)}`, `${core} ${n} años`);

const allForms = (verb: 'llamarse' | 'tener') =>
  PERSONS.map((p) => `${PRONOUN[p]} ${verb === 'tener' ? have(p) : reflexive(p)}`).join(', ');

/** Tirage commun aux niveaux de « Se présenter » : un prénom et un âge d'élève. */
interface Draw {
  readonly rng: Rng;
  readonly name: Name;
  readonly age: number;
}

function recognisePresentation({ rng, name, age }: Draw): QuestionDraft {
  const isName = rng.int(0, 1) === 0;
  const right = isName ? `Me llamo ${name}.` : `Tengo ${ageWords(age)}.`;
  const { answer, traps } = options(
    rng,
    right,
    isName
      ? [
          [`Te llamas ${name}.`, '« Te llamas » veut dire « tu t’appelles ».'],
          [`Se llama ${name}.`, '« Se llama » veut dire « il ou elle s’appelle ».'],
        ]
      : [
          [`Tienes ${ageWords(age)}.`, '« Tienes » veut dire « tu as ».'],
          [`Tiene ${ageWords(age)}.`, '« Tiene » veut dire « il ou elle a ».'],
        ],
  );
  return {
    prompt: isName
      ? `Tu veux dire « Je m’appelle ${name}. » Quelle phrase choisis-tu ?`
      : `Tu veux dire « J’ai ${age} ans. » Quelle phrase choisis-tu ?`,
    answer,
    traps,
    hint: 'Cherche la forme qui correspond à « je ».',
    steps: ['La phrase parle de toi : il faut la 1re personne.', `Réponse : **${right}**`],
  };
}

function choosePresentation({ rng, name, age }: Draw): QuestionDraft {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    const right = `Tengo ${ageWords(age)}.`;
    const { answer, traps } = options(rng, right, [
      [`Soy ${ageWords(age)}.`, 'En espagnol, l’âge se dit avec « tener » (avoir), pas avec « ser » (être).'],
      [`Tengo ${numberWord(age)} anos.`, '« años » s’écrit avec un ñ : « ano » est un autre mot.'],
      [`Tiene ${ageWords(age)}.`, '« Tiene » veut dire « il ou elle a ».'],
    ]);
    return {
      prompt: `Quelle phrase est correcte pour dire que tu as ${age} ans ?`,
      answer,
      traps,
      hint: 'Quel verbe l’espagnol emploie-t-il pour l’âge ? Et quelle personne parle ?',
      steps: ['L’âge se dit avec « tener » à la 1re personne : tengo.', `Réponse : **${right}**`],
    };
  }
  if (kind === 1) {
    const right = `Me llamo ${name}.`;
    const { answer, traps } = options(rng, right, [
      [`Llamo ${name}.`, `Sans pronom, « Llamo ${name} » ne veut pas dire « je m’appelle ».`],
      [`Se llamo ${name}.`, '« se » va avec la 3e personne ; avec « llamo », il faut « me ».'],
      [`Me llama ${name}.`, '« llama » n’est pas la forme de « yo » : on écrit « me llamo ».'],
    ]);
    return {
      prompt: `Quelle phrase est correcte pour dire que tu t’appelles ${name} ?`,
      answer,
      traps,
      hint: 'Il faut à la fois le bon pronom et la bonne terminaison.',
      steps: ['Verbe pronominal : pronom « me » puis « llamo ».', `Réponse : **${right}**`],
    };
  }
  const askName = rng.int(0, 1) === 0;
  const right = askName ? '¿Cómo te llamas?' : '¿Cuántos años tienes?';
  const { answer, traps } = options(rng, right, [
    [
      askName ? '¿Cuántos años tienes?' : '¿Cómo te llamas?',
      askName ? 'Cette question demande l’âge.' : 'Cette question demande le nom.',
    ],
    ['¿Cómo se llama?', 'Cette question porte sur une 3e personne ou sur quelqu’un qu’on vouvoie.'],
    ['¿Qué tal?', '« ¿Qué tal? » demande des nouvelles.'],
  ]);
  return {
    prompt: `Tu veux demander à un nouveau camarade, en le tutoyant, ${askName ? 'comment il s’appelle' : 'quel âge il a'}. Quelle question poses-tu ?`,
    answer,
    traps,
    hint: 'La question doit être à la 2e personne et porter sur la bonne information.',
    steps: ['On tutoie : le verbe est à la forme « tú ».', `Réponse : **${right}**`],
  };
}

function completePresentation({ rng, name, age }: Draw): QuestionDraft {
  const p = rng.pick(['yo', 'tu', 'el'] as const);
  if (rng.int(0, 1) === 0) {
    const subject = { yo: 'Yo', tu: 'Tú', el: GENDER[name] === 'f' ? 'Ella' : 'Él' }[p];
    return {
      prompt: `Complète avec le pronom et le verbe « llamarse » (sujet : ${subject}).`,
      answer: {
        kind: 'cloze',
        parts: [`${subject} `, ' ', ` ${name}.`],
        blanks: [
          { mode: 'list', options: ['me', 'te', 'se'], correct: ['me', 'te', 'se'].indexOf(REFLEXIVE[p]) },
          { mode: 'text', accepted: lenient(LLAMAR[p]) },
        ],
      },
      hint: `Le pronom et la terminaison vont tous les deux avec « ${subject.toLowerCase()} ».`,
      steps: [
        `Avec « ${PRONOUN[p]} » : pronom « ${REFLEXIVE[p]} », verbe « ${LLAMAR[p]} ».`,
        `Réponse : **${subject} ${reflexive(p)}**`,
      ],
    };
  }
  const subject = { yo: 'Yo', tu: 'Tú', el: name }[p];
  return {
    prompt: `Complète avec le verbe « tener » au présent (sujet : ${subject}, ${age} ans).`,
    answer: {
      kind: 'cloze',
      parts: [`${subject} `, ` ${ageWords(age)}.`],
      blanks: [{ mode: 'text', accepted: lenient(have(p)) }],
    },
    hint: 'Quel est le présent de « tener » pour ce sujet ?',
    steps: [`tener au présent : ${allForms('tener')}.`, `Réponse : **${have(p)}**`],
  };
}

function conjugatePresentation({ rng, age }: Draw): QuestionDraft {
  const p = rng.pick(['nosotros', 'vosotros', 'ellos', 'tu', 'el'] as const);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Écris la forme de « llamarse » au présent avec « ${PRONOUN[p]} » (pronom réfléchi compris).`,
      answer: { kind: 'text', accepted: lenient(reflexive(p)) },
      traps: [
        { text: LLAMAR[p], why: `Il manque le pronom réfléchi « ${REFLEXIVE[p]} ».` },
        {
          text: `${p === 'el' || p === 'ellos' ? 'le' : 'se'} ${LLAMAR[p]}`,
          why: `Avec « ${PRONOUN[p]} », le pronom réfléchi est « ${REFLEXIVE[p]} ».`,
        },
      ],
      hint: 'Deux mots : le pronom de cette personne, puis le verbe « llamar » conjugué.',
      steps: [`llamarse : ${allForms('llamarse')}.`, `Réponse : **${reflexive(p)}**`],
    };
  }
  const plural = rng.pick(['nosotros', 'vosotros', 'ellos'] as const);
  const subject = { nosotros: 'nous avons', vosotros: 'vous (vosotros) avez', ellos: 'ils ont' }[plural];
  return {
    prompt: `Écris en espagnol, sans pronom sujet : « ${subject} ${age} ans » (nombre en lettres ou en chiffres).`,
    answer: { kind: 'text', accepted: ageAccepted(have(plural), age) },
    traps: [
      {
        text: `${CONJUGAISONS.ser.present[plural]} ${ageWords(age)}`,
        why: 'L’âge se dit avec « tener », pas avec « ser ».',
      },
      {
        text: `${have('yo')} ${ageWords(age)}`,
        why: '« tengo » veut dire « j’ai » : la personne n’est pas la bonne.',
      },
    ],
    hint: 'Conjugue « tener » à la bonne personne, puis ajoute le nombre et « años ».',
    steps: [`tener au présent : ${allForms('tener')}.`, `Réponse : **${have(plural)} ${ageWords(age)}**`],
  };
}

function readPresentation({ rng, name, age }: Draw): QuestionDraft {
  const other = rng.pick(NAMES.filter((n) => n !== name));
  const otherAge = rng.pick([7, 8, 9, 16, 17, 18]);
  const askOther = rng.int(0, 1) === 0;
  const who = askOther ? other : name;
  const years = askOther ? otherAge : age;
  return {
    prompt: `Lis le message. En espagnol, réponds par une phrase commençant par « Tiene » : quel âge a ${who} ?`,
    figure: {
      kind: 'document',
      title: 'Un message de présentation',
      lines: [
        `¡Hola! Me llamo ${name}.`,
        `Tengo ${ageWords(age)}.`,
        `${GENDER[other] === 'f' ? 'Mi amiga' : 'Mi amigo'} se llama ${other}. Dice: «Tengo ${ageWords(otherAge)}».`,
        '¡Hasta pronto!',
      ],
      credit: '« dice » : il ou elle dit. Message écrit pour l’exercice.',
    },
    answer: { kind: 'text', accepted: ageAccepted('Tiene', years) },
    traps: [
      {
        text: `Tiene ${ageWords(askOther ? age : otherAge)}`,
        why: `C’est l’âge ${de(askOther ? name : other)}, pas celui ${de(who)}.`,
      },
      { text: `Tengo ${ageWords(years)}`, why: `« Tengo » veut dire « j’ai » ; tu parles ${de(who)}.` },
    ],
    hint: 'Trouve la ligne qui parle de cette personne, puis le nombre placé avant « años ».',
    steps: [
      `On cherche l’âge ${de(who)} dans le message (${askOther ? 'ligne 3' : 'ligne 2'}).`,
      'La réponse est à la 3e personne : « Tiene … años ».',
      `Réponse : **Tiene ${ageWords(years)}.**`,
    ],
  };
}

const PRESENTATION_LEVELS = {
  1: recognisePresentation,
  2: choosePresentation,
  3: completePresentation,
  4: conjugatePresentation,
  5: readPresentation,
} as const;

const presenter: Skill = {
  id: 'e5-se-presenter',
  title: 'Se présenter : le nom et l’âge',
  levels: 5,
  version: 1,
  lesson: lesson(
    [
      'Pour dire ton nom : « Me llamo Clara. » ; llamarse est un **verbe pronominal** : le **pronom réfléchi** (me, te, se, nos, os, se) change avec la personne.',
      'Pour dire ton âge, l’espagnol utilise tener comme le français : « Tengo doce años. » ; on demande « ¿Cuántos años tienes? ».',
    ],
    '(Se) présenter de manière simple en indiquant son nom et son âge.',
    ['rae-dle-llamar', 'rae-dle-tener', 'rae-dpd-pronombres-atonos', 'rae-dpd-cardinales'],
  ),
  generate: (rng, level) => PRESENTATION_LEVELS[level]({ rng, name: rng.pick(NAMES), age: rng.int(11, 15) }),
};

// ——— 3. Les nombres ———

/** Écritures d'un nombre : avec ou sans accent ; au-delà de 30, la grafía simple (treintaicinco) est aussi admise. */
function spellings(n: number): string[] {
  const words = numberWord(n);
  const joined = words.includes(' y ') ? [words.replace(' y ', 'i')] : [];
  return lenient(
    words,
    ...joined,
    ...joined.map((j) => j.replace(/dos$/, 'dós').replace(/tres$/, 'trés').replace(/seis$/, 'séis')),
  );
}

const NEIGHBOURS = [
  [2, 12, 20],
  [3, 13, 30],
  [4, 14, 40],
  [5, 15, 50],
  [6, 16, 60],
  [7, 17, 70],
  [8, 18, 80],
  [9, 19, 90],
] as const;

/** Écritures de la forme raccourcie devant un nom masculin (« veintiún », « treinta y un », « treintaiún »). */
function apocopeSpellings(n: number): string[] {
  const short = beforeNoun(n);
  return lenient(short, short.replace(' y un', 'iún'));
}

/** Erreurs typiques d'écriture d'un nombre. */
function numberTraps(n: number) {
  const out: { text: string; why: string }[] = [];
  const unit = n % 10;
  const ten = n - unit;
  if (n > 15 && n < 30 && unit !== 0) {
    const prefix = n < 20 ? 'diez' : 'veinte';
    out.push({
      text: `${prefix} y ${numberWord(unit)}`,
      why: `De 16 à 29, le nombre s’écrit en un seul mot : « ${numberWord(n)} ».`,
    });
  }
  if (n >= 16 && n <= 19)
    out.push({
      text: `dici${numberWord(unit)}`,
      why: `Il faut garder les deux voyelles « ie » : « ${numberWord(n)} ».`,
    });
  if (n > 30 && unit !== 0)
    out.push({
      text: `${numberWord(ten)} ${numberWord(unit)}`,
      why: `Il manque « y » entre la dizaine et l’unité : « ${numberWord(n)} ».`,
    });
  const swapped = unit === 0 ? n / 10 : unit * 10 + Math.floor(n / 10);
  if (swapped !== n && swapped >= 0 && swapped < 100)
    out.push({ text: numberWord(swapped), why: `« ${numberWord(swapped)} » vaut ${swapped}, pas ${n}.` });
  const near = n === 99 ? 98 : n + 1;
  out.push({ text: numberWord(near), why: `« ${numberWord(near)} » vaut ${near}, pas ${n}.` });
  return out;
}

const nombres: Skill = {
  id: 'e5-nombres',
  title: 'Les nombres de 0 à 100',
  levels: 5,
  version: 1,
  lesson: lesson(
    [
      'De 0 à 15, pour les dizaines et pour 100 (cien), chaque nombre a son mot : doce, quince, veinte, treinta. De 16 à 29, un seul mot : dieciséis, veintidós.',
      'À partir de 31, on relie dizaine et unité avec « y » : treinta y uno. Devant un nom masculin, uno subit une **apocope** : veintiún años.',
    ],
    'Dénombrer des personnes et des objets, dire son âge, donner des numéros de téléphone.',
    ['rae-dpd-cardinales', 'rae-dpd-tilde'],
  ),
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const [n, a, b] = rng.shuffle(Array.from({ length: 16 }, (_, i) => i)) as [number, number, number];
      const { answer, traps } = options(
        rng,
        String(n),
        [a, b].map((m) => [String(m), `${m} se dit « ${numberWord(m)} ».`]),
      );
      return {
        prompt: `Quel nombre se dit « ${numberWord(n)} » ?`,
        answer,
        traps,
        hint: 'Compte en espagnol depuis « cero » jusqu’à ce mot.',
        steps: [`On cherche la valeur de « ${numberWord(n)} ».`, `Réponse : **${n}**`],
      };
    }
    if (level === 2) {
      const set = rng.pick(NEIGHBOURS);
      return {
        prompt: `Associe chaque mot à son nombre : ${rng
          .shuffle(set)
          .map((n) => `« ${numberWord(n)} »`)
          .join(', ')}.`,
        answer: matching(
          rng,
          set.map((n) => [numberWord(n), String(n)]),
        ),
        hint: 'Ces mots se ressemblent : regarde leur fin (-ce, -ta, -nte, dieci-).',
        steps: [
          'Les unités, les nombres de 11 à 19 et les dizaines ont des formes proches : on les compare.',
          `Réponse : **${set.map((n) => `${numberWord(n)} = ${n}`).join(' ; ')}**`,
        ],
      };
    }
    if (level === 3) {
      const n = rng.pick([rng.int(0, 15), rng.int(2, 9) * 10, rng.int(16, 20)]);
      return {
        prompt: `Écris en toutes lettres, en espagnol, le nombre ${n}.`,
        answer: { kind: 'text', accepted: spellings(n) },
        traps: numberTraps(n),
        hint:
          n > 15 && n < 20
            ? 'Un seul mot qui commence par « dieci ».'
            : 'Récite les nombres ou les dizaines dans l’ordre.',
        steps: [`${n} s’écrit en un seul mot.`, `Réponse : **${numberWord(n)}**`],
      };
    }
    if (level === 4) {
      if (rng.int(0, 3) === 0) {
        const n = rng.pick([21, 31, 41, 51]);
        const full = numberWord(n);
        const short = beforeNoun(n);
        return {
          prompt: `Complète en lettres : « Mi profesor tiene … años. » (${n} ans)`,
          answer: { kind: 'text', accepted: apocopeSpellings(n) },
          traps: [
            { text: full, why: `Devant un nom masculin, « uno » devient « un » : « ${short} años ».` },
            { text: String(n), why: 'Écris le nombre en lettres.' },
          ],
          hint: 'Le nombre est placé devant un nom masculin : sa fin change.',
          steps: [`${n} se dit « ${full} », raccourci devant un nom masculin.`, `Réponse : **${short}**`],
        };
      }
      const n = rng.int(0, 1) === 0 ? rng.int(21, 29) : rng.int(3, 9) * 10 + rng.int(1, 9);
      return {
        prompt: `Écris en toutes lettres, en espagnol, le nombre ${n}.`,
        answer: { kind: 'text', accepted: spellings(n) },
        traps: numberTraps(n),
        hint: n < 30 ? 'De 21 à 29, tout s’écrit en un mot.' : 'Au-delà de 30 : dizaine, petit mot de liaison, unité.',
        steps: [
          n < 30 ? 'De 21 à 29 : « veinti » collé à l’unité.' : 'Au-delà de 30 : dizaine + y + unité.',
          `Réponse : **${numberWord(n)}**`,
        ],
      };
    }
    const [first, second] = rng.shuffle(NAMES) as [string, string];
    const a = rng.int(11, 29);
    const b = rng.int(2, 9);
    if (rng.int(0, 1) === 0) {
      // Plages disjointes : les trois groupes sont toujours différents.
      const code = [rng.int(60, 79), a, rng.int(31, 59)];
      const digits = code.join(' ');
      return {
        prompt: `${first} dicte un numéro à ${second}. Écris-le en chiffres, par groupes de deux séparés par une espace.`,
        figure: {
          kind: 'document',
          title: 'Un numéro dicté',
          lines: [`${second} : ¿Tu número, ${first}?`, `${first} : Apunta: ${code.map(numberWord).join(', ')}.`],
          credit: 'Dialogue écrit pour l’exercice (numéro fictif incomplet).',
        },
        answer: { kind: 'text', accepted: [digits, code.join('')] },
        traps: [
          { text: [...code].reverse().join(' '), why: 'L’ordre de la dictée doit être respecté.' },
          { text: [code[0], code[2], code[1]].join(' '), why: 'Deux groupes sont inversés : relis la ligne 2.' },
        ],
        hint: 'Traite les groupes un par un ; une virgule sépare deux nombres.',
        steps: [
          'Chaque nombre dicté devient un groupe de deux chiffres.',
          ...code.map((n) => `« ${numberWord(n)} » = ${n}.`),
          `Réponse : **${digits}**`,
        ],
      };
    }
    const sum = a + b;
    return {
      prompt: `Lis le texte, puis écris en lettres, en espagnol, l’âge ${de(second)}.`,
      figure: {
        kind: 'document',
        title: 'Deux âges',
        lines: [`Hola, me llamo ${first}. Tengo ${ageWords(a)}.`, `${second} tiene ${numberWord(b)} años más que yo.`],
        credit: '« más que yo » : de plus que moi. Texte écrit pour l’exercice.',
      },
      // La somme est un âge : la forme employée devant « años » est admise elle aussi.
      answer: {
        kind: 'text',
        accepted: [...new Set([...spellings(sum), ...(sum % 10 === 1 ? apocopeSpellings(sum) : [])])],
      },
      traps: [
        { text: numberWord(a), why: `C’est l’âge ${de(first)} : il faut ajouter ${b}.` },
        { text: numberWord(a - b), why: '« más » veut dire « de plus » : on ajoute.' },
      ],
      hint: 'Calcule à partir des deux nombres du texte, puis écris le résultat en espagnol.',
      steps: [
        `${first} a ${a} ans ; ${second} a ${b} ans de plus : ${a} + ${b} = ${sum}.`,
        `Réponse : **${numberWord(sum)}**`,
      ],
    };
  },
};

// ——— 4. Alphabet et accent tonique ———

const written = (w: Word) => w.syllables.join('');
const stressed = (w: Word) => at(w.syllables, w.stress);
type Kind = 'aguda' | 'llana' | 'esdrújula';
const KINDS: readonly Kind[] = ['aguda', 'llana', 'esdrújula'];
const kindOf = (w: Word): Kind => at(KINDS, w.syllables.length - 1 - w.stress);

const syllableTraps = (w: Word) =>
  w.syllables
    .filter((s) => noAccent(s) !== noAccent(stressed(w)))
    .map((s) => ({ text: s, why: `Dans « ${written(w)} », la voix n’insiste pas sur « ${s} » : revois la règle.` }));

const ruleOf = (w: Word): string => {
  if (/[aeiouns]$/.test(written(w)))
    return `« ${written(w)} » finit par une voyelle, -n ou -s, sans accent écrit : l’avant-dernière syllabe est tonique.`;
  return `« ${written(w)} » finit par une consonne autre que -n ou -s, sans accent écrit : la dernière syllabe est tonique.`;
};

const name = (letter: (typeof LETTERS)[number]) => at(letter.names, 0);

const MESSAGES = [
  ['El médico tiene un lápiz azul.', ['médico', 'lápiz', 'azul']],
  ['El sábado, mi hermano come jamón.', ['sábado', 'hermano', 'jamón']],
  ['El pájaro es blanco, no marrón.', ['pájaro', 'blanco', 'marrón']],
  ['¿Dónde está el reloj? En el salón, con el pájaro.', ['reloj', 'salón', 'pájaro']],
  ['El francés lleva una camisa y unos pantalones.', ['francés', 'camisa', 'pantalones']],
  ['Mi hermano inglés quiere comer.', ['hermano', 'inglés', 'comer']],
] as const;

const ALL_WORDS: readonly Word[] = [...WRITTEN_ACCENT, ...NO_ACCENT, { syllables: ['ma', 'rrón'], stress: 1 }];
const wordNamed = (text: string): Word =>
  at(
    ALL_WORDS,
    ALL_WORDS.findIndex((w) => written(w) === text),
  );

const alphabet: Skill = {
  id: 'e5-alphabet-accent',
  title: 'L’alphabet et l’accent tonique',
  levels: 5,
  version: 1,
  lesson: lesson(
    [
      'L’**alphabet** espagnol a 27 lettres, dont ñ (eñe) ; h (hache) ne se prononce pas (sauf dans le groupe ch), b (be) et v (uve) se prononcent pareil.',
      'Chaque mot a une **syllabe tonique** : un accent écrit la montre (**tilde** : lápiz) ; sinon, voyelle, -n ou -s final → avant-dernière (camisa), autre consonne → dernière (azul).',
      'Un mot est **aguda**, **llana** ou **esdrújula** selon que la voix insiste sur la dernière, l’avant-dernière ou l’antépénultième syllabe.',
    ],
    'Épeler des mots ; respect de l’accent tonique ; repérage des accents écrits.',
    [
      'rae-dpd-abecedario',
      'rae-dpd-acento',
      'rae-dpd-tilde',
      'rae-dpd-letra-b',
      'rae-dpd-letra-g',
      'rae-dpd-letra-h',
      'rae-dpd-letra-j',
      'rae-dpd-letra-enye',
      'rae-dpd-letra-q',
      'rae-dpd-letra-v',
      'rae-dpd-letra-w',
      'rae-dpd-letra-x',
      'rae-dpd-letra-y',
      'rae-dpd-letra-z',
    ],
  ),
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const [l, a, b] = rng.shuffle(LETTERS) as [
        (typeof LETTERS)[number],
        (typeof LETTERS)[number],
        (typeof LETTERS)[number],
      ];
      const { answer, traps } = options(
        rng,
        name(l),
        [a, b].map((o) => [name(o), `« ${name(o)} » est le nom de la lettre « ${o.letter} ».`]),
      );
      return {
        prompt: `Comment s’appelle la lettre « ${l.letter} » en espagnol ?`,
        answer,
        traps,
        hint: 'Épelle l’alphabet à voix haute jusqu’à cette lettre.',
        steps: ['On cherche le nom espagnol de la lettre.', `La lettre « ${l.letter} » s’appelle **${name(l)}**.`],
      };
    }
    if (level === 2) {
      const group = rng.pick([
        ['b', 'v', 'w'],
        ['g', 'j', 'h'],
        ['y', 'x', 'z'],
        ['ñ', 'q', 'g'],
      ]);
      const set = group.map((c) =>
        at(
          LETTERS,
          LETTERS.findIndex((l) => l.letter === c),
        ),
      );
      return {
        prompt: `Associe chaque lettre à son nom espagnol : ${rng.shuffle(group).join(', ')}.`,
        answer: matching(
          rng,
          set.map((l) => [l.letter, name(l)]),
        ),
        hint: 'Commence par la lettre dont tu es sûr, puis élimine les noms déjà pris.',
        steps: [
          'Chaque lettre a un nom, à connaître pour épeler.',
          `Réponse : **${set.map((l) => `${l.letter} = ${name(l)}`).join(' ; ')}**`,
        ],
      };
    }
    if (level === 3) {
      if (rng.int(0, 2) === 0) {
        const l = rng.pick(LETTERS);
        const others = LETTERS.filter((o) => o !== l).slice(0, 2);
        return {
          prompt: `Tu épelles un mot en espagnol. Écris le nom de la lettre « ${l.letter} ».`,
          answer: { kind: 'text', accepted: [...l.names] },
          traps: [
            { text: l.letter, why: 'Il faut le nom de la lettre, pas la lettre seule.' },
            ...others.map((o) => ({ text: name(o), why: `« ${name(o)} » est le nom de « ${o.letter} ».` })),
          ],
          hint: 'Pense à la façon dont on dit cette lettre quand on épelle.',
          steps: ['Chaque lettre a un nom.', `Réponse : **${name(l)}**`],
        };
      }
      const w = rng.pick(WRITTEN_ACCENT);
      return {
        prompt: `Dans le mot « ${written(w)} », recopie la syllabe tonique.`,
        answer: { kind: 'text', accepted: lenient(stressed(w)) },
        traps: syllableTraps(w),
        hint: 'Un signe écrit au-dessus d’une voyelle te montre où appuyer.',
        steps: [
          `Syllabes : ${w.syllables.join(' - ')}. L’accent écrit marque la syllabe tonique.`,
          `Réponse : **${stressed(w)}**`,
        ],
      };
    }
    if (level === 4) {
      const w = rng.pick(NO_ACCENT);
      return {
        prompt: `Le mot « ${written(w)} » n’a pas d’accent écrit. Quelle syllabe porte l’accent tonique ? Écris-la.`,
        answer: { kind: 'text', accepted: [stressed(w)] },
        traps: syllableTraps(w),
        hint: 'Regarde la dernière lettre du mot : la règle en dépend.',
        steps: [`Syllabes : ${w.syllables.join(' - ')}.`, ruleOf(w), `Réponse : **${stressed(w)}**`],
      };
    }
    const [sentence, words] = rng.pick(MESSAGES);
    const found = words.map(wordNamed);
    const figure = {
      kind: 'document' as const,
      title: 'Une phrase à lire à voix haute',
      lines: ['¡Hola! Escucha y repite:', sentence],
      credit: 'Phrase écrite pour l’exercice.',
    };
    return {
      prompt: `Lis la phrase de la ligne 2 et classe ces mots selon la place de leur syllabe tonique : ${words.join(', ')}.`,
      figure,
      answer: {
        kind: 'cloze',
        parts: [`${words[0]} : `, ` ; ${words[1]} : `, ` ; ${words[2]} : `, ''],
        blanks: found.map((w) => ({ mode: 'list' as const, options: [...KINDS], correct: KINDS.indexOf(kindOf(w)) })),
      },
      hint: 'Pour chaque mot, trouve d’abord la syllabe tonique, puis compte depuis la fin.',
      steps: [
        ...found.map(
          (w) => `« ${written(w)} » (${w.syllables.join(' - ')}) : tonique « ${stressed(w)} », donc ${kindOf(w)}.`,
        ),
        `Réponse : **${found.map((w) => `${written(w)} = ${kindOf(w)}`).join(' ; ')}**`,
      ],
    };
  },
};

export const SPANISH_PRESENTATION_CHAPTER: Chapter = {
  id: 'e5-se-presenter',
  subject: 'espagnol',
  grade: '5e',
  domain: 'langue',
  title: 'Se présenter',
  skills: [saluer, presenter, nombres, alphabet],
};
