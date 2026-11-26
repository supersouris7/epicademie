import type { Skill } from '../../types.ts';
import { maj } from '../st/outils.ts';
import { PROGRAMME } from './donnees.ts';
import { associer, choisir, completer, ecrire, generer, ranger, surDocument, type Modele } from './nutrition-kit.ts';

// ——— Écosystèmes : milieu et êtres vivants, relations alimentaires et autres interactions ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Qu’est-ce qu’un écosystème ?',
    'Des êtres vivants et le milieu dans lequel ils vivent',
    [
      [
        'Un seul animal et sa nourriture préférée',
        'Un écosystème réunit une communauté d’êtres vivants et leur milieu.',
      ],
      ['Des roches sans aucun être vivant', 'Sans communauté d’êtres vivants, on ne parle pas d’écosystème.'],
    ],
    'Pense à une mare : qu’y trouve-t-on ?',
    'Un écosystème associe une communauté d’êtres vivants et son milieu.',
  ),
  choisir(
    'Dans une chaîne alimentaire, qui se trouve au début ?',
    'Un végétal',
    [
      ['Un carnivore', 'Le carnivore est un consommateur, plus loin dans la chaîne.'],
      ['Un prédateur', 'Un prédateur capture d’autres animaux : il n’est pas au début.'],
    ],
    'Cherche l’être vivant qui fabrique sa propre matière.',
    'Une chaîne alimentaire va du végétal producteur au carnivore.',
  ),
  choisir(
    'Comment appelle-t-on un animal qui capture d’autres animaux pour s’en nourrir ?',
    'Un prédateur',
    [
      ['Un végétal', 'Un végétal n’est pas un animal qui capture des proies.'],
      ['Un biotope', 'Le biotope désigne un milieu, pas un animal.'],
    ],
    'La fouine en est un exemple.',
    'Un prédateur capture d’autres animaux et s’en nourrit.',
  ),
  choisir(
    'Dans un écosystème, les êtres vivants et le milieu sont-ils reliés ?',
    'Oui, ils sont en interaction constante',
    [
      ['Non, chaque élément vit isolé', 'Les composants d’un écosystème agissent les uns sur les autres.'],
      ['Seulement un jour par an', 'Les interactions sont constantes.'],
    ],
    'Pense aux besoins d’un animal : nourriture, abri, eau.',
    'Les composants d’un écosystème sont en interaction constante.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Que désigne le mot « biotope » ?',
    'Le milieu, avec ses conditions physiques et chimiques',
    [
      ['L’ensemble des êtres vivants liés entre eux', 'Cela correspond à la biocénose.'],
      ['Une seule espèce animale', 'Le biotope est un lieu, pas une espèce.'],
      ['La suite des repas des êtres vivants', 'Cela correspond à une chaîne alimentaire.'],
    ],
    'Le biotope est le « lieu » de vie.',
    'Le biotope est une aire aux conditions climatiques et physico-chimiques homogènes.',
  ),
  choisir(
    'Que désigne le mot « biocénose » ?',
    'Les êtres vivants d’un même milieu, liés les uns aux autres',
    [
      ['Le sol et l’eau d’un milieu', 'Ce sont des éléments du biotope.'],
      ['Le climat d’une région', 'Le climat fait partie des conditions du milieu.'],
      ['Un seul animal dans un terrier', 'La biocénose est un ensemble d’êtres vivants.'],
    ],
    'Il s’agit des vivants, pas du milieu.',
    'La biocénose est l’ensemble des êtres vivants d’un espace, liés par une dépendance réciproque.',
  ),
  choisir(
    'Une tique se fixe sur un chien et vit à ses dépens. Comment appelle-t-on cette tique ?',
    'Un parasite',
    [
      ['Un prédateur', 'Un prédateur capture sa proie pour la manger, il ne vit pas fixé sur elle.'],
      ['Un végétal chlorophyllien', 'La tique est un animal.'],
      ['Un décomposeur', 'Un décomposeur vit de matières mortes, pas d’un hôte vivant.'],
    ],
    'Elle vit au détriment de son hôte.',
    'Un parasite vit et se développe au détriment d’un hôte sur lequel il s’est fixé.',
  ),
  choisir(
    'Qu’est-ce qu’une symbiose ?',
    'Une association durable profitable à chacun des partenaires',
    [
      ['Une association qui nuit à l’un des deux', 'C’est le cas du parasitisme.'],
      ['Un animal qui en capture un autre', 'C’est de la prédation.'],
      ['La mort de deux espèces', 'La symbiose est une association entre êtres vivants.'],
    ],
    'Chacun y gagne quelque chose.',
    'La symbiose est une association durable profitable à chacun.',
  ),
  associer(
    'Associe chaque mot à sa définition',
    [
      ['Le biotope', 'le milieu et ses conditions'],
      ['La biocénose', 'les êtres vivants liés entre eux'],
      ['La chaîne alimentaire', 'une suite d’êtres vivants où chacun se nourrit du précédent'],
    ],
    'Sépare le milieu, les vivants et les repas.',
    'Ces trois mots décrivent un écosystème de trois points de vue.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  ranger(
    'Dans cette prairie imaginée, le criquet mange de l’herbe, la grenouille mange le criquet et la couleuvre mange la grenouille. Range la chaîne alimentaire.',
    ['L’herbe', 'Le criquet', 'La grenouille', 'La couleuvre'],
    'Commence par le végétal.',
    'Chaque être vivant se nourrit de celui qui le précède.',
  ),
  ranger(
    'Dans cette mare imaginée, une larve mange une algue, un petit poisson mange la larve et un héron mange le poisson. Range la chaîne alimentaire.',
    ['L’algue', 'La larve', 'Le petit poisson', 'Le héron'],
    'Commence par celui qui ne mange personne ici.',
    'Chaque être vivant se nourrit de celui qui le précède.',
  ),
  completer(
    'Complète avec les mots du chapitre.',
    ['Un écosystème réunit le milieu, appelé ', ', et les êtres vivants, qui forment la ', '.'],
    [['biotope'], ['biocénose', 'biocenose']],
    'Les deux mots commencent par « bio ».',
    'Le biotope est le milieu ; la biocénose rassemble les êtres vivants.',
  ),
  ecrire(
    'Écris l’adjectif qui qualifie un animal, comme le criquet, qui se nourrit de matières végétales.',
    ['phytophage', 'un phytophage'],
    [
      ['prédateur', 'Un prédateur se nourrit d’animaux qu’il capture.'],
      ['parasite', 'Un parasite vit fixé sur un hôte à son détriment.'],
    ],
    'Il commence par la lettre « p » et se termine comme « saprophage ».',
    'Phytophage : qui se nourrit de matières végétales.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  ecrire(
    'Écris le mot qui désigne un être vivant incapable de fabriquer sa matière à partir de matières minérales et qui utilise la matière d’autres êtres vivants.',
    ['hétérotrophe', 'heterotrophe', 'un hétérotrophe', 'un heterotrophe'],
    [
      ['autotrophe', 'Un autotrophe fabrique sa matière à partir de matières minérales.'],
      ['phytophage', 'Phytophage précise seulement un régime à base de végétaux.'],
    ],
    'C’est le contraire d’« autotrophe ».',
    'Un hétérotrophe utilise des matières organiques fabriquées par d’autres.',
  ),
  ecrire(
    'Un micro-organisme vit aux dépens de matières mortes et provoque leur décomposition. Écris son nom savant.',
    ['saprophyte', 'un saprophyte'],
    [
      ['parasite', 'Un parasite vit au détriment d’un hôte vivant.'],
      ['saprophage', 'Le saprophage est un animal qui mange des matières en décomposition.'],
    ],
    'Il ressemble à « saprophage », qui désigne un animal, mais se termine autrement.',
    'Un saprophyte vit aux dépens de matières organiques inertes.',
  ),
  associer(
    'Associe chaque relation à sa description',
    [
      ['Prédation', 'un animal en capture un autre et le mange'],
      ['Parasitisme', 'un organisme vit au détriment de son hôte'],
      ['Symbiose', 'une association durable profite à chacun'],
      ['Décomposition', 'des matières mortes sont dégradées par des organismes'],
      ['Consommation de végétaux', 'un phytophage mange des plantes'],
    ],
    'Repère qui profite et qui est lésé.',
    'Les êtres vivants interagissent de manières très différentes.',
  ),
  ecrire(
    'Dans le sol, certains êtres vivants dégradent la matière morte et rejettent du dioxyde de carbone. Écris leur nom général.',
    ['décomposeurs', 'les décomposeurs', 'des décomposeurs', 'décomposeur', 'decomposeurs', 'les decomposeurs'],
    [
      ['prédateurs', 'Un prédateur capture des animaux vivants.'],
      ['parasites', 'Un parasite vit au détriment d’un hôte vivant.'],
    ],
    'Leur nom décrit leur action sur la matière morte.',
    'Les décomposeurs dégradent la matière morte ; le dioxyde de carbone rejeté peut servir aux végétaux verts.',
  ),
];

const prairie = (rng: Parameters<Modele>[0]) => {
  const rongeur = rng.pick(['les campagnols', 'les lapins']);
  const chasseur = rng.pick(['les renards', 'les fouines']);
  return {
    rongeur,
    chasseur,
    lines: [
      'Prairie imaginée.',
      `${maj(rongeur)} mangent de l’herbe ; ${chasseur} mangent ${rongeur}.`,
      'Cette année, un piégeage retire presque tous ces prédateurs. Rien d’autre ne change.',
    ],
    recit: `Prairie : ${rongeur} mangent l’herbe, ${chasseur} les mangent, puis presque tous ${chasseur} sont retirés.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const p = prairie(rng);
    return surDocument(
      'Étude d’une prairie',
      p.lines,
      choisir(
        `${p.recit} Quelle conséquence attendre d’abord ?`,
        `Les populations de ${p.rongeur.replace('les ', '')} risquent d’augmenter`,
        [
          [
            `Les populations de ${p.rongeur.replace('les ', '')} vont forcément disparaître`,
            'On retire leurs prédateurs : rien n’indique qu’ils disparaissent.',
          ],
          ['L’herbe va forcément pousser davantage', 'Avec plus de mangeurs d’herbe, on attend plutôt l’inverse.'],
          [
            'Rien ne peut changer, car les êtres vivants sont indépendants',
            'Les composants d’un écosystème sont en interaction.',
          ],
        ],
        'Qui n’est plus mangé ?',
        'Quand les prédateurs disparaissent, leurs proies subissent moins de prélèvements.',
      )(rng),
    );
  },
  (rng) => {
    const p = prairie(rng);
    return surDocument(
      'Étude d’une prairie',
      p.lines,
      choisir(
        `${p.recit} Quelle activité humaine modifie ici l’écosystème ?`,
        'Le piégeage des prédateurs',
        [
          ['La pousse de l’herbe', 'La pousse de l’herbe n’est pas une activité humaine.'],
          [`Le repas des ${p.chasseur.replace('les ', '')}`, 'C’est une relation naturelle entre êtres vivants.'],
          ['Aucune', 'Le document décrit bien une intervention humaine.'],
        ],
        'Repère ce qui est fait par des personnes.',
        'Le piégeage est une action humaine qui modifie les relations de l’écosystème.',
      )(rng),
    );
  },
  (rng) => {
    const p = prairie(rng);
    return surDocument(
      'Étude d’une prairie',
      p.lines,
      ranger(
        `${p.recit} Avant le piégeage, range la chaîne alimentaire.`,
        ['L’herbe', maj(p.rongeur), maj(p.chasseur)],
        'Pars du végétal.',
        'La chaîne part du végétal, va au mangeur d’herbe puis au prédateur.',
      )(rng),
    );
  },
];

export const ecosystemes: Skill = {
  id: 'v5-ecosystemes',
  title: 'Les écosystèmes',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **écosystème** réunit un milieu, le **biotope**, et des êtres vivants liés entre eux, la **biocénose**. Exemple : une mare, son eau et tout ce qui y vit.',
      'Dans une **chaîne alimentaire**, chacun se nourrit du précédent, en partant d’un végétal. Les **décomposeurs** dégradent la matière morte. Une activité humaine peut modifier tout cet ensemble.',
      'Un **prédateur** capture d’autres animaux ; un **parasite** vit aux dépens de son hôte ; une **symbiose** profite à chaque partenaire. Un animal **phytophage** mange des végétaux. Un être **hétérotrophe** utilise la matière d’autres êtres vivants.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Expliquer comment une activité humaine peut modifier l’organisation et le fonctionnement des écosystèmes ».`,
    sources: [
      PROGRAMME,
      'academie-ecosysteme',
      'academie-biocenose',
      'academie-biotope',
      'academie-chaine',
      'cnrtl-chaine-alimentaire',
      'academie-predateur',
      'academie-parasite',
      'academie-phytophage',
      'academie-heterotrophe',
      'cnrtl-symbiose',
      'cnrtl-saprophyte',
      'cnrtl-saprophage',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
