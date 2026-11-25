import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill, Trap } from '../types.ts';
import {
  ADJECTIFS_ANIMES,
  ADJECTIFS_GN,
  FEMININS,
  NOMS_ANIMES,
  NOMS_SIMPLES,
  PHRASES_PLURIEL,
  PLURIELS_ALS,
  PLURIELS_AUX,
  PLURIELS_EAU,
  PLURIELS_OU_S,
  PLURIELS_OU_X,
  PLURIELS_S,
  SUJETS,
  SUJETS_PARTICIPE,
  SUJETS_PARTICIPE_PIEGES,
  SUJETS_PIEGES,
  VERBES_ER,
  VERBES_ETRE,
  accorderParticipe,
  conjuguer,
  faitAccord,
  sourcesAccords,
  type Adjectif,
  type Feminin,
  type Genre,
  type Nombre,
  type NomSimple,
  type Personne,
  type Pluriel,
  type Regle,
  type SujetAccorde,
} from './accords.donnees.ts';
import { at, document, lowerFirst, pickN, same, textTrap } from './outils.ts';

/**
 * Chapitre « Les accords » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Acquérir l’orthographe grammaticale ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitAccord(id).citation} »`;

const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Pièges écrits, sans doublon ni écriture qui serait une réponse juste. */
function textTraps(accepted: readonly string[], list: readonly (readonly [string, Rich])[]): Trap[] {
  const out: Trap[] = [];
  const seen = [...accepted];
  for (const [text, why] of list) {
    if (seen.some((s) => same(s, text))) continue;
    seen.push(text);
    out.push(textTrap(text, why));
  }
  return out;
}

/** « Ligne 1 : [trou]. Ligne 2 : [trou]. » */
const lignesATrous = (answers: readonly string[]) => ({
  kind: 'cloze' as const,
  parts: [...answers.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
  blanks: answers.map((a) => ({ mode: 'text' as const, accepted: [a] })),
});

// ───────────────────────── Groupes nominaux ─────────────────────────

const GENRES: Record<Genre, string> = { m: 'masculin', f: 'féminin' };
const NOMBRES: Record<Nombre, string> = { sg: 'singulier', pl: 'pluriel' };
const un = (g: Genre) => (g === 'f' ? 'une' : 'un');
const le = (g: Genre, n: Nombre) => (n === 'pl' ? 'les' : g === 'f' ? 'la' : 'le');
const nomAu = (x: NomSimple, n: Nombre) => (n === 'pl' ? `${x.nom}s` : x.nom);
const groupeUn = (x: NomSimple, n: Nombre) => `${n === 'pl' ? 'des' : un(x.genre)} ${nomAu(x, n)}`;
const nomsDe = (g: Genre) => NOMS_SIMPLES.filter((x) => x.genre === g);
const accorderAdj = (a: Adjectif, g: Genre, n: Nombre) => `${a[g]}${n === 'pl' ? 's' : ''}`;

const DEF_GENRE = 'Le genre, c’est masculin (un, le) ou féminin (une, la).';
const DEF_NOMBRE = 'Le nombre, c’est singulier (un seul) ou pluriel (plusieurs).';

// ───────────────────────── 1. Genre et nombre ─────────────────────────

const CATEGORIES: readonly (readonly [Genre, Nombre])[] = [
  ['m', 'sg'],
  ['f', 'sg'],
  ['m', 'pl'],
  ['f', 'pl'],
];
const nomCategorie = (g: Genre, n: Nombre) => `${GENRES[g]} ${NOMBRES[n]}`;

function genreNombreDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      if (rng.int(0, 1) === 0) {
        const [a, b, c] = pickN(rng, NOMS_SIMPLES, 3) as [NomSimple, NomSimple, NomSimple];
        const bon = groupeUn(a, 'pl');
        const { answer, traps } = choice(
          rng,
          bon,
          [b, c].map((x) => ({
            label: groupeUn(x, 'sg'),
            why: `« ${un(x.genre)} » annonce une seule chose : c’est le singulier.`,
          })),
        );
        return {
          prompt: 'Quel groupe est au pluriel ?',
          answer,
          traps,
          hint: 'Cherche le groupe qui parle de plusieurs choses.',
          steps: [DEF_NOMBRE, '« des » annonce plusieurs choses.', `C’est **${bon}**.`],
        };
      }
      const f = rng.pick(nomsDe('f'));
      const ms = pickN(rng, nomsDe('m'), 2);
      const bon = groupeUn(f, 'sg');
      const { answer, traps } = choice(
        rng,
        bon,
        ms.map((x) => ({ label: groupeUn(x, 'sg'), why: '« un » annonce un nom masculin.' })),
      );
      return {
        prompt: 'Quel groupe est au féminin ?',
        answer,
        traps,
        hint: 'Regarde le petit mot devant le nom.',
        steps: [DEF_GENRE, '« une » annonce un nom féminin.', `C’est **${bon}**.`],
      };
    }
    case 2: {
      const x = rng.pick(NOMS_SIMPLES);
      const [g, n] = rng.pick(CATEGORIES.filter(([genre]) => genre === x.genre));
      const groupe = groupeUn(x, n);
      const bon = nomCategorie(g, n);
      const { answer, traps } = choice(
        rng,
        bon,
        CATEGORIES.filter(([cg, cn]) => nomCategorie(cg, cn) !== bon).map(([cg, cn]) => ({
          label: nomCategorie(cg, cn),
          why:
            cg !== g
              ? `Pense au singulier : on dit « ${groupeUn(x, 'sg')} ». Le nom est ${GENRES[g]}.`
              : `Regarde le déterminant : le groupe est au ${NOMBRES[n]}.`,
        })),
      );
      return {
        prompt: `Le groupe « ${groupe} » est…`,
        answer,
        traps,
        hint: 'Demande-toi : dit-on « un » ou « une » ? Y en a-t-il un seul ?',
        steps: [DEF_GENRE, DEF_NOMBRE, `« ${groupe} » est **${bon}**.`],
      };
    }
    case 3: {
      const x = rng.pick(NOMS_SIMPLES);
      const bon = `${x.nom}s`;
      const accepted = [bon, `des ${bon}`];
      return {
        prompt: `Écris au pluriel : « ${groupeUn(x, 'sg')} » → « des … »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [x.nom, 'Il manque la marque du pluriel : ajoute un s.'],
          [`des ${x.nom}`, 'Il manque la marque du pluriel : ajoute un s.'],
          [`${x.nom}x`, 'Ce nom suit la règle ordinaire : il prend un s.'],
          [`${x.nom.replace(/e$/, '')}ent`, '« -ent » est une marque des verbes, pas des noms.'],
        ]),
        hint: 'Quelle lettre ajoute-t-on le plus souvent à un nom au pluriel ?',
        steps: [DEF_NOMBRE, 'La marque ordinaire du pluriel des noms est le **s**.', `On écrit **des ${bon}**.`],
      };
    }
    case 4: {
      const x = rng.pick(NOMS_SIMPLES);
      const bon = groupeUn(x, 'sg');
      const accepted = [bon];
      const autre = x.genre === 'f' ? 'un' : 'une';
      return {
        prompt: `Écris au singulier, avec « un » ou « une » : « des ${x.nom}s »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [`${autre} ${x.nom}`, `Le nom « ${x.nom} » est ${GENRES[x.genre]}.`],
          [`${un(x.genre)} ${x.nom}s`, 'Au singulier, il n’y en a qu’un : enlève le s.'],
          [x.nom, 'N’oublie pas le déterminant « un » ou « une ».'],
        ]),
        hint: 'Le mot « des » ne montre pas le genre. Dis le nom tout seul avec « un », puis avec « une ».',
        steps: [
          '« des » est le même au masculin et au féminin.',
          `Le nom « ${x.nom} » est ${GENRES[x.genre]}.`,
          `On écrit **${bon}**.`,
        ],
      };
    }
    default: {
      const [g, n] = rng.pick(CATEGORIES);
      const k = rng.int(1, 3);
      const bons = pickN(rng, nomsDe(g), k).map((x) => groupeUn(x, n));
      const autres = pickN(rng, NOMS_SIMPLES, NOMS_SIMPLES.length)
        .flatMap((x) =>
          CATEGORIES.filter(([cg, cn]) => cg === x.genre && !(cg === g && cn === n)).map(([, cn]) => [x, cn] as const),
        )
        .slice(0, 5 - k)
        .map(([x, cn]) => groupeUn(x, cn));
      const groupes = rng.shuffle([...bons, ...autres]);
      return {
        prompt: `Lis le texte. Combien de groupes nominaux sont au ${nomCategorie(g, n)} ?`,
        figure: document(
          'Ce que je trouve',
          groupes.map((x) => `Je trouve ${x}.`),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [5, 'Tu as compté tous les groupes. Vérifie le genre et le nombre.'],
          [5 - k, 'Tu as compté les autres groupes. Relis la question.'],
          [k + 1, 'Tu en as un de trop : vérifie à la fois le genre et le nombre.'],
        ]),
        hint: 'Pour chaque ligne, trouve le genre, puis le nombre.',
        steps: [
          DEF_GENRE,
          DEF_NOMBRE,
          `Les groupes au ${nomCategorie(g, n)} : ${bons.map((x) => `« ${x} »`).join(', ')}.`,
          `Il y en a **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Pluriels en -s, -x, -al / -aux ─────────────────────────

const regleDe = (p: Pluriel): string => {
  switch (p.type) {
    case 's':
      return p.s.endsWith('ou')
        ? `« ${p.s} » n’est pas dans la liste des sept noms en -ou qui prennent un x : il prend un **s**.`
        : 'La marque ordinaire du pluriel des noms est le **s**.';
    case 'x':
      return p.fait === 'serie-ou'
        ? 'Sept noms en -ou prennent un **x** : bijou, caillou, chou, genou, hibou, joujou, pou.'
        : `Beaucoup de noms en -eau ou -eu prennent un **x** : « ${p.s} » donne des ${p.p}.`;
    case 'aux':
      return `« ${p.s} » change : -al devient **-aux**.`;
    case 'als':
      return `« ${p.s} » est une exception : il garde -al et prend un **s**.`;
  }
};

/** L'erreur la plus tentante pour ce nom. */
const fauxPluriel = (p: Pluriel): string => {
  switch (p.type) {
    case 's':
      return `${p.s}x`;
    case 'x':
      return `${p.s}s`;
    case 'aux':
      return `${p.s}s`;
    case 'als':
      return `${p.s.slice(0, -2)}aux`;
  }
};

const piegesPluriel = (p: Pluriel): (readonly [string, Rich])[] => {
  const faux: [string, Rich][] = [
    [p.s, 'Il manque la marque du pluriel.'],
    [fauxPluriel(p), regleDe(p)],
  ];
  if (p.type === 'aux')
    faux.push([`${p.s}x`, 'Le « l » disparaît : -al devient -aux.'], [`${p.s.slice(0, -2)}au`, 'Il manque le x.']);
  return faux.flatMap(([t, why]) => [[t, why] as const, [`des ${t}`, why] as const]);
};

function ecrirePluriel(p: Pluriel, hint: string): QuestionDraft {
  const accepted = [p.p, `des ${p.p}`];
  return {
    prompt: `Écris le pluriel : « un ${p.s} » → « des … »`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, piegesPluriel(p)),
    hint,
    steps: ['Regarde la fin du nom au singulier.', regleDe(p), `On écrit **des ${p.p}**.`],
  };
}

function plurielsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(rng.pick([PLURIELS_S, PLURIELS_EAU, PLURIELS_AUX]));
      const { answer, traps } = choice(rng, `des ${p.p}`, [
        { label: `des ${p.s}`, why: 'Il manque la marque du pluriel.' },
        { label: `des ${fauxPluriel(p)}`, why: regleDe(p) },
      ]);
      return {
        prompt: `Quel est le pluriel de « un ${p.s} » ?`,
        answer,
        traps,
        hint: 'Regarde la dernière ou les deux dernières lettres du nom.',
        steps: ['Au pluriel, la fin du nom change.', regleDe(p), `C’est **des ${p.p}**.`],
      };
    }
    case 2: {
      const bon = rng.pick([...PLURIELS_OU_X, ...PLURIELS_EAU]);
      const { answer, traps } = choice(
        rng,
        bon.s,
        pickN(rng, PLURIELS_S, 3).map((x) => ({ label: x.s, why: `« ${x.s} » prend un s : des ${x.p}.` })),
      );
      return {
        prompt: 'Quel nom prend un « x » au pluriel ?',
        answer,
        traps,
        hint: 'Les noms en -eau, en -eu et quelques noms en -ou sont à surveiller.',
        steps: ['La plupart des noms prennent un s.', regleDe(bon), `C’est **${bon.s}** : des ${bon.p}.`],
      };
    }
    case 3:
      return ecrirePluriel(
        rng.pick(rng.pick([PLURIELS_S, PLURIELS_EAU, PLURIELS_AUX])),
        'Le nom finit-il par -al, par -eau, par -eu ? Sinon, pense à la règle ordinaire.',
      );
    case 4:
      return ecrirePluriel(
        rng.pick(rng.pick([PLURIELS_OU_X, PLURIELS_OU_S, PLURIELS_ALS, PLURIELS_AUX])),
        'Attention aux listes à part : quelques noms en -ou et en -al ne font pas comme les autres.',
      );
    default: {
      const tous = [...PLURIELS_AUX, ...PLURIELS_EAU, ...PLURIELS_OU_X, ...PLURIELS_OU_S, ...PLURIELS_ALS];
      const lignes = pickN(rng, PHRASES_PLURIEL, 4).map(([debut, mot, fin]) => {
        const p = tous.find((x) => x.s === mot);
        if (!p) throw new Error(`pluriel inconnu : ${mot}`);
        return { debut, fin, p };
      });
      return {
        prompt: 'Lis le texte. Écris au pluriel le nom entre parenthèses de chaque ligne.',
        figure: document(
          'Carnet de balade',
          lignes.map((l) => `${l.debut} (${l.p.s}) ${l.fin}`),
        ),
        answer: lignesATrous(lignes.map((l) => l.p.p)),
        hint: 'Pour chaque nom, regarde sa fin : -al, -eau, -ou… puis cherche s’il fait partie d’une liste à part.',
        steps: [
          'Les mots « les », « des » ou « deux » annoncent un pluriel.',
          ...new Set(lignes.map((l) => regleDe(l.p))),
          `Réponses : **${lignes.map((l) => l.p.p).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Féminin des noms et des adjectifs ─────────────────────────

const REGLES_FEMININ: Record<Regle, string> = {
  e: 'On ajoute souvent un **e** au masculin.',
  double: 'Ici, on double la dernière consonne et on ajoute un e.',
  ere: 'Ici, la fin -er devient **-ère**.',
  euse: 'Ici, la fin devient **-euse**.',
  trice: 'Ici, -teur devient **-trice**.',
  ve: 'Ici, le -f devient **-ve**.',
  special: 'Ce féminin est particulier : il faut le retenir.',
};

const REGLES_DURES: readonly Regle[] = ['euse', 'trice', 've', 'special'];
const REGLES_SIMPLES: readonly Regle[] = ['e', 'double', 'ere'];
const femininDe = (m: string): Feminin => {
  const x = FEMININS.find((f) => f.m === m);
  if (!x) throw new Error(`féminin inconnu : ${m}`);
  return x;
};

const piegesFeminin = (x: Feminin): (readonly [string, Rich])[] => [
  [x.m, 'C’est le masculin : le mot doit changer.'],
  [`${x.m}e`, `Ajouter seulement un e ne suffit pas. ${REGLES_FEMININ[x.regle]}`],
  [`${x.f}s`, 'Tu as écrit un pluriel. On te demande un seul : pas de s.'],
];

function ecrireFeminin(x: Feminin): QuestionDraft {
  const accepted = [x.f];
  return {
    prompt: `Écris le féminin ${x.nature === 'nom' ? 'du nom' : 'de l’adjectif'} « ${x.m} ».`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, piegesFeminin(x)),
    hint: `Pense au mot avec « une » devant. Écoute sa fin, puis compare avec « ${x.m} ».`,
    steps: [`Je pars du masculin « ${x.m} ».`, REGLES_FEMININ[x.regle], `Le féminin est **${x.f}**.`],
  };
}

function femininDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const x = rng.pick(FEMININS.filter((f) => f.regle === 'e'));
      const { answer, traps } = choice(rng, x.f, [
        { label: x.m, why: 'C’est le masculin.' },
        { label: `${x.m}s`, why: 'Le s marque le pluriel, pas le féminin.' },
      ]);
      return {
        prompt: `Quel est le féminin de « ${x.m} » ?`,
        answer,
        traps,
        hint: 'Quelle lettre marque souvent le féminin ?',
        steps: ['Le féminin va avec « une ».', REGLES_FEMININ.e, `C’est **${x.f}**.`],
      };
    }
    case 2: {
      const x = rng.pick(FEMININS.filter((f) => ['double', 'ere', 'euse', 'trice'].includes(f.regle)));
      const { answer, traps } = choice(rng, x.f, [
        { label: `${x.m}e`, why: REGLES_FEMININ[x.regle] },
        { label: x.m, why: 'C’est le masculin.' },
        { label: `${x.f}s`, why: 'C’est un pluriel : il y en a plusieurs.' },
      ]);
      return {
        prompt:
          x.nature === 'nom'
            ? `Choisis le mot bien écrit : « un ${x.m} » devient « une … » au féminin.`
            : `Choisis le féminin bien écrit de l’adjectif « ${x.m} ».`,
        answer,
        traps,
        hint: 'Regarde bien la fin du mot et compare chaque proposition.',
        steps: [`Je pars de « ${x.m} ».`, REGLES_FEMININ[x.regle], `C’est **${x.f}**.`],
      };
    }
    case 3:
      return ecrireFeminin(rng.pick(FEMININS.filter((f) => REGLES_SIMPLES.includes(f.regle))));
    case 4:
      return ecrireFeminin(rng.pick(FEMININS.filter((f) => REGLES_DURES.includes(f.regle))));
    default: {
      const adjectifs = pickN(rng, ADJECTIFS_ANIMES, 2);
      const paires = pickN(rng, NOMS_ANIMES, 2).map((nom, i) => ({
        nom: femininDe(nom),
        adj: femininDe(at(adjectifs, i)),
      }));
      return {
        prompt: 'Lis le texte. Réécris chaque phrase au féminin : écris le nom, puis l’adjectif.',
        figure: document(
          'Deux portraits',
          paires.map((p) => `Un ${p.nom.m} est ${p.adj.m}.`),
        ),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1 : une ', ' est ', '. Ligne 2 : une ', ' est ', '.'],
          blanks: paires.flatMap((p) => [p.nom.f, p.adj.f]).map((f) => ({ mode: 'text' as const, accepted: [f] })),
        },
        hint: 'Le nom change, et l’adjectif aussi : traite-les un par un.',
        steps: [
          'Au féminin, le nom et son adjectif prennent tous les deux la marque du féminin.',
          ...paires.map((p) => `« ${p.nom.m} » → « ${p.nom.f} » ; « ${p.adj.m} » → « ${p.adj.f} ».`),
          `Les phrases : **${paires.map((p) => `Une ${p.nom.f} est ${p.adj.f}.`).join(' ')}**`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. La chaîne d'accord dans le groupe nominal ─────────────────────────

const DEF_CHAINE = 'Le nom noyau commande : le déterminant et l’adjectif prennent son genre et son nombre.';

const avant = ADJECTIFS_GN.filter((a) => a.place === 'avant');
const apres = ADJECTIFS_GN.filter((a) => a.place === 'apres');

/** Les mots d'un groupe : déterminant, adjectif avant (facultatif), nom, adjectif après. */
const motsGn = (x: NomSimple, n: Nombre, a: Adjectif | undefined, b: Adjectif): string[] => [
  le(x.genre, n),
  ...(a ? [accorderAdj(a, x.genre, n)] : []),
  nomAu(x, n),
  accorderAdj(b, x.genre, n),
];

const autreCategorie = (rng: Rng, g: Genre, n: Nombre) =>
  rng.pick(CATEGORIES.filter(([cg, cn]) => cg !== g || cn !== n));

function accordGnDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const x = rng.pick(NOMS_SIMPLES);
      const a = rng.pick(apres);
      const adj = accorderAdj(a, x.genre, 'pl');
      const bon = `des ${x.nom}s ${adj}`;
      const { answer, traps } = choice(rng, bon, [
        { label: `des ${x.nom}s ${a[x.genre]}`, why: 'L’adjectif doit aussi prendre le s du pluriel.' },
        { label: `des ${x.nom} ${adj}`, why: 'Après « des », le nom prend la marque du pluriel.' },
      ]);
      return {
        prompt: `Le nom « ${x.nom} » est mis au pluriel. Quel groupe est bien accordé ?`,
        answer,
        traps,
        hint: 'Vérifie chaque mot : tous parlent-ils de plusieurs choses ?',
        steps: [DEF_CHAINE, `« ${x.nom} » est ${GENRES[x.genre]}, ici au pluriel.`, `C’est **${bon}**.`],
      };
    }
    case 2: {
      const x = rng.pick(NOMS_SIMPLES);
      const a = rng.pick(avant);
      const g = x.genre;
      const autreG: Genre = g === 'm' ? 'f' : 'm';
      const bon = `les ${accorderAdj(a, g, 'pl')} ${x.nom}s`;
      const { answer, traps } = choice(rng, bon, [
        { label: `les ${a[g]} ${x.nom}s`, why: 'L’adjectif placé avant le nom s’accorde aussi : il manque son s.' },
        {
          label: `les ${accorderAdj(a, autreG, 'pl')} ${x.nom}s`,
          why: `Le nom « ${x.nom} » est ${GENRES[g]} : l’adjectif aussi.`,
        },
        { label: `les ${accorderAdj(a, g, 'pl')} ${x.nom}`, why: 'Le nom doit aussi être au pluriel.' },
      ]);
      return {
        prompt: `Quel groupe est le pluriel bien accordé de « ${le(g, 'sg')} ${a[g]} ${x.nom} » ?`,
        answer,
        traps,
        hint: 'Cherche le genre du nom, puis vérifie chaque mot un par un.',
        steps: [DEF_CHAINE, `« ${x.nom} » est ${GENRES[g]}.`, `C’est **${bon}**.`],
      };
    }
    case 3: {
      const x = rng.pick(NOMS_SIMPLES);
      const a = rng.pick(apres);
      const [, n] = rng.pick(CATEGORIES.filter(([g, cn]) => g === x.genre && !(g === 'm' && cn === 'sg')));
      const bon = accorderAdj(a, x.genre, n);
      const accepted = [bon];
      const groupe = groupeUn(x, n);
      const why = `Le nom « ${nomAu(x, n)} » est ${nomCategorie(x.genre, n)} : l’adjectif doit l’être aussi.`;
      return {
        prompt: `Accorde l’adjectif « ${a.m} » : « ${groupe} … »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          [a.m, a.f, `${a.m}s`, `${a.f}s`].map((t) => [t, why] as const),
        ),
        hint: 'Trouve le genre et le nombre du nom. Ajoute les bonnes marques à l’adjectif.',
        steps: [DEF_CHAINE, `« ${nomAu(x, n)} » est ${nomCategorie(x.genre, n)}.`, `On écrit **${groupe} ${bon}**.`],
      };
    }
    case 4: {
      const x = rng.pick(NOMS_SIMPLES);
      const [g, n] = autreCategorie(rng, x.genre, 'sg');
      // Le nouveau nom donne le genre et le nombre demandés.
      const cible = rng.pick(nomsDe(g).filter((y) => y.nom !== x.nom));
      const a = rng.pick(avant);
      const b = rng.pick(apres);
      const depart = motsGn(x, 'sg', a, b).join(' ');
      const mots = motsGn(cible, n, a, b);
      const bon = mots.join(' ');
      const accepted = [bon];
      const ancien = motsGn(x, 'sg', a, b);
      /** Une erreur par mot : on garde la forme de départ à une seule place. */
      const faux = [0, 1, 3].map(
        (i) =>
          [
            mots.map((m, j) => (i === j ? at(ancien, j) : m)).join(' '),
            `« ${at(ancien, i)} » ne s’accorde pas avec « ${nomAu(cible, n)} ».`,
          ] as const,
      );
      return {
        prompt: `Dans « ${depart} », remplace « ${x.nom} » par « ${nomAu(cible, n)} ». Écris tout le groupe.`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          ...faux,
          [
            `${at(ancien, 0)} ${at(ancien, 1)} ${nomAu(cible, n)} ${at(ancien, 3)}`,
            'Tout le groupe doit suivre le nom.',
          ],
        ]),
        hint: 'Cherche le genre et le nombre du nouveau nom. Puis change chaque mot, un par un.',
        steps: [DEF_CHAINE, `« ${nomAu(cible, n)} » est ${nomCategorie(g, n)}.`, `Le groupe est **${bon}**.`],
      };
    }
    default: {
      const lignes = pickN(rng, NOMS_SIMPLES, 3).map((x) => {
        const a = rng.pick(avant);
        const b = rng.pick(apres);
        const juste = motsGn(x, 'pl', a, b);
        const faux = [le(x.genre, 'sg'), a.m, x.nom, b.m];
        // Une seule erreur par ligne, toujours visible : la forme du singulier au masculin.
        const i = rng.pick([0, 1, 2, 3].filter((k) => at(faux, k) !== at(juste, k)));
        const ecrit = juste.map((m, j) => (j === i ? at(faux, i) : m));
        return { juste: juste.join(' '), ecrit: ecrit.join(' '), nom: x };
      });
      return {
        prompt:
          'Lis le texte. Chaque ligne commence par un groupe au pluriel qui a une erreur. Réécris le groupe corrigé.',
        figure: document(
          'Brouillon à corriger',
          lignes.map((l) => `${maj(l.ecrit)} sont là.`),
        ),
        answer: lignesATrous(lignes.map((l) => l.juste)),
        hint: 'Trouve le nom noyau, son genre et son nombre. Puis contrôle les autres mots.',
        steps: [
          DEF_CHAINE,
          'Le verbe « sont » montre qu’il y en a plusieurs.',
          ...lignes.map((l) => `« ${l.nom.nom} » est ${GENRES[l.nom.genre]} : « ${l.juste} ».`),
          `Les groupes corrigés : **${lignes.map((l) => l.juste).join(' / ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. L'accord sujet-verbe ─────────────────────────

const DEF_SUJET_VERBE = 'Le sujet commande le verbe : trouve le sujet, puis choisis la terminaison.';

const MARQUES: Record<Personne, string> = {
  tu: 'Au présent, avec « tu », un verbe en -er prend **-es**.',
  il: 'Au présent, avec un sujet singulier comme « il » ou « elle », un verbe en -er prend **-e**.',
  nous: 'Au présent, avec « nous », un verbe en -er prend **-ons**.',
  vous: 'Au présent, avec « vous », un verbe en -er prend **-ez**.',
  ils: 'Au présent, avec un sujet pluriel comme « ils » ou « elles », un verbe en -er prend **-ent**.',
};

const PERSONNES: readonly Personne[] = ['tu', 'il', 'nous', 'vous', 'ils'];

const piegesVerbe = (infinitif: string, bonne: Personne): (readonly [string, Rich])[] => [
  ...PERSONNES.filter((p) => p !== bonne).map((p) => [conjuguer(infinitif, p), MARQUES[bonne]] as const),
  [infinitif, 'C’est l’infinitif : le verbe doit être conjugué.'],
];

function sujetVerbeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const s = rng.pick(SUJETS.filter((x) => x.personne === 'il' || x.personne === 'ils'));
      const v = rng.pick(VERBES_ER);
      const bon = conjuguer(v, s.personne);
      const { answer, traps } = choice(
        rng,
        bon,
        (['il', 'ils', 'tu'] as const)
          .filter((p) => p !== s.personne)
          .map((p) => ({ label: conjuguer(v, p), why: MARQUES[s.personne] })),
      );
      return {
        prompt: `Choisis le verbe bien accordé : « ${s.texte} … » (${v}, au présent)`,
        answer,
        traps,
        hint: 'Le sujet désigne-t-il une seule personne ou plusieurs ?',
        steps: [DEF_SUJET_VERBE, MARQUES[s.personne], `On écrit **${s.texte} ${bon}**.`],
      };
    }
    case 2: {
      const v = rng.pick(VERBES_ER);
      const choisis = pickN(rng, PERSONNES, 3).map((p) => rng.pick(SUJETS.filter((s) => s.personne === p)));
      const formes = choisis.map((s) => conjuguer(v, s.personne));
      let droite = rng.shuffle(formes);
      if (droite.every((f, i) => f === formes[i])) droite = [...droite.slice(1), at(droite, 0)];
      return {
        prompt: `Associe chaque sujet (${choisis.map((s) => s.texte).join(', ')}) à la bonne forme du verbe « ${v} » au présent.`,
        answer: {
          kind: 'match',
          left: choisis.map((s) => s.texte),
          right: droite,
          pairs: formes.map((f) => droite.indexOf(f)),
        },
        hint: 'Commence par « nous », « vous » ou « tu » s’ils sont là : leur terminaison se reconnaît vite.',
        steps: [
          DEF_SUJET_VERBE,
          ...choisis.map((s) => MARQUES[s.personne]),
          `Réponses : **${choisis.map((s, i) => `${s.texte} ${at(formes, i)}`).join(', ')}**.`,
        ],
      };
    }
    case 3: {
      const s = rng.pick(SUJETS);
      const v = rng.pick(VERBES_ER);
      const bon = conjuguer(v, s.personne);
      const accepted = [bon, `${s.texte} ${bon}`];
      return {
        prompt: `Écris le verbe « ${v} » au présent : « ${s.texte} … dans la cour. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, piegesVerbe(v, s.personne)),
        hint: 'Repère le sujet, puis rappelle-toi la terminaison qui va avec lui.',
        steps: [DEF_SUJET_VERBE, MARQUES[s.personne], `On écrit **${s.texte} ${bon} dans la cour.**`],
      };
    }
    case 4: {
      const x = rng.pick(SUJETS_PIEGES);
      const bon = conjuguer(x.infinitif, x.personne);
      const accepted = [bon];
      return {
        prompt: `Attention, piège ! Écris le verbe « ${x.infinitif} » au présent : « ${x.debut} … ${x.fin}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [conjuguer(x.infinitif, x.fausse), `${x.raison} ${MARQUES[x.personne]}`],
          ...piegesVerbe(x.infinitif, x.personne),
        ]),
        hint: 'Demande-toi « qui est-ce qui ? » avant le verbe. Le mot juste à côté n’est pas toujours le sujet.',
        steps: [DEF_SUJET_VERBE, x.raison, MARQUES[x.personne], `On écrit **${x.debut} ${bon} ${x.fin}.**`],
      };
    }
    default: {
      const lignes = pickN(rng, SUJETS_PIEGES, 3);
      const justes = lignes.map((x) => conjuguer(x.infinitif, x.personne));
      return {
        prompt: 'Lis le texte. Le verbe de chaque ligne est mal accordé. Écris-le correctement, au présent.',
        figure: document(
          'Texte à corriger',
          lignes.map((x) => `${x.debut} ${conjuguer(x.infinitif, x.fausse)} ${x.fin}.`),
        ),
        answer: lignesATrous(justes),
        hint: 'Sur chaque ligne, cherche d’abord le sujet. Compte : un seul ou plusieurs ?',
        steps: [
          DEF_SUJET_VERBE,
          ...lignes.map((x) => x.raison),
          ...new Set(lignes.map((x) => MARQUES[x.personne])),
          `Les verbes corrigés : **${justes.join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 6. Le participe passé avec être ─────────────────────────

const DEF_PARTICIPE = 'Avec l’auxiliaire être, le participe passé s’accorde avec le sujet.';

const auxiliaire = (n: Nombre) => (n === 'pl' ? 'sont' : 'est');
const analyse = (s: SujetAccorde) => `« ${s.texte} » est ${nomCategorie(s.genre, s.nombre)}.`;
/** L'analyse du sujet, précédée de ce qui la justifie pour un sujet piège. */
const explication = (s: SujetAccorde) => (s.raison ? `${s.raison} ${analyse(s)}` : analyse(s));

const formes = (participe: string) =>
  CATEGORIES.map(([genre, nombre]) => ({ genre, nombre, mot: accorderParticipe(participe, { genre, nombre }) }));

const piegesParticipe = (participe: string, s: SujetAccorde): (readonly [string, Rich])[] =>
  formes(participe)
    .filter((f) => f.genre !== s.genre || f.nombre !== s.nombre)
    .map((f) => [f.mot, `${analyse(s)} « ${f.mot} » serait ${nomCategorie(f.genre, f.nombre)}.`] as const);

function qcmParticipe(rng: Rng, nbFaux: number): QuestionDraft {
  const s = rng.pick(SUJETS_PARTICIPE);
  const v = rng.pick(VERBES_ETRE);
  const bon = accorderParticipe(v.participe, s);
  const { answer, traps } = choice(
    rng,
    bon,
    pickN(rng, piegesParticipe(v.participe, s), nbFaux).map(([label, why]) => ({ label, why })),
  );
  return {
    prompt:
      nbFaux === 2
        ? `Choisis la bonne écriture : « ${s.texte} ${auxiliaire(s.nombre)} … ${v.fin}. »`
        : `Quatre écritures, une seule juste : « ${s.texte} ${auxiliaire(s.nombre)} … ${v.fin}. » (${v.infinitif})`,
    answer,
    traps,
    hint: 'Regarde le sujet : masculin ou féminin ? Un seul ou plusieurs ?',
    steps: [DEF_PARTICIPE, analyse(s), `On écrit **${bon}**.`],
  };
}

function participeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1:
      return qcmParticipe(rng, 2);
    case 2:
      return qcmParticipe(rng, 3);
    case 3:
    case 4: {
      const s = rng.pick(level === 3 ? SUJETS_PARTICIPE : SUJETS_PARTICIPE_PIEGES);
      const v = rng.pick(VERBES_ETRE);
      const bon = accorderParticipe(v.participe, s);
      const accepted = [bon];
      const negation = level === 4;
      // À la forme négative : « n’est pas » ou « ne sont pas ».
      const negatif = s.nombre === 'pl' ? 'ne sont pas' : 'n’est pas';
      const groupeVerbal = negation ? negatif : auxiliaire(s.nombre);
      return {
        prompt: `Écris le participe passé de « ${v.infinitif} » : « ${s.texte} ${groupeVerbal} … ${v.fin}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          ...piegesParticipe(v.participe, s),
          [v.infinitif, 'C’est l’infinitif : il faut le participe passé.'],
        ]),
        hint: negation
          ? 'Cherche le nom noyau du sujet, ou les deux noms. Le mot le plus proche du verbe peut te tromper.'
          : 'Cherche le sujet, puis ajoute au participe les marques de son genre et de son nombre.',
        steps: [DEF_PARTICIPE, explication(s), `On écrit **${s.texte} ${groupeVerbal} ${bon}**.`],
      };
    }
    default: {
      const sujetsTires = pickN(rng, SUJETS_PARTICIPE_PIEGES, 3);
      const verbes = pickN(rng, VERBES_ETRE, 3);
      const lignes = sujetsTires.map((s, i) => {
        const v = at(verbes, i);
        return { s, v, aux: auxiliaire(s.nombre), pp: accorderParticipe(v.participe, s) };
      });
      return {
        prompt:
          'Lis le texte. Mets chaque ligne au passé composé : écris « est » ou « sont », puis le participe passé.',
        figure: document(
          'Journal de la sortie',
          lignes.map((l) => `Hier, ${lowerFirst(l.s.texte)} … … (${l.v.infinitif}) ${l.v.fin}.`),
        ),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1 : ', ' ', '. Ligne 2 : ', ' ', '. Ligne 3 : ', ' ', '.'],
          blanks: lignes.flatMap((l) => [l.aux, l.pp]).map((a) => ({ mode: 'text' as const, accepted: [a] })),
        },
        hint: 'Le sujet commande deux choses : l’auxiliaire et la fin du participe passé.',
        steps: [
          'Le passé composé se fait en deux mots : l’auxiliaire, puis le participe passé.',
          DEF_PARTICIPE,
          ...lignes.map((l) => explication(l.s)),
          `Réponses : **${lignes.map((l) => `${l.aux} ${l.pp}`).join(', ')}**.`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesAccords(n.factId, ...n.faits) },
  generate: n.generate,
});

const faitsDe = (list: readonly { readonly fait: string }[]) => list.map((x) => x.fait);

export const FCM1_ACCORDS: readonly Skill[] = [
  skill({
    id: 'fcm1-genre-nombre',
    title: 'Le genre et le nombre',
    memo: [
      'Un nom a un **genre** : **masculin** (un sac) ou **féminin** (une porte).',
      'Il a aussi un **nombre** : **singulier** (un sac) ou **pluriel** (des sacs).',
      'Le plus souvent, le pluriel ajoute un s au nom.',
    ],
    factId: 'variations',
    faits: ['regulieres', 'genres', 'marque-s'],
    generate: genreNombreDraft,
  }),
  skill({
    id: 'fcm1-pluriels',
    title: 'Les pluriels en -s, -x et -aux',
    memo: [
      'Au **pluriel**, le plus souvent : un s (des sacs). Beaucoup de noms en -eau ou -eu prennent un x (des bateaux).',
      'Sept noms en -ou prennent un x : bijou, caillou, chou, genou, hibou, joujou, pou. Un clou, des clous !',
      'Souvent -al devient -aux (des chevaux). Mais : des bals, des carnavals, des festivals, des chacals, des régals.',
    ],
    factId: 'pluriels',
    faits: ['marque-s', 'serie-ou', ...faitsDe([...PLURIELS_EAU, ...PLURIELS_AUX, ...PLURIELS_ALS])],
    generate: plurielsDraft,
  }),
  skill({
    id: 'fcm1-feminin',
    title: 'Le féminin des noms et des adjectifs',
    memo: [
      'Pour le **féminin**, on ajoute souvent un e : un ami → une amie.',
      'Parfois, la fin change davantage : lion → lionne, fermier → fermière, chanteur → chanteuse, acteur → actrice.',
      'Certains mots sont à retenir : beau → belle, blanc → blanche, doux → douce.',
    ],
    factId: 'marques-feminin',
    faits: ['terminaisons-feminin', ...faitsDe(FEMININS)],
    generate: femininDraft,
  }),
  skill({
    id: 'fcm1-accord-gn',
    title: 'La chaîne d’accord dans le groupe nominal',
    memo: [
      'Dans le groupe nominal, le **nom noyau** est le chef : il donne son genre et son nombre.',
      'La **chaîne d’accord** : le déterminant et l’adjectif suivent. « les petites portes vertes ».',
    ],
    factId: 'donneur',
    faits: ['transformer', 'regulieres', 'accord-adjectif', 'accord-determinant'],
    generate: accordGnDraft,
  }),
  skill({
    id: 'fcm1-accord-sujet-verbe',
    title: 'L’accord du sujet et du verbe',
    memo: [
      'Le **verbe** s’accorde avec son **sujet**. Cherche-le avec « qui est-ce qui ? ».',
      'Au présent, pour un verbe en -er : je chante, tu chantes, il chante, nous chantons, vous chantez, ils chantent.',
      'Le chien de mes voisins saute : le nom noyau « chien » commande, pas « voisins ».',
    ],
    factId: 'sujet-noyau',
    faits: ['accord-verbe', 'marque-ent'],
    generate: sujetVerbeDraft,
  }),
  skill({
    id: 'fcm1-participe-etre',
    title: 'Le participe passé avec être',
    memo: [
      'Au passé composé, « elle est partie » : l’**auxiliaire** être, puis le **participe passé**.',
      'Avec être, le participe passé s’accorde avec le sujet : e pour le féminin, s pour le pluriel.',
      'Il est venu, elle est venue, ils sont venus, elles sont venues.',
    ],
    factId: 'participe-etre',
    faits: ['temps-composes'],
    generate: participeDraft,
  }),
];
