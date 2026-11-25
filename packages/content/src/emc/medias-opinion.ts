import type { Skill } from '../types.ts';
import { notion, type Citation, type DocQuestion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * 3e, « Médias et opinion » (lot em-3e-02) : rôle des médias, sondages, démocratie et opinion publique, esprit
 * critique, d’après le programme d’EMC du 13 juin 2024. Chaque fait cite le programme (registre `emc-2024`), un texte
 * de loi (Légifrance), une fiche Vie publique ou une page Éduscol, avec sa citation exacte. Les chiffres d’audience,
 * datés, sont écartés. Les textes à lire du niveau 5 sont écrits pour l’exercice (personnes et lieux inventés).
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 3e : « Faire vivre la démocratie »';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 3e.';

/** Citation d’un texte du registre des sources. */
const cite =
  (id: string, label: string) =>
  (quote: string): Citation => ({ quote, from: { id, label } });
const prog = (quote: string): Citation => ({ quote });

const ddhc = cite('ddhc-1789', 'la Déclaration des droits de l’homme et du citoyen');
const loiSondages = cite('loi-sondages-1977', 'la loi de 1977 sur les sondages');
const loiManip = cite('loi-manipulation-information-2018', 'la loi de 2018 contre la manipulation de l’information');
const eduscol = cite('eduscol-esprit-critique', 'le site Éduscol');
const vpPresse = cite('vie-publique-presse', 'le site Vie publique');
const vpEmi = cite('vie-publique-education-medias', 'le site Vie publique');
const vpAlerte = cite('vie-publique-lanceurs-alerte', 'le site Vie publique');
const vpSondages = cite('vie-publique-sondages', 'le site Vie publique');
const vpPetition = cite('vie-publique-petition', 'le site Vie publique');
const vpOpinion = cite('vie-publique-liberte-opinion', 'le site Vie publique');
const vpManif = cite('vie-publique-manifestation', 'le site Vie publique');
const vpReferendum = cite('vie-publique-referendum', 'le site Vie publique');

type Wrong = readonly [label: string, why: string];
const wrongs = (list: readonly Wrong[]) => list.map(([label, why]) => ({ label, why }));

/** Fait cité : citation, question et réponse, trois erreurs, phrase à trou, explication. */
const fait = (
  citation: Citation,
  [q, a]: readonly [string, string],
  wrong: readonly [Wrong, Wrong, Wrong],
  gap: Fait['gap'],
  explain: string,
): Fait => ({ ...citation, q, a, wrong: wrongs(wrong), gap, explain });

/** Fait exigeant : non proposé au niveau 1. */
const expert = (f: Fait): Fait => ({ ...f, avance: true });

const libre = (
  citation: Citation,
  q: string,
  accepted: readonly string[],
  traps: readonly Wrong[],
  explain: string,
): Libre => ({ ...citation, q, accepted, traps: traps.map(([text, why]) => ({ text, why })), explain });

const lecture = (
  citation: Citation,
  q: string,
  a: string,
  wrong: readonly [Wrong, Wrong, Wrong],
  explain: string,
): DocQuestion => ({ ...citation, q, a, wrong: wrongs(wrong), explain });

const commun = { programme: PROGRAMME, credit: CREDIT } as const;

// ——— Citations exactes : programme de 3e ———

const PAR_LES_MEDIAS = prog(
  'La démocratie est un régime où l’opinion publique joue un rôle capital, qui s’exprime par l’intermédiaire des médias, dont les médias sociaux',
);
const PAR_LES_SONDAGES = prog('qu’on essaie de saisir par des sondages de natures diverses');
const ENJEU = prog('l’information constitue donc un enjeu essentiel, tout particulièrement à l’ère du numérique');
const MOBILISATIONS = prog('les médias sociaux sont eux aussi le lieu de débats et de mobilisations');
const ALERTE_PROG = prog(
  'des lanceurs d’alerte prennent des risques pour informer leurs concitoyennes et leurs concitoyens',
);
const DISTINCTION = prog(
  'l’importance de l’établissement rigoureux des faits et de la distinction entre croyance, opinion et savoir',
);
const COMPLOT = prog('Montrer comment la désinformation peut nourrir le complotisme');

// ——— Citations exactes : médias (Vie publique) ———

const FONDEMENT_PRESSE = vpPresse('Principe fondamental des systèmes démocratiques, la liberté de la presse');
const PLURALISME = vpPresse(
  'une décision du Conseil constitutionnel reconnaît le pluralisme des quotidiens d’information politique et générale comme étant “en lui-même un objectif de valeur constitutionnelle”',
);
const SUPPORTS = vpEmi(
  'la presse écrite, la radio, la télévision et, depuis une date plus récente, internet et les réseaux sociaux',
);
const PRENDRE_PAROLE = vpEmi(
  'chacun a la possibilité de prendre la parole pour contribuer activement à la communication médiatique',
);
const SOURCE_SURE = vpEmi('capables de comprendre la différence entre une source sûre et une source peu sûre');
const ALERTE_LOI = vpAlerte(
  'la personne physique qui signale ou divulgue, sans contrepartie financière directe et de bonne foi, des informations portant sur un crime, un délit, une menace ou un préjudice pour l’intérêt général',
);

// ——— Citations exactes : sondages (loi de 1977 et Vie publique) ———

const DEFINITION = loiSondages(
  'une enquête statistique visant à donner une indication quantitative, à une date déterminée, des opinions, souhaits, attitudes ou comportements d’une population par l’interrogation d’un échantillon',
);
const REPRESENTATIF = loiSondages('de manière à obtenir un échantillon représentatif de la population concernée');
const COMMANDITAIRE = loiSondages('Le nom et la qualité du commanditaire du sondage');
const MARGES = loiSondages('Une mention précisant que tout sondage est affecté de marges d’erreur');
const VEILLE = loiSondages(
  'la veille et le jour de chaque scrutin, aucun sondage électoral ne peut faire l’objet, par quelque moyen que ce soit, d’une publication, d’une diffusion ou d’un commentaire',
);
const COMMISSION = loiSondages(
  'La commission des sondages est chargée d’étudier et de proposer des règles tendant à assurer dans le domaine de la prévision électorale l’objectivité et la qualité des sondages',
);
const QUOTAS = vpSondages('Les sondages reposent majoritairement en France sur la méthode des quotas');
const PETIT_ECHANTILLON = vpSondages('plus l’échantillon est faible, plus la marge d’erreur progresse');
const REDRESSEMENT = vpSondages(
  'Le redressement est une opération consistant à modifier les résultats bruts du sondage afin d’en renforcer la qualité méthodologique',
);

// ——— Citations exactes : opinion publique ———

const LIBERTE_OPINION = vpOpinion(
  'La liberté d’opinion (ou liberté de conscience) assure à toute personne la liberté de penser comme elle l’entend',
);
const ART10 = ddhc(
  'Nul ne doit être inquiété pour ses opinions, même religieuses, pourvu que leur manifestation ne trouble pas l’ordre public établi par la Loi',
);
const PETITION = vpPetition(
  'Une pétition est une demande écrite, d’une ou plusieurs personnes, adressée à une autorité',
);
const SANS_VALEUR = vpPetition('Une pétition n’a pas de valeur juridique');
const ALERTER = vpPetition(
  'elle peut cependant alerter l’opinion, les médias, interpeller les pouvoirs publics et permettre d’ouvrir le débat',
);
const MANIF = vpManif(
  'Une manifestation est une réunion organisée sur la voie publique dans le but d’exprimer une conviction collective',
);
const REFERENDUM = vpReferendum(
  'Le référendum est une procédure de vote permettant de consulter directement les citoyens sur une question ou un texte',
);

// ——— Citations exactes : esprit critique (Éduscol) et loi de 2018 ———

const DISPOSITION = eduscol(
  'la disposition de l’esprit qui consiste à ne jamais admettre une affirmation, un jugement ou un fait sans en avoir reconnu la légitimité rationnelle',
);
const CHERCHER_SOURCE = eduscol('Évaluer l’information consiste à en chercher la source');
const COMPRENDRE = eduscol('S’informer consiste à prendre le temps de s’informer et comprendre avant de juger');
const INTERPRETATION = eduscol(
  'Distinguer les faits et les interprétations correspond à différencier les faits de l’interprétation qui les relie et les explique',
);
const LUCIDITE = eduscol(
  'La lucidité consiste à savoir ce que l’on sait avec certitude, ce que l’on suppose et ce que l’on ignore',
);
const MODESTIE = eduscol(
  'La modestie consiste à avoir conscience de la complexité du réel et à accepter de s’être trompé',
);
const JUGE = loiManip(
  'lorsque des allégations ou imputations inexactes ou trompeuses d’un fait de nature à altérer la sincérité du scrutin à venir sont diffusées de manière délibérée, artificielle ou automatisée et massive par le biais d’un service de communication au public en ligne, le juge des référés peut',
);

// ——— Notion 1 : rôle des médias ———

const medias: Notion = {
  ...commun,
  id: 'em3-role-medias',
  title: 'Le rôle des médias en démocratie',
  hint: 'Demande-toi qui informe, par quel moyen, et à quoi cela sert dans une démocratie.',
  memo: [
    'En démocratie, l’**opinion publique** s’exprime par les **médias** : presse écrite, radio, télévision, internet et **médias sociaux**, où chacun peut prendre la parole.',
    'La **liberté de la presse** et le **pluralisme** permettent de s’informer à des sources variées ; un **lanceur d’alerte** peut aussi révéler un danger pour l’intérêt général.',
    'Réflexe brevet : devant un document, nomme le média, qui publie, et ce qu’il apporte au débat.',
  ],
  faits: [
    fait(
      PAR_LES_MEDIAS,
      [
        'Par quel intermédiaire l’opinion publique s’exprime-t-elle, selon le programme ?',
        'les médias, dont les médias sociaux',
      ],
      [
        ['le Conseil constitutionnel', 'Il juge la conformité des lois à la Constitution, il ne porte pas l’opinion.'],
        ['le secret du vote seulement', 'Le programme désigne un intermédiaire public, qui diffuse les opinions.'],
        ['les seuls journaux officiels', 'L’opinion passe par des médias variés, dont les médias sociaux.'],
      ],
      [
        'L’opinion publique s’exprime par l’intermédiaire des ',
        ', dont les réseaux en ligne.',
        ['médias', 'medias', 'média', 'media'],
      ],
      'Les médias, dont les médias sociaux, font circuler les opinions dans la société.',
    ),
    fait(
      FONDEMENT_PRESSE,
      ['Quelle liberté est un principe fondamental des systèmes démocratiques ?', 'la liberté de la presse'],
      [
        [
          'le droit de censurer les journaux',
          'La censure restreint l’information : c’est le contraire de cette liberté.',
        ],
        ['l’obligation de lire un seul journal', 'La démocratie laisse chacun choisir ses sources.'],
        ['le monopole d’un journal d’État', 'Un seul journal ne permettrait pas la diversité des points de vue.'],
      ],
      ['Un principe fondamental des systèmes démocratiques est la liberté de la ', '.', ['presse']],
      'Sans presse libre, les citoyens ne pourraient pas s’informer ni débattre.',
    ),
    fait(
      SUPPORTS,
      ['Parmi ces moyens d’information, lesquels sont apparus le plus récemment ?', 'internet et les réseaux sociaux'],
      [
        ['la presse écrite', 'La presse écrite est bien plus ancienne.'],
        ['la radio', 'La radio est antérieure à internet.'],
        ['la télévision', 'La télévision est antérieure à internet.'],
      ],
      [
        'Les citoyens s’informent par la presse, la radio, la télévision et, plus récemment, internet et les réseaux ',
        '.',
        ['sociaux'],
      ],
      'Le numérique a multiplié les sources et les plateformes d’information.',
    ),
    fait(
      PRENDRE_PAROLE,
      [
        'Qu’est-ce que chacun peut faire sur les réseaux sociaux, plateformes interactives ?',
        'prendre la parole et contribuer à la communication',
      ],
      [
        ['uniquement lire, sans jamais réagir', 'Ces plateformes sont interactives : on peut y intervenir.'],
        ['voter la loi', 'Seul le Parlement vote la loi, pas les internautes.'],
        ['effacer les journaux des autres', 'Publier n’autorise pas à supprimer les informations d’autrui.'],
      ],
      ['Sur ces plateformes, chacun peut prendre la ', ' et contribuer à la communication.', ['parole']],
      'On peut y être lecteur, mais aussi producteur ou diffuseur de contenus : cela engage une responsabilité.',
    ),
    fait(
      MOBILISATIONS,
      [
        'Les médias sociaux diffusent des informations. De quoi sont-ils aussi le lieu ?',
        'de débats et de mobilisations',
      ],
      [
        ['de jugements rendus par des tribunaux', 'La justice est rendue par des juridictions.'],
        ['de votes officiels pour les députés', 'Les députés sont élus dans des bureaux de vote.'],
        ['de décisions du Gouvernement seulement', 'Les débats y sont ouverts aux citoyens.'],
      ],
      ['Les médias sociaux sont aussi le lieu de ', ' et de mobilisations.', ['débats', 'debats', 'débat', 'debat']],
      'Des citoyens y discutent et s’y rassemblent autour de causes.',
    ),
    fait(
      ENJEU,
      ['À quelle époque l’information est-elle, tout particulièrement, un enjeu essentiel ?', 'à l’ère du numérique'],
      [
        ['seulement avant l’imprimerie', 'Le programme souligne l’enjeu à notre époque.'],
        ['uniquement en l’absence de médias', 'C’est justement leur multiplication qui rend l’enjeu fort.'],
        ['seulement quand personne ne vote', 'L’enjeu ne dépend pas de l’abstention.'],
      ],
      ['L’information est un enjeu essentiel, surtout à l’ère du ', '.', ['numérique', 'numerique']],
      'Les informations circulent vite et en grand nombre, y compris avec les intelligences artificielles.',
    ),
    expert(
      fait(
        PLURALISME,
        [
          'Pour les quotidiens d’information politique et générale, quel principe est un objectif de valeur constitutionnelle ?',
          'le pluralisme',
        ],
        [
          ['la gratuité', 'La gratuité concerne le prix, pas la diversité des journaux.'],
          ['l’anonymat des directeurs', 'Ce n’est pas un objectif reconnu par la décision citée.'],
          ['l’unanimité', 'L’unanimité s’oppose à la diversité des points de vue.'],
        ],
        [
          'Pour la presse d’information politique, le ',
          ' est un objectif de valeur constitutionnelle.',
          ['pluralisme'],
        ],
        'Le pluralisme garantit que des journaux différents puissent exister et être lus.',
      ),
    ),
    expert(
      fait(
        ALERTE_LOI,
        [
          'Comment appelle-t-on la personne qui signale, de bonne foi et sans contrepartie financière directe, une menace pour l’intérêt général ?',
          'un lanceur d’alerte',
        ],
        [
          ['un commanditaire', 'Le commanditaire est celui qui commande un travail, comme un sondage.'],
          ['un grand électeur', 'Un grand électeur vote pour désigner les sénateurs.'],
          ['un juré', 'Un juré participe au jugement de crimes.'],
        ],
        ['La personne qui signale de bonne foi une menace pour l’intérêt général est un ', ' d’alerte.', ['lanceur']],
        'La loi du 21 mars 2022 a renforcé sa protection : il prend des risques pour informer.',
      ),
    ),
  ],
  paires3: [
    ['Presse écrite', 'Journaux et magazines'],
    ['Médias sociaux', 'Plateformes où chacun peut prendre la parole'],
    ['Lanceur d’alerte', 'Personne qui signale un danger pour tous'],
  ],
  paires5: [
    ['Liberté de la presse', 'Principe fondamental en démocratie'],
    ['Pluralisme', 'Diversité des journaux et des points de vue'],
    ['Réseaux sociaux', 'Lieux de débats et de mobilisations'],
    ['Loi de 2022', 'Renforce la protection des lanceurs d’alerte'],
    ['Éducation aux médias', 'Apprendre à distinguer les sources sûres'],
  ],
  libres: [
    libre(
      PLURALISME,
      'quel mot désigne la diversité des journaux et des points de vue ? Le …',
      ['pluralisme', 'le pluralisme'],
      [
        ['monopole', 'Un monopole, c’est l’inverse : un seul acteur.'],
        ['secret', 'Le secret des sources protège les journalistes, il ne désigne pas la diversité.'],
      ],
      'Le pluralisme permet de comparer plusieurs points de vue.',
    ),
    libre(
      ALERTE_PROG,
      'comment appelle-t-on une personne qui prend des risques pour révéler un danger à ses concitoyens ? Un lanceur …',
      ['d’alerte', 'alerte', 'un lanceur d’alerte', 'lanceur d’alerte'],
      [
        ['de pétition', 'Une pétition est une demande signée, pas le nom de cette personne.'],
        ['de sondage', 'Un sondage est une enquête statistique.'],
      ],
      'Le lanceur d’alerte informe ses concitoyens d’un danger.',
    ),
    libre(
      FONDEMENT_PRESSE,
      'quelle liberté des journaux est un fondement des démocraties ? La liberté de la …',
      ['presse', 'la presse', 'liberté de la presse', 'la liberté de la presse'],
      [
        ['circulation', 'La liberté de circulation concerne les déplacements.'],
        ['conscience', 'La liberté de conscience concerne ce que l’on pense ou croit.'],
      ],
      'La liberté de la presse est un principe fondamental des démocraties.',
    ),
  ],
  docs: [
    {
      title: 'Une rivière polluée',
      lines: [
        'Dans la ville inventée de Valrive, une salariée découvre que son usine rejette des produits toxiques.',
        'Elle le signale de bonne foi à une autorité, sans rien demander en échange.',
        'Un journal local enquête, puis publie un article.',
        'Sur un réseau social, des habitants lancent un débat et se mobilisent.',
      ],
      qs: [
        lecture(
          ALERTE_LOI,
          'Quel rôle la salariée joue-t-elle dans ce texte ?',
          'celui d’une lanceuse d’alerte',
          [
            ['celui d’une commanditaire de sondage', 'Elle ne commande aucune enquête.'],
            ['celui d’une élue', 'Rien n’indique qu’elle ait été élue.'],
            ['celui d’une juge', 'Elle signale des faits, elle ne les juge pas.'],
          ],
          'Elle signale de bonne foi, sans contrepartie financière, une menace pour l’intérêt général.',
        ),
        lecture(
          MOBILISATIONS,
          'Que montre la dernière ligne sur les médias sociaux ?',
          'ils sont aussi un lieu de débats et de mobilisations',
          [
            ['ils remplacent la justice', 'Les habitants discutent, ils ne rendent pas de jugement.'],
            ['ils empêchent les journaux de publier', 'Le journal a publié son article.'],
            ['ils servent à voter la loi', 'Aucune loi n’est votée dans ce texte.'],
          ],
          'Les habitants y débattent et s’y rassemblent.',
        ),
      ],
    },
    {
      title: 'Deux journaux, deux titres',
      lines: [
        'Le même jour, deux quotidiens inventés parlent d’un projet de parc.',
        'Le premier insiste sur les arbres plantés.',
        'Le second insiste sur le coût des travaux.',
        'Maya lit les deux avant de donner son avis.',
      ],
      qs: [
        lecture(
          PLURALISME,
          'Quel principe cette situation illustre-t-elle ?',
          'le pluralisme de la presse',
          [
            ['la censure', 'Les deux journaux publient librement.'],
            ['le monopole d’un journal', 'Il y a ici deux quotidiens différents.'],
            ['le secret du vote', 'Aucun vote n’a lieu.'],
          ],
          'Des journaux différents apportent des angles différents.',
        ),
        lecture(
          SOURCE_SURE,
          'Quelle compétence Maya peut-elle encore exercer sur ces deux articles ?',
          'juger si chaque source est sûre ou peu sûre',
          [
            ['choisir le titre le plus court sans lire', 'La longueur du titre ne dit rien de la fiabilité.'],
            ['interdire l’un des deux journaux', 'La liberté de la presse ne le permet pas à un lecteur.'],
            ['croire seulement le premier lu', 'L’ordre de lecture ne prouve rien.'],
          ],
          'L’éducation aux médias apprend à distinguer une source sûre d’une source peu sûre.',
        ),
      ],
    },
  ],
};

// ——— Notion 2 : sondages ———

const sondages: Notion = {
  ...commun,
  id: 'em3-sondages',
  title: 'Les sondages et leurs usages',
  hint: 'Demande-toi qui a commandé l’enquête, qui a été interrogé, quand, et avec quelle précision.',
  memo: [
    'Un **sondage** est une enquête statistique : on interroge un **échantillon** représentatif pour estimer les opinions d’une population à une date donnée.',
    'Pour un sondage électoral, la loi de 1977 impose d’indiquer notamment le **commanditaire**, le nombre de personnes interrogées et la **marge d’erreur** ; il est interdit d’en publier la veille et le jour du scrutin.',
    'Réflexe brevet : un sondage est une photographie à un moment donné, jamais le résultat d’un vote.',
  ],
  faits: [
    fait(
      DEFINITION,
      ['Qu’est-ce qu’un sondage, au sens de la loi ?', 'une enquête statistique menée auprès d’un échantillon'],
      [
        ['un vote qui désigne les élus', 'Seule une élection désigne les élus.'],
        ['une loi votée par le Parlement', 'Une loi est une règle, pas une enquête.'],
        ['un comptage de tous les habitants', 'On n’interroge qu’une partie de la population.'],
      ],
      ['On réalise un sondage en interrogeant un ', ' de la population.', ['échantillon', 'echantillon']],
      'On interroge une partie de la population pour estimer ce que pense l’ensemble.',
    ),
    fait(
      REPRESENTATIF,
      [
        'Comment doit être l’échantillon interrogé pour un sondage électoral ?',
        'représentatif de la population concernée',
      ],
      [
        ['formé des amis du sondeur', 'Des proches ne ressemblent pas à toute la population.'],
        ['composé uniquement de candidats', 'La population concernée est bien plus large.'],
        ['le plus petit possible', 'La taille ne suffit pas, et un petit groupe est moins précis.'],
      ],
      [
        'Les personnes sont choisies pour obtenir un échantillon ',
        ' de la population concernée.',
        ['représentatif', 'representatif'],
      ],
      'Un échantillon représentatif ressemble à la population étudiée.',
    ),
    fait(
      COMMANDITAIRE,
      [
        'Quelle information doit accompagner la première publication d’un sondage électoral ?',
        'le nom et la qualité de celui qui l’a commandé',
      ],
      [
        ['l’adresse de chaque personne interrogée', 'Les personnes interrogées n’ont pas à être identifiées.'],
        ['le vote secret de chaque sondé', 'Les réponses individuelles ne sont pas publiées.'],
        ['le nom du futur élu', 'Un sondage ne peut pas annoncer à coup sûr un élu.'],
      ],
      [
        'La publication indique le nom et la qualité du ',
        ' du sondage, c’est-à-dire de celui qui l’a commandé.',
        ['commanditaire'],
      ],
      'Savoir qui paie l’enquête aide à l’interpréter.',
    ),
    fait(
      MARGES,
      [
        'Que doit rappeler la publication d’un sondage électoral à propos de sa précision ?',
        'qu’il comporte des marges d’erreur',
      ],
      [
        ['qu’il est parfaitement exact', 'Un sondage n’est pas une science exacte.'],
        ['qu’il remplace le scrutin', 'Seul le vote désigne le résultat.'],
        ['qu’il ne peut jamais être contesté', 'Une notice peut être consultée et le sondage examiné.'],
      ],
      ['Tout sondage est affecté de marges d’', '.', ['erreur', 'erreurs']],
      'Parce qu’on interroge un échantillon, le chiffre publié est une estimation.',
    ),
    fait(
      VEILLE,
      [
        'Lors d’élections générales, quand la publication d’un sondage électoral est-elle interdite ?',
        'la veille et le jour du scrutin',
      ],
      [
        ['toute l’année', 'Les sondages sont publiés hors de cette période.'],
        ['un mois après le vote', 'L’interdiction protège le moment du vote, avant et pendant.'],
        ['jamais', 'La loi prévoit une interdiction autour du scrutin.'],
      ],
      ['Aucun sondage électoral ne peut être publié le jour du scrutin ni la ', '.', ['veille']],
      'Cette pause protège la liberté de choix des électeurs au moment de voter.',
    ),
    fait(
      PETIT_ECHANTILLON,
      ['Que se passe-t-il quand l’échantillon est plus petit ?', 'la marge d’erreur augmente'],
      [
        ['le sondage devient exact', 'Moins on interroge de personnes, moins l’estimation est précise.'],
        ['la marge d’erreur disparaît', 'Une marge d’erreur existe toujours.'],
        ['le sondage devient un vote', 'La taille de l’échantillon ne change pas sa nature.'],
      ],
      ['Plus l’échantillon est faible, plus la marge d’', ' progresse.', ['erreur']],
      'Un petit échantillon donne une estimation plus incertaine.',
    ),
    expert(
      fait(
        COMMISSION,
        [
          'Quel organisme est chargé d’assurer l’objectivité et la qualité des sondages électoraux publiés ?',
          'la commission des sondages',
        ],
        [
          ['le conseil municipal', 'Il règle les affaires de la commune.'],
          ['la Cour d’assises', 'Elle juge les crimes.'],
          ['le conseil de la vie lycéenne', 'Il concerne la démocratie dans les lycées.'],
        ],
        ['La commission des ', ' veille à la qualité des sondages électoraux.', ['sondages']],
        'Elle contrôle les sondages électoraux et peut imposer des mises au point.',
      ),
    ),
    expert(
      fait(
        QUOTAS,
        ['En France, sur quelle méthode les sondages reposent-ils le plus souvent ?', 'la méthode des quotas'],
        [
          ['le tirage au sort des élus', 'Il ne concerne pas la composition d’un échantillon d’enquête.'],
          ['l’interrogation de toute la population', 'Ce serait un recensement complet, pas un sondage.'],
          ['le vote à main levée', 'Un sondage n’est pas un vote.'],
        ],
        ['En France, les sondages reposent surtout sur la méthode des ', '.', ['quotas', 'quota']],
        'L’échantillon reproduit des caractéristiques de la population : sexe, âge, métier, région…',
      ),
    ),
    expert(
      fait(
        REDRESSEMENT,
        [
          'Comment appelle-t-on la correction des résultats bruts d’un sondage pour en améliorer la qualité ?',
          'le redressement',
        ],
        [
          ['la dissolution', 'La dissolution met fin à une assemblée.'],
          ['la censure', 'La censure interdit une publication.'],
          ['la promulgation', 'Promulguer, c’est ordonner d’appliquer une loi.'],
        ],
        ['Corriger les résultats bruts d’un sondage s’appelle le ', '.', ['redressement']],
        'On donne plus ou moins de poids à certaines réponses : la méthode doit être expliquée.',
      ),
    ),
  ],
  paires3: [
    ['Échantillon', 'Partie de la population interrogée'],
    ['Commanditaire', 'Celui qui commande le sondage'],
    ['Marge d’erreur', 'Incertitude sur le chiffre'],
  ],
  paires5: [
    ['Méthode des quotas', 'Reproduire les caractéristiques de la population'],
    ['Redressement', 'Correction des résultats bruts'],
    ['Commission des sondages', 'Contrôle des sondages électoraux'],
    ['Notice', 'Document sur la méthode, consultable'],
    ['Veille du scrutin', 'Publication de sondage électoral interdite'],
  ],
  libres: [
    libre(
      DEFINITION,
      'comment appelle-t-on le groupe de personnes interrogées pour représenter une population ?',
      ['un échantillon', 'échantillon', 'l’échantillon', 'echantillon', 'un echantillon'],
      [
        ['un quorum', 'Le quorum est un nombre minimal de présents pour décider.'],
        ['un électorat', 'L’électorat désigne l’ensemble des électeurs.'],
      ],
      'On interroge un échantillon pour estimer l’opinion de toute la population.',
    ),
    libre(
      COMMANDITAIRE,
      'comment appelle-t-on la personne ou l’organisme qui commande un sondage ? Le …',
      ['commanditaire', 'le commanditaire'],
      [
        ['sondé', 'Le sondé est la personne qui répond.'],
        ['électeur', 'L’électeur vote.'],
      ],
      'Le commanditaire est à l’origine de la commande.',
    ),
    libre(
      QUOTAS,
      'quelle méthode consiste à interroger un groupe qui a les mêmes caractéristiques que la population ? La méthode des …',
      ['quotas', 'les quotas', 'quota'],
      [
        ['hasards', 'La méthode au hasard s’appelle la méthode aléatoire, une autre possibilité.'],
        ['votes', 'Un vote n’est pas une méthode d’échantillonnage.'],
      ],
      'La méthode des quotas fixe des proportions à respecter.',
    ),
  ],
  docs: [
    {
      title: 'Un chiffre à la une',
      lines: [
        'Un journal inventé titre : « 51 % des habitants veulent la piscine ».',
        'En petits caractères : enquête commandée par une société qui construit des piscines.',
        'Cent personnes ont été interrogées, le 3 mai.',
        'La marge d’erreur n’est pas indiquée.',
      ],
      qs: [
        lecture(
          COMMANDITAIRE,
          'Quelle information invite à la prudence sur les intérêts en jeu ?',
          'le commanditaire est une société qui construit des piscines',
          [
            ['la date de l’enquête est donnée', 'Donner la date est utile et attendu.'],
            ['le journal publie un titre', 'Publier un titre n’a rien d’anormal.'],
            ['le nombre de personnes est indiqué', 'Cette indication est attendue.'],
          ],
          'Celui qui commande l’enquête a ici un intérêt au résultat.',
        ),
        lecture(
          PETIT_ECHANTILLON,
          'Pourquoi le faible nombre de personnes interrogées compte-t-il ?',
          'plus l’échantillon est petit, plus la marge d’erreur est grande',
          [
            ['un petit nombre rend le résultat exact', 'C’est l’inverse.'],
            [
              'cent personnes forment toujours toute la ville',
              'Le texte parle d’une enquête, pas de tous les habitants.',
            ],
            ['le nombre ne change jamais rien', 'La taille de l’échantillon joue sur la précision.'],
          ],
          'Avec peu de personnes, un résultat proche de 50 % reste très incertain.',
        ),
      ],
    },
    {
      title: 'La veille du vote',
      lines: [
        'Les électeurs de toute la France votent dimanche pour élire leurs députés.',
        'Le samedi, un site veut mettre en ligne un nouveau sondage sur ce scrutin.',
        'Une journaliste rappelle la règle à son équipe.',
      ],
      qs: [
        lecture(
          VEILLE,
          'Que doit répondre la journaliste ?',
          'non : la publication est interdite la veille et le jour du scrutin',
          [
            ['oui, la loi ne concerne que le dimanche', 'La veille est aussi concernée.'],
            ['oui, car le site est en ligne', 'La loi vise tout moyen de publication.'],
            [
              'non, les sondages sont interdits toute l’année',
              'L’interdiction ne porte que sur la période du scrutin.',
            ],
          ],
          'La loi vise la publication, la diffusion et le commentaire, par tout moyen.',
        ),
        lecture(
          MARGES,
          'Quand le site publiera un sondage électoral hors de cette période, que devra-t-il rappeler ?',
          'que le sondage est affecté de marges d’erreur',
          [
            ['que le résultat du vote est déjà connu', 'Un sondage ne remplace pas le scrutin.'],
            ['que personne ne peut consulter la méthode', 'Au contraire, une notice est consultable.'],
            ['qu’aucun nombre de sondés n’existe', 'Le nombre de personnes interrogées doit être indiqué.'],
          ],
          'La loi impose la mention des marges d’erreur.',
        ),
      ],
    },
  ],
};

// ——— Notion 3 : démocratie et opinion publique ———

const opinion: Notion = {
  ...commun,
  id: 'em3-opinion-publique',
  title: 'Démocratie et opinion publique',
  hint: 'Demande-toi comment les citoyens font connaître leur avis, et avec quel effet.',
  memo: [
    'L’**opinion publique** joue un rôle capital en démocratie ; la **liberté d’opinion** permet à chacun de penser comme il l’entend.',
    'Elle se fait entendre par les médias, les sondages, la **pétition**, la manifestation ou le **référendum**, vote direct des citoyens.',
    'Réflexe brevet : ne confonds pas une pétition (demande signée, sans valeur juridique) et un référendum (vote).',
  ],
  faits: [
    fait(
      PAR_LES_MEDIAS,
      ['Dans quel régime l’opinion publique joue-t-elle un rôle capital ?', 'la démocratie'],
      [
        ['la dictature', 'Une dictature étouffe les opinions libres.'],
        ['la monarchie absolue', 'Le monarque y décide seul.'],
        ['un régime sans aucun débat', 'L’opinion publique se forme justement dans le débat.'],
      ],
      ['La ', ' est un régime où l’opinion publique joue un rôle capital.', ['démocratie', 'democratie']],
      'En démocratie, l’avis des citoyens pèse sur la vie politique.',
    ),
    fait(
      PAR_LES_SONDAGES,
      ['Par quel type d’enquête essaie-t-on de saisir l’opinion publique ?', 'les sondages'],
      [
        ['les jugements des tribunaux', 'Un tribunal tranche un litige, il ne mesure pas l’opinion.'],
        ['les décrets du Premier ministre', 'Un décret est une décision, pas une mesure de l’opinion.'],
        ['les bulletins météo', 'Ils ne concernent pas les avis des citoyens.'],
      ],
      ['On essaie de saisir l’opinion publique par des ', ' de natures diverses.', ['sondages', 'sondage']],
      'Les sondages tentent de mesurer ce que pense une population à un moment donné.',
    ),
    fait(
      LIBERTE_OPINION,
      ['Qu’assure la liberté d’opinion à chaque personne ?', 'la liberté de penser comme elle l’entend'],
      [
        ['le droit d’obliger les autres à penser comme elle', 'La liberté de chacun interdit d’imposer ses idées.'],
        ['le devoir de suivre l’avis de la majorité', 'On peut rester minoritaire dans ses idées.'],
        ['le droit d’insulter qui n’est pas d’accord', 'L’expression a des limites : l’injure est punie.'],
      ],
      ['La liberté d’', ' assure à chacun la liberté de penser comme il l’entend.', ['opinion', 'conscience']],
      'On l’appelle aussi liberté de conscience.',
    ),
    fait(
      PETITION,
      ['Qu’est-ce qu’une pétition ?', 'une demande écrite adressée à une autorité'],
      [
        ['un vote obligatoire des députés', 'Une pétition vient de personnes qui demandent quelque chose.'],
        ['une enquête auprès d’un échantillon', 'C’est la définition d’un sondage.'],
        ['un jugement rendu par un tribunal', 'Un jugement relève de la justice.'],
      ],
      [
        'Une demande écrite adressée à une autorité par une ou plusieurs personnes est une ',
        '.',
        ['pétition', 'petition'],
      ],
      'Des personnes la signent pour soutenir la demande, sur papier ou en ligne.',
    ),
    fait(
      REFERENDUM,
      ['Quelle procédure de vote consulte directement les citoyens sur une question ou un texte ?', 'le référendum'],
      [
        ['le sondage', 'Un sondage est une enquête, pas un vote.'],
        ['la pétition', 'Une pétition est une demande signée, pas un vote.'],
        ['la motion de censure', 'Elle est votée par les députés contre le Gouvernement.'],
      ],
      ['Consulter directement les citoyens par un vote sur une question, c’est le ', '.', ['référendum', 'referendum']],
      'Avec le référendum, les citoyens décident eux-mêmes.',
    ),
    fait(
      MANIF,
      [
        'Quel moyen consiste à se réunir sur la voie publique pour exprimer une conviction collective ?',
        'la manifestation',
      ],
      [
        ['le référendum', 'Le référendum se fait dans des bureaux de vote.'],
        ['la dissolution', 'La dissolution met fin à une assemblée.'],
        ['le scrutin à bulletin secret', 'Un scrutin est un vote individuel.'],
      ],
      ['Une réunion sur la voie publique pour exprimer une conviction collective est une ', '.', ['manifestation']],
      'C’est un moyen collectif de faire connaître une opinion.',
    ),
    expert(
      fait(
        SANS_VALEUR,
        ['Quelle est la portée juridique d’une pétition ?', 'elle n’a pas de valeur juridique'],
        [
          ['elle vaut une loi dès la première signature', 'Seul le Parlement vote la loi.'],
          ['elle annule un jugement', 'Un jugement se conteste devant la justice.'],
          ['elle remplace une élection', 'Seule une élection désigne les élus.'],
        ],
        ['Une pétition n’a pas de valeur ', '.', ['juridique']],
        'Elle ne crée pas de règle, mais elle peut peser dans le débat.',
      ),
    ),
    expert(
      fait(
        ALERTER,
        [
          'Même sans force contraignante, que peut faire une pétition ?',
          'alerter l’opinion et les pouvoirs publics, et ouvrir le débat',
        ],
        [
          ['obliger le Parlement à voter la loi demandée', 'Elle n’a pas cette force.'],
          ['désigner un ministre', 'Une pétition ne nomme personne.'],
          ['interdire un journal', 'Elle ne donne aucun pouvoir de ce type.'],
        ],
        [
          'Une pétition peut alerter l’opinion et les médias, interpeller les pouvoirs publics et ouvrir le ',
          '.',
          ['débat', 'debat'],
        ],
        'Elle met un sujet sur la place publique.',
      ),
    ),
    expert(
      fait(
        ART10,
        [
          'Selon la Déclaration de 1789, à quelle condition la manifestation d’une opinion est-elle protégée ?',
          'qu’elle ne trouble pas l’ordre public établi par la loi',
        ],
        [
          ['qu’elle soit partagée par la majorité', 'Les opinions minoritaires sont protégées aussi.'],
          ['qu’elle ne soit jamais religieuse', 'L’article protège même les opinions religieuses.'],
          ['qu’elle ait été approuvée par le Gouvernement', 'Aucune approbation n’est demandée.'],
        ],
        [
          'Nul ne doit être inquiété pour ses opinions, si leur manifestation ne trouble pas l’ordre ',
          ' établi par la loi.',
          ['public'],
        ],
        'La liberté d’opinion est protégée dans les limites fixées par la loi.',
      ),
    ),
  ],
  paires3: [
    ['Sondage', 'Enquête sur les opinions'],
    ['Référendum', 'Vote direct des citoyens sur une question'],
    ['Pétition', 'Demande écrite que l’on signe'],
  ],
  paires5: [
    ['Liberté d’opinion', 'Penser comme on l’entend'],
    ['Manifestation', 'Réunion sur la voie publique'],
    ['Médias sociaux', 'Lieux de débats et de mobilisations'],
    ['Référendum', 'Les citoyens tranchent par un vote'],
    ['Pétition', 'Alerte sans valeur juridique'],
  ],
  libres: [
    libre(
      PETITION,
      'quel nom porte une demande écrite et signée adressée à une autorité ?',
      ['une pétition', 'pétition', 'la pétition', 'petition', 'une petition'],
      [
        ['un référendum', 'Un référendum est un vote.'],
        ['un sondage', 'Un sondage est une enquête statistique.'],
      ],
      'La pétition rassemble des signatures autour d’une demande.',
    ),
    libre(
      REFERENDUM,
      'quel vote permet aux citoyens de répondre directement à une question ou de se prononcer sur un texte ?',
      ['le référendum', 'référendum', 'un référendum', 'referendum', 'le referendum'],
      [
        ['le sondage', 'Un sondage n’est pas un vote.'],
        ['les législatives', 'Elles désignent des députés.'],
      ],
      'Le référendum consulte directement le peuple.',
    ),
    libre(
      PAR_LES_MEDIAS,
      'quel nom donne-t-on à l’avis d’ensemble qui s’exprime dans la société ? L’opinion …',
      ['publique', 'l’opinion publique', 'opinion publique'],
      [
        ['privée', 'Une opinion gardée pour soi ne pèse pas dans le débat.'],
        ['secrète', 'Le vote est secret, mais cette opinion s’exprime au grand jour.'],
      ],
      'L’opinion publique s’exprime notamment par les médias.',
    ),
  ],
  docs: [
    {
      title: 'Sauver le terrain de sport',
      lines: [
        'La commune inventée de Hautpré veut construire un parking sur un terrain de sport.',
        'Des habitants rédigent une demande au maire et recueillent des signatures.',
        'Un journal local en parle ; le conseil municipal ouvre une discussion.',
        'Le parking n’est pas abandonné automatiquement.',
      ],
      qs: [
        lecture(
          PETITION,
          'Quel moyen d’expression les habitants utilisent-ils ?',
          'une pétition',
          [
            ['un référendum', 'Aucun vote n’est organisé.'],
            ['un sondage', 'Ils n’interrogent pas un échantillon, ils demandent quelque chose.'],
            ['une motion de censure', 'Elle appartient à l’Assemblée nationale.'],
          ],
          'Une demande écrite, signée, adressée à une autorité : c’est une pétition.',
        ),
        lecture(
          ALERTER,
          'Quel effet la démarche a-t-elle eu, selon le texte ?',
          'elle a ouvert le débat',
          [
            ['elle a imposé l’abandon du parking', 'La dernière ligne dit le contraire.'],
            ['elle a élu un nouveau maire', 'Aucune élection n’est mentionnée.'],
            ['elle a supprimé le journal local', 'Le journal a au contraire relayé la demande.'],
          ],
          'Le journal en parle et le conseil municipal discute.',
        ),
      ],
    },
    {
      title: 'Un avis, trois voies',
      lines: [
        'Sur un réseau social, beaucoup critiquent un projet de réforme.',
        'Un institut interroge un échantillon et estime que les avis sont partagés.',
        'Quelques semaines plus tard, les citoyens sont appelés à voter oui ou non sur le texte.',
      ],
      qs: [
        lecture(
          REFERENDUM,
          'Comment s’appelle la dernière étape décrite ?',
          'un référendum',
          [
            ['un sondage', 'Le sondage est l’étape précédente, auprès d’un échantillon.'],
            ['une pétition', 'Personne ne signe une demande.'],
            ['une manifestation', 'Il ne s’agit pas d’un rassemblement dans la rue.'],
          ],
          'Les citoyens sont consultés directement sur un texte.',
        ),
        lecture(
          PAR_LES_SONDAGES,
          'À quoi sert l’enquête de l’institut ?',
          'à essayer de saisir l’opinion publique',
          [
            ['à adopter la réforme', 'Seul le vote prévu décide ici.'],
            ['à censurer le réseau social', 'L’enquête ne supprime rien.'],
            ['à désigner des députés', 'Aucune élection de députés n’a lieu.'],
          ],
          'Un sondage tente de mesurer l’opinion ; il ne décide rien.',
        ),
      ],
    },
  ],
};

// ——— Notion 4 : esprit critique ———

const critique: Notion = {
  ...commun,
  id: 'em3-esprit-critique',
  title: 'L’esprit critique face à l’information',
  hint: 'Demande-toi d’où vient l’information, ce qui est prouvé et ce qui est seulement supposé.',
  memo: [
    'L’**esprit critique** consiste à ne pas admettre une affirmation sans raisons solides : on cherche la source et on distingue le fait de son interprétation.',
    'Ne confonds pas **croyance**, **opinion** et **savoir** ; la **désinformation** peut nourrir le **complotisme**.',
    'Réflexe brevet : avant de partager, demande-toi qui parle, quelles preuves il donne et ce que tu ignores encore.',
  ],
  faits: [
    fait(
      DISPOSITION,
      [
        'Que refuse une personne qui exerce son esprit critique ?',
        'admettre une affirmation sans raisons solides de la croire',
      ],
      [
        ['écouter le moindre avis différent', 'L’esprit critique suppose au contraire l’écoute.'],
        ['reconnaître qu’elle s’est trompée', 'La modestie consiste à accepter ses erreurs.'],
        ['chercher la source d’une information', 'Chercher la source est justement une pratique critique.'],
      ],
      ['L’esprit ', ' consiste à ne rien admettre sans en avoir reconnu la légitimité rationnelle.', ['critique']],
      'On accepte une affirmation quand des raisons et des preuves le justifient.',
    ),
    fait(
      CHERCHER_SOURCE,
      ['Pour évaluer une information, que faut-il d’abord chercher ?', 'sa source'],
      [
        ['son nombre de partages', 'Une fausse information peut être très partagée.'],
        ['la couleur de sa mise en page', 'La présentation ne prouve rien.'],
        ['la longueur de son titre', 'La longueur ne dit rien de la fiabilité.'],
      ],
      ['Évaluer une information, c’est en chercher la ', '.', ['source']],
      'Savoir d’où vient l’information permet de juger sa fiabilité.',
    ),
    fait(
      COMPRENDRE,
      ['Dans quel ordre faut-il agir face à une information ?', 'comprendre avant de juger'],
      [
        ['juger avant de lire', 'On ne peut pas juger sérieusement ce qu’on n’a pas compris.'],
        ['partager avant de comprendre', 'Partager trop vite peut diffuser une erreur.'],
        ['croire avant de vérifier', 'La vérification doit précéder l’adhésion.'],
      ],
      ['S’informer, c’est prendre le temps de comprendre avant de ', '.', ['juger']],
      'Prendre le temps évite les réactions immédiates.',
    ),
    fait(
      INTERPRETATION,
      ['Que faut-il différencier d’un fait ?', 'l’interprétation qui le relie et l’explique'],
      [
        ['la date à laquelle il a eu lieu', 'La date fait partie des faits à établir.'],
        ['la source qui le rapporte', 'La source s’évalue, mais ce n’est pas la distinction demandée ici.'],
        ['les témoins qui l’ont vu', 'Les témoins aident à établir le fait.'],
      ],
      ['Il faut différencier les faits de l’', ' qui les relie et les explique.', ['interprétation', 'interpretation']],
      'Deux personnes peuvent s’accorder sur un fait et l’expliquer différemment.',
    ),
    fait(
      DISTINCTION,
      ['Quels trois mots faut-il distinguer pour établir rigoureusement les faits ?', 'croyance, opinion et savoir'],
      [
        ['vote, loi et décret', 'Ces mots concernent les institutions.'],
        ['presse, radio et télévision', 'Ce sont des médias.'],
        ['maire, député et sénateur', 'Ce sont des élus.'],
      ],
      ['Il faut distinguer croyance, ', ' et savoir.', ['opinion']],
      'Un savoir s’appuie sur des preuves ; une opinion est un avis ; une croyance est tenue pour vraie sans preuve exigée.',
    ),
    fait(
      COMPLOT,
      ['Quel phénomène la désinformation peut-elle nourrir ?', 'le complotisme'],
      [
        ['le recoupement des sources', 'C’est au contraire un remède à la désinformation.'],
        [
          'le pluralisme de la presse',
          'Le pluralisme est un principe démocratique, pas un effet des fausses informations.',
        ],
        ['la liberté de conscience', 'C’est un droit garanti, pas un effet de la désinformation.'],
      ],
      ['La désinformation peut nourrir le ', '.', ['complotisme']],
      'De fausses informations peuvent faire croire à des complots cachés, parfois liés au racisme ou à l’antisémitisme.',
    ),
    expert(
      fait(
        LUCIDITE,
        [
          'Quelle qualité consiste à savoir ce que l’on sait avec certitude, ce que l’on suppose et ce que l’on ignore ?',
          'la lucidité',
        ],
        [
          ['la rapidité', 'Aller vite ne permet pas de faire ce tri.'],
          ['la crédulité', 'La crédulité fait croire trop facilement.'],
          ['l’obéissance', 'Obéir ne dit pas ce que l’on sait vraiment.'],
        ],
        [
          'Savoir ce que l’on sait, ce que l’on suppose et ce que l’on ignore, c’est la ',
          '.',
          ['lucidité', 'lucidite'],
        ],
        'Être lucide, c’est connaître les limites de ses connaissances.',
      ),
    ),
    expert(
      fait(
        MODESTIE,
        ['Quelle qualité fait accepter de s’être trompé ?', 'la modestie'],
        [
          ['l’orgueil', 'L’orgueil pousse à nier ses erreurs.'],
          ['la méfiance envers tous', 'Se méfier de tout n’aide pas à corriger ses propres erreurs.'],
          ['l’indifférence', 'L’indifférence n’amène pas à revoir ses idées.'],
        ],
        ['Avoir conscience de la complexité du réel et accepter de s’être trompé, c’est la ', '.', ['modestie']],
        'La modestie permet de corriger son jugement.',
      ),
    ),
    expert(
      fait(
        JUGE,
        [
          'Avant des élections générales, qui peut ordonner de faire cesser la diffusion massive et délibérée de fausses informations en ligne menaçant la sincérité du vote ?',
          'le juge des référés',
        ],
        [
          ['la commission des sondages', 'Elle contrôle les sondages électoraux.'],
          ['le conseil municipal', 'Il règle les affaires de la commune.'],
          ['n’importe quel internaute', 'Un internaute peut saisir la justice, mais il n’ordonne rien.'],
        ],
        ['Le juge des ', ' peut faire cesser cette diffusion avant un scrutin.', ['référés', 'referes', 'référé']],
        'La loi du 22 décembre 2018 permet de saisir ce juge pendant les trois mois précédant le mois des élections.',
      ),
    ),
  ],
  paires3: [
    ['Savoir', 'Connaissance établie par des preuves'],
    ['Opinion', 'Avis personnel'],
    ['Source', 'Origine d’une information'],
  ],
  paires5: [
    ['Esprit critique', 'Ne rien admettre sans raisons solides'],
    ['Lucidité', 'Séparer le certain, le supposé et l’ignoré'],
    ['Modestie', 'Accepter de s’être trompé'],
    ['Désinformation', 'Fausses informations diffusées pour tromper'],
    ['Complotisme', 'Voir partout des complots cachés'],
  ],
  libres: [
    libre(
      CHERCHER_SOURCE,
      'comment appelle-t-on l’origine d’une information, qu’il faut chercher pour l’évaluer ? La …',
      ['source', 'la source'],
      [
        ['rumeur', 'Une rumeur circule sans origine vérifiée.'],
        ['légende', 'La légende d’une image la commente, elle ne dit pas toujours d’où vient l’information.'],
      ],
      'Identifier la source est la première vérification.',
    ),
    libre(
      COMPLOT,
      'quel mot, formé sur « complot », désigne ce que la désinformation peut nourrir ?',
      ['complotisme', 'le complotisme', 'conspirationnisme', 'le conspirationnisme'],
      [
        ['pluralisme', 'Le pluralisme désigne la diversité des points de vue.'],
        ['civisme', 'Le civisme, c’est agir pour le bien de tous.'],
      ],
      'La désinformation peut nourrir le complotisme.',
    ),
    libre(
      DISPOSITION,
      'quel esprit consiste à ne pas admettre une affirmation sans raisons solides ? L’esprit …',
      ['critique', 'l’esprit critique', 'esprit critique'],
      [
        ['de contradiction', 'Contredire par principe n’est pas examiner les preuves.'],
        ['d’équipe', 'L’esprit d’équipe concerne la coopération.'],
      ],
      'L’esprit critique examine avant d’accepter.',
    ),
  ],
  docs: [
    {
      title: 'La vidéo du gymnase',
      lines: [
        'Sami reçoit une vidéo : « Le gymnase va être détruit en secret, on nous cache tout ! »',
        'Aucun auteur ni date n’apparaît.',
        'Il cherche l’origine du message et consulte le compte rendu public du conseil municipal.',
        'Ce document annonce des travaux de rénovation.',
      ],
      qs: [
        lecture(
          CHERCHER_SOURCE,
          'Quel réflexe critique Sami a-t-il eu ?',
          'chercher la source de l’information',
          [
            ['partager la vidéo à tous ses contacts', 'Il vérifie avant de diffuser.'],
            ['croire la vidéo parce qu’elle est alarmante', 'Il ne s’arrête pas à son émotion.'],
            ['compter les vues de la vidéo', 'Le texte parle de l’origine, pas de l’audience.'],
          ],
          'Il remonte à l’origine et compare avec un document public.',
        ),
        lecture(
          COMPLOT,
          'Quel élément du message rappelle un discours complotiste ?',
          'l’idée qu’on cacherait tout en secret, sans preuve',
          [
            ['la mention d’un gymnase', 'Parler d’un lieu n’a rien de complotiste.'],
            ['le fait que ce soit une vidéo', 'Le format ne suffit pas à juger.'],
            ['l’annonce publique de travaux', 'Elle vient du compte rendu officiel, pas du message.'],
          ],
          'Affirmer un secret caché sans preuve est typique de ce type de récit.',
        ),
      ],
    },
    {
      title: 'Le débat sur la cantine',
      lines: [
        'En classe, Lina affirme : « Le menu du lundi comporte des lentilles, c’est affiché. »',
        'Noé répond : « Je trouve les lentilles délicieuses. »',
        'Puis il ajoute : « Je me suis trompé, j’avais confondu avec le mardi. »',
      ],
      qs: [
        lecture(
          DISTINCTION,
          'La première phrase de Noé exprime…',
          'une opinion',
          [
            ['un savoir vérifiable', 'Trouver un plat délicieux dépend des goûts.'],
            ['une règle de loi', 'Il ne s’agit pas d’une règle.'],
            ['un résultat de sondage', 'Une seule personne donne son avis.'],
          ],
          'C’est un avis personnel : on peut le partager ou non.',
        ),
        lecture(
          MODESTIE,
          'Quelle qualité Noé montre-t-il à la fin ?',
          'la modestie : il accepte de s’être trompé',
          [
            ['la crédulité : il croit tout', 'Il corrige sa propre erreur.'],
            ['l’indifférence : il ne répond pas', 'Il répond et rectifie.'],
            ['l’autorité : il impose son avis', 'Il reconnaît au contraire une erreur.'],
          ],
          'Reconnaître son erreur fait partie de l’esprit critique.',
        ),
      ],
    },
  ],
};

export const MEDIAS_OPINION_SKILLS: readonly Skill[] = [medias, sondages, opinion, critique].map(notion);
