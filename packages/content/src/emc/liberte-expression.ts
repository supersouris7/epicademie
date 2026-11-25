import type { Skill } from '../types.ts';
import { notion, type Citation, type DocQuestion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * 4e, « Liberté d’expression » (lot em-4e-02) : contenus du programme d’EMC du 13 juin 2024 sur la liberté
 * d’expression en ligne et hors ligne, ses atouts, ses abus et ses limites, la liberté de la presse et la guerre
 * informationnelle (classe de 4e, « Défendre les droits et les libertés »). Chaque fait cite le programme (registre
 * `emc-2024`), la DDHC, la loi de 1881 (Légifrance), la Charte des droits fondamentaux (EUR-Lex) ou une page Vie
 * publique, avec sa citation exacte. Les textes à lire du niveau 5 sont écrits pour l’exercice (personnes inventées).
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 4e : « Défendre les droits et les libertés », liberté d’expression et liberté de la presse';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 4e.';

/** Citation d’un texte du registre des sources. */
const cite =
  (id: string, label: string) =>
  (quote: string): Citation => ({ quote, from: { id, label } });
const prog = (quote: string): Citation => ({ quote });

const ddhc = cite('ddhc-1789', 'la Déclaration des droits de l’homme et du citoyen');
const loi = cite('loi-presse-1881', 'la loi de 1881 sur la liberté de la presse');
const charte = cite('ue-charte-droits', 'la Charte des droits fondamentaux de l’Union européenne');
const vpExpression = cite('vie-publique-expression', 'le site Vie publique');
const vpPresse = cite('vie-publique-presse', 'le site Vie publique');
const vpDsa = cite('vie-publique-dsa', 'le site Vie publique');
const vpViginum = cite('vie-publique-viginum-2022', 'le site Vie publique');
const vpPlateformes = cite('vie-publique-desinformation-2026', 'le site Vie publique');
const vpStrategie = cite('vie-publique-strategie-manipulation-2026', 'le site Vie publique');

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

// ——— Citations exactes : programme de 4e ———

const EN_LIGNE = prog(
  'mais aussi de leurs opinions et croyances (liberté d’opinion, liberté de conscience), ainsi que d’exprimer celles-ci (liberté d’expression), y compris en ligne',
);
const PRESSE_COLLECTIVE = prog(
  'de s’engager dans la vie de la société (droit de réunion, d’association, de manifestation, droit syndical, liberté de la presse)',
);
const BORNES_LOI = prog(
  'nos libertés sont toutefois encadrées par la loi et limitées, en premier lieu par les libertés des autres',
);
const NOUVEAUX_ENJEUX = prog('nouveaux enjeux comme la guerre informationnelle et la cyberdéfense');
const VIGINUM_PROGRAMME = prog(
  'À partir de l’étude de tentatives d’ingérences étrangères repérées par VIGINUM, comprendre les mécanismes et enjeux de la guerre informationnelle',
);

// ——— Citations exactes : DDHC (Légifrance) ———

const ART4 = ddhc('La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui');
const ART4_BORNES = ddhc('Ces bornes ne peuvent être déterminées que par la Loi');
const ART10 = ddhc(
  'Nul ne doit être inquiété pour ses opinions, même religieuses, pourvu que leur manifestation ne trouble pas l’ordre public établi par la Loi',
);
const ART11 = ddhc('La libre communication des pensées et des opinions est un des droits les plus précieux de l’homme');
const ART11_ABUS = ddhc(
  'tout Citoyen peut donc parler, écrire, imprimer librement, sauf à répondre de l’abus de cette liberté',
);

// ——— Citations exactes : Vie publique, liberté d’expression ———

const FORMES = vpExpression('le droit d’exprimer ses opinions (sous la forme écrite, orale, audiovisuelle...)');
const CONDITIONNE = vpExpression(
  'La liberté d’expression permet et conditionne l’exercice d’autres droits et libertés tels que la liberté d’opinion, la liberté de la presse, la liberté de manifestation ou le droit de grève',
);
const GARANTIE = vpExpression(
  'une liberté d’autant plus précieuse que son existence est une des garanties essentielles du respect des autres droits et libertés',
);
const CEDH = vpExpression(
  'comprend la liberté d’opinion et la liberté de recevoir ou de communiquer des informations ou des idées sans qu’il puisse y avoir ingérence d’autorités publiques et sans considération de frontière',
);
const INTERNET = vpExpression(
  'Elle implique donc la liberté de la presse, la liberté de la communication audiovisuelle et la liberté d’expression sur le réseau internet',
);
const RESPECT = vpExpression(
  'Ainsi, les propos diffamatoires, racistes, incitant à la haine raciale ou au meurtre sont punis par la loi',
);
const MOTIFS = vpExpression(
  'de protection de droits de la personnalité visant à éviter toute diffamation, discrimination ou atteinte excessive à la vie privée d’autrui',
);
const RESERVE = vpExpression('relatifs au devoir de réserve qui pèse sur les agents publics');
const SECRET_DEFENSE = vpExpression(
  'de protection de certains documents, notamment ceux relatifs au secret de la défense nationale',
);

// ——— Citations exactes : loi de 1881 (Légifrance) ———

const LIBRES = loi('L’imprimerie et la librairie sont libres');
const SECRET = loi(
  'Le secret des sources des journalistes est protégé dans l’exercice de leur mission d’information du public',
);
const JOURNALISTE = loi(
  'y pratique, à titre régulier et rétribué, le recueil d’informations et leur diffusion au public',
);
const ATTEINTE = loi(
  'Il ne peut être porté atteinte directement ou indirectement au secret des sources que si un impératif prépondérant d’intérêt public le justifie',
);
const ELECTRONIQUE = loi('soit par tout moyen de communication au public par voie électronique');
const DIFFAMATION = loi(
  'Toute allégation ou imputation d’un fait qui porte atteinte à l’honneur ou à la considération de la personne ou du corps auquel le fait est imputé est une diffamation',
);
const INJURE = loi(
  'Toute expression outrageante, termes de mépris ou invective qui ne renferme l’imputation d’aucun fait est une injure',
);
const AMENDE = loi(
  'La diffamation commise envers les particuliers par l’un des moyens énoncés en l’article 23 sera punie d’une amende de 12 000 euros',
);
const HAINE = loi(
  'auront provoqué à la discrimination, à la haine ou à la violence à l’égard d’une personne ou d’un groupe de personnes à raison de leur origine',
);

// ——— Citations exactes : presse, Charte, DSA ———

const FONDEMENT_PRESSE = vpPresse(
  'Principe fondamental des systèmes démocratiques, la liberté de la presse est inscrite dans',
);
const LOI_DEFINIT = vpPresse(
  'La loi du 29 juillet 1881 sur la liberté de la presse définit les libertés et responsabilités de la presse française',
);
const PLURALISME = vpPresse(
  'reconnaît le pluralisme des quotidiens d’information politique et générale comme étant “en lui-même un objectif de valeur constitutionnelle”',
);
const AIDES = vpPresse('La France a fait le choix de soutenir la presse écrite par des financements publics');
const INTERNET_LOI = vpPresse('l’ensemble de la législation existante s’applique aux acteurs d’internet');
const LOIS_2018 = vpPresse(
  'ces lois "anti-fake news" autorisent un candidat ou un parti à saisir le juge des référés pour faire cesser la diffusion de fausses informations durant les trois mois précédant un scrutin national',
);
const SPONSORISES = vpPresse(
  'Les principales plateformes numériques ont l’obligation de signaler les contenus politiques sponsorisés, en publiant le nom de leur auteur et la somme payée',
);
const MEDIAS_CHARTE = charte('La liberté des médias et leur pluralisme sont respectés');
const HORS_LIGNE = vpDsa('ce qui est illégal hors ligne est illégal en ligne');

// ——— Citations exactes : manipulation de l’information ———

const VIGINUM = vpViginum(
  'un service de vigilance et de protection contre les ingérences numériques étrangères (Viginum)',
);
const MISSION = vpViginum(
  'Il a pour mission de détecter et de caractériser ces campagnes de manipulation de l’information en ligne qui visent à nuire aux intérêts fondamentaux de la France',
);
const CRITERES = vpViginum('une diffusion des contenus artificielle ou automatisée, massive et délibérée');
const PUBLICS = vpViginum('explore les contenus publiquement accessibles sur les plateformes en ligne');
const MOTIVATIONS = vpPlateformes(
  'La manipulation de l’information est généralement motivée par un objectif lucratif (escroqueries, monétisation de l’attention, publicités ciblées) ou politique',
);
const PRATIQUES = vpPlateformes(
  'Création de faux comptes ou réseaux inauthentiques, faux forums, tromperies sur des noms de domaines pour usurper l’identité d’une organisation',
);
const VIRALITE = vpStrategie(
  'des plateformes qui reposent sur un modèle favorisant la viralité au détriment de la fiabilité et de la hiérarchisation éditoriale',
);
const RECOUPEMENT = cite(
  'cycle4-2020',
  'le programme de français du collège',
)('comprendre l’importance de la vérification et du recoupement des sources');

// ——— Notion 1 : la liberté d’expression, en ligne et hors ligne ———

const enLigne: Notion = {
  id: 'em4-expression-en-ligne',
  title: 'La liberté d’expression, en ligne et hors ligne',
  hint: 'Repense au mémo : ce que protège cette liberté, où elle s’exerce, les textes qui la fondent et ce qu’elle permet.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **liberté d’expression** est le droit d’exprimer ses **opinions**, à l’écrit, à l’oral ou en images. Elle est fondée sur l’article 11 de la **DDHC** et aussi garantie par des textes européens.',
    'Elle s’exerce **hors ligne** et **en ligne** : sur internet, elle est protégée et la loi s’applique, même sous **pseudonyme**. Un **réseau social** n’est pas un espace de **non-droit**.',
    'Ses atouts : elle permet d’autres libertés (presse, manifestation, grève) et aide à protéger tous les droits. Exemple : publier une critique d’une décision publique est une façon d’exercer cette liberté.',
  ],
  faits: [
    fait(
      FORMES,
      ['Que permet la liberté d’expression ?', 'exprimer ses opinions'],
      [
        ['imposer ses opinions aux autres', 'S’exprimer n’est pas forcer les autres à penser comme soi.'],
        ['publier la vie privée d’autrui', 'La liberté de l’un ne doit pas nuire aux autres.'],
        ['faire taire ceux qui ne sont pas d’accord', 'Les autres ont la même liberté de s’exprimer.'],
      ],
      ['La liberté d’expression est le droit d’exprimer ses ', '.', ['opinions', 'opinion']],
      'Les opinions peuvent s’exprimer à l’écrit, à l’oral ou par l’image.',
    ),
    fait(
      INTERNET,
      ['Où la liberté d’expression s’exerce-t-elle ?', 'hors ligne comme sur internet'],
      [
        ['seulement dans les journaux sur papier', 'Elle concerne aussi la parole, l’audiovisuel et internet.'],
        ['seulement sur internet', 'Elle existait avant internet et vaut aussi hors ligne.'],
        ['seulement dans les assemblées d’élus', 'C’est une liberté de tout individu, pas des seuls élus.'],
      ],
      ['La liberté d’expression vaut aussi sur le réseau ', '.', ['internet', 'Internet']],
      'La liberté d’expression sur internet fait partie de la liberté d’expression.',
    ),
    fait(
      ART11,
      [
        'Quelle libre communication la DDHC présente-t-elle comme un des droits les plus précieux ?',
        'celle des pensées et des opinions',
      ],
      [
        ['celle des marchandises', 'L’article 11 parle des idées, pas du commerce.'],
        ['celle des secrets de la défense', 'Ces documents sont au contraire protégés.'],
        ['celle des données personnelles d’autrui', 'La vie privée d’autrui est protégée.'],
      ],
      ['La libre communication des pensées et des ', ' est un des droits les plus précieux de l’homme.', ['opinions']],
      'C’est l’article 11 de la DDHC de 1789, fondement de la liberté d’expression.',
    ),
    fait(
      HORS_LIGNE,
      ['Un propos interdit par la loi dans la rue l’est-il aussi sur internet ?', 'oui, il est également illégal'],
      [
        ['non, internet n’a pas de loi', 'Internet n’est pas un espace de non-droit.'],
        ['seulement si son auteur donne son vrai nom', 'Un pseudonyme ne supprime pas la loi.'],
        ['seulement si des milliers de personnes le lisent', 'L’illégalité ne dépend pas d’un nombre de lecteurs.'],
      ],
      ['Ce qui est illégal hors ligne est illégal en ', '.', ['ligne']],
      'Le droit européen des services numériques part de ce principe.',
    ),
    fait(
      CONDITIONNE,
      [
        'Quelle liberté permet et conditionne la liberté de la presse et la liberté de manifestation ?',
        'la liberté d’expression',
      ],
      [
        ['la liberté de circulation', 'Elle concerne les déplacements.'],
        ['le droit de propriété', 'Il protège les biens, pas la parole.'],
        ['le secret de la défense nationale', 'C’est un motif de limite, pas une liberté.'],
      ],
      [
        'La liberté d’',
        ' permet et conditionne l’exercice d’autres libertés, comme la liberté de la presse.',
        ['expression'],
      ],
      'Sans pouvoir s’exprimer, on ne peut ni informer, ni manifester.',
    ),
    expert(
      fait(
        CEDH,
        [
          'D’après la Convention européenne des droits de l’homme, que comprend aussi la liberté d’expression ?',
          'recevoir et communiquer des informations ou des idées',
        ],
        [
          [
            'contrôler ce que les autres ont le droit de lire',
            'La Convention protège la circulation des idées, elle ne donne pas ce contrôle.',
          ],
          ['ne publier qu’avec l’accord du gouvernement', 'Le texte écarte l’ingérence des autorités publiques.'],
          ['s’exprimer seulement à l’intérieur de son pays', 'Le texte dit « sans considération de frontière ».'],
        ],
        [
          'La liberté d’expression comprend la liberté de recevoir ou de communiquer des ',
          ' ou des idées.',
          ['informations', 'information'],
        ],
        'L’article 10 de la Convention protège celui qui parle et celui qui s’informe.',
      ),
    ),
    expert(
      fait(
        GARANTIE,
        [
          'Pourquoi le Conseil constitutionnel juge-t-il la liberté d’expression particulièrement précieuse ?',
          'elle est une garantie essentielle du respect des autres droits et libertés',
        ],
        [
          ['elle remplace toutes les autres libertés', 'Elle les protège, elle ne les remplace pas.'],
          ['elle n’a aucune limite', 'L’article 11 de la DDHC prévoit lui-même l’abus.'],
          ['elle est réservée aux journalistes', 'C’est un droit de tout individu.'],
        ],
        [
          'La liberté d’expression est une des ',
          ' essentielles du respect des autres droits et libertés.',
          ['garanties', 'garantie'],
        ],
        'Pouvoir dénoncer une atteinte aide à faire respecter tous les droits.',
      ),
    ),
    expert(
      fait(
        INTERNET_LOI,
        [
          'D’après le Conseil d’État, qu’est-ce qui s’applique aux acteurs d’internet ?',
          'l’ensemble de la législation existante',
        ],
        [
          ['aucune loi, tant qu’une loi spéciale n’est pas votée', 'Les lois existantes s’appliquent déjà.'],
          ['les seules règles choisies par chaque site', 'Un règlement de site ne remplace pas la loi.'],
          ['les lois sur la presse écrite sur papier uniquement', 'C’est toute la législation existante.'],
        ],
        ['L’ensemble de la ', ' existante s’applique aux acteurs d’internet.', ['législation', 'legislation']],
        'Cette étude de 1998 écarte l’idée d’un internet sans règles.',
      ),
    ),
  ],
  paires3: [
    ['Liberté d’expression', 'Droit d’exprimer ses opinions'],
    ['Hors ligne', 'En dehors d’internet'],
    ['Pseudonyme', 'Faux nom que l’on choisit'],
  ],
  paires5: [
    ['Article 11 de la DDHC', 'Libre communication des pensées et des opinions'],
    ['Article 10 de la Convention européenne', 'Recevoir et communiquer des idées sans considération de frontière'],
    ['Conseil constitutionnel', 'Y voit une garantie des autres droits et libertés'],
    ['Liberté de manifestation', 'Exprimer une opinion ou soutenir une cause à plusieurs dans la rue'],
    ['Non-droit', 'Situation sans loi'],
  ],
  libres: [
    libre(
      ART11,
      'en chiffres, quel article de la DDHC protège la libre communication des pensées et des opinions ?',
      ['11', 'article 11', 'l’article 11'],
      [
        ['4', 'L’article 4 définit la liberté : ne pas nuire à autrui.'],
        ['1', 'L’article 1 affirme la liberté et l’égalité en droits.'],
      ],
      'L’article 11 est le fondement de la liberté d’expression dans la DDHC.',
    ),
    libre(
      EN_LIGNE,
      'quelle liberté permet d’exprimer ses opinions et croyances, y compris en ligne ? La liberté d’…',
      ['expression', 'd’expression', 'liberté d’expression', 'la liberté d’expression'],
      [
        ['association', 'La liberté d’association permet de s’unir à d’autres.'],
        ['opinion', 'La liberté d’opinion permet de penser ; l’exprimer relève d’une autre liberté.'],
      ],
      'Le programme précise que cette liberté vaut aussi en ligne.',
    ),
    libre(
      INTERNET_LOI,
      'comment nomme-t-on une situation sans loi ? Internet n’est pas un espace de …',
      ['non-droit', 'non droit', 'le non-droit'],
      [
        ['liberté', 'Internet permet de s’exprimer : on cherche le mot qui désigne l’absence de loi.'],
        ['droit', 'Au contraire : le droit s’applique sur internet.'],
      ],
      'La législation existante s’applique en ligne : internet n’est pas un espace de non-droit.',
    ),
  ],
  docs: [
    {
      title: 'Le blog d’Inès',
      lines: [
        'Inès tient un blog sur la vie de son quartier.',
        'Elle y écrit qu’elle désapprouve le projet de fermer la bibliothèque.',
        'Des habitants lui répondent : certains partagent son avis, d’autres non.',
        'Le samedi, plusieurs d’entre eux manifestent devant la mairie.',
      ],
      qs: [
        lecture(
          FORMES,
          'En publiant son désaccord sur son blog, quelle liberté Inès exerce-t-elle ?',
          'la liberté d’expression, en ligne',
          [
            ['la liberté de circulation, en ligne', 'La liberté de circulation concerne les déplacements.'],
            ['aucune, un blog ne compte pas', 'La liberté d’expression vaut aussi sur internet.'],
            ['le droit de grève', 'Elle n’interrompt pas un travail : elle publie son avis.'],
          ],
          'Donner son opinion sur un blog, c’est s’exprimer en ligne.',
        ),
        lecture(
          CONDITIONNE,
          'Quel lien le rassemblement du samedi a-t-il avec la liberté d’expression ?',
          'il exprime à plusieurs une opinion, ce que cette liberté rend possible',
          [
            ['aucun : manifester interdit de parler', 'Manifester est justement une façon de s’exprimer.'],
            ['il remplace le blog, qui devient interdit', 'Les deux façons de s’exprimer coexistent.'],
            ['il n’est permis qu’aux journalistes', 'La liberté de manifestation n’est pas réservée à un métier.'],
          ],
          'La liberté d’expression permet et conditionne la liberté de manifestation.',
        ),
      ],
    },
    {
      title: 'Un avis sous un autre nom',
      lines: [
        'Sur un forum, un internaute signe ses messages « Lynx42 ».',
        'Il critique le nouvel horaire de la piscine municipale.',
        'Une semaine plus tard, il publie des menaces contre le directeur.',
        'Un camarade pense que le pseudonyme le met hors d’atteinte de la loi.',
      ],
      qs: [
        lecture(
          HORS_LIGNE,
          'Le camarade a-t-il raison à propos des menaces ?',
          'non : ce qui est illégal hors ligne l’est aussi en ligne',
          [
            ['oui : un pseudonyme supprime la loi', 'Un faux nom ne supprime pas la loi.'],
            ['oui : un forum est un espace de non-droit', 'Internet n’est pas un espace de non-droit.'],
            ['oui : il avait d’abord donné un avis permis', 'Un premier message permis n’autorise pas les suivants.'],
          ],
          'La loi s’applique en ligne comme hors ligne.',
        ),
        lecture(
          FORMES,
          'Quel message relève clairement de l’expression d’une opinion ?',
          'la critique du nouvel horaire de la piscine',
          [
            ['les menaces contre le directeur', 'Menacer quelqu’un n’est pas donner un avis sur une question.'],
            ['les menaces, parce qu’elles sont signées d’un pseudonyme', 'La signature ne change pas le contenu.'],
            ['aucun, car critiquer est interdit', 'Critiquer une décision fait partie du débat.'],
          ],
          'Critiquer un horaire, c’est exprimer une opinion.',
        ),
      ],
    },
  ],
};

// ——— Notion 2 : les limites fixées par la loi ———

const limites: Notion = {
  id: 'em4-limites-expression',
  title: 'Les limites fixées par la loi',
  hint: 'Repense au mémo : qui fixe les bornes, ce qui distingue la diffamation de l’injure et ce que la loi punit.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La liberté d’expression a des limites : on doit répondre de ses **abus**, dans les cas fixés par la **loi**. Elle ne permet pas de nuire à **autrui**.',
    'La loi de 1881 distingue la **diffamation** (affirmer un fait qui porte atteinte à l’honneur d’une personne) de l’**injure** (une insulte ou du mépris sans aucun fait). Elle punit aussi la **provocation à la haine** ou à la violence en raison de l’origine, et elle vise les publications en ligne.',
    'Exemple : écrire « ce commerçant a volé sa caisse » affirme un fait ; le traiter d’un nom méprisant est une injure. D’autres limites protègent la **vie privée** et le secret de la défense nationale.',
  ],
  faits: [
    fait(
      ART4_BORNES,
      ['Qui peut fixer les bornes de la liberté, d’après la DDHC ?', 'la loi'],
      [
        ['la personne la plus influente', 'La popularité ne donne pas le droit de limiter la liberté.'],
        ['chaque personne, pour les autres', 'Personne ne fixe seul les limites de la liberté d’autrui.'],
        ['les entreprises privées seules', 'La DDHC réserve la fixation des bornes à la loi.'],
      ],
      ['Les bornes de la liberté ne peuvent être déterminées que par la ', '.', ['loi']],
      'Les limites sont connues de tous et votées : elles ne dépendent pas d’une volonté particulière.',
    ),
    fait(
      ART11_ABUS,
      ['De quoi chaque citoyen doit-il répondre, quand il parle ou écrit librement ?', 'de l’abus de cette liberté'],
      [
        ['de chacune de ses opinions, même permise', 'Seul l’abus engage sa responsabilité.'],
        ['de rien : la liberté est totale', 'L’article 11 prévoit qu’on réponde de l’abus.'],
        ['des paroles de tous les autres citoyens', 'Chacun répond de ce qu’il exprime.'],
      ],
      ['Tout citoyen peut parler librement, sauf à répondre de l’', ' de cette liberté.', ['abus']],
      'La liberté est le principe ; l’abus, dans les cas fixés par la loi, est sanctionné.',
    ),
    fait(
      DIFFAMATION,
      [
        'Comment appelle-t-on l’affirmation d’un fait qui porte atteinte à l’honneur d’une personne ?',
        'une diffamation',
      ],
      [
        ['une injure', 'L’injure ne contient l’affirmation d’aucun fait.'],
        ['une opinion protégée sans limite', 'La loi encadre ce type d’affirmation.'],
        ['un secret des sources', 'Le secret des sources protège les journalistes.'],
      ],
      ['Imputer à quelqu’un un fait qui porte atteinte à son honneur est une ', '.', ['diffamation']],
      'La diffamation repose sur un fait précis attribué à quelqu’un.',
    ),
    fait(
      INJURE,
      ['Comment appelle-t-on une expression de mépris qui n’affirme aucun fait ?', 'une injure'],
      [
        ['une diffamation', 'La diffamation suppose l’affirmation d’un fait.'],
        ['une information vérifiée', 'Une insulte n’informe sur aucun fait.'],
        ['une critique argumentée', 'Une critique avance des arguments, pas du mépris.'],
      ],
      ['Une expression outrageante qui n’impute aucun fait est une ', '.', ['injure']],
      'Pas de fait précis, mais un outrage ou du mépris : c’est l’injure.',
    ),
    fait(
      RESPECT,
      ['Lequel de ces propos est puni par la loi ?', 'un propos qui incite à la haine raciale'],
      [
        ['un désaccord poli sur un film', 'Donner un avis est permis.'],
        ['une critique argumentée d’un projet municipal', 'Débattre d’une décision est permis.'],
        ['un avis sur le menu de la cantine', 'C’est une opinion qui ne vise personne.'],
      ],
      ['Les propos incitant à la ', ' raciale sont punis par la loi.', ['haine']],
      'La liberté d’expression implique le respect d’autrui.',
    ),
    fait(
      ART10,
      [
        'À quelle condition nul ne doit-il être inquiété pour ses opinions, même religieuses ?',
        'que leur manifestation ne trouble pas l’ordre public établi par la loi',
      ],
      [
        ['qu’il ne les exprime jamais', 'L’article 10 envisage justement leur manifestation.'],
        ['qu’elles soient celles de la majorité', 'La protection vaut aussi pour les opinions minoritaires.'],
        ['qu’il les fasse approuver par le maire', 'Aucune approbation préalable n’est demandée.'],
      ],
      ['Les opinions sont libres si leur manifestation ne trouble pas l’ordre ', ' établi par la loi.', ['public']],
      'L’article 10 de la DDHC protège les opinions et fixe une limite : l’ordre public établi par la loi.',
    ),
    expert(
      fait(
        MOTIFS,
        [
          'Au nom de quoi la liberté d’expression peut-elle être limitée pour éviter une atteinte excessive à la vie privée d’autrui ?',
          'de la protection des droits de la personnalité',
        ],
        [
          ['du secret des sources', 'Il protège les informateurs des journalistes.'],
          ['de la popularité de l’auteur', 'La popularité n’est pas un motif juridique.'],
          ['de la viralité des messages', 'La viralité est un mode de diffusion, pas un droit à protéger.'],
        ],
        [
          'La protection des droits de la personnalité vise à éviter une atteinte excessive à la vie ',
          ' d’autrui.',
          ['privée', 'privee'],
        ],
        'Les droits de la personnalité protègent notamment l’honneur et la vie privée.',
      ),
    ),
    expert(
      fait(
        HAINE,
        [
          'Quel acte la loi de 1881 punit-elle quand des personnes sont visées à raison de leur origine ?',
          'la provocation à la discrimination, à la haine ou à la violence',
        ],
        [
          ['le simple fait de parler d’un pays étranger', 'Parler d’un pays ne provoque pas à la haine.'],
          ['l’étude de l’histoire des migrations', 'Étudier un sujet n’est pas inciter à la haine.'],
          ['la critique d’un tarif de transport', 'Cette critique ne vise personne à raison de son origine.'],
        ],
        ['La loi punit la provocation à la discrimination, à la haine ou à la ', '.', ['violence']],
        'La loi vise le fait de pousser d’autres personnes à haïr ou à agir.',
      ),
    ),
    expert(
      fait(
        ELECTRONIQUE,
        [
          'La loi de 1881 vise-t-elle des propos diffusés par voie électronique ?',
          'oui, comme ceux diffusés par d’autres moyens publics',
        ],
        [
          ['non, elle ne vise que les journaux sur papier', 'Elle cite aussi la communication par voie électronique.'],
          ['non, car elle a été votée avant internet', 'La loi a été modifiée depuis 1881.'],
          ['seulement quand ils sont aussi imprimés', 'La voie électronique est un moyen cité à part entière.'],
        ],
        ['La loi vise tout moyen de communication au public par voie ', '.', ['électronique', 'electronique']],
        'Le texte ancien, modifié, s’applique aux publications en ligne.',
      ),
    ),
    expert(
      fait(
        AMENDE,
        [
          'Quelle peine la loi de 1881 prévoit-elle pour la diffamation publique envers un particulier ?',
          'une amende de 12 000 euros',
        ],
        [
          ['aucune sanction', 'La diffamation est un abus puni par la loi.'],
          ['une amende de 12 euros', 'Le montant prévu est mille fois plus élevé.'],
          ['la seule fermeture de son compte', 'La loi prévoit une amende, pas une règle de site.'],
        ],
        ['La diffamation publique envers un particulier est punie d’une amende de ', ' euros.', ['12 000', '12000']],
        'C’est le montant fixé par l’article 32 ; la loi prévoit des peines plus lourdes en cas de diffamation raciste.',
      ),
    ),
  ],
  paires3: [
    ['Diffamation', 'Fait affirmé qui porte atteinte à l’honneur'],
    ['Injure', 'Mépris ou insulte sans aucun fait'],
    ['Loi', 'Seule à pouvoir fixer les bornes de la liberté'],
  ],
  paires5: [
    ['Article 4 de la DDHC', 'La liberté ne doit pas nuire à autrui'],
    ['Article 10 de la DDHC', 'Opinions libres si leur manifestation ne trouble pas l’ordre public'],
    ['Provocation à la haine', 'Pousser à haïr des personnes à raison de leur origine'],
    ['Devoir de réserve', 'Limite qui pèse sur les agents publics'],
    ['Secret de la défense nationale', 'Protection de certains documents'],
  ],
  libres: [
    libre(
      ART4,
      'complète l’article 4 de la DDHC : la liberté consiste à pouvoir faire tout ce qui ne nuit pas à …',
      ['autrui', 'à autrui'],
      [
        ['soi', 'La borne fixée par l’article 4 est le tort fait aux autres.'],
        ['l’État', 'Le texte vise les autres membres de la société.'],
      ],
      '« Autrui » désigne les autres personnes : là commence la limite.',
    ),
    libre(
      SECRET_DEFENSE,
      'certains documents sont protégés, ce qui limite l’expression : le secret de la défense …',
      ['nationale', 'défense nationale', 'la défense nationale'],
      [
        ['civile', 'L’expression consacrée est « défense nationale ».'],
        ['privée', 'Ce secret concerne la protection du pays.'],
      ],
      'Le secret de la défense nationale protège des informations sensibles pour le pays.',
    ),
    libre(
      DIFFAMATION,
      'comment s’appelle l’abus qui consiste à imputer à une personne un fait portant atteinte à son honneur ?',
      ['diffamation', 'la diffamation', 'une diffamation'],
      [
        ['injure', 'L’injure n’impute aucun fait.'],
        ['désinformation', 'La désinformation ne vise pas forcément l’honneur d’une personne.'],
      ],
      'Un fait imputé qui atteint l’honneur : c’est une diffamation.',
    ),
    libre(
      INJURE,
      'comment la loi nomme-t-elle une invective qui ne contient l’imputation d’aucun fait ?',
      ['injure', 'une injure', 'l’injure'],
      [
        ['diffamation', 'La diffamation suppose un fait imputé.'],
        ['critique', 'Une critique argumentée n’est pas une invective.'],
      ],
      'Sans fait imputé, une invective est une injure.',
    ),
    libre(
      RESERVE,
      'quel devoir limite l’expression des opinions des agents publics ? Le devoir de …',
      ['réserve', 'reserve', 'devoir de réserve'],
      [
        ['grève', 'La grève est un droit, pas un devoir.'],
        ['vote', 'Le vote ne limite pas l’expression des agents publics.'],
      ],
      'Le devoir de réserve exige une certaine neutralité des agents publics dans l’expression de leurs opinions.',
    ),
  ],
  docs: [
    {
      title: 'Deux messages sur un groupe',
      lines: [
        'Hugo écrit sur un groupe public : « Le boulanger de la place a volé l’argent du club. »',
        'Il n’en apporte aucune preuve.',
        'Léa ajoute, à propos du même homme, un surnom méprisant, sans rien raconter.',
        'Le boulanger envisage de porter plainte.',
      ],
      qs: [
        lecture(
          DIFFAMATION,
          'Quel abus le message de Hugo peut-il constituer ?',
          'une diffamation',
          [
            ['une injure', 'Hugo ne se contente pas d’une insulte : il affirme un fait.'],
            ['un secret des sources', 'Cette notion protège le travail des journalistes.'],
            ['aucun, puisque c’est en ligne', 'La loi s’applique aux publications électroniques.'],
          ],
          'Il impute un fait, un vol, qui atteint l’honneur du boulanger.',
        ),
        lecture(
          INJURE,
          'Comment qualifier plutôt le message de Léa ?',
          'une injure',
          [
            ['une diffamation', 'Léa n’affirme aucun fait précis.'],
            ['une opinion argumentée', 'Un surnom méprisant n’apporte aucun argument.'],
            ['une enquête de presse', 'Rien n’est recherché ni vérifié.'],
          ],
          'Du mépris sans fait imputé : c’est la définition de l’injure.',
        ),
      ],
    },
    {
      title: 'Un débat sur un projet',
      lines: [
        'La commune veut supprimer des places de stationnement.',
        'Mehdi publie : « Je suis contre ce projet, voici mes trois raisons. »',
        'Un autre message appelle à s’en prendre aux habitants venus d’un autre pays.',
        'Le gestionnaire du groupe doit décider quoi signaler.',
      ],
      qs: [
        lecture(
          HAINE,
          'Quel message doit être signalé comme contraire à la loi ?',
          'l’appel à s’en prendre à des habitants à raison de leur origine',
          [
            ['le désaccord argumenté de Mehdi', 'Critiquer un projet public est permis.'],
            ['les deux, car tout désaccord est interdit', 'Le désaccord est permis.'],
            ['aucun : le groupe parle de stationnement', 'Le sujet de départ n’autorise pas un appel à la violence.'],
          ],
          'La loi punit la provocation à la violence ou à la haine à raison de l’origine.',
        ),
        lecture(
          BORNES_LOI,
          'Pourquoi la liberté d’expression ne protège-t-elle pas ce second message ?',
          'elle est encadrée par la loi et limitée par les droits des autres',
          [
            ['elle ne vaut que pour les habitants favorables au projet', 'Elle vaut pour tous, favorables ou non.'],
            ['elle n’existe pas sur internet', 'Elle existe en ligne, avec ses limites.'],
            ['le gestionnaire du groupe fait la loi', 'Seule la loi fixe les bornes.'],
          ],
          'La liberté de chacun s’arrête où commencent les atteintes aux autres.',
        ),
      ],
    },
  ],
};

// ——— Notion 3 : les médias et la liberté de la presse ———

const medias: Notion = {
  id: 'em4-medias-presse',
  title: 'Les médias et la liberté de la presse',
  hint: 'Repense au mémo : les textes qui protègent la presse, la protection des journalistes et la diversité des médias.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **liberté de la presse** est un principe fondamental des démocraties et une liberté collective. En France, la loi du 29 juillet 1881 définit les libertés et les responsabilités de la **presse**.',
    'Un **journaliste** recueille des informations et les diffuse au public. Le **secret des sources** protège cette mission : on ne peut y porter atteinte que pour un impératif prépondérant d’intérêt public.',
    'Les **médias** sont aussi protégés par la Charte des droits fondamentaux de l’Union européenne, avec leur **pluralisme**. Exemple : plusieurs journaux indépendants permettent de comparer les points de vue.',
  ],
  faits: [
    fait(
      LOI_DEFINIT,
      ['Quelle loi définit les libertés et les responsabilités de la presse française ?', 'la loi du 29 juillet 1881'],
      [
        ['la loi de 1905', 'La loi de 1905 sépare les Églises et l’État.'],
        ['la DDHC de 1789', 'La DDHC proclame la liberté ; elle n’est pas la loi sur la presse.'],
        ['la Charte de l’environnement', 'Elle porte sur l’environnement.'],
      ],
      ['La loi sur la liberté de la presse date du 29 juillet ', '.', ['1881']],
      'Cette loi, modifiée plusieurs fois, reste le grand texte sur la presse.',
    ),
    fait(
      LIBRES,
      ['D’après l’article 1 de la loi de 1881, qu’est-ce qui est libre ?', 'l’imprimerie et la librairie'],
      [
        ['la diffusion de fausses accusations', 'La loi prévoit des abus punis.'],
        ['la découverte forcée des sources des journalistes', 'La loi protège au contraire ces sources.'],
        ['la vie privée de chacun à publier', 'La vie privée d’autrui est protégée.'],
      ],
      ['L’imprimerie et la librairie sont ', '.', ['libres']],
      'C’est le premier article de la loi : il pose la liberté comme point de départ.',
    ),
    fait(
      FONDEMENT_PRESSE,
      ['De quels systèmes la liberté de la presse est-elle un principe fondamental ?', 'des systèmes démocratiques'],
      [
        ['des régimes où le pouvoir est arbitraire', 'Un pouvoir arbitraire ne se soumet pas à la critique.'],
        ['des systèmes de censure', 'La censure s’oppose à la liberté de la presse.'],
        ['des systèmes sans élections ni débats', 'La presse libre nourrit le débat démocratique.'],
      ],
      ['La liberté de la presse est un principe fondamental des systèmes ', '.', ['démocratiques', 'democratiques']],
      'Les citoyens ont besoin d’informations pour juger et choisir.',
    ),
    fait(
      PRESSE_COLLECTIVE,
      ['Dans quelle catégorie le programme classe-t-il la liberté de la presse ?', 'les libertés collectives'],
      [
        ['les devoirs des élèves', 'C’est une liberté, pas un devoir scolaire.'],
        ['les peines prononcées par un juge', 'Une liberté n’est pas une sanction.'],
        ['les impôts', 'La liberté de la presse n’est pas une contribution.'],
      ],
      ['La liberté de la presse fait partie des libertés ', '.', ['collectives']],
      'Elle permet de s’engager dans la vie de la société.',
    ),
    fait(
      SECRET,
      ['Qu’est-ce que la loi protège pour que les journalistes puissent informer le public ?', 'le secret des sources'],
      [
        ['le droit d’inventer des faits', 'Aucun droit n’autorise à inventer des faits.'],
        ['le droit de ne jamais répondre d’un abus', 'La presse a aussi des responsabilités.'],
        ['un monopole d’un seul journal', 'La diversité des médias est au contraire protégée.'],
      ],
      ['Le secret des ', ' des journalistes est protégé.', ['sources', 'source']],
      'Une personne parle plus librement si son identité reste protégée.',
    ),
    fait(
      JOURNALISTE,
      [
        'Quel travail la loi de 1881 attribue-t-elle au journaliste ?',
        'recueillir des informations et les diffuser au public',
      ],
      [
        ['juger les personnes accusées', 'Juger revient à la justice.'],
        ['voter les lois sur les médias', 'Voter la loi revient au Parlement.'],
        ['vendre des espaces publicitaires', 'La définition porte sur l’information, pas sur la vente.'],
      ],
      ['Le journaliste recueille des informations et les diffuse au ', '.', ['public']],
      'Pour la loi, c’est une activité exercée de façon régulière et rétribuée.',
    ),
    expert(
      fait(
        AIDES,
        ['Comment la France a-t-elle choisi de soutenir la presse écrite ?', 'par des financements publics'],
        [
          ['en choisissant les articles à publier', 'Soutenir la presse n’est pas écrire à sa place.'],
          ['en autorisant un seul journal', 'Les aides visent au contraire le pluralisme.'],
          ['en interdisant la presse en ligne', 'La presse en ligne n’est pas interdite.'],
        ],
        ['La France soutient la presse écrite par des financements ', '.', ['publics']],
        'Ces aides visent notamment la diffusion, le pluralisme et la modernisation de la presse.',
      ),
    ),
    expert(
      fait(
        ATTEINTE,
        [
          'Quelle seule raison peut justifier une atteinte au secret des sources ?',
          'un impératif prépondérant d’intérêt public',
        ],
        [
          ['la simple curiosité d’un responsable', 'La curiosité ne suffit jamais.'],
          ['la gêne causée par un article critique', 'Être critiqué ne justifie pas de découvrir les sources.'],
          ['la demande d’une entreprise concurrente', 'Un intérêt privé n’est pas l’intérêt public prévu par la loi.'],
        ],
        ['Il faut un impératif prépondérant d’intérêt ', ' pour porter atteinte au secret des sources.', ['public']],
        'La loi exige aussi des mesures strictement nécessaires et proportionnées.',
      ),
    ),
    expert(
      fait(
        MEDIAS_CHARTE,
        [
          'D’après la Charte des droits fondamentaux de l’Union européenne, que respecte-t-on avec la liberté des médias ?',
          'leur pluralisme',
        ],
        [
          ['leur silence', 'La Charte protège la liberté d’informer.'],
          ['leur contrôle par un seul groupe', 'Le pluralisme est le contraire d’une voix unique.'],
          ['leur gratuité', 'La Charte ne parle pas de prix.'],
        ],
        ['La liberté des médias et leur ', ' sont respectés.', ['pluralisme']],
        'Pluralisme : des médias variés, qui portent des points de vue différents.',
      ),
    ),
    expert(
      fait(
        PLURALISME,
        [
          'Quelle valeur le Conseil constitutionnel a-t-il donnée au pluralisme des quotidiens d’information politique ?',
          'un objectif de valeur constitutionnelle',
        ],
        [
          ['un simple conseil sans portée', 'La décision lui donne une valeur très élevée.'],
          ['une règle intérieure à chaque journal', 'C’est un objectif qui s’impose au-delà d’un journal.'],
          ['une tradition sans lien avec le droit', 'La décision en fait un objectif juridique.'],
        ],
        ['Le pluralisme est reconnu comme un objectif de valeur ', '.', ['constitutionnelle']],
        'En 1984, le Conseil constitutionnel a placé le pluralisme de la presse à un rang élevé.',
      ),
    ),
  ],
  paires3: [
    ['Journaliste', 'Recueille des informations et les diffuse au public'],
    ['Secret des sources', 'Protège l’identité de ceux qui informent le journaliste'],
    ['Pluralisme', 'Diversité des médias et des points de vue'],
  ],
  paires5: [
    ['Loi de 1881', 'Libertés et responsabilités de la presse'],
    ['Article 1 de la loi de 1881', 'Liberté de l’imprimerie et de la librairie'],
    ['Article 11 de la DDHC', 'Fondement de 1789 de la liberté de la presse'],
    ['Charte de l’Union européenne', 'Liberté des médias et pluralisme respectés'],
    ['Aides publiques à la presse', 'Financements pour soutenir la presse écrite'],
  ],
  libres: [
    libre(
      PLURALISME,
      'quel mot désigne la diversité des journaux et des points de vue que le droit protège ?',
      ['pluralisme', 'le pluralisme'],
      [
        ['monopole', 'Un monopole, c’est au contraire une seule voix.'],
        ['censure', 'La censure empêche de publier.'],
      ],
      'Le pluralisme permet de comparer plusieurs points de vue.',
    ),
    libre(
      SECRET,
      'quel secret des journalistes la loi de 1881 protège-t-elle ? Le secret des …',
      ['sources', 'des sources', 'source', 'secret des sources'],
      [
        ['salaires', 'La loi protège l’origine des informations.'],
        ['abonnés', 'Il s’agit de l’origine des informations, pas des lecteurs.'],
      ],
      'Les sources sont les personnes ou documents qui informent le journaliste.',
    ),
    libre(
      LOI_DEFINIT,
      'en quelle année a été votée la loi qui définit les libertés et responsabilités de la presse ? (en chiffres)',
      ['1881'],
      [
        ['1789', '1789 est l’année de la DDHC.'],
        ['2018', 'Les lois de 2018 visent la manipulation de l’information.'],
      ],
      'La loi du 29 juillet 1881 est la grande loi sur la presse.',
    ),
  ],
  docs: [
    {
      title: 'Une enquête locale',
      lines: [
        'Sarah, journaliste dans un hebdomadaire, enquête sur la pollution d’une rivière.',
        'Un salarié lui transmet des documents à condition de ne pas être nommé.',
        'Après la parution, le dirigeant de l’usine exige le nom de ce salarié.',
        'Sarah refuse de le donner.',
      ],
      qs: [
        lecture(
          SECRET,
          'Quelle protection Sarah peut-elle invoquer ?',
          'le secret des sources des journalistes',
          [
            ['le devoir de réserve des agents publics', 'Il concerne les agents publics, pas cette situation.'],
            ['le secret de la défense nationale', 'L’enquête ne porte pas sur la défense.'],
            ['la liberté de circulation', 'Elle concerne les déplacements.'],
          ],
          'La loi protège les sources dans la mission d’information du public.',
        ),
        lecture(
          ATTEINTE,
          'La seule exigence du dirigeant suffit-elle à lever cette protection ?',
          'non : il faut un impératif prépondérant d’intérêt public',
          [
            ['oui : toute personne critiquée peut obtenir le nom', 'La critique ne suffit pas à lever la protection.'],
            ['oui : un dirigeant d’entreprise passe avant la loi', 'Aucun particulier ne passe avant la loi.'],
            ['oui : la protection s’arrête dès la parution', 'La loi ne prévoit pas qu’elle s’arrête à la parution.'],
          ],
          'La loi fixe une condition exigeante, qu’un intérêt privé ne remplit pas.',
        ),
      ],
    },
    {
      title: 'Un seul propriétaire',
      lines: [
        'Dans un pays imaginaire, un même groupe rachète peu à peu tous les journaux.',
        'Les articles reprennent bientôt les mêmes opinions.',
        'Des lecteurs regrettent de ne plus pouvoir comparer.',
        'Ils réclament des règles pour que plusieurs voix subsistent.',
      ],
      qs: [
        lecture(
          MEDIAS_CHARTE,
          'Quel principe les lecteurs défendent-ils ?',
          'le pluralisme des médias',
          [
            ['le secret des sources', 'Il protège l’origine des informations, pas la diversité des titres.'],
            ['la diffamation', 'La diffamation est un abus.'],
            ['le devoir de réserve', 'Il concerne les agents publics.'],
          ],
          'Réclamer plusieurs voix, c’est défendre le pluralisme.',
        ),
        lecture(
          FONDEMENT_PRESSE,
          'Pourquoi cette situation menace-t-elle la démocratie ?',
          'les citoyens manquent de points de vue différents pour se faire un avis',
          [
            ['les journaux coûtent forcément moins cher', 'Le texte ne parle pas de prix.'],
            ['les lecteurs perdent leur droit de circuler', 'La circulation n’est pas en cause.'],
            ['la loi interdit à un lecteur de comparer', 'C’est l’absence de diversité qui empêche de comparer.'],
          ],
          'La liberté de la presse est un principe fondamental des démocraties.',
        ),
      ],
    },
  ],
};

// ——— Notion 4 : l’information, la désinformation et les ingérences ———

const information: Notion = {
  id: 'em4-information',
  title: 'L’information face à la manipulation',
  hint: 'Repense au mémo : les buts de la manipulation, les signes d’une ingérence, le rôle de Viginum et des lois de 2018.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **désinformation** et la **manipulation de l’information** visent à tromper, pour gagner de l’argent ou pour peser sur la politique : faux comptes, faux sites imitant une organisation. Les **plateformes** favorisent la **viralité**, parfois au détriment de la **fiabilité**.',
    'La **guerre informationnelle** et la **cyberdéfense** sont de nouveaux enjeux de défense. Le service **Viginum** détecte les **ingérences numériques étrangères** : un contenu faux ou trompeur, diffusé massivement de façon artificielle, avec des acteurs étrangers.',
    'En France, des lois de 2018 permettent de saisir un juge contre de fausses informations avant un scrutin national. Exemple : avant de partager, il faut **recouper** l’information avec une autre source.',
  ],
  faits: [
    fait(
      MOTIVATIONS,
      ['Quels buts motivent généralement la manipulation de l’information ?', 'un but lucratif ou un but politique'],
      [
        ['le seul souci d’informer avec exactitude', 'Manipuler, c’est au contraire tromper.'],
        ['la protection des données des lecteurs', 'La manipulation ne cherche pas à protéger.'],
        ['le recoupement des sources', 'Recouper est une méthode de vérification, pas un but de manipulation.'],
      ],
      ['La manipulation de l’information a généralement un objectif lucratif ou ', '.', ['politique']],
      'Lucratif : pour gagner de l’argent ; politique : pour peser sur le débat et les décisions.',
    ),
    fait(
      PRATIQUES,
      ['Laquelle de ces pratiques sert à manipuler l’information ?', 'créer de faux comptes'],
      [
        ['citer le nom de sa source', 'Citer sa source aide au contraire à vérifier.'],
        ['comparer deux journaux', 'Comparer protège de la manipulation.'],
        ['corriger publiquement une erreur', 'Corriger une erreur rétablit les faits.'],
      ],
      [
        'Pour manipuler, certains créent de faux ',
        ' ou des réseaux inauthentiques.',
        ['comptes', 'compte', 'profils', 'profil'],
      ],
      'Un faux compte fait croire à des soutiens ou à des témoins qui n’existent pas.',
    ),
    fait(
      VIGINUM,
      ['Quel service de l’État protège contre les ingérences numériques étrangères ?', 'Viginum'],
      [
        ['la mairie', 'La mairie administre la commune.'],
        ['le conseil de classe', 'Il suit les élèves.'],
        ['la Cour de cassation', 'Elle est la plus haute juridiction judiciaire.'],
      ],
      [
        'Le service de vigilance contre les ingérences numériques étrangères s’appelle ',
        '.',
        ['Viginum', 'VIGINUM', 'viginum'],
      ],
      'Viginum a été créé par un décret de juillet 2021.',
    ),
    fait(
      NOUVEAUX_ENJEUX,
      ['Avec la cyberdéfense, quel nouvel enjeu la défense doit-elle affronter ?', 'la guerre informationnelle'],
      [
        ['le devoir de réserve', 'C’est une règle pour les agents publics.'],
        ['la liberté de la presse', 'C’est une liberté à protéger, pas une menace de guerre.'],
        ['le secret des sources', 'C’est une protection des journalistes.'],
      ],
      ['La défense doit affronter la guerre ', ' et la cyberdéfense.', ['informationnelle']],
      'Un pays peut être attaqué par des informations manipulées.',
    ),
    fait(
      VIRALITE,
      [
        'D’après la stratégie nationale de 2026, au détriment de quoi des plateformes favorisent-elles la viralité ?',
        'de la fiabilité',
      ],
      [
        ['de la vitesse de diffusion', 'La viralité, c’est justement la diffusion rapide.'],
        ['du nombre de partages', 'La viralité augmente les partages.'],
        ['de l’attention captée', 'La viralité cherche à capter l’attention.'],
      ],
      ['Certaines plateformes favorisent la viralité au détriment de la ', '.', ['fiabilité', 'fiabilite']],
      'Un contenu très partagé n’est pas pour autant fiable.',
    ),
    expert(
      fait(
        CRITERES,
        [
          'Quel type de diffusion caractérise une ingérence numérique étrangère ?',
          'artificielle ou automatisée, massive et délibérée',
        ],
        [
          ['spontanée, rare et involontaire', 'L’ingérence est au contraire organisée.'],
          ['limitée à une conversation privée', 'Elle cherche à toucher massivement.'],
          ['signée clairement par une seule personne', 'La diffusion repose sur des moyens artificiels.'],
        ],
        [
          'Dans une ingérence numérique étrangère, la diffusion est artificielle ou automatisée, ',
          ' et délibérée.',
          ['massive'],
        ],
        'C’est l’un des critères, avec le contenu trompeur et l’implication d’acteurs étrangers.',
      ),
    ),
    expert(
      fait(
        PUBLICS,
        [
          'Quels contenus le service Viginum explore-t-il sur les plateformes ?',
          'les contenus publiquement accessibles',
        ],
        [
          ['les messages privés de tous les élèves', 'Le service explore ce qui est accessible à tous.'],
          ['les seuls journaux sur papier', 'Il surveille les plateformes en ligne.'],
          ['les copies d’examen', 'Elles n’ont aucun lien avec sa mission.'],
        ],
        ['Viginum explore les contenus ', ' accessibles sur les plateformes en ligne.', ['publiquement']],
        'Il y cherche des comptes suspects et des comportements coordonnés.',
      ),
    ),
    expert(
      fait(
        LOIS_2018,
        [
          'Depuis les lois de 2018, qui un candidat peut-il saisir pour faire cesser la diffusion de fausses informations avant un scrutin national ?',
          'le juge des référés',
        ],
        [
          ['le maire de sa commune', 'La loi prévoit la saisine d’un juge.'],
          ['le journal concurrent', 'Un journal ne peut pas ordonner l’arrêt d’une diffusion.'],
          ['le conseil de classe', 'Il n’a aucun rôle dans les élections nationales.'],
        ],
        ['Un candidat peut saisir le juge des ', '.', ['référés', 'referes', 'référé']],
        'Le juge des référés décide en urgence, durant les trois mois qui précèdent le scrutin.',
      ),
    ),
    expert(
      fait(
        SPONSORISES,
        [
          'Qu’est-ce que les principales plateformes doivent publier pour les contenus politiques sponsorisés ?',
          'le nom de leur auteur et la somme payée',
        ],
        [
          ['l’opinion politique de chaque lecteur', 'La loi n’impose pas de publier les opinions des lecteurs.'],
          ['la liste privée des amis de l’auteur', 'La transparence porte sur l’auteur et le paiement.'],
          ['rien : le paiement reste secret', 'La loi impose au contraire la transparence.'],
        ],
        ['Les plateformes publient le nom de l’auteur et la ', ' payée.', ['somme']],
        'Savoir qui paie un message aide à juger son intention.',
      ),
    ),
  ],
  paires3: [
    ['Désinformation', 'Informations fausses ou trompeuses qui circulent'],
    ['Viginum', 'Détecte les ingérences numériques étrangères'],
    ['Recouper', 'Comparer plusieurs sources'],
  ],
  paires5: [
    ['Objectif lucratif', 'Gagner de l’argent'],
    ['Objectif politique', 'Peser sur le débat et les décisions'],
    ['Viralité', 'Diffusion très rapide par les partages'],
    ['Juge des référés', 'Peut faire cesser la diffusion de fausses informations avant un scrutin'],
    ['Cyberdéfense', 'Protection contre les attaques informatiques'],
  ],
  libres: [
    libre(
      VIGINUM,
      'quel est le nom du service de l’État qui détecte les ingérences numériques étrangères ?',
      ['Viginum', 'VIGINUM', 'viginum'],
      [
        ['Arcom', 'L’Arcom est le régulateur de l’audiovisuel et du numérique.'],
        ['Pharos', 'Pharos recueille des signalements de contenus illicites.'],
      ],
      'Viginum détecte les campagnes de manipulation venues de l’étranger.',
    ),
    libre(
      VIGINUM_PROGRAMME,
      'comment s’appelle la guerre menée avec des informations manipulées ? La guerre …',
      ['informationnelle', 'guerre informationnelle', 'la guerre informationnelle'],
      [
        ['économique', 'Elle passe par le commerce, pas par les informations.'],
        ['civile', 'Une guerre civile oppose des habitants d’un même pays par les armes.'],
      ],
      'La guerre informationnelle utilise l’information comme arme.',
    ),
    libre(
      LOIS_2018,
      'en quelle année ont été promulguées les lois contre la manipulation de l’information en période électorale ? (en chiffres)',
      ['2018'],
      [
        ['1881', '1881 est la date de la loi sur la liberté de la presse.'],
        ['2021', '2021 est l’année de création de Viginum.'],
      ],
      'Les lois « anti-fake news » ont été promulguées en décembre 2018.',
    ),
  ],
  docs: [
    {
      title: 'Des centaines de comptes',
      lines: [
        'Quelques semaines avant un vote, des centaines de comptes récents publient le même message.',
        'Le message annonce faussement que les bureaux de vote fermeront à midi.',
        'Les publications partent à intervalles réguliers, nuit et jour.',
        'L’enquête montre qu’elles sont pilotées depuis un autre État.',
      ],
      qs: [
        lecture(
          CRITERES,
          'Quels indices du texte font penser à une ingérence numérique étrangère ?',
          'un message faux, diffusé massivement et automatiquement, piloté de l’étranger',
          [
            [
              'un message vrai, publié par un seul habitant',
              'Le texte décrit un message faux et des centaines de comptes.',
            ],
            ['un désaccord signé entre deux voisins', 'Un désaccord n’est ni automatisé ni piloté de l’étranger.'],
            [
              'le seul fait qu’on parle d’élections',
              'Parler d’élections est normal : ce sont les procédés qui alertent.',
            ],
          ],
          'Contenu trompeur, diffusion artificielle massive et acteur étranger : les critères concordent.',
        ),
        lecture(
          MISSION,
          'Quel service a pour mission de détecter ce genre de campagne ?',
          'Viginum',
          [
            ['le conseil municipal', 'Il règle les affaires de la commune.'],
            ['le Conseil de la vie collégienne', 'Il traite de la vie du collège.'],
            ['la Cour des comptes', 'Elle contrôle l’usage de l’argent public.'],
          ],
          'Viginum détecte et caractérise les campagnes de manipulation en ligne venues de l’étranger.',
        ),
      ],
    },
    {
      title: 'Un site qui imite un journal',
      lines: [
        'Karim reçoit un lien vers un article alarmant.',
        'La page copie l’apparence d’un grand journal, mais l’adresse contient une lettre en trop.',
        'Le site affiche beaucoup de publicités.',
        'L’article est introuvable chez d’autres médias.',
      ],
      qs: [
        lecture(
          PRATIQUES,
          'Quelle pratique de manipulation l’adresse modifiée révèle-t-elle ?',
          'l’usurpation de l’identité d’un média par un nom de domaine trompeur',
          [
            ['le secret des sources du journal', 'Ce secret protège un journaliste, il ne copie pas un site.'],
            ['une aide publique à la presse', 'Une aide publique n’imite pas un journal.'],
            [
              'le pluralisme des médias',
              'Le pluralisme réunit des médias distincts qui ne se font pas passer l’un pour l’autre.',
            ],
          ],
          'Une adresse presque identique fait croire qu’il s’agit du vrai journal.',
        ),
        lecture(
          RECOUPEMENT,
          'Quel réflexe Karim doit-il avoir avant de partager ?',
          'vérifier l’adresse et recouper avec d’autres médias',
          [
            ['partager vite pour prévenir ses amis', 'Partager vite diffuse peut-être une fausse information.'],
            ['croire le site, car il ressemble à un journal', 'L’apparence peut être copiée.'],
            [
              'croire le site, car il a beaucoup de publicités',
              'La publicité peut au contraire signaler un but lucratif.',
            ],
          ],
          'Vérifier et recouper les sources protège contre la désinformation.',
        ),
      ],
    },
  ],
};

export const LIBERTE_EXPRESSION_SKILLS: readonly Skill[] = [enLigne, limites, medias, information].map(notion);
