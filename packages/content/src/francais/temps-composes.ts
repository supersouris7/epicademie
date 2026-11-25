import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { appariement, at, document, lowerFirst, pickN, textTraps } from './outils.ts';
import { VOYELLE_FAUTIVE } from './passe-simple.donnees.ts';
import {
  PERSONNES,
  PIEGES_IRREGULIERS,
  SUJETS,
  SUJETS_GROUPES,
  avecSujet,
  forme,
  type Personne,
  type Sujet,
  type Verbe,
} from './present.donnees.ts';
import {
  FINS,
  FUTURS_FAUTIFS,
  IRREGULIERS_CITES,
  PARTICIPES_FAUTIFS,
  REGULIERS,
  REGULIERS_IR,
  SUJETS_ACCORDES,
  auxiliaireDe,
  conjugue,
  neDevant,
  participe,
  participeAccorde,
  type Negation,
  type SujetAccorde,
  type VerbeTemps,
} from './temps.donnees.ts';
import {
  COMPOSES,
  FAIT_FAMILLE,
  FAMILLE_1,
  FINS_1,
  FORMES_A_RATTACHER,
  HUIT_3,
  TEMPS_3,
  VERBES_1,
  VERBES_3,
  auxiliaireAu,
  composeAu,
  conjugue1,
  conjugue3,
  faitTempsComposes,
  sansJe,
  sourcesTempsComposes,
  type Compose,
  type Famille1,
  type Temps1,
  type Temps3,
  type Verbe1,
  type Verbe3,
} from './temps-composes.donnees.ts';

/**
 * Chapitre « Les temps composés » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025),
 * cours moyen deuxième année : « Approfondir sa maîtrise de la conjugaison ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitTempsComposes(id).citation} »`;

const PRONOMS: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il ou elle',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils ou elles',
};

type Piege = readonly [string, string];

/** Propositions fausses distinctes (aucune écriture juste, aucun doublon). */
function fausses(bon: string, list: readonly Piege[]) {
  const vues = new Set([bon]);
  return list.filter(([f]) => !vues.has(f) && vues.add(f)).map(([label, why]) => ({ label, why }));
}

const SANS_JE: readonly Sujet[] = sansJe(SUJETS);
const TOUS_SANS_JE: readonly Sujet[] = [...SANS_JE, ...SUJETS_GROUPES];

/** Verbes conjugués avec « être » : un sujet au genre connu, pour accorder le participe passé. */
const sujetPour = (rng: Rng, v: VerbeTemps, liste: readonly SujetAccorde[]): SujetAccorde =>
  auxiliaireDe(v) === 'être' ? rng.pick(SUJETS_ACCORDES) : rng.pick(liste);

const phrase = (s: Sujet, v: VerbeTemps, gv: string) => `${avecSujet(s.texte, gv)} ${FINS[v]}.`;

/** Groupe nominal sujet : le pronom qui le remplace. */
const remplacer = (s: Sujet): readonly Rich[] => {
  const groupe = SUJETS_GROUPES.find((x) => x.texte === s.texte);
  return groupe ? [`« ${s.texte} », c’est comme « ${groupe.pronom} ».`] : [];
};

/** Un sujet en début de ligne d'un récit, après un complément de temps. */
const sujetsRecit = (rng: Rng, n: number): Sujet[] =>
  rng.shuffle([...pickN(rng, SUJETS_GROUPES, 2), ...pickN(rng, SANS_JE, n - 2)]);

/** Texte à trous : une ligne de document par trou, une seule écriture attendue. */
function texteATrous(
  prompt: string,
  titre: string,
  lignes: readonly { readonly texte: string; readonly attendu: string; readonly pourquoi: string }[],
  hint: string,
  debut: readonly Rich[],
): QuestionDraft {
  return {
    prompt,
    figure: document(
      titre,
      lignes.map((l) => l.texte),
    ),
    answer: {
      kind: 'cloze',
      parts: [...lignes.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
      blanks: lignes.map((l) => ({ mode: 'text' as const, accepted: [l.attendu] })),
    },
    hint,
    steps: [
      ...debut,
      ...lignes.map((l, i) => `Ligne ${i + 1} : ${l.pourquoi}`),
      `Réponses : **${lignes.map((l) => l.attendu).join(', ')}**.`,
    ],
  };
}

// ───────────────────────── Temps composés : explications et pièges ─────────────────────────

const AU_AU: Record<Compose, string> = { 'passé composé': 'au présent', 'plus-que-parfait': 'à l’imparfait' };
const autreCompose = (t: Compose): Compose => (t === 'passé composé' ? 'plus-que-parfait' : 'passé composé');

const accordDe = (v: VerbeTemps, s: SujetAccorde): Rich[] =>
  auxiliaireDe(v) === 'être' && participeAccorde(v, s) !== participe(v)
    ? [`Avec « être », le participe passé s’accorde avec le sujet : ${participeAccorde(v, s)}.`]
    : [];

/** Comment se forme le verbe : l'auxiliaire au bon temps, puis le participe passé. */
const etapesCompose = (t: Compose, v: VerbeTemps, s: SujetAccorde): Rich[] => [
  ...remplacer(s),
  `« ${v} » se conjugue avec « ${auxiliaireDe(v)} ». Au ${t}, l’auxiliaire est ${AU_AU[t]} : ${auxiliaireAu(t, v, s.personne)}.`,
  `Le participe passé de « ${v} » est « ${participe(v)} ».`,
  ...accordDe(v, s),
];

/** Erreurs typiques d'un verbe à un temps composé : d'abord les plus tentantes, puis les autres personnes. */
function piegesCompose(t: Compose, v: VerbeTemps, s: SujetAccorde): { forts: Piege[]; autres: Piege[] } {
  const p = s.personne;
  const aux = auxiliaireAu(t, v, p);
  const part = participeAccorde(v, s);
  const bon = `${aux} ${part}`;
  const autre = composeAu(autreCompose(t), v, s);
  const forts: Piege[] = [
    [
      autre,
      `« ${autre} » est au ${autreCompose(t)} : l’auxiliaire est ${AU_AU[autreCompose(t)]}. Au ${t}, il est ${AU_AU[t]}.`,
    ],
  ];
  if (auxiliaireDe(v) === 'être') {
    const avoir = auxiliaireAu(t, 'avoir', p);
    forts.push([`${avoir} ${participe(v)}`, `« ${v} » se conjugue avec l’auxiliaire « être » : ${bon}.`]);
    if (part !== participe(v))
      forts.push([`${aux} ${participe(v)}`, `Avec « être », le participe passé s’accorde avec le sujet : ${part}.`]);
  }
  if (v.endsWith('er'))
    forts.push([`${aux} ${v}`, `Après l’auxiliaire, on écrit le participe passé (${part}), pas l’infinitif.`]);
  const fautif = PARTICIPES_FAUTIFS[v]?.[0];
  if (fautif) forts.push([`${aux} ${fautif}`, `Le participe passé de « ${v} » est « ${participe(v)} ».`]);
  const autres: Piege[] = [];
  const simple = t === 'plus-que-parfait' ? conjugue('imparfait', v, p) : forme(v, p);
  autres.push([
    simple,
    t === 'plus-que-parfait'
      ? `« ${simple} » est à l’imparfait, en un seul mot. Le plus-que-parfait s’écrit en deux mots.`
      : `« ${simple} » est au présent, en un seul mot. Le passé composé s’écrit en deux mots.`,
  ]);
  for (const q of PERSONNES) {
    const auxQ = auxiliaireAu(t, v, q);
    if (auxQ !== aux)
      autres.push([
        `${auxQ} ${part}`,
        `« ${auxQ} » ne va pas avec ce sujet. Avec « ${PRONOMS[p]} », l’auxiliaire est « ${aux} ».`,
      ]);
  }
  return { forts, autres };
}

/** Saisie : écrire le verbe à un temps composé (seul ou avec son sujet). */
function ecrireCompose(
  t: Compose,
  v: VerbeTemps,
  s: SujetAccorde,
  hint: string,
  debut: readonly Rich[],
): QuestionDraft {
  const bon = composeAu(t, v, s);
  const accepted = [bon, avecSujet(s.texte, bon)];
  const { forts, autres } = piegesCompose(t, v, s);
  return {
    prompt: `Écris le verbe « ${v} » au ${t} : « ${s.texte} … ${FINS[v]}. »`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [...forts, ...autres]),
    hint,
    steps: [...debut, ...etapesCompose(t, v, s), `On écrit **${phrase(s, v, bon)}**`],
  };
}

// ───────────────────────── 1. Le plus-que-parfait ─────────────────────────

const DEF_PQP = 'Plus-que-parfait = être ou avoir à l’imparfait + participe passé : j’avais chanté, il était venu.';
const INDICE_PQP = 'Mets d’abord « avoir » à l’imparfait avec ce sujet, puis ajoute le participe passé.';

const REGULIERS_AVOIR = REGULIERS.filter((v) => auxiliaireDe(v) === 'avoir');

function plusQueParfaitDraft(rng: Rng, level: Level): QuestionDraft {
  const t: Compose = 'plus-que-parfait';
  switch (level) {
    case 1: {
      const v = rng.pick(REGULIERS_AVOIR);
      const s = rng.pick(SUJETS);
      const p = s.personne;
      const bon = phrase(s, v, composeAu(t, v, s));
      const { answer, traps } = choice(rng, bon, [
        { label: phrase(s, v, forme(v, p)), why: 'Cette phrase est au présent : un seul mot, ça se passe maintenant.' },
        {
          label: phrase(s, v, conjugue('futur', v, p)),
          why: 'Cette phrase est au futur : un seul mot, ça arrivera plus tard.',
        },
      ]);
      return {
        prompt: `Quelle phrase est au plus-que-parfait ? (verbe « ${v} »)`,
        answer,
        traps,
        hint: 'Le plus-que-parfait s’écrit en deux mots : avais, avait, avions… puis le participe passé.',
        steps: [DEF_PQP, ...etapesCompose(t, v, s), `La phrase au plus-que-parfait : **${bon}**`],
      };
    }
    case 2: {
      const v = rng.pick(REGULIERS_AVOIR);
      const s = rng.pick(SANS_JE);
      const bon = composeAu(t, v, s);
      const { forts, autres } = piegesCompose(t, v, s);
      const { answer, traps } = choice(rng, bon, fausses(bon, [...forts, ...rng.shuffle(autres)]).slice(0, 3));
      return {
        prompt: `Complète au plus-que-parfait : « ${s.texte} … ${FINS[v]}. » (${v})`,
        answer,
        traps,
        hint: INDICE_PQP,
        steps: [DEF_PQP, ...etapesCompose(t, v, s), `On écrit **${phrase(s, v, bon)}**`],
      };
    }
    case 3:
      return ecrireCompose(t, rng.pick(REGULIERS_AVOIR), rng.pick(SANS_JE), INDICE_PQP, [DEF_PQP]);
    case 4: {
      const v = rng.pick(IRREGULIERS_CITES);
      return ecrireCompose(
        t,
        v,
        sujetPour(rng, v, TOUS_SANS_JE),
        'Être ou avoir ? Puis cherche le bon participe passé : il change beaucoup chez ces verbes.',
        [DEF_PQP],
      );
    }
    default: {
      const verbes = rng.shuffle([
        ...pickN(rng, REGULIERS_AVOIR, 2),
        rng.pick(IRREGULIERS_CITES.filter((v) => auxiliaireDe(v) === 'avoir')),
        rng.pick(['aller', 'venir'] as const),
      ]);
      const sujets = sujetsRecit(rng, 4);
      const debuts = pickN(rng, ['La veille,', 'Le matin même,', 'Quelques jours plus tôt,', 'Juste avant,'], 4);
      return texteATrous(
        'Lis le récit. Écris au plus-que-parfait le verbe entre parenthèses, ligne par ligne.',
        'Avant le grand spectacle',
        verbes.map((v, i) => {
          const s = auxiliaireDe(v) === 'être' ? rng.pick(SUJETS_ACCORDES) : at(sujets, i);
          const attendu = composeAu(t, v, s);
          return {
            texte: `${at(debuts, i)} ${lowerFirst(s.texte)} (${v}) ${FINS[v]}.`,
            attendu,
            pourquoi: [...etapesCompose(t, v, s), `On écrit « ${attendu} ».`].join(' '),
          };
        }),
        'Sur chaque ligne : être ou avoir à l’imparfait, puis le participe passé. Attention aux accords avec être !',
        [DEF_PQP],
      );
    }
  }
}

// ───────────────────────── 2. Passé composé ou plus-que-parfait ─────────────────────────

const DEF_PC_PQP =
  'Deux temps composés. Passé composé : auxiliaire au présent (j’ai chanté). Plus-que-parfait : auxiliaire à l’imparfait (j’avais chanté).';

function transformer(rng: Rng, verbes: readonly VerbeTemps[], liste: readonly SujetAccorde[]): QuestionDraft {
  const v = rng.pick(verbes);
  const s = sujetPour(rng, v, liste);
  const t = rng.pick(COMPOSES);
  const depart = composeAu(autreCompose(t), v, s);
  const bon = composeAu(t, v, s);
  const accepted = [bon, avecSujet(s.texte, bon)];
  const { forts, autres } = piegesCompose(t, v, s);
  return {
    prompt: `Récris le verbe au ${t} : « ${phrase(s, v, depart)} »`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [
      [depart, `C’est la phrase de départ, au ${autreCompose(t)}. Il faut changer le temps de l’auxiliaire.`],
      ...forts.slice(1),
      ...autres,
    ]),
    hint: `Garde le participe passé. Mets seulement l’auxiliaire ${AU_AU[t]}.`,
    steps: [DEF_PC_PQP, ...etapesCompose(t, v, s), `On écrit **${phrase(s, v, bon)}**`],
  };
}

const DEBUTS_COMPOSE: Record<Compose, readonly string[]> = {
  'passé composé': ['Ce matin,', 'Aujourd’hui,', 'Tout à l’heure,'],
  'plus-que-parfait': ['La veille,', 'Le jour d’avant,', 'Plus tôt,'],
};

function composeOuPqpDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(REGULIERS_AVOIR);
      const s = rng.pick(SANS_JE);
      const t = rng.pick(COMPOSES);
      const gv = composeAu(t, v, s);
      const aux = auxiliaireAu(t, v, s.personne);
      // Toujours le même ordre de propositions.
      const options = [...COMPOSES, 'imparfait'];
      return {
        prompt: `« ${phrase(s, v, gv)} » À quel temps est le verbe ?`,
        answer: { kind: 'choice', options, correct: options.indexOf(t) },
        traps: [
          {
            option: options.indexOf(autreCompose(t)),
            why: `L’auxiliaire « ${aux} » est ${AU_AU[t]} : c’est le ${t}, pas le ${autreCompose(t)}.`,
          },
          {
            option: 2,
            why: 'L’imparfait s’écrit en un seul mot. Ici, il y a un auxiliaire et un participe passé.',
          },
        ],
        hint: 'Regarde l’auxiliaire : est-il au présent ou à l’imparfait ?',
        steps: [DEF_PC_PQP, `L’auxiliaire est « ${aux} » : il est ${AU_AU[t]}.`, `Le verbe est au **${t}**.`],
      };
    }
    case 2: {
      const v = rng.pick(REGULIERS_AVOIR);
      const t = rng.pick(COMPOSES);
      const [pBon, ...pAutres] = rng.shuffle(PERSONNES.filter((p) => p !== 'tu'));
      if (!pBon) throw new Error('aucune personne');
      const s = (p: Personne) =>
        at(
          SUJETS.filter((x) => x.personne === p),
          0,
        );
      const bon = avecSujet(s(pBon).texte, composeAu(t, v, s(pBon)));
      // Le même sujet à l'autre temps (j’ai chanté / j’avais chanté), puis deux autres personnes.
      const faux = [pBon, ...pAutres.slice(0, 2)].map((p) =>
        avecSujet(s(p).texte, composeAu(autreCompose(t), v, s(p))),
      );
      const { answer, traps } = choice(
        rng,
        bon,
        faux.map((label) => ({
          label,
          why: `Dans « ${label} », l’auxiliaire est ${AU_AU[autreCompose(t)]} : c’est le ${autreCompose(t)}.`,
        })),
      );
      return {
        prompt: `Une seule de ces formes est au ${t}. Laquelle ?`,
        answer,
        traps,
        hint: `Cherche l’auxiliaire ${AU_AU[t]}.`,
        steps: [
          DEF_PC_PQP,
          `Cherche la forme dont l’auxiliaire est ${AU_AU[t]} : « ${auxiliaireAu(t, v, pBon)} ».`,
          `La forme au ${t} : **${bon}**.`,
        ],
      };
    }
    case 3:
      return transformer(rng, REGULIERS_AVOIR, SUJETS);
    case 4:
      return transformer(rng, IRREGULIERS_CITES, [...SUJETS, ...SUJETS_GROUPES]);
    default: {
      const temps = rng.shuffle<Compose>(['passé composé', 'passé composé', 'plus-que-parfait', 'plus-que-parfait']);
      const verbes = rng.shuffle([...pickN(rng, REGULIERS_AVOIR, 2), ...pickN(rng, IRREGULIERS_CITES, 2)]);
      const sujets = sujetsRecit(rng, 4);
      return texteATrous(
        'Lis le récit. Écris chaque verbe au temps demandé entre parenthèses, ligne par ligne.',
        'Le journal de la classe',
        verbes.map((v, i) => {
          const t = at(temps, i);
          const s = auxiliaireDe(v) === 'être' ? rng.pick(SUJETS_ACCORDES) : at(sujets, i);
          const attendu = composeAu(t, v, s);
          return {
            texte: `${rng.pick(DEBUTS_COMPOSE[t])} ${lowerFirst(s.texte)} (${v}, ${t}) ${FINS[v]}.`,
            attendu,
            pourquoi: [...etapesCompose(t, v, s), `On écrit « ${attendu} ».`].join(' '),
          };
        }),
        'Passé composé : ai, as, a, avons… Plus-que-parfait : avais, avait, avions…',
        [DEF_PC_PQP],
      );
    }
  }
}

// ───────────────────────── 3. Temps composés à la forme négative ─────────────────────────

const DEF_NEG =
  'À la forme négative, « ne » (ou « n’ ») et l’adverbe de négation (pas, jamais, plus) encadrent l’auxiliaire.';
const ADVERBES: readonly Negation[] = ['pas', 'jamais', 'plus'];

const negatifAu = (t: Compose, v: VerbeTemps, s: SujetAccorde, a: Negation): string => {
  const aux = auxiliaireAu(t, v, s.personne);
  return `${neDevant(aux)}${aux} ${a} ${participeAccorde(v, s)}`;
};

const etapesNeg = (t: Compose, v: VerbeTemps, s: SujetAccorde, a: Negation): Rich[] => {
  const aux = auxiliaireAu(t, v, s.personne);
  return [
    DEF_NEG,
    `Au ${t}, l’auxiliaire est « ${aux} ».`,
    neDevant(aux) === 'n’'
      ? `Devant une voyelle, « ne » devient « n’ » : n’${aux}.`
      : `Devant une consonne, on garde « ne » : ne ${aux}.`,
    `« ${a} » se place juste après l’auxiliaire, avant le participe passé.`,
    ...accordDe(v, s),
  ];
};

function piegesNeg(t: Compose, v: VerbeTemps, s: SujetAccorde, a: Negation): Piege[] {
  const aux = auxiliaireAu(t, v, s.personne);
  const part = participeAccorde(v, s);
  const ne = neDevant(aux);
  const list: Piege[] = [
    [`${ne}${aux} ${part} ${a}`, `« ${a} » se place avant le participe passé, juste après l’auxiliaire.`],
    [`${aux} ${a} ${part}`, 'À l’écrit, n’oublie pas « ne » ou « n’ ».'],
    [
      ne === 'n’' ? `ne ${aux} ${a} ${part}` : `n’${aux} ${a} ${part}`,
      ne === 'n’' ? 'Devant une voyelle, « ne » devient « n’ ».' : 'Devant une consonne, on écrit « ne » en entier.',
    ],
    [`${a} ${ne}${aux} ${part}`, `« ${a} » vient après l’auxiliaire, pas avant.`],
    [
      negatifAu(autreCompose(t), v, s, a),
      `La négation est bien placée, mais l’auxiliaire est ${AU_AU[autreCompose(t)]} : c’est le ${autreCompose(t)}.`,
    ],
  ];
  if (a !== 'pas') list.push([`${ne}${aux} pas ${part}`, `On demande « ne … ${a} », pas « ne … pas ».`]);
  return list;
}

const consigne = (a: Negation) => `Mets à la forme négative avec « ne … ${a} »`;

function ecrireNeg(t: Compose, v: VerbeTemps, s: SujetAccorde, a: Negation, hint: string): QuestionDraft {
  const bon = negatifAu(t, v, s, a);
  const accepted = [bon, avecSujet(s.texte, bon)];
  return {
    prompt: `${consigne(a)} : « ${phrase(s, v, composeAu(t, v, s))} » Complète : « ${s.texte} … ${FINS[v]}. »`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [
      ...piegesNeg(t, v, s, a),
      [composeAu(t, v, s), 'La phrase est restée positive : il manque la négation.'],
    ]),
    hint,
    steps: [...etapesNeg(t, v, s, a), `On écrit **${phrase(s, v, bon)}**`],
  };
}

function negationDraft(rng: Rng, level: Level): QuestionDraft {
  const t = rng.pick(COMPOSES);
  switch (level) {
    case 1:
    case 2: {
      const v = level === 1 ? rng.pick(REGULIERS_AVOIR) : rng.pick([...REGULIERS_AVOIR, 'aller', 'venir'] as const);
      const s = sujetPour(rng, v, SANS_JE);
      const a = level === 1 ? 'pas' : rng.pick(ADVERBES);
      const bon = phrase(s, v, negatifAu(t, v, s, a));
      const pieges = piegesNeg(t, v, s, a);
      const choisis: Piege[] =
        level === 1
          ? [at(pieges, 0), [composeAu(t, v, s), 'La phrase est restée positive : il manque la négation.']]
          : pieges.slice(0, 3);
      const { answer, traps } = choice(
        rng,
        bon,
        choisis.map(([gv, why]) => ({ label: phrase(s, v, gv), why })),
      );
      return {
        prompt: `${consigne(a)} : « ${phrase(s, v, composeAu(t, v, s))} » Quelle phrase est juste ?`,
        answer,
        traps,
        hint: 'Trouve l’auxiliaire. Les deux mots de la négation l’entourent.',
        steps: [...etapesNeg(t, v, s, a), `On écrit **${bon}**`],
      };
    }
    case 3:
      return ecrireNeg(
        t,
        rng.pick(REGULIERS_AVOIR),
        rng.pick(SANS_JE),
        'pas',
        'Écris tout le verbe : la négation entoure l’auxiliaire.',
      );
    case 4: {
      const v = rng.pick(IRREGULIERS_CITES);
      return ecrireNeg(
        t,
        v,
        sujetPour(rng, v, TOUS_SANS_JE),
        rng.pick(['jamais', 'plus'] as const),
        'Trouve l’auxiliaire, puis entoure-le. Attention : n’ devant une voyelle.',
      );
    }
    default: {
      const temps = rng.shuffle<Compose>(['passé composé', 'passé composé', 'plus-que-parfait', 'plus-que-parfait']);
      const adverbes = rng.shuffle([...ADVERBES, rng.pick(ADVERBES)]);
      const verbes = rng.shuffle([...pickN(rng, REGULIERS_AVOIR, 2), ...pickN(rng, IRREGULIERS_CITES, 2)]);
      const sujets = sujetsRecit(rng, 4);
      return texteATrous(
        'Lis le texte. Écris chaque verbe au temps demandé, à la forme négative demandée.',
        'Une journée sans chance',
        verbes.map((v, i) => {
          const tl = at(temps, i);
          const a = at(adverbes, i);
          const s = auxiliaireDe(v) === 'être' ? rng.pick(SUJETS_ACCORDES) : at(sujets, i);
          const attendu = negatifAu(tl, v, s, a);
          return {
            texte: `${s.texte} … (${v}, ${tl}, ne … ${a}) ${FINS[v]}.`,
            attendu,
            pourquoi: [
              ...remplacer(s),
              `Au ${tl}, l’auxiliaire est « ${auxiliaireAu(tl, v, s.personne)} ».`,
              ...accordDe(v, s),
              `La négation l’entoure : « ${attendu} ».`,
            ].join(' '),
          };
        }),
        'Conjugue d’abord au bon temps, puis entoure l’auxiliaire avec la négation.',
        [DEF_PC_PQP, DEF_NEG],
      );
    }
  }
}

// ───────────────────────── 4. Marque de temps et marque de personne ─────────────────────────

type TempsMarque = 'imparfait' | 'futur';
type Cible = 'temps' | 'personne';

const PERSONNE_IMPARFAIT: Record<Personne, string> = { je: 's', tu: 's', il: 't', nous: 'ons', vous: 'ez', ils: 'ent' };
const PERSONNE_FUTUR: Record<Personne, string> = { je: 'ai', tu: 'as', il: 'a', nous: 'ons', vous: 'ez', ils: 'ont' };

/** Verbes décomposés : ceux du CM1, sauf « manger » (le e après le g n'est ni radical ni marque). */
const VERBES_MARQUES: readonly VerbeTemps[] = [...REGULIERS, ...IRREGULIERS_CITES].filter((v) => v !== 'manger');
/** Au futur, seulement nous, vous, ils : les marques de personne s'y distinguent clairement de la marque -ai-. */
const PERSONNES_FUTUR: readonly Personne[] = ['nous', 'vous', 'ils'];

export interface Decoupe {
  readonly forme: string;
  readonly radical: string;
  readonly temps: string;
  readonly personne: string;
}

/** Radical, marque de temps, marque de personne d'une forme de l'imparfait ou du futur. */
export const decoupe = (t: TempsMarque, v: VerbeTemps, p: Personne): Decoupe => {
  const f = conjugue(t, v, p);
  const temps = t === 'futur' ? 'r' : p === 'nous' || p === 'vous' ? 'i' : 'ai';
  const personne = t === 'futur' ? PERSONNE_FUTUR[p] : PERSONNE_IMPARFAIT[p];
  return { forme: f, radical: f.slice(0, f.length - temps.length - personne.length), temps, personne };
};

const avecTirets = (m: string) => [m, `-${m}-`, `-${m}`, `${m}-`];
const finale = (m: string) => [m, `-${m}`];

const SUJET_PRONOM = (p: Personne) =>
  at(
    SUJETS.filter((s) => s.personne === p),
    0,
  ).texte;

const DEF_MARQUES =
  'Après le radical, la terminaison : d’abord la marque de temps, puis la marque de personne. Ils chant-ai-ent.';
const DEF_TEMPS = 'Marques de temps : -ai- ou -i- pour l’imparfait, -r- pour le futur.';

const tirerForme = (rng: Rng, verbes: readonly VerbeTemps[]) => {
  const t = rng.pick<TempsMarque>(['imparfait', 'futur']);
  const v = rng.pick(verbes);
  const p = rng.pick(t === 'futur' ? PERSONNES_FUTUR : PERSONNES);
  return { t, v, p, d: decoupe(t, v, p), texte: avecSujet(SUJET_PRONOM(p), conjugue(t, v, p)) };
};

const expliquer = (t: TempsMarque, d: Decoupe): Rich[] => [
  `« ${d.forme} » est ${t === 'futur' ? 'au futur' : 'à l’imparfait'}.`,
  t === 'futur'
    ? `La marque du futur est « -r- » : ${d.forme.slice(0, -d.personne.length - 1)}-r-${d.personne}.`
    : `Radical « ${d.radical}- », marque de temps « -${d.temps}- », marque de personne « -${d.personne} ».`,
];

function marquesDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const { t, d, texte } = tirerForme(rng, REGULIERS);
      const autre = t === 'futur' ? '-ai-' : '-r-';
      const { answer, traps } = choice(rng, `-${d.temps}-`, [
        { label: `-${d.personne}`, why: `« -${d.personne} » est la marque de personne : elle change avec le sujet.` },
        {
          label: autre,
          why: `« ${autre} » est la marque ${t === 'futur' ? 'de l’imparfait' : 'du futur'}. Ici, le verbe est ${
            t === 'futur' ? 'au futur' : 'à l’imparfait'
          }.`,
        },
      ]);
      return {
        prompt: `Dans « ${texte} », quelle est la marque de temps ?`,
        answer,
        traps,
        hint: 'La marque de temps dit quand. Elle se place juste avant la marque de personne.',
        steps: [DEF_MARQUES, DEF_TEMPS, ...expliquer(t, d), `La marque de temps est **-${d.temps}-**.`],
      };
    }
    case 2:
    case 3: {
      const { t, v, d, texte } = tirerForme(rng, level === 2 ? REGULIERS : VERBES_MARQUES);
      const cible = rng.pick<Cible>(['temps', 'personne']);
      const marque = cible === 'temps' ? `-${d.temps}-` : `-${d.personne}`;
      const pieges: Piege[] = [
        cible === 'temps'
          ? [`-${d.personne}`, `« -${d.personne} » est la marque de personne : elle change avec le sujet.`]
          : [`-${d.temps}-`, `« -${d.temps}- » est la marque de temps : elle dit quand.`],
        [
          `-${d.temps}${d.personne}`,
          `« -${d.temps}${d.personne} » est toute la terminaison : elle contient deux marques. Garde seulement la marque de ${cible}.`,
        ],
        t === 'futur'
          ? ['-ai-', '« -ai- » est la marque de l’imparfait. Ici, le verbe est au futur.']
          : [`${d.radical}-`, `« ${d.radical}- » est le radical de « ${v} » : il porte le sens du verbe.`],
      ];
      const etapes = [DEF_MARQUES, DEF_TEMPS, ...expliquer(t, d), `La marque de ${cible} est **${marque}**.`];
      if (level === 2) {
        const { answer, traps } = choice(
          rng,
          marque,
          pieges.map(([label, why]) => ({ label, why })),
        );
        return {
          prompt: `Dans « ${texte} », quelle est la marque de ${cible} ?`,
          answer,
          traps,
          hint: 'Sépare d’abord le radical, puis coupe la terminaison en deux.',
          steps: etapes,
        };
      }
      const accepted = cible === 'temps' ? avecTirets(d.temps) : finale(d.personne);
      return {
        prompt: `Écris la marque de ${cible} du verbe dans « ${texte} ».`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          pieges.flatMap(([f, why]) => [[f.replace(/^-|-$/g, ''), why] as const]),
        ),
        hint:
          cible === 'temps'
            ? 'Imparfait : -ai- ou -i-. Futur : -r-.'
            : 'La marque de personne est tout à la fin du verbe.',
        steps: etapes,
      };
    }
    case 4: {
      const v = rng.pick([...IRREGULIERS_CITES, ...REGULIERS_IR]);
      const p = rng.pick(PERSONNES);
      const d = decoupe('imparfait', v, p);
      const texte = avecSujet(SUJET_PRONOM(p), d.forme);
      return {
        prompt: `Découpe « ${texte} » en trois parties : radical, marque de temps, marque de personne.`,
        answer: {
          kind: 'cloze',
          parts: ['Radical : ', ' ; marque de temps : ', ' ; marque de personne : ', '.'],
          blanks: [
            { mode: 'text', accepted: [d.radical, `${d.radical}-`] },
            { mode: 'text', accepted: avecTirets(d.temps) },
            { mode: 'text', accepted: finale(d.personne) },
          ],
        },
        hint: 'Commence par la fin : la marque de personne. Puis la marque de l’imparfait.',
        steps: [
          DEF_MARQUES,
          `La marque de personne de l’imparfait avec « ${PRONOMS[p]} » est « -${d.personne} ».`,
          `Avant elle, la marque de l’imparfait : « -${d.temps}- ».`,
          `Ce qui reste est le radical : **${d.radical}-${d.temps}-${d.personne}**.`,
        ],
      };
    }
    default: {
      const temps = rng.shuffle<TempsMarque>(['imparfait', 'imparfait', 'futur', 'futur']);
      const verbes = pickN(rng, VERBES_MARQUES, 4);
      const sujets = sujetsRecit(rng, 4);
      const DEBUTS: Record<TempsMarque, readonly string[]> = {
        imparfait: ['Autrefois,', 'L’an dernier,', 'Avant,'],
        futur: ['Demain,', 'Bientôt,', 'L’an prochain,'],
      };
      return texteATrous(
        'Lis le texte. Pour chaque ligne, écris la marque de temps du verbe conjugué.',
        'Hier et demain',
        verbes.map((v, i) => {
          const t = at(temps, i);
          const s =
            t === 'futur' ? rng.pick(TOUS_SANS_JE.filter((x) => PERSONNES_FUTUR.includes(x.personne))) : at(sujets, i);
          const d = decoupe(t, v, s.personne);
          return {
            texte: `${rng.pick(DEBUTS[t])} ${lowerFirst(s.texte)} ${d.forme} ${FINS[v]}.`,
            attendu: d.temps,
            pourquoi: [...remplacer(s), ...expliquer(t, d), `Réponse : « -${d.temps}- ».`].join(' '),
          };
        }),
        'Trouve le verbe conjugué. Puis cherche -ai-, -i- ou -r- juste avant la fin.',
        [DEF_MARQUES, DEF_TEMPS],
      );
    }
  }
}

// ───────────────────────── 5. Variations du radical ─────────────────────────

const AU_3: Record<Temps3, string> = {
  présent: 'au présent',
  imparfait: 'à l’imparfait',
  futur: 'au futur',
  'passé simple': 'au passé simple',
};

const REGLE_1: Record<Famille1, string> = {
  double: 'Appeler, jeter : devant un e muet, on double la consonne (j’appelle, j’appellerai).',
  accent: 'Acheter, lever, mener… : devant un e muet, le e devient è (j’achète, j’achèterai).',
  yer: 'Verbes en -yer : devant un e muet, le y devient i (je nettoie, je nettoierai).',
  cer: 'Verbes en -cer : devant a ou o, le c prend une cédille (je lançais), pas devant i (nous lancions).',
  ger: 'Verbes en -ger : devant a ou o, on garde un e après le g (je nageais), pas devant i (nous nagions).',
};

const LE_3: Record<Temps3, string> = {
  présent: 'le présent',
  imparfait: 'l’imparfait',
  futur: 'le futur',
  'passé simple': 'le passé simple',
};

const temps1 = (v: Verbe1): Temps1 => (['cer', 'ger'].includes(FAMILLE_1[v]) ? 'imparfait' : 'futur');

/** Erreurs typiques d'un verbe du 1er groupe dont le radical varie. */
function pieges1(v: Verbe1, p: Personne): Piege[] {
  const t = temps1(v);
  const bon = conjugue1(t, v, p);
  const out: Piege[] = [];
  switch (FAMILLE_1[v]) {
    case 'double':
      out.push(
        [bon.replace(/(ll|tt)/, (m) => m.charAt(0)), 'Devant un e muet, la consonne se double : ll ou tt.'],
        [
          bon.replace(/e(ll|tt)/, (m) => `è${m.charAt(1)}`),
          'Pour appeler et jeter, on double la consonne. Pas d’accent.',
        ],
      );
      break;
    case 'accent':
      out.push([bon.replace('è', 'e'), 'Devant un e muet, le e du radical devient è.']);
      out.push(
        /è[lt]/.test(bon)
          ? [bon.replace(/è([lt])/, 'e$1$1'), `Pour « ${v} », on met un accent grave. On ne double pas la consonne.`]
          : [bon.replace('è', 'é'), 'L’accent est grave (è), pas aigu (é).'],
      );
      break;
    case 'yer':
      out.push([bon.replace('ie', 'ye'), 'Devant un e muet, le y devient i.']);
      break;
    case 'cer':
      out.push(
        bon.includes('ç')
          ? [bon.replace('ç', 'c'), 'Devant a, le c prend une cédille : le son reste « s ».']
          : [bon.replace(/c(i)/, 'ç$1'), 'Devant i, pas de cédille : le c se prononce déjà « s ».'],
      );
      break;
    case 'ger':
      out.push(
        bon.includes('gea')
          ? [bon.replace('gea', 'ga'), 'Devant a, garde un e après le g : le son reste « j ».']
          : [bon.replace(/g(i)/, 'ge$1'), 'Devant i, pas de e : le g se prononce déjà « j ».'],
      );
      break;
  }
  const pr = forme(v, p);
  if (pr !== bon) out.push([pr, `« ${pr} » est au présent. On demande ${t === 'futur' ? 'le futur' : 'l’imparfait'}.`]);
  for (const q of PERSONNES) {
    const f = conjugue1(t, v, q);
    if (f !== bon) out.push([f, `« ${f} » ne va pas avec ce sujet.`]);
  }
  return out;
}

const FUTUR_P: Record<Personne, string> = PERSONNE_FUTUR;

/** Erreurs typiques d'un verbe du 3e groupe à un temps donné. */
function pieges3(v: Verbe3, t: Temps3, p: Personne): Piege[] {
  const bon = conjugue3(t, v, p);
  const out: Piege[] = [];
  if (t === 'présent')
    for (const [x, q, f] of PIEGES_IRREGULIERS)
      if (x === v && q === p) out.push([f, `Le radical de « ${v} » change au présent : ${bon}.`]);
  if (t === 'futur') {
    out.push([`${v.replace(/e$/, '')}${FUTUR_P[p]}`, `Au futur, « ${v} » change de radical : ${bon}.`]);
    const fautif = p === 'il' ? FUTURS_FAUTIFS[v] : undefined;
    if (fautif) out.push([fautif, `Au futur, « ${v} » change de radical : ${bon}.`]);
  }
  if (t === 'passé simple' && (p === 'il' || p === 'ils')) {
    const f = VOYELLE_FAUTIVE[v][p === 'il' ? 0 : 1];
    out.push([f, `Au passé simple, « ${v} » a un radical à part : ${bon}.`]);
  }
  for (const autre of TEMPS_3) {
    const f = conjugue3(autre, v, p);
    if (autre !== t && f !== bon) out.push([f, `« ${f} » est ${AU_3[autre]}. On demande ${LE_3[t]}.`]);
  }
  for (const q of PERSONNES) {
    const f = conjugue3(t, v, q);
    if (f !== bon) out.push([f, `« ${f} » ne va pas avec ce sujet.`]);
  }
  return out;
}

/** Une ligne du récit du niveau 5 : un verbe du 1er groupe ou du 3e groupe, au temps demandé. */
type LigneRadical =
  | { readonly groupe: 1; readonly v: Verbe1; readonly t: Temps1 }
  | { readonly groupe: 3; readonly v: Verbe3; readonly t: Temps3 };

const DEF_RADICAL = 'Le radical porte le sens du verbe. Chez certains verbes, il change selon le temps ou la personne.';

const voyelle = /^[aàâeéèêiîoôuûh]/;
const sansElision = (forme1: string) => (s: Sujet) => s.personne !== 'je' || !voyelle.test(forme1);

function radicalDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const x = rng.pick(FORMES_A_RATTACHER);
      const f = avecSujet(SUJET_PRONOM(x.p), conjugue3(x.t, x.v, x.p));
      const { answer, traps } = choice(
        rng,
        x.v,
        x.faux.map((faux) => ({
          label: faux,
          why: `« ${faux} » ne se conjugue pas ainsi. « ${f} » vient de « ${x.v} » : son radical change.`,
        })),
      );
      return {
        prompt: `« ${f} » : quel est l’infinitif de ce verbe ?`,
        answer,
        traps,
        hint: 'Conjugue dans ta tête chaque verbe proposé : lequel peut donner cette forme ?',
        steps: [DEF_RADICAL, `« ${f} » est ${AU_3[x.t]}. Son infinitif est **${x.v}**.`],
      };
    }
    case 2: {
      const v = rng.pick(VERBES_3);
      const p = rng.pick(PERSONNES.filter((q) => q !== 'tu'));
      // Trois temps aux formes toutes différentes (« il dit » est au présent comme au passé simple).
      const triples = TEMPS_3.map((sans) => TEMPS_3.filter((t) => t !== sans)).filter(
        (tr) => new Set(tr.map((t) => conjugue3(t, v, p))).size === 3,
      );
      const lignes = rng.shuffle(rng.pick(triples));
      const gauche = lignes.map((t) => avecSujet(SUJET_PRONOM(p), conjugue3(t, v, p)));
      const { right, pairs } = appariement(rng, lignes);
      return {
        prompt: `Associe chaque forme du verbe « ${v} » (${gauche.join(', ')}) à son temps.`,
        answer: { kind: 'match', left: gauche, right, pairs },
        hint: 'Regarde le radical et la fin : -ai- ou -i- (imparfait), -r- (futur)…',
        steps: [
          DEF_RADICAL,
          DEF_TEMPS,
          `Réponses : **${lignes.map((t, i) => `${at(gauche, i)} → ${t}`).join(', ')}**.`,
        ],
      };
    }
    case 3: {
      const v = rng.pick(VERBES_1);
      const t = temps1(v);
      const s = rng.pick(SUJETS.filter(sansElision(conjugue1(t, v, 'je'))));
      const bon = conjugue1(t, v, s.personne);
      const accepted = [bon, avecSujet(s.texte, bon)];
      return {
        prompt: `Écris le verbe « ${v} » ${t === 'futur' ? 'au futur' : 'à l’imparfait'} : « ${s.texte} … ${FINS_1[v]}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, pieges1(v, s.personne)),
        hint: 'Dis le verbe à voix haute : le son doit rester juste. Que devient le radical ?',
        steps: [DEF_RADICAL, REGLE_1[FAMILLE_1[v]], `On écrit **${avecSujet(s.texte, bon)} ${FINS_1[v]}.**`],
      };
    }
    case 4: {
      const v = rng.pick(HUIT_3);
      const t = rng.pick(TEMPS_3);
      const s = rng.pick([...SUJETS, ...SUJETS_GROUPES].filter(sansElision(conjugue3(t, v, 'je'))));
      const bon = conjugue3(t, v, s.personne);
      const accepted = [bon, avecSujet(s.texte, bon)];
      return {
        prompt: `Écris le verbe « ${v} » ${AU_3[t]} : « ${s.texte} … ${FINS[v]}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, pieges3(v, t, s.personne)),
        hint: 'Ce verbe change de radical. Pense à sa forme avec « il » à ce temps.',
        steps: [
          DEF_RADICAL,
          ...remplacer(s),
          `Compare avec « il » : ${TEMPS_3.map((x) => `${conjugue3(x, v, 'il')} (${x})`).join(', ')}.`,
          `« ${v} » ${AU_3[t]} avec « ${PRONOMS[s.personne]} » : ${bon}.`,
          `On écrit **${avecSujet(s.texte, bon)} ${FINS[v]}.**`,
        ],
      };
    }
    default: {
      const DEBUTS: Record<Temps3, string> = {
        présent: 'Aujourd’hui,',
        imparfait: 'Autrefois,',
        futur: 'Demain,',
        'passé simple': 'Ce jour-là,',
      };
      const sujets = sujetsRecit(rng, 4);
      const lignes = rng.shuffle<LigneRadical>([
        ...pickN(rng, VERBES_1, 2).map((v): LigneRadical => ({ groupe: 1, v, t: temps1(v) })),
        ...pickN(rng, HUIT_3, 2).map((v): LigneRadical => ({ groupe: 3, v, t: rng.pick(TEMPS_3) })),
      ]);
      return texteATrous(
        'Lis le récit. Écris chaque verbe au temps demandé entre parenthèses, ligne par ligne.',
        'Les aventures du club',
        lignes.map((l, i) => {
          const s = at(sujets, i);
          const p = s.personne;
          const attendu = l.groupe === 1 ? conjugue1(l.t, l.v, p) : conjugue3(l.t, l.v, p);
          const fin = l.groupe === 1 ? FINS_1[l.v] : FINS[l.v];
          return {
            texte: `${DEBUTS[l.t]} ${lowerFirst(s.texte)} (${l.v}, ${l.t}) ${fin}.`,
            attendu,
            pourquoi: [
              ...remplacer(s),
              l.groupe === 1 ? REGLE_1[FAMILLE_1[l.v]] : `« ${l.v} » ${AU_3[l.t]} avec « ${PRONOMS[p]} » : ${attendu}.`,
              `On écrit « ${attendu} ».`,
            ].join(' '),
          };
        }),
        'Trouve le sujet, puis le radical du verbe à ce temps. Il peut changer !',
        [DEF_RADICAL],
      );
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
  readonly verbes: readonly Verbe[];
  readonly generate: Skill['generate'];
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: {
    memo: n.memo,
    source: programme(n.factId),
    sources: sourcesTempsComposes([n.factId, ...n.faits], n.verbes),
  },
  generate: n.generate,
});

const pqp = (verbes: readonly VerbeTemps[]) => verbes.map((v) => `plus-que-parfait-${v}`);

export const FCM2_TEMPS_COMPOSES: readonly Skill[] = [
  skill({
    id: 'fcm2-plus-que-parfait',
    title: 'Le plus-que-parfait',
    memo: [
      'Le **plus-que-parfait** est un **temps composé** : deux mots, comme le passé composé.',
      'L’**auxiliaire** avoir ou être est à l’imparfait, puis vient le **participe passé** : j’avais chanté, il était venu.',
      'Avec être, le participe s’accorde avec le sujet : elles étaient venues.',
    ],
    factId: 'tc-a-memoriser',
    faits: [
      'tc-composition',
      'tc-liste',
      'tc-forme',
      'tc-pqp-chante',
      'tc-pqp-parle',
      ...pqp([...REGULIERS, ...IRREGULIERS_CITES]),
    ],
    verbes: [...REGULIERS, ...IRREGULIERS_CITES],
    generate: plusQueParfaitDraft,
  }),
  skill({
    id: 'fcm2-passe-compose-ou-plus-que-parfait',
    title: 'Passé composé ou plus-que-parfait ?',
    memo: [
      'Les deux temps ont un **auxiliaire** et un **participe passé**. Seul l’auxiliaire change !',
      'Auxiliaire au présent : **passé composé** (j’ai chanté). À l’imparfait : **plus-que-parfait** (j’avais chanté).',
    ],
    factId: 'tc-composition',
    faits: [
      'tc-pc-chante',
      'tc-pqp-chante',
      'tc-pc-parle',
      'tc-pqp-parle',
      'tc-liste',
      ...pqp([...REGULIERS, ...IRREGULIERS_CITES]),
    ],
    verbes: [...REGULIERS, ...IRREGULIERS_CITES],
    generate: composeOuPqpDraft,
  }),
  skill({
    id: 'fcm2-temps-composes-negatifs',
    title: 'Les temps composés à la forme négative',
    memo: [
      'À la **forme négative**, ne et l’**adverbe de négation** entourent l’**auxiliaire** : il n’avait pas chanté.',
      'Même place au passé composé et avec jamais ou plus : elle n’est jamais venue.',
      'Devant une voyelle, ne devient n’ : je n’avais pas fini.',
    ],
    factId: 'tc-negation',
    faits: ['tc-ne-auxiliaire', 'tc-ne-elision', 'tc-jamais', 'tc-forme-negative', 'tc-composition'],
    verbes: [...REGULIERS, ...IRREGULIERS_CITES],
    generate: negationDraft,
  }),
  skill({
    id: 'fcm2-marques-temps-personne',
    title: 'Marque de temps et marque de personne',
    memo: [
      'Après le **radical** vient la **terminaison**. Elle cache deux marques : ils chant-ai-ent.',
      'La **marque de temps** dit quand : -ai- ou -i- à l’imparfait, -r- au futur.',
      'La **marque de personne** va avec le sujet : -ons pour nous, -ez pour vous, -ent ou -ont pour ils.',
    ],
    factId: 'tc-marques',
    faits: ['tc-marques-cm1', 'tc-desinence', 'tc-marque-temps', 'tc-marque-personne', 'tc-radicaux-terminaisons'],
    verbes: [...REGULIERS, ...IRREGULIERS_CITES],
    generate: marquesDraft,
  }),
  skill({
    id: 'fcm2-variations-radical',
    title: 'Les variations du radical',
    memo: [
      'Le **radical** porte le sens du verbe. Parfois, il change : je viens, nous venons, je viendrai, il vint.',
      '**Premier groupe** : devant un e muet, j’appelle, j’achète, je nettoie, j’appellerai. Devant a : je lançais, je nageais.',
      'Le **troisième groupe** change souvent de radical : je prends, nous prenons, ils prirent.',
    ],
    factId: 'tc-radical',
    faits: [
      'tc-variations-cm1',
      'tc-deux-radicaux',
      'tc-plusieurs-radicaux',
      'tc-groupe-1',
      ...Object.values(FAIT_FAMILLE),
      'tc-jeter',
      ...VERBES_1.flatMap((v) => [`imparfait-1-${v}`, `futur-1-${v}`]),
    ],
    verbes: [...VERBES_1, ...VERBES_3],
    generate: radicalDraft,
  }),
];
