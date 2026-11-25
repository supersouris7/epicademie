import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill } from '../types.ts';
import { faitNature } from './nature.donnees.ts';
import {
  ACCORDS,
  DIRECTS,
  FORMES,
  GROUPES_PREP,
  INDIRECTS,
  INVARIABLES,
  LIGNES_INVARIABLES,
  LIGNES_PREP,
  MINI_PHRASES,
  MOTS_AMBIGUS,
  PHRASES_AUTRES_LIENS,
  PHRASES_PREP,
  PHRASES_SUB,
  PREPS_RARES,
  RELATIONS,
  REPRISES,
  SUBS_RARES,
  TRANSFORMATIONS,
  UN_INVARIABLE,
  VARIABLES,
  VERBES_COD,
  VERBES_COI,
  faitNatureCm2,
  phraseComplete,
  phraseRemplacee,
  sourcesDeCm2,
  type Forme,
  type Objet,
  type PhraseSub,
  type Remplacement,
  type Sens,
} from './nature-cm2.donnees.ts';
import { appariement, at, avecOuSansPoint, document, pickN, textTraps } from './outils.ts';

/**
 * Chapitre « Nature des mots » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025), CM2 :
 * « Identifier les mots, un groupe de mots selon leur nature/classe grammaticale ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitNatureCm2(id).citation} »`;

/** Lignes d'un petit texte dont une au moins compte pour la question. */
function troisLignes<T extends { readonly n: number }>(rng: Rng, lignes: readonly T[]): T[] {
  const bonne = rng.pick(lignes.filter((l) => l.n > 0));
  return rng.shuffle([
    bonne,
    ...pickN(
      rng,
      lignes.filter((l) => l !== bonne),
      2,
    ),
  ]);
}

const total = (lignes: readonly { readonly n: number }[]) => lignes.reduce((s, l) => s + l.n, 0);

// ───────────────────────── 1. Prépositions ─────────────────────────

const DEF_PREP = 'La préposition est un petit mot invariable. Elle introduit un groupe : à, de, dans, sur, avec…';

const NOMS_SIMPLES = ['chien', 'maison', 'gâteau', 'vélo', 'jardin'];
const VERBES_SIMPLES = ['chante', 'mange', 'dort', 'dessine', 'saute'];

function prepositionsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const bon = rng.pick(['dans', 'sur', 'avec', 'sans', 'pour', 'chez']);
      const nom = rng.pick(NOMS_SIMPLES);
      const verbe = rng.pick(VERBES_SIMPLES);
      const { answer, traps } = choice(rng, bon, [
        { label: nom, why: `« ${nom} » est un nom : on peut dire « un » ou « une » devant.` },
        { label: verbe, why: `« ${verbe} » est un verbe : il dit ce qu’on fait.` },
      ]);
      return {
        prompt: 'Quel mot est une préposition ?',
        answer,
        traps,
        hint: 'C’est un petit mot qui se place devant un autre mot ou un groupe.',
        steps: [DEF_PREP, `« ${bon} » introduit un groupe.`, `C’est **${bon}**.`],
      };
    }
    case 2: {
      const p = rng.pick(PHRASES_PREP);
      const { answer, traps } = choice(rng, p.prep, [
        { label: p.det, why: `« ${p.det} » accompagne un nom : c’est un déterminant.` },
        { label: p.nom, why: `« ${p.nom} » est un nom.` },
        { label: p.verbe, why: `« ${p.verbe} » est un verbe : il change avec le sujet.` },
      ]);
      return {
        prompt: `Dans « ${p.texte} », quel mot est une préposition ?`,
        answer,
        traps,
        hint: 'Cherche le petit mot qui ne change pas et qui ouvre un groupe.',
        steps: [DEF_PREP, `Dans la phrase, « ${p.prep} » ouvre un groupe.`, `La préposition est **${p.prep}**.`],
      };
    }
    case 3: {
      const p = rng.pick(PHRASES_PREP);
      return {
        prompt: `Écris la préposition de cette phrase : « ${p.texte} »`,
        answer: { kind: 'text', accepted: [p.prep] },
        traps: textTraps(
          [p.prep],
          [
            [p.det, `« ${p.det} » accompagne un nom : c’est un déterminant.`],
            [p.nom, `« ${p.nom} » est un nom.`],
            [p.verbe, `« ${p.verbe} » est un verbe.`],
          ],
        ),
        hint: 'Elle est petite, elle ne change jamais et elle est placée devant un groupe.',
        steps: [DEF_PREP, 'J’élimine les noms, les verbes et les déterminants.', `Il reste **${p.prep}**.`],
      };
    }
    case 4: {
      if (rng.int(0, 1) === 0) {
        const p = rng.pick(PREPS_RARES);
        return {
          prompt: `Écris la préposition en entier (un ou plusieurs mots) : « ${p.texte} »`,
          answer: { kind: 'text', accepted: [p.prep] },
          traps: textTraps(
            [p.prep],
            p.faux.map(
              (x) =>
                [
                  x,
                  `« ${x} » ne suffit pas ou n’est pas la préposition : cherche le groupe de mots qui ouvre le complément.`,
                ] as const,
            ),
          ),
          hint: 'Certaines prépositions s’écrivent en plusieurs mots, comme un seul bloc.',
          steps: [
            'Une préposition peut avoir un mot ou plusieurs mots.',
            'Je repère les mots qui ouvrent le groupe, sans le nom.',
            `La préposition est **${p.prep}**.`,
          ],
        };
      }
      const rel = rng.shuffle(RELATIONS);
      const groupes = rel.map((x) => rng.pick(GROUPES_PREP[x]));
      const { right, pairs } = appariement(rng, rel);
      return {
        prompt: `Que dit chaque groupe ? Associe : ${groupes.join(' ; ')}.`,
        answer: { kind: 'match', left: groupes, right, pairs },
        hint: 'Pose la question : où ? quand ? pourquoi ? dans quel but ? contre quoi ?',
        steps: [
          'La préposition précise le lien entre le groupe et le reste de la phrase.',
          'Je pose une question pour chaque groupe.',
          `Réponses : **${groupes.map((g, i) => `${g} → ${at(rel, i)}`).join(' ; ')}**.`,
        ],
      };
    }
    default: {
      const lignes = troisLignes(rng, LIGNES_PREP);
      const n = total(lignes);
      return {
        prompt: 'Lis le texte. Combien de prépositions comptes-tu ?',
        figure: document(
          'Petit texte',
          lignes.map((l) => l.texte),
        ),
        answer: num(n),
        traps: numTraps(r(n), [
          [lignes.filter((l) => l.n > 0).length, 'Une même ligne peut contenir deux prépositions.'],
          [n + 1, 'Vérifie : un adverbe ou un déterminant n’est pas une préposition.'],
          [n - 1, 'Tu en as oublié une : relis chaque ligne jusqu’au bout.'],
        ]),
        hint: 'Cherche les petits mots invariables qui ouvrent un groupe.',
        steps: [DEF_PREP, 'Je lis chaque ligne et je coche les prépositions.', `Il y en a **${n}**.`],
      };
    }
  }
}

// ───────────────────────── 2. Conjonctions de subordination ─────────────────────────

const SUB = 'une conjonction de subordination';
const COORD = 'une conjonction de coordination';
const PREP = 'une préposition';
const DEF_SUB = 'La conjonction de subordination ouvre une proposition subordonnée : quand, parce que, si, pour que…';
const DEF_COORD = 'Les conjonctions de coordination sont : mais, ou, et, or, ni, car.';

const SENS_LABEL: Record<Sens, string> = {
  'le temps': 'le temps (quand ?)',
  'la cause': 'la cause (pourquoi ?)',
  'le but': 'le but (dans quel but ?)',
  'la condition': 'l’hypothèse (à quelle condition ?)',
  'la concession': 'la concession (et pourtant…)',
};

const phraseSub = (p: PhraseSub) => `${p.principale} ${p.sub}.`;

function subordinationNature(rng: Rng): QuestionDraft {
  const sub = rng.int(0, 1) === 0;
  const p = sub ? rng.pick(PHRASES_SUB) : undefined;
  const autre = rng.pick(PHRASES_AUTRES_LIENS);
  const texte = p ? phraseSub(p) : autre.texte;
  const mot = p ? p.conj : autre.mot;
  const bon = p ? SUB : autre.nature;
  const why: Record<string, string> = {
    [SUB]: `${DEF_SUB} Ici, « ${mot} » n’ouvre pas de proposition subordonnée.`,
    [COORD]: `${DEF_COORD} « ${mot} » n’est pas dans cette liste.`,
    [PREP]: `Une préposition introduit un groupe, souvent un nom. Regarde ce qui suit « ${mot} ».`,
    'un verbe': `« ${mot} » ne se conjugue pas : ce n’est pas un verbe.`,
  };
  const { answer, traps } = choice(
    rng,
    bon,
    [SUB, COORD, PREP, 'un verbe'].filter((x) => x !== bon).map((x) => ({ label: x, why: why[x] ?? '' })),
  );
  return {
    prompt: `Dans « ${texte} », « ${mot} » est…`,
    answer,
    traps,
    hint: 'Regarde ce qui suit : un nom, ou un groupe avec un verbe conjugué ? Pense aussi à la liste de coordination.',
    steps: [DEF_COORD, DEF_SUB, ...(bon === PREP ? [DEF_PREP] : []), `« ${mot} » est **${bon}**.`],
  };
}

function subordinationDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(PHRASES_SUB);
      const nom = p.nom;
      const verbe = p.verbe;
      const { answer, traps } = choice(rng, p.conj, [
        { label: nom, why: `« ${nom} » est un nom : on peut mettre un déterminant devant.` },
        { label: verbe, why: `« ${verbe} » est un verbe : il se conjugue.` },
      ]);
      return {
        prompt: `Dans « ${phraseSub(p)} », quelle est la conjonction de subordination ?`,
        answer,
        traps,
        hint: 'Cherche les mots qui relient les deux parties de la phrase.',
        steps: [DEF_SUB, 'Je cherche le mot qui ouvre la deuxième partie.', `C’est **${p.conj}**.`],
      };
    }
    case 2:
      return subordinationNature(rng);
    case 3: {
      const p = rng.pick(PHRASES_SUB);
      return {
        prompt: `Écris la conjonction de subordination de cette phrase : « ${phraseSub(p)} »`,
        answer: { kind: 'text', accepted: [p.conj] },
        traps: textTraps(
          [p.conj],
          [
            [p.nom, `« ${p.nom} » est un nom.`],
            [p.verbe, `« ${p.verbe} » est un verbe.`],
            [p.sub, 'Tu as copié toute la proposition : écris seulement la conjonction.'],
          ],
        ),
        hint: 'Elle est au début de la proposition qui dépend de l’autre. Elle peut avoir deux mots.',
        steps: [DEF_SUB, 'Je trouve la partie qui dépend de l’autre.', `La conjonction est **${p.conj}**.`],
      };
    }
    case 4: {
      if (rng.int(0, 1) === 0) {
        const p = rng.pick(SUBS_RARES);
        const premier = p.texte.split(' ')[0] ?? '';
        const pourquoi = p.conj.startsWith(`${premier.toLowerCase()} `)
          ? 'Écris la conjonction en entier : elle a plusieurs mots.'
          : 'La conjonction n’est pas toujours le premier mot : cherche la subordonnée.';
        return {
          prompt: `Écris la conjonction de subordination : « ${p.texte} »`,
          answer: { kind: 'text', accepted: p.accepted },
          traps: textTraps(p.accepted, [
            [premier, pourquoi],
            ['que', 'Écris la conjonction en entier : elle peut avoir plusieurs mots.'],
            ['et', `${DEF_COORD} Ici, on cherche une conjonction de subordination.`],
          ]),
          hint: 'La subordonnée peut être au début de la phrase. La conjonction peut avoir une apostrophe.',
          steps: [DEF_SUB, 'Je cherche le début de la proposition qui dépend de l’autre.', `C’est **${p.conj}**.`],
        };
      }
      const phrases = rng
        .shuffle(Object.keys(SENS_LABEL) as Sens[])
        .map((s) => rng.pick(PHRASES_SUB.filter((p) => p.sens === s)));
      const left = phrases.map(phraseSub);
      const { right, pairs } = appariement(
        rng,
        phrases.map((p) => SENS_LABEL[p.sens]),
      );
      return {
        prompt: `Associe chaque phrase au sens de sa conjonction : ${phrases.map((p) => p.conj).join(', ')}.`,
        answer: { kind: 'match', left, right, pairs },
        hint: 'Pose une question : quand ? pourquoi ? dans quel but ? à quelle condition ? malgré quoi ?',
        steps: [
          'Chaque conjonction apporte un sens : temps, cause, but, hypothèse ou concession.',
          'Je pose une question à la subordonnée.',
          `Réponses : **${phrases.map((p) => `${p.conj} → ${SENS_LABEL[p.sens]}`).join(' ; ')}**.`,
        ],
      };
    }
    default: {
      const lignes = pickN(rng, PHRASES_SUB, 3);
      const i = rng.int(0, 2);
      const p = at(lignes, i);
      const accepted = avecOuSansPoint(`${p.sub}.`);
      return {
        prompt: `Lis le texte. Recopie la proposition subordonnée de la ligne ${i + 1}.`,
        figure: document('Phrases complexes', lignes.map(phraseSub)),
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [p.principale, 'C’est la proposition principale. La subordonnée commence par la conjonction.'],
          [p.conj, 'Tu as écrit la conjonction seule : recopie toute la proposition.'],
          [p.sub.slice(p.conj.length + 1), 'La subordonnée commence avec la conjonction : ne l’oublie pas.'],
        ]),
        hint: 'Trouve les deux verbes conjugués. La subordonnée commence par la conjonction et va avec son verbe.',
        steps: [
          'Une phrase complexe a plusieurs verbes conjugués, donc plusieurs propositions.',
          `La conjonction « ${p.conj} » ouvre la subordonnée.`,
          `Je recopie : **${p.sub}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Pronoms personnels compléments ─────────────────────────

const P_COMPL = 'un pronom personnel complément';
const P_SUJET = 'un pronom personnel sujet';
const DEF_COMPL = 'Le pronom complément complète le verbe : me, te, le, la, les, lui, leur, nous, vous.';
const DIRECT = '« le », « la », « les » remplacent un complément d’objet direct (sans « à »).';
const INDIRECT = '« lui » et « leur » remplacent un complément avec « à ». « Leur » pronom ne prend jamais de s.';
const OBJETS: readonly Objet[] = ['le', 'la', 'les', 'lui', 'leur'];

const regle = (x: Remplacement) =>
  x.pronom === 'lui' || x.pronom === 'leur'
    ? `« ${x.groupe} » commence par « à » ou « au(x) » : ${x.pronom === 'lui' ? 'un seul, donc « lui »' : 'plusieurs, donc « leur »'}.`
    : `« ${x.groupe} » suit le verbe sans « à » : je choisis « le », « la » ou « les » selon le genre et le nombre.`;

function pronomsComplementsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const [sujet, pronom, verbe] = rng.pick(MINI_PHRASES);
      const { answer, traps } = choice(rng, pronom, [
        { label: sujet, why: `« ${sujet} » dit qui fait l’action : c’est le pronom sujet.` },
        { label: verbe, why: `« ${verbe} » est le verbe.` },
      ]);
      return {
        prompt: `Dans « ${sujet} ${pronom} ${verbe}. », quel mot est un pronom complément ?`,
        answer,
        traps,
        hint: 'Trouve le verbe, puis le petit mot qui le complète.',
        steps: [DEF_COMPL, `Le sujet est « ${sujet} ».`, `Le pronom complément est **${pronom}**.`],
      };
    }
    case 2: {
      const p = rng.pick(MOTS_AMBIGUS);
      const bon = p.pronom ? P_COMPL : 'un déterminant';
      const { answer, traps } = choice(rng, bon, [
        {
          label: p.pronom ? 'un déterminant' : P_COMPL,
          why: p.pronom
            ? `Un déterminant est devant un nom. Ici, « ${p.mot} » est devant un verbe.`
            : `Un pronom complément est devant un verbe. Ici, « ${p.mot} » est devant un nom.`,
        },
        { label: P_SUJET, why: `Ici, « ${p.mot} » ne fait pas l’action.` },
        {
          label: 'un nom',
          why: `« ${p.mot} » est un petit mot qui change avec ce qu’il accompagne ou remplace : pas un nom.`,
        },
      ]);
      return {
        prompt: `Dans « ${p.texte} », le mot « ${p.mot} » est…`,
        answer,
        traps,
        hint: 'Regarde le mot qui suit : est-ce un verbe ou un nom ?',
        steps: [
          'Devant un nom : déterminant. Devant un verbe : pronom complément.',
          `Je regarde ce qui suit « ${p.mot} ».`,
          `« ${p.mot} » est **${bon}**.`,
        ],
      };
    }
    case 3: {
      const x = rng.pick(DIRECTS);
      return {
        prompt: `Remplace « ${x.groupe} » par un pronom : « ${phraseComplete(x)} »`,
        answer: {
          kind: 'cloze',
          parts: [`${x.sujet} `, ` ${x.verbe}.`],
          blanks: [{ mode: 'text', accepted: [x.pronom] }],
        },
        hint: 'Le groupe est-il masculin ou féminin ? Y en a-t-il un ou plusieurs ?',
        traps: [],
        steps: [DIRECT, regle(x), `La phrase est : **${phraseRemplacee(x)}**`],
      };
    }
    case 4: {
      if (rng.int(0, 2) === 0) {
        const choisis = OBJETS.map((o) => rng.pick([...DIRECTS, ...INDIRECTS].filter((x) => x.pronom === o)));
        const left = choisis.map((x) => `${x.verbe} ${x.groupe}`);
        const { right, pairs } = appariement(rng, [...OBJETS]);
        return {
          prompt: `Quel pronom remplace le complément ? Associe : ${left.join(' ; ')}.`,
          answer: { kind: 'match', left, right, pairs },
          hint: 'Regarde d’abord s’il y a « à » devant le groupe.',
          steps: [DIRECT, INDIRECT, `Réponses : **${choisis.map((x) => `${x.groupe} → ${x.pronom}`).join(' ; ')}**.`],
        };
      }
      const x = rng.pick(rng.int(0, 3) === 0 ? DIRECTS : INDIRECTS);
      const accepted = avecOuSansPoint(phraseRemplacee(x));
      return {
        prompt: `Réécris la phrase en remplaçant « ${x.groupe} » par un pronom : « ${phraseComplete(x)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [`${x.sujet} ${x.verbe} ${x.pronom}.`, 'Le pronom complément se place avant le verbe.'],
          [`${x.sujet} leurs ${x.verbe}.`, '« Leur » pronom ne prend jamais de s.'],
          ...OBJETS.map((o) => [phraseRemplacee(x, o), regle(x)] as const),
        ]),
        hint: 'Y a-t-il « à » devant le groupe ? Choisis, puis place le pronom devant le verbe.',
        steps: [regle(x), 'Le pronom se place devant le verbe.', `La phrase est : **${phraseRemplacee(x)}**`],
      };
    }
    default: {
      const x = rng.pick(REPRISES);
      const ligne2 = `${x.quand}, ${x.sujet} ${x.verbe} ${x.groupe}.`;
      const bon = `${x.quand}, ${x.sujet} ${x.pronom} ${x.verbe}.`;
      const accepted = [...avecOuSansPoint(bon), ...avecOuSansPoint(bon.replace(',', ''))];
      return {
        prompt: `Lis le texte. Réécris la ligne 2 avec un pronom à la place de « ${x.groupe} ».`,
        figure: document('Petit texte', [x.contexte, ligne2]),
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [`${x.quand}, ${x.sujet} ${x.verbe} ${x.pronom}.`, 'Le pronom complément se place avant le verbe.'],
          [ligne2, 'Tu as recopié la ligne : remplace le groupe répété.'],
          ...OBJETS.map((o) => [`${x.quand}, ${x.sujet} ${o} ${x.verbe}.`, regle(x)] as const),
        ]),
        hint: 'La ligne 1 t’aide pour le genre et le nombre. Regarde aussi s’il y a « à ».',
        steps: [regle(x), 'Le pronom passe devant le verbe.', `La ligne devient : **${bon}**`],
      };
    }
  }
}

// ───────────────────────── 4. Variations du pronom personnel ─────────────────────────

const DEF_VARIE = 'Le pronom personnel change selon la personne, le genre, le nombre et la fonction.';
const SUJETS = 'Les pronoms sujets sont : je, tu, il, elle, nous, vous, ils, elles.';
const COI_VERBES: readonly string[] = VERBES_COI;
type Fonction = 'sujet' | 'complément d’objet direct' | 'complément d’objet indirect';
const FONCTIONS: readonly Fonction[] = ['sujet', 'complément d’objet direct', 'complément d’objet indirect'];

const ELIDEES: Readonly<Record<string, string>> = { je: 'j’', me: 'm’', te: 't’', le: 'l’', la: 'l’' };

const formeSelon = (f: Forme, fonction: Fonction) =>
  fonction === 'sujet' ? f.sujet : fonction === 'complément d’objet direct' ? f.cod : f.coi;

function variationsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const pluriel = rng.int(0, 1) === 0;
      const bon = rng.pick(FORMES.filter((f) => f.pluriel === pluriel));
      // « vous » peut désigner une seule personne (politesse) : jamais proposé face à un singulier.
      const autres = pickN(
        rng,
        FORMES.filter((f) => f.pluriel !== pluriel && f.sujet !== 'vous'),
        2,
      );
      const nombre = pluriel ? 'pluriel' : 'singulier';
      const { answer, traps } = choice(
        rng,
        bon.sujet,
        autres.map((f) => ({
          label: f.sujet,
          why: `« ${f.sujet} » est au ${f.pluriel ? 'pluriel' : 'singulier'}.`,
        })),
      );
      return {
        prompt: `Quel pronom personnel est au ${nombre} ?`,
        answer,
        traps,
        hint: 'Le pluriel désigne plusieurs personnes. Le singulier en désigne une seule.',
        steps: [SUJETS, DEF_VARIE, `Au ${nombre} : **${bon.sujet}**.`],
      };
    }
    case 2: {
      const groupes = rng.shuffle([FORMES.slice(0, 2), FORMES.slice(2, 4), FORMES.slice(4, 6), FORMES.slice(6)]);
      const choisis = pickN(rng, groupes, 3).map((g) => rng.pick(g));
      const left = choisis.map((f) => f.sujet);
      const { right, pairs } = appariement(
        rng,
        choisis.map((f) => f.personne),
      );
      return {
        prompt: `Associe chaque pronom à sa personne : ${left.join(', ')}.`,
        answer: { kind: 'match', left, right, pairs },
        hint: 'La 1re personne parle, la 2e écoute, la 3e est celle dont on parle.',
        steps: [
          'Il y a trois personnes, au singulier et au pluriel.',
          'Je cherche qui parle, qui écoute et de qui on parle.',
          `Réponses : **${choisis.map((f) => `${f.sujet} → ${f.personne}`).join(' ; ')}**.`,
        ],
      };
    }
    case 3: {
      const f = rng.pick(FORMES);
      const verbe = rng.pick([...VERBES_COD, ...VERBES_COI]);
      const indirect = COI_VERBES.includes(verbe);
      const bon = indirect ? f.coi : f.cod;
      const phrase = `Mon voisin ___ ${verbe}.`;
      return {
        prompt: `Écris le pronom complément qui correspond à « ${f.sujet} » : « ${phrase} »`,
        answer: { kind: 'text', accepted: [bon] },
        traps: textTraps(
          [bon],
          [
            [f.sujet, `« ${f.sujet} » est la forme sujet. Ici, le pronom complète le verbe.`],
            [
              indirect ? f.cod : f.coi,
              `Regarde le verbe : on dit « ${verbe} ${indirect ? 'à quelqu’un' : 'quelqu’un'} ».`,
            ],
          ],
        ),
        hint: `Demande-toi : on dit « ${verbe} quelqu’un » ou « ${verbe} à quelqu’un » ?`,
        steps: [
          DEF_VARIE,
          `On dit « ${verbe} ${indirect ? 'à quelqu’un' : 'quelqu’un'} » : complément ${indirect ? 'indirect' : 'direct'}.`,
          `La réponse est **${bon}**.`,
        ],
      };
    }
    case 4: {
      if (rng.int(0, 2) === 0) {
        const choisis = [0, 1, 2, 4, 6].map((i) => at(FORMES, i));
        const ordre = rng.shuffle(choisis);
        const left = ordre.map((f) => f.sujet);
        const { right, pairs } = appariement(
          rng,
          ordre.map((f) => f.coi),
        );
        return {
          prompt: `Associe le pronom sujet à sa forme complément indirect : ${left.join(', ')}.`,
          answer: { kind: 'match', left, right, pairs },
          hint: 'Dis la phrase « Il … parle » avec chaque personne.',
          steps: [
            DEF_VARIE,
            'Je dis « Mon ami … parle ».',
            `Réponses : **${ordre.map((f) => `${f.sujet} → ${f.coi}`).join(' ; ')}**.`,
          ],
        };
      }
      const f = rng.pick(FORMES);
      const fonction = rng.pick(FONCTIONS);
      const bon = formeSelon(f, fonction);
      // Forme élidée devant une voyelle : « m’ », « t’ », « l’ » sont aussi justes.
      const elidee = ELIDEES[bon];
      // À la 3e personne, « se » (ou « s’ ») est aussi un pronom complément.
      const reflechi = fonction !== 'sujet' && f.personne.startsWith('3e') ? ['se', 's’'] : [];
      const accepted = [bon, ...(elidee ? [elidee] : []), ...reflechi];
      const place = fonction === 'sujet' ? '' : ' (placé devant le verbe)';
      return {
        prompt: `Écris le pronom personnel : ${f.personne}, ${fonction}${place}.`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          FONCTIONS.map((x) => [formeSelon(f, x), `Cette forme a une autre fonction : ${x}.`] as const),
        ),
        hint: 'Trouve d’abord la personne et le nombre. Puis pense au rôle dans la phrase.',
        steps: [DEF_VARIE, `Je cherche la ${f.personne}.`, `En fonction ${fonction} : **${bon}**.`],
      };
    }
    default: {
      const t = rng.pick(TRANSFORMATIONS);
      const accepted = avecOuSansPoint(t.pluriel);
      return {
        prompt: 'Lis le texte. Dans la ligne 2, mets le sujet et le complément au pluriel. Réécris la phrase.',
        figure: document('Petit texte', [t.contexte, t.singulier]),
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [t.verbeOublie, 'Le sujet est au pluriel : le verbe doit s’accorder.'],
          [t.pronomOublie, 'Le complément doit aussi passer au pluriel.'],
          [t.singulier, 'Tu as recopié la phrase au singulier.'],
        ]),
        hint: 'Change trois choses : le pronom sujet, le pronom complément et le verbe.',
        steps: [
          'Le sujet et le pronom complément changent de nombre.',
          'Le verbe s’accorde avec le sujet.',
          `La phrase est : **${t.pluriel}**`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. Mots variables et invariables ─────────────────────────

const DEF_VARIABLE = 'Un mot variable change : genre, nombre, personne ou temps. Un mot invariable ne change jamais.';
const CLASSES_INV = 'Les prépositions, les adverbes et les conjonctions sont invariables.';

/** Mots d'exemple par classe, pour l'association (niveau 4). */
const CLASSES: readonly (readonly [string, readonly string[]])[] = [
  ['nom', ['chien', 'maison']],
  ['verbe', ['chante', 'dort']],
  ['préposition', ['dans', 'chez']],
  ['adverbe', ['souvent', 'toujours']],
  ['conjonction de subordination', ['lorsque', 'puisque']],
];

const whyVariable = (mot: string) => {
  const v = VARIABLES.find((x) => x.mot === mot);
  return v
    ? `« ${mot} » (${v.classe}) change : on trouve « ${v.autre} ».`
    : `« ${mot} » change selon le nombre, le genre ou la personne.`;
};

function variablesDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const bon = rng.pick(INVARIABLES);
      const autres = pickN(rng, VARIABLES.slice(0, 6), 2);
      const { answer, traps } = choice(
        rng,
        bon,
        autres.map((v) => ({ label: v.mot, why: whyVariable(v.mot) })),
      );
      return {
        prompt: 'Quel mot est invariable ?',
        answer,
        traps,
        hint: 'Essaie de mettre chaque mot au pluriel ou au féminin.',
        steps: [DEF_VARIABLE, 'Je teste chaque mot dans une autre phrase.', `Ce mot ne change jamais : **${bon}**.`],
      };
    }
    case 2: {
      const p = rng.pick(UN_INVARIABLE);
      const { answer, traps } = choice(
        rng,
        p.mot,
        p.autres.map((m) => ({ label: m, why: whyVariable(m) })),
      );
      return {
        prompt: `Dans « ${p.texte} », quel mot est invariable ?`,
        answer,
        traps,
        hint: 'Mets la phrase au singulier ou au pluriel : quel mot reste pareil quoi qu’il arrive ?',
        steps: [DEF_VARIABLE, CLASSES_INV, `Le mot invariable est **${p.mot}**.`],
      };
    }
    case 3: {
      const a = rng.pick(ACCORDS);
      return {
        prompt: `Mets au pluriel et complète : « ${a.singulier} »`,
        answer: {
          kind: 'cloze',
          parts: a.parts,
          blanks: a.trous.map(([, forme]) => ({ mode: 'text' as const, accepted: [forme] })),
        },
        traps: [],
        hint: 'Certains mots changent au pluriel, un autre reste pareil.',
        steps: [DEF_VARIABLE, CLASSES_INV, `Réponses : **${a.trous.map(([s, p]) => `${s} → ${p}`).join(' ; ')}**.`],
      };
    }
    case 4: {
      if (rng.int(0, 1) === 0) {
        const choisis = rng.shuffle(CLASSES).map(([classe, mots]) => [rng.pick(mots), classe] as const);
        const left = choisis.map(([mot]) => mot);
        const { right, pairs } = appariement(
          rng,
          choisis.map(([, c]) => c),
        );
        return {
          prompt: `Associe chaque mot à sa classe : ${left.join(', ')}.`,
          answer: { kind: 'match', left, right, pairs },
          hint: 'Repère d’abord les mots qui changent, puis les mots qui ne changent jamais.',
          steps: [DEF_VARIABLE, CLASSES_INV, `Réponses : **${choisis.map(([m, c]) => `${m} → ${c}`).join(' ; ')}**.`],
        };
      }
      const a = rng.pick(ACCORDS);
      const remplir = (formes: readonly string[]) => a.parts.map((part, i) => part + (formes[i] ?? '')).join('');
      const bon = remplir(a.trous.map(([, p]) => p));
      const accepted = avecOuSansPoint(bon);
      return {
        prompt: `Réécris au pluriel : « ${a.singulier} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [a.singulier, 'Tu as recopié la phrase au singulier.'],
          [
            remplir(a.trous.map(([s, p], i) => (i === 2 ? s : p))),
            'Le verbe doit s’accorder avec le sujet au pluriel.',
          ],
          // Seulement si l’erreur est plausible : « souvents », pas « danss ».
          ...a.trous
            .filter(([s]) => !s.endsWith('s') && (INVARIABLES as readonly string[]).includes(s))
            .map(([s]) => [bon.replace(` ${s} `, ` ${s}s `), 'Un mot invariable ne prend pas de s.'] as const),
          [
            remplir(a.trous.map(([s, p], i) => (i === 0 ? s : p))),
            'Au pluriel, le nom et son adjectif changent tous les deux.',
          ],
        ]),
        hint: 'Le déterminant, le nom, l’adjectif et le verbe changent. Les autres mots ?',
        steps: [DEF_VARIABLE, CLASSES_INV, `La phrase est : **${bon}**`],
      };
    }
    default: {
      const lignes = troisLignes(rng, LIGNES_INVARIABLES);
      const n = total(lignes);
      return {
        prompt: 'Lis le texte. Combien de mots invariables comptes-tu ?',
        figure: document(
          'Petit texte',
          lignes.map((l) => l.texte),
        ),
        answer: num(n),
        traps: numTraps(r(n), [
          [lignes.filter((l) => l.n > 0).length, 'Une même ligne peut avoir plusieurs mots invariables.'],
          [n + 1, 'Vérifie : un déterminant, un adjectif ou un verbe change. Ne le compte pas.'],
          [n - 1, 'Tu en as oublié un : cherche prépositions, adverbes et conjonctions.'],
        ]),
        hint: 'Cherche les prépositions, les adverbes et les conjonctions.',
        steps: [DEF_VARIABLE, CLASSES_INV, `Il y en a **${n}**.`],
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
  /** Sources des articles du dictionnaire cités dans les faits du chapitre CM1 (adverbes). */
  readonly dictionnaire?: readonly string[];
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
    sources: [...sourcesDeCm2(n.factId, ...n.faits), ...(n.dictionnaire ?? []).map((id) => faitNature(id).source)],
  },
  generate: n.generate,
});

export const FCM2_NATURE: readonly Skill[] = [
  skill({
    id: 'fcm2-prepositions',
    title: 'Les prépositions',
    memo: [
      'Une **préposition** est un petit mot **invariable** : à, de, dans, sur, pour, avec, sans, chez…',
      'Elle ouvre un groupe : « Je joue dans la cour. » Elle peut avoir plusieurs mots : au-dessus de, à cause de.',
      'Elle précise un lien, par exemple : le lieu, le temps, la cause, le but ou l’opposition.',
    ],
    factId: 'prepositions',
    faits: [
      'preposition-invariable',
      'preposition-place',
      'preposition-frequentes',
      'preposition-locution',
      'preposition-lieu',
      'preposition-temps',
      'preposition-cause',
      'preposition-but',
      'preposition-opposition',
    ],
    generate: prepositionsDraft,
  }),
  skill({
    id: 'fcm2-conjonctions-subordination',
    title: 'Conjonctions de subordination',
    memo: [
      'Une **conjonction de subordination** ouvre une **proposition subordonnée**. Elle ne change jamais.',
      'Exemple : « Je reste ici parce que la pluie tombe. » La subordonnée est « parce que la pluie tombe ».',
      'Temps : quand, lorsque. Cause : parce que, puisque. But : pour que. Hypothèse : si. Concession : bien que.',
    ],
    factId: 'subordination',
    faits: [
      'subordination-definition',
      'subordination-incluse',
      'subordination-temps',
      'subordination-cause',
      'subordination-but',
      'subordination-concession',
      'subordination-hypothese',
      'coordination',
    ],
    generate: subordinationDraft,
  }),
  skill({
    id: 'fcm2-pronoms-complements',
    title: 'Pronoms personnels compléments',
    memo: [
      'Un **pronom personnel complément** complète le verbe. Il se place souvent devant ce verbe.',
      '**Complément d’objet direct** : le, la, les. « Je lis le livre. » → « Je le lis. »',
      '**Complément d’objet indirect** (avec « à ») : lui, leur. « Je parle à mes amis. » → « Je leur parle. » Sans s !',
    ],
    factId: 'pronoms-objet',
    faits: ['deux-types', 'cod', 'coi', 'antecedent', 'leur-invariable'],
    generate: pronomsComplementsDraft,
  }),
  skill({
    id: 'fcm2-variations-pronom',
    title: 'Les variations du pronom personnel',
    memo: [
      'Le **pronom personnel** change selon la **personne**, le **genre**, le **nombre** et la **fonction**.',
      'Sujet : je, tu, il, elle, nous, vous, ils, elles. Complément : me, te, le, la, les, lui, leur, nous, vous.',
      'Exemple : « Je chante. » « Tu me regardes. » « je » et « me » : même personne, mais rôle différent.',
    ],
    factId: 'variations',
    faits: ['formes-variables', 'sujets', 'nous-vous', 'me-te', 'cod', 'coi'],
    generate: variationsDraft,
  }),
  skill({
    id: 'fcm2-mots-variables',
    title: 'Mots variables et invariables',
    memo: [
      'Un mot **variable** change : déterminant, nom, adjectif, **pronom personnel**, verbe.',
      'Un mot **invariable** ne change jamais : préposition, **adverbe**, **conjonction de coordination** ou de subordination.',
      'Exemple : « Les chiens dorment dans les niches. » « dans » reste pareil.',
    ],
    factId: 'classes-variables',
    faits: [
      'verbe-varie',
      'adverbe-invariable',
      'coordination-invariable',
      'prepositions-invariables',
      'subordination-definition',
      'subordination-temps',
      'subordination-cause',
    ],
    dictionnaire: ['toujours', 'souvent', 'hier', 'demain', 'tres', 'beaucoup'],
    generate: variablesDraft,
  }),
];
