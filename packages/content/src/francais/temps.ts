import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { at, document, pickN, textTraps } from './outils.ts';
import { PERSONNES, SUJETS, SUJETS_GROUPES, avecSujet, forme, type Personne, type Sujet } from './present.donnees.ts';
import {
  FINS,
  FUTURS_FAUTIFS,
  INFINITIFS_FAUTIFS,
  IRREGULIERS_CITES,
  PARTICIPES_FAUTIFS,
  REGULIERS,
  REGULIERS_ER,
  SUJETS_ACCORDES,
  VERBES_TEMPS,
  auxiliaire,
  auxiliaireDe,
  conjugue,
  faitTemps,
  neDevant,
  negatif,
  participe,
  participeAccorde,
  passeCompose,
  phrasePositive,
  sourcesTemps,
  type Negation,
  type SujetAccorde,
  type TempsSimple,
  type VerbeTemps,
} from './temps.donnees.ts';

/**
 * Chapitre « Imparfait, futur et passé composé » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Approfondir sa maîtrise de la conjugaison ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitTemps(id).citation} »`;

const PRONOMS: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il ou elle',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils ou elles',
};

interface Ligne<S extends Sujet = Sujet> {
  readonly sujet: S;
  readonly verbe: VerbeTemps;
}

/** Sujets sans « je » : aucune élision à deviner devant le trou. */
const SANS_JE: readonly Sujet[] = SUJETS.filter((s) => s.personne !== 'je');
const PRONOMS_SIMPLES: readonly Sujet[] = SANS_JE.filter((s) =>
  ['Tu', 'Il', 'Elle', 'Nous', 'Vous', 'Ils', 'Elles'].includes(s.texte),
);

/** Sujet groupe nominal ou plusieurs noms : le pronom qui le remplace. */
const remplacer = (s: Sujet): readonly Rich[] => {
  const groupe = SUJETS_GROUPES.find((x) => x.texte === s.texte);
  return groupe ? [`« ${s.texte} », c’est comme « ${groupe.pronom} ».`] : [];
};

/** Propositions fausses distinctes (aucune écriture juste, aucun doublon). */
function fausses(bon: string, list: readonly (readonly [string, string])[]) {
  const vues = new Set([bon]);
  return list.filter(([f]) => !vues.has(f) && vues.add(f)).map(([label, why]) => ({ label, why }));
}

/** Réponse écrite : le groupe verbal seul, ou précédé de son sujet. */
function saisie(
  sujet: Sujet,
  attendu: string,
  pieges: readonly (readonly [string, string])[],
  q: Pick<QuestionDraft, 'prompt' | 'hint' | 'steps'>,
): QuestionDraft {
  const accepted = [attendu, avecSujet(sujet.texte, attendu)];
  return { ...q, answer: { kind: 'text', accepted }, traps: textTraps(accepted, pieges) };
}

/** Texte à compléter : un trou par ligne. */
function texteATrous(
  prompt: string,
  titre: string,
  lignes: readonly { readonly texte: string; readonly attendu: string; readonly pourquoi: string }[],
  hint: string,
  etapes: readonly Rich[],
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
      ...etapes,
      ...lignes.map((l, i) => `Ligne ${i + 1} : ${l.pourquoi}`),
      `Réponses : **${lignes.map((l) => l.attendu).join(', ')}**.`,
    ],
  };
}

// ───────────────────────── 1 et 2. Imparfait et futur ─────────────────────────

const NOM: Record<TempsSimple, string> = { imparfait: 'l’imparfait', futur: 'le futur' };
const AU: Record<TempsSimple, string> = { imparfait: 'à l’imparfait', futur: 'au futur' };
const AUTRE_TEMPS: Record<TempsSimple, TempsSimple> = { imparfait: 'futur', futur: 'imparfait' };

/** Marques de personne à l'imparfait et au futur. */
const FINALES: Record<TempsSimple, Record<Personne, string>> = {
  imparfait: { je: 'ais', tu: 'ais', il: 'ait', nous: 'ions', vous: 'iez', ils: 'aient' },
  futur: { je: 'ai', tu: 'as', il: 'a', nous: 'ons', vous: 'ez', ils: 'ont' },
};
const marqueDeTemps = (t: TempsSimple, p: Personne): string => {
  if (t === 'futur') return '-r-';
  return p === 'nous' || p === 'vous' ? '-i-' : '-ai-';
};

const regle = (t: TempsSimple, p: Personne): string =>
  t === 'imparfait'
    ? `Avec « ${PRONOMS[p]} », l’imparfait finit par **-${FINALES.imparfait[p]}** : la marque de temps est ${marqueDeTemps(t, p)}.`
    : `Avec « ${PRONOMS[p]} », le futur finit par **-r${FINALES.futur[p]}** : la marque de temps est -r-.`;

const MEMORISER: Record<TempsSimple, string> = {
  imparfait: 'À l’imparfait, cherche la marque de temps : -ai- ou -i-.',
  futur: 'Au futur, cherche la marque de temps : -r-.',
};

const INDICE: Record<TempsSimple, string> = {
  imparfait: 'Cherche le sujet. Quelle marque de l’imparfait va avec lui ?',
  futur: 'Cherche le sujet. Entends-tu un « r » juste avant la fin ?',
};

/** À l'imparfait, « manger » et « avancer » modifient leur radical devant le a. */
const VARIATIONS_IMPARFAIT: Partial<Record<VerbeTemps, { juste: string; faux: string; regle: string }>> = {
  manger: { juste: 'mangea', faux: 'manga', regle: 'Devant le a, garde un e après le g : le son reste « j ».' },
  avancer: { juste: 'avança', faux: 'avanca', regle: 'Devant le a, le c prend une cédille : le son reste « s ».' },
};
const variationDe = (t: TempsSimple, v: VerbeTemps, bon: string): Rich[] => {
  const x = VARIATIONS_IMPARFAIT[v];
  return t === 'imparfait' && x && bon.startsWith(x.juste) ? [x.regle] : [];
};

/** Erreurs typiques : autre temps, autre personne, infinitif, lettre oubliée. */
function piegesSimples(t: TempsSimple, v: VerbeTemps, p: Personne): [string, string][] {
  const bon = conjugue(t, v, p);
  const autre = AUTRE_TEMPS[t];
  const list: [string, string][] = [
    [forme(v, p), `« ${forme(v, p)} » est au présent. On demande ${NOM[t]}.`],
    [conjugue(autre, v, p), `« ${conjugue(autre, v, p)} » est ${AU[autre]}. On demande ${NOM[t]}.`],
    [v, 'C’est l’infinitif, le nom du verbe. Il faut le conjuguer.'],
  ];
  if (t === 'imparfait' && (p === 'nous' || p === 'vous')) {
    list.unshift([
      bon.replace(/i(ons|ez)$/, '$1'),
      'Il manque le i : c’est la marque de l’imparfait avec nous et vous.',
    ]);
  }
  const variation = VARIATIONS_IMPARFAIT[v];
  if (t === 'imparfait' && variation && bon.startsWith(variation.juste)) {
    list.unshift([bon.replace(variation.juste, variation.faux), variation.regle]);
  }
  if (t === 'futur') {
    const faux = FUTURS_FAUTIFS[v]?.replace(/a$/, FINALES.futur[p]);
    if (faux) list.unshift([faux, `Le radical de « ${v} » change au futur : ${bon}.`]);
    if (REGULIERS_ER.includes(v))
      list.unshift([bon.replace(`er${FINALES.futur[p]}`, `r${FINALES.futur[p]}`), 'N’oublie pas le e de l’infinitif.']);
    if (p === 'je') list.unshift([`${bon}s`, 'Au futur, avec « je », il n’y a pas de s à la fin.']);
  }
  for (const q of PERSONNES) {
    const f = conjugue(t, v, q);
    list.push([f, `« ${f} » ne va pas avec ce sujet. ${regle(t, p)}`]);
  }
  return list;
}

/** QCM : retrouver, parmi trois formes du même verbe, celle du temps demandé. */
function reconnaitre(rng: Rng, t: TempsSimple): QuestionDraft {
  const v = rng.pick([...REGULIERS, 'être', 'avoir'] as const);
  const s = rng.pick(SANS_JE);
  const p = s.personne;
  const bon = conjugue(t, v, p);
  const autre = AUTRE_TEMPS[t];
  const { answer, traps } = choice(rng, bon, [
    { label: forme(v, p), why: `« ${forme(v, p)} » est au présent : ça se passe maintenant.` },
    { label: conjugue(autre, v, p), why: `« ${conjugue(autre, v, p)} » est ${AU[autre]}.` },
  ]);
  return {
    prompt: `Avec « ${s.texte} », quelle forme du verbe « ${v} » est ${AU[t]} ?`,
    answer,
    traps,
    hint: INDICE[t],
    steps: [MEMORISER[t], regle(t, p), `La bonne forme est **${bon}**.`],
  };
}

function completer(rng: Rng, t: TempsSimple): QuestionDraft {
  const v = rng.pick(REGULIERS);
  const s = rng.pick(SANS_JE);
  const p = s.personne;
  const bon = conjugue(t, v, p);
  const autre = conjugue(AUTRE_TEMPS[t], v, p);
  const autresTemps: [string, string][] = [
    [forme(v, p), `« ${forme(v, p)} » est au présent. On demande ${NOM[t]}.`],
    [autre, `« ${autre} » est ${AU[AUTRE_TEMPS[t]]}. On demande ${NOM[t]}.`],
  ];
  const voisines = rng.shuffle(
    PERSONNES.filter((q) => q !== p).map((q): [string, string] => [
      conjugue(t, v, q),
      `Cette forme va avec « ${PRONOMS[q]} ». ${regle(t, p)}`,
    ]),
  );
  const { answer, traps } = choice(rng, bon, fausses(bon, [...autresTemps, ...voisines]).slice(0, 3));
  return {
    prompt: `Complète ${AU[t]} : « ${s.texte} … ${FINS[v]}. » (${v})`,
    answer,
    traps,
    hint: INDICE[t],
    steps: [...remplacer(s), regle(t, p), `On écrit **${s.texte} ${bon} ${FINS[v]}.**`],
  };
}

function marque(rng: Rng, t: TempsSimple): QuestionDraft {
  const v = rng.pick(REGULIERS_ER);
  const s = rng.pick(PRONOMS_SIMPLES);
  const p = s.personne;
  const bon = marqueDeTemps(t, p);
  const radical = `${v.slice(0, -2)}-`;
  const personne = t === 'imparfait' ? FINALES.imparfait[p].replace(/^a?i/, '') : FINALES.futur[p];
  const { answer, traps } = choice(rng, bon, [
    { label: `-${personne}`, why: 'Ça, c’est la marque de personne : elle va avec le sujet.' },
    { label: radical, why: 'Ça, c’est le radical : il porte le sens du verbe.' },
    { label: s.texte, why: 'C’est le sujet. Il ne fait pas partie du verbe.' },
  ]);
  return {
    prompt: `Dans « ${s.texte} ${conjugue(t, v, p)} », quelle est la marque de temps ?`,
    answer,
    traps,
    hint: 'Enlève le radical, puis la fin qui change avec le sujet.',
    steps: [
      MEMORISER[t],
      'La marque de temps se place avant la marque de personne.',
      `La marque de temps est **${bon}**.`,
    ],
  };
}

function associer(rng: Rng, t: TempsSimple): QuestionDraft {
  const v = rng.pick([...REGULIERS, 'être', 'avoir'] as const);
  const choisies: Personne[] = [];
  for (const p of rng.shuffle(PERSONNES.filter((x) => x !== 'je'))) {
    if (choisies.length < 3 && !choisies.some((q) => conjugue(t, v, q) === conjugue(t, v, p))) choisies.push(p);
  }
  const sujets = choisies.map((p) => rng.pick(SANS_JE.filter((s) => s.personne === p)));
  const bonnes = choisies.map((p) => conjugue(t, v, p));
  // Jamais présentées en face les unes des autres : décalage d'un ou deux rangs.
  const k = rng.int(1, 2);
  const droite = bonnes.map((_, i) => at(bonnes, (i + k) % 3));
  return {
    prompt: `Associe chaque sujet (${sujets.map((s) => s.texte).join(', ')}) à la bonne forme du verbe « ${v} » ${AU[t]}.`,
    answer: {
      kind: 'match',
      left: sujets.map((s) => s.texte),
      right: droite,
      pairs: bonnes.map((f) => droite.indexOf(f)),
    },
    hint: 'Commence par le sujet que tu connais le mieux.',
    steps: [
      MEMORISER[t],
      ...choisies.map((p) => regle(t, p)),
      `Réponses : **${sujets.map((s, i) => `${s.texte} ${at(bonnes, i)}`).join(', ')}**.`,
    ],
  };
}

function ecrire(t: TempsSimple, { sujet: s, verbe: v }: Ligne, piege: boolean): QuestionDraft {
  const p = s.personne;
  const bon = conjugue(t, v, p);
  const intro = piege ? `Attention au radical ! Écris ${AU[t]}` : `Écris ${AU[t]}`;
  return saisie(s, bon, piegesSimples(t, v, p), {
    prompt: `${intro} le verbe « ${v} » : « ${s.texte} … ${FINS[v]}. »`,
    hint: INDICE[t],
    steps: [
      ...remplacer(s),
      ...(IRREGULIERS_CITES.includes(v) ? [`« ${v} » est irrégulier ou change de radical : retiens-le.`] : []),
      ...variationDe(t, v, bon),
      regle(t, p),
      `On écrit **${s.texte} ${bon} ${FINS[v]}.**`,
    ],
  });
}

/** Verbes travaillés au niveau 4 : les irréguliers cités, et à l'imparfait les verbes en -ger et -cer. */
const DIFFICILES: Record<TempsSimple, readonly VerbeTemps[]> = {
  imparfait: [...IRREGULIERS_CITES, 'manger', 'avancer'],
  futur: IRREGULIERS_CITES,
};

const TITRES: Record<TempsSimple, string> = { imparfait: 'Autrefois', futur: 'Demain' };

function texteSimple(rng: Rng, t: TempsSimple): QuestionDraft {
  const sujets = rng.shuffle([...pickN(rng, SUJETS_GROUPES, 2), ...pickN(rng, SANS_JE, 2)]);
  const verbes = rng.shuffle([...pickN(rng, REGULIERS, 2), ...pickN(rng, DIFFICILES[t], 2)]);
  return texteATrous(
    `Lis le texte. Écris ${AU[t]} le verbe entre parenthèses, ligne par ligne.`,
    TITRES[t],
    sujets.map((s, i) => {
      const v = at(verbes, i);
      const attendu = conjugue(t, v, s.personne);
      const groupe = remplacer(s).join(' ');
      const explications = [groupe, ...variationDe(t, v, attendu), regle(t, s.personne)].filter(Boolean).join(' ');
      return {
        texte: `${s.texte} … (${v}) ${FINS[v]}.`,
        attendu,
        pourquoi: `${explications} On écrit « ${attendu} ».`,
      };
    }),
    'Sur chaque ligne, cherche d’abord le sujet. Remplace-le par un pronom si besoin.',
    [MEMORISER[t]],
  );
}

const draftSimple =
  (t: TempsSimple) =>
  (rng: Rng, level: Level): QuestionDraft => {
    switch (level) {
      case 1:
        return reconnaitre(rng, t);
      case 2:
        return rng.pick([completer, marque, associer])(rng, t);
      case 3: {
        const sujet = rng.pick([...PRONOMS_SIMPLES, ...SUJETS.filter((x) => x.personne === 'je')]);
        // « Je » : seulement des verbes qui commencent par une consonne (pas de « j’ » à deviner).
        const verbes = REGULIERS.filter(
          (v) => sujet.personne !== 'je' || avecSujet('je', conjugue(t, v, 'je')).startsWith('je '),
        );
        return ecrire(t, { sujet, verbe: rng.pick(verbes) }, false);
      }
      case 4: {
        const sujet = rng.pick([...SUJETS_GROUPES, ...SANS_JE]);
        return ecrire(t, { sujet, verbe: rng.pick(DIFFICILES[t]) }, true);
      }
      default:
        return texteSimple(rng, t);
    }
  };

// ───────────────────────── 3. Passé composé ─────────────────────────

const DEF_COMPOSE =
  'Le passé composé a deux parties : l’auxiliaire (être ou avoir) au présent, puis le participe passé.';
const DEF_ACCORD = 'Avec « être », le participe passé s’accorde avec le sujet.';

const prendEtre = (v: VerbeTemps) => auxiliaireDe(v) === 'être';
const COMPOSE_IRREGULIERS: readonly VerbeTemps[] = IRREGULIERS_CITES;

/** Sujet adapté au verbe : genre connu quand le verbe prend « être ». */
const sujetPour = (rng: Rng, v: VerbeTemps, simples: readonly Sujet[]): SujetAccorde =>
  rng.pick(prendEtre(v) ? SUJETS_ACCORDES : simples);

const etapesCompose = (v: VerbeTemps, s: SujetAccorde): Rich[] => [
  DEF_COMPOSE,
  ...remplacer(s),
  `« ${v} » se conjugue avec « ${auxiliaireDe(v)} » : ${avecSujet(PRONOMS[s.personne], auxiliaire(v, s.personne))}.`,
  prendEtre(v)
    ? `${DEF_ACCORD} On écrit « ${participeAccorde(v, s)} ».`
    : `Le participe passé est « ${participe(v)} ».`,
];

function piegesCompose(v: VerbeTemps, s: SujetAccorde): [string, string][] {
  const p = s.personne;
  const aux = auxiliaire(v, p);
  const accorde = participeAccorde(v, s);
  const autreAux = forme(prendEtre(v) ? 'avoir' : 'être', p);
  const list: [string, string][] = [
    [accorde, 'Il manque l’auxiliaire : le passé composé a deux parties.'],
    [`${aux} ${v}`, `« ${v} » est l’infinitif. Après l’auxiliaire, il faut le participe passé.`],
    [`${autreAux} ${accorde}`, `Avec « ${v} », l’auxiliaire est « ${auxiliaireDe(v)} ».`],
    [conjugue('imparfait', v, p), 'C’est l’imparfait : un seul mot. Le passé composé en a deux.'],
  ];
  if (accorde !== participe(v)) list.unshift([`${aux} ${participe(v)}`, DEF_ACCORD]);
  for (const faux of PARTICIPES_FAUTIFS[v] ?? [])
    list.push([`${aux} ${faux}`, `Le participe passé de « ${v} » est « ${participe(v)} ».`]);
  const autre = p === 'il' ? 'ils' : 'il';
  list.push([`${auxiliaire(v, autre)} ${accorde}`, `L’auxiliaire va avec le sujet : ${avecSujet(PRONOMS[p], aux)}.`]);
  return list;
}

function reconnaitreCompose(rng: Rng): QuestionDraft {
  const v = rng.pick([...REGULIERS, 'aller', 'venir'] as const);
  const s = sujetPour(rng, v, SANS_JE);
  const bon = phrasePositive(s, v);
  const phrase = (verbe: string) => `${s.texte} ${verbe} ${FINS[v]}.`;
  const { answer, traps } = choice(rng, bon, [
    { label: phrase(forme(v, s.personne)), why: 'C’est le présent : le verbe est en un seul mot.' },
    { label: phrase(conjugue('imparfait', v, s.personne)), why: 'C’est l’imparfait : repère -ai- ou -i-.' },
  ]);
  return {
    prompt: `Quelle phrase est au passé composé ? (verbe « ${v} », sujet « ${s.texte} »)`,
    answer,
    traps,
    hint: 'Cherche la phrase où le verbe est fait de deux mots.',
    steps: [DEF_COMPOSE, `La phrase au passé composé est : **${bon}**`],
  };
}

function trouverPartie(rng: Rng): QuestionDraft {
  const v = rng.pick(REGULIERS);
  const s = rng.pick(PRONOMS_SIMPLES);
  const aux = auxiliaire(v, s.personne);
  const part = participe(v);
  const cherche = rng.pick(['l’auxiliaire', 'le participe passé'] as const);
  const bon = cherche === 'l’auxiliaire' ? aux : part;
  const { answer, traps } = choice(rng, bon, [
    cherche === 'l’auxiliaire'
      ? { label: part, why: 'C’est le participe passé : la deuxième partie du verbe.' }
      : { label: aux, why: 'C’est l’auxiliaire : la première partie du verbe.' },
    { label: s.texte, why: 'C’est le sujet. Il ne fait pas partie du verbe.' },
    { label: FINS[v], why: 'Ces mots complètent la phrase. Ce n’est pas le verbe.' },
  ]);
  return {
    prompt: `Dans « ${s.texte} ${aux} ${part} ${FINS[v]}. », trouve ${cherche}.`,
    answer,
    traps,
    hint: 'Le verbe au passé composé est fait de deux mots qui se suivent.',
    steps: [DEF_COMPOSE, `Ici, ${cherche} est **${bon}**.`],
  };
}

function completerCompose(rng: Rng): QuestionDraft {
  const v = rng.pick([...REGULIERS, 'aller', 'venir'] as const);
  const s = sujetPour(rng, v, SANS_JE);
  const bon = passeCompose(v, s);
  const { answer, traps } = choice(rng, bon, fausses(bon, rng.shuffle(piegesCompose(v, s))).slice(0, 3));
  return {
    prompt: `Complète au passé composé : « ${s.texte} … ${FINS[v]}. » (${v})`,
    answer,
    traps,
    hint: 'Il faut deux mots : l’auxiliaire, puis le participe passé.',
    steps: [...etapesCompose(v, s), `On écrit **${phrasePositive(s, v)}**`],
  };
}

function ecrireCompose({ sujet: s, verbe: v }: Ligne<SujetAccorde>, piege: boolean): QuestionDraft {
  const intro = piege ? 'Attention, piège ! Écris au passé composé' : 'Écris au passé composé';
  return saisie(s, passeCompose(v, s), piegesCompose(v, s), {
    prompt: `${intro} le verbe « ${v} » : « ${s.texte} … ${FINS[v]}. »`,
    hint: 'Choisis l’auxiliaire qui va avec le sujet, puis cherche le participe passé.',
    steps: [...etapesCompose(v, s), `On écrit **${phrasePositive(s, v)}**`],
  });
}

/** Lignes variées : deux verbes réguliers, un irrégulier avec « avoir », un verbe avec « être ». */
function lignesComposees(rng: Rng): Ligne<SujetAccorde>[] {
  const verbes = [
    ...pickN(rng, REGULIERS, 2),
    rng.pick(COMPOSE_IRREGULIERS.filter((v) => !prendEtre(v))),
    rng.pick(['aller', 'venir'] as const),
  ];
  const libres = rng.shuffle(SANS_JE);
  return rng.shuffle(verbes.map((verbe, i) => ({ verbe, sujet: sujetPour(rng, verbe, [at(libres, i)]) })));
}

function composeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return reconnaitreCompose(rng);
    case 2:
      return rng.pick([trouverPartie, completerCompose])(rng);
    case 3:
      return ecrireCompose({ sujet: rng.pick(PRONOMS_SIMPLES), verbe: rng.pick(REGULIERS) }, false);
    case 4: {
      const verbe = rng.pick(COMPOSE_IRREGULIERS);
      return ecrireCompose({ sujet: sujetPour(rng, verbe, SANS_JE), verbe }, true);
    }
    default:
      return texteATrous(
        'Lis le texte. Écris au passé composé le verbe entre parenthèses, ligne par ligne.',
        'La journée d’hier',
        lignesComposees(rng).map(({ sujet: s, verbe: v }) => ({
          texte: `${s.texte} … (${v}) ${FINS[v]}.`,
          attendu: passeCompose(v, s),
          pourquoi: `« ${v} » prend « ${auxiliaireDe(v)} ». On écrit « ${passeCompose(v, s)} ».`,
        })),
        'Pour chaque verbe : être ou avoir ? Puis le participe passé.',
        [DEF_COMPOSE, DEF_ACCORD],
      );
  }
}

// ───────────────────────── 4. Infinitif d'un participe passé ─────────────────────────

const ASTUCE = 'Pour trouver l’infinitif, dis : « Il faut… » ou « Il est en train de… ».';
const donne = (v: VerbeTemps) => `« ${v} » donne « ${participe(v)} » au participe passé.`;

/** Trois autres verbes de la même famille de difficulté : propositions plausibles. */
const proches = (rng: Rng, v: VerbeTemps): VerbeTemps[] => {
  const pool = IRREGULIERS_CITES.includes(v) ? IRREGULIERS_CITES : REGULIERS;
  return pickN(
    rng,
    pool.filter((x) => x !== v),
    3,
  );
};

function etapesInfinitif(v: VerbeTemps, s: SujetAccorde): Rich[] {
  return [
    `Le verbe est « ${passeCompose(v, s)} » : l’auxiliaire, puis le participe passé « ${participeAccorde(v, s)} ».`,
    ASTUCE,
    `L’infinitif est **${v}**.`,
  ];
}

function piegesInfinitif(v: VerbeTemps, s: SujetAccorde): [string, string][] {
  const aux = auxiliaireDe(v);
  const list: [string, string][] = [
    [participeAccorde(v, s), 'C’est le participe passé. On cherche le nom du verbe : son infinitif.'],
    [aux, `« ${aux} » est seulement l’auxiliaire. Regarde le participe passé.`],
    [auxiliaire(v, s.personne), 'C’est l’auxiliaire conjugué. Regarde le participe passé.'],
    [conjugue('imparfait', v, s.personne), 'Ce verbe est conjugué. L’infinitif ne change pas avec le sujet.'],
  ];
  const faux = INFINITIFS_FAUTIFS[v];
  if (faux) list.push([faux, `« ${faux} » est un autre mot. ${donne(v)}`]);
  return list;
}

const avecParticipe = (rng: Rng, verbes: readonly VerbeTemps[]): Ligne<SujetAccorde> => {
  const verbe = rng.pick(verbes);
  return { verbe, sujet: sujetPour(rng, verbe, PRONOMS_SIMPLES) };
};

function ecrireInfinitif({ sujet: s, verbe: v }: Ligne<SujetAccorde>): QuestionDraft {
  const accepted = [v];
  return {
    prompt: `Dans « ${phrasePositive(s, v)} », écris l’infinitif du verbe conjugué au passé composé.`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, piegesInfinitif(v, s)),
    hint: ASTUCE,
    steps: etapesInfinitif(v, s),
  };
}

function infinitifDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const v = rng.pick(REGULIERS);
      const { answer, traps } = choice(
        rng,
        v,
        pickN(
          rng,
          REGULIERS.filter((x) => x !== v),
          2,
        ).map((x) => ({ label: x, why: donne(x) })),
      );
      return {
        prompt: `« ${participe(v)} » est le participe passé de quel verbe ?`,
        answer,
        traps,
        hint: ASTUCE,
        steps: [donne(v), ASTUCE, `C’est le verbe **${v}**.`],
      };
    }
    case 2: {
      if (rng.int(0, 1) === 0) {
        const choisis = [
          rng.pick(REGULIERS_ER),
          rng.pick(['finir', 'choisir', 'remplir', 'réussir'] as const),
          rng.pick(['pouvoir', 'voir', 'vouloir', 'prendre', 'faire', 'dire'] as const),
        ];
        const gauche = rng.shuffle(choisis);
        const k = rng.int(1, 2);
        const droite = gauche.map((_, i) => at(gauche, (i + k) % 3));
        return {
          prompt: `Associe chaque participe passé (${gauche.map(participe).join(', ')}) à son infinitif.`,
          answer: {
            kind: 'match',
            left: gauche.map(participe),
            right: droite,
            pairs: gauche.map((v) => droite.indexOf(v)),
          },
          hint: ASTUCE,
          steps: [
            ASTUCE,
            ...gauche.map(donne),
            `Réponses : **${gauche.map((v) => `${participe(v)} → ${v}`).join(', ')}**.`,
          ],
        };
      }
      const { sujet: s, verbe: v } = avecParticipe(rng, [...REGULIERS, ...IRREGULIERS_CITES]);
      const { answer, traps } = choice(
        rng,
        v,
        proches(rng, v).map((x) => ({ label: x, why: donne(x) })),
      );
      return {
        prompt: `Dans « ${phrasePositive(s, v)} », quel est l’infinitif du verbe ?`,
        answer,
        traps,
        hint: ASTUCE,
        steps: etapesInfinitif(v, s),
      };
    }
    case 3:
      return ecrireInfinitif(avecParticipe(rng, REGULIERS));
    case 4:
      return ecrireInfinitif(avecParticipe(rng, IRREGULIERS_CITES));
    default: {
      const lignes = lignesComposees(rng);
      return texteATrous(
        'Lis le texte. Pour chaque ligne, écris l’infinitif du verbe au passé composé.',
        'Au fil de la journée',
        lignes.map(({ sujet: s, verbe: v }) => ({
          texte: phrasePositive(s, v),
          attendu: v,
          pourquoi: `dans « ${passeCompose(v, s)} », le participe passé vient de « ${v} ».`,
        })),
        'Repère l’auxiliaire, puis le mot juste après.',
        [DEF_COMPOSE, ASTUCE],
      );
    }
  }
}

// ───────────────────────── 5. Passé composé à la forme négative ─────────────────────────

const DEF_NEGATION = 'À la forme négative, « ne » (ou « n’ ») et le mot négatif encadrent l’auxiliaire.';
const ADVERBES: readonly Negation[] = ['pas', 'jamais', 'plus'];

const phraseNegative = (s: SujetAccorde, v: VerbeTemps, a: Negation) => `${s.texte} ${negatif(v, s, a)} ${FINS[v]}.`;

const etapesNegation = (v: VerbeTemps, s: SujetAccorde, a: Negation): Rich[] => {
  const aux = auxiliaire(v, s.personne);
  return [
    DEF_NEGATION,
    `L’auxiliaire est « ${aux} ».`,
    neDevant(aux) === 'n’'
      ? `Devant une voyelle, « ne » devient « n’ » : n’${aux}.`
      : `Devant une consonne, on garde « ne » : ne ${aux}.`,
    `« ${a} » se place juste après l’auxiliaire, avant le participe passé.`,
  ];
};

function piegesNegation(v: VerbeTemps, s: SujetAccorde, a: Negation): [string, string][] {
  const aux = auxiliaire(v, s.personne);
  const part = participeAccorde(v, s);
  const ne = neDevant(aux);
  const list: [string, string][] = [
    [`${ne}${aux} ${part} ${a}`, `« ${a} » se place avant le participe passé, juste après l’auxiliaire.`],
    [`${aux} ${a} ${part}`, 'À l’écrit, n’oublie pas « ne » ou « n’ ».'],
    [
      ne === 'n’' ? `ne ${aux} ${a} ${part}` : `n’${aux} ${a} ${part}`,
      ne === 'n’' ? 'Devant une voyelle, « ne » devient « n’ ».' : 'Devant une consonne, on écrit « ne » en entier.',
    ],
    [`${a} ${ne}${aux} ${part}`, `« ${a} » vient après l’auxiliaire, pas avant.`],
  ];
  if (a !== 'pas') list.push([`${ne}${aux} pas ${part}`, `On demande « ne … ${a} », pas « ne … pas ».`]);
  return list;
}

const consigne = (a: Negation) => `Mets à la forme négative avec « ne … ${a} »`;

function choisirNegation(rng: Rng, level: 1 | 2): QuestionDraft {
  const v = rng.pick([...REGULIERS, 'aller', 'venir'] as const);
  const s = sujetPour(rng, v, PRONOMS_SIMPLES);
  const a = level === 1 ? 'pas' : rng.pick(ADVERBES);
  const phrase = (gv: string) => `${s.texte} ${gv} ${FINS[v]}.`;
  const bon = phraseNegative(s, v, a);
  const pieges = piegesNegation(v, s, a);
  const choisis =
    level === 1
      ? [at(pieges, 0), [passeCompose(v, s), 'La phrase est restée positive : il manque la négation.'] as const]
      : pieges.slice(0, 3);
  const { answer, traps } = choice(
    rng,
    bon,
    choisis.map(([gv, why]) => ({ label: phrase(gv), why })),
  );
  return {
    prompt: `${consigne(a)} : « ${phrasePositive(s, v)} » Quelle phrase est juste ?`,
    answer,
    traps,
    hint: 'Trouve l’auxiliaire. Les deux mots de la négation l’entourent.',
    steps: [...etapesNegation(v, s, a), `On écrit **${bon}**`],
  };
}

function ordonner(rng: Rng): QuestionDraft {
  const v = rng.pick(REGULIERS);
  const s = rng.pick(PRONOMS_SIMPLES);
  const aux = auxiliaire(v, s.personne);
  const juste = [s.texte, neDevant(aux).trim(), aux, 'pas', participe(v), `${FINS[v]}.`];
  // Jamais présentés dans l'ordre : rotation d'un mélange quand le tirage retombe juste.
  const melange = rng.shuffle(juste.map((_, i) => i));
  const presente = melange.every((x, i) => x === i) ? melange.map((_, i) => (i + 1) % juste.length) : melange;
  const items = presente.map((i) => at(juste, i));
  return {
    prompt: `${consigne('pas')} : « ${phrasePositive(s, v)} » Remets les étiquettes dans l’ordre.`,
    answer: { kind: 'order', items, correct: juste.map((_, i) => presente.indexOf(i)) },
    hint: 'Place d’abord le sujet. La négation entoure ensuite l’auxiliaire.',
    steps: [...etapesNegation(v, s, 'pas'), `On écrit **${phraseNegative(s, v, 'pas')}**`],
  };
}

function ecrireNegation({ sujet: s, verbe: v }: Ligne<SujetAccorde>, a: Negation): QuestionDraft {
  const pieges: [string, string][] = [
    ...piegesNegation(v, s, a),
    [passeCompose(v, s), 'La phrase est restée positive : il manque la négation.'],
  ];
  return saisie(s, negatif(v, s, a), pieges, {
    prompt: `${consigne(a)} : « ${phrasePositive(s, v)} » Complète : « ${s.texte} … ${FINS[v]}. »`,
    hint: 'Écris tout le verbe : la négation entoure l’auxiliaire.',
    steps: [...etapesNegation(v, s, a), `On écrit **${phraseNegative(s, v, a)}**`],
  });
}

function negationDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
    case 2:
      return choisirNegation(rng, level);
    case 3: {
      if (rng.int(0, 1) === 0) return ordonner(rng);
      return ecrireNegation({ sujet: rng.pick(PRONOMS_SIMPLES), verbe: rng.pick(REGULIERS) }, 'pas');
    }
    case 4: {
      const verbe = rng.pick(IRREGULIERS_CITES);
      return ecrireNegation({ sujet: sujetPour(rng, verbe, SANS_JE), verbe }, rng.pick(['jamais', 'plus'] as const));
    }
    default: {
      const adverbes = rng.shuffle([...ADVERBES, rng.pick(ADVERBES)]);
      return texteATrous(
        'Lis le texte. Écris chaque verbe au passé composé, à la forme négative demandée.',
        'Carnet de bord',
        lignesComposees(rng).map(({ sujet: s, verbe: v }, i) => {
          const a = at(adverbes, i);
          return {
            texte: `${s.texte} … (${v}, ne … ${a}) ${FINS[v]}.`,
            attendu: negatif(v, s, a),
            pourquoi: `« ${v} » prend « ${auxiliaireDe(v)} », entouré par la négation : « ${negatif(v, s, a)} ».`,
          };
        }),
        'Conjugue d’abord au passé composé, puis entoure l’auxiliaire.',
        [DEF_COMPOSE, DEF_NEGATION],
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
    sources: sourcesTemps([n.factId, ...n.faits], VERBES_TEMPS),
  },
  generate: n.generate,
});

export const FCM1_TEMPS: readonly Skill[] = [
  skill({
    id: 'fcm1-imparfait',
    title: 'L’imparfait',
    memo: [
      'L’**imparfait** raconte le passé : « autrefois, je chantais ».',
      'Sa **marque de temps** : -ai- (je chantais, ils chantaient) ou -i- (nous chantions, vous chantiez).',
    ],
    factId: 'marques-temps',
    faits: ['marques-personne', 'a-memoriser', 'marque-ai', 'cedille', 'g-doux'],
    generate: draftSimple('imparfait'),
  }),
  skill({
    id: 'fcm1-futur',
    title: 'Le futur',
    memo: [
      'Le **futur** dit ce qui arrivera : « demain, je chanterai ».',
      'Sa **marque de temps** est -r-. Puis vient la **marque de personne** : -ai, -as, -a, -ons, -ez, -ont.',
    ],
    factId: 'marques-temps',
    faits: ['marques-personne', 'a-memoriser'],
    generate: draftSimple('futur'),
  }),
  skill({
    id: 'fcm1-passe-compose',
    title: 'Le passé composé',
    memo: [
      'Le **passé composé** a deux mots : l’**auxiliaire** au présent + le **participe passé**.',
      'Tu as chanté. Elle est allée : avec « être », le participe passé s’accorde avec le sujet.',
    ],
    factId: 'composition',
    faits: ['temps-composes', 'exemples-composes', 'auxiliaires', 'accord-etre', 'a-memoriser'],
    generate: composeDraft,
  }),
  skill({
    id: 'fcm1-infinitif-participe',
    title: 'Retrouver l’infinitif d’un participe passé',
    memo: [
      'L’**infinitif** est le nom du verbe : chanter, finir, prendre.',
      'Dans « tu as pris », « pris » est le **participe passé**. Dis « il faut… » : il faut prendre.',
    ],
    factId: 'composition',
    faits: ['participe-forme', 'temps-composes', 'a-memoriser'],
    generate: infinitifDraft,
  }),
  skill({
    id: 'fcm1-passe-compose-negatif',
    title: 'Le passé composé à la forme négative',
    memo: [
      'À la **forme négative**, la négation entoure l’**auxiliaire** : tu n’as pas chanté.',
      'Même place avec « ne … jamais » et « ne … plus » : elle n’est jamais venue.',
    ],
    factId: 'negation',
    faits: ['ne-auxiliaire', 'ne-elision', 'jamais', 'forme-negative', 'composition'],
    generate: negationDraft,
  }),
];
