import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { zoneName } from '../cartes.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Sixième, thème 1 « Habiter une métropole » (lot ge-6e-01). Chaque fait cite une source du registre avec sa
 * citation exacte : programme du cycle 3, ressource Éduscol du thème, INSEE, atlas du Centre commun de recherche
 * de la Commission européenne (en anglais), ADEME, CNRTL. « La ville de demain », sous-thème du programme, est
 * traitée comme cinquième notion. Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const EDUSCOL = 'eduscol-habiter-metropole';
const ATLAS = 'ghsl-atlas-2018';
const UNITE = 'insee-unite-urbaine';
const VILLE_CENTRE = 'insee-ville-centre';
const BANLIEUE = 'insee-banlieue';
const AIRE = 'insee-aire-attraction';
const COURONNE = 'insee-couronne';
const TRAVAIL = 'insee-domicile-travail';
const ADEME = 'ademe-trajets';
const NATURE = 'ecologie-nature-ville';

// Programme du cycle 3.
const P_METROPOLISATION =
  'La métropolisation est une caractéristique majeure de l’évolution géographique du monde contemporain';
const P_FONCTIONS =
  'en insistant sur ses fonctions économiques, sociales, politiques et culturelles, sur la variété des espaces qui la composent et les flux qui la parcourent';
const P_HABITANTS =
  'Elle est marquée par la diversité de ses habitants : résidents, migrants pendulaires, touristes, usagers occasionnels la pratiquent différemment et contribuent à la façonner';
const P_CAS =
  'deux cas de métropoles choisies pour l’une dans un pays développé, pour l’autre dans un pays émergent ou en développement';
const P_DEMAIN =
  'Comment repenser la question de son approvisionnement ? Quelles architectures inventer ? Comment ménager la cohabitation pour mieux vivre ensemble ? Comment améliorer le développement durable ?';
const P_PROSPECTIVE = 'dans le cadre d’une initiation à la prospective territoriale, à imaginer la ville du futur';

// Ressource Éduscol « Habiter une métropole ».
const E_DEFINITION = 'métropoles, que l’on peut définir comme de très grandes villes multimillionnaires';
const E_MOITIE = 'plus de la moitié de l’humanité (et probablement les 2/3 en 2050), habite dans des villes';
const E_COMMANDEMENT =
  'la métropole se caractérise par la concentration de fonctions supérieures et de commandement, de revenus et d’emplois';
const E_SURFACE =
  'qui s’accroissent en population mais surtout en surface, intégrant progressivement les espaces périphériques';
const E_REPERES = 'Nommer et localiser dix métropoles mondiales parmi les plus importantes';
const E_MULTIPOLAIRES = 'Ils sont enfin multipolaires, composés de plusieurs centres, dont des centres secondaires';
const E_MOBILITES =
  'Les habitants de la métropole s’appuient sur des moyens de transports et numériques bien développés';
const E_MOTIFS = 'pour toute une palette de motifs, professionnels ou autres';
const E_ENERGIE = 'en termes de coût énergétique posé par l’étalement et les mobilités';
const E_NUISANCES = 'de qualité de l’air, de nuisances liées au bruit';
const E_ILOT = 'de modification du climat urbain (îlot de chaleur)';
const E_INEGALITES = 'Des problèmes sociaux, liés à la puissance des inégalités urbaines';
const E_CHOIX = 'la ville de demain résulte d’un certain nombre de choix qui sont faits aujourd’hui';
const E_DURABLE = 'comment penser, construire et gérer la ville durable ?';
const E_UTOPIES =
  'La ville intelligente et connectée, la ville verte et fertile sont autant de nouvelles utopies urbaines';
const E_COMPACTE = 'la ville étalée et de la ville compacte ou verticale';
const E_CITOYENS = 'comprendre le rôle et la place des citoyens dans les choix d’aménagements urbains';

// Atlas of the Human Planet 2018 (Centre commun de recherche, Commission européenne).
const A_TOP = 'Tokyo; New York; Los Angeles; Shanghai; Bangkok; Seoul; Jakarta; Singapore; Osaka; Sao Paulo';
const A_CONTINENTS =
  'Most of them are in Asia (70%); two of them in Northern America and one in Latin America and the Caribbean';
const A_POPULATION = 'Jakarta has the largest population';
const A_PIB = 'Tokyo, the urban centre with the highest GDP';

// INSEE.
const I_UNITE =
  'une commune ou un ensemble de communes présentant une zone de bâti continu (pas de coupure de plus de 200 mètres entre deux constructions) qui compte au moins 2 000 habitants';
const I_AGGLO =
  'Lorsqu’une unité urbaine est constituée de plusieurs communes, on la désigne sous le terme d’agglomération multicommunale';
const I_VILLE_CENTRE =
  'Si une commune représente plus de 50 % de la population de l’agglomération multicommunale, elle est seule ville-centre';
const I_BANLIEUE = 'Les communes qui ne sont pas villes-centres constituent la banlieue de l’unité urbaine';
const I_AIRE =
  'constitué d’un pôle de population et d’emploi, et d’une couronne qui regroupe les communes dont au moins 15 % des actifs occupés travaillent dans le pôle';
const I_COMMUNE_CENTRE = 'La commune la plus peuplée du pôle est appelée commune-centre';
const I_COURONNE =
  'La couronne recouvre l’ensemble des communes qui envoient au moins 15 % de leurs actifs occupés travailler dans le pôle d’une aire';
const I_VOITURE =
  'En 2017, 74 % des actifs en emploi qui déclarent se déplacer pour rejoindre leur lieu de travail utilisent leur voiture, 16 % prennent les transports en commun et 8 % ont recours aux modes de transport doux (6 % à la marche et 2 % au vélo)';
const I_DOUX =
  'Le recours aux modes de transport doux (marche et vélo) est spécifique aux petites et très petites distances';
const I_PARIS =
  'Le recours massif aux transports en commun est très spécifique à l’aire d’attraction de Paris puisque 44 % des actifs en emploi y résidant utilisent métro, bus, tramway, RER ou train pour aller travailler';

// Ministère chargé de la transition écologique, ADEME, CNRTL.
const M_FRAIS =
  'La nature améliore la résilience climatique des villes par le rafraichissement et la limitation des impacts des inondations';
const D_NOUVELLES =
  'de nouvelles mobilités se dessinent, notamment avec le développement des pistes cyclables, du covoiturage, de l’autopartage';
const D_TIERS = 'Les transports émettent 1/3 des gaz à effet de serre de la France';
const C_PENDULAIRE = 'Déplacement quotidien entre le domicile et le lieu du travail et vice-versa';
const C_URBANISATION = 'Concentration croissante de la population dans les agglomérations urbaines';
const C_BIDONVILLE = 'habitations de fortune construites à la périphérie de certaines grandes villes';
const C_CITADIN = 'Personne qui habite une ville, qui vit à la ville';
const C_GRATTE_CIEL = 'Immeuble très élevé, comportant de nombreux étages';
const C_PERIURBAIN = 'Situé dans les environs immédiats d’une ville';
const C_ROCADE = 'Voie de circulation rapide contournant ou longeant une agglomération';
const C_DENSITE = 'Nombre d’habitants par unité de surface, généralement le kilomètre carré';

// ——— Carte : localiser de grandes métropoles (repère de la ressource Éduscol) ———

type Continent = 'asie' | 'amerique-nord' | 'amerique-sud';

/** Métropoles de la liste des dix de l’atlas, avec leur continent. */
export const METROPOLES: readonly { readonly nom: string; readonly continent: Continent }[] = [
  { nom: 'Tokyo', continent: 'asie' },
  { nom: 'Shanghai', continent: 'asie' },
  { nom: 'Jakarta', continent: 'asie' },
  { nom: 'Séoul', continent: 'asie' },
  { nom: 'Bangkok', continent: 'asie' },
  { nom: 'New York', continent: 'amerique-nord' },
  { nom: 'Los Angeles', continent: 'amerique-nord' },
  { nom: 'São Paulo', continent: 'amerique-sud' },
];

const CONTINENTS = ['asie', 'amerique-nord', 'amerique-sud', 'europe', 'afrique', 'oceanie'] as const;
const continent = (id: string) => zoneName('monde', id) ?? id;

const reperage = (nom: string, zone: string) => [
  `L’atlas de la Commission européenne cite les dix centres urbains au plus grand PIB (richesse produite) en 2015, dont ${nom} : « ${A_TOP} ».`,
  `Il précise, en anglais : « ${A_CONTINENTS} », soit sept en Asie, deux en Amérique du Nord et un en Amérique latine.`,
  'On situe la métropole sur le planisphère, continent par continent.',
  `${nom} se trouve sur le continent : **${continent(zone)}**.`,
];

function carteMetropoles(rng: Rng, level: Level): QuestionDraft | undefined {
  if (level === 5) return undefined;
  const m = rng.pick(METROPOLES);
  const others = rng.shuffle(CONTINENTS.filter((c) => c !== m.continent));
  const why = (z: string) => `Tu as choisi ${continent(z)} : ${m.nom} se trouve sur un autre continent.`;
  const hint = 'Cherche d’abord le pays de cette métropole, puis son continent sur le planisphère.';
  if (level <= 2) {
    return {
      prompt:
        level === 1
          ? `Sur quel continent se trouve la métropole de **${m.nom}** ?`
          : `Attention aux pièges ! Sur quel continent faut-il placer **${m.nom}** ?`,
      figure: { kind: 'map', map: 'monde' },
      ...choice(
        rng,
        continent(m.continent),
        others.slice(0, level === 1 ? 2 : 3).map((z) => ({ label: continent(z), why: why(z) })),
      ),
      hint,
      steps: reperage(m.nom, m.continent),
      targetSeconds: 25,
    };
  }
  const traps: Trap[] = others.slice(0, 2).map((z) => ({ zone: z, why: why(z) }));
  return {
    prompt:
      level === 3
        ? `Touche sur le planisphère le continent de la métropole de **${m.nom}**.`
        : `Sans aide : un voyageur part pour **${m.nom}**. Touche le continent où il va.`,
    figure: { kind: 'map', map: 'monde' },
    answer: { kind: 'zone', map: 'monde', zone: m.continent },
    traps,
    hint,
    steps: reperage(m.nom, m.continent),
    targetSeconds: 30,
  };
}

// ——— Notion 1 : les métropoles du monde et leurs habitants ———

const metropoles: Notion = {
  classe: '6e',
  id: 'g6-metropoles-monde',
  title: 'Les métropoles du monde et leurs habitants',
  hint: 'Pense à la taille de la ville, à son influence et à la variété des personnes qui la fréquentent.',
  memo: [
    'Une **métropole** est une très grande ville qui concentre des emplois, des pouvoirs et de l’influence. Exemple : Tokyo.',
    'Ses habitants sont variés : résidents, **migrants pendulaires**, touristes, usagers occasionnels.',
    'La **métropolisation**, c’est la place croissante prise par ces grandes villes dans le monde.',
  ],
  faits: [
    {
      q: 'Comment la ressource Éduscol définit-elle les métropoles ?',
      a: 'de très grandes villes comptant plusieurs millions d’habitants',
      wrong: [
        { label: 'de petits villages isolés', why: 'Une métropole est au contraire une très grande ville.' },
        {
          label: 'des espaces uniquement agricoles',
          why: 'Une métropole est un ensemble urbain, pas un espace agricole.',
        },
        {
          label: 'des villes sans activité économique',
          why: 'Les métropoles concentrent des emplois et des activités.',
        },
      ],
      gap: [
        'Les métropoles sont de très grandes villes ',
        ' : elles comptent plusieurs millions d’habitants.',
        ['multimillionnaires'],
      ],
      choix: ['multimillionnaires', 'saisonnières', 'rurales'],
      quote: E_DEFINITION,
      explain: '« Multimillionnaire » signifie ici : plusieurs millions d’habitants.',
      src: EDUSCOL,
    },
    {
      q: 'Quelles fonctions caractérisent une métropole ?',
      a: 'des fonctions économiques, sociales, politiques et culturelles',
      wrong: [
        { label: 'une seule fonction, l’agriculture', why: 'Une métropole réunit plusieurs fonctions urbaines.' },
        { label: 'uniquement la fonction de station de vacances', why: 'Le tourisme n’est qu’une partie de sa vie.' },
        { label: 'aucune fonction particulière', why: 'Ses fonctions sont justement ce qui la caractérise.' },
      ],
      gap: ['Une métropole a des fonctions économiques, sociales, ', ' et culturelles.', ['politiques']],
      choix: ['politiques', 'agricoles', 'saisonnières'],
      quote: P_FONCTIONS,
      explain: 'Travailler, gouverner, se cultiver, se rencontrer : la métropole rassemble ces rôles.',
    },
    {
      q: 'Qu’est-ce qu’une métropole concentre particulièrement ?',
      a: 'des fonctions de commandement, des revenus et des emplois',
      wrong: [
        { label: 'des champs et des forêts', why: 'Ces paysages ne caractérisent pas une métropole.' },
        { label: 'des habitants qui ne travaillent jamais', why: 'Les métropoles attirent au contraire les emplois.' },
        { label: 'des glaciers et des volcans', why: 'Ce sont des éléments naturels, sans lien avec la définition.' },
      ],
      gap: [
        'Dans une métropole, les fonctions de ',
        ' sont concentrées : on y prend des décisions importantes.',
        ['commandement'],
      ],
      choix: ['commandement', 'pâturage', 'vacances'],
      quote: E_COMMANDEMENT,
      explain: 'Commander, c’est décider : les décisions importantes se prennent dans ces villes.',
      src: EDUSCOL,
    },
    {
      q: 'Qui fait partie des habitants qui pratiquent différemment une métropole ?',
      a: 'les résidents, les migrants pendulaires et les touristes',
      wrong: [
        {
          label: 'seulement les personnes nées dans le centre',
          why: 'Le programme insiste sur la diversité des habitants.',
        },
        { label: 'seulement les élus', why: 'Les élus ne sont qu’une petite partie des personnes présentes.' },
        { label: 'personne en dehors des résidents', why: 'Les touristes et les usagers occasionnels comptent aussi.' },
      ],
      gap: [
        'Les habitants d’une métropole sont variés : résidents, migrants pendulaires, touristes et usagers ',
        '.',
        ['occasionnels'],
      ],
      choix: ['occasionnels', 'agricoles', 'montagnards'],
      quote: P_HABITANTS,
      explain: 'Chacun utilise la métropole à sa façon et contribue à la façonner.',
    },
    {
      q: 'Comment doivent être choisies les deux métropoles étudiées en sixième ?',
      a: 'l’une dans un pays développé, l’autre dans un pays émergent ou en développement',
      wrong: [
        {
          label: 'toutes les deux dans le même pays',
          why: 'Le programme veut deux niveaux de développement différents.',
        },
        { label: 'toutes les deux à la campagne', why: 'Une métropole est une très grande ville.' },
        {
          label: 'les deux plus petites villes de France',
          why: 'On étudie de grandes métropoles et non de petites villes.',
        },
      ],
      gap: [
        'On compare une métropole d’un pays développé à une métropole d’un pays ',
        ' ou en développement.',
        ['émergent', 'emergent'],
      ],
      choix: ['émergent', 'désertique', 'insulaire'],
      quote: P_CAS,
      explain: 'La comparaison fait apparaître des ressemblances et des différences.',
    },
    {
      q: 'Depuis 2007, quelle part de l’humanité habite en ville ?',
      a: 'plus de la moitié',
      wrong: [
        { label: 'moins d’un dixième', why: 'La part urbaine est bien plus grande.' },
        { label: 'exactement un quart', why: 'La part urbaine dépasse la moitié.' },
        { label: 'la totalité', why: 'Une partie de l’humanité vit encore hors des villes.' },
      ],
      gap: ['Depuis 2007, plus de la ', ' de l’humanité habite en ville.', ['moitié', 'moitie']],
      quote: E_MOITIE,
      explain: 'Le monde est de plus en plus urbain : les métropoles y occupent une place croissante.',
      src: EDUSCOL,
    },
  ],
  paires3: [
    ['Métropole', 'Très grande ville qui exerce une influence'],
    ['Résident', 'Personne qui habite durablement dans la métropole'],
    ['Touriste', 'Visiteur venu pour découvrir ou se détendre'],
  ],
  paires5: [
    ['Métropole', 'Très grande ville qui exerce une influence'],
    ['Résident', 'Personne qui habite durablement dans la métropole'],
    ['Migrant pendulaire', 'Personne qui fait chaque jour l’aller-retour vers son travail'],
    ['Métropolisation', 'Place croissante prise par les grandes villes'],
    ['Fonction de commandement', 'Rôle de décision'],
  ],
  libres: [
    {
      q: 'D’après l’atlas européen, quelle métropole parmi les dix au plus grand PIB (richesse produite) en 2015 vient en tête ?',
      accepted: ['Tokyo', 'à Tokyo', 'Tôkyô', 'Tokio'],
      traps: [
        { text: 'New York', why: 'New York vient juste après Tokyo dans ce classement.' },
        { text: 'Jakarta', why: 'Jakarta a la plus grande population du groupe, pas le plus grand PIB.' },
      ],
      quote: A_PIB,
      explain: 'GDP est le mot anglais pour PIB : la richesse produite.',
      src: ATLAS,
    },
    {
      q: 'Parmi les dix centres urbains au plus grand PIB en 2015 (atlas européen), lequel a la plus grande population ?',
      accepted: ['Jakarta', 'Djakarta', 'à Jakarta'],
      traps: [
        { text: 'Tokyo', why: 'Tokyo a le plus grand PIB, mais vient en deuxième pour la population.' },
        { text: 'Los Angeles', why: 'Los Angeles est le plus étendu en surface bâtie.' },
      ],
      quote: A_POPULATION,
      explain: 'Taille de la population et richesse produite ne donnent pas le même classement.',
      src: ATLAS,
    },
    {
      q: 'Quel mot désigne la place croissante prise par les métropoles dans le monde ?',
      accepted: ['métropolisation', 'la métropolisation', 'une métropolisation'],
      traps: [
        { text: 'mondialisation', why: 'La mondialisation désigne les échanges à l’échelle du monde.' },
        { text: 'urbanisme', why: 'L’urbanisme est l’aménagement des villes.' },
      ],
      quote: P_METROPOLISATION,
      explain: 'Le programme parle de métropolisation.',
    },
    {
      q: 'Selon la ressource Éduscol, combien de métropoles parmi les plus importantes du monde faut-il savoir nommer et localiser ?',
      accepted: ['10', 'dix'],
      traps: [
        { text: '2', why: 'Deux métropoles servent aux études de cas : le repère à connaître en demande davantage.' },
        { text: '100', why: 'La ressource Éduscol en demande beaucoup moins.' },
      ],
      quote: E_REPERES,
      explain: 'Situer les grandes métropoles du monde est un repère à construire.',
      src: EDUSCOL,
    },
  ],
  docs: [
    {
      title: 'Une journée à Port-Soleil',
      lines: [
        'Port-Soleil est une très grande ville. De grandes entreprises y prennent des décisions pour leurs usines lointaines.',
        'Lina habite le centre. Omar arrive chaque matin d’une commune voisine pour travailler.',
        'Une famille étrangère visite le grand musée pendant trois jours.',
      ],
      qs: [
        {
          q: 'Quel indice montre une fonction de commandement ?',
          a: 'les décisions prises pour des usines lointaines',
          wrong: [
            { label: 'le séjour de la famille', why: 'Il relève du tourisme, pas du commandement.' },
            { label: 'le trajet d’Omar', why: 'Le trajet montre une mobilité, pas un lieu de décision.' },
          ],
          quote: E_COMMANDEMENT,
          explain: 'Décider pour des lieux éloignés, c’est commander.',
          src: EDUSCOL,
        },
        {
          q: 'Comment appeler Omar d’après sa pratique de la ville ?',
          a: 'un migrant pendulaire',
          wrong: [
            { label: 'un résident du centre', why: 'Omar n’habite pas le centre : il vient d’une commune voisine.' },
            { label: 'un touriste', why: 'Il vient travailler chaque matin, pas visiter.' },
          ],
          quote: C_PENDULAIRE,
          explain: 'Il fait chaque jour l’aller-retour entre son domicile et son travail.',
          src: 'cnrtl-pendulaire',
        },
      ],
    },
    {
      title: 'Deux métropoles en classe',
      lines: [
        'La classe compare deux métropoles de continents différents.',
        'La première est dans un pays développé, la seconde dans un pays émergent.',
        'Les élèves décrivent les habitants, les quartiers et les transports de chacune.',
      ],
      qs: [
        {
          q: 'Pourquoi les deux métropoles viennent-elles de pays différents ?',
          a: 'pour comparer deux niveaux de développement',
          wrong: [
            { label: 'parce qu’un seul pays possède des villes', why: 'Il y a des villes dans de très nombreux pays.' },
            { label: 'pour éviter de parler des habitants', why: 'Les habitants sont au cœur de l’étude.' },
          ],
          quote: P_CAS,
          explain: 'On cherche les ressemblances et les différences.',
        },
      ],
    },
  ],
  carte: carteMetropoles,
};

// ——— Notion 2 : la ville et ses périphéries ———

const peripheries: Notion = {
  classe: '6e',
  id: 'g6-ville-peripheries',
  title: 'La ville et ses périphéries',
  hint: 'Pars du centre, puis éloigne-toi : demande-toi ce qui relie chaque commune à la ville.',
  memo: [
    'Au cœur, la **ville-centre** ; autour, la **banlieue** : ensemble, elles peuvent former une **agglomération**.',
    'Plus loin, la **couronne** réunit les communes dont beaucoup d’actifs travaillent dans le pôle.',
    'Les métropoles s’étendent : c’est l’**étalement urbain**, qui gagne les espaces autour de la ville.',
  ],
  faits: [
    {
      q: 'Dans une agglomération de plusieurs communes, comment appelle-t-on les communes qui ne sont pas villes-centres ?',
      a: 'la banlieue',
      wrong: [
        { label: 'le centre historique', why: 'Le centre historique est dans la ville, pas autour.' },
        { label: 'la capitale', why: 'La capitale est la ville où siège le pouvoir d’un pays.' },
        { label: 'la région', why: 'Une région est un territoire beaucoup plus vaste.' },
      ],
      gap: ['Les communes qui ne sont pas villes-centres constituent la ', ' de l’unité urbaine.', ['banlieue']],
      quote: I_BANLIEUE,
      explain: 'La banlieue entoure la ville-centre à l’intérieur de l’unité urbaine.',
      src: BANLIEUE,
    },
    {
      q: 'Quand une commune est-elle seule ville-centre d’une agglomération ?',
      a: 'quand elle réunit plus de la moitié de la population de l’agglomération',
      wrong: [
        { label: 'quand elle a la plus petite population', why: 'C’est l’inverse : la ville-centre est très peuplée.' },
        { label: 'quand elle n’a aucun voisin', why: 'Une agglomération comporte plusieurs communes.' },
        {
          label: 'quand elle se trouve au bord de la mer',
          why: 'La position sur la côte ne compte pas dans cette règle.',
        },
      ],
      gap: [
        'Une commune est seule ville-centre si elle compte plus de ',
        ' % de la population de l’agglomération.',
        ['50', 'cinquante'],
      ],
      quote: I_VILLE_CENTRE,
      explain: 'Au-delà de la moitié de la population, une commune domine seule l’agglomération.',
      src: VILLE_CENTRE,
    },
    {
      q: 'Selon l’INSEE, quelles communes forment la couronne d’une aire d’attraction ?',
      a: 'celles dont au moins 15 % des actifs occupés travaillent dans le pôle',
      wrong: [
        {
          label: 'celles qui n’ont aucun lien avec la ville',
          why: 'La couronne est définie par un lien de travail avec le pôle.',
        },
        { label: 'celles où se trouvent les gratte-ciel', why: 'La hauteur des immeubles ne définit pas la couronne.' },
        { label: 'les communes situées à l’étranger', why: 'Le critère est le travail dans le pôle, pas le pays.' },
      ],
      gap: [
        'La couronne regroupe les communes dont au moins ',
        ' % des actifs occupés travaillent dans le pôle.',
        ['15', 'quinze'],
      ],
      quote: I_COURONNE,
      explain: 'Le travail relie les communes de la couronne au pôle.',
      src: COURONNE,
    },
    {
      q: 'Comment les métropoles s’agrandissent-elles surtout ?',
      a: 'en surface, en intégrant les espaces périphériques',
      wrong: [
        { label: 'en perdant leurs habitants', why: 'Elles s’accroissent en population.' },
        { label: 'en devenant des villages', why: 'Elles grandissent, elles ne rétrécissent pas.' },
        { label: 'seulement sous la mer', why: 'Elles gagnent surtout du terrain autour d’elles.' },
      ],
      gap: [
        'Les métropoles intègrent peu à peu les espaces ',
        ' qui les entourent.',
        ['périphériques', 'peripheriques'],
      ],
      choix: ['périphériques', 'montagnards', 'maritimes'],
      quote: E_SURFACE,
      explain: 'La ville s’étale vers sa périphérie.',
      src: EDUSCOL,
    },
    {
      q: 'Que signifie qu’une métropole est multipolaire ?',
      a: 'elle comporte plusieurs centres, dont des centres secondaires',
      wrong: [
        { label: 'elle n’a aucun centre', why: 'Au contraire, elle en a plusieurs.' },
        { label: 'elle est située au pôle Nord', why: '« Pôle » désigne ici un centre d’activités.' },
        { label: 'elle a un seul bâtiment', why: 'Une métropole est un vaste ensemble urbain.' },
      ],
      gap: [
        'Une métropole multipolaire est composée de plusieurs ',
        ', dont des centres secondaires.',
        ['centres', 'centre'],
      ],
      quote: E_MULTIPOLAIRES,
      explain: '« Multi » veut dire « plusieurs » : plusieurs centres.',
      src: EDUSCOL,
    },
    {
      q: 'Que désigne, selon l’INSEE, la commune-centre d’une aire d’attraction ?',
      a: 'la commune la plus peuplée du pôle',
      wrong: [
        { label: 'la commune la plus éloignée', why: 'Le mot « centre » désigne la commune principale du pôle.' },
        { label: 'la commune qui n’a pas d’emplois', why: 'Un pôle réunit justement population et emplois.' },
        { label: 'une commune de la couronne', why: 'La commune-centre fait partie du pôle.' },
      ],
      gap: ['La commune la plus peuplée du pôle est appelée commune-', '.', ['centre']],
      quote: I_COMMUNE_CENTRE,
      explain: 'La commune-centre est la principale commune du pôle.',
      src: AIRE,
    },
  ],
  paires3: [
    ['Ville-centre', 'La commune principale d’une agglomération'],
    ['Banlieue', 'Les autres communes de l’unité urbaine'],
    ['Couronne', 'Les communes dont des actifs travaillent dans le pôle'],
  ],
  paires5: [
    ['Ville-centre', 'La commune principale d’une agglomération'],
    ['Banlieue', 'Les autres communes de l’unité urbaine'],
    ['Couronne', 'Les communes dont des actifs travaillent dans le pôle'],
    ['Étalement urbain', 'La ville gagne les espaces autour d’elle'],
    ['Pôle', 'Ensemble qui concentre population et emplois'],
  ],
  ordre: ['la commune-centre', 'les autres communes du pôle', 'la couronne'],
  consigne: {
    prompt: 'Dans une aire d’attraction, remets ces espaces dans l’ordre, du centre vers l’extérieur.',
    hint: 'La commune la plus peuplée du pôle est au cœur ; la couronne entoure le pôle.',
    why: 'L’aire d’attraction réunit un pôle (avec sa commune-centre) et, autour, une couronne.',
    fin: 'Au cœur se trouve',
    quote: I_AIRE,
    src: AIRE,
  },
  libres: [
    {
      q: 'Comment appelle-t-on l’ensemble des communes qui ne sont pas villes-centres dans une unité urbaine ?',
      accepted: ['banlieue', 'la banlieue', 'les banlieues', 'banlieues'],
      traps: [
        { text: 'couronne', why: 'La couronne se définit par le travail dans un pôle d’aire d’attraction.' },
        { text: 'ville-centre', why: 'La ville-centre est justement ce qui n’est pas la banlieue.' },
      ],
      quote: I_BANLIEUE,
      explain: 'Les communes qui ne sont pas villes-centres forment la banlieue.',
      src: BANLIEUE,
    },
    {
      q: 'Quel mot désigne une unité urbaine formée de plusieurs communes (sans la précision « multicommunale ») ?',
      accepted: ['agglomération', 'une agglomération', 'l’agglomération', 'agglomération multicommunale'],
      traps: [
        { text: 'ville isolée', why: 'Une ville isolée est une unité urbaine d’une seule commune.' },
        { text: 'campagne', why: 'La campagne est un espace peu dense, hors de l’unité urbaine.' },
      ],
      quote: I_AGGLO,
      explain: 'Plusieurs communes au bâti continu forment une agglomération.',
      src: VILLE_CENTRE,
    },
    {
      q: 'Dans la définition de l’unité urbaine, combien d’habitants au moins faut-il (en chiffres) ?',
      accepted: ['2000', '2 000', 'deux mille'],
      traps: [
        { text: '200', why: '200, c’est la coupure maximale en mètres entre deux constructions.' },
        { text: '50000', why: 'Ce seuil de 50 000 sert à d’autres classements, pas à l’unité urbaine.' },
      ],
      quote: I_UNITE,
      explain: 'Le bâti continu doit compter au moins 2 000 habitants.',
      src: UNITE,
    },
  ],
  docs: [
    {
      title: 'La ville de Vertcoteau',
      lines: [
        'Vertcoteau compte la grande majorité des habitants de son agglomération.',
        'Les communes bâties à sa suite, sans coupure, l’entourent.',
        'Plus loin, des villages envoient une grande partie de leurs actifs travailler dans ce pôle.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on les communes bâties autour de Vertcoteau, sans coupure ?',
          a: 'la banlieue',
          wrong: [
            { label: 'la ville-centre', why: 'La ville-centre est Vertcoteau, qui domine par sa population.' },
            { label: 'la couronne', why: 'La couronne correspond aux villages plus éloignés.' },
          ],
          quote: I_BANLIEUE,
          explain: 'Elles font partie de l’unité urbaine sans être la ville-centre.',
          src: BANLIEUE,
        },
        {
          q: 'À quel espace correspondent les villages dont les actifs travaillent dans le pôle ?',
          a: 'la couronne',
          wrong: [
            { label: 'la commune-centre', why: 'La commune-centre est la plus peuplée du pôle.' },
            { label: 'la banlieue', why: 'La banlieue est dans l’unité urbaine, en continuité du bâti.' },
          ],
          quote: I_COURONNE,
          explain: 'C’est le lien de travail avec le pôle qui définit la couronne.',
          src: COURONNE,
        },
      ],
    },
    {
      title: 'La métropole des Trois Rives',
      lines: [
        'La ville des Trois Rives s’étend chaque année un peu plus loin.',
        'Elle a un grand centre ancien, un quartier d’affaires au nord et un second centre près de l’aéroport.',
      ],
      qs: [
        {
          q: 'Quelle caractéristique ce texte montre-t-il ?',
          a: 'une métropole multipolaire',
          wrong: [
            { label: 'une ville avec un unique centre', why: 'Le texte cite trois centres.' },
            {
              label: 'un espace sans transport ni emploi',
              why: 'Le quartier d’affaires et l’aéroport sont des lieux d’activité.',
            },
          ],
          quote: E_MULTIPOLAIRES,
          explain: 'Plusieurs centres, dont des centres secondaires : la métropole est multipolaire.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

// ——— Notion 3 : les mobilités ———

const mobilites: Notion = {
  classe: '6e',
  id: 'g6-mobilites',
  title: 'Les mobilités dans la métropole',
  hint: 'Demande-toi qui se déplace, pour quelle raison, à quelle fréquence et avec quel moyen.',
  memo: [
    'Les **mobilités** sont les déplacements des personnes. La métropole est parcourue par des **flux** variés.',
    'Une **migration pendulaire** est l’aller-retour quotidien entre domicile et travail.',
    'Le transport en commun, la voiture, la marche et le vélo répondent à des besoins différents. Plus les distances sont courtes, plus les **modes doux** sont adaptés.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’une migration pendulaire ?',
      a: 'l’aller-retour quotidien entre le domicile et le travail',
      wrong: [
        { label: 'un départ définitif vers un autre pays', why: 'La migration pendulaire se répète chaque jour.' },
        { label: 'des vacances d’été', why: 'Les vacances ne se font pas tous les jours vers le travail.' },
        {
          label: 'un déménagement au centre-ville',
          why: 'Déménager change de domicile : ce n’est pas un aller-retour.',
        },
      ],
      gap: [
        'La migration pendulaire est un déplacement ',
        ' entre le domicile et le lieu de travail.',
        ['quotidien', 'journalier'],
      ],
      choix: ['quotidien', 'annuel', 'définitif'],
      quote: C_PENDULAIRE,
      explain: 'Comme le balancier d’une horloge, le trajet va et revient chaque jour.',
      src: 'cnrtl-pendulaire',
    },
    {
      q: 'Sur quoi les habitants d’une métropole s’appuient-ils pour parcourir ses espaces ?',
      a: 'des moyens de transport et des outils numériques développés',
      wrong: [
        { label: 'uniquement la marche', why: 'Une métropole est vaste : les moyens sont variés.' },
        { label: 'des moyens de transport inexistants', why: 'Les transports y sont au contraire bien développés.' },
        { label: 'des pirogues sur des champs', why: 'Cela ne correspond pas aux transports d’une métropole.' },
      ],
      gap: [
        'Les habitants s’appuient sur des moyens de transports et ',
        ' bien développés.',
        ['numériques', 'numeriques'],
      ],
      choix: ['numériques', 'agricoles', 'forestiers'],
      quote: E_MOBILITES,
      explain: 'La métropole s’organise autour de réseaux qui permettent de circuler.',
      src: EDUSCOL,
    },
    {
      q: 'Pour quelles raisons les habitants se déplacent-ils dans la métropole ?',
      a: 'pour des motifs variés, professionnels ou autres',
      wrong: [
        { label: 'seulement pour travailler', why: 'Le travail n’est qu’un des motifs : il y en a d’autres.' },
        { label: 'seulement pour partir en voyage', why: 'Les déplacements du quotidien sont aussi concernés.' },
        { label: 'sans aucun motif', why: 'Un déplacement répond à un besoin : travail, achats, loisirs.' },
      ],
      gap: [
        'On parcourt la métropole pour toute une palette de ',
        ', professionnels ou autres.',
        ['motifs', 'motif', 'raisons', 'raison'],
      ],
      quote: E_MOTIFS,
      explain: 'Travailler, étudier, acheter, se divertir : les raisons sont multiples.',
      src: EDUSCOL,
    },
    {
      q: 'En 2017 en France, quel moyen de transport les actifs qui se déplacent pour travailler utilisaient-ils le plus ?',
      a: 'la voiture',
      wrong: [
        { label: 'les transports en commun', why: 'Ils ne concernaient que 16 % de ces actifs.' },
        { label: 'la marche', why: 'La marche ne concernait que 6 % de ces actifs.' },
        { label: 'le vélo', why: 'Le vélo ne concernait que 2 % de ces actifs.' },
      ],
      gap: [
        'En 2017, 74 % de ces actifs utilisaient leur ',
        ' pour rejoindre leur travail.',
        ['voiture', 'automobile'],
      ],
      quote: I_VOITURE,
      explain: 'La voiture dominait largement les trajets domicile-travail.',
      src: TRAVAIL,
    },
    {
      q: 'Dans quel cas la marche et le vélo sont-ils surtout utilisés pour aller travailler ?',
      a: 'pour de petites distances',
      wrong: [
        { label: 'pour les très longues distances', why: 'Les modes doux conviennent surtout aux trajets courts.' },
        { label: 'pour traverser un océan', why: 'Ni la marche ni le vélo ne le permettent.' },
        { label: 'uniquement la nuit', why: 'L’heure n’est pas le critère : c’est la distance.' },
      ],
      gap: ['Les modes de transport doux sont surtout utilisés pour de ', ' distances.', ['petites', 'courtes']],
      choix: ['petites', 'très grandes', 'transocéaniques'],
      quote: I_DOUX,
      explain: 'La distance détermine souvent le mode de transport choisi.',
      src: TRAVAIL,
    },
    {
      q: 'Dans quelle aire d’attraction les actifs recouraient-ils massivement aux transports en commun en 2017 ?',
      a: 'celle de Paris',
      wrong: [
        { label: 'aucune aire d’attraction de France', why: 'L’aire de Paris se distingue justement.' },
        {
          label: 'les communes hors de toute aire d’attraction',
          why: 'Hors des aires, la voiture domine très largement.',
        },
        {
          label: 'toutes les aires d’attraction de la même façon',
          why: 'L’INSEE dit que cet usage massif est très spécifique à Paris.',
        },
      ],
      gap: [
        'Le recours massif aux transports en commun était très spécifique à l’aire d’attraction de ',
        '.',
        ['Paris'],
      ],
      quote: I_PARIS,
      explain: '44 % des actifs en emploi de cette aire prenaient les transports en commun.',
      src: TRAVAIL,
    },
  ],
  paires3: [
    ['Flux', 'Des personnes ou des marchandises en mouvement'],
    ['Migration pendulaire', 'Aller-retour quotidien entre domicile et travail'],
    ['Modes doux', 'La marche et le vélo'],
  ],
  paires5: [
    ['Flux', 'Des personnes ou des marchandises en mouvement'],
    ['Migration pendulaire', 'Aller-retour quotidien entre domicile et travail'],
    ['Modes doux', 'La marche et le vélo'],
    ['Transports en commun', 'Métro, bus, tramway ou train partagés'],
    ['Rocade', 'Voie rapide qui contourne l’agglomération'],
  ],
  libres: [
    {
      q: 'Comment appelle-t-on une voie de circulation rapide qui contourne une agglomération ?',
      accepted: [
        'rocade',
        'une rocade',
        'la rocade',
        'périphérique',
        'le périphérique',
        'boulevard périphérique',
        'le boulevard périphérique',
      ],
      traps: [
        { text: 'rue', why: 'Une rue traverse un quartier et n’est pas une voie rapide de contournement.' },
        { text: 'piste cyclable', why: 'Une piste cyclable sert aux vélos.' },
      ],
      quote: C_ROCADE,
      explain: 'La rocade permet de contourner la ville.',
      src: 'cnrtl-rocade',
    },
    {
      q: 'Quel adjectif décrit la migration quotidienne entre domicile et travail (il évoque le balancier d’une horloge) ?',
      accepted: ['pendulaire', 'migration pendulaire', 'la migration pendulaire', 'pendulaires'],
      traps: [
        { text: 'saisonnière', why: 'Saisonnière désigne un déplacement lié à une saison.' },
        { text: 'internationale', why: 'Le trajet domicile-travail ne change pas forcément de pays.' },
      ],
      quote: C_PENDULAIRE,
      explain: 'Comme un pendule d’horloge, la personne va et revient : domicile, travail, puis domicile, chaque jour.',
      src: 'cnrtl-pendulaire',
    },
    {
      q: 'Quel nom désigne le partage d’une voiture entre plusieurs personnes pour un même trajet ?',
      accepted: ['covoiturage', 'le covoiturage', 'du covoiturage', 'co-voiturage'],
      traps: [
        {
          text: 'autopartage',
          why: 'L’ADEME cite l’autopartage à côté du covoiturage : ce sont deux pratiques différentes.',
        },
        { text: 'taxi', why: 'Un taxi est un transport payant avec un conducteur professionnel.' },
      ],
      quote: D_NOUVELLES,
      explain: 'Le covoiturage fait partie des nouvelles mobilités.',
      src: ADEME,
    },
  ],
  docs: [
    {
      title: 'Les trajets de Malo et d’Awa',
      lines: [
        'Malo habite une commune de la couronne et travaille dans le centre. Il fait l’aller-retour chaque jour de semaine.',
        'Faute de bus à son horaire, il prend sa voiture.',
        'Awa habite à dix minutes à pied de son collège.',
      ],
      qs: [
        {
          q: 'Comment appeler le trajet quotidien de Malo ?',
          a: 'une migration pendulaire',
          wrong: [
            { label: 'un séjour touristique', why: 'Malo va travailler, il ne visite pas.' },
            { label: 'une migration définitive', why: 'Il rentre chez lui chaque soir.' },
          ],
          quote: C_PENDULAIRE,
          explain: 'Il va du domicile au travail et revient chaque jour.',
          src: 'cnrtl-pendulaire',
        },
        {
          q: 'Quel mode de transport convient le mieux à Awa, d’après la distance ?',
          a: 'la marche',
          wrong: [
            { label: 'l’avion', why: 'L’avion sert aux très longues distances.' },
            { label: 'le train à grande vitesse', why: 'Un train à grande vitesse relie des villes éloignées.' },
          ],
          quote: I_DOUX,
          explain: 'Les petites distances se prêtent à la marche ou au vélo.',
          src: TRAVAIL,
        },
      ],
    },
    {
      title: 'Une rue à l’heure de pointe',
      lines: [
        'À huit heures, des milliers de voitures entrent dans la métropole de Rivolac.',
        'La ville propose de développer le covoiturage et les pistes cyclables.',
      ],
      qs: [
        {
          q: 'Quel problème ces solutions cherchent-elles à réduire ?',
          a: 'les effets des nombreux trajets en voiture',
          wrong: [
            { label: 'le manque d’écoles', why: 'Le texte parle de la circulation, pas des écoles.' },
            { label: 'le manque de voitures', why: 'Il y a au contraire beaucoup de voitures.' },
          ],
          quote: D_TIERS,
          explain: 'Les transports pèsent sur l’environnement : partager et pédaler allègent ce poids.',
          src: ADEME,
        },
      ],
    },
  ],
};

// ——— Notion 4 : le vocabulaire urbain ———

const vocabulaire: Notion = {
  classe: '6e',
  id: 'g6-vocabulaire-urbain',
  title: 'Le vocabulaire de la ville',
  hint: 'Lis le mot lentement : un préfixe (péri-, multi-) ou un mot connu à l’intérieur peut t’aider.',
  memo: [
    'L’**urbanisation**, c’est la population qui se concentre de plus en plus en ville. Un espace **périurbain** est dans les environs immédiats d’une ville. Un **bidonville** réunit des habitations de fortune ; un **gratte-ciel** est un immeuble très élevé.',
    'La **densité** est le nombre d’habitants par kilomètre carré. Exemple : 100 habitants sur 2 km², soit 50 habitants par km².',
    'Un **citadin** habite la ville.',
  ],
  faits: [
    {
      q: 'Que désigne l’urbanisation ?',
      a: 'la concentration croissante de la population dans les villes',
      wrong: [
        { label: 'le retour de la population vers les champs', why: 'L’urbanisation va vers les villes.' },
        { label: 'la disparition de toutes les villes', why: 'C’est l’inverse : les villes se développent.' },
        {
          label: 'la construction d’un seul immeuble',
          why: 'Il s’agit d’un mouvement de population, pas d’un bâtiment.',
        },
      ],
      gap: ['L’', ' est la concentration croissante de la population dans les agglomérations.', ['urbanisation']],
      choix: ['urbanisation', 'agriculture', 'érosion'],
      quote: C_URBANISATION,
      explain: 'La population se regroupe de plus en plus dans les villes.',
      src: 'cnrtl-urbanisation',
    },
    {
      q: 'Qu’appelle-t-on un bidonville ?',
      a: 'un ensemble d’habitations de fortune à la périphérie de grandes villes',
      wrong: [
        {
          label: 'un quartier de grandes tours de bureaux',
          why: 'Les habitations de fortune sont précaires, pas des tours de bureaux.',
        },
        { label: 'un musée consacré aux boîtes', why: 'Le mot ne désigne pas un musée.' },
        { label: 'un centre ancien protégé', why: 'Un bidonville est un habitat précaire, pas un centre protégé.' },
      ],
      gap: [
        'Un bidonville réunit des habitations de ',
        ', construites à la périphérie de grandes villes.',
        ['fortune'],
      ],
      choix: ['fortune', 'luxe', 'vacances'],
      quote: C_BIDONVILLE,
      explain: 'Des habitations construites avec peu de moyens : l’habitat est précaire.',
      src: 'cnrtl-bidonville',
    },
    {
      q: 'Que signifie « périurbain » ?',
      a: 'situé dans les environs immédiats d’une ville',
      wrong: [
        { label: 'situé au cœur même de la ville', why: '« Péri » veut dire « autour ».' },
        { label: 'situé à l’autre bout du monde', why: '« Environs immédiats » indique la proximité.' },
        { label: 'situé sous le niveau de la mer', why: 'Le mot ne parle pas d’altitude.' },
      ],
      gap: ['Un espace ', ' est situé dans les environs immédiats d’une ville.', ['périurbain']],
      choix: ['périurbain', 'maritime', 'désertique'],
      quote: C_PERIURBAIN,
      explain: '« Péri » veut dire « autour » : autour de la ville.',
      src: 'cnrtl-periurbain',
    },
    {
      q: 'Qu’est-ce que la densité de population ?',
      a: 'le nombre d’habitants par unité de surface',
      wrong: [
        { label: 'la hauteur des immeubles', why: 'La hauteur se mesure en mètres ou en étages.' },
        { label: 'le nombre total d’habitants du monde', why: 'La densité se rapporte à une surface.' },
        {
          label: 'la distance entre deux villes',
          why: 'Une distance n’indique pas combien de personnes vivent sur un espace.',
        },
      ],
      gap: ['La densité s’exprime souvent en habitants par kilomètre ', '.', ['carré', 'carre']],
      quote: C_DENSITE,
      explain: 'On divise le nombre d’habitants par la surface.',
      src: 'cnrtl-densite',
    },
    {
      q: 'Qu’est-ce qu’un gratte-ciel ?',
      a: 'un immeuble très élevé avec de nombreux étages',
      wrong: [
        { label: 'une rue très longue', why: 'Un gratte-ciel est un bâtiment, pas une rue.' },
        { label: 'une maison basse avec un jardin', why: 'Il s’élève au contraire très haut.' },
        { label: 'un nuage de pollution', why: 'C’est un bâtiment, malgré son nom imagé.' },
      ],
      gap: ['Un ', ' est un immeuble très élevé comportant de nombreux étages.', ['gratte-ciel', 'gratte ciel']],
      choix: ['gratte-ciel', 'lotissement', 'faubourg'],
      quote: C_GRATTE_CIEL,
      explain: 'Les gratte-ciel marquent la verticalité des centres.',
      src: 'cnrtl-gratte-ciel',
    },
    {
      q: 'Comment nomme-t-on une personne qui habite en ville ?',
      a: 'un citadin',
      wrong: [
        { label: 'un campagnard', why: 'Un campagnard vit à la campagne.' },
        { label: 'un touriste', why: 'Un touriste visite : il n’habite pas forcément la ville.' },
        { label: 'un pêcheur', why: 'C’est un métier, pas le fait d’habiter en ville.' },
      ],
      gap: ['Une personne qui habite une ville est un ', '.', ['citadin']],
      choix: ['citadin', 'touriste', 'campagnard'],
      quote: C_CITADIN,
      explain: 'Le citadin est la personne qui vit à la ville.',
      src: 'cnrtl-citadin',
    },
  ],
  paires3: [
    ['Urbanisation', 'La population se concentre dans les villes'],
    ['Bidonville', 'Habitat de fortune à la périphérie'],
    ['Densité', 'Habitants par unité de surface'],
  ],
  paires5: [
    ['Urbanisation', 'La population se concentre dans les villes'],
    ['Bidonville', 'Habitat de fortune à la périphérie'],
    ['Densité', 'Habitants par unité de surface'],
    ['Gratte-ciel', 'Immeuble très élevé'],
    ['Citadin', 'Personne qui habite la ville'],
  ],
  libres: [
    {
      q: 'Quel mot désigne le nombre d’habitants par kilomètre carré ?',
      accepted: ['densité', 'la densité', 'densité de population', 'la densité de population'],
      traps: [
        { text: 'population', why: 'La population est le nombre d’habitants, sans la surface.' },
        { text: 'superficie', why: 'La superficie est la taille d’un territoire.' },
      ],
      quote: C_DENSITE,
      explain: 'La densité compare le nombre d’habitants à la surface : elle dit si l’on vit serré ou non.',
      src: 'cnrtl-densite',
    },
    {
      q: 'Quel mot désigne un ensemble d’habitations de fortune à la périphérie d’une grande ville ?',
      accepted: ['bidonville', 'un bidonville', 'le bidonville', 'bidonvilles', 'des bidonvilles'],
      traps: [
        {
          text: 'banlieue',
          why: 'La banlieue désigne des communes autour de la ville-centre, pas forcément précaires.',
        },
        { text: 'lotissement', why: 'Un lotissement est un ensemble de terrains divisés pour construire.' },
      ],
      quote: C_BIDONVILLE,
      explain: '« De fortune » veut dire fait avec les moyens du bord : ces habitations forment un bidonville.',
      src: 'cnrtl-bidonville',
    },
    {
      q: 'Quel mot désigne la concentration croissante de la population dans les villes ?',
      accepted: ['urbanisation', 'l’urbanisation', 'une urbanisation'],
      traps: [
        { text: 'urbanisme', why: 'L’urbanisme est la façon d’aménager la ville.' },
        { text: 'métropole', why: 'Une métropole est une grande ville, pas le mouvement lui-même.' },
      ],
      quote: C_URBANISATION,
      explain: '« Urbain » veut dire « de la ville » : l’urbanisation, c’est la population qui se concentre en ville.',
      src: 'cnrtl-urbanisation',
    },
  ],
  docs: [
    {
      title: 'Croquis d’une métropole',
      lines: [
        'Au centre, des immeubles de plus de cinquante étages abritent des bureaux.',
        'Sur la colline, des familles ont bâti des logements avec des matériaux récupérés.',
        'Autour de la ville, des quartiers de maisons récentes s’installent sur d’anciens champs.',
      ],
      qs: [
        {
          q: 'Quel mot convient aux hauts immeubles du centre ?',
          a: 'des gratte-ciel',
          wrong: [
            { label: 'des bidonvilles', why: 'Les bidonvilles sont des habitations de fortune.' },
            { label: 'des champs', why: 'Ce sont des bâtiments, pas des terres cultivées.' },
          ],
          quote: C_GRATTE_CIEL,
          explain: 'Un immeuble très élevé est un gratte-ciel.',
          src: 'cnrtl-gratte-ciel',
        },
        {
          q: 'Quel mot convient aux logements de la colline ?',
          a: 'un bidonville',
          wrong: [
            { label: 'un quartier de gratte-ciel', why: 'Les logements sont faits de matériaux récupérés.' },
            { label: 'une rocade', why: 'Une rocade est une voie de circulation.' },
          ],
          quote: C_BIDONVILLE,
          explain: 'Ce sont des habitations de fortune.',
          src: 'cnrtl-bidonville',
        },
        {
          q: 'Comment qualifier l’espace autour de la ville où s’installent les maisons ?',
          a: 'périurbain',
          wrong: [
            { label: 'situé au cœur ancien', why: 'Les maisons sont autour de la ville, pas au cœur.' },
            { label: 'désertique', why: 'Des habitants s’y installent.' },
          ],
          quote: C_PERIURBAIN,
          explain: 'L’espace périurbain est aux environs immédiats de la ville.',
          src: 'cnrtl-periurbain',
        },
      ],
    },
    {
      title: 'Une commune qui change',
      lines: [
        'En trente ans, la population de la ville de Belmonde a beaucoup augmenté.',
        'Beaucoup de ces nouveaux habitants ont quitté la campagne pour devenir des citadins.',
      ],
      qs: [
        {
          q: 'Quel phénomène ce texte décrit-il ?',
          a: 'l’urbanisation',
          wrong: [
            { label: 'la désertification', why: 'La population augmente au lieu de partir.' },
            { label: 'la déforestation', why: 'Le texte ne parle pas des forêts.' },
          ],
          quote: C_URBANISATION,
          explain: 'La population se concentre de plus en plus en ville.',
          src: 'cnrtl-urbanisation',
        },
      ],
    },
  ],
};

// ——— Notion 5 : la ville de demain (sous-thème du programme) ———

const villeDemain: Notion = {
  classe: '6e',
  id: 'g6-ville-demain',
  title: 'La ville de demain : problèmes et solutions',
  hint: 'Pense aux problèmes d’aujourd’hui : lequel un choix permet-il de réduire ?',
  memo: [
    'Les métropoles font face à des problèmes : bruit, air pollué, **îlot de chaleur**, **inégalités**.',
    'Imaginer la ville du futur, c’est faire de la **prospective** : déplacements, approvisionnement, architecture, vivre ensemble.',
    'La ville de demain dépend des choix faits aujourd’hui. Les citoyens y ont un rôle. La **ville durable** cherche à préserver l’avenir.',
  ],
  faits: [
    {
      q: 'De quoi dépend la ville de demain ?',
      a: 'des choix faits aujourd’hui',
      wrong: [
        { label: 'uniquement du hasard', why: 'Des choix actuels la préparent.' },
        { label: 'des choix faits seulement il y a mille ans', why: 'C’est maintenant que l’on décide pour la suite.' },
        { label: 'de la couleur des panneaux', why: 'La couleur ne décide pas de l’avenir d’une ville.' },
      ],
      gap: ['La ville de demain résulte de choix faits ', '.', ['aujourd’hui', "aujourd'hui"]],
      choix: ['aujourd’hui', 'au Moyen Âge', 'par hasard'],
      quote: E_CHOIX,
      explain: 'Chaque décision d’aménagement prépare la ville future.',
      src: EDUSCOL,
    },
    {
      q: 'Quel problème l’étalement urbain et les mobilités posent-ils aux métropoles ?',
      a: 'un coût en énergie',
      wrong: [
        { label: 'la disparition de la mer', why: 'L’étalement ne fait pas disparaître la mer.' },
        { label: 'le manque de nom des rues', why: 'Ce n’est pas un problème environnemental cité.' },
        { label: 'la baisse totale des trajets', why: 'Une ville étalée rend au contraire les trajets nombreux.' },
      ],
      gap: ['L’étalement et les mobilités posent un problème de coût ', '.', ['énergétique', 'energetique']],
      choix: ['énergétique', 'postal', 'musical'],
      quote: E_ENERGIE,
      explain: 'Plus les trajets sont longs, plus ils demandent d’énergie.',
      src: EDUSCOL,
    },
    {
      q: 'Quelle nuisance fait partie des problèmes environnementaux des métropoles ?',
      a: 'le bruit',
      wrong: [
        { label: 'le calme excessif', why: 'Les nuisances citées sont liées au bruit.' },
        { label: 'le manque de bâtiments', why: 'Les métropoles sont très bâties.' },
        { label: 'le gel permanent', why: 'Ce n’est pas un problème propre aux métropoles.' },
      ],
      gap: ['Les habitants subissent des problèmes de qualité de l’air et des nuisances liées au ', '.', ['bruit']],
      quote: E_NUISANCES,
      explain: 'Le bruit et la pollution de l’air pèsent sur la qualité de vie.',
      src: EDUSCOL,
    },
    {
      q: 'Comment s’appelle la modification du climat en ville, plus chaud que les environs ?',
      a: 'l’îlot de chaleur',
      wrong: [
        { label: 'le volcan urbain', why: 'Ce n’est pas un volcan : on parle d’îlot de chaleur.' },
        { label: 'la banquise', why: 'La banquise est de la glace.' },
        { label: 'la rocade', why: 'Une rocade est une voie de circulation.' },
      ],
      gap: ['En ville, la modification du climat peut former un îlot de ', '.', ['chaleur']],
      quote: E_ILOT,
      explain: 'L’expression désigne une modification du climat propre à la ville.',
      src: EDUSCOL,
    },
    {
      q: 'Quelle question la ville de demain pose-t-elle, d’après le programme ?',
      a: 'comment mieux vivre ensemble et améliorer le développement durable',
      wrong: [
        { label: 'comment supprimer tous les habitants', why: 'La ville est faite pour ses habitants.' },
        { label: 'comment arrêter tous les échanges', why: 'On cherche à mieux se déplacer et s’approvisionner.' },
        { label: 'comment copier la ville sans rien changer', why: 'La démarche invite au contraire à imaginer.' },
      ],
      gap: [
        'La ville de demain invite à imaginer de nouvelles architectures et à améliorer le développement ',
        '.',
        ['durable'],
      ],
      quote: P_DEMAIN,
      explain: 'Déplacements, approvisionnement, architecture, cohabitation et durabilité sont en jeu.',
    },
    {
      q: 'Quel problème social les métropoles rencontrent-elles ?',
      a: 'des inégalités entre habitants et quartiers',
      wrong: [
        { label: 'une égalité parfaite partout', why: 'Les inégalités urbaines sont justement citées comme problème.' },
        { label: 'l’absence d’habitants', why: 'Les métropoles attirent beaucoup de monde.' },
        { label: 'un climat polaire', why: 'C’est une question de climat, pas un problème social.' },
      ],
      gap: ['Les métropoles connaissent des problèmes liés aux ', ' urbaines.', ['inégalités', 'inegalites']],
      choix: ['inégalités', 'marées', 'saisons'],
      quote: E_INEGALITES,
      explain: 'Les quartiers n’offrent pas à tous les mêmes conditions de vie.',
      src: EDUSCOL,
    },
  ],
  paires3: [
    ['Prospective', 'Réfléchir aux futurs possibles d’un territoire'],
    ['Îlot de chaleur', 'Zone urbaine plus chaude que ses environs'],
    ['Ville durable', 'Ville qui tient compte de l’avenir'],
  ],
  paires5: [
    ['Prospective', 'Réfléchir aux futurs possibles d’un territoire'],
    ['Îlot de chaleur', 'Zone urbaine plus chaude que ses environs'],
    ['Ville durable', 'Ville qui tient compte de l’avenir'],
    ['Ville compacte', 'Ville qui regroupe les constructions sur peu d’espace'],
    ['Ville étalée', 'Ville qui s’étend loin sur son pourtour'],
  ],
  libres: [
    {
      q: 'Quel mot désigne la démarche qui consiste à réfléchir à la ville du futur et aux choix possibles (il commence par « prospec ») ?',
      accepted: ['prospective', 'la prospective', 'la prospective territoriale', 'prospective territoriale'],
      traps: [
        { text: 'prospectus', why: 'Un prospectus est un petit document publicitaire.' },
        { text: 'archéologie', why: 'L’archéologie étudie le passé.' },
      ],
      quote: P_PROSPECTIVE,
      explain: 'La prospective imagine les futurs possibles d’un territoire.',
    },
    {
      q: 'Complète l’expression étudiée en classe : « la ville … » (celle qui cherche à préserver l’avenir).',
      accepted: ['durable', 'la ville durable', 'ville durable'],
      traps: [
        { text: 'étalée', why: 'La ville étalée désigne une ville qui s’étend loin.' },
        { text: 'ancienne', why: 'L’âge d’une ville n’indique pas son rapport à l’avenir.' },
      ],
      quote: E_DURABLE,
      explain: 'On cherche à penser, construire et gérer la ville durable.',
      src: EDUSCOL,
    },
    {
      q: 'Quel adjectif qualifie la ville opposée à la ville étalée : plus resserrée, ou construite en hauteur (verticale) ?',
      accepted: ['compacte', 'la ville compacte', 'ville compacte'],
      traps: [
        { text: 'périurbaine', why: 'Périurbain désigne les environs de la ville.' },
        { text: 'dispersée', why: 'Une ville dispersée est le contraire d’une ville resserrée.' },
      ],
      quote: E_COMPACTE,
      explain: 'La ressource oppose la ville étalée à la ville compacte ou verticale.',
      src: EDUSCOL,
    },
  ],
  docs: [
    {
      title: 'Débat à Clairval',
      lines: [
        'La métropole de Clairval veut construire de nouveaux logements.',
        'Un premier projet les installe loin du centre, sur des champs, avec de grandes maisons.',
        'Un second les construit près d’une station de tramway, dans des immeubles plus hauts. La mairie invite les habitants à en discuter.',
      ],
      qs: [
        {
          q: 'Quel projet limite le plus l’étalement urbain ?',
          a: 'le second, près du tramway',
          wrong: [
            { label: 'le premier, sur des champs', why: 'Il étend la ville loin du centre.' },
            { label: 'aucun, car construire ne change rien', why: 'L’emplacement change l’étendue de la ville.' },
          ],
          quote: E_COMPACTE,
          explain: 'La ville compacte regroupe les logements au lieu de s’étendre.',
          src: EDUSCOL,
        },
        {
          q: 'Pourquoi la réunion avec les habitants est-elle importante ?',
          a: 'les citoyens ont une place dans les choix d’aménagement',
          wrong: [
            { label: 'les habitants ne sont jamais concernés', why: 'La ville de demain les concerne directement.' },
            { label: 'la décision est prise par tirage au sort', why: 'Le texte parle d’une discussion.' },
          ],
          quote: E_CITOYENS,
          explain: 'La ressource Éduscol demande de comprendre le rôle des citoyens.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Un projet de quartier vert',
      lines: [
        'Dans une rue très bétonnée, les étés sont étouffants.',
        'La commune veut planter des arbres et ouvrir un parc.',
        'Elle imagine aussi des capteurs numériques pour suivre la circulation.',
      ],
      qs: [
        {
          q: 'Quel problème les arbres cherchent-ils à réduire ici ?',
          a: 'l’îlot de chaleur',
          wrong: [
            { label: 'le manque de gratte-ciel', why: 'Les arbres n’ajoutent pas de gratte-ciel.' },
            { label: 'la hausse du nombre d’écoles', why: 'Le texte parle de la chaleur.' },
          ],
          quote: M_FRAIS,
          explain: 'La nature rafraîchit la ville : elle aide à réduire l’îlot de chaleur.',
          src: NATURE,
        },
        {
          q: 'À quelle idée de la ville de demain les capteurs numériques font-ils penser ?',
          a: 'la ville intelligente et connectée',
          wrong: [
            { label: 'la ville sans électricité', why: 'Les capteurs utilisent des outils numériques.' },
            { label: 'la ville abandonnée', why: 'La commune investit au contraire dans son quartier.' },
          ],
          quote: E_UTOPIES,
          explain: 'La ressource cite la ville intelligente et connectée.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [metropoles, peripheries, mobilites, vocabulaire, villeDemain];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
