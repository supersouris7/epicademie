import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { ClozeBlank, Level, QuestionDraft, Rich, Skill } from '../types.ts';
import {
  COMPOSES,
  FAIT_FAMILLE_6,
  FINS_ETRE,
  IRR_COND,
  IRR_IMP,
  ORDRES,
  PERSONNES_IMP,
  REGULIERS_6,
  REG_ER,
  SUJETS_C,
  SUJETS_TIERS,
  TOUS_C,
  VERBES_ETRE,
  VERBES_IMPARFAIT_VAR,
  VERBES_VAR,
  accorde,
  auxiliaireAu,
  avecEtre,
  composeAu,
  conditionnel,
  conditionnels,
  deFamille,
  faitConjugaison6e,
  familleDe,
  imparfaitVar,
  imperatif,
  imperatifs,
  participeSeul,
  sourcesConjugaison6e,
  type Compose,
  type Famille6,
  type PersonneImp,
  type SujetC,
  type VerbeAvoir,
  type VerbeCompose,
  type VerbeImp,
  type VerbeOrdre,
  type VerbeVar,
} from './conjugaison-6e.donnees.ts';
import { appariement, at, document, pickN, saisies, textTraps } from './outils.ts';
import { PERSONNES, avecSujet, forme, type Personne } from './present.donnees.ts';
import { FINS, IRREGULIERS_CITES, conjugue, neDevant, type VerbeTemps } from './temps.donnees.ts';

/**
 * Chapitre « Conjugaison » (6e). Programme de français du cycle 3 (BO du 17 avril 2025), sixième : « Approfondir sa
 * maîtrise de la conjugaison ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), 6e — « ${faitConjugaison6e(id).citation} »`;

type Piege = readonly [string, string];

/** Propositions fausses distinctes (aucune écriture juste, aucun doublon). */
function fausses(bon: string, list: readonly Piege[]) {
  const vues = new Set([bon.toLowerCase()]);
  return list
    .filter(([f]) => !vues.has(f.toLowerCase()) && vues.add(f.toLowerCase()))
    .map(([label, why]) => ({ label, why }));
}

interface Qcm {
  readonly prompt: string;
  readonly bon: string;
  readonly pieges: readonly Piege[];
  readonly hint: Rich;
  readonly steps: readonly Rich[];
}

function qcm(rng: Rng, q: Qcm): QuestionDraft {
  const { answer, traps } = choice(rng, q.bon, fausses(q.bon, q.pieges));
  return { prompt: q.prompt, answer, traps, hint: q.hint, steps: [...q.steps, `La réponse est **${q.bon}**`] };
}

function saisie(
  prompt: string,
  accepted: readonly string[],
  pieges: readonly Piege[],
  hint: Rich,
  steps: Rich[],
): QuestionDraft {
  return {
    prompt,
    answer: { kind: 'text', accepted: [...accepted] },
    traps: textTraps(accepted, pieges),
    hint,
    steps: [...steps, `La réponse est **${at(accepted, 0)}**.`],
  };
}

/** Verbes ou formes d’un énoncé, en ordre alphabétique (l’ordre ne donne pas la réponse). */
const liste = (l: readonly string[]) =>
  [...l]
    .sort()
    .map((x) => `« ${x} »`)
    .join(', ');

const textes = (accepted: readonly string[]): ClozeBlank => ({ mode: 'text', accepted: [...accepted] });
const capitale = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Pronom affiché devant la forme demandée (« je » est écarté : il révélerait la voyelle initiale). */
const PRONOMS: Record<Exclude<Personne, 'je'>, string> = {
  tu: 'tu',
  il: 'elle',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils',
};
const SANS_JE: readonly Exclude<Personne, 'je'>[] = ['tu', 'il', 'nous', 'vous', 'ils'];

const SITUATIONS: Record<PersonneImp, string> = {
  tu: 'tu parles à un seul camarade, que tu tutoies',
  nous: 'tu proposes à ton groupe, toi compris',
  vous: 'tu parles à plusieurs camarades',
};
const NOM_PERSONNE: Record<PersonneImp, string> = {
  tu: 'deuxième personne du singulier',
  nous: 'première personne du pluriel',
  vous: 'deuxième personne du pluriel',
};

// ───────────────────────── 1. Impératif présent ─────────────────────────

const DEF_IMP =
  'L’impératif sert à donner un ordre ou un conseil. Il n’a pas de sujet écrit et seulement trois personnes : tu, nous, vous.';
const regleS = 'Au singulier, les verbes en -er s’écrivent sans -s : « chante ! ».';

/** Compléments des ordres à la forme négative (« Ne … pas … »). */
const NEGATIFS: readonly (readonly [VerbeOrdre, string])[] = [
  ['être', 'en retard'],
  ['avoir', 'peur'],
  ['faire', 'de bruit'],
  ['aller', 'trop loin'],
  ['dire', 'ce secret'],
  ['venir', 'trop tard'],
  ['prendre', 'ce chemin'],
];

/** Verbes en « -e » à la 2e personne du singulier, devant « en » : un « s » s’ajoute. */
const AVEC_EN: readonly (readonly [VerbeImp, string, string])[] = [
  ['manger', 'Voici des fraises : ', ' une.'],
  ['chanter', 'Tu connais ces refrains : ', ' un.'],
  ['porter', 'Il reste des cartons : ', ' deux.'],
  ['choisir', 'Voici des livres : ', ' un.'],
];

/** Erreurs typiques d’un impératif d’un verbe régulier ou irrégulier. */
function piegesImperatif(v: VerbeOrdre, p: PersonneImp): Piege[] {
  const bon = imperatif(v, p);
  const pieges: Piege[] = [];
  if (p === 'tu' && (bon.endsWith('e') || bon === 'va'))
    pieges.push([`${bon}s`, `Sans « en » ni « y » après lui, « ${bon} » ne prend pas de « s ».`]);
  else if (p === 'tu')
    pieges.push([
      bon.endsWith('ds') ? bon.slice(0, -1) : `${bon.replace(/s$/, '')}t`,
      'Cette écriture est celle de il ou elle au présent, pas celle de tu.',
    ]);
  pieges.push(
    [`${p} ${forme(v, p)}`, 'À l’impératif, on n’écrit pas le sujet.'],
    [v, 'C’est l’infinitif : le verbe n’est pas conjugué.'],
    [
      conjugue('imparfait', v, p),
      'C’est l’imparfait : l’impératif présent ne prend pas la marque « -ai- » ou « -i- ».',
    ],
    [conjugue('futur', v, p), 'C’est le futur : ici, on donne un ordre à l’impératif présent.'],
  );
  return pieges;
}

interface Action {
  readonly v: VerbeOrdre;
  readonly fin: string;
  readonly negatif?: boolean;
}

const SCENARIOS: readonly { readonly titre: string; readonly actions: readonly Action[] }[] = [
  {
    titre: 'Avant l’expérience',
    actions: [
      { v: 'écouter', fin: 'la consigne' },
      { v: 'prendre', fin: 'une blouse' },
      { v: 'aller', fin: 'au laboratoire' },
      { v: 'être', fin: 'à l’heure' },
    ],
  },
  {
    titre: 'Répétition de théâtre',
    actions: [
      { v: 'venir', fin: 'sur la scène' },
      { v: 'regarder', fin: 'le public' },
      { v: 'parler', fin: 'plus fort' },
      { v: 'avoir', fin: 'peur', negatif: true },
      { v: 'faire', fin: 'de bruit', negatif: true },
    ],
  },
  {
    titre: 'Sortie au musée',
    actions: [
      { v: 'marcher', fin: 'sans courir' },
      { v: 'choisir', fin: 'un tableau' },
      { v: 'dessiner', fin: 'un détail' },
      { v: 'finir', fin: 'le croquis' },
      { v: 'aller', fin: 'trop loin', negatif: true },
    ],
  },
];

function imperatifDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(REGULIERS_6);
      const p = rng.pick(PERSONNES_IMP);
      const fin = ORDRES[v];
      const bon = `${capitale(imperatif(v, p))} ${fin} !`;
      return qcm(rng, {
        prompt: 'Quelle phrase contient un verbe à l’impératif présent ?',
        bon,
        pieges: [
          [`${capitale(p)} ${forme(v, p)} ${fin} !`, 'Le sujet est écrit : c’est le présent de l’indicatif.'],
          [`${capitale(p)} ${conjugue('futur', v, p)} ${fin} !`, 'Le sujet est écrit et le verbe est au futur.'],
        ],
        hint: 'À l’impératif, il manque quelque chose devant le verbe.',
        steps: [DEF_IMP, `Dans « ${bon} », aucun sujet n’est écrit devant « ${imperatif(v, p)} ».`],
      });
    }
    case 2: {
      const v = rng.pick(REGULIERS_6);
      const p = rng.pick(PERSONNES_IMP);
      const bon = imperatif(v, p);
      const pieges: Piege[] =
        p === 'tu'
          ? [
              ...piegesImperatif(v, p).slice(0, 1),
              [v, 'C’est l’infinitif : le verbe n’est pas conjugué.'],
              [imperatif(v, 'vous'), 'Cette forme s’adresse à plusieurs personnes (vous).'],
              [participeSeul(v), 'C’est le participe passé : seul, il ne donne pas un ordre.'],
            ]
          : [
              [conjugue('imparfait', v, p), 'C’est une forme de l’imparfait, pas un ordre.'],
              [conjugue('futur', v, p), 'C’est une forme du futur.'],
              [v, 'C’est l’infinitif : le verbe n’est pas conjugué.'],
              [imperatif(v, 'tu'), 'Cette forme s’adresse à une seule personne (tu).'],
            ];
      return qcm(rng, {
        prompt: `Complète à l’impératif présent (${SITUATIONS[p]}) : « ___ ${ORDRES[v]} ! » (${v})`,
        bon,
        pieges: pieges
          .slice(0, 4)
          .filter(([f]) => f !== bon)
          .slice(0, 3),
        hint: 'Cherche qui reçoit l’ordre : cela fixe la personne.',
        steps: [DEF_IMP, `Ici, c’est la ${NOM_PERSONNE[p]}.`],
      });
    }
    case 3: {
      const v = rng.pick(REGULIERS_6);
      const p = rng.pick(PERSONNES_IMP);
      return saisie(
        `Écris « ${v} » à l’impératif présent (${SITUATIONS[p]}) : « ___ ${ORDRES[v]} ! »`,
        imperatifs(v, p),
        piegesImperatif(v, p),
        'Dis d’abord la phrase au présent avec son sujet, retire le sujet, puis vérifie la dernière lettre.',
        [
          DEF_IMP,
          `C’est la ${NOM_PERSONNE[p]}.`,
          p === 'tu' && REG_ER.includes(v)
            ? regleS
            : `Pour ce verbe, l’impératif s’écrit comme au présent, sans le sujet : « ${p} ${forme(v, p)} » au présent.`,
        ],
      );
    }
    case 4: {
      const variante = rng.pick(['irregulier', 'irregulier', 'negatif', 'en', 'y', 'politesse'] as const);
      if (variante === 'irregulier') {
        const v = rng.pick(IRR_IMP);
        const p = rng.pick(PERSONNES_IMP);
        return saisie(
          `Écris « ${v} » à l’impératif présent (${SITUATIONS[p]}) : « ___ ${ORDRES[v]} ! »`,
          imperatifs(v, p),
          piegesImperatif(v, p),
          'Ce verbe est à connaître par cœur : pense à la forme employée pour donner un ordre.',
          [DEF_IMP, `« ${v} » est un verbe à mémoriser à l’impératif.`],
        );
      }
      if (variante === 'negatif') {
        const [v, fin] = rng.pick(NEGATIFS);
        const p = rng.pick(PERSONNES_IMP);
        const bon = imperatif(v, p);
        const ne = neDevant(bon);
        return saisie(
          `Un ordre négatif (${SITUATIONS[p]}) : « ${capitale(ne)}___ pas ${fin} ! » Écris « ${v} » à l’impératif présent.`,
          imperatifs(v, p),
          piegesImperatif(v, p),
          'La forme du verbe ne change pas quand l’ordre est négatif.',
          [DEF_IMP, 'Un ordre négatif s’appelle une défense : « ne » et « pas » entourent le verbe.'],
        );
      }
      if (variante === 'en') {
        const [v, debut, fin] = rng.pick(AVEC_EN);
        const base = imperatif(v, 'tu');
        const bon = base.endsWith('e') ? `${base}s` : base;
        return saisie(
          `Tu parles à un seul camarade. Écris « ${v} » à l’impératif : « ${debut}___-en${fin} »`,
          [bon],
          [
            [
              base === bon ? `${bon.replace(/s$/, '')}t` : base,
              base === bon
                ? '« -t » est la terminaison de il ou elle.'
                : 'Devant « en », ce verbe prend un « s » pour la liaison.',
            ],
            [`tu ${forme(v, 'tu')}`, 'À l’impératif, on n’écrit pas le sujet.'],
            [v, 'C’est l’infinitif : le verbe n’est pas conjugué.'],
          ],
          'Écoute ce qui suit le verbe : un son doit relier les deux mots.',
          [
            DEF_IMP,
            'Devant « en », les verbes en -er prennent un « s » : « donnes-en ». Les verbes comme « finir » en ont déjà un.',
          ],
        );
      }
      if (variante === 'y') {
        return saisie(
          'Tu parles à un seul camarade. Écris « aller » à l’impératif : « ___-y ! »',
          ['vas'],
          [
            ['va', 'Devant « y », « va » prend un « s » : on entend la liaison.'],
            ['aller', 'C’est l’infinitif : le verbe n’est pas conjugué.'],
            ['allez', 'Cette forme s’adresse à plusieurs personnes (vous).'],
          ],
          'Pense à l’expression employée pour encourager un ami à se lancer.',
          [DEF_IMP, 'On écrit « va ! » mais « vas-y ! ».'],
        );
      }
      return saisie(
        'Formule de politesse adressée à plusieurs personnes. Écris « vouloir » à l’impératif présent : « ___ patienter, s’il vous plaît. »',
        // La forme de politesse d’abord ; l’autre écriture relevée sur la page de conjugaison reste acceptée.
        [...imperatifs('vouloir', 'vous')].reverse(),
        [
          ['vouliez', 'C’est l’imparfait.'],
          ['voudrez', 'C’est le futur.'],
          ['vouloir', 'C’est l’infinitif : le verbe n’est pas conjugué.'],
        ],
        'C’est la forme de politesse que l’on lit sur les affiches.',
        [DEF_IMP, '« Vouloir » a des formes particulières à l’impératif.'],
      );
    }
    default: {
      const scenario = rng.pick(SCENARIOS);
      const p = rng.pick(PERSONNES_IMP);
      const choisies = pickN(rng, scenario.actions, 3);
      const lignes = choisies.map(
        (a) =>
          `${capitale(p)} ${a.negatif ? `${neDevant(forme(a.v, p))}${forme(a.v, p)} pas` : forme(a.v, p)} ${a.fin}.`,
      );
      const parts = choisies.reduce<string[]>(
        (acc, a, i) => {
          const f = imperatif(a.v, p);
          const avant = a.negatif ? capitale(neDevant(f)) : '';
          acc.push(`${acc.pop() ?? ''}${i === 0 ? '' : ' '}Ordre ${i + 1} : ${avant}`);
          acc.push(`${a.negatif ? ' pas' : ''} ${a.fin} !`);
          return acc;
        },
        [''],
      );
      return {
        prompt: `${scenario.titre} : lis le texte, puis récris chaque phrase à l’impératif présent, à la même personne (${p}).`,
        figure: document(scenario.titre, lignes),
        answer: { kind: 'cloze', parts, blanks: choisies.map((a) => textes(imperatifs(a.v, p))) },
        hint: 'Supprime le sujet, puis vérifie la terminaison de chaque verbe.',
        steps: [
          DEF_IMP,
          p === 'tu' ? regleS : `La personne reste « ${p} » : on garde la terminaison, sans le sujet.`,
          `Réponses : ${choisies.map((a) => `**${imperatif(a.v, p)}**`).join(', ')}.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Conditionnel présent ─────────────────────────

const DEF_COND =
  'Le conditionnel présent est un temps de l’indicatif. On y entend le « r » du futur, puis les terminaisons de l’imparfait : -ais, -ais, -ait, -ions, -iez, -aient.';

/** Écriture fautive formée sur l’infinitif entier (« venirais », « avoirais »). */
const surInfinitif = (v: VerbeTemps, p: Personne): string =>
  `${v.replace(/e$/, '')}${{ je: 'ais', tu: 'ais', il: 'ait', nous: 'ions', vous: 'iez', ils: 'aient' }[p]}`;

const piegesConditionnel = (v: VerbeTemps, p: Personne): Piege[] => [
  [conjugue('futur', v, p), 'C’est le futur : il manque la marque « -ai- » ou « -i- ».'],
  [conjugue('imparfait', v, p), 'C’est l’imparfait : il manque le « r » du futur.'],
  [
    surInfinitif(v, p),
    `Le radical du conditionnel de « ${v} » ne vient pas de l’infinitif entier : il faut le mémoriser.`,
  ],
  [forme(v, p), 'C’est le présent de l’indicatif.'],
];

interface Hypothese {
  readonly sa: string;
  readonly pa: Personne;
  readonly va: VerbeTemps;
  readonly fa: string;
  readonly sb: string;
  readonly pb: Personne;
  readonly vb: VerbeTemps;
  readonly fb: string;
}

const HYPOTHESES: readonly Hypothese[] = [
  { sa: 'tu', pa: 'tu', va: 'avoir', fa: 'un vélo', sb: 'tu', pb: 'tu', vb: 'aller', fb: 'à la mer' },
  { sa: 'nous', pa: 'nous', va: 'être', fa: 'en vacances', sb: 'nous', pb: 'nous', vb: 'faire', fb: 'une randonnée' },
  { sa: 'vous', pa: 'vous', va: 'venir', fa: 'ce soir', sb: 'vous', pb: 'vous', vb: 'voir', fb: 'les étoiles' },
  {
    sa: 'les voisins',
    pa: 'ils',
    va: 'avoir',
    fa: 'un jardin',
    sb: 'ils',
    pb: 'ils',
    vb: 'dire',
    fb: 'merci à la pluie',
  },
  { sa: 'nous', pa: 'nous', va: 'avoir', fa: 'le temps', sb: 'nous', pb: 'nous', vb: 'finir', fb: 'la maquette' },
  { sa: 'tu', pa: 'tu', va: 'vouloir', fa: 'venir', sb: 'tu', pb: 'tu', vb: 'pouvoir', fb: 'rester dîner' },
  { sa: 'vous', pa: 'vous', va: 'parler', fa: 'moins vite', sb: 'je', pb: 'je', vb: 'prendre', fb: 'des notes' },
  { sa: 'la gardienne', pa: 'il', va: 'être', fa: 'là', sb: 'elle', pb: 'il', vb: 'avoir', fb: 'la clé' },
];

function conditionnelDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(REGULIERS_6);
      const p = rng.pick(PERSONNES);
      const ecrire = (f: string) => avecSujet(p === 'il' ? 'elle' : p, f);
      const bon = ecrire(conditionnel(v, p));
      return qcm(rng, {
        prompt: 'Quelle forme est au conditionnel présent ?',
        bon,
        pieges: [
          [ecrire(conjugue('futur', v, p)), 'C’est le futur : on entend le « r », sans la marque de l’imparfait.'],
          [ecrire(conjugue('imparfait', v, p)), 'C’est l’imparfait : il n’y a pas le « r » du futur.'],
        ],
        hint: 'Cherche la forme qui cumule deux marques.',
        steps: [DEF_COND],
      });
    }
    case 2: {
      const v = rng.pick(REGULIERS_6);
      const [p1, p2, p3] = pickN(rng, SANS_JE, 3) as [
        Exclude<Personne, 'je'>,
        Exclude<Personne, 'je'>,
        Exclude<Personne, 'je'>,
      ];
      const items = rng.shuffle([
        { t: 'conditionnel présent', texte: `${PRONOMS[p1]} ${conditionnel(v, p1)}` },
        { t: 'futur', texte: `${PRONOMS[p2]} ${conjugue('futur', v, p2)}` },
        { t: 'imparfait', texte: `${PRONOMS[p3]} ${conjugue('imparfait', v, p3)}` },
      ]);
      const { right, pairs } = appariement(
        rng,
        items.map((x) => x.t),
      );
      return {
        prompt: `Associe chaque forme du verbe « ${v} » (${liste(items.map((x) => x.texte))}) à son temps.`,
        answer: { kind: 'match', left: items.map((x) => x.texte), right, pairs },
        hint: 'Cherche d’abord le « r » devant la fin du verbe, puis « ai » ou « i ».',
        steps: [DEF_COND, `Réponses : ${items.map((x) => `**${x.texte}** : ${x.t}`).join(' ; ')}.`],
      };
    }
    case 3:
    case 4: {
      const v = level === 3 ? rng.pick(REGULIERS_6) : rng.pick(IRR_COND);
      const p = rng.pick(SANS_JE);
      return saisie(
        `Écris « ${v} » au conditionnel présent : « ${PRONOMS[p]} ___ »`,
        conditionnels(v, p),
        piegesConditionnel(v, p),
        level === 3
          ? 'Pars du futur, puis remplace la fin par celle de l’imparfait.'
          : 'Rappelle-toi le futur de ce verbe : le radical est le même.',
        [DEF_COND, `Au futur : « ${PRONOMS[p]} ${conjugue('futur', v, p)} ».`],
      );
    }
    default: {
      const [a, b] = pickN(rng, HYPOTHESES, 2) as [Hypothese, Hypothese];
      const paire = [a, b];
      const parts = [
        `Phrase 1 : Si ${a.sa} `,
        ` ${a.fa}, ${a.sb} `,
        ` ${a.fb}. Phrase 2 : Si ${b.sa} `,
        ` ${b.fa}, ${b.sb} `,
        ` ${b.fb}.`,
      ];
      return {
        prompt: `Complète les deux phrases. Après « si », écris le verbe à l’imparfait ; dans l’autre partie, au conditionnel présent.`,
        figure: document(
          'Hypothèses',
          paire.map((h, i) => `Phrase ${i + 1} : ${h.va}, puis ${h.vb}.`),
        ),
        answer: {
          kind: 'cloze',
          parts,
          blanks: paire.flatMap((h) => [
            textes([conjugue('imparfait', h.va, h.pa)]),
            textes(conditionnels(h.vb, h.pb)),
          ]),
        },
        hint: 'La première forme n’a pas de « r » de temps ; la seconde en a un, suivi de « ai » ou « i ».',
        steps: [
          DEF_COND,
          'Avec « si » + imparfait, la conséquence imaginée se met au conditionnel : « Si je le pouvais, je viendrais. »',
          `Réponses : ${paire.map((h) => `**${conjugue('imparfait', h.va, h.pa)}**, **${conditionnel(h.vb, h.pb)}**`).join(' ; ')}.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Marques de temps ─────────────────────────

type TempsM = 'imparfait' | 'futur' | 'conditionnel présent' | 'impératif présent';
const TEMPS_M: readonly TempsM[] = ['imparfait', 'futur', 'conditionnel présent', 'impératif présent'];
const MARQUE_OPTIONS = ['aucune', '-r-', '-ai- ou -i-', '-r- puis -ai- ou -i-'] as const;
const MARQUE_DE: Record<TempsM, (typeof MARQUE_OPTIONS)[number]> = {
  'impératif présent': 'aucune',
  futur: '-r-',
  imparfait: '-ai- ou -i-',
  'conditionnel présent': '-r- puis -ai- ou -i-',
};
const POURQUOI_PAS: Record<(typeof MARQUE_OPTIONS)[number], string> = {
  aucune: 'Il y a bien une marque de temps avant la marque de personne.',
  '-r-': 'Un « -r- » seul, sans « -ai- » ni « -i- », signale le futur : compare avec la forme.',
  '-ai- ou -i-': '« -ai- » ou « -i- » sans « -r- » de temps signale l’imparfait : compare avec la forme.',
  '-r- puis -ai- ou -i-': 'Les deux marques à la suite signalent le conditionnel présent : compare avec la forme.',
};
const PERSONNE_IMPARFAIT: Record<Personne, string> = { je: 's', tu: 's', il: 't', nous: 'ons', vous: 'ez', ils: 'ent' };
const PERSONNE_FUTUR: Record<Personne, string> = { je: 'ai', tu: 'as', il: 'a', nous: 'ons', vous: 'ez', ils: 'ont' };

/** Marque « ai » ou « i » de l’imparfait et du conditionnel. */
export const marqueImparfait = (p: Personne): 'ai' | 'i' => (p === 'nous' || p === 'vous' ? 'i' : 'ai');

export interface Marques {
  readonly forme: string;
  /** Ce qui précède les marques (« chant », « chante », « fini », « finiss »). */
  readonly debut: string;
  /** Marques de temps dans l’ordre, sans tirets (vide à l’impératif). */
  readonly temps: readonly string[];
  readonly personne: string;
}

/** Découpe d’une forme régulière en début, marques de temps et marque de personne. */
export function decoupe(t: TempsM, v: VerbeOrdre, p: Personne): Marques {
  let f: string;
  let temps: string[];
  let personne: string;
  if (t === 'impératif présent') {
    f = imperatif(v, p as PersonneImp);
    temps = [];
    personne = PERSONNE_IMPARFAIT[p];
  } else if (t === 'imparfait') {
    f = conjugue('imparfait', v, p);
    temps = [marqueImparfait(p)];
    personne = PERSONNE_IMPARFAIT[p];
  } else if (t === 'futur') {
    f = conjugue('futur', v, p);
    temps = ['r'];
    personne = PERSONNE_FUTUR[p];
  } else {
    f = conditionnel(v, p);
    temps = ['r', marqueImparfait(p)];
    personne = PERSONNE_IMPARFAIT[p];
  }
  const fin = temps.join('') + personne;
  return { forme: f, debut: f.slice(0, f.length - fin.length), temps, personne };
}

const ecrireM = (d: Marques): string => [`${d.debut}-`, ...d.temps.map((m) => `${m}-`), d.personne].join('');
const variantes = (m: string) => [m, `-${m}-`, `-${m}`, `${m}-`];

const DEF_MARQUES =
  'La terminaison cache des marques : la marque de temps (-ai- ou -i- à l’imparfait, -r- au futur), puis la marque de personne.';
const DEF_MARQUES_COND =
  'Au conditionnel présent, on trouve -r- puis -ai- ou -i- : chante-r-ai-s. À l’impératif présent, il n’y a pas de marque de temps : chant-ons.';

/** Formes possibles à l’impératif : nous et vous (au singulier, la marque est moins nette). */
const IMP_M: readonly PersonneImp[] = ['nous', 'vous'];

function tirerMarques(rng: Rng, t: TempsM) {
  const v = rng.pick(REGULIERS_6);
  const p: Personne = t === 'impératif présent' ? rng.pick(IMP_M) : rng.pick(PERSONNES);
  const d = decoupe(t, v, p);
  const texte = t === 'impératif présent' ? `${capitale(d.forme)} !` : avecSujet(p === 'il' ? 'elle' : p, d.forme);
  return { t, v, p, d, texte };
}

/** Verbe à analyser dans un texte suivi : verbe régulier, temps imposé par la phrase, personne du sujet. */
interface VerbeEnTexte {
  readonly v: VerbeOrdre;
  readonly t: TempsM;
  readonly p: Personne;
}

const enTexte = (v: VerbeOrdre, t: TempsM, p: Personne): VerbeEnTexte => ({ v, t, p });

interface Recit {
  readonly titre: string;
  readonly situation: string;
  /** Phrases du texte : le verbe à analyser entre le début et la suite. */
  readonly phrases: readonly (readonly [string, VerbeEnTexte, string])[];
}

/** Textes écrits pour l’exercice : récit à l’imparfait, annonce au futur, hypothèses avec « si », puis un ordre. */
export const RECITS_MARQUES: readonly Recit[] = [
  {
    titre: 'La chorale prépare son concert',
    situation: 'La cheffe de chœur s’adresse à ses élèves avant le concert de juin.',
    phrases: [
      ['L’an dernier, la chorale ', enTexte('chanter', 'imparfait', 'il'), ' dans une petite salle.'],
      ['Les nouveaux ', enTexte('regarder', 'imparfait', 'ils'), ' leurs pieds pendant les refrains.'],
      ['En juin, nous ', enTexte('porter', 'futur', 'nous'), ' tous un foulard bleu.'],
      [
        'Si le gymnase était libre, les familles ',
        enTexte('écouter', 'conditionnel présent', 'ils'),
        ' le concert assises.',
      ],
      ['Si nous avions un piano, nous ', enTexte('danser', 'conditionnel présent', 'nous'), ' sur le dernier morceau.'],
      ['', enTexte('marcher', 'impératif présent', 'vous'), ' sans bruit jusqu’à la scène !'],
    ],
  },
  {
    titre: 'Au club de jardinage',
    situation: 'Une élève parle du jardin du collège à un camarade qui arrive dans le club.',
    phrases: [
      ['Au printemps, nous ', enTexte('remplir', 'imparfait', 'nous'), ' les arrosoirs chaque matin.'],
      ['Les plus jeunes ', enTexte('porter', 'imparfait', 'ils'), ' les petits sacs de terre.'],
      ['À la rentrée, tu ', enTexte('choisir', 'futur', 'tu'), ' les graines du potager.'],
      [
        'Si la cour était plus grande, nous ',
        enTexte('dessiner', 'conditionnel présent', 'nous'),
        ' une seconde allée.',
      ],
      ['Si tu avais une serre, tu ', enTexte('réussir', 'conditionnel présent', 'tu'), ' tes semis en hiver.'],
      ['', enTexte('finir', 'impératif présent', 'nous'), ' d’arroser avant midi !'],
    ],
  },
  {
    titre: 'La course d’orientation',
    situation: 'Le professeur parle à une équipe avant le départ.',
    phrases: [
      ['L’année passée, vous ', enTexte('marcher', 'imparfait', 'vous'), ' trop loin des balises.'],
      ['Votre capitaine ', enTexte('trouver', 'imparfait', 'il'), ' pourtant le chemin le plus court.'],
      ['Aujourd’hui, les équipes ', enTexte('finir', 'futur', 'ils'), ' le parcours avant la nuit.'],
      ['Si le terrain était sec, vous ', enTexte('sauter', 'conditionnel présent', 'vous'), ' par-dessus les fossés.'],
      [
        'Si votre capitaine avait une boussole, il ',
        enTexte('choisir', 'conditionnel présent', 'il'),
        ' le sentier du bois.',
      ],
      ['', enTexte('regarder', 'impératif présent', 'vous'), ' la carte avant de partir !'],
    ],
  },
];

const LETTRES = ['A', 'B', 'C'] as const;

/** Niveau 5 : dans un texte suivi, temps, marque de temps et marque de personne de trois verbes. */
function marquesEnTexte(rng: Rng): QuestionDraft {
  const recit = rng.pick(RECITS_MARQUES);
  const rangs = pickN(
    rng,
    recit.phrases.map((_, i) => i),
    LETTRES.length,
  ).sort((a, b) => a - b);
  const phrases = recit.phrases.map(([avant, x, apres], i) => {
    const d = decoupe(x.t, x.v, x.p);
    const mot = avant === '' ? capitale(d.forme) : d.forme;
    const rang = rangs.indexOf(i);
    const repere = rang < 0 ? '' : ` (${at(LETTRES, rang)})`;
    return { x, d, mot, rang, ligne: `${avant}${mot}${repere}${apres}` };
  });
  const choisies = phrases.filter((x) => x.rang >= 0);
  const temps = [...TEMPS_M];
  const marques = [...MARQUE_OPTIONS];
  return {
    prompt: `Lis le texte. Pour chaque verbe repéré (${choisies.map((c, i) => `${at(LETTRES, i)} : « ${c.mot} »`).join(', ')}), choisis son temps et sa marque de temps, puis écris sa marque de personne.`,
    figure: document(recit.titre, [recit.situation, ...phrases.map((x) => x.ligne)]),
    answer: {
      kind: 'cloze',
      parts: [
        ...choisies.flatMap((_, i) => [
          `${i === 0 ? '' : '. '}${at(LETTRES, i)}, temps : `,
          ' ; marque de temps : ',
          ' ; marque de personne : ',
        ]),
        '.',
      ],
      blanks: choisies.flatMap(({ x, d }): ClozeBlank[] => [
        { mode: 'list', options: temps, correct: temps.indexOf(x.t) },
        { mode: 'list', options: marques, correct: marques.indexOf(MARQUE_DE[x.t]) },
        textes([d.personne, `-${d.personne}`]),
      ]),
    },
    hint: 'Pour chaque verbe, regarde s’il a un sujet, puis découpe sa fin en partant de la dernière lettre.',
    steps: [
      DEF_MARQUES,
      DEF_MARQUES_COND,
      ...choisies.map(({ x, d, mot }) => `« ${mot} » se découpe ${ecrireM(d)} : ${x.t}.`),
      `Réponses : ${choisies.map(({ x, d }, i) => `${at(LETTRES, i)} : **${x.t}**, **${MARQUE_DE[x.t]}**, **${d.personne}**`).join(' ; ')}.`,
    ],
  };
}

function marquesDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const t = rng.pick<TempsM>(['imparfait', 'futur']);
      const { d, texte } = tirerMarques(rng, t);
      const bon = `-${at(d.temps, 0)}-`;
      return qcm(rng, {
        prompt: `Dans « ${texte} » (${t}), quelle est la marque de temps ?`,
        bon,
        pieges: [
          [`-${d.personne}`, `« -${d.personne} » est la marque de personne : elle change avec le sujet.`],
          [`${d.debut}-`, `« ${d.debut}- » est le début du verbe : il porte son sens, pas le temps.`],
        ],
        hint: 'La marque de temps se place juste avant la marque de personne.',
        steps: [DEF_MARQUES, `Découpe : ${ecrireM(d)}.`],
      });
    }
    case 2: {
      const t = rng.pick(TEMPS_M);
      const { d, texte } = tirerMarques(rng, t);
      const bon = MARQUE_DE[t];
      return qcm(rng, {
        prompt: `Quelle marque de temps contient « ${texte} » ?`,
        bon,
        pieges: MARQUE_OPTIONS.filter((m) => m !== bon).map((m): Piege => [m, POURQUOI_PAS[m]]),
        hint: 'Regarde s’il y a un sujet, puis les lettres placées avant la marque de personne.',
        steps: [DEF_MARQUES, DEF_MARQUES_COND, `Découpe : ${ecrireM(d)} (${t}).`],
      });
    }
    case 3: {
      const t = rng.pick<TempsM>(['imparfait', 'futur', 'conditionnel présent']);
      const { d, texte } = tirerMarques(rng, t);
      return {
        prompt: `Découpe « ${texte} » (${t}) après « ${d.debut}- » : écris dans l’ordre chaque marque de temps, puis la marque de personne.`,
        answer: {
          kind: 'cloze',
          parts: [`${d.debut}- `, ...d.temps.map(() => ' + '), '.'],
          blanks: [...d.temps.map((m) => textes(variantes(m))), textes([d.personne, `-${d.personne}`])],
        },
        hint: 'Commence par la fin : quelles lettres vont avec le sujet ?',
        steps: [
          DEF_MARQUES,
          DEF_MARQUES_COND,
          `Découpe : ${ecrireM(d)}.`,
          `Réponses : ${[...d.temps, d.personne].map((m) => `**${m}**`).join(', ')}.`,
        ],
      };
    }
    case 4: {
      if (rng.int(0, 1) === 0) {
        const v = rng.pick(REGULIERS_6);
        const p = rng.pick(SANS_JE);
        return saisie(
          `Garde le même verbe et le même sujet, mais change les marques de temps : futur « ${PRONOMS[p]} ${conjugue('futur', v, p)} » → conditionnel présent « ${PRONOMS[p]} ___ ».`,
          conditionnels(v, p),
          [
            [
              conjugue('futur', v, p),
              'C’est encore le futur : ajoute la marque « -ai- » ou « -i- » et la bonne marque de personne.',
            ],
            [conjugue('imparfait', v, p), 'C’est l’imparfait : il manque le « -r- ».'],
          ],
          'Garde le « -r- », puis ajoute la marque de l’imparfait et la marque de personne.',
          [DEF_MARQUES, DEF_MARQUES_COND],
        );
      }
      const a = tirerMarques(rng, 'impératif présent');
      const b = tirerMarques(rng, rng.pick<TempsM>(['imparfait', 'futur', 'conditionnel présent']));
      const deux = rng.shuffle([a, b]);
      const options = [...MARQUE_OPTIONS];
      return {
        prompt: `Pour chaque forme, choisis sa marque de temps, puis écris sa marque de personne. A : « ${at(deux, 0).texte} » ; B : « ${at(deux, 1).texte} ».`,
        answer: {
          kind: 'cloze',
          parts: [
            'A, marque de temps : ',
            ' ; marque de personne : ',
            '. B, marque de temps : ',
            ' ; marque de personne : ',
            '.',
          ],
          blanks: deux.flatMap((x): ClozeBlank[] => [
            { mode: 'list', options, correct: options.indexOf(MARQUE_DE[x.t]) },
            textes([x.d.personne, `-${x.d.personne}`]),
          ]),
        },
        hint: 'Une forme sans sujet qui donne un ordre se découpe en deux parties seulement.',
        steps: [
          DEF_MARQUES,
          DEF_MARQUES_COND,
          ...deux.map((x) => `${x.texte} (${x.t}) : ${ecrireM(x.d)}.`),
          `Réponses : ${deux.map((x) => `**${MARQUE_DE[x.t]}**, **${x.d.personne}**`).join(' ; ')}.`,
        ],
      };
    }
    default:
      return marquesEnTexte(rng);
  }
}

// ───────────────────────── 4. Passé composé et plus-que-parfait ─────────────────────────

const DEF_COMPOSE =
  'Un temps composé a deux parties : l’auxiliaire être ou avoir, puis le participe passé. Passé composé : auxiliaire au présent. Plus-que-parfait : auxiliaire à l’imparfait.';
const DEF_ACCORD = 'Avec l’auxiliaire être, le participe passé s’accorde avec le sujet.';

const AVOIR_REGULIERS = REGULIERS_6.filter((v): v is VerbeOrdre & VerbeAvoir => v !== 'aller' && v !== 'venir');
const AVOIR_IRREGULIERS = IRREGULIERS_CITES.filter((v): v is VerbeAvoir => v !== 'aller' && v !== 'venir');
const finDe = (v: VerbeCompose): string => (avecEtre(v) ? FINS_ETRE[v] : FINS[v]);
const autreTemps = (t: Compose): Compose => (t === 'passé composé' ? 'plus-que-parfait' : 'passé composé');
const sujetsDe = (v: VerbeCompose): readonly SujetC[] => (avecEtre(v) ? SUJETS_TIERS : SUJETS_C);

/** Pourquoi cette réponse : temps de l’auxiliaire, participe passé et accord. */
const pourquoiCompose = (t: Compose, v: VerbeCompose, s: SujetC): Rich[] => [
  `Au ${t}, l’auxiliaire « ${avecEtre(v) ? 'être' : 'avoir'} » est ${t === 'passé composé' ? 'au présent' : 'à l’imparfait'} : « ${auxiliaireAu(t, v, s.personne)} ». Le participe passé s’écrit ici « ${accorde(v, s)} ».`,
  avecEtre(v) ? DEF_ACCORD : 'Avec « avoir », le participe passé ne s’accorde pas avec le sujet.',
];

/** Erreurs typiques : autre temps composé, mauvais auxiliaire, accord oublié ou ajouté. */
function piegesCompose(t: Compose, v: VerbeCompose, s: SujetC): Piege[] {
  const pp = accorde(v, s);
  const autreAux = avecEtre(v) ? 'avoir' : 'être';
  const aux = auxiliaireAu(t, v, s.personne);
  const mauvais = auxiliaireAu(t, autreAux === 'être' ? 'aller' : 'chanter', s.personne);
  const pluriel = s.personne === 'ils';
  const pieges: Piege[] = [
    [composeAu(autreTemps(t), v, s), `C’est le ${autreTemps(t)} : regarde le temps de l’auxiliaire.`],
    [`${mauvais} ${pp}`, `« ${v} » se conjugue ici avec « ${avecEtre(v) ? 'être' : 'avoir'} ».`],
  ];
  if (avecEtre(v)) {
    const seul = participeSeul(v);
    if (pp !== seul) pieges.push([`${aux} ${seul}`, 'Avec « être », le participe passé s’accorde avec le sujet.']);
    else pieges.push([`${aux} ${seul}${pluriel ? 's' : 'e'}`, 'Le sujet n’appelle pas cet accord.']);
  } else
    pieges.push([
      `${aux} ${pp}${pp.endsWith('s') ? 'es' : 's'}`,
      'Avec « avoir », le participe passé ne s’accorde pas avec le sujet.',
    ]);
  return pieges;
}

interface Scene {
  readonly recent: readonly [SujetC, VerbeCompose, string];
  readonly avant: readonly [SujetC, VerbeCompose, string];
}

const s6 = (texte: string, personne: Personne, genre: 'm' | 'f' = 'm'): SujetC => ({ texte, personne, genre });
const SCENES: readonly Scene[] = [
  {
    recent: [s6('la voyageuse', 'il', 'f'), 'arriver', 'à la gare'],
    avant: [s6('la voyageuse', 'il', 'f'), 'choisir', 'son train'],
  },
  { recent: [s6('les enfants', 'ils'), 'voir', 'les traces'], avant: [s6('une biche', 'il', 'f'), 'venir', 'boire'] },
  { recent: [s6('nous', 'nous'), 'trouver', 'la réponse'], avant: [s6('nous', 'nous'), 'dessiner', 'un schéma'] },
  {
    recent: [s6('mes cousines', 'ils', 'f'), 'rester', 'à la maison'],
    avant: [s6('mes cousines', 'ils', 'f'), 'prendre', 'froid'],
  },
  {
    recent: [s6('le jardinier', 'il'), 'regarder', 'les fleurs'],
    avant: [s6('la pluie', 'il', 'f'), 'tomber', 'sur le jardin'],
  },
  { recent: [s6('vous', 'vous'), 'faire', 'le gâteau'], avant: [s6('vous', 'vous'), 'choisir', 'la recette'] },
  {
    recent: [s6('les voisines', 'ils', 'f'), 'dire', 'merci'],
    avant: [s6('les garçons', 'ils'), 'porter', 'leurs sacs'],
  },
];

function composeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const t = rng.pick(['passé composé', 'plus-que-parfait', 'imparfait'] as const);
      // L’imparfait n’est proposé qu’avec les verbes dont la forme est relevée (conjugués avec « avoir »).
      const avoir = rng.pick(AVOIR_REGULIERS);
      const v: VerbeCompose = t === 'imparfait' ? avoir : rng.pick<VerbeCompose>([...AVOIR_REGULIERS, ...VERBES_ETRE]);
      const s = rng.pick(sujetsDe(v));
      const gv = t === 'imparfait' ? conjugue('imparfait', avoir, s.personne) : composeAu(t, v, s);
      const phrase = `${avecSujet(s.texte, gv)} ${finDe(v)}.`;
      return qcm(rng, {
        prompt: `Dans « ${phrase} », à quel temps est le verbe « ${v} » ?`,
        bon: t,
        pieges: (['passé composé', 'plus-que-parfait', 'imparfait'] as const)
          .filter((x) => x !== t)
          .map((x): Piege => [
            x,
            x === 'imparfait'
              ? 'L’imparfait s’écrit en un seul mot.'
              : `Au ${x}, l’auxiliaire serait ${x === 'passé composé' ? 'au présent' : 'à l’imparfait'}.`,
          ]),
        hint: 'Compte les parties du verbe, puis regarde le temps de la première.',
        steps: [
          DEF_COMPOSE,
          t === 'imparfait'
            ? `« ${gv} » est un seul mot.`
            : `Auxiliaire « ${auxiliaireAu(t, v, s.personne)} » + participe passé « ${accorde(v, s)} ».`,
        ],
      });
    }
    case 2: {
      const v = rng.pick<VerbeCompose>([...AVOIR_REGULIERS, ...VERBES_ETRE]);
      const s = rng.pick(sujetsDe(v));
      const t = rng.pick(COMPOSES);
      const bon = composeAu(t, v, s);
      return qcm(rng, {
        prompt: `Complète au ${t} : « ${s.texte} ___ ${finDe(v)}. » (${v})`,
        bon,
        pieges: piegesCompose(t, v, s),
        hint: 'Choisis d’abord l’auxiliaire, puis son temps.',
        steps: [DEF_COMPOSE, ...pourquoiCompose(t, v, s)],
      });
    }
    case 3:
    case 4: {
      const negatif = level === 4;
      const v = rng.pick<VerbeCompose>(
        level === 3 ? [...AVOIR_REGULIERS, ...VERBES_ETRE] : [...AVOIR_IRREGULIERS, ...VERBES_ETRE],
      );
      const s = rng.pick(sujetsDe(v));
      const t = rng.pick(COMPOSES);
      const gv = composeAu(t, v, s);
      const nier = (g: string) => {
        const [aux = '', ...reste] = g.split(' ');
        return `${neDevant(aux)}${aux} pas ${reste.join(' ')}`;
      };
      const bon = negatif ? nier(gv) : gv;
      const pieges = piegesCompose(t, v, s).map(([f, why]): Piege => [negatif ? nier(f) : f, why]);
      if (negatif) {
        const [aux = '', ...reste] = gv.split(' ');
        pieges.push([`${neDevant(aux)}${aux} ${reste.join(' ')} pas`, '« pas » se place avant le participe passé.']);
      }
      return saisie(
        negatif
          ? `Écris « ${v} » au ${t}, à la forme négative avec « ne … pas » : « ${s.texte} ___ ${finDe(v)}. »`
          : `Écris « ${v} » au ${t} : « ${s.texte} ___ ${finDe(v)}. »`,
        [bon],
        pieges,
        negatif
          ? 'Les deux mots de la négation entourent l’auxiliaire.'
          : 'Deux mots : l’auxiliaire au bon temps, puis le participe passé.',
        [
          DEF_COMPOSE,
          ...pourquoiCompose(t, v, s),
          ...(negatif ? ['« ne » (ou « n’ ») et « pas » encadrent l’auxiliaire.'] : []),
        ],
      );
    }
    default: {
      const [a, b] = pickN(rng, SCENES, 2) as [Scene, Scene];
      const phrases = [a, b].flatMap((scene) => {
        const [maintenant, avant] = rng.pick([
          ['Ce matin', 'La veille'],
          ['Aujourd’hui', 'Quelques jours plus tôt'],
        ] as const);
        return rng.shuffle([
          { x: scene.recent, t: 'passé composé' as const, debut: maintenant },
          {
            x: scene.avant,
            t: 'plus-que-parfait' as const,
            debut: avant,
          },
        ]);
      });
      const parts: string[] = [''];
      phrases.forEach((ph, i) => {
        const [s, v, fin] = ph.x;
        parts.push(`${parts.pop() ?? ''}${i === 0 ? '' : ' '}${ph.debut}, ${s.texte} (${v}) `);
        parts.push(` ${fin}.`);
      });
      const justes = phrases.map((ph) => composeAu(ph.t, ph.x[1], ph.x[0]));
      return {
        prompt:
          'Deux petits récits. Mets au passé composé l’action la plus récente de chacun, et au plus-que-parfait l’action qui s’était passée avant.',
        figure: document(
          'Moments et verbes',
          phrases.map((ph) => `${ph.debut} : ${ph.x[1]} (${ph.x[0].texte}).`),
        ),
        answer: { kind: 'cloze', parts, blanks: saisies(justes) },
        hint: 'Pour chaque phrase, repère d’abord le moment, puis choisis le temps de l’auxiliaire.',
        steps: [
          DEF_COMPOSE,
          'Le plus-que-parfait dit ce qui s’est accompli avant une autre action passée.',
          DEF_ACCORD,
          `Réponses : ${justes.map((j) => `**${j}**`).join(', ')}.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. Variations du radical du 1er groupe ─────────────────────────

const CHANGEMENT: Record<Exclude<Famille6, 'envoyer'>, string> = {
  cer: 'le c prend une cédille',
  ger: 'un e s’ajoute après le g',
  yer: 'le y devient i',
  double: 'la consonne l ou t est doublée',
  'accent-e': 'le e muet devient è',
  'accent-é': 'le é devient è',
};
const POURQUOI: Record<Famille6, string> = {
  cer: 'Devant a ou o, « c » devient « ç » pour garder le son « s ».',
  ger: 'Devant a ou o, on écrit « ge » pour garder le son « j ».',
  yer: 'Devant un e muet, le « y » devient « i ».',
  double: 'Devant un e muet, « appeler » et « jeter » doublent leur consonne.',
  'accent-e': 'Devant un e muet, le « e » du radical prend un accent grave.',
  'accent-é': 'Devant un e muet, le « é » du radical devient « è ».',
  envoyer: '« Envoyer » a un radical particulier au conditionnel (enverr-) ; au présent, le y devient i.',
};
const regle = (v: VerbeVar) => POURQUOI[familleDe(v)];

/** Explication d’une forme : la variation, ou la raison pour laquelle le radical ne change pas. */
function explique(v: VerbeVar, f: string): string {
  const base = v.slice(0, -2);
  const fin = f.startsWith(base) ? f.slice(base.length) : '';
  if (!['ais', 'ait', 'ions', 'iez', 'aient', 'ons', 'ez'].includes(fin)) return regle(v);
  return ['cer', 'ger'].includes(familleDe(v))
    ? `Devant « i », le « ${familleDe(v) === 'cer' ? 'c' : 'g'} » garde déjà le bon son : le radical « ${base}- » ne change pas.`
    : `La terminaison « -${fin} » ne commence pas par un e muet : le radical « ${base}- » s’écrit comme dans l’infinitif.`;
}

/** Personne qui montre la variation au présent. */
const presentVisible = (v: VerbeVar): Personne => (['cer', 'ger'].includes(familleDe(v)) ? 'nous' : 'je');
const sansLettre = (v: VerbeVar, p: Personne): string => {
  const base = v.slice(0, -2);
  return p === 'nous' ? `${base}ons` : `${base}e`;
};
/** Seconde écriture fautive typique de chaque famille, au présent. */
function autreFaute(v: VerbeVar): string {
  const base = v.slice(0, -2);
  switch (familleDe(v)) {
    case 'cer':
      return `${base}eons`;
    case 'ger':
      return `${base}éons`;
    case 'yer':
      return `${base.slice(0, -1)}i`;
    case 'double':
      return `${base.slice(0, -2)}è${base.slice(-1)}e`;
    case 'accent-e':
      return `${base.slice(0, -2)}é${base.slice(-1)}e`;
    default:
      return `${base.replace(/é([^é]*)$/, 'e$1')}e`;
  }
}
const ecrireP = (p: Personne, f: string) => avecSujet(p, f);

const VERBES_L1 = VERBES_VAR.filter((v) => familleDe(v) !== 'envoyer');

/** Écriture fautive au conditionnel : infinitif non modifié (ou cédille ajoutée à tort). */
function fauteCond(v: VerbeVar, p: Personne): string {
  const fin = { je: 'ais', tu: 'ais', il: 'ait', nous: 'ions', vous: 'iez', ils: 'aient' }[p];
  if (familleDe(v) === 'cer') return `${v.slice(0, -3)}çer${fin}`;
  if (familleDe(v) === 'ger') return `${v.slice(0, -2)}r${fin}`;
  return `${v}${fin}`;
}

/** Écriture fautive à l’imparfait. */
function fauteImparfait(v: (typeof VERBES_IMPARFAIT_VAR)[number], p: Personne): string {
  const fin = { je: 'ais', tu: 'ais', il: 'ait', nous: 'ions', vous: 'iez', ils: 'aient' }[p];
  const base = v.slice(0, -2);
  const devantI = p === 'nous' || p === 'vous';
  switch (familleDe(v)) {
    case 'cer':
      return devantI ? `${base.slice(0, -1)}ç${fin}` : `${base}${fin}`;
    case 'ger':
      return devantI ? `${base}e${fin}` : `${base}${fin}`;
    case 'yer':
      return `${base.slice(0, -1)}i${fin}`;
    case 'double':
      return `${base}${base.slice(-1)}${fin}`;
    default:
      return `${base.slice(0, -2)}è${base.slice(-1)}${fin}`;
  }
}

type TempsV = 'présent' | 'imparfait' | 'conditionnel présent' | 'impératif présent';
interface Trou {
  readonly t: TempsV;
  readonly v: VerbeVar;
  readonly p: Personne;
  readonly fin: string;
}

const trou = (t: TempsV, v: VerbeVar, p: Personne, fin: string): Trou => ({ t, v, p, fin });
const PHRASES_VAR: readonly Trou[] = [
  trou('présent', 'commencer', 'nous', 'la séance'),
  trou('présent', 'nettoyer', 'il', 'son établi'),
  trou('présent', 'appeler', 'ils', 'le guide'),
  trou('présent', 'préférer', 'tu', 'ce roman'),
  trou('imparfait', 'lancer', 'il', 'le ballon'),
  trou('imparfait', 'nager', 'ils', 'dans le lac'),
  trou('imparfait', 'appuyer', 'nous', 'sur la porte'),
  trou('imparfait', 'jeter', 'vous', 'des cailloux'),
  trou('conditionnel présent', 'acheter', 'il', 'ce carnet'),
  trou('conditionnel présent', 'appeler', 'nous', 'les secours'),
  trou('conditionnel présent', 'essuyer', 'ils', 'les tables'),
  trou('conditionnel présent', 'envoyer', 'tu', 'une carte'),
  trou('impératif présent', 'manger', 'nous', 'ces fruits'),
  trou('impératif présent', 'lever', 'tu', 'la main'),
  trou('impératif présent', 'avancer', 'nous', 'lentement'),
  trou('impératif présent', 'répéter', 'tu', 'la question'),
];

const reponses = (x: Trou): string[] => {
  switch (x.t) {
    case 'présent':
      return [forme(x.v, x.p)];
    case 'imparfait':
      return [imparfaitVar(x.v as (typeof VERBES_IMPARFAIT_VAR)[number], x.p)];
    case 'conditionnel présent':
      return conditionnels(x.v, x.p);
    default:
      return imperatifs(x.v, x.p as PersonneImp);
  }
};

function variationsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(VERBES_L1);
      const p = presentVisible(v);
      const bon = ecrireP(p, forme(v, p));
      return qcm(rng, {
        prompt: `Quelle écriture du verbe « ${v} » est correcte au présent ?`,
        bon,
        pieges: [
          [ecrireP(p, sansLettre(v, p)), `Ici, le radical change. ${regle(v)}`],
          [ecrireP(p, autreFaute(v)), `Ce n’est pas la bonne modification. ${regle(v)}`],
        ],
        hint: 'Prononce chaque forme : le radical doit garder le bon son.',
        steps: [regle(v)],
      });
    }
    case 2: {
      const familles = pickN(rng, Object.keys(CHANGEMENT) as (keyof typeof CHANGEMENT)[], 3);
      const items = familles.map((f) => {
        const v = rng.pick(deFamille(f));
        const p = presentVisible(v);
        return { f, v, texte: `${ecrireP(p, forme(v, p))} (${v})` };
      });
      const { right, pairs } = appariement(
        rng,
        items.map((x) => CHANGEMENT[x.f]),
      );
      return {
        prompt: `Associe chaque forme du présent (${liste(items.map((x) => x.v))}) au changement de son radical.`,
        answer: { kind: 'match', left: items.map((x) => x.texte), right, pairs },
        hint: 'Compare chaque forme avec l’infinitif écrit entre parenthèses.',
        steps: [
          ...items.map((x) => `${x.v} : ${POURQUOI[x.f]}`),
          `Réponses : ${items.map((x) => `**${x.texte}** : ${CHANGEMENT[x.f]}`).join(' ; ')}.`,
        ],
      };
    }
    case 3: {
      const v = rng.pick(VERBES_IMPARFAIT_VAR);
      const p = rng.pick(SANS_JE);
      return saisie(
        `Écris « ${v} » à l’imparfait : « ${PRONOMS[p]} ___ »`,
        [imparfaitVar(v, p)],
        [
          [fauteImparfait(v, p), 'Vérifie la lettre qui suit le radical : la variation dépend d’elle.'],
          [forme(v, p), 'C’est le présent.'],
          [v, 'C’est l’infinitif : le verbe n’est pas conjugué.'],
        ],
        'Regarde la première lettre de la terminaison : a, i ou un e muet ?',
        [
          explique(v, imparfaitVar(v, p)),
          'À l’imparfait, la terminaison commence par « a » ou « i » : le radical ne change que si la lettre suivante l’exige.',
        ],
      );
    }
    case 4: {
      const v = rng.pick(VERBES_VAR);
      const imp = familleDe(v) !== 'envoyer' && rng.int(0, 2) === 0;
      if (imp) {
        const p = rng.pick<PersonneImp>(['tu', 'nous']);
        return saisie(
          `Écris « ${v} » à l’impératif présent (${SITUATIONS[p]}) : « ___ ! »`,
          imperatifs(v, p),
          [
            [p === 'tu' ? v.slice(0, -2) + 'e' : `${v.slice(0, -2)}ons`, `Vérifie le radical. ${regle(v)}`],
            [
              `${imperatif(v, p)}${p === 'tu' ? 's' : ''}`,
              'À l’impératif, ces verbes ne prennent pas de « s » au singulier.',
            ],
            [v, 'C’est l’infinitif : le verbe n’est pas conjugué.'],
            [`${p} ${forme(v, p)}`, 'À l’impératif, on n’écrit pas le sujet.'],
          ],
          'Pense au présent de ce verbe, puis retire le sujet.',
          [explique(v, imperatif(v, p)), 'À l’impératif, le radical s’écrit comme au présent de l’indicatif.'],
        );
      }
      const p = rng.pick(SANS_JE);
      return saisie(
        `Écris « ${v} » au conditionnel présent : « ${PRONOMS[p]} ___ »`,
        conditionnels(v, p),
        [
          [fauteCond(v, p), 'Le radical du conditionnel se construit comme celui du futur : vérifie-le.'],
          [
            imperatif(v, 'vous'),
            'Cette forme n’a pas les marques du conditionnel : « -r- », puis « -ai- » ou « -i- ».',
          ],
          [v, 'C’est l’infinitif : le verbe n’est pas conjugué.'],
        ],
        'Le conditionnel se construit sur le radical du futur : dis la forme du futur à voix haute.',
        [
          familleDe(v) === 'cer' || familleDe(v) === 'ger'
            ? 'Au conditionnel, le « c » et le « g » restent suivis d’un « e » (-erais) : le son ne change pas, l’écriture non plus.'
            : familleDe(v) === 'accent-é'
              ? 'Deux écritures sont admises : avec « é » ou avec « è ».'
              : regle(v),
        ],
      );
    }
    default: {
      const temps = rng.shuffle<TempsV>(['présent', 'imparfait', 'conditionnel présent', 'impératif présent']);
      const phrases = temps.map((t) => rng.pick(PHRASES_VAR.filter((x) => x.t === t)));
      const sujet = (x: Trou) => (x.p === 'il' ? 'elle' : x.p);
      const parts: string[] = [''];
      phrases.forEach((x, i) => {
        const debut = x.t === 'impératif présent' ? '' : `${capitale(sujet(x))} `;
        parts.push(`${parts.pop() ?? ''}${i === 0 ? '' : ' '}${i + 1}. ${debut}`);
        parts.push(` ${x.fin}${x.t === 'impératif présent' ? ' !' : '.'}`);
      });
      return {
        prompt: 'Complète les quatre phrases : lis dans le document le verbe et le temps de chaque ligne.',
        figure: document(
          'Verbes à conjuguer',
          phrases.map((x, i) => `${i + 1}. ${x.v}, ${x.t}${x.t === 'impératif présent' ? ` (${x.p})` : ''}`),
        ),
        answer: { kind: 'cloze', parts, blanks: phrases.map((x) => textes(reponses(x))) },
        hint: 'Pour chaque verbe, regarde la première lettre de la terminaison avant d’écrire le radical.',
        steps: [
          ...phrases.map((x) => `${x.v} : ${explique(x.v, reponses(x)[0] ?? '')}`),
          `Réponses : ${phrases.map((x) => `**${reponses(x)[0] ?? ''}**`).join(', ')}.`,
        ],
      };
    }
  }
}

// ───────────────────────── Notions ─────────────────────────

interface Notion {
  readonly id: string;
  readonly title: string;
  readonly memo: Skill['lesson']['memo'];
  readonly factId: string;
  readonly faits: readonly string[];
  readonly verbes: readonly string[];
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
    sources: sourcesConjugaison6e([n.factId, ...n.faits], n.verbes),
  },
  generate: n.generate,
});

const ORDRES_VERBES = Object.keys(ORDRES) as VerbeOrdre[];

export const F6_CONJUGAISON: readonly Skill[] = [
  skill({
    id: 'f6-imperatif-present',
    title: 'L’impératif présent',
    memo: [
      'L’**impératif** donne un ordre ou un conseil, sans sujet écrit, à trois personnes : « Chante ! Chantons ! Chantez ! »',
      'Au singulier, un verbe en -er n’a pas de « s » (« chante ! »), sauf avec « -en » ou « -y » après un trait d’union : « donnes-en ».',
      'Il en va de même pour « aller » : « va ! » mais « vas-y ! ».',
    ],
    factId: 'c6-a-memoriser',
    faits: [
      'c6-imp-ordre',
      'c6-imp-trois',
      'c6-imp-sans-pronom',
      'c6-imp-s',
      'c6-en-s',
      'c6-vas-y',
      'c6-defense',
      'c6-ne-auxiliaire',
      ...ORDRES_VERBES.map((v) => `c6-imp-${v}`),
    ],
    verbes: ORDRES_VERBES,
    generate: imperatifDraft,
  }),
  skill({
    id: 'f6-conditionnel-present',
    title: 'Le conditionnel présent',
    memo: [
      'Le **conditionnel présent** garde le « r » du futur et prend les fins de l’imparfait : je chanterais, nous chanterions.',
      'Après « si » + **imparfait**, il dit ce qui arriverait : « Si je le pouvais, je viendrais. »',
    ],
    factId: 'c6-a-memoriser',
    faits: [
      'c6-cond-indicatif',
      'c6-cond-hypothese',
      'c6-cond-symetrie',
      ...TOUS_C.filter((v) => ORDRES_VERBES.includes(v as VerbeOrdre)).map((v) => `c6-cond-${v}`),
    ],
    verbes: [...REGULIERS_6, ...IRR_COND],
    generate: conditionnelDraft,
  }),
  skill({
    id: 'f6-marques-temps',
    title: 'Les marques de temps',
    memo: [
      'La **marque de temps** précède la **marque de personne** : -ai- ou -i- à l’**imparfait**, -r- au **futur**.',
      'Le **conditionnel présent** réunit les deux : chante-r-ai-s, chante-r-i-ons.',
      'L’**impératif** présent n’a pas de marque de temps : chant-ons !',
    ],
    factId: 'c6-marques-nouvelles',
    faits: [
      'c6-marques',
      'c6-marques-cm1',
      'c6-desinence',
      'c6-marque-temps',
      'c6-marque-personne',
      'c6-imp-non-temporel',
      'c6-cond-symetrie',
    ],
    verbes: REGULIERS_6,
    generate: marquesDraft,
  }),
  skill({
    id: 'f6-passe-compose-plus-que-parfait',
    title: 'Passé composé et plus-que-parfait',
    memo: [
      'Un **temps composé** réunit un **auxiliaire** et un **participe passé** : « j’ai chanté », « j’avais chanté ».',
      'Au **passé composé**, l’auxiliaire est au présent ; au **plus-que-parfait**, à l’imparfait.',
      'Avec être, le participe s’accorde avec le sujet : « elles étaient parties ».',
    ],
    factId: 'c6-composition',
    faits: [
      'c6-accord-etre',
      'c6-forme-composee',
      'c6-pc',
      'c6-pqp',
      'c6-accompli',
      'c6-negation',
      'c6-ne-auxiliaire',
      ...VERBES_ETRE.flatMap((v) => [`c6-pc-${v}`, `c6-pqp-${v}`]),
    ],
    verbes: [...AVOIR_REGULIERS, ...AVOIR_IRREGULIERS, ...VERBES_ETRE],
    generate: composeDraft,
  }),
  skill({
    id: 'f6-variations-radical',
    title: 'Les variations du radical du 1er groupe',
    memo: [
      'Au **premier groupe**, le **radical** change parfois d’écriture : nous commençons, nous mangeons.',
      'Devant un e muet : j’appelle, j’achète, je répète, je nettoie.',
      'Au conditionnel aussi : j’appellerais, j’achèterais, j’enverrais.',
    ],
    factId: 'c6-variations',
    faits: [
      'c6-variations-cm1',
      'c6-groupe-1',
      ...Object.values(FAIT_FAMILLE_6),
      'c6-jeter',
      ...VERBES_VAR.map((v) => `c6-cond-${v}`),
    ],
    verbes: VERBES_VAR,
    generate: variationsDraft,
  }),
];
