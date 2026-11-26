import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import {
  DEFINITIONS,
  DERIVES,
  DEUX_DOCUMENTS,
  DEVINETTES,
  DOSSIERS,
  ELEMENTS,
  ENIGMES,
  ENIGMES_PIEGES,
  EXTRAITS,
  GENRES,
  INFOS_A_PRELEVER,
  LONGS_DOCUMENTS,
  LONGS_INFERENCE,
  LONGS_PERSONNAGES,
  LONGS_RECITS,
  MOTIVATIONS,
  MOTS_RARES,
  NARRATEURS_CACHES,
  PAIRES,
  POLYSEMIE,
  QUI_RACONTE,
  QUI_SE_CACHE,
  RECITS_A_CONSTRUIRE,
  RECITS_DANS_LE_DESORDRE,
  RECITS_MOTS,
  REPRISES,
  SUJETS,
  TEXTES_TROMPEURS,
  faitLectureCm2,
  sourcesLectureCm2,
  type Choix,
  type Derive,
  type Extrait,
  type Genre,
  type Mot,
  type Saisie,
  type Suite,
} from './lecture-cm2.donnees.ts';
import { associer, ecrire, ranger, trous } from './lecture-outils.ts';
import { at, document, pickN, textTraps } from './outils.ts';

/**
 * Chapitre « Lire et comprendre » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025), lecture : textes et
 * documents, informations explicites et implicites, mots inconnus, personnages.
 */
const PARTIES: Readonly<Record<string, string>> = {
  'l2-prog-motivations': 'culture littéraire, cours moyen',
  'l2-prog-reprises': 'principes de la lecture au cycle 3',
};
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), ${PARTIES[id] ?? 'CM2'} — « ${faitLectureCm2(id).citation} »`;

const sansPoint = (t: string) => t.replace(/\.$/, '');
/** Une fois sur `n`. */
const unSur = (rng: Rng, n: number) => rng.int(1, n) === 1;

// ───────────────────────── Formes communes ─────────────────────────

/** QCM sur un texte : `n` distracteurs. */
function qcm(
  rng: Rng,
  c: Choix,
  n: 2 | 3,
  { consigne, definition, hint }: { readonly consigne: string; readonly definition: Rich; readonly hint: string },
): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    c.bon,
    c.faux.slice(0, n).map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: `${consigne} ${c.question}`,
    figure: document(c.titre, c.lignes),
    answer,
    traps,
    hint,
    steps: [definition, c.preuve, `La réponse est **${sansPoint(c.bon)}**.`],
    targetSeconds: 60,
  };
}

/** Un piège écrit avec article reste expliqué quand l’élève écrit le mot seul. */
const avecSansArticle = (pieges: Saisie['pieges']): Saisie['pieges'] =>
  pieges.flatMap(([texte, why]) => {
    const seul = texte.replace(/^(?:le |la |les |l’|un |une |des |son )/, '');
    return seul === texte ? [[texte, why] as const] : [[texte, why] as const, [seul, why] as const];
  });

const sansAccent = (c: string) => c.normalize('NFD').replace(/\p{M}/gu, '');
/** Une écriture et toutes celles où des accents manquent (un, plusieurs ou tous). */
const ecritures = (texte: string): string[] =>
  Array.from(texte).reduce<string[]>(
    (debuts, c) => debuts.flatMap((d) => [...new Set([c, sansAccent(c)])].map((x) => d + x)),
    [''],
  );
/** Le chapitre ne porte pas sur les accents : ils sont facultatifs dans toutes les saisies. */
const tolerer = (accepted: readonly string[]): string[] => [...new Set(accepted.flatMap(ecritures))];

function saisir(s: Saisie, consigne: string, etapes: readonly Rich[], hint: string): QuestionDraft {
  return ecrire(tolerer(s.accepted), avecSansArticle(s.pieges), {
    prompt: `${consigne} ${s.question}`,
    figure: document(s.titre, s.lignes),
    hint,
    steps: [...etapes, s.preuve, `La réponse est **${at(s.accepted, 0)}**.`],
  });
}

const ordonner = (rng: Rng, s: Suite, prompt: string, etapes: readonly Rich[]): QuestionDraft =>
  ranger(rng, s.ordre, {
    prompt: `${prompt} (${s.titre})`,
    ...(s.lignes.length > 0 ? { figure: document(s.titre, s.lignes) } : {}),
    hint: 'Cherche d’abord le tout premier fait. Les mots de temps t’aident.',
    steps: [...etapes, s.preuve, `L’ordre juste : **${s.ordre.map(sansPoint).join(' ; ')}**.`],
  });

// ───────────────────────── 1. Texte narratif ─────────────────────────

const DEF_NARRATIF = 'Un **texte narratif** raconte : des personnages vivent des événements.';
const ACTIONS: Readonly<Record<Genre, string>> = {
  recit: 'Il raconte une histoire.',
  documentaire: 'Il informe sur un sujet réel.',
  theatre: 'Il fait parler des personnages sur scène.',
  poeme: 'Il joue avec des vers.',
};
const GENRES_TOUS: readonly Genre[] = ['recit', 'poeme', 'theatre', 'documentaire'];

function queFait(rng: Rng, x: Extrait): QuestionDraft {
  const autres = (['recit', 'documentaire', 'theatre'] as const).filter((g) => g !== x.genre);
  const { answer, traps } = choice(
    rng,
    ACTIONS[x.genre],
    autres.map((g) => ({ label: ACTIONS[g], why: `Non : ça, c’est le cas quand ${GENRES[g].critere}.` })),
  );
  return {
    prompt: 'Lis ce texte. Que fait-il ?',
    figure: document('Le texte', x.lignes),
    answer,
    traps,
    hint: 'Demande-toi : y a-t-il une aventure, des informations ou des répliques ?',
    steps: [DEF_NARRATIF, `Ici, ${GENRES[x.genre].critere}.`, `Réponse : **${sansPoint(ACTIONS[x.genre])}**.`],
    targetSeconds: 45,
  };
}

function quelGenre(rng: Rng, x: Extrait): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    GENRES[x.genre].nom,
    GENRES_TOUS.filter((g) => g !== x.genre).map((g) => ({
      label: GENRES[g].nom,
      why: `Non. Voici comment on reconnaît ${GENRES[g].nom} : ${GENRES[g].critere}.`,
    })),
  );
  return {
    prompt: 'Observe bien la forme du texte. De quel genre est-il ?',
    figure: document('Le texte', x.lignes),
    answer,
    traps,
    hint: 'Regarde la mise en page : vers, noms avant les paroles, ou phrases à la suite ?',
    steps: [
      'Le genre se reconnaît à des critères.',
      `Ici, ${GENRES[x.genre].critere}.`,
      `C’est **${GENRES[x.genre].nom}**.`,
    ],
    targetSeconds: 45,
  };
}

function associerGenres(rng: Rng): QuestionDraft {
  const choisis = pickN(rng, GENRES_TOUS, 3).map((g) => rng.pick(EXTRAITS.filter((x) => x.genre === g)));
  return associer(
    rng,
    `Associe chaque extrait à son genre. Débuts : ${choisis.map((x) => `« ${x.lignes[0]} »`).join(' ')}`,
    choisis.map((x) => [x.lignes.join(' / '), GENRES[x.genre].nom]),
    'Cherche les vers, les répliques ou les événements.',
    choisis.map((x) => `« ${x.lignes[0]} » : ${GENRES[x.genre].critere}.`),
  );
}

const SAISIE_GENRE: Readonly<Record<'recit' | 'documentaire', readonly string[]>> = {
  recit: ['récit', 'un récit', 'recit', 'un recit', 'texte narratif', 'un texte narratif', 'narratif'],
  documentaire: ['documentaire', 'un documentaire', 'texte documentaire', 'un texte documentaire'],
};

function genreTrompeur(rng: Rng): QuestionDraft {
  const t = rng.pick(TEXTES_TROMPEURS);
  const autre = t.genre === 'recit' ? 'documentaire' : 'recit';
  return ecrire(
    tolerer(SAISIE_GENRE[t.genre]),
    avecSansArticle([
      [GENRES[autre].nom, `Non : relis la fin. Un seul événement vécu, ou des faits qui valent toujours ?`],
      ['un poème', 'Le texte n’est pas écrit en vers.'],
      ['une pièce de théâtre', 'Aucun nom de personnage ne précède des paroles.'],
    ]),
    {
      prompt: 'Attention, ce texte peut tromper ! Écris son genre : récit ou documentaire.',
      figure: document(t.titre, t.lignes),
      hint: 'Un événement unique arrive-t-il à quelqu’un ?',
      steps: [DEF_NARRATIF, t.preuve, `C’est **${GENRES[t.genre].nom}**.`],
    },
  );
}

function narratifDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return queFait(rng, rng.pick(EXTRAITS.filter((x) => x.genre !== 'poeme')));
    case 2:
      return unSur(rng, 3) ? associerGenres(rng) : quelGenre(rng, rng.pick(EXTRAITS));
    case 3:
      return ordonner(rng, rng.pick(RECITS_A_CONSTRUIRE), 'Construis un récit : remets les phrases dans l’ordre.', [
        DEF_NARRATIF,
        'Dans un récit, les faits s’enchaînent : début, événements, fin.',
      ]);
    case 4:
      return unSur(rng, 2)
        ? genreTrompeur(rng)
        : ordonner(
            rng,
            rng.pick(RECITS_DANS_LE_DESORDRE),
            'Le récit ne suit pas l’ordre ! Range les faits du premier au dernier.',
            ['Un récit peut revenir en arrière : « la veille », « auparavant ».'],
          );
    default: {
      const t = rng.pick(LONGS_RECITS);
      return trous(rng, t, t.trous, {
        prompt: 'Lis ce long récit. Complète chaque phrase.',
        hint: 'Relis le texte : qui agit, que se passe-t-il, comment ça finit ?',
        etapes: [DEF_NARRATIF],
      });
    }
  }
}

// ───────────────────────── 2. Texte documentaire ─────────────────────────

const DEF_DOC = 'Un **texte documentaire** donne des informations sur le réel.';
const DEF_COMPOSITE = 'Un **document composite** réunit plusieurs éléments : titre, texte, schéma, légende, source.';

function associerSousTitres(rng: Rng): QuestionDraft {
  const d = rng.pick(DOSSIERS);
  return associer(
    rng,
    `Dossier « ${d.sujet} ». Associe chaque phrase à son sous-titre.`,
    d.paragraphes.map((p) => [p.phrase, p.titre]),
    'Quelle question ou quel thème la phrase traite-t-elle ?',
    [DEF_DOC, ...d.paragraphes.map((p) => `« ${p.phrase} » va sous « ${p.titre} ».`)],
  );
}

function documentaireDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return qcm(rng, rng.pick(SUJETS), 2, {
        consigne: 'Lis le document.',
        definition: DEF_DOC,
        hint: 'Quel mot ou quel animal revient dans les phrases ?',
      });
    case 2:
      return associerSousTitres(rng);
    case 3:
      return saisir(
        rng.pick(INFOS_A_PRELEVER),
        'Cherche l’information dans le document.',
        [DEF_DOC, 'On repère les mots de la question, puis on lit la bonne ligne.'],
        'Repère le mot de la question dans une ligne.',
      );
    case 4: {
      if (unSur(rng, 3)) {
        return associer(
          rng,
          'Associe chaque élément d’un document à son rôle.',
          ELEMENTS,
          'Imagine un document sur les volcans : à quoi sert chaque partie ?',
          [DEF_COMPOSITE, ...ELEMENTS.map(([e, r]) => `« ${e} » ${r}.`)],
        );
      }
      return saisir(
        rng.pick(DEUX_DOCUMENTS),
        'Rapproche les deux documents.',
        [DEF_COMPOSITE, 'La réponse naît de l’union des deux informations.'],
        'Quel mot est commun aux deux documents ?',
      );
    }
    default: {
      const t = rng.pick(LONGS_DOCUMENTS);
      return trous(rng, t, t.trous, {
        prompt: 'Lis ce document composite en entier. Complète chaque phrase.',
        hint: 'Chaque réponse se trouve dans une ligne du document, ou se déduit de plusieurs.',
        etapes: [DEF_COMPOSITE],
      });
    }
  }
}

// ───────────────────────── 3. Inférences ─────────────────────────

const DEF_INFERENCE = 'Faire une **inférence**, c’est comprendre ce que le texte ne dit pas, grâce à des **indices**.';
const indices = (e: Saisie): Saisie => ({ ...e, preuve: `Indices : ${e.preuve}.` });

function apparierPhrases(rng: Rng, n: 3 | 5, prompt: string): QuestionDraft {
  const paires = pickN(rng, PAIRES, n);
  return associer(
    rng,
    `${prompt} Phrases : ${paires.map(([p]) => p).join(' ')}`,
    paires,
    'Pour chaque phrase, demande-toi : qu’est-ce que cela montre ?',
    [DEF_INFERENCE, ...paires.map(([p, d]) => `« ${p} » → ${d}`)],
  );
}

function inferenceDraft(rng: Rng, level: Level): QuestionDraft {
  const hint = 'Relie les indices à ce que tu connais.';
  switch (level) {
    case 1:
      return qcm(rng, rng.pick(DEVINETTES), 2, {
        consigne: 'Lis comme un détective.',
        definition: DEF_INFERENCE,
        hint,
      });
    case 2:
      return unSur(rng, 2)
        ? apparierPhrases(rng, 3, 'Associe chaque phrase à ce qu’elle laisse comprendre.')
        : qcm(rng, rng.pick(DEVINETTES), 3, { consigne: 'Lis entre les lignes.', definition: DEF_INFERENCE, hint });
    case 3:
      return saisir(indices(rng.pick(ENIGMES)), 'À toi de deviner et d’écrire.', [DEF_INFERENCE], hint);
    case 4:
      return unSur(rng, 2)
        ? apparierPhrases(rng, 5, 'Cinq indices à démêler ! Associe chaque phrase à sa déduction.')
        : saisir(
            indices(rng.pick(ENIGMES_PIEGES)),
            'Gare à la fausse piste !',
            [DEF_INFERENCE],
            'Un détail trompe : compare tous les indices.',
          );
    default: {
      const t = rng.pick(LONGS_INFERENCE);
      return trous(rng, t, t.trous, {
        prompt: 'Lis cette histoire en entier. Complète avec ce que tu déduis.',
        hint: 'Plusieurs lignes se complètent : relie-les.',
        etapes: [DEF_INFERENCE],
      });
    }
  }
}

// ───────────────────────── 4. Sens d'un mot ─────────────────────────

const DEF_CONTEXTE = 'Le **contexte**, ce sont les mots autour : ils aident à comprendre un mot.';
const DEF_POLYSEMIE = 'Un **mot polysémique** a plusieurs sens : le contexte choisit le bon.';
const MOTS_FACILES = MOTS_RARES.filter((m) =>
  ['pénombre', 'vacarme', 'embarcation', 'murmure', 'dérobé'].includes(m.mot),
);
const explique = (m: Mot, indice = m.indice) => `Ici, « ${m.mot} » veut dire **${m.sens}**. Indices : ${indice}.`;

/** Autres écritures justes d'un mot du texte : avec article, ou à l'infinitif. */
const VARIANTES: Readonly<Record<string, readonly string[]>> = {
  pénombre: ['la pénombre', 'une pénombre'],
  récif: ['un récif', 'le récif'],
  embarcation: ['une embarcation', 'l’embarcation', 'petite embarcation', 'une petite embarcation'],
  vacarme: ['un vacarme', 'le vacarme', 'quel vacarme'],
  chancelle: ['chanceler'],
  arpente: ['arpenter'],
  hisse: ['hisser'],
  épie: ['épier'],
  murmure: ['murmurer'],
  scrute: ['scruter'],
  dérobé: ['a dérobé', 'dérober'],
};

function sensChoix(rng: Rng, m: Mot, n: 2 | 3, prompt: string): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    m.sens,
    m.faux.slice(0, n).map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: `${prompt} Dans ce texte, que veut dire « ${m.mot} » ?`,
    figure: document('Dans le texte', m.lignes),
    answer,
    traps,
    hint: 'Essaie chaque proposition à la place du mot. Laquelle va avec les mots autour ?',
    steps: [n === 3 ? DEF_POLYSEMIE : DEF_CONTEXTE, explique(m), `La bonne réponse est **${m.sens}**.`],
    targetSeconds: 45,
  };
}

function apparierSens(rng: Rng): QuestionDraft {
  const trois = pickN(rng, POLYSEMIE, 3);
  return associer(
    rng,
    `Mots à plusieurs sens ! Associe chaque phrase au sens du mot en jeu. Phrases : ${trois.map((m) => m.lignes[0]).join(' ')}`,
    trois.map((m) => [m.lignes.join(' '), m.sens]),
    'Lis la phrase entière avant de choisir.',
    [DEF_POLYSEMIE, ...trois.map((m) => explique(m))],
  );
}

/** Mots du texte qui ne sont pas la réponse : les plus longs (pièges de recopie). */
const autresMots = (m: Mot): string[] =>
  [...new Set(m.lignes.join(' ').match(/[\p{L}]{6,}/gu) ?? [])]
    .filter((w) => w.toLowerCase() !== m.mot.toLowerCase())
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);

function retrouver(m: Mot): QuestionDraft {
  const accepted = tolerer([m.mot, ...(VARIANTES[m.mot] ?? [])]);
  return {
    prompt: `Écris le mot du texte qui veut dire : « ${m.sens} ».`,
    figure: document('Dans le texte', m.lignes),
    answer: { kind: 'text', accepted },
    traps: textTraps(
      accepted,
      autresMots(m).map((w) => [w, `« ${w} » est dans le texte, mais il ne veut pas dire « ${m.sens} ».`] as const),
    ),
    hint: 'Essaie chaque mot du texte à la place du sens demandé.',
    steps: [DEF_CONTEXTE, explique(m), `Le mot à écrire est **${m.mot}**.`],
    targetSeconds: 60,
  };
}

const DEF_PREFIXE = 'Un **préfixe** se place devant un mot et change son sens : il fabrique un nouveau mot.';

function fabriquer(d: Derive): QuestionDraft {
  const [premiere = '', trou = ''] = d.lignes;
  // « illisible », « immangeable » : la lettre doublée est souvent oubliée.
  const simple = d.mot.startsWith('in') ? [] : [d.mot.charAt(0) + d.mot.slice(2)];
  return ecrire(
    tolerer([d.mot]),
    [
      [d.base, `« ${d.base} » dit le contraire : il manque le préfixe qui veut dire « ne… pas ».`],
      [`in${d.base}`, 'Devant certaines lettres, le préfixe « in- » change d’écriture.'],
      ...simple.map((x) => [x, 'Il manque une lettre : garde la lettre doublée.'] as const),
      [`dé${d.base}`, 'Le préfixe « dé- » ne s’emploie pas ici. Cherche celui qui dit « ne… pas ».'],
    ],
    {
      prompt: `Fabrique un mot à partir de « ${d.base} » : il veut dire « ${d.sens} ». Complète le texte et écris-le.`,
      figure: document('Le mot à fabriquer', [premiere, trou.replace(d.mot, '…')]),
      hint: 'Ajoute devant le mot un préfixe qui veut dire « ne… pas ».',
      steps: [
        DEF_PREFIXE,
        `Le préfixe « in- » dit le contraire ; il s’écrit parfois « il- » ou « im- ». On part de « ${d.base} ».`,
        `On obtient **${d.mot}** : ${d.sens}.`,
      ],
    },
  );
}

function sensDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return sensChoix(rng, rng.pick(MOTS_FACILES), 2, 'Lis le texte.');
    case 2:
      return unSur(rng, 2) ? apparierSens(rng) : sensChoix(rng, rng.pick(POLYSEMIE), 3, 'Un mot, plusieurs sens !');
    case 3:
      return retrouver(rng.pick(MOTS_RARES));
    case 4: {
      if (unSur(rng, 2)) return fabriquer(rng.pick(DERIVES));
      const mots = pickN(rng, MOTS_RARES, 5);
      return {
        ...associer(
          rng,
          `Cinq mots à démêler ! Associe chaque mot à son sens : ${mots.map((m) => m.mot).join(', ')}.`,
          mots.map((m) => [m.mot, m.sens]),
          'Lis la ligne de chaque mot. Commence par le plus sûr.',
          [DEF_CONTEXTE, ...mots.map((m) => explique(m))],
        ),
        figure: document(
          'Phrases',
          mots.map((m) => m.lignes.join(' ')),
        ),
      };
    }
    default: {
      const t = rng.pick(RECITS_MOTS);
      const mots = t.mots.map(({ mot, indice }) => {
        const m = MOTS_RARES.find((x) => x.mot === mot);
        if (!m) throw new RangeError(`mot inconnu : ${mot}`);
        return { ...m, indice };
      });
      return trous(
        rng,
        t,
        mots.map((m) => ({
          etiquette: `« ${m.mot} » veut dire`,
          bon: m.sens,
          faux: [m.faux[0][0], m.faux[1][0]],
          preuve: explique(m),
        })),
        {
          prompt: 'Lis ce récit. Choisis le sens de chaque mot.',
          hint: 'Retrouve la ligne du mot. Les mots autour te guident.',
          etapes: [DEF_CONTEXTE],
        },
      );
    }
  }
}

// ───────────────────────── 5. Personnages et narrateur ─────────────────────────

const DEF_NARRATEUR = 'Le **narrateur** est celui qui raconte. Quand il dit « je », il est souvent un **personnage**.';
const DEF_REPRISE = 'Une **reprise** désigne un personnage d’une autre façon : « il », « la commerçante »…';

function associerReprises(rng: Rng): QuestionDraft {
  const r = rng.pick(REPRISES);
  return {
    ...associer(
      rng,
      'Lis le texte. Associe chaque groupe de mots au personnage qu’il désigne.',
      r.paires,
      'Qui a ce métier, cet âge ou cette espèce dans le texte ?',
      [DEF_REPRISE, r.preuve],
    ),
    figure: document('Les personnages', r.lignes),
  };
}

function personnagesDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return qcm(rng, rng.pick(QUI_RACONTE), 2, {
        consigne: 'Lis le texte.',
        definition: DEF_NARRATEUR,
        hint: 'Qui est appelé ? Qui répond avec « je » ?',
      });
    case 2:
      return associerReprises(rng);
    case 3:
      return saisir(
        rng.pick(QUI_SE_CACHE),
        'Retrouve le bon personnage.',
        [DEF_REPRISE, 'Un pronom prend le genre (masculin ou féminin) de la personne qu’il remplace.'],
        'Cherche qui parle et qui agit. « Il » et « elle » t’indiquent aussi le genre.',
      );
    case 4: {
      if (unSur(rng, 2)) {
        const paires = pickN(rng, MOTIVATIONS, 5);
        return associer(
          rng,
          `Pourquoi agit-il ou elle ainsi ? Associe chaque action à sa raison. ${paires.map(([a]) => a).join(' ')}`,
          paires,
          'Imagine ce que le personnage veut obtenir ou éviter.',
          [
            'Un **personnage** agit pour une raison : c’est sa motivation.',
            ...paires.map(([a, r]) => `« ${a} » → ${r}`),
          ],
        );
      }
      return saisir(
        rng.pick(NARRATEURS_CACHES),
        'Le narrateur ne se présente pas ! Mène l’enquête.',
        [DEF_NARRATEUR],
        'Qui est appelé par son prénom, juste avant « je » ?',
      );
    }
    default: {
      const t = rng.pick(LONGS_PERSONNAGES);
      return trous(rng, t, t.trous, {
        prompt: 'Lis ce récit. Qui raconte, qui agit, pourquoi ? Complète les phrases.',
        hint: 'Cherche d’abord s’il y a un « je » qui raconte.',
        etapes: [DEF_NARRATEUR, DEF_REPRISE],
      });
    }
  }
}

// ───────────────────────── Chapitre ─────────────────────────

interface Notion {
  readonly id: string;
  readonly title: string;
  readonly memo: readonly Rich[];
  readonly factId: string;
  readonly faits: readonly string[];
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
    sources: sourcesLectureCm2([n.factId, ...n.faits]),
  },
  generate: n.generate,
});

const faitsDes = (xs: readonly { readonly faitId: string }[]) => xs.map((x) => x.faitId);

export const FCM2_LECTURE: readonly Skill[] = [
  skill({
    id: 'fcm2-texte-narratif',
    title: 'Le texte narratif',
    memo: [
      'Un **texte narratif** est un **récit** : des personnages vivent des événements. Exemple : « Léa ouvrit la porte. »',
      'Ne confonds pas : un poème a des vers, une pièce de théâtre a des noms avant les paroles.',
    ],
    factId: 'l2-prog-genres',
    faits: DEFINITIONS.narratif,
    generate: narratifDraft,
  }),
  skill({
    id: 'fcm2-texte-documentaire',
    title: 'Le texte documentaire',
    memo: [
      'Un **texte documentaire** t’informe sur le réel. Exemple : « La baleine est un mammifère. »',
      'Un **document composite** mêle titre, texte, schéma, **légende** et **source**. Lis chaque partie !',
    ],
    factId: 'l2-prog-composite',
    faits: ['l2-prog-rapprocher', ...DEFINITIONS.documentaire],
    generate: documentaireDraft,
  }),
  skill({
    id: 'fcm2-inferences',
    title: 'Les inférences',
    memo: [
      'Un texte ne dit pas tout ! Fais une **inférence** : rassemble les **indices** et conclus.',
      'Exemple : « Zoé claque des dents. » Tu comprends qu’elle a sans doute froid.',
    ],
    factId: 'l2-prog-inferences',
    faits: ['l2-prog-essentiel', ...DEFINITIONS.inferences],
    generate: inferenceDraft,
  }),
  skill({
    id: 'fcm2-sens-mot',
    title: 'Le sens d’un mot',
    memo: [
      'Un mot inconnu ? Lis le **contexte** et regarde sa forme : « illisible » contient « lisible ».',
      'Un **mot polysémique** a plusieurs sens. « La glace » : eau gelée, miroir ou dessert ?',
    ],
    factId: 'l2-prog-contexte',
    faits: ['l2-prog-polysemie', ...DEFINITIONS.sens, ...faitsDes([...POLYSEMIE, ...MOTS_RARES, ...DERIVES])],
    generate: sensDraft,
  }),
  skill({
    id: 'fcm2-personnages-narrateur',
    title: 'Les personnages et le narrateur',
    memo: [
      'Un **personnage** est un être inventé qui agit dans l’histoire. Le **narrateur** est celui qui raconte.',
      'Une **reprise** évite de répéter : « Mme Roux… la boulangère… elle ». L’auteur, lui, écrit le livre.',
    ],
    factId: 'l2-prog-motivations',
    faits: ['l2-prog-reprises', ...DEFINITIONS.personnages],
    generate: personnagesDraft,
  }),
];
