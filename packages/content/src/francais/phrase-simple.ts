import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill } from '../types.ts';
import {
  ACCORDS_ATTRIBUT,
  ATTRIBUTS,
  CIRCONSTANCES,
  CIRCONSTANCIELS,
  DEUX_OBJETS,
  INCISES,
  INVERSES_LIEU,
  INVERSES_PRONOM,
  INVERSES_QUESTION,
  JUMELLES,
  OBJETS,
  ORDRE_HABITUEL,
  PHRASES,
  SUJETS_VARIES,
  TRIPLES,
  aLaFin,
  auDebut,
  faitPhraseSimple,
  gv,
  maj,
  sourcesPhraseSimple,
  type Circonstance,
  type DeuxObjets,
  type Inversion,
  type Objet,
  type Phrase,
} from './phrase-simple.donnees.ts';
import { at, document, lowerFirst, pickN, textTraps } from './outils.ts';

/**
 * Chapitre « Analyser la phrase simple » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Analyser une phrase simple ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitPhraseSimple(id).citation} »`;

/** Texte à trous dont chaque trou se choisit dans la même liste. */
const listes = (options: readonly string[], justes: readonly string[]) =>
  justes.map((juste) => ({ mode: 'list' as const, options: [...options], correct: options.indexOf(juste) }));

/** Texte à trous à saisir. */
const saisies = (mots: readonly string[]) => mots.map((mot) => ({ mode: 'text' as const, accepted: [mot] }));

/** Ordres des deux colonnes d'une association, jamais déjà face à face. */
function colonnes<T>(rng: Rng, items: readonly T[]): { gauche: T[]; droite: T[] } {
  const gauche = rng.shuffle(items);
  const droite = rng.shuffle(items);
  return { gauche, droite: droite.every((x, i) => x === gauche[i]) ? [...droite.slice(1), at(droite, 0)] : droite };
}

/** Segments d'un texte à trous : un libellé avant chaque trou, un point à la fin. */
const segments = (libelles: readonly string[]) => [...libelles.map((l, i) => (i === 0 ? l : `. ${l}`)), '.'];

// ───────────────────────── 1. Groupe sujet, groupe verbal, groupe circonstanciel ─────────────────────────

type Role = 'gs' | 'gv' | 'gc';
const ROLES: readonly Role[] = ['gs', 'gv', 'gc'];
const NOM_ROLE: Record<Role, string> = {
  gs: 'le groupe sujet',
  gv: 'le groupe verbal',
  gc: 'le groupe circonstanciel',
};
const groupeDe = (p: Phrase, role: Role): string => (role === 'gs' ? p.gs : role === 'gv' ? gv(p) : p.gc);
const COMMENT: Record<Role, (p: Phrase) => string> = {
  gs: (p) => `« ${p.gs} » dit qui fait l’action : on peut l’encadrer avec « C’est… qui » ou « Ce sont… qui ».`,
  gv: (p) => `« ${gv(p)} » contient le verbe « ${p.verbe} » et ce qui le complète.`,
  gc: (p) => `« ${p.gc} » donne un détail en plus : on peut le déplacer ou le supprimer.`,
};
const DEF_GROUPES =
  'La phrase simple a un groupe sujet et un groupe verbal. Le groupe circonstanciel s’ajoute : il n’est pas obligatoire.';

function constituantsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(PHRASES);
      const role = rng.pick(ROLES);
      const g = groupeDe(p, role);
      const { answer, traps } = choice(
        rng,
        NOM_ROLE[role],
        ROLES.filter((r) => r !== role).map((r) => ({
          label: NOM_ROLE[r],
          why: `Non : ${NOM_ROLE[r]}, ici, c’est « ${groupeDe(p, r)} ».`,
        })),
      );
      return {
        prompt: `Dans « ${aLaFin(p)} », qu’est-ce que « ${g} » ?`,
        answer,
        traps,
        hint: 'Demande-toi : ce groupe fait-il l’action, contient-il le verbe, ou ajoute-t-il un détail ?',
        steps: [DEF_GROUPES, COMMENT[role](p), `C’est **${NOM_ROLE[role]}**.`],
      };
    }
    case 2: {
      const p = rng.pick(PHRASES);
      const { gauche, droite } = colonnes(rng, ROLES);
      return {
        prompt: `Associe chaque groupe à son nom : « ${aLaFin(p)} »`,
        answer: {
          kind: 'match',
          left: gauche.map((r) => groupeDe(p, r)),
          right: droite.map((r) => NOM_ROLE[r]),
          pairs: gauche.map((r) => droite.indexOf(r)),
        },
        hint: 'Trouve d’abord le verbe. Cherche ensuite qui fait l’action.',
        steps: [
          DEF_GROUPES,
          `${COMMENT.gs(p)} ${COMMENT.gc(p)}`,
          `Sujet : **${p.gs}** ; verbal : **${gv(p)}** ; circonstanciel : **${p.gc}**.`,
        ],
      };
    }
    case 3: {
      const p = rng.pick(PHRASES);
      const accepted = [gv(p)];
      return {
        prompt: `Écris le groupe verbal de cette phrase : « ${auDebut(p)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [p.verbe, `Il manque « ${p.suite} » : ce complément fait partie du groupe verbal.`],
          [p.gs, `« ${p.gs} » est le groupe sujet : il dit qui fait l’action.`],
          [p.gc, `« ${p.gc} » se déplace et se supprime : c’est le groupe circonstanciel.`],
          [`${gv(p)} ${p.gc}`, `Enlève « ${p.gc} » : ce groupe n’est pas dans le groupe verbal.`],
        ]),
        hint: 'Trouve le verbe conjugué. Garde les mots qui le complètent et qu’on ne peut pas déplacer.',
        steps: [
          `Le verbe est « ${p.verbe} ».`,
          `Il est complété par « ${p.suite} ».`,
          `Le groupe verbal est **${gv(p)}**.`,
        ],
      };
    }
    case 4: {
      const p = rng.pick(SUJETS_VARIES);
      const accepted = [p.gs];
      return {
        prompt: `Écris le groupe sujet en entier : « ${auDebut(p)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          ...(p.court
            ? [[p.court, 'Le groupe sujet n’est pas complet : prends tous les mots qui font partie du sujet.'] as const]
            : []),
          [p.gc, `« ${p.gc} » se déplace : c’est le groupe circonstanciel.`],
          [gv(p), `« ${gv(p)} » contient le verbe : c’est le groupe verbal.`],
          [p.verbe, `« ${p.verbe} » est le verbe, pas le sujet.`],
        ]),
        hint: 'Encadre avec « C’est… qui » ou « Ce sont… qui » : le sujet peut être un pronom ou plusieurs noms.',
        steps: [
          `Le verbe est « ${p.verbe} ».`,
          'Le sujet peut être un pronom, un groupe nominal ou plusieurs noms. Il commande l’accord du verbe.',
          `Le groupe sujet est **${p.gs}**.`,
        ],
      };
    }
    default: {
      const choisies = [...pickN(rng, SUJETS_VARIES, 1), ...pickN(rng, PHRASES, 2)];
      const lignes = rng.shuffle(choisies);
      const roles = rng.shuffle(ROLES);
      const bons = lignes.map((p, i) => groupeDe(p, at(roles, i)));
      const libelles = roles.map((r, i) => `Ligne ${i + 1}, ${NOM_ROLE[r]} : `);
      return {
        prompt: `Lis le texte. Écris : ${libelles.map((l) => lowerFirst(l.replace(/ : $/, ''))).join(' ; ')}.`,
        figure: document(
          'Scènes de la journée',
          lignes.map((p, i) => (i === 1 ? aLaFin(p) : auDebut(p))),
        ),
        answer: { kind: 'cloze', parts: segments(libelles), blanks: saisies(bons) },
        hint: 'Dans chaque ligne, trouve d’abord le verbe. Teste ensuite quel groupe peut se déplacer.',
        steps: [
          DEF_GROUPES,
          lignes.map((p, i) => COMMENT[at(roles, i)](p)).join(' '),
          `Réponses : **${bons.join(' ; ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Le sujet inversé ─────────────────────────

const DEF_INVERSION = 'Le sujet est inversé quand il est placé après le verbe.';
const place = (i: Inversion) => `Ici, « ${i.sujet} » vient après « ${i.verbe} » : le sujet est inversé.`;
const quiEstCeQui = (i: Inversion) =>
  `Je pose la question « Qui est-ce qui… ? » ou « Qu’est-ce qui… ? » avec le verbe « ${i.verbe} ».`;

const whyLeurre = (i: Inversion) =>
  `« ${i.leurre} » ne fait pas l’action du verbe « ${i.verbe} ». Cherche aussi après le verbe.`;
const whyVerbe = (i: Inversion) => `« ${i.verbe} » est le verbe. Le sujet dit qui fait l’action.`;

const sujetEcrit = (i: Inversion): QuestionDraft => {
  const accepted = [i.sujet];
  return {
    prompt: `Écris le sujet du verbe « ${i.verbe} » : ${i.phrase}`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [
      [i.leurre, whyLeurre(i)],
      [i.verbe, whyVerbe(i)],
    ]),
    hint: 'Ne regarde pas seulement avant le verbe. Demande qui fait l’action.',
    steps: [quiEstCeQui(i), place(i), `Le sujet est **${i.sujet}**.`],
  };
};

function sujetInverseDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const i = rng.pick(INVERSES_LIEU);
      const { answer, traps } = choice(rng, i.sujet, [
        { label: i.leurre, why: whyLeurre(i) },
        { label: i.verbe, why: whyVerbe(i) },
      ]);
      return {
        prompt: `Dans « ${i.phrase} », quel est le sujet du verbe « ${i.verbe} » ?`,
        answer,
        traps,
        hint: 'Le sujet n’est pas toujours au début. Demande : qu’est-ce qui fait cette action ?',
        steps: [quiEstCeQui(i), place(i), `Le sujet est **${i.sujet}**.`],
      };
    }
    case 2: {
      const bon = rng.pick([...INVERSES_LIEU, ...INVERSES_QUESTION]);
      const options = rng.shuffle([bon, ...pickN(rng, ORDRE_HABITUEL, 3)]);
      return {
        prompt: 'Dans quelle phrase le sujet est-il placé après le verbe ?',
        answer: { kind: 'choice', options: options.map((o) => o.phrase), correct: options.indexOf(bon) },
        traps: options.flatMap((o, i) =>
          o === bon ? [] : [{ option: i, why: `Ici, « ${o.sujet} » est avant le verbe « ${o.verbe} ».` }],
        ),
        hint: 'Dans chaque phrase, trouve le verbe, puis le sujet. Compare leur place.',
        steps: [DEF_INVERSION, `Le sujet « ${bon.sujet} » suit « ${bon.verbe} ».`, `C’est : **${bon.phrase}**`],
      };
    }
    case 3:
      return sujetEcrit(rng.pick([...INVERSES_LIEU, ...INVERSES_QUESTION]));
    case 4:
      return sujetEcrit(rng.pick([...INCISES, ...INVERSES_PRONOM]));
    default: {
      const lignes = rng.shuffle([rng.pick(INCISES), rng.pick(INVERSES_LIEU), rng.pick(ORDRE_HABITUEL)]);
      const libelles = lignes.map((l, i) => `Ligne ${i + 1}, sujet de « ${l.verbe} » : `);
      return {
        prompt: `Lis le texte. Écris le sujet de chaque verbe demandé : ${lignes.map((l) => `« ${l.verbe} »`).join(', ')}.`,
        figure: document(
          'Au fil de la promenade',
          lignes.map((l) => l.phrase),
        ),
        answer: { kind: 'cloze', parts: segments(libelles), blanks: saisies(lignes.map((l) => l.sujet)) },
        hint: 'Le sujet peut être avant ou après le verbe. Pose la question à chaque verbe.',
        steps: [
          DEF_INVERSION,
          lignes
            .map((l) => {
              const avant = ORDRE_HABITUEL.includes(l) ? 'avant' : 'après';
              return `Avec « ${l.verbe} », le sujet « ${l.sujet} » est placé ${avant} le verbe.`;
            })
            .join(' '),
          `Réponses : **${lignes.map((l) => l.sujet).join(' ; ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. COD ou COI ─────────────────────────

const COD = 'un COD';
const COI = 'un COI';
const CC = 'un complément circonstanciel';
const NOMS_OBJETS = ['COD', 'COI', 'complément circonstanciel'] as const;

const sansCirc = (o: Objet): string => `${o.s} ${o.verbe} ${o.obj}`;
const phraseObjet = (o: Objet): string => `${sansCirc(o)} ${o.circ}.`;
const circDevant = (o: Objet): string => `${maj(o.circ)}, ${lowerFirst(sansCirc(o))}.`;

const DEF_COD =
  'Le COD complète le verbe sans préposition. Le COI est introduit par une préposition, comme « à » (aussi dans « au », « aux ») ou « de ».';
const whyDirect = (o: Objet) =>
  o.type === 'COD'
    ? `Aucune préposition entre « ${o.verbe} » et « ${o.obj} » : c’est un COD.`
    : `« ${o.obj} » commence par la préposition « ${o.prep ?? ''} » : c’est un COI.`;
const whyHorsVerbe = (circonstance: string) =>
  `« ${circonstance} » peut se déplacer ou se supprimer : c’est un complément circonstanciel.`;

const deuxPhrase = (d: DeuxObjets, coiDAbord: boolean): string =>
  `${d.s} ${d.verbe} ${coiDAbord ? `${d.coi} ${d.cod}` : `${d.cod} ${d.coi}`}`;

function codCoiDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const o = rng.pick(OBJETS);
      const surObjet = rng.int(0, 2) > 0;
      const g = surObjet ? o.obj : o.circ;
      const bon = surObjet ? (o.type === 'COD' ? COD : COI) : CC;
      const why = surObjet ? whyDirect(o) : whyHorsVerbe(o.circ);
      const { answer, traps } = choice(
        rng,
        bon,
        [COD, COI, CC].filter((x) => x !== bon).map((label) => ({ label, why })),
      );
      return {
        prompt: `Dans « ${phraseObjet(o)} », le groupe « ${g} » est…`,
        answer,
        traps,
        hint: 'Teste d’abord : peut-on déplacer le groupe ? Sinon, cherche une préposition devant lui.',
        steps: [DEF_COD, why, `C’est **${bon}**.`],
      };
    }
    case 2: {
      const d = rng.pick(DEUX_OBJETS);
      const groupes = [d.cod, d.coi, d.circ];
      const { gauche, droite } = colonnes(rng, [0, 1, 2]);
      return {
        prompt: `Associe chaque groupe à sa fonction : « ${deuxPhrase(d, false)} ${d.circ}. »`,
        answer: {
          kind: 'match',
          left: gauche.map((i) => at(groupes, i)),
          right: droite.map((i) => at(NOMS_OBJETS, i)),
          pairs: gauche.map((i) => droite.indexOf(i)),
        },
        hint: 'Un seul groupe se déplace facilement. Pour les deux autres, regarde s’il y a une préposition.',
        steps: [
          DEF_COD,
          `« ${d.circ} » se déplace : c’est un complément circonstanciel.`,
          `COD : **${d.cod}** ; COI : **${d.coi}** ; complément circonstanciel : **${d.circ}**.`,
        ],
      };
    }
    case 3: {
      const o = rng.pick(OBJETS);
      const accepted = [o.obj];
      return {
        prompt: `Écris le ${o.type} de cette phrase : « ${circDevant(o)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [o.circ, whyHorsVerbe(o.circ)],
          [o.s, `« ${o.s} » est le sujet : il fait l’action.`],
          ...(o.prep
            ? [
                [
                  o.obj.slice(o.prep.length + 1),
                  `Il manque « ${o.prep} » : la préposition fait partie du COI.`,
                ] as const,
              ]
            : []),
          [`${o.verbe} ${o.obj}`, `Enlève le verbe « ${o.verbe} » : écris seulement son complément.`],
        ]),
        hint: 'Mets de côté le groupe qui se déplace. Cherche ce qui complète le verbe.',
        steps: [
          `« ${o.circ} » est un complément circonstanciel : je le mets de côté.`,
          whyDirect(o),
          `Le ${o.type} est **${o.obj}**.`,
        ],
      };
    }
    case 4: {
      const d = rng.pick(DEUX_OBJETS);
      const coiDAbord = rng.int(0, 1) === 0;
      return {
        prompt: `Cette phrase a deux compléments d’objet. Écris-les : « ${maj(d.circ)}, ${lowerFirst(deuxPhrase(d, coiDAbord))}. »`,
        answer: { kind: 'cloze', parts: segments(['COD : ', 'COI : ']), blanks: saisies([d.cod, d.coi]) },
        hint: 'L’ordre des deux compléments peut changer. Cherche la préposition.',
        steps: [
          DEF_COD,
          `« ${d.circ} » est circonstanciel. « ${d.coi} » commence par une préposition.`,
          `COD : **${d.cod}** ; COI : **${d.coi}**.`,
        ],
      };
    }
    default: {
      const lignes = pickN(rng, DEUX_OBJETS, 3);
      const fonctions = rng.shuffle([0, 1, 2]);
      const cibles = lignes.map((d, i) => {
        const f = at(fonctions, i);
        return { groupe: at([d.cod, d.coi, d.circ], f), nom: at(NOMS_OBJETS, f) };
      });
      const libelles = cibles.map((c, i) => `Ligne ${i + 1}, « ${c.groupe} » : `);
      return {
        prompt: `Lis le texte. Choisis la fonction de ${cibles.map((c) => `« ${c.groupe} »`).join(', ')}.`,
        figure: document(
          'Nouvelles du quartier',
          lignes.map((d, i) => `${deuxPhrase(d, i === 1)} ${d.circ}.`),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(libelles),
          blanks: listes(
            NOMS_OBJETS,
            cibles.map((c) => c.nom),
          ),
        },
        hint: 'Attention : un groupe qui commence par « à » n’est pas toujours un COI. Essaie de le déplacer.',
        steps: [
          DEF_COD,
          'Un complément circonstanciel se déplace ou se supprime, même s’il commence par « à ».',
          `Réponses : **${cibles.map((c) => c.nom).join(' ; ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Attribut du sujet ou complément d'objet ─────────────────────────

const ATTRIBUT = 'un attribut du sujet';
const OBJET = 'un complément d’objet';
const DEF_ATTRIBUT =
  'Après un verbe attributif (être, devenir, rester, sembler, paraître, avoir l’air), le groupe dit comment est le sujet ou ce qu’il est.';

/** Genre et nombre du sujet, dans l’ordre des propositions d’accord. */
const GENRES_NOMBRES = ['masculin singulier', 'féminin singulier', 'masculin pluriel', 'féminin pluriel'] as const;

const INDICE_FONCTION: Record<string, string> = {
  'attribut du sujet': 'verbe attributif',
  COD: 'autre verbe, pas de préposition',
  COI: 'autre verbe, avec une préposition',
};

const whyAttribut = (s: string, verbe: string, groupe: string) =>
  `« ${verbe} » est un verbe attributif : « ${groupe} » parle du sujet « ${s} ». C’est un attribut.`;
const whyObjet = (s: string, verbe: string, groupe: string) =>
  `« ${verbe} » n’est pas un verbe attributif : « ${s} » et « ${groupe} » désignent deux personnes différentes.`;

function attributDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const j = rng.pick(JUMELLES);
      const estAttribut = rng.int(0, 1) === 0;
      const verbe = estAttribut ? j.attributif : j.action;
      const bon = estAttribut ? ATTRIBUT : OBJET;
      const why = estAttribut ? whyAttribut(j.s, verbe, j.groupe) : whyObjet(j.s, verbe, j.groupe);
      const { answer, traps } = choice(rng, bon, [
        { label: estAttribut ? OBJET : ATTRIBUT, why },
        { label: 'le sujet', why: `Le sujet est « ${j.s} » : c’est lui qui commande le verbe.` },
      ]);
      return {
        prompt: `Dans « ${j.s} ${verbe} ${j.groupe}. », le groupe « ${j.groupe} » est…`,
        answer,
        traps,
        hint: 'Regarde le verbe. Le groupe parle-t-il du sujet, ou de quelqu’un d’autre ?',
        steps: [DEF_ATTRIBUT, why, `C’est **${bon}**.`],
      };
    }
    case 2: {
      const cible = rng.pick(['attribut', 'objet'] as const);
      const [premiere, ...autres] = pickN(rng, JUMELLES, 4);
      if (!premiere) throw new Error('banque vide');
      const ecrire = (j: (typeof JUMELLES)[number], attribut: boolean) =>
        `${j.s} ${attribut ? j.attributif : j.action} ${j.groupe}.`;
      const bonne = ecrire(premiere, cible === 'attribut');
      const options = rng.shuffle([bonne, ...autres.map((j) => ecrire(j, cible !== 'attribut'))]);
      return {
        prompt: `Dans quelle phrase le groupe placé après le verbe est-il ${cible === 'attribut' ? ATTRIBUT : OBJET} ?`,
        answer: { kind: 'choice', options, correct: options.indexOf(bonne) },
        traps: autres.map((j) => ({
          option: options.indexOf(ecrire(j, cible !== 'attribut')),
          why: cible === 'attribut' ? whyObjet(j.s, j.action, j.groupe) : whyAttribut(j.s, j.attributif, j.groupe),
        })),
        hint: 'Compare les verbes. Lesquels relient le groupe au sujet ?',
        steps: [
          DEF_ATTRIBUT,
          cible === 'attribut'
            ? whyAttribut(premiere.s, premiere.attributif, premiere.groupe)
            : whyObjet(premiere.s, premiere.action, premiere.groupe),
          `C’est : **${bonne}**`,
        ],
      };
    }
    case 3: {
      const a = rng.pick(ATTRIBUTS);
      const accepted = [a.adj];
      return {
        prompt: `Écris l’attribut du sujet : « ${maj(a.circ)}, ${lowerFirst(a.s)} ${a.verbe} ${a.adj}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [a.s, `« ${a.s} » est le sujet. L’attribut dit comment est ce sujet.`],
          [a.verbe, `« ${a.verbe} » est le verbe attributif. L’attribut est ce qui vient après lui.`],
          [`${a.verbe} ${a.adj}`, `Enlève le verbe « ${a.verbe} » : il ne fait pas partie de l’attribut.`],
          [a.circ, `« ${a.circ} » est un complément circonstanciel.`],
        ]),
        hint: 'Trouve le verbe attributif. Cherche le mot qui décrit le sujet.',
        steps: [
          DEF_ATTRIBUT,
          `Le verbe est « ${a.verbe} ». « ${a.adj} » dit comment est le sujet « ${a.s} ».`,
          `L’attribut est **${a.adj}**.`,
        ],
      };
    }
    case 4: {
      const [jumelle, autre] = pickN(rng, JUMELLES, 2);
      if (!jumelle || !autre) throw new Error('banque vide');
      const a = rng.pick(ATTRIBUTS);
      const direct = rng.pick(OBJETS.filter((o) => o.type === 'COD'));
      const indirect = rng.pick(OBJETS.filter((o) => o.type === 'COI'));
      const lignes = rng.shuffle([
        { phrase: `${a.s} ${a.verbe} ${a.adj}.`, groupe: a.adj, nom: 'attribut du sujet' },
        {
          phrase: `${jumelle.s} ${jumelle.attributif} ${jumelle.groupe}.`,
          groupe: jumelle.groupe,
          nom: 'attribut du sujet',
        },
        rng.int(0, 1) === 0
          ? { phrase: `${autre.s} ${autre.action} ${autre.groupe}.`, groupe: autre.groupe, nom: 'COD' }
          : { phrase: `${sansCirc(direct)}.`, groupe: direct.obj, nom: 'COD' },
        { phrase: `${sansCirc(indirect)}.`, groupe: indirect.obj, nom: 'COI' },
      ]);
      const libelles = lignes.map((l, i) => `Ligne ${i + 1}, « ${l.groupe} » : `);
      return {
        prompt: `Lis le texte. Choisis la fonction de ${lignes.map((l) => `« ${l.groupe} »`).join(', ')}.`,
        figure: document(
          'Portraits',
          lignes.map((l) => l.phrase),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(libelles),
          blanks: listes(
            ['attribut du sujet', 'COD', 'COI'],
            lignes.map((l) => l.nom),
          ),
        },
        hint: 'Repère d’abord les verbes attributifs. Pour les autres, cherche une préposition.',
        steps: [
          DEF_ATTRIBUT,
          'Après les autres verbes, c’est un complément d’objet : COD sans préposition, COI avec.',
          lignes.map((l, i) => `Ligne ${i + 1} : ${INDICE_FONCTION[l.nom]}.`).join(' '),
          `Réponses : **${lignes.map((l) => l.nom).join(' ; ')}**.`,
        ],
      };
    }
    default: {
      const j = rng.pick(JUMELLES);
      const direct = rng.pick(OBJETS.filter((o) => o.type === 'COD'));
      const accord = rng.pick(ACCORDS_ATTRIBUT);
      const attributDAbord = rng.int(0, 1) === 0;
      const lignes = [`${j.s} ${j.attributif} ${j.groupe}.`, `${sansCirc(direct)}.`];
      if (!attributDAbord) lignes.reverse();
      const ligneAttribut = attributDAbord ? 1 : 2;
      const ligneObjet = attributDAbord ? 2 : 1;
      const bonAccord = at(accord.options, accord.correct);
      return {
        prompt: `Lis le texte. Écris l’attribut du sujet (ligne ${ligneAttribut}) et le complément d’objet (ligne ${ligneObjet}). Accorde ensuite l’attribut de la ligne 3.`,
        figure: document('Une journée au village', [...lignes, accord.texte]),
        answer: {
          kind: 'cloze',
          parts: segments(['Attribut du sujet : ', 'Complément d’objet : ', 'Ligne 3, mot qui manque : ']),
          blanks: [
            ...saisies([j.groupe, direct.obj]),
            { mode: 'list' as const, options: [...accord.options], correct: accord.correct },
          ],
        },
        hint: 'Cherche le verbe attributif. À la ligne 3, l’attribut s’accorde avec le sujet.',
        steps: [
          DEF_ATTRIBUT,
          `« ${j.attributif} » est attributif ; « ${direct.verbe} » ne l’est pas. L’attribut s’accorde avec « ${accord.sujet} » (${at(GENRES_NOMBRES, accord.correct)}).`,
          `Réponses : **${j.groupe}** ; **${direct.obj}** ; **${bonAccord}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. Compléments circonstanciels de temps, de lieu, de cause ─────────────────────────

const LABEL: Record<Circonstance, string> = { temps: 'le temps', lieu: 'le lieu', cause: 'la cause' };
const QUESTION: Record<Circonstance, string> = { temps: 'Quand ?', lieu: 'Où ?', cause: 'Pourquoi ?' };
const DEF_CIRC =
  'Le complément circonstanciel de temps répond à « Quand ? », celui de lieu à « Où ? », celui de cause à « Pourquoi ? ».';
const whyAutre = (groupe: string, type: Circonstance) =>
  `« ${groupe} » répond à « ${QUESTION[type]} » : il indique ${LABEL[type]}.`;

function circonstancielsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const t = rng.pick(TRIPLES);
      const type = rng.pick(CIRCONSTANCES);
      const g = t[type];
      const { answer, traps } = choice(
        rng,
        LABEL[type],
        CIRCONSTANCES.filter((c) => c !== type).map((c) => ({ label: LABEL[c], why: whyAutre(g, type) })),
      );
      return {
        prompt: `Dans « ${maj(t.action)} ${g}. », qu’indique le groupe « ${g} » ?`,
        answer,
        traps,
        hint: 'Essaie les questions « Quand ? », « Où ? » et « Pourquoi ? ». Une seule va avec ce groupe.',
        steps: [DEF_CIRC, whyAutre(g, type), `Il indique **${LABEL[type]}**.`],
      };
    }
    case 2: {
      const t = rng.pick(TRIPLES);
      const { gauche, droite } = colonnes(rng, CIRCONSTANCES);
      return {
        prompt: `Associe chaque complément à ce qu’il indique : « ${maj(t.temps)}, ${t.action} ${t.lieu} ${t.cause}. »`,
        answer: {
          kind: 'match',
          left: gauche.map((c) => t[c]),
          right: droite.map((c) => LABEL[c]),
          pairs: gauche.map((c) => droite.indexOf(c)),
        },
        hint: 'Pose une question à chaque groupe : quand, où ou pourquoi ?',
        steps: [
          DEF_CIRC,
          CIRCONSTANCES.map((c) => whyAutre(t[c], c)).join(' '),
          `Temps : **${t.temps}** ; lieu : **${t.lieu}** ; cause : **${t.cause}**.`,
        ],
      };
    }
    case 3: {
      const t = rng.pick(TRIPLES);
      const type = rng.pick(CIRCONSTANCES);
      const accepted = [t[type]];
      const debut = rng.int(0, 1) === 0;
      const phrase = debut
        ? `${maj(t.temps)}, ${t.action} ${t.lieu} ${t.cause}.`
        : `${maj(t.lieu)}, ${t.action} ${t.temps} ${t.cause}.`;
      return {
        prompt: `Écris le complément circonstanciel de ${type} : « ${phrase} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          CIRCONSTANCES.filter((c) => c !== type).map((c) => [t[c], whyAutre(t[c], c)] as const),
        ),
        hint: `Pose la question « ${QUESTION[type]} » après le verbe.`,
        steps: [DEF_CIRC, `Je demande : « ${QUESTION[type]} »`, `Le complément de ${type} est **${t[type]}**.`],
      };
    }
    case 4: {
      const c = rng.pick(CIRCONSTANCIELS);
      return {
        prompt: `Trouve le complément circonstanciel et ce qu’il indique : « ${c.phrase} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Complément circonstanciel : ', 'Il indique : ']),
          blanks: [
            ...saisies([c.cc]),
            ...listes(
              CIRCONSTANCES.map((x) => LABEL[x]),
              [LABEL[c.type]],
            ),
          ],
        },
        hint: 'Cherche le groupe qu’on peut supprimer. Ne te fie pas au premier mot : lis le sens.',
        steps: [
          'Un complément circonstanciel peut être un seul mot ou un groupe de mots, avec ou sans préposition.',
          whyAutre(c.cc, c.type),
          `C’est **${c.cc}** : **${LABEL[c.type]}**.`,
        ],
      };
    }
    default: {
      const lignes = pickN(rng, TRIPLES, 3);
      const types = rng.shuffle(CIRCONSTANCES);
      // Chaque ligne porte deux compléments : celui qu'on demande et un autre.
      const textes = lignes.map((t, i) => {
        const type = at(types, i);
        const autre = rng.pick(CIRCONSTANCES.filter((c) => c !== type));
        const debut = autre === 'cause' ? type : autre;
        const fin = debut === type ? autre : type;
        return `${maj(t[debut])}, ${t.action} ${t[fin]}.`;
      });
      const libelles = types.map((c, i) => `Ligne ${i + 1}, ${c} : `);
      const bons = lignes.map((t, i) => t[at(types, i)]);
      return {
        prompt: `Lis le texte. Écris le complément circonstanciel demandé : ${types.map((c, i) => `ligne ${i + 1}, ${c}`).join(' ; ')}.`,
        figure: document('Le journal de l’école', textes),
        answer: { kind: 'cloze', parts: segments(libelles), blanks: saisies(bons) },
        hint: 'Chaque ligne a deux compléments. Pose la bonne question avant de recopier.',
        steps: [
          DEF_CIRC,
          `${types.map((c, i) => `Ligne ${i + 1} : « ${QUESTION[c]} »`).join(' ; ')}.`,
          `Réponses : **${bons.join(' ; ')}**.`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesPhraseSimple(n.factId, ...n.faits) },
  generate: n.generate,
});

export const FCM2_PHRASE_SIMPLE: readonly Skill[] = [
  skill({
    id: 'fcm2-constituants-phrase',
    title: 'Les groupes de la phrase simple',
    memo: [
      'Une phrase simple a un **groupe sujet** et un **groupe verbal**. Les deux sont obligatoires.',
      'Le **groupe circonstanciel** ajoute un détail : tu peux le déplacer ou le supprimer.',
      'Exemple : Le facteur / distribue le courrier / chaque matin.',
    ],
    factId: 'groupes-programme',
    faits: ['deux-groupes', 'gc', 'gv', 'gs-accord', 'gs-pronom', 'sujets-programme', 'sujets-types'],
    generate: constituantsDraft,
  }),
  skill({
    id: 'fcm2-sujet-inverse',
    title: 'Le sujet inversé',
    memo: [
      'Le **sujet inversé** est placé après le verbe : « Dans le ciel brille la lune. »',
      'Tu le rencontres dans des questions : « Où dort le chat ? »',
      'Pour le trouver, demande : « Qui est-ce qui… ? » ou « Qu’est-ce qui… ? »',
    ],
    factId: 'inverse-programme',
    faits: ['inversion-exemple', 'ordre', 'inversion-sujet', 'gs-accord'],
    generate: sujetInverseDraft,
  }),
  skill({
    id: 'fcm2-cod-coi',
    title: 'COD ou COI',
    memo: [
      'Le **COD** complète le verbe sans préposition : « Je vois les enfants. »',
      'Le **COI** complète le verbe avec une préposition : « Je parle à quelqu’un. »',
      'Piège : un **complément circonstanciel** peut aussi commencer par « à ». Essaie de le déplacer !',
    ],
    factId: 'cod-coi-programme',
    faits: ['cod', 'coi', 'deux-complements', 'circ-sens'],
    generate: codCoiDraft,
  }),
  skill({
    id: 'fcm2-attribut-ou-objet',
    title: 'Attribut du sujet ou complément d’objet',
    memo: [
      'L’**attribut du sujet** suit un **verbe attributif** : « Le lac reste calme. »',
      'Ces verbes : être, devenir, rester, sembler, paraître, avoir l’air.',
      'Avec un autre verbe, c’est souvent un **complément d’objet** : « Je vois le lac. »',
    ],
    factId: 'attribut-programme',
    faits: ['attribut', 'attribut-nature', 'attributifs-rester', 'attributifs-sembler', 'cod', 'coi'],
    generate: attributDraft,
  }),
  skill({
    id: 'fcm2-circonstanciels-temps-lieu-cause',
    title: 'Temps, lieu ou cause',
    memo: [
      'Un **complément circonstanciel** peut dire le **moment** (Quand ?) ou le **lieu** (Où ?).',
      'Il peut aussi dire la **cause** (Pourquoi ?) : « à cause de la pluie », « en raison de la neige ».',
    ],
    factId: 'circonstanciels-programme',
    faits: ['circ-sens', 'circ-nature', 'circ-cause'],
    generate: circonstancielsDraft,
  }),
];
