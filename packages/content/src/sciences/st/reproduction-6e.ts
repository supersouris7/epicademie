import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { maj } from './outils.ts';
import { compter, completer, document, ecrit, formes, notion, paires, qcm, ranger, type Faux } from './vivant-kit.ts';

// ——— Reproduction : pollinisation, pollinisateurs, appareil reproducteur humain, fécondation (6e) ———

const POLLEN = 'La pollinisation est le transport du pollen de l’étamine au stigmate du pistil.';
const FRUIT = 'Après la pollinisation et la fécondation, la fleur se transforme en fruit et les ovules en graines.';
const GAMETES = 'La fécondation réunit un gamète mâle et un gamète femelle en une cellule unique.';

const FLEUR: readonly (readonly [string, string])[] = [
  ['l’étamine', 'l’organe mâle de la fleur, qui produit le pollen'],
  ['le pistil', 'l’organe femelle, au centre de la fleur'],
  ['le pollen', 'la poussière très fine, souvent jaune, produite par les étamines'],
  ['l’ovule de la fleur', 'ce qui, après la fécondation, devient une graine'],
  ['la graine', 'ce qui provient du développement de l’ovule'],
  ['la pollinisation', 'le transport du pollen jusqu’au stigmate'],
];

const HUMAIN: readonly (readonly [string, string])[] = [
  ['les testicules', 'produisent les spermatozoïdes'],
  ['les ovaires', 'produisent les ovules et des hormones sexuelles'],
  ['les trompes', 'relient les ovaires à l’utérus et laissent passer l’ovule'],
  ['l’utérus', 'organe musculeux où se déroule la grossesse'],
  ['le vagin', 'canal qui va de l’utérus à la vulve'],
  ['le pénis', 'organe copulateur de l’homme'],
];

const autresOrganes = (nom: string): Faux[] =>
  HUMAIN.filter((o) => o[0] !== nom).map(([n, role]) => [n, `${maj(n)} : ${role}.`]);

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const [nom, role] = rng.pick(HUMAIN.slice(0, 4));
    return qcm(rng, {
      prompt: `Appareil reproducteur humain : quel élément correspond à cette description : « ${role} » ?`,
      bon: nom,
      faux: rng.shuffle(autresOrganes(nom)).slice(0, 2),
      hint: 'Appuie-toi sur la fonction décrite.',
      pourquoi: [`${maj(nom)} : ${role}.`],
    });
  }
  const [nom, role] = rng.pick(FLEUR.slice(0, 3));
  return qcm(rng, {
    prompt: `Reproduction d’une plante à fleurs : de quoi parle-t-on avec « ${role} » ?`,
    bon: nom,
    faux: FLEUR.slice(0, 3)
      .filter((f) => f[0] !== nom)
      .map(([n, d]): Faux => [n, `${maj(n)} : ${d}.`]),
    hint: 'Distingue les deux organes de la fleur et la poussière qui voyage.',
    pourquoi: [`${maj(nom)} : ${role}.`],
  });
};

const SITUATIONS: readonly { q: string; bon: string; faux: readonly Faux[]; hint: string; pourquoi: string }[] = [
  {
    q: 'Lors de la pollinisation, d’où le pollen part-il et où arrive-t-il ?',
    bon: 'de l’étamine au stigmate du pistil',
    faux: [
      ['du stigmate du pistil à l’étamine', 'C’est le trajet inversé : le pollen est produit par l’étamine.'],
      ['de la racine à la fleur', 'La racine ne produit pas de pollen.'],
      ['du fruit à la graine', 'Le fruit et les graines se forment après la pollinisation.'],
    ],
    hint: 'Quel organe de la fleur produit le pollen ?',
    pourquoi: POLLEN,
  },
  {
    q: 'Chez l’être humain, quel type de fécondation a lieu ?',
    bon: 'une fécondation interne, dans le corps de la femme',
    faux: [
      [
        'une fécondation externe, dans l’eau',
        '« Externe » veut dire hors du corps : ce n’est pas le cas chez l’humain.',
      ],
      ['une fécondation par transport du pollen', 'Le pollen concerne les plantes à fleurs.'],
      ['aucune fécondation', 'La reproduction humaine passe par la rencontre de deux gamètes.'],
    ],
    hint: 'La rencontre des gamètes a-t-elle lieu dans le corps ou en dehors ?',
    pourquoi: 'Chez l’être humain, la rencontre des gamètes se fait dans le corps.',
  },
  {
    q: 'Que fait un insecte pollinisateur pour la plante ?',
    bon: 'il aide au transport du pollen',
    faux: [
      ['il fabrique les graines à la place de la plante', 'Les graines viennent des ovules de la fleur.'],
      ['il remplace les ovules', 'Les ovules appartiennent à la fleur : rien ne les remplace.'],
      ['il transforme les racines en fruits', 'C’est la fleur qui se transforme en fruit.'],
    ],
    hint: 'Pense au nom : pollinisateur.',
    pourquoi: POLLEN,
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) return paires(rng, FLEUR, 3, 'Fleur : associe chaque mot à sa description');
  if (t === 1) return paires(rng, HUMAIN, 3, 'Appareil reproducteur humain : associe chaque élément à sa fonction');
  const cas = rng.pick(SITUATIONS);
  return qcm(rng, {
    prompt: cas.q,
    bon: cas.bon,
    faux: cas.faux,
    hint: cas.hint,
    pourquoi: [cas.pourquoi],
  });
};

const DEFINITIONS: Record<string, string> = {
  pollinisation: 'La pollinisation est un transport : celui du pollen jusqu’au stigmate.',
  fécondation: 'La fécondation est une fusion : celle de deux gamètes, après le transport du pollen.',
  germination: 'La germination est le moment où la graine commence à donner une nouvelle plante.',
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0) {
    const mots = rng.pick([
      {
        q: 'transport du pollen de l’étamine au stigmate',
        m: 'pollinisation',
        art: ['la', 'une'],
        faux: ['fécondation', 'germination'],
      },
      {
        q: 'fusion d’un gamète mâle et d’un gamète femelle en une seule cellule',
        m: 'fécondation',
        art: ['la', 'une'],
        faux: ['pollinisation', 'germination'],
      },
    ]);
    return ecrit({
      prompt: `Écris le nom de ce phénomène : ${mots.q}.`,
      accepte: formes(mots.m, ...mots.art),
      faux: mots.faux.map((f): Faux => [f, DEFINITIONS[f] ?? '']),
      hint: 'Transporter n’est pas la même chose que fusionner.',
      pourquoi: [mots.m === 'pollinisation' ? POLLEN : GAMETES],
    });
  }
  if (t === 1)
    return ranger(rng, {
      prompt:
        'Remets dans l’ordre : le fruit contient des graines ; le pollen arrive sur le stigmate ; la fécondation a lieu ; la fleur porte du pollen sur ses étamines.',
      enOrdre: [
        'la fleur porte du pollen sur ses étamines',
        'le pollen arrive sur le stigmate',
        'la fécondation a lieu',
        'le fruit contient des graines',
      ],
      hint: 'Le pollen doit d’abord voyager.',
      pourquoi: [POLLEN, FRUIT],
    });
  if (t === 2)
    return completer(rng, {
      prompt: 'Complète : que deviennent les parties de la fleur après la pollinisation et la fécondation ?',
      parts: ['La fleur se transforme en ', ' et les ovules deviennent des ', '.'],
      trous: [
        ['fruit', 'racine', 'étamine'],
        ['graines', 'pollens', 'stigmates'],
      ],
      hint: 'Pense à ce que l’on trouve dans une pomme.',
      pourquoi: [FRUIT],
    });
  const gamete = rng.pick([
    { q: 'la cellule reproductrice mâle, chez l’être humain', m: 'spermatozoïde', art: ['le', 'un'], faux: 'ovule' },
    { q: 'la cellule reproductrice produite par l’ovaire', m: 'ovule', art: ['l’', 'un'], faux: 'spermatozoïde' },
  ]);
  return ecrit({
    prompt: `Comment nomme-t-on ${gamete.q} ?`,
    accepte: formes(gamete.m, ...gamete.art),
    faux: [
      [gamete.faux, 'C’est l’autre gamète.'],
      ['pollen', 'Le pollen concerne les plantes à fleurs.'],
    ],
    hint: 'Il y a deux gamètes : un mâle et un femelle.',
    pourquoi: [GAMETES],
  });
};

const IDEES: readonly { q: string; bon: string; faux: readonly Faux[]; pourquoi: string }[] = [
  {
    q: 'Pourquoi parle-t-on d’une coopération entre une plante à fleurs et l’insecte qui la pollinise ?',
    bon: 'chacun tire profit de la relation : l’insecte se nourrit, la plante se reproduit',
    faux: [
      ['seul l’insecte en profite et la plante est détruite', 'La plante en profite : son pollen est transporté.'],
      ['aucun des deux n’en tire profit', 'La pollinisation est un exemple d’interaction mutualiste.'],
      ['la plante chasse l’insecte pour le manger', 'Ce serait une prédation, pas une coopération.'],
    ],
    pourquoi: 'La pollinisation illustre une interaction mutualiste.',
  },
  {
    q: 'Quelle situation relève de la reproduction, au sens biologique, plutôt que des autres dimensions de la sexualité ?',
    bon: 'la fécondation d’un ovule par un spermatozoïde',
    faux: [
      ['les droits et les interdits fixés par la loi', 'C’est la dimension juridique de la sexualité.'],
      ['les sentiments que l’on éprouve pour une personne', 'C’est la dimension psycho-émotionnelle.'],
      ['les habitudes et les traditions d’une société', 'C’est la dimension sociale.'],
    ],
    pourquoi: 'La reproduction est la dimension biologique ; la sexualité a aussi d’autres dimensions.',
  },
  {
    q: 'Les pollinisateurs se raréfient près d’un verger de pommiers. Quelle conséquence faut-il craindre ?',
    bon: 'moins de fleurs pollinisées, donc moins de fruits',
    faux: [
      ['davantage de fruits, car les fleurs sont tranquilles', 'La pomme dépend de la pollinisation par les insectes.'],
      ['aucune, car les pommiers n’ont pas de fleurs', 'Les pommiers fleurissent, puis donnent des fruits.'],
      ['des pommes qui apparaissent sans aucune fleur', 'Le fruit vient de la transformation de la fleur.'],
    ],
    pourquoi: 'La pomme fait partie des cultures qui dépendent des insectes pollinisateurs.',
  },
  {
    q: 'Quel facteur lié aux pratiques agricoles contribue au déclin des pollinisateurs ?',
    bon: 'l’utilisation de produits contre les parasites des cultures (pesticides)',
    faux: [
      ['l’abondance de fleurs variées', 'Des fleurs variées nourrissent les pollinisateurs.'],
      ['la présence d’habitats préservés', 'Des habitats préservés leur sont favorables.'],
      ['le transport du pollen par ces insectes', 'C’est leur activité utile, pas une cause de déclin.'],
    ],
    pourquoi: 'Les produits phytosanitaires figurent parmi les facteurs du déclin.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0)
    return paires(rng, HUMAIN, 5, 'Sans aide, associe cinq éléments de l’appareil reproducteur à leur fonction');
  if (t === 1) {
    const idee = rng.pick(IDEES);
    return qcm(rng, {
      prompt: idee.q,
      bon: idee.bon,
      faux: idee.faux,
      hint: 'Raisonne sur qui profite de quoi, et sur ce qui est biologique.',
      pourquoi: [idee.pourquoi],
    });
  }
  if (t === 2) {
    const o = rng.pick([
      { i: 0, accepte: formes('testicules', 'les').concat(formes('testicule', 'le', 'un')) },
      { i: 1, accepte: formes('ovaires', 'les').concat(formes('ovaire', 'l’', 'un')) },
      { i: 3, accepte: formes('utérus', 'l’', 'un') },
    ]);
    const [nom, role] = HUMAIN[o.i] ?? ['', ''];
    return ecrit({
      prompt: `Écris le nom scientifique de cet élément de l’appareil reproducteur : « ${role} ».`,
      accepte: o.accepte,
      faux: autresOrganes(nom).map(([n, why]): Faux => [n.replace(/^(les |le |l’)/, ''), why]),
      hint: 'Que fait cet élément : produire des cellules reproductrices, ou abriter la grossesse ?',
      pourquoi: [`${maj(nom)} : ${role}.`],
    });
  }
  return ecrit({
    prompt:
      'Une fleur est visitée par des insectes, puis elle se transforme. Quel nom donne-t-on à ce qui contient les graines ?',
    accepte: formes('fruit', 'le', 'un'),
    faux: [
      ['ovule', 'L’ovule devient la graine, pas ce qui la contient.'],
      ['étamine', 'L’étamine produit le pollen.'],
      ['pollen', 'Le pollen est transporté avant la formation des graines.'],
    ],
    hint: 'La fleur elle-même se transforme.',
    pourquoi: [FRUIT],
  });
};

const CULTURES = ['pommiers', 'poiriers', 'fraisiers', 'courgettes', 'melons', 'colza'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const culture = rng.pick(CULTURES);
  const libres = rng.pick([62, 68, 74, 80]);
  const ensachees = rng.pick([6, 9, 12, 15]);
  const traitees = rng.pick([28, 31, 35, 38]);
  const visites = rng.pick([40, 48, 52]);
  const peu = rng.pick([11, 14, 17]);
  const figure = document(`Essai sur des ${culture} (mesures inventées pour l’exercice, sur 100 fleurs par lot)`, [
    `Lot 1, fleurs accessibles aux insectes, sans pesticide : ${visites} visites en une heure, ${libres} fruits.`,
    `Lot 2, fleurs enfermées dans un filet fin avant leur ouverture : 0 visite, ${ensachees} fruits.`,
    `Lot 3, fleurs accessibles dans une parcelle traitée avec un insecticide : ${peu} visites, ${traitees} fruits.`,
  ]);
  const code = `essai ${culture} : lot 1 = ${libres}, lot 2 = ${ensachees}, lot 3 = ${traitees} fruits`;
  const t = rng.int(0, 2);
  if (t === 0)
    return compter({
      prompt: `Lis l’${code}. Combien de fruits de plus le lot 1 donne-t-il par rapport au lot 2 ?`,
      figure,
      valeur: libres - ensachees,
      faux: [
        [libres, 'C’est le nombre de fruits du lot 1 : on demande l’écart.'],
        [libres + ensachees, 'Pour comparer, on soustrait.'],
        [libres - traitees, 'Tu as comparé avec le lot 3, pas avec le lot 2.'],
      ],
      hint: 'Repère les lots 1 et 2, puis calcule la différence.',
      pourquoi: [`${libres} − ${ensachees} = ${libres - ensachees}.`],
    });
  if (t === 1) {
    const bon = 'les visites d’insectes favorisent la formation des fruits';
    return qcm(rng, {
      prompt: `Lis l’${code}. Que montre la comparaison des lots 1 et 2 ?`,
      figure,
      bon,
      faux: [
        ['le filet fait produire davantage de fruits', 'Le lot enfermé donne moins de fruits.'],
        ['les insectes mangent presque tous les fruits', 'Le lot visité donne le plus de fruits.'],
        ['les visites d’insectes ne changent rien', 'L’écart entre les deux lots est grand.'],
      ],
      hint: 'Qu’est-ce qui change entre les deux lots, et quel résultat change ?',
      pourquoi: ['Seul l’accès des insectes diffère entre les lots 1 et 2.', FRUIT],
    });
  }
  const bon = 'dans ces mesures, la parcelle traitée reçoit moins de visites et donne moins de fruits';
  return qcm(rng, {
    prompt: `Lis l’${code}. Quelle conclusion prudente tirer de la comparaison des lots 1 et 3 ?`,
    figure,
    bon,
    faux: [
      ['l’insecticide augmente le nombre de visites', 'Les visites sont moins nombreuses dans le lot 3.'],
      ['les fruits se forment mieux quand les visites diminuent', 'Les fruits diminuent avec les visites.'],
      [
        'cet essai prouve que tout pesticide détruit tous les insectes',
        'Un seul essai ne permet pas une telle généralisation : des visites ont encore lieu.',
      ],
    ],
    hint: 'Compare visites et fruits, sans aller au-delà des mesures.',
    pourquoi: [
      `Lot 3 : ${peu} visites et ${traitees} fruits, contre ${visites} et ${libres}.`,
      'Les produits phytosanitaires font partie des facteurs du déclin des pollinisateurs.',
    ],
  });
};

export const reproduction = notion({
  id: 'v6-reproduction',
  title: 'La reproduction',
  memo: [
    'Chez la plante à fleurs, la **pollinisation** porte le **pollen** de l’**étamine** au **pistil**. Après la **fécondation**, la fleur devient fruit et les ovules graines. Les insectes **pollinisateurs** coopèrent avec la plante ; les **pesticides** contribuent à leur déclin.',
    'Chez l’être humain, les testicules produisent les **spermatozoïdes** et les ovaires les **ovules**. La fécondation est interne ; la grossesse se déroule dans l’**utérus**. La reproduction est la part biologique de la sexualité, qui a aussi des dimensions psycho-émotionnelle, juridique et sociale.',
  ],
  faits: [
    'fruit-graines',
    'cooperation',
    'abondance',
    'nourriture-pollinisation',
    'impact-pesticides',
    'organes',
    'interne-vivipare',
    'sexualite',
    'pollinisation',
    'pollen',
    'etamine',
    'pistil',
    'graine',
    'fecondation',
    'pesticide',
    'role-pollinisateurs',
    'part',
    'cultures',
    'declin',
    'facteurs',
    'testicule',
    'spermatozoide',
    'ovaire',
    'trompe',
    'uterus',
    'vagin',
    'penis',
  ],
  niveaux: [niveau1, niveau2, niveau3, niveau4, niveau5],
});
