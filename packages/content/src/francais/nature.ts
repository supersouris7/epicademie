import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill, Trap } from '../types.ts';
import {
  CATEGORIES,
  CONJONCTIONS,
  DEMONSTRATIFS,
  FONCTIONS_NOMS,
  FORMES_POSSESSIF,
  GROUPES,
  LIGNES_ADVERBES,
  LIGNES_ARTICLES,
  LIGNES_CONJ,
  LIGNES_DETERMINANTS,
  MOTS_NON_CONJ,
  NATURES_NOMS,
  NATURES_PHRASE,
  NOMS_DEMONSTRATIFS,
  NOMS_VERBES,
  OBJETS,
  OBJETS_PHRASES,
  PAIRES,
  PHRASES_ADVERBES,
  PHRASES_CONJ,
  PHRASES_NATURES,
  PHRASES_PRONOMS,
  PLURIELS,
  POSSESSEURS,
  POSSESSIFS,
  ROLES,
  SUJETS_GN,
  articleDe,
  faitNature,
  phraseObjet,
  phrasePronom,
  possessif,
  sourcesDe,
  type Groupe,
  type Nature,
  type Objet,
  type ObjetPhrase,
  type Possesseur,
  type PronomObjet,
} from './nature.donnees.ts';
import { at, document, pickN, same, textTrap } from './outils.ts';

/**
 * Chapitre « Nature des mots » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Identifier les mots, un groupe de mots selon leur nature ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitNature(id).citation} »`;

/** Une réponse écrite avec ou sans point final. */
const avecOuSansPoint = (s: string) => [s, s.replace(/\.$/, '')];

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

/** Colonne de droite mélangée (jamais déjà en face) et paires attendues. */
function appariement(rng: Rng, droite: readonly string[]) {
  let order = rng.shuffle(droite.map((_, i) => i));
  if (order.every((v, i) => v === i)) order = [...order.slice(1), at(order, 0)];
  return { right: order.map((i) => at(droite, i)), pairs: droite.map((_, i) => order.indexOf(i)) };
}

/** Trois lignes dont une au moins compte pour la question. */
function troisLignes<T>(rng: Rng, lignes: readonly T[], compte: (l: T) => number): T[] {
  const bonne = rng.pick(lignes.filter((l) => compte(l) > 0));
  return rng.shuffle([
    bonne,
    ...pickN(
      rng,
      lignes.filter((l) => l !== bonne),
      2,
    ),
  ]);
}

const total = <T>(lignes: readonly T[], compte: (l: T) => number) => lignes.reduce((n, l) => n + compte(l), 0);

// ───────────────────────── 1. Nature ou fonction ─────────────────────────

const NATURE = 'une nature';
const FONCTION = 'une fonction';
const DEF_NATURE = 'La nature, c’est la sorte de mot : nom, verbe, adjectif, déterminant, pronom…';
const DEF_FONCTION = 'La fonction, c’est le rôle dans la phrase : sujet, complément…';

const SUJET_OK = ['sujet', 'le sujet', 'sujet du verbe', 'le sujet du verbe', 'groupe sujet', 'le groupe sujet'];
const OBJET_OK = [
  'complément d’objet',
  'complément d’objet direct',
  'COD',
  'complement d’objet',
  'complement d’objet direct',
].flatMap((x) => [x, `un ${x}`, `le ${x}`]);
const GN_OK = ['groupe nominal', 'un groupe nominal', 'GN', 'un GN'];

const WHY_SUJET = 'Le sujet dit qui fait l’action. Ce groupe ne fait pas l’action ici.';
const WHY_OBJET = 'Un complément d’objet suit le verbe et le complète. Ici, le groupe fait l’action.';
const WHY_GN = 'Le groupe nominal, c’est la nature du groupe. La question demande sa fonction : son rôle.';

const WHY_NATURE: Record<Nature, string> = {
  nom: 'Un nom désigne une personne, un animal ou une chose.',
  verbe: 'Un verbe dit ce qu’on fait. Il change avec le sujet et le temps.',
  adjectif: 'Un adjectif dit comment est le nom.',
  déterminant: 'Un déterminant est le petit mot placé devant le nom.',
  pronom: 'Un pronom remplace un nom ou une personne.',
};

function natureFonctionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const estNature = rng.int(0, 1) === 0;
      const mot = rng.pick<string>(estNature ? NATURES_NOMS : FONCTIONS_NOMS);
      const bon = estNature ? NATURE : FONCTION;
      const { answer, traps } = choice(rng, bon, [
        { label: estNature ? FONCTION : NATURE, why: estNature ? DEF_NATURE : DEF_FONCTION },
        { label: 'un temps du verbe', why: `Les temps sont le présent ou le futur. « ${mot} » n’est pas un temps.` },
      ]);
      return {
        prompt: `Quand on dit « ${mot} », on nomme…`,
        answer,
        traps,
        hint: 'Demande-toi : est-ce la sorte du mot, ou son rôle dans la phrase ?',
        steps: [DEF_NATURE, DEF_FONCTION, `« ${mot} » nomme **${bon}**.`],
      };
    }
    case 2: {
      const phrase = rng.pick(PHRASES_NATURES);
      const [mot, nature] = rng.pick(phrase);
      const { answer, traps } = choice(
        rng,
        nature,
        pickN(
          rng,
          NATURES_PHRASE.filter((n) => n !== nature),
          3,
        ).map((n) => ({ label: n, why: `${WHY_NATURE[n]} Ce n’est pas le cas de « ${mot} ».` })),
      );
      return {
        prompt: `Dans « ${phrase.map(([m]) => m).join(' ')}. », quelle est la nature du mot « ${mot} » ?`,
        answer,
        traps,
        hint: 'Demande-toi ce que fait ce mot : nommer, agir, décrire, accompagner un nom ou remplacer ?',
        steps: [DEF_NATURE, WHY_NATURE[nature], `« ${mot} » est un **${nature}**.`],
      };
    }
    case 3: {
      const g = rng.pick(GROUPES);
      const estSujet = rng.int(0, 1) === 0;
      const accepted = estSujet ? SUJET_OK : OBJET_OK;
      return {
        prompt: `Écris la fonction du groupe « ${g.gn} » dans : « ${estSujet ? g.sujet : g.objet} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          estSujet ? ['complément d’objet', WHY_OBJET] : ['sujet', WHY_SUJET],
          ['groupe nominal', WHY_GN],
          [
            'complément circonstanciel',
            'Un complément circonstanciel peut se déplacer et se supprimer. Pas ce groupe.',
          ],
        ]),
        hint: 'Cherche le verbe. Ce groupe fait-il l’action, ou complète-t-il le verbe ?',
        steps: [
          'La fonction, c’est le rôle du groupe dans la phrase.',
          estSujet
            ? `Je demande « qui est-ce qui ? » devant le verbe : la réponse est « ${g.gn} ».`
            : `« ${g.gn} » suit le verbe et le complète : on ne peut pas le déplacer.`,
          `La fonction est : **${estSujet ? 'sujet' : 'complément d’objet'}**.`,
        ],
      };
    }
    case 4: {
      const phrase = rng.pick(PHRASES_NATURES);
      const mots = rng.shuffle(phrase);
      const { right, pairs } = appariement(
        rng,
        mots.map(([, n]) => n),
      );
      const texte = `${phrase.map(([m]) => m).join(' ')}.`;
      return {
        prompt: `Phrase : « ${texte} » Associe chaque mot à sa nature.`,
        answer: { kind: 'match', left: mots.map(([m]) => m), right, pairs },
        hint: 'Commence par le verbe, puis cherche le nom et les mots qui l’accompagnent.',
        steps: [
          'Je cherche d’abord le verbe : il dit ce qu’on fait.',
          'Puis le nom, son déterminant, son adjectif. Le pronom remplace une personne.',
          `Les natures sont : **${phrase.map(([m, n]) => `${m} = ${n}`).join(', ')}**.`,
        ],
      };
    }
    default: {
      const g: Groupe = rng.pick(GROUPES);
      const sujetDAbord = rng.int(0, 1) === 0;
      const lignes = sujetDAbord ? [g.sujet, g.objet] : [g.objet, g.sujet];
      const roles = sujetDAbord ? [SUJET_OK, OBJET_OK] : [OBJET_OK, SUJET_OK];
      return {
        prompt: `Lis les deux lignes. Pour « ${g.gn} », écris sa fonction sur chaque ligne, puis sa nature.`,
        figure: document('Deux phrases', lignes),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1, fonction : ', '. Ligne 2, fonction : ', '. Nature du groupe : ', '.'],
          blanks: [...roles, GN_OK].map((accepted) => ({ mode: 'text' as const, accepted })),
        },
        hint: 'La fonction peut changer d’une ligne à l’autre. La nature dit quelle sorte de groupe c’est.',
        steps: [
          'Sur chaque ligne, je cherche le verbe, puis le rôle du groupe par rapport à lui.',
          'La nature du groupe : il a un nom principal et un déterminant.',
          `Réponses : **${sujetDAbord ? 'sujet, complément d’objet' : 'complément d’objet, sujet'}, groupe nominal**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Articles définis et indéfinis ─────────────────────────

const DEFINI = 'un article défini';
const INDEFINI = 'un article indéfini';
const LISTE_DEF = 'Les articles définis sont « le, la, l’, les ».';
const LISTE_INDEF = 'Les articles indéfinis sont « un, une, des ».';
const liste = (defini: boolean) => (defini ? LISTE_DEF : LISTE_INDEF);
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function articlesDraft(rng: Rng, level: Level): QuestionDraft {
  const defini = rng.int(0, 1) === 0;
  const type = defini ? DEFINI : INDEFINI;
  switch (level) {
    case 1: {
      const n = rng.pick(NOMS_VERBES);
      const art = maj(articleDe(n, defini));
      const { answer, traps } = choice(rng, type, [
        { label: defini ? INDEFINI : DEFINI, why: liste(!defini) + ` « ${art} » n’en fait pas partie.` },
        { label: 'un verbe', why: `Le verbe est « ${n.verbe} ». « ${art} » accompagne le nom.` },
      ]);
      return {
        prompt: `Dans « ${art} ${n.nom} ${n.verbe}. », le mot « ${art} » est…`,
        answer,
        traps,
        hint: 'Regarde ce petit mot devant le nom. Désigne-t-il une chose précise, ou une parmi d’autres ?',
        steps: [LISTE_DEF, LISTE_INDEF, `« ${art} » est **${type}**.`],
      };
    }
    case 2: {
      const tirage = pickN(rng, NOMS_VERBES, 4);
      const premier = at(tirage, 0);
      const phrase = (n: (typeof NOMS_VERBES)[number], d: boolean) => `${maj(articleDe(n, d))} ${n.nom} ${n.verbe}.`;
      const { answer, traps } = choice(
        rng,
        phrase(premier, defini),
        tirage.slice(1).map((n) => ({
          label: phrase(n, !defini),
          why: `« ${maj(articleDe(n, !defini))} » est ${defini ? INDEFINI : DEFINI}.`,
        })),
      );
      return {
        prompt: `Quelle phrase contient ${type} ?`,
        answer,
        traps,
        hint: 'Lis le premier mot de chaque phrase et compare avec ta liste d’articles.',
        steps: [
          liste(defini),
          'Je lis le petit mot devant chaque nom.',
          `La phrase est : **${phrase(premier, defini)}**`,
        ],
      };
    }
    case 3: {
      const n = rng.pick(NOMS_VERBES);
      const bon = articleDe(n, defini);
      const accepted = [bon];
      const autreGenre = articleDe({ ...n, genre: n.genre === 'm' ? 'f' : 'm' }, defini);
      return {
        prompt: `Complète avec ${type} : « … ${n.nom} ${n.verbe}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [articleDe(n, !defini), `C’est ${defini ? INDEFINI : DEFINI}. La consigne demande ${type}.`],
          [autreGenre, `Regarde le genre de « ${n.nom} » : il est ${n.genre === 'm' ? 'masculin' : 'féminin'}.`],
          [
            articleDe({ ...n, pluriel: !n.pluriel }, defini),
            'Regarde le nombre : le nom est-il au singulier ou au pluriel ?',
          ],
        ]),
        hint: 'Regarde le nom : masculin ou féminin ? un seul ou plusieurs ?',
        steps: [
          liste(defini),
          `« ${n.nom} » est ${n.genre === 'm' ? 'masculin' : 'féminin'}, ${n.pluriel ? 'au pluriel' : 'au singulier'}.`,
          `L’article est **${bon}**.`,
        ],
      };
    }
    case 4: {
      const p = rng.pick(PAIRES);
      const [depart, bon] = defini ? [p.indefini, p.defini] : [p.defini, p.indefini];
      const nom = p.defini.replace(/^(l’|le |la |les )/, '');
      const faux = defini ? [`le ${nom}`, `la ${nom}`, `les ${nom}`] : [`un ${nom}`, `une ${nom}`, `des ${nom}`];
      return {
        prompt: `Écris le groupe « ${depart} » en le faisant commencer par ${type}.`,
        answer: { kind: 'text', accepted: [bon] },
        traps: textTraps(
          [bon],
          [
            [depart, `Tu as recopié le groupe. Il faut changer l’article : ${liste(defini)}`],
            ...faux.map(
              (t) =>
                [
                  t,
                  defini
                    ? 'Vérifie le genre et le nombre. Devant une voyelle ou un h muet, « le » et « la » deviennent « l’ ».'
                    : 'Vérifie le genre et le nombre du nom : « un », « une » ou « des ».',
                ] as const,
            ),
          ],
        ),
        hint: defini
          ? 'Attention à la première lettre du nom : elle peut changer la forme de l’article.'
          : 'Trouve le genre du nom, puis regarde s’il y en a un ou plusieurs.',
        steps: [
          liste(defini),
          'Je garde le nom et je change seulement le petit mot devant.',
          `Le groupe est **${bon}**.`,
        ],
      };
    }
    default: {
      const compte = (l: (typeof LIGNES_ARTICLES)[number]) => (defini ? l.definis : l.indefinis);
      const lignes = troisLignes(rng, LIGNES_ARTICLES, compte);
      const k = total(lignes, compte);
      const autres = total(lignes, (l) => (defini ? l.indefinis : l.definis));
      return {
        prompt: `Lis ce texte. Combien d’articles ${defini ? 'définis' : 'indéfinis'} contient-il ?`,
        figure: document(
          'Quelques phrases',
          lignes.map((l) => l.texte),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [autres, `Tu as compté les articles ${defini ? 'indéfinis' : 'définis'}. Relis la question.`],
          [k + autres, 'Tu as compté tous les articles. Garde seulement la sorte demandée.'],
          [k + 1, 'Tu en as un de trop : recompte. Les mots « mon », « ce » ou « notre » ne sont pas des articles.'],
        ]),
        hint: 'Relève ligne par ligne les petits mots devant les noms.',
        steps: [
          liste(defini),
          'Je lis chaque ligne et je coche les bons articles, même « l’ ».',
          `Il y en a **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Déterminants possessifs et démonstratifs ─────────────────────────

const POSS = 'un déterminant possessif';
const DEM = 'un déterminant démonstratif';
const DEF_POSS = 'Le déterminant possessif dit à qui c’est : mon, ton, son, notre, votre, leur…';
const DEF_DEM = 'Le déterminant démonstratif montre : ce, cet, cette, ces.';
const defDet = (poss: boolean) => (poss ? DEF_POSS : DEF_DEM);
const NOMS_SIMPLES: Record<string, string> = {
  mon: 'sac',
  ma: 'table',
  mes: 'jouets',
  ton: 'sac',
  ta: 'table',
  tes: 'jouets',
  son: 'sac',
  sa: 'table',
  ses: 'jouets',
  notre: 'sac',
  nos: 'jouets',
  votre: 'sac',
  vos: 'jouets',
  leur: 'sac',
  leurs: 'jouets',
  ce: 'sac',
  cet: 'avion',
  cette: 'table',
  ces: 'jouets',
};

/** Genre et nombre de l’objet, et la règle de la voyelle quand « mon, ton, son » remplacent « ma, ta, sa ». */
function accordPossessif(p: Possesseur, o: Objet) {
  const [masculin, feminin] = FORMES_POSSESSIF[p];
  const det = possessif(p, o);
  const devantVoyelle = !o.pluriel && o.genre === 'f' && det === masculin && masculin !== feminin;
  return {
    genre: `${o.genre === 'm' ? 'masculin' : 'féminin'} ${o.pluriel ? 'pluriel' : 'singulier'}`,
    regle: devantVoyelle ? ' Devant une voyelle, on écrit « mon, ton, son » même au féminin.' : '',
  };
}

function determinantsDraft(rng: Rng, level: Level): QuestionDraft {
  const poss = rng.int(0, 1) === 0;
  const type = poss ? POSS : DEM;
  switch (level) {
    case 1: {
      const det = rng.pick(poss ? POSSESSIFS : DEMONSTRATIFS);
      const nom = NOMS_SIMPLES[det] ?? 'sac';
      const { answer, traps } = choice(rng, type, [
        { label: poss ? DEM : POSS, why: `${defDet(!poss)} « ${det} » ${poss ? 'dit à qui c’est' : 'montre'}.` },
        { label: 'un article', why: `Les articles sont « le, la, l’, les, un, une, des ». Pas « ${det} ».` },
      ]);
      return {
        prompt: `Dans « ${det} ${nom} », le mot « ${det} » est…`,
        answer,
        traps,
        hint: 'Ce mot sert-il à montrer, ou à dire à qui c’est ?',
        steps: [DEF_POSS, DEF_DEM, `« ${det} » est **${type}**.`],
      };
    }
    case 2: {
      const nom = rng.pick(['sac', 'vélo', 'jeu', 'livre', 'ballon', 'chapeau']);
      const monPoss = rng.pick(['mon', 'ton', 'son']);
      const groupes = {
        poss: `${monPoss} ${nom}`,
        dem: `ce ${nom}`,
        def: `le ${nom}`,
        indef: `un ${nom}`,
      };
      const bon = poss ? groupes.poss : groupes.dem;
      const { answer, traps } = choice(rng, bon, [
        {
          label: poss ? groupes.dem : groupes.poss,
          why: `Ici, le petit mot ${poss ? 'montre' : 'dit à qui c’est'} : il est ${poss ? 'démonstratif' : 'possessif'}.`,
        },
        { label: groupes.def, why: '« le » est un article défini.' },
        { label: groupes.indef, why: '« un » est un article indéfini.' },
      ]);
      return {
        prompt: `Quel groupe commence par ${type} ?`,
        answer,
        traps,
        hint: 'Lis le premier mot de chaque groupe : montre-t-il, ou dit-il à qui c’est ?',
        steps: [defDet(poss), 'Je regarde le petit mot devant le nom.', `Le groupe est **${bon}**.`],
      };
    }
    case 3: {
      const x = rng.pick(NOMS_DEMONSTRATIFS);
      const accepted = [x.det];
      return {
        prompt: `Complète avec « ce », « cet », « cette » ou « ces » : « Regarde … ${x.nom}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          DEMONSTRATIFS.map((d) => [d, `Ici, ${x.pourquoi} : « ${d} » ne convient pas.`] as const),
        ),
        hint: 'Regarde le nom : combien ? masculin ou féminin ? quelle première lettre ?',
        steps: [
          'Le démonstratif change avec le nom qui suit.',
          `Ici, ${x.pourquoi}.`,
          `On écrit **${x.det} ${x.nom}**.`,
        ],
      };
    }
    case 4: {
      const p = rng.pick(POSSESSEURS);
      const o = rng.pick(OBJETS);
      const det = possessif(p, o);
      const bon = `${det} ${o.nom}`;
      const formes = [...new Set(FORMES_POSSESSIF[p])];
      const { genre, regle } = accordPossessif(p, o);
      const autre = FORMES_POSSESSIF[p === 'moi' ? 'toi' : 'moi'][o.pluriel ? 2 : 0];
      return {
        prompt: `Remplace « ${o.groupe} qui ${o.pluriel ? 'sont' : 'est'} à ${p} » par un groupe avec un déterminant possessif.`,
        answer: { kind: 'text', accepted: [bon] },
        traps: textTraps(
          [bon],
          [
            ...formes.map(
              (d) => [`${d} ${o.nom}`, `Vérifie le genre et le nombre : « ${o.nom} » est ${genre}.${regle}`] as const,
            ),
            [`${autre} ${o.nom}`, `Ce possessif ne dit pas « à ${p} ».`],
            [o.groupe, 'Il manque le possessif : il dit à qui c’est.'],
          ],
        ),
        hint: `Quel petit mot veut dire « à ${p} » ? Accorde-le avec le nom.`,
        steps: [DEF_POSS, `C’est à ${p}, et « ${o.nom} » est ${genre}.${regle}`, `On écrit **${bon}**.`],
      };
    }
    default: {
      const compte = (l: (typeof LIGNES_DETERMINANTS)[number]) => (poss ? l.possessifs : l.demonstratifs);
      const lignes = troisLignes(rng, LIGNES_DETERMINANTS, compte);
      const k = total(lignes, compte);
      const autres = total(lignes, (l) => (poss ? l.demonstratifs : l.possessifs));
      return {
        prompt: `Lis ce texte. Combien de déterminants ${poss ? 'possessifs' : 'démonstratifs'} contient-il ?`,
        figure: document(
          'Quelques phrases',
          lignes.map((l) => l.texte),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [autres, `Tu as compté les ${poss ? 'démonstratifs' : 'possessifs'}. Relis la question.`],
          [k + autres, 'Tu as compté les deux sortes. Garde seulement la sorte demandée.'],
          [k + 1, 'Tu en as un de trop : un article n’est ni possessif ni démonstratif.'],
        ]),
        hint: 'Regarde le petit mot devant chaque nom, ligne par ligne.',
        steps: [defDet(poss), 'Je lis chaque ligne et je coche les bons mots.', `Il y en a **${k}**.`],
      };
    }
  }
}

// ───────────────────────── 4. Conjonctions de coordination ─────────────────────────

const LISTE_CONJ = 'Les conjonctions de coordination sont : mais, ou, et, donc, or, ni, car.';
const whyNonConj = (m: string) => `« ${m} » n’est pas dans la liste : mais, ou, et, donc, or, ni, car.`;

function conjonctionsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const bon = rng.pick(CONJONCTIONS.filter((c) => c !== 'or' && c !== 'ni'));
      const { answer, traps } = choice(
        rng,
        bon,
        pickN(rng, MOTS_NON_CONJ, 2).map((m) => ({ label: m, why: whyNonConj(m) })),
      );
      return {
        prompt: 'Quel mot est une conjonction de coordination ?',
        answer,
        traps,
        hint: 'C’est un petit mot qui relie des mots ou des phrases.',
        steps: ['Une conjonction de coordination relie.', LISTE_CONJ, `Ici, c’est **${bon}**.`],
      };
    }
    case 2: {
      const p = rng.pick(PHRASES_CONJ.filter((x) => x.conj !== 'or'));
      const { answer, traps } = choice(
        rng,
        p.conj,
        p.autres.map((m) => ({ label: m, why: whyNonConj(m) })),
      );
      return {
        prompt: `Dans « ${p.texte} », quel mot est la conjonction de coordination ?`,
        answer,
        traps,
        hint: 'Cherche le petit mot qui relie les deux parties.',
        steps: ['Je cherche le mot qui relie.', LISTE_CONJ, `La conjonction est **${p.conj}**.`],
      };
    }
    case 3: {
      const p = rng.pick(PHRASES_CONJ);
      const accepted = [p.conj];
      return {
        prompt: `Écris la conjonction de coordination de cette phrase : « ${p.texte} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          p.autres.map((m) => [m, whyNonConj(m)] as const),
        ),
        hint: 'Récite la liste des sept conjonctions, puis cherche l’une d’elles.',
        steps: [LISTE_CONJ, 'Je relis la phrase et je repère le mot de la liste.', `La conjonction est **${p.conj}**.`],
      };
    }
    case 4: {
      const choisies = pickN(rng, Object.keys(ROLES) as (keyof typeof ROLES)[], 5);
      const { right, pairs } = appariement(
        rng,
        choisies.map((c) => ROLES[c]),
      );
      return {
        prompt: `Associe chaque conjonction à ce qu’elle fait : ${choisies.join(', ')}.`,
        answer: { kind: 'match', left: choisies, right, pairs },
        hint: 'Mets chaque conjonction dans une petite phrase à toi : que dit-elle ?',
        steps: [
          'Chaque conjonction relie, mais avec une idée différente.',
          'J’essaie chacune dans une phrase : j’ajoute, je choisis, j’explique ?',
          `Réponses : **${choisies.map((c) => `${c} : ${ROLES[c]}`).join(' ; ')}**.`,
        ],
      };
    }
    default: {
      const lignes = troisLignes(rng, LIGNES_CONJ, (l) => l.n);
      const k = total(lignes, (l) => l.n);
      return {
        prompt:
          'Lis ce texte. Combien de conjonctions de coordination contient-il en tout ? Un mot répété compte à chaque fois.',
        figure: document(
          'Quelques phrases',
          lignes.map((l) => l.texte),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [k + 1, 'Tu en as un de trop : « est », « où » ou « puis » ne sont pas dans la liste.'],
          [
            k - 1,
            lignes.some((l) => l.texte.includes(' ni '))
              ? 'Il t’en manque une : « ni… ni » compte pour deux mots.'
              : 'Il t’en manque une : relis chaque ligne avec la liste des sept mots.',
          ],
          [lignes.filter((l) => l.n > 0).length, 'Tu as compté les lignes. Une ligne peut avoir deux conjonctions.'],
        ]),
        hint: 'Cherche les sept mots de la liste. Attention : « est » n’est pas « et ».',
        steps: [LISTE_CONJ, 'Je compte chaque mot de la liste, même répété.', `Il y en a **${k}**.`],
      };
    }
  }
}

// ───────────────────────── 5. Adverbes fréquents ─────────────────────────

const DEF_ADVERBE = 'L’adverbe précise un verbe, un adjectif ou un autre adverbe. Il ne change jamais.';
const NOMS_PIEGE = ['chien', 'maison', 'gâteau', 'vélo', 'jardin'];
const VERBES_PIEGE = ['chante', 'mange', 'dort', 'dessine', 'saute'];
const whyNonAdverbe = (m: string) => `« ${m} » n’est pas un adverbe : ce mot ne précise pas comment, quand ou où.`;

function adverbesDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const bon = rng.pick(['souvent', 'toujours', 'beaucoup', 'très', 'demain', 'ici', 'vite']);
      const nom = rng.pick(NOMS_PIEGE);
      const verbe = rng.pick(VERBES_PIEGE);
      const { answer, traps } = choice(rng, bon, [
        { label: nom, why: `« ${nom} » est un nom : il désigne un animal ou une chose.` },
        { label: verbe, why: `« ${verbe} » est un verbe : il dit ce qu’on fait.` },
      ]);
      return {
        prompt: 'Quel mot est un adverbe ?',
        answer,
        traps,
        hint: 'Écarte le nom (une chose) et le verbe (une action).',
        steps: [DEF_ADVERBE, 'Les deux autres mots nomment une chose ou une action.', `L’adverbe est **${bon}**.`],
      };
    }
    case 2: {
      if (rng.int(0, 1) === 0) {
        const p = rng.pick(PHRASES_ADVERBES);
        const { answer, traps } = choice(
          rng,
          p.adverbe,
          p.autres.map((m) => ({ label: m, why: whyNonAdverbe(m) })),
        );
        return {
          prompt: `Dans « ${p.texte} », quel mot est un adverbe ?`,
          answer,
          traps,
          hint: 'Cherche le mot qui dit comment, combien, quand ou où.',
          steps: [DEF_ADVERBE, 'Je cherche le mot qui précise.', `L’adverbe est **${p.adverbe}**.`],
        };
      }
      const bon = rng.pick(CATEGORIES.temps);
      const { answer, traps } = choice(rng, bon, [
        { label: rng.pick(CATEGORIES.lieu), why: 'Cet adverbe dit où : c’est un adverbe de lieu.' },
        ...pickN(rng, CATEGORIES['quantité ou intensité'], 2).map((m) => ({
          label: m,
          why: `« ${m} » dit une quantité ou une force, pas un moment.`,
        })),
      ]);
      return {
        prompt: 'Quel adverbe dit quand ?',
        answer,
        traps,
        hint: 'Pose la question « quand ? » : un seul mot peut répondre.',
        steps: [
          'On range les adverbes : le temps (quand ?), le lieu (où ?), la quantité (combien ?).',
          'Je pose la question « quand ? » à chaque mot.',
          `La réponse est **${bon}**.`,
        ],
      };
    }
    case 3: {
      const p = rng.pick(PHRASES_ADVERBES);
      const accepted = [p.adverbe];
      return {
        prompt: `Écris l’adverbe de cette phrase : « ${p.texte} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          p.autres.map((m) => [m, whyNonAdverbe(m)] as const),
        ),
        hint: 'Cherche le mot qui dit comment, combien, quand ou où. Il ne change jamais.',
        steps: [DEF_ADVERBE, 'Je cherche le mot qui précise.', `L’adverbe est **${p.adverbe}**.`],
      };
    }
    case 4: {
      const p = rng.pick(PLURIELS);
      const accepted = avecOuSansPoint(p.pluriel);
      return {
        prompt: `Écris cette phrase au pluriel : « ${p.singulier} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [p.faux, `L’adverbe « ${p.adverbe} » est invariable : il ne change pas au pluriel.`],
          [p.singulier, 'La phrase est encore au singulier : mets le sujet et le verbe au pluriel.'],
        ]),
        hint: 'Change le sujet et le verbe. Un des mots, lui, reste toujours pareil.',
        steps: [
          'Je mets au pluriel le déterminant, le nom et le verbe.',
          `« ${p.adverbe} » est un adverbe : il est invariable.`,
          `La phrase est : **${p.pluriel}**`,
        ],
      };
    }
    default: {
      const lignes = troisLignes(rng, LIGNES_ADVERBES, (l) => l.n);
      const k = total(lignes, (l) => l.n);
      return {
        prompt: 'Lis ce texte. Combien d’adverbes contient-il en tout ?',
        figure: document(
          'Quelques phrases',
          lignes.map((l) => l.texte),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [k + 1, 'Tu en as un de trop : recompte. Un adjectif, comme « rouge » ou « long », n’est pas un adverbe.'],
          [k - 1, 'Il t’en manque un : une ligne peut en avoir deux.'],
          [lignes.filter((l) => l.n > 0).length, 'Tu as compté les lignes. Compte chaque adverbe.'],
        ]),
        hint: 'Pour chaque ligne, cherche les mots qui disent quand, où, comment ou combien.',
        steps: [DEF_ADVERBE, 'Je lis chaque ligne et je coche les adverbes.', `Il y en a **${k}**.`],
      };
    }
  }
}

// ───────────────────────── 6. Pronoms personnels ─────────────────────────

const P_SUJET = 'un pronom personnel sujet';
const P_COMPL = 'un pronom personnel complément';
const DEF_SUJET = 'Le pronom sujet dit qui fait l’action : je, tu, il, elle, nous, vous, ils, elles.';
const DEF_COMPL = 'Le pronom complément complète le verbe : me, te, le, la, les, lui, leur…';
const PRONOMS_SUJETS = ['Il', 'Elle', 'Ils', 'Elles'];
const PRONOMS_OBJETS: readonly PronomObjet[] = ['le', 'la', 'les', 'lui', 'leur'];

const whyObjet = (o: ObjetPhrase) =>
  o.groupe.startsWith('à') || o.groupe.startsWith('aux')
    ? `« ${o.groupe} » est introduit par « à »${o.groupe.startsWith('aux') ? ' (« aux » veut dire « à les »)' : ''} : on le remplace par « lui » (un seul) ou « leur » (plusieurs).`
    : `« ${o.groupe} » suit le verbe sans « à » : on le remplace par « le », « la » ou « les », selon le genre et le nombre.`;

function pronomsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const bon = rng.pick(['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles']);
      const nom = rng.pick(NOMS_PIEGE);
      const verbe = rng.pick(VERBES_PIEGE);
      const { answer, traps } = choice(rng, bon, [
        { label: nom, why: `« ${nom} » est un nom : on peut dire « un » ou « une » devant.` },
        { label: verbe, why: `« ${verbe} » est un verbe : il dit ce qu’on fait.` },
      ]);
      return {
        prompt: 'Quel mot est un pronom personnel ?',
        answer,
        traps,
        hint: 'C’est un petit mot qui désigne une personne ou remplace un nom.',
        steps: ['Un pronom personnel désigne une personne ou remplace un nom.', DEF_SUJET, `C’est **${bon}**.`],
      };
    }
    case 2: {
      const p = rng.pick(PHRASES_PRONOMS);
      const bon = p.sujet ? P_SUJET : P_COMPL;
      const { answer, traps } = choice(rng, bon, [
        { label: p.sujet ? P_COMPL : P_SUJET, why: p.sujet ? DEF_SUJET : DEF_COMPL },
        { label: 'un nom', why: `On ne peut pas mettre « un » devant « ${p.pronom} » : ce n’est pas un nom.` },
        {
          label: 'un déterminant',
          why: `Un déterminant est devant un nom. Ici, « ${p.pronom} » n’accompagne pas un nom.`,
        },
      ]);
      return {
        prompt: `Dans « ${p.texte} », le mot « ${p.pronom} » est…`,
        answer,
        traps,
        hint: 'Trouve le verbe. Ce petit mot fait-il l’action, ou la complète-t-il ?',
        steps: [DEF_SUJET, DEF_COMPL, `« ${p.pronom} » est **${bon}**.`],
      };
    }
    case 3: {
      const s = rng.pick(SUJETS_GN);
      const accepted = [s.pronom];
      return {
        prompt: `Remplace « ${s.gn} » par un pronom personnel sujet : « ${s.phrase} » Écris le pronom.`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          PRONOMS_SUJETS.map(
            (x) => [x, `Regarde le genre et le nombre de « ${s.gn} » : « ${x} » ne convient pas.`] as const,
          ),
        ),
        hint: 'Le groupe est-il masculin ou féminin ? Y en a-t-il un ou plusieurs ?',
        steps: [
          'Le pronom sujet prend le genre et le nombre du groupe.',
          `Je remplace « ${s.gn} » et je relis la phrase.`,
          `Le pronom est **${s.pronom}**.`,
        ],
      };
    }
    case 4: {
      const o = rng.pick(OBJETS_PHRASES);
      const accepted = avecOuSansPoint(phrasePronom(o));
      return {
        prompt: `Réécris en remplaçant « ${o.groupe} » par un pronom : « ${phraseObjet(o)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [`${o.sujet} ${o.verbe} ${o.pronom}.`, 'Le pronom complément se place avant le verbe, pas après.'],
          ...PRONOMS_OBJETS.map((p) => [phrasePronom(o, o.sujet, p), whyObjet(o)] as const),
        ]),
        hint: 'Choisis le bon pronom, puis place-le juste avant le verbe.',
        steps: [whyObjet(o), 'Le pronom se place devant le verbe.', `La phrase est : **${phrasePronom(o)}**`],
      };
    }
    default: {
      const lignes = pickN(rng, OBJETS_PHRASES, 2);
      const i = rng.int(0, 1);
      const o = at(lignes, i);
      const bon = phrasePronom(o, o.pronomSujet);
      const accepted = avecOuSansPoint(bon);
      return {
        prompt: `Lis le texte. Réécris la ligne ${i + 1} en remplaçant les deux groupes par des pronoms.`,
        figure: document(
          'Deux phrases',
          lignes.map((l) => phraseObjet(l)),
        ),
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [phrasePronom(o), `Tu as remplacé « ${o.groupe} » seulement : remplace aussi le sujet.`],
          [phraseObjet(o, o.pronomSujet), 'Tu as remplacé le sujet seulement : remplace aussi le complément.'],
          [`${o.pronomSujet} ${o.verbe} ${o.pronom}.`, 'Le pronom complément se place avant le verbe, pas après.'],
        ]),
        hint: 'Remplace d’abord le sujet, puis le complément. Le pronom complément passe devant le verbe.',
        steps: [`Le sujet « ${o.sujet} » devient « ${o.pronomSujet} ».`, whyObjet(o), `La phrase est : **${bon}**`],
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesDe(n.factId, ...n.faits) },
  generate: n.generate,
});

export const FCM1_NATURE: readonly Skill[] = [
  skill({
    id: 'fcm1-nature-fonction',
    title: 'Nature ou fonction',
    memo: [
      'La **nature** dit quelle sorte de mot c’est : nom, verbe, adjectif… La **fonction** dit son rôle dans la phrase : sujet, complément…',
      'Exemple : dans « Le chien dort. », « le chien » est un **groupe nominal** (nature). Il est **sujet** (fonction).',
      'Dans « Je vois le chien. », c’est le même groupe nominal, mais il est complément d’objet : le rôle a changé !',
    ],
    factId: 'nature-fonction',
    faits: ['natures', 'fonctions', 'fonction'],
    generate: natureFonctionDraft,
  }),
  skill({
    id: 'fcm1-articles',
    title: 'Articles définis et indéfinis',
    memo: [
      'L’**article défini** : le, la, l’, les. L’**article indéfini** : un, une, des.',
      'On dit « un chat » quand on le présente. Puis « le chat » quand on sait duquel on parle.',
      'Devant une voyelle ou un h muet, « le » et « la » deviennent « l’ » : l’arbre, l’histoire.',
    ],
    factId: 'determinants',
    faits: ['article-defini', 'article-indefini'],
    generate: articlesDraft,
  }),
  skill({
    id: 'fcm1-determinants-poss-dem',
    title: 'Déterminants possessifs et démonstratifs',
    memo: [
      'Le **déterminant possessif** dit à qui c’est : mon vélo, ta trousse, leurs billes.',
      'Le **déterminant démonstratif** montre : ce chien, cet arbre, cette fleur, ces amis.',
      'Astuce : devant une voyelle ou un **h muet**, on écrit « mon école » (et pas « ma ») et « cet arbre », « cet homme ».',
    ],
    factId: 'determinants',
    faits: ['possessif', 'mon', 'ton', 'son', 'notre', 'votre', 'leur', 'ce'],
    generate: determinantsDraft,
  }),
  skill({
    id: 'fcm1-conjonctions-coordination',
    title: 'Conjonctions de coordination',
    memo: [
      'Une **conjonction de coordination** relie des mots ou des phrases. Il y en a sept : mais, ou, et, donc, or, ni, car.',
      '« et » ajoute, « ou » propose un choix, « mais » marque une **opposition**, « car » explique, « donc » annonce la **conséquence**, « ni » sert dans une phrase négative.',
      'Exemple : « Je mets un manteau car il fait froid. » Attention : « et » (et puis) n’est pas « est » (verbe être).',
    ],
    factId: 'conjonctions',
    faits: ['mais', 'ou', 'et', 'donc', 'or', 'ni', 'car'],
    generate: conjonctionsDraft,
  }),
  skill({
    id: 'fcm1-adverbes',
    title: 'Adverbes fréquents',
    memo: [
      'Un **adverbe** précise un verbe, un adjectif ou un autre adverbe : il court vite, très grand.',
      'Il est **invariable** : il ne change jamais. « Il court vite. » → « Ils courent vite. »',
      'Range-les : quand ? (hier, demain), où ? (ici), combien ? (beaucoup, très, trop), comment ? (vite, bien).',
    ],
    factId: 'adverbes',
    faits: [
      'invariable',
      'adverbe',
      'toujours',
      'souvent',
      'hier',
      'demain',
      'aujourdhui',
      'deja',
      'ensuite',
      'ici',
      'tres',
      'trop',
      'beaucoup',
      'bien',
      'vite',
    ],
    generate: adverbesDraft,
  }),
  skill({
    id: 'fcm1-pronoms-personnels',
    title: 'Pronoms personnels sujets et compléments',
    memo: [
      'Un **pronom personnel sujet** dit qui fait l’action : je, tu, il, elle, nous, vous, ils, elles.',
      'Un **pronom personnel complément** complète le verbe : me, te, le, la, les, lui, leur. Il se met souvent avant le verbe. Pour un groupe avec « à » : « lui » (un seul) ou « leur » (plusieurs).',
      'Exemple : « Ma sœur lit le livre. » → « Elle le lit. »',
    ],
    factId: 'pronoms',
    faits: ['remplacer-sujet', 'remplacer-objet', 'je', 'tu', 'il', 'me', 'te', 'le', 'lui'],
    generate: pronomsDraft,
  }),
];
