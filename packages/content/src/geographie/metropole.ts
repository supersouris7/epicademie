import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { zoneName } from '../cartes.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Sixième, thème 1 « Habiter une métropole » (lot ge-6e-01). Chaque fait cite une source du registre avec sa
 * citation exacte : programme du cycle 3, ressource Éduscol du thème, INSEE, atlas du Centre commun de recherche
 * de la Commission européenne (en anglais), ADEME, CNRTL, Géoconfluences (ENS de Lyon) et notices de la BnF. « La ville de demain », sous-thème du programme, est
 * traitée comme cinquième notion. Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const EDUSCOL = 'eduscol-habiter-metropole';
const ATLAS = 'ghsl-atlas-2018';
const VILLE_CENTRE = 'insee-ville-centre';
const BANLIEUE = 'insee-banlieue';
const AIRE = 'insee-aire-attraction';
const TRAVAIL = 'insee-domicile-travail';
const ADEME = 'ademe-trajets';
const NATURE = 'ecologie-nature-ville';
const METROPOLISATION = 'geoconfluences-metropolisation';
const VILLES_MONDIALES = 'geoconfluences-villes-mondiales';
const ILOT = 'geoconfluences-ilot-chaleur';

// Programme du cycle 3.
const P_FONCTIONS =
  'en insistant sur ses fonctions économiques, sociales, politiques et culturelles, sur la variété des espaces qui la composent et les flux qui la parcourent';
const P_HABITANTS =
  'Elle est marquée par la diversité de ses habitants : résidents, migrants pendulaires, touristes, usagers occasionnels la pratiquent différemment et contribuent à la façonner';
const P_PROSPECTIVE = 'dans le cadre d’une initiation à la prospective territoriale, à imaginer la ville du futur';

// Ressource Éduscol « Habiter une métropole ».
const E_DEFINITION = 'métropoles, que l’on peut définir comme de très grandes villes multimillionnaires';
const E_MOITIE = 'plus de la moitié de l’humanité (et probablement les 2/3 en 2050), habite dans des villes';
const E_COMMANDEMENT =
  'la métropole se caractérise par la concentration de fonctions supérieures et de commandement, de revenus et d’emplois';
const E_SURFACE =
  'qui s’accroissent en population mais surtout en surface, intégrant progressivement les espaces périphériques';
const E_MULTIPOLAIRES = 'Ils sont enfin multipolaires, composés de plusieurs centres, dont des centres secondaires';
const E_MOBILITES =
  'Les habitants de la métropole s’appuient sur des moyens de transports et numériques bien développés';
const E_MOTIFS = 'pour toute une palette de motifs, professionnels ou autres';
const E_ENERGIE = 'en termes de coût énergétique posé par l’étalement et les mobilités';
const E_NUISANCES = 'de qualité de l’air, de nuisances liées au bruit';
const E_INEGALITES = 'Des problèmes sociaux, liés à la puissance des inégalités urbaines';
const E_CHOIX = 'la ville de demain résulte d’un certain nombre de choix qui sont faits aujourd’hui';
const E_DURABLE = 'comment penser, construire et gérer la ville durable ?';
const E_UTOPIES =
  'La ville intelligente et connectée, la ville verte et fertile sont autant de nouvelles utopies urbaines';
const E_COMPACTE = 'la ville étalée et de la ville compacte ou verticale';
const E_CITOYENS = 'comprendre le rôle et la place des citoyens dans les choix d’aménagements urbains';

// INSEE.
const I_AGGLO =
  'Lorsqu’une unité urbaine est constituée de plusieurs communes, on la désigne sous le terme d’agglomération multicommunale';
const I_VILLE_CENTRE = 'la commune la plus peuplée, ainsi que cette dernière, sont villes-centres';
const I_BANLIEUE = 'Les communes qui ne sont pas villes-centres constituent la banlieue de l’unité urbaine';
const I_AIRE = 'constitué d’un pôle de population et d’emploi, et d’une couronne qui regroupe les communes';
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

// Géoconfluences (ENS de Lyon).
const G_METROPOLISATION =
  'La métropolisation désigne le processus de concentration de populations, d’activités, de valeur dans des villes de grande taille';
const G_ILOT =
  'La température en ville dépend de la température ambiante de la région, mais elle est augmentée à cause de la forme urbaine, l’architecture, les matériaux utilisés, l’absence de végétalisation';
const G_MATERIAUX = 'les matériaux de construction emmagasinent la chaleur';

// ——— Carte : localiser de grandes métropoles (repère de la ressource Éduscol) ———

type Continent = 'asie' | 'amerique-nord' | 'amerique-sud' | 'europe' | 'afrique';

/** Pourquoi la ville figure dans la liste (phrase reformulée en français d’après la source). */
const REPERES = {
  atlas: 'L’atlas de la Commission européenne la compte parmi les dix grands centres urbains les plus riches en 2015.',
  mondiale: 'Le site de géographie Géoconfluences la compte parmi les principales villes mondiales.',
  caire:
    'L’atlas de la Commission européenne compte Le Caire parmi les dix grands centres urbains les plus exposés aux séismes.',
} as const;

/** Grandes métropoles à situer : pays d’après la notice de la BnF. */
export const METROPOLES: readonly {
  readonly nom: string;
  readonly notice: string;
  readonly pays: string;
  readonly continent: Continent;
  readonly src: string;
  readonly repere: keyof typeof REPERES;
}[] = [
  {
    nom: 'Tokyo',
    notice: 'Tokyo (Japon)',
    pays: 'au Japon',
    continent: 'asie',
    src: 'bnf-tokyo',
    repere: 'atlas',
  },
  {
    nom: 'Shanghai',
    notice: 'Shanghai (Chine)',
    pays: 'en Chine',
    continent: 'asie',
    src: 'bnf-shanghai',
    repere: 'atlas',
  },
  {
    nom: 'Jakarta',
    notice: 'Jakarta (Indonésie)',
    pays: 'en Indonésie',
    continent: 'asie',
    src: 'bnf-jakarta',
    repere: 'atlas',
  },
  {
    nom: 'Séoul',
    notice: 'Séoul (Corée du Sud)',
    pays: 'en Corée du Sud',
    continent: 'asie',
    src: 'bnf-seoul',
    repere: 'atlas',
  },
  {
    nom: 'Bangkok',
    notice: 'Bangkok (Thaïlande)',
    pays: 'en Thaïlande',
    continent: 'asie',
    src: 'bnf-bangkok',
    repere: 'atlas',
  },
  {
    nom: 'New York',
    notice: 'New York (New York, États-Unis)',
    pays: 'aux États-Unis',
    continent: 'amerique-nord',
    src: 'bnf-new-york',
    repere: 'atlas',
  },
  {
    nom: 'Los Angeles',
    notice: 'Los Angeles (Calif., États-Unis)',
    pays: 'aux États-Unis',
    continent: 'amerique-nord',
    src: 'bnf-los-angeles',
    repere: 'atlas',
  },
  {
    nom: 'São Paulo',
    notice: 'São Paulo (São Paulo, Brésil)',
    pays: 'au Brésil',
    continent: 'amerique-sud',
    src: 'bnf-sao-paulo',
    repere: 'atlas',
  },
  {
    nom: 'Paris',
    notice: 'Paris (France)',
    pays: 'en France',
    continent: 'europe',
    src: 'bnf-paris',
    repere: 'mondiale',
  },
  {
    nom: 'Londres',
    notice: 'Londres (Royaume-Uni)',
    pays: 'au Royaume-Uni',
    continent: 'europe',
    src: 'bnf-londres',
    repere: 'mondiale',
  },
  {
    nom: 'Le Caire',
    notice: 'Le Caire (Égypte)',
    pays: 'en Égypte',
    continent: 'afrique',
    src: 'bnf-le-caire',
    repere: 'caire',
  },
];

const CONTINENTS = ['asie', 'amerique-nord', 'amerique-sud', 'europe', 'afrique', 'oceanie'] as const;
const continent = (id: string) => zoneName('monde', id) ?? id;

const reperage = (m: (typeof METROPOLES)[number]) => [
  REPERES[m.repere],
  `La Bibliothèque nationale de France écrit « ${m.notice} » : ${m.nom} est ${m.pays}.`,
  'Sur le planisphère, on cherche ce pays, puis le continent où il se trouve.',
  `${m.nom} se trouve sur le continent : **${continent(m.continent)}**.`,
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
      steps: reperage(m),
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
    steps: reperage(m),
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
    'La **métropolisation**, c’est la concentration des habitants, des activités et des richesses dans les grandes villes.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’une métropole ?',
      a: 'une très grande ville comptant plusieurs millions d’habitants',
      wrong: [
        { label: 'un petit village isolé', why: 'Une métropole est au contraire une très grande ville.' },
        {
          label: 'un espace uniquement agricole',
          why: 'Une métropole est un ensemble urbain, pas un espace agricole.',
        },
        {
          label: 'une ville sans activité économique',
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
    ['Métropolisation', 'Concentration d’habitants et d’activités dans les grandes villes'],
    ['Fonction de commandement', 'Rôle de décision'],
  ],
  libres: [
    {
      q: 'Quel mot, formé à partir de « métropole », désigne la concentration d’habitants et d’activités dans les grandes villes ?',
      accepted: ['métropolisation', 'la métropolisation', 'une métropolisation'],
      traps: [
        { text: 'mondialisation', why: 'La mondialisation désigne les échanges à l’échelle du monde.' },
        { text: 'urbanisme', why: 'L’urbanisme est l’aménagement des villes.' },
      ],
      quote: G_METROPOLISATION,
      explain:
        '« Métropole » donne « métropolisation » : habitants, activités et richesses se concentrent dans les grandes villes.',
      src: METROPOLISATION,
    },
    {
      q: 'Comment appelle-t-on une très grande ville de plusieurs millions d’habitants, qui concentre des emplois et des pouvoirs ?',
      accepted: ['métropole', 'une métropole', 'la métropole'],
      traps: [
        { text: 'village', why: 'Un village compte peu d’habitants.' },
        { text: 'campagne', why: 'La campagne est un espace peu peuplé.' },
      ],
      quote: E_DEFINITION,
      explain: 'Une très grande ville influente est une métropole.',
      src: EDUSCOL,
    },
    {
      q: 'Comment appelle-t-on une personne qui habite durablement dans la métropole ?',
      accepted: [
        'résident',
        'un résident',
        'le résident',
        'résidente',
        'une résidente',
        'résidant',
        'un résidant',
        'habitant',
        'un habitant',
      ],
      traps: [
        { text: 'touriste', why: 'Le touriste vient pour une visite : il repart chez lui.' },
        {
          text: 'migrant pendulaire',
          why: 'Le migrant pendulaire fait l’aller-retour entre son domicile et son travail.',
        },
      ],
      quote: P_HABITANTS,
      explain: 'Le résident habite la métropole.',
    },
    {
      q: 'Comment appelle-t-on une personne venue quelques jours dans une métropole pour la visiter ?',
      accepted: ['touriste', 'un touriste', 'une touriste', 'le touriste'],
      traps: [
        { text: 'résident', why: 'Le résident habite durablement sur place.' },
        { text: 'migrant pendulaire', why: 'Le migrant pendulaire vient chaque jour pour son travail.' },
      ],
      quote: P_HABITANTS,
      explain: 'Le touriste visite la métropole.',
    },
    {
      q: 'Comment appelle-t-on la personne qui fait chaque jour l’aller-retour entre son domicile et son travail (deux mots) ?',
      accepted: [
        'migrant pendulaire',
        'un migrant pendulaire',
        'le migrant pendulaire',
        'migrante pendulaire',
        'une migrante pendulaire',
      ],
      traps: [
        { text: 'touriste', why: 'Le touriste visite : il ne vient pas travailler chaque jour.' },
        { text: 'résident', why: 'Le mot « résident » dit où l’on habite, pas le trajet quotidien.' },
      ],
      quote: C_PENDULAIRE,
      explain: 'Comme un balancier d’horloge, le migrant pendulaire va et revient chaque jour.',
      src: 'cnrtl-pendulaire',
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
      title: 'Grandrive et Solaville',
      lines: [
        'Grandrive compte 3 millions d’habitants. De hautes tours de bureaux forment son quartier d’affaires. Un métro la traverse.',
        'Solaville compte 12 millions d’habitants. Autour de son centre ancien, des familles vivent dans des habitations de fortune.',
        'À Solaville, des bus très remplis transportent chaque matin les travailleurs vers le centre.',
      ],
      qs: [
        {
          q: 'Quelle métropole compte le plus d’habitants ?',
          a: 'Solaville',
          wrong: [
            { label: 'Grandrive', why: 'Grandrive en compte 3 millions, contre 12 millions pour Solaville.' },
            { label: 'les deux en comptent autant', why: 'Les deux nombres du texte sont différents.' },
            {
              label: 'le texte ne permet pas de le savoir',
              why: 'Le texte donne le nombre d’habitants des deux villes.',
            },
          ],
          quote: E_DEFINITION,
          explain: '12 millions, c’est plus que 3 millions.',
          src: EDUSCOL,
        },
        {
          q: 'Quel point commun les deux métropoles ont-elles ?',
          a: 'plusieurs millions d’habitants',
          wrong: [
            { label: 'un métro', why: 'Le texte ne cite un métro qu’à Grandrive.' },
            { label: 'des habitations de fortune', why: 'Le texte n’en cite qu’à Solaville.' },
            { label: 'le même nombre d’habitants', why: 'L’une en a 3 millions, l’autre 12 millions.' },
          ],
          quote: E_DEFINITION,
          explain: 'Les deux sont de très grandes villes de plusieurs millions d’habitants.',
          src: EDUSCOL,
        },
        {
          q: 'Quelle différence entre les transports le texte montre-t-il ?',
          a: 'un métro à Grandrive, des bus très remplis à Solaville',
          wrong: [
            { label: 'aucun transport à Solaville', why: 'Des bus y circulent.' },
            { label: 'un métro à Solaville seulement', why: 'Le métro est cité à Grandrive.' },
            {
              label: 'les mêmes transports dans les deux villes',
              why: 'Le texte cite un métro d’un côté, des bus de l’autre.',
            },
          ],
          quote: E_MOBILITES,
          explain: 'Chaque métropole organise les déplacements à sa façon.',
          src: EDUSCOL,
        },
        {
          q: 'Quel quartier de Grandrive montre sa fonction économique ?',
          a: 'le quartier d’affaires',
          wrong: [
            { label: 'le centre ancien', why: 'Le texte cite un centre ancien à Solaville.' },
            { label: 'les habitations de fortune', why: 'Elles sont à Solaville et servent de logements.' },
            { label: 'aucun quartier', why: 'Les tours de bureaux forment un quartier d’affaires.' },
          ],
          quote: P_FONCTIONS,
          explain: 'Les bureaux des entreprises relèvent de la fonction économique.',
        },
      ],
    },
  ],
  carte: carteMetropoles,
  sources: [...METROPOLES.map((m) => m.src), ATLAS, VILLES_MONDIALES],
};

// ——— Notion 2 : la ville et ses périphéries ———

const peripheries: Notion = {
  classe: '6e',
  id: 'g6-ville-peripheries',
  title: 'La ville et ses périphéries',
  hint: 'Pars du centre, puis éloigne-toi : demande-toi ce qui relie chaque commune à la ville.',
  memo: [
    'Au cœur, la **ville-centre**, la commune principale ; autour, la **banlieue** : ensemble, elles forment une **agglomération** (l’INSEE parle d’**unité urbaine**).',
    'Plus loin, la **couronne** : des communes d’où des habitants partent travailler dans le **pôle**, le cœur qui rassemble habitants et emplois.',
    'Les métropoles s’étendent autour d’elles (**étalement urbain**) et ont souvent plusieurs centres : on les dit **multipolaires**.',
  ],
  faits: [
    {
      q: 'Dans une agglomération, comment appelle-t-on les communes qui entourent la ville-centre ?',
      a: 'la banlieue',
      wrong: [
        { label: 'le centre historique', why: 'Le centre historique est dans la ville, pas autour.' },
        { label: 'la capitale', why: 'La capitale est la ville où siège le pouvoir d’un pays.' },
        { label: 'la région', why: 'Une région est un territoire beaucoup plus vaste.' },
      ],
      gap: ['Les communes de l’agglomération qui ne sont pas villes-centres forment la ', '.', ['banlieue']],
      quote: I_BANLIEUE,
      explain: 'La banlieue entoure la ville-centre, dans la même agglomération.',
      src: BANLIEUE,
    },
    {
      q: 'Comment appelle-t-on la commune la plus peuplée, au cœur d’une agglomération ?',
      a: 'la ville-centre',
      wrong: [
        { label: 'la banlieue', why: 'La banlieue regroupe les communes qui entourent la ville-centre.' },
        { label: 'la couronne', why: 'La couronne est plus loin, autour du pôle.' },
        { label: 'un hameau', why: 'Un hameau est un tout petit groupe de maisons.' },
      ],
      gap: ['La commune la plus peuplée d’une agglomération est une ville-', '.', ['centre']],
      quote: I_VILLE_CENTRE,
      explain: 'La commune la plus peuplée est au cœur : c’est une ville-centre.',
      src: VILLE_CENTRE,
    },
    {
      q: 'Comment appelle-t-on les communes, plus loin autour du pôle, d’où des habitants partent y travailler ?',
      a: 'la couronne',
      wrong: [
        { label: 'la ville-centre', why: 'La ville-centre est au cœur, pas autour.' },
        { label: 'le quartier d’affaires', why: 'Un quartier d’affaires rassemble des bureaux.' },
        { label: 'le centre historique', why: 'Le centre historique est la partie ancienne de la ville.' },
      ],
      gap: ['Autour du pôle, les communes liées à lui par le travail forment la ', '.', ['couronne']],
      quote: I_AIRE,
      explain: 'Le travail relie les communes de la couronne au pôle.',
      src: AIRE,
    },
    {
      q: 'Comment les métropoles s’agrandissent-elles surtout ?',
      a: 'en surface, en gagnant les espaces qui les entourent',
      wrong: [
        { label: 'en perdant leurs habitants', why: 'Elles gagnent au contraire des habitants.' },
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
      explain: 'La ville s’étale vers sa périphérie, c’est-à-dire ses bords.',
      src: EDUSCOL,
    },
    {
      q: 'Que veut dire qu’une métropole est « multipolaire » ?',
      a: 'elle a plusieurs centres',
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
  ],
  paires3: [
    ['Ville-centre', 'Une commune principale de l’agglomération'],
    ['Banlieue', 'Les communes autour de la ville-centre, dans l’agglomération'],
    ['Couronne', 'Des communes plus loin, liées au pôle par le travail'],
  ],
  paires5: [
    ['Ville-centre', 'Une commune principale de l’agglomération'],
    ['Banlieue', 'Les communes autour de la ville-centre, dans l’agglomération'],
    ['Couronne', 'Des communes plus loin, liées au pôle par le travail'],
    ['Étalement urbain', 'La ville gagne les espaces autour d’elle'],
    ['Pôle', 'Cœur qui rassemble habitants et emplois'],
  ],
  ordre: ['la ville-centre', 'la banlieue', 'la couronne'],
  consigne: {
    prompt: 'Remets ces espaces dans l’ordre, du centre vers l’extérieur.',
    hint: 'La ville-centre est au cœur ; la couronne est la plus éloignée.',
    why: 'La banlieue entoure la ville-centre ; la couronne se trouve autour du pôle qu’elles forment.',
    fin: 'Au cœur se trouve',
    quote: I_AIRE,
    src: AIRE,
  },
  libres: [
    {
      q: 'Comment appelle-t-on les communes qui entourent la ville-centre, dans la même agglomération ?',
      accepted: ['banlieue', 'la banlieue', 'les banlieues', 'banlieues', 'une banlieue'],
      traps: [
        { text: 'couronne', why: 'La couronne est plus loin : le travail la relie au pôle.' },
        { text: 'ville-centre', why: 'La ville-centre est au cœur, pas autour.' },
      ],
      quote: I_BANLIEUE,
      explain: 'Les communes autour de la ville-centre forment la banlieue.',
      src: BANLIEUE,
    },
    {
      q: 'Quel mot désigne un ensemble de plusieurs communes dont les constructions se suivent ?',
      accepted: ['agglomération', 'une agglomération', 'l’agglomération', 'unité urbaine', 'une unité urbaine'],
      traps: [
        { text: 'région', why: 'Une région est un territoire beaucoup plus vaste.' },
        { text: 'campagne', why: 'La campagne est un espace peu peuplé.' },
      ],
      quote: I_AGGLO,
      explain: 'Plusieurs communes qui se suivent forment une agglomération.',
      src: VILLE_CENTRE,
    },
    {
      q: 'Comment appelle-t-on le fait que la ville s’étende sur les espaces qui l’entourent (deux mots) ?',
      accepted: ['étalement urbain', 'l’étalement urbain', 'un étalement urbain'],
      traps: [
        { text: 'urbanisme', why: 'L’urbanisme est la façon d’aménager la ville.' },
        { text: 'centre-ville', why: 'Le centre-ville est le cœur de la ville.' },
      ],
      quote: E_SURFACE,
      explain: 'La ville gagne de la surface : c’est l’étalement urbain.',
      src: EDUSCOL,
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
          quote: I_AIRE,
          explain: 'C’est le lien de travail avec le pôle qui définit la couronne.',
          src: AIRE,
        },
        {
          q: 'Quel est le rôle de Vertcoteau dans son agglomération ?',
          a: 'la ville-centre',
          wrong: [
            { label: 'une commune de la couronne', why: 'La couronne est faite des villages plus éloignés.' },
            { label: 'une commune de banlieue', why: 'La banlieue entoure Vertcoteau.' },
            { label: 'un hameau isolé', why: 'Vertcoteau rassemble la plupart des habitants.' },
          ],
          quote: I_VILLE_CENTRE,
          explain: 'La commune la plus peuplée est la ville-centre.',
          src: VILLE_CENTRE,
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
        {
          q: 'Comment appeler le fait que la ville aille chaque année plus loin ?',
          a: 'l’étalement urbain',
          wrong: [
            { label: 'la baisse de la population', why: 'Le texte dit que la ville s’étend.' },
            { label: 'la disparition du centre', why: 'Le centre ancien existe toujours.' },
            { label: 'le retour des champs', why: 'La ville avance sur les espaces qui l’entourent.' },
          ],
          quote: E_SURFACE,
          explain: 'Une ville qui gagne de la surface s’étale.',
          src: EDUSCOL,
        },
        {
          q: 'Qu’est-ce que le quartier près de l’aéroport pour cette métropole ?',
          a: 'un centre secondaire',
          wrong: [
            { label: 'son centre ancien', why: 'Le texte distingue le centre ancien de ce quartier.' },
            { label: 'un village de la campagne', why: 'Le texte parle d’un second centre.' },
            { label: 'un espace sans activité', why: 'Un second centre rassemble des activités.' },
          ],
          quote: E_MULTIPOLAIRES,
          explain: 'En plus du centre principal, une métropole a des centres secondaires.',
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
        {
          q: 'Pour quel motif Malo se déplace-t-il ?',
          a: 'un motif professionnel, le travail',
          wrong: [
            { label: 'les vacances', why: 'Le texte dit qu’il travaille dans le centre.' },
            { label: 'les achats', why: 'Le texte ne parle pas de courses.' },
            { label: 'le sport', why: 'Le texte ne parle pas d’activité sportive.' },
          ],
          quote: E_MOTIFS,
          explain: 'Aller travailler est un motif professionnel.',
          src: EDUSCOL,
        },
        {
          q: 'Awa va au collège à pied. Quel type de déplacement est-ce ?',
          a: 'un mode de transport doux',
          wrong: [
            { label: 'un transport en commun', why: 'La marche ne se partage pas dans un véhicule.' },
            { label: 'un trajet en voiture', why: 'Awa se déplace à pied.' },
            { label: 'un séjour touristique', why: 'Elle va au collège.' },
          ],
          quote: I_DOUX,
          explain: 'La marche et le vélo sont les modes doux.',
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
        {
          q: 'Avec quelle solution plusieurs personnes partagent-elles une même voiture ?',
          a: 'le covoiturage',
          wrong: [
            { label: 'les pistes cyclables', why: 'Elles servent aux vélos.' },
            { label: 'les embouteillages', why: 'Ce sont un problème, pas une solution.' },
            { label: 'la marche', why: 'Marcher ne fait pas partager une voiture.' },
          ],
          quote: D_NOUVELLES,
          explain: 'Le covoiturage réunit plusieurs personnes dans une voiture.',
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
        'Beaucoup de ces nouveaux habitants ont quitté la campagne pour s’installer en ville.',
        'La surface de la ville, elle, n’a pas changé.',
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
        {
          q: 'Comment appelle-t-on les personnes qui vivent maintenant à Belmonde ?',
          a: 'des citadins',
          wrong: [
            { label: 'des campagnards', why: 'Ils vivent désormais en ville.' },
            { label: 'des touristes', why: 'Ils se sont installés : ils ne font pas que visiter.' },
            { label: 'des migrants pendulaires', why: 'Le texte ne parle pas d’un trajet quotidien vers le travail.' },
          ],
          quote: C_CITADIN,
          explain: 'Le citadin est la personne qui vit à la ville.',
          src: 'cnrtl-citadin',
        },
        {
          q: 'Qu’est-ce qui augmente à Belmonde, puisque plus d’habitants vivent sur la même surface ?',
          a: 'la densité de population',
          wrong: [
            { label: 'la superficie', why: 'Le texte dit que la surface n’a pas changé.' },
            { label: 'la distance entre les villes', why: 'La population ne change pas cette distance.' },
            { label: 'la hauteur de la colline', why: 'Le texte ne parle pas de relief.' },
          ],
          quote: C_DENSITE,
          explain: 'Plus d’habitants par kilomètre carré : la densité augmente.',
          src: 'cnrtl-densite',
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
        { label: 'des trajets plus courts pour tous', why: 'Une ville étalée allonge au contraire les distances.' },
        { label: 'une baisse du nombre d’habitants', why: 'L’étalement accompagne la croissance de la ville.' },
        {
          label: 'la disparition de la circulation',
          why: 'Les habitants continuent de se déplacer, souvent plus loin.',
        },
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
      q: 'Comment s’appelle le phénomène qui rend la ville plus chaude que les environs ?',
      a: 'l’îlot de chaleur',
      wrong: [
        { label: 'la vague de froid', why: 'Il s’agit au contraire d’un air plus chaud.' },
        { label: 'la pollution sonore', why: 'La pollution sonore désigne le bruit.' },
        { label: 'l’étalement urbain', why: 'L’étalement désigne la ville qui gagne de la surface.' },
      ],
      gap: ['Le béton garde la chaleur et les arbres manquent : la ville forme un îlot de ', '.', ['chaleur']],
      quote: G_ILOT,
      explain:
        'Les matériaux de construction gardent la chaleur et il manque des plantes : la ville chauffe davantage.',
      src: ILOT,
    },
    {
      q: 'Une métropole veut loger de nouveaux habitants sans trop allonger leurs trajets. Quel choix est le plus adapté ?',
      a: 'construire près d’une station de tramway ou de métro',
      wrong: [
        {
          label: 'construire loin de tout, sur des champs',
          why: 'Les trajets deviennent plus longs et la ville s’étale.',
        },
        {
          label: 'construire au bord d’une autoroute, sans transport en commun',
          why: 'Les habitants dépendraient de la voiture.',
        },
        {
          label: 'espacer de grandes maisons à la sortie de la ville',
          why: 'La ville s’étend et les distances augmentent.',
        },
      ],
      gap: [
        'Une ville qui protège l’environnement et pense aux habitants de demain vise le développement ',
        '.',
        ['durable'],
      ],
      quote: E_ENERGIE,
      explain: 'Loger près des transports limite l’étalement et l’énergie dépensée pour se déplacer.',
      src: EDUSCOL,
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
      q: 'Quel mot désigne la démarche qui consiste à réfléchir à la ville du futur et aux choix possibles (il commence par « pro ») ?',
      accepted: ['prospective', 'la prospective', 'la prospective territoriale', 'prospective territoriale'],
      traps: [
        { text: 'prospectus', why: 'Un prospectus est un petit document publicitaire.' },
        { text: 'archéologie', why: 'L’archéologie étudie le passé.' },
      ],
      quote: P_PROSPECTIVE,
      explain: 'La prospective imagine les futurs possibles d’un territoire.',
    },
    {
      q: 'Complète : « La ville qui vise le développement durable s’appelle la ville … »',
      accepted: ['durable', 'la ville durable', 'ville durable'],
      traps: [
        {
          text: 'verte',
          why: 'La ville verte met la nature en avant : c’est une autre idée. Ici, la phrase parle de développement durable.',
        },
        {
          text: 'écologique',
          why: '« Écologique » ne reprend pas les mots de la phrase : on parle de la ville durable.',
        },
        { text: 'étalée', why: 'La ville étalée désigne une ville qui s’étend loin.' },
      ],
      quote: E_DURABLE,
      explain: 'Développement durable : ville durable.',
      src: EDUSCOL,
    },
    {
      q: 'Quel adjectif qualifie la ville opposée à la ville étalée, plus resserrée sur elle-même ?',
      accepted: ['compacte', 'la ville compacte', 'ville compacte', 'dense', 'la ville dense', 'ville dense'],
      traps: [
        { text: 'périurbaine', why: 'Périurbain désigne les environs de la ville.' },
        { text: 'dispersée', why: 'Une ville dispersée est le contraire d’une ville resserrée.' },
      ],
      quote: E_COMPACTE,
      explain: 'La ressource oppose la ville étalée à la ville compacte, ou construite en hauteur.',
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
        {
          q: 'Quel problème le premier projet risque-t-il d’aggraver ?',
          a: 'l’énergie dépensée pour les trajets',
          wrong: [
            {
              label: 'la chaleur dans la rue bétonnée du centre',
              why: 'Le premier projet se situe loin du centre, sur des champs.',
            },
            { label: 'le trop grand nombre de stations de tramway', why: 'Ce projet est loin du tramway.' },
            { label: 'le manque de discussion sur les écoles', why: 'Le texte ne parle pas d’écoles.' },
          ],
          quote: E_ENERGIE,
          explain: 'Loin du centre, les trajets sont plus longs et demandent plus d’énergie.',
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
        {
          q: 'D’après le texte, quel élément de la rue peut garder la chaleur ?',
          a: 'le béton',
          wrong: [
            { label: 'les capteurs numériques', why: 'Ils suivent la circulation.' },
            { label: 'le futur parc', why: 'Le parc doit au contraire rafraîchir.' },
            { label: 'les arbres prévus', why: 'Les arbres aident à rafraîchir.' },
          ],
          quote: G_MATERIAUX,
          explain: 'Les matériaux de construction, comme le béton, emmagasinent la chaleur.',
          src: ILOT,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [metropoles, peripheries, mobilites, vocabulaire, villeDemain];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
