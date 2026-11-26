import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import {
  COORDONNEES,
  DOUBLES,
  ELLIPSES,
  GROUPES_SANS_VERBE,
  JUXTAPOSEES,
  MIXTES,
  NOM_SIGNE,
  PROPOSITIONS,
  SIMPLES,
  SUB_DEBUT,
  SUB_FIN,
  classeDe,
  faitPhraseComplexe6e,
  principaleTexte,
  propTexte,
  sourcesPhraseComplexe6e,
  subTexte,
  texteCoord,
  texteJuxta,
  texteSubord,
  type Classe6e,
  type Coord,
  type Juxta,
  type Signe,
  type Subord,
} from './phrase-complexe-6e.donnees.ts';
import { maj } from './phrase-simple.donnees.ts';
import { appariement, at, avecOuSansPoint, document, listes, pickN, saisies, segments, textTraps } from './outils.ts';

/**
 * Chapitre « La phrase complexe » (6e). Programme de français du cycle 3 (BO du 17 avril 2025), enseignement de la
 * langue, 6e : « Se repérer dans la phrase complexe ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), 6e — « ${faitPhraseComplexe6e(id).citation} »`;

const SUBORD: readonly Subord[] = [...SUB_FIN, ...SUB_DEBUT];

const DEF_PROP = 'Une proposition est formée d’un groupe sujet et d’un groupe verbal, avec un verbe conjugué.';
const DEF_COMPLEXE = 'Phrase simple : une seule proposition. Phrase complexe : au moins deux propositions.';
const DEF_JUXTA =
  'Juxtaposition : deux propositions indépendantes séparées par une virgule, un point-virgule ou les deux points, sans conjonction de coordination.';
const DEF_COORD =
  'Coordination : deux propositions sur le même plan reliées par une conjonction de coordination (mais, ou, et, or, ni, car).';
const DEF_SUB =
  'Subordination : une proposition subordonnée est incluse dans la proposition principale et dépend d’elle, souvent grâce à une conjonction de subordination.';
const DEF_ROLE =
  'La conjonction de coordination relie des éléments sur le même plan ; la conjonction de subordination fait entrer une proposition subordonnée dans la principale.';

type Mode = 'juxtaposition' | 'coordination' | 'subordination';
const MODES: readonly Mode[] = ['juxtaposition', 'coordination', 'subordination'];
const AUCUN = 'phrase simple';

interface Exemple {
  readonly texte: string;
  readonly mode: Mode | typeof AUCUN;
  readonly pourquoi: Rich;
}

const exJuxta = (j: Juxta): Exemple => ({
  texte: texteJuxta(j),
  mode: 'juxtaposition',
  pourquoi: `Les deux propositions sont séparées par ${NOM_SIGNE[j.signe]}, sans conjonction.`,
});
const exCoord = (c: Coord): Exemple => ({
  texte: texteCoord(c),
  mode: 'coordination',
  pourquoi: `« ${c.mot} » est une conjonction de coordination entre deux propositions.`,
});
const exSub = (x: Subord): Exemple => ({
  texte: texteSubord(x),
  mode: 'subordination',
  pourquoi: `« ${x.mot} » introduit la proposition subordonnée « ${subTexte(x)} ».`,
});
const exSimple = (texte: string, verbe: string): Exemple => ({
  texte,
  mode: AUCUN,
  pourquoi: `Un seul verbe conjugué (« ${verbe} ») : une seule proposition.`,
});

const unJuxta = (rng: Rng) => exJuxta(rng.pick(JUXTAPOSEES));
const unCoord = (rng: Rng) => exCoord(rng.pick(COORDONNEES));
const unSub = (rng: Rng, banque: readonly Subord[] = SUBORD) => exSub(rng.pick(banque));
const unSimple = (rng: Rng) => {
  const s = rng.pick(SIMPLES);
  return exSimple(s.texte, s.verbe);
};

/** QCM « quelle phrase… » : la bonne phrase et des phrases d'autres modes. */
function quellePhrase(rng: Rng, bon: Exemple, faux: readonly Exemple[], prompt: string, def: string): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    bon.texte,
    faux.map((f) => ({ label: f.texte, why: f.pourquoi })),
  );
  return {
    prompt,
    answer,
    traps,
    hint: 'Repère les verbes conjugués, puis regarde ce qui sépare ou relie les propositions.',
    steps: [def, bon.pourquoi, `La réponse est **${bon.texte}**`],
  };
}

/** Un verbe pronominal est accepté avec ou sans son pronom. */
const verbeAccepte = (v: string): string[] => [...new Set([v, v.replace(/^(se |s’)/, '')])];
const saisieVerbe = (v: string) => ({ mode: 'text' as const, accepted: verbeAccepte(v) });
const saisieMot = (mot: string) => ({ mode: 'text' as const, accepted: mot === 'dès que' ? [mot, 'des que'] : [mot] });

const avecVariantes = (texte: string): string[] => {
  const base = [...avecOuSansPoint(texte)];
  return [...base, ...base.filter((t) => t.includes('œ')).map((t) => t.replaceAll('œ', 'oe'))];
};

// ───────────────────────── 1. La proposition ─────────────────────────

const listeVerbes = (verbes: readonly string[]) => verbes.map((v) => `« ${v} »`).join(', ');

function propositionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const bon = propTexte(rng.pick(PROPOSITIONS));
      const faux = pickN(rng, GROUPES_SANS_VERBE, 2);
      const { answer, traps } = choice(
        rng,
        bon,
        faux.map((g) => ({ label: g, why: `« ${g} » n’a pas de verbe conjugué : ce n’est qu’un groupe de mots.` })),
      );
      return {
        prompt: 'Quelle suite de mots est une proposition ?',
        answer,
        traps,
        hint: 'Cherche un verbe conjugué et le groupe qui fait l’action ou dont on parle.',
        steps: [DEF_PROP, 'Une seule suite contient un sujet et un verbe conjugué.', `C’est **${bon}**.`],
      };
    }
    case 2: {
      const props = pickN(rng, PROPOSITIONS, 3);
      const { right, pairs } = appariement(
        rng,
        props.map((x) => x.s),
      );
      return {
        prompt: `Associe chaque proposition à son groupe sujet. Verbes à observer : ${listeVerbes(props.map((x) => x.v).sort())}.`,
        answer: { kind: 'match', left: props.map(propTexte), right, pairs },
        hint: 'Pose la question « Qui est-ce qui… ? » au verbe de chaque proposition.',
        steps: [
          DEF_PROP,
          'Dans chaque proposition, le sujet répond à « qui est-ce qui » suivi du verbe.',
          `Réponses : ${props.map((x) => `**${x.s}** (${x.v})`).join(' ; ')}.`,
        ],
      };
    }
    case 3: {
      const c = rng.pick(COORDONNEES.filter((x) => x.a.s !== x.b.s));
      const x = c.b;
      return {
        prompt: `Dans « ${texteCoord(c)} », analyse la seconde proposition.`,
        answer: {
          kind: 'cloze',
          parts: segments(['Groupe sujet : ', 'Verbe conjugué : ']),
          blanks: [...saisies([x.s]), saisieVerbe(x.v)],
        },
        hint: 'La seconde proposition commence après le mot qui relie les deux parties.',
        steps: [DEF_PROP, `La seconde proposition est « ${propTexte(x)} ».`, `Réponses : **${x.s}**, **${x.v}**.`],
      };
    }
    case 4: {
      const e = rng.pick(ELLIPSES);
      const n = e.verbes.length;
      return {
        prompt: `Le sujet n’est écrit qu’une fois. Combien de propositions contient « ${e.texte} » ? Écris-le en chiffres.`,
        answer: num(n),
        traps: numTraps(r(n), [
          [1, 'Le sujet n’est écrit qu’une fois, mais chaque verbe conjugué forme une proposition.'],
          [n - 1, 'Tu en as oublié une : compte tous les verbes conjugués.'],
          [n + 1, 'Tu en as compté une de trop : un nom ou un infinitif ne forme pas de proposition.'],
        ]),
        hint: 'Repère chaque verbe conjugué et demande-toi quel est son sujet, même s’il n’est pas répété.',
        steps: [
          'Le groupe sujet n’est souvent exprimé que dans la première proposition.',
          `Sujet « ${e.sujet} » pour les verbes ${listeVerbes(e.verbes)}.`,
          `Il y a **${n}** propositions.`,
        ],
      };
    }
    default: {
      const [e1, e2] = pickN(rng, ELLIPSES, 2);
      const s = rng.pick(SIMPLES);
      if (!e1 || !e2) throw new Error('banque vide');
      const [i1, i2, i3] = rng.shuffle([0, 1, 2]);
      const lignes = [e1.texte, s.texte, e2.texte];
      const nombres = [e1.verbes.length, 1, e2.verbes.length];
      const ordre = [i1 ?? 0, i2 ?? 1, i3 ?? 2];
      const textes = ordre.map((i) => at(lignes, i));
      const attendu = ordre.map((i) => String(at(nombres, i)));
      const sujetDe = ordre.indexOf(0) + 1;
      return {
        prompt: `Lis le document. Écris en chiffres le nombre de propositions de chaque ligne, puis le groupe sujet commun aux propositions de la ligne ${sujetDe}.`,
        figure: document('Journal d’une sortie', textes),
        answer: {
          kind: 'cloze',
          parts: segments(['Ligne 1 : ', 'Ligne 2 : ', 'Ligne 3 : ', `Sujet de la ligne ${sujetDe} : `]),
          blanks: saisies([...attendu, e1.sujet]),
        },
        hint: 'Compte les verbes conjugués ligne par ligne. Un sujet peut servir à plusieurs verbes.',
        steps: [
          DEF_PROP,
          `Un sujet non répété sert aux verbes suivants : ${listeVerbes(e1.verbes)} ont pour sujet « ${e1.sujet} ».`,
          `Réponses : **${attendu.join(', ')}** ; sujet : **${e1.sujet}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Phrase simple ou complexe ─────────────────────────

type Sorte = 'simple' | 'complexe';
const SORTES: readonly Sorte[] = ['simple', 'complexe'];

interface Analyse {
  readonly texte: string;
  readonly verbes: readonly string[];
}
const COMPLEXES: readonly Analyse[] = [
  ...COORDONNEES.map((c) => ({ texte: texteCoord(c), verbes: [c.a.v, c.b.v] })),
  ...JUXTAPOSEES.map((j) => ({ texte: texteJuxta(j), verbes: [j.a.v, j.b.v] })),
  ...SUBORD.map((x) => ({ texte: texteSubord(x), verbes: [x.principale.v, x.sub.v] })),
  ...ELLIPSES.map((e) => ({ texte: e.texte, verbes: e.verbes })),
];
const SIMPLES_A: readonly Analyse[] = SIMPLES.map((s) => ({ texte: s.texte, verbes: [s.verbe] }));
const sorteDe = (a: Analyse): Sorte => (a.verbes.length > 1 ? 'complexe' : 'simple');
const preuve = (a: Analyse): Rich =>
  a.verbes.length > 1
    ? `Verbes conjugués ${listeVerbes(a.verbes)} : ${a.verbes.length} propositions, donc phrase complexe.`
    : `Un seul verbe conjugué (« ${at(a.verbes, 0)} ») : une proposition, donc phrase simple.`;

/** Phrases simples longues et phrases complexes courtes : la longueur trompe. */
const SIMPLES_LONGUES = SIMPLES_A.filter((a) => a.texte.length > 45);
const COMPLEXES_COURTES = COMPLEXES.filter((a) => a.texte.length <= 45);

function simpleComplexeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
    case 2: {
      const cherchee = level === 1 ? rng.pick(SORTES) : 'complexe';
      const banque = (s: Sorte): readonly Analyse[] => {
        if (level === 1) return s === 'simple' ? SIMPLES_A : COMPLEXES;
        return s === 'simple' ? SIMPLES_LONGUES : COMPLEXES_COURTES;
      };
      const bon = rng.pick(banque(cherchee));
      const faux = pickN(rng, banque(cherchee === 'simple' ? 'complexe' : 'simple'), level === 1 ? 2 : 3);
      const { answer, traps } = choice(
        rng,
        bon.texte,
        faux.map((f) => ({ label: f.texte, why: preuve(f) })),
      );
      return {
        prompt:
          level === 1
            ? `Quelle phrase est une phrase ${cherchee} ?`
            : 'La longueur ne compte pas. Quelle phrase est complexe ?',
        answer,
        traps,
        hint: 'Compte les propositions : une par verbe conjugué.',
        steps: [DEF_COMPLEXE, preuve(bon), `La réponse est **${bon.texte}**`],
      };
    }
    case 3: {
      const a = rng.pick(rng.int(0, 1) === 0 ? SIMPLES_A : COMPLEXES);
      const n = a.verbes.length;
      return {
        prompt: `Analyse la phrase : « ${a.texte} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Nombre de propositions (en chiffres) : ', 'C’est une phrase ']),
          blanks: [...saisies([String(n)]), ...listes(SORTES, [sorteDe(a)])],
        },
        hint: 'Trouve d’abord chaque verbe conjugué : il forme une proposition.',
        steps: [DEF_COMPLEXE, preuve(a), `Réponses : **${n}**, **${sorteDe(a)}**.`],
      };
    }
    case 4: {
      const pieges = [...SIMPLES_A, ...COMPLEXES.filter((a) => a.verbes.length > 2)];
      const a = rng.pick(pieges);
      const n = a.verbes.length;
      return {
        prompt: `Combien de propositions contient « ${a.texte} » ? Écris le nombre en chiffres.`,
        answer: num(n),
        traps: numTraps(r(n), [
          [n + 1, 'Un infinitif, un second nom sujet ou un second complément ne forme pas une proposition.'],
          ...(n > 1
            ? ([
                [n - 1, 'Tu en as oublié une : chaque verbe conjugué forme une proposition.'],
                [1, 'Le sujet n’est écrit qu’une fois, mais chaque verbe conjugué forme une proposition.'],
              ] as const)
            : ([[3, 'Compte les verbes conjugués : les noms et les groupes de mots ne comptent pas.']] as const)),
        ]),
        hint: 'Compte les verbes conjugués, pas les mots « et » ni les virgules.',
        steps: [DEF_COMPLEXE, preuve(a), `La réponse est **${n}**.`],
      };
    }
    default: {
      const lignes = rng.shuffle([...pickN(rng, SIMPLES_A, 2), ...pickN(rng, COMPLEXES, 2)]);
      const total = lignes.reduce((s, a) => s + a.verbes.length, 0);
      return {
        prompt: 'Lis le document. Indique la nature de chaque phrase, puis le nombre total de propositions.',
        figure: document(
          'Notes d’une visite',
          lignes.map((a) => a.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(['Ligne 1 : ', 'Ligne 2 : ', 'Ligne 3 : ', 'Ligne 4 : ', 'Total des propositions : ']),
          blanks: [...listes(SORTES, lignes.map(sorteDe)), ...saisies([String(total)])],
        },
        hint: 'Repère chaque verbe conjugué, ligne par ligne, avant d’additionner.',
        steps: [
          DEF_COMPLEXE,
          lignes.map((a, i) => `Ligne ${i + 1} : ${a.verbes.length}`).join(' ; ') + '.',
          `Réponses : **${lignes.map(sorteDe).join(', ')}** ; total : **${total}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. La juxtaposition ─────────────────────────

const SIGNES: readonly Signe[] = [',', ';', ':'];

function juxtapositionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return quellePhrase(
        rng,
        unJuxta(rng),
        [unCoord(rng), unSimple(rng)],
        'Quelle phrase contient deux propositions juxtaposées ?',
        DEF_JUXTA,
      );
    case 2:
      return quellePhrase(
        rng,
        unJuxta(rng),
        [unSub(rng, SUB_DEBUT), unCoord(rng), unSimple(rng)],
        'Attention à la virgule ! Dans quelle phrase les propositions sont-elles juxtaposées ?',
        DEF_JUXTA,
      );
    case 3: {
      const j = rng.pick(JUXTAPOSEES);
      const noms = SIGNES.map((s) => NOM_SIGNE[s]);
      return {
        prompt: `Analyse la phrase : « ${texteJuxta(j)} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Les propositions sont séparées par ', 'Verbe de la seconde proposition : ']),
          blanks: [...listes(noms, [NOM_SIGNE[j.signe]]), saisieVerbe(j.b.v)],
        },
        hint: 'Cherche le signe placé entre les deux verbes conjugués.',
        steps: [
          DEF_JUXTA,
          `La première proposition est « ${propTexte(j.a)} », la seconde « ${propTexte(j.b)} ».`,
          `Réponses : **${NOM_SIGNE[j.signe]}**, **${j.b.v}**.`,
        ],
      };
    }
    case 4: {
      const c = rng.pick(COORDONNEES.filter((x) => x.mot === 'et' || x.mot === 'mais' || x.mot === 'car'));
      const a = maj(propTexte(c.a));
      const b = propTexte(c.b);
      const bon = `${a} ; ${b}.`;
      const accepted = [...avecVariantes(bon), ...avecVariantes(`${a}; ${b}.`)];
      return {
        prompt: `Récris cette phrase en juxtaposant les deux propositions avec un point-virgule, sans conjonction : « ${texteCoord(c)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [`${a} ; ${c.mot} ${b}.`, `Enlève « ${c.mot} » : la juxtaposition se passe de conjonction.`],
          [`${a}, ${c.mot} ${b}.`, 'La phrase reste coordonnée : retire la conjonction et mets un point-virgule.'],
          [`${a}. ${maj(b)}.`, 'Tu as fait deux phrases : on veut une seule phrase, avec un point-virgule.'],
        ]),
        hint: 'Garde les deux propositions telles quelles ; change seulement ce qui les relie.',
        steps: [DEF_JUXTA, `On supprime « ${c.mot} » et on place un point-virgule.`, `La phrase est **${bon}**`],
      };
    }
    default: {
      const lignes = rng.shuffle([unJuxta(rng), unCoord(rng), unSub(rng, SUB_DEBUT), unSimple(rng)]);
      const options = [...MODES, AUCUN];
      return {
        prompt:
          'Lis le document. Pour chaque ligne, indique comment les propositions sont assemblées (ou « phrase simple »).',
        figure: document(
          'Récit d’une soirée',
          lignes.map((e) => e.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(['Ligne 1 : ', 'Ligne 2 : ', 'Ligne 3 : ', 'Ligne 4 : ']),
          blanks: listes(
            options,
            lignes.map((e) => e.mode),
          ),
        },
        hint: 'Compte les verbes, puis regarde le signe ou le mot placé entre les propositions.',
        steps: [
          DEF_JUXTA,
          lignes.map((e, i) => `Ligne ${i + 1} : ${e.pourquoi}`).join(' '),
          `Réponses : **${lignes.map((e) => e.mode).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. La coordination ─────────────────────────

const RELIE = ['deux mots', 'deux propositions'] as const;

function coordinationDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return quellePhrase(
        rng,
        unCoord(rng),
        [unJuxta(rng), unSimple(rng)],
        'Quelle phrase contient deux propositions coordonnées ?',
        DEF_COORD,
      );
    case 2: {
      const noms = rng.pick(SIMPLES.filter((s) => / et | ou /.test(s.texte)));
      return quellePhrase(
        rng,
        unCoord(rng),
        [exSimple(noms.texte, noms.verbe), unSub(rng), unJuxta(rng)],
        'Le mot « et » peut relier deux mots seulement. Quelle phrase coordonne deux propositions ?',
        DEF_COORD,
      );
    }
    case 3: {
      const c = rng.pick(COORDONNEES);
      return {
        prompt: `Analyse la phrase : « ${texteCoord(c)} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Conjonction de coordination : ', 'Verbe de la seconde proposition : ']),
          blanks: [saisieMot(c.mot), saisieVerbe(c.b.v)],
        },
        hint: 'La conjonction se place entre les deux propositions. Récite : mais, ou, et…',
        steps: [
          DEF_COORD,
          `« ${c.mot} » relie « ${propTexte(c.a)} » et « ${propTexte(c.b)} ».`,
          `Réponses : **${c.mot}**, **${c.b.v}**.`,
        ],
      };
    }
    case 4: {
      const d = rng.pick(DOUBLES);
      const [m1, m2] = d.nomsDabord ? [d.noms, d.props] : [d.props, d.noms];
      const attendu = d.nomsDabord ? [at(RELIE, 0), at(RELIE, 1)] : [at(RELIE, 1), at(RELIE, 0)];
      return {
        prompt: `Cette phrase a deux conjonctions de coordination. Précise ce que relie chacune : « ${d.texte} »`,
        answer: {
          kind: 'cloze',
          parts: segments([`La première (« ${m1} ») relie `, `La seconde (« ${m2} ») relie `]),
          blanks: listes(RELIE, attendu),
        },
        hint: 'Regarde ce qui se trouve de chaque côté du mot : un nom, ou un groupe avec un verbe conjugué ?',
        steps: [
          DEF_COORD,
          `« ${d.noms} » relie deux noms ; « ${d.props} » relie deux parties qui ont chacune un verbe conjugué.`,
          `Réponses : **${attendu.join(', ')}**.`,
        ],
      };
    }
    default: {
      const lignes = pickN(rng, DOUBLES, 3);
      return {
        prompt:
          'Lis le document. Pour chaque ligne, écris la conjonction qui relie deux propositions, puis le verbe de la seconde proposition.',
        figure: document(
          'Carnet de randonnée',
          lignes.map((d) => d.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(lignes.flatMap((_, i) => [`Ligne ${i + 1}, conjonction : `, `Ligne ${i + 1}, verbe : `])),
          blanks: lignes.flatMap((d) => [saisieMot(d.props), saisieVerbe(d.verbe2)]),
        },
        hint: 'Repère les verbes conjugués : un mot placé entre deux simples noms ne compte pas ici.',
        steps: [
          DEF_COORD,
          'Dans chaque ligne, l’un des deux petits mots relie seulement des noms : on l’écarte.',
          `Réponses : **${lignes.map((d) => `${d.props} (${d.verbe2})`).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. La subordination ─────────────────────────

function subordinationDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return quellePhrase(
        rng,
        unSub(rng, SUB_FIN),
        [unJuxta(rng), unCoord(rng)],
        'Quelle phrase contient une proposition subordonnée ?',
        DEF_SUB,
      );
    case 2: {
      const x = rng.pick(SUB_FIN);
      const bon = subTexte(x);
      const { answer, traps } = choice(rng, bon, [
        { label: principaleTexte(x), why: 'C’est la proposition principale : la subordonnée dépend d’elle.' },
        { label: propTexte(x.sub), why: `Il manque « ${x.mot} » : la subordonnée commence par ce mot.` },
        {
          label: `${principaleTexte(x)} ${x.mot}`,
          why: `« ${x.mot} » appartient à la subordonnée, pas à la principale.`,
        },
      ]);
      return {
        prompt: `Quelle est la proposition subordonnée de « ${texteSubord(x)} » ?`,
        answer,
        traps,
        hint: 'Elle commence par le mot qui la fait dépendre de l’autre proposition.',
        steps: [DEF_SUB, `« ${x.mot} » ouvre la subordonnée.`, `La réponse est **${bon}**.`],
      };
    }
    case 3: {
      const x = rng.pick(SUB_FIN);
      return {
        prompt: `Analyse la phrase : « ${texteSubord(x)} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Conjonction de subordination : ', 'Verbe de la proposition subordonnée : ']),
          blanks: [saisieMot(x.mot), saisieVerbe(x.sub.v)],
        },
        hint: 'La conjonction de subordination se place au début de la proposition qui dépend de l’autre.',
        steps: [DEF_SUB, `La subordonnée est « ${subTexte(x)} ».`, `Réponses : **${x.mot}**, **${x.sub.v}**.`],
      };
    }
    case 4: {
      const x = rng.pick(SUB_DEBUT);
      const bon = principaleTexte(x);
      const accepted = [bon, `${bon}.`];
      return {
        prompt: `Écris la proposition principale de cette phrase : « ${texteSubord(x)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [subTexte(x), 'C’est la subordonnée : elle commence par la conjonction et dépend de l’autre.'],
          [propTexte(x.sub), 'Cette suite appartient à la subordonnée : cherche l’autre proposition.'],
          [texteSubord(x), 'Tu as recopié la phrase entière : écris seulement la proposition principale.'],
        ]),
        hint: 'La subordonnée est ici en tête de phrase. Cherche la proposition qui reste après la virgule.',
        steps: [
          DEF_SUB,
          `La subordonnée « ${subTexte(x)} » ouvre la phrase ; la virgule ne marque pas une juxtaposition.`,
          `La principale est **${bon}**.`,
        ],
      };
    }
    default: {
      const cible = rng.pick(SUBORD);
      const lignes = rng.shuffle([exSub(cible), unCoord(rng), unJuxta(rng)]);
      const ligne = lignes.findIndex((e) => e.mode === 'subordination') + 1;
      return {
        prompt: `Lis le document. Indique le mode d’assemblage de chaque ligne, puis écris la conjonction de subordination de la ligne ${ligne}.`,
        figure: document(
          'Chronique du port',
          lignes.map((e) => e.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(['Ligne 1 : ', 'Ligne 2 : ', 'Ligne 3 : ', `Conjonction de la ligne ${ligne} : `]),
          blanks: [
            ...listes(
              MODES,
              lignes.map((e) => e.mode),
            ),
            saisieMot(cible.mot),
          ],
        },
        hint: 'Une subordonnée peut ouvrir ou terminer la phrase. Cherche le mot qui la fait dépendre de l’autre.',
        steps: [
          DEF_SUB,
          lignes.map((e, i) => `Ligne ${i + 1} : ${e.pourquoi}`).join(' '),
          `Réponses : **${lignes.map((e) => e.mode).join(', ')}** ; **${cible.mot}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 6. Les conjonctions ─────────────────────────

const CLASSES_COURTES: readonly Classe6e[] = ['conjonction de coordination', 'conjonction de subordination'];
const CLASSES_MOTS: readonly Classe6e[] = [...CLASSES_COURTES, 'adverbe'];
const ROLES = ['relie deux propositions sur le même plan', 'fait entrer une subordonnée dans la principale'] as const;
const roleDe = (c: Classe6e) => (c === 'conjonction de coordination' ? at(ROLES, 0) : at(ROLES, 1));
const whyClasse = (mot: string): Rich =>
  classeDe(mot) === 'conjonction de coordination'
    ? `« ${mot} » est dans la liste mais, ou, et, or, ni, car : c’est une conjonction de coordination.`
    : `« ${mot} » n’est pas dans la liste de coordination : c’est une conjonction de subordination.`;

interface Lien {
  readonly texte: string;
  readonly mot: string;
}
const LIENS_COORD: readonly Lien[] = COORDONNEES.map((c) => ({ texte: texteCoord(c), mot: c.mot }));
const LIENS_SUB: readonly Lien[] = SUBORD.map((x) => ({ texte: texteSubord(x), mot: x.mot }));
const LIENS: readonly Lien[] = [...LIENS_COORD, ...LIENS_SUB];
/** Mots sans autre classe possible hors contexte (« si », « que », « or » ou « car » en auraient une). */
const MOTS_COORD = ['mais', 'ou', 'et', 'ni'];
const MOTS_SUB = ['lorsque', 'parce que', 'puisque', 'dès que'];

function conjonctionsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const l = rng.pick(LIENS);
      const classe = classeDe(l.mot);
      const { answer, traps } = choice(rng, classe, [
        { label: CLASSES_COURTES.find((c) => c !== classe) ?? '', why: whyClasse(l.mot) },
        { label: 'déterminant', why: 'Un déterminant se place devant un nom, comme « le » ou « une ».' },
      ]);
      return {
        prompt: `Dans « ${l.texte} », « ${l.mot} » est…`,
        answer,
        traps,
        hint: 'Récite la liste des conjonctions de coordination. Ce mot y figure-t-il ?',
        steps: [DEF_ROLE, whyClasse(l.mot), `« ${l.mot} » est une **${classe}**.`],
      };
    }
    case 2: {
      const bon = rng.pick(LIENS_SUB);
      const faux = pickN(rng, LIENS_COORD, 3);
      const { answer, traps } = choice(
        rng,
        bon.texte,
        faux.map((f) => ({ label: f.texte, why: whyClasse(f.mot) })),
      );
      return {
        prompt: 'Quelle phrase contient une conjonction de subordination ?',
        answer,
        traps,
        hint: 'Écarte d’abord les phrases qui contiennent un mot de la liste de coordination.',
        steps: [DEF_ROLE, whyClasse(bon.mot), `La réponse est **${bon.texte}**`],
      };
    }
    case 3: {
      const l = rng.pick(LIENS);
      const classe = classeDe(l.mot);
      return {
        prompt: `Trouve la conjonction qui relie les propositions : « ${l.texte} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Conjonction : ', 'C’est une ', 'Son rôle : elle ']),
          blanks: [saisieMot(l.mot), ...listes(CLASSES_COURTES, [classe]), ...listes(ROLES, [roleDe(classe)])],
        },
        hint: 'Cherche entre les deux verbes conjugués, ou au début de la phrase.',
        steps: [DEF_ROLE, whyClasse(l.mot), `Réponses : **${l.mot}**, **${classe}**, **${roleDe(classe)}**.`],
      };
    }
    case 4: {
      const sc = rng.pick(['adverbe', 'mixte'] as const);
      if (sc === 'adverbe') {
        const choisis = rng.shuffle(['donc', ...pickN(rng, MOTS_COORD, 2), ...pickN(rng, MOTS_SUB, 2)]);
        return {
          prompt: `Classe chacun de ces mots : ${choisis.map((m) => `« ${m} »`).join(', ')}. Attention : l’un d’eux n’est pas une conjonction.`,
          answer: {
            kind: 'cloze',
            parts: segments(choisis.map((m) => `« ${m} » : `)),
            blanks: listes(CLASSES_MOTS, choisis.map(classeDe)),
          },
          hint: 'Récite la liste de coordination. L’un de ces mots, souvent confondu avec elle, peut se déplacer.',
          steps: [
            DEF_ROLE,
            '« donc » n’est pas une conjonction de coordination : il fonctionne comme un adverbe.',
            `Réponses : **${choisis.map((m) => `${m} : ${classeDe(m)}`).join(' ; ')}**.`,
          ],
        };
      }
      const m = rng.pick(MIXTES);
      return {
        prompt: `Cette phrase contient une conjonction de chaque sorte. Écris-les : « ${m.texte} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Conjonction de subordination : ', 'Conjonction de coordination : ']),
          blanks: [saisieMot(m.subordination), saisieMot(m.coordination)],
        },
        hint: 'L’une se trouve au début d’une subordonnée ; l’autre est dans la liste mais, ou, et…',
        steps: [
          DEF_ROLE,
          `« ${m.subordination} » ouvre une subordonnée ; « ${m.coordination} » relie deux propositions.`,
          `Réponses : **${m.subordination}**, **${m.coordination}**.`,
        ],
      };
    }
    default: {
      const deux = [rng.pick(LIENS_COORD), rng.pick(LIENS_SUB)];
      const troisieme = rng.pick(LIENS.filter((l) => !deux.includes(l)));
      const lignes = rng.shuffle([...deux, troisieme]);
      return {
        prompt: 'Lis le document. Pour chaque ligne, écris la conjonction et indique son rôle.',
        figure: document(
          'Bulletin du club nature',
          lignes.map((l) => l.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(lignes.flatMap((_, i) => [`Ligne ${i + 1}, conjonction : `, `Ligne ${i + 1}, rôle : `])),
          blanks: lignes.flatMap((l) => [saisieMot(l.mot), ...listes(ROLES, [roleDe(classeDe(l.mot))])]),
        },
        hint: 'Trouve le mot qui relie, puis demande-toi : coordination ou subordination ?',
        steps: [
          DEF_ROLE,
          lignes.map((l) => whyClasse(l.mot)).join(' '),
          `Réponses : **${lignes.map((l) => `${l.mot} (${classeDe(l.mot)})`).join(', ')}**.`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesPhraseComplexe6e(n.factId, ...n.faits) },
  generate: n.generate,
});

export const F6_PHRASE_COMPLEXE: readonly Skill[] = [
  skill({
    id: 'f6-proposition',
    title: 'La proposition',
    memo: [
      'Une **proposition** a un **groupe sujet** et un **groupe verbal** avec un **verbe conjugué** : « la marée monte ».',
      'Un sujet peut servir à plusieurs propositions : « Il arrive et repart » en contient deux.',
    ],
    factId: 'notion-programme',
    faits: ['proposition', 'proposition-ponctuation', 'sujet-ellipse'],
    generate: propositionDraft,
  }),
  skill({
    id: 'f6-phrase-simple-complexe',
    title: 'Phrase simple ou phrase complexe',
    memo: [
      'La **phrase simple** a une seule **proposition** : « Le chien et le chat dorment. »',
      'La **phrase complexe** en a au moins deux : « Le chat dort et le chien joue. »',
      'Compte les verbes conjugués, pas la longueur.',
    ],
    factId: 'reperage-programme',
    faits: ['simple-complexe', 'proposition', 'sujet-ellipse'],
    generate: simpleComplexeDraft,
  }),
  skill({
    id: 'f6-juxtaposition',
    title: 'La juxtaposition',
    memo: [
      'La **juxtaposition** place côte à côte deux **propositions indépendantes**, sans conjonction de coordination.',
      'Un signe les sépare : virgule, point-virgule ou deux points. « La cloche sonne, les élèves sortent. »',
      'Piège : la virgule après « Quand il pleut, » suit une subordonnée.',
    ],
    factId: 'articulation-programme',
    faits: ['approfondir-programme', 'independantes', 'juxtaposition', 'plus-de-deux', 'deux-types', 'subordonnee'],
    generate: juxtapositionDraft,
  }),
  skill({
    id: 'f6-coordination',
    title: 'La coordination',
    memo: [
      'La **coordination** relie deux propositions **sur le même plan** par une **conjonction de coordination**.',
      'Liste : mais, ou, et, or, ni, car. « Il pleut, mais je sors. »',
      'Ces mots relient aussi de simples mots : « Léger et chaud. »',
    ],
    factId: 'approfondir-programme',
    faits: ['independantes', 'coordination-mot', 'coordination-liste', 'plus-de-deux', 'donc'],
    generate: coordinationDraft,
  }),
  skill({
    id: 'f6-subordination',
    title: 'La subordination',
    memo: [
      'La **proposition subordonnée** est incluse dans la **proposition principale** et dépend d’elle.',
      'Dans la **subordination**, un mot comme quand ou parce que l’ouvre : « Je rentre quand la nuit tombe. »',
      'Elle peut aussi ouvrir la phrase : « Quand la nuit tombe, je rentre. »',
    ],
    factId: 'approfondir-programme',
    faits: [
      'deux-types',
      'subordonnee',
      'subordination-mot',
      'subordination-temps',
      'subordination-cause',
      'subordination-hypothese',
      'subordination-que',
    ],
    generate: subordinationDraft,
  }),
  skill({
    id: 'f6-conjonctions',
    title: 'Conjonction de coordination ou de subordination',
    memo: [
      'La **conjonction de coordination** (mais, ou, et, or, ni, car) relie sur le même plan.',
      'La **conjonction de subordination** (quand, si, parce que, que…) fait entrer une subordonnée dans la principale.',
      '« donc » n’est pas une conjonction de coordination : c’est un **adverbe**.',
    ],
    factId: 'roles-programme',
    faits: [
      'coordination-mot',
      'coordination-liste',
      'subordination-mot',
      'subordination-temps',
      'subordination-cause',
      'subordination-hypothese',
      'subordination-que',
      'donc',
    ],
    generate: conjonctionsDraft,
  }),
];
