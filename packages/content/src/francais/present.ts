import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { at, document, pickN, textTraps } from './outils.ts';
import {
  EMPLOIS_ER,
  EMPLOIS_IR,
  EMPLOIS_IRREGULIERS,
  IRREGULIERS,
  IR_AUTRES,
  PERSONNES,
  PHRASES_ETRE_AVOIR,
  PIEGES_IRREGULIERS,
  SUJETS,
  SUJETS_GROUPES,
  VARIATIONS,
  avecSujet,
  faitPresent,
  forme,
  formes,
  sourcesPresent,
  type Emploi,
  type Famille,
  type Personne,
  type PhraseEtreAvoir,
  type Sujet,
  type Variation,
  type Verbe,
} from './present.donnees.ts';

/**
 * Chapitre « Conjuguer au présent » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Approfondir sa maîtrise de la conjugaison ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitPresent(id).citation} »`;

const PRONOMS: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il ou elle',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils ou elles',
};

/** Marques de personne au présent. */
const TERMINAISONS_ER: Record<Personne, string> = {
  je: 'e',
  tu: 'es',
  il: 'e',
  nous: 'ons',
  vous: 'ez',
  ils: 'ent',
};
const TERMINAISONS_IR: Record<Personne, string> = {
  je: 'is',
  tu: 'is',
  il: 'it',
  nous: 'issons',
  vous: 'issez',
  ils: 'issent',
};

const radical = (v: Verbe) => v.slice(0, -2);
const marqueEr = (p: Personne) => `Avec « ${PRONOMS[p]} », un verbe en -er prend **-${TERMINAISONS_ER[p]}**.`;
const marqueIr = (p: Personne) => `Avec « ${PRONOMS[p]} », un verbe comme finir prend **-${TERMINAISONS_IR[p]}**.`;

/** Début de phrase : « Je » devient « J’ » devant une voyelle. */
const debut = (s: Sujet, v: Verbe): string =>
  avecSujet(s.texte, forme(v, s.personne)).slice(0, -forme(v, s.personne).length);
const phraseDe = (s: Sujet, v: Verbe, fin: string) => `${debut(s, v)}${forme(v, s.personne)} ${fin}.`;
const aTrouer = (s: Sujet, v: Verbe, fin: string) => `${debut(s, v)}… ${fin}.`;

/** Sujet groupe nominal ou plusieurs noms : le pronom qui le remplace. */
const remplacer = (s: Sujet): readonly Rich[] => {
  const groupe = SUJETS_GROUPES.find((x) => x.texte === s.texte);
  return groupe ? [`« ${s.texte} », c’est comme « ${groupe.pronom} ».`] : [];
};

/** Formes du même verbe aux autres personnes : erreurs tentantes, chacune expliquée. */
const autresFormes = (v: Verbe, p: Personne): [string, string][] =>
  PERSONNES.filter((q) => q !== p).map((q) => {
    const f = forme(v, q);
    const avec = PERSONNES.filter((x) => forme(v, x) === f).map((x) => `« ${PRONOMS[x]} »`);
    return [f, `« ${f} » va avec ${avec.join(', ')}. Regarde bien le sujet.`];
  });

/** Propositions fausses distinctes (aucune écriture juste, aucun doublon). */
function fausses(v: Verbe, p: Personne, list: readonly (readonly [string, string])[]) {
  const vues = new Set(formes(v, p));
  return list.filter(([f]) => !vues.has(f) && vues.add(f)).map(([label, why]) => ({ label, why }));
}

interface Ligne {
  readonly sujet: Sujet;
  readonly verbe: Verbe;
  readonly fin: string;
}

/** QCM : la bonne forme parmi `n` propositions. */
function qcmForme(
  rng: Rng,
  { sujet: s, verbe: v, fin }: Ligne,
  n: 3 | 4,
  etapes: readonly Rich[],
  propres: readonly (readonly [string, string])[] = [],
): QuestionDraft {
  const bon = forme(v, s.personne);
  const choix = fausses(v, s.personne, [...propres, ...rng.shuffle(autresFormes(v, s.personne))]).slice(0, n - 1);
  const { answer, traps } = choice(rng, bon, choix);
  return {
    prompt: `Complète au présent avec le verbe « ${v} » : « ${aTrouer(s, v, fin)} »`,
    answer,
    traps,
    hint: 'Repère le sujet. Quelle forme va avec lui ?',
    steps: [...remplacer(s), ...etapes, `On écrit **${phraseDe(s, v, fin)}**`],
  };
}

/** Saisie : écrire la forme (le sujet suivi du verbe est accepté aussi). */
function saisieForme(
  { sujet: s, verbe: v, fin }: Ligne,
  etapes: readonly Rich[],
  pieges: readonly (readonly [string, string])[],
  consigne = `Écris au présent le verbe « ${v} » : « ${aTrouer(s, v, fin)} »`,
): QuestionDraft {
  const bonnes = formes(v, s.personne);
  const accepted = [...bonnes, ...bonnes.map((f) => `${debut(s, v)}${f}`)];
  return {
    prompt: consigne,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [
      ...pieges,
      [v, 'C’est l’infinitif, le nom du verbe. Il faut le conjuguer.'],
      ...autresFormes(v, s.personne),
    ]),
    hint: 'Repère le sujet, puis rappelle-toi la forme qui va avec lui.',
    steps: [...remplacer(s), ...etapes, `On écrit **${phraseDe(s, v, fin)}**`],
  };
}

/** Association : un même verbe, trois sujets, trois formes différentes. */
function associer(rng: Rng, v: Verbe, personnes: readonly Personne[], etapes: readonly Rich[]): QuestionDraft {
  const choisies: Personne[] = [];
  for (const p of rng.shuffle(personnes)) {
    if (choisies.length < 3 && !choisies.some((q) => forme(v, q) === forme(v, p))) choisies.push(p);
  }
  const choisis = choisies.map((p) => rng.pick(SUJETS.filter((s) => s.personne === p)));
  const bonnes = choisies.map((p) => forme(v, p));
  // Jamais présentées en face les unes des autres : décalage d'un ou deux rangs.
  const k = rng.int(1, 2);
  const droite = bonnes.map((_, i) => at(bonnes, (i + k) % 3));
  return {
    prompt: `Associe chaque sujet (${choisis.map((s) => s.texte).join(', ')}) à la bonne forme du verbe « ${v} » au présent.`,
    answer: {
      kind: 'match',
      left: choisis.map((s) => s.texte),
      right: droite,
      pairs: bonnes.map((f) => droite.indexOf(f)),
    },
    hint: 'Commence par le sujet que tu connais le mieux.',
    steps: [...etapes, `Réponses : **${choisis.map((s, i) => avecSujet(s.texte, at(bonnes, i))).join(', ')}**.`],
  };
}

/** Texte à compléter : un verbe à conjuguer par ligne. */
function texteATrous<L extends Ligne>(
  lignes: readonly L[],
  etapes: readonly Rich[],
  explication?: (l: L) => string,
): QuestionDraft {
  const bonnes = lignes.map((l) => formes(l.verbe, l.sujet.personne));
  return {
    prompt: 'Lis le texte. Écris au présent le verbe entre parenthèses, ligne par ligne.',
    figure: document(
      'Texte à compléter',
      lignes.map((l) => `${l.sujet.texte} … (${l.verbe}) ${l.fin}.`),
    ),
    answer: {
      kind: 'cloze',
      parts: [...bonnes.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
      blanks: bonnes.map((accepted) => ({ mode: 'text' as const, accepted })),
    },
    hint: 'Sur chaque ligne, cherche d’abord le sujet. Remplace-le par un pronom si besoin.',
    steps: [
      ...etapes,
      ...new Set(lignes.flatMap((l) => remplacer(l.sujet))),
      ...lignes.map((l, i) => {
        const regle = explication ? ` ${explication(l)}` : '';
        return `Ligne ${i + 1} : avec « ${PRONOMS[l.sujet.personne]} », « ${l.verbe} » s’écrit « ${forme(l.verbe, l.sujet.personne)} ».${regle}`;
      }),
      `Les verbes : **${bonnes.map((b) => at(b, 0)).join(', ')}**.`,
    ],
  };
}

const sujetDe = (rng: Rng, personnes: readonly Personne[]): Sujet =>
  rng.pick(SUJETS.filter((s) => personnes.includes(s.personne)));

/** Terminaisons qu'on n'entend pas au présent des verbes en -er. */
const MUETTES: readonly Personne[] = ['je', 'tu', 'il', 'ils'];

/** Sujets sans « je » (pas d'élision à écrire), avec ou sans groupes de noms. */
const SANS_JE = SUJETS.filter((s) => s.personne !== 'je');
const lignesDe = (rng: Rng, emplois: readonly Emploi[], n: number): Ligne[] => {
  const sujets = rng.shuffle([...pickN(rng, SUJETS_GROUPES, 2), ...pickN(rng, SANS_JE, n - 2)]);
  return pickN(rng, emplois, n).map(([verbe, fin], i) => ({ sujet: at(sujets, i), verbe, fin }));
};

// ───────────────────────── 1. Radical et terminaison ─────────────────────────

const DEF_RADICAL = 'Le radical porte le sens du verbe : c’est le début, comme « chant » dans chanter.';
const DEF_TERMINAISON = 'La terminaison est la fin du verbe : elle change avec le sujet et le temps.';
const VERBES_ER = EMPLOIS_ER.map(([v]) => v);

const ecrireMorceau = (t: string) => [t, `-${t}`];

function radicalDraft(rng: Rng, level: Level): QuestionDraft {
  const v = rng.pick(VERBES_ER);
  const r = radical(v);
  switch (level) {
    case 1: {
      const p = rng.pick(['tu', 'nous', 'vous', 'ils'] as const);
      const t = TERMINAISONS_ER[p];
      const dit = `${p} ${forme(v, p)}`;
      const cherche = rng.pick(['radical', 'terminaison'] as const);
      const bon = cherche === 'radical' ? `${r}-` : `-${t}`;
      const { answer, traps } = choice(rng, bon, [
        cherche === 'radical'
          ? { label: `-${t}`, why: 'Ça, c’est la terminaison : la fin qui change.' }
          : { label: `${r}-`, why: 'Ça, c’est le radical : le début qui porte le sens.' },
        { label: p, why: `« ${p} » est le sujet. Il ne fait pas partie du verbe.` },
      ]);
      return {
        prompt: `Dans « ${dit} », où est ${cherche === 'radical' ? 'le radical' : 'la terminaison'} du verbe ?`,
        answer,
        traps,
        hint: 'Compare avec l’infinitif. Quelle partie reste, quelle partie change ?',
        steps: [DEF_RADICAL, DEF_TERMINAISON, `Ici, c’est **${bon}**.`],
      };
    }
    case 2: {
      const p = rng.pick(['tu', 'nous', 'vous', 'ils'] as const);
      const f = forme(v, p);
      const coupe = (i: number) => `${f.slice(0, i)} + ${f.slice(i)}`;
      const bon = coupe(r.length);
      const { answer, traps } = choice(rng, bon, [
        {
          label: coupe(r.length + 1),
          why: `Le radical s’arrête plus tôt. Avec « ${PRONOMS[p]} », la terminaison entière est « -${TERMINAISONS_ER[p]} ».`,
        },
        { label: coupe(r.length - 1), why: `Il manque une lettre au radical : l’infinitif est « ${v} ».` },
        { label: `${f} + rien`, why: 'Un verbe conjugué a un radical et une terminaison.' },
      ]);
      return {
        prompt: `Quel découpage « radical + terminaison » est juste pour « ${p} ${f} » ?`,
        answer,
        traps,
        hint: 'Enlève -er à l’infinitif : tu vois le radical.',
        steps: [DEF_RADICAL, marqueEr(p), `On découpe : **${bon}**.`],
      };
    }
    case 3: {
      const p = rng.pick(['tu', 'il', 'nous', 'vous', 'ils'] as const);
      const t = TERMINAISONS_ER[p];
      const dit = `${p} ${forme(v, p)}`;
      const accepted = ecrireMorceau(t);
      return {
        prompt: `Écris la terminaison du verbe dans « ${dit} » (verbe « ${v} »).`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [r, 'Ça, c’est le radical. On cherche la fin qui change.'],
          [forme(v, p), 'C’est le verbe entier. Écris seulement la fin.'],
          [`${r.slice(-1)}${t}`, 'Tu as pris une lettre du radical en trop.'],
          // Terminaison d'une seule lettre : il n'y a rien à raccourcir.
          ...(t.length > 1 ? [[t.slice(1), 'Il manque une lettre à la terminaison.'] as const] : []),
        ]),
        hint: 'Retire le radical : ce qui reste est la terminaison.',
        steps: [DEF_TERMINAISON, `Le radical est « ${r} ».`, `La terminaison est **-${t}**.`],
      };
    }
    case 4: {
      const autres = pickN(rng, ['tu', 'il', 'vous', 'ils'] as const, 2);
      const dits = rng.shuffle(['nous' as const, ...autres]).map((p) => `« ${p} ${forme(v, p)} »`);
      const accepted = ecrireMorceau(r).concat(`${r}-`);
      return {
        prompt: `Écris le radical commun à ${dits.join(', ')}.`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [v, 'C’est l’infinitif. Le radical n’a pas la fin -er.'],
          [`${r}e`, `Le e n’est pas dans toutes les formes : regarde « nous ${forme(v, 'nous')} ».`],
          ['ons', 'C’est une terminaison : elle change d’une forme à l’autre.'],
          [r.slice(0, -1), 'Il manque une lettre : prends tout le début commun.'],
        ]),
        hint: 'Écris les formes l’une sous l’autre. Quel début est toujours le même ?',
        steps: [DEF_RADICAL, 'Ce début ne change pas dans les trois formes.', `Le radical est **${r}-**.`],
      };
    }
    default: {
      const sujets = pickN(rng, [...SUJETS_GROUPES, ...SANS_JE], 3);
      const lignes = pickN(rng, EMPLOIS_ER, 3).map(([verbe, fin], i) => ({ sujet: at(sujets, i), verbe, fin }));
      const morceaux = lignes.flatMap((l) => [radical(l.verbe), TERMINAISONS_ER[l.sujet.personne]]);
      return {
        prompt: 'Lis le texte. Pour le verbe de chaque ligne, écris le radical, puis la terminaison.',
        figure: document(
          'Verbes à découper',
          lignes.map((l) => phraseDe(l.sujet, l.verbe, l.fin)),
        ),
        answer: {
          kind: 'cloze',
          parts: [
            ...morceaux.map((_, i) =>
              i % 2 === 0 ? `${i === 0 ? '' : '. '}Ligne ${i / 2 + 1}, radical : ` : ', terminaison : ',
            ),
            '.',
          ],
          blanks: morceaux.map((m, i) => ({
            mode: 'text' as const,
            accepted: i % 2 === 0 ? [m, `${m}-`] : ecrireMorceau(m),
          })),
        },
        hint: 'Trouve d’abord le verbe, puis son infinitif.',
        steps: [
          DEF_RADICAL,
          DEF_TERMINAISON,
          `Réponses : **${lignes.map((l) => `${radical(l.verbe)} + ${TERMINAISONS_ER[l.sujet.personne]}`).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Présent du 1er groupe ─────────────────────────

const DEF_GROUPE_1 = 'Les verbes en -er (sauf aller) sont du premier groupe.';
const etapesEr = (s: Sujet, v: Verbe) => [DEF_GROUPE_1, `Le radical est « ${radical(v)} ».`, marqueEr(s.personne)];

const piegesEr = (v: Verbe, p: Personne): [string, string][] => {
  const r = radical(v);
  const why = marqueEr(p);
  return [r, `${r}s`, `${r}ent`].map((f) => [f, why]);
};

function presentErDraft(rng: Rng, level: Level): QuestionDraft {
  const [v, fin] = rng.pick(EMPLOIS_ER);
  switch (level) {
    case 1: {
      const s = rng.pick(SUJETS);
      return qcmForme(rng, { sujet: s, verbe: v, fin }, 3, etapesEr(s, v));
    }
    case 2:
      return associer(
        rng,
        v,
        ['tu', 'il', 'nous', 'vous', 'ils'],
        [DEF_GROUPE_1, 'Les terminaisons : -e, -es, -e, -ons, -ez, -ent.'],
      );
    case 3: {
      const s = rng.pick(SUJETS.filter((x) => x.personne !== 'je'));
      return saisieForme({ sujet: s, verbe: v, fin }, etapesEr(s, v), piegesEr(v, s.personne));
    }
    case 4: {
      // Pièges : sujet à remplacer, ou terminaison qu'on n'entend pas.
      const s = rng.int(0, 1) === 0 ? rng.pick(SUJETS_GROUPES) : sujetDe(rng, MUETTES);
      return saisieForme({ sujet: s, verbe: v, fin }, etapesEr(s, v), piegesEr(v, s.personne));
    }
    default:
      return texteATrous(lignesDe(rng, EMPLOIS_ER, 4), [
        DEF_GROUPE_1,
        'Les terminaisons : -e, -es, -e, -ons, -ez, -ent.',
      ]);
  }
}

// ───────────────────────── 3. Présent du 2e groupe ─────────────────────────

const DEF_GROUPE_2 = 'Au 2e groupe, l’infinitif finit par -ir et on entend « -iss- » : nous finissons.';
const etapesIr = (s: Sujet) => [DEF_GROUPE_2, marqueIr(s.personne)];

const piegesIr = (v: Verbe, p: Personne): [string, string][] => {
  const r = radical(v);
  const why = marqueIr(p);
  return [`${r}${TERMINAISONS_ER[p]}`, `${r}i${TERMINAISONS_ER[p]}`, `${r}ie`, `${r}is`, `${r}it`].map((f) => [f, why]);
};

const optionsDe = (a: QuestionDraft['answer']): readonly Rich[] => (a.kind === 'choice' ? a.options : []);

function presentIrDraft(rng: Rng, level: Level): QuestionDraft {
  const [v, fin] = rng.pick(EMPLOIS_IR);
  switch (level) {
    case 1: {
      const s = rng.pick(SUJETS);
      return qcmForme(rng, { sujet: s, verbe: v, fin }, 3, etapesIr(s));
    }
    case 2: {
      const pasDeuxieme = pickN(rng, IR_AUTRES, 2);
      const er = rng.pick(VERBES_ER);
      const { answer, traps } = choice(rng, v, [
        ...pasDeuxieme.map((x) => ({
          label: x,
          why: `On dit « nous ${forme(x, 'nous')} » : pas de « -iss- ». C’est un verbe du 3e groupe.`,
        })),
        { label: er, why: `« ${er} » finit par -er : c’est le 1er groupe.` },
      ]);
      return {
        prompt: `Parmi ${optionsDe(answer)
          .map((x) => `« ${x} »`)
          .join(', ')}, quel verbe est du 2e groupe ?`,
        answer,
        traps,
        hint: 'Essaie chaque verbe avec « nous ». Entends-tu « -issons » ?',
        steps: [DEF_GROUPE_2, `On dit « nous ${forme(v, 'nous')} ».`, `C’est **${v}**.`],
      };
    }
    case 3: {
      const s = rng.pick(SUJETS.filter((x) => 'tu il nous vous'.split(' ').includes(x.personne)));
      return saisieForme({ sujet: s, verbe: v, fin }, etapesIr(s), piegesIr(v, s.personne));
    }
    case 4: {
      const s = rng.pick([...SUJETS_GROUPES, ...SUJETS.filter((x) => x.personne === 'ils' || x.personne === 'je')]);
      return saisieForme({ sujet: s, verbe: v, fin }, etapesIr(s), piegesIr(v, s.personne));
    }
    default:
      return texteATrous(lignesDe(rng, EMPLOIS_IR, 4), [
        DEF_GROUPE_2,
        'Les terminaisons : -is, -is, -it, -issons, -issez, -issent.',
      ]);
  }
}

// ───────────────────────── 4. Être et avoir ─────────────────────────

const TABLE = (v: Verbe) => `« ${v} » : ${PERSONNES.map((p) => avecSujet(p, forme(v, p))).join(', ')}.`;
const AUTRE = { être: 'avoir', avoir: 'être' } as const;
const DEF_PAR_COEUR = 'Être et avoir changent beaucoup : on les apprend par cœur.';
const enLigne = (x: PhraseEtreAvoir): Ligne => ({ sujet: x.sujet, verbe: x.verbe, fin: x.fin });

function etreAvoirDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const x = rng.pick(PHRASES_ETRE_AVOIR);
      return qcmForme(rng, enLigne(x), 3, [DEF_PAR_COEUR, TABLE(x.verbe)]);
    }
    case 2: {
      const v = rng.pick(['être', 'avoir'] as const);
      return associer(rng, v, ['tu', 'il', 'nous', 'vous', 'ils'], [DEF_PAR_COEUR, TABLE(v)]);
    }
    case 3: {
      const x = rng.pick(PHRASES_ETRE_AVOIR.filter((y) => y.sujet.personne !== 'je'));
      return saisieForme(enLigne(x), [DEF_PAR_COEUR, TABLE(x.verbe)], []);
    }
    case 4: {
      const x = rng.pick(PHRASES_ETRE_AVOIR);
      const autre = AUTRE[x.verbe];
      return saisieForme(
        enLigne(x),
        [`Ici, il faut le verbe « ${x.verbe} ».`, TABLE(x.verbe)],
        [[forme(autre, x.sujet.personne), `C’est le verbe « ${autre} ». La phrase demande « ${x.verbe} ».`]],
        `Être ou avoir ? Écris le bon verbe au présent : « ${x.sujet.texte} … ${x.fin}. »`,
      );
    }
    default: {
      const de = (v: Verbe) =>
        pickN(
          rng,
          PHRASES_ETRE_AVOIR.filter((x) => x.verbe === v && x.sujet.personne !== 'je'),
          2,
        );
      const lignes = rng.shuffle([...de('être'), ...de('avoir')]).map(enLigne);
      const q = texteATrous(lignes, [DEF_PAR_COEUR, TABLE('être'), TABLE('avoir')]);
      return { ...q, prompt: 'Lis le texte. Écris au présent « être » ou « avoir » comme indiqué à chaque ligne.' };
    }
  }
}

// ───────────────────────── 5. Verbes irréguliers fréquents ─────────────────────────

const DEF_IRREGULIER = 'Ces verbes sont irréguliers : leur radical change souvent. On les apprend par cœur.';

function irreguliersDraft(rng: Rng, level: Level): QuestionDraft {
  const [v, fin] = rng.pick(EMPLOIS_IRREGULIERS);
  switch (level) {
    case 1: {
      const s = rng.pick(SUJETS);
      return qcmForme(rng, { sujet: s, verbe: v, fin }, 3, [DEF_IRREGULIER, TABLE(v)]);
    }
    case 2: {
      const choisi = rng.pick(IRREGULIERS);
      return associer(rng, choisi, PERSONNES, [DEF_IRREGULIER, TABLE(choisi)]);
    }
    case 3: {
      const s = rng.pick(SUJETS.filter((x) => 'tu il nous'.split(' ').includes(x.personne)));
      return saisieForme({ sujet: s, verbe: v, fin }, [DEF_IRREGULIER, TABLE(v)], []);
    }
    case 4: {
      const [piege, p, faux] = rng.pick(PIEGES_IRREGULIERS);
      const suite = at(
        EMPLOIS_IRREGULIERS.filter(([x]) => x === piege),
        0,
      )[1];
      const s = rng.pick(SUJETS.filter((x) => x.personne === p));
      return saisieForme(
        { sujet: s, verbe: piege, fin: suite },
        [DEF_IRREGULIER, TABLE(piege)],
        [[faux, `« ${faux} » n’existe pas : « ${piege} » est irrégulier.`]],
        `Attention, piège ! Écris « ${piege} » au présent : « ${aTrouer(s, piege, suite)} »`,
      );
    }
    default:
      return texteATrous(lignesDe(rng, EMPLOIS_IRREGULIERS, 4), [DEF_IRREGULIER]);
  }
}

// ───────────────────────── 6. Verbes en -cer, -ger, -yer, -eler, -eter ─────────────────────────

const REGLES_FAMILLES: Record<Famille, string> = {
  cer: 'Devant le o de « -ons », le c prend une cédille (ç) : il garde le son « s ».',
  ger: 'Devant le o de « -ons », on garde un e après le g : il garde le son « j ».',
  yer: 'Devant une terminaison muette (e, es, ent), le y devient i. Avec nous et vous, le y reste.',
  double: 'Devant une terminaison muette (e, es, ent), la consonne l ou t double.',
  accent: 'Devant une terminaison muette (e, es, ent), le radical prend un è (accent grave).',
};

/** Personnes où la variation se voit. */
const personnesQuiChangent = (f: Famille): readonly Personne[] => (f === 'cer' || f === 'ger' ? ['nous'] : MUETTES);
const change = (x: Variation, p: Personne) => personnesQuiChangent(x.famille).includes(p);
const inchange = (p: Personne) => `Avec « ${PRONOMS[p]} », le radical ne change pas : c’est celui de l’infinitif.`;

const doubleEcriture = (x: Variation, p: Personne): string[] =>
  x.verbe === 'payer' && change(x, p) ? ['Avec « payer », on peut aussi garder le y : il paie ou il paye.'] : [];

const etapesVariation = (x: Variation, p: Personne): Rich[] => [
  REGLES_FAMILLES[x.famille],
  ...(change(x, p) ? [] : [inchange(p)]),
  ...doubleEcriture(x, p),
];

/** Ce qui arrive au radical sur une ligne de texte : la règle si elle s'applique, sinon rien ne change. */
const explicationVariation = (x: Variation, p: Personne): string =>
  [change(x, p) ? REGLES_FAMILLES[x.famille] : inchange(p), ...doubleEcriture(x, p)].join(' ');

/** Erreurs typiques : le radical de l'infinitif gardé à tort, ou la variation mise là où elle n'a rien à faire. */
function piegesVariation(x: Variation, p: Personne): [string, string][] {
  const t = TERMINAISONS_ER[p];
  const why = change(x, p) ? REGLES_FAMILLES[x.famille] : inchange(p);
  const garde = `${radical(x.verbe)}${t}`;
  const deplace =
    x.famille === 'cer'
      ? `${radical(x.verbe).slice(0, -1)}ç${t}`
      : x.famille === 'ger'
        ? `${radical(x.verbe)}e${t}`
        : `${forme(x.verbe, 'ils').slice(0, -3)}${t}`;
  return [
    [garde, why],
    [deplace, why],
  ];
}

const INDICE_VARIATION = 'Regarde la terminaison : commence-t-elle par un o ? Est-elle muette ?';

function variationsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
    case 2: {
      const x = rng.pick(VARIATIONS);
      const s = sujetDe(rng, level === 1 ? personnesQuiChangent(x.famille) : PERSONNES);
      const q = qcmForme(
        rng,
        { sujet: s, verbe: x.verbe, fin: x.fin },
        level === 1 ? 3 : 4,
        etapesVariation(x, s.personne),
        piegesVariation(x, s.personne),
      );
      const prompt =
        level === 1 ? `Quelle écriture est juste ? Verbe « ${x.verbe} » : « ${aTrouer(s, x.verbe, x.fin)} »` : q.prompt;
      return { ...q, prompt, hint: INDICE_VARIATION };
    }
    case 3:
    case 4: {
      const familles: readonly Famille[] = level === 3 ? ['cer', 'ger', 'yer'] : ['double', 'accent'];
      const x = rng.pick(VARIATIONS.filter((y) => familles.includes(y.famille)));
      const s = sujetDe(rng, level === 3 ? personnesQuiChangent(x.famille) : PERSONNES);
      const q = saisieForme(
        { sujet: s, verbe: x.verbe, fin: x.fin },
        etapesVariation(x, s.personne),
        piegesVariation(x, s.personne),
        level === 4
          ? `Attention au radical ! Écris « ${x.verbe} » au présent : « ${aTrouer(s, x.verbe, x.fin)} »`
          : undefined,
      );
      return { ...q, hint: INDICE_VARIATION };
    }
    default: {
      const familles = pickN(rng, ['cer', 'ger', 'yer', 'double', 'accent'] as const, 4);
      const sujets = [...SUJETS_GROUPES, ...SANS_JE];
      // Trois lignes où la variation se voit ; la quatrième, au sujet libre, peut être un piège sans variation.
      const tirees = familles.map((f, i) => {
        const x = rng.pick(VARIATIONS.filter((y) => y.famille === f));
        const sujet = rng.pick(i < 3 ? sujets.filter((s) => personnesQuiChangent(f).includes(s.personne)) : sujets);
        return { sujet, verbe: x.verbe, fin: x.fin, variation: x };
      });
      const lignes = rng.shuffle(tirees);
      return texteATrous(lignes, [], (l) => explicationVariation(l.variation, l.sujet.personne));
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
    sources: sourcesPresent([n.factId, ...n.faits], n.verbes),
  },
  generate: n.generate,
});

const verbesDe = (emplois: readonly Emploi[]) => emplois.map(([v]) => v);

export const FCM1_PRESENT: readonly Skill[] = [
  skill({
    id: 'fcm1-radical-terminaison',
    title: 'Le radical et la terminaison',
    memo: [
      'Un verbe conjugué a deux morceaux : le **radical** et la **terminaison**.',
      'Dans « nous chantons », « chant » garde le sens. « ons » change avec le sujet : tu chantes, vous chantez.',
    ],
    factId: 'radicaux-terminaisons',
    faits: ['radical', 'terminaison', 'marques-personne', 'groupe-1'],
    verbes: VERBES_ER,
    generate: radicalDraft,
  }),
  skill({
    id: 'fcm1-present-er',
    title: 'Le présent du 1er groupe',
    memo: [
      'Un verbe en -er (sauf aller) est du **premier groupe**.',
      'Au **présent** : je chante, tu chantes, il chante, nous chantons, vous chantez, ils chantent.',
    ],
    factId: 'marques-personne',
    faits: ['groupe-1', 'aller', 'a-memoriser'],
    verbes: VERBES_ER,
    generate: presentErDraft,
  }),
  skill({
    id: 'fcm1-present-ir',
    title: 'Le présent du 2e groupe',
    memo: [
      'Finir est du **deuxième groupe** : on dit « nous finissons ». Partir, non : « nous partons ».',
      'Au **présent** : je finis, tu finis, il finit, nous finissons, vous finissez, ils finissent.',
    ],
    factId: 'a-memoriser',
    faits: ['groupe-2', 'partir', 'marques-personne'],
    verbes: [...verbesDe(EMPLOIS_IR), ...IR_AUTRES, ...VERBES_ER],
    generate: presentIrDraft,
  }),
  skill({
    id: 'fcm1-etre-avoir',
    title: 'Être et avoir au présent',
    memo: [
      'Être : je suis, tu es, il est, nous sommes, vous êtes, ils sont.',
      'Avoir : j’ai, tu as, il a, nous avons, vous avez, ils ont. À apprendre par cœur au **présent** !',
    ],
    factId: 'a-memoriser',
    faits: ['etre-avoir', 'plusieurs-radicaux', 'header-etre', 'header-avoir'],
    verbes: ['être', 'avoir'],
    generate: etreAvoirDraft,
  }),
  skill({
    id: 'fcm1-present-irreguliers',
    title: 'Faire, aller, dire, venir, pouvoir, voir, vouloir, prendre',
    memo: [
      'Ces verbes très utiles sont **irréguliers** : je vais, nous allons ; je peux, nous pouvons.',
      'Pièges à retenir : vous faites, vous dites, ils font, ils vont, ils prennent.',
    ],
    factId: 'a-memoriser',
    faits: ['aller', 'plusieurs-radicaux', 'header-faire', 'header-aller'],
    verbes: IRREGULIERS,
    generate: irreguliersDraft,
  }),
  skill({
    id: 'fcm1-present-variations',
    title: 'Les verbes en -cer, -ger, -yer, -eler, -eter',
    memo: [
      'Nous avançons (avec une **cédille**), nous mangeons (avec un e) : le son ne change pas.',
      'Devant une **terminaison muette** : j’essuie, j’appelle, je jette, j’achète, je lève, je répète.',
    ],
    factId: 'variations-radical',
    faits: ['cedille', 'g-doux', ...new Set(VARIATIONS.map((x) => x.fait))],
    verbes: VARIATIONS.map((x) => x.verbe),
    generate: variationsDraft,
  }),
];
