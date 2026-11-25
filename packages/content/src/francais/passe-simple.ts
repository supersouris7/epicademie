import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { appariement, at, document, lowerFirst, pickN, textTraps } from './outils.ts';
import { PERSONNES, SUJETS, SUJETS_GROUPES, avecSujet, type Personne, type Sujet } from './present.donnees.ts';
import { conjugue, type VerbeTemps } from './temps.donnees.ts';
import {
  DEBUTS_RECIT,
  ER_CER,
  ER_GER,
  ER_REGULIERS,
  ER_VARIANTES,
  ETRE_AVOIR,
  FINS_PS,
  HUIT_IRREGULIERS,
  IR_DEUXIEME,
  VERBES_IMPARFAIT,
  VOYELLE_FAUTIVE,
  faitPasseSimple,
  imparfait,
  passeSimple,
  present,
  sourcesPasseSimple,
  type VerbePs,
} from './passe-simple.donnees.ts';

/**
 * Chapitre « Le passé simple » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025),
 * cours moyen deuxième année : « Approfondir sa maîtrise de la conjugaison ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitPasseSimple(id).citation} »`;

const PRONOMS: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il ou elle',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils ou elles',
};

// ───────────────────────── Modèles de terminaisons ─────────────────────────

/** Les quatre modèles de terminaisons du passé simple rencontrés dans le chapitre. */
export type Modele = 'a' | 'i' | 'u' | 'in';

export const FINALES: Record<Modele, Record<Personne, string>> = {
  a: { je: 'ai', tu: 'as', il: 'a', nous: 'âmes', vous: 'âtes', ils: 'èrent' },
  i: { je: 'is', tu: 'is', il: 'it', nous: 'îmes', vous: 'îtes', ils: 'irent' },
  u: { je: 'us', tu: 'us', il: 'ut', nous: 'ûmes', vous: 'ûtes', ils: 'urent' },
  in: { je: 'ins', tu: 'ins', il: 'int', nous: 'înmes', vous: 'întes', ils: 'inrent' },
};

export const modele = (v: VerbePs): Modele => {
  if (v === 'aller' || v.endsWith('er')) return 'a';
  if (v === 'venir') return 'in';
  if (['être', 'avoir', 'pouvoir', 'vouloir'].includes(v)) return 'u';
  return 'i';
};

const NOM_MODELE: Record<Modele, string> = {
  a: 'en -a (comme chanter)',
  i: 'en -i (comme finir)',
  u: 'en -u (comme il fut)',
  in: 'en -in (comme il vint)',
};

const regle = (v: VerbePs, p: Personne): string =>
  `Avec « ${PRONOMS[p]} », le passé simple du verbe « ${v} » finit par -${FINALES[modele(v)][p]}.`;

/** Sujet groupe nominal : le pronom qui le remplace. */
const remplacer = (s: Sujet): readonly Rich[] => {
  const groupe = SUJETS_GROUPES.find((x) => x.texte === s.texte);
  return groupe ? [`« ${s.texte} », c’est comme « ${groupe.pronom} ».`] : [];
};

const voyelle = /^[aàâeéèêiîoôuûh]/;
/** « Je … » devant une forme qui commence par une voyelle s'écrirait « J’ » : on évite le trou ambigu. */
const sansElision = (v: VerbePs) => (s: Sujet) => s.personne !== 'je' || !voyelle.test(passeSimple(v, 'je'));

const phrase = (s: Sujet, v: VerbePs, verbe: string) => `${avecSujet(s.texte, verbe)} ${FINS_PS[v]}.`;

// ───────────────────────── Erreurs typiques ─────────────────────────

type Piege = readonly [string, string];

const SANS_ACCENT: Record<string, string> = { â: 'a', î: 'i', û: 'u' };

/**
 * Erreurs typiques d'une forme du passé simple : d'abord les plus tentantes (orthographe du radical, accent,
 * -iss-, mauvaise voyelle), puis les autres (présent, imparfait, infinitif, autre personne).
 */
function pieges(v: VerbePs, p: Personne): { forts: Piege[]; autres: Piege[] } {
  const bon = passeSimple(v, p);
  const forts: Piege[] = [];
  const autres: Piege[] = [];
  if (ER_GER.includes(v))
    forts.push(
      p === 'ils'
        ? [bon.replace('gè', 'geè'), 'Devant è, le g se prononce déjà « j » : pas de e.']
        : [bon.replace(/ge([aâ])/, 'g$1'), 'Devant a, garde un e après le g : le son reste « j ».'],
    );
  if (ER_CER.includes(v))
    forts.push(
      p === 'ils'
        ? [bon.replace('cè', 'çè'), 'Devant è, pas de cédille : le c se prononce déjà « s ».']
        : [bon.replace(/ç([aâ])/, 'c$1'), 'Devant a, le c prend une cédille : le son reste « s ».'],
    );
  if (p === 'nous' || p === 'vous')
    forts.push([
      bon.replace(/[âîû]/, (c) => SANS_ACCENT[c] ?? c),
      `Avec « ${p} », le passé simple prend un accent circonflexe : ${bon}.`,
    ]);
  if (IR_DEUXIEME.includes(v) && (p === 'nous' || p === 'vous' || p === 'ils'))
    forts.push([bon.replace(/(îmes|îtes|irent)$/, 'iss$1'), 'Au passé simple, pas de -iss- : le radical reste court.']);
  if (p === 'il' || p === 'ils') {
    const faux = VOYELLE_FAUTIVE[v][p === 'il' ? 0 : 1];
    forts.push([faux, `« ${v} » fait son passé simple ${NOM_MODELE[modele(v)]}. ${regle(v, p)}`]);
  }
  const pr = present(v, p);
  if (pr !== bon) autres.push([pr, `« ${pr} » est au présent : ça se passe maintenant. On demande le passé simple.`]);
  const imp = VERBES_IMPARFAIT.find((x) => x === v);
  if (imp) {
    const f = imparfait(imp, p);
    autres.push([f, `« ${f} » est à l’imparfait : sa marque de temps est -ai- ou -i-. On demande le passé simple.`]);
  } else if (p === 'je' && modele(v) === 'a') {
    autres.push([`${bon}s`, 'Avec « je », le passé simple finit par -ai, sans s. « -ais », c’est l’imparfait.']);
  }
  autres.push([v, 'C’est l’infinitif, le nom du verbe : il faut le conjuguer.']);
  for (const q of PERSONNES) {
    const f = passeSimple(v, q);
    if (f !== bon) autres.push([f, `« ${f} » ne va pas avec ce sujet. ${regle(v, p)}`]);
  }
  return { forts, autres };
}

/** Propositions fausses distinctes (aucune écriture juste, aucun doublon). */
function fausses(bon: string, list: readonly Piege[]) {
  const vues = new Set([bon]);
  return list.filter(([f]) => !vues.has(f) && vues.add(f)).map(([label, why]) => ({ label, why }));
}

const etapesForme = (v: VerbePs, s: Sujet, bon: string, debut: readonly Rich[] = []): Rich[] => [
  ...debut,
  ...remplacer(s),
  regle(v, s.personne),
  `On écrit **${phrase(s, v, bon)}**`,
];

/** QCM : compléter une phrase au passé simple (trois propositions fausses). */
function completer(rng: Rng, v: VerbePs, s: Sujet, hint: string, debut: readonly Rich[] = []) {
  const bon = passeSimple(v, s.personne);
  const { forts, autres } = pieges(v, s.personne);
  const { answer, traps } = choice(rng, bon, fausses(bon, [...forts, ...rng.shuffle(autres)]).slice(0, 3));
  return {
    prompt: `Complète au passé simple : « ${s.texte} … ${FINS_PS[v]}. » (${v})`,
    answer,
    traps,
    hint,
    steps: etapesForme(v, s, bon, debut),
  } satisfies QuestionDraft;
}

/** Saisie : écrire le verbe au passé simple (seul ou avec son sujet). */
function ecrire(v: VerbePs, s: Sujet, hint: string, debut: readonly Rich[] = []): QuestionDraft {
  const bon = passeSimple(v, s.personne);
  const accepted = [bon, avecSujet(s.texte, bon)];
  const { forts, autres } = pieges(v, s.personne);
  return {
    prompt: `Écris le verbe « ${v} » au passé simple : « ${s.texte} … ${FINS_PS[v]}. »`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [...forts, ...autres]),
    hint,
    steps: etapesForme(v, s, bon, debut),
  };
}

/** QCM à trois phrases très différentes : passé simple, présent ou futur. */
function quellePhrase(rng: Rng, v: VerbePs & VerbeTemps, s: Sujet, hint: string, debut: Rich): QuestionDraft {
  const p = s.personne;
  const bon = phrase(s, v, passeSimple(v, p));
  const { answer, traps } = choice(rng, bon, [
    { label: phrase(s, v, present(v, p)), why: 'Cette phrase est au présent : ça se passe maintenant.' },
    { label: phrase(s, v, conjugue('futur', v, p)), why: 'Cette phrase est au futur : ça arrivera plus tard.' },
  ]);
  return {
    prompt: `Quelle phrase est au passé simple ? (verbe « ${v} »)`,
    answer,
    traps,
    hint,
    steps: [debut, regle(v, p), `La phrase au passé simple : **${bon}**`],
  };
}

/** QCM à trois formes : passé simple, imparfait ou futur du même verbe. */
function quelleForme(rng: Rng, v: VerbePs & VerbeTemps, s: Sujet, hint: string, debut: Rich): QuestionDraft {
  const p = s.personne;
  const bon = passeSimple(v, p);
  const imp = imparfait(v, p);
  const fut = conjugue('futur', v, p);
  const { answer, traps } = choice(rng, bon, [
    { label: imp, why: `« ${imp} » est à l’imparfait : il finit comme « je chantais », « il chantait ».` },
    { label: fut, why: `« ${fut} » est au futur : ça arrivera plus tard.` },
  ]);
  return {
    prompt: `Quelle forme de « ${v} » est au passé simple ? « ${s.texte} … ${FINS_PS[v]}. »`,
    answer,
    traps,
    hint,
    steps: etapesForme(v, s, bon, [debut]),
  };
}

/** Texte à trous : un verbe à l'infinitif entre parenthèses par ligne. */
function recit(
  rng: Rng,
  titre: string,
  lignes: readonly { readonly s: Sujet; readonly v: VerbePs }[],
  hint: string,
  debut: Rich,
): QuestionDraft {
  const debuts = pickN(rng, DEBUTS_RECIT, lignes.length);
  const bonnes = lignes.map(({ s, v }) => passeSimple(v, s.personne));
  return {
    prompt: 'Lis le récit. Écris au passé simple le verbe entre parenthèses, ligne par ligne.',
    figure: document(
      titre,
      lignes.map(({ s, v }, i) => `${at(debuts, i)} ${lowerFirst(s.texte)} (${v}) ${FINS_PS[v]}.`),
    ),
    answer: {
      kind: 'cloze',
      parts: [...lignes.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
      blanks: bonnes.map((b) => ({ mode: 'text' as const, accepted: [b] })),
    },
    hint,
    steps: [
      debut,
      ...lignes.map(({ s, v }, i) => `Ligne ${i + 1} : ${[...remplacer(s), regle(v, s.personne)].join(' ')}`),
      `Réponses : **${bonnes.join(', ')}**.`,
    ],
  };
}

/** Sujets du récit : jamais « je » (pas d'élision à deviner), deux groupes nominaux au moins. */
const SANS_JE: readonly Sujet[] = SUJETS.filter((s) => s.personne !== 'je');
const sujetsRecit = (rng: Rng, n: number): Sujet[] =>
  rng.shuffle([...pickN(rng, SUJETS_GROUPES, 2), ...pickN(rng, SANS_JE, n - 2)]);

const imparfaitOk = (v: VerbePs): v is VerbePs & VerbeTemps => VERBES_IMPARFAIT.some((x) => x === v);
const pluriel = (s: Sujet) => s.personne === 'nous' || s.personne === 'vous' || s.personne === 'ils';

// ───────────────────────── 1. Premier groupe ─────────────────────────

const DEF_1 = 'Au passé simple, les verbes en -er finissent par -ai, -as, -a, -âmes, -âtes, -èrent.';
const INDICE_1 = 'Repère le sujet. Quelle fin du modèle « je chantai » va avec lui ?';

function premierGroupeDraft(rng: Rng, level: Level): QuestionDraft {
  const regulier = () => rng.pick(ER_REGULIERS);
  switch (level) {
    case 1: {
      const v = rng.pick(ER_REGULIERS.filter(imparfaitOk));
      return quellePhrase(rng, v, rng.pick(SUJETS), 'Le passé simple raconte au passé, en un seul mot.', DEF_1);
    }
    case 2: {
      const v = regulier();
      return completer(rng, v, rng.pick(SUJETS.filter(sansElision(v))), INDICE_1, [DEF_1]);
    }
    case 3: {
      const v = regulier();
      return ecrire(v, rng.pick(SUJETS.filter(sansElision(v))), INDICE_1, [DEF_1]);
    }
    case 4: {
      const v = rng.pick(ER_VARIANTES);
      const s = rng.pick([...SUJETS_GROUPES, ...SUJETS.filter(sansElision(v))]);
      const son = ER_GER.includes(v)
        ? 'Devant a ou â, on garde un e après le g ; devant è, non.'
        : 'Devant a ou â, le c prend une cédille ; devant è, non.';
      return ecrire(v, s, 'Dis le verbe à voix haute : le son du g ou du c doit rester le même.', [DEF_1, son]);
    }
    default: {
      const verbes = rng.shuffle([...pickN(rng, ER_REGULIERS, 2), ...pickN(rng, ER_VARIANTES, 2)]);
      const sujets = sujetsRecit(rng, 4);
      return recit(
        rng,
        'Journal de la colonie',
        verbes.map((v, i) => ({ v, s: at(sujets, i) })),
        'Sur chaque ligne, trouve le sujet, puis la bonne fin. Attention au g et au c !',
        `${DEF_1} Devant a ou â, garde le son : un e après le g, une cédille sous le c. Devant è, non.`,
      );
    }
  }
}

// ───────────────────────── 2. Deuxième groupe ─────────────────────────

const DEF_2 = 'Au passé simple, les verbes en -ir du 2e groupe finissent par -is, -is, -it, -îmes, -îtes, -irent.';
const INDICE_2 = 'Pense à « ils finirent » : pas de -iss- au passé simple.';

function deuxiemeGroupeDraft(rng: Rng, level: Level): QuestionDraft {
  const plurielsPronoms = SUJETS.filter(pluriel);
  switch (level) {
    case 1: {
      const v = rng.pick(IR_DEUXIEME.filter(imparfaitOk));
      return quellePhrase(
        rng,
        v,
        rng.pick(plurielsPronoms),
        'Écarte la forme avec -iss- (présent) et celle qui parle de plus tard (futur).',
        DEF_2,
      );
    }
    case 2: {
      const v = rng.pick(IR_DEUXIEME);
      return completer(rng, v, rng.pick(plurielsPronoms.filter(sansElision(v))), INDICE_2, [DEF_2]);
    }
    case 3: {
      const v = rng.pick(IR_DEUXIEME);
      return ecrire(v, rng.pick(SUJETS.filter(sansElision(v))), INDICE_2, [DEF_2]);
    }
    case 4: {
      const v = rng.pick(IR_DEUXIEME);
      return ecrire(
        v,
        rng.pick(SUJETS_GROUPES),
        'Remplace le sujet par un pronom. Avec nous et vous, pense à l’accent !',
        [DEF_2, 'Avec nous et vous, un accent circonflexe sur le i.'],
      );
    }
    default: {
      const verbes = rng.shuffle([...pickN(rng, IR_DEUXIEME, 2), ...pickN(rng, ER_REGULIERS, 2)]);
      const sujets = sujetsRecit(rng, 4);
      return recit(
        rng,
        'La grande course',
        verbes.map((v, i) => ({ v, s: at(sujets, i) })),
        'Regarde d’abord l’infinitif : -er ou -ir ? Les fins ne sont pas les mêmes.',
        `${DEF_1} ${DEF_2}`,
      );
    }
  }
}

// ───────────────────────── 3. Être et avoir ─────────────────────────

const DEF_3 = 'Être : je fus, il fut, ils furent. Avoir : j’eus, il eut, ils eurent.';
const INDICE_3 = 'Être fait « fu- », avoir fait « eu- ». Ajoute la fin qui va avec le sujet.';

function etreAvoirDraft(rng: Rng, level: Level): QuestionDraft {
  const v = rng.pick(ETRE_AVOIR) as VerbePs & VerbeTemps;
  switch (level) {
    case 1:
      return quelleForme(
        rng,
        v,
        rng.pick(SANS_JE),
        'Écarte la forme en -ais, -ait, -ions (imparfait) et celle qui parle de plus tard (futur).',
        DEF_3,
      );
    case 2:
      return completer(rng, v, rng.pick(SUJETS.filter(sansElision(v))), INDICE_3, [DEF_3]);
    case 3:
      return ecrire(v, rng.pick(SUJETS.filter(sansElision(v))), INDICE_3, [DEF_3]);
    case 4: {
      // « je » et « tu » ont la même forme : un seul des deux. Pas de « Je » devant « eus » (on écrit « J’eus »).
      const premier: Personne = v === 'avoir' ? 'tu' : rng.pick(['je', 'tu'] as const);
      const personnes: Personne[] = [premier, 'il', 'nous', 'vous', 'ils'];
      const sujets = personnes.map((p) => rng.pick([...SUJETS, ...SUJETS_GROUPES].filter((s) => s.personne === p)));
      const formes = personnes.map((p) => passeSimple(v, p));
      const { right, pairs } = appariement(rng, formes);
      return {
        prompt: `Associe chaque sujet (${sujets.map((s) => s.texte).join(', ')}) à sa forme de « ${v} » au passé simple.`,
        answer: { kind: 'match', left: sujets.map((s) => s.texte), right, pairs },
        hint: 'Commence par « nous » et « vous » : ils ont un accent circonflexe.',
        steps: [
          DEF_3,
          ...sujets.flatMap(remplacer),
          'Avec nous et vous, un accent circonflexe sur le u.',
          `Réponses : **${sujets.map((s, i) => `${s.texte} ${at(formes, i)}`).join(', ')}**.`,
        ],
      };
    }
    default: {
      const sujets = sujetsRecit(rng, 4);
      const verbes = rng.shuffle<VerbePs>(['être', 'être', 'avoir', 'avoir']);
      return recit(
        rng,
        'Une nuit dans la tempête',
        verbes.map((x, i) => ({ v: x, s: at(sujets, i) })),
        'Être ou avoir ? Lis l’infinitif. Puis trouve le sujet.',
        DEF_3,
      );
    }
  }
}

// ───────────────────────── 4. Les huit verbes irréguliers ─────────────────────────

const DEF_4 = 'Faire, aller, dire, venir, pouvoir, voir, vouloir, prendre : leur passé simple s’apprend par cœur.';
const INDICE_4 = 'Ce verbe change de radical. Pense à sa forme avec « il », puis change la fin.';

function irreguliersDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(HUIT_IRREGULIERS) as VerbePs & VerbeTemps;
      const s = rng.pick(SANS_JE.filter((x) => x.personne === 'il' || x.personne === 'ils'));
      return quelleForme(rng, v, s, 'Le passé simple ne finit pas comme l’imparfait (-ais, -ait, -aient).', DEF_4);
    }
    case 2: {
      const verbes = pickN(rng, HUIT_IRREGULIERS, 3);
      const formes = verbes.map((v) => `il ${passeSimple(v, 'il')}`);
      const { right, pairs } = appariement(rng, formes);
      return {
        prompt: `Associe chaque verbe (${verbes.join(', ')}) à sa forme au passé simple avec « il ».`,
        answer: { kind: 'match', left: verbes, right, pairs },
        hint: 'Cherche le verbe dont tu es le plus sûr, puis élimine.',
        steps: [
          DEF_4,
          ...verbes.map((v) => `« ${v} » fait son passé simple ${NOM_MODELE[modele(v)]}.`),
          `Réponses : **${verbes.map((v, i) => `${v} → ${at(formes, i)}`).join(', ')}**.`,
        ],
      };
    }
    case 3: {
      const v = rng.pick(HUIT_IRREGULIERS);
      const s = rng.pick(SUJETS.filter((x) => !pluriel(x) || x.personne === 'ils').filter(sansElision(v)));
      return ecrire(v, s, INDICE_4, [DEF_4]);
    }
    case 4: {
      const v = rng.pick(HUIT_IRREGULIERS);
      const s = rng.pick([...SUJETS, ...SUJETS_GROUPES].filter((x) => x.personne === 'nous' || x.personne === 'vous'));
      return ecrire(v, s, 'Trouve le radical du passé simple, puis la fin. N’oublie pas l’accent !', [
        DEF_4,
        `Avec nous et vous, un accent circonflexe : nous ${passeSimple(v, 'nous')}, vous ${passeSimple(v, 'vous')}.`,
      ]);
    }
    default: {
      const verbes = rng.shuffle([...pickN(rng, HUIT_IRREGULIERS, 3), rng.pick(ETRE_AVOIR)]);
      const sujets = sujetsRecit(rng, 4);
      return recit(
        rng,
        'Le voyage du capitaine',
        verbes.map((v, i) => ({ v, s: at(sujets, i) })),
        'Ces verbes changent de radical. Dis d’abord la forme avec « il ».',
        `${DEF_4} ${DEF_3}`,
      );
    }
  }
}

// ───────────────────────── 5. Passé simple ou imparfait ─────────────────────────

type Temps = 'passé simple' | 'imparfait';
const TEMPS: readonly Temps[] = ['passé simple', 'imparfait'];
const AU: Record<Temps, string> = { 'passé simple': 'au passé simple', imparfait: 'à l’imparfait' };
const autre = (t: Temps): Temps => (t === 'imparfait' ? 'passé simple' : 'imparfait');

/** Verbes dont le passé simple ne se confond pas avec le présent à cette personne (« il finit », « il dit »). */
const clair = (v: VerbePs, p: Personne) => passeSimple(v, p) !== present(v, p);

const formeAu = (t: Temps, v: VerbePs & VerbeTemps, p: Personne) =>
  t === 'imparfait' ? imparfait(v, p) : passeSimple(v, p);

const FINS_IMPARFAIT = '-ais, -ais, -ait, -ions, -iez, -aient';
const DEF_5 = `Imparfait : toujours ${FINS_IMPARFAIT}. La marque de temps est -ai- ou -i-.`;
const DEF_5B = 'Passé simple : je chantai, il chanta, ils chantèrent ; il finit, ils finirent ; il fut, il prit.';

const pourquoiTemps = (t: Temps, f: string) =>
  t === 'imparfait'
    ? `« ${f} » finit comme l’imparfait (${FINS_IMPARFAIT}) : c’est l’imparfait.`
    : `« ${f} » ne finit pas comme l’imparfait (${FINS_IMPARFAIT}) : c’est le passé simple.`;

const REGULIERS_5 = [...ER_REGULIERS, ...IR_DEUXIEME].filter(imparfaitOk);
const DIFFICILES_5 = [...ETRE_AVOIR, ...HUIT_IRREGULIERS].filter(imparfaitOk);

function transformer(rng: Rng, verbes: readonly (VerbePs & VerbeTemps)[], sujets: readonly Sujet[]): QuestionDraft {
  const v = rng.pick(verbes);
  const s = rng.pick(sujets.filter((x) => clair(v, x.personne)));
  const p = s.personne;
  const t = rng.pick(TEMPS);
  const depart = formeAu(autre(t), v, p);
  const bon = formeAu(t, v, p);
  const accepted = [bon, avecSujet(s.texte, bon)];
  const voisines = PERSONNES.filter((q) => formeAu(t, v, q) !== bon).map((q): Piege => [
    formeAu(t, v, q),
    `« ${formeAu(t, v, q)} » est bien ${AU[t]}, mais ne va pas avec ce sujet.`,
  ]);
  return {
    prompt: `Récris le verbe ${AU[t]} : « ${phrase(s, v, depart)} »`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [
      [depart, `C’est la phrase de départ, ${AU[autre(t)]}. Il faut changer de temps.`],
      [
        present(v, p),
        `« ${present(v, p)} » est au présent. On demande ${t === 'imparfait' ? 'l’imparfait' : 'le passé simple'}.`,
      ],
      ...voisines,
    ]),
    hint:
      t === 'imparfait'
        ? `L’imparfait finit toujours par ${FINS_IMPARFAIT}. Choisis la fin qui va avec le sujet.`
        : 'Pense au modèle du verbe : il chanta, il finit, il fut ou il vint ?',
    steps: [
      DEF_5,
      DEF_5B,
      t === 'imparfait' ? `« ${v} » à l’imparfait avec « ${PRONOMS[p]} » : ${bon}.` : regle(v, p),
      `On écrit **${phrase(s, v, bon)}**`,
    ],
  };
}

function passeSimpleImparfaitDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(ER_REGULIERS.filter(imparfaitOk));
      const s = rng.pick(SANS_JE);
      const t = rng.pick(TEMPS);
      const f = formeAu(t, v, s.personne);
      const fut = conjugue('futur', v, s.personne);
      // Toujours le même ordre de propositions : passé simple, imparfait, futur.
      const options = [...TEMPS, 'futur'];
      const correct = options.indexOf(t);
      return {
        prompt: `« ${phrase(s, v, f)} » À quel temps est le verbe ?`,
        answer: { kind: 'choice', options, correct },
        traps: [
          { option: options.indexOf(autre(t)), why: pourquoiTemps(t, f) },
          { option: 2, why: `Au futur, on écrirait « ${fut} ». Ici, ça s’est passé avant.` },
        ],
        hint: 'Regarde la fin du verbe : finit-elle comme l’imparfait ?',
        steps: [DEF_5, DEF_5B, `« ${f} » est **${t}**.`],
      };
    }
    case 2: {
      const v = rng.pick(REGULIERS_5);
      const t = rng.pick(TEMPS);
      const personnes = rng.shuffle(PERSONNES.filter((p) => clair(v, p)));
      const [pBon, ...pAutres] = personnes;
      if (!pBon) throw new Error(`aucune personne pour ${v}`);
      const s = (p: Personne) =>
        at(
          SUJETS.filter((x) => x.personne === p),
          0,
        );
      const bon = avecSujet(s(pBon).texte, formeAu(t, v, pBon));
      // Le passé simple et l'imparfait à la même personne (je chantai / je chantais), puis deux autres personnes.
      const faux = [pBon, ...pAutres.slice(0, 2)].map((p) => avecSujet(s(p).texte, formeAu(autre(t), v, p)));
      const { answer, traps } = choice(
        rng,
        bon,
        faux.map((label) => ({ label, why: pourquoiTemps(autre(t), label) })),
      );
      return {
        prompt: `Une seule de ces formes est ${AU[t]}. Laquelle ?`,
        answer,
        traps,
        hint: 'Compare les fins des verbes : une seule lettre peut tout changer.',
        steps: [DEF_5, DEF_5B, `La forme ${AU[t]} : **${bon}**.`],
      };
    }
    case 3:
      return transformer(rng, REGULIERS_5, SUJETS);
    case 4:
      return transformer(rng, DIFFICILES_5, [...SUJETS, ...SUJETS_GROUPES]);
    default: {
      const verbes = pickN(rng, [...REGULIERS_5, ...DIFFICILES_5], 4);
      const sujets = sujetsRecit(rng, 4);
      const temps = rng.shuffle<Temps>(['passé simple', 'imparfait', rng.pick(TEMPS), rng.pick(TEMPS)]);
      const lignes = verbes.map((v, i) => {
        const s = at(sujets, i);
        const p = clair(v, s.personne)
          ? s
          : at(
              SANS_JE.filter((x) => clair(v, x.personne)),
              0,
            );
        const t = at(temps, i);
        return { v, s: p, t, f: formeAu(t, v, p.personne) };
      });
      return {
        prompt: 'Lis le récit. Pour chaque ligne, dis à quel temps est le verbe.',
        figure: document(
          'Le trésor du vieux moulin',
          lignes.map((l) => phrase(l.s, l.v, l.f)),
        ),
        answer: {
          kind: 'cloze',
          parts: [...lignes.map((l, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1}, « ${l.f} » : `), '.'],
          blanks: lignes.map((l) => ({
            mode: 'list' as const,
            options: [...TEMPS],
            correct: TEMPS.indexOf(l.t),
          })),
        },
        hint: 'Sur chaque ligne, regarde la fin du verbe : -ais, -ait, -ions, -iez, -aient ?',
        steps: [
          DEF_5,
          DEF_5B,
          ...lignes.map((l, i) => `Ligne ${i + 1} : ${pourquoiTemps(l.t, l.f)}`),
          `Réponses : **${lignes.map((l) => l.t).join(', ')}**.`,
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
  readonly verbes: readonly VerbePs[];
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
    sources: sourcesPasseSimple([n.factId, ...n.faits, ...n.verbes.map((v) => `passe-simple-${v}`)], n.verbes),
  },
  generate: n.generate,
});

export const FCM2_PASSE_SIMPLE: readonly Skill[] = [
  skill({
    id: 'fcm2-passe-simple-1er-groupe',
    title: 'Le passé simple du 1er groupe',
    memo: [
      'Le **passé simple** est un temps du passé en un seul mot. On le lit surtout dans les **récits**.',
      'Verbes en -er : je chantai, tu chantas, il chanta, nous chantâmes, vous chantâtes, ils chantèrent.',
      'Garde le son du g et du c : il mangea, il avança. Mais : ils mangèrent, ils avancèrent.',
    ],
    factId: 'ps-a-memoriser',
    faits: ['ps-temps-simples', 'ps-chantai', 'ps-groupe-1', 'ps-recit', 'ps-cedille', 'ps-g-doux', 'ps-marques'],
    verbes: [...ER_REGULIERS, ...ER_VARIANTES],
    generate: premierGroupeDraft,
  }),
  skill({
    id: 'fcm2-passe-simple-2e-groupe',
    title: 'Le passé simple du 2e groupe',
    memo: [
      'Verbes comme finir : je finis, tu finis, il finit, nous finîmes, vous finîtes, ils finirent.',
      'Pas de -iss- au **passé simple** : « ils finirent », jamais « ils finissirent ».',
      'Avec je, tu, il, la forme est la même qu’au **présent** : le récit t’aide à choisir.',
    ],
    factId: 'ps-a-memoriser',
    faits: ['ps-groupe-2', 'ps-parlai-sortis', 'ps-groupe-1'],
    verbes: [...IR_DEUXIEME, ...ER_REGULIERS],
    generate: deuxiemeGroupeDraft,
  }),
  skill({
    id: 'fcm2-passe-simple-etre-avoir',
    title: 'Être et avoir au passé simple',
    memo: [
      'Être : je fus, tu fus, il fut, nous fûmes, vous fûtes, ils furent.',
      'Avoir : j’eus, tu eus, il eut, nous eûmes, vous eûtes, ils eurent.',
      'Avec nous et vous, un **accent circonflexe** : nous fûmes, vous eûtes.',
    ],
    factId: 'ps-a-memoriser',
    faits: ['ps-plusieurs-radicaux', 'ps-temps-simples'],
    verbes: ETRE_AVOIR,
    generate: etreAvoirDraft,
  }),
  skill({
    id: 'fcm2-passe-simple-irreguliers',
    title: 'Les 8 verbes irréguliers au passé simple',
    memo: [
      'Huit **verbes irréguliers** à savoir par cœur. Avec « il » : il fit, il alla, il dit, il vint.',
      'Et aussi : il put, il vit, il voulut, il prit. Au pluriel : ils firent, ils vinrent, ils prirent.',
      'Au passé simple, aller finit comme chanter : il alla, ils allèrent.',
    ],
    factId: 'ps-a-memoriser',
    faits: ['ps-aller', 'ps-plusieurs-radicaux'],
    verbes: [...HUIT_IRREGULIERS, ...ETRE_AVOIR],
    generate: irreguliersDraft,
  }),
  skill({
    id: 'fcm2-passe-simple-ou-imparfait',
    title: 'Passé simple ou imparfait ?',
    memo: [
      'Regarde la **terminaison**. -ais, -ait, -ions, -iez, -aient ? C’est l’**imparfait** : il chantait.',
      'Sinon, c’est le **passé simple** : il chanta, ils finirent, il prit, nous fûmes.',
      'Attention : je chantai (passé simple), je chantais (imparfait). Une seule lettre change !',
    ],
    factId: 'ps-marques',
    faits: ['ps-indicatif-passe', 'ps-chantai', 'ps-imparfait-chantais', 'ps-marque-ai', 'ps-radicaux', 'ps-recit'],
    verbes: [...ER_REGULIERS, ...IR_DEUXIEME, ...ETRE_AVOIR, ...HUIT_IRREGULIERS].filter(imparfaitOk),
    generate: passeSimpleImparfaitDraft,
  }),
];
