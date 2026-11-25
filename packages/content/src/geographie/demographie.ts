import type { Skill } from '../types.ts';
import { notion, PROGRAMME_C4, type Notion } from './kit.ts';

/**
 * Cinquième, thème 1 « La question démographique et l’inégal développement » (lot ge-5e-01). Chaque fait cite
 * une source du registre avec sa citation exacte : programme du cycle 4 et glossaire de Géoconfluences
 * (ENS de Lyon, DGESCO). Les textes à lire du niveau 5 sont écrits pour l’exercice (pays fictifs A, B, L, M, N, X, Y).
 */

const C4 = PROGRAMME_C4;
const TRANSITION = 'geoconfluences-transition-demographique';
const SOLDE = 'geoconfluences-solde-naturel';
const FECONDITE = 'geoconfluences-fecondite';
const VIEILLISSEMENT = 'geoconfluences-vieillissement';
const ESPERANCE = 'geoconfluences-esperance-de-vie';
const DEVELOPPEMENT = 'geoconfluences-developpement';
const DEV_HUMAIN = 'geoconfluences-developpement-humain';
const IDH = 'geoconfluences-idh';
const EMERGENCE = 'geoconfluences-emergence';
const PMA = 'geoconfluences-pma';
const MORTALITE = 'geoconfluences-mortalite';
const DURABLE = 'geoconfluences-developpement-durable';
const CHINE_2015 = 'geoconfluences-veille-enfant-unique';
const INEGALITES = 'geoconfluences-inegalites';
const PAUVRETE = 'geoconfluences-pauvrete-richesse';

// Programme du cycle 4, géographie, classe de 5e, thème 1.
const P_CROISSANCE =
  'la problématique posée par la croissance démographique, notamment dans les pays en développement et en émergence, où elle rend difficile le développement durable et équitable et l’accès de tous aux biens et aux services de base';
const P_VIEILLISSEMENT = 'Mais on montrera aussi les points communs, comme, par exemple, celui du vieillissement';
const P_ODD_DEMO = 'ODD mobilisés : lutte contre la faim (ODD2) ; accès à la santé (ODD3)';
const P_TOUS_PAYS =
  'les différents niveaux de richesse et de pauvreté et donc les inégalités sociales sont observables dans tous les pays';
const P_ODD_RICHESSE =
  'richesse et pauvreté : éradication de la pauvreté (ODD1) ; égalité entre les sexes (ODD5) ; accès à une éducation de qualité (ODD4) ; réduction des inégalités (ODD 10)';

// Glossaire de Géoconfluences.
const G_TRANSITION =
  "La transition démographique est le passage d'une situation dite d'ancien régime démographique, caractérisée par une natalité et mortalité élevées, à une situation dite de nouveau régime démographique dans lequel la natalité et la mortalité sont basses";
const G_DECALAGE =
  'la natalité baisse avec un décalage temporel par rapport à la mortalité, entraînant pendant un temps un solde naturel fortement positif et une croissance démographique rapide';
const G_SOLDE =
  'Le solde naturel, ou parfois le bilan naturel, désigne la différence entre le taux brut de natalité et le taux brut de mortalité pour une population étudiée';
const G_SOLDE_NEGATIF = 'dans certains pays les décès excèdent les naissances (bilan naturel négatif)';
const G_ICF = "Cet indice s'exprime en nombre d'enfants par femme";
const G_RENOUVELLEMENT =
  'Le chiffre de 2,05 enfants par femme constitue un repère communément admis pour indiquer le renouvellement naturel des générations';
const G_ENFANT_UNIQUE =
  "À partir des années 1980, une politique démographique volontariste et brutale a été adoptée : celle de « l'enfant unique »";
const G_DEFI_CHINE =
  'le grand défi démographique de la Chine ne sera pas, à moyen terme, celui de sa trop grande vitalité démographique mais plutôt celui de la dégradation du ratio actifs/inactifs';
const G_ESPERANCE =
  "Elle correspond au nombre moyen d'années que pourrait vivre un nouveau-né qui connaîtrait tout au long de sa vie les risques de décès identifiés au moment de sa naissance";
const G_ESPERANCE_ECART =
  'En 2022, l’espérance de vie n’était que de 63 ans pour les pays à faibles revenus contre 80 ans pour les pays à hauts revenus';
const G_ESPERANCE_DEV =
  "En corrélation positive avec le niveau de développement, l'espérance de vie est un bon indicateur de santé";
const G_RATTRAPAGE =
  'Contrairement à une idée reçue, c’est dans les pays les moins développés qu’elle progresse le plus vite';
const G_DEV =
  'Le concept de développement désigne l’ensemble des transformations techniques, sociales, territoriales, démographiques et culturelles accompagnant la croissance de la production matérielle ou l’amélioration des conditions d’existence des humains';
const G_DEV_ELARGI =
  "le concept de développement s'est élargi pour inclure différentes dimensions constitutives du bien-être, voire du bonheur : l'état global de santé des populations, les niveaux d'instruction, d'une manière générale, les conditions de vie";
const G_DEV_PARTAGE =
  'il fallait que les fruits de la croissance profitent au plus grand nombre et sur une longue durée';
const G_DEV_BINAIRE =
  'Cette division binaire du monde est encore aujourd’hui une grille de lecture fréquente, mais de plus en plus contestée dans le contexte de l’émergence d’un certain nombre de pays';
const G_EMERGENCE =
  "L'émergence caractérise le processus par lequel un État s'intègre à l'économie globalisée et au capitalisme mondial grâce à une croissance économique (c'est-à-dire une augmentation du produit intérieur brut) forte pendant plusieurs années";
const G_BRICS =
  'Les pays émergents les plus connus sont certainement les BRICS (Brésil Russie Inde Chine et Afrique du Sud)';
const G_SANS_DEV = "Pour grossir le trait, l'émergence pourrait être la croissance sans le développement";
const G_MORTALITE_AFRIQUE =
  'L’Afrique subsaharienne affiche les taux de mortalité infantile les plus élevés au monde : un enfant sur 13 y meurt avant ses 5 ans';
const G_DURABLE =
  'mode de développement qui répond aux besoins du présent sans compromettre la capacité des générations futures de répondre aux leurs';
const G_FIN_ENFANT_UNIQUE = 'En 2015, le gouvernement chinois a annoncé la fin de la politique de l’enfant unique';
const G_PMA_SIGLE =
  'Les PMA, ou Least Developed Countries en anglais, sont le dernier étage de la fusée des pays en développement';
const G_IDH_COMPOSITE = 'L’indice de développement humain (IDH) est un indice composite';
const G_IDH_PNUD = 'adopté par le programme des Nations Unies pour le développement (PNUD) à partir de 1990';
const G_IDH_MESURE = 'est une mesure sommaire du niveau moyen atteint dans des dimensions clés du développement humain';
const G_IDH_BUT =
  "L’indice a pour but de dépasser une simple mesure du développement par les richesses, qui est insuffisante si les richesses ne s'accompagnent pas d'une amélioration du système de santé ou de l'éducation";
const G_IDH_DIMENSIONS =
  'vivre une vie longue et en bonne santé, acquérir des connaissances et jouir d’un niveau de vie décent';
const G_IDH_SANTE = 'La dimension de la santé est évaluée selon l’espérance de vie à la naissance';
const G_IDH_EDUCATION =
  'La dimension de l’éducation est mesurée au moyen du nombre d’années de scolarisation pour les adultes âgés de 25 ans et plus';
const G_IDH_NIVEAU = 'La dimension du niveau de vie est mesurée par le revenu national brut par habitant';
const G_DH_CALCUL =
  'Calculé chaque année depuis 1990 par le Programme des Nations Unies pour le développement (PNUD), il permet des comparaisons internationales dans la durée';
const G_DH_AIDES =
  "il permet des comparaisons internationales dans la durée et des classifications dont peuvent dépendre l'attribution de certaines aides";
const G_DH_INSUFFISANT = "l'IDH peut paraître insuffisant et réducteur aux yeux de certains";
const G_INEGALITE = 'Le terme d’inégalité désigne, de façon assez générale, le caractère de ce qui n’est pas égal';
const G_INEG_ECHELLES = 'Elles ont toutes une dimension spatiale, allant de l’échelle mondiale à l’échelle locale';
const G_INEG_EMERGENCE =
  'Dans les situations d’émergence économique, on observe souvent un accroissement des inégalités, au moins dans une première phase';
const G_PR_RELATIVES = 'Elles sont deux notions relatives, et elles sont indissociables l’une de l’autre';
const G_PR_TAUX =
  'L’un des instruments de mesure de la pauvreté, le taux de pauvreté, est ainsi construit à partir d’un seuil calculé selon la médiane des revenus';
const G_PR_SEUIL = 'en France, le seuil de pauvreté est, pour l’INSEE, un revenu inférieur à 60 % du revenu médian';
const G_PR_ABSOLUE =
  'On peut toutefois définir une pauvreté absolue qui serait une incapacité à subvenir à ses besoins essentiels';
const G_PR_PRECARITE =
  'La précarité est une situation de manque et de fragilité sociale qui peut déboucher sur la pauvreté';
const G_PR_ECHELLE =
  'on trouvera des inégalités de richesse à l’intérieur d’un quartier pauvre, ou des régions pauvres dans un pays riche';

// ——— Notion 1 : la croissance démographique et ses effets ———

const croissance: Notion = {
  classe: '5e',
  id: 'g5-croissance-demographique',
  title: 'La croissance démographique et ses effets',
  hint: 'Compare les naissances et les décès : leur différence, et le moment où chacun baisse, expliquent la croissance.',
  memo: [
    'La **croissance démographique** dépend d’abord du **solde naturel** : naissances moins décès. Exemple : 30 naissances et 10 décès pour 1 000 habitants donnent un solde de + 20 pour 1 000.',
    'La **transition démographique** explique les croissances rapides : la **mortalité** baisse d’abord, la **natalité** baisse plus tard.',
    'Forte dans les pays en développement, la croissance y rend difficile l’accès de tous aux services de base. Le **vieillissement** touche l’Europe, les États-Unis et, peu à peu, tous les pays, comme la Chine.',
  ],
  faits: [
    {
      q: 'Comment calcule-t-on le solde naturel d’une population ?',
      a: 'le taux de natalité moins le taux de mortalité',
      wrong: [
        {
          label: 'le taux de natalité plus le taux de mortalité',
          why: 'Le solde est une différence : on retire les décès aux naissances, on ne les ajoute pas.',
        },
        {
          label: 'le nombre d’habitants divisé par la superficie',
          why: 'C’est la densité de population, pas le solde naturel.',
        },
        {
          label: 'les arrivées de migrants moins leurs départs',
          why: 'C’est le solde migratoire : le solde naturel ne compte que les naissances et les décès.',
        },
      ],
      gap: ['Le solde naturel est la différence entre le taux de natalité et le taux de ', '.', ['mortalité']],
      choix: ['mortalité', 'fécondité', 'densité'],
      quote: G_SOLDE,
      explain: 'Naissances moins décès : si les naissances l’emportent, la population augmente naturellement.',
      src: SOLDE,
    },
    {
      q: 'Pendant la transition démographique, pourquoi la population augmente-t-elle rapidement ?',
      a: 'la mortalité baisse avant la natalité',
      wrong: [
        {
          label: 'la mortalité augmente fortement',
          why: 'C’est l’inverse : la transition commence par une baisse de la mortalité.',
        },
        {
          label: 'les migrants arrivent en masse',
          why: 'La transition démographique décrit les naissances et les décès, pas les migrations.',
        },
        {
          label: 'la natalité baisse avant la mortalité',
          why: 'Dans le schéma, c’est la natalité qui baisse avec retard ; sinon la croissance serait faible.',
        },
      ],
      gap: [
        'Pendant la transition, la natalité baisse avec un décalage par rapport à la ',
        ', d’où une croissance rapide.',
        ['mortalité'],
      ],
      choix: ['mortalité', 'densité', 'superficie'],
      quote: G_DECALAGE,
      explain:
        'Tant que les décès ont fortement baissé et que les naissances restent élevées, le solde naturel est très positif : la population croît vite.',
      src: TRANSITION,
    },
    {
      q: 'À la fin de la transition démographique, comment sont la natalité et la mortalité ?',
      a: 'toutes les deux basses',
      wrong: [
        { label: 'toutes les deux élevées', why: 'C’est la situation du début : l’ancien régime démographique.' },
        {
          label: 'la natalité élevée et la mortalité basse',
          why: 'C’est la phase intermédiaire, celle de la croissance rapide.',
        },
        {
          label: 'la natalité basse et la mortalité élevée',
          why: 'Le schéma de la transition ne passe pas par cette situation : la mortalité baisse la première.',
        },
      ],
      gap: ['Dans le nouveau régime démographique, la natalité et la mortalité sont ', '.', ['basses']],
      choix: ['basses', 'élevées', 'nulles'],
      quote: G_TRANSITION,
      explain: 'On passe de taux élevés (ancien régime) à des taux bas (nouveau régime).',
      src: TRANSITION,
    },
    {
      q: 'Quel indicateur mesure le nombre moyen d’enfants par femme ?',
      a: 'l’indice de fécondité',
      wrong: [
        { label: 'l’espérance de vie', why: 'L’espérance de vie se compte en années de vie, pas en enfants.' },
        {
          label: 'le taux de mortalité',
          why: 'Le taux de mortalité compte les décès pour 1 000 habitants.',
        },
        { label: 'le solde naturel', why: 'Le solde naturel est une différence entre naissances et décès.' },
      ],
      gap: ['L’indice de fécondité s’exprime en nombre d’enfants par ', '.', ['femme']],
      choix: ['femme', 'habitant', 'famille'],
      quote: G_ICF,
      explain: 'L’indice de fécondité se lit en enfants par femme : 2,05 assure le renouvellement des générations.',
      src: FECONDITE,
    },
    {
      q: 'Quel phénomène démographique est un point commun entre l’Europe, les États-Unis et des pays émergents comme la Chine ?',
      a: 'le vieillissement de la population',
      wrong: [
        {
          label: 'une population de plus en plus jeune',
          why: 'C’est l’inverse : la part des personnes âgées augmente.',
        },
        {
          label: 'une hausse générale de la mortalité',
          why: 'La mortalité a baissé : c’est même l’une des causes du vieillissement.',
        },
        {
          label: 'une natalité très élevée',
          why: 'En Europe et aux États-Unis, la natalité est basse ; c’est ce qui fait vieillir la population.',
        },
      ],
      gap: [
        'L’Europe, les États-Unis et la Chine ont un point commun : le ',
        ' de leur population.',
        ['vieillissement'],
      ],
      choix: ['vieillissement', 'rajeunissement', 'surpeuplement'],
      quote: P_VIEILLISSEMENT,
      explain: 'La question démographique se pose différemment selon les pays, mais le vieillissement les rapproche.',
      src: C4,
    },
    {
      q: 'Dans quels pays la croissance démographique rend-elle surtout difficile l’accès de tous aux services de base ?',
      a: 'dans les pays en développement et en émergence',
      wrong: [
        {
          label: 'seulement dans les pays d’Europe',
          why: 'En Europe, la croissance démographique est faible : la question s’y pose autrement.',
        },
        {
          label: 'dans aucun pays',
          why: 'Cette difficulté existe bien, surtout dans les pays en développement.',
        },
        {
          label: 'seulement aux États-Unis',
          why: 'Les États-Unis sont cités comme un cas où la question se pose de manière très différente.',
        },
      ],
      gap: ['La croissance démographique rend difficile l’accès de tous aux biens et aux services de ', '.', ['base']],
      choix: ['base', 'luxe', 'loisirs'],
      quote: P_CROISSANCE,
      explain:
        'Quand la population croît vite, il faut sans cesse plus d’écoles, de soins, de logements et de nourriture.',
      src: C4,
    },
  ],
  paires3: [
    ['Natalité', 'Naissances pour 1 000 habitants en un an'],
    ['Mortalité', 'Décès pour 1 000 habitants en un an'],
    ['Solde naturel', 'Différence entre natalité et mortalité'],
  ],
  paires5: [
    ['Natalité', 'Naissances pour 1 000 habitants en un an'],
    ['Mortalité', 'Décès pour 1 000 habitants en un an'],
    ['Solde naturel', 'Différence entre natalité et mortalité'],
    ['Indice de fécondité', 'Nombre moyen d’enfants par femme'],
    ['Vieillissement', 'Hausse de la part des personnes âgées'],
  ],
  libres: [
    {
      q: 'Quel nom donne-t-on au passage d’une natalité et d’une mortalité élevées à une natalité et une mortalité basses ?',
      accepted: [
        'transition démographique',
        'la transition démographique',
        'transition demographique',
        'la transition demographique',
      ],
      traps: [
        { text: 'solde naturel', why: 'Le solde naturel est une différence entre deux taux, pas un passage.' },
        {
          text: 'vieillissement',
          why: 'Le vieillissement est une conséquence de la transition, pas la transition elle-même.',
        },
      ],
      quote: G_TRANSITION,
      explain: 'Ce passage d’un régime démographique à un autre s’appelle la transition démographique.',
      src: TRANSITION,
    },
    {
      q: 'Un pays compte 12 naissances et 15 décès pour 1 000 habitants en un an. Son solde naturel est-il positif ou négatif ?',
      accepted: ['négatif', 'negatif', 'il est négatif', 'solde négatif', 'solde naturel négatif'],
      traps: [
        { text: 'positif', why: '12 − 15 = − 3 : il y a plus de décès que de naissances.' },
        { text: 'nul', why: 'Il faudrait autant de naissances que de décès ; ici 12 − 15 = − 3.' },
      ],
      quote: G_SOLDE_NEGATIF,
      explain: '12 − 15 = − 3 pour 1 000 : quand les décès dépassent les naissances, le solde naturel est négatif.',
      src: SOLDE,
    },
    {
      q: 'Quel nombre d’enfants par femme sert de repère pour le renouvellement des générations ?',
      accepted: [
        '2,05',
        '2.05',
        '2,05 enfants par femme',
        '2,05 enfants',
        '2,1',
        '2.1',
        '2,1 enfants',
        '2,1 enfants par femme',
      ],
      traps: [
        { text: '1', why: 'Avec un enfant par femme, chaque génération serait deux fois moins nombreuse.' },
        { text: '10', why: 'C’est beaucoup trop : le repère est d’un peu plus de deux enfants par femme.' },
      ],
      quote: G_RENOUVELLEMENT,
      explain:
        'Environ 2,1 (2,05 exactement) : un peu plus de deux enfants par femme, pour remplacer les deux parents.',
      src: FECONDITE,
    },
    {
      q: 'Un pays a une natalité de 35 pour 1 000 et une mortalité de 10 pour 1 000. Quel est son solde naturel, pour 1 000 habitants ?',
      accepted: ['25', '+25', '+ 25', '25 pour 1 000', '+25 pour 1 000', '+ 25 pour 1 000'],
      traps: [
        { text: '45', why: 'On a additionné : le solde est une différence, 35 − 10.' },
        { text: '-25', why: 'Le calcul est inversé : naissances moins décès, 35 − 10 = + 25.' },
      ],
      quote: G_SOLDE,
      explain: '35 − 10 = + 25 pour 1 000 : le solde naturel est positif, la population augmente.',
      src: SOLDE,
    },
  ],
  docs: [
    {
      title: 'Deux pays comparés (données fictives)',
      lines: [
        'Pays A : natalité 38 pour 1 000, mortalité 8 pour 1 000, 4,5 enfants par femme.',
        'Pays B : natalité 9 pour 1 000, mortalité 11 pour 1 000, 1,5 enfant par femme.',
        'Dans le pays A, la moitié des habitants ont moins de 20 ans.',
        'Dans le pays B, la part des plus de 65 ans augmente chaque année.',
      ],
      qs: [
        {
          q: 'Quel pays a un solde naturel négatif ?',
          a: 'le pays B',
          wrong: [
            { label: 'le pays A', why: 'Pays A : 38 − 8 = + 30 pour 1 000, un solde très positif.' },
            { label: 'aucun des deux', why: 'Pays B : 9 − 11 = − 2 pour 1 000, plus de décès que de naissances.' },
          ],
          quote: G_SOLDE_NEGATIF,
          explain: 'Pays B : 9 naissances pour 11 décès, le solde naturel est de − 2 pour 1 000.',
          src: SOLDE,
        },
        {
          q: 'Quel défi le pays A doit-il surtout relever ?',
          a: 'donner à une population en forte croissance l’accès aux services de base',
          wrong: [
            {
              label: 'remplacer une population de plus en plus âgée',
              why: 'C’est le défi du pays B (ligne 4) ; le pays A est très jeune (ligne 3).',
            },
            {
              label: 'freiner une baisse du nombre d’habitants',
              why: 'Pays A : solde de + 30 pour 1 000, sa population augmente vite.',
            },
          ],
          quote: P_CROISSANCE,
          explain: 'Une population jeune qui croît vite demande toujours plus d’écoles, de soins et d’emplois.',
          src: C4,
        },
      ],
    },
    {
      title: 'Une politique démographique en Chine',
      lines: [
        'Des années 1950 aux années 1970, la Chine connaît une très forte natalité.',
        'À partir des années 1980, l’État impose la politique de « l’enfant unique ».',
        'La natalité baisse fortement en une génération.',
        'En 2015, le gouvernement annonce la fin de cette politique ; les très nombreuses personnes nées entre 1950 et 1970 arrivent à l’âge de la retraite.',
      ],
      qs: [
        {
          q: 'D’après la ligne 2, qu’est-ce qui a fait baisser la natalité ?',
          a: 'une politique démographique : l’enfant unique',
          wrong: [
            { label: 'une hausse de la mortalité', why: 'La ligne 2 parle d’une décision de l’État, pas des décès.' },
            { label: 'le départ de nombreux migrants', why: 'Le texte ne parle d’aucune migration.' },
          ],
          quote: G_ENFANT_UNIQUE,
          explain: 'L’État a limité les naissances : c’est une politique démographique.',
          src: VIEILLISSEMENT,
        },
        {
          q: 'D’après la ligne 4, quel défi démographique la Chine doit-elle relever ?',
          a: 'le vieillissement : moins d’actifs pour davantage de retraités',
          wrong: [
            {
              label: 'une natalité trop forte',
              why: 'Ligne 3 : la natalité a fortement baissé.',
            },
            {
              label: 'une population trop jeune',
              why: 'Ligne 4 : ce sont les retraités qui deviennent très nombreux.',
            },
          ],
          quote: G_DEFI_CHINE,
          explain:
            'Les nombreuses générations nées avant 1980 vieillissent : le rapport entre actifs et retraités se dégrade.',
          src: VIEILLISSEMENT,
        },
        {
          q: 'D’après la ligne 4, la politique de l’enfant unique s’applique-t-elle toujours ?',
          a: 'non : sa fin a été annoncée en 2015',
          wrong: [
            { label: 'oui, elle s’applique toujours', why: 'Ligne 4 : le gouvernement en a annoncé la fin en 2015.' },
            { label: 'elle n’a jamais existé', why: 'Ligne 2 : elle a été imposée à partir des années 1980.' },
          ],
          quote: G_FIN_ENFANT_UNIQUE,
          explain: 'Après plus de trente ans, la Chine a mis fin à l’enfant unique.',
          src: CHINE_2015,
        },
      ],
    },
    {
      title: 'Un pays d’Afrique en forte croissance (cas fictif)',
      lines: [
        'La mortalité a fortement baissé grâce aux vaccins et à l’accès aux soins.',
        'La natalité reste élevée, mais elle commence à diminuer.',
        'La population augmente donc rapidement.',
        'L’État doit construire des centres de santé et des écoles pour une population jeune et nombreuse.',
      ],
      qs: [
        {
          q: 'À quelle phase de la transition démographique se trouve ce pays ?',
          a: 'la phase intermédiaire : la mortalité a fortement baissé, la natalité reste encore élevée',
          wrong: [
            {
              label: 'l’ancien régime : natalité et mortalité élevées',
              why: 'Ligne 1 : la mortalité a déjà fortement baissé.',
            },
            {
              label: 'le nouveau régime : natalité et mortalité basses',
              why: 'Ligne 2 : la natalité reste élevée.',
            },
          ],
          quote: G_DECALAGE,
          explain:
            'La natalité commence à peine à baisser, avec retard sur la mortalité : c’est la phase de croissance rapide.',
          src: TRANSITION,
        },
        {
          q: 'Quel objectif de développement durable de l’ONU est mobilisé par les centres de santé de la ligne 4 ?',
          a: 'l’accès à la santé (ODD 3)',
          wrong: [
            {
              label: 'la lutte contre le changement climatique (ODD 13)',
              why: 'La ligne 4 parle de soins et d’écoles, pas du climat.',
            },
            {
              label: 'la protection des océans (ODD 14)',
              why: 'Le texte ne parle pas de la mer.',
            },
          ],
          quote: P_ODD_DEMO,
          explain:
            'Le programme associe la croissance démographique à la lutte contre la faim et à l’accès à la santé.',
          src: C4,
        },
      ],
    },
  ],
};

// ——— Notion 2 : l’inégal développement ———

const developpement: Notion = {
  classe: '5e',
  id: 'g5-inegal-developpement',
  title: 'L’inégal développement du monde',
  hint: 'Le développement ne se résume pas à la richesse : pense à la santé, à l’instruction, aux conditions de vie.',
  memo: [
    'Le **développement** ne se résume pas à produire plus de richesses : il inclut la santé, l’instruction et les conditions de vie de tous.',
    'Le monde est inégalement développé : pays développés, **pays émergents** à forte croissance (Chine, Inde, Brésil) et **pays les moins avancés** (PMA), les plus pauvres selon l’ONU, situés pour la plupart en Afrique.',
    'L’**espérance de vie** le montre : en 2022, 63 ans dans les pays à faibles revenus contre 80 ans dans les pays à hauts revenus. Le **développement durable** répond aux besoins d’aujourd’hui sans compromettre ceux des générations futures ; on le veut aussi **équitable** : ses fruits doivent profiter au plus grand nombre.',
  ],
  faits: [
    {
      q: 'Que désigne le développement en géographie ?',
      a: 'les transformations qui accompagnent la croissance et l’amélioration des conditions de vie',
      wrong: [
        {
          label: 'la hausse du nombre d’habitants',
          why: 'C’est la croissance démographique, pas le développement.',
        },
        {
          label: 'la construction de nouvelles routes',
          why: 'Une route peut y contribuer, mais le développement concerne toute la société.',
        },
        {
          label: 'la seule hausse de la production',
          why: 'La production compte, mais le développement inclut aussi la santé, l’instruction, les conditions de vie.',
        },
      ],
      gap: [
        'Le développement accompagne la croissance de la production ou l’amélioration des conditions d’',
        ' des humains.',
        ['existence'],
      ],
      choix: ['existence', 'échange', 'altitude'],
      quote: G_DEV,
      explain: 'Le développement est un progrès économique et social : on vit mieux, pas seulement on produit plus.',
      src: DEVELOPPEMENT,
    },
    {
      q: 'Pourquoi la seule croissance des richesses ne suffit-elle pas à mesurer le développement ?',
      a: 'il faut aussi regarder la santé, l’instruction et les conditions de vie',
      wrong: [
        {
          label: 'parce que les richesses ne se mesurent pas',
          why: 'On mesure très bien les richesses (le PIB, par exemple) ; elles ne suffisent simplement pas.',
        },
        {
          label: 'parce que seul le nombre d’habitants compte',
          why: 'Le nombre d’habitants ne dit rien des conditions de vie.',
        },
        {
          label: 'parce que le développement ne concerne que le climat',
          why: 'Le développement concerne les sociétés : santé, instruction, conditions de vie.',
        },
      ],
      gap: ['Le développement inclut l’état de santé des populations et les niveaux d’', '.', ['instruction']],
      choix: ['instruction', 'altitude', 'industrie'],
      quote: G_DEV_ELARGI,
      explain: 'Un pays riche dont les habitants sont mal soignés ou peu instruits n’est pas pleinement développé.',
      src: DEVELOPPEMENT,
    },
    {
      q: 'Qu’est-ce qu’un pays émergent ?',
      a: 'un pays à forte croissance économique depuis plusieurs années, qui s’intègre à l’économie mondiale',
      wrong: [
        {
          label: 'un pays qui vient d’apparaître sur la carte',
          why: 'C’est le sens courant d’« émerger » ; en géographie, le mot désigne une croissance forte.',
        },
        {
          label: 'un pays sans aucune inégalité',
          why: 'Au contraire, l’émergence s’accompagne souvent d’un creusement des inégalités.',
        },
        {
          label: 'l’un des pays les plus pauvres du monde',
          why: 'Les plus pauvres sont les pays les moins avancés (PMA).',
        },
      ],
      gap: ['L’émergence repose sur une croissance économique forte pendant plusieurs ', '.', ['années']],
      choix: ['années', 'jours', 'semaines'],
      quote: G_EMERGENCE,
      explain: 'Chine, Inde, Brésil : leur production augmente vite depuis des années.',
      src: EMERGENCE,
    },
    {
      q: 'Dans quelle région du monde la mortalité infantile est-elle la plus élevée ?',
      a: 'l’Afrique subsaharienne',
      wrong: [
        { label: 'l’Europe', why: 'Les taux les plus élevés au monde se trouvent en Afrique subsaharienne.' },
        { label: 'l’Amérique du Nord', why: 'Les taux les plus élevés au monde se trouvent en Afrique subsaharienne.' },
        { label: 'l’Asie de l’Est', why: 'Les taux les plus élevés au monde se trouvent en Afrique subsaharienne.' },
      ],
      gap: ['L’Afrique subsaharienne affiche les taux de mortalité ', ' les plus élevés au monde.', ['infantile']],
      choix: ['infantile', 'industrielle', 'urbaine'],
      quote: G_MORTALITE_AFRIQUE,
      explain:
        'En 2019, selon l’ONU, un enfant sur 13 y mourait avant ses 5 ans : la santé des enfants montre l’inégal développement du monde.',
      src: MORTALITE,
    },
    {
      q: 'En 2022, quelle était l’espérance de vie dans les pays à faibles revenus et dans les pays à hauts revenus ?',
      a: '63 ans contre 80 ans',
      wrong: [
        { label: '80 ans contre 63 ans', why: 'C’est inversé : on vit plus longtemps dans les pays à hauts revenus.' },
        { label: '72 ans dans les deux cas', why: '72 ans est la moyenne mondiale ; l’écart entre pays demeure.' },
        { label: '40 ans contre 100 ans', why: 'Ces chiffres exagèrent l’écart : il est de 17 ans.' },
      ],
      gap: [
        'En 2022, l’espérance de vie était de 63 ans dans les pays à faibles revenus contre ',
        ' ans dans les pays à hauts revenus.',
        ['80'],
      ],
      choix: ['80', '65', '100'],
      quote: G_ESPERANCE_ECART,
      explain: 'Un écart de 17 ans : l’espérance de vie traduit l’inégal développement.',
      src: ESPERANCE,
    },
    {
      q: 'Qu’est-ce qu’un développement durable ?',
      a: 'un développement qui répond aux besoins d’aujourd’hui sans compromettre ceux des générations futures',
      wrong: [
        {
          label: 'un développement le plus rapide possible',
          why: 'Durable ne veut pas dire rapide : il pense à l’avenir.',
        },
        {
          label: 'un développement réservé aux pays riches',
          why: 'Il concerne tous les pays, et l’on veut aussi qu’il soit équitable.',
        },
        {
          label: 'un développement qui renonce à toute production',
          why: 'Il s’agit de répondre aux besoins, donc de produire autrement, pas de ne plus produire.',
        },
      ],
      gap: [
        'Un développement durable répond aux besoins du présent sans compromettre ceux des générations ',
        '.',
        ['futures'],
      ],
      choix: ['futures', 'passées', 'voisines'],
      quote: G_DURABLE,
      explain:
        'Durable : il pense aussi à ceux qui vivront après nous. On le veut en plus équitable : ses fruits doivent profiter au plus grand nombre.',
      src: DURABLE,
    },
  ],
  paires3: [
    ['Pays émergent', 'Forte croissance et intégration à l’économie mondiale'],
    ['Pays les moins avancés (PMA)', 'Pays les plus pauvres selon l’ONU'],
    ['Espérance de vie', 'Années que peut espérer vivre un nouveau-né'],
  ],
  paires5: [
    ['Pays émergent', 'Forte croissance et intégration à l’économie mondiale'],
    ['Pays les moins avancés (PMA)', 'Pays les plus pauvres selon l’ONU'],
    ['Espérance de vie', 'Années que peut espérer vivre un nouveau-né'],
    ['Développement', 'Amélioration des conditions de vie des humains'],
    ['Croissance économique', 'Augmentation de la production de richesses'],
  ],
  libres: [
    {
      q: 'Quel indicateur donne le nombre moyen d’années que pourrait vivre un nouveau-né ?',
      accepted: [
        'espérance de vie',
        'l’espérance de vie',
        'esperance de vie',
        'espérance de vie à la naissance',
        'l’espérance de vie à la naissance',
      ],
      traps: [
        { text: 'mortalité', why: 'La mortalité compte les décès pour 1 000 habitants, pas les années de vie.' },
        {
          text: 'âge moyen',
          why: 'L’âge moyen décrit la population actuelle ; il ne dit pas combien d’années vivra un nouveau-né.',
        },
      ],
      quote: G_ESPERANCE,
      explain: 'C’est l’espérance de vie à la naissance, un bon indicateur de santé et de développement.',
      src: ESPERANCE,
    },
    {
      q: 'Quel sigle désigne les pays les plus pauvres de la liste de l’ONU ?',
      accepted: ['PMA', 'les PMA', 'pays les moins avancés', 'les pays les moins avancés'],
      traps: [
        { text: 'BRICS', why: 'Les BRICS sont les grands pays émergents, pas les plus pauvres.' },
        { text: 'PNUD', why: 'Le PNUD est un programme de l’ONU qui calcule l’IDH.' },
      ],
      quote: G_PMA_SIGLE,
      explain: 'PMA : pays les moins avancés, le groupe le plus pauvre des pays en développement.',
      src: PMA,
    },
    {
      q: 'Quel sigle désigne les grands émergents : Brésil, Russie, Inde, Chine et Afrique du Sud ?',
      accepted: ['BRICS', 'les BRICS'],
      traps: [
        { text: 'PMA', why: 'Les PMA sont les pays les plus pauvres, pas les grands émergents.' },
        { text: 'UE', why: 'L’Union européenne réunit des pays d’Europe.' },
      ],
      quote: G_BRICS,
      explain: 'Les initiales des cinq pays forment le sigle BRICS.',
      src: EMERGENCE,
    },
    {
      q: 'Un pays produit chaque année plus de richesses, mais les plus pauvres n’en profitent pas. Selon Géoconfluences, est-ce de la croissance ou du développement ?',
      accepted: [
        'croissance',
        'la croissance',
        'de la croissance',
        'la croissance sans le développement',
        'croissance économique',
        'la croissance économique',
        'de la croissance économique',
        'c’est de la croissance',
        "c'est de la croissance",
      ],
      traps: [
        {
          text: 'développement',
          why: 'Le développement suppose que les fruits de la croissance profitent au plus grand nombre.',
        },
        { text: 'les deux', why: 'Sans amélioration pour le plus grand nombre, il n’y a pas développement.' },
      ],
      quote: G_SANS_DEV,
      explain: 'Produire plus sans améliorer la vie de tous, c’est de la croissance sans développement.',
      src: EMERGENCE,
    },
  ],
  docs: [
    {
      title: 'Deux pays, deux situations (cas fictifs)',
      lines: [
        'Pays X : une production de richesses en forte hausse depuis vingt ans.',
        'Pays X : de grandes métropoles modernes, mais des campagnes restées pauvres.',
        'Pays Y : une production de richesses élevée depuis longtemps.',
        'Pays Y : une espérance de vie de plus de 80 ans et une longue scolarité pour presque tous.',
      ],
      qs: [
        {
          q: 'Quel type de pays est le pays X ?',
          a: 'un pays émergent',
          wrong: [
            {
              label: 'l’un des pays les moins avancés',
              why: 'Ligne 1 : sa production augmente fortement depuis vingt ans.',
            },
            {
              label: 'un pays développé de longue date',
              why: 'Sa croissance est récente, et ses campagnes restent pauvres (ligne 2).',
            },
          ],
          quote: G_EMERGENCE,
          explain: 'Une croissance forte pendant plusieurs années : c’est l’émergence.',
          src: EMERGENCE,
        },
        {
          q: 'D’après la ligne 4, qu’est-ce qui montre que le pays Y est développé ?',
          a: 'la santé et l’instruction de sa population',
          wrong: [
            {
              label: 'le seul montant de sa production',
              why: 'La ligne 4 parle d’espérance de vie et de scolarité, pas de production.',
            },
            { label: 'le nombre de ses métropoles', why: 'La ligne 4 ne parle pas des villes.' },
          ],
          quote: G_DEV_ELARGI,
          explain: 'Espérance de vie et scolarité : le développement se lit dans la vie des habitants.',
          src: DEVELOPPEMENT,
        },
      ],
    },
    {
      title: 'Une carte de l’espérance de vie (pays fictifs)',
      lines: [
        'La carte classe trois pays imaginaires, L, M et N, selon l’espérance de vie à la naissance.',
        'Pays L et pays M : plus de 80 ans ; les hôpitaux y sont nombreux et presque tous les enfants vont à l’école.',
        'Pays N : moins de 65 ans ; beaucoup d’habitants y ont peu accès aux soins.',
        'Dans le monde, l’espérance de vie a fortement progressé depuis les années 1950, et plus vite dans les pays les moins développés.',
      ],
      qs: [
        {
          q: 'Pourquoi cette carte renseigne-t-elle sur le développement ?',
          a: 'l’espérance de vie est liée au niveau de développement',
          wrong: [
            {
              label: 'l’espérance de vie mesure la richesse produite',
              why: 'Elle mesure une durée de vie, liée surtout à la santé.',
            },
            {
              label: 'l’espérance de vie ne dépend que du climat',
              why: 'Elle dépend surtout des soins, de l’alimentation, des conditions de vie.',
            },
          ],
          quote: G_ESPERANCE_DEV,
          explain: 'Plus un pays est développé, plus on y vit longtemps en général.',
          src: ESPERANCE,
        },
        {
          q: 'Que montre la ligne 4 ?',
          a: 'un rattrapage : l’écart entre pays se réduit',
          wrong: [
            {
              label: 'l’écart entre pays se creuse partout',
              why: 'Ligne 4 : les pays les moins développés progressent plus vite, donc l’écart se réduit.',
            },
            {
              label: 'l’espérance de vie a baissé depuis 1950',
              why: 'Ligne 4 : elle a fortement progressé dans le monde.',
            },
          ],
          quote: G_RATTRAPAGE,
          explain: 'Les pays les moins développés progressent plus vite : ils rattrapent une partie de leur retard.',
          src: ESPERANCE,
        },
      ],
    },
    {
      title: 'Un débat en classe',
      lines: [
        'Inès : « Un pays riche est forcément développé. »',
        'Hugo : « Pas sûr : il faut savoir si la croissance profite à la plupart des habitants. »',
        'Le professeur : « Il existe aussi des pays émergents, ni pays riches ni pays très pauvres. »',
        'Il ajoute : « Diviser le monde en deux blocs, riches et pauvres, est donc de plus en plus contesté. »',
      ],
      qs: [
        {
          q: 'Pourquoi Hugo nuance-t-il l’avis d’Inès ?',
          a: 'le développement suppose que la croissance profite au plus grand nombre',
          wrong: [
            {
              label: 'la richesse n’a aucun rapport avec le développement',
              why: 'Hugo ne dit pas cela : la richesse compte, mais elle doit profiter à tous.',
            },
            { label: 'seul le nombre d’habitants compte', why: 'Hugo parle du partage de la croissance.' },
          ],
          quote: G_DEV_PARTAGE,
          explain: 'Pour qu’il y ait développement, les fruits de la croissance doivent profiter au plus grand nombre.',
          src: DEVELOPPEMENT,
        },
        {
          q: 'D’après les lignes 3 et 4, pourquoi la division du monde en deux blocs est-elle contestée ?',
          a: 'à cause de l’émergence de nombreux pays',
          wrong: [
            { label: 'parce que tous les pays sont devenus riches', why: 'Le texte ne dit pas cela.' },
            {
              label: 'parce que les pays pauvres ont disparu',
              why: 'Des pays très pauvres existent toujours : les PMA.',
            },
          ],
          quote: G_DEV_BINAIRE,
          explain: 'Les pays émergents ne rentrent dans aucun des deux blocs : la carte du monde est plus nuancée.',
          src: DEVELOPPEMENT,
        },
      ],
    },
  ],
};

// ——— Notion 3 : l’IDH ———

const idh: Notion = {
  classe: '5e',
  id: 'g5-idh',
  title: 'L’indice de développement humain (IDH)',
  hint: 'L’IDH combine trois dimensions : vivre longtemps, s’instruire, avoir un niveau de vie décent.',
  memo: [
    'L’**IDH** (indice de développement humain) mesure le développement d’un pays avec trois dimensions : la santé, l’éducation et le **niveau de vie**.',
    'Il est calculé chaque année depuis 1990 par le **PNUD**, un programme de l’ONU. Exemple : un pays riche mais où l’on vit peu longtemps a un IDH plus faible que sa richesse ne le laisse penser.',
    'C’est un **indicateur composite** : il dépasse la seule mesure des richesses, même si certains le jugent encore réducteur.',
  ],
  faits: [
    {
      q: 'Que mesure l’IDH ?',
      a: 'le niveau de développement humain d’un pays',
      wrong: [
        { label: 'le nombre d’habitants d’un pays', why: 'C’est la population, pas le développement.' },
        { label: 'la superficie d’un pays', why: 'La superficie ne dit rien des conditions de vie.' },
        {
          label: 'la seule richesse produite par un pays',
          why: 'L’IDH a justement été créé pour dépasser la seule mesure des richesses.',
        },
      ],
      gap: ['L’IDH mesure le niveau moyen atteint dans des dimensions clés du développement ', '.', ['humain']],
      choix: ['humain', 'industriel', 'urbain'],
      quote: G_IDH_MESURE,
      explain: 'IDH : indice de développement humain, il porte sur la vie des habitants.',
      src: IDH,
    },
    {
      q: 'Quelles sont les trois dimensions de l’IDH ?',
      a: 'la santé, l’éducation et le niveau de vie',
      wrong: [
        { label: 'la population, la superficie et le climat', why: 'Aucune de ces données n’entre dans l’IDH.' },
        { label: 'la santé, l’armée et le tourisme', why: 'L’armée et le tourisme ne font pas partie de l’IDH.' },
        {
          label: 'le revenu, les exportations et la monnaie',
          why: 'Ces trois données sont économiques ; l’IDH ajoute la santé et l’éducation.',
        },
      ],
      gap: ['L’IDH combine la santé, l’éducation et le ', ' de vie.', ['niveau']],
      choix: ['niveau', 'mode', 'cadre'],
      quote: G_IDH_DIMENSIONS,
      explain: 'Vivre longtemps en bonne santé, acquérir des connaissances, avoir un niveau de vie décent.',
      src: IDH,
    },
    {
      q: 'Quel indicateur mesure la dimension « santé » de l’IDH ?',
      a: 'l’espérance de vie à la naissance',
      wrong: [
        { label: 'le taux de natalité', why: 'La natalité compte les naissances, pas la santé.' },
        { label: 'le nombre d’hôpitaux', why: 'L’IDH ne compte pas les bâtiments mais la durée de vie.' },
        { label: 'le revenu par habitant', why: 'Le revenu mesure la dimension « niveau de vie ».' },
      ],
      gap: ['La dimension de la santé est évaluée selon l’espérance de vie à la ', '.', ['naissance']],
      choix: ['naissance', 'retraite', 'majorité'],
      quote: G_IDH_SANTE,
      explain: 'Une population en bonne santé vit plus longtemps : l’espérance de vie mesure la santé.',
      src: IDH,
    },
    {
      q: 'Quel organisme calcule l’IDH chaque année depuis 1990 ?',
      a: 'le PNUD, programme des Nations unies pour le développement',
      wrong: [
        { label: 'l’Union européenne', why: 'L’IDH concerne tous les pays du monde, pas seulement l’Europe.' },
        { label: 'l’INSEE', why: 'L’INSEE produit les statistiques de la France.' },
        {
          label: 'chaque pays pour lui-même',
          why: 'Un seul organisme le calcule, pour pouvoir comparer les pays.',
        },
      ],
      gap: ['L’IDH est calculé chaque année depuis ', ' par le PNUD.', ['1990']],
      choix: ['1990', '1945', '2015'],
      quote: G_DH_CALCUL,
      explain: 'Le PNUD, programme de l’ONU, publie chaque année l’IDH des pays du monde.',
      src: DEV_HUMAIN,
    },
    {
      q: 'Pourquoi a-t-on créé l’IDH ?',
      a: 'pour dépasser une mesure du développement par les seules richesses',
      wrong: [
        { label: 'pour classer les pays selon leur superficie', why: 'La superficie n’entre pas dans l’IDH.' },
        {
          label: 'pour mesurer uniquement la croissance économique',
          why: 'Le PIB le fait déjà ; l’IDH ajoute la santé et l’éducation.',
        },
        { label: 'pour compter les habitants', why: 'C’est le rôle d’un recensement, pas de l’IDH.' },
      ],
      gap: ['L’IDH a pour but de dépasser une simple mesure du développement par les ', '.', ['richesses']],
      choix: ['richesses', 'routes', 'frontières'],
      quote: G_IDH_BUT,
      explain: 'Les richesses ne suffisent pas si la santé et l’éducation ne progressent pas.',
      src: IDH,
    },
    {
      q: 'Quel indicateur mesure la dimension « niveau de vie » de l’IDH ?',
      a: 'le revenu national brut par habitant',
      wrong: [
        { label: 'l’espérance de vie', why: 'L’espérance de vie mesure la dimension « santé ».' },
        { label: 'les années de scolarisation', why: 'Les années d’école mesurent la dimension « éducation ».' },
        { label: 'le nombre de voitures', why: 'L’IDH ne compte pas les biens possédés.' },
      ],
      gap: ['Le niveau de vie est mesuré par le revenu national brut par ', '.', ['habitant']],
      choix: ['habitant', 'pays', 'entreprise'],
      quote: G_IDH_NIVEAU,
      explain: 'On divise le revenu du pays par le nombre d’habitants pour comparer les niveaux de vie.',
      src: IDH,
    },
  ],
  paires3: [
    ['Santé', 'Espérance de vie à la naissance'],
    ['Éducation', 'Années de scolarisation'],
    ['Niveau de vie', 'Revenu national brut par habitant'],
  ],
  paires5: [
    ['Santé', 'Espérance de vie à la naissance'],
    ['Éducation', 'Années de scolarisation'],
    ['Niveau de vie', 'Revenu national brut par habitant'],
    ['PNUD', 'Programme de l’ONU qui calcule l’IDH'],
    ['Indicateur composite', 'Indice qui combine plusieurs mesures'],
  ],
  libres: [
    {
      q: 'Quel sigle désigne l’indice de développement humain ?',
      accepted: ['IDH', 'l’IDH'],
      traps: [
        { text: 'PIB', why: 'Le PIB mesure la richesse produite, pas le développement humain.' },
        { text: 'PMA', why: 'PMA désigne les pays les moins avancés.' },
      ],
      quote: G_IDH_COMPOSITE,
      explain: 'Indice de Développement Humain : IDH.',
      src: IDH,
    },
    {
      q: 'Quel programme de l’ONU calcule l’IDH ? Donne son sigle.',
      accepted: ['PNUD', 'le PNUD'],
      traps: [
        { text: 'OMS', why: 'L’OMS s’occupe de la santé ; l’IDH est calculé par le PNUD.' },
        { text: 'UE', why: 'L’Union européenne n’est pas un programme de l’ONU.' },
      ],
      quote: G_IDH_PNUD,
      explain: 'PNUD : Programme des Nations unies pour le développement.',
      src: IDH,
    },
    {
      q: 'Quelle dimension de l’IDH est mesurée par les années de scolarisation ?',
      accepted: [
        'éducation',
        'l’éducation',
        'la dimension éducation',
        'la dimension de l’éducation',
        'instruction',
        'l’instruction',
        'education',
        'l’education',
      ],
      traps: [
        { text: 'santé', why: 'La santé est mesurée par l’espérance de vie.' },
        { text: 'niveau de vie', why: 'Le niveau de vie est mesuré par le revenu par habitant.' },
      ],
      quote: G_IDH_EDUCATION,
      explain: 'Les années passées à l’école mesurent l’éducation.',
      src: IDH,
    },
    {
      q: 'Combien de dimensions l’IDH combine-t-il ? Écris le nombre.',
      accepted: ['3', 'trois'],
      traps: [
        { text: '2', why: 'La richesse et la santé ne suffisent pas : il y a aussi l’éducation.' },
        { text: '1', why: 'Une seule dimension, ce serait revenir à la mesure des richesses.' },
      ],
      quote: G_IDH_DIMENSIONS,
      explain: 'Trois dimensions : santé, éducation, niveau de vie.',
      src: IDH,
    },
  ],
  docs: [
    {
      title: 'Comparer deux pays (cas fictifs)',
      lines: [
        'Pays A : un revenu par habitant élevé, une espérance de vie de 66 ans, peu d’années d’école.',
        'Pays B : un revenu par habitant plus faible, une espérance de vie de 78 ans, une longue scolarité.',
        'Le pays A est donc plus riche que le pays B.',
        'Pourtant, le pays B a un IDH plus élevé que le pays A.',
      ],
      qs: [
        {
          q: 'Pourquoi le pays B a-t-il un IDH plus élevé alors qu’il est moins riche ?',
          a: 'l’IDH tient aussi compte de la santé et de l’éducation',
          wrong: [
            {
              label: 'l’IDH ne mesure que la richesse',
              why: 'Dans ce cas, le pays A, plus riche, aurait l’IDH le plus élevé.',
            },
            { label: 'l’IDH ne mesure que la population', why: 'Le texte ne donne pas le nombre d’habitants.' },
          ],
          quote: G_IDH_BUT,
          explain: 'Le pays B vit plus longtemps et étudie plus longtemps : cela compense un revenu plus faible.',
          src: IDH,
        },
        {
          q: 'Quelle donnée de la ligne 2 correspond à la dimension « santé » de l’IDH ?',
          a: 'l’espérance de vie de 78 ans',
          wrong: [
            { label: 'la longue scolarité', why: 'La scolarité correspond à la dimension « éducation ».' },
            { label: 'le revenu par habitant', why: 'Le revenu correspond à la dimension « niveau de vie ».' },
          ],
          quote: G_IDH_SANTE,
          explain: 'La santé se mesure par l’espérance de vie à la naissance.',
          src: IDH,
        },
      ],
    },
    {
      title: 'Un classement mondial',
      lines: [
        'Chaque année, le PNUD publie l’IDH de presque tous les pays du monde.',
        'L’indice combine trois dimensions : santé, éducation et niveau de vie.',
        'Il permet de comparer les pays et de suivre leur évolution dans la durée.',
        'Certains le jugent pourtant insuffisant et proposent d’autres indicateurs.',
      ],
      qs: [
        {
          q: 'Pourquoi dit-on que l’IDH est un indice composite (ligne 2) ?',
          a: 'il combine plusieurs dimensions',
          wrong: [
            { label: 'il ne mesure qu’une seule chose', why: 'Ligne 2 : il combine trois dimensions.' },
            { label: 'il est calculé par chaque pays seul', why: 'Ligne 1 : c’est le PNUD qui le publie.' },
          ],
          quote: G_IDH_COMPOSITE,
          explain: 'Composite : fait de plusieurs éléments réunis en un seul indice.',
          src: IDH,
        },
        {
          q: 'Que pensent certains de l’IDH (ligne 4) ?',
          a: 'qu’il est insuffisant et réducteur',
          wrong: [
            { label: 'qu’il est parfait', why: 'Ligne 4 : certains le jugent insuffisant.' },
            {
              label: 'qu’il ne faut plus mesurer le développement',
              why: 'Ils proposent d’autres indicateurs : ils veulent mieux mesurer, pas cesser.',
            },
          ],
          quote: G_DH_INSUFFISANT,
          explain: 'Aucun indicateur ne dit tout : on peut en proposer d’autres, par exemple sur le bien-être.',
          src: DEV_HUMAIN,
        },
      ],
    },
    {
      title: 'Mesurer le développement autrement',
      lines: [
        'Longtemps, on a mesuré le développement par la seule croissance de la production de richesses.',
        'Dans les années 1980, des économistes, dont Amartya Sen, proposent de regarder aussi la santé et l’éducation.',
        'En 1990, le PNUD adopte l’indice de développement humain.',
        'L’IDH permet des comparaisons entre pays, dont peut dépendre l’attribution de certaines aides.',
      ],
      qs: [
        {
          q: 'Quel changement décrit ce texte ?',
          a: 'on mesure le développement par la santé et l’éducation, pas seulement par la richesse',
          wrong: [
            {
              label: 'on cesse de mesurer le développement',
              why: 'Ligne 3 : on adopte au contraire un nouvel indice.',
            },
            { label: 'on mesure le développement par la superficie', why: 'Le texte ne parle pas de superficie.' },
          ],
          quote: G_IDH_BUT,
          explain: 'L’IDH élargit la mesure : santé et éducation s’ajoutent aux richesses.',
          src: IDH,
        },
        {
          q: 'D’après la ligne 4, à quoi peut servir le classement selon l’IDH ?',
          a: 'à l’attribution de certaines aides',
          wrong: [
            { label: 'à tracer les frontières des pays', why: 'Les frontières ne dépendent pas d’un indice.' },
            { label: 'à choisir la capitale d’un pays', why: 'Le texte ne parle pas de capitale.' },
          ],
          quote: G_DH_AIDES,
          explain: 'Les classements selon l’IDH peuvent guider l’aide aux pays les moins développés.',
          src: DEV_HUMAIN,
        },
      ],
    },
  ],
};

// ——— Notion 4 : la répartition de la richesse et de la pauvreté ———

const richesses: Notion = {
  classe: '5e',
  id: 'g5-repartition-richesses',
  title: 'La répartition de la richesse et de la pauvreté',
  hint: 'Change d’échelle : entre pays, entre régions, entre quartiers, la richesse n’est jamais répartie également.',
  memo: [
    'Les richesses sont inégalement réparties : entre les pays, mais aussi à l’intérieur de chaque pays. Les **inégalités** sociales s’observent partout.',
    'La **pauvreté** et la **richesse** sont relatives : en France, selon l’INSEE, une personne est pauvre si son revenu est inférieur à 60 % du **revenu médian**.',
    'Exemple : on trouve des régions pauvres dans un pays riche. Les **ODD** de l’ONU visent à éradiquer la pauvreté (ODD 1) et à réduire les inégalités (ODD 10).',
  ],
  faits: [
    {
      q: 'Dans quels pays observe-t-on des inégalités sociales ?',
      a: 'dans tous les pays',
      wrong: [
        { label: 'dans aucun pays développé', why: 'Les pays développés connaissent aussi la pauvreté.' },
        {
          label: 'seulement dans les pays riches',
          why: 'Les inégalités existent aussi dans les pays pauvres et émergents.',
        },
        {
          label: 'seulement dans les pays pauvres',
          why: 'Le programme insiste : on les observe aussi dans les pays riches.',
        },
      ],
      gap: ['Les inégalités sociales sont observables dans tous les ', '.', ['pays']],
      choix: ['pays', 'déserts', 'océans'],
      quote: P_TOUS_PAYS,
      explain: 'Riches et pauvres existent dans chaque pays : seule la proportion change.',
      src: C4,
    },
    {
      q: 'En France, quel est le seuil de pauvreté retenu par l’INSEE ?',
      a: 'un revenu inférieur à 60 % du revenu médian',
      wrong: [
        { label: 'ne posséder aucun logement', why: 'Le seuil de pauvreté porte sur le revenu, pas sur le logement.' },
        {
          label: 'un revenu inférieur à celui de son voisin',
          why: 'On compare au revenu médian de toute la population, pas à un voisin.',
        },
        {
          label: 'un revenu inférieur à 10 % du revenu médian',
          why: 'Le seuil retenu est 60 % du revenu médian, bien plus haut.',
        },
      ],
      gap: ['En France, le seuil de pauvreté est un revenu inférieur à ', ' % du revenu médian.', ['60']],
      choix: ['60', '10', '90'],
      quote: G_PR_SEUIL,
      explain: 'Le revenu médian partage la population en deux moitiés ; sous 60 % de ce revenu, on est pauvre.',
      src: PAUVRETE,
    },
    {
      q: 'Pourquoi dit-on que la pauvreté et la richesse sont des notions relatives ?',
      a: 'on n’est pauvre ou riche que par comparaison avec les autres',
      wrong: [
        { label: 'parce qu’elles ne changent jamais', why: 'Elles changent selon les lieux et les époques.' },
        { label: 'parce qu’elles ne se mesurent pas', why: 'On les mesure, par exemple avec le seuil de pauvreté.' },
        {
          label: 'parce qu’elles ne concernent que les pays',
          why: 'Elles concernent aussi les régions, les quartiers, les personnes.',
        },
      ],
      gap: ['La pauvreté et la richesse sont deux notions ', ', indissociables l’une de l’autre.', ['relatives']],
      choix: ['relatives', 'récentes', 'rares'],
      quote: G_PR_RELATIVES,
      explain: 'Il n’y a de pauvreté que comparée à la richesse, et inversement.',
      src: PAUVRETE,
    },
    {
      q: 'Que désigne la pauvreté absolue ?',
      a: 'l’incapacité à subvenir à ses besoins essentiels',
      wrong: [
        { label: 'avoir moins que son voisin', why: 'C’est une comparaison : la pauvreté absolue ne compare pas.' },
        { label: 'vivre dans un pays émergent', why: 'Dans un pays émergent, on peut être pauvre ou riche.' },
        { label: 'ne pas posséder de voiture', why: 'Une voiture n’est pas un besoin essentiel comme se nourrir.' },
      ],
      gap: ['La pauvreté absolue est une incapacité à subvenir à ses besoins ', '.', ['essentiels']],
      choix: ['essentiels', 'de loisirs', 'de luxe'],
      quote: G_PR_ABSOLUE,
      explain: 'Ne pas pouvoir se nourrir, se loger, se soigner : c’est la pauvreté absolue.',
      src: PAUVRETE,
    },
    {
      q: 'Que se passe-t-il souvent dans les pays émergents, au moins dans une première phase ?',
      a: 'les inégalités augmentent',
      wrong: [
        { label: 'les inégalités disparaissent', why: 'C’est l’inverse : l’écart de richesse se creuse souvent.' },
        { label: 'la pauvreté n’existe plus', why: 'Une partie de la population reste pauvre.' },
        {
          label: 'tout le monde s’enrichit au même rythme',
          why: 'La croissance profite d’abord à une partie de la population.',
        },
      ],
      gap: ['Dans les situations d’émergence, on observe souvent un accroissement des ', '.', ['inégalités']],
      choix: ['inégalités', 'frontières', 'montagnes'],
      quote: G_INEG_EMERGENCE,
      explain: 'Il faut du temps pour que les fruits de la croissance profitent au plus grand nombre.',
      src: INEGALITES,
    },
    {
      q: 'Quels objectifs de développement durable de l’ONU portent sur la pauvreté et les inégalités ?',
      a: 'éradiquer la pauvreté (ODD 1) et réduire les inégalités (ODD 10)',
      wrong: [
        { label: 'protéger les océans (ODD 14)', why: 'L’ODD 14 porte sur les mers et les ressources marines.' },
        {
          label: 'lutter contre le changement climatique (ODD 13)',
          why: 'L’ODD 13 porte sur le climat.',
        },
        {
          label: 'développer les énergies renouvelables (ODD 7)',
          why: 'L’ODD 7 porte sur l’énergie.',
        },
      ],
      gap: ['L’ODD 1 vise l’éradication de la ', '.', ['pauvreté']],
      choix: ['pauvreté', 'forêt', 'montagne'],
      quote: P_ODD_RICHESSE,
      explain: 'Le programme mobilise les ODD 1, 4, 5 et 10 pour étudier richesse et pauvreté.',
      src: C4,
    },
  ],
  paires3: [
    ['Seuil de pauvreté', '60 % du revenu médian en France'],
    ['Pauvreté absolue', 'Incapacité à subvenir à ses besoins essentiels'],
    ['ODD 10', 'Réduire les inégalités'],
  ],
  paires5: [
    ['Seuil de pauvreté', '60 % du revenu médian en France'],
    ['Pauvreté absolue', 'Incapacité à subvenir à ses besoins essentiels'],
    ['ODD 10', 'Réduire les inégalités'],
    ['ODD 1', 'Éradiquer la pauvreté'],
    ['Précarité', 'Manque et fragilité qui peuvent mener à la pauvreté'],
  ],
  libres: [
    {
      q: 'En France, selon l’INSEE, le seuil de pauvreté est un revenu inférieur à quel pourcentage du revenu médian ? Écris le nombre.',
      accepted: ['60', '60 %', '60%', '60 pour cent', 'soixante'],
      traps: [
        {
          text: '100',
          why: '100 % du revenu médian, c’est le revenu médian lui-même : la moitié des gens serait pauvre.',
        },
        { text: '10', why: 'C’est beaucoup trop bas : le seuil retenu est 60 %.' },
      ],
      quote: G_PR_SEUIL,
      explain: 'Sous 60 % du revenu médian, une personne est considérée comme pauvre.',
      src: PAUVRETE,
    },
    {
      q: 'Comment appelle-t-on une situation de manque et de fragilité sociale qui peut déboucher sur la pauvreté ?',
      accepted: ['précarité', 'la précarité', 'precarite', 'la precarite'],
      traps: [
        {
          text: 'pauvreté absolue',
          why: 'La pauvreté absolue est déjà l’incapacité à couvrir ses besoins essentiels.',
        },
        { text: 'émergence', why: 'L’émergence désigne la forte croissance d’un pays.' },
      ],
      quote: G_PR_PRECARITE,
      explain: 'La précarité est une fragilité : elle peut mener à la pauvreté.',
      src: PAUVRETE,
    },
    {
      q: 'Quel est le numéro de l’objectif de développement durable de l’ONU qui vise la réduction des inégalités ?',
      accepted: ['10', 'ODD 10', 'ODD10', 'l’ODD 10', 'dix'],
      traps: [
        { text: '1', why: 'L’ODD 1 vise l’éradication de la pauvreté.' },
        { text: '5', why: 'L’ODD 5 porte sur l’égalité entre les sexes ; la réduction des inégalités est l’ODD 10.' },
      ],
      quote: P_ODD_RICHESSE,
      explain: 'Réduction des inégalités : ODD 10.',
      src: C4,
    },
    {
      q: 'Quel mot désigne le caractère de ce qui n’est pas égal, par exemple des écarts de revenus ?',
      accepted: [
        'inégalité',
        'inégalités',
        'une inégalité',
        'l’inégalité',
        'des inégalités',
        'les inégalités',
        'inegalite',
        'inegalites',
      ],
      traps: [
        { text: 'pauvreté', why: 'La pauvreté est une situation ; l’inégalité est l’écart entre situations.' },
        { text: 'émergence', why: 'L’émergence désigne la forte croissance d’un pays.' },
      ],
      quote: G_INEGALITE,
      explain: 'Inégalité : ce qui n’est pas égal, entre personnes, régions ou pays.',
      src: INEGALITES,
    },
  ],
  docs: [
    {
      title: 'Une même ville, deux quartiers (cas fictif)',
      lines: [
        'Dans une grande ville d’un pays émergent, un quartier d’affaires aligne tours de bureaux et résidences de luxe.',
        'À quelques kilomètres, un quartier informel s’étend, où certains logements n’ont pas l’eau courante.',
        'Les habitants des deux quartiers n’ont pas le même accès aux soins ni à l’école.',
        'L’écart de richesse entre ces habitants s’est creusé avec la croissance du pays.',
      ],
      qs: [
        {
          q: 'À quelle échelle ce texte observe-t-il les inégalités ?',
          a: 'à l’échelle locale, à l’intérieur d’une ville',
          wrong: [
            {
              label: 'à l’échelle mondiale, entre continents',
              why: 'Le texte compare deux quartiers d’une même ville.',
            },
            { label: 'à l’échelle d’un seul logement', why: 'Le texte compare des quartiers entiers.' },
          ],
          quote: G_INEG_ECHELLES,
          explain: 'Les inégalités s’observent à toutes les échelles, jusqu’au quartier.',
          src: INEGALITES,
        },
        {
          q: 'Que montre la ligne 4 ?',
          a: 'la croissance peut s’accompagner d’une hausse des inégalités',
          wrong: [
            {
              label: 'la croissance fait toujours disparaître la pauvreté',
              why: 'Ligne 4 : l’écart s’est creusé, la pauvreté demeure.',
            },
            {
              label: 'les deux quartiers se sont enrichis au même rythme',
              why: 'Si c’était le cas, l’écart ne se serait pas creusé.',
            },
          ],
          quote: G_INEG_EMERGENCE,
          explain: 'Dans un pays émergent, la croissance profite d’abord à une partie de la population.',
          src: INEGALITES,
        },
      ],
    },
    {
      title: 'Mesurer la pauvreté en France',
      lines: [
        'L’INSEE part du revenu médian : la moitié des personnes gagnent plus, l’autre moitié gagne moins.',
        'Une personne est considérée comme pauvre si son revenu est inférieur à 60 % de ce revenu médian.',
        'La France est un pays développé.',
        'Pourtant, certaines régions et certains quartiers y concentrent plus de pauvreté que d’autres.',
      ],
      qs: [
        {
          q: 'Quel enseignement tirer des lignes 3 et 4 ?',
          a: 'la pauvreté existe aussi dans un pays développé',
          wrong: [
            {
              label: 'la pauvreté n’existe que dans les pays en développement',
              why: 'Ligne 4 : des régions et des quartiers de France concentrent de la pauvreté.',
            },
            {
              label: 'la pauvreté est répartie également sur le territoire',
              why: 'Ligne 4 : certains lieux en concentrent plus que d’autres.',
            },
          ],
          quote: G_PR_ECHELLE,
          explain: 'On trouve des régions pauvres même dans un pays riche.',
          src: PAUVRETE,
        },
        {
          q: 'Pourquoi cette mesure de la pauvreté est-elle relative (lignes 1 et 2) ?',
          a: 'elle compare le revenu de chacun à celui de l’ensemble de la population',
          wrong: [
            {
              label: 'elle ne regarde que les besoins essentiels',
              why: 'Ce serait la pauvreté absolue ; ici, on compare au revenu médian.',
            },
            { label: 'elle est la même dans tous les pays', why: 'Le revenu médian change d’un pays à l’autre.' },
          ],
          quote: G_PR_TAUX,
          explain: 'Le seuil dépend du revenu médian : c’est une mesure par comparaison.',
          src: PAUVRETE,
        },
      ],
    },
    {
      title: 'Les objectifs de l’ONU contre la pauvreté',
      lines: [
        'L’ONU a fixé des objectifs de développement durable (ODD) pour tous les pays.',
        'L’ODD 1 vise l’éradication de la pauvreté.',
        'L’ODD 4 vise l’accès à une éducation de qualité ; l’ODD 5, l’égalité entre les sexes.',
        'L’ODD 10 vise la réduction des inégalités.',
      ],
      qs: [
        {
          q: 'Quel ODD vise directement à faire disparaître la pauvreté ?',
          a: 'l’ODD 1',
          wrong: [
            { label: 'l’ODD 10', why: 'L’ODD 10 vise la réduction des inégalités (ligne 4).' },
            { label: 'l’ODD 4', why: 'L’ODD 4 vise l’éducation (ligne 3).' },
          ],
          quote: P_ODD_RICHESSE,
          explain: 'Ligne 2 : l’éradication de la pauvreté, c’est l’ODD 1.',
          src: C4,
        },
        {
          q: 'Quel ODD vise l’égalité entre les filles et les garçons ?',
          a: 'l’ODD 5',
          wrong: [
            { label: 'l’ODD 1', why: 'L’ODD 1 vise l’éradication de la pauvreté (ligne 2).' },
            {
              label: 'l’ODD 10',
              why: 'L’ODD 10 vise les inégalités en général ; l’égalité entre les sexes a son propre objectif.',
            },
          ],
          quote: P_ODD_RICHESSE,
          explain: 'Ligne 3 : l’égalité entre les sexes, c’est l’ODD 5.',
          src: C4,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [croissance, developpement, idh, richesses];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
