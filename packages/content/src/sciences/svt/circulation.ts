import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import {
  associer,
  choisir,
  completer,
  ecart,
  ecrire,
  generer,
  ranger,
  surDocument,
  type Modele,
} from './nutrition-kit.ts';

// ——— Le corps en activité : la circulation sanguine (cœur, vaisseaux, transport par le sang) ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Quel organe est le principal moteur de la circulation du sang ?',
    'Le cœur',
    [
      ['Les poumons', 'Les poumons assurent les échanges avec l’air, ils ne propulsent pas le sang.'],
      ['L’estomac', 'L’estomac appartient au système digestif.'],
    ],
    'C’est un muscle creux qui bat dans la cage thoracique.',
    'Le cœur est le principal moteur de la circulation du sang.',
  ),
  choisir(
    'Comment appelle-t-on les vaisseaux qui apportent le sang du cœur vers les organes ?',
    'Les artères',
    [
      ['Les veines', 'Les veines ramènent le sang vers le cœur.'],
      ['Les bronches', 'Les bronches conduisent l’air, pas le sang.'],
    ],
    'Le sang part du cœur par ces vaisseaux.',
    'Les artères apportent le sang du cœur dans toutes les parties de l’organisme.',
  ),
  choisir(
    'Que transporte notamment le sang dans le corps ?',
    'Des gaz et des substances nutritives',
    [
      ['Des aliments entiers', 'Les aliments doivent d’abord être digérés pour passer dans le sang.'],
      [
        'Seulement de l’air',
        'L’air reste dans les voies respiratoires ; le sang transporte des gaz et des nutriments.',
      ],
    ],
    'Pense à ce dont les organes ont besoin.',
    'Le sang assure le transport des gaz et des substances nutritives.',
  ),
  choisir(
    'Dans quels vaisseaux le sang circule-t-il vers le cœur ?',
    'Les veines',
    [
      ['Les artères', 'Les artères conduisent le sang depuis le cœur.'],
      ['La trachée', 'La trachée est un conduit d’air.'],
    ],
    'Ils font le trajet inverse des artères.',
    'Dans une veine, la circulation se fait de la périphérie vers le cœur.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Quels vaisseaux permettent les échanges de gaz et de nutriments entre le sang et les cellules ?',
    'Les capillaires',
    [
      ['Les artères', 'Les artères conduisent le sang jusqu’aux organes, sans en assurer les échanges.'],
      ['Les veines', 'Les veines ramènent le sang au cœur.'],
      ['Les bronches', 'Les bronches sont des conduits d’air.'],
    ],
    'Ils sont très fins et se trouvent entre les petites artères et les petites veines.',
    'Les capillaires permettent les échanges nutritifs et gazeux entre le sang et les cellules.',
  ),
  choisir(
    'Quel est le rôle d’une oreillette ?',
    'Recevoir le sang et l’envoyer dans le ventricule correspondant',
    [
      ['Chasser le sang dans les artères', 'C’est le rôle d’un ventricule.'],
      ['Fabriquer le dioxygène', 'Le cœur ne fabrique pas de gaz.'],
      ['Filtrer l’air inspiré', 'Le cœur ne reçoit pas l’air.'],
    ],
    'Les oreillettes sont les cavités d’arrivée du cœur.',
    'L’oreillette reçoit le sang et l’envoie dans le ventricule du même côté.',
  ),
  choisir(
    'Vers quels organes les cavités droites du cœur envoient-elles le sang ?',
    'Les poumons',
    [
      ['Les muscles des bras', 'Ce sont les cavités gauches qui envoient le sang dans la circulation générale.'],
      ['L’intestin', 'La circulation générale, qui dessert les organes, part du côté gauche.'],
      ['Le cerveau directement', 'Le cerveau est desservi par la circulation générale, partie du côté gauche.'],
    ],
    'Cette circulation s’appelle « circulation pulmonaire ».',
    'Les cavités droites envoient le sang dans la circulation pulmonaire.',
  ),
  choisir(
    'De quoi le sang est-il composé ?',
    'De globules et de plaquettes baignant dans un liquide, le plasma',
    [
      ['Uniquement d’un liquide rouge sans cellules', 'Le sang contient des globules et des plaquettes.'],
      ['D’air et d’eau', 'Le sang n’est pas un mélange d’air : il contient des cellules dans le plasma.'],
      ['De salive et de bile', 'Ce sont des liquides de la digestion.'],
    ],
    'Il y a des éléments solides dans une partie liquide.',
    'Le sang est formé de globules rouges, de globules blancs et de plaquettes dans le plasma.',
  ),
  associer(
    'Associe chaque vaisseau à son rôle',
    [
      ['Une artère', 'apporte le sang du cœur vers les organes'],
      ['Une veine', 'ramène le sang vers le cœur'],
      ['Un capillaire', 'permet les échanges avec les cellules'],
    ],
    'Pense au sens du trajet, puis à la finesse du vaisseau.',
    'Les trois types de vaisseaux n’ont pas le même rôle.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète le trajet du sang.',
    ['Le sang quitte le cœur par une ', ' et revient au cœur par une ', '.'],
    [['artère', 'artere'], ['veine']],
    'Aller et retour ne se font pas dans le même type de vaisseau.',
    'Les artères partent du cœur, les veines y reviennent.',
  ),
  ranger(
    'Range dans l’ordre le trajet du sang qui part vers les poumons.',
    ['oreillette droite', 'ventricule droit', 'artère pulmonaire', 'poumons'],
    'Le sang entre dans le cœur avant d’en sortir.',
    'L’oreillette droite envoie le sang au ventricule droit, qui le chasse dans l’artère pulmonaire.',
  ),
  ecrire(
    'Écris le nom des cavités du cœur dont la contraction chasse le sang dans les artères.',
    ['ventricules', 'les ventricules', 'ventricule', 'des ventricules'],
    [
      ['oreillettes', 'Les oreillettes reçoivent le sang avant de le passer aux cavités cherchées.'],
      ['alvéoles', 'Les alvéoles sont dans les poumons.'],
    ],
    'Chacune fait suite à une oreillette.',
    'La contraction des ventricules chasse le sang dans les artères.',
  ),
  ecrire(
    'Écris le nom du battement des artères que l’on peut sentir au poignet avec deux doigts.',
    ['pouls', 'le pouls'],
    [
      ['systole', 'La systole est la contraction du cœur ; on cherche le battement senti sur une artère.'],
      ['souffle', 'On cherche ce que l’on sent au poignet, pas l’air expiré.'],
    ],
    'On le « prend » pour compter les battements.',
    'Le pouls est le battement des artères, dû aux contractions du cœur.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  ranger(
    'Range dans l’ordre le trajet du sang depuis les veines caves jusqu’au ventricule gauche.',
    ['veines caves', 'oreillette droite', 'ventricule droit', 'poumons', 'oreillette gauche', 'ventricule gauche'],
    'Le sang passe par les poumons entre le côté droit et le côté gauche.',
    'Côté droit, puis poumons, puis côté gauche : le sang passe deux fois par le cœur, c’est la double circulation.',
  ),
  associer(
    'Associe chaque cavité ou vaisseau à sa description',
    [
      ['L’oreillette droite', 'reçoit le sang des veines caves'],
      ['L’oreillette gauche', 'reçoit le sang des veines pulmonaires'],
      ['Le ventricule droit', 'envoie le sang dans l’artère pulmonaire'],
      ['Le ventricule gauche', 'envoie le sang dans la circulation générale'],
      ['Les capillaires', 'très fins, ils permettent les échanges'],
    ],
    'Les oreillettes reçoivent, les ventricules envoient ; droite : vers les poumons.',
    'Chaque cavité a son rôle dans les deux circulations.',
  ),
  choisir(
    'L’artère pulmonaire part du ventricule droit. Quel sang conduit-elle ?',
    'Un sang riche en dioxyde de carbone, vers les poumons',
    [
      [
        'Un sang riche en dioxygène, vers les poumons',
        'Une artère ne contient pas forcément du sang riche en dioxygène : celle-ci part chercher le dioxygène.',
      ],
      ['Un sang riche en dioxygène, vers le cœur', 'Une artère part du cœur : elle ne le ramène pas.'],
      ['De l’air, vers les alvéoles', 'L’artère transporte du sang, les bronches conduisent l’air.'],
    ],
    'Ce vaisseau part du côté droit : le sang n’est pas encore passé par les poumons.',
    'L’artère pulmonaire conduit le sang noir, riche en dioxyde de carbone, aux poumons.',
  ),
  ecrire(
    'Écris le nom donné à la contraction du cœur.',
    ['systole', 'la systole'],
    [
      ['diastole', 'La diastole est la dilatation du cœur, c’est-à-dire le temps inverse.'],
      ['pouls', 'Le pouls est le battement senti sur les artères, pas le nom de la contraction.'],
    ],
    'Ce mot commence par « sys ».',
    'La contraction du cœur s’appelle la systole.',
  ),
];

const poumon = (rng: Parameters<Modele>[0]) => {
  const o2Entree = rng.int(10, 14);
  const o2Sortie = o2Entree + rng.int(6, 9);
  const co2Entree = rng.int(50, 55);
  const co2Sortie = co2Entree - rng.int(4, 7);
  return {
    o2Entree,
    o2Sortie,
    co2Entree,
    co2Sortie,
    lines: [
      'On mesure les gaz du sang avant et après son passage dans les poumons (unité du capteur).',
      `Sang qui arrive aux poumons : dioxygène ${o2Entree} ; dioxyde de carbone ${co2Entree}.`,
      `Sang qui repart des poumons : dioxygène ${o2Sortie} ; dioxyde de carbone ${co2Sortie}.`,
    ],
    releve: `Sang à l’arrivée : dioxygène ${o2Entree}, dioxyde de carbone ${co2Entree}. Au départ : dioxygène ${o2Sortie}, dioxyde de carbone ${co2Sortie}.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const p = poumon(rng);
    return surDocument(
      'Le sang dans les poumons',
      p.lines,
      ecart(
        `${p.releve} De combien d’unités le dioxygène du sang augmente-t-il dans les poumons ?`,
        p.o2Sortie,
        p.o2Entree,
        'Compare les deux valeurs du dioxygène.',
        'On retire la valeur d’arrivée de la valeur de départ des poumons.',
      ),
    );
  },
  (rng) => {
    const p = poumon(rng);
    return surDocument(
      'Le sang dans les poumons',
      p.lines,
      ecart(
        `${p.releve} De combien d’unités le dioxyde de carbone du sang diminue-t-il dans les poumons ?`,
        p.co2Entree,
        p.co2Sortie,
        'Compare les deux valeurs du dioxyde de carbone.',
        'On retire la valeur de départ des poumons de la valeur d’arrivée.',
      ),
    );
  },
  (rng) => {
    const p = poumon(rng);
    return surDocument(
      'Le sang dans les poumons',
      p.lines,
      choisir(
        `${p.releve} Dans quels vaisseaux le sang échange-t-il ces gaz avec l’air des alvéoles ?`,
        'Dans les capillaires',
        [
          ['Dans les veines caves', 'Les veines caves ramènent le sang au cœur : elles ne font pas ces échanges.'],
          ['Dans l’artère pulmonaire', 'L’artère pulmonaire conduit le sang aux poumons, sans y faire les échanges.'],
          ['Dans la trachée', 'La trachée est un conduit d’air et non un vaisseau sanguin.'],
        ],
        'Ce sont les vaisseaux les plus fins.',
        'Les échanges gazeux se font à travers la paroi des capillaires.',
      )(rng),
    );
  },
];

export const circulationSang: Skill = {
  id: 'v5-circulation',
  title: 'La circulation sanguine',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le cœur propulse le sang : les **artères** l’emportent du cœur vers les organes, les **veines** l’y ramènent, et les **capillaires** permettent les échanges.',
      'Côté droit vers les poumons, côté gauche vers le reste du corps : chaque **oreillette** reçoit le sang et chaque **ventricule** le chasse.',
    ],
    source:
      'Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Relier les besoins en nutriments et dioxygène des cellules animales et le rôle des systèmes de transport dans l’organisme. »',
    sources: [
      PROGRAMME,
      'bo-svt-college-2008',
      'academie-sang',
      'academie-coeur',
      'academie-artere',
      'cnrtl-veine',
      'academie-capillaire',
      'academie-oreillette',
      'cnrtl-ventricule',
      'academie-pouls',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
