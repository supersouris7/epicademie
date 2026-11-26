import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { ELEMENTS, MOLECULES, SYMBOLES, composition, references, type Molecule } from './donnees-atomes.ts';

// ——— Les formules chimiques (4e) ———

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYMBOLES);
  const bon = ELEMENTS[s].nom;
  const autres = rng.shuffle(SYMBOLES.filter((x) => x !== s)).slice(0, 2);
  const versNom = rng.int(0, 1) === 0;
  const { answer, traps: t } = choice(
    rng,
    versNom ? bon : s,
    autres.map((x) => ({
      label: versNom ? ELEMENTS[x].nom : x,
      why: `Le symbole ${x} est celui de l’élément ${ELEMENTS[x].nom}.`,
    })),
  );
  return {
    prompt: versNom ? `Quel élément a pour symbole ${s} ?` : `Quel est le symbole de l’élément ${bon} ?`,
    answer,
    traps: t,
    hint: 'Un symbole est une lettre qui rappelle souvent le nom de l’élément.',
    steps: ['Chaque élément a un symbole dans le tableau périodique.', `**${s}** est le symbole de l’élément ${bon}.`],
    targetSeconds: 20,
  };
};

const ascii = (f: string) => f.replace('₂', '2').replace('₄', '4');

/** Formules proches mais fausses (indices échangés ou oubliés), avec l’explication. */
const voisines = (m: Molecule) => {
  const ecrire = (a: readonly (readonly [string, number])[]) =>
    a.map(([s, n]) => s + (n === 1 ? '' : n === 2 ? '₂' : '₄')).join('');
  const [p, q] = m.atomes;
  if (!p || !q) return [];
  return [
    {
      label: ecrire([
        [p[0], q[1]],
        [q[0], p[1]],
      ]),
      why: 'Les petits chiffres sont placés après le mauvais symbole.',
    },
    {
      label: ecrire([
        [p[0], 1],
        [q[0], 1],
      ]),
      why: 'Les petits chiffres qui donnent le nombre d’atomes sont faux.',
    },
  ].filter((f) => f.label !== m.formule);
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MOLECULES);
  const autres = rng.shuffle(MOLECULES.filter((x) => x !== m)).map((x) => ({
    label: x.formule,
    why: `C’est la formule d’une autre molécule : ${x.nom}.`,
  }));
  const proches = voisines(m);
  const faux = [...proches, ...autres.filter((a) => !proches.some((p) => p.label === a.label))].slice(0, 3);
  const { answer, traps: t } = choice(rng, m.formule, faux);
  return {
    prompt: `Quelle est la formule chimique d’une molécule ${m.de} ?`,
    answer,
    traps: t,
    hint: 'Quels atomes la molécule contient-elle, et combien de chaque sorte ?',
    steps: [`Une molécule ${m.de} contient ${composition(m)}.`, `Sa formule est **${m.formule}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MOLECULES);
  const f = ascii(m.formule);
  const inverse = m.atomes.length > 1 ? [...m.atomes].reverse() : m.atomes;
  const autreOrdre = inverse.map(([s, n]) => s + (n > 1 ? String(n) : '')).join('');
  const accepted = [...new Set([m.formule, f, autreOrdre])];
  const sansChiffre = m.atomes.map(([s]) => s).join('');
  const colle = m.atomes.map(([s, n]) => (n > 1 ? `${n}${s}` : s)).join('');
  const { answer, traps: t } = saisie(accepted, [
    [sansChiffre, 'Il manque le nombre d’atomes : écris-le juste après le symbole concerné.'],
    [colle, 'Le nombre d’atomes s’écrit après le symbole, pas avant.'],
  ]);
  return {
    prompt: `Une molécule est formée de ${composition(m)}. Écris sa formule chimique (les chiffres peuvent être tapés normalement).`,
    answer,
    traps: t,
    hint: 'Écris chaque symbole, suivi de son nombre d’atomes s’il y en a plus d’un.',
    steps: [
      'Une formule indique la nature et le nombre des atomes de la molécule.',
      `La formule est **${m.formule}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MOLECULES);
  const [s, parMolecule] = rng.pick(m.atomes);
  const k = rng.int(2, 7);
  const n = k * parMolecule;
  return {
    prompt: `On écrit ${k} ${m.formule} pour désigner ${k} molécules identiques. Combien d’atomes ${ELEMENTS[s].de} cela représente-t-il ?`,
    answer: num(n),
    traps: traps(r(n), [
      [parMolecule, 'C’est pour une seule molécule : tiens compte du grand chiffre placé devant.'],
      [k, 'C’est le nombre de molécules, pas le nombre d’atomes.'],
      [k + parMolecule, 'Il faut multiplier le nombre de molécules par le nombre d’atomes de chacune.'],
    ]),
    hint: 'Compte les atomes d’une molécule, puis tiens compte du nombre de molécules.',
    steps: [
      `Dans ${m.formule}, il y a ${parMolecule} atome${parMolecule > 1 ? 's' : ''} ${ELEMENTS[s].de}.`,
      `Pour ${k} molécules : ${k} × ${parMolecule} = **${n}**.`,
    ],
    targetSeconds: 60,
  };
};

const tableau = () => [
  'Extrait de la classification périodique (nom : symbole, numéro atomique).',
  ...(['H', 'C', 'N', 'O'] as const).map((s) => `${ELEMENTS[s].nom} : ${s}, ${ELEMENTS[s].numero}`),
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MOLECULES.filter((x) => x.atomes.length > 1 && x.atomes.some(([, n]) => n > 1)));
  const lignes = m.atomes.map(([s, n]) => `${n} atome${n > 1 ? 's' : ''} de numéro atomique ${ELEMENTS[s].numero}`);
  const f = ascii(m.formule);
  const accepted = [...new Set([m.formule, f])];
  const inverse = [...m.atomes]
    .reverse()
    .map(([s, n]) => s + (n > 1 ? String(n) : ''))
    .join('');
  accepted.push(inverse);
  const nombres = m.atomes.map(([, n]) => n).reverse();
  const echange = m.atomes.map(([s], i) => s + ((nombres[i] ?? 1) > 1 ? String(nombres[i]) : '')).join('');
  const { answer, traps: t } = saisie(accepted, [
    [echange, 'Les nombres d’atomes sont inversés : relis la fiche ligne par ligne.'],
    [m.atomes.map(([s]) => s).join(''), 'Il manque le nombre d’atomes après le symbole.'],
  ]);
  return {
    prompt: 'Lis la fiche, retrouve les symboles dans le tableau, puis écris la formule de la molécule.',
    figure: {
      kind: 'document',
      title: 'Fiche d’une molécule (données de l’exercice)',
      lines: [`La molécule contient ${lignes.join(' et ')}.`, ...tableau()],
    },
    answer,
    traps: t,
    hint: 'Cherche d’abord le symbole qui correspond à chaque numéro atomique.',
    steps: [
      `Numéros atomiques → symboles : ${m.atomes.map(([s]) => `${ELEMENTS[s].numero} → ${s}`).join(' ; ')}.`,
      `La formule est **${m.formule}**.`,
    ],
    targetSeconds: 110,
  };
};

export const formulesChimiques: Skill = {
  id: 'p4-formules-chimiques',
  title: 'Les formules chimiques',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Chaque élément a un **symbole** : C (carbone), H (hydrogène), N (azote), O (oxygène). Le tableau périodique donne aussi son numéro atomique.',
      'Une **formule chimique** indique les atomes d’une molécule et leur nombre : H₂O contient 2 atomes d’hydrogène et 1 d’oxygène. Pas de chiffre veut dire 1.',
      'Un grand chiffre devant compte les molécules : 3 H₂O représente 3 molécules d’eau.',
    ],
    ...references(
      'formules-programme',
      'symboles-programme',
      'tableau-programme',
      'formule-brute',
      'symbole-carbone',
      'symbole-hydrogene',
      'symbole-azote',
      'symbole-oxygene',
      'formule-eau',
      'formule-dioxyde',
      'formule-methane',
      'formule-protoxyde',
      'formule-monoxyde',
      'monoxyde-un-atome',
      'deux-atomes',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
