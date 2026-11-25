import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill } from '../types.ts';
import {
  SUJETS_PARTICIPE,
  SUJETS_PARTICIPE_PIEGES,
  accorderParticipe,
  type Genre,
  type Nombre,
  type SujetAccorde,
  type VerbeEtre,
} from './accords.donnees.ts';
import {
  ADJ_REGULIERS,
  ATTRIBUTS_ELOIGNES,
  AUTEURS,
  ELOIGNES,
  FEMININS_COURANTS,
  FEMININS_RARES,
  INVERSES_PIEGES,
  INVERSES_SIMPLES,
  OBJETS,
  OBJETS_AVOIR,
  PHRASES_FORMES,
  PLURIELS_COURANTS,
  PLURIELS_RARES,
  SUJETS_APRES,
  VERBES_APRES,
  VERBES_ATTRIBUTIFS,
  VERBES_ETRE_CM2,
  avecPronom,
  faitAccordCm2,
  forme,
  formeParticuliere,
  sansPronom,
  sourcesAccordsCm2,
  textePhrase,
  verbeEtre,
  verbeFaux,
  verbeJuste,
  type Adj,
  type Auteur,
  type Forme,
  type Objet,
  type PhraseVerbe,
  type VerbeAttributif,
} from './accords-cm2.donnees.ts';
import { appariement, at, document, pickN, textTraps } from './outils.ts';

/**
 * Chapitre « Les accords » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025),
 * cours moyen deuxième année : « Acquérir l’orthographe grammaticale ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitAccordCm2(id).citation} »`;

const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const GENRES: Record<Genre, string> = { m: 'masculin', f: 'féminin' };
const NOMBRES: Record<Nombre, string> = { sg: 'singulier', pl: 'pluriel' };
const categorie = (g: Genre, n: Nombre) => `${GENRES[g]} ${NOMBRES[n]}`;
const CATEGORIES: readonly (readonly [Genre, Nombre])[] = [
  ['m', 'sg'],
  ['f', 'sg'],
  ['m', 'pl'],
  ['f', 'pl'],
];

/** Texte à trous « Ligne 1 : [..] [..]. Ligne 2 : … » : un groupe de réponses par ligne. */
const parLignes = (groupes: readonly (readonly (string | readonly string[])[])[]) => ({
  kind: 'cloze' as const,
  parts: [...groupes.flatMap((g, i) => g.map((_, j) => (j > 0 ? ' ' : `${i > 0 ? '. ' : ''}Ligne ${i + 1} : `))), '.'],
  // Un trou peut admettre plusieurs écritures : la première est celle de la correction.
  blanks: groupes.flat().map((a) => ({ mode: 'text' as const, accepted: [a].flat() })),
});

// ───────────────────────── 1. Accord sujet-verbe ─────────────────────────

const DEF_VERBE = 'Le sujet commande le verbe, même s’il est placé après ou loin de lui.';
const trouver = (p: PhraseVerbe) =>
  `Demande « qui est-ce qui ${p.formes[0]} ? ». Le nom noyau du sujet est « ${p.noyau} » : ${NOMBRES[p.nombre]}.`;
const motifVerbe = (p: PhraseVerbe) =>
  `C’est « ${p.noyau} » qui commande : il est ${NOMBRES[p.nombre]}. Le verbe s’écrit « ${verbeJuste(p)} ».`;

const piegesVerbe = (p: PhraseVerbe): (readonly [string, Rich])[] => [
  [verbeFaux(p), motifVerbe(p)],
  [p.infinitif, 'C’est l’infinitif : le verbe doit être conjugué.'],
];

function ecrireVerbe(p: PhraseVerbe, hint: string): QuestionDraft {
  const bon = verbeJuste(p);
  return {
    prompt: `Écris le verbe « ${p.infinitif} » au présent : « ${p.avant} … ${p.apres}. »`,
    answer: { kind: 'text', accepted: [bon] },
    traps: textTraps([bon], piegesVerbe(p)),
    hint,
    steps: [DEF_VERBE, trouver(p), `On écrit **${textePhrase(p, bon)}**`],
  };
}

function sujetVerbeDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(INVERSES_SIMPLES);
      const bon = verbeJuste(p);
      const { answer, traps } = choice(
        rng,
        bon,
        piegesVerbe(p).map(([label, why]) => ({ label, why })),
      );
      return {
        prompt: `Le sujet est après le verbe. Choisis la bonne forme : « ${p.avant} … ${p.apres}. »`,
        answer,
        traps,
        hint: 'Regarde après le verbe : un seul ou plusieurs ?',
        steps: [DEF_VERBE, trouver(p), `On écrit **${textePhrase(p, bon)}**`],
      };
    }
    case 2: {
      const p = rng.pick([...INVERSES_PIEGES, ...ELOIGNES]);
      const phrase = textePhrase(p, verbeJuste(p));
      const { answer, traps } = choice(
        rng,
        p.noyau,
        p.autres.map((label) => ({
          label,
          why: `« ${label} » ne répond pas à la question « qui est-ce qui ${p.formes[0]} ? ».`,
        })),
      );
      return {
        prompt: `« ${phrase} » Quel mot commande l’accord du verbe ?`,
        answer,
        traps,
        hint: 'Pose la question « qui est-ce qui… ? » avec le verbe.',
        steps: [DEF_VERBE, trouver(p), `C’est **${p.noyau}**.`],
      };
    }
    case 3:
      return ecrireVerbe(rng.pick(INVERSES_SIMPLES), 'Cherche le sujet après le verbe. Compte-les.');
    case 4:
      return ecrireVerbe(
        rng.pick([...INVERSES_PIEGES, ...ELOIGNES]),
        'Attention au nom le plus proche du verbe : il peut te piéger. Cherche le nom noyau.',
      );
    default: {
      const lignes = rng.shuffle([...pickN(rng, INVERSES_PIEGES, 2), ...pickN(rng, ELOIGNES, 2)]);
      return {
        prompt: 'Lis le texte. Le verbe de chaque ligne est mal accordé. Écris-le correctement, au présent.',
        figure: document(
          'Reportage à corriger',
          lignes.map((p) => textePhrase(p, verbeFaux(p))),
        ),
        answer: parLignes(lignes.map((p) => [verbeJuste(p)])),
        hint: 'Sur chaque ligne, trouve d’abord le sujet. Il peut être après le verbe.',
        steps: [DEF_VERBE, ...lignes.map(trouver), `Les verbes corrigés : **${lignes.map(verbeJuste).join(', ')}**.`],
      };
    }
  }
}

// ───────────────────────── 2. Accord de l'attribut du sujet ─────────────────────────

const DEF_ATTRIBUT = 'L’attribut du sujet s’accorde en genre et en nombre avec le sujet.';

const verbeAu = (formes: readonly [string, string], n: Nombre) => formes[n === 'sg' ? 0 : 1];

/** Écritures admises du verbe conjugué : la variante ne vaut qu'au singulier. */
const verbesAdmis = (v: VerbeAttributif, n: Nombre) => [
  verbeAu(v.formes, n),
  ...(n === 'sg' && v.variante ? [v.variante] : []),
];

const piegesAttribut = (a: Adj, noyau: string, g: Genre, n: Nombre): (readonly [string, Rich])[] =>
  CATEGORIES.filter(([cg, cn]) => forme(a, cg, cn) !== forme(a, g, n)).map(
    ([cg, cn]) =>
      [
        forme(a, cg, cn),
        `« ${noyau} » est ${categorie(g, n)}. « ${forme(a, cg, cn)} » serait ${categorie(cg, cn)}.`,
      ] as const,
  );

function attributDraft(rng: Rng, level: Level): QuestionDraft {
  const regulier = () => rng.pick(Object.values(ADJ_REGULIERS));
  switch (level) {
    case 1: {
      const s = rng.pick(OBJETS);
      const a = regulier();
      const bon = forme(a, s.genre, s.nombre);
      const v = s.nombre === 'sg' ? 'est' : 'sont';
      const { answer, traps } = choice(
        rng,
        bon,
        pickN(rng, piegesAttribut(a, s.noyau, s.genre, s.nombre), 2).map(([label, why]) => ({ label, why })),
      );
      return {
        prompt: `Choisis le bon attribut : « ${s.texte} ${v} … . »`,
        answer,
        traps,
        hint: 'Regarde le sujet : masculin ou féminin ? Un seul ou plusieurs ?',
        steps: [
          DEF_ATTRIBUT,
          `« ${s.noyau} » est ${categorie(s.genre, s.nombre)}.`,
          `On écrit **${s.texte} ${v} ${bon}**.`,
        ],
      };
    }
    case 2: {
      const a = regulier();
      const sujets = pickN(rng, CATEGORIES, 3).map(([g, n]) =>
        rng.pick(OBJETS.filter((x) => x.genre === g && x.nombre === n)),
      );
      const gauche = sujets.map((s) => `${s.texte} ${s.nombre === 'sg' ? 'reste' : 'restent'}`);
      const droite = sujets.map((s) => forme(a, s.genre, s.nombre));
      return {
        prompt: `Associe chaque début (${gauche.join(', ')}) à la bonne forme de « ${a.base} ».`,
        answer: { kind: 'match', left: gauche, ...appariement(rng, droite) },
        hint: 'Pour chaque sujet, cherche son genre puis son nombre.',
        steps: [
          DEF_ATTRIBUT,
          'Le verbe « rester » relie l’adjectif au sujet.',
          ...sujets.map((s) => `« ${s.noyau} » est ${categorie(s.genre, s.nombre)}.`),
          `Réponses : **${gauche.map((x, i) => `${x} ${at(droite, i)}`).join(', ')}**.`,
        ],
      };
    }
    case 3: {
      const s = rng.pick(OBJETS);
      const a = regulier();
      const v = rng.pick(VERBES_ATTRIBUTIFS);
      const verbe = verbeAu(v.formes, s.nombre);
      const bon = forme(a, s.genre, s.nombre);
      return {
        prompt: `Accorde l’adjectif « ${a.base} » : « ${s.texte} ${verbe} … . »`,
        answer: { kind: 'text', accepted: [bon] },
        traps: textTraps([bon], piegesAttribut(a, s.noyau, s.genre, s.nombre)),
        hint: `Le verbe « ${v.infinitif} » relie l’adjectif au sujet. Quel est le genre et le nombre du sujet ?`,
        steps: [
          DEF_ATTRIBUT,
          `« ${s.noyau} » est ${categorie(s.genre, s.nombre)}.`,
          `On écrit **${s.texte} ${verbe} ${bon}**.`,
        ],
      };
    }
    case 4: {
      const x = rng.pick(ATTRIBUTS_ELOIGNES);
      const verbe = verbeAu(x.verbe.formes, x.nombre);
      const bon = forme(x.adjectif, x.genre, x.nombre);
      return {
        prompt: `Attention, piège ! Accorde « ${x.adjectif.base} » : « ${x.texte} ${verbe} … . »`,
        answer: { kind: 'text', accepted: [bon] },
        traps: textTraps([bon], piegesAttribut(x.adjectif, x.noyau, x.genre, x.nombre)),
        hint: 'Le nom juste avant le verbe n’est pas toujours le chef. Cherche le nom noyau.',
        steps: [
          DEF_ATTRIBUT,
          `Le nom noyau est « ${x.noyau} » : ${categorie(x.genre, x.nombre)}.`,
          `On écrit **${x.texte} ${verbe} ${bon}**.`,
        ],
      };
    }
    default: {
      const lignes = pickN(rng, ATTRIBUTS_ELOIGNES, 3);
      const reponses = lignes.map((x) => [verbeAu(x.verbe.formes, x.nombre), forme(x.adjectif, x.genre, x.nombre)]);
      return {
        prompt:
          'Lis le texte. Sur chaque ligne, écris le verbe au présent, puis l’adjectif bien accordé (deux réponses par ligne).',
        figure: document(
          'Portraits à compléter',
          lignes.map((x) => `${x.texte} … (${x.verbe.infinitif}) … (${x.adjectif.base}).`),
        ),
        answer: parLignes(lignes.map((x) => [verbesAdmis(x.verbe, x.nombre), forme(x.adjectif, x.genre, x.nombre)])),
        hint: 'Un même sujet commande deux accords : le verbe et l’attribut.',
        steps: [
          'Le sujet commande le verbe.',
          DEF_ATTRIBUT,
          ...lignes.map((x) => `Le nom noyau « ${x.noyau} » est ${categorie(x.genre, x.nombre)}.`),
          `Réponses : **${reponses.map((r) => r.join(' ')).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Participe passé avec être ─────────────────────────

const DEF_ETRE = 'Avec l’auxiliaire être, le participe passé s’accorde avec le sujet.';

const analyse = (s: SujetAccorde) => `${s.raison ? `${s.raison} ` : ''}Le sujet est ${categorie(s.genre, s.nombre)}.`;
const auPresent = (n: Nombre) => (n === 'sg' ? 'est' : 'sont');
const auPlusQueParfait = (n: Nombre) => (n === 'sg' ? 'était' : 'étaient');

const piegesParticipeEtre = (v: VerbeEtre, s: SujetAccorde): (readonly [string, Rich])[] => [
  ...CATEGORIES.filter(([g, n]) => g !== s.genre || n !== s.nombre).map(([genre, nombre]) => {
    const mot = accorderParticipe(v.participe, { genre, nombre });
    return [mot, `${analyse(s)} « ${mot} » serait ${categorie(genre, nombre)}.`] as const;
  }),
  [v.infinitif, 'C’est l’infinitif : après être, il faut ici le participe passé.'],
];

function qcmEtre(rng: Rng, s: SujetAccorde, v: VerbeEtre, aux: string, nbFaux: number): QuestionDraft {
  const bon = accorderParticipe(v.participe, s);
  const faux = piegesParticipeEtre(v, s);
  // Avec trois pièges, l'infinitif (ou une autre forme) complète les quatre propositions.
  const choisis = nbFaux === 2 ? pickN(rng, faux.slice(0, 3), 2) : [...pickN(rng, faux.slice(0, 3), 2), at(faux, 3)];
  const { answer, traps } = choice(
    rng,
    bon,
    choisis.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: `${nbFaux === 2 ? 'Choisis la bonne écriture' : 'Quatre écritures, une seule juste'} : « ${s.texte} ${aux} … ${v.fin}. » (${v.infinitif})`,
    answer,
    traps,
    hint: 'Regarde le sujet : masculin ou féminin ? Un seul ou plusieurs ?',
    steps: [DEF_ETRE, analyse(s), `On écrit **${s.texte} ${aux} ${bon}**.`],
  };
}

function ecrireEtre(s: SujetAccorde, v: VerbeEtre, phrase: (trou: string) => string, hint: string): QuestionDraft {
  const bon = accorderParticipe(v.participe, s);
  return {
    prompt: `Écris le participe passé de « ${v.infinitif} » : « ${phrase('…')} »`,
    answer: { kind: 'text', accepted: [bon] },
    traps: textTraps([bon], piegesParticipeEtre(v, s)),
    hint,
    steps: [DEF_ETRE, analyse(s), `On écrit **${phrase(bon)}**`],
  };
}

function participeEtreDraft(rng: Rng, level: Level): QuestionDraft {
  const simple = () => rng.pick(SUJETS_PARTICIPE);
  const verbe = () => rng.pick(VERBES_ETRE_CM2);
  switch (level) {
    case 1: {
      const s = simple();
      return qcmEtre(rng, s, verbe(), auPresent(s.nombre), 2);
    }
    case 2: {
      const s = simple();
      return qcmEtre(rng, s, verbe(), auPlusQueParfait(s.nombre), 3);
    }
    case 3: {
      const s = simple();
      const v = verbe();
      const aux = rng.pick([auPresent(s.nombre), auPlusQueParfait(s.nombre)]);
      return ecrireEtre(
        s,
        v,
        (t) => `${s.texte} ${aux} ${t} ${v.fin}.`,
        'Trouve le sujet, puis ajoute les marques de son genre et de son nombre.',
      );
    }
    case 4: {
      if (rng.int(0, 1) === 0) {
        const s = rng.pick(SUJETS_APRES);
        const v = verbeEtre(rng.pick(VERBES_APRES));
        const aux = rng.pick([auPresent(s.nombre), auPlusQueParfait(s.nombre)]);
        const debut = rng.pick(['Ce matin', 'À midi', 'Hier soir']);
        return ecrireEtre(
          s,
          v,
          (t) => `${debut} ${aux} ${t} ${s.texte}.`,
          'Le sujet est caché après le participe. Cherche « qui est-ce qui ? ».',
        );
      }
      const s = rng.pick(SUJETS_PARTICIPE_PIEGES);
      const v = verbe();
      const negation = s.nombre === 'sg' ? 'n’était pas' : 'n’étaient pas';
      return ecrireEtre(
        s,
        v,
        (t) => `${s.texte} ${negation} ${t} ${v.fin}.`,
        'Cherche le nom noyau du sujet, ou les deux noms. Le mot proche du verbe peut te tromper.',
      );
    }
    default: {
      const eloignes = pickN(rng, SUJETS_PARTICIPE_PIEGES, 2);
      const apres = rng.pick(SUJETS_APRES);
      const verbes = pickN(rng, VERBES_ETRE_CM2, 2);
      const dernier = verbeEtre(rng.pick(VERBES_APRES.filter((x) => verbes.every((v) => v.infinitif !== x))));
      const lignes = [
        ...eloignes.map((s, i) => {
          const v = at(verbes, i);
          return { s, v, texte: `${s.texte} … … (${v.infinitif}) ${v.fin}.` };
        }),
        { s: apres, v: dernier, texte: `Puis … … (${dernier.infinitif}) ${apres.texte}.` },
      ];
      const reponses = lignes.map((l) => [auPlusQueParfait(l.s.nombre), accorderParticipe(l.v.participe, l.s)]);
      return {
        prompt:
          'Lis le texte. Mets chaque ligne au plus-que-parfait : écris « était » ou « étaient », puis le participe passé.',
        figure: document(
          'Récit de la classe verte',
          lignes.map((l) => l.texte),
        ),
        answer: parLignes(reponses),
        hint: 'Le sujet commande l’auxiliaire et le participe. Sur une ligne, il est placé à la fin.',
        steps: [
          'Au plus-que-parfait : l’auxiliaire à l’imparfait, puis le participe passé.',
          DEF_ETRE,
          ...lignes.map((l) => analyse(l.s)),
          `Réponses : **${reponses.map((r) => r.join(' ')).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Participe passé avec avoir ─────────────────────────

const DEF_AVOIR = 'Avec avoir, le participe passé s’accorde avec le COD seulement si le COD est placé avant.';

const accordCod = (x: Objet) => accorderParticipe(x.participe, x);
const formesDe = (x: Objet) => CATEGORIES.map(([genre, nombre]) => accorderParticipe(x.participe, { genre, nombre }));
const avant = (x: Objet) =>
  `Le COD « ${x.nombre === 'pl' ? 'les' : 'l’'} » est placé avant : il reprend « ${x.cod} » (${categorie(x.genre, x.nombre)}).`;
const apres = (x: Objet) => `Le COD « ${x.cod} » est placé après : le participe passé reste « ${x.participe} ».`;

/** « La tarte, je l’ai [mangée]. » */
const phraseAvant = (x: Objet, a: Auteur, mot: string) => `${maj(x.cod)}, ${avecPronom(a, x)} ${mot}.`;
/** « J’ai [mangé] la tarte. » */
const phraseApres = (x: Objet, a: Auteur, mot: string) => `${maj(sansPronom(a))} ${mot} ${x.cod}.`;

interface Cas {
  readonly x: Objet;
  readonly a: Auteur;
  readonly placeAvant: boolean;
}
const attendu = (c: Cas) => (c.placeAvant ? accordCod(c.x) : c.x.participe);
const phraseCas = (c: Cas, mot: string) => (c.placeAvant ? phraseAvant(c.x, c.a, mot) : phraseApres(c.x, c.a, mot));
const raisonCas = (c: Cas) => (c.placeAvant ? avant(c.x) : apres(c.x));

const piegesAvoir = (c: Cas): (readonly [string, Rich])[] => [
  ...formesDe(c.x).map((mot) => [mot, `${raisonCas(c)} Le sujet, lui, ne commande pas le participe.`] as const),
  [c.x.infinitif, 'C’est l’infinitif : après avoir, il faut ici le participe passé.'],
];

/** Les objets dont le participe change à l'écrit quand ils sont placés avant. */
const ACCORD_VISIBLE = OBJETS_AVOIR.filter((x) => accordCod(x) !== x.participe);

const tirerCas = (rng: Rng, x: Objet, placeAvant: boolean): Cas => ({ x, a: rng.pick(AUTEURS), placeAvant });

function ecrireAvoir(c: Cas, trou: string, hint: string): QuestionDraft {
  const bon = attendu(c);
  return {
    prompt: `Écris le participe passé de « ${c.x.infinitif} » : « ${trou} »`,
    answer: { kind: 'text', accepted: [bon] },
    traps: textTraps([bon], piegesAvoir(c)),
    hint,
    steps: [DEF_AVOIR, raisonCas(c), `On écrit **${bon}**.`],
  };
}

function participeAvoirDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const c = tirerCas(rng, rng.pick(ACCORD_VISIBLE), true);
      const bon = attendu(c);
      const faux = piegesAvoir(c).filter(([t]) => t !== bon && t !== c.x.infinitif);
      const { answer, traps } = choice(
        rng,
        bon,
        [at(faux, 0), rng.pick(faux.slice(1))].map(([label, why]) => ({ label, why })),
      );
      return {
        prompt: `Le COD est placé avant. Choisis : « ${phraseCas(c, '…')} »`,
        answer,
        traps,
        hint: 'Que remplace le petit pronom avant « avoir » ? Regarde son genre et son nombre.',
        steps: [DEF_AVOIR, raisonCas(c), `On écrit **${phraseCas(c, bon)}**`],
      };
    }
    case 2: {
      const c = tirerCas(rng, rng.pick(ACCORD_VISIBLE), rng.int(0, 1) === 0);
      const bon = attendu(c);
      const faux = [...formesDe(c.x).filter((m) => m !== bon), c.x.infinitif];
      // La forme qu'on écrit en oubliant la règle est toujours proposée.
      const oubli = c.placeAvant ? c.x.participe : accordCod(c.x);
      const choisis = [
        oubli,
        ...pickN(
          rng,
          faux.filter((m) => m !== oubli),
          2,
        ),
      ];
      const { answer, traps } = choice(
        rng,
        phraseCas(c, bon),
        choisis.map((m) => ({
          label: phraseCas(c, m),
          why: m === c.x.infinitif ? 'Après avoir, il faut le participe passé, pas l’infinitif.' : raisonCas(c),
        })),
      );
      return {
        prompt: c.placeAvant
          ? `Mot à reprendre : « ${c.x.cod} ». Quelle phrase avec un pronom avant « avoir » est bien écrite ?`
          : `Le groupe « ${c.x.cod} » termine la phrase. Quelle phrase est bien écrite ?`,
        answer,
        traps,
        hint: 'Cherche le COD. Est-il avant ou après le verbe ?',
        steps: [DEF_AVOIR, raisonCas(c), `La bonne phrase : **${phraseCas(c, bon)}**`],
      };
    }
    case 3: {
      const c = tirerCas(rng, rng.pick(OBJETS_AVOIR), true);
      return ecrireAvoir(c, phraseCas(c, '…'), 'Remonte du pronom au nom qu’il remplace, puis accorde.');
    }
    case 4: {
      const x = rng.pick(ACCORD_VISIBLE);
      if (rng.int(0, 1) === 0) {
        const c = tirerCas(rng, x, false);
        return ecrireAvoir(c, phraseCas(c, '…'), 'Où est le COD ? Et le sujet commande-t-il avec « avoir » ?');
      }
      const c = tirerCas(rng, x, true);
      const negation = `${maj(x.cod)}, ${c.a.texte} ne ${x.nombre === 'pl' ? 'les' : 'l’'}${x.nombre === 'pl' ? ' ' : ''}${c.a.aux} pas …`;
      return ecrireAvoir(c, `${negation}.`, 'Où est le COD ? La négation ne change rien à l’accord.');
    }
    default: {
      const [x, y, z] = pickN(rng, ACCORD_VISIBLE, 3) as [Objet, Objet, Objet];
      const cas: readonly Cas[] = rng.shuffle([
        tirerCas(rng, x, true),
        tirerCas(rng, y, false),
        tirerCas(rng, z, true),
      ]);
      const partants = rng.pick(SUJETS_APRES);
      const depart = accorderParticipe('parti', partants);
      const aux = auPresent(partants.nombre);
      return {
        prompt: 'Lis le texte. Écris le participe passé du verbe entre parenthèses, sur chaque ligne.',
        figure: document('Après le goûter', [
          ...cas.map((c) => phraseCas(c, `… (${c.x.infinitif})`)),
          `Ensuite, ${partants.texte} ${aux} … (partir).`,
        ]),
        answer: parLignes([...cas.map((c) => [attendu(c)]), [depart]]),
        hint: 'Regarde d’abord l’auxiliaire : avoir ou être ? Avec avoir, cherche la place du COD.',
        steps: [
          DEF_AVOIR,
          ...cas.map(raisonCas),
          `Dernière ligne : avec être, on accorde avec le sujet « ${partants.texte} ».`,
          `Réponses : **${[...cas.map(attendu), depart].join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 5. Pluriels et féminins particuliers ─────────────────────────

const consigne = (f: Forme) => (f.genreOuNombre === 'pluriel' ? 'au pluriel' : 'au féminin');
const article = (f: Forme) => (f.genreOuNombre === 'pluriel' ? 'des' : 'une');
const accepte = (f: Forme) => [f.forme, ...(f.variante ? [f.variante] : [])];

const piegesForme = (f: Forme): (readonly [string, Rich])[] => [
  [f.faux, f.regle],
  [f.base, `Le mot doit changer : on le veut ${consigne(f)}.`],
];

function ecrireForme(f: Forme, hint: string): QuestionDraft {
  // L'élève peut recopier le petit mot : « des chevaux », « une louve ».
  const accepted = accepte(f).flatMap((x) => [x, `${article(f)} ${x}`]);
  return {
    prompt: `Écris ${consigne(f)} le mot « ${f.base} ».`,
    answer: { kind: 'text', accepted },
    traps: textTraps(accepted, piegesForme(f)),
    hint,
    steps: ['Regarde la fin du mot de départ.', f.regle, `On écrit **${f.forme}**.`],
  };
}

function particuliersDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const f = rng.pick(PLURIELS_COURANTS);
      const { answer, traps } = choice(rng, f.forme, [
        { label: f.faux, why: f.regle },
        { label: f.base, why: 'Il manque la marque du pluriel.' },
      ]);
      return {
        prompt: `Quel est le pluriel de « ${f.base} » ?`,
        answer,
        traps,
        hint: 'Regarde la fin du mot : -al, -eau ou -eu ?',
        steps: ['Certaines fins de mots changent au pluriel.', f.regle, `C’est **${f.forme}**.`],
      };
    }
    case 2: {
      const f = rng.pick(FEMININS_COURANTS);
      const { answer, traps } = choice(rng, f.forme, [
        { label: f.faux, why: f.regle },
        { label: f.base, why: `« ${f.base} » est le masculin : au féminin, le mot doit changer.` },
      ]);
      return {
        prompt: `Quel est le féminin de « ${f.base} » ?`,
        answer,
        traps,
        hint: 'Dis le mot avec « une » devant, puis compare bien la fin de chaque écriture.',
        steps: ['Le féminin ne s’écrit pas toujours avec un simple e.', f.regle, `C’est **${f.forme}**.`],
      };
    }
    case 3:
      return ecrireForme(
        rng.pick(rng.pick([PLURIELS_COURANTS, FEMININS_COURANTS])),
        'Dis le mot dans un petit groupe (« des… » ou « une… »), puis regarde bien sa fin.',
      );
    case 4:
      return ecrireForme(
        rng.pick(rng.pick([PLURIELS_RARES, FEMININS_RARES])),
        'Attention : ce mot est à part. La règle la plus simple ne marche pas forcément.',
      );
    default: {
      const lignes = pickN(rng, PHRASES_FORMES, 4).map((p) => ({ p, f: formeParticuliere(p.base) }));
      return {
        prompt: 'Lis le texte. Écris le mot entre parenthèses au pluriel ou au féminin, selon la phrase.',
        figure: document(
          'Journal du quartier',
          lignes.map(({ p }) => `${p.debut} (${p.base}) ${p.fin}`.replace(' .', '.')),
        ),
        answer: {
          kind: 'cloze',
          parts: [...lignes.map((_, i) => `${i === 0 ? '' : '. '}Ligne ${i + 1} : `), '.'],
          blanks: lignes.map(({ f }) => ({ mode: 'text' as const, accepted: accepte(f) })),
        },
        hint: 'Lis les petits mots autour : « les », « des », « deux » ou « la », « une ».',
        steps: [
          'Le sens de la phrase dit s’il faut un pluriel ou un féminin.',
          ...lignes.map(({ f }) => `« ${f.base} » ${consigne(f)} : ${f.regle}`),
          `Réponses : **${lignes.map(({ f }) => f.forme).join(', ')}**.`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesAccordsCm2(n.factId, ...n.faits) },
  generate: n.generate,
});

const faitsDe = (list: readonly { readonly fait: string }[]) => list.map((x) => x.fait);

export const FCM2_ACCORDS: readonly Skill[] = [
  skill({
    id: 'fcm2-accord-sujet-verbe',
    title: 'Sujet inversé ou éloigné : accorder le verbe',
    memo: [
      'Le verbe s’accorde avec son sujet. Cherche-le avec « qui est-ce qui ? ».',
      '**Sujet inversé** : il est après le verbe. « Dans le ciel volent les hirondelles. »',
      'Sujet éloigné : trouve le **nom noyau**. « Les lampes de la salle brillent. »',
    ],
    factId: 'sujet-inverse-programme',
    faits: ['accord-verbe-gs'],
    generate: sujetVerbeDraft,
  }),
  skill({
    id: 'fcm2-accord-attribut',
    title: 'L’accord de l’attribut du sujet',
    memo: [
      'Un **verbe attributif** (être, sembler, paraître, rester, devenir) relie un adjectif au sujet.',
      'Cet adjectif est **attribut du sujet** : il prend le genre et le nombre du sujet.',
      '« La valise semble lourde. Les cartons semblent lourds. »',
    ],
    factId: 'chaine-attribut',
    faits: [
      'accord-adjectif-nom',
      'attribut-exemple',
      'verbes-attributifs',
      'paraitre-rectifie',
      ...faitsDe(Object.values(ADJ_REGULIERS)),
      ...faitsDe(ATTRIBUTS_ELOIGNES.map((x) => x.adjectif)),
    ],
    generate: attributDraft,
  }),
  skill({
    id: 'fcm2-participe-etre',
    title: 'Le participe passé avec être (CM2)',
    memo: [
      'Avec l’**auxiliaire** être, le **participe passé** s’accorde avec le sujet.',
      'Pareil au **plus-que-parfait** : « Elles étaient parties. »',
      'Même quand le sujet est après : « Ce matin sont arrivées les nageuses. »',
    ],
    factId: 'pp-etre-programme',
    faits: ['pp-etre-regle', 'temps-composes-programme'],
    generate: participeEtreDraft,
  }),
  skill({
    id: 'fcm2-participe-avoir-cod',
    title: 'Avoir : le COD placé avant',
    memo: [
      'Avec avoir, le **participe passé** ne s’accorde pas avec le sujet.',
      'Il s’accorde avec le **COD** placé avant : « La tarte, je l’ai mangée. »',
      'COD après : pas d’accord. « J’ai mangé la tarte. »',
    ],
    factId: 'pp-avoir-programme',
    faits: ['pp-avoir-regle', 'pp-etre-regle'],
    generate: participeAvoirDraft,
  }),
  skill({
    id: 'fcm2-pluriels-feminins',
    title: 'Pluriels et féminins particuliers',
    memo: [
      'Au **pluriel**, -al devient souvent -aux (des chevaux). Mais : des bals, des festivals.',
      'Les noms en -eau prennent un x : des bateaux. Autres cas à retenir : des travaux, des bijoux, des pneus, des bleus.',
      'Au **féminin**, certains mots changent : nouveau → nouvelle, public → publique, loup → louve.',
    ],
    factId: 'pluriels-irreguliers',
    faits: [
      'variations-particulieres',
      ...faitsDe([...PLURIELS_COURANTS, ...PLURIELS_RARES, ...FEMININS_COURANTS, ...FEMININS_RARES]),
    ],
    generate: particuliersDraft,
  }),
];
