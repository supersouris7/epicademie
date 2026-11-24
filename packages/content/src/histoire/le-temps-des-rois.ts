import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, thème 2 « Le temps des rois » (lot hi-cm1-02). Chaque fait cite le programme du cycle 3
 * (registre `cycle3-2020`) avec sa citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

const Q_ROIS = 'Louis IX, le « roi chrétien » au XIIIe siècle';
const Q_PUISSANCE =
  'l’étude de la monarchie capétienne se centre sur le pouvoir royal, ses permanences et sur la construction territoriale du royaume de France';
const Q_FEMMES = 'quelques figures féminines importantes : Aliénor d’Aquitaine, Anne de Bretagne, Catherine de Médicis';
const Q_VIOLENCES = 'celles liées aux violences telles que les croisades, les guerres de religion et le régicide';
const Q_COLONIAL = 'une présentation de la formation du premier empire colonial français, porté par le pouvoir royal';

// ——— Notion 1 : Louis IX ———

const louisIx: Notion = {
  id: 'hcm1-louis-ix',
  title: 'Louis IX, le roi chrétien',
  hint: 'Relis le mémo : cherche le surnom, le siècle et les violences citées.',
  memo: [
    'Louis IX est surnommé le « **roi chrétien** » : il règne au XIIIe siècle, il y a très longtemps !',
    'À cette époque, on étudie surtout le **pouvoir royal** : le roi gouverne le royaume de France.',
    'Le programme parle aussi des **croisades** : de grandes expéditions armées, faites au nom de la religion. On les étudie avec sérieux, comme des violences du passé.',
  ],
  faits: [
    {
      q: 'Quel surnom le programme donne-t-il à Louis IX ?',
      a: 'le roi chrétien',
      wrong: [
        { label: 'le roi Soleil', why: 'Le roi Soleil est Louis XIV, à Versailles. Louis IX est le « roi chrétien ».' },
        {
          label: 'le roi mathématicien',
          why: 'Ce surnom n’existe pas dans le programme. Louis IX est le « roi chrétien ».',
        },
        { label: 'le roi voyageur', why: 'Ce n’est pas son surnom. Le programme dit « roi chrétien ».' },
      ],
      gap: ['Louis IX est le « roi ', ' » du XIIIe siècle.', ['chrétien', 'chretien']],
      quote: Q_ROIS,
      explain: 'Le programme appelle Louis IX le « roi chrétien ».',
    },
    {
      q: 'Au cours de quel siècle règne Louis IX ?',
      a: 'au XIIIe siècle',
      wrong: [
        { label: 'au XVIIe siècle', why: 'Le XVIIe siècle est celui de Louis XIV. Louis IX règne au XIIIe siècle.' },
        {
          label: 'au XXe siècle',
          why: 'Au XXe siècle, il n’y a plus de roi en France : Louis IX est bien plus ancien.',
        },
        {
          label: 'au XVIe siècle',
          why: 'Le XVIe siècle est celui de la Renaissance et de François Ier, pas de Louis IX.',
        },
      ],
      gap: ['Louis IX règne au ', ' siècle.', ['XIIIe', 'XIIIème', '13e', 'treizième', 'treizieme']],
      quote: Q_ROIS,
      explain: 'Louis IX règne au XIIIe siècle.',
    },
    {
      q: 'Le programme cite les croisades parmi les questions liées à quoi ?',
      a: 'aux violences',
      wrong: [
        {
          label: 'aux fêtes de la cour',
          why: 'Les croisades sont des expéditions armées : le programme les range avec les violences.',
        },
        {
          label: 'aux arts et aux lettres',
          why: 'Les arts et les lettres sont liés à François Ier, pas aux croisades.',
        },
        {
          label: 'aux jeux des enfants',
          why: 'Les croisades sont des expéditions armées : le programme parle de violences.',
        },
      ],
      gap: ['Le programme range les croisades parmi les ', ' du passé.', ['violences']],
      quote: Q_VIOLENCES,
      explain: 'Croisades, guerres de religion et régicide sont cités comme des violences.',
    },
    {
      q: 'Sur quoi se centre l’étude de la monarchie capétienne ?',
      a: 'sur le pouvoir royal',
      wrong: [
        { label: 'sur les inventions modernes', why: 'Ce n’est pas le sujet : on étudie le pouvoir du roi.' },
        {
          label: 'sur la vie des paysans uniquement',
          why: 'Le programme se centre sur le pouvoir royal, pas seulement sur les paysans.',
        },
        {
          label: 'sur la conquête de la Gaule',
          why: 'La conquête de la Gaule est bien plus ancienne : on étudie ici le pouvoir royal.',
        },
      ],
      gap: ['L’étude de la monarchie se centre sur le pouvoir ', '.', ['royal']],
      quote: Q_PUISSANCE,
      explain: 'On étudie le pouvoir royal, ses permanences et la construction du royaume.',
    },
  ],
  paires3: [
    ['Louis IX', 'Le « roi chrétien »'],
    ['XIIIe siècle', 'Le siècle de Louis IX'],
    ['Croisades', 'Expéditions armées au nom de la religion'],
  ],
  paires5: [
    ['Louis IX', 'Le « roi chrétien »'],
    ['XIIIe siècle', 'Le siècle de Louis IX'],
    ['Croisades', 'Expéditions armées au nom de la religion'],
    ['Pouvoir royal', 'Le pouvoir du roi sur le royaume'],
    ['Monarchie', 'Régime où un roi dirige le royaume'],
  ],
  libres: [
    {
      q: 'Louis IX est le roi … (un mot : son surnom).',
      accepted: ['chrétien', 'chretien', 'le roi chrétien', 'roi chrétien'],
      traps: [
        { text: 'soleil', why: 'Le roi Soleil est Louis XIV, qui règne à Versailles.' },
        {
          text: 'protecteur',
          why: 'François Ier est le protecteur des Arts et des Lettres. Louis IX est le roi chrétien.',
        },
      ],
      quote: Q_ROIS,
      explain: 'Louis IX est le « roi chrétien ».',
    },
    {
      q: 'Louis IX règne au … siècle (chiffres romains).',
      accepted: ['XIIIe', 'XIIIe siècle', 'XIII'],
      traps: [
        { text: 'XVIIe', why: 'Le XVIIe siècle est celui de Louis XIV.' },
        { text: 'XVIe', why: 'Le XVIe siècle est celui de la Renaissance et de François Ier.' },
      ],
      quote: Q_ROIS,
      explain: 'Louis IX règne au XIIIe siècle.',
    },
    {
      q: 'Les croisades, les guerres de religion et le régicide sont cités comme des … (un mot).',
      accepted: ['violences', 'violence', 'des violences'],
      traps: [
        { text: 'fêtes', why: 'Ce sont des événements violents, pas des fêtes.' },
        { text: 'inventions', why: 'Ce ne sont pas des inventions : le programme parle de violences.' },
      ],
      quote: Q_VIOLENCES,
      explain: 'Le programme cite ces trois sujets comme des violences.',
    },
  ],
  docs: [
    {
      title: 'Un roi du XIIIe siècle',
      lines: [
        'Un roi règne sur la France au XIIIe siècle.',
        'On le surnomme le « roi chrétien ».',
        'Son pouvoir royal est au centre de la vie du royaume.',
      ],
      qs: [
        {
          q: 'De quel roi parle ce texte ?',
          a: 'Louis IX',
          wrong: [
            { label: 'Louis XIV', why: 'Louis XIV règne bien plus tard et on l’appelle le roi Soleil.' },
            { label: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes, pas au XIIIe siècle.' },
          ],
          quote: Q_ROIS,
          explain: 'Le « roi chrétien » du XIIIe siècle est Louis IX.',
        },
      ],
    },
    {
      title: 'Un cours sur les rois',
      lines: [
        'La maîtresse explique que l’on étudie le pouvoir du roi.',
        'Elle cite aussi des violences : les croisades, les guerres de religion et le régicide.',
      ],
      qs: [
        {
          q: 'Parmi ces violences, laquelle désigne de grandes expéditions armées, faites au nom de la religion ?',
          a: 'les croisades',
          wrong: [
            {
              label: 'les guerres de religion',
              why: 'Les guerres de religion se passent dans le royaume, entre habitants.',
            },
            { label: 'le régicide', why: 'Le régicide est la mort d’un roi : ce n’est pas une expédition.' },
          ],
          quote: Q_VIOLENCES,
          explain: 'Les croisades sont des expéditions armées, citées avec les violences.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : François Ier ———

const francoisIer: Notion = {
  id: 'hcm1-francois-ier',
  title: 'François Ier, protecteur des arts',
  hint: 'Relis le mémo : la Renaissance, ce que protège le roi, et les femmes citées.',
  memo: [
    'François Ier est un **protecteur** des Arts et des Lettres : il aide les peintres, les écrivains et les savants.',
    'Il vit à l’époque de la **Renaissance**, quand on redécouvre les idées et les œuvres de l’Antiquité.',
    'Le programme cite aussi des femmes importantes, comme Anne de Bretagne, qui montrent le rôle des **alliances** entre familles royales.',
  ],
  faits: [
    {
      q: 'De quoi François Ier est-il un protecteur ?',
      a: 'des Arts et des Lettres',
      wrong: [
        {
          label: 'des armées et des forteresses',
          why: 'Le programme dit « Arts et Lettres » : peintres, écrivains, savants.',
        },
        {
          label: 'des routes et des ponts',
          why: 'Ce n’est pas ce que dit le programme. François Ier protège les Arts et les Lettres.',
        },
        {
          label: 'des marchands et des banquiers',
          why: 'Ce n’est pas ce que dit le programme : c’est « Arts et Lettres ».',
        },
      ],
      gap: ['François Ier est un protecteur des Arts et des ', '.', ['Lettres', 'lettres']],
      quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
      explain: 'François Ier est un protecteur des Arts et des Lettres.',
    },
    {
      q: 'À quelle période François Ier est-il protecteur des Arts et des Lettres ?',
      a: 'à la Renaissance',
      wrong: [
        {
          label: 'à la préhistoire',
          why: 'La préhistoire est avant l’écriture : bien trop ancienne pour un roi de France.',
        },
        {
          label: 'à la Révolution',
          why: 'La Révolution est le thème suivant du programme : François Ier est bien plus ancien.',
        },
        { label: 'à l’âge industriel', why: 'L’âge industriel est au programme de CM2 : c’est bien plus tard.' },
      ],
      gap: ['François Ier protège les Arts et les Lettres à la ', '.', ['Renaissance']],
      quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
      explain: 'François Ier vit à la Renaissance.',
    },
    {
      q: 'Quelle femme le programme cite-t-il comme figure importante du temps des rois ?',
      a: 'Anne de Bretagne',
      wrong: [
        { label: 'Cléopâtre', why: 'Cléopâtre est une reine d’Égypte, pas citée pour le temps des rois de France.' },
        { label: 'Marie Curie', why: 'Marie Curie est une savante du XXe siècle, pas du temps des rois.' },
        { label: 'Jeanne Calment', why: 'Elle n’est pas citée par le programme du temps des rois.' },
      ],
      gap: ['Aliénor d’Aquitaine, ', ' et Catherine de Médicis sont citées.', ['Anne de Bretagne']],
      quote: Q_FEMMES,
      explain: 'Aliénor d’Aquitaine, Anne de Bretagne et Catherine de Médicis sont citées.',
    },
    {
      q: 'Quel roi est un protecteur des Arts et des Lettres ?',
      a: 'François Ier',
      wrong: [
        { label: 'Louis IX', why: 'Louis IX est le « roi chrétien » du XIIIe siècle.' },
        { label: 'Louis XIV', why: 'Louis XIV est le roi Soleil, à Versailles.' },
        { label: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes.' },
      ],
      gap: ['Le roi ', ' est un protecteur des Arts et des Lettres.', ['François Ier', 'François 1er', 'Francois Ier']],
      quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
      explain: 'C’est François Ier qui protège les Arts et les Lettres.',
    },
  ],
  paires3: [
    ['François Ier', 'Protecteur des Arts et des Lettres'],
    ['Renaissance', 'Époque où vit François Ier'],
    ['Anne de Bretagne', 'Femme citée par le programme'],
  ],
  paires5: [
    ['François Ier', 'Protecteur des Arts et des Lettres'],
    ['Renaissance', 'Époque où vit François Ier'],
    ['Anne de Bretagne', 'Femme citée par le programme'],
    ['Louis IX', 'Le « roi chrétien »'],
    ['Louis XIV', 'Le roi Soleil'],
  ],
  libres: [
    {
      q: 'François Ier est un protecteur des Arts et des … (un mot).',
      accepted: ['lettres', 'les lettres'],
      traps: [
        { text: 'armes', why: 'Le programme parle d’Arts et de Lettres, pas d’armes.' },
        { text: 'sciences', why: 'Le mot du programme est « Lettres ».' },
      ],
      quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
      explain: 'Arts et Lettres : les peintres et les écrivains.',
    },
    {
      q: 'François Ier est un protecteur des Arts et des Lettres à la … (un mot).',
      accepted: ['renaissance', 'la renaissance'],
      traps: [
        { text: 'révolution', why: 'La Révolution est un autre thème du programme, plus tardif.' },
        { text: 'préhistoire', why: 'La préhistoire est très ancienne : avant l’écriture.' },
      ],
      quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
      explain: 'François Ier vit à la Renaissance.',
    },
    {
      q: 'Quel roi est le protecteur des Arts et des Lettres ? (nom et numéro)',
      accepted: ['François Ier', 'François 1er', 'Francois Ier', 'François I'],
      traps: [
        { text: 'Louis XIV', why: 'Louis XIV est le roi Soleil.' },
        { text: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes.' },
      ],
      quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
      explain: 'C’est François Ier.',
    },
  ],
  docs: [
    {
      title: 'Un atelier de peintre',
      lines: [
        'Un peintre travaille dans l’atelier d’un château.',
        'Le roi l’aide et protège son travail.',
        'On est à la Renaissance.',
      ],
      qs: [
        {
          q: 'Quel roi du programme protège ainsi les artistes ?',
          a: 'François Ier',
          wrong: [
            { label: 'Louis IX', why: 'Louis IX est le « roi chrétien » du XIIIe siècle.' },
            { label: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes.' },
          ],
          quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
          explain: 'Le roi qui protège les Arts à la Renaissance est François Ier.',
        },
      ],
    },
    {
      title: 'Une visite au château',
      lines: [
        'Un guide explique que le roi aidait les écrivains et les peintres.',
        'Il parle aussi d’Anne de Bretagne, une femme importante de cette période.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on ce que le roi fait pour les écrivains et les peintres ?',
          a: 'il les protège',
          wrong: [
            { label: 'il les combat', why: 'Le texte dit que le roi les aide : il les protège.' },
            { label: 'il les ignore', why: 'Le texte dit qu’il les aide, il ne les ignore pas.' },
          ],
          quote: 'François Ier, un protecteur des Arts et des Lettres à la Renaissance',
          explain: 'Un protecteur des Arts et des Lettres aide les artistes et les écrivains.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : Henri IV et l'édit de Nantes ———

const henriIv: Notion = {
  id: 'hcm1-henri-iv',
  title: 'Henri IV et l’édit de Nantes',
  hint: 'Relis le mémo : un roi, une ville, un texte et les guerres citées.',
  memo: [
    'Henri IV est le roi de l’**édit de Nantes** : un texte officiel du roi, signé à Nantes.',
    'Le programme cite aussi les **guerres de religion** parmi les violences que l’on étudie avec sérieux.',
    'Retiens : roi Henri IV, ville Nantes, texte : l’édit de Nantes.',
  ],
  faits: [
    {
      q: 'Quel roi est lié à l’édit de Nantes ?',
      a: 'Henri IV',
      wrong: [
        { label: 'Louis IX', why: 'Louis IX est le « roi chrétien » du XIIIe siècle.' },
        { label: 'Louis XIV', why: 'Louis XIV est le roi Soleil à Versailles.' },
        { label: 'François Ier', why: 'François Ier protège les Arts et les Lettres.' },
      ],
      gap: ['L’édit de Nantes est lié au roi ', '.', ['Henri IV', 'Henri 4', 'Henri quatre']],
      quote: 'Henri IV et l’édit de Nantes',
      explain: 'Le programme associe Henri IV et l’édit de Nantes.',
    },
    {
      q: 'Quel est le nom de l’édit lié à Henri IV ?',
      a: 'l’édit de Nantes',
      wrong: [
        {
          label: 'l’édit de Versailles',
          why: 'Versailles est le château de Louis XIV. L’édit d’Henri IV est celui de Nantes.',
        },
        { label: 'l’édit de Paris', why: 'Le programme dit « Nantes », pas Paris.' },
        { label: 'l’édit de Lyon', why: 'Le programme dit « Nantes », pas Lyon.' },
      ],
      gap: ['Henri IV et l’édit de ', '.', ['Nantes']],
      quote: 'Henri IV et l’édit de Nantes',
      explain: 'L’édit de Nantes est associé à Henri IV.',
    },
    {
      q: 'Le programme cite les guerres de religion parmi les questions liées à quoi ?',
      a: 'aux violences',
      wrong: [
        {
          label: 'aux voyages d’exploration',
          why: 'Les guerres de religion sont des guerres : le programme parle de violences.',
        },
        { label: 'aux fêtes royales', why: 'Ce ne sont pas des fêtes : ce sont des guerres.' },
        { label: 'aux traditions de cuisine', why: 'Ce n’est pas le sujet : le programme parle de violences.' },
      ],
      gap: ['Les guerres de religion sont citées parmi les ', '.', ['violences']],
      quote: Q_VIOLENCES,
      explain: 'Les guerres de religion sont citées parmi les violences.',
    },
    {
      q: 'Henri IV fait partie de quel thème du programme de CM1 ?',
      a: 'Le temps des rois',
      wrong: [
        {
          label: 'Le temps de la Révolution et de l’Empire',
          why: 'C’est le thème suivant, avec Louis XVI et Napoléon.',
        },
        { label: 'Et avant la France ?', why: 'C’est le thème d’avant : Gaulois, Romains, Clovis et Charlemagne.' },
        {
          label: 'Se repérer dans le temps',
          why: 'Ce n’est pas le thème des rois, mais celui des frises et des siècles.',
        },
      ],
      gap: ['Henri IV est étudié dans « Le temps des ', ' ».', ['rois']],
      quote: 'Thème 2 - Le temps des rois',
      explain: 'Henri IV est dans le thème « Le temps des rois ».',
    },
  ],
  paires3: [
    ['Henri IV', 'Roi lié à l’édit de Nantes'],
    ['Nantes', 'Ville de l’édit'],
    ['Édit', 'Texte officiel du roi'],
  ],
  paires5: [
    ['Henri IV', 'Roi lié à l’édit de Nantes'],
    ['Nantes', 'Ville de l’édit'],
    ['Édit', 'Texte officiel du roi'],
    ['Guerres de religion', 'Violences citées par le programme'],
    ['Louis XIV', 'Le roi Soleil'],
  ],
  libres: [
    {
      q: 'Henri IV est lié à l’édit de … (un nom de ville).',
      accepted: ['Nantes', 'nantes'],
      traps: [
        { text: 'Versailles', why: 'Versailles est le château de Louis XIV.' },
        { text: 'Paris', why: 'Le programme dit « Nantes ».' },
      ],
      quote: 'Henri IV et l’édit de Nantes',
      explain: 'L’édit de Nantes est lié à Henri IV.',
    },
    {
      q: 'Quel roi est lié à l’édit de Nantes ? (nom et numéro)',
      accepted: ['Henri IV', 'Henri 4', 'Henri quatre'],
      traps: [
        { text: 'Louis XIV', why: 'Louis XIV est le roi Soleil.' },
        { text: 'François Ier', why: 'François Ier est un protecteur des Arts et des Lettres.' },
      ],
      quote: 'Henri IV et l’édit de Nantes',
      explain: 'C’est Henri IV.',
    },
    {
      q: 'Les guerres de religion sont citées parmi les … (un mot).',
      accepted: ['violences', 'violence', 'les violences'],
      traps: [
        { text: 'arts', why: 'Les arts sont liés à François Ier, pas aux guerres.' },
        { text: 'fêtes', why: 'Ce ne sont pas des fêtes : ce sont des guerres.' },
      ],
      quote: Q_VIOLENCES,
      explain: 'Le programme cite les guerres de religion parmi les violences.',
    },
  ],
  docs: [
    {
      title: 'Un texte du roi',
      lines: [
        'Un élève lit une fiche : « L’édit de … est un texte du roi Henri IV. »',
        'Le nom de la ville est effacé.',
      ],
      qs: [
        {
          q: 'Quel mot complète la fiche ?',
          a: 'Nantes',
          wrong: [
            { label: 'Versailles', why: 'Versailles est le château de Louis XIV.' },
            { label: 'Marseille', why: 'Le programme dit « Nantes ».' },
          ],
          quote: 'Henri IV et l’édit de Nantes',
          explain: 'L’édit d’Henri IV est l’édit de Nantes.',
        },
      ],
    },
    {
      title: 'Une frise du temps des rois',
      lines: [
        'Une frise montre quatre rois : Louis IX, François Ier, Henri IV et Louis XIV.',
        'Sous l’un d’eux, il est écrit : « édit de Nantes ».',
      ],
      qs: [
        {
          q: 'Sous quel roi est écrit « édit de Nantes » ?',
          a: 'Henri IV',
          wrong: [
            { label: 'Louis IX', why: 'Louis IX est le « roi chrétien ».' },
            { label: 'Louis XIV', why: 'Louis XIV est le roi Soleil, à Versailles.' },
          ],
          quote: 'Henri IV et l’édit de Nantes',
          explain: 'L’édit de Nantes est lié à Henri IV.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : Louis XIV ———

const louisXiv: Notion = {
  id: 'hcm1-louis-xiv',
  title: 'Louis XIV, le roi Soleil à Versailles',
  hint: 'Relis le mémo : le roi Soleil, son château, et qui porte l’empire colonial.',
  memo: [
    'Louis XIV est surnommé le « roi **Soleil** » : il brille comme un astre et il règne à **Versailles**.',
    'Le programme dit aussi que le **pouvoir royal** porte la formation du premier **empire colonial** français.',
    'Dans cet empire, des Africains ont été déplacés et réduits en **esclavage** : on en parle avec sérieux et sobriété.',
  ],
  faits: [
    {
      q: 'Quel surnom porte Louis XIV ?',
      a: 'le roi Soleil',
      wrong: [
        { label: 'le roi chrétien', why: 'Le « roi chrétien » est Louis IX, au XIIIe siècle.' },
        { label: 'le roi Lune', why: 'Ce surnom n’existe pas dans le programme : Louis XIV est le roi Soleil.' },
        { label: 'le roi des Francs', why: 'Roi des Francs : c’est Clovis, puis Charlemagne.' },
      ],
      gap: ['Louis XIV est le roi ', ' à Versailles.', ['Soleil', 'soleil']],
      quote: 'Louis XIV, le roi Soleil à Versailles',
      explain: 'Louis XIV est le roi Soleil.',
    },
    {
      q: 'Dans quel lieu Louis XIV est-il le roi Soleil ?',
      a: 'à Versailles',
      wrong: [
        { label: 'à Nantes', why: 'Nantes est la ville de l’édit d’Henri IV.' },
        { label: 'à Rome', why: 'Rome est la capitale de l’empire romain : elle n’est pas liée à Louis XIV.' },
        { label: 'à Athènes', why: 'Athènes est au programme de 6e : c’est une cité grecque.' },
      ],
      gap: ['Louis XIV, le roi Soleil, règne à ', '.', ['Versailles']],
      quote: 'Louis XIV, le roi Soleil à Versailles',
      explain: 'Louis XIV est le roi Soleil à Versailles.',
    },
    {
      q: 'Qui porte la formation du premier empire colonial français ?',
      a: 'le pouvoir royal',
      wrong: [
        { label: 'les marchands seuls', why: 'Le programme dit que c’est le pouvoir royal qui le porte.' },
        { label: 'le peuple gaulois', why: 'Les Gaulois sont bien plus anciens : ils vivent avant les Romains.' },
        { label: 'les paysans seuls', why: 'Le programme dit que c’est le pouvoir royal qui le porte.' },
      ],
      gap: ['Le premier empire colonial est porté par le pouvoir ', '.', ['royal']],
      quote: Q_COLONIAL,
      explain: 'Le premier empire colonial français est porté par le pouvoir royal.',
    },
    {
      q: 'Quel roi du programme est le roi Soleil ?',
      a: 'Louis XIV',
      wrong: [
        { label: 'Louis IX', why: 'Louis IX est le « roi chrétien ».' },
        { label: 'François Ier', why: 'François Ier protège les Arts et les Lettres.' },
        { label: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes.' },
      ],
      gap: ['Le roi Soleil est le roi ', '.', ['Louis XIV', 'Louis 14', 'Louis quatorze']],
      quote: 'Louis XIV, le roi Soleil à Versailles',
      explain: 'Le roi Soleil est Louis XIV.',
    },
  ],
  paires3: [
    ['Louis XIV', 'Le roi Soleil'],
    ['Versailles', 'Lieu du roi Soleil'],
    ['Empire colonial', 'Territoires lointains sous l’autorité du royaume'],
  ],
  paires5: [
    ['Louis XIV', 'Le roi Soleil'],
    ['Versailles', 'Lieu du roi Soleil'],
    ['Empire colonial', 'Territoires lointains sous l’autorité du royaume'],
    ['Henri IV', 'Roi lié à l’édit de Nantes'],
    ['François Ier', 'Protecteur des Arts et des Lettres'],
  ],
  libres: [
    {
      q: 'Louis XIV est le roi … (un mot).',
      accepted: ['soleil', 'le roi soleil', 'roi soleil'],
      traps: [
        { text: 'chrétien', why: 'Le roi chrétien est Louis IX.' },
        { text: 'lune', why: 'Ce surnom n’existe pas : c’est le roi Soleil.' },
      ],
      quote: 'Louis XIV, le roi Soleil à Versailles',
      explain: 'Louis XIV est le roi Soleil.',
    },
    {
      q: 'Louis XIV, le roi Soleil, règne à … (un nom de lieu).',
      accepted: ['Versailles', 'versailles'],
      traps: [
        { text: 'Nantes', why: 'Nantes est la ville de l’édit d’Henri IV.' },
        { text: 'Rome', why: 'Rome est la capitale de l’empire romain.' },
      ],
      quote: 'Louis XIV, le roi Soleil à Versailles',
      explain: 'Louis XIV règne à Versailles.',
    },
    {
      q: 'Le premier empire colonial français est porté par le pouvoir … (un mot).',
      accepted: ['royal', 'le pouvoir royal'],
      traps: [
        { text: 'gaulois', why: 'Les Gaulois sont bien plus anciens.' },
        { text: 'romain', why: 'Le pouvoir romain est celui de l’Antiquité.' },
      ],
      quote: Q_COLONIAL,
      explain: 'Le pouvoir royal porte la formation du premier empire colonial français.',
    },
  ],
  docs: [
    {
      title: 'Un grand château',
      lines: [
        'Un roi s’installe dans un très grand château.',
        'On l’appelle le roi Soleil.',
        'Ce château se trouve à Versailles.',
      ],
      qs: [
        {
          q: 'De quel roi parle ce texte ?',
          a: 'Louis XIV',
          wrong: [
            { label: 'Louis IX', why: 'Louis IX est le « roi chrétien ».' },
            { label: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes.' },
          ],
          quote: 'Louis XIV, le roi Soleil à Versailles',
          explain: 'Le roi Soleil à Versailles est Louis XIV.',
        },
      ],
    },
    {
      title: 'Les colonies',
      lines: [
        'Un livre explique que le premier empire colonial français se forme au temps des rois.',
        'Ce livre dit que le pouvoir du roi le porte.',
      ],
      qs: [
        {
          q: 'Qui porte la formation de cet empire colonial ?',
          a: 'le pouvoir royal',
          wrong: [
            { label: 'les Romains', why: 'Les Romains vivent dans l’Antiquité, bien avant.' },
            { label: 'les Gaulois', why: 'Les Gaulois vivent bien avant le temps des rois.' },
          ],
          quote: Q_COLONIAL,
          explain: 'Le pouvoir royal porte cette formation.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [louisIx, francoisIer, henriIv, louisXiv];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE));
