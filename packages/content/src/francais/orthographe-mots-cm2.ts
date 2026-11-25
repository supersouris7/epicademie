import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill, Trap } from '../types.ts';
import {
  CE_SE,
  LA_LA_LA,
  LEUR_LEURS,
  MOTS_MUETS,
  OU_OU,
  QUEL_QUELLE,
  faitOrthographeCm2,
  sourcesOrthographeCm2,
  type EmploiCm2,
  type MotMuet,
  type PhraseCm2,
  type Serie,
} from './orthographe-mots-cm2.donnees.ts';
import { A_A } from './orthographe-mots.donnees.ts';
import { remplir } from './orthographe-mots.ts';
import { at, document, pickN, textTraps } from './outils.ts';

/**
 * Chapitre « Orthographe des mots » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025),
 * cours moyen deuxième année, vocabulaire : « Mémoriser l’orthographe des mots ».
 */
const programme = `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitOrthographeCm2('om2-mots-frequents').citation} »`;

/** « a / à » (CM1), reprise au niveau 5 de la première notion. */
const A_A_CM2: Serie = {
  emplois: Object.fromEntries(A_A.emplois.map((e) => [e.mot, e])),
  indice: A_A.indice,
  simples: [],
  doubles: A_A.doubles.map((x) => ({ texte: x.texte, cles: x.mots })),
};

const emploi = (serie: Serie, cle: string): EmploiCm2 => {
  const e = serie.emplois[cle];
  if (!e) throw new Error(`emploi inconnu : ${cle}`);
  return e;
};
export const motsDe = (serie: Serie, phrase: PhraseCm2): string[] => phrase.cles.map((c) => emploi(serie, c).mot);
/** Les écritures différentes de la série. */
export const ecritures = (serie: Serie): string[] => [...new Set(Object.values(serie.emplois).map((e) => e.mot))];

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** La phrase écrite en entier, avec sa majuscule. */
export const phraseComplete = (texte: string, mots: readonly string[]) => majuscule(remplir(texte, mots));

const liste = (mots: readonly string[]) => {
  const q = mots.map((m) => `« ${m} »`);
  return `${q.slice(0, -1).join(', ')} ou ${at(q, q.length - 1)}`;
};
const pourquoi = (e: EmploiCm2): Rich => `Ici il faut « ${e.mot} ». ${e.role} ${e.essai}`;

/** Ce qu'on cherche et comment on le vérifie, pour chaque trou. */
const raisons = (serie: Serie, phrase: PhraseCm2) =>
  [...new Set(phrase.cles)].map((c) => `${emploi(serie, c).role} ${emploi(serie, c).essai}`);
const explications = (serie: Serie, phrase: PhraseCm2): string[] => [
  ...raisons(serie, phrase),
  `On écrit : **${phraseComplete(phrase.texte, motsDe(serie, phrase))}**`,
];

/** Une écriture tirée à parts égales, puis une phrase qui l'attend. */
const phraseSimple = (rng: Rng, serie: Serie) => {
  const bon = rng.pick(ecritures(serie));
  const phrase = rng.pick(serie.simples.filter((x) => motsDe(serie, x)[0] === bon));
  const e = emploi(serie, at(phrase.cles, 0));
  return { phrase, e };
};

/** Les autres écritures, avec l'explication, puis l'intrus. */
const fausses = (serie: Serie, e: EmploiCm2) => [
  ...ecritures(serie)
    .filter((m) => m !== e.mot)
    .map((label) => ({ label, why: pourquoi(e) })),
  ...(serie.intrus ? [{ label: serie.intrus.mot, why: serie.intrus.why }] : []),
];

function serieDraft(serie: Serie, avant: Serie) {
  return (rng: Rng, level: Level): QuestionDraft => {
    const mots = ecritures(serie);
    switch (level) {
      case 1: {
        const { phrase, e } = phraseSimple(rng, serie);
        const { answer, traps } = choice(rng, e.mot, fausses(serie, e).slice(0, 2));
        return {
          prompt: `Quel mot complète la phrase « ${phrase.texte} » ?`,
          answer,
          traps,
          hint: serie.indice,
          steps: explications(serie, phrase),
        };
      }
      case 2: {
        const [juste, ...autres] = pickN(rng, serie.simples, 4) as [PhraseCm2, ...PhraseCm2[]];
        const bon = phraseComplete(juste.texte, motsDe(serie, juste));
        const { answer, traps } = choice(
          rng,
          bon,
          autres.map((x) => {
            const e = emploi(serie, at(x.cles, 0));
            const faux = rng.pick(mots.filter((m) => m !== e.mot));
            return { label: phraseComplete(x.texte, [faux]), why: pourquoi(e) };
          }),
        );
        return {
          prompt: 'Une seule phrase est bien écrite. Laquelle ?',
          answer,
          traps,
          hint: serie.indice,
          steps: [...raisons(serie, juste), `La bonne phrase est **${bon}**`],
        };
      }
      case 3: {
        const { phrase, e } = phraseSimple(rng, serie);
        const accepted = [e.mot];
        return {
          prompt: `Écris ${liste(mots)} : « ${phrase.texte} »`,
          answer: { kind: 'text', accepted },
          traps: textTraps(
            accepted,
            fausses(serie, e).map((x) => [x.label, x.why] as const),
          ),
          hint: serie.indice,
          steps: explications(serie, phrase),
        };
      }
      case 4: {
        const phrase = rng.pick(serie.doubles);
        return {
          prompt: `Défi à plusieurs trous ! Complète avec ${liste(mots)} : « ${phrase.texte} »`,
          answer: {
            kind: 'cloze',
            parts: phrase.texte.split('…'),
            blanks: motsDe(serie, phrase).map((m) => ({ mode: 'text' as const, accepted: [m] })),
          },
          hint: 'Fais l’essai pour chaque trou, un par un.',
          steps: explications(serie, phrase),
        };
      }
      default: {
        const lignes = rng.shuffle([
          ...pickN(rng, serie.doubles, 2).map((phrase) => ({ phrase, de: serie })),
          { phrase: rng.pick(avant.doubles), de: avant },
        ]);
        const attendus = lignes.map((l) => motsDe(l.de, l.phrase));
        const parts = attendus.flatMap((trous, i) =>
          trous.map((_, j) => (j > 0 ? ' puis ' : `${i > 0 ? '. ' : ''}Ligne ${i + 1} : `)),
        );
        return {
          prompt: `Lis le texte. Complète avec ${liste([...new Set([...ecritures(avant), ...mots])])}.`,
          figure: document(
            'Carnet de mission',
            lignes.map((l) => l.phrase.texte),
          ),
          answer: {
            kind: 'cloze',
            parts: [...parts, '.'],
            blanks: attendus.flat().map((m) => ({ mode: 'text' as const, accepted: [m] })),
          },
          hint: 'Pour chaque trou, cherche d’abord les mots possibles, puis fais l’essai.',
          steps: [
            ...new Set(lignes.flatMap((l) => raisons(l.de, l.phrase))),
            `Réponses : **${attendus.flat().join(', ')}**.`,
          ],
        };
      }
    }
  };
}

// ───────────────────────── Lettres muettes finales ─────────────────────────

const COURANTS = MOTS_MUETS.filter((x) => x.niveau === 'courant');
const DIFFICILES = MOTS_MUETS.filter((x) => x.niveau === 'difficile');
/** Lettres muettes qu'on confond le plus à la fin d'un mot. */
const FINALES = ['t', 'd', 's', 'p'];

const debut = (x: MotMuet) => x.mot.slice(0, -1);
const fin = (x: MotMuet) => x.mot.slice(-1);
const trouee = (x: MotMuet) => x.phrase.replace('…', `${debut(x)}…`);
const entiere = (x: MotMuet) => x.phrase.replace('…', x.mot);
const MUETTE = 'Une **lettre muette** s’écrit, mais on ne l’entend pas.';
const famille = (x: MotMuet) => `Dans « ${x.parent} », de la même famille, on entend le « ${fin(x)} ».`;
const etapes = (x: MotMuet): string[] => [MUETTE, famille(x), `On écrit **${x.mot}**.`];
/** Autres écritures : lettre oubliée, puis autres lettres finales. */
const fautes = (x: MotMuet): { label: string; why: Rich }[] => [
  { label: debut(x), why: `Il manque la lettre muette. ${famille(x)}` },
  ...FINALES.filter((l) => l !== fin(x)).map((l) => ({
    label: `${debut(x)}${l}`,
    why: `Ce n’est pas « ${l} » à la fin. ${famille(x)}`,
  })),
];
const piegesEcrits = (x: MotMuet): Trap[] =>
  textTraps(
    [x.mot],
    fautes(x).map((f) => [f.label, f.why] as const),
  );

function muetDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const x = rng.pick(COURANTS);
      const toutes = fautes(x);
      const { answer, traps } = choice(rng, x.mot, [at(toutes, 0), rng.pick(toutes.slice(1))]);
      return {
        prompt: `Pense à « ${x.parent} ». Quel mot complète « ${x.phrase} » ?`,
        answer,
        traps,
        hint: 'Dis tout haut le mot de la famille et écoute la fin.',
        steps: etapes(x),
      };
    }
    case 2: {
      const x = rng.pick(COURANTS);
      const { answer, traps } = choice(rng, x.mot, pickN(rng, fautes(x), 3));
      return {
        prompt: `Quelle écriture est juste dans la phrase « ${x.phrase} » ?`,
        answer,
        traps,
        hint: 'Cherche dans ta tête un mot de la même famille.',
        steps: etapes(x),
      };
    }
    case 3: {
      const x = rng.pick(COURANTS);
      return {
        prompt: `Écris le mot en entier : « ${trouee(x)} » Indice de famille : « ${x.parent} ».`,
        answer: { kind: 'text', accepted: [x.mot] },
        traps: piegesEcrits(x),
        hint: 'Quelle lettre entends-tu en plus dans le mot de la famille ?',
        steps: etapes(x),
      };
    }
    case 4: {
      const x = rng.pick(DIFFICILES);
      return {
        prompt: `Sans aide ! Écris le mot en entier : « ${trouee(x)} »`,
        answer: { kind: 'text', accepted: [x.mot] },
        traps: piegesEcrits(x),
        hint: 'Trouve toi-même un mot de la même famille, puis écoute la fin.',
        steps: etapes(x),
      };
    }
    default: {
      const choisis = pickN(rng, DIFFICILES, 2);
      const phrase = rng.pick(QUEL_QUELLE.doubles.filter((p) => p.cles.length === 2));
      const quel = motsDe(QUEL_QUELLE, phrase);
      const attendus = [...choisis.map((x) => x.mot), ...quel];
      return {
        prompt: `Lis le texte. Lignes 1 et 2 : écris le mot en entier. Ligne 3 : ${liste(ecritures(QUEL_QUELLE))}.`,
        figure: document('Carnet de mission', [...choisis.map(trouee), phrase.texte]),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1 : ', '. Ligne 2 : ', '. Ligne 3 : ', ' puis ', '.'],
          blanks: attendus.map((m) => ({ mode: 'text' as const, accepted: [m] })),
        },
        hint: 'Pense à un mot de la famille. Pour la ligne 3, essaie « qu’il ».',
        steps: [
          MUETTE,
          ...choisis.map((x, i) => `Ligne ${i + 1} : ${entiere(x)} ${famille(x)}`),
          ...raisons(QUEL_QUELLE, phrase),
          `Réponses : **${attendus.join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── Notions du chapitre ─────────────────────────

interface Notion {
  readonly id: string;
  readonly title: string;
  readonly memo: readonly string[];
  readonly faits: readonly string[];
  readonly generate: Skill['generate'];
}

const COMMUNS = ['om2-mots-frequents', 'om2-homonyme', 'om2-substitution'];

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: { memo: n.memo, source: programme, sources: sourcesOrthographeCm2(...n.faits) },
  generate: n.generate,
});

export const FCM2_ORTHOGRAPHE_MOTS: readonly Skill[] = [
  skill({
    id: 'fcm2-ou-ou',
    title: 'ou ou où',
    memo: [
      'Deux **homophones** : même son, deux écritures.',
      '« ou » sert à choisir. Essaie « ou bien » : « le lait ou le jus ».',
      '« où » parle d’un **lieu** ou d’un **moment** : « la ville où je vis ».',
    ],
    faits: [...COMMUNS, 'om2-ou', 'om2-ou-lieu', 'om2-ou-moment', 'om2-a', 'om2-avoir'],
    generate: serieDraft(OU_OU, A_A_CM2),
  }),
  skill({
    id: 'fcm2-la-la-la',
    title: 'la, l’a ou là',
    memo: [
      '« la » accompagne un nom (**article défini**) ou le remplace devant un verbe (**pronom**) : « la porte », « je la ferme ».',
      '« l’a », c’est « l’ » et le verbe avoir. Essaie « l’avait » : « il l’a vu ».',
      '« là » indique un **lieu**. Essaie « ici » : « reste là ».',
    ],
    faits: [...COMMUNS, 'om2-la-article', 'om2-la-elision', 'om2-la-pronom', 'om2-la-lieu', 'om2-avoir'],
    generate: serieDraft(LA_LA_LA, OU_OU),
  }),
  skill({
    id: 'fcm2-ce-se',
    title: 'ce ou se',
    memo: [
      '« ce » montre un nom (**déterminant démonstratif**) : « ce livre ». Il va aussi devant « qui » ou « que » : « ce que je vois ».',
      '« se » est un **pronom réfléchi** devant un verbe : « il se lave » (comme « je me lave »).',
    ],
    faits: [...COMMUNS, 'om2-ce', 'om2-ce-pronom', 'om2-se'],
    generate: serieDraft(CE_SE, LA_LA_LA),
  }),
  skill({
    id: 'fcm2-leur-leurs',
    title: 'leur ou leurs',
    memo: [
      'Devant un verbe, « leur » est un **pronom** : il veut dire « à eux ». Jamais de s ! « Je leur parle. »',
      'Devant un nom, c’est un **déterminant possessif** : « leur chien » (un seul), « leurs chiens » (plusieurs).',
    ],
    faits: [...COMMUNS, 'om2-leur-pronom', 'om2-leur-place', 'om2-leur-singulier', 'om2-leur-pluriel'],
    generate: serieDraft(LEUR_LEURS, CE_SE),
  }),
  skill({
    id: 'fcm2-quel-quelle',
    title: 'quel, quelle ou qu’elle',
    memo: [
      '« quel » ou « quelle » va avec un nom : « quel jour », « quelle heure ».',
      '« qu’elle », c’est « que » + « elle » : l’**apostrophe** remplace le e. Essaie « qu’il » : « je crois qu’elle dort ».',
    ],
    faits: [...COMMUNS, 'om2-quel', 'om2-quelle', 'om2-que-elision', 'om2-elle'],
    generate: serieDraft(QUEL_QUELLE, LEUR_LEURS),
  }),
  skill({
    id: 'fcm2-lettres-muettes',
    title: 'Les lettres muettes à la fin des mots',
    memo: [
      'Une **lettre muette** s’écrit, mais on ne l’entend pas : le t de « petit ».',
      'Astuce de détective : cherche un **mot dérivé** de la même famille. « petitesse » fait entendre le t !',
    ],
    faits: ['om2-mots-frequents', 'om2-relations', 'om2-muet', 'om2-derivation', ...MOTS_MUETS.map((x) => x.fait)],
    generate: muetDraft,
  }),
];
