import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesEnergie } from './donnees-energie.ts';

// ——— Conducteurs et isolants électriques (5e) ———

/** Matériaux dont le caractère électrique est dit par les textes cités. */
export const CONDUCTEURS = ['le cuivre', 'le fer', 'l’argent', 'le graphite'] as const;
export const ISOLANTS = ['le verre', 'le caoutchouc', 'la porcelaine', 'l’ébonite'] as const;

const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
type Famille = 'conducteur' | 'isolant';
const familleDe = (m: string): Famille => ((CONDUCTEURS as readonly string[]).includes(m) ? 'conducteur' : 'isolant');
const regle = (m: string) =>
  familleDe(m) === 'conducteur'
    ? `${maj(m)} laisse passer le courant : c’est un conducteur.`
    : `${maj(m)} s’oppose au passage du courant : c’est un isolant.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const cherche: Famille = rng.int(0, 1) === 0 ? 'conducteur' : 'isolant';
  const bons = cherche === 'conducteur' ? CONDUCTEURS : ISOLANTS;
  const autres = cherche === 'conducteur' ? ISOLANTS : CONDUCTEURS;
  const bon: string = rng.pick<string>(bons);
  const { answer, traps: t } = choice(
    rng,
    maj(bon),
    rng
      .shuffle<string>(autres)
      .slice(0, 2)
      .map((m) => ({ label: maj(m), why: regle(m) })),
  );
  return {
    prompt: `Parmi ces matériaux, lequel est un ${cherche} électrique ?`,
    answer,
    traps: t,
    hint: 'Un conducteur laisse passer le courant ; un isolant s’y oppose.',
    steps: [regle(bon), `Réponse : **${bon}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cherche: Famille = rng.int(0, 1) === 0 ? 'conducteur' : 'isolant';
    const bon: string = rng.pick<string>(cherche === 'conducteur' ? CONDUCTEURS : ISOLANTS);
    const autres = rng.shuffle<string>(cherche === 'conducteur' ? ISOLANTS : CONDUCTEURS).slice(0, 3);
    const { answer, traps: t } = choice(
      rng,
      maj(bon),
      autres.map((m) => ({ label: maj(m), why: regle(m) })),
    );
    return {
      prompt: `Quatre matériaux : un seul est ${cherche === 'conducteur' ? 'un conducteur' : 'un isolant'} de l’électricité. Lequel ?`,
      answer,
      traps: t,
      hint: 'Pense au test de la lampe : un seul de ces matériaux se comporte autrement que les trois autres.',
      steps: [regle(bon), `Réponse : **${bon}**.`],
      targetSeconds: 30,
    };
  }
  const allume = rng.int(0, 1) === 0;
  const objet = rng.int(1, 9);
  const bon = allume ? 'L’objet est conducteur' : 'L’objet est isolant';
  const { answer, traps: t } = choice(rng, bon, [
    {
      label: allume ? 'L’objet est isolant' : 'L’objet est conducteur',
      why: allume
        ? 'La lampe brille : le courant traverse l’objet.'
        : 'La lampe reste éteinte : le courant ne traverse pas l’objet.',
    },
    { label: 'La pile est forcément neuve', why: 'Le test porte sur l’objet inséré dans la boucle, pas sur la pile.' },
    {
      label: 'La lampe est montée en dérivation avec l’objet',
      why: 'L’objet est inséré dans la boucle : il est en série.',
    },
  ]);
  return {
    prompt: `Dans une boucle pile–lampe, on insère l’objet n° ${objet}. La lampe ${allume ? 'brille' : 'reste éteinte'} (pile et lampe en bon état). Que conclure ?`,
    answer,
    traps: t,
    hint: 'La lampe sert de détecteur : le courant passe-t-il à travers l’objet ?',
    steps: [
      allume
        ? 'La lampe brille : le courant passe à travers l’objet.'
        : 'La lampe est éteinte : le courant ne passe pas.',
      `Réponse : **${bon.toLowerCase()}**.`,
    ],
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const m: string = rng.pick<string>([...CONDUCTEURS, ...ISOLANTS]);
  const f = familleDe(m);
  const { answer, traps: t } = saisie([f, `un ${f}`], [[f === 'conducteur' ? 'isolant' : 'conducteur', regle(m)]]);
  return {
    prompt: `Quel mot qualifie ce matériau pour l’électricité : ${m} ? Écris « conducteur » ou « isolant ».`,
    answer,
    traps: t,
    hint: 'Pense au test de la lampe : le courant traverserait-il ce matériau ?',
    steps: [regle(m), `C’est un **${f}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const cas = rng.int(0, 2);
  if (cas === 0) {
    const ame = rng.pick(['cuivre', 'argent'] as const);
    const roles = rng.shuffle(['conducteur', 'isolant']);
    return {
      prompt: `Un fil électrique a une âme (partie centrale) en ${ame} entourée d’une gaine (enveloppe) en caoutchouc. Complète la description.`,
      answer: {
        kind: 'cloze',
        parts: ['L’âme est un ', ', car le courant doit y passer. La gaine est un ', ' : elle protège du contact.'],
        blanks: [
          { mode: 'list', options: roles, correct: roles.indexOf('conducteur') },
          { mode: 'list', options: roles, correct: roles.indexOf('isolant') },
        ],
      },
      hint: 'Le courant doit passer au centre et ne pas pouvoir sortir par l’extérieur.',
      steps: [
        'Le courant circule dans l’âme conductrice ; la gaine isolante empêche de toucher un conducteur.',
        'Réponse : **conducteur**, puis **isolant**.',
      ],
      targetSeconds: 60,
    };
  }
  if (cas === 1) {
    const nb = rng.int(1, 3);
    const cons = rng.shuffle(CONDUCTEURS).slice(0, nb);
    const isos = rng.shuffle(ISOLANTS).slice(0, 5 - nb);
    const mats: string[] = [...cons, ...isos];
    const test = (m: string) => (familleDe(m) === 'conducteur' ? 'la lampe brille' : 'la lampe reste éteinte');
    return {
      prompt: `On teste un par un cinq objets (matériaux : ${[...mats].sort().join(', ')}) dans une boucle pile–lampe. Combien font briller la lampe ?`,
      answer: num(cons.length),
      traps: traps(r(cons.length), [
        [isos.length, 'Tu as compté les isolants : ils laissent la lampe éteinte.'],
        [mats.length, 'Tous les matériaux ne conduisent pas.'],
      ]),
      hint: 'Trie les matériaux en deux familles avant de compter.',
      steps: [`${maj(mats.map((m) => `${m} : ${test(m)}`).join(' ; '))}.`, `Réponse : **${cons.length}**.`],
      targetSeconds: 70,
    };
  }
  const { answer, traps: t } = saisie(
    ['graphite', 'le graphite'],
    [
      ['charbon', '« Charbon » désigne ici une pièce : écris le nom du matériau qui la compose.'],
      ['cuivre', 'Le cuivre conduit, mais c’est un métal.'],
      ['verre', 'Le verre est un isolant.'],
      ['caoutchouc', 'Le caoutchouc est un isolant.'],
    ],
  );
  const debut = rng.pick(['Un élève croit', 'Une élève affirme', 'Un camarade pense']);
  return {
    prompt: `${debut} que seuls les métaux conduisent le courant. Quel matériau non métallique, vu dans le cours, prouve le contraire ? Écris son nom.`,
    answer,
    traps: t,
    hint: 'Cherche dans le mémo le conducteur qui n’est pas rangé parmi les métaux : son nom commence par « g ».',
    steps: ['Le graphite est utilisé comme conducteur alors qu’il n’est pas un métal.', 'Réponse : **graphite**.'],
    targetSeconds: 60,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const nb = rng.int(1, 3);
  const mats: string[] = rng.shuffle<string>([
    ...rng.shuffle<string>(CONDUCTEURS).slice(0, nb),
    ...rng.shuffle<string>(ISOLANTS).slice(0, 4 - nb),
  ]);
  const lignes = [
    'Une pile, une lampe et des pinces forment une seule boucle ouverte entre les pinces.',
    ...mats.map((m, i) => `Essai ${i + 1} : on pince un objet en ${m.replace(/^(le |la |l’)/, '')}.`),
  ];
  const figure = { kind: 'document' as const, title: 'Compte rendu de test (situation inventée)', lines: lignes };
  const cons = mats.map((m, i) => ({ i: i + 1, ok: familleDe(m) === 'conducteur' })).filter((x) => x.ok);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Lis le compte rendu. Pour combien d’essais la lampe brille-t-elle ?',
      figure,
      answer: num(cons.length),
      traps: traps(r(cons.length), [
        [4 - cons.length, 'Tu as compté les essais où la lampe reste éteinte.'],
        [4, 'Seuls les objets conducteurs referment la boucle.'],
      ]),
      hint: 'La lampe brille seulement quand l’objet pincé ferme la boucle.',
      steps: [
        'Un objet conducteur placé en série ferme le circuit ; un isolant le laisse ouvert.',
        `La lampe brille aux essais ${cons.map((x) => x.i).join(', ')} : **${cons.length}**.`,
      ],
      targetSeconds: 100,
    };
  }
  const k = rng.int(0, 3);
  const essai = mats[k] ?? '';
  const ouvert = familleDe(essai) === 'isolant';
  const bon = ouvert ? 'Le circuit reste ouvert : la lampe est éteinte' : 'Le circuit est fermé : la lampe brille';
  const { answer, traps: t } = choice(rng, bon, [
    {
      label: ouvert ? 'Le circuit est fermé : la lampe brille' : 'Le circuit reste ouvert : la lampe est éteinte',
      why: regle(essai),
    },
    {
      label: 'La pile est en court-circuit',
      why: 'La lampe reste dans la boucle : les bornes de la pile ne sont pas reliées par un fil seul.',
    },
    {
      label: 'La lampe est en dérivation avec l’objet',
      why: 'L’objet pincé est dans la même boucle : il est en série avec la lampe.',
    },
  ]);
  return {
    prompt: `Lis le compte rendu. Que se passe-t-il à l’essai ${k + 1} ?`,
    figure,
    answer,
    traps: t,
    hint: 'Identifie le matériau de l’essai, puis demande-toi s’il laisse passer le courant.',
    steps: [regle(essai), `Réponse : **${bon.toLowerCase()}**.`],
    targetSeconds: 90,
  };
};

export const conducteursIsolants: Skill = {
  id: 'p5-conducteurs-isolants',
  title: 'Conducteurs et isolants électriques',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **conducteur** laisse passer le courant : les métaux (cuivre, fer, argent) en général, mais aussi le graphite. Un **isolant** s’y oppose : verre, caoutchouc, porcelaine, ébonite.',
      'Pour tester un objet, place-le dans une boucle pile–lampe : si la lampe brille, il conduit. Fais ce test avec une pile, jamais sur une prise.',
      'Un courant électrique sur le corps peut tuer : c’est l’**électrocution**.',
    ],
    ...referencesEnergie(
      'conductivite',
      'conductibilite-techno',
      'securite',
      'conducteur',
      'isolant',
      'isolants-exemples',
      'metaux',
      'cuivre',
      'argent',
      'graphite',
      'ebonite',
      'circuit-ouvert',
      'electrocution',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
