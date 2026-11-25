import { choice, type Option } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { at, document, pickN, textTraps } from './outils.ts';
import {
  DEVINETTES,
  DOCUMENTS,
  ENIGMES,
  ENIGMES_PIEGES,
  HISTOIRES,
  LONGS_INFERENCE,
  LONGS_QUI,
  MOTS_CHERCHES,
  MOTS_PLUSIEURS_SENS,
  MOTS_RARES,
  NATURES,
  PAIRES_DEVINEES,
  PLANS,
  RECITS_COURTS,
  RECITS_DESORDRE,
  RECITS_LONGS,
  RECITS_MOTS,
  RECITS_QUATRE,
  SUITES,
  TEXTES_PIEGES,
  VERBES,
  faitLecture,
  sourcesLecture,
  type Cle,
  type Devinette,
  type Enigme,
  type Histoire,
  type Mot,
  type MotCherche,
  type Plan,
  type Recit,
  type RecitLong,
  type TexteLong,
  type Trou,
  type Verbe,
} from './lecture.donnees.ts';

/**
 * Chapitre « Lire et comprendre » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025), lecture :
 * informations explicites et implicites, mots inconnus par le contexte, documents.
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitLecture(id).citation} »`;

const LIS = 'Lis le texte.';
const sansPoint = (t: string) => t.replace(/\.$/, '');

/** Association : la colonne de droite est décalée d'un ou deux rangs, jamais en face. */
function associer(
  rng: Rng,
  prompt: string,
  paires: readonly (readonly [string, string])[],
  hint: string,
  etapes: readonly Rich[],
): QuestionDraft {
  const n = paires.length;
  const k = rng.int(1, n - 1);
  const right = paires.map((_, i) => at(paires, (i + k) % n)[1]);
  return {
    prompt,
    answer: { kind: 'match', left: paires.map((p) => p[0]), right, pairs: paires.map((p) => right.indexOf(p[1])) },
    hint,
    steps: [...etapes, `Réponses : **${paires.map(([a, b]) => `${sansPoint(a)} → ${sansPoint(b)}`).join(' ; ')}**.`],
    targetSeconds: 60,
  };
}

/** Texte à trous en liste, sous un document. */
function trous(
  rng: Rng,
  texte: { readonly titre: string; readonly lignes: readonly string[]; readonly source?: string },
  liste: readonly Trou[],
  q: { readonly prompt: string; readonly hint: string; readonly etapes: readonly Rich[] },
): QuestionDraft {
  const fig = document(texte.titre, texte.lignes);
  return {
    prompt: q.prompt,
    figure: texte.source ? { ...fig, credit: `Source : ${texte.source}` } : fig,
    answer: {
      kind: 'cloze',
      parts: [...liste.map((t, i) => `${i === 0 ? '' : '. '}${t.etiquette} `), '.'],
      blanks: liste.map((t) => {
        const options = rng.shuffle([t.bon, ...t.faux]);
        return { mode: 'list' as const, options, correct: options.indexOf(t.bon) };
      }),
    },
    hint: q.hint,
    steps: [
      ...q.etapes,
      ...liste.map((t, i) => `Trou ${i + 1} : ${t.preuve}`),
      `Réponses : **${liste.map((t) => t.bon).join(' ; ')}**.`,
    ],
    targetSeconds: 120,
  };
}

/** Saisie : écritures justes et pièges expliqués. */
function ecrire(
  accepted: readonly string[],
  pieges: readonly (readonly [string, string])[],
  q: Pick<QuestionDraft, 'prompt' | 'hint' | 'steps' | 'figure'>,
): QuestionDraft {
  return { ...q, answer: { kind: 'text', accepted }, traps: textTraps(accepted, pieges), targetSeconds: 60 };
}

/** Remise en ordre : les éléments ne sont jamais présentés déjà rangés. */
function ranger(
  rng: Rng,
  ordre: readonly string[],
  q: Pick<QuestionDraft, 'prompt' | 'hint' | 'steps' | 'figure'>,
): QuestionDraft {
  let idx = rng.shuffle(ordre.map((_, i) => i));
  if (idx.every((v, i) => v === i)) idx = idx.reverse();
  return {
    ...q,
    answer: {
      kind: 'order',
      items: idx.map((i) => at(ordre, i)),
      correct: ordre.map((_, i) => idx.indexOf(i)),
    },
    targetSeconds: 90,
  };
}

// ───────────────────────── 1. Qui, quoi, où, quand ─────────────────────────

const CLES: readonly Cle[] = ['qui', 'quoi', 'ou', 'quand'];
const MOT_QUESTION: Readonly<Record<Cle, string>> = { qui: 'Qui ?', quoi: 'Quoi ?', ou: 'Où ?', quand: 'Quand ?' };
const SENS_QUESTION: Readonly<Record<Cle, string>> = {
  qui: 'la personne ou l’animal qui agit',
  quoi: 'la chose ou l’animal touché par l’action',
  ou: 'le **lieu**',
  quand: 'le **moment**',
};
const REPERER = 'Le mot de la question dit quoi chercher : « qui », « quoi », « où » ou « quand ».';
const repond = (k: Cle, rep: string) => `« ${rep} » répond à « ${MOT_QUESTION[k]} » : c’est ${SENS_QUESTION[k]}.`;
const horsSujet = (k: Cle, rep: string): Option => ({
  label: rep,
  why: `${repond(k, rep)} Ce n’est pas la question posée.`,
});
const etapesQui = (k: Cle, rep: string): Rich[] => [
  REPERER,
  `On cherche ${SENS_QUESTION[k]} dans le texte.`,
  `La réponse est **${rep}**.`,
];

function qcmQui(rng: Rng, h: Histoire, k: Cle, level: 1 | 2): QuestionDraft {
  const juste = h.infos[k];
  const autres = pickN(
    rng,
    CLES.filter((c) => c !== k),
    2,
  ).map((c) => horsSujet(c, h.infos[c].rep));
  if (level === 2)
    autres.push({ label: juste.autre, why: 'Le texte ne dit pas cela. Cherche les mots écrits dans les lignes.' });
  const { answer, traps } = choice(rng, juste.rep, autres);
  return {
    prompt: level === 1 ? `${LIS} ${juste.question}` : `${LIS} Attention aux propositions proches ! ${juste.question}`,
    figure: document(h.titre, h.lignes),
    answer,
    traps,
    hint: `Cherche ${SENS_QUESTION[k].replace(/\*\*/g, '')}.`,
    steps: etapesQui(k, juste.rep),
    targetSeconds: 45,
  };
}

function quiDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return qcmQui(rng, rng.pick(HISTOIRES), rng.pick(CLES), 1);
    case 2: {
      const h = rng.pick(HISTOIRES);
      if (rng.int(0, 1) === 0) {
        const cles = pickN(rng, CLES, 3);
        return {
          ...associer(
            rng,
            `${LIS} Associe chaque question (${cles.map((c) => MOT_QUESTION[c]).join(' ')}) à sa réponse.`,
            cles.map((c) => [MOT_QUESTION[c], h.infos[c].rep]),
            'Commence par le mot de question le plus facile.',
            [REPERER, ...cles.map((c) => repond(c, h.infos[c].rep))],
          ),
          figure: document(h.titre, h.lignes),
        };
      }
      return qcmQui(rng, h, rng.pick(CLES), 2);
    }
    case 3: {
      const h = rng.pick(HISTOIRES);
      const k = rng.pick(CLES);
      const info = h.infos[k];
      return ecrire(
        info.ecrit,
        CLES.filter((c) => c !== k).map(
          (c) => [h.infos[c].rep, `${repond(c, h.infos[c].rep)} Relis la question.`] as const,
        ),
        {
          prompt: `${LIS} Recopie les mots qui répondent : ${info.question}`,
          figure: document(h.titre, h.lignes),
          hint: `Cherche ${SENS_QUESTION[k].replace(/\*\*/g, '')}, puis recopie.`,
          steps: etapesQui(k, info.rep),
        },
      );
    }
    case 4: {
      const t = rng.pick(TEXTES_PIEGES);
      const q = rng.pick(t.questions);
      return ecrire(q.accepted, q.pieges, {
        prompt: `Lis bien : il y a des pièges ! Écris la réponse. ${q.question}`,
        figure: document(t.titre, t.lignes),
        hint: 'Repère d’abord les mots de la question dans le texte, puis lis la même ligne.',
        steps: [REPERER, q.preuve, `La réponse est **${at(q.accepted, 0)}**.`],
      });
    }
    default: {
      const t: TexteLong = rng.pick(LONGS_QUI);
      return trous(rng, t, t.trous, {
        prompt: 'Mène l’enquête dans ce long texte ! Choisis la bonne réponse pour chaque question.',
        hint: 'Relis le texte pour chaque question. Une réponse se trouve dans une ligne.',
        etapes: [REPERER],
      });
    }
  }
}

// ───────────────────────── 2. Inférences ─────────────────────────

const DEF_INFERENCE = 'Faire une **inférence**, c’est deviner ce que le texte ne dit pas, grâce à des **indices**.';
const preuveInference = (indices: string) => `Indices : ${indices}.`;

function devinetteChoix(rng: Rng, d: Devinette, n: 2 | 3, prompt: string): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    d.bon,
    d.faux.slice(0, n).map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: `${prompt} ${d.question}`,
    figure: document('Le détective', d.lignes),
    answer,
    traps,
    hint: 'Cherche les mots du texte qui te mettent sur la piste.',
    steps: [DEF_INFERENCE, preuveInference(d.indices), `On devine : **${sansPoint(d.bon)}**.`],
    targetSeconds: 45,
  };
}

function enigme(e: Enigme, prompt: string): QuestionDraft {
  return ecrire(e.accepted, e.pieges, {
    prompt: `${prompt} ${e.question}`,
    figure: document('Une énigme', e.lignes),
    hint: 'Le texte ne dit pas la réponse. Relie les indices à ce que tu connais.',
    steps: [DEF_INFERENCE, preuveInference(e.indices), `La réponse est **${at(e.accepted, 0)}**.`],
  });
}

const apparier = (rng: Rng, n: 3 | 5, prompt: string): QuestionDraft => {
  const paires = pickN(rng, PAIRES_DEVINEES, n);
  return associer(
    rng,
    `${prompt} Phrases : ${paires.map(([p]) => p).join(' ')}`,
    paires,
    'Pour chaque phrase, demande-toi : qu’est-ce que cela montre ?',
    [DEF_INFERENCE, ...paires.map(([p, d]) => `« ${p} » → on devine : ${d}`)],
  );
};

function inferenceDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return devinetteChoix(rng, rng.pick(DEVINETTES), 2, 'Lis et devine.');
    case 2:
      return rng.int(0, 1) === 0
        ? apparier(rng, 3, 'Associe chaque phrase à ce que tu devines.')
        : devinetteChoix(rng, rng.pick(DEVINETTES), 3, 'Lis entre les lignes.');
    case 3:
      return enigme(rng.pick(ENIGMES), 'À toi de deviner et d’écrire.');
    case 4:
      return rng.int(0, 1) === 0
        ? apparier(rng, 5, 'Cinq indices à démêler ! Associe chaque phrase à sa déduction.')
        : enigme(rng.pick(ENIGMES_PIEGES), 'Gare à la fausse piste !');
    default: {
      const t = rng.pick(LONGS_INFERENCE);
      return trous(rng, t, t.trous, {
        prompt: 'Lis cette histoire. Complète chaque phrase avec ce que tu devines.',
        hint: 'Cherche les indices dans le texte et relie-les à ce que tu sais.',
        etapes: [DEF_INFERENCE],
      });
    }
  }
}

// ───────────────────────── 3. Sens d'un mot dans le texte ─────────────────────────

const DEF_CONTEXTE = 'Le **contexte**, ce sont les mots autour : ils aident à comprendre un mot.';
const MOTS_TOUS: readonly Mot[] = [...MOTS_PLUSIEURS_SENS, ...MOTS_RARES];
const MOTS_FACILES = MOTS_RARES.filter((m) => ['paisible', 'ravi', 'épuisé', 'sentier', 'averse'].includes(m.mot));
const explique = (m: Mot, indice = m.indice) => `Ici, « ${m.mot} » veut dire **${m.sens}**. Indices : ${indice}.`;
const ARTICLES: Readonly<Record<string, readonly string[]>> = {
  sentier: ['un sentier', 'le sentier'],
  frayeur: ['la frayeur', 'de frayeur'],
  averse: ['une averse', 'l’averse'],
  grue: ['la grue', 'une grue'],
  baguette: ['la baguette', 'sa baguette', 'une baguette'],
  addition: ['l’addition', 'une addition'],
  mine: ['la mine', 'mauvaise mine'],
  bureau: ['le bureau', 'son bureau', 'un bureau'],
  pièce: ['une pièce', 'la pièce'],
};

function sensChoix(rng: Rng, m: Mot, n: 2 | 3, prompt: string): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    m.sens,
    m.faux.slice(0, n).map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: `${prompt} Que veut dire « ${m.mot} » ?`,
    figure: document('Dans le texte', m.lignes),
    answer,
    traps,
    hint: 'Remplace le mot par chaque proposition. Laquelle va avec les mots autour ?',
    steps: [DEF_CONTEXTE, explique(m), `La bonne réponse est **${m.sens}**.`],
    targetSeconds: 45,
  };
}

/** Mots du texte qui ne sont pas la réponse : les plus longs (pièges de recopie). */
const autresMots = (m: Mot): string[] =>
  [...new Set(m.lignes.join(' ').match(/[A-Za-zÀ-ÿœ]{6,}/g) ?? [])]
    .filter((w) => w.toLowerCase() !== m.mot.toLowerCase())
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);

function retrouver(m: Mot, prompt: string): QuestionDraft {
  return ecrire(
    [m.mot, ...(ARTICLES[m.mot] ?? [])],
    autresMots(m).map((w) => [w, `« ${w} » est dans le texte, mais il ne veut pas dire « ${m.sens} ».`] as const),
    {
      prompt: `${prompt} « ${m.sens} »`,
      figure: document('Dans le texte', m.lignes),
      hint: 'Lis chaque mot du texte et essaie le sens demandé à sa place.',
      steps: [DEF_CONTEXTE, explique(m), `Le mot à écrire est **${m.mot}**.`],
    },
  );
}

/** Niveau 4 : le mot cherché est entouré d’autres mots plausibles. */
function retrouverPiege(c: MotCherche, prompt: string): QuestionDraft {
  const m: Mot = { ...motTexte(c.mot), lignes: c.lignes, indice: c.indice };
  return {
    ...retrouver(m, prompt),
    traps: textTraps(
      [m.mot],
      c.rivaux.map((w) => [w, `« ${w} » est dans le texte, mais il ne veut pas dire « ${m.sens} ».`] as const),
    ),
  };
}

const apparierMots = (rng: Rng, n: 3 | 5, prompt: string): QuestionDraft => {
  const mots = pickN(rng, MOTS_RARES, n);
  return {
    ...associer(
      rng,
      `${prompt} Mots : ${mots.map((m) => m.mot).join(', ')}.`,
      mots.map((m) => [m.mot, m.sens]),
      'Lis la ligne de chaque mot. Commence par le plus sûr.',
      [DEF_CONTEXTE, ...mots.map((m) => explique(m))],
    ),
    figure: document(
      'Phrases',
      mots.map((m) => m.lignes.join(' ')),
    ),
  };
};

function motTexte(nom: string): Mot {
  const m = MOTS_TOUS.find((x) => x.mot === nom);
  if (!m) throw new RangeError(`mot inconnu : ${nom}`);
  return m;
}

function sensDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return sensChoix(rng, rng.pick(MOTS_FACILES), 2, LIS);
    case 2:
      return rng.int(0, 1) === 0
        ? apparierMots(rng, 3, 'Associe chaque mot à son sens dans les phrases.')
        : sensChoix(rng, rng.pick(MOTS_PLUSIEURS_SENS), 3, 'Un mot, plusieurs sens ! Lis le texte.');
    case 3:
      return retrouver(rng.pick(MOTS_RARES), 'Écris le mot du texte qui veut dire :');
    case 4:
      return rng.int(0, 1) === 0
        ? apparierMots(rng, 5, 'Cinq mots à démêler. Associe chaque mot à son sens.')
        : retrouverPiege(
            rng.pick(MOTS_CHERCHES),
            'Méfie-toi des autres mots ! Écris le mot du texte qui veut dire ici :',
          );
    default: {
      const t = rng.pick(RECITS_MOTS);
      const mots = t.mots.map(({ mot, indice }) => ({ ...motTexte(mot), indice }));
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
          prompt: 'Lis l’histoire. Choisis le sens de chaque mot dans ce récit.',
          hint: 'Retrouve la ligne du mot. Les mots autour te guident.',
          etapes: [DEF_CONTEXTE],
        },
      );
    }
  }
}

// ───────────────────────── 4. Ordre des événements ─────────────────────────

const DEF_ORDRE = 'Les mots de temps (« d’abord », « puis », « avant », « après ») montrent l’ordre.';
const etapesOrdre = (r: Recit): Rich[] => [DEF_ORDRE, r.preuve];
const suite = (r: Recit) => r.evenements.join(' ; ');

function moment(rng: Rng, r: Recit, premier: boolean): QuestionDraft {
  const bon = premier ? at(r.evenements, 0) : at(r.evenements, r.evenements.length - 1);
  const { answer, traps } = choice(
    rng,
    bon,
    r.evenements
      .filter((e) => e !== bon)
      .map((e) => ({ label: e, why: `« ${e} » n’arrive pas ${premier ? 'en premier' : 'à la fin'}.` })),
  );
  return {
    prompt: `${LIS} Que se passe-t-il ${premier ? 'en premier' : 'à la fin'} ?`,
    figure: document(r.titre, r.lignes),
    answer,
    traps,
    hint: 'Cherche les mots de temps au début des phrases.',
    steps: [...etapesOrdre(r), `La réponse est **${bon}**.`],
    targetSeconds: 45,
  };
}

function voisin(rng: Rng, r: Recit): QuestionDraft {
  const apres = rng.int(0, 1) === 0;
  const i = apres ? rng.int(0, r.evenements.length - 2) : rng.int(1, r.evenements.length - 1);
  const repere = at(r.evenements, i);
  const bon = at(r.evenements, apres ? i + 1 : i - 1);
  const { answer, traps } = choice(
    rng,
    bon,
    r.evenements
      .filter((e) => e !== bon)
      .map((e) => ({
        label: e,
        why:
          e === repere
            ? 'C’est l’événement de la question. Cherche celui d’à côté.'
            : `« ${e} » n’est pas juste ${apres ? 'après' : 'avant'}.`,
      })),
  );
  return {
    prompt: `${LIS} Que se passe-t-il juste ${apres ? 'après' : 'avant'} : « ${repere} » ?`,
    figure: document(r.titre, r.lignes),
    answer,
    traps,
    hint: 'Trouve d’abord l’événement de la question dans le texte.',
    steps: [...etapesOrdre(r), `Dans l’ordre : ${suite(r)}.`, `La réponse est **${bon}**.`],
    targetSeconds: 60,
  };
}

function reordonner(rng: Rng, r: Recit, prompt: string): QuestionDraft {
  return ranger(rng, r.evenements, {
    prompt,
    figure: document(r.titre, r.lignes),
    hint: 'Cherche ce qui se passe en tout premier, puis avance pas à pas.',
    steps: [...etapesOrdre(r), `L’ordre juste : **${suite(r)}**.`],
  });
}

function ordreDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return moment(rng, rng.pick(RECITS_COURTS), rng.int(0, 1) === 0);
    case 2: {
      if (rng.int(0, 1) === 0) {
        const r = rng.pick(RECITS_COURTS);
        const rangs = ['En premier', 'En deuxième', 'En dernier'];
        return {
          ...associer(
            rng,
            `${LIS} Associe chaque moment à son action.`,
            r.evenements.map((e, i) => [at(rangs, i), e]),
            'Les mots de temps te donnent le rang de chaque action.',
            etapesOrdre(r),
          ),
          figure: document(r.titre, r.lignes),
        };
      }
      return voisin(rng, rng.pick(RECITS_QUATRE));
    }
    case 3:
      return reordonner(rng, rng.pick(RECITS_QUATRE), `${LIS} Remets les actions dans l’ordre.`);
    case 4:
      return reordonner(
        rng,
        rng.pick(RECITS_DESORDRE),
        'Attention, le texte ne suit pas l’ordre ! Range les événements du premier au dernier.',
      );
    default:
      return enquete(rng, rng.pick(RECITS_LONGS));
  }
}

/**
 * Rangs cherchés « juste avant » et « juste après » dans un récit de 7 faits : l’événement cité par une question n’est
 * jamais la réponse d’une autre.
 */
const PLACES: readonly (readonly [number, number])[] = [
  [1, 3],
  [2, 4],
  [3, 2],
  [1, 4],
];

/** Niveau 5 : premier fait, juste avant, juste après, avant-dernier ; les propositions sont les faits voisins. */
function enquete(rng: Rng, r: RecitLong): QuestionDraft {
  const faits = r.evenements.map((e) => e.fait);
  const n = faits.length;
  const question = (etiquette: string, i: number, preuves: readonly number[], repere?: number): Trou => {
    const [a, b] = rng
      .shuffle(faits.map((_, j) => j).filter((j) => j !== i && j !== repere))
      .sort((x, y) => Math.abs(x - i) - Math.abs(y - i));
    return {
      etiquette,
      bon: at(faits, i),
      faux: [at(faits, a ?? -1), at(faits, b ?? -1)],
      preuve: preuves.map((p) => at(r.evenements, p).raison).join(' '),
    };
  };
  const [avant, apres] = rng.pick(PLACES);
  const reperes = [...new Set([avant + 1, apres - 1])].map((i) => `« ${at(faits, i)} »`);
  return trous(
    rng,
    r,
    [
      question('Le premier fait arrivé :', 0, [0]),
      question(`Juste avant « ${at(faits, avant + 1)} » :`, avant, [avant + 1], avant + 1),
      question(`Juste après « ${at(faits, apres - 1)} » :`, apres, [apres], apres - 1),
      question('Avant-dernier événement :', n - 2, [n - 2, n - 1]),
    ],
    {
      prompt: `Le récit remonte le temps ! Mène l’enquête autour de ${reperes.join(' et de ')}.`,
      hint: 'Surveille « la veille », « le lendemain » et « auparavant » : de quel moment partent-ils ?',
      etapes: [DEF_ORDRE, `Dans l’ordre : ${faits.join(' ; ')}.`],
    },
  );
}

// ───────────────────────── 5. Consigne et document légendé ─────────────────────────

const DEF_CONSIGNE = 'Une **consigne** te dit quoi faire. Repère d’abord son **verbe**.';
const DEF_LEGENDE = 'La **légende** explique les signes d’un plan. Lis-la avant de chercher.';
const COLONNES = ['A', 'B', 'C'] as const;
const LIGNES = ['1', '2', '3'] as const;

const tableau = (p: Plan) => ({
  kind: 'table' as const,
  header: true,
  rows: [['Plan', ...COLONNES], ...LIGNES.map((l) => [l, ...COLONNES.map((c) => p.cases[`${c}${l}`] ?? '–')])],
});
const legende = (p: Plan) => `Légende : ${p.legende.map((o) => `${o.signe} = ${o.nom}`).join(' ; ')}.`;
const caseDe = (p: Plan, signe: string): string => {
  const c = Object.entries(p.cases).find(([, s]) => s === signe)?.[0];
  if (!c) throw new RangeError(`signe absent du plan : ${signe}`);
  return c;
};
const LECTURE_CASE = 'Une case se nomme avec sa colonne (la lettre), puis sa ligne (le chiffre).';

/** « Entourer » et « encadrer » se ressemblent trop : jamais dans la même question. */
const PROCHES: readonly string[] = ['entourer', 'encadrer'];
const compatibles = (rng: Rng): Verbe[] => {
  const ecarte = rng.pick(PROCHES);
  return VERBES.filter((v) => v.verbe !== ecarte);
};

/** « de barrer », mais « d’entourer ». */
const de = (mot: string) => (/^[aeéè]/.test(mot) ? `d’${mot}` : `de ${mot}`);

function gesteChoix(rng: Rng, v: Verbe): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    v.geste,
    pickN(
      rng,
      VERBES.filter((x) => x !== v && !(PROCHES.includes(v.verbe) && PROCHES.includes(x.verbe))),
      2,
    ).map((x) => ({ label: x.geste, why: `Ça, c’est « ${x.verbe} ». La consigne demande ${de(v.verbe)}.` })),
  );
  return {
    prompt: `La consigne dit : « ${v.consigne} » Que dois-tu faire ?`,
    answer,
    traps,
    hint: 'Repère le premier mot de la consigne : c’est l’action.',
    steps: [DEF_CONSIGNE, `« ${v.verbe} » : ${v.geste}.`, `Tu dois **${v.geste}**.`],
    targetSeconds: 40,
  };
}

const apparierGestes = (rng: Rng, n: 3 | 5, prompt: string): QuestionDraft => {
  const choisis = pickN(rng, compatibles(rng), n);
  return associer(
    rng,
    `${prompt} Verbes : ${choisis.map((v) => v.verbe).join(', ')}.`,
    choisis.map((v) => [v.verbe, v.geste]),
    'Imagine ton crayon sur la feuille : que fait-il ?',
    [DEF_CONSIGNE, ...choisis.map((v) => `« ${v.verbe} » : ${v.geste}.`)],
  );
};

function lireCase(rng: Rng, p: Plan): QuestionDraft {
  const o = rng.pick(p.legende);
  const place = caseDe(p, o.signe);
  const { answer, traps } = choice(
    rng,
    o.nom,
    p.legende
      .filter((x) => x !== o)
      .map((x) => ({ label: x.nom, why: `${x.signe} n’est pas en ${place}. Repère la colonne, puis la ligne.` })),
  );
  return {
    prompt: `${legende(p)} Qu’y a-t-il dans la case ${place} du plan « ${p.titre} » ?`,
    figure: tableau(p),
    answer,
    traps,
    hint: LECTURE_CASE,
    steps: [DEF_LEGENDE, LECTURE_CASE, `En ${place}, on voit ${o.signe} : c’est **${o.nom}**.`],
    targetSeconds: 60,
  };
}

function ecrireCase(rng: Rng, p: Plan): QuestionDraft {
  const o = rng.pick(p.legende);
  const place = caseDe(p, o.signe);
  const [col, ligne] = [place.charAt(0), place.charAt(1)];
  return ecrire(
    [place, `${col} ${ligne}`, `${ligne}${col}`, `${ligne} ${col}`, `case ${place}`],
    p.legende
      .filter((x) => x !== o)
      .map((x) => [caseDe(p, x.signe), `Dans cette case, on voit ${x.nom}. Lis la légende.`] as const),
    {
      prompt: `${legende(p)} Écris la case du plan « ${p.titre} » où se trouve ${o.nom}.`,
      figure: tableau(p),
      hint: 'Trouve d’abord le signe dans la légende, puis cherche-le sur le plan.',
      steps: [
        DEF_LEGENDE,
        `Dans la légende, « ${o.nom} » a le signe ${o.signe}.`,
        LECTURE_CASE,
        `La réponse est **${place}**.`,
      ],
    },
  );
}

function consigneDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return gesteChoix(rng, rng.pick(VERBES));
    case 2:
      return rng.int(0, 1) === 0
        ? apparierGestes(rng, 3, 'Associe chaque verbe de consigne à son action.')
        : lireCase(rng, rng.pick(PLANS));
    case 3:
      return ecrireCase(rng, rng.pick(PLANS));
    case 4: {
      if (rng.int(0, 1) === 0) return apparierGestes(rng, 5, 'Cinq consignes ! Associe chaque verbe à son action.');
      const s = rng.pick(SUITES);
      return ranger(rng, s.actions, {
        prompt: 'Lis la consigne. Remets les actions dans l’ordre où tu les fais.',
        figure: document(s.titre, [s.consigne]),
        hint: 'Surveille « avant » et « après » : ils changent l’ordre des actions.',
        steps: [DEF_CONSIGNE, DEF_ORDRE, `Dans l’ordre : **${s.actions.join(' ; ')}**.`],
      });
    }
    default: {
      const d = rng.pick(DOCUMENTS);
      const autresNatures = pickN(
        rng,
        NATURES.filter((n) => n !== d.nature),
        2,
      );
      const autresSources = pickN(
        rng,
        DOCUMENTS.filter((x) => x !== d).map((x) => x.source),
        2,
      );
      const identite: readonly Trou[] = [
        {
          etiquette: 'Ce document est',
          bon: d.nature,
          faux: [autresNatures[0] ?? '', autresNatures[1] ?? ''],
          preuve: 'Regarde sa forme et ce qu’il sert à faire.',
        },
        {
          etiquette: 'Sa source est :',
          bon: d.source,
          faux: [autresSources[0] ?? '', autresSources[1] ?? ''],
          preuve: 'La source est écrite sous le document.',
        },
      ];
      return trous(rng, d, [...identite, ...d.trous], {
        prompt: 'Observe ce document : son titre, sa légende, sa source. Complète les phrases.',
        hint: 'La source est sous le document. La légende explique les signes.',
        etapes: ['La nature dit quelle sorte de document c’est. La **source** dit d’où il vient.', DEF_LEGENDE],
      });
    }
  }
}

// ───────────────────────── Chapitre ─────────────────────────

const skill = ({
  faitsCites,
  source,
  memo,
  ...reste
}: Pick<Skill, 'id' | 'title' | 'generate'> & {
  readonly memo: readonly Rich[];
  readonly source: string;
  readonly faitsCites: readonly string[];
}): Skill => ({
  ...reste,
  levels: 5,
  version: 1,
  lesson: { memo, source: programme(source), sources: sourcesLecture(faitsCites) },
});

const ids = (...liste: readonly string[]) => liste.map((m) => `def-${m}`);

export const FCM1_LECTURE: readonly Skill[] = [
  skill({
    id: 'fcm1-lire-qui-quoi',
    title: 'Qui, quoi, où, quand ?',
    memo: [
      'Lis la question et repère son mot : « qui », « quoi », « où » ou « quand ».',
      '« Où » demande un **lieu**. « Quand » demande un **moment**. Exemple : « Ce soir, Max lit au lit. » Où ? Au lit.',
    ],
    source: 'prog-explicite',
    faitsCites: ['prog-explicite', ...ids('ou', 'quand', 'lieu', 'moment')],
    generate: quiDraft,
  }),
  skill({
    id: 'fcm1-inferences',
    title: 'Lire entre les lignes',
    memo: [
      'Le texte ne dit pas tout ! Une **inférence**, c’est deviner grâce à des **indices**.',
      'Exemple : « Léo souffle sur sa soupe. » Tu devines qu’elle est chaude.',
    ],
    source: 'prog-explicite',
    faitsCites: ['prog-explicite', 'prog-strategies', ...ids('implicite', 'indice')],
    generate: inferenceDraft,
  }),
  skill({
    id: 'fcm1-sens-mot-texte',
    title: 'Le sens d’un mot dans le texte',
    memo: [
      'Un mot te bloque ? Lis le **contexte**, les mots autour de lui.',
      'Exemple : « La grue soulève la poutre. » Ici, ce n’est pas l’oiseau !',
    ],
    source: 'prog-contexte',
    faitsCites: ['prog-contexte', ...ids('contexte'), ...MOTS_TOUS.map((m) => m.faitId)],
    generate: sensDraft,
  }),
  skill({
    id: 'fcm1-ordre-recit',
    title: 'L’ordre des événements',
    memo: [
      'Dans un **récit**, des mots de temps t’aident : « d’abord », « puis », « avant », « après ».',
      'Attention : « Avant de sortir, il met ses bottes. » Les bottes viennent en premier !',
    ],
    source: 'prog-strategies',
    faitsCites: [
      'prog-strategies',
      ...ids('recit', 'chronologie', 'puis', 'enfin', 'abord', 'auparavant', 'lendemain'),
    ],
    generate: ordreDraft,
  }),
  skill({
    id: 'fcm1-consigne-document',
    title: 'Consigne et document légendé',
    memo: [
      'Dans une **consigne**, repère le verbe : il dit quoi faire. Exemple : « Entoure le nom. »',
      'Sur un plan, lis la **légende** avant de chercher. Un **document** a une nature et une **source**.',
    ],
    source: 'prog-documents',
    faitsCites: [
      'prog-documents',
      'prog-nature-source',
      'prog-composites',
      ...ids('consigne', 'legende'),
      ...VERBES.map((v) => v.faitId),
    ],
    generate: consigneDraft,
  }),
];
