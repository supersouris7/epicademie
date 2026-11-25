import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { at, avecOuSansPoint, document, pickN, textTraps } from './outils.ts';
import {
  CLASSES,
  COMPLEXES_PIEGES,
  COORDINATION,
  LIENS_DEBUT,
  LIENS_INTRUS,
  LIENS_MILIEU,
  PHRASES_TYPIQUES,
  REUNIONS,
  SIMPLES_PIEGES,
  estComplexe,
  estCompose,
  faitPhraseComplexe,
  sourcesPhraseComplexe,
  texteReunion,
  type Classe,
  type Lien,
  type PhraseVerbes,
} from './phrase-complexe.donnees.ts';

/**
 * Chapitre « Phrase simple et phrase complexe » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025) :
 * « Différencier phrase simple et phrase complexe » à partir du repérage des verbes conjugués.
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitPhraseComplexe(id).citation} »`;

const DEF_CONJUGUE = 'Un verbe conjugué change quand le sujet change : je chante, nous chantons.';
const DEF_INFINITIF = 'Un verbe à l’infinitif, comme « chanter », ne change pas avec le sujet : on ne le compte pas.';
const DEF_COMPOSE = 'Un temps composé a deux parties (« a chanté ») : il compte pour un seul verbe.';
const DEF_SIMPLE = 'Un seul verbe conjugué : phrase simple. Plusieurs verbes conjugués : phrase complexe.';
const DEF_LIEN: Record<Classe, string> = {
  'conjonction de coordination': 'Les conjonctions de coordination sont : mais, ou, et, or, ni, car.',
  'conjonction de subordination':
    'Quand, lorsque, si, parce que, puisque, dès que sont des conjonctions de subordination.',
};

const cite = (mots: readonly string[]) => mots.map((m) => `« ${m} »`).join(' et ');
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const verbesDe = (p: PhraseVerbes) =>
  `${pluriel(p.verbes.length, 'verbe conjugué').replace('verbe conjugués', 'verbes conjugués')} : ${cite(p.verbes)}.`;

const PIEGES: readonly PhraseVerbes[] = [...SIMPLES_PIEGES, ...COMPLEXES_PIEGES];
const TOUTES: readonly PhraseVerbes[] = [...PHRASES_TYPIQUES, ...PIEGES];

/** Rappels utiles à une phrase : infinitif ou temps composé. */
const rappels = (p: PhraseVerbes): Rich[] => [
  ...(p.infinitifs.length ? [`${cite(p.infinitifs)} : infinitif, on ne le compte pas.`] : []),
  ...(p.verbes.some(estCompose) ? [DEF_COMPOSE] : []),
];

// ───────────────────────── 1. Compter les verbes conjugués ─────────────────────────

function piegesDeCompte(n: number, infinitifs: number, composes: number) {
  return numTraps(r(n), [
    ...(infinitifs ? [[n + infinitifs, 'Tu as compté un infinitif. Il ne change pas avec le sujet.'] as const] : []),
    ...(composes
      ? [[n + composes, 'Tu as compté deux fois un temps composé. Ses deux parties font un seul verbe.'] as const]
      : []),
    [n + 1, 'Tu en as compté un de trop. Change le sujet : seul un verbe conjugué change.'],
    [
      n - 1,
      n === 1
        ? 'Il y a au moins un verbe : cherche le mot qui change avec le sujet.'
        : 'Tu en as oublié un. Un sujet peut servir à plusieurs verbes.',
    ],
  ]);
}

function compterDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(PHRASES_TYPIQUES);
      const n = p.verbes.length;
      const { answer, traps } = choice(
        rng,
        String(n),
        [1, 2, 3]
          .filter((x) => x !== n)
          .map((x) => ({
            label: String(x),
            why:
              x > n
                ? 'Tu en as trop compté : un nom ou un petit mot n’est pas un verbe.'
                : 'Tu en as oublié : lis la phrase jusqu’au bout.',
          })),
      );
      return {
        prompt: `Combien de verbes conjugués y a-t-il dans « ${p.texte} » ?`,
        answer,
        traps,
        hint: 'Cherche les mots qui changent si tu changes le sujet.',
        steps: [DEF_CONJUGUE, verbesDe(p), `La réponse est **${n}**.`],
      };
    }
    case 2: {
      const p = rng.pick(PIEGES.filter((x) => x.infinitifs.length > 0));
      const bon = cite(p.verbes);
      const premier = at(p.verbes, 0);
      const inf = at(p.infinitifs, 0);
      const { answer, traps } = choice(rng, bon, [
        { label: cite([...p.verbes, inf]), why: `« ${inf} » est à l’infinitif : on ne le compte pas.` },
        { label: cite([inf]), why: `« ${inf} » est à l’infinitif. Cherche le verbe qui change avec le sujet.` },
        {
          label: cite([p.nom, premier]),
          why: `« ${p.nom} » est un nom : il ne se conjugue pas.`,
        },
      ]);
      return {
        prompt: `Quels sont tous les verbes conjugués de « ${p.texte} » ?`,
        answer,
        traps,
        hint: 'Change le sujet dans ta tête. Quels mots changent ? Lesquels restent pareils ?',
        steps: [DEF_CONJUGUE, DEF_INFINITIF, `La réponse est **${bon}**.`],
      };
    }
    case 3: {
      const p = rng.pick([...PHRASES_TYPIQUES, ...SIMPLES_PIEGES.filter((x) => !x.verbes.some(estCompose))]);
      const n = p.verbes.length;
      return {
        prompt: `Écris en chiffres le nombre de verbes conjugués : « ${p.texte} »`,
        answer: num(n),
        traps: piegesDeCompte(n, p.infinitifs.length, 0),
        hint: 'Souligne dans ta tête chaque verbe qui change avec son sujet.',
        steps: [DEF_CONJUGUE, ...rappels(p), verbesDe(p), `La réponse est **${n}**.`],
      };
    }
    case 4: {
      const p = rng.pick(SIMPLES_PIEGES.filter((x) => x.infinitifs.length === 1 || x.verbes.some(estCompose)));
      const verbe = at(p.verbes, 0);
      const compose = estCompose(verbe);
      const accepted = [verbe];
      const [aux = '', participe = ''] = verbe.split(' ');
      return {
        prompt: `Cette phrase a un seul verbe conjugué. Écris-le (avec son auxiliaire s’il en a un) : « ${p.texte} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          compose
            ? [
                [aux, 'Il manque la deuxième partie : le temps composé s’écrit en entier.'],
                [participe, 'Il manque l’auxiliaire : c’est lui qui change avec le sujet.'],
                [p.nom, `« ${p.nom} » est un nom : il ne se conjugue pas.`],
              ]
            : [
                [at(p.infinitifs, 0), `« ${at(p.infinitifs, 0)} » est à l’infinitif : il ne change pas.`],
                [`${verbe} ${at(p.infinitifs, 0)}`, 'Écris seulement le verbe conjugué, sans l’infinitif.'],
                [p.nom, `« ${p.nom} » est un nom : il ne se conjugue pas.`],
              ],
        ),
        hint: 'Mets la phrase avec un autre sujet. Regarde tout ce qui change, même en deux mots.',
        steps: [DEF_CONJUGUE, compose ? DEF_COMPOSE : DEF_INFINITIF, `La réponse est **${verbe}**.`],
      };
    }
    default: {
      // Un texte avec au moins un temps composé et un infinitif.
      const compose = rng.pick(PIEGES.filter((x) => x.verbes.some(estCompose)));
      const infinitif = rng.pick(PIEGES.filter((x) => x.infinitifs.length > 0 && x !== compose));
      // Au moins une ligne complexe : compter les lignes ne donne jamais la réponse.
      const autre = rng.pick(TOUTES.filter((x) => estComplexe(x) && x !== compose && x !== infinitif));
      const lignes = rng.shuffle([compose, infinitif, autre]);
      const n = lignes.reduce((s, p) => s + p.verbes.length, 0);
      const inf = lignes.reduce((s, p) => s + p.infinitifs.length, 0);
      const comp = lignes.reduce((s, p) => s + p.verbes.filter(estCompose).length, 0);
      return {
        prompt: 'Lis le texte. Combien de verbes conjugués contient-il en tout ?',
        figure: document(
          'Carnet de la semaine',
          lignes.map((p) => p.texte),
        ),
        answer: num(n),
        traps: piegesDeCompte(n, inf, comp),
        hint: 'Avance ligne par ligne. Méfie-toi des infinitifs et des verbes en deux mots.',
        steps: [
          DEF_INFINITIF,
          DEF_COMPOSE,
          `Ligne par ligne : ${lignes.map((p) => cite(p.verbes)).join(' ; ')}.`,
          `En tout : **${n}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Phrase simple ou complexe ─────────────────────────

type Sorte = 'simple' | 'complexe';
const SORTES: readonly Sorte[] = ['simple', 'complexe'];
const sorteDe = (p: PhraseVerbes): Sorte => (estComplexe(p) ? 'complexe' : 'simple');

const pourquoiPas = (p: PhraseVerbes): Rich =>
  `« ${p.texte} » a ${p.verbes.length > 1 ? 'plusieurs verbes conjugués' : 'un seul verbe conjugué'} (${cite(p.verbes)}) : elle est ${sorteDe(p)}.`;

function sorteDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
    case 2: {
      const cherchee = rng.pick(SORTES);
      const banque = level === 1 ? PHRASES_TYPIQUES : PIEGES;
      const bon = rng.pick(banque.filter((p) => sorteDe(p) === cherchee));
      const faux = pickN(
        rng,
        banque.filter((p) => sorteDe(p) !== cherchee),
        level === 1 ? 2 : 3,
      );
      const { answer, traps } = choice(
        rng,
        bon.texte,
        faux.map((p) => ({ label: p.texte, why: pourquoiPas(p) })),
      );
      return {
        prompt:
          level === 1
            ? `Quelle phrase est une phrase ${cherchee} ?`
            : `Compte bien les verbes conjugués. Quelle phrase est ${cherchee} ?`,
        answer,
        traps,
        hint: 'Ne regarde pas la longueur : compte les verbes conjugués de chaque phrase.',
        steps: [DEF_SIMPLE, verbesDe(bon), `La réponse est **${bon.texte}**`],
      };
    }
    case 3: {
      const p = rng.pick(TOUTES);
      const n = p.verbes.length;
      return {
        prompt: `Analyse la phrase : « ${p.texte} »`,
        answer: {
          kind: 'cloze',
          parts: ['Nombre de verbes conjugués (en chiffres) : ', '. C’est une phrase ', '.'],
          blanks: [
            { mode: 'text', accepted: [String(n)] },
            { mode: 'list', options: [...SORTES], correct: SORTES.indexOf(sorteDe(p)) },
          ],
        },
        traps: [],
        hint: 'Compte d’abord les verbes qui changent avec le sujet. Le nombre te donne la réponse.',
        steps: [DEF_SIMPLE, ...rappels(p), verbesDe(p), `Réponses : **${n}**, **${sorteDe(p)}**.`],
      };
    }
    case 4: {
      const x = rng.pick(REUNIONS);
      const bon = texteReunion(x);
      const accepted = [...avecOuSansPoint(bon)];
      if (x.mot === 'mais' || x.mot === 'car') accepted.push(...avecOuSansPoint(`${x.a}, ${x.mot} ${x.b}.`));
      // Le « œ » est difficile à taper : l’écriture « oe » est aussi acceptée.
      accepted.push(...accepted.filter((t) => t.includes('œ')).map((t) => t.replaceAll('œ', 'oe')));
      return {
        prompt: `Fais une seule phrase complexe. Écris la première phrase, puis « ${x.mot} », puis la seconde : « ${x.a}. » « ${x.b.charAt(0).toUpperCase()}${x.b.slice(1)}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [`${x.a}. ${x.mot} ${x.b}.`, 'Enlève le premier point : tu dois faire une seule phrase.'],
          [`${x.a} ${x.b}.`, `Il manque « ${x.mot} » entre les deux parties.`],
          [`${x.a}.`, 'Tu as recopié une phrase simple : elle n’a qu’un verbe conjugué.'],
        ]),
        hint: 'Un seul point, tout à la fin. La seconde partie ne prend plus de majuscule.',
        steps: [DEF_SIMPLE, 'La nouvelle phrase garde les deux verbes conjugués.', `La phrase est **${bon}**`],
      };
    }
    default: {
      const simples = pickN(rng, SIMPLES_PIEGES, 2);
      const complexes = pickN(rng, COMPLEXES_PIEGES, 2);
      const lignes = rng.shuffle([...simples, ...complexes]);
      return {
        prompt: 'Lis le texte. Pour chaque ligne, dis si la phrase est simple ou complexe.',
        figure: document(
          'Journal de la classe',
          lignes.map((p) => p.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1 : ', '. Ligne 2 : ', '. Ligne 3 : ', '. Ligne 4 : ', '.'],
          blanks: lignes.map((p) => ({
            mode: 'list' as const,
            options: [...SORTES],
            correct: SORTES.indexOf(sorteDe(p)),
          })),
        },
        traps: [],
        hint: 'La longueur et le mot « et » peuvent te tromper. Seuls les verbes conjugués comptent.',
        steps: [
          DEF_SIMPLE,
          `Ligne par ligne : ${lignes.map((p) => cite(p.verbes)).join(' ; ')}.`,
          `Réponses : **${lignes.map(sorteDe).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Les mots qui relient ─────────────────────────

const autreClasse = (c: Classe): Classe => (c === CLASSES[0] ? at(CLASSES, 1) : at(CLASSES, 0));
const whyClasse = (l: Lien): Rich =>
  l.classe === 'conjonction de coordination'
    ? `« ${l.mot} » fait partie de la liste : mais, ou, et, or, ni, car. C’est une conjonction de coordination.`
    : `« ${l.mot} » n’est pas dans la liste mais, ou, et, or, ni, car. C’est une conjonction de subordination.`;

const whyAutres = (l: Lien) => [
  { label: l.verbe, why: `« ${l.verbe} » est un verbe conjugué : le mot cherché relie les verbes entre eux.` },
  { label: l.nom, why: `« ${l.nom} » est un nom : il ne sert pas à relier.` },
  { label: l.det, why: `« ${l.det} » est un déterminant : il annonce un nom.` },
];

const blancClasse = (l: Lien) => ({
  mode: 'list' as const,
  options: [...CLASSES],
  correct: CLASSES.indexOf(l.classe),
});

function liensDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const l = rng.pick(LIENS_MILIEU);
      const { answer, traps } = choice(rng, l.mot, whyAutres(l).slice(0, 2));
      return {
        prompt: `Quel mot relie les deux parties de « ${l.texte} » ?`,
        answer,
        traps,
        hint: 'Trouve les deux verbes conjugués. Quel mot fait le pont entre leurs deux parties ?',
        steps: [
          'Dans cette phrase, chaque partie a son verbe conjugué.',
          'Le mot qui relie fait le pont entre ces deux parties.',
          `La réponse est **${l.mot}**.`,
        ],
      };
    }
    case 2: {
      const l = rng.pick(LIENS_MILIEU);
      const { answer, traps } = choice(rng, l.classe, [
        { label: autreClasse(l.classe), why: whyClasse(l) },
        { label: 'préposition', why: 'Une préposition ouvre un groupe : dans la cour, sur le lit.' },
        { label: 'déterminant', why: 'Un déterminant se place devant un nom.' },
      ]);
      return {
        prompt: `Dans « ${l.texte} », le mot « ${l.mot} » est…`,
        answer,
        traps,
        hint: 'Récite la petite liste des mots de coordination. Ce mot y est-il ?',
        steps: [DEF_LIEN[l.classe], `« ${l.mot} » est une **${l.classe}**.`],
      };
    }
    case 3: {
      const l = rng.pick(LIENS_MILIEU);
      const accepted = [l.mot];
      const [debut = ''] = l.mot.split(' ');
      return {
        prompt: `Écris le mot qui relie les deux verbes conjugués : « ${l.texte} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          ...(debut === l.mot ? [] : [[debut, 'Ce mot qui relie s’écrit en deux mots.'] as const]),
          ...whyAutres(l).map((o) => [o.label, o.why] as const),
        ]),
        hint: 'Cherche entre la première partie et la seconde. Il peut s’écrire en deux mots.',
        steps: [DEF_LIEN[l.classe], `La réponse est **${l.mot}**.`],
      };
    }
    case 4: {
      const l = rng.pick(LIENS_DEBUT.concat(LIENS_INTRUS));
      return {
        prompt: `Attention au piège ! Trouve le mot qui relie les verbes conjugués : « ${l.texte} »`,
        answer: {
          kind: 'cloze',
          parts: ['Ce mot est : ', '. C’est une ', '.'],
          blanks: [{ mode: 'text', accepted: [l.mot] }, blancClasse(l)],
        },
        traps: [],
        hint: 'Il n’est pas toujours au milieu. Et un petit mot peut relier seulement deux noms.',
        steps: [
          'Je repère les deux verbes conjugués, puis le mot qui relie leurs deux parties.',
          DEF_LIEN[l.classe],
          `Réponses : **${l.mot}**, **${l.classe}**.`,
        ],
      };
    }
    default: {
      const milieu = LIENS_MILIEU.filter((l) => l.classe === 'conjonction de coordination');
      const lignes = rng.shuffle([rng.pick(milieu), rng.pick(LIENS_DEBUT), rng.pick(LIENS_INTRUS)]);
      return {
        prompt: 'Lis le texte. Pour chaque ligne, trouve le mot qui relie les verbes conjugués et sa classe.',
        figure: document(
          'Petites nouvelles',
          lignes.map((l) => l.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1 : ', ', ', '. Ligne 2 : ', ', ', '. Ligne 3 : ', ', ', '.'],
          blanks: lignes.flatMap((l) => [{ mode: 'text' as const, accepted: [l.mot] }, blancClasse(l)]),
        },
        traps: [],
        hint: 'Dans chaque ligne, pars des deux verbes conjugués. Le mot cherché peut ouvrir la phrase.',
        steps: [
          `Coordination : ${COORDINATION.join(', ')}.`,
          'Les autres mots qui relient ici sont des conjonctions de subordination.',
          `Réponses : **${lignes.map((l) => `${l.mot} (${l.classe})`).join(', ')}**.`,
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
  readonly factId: string;
  readonly faits: readonly string[];
  readonly generate: Skill['generate'];
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesPhraseComplexe(n.factId, ...n.faits) },
  generate: n.generate,
});

export const FCM2_PHRASE_COMPLEXE: readonly Skill[] = [
  skill({
    id: 'fcm2-verbes-conjugues',
    title: 'Compter les verbes conjugués',
    memo: [
      'Mission : traque chaque **verbe conjugué** ! Il change avec le sujet : je saute, nous sautons.',
      'L’**infinitif** (sauter) ne se compte pas.',
      'Un **temps composé** compte pour un : « Tu as sauté. »',
    ],
    factId: 'reperage',
    faits: ['modes-personnels', 'modes-non-personnels', 'composes', 'temps-composes'],
    generate: compterDraft,
  }),
  skill({
    id: 'fcm2-phrase-simple-complexe',
    title: 'Phrase simple ou phrase complexe',
    memo: [
      '**Phrase simple** : un seul **verbe conjugué**. « Le chat et le chien dorment. »',
      '**Phrase complexe** : au moins deux. « Le chat dort et le chien joue. »',
      'La longueur ne compte pas : compte les verbes !',
    ],
    factId: 'reperage',
    faits: ['simple-complexe', 'sujet-une-fois', 'modes-non-personnels', 'composes'],
    generate: sorteDraft,
  }),
  skill({
    id: 'fcm2-mots-qui-relient',
    title: 'Les mots qui relient dans la phrase complexe',
    memo: [
      '**Conjonction de coordination** : mais, ou, et, or, ni, car. « Il pleut, mais je sors. »',
      '**Conjonction de subordination** : quand, lorsque, si, parce que, dès que, puisque, pendant que…',
      'Elle peut ouvrir la phrase : « Quand il pleut, je lis. »',
    ],
    factId: 'subordination-programme',
    faits: [
      'coordination-programme',
      'coordination-mot',
      'coordination-liste',
      'subordination-mot',
      'subordination-temps',
      'subordination-cause',
      'subordination-hypothese',
    ],
    generate: liensDraft,
  }),
];
