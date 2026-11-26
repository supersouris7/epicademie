import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill } from '../types.ts';
import {
  ACCORDS_6E,
  AMBIGUS,
  ATTRIBUTS_6E,
  CAS_PARTICULIERS,
  CIRCONSTANCIELS_6E,
  COMPOSEES,
  CONSTITUEES,
  CONSTRUCTIONS,
  DEUX_COI,
  DIRECTS,
  DOUBLES,
  EMPLOIS,
  EXPLICATION,
  INDIRECTS,
  INVERSEES,
  NATURES,
  PAIRES,
  PRONOMINAUX,
  REGIMES,
  SENS,
  TROIS_CC,
  coiDe,
  faitPhraseSimple6e,
  gvC,
  phraseCcDebut,
  phraseCcFin,
  phraseDebut,
  phraseFin,
  phraseInversee,
  sourcesPhraseSimple6e,
  type Circonstanciel,
  type Constituee,
  type Construction,
  type Emploi,
  type Sens,
} from './phrase-simple-6e.donnees.ts';
import { maj } from './phrase-simple.donnees.ts';
import { at, colonnes, document, listes, lowerFirst, pickN, saisies, segments, textTraps } from './outils.ts';

/**
 * Chapitre « La phrase simple » (6e). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue, 6e : « Analyser une phrase simple ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), 6e — « ${faitPhraseSimple6e(id).citation} »`;

// ───────────────────────── 1. Les constituants de la phrase ─────────────────────────

const DEF_CONSTITUANTS =
  'La phrase type a deux constituants obligatoires, le groupe sujet et le groupe verbal, et un constituant facultatif, le groupe circonstanciel.';
const GROUPES = ['le groupe sujet', 'le groupe verbal', 'le groupe circonstanciel'] as const;
type Groupe = (typeof GROUPES)[number];
const groupeDe = (p: Constituee, g: Groupe): string =>
  g === 'le groupe sujet' ? p.gs : g === 'le groupe verbal' ? gvC(p) : p.gc;
const preuve = (p: Constituee, g: Groupe): string =>
  g === 'le groupe sujet'
    ? `« ${p.gs} » peut être remplacé par « ${p.pronom} » et commande l’accord du verbe « ${p.verbe} ».`
    : g === 'le groupe verbal'
      ? `« ${gvC(p)} » a pour noyau le verbe « ${p.verbe} », avec son complément.`
      : `« ${p.gc} » se déplace ou se supprime : il est facultatif.`;
const coupe = (a: string, b: string, c: string): string => `${a} / ${b} / ${c}`;

function constituantsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(CONSTITUEES);
      const g = rng.pick(GROUPES);
      const { answer, traps } = choice(
        rng,
        g,
        GROUPES.filter((x) => x !== g).map((label) => ({
          label,
          why: `Non : ${label}, dans cette phrase, est « ${groupeDe(p, label)} ».`,
        })),
      );
      return {
        prompt: `Dans « ${phraseFin(p)} », quel constituant est « ${groupeDe(p, g)} » ?`,
        answer,
        traps,
        hint: 'Repère le verbe. Teste ensuite : le groupe se remplace-t-il par un pronom, contient-il le verbe, se déplace-t-il ?',
        steps: [DEF_CONSTITUANTS, preuve(p, g), `C’est **${g}**.`],
      };
    }
    case 2: {
      const p = rng.pick(CONSTITUEES);
      const bon = coupe(p.gs, gvC(p), p.gc);
      const faux = [
        {
          label: coupe(p.noyau, `${p.gs.slice(p.noyau.length + 1)} ${gvC(p)}`, p.gc),
          why: `Le groupe sujet est « ${p.gs} » en entier : on ne coupe pas ses compléments.`,
        },
        {
          label: coupe(p.gs, p.verbe, `${p.suite} ${p.gc}`),
          why: `« ${p.suite} » complète le verbe : il appartient au groupe verbal.`,
        },
        {
          label: coupe(`${p.gs} ${p.verbe}`, p.suite, p.gc),
          why: `Le verbe « ${p.verbe} » est le noyau du groupe verbal, pas une partie du sujet.`,
        },
      ];
      const { answer, traps } = choice(rng, bon, faux);
      return {
        prompt: `Quel découpage en groupe sujet / groupe verbal / groupe circonstanciel est juste pour « ${phraseFin(p)} » ?`,
        answer,
        traps,
        hint: 'Le sujet se remplace par un seul pronom. Ce qui complète le verbe reste avec lui.',
        steps: [
          DEF_CONSTITUANTS,
          `${preuve(p, 'le groupe sujet')} ${preuve(p, 'le groupe circonstanciel')}`,
          `**${bon}**.`,
        ],
      };
    }
    case 3: {
      const p = rng.pick(CONSTITUEES);
      const accepted = [p.gs];
      return {
        prompt: `Écris le groupe sujet en entier : « ${phraseDebut(p)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [p.noyau, `Le groupe sujet est incomplet : « ${p.gs} » se remplace en entier par « ${p.pronom} ».`],
          [p.gc, `« ${p.gc} » se déplace ou se supprime : c’est le groupe circonstanciel.`],
          [gvC(p), `« ${gvC(p)} » contient le verbe : c’est le groupe verbal.`],
          [p.suite, `« ${p.suite} » complète le verbe : il fait partie du groupe verbal.`],
        ]),
        hint: 'Remplace le sujet par un pronom : tous les mots remplacés font partie du groupe sujet.',
        steps: [`Le verbe est « ${p.verbe} ».`, preuve(p, 'le groupe sujet'), `Le groupe sujet est **${p.gs}**.`],
      };
    }
    case 4: {
      const i = rng.pick(INVERSEES);
      return {
        prompt: `Analyse cette phrase : « ${phraseInversee(i)} » Écris le groupe sujet et les deux compléments circonstanciels.`,
        answer: {
          kind: 'cloze',
          parts: segments(['Groupe sujet : ', 'Complément de temps : ', 'Complément de lieu : ']),
          blanks: saisies([i.gs, i.temps, i.lieu]),
        },
        hint: 'Le sujet n’est pas toujours avant le verbe. Pose « Qui est-ce qui… ? » ou « Qu’est-ce qui… ? » au verbe.',
        steps: [
          DEF_CONSTITUANTS,
          `Le sujet est placé après le verbe « ${i.verbe} ». Les deux groupes du début se déplacent ou se suppriment.`,
          `Réponses : **${i.gs}** ; temps : **${i.temps}** ; lieu : **${i.lieu}**.`,
        ],
      };
    }
    default: {
      const [a, b, d] = pickN(rng, CONSTITUEES, 3);
      if (!a || !b || !d) throw new Error('banque vide');
      const pronoms = ['il', 'elle', 'ils', 'elles'];
      return {
        prompt:
          'Lis le texte. Écris le groupe sujet de la ligne 1 et le groupe circonstanciel de la ligne 2. Choisis le pronom qui remplace le groupe sujet de la ligne 3.',
        figure: document('Carnet d’observation', [phraseDebut(a), phraseFin(b), phraseDebut(d)]),
        answer: {
          kind: 'cloze',
          parts: segments(['Ligne 1, groupe sujet : ', 'Ligne 2, groupe circonstanciel : ', 'Ligne 3, pronom : ']),
          blanks: [...saisies([a.gs, b.gc]), ...listes(pronoms, [d.pronom])],
        },
        hint: 'Trouve chaque verbe. Pour le pronom, observe le genre et le nombre du nom principal du sujet.',
        steps: [
          DEF_CONSTITUANTS,
          `${preuve(a, 'le groupe sujet')} ${preuve(b, 'le groupe circonstanciel')} Ligne 3 : « ${d.gs} » se remplace par un pronom de même genre et de même nombre.`,
          `Réponses : **${a.gs}** ; **${b.gc}** ; **${d.pronom}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Attribut du sujet ou COD ─────────────────────────

const ATTRIBUT = 'un attribut du sujet';
const COD = 'un COD';
const DEF_ATTRIBUT =
  'L’attribut du sujet suit un verbe attributif (être, devenir, rester, sembler, paraître, avoir l’air) et dit ce qu’est le sujet ou comment il est. Le COD complète un autre verbe, sans préposition.';
const whyAttribut = (s: string, verbe: string, g: string) =>
  `« ${verbe} » est un verbe attributif : « ${g} » désigne ou décrit le sujet « ${s} ».`;
const whyCod = (s: string, verbe: string, g: string) =>
  `« ${verbe} » n’est pas attributif : « ${g} » désigne quelqu’un ou quelque chose d’autre que « ${s} », sans préposition.`;
const NATURES_FONCTION = ['attribut du sujet', 'COD', 'partie du verbe conjugué'] as const;

function attributDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(PAIRES);
      const estAttribut = rng.int(0, 1) === 0;
      const verbe = estAttribut ? p.attributif : p.action;
      const bon = estAttribut ? ATTRIBUT : COD;
      const why = estAttribut ? whyAttribut(p.s, verbe, p.groupe) : whyCod(p.s, verbe, p.groupe);
      const { answer, traps } = choice(rng, bon, [
        { label: estAttribut ? COD : ATTRIBUT, why },
        { label: 'le sujet', why: `Le sujet est « ${p.s} » : c’est lui qui commande le verbe.` },
      ]);
      return {
        prompt: `Dans « ${p.s} ${verbe} ${p.groupe}. », le groupe « ${p.groupe} » est…`,
        answer,
        traps,
        hint: 'Observe le verbe : relie-t-il le groupe au sujet, ou désigne-t-il une autre personne ?',
        steps: [DEF_ATTRIBUT, why, `C’est **${bon}**.`],
      };
    }
    case 2: {
      const cible = rng.pick(['attribut', 'cod'] as const);
      const [premiere, ...autres] = pickN(rng, PAIRES, 4);
      if (!premiere) throw new Error('banque vide');
      const ecrire = (p: (typeof PAIRES)[number], attribut: boolean) =>
        `${p.s} ${attribut ? p.attributif : p.action} ${p.groupe}.`;
      const bonne = ecrire(premiere, cible === 'attribut');
      const options = rng.shuffle([bonne, ...autres.map((p) => ecrire(p, cible !== 'attribut'))]);
      return {
        prompt: `Dans quelle phrase le groupe nominal placé après le verbe est-il ${cible === 'attribut' ? ATTRIBUT : COD} ?`,
        answer: { kind: 'choice', options, correct: options.indexOf(bonne) },
        traps: autres.map((p) => ({
          option: options.indexOf(ecrire(p, cible !== 'attribut')),
          why: cible === 'attribut' ? whyCod(p.s, p.action, p.groupe) : whyAttribut(p.s, p.attributif, p.groupe),
        })),
        hint: 'Pour chaque phrase, demande-toi si le groupe désigne la même personne que le sujet.',
        steps: [
          DEF_ATTRIBUT,
          cible === 'attribut'
            ? whyAttribut(premiere.s, premiere.attributif, premiere.groupe)
            : whyCod(premiere.s, premiere.action, premiere.groupe),
          `C’est : **${bonne}**`,
        ],
      };
    }
    case 3: {
      const a = rng.pick(ATTRIBUTS_6E);
      const accepted = [a.att];
      return {
        prompt: `Écris l’attribut du sujet : « ${maj(a.circ)}, ${lowerFirst(a.s)} ${a.verbe} ${a.att}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [a.s, `« ${a.s} » est le sujet. L’attribut apporte une information sur ce sujet.`],
          [a.verbe, `« ${a.verbe} » est le verbe attributif : l’attribut est le groupe qui le suit.`],
          [`${a.verbe} ${a.att}`, `Retire le verbe « ${a.verbe} » : il ne fait pas partie de l’attribut.`],
          [a.circ, `« ${a.circ} » se déplace ou se supprime : c’est un complément circonstanciel.`],
        ]),
        hint: 'Trouve le verbe attributif, puis tout le groupe qui renseigne sur le sujet.',
        steps: [
          DEF_ATTRIBUT,
          `Le verbe est « ${a.verbe} ». « ${a.att} » renseigne sur le sujet « ${a.s} ».`,
          `L’attribut est **${a.att}**.`,
        ],
      };
    }
    case 4: {
      const a = rng.pick(ATTRIBUTS_6E);
      const direct = rng.pick(DIRECTS);
      const comp = rng.pick(COMPOSEES);
      const p = rng.pick(PAIRES);
      const lignes = rng.shuffle([
        {
          phrase: `${a.s} ${a.verbe} ${a.att}.`,
          groupe: a.att,
          nom: 'attribut du sujet',
          why: whyAttribut(a.s, a.verbe, a.att),
        },
        {
          phrase: `${direct.s} ${direct.verbe} ${direct.cod}.`,
          groupe: direct.cod,
          nom: 'COD',
          why: whyCod(direct.s, direct.verbe, direct.cod),
        },
        {
          phrase: comp.phrase,
          groupe: comp.mot,
          nom: 'partie du verbe conjugué',
          why: `« ${comp.mot} » complète l’auxiliaire « être » : ensemble, ils forment un temps composé, ce n’est pas un attribut.`,
        },
        rng.int(0, 1) === 0
          ? {
              phrase: `${p.s} ${p.attributif} ${p.groupe}.`,
              groupe: p.groupe,
              nom: 'attribut du sujet',
              why: whyAttribut(p.s, p.attributif, p.groupe),
            }
          : {
              phrase: `${p.s} ${p.action} ${p.groupe}.`,
              groupe: p.groupe,
              nom: 'COD',
              why: whyCod(p.s, p.action, p.groupe),
            },
      ]);
      const libelles = lignes.map((l, i) => `Ligne ${i + 1}, « ${l.groupe} » : `);
      return {
        prompt: `Lis le texte. Choisis le rôle de ${lignes.map((l) => `« ${l.groupe} »`).join(', ')}.`,
        figure: document(
          'Scènes de village',
          lignes.map((l) => l.phrase),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(libelles),
          blanks: listes(
            NATURES_FONCTION,
            lignes.map((l) => l.nom),
          ),
        },
        hint: 'Attention : « être » peut servir d’auxiliaire. Repère d’abord le verbe conjugué en entier.',
        steps: [
          DEF_ATTRIBUT,
          lignes.map((l, i) => `Ligne ${i + 1} : ${l.why}`).join(' '),
          `Réponses : **${lignes.map((l) => l.nom).join(' ; ')}**.`,
        ],
      };
    }
    default: {
      const p = rng.pick(PAIRES);
      const direct = rng.pick(DIRECTS);
      const accord = rng.pick(ACCORDS_6E);
      const attributDAbord = rng.int(0, 1) === 0;
      const lignes = [
        `${p.s} ${p.attributif} ${p.groupe}.`,
        `${direct.s} ${direct.verbe} ${direct.cod} ${direct.circ}.`,
      ];
      if (!attributDAbord) lignes.reverse();
      const ligneAttribut = attributDAbord ? 1 : 2;
      const ligneCod = attributDAbord ? 2 : 1;
      return {
        prompt: `Lis le texte. Écris l’attribut du sujet (ligne ${ligneAttribut}) et le COD (ligne ${ligneCod}). Choisis le pronom qui remplace ce COD, puis accorde l’attribut de la ligne 3.`,
        figure: document('Chronique du port', [...lignes, accord.texte]),
        answer: {
          kind: 'cloze',
          parts: segments([
            'Attribut du sujet : ',
            'COD : ',
            'Pronom qui remplace le COD : ',
            'Ligne 3, mot qui manque : ',
          ]),
          blanks: [
            ...saisies([p.groupe, direct.cod]),
            ...listes(['le', 'la', 'les'], [direct.pronom]),
            { mode: 'list' as const, options: [...accord.options], correct: accord.correct },
          ],
        },
        hint: 'Trouve d’abord le verbe attributif. Le pronom suit le genre et le nombre du COD ; l’attribut suit ceux du sujet.',
        steps: [
          DEF_ATTRIBUT,
          `« ${p.attributif} » est attributif, « ${direct.verbe} » ne l’est pas. Le pronom « ${direct.pronom} » reprend « ${direct.cod} ». À la ligne 3, l’attribut s’accorde avec « ${accord.sujet} ».`,
          `Réponses : **${p.groupe}** ; **${direct.cod}** ; **${direct.pronom}** ; **${at(accord.options, accord.correct)}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Le COI ─────────────────────────

const DEF_COI =
  'Le COI complète le verbe et il est introduit par une préposition, comme « à » ou « de » (avec « au », « aux », « du », « des »). Un pronom COI peut s’écrire sans préposition : « Il lui parle. »';
const sansPrep = (s: string, verbe: string, nom: string) => `${s} ${verbe} ${nom}`;

function coiDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const i = rng.pick(INDIRECTS);
      const bon = coiDe(i);
      const { answer, traps } = choice(rng, bon, [
        { label: i.s, why: `« ${i.s} » est le sujet : il commande l’accord du verbe.` },
        { label: i.circ, why: `« ${i.circ} » se déplace ou se supprime : c’est un complément circonstanciel.` },
      ]);
      return {
        prompt: `Dans « ${sansPrep(i.s, i.verbe, bon)} ${i.circ}. », quel est le COI ?`,
        answer,
        traps,
        hint: 'Cherche le groupe introduit par une préposition qui complète le sens du verbe.',
        steps: [
          DEF_COI,
          `« ${bon} » complète « ${i.verbe} » avec la préposition « ${i.prep} ».`,
          `Le COI est **${bon}**.`,
        ],
      };
    }
    case 2: {
      const bon = rng.pick(INDIRECTS);
      const direct = rng.pick(DIRECTS);
      // Sans « de » dans l’attribut : aucune confusion possible avec un complément introduit par une préposition.
      const attribut = rng.pick(ATTRIBUTS_6E.filter((a) => !a.att.includes(' de ')));
      const circ = rng.pick(AMBIGUS.filter((a) => a.fonction === 'complément circonstanciel'));
      const bonne = `${bon.s} ${bon.verbe} ${coiDe(bon)}.`;
      const autres = [
        {
          phrase: `${direct.s} ${direct.verbe} ${direct.cod}.`,
          why: `« ${direct.cod} » complète le verbe sans préposition devant lui : c’est un COD.`,
        },
        {
          phrase: `${attribut.s} ${attribut.verbe} ${attribut.att}.`,
          why: `« ${attribut.att} » suit un verbe attributif : c’est un attribut du sujet.`,
        },
        { phrase: circ.phrase, why: `Dans cette phrase, « ${circ.groupe} » est circonstanciel : ${circ.raison}.` },
      ];
      const { answer, traps } = choice(
        rng,
        bonne,
        autres.map((a) => ({ label: a.phrase, why: a.why })),
      );
      return {
        prompt: 'Quelle phrase contient un complément d’objet indirect (COI) ?',
        answer,
        traps,
        hint: 'Une préposition ne suffit pas : le groupe doit être lié au sens du verbe et difficile à déplacer.',
        steps: [
          DEF_COI,
          `« ${coiDe(bon)} » complète le verbe « ${bon.verbe} » avec une préposition.`,
          `C’est : **${bonne}**`,
        ],
      };
    }
    case 3: {
      const i = rng.pick(INDIRECTS);
      const accepted = [coiDe(i)];
      return {
        prompt: `Écris le COI de cette phrase : « ${maj(i.circ)}, ${lowerFirst(i.s)} ${i.verbe} ${coiDe(i)}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [i.nom, `Il manque « ${i.prep} » : la préposition fait partie du COI.`],
          [i.circ, `« ${i.circ} » se déplace ou se supprime : c’est un complément circonstanciel.`],
          [i.s, `« ${i.s} » est le sujet.`],
          [`${i.verbe} ${coiDe(i)}`, `Retire le verbe « ${i.verbe} » : écris seulement son complément.`],
        ]),
        hint: 'Mets de côté le groupe qui se déplace. Écris le complément du verbe avec sa préposition.',
        steps: [
          `« ${i.circ} » est un complément circonstanciel.`,
          `Le verbe « ${i.verbe} » se construit avec « ${i.prep} ».`,
          `Le COI est **${coiDe(i)}**.`,
        ],
      };
    }
    case 4: {
      const p = rng.pick(PRONOMINAUX);
      const accepted = [p.coi];
      return {
        prompt: `Le COI est ici un pronom. Écris-le : « ${p.phrase} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [p.sujet, `« ${p.sujet} » est le sujet : il commande l’accord du verbe.`],
          [p.verbe, `« ${p.verbe} » est le verbe.`],
          [p.leurre, `« ${p.leurre} » peut se supprimer et ne répond pas à « à qui ? » : ce n’est pas le COI.`],
        ]),
        hint: 'Cherche le petit mot placé avant le verbe qui répond à « à qui ? ».',
        steps: [
          DEF_COI,
          `Le verbe « ${p.verbe} » se construit avec « à » : « ${p.coi} » reprend la personne concernée, sans préposition visible.`,
          `Le COI est **${p.coi}**.`,
        ],
      };
    }
    default: {
      const [d, autre] = pickN(rng, DEUX_COI, 2);
      if (!d || !autre) throw new Error('banque vide');
      return {
        prompt:
          'Lis le texte. Écris les deux COI de la ligne 1. Choisis ensuite le pronom qui remplace le groupe introduit par « à », « au » ou « aux » à la ligne 2.',
        figure: document('Échanges du jour', [
          `${d.s} ${d.verbe} ${d.de} ${d.a} ${d.circ}.`,
          `${autre.s} ${autre.verbe} ${autre.a}.`,
        ]),
        answer: {
          kind: 'cloze',
          parts: segments([
            'Ligne 1, COI qui commence par « de », « du » ou « des » : ',
            'Ligne 1, COI qui commence par « à » ou « aux » : ',
            'Ligne 2, pronom : ',
          ]),
          blanks: [...saisies([d.de, d.a]), ...listes(['lui', 'leur'], [autre.pronom])],
        },
        hint: 'Un verbe peut avoir deux compléments. Pour le pronom, regarde si le nom remplacé est au singulier ou au pluriel.',
        steps: [
          'Un verbe peut avoir deux compléments d’objet. Ici, les deux sont introduits par une préposition : ce sont deux COI.',
          `Ligne 2 : « ${autre.a} » est au ${autre.pronom === 'lui' ? 'singulier : le pronom est « lui »' : 'pluriel : le pronom est « leur »'}.`,
          `Réponses : **${d.de}** ; **${d.a}** ; **${autre.pronom}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Les compléments circonstanciels ─────────────────────────

const DEF_CC =
  'Le complément circonstanciel est facultatif : on peut le supprimer et, souvent, le déplacer. Il précise par exemple le temps, le lieu ou la cause.';
const LABEL: Record<Sens, string> = { temps: 'le temps', lieu: 'le lieu', cause: 'la cause' };
const QUESTION: Record<Sens, string> = { temps: 'Quand ?', lieu: 'Où ?', cause: 'Pourquoi ?' };
const NOM_NATURE: Record<Circonstanciel['nature'], string> = {
  'un groupe nominal': 'groupe nominal',
  'un groupe prépositionnel': 'groupe prépositionnel',
  'un adverbe': 'adverbe',
  'un groupe adjectival': 'groupe adjectival',
};
const WHY_NATURE: Record<Circonstanciel['nature'], string> = {
  'un groupe nominal':
    'un groupe nominal contient un nom précédé d’un déterminant (« le », « chaque »…), sans préposition',
  'un groupe prépositionnel': 'un groupe prépositionnel commence par une préposition (« au » cache « à » + « le »)',
  'un adverbe': 'un adverbe est un seul mot invariable',
  'un groupe adjectival': 'un groupe adjectival a pour noyau un adjectif',
};
const profil = (c: Circonstanciel) => `${LABEL[c.sens]} — ${NOM_NATURE[c.nature]}`;

function circonstanciellesDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const d = rng.pick(DIRECTS);
      const { answer, traps } = choice(rng, d.circ, [
        { label: d.cod, why: `« ${d.cod} » est un COD : il complète directement le verbe « ${d.verbe} ».` },
        { label: d.s, why: `« ${d.s} » est le sujet : il commande l’accord du verbe.` },
      ]);
      return {
        prompt: `Dans « ${d.s} ${d.verbe} ${d.cod} ${d.circ}. », quel groupe est un complément circonstanciel ?`,
        answer,
        traps,
        hint: 'Supprime les groupes un à un : lequel peut disparaître sans abîmer la phrase ?',
        steps: [
          DEF_CC,
          `Sans « ${d.circ} », la phrase « ${d.s} ${d.verbe} ${d.cod}. » reste complète.`,
          `C’est **${d.circ}**.`,
        ],
      };
    }
    case 2: {
      const x = rng.pick(CIRCONSTANCIELS_6E);
      const { answer, traps } = choice(
        rng,
        x.nature,
        NATURES.filter((n) => n !== x.nature).map((label) => ({
          label,
          why: `Non : ${WHY_NATURE[label]}. Ce n’est pas le cas de « ${x.cc} ».`,
        })),
      );
      return {
        prompt: `Dans « ${phraseCcFin(x)} », quelle est la nature du complément circonstanciel « ${x.cc} » ?`,
        answer,
        traps,
        hint: 'Cherche le mot principal du groupe et regarde ce qui le précède.',
        steps: [
          'La nature dit ce qu’est le groupe ; la fonction dit son rôle. Un complément circonstanciel peut être de plusieurs natures.',
          `Ici, ${WHY_NATURE[x.nature]}.`,
          `« ${x.cc} » est **${x.nature}**.`,
        ],
      };
    }
    case 3: {
      const t = rng.pick(TROIS_CC);
      const sens = rng.pick(SENS);
      const accepted = [t[sens]];
      return {
        prompt: `Écris le complément circonstanciel de ${sens} : « ${maj(t.temps)}, ${t.action} ${t.lieu} ${t.cause}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          SENS.filter((s) => s !== sens).map(
            (s) => [t[s], `« ${t[s]} » répond à « ${QUESTION[s]} » : il indique ${LABEL[s]}.`] as const,
          ),
        ),
        hint: `Pose la question « ${QUESTION[sens]} » après le verbe.`,
        steps: [DEF_CC, `Je demande : « ${QUESTION[sens]} »`, `Le complément de ${sens} est **${t[sens]}**.`],
      };
    }
    case 4: {
      const vus = new Set<string>();
      const choisis = rng.shuffle(CIRCONSTANCIELS_6E).filter((c) => {
        if (vus.has(profil(c))) return false;
        vus.add(profil(c));
        return true;
      });
      const cinq = choisis.slice(0, 5);
      const { gauche, droite } = colonnes(rng, cinq);
      return {
        prompt: `Associe chaque phrase au sens et à la nature de son complément circonstanciel : ${gauche.map((c) => `« ${c.cc} »`).join(', ')}.`,
        answer: {
          kind: 'match',
          left: gauche.map((c) => phraseCcDebut(c)),
          right: droite.map((c) => profil(c)),
          pairs: gauche.map((c) => droite.indexOf(c)),
        },
        hint: 'Pose « quand ? », « où ? » ou « pourquoi ? », puis regarde comment commence le groupe.',
        steps: [
          'Chaque phrase commence par son complément circonstanciel : on cherche son sens, puis sa nature.',
          cinq.map((c) => `« ${c.cc} » : ${WHY_NATURE[c.nature]}.`).join(' '),
          `Réponses : **${cinq.map((c) => `${c.cc} → ${profil(c)}`).join(' ; ')}**.`,
        ],
      };
    }
    default: {
      const circ = rng.pick(AMBIGUS.filter((a) => a.fonction === 'complément circonstanciel'));
      const coi = rng.pick(AMBIGUS.filter((a) => a.fonction === 'COI'));
      const cod = rng.pick(AMBIGUS.filter((a) => a.fonction === 'COD'));
      const autre = rng.pick(AMBIGUS.filter((a) => a !== circ && a !== coi && a !== cod));
      const lignes = rng.shuffle([circ, coi, cod, autre]);
      const libelles = lignes.map((l, i) => `Ligne ${i + 1}, « ${l.groupe} » : `);
      return {
        prompt: `Lis le texte. Choisis la fonction de ${lignes.map((l) => `« ${l.groupe} »`).join(', ')}.`,
        figure: document(
          'Une journée au port',
          lignes.map((l) => l.phrase),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(libelles),
          blanks: listes(
            ['complément circonstanciel', 'COI', 'COD'],
            lignes.map((l) => l.fonction),
          ),
        },
        hint: 'Ne te fie ni à la préposition ni au sens « où / quand » : regarde ce que le verbe réclame.',
        steps: [
          'Le complément d’objet est lié au sens du verbe ; le complément circonstanciel ajoute une information facultative.',
          lignes.map((l, i) => `Ligne ${i + 1} : ${l.raison}.`).join(' '),
          `Réponses : **${lignes.map((l) => l.fonction).join(' ; ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. La construction du verbe ─────────────────────────

const DEF_CONSTRUCTION =
  'Un verbe est transitif direct avec un COD, transitif indirect avec un COI, intransitif sans complément d’objet. Un verbe attributif relie le sujet à son attribut.';
const explique = (e: Emploi) =>
  e.complement
    ? `Avec « ${e.verbe} » et « ${e.complement} », ${EXPLICATION[e.construction]}.`
    : `« ${e.verbe} » : ${EXPLICATION[e.construction]} ; le reste de la phrase donne des circonstances.`;
const explications = (e: Emploi, choix: readonly Construction[]) =>
  choix
    .filter((x) => x !== e.construction)
    .map((label) => ({ label, why: `Non : on dit « ${label} » quand ${EXPLICATION[label]}. ${explique(e)}` }));

const construireChoix = (rng: Rng, e: Emploi, choix: readonly Construction[], intro: string): QuestionDraft => {
  const { answer, traps } = choice(rng, e.construction, explications(e, choix));
  return {
    prompt: `${intro} « ${e.phrase} », le verbe « ${e.verbe} » est…`,
    answer,
    traps,
    hint: 'Cherche ce qui suit le verbe : rien d’obligatoire, un complément sans ou avec préposition, ou une information sur le sujet ?',
    steps: [DEF_CONSTRUCTION, explique(e), `Il est **${e.construction}**.`],
  };
};

function constructionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const e = rng.pick(EMPLOIS.filter((x) => x.construction !== 'transitif indirect'));
      return construireChoix(rng, e, ['transitif direct', 'intransitif', 'attributif'], 'Dans');
    }
    case 2:
      return construireChoix(rng, rng.pick(EMPLOIS), CONSTRUCTIONS, 'Observe la phrase. Dans');
    case 3: {
      const x = rng.pick(REGIMES);
      return {
        prompt: `Écris la préposition qui construit le verbe « ${x.infinitif} » : « ${x.avant} … ${x.apres} »`,
        answer: { kind: 'text', accepted: [x.prep] },
        traps: textTraps(
          [x.prep],
          [
            [
              x.prep === 'à' ? 'de' : 'à',
              `Le verbe « ${x.infinitif} » ne se construit pas avec cette préposition ici.`,
            ],
            ['sur', `« ${x.infinitif} » ne se construit pas avec « sur » : dis la phrase à voix haute.`],
          ],
        ),
        hint: `Dis à voix haute l’infinitif suivi d’un complément : « ${x.infinitif} … quelqu’un ou quelque chose ».`,
        steps: [
          'Un verbe transitif indirect se construit avec une préposition, qui introduit le COI.',
          `On dit « ${x.infinitif} ${x.prep} ${x.apres.replace(/\.$/, '')} ».`,
          `La préposition est **${x.prep}**.`,
        ],
      };
    }
    case 4: {
      const [a, b] = pickN(rng, DOUBLES, 2);
      const attr = rng.pick(EMPLOIS.filter((e) => e.construction === 'attributif'));
      const indirect = rng.pick(EMPLOIS.filter((e) => e.construction === 'transitif indirect'));
      if (!a || !b) throw new Error('banque vide');
      const lignes = rng.shuffle<{ phrase: string; construction: Construction }>([
        { phrase: a.intransitif, construction: 'intransitif' },
        { phrase: a.direct, construction: 'transitif direct' },
        rng.int(0, 1) === 0
          ? { phrase: b.intransitif, construction: 'intransitif' }
          : { phrase: b.direct, construction: 'transitif direct' },
        rng.int(0, 1) === 0 ? attr : indirect,
      ]);
      const libelles = lignes.map((_, i) => `Ligne ${i + 1} : `);
      return {
        prompt: 'Lis le texte. Choisis la construction du verbe dans chaque ligne.',
        figure: document(
          'Un même verbe, plusieurs emplois',
          lignes.map((l) => l.phrase),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(libelles),
          blanks: listes(
            CONSTRUCTIONS,
            lignes.map((l) => l.construction),
          ),
        },
        hint: 'Un même verbe peut changer de construction d’une phrase à l’autre : regarde chaque phrase seule.',
        steps: [
          DEF_CONSTRUCTION,
          `« ${a.infinitif} » s’emploie sans complément (« ${a.intransitif} ») ou avec un COD, « ${a.cod} ».`,
          `Réponses : **${lignes.map((l) => l.construction).join(' ; ')}**.`,
        ],
      };
    }
    default: {
      const lignes = pickN(rng, CAS_PARTICULIERS, 3);
      const cible = rng.pick(lignes.filter((l) => l.complement));
      const rang = lignes.indexOf(cible) + 1;
      const libelles = [
        ...lignes.map((_, i) => `Ligne ${i + 1} : `),
        `Complément ou attribut du verbe, ligne ${rang} : `,
      ];
      return {
        prompt: `Lis le texte. Choisis la construction de chaque verbe. Écris ensuite le complément ou l’attribut de la ligne ${rang}.`,
        figure: document(
          'Phrases à analyser',
          lignes.map((l) => l.phrase),
        ),
        answer: {
          kind: 'cloze',
          parts: segments(libelles),
          blanks: [
            ...listes(
              CONSTRUCTIONS,
              lignes.map((l) => l.construction),
            ),
            ...saisies([cible.complement ?? '']),
          ],
        },
        hint: 'Remplace chaque pronom par un groupe nominal : faut-il alors une préposition ?',
        steps: [
          DEF_CONSTRUCTION,
          lignes.map((l) => explique(l)).join(' '),
          `Réponses : **${lignes.map((l) => l.construction).join(' ; ')}** ; **${cible.complement ?? ''}**.`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesPhraseSimple6e(n.factId, ...n.faits) },
  generate: n.generate,
});

export const F6_PHRASE_SIMPLE: readonly Skill[] = [
  skill({
    id: 'f6-constituants-phrase',
    title: 'Les constituants de la phrase simple',
    memo: [
      'La **phrase type** a deux **constituants** obligatoires : le **groupe sujet** et le **groupe verbal**.',
      'Le **groupe circonstanciel** est facultatif : tu peux le supprimer ou le déplacer.',
      'Exemple : Les élèves de sixième / préparent un exposé / depuis une semaine.',
    ],
    factId: 'constituants-programme',
    faits: ['phrase-type', 'deux-groupes', 'phrase-simple', 'gs-accord', 'gs-pronom'],
    generate: constituantsDraft,
  }),
  skill({
    id: 'f6-attribut-ou-cod',
    title: 'Attribut du sujet ou COD',
    memo: [
      'L’**attribut du sujet** suit un **verbe attributif** (être, devenir, rester, sembler) : « Il reste calme. »',
      'Le **COD** complète un autre verbe sans **préposition** : « Je vois le port. »',
      'Piège : dans « Il est parti », « est » est un auxiliaire, pas un verbe attributif.',
    ],
    factId: 'attribut-cod-programme',
    faits: [
      'accord-attribut-programme',
      'attribut',
      'attribut-nature',
      'attributifs-rester',
      'attributifs-sembler',
      'etre-auxiliaire',
      'cod',
      'pronom-objet',
    ],
    generate: attributDraft,
  }),
  skill({
    id: 'f6-coi',
    title: 'Le complément d’objet indirect',
    memo: [
      'Le **COI** complète le verbe avec une **préposition** : « Je parle à ma voisine. »',
      'Un pronom comme « lui » ou « leur » peut être COI sans préposition : « Je lui parle. »',
    ],
    factId: 'complements-programme',
    faits: ['coi', 'coi-pronom', 'pronom-objet', 'deux-complements', 'deux-coi'],
    generate: coiDraft,
  }),
  skill({
    id: 'f6-complements-circonstanciels',
    title: 'Les compléments circonstanciels',
    memo: [
      'Le **complément circonstanciel** est facultatif : il se supprime et, souvent, se déplace.',
      'Il dit par exemple le temps, le lieu ou la cause : « le matin », « ici », « à cause du vent ».',
      'Piège : « à la gare » est un **COI** dans « Je vais à la gare » : le verbe le réclame.',
    ],
    factId: 'circonstanciel-programme',
    faits: ['circ-sens', 'circ-deplacement', 'circ-nature', 'aller', 'coi', 'cod'],
    generate: circonstanciellesDraft,
  }),
  skill({
    id: 'f6-construction-verbe',
    title: 'La construction du verbe',
    memo: [
      'La **construction du verbe** aide à analyser la phrase : **transitif direct** avec un COD, **transitif indirect** avec un COI.',
      'Un verbe **intransitif** n’a pas de complément d’objet (« Le soleil brille. ») ; un **verbe attributif** relie le sujet à son attribut.',
      'Un même verbe peut changer : « Le pain cuit. » / « Je cuis le pain. »',
    ],
    factId: 'construction-programme',
    faits: [
      'transitif-direct',
      'transitif-indirect',
      'intransitif',
      'double-emploi',
      'attribut',
      'mesure',
      'aller',
      'coi-pronom',
    ],
    generate: constructionDraft,
  }),
];
