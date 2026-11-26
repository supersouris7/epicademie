import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-reproduction.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— Reproductions sexuée et asexuée : gamètes, fécondation, descendants, dissémination ———

const DEFS = {
  gamète: 'une cellule reproductrice, mâle ou femelle',
  fécondation: 'l’union d’un gamète mâle et d’un gamète femelle, qui donne un œuf',
  clone: 'un ensemble d’individus issus d’un seul individu et possédant le même patrimoine génétique',
  bouturage: 'la reproduction d’une plante à partir d’un fragment détaché qui s’enracine',
  bourgeonnement: 'la reproduction asexuée où une excroissance du parent donne un nouvel individu, comme chez l’hydre',
  scissiparité: 'la reproduction asexuée par division d’un individu, fréquente chez les êtres unicellulaires',
  graine: 'l’organe d’une plante à fleurs issu de la fécondation d’un ovule, capable de germer',
  pollen: 'la poudre, produite par les étamines, dont les grains transportent les cellules reproductrices mâles',
  dissémination: 'la dispersion des graines et des spores par des agents naturels',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  gamète: 'Repère : l’ovule est un gamète femelle, le spermatozoïde un gamète mâle.',
  fécondation: 'Repère : c’est un événement (une union), pas une cellule.',
  clone: 'Repère : « même patrimoine génétique » est le mot clé.',
  bouturage: 'Repère : un morceau est détaché, puis il prend racine.',
  bourgeonnement: 'Repère : un bourgeon grandit sur le parent, sans gamètes.',
  scissiparité: 'Repère : un individu se coupe pour en donner d’autres.',
  graine: 'Repère : elle vient de la fécondation et germe ensuite.',
  pollen: 'Repère : il est transporté par le vent ou les insectes.',
  dissémination: 'Repère : il s’agit du déplacement des graines ou des spores, pas de leur formation.',
};

const INDICE = 'Demande-toi s’il s’agit d’une cellule, d’un événement, d’un mode de reproduction ou d’un transport.';

const MODES = {
  bouture: 'asexuée, par bouturage',
  marcottage: 'asexuée, par marcottage naturel',
  bourgeon: 'asexuée, par bourgeonnement',
  division: 'asexuée, par division',
  sexuee: 'sexuée, avec fécondation',
} as const;

const POURQUOI_FAUX: Readonly<Record<keyof typeof MODES, string>> = {
  bouture: 'Le bouturage suppose qu’un fragment soit détaché puis qu’il prenne racine.',
  marcottage: 'Le marcottage naturel concerne une tige qui s’enracine en restant attachée au pied d’origine.',
  bourgeon: 'Le bourgeonnement passe par un bourgeon qui se développe sur l’animal parent.',
  division: 'La division concerne un individu qui se sépare en parties, souvent un être unicellulaire.',
  sexuee: 'La reproduction sexuée exige la rencontre de deux gamètes, ce que la description ne montre pas.',
};

const AUCUN_GAMETE = 'Cherche si des gamètes se rencontrent, puis comment le nouvel individu se forme.';

const mode = (description: string, bonne: keyof typeof MODES) => ({
  prompt: `${description} Comment qualifier cette reproduction ?`,
  bonne: MODES[bonne],
  fausses: [
    ...(['bouture', 'marcottage', 'bourgeon', 'division'] as const)
      .filter((m) => m !== bonne)
      .slice(0, bonne === 'sexuee' ? 3 : 2),
    ...(bonne === 'sexuee' ? [] : (['sexuee'] as const)),
  ].map(
    (m) =>
      [
        MODES[m],
        bonne === 'sexuee'
          ? 'La description montre une fécondation : deux gamètes s’unissent, ce n’est donc pas une reproduction asexuée.'
          : POURQUOI_FAUX[m],
      ] as const,
  ),
  indice: AUCUN_GAMETE,
  explication: [
    bonne === 'sexuee'
      ? 'Deux gamètes s’unissent lors de la fécondation : la reproduction est sexuée.'
      : 'Aucune rencontre de gamètes : la reproduction est asexuée. Il reste à reconnaître le procédé.',
  ],
});

const saisie = saisieur(DEFS, INDICE);

export const reproductionModes: Skill = {
  id: 'v4-reproduction-sexuee-asexuee',
  title: 'Reproductions sexuée et asexuée',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **reproduction sexuée** unit deux **gamètes** lors de la **fécondation** : le descendant est génétiquement différent de chacun de ses parents.',
      'La **reproduction asexuée** se passe de gamètes : les descendants forment un **clone** (une plante obtenue par **bouturage**, par exemple).',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Reproductions sexuée et asexuée, rencontre des gamètes, milieux et modes de reproduction et de dissémination ».`,
    sources: [
      PROGRAMME,
      'academie-reproduction',
      'academie-asexue',
      'academie-gamete',
      'academie-fecondation',
      'academie-clone',
      'academie-bouture',
      'academie-bouturage',
      'academie-bourgeonnement',
      'cnrtl-stolon',
      'cnrtl-scissiparite',
      'academie-graine',
      'academie-pollen',
      'academie-ovule',
      'academie-dissemination',
      'academie-hermaphrodite',
    ],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['gamète', 'clone', 'dissémination'],
    cas: [
      mode('On coupe une tige d’une plante, on la plante en terre et elle prend racine.', 'bouture'),
      mode('Un fraisier émet une tige rampante qui s’enracine et donne un nouveau pied.', 'marcottage'),
      mode('Un bourgeon grandit sur une hydre d’eau douce puis donne une nouvelle hydre.', 'bourgeon'),
      mode('Un être vivant unicellulaire se sépare en deux nouveaux individus.', 'division'),
      mode('Un spermatozoïde et un ovule s’unissent et forment un œuf.', 'sexuee'),
      mode('Le pollen féconde un ovule de fleur, qui devient une graine.', 'sexuee'),
    ],
    rangements: [
      {
        prompt: 'Range les étapes de la reproduction sexuée d’une plante à fleurs.',
        suite: [
          'le pollen est transporté jusqu’à une fleur',
          'le gamète mâle féconde l’ovule',
          'l’ovule fécondé devient une graine',
          'la graine germe',
        ],
        indice: 'La fécondation précède la formation de la graine.',
        explication: 'Il faut d’abord que les gamètes se rencontrent ; la graine ne se forme qu’après la fécondation.',
      },
      {
        prompt: 'Range les étapes d’un bouturage.',
        suite: [
          'on détache un fragment de la plante',
          'on plante le fragment en terre',
          'le fragment prend racine',
          'une nouvelle plante se développe',
        ],
        indice: 'On ne peut planter qu’un fragment déjà détaché.',
        explication:
          'Le bouturage part d’un fragment détaché, qui s’enracine avant de grandir : aucun gamète n’intervient.',
      },
    ],
    trous: [
      {
        prompt: 'Complète la définition de la reproduction sexuée.',
        parts: ['Deux ', ' s’unissent au cours de la ', ' et forment un œuf.'],
        choix: [
          [['gamètes', 'boutures', 'graines'], 0],
          [['division', 'fécondation', 'dissémination'], 1],
        ],
        indice: 'Pense aux cellules reproductrices et au nom de leur union.',
        explication: 'La reproduction sexuée passe par l’union de cellules reproductrices.',
      },
      {
        prompt: 'Complète : où se produit la fécondation ?',
        parts: ['Chez les Mammifères, la fécondation est ', ' ; chez la plupart des Poissons, elle est ', '.'],
        choix: [
          [['interne', 'externe', 'asexuée'], 0],
          [['asexuée', 'externe', 'interne'], 1],
        ],
        indice: 'Demande-toi si les gamètes se rencontrent dans le corps de la femelle ou en dehors.',
        explication: 'Le lieu de rencontre des gamètes diffère selon les groupes d’êtres vivants.',
      },
      {
        prompt: 'Complète la comparaison des descendants.',
        parts: [
          'Par reproduction asexuée, les descendants sont génétiquement ',
          ' au parent ; par reproduction sexuée, ils sont ',
          ' de chacun des deux parents.',
        ],
        choix: [
          [['identiques', 'distincts', 'privés de patrimoine'], 0],
          [['identiques', 'distincts', 'les copies'], 1],
        ],
        indice: 'Combien de parents transmettent leur patrimoine génétique dans chaque cas ?',
        explication:
          'Sans rencontre de gamètes, rien ne mélange les patrimoines ; avec la fécondation, le nouvel individu est nouveau.',
      },
    ],
    faciles: [
      saisie('gamète', ['un', 'le'], ['pollen', 'graine'], ['gamètes', 'les gamètes']),
      saisie('fécondation', ['la'], ['dissémination', 'gamète']),
      saisie('clone', ['un', 'le'], ['gamète', 'graine']),
    ],
    saisies: [
      saisie('bouturage', ['le'], ['bourgeonnement', 'scissiparité']),
      saisie('bourgeonnement', ['le'], ['bouturage', 'scissiparité']),
      saisie('scissiparité', ['la'], ['bourgeonnement', 'bouturage']),
      saisie(
        'dissémination',
        ['la'],
        ['fécondation', 'pollen'],
        ['dissémination des graines', 'la dissémination des graines'],
      ),
      saisie('pollen', ['le'], ['graine', 'gamète']),
    ],
    series: [
      [
        ['gamète', DEFS['gamète']],
        ['fécondation', DEFS['fécondation']],
        ['clone', DEFS.clone],
        ['graine', DEFS.graine],
        ['dissémination', DEFS['dissémination']],
      ],
      [
        ['hydre d’eau douce', 'reproduction par bourgeonnement'],
        ['fraisier à stolons', 'reproduction par marcottage naturel'],
        ['fragment de tige replanté', 'reproduction par bouturage'],
        ['pollen déposé sur une fleur', 'préparation d’une reproduction sexuée'],
        ['organisme unicellulaire coupé en deux', 'reproduction par division'],
      ],
    ],
    pieges: [
      {
        prompt: 'L’escargot est hermaphrodite : il possède des organes mâles et femelles. Que peut-on en déduire ?',
        bonne: 'avoir les deux types d’organes ne suffit pas pour dire que sa reproduction est asexuée',
        fausses: [
          [
            'sa reproduction est forcément asexuée',
            'Le critère est la rencontre de gamètes, pas le nombre de types d’organes.',
          ],
          [
            'il ne produit aucun gamète',
            'Des organes reproducteurs mâles et femelles servent justement à produire des gamètes.',
          ],
          [
            'ses descendants forment forcément un clone',
            'Le clone concerne une reproduction sans rencontre de gamètes.',
          ],
        ],
        indice: 'Qu’est-ce qui permet de distinguer les deux modes de reproduction ?',
        explication: ['Un mode de reproduction se reconnaît à la présence ou non d’une rencontre de gamètes.'],
      },
      {
        prompt: 'On bouture dix fragments d’une même plante. Que peut-on dire des dix nouvelles plantes ?',
        bonne: 'elles ont le même patrimoine génétique que la plante de départ',
        fausses: [
          ['elles sont toutes génétiquement différentes', 'Aucune fécondation n’a mélangé de patrimoines.'],
          ['elles ont chacune deux parents', 'Un seul individu a fourni les fragments.'],
          ['elles proviennent de dix graines', 'Un fragment détaché n’est pas une graine.'],
        ],
        indice: 'Compte les parents.',
        explication: ['Le bouturage est asexué : les descendants forment un clone.'],
      },
      {
        prompt: 'Une graine est emportée loin de la plante qui l’a produite. Quel est le rôle de ce déplacement ?',
        bonne: 'la dissémination, qui disperse la graine',
        fausses: [
          ['la fécondation, qui forme la graine', 'La fécondation a déjà eu lieu : c’est elle qui a donné la graine.'],
          ['le bouturage, qui crée un clone', 'La graine vient d’une fécondation, pas d’un fragment détaché.'],
          ['la division, qui coupe la plante en deux', 'La plante ne se sépare pas en deux.'],
        ],
        indice: 'La graine existe déjà : que lui arrive-t-il ?',
        explication: ['La dissémination disperse les graines grâce à des agents naturels.'],
      },
    ],
    dossiers: [
      {
        titre: 'Jardin expérimental « Les Terrasses »',
        lignes: [
          'Carnet (inventé) du jardin « Les Terrasses ».',
          'Parcelle A : un fraisier a émis des tiges rampantes ; de nouveaux pieds se sont enracinés.',
          'Parcelle B : des graines issues de fleurs pollinisées par des insectes ont été semées.',
        ],
        questions: [
          {
            prompt: 'D’après le carnet, dans quelle parcelle les jeunes plants forment-ils un clone avec leur parent ?',
            bonne: 'la parcelle A',
            fausses: [
              ['la parcelle B', 'Les graines viennent d’une fécondation : les plants sont distincts de leurs parents.'],
              ['les deux parcelles', 'Seule la reproduction sans gamètes donne un clone.'],
              ['aucune des deux', 'La parcelle A présente une reproduction asexuée.'],
            ],
            indice: 'Repère la parcelle sans fécondation.',
            explication: [
              'En A, aucun gamète n’intervient : les nouveaux pieds sont génétiquement identiques au parent.',
            ],
          },
          {
            prompt: 'Dans la parcelle B, quel rôle jouent les insectes d’après le carnet ?',
            bonne: 'ils transportent le pollen d’une fleur à une autre',
            fausses: [
              ['ils découpent des boutures', 'Le carnet parle de pollinisation, pas de fragments replantés.'],
              ['ils produisent les ovules', 'Les ovules sont dans la fleur, pas chez l’insecte.'],
              ['ils font germer les graines', 'La germination vient après la formation de la graine.'],
            ],
            indice: 'Que signifie « pollinisées » ?',
            explication: ['En transportant le pollen, les insectes facilitent la rencontre des gamètes.'],
          },
        ],
      },
      {
        titre: 'Élevage de la mare « Les Joncs »',
        lignes: [
          'Fiche (inventée) d’observation d’une mare.',
          'Des hydres portent de petits bourgeons qui se détachent et deviennent de nouvelles hydres.',
          'Des poissons libèrent leurs gamètes dans l’eau, où ils se rencontrent.',
        ],
        questions: [
          {
            prompt: 'Quelle phrase interprète correctement la fiche ?',
            bonne: 'les hydres se reproduisent ici sans gamètes ; la fécondation des poissons est externe',
            fausses: [
              ['les deux animaux se reproduisent sans gamètes', 'Les poissons de la fiche libèrent des gamètes.'],
              ['les poissons ont une fécondation interne', 'Les gamètes se rencontrent dans l’eau, hors du corps.'],
              [
                'les bourgeons des hydres sont des gamètes',
                'Un bourgeon grandit seul en nouvelle hydre, sans union avec une autre cellule.',
              ],
            ],
            indice: 'Pour chaque animal, demande-toi si des gamètes se rencontrent et où.',
            explication: [
              'Le bourgeonnement est asexué ; une rencontre de gamètes hors du corps est une fécondation externe.',
            ],
          },
          {
            prompt: 'Que peut-on dire d’une jeune hydre issue d’un bourgeon, comparée à l’hydre qui la portait ?',
            bonne: 'elle a le même patrimoine génétique',
            fausses: [
              ['elle a un patrimoine génétique distinct', 'Cela se produit quand deux gamètes s’unissent.'],
              ['elle a deux parents', 'Une seule hydre est à l’origine du bourgeon.'],
              ['elle vient d’une graine', 'Les graines concernent les plantes à fleurs.'],
            ],
            indice: 'Combien de parents interviennent dans le bourgeonnement ?',
            explication: ['Par reproduction asexuée, le descendant est génétiquement identique à son parent.'],
          },
        ],
      },
    ],
  }),
};
