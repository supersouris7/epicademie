import { choice, type Option } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import { document, pickN, textTraps } from './outils.ts';
import { associer, ecrire, initiale, texteAChoix } from './vocabulaire.ts';
import {
  EXPRESSIONS,
  FAMILLES,
  FAITS_AUTRES_REPONSES,
  FAITS_PREFIXES,
  FAUX_PREFIXES,
  FEMININS,
  GROUPES,
  PAIRES,
  PREFIXES,
  SENS_PREFIXE,
  SUFFIXES,
  faitVocabulaireCm2,
  sourcesVocabulaireCm2,
  type Expression,
  type Famille,
  type Groupe,
  type Intrus,
  type Membre,
  type Paire,
  type Prefixe,
  type Prefixe_,
  type Suffixe,
} from './vocabulaire-cm2.donnees.ts';

/**
 * Chapitre « Vocabulaire » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025), vocabulaire :
 * « Approfondir les relations morphologiques et sémantiques entre les mots ».
 */
/** Citations tirées des principes communs au cycle (et non des objectifs du cours moyen). */
const PRINCIPES_DU_CYCLE = ['v2-prog-generique', 'v2-prog-expressions'];
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), ${PRINCIPES_DU_CYCLE.includes(id) ? 'points de vigilance du cycle' : 'cours moyen'} — « ${faitVocabulaireCm2(id).citation} »`;

/** Au plus `n` éléments tirés au hasard, jamais deux « confondables » ensemble. */
function sansDoublon<T>(rng: Rng, items: readonly T[], n: number, confondus: (a: T, b: T) => boolean): T[] {
  const choisis: T[] = [];
  for (const x of rng.shuffle(items)) {
    if (choisis.length < n && !choisis.some((y) => confondus(x, y))) choisis.push(x);
  }
  return choisis;
}

/** Texte à compléter : un mot à écrire sur chaque ligne. */
function texteAEcrire(
  q: { prompt: string; titre: string; hint: string; etape: string },
  lignes: readonly { readonly texte: string; readonly bon: string; readonly pourquoi: string }[],
): QuestionDraft {
  return {
    prompt: q.prompt,
    figure: document(
      q.titre,
      lignes.map((l) => l.texte),
    ),
    answer: {
      kind: 'cloze',
      parts: [...lignes.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
      blanks: lignes.map((l) => ({ mode: 'text' as const, accepted: [l.bon] })),
    },
    hint: q.hint,
    steps: [
      q.etape,
      ...lignes.map((l, i) => `Ligne ${i + 1} : ${l.pourquoi}`),
      `Réponses : **${lignes.map((l) => l.bon).join(', ')}**.`,
    ],
  };
}

// ───────────────────────── 1. Familles de mots ─────────────────────────

const DEF_FAMILLE =
  'Une **famille de mots** réunit des mots formés sur le même **radical** : leur sens est lié à un mot simple.';

interface Parent {
  readonly famille: Famille;
  readonly membre: Membre;
}
const PARENTS: readonly Parent[] = FAMILLES.flatMap((famille) =>
  famille.membres.map((membre) => ({ famille, membre })),
);
const AVEC_INTRUS = FAMILLES.filter((f) => f.intrus !== undefined);
const lien = ({ famille, membre }: Parent) => `« ${membre.mot} » est de la famille de « ${famille.base} ».`;

const intrusDe = (f: Famille): Intrus => {
  if (!f.intrus) throw new RangeError(`famille sans intrus : ${f.base}`);
  return f.intrus;
};

function trouverParent(rng: Rng, n: 3 | 4): QuestionDraft {
  const famille = rng.pick(n === 4 ? AVEC_INTRUS : FAMILLES);
  const membre = rng.pick(famille.membres);
  const etrangers: Option[] = pickN(
    rng,
    PARENTS.filter((p) => p.famille !== famille),
    n - 1,
  ).map((p) => ({ label: p.membre.mot, why: `${lien(p)} C’est une autre famille.` }));
  const autres: Option[] =
    n === 4 ? [{ label: intrusDe(famille).mot, why: intrusDe(famille).pourquoi }, ...etrangers.slice(0, 2)] : etrangers;
  const { answer, traps } = choice(rng, membre.mot, autres);
  return {
    prompt: `Quel mot est de la même famille que « ${famille.base} » ?`,
    answer,
    traps,
    hint: 'Cherche un mot dont le sens est lié. Se ressembler ne suffit pas.',
    steps: [DEF_FAMILLE, lien({ famille, membre }), `La bonne réponse est **${membre.mot}**.`],
  };
}

function ecrireBase({ famille, membre }: Parent): QuestionDraft {
  const pieges: (readonly [string, string])[] = [
    [membre.mot, 'Tu as recopié le mot. Cherche le mot simple caché dedans.'],
    ...famille.membres
      .filter((m) => m !== membre)
      .map((m) => [m.mot, `« ${m.mot} » est de la famille, mais ce n’est pas le mot simple.`] as const),
    ...(famille.intrus ? [[famille.intrus.mot, famille.intrus.pourquoi] as const] : []),
    ...(membre.mot === 'reboiser' || membre.mot === 'déboisement'
      ? [['boiser', 'Va plus loin : quel mot encore plus court reconnais-tu ?'] as const]
      : []),
  ];
  if (membre.mot === 'déboisement')
    pieges.push(['déboiser', 'Va plus loin : quel mot encore plus court reconnais-tu ?']);
  if (membre.mot === 'floral') pieges.push(['flore', '« Flore » est un autre mot. Le mot simple ici est « fleur ».']);
  const aussi = membre.aussi ?? [];
  return ecrire([famille.base, ...aussi], pieges, {
    prompt: `Écris le mot simple de la famille de « ${membre.mot} ».`,
    hint: 'Enlève ce qui est ajouté au début ou à la fin. Le radical peut changer un peu.',
    steps: [
      DEF_FAMILLE,
      lien({ famille, membre }),
      ...aussi.map((mot) => `Le verbe « ${mot} » est aussi accepté.`),
      `Le mot simple est **${famille.base}**.`,
    ],
  });
}

function associerFamilles(rng: Rng, n: 3 | 5): QuestionDraft {
  const choisis = pickN(rng, FAMILLES, n).map((famille) => ({ famille, membre: rng.pick(famille.membres) }));
  return associer(
    rng,
    `Associe chaque mot (${choisis.map((p) => p.membre.mot).join(', ')}) au mot simple de sa famille.`,
    choisis.map((p) => [p.membre.mot, p.famille.base]),
    'Commence par les mots où le mot simple se voit bien.',
    [DEF_FAMILLE, ...choisis.map(lien)],
  );
}

function enqueteFamilles(rng: Rng): QuestionDraft {
  const [a, b] = pickN(rng, AVEC_INTRUS, 2) as [Famille, Famille];
  const options = [`famille de « ${a.base} »`, `famille de « ${b.base} »`, 'aucune des deux'];
  const bonne = (f: Famille) => (f === a ? 0 : 1);
  const lignes = rng.shuffle([
    ...pickN(rng, a.membres, 2).map((membre) => ({
      phrase: membre.phrase,
      correct: bonne(a),
      pourquoi: lien({ famille: a, membre }),
    })),
    ...pickN(rng, b.membres, 1).map((membre) => ({
      phrase: membre.phrase,
      correct: bonne(b),
      pourquoi: lien({ famille: b, membre }),
    })),
    { phrase: intrusDe(a).phrase, correct: 2, pourquoi: intrusDe(a).pourquoi },
  ]);
  return {
    prompt: `Lis le texte. À quelle famille appartient chaque mot entre guillemets : « ${a.base} », « ${b.base} » ou aucune ?`,
    figure: document(
      'L’enquête des familles',
      lignes.map((l) => l.phrase),
    ),
    answer: {
      kind: 'cloze',
      parts: [...lignes.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
      blanks: lignes.map((l) => ({ mode: 'list' as const, options, correct: l.correct })),
    },
    hint: 'Pour chaque mot, demande-toi si son sens est lié au mot simple.',
    steps: [
      DEF_FAMILLE,
      ...lignes.map((l, i) => `Ligne ${i + 1} : ${l.pourquoi}`),
      `Réponses : **${lignes.map((l) => options[l.correct]).join(' ; ')}**.`,
    ],
  };
}

function familleDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return trouverParent(rng, 3);
    case 2:
      return rng.int(0, 1) === 0 ? trouverParent(rng, 4) : associerFamilles(rng, 3);
    case 3:
      return ecrireBase(rng.pick(PARENTS.filter((p) => p.membre.visible)));
    case 4:
      return rng.int(0, 1) === 0
        ? ecrireBase(rng.pick(PARENTS.filter((p) => !p.membre.visible)))
        : associerFamilles(rng, 5);
    default:
      return enqueteFamilles(rng);
  }
}

// ───────────────────────── 2. Préfixes ─────────────────────────

const DEF_PREFIXE = 'Un **préfixe** s’ajoute au début d’un mot. Il change son sens.';
const decoupePrefixe = (p: Prefixe_) => `« ${p.mot} », c’est « ${p.prefixe} » + « ${p.base} » : ${p.definition}.`;
const lettresDe = (forme: string) => forme.replace('-', '');
const negatif = (p: Prefixe) => p === 'in-' || p === 'im-';
const TOUS_PREFIXES: readonly Prefixe[] = ['re-', 'dé-', 'in-', 'im-'];
const regleDe = (p: Prefixe) =>
  p === 'im-'
    ? 'Devant « m », « b » ou « p », le préfixe « in- » s’écrit « im- ».'
    : `« ${p} » veut dire : ${SENS_PREFIXE[p]}.`;

function sensPrefixe(rng: Rng): QuestionDraft {
  const p = rng.pick(PREFIXES);
  const autre = p.prefixe === 're-' ? SENS_PREFIXE['dé-'] : SENS_PREFIXE['re-'];
  const { answer, traps } = choice(rng, SENS_PREFIXE[p.prefixe], [
    { label: 'avant', why: `« Avant » est le sens de « pré- », pas de « ${p.prefixe} ».` },
    { label: autre, why: `Ce n’est pas le sens de « ${p.prefixe} » dans « ${p.mot} ».` },
  ]);
  return {
    prompt: `Dans « ${p.mot} », formé sur « ${p.base} », que veut dire « ${p.prefixe} » ?`,
    answer,
    traps,
    hint: `Compare « ${p.base} » et « ${p.mot} ». Qu’est-ce qui change dans le sens ?`,
    steps: [DEF_PREFIXE, decoupePrefixe(p), `Ici, « ${p.prefixe} » veut dire **${SENS_PREFIXE[p.prefixe]}**.`],
  };
}

function choisirPrefixe(rng: Rng): QuestionDraft {
  const p = rng.pick(PREFIXES);
  const { answer, traps } = choice(
    rng,
    p.prefixe,
    TOUS_PREFIXES.filter((x) => x !== p.prefixe).map((x) => ({
      label: x,
      why: `Avec « ${x} », tu n’obtiens pas le bon mot. On dit « ${p.mot} ».`,
    })),
  );
  return {
    prompt: `Quel préfixe ajoutes-tu à « ${p.base} » pour obtenir ce sens : ${p.definition} ?`,
    answer,
    traps,
    hint: 'Essaie chaque préfixe à voix haute. Lequel donne un vrai mot avec ce sens ?',
    steps: [DEF_PREFIXE, regleDe(p.prefixe), decoupePrefixe(p), `La bonne réponse est **${p.prefixe}**.`],
  };
}

function fauxPrefixe(rng: Rng): QuestionDraft {
  const faux = rng.pick(FAUX_PREFIXES);
  const prefixe: Prefixe = faux.mot === 'reptile' ? 're-' : faux.mot === 'image' ? 'im-' : 'in-';
  const vrais = pickN(
    rng,
    PREFIXES.filter((p) => p.prefixe === prefixe),
    3,
  );
  const { answer, traps } = choice(
    rng,
    faux.mot,
    vrais.map((p) => ({ label: p.mot, why: `${decoupePrefixe(p)} Le préfixe est bien là.` })),
  );
  return {
    prompt: `Trouve l’intrus : dans quel mot « ${lettresDe(prefixe)} » n’est-il pas un préfixe ?`,
    answer,
    traps,
    hint: 'Enlève le début du mot. Reste-t-il un mot dont le sens est lié ?',
    steps: [DEF_PREFIXE, faux.pourquoi, `L’intrus est **${faux.mot}**.`],
  };
}

/** Une définition par sens de préfixe : trois mots aux préfixes bien différents. */
function associerPrefixes(rng: Rng, n: 3 | 5): QuestionDraft {
  const choisis =
    n === 3
      ? sansDoublon(rng, PREFIXES, 3, (a, b) => SENS_PREFIXE[a.prefixe] === SENS_PREFIXE[b.prefixe])
      : pickN(rng, PREFIXES, 5);
  return associer(
    rng,
    `Associe chaque mot (${choisis.map((p) => p.mot).join(', ')}) à ${n === 3 ? 'ce que veut dire son préfixe' : 'sa définition'}.`,
    choisis.map((p) => [p.mot, n === 3 ? SENS_PREFIXE[p.prefixe] : p.definition]),
    'Repère le préfixe, puis le mot simple.',
    [DEF_PREFIXE, ...choisis.map(decoupePrefixe)],
  );
}

function piegesPrefixe(p: Prefixe_): [string, string][] {
  return [
    [p.base, `« ${p.base} » est le mot simple. Ajoute un préfixe devant.`],
    ...TOUS_PREFIXES.filter((x) => x !== p.prefixe).map((x): [string, string] => [
      `${lettresDe(x)}${p.base}`,
      p.prefixe === 'im-' && x === 'in-' ? regleDe('im-') : `Avec « ${p.base} », il faut « ${p.prefixe} ».`,
    ]),
  ];
}

function construirePrefixe(p: Prefixe_, guide: boolean): QuestionDraft {
  const prompt = guide
    ? `Avec « ${p.base} » et le préfixe « ${p.prefixe} », écris un seul mot.`
    : negatif(p.prefixe)
      ? `Écris le contraire de « ${p.base} » en ajoutant le préfixe « in- » ou « im- ».`
      : `Avec « ${p.base} » et un préfixe, écris un seul mot qui veut dire : ${p.definition}.`;
  const mal: [string, string][] = negatif(p.prefixe)
    ? [[`mal${p.base}`, 'Ici, on demande le préfixe « in- » ou « im- ».']]
    : [];
  return ecrire([p.mot], [...piegesPrefixe(p), ...mal], {
    prompt,
    hint: guide
      ? 'Colle les deux morceaux, sans espace.'
      : negatif(p.prefixe)
        ? 'Regarde la première lettre du mot simple.'
        : 'Faut-il dire « de nouveau » ou l’action contraire ?',
    steps: [DEF_PREFIXE, regleDe(p.prefixe), decoupePrefixe(p), `On écrit **${p.mot}**.`],
  });
}

function prefixeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return sensPrefixe(rng);
    case 2: {
      const forme = rng.int(0, 2);
      if (forme === 0) return choisirPrefixe(rng);
      return forme === 1 ? fauxPrefixe(rng) : associerPrefixes(rng, 3);
    }
    case 3:
      return construirePrefixe(rng.pick(PREFIXES), true);
    case 4:
      return rng.int(0, 1) === 0 ? construirePrefixe(rng.pick(PREFIXES), false) : associerPrefixes(rng, 5);
    default:
      return texteAEcrire(
        {
          prompt:
            'Lis le texte. Complète chaque ligne avec le mot entre parenthèses et un préfixe : re-, dé-, in- ou im-.',
          titre: 'L’atelier des préfixes',
          hint: 'Sur chaque ligne, faut-il « de nouveau », l’action contraire ou « ne… pas » ?',
          etape: DEF_PREFIXE,
        },
        pickN(rng, PREFIXES, 4).map((p) => ({
          texte: p.phrase.replace('{}', `… (${p.base})`),
          bon: p.mot,
          pourquoi: decoupePrefixe(p),
        })),
      );
  }
}

// ───────────────────────── 3. Suffixes ─────────────────────────

const DEF_SUFFIXE =
  'Un **suffixe** s’ajoute à la fin d’un mot. Il change son sens, et parfois sa **classe grammaticale**.';
const decoupeSuffixe = (s: Suffixe) =>
  `« ${s.mot} » vient de « ${s.base} » avec le suffixe « ${s.suffixe} » : ${s.definition}.`;
const TOUS_SUFFIXES: readonly string[] = [...new Set(SUFFIXES.map((s) => s.suffixe))];
/** Les noms en « -age » ont d'autres formes possibles (nettoiement) : pas de saisie sans suffixe donné. */
const SANS_AIDE = SUFFIXES.filter((s) => s.mot !== 'nettoyage');
/** Sens trop proches pour être proposés ensemble. */
const SENS_VOISINS = (a: string, b: string) => {
  const proches = [SUFFIXES_SENS.maniere, SUFFIXES_SENS.qualite];
  return a === b || (proches.includes(a) && proches.includes(b));
};
const sensDeMot = (mot: string) => {
  const s = SUFFIXES.find((x) => x.mot === mot);
  if (!s) throw new RangeError(`mot sans suffixe : ${mot}`);
  return s.sens;
};
const SUFFIXES_SENS = { maniere: sensDeMot('doucement'), qualite: sensDeMot('dangereux') };

function sensSuffixe(rng: Rng): QuestionDraft {
  const s = rng.pick(SUFFIXES);
  const autres = sansDoublon(
    rng,
    SUFFIXES.filter((x) => !SENS_VOISINS(x.sens, s.sens)),
    2,
    (a, b) => SENS_VOISINS(a.sens, b.sens),
  );
  const { answer, traps } = choice(
    rng,
    s.sens,
    autres.map((a) => ({ label: a.sens, why: `Ce sens est celui de « ${a.suffixe} » (comme dans « ${a.mot} »).` })),
  );
  return {
    prompt: `Dans « ${s.mot} », formé sur « ${s.base} », qu’indique le suffixe « ${s.suffixe} » ?`,
    answer,
    traps,
    hint: `Compare « ${s.base} » et « ${s.mot} ». Qu’est-ce qui change dans le sens ?`,
    steps: [DEF_SUFFIXE, decoupeSuffixe(s), `La bonne réponse est **${s.sens}**.`],
  };
}

function repererSuffixe(rng: Rng): QuestionDraft {
  const s = rng.pick(SUFFIXES);
  const autres = pickN(
    rng,
    TOUS_SUFFIXES.filter((x) => x !== s.suffixe && !s.mot.endsWith(lettresDe(x))),
    2,
  ).map((x) => ({ label: x, why: `« ${s.mot} » ne se termine pas par « ${x} ».` }));
  const { answer, traps } = choice(rng, s.suffixe, [
    { label: s.base, why: `« ${s.base} » est le mot simple, pas le morceau ajouté.` },
    ...autres,
  ]);
  return {
    prompt: `Quel suffixe a-t-on ajouté pour former « ${s.mot} » à partir de « ${s.base} » ?`,
    answer,
    traps,
    hint: 'Regarde la fin du mot.',
    steps: [DEF_SUFFIXE, decoupeSuffixe(s), `Le suffixe est **${s.suffixe}**.`],
  };
}

function associerSuffixes(rng: Rng, n: 3 | 5): QuestionDraft {
  const choisis =
    n === 3 ? sansDoublon(rng, SUFFIXES, 3, (a, b) => SENS_VOISINS(a.sens, b.sens)) : pickN(rng, SUFFIXES, 5);
  return associer(
    rng,
    `Associe chaque mot (${choisis.map((s) => s.mot).join(', ')}) à ${n === 3 ? 'ce qu’indique son suffixe' : 'sa définition'}.`,
    choisis.map((s) => [s.mot, n === 3 ? s.sens : s.definition]),
    'Repère le suffixe, puis le mot simple.',
    [DEF_SUFFIXE, ...choisis.map(decoupeSuffixe)],
  );
}

function piegesSuffixe(s: Suffixe): [string, string][] {
  const colle = `${s.base}${lettresDe(s.suffixe)}`;
  return [
    [s.base, `« ${s.base} » est le mot simple. Ajoute un suffixe à la fin.`],
    [colle, 'Attention à la jonction : le mot simple change un peu devant le suffixe.'],
    [s.definition, 'On demande un seul mot.'],
  ];
}

function construireSuffixe(s: Suffixe, guide: boolean): QuestionDraft {
  const feminin = guide ? undefined : FEMININS[s.mot];
  return ecrire(feminin ? [s.mot, feminin] : [s.mot], piegesSuffixe(s), {
    prompt: guide
      ? `Avec « ${s.base} » et le suffixe « ${s.suffixe} », écris : ${s.definition}.`
      : `Écris un seul mot (un ${s.classe}), formé sur « ${s.base} », qui veut dire : ${s.definition}.`,
    hint: guide ? 'Colle les deux morceaux, puis vérifie l’orthographe.' : 'Quel morceau mettre à la fin ?',
    steps: [DEF_SUFFIXE, decoupeSuffixe(s), `On écrit **${s.mot}**${feminin ? ` ou **${feminin}**` : ''}.`],
  });
}

function suffixeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return sensSuffixe(rng);
    case 2:
      return rng.int(0, 1) === 0 ? repererSuffixe(rng) : associerSuffixes(rng, 3);
    case 3:
      return construireSuffixe(rng.pick(SUFFIXES), true);
    case 4:
      return rng.int(0, 1) === 0 ? construireSuffixe(rng.pick(SANS_AIDE), false) : associerSuffixes(rng, 5);
    default:
      return texteAEcrire(
        {
          prompt: 'Lis le texte. Complète chaque ligne avec un mot à suffixe, formé sur le mot entre parenthèses.',
          titre: 'La fabrique des mots',
          hint: 'Sur chaque ligne, cherche le sens : petit, personne, manière, lieu, arbre… ?',
          etape: DEF_SUFFIXE,
        },
        pickN(rng, SANS_AIDE, 4).map((s) => ({
          texte: s.phrase.replace('{}', `… (${s.base})`),
          bon: s.mot,
          pourquoi: decoupeSuffixe(s),
        })),
      );
  }
}

// ───────────────────────── 4. Synonymes et antonymes ─────────────────────────

const DEF_RELATION = {
  synonyme: 'Un **synonyme** a un sens proche. Il garde la même **classe grammaticale**.',
  antonyme: 'Un **antonyme** a un sens contraire. Il garde la même **classe grammaticale**.',
} as const;
const unDe = { synonyme: 'veut dire presque la même chose que', antonyme: 'est le contraire de' } as const;
/** Mots rares donnés en réponse : leur sens est rappelé dans l'explication. */
const GLOSES: Readonly<Record<string, string>> = {
  prévoyant: ' « Prévoyant » veut dire qui pense à l’avance à ce qui peut arriver.',
  indolent: ' « Indolent » veut dire mou, qui évite l’effort.',
  frêle: ' « Frêle » veut dire mince et peu solide.',
  stimuler: ' « Stimuler » veut dire donner de l’élan.',
  audacieux: ' « Audacieux » veut dire qui ose beaucoup.',
};
const juste = (p: Paire) =>
  `« ${p.reponse} » ${unDe[p.relation]} « ${p.mot} » (deux ${p.classe}s).${GLOSES[p.reponse] ?? ''}`;
/** « du nom », « du verbe », « de l’adjectif ». */
const deLaClasse = (p: Paire) => (p.classe === 'adjectif' ? 'de l’adjectif' : `du ${p.classe}`);
/** Mots sans rapport avec les paires du chapitre, par classe. */
const HORS_SUJET = {
  nom: ['fenêtre', 'chaussure', 'cahier', 'nuage'],
  verbe: ['éternuer', 'repeindre', 'tousser', 'bâiller'],
  adjectif: ['carré', 'violet', 'rond', 'salé'],
} as const;
/** Réponses trop proches pour être proposées dans la même association. */
const CONFONDUS: readonly (readonly string[])[] = [['défaite', 'échec']];
const confondues = (a: Paire, b: Paire) =>
  a.mot === b.mot || a.reponse === b.reponse || CONFONDUS.some((c) => c.includes(a.reponse) && c.includes(b.reponse));
const RARES = new Set(['prévoyant', 'indolent', 'frêle', 'stimuler', 'tapage', 'audacieux', 'menteur', 'lâcheté']);
const COURANTES = PAIRES.filter((p) => !RARES.has(p.reponse));
const DIFFICILES = PAIRES.filter((p) => RARES.has(p.reponse));
/**
 * Autres réponses acceptées, de mêmes initiale et longueur que la réponse principale : citées dans les données
 * (« soutenir », « intrépide ») ou listées par le portail lexical du CNRTL (synonymie, antonymie).
 */
const AUSSI: Readonly<Record<string, readonly string[]>> = {
  'victoire antonyme': ['déroute', 'débâcle'],
  'encourager synonyme': ['soutenir'],
  'monter synonyme': ['grandir', 'grossir'],
  'prudent antonyme': ['intrépide'],
  'fragile synonyme': ['fluet'],
  'fragile antonyme': ['stable'],
};

function optionsDe(rng: Rng, p: Paire, n: 2 | 3): Option[] {
  const hors = rng.shuffle(HORS_SUJET[p.classe]).map((label) => ({
    label,
    why: `« ${label} » n’a pas de rapport avec « ${p.mot} ».`,
  }));
  const opposee = PAIRES.find((x) => x.mot === p.mot && x.relation !== p.relation);
  const contresens: Option[] = opposee
    ? [
        {
          label: opposee.reponse,
          why: `« ${opposee.reponse} » est un ${opposee.relation} : on demande un ${p.relation}.`,
        },
      ]
    : [];
  const [autre, classe] = p.autreClasse;
  const mauvaiseClasse = {
    label: autre,
    why: `« ${autre} » n’a pas la bonne classe : c’est un ${classe}, et « ${p.mot} » est un ${p.classe}.`,
  };
  return (n === 2 ? [...contresens, ...hors] : [mauvaiseClasse, ...contresens, ...hors]).slice(0, n);
}

function choisirMot(rng: Rng, n: 2 | 3): QuestionDraft {
  const p = rng.pick(n === 2 ? COURANTES : PAIRES);
  const { answer, traps } = choice(rng, p.reponse, optionsDe(rng, p, n));
  return {
    prompt: `Quel est un ${p.relation} ${deLaClasse(p)} « ${p.mot} » ?`,
    answer,
    traps,
    hint: 'Cherche un mot de la même classe, puis vérifie le sens.',
    steps: [DEF_RELATION[p.relation], juste(p), `La bonne réponse est **${p.reponse}**.`],
  };
}

function associerPaires(rng: Rng, n: 3 | 5): QuestionDraft {
  const relation = rng.pick(['synonyme', 'antonyme'] as const);
  const choisis = sansDoublon(
    rng,
    PAIRES.filter((p) => p.relation === relation),
    n,
    confondues,
  );
  return associer(
    rng,
    `Associe chaque mot (${choisis.map((p) => p.mot).join(', ')}) à son ${relation}.`,
    choisis.map((p) => [p.mot, p.reponse]),
    'Les deux mots d’une paire ont la même classe.',
    [DEF_RELATION[relation], ...choisis.map(juste)],
  );
}

function ecrirePaire(p: Paire): QuestionDraft {
  const accepted = [p.reponse, ...(AUSSI[`${p.mot} ${p.relation}`] ?? [])];
  const [autre, classe] = p.autreClasse;
  const opposee = PAIRES.find((x) => x.mot === p.mot && x.relation !== p.relation);
  const pieges: (readonly [string, string])[] = [
    [p.mot, 'Tu as recopié le mot de départ.'],
    [autre, `« ${autre} » est un ${classe}. Il faut un ${p.classe}.`],
    ...(opposee ? [[opposee.reponse, `C’est un ${opposee.relation} : on demande un ${p.relation}.`] as const] : []),
  ];
  return ecrire(accepted, pieges, {
    prompt: `Écris un ${p.relation} ${deLaClasse(p)} « ${p.mot} ». ${initiale(p.reponse)}`,
    hint: 'Garde la même classe de mot. Teste ta réponse dans une phrase.',
    steps: [DEF_RELATION[p.relation], juste(p), `On écrit **${p.reponse}**.`],
  });
}

function paireDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return choisirMot(rng, 2);
    case 2:
      return rng.int(0, 1) === 0 ? choisirMot(rng, 3) : associerPaires(rng, 3);
    case 3:
      return ecrirePaire(rng.pick(COURANTES));
    case 4:
      return rng.int(0, 1) === 0 ? ecrirePaire(rng.pick(DIFFICILES)) : associerPaires(rng, 5);
    default: {
      const relation = rng.pick(['synonyme', 'antonyme'] as const);
      return texteAChoix(
        rng,
        {
          prompt: `Lis le texte. Pour chaque ligne, choisis un ${relation} du mot entre guillemets.`,
          titre: relation === 'synonyme' ? 'Les mots voisins' : 'Le monde à l’envers',
          hint: 'La réponse a la même classe que le mot entre guillemets.',
          etapes: [DEF_RELATION[relation]],
        },
        sansDoublon(
          rng,
          PAIRES.filter((p) => p.relation === relation),
          4,
          confondues,
        ).map((p) => ({
          texte: p.phrase.replace('{}', `« ${p.mot} »`),
          bon: p.reponse,
          autres: [p.autreClasse[0], rng.pick(HORS_SUJET[p.classe])],
          pourquoi: juste(p),
        })),
      );
    }
  }
}

// ───────────────────────── 5. Mot générique et mots particuliers ─────────────────────────

const DEF_GENERIQUE =
  'Un **mot générique** rassemble une catégorie. Les **mots particuliers** sont les mots précis rangés dedans.';
const mots = (g: Groupe) => g.particuliers.map((p) => p.mot);
const voisins = (a: Groupe, b: Groupe) => a === b || (a.voisins ?? []).includes(b.generique);
const autresGroupes = (rng: Rng, g: Groupe, n: number) =>
  sansDoublon(
    rng,
    GROUPES.filter((x) => !voisins(x, g)),
    n,
    voisins,
  );
const appartient = (mot: string, g: Groupe) => `« ${mot} » est un mot particulier de « ${g.generique} ».`;
const liste = (xs: readonly string[]) => xs.map((x) => `« ${x} »`).join(', ');

function nommerGroupe(rng: Rng): QuestionDraft {
  const g = rng.pick(GROUPES);
  const trois = pickN(rng, mots(g), 3);
  const { answer, traps } = choice(
    rng,
    g.generique,
    autresGroupes(rng, g, 2).map((x) => ({
      label: x.generique,
      why: `Sous « ${x.generique} », on range par exemple « ${rng.pick(mots(x))} ». Ici, c’est autre chose.`,
    })),
  );
  return {
    prompt: `Quel mot générique rassemble ${liste(trois)} ?`,
    answer,
    traps,
    hint: 'Demande-toi : ce sont tous des… ?',
    steps: [DEF_GENERIQUE, ...trois.map((m) => appartient(m, g)), `La bonne réponse est **${g.generique}**.`],
  };
}

function choisirParticulier(rng: Rng): QuestionDraft {
  const g = rng.pick(GROUPES);
  const [modele, bon] = pickN(rng, mots(g), 2) as [string, string];
  const autres = autresGroupes(rng, g, 3).map((x) => {
    const mot = rng.pick(mots(x));
    return { label: mot, why: appartient(mot, x) };
  });
  const { answer, traps } = choice(rng, bon, autres);
  return {
    prompt: `Quel mot est rangé avec « ${modele} » sous le mot générique « ${g.generique} » ?`,
    answer,
    traps,
    hint: `Pour chaque mot, demande-toi : est-ce un mot de la catégorie « ${g.generique} » ?`,
    steps: [DEF_GENERIQUE, appartient(bon, g), `La bonne réponse est **${bon}**.`],
  };
}

function associerGroupes(rng: Rng, n: 3 | 5): QuestionDraft {
  const choisis = sansDoublon(rng, GROUPES, n, voisins).map((g) => ({ g, mot: rng.pick(mots(g)) }));
  return associer(
    rng,
    `Associe chaque mot particulier (${choisis.map((c) => c.mot).join(', ')}) à son mot générique.`,
    choisis.map((c) => [c.mot, c.g.generique]),
    'Pour chaque mot, complète : « c’est une sorte de… ».',
    [DEF_GENERIQUE, ...choisis.map((c) => appartient(c.mot, c.g))],
  );
}

function ecrireGenerique(rng: Rng): QuestionDraft {
  const g = rng.pick(GROUPES);
  const trois = pickN(rng, mots(g), 3);
  const pieges: (readonly [string, string])[] = trois.map((m) => [
    m,
    `« ${m} » est un mot particulier. Cherche le mot qui rassemble les trois.`,
  ]);
  const larges = g.larges.map((m) => [m, `« ${m} » est trop large. Cherche le mot générique le plus précis.`] as const);
  return ecrire(g.accepte, [...pieges, ...larges], {
    prompt: `Écris le mot générique le plus précis qui rassemble ${liste(trois)}.`,
    hint: 'Complète : « ce sont des… ».',
    steps: [DEF_GENERIQUE, ...trois.map((m) => appartient(m, g)), `Le mot générique est **${g.generique}**.`],
  });
}

function intrusGroupe(rng: Rng): QuestionDraft {
  const g = rng.pick(GROUPES);
  const trois = pickN(rng, mots(g), 3);
  const [x] = autresGroupes(rng, g, 1) as [Groupe];
  const intrus = rng.pick(mots(x));
  const pieges: Trap[] = textTraps(
    [intrus],
    trois.map((m) => [m, `${appartient(m, g)} Ce n’est pas l’intrus.`]),
  );
  return {
    prompt: `Écris l’intrus : ${liste(rng.shuffle([...trois, intrus]))}.`,
    answer: { kind: 'text', accepted: [intrus] },
    traps: pieges,
    hint: 'Trois mots ont le même mot générique. Lequel n’en fait pas partie ?',
    steps: [
      DEF_GENERIQUE,
      `Trois mots sont rangés sous « ${g.generique} ».`,
      appartient(intrus, x),
      `L’intrus est **${intrus}**.`,
    ],
  };
}

const PHRASES_GENERIQUES = [
  (a: string, b: string) => `Sur la liste, Mina lit « ${a} » et « ${b} ».`,
  (a: string, b: string) => `Dans le catalogue, on voit « ${a} » et « ${b} ».`,
  (a: string, b: string) => `Le guide montre « ${a} », puis « ${b} ».`,
  (a: string, b: string) => `Sur son dessin, Noé écrit « ${a} » et « ${b} ».`,
];

function generiqueDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return nommerGroupe(rng);
    case 2:
      return rng.int(0, 1) === 0 ? choisirParticulier(rng) : associerGroupes(rng, 3);
    case 3:
      return ecrireGenerique(rng);
    case 4:
      return rng.int(0, 1) === 0 ? intrusGroupe(rng) : associerGroupes(rng, 5);
    default: {
      const choisis = sansDoublon(rng, GROUPES, 4, voisins);
      return texteAChoix(
        rng,
        {
          prompt:
            'Lis le texte. Pour chaque ligne, choisis le mot générique le plus précis des deux mots entre guillemets.',
          titre: 'Le grand rangement',
          hint: 'Sur chaque ligne, complète : « ce sont des… ».',
          etapes: [DEF_GENERIQUE],
        },
        choisis.map((g, i) => {
          const [a, b] = pickN(rng, mots(g), 2) as [string, string];
          const phrase = PHRASES_GENERIQUES[i % PHRASES_GENERIQUES.length];
          return {
            texte: phrase ? phrase(a, b) : `${a}, ${b}`,
            bon: g.generique,
            autres: autresGroupes(rng, g, 2).map((x) => x.generique),
            pourquoi: `${appartient(a, g)} « ${b} » aussi.`,
          };
        }),
      );
    }
  }
}

// ───────────────────────── 6. Expressions et locutions ─────────────────────────

const DEF_EXPRESSION =
  'Une **expression** ou une **locution** est un groupe de mots. On comprend le groupe entier, pas chaque mot seul.';
const signifie = (e: Expression) => `« ${e.texte} » veut dire : ${e.sens}.`;
/** Deux expressions de sens voisin ne sont jamais proposées ensemble. */
const SENS_VOISINS_EXPRESSIONS: readonly (readonly string[])[] = [['tout à coup', 'sur-le-champ']];
const memeSens = (a: Expression, b: Expression) =>
  a === b || SENS_VOISINS_EXPRESSIONS.some((v) => v.includes(a.texte) && v.includes(b.texte));

const autresSensExpression = (rng: Rng, e: Expression, n: number): Option[] => [
  { label: e.piege[0], why: e.piege[1] },
  ...sansDoublon(
    rng,
    EXPRESSIONS.filter((x) => !memeSens(x, e)),
    n - 1,
    memeSens,
  ).map((x) => ({ label: x.sens, why: `Ce sens est celui de « ${x.texte} ».` })),
];

function choisirSensExpression(rng: Rng, n: 2 | 3): QuestionDraft {
  const e = rng.pick(EXPRESSIONS);
  const { answer, traps } = choice(rng, e.sens, autresSensExpression(rng, e, n));
  return {
    prompt:
      n === 2
        ? `Que veut dire « ${e.texte} » ?`
        : `${e.phrase} Que veut dire ${e.sorte === 'expression' ? 'l’expression' : 'la locution'} entre guillemets ?`,
    answer,
    traps,
    hint: 'Oublie le sens mot à mot. Pense à la situation.',
    steps: [DEF_EXPRESSION, signifie(e), `La bonne réponse est **${e.sens}**.`],
  };
}

function associerExpressions(rng: Rng, n: 3 | 5): QuestionDraft {
  const choisis = sansDoublon(rng, EXPRESSIONS, n, memeSens);
  return associer(
    rng,
    `Associe chaque groupe de mots (${choisis.map((e) => e.texte).join(' ; ')}) à son sens.`,
    choisis.map((e) => [e.texte, e.sens]),
    'Commence par celles que tu as déjà entendues.',
    [DEF_EXPRESSION, ...choisis.map(signifie)],
  );
}

const trouee = (e: Expression) => e.texte.replace(e.trou, '___');

function completer(rng: Rng, e: Expression, aide: boolean): QuestionDraft {
  const accepted = e.trou === 'cœur' ? ['cœur', 'coeur'] : [e.trou];
  const pieges = pickN(
    rng,
    EXPRESSIONS.filter((x) => x.trou !== e.trou),
    2,
  ).map((x) => [x.trou, `« ${x.trou} » appartient à « ${x.texte} ».`] as const);
  const lettre = aide ? ` Le mot commence par « ${e.trou.charAt(0)} ».` : '';
  return ecrire(accepted, pieges, {
    prompt: `Complète : « ${trouee(e)} » veut dire : ${e.sens}.${lettre}`,
    hint: 'Récite le groupe de mots dans ta tête.',
    steps: [DEF_EXPRESSION, signifie(e), `Le mot manquant est **${e.trou}**.`],
  });
}

function expressionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return choisirSensExpression(rng, 2);
    case 2:
      return rng.int(0, 1) === 0 ? choisirSensExpression(rng, 3) : associerExpressions(rng, 3);
    case 3:
      return completer(rng, rng.pick(EXPRESSIONS), true);
    case 4:
      return rng.int(0, 1) === 0 ? completer(rng, rng.pick(EXPRESSIONS), false) : associerExpressions(rng, 5);
    default:
      return texteAChoix(
        rng,
        {
          prompt: 'Lis le texte. Pour chaque ligne, choisis le sens des mots entre guillemets.',
          titre: 'Parler en images',
          hint: 'La phrase autour t’aide à comprendre.',
          etapes: [DEF_EXPRESSION],
        },
        sansDoublon(rng, EXPRESSIONS, 4, memeSens).map((e) => ({
          texte: e.phrase,
          bon: e.sens,
          autres: autresSensExpression(rng, e, 2).map((o) => o.label),
          pourquoi: signifie(e),
        })),
      );
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
    sources: sourcesVocabulaireCm2([n.factId, ...n.faits]),
  },
  generate: n.generate,
});

const faitsDes = (xs: readonly { readonly faitId: string }[]) => xs.map((x) => x.faitId);

export const FCM2_VOCABULAIRE: readonly Skill[] = [
  skill({
    id: 'fcm2-familles-de-mots',
    title: 'Les familles de mots',
    memo: [
      'Une **famille de mots** partage un **radical** : grand, grandir, agrandir.',
      'Le radical peut changer un peu : fleur donne « floral ». Piège : « grange » ne vient pas de « grand » !',
    ],
    factId: 'v2-prog-relations',
    faits: [
      'v2-def-famille',
      'v2-def-radical',
      ...faitsDes(PARENTS.map((p) => p.membre)),
      ...faitsDes(AVEC_INTRUS.map(intrusDe)),
    ],
    generate: familleDraft,
  }),
  skill({
    id: 'fcm2-prefixes',
    title: 'Les préfixes in-, im-, dé-, re-',
    memo: [
      'Un **préfixe** se met devant : « re- » = de nouveau, « dé- » = l’action contraire.',
      '« in- » dit « ne… pas ». Devant m, b ou p, il devient « im- » : impoli.',
    ],
    factId: 'v2-prog-morphologie',
    faits: ['v2-def-prefixe', ...FAITS_PREFIXES, ...faitsDes(PREFIXES), ...faitsDes(FAUX_PREFIXES)],
    generate: prefixeDraft,
  }),
  skill({
    id: 'fcm2-suffixes',
    title: 'Les suffixes',
    memo: [
      'Un **suffixe** se met derrière : cloche + « -ette » = clochette, une petite cloche.',
      'Il peut changer la **classe grammaticale** : « doux » (adjectif) donne « doucement » (adverbe).',
    ],
    factId: 'v2-prog-morphologie',
    faits: ['v2-def-suffixe', ...faitsDes(SUFFIXES)],
    generate: suffixeDraft,
  }),
  skill({
    id: 'fcm2-synonymes-antonymes',
    title: 'Synonymes et antonymes de même classe',
    memo: [
      'Un **synonyme** a un sens proche, un **antonyme** un sens contraire : victoire, triomphe, défaite.',
      'Garde la même **classe grammaticale** : un nom avec un nom, un verbe avec un verbe.',
    ],
    factId: 'v2-prog-relations',
    faits: ['v2-def-synonyme', 'v2-def-antonyme', ...FAITS_AUTRES_REPONSES, ...faitsDes(PAIRES)],
    generate: paireDraft,
  }),
  skill({
    id: 'fcm2-mot-generique',
    title: 'Mot générique et mots particuliers',
    memo: [
      'Un **mot générique** rassemble : « siège » pour chaise, banc, fauteuil.',
      'Les **mots particuliers** sont précis. Astuce : « une chaise est une sorte de siège ».',
    ],
    factId: 'v2-prog-generique',
    faits: ['v2-prog-relations', ...faitsDes(GROUPES.flatMap((g) => g.particuliers))],
    generate: generiqueDraft,
  }),
  skill({
    id: 'fcm2-expressions-locutions',
    title: 'Expressions et locutions',
    memo: [
      'Une **expression** fait image : « poser un lapin », c’est ne pas venir à un rendez-vous.',
      'Une **locution** agit comme un seul mot : « tout à coup » veut dire « soudain ».',
    ],
    factId: 'v2-prog-expressions',
    faits: ['v2-def-expression', 'v2-def-locution', ...faitsDes(EXPRESSIONS)],
    generate: expressionDraft,
  }),
];
