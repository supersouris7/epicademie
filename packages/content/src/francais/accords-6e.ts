import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import { accorderParticipe, type Genre, type Nombre, type SujetAccorde, type VerbeEtre } from './accords.donnees.ts';
import { ADJ_PARTICULIERS, ADJ_REGULIERS, forme, type Adj } from './accords-cm2.donnees.ts';
import {
  ADJ_AVANT,
  AUTEURS,
  CATEGORIES,
  COMPLEMENTS,
  DET,
  GROUPES_ETENDUS,
  INDIRECTS,
  NOMS_DET,
  PHRASES_ELOIGNEES,
  PHRASES_PIEGES,
  PHRASES_RECIT,
  PHRASES_SIMPLES,
  PRONOMS,
  SUJETS_CHOIX,
  SUJETS_ELOIGNES,
  SUJETS_INVERSES,
  TRANSFORMATIONS,
  VERBES_ETRE_6E,
  VERBES_INVERSES,
  accordeAvoir,
  debutApres,
  debutAvant,
  faitAccord6e,
  nombreDe,
  pronomCod,
  sourcesAccords6e,
  textePhrase,
  verbeEtre6e,
  verbeFaux,
  verbeJuste,
  type Auteur,
  type Complement,
  type GroupeEtendu,
  type Indirect,
  type Nom,
  type PhraseSujet,
} from './accords-6e.donnees.ts';
import { appariement, at, document, pickN, textTraps } from './outils.ts';

/**
 * Chapitre « Les accords » (6e). Programme de français du cycle 3 (BO du 17 avril 2025), sixième :
 * « Acquérir l’orthographe grammaticale ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), 6e — « ${faitAccord6e(id).citation} »`;

const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const GENRES: Record<Genre, string> = { m: 'masculin', f: 'féminin' };
const NOMBRES: Record<Nombre, string> = { sg: 'singulier', pl: 'pluriel' };
const categorie = (g: Genre, n: Nombre) => `${GENRES[g]} ${NOMBRES[n]}`;

/** Texte à trous « Ligne 1 : [..] [..]. Ligne 2 : … » : un groupe de réponses par ligne. */
const parLignes = (groupes: readonly (readonly string[])[]) => ({
  kind: 'cloze' as const,
  parts: [...groupes.flatMap((g, i) => g.map((_, j) => (j > 0 ? ' ' : `${i > 0 ? '. ' : ''}Ligne ${i + 1} : `))), '.'],
  blanks: groupes.flat().map((a) => ({ mode: 'text' as const, accepted: [a] })),
});

// ───────────────────────── 1. Chaîne d'accord du groupe nominal ─────────────────────────

const DEF_GN = 'Dans un groupe nominal, le nom noyau donne son genre et son nombre au déterminant et à l’adjectif.';

const piegesAdjectif = (a: Adj, noyau: string, g: Genre, n: Nombre): (readonly [string, Rich])[] =>
  CATEGORIES.filter(([cg, cn]) => forme(a, cg, cn) !== forme(a, g, n)).map(
    ([cg, cn]) =>
      [
        forme(a, cg, cn),
        `Le nom noyau « ${noyau} » est ${categorie(g, n)}. « ${forme(a, cg, cn)} » serait ${categorie(cg, cn)}.`,
      ] as const,
  );

/** « les grandes tables » et ses écritures fautives, chacune expliquée. */
function groupesAvecAdjectif(x: Nom, a: Adj) {
  const autreNombre: Nombre = x.nombre === 'sg' ? 'pl' : 'sg';
  const autreGenre: Genre = x.genre === 'm' ? 'f' : 'm';
  const groupe = (det: string, adj: string) => `${det} ${adj} ${x.nom}`;
  const det = DET[x.genre][x.nombre];
  const adj = forme(a, x.genre, x.nombre);
  const chef = `« ${x.nom} » est ${categorie(x.genre, x.nombre)}`;
  return {
    juste: groupe(det, adj),
    faux: [
      {
        label: groupe(det, forme(a, x.genre, autreNombre)),
        why: `${chef} : l’adjectif doit prendre le même nombre.`,
      },
      {
        label: groupe(det, forme(a, autreGenre, x.nombre)),
        why: `${chef} : l’adjectif doit prendre le même genre.`,
      },
      { label: groupe(DET[x.genre][autreNombre], adj), why: `${chef} : le déterminant doit prendre le même nombre.` },
    ],
  };
}

const preposition = (g: GroupeEtendu) => at(g.debut.split(' '), 2);

function chaineDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const x = rng.pick(NOMS_DET);
      const g = groupesAvecAdjectif(x, rng.pick(ADJ_AVANT));
      const { answer, traps } = choice(rng, g.juste, pickN(rng, g.faux, 2));
      return {
        prompt: `Quel groupe nominal avec le nom « ${x.nom} » est correctement accordé ?`,
        answer,
        traps,
        hint: 'Regarde les trois mots : ont-ils tous le genre et le nombre du nom ?',
        steps: [
          DEF_GN,
          `Le nom noyau « ${x.nom} » est ${categorie(x.genre, x.nombre)}.`,
          `La bonne écriture : **${g.juste}**.`,
        ],
      };
    }
    case 2: {
      const x = rng.pick(GROUPES_ETENDUS);
      const adj = forme(x.adjectif, x.genre, x.nombre);
      const { answer, traps } = choice(rng, x.noyau, [
        {
          label: x.complement,
          why: `« ${x.complement} » fait partie du complément du nom : il ne commande pas « ${adj} ».`,
        },
        {
          label: x.determinant,
          why: `« ${x.determinant} » est un déterminant : il reçoit l’accord du nom, il ne le donne pas.`,
        },
        {
          label: preposition(x),
          why: `« ${preposition(x)} » introduit le complément du nom : ce n’est pas un nom.`,
        },
      ]);
      return {
        prompt: `« ${x.debut}, ${adj} ». Quel mot donne son genre et son nombre à « ${adj} » ?`,
        answer,
        traps,
        hint: 'Cherche le nom principal du groupe, celui que l’on ne peut pas supprimer.',
        steps: [
          DEF_GN,
          `Sans le complément du nom, il reste « ${x.determinant} ${x.noyau}, ${adj} ».`,
          `Le donneur d’accord est **${x.noyau}**.`,
        ],
      };
    }
    case 3: {
      const x = rng.pick(NOMS_DET);
      const a = rng.pick([ADJ_REGULIERS.vert, ADJ_REGULIERS.lourd, ADJ_PARTICULIERS.blanc, ADJ_PARTICULIERS.léger]);
      const bon = forme(a, x.genre, x.nombre);
      const debut = `${DET[x.genre][x.nombre]} ${x.nom}`;
      return {
        prompt: `Accorde l’adjectif « ${a.base} » : « ${debut} … »`,
        answer: { kind: 'text', accepted: [bon] },
        traps: textTraps([bon], piegesAdjectif(a, x.nom, x.genre, x.nombre)),
        hint: 'Le déterminant donne un indice sur le nom : un seul ou plusieurs ? Puis cherche le genre du nom.',
        steps: [DEF_GN, `« ${x.nom} » est ${categorie(x.genre, x.nombre)}.`, `On écrit **${debut} ${bon}**.`],
      };
    }
    case 4: {
      const t = rng.pick(TRANSFORMATIONS);
      const [det, nom, adj] = t.arrivee;
      return {
        prompt: `Réécris « ${t.depart.join(' ')} » ${t.consigne}, en gardant le même type de déterminant (trois mots).`,
        answer: {
          kind: 'cloze',
          parts: ['Déterminant : ', ' ; nom : ', ' ; adjectif : ', '.'],
          blanks: t.arrivee.map((mot) => ({ mode: 'text' as const, accepted: [mot] })),
        },
        hint: 'Change d’abord le nom, puis fais suivre le déterminant et l’adjectif. Certaines formes sont particulières.',
        steps: [
          DEF_GN,
          `Le nom devient « ${nom} » : il entraîne « ${det} » et « ${adj} ».`,
          `On écrit **${t.arrivee.join(' ')}**.`,
        ],
      };
    }
    default: {
      const lignes = pickN(rng, GROUPES_ETENDUS, 4);
      const reponses = lignes.map((x) => forme(x.adjectif, x.genre, x.nombre));
      return {
        prompt:
          'Sur chaque ligne, l’adjectif entre parenthèses décrit le nom noyau du groupe. Écris-le correctement accordé.',
        figure: document(
          'Carnet d’un voyageur',
          lignes.map((x) => `${x.debut}, … (${x.adjectif.base})`),
        ),
        answer: parLignes(reponses.map((r) => [r])),
        hint: 'Le nom placé juste avant l’adjectif appartient souvent au complément du nom : remonte jusqu’au noyau.',
        steps: [
          DEF_GN,
          ...lignes.map((x) => `Nom noyau « ${x.noyau} » : ${categorie(x.genre, x.nombre)}.`),
          `Réponses : **${reponses.join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Accord sujet-verbe raisonné ─────────────────────────

const DEF_SUJET = 'Le groupe sujet règle l’accord du verbe, quelle que soit sa place dans la phrase.';

const raisonner = (p: PhraseSujet) =>
  `Le groupe sujet est « ${p.groupeSujet} » : on peut le remplacer par « ${p.pronom} » (${NOMBRES[nombreDe(p)]}).`;

function motifSujet(p: PhraseSujet): string {
  const cas = {
    simple: '',
    eloigne: ' Le nom le plus proche du verbe ne commande pas.',
    ecran: ' Le pronom placé devant le verbe est un complément, pas le sujet.',
    inverse: ' Ici le sujet est placé après le verbe.',
  }[p.cas];
  return `${raisonner(p)}${cas} Le verbe s’écrit « ${verbeJuste(p)} ».`;
}

const piegesSujet = (p: PhraseSujet): (readonly [string, Rich])[] => [
  [verbeFaux(p), motifSujet(p)],
  [p.infinitif, 'C’est l’infinitif : le verbe doit être conjugué et accordé avec son sujet.'],
];

function ecrireVerbe(p: PhraseSujet, hint: string): QuestionDraft {
  const bon = verbeJuste(p);
  return {
    prompt: `Écris le verbe « ${p.infinitif} » au présent : « ${textePhrase(p, '…')} »`,
    answer: { kind: 'text', accepted: [bon] },
    traps: textTraps([bon], piegesSujet(p)),
    hint,
    steps: [DEF_SUJET, motifSujet(p), `On écrit **${textePhrase(p, bon)}**`],
  };
}

function sujetVerbeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(PHRASES_SIMPLES);
      const bon = verbeJuste(p);
      const { answer, traps } = choice(
        rng,
        bon,
        piegesSujet(p).map(([label, why]) => ({ label, why })),
      );
      return {
        prompt: `Choisis la bonne forme du verbe : « ${textePhrase(p, '…')} »`,
        answer,
        traps,
        hint: 'Remplace le groupe sujet par un pronom : un seul ou plusieurs ?',
        steps: [DEF_SUJET, raisonner(p), `On écrit **${textePhrase(p, bon)}**`],
      };
    }
    case 2: {
      const p = rng.pick([...PHRASES_SIMPLES, ...PHRASES_ELOIGNEES]);
      const phrase = textePhrase(p, verbeJuste(p));
      const { answer, traps } = choice(
        rng,
        p.pronom,
        PRONOMS.filter((x) => x !== p.pronom).map((label) => ({
          label,
          why: `Le nom noyau « ${p.noyau} » demande « ${p.pronom} », pas « ${label} » : regarde son genre et son nombre.`,
        })),
        true,
      );
      return {
        prompt: `« ${phrase} » Par quel pronom peut-on remplacer le groupe sujet ?`,
        answer,
        traps,
        hint: 'Trouve le nom noyau du groupe sujet, puis son genre et son nombre.',
        steps: [
          DEF_SUJET,
          `Le nom noyau est « ${p.noyau} ».`,
          `On peut remplacer « ${p.groupeSujet} » par **${p.pronom}**.`,
        ],
      };
    }
    case 3:
      return ecrireVerbe(rng.pick(PHRASES_SIMPLES), 'Quel pronom peut remplacer le groupe sujet ?');
    case 4:
      return ecrireVerbe(
        rng.pick(PHRASES_PIEGES),
        'Ne t’arrête pas au mot placé juste devant le verbe : cherche le groupe sujet et remplace-le par un pronom.',
      );
    default: {
      const lignes = pickN(rng, PHRASES_RECIT, 4);
      return {
        prompt: 'Dans ce récit, chaque verbe est mal accordé. Réécris-le correctement, à l’imparfait.',
        figure: document(
          'Une soirée au village',
          lignes.map((p) => textePhrase(p, verbeFaux(p))),
        ),
        answer: parLignes(lignes.map((p) => [verbeJuste(p)])),
        hint: 'Pour chaque ligne, trouve le groupe sujet : il est parfois après le verbe, ou loin de lui.',
        steps: [
          DEF_SUJET,
          ...lignes.map(motifSujet),
          `Les verbes corrigés : **${lignes.map(verbeJuste).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Participe passé avec être ─────────────────────────

const DEF_ETRE = 'Avec l’auxiliaire être, le participe passé s’accorde en genre et en nombre avec le sujet.';

type Temps = 'passé composé' | 'plus-que-parfait';
const TEMPS: readonly Temps[] = ['passé composé', 'plus-que-parfait'];
const auxEtre = (t: Temps, n: Nombre) =>
  ({ 'passé composé': ['est', 'sont'], 'plus-que-parfait': ['était', 'étaient'] })[t][n === 'sg' ? 0 : 1] ?? '';

/** « La voisine » : le sujet d'une série, avec le genre et le nombre de sa place. */
const sujetChoix = (serie: readonly string[], i: number): SujetAccorde => {
  const [genre, nombre] = at(CATEGORIES, i);
  return { texte: at(serie, i), genre, nombre };
};
const tirerSujet = (rng: Rng) => sujetChoix(rng.pick(SUJETS_CHOIX), rng.int(0, 3));

const analyse = (s: SujetAccorde) => `${s.raison ? `${s.raison} ` : ''}Le sujet est ${categorie(s.genre, s.nombre)}.`;

const piegesEtre = (v: VerbeEtre, s: SujetAccorde): (readonly [string, Rich])[] => [
  ...CATEGORIES.filter(([g, n]) => g !== s.genre || n !== s.nombre).map(([genre, nombre]) => {
    const mot = accorderParticipe(v.participe, { genre, nombre });
    return [mot, `${analyse(s)} « ${mot} » serait ${categorie(genre, nombre)}.`] as const;
  }),
  [v.infinitif, 'C’est l’infinitif : après être, il faut ici le participe passé.'],
];

function ecrireEtre(s: SujetAccorde, v: VerbeEtre, phrase: (trou: string) => string, hint: string): QuestionDraft {
  const bon = accorderParticipe(v.participe, s);
  return {
    prompt: `Écris le participe passé de « ${v.infinitif} » : « ${phrase('…')} »`,
    answer: { kind: 'text', accepted: [bon] },
    traps: textTraps([bon], piegesEtre(v, s)),
    hint,
    steps: [DEF_ETRE, analyse(s), `On écrit **${phrase(bon)}**`],
  };
}

function participeEtreDraft(rng: Rng, level: Level): QuestionDraft {
  const verbe = () => rng.pick(VERBES_ETRE_6E);
  switch (level) {
    case 1: {
      const s = tirerSujet(rng);
      const v = verbe();
      const bon = accorderParticipe(v.participe, s);
      const aux = auxEtre('passé composé', s.nombre);
      const { answer, traps } = choice(
        rng,
        bon,
        pickN(rng, piegesEtre(v, s).slice(0, 3), 2).map(([label, why]) => ({ label, why })),
      );
      return {
        prompt: `Choisis le participe passé : « ${s.texte} ${aux} … ${v.fin}. » (${v.infinitif})`,
        answer,
        traps,
        hint: 'Quel est le sujet ? Masculin ou féminin, un seul ou plusieurs ?',
        steps: [DEF_ETRE, analyse(s), `On écrit **${s.texte} ${aux} ${bon} ${v.fin}.**`],
      };
    }
    case 2: {
      const serie = rng.pick(SUJETS_CHOIX);
      const i = rng.int(0, 3);
      const s = sujetChoix(serie, i);
      const v = verbe();
      const temps = rng.pick(TEMPS);
      const fin = `${auxEtre(temps, s.nombre)} ${accorderParticipe(v.participe, s)} ${v.fin}.`;
      const { answer, traps } = choice(
        rng,
        s.texte,
        CATEGORIES.map((_, j) => sujetChoix(serie, j))
          .filter((x) => x.texte !== s.texte)
          .map((x) => ({
            label: x.texte,
            why: `« ${x.texte} » est ${categorie(x.genre, x.nombre)} : le participe passé serait « ${accorderParticipe(v.participe, x)} » avec « ${auxEtre(temps, x.nombre)} ».`,
          })),
        true,
      );
      return {
        prompt: `Quel sujet convient ? « … ${fin} »`,
        answer,
        traps,
        hint: 'Observe l’auxiliaire pour le nombre, puis la fin du participe passé pour le genre.',
        steps: [
          DEF_ETRE,
          `« ${auxEtre(temps, s.nombre)} » indique le ${NOMBRES[s.nombre]} ; la fin du participe indique le ${GENRES[s.genre]}.`,
          `Le sujet est **${s.texte}**.`,
        ],
      };
    }
    case 3: {
      const s = tirerSujet(rng);
      const v = verbe();
      const aux = auxEtre(rng.pick(TEMPS), s.nombre);
      return ecrireEtre(
        s,
        v,
        (t) => `${s.texte} ${aux} ${t} ${v.fin}.`,
        'Repère le sujet, puis ajoute au participe les marques de son genre et de son nombre.',
      );
    }
    case 4: {
      const temps = rng.pick(TEMPS);
      if (rng.int(0, 1) === 0) {
        const s = rng.pick(SUJETS_INVERSES);
        const v = verbeEtre6e(rng.pick(VERBES_INVERSES));
        const debut = rng.pick(['Ce matin', 'À midi', 'Hier soir']);
        return ecrireEtre(
          s,
          v,
          (t) => `${debut} ${auxEtre(temps, s.nombre)} ${t} ${s.texte}.`,
          'Le sujet n’est pas devant le verbe : pose la question « qui est-ce qui… ? ».',
        );
      }
      const s = rng.pick(SUJETS_ELOIGNES);
      const v = verbe();
      const aux = auxEtre(temps, s.nombre);
      const negation = `${aux.startsWith('é') || aux.startsWith('e') ? 'n’' : 'ne '}${aux} pas`;
      return ecrireEtre(
        s,
        v,
        (t) => `${s.texte} ${negation} ${t} ${v.fin}.`,
        'Cherche le nom noyau du sujet : le nom le plus proche de l’auxiliaire peut tromper.',
      );
    }
    default: {
      const eloignes = pickN(rng, SUJETS_ELOIGNES, 2);
      const inverse = rng.pick(SUJETS_INVERSES);
      const verbes = pickN(rng, VERBES_ETRE_6E, 2);
      const dernier = verbeEtre6e(rng.pick(VERBES_INVERSES.filter((x) => verbes.every((v) => v.infinitif !== x))));
      const temps = [rng.pick(TEMPS), rng.pick(TEMPS), rng.pick(TEMPS)] as const;
      const lignes = [
        ...eloignes.map((s, i) => {
          const v = at(verbes, i);
          return { s, v, t: at(temps, i), texte: `${s.texte} … … (${v.infinitif}, ${at(temps, i)}) ${v.fin}.` };
        }),
        {
          s: inverse,
          v: dernier,
          t: temps[2],
          texte: `Puis … … (${dernier.infinitif}, ${temps[2]}) ${inverse.texte}.`,
        },
      ];
      const reponses = lignes.map((l) => [auxEtre(l.t, l.s.nombre), accorderParticipe(l.v.participe, l.s)]);
      return {
        prompt: 'Conjugue chaque verbe au temps indiqué : écris l’auxiliaire, puis le participe passé.',
        figure: document(
          'Journal de voyage',
          lignes.map((l) => l.texte),
        ),
        answer: parLignes(reponses),
        hint: 'Le sujet commande l’auxiliaire et le participe. Sur une ligne, il est placé à la fin.',
        steps: [
          'Temps composés : l’auxiliaire (au présent pour le passé composé, à l’imparfait pour le plus-que-parfait), puis le participe passé.',
          DEF_ETRE,
          ...lignes.map((l) => analyse(l.s)),
          `Réponses : **${reponses.map((r) => r.join(' ')).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Participe passé avec avoir ─────────────────────────

const DEF_AVOIR =
  'Avec l’auxiliaire avoir, le participe passé s’accorde avec le COD seulement si le COD est placé avant, par exemple sous la forme d’un pronom.';

const accorde = (x: Complement) => accordeAvoir(x.verbe.participe, x.genre, x.nombre);
const formesDe = (participe: string) => [...new Set(CATEGORIES.map(([g, n]) => accordeAvoir(participe, g, n)))];
const raisonAvant = (x: Complement) =>
  `Le pronom « ${pronomCod(x)} » est le COD : placé avant, il reprend « ${x.cod} » (${categorie(x.genre, x.nombre)}). Le participe passé prend ce genre et ce nombre.`;
const raisonApres = (x: Complement) =>
  `Le COD « ${x.cod} » est placé après : le participe passé reste « ${x.verbe.participe} ».`;
const raisonIndirect = (x: Indirect) =>
  `« ${x.pronom} » est un COI (il remplace « à ${x.coi} »), pas un COD : le participe passé reste « ${x.verbe.participe} ».`;

/** Pièges communs : chaque autre écriture du participe, puis l'infinitif. */
const piegesParticipe = (
  verbe: { readonly infinitif: string; readonly participe: string },
  raison: string,
): (readonly [string, Rich])[] => [
  ...formesDe(verbe.participe).map((mot) => [mot, `${raison} Le sujet ne commande pas ce participe.`] as const),
  [verbe.infinitif, 'C’est l’infinitif : après avoir, il faut le participe passé.'],
];

interface Cas {
  readonly texte: (trou: string) => string;
  readonly verbe: { readonly infinitif: string; readonly participe: string };
  readonly attendu: string;
  readonly raison: string;
}

const casAvant = (x: Complement, a: Auteur): Cas => ({
  texte: (t) => `${maj(x.cod)} ? ${debutAvant(a, x)} ${t}.`,
  verbe: x.verbe,
  attendu: accorde(x),
  raison: raisonAvant(x),
});
const casNegation = (x: Complement, a: Auteur): Cas => ({
  texte: (t) => `${maj(x.cod)} ? ${a.texte} ne ${x.nombre === 'pl' ? 'les ' : 'l’'}${a.aux} pas ${t}.`,
  verbe: x.verbe,
  attendu: accorde(x),
  raison: raisonAvant(x),
});
const casApres = (x: Complement, a: Auteur): Cas => ({
  texte: (t) => `${debutApres(a)} ${t} ${x.cod}.`,
  verbe: x.verbe,
  attendu: x.verbe.participe,
  raison: raisonApres(x),
});
const casIndirect = (x: Indirect, a: Auteur): Cas => ({
  texte: (t) => `${maj(x.coi)} ? ${a.texte} ${x.pronom} ${a.aux} ${t} ${x.suite}.`,
  verbe: x.verbe,
  attendu: x.verbe.participe,
  raison: raisonIndirect(x),
});

function ecrireAvoir(c: Cas, hint: string): QuestionDraft {
  return {
    prompt: `Écris le participe passé de « ${c.verbe.infinitif} » : « ${c.texte('…')} »`,
    answer: { kind: 'text', accepted: [c.attendu] },
    traps: textTraps([c.attendu], piegesParticipe(c.verbe, c.raison)),
    hint,
    steps: [DEF_AVOIR, c.raison, `On écrit **${c.texte(c.attendu)}**`],
  };
}

/** Les compléments dont le participe change à l'écrit quand ils sont placés avant. */
const ACCORD_VISIBLE = COMPLEMENTS.filter((x) => accorde(x) !== x.verbe.participe);
/** Verbes dont les quatre genres et nombres ont un complément. */
const VERBES_QUATRE = ['laver', 'ranger', 'trouver'];

function participeAvoirDraft(rng: Rng, level: Level): QuestionDraft {
  const auteur = () => rng.pick(AUTEURS);
  switch (level) {
    case 1: {
      const x = rng.pick(ACCORD_VISIBLE);
      const c = casAvant(x, auteur());
      const faux = formesDe(x.verbe.participe).filter((m) => m !== c.attendu && m !== x.verbe.participe);
      const { answer, traps } = choice(
        rng,
        c.attendu,
        [x.verbe.participe, rng.pick(faux)].map((label) => ({
          label,
          why: `${raisonAvant(x)} « ${label} » ne porte pas les marques de ce genre et de ce nombre.`,
        })),
      );
      return {
        prompt: `Choisis le participe passé : « ${c.texte('…')} »`,
        answer,
        traps,
        hint: 'Que remplace le pronom placé avant « avoir » ?',
        steps: [DEF_AVOIR, c.raison, `On écrit **${c.texte(c.attendu)}**`],
      };
    }
    case 2: {
      const infinitif = rng.pick(VERBES_QUATRE);
      const choisis = pickN(rng, CATEGORIES, 3).map(([g, n]) =>
        rng.pick(COMPLEMENTS.filter((x) => x.verbe.infinitif === infinitif && x.genre === g && x.nombre === n)),
      );
      const a = auteur();
      const gauche = choisis.map((x) => casAvant(x, a).texte('…').slice(0, -1));
      const droite = choisis.map(accorde);
      return {
        prompt: `Associe chaque phrase (${gauche.join(' / ')}) à la bonne forme du participe passé de « ${infinitif} ».`,
        answer: { kind: 'match', left: gauche, ...appariement(rng, droite) },
        hint: 'Dans chaque phrase, remplace le pronom par le nom qu’il reprend.',
        steps: [
          DEF_AVOIR,
          ...choisis.map(raisonAvant),
          `Réponses : **${choisis.map((x) => `${x.cod} → ${accorde(x)}`).join(', ')}**.`,
        ],
      };
    }
    case 3: {
      const x = rng.pick(COMPLEMENTS);
      return ecrireAvoir(casAvant(x, auteur()), 'Remonte du pronom au nom qu’il reprend, puis accorde.');
    }
    case 4: {
      const tirage = rng.int(0, 2);
      if (tirage === 0)
        return ecrireAvoir(
          casApres(rng.pick(ACCORD_VISIBLE), auteur()),
          'Où est placé le COD ? Avant ou après le verbe ?',
        );
      if (tirage === 1)
        return ecrireAvoir(
          casIndirect(rng.pick(INDIRECTS), auteur()),
          'Le pronom devant « avoir » est-il un COD ou un COI ?',
        );
      return ecrireAvoir(
        casNegation(rng.pick(COMPLEMENTS), auteur()),
        'La négation ne change pas le COD. Cherche le pronom qui précède l’auxiliaire.',
      );
    }
    default: {
      const [x, y] = pickN(rng, ACCORD_VISIBLE, 2) as [Complement, Complement];
      const cas: readonly Cas[] = rng.shuffle([
        casAvant(x, auteur()),
        casApres(y, auteur()),
        casIndirect(rng.pick(INDIRECTS), auteur()),
      ]);
      const s = rng.pick(SUJETS_INVERSES);
      const v = verbeEtre6e(rng.pick(VERBES_INVERSES));
      const aux = auxEtre('passé composé', s.nombre);
      const reponses = [...cas.map((c) => c.attendu), accorderParticipe(v.participe, s)];
      return {
        prompt: 'Écris le participe passé du verbe entre parenthèses sur chaque ligne.',
        figure: document('Carnet de la semaine', [
          ...cas.map((c) => c.texte(`… (${c.verbe.infinitif})`)),
          `Enfin ${aux} … (${v.infinitif}) ${s.texte}.`,
        ]),
        answer: parLignes(reponses.map((r) => [r])),
        hint: 'Regarde l’auxiliaire. Avec avoir, cherche le COD et sa place ; avec être, cherche le sujet.',
        steps: [
          DEF_AVOIR,
          ...cas.map((c) => c.raison),
          `Dernière ligne : avec être, on accorde avec le sujet « ${s.texte} ».`,
          `Réponses : **${reponses.join(', ')}**.`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesAccords6e(n.factId, ...n.faits) },
  generate: n.generate,
});

export const F6_ACCORDS: readonly Skill[] = [
  skill({
    id: 'f6-chaine-accord-gn',
    title: 'La chaîne d’accord du groupe nominal',
    memo: [
      'Le **nom noyau** est le **donneur d’accord** : le déterminant et l’adjectif prennent son genre et son nombre.',
      'C’est la **chaîne d’accord** : « les petites barques vertes ».',
      'Le nom d’un **complément du nom** ne commande pas : « les lanternes du port, lourdes ».',
    ],
    factId: 'a6-gn',
    faits: [
      'a6-noyau',
      'a6-determinant',
      'a6-adjectif',
      ...new Set([
        ...TRANSFORMATIONS.flatMap((t) => t.faits),
        ...GROUPES_ETENDUS.map((g) => g.adjectif.fait),
        ...ADJ_AVANT.map((a) => a.fait),
      ]),
    ],
    generate: chaineDraft,
  }),
  skill({
    id: 'f6-accord-sujet-verbe',
    title: 'Raisonner sur l’accord sujet-verbe',
    memo: [
      'Le **groupe sujet** règle l’accord du verbe. Remplace-le par un **pronom personnel** : il, elle, ils, elles.',
      '« Les volets de la maison grincent » : ils grincent.',
      'Attention au pronom complément (« il les observe ») et au **sujet inversé** (« au bois chante un merle »).',
    ],
    factId: 'a6-sujet-verbe',
    faits: ['a6-gs', 'a6-gs-pronom', 'a6-pronoms-sujets', 'a6-pronoms-cod'],
    generate: sujetVerbeDraft,
  }),
  skill({
    id: 'f6-participe-etre',
    title: 'Le participe passé avec être',
    memo: [
      'Avec l’**auxiliaire** être, le **participe passé** s’accorde avec le sujet en genre et en nombre.',
      '« Les voisines étaient parties. »',
      'La règle vaut même si le sujet suit le verbe : « Ce matin sont arrivées les nageuses. »',
    ],
    factId: 'a6-etre',
    faits: ['a6-etre-regle', 'a6-forme-composee'],
    generate: participeEtreDraft,
  }),
  skill({
    id: 'f6-participe-avoir-cod',
    title: 'Avoir et le pronom COD placé avant',
    memo: [
      'Avec avoir, le **participe passé** s’accorde avec le **COD** placé avant : « La nappe ? Je l’ai lavée. »',
      'Le pronom « le, la, les » reprend son **antécédent** : cherche-le pour connaître le genre et le nombre.',
      'COD après ou pronom **COI** (lui, leur) : pas d’accord. « Je leur ai parlé. »',
    ],
    factId: 'a6-avoir',
    faits: ['a6-avoir-regle', 'a6-etre-regle', 'a6-pronoms-cod', 'a6-pronoms-coi', 'a6-prendre', 'a6-faire'],
    generate: participeAvoirDraft,
  }),
];
