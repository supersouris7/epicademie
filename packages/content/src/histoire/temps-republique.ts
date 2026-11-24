import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './temps-republique-sources.ts';

/**
 * CM2, thème 1 « Le temps de la République » (lot hi-cm2-01). Chaque fait cite le programme (cycle 3 ou EMC) ou une
 * page du Sénat ou de l'Assemblée nationale ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

// ——— Notion 1 : 1892, la République fête ses cent ans ———

const centenaire: Notion = {
  id: 'hcm2-1892',
  title: '1892 : la République fête ses cent ans',
  hint: 'Relis le mémo : cherche la grande fête, les secousses du passé et les symboles.',
  memo: [
    'En 1892, la République, née en 1792, fête ses cent ans : c’est son **centenaire** ! Les cérémonies montrent ses **symboles** : le drapeau tricolore, l’hymne (la Marseillaise) et la **devise** « Liberté, Égalité, Fraternité ». La fête nationale est le 14 juillet.',
    'Depuis la Révolution de 1789, les Français ont essayé plusieurs régimes, parfois dans la violence : en 1830 (fin du régime du roi Charles X), en 1848 (la République est rétablie) et en 1870 (un gouvernement provisoire, mis en place pour un temps, est créé en septembre).',
    'À la même époque, la France se lance aussi dans une nouvelle **colonisation** : elle prend le contrôle d’autres territoires et de leurs habitants.',
  ],
  faits: [
    {
      ...P.cent,
      q: 'En quelle année la République fête-t-elle ses cent ans ?',
      a: '1892',
      wrong: [
        { label: '1789', why: '1789 est l’année où commence la Révolution.' },
        { label: '1944', why: '1944 est l’année où les femmes obtiennent le droit de vote.' },
        { label: '1848', why: '1848 est une année de secousses politiques, avant le centenaire.' },
      ],
      gap: ['La République fête ses cent ans en ', '.', ['1892']],
      explain: 'Le grand anniversaire de la République a lieu en 1892.',
    },
    {
      ...P.cent,
      q: 'Quel anniversaire la République fête-t-elle en 1892 ?',
      a: 'ses cent ans',
      wrong: [
        { label: 'ses dix ans', why: 'Dix ans, c’est beaucoup trop court : la fête marque un siècle.' },
        { label: 'ses mille ans', why: 'Mille ans, ce serait dix siècles : la République est bien plus jeune.' },
        { label: 'ses cinq cents ans', why: 'Il y a cinq cents ans, la France avait des rois.' },
      ],
      gap: ['En 1892, la République fête ses ', ' ans.', ['cent', '100']],
      explain: 'En 1892, la République fête ses cent ans.',
    },
    {
      ...P.ceremonies,
      q: 'Que mettent en scène les cérémonies de 1892 ?',
      a: 'les symboles républicains',
      wrong: [
        { label: 'la couronne du roi', why: 'La couronne est un signe de la royauté, pas de la République.' },
        { label: 'les jeux des Romains', why: 'Les Romains vivent dans l’Antiquité, bien avant la République.' },
        { label: 'le château des chevaliers', why: 'Les chevaliers appartiennent au Moyen Âge.' },
      ],
      gap: [
        'En 1892, les cérémonies de la République mettent en scène les symboles ',
        '.',
        ['républicains', 'republicains', 'de la République', 'de la république'],
      ],
      explain: 'La fête montre les symboles de la République.',
    },
    {
      ...P.experiences,
      q: 'Depuis quel grand événement les Français ont-ils essayé différents régimes politiques ?',
      a: 'depuis la Révolution',
      wrong: [
        { label: 'depuis la Renaissance', why: 'La Renaissance est le temps de François Ier, bien avant.' },
        { label: 'depuis Charlemagne', why: 'Charlemagne est empereur en 800 : le programme part de la Révolution.' },
        { label: 'depuis 1945', why: '1945 vient bien après 1892.' },
      ],
      gap: ['Les Français ont essayé différents régimes depuis la ', '.', ['Révolution', 'révolution', 'revolution']],
      explain: 'Les différentes expériences politiques commencent à la Révolution.',
    },
    {
      ...P.colonisation,
      q: 'À l’époque du centenaire de 1892, quel nouveau processus la République engage-t-elle ?',
      a: 'un processus de colonisation',
      wrong: [
        { label: 'le retour de la royauté', why: 'La France reste une République à cette période.' },
        {
          label: 'la fin de toutes les guerres',
          why: 'Rien ne dit cela : le XXe siècle connaît deux guerres mondiales.',
        },
        { label: 'l’invention de l’écriture', why: 'L’écriture existe depuis l’Antiquité.' },
      ],
      gap: [
        'La France prend le contrôle d’autres territoires : un nouveau processus de ',
        ' commence.',
        ['colonisation'],
      ],
      explain: 'Un nouveau processus de colonisation commence : la France prend le contrôle d’autres territoires.',
    },
    {
      ...P.symboles,
      q: 'Lequel de ces objets est un symbole de la République ?',
      a: 'le drapeau tricolore',
      wrong: [
        { label: 'la couronne', why: 'La couronne est le symbole d’un roi.' },
        { label: 'le sceptre', why: 'Le sceptre est le bâton d’un roi.' },
        { label: 'le blason d’un chevalier', why: 'Un blason désigne un chevalier ou une famille, pas la République.' },
      ],
      gap: ['Le ', ' tricolore est un symbole de la République.', ['drapeau']],
      explain: 'Le drapeau, l’hymne et la devise sont des symboles de la République.',
    },
    {
      ...P.devise,
      q: 'Quelle est la devise de la République ?',
      a: 'Liberté, Égalité, Fraternité',
      wrong: [
        {
          label: 'Un roi, une loi, une foi',
          why: 'Cette formule parle d’un roi : ce n’est pas la devise de la République.',
        },
        { label: 'Travail, Famille, Patrie', why: 'Ce n’est pas la devise de la République.' },
        { label: 'Gratuité, Obligation, Laïcité', why: 'Ces mots décrivent les lois sur l’école.' },
      ],
      gap: ['Liberté, Égalité, ', '.', ['Fraternité', 'fraternité', 'Fraternite', 'fraternite']],
      explain: 'La devise est « Liberté, Égalité, Fraternité ».',
    },
    {
      ...P.hymne,
      q: 'Quel chant la République choisit-elle comme hymne national ?',
      a: 'la Marseillaise',
      wrong: [
        { label: 'une chanson de chevalier', why: 'L’hymne de la République est la Marseillaise.' },
        { label: 'le chant du roi Soleil', why: 'La République ne chante pas un roi : son hymne est la Marseillaise.' },
        { label: 'une comptine d’école', why: 'Une comptine n’est pas un hymne national.' },
      ],
      gap: ['L’hymne national est la ', '.', ['Marseillaise', 'marseillaise', 'La Marseillaise', 'la Marseillaise']],
      explain: 'La Marseillaise est adoptée comme hymne national.',
    },
  ],
  paires3: [
    ['1892', 'Les cent ans de la République'],
    ['La Marseillaise', 'L’hymne national'],
    ['14 juillet', 'La fête nationale'],
  ],
  paires5: [
    ['1892', 'Les cent ans de la République'],
    ['1830', 'Fin du régime du roi Charles X'],
    ['1848', 'La Constitution rétablit la République'],
    ['1870', 'Création d’un gouvernement provisoire en septembre'],
    ['La Marseillaise', 'L’hymne national'],
  ],
  frise: [
    { ...P.revolution, label: 'Début de la Révolution', date: '1789' },
    { ...P.juillet1830, label: 'Les « Trois Glorieuses » contre Charles X', date: '1830' },
    { ...P.republique1848, label: 'La Constitution rétablit la République', date: '1848' },
    { ...P.septembre1870, label: 'Un gouvernement provisoire est créé en septembre', date: '1870' },
    { ...P.cent, label: 'La République fête ses cent ans', date: '1892' },
  ],
  libres: [
    {
      ...P.cent,
      q: 'En quelle année la République fête-t-elle son centenaire ? (quatre chiffres)',
      accepted: ['1892'],
      traps: [
        { text: '1789', why: '1789 est le début de la Révolution, un peu plus de cent ans avant.' },
        { text: '1992', why: 'Tu as un siècle de trop : relis le mémo.' },
      ],
      explain: 'Le centenaire est fêté en 1892.',
    },
    {
      ...P.cent,
      q: 'La République fête ses cent ans en 1892. Calcule : en quelle année est-elle née ?',
      accepted: ['1792'],
      traps: [
        { text: '1789', why: '1789 est le début de la Révolution. Fais le calcul : 1892 moins 100.' },
        { text: '1992', why: 'Tu as ajouté 100 : il faut les enlever.' },
      ],
      explain: '1892 moins 100 ans donne 1792.',
    },
    {
      ...P.hymne,
      q: 'Quel est le nom de l’hymne national français ? (un nom)',
      accepted: ['la Marseillaise', 'Marseillaise', 'La Marseillaise', 'marseillaise', 'la marseillaise'],
      traps: [
        { text: 'la Parisienne', why: 'L’hymne porte le nom d’une autre ville : pense à Marseille.' },
        { text: 'Marianne', why: 'Marianne est un symbole qui a la forme d’une femme, pas un chant.' },
      ],
      explain: 'L’hymne national est la Marseillaise.',
    },
    {
      ...P.hymne,
      q: 'Quel jour la République choisit-elle pour la fête nationale ? (jour et mois)',
      accepted: ['14 juillet', 'le 14 juillet', '14 Juillet'],
      traps: [
        { text: '11 novembre', why: 'Le 11 novembre est une commémoration liée à la Première Guerre mondiale.' },
        { text: '1er janvier', why: 'Le 1er janvier est le jour de l’an.' },
      ],
      explain: 'La fête nationale est fixée au 14 juillet.',
    },
    {
      ...P.colonisation,
      q: 'Vers 1892, la France prend le contrôle d’autres territoires : c’est une nouvelle … (un mot).',
      accepted: ['colonisation', 'la colonisation'],
      traps: [
        { text: 'monarchie', why: 'La France est une République : elle ne redevient pas une monarchie.' },
        { text: 'préhistoire', why: 'La préhistoire est une époque très ancienne.' },
      ],
      explain: 'Un nouveau processus de colonisation commence.',
    },
  ],
  docs: [
    {
      title: 'Un jour de fête en 1892',
      lines: [
        'Dans la ville, on a accroché des drapeaux tricolores aux fenêtres.',
        'La fanfare joue la Marseillaise devant la mairie.',
        'Le maire annonce : « Notre République a cent ans ! »',
      ],
      qs: [
        {
          ...P.ceremonies,
          q: 'Que montrent les drapeaux et la Marseillaise ?',
          a: 'les symboles de la République',
          wrong: [
            { label: 'les signes d’un roi', why: 'Le texte parle de la République, pas d’un roi.' },
            { label: 'les outils d’une usine', why: 'Le texte décrit une fête, pas un travail.' },
          ],
          explain: 'Le drapeau et la Marseillaise sont des symboles de la République.',
        },
        {
          ...P.cent,
          q: 'La fête célèbre une République née cent ans plus tôt. En quelle année ?',
          a: '1792',
          wrong: [
            { label: '1692', why: 'Cela ferait deux cents ans : le maire parle de cent ans.' },
            { label: '1870', why: 'De 1870 à 1892, il n’y a que 22 ans.' },
          ],
          explain: 'La fête a lieu en 1892 : cent ans plus tôt, c’est 1792.',
        },
      ],
    },
    {
      title: 'Un siècle agité',
      lines: [
        'Un grand-père raconte à sa petite-fille, en 1892 :',
        '« Depuis la Révolution, la France a connu des rois, des empereurs et des républiques. »',
        '« Certains changements se sont faits dans la violence. »',
      ],
      qs: [
        {
          ...P.experiences,
          q: 'Que montre ce récit sur le siècle qui précède 1892 ?',
          a: 'les Français ont essayé différents régimes',
          wrong: [
            {
              label: 'un seul roi a gouverné tout le temps',
              why: 'Le grand-père cite aussi des empereurs et des républiques.',
            },
            {
              label: 'rien n’a changé depuis la Révolution',
              why: 'Le texte dit au contraire que les régimes changent.',
            },
          ],
          explain: 'Rois, empereurs, républiques : les Français ont vécu différentes expériences politiques.',
        },
        {
          ...P.experiences,
          q: 'Laquelle de ces années est liée à ces secousses, avant 1892 ?',
          a: '1848',
          wrong: [
            { label: '800', why: '800 est le temps de Charlemagne, bien avant la Révolution.' },
            { label: '1944', why: '1944 vient après 1892.' },
          ],
          explain: '1830, 1848 et 1870 sont des moments de conflits et de violences.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : l'école au temps de Jules Ferry ———

const ecole: Notion = {
  id: 'hcm2-ecole-ferry',
  title: 'L’école primaire au temps de Jules Ferry',
  hint: 'Relis le mémo : cherche les trois grands mots de l’école et les âges concernés.',
  memo: [
    'À partir des années 1880, avec Jules Ferry, l’école publique devient **gratuite** (loi de 1881), puis **laïque** et l’enseignement **obligatoire** (loi de 1882).',
    'Les enfants, filles et garçons, doivent s’instruire de 6 à 13 ans. Les filles et les enfants des campagnes en profitent beaucoup.',
    'La République compte sur l’école pour que les Français l’adoptent. Elle forme des **instituteurs** dans des **écoles normales** (loi de 1879). À partir de 1886, les religieux qui enseignent dans les écoles publiques sont peu à peu remplacés.',
  ],
  faits: [
    {
      ...P.ecole,
      q: 'Au temps de Jules Ferry, comment est l’école ?',
      a: 'gratuite, laïque et obligatoire',
      wrong: [
        {
          label: 'payante, religieuse et libre',
          why: 'C’est l’inverse : l’école publique devient gratuite et laïque.',
        },
        { label: 'réservée aux garçons riches', why: 'Au contraire : filles et garçons doivent s’instruire.' },
        {
          label: 'gratuite seulement le dimanche',
          why: 'La gratuité de l’école publique vaut pour toute la semaine de classe.',
        },
      ],
      gap: ['L’école devient gratuite, laïque et ', '.', ['obligatoire']],
      explain: 'Les trois mots à retenir : gratuite, laïque, obligatoire.',
    },
    {
      ...P.obligation,
      q: 'De quel âge à quel âge l’enseignement primaire est-il obligatoire ?',
      a: 'de 6 à 13 ans',
      wrong: [
        { label: 'de 3 à 6 ans', why: 'C’est le temps avant l’école primaire de l’époque.' },
        { label: 'de 13 à 18 ans', why: 'C’est l’âge d’après : l’obligation s’arrête à 13 ans.' },
        { label: 'de 6 à 25 ans', why: 'L’obligation s’arrête bien plus tôt, à 13 ans.' },
      ],
      gap: ['L’enseignement primaire est obligatoire de 6 à ', ' ans.', ['13', 'treize']],
      explain: 'La loi de 1882 rend l’enseignement obligatoire de 6 à 13 ans.',
    },
    {
      ...P.obligation,
      q: 'Qui est concerné par l’obligation de s’instruire ?',
      a: 'les filles et les garçons',
      wrong: [
        { label: 'seulement les garçons', why: 'La loi vise les enfants des deux sexes.' },
        { label: 'seulement les filles', why: 'La loi vise les enfants des deux sexes.' },
        { label: 'seulement les enfants des villes', why: 'Les enfants des campagnes sont aussi concernés.' },
      ],
      gap: ['L’obligation concerne les garçons et les ', '.', ['filles']],
      explain: 'Les enfants des deux sexes sont concernés.',
    },
    {
      ...P.gratuite,
      q: 'En quelle année est votée la gratuité de l’école ?',
      a: '1881',
      wrong: [
        { label: '1789', why: '1789 est le début de la Révolution.' },
        { label: '1905', why: 'La loi de 1905 parle des Églises et de l’État.' },
        { label: '1944', why: '1944 est l’année du droit de vote des femmes.' },
      ],
      gap: ['La gratuité de l’école est votée en ', '.', ['1881']],
      explain: 'La gratuité est votée en juin 1881.',
    },
    {
      ...P.normales,
      q: 'Dans quelles écoles forme-t-on les nouveaux instituteurs ?',
      a: 'les écoles normales',
      wrong: [
        { label: 'les écoles militaires', why: 'Les écoles militaires forment des soldats.' },
        { label: 'les écoles royales', why: 'La République n’a pas de roi.' },
        { label: 'les écoles de musique', why: 'Elles forment des musiciens.' },
      ],
      gap: ['Les instituteurs se forment à l’école ', '.', ['normale']],
      explain: 'Des écoles normales forment les instituteurs.',
    },
    {
      ...P.filles,
      q: 'Quels enfants profitent surtout de ces lois sur l’école ?',
      a: 'les filles et les enfants des campagnes',
      wrong: [
        { label: 'les enfants des rois', why: 'La République n’a pas de roi.' },
        { label: 'les adultes des usines', why: 'Les lois visent les enfants.' },
        { label: 'les soldats', why: 'Les lois sur l’école concernent les enfants.' },
      ],
      gap: ['Les lois aident surtout les filles et les enfants des ', '.', ['campagnes']],
      explain: 'Leur scolarisation progresse beaucoup grâce à ces lois.',
    },
  ],
  paires3: [
    ['Gratuite', 'On ne paie pas'],
    ['Obligatoire', 'On doit s’instruire'],
    ['Laïque', 'Aucune religion n’est enseignée'],
  ],
  paires5: [
    ['Gratuite', 'On ne paie pas'],
    ['Obligatoire', 'On doit s’instruire'],
    ['Laïque', 'Aucune religion n’est enseignée'],
    ['Instituteur', 'Il fait la classe à l’école primaire'],
    ['École normale', 'On y apprend le métier d’instituteur'],
  ],
  frise: [
    { ...P.normales1879, label: 'Des écoles normales pour former les instituteurs', date: '1879' },
    { ...P.gratuite, label: 'L’école publique devient gratuite', date: '1881' },
    { ...P.gratuite, label: 'L’enseignement devient obligatoire et laïque', date: '1882' },
    { ...P.personnel, label: 'Les religieux sont peu à peu remplacés dans les écoles publiques', date: '1886' },
  ],
  libres: [
    {
      ...P.ecole,
      q: 'Quel mot complète : « école gratuite, … et obligatoire » ?',
      accepted: ['laïque', 'laique'],
      traps: [
        { text: 'payante', why: 'On vient de dire gratuite : l’école ne peut pas être payante.' },
        { text: 'royale', why: 'La République n’a pas de roi.' },
      ],
      explain: 'L’école est gratuite, laïque et obligatoire.',
    },
    {
      ...P.obligation,
      q: 'Jusqu’à quel âge l’enseignement est-il obligatoire avec la loi de 1882 ? (en chiffres)',
      accepted: ['13', '13 ans', 'treize', 'treize ans'],
      traps: [
        { text: '6', why: '6 ans est l’âge où l’obligation commence.' },
        { text: '16', why: 'Cet âge est plus tardif : en 1882, c’est 13 ans.' },
      ],
      explain: 'L’obligation va de 6 à 13 ans.',
    },
    {
      ...P.gratuite,
      q: 'En quelle année la gratuité de l’école publique est-elle votée ? (quatre chiffres)',
      accepted: ['1881'],
      traps: [
        { text: '1882', why: '1882 est l’année de l’obligation et de la laïcité : la gratuité vient juste avant.' },
        { text: '1892', why: '1892 est le centenaire de la République.' },
      ],
      explain: 'La gratuité est votée en 1881.',
    },
    {
      ...P.normales,
      q: 'Comment appelle-t-on la personne qui fait la classe à l’école primaire ? (un mot qui commence par « i »)',
      accepted: ['instituteur', 'institutrice', 'un instituteur', 'une institutrice'],
      traps: [
        { text: 'professeur', why: 'Ce mot ne commence pas par « i » : cherche celui de l’école primaire.' },
        { text: 'inspecteur', why: 'L’inspecteur contrôle le travail ; il ne fait pas la classe.' },
      ],
      explain: 'C’est l’instituteur ou l’institutrice.',
    },
  ],
  docs: [
    {
      title: 'Le journal de Louise',
      lines: [
        'Nous sommes en 1883. Louise a huit ans et vit à la campagne.',
        'Ses parents ne paient rien pour l’école publique.',
        'Ils doivent l’instruire : ce n’est plus un choix.',
      ],
      qs: [
        {
          ...P.gratuite,
          q: 'Quel mot décrit une école où les parents ne paient rien ?',
          a: 'gratuite',
          wrong: [
            { label: 'obligatoire', why: 'Obligatoire veut dire qu’on doit s’instruire.' },
            { label: 'laïque', why: 'Laïque parle de la religion, pas du prix.' },
          ],
          explain: 'Ne rien payer : l’école est gratuite.',
        },
        {
          ...P.obligation,
          q: 'Pourquoi les parents de Louise doivent-ils l’instruire ?',
          a: 'l’enseignement est obligatoire de 6 à 13 ans',
          wrong: [
            {
              label: 'Louise est trop grande pour travailler',
              why: 'Le texte dit que c’est une règle, pas une question de taille.',
            },
            {
              label: 'seuls les garçons peuvent rester à la maison',
              why: 'La loi concerne les filles et les garçons.',
            },
          ],
          explain: 'Louise a huit ans : elle est dans les âges de l’obligation.',
        },
      ],
    },
    {
      title: 'Dans la salle de classe',
      lines: [
        'En 1890, la commune instruit les filles et les garçons dans ses écoles publiques.',
        'Les bâtiments et les leçons montrent la place de la République.',
        'Des familles de religions différentes y envoient leurs enfants.',
      ],
      qs: [
        {
          ...P.ecole,
          q: 'Quel mot explique que ces écoles n’imposent aucune religion à ces familles ?',
          a: 'elles sont laïques',
          wrong: [
            {
              label: 'elles sont payantes',
              why: 'Payer n’a rien à voir avec les religions, et l’école publique est gratuite.',
            },
            { label: 'elles sont royales', why: 'La République n’a pas de roi.' },
          ],
          explain: 'Une école laïque n’impose aucune religion.',
        },
        {
          ...P.ecole,
          q: 'Pourquoi la République tient-elle à cette école ?',
          a: 'pour que les Français adhèrent à la République',
          wrong: [
            { label: 'pour préparer le retour du roi', why: 'L’école aide la République, pas la royauté.' },
            { label: 'pour arrêter d’apprendre à lire', why: 'L’école sert au contraire à instruire.' },
          ],
          explain: 'L’école aide à construire l’adhésion à la République.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : des républiques, une démocratie ———

const democratie: Notion = {
  id: 'hcm2-democratie',
  title: 'Des républiques, une démocratie : libertés, droits et devoirs',
  hint: 'Relis le mémo : sépare ce que tu peux faire et ce que tu dois faire.',
  memo: [
    'Aujourd’hui, sous la Ve République, nous avons des **libertés** (s’exprimer, pratiquer un **culte**) et des droits, comme voter.',
    'Ils sont le fruit d’une **conquête** : la **démocratie** et la société ont changé peu à peu, et on en discute toujours.',
    'Les citoyens ont aussi des **devoirs** : respecter les lois et payer l’**impôt**. La liberté des uns s’arrête là où commence celle des autres. La liberté de conscience permet de croire, de ne pas croire ou de changer de croyance. Repères : 1789, Déclaration des droits de l’homme et du citoyen ; 1881, loi sur la liberté de la presse ; 1905, loi sur la laïcité et la liberté des cultes ; 1944, droit de vote des femmes.',
  ],
  faits: [
    {
      ...P.libertes,
      q: 'Sous quelle République vivons-nous aujourd’hui ?',
      a: 'la Ve République',
      wrong: [
        { label: 'la Ire République', why: 'La première République date de la Révolution.' },
        { label: 'la IIe République', why: 'La IIe République appartient au XIXe siècle.' },
        { label: 'la IIIe République', why: 'La IIIe République est celle du temps de Jules Ferry.' },
      ],
      gap: ['Aujourd’hui, nous vivons sous la ', ' République.', ['Ve', 'V', '5e', 'cinquième', 'Cinquième']],
      explain: 'Aujourd’hui, la France est sous la Ve République.',
    },
    {
      ...P.expression,
      q: 'Laquelle de ces phrases parle d’une liberté ?',
      a: 'dire son avis',
      wrong: [
        { label: 'payer l’impôt', why: 'Payer l’impôt est un devoir.' },
        { label: 'respecter la loi', why: 'Respecter la loi est un devoir.' },
        { label: 'obéir à un roi', why: 'En République, il n’y a pas de roi.' },
      ],
      gap: ['Pouvoir dire et publier son avis, c’est la liberté d’', '.', ['expression', 'l’expression']],
      explain: 'La liberté d’expression permet de dire son avis.',
    },
    {
      ...P.conscience,
      q: 'Que permet la liberté de conscience ?',
      a: 'croire, ne pas croire ou changer de croyance',
      wrong: [
        {
          label: 'obliger les autres à croire comme soi',
          why: 'La liberté appartient à chacun : on n’impose pas la sienne.',
        },
        { label: 'ne plus respecter les lois', why: 'La liberté de conscience ne supprime pas les lois.' },
        { label: 'choisir la religion de ses voisins', why: 'Chacun choisit pour lui-même.' },
      ],
      gap: ['La liberté de ', ' permet de croire ou de ne pas croire.', ['conscience']],
      explain: 'Chacun peut croire, ne pas croire ou changer de croyance.',
    },
    {
      ...P.impot,
      q: 'Quel devoir permet de participer aux dépenses de l’État ?',
      a: 'payer l’impôt',
      wrong: [
        {
          label: 'voter les lois soi-même chaque jour',
          why: 'Les représentants élus préparent les lois ; ce n’est pas ce devoir.',
        },
        { label: 'dire son avis dans un journal', why: 'Dire son avis est une liberté.' },
        { label: 'pratiquer un culte', why: 'Pratiquer un culte est une liberté.' },
      ],
      gap: ['Les citoyens participent aux dépenses en payant l’', '.', ['impôt', 'impot', 'impôts', 'impots']],
      explain: 'L’impôt aide à payer les dépenses publiques.',
    },
    {
      ...P.limites,
      q: 'Les libertés ont-elles des limites ?',
      a: 'oui, pour ne pas gêner la liberté des autres',
      wrong: [
        { label: 'non, on peut tout faire', why: 'La liberté d’une personne ne doit pas gêner celle des autres.' },
        { label: 'oui, il faut la permission d’un roi', why: 'En République, aucun roi ne donne la permission.' },
        { label: 'oui, mais seulement pour les enfants', why: 'Les limites concernent tout le monde.' },
      ],
      gap: ['La liberté des uns ne doit pas gêner celle des ', '.', ['autres']],
      explain: 'Les libertés ont des limites pour que chacun puisse en profiter.',
    },
    {
      ...P.libertes,
      q: 'Comment les Français ont-ils obtenu les libertés et les droits d’aujourd’hui ?',
      a: 'par une conquête et une évolution',
      wrong: [
        { label: 'ils ont toujours existé', why: 'Ils ne sont pas tombés du ciel : ils ont été gagnés peu à peu.' },
        { label: 'par un tirage au sort', why: 'Ils sont le fruit d’une conquête et d’une évolution.' },
        { label: 'par la décision d’un chevalier', why: 'La démocratie ne vient pas d’une seule personne.' },
      ],
      gap: ['Les droits sont le fruit d’une ', ' et d’une évolution.', ['conquête', 'conquete']],
      explain: 'Les droits ont été conquis, et on les discute encore.',
    },
  ],
  paires3: [
    ['Liberté d’expression', 'Donner son avis'],
    ['Impôt', 'Argent versé pour les dépenses publiques'],
    ['Vote', 'Choisir ses représentants'],
  ],
  paires5: [
    ['Liberté d’expression', 'Donner son avis'],
    ['Impôt', 'Argent versé pour les dépenses publiques'],
    ['Vote', 'Choisir ses représentants'],
    ['Liberté de culte', 'Pratiquer sa religion'],
    ['Loi', 'Règle que tout le monde doit respecter'],
  ],
  frise: [
    { ...P.declaration, label: 'La Déclaration des droits de l’homme et du citoyen', date: '1789' },
    { ...P.presse, label: 'La loi sur la liberté de la presse', date: '1881' },
    { ...P.cultes, label: 'La loi sur la laïcité et le libre exercice des cultes', date: '1905' },
    { ...P.femmes1944, label: 'Le droit de vote des femmes', date: '1944' },
  ],
  libres: [
    {
      ...P.lois,
      q: 'Respecter les lois est-il un droit ou un devoir ? (un mot)',
      accepted: ['devoir', 'un devoir'],
      traps: [
        { text: 'droit', why: 'Un droit, tu peux t’en servir. Ici, c’est une obligation.' },
        { text: 'un droit', why: 'Un droit, tu peux t’en servir. Ici, c’est une obligation.' },
      ],
      explain: 'Respecter les lois est un devoir.',
    },
    {
      ...P.expression,
      q: 'Pouvoir dire et publier son avis, c’est la liberté d’… (un mot).',
      accepted: ['expression', 'l’expression'],
      traps: [
        {
          text: 'opinion',
          why: 'La liberté d’opinion, c’est le droit d’avoir un avis. Le dire et le publier, c’est une autre liberté.',
        },
        { text: 'impôt', why: 'L’impôt est un devoir : ce n’est pas le nom d’une liberté.' },
        { text: 'obéissance', why: 'Obéir n’est pas la même chose que dire son avis.' },
      ],
      explain: 'C’est la liberté d’expression.',
    },
    {
      ...P.impot,
      q: 'Quel nom porte l’argent que les citoyens versent pour les dépenses publiques ? (un mot)',
      accepted: ['impôt', 'impot', 'l’impôt', 'impôts', 'les impôts'],
      traps: [
        { text: 'salaire', why: 'Le salaire est l’argent qu’on gagne en travaillant.' },
        { text: 'amende', why: 'Une amende punit une faute. Ici, c’est une participation normale.' },
      ],
      explain: 'C’est l’impôt.',
    },
    {
      ...P.declaration,
      q: 'En quelle année est écrite la Déclaration des droits de l’homme et du citoyen ? (quatre chiffres)',
      accepted: ['1789'],
      traps: [
        { text: '1892', why: '1892 est le centenaire de la République.' },
        { text: '1944', why: '1944 est l’année du droit de vote des femmes.' },
      ],
      explain: 'Elle date de 1789, au début de la Révolution.',
    },
  ],
  docs: [
    {
      title: 'Le débat de la classe',
      lines: [
        'Pendant un débat, Sami dit qu’il n’est pas d’accord avec Jade.',
        'Jade répond calmement : « Tu as le droit de le dire. »',
        'Ensuite, un élève coupe tout le temps la parole aux autres.',
      ],
      qs: [
        {
          ...P.expression,
          q: 'Quelle liberté Sami utilise-t-il ?',
          a: 'la liberté d’expression',
          wrong: [
            { label: 'la liberté de culte', why: 'Sami ne parle pas de religion.' },
            { label: 'le devoir de payer l’impôt', why: 'Le texte ne parle pas d’argent.' },
          ],
          explain: 'Donner son avis, c’est la liberté d’expression.',
        },
        {
          ...P.limites,
          q: 'Pourquoi l’élève qui coupe la parole pose-t-il un problème ?',
          a: 'il empêche les autres d’utiliser leur liberté',
          wrong: [
            {
              label: 'personne n’a le droit de parler en classe',
              why: 'Sami et Jade parlent tout à fait normalement.',
            },
            { label: 'les enfants n’ont aucun droit', why: 'Les enfants ont des droits.' },
          ],
          explain: 'La liberté des uns ne doit pas gêner celle des autres.',
        },
      ],
    },
    {
      title: 'La carte électorale',
      lines: [
        'Un adulte reçoit sa carte électorale.',
        'On peut lire : « Voter est un droit, c’est aussi un devoir civique. »',
        'Il ira aux urnes dimanche.',
      ],
      qs: [
        {
          ...P.civique,
          q: 'D’après la carte, qu’est-ce que voter ?',
          a: 'un droit et un devoir civique',
          wrong: [
            { label: 'seulement un jeu', why: 'La carte parle d’un droit et d’un devoir.' },
            { label: 'un privilège réservé au maire', why: 'Les citoyens votent, pas seulement le maire.' },
          ],
          explain: 'Voter est à la fois un droit et un devoir.',
        },
        {
          ...P.libertes,
          q: 'Sous quelle République cet adulte vote-t-il aujourd’hui ?',
          a: 'la Ve République',
          wrong: [
            { label: 'la Ire République', why: 'La première République date de la Révolution.' },
            { label: 'l’Empire', why: 'Un Empire n’est pas une République.' },
          ],
          explain: 'Aujourd’hui, nous sommes sous la Ve République.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : le droit de vote des femmes ———

const vote: Notion = {
  id: 'hcm2-vote-femmes',
  title: 'Le droit de vote des femmes',
  hint: 'Relis le mémo : cherche l’année de la grande décision et celle du premier vote.',
  memo: [
    'En 1848, le **suffrage universel** est instauré pour les hommes seulement : les femmes attendent encore.',
    'Des femmes comme Hubertine Auclert se battent : en 1881, elle lance le journal La Citoyenne. La Chambre des députés dit oui en 1919, mais le Sénat refuse d’examiner le texte en 1922.',
    'Le 21 avril 1944, les femmes deviennent **électrices** : comme les hommes, chacune est aussi **éligible**. Elles votent pour la première fois en 1945.',
  ],
  faits: [
    {
      ...P.ordonnance,
      q: 'En quelle année les femmes obtiennent-elles le droit de vote en France ?',
      a: '1944',
      wrong: [
        { label: '1789', why: '1789 est le début de la Révolution : les femmes ne votent pas encore.' },
        { label: '1848', why: '1848 donne le suffrage aux hommes seulement.' },
        { label: '1892', why: '1892 est le centenaire de la République.' },
      ],
      gap: ['Les femmes obtiennent le droit de vote en ', '.', ['1944']],
      explain: 'L’ordonnance du 21 avril 1944 donne le droit de vote aux femmes.',
    },
    {
      ...P.ordonnance,
      q: 'Avec la décision de 1944, les femmes deviennent électrices et …',
      a: 'éligibles',
      wrong: [
        { label: 'reines', why: 'La France est une République : on n’y devient pas reine.' },
        { label: 'dispensées d’impôt', why: 'La décision parle du droit de vote et d’être élue.' },
        { label: 'obligées de se marier', why: 'La décision ne parle pas de mariage.' },
      ],
      gap: ['Les femmes sont électrices et ', '.', ['éligibles', 'eligibles']],
      explain: 'Éligibles : elles peuvent aussi être élues.',
    },
    {
      ...P.hommes1848,
      q: 'En 1848, à qui le suffrage universel est-il donné ?',
      a: 'aux hommes',
      wrong: [
        { label: 'aux femmes', why: 'Les femmes n’obtiennent le vote qu’en 1944.' },
        { label: 'aux femmes et aux enfants', why: 'Ni les femmes ni les enfants ne votent en 1848.' },
        { label: 'aux rois', why: 'Le suffrage est donné aux citoyens hommes, pas aux rois.' },
      ],
      gap: ['En 1848, le suffrage universel est réservé aux ', '.', ['hommes']],
      explain: 'En 1848, il est « universel » mais seulement masculin.',
    },
    {
      ...P.national1945,
      q: 'En quelle année les femmes votent-elles pour la première fois ?',
      a: '1945',
      wrong: [
        { label: '1848', why: '1848 : seuls les hommes votent.' },
        { label: '1919', why: 'En 1919, les députés disent oui, mais la loi n’aboutit pas.' },
        { label: '1965', why: 'C’est plus tard : le premier vote des femmes a lieu avant.' },
      ],
      gap: ['Le premier vote des femmes a lieu en ', '.', ['1945']],
      explain: 'Les premiers votes des femmes ont lieu en 1945.',
    },
    {
      ...P.auclert,
      q: 'Quelle femme lance le journal La Citoyenne en 1881 ?',
      a: 'Hubertine Auclert',
      wrong: [
        { label: 'Anne de Bretagne', why: 'Anne de Bretagne vit au temps des rois, bien avant.' },
        { label: 'Aliénor d’Aquitaine', why: 'Aliénor d’Aquitaine vit au Moyen Âge.' },
        { label: 'Catherine de Médicis', why: 'Catherine de Médicis vit au temps des rois.' },
      ],
      gap: ['En 1881, Hubertine ', ' lance La Citoyenne.', ['Auclert']],
      explain: 'Hubertine Auclert se bat pour les droits des femmes.',
    },
    {
      ...P.senat1922,
      q: 'En 1922, quelle assemblée refuse d’examiner le texte sur le vote des femmes ?',
      a: 'le Sénat',
      wrong: [
        { label: 'la Chambre des députés', why: 'La Chambre des députés a dit oui en 1919 : ce n’est pas elle.' },
        { label: 'le conseil municipal', why: 'Le texte était examiné au Parlement, pas à la mairie.' },
        { label: 'l’école', why: 'L’école ne vote pas les lois.' },
      ],
      gap: [
        'En 1922, le ',
        ' refuse d’examiner le texte sur le vote des femmes.',
        ['Sénat', 'sénat', 'Senat', 'senat'],
      ],
      explain: 'Le Sénat bloque la proposition de loi.',
    },
  ],
  paires3: [
    ['1848', 'Les hommes obtiennent le suffrage universel'],
    ['1944', 'Les femmes deviennent électrices'],
    ['1945', 'Premier vote des femmes'],
  ],
  paires5: [
    ['1848', 'Les hommes obtiennent le suffrage universel'],
    ['1881', 'Lancement du journal La Citoyenne'],
    ['1919', 'Les députés votent un texte pour le vote des femmes'],
    ['1944', 'Les femmes deviennent électrices'],
    ['1945', 'Premier vote des femmes'],
  ],
  frise: [
    { ...P.hommes1848, label: 'Les hommes obtiennent le suffrage universel', date: '1848' },
    {
      ...P.chambre1919,
      label: 'Les députés votent pour la première fois un texte pour le vote des femmes',
      date: '1919',
    },
    { ...P.ordonnance, label: 'Les femmes deviennent électrices et éligibles', date: '1944' },
    { ...P.national1945, label: 'Premier vote des femmes dans tout le pays', date: '1945' },
  ],
  libres: [
    {
      ...P.ordonnance,
      q: 'En quelle année les femmes obtiennent-elles le droit de vote ? (quatre chiffres)',
      accepted: ['1944'],
      traps: [
        { text: '1848', why: 'En 1848, seuls les hommes obtiennent le suffrage universel.' },
        { text: '1945', why: '1945 est le premier vote ; le droit est donné l’année d’avant.' },
      ],
      explain: 'Le droit de vote des femmes date de 1944.',
    },
    {
      ...P.ordonnance,
      q: 'Une personne qui peut être élue est dite … (un mot).',
      accepted: ['éligible', 'eligible', 'éligibles', 'eligibles'],
      traps: [
        { text: 'électrice', why: 'Une électrice vote. Ici, on parle d’être élue.' },
        { text: 'élue', why: 'Une élue a déjà gagné. On cherche le mot « qui peut être élue ».' },
      ],
      explain: 'Éligible : on peut être élu.',
    },
    {
      ...P.municipales1945,
      q: 'En quelle année les femmes votent-elles pour la première fois, aux élections municipales ? (quatre chiffres)',
      accepted: ['1945'],
      traps: [
        { text: '1944', why: '1944 donne le droit ; le premier vote vient l’année suivante.' },
        { text: '1892', why: '1892 est le centenaire de la République.' },
      ],
      explain: 'Les premières élections avec les femmes ont lieu en 1945.',
    },
    {
      ...P.auclert,
      q: 'Quel est le nom de famille d’Hubertine, qui lance le journal La Citoyenne ?',
      accepted: ['Auclert', 'Hubertine Auclert'],
      traps: [
        { text: 'Weiss', why: 'Louise Weiss est une autre militante, plus tard.' },
        { text: 'Ferry', why: 'Jules Ferry est connu pour l’école.' },
      ],
      explain: 'Il s’agit d’Hubertine Auclert.',
    },
  ],
  docs: [
    {
      title: 'Le souvenir d’une électrice',
      lines: [
        'Avant 1944, je ne pouvais pas voter.',
        'Mon mari, lui, allait voter.',
        'En 1945, j’ai glissé mon premier bulletin dans l’urne.',
      ],
      qs: [
        {
          ...P.national1945,
          q: 'Quel changement le texte montre-t-il ?',
          a: 'les femmes peuvent désormais voter',
          wrong: [
            {
              label: 'les hommes perdent le droit de vote',
              why: 'Le mari votait déjà : rien ne dit qu’il perd ce droit.',
            },
            { label: 'les enfants votent en 1945', why: 'Le texte parle d’une femme adulte.' },
          ],
          explain: 'La décision de 1944 permet aux femmes de voter, dès 1945.',
        },
        {
          ...P.hommes1848,
          q: 'Depuis quelle année les hommes avaient-ils le suffrage universel ?',
          a: '1848',
          wrong: [
            { label: '1944', why: '1944 est l’année du droit de vote des femmes.' },
            { label: '1945', why: '1945 est l’année du premier vote des femmes.' },
          ],
          explain: 'Le suffrage universel masculin date de 1848.',
        },
      ],
    },
    {
      title: 'Une longue attente',
      lines: [
        'Hubertine Auclert écrit dans son journal pour défendre les femmes.',
        'Des années plus tard, des députés votent un texte pour le vote des femmes.',
        'Le Sénat ne suit pas : il faut attendre 1944.',
      ],
      qs: [
        {
          ...P.combats,
          q: 'Que montre cette histoire sur les droits des femmes ?',
          a: 'ils ont été obtenus après de longs combats',
          wrong: [
            { label: 'ils ont toujours existé', why: 'Le texte montre qu’il a fallu attendre et lutter.' },
            {
              label: 'tout le monde était d’accord dès le début',
              why: 'Le Sénat n’a pas suivi : il y avait des désaccords.',
            },
          ],
          explain: 'L’égalité des droits est le résultat de combats.',
        },
        {
          ...P.senat1922,
          q: 'Qui bloque le texte voté par les députés ?',
          a: 'le Sénat',
          wrong: [
            { label: 'Hubertine Auclert', why: 'Elle défend le vote des femmes.' },
            { label: 'l’instituteur', why: 'Le texte ne parle pas d’école.' },
          ],
          explain: 'Le Sénat ne suit pas les députés.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [centenaire, ecole, democratie, vote];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'CM2'));
