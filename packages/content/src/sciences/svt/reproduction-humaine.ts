import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-reproduction.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— La reproduction humaine : fécondation, nidation, grossesse, naissance ———

const DEFS = {
  spermatozoïde: 'la cellule reproductrice mâle, apte à féconder l’ovule',
  trompe: 'le conduit qui relie un ovaire à l’utérus',
  utérus: 'l’organe creux et musculeux où se déroule la gestation',
  nidation: 'l’implantation de l’œuf dans la muqueuse de l’utérus',
  embryon: 'le nom donné au futur enfant au début de la grossesse, avant le troisième mois',
  fœtus: 'le nom donné au futur enfant à partir du troisième mois de la grossesse',
  placenta: 'l’organe qui permet les échanges entre la mère et le futur enfant pendant la grossesse',
  'cordon ombilical': 'le lien torsadé qui relie le futur enfant au placenta',
  'liquide amniotique': 'le liquide dans lequel baigne le futur enfant',
  accouchement: 'le fait de mettre un enfant au monde',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  spermatozoïde: 'Repère : c’est le gamète mâle, contenu dans le sperme.',
  trompe: 'Repère : c’est le lieu de la fécondation.',
  utérus: 'Repère : c’est là que la grossesse se déroule.',
  nidation: 'Repère : l’œuf s’implante dans une paroi.',
  embryon: 'Repère : il précède le nom de fœtus.',
  fœtus: 'Repère : c’est le nom à partir du troisième mois.',
  placenta: 'Repère : il sert aux échanges.',
  'cordon ombilical': 'Repère : il fait le lien vers le placenta.',
  'liquide amniotique': 'Repère : le futur enfant y baigne.',
  accouchement: 'Repère : c’est la naissance.',
};

const INDICE = 'Demande-toi s’il s’agit d’une cellule, d’un organe, d’une étape ou d’un stade du futur enfant.';

const saisie = saisieur(DEFS, INDICE);

export const reproductionHumaine: Skill = {
  id: 'v4-reproduction-humaine',
  title: 'La reproduction humaine',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **fécondation** a lieu dans la **trompe** ; l’œuf s’implante ensuite dans l’**utérus** (**nidation**), où se déroule la grossesse.',
      'Le futur enfant, appelé **embryon** puis **fœtus** à partir du troisième mois, échange avec la mère grâce au **placenta** et au **cordon ombilical**.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Relier le fonctionnement des appareils reproducteurs à partir de la puberté aux principes de la maîtrise de la reproduction ».`,
    sources: [
      PROGRAMME,
      'cnrtl-spermatozoide',
      'cnrtl-sperme',
      'academie-fecondation',
      'inserm-infertilite',
      'inserm-amp',
      'inserm-contraception',
      'cnrtl-uterus',
      'academie-nidation',
      'academie-embryon',
      'academie-foetus',
      'academie-placenta',
      'academie-ombilical',
      'academie-amniotique',
      'academie-grossesse',
      'academie-accouchement',
      'inserm-alcool-sante',
    ],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['utérus', 'placenta', 'accouchement'],
    cas: [
      {
        prompt: 'Dans quelle partie de l’appareil reproducteur de la femme la fécondation a-t-elle lieu ?',
        bonne: 'dans la trompe',
        fausses: [
          ['dans l’utérus', 'L’utérus accueille l’œuf ensuite, pour la nidation.'],
          ['dans le placenta', 'Le placenta se forme pendant la grossesse.'],
          ['dans le vagin', 'Le trajet des spermatozoïdes continue au-delà.'],
        ],
        indice: 'Suis le trajet de l’ovule dès sa sortie de l’ovaire : où les spermatozoïdes le rejoignent-ils ?',
        explication: ['Chez la femme, la fécondation s’effectue dans la trompe utérine.'],
      },
      {
        prompt: 'Quelles cellules, contenues dans le sperme, sont indispensables à la fécondation ?',
        bonne: 'des spermatozoïdes',
        fausses: [
          ['des ovules', 'Les ovules sont les gamètes femelles.'],
          ['des œufs', 'L’œuf n’apparaît qu’après la fécondation.'],
          ['des embryons', 'L’embryon vient du développement de l’œuf.'],
        ],
        indice: 'Pour la fécondation, il faut un gamète de chaque sexe : lequel vient de l’homme ?',
        explication: ['Le sperme est le liquide qui contient les spermatozoïdes, les gamètes mâles.'],
      },
      {
        prompt: 'Quel est le rôle du placenta ?',
        bonne: 'permettre les échanges entre la mère et le fœtus',
        fausses: [
          ['produire les ovules', 'Les ovules se forment dans les ovaires.'],
          ['être le lieu de la fécondation', 'La fécondation a lieu dans la trompe.'],
          ['baigner le fœtus dans un liquide', 'C’est le rôle du milieu appelé liquide amniotique.'],
        ],
        indice: 'Pense à ce qui passe d’un sang à l’autre.',
        explication: [
          'Le placenta laisse passer l’oxygène et les nutriments vers le fœtus, et le gaz carbonique et les déchets en sens inverse.',
        ],
      },
      {
        prompt: 'Pendant la grossesse, quelle recommandation donne l’Inserm au sujet de l’alcool ?',
        bonne: 'ne pas en consommer',
        fausses: [
          ['en boire un peu chaque jour', 'Aucun seuil sans risque n’a pu être établi.'],
          ['en boire seulement le dernier mois', 'L’alcool peut perturber le développement à tous les stades.'],
          ['en boire sans limite car le placenta l’arrête', 'L’alcool traverse facilement le placenta.'],
        ],
        indice: 'Que se passe-t-il quand une substance traverse le placenta ?',
        explication: [
          'L’alcool traverse le placenta et expose l’embryon et le fœtus : la recommandation est de s’abstenir.',
        ],
      },
    ],
    rangements: [
      {
        prompt: 'Range les étapes qui vont de la fécondation à la naissance.',
        suite: [
          'fécondation dans la trompe',
          'nidation dans l’utérus',
          'développement de l’embryon puis du fœtus',
          'accouchement',
        ],
        indice: 'La rencontre des gamètes ouvre la liste.',
        explication:
          'La fécondation précède la nidation, la grossesse se poursuit dans l’utérus, puis vient la naissance.',
      },
      {
        prompt: 'Range le trajet d’un spermatozoïde jusqu’au lieu de la fécondation.',
        suite: [
          'il est déposé dans le vagin',
          'il traverse l’utérus',
          'il remonte dans une trompe',
          'il atteint l’ovule',
        ],
        indice: 'Pars de l’extérieur du corps vers l’ovaire.',
        explication: 'Les spermatozoïdes remontent de l’utérus vers les trompes à la rencontre de l’ovule.',
      },
    ],
    trous: [
      {
        prompt: 'Complète le nom du futur enfant.',
        parts: ['Au début de la grossesse, on parle d’', ' ; à partir du troisième mois, de ', '.'],
        choix: [
          [['embryon', 'ovule', 'ovaire'], 0],
          [['gamète', 'fœtus', 'placenta'], 1],
        ],
        indice: 'Les deux mots désignent le futur enfant à des moments différents.',
        explication: 'Dans l’espèce humaine, l’embryon prend le nom de fœtus lors du troisième mois.',
      },
      {
        prompt: 'Complète les échanges au niveau du placenta.',
        parts: ['Le sang maternel apporte au fœtus de l’', ' et des nutriments ; le fœtus rejette du ', '.'],
        choix: [
          [['oxygène', 'amidon', 'urine'], 0],
          [['lait', 'gaz carbonique', 'sperme'], 1],
        ],
        indice: 'Pense à la respiration et à ses déchets.',
        explication: 'Dans le placenta, des substances utiles passent vers le fœtus et des déchets repartent.',
      },
      {
        prompt: 'Complète le chemin de l’œuf.',
        parts: ['La fécondation a lieu dans la ', ' ; l’œuf s’implante ensuite dans l’', ' (nidation).'],
        choix: [
          [['trompe', 'vessie', 'hypophyse'], 0],
          [['ovaire', 'utérus', 'intestin'], 1],
        ],
        indice: 'Un conduit, puis un organe creux.',
        explication: 'Le conduit sert à la rencontre des gamètes ; l’organe creux abrite la grossesse.',
      },
    ],
    faciles: [
      saisie('utérus', ['l’'], ['trompe', 'placenta']),
      saisie('placenta', ['le'], ['cordon ombilical', 'utérus']),
      saisie('spermatozoïde', ['le', 'un'], ['embryon', 'trompe'], ['spermatozoïdes', 'les spermatozoïdes']),
    ],
    saisies: [
      saisie('nidation', ['la'], ['accouchement', 'trompe']),
      saisie(
        'trompe',
        ['la', 'une'],
        ['utérus', 'placenta'],
        ['trompe utérine', 'la trompe utérine', 'trompe uterine', 'la trompe uterine'],
      ),
      saisie('embryon', ['l’', 'un'], ['fœtus', 'spermatozoïde']),
      saisie('fœtus', ['le', 'un'], ['embryon', 'placenta'], ['foetus', 'le foetus', 'un foetus']),
      saisie('cordon ombilical', ['le'], ['placenta', 'trompe'], ['cordon', 'le cordon']),
      saisie('liquide amniotique', ['le'], ['placenta', 'cordon ombilical']),
    ],
    series: [
      [
        ['trompe', DEFS.trompe],
        ['nidation', DEFS.nidation],
        ['placenta', DEFS.placenta],
        ['cordon ombilical', DEFS['cordon ombilical']],
        ['accouchement', DEFS.accouchement],
      ],
      [
        ['spermatozoïde', 'gamète mâle'],
        ['ovule', 'gamète femelle'],
        ['embryon', 'nom avant le troisième mois de grossesse'],
        ['fœtus', 'nom à partir du troisième mois de grossesse'],
        ['liquide amniotique', 'milieu dans lequel baigne le futur enfant'],
      ],
    ],
    pieges: [
      {
        prompt: 'Quelle différence existe-t-il entre la fécondation et la nidation ?',
        bonne: 'la fécondation unit les gamètes, la nidation implante l’œuf dans l’utérus',
        fausses: [
          ['les deux mots désignent la même étape', 'Ce sont deux étapes successives, dans deux lieux différents.'],
          ['la nidation unit les gamètes, la fécondation implante l’œuf', 'Les deux définitions sont inversées.'],
          ['la fécondation est la naissance', 'La naissance est l’accouchement.'],
        ],
        indice: 'L’une est une rencontre, l’autre une installation.',
        explication: ['La rencontre des gamètes précède l’installation de l’œuf dans la muqueuse utérine.'],
      },
      {
        prompt: 'Quelle substance passe du sang maternel au fœtus à travers le placenta ?',
        bonne: 'des nutriments',
        fausses: [
          ['les déchets du fœtus', 'Les déchets partent dans l’autre sens, du fœtus vers la mère.'],
          ['le gaz carbonique du fœtus', 'Le gaz carbonique quitte le fœtus.'],
          ['des spermatozoïdes', 'Les spermatozoïdes n’interviennent que pour la fécondation.'],
        ],
        indice: 'Pense à ce dont le fœtus a besoin pour grandir.',
        explication: ['Le placenta fait passer l’oxygène et les nutriments vers le fœtus.'],
      },
      {
        prompt: 'Pourquoi une substance comme l’alcool peut-elle atteindre le fœtus ?',
        bonne: 'elle traverse facilement le placenta',
        fausses: [
          [
            'elle est absorbée par le cordon ombilical à partir de l’air',
            'Le cordon relie le fœtus au placenta, pas à l’air.',
          ],
          ['le fœtus la boit au biberon', 'La grossesse précède toute alimentation au biberon.'],
          ['le placenta la bloque entièrement', 'Au contraire, elle le traverse facilement.'],
        ],
        indice: 'Quel organe sert aux échanges ?',
        explication: ['L’alcool passe à travers le placenta et expose l’embryon et le fœtus.'],
      },
    ],
    dossiers: [
      {
        titre: 'Carnet de suivi fictif « Azur »',
        lignes: [
          'Carnet (inventé) d’une grossesse suivie en cours de SVT.',
          'Mois 2 : le carnet nomme le futur enfant d’après son stade.',
          'Mois 5 : les échanges avec la mère passent par un organe auquel un cordon relie le futur enfant.',
        ],
        questions: [
          {
            prompt: 'Comment le carnet doit-il nommer le futur enfant au mois 5 ?',
            bonne: 'un fœtus',
            fausses: [
              ['un embryon', 'Le nom d’embryon s’emploie avant le troisième mois.'],
              ['un ovule', 'L’ovule est un gamète, avant la fécondation.'],
              ['un œuf', 'L’œuf est le stade qui suit immédiatement la fécondation.'],
            ],
            indice: 'Compare le mois 5 au troisième mois.',
            explication: ['À partir du troisième mois, le futur enfant porte le nom de fœtus.'],
          },
          {
            prompt: 'Quel est l’organe d’échange décrit au mois 5 ?',
            bonne: 'le placenta',
            fausses: [
              ['l’ovaire', 'L’ovaire forme les ovules et ne sert pas aux échanges avec le fœtus.'],
              ['la trompe', 'La trompe sert à la fécondation.'],
              ['la vessie', 'La vessie stocke l’urine.'],
            ],
            indice: 'Le cordon ombilical y aboutit.',
            explication: ['Le cordon ombilical relie le fœtus au placenta, organe des échanges.'],
          },
        ],
      },
      {
        titre: 'Schéma fictif « les premiers jours »',
        lignes: [
          'Fiche (inventée) à compléter.',
          'Un ovule quitte un ovaire et rencontre un spermatozoïde dans un conduit.',
          'L’œuf formé gagne ensuite un organe creux et se fixe dans sa paroi.',
        ],
        questions: [
          {
            prompt: 'Comment s’appellent, dans l’ordre, les deux étapes décrites ?',
            bonne: 'la fécondation, puis la nidation',
            fausses: [
              ['la nidation, puis la fécondation', 'L’œuf doit exister avant de pouvoir s’implanter.'],
              ['l’ovulation, puis l’accouchement', 'La fiche ne décrit pas de naissance.'],
              ['la puberté, puis la grossesse', 'La puberté est une période de la vie, pas une étape de ce schéma.'],
            ],
            indice: 'Rencontre, puis fixation.',
            explication: [
              'La fécondation unit ovule et spermatozoïde ; la nidation implante l’œuf dans la paroi de l’utérus.',
            ],
          },
          {
            prompt: 'Quels sont le conduit et l’organe creux de la fiche ?',
            bonne: 'la trompe, puis l’utérus',
            fausses: [
              [
                'l’utérus, puis la trompe',
                'La rencontre des gamètes a lieu dans le conduit, avant l’arrivée dans l’organe creux.',
              ],
              ['l’ovaire, puis le vagin', 'L’ovaire libère l’ovule ; il n’est pas le conduit de la fécondation.'],
              ['le placenta, puis la vessie', 'Ni l’un ni l’autre ne correspondent à la fiche.'],
            ],
            indice: 'La fécondation a un lieu précis.',
            explication: ['La rencontre a lieu dans la trompe ; l’œuf s’implante ensuite dans l’utérus.'],
          },
        ],
      },
    ],
  }),
};
