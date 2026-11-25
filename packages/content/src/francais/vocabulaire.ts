import { choice, type Option } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { at, document, pickN, textTraps } from './outils.ts';
import {
  AFFIXES,
  ANTONYMES,
  CONSTRUITS,
  CONTRAIRES_PREFIXES,
  FAMILLES,
  INCONNUS,
  POLYSEMES,
  POLYSEMES_EXPERTS,
  SYNONYMES,
  faitVocabulaire,
  sourcesVocabulaire,
  type Affixe,
  type Antonyme,
  type Construit,
  type Contraire,
  type Famille,
  type Inconnu,
  type Membre,
  type Polyseme,
  type Sens,
  type Synonyme,
} from './vocabulaire.donnees.ts';

/**
 * Chapitre « Vocabulaire » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025), vocabulaire :
 * « Établir des relations entre les mots », mots inconnus et mots polysémiques.
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitVocabulaire(id).citation} »`;

const parMot = <T extends { readonly mot: string }>(liste: readonly T[], mots: readonly string[]): T[] =>
  liste.filter((x) => mots.includes(x.mot));

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
    steps: [...etapes, `Réponses : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`],
  };
}

interface LigneAChoix {
  readonly texte: string;
  readonly bon: string;
  readonly autres: readonly string[];
  readonly pourquoi: string;
}

/** Texte numéroté : un trou par ligne, choisi dans une liste. */
function texteAChoix(
  rng: Rng,
  { prompt, titre, hint, etapes }: { prompt: string; titre: string; hint: string; etapes: readonly Rich[] },
  lignes: readonly LigneAChoix[],
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
      blanks: lignes.map((l) => {
        const options = rng.shuffle([l.bon, ...l.autres]);
        return { mode: 'list' as const, options, correct: options.indexOf(l.bon) };
      }),
    },
    hint,
    steps: [
      ...etapes,
      ...lignes.map((l, i) => `Ligne ${i + 1} : ${l.pourquoi}`),
      `Réponses : **${lignes.map((l) => l.bon).join(' ; ')}**.`,
    ],
  };
}

/** Saisie : une ou plusieurs écritures justes, pièges expliqués. */
function ecrire(
  accepted: readonly string[],
  pieges: readonly (readonly [string, string])[],
  q: Pick<QuestionDraft, 'prompt' | 'hint' | 'steps'>,
): QuestionDraft {
  return { ...q, answer: { kind: 'text', accepted }, traps: textTraps(accepted, pieges) };
}

const guillemets = (phrase: string, mot: string) => phrase.replace('{}', `« ${mot} »`);
const initiale = (mot: string) => `Il commence par « ${mot.charAt(0)} » et compte ${mot.length} lettres.`;

// ───────────────────────── 1. Synonymes ─────────────────────────

const DEF_SYNONYME = 'Un **synonyme** est un mot de même sens, ou de sens voisin.';
const juste = (s: Synonyme) => `« ${s.syn} » veut dire presque la même chose que « ${s.mot} ».`;
const SYN_COURANTS = parMot(SYNONYMES, [
  'content',
  'triste',
  'terminer',
  'peur',
  'regarder',
  'brave',
  'joli',
  'immense',
  'drôle',
  'habile',
  'craintif',
]);
const SYN_RARES = SYNONYMES.filter((s) => !SYN_COURANTS.includes(s));

const optionsFausses = (s: Synonyme, n: number): Option[] => s.faux.slice(0, n).map(([label, why]) => ({ label, why }));

function synonymeSimple(rng: Rng, s: Synonyme, n: 2 | 3, prompt: string): QuestionDraft {
  const { answer, traps } = choice(rng, s.syn, optionsFausses(s, n));
  return {
    prompt,
    answer,
    traps,
    hint: 'Mets chaque mot à la place dans une petite phrase. Le sens reste-t-il le même ?',
    steps: [DEF_SYNONYME, juste(s), `La bonne réponse est **${s.syn}**.`],
  };
}

function ecrireSynonyme(s: Synonyme): QuestionDraft {
  const pieges: (readonly [string, string])[] = [
    [s.mot, 'Tu as recopié le mot de la phrase. Cherche un autre mot.'],
    ...s.faux.map(([f, why]) => [f, why] as const),
  ];
  return ecrire([s.syn], pieges, {
    prompt: `Écris un synonyme du mot entre guillemets. ${guillemets(s.phrase, s.mot)} ${initiale(s.syn)}`,
    hint: 'Cherche un autre mot qui garde le sens de la phrase.',
    steps: [DEF_SYNONYME, juste(s), `On écrit **${s.syn}**.`],
  });
}

function synonymeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const s = rng.pick(SYNONYMES);
      return synonymeSimple(rng, s, 2, `Quel mot veut dire presque la même chose que « ${s.mot} » ?`);
    }
    case 2: {
      if (rng.int(0, 1) === 0) {
        const choisis = pickN(rng, SYNONYMES, 3);
        return associer(
          rng,
          `Associe chaque mot (${choisis.map((s) => s.mot).join(', ')}) à son synonyme.`,
          choisis.map((s) => [s.mot, s.syn]),
          'Commence par le mot que tu connais le mieux.',
          [DEF_SYNONYME, ...choisis.map(juste)],
        );
      }
      const s = rng.pick(SYNONYMES);
      return synonymeSimple(rng, s, 3, `Lis : ${guillemets(s.phrase, s.mot)} Quel mot peut remplacer « ${s.mot} » ?`);
    }
    case 3:
      return ecrireSynonyme(rng.pick(SYN_COURANTS));
    case 4: {
      if (rng.int(0, 1) === 0) {
        const choisis = pickN(rng, SYNONYMES, 5);
        return associer(
          rng,
          `Cinq paires à trouver ! Associe chaque mot (${choisis.map((s) => s.mot).join(', ')}) à son synonyme.`,
          choisis.map((s) => [s.mot, s.syn]),
          'Place d’abord les paires sûres. Les dernières seront plus faciles.',
          [DEF_SYNONYME, ...choisis.map(juste)],
        );
      }
      return ecrireSynonyme(rng.pick(SYN_RARES));
    }
    default:
      return texteAChoix(
        rng,
        {
          prompt: 'Lis le texte. Pour chaque ligne, choisis le synonyme du mot entre guillemets.',
          titre: 'Au fil des phrases',
          hint: 'Remplace le mot par chaque proposition et relis la phrase.',
          etapes: [DEF_SYNONYME],
        },
        pickN(rng, SYNONYMES, 4).map((s) => ({
          texte: guillemets(s.phrase, s.mot),
          bon: s.syn,
          autres: [s.faux[0][0], s.faux[1][0]],
          pourquoi: juste(s),
        })),
      );
  }
}

// ───────────────────────── 2. Antonymes ─────────────────────────

const DEF_ANTONYME = 'Un **antonyme** est un mot de sens contraire.';
const oppose = (a: Pick<Antonyme, 'mot' | 'contraire'>) => `« ${a.contraire} » est le contraire de « ${a.mot} ».`;
const ANT_COURANTS = parMot(ANTONYMES, [
  'froid',
  'lourd',
  'bas',
  'ouvrir',
  'vide',
  'sale',
  'mou',
  'jeune',
  'long',
  'large',
]);
const ANT_RARES = parMot(ANTONYMES, ['triste', 'méchant', 'reculer', 'clair', 'craintif']);
/** Mots sans rapport avec les paires du chapitre. */
const HORS_SUJET = ['jaune', 'rond', 'salé', 'violet'] as const;

const procheDe = (a: Antonyme): Option => ({
  label: a.proche,
  why: `« ${a.proche} » n’est pas le contraire de « ${a.mot} » : leurs sens ne s’opposent pas.`,
});
const sansRapport = (rng: Rng, a: Antonyme): Option => {
  const label = rng.pick(HORS_SUJET);
  return { label, why: `« ${label} » parle d’autre chose. Ce n’est pas le contraire de « ${a.mot} ».` };
};

/** Autres écritures justes d'un contraire (relevées dans le même article). */
const AUSSI: Readonly<Record<string, readonly string[]>> = { clair: ['sombre'] };

function ecrireContraire(a: Antonyme): QuestionDraft {
  const accepted = [a.contraire, ...(AUSSI[a.mot] ?? [])];
  const lettres = AUSSI[a.mot] ? '' : ` ${initiale(a.contraire)}`;
  return ecrire(
    accepted,
    [
      [a.mot, 'C’est le mot de départ. On veut son contraire.'],
      [a.proche, `« ${a.proche} » n’est pas le contraire de « ${a.mot} ».`],
    ],
    {
      prompt: `Écris le contraire du mot entre guillemets. ${guillemets(a.phrase, a.mot)}${lettres}`,
      hint: 'Imagine la situation tout à l’opposé. Quel mot la décrit ?',
      steps: [DEF_ANTONYME, oppose(a), `On écrit **${a.contraire}**.`],
    },
  );
}

const PREFIXES_CONTRAIRES = ['in', 'im', 'dé'] as const;

function ecrirePrefixe(c: Contraire): QuestionDraft {
  const bon = c.prefixe.replace('-', '');
  return ecrire(
    [c.contraire],
    [
      ...PREFIXES_CONTRAIRES.filter((p) => p !== bon).map(
        (p) => [`${p}${c.mot}`, `Avec « ${c.mot} », le préfixe est « ${c.prefixe} ».`] as const,
      ),
      [c.mot, 'C’est le mot de départ. Ajoute un préfixe au début.'],
    ],
    {
      prompt: `Écris le contraire de « ${c.mot} » avec un préfixe : in-, im- ou dé-.`,
      hint: 'Essaie les préfixes à voix haute. Lequel donne un vrai mot ?',
      steps: [
        DEF_ANTONYME,
        'Un **préfixe** se place au début du mot. Il peut donner le contraire.',
        `Ici, on ajoute « ${c.prefixe} » devant « ${c.mot} ».`,
        `On écrit **${c.contraire}**.`,
      ],
    },
  );
}

function antonymeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
    case 2: {
      if (level === 2 && rng.int(0, 1) === 0) {
        const choisis = pickN(rng, ANTONYMES, 3);
        return associer(
          rng,
          `Associe chaque mot (${choisis.map((a) => a.mot).join(', ')}) à son contraire.`,
          choisis.map((a) => [a.mot, a.contraire]),
          'Pour chaque mot, imagine tout l’opposé.',
          [DEF_ANTONYME, ...choisis.map(oppose)],
        );
      }
      const a = rng.pick(level === 1 ? ANT_COURANTS : ANTONYMES);
      const autres = [procheDe(a), sansRapport(rng, a)];
      if (level === 2) autres.push({ label: a.mot, why: 'C’est le même mot : il ne peut pas dire le contraire.' });
      const { answer, traps } = choice(rng, a.contraire, autres);
      return {
        prompt:
          level === 1
            ? `Quel est le contraire de « ${a.mot} » ?`
            : `Lis : ${guillemets(a.phrase, a.mot)} Quel mot dit le contraire du mot entre guillemets ?`,
        answer,
        traps,
        hint: 'Cherche le mot qui s’oppose, pas celui qui ressemble.',
        steps: [DEF_ANTONYME, oppose(a), `La bonne réponse est **${a.contraire}**.`],
      };
    }
    case 3:
      return ecrireContraire(rng.pick(ANT_COURANTS));
    case 4:
      return rng.int(0, 1) === 0 ? ecrirePrefixe(rng.pick(CONTRAIRES_PREFIXES)) : ecrireContraire(rng.pick(ANT_RARES));
    default:
      return texteAChoix(
        rng,
        {
          prompt: 'Lis le texte. Pour chaque ligne, choisis le contraire du mot entre guillemets.',
          titre: 'Le monde à l’envers',
          hint: 'Imagine la phrase tout à l’opposé.',
          etapes: [DEF_ANTONYME],
        },
        pickN(rng, ANTONYMES, 4).map((a) => ({
          texte: guillemets(a.phrase, a.mot),
          bon: a.contraire,
          autres: [a.proche, a.mot],
          pourquoi: oppose(a),
        })),
      );
  }
}

// ───────────────────────── 3. Familles de mots ─────────────────────────

const DEF_FAMILLE =
  'Une **famille de mots** réunit des mots formés sur le même **radical** : leur sens est lié à un mot simple.';
const lien = (f: Famille, m: Membre) => `« ${m.mot} » vient de la famille de « ${f.base} ».`;

interface Parent {
  readonly famille: Famille;
  readonly membre: Membre;
}
const PARENTS: readonly Parent[] = FAMILLES.flatMap((famille) =>
  famille.membres.map((membre) => ({ famille, membre })),
);
const parents = (mots: readonly string[]) => PARENTS.filter((p) => mots.includes(p.membre.mot));
const FACILES = parents([
  'dentiste',
  'dentier',
  'fleuriste',
  'laitage',
  'laiterie',
  'jardinier',
  'jardinage',
  'lavage',
  'lavoir',
  'sableux',
  'sablier',
  'lentement',
  'lenteur',
]);
const CACHES = parents([
  'enterrer',
  'atterrir',
  'terrasse',
  'souterrain',
  'floraison',
  'ralentir',
  'déranger',
  'arranger',
  'rangement',
  'délaver',
  'ensabler',
]);
const AVEC_INTRUS = FAMILLES.filter((f) => f.intrus !== undefined);

/** Phrase écrite pour chaque mot des familles qui ont un intrus. */
const EXEMPLES: Readonly<Record<string, string>> = {
  lavage: 'Le « lavage » de la voiture est fini.',
  lavoir: 'Autrefois, on frottait le linge au « lavoir ».',
  délaver: 'La pluie peut « délaver » la peinture.',
  lave: 'La « lave » coule du volcan.',
  enterrer: 'Le chien va « enterrer » son os.',
  atterrir: 'L’avion va « atterrir ».',
  terrasse: 'Nous mangeons sur la « terrasse ».',
  souterrain: 'Le train passe dans un « souterrain ».',
  terrible: 'Un orage « terrible » gronde.',
  déranger: 'Je ne veux pas te « déranger ».',
  rangement: 'J’aide au « rangement » de la classe.',
  arranger: 'Il faut « arranger » ce bouquet.',
  orange: 'J’épluche une « orange ».',
  lentement: 'L’escargot avance « lentement ».',
  lenteur: 'Sa « lenteur » me fait rire.',
  ralentir: 'La voiture doit « ralentir ».',
  lentille: 'Il reste une « lentille » dans l’assiette.',
};

const intrusDe = (f: Famille) => {
  if (!f.intrus) throw new RangeError(`famille sans intrus : ${f.base}`);
  return f.intrus;
};

function trouverParent(rng: Rng): QuestionDraft {
  const famille = rng.pick(FAMILLES);
  const membre = rng.pick(famille.membres);
  const etrangers = pickN(
    rng,
    FAMILLES.filter((f) => f !== famille),
    2,
  ).map((f) => {
    const m = rng.pick(f.membres);
    return { label: m.mot, why: `${lien(f, m)} C’est une autre famille.` };
  });
  const autres = famille.intrus
    ? [{ label: famille.intrus.mot, why: famille.intrus.pourquoi }, at(etrangers, 0)]
    : etrangers;
  const { answer, traps } = choice(rng, membre.mot, autres);
  return {
    prompt: `Quel mot est de la même famille que « ${famille.base} » ?`,
    answer,
    traps,
    hint: 'Cherche un mot qui ressemble et dont le sens est lié.',
    steps: [DEF_FAMILLE, lien(famille, membre), `La bonne réponse est **${membre.mot}**.`],
  };
}

function chasserIntrus(rng: Rng): QuestionDraft {
  const famille = rng.pick(AVEC_INTRUS);
  const intrus = intrusDe(famille);
  const membres = pickN(rng, famille.membres, 3);
  const { answer, traps } = choice(
    rng,
    intrus.mot,
    membres.map((m) => ({ label: m.mot, why: `${lien(famille, m)} Ce n’est pas l’intrus.` })),
  );
  return {
    prompt: `Trouve l’intrus : quel mot n’est pas de la famille de « ${famille.base} » ?`,
    answer,
    traps,
    hint: 'Se ressembler ne suffit pas : le sens doit être lié.',
    steps: [DEF_FAMILLE, intrus.pourquoi, `L’intrus est **${intrus.mot}**.`],
  };
}

function ecrireBase({ famille, membre }: Parent): QuestionDraft {
  const accepted = [famille.base, ...(membre.aussi ?? [])];
  const pieges: (readonly [string, string])[] = [
    [membre.mot, 'Tu as recopié le mot. Cherche le mot simple caché dedans.'],
    ...famille.membres
      .filter((m) => m !== membre)
      .map((m) => [m.mot, `« ${m.mot} » est de la famille, mais ce n’est pas le mot simple.`] as const),
    ...(famille.intrus ? [[famille.intrus.mot, famille.intrus.pourquoi] as const] : []),
  ];
  return ecrire(accepted, pieges, {
    prompt: `Écris le mot simple de la famille de « ${membre.mot} ».`,
    hint: 'Enlève ce qui est ajouté au début ou à la fin. Quel petit mot reconnais-tu ?',
    steps: [
      DEF_FAMILLE,
      `Dans « ${membre.mot} », on retrouve le radical d’un mot plus court.`,
      `Le mot simple est **${famille.base}**.`,
    ],
  });
}

function familleDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return trouverParent(rng);
    case 2: {
      if (rng.int(0, 1) === 0) return chasserIntrus(rng);
      const choisis = pickN(rng, FAMILLES, 3).map((famille) => ({ famille, membre: rng.pick(famille.membres) }));
      return associer(
        rng,
        `Associe chaque mot (${choisis.map((p) => p.membre.mot).join(', ')}) au mot simple de sa famille.`,
        choisis.map((p) => [p.membre.mot, p.famille.base]),
        'Cherche le petit mot caché dans chaque mot.',
        [DEF_FAMILLE, ...choisis.map((p) => lien(p.famille, p.membre))],
      );
    }
    case 3:
      return ecrireBase(rng.pick(FACILES));
    case 4: {
      if (rng.int(0, 1) === 0) return ecrireBase(rng.pick(CACHES));
      const choisis = pickN(rng, FAMILLES, 5).map((famille) => ({ famille, membre: rng.pick(famille.membres) }));
      return associer(
        rng,
        `Cinq familles mélangées ! Associe (${choisis.map((p) => p.membre.mot).join(', ')}) au bon mot simple.`,
        choisis.map((p) => [p.membre.mot, p.famille.base]),
        'Commence par les mots où le mot simple se voit bien.',
        [DEF_FAMILLE, ...choisis.map((p) => lien(p.famille, p.membre))],
      );
    }
    default: {
      const famille = rng.pick(AVEC_INTRUS);
      const intrus = intrusDe(famille);
      const lignes = rng.shuffle([
        ...pickN(rng, famille.membres, 3).map((m) => ({
          mot: m.mot,
          bon: 'même famille',
          pourquoi: lien(famille, m),
        })),
        { mot: intrus.mot, bon: 'autre famille', pourquoi: intrus.pourquoi },
      ]);
      return texteAChoix(
        rng,
        {
          prompt: `Lis le texte. Chaque mot entre guillemets est-il de la famille de « ${famille.base} » ?`,
          titre: 'L’enquête des familles',
          hint: 'Pour chaque mot, demande-toi si son sens est lié au mot simple.',
          etapes: [DEF_FAMILLE],
        },
        lignes.map((l) => ({
          texte: EXEMPLES[l.mot] ?? l.mot,
          bon: l.bon,
          autres: [l.bon === 'même famille' ? 'autre famille' : 'même famille'],
          pourquoi: l.pourquoi,
        })),
      );
    }
  }
}

// ───────────────────────── 4. Préfixes et suffixes ─────────────────────────

const DEF_AFFIXES = 'Un **préfixe** s’ajoute au début d’un mot, un **suffixe** à la fin. Ils changent son sens.';
const decoupe = (c: Construit) =>
  `« ${c.mot} » est construit sur « ${c.base} » avec le ${c.affixe.place} « ${c.affixe.forme} ».`;
const TOUS_AFFIXES: readonly Affixe[] = Object.values(AFFIXES);

/** Deux sens trop proches pour être proposés ensemble. */
const VOISINS: readonly (readonly Affixe[])[] = [
  [AFFIXES.de, AFFIXES.in],
  [AFFIXES.eur, AFFIXES.metier, AFFIXES.age],
];
const confondables = (a: Affixe, b: Affixe) => a === b || VOISINS.some((v) => v.includes(a) && v.includes(b));

const contient = (mot: string, a: Affixe) => {
  const lettres = a.forme.replace('-', '');
  return a.place === 'préfixe' ? mot.startsWith(lettres) : mot.endsWith(lettres);
};

const construits = (mots: readonly string[]) => parMot(CONSTRUITS, mots);
const GUIDES = construits([
  'refaire',
  'relire',
  'défaire',
  'maisonnette',
  'fillette',
  'danseur',
  'nageur',
  'mangeable',
  'lavage',
  'jardinier',
  'pommier',
]);
const SANS_AIDE = construits([
  'refaire',
  'relire',
  'défaire',
  'démonter',
  'inconnu',
  'maisonnette',
  'nageur',
  'mangeable',
  'jardinier',
  'pommier',
]);

function sensAffixe(rng: Rng): QuestionDraft {
  const c = rng.pick(CONSTRUITS);
  const autres: Affixe[] = [];
  for (const a of rng.shuffle(TOUS_AFFIXES)) {
    if (autres.length < 2 && !confondables(a, c.affixe) && !autres.some((b) => confondables(a, b))) autres.push(a);
  }
  const { answer, traps } = choice(
    rng,
    c.affixe.sens,
    autres.map((a) => ({ label: a.sens, why: `Ce sens est celui de « ${a.forme} », pas de « ${c.affixe.forme} ».` })),
  );
  return {
    prompt: `Dans « ${c.mot} », formé sur « ${c.base} », que veut dire le ${c.affixe.place} « ${c.affixe.forme} » ?`,
    answer,
    traps,
    hint: `Compare « ${c.base} » et « ${c.mot} ». Qu’est-ce qui a changé dans le sens ?`,
    steps: [DEF_AFFIXES, decoupe(c), `Ici, « ${c.affixe.forme} » veut dire **${c.affixe.sens}**.`],
  };
}

function reperer(rng: Rng): QuestionDraft {
  const c = rng.pick(CONSTRUITS);
  const autres = pickN(
    rng,
    TOUS_AFFIXES.filter((a) => a !== AFFIXES.metier && a !== c.affixe && !contient(c.mot, a)),
    2,
  ).map((a) => ({ label: a.forme, why: `On n’entend pas « ${a.forme} » à cette place dans « ${c.mot} ».` }));
  const { answer, traps } = choice(rng, c.affixe.forme, [
    { label: c.base, why: `« ${c.base} » est le mot simple de départ, pas le morceau ajouté.` },
    ...autres,
  ]);
  return {
    prompt: `Quel ${c.affixe.place} a-t-on ajouté pour former « ${c.mot} » à partir de « ${c.base} » ?`,
    answer,
    traps,
    hint: c.affixe.place === 'préfixe' ? 'Regarde ce qui est placé avant le mot simple.' : 'Regarde la fin du mot.',
    steps: [DEF_AFFIXES, decoupe(c), `Le ${c.affixe.place} est **${c.affixe.forme}**.`],
  };
}

/** Erreurs typiques d'écriture d'un mot construit. */
function piegesConstruit(c: Construit): [string, string][] {
  const list: [string, string][] = [[c.base, `« ${c.base} » est le mot simple. Il faut ajouter un morceau.`]];
  const lettres = c.affixe.forme.replace('-', '');
  if (c.affixe.place === 'suffixe') {
    list.push([`${c.base}${lettres}`, 'Attention à la jonction : le mot simple change un peu devant le suffixe.']);
  } else {
    const autre = lettres === 're' ? 'dé' : 're';
    list.push([`${autre}${c.base}`, `Avec « ${autre}- », le sens change. Relis ce qu’on demande.`]);
  }
  list.push([c.definition, 'On demande un seul mot construit.']);
  return list;
}

function construire(c: Construit, guide: boolean): QuestionDraft {
  const consigne = guide
    ? `Avec « ${c.base} » et le ${c.affixe.place} « ${c.affixe.forme} », écris : ${c.definition}.`
    : `Écris un seul mot, formé sur « ${c.base} », qui veut dire : ${c.definition}.`;
  return ecrire([c.mot], piegesConstruit(c), {
    prompt: consigne,
    hint: guide
      ? 'Colle les deux morceaux, puis vérifie que le mot existe.'
      : 'Faut-il ajouter quelque chose au début ou à la fin ?',
    steps: [DEF_AFFIXES, decoupe(c), `On écrit **${c.mot}**.`],
  });
}

function affixeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return sensAffixe(rng);
    case 2: {
      if (rng.int(0, 1) === 0) return reperer(rng);
      const choisis: Construit[] = [];
      for (const c of rng.shuffle(CONSTRUITS)) {
        if (choisis.length < 3 && !choisis.some((d) => confondables(c.affixe, d.affixe))) choisis.push(c);
      }
      return associer(
        rng,
        `Associe chaque mot (${choisis.map((c) => c.mot).join(', ')}) au sens du morceau ajouté.`,
        choisis.map((c) => [c.mot, c.affixe.sens]),
        'Repère le morceau ajouté au mot simple.',
        [DEF_AFFIXES, ...choisis.map(decoupe)],
      );
    }
    case 3:
      return construire(rng.pick(GUIDES), true);
    case 4:
      return construire(rng.pick(SANS_AIDE), false);
    default: {
      const lignes = pickN(rng, CONSTRUITS, 4);
      return {
        prompt: 'Lis le texte. Complète chaque ligne avec un mot construit sur le mot entre parenthèses.',
        figure: document(
          'Fabrique des mots',
          lignes.map((c) => c.phrase.replace('{}', `… (${c.base})`)),
        ),
        answer: {
          kind: 'cloze',
          parts: [...lignes.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
          blanks: lignes.map((c) => ({ mode: 'text' as const, accepted: [c.mot] })),
        },
        hint: 'Sur chaque ligne, quel préfixe ou suffixe donne le sens attendu ?',
        steps: [
          DEF_AFFIXES,
          ...lignes.map((c, i) => `Ligne ${i + 1} : ${decoupe(c)}`),
          `Réponses : **${lignes.map((c) => c.mot).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. Mots polysémiques ─────────────────────────

const DEF_POLYSEMIE = 'Un **mot polysémique** a plusieurs sens. La phrase autour aide à choisir le bon.';
const TOUS_POLYSEMES: readonly Polyseme[] = [...POLYSEMES, ...POLYSEMES_EXPERTS];
const avecMot = (p: Polyseme, s: Sens) => s.phrase.replace('___', `« ${p.mot} »`);
const sensIci = (p: Polyseme, s: Sens) => `Ici, « ${p.mot} » veut dire : ${s.sens}.`;

/** Propositions fausses : les autres sens du mot, puis des sens d'autres mots. */
function autresSens(rng: Rng, p: Polyseme, s: Sens, n: number): Option[] {
  const memes = p.sens
    .filter((x) => x !== s)
    .map((x) => ({ label: x.sens, why: `C’est un autre sens de « ${p.mot} ». Il ne va pas avec cette phrase.` }));
  const dehors = rng
    .shuffle(TOUS_POLYSEMES.filter((q) => q !== p))
    .map((q) => ({ label: rng.pick(q.sens).sens, why: `Ce sens n’est pas un sens de « ${p.mot} ».` }));
  // Toujours au moins un sens d'un autre mot, pour des propositions bien distinctes.
  return [...memes.slice(0, n - 1), ...dehors].slice(0, n);
}

function choisirSens(rng: Rng, n: 2 | 3): QuestionDraft {
  const p = rng.pick(POLYSEMES);
  const s = rng.pick(p.sens);
  const { answer, traps } = choice(rng, s.sens, autresSens(rng, p, s, n));
  return {
    prompt: `Lis : ${avecMot(p, s)} Que veut dire « ${p.mot} » dans cette phrase ?`,
    answer,
    traps,
    hint: 'Relis les mots autour. De quoi parle la phrase ?',
    steps: [DEF_POLYSEMIE, sensIci(p, s), `La bonne réponse est **${s.sens}**.`],
  };
}

function memeMot(rng: Rng, pool: readonly Polyseme[], lettre: boolean): QuestionDraft {
  const p = rng.pick(pool);
  const [a, b] = pickN(rng, p.sens, 2) as [Sens, Sens];
  const pieges = pickN(
    rng,
    pool.filter((q) => q !== p),
    2,
  ).map((q) => [q.mot, `Essaie « ${q.mot} » dans les deux phrases : il ne convient pas.`] as const);
  const aide = lettre ? ` Il commence par « ${p.mot.charAt(0)} ».` : '';
  return ecrire([p.mot], pieges, {
    prompt: `Quel même mot complète ces deux phrases ? « ${a.phrase} » et « ${b.phrase} »${aide}`,
    hint: 'Trouve des idées pour la première phrase, puis teste-les dans la seconde.',
    steps: [DEF_POLYSEMIE, `Phrase 1 : ${a.sens}.`, `Phrase 2 : ${b.sens}.`, `Le mot est **${p.mot}**.`],
  });
}

function polysemeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return choisirSens(rng, 2);
    case 2: {
      if (rng.int(0, 1) === 0) return choisirSens(rng, 3);
      const p = rng.pick(POLYSEMES.filter((q) => q.sens.length === 3));
      return associer(
        rng,
        `Associe chaque phrase au bon sens du mot « ${p.mot} ».`,
        p.sens.map((s) => [avecMot(p, s), s.sens]),
        'Relis chaque phrase : de quoi parle-t-elle ?',
        [DEF_POLYSEMIE],
      );
    }
    case 3:
      return memeMot(rng, POLYSEMES, true);
    case 4:
      return memeMot(rng, POLYSEMES_EXPERTS, false);
    default: {
      const lignes = rng.shuffle(
        pickN(rng, POLYSEMES_EXPERTS, 2).flatMap((p) => pickN(rng, p.sens, 2).map((s) => ({ p, s }))),
      );
      return texteAChoix(
        rng,
        {
          prompt: 'Lis le texte. Pour chaque ligne, choisis le sens du mot entre guillemets.',
          titre: 'Un mot, plusieurs sens',
          hint: 'Le même mot peut changer de sens d’une ligne à l’autre.',
          etapes: [DEF_POLYSEMIE],
        },
        lignes.map(({ p, s }) => ({
          texte: avecMot(p, s),
          bon: s.sens,
          autres: autresSens(rng, p, s, 2).map((o) => o.label),
          pourquoi: sensIci(p, s),
        })),
      );
    }
  }
}

// ───────────────────────── 6. Sens d'un mot inconnu ─────────────────────────

const DEF_CONTEXTE = 'Le **contexte**, ce sont les mots autour. Ils donnent des indices sur le mot inconnu.';
const aide = (i: Inconnu) => `Les indices : « ${i.indice} ».`;
const veutDire = (i: Inconnu) => `« ${i.mot} » veut dire : ${i.sens}.`;

/** Deux autres propositions proches, écrites pour chaque mot. */
const PROCHES: Readonly<Record<string, readonly [string, string]>> = {
  dérobé: ['rendu', 'cassé'],
  chétif: ['très haut', 'bien fleuri'],
  gravi: ['contourné sans fatigue', 'creusé'],
  dévalé: ['rebondi sur place', 'monté'],
  festin: ['un jeu de fête', 'un repas pris seul'],
  maussade: ['très curieux', 'très bavard'],
  flâner: ['travailler vite', 'faire la course'],
  détalé: ['aboyé', 'attendu sans bouger'],
  averse: ['un brouillard léger', 'un coup de vent sec'],
  brise: ['une forte pluie', 'un bruit sec'],
  's’assoupit': ['se fâche', 'se lève d’un bond'],
  scrute: ['dessine', 'oublie'],
  rassasié: ['assoiffé', 'pressé'],
  faufile: ['se cogne', 's’envole'],
};

const distracteurs = (i: Inconnu): Option[] => {
  const voisins = PROCHES[i.mot] ?? [];
  return [
    { label: i.piege[0], why: i.piege[1] },
    ...voisins.map((label) => ({ label, why: `Les indices ne disent pas cela. Relis : « ${i.indice} ».` })),
  ];
};

function deviner(rng: Rng, n: 2 | 3): QuestionDraft {
  const i = rng.pick(INCONNUS);
  const { answer, traps } = choice(rng, i.sens, distracteurs(i).slice(0, n));
  return {
    prompt: `${n === 2 ? '' : 'Les choix se ressemblent : cherche les indices ! '}« ${i.phrase} » Que veut dire « ${i.mot} » ?`,
    answer,
    traps,
    hint: 'Cherche dans la phrase les mots qui expliquent la situation.',
    steps: [DEF_CONTEXTE, aide(i), `« ${i.mot} » veut dire **${i.sens}**.`],
  };
}

/** Le sens et les indices : la stratégie complète, en deux trous. */
function enqueter(rng: Rng): QuestionDraft {
  const [i, autre] = pickN(rng, INCONNUS, 2) as [Inconnu, Inconnu];
  const sens = rng.shuffle([i.sens, ...distracteurs(i).map((o) => o.label)]);
  const indices = rng.shuffle([i.indice, autre.indice]);
  return {
    prompt: `Mène l’enquête sur « ${i.mot} » : trouve son sens, puis les mots qui t’aident.`,
    figure: document('Le mot mystère', [i.phrase]),
    answer: {
      kind: 'cloze',
      parts: [`« ${i.mot} » veut dire : `, '. Les indices sont : ', '.'],
      blanks: [
        { mode: 'list', options: sens, correct: sens.indexOf(i.sens) },
        { mode: 'list', options: indices, correct: indices.indexOf(i.indice) },
      ],
    },
    hint: 'Relis toute la phrase, avant et après le mot mystère.',
    steps: [DEF_CONTEXTE, aide(i), `Réponses : **${i.sens}** ; indices : **${i.indice}**.`],
  };
}

/** Mots inconnus que l'on comprend grâce au mot simple caché dedans (morphologie). */
const CACHES_EN_CONTEXTE: readonly { readonly mot: string; readonly membre: string; readonly phrase: string }[] = [
  { mot: 'ensablé', membre: 'ensabler', phrase: 'Après la marée, le bateau est ensablé sur la plage.' },
  { mot: 'enterré', membre: 'enterrer', phrase: 'Le pirate a enterré son coffre au pied d’un arbre.' },
  { mot: 'souterrain', membre: 'souterrain', phrase: 'La taupe creuse un long souterrain.' },
  { mot: 'floraison', membre: 'floraison', phrase: 'Au printemps, la floraison des cerisiers est superbe.' },
  { mot: 'laiterie', membre: 'laiterie', phrase: 'À la laiterie, on fabrique du beurre et de la crème.' },
  { mot: 'ralentit', membre: 'ralentir', phrase: 'Près de l’école, le car ralentit.' },
  { mot: 'délavé', membre: 'délaver', phrase: 'Mon vieux pantalon est tout délavé.' },
];

function motCache(rng: Rng): QuestionDraft {
  const c = rng.pick(CACHES_EN_CONTEXTE);
  const p = PARENTS.find((x) => x.membre.mot === c.membre);
  if (!p) throw new RangeError(`mot sans famille : ${c.membre}`);
  const accepted = [p.famille.base];
  return {
    prompt: `« ${c.phrase} » Pour comprendre « ${c.mot} », écris le mot simple caché dedans.`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, [
      [c.mot, 'Tu as recopié le mot. Cherche le petit mot caché dedans.'],
      [c.membre, 'Va plus loin : quel mot encore plus simple reconnais-tu ?'],
    ]),
    hint: 'Enlève le début et la fin du mot. Que reste-t-il ?',
    steps: [
      'Un mot inconnu cache souvent un mot que tu connais.',
      lien(p.famille, p.membre),
      `Le mot simple est **${p.famille.base}**.`,
    ],
  };
}

function associerAuTexte(rng: Rng, n: 3 | 5, titre: string): QuestionDraft {
  const choisis = pickN(rng, INCONNUS, n);
  const q = associer(
    rng,
    `Associe chaque mot (${choisis.map((i) => i.mot).join(', ')}) à son sens, à l’aide du texte.`,
    choisis.map((i) => [i.mot, i.sens]),
    'Relis la phrase de chaque mot dans le texte.',
    [DEF_CONTEXTE, ...choisis.map(aide)],
  );
  return {
    ...q,
    figure: document(
      titre,
      choisis.map((i) => i.phrase),
    ),
  };
}

function inconnuDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return deviner(rng, 2);
    case 2: {
      if (rng.int(0, 1) === 0) return deviner(rng, 3);
      return associerAuTexte(rng, 3, 'Trois mots à découvrir');
    }
    case 3:
      return enqueter(rng);
    case 4: {
      if (rng.int(0, 1) === 0) return motCache(rng);
      return associerAuTexte(rng, 5, 'Cinq mots à découvrir');
    }
    default: {
      const choisis = pickN(rng, INCONNUS, 4);
      return texteAChoix(
        rng,
        {
          prompt: 'Lis le texte. Pour chaque ligne, choisis le sens du mot entre guillemets.',
          titre: 'Le carnet des mots mystères',
          hint: 'Sur chaque ligne, cherche les indices avant de choisir.',
          etapes: [DEF_CONTEXTE],
        },
        choisis.map((i) => ({
          texte: i.phrase.replace(i.mot, `« ${i.mot} »`).replace(capitale(i.mot), `« ${capitale(i.mot)} »`),
          bon: i.sens,
          autres: distracteurs(i)
            .slice(0, 2)
            .map((o) => o.label),
          pourquoi: `${aide(i)} ${veutDire(i)}`,
        })),
      );
    }
  }
}

const capitale = (mot: string) => mot.charAt(0).toUpperCase() + mot.slice(1);

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
    sources: sourcesVocabulaire([n.factId, ...n.faits]),
  },
  generate: n.generate,
});

const faitsDes = (liste: readonly { readonly faitId: string }[]) => liste.map((x) => x.faitId);
const SENS_CITES = TOUS_POLYSEMES.flatMap((p) => p.sens);
const FAITS_FAMILLES = FAMILLES.flatMap((f) => [...faitsDes(f.membres), ...(f.intrus ? [f.intrus.faitId] : [])]);

export const FCM1_VOCABULAIRE: readonly Skill[] = [
  skill({
    id: 'fcm1-synonymes',
    title: 'Les synonymes',
    memo: [
      'Un **synonyme** est un mot de même sens, ou presque : « content » et « satisfait ».',
      'Astuce : remplace le mot dans la phrase. Le sens reste-t-il le même ?',
    ],
    factId: 'prog-synonymie',
    faits: ['def-synonyme', ...faitsDes(SYNONYMES)],
    generate: synonymeDraft,
  }),
  skill({
    id: 'fcm1-antonymes',
    title: 'Les antonymes',
    memo: [
      'Un **antonyme** dit le contraire : « froid » et « chaud ».',
      'Parfois, un **préfixe** suffit : « possible » devient « impossible ».',
    ],
    factId: 'prog-synonymie',
    faits: ['def-antonyme', 'forme-im', 'def-prefixe', ...faitsDes(ANTONYMES), ...faitsDes(CONTRAIRES_PREFIXES)],
    generate: antonymeDraft,
  }),
  skill({
    id: 'fcm1-familles-de-mots',
    title: 'Les familles de mots',
    memo: [
      'Une **famille de mots** partage un même **radical** : dent, dentiste, dentier.',
      'Attention aux faux amis : « terrible » ne vient pas de « terre » !',
    ],
    factId: 'prog-relations',
    faits: ['def-famille', 'def-radical', ...FAITS_FAMILLES],
    generate: familleDraft,
  }),
  skill({
    id: 'fcm1-prefixes-suffixes',
    title: 'Les préfixes et les suffixes',
    memo: [
      'Le **préfixe** se met devant : « re- » + faire = refaire, faire de nouveau.',
      'Le **suffixe** se met derrière : maison + « -ette » = maisonnette, une petite maison.',
    ],
    factId: 'prog-relations',
    faits: ['def-prefixe', 'def-suffixe', ...TOUS_AFFIXES.map((a) => a.faitId), ...faitsDes(CONSTRUITS)],
    generate: affixeDraft,
  }),
  skill({
    id: 'fcm1-mots-polysemiques',
    title: 'Les mots à plusieurs sens',
    memo: [
      'Un **mot polysémique** a plusieurs sens : une « feuille » d’arbre, une « feuille » de papier.',
      'Lis toute la phrase : elle te dit quel sens choisir.',
    ],
    factId: 'prog-polysemie',
    faits: ['def-polysemie', ...faitsDes(SENS_CITES)],
    generate: polysemeDraft,
  }),
  skill({
    id: 'fcm1-sens-contexte',
    title: 'Deviner un mot inconnu',
    memo: [
      'Un mot inconnu ? Observe le **contexte** : les mots autour donnent des indices.',
      'Cherche aussi un mot caché : dans « ensablé », il y a « sable ».',
    ],
    factId: 'prog-inconnus',
    faits: [
      'def-contexte',
      ...faitsDes(INCONNUS),
      ...CACHES_EN_CONTEXTE.map((c) => PARENTS.find((p) => p.membre.mot === c.membre)?.membre.faitId ?? ''),
    ],
    generate: inconnuDraft,
  }),
];
