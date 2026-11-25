import type { Skill } from '../types.ts';
import { notion, type Citation, type Notion } from './kit.ts';

/**
 * 6e, « Apprendre à vivre dans une société démocratique » (lot em-6e-01). Chaque fait cite le programme d'EMC du
 * 13 juin 2024 (registre `emc-2024`) ou une page de vie-publique.fr, avec sa citation exacte (pages relevées sur
 * leurs copies d’archive web.archive.org). La notion
 * « citoyenneté » porte la partie « Représenter les autres et servir l'intérêt général » du programme ;
 * « institutions de proximité » en reprend les échelles de représentation (collège, commune, département, région).
 * La vie privée relève du lot em-6e-02. Les textes à lire du niveau 5 sont écrits pour l'exercice.
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 6e : « Apprendre à vivre dans une société démocratique »';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 6e.';

/** Citation d'une fiche du registre des sources, publiée par vie-publique.fr. */
const vp =
  (id: string) =>
  (quote: string): Citation => ({ quote, from: { id, label: 'le site Vie publique' } });
const prog = (quote: string): Citation => ({ quote });

const citoyen = vp('vie-publique-citoyen');
const journeeLaicite = vp('vie-publique-laicite-journee');
const chronoLaicite = vp('vie-publique-laicite-chrono');
const commune = vp('vie-publique-commune');
const conseilMunicipal = vp('vie-publique-conseil-municipal');
const departement = vp('vie-publique-departement');
const conseilDepartemental = vp('vie-publique-conseil-departemental');
const conseilRegional = vp('vie-publique-conseil-regional');
const cide = vp('vie-publique-cide');
const libertesLaicite = vp('vie-publique-laicite-liberte');

// ——— Citations exactes ———

const REPRESENTANTS = prog(
  'Les représentantes et représentants, choisis par un vote, portent la parole des autres, participent à des délibérations collectives et à la prise de décision',
);
const ECHELLES = prog(
  'à toutes les échelles (classe, collège, commune, département, région, pays, Union européenne), ils répondent à des besoins collectifs : éducation, santé, secours, transport, enjeux du développement durable et de la transition écologique',
);
const INTERET = prog(
  'l’intérêt général est l’intérêt commun de tous les membres de la société. Il n’est pas toujours compatible avec les intérêts de chacun',
);
const GENERATIONS = prog(
  'dans une perspective de développement durable, la définition de l’intérêt général prend en compte les générations futures',
);
const RESPONSABLES = prog(
  'les représentants élus sont responsables : ils expriment la parole des électeurs et suivent les règles des assemblées et des conseils dans lesquels ils sont élus',
);
const NATIONALITE_CITOYEN = citoyen('le citoyen français a nécessairement la nationalité française');
const DROITS_POLITIQUES = citoyen('des droits politiques : droit de voter, de se présenter à une élection');
const IMPOTS = citoyen("payer ses impôts (afin de participer au financement des charges supportées par l'État)");
const ETRANGERS = citoyen(
  "le droit de vote est réservé aux citoyens français et, pour certaines élections, aux ressortissants des pays de l'Union européenne",
);

const GARANTIE = prog(
  'La laïcité garantit la liberté de conscience et l’égalité de toutes les citoyennes et tous les citoyens, quelles que soient leurs croyances ou opinions',
);
const NEUTRALITE = prog(
  'la neutralité de l’État à l’égard des religions et le libre exercice des cultes (loi de 1905)',
);
const CONSCIENCE = prog(
  'la liberté de conscience est celle de croire, celle de ne pas croire, celle aussi de changer de croyance ou de religion',
);
const JURIDIQUE = prog('la laïcité est un principe juridique et non une opinion');
const ESPACE_NEUTRE = prog('elle crée un espace neutre à l’abri des prosélytismes');
const REGLES_SCOLAIRES = prog('la laïcité impose des règles à tous les membres de la communauté scolaire');
const JOURNEE_LAICITE = prog(
  'La Journée de la laïcité du 9 décembre est l’occasion de valoriser les projets conduits sur ce thème',
);
const LOI_1905 = journeeLaicite(
  "Le 9 décembre est la date anniversaire de la promulgation de la loi de 1905 concernant la séparation des Églises et de l'État",
);
const ARTICLE_2 = journeeLaicite('la République ne reconnaît, ne salarie ni ne subventionne aucun culte');
const LOI_2004 = chronoLaicite(
  'Dans les écoles, les collèges et les lycées publics, le port de signes ou tenues par lesquels les élèves manifestent ostensiblement une appartenance religieuse est interdit',
);
const DIALOGUE = chronoLaicite(
  "la mise en œuvre d'une procédure disciplinaire est précédée d'un dialogue avec l'élève",
);
const DISCRETS = libertesLaicite("les signes discrets d'appartenance religieuse restent autorisés");

const COMMUNE_PETITE = commune('La commune est la collectivité qui agit sur le plus petit territoire');
const GESTION_COMMUNE = commune('elles sont gérées par le conseil municipal et par le maire');
const ELECTION_MAIRE = commune('Le maire est élu par le conseil municipal');
const ECOLES = commune('gestion des écoles élémentaires et maternelles');
const ASSEMBLEE_MUNICIPALE = conseilMunicipal(
  "Le conseil municipal est l'assemblée des élus représentant les habitants de la commune",
);
const BUDGET = conseilMunicipal('vote le budget, approuve le compte administratif');
const COLLEGES = departement('la construction, l’entretien et l’équipement des collèges');
const SECOURS = departement(
  'Le service départemental d’incendie et de secours (SDIS) est chargé de la protection contre les incendies',
);
const SIX_ANS = conseilDepartemental('conseillers départementaux élus pour six ans');
const LYCEES = conseilRegional('construction, entretien et équipement des lycées');
const TRANSPORT = conseilRegional('le transport , qui est désormais le premier poste budgétaire des régions');
const COLLEGE_INSTANCES = prog(
  'À partir des missions du délégué de classe et des autres fonctions représentatives au collège (éco-délégués, représentants au conseil de la vie collégienne)',
);

const ADOPTION = cide(
  'La Convention internationale des droits de l’enfant (CIDE) a été adoptée le 20 novembre 1989 aux Nations unies',
);
const DEFINITION_ENFANT = cide('tout être humain âgé de moins de 18 ans');
const FRANCE_RATIFIE = cide('ratifier la Convention, le 7 août 1990');
const CONTRAIGNANT = cide('La CIDE est un texte contraignant pour les États qui l’ont ratifiée');
const RESPONSABILITE_ETATS = cide('Ces derniers sont directement responsables du respect des droits des enfants');
const EDUCATION = cide('le droit à l’éducation');
const OPINIONS = cide("le respect des opinions de l'enfant sur toute question qui le concerne");
const NOM = cide('le droit d’avoir un nom, une nationalité, une identité');
const VIOLENCE = cide(
  'le droit d’être protégé de la violence, de la maltraitance et de toute forme d’abus et d’exploitation',
);
const LOISIRS = cide('le droit de jouer et d’avoir des loisirs');
const JOURNEE = cide('chaque 20 novembre, la journée internationale des droits de l’enfant est célébrée');
const DEVOIRS = prog(
  'définir ce que sont des droits, notamment la liberté de conscience, et expliquer que des devoirs découlent de ces droits',
);

// ——— Notion 1 : la citoyenneté ———

const citoyennete: Notion = {
  id: 'em6-citoyennete',
  title: 'La citoyenneté : élire, représenter, servir l’intérêt général',
  hint: 'Distingue celui qui vote, celui qui représente, et le but visé : l’intérêt de tous.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Un **citoyen** français a la **nationalité** française : il a des **droits politiques** (voter, être candidat) et des devoirs, comme payer ses **impôts**.',
    'Les **représentants**, choisis par un **vote**, portent la parole des autres et participent aux **délibérations**. Ils sont responsables devant ceux qui les ont élus.',
    'Ils visent l’**intérêt général**, l’intérêt commun de tous, générations futures comprises. Exemple : ton **délégué** de classe parle pour la classe, pas seulement pour ses amis.',
  ],
  faits: [
    {
      ...REPRESENTANTS,
      q: 'Dans une démocratie représentative, quel est le rôle d’un représentant ?',
      a: 'porter la parole des autres et participer aux décisions',
      wrong: [
        {
          label: 'décider seul selon ses goûts',
          why: 'Un représentant parle pour les autres, pas seulement pour lui.',
        },
        {
          label: 'punir ceux qui n’ont pas voté pour lui',
          why: 'Un représentant ne punit pas : il porte la parole et délibère.',
        },
        {
          label: 'défendre uniquement ses amis',
          why: 'Il représente tous ceux au nom de qui il a été choisi.',
        },
      ],
      gap: ['Les représentants, choisis par un ', ', portent la parole des autres.', ['vote', 'scrutin']],
      explain: 'Choisi par un vote, le représentant parle au nom des autres et participe aux décisions collectives.',
    },
    {
      ...INTERET,
      q: 'Qu’est-ce que l’intérêt général ?',
      a: 'l’intérêt commun de tous les membres de la société',
      wrong: [
        { label: 'l’intérêt de la personne la plus riche', why: 'La richesse ne fait pas l’intérêt de tous.' },
        {
          label: 'la somme des envies de chacun',
          why: 'L’intérêt général n’est pas toujours compatible avec les intérêts de chacun.',
        },
        {
          label: 'l’intérêt du groupe le plus bruyant',
          why: 'Un groupe ne représente pas à lui seul tous les membres de la société.',
        },
      ],
      gap: ['L’intérêt ', ' est l’intérêt commun de tous les membres de la société.', ['général', 'general']],
      explain: 'L’intérêt général dépasse les envies particulières : il concerne tous les membres de la société.',
    },
    {
      ...GENERATIONS,
      q: 'Dans une perspective de développement durable, qui l’intérêt général prend-il aussi en compte ?',
      a: 'les générations futures',
      wrong: [
        {
          label: 'seulement les adultes d’aujourd’hui',
          why: 'Le développement durable pense aussi à ceux qui viendront après.',
        },
        { label: 'seulement les élus', why: 'Les élus servent la société entière.' },
        {
          label: 'seulement les électeurs',
          why: 'Ceux qui ne votent pas encore, ou pas encore nés, comptent aussi.',
        },
      ],
      gap: ['L’intérêt général prend en compte les ', ' futures.', ['générations', 'generations']],
      explain: 'Protéger l’environnement aujourd’hui, c’est aussi penser aux personnes qui vivront demain.',
    },
    {
      ...RESPONSABLES,
      q: 'Les représentants élus sont responsables. Que doivent-ils faire ?',
      a: 'exprimer la parole des électeurs et suivre les règles de leur assemblée',
      wrong: [
        { label: 'faire ce qu’ils veulent après l’élection', why: 'L’élection ne libère pas des règles.' },
        {
          label: 'changer les règles de leur conseil quand ils le souhaitent seuls',
          why: 'Un élu suit les règles de son conseil, il ne les décide pas seul.',
        },
        {
          label: 'obéir seulement à un ami influent',
          why: 'L’élu exprime la parole des électeurs, pas celle d’une personne.',
        },
      ],
      gap: [
        'Les représentants élus expriment la parole des ',
        ' et suivent les règles de leur assemblée.',
        ['électeurs', 'electeurs', 'électrices et électeurs'],
      ],
      explain: 'Être responsable, c’est rendre fidèlement la parole des électeurs en respectant les règles.',
    },
    {
      ...NATIONALITE_CITOYEN,
      q: 'Quelle condition faut-il remplir pour avoir le statut de citoyen français ?',
      a: 'avoir la nationalité française',
      wrong: [
        { label: 'être propriétaire d’une maison', why: 'Être propriétaire n’est pas une condition de citoyenneté.' },
        { label: 'habiter Paris', why: 'La ville où l’on habite ne change pas ce statut.' },
        {
          label: 'payer des impôts, quelle que soit sa nationalité',
          why: 'Un étranger paie aussi des impôts : cela ne fait pas de lui un citoyen français.',
        },
      ],
      gap: ['Le citoyen français a nécessairement la ', ' française.', ['nationalité', 'nationalite']],
      explain: 'La nationalité française donne le statut juridique de citoyen, avec des droits et des devoirs.',
    },
    {
      ...DROITS_POLITIQUES,
      q: 'Lequel de ces droits est un droit politique ?',
      a: 'se présenter à une élection',
      wrong: [
        { label: 'aller à l’école', why: 'Le droit à l’éducation est un droit social.' },
        { label: 'se marier', why: 'Se marier est un droit civil.' },
        { label: 'être propriétaire', why: 'Être propriétaire est un droit civil.' },
      ],
      gap: ['Voter et se présenter à une élection sont des droits ', '.', ['politiques', 'politique']],
      explain: 'Les droits politiques permettent de participer à la vie publique : voter et être candidat.',
    },
    {
      ...IMPOTS,
      q: 'À quoi servent les impôts que le citoyen doit payer ?',
      a: 'à financer les charges supportées par l’État',
      wrong: [
        { label: 'à acheter le droit de vote', why: 'Le droit de vote ne s’achète pas.' },
        {
          label: 'à payer ses propres loisirs',
          why: 'L’impôt finance des charges collectives, pas des achats personnels.',
        },
        {
          label: 'à rémunérer seulement les candidats aux élections',
          why: 'L’impôt finance l’ensemble des charges de l’État.',
        },
      ],
      gap: ['Payer ses ', ' est un devoir du citoyen.', ['impôts', 'impots', 'impôt', 'impot']],
      explain: 'Les impôts permettent de participer au financement des dépenses de l’État, au service de tous.',
    },
    {
      ...ETRANGERS,
      avance: true,
      q: 'À qui le droit de vote est-il réservé en France ?',
      a: 'aux citoyens français et, pour certaines élections, à des citoyens de l’Union européenne',
      wrong: [
        { label: 'à toute personne qui visite la France', why: 'Un visiteur ne vote pas en France.' },
        {
          label: 'aux seuls habitants de la capitale',
          why: 'Le droit de vote ne dépend pas de la ville habitée.',
        },
        {
          label: 'à tous les habitants, quels que soient leur nationalité et le scrutin',
          why: 'Un étranger résidant en France ne jouit pas pleinement des droits politiques.',
        },
      ],
      gap: [
        'Pour certaines élections, les ressortissants de l’Union ',
        ' peuvent aussi voter en France.',
        ['européenne', 'europeenne'],
      ],
      explain: 'Le vote est lié à la citoyenneté, avec une ouverture à l’Union européenne pour certains scrutins.',
    },
  ],
  paires3: [
    ['Intérêt général', 'L’intérêt commun de tous'],
    ['Représentant', 'Celui qui porte la parole des autres'],
    ['Impôt', 'Argent versé pour financer des dépenses collectives'],
  ],
  paires5: [
    ['Intérêt général', 'L’intérêt commun de tous'],
    ['Représentant', 'Celui qui porte la parole des autres'],
    ['Impôt', 'Argent versé pour financer des dépenses collectives'],
    ['Vote', 'Moyen de choisir ses représentants'],
    ['Nationalité française', 'Condition pour être citoyen français'],
  ],
  libres: [
    {
      ...INTERET,
      q: 'Comment appelle-t-on l’intérêt commun de tous les membres de la société ? (deux mots)',
      accepted: ['intérêt général', 'l’intérêt général', 'interet general'],
      traps: [
        { text: 'intérêt particulier', why: 'L’intérêt particulier est celui d’une personne ou d’un petit groupe.' },
        { text: 'intérêt personnel', why: 'L’intérêt personnel ne concerne qu’une personne.' },
      ],
      explain: 'On parle d’intérêt général quand le but est le bien commun de tous.',
    },
    {
      ...REPRESENTANTS,
      q: 'Par quel moyen les représentants sont-ils choisis ? (un mot)',
      accepted: ['vote', 'le vote', 'un vote', 'scrutin', 'élection', 'élections', 'une élection'],
      traps: [
        { text: 'tirage au sort', why: 'Le programme parle de représentants choisis par un vote.' },
        { text: 'impôt', why: 'L’impôt finance des dépenses : il ne désigne personne.' },
      ],
      explain: 'Les représentants sont choisis par un vote.',
    },
    {
      ...NATIONALITE_CITOYEN,
      q: 'Quel lien juridique avec la France faut-il avoir pour être citoyen français ? (un mot)',
      accepted: ['nationalité', 'la nationalité', 'nationalité française', 'la nationalité française'],
      traps: [
        { text: 'résidence', why: 'Résider en France ne suffit pas pour être citoyen français.' },
        { text: 'impôt', why: 'Payer l’impôt est un devoir, pas ce qui fait la citoyenneté.' },
      ],
      explain: 'Le citoyen français a la nationalité française.',
    },
  ],
  docs: [
    {
      title: 'Le choix des délégués',
      lines: [
        'La classe de 6e B élit ses deux délégués.',
        'Noa propose : « Je ne demanderai des casiers neufs que pour mes amis. »',
        'Inès répond : « Je porterai les demandes de toute la classe au conseil. »',
        'Les élèves votent, puis Inès est élue. Noa dit qu’il l’aidera à recueillir les idées.',
      ],
      qs: [
        {
          ...REPRESENTANTS,
          q: 'Quelle promesse correspond au rôle d’une représentante ?',
          a: 'porter les demandes de toute la classe',
          wrong: [
            { label: 'servir seulement ses amis', why: 'Une représentante parle pour toute la classe.' },
            { label: 'décider sans écouter personne', why: 'Représenter, c’est porter la parole des autres.' },
            { label: 'obliger les élèves à voter pour elle', why: 'Un vote doit laisser chacun libre de choisir.' },
          ],
          explain: 'Inès promet de porter la parole de tous : c’est le rôle d’une représentante.',
        },
        {
          ...INTERET,
          q: 'Pourquoi la proposition de Noa ne sert-elle pas l’intérêt général ?',
          a: 'elle ne profite qu’à ses amis',
          wrong: [
            { label: 'elle coûte forcément trop cher', why: 'Le texte ne parle pas de prix.' },
            { label: 'elle parle de casiers', why: 'Le sujet n’est pas le problème : le problème est qui en profite.' },
            { label: 'elle est faite avant le vote', why: 'Faire des propositions avant un vote est normal.' },
          ],
          explain: 'L’intérêt général est commun à tous : une mesure réservée à quelques amis ne le sert pas.',
        },
      ],
    },
    {
      title: 'Le parc du quartier',
      lines: [
        'Au conseil des jeunes, on prépare un avis sur un terrain vide.',
        'Un habitant veut un parking pour sa seule boutique.',
        'Une élue propose de planter des arbres et d’installer des bancs ouverts à tous.',
        'Elle ajoute : « Ces arbres serviront aussi à ceux qui grandiront ici plus tard. »',
      ],
      qs: [
        {
          ...GENERATIONS,
          q: 'À quoi l’élue pense-t-elle en parlant de « ceux qui grandiront ici plus tard » ?',
          a: 'aux générations futures',
          wrong: [
            { label: 'aux seuls commerçants', why: 'Elle parle de ceux qui grandiront, pas des commerçants.' },
            { label: 'aux élus d’autrefois', why: 'Elle regarde vers l’avenir, pas vers le passé.' },
            { label: 'à elle seule', why: 'Sa phrase concerne d’autres personnes, à venir.' },
          ],
          explain: 'Une décision d’intérêt général pense aussi aux générations futures.',
        },
        {
          ...INTERET,
          q: 'Quelle idée montre que l’intérêt général et l’intérêt de chacun peuvent différer ?',
          a: 'le parking voulu pour une seule boutique',
          wrong: [
            { label: 'les bancs ouverts à tous', why: 'Ces bancs profitent à tous : ils vont dans le sens commun.' },
            { label: 'le fait de préparer un avis', why: 'Préparer un avis est la manière de délibérer.' },
            { label: 'le terrain vide', why: 'Un terrain vide n’est pas un intérêt défendu par quelqu’un.' },
          ],
          explain: 'Le parking sert une seule boutique, alors que le parc profite à tous.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la laïcité ———

const laicite: Notion = {
  id: 'em6-laicite',
  title: 'La laïcité à l’École',
  hint: 'Demande-toi qui doit rester neutre, et quelle liberté est protégée.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **laïcité** garantit la **liberté de conscience** : croire, ne pas croire ou changer de religion. La loi de 1905 sépare les Églises et l’État, qui reste neutre : c’est la **neutralité**.',
    'L’école publique est un espace à l’abri du **prosélytisme** : la loi de 2004 interdit aux élèves les signes religieux portés **ostensiblement**. Exemple : une médaille discrète reste autorisée.',
    'La laïcité est un principe **juridique**, pas une opinion : elle protège le libre exercice des **cultes**.',
  ],
  faits: [
    {
      ...GARANTIE,
      q: 'Quelle liberté la laïcité garantit-elle à tous les citoyens ?',
      a: 'la liberté de conscience',
      wrong: [
        { label: 'la liberté de ne suivre aucune règle', why: 'La laïcité impose au contraire des règles communes.' },
        {
          label: 'la liberté d’imposer sa religion aux autres',
          why: 'La liberté de conscience protège chacun contre les pressions.',
        },
        {
          label: 'la liberté de choisir les lois qui s’appliquent à soi',
          why: 'La loi s’applique à tous de la même façon.',
        },
      ],
      gap: ['La laïcité garantit la liberté de ', ' et l’égalité de tous les citoyens.', ['conscience']],
      explain:
        'Chacun reste libre de ses croyances, et tous les citoyens sont égaux, quelles que soient leurs opinions.',
    },
    {
      ...CONSCIENCE,
      q: 'Que permet la liberté de conscience ?',
      a: 'de croire, de ne pas croire ou de changer de religion',
      wrong: [
        { label: 'de croire seulement à la religion de sa famille', why: 'On peut aussi changer de croyance.' },
        { label: 'de croire, mais jamais de ne pas croire', why: 'Ne pas croire est aussi protégé.' },
        {
          label: 'de choisir à la place des autres leur religion',
          why: 'La liberté de conscience appartient à chaque personne.',
        },
      ],
      gap: [
        'La liberté de conscience est celle de croire, de ne pas croire, et aussi de ',
        ' de religion.',
        ['changer'],
      ],
      explain: 'La liberté de conscience protège trois choix : croire, ne pas croire, changer.',
    },
    {
      ...NEUTRALITE,
      q: 'Selon la loi de 1905, quelle attitude l’État adopte-t-il à l’égard des religions ?',
      a: 'la neutralité',
      wrong: [
        {
          label: 'l’interdiction de toutes les religions',
          why: 'La loi garantit au contraire le libre exercice des cultes.',
        },
        { label: 'le choix d’une religion officielle', why: 'La République ne reconnaît aucun culte.' },
        {
          label: 'la préférence pour la religion la plus pratiquée',
          why: 'La neutralité ne favorise aucune religion.',
        },
      ],
      gap: ['La loi de 1905 fonde la ', ' de l’État à l’égard des religions.', ['neutralité', 'neutralite']],
      explain: 'L’État ne favorise ni ne combat aucune religion : il est neutre.',
    },
    {
      ...ARTICLE_2,
      avance: true,
      q: 'D’après l’article 2 de la loi de 1905, que fait la République vis-à-vis des cultes ?',
      a: 'elle n’en reconnaît, n’en salarie ni n’en subventionne aucun',
      wrong: [
        { label: 'elle paie les ministres de tous les cultes', why: 'L’article dit qu’elle n’en salarie aucun.' },
        { label: 'elle finance le culte majoritaire', why: 'Elle n’en subventionne aucun.' },
        { label: 'elle reconnaît un culte officiel', why: 'Elle n’en reconnaît aucun.' },
      ],
      gap: ['La République ne reconnaît, ne salarie ni ne ', ' aucun culte.', ['subventionne']],
      explain: 'C’est le principe de séparation : aucun culte n’est officiel ni financé par la République.',
    },
    {
      ...LOI_1905,
      q: 'Sur quoi porte la loi du 9 décembre 1905 ?',
      a: 'la séparation des Églises et de l’État',
      wrong: [
        {
          label: 'le droit de vote aux élections',
          why: 'La loi de 1905 traite des religions et de l’État, pas du vote.',
        },
        {
          label: 'la protection des droits de l’enfant',
          why: 'Les droits de l’enfant relèvent d’un autre texte, la Convention internationale.',
        },
        {
          label: 'le choix d’une religion officielle',
          why: 'C’est l’inverse : la République ne reconnaît aucun culte.',
        },
      ],
      gap: ['La loi de 1905 concerne la ', ' des Églises et de l’État.', ['séparation', 'separation']],
      explain: 'La loi du 9 décembre 1905 sépare les Églises et l’État ; le 9 décembre est la journée de la laïcité.',
    },
    {
      ...LOI_2004,
      q: 'Dans les collèges publics, que la loi de 2004 interdit-elle aux élèves ?',
      a: 'les signes religieux portés de façon ostensible',
      wrong: [
        { label: 'de croire en une religion', why: 'La liberté de conscience reste entière.' },
        { label: 'tout vêtement de couleur', why: 'La loi ne vise pas les couleurs mais les signes religieux.' },
        { label: 'tout signe religieux, même discret', why: 'Les signes discrets restent autorisés.' },
      ],
      gap: [
        'Dans les collèges publics, les signes qui manifestent ',
        ' une appartenance religieuse sont interdits aux élèves.',
        ['ostensiblement'],
      ],
      explain: 'La loi de 2004 interdit ce qui manifeste ostensiblement, c’est-à-dire très visiblement, une religion.',
    },
    {
      ...DISCRETS,
      avance: true,
      q: 'Qu’en est-il des signes religieux discrets portés par un élève ?',
      a: 'ils restent autorisés',
      wrong: [
        { label: 'ils sont interdits comme tous les signes', why: 'La loi vise les signes ostensibles.' },
        { label: 'ils sont autorisés seulement le mercredi', why: 'La loi ne fixe pas de jour.' },
        {
          label: 'ils sont réservés aux adultes',
          why: 'La loi concerne les élèves, et les signes discrets leur restent permis.',
        },
      ],
      gap: ['Les signes ', ' d’appartenance religieuse restent autorisés pour les élèves.', ['discrets', 'discret']],
      explain: 'Seuls les signes portés de façon ostensible sont interdits.',
    },
    {
      ...DIALOGUE,
      avance: true,
      q: 'Avant une procédure disciplinaire liée à la loi de 2004, que prévoit le texte ?',
      a: 'un dialogue avec l’élève',
      wrong: [
        { label: 'une exclusion immédiate', why: 'La loi demande d’abord un échange.' },
        { label: 'une amende pour la famille', why: 'La loi ne parle pas d’amende : elle prévoit un dialogue.' },
        { label: 'un vote de la classe', why: 'La classe ne vote pas sur le cas d’un élève.' },
      ],
      gap: ['La procédure disciplinaire est précédée d’un ', ' avec l’élève.', ['dialogue']],
      explain: 'On commence par discuter avec l’élève avant toute sanction.',
    },
    {
      ...JURIDIQUE,
      q: 'Qu’est-ce que la laïcité ?',
      a: 'un principe juridique',
      wrong: [
        { label: 'une religion', why: 'La laïcité n’est pas une croyance.' },
        { label: 'une opinion personnelle', why: 'C’est une règle de droit, pas une opinion.' },
        {
          label: 'l’athéisme',
          why: 'L’athéisme est une option philosophique personnelle, différente de la laïcité.',
        },
      ],
      gap: ['La laïcité est un principe ', ' et non une opinion.', ['juridique']],
      explain: 'La laïcité est inscrite dans le droit : elle diffère des convictions personnelles.',
    },
  ],
  paires3: [
    ['Liberté de conscience', 'Croire, ne pas croire ou changer'],
    ['Neutralité de l’État', 'Ne favoriser aucune religion'],
    ['Loi de 1905', 'Séparation des Églises et de l’État'],
  ],
  paires5: [
    ['Liberté de conscience', 'Croire, ne pas croire ou changer'],
    ['Neutralité de l’État', 'Ne favoriser aucune religion'],
    ['Loi de 1905', 'Séparation des Églises et de l’État'],
    ['Loi de 2004', 'Signes religieux ostensibles interdits aux élèves'],
    ['9 décembre', 'Journée de la laïcité'],
  ],
  libres: [
    {
      ...JOURNEE_LAICITE,
      q: 'Quel jour de l’année célèbre-t-on la journée de la laïcité à l’École ? (jour et mois)',
      accepted: ['9 décembre', 'le 9 décembre', '9 decembre', '09/12', '9/12'],
      traps: [
        { text: '14 juillet', why: 'Le 14 juillet est la fête nationale.' },
        { text: '20 novembre', why: 'Le 20 novembre est la journée des droits de l’enfant.' },
      ],
      explain: 'Le 9 décembre rappelle la loi de 1905.',
    },
    {
      ...GARANTIE,
      q: 'Quelle liberté la laïcité garantit-elle : la liberté de … ? (un mot)',
      accepted: ['conscience', 'la conscience', 'liberté de conscience', 'la liberté de conscience'],
      traps: [
        { text: 'circulation', why: 'La liberté de circulation est un autre droit.' },
        { text: 'la presse', why: 'La liberté de la presse concerne les journaux.' },
      ],
      explain: 'La laïcité protège la liberté de conscience.',
    },
    {
      ...ESPACE_NEUTRE,
      q: 'Quel mot désigne les pressions pour convertir quelqu’un, dont l’école protège les élèves ? (commence par « pro »)',
      accepted: ['prosélytisme', 'proselytisme', 'le prosélytisme', 'prosélytismes'],
      traps: [
        {
          text: 'protection',
          why: 'La protection est le but de l’école, pas la pression contre laquelle elle protège.',
        },
        { text: 'programme', why: 'Le programme dit ce qu’on apprend.' },
      ],
      explain: 'Le prosélytisme cherche à convaincre d’adopter une religion : l’école laïque en protège les élèves.',
    },
  ],
  docs: [
    {
      title: 'Le règlement intérieur',
      lines: [
        'Yanis entre en 6e et lit le règlement intérieur de son collège public.',
        'Il porte sous son pull une petite médaille que sa grand-mère lui a offerte.',
        'Un camarade lui dit : « Tu dois croire comme moi, sinon tu n’es pas mon ami. »',
        'La conseillère rappelle que chacun reste libre de croire ou de ne pas croire.',
      ],
      qs: [
        {
          ...DISCRETS,
          q: 'La médaille de Yanis est-elle permise par la loi de 2004 ?',
          a: 'oui, car c’est un signe discret',
          wrong: [
            { label: 'non, tout signe est interdit', why: 'Les signes discrets restent autorisés.' },
            { label: 'non, seuls les adultes peuvent en porter', why: 'La loi permet les signes discrets aux élèves.' },
            { label: 'oui, parce qu’un cadeau est toujours permis', why: 'Ce qui compte est la discrétion du signe.' },
          ],
          explain: 'Cachée sous le pull, la médaille ne manifeste pas ostensiblement une religion.',
        },
        {
          ...ESPACE_NEUTRE,
          q: 'Pourquoi la remarque du camarade pose-t-elle problème au collège public ?',
          a: 'elle fait pression sur Yanis au sujet de ses croyances',
          wrong: [
            { label: 'elle critique le règlement intérieur', why: 'La remarque ne parle pas du règlement.' },
            { label: 'elle concerne la couleur de son pull', why: 'La remarque concerne les croyances.' },
            { label: 'elle l’empêche de rentrer chez lui', why: 'Il n’est pas question de se déplacer.' },
          ],
          explain: 'Faire pression pour qu’un élève croie comme soi, c’est du prosélytisme, que l’école doit empêcher.',
        },
      ],
    },
    {
      title: 'Une question au conseil de classe',
      lines: [
        'En classe, Lou demande : « La laïcité veut-elle dire que la religion est interdite en France ? »',
        'La professeure explique que l’État ne reconnaît aucun culte.',
        'Elle précise que chacun peut pratiquer librement le sien, dans le cadre de la loi.',
        'Au collège public, les mêmes règles s’appliquent à tous les membres de la communauté scolaire.',
      ],
      qs: [
        {
          ...NEUTRALITE,
          q: 'Quelle réponse corrige l’idée de Lou ?',
          a: 'les cultes peuvent s’exercer librement et l’État reste neutre',
          wrong: [
            {
              label: 'toutes les religions sont interdites',
              why: 'La professeure dit que chacun peut pratiquer le sien.',
            },
            { label: 'l’État choisit une seule religion', why: 'L’État ne reconnaît aucun culte.' },
            { label: 'seule la religion de la majorité est permise', why: 'La liberté concerne tous les cultes.' },
          ],
          explain: 'La laïcité associe la neutralité de l’État et le libre exercice des cultes.',
        },
        {
          ...REGLES_SCOLAIRES,
          q: 'À qui les règles de la laïcité s’appliquent-elles au collège ?',
          a: 'à tous les membres de la communauté scolaire',
          wrong: [
            {
              label: 'aux élèves de 6e seulement',
              why: 'Les règles concernent tous les membres de la communauté scolaire.',
            },
            { label: 'aux seuls élèves croyants', why: 'Les règles sont les mêmes pour tous.' },
            { label: 'à la professeure uniquement', why: 'La règle ne concerne pas qu’une personne.' },
          ],
          explain: 'La laïcité impose des règles à tous les membres de la communauté scolaire.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : les institutions de proximité ———

const institutions: Notion = {
  id: 'em6-institutions-proximite',
  title: 'Les institutions de proximité : collège, commune, département, région',
  hint: 'Repère l’échelle : le collège, la commune, le département ou la région, puis sa mission.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **commune** est la **collectivité territoriale** la plus proche : le **conseil municipal** élu la gère avec le maire, qu’il élit. Elle s’occupe des écoles primaires.',
    'Le **département** gère les collèges et les secours contre les incendies ; la **région** gère les lycées et les transports.',
    'Au collège, tu es représenté par le **délégué** de classe, l’**éco-délégué** et les élus du **conseil de la vie collégienne**. Exemple : le délégué porte la parole de la classe.',
  ],
  faits: [
    {
      ...ECHELLES,
      q: 'À quelles échelles des représentants répondent-ils à des besoins collectifs ?',
      a: 'de la classe jusqu’à l’Union européenne',
      wrong: [
        {
          label: 'seulement à l’échelle du pays',
          why: 'La représentation existe aussi plus près de toi, dès la classe.',
        },
        { label: 'seulement dans la classe', why: 'Elle existe aussi dans la commune, le pays et au-delà.' },
        { label: 'seulement dans la commune', why: 'La commune n’est qu’une échelle parmi d’autres.' },
      ],
      gap: ['À toutes les ', ', des représentants répondent à des besoins collectifs.', ['échelles', 'echelles']],
      explain:
        'Classe, collège, commune, département, région, pays, Union européenne : chaque échelle a ses représentants.',
    },
    {
      ...COMMUNE_PETITE,
      q: 'Quelle collectivité territoriale agit sur le plus petit territoire ?',
      a: 'la commune',
      wrong: [
        { label: 'la région', why: 'La région regroupe de nombreuses communes.' },
        { label: 'l’Union européenne', why: 'L’Union européenne réunit des pays entiers.' },
        { label: 'le département', why: 'Un département comprend de nombreuses communes.' },
      ],
      gap: ['La collectivité qui agit sur le plus petit territoire est la ', '.', ['commune']],
      explain: 'La commune est l’échelon le plus proche des habitants.',
    },
    {
      ...GESTION_COMMUNE,
      q: 'Qui gère la commune ?',
      a: 'le conseil municipal et le maire',
      wrong: [
        { label: 'le conseil régional et son président', why: 'Ils gèrent la région.' },
        { label: 'le conseil de classe et le principal', why: 'Ils concernent un collège.' },
        { label: 'le conseil départemental et son président', why: 'Ils gèrent le département.' },
      ],
      gap: ['La commune est gérée par le conseil ', ' et par le maire.', ['municipal']],
      explain: 'Le conseil municipal et le maire gèrent la commune.',
    },
    {
      ...ELECTION_MAIRE,
      q: 'Qui élit le maire ?',
      a: 'le conseil municipal',
      wrong: [
        { label: 'le préfet', why: 'Le maire est élu, il n’est pas désigné par le préfet.' },
        { label: 'le conseil de la vie collégienne', why: 'Ce conseil représente les collégiens.' },
        {
          label: 'les habitants, par un vote direct pour le maire',
          why: 'Les habitants élisent le conseil municipal, qui élit ensuite le maire.',
        },
      ],
      gap: ['Le maire est élu par le conseil ', '.', ['municipal']],
      explain: 'Les habitants élisent le conseil municipal, qui choisit à son tour le maire.',
    },
    {
      ...ASSEMBLEE_MUNICIPALE,
      q: 'Qu’est-ce que le conseil municipal ?',
      a: 'l’assemblée des élus qui représentent les habitants de la commune',
      wrong: [
        { label: 'une association de commerçants', why: 'Le conseil est formé d’élus.' },
        { label: 'le groupe des employés de la mairie', why: 'Les employés ne sont pas des élus.' },
        { label: 'l’assemblée des élus de la région', why: 'C’est le conseil régional.' },
      ],
      gap: ['Le conseil municipal est l’assemblée des élus représentant les ', ' de la commune.', ['habitants']],
      explain: 'Les conseillers municipaux représentent les habitants de la commune.',
    },
    {
      ...ECOLES,
      q: 'Qui gère les écoles publiques maternelles et élémentaires ?',
      a: 'la commune',
      wrong: [
        { label: 'la région', why: 'La région s’occupe des lycées.' },
        { label: 'le département', why: 'Le département s’occupe des collèges.' },
        { label: 'l’Union européenne', why: 'Ce n’est pas son rôle.' },
      ],
      gap: ['Les écoles publiques maternelles et élémentaires sont gérées par la ', '.', ['commune']],
      explain: 'Écoles : la commune ; collèges : le département ; lycées : la région.',
    },
    {
      ...COLLEGES,
      q: 'Quelle collectivité construit, entretient et équipe les collèges ?',
      a: 'le département',
      wrong: [
        { label: 'la commune', why: 'La commune gère les écoles maternelles et élémentaires.' },
        { label: 'la région', why: 'La région gère les lycées.' },
        { label: 'la classe', why: 'Une classe n’est pas une collectivité.' },
      ],
      gap: ['Les collèges sont construits et entretenus par le ', '.', ['département', 'departement']],
      explain: 'Les collèges relèvent du département.',
    },
    {
      ...LYCEES,
      q: 'Quelle collectivité s’occupe de la construction et de l’équipement des lycées ?',
      a: 'la région',
      wrong: [
        { label: 'la commune', why: 'La commune gère les écoles primaires.' },
        { label: 'le département', why: 'Le département gère les collèges.' },
        { label: 'le conseil de la vie collégienne', why: 'Ce conseil ne construit pas d’établissement.' },
      ],
      gap: ['Les lycées sont construits et équipés par la ', '.', ['région', 'region']],
      explain: 'Les lycées relèvent de la région.',
    },
    {
      ...SECOURS,
      avance: true,
      q: 'Quel service départemental est chargé de la protection contre les incendies ?',
      a: 'le service d’incendie et de secours (SDIS)',
      wrong: [
        { label: 'le centre communal d’action sociale', why: 'Ce centre aide les personnes fragiles.' },
        { label: 'le service des transports régionaux', why: 'Il concerne les déplacements.' },
        { label: 'le conseil de la vie collégienne', why: 'Il représente les élèves.' },
      ],
      gap: ['Le service départemental d’incendie et de ', ' protège contre les incendies.', ['secours']],
      explain: 'Le département organise les secours contre les incendies.',
    },
    {
      ...TRANSPORT,
      avance: true,
      q: 'Quel domaine est devenu le premier poste de dépenses des régions ?',
      a: 'le transport',
      wrong: [
        { label: 'les écoles maternelles', why: 'Les écoles maternelles relèvent de la commune.' },
        { label: 'les collèges', why: 'Les collèges relèvent du département.' },
        { label: 'les pompiers', why: 'Les secours contre l’incendie sont départementaux.' },
      ],
      gap: ['Le premier poste de dépenses des régions est le ', '.', ['transport', 'transports']],
      explain: 'Les régions consacrent leur premier budget au transport.',
    },
    {
      ...BUDGET,
      q: 'Quelle décision revient au conseil municipal ?',
      a: 'voter le budget de la commune',
      wrong: [
        { label: 'voter les lois du pays', why: 'Les lois sont votées par le Parlement.' },
        { label: 'élire le président de la République', why: 'Ce sont les citoyens qui l’élisent.' },
        { label: 'construire les lycées', why: 'Les lycées relèvent de la région.' },
      ],
      gap: ['Le conseil municipal vote le ', ' de la commune.', ['budget']],
      explain: 'Le budget prévoit les recettes et les dépenses : le conseil municipal le vote.',
    },
    {
      ...SIX_ANS,
      avance: true,
      q: 'Pour combien de temps les conseillers départementaux sont-ils élus ?',
      a: 'six ans',
      wrong: [
        { label: 'un an', why: 'Un an correspond à la durée d’une année scolaire, pas à ce mandat.' },
        { label: 'dix ans', why: 'La durée du mandat est de six ans.' },
        { label: 'toute la vie', why: 'Un mandat est limité dans le temps.' },
      ],
      gap: ['Les conseillers départementaux sont élus pour ', ' ans.', ['six', '6']],
      explain: 'Un mandat dure un temps fixé : six ans pour les conseillers départementaux.',
    },
  ],
  paires3: [
    ['Commune', 'Écoles maternelles et élémentaires'],
    ['Département', 'Collèges'],
    ['Région', 'Lycées'],
  ],
  paires5: [
    ['Commune', 'Écoles maternelles et élémentaires'],
    ['Département', 'Collèges'],
    ['Région', 'Lycées'],
    ['Conseil municipal', 'Élit le maire'],
    ['Délégué de classe', 'Porte la parole de sa classe'],
  ],
  libres: [
    {
      ...COLLEGES,
      q: 'Quelle collectivité territoriale s’occupe des bâtiments des collèges ?',
      accepted: ['département', 'le département', 'departement', 'le conseil départemental'],
      traps: [
        { text: 'la commune', why: 'La commune gère les écoles maternelles et élémentaires.' },
        { text: 'la région', why: 'La région s’occupe des lycées.' },
      ],
      explain: 'C’est le département qui construit et entretient les collèges.',
    },
    {
      ...ELECTION_MAIRE,
      q: 'Quelle assemblée élit le maire ? (deux mots)',
      accepted: ['conseil municipal', 'le conseil municipal'],
      traps: [
        { text: 'conseil régional', why: 'Le conseil régional gère la région.' },
        { text: 'conseil départemental', why: 'Le conseil départemental gère le département.' },
      ],
      explain: 'Le maire est élu par le conseil municipal.',
    },
    {
      ...LYCEES,
      q: 'Quelle collectivité territoriale s’occupe des lycées ?',
      accepted: ['région', 'la région', 'region', 'le conseil régional'],
      traps: [
        { text: 'le département', why: 'Le département s’occupe des collèges.' },
        { text: 'la commune', why: 'La commune s’occupe des écoles primaires.' },
      ],
      explain: 'La région construit et équipe les lycées.',
    },
  ],
  docs: [
    {
      title: 'Trois demandes d’habitants',
      lines: [
        'Au collège, le toit du gymnase du collège fuit.',
        'Dans le village, des parents demandent des travaux à l’école maternelle publique.',
        'Une lycéenne signale que le toit de son lycée est abîmé.',
        'Chaque demande doit être envoyée à la bonne collectivité.',
      ],
      qs: [
        {
          ...COLLEGES,
          q: 'À qui revient l’entretien du bâtiment du collège ?',
          a: 'au département',
          wrong: [
            { label: 'à la commune', why: 'La commune s’occupe des écoles maternelles et élémentaires.' },
            { label: 'à la région', why: 'La région s’occupe des lycées.' },
            { label: 'au délégué de classe', why: 'Le délégué porte la parole, il n’entretient pas les bâtiments.' },
          ],
          explain: 'L’entretien des collèges est une mission du département.',
        },
        {
          ...ECOLES,
          q: 'Qui doit examiner la demande pour l’école maternelle ?',
          a: 'la commune',
          wrong: [
            { label: 'le département', why: 'Le département s’occupe des collèges.' },
            { label: 'la région', why: 'La région s’occupe des lycées.' },
            { label: 'le conseil de la vie collégienne', why: 'Il concerne la vie au collège.' },
          ],
          explain: 'La commune gère les écoles publiques de son territoire.',
        },
        {
          ...LYCEES,
          q: 'Qui s’occupe du toit du lycée ?',
          a: 'la région',
          wrong: [
            { label: 'la commune', why: 'La commune gère les écoles maternelles et élémentaires.' },
            { label: 'le département', why: 'Le département gère les collèges.' },
            { label: 'la lycéenne', why: 'Elle signale le problème, la collectivité le traite.' },
          ],
          explain: 'La région entretient les lycées.',
        },
      ],
    },
    {
      title: 'Porter une idée au collège',
      lines: [
        'Des élèves de 6e veulent installer des bacs de tri dans la cour.',
        'Ils en parlent à leur éco-délégué et à leur délégué de classe.',
        'L’idée sera discutée avec les représentants au conseil de la vie collégienne.',
        'Un élève propose de décider seul, sans consulter personne.',
      ],
      qs: [
        {
          ...COLLEGE_INSTANCES,
          q: 'Parmi ces personnes, lesquelles représentent les élèves au collège ?',
          a: 'le délégué, l’éco-délégué et les élus du conseil de la vie collégienne',
          wrong: [
            { label: 'le maire et ses adjoints', why: 'Ils représentent les habitants de la commune.' },
            {
              label: 'l’élève qui veut décider seul',
              why: 'Il n’a été choisi par personne pour représenter les autres.',
            },
            { label: 'les conseillers régionaux', why: 'Ils agissent à l’échelle de la région.' },
          ],
          explain:
            'Au collège, les délégués, les éco-délégués et les élus du conseil de la vie collégienne représentent les élèves.',
        },
        {
          ...REPRESENTANTS,
          q: 'Pourquoi passer par des représentants plutôt que décider seul ?',
          a: 'pour porter la parole des autres et discuter ensemble',
          wrong: [
            { label: 'pour que personne ne puisse proposer d’idée', why: 'Les représentants font remonter les idées.' },
            { label: 'pour décider sans écouter la classe', why: 'Représenter, c’est porter la parole des autres.' },
            { label: 'pour éviter tout débat', why: 'Les représentants participent aux délibérations.' },
          ],
          explain: 'La démocratie représentative organise la parole de tous et la discussion avant la décision.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : les droits de l'enfant ———

const droitsEnfant: Notion = {
  id: 'em6-droits-enfant',
  title: 'Les droits de l’enfant et la CIDE',
  hint: 'Pense à la Convention internationale : qui est un enfant, quels droits il a, qui doit les faire respecter.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **Convention internationale des droits de l’enfant** (CIDE), adoptée le 20 novembre 1989, concerne tout être humain de moins de 18 ans. La France l’a **ratifiée** en 1990.',
    'Elle garantit des droits : éducation, nom et **nationalité**, protection contre la violence, loisirs, respect de ses opinions. Les États qui l’ont ratifiée doivent la respecter.',
    'Les droits s’accompagnent de **devoirs** : respecter ceux des autres. Exemple : tu as le droit de donner ton avis, et le devoir d’écouter celui des autres.',
  ],
  faits: [
    {
      ...ADOPTION,
      q: 'Quand la Convention internationale des droits de l’enfant a-t-elle été adoptée ?',
      a: 'le 20 novembre 1989',
      wrong: [
        { label: 'le 14 juillet 1789', why: 'Cette date renvoie à la Révolution française.' },
        { label: 'le 9 décembre 1905', why: 'C’est la date de la loi de séparation des Églises et de l’État.' },
        { label: 'le 7 août 1990', why: 'C’est la date à laquelle la France l’a ratifiée.' },
      ],
      gap: ['La Convention internationale des droits de l’enfant a été adoptée en ', ' (l’année).', ['1989']],
      explain: 'La CIDE a été adoptée aux Nations unies le 20 novembre 1989.',
    },
    {
      ...DEFINITION_ENFANT,
      q: 'Pour la CIDE, qui est un enfant (en règle générale) ?',
      a: 'tout être humain de moins de 18 ans',
      wrong: [
        { label: 'toute personne de moins de 10 ans', why: 'La limite de la CIDE est 18 ans.' },
        { label: 'seulement les élèves de l’école primaire', why: 'Être élève n’est pas le critère.' },
        {
          label: 'toute personne de moins de 21 ans',
          why: 'La CIDE fixe la limite à 18 ans, sauf majorité plus précoce.',
        },
      ],
      gap: ['Pour la CIDE, un enfant est un être humain âgé de moins de ', ' ans.', ['18', 'dix-huit', 'dix huit']],
      explain: 'La CIDE retient 18 ans, sauf si la loi du pays fixe la majorité plus tôt.',
    },
    {
      ...EDUCATION,
      q: 'Lequel de ces droits la CIDE garantit-elle à l’enfant ?',
      a: 'le droit à l’éducation',
      wrong: [
        {
          label: 'le droit de voter aux élections nationales',
          why: 'Le droit de vote est réservé aux citoyens adultes.',
        },
        { label: 'le droit de ne suivre aucune règle', why: 'Aucun droit ne supprime les règles communes.' },
        { label: 'le droit d’être élu maire', why: 'Un enfant ne peut pas être élu maire.' },
      ],
      gap: ['La CIDE reconnaît à l’enfant le droit à l’', '.', ['éducation', 'education', 'instruction']],
      explain: 'Le droit à l’éducation est l’un des droits énoncés par la CIDE.',
    },
    {
      ...OPINIONS,
      q: 'Que prévoit la CIDE sur les opinions de l’enfant ?',
      a: 'les respecter sur toute question qui le concerne',
      wrong: [
        { label: 'les interdire jusqu’à 18 ans', why: 'La CIDE protège au contraire l’expression de l’enfant.' },
        {
          label: 'les faire toujours suivre, quelles qu’elles soient',
          why: 'Respecter un avis ne veut pas dire qu’il décide seul.',
        },
        { label: 'les écouter seulement à l’école', why: 'Cela concerne toute question qui concerne l’enfant.' },
      ],
      gap: [
        'La CIDE demande le respect des ',
        ' de l’enfant sur toute question qui le concerne.',
        ['opinions', 'opinion', 'avis'],
      ],
      explain: 'C’est l’un des quatre principes de la Convention.',
    },
    {
      ...NOM,
      q: 'Quel droit lié à l’identité la CIDE garantit-elle ?',
      a: 'avoir un nom et une nationalité',
      wrong: [
        { label: 'changer de pays quand il le veut', why: 'Ce droit n’est pas celui énoncé.' },
        { label: 'choisir ses parents', why: 'Personne ne choisit ses parents.' },
        { label: 'garder un nom secret pour tous', why: 'Il s’agit d’avoir un nom reconnu.' },
      ],
      gap: ['Tout enfant a le droit d’avoir un nom, une ', ' et une identité.', ['nationalité', 'nationalite']],
      explain: 'Un nom et une nationalité permettent d’être reconnu et protégé.',
    },
    {
      ...VIOLENCE,
      q: 'Contre quoi la CIDE protège-t-elle l’enfant ?',
      a: 'la violence, la maltraitance et l’exploitation',
      wrong: [
        { label: 'toute leçon à apprendre', why: 'Apprendre fait partie du droit à l’éducation.' },
        { label: 'toute règle de ses parents', why: 'Les règles protègent souvent l’enfant.' },
        { label: 'tout désaccord avec un camarade', why: 'Un désaccord n’est pas une violence.' },
      ],
      gap: ['L’enfant a le droit d’être protégé de la violence et de la ', '.', ['maltraitance']],
      explain: 'La protection contre la violence est un droit fondamental de l’enfant.',
    },
    {
      ...LOISIRS,
      q: 'Parmi ces activités, laquelle la CIDE reconnaît-elle comme un droit ?',
      a: 'jouer et avoir des loisirs',
      wrong: [
        { label: 'travailler à plein temps à tout âge', why: 'La CIDE protège les enfants de l’exploitation.' },
        { label: 'faire la guerre', why: 'La CIDE reconnaît le droit de ne pas la faire.' },
        { label: 'conduire une voiture', why: 'Ce n’est pas un droit énoncé par la CIDE.' },
      ],
      gap: ['L’enfant a le droit de jouer et d’avoir des ', '.', ['loisirs', 'loisir']],
      explain: 'Se reposer et jouer comptent aussi pour grandir.',
    },
    {
      ...CONTRAIGNANT,
      avance: true,
      q: 'Quelle valeur la CIDE a-t-elle pour les États qui l’ont ratifiée ?',
      a: 'c’est un texte contraignant : ils doivent le respecter',
      wrong: [
        { label: 'c’est un simple conseil', why: 'La CIDE est contraignante pour ces États.' },
        { label: 'c’est une règle pour une seule école', why: 'Elle engage des États.' },
        { label: 'c’est un texte sans effet', why: 'Les États sont responsables du respect de ces droits.' },
      ],
      gap: ['Pour les États qui l’ont ratifiée, la CIDE est un texte ', '.', ['contraignant', 'obligatoire']],
      explain: 'Ratifier la Convention engage l’État à faire respecter les droits des enfants.',
    },
    {
      ...FRANCE_RATIFIE,
      avance: true,
      q: 'En quelle année la France a-t-elle ratifié la CIDE ?',
      a: '1990',
      wrong: [
        { label: '1945', why: 'La Convention n’existait pas encore.' },
        { label: '1989', why: '1989 est l’année de son adoption aux Nations unies.' },
        { label: '2005', why: 'La ratification est antérieure.' },
      ],
      gap: ['La France a ratifié la Convention en ', ' (l’année).', ['1990']],
      explain: 'La France l’a ratifiée le 7 août 1990, un an après son adoption.',
    },
    {
      ...DEVOIRS,
      q: 'Quel lien le programme établit-il entre les droits et les devoirs ?',
      a: 'des devoirs découlent des droits',
      wrong: [
        { label: 'les droits suppriment les devoirs', why: 'Les droits s’accompagnent au contraire de devoirs.' },
        { label: 'seuls les adultes ont des devoirs', why: 'Le lien vaut aussi pour les élèves.' },
        { label: 'droits et devoirs n’ont aucun rapport', why: 'Les devoirs découlent des droits.' },
      ],
      gap: ['Des ', ' découlent des droits : respecter ceux des autres.', ['devoirs', 'devoir']],
      explain: 'Si tu as un droit, les autres l’ont aussi : tu as le devoir de le respecter.',
    },
  ],
  paires3: [
    ['Enfant selon la CIDE', 'Moins de 18 ans'],
    ['Droit à l’éducation', 'Pouvoir apprendre'],
    ['Droit à une identité', 'Avoir un nom et une nationalité'],
  ],
  paires5: [
    ['Enfant selon la CIDE', 'Moins de 18 ans'],
    ['Droit à l’éducation', 'Pouvoir apprendre'],
    ['Droit à une identité', 'Avoir un nom et une nationalité'],
    ['Droit à la protection', 'Être à l’abri de la violence'],
    ['20 novembre', 'Journée des droits de l’enfant'],
  ],
  libres: [
    {
      ...ADOPTION,
      q: 'Quel est le sigle de la Convention internationale des droits de l’enfant ? (quatre lettres)',
      accepted: ['CIDE', 'la CIDE'],
      traps: [
        { text: 'DDHC', why: 'La DDHC est la Déclaration des droits de l’homme et du citoyen de 1789.' },
        { text: 'ONU', why: 'L’ONU est l’organisation qui a adopté la Convention.' },
      ],
      explain: 'La Convention internationale des droits de l’enfant se note CIDE.',
    },
    {
      ...JOURNEE,
      q: 'Quel jour célèbre-t-on la journée internationale des droits de l’enfant ? (jour et mois)',
      accepted: ['20 novembre', 'le 20 novembre', '20/11'],
      traps: [
        { text: '9 décembre', why: 'Le 9 décembre est la journée de la laïcité.' },
        { text: '14 juillet', why: 'Le 14 juillet est la fête nationale française.' },
      ],
      explain: 'La journée rappelle l’adoption de la Convention le 20 novembre 1989.',
    },
    {
      ...DEFINITION_ENFANT,
      q: 'Selon la CIDE, en dessous de quel âge est-on en général un enfant ? (un nombre)',
      accepted: ['18', '18 ans', 'dix-huit', 'dix-huit ans'],
      traps: [
        { text: '16', why: 'La CIDE retient 18 ans.' },
        { text: '15', why: '15 ans est l’âge de la majorité numérique en France, pas la limite de la CIDE.' },
      ],
      explain: 'La CIDE protège les êtres humains de moins de 18 ans.',
    },
  ],
  docs: [
    {
      title: 'Le débat sur la cantine',
      lines: [
        'Une commission du collège prépare un changement des horaires de la cantine.',
        'Camille, 11 ans, veut donner son avis, car elle mange à la cantine.',
        'Un adulte lui dit d’abord : « Ce n’est pas à toi de parler. »',
        'La professeure invite les élèves à s’exprimer et à écouter chacun jusqu’au bout.',
      ],
      qs: [
        {
          ...OPINIONS,
          q: 'Quel droit de Camille la professeure fait-elle respecter ?',
          a: 'le respect de son opinion sur une question qui la concerne',
          wrong: [
            { label: 'le droit de décider seule', why: 'Donner son avis ne signifie pas décider seule.' },
            { label: 'le droit à une nationalité', why: 'Ce droit n’est pas en jeu ici.' },
            { label: 'le droit de jouer', why: 'Le texte parle de donner son avis.' },
          ],
          explain: 'Les horaires de la cantine concernent Camille : son opinion doit être respectée.',
        },
        {
          ...DEVOIRS,
          q: 'Quel devoir accompagne ce droit dans le débat ?',
          a: 'écouter les autres jusqu’au bout',
          wrong: [
            { label: 'couper la parole', why: 'Cela empêche les autres d’exercer le même droit.' },
            { label: 'garder le silence', why: 'Le droit de s’exprimer reste entier.' },
            { label: 'choisir seul les horaires', why: 'Ce n’est pas un devoir, et la décision est collective.' },
          ],
          explain: 'Chacun a le même droit : on doit donc écouter les autres.',
        },
      ],
    },
    {
      title: 'Une exposition au CDI',
      lines: [
        'Au CDI, une affiche présente la Convention internationale des droits de l’enfant.',
        'Une première image montre un enfant à l’école ; une autre, un enfant qui joue.',
        'Une légende explique : « Un État qui a ratifié ce texte doit le respecter. »',
        'Sami demande si ces droits concernent aussi une élève de 16 ans.',
      ],
      qs: [
        {
          ...DEFINITION_ENFANT,
          q: 'Quelle réponse donner à Sami ?',
          a: 'oui, car elle a moins de 18 ans',
          wrong: [
            { label: 'non, car elle est au lycée', why: 'L’établissement ne change pas l’âge.' },
            { label: 'non, à partir de 12 ans on n’est plus un enfant', why: 'La CIDE protège jusqu’à 18 ans.' },
            { label: 'oui, mais seulement le 20 novembre', why: 'Les droits valent toute l’année.' },
          ],
          explain: 'À 16 ans, on reste un enfant au sens de la CIDE.',
        },
        {
          ...RESPONSABILITE_ETATS,
          q: 'Qui est responsable du respect de ces droits quand le texte est ratifié ?',
          a: 'les États qui l’ont ratifié',
          wrong: [
            { label: 'les enfants eux seuls', why: 'Les États sont directement responsables.' },
            { label: 'les auteurs de l’affiche', why: 'Ils informent, mais ne sont pas responsables du texte.' },
            { label: 'personne', why: 'La légende dit que l’État doit respecter le texte.' },
          ],
          explain: 'Les États qui ont ratifié la CIDE sont directement responsables.',
        },
      ],
    },
  ],
};

export const SOCIETE_DEMOCRATIQUE_SKILLS: readonly Skill[] = [citoyennete, laicite, institutions, droitsEnfant].map(
  notion,
);
