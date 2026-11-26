import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { zoneName } from '../cartes.ts';
import { notion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * Quatrième, « Repères de 4e » (lot ge-4e-04) : grandes métropoles (thème 1), flux migratoires (thème 2), routes
 * maritimes (thème 3) et vocabulaire de ces repères. Chaque fait cite une source du registre avec sa citation exacte :
 * Géoconfluences (ENS de Lyon, DGESCO), Nations unies (effectifs des migrants, texte en anglais) et notice de la BnF.
 * La position des zones vient du registre des cartes ; les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const VILLES = 'geoconfluences-villes-mondiales';
const METROPOLE = 'geoconfluences-metropole';
const MEGAPOLES = 'geoconfluences-megapoles';
const MEGALOPOLE = 'geoconfluences-megalopole';
const SHRINK = 'geoconfluences-shrinking-city';
const HUB = 'geoconfluences-hub';
const PORT = 'geoconfluences-port';
const CONURBATION = 'geoconfluences-conurbation';
const SAO_PAULO = 'bnf-sao-paulo';
const ONU = 'un-desa-migrant-stock-2024';
const DIASPORA = 'geoconfluences-diaspora';
const MIGRATIONS = 'geoconfluences-migrations-internationales';
const PPO = 'geoconfluences-passages-strategiques-geopolitique';
const SUEZ = 'geoconfluences-canal-de-suez';
const MER_ROUGE = 'geoconfluences-crise-mer-rouge';
const ARRIERE = 'geoconfluences-arriere-pays';
const CHOKE = 'geoconfluences-passage-strategique';
const INTERFACE = 'geoconfluences-interface';

/** Preuve d’un fait : source du registre, citation exacte, explication et, pour l’anglais ou un tableau, résumé. */
interface Preuve {
  readonly quote: string;
  readonly src: string;
  readonly explain: string;
  readonly montre?: string;
}
const preuve = (src: string, quote: string, explain: string, montre?: string): Preuve => ({
  quote,
  src,
  explain,
  ...(montre ? { montre } : {}),
});
/** Source en anglais (Nations unies) : la première bulle la résume en français. */
const onu = (quote: string, montre: string, explain: string): Preuve =>
  preuve(ONU, quote, explain, `Cherchons ce que disent les Nations unies (texte en anglais) : ${montre}`);

type Paire = [string, string];
const faux = (w: readonly Paire[]) => w.map(([label, why]) => ({ label, why }));

/** Fait cité : question, réponse, erreurs expliquées, texte à trous, preuve. */
const fait = (q: string, a: string, wrong: Paire[], gap: Fait['gap'], p: Preuve): Fait => ({
  q,
  a,
  wrong: faux(wrong),
  gap,
  ...p,
});

const libre = (q: string, accepted: readonly string[], pieges: Paire[], p: Preuve): Libre => ({
  q,
  accepted,
  traps: pieges.map(([text, why]) => ({ text, why })),
  ...p,
});

const question = (q: string, a: string, wrong: Paire[], p: Preuve) => ({ q, a, wrong: faux(wrong), ...p });

/** Écritures d’un mot : avec ou sans article, avec ou sans accent. */
const noms = (nom: string, ...articles: string[]): string[] =>
  [nom, ...articles.map((a) => `${a}${nom}`)].flatMap((n) => [
    ...new Set([n, n.normalize('NFD').replace(/\p{M}/gu, '')]),
  ]);

// ——— Carte : situer un repère sur le planisphère ———

interface Lieu {
  /** Complément de la consigne : « touche … ». */
  readonly cible: string;
  readonly zone: string;
  readonly preuve: Preuve;
}

const CONTINENTS = ['europe', 'asie', 'afrique', 'amerique-nord', 'amerique-sud', 'oceanie'] as const;
const OCEANS = ['atlantique', 'pacifique', 'indien', 'arctique'] as const;
const nomZone = (zone: string) => zoneName('monde', zone) ?? zone;

/**
 * Repère à situer : zone à choisir (niveaux 1 et 2), à toucher (3 et 4) ; le niveau 5 reste sur les textes à lire.
 * `pools` : repères du niveau 3 puis du niveau 4.
 */
const carteReperes =
  (pools: readonly [readonly Lieu[], readonly Lieu[]], zones: readonly string[], hint: string) =>
  (rng: Rng, level: Level): QuestionDraft | undefined => {
    if (level === 5) return undefined;
    const pool = level <= 2 ? [...pools[0], ...pools[1]] : level === 4 ? pools[1] : pools[0];
    const l = rng.pick(pool);
    const autres = rng.shuffle(zones.filter((z) => z !== l.zone));
    const why = (z: string) => `Tu as choisi ${nomZone(z)} : cherche encore ${l.cible}.`;
    const steps = [
      l.preuve.montre ?? `Cherchons ce que dit la source : « ${l.preuve.quote} ».`,
      l.preuve.explain,
      `La réponse est : **${nomZone(l.zone)}**.`,
    ];
    if (level <= 2) {
      return {
        prompt: `${level === 1 ? '' : 'Attention aux pièges ! '}Sur le planisphère, quelle zone faut-il choisir pour situer ${l.cible} ?`,
        figure: { kind: 'map', map: 'monde' },
        ...choice(
          rng,
          nomZone(l.zone),
          autres.slice(0, level === 1 ? 2 : 3).map((z) => ({ label: nomZone(z), why: why(z) })),
        ),
        hint,
        steps,
        targetSeconds: 25,
      };
    }
    const traps: Trap[] = autres.slice(0, 2).map((z) => ({ zone: z, why: why(z) }));
    return {
      prompt: `${level === 3 ? 'Sur le planisphère, touche' : 'Sans aide : touche la zone qui permet de situer'} ${l.cible}.`,
      figure: { kind: 'map', map: 'monde' },
      answer: { kind: 'zone', map: 'monde', zone: l.zone },
      traps,
      hint,
      steps,
      targetSeconds: 30,
    };
  };

const lieu = (cible: string, zone: string, p: Preuve): Lieu => ({ cible, zone, preuve: p });

// ——— Notion 1 : les grandes métropoles ———

const M_MONDIALES = "l'expression renvoie alors aux métropoles capables de commander l'économie mondiale";
const M_DIX = 'Londres 10 2,7 New York 10 3,6 Paris 10 4,9';
const M_DIX_MONTRE =
  'Cherchons ce que montre le tableau de Géoconfluences : sur dix classements de villes mondiales, Londres, New York et Paris sont citées dix fois.';
const M_TOKAIDO =
  'Le terme de mégalopole a ensuite été adopté pour le cœur urbain du Japon, longeant le couloir historique du Tōkaidō';
const M_BOSWASH = "la conurbation s'étendant le long de la côte atlantique de Boston à Washington";
const M_DORSALE = 'Il a été appliqué aux espaces européens allant de Londres à Milan';
const M_GAUTENG =
  'Certains géographes ont également pu qualifier de mégalopole plusieurs autres ensembles urbains : Gauteng sud-africain';
const M_SANSAN = 'ensemble urbain allant de San Francisco à San Diego (SanSan)';
const M_2025 =
  "33 mégapoles (megacities) dépassaient les dix millions d'habitants (dont 19 en Asie, 5 en Amérique latine, 4 en Afrique, 3 en Europe et 2 en Amérique du Nord)";
const M_AFRIQUE =
  'Certaines agglomérations africaines, multimillionnaires, ne possèdent pas forcément de fonctions métropolitaines';
const M_HUBS = 'comme Atlanta en Amérique du Nord, Singapour, ou encore Doubaï';
const M_SHANGHAI = 'Shanghai (premier pour les conteneurs) avec Yangshan';
const M_DETROIT = 'Détroit, Cleveland, Pittsburgh et Buffalo plus de 30 %';
const M_NOTICE = 'São Paulo (São Paulo, Brésil)';

const metropoles: Notion = {
  classe: '4e',
  id: 'g4-reperes-metropoles',
  title: 'Repères : les grandes métropoles',
  hint: 'Demande-toi s’il s’agit d’une ville qui commande, d’un ensemble de villes ou d’un nœud de transport.',
  memo: [
    'Les **villes mondiales** sont les métropoles capables de commander l’économie mondiale : Londres, New York, Paris et Tokyo sont parmi les plus citées. Une **mégapole** compte au moins 10 millions d’habitants : 33 en 2025, dont 19 en Asie, 5 en Amérique latine, 4 en Afrique, 3 en Europe et 2 en Amérique du Nord.',
    'Une **mégalopole** est un vaste réseau de grandes villes : de Boston à Washington, au cœur du Japon (couloir du Tōkaidō) ; de Londres à Milan, on parle plutôt de dorsale européenne.',
    'Autres repères : les **hubs** aériens d’Atlanta, Singapour et Doubaï, le port de Shanghai (premier pour les conteneurs) et Détroit, **ville rétrécissante**.',
  ],
  faits: [
    fait(
      'Que sont les villes mondiales ?',
      'des métropoles capables de commander l’économie mondiale',
      [
        ['les villes les plus anciennes de chaque continent', 'L’ancienneté ne définit pas une ville mondiale.'],
        ['toutes les villes de plus d’un million d’habitants', 'La population seule ne donne pas un tel pouvoir.'],
        ['les capitales de tous les États', 'Toutes les capitales ne commandent pas l’économie mondiale.'],
      ],
      ['Une ville mondiale est une métropole capable de ', ' l’économie mondiale.', ['commander', 'diriger']],
      preuve(VILLES, M_MONDIALES, 'Elles concentrent les pouvoirs centraux des entreprises.'),
    ),
    fait(
      'Sur dix classements de villes mondiales rassemblés par Géoconfluences, quelles villes sont citées dix fois ?',
      'Londres, New York et Paris',
      [
        ['Berlin, Toronto et Sydney', 'Ces trois villes n’y sont citées que trois fois.'],
        ['Shanghai, Los Angeles et Séoul', 'Elles sont citées cinq ou quatre fois seulement.'],
        ['Singapour, Hong Kong et Pékin', 'Elles sont citées huit ou quatre fois, pas dix.'],
      ],
      ['Londres, Paris et New ', ' sont citées dans les dix classements.', ['York']],
      preuve(VILLES, M_DIX, 'Ces trois villes font consensus entre les classements.', M_DIX_MONTRE),
    ),
    fait(
      'Quelle mégalopole s’étend de Boston à Washington ?',
      'la Megalopolis, surnommée BosWash',
      [
        ['le couloir du Tōkaidō', 'Il se trouve au Japon.'],
        ['la dorsale européenne', 'Elle va de Londres à Milan.'],
        ['le Gauteng', 'Le Gauteng se trouve en Afrique du Sud.'],
      ],
      ['La Megalopolis s’étend sur la côte atlantique, de Boston à ', '.', ['Washington']],
      preuve(MEGALOPOLE, M_BOSWASH, 'Le nom BosWash réunit les débuts de Boston et de Washington.'),
    ),
    fait(
      'Dans quel pays la mégalopole du couloir du Tōkaidō se trouve-t-elle ?',
      'au Japon',
      [
        ['en Chine', 'Pour la Chine, on parle plutôt de grandes régions urbaines.'],
        ['aux États-Unis', 'Aux États-Unis, la mégalopole citée va de Boston à Washington.'],
        ['en Afrique du Sud', 'On y cite le Gauteng, pas le Tōkaidō.'],
      ],
      ['Le cœur urbain du ', ' longe le couloir historique du Tōkaidō.', ['Japon']],
      preuve(MEGALOPOLE, M_TOKAIDO, 'C’est la mégalopole japonaise.'),
    ),
    fait(
      'En 2025, combien de mégapoles l’ONU compte-t-elle dans le monde ?',
      '33',
      [
        ['3', 'C’est seulement le nombre de mégapoles d’Europe.'],
        ['19', 'C’est le nombre de mégapoles d’Asie.'],
        ['330', 'C’est dix fois trop.'],
      ],
      ['En 2025, le monde compte ', ' mégapoles.', ['33', 'trente-trois', 'trente trois']],
      preuve(MEGAPOLES, M_2025, 'Chacune dépasse les dix millions d’habitants.'),
    ),
    fait(
      'En 2025, quelle région compte le plus de mégapoles ?',
      'l’Asie',
      [
        ['l’Europe', 'L’Europe en compte 3.'],
        ['l’Afrique', 'L’Afrique en compte 4.'],
        ['l’Amérique latine', 'L’Amérique latine en compte 5.'],
      ],
      ['Sur 33 mégapoles, 19 se trouvent en ', '.', ['Asie']],
      preuve(MEGAPOLES, M_2025, 'L’Asie en compte plus de la moitié.'),
    ),
    fait(
      'Que dit-on de certaines très grandes agglomérations africaines ?',
      'elles n’ont pas forcément des fonctions de métropole',
      [
        ['elles commandent toutes l’économie mondiale', 'Le nombre d’habitants ne suffit pas à commander.'],
        ['elles ne comptent aucun habitant', 'Elles sont au contraire multimillionnaires en habitants.'],
        ['elles sont toutes des villes mondiales', 'La source dit qu’elles n’ont pas forcément ces fonctions.'],
      ],
      [
        'Des agglomérations africaines très peuplées n’ont pas forcément de fonctions ',
        '.',
        ['métropolitaines', 'metropolitaines'],
      ],
      preuve(METROPOLE, M_AFRIQUE, 'La taille ne suffit pas à définir une métropole.'),
    ),
    fait(
      'Quelles villes sont citées comme exemples de très grands hubs aériens ?',
      'Atlanta, Singapour et Doubaï',
      [
        ['Détroit, Cleveland et Buffalo', 'Ces villes sont citées parce qu’elles perdent des habitants.'],
        ['Boston, Washington et Milan', 'Ces villes servent à situer des mégalopoles.'],
        ['Tokyo, Londres et New York', 'Ce sont les trois villes globales d’une analyse ancienne.'],
      ],
      ['Atlanta, Singapour et ', ' sont de grands hubs aériens.', ['Doubaï', 'Dubaï', 'Dubai', 'Doubai']],
      preuve(HUB, M_HUBS, 'Un hub est un nœud où l’on fait des correspondances.'),
    ),
    fait(
      'Quel port est le premier pour les conteneurs ?',
      'Shanghai',
      [
        ['Détroit', 'Détroit est connue pour son déclin industriel.'],
        ['Atlanta', 'Atlanta est citée comme hub aérien.'],
        ['Milan', 'Milan sert à situer la dorsale européenne.'],
      ],
      ['Le port de ', ' est le premier pour les conteneurs.', ['Shanghai', 'Shanghaï', 'Changhaï']],
      preuve(PORT, M_SHANGHAI, 'Les conteneurs sont de grandes boîtes de taille normalisée.'),
    ),
    fait(
      'Qu’est-il arrivé à Détroit entre 1970 et 2000 ?',
      'la ville a perdu plus de 30 % de sa population',
      [
        ['sa population a doublé', 'La ville est au contraire en déclin.'],
        ['elle est devenue le premier port à conteneurs', 'Ce rang est attribué à Shanghai.'],
        ['elle est devenue une ville mondiale en pleine croissance', 'La source la cite parmi les villes en déclin.'],
      ],
      ['Entre 1970 et 2000, Détroit a perdu plus de ', ' % de sa population.', ['30', 'trente']],
      preuve(SHRINK, M_DETROIT, 'C’est un exemple de ville rétrécissante.'),
    ),
  ],
  paires3: [
    ['Boston et Washington', 'la Megalopolis (BosWash)'],
    ['Couloir du Tōkaidō', 'le cœur urbain du Japon'],
    ['De Londres à Milan', 'la dorsale européenne'],
  ],
  paires5: [
    ['Shanghai', 'premier port pour les conteneurs'],
    ['Détroit', 'ville qui a perdu plus de 30 % de ses habitants'],
    ['Atlanta', 'grand hub aérien d’Amérique du Nord'],
    ['De San Francisco à San Diego', 'ensemble surnommé SanSan'],
    ['Londres', 'ville citée dix fois sur dix au meilleur rang moyen'],
  ],
  ordre: ['l’Asie', 'l’Amérique latine', 'l’Afrique', 'l’Europe', 'l’Amérique du Nord'],
  consigne: {
    prompt: 'Range ces régions, de celle qui compte le plus de mégapoles en 2025 à celle qui en compte le moins.',
    hint: 'Une région du monde rassemble à elle seule plus de la moitié des mégapoles.',
    why: 'On range les régions selon leur nombre de mégapoles : 19, 5, 4, 3 puis 2.',
    fin: 'La première est',
    quote: M_2025,
    src: MEGAPOLES,
  },
  libres: [
    libre(
      'quel nom donne-t-on à un vaste réseau de grandes villes, comme celui qui va de Boston à Washington ?',
      [...noms('mégalopole', 'une ', 'la '), 'megalopolis', 'la megalopolis'],
      [
        ['mégapole', 'Une mégapole est une seule ville très peuplée.'],
        ['métropole', 'Une métropole est une ville qui exerce des fonctions de commandement.'],
      ],
      preuve(MEGALOPOLE, M_BOSWASH, 'C’est une mégalopole.'),
    ),
    libre(
      'dans quel pays se trouve la métropole de São Paulo ?',
      [...noms('Brésil', 'le ', 'au ')],
      [
        ['Argentine', 'La notice de la BnF place São Paulo au Brésil.'],
        ['Mexique', 'La notice de la BnF place São Paulo au Brésil.'],
      ],
      preuve(SAO_PAULO, M_NOTICE, 'São Paulo est au Brésil.'),
    ),
    libre(
      'quelle ville des États-Unis, longtemps liée à l’automobile et en déclin, a perdu plus de 30 % de ses habitants entre 1970 et 2000 ? (Elle commence par D.)',
      ['Détroit', 'Detroit'],
      [
        ['Denver', 'La source cite Détroit, Cleveland, Pittsburgh et Buffalo.'],
        ['Dallas', 'La source cite Détroit, Cleveland, Pittsburgh et Buffalo.'],
      ],
      preuve(SHRINK, M_DETROIT, 'C’est Détroit.'),
    ),
    libre(
      'quel port chinois est le premier pour les conteneurs ?',
      ['Shanghai', 'Shanghaï', 'Changhaï', 'le port de Shanghai'],
      [
        ['Pékin', 'La source cite Shanghai pour les conteneurs.'],
        ['Ningbo', 'Ningbo est premier par le tonnage, pas pour les conteneurs.'],
      ],
      preuve(PORT, M_SHANGHAI, 'C’est Shanghai.'),
    ),
    libre(
      'comment appelle-t-on l’ensemble urbain européen allant de Londres à Milan (deux mots) ?',
      [...noms('dorsale européenne', 'la ', 'une ')],
      [
        ['BosWash', 'La BosWash se trouve aux États-Unis.'],
        ['Tōkaidō', 'Le Tōkaidō se trouve au Japon.'],
      ],
      preuve(
        MEGALOPOLE,
        'on parle plutôt désormais de la dorsale européenne',
        'La Manche et les Alpes la coupent : on évite le mot mégalopole.',
      ),
    ),
  ],
  docs: [
    {
      title: 'Un voyage d’affaires',
      lines: [
        'Une dirigeante visite le siège de son entreprise dans une métropole qui commande l’économie mondiale.',
        'Elle voyage ensuite le long de la côte atlantique, de Boston à Washington.',
        'De très grandes villes se succèdent, reliées par de nombreux axes de transport.',
      ],
      qs: [
        question(
          'Quel nom donne-t-on à l’ensemble urbain traversé ?',
          'une mégalopole',
          [
            ['une mégapole', 'Le texte décrit plusieurs villes reliées, pas une seule ville géante.'],
            ['un arrière-pays', 'Un arrière-pays est la zone desservie par un port.'],
          ],
          preuve(MEGALOPOLE, M_BOSWASH, 'La suite de villes de Boston à Washington est la BosWash.'),
        ),
        question(
          'Comment appelle-t-on la métropole où se trouve le siège ?',
          'une ville mondiale',
          [
            ['une ville rétrécissante', 'Le texte décrit au contraire un lieu de commandement.'],
            ['un bidonville', 'Un bidonville est un ensemble d’habitations précaires.'],
          ],
          preuve(VILLES, M_MONDIALES, 'Elle commande l’économie mondiale.'),
        ),
      ],
    },
    {
      title: 'Une ville qui se vide',
      lines: [
        'Dans une ancienne ville industrielle, des usines ont fermé.',
        'Beaucoup d’habitants sont partis et de nombreux logements restent vides.',
        'Les revenus et les emplois diminuent.',
      ],
      qs: [
        question(
          'Quelle expression désigne une ville dans cette situation ?',
          'une ville rétrécissante',
          [
            ['une ville mondiale', 'Une ville mondiale commande l’économie mondiale.'],
            ['une mégalopole', 'Une mégalopole est un vaste réseau de villes.'],
          ],
          preuve(
            SHRINK,
            "démographique, par la perte de population ; économique, par la perte d'activités, de fonctions, de revenus et d'emplois",
            'Le texte réunit perte d’habitants et perte d’activités.',
          ),
        ),
        question(
          'Quel exemple des États-Unis correspond à cette situation ?',
          'Détroit',
          [
            ['Atlanta', 'Atlanta est citée comme grand hub aérien.'],
            ['New York', 'New York est citée parmi les villes mondiales.'],
          ],
          preuve(SHRINK, M_DETROIT, 'Détroit a perdu plus de 30 % de ses habitants entre 1970 et 2000.'),
        ),
      ],
    },
    {
      title: 'Changer d’avion',
      lines: [
        'Un voyageur ne trouve aucun vol direct entre deux villes.',
        'Il passe par un grand aéroport où convergent de nombreuses lignes et change d’appareil.',
        'Cet aéroport se trouve dans la ville d’Atlanta.',
      ],
      qs: [
        question(
          'Comment appelle-t-on ce type d’aéroport ?',
          'un hub',
          [
            ['une conurbation', 'Une conurbation est un ensemble de villes qui se sont rejointes.'],
            ['un avant-pays', 'L’avant-pays désigne les territoires atteints par des lignes.'],
          ],
          preuve(
            HUB,
            'la plateforme de correspondance ou de regroupement des compagnies aériennes',
            'On y change d’avion : c’est un hub.',
          ),
        ),
        question(
          'Sur quel continent se trouve la ville du texte ?',
          'en Amérique du Nord',
          [
            ['en Europe', 'La source place Atlanta en Amérique du Nord.'],
            ['en Asie', 'En Asie, la source cite Singapour et Doubaï.'],
          ],
          preuve(HUB, M_HUBS, 'Atlanta est en Amérique du Nord.'),
        ),
      ],
    },
  ],
  sources: [VILLES, MEGALOPOLE, HUB, PORT, SAO_PAULO],
  carte: carteReperes(
    [
      [
        lieu(
          'la mégalopole qui va de Boston à Washington',
          'amerique-nord',
          preuve(MEGALOPOLE, M_BOSWASH, 'Cette côte atlantique est en Amérique du Nord.'),
        ),
        lieu(
          'la mégalopole du couloir du Tōkaidō (Japon)',
          'asie',
          preuve(MEGALOPOLE, M_TOKAIDO, 'Le Japon est en Asie.'),
        ),
        lieu(
          'la dorsale qui va de Londres à Milan',
          'europe',
          preuve(MEGALOPOLE, M_DORSALE, 'Londres et Milan sont en Europe.'),
        ),
      ],
      [
        lieu(
          'le Gauteng sud-africain',
          'afrique',
          preuve(MEGALOPOLE, M_GAUTENG, 'L’Afrique du Sud est au sud de l’Afrique.'),
        ),
        lieu(
          'la métropole de São Paulo',
          'amerique-sud',
          preuve(
            SAO_PAULO,
            M_NOTICE,
            'Le Brésil est en Amérique du Sud.',
            `La notice de la Bibliothèque nationale de France est « ${M_NOTICE} ».`,
          ),
        ),
        lieu(
          'l’ensemble urbain SanSan, de San Francisco à San Diego',
          'amerique-nord',
          preuve(MEGALOPOLE, M_SANSAN, 'La Californie est en Amérique du Nord.'),
        ),
      ],
    ],
    CONTINENTS,
    'Retrouve d’abord le pays du repère, puis son continent.',
  ),
};

// ——— Notion 2 : les flux migratoires ———

const F_1990 =
  'a figure that has nearly doubled since 1990, when there were an estimated 154 million international migrants globally';
const F_EUROPE = 'Europe hosted more international migrants than any other region with 94 million in 2024';
const F_AMNORD = 'Northern America was home to the second largest number with 61 million';
const F_OCEANIE = 'international migrants comprised 21 per cent of residents';
const F_PAYS =
  'The United States of America hosted more international migrants than any other country in 2024, with 52.4 million. Germany was the second leading destination for international migrants, hosting 16.8 million in 2024, followed by Saudi Arabia (13.7 million), the United Kingdom (11.8 million), France (9.2 million)';
const F_MOITIE =
  'In 2024, nearly half (45 per cent) of all international migrants worldwide were living in their region of origin';
const F_INTRA_EUROPE =
  'Europe had the largest share of intra-regional migration, with 74 per cent of all migrants born in Europe residing in another European country or area';
const F_INTRA_AFRIQUE =
  '64 per cent of all migrants born in sub-Saharan Africa lived in another country or area in the region in 2024';
const F_CORRIDOR =
  '27 million people originating from Latin America and the Caribbean were residing in Northern America';
const F_REFUGIES = 'At the middle of 2024, there were close to 38 million refugees worldwide';
const F_FEMMES = 'In 2024, just under half (48 per cent) of all international migrants worldwide were women or girls';

const MONTRE_PAYS =
  'en 2024, les États-Unis accueillaient 52,4 millions de migrants, l’Allemagne 16,8, l’Arabie saoudite 13,7, le Royaume-Uni 11,8 et la France 9,2 millions.';
const P_PAYS = (explain: string) => onu(F_PAYS, MONTRE_PAYS, explain);

const flux: Notion = {
  classe: '4e',
  id: 'g4-reperes-flux-migratoires',
  title: 'Repères : les flux migratoires',
  hint: 'Distingue la région ou le pays d’accueil, la région de départ et le couloir qui les relie.',
  memo: [
    'En 2024, l’Europe est la région qui accueille le plus de **migrants internationaux** (94 millions), devant l’Amérique du Nord (61 millions). Premier pays d’accueil : les États-Unis (52,4 millions), puis l’Allemagne, l’Arabie saoudite, le Royaume-Uni et la France.',
    'Près de la moitié des migrants (45 %) restent dans leur région d’origine : 74 % pour ceux nés en Europe, 64 % pour ceux nés en Afrique subsaharienne.',
    'Le plus grand **couloir migratoire** entre deux régions va d’Amérique latine et des Caraïbes vers l’Amérique du Nord (27 millions).',
  ],
  faits: [
    fait(
      'Comment le nombre de migrants internationaux a-t-il évolué entre 1990 et 2024 ?',
      'il a presque doublé',
      [
        ['il a été divisé par deux', 'Le nombre a augmenté, il n’a pas diminué.'],
        ['il est resté identique', 'On est passé de 154 à 304 millions.'],
        ['il a été multiplié par dix', 'De 154 à 304 millions, on est loin de dix fois plus.'],
      ],
      ['Entre 1990 et 2024, le nombre de migrants internationaux a presque ', '.', ['doublé', 'double']],
      onu(
        F_1990,
        'le nombre de migrants internationaux a presque doublé depuis 1990, où ils étaient environ 154 millions.',
        'Ils étaient 304 millions en 2024.',
      ),
    ),
    fait(
      'En 2024, quelle région du monde accueille le plus de migrants internationaux ?',
      'l’Europe',
      [
        ['l’Amérique du Nord', 'Elle arrive deuxième, avec 61 millions.'],
        ['l’Océanie', 'L’Océanie a une forte part de migrants, mais un nombre bien plus petit.'],
        ['l’Afrique subsaharienne', 'Elle en accueille beaucoup moins que l’Europe.'],
      ],
      ['En 2024, l’', ' accueille 94 millions de migrants internationaux.', ['Europe']],
      onu(
        F_EUROPE,
        'en 2024, l’Europe accueillait 94 millions de migrants internationaux, plus que toute autre région.',
        'L’Europe est donc en tête des régions d’accueil.',
      ),
    ),
    fait(
      'En 2024, combien de migrants internationaux l’Amérique du Nord accueille-t-elle ?',
      '61 millions',
      [
        ['6 millions', 'C’est dix fois trop peu.'],
        ['94 millions', 'C’est le chiffre de l’Europe.'],
        ['304 millions', 'C’est le total mondial.'],
      ],
      ['En 2024, l’Amérique du Nord accueille ', ' millions de migrants internationaux.', ['61']],
      onu(
        F_AMNORD,
        'l’Amérique du Nord vient en deuxième position avec 61 millions.',
        'Elle est la deuxième région d’accueil.',
      ),
    ),
    fait(
      'En 2024, quel pays accueille le plus de migrants internationaux ?',
      'les États-Unis',
      [
        ['l’Allemagne', 'L’Allemagne est deuxième, avec 16,8 millions.'],
        ['l’Arabie saoudite', 'Elle est troisième, avec 13,7 millions.'],
        ['la France', 'La France est cinquième, avec 9,2 millions.'],
      ],
      ['En 2024, le premier pays d’accueil des migrants est les ', '.', ['États-Unis', 'Etats-Unis']],
      P_PAYS('Les États-Unis sont loin devant les autres pays.'),
    ),
    fait(
      'Quel pays est le deuxième pays d’accueil des migrants internationaux en 2024 ?',
      'l’Allemagne',
      [
        ['le Royaume-Uni', 'Il arrive quatrième.'],
        ['les États-Unis', 'Ils sont premiers.'],
        ['la France', 'La France arrive cinquième.'],
      ],
      ['Après les États-Unis, le deuxième pays d’accueil est l’', '.', ['Allemagne']],
      P_PAYS('L’Allemagne est deuxième, avec 16,8 millions.'),
    ),
    fait(
      'En 2024, quelle part des migrants internationaux vivaient dans leur région d’origine ?',
      'près de la moitié (45 %)',
      [
        ['presque tous (95 %)', 'Plus de la moitié ont changé de région.'],
        ['presque aucun (2 %)', 'Une grande partie reste dans la même région.'],
        ['les trois quarts (74 %)', 'Ce taux concerne les migrants nés en Europe.'],
      ],
      ['Près de la ', ' des migrants internationaux vivaient dans leur région d’origine.', ['moitié', 'moitie']],
      onu(
        F_MOITIE,
        'en 2024, près de la moitié (45 %) des migrants vivaient dans leur région d’origine.',
        'Migrer, ce n’est pas forcément changer de continent.',
      ),
    ),
    fait(
      'Quelle part des migrants nés en Europe vivaient dans un autre pays d’Europe en 2024 ?',
      '74 %',
      [
        ['7 %', 'C’est dix fois trop peu.'],
        ['45 %', 'C’est la moyenne pour l’ensemble des migrants.'],
        ['16 %', 'Ce chiffre mesure la part des migrants dans la population d’Amérique du Nord.'],
      ],
      ['Pour les migrants nés en Europe, ', ' % restent dans un autre pays d’Europe.', ['74']],
      onu(
        F_INTRA_EUROPE,
        'l’Europe a la plus forte part de migrations à l’intérieur de la région : 74 % des migrants nés en Europe vivent dans un autre pays européen.',
        'Les mobilités entre pays européens sont très nombreuses.',
      ),
    ),
    fait(
      'En 2024, où vivaient la plupart des migrants nés en Afrique subsaharienne ?',
      'dans un autre pays de la même région',
      [
        ['presque tous en Europe', '64 % restent en Afrique subsaharienne.'],
        ['presque tous en Amérique du Nord', 'La majorité reste dans la même région.'],
        ['dans leur pays de naissance', 'Un migrant international a changé de pays.'],
      ],
      [
        '64 % des migrants nés en Afrique subsaharienne vivaient dans un autre pays de la même ',
        '.',
        ['région', 'region'],
      ],
      onu(
        F_INTRA_AFRIQUE,
        '64 % des migrants nés en Afrique subsaharienne vivaient dans un autre pays de la région.',
        'Les migrations ne vont pas seulement vers le Nord.',
      ),
    ),
    fait(
      'Quel est le plus grand couloir migratoire entre deux régions du monde ?',
      'd’Amérique latine et des Caraïbes vers l’Amérique du Nord',
      [
        ['d’Europe vers l’Océanie', 'Ce n’est pas le plus grand couloir cité.'],
        ['d’Asie de l’Est vers l’Amérique du Nord', 'Ce couloir compte 12 millions de personnes, moins que 27.'],
        ['d’Afrique du Nord et d’Asie de l’Ouest vers l’Europe', 'Ce couloir compte 13 millions de personnes.'],
      ],
      ['Le plus grand couloir va d’Amérique latine et des Caraïbes vers l’Amérique du ', '.', ['Nord']],
      onu(
        F_CORRIDOR,
        'le plus grand couloir entre régions va d’Amérique latine et des Caraïbes vers l’Amérique du Nord : 27 millions de personnes.',
        'C’est un flux entre deux régions voisines.',
      ),
    ),
    fait(
      'Mi-2024, combien de réfugiés l’ONU comptait-elle environ dans le monde ?',
      '38 millions',
      [
        ['380 000', 'C’est cent fois trop peu.'],
        ['3,8 millions', 'C’est dix fois trop peu.'],
        ['304 millions', 'C’est le nombre de tous les migrants internationaux.'],
      ],
      ['Mi-2024, il y avait près de ', ' millions de réfugiés dans le monde.', ['38']],
      onu(
        F_REFUGIES,
        'au milieu de l’année 2024, on comptait près de 38 millions de réfugiés.',
        'Les réfugiés ne sont qu’une partie des migrants.',
      ),
    ),
    fait(
      'En 2024, quelle part des migrants internationaux sont des femmes ou des filles ?',
      '48 %',
      [
        ['4 %', 'Elles sont près de la moitié.'],
        ['88 %', 'C’est bien plus que la réalité.'],
        ['21 %', 'C’est la part des migrants dans la population d’Océanie.'],
      ],
      ['En 2024, ', ' % des migrants internationaux étaient des femmes ou des filles.', ['48']],
      onu(
        F_FEMMES,
        'en 2024, un peu moins de la moitié (48 %) des migrants étaient des femmes ou des filles.',
        'La migration concerne presque autant les femmes que les hommes.',
      ),
    ),
  ],
  paires3: [
    ['États-Unis', '52,4 millions de migrants'],
    ['Allemagne', '16,8 millions de migrants'],
    ['Arabie saoudite', '13,7 millions de migrants'],
  ],
  paires5: [
    ['Europe', '94 millions de migrants accueillis'],
    ['Amérique du Nord', '61 millions de migrants accueillis'],
    ['Royaume-Uni', '11,8 millions de migrants'],
    ['France', '9,2 millions de migrants'],
    ['Océanie', '21 % de migrants parmi les habitants'],
  ],
  ordre: ['les États-Unis', 'l’Allemagne', 'l’Arabie saoudite', 'le Royaume-Uni', 'la France'],
  consigne: {
    prompt:
      'Range ces pays, de celui qui accueille le plus de migrants internationaux en 2024 à celui qui en accueille le moins.',
    hint: 'Un pays d’Amérique du Nord est loin devant les autres.',
    why: 'On compare les effectifs : 52,4 millions, 16,8, 13,7, 11,8 puis 9,2.',
    fin: 'Le premier est',
    quote: F_PAYS,
    src: ONU,
    montre: `Cherchons ce que disent les Nations unies (texte en anglais) : ${MONTRE_PAYS}`,
  },
  libres: [
    libre(
      'quel pays accueille le plus de migrants internationaux en 2024 ?',
      ['États-Unis', 'les États-Unis', 'Etats-Unis', 'les Etats-Unis', 'USA', 'les USA', 'États-Unis d’Amérique'],
      [
        ['Allemagne', 'L’Allemagne est deuxième.'],
        ['Canada', 'Le Canada est loin derrière les premiers pays.'],
      ],
      P_PAYS('Les États-Unis sont premiers.'),
    ),
    libre(
      'quelle région du monde accueille le plus de migrants internationaux en 2024 ?',
      ['Europe', 'l’Europe'],
      [
        ['Asie', 'La région citée en tête, selon ce découpage de l’ONU, est l’Europe.'],
        ['Amérique du Nord', 'Elle est deuxième.'],
      ],
      onu(F_EUROPE, 'l’Europe accueillait 94 millions de migrants en 2024.', 'C’est la première région d’accueil.'),
    ),
    libre(
      'vers quelle région se dirigent surtout les migrants venus d’Amérique latine dans le plus grand couloir entre régions ?',
      ['Amérique du Nord', 'l’Amérique du Nord', 'Amerique du Nord', 'l’Amerique du Nord'],
      [
        ['Europe', 'Le plus grand couloir entre régions mène vers l’Amérique du Nord.'],
        ['Océanie', 'L’Océanie n’est pas l’arrivée de ce couloir.'],
      ],
      onu(
        F_CORRIDOR,
        '27 millions de personnes venues d’Amérique latine et des Caraïbes vivent en Amérique du Nord.',
        'L’arrivée est l’Amérique du Nord.',
      ),
    ),
    libre(
      'quel est le troisième pays d’accueil de migrants internationaux en 2024 ?',
      ['Arabie saoudite', 'l’Arabie saoudite', 'Arabie Saoudite', 'l’Arabie Saoudite'],
      [
        ['Allemagne', 'L’Allemagne est deuxième.'],
        ['Qatar', 'La source cite l’Arabie saoudite au troisième rang.'],
      ],
      P_PAYS('L’Arabie saoudite est troisième.'),
    ),
    libre(
      'sur 100 migrants nés en Europe, combien vivaient dans un autre pays européen en 2024 ? (Un nombre.)',
      ['74', '74 %', 'soixante-quatorze'],
      [
        ['45', 'C’est la moyenne pour tous les migrants du monde.'],
        ['64', 'C’est le chiffre des migrants nés en Afrique subsaharienne.'],
      ],
      onu(F_INTRA_EUROPE, '74 % des migrants nés en Europe vivent en Europe.', 'La réponse est 74.'),
    ),
  ],
  docs: [
    {
      title: 'Le parcours de K.',
      lines: [
        'K. est né dans un pays d’Afrique subsaharienne.',
        'Il part travailler dans un autre pays d’Afrique subsaharienne et s’y installe.',
        'Il envoie régulièrement de l’argent à sa famille restée au pays.',
      ],
      qs: [
        question(
          'Selon les chiffres de l’ONU, la situation de K. est-elle fréquente parmi les migrants nés dans sa région ?',
          'oui, la majorité d’entre eux restent dans la région',
          [
            ['non, presque tous partent en Europe', '64 % restent en Afrique subsaharienne.'],
            ['non, car ils ne quittent jamais leur pays', 'Le texte et les chiffres parlent de changement de pays.'],
          ],
          onu(
            F_INTRA_AFRIQUE,
            '64 % des migrants nés en Afrique subsaharienne vivaient dans un autre pays de la région.',
            'K. fait comme la majorité.',
          ),
        ),
        question(
          'Comment appelle-t-on l’argent que K. envoie à sa famille ?',
          'des remises',
          [
            ['des impôts', 'Un impôt est payé à un État, pas à sa famille.'],
            ['des redevances', 'Une redevance paie un service, comme un passage de canal.'],
          ],
          preuve(
            MIGRATIONS,
            'remises d’argent (rémitances)',
            'Les remises relient les régions de départ et d’arrivée.',
          ),
        ),
      ],
    },
    {
      title: 'Une carte à compléter',
      lines: [
        'Une élève dessine une grande flèche qui part d’Amérique latine et des Caraïbes.',
        'La flèche représente le plus grand couloir migratoire entre deux régions.',
        'Son épaisseur est la plus forte de la carte.',
      ],
      qs: [
        question(
          'Vers quelle région la pointe de la flèche doit-elle aller ?',
          'vers l’Amérique du Nord',
          [
            ['vers l’Europe', 'Ce n’est pas le plus grand couloir.'],
            ['vers l’Océanie', 'Ce n’est pas l’arrivée de ce couloir.'],
          ],
          onu(
            F_CORRIDOR,
            '27 millions de personnes originaires d’Amérique latine et des Caraïbes vivent en Amérique du Nord.',
            'La flèche pointe vers l’Amérique du Nord.',
          ),
        ),
        question(
          'Pourquoi cette flèche est-elle la plus épaisse ?',
          'parce qu’elle représente le plus grand effectif, 27 millions de personnes',
          [
            ['parce qu’elle est la plus longue', 'L’épaisseur d’une flèche montre une quantité, pas une distance.'],
            ['parce qu’elle traverse l’océan', 'La quantité représentée explique l’épaisseur.'],
          ],
          onu(
            F_CORRIDOR,
            'le couloir compte 27 millions de personnes.',
            'Plus le flux est important, plus la flèche est épaisse.',
          ),
        ),
      ],
    },
    {
      title: 'Deux manières de compter',
      lines: [
        'Un rapport compare le nombre de migrants accueillis et leur part dans la population.',
        'Une région arrive en tête pour le nombre : 94 millions.',
        'Une autre, peu peuplée, arrive en tête pour la part : 21 habitants sur 100 sont des migrants.',
      ],
      qs: [
        question(
          'Quelle région arrive en tête pour le nombre de migrants ?',
          'l’Europe',
          [
            ['l’Océanie', 'L’Océanie est en tête pour la part, pas pour le nombre.'],
            ['l’Afrique subsaharienne', 'Elle compte bien moins de migrants.'],
          ],
          onu(
            F_EUROPE,
            'l’Europe accueillait 94 millions de migrants en 2024.',
            'Le nombre le plus élevé est en Europe.',
          ),
        ),
        question(
          'Quelle région arrive en tête pour la part dans la population ?',
          'l’Océanie',
          [
            ['l’Europe', 'En Europe, la part est de 13 % environ.'],
            ['l’Amérique du Nord', 'En Amérique du Nord, la part est de 16 % environ.'],
          ],
          onu(
            F_OCEANIE,
            'en Océanie, les migrants internationaux représentaient 21 % des habitants.',
            'Peu d’habitants au total, mais une forte part de migrants.',
          ),
        ),
      ],
    },
  ],
  sources: [MIGRATIONS],
  carte: carteReperes(
    [
      [
        lieu(
          'la région qui accueille le plus de migrants internationaux',
          'europe',
          onu(F_EUROPE, 'l’Europe accueillait 94 millions de migrants en 2024.', 'C’est l’Europe.'),
        ),
        lieu(
          'le premier pays d’accueil de migrants, les États-Unis',
          'amerique-nord',
          P_PAYS('Les États-Unis se trouvent en Amérique du Nord.'),
        ),
        lieu(
          'l’Arabie saoudite, troisième pays d’accueil de migrants',
          'asie',
          P_PAYS('L’Arabie saoudite se trouve en Asie, sur la péninsule Arabique.'),
        ),
      ],
      [
        lieu(
          'la région où la part de migrants parmi les habitants est la plus forte',
          'oceanie',
          onu(F_OCEANIE, 'les migrants représentaient 21 % des habitants d’Océanie.', 'C’est l’Océanie.'),
        ),
        lieu(
          'l’arrivée du plus grand couloir migratoire entre deux régions',
          'amerique-nord',
          onu(
            F_CORRIDOR,
            '27 millions de personnes originaires d’Amérique latine et des Caraïbes vivaient en Amérique du Nord.',
            'L’arrivée est en Amérique du Nord.',
          ),
        ),
        lieu(
          'le deuxième pays d’accueil de migrants internationaux',
          'europe',
          P_PAYS('Le deuxième pays est l’Allemagne, en Europe.'),
        ),
      ],
    ],
    CONTINENTS,
    'Retrouve d’abord le pays ou la région citée, puis son continent.',
  ),
};

// ——— Notion 3 : les routes maritimes ———

const R_VOLUME = 'Si environ 80 % du commerce international en volume et 75 % en valeur transitent par bateau';
const R_ROUTE =
  'un espace marin, assez étroit (de quelques km à quelques dizaines de km de large) mais très long, à l’intérieur duquel s’effectuent les liaisons privilégiées entre de grands ensembles continentaux';
const R_FIXENT = 'les détroits et canaux fixent ainsi les grandes routes maritimes';
const R_SUEZ = 'Le canal de Suez, qui relie la Méditerranée au golfe de Suez ouvert sur la mer Rouge';
const R_MER_ROUGE = 'la mer Rouge est fermée au sud par le détroit de Bab-el-Mandeb, et au nord par le canal de Suez';
const R_GIBRALTAR = 'Gibraltar Atlantique / mer Méditerranée';
const R_PANAMA = 'Canal de Panama (écluses), format Néopanamax mer des Caraïbes / océan Pacifique';
const R_ORMUZ = "Ormuz golfe Persique / mer d'Oman";
const R_PDC = 'Pas de Calais Manche / mer du Nord';
const R_MALACCA = 'de par leur position stratégique entre l’océan Indien et la mer de Chine méridionale';
const R_NAVIRES =
  'Avec 80 350 navires en transit en 2023, Malacca affirme sa primauté en polarisant 18,5 % des flux totaux devant le détroit de Taïwan (18 %), viennent ensuite le Pas-de-Calais (64 000, 15 %) et Gibraltar (53 500, 12,3 %)';
const R_SEGMENTS =
  'le segment transpacifique Asie/Amérique du Nord (46 %), le segment Asie/Europe (40 %) et le segment transatlantique Amérique du Nord/Europe (14 %)';
const R_DETOUR =
  'le trajet Asie–Europe par le cap de Bonne Espérance plutôt que par Bab-el-Mandeb et Suez représente un détour de 3 400 milles nautiques';

const tableau = (resume: string) => `Cherchons ce que montre le tableau de Géoconfluences : ${resume}`;
const P_GIBRALTAR = preuve(
  PPO,
  R_GIBRALTAR,
  'Il fait communiquer l’océan Atlantique et la mer Méditerranée.',
  tableau('le détroit de Gibraltar fait communiquer l’Atlantique et la Méditerranée.'),
);
const P_PANAMA = preuve(
  PPO,
  R_PANAMA,
  'Le canal traverse une bande de terre entre la mer des Caraïbes et l’océan Pacifique.',
  tableau('le canal de Panama relie la mer des Caraïbes à l’océan Pacifique.'),
);

const routes: Notion = {
  classe: '4e',
  id: 'g4-reperes-routes-maritimes',
  title: 'Repères : les routes maritimes',
  hint: 'Imagine le trajet du navire : de quelle mer à quelle autre passe-t-il ?',
  memo: [
    'Environ 80 % du commerce international en volume voyage par bateau, sur de longues **routes maritimes**. Les **détroits** et les canaux les fixent : Gibraltar (Atlantique et Méditerranée), Suez (Méditerranée et mer Rouge), Bab-el-Mandeb (mer Rouge et océan Indien), Panama (mer des Caraïbes et Pacifique).',
    'Plus loin : Ormuz (golfe Persique et mer d’Oman), Malacca (océan Indien et mer de Chine méridionale), le Pas de Calais (Manche et mer du Nord). Malacca est le passage le plus fréquenté.',
    'Pour les porte-conteneurs, le plus grand axe est **transpacifique** (46 %), devant Asie-Europe (40 %) et l’Atlantique Nord (14 %). Passer par le cap de Bonne-Espérance au lieu de Suez rallonge le trajet.',
  ],
  faits: [
    fait(
      'Environ quelle part du commerce international en volume passe par bateau ?',
      '80 %',
      [
        ['8 %', 'C’est dix fois trop peu : la mer domine les échanges.'],
        ['20 %', 'La grande majorité des marchandises passe par la mer.'],
        ['100 %', 'Une partie voyage aussi par terre ou par air.'],
      ],
      ['Environ ', ' % du commerce international en volume passe par bateau.', ['80']],
      preuve(PPO, R_VOLUME, 'La mer est la voie principale des échanges.'),
    ),
    fait(
      'Qu’est-ce qui fixe les grandes routes maritimes ?',
      'les détroits et les canaux',
      [
        ['les frontières terrestres', 'Les navires circulent en mer, pas le long des frontières de terre.'],
        ['les chaînes de montagnes', 'Les montagnes ne guident pas les navires en mer.'],
        ['les fuseaux horaires', 'Ils concernent l’heure, pas les trajets.'],
      ],
      ['Les détroits et les ', ' fixent les grandes routes maritimes.', ['canaux']],
      preuve(PPO, R_FIXENT, 'Ce sont des points de passage obligé.'),
    ),
    fait(
      'Quelles mers le canal de Suez relie-t-il ?',
      'la Méditerranée et la mer Rouge',
      [
        ['l’Atlantique et la mer des Caraïbes', 'Ce n’est pas la région du canal de Suez.'],
        ['la Manche et la mer du Nord', 'C’est le Pas de Calais.'],
        ['le golfe Persique et la mer d’Oman', 'C’est le détroit d’Ormuz.'],
      ],
      ['Le canal de Suez relie la Méditerranée à la mer ', '.', ['Rouge']],
      preuve(SUEZ, R_SUEZ, 'Il évite de contourner l’Afrique.'),
    ),
    fait(
      'Quel détroit ferme la mer Rouge au sud ?',
      'le détroit de Bab-el-Mandeb',
      [
        ['le détroit de Gibraltar', 'Gibraltar ouvre la Méditerranée sur l’Atlantique.'],
        ['le détroit d’Ormuz', 'Ormuz se trouve entre golfe Persique et mer d’Oman.'],
        ['le détroit de Malacca', 'Malacca se trouve en Asie du Sud-Est.'],
      ],
      ['Au sud, la mer Rouge est fermée par le détroit de ', '.', ['Bab-el-Mandeb', 'Bab el Mandeb', 'Bab el-Mandeb']],
      preuve(MER_ROUGE, R_MER_ROUGE, 'Au nord, la mer Rouge débouche sur le canal de Suez.'),
    ),
    fait(
      'Quels espaces le détroit de Gibraltar fait-il communiquer ?',
      'l’Atlantique et la mer Méditerranée',
      [
        ['la mer Rouge et l’océan Indien', 'C’est Bab-el-Mandeb.'],
        ['la Manche et la mer du Nord', 'C’est le Pas de Calais.'],
        ['la mer Noire et la mer Égée', 'Ce sont les détroits turcs.'],
      ],
      ['Le détroit de Gibraltar relie l’Atlantique à la mer ', '.', ['Méditerranée', 'Mediterranee']],
      P_GIBRALTAR,
    ),
    fait(
      'Quels espaces le canal de Panama relie-t-il ?',
      'la mer des Caraïbes et l’océan Pacifique',
      [
        ['la mer Rouge et la Méditerranée', 'C’est le canal de Suez.'],
        ['l’océan Indien et la mer de Chine méridionale', 'C’est le détroit de Malacca.'],
        ['la Baltique et la mer du Nord', 'Cela concerne d’autres passages, en Europe du Nord.'],
      ],
      ['Le canal de Panama relie la mer des Caraïbes à l’océan ', '.', ['Pacifique']],
      P_PANAMA,
    ),
    fait(
      'Où se trouve le détroit d’Ormuz ?',
      'entre le golfe Persique et la mer d’Oman',
      [
        ['entre la Manche et la mer du Nord', 'C’est le Pas de Calais.'],
        ['entre l’Atlantique et la Méditerranée', 'C’est Gibraltar.'],
        ['entre la mer Rouge et la Méditerranée', 'C’est le canal de Suez.'],
      ],
      ['Le détroit d’Ormuz est entre le golfe ', ' et la mer d’Oman.', ['Persique']],
      preuve(
        PPO,
        R_ORMUZ,
        'C’est la porte du golfe Persique.',
        tableau('le détroit d’Ormuz se trouve entre le golfe Persique et la mer d’Oman.'),
      ),
    ),
    fait(
      'Le détroit de Malacca se trouve entre quels espaces maritimes ?',
      'l’océan Indien et la mer de Chine méridionale',
      [
        ['l’océan Atlantique et la Méditerranée', 'C’est Gibraltar.'],
        ['la mer des Caraïbes et le Pacifique', 'C’est le canal de Panama.'],
        ['la mer Rouge et la Méditerranée', 'C’est le canal de Suez.'],
      ],
      ['Le détroit de Malacca relie l’océan ', ' à la mer de Chine méridionale.', ['Indien']],
      preuve(PPO, R_MALACCA, 'C’est un passage clé de l’Asie du Sud-Est.'),
    ),
    fait(
      'En 2023, quel passage voit transiter le plus de navires ?',
      'le détroit de Malacca',
      [
        ['le détroit de Gibraltar', 'Gibraltar vient après, avec 53 500 navires.'],
        ['le Pas de Calais', 'Le Pas de Calais compte 64 000 navires.'],
        ['le détroit de Magellan', 'Magellan est marginal, avec 1 600 navires.'],
      ],
      ['En 2023, le détroit le plus fréquenté est celui de ', '.', ['Malacca']],
      preuve(PPO, R_NAVIRES, 'Malacca concentre 18,5 % des flux.'),
    ),
    fait(
      'Quel est le premier grand segment du transport par porte-conteneurs ?',
      'le segment transpacifique, entre l’Asie et l’Amérique du Nord',
      [
        ['le segment transatlantique, entre l’Amérique du Nord et l’Europe', 'Il ne pèse que 14 %.'],
        ['le segment Asie-Europe', 'Il arrive deuxième, avec 40 %.'],
        ['le segment entre l’Antarctique et l’Arctique', 'Il n’existe pas de grand segment de ce type.'],
      ],
      ['Le premier segment, Asie-Amérique du Nord, est appelé ', '.', ['transpacifique']],
      preuve(PPO, R_SEGMENTS, 'Il représente 46 % du trafic.'),
    ),
    fait(
      'Pour aller d’Asie en Europe, que représente le passage par le cap de Bonne-Espérance au lieu de Suez ?',
      'un détour de plusieurs milliers de milles marins',
      [
        ['un raccourci très net', 'Contourner l’Afrique allonge le trajet.'],
        ['un trajet exactement identique', 'La source parle d’un détour.'],
        ['un passage par le canal de Panama', 'Le cap de Bonne-Espérance est au sud de l’Afrique.'],
      ],
      ['Passer par le cap de Bonne-Espérance au lieu de Suez représente un ', '.', ['détour', 'detour']],
      preuve(PPO, R_DETOUR, 'Un détour coûte du temps et du carburant.'),
    ),
  ],
  paires3: [
    ['Canal de Suez', 'Méditerranée et mer Rouge'],
    ['Canal de Panama', 'mer des Caraïbes et Pacifique'],
    ['Détroit de Gibraltar', 'Atlantique et Méditerranée'],
  ],
  paires5: [
    ['Détroit d’Ormuz', 'golfe Persique et mer d’Oman'],
    ['Détroit de Malacca', 'océan Indien et mer de Chine méridionale'],
    ['Détroit de Bab-el-Mandeb', 'sud de la mer Rouge'],
    ['Pas de Calais', 'Manche et mer du Nord'],
    ['Segment transpacifique', 'Asie et Amérique du Nord'],
  ],
  ordre: ['le détroit de Malacca', 'le détroit de Taïwan', 'le Pas de Calais', 'le détroit de Gibraltar'],
  consigne: {
    prompt: 'Range ces détroits, du plus fréquenté au moins fréquenté en 2023.',
    hint: 'Le premier est en Asie du Sud-Est.',
    why: 'On compare les parts des flux : 18,5 %, 18 %, 15 % puis 12,3 %.',
    fin: 'Le plus fréquenté est',
    quote: R_NAVIRES,
    src: PPO,
  },
  libres: [
    libre(
      'quel canal relie la mer Méditerranée à la mer Rouge ?',
      [...noms('canal de Suez', 'le '), 'Suez'],
      [
        ['canal de Panama', 'Le canal de Panama se trouve en Amérique.'],
        ['Gibraltar', 'Gibraltar est un détroit entre l’Atlantique et la Méditerranée.'],
      ],
      preuve(SUEZ, R_SUEZ, 'C’est le canal de Suez.'),
    ),
    libre(
      'quel canal permet de passer de la mer des Caraïbes à l’océan Pacifique ?',
      [...noms('canal de Panama', 'le '), 'Panama', 'canal de Panamá'],
      [
        ['canal de Suez', 'Suez relie la Méditerranée à la mer Rouge.'],
        ['Ormuz', 'Ormuz est un détroit près du golfe Persique.'],
      ],
      P_PANAMA,
    ),
    libre(
      'quel détroit fait communiquer le golfe Persique et la mer d’Oman ?',
      ['Ormuz', 'détroit d’Ormuz', 'le détroit d’Ormuz', 'detroit d’Ormuz'],
      [
        ['Malacca', 'Malacca est entre l’océan Indien et la mer de Chine méridionale.'],
        ['Bab-el-Mandeb', 'Bab-el-Mandeb ferme la mer Rouge au sud.'],
      ],
      preuve(PPO, R_ORMUZ, 'C’est le détroit d’Ormuz.', tableau('Ormuz sépare le golfe Persique de la mer d’Oman.')),
    ),
    libre(
      'quel passage entre la Manche et la mer du Nord est cité parmi les plus fréquentés du monde ?',
      ['Pas de Calais', 'le Pas de Calais', 'Pas-de-Calais', 'le Pas-de-Calais', 'détroit du Pas de Calais'],
      [
        ['Gibraltar', 'Gibraltar est entre l’Atlantique et la Méditerranée.'],
        ['Øresund', 'L’Øresund relie la mer Baltique à la mer du Nord.'],
      ],
      preuve(PPO, R_PDC, 'C’est le Pas de Calais.', tableau('le Pas de Calais relie la Manche à la mer du Nord.')),
    ),
    libre(
      'quel cap d’Afrique contourne-t-on quand on évite le canal de Suez ?',
      [
        'cap de Bonne-Espérance',
        'le cap de Bonne-Espérance',
        'cap de Bonne Espérance',
        'le cap de Bonne Espérance',
        'cap de Bonne-Esperance',
        'cap de Bonne Esperance',
        'Bonne-Espérance',
      ],
      [
        ['cap Horn', 'Le cap Horn se trouve au sud de l’Amérique.'],
        ['détroit de Gibraltar', 'Un détroit n’est pas un cap.'],
      ],
      preuve(PPO, R_DETOUR, 'C’est le cap de Bonne-Espérance.'),
    ),
  ],
  docs: [
    {
      title: 'Un porte-conteneurs vers l’Europe',
      lines: [
        'Un navire quitte l’Asie, traverse l’océan Indien et remonte la mer Rouge.',
        'Il franchit ensuite un long canal artificiel.',
        'Il entre alors dans la mer Méditerranée.',
      ],
      qs: [
        question(
          'Quel est ce canal ?',
          'le canal de Suez',
          [
            ['le canal de Panama', 'Panama relie la mer des Caraïbes au Pacifique.'],
            ['le Pas de Calais', 'C’est un détroit entre la Manche et la mer du Nord.'],
          ],
          preuve(SUEZ, R_SUEZ, 'Le canal de Suez relie la mer Rouge à la Méditerranée.'),
        ),
        question(
          'Par quel détroit est-il entré dans la mer Rouge, au sud ?',
          'le détroit de Bab-el-Mandeb',
          [
            ['le détroit de Gibraltar', 'Gibraltar ouvre sur l’Atlantique.'],
            ['le détroit d’Ormuz', 'Ormuz ouvre le golfe Persique.'],
          ],
          preuve(MER_ROUGE, R_MER_ROUGE, 'La mer Rouge est fermée au sud par Bab-el-Mandeb.'),
        ),
      ],
    },
    {
      title: 'Un passage fermé',
      lines: [
        'Un grand passage entre la Méditerranée et la mer Rouge est fermé quelques jours.',
        'Des armateurs envisagent de contourner l’Afrique par le sud.',
        'Les marchandises arriveront plus tard en Europe.',
      ],
      qs: [
        question(
          'Pourquoi les marchandises arriveront-elles plus tard ?',
          'le contournement par le cap de Bonne-Espérance est un détour',
          [
            ['les navires voyageront par avion', 'Les navires restent en mer.'],
            ['le canal de Panama est plus long à traverser', 'La route décrite contourne l’Afrique.'],
          ],
          preuve(PPO, R_DETOUR, 'Le trajet par le sud de l’Afrique est plus long.'),
        ),
        question(
          'Comment appelle-t-on les lieux de passage obligé dont la fermeture gêne le monde entier ?',
          'des passages stratégiques',
          [
            ['des arrière-pays', 'Un arrière-pays est la zone desservie par un port.'],
            ['des conurbations', 'Une conurbation est un ensemble de villes.'],
          ],
          preuve(
            CHOKE,
            'Un point de passage obligé, en anglais « choke point » est un passage stratégique',
            'Ces détroits et canaux sont des passages stratégiques.',
          ),
        ),
      ],
    },
    {
      title: 'Trois routes, trois trafics',
      lines: [
        'Un schéma montre les trois grandes liaisons des porte-conteneurs.',
        'La première relie l’Asie à l’Amérique du Nord, la deuxième l’Asie à l’Europe.',
        'La troisième relie l’Amérique du Nord à l’Europe.',
      ],
      qs: [
        question(
          'Quel océan la première liaison traverse-t-elle ?',
          'l’océan Pacifique',
          [
            ['l’océan Atlantique', 'L’Atlantique sépare l’Amérique de l’Europe.'],
            ['l’océan Arctique', 'La liaison est dite transpacifique.'],
          ],
          preuve(PPO, R_SEGMENTS, 'C’est le segment transpacifique.'),
        ),
        question(
          'Laquelle des trois liaisons a le trafic le plus faible ?',
          'la liaison Amérique du Nord-Europe',
          [
            ['la liaison Asie-Amérique du Nord', 'Elle est la première, avec 46 %.'],
            ['la liaison Asie-Europe', 'Elle est deuxième, avec 40 %.'],
          ],
          preuve(PPO, R_SEGMENTS, 'Le segment transatlantique pèse 14 %.'),
        ),
      ],
    },
  ],
  sources: [PPO, SUEZ, MER_ROUGE],
  carte: carteReperes(
    [
      [
        lieu(
          'le plus grand axe des porte-conteneurs entre l’Asie et l’Amérique du Nord',
          'pacifique',
          preuve(PPO, R_SEGMENTS, 'Cet axe transpacifique traverse l’océan Pacifique.'),
        ),
        lieu(
          'la liaison des porte-conteneurs entre l’Amérique du Nord et l’Europe',
          'atlantique',
          preuve(PPO, R_SEGMENTS, 'Cette liaison transatlantique traverse l’océan Atlantique.'),
        ),
        lieu(
          'l’océan que le détroit de Malacca relie à la mer de Chine méridionale',
          'indien',
          preuve(PPO, R_MALACCA, 'C’est l’océan Indien.'),
        ),
      ],
      [
        lieu('l’océan auquel le canal de Panama donne accès depuis la mer des Caraïbes', 'pacifique', P_PANAMA),
        lieu('l’océan que le détroit de Gibraltar relie à la mer Méditerranée', 'atlantique', P_GIBRALTAR),
        lieu(
          'l’océan sur lequel débouche la mer Rouge par Bab-el-Mandeb',
          'indien',
          preuve(
            PPO,
            'Bab-el-Mandeb mer Rouge / océan Indien',
            'C’est l’océan Indien.',
            tableau('le détroit de Bab-el-Mandeb relie la mer Rouge à l’océan Indien.'),
          ),
        ),
      ],
    ],
    OCEANS,
    'Retrouve les deux espaces reliés, puis repère l’océan sur le planisphère.',
  ),
};

// ——— Notion 4 : le vocabulaire des repères de 4e ———

const V_ROUTE = R_ROUTE;
const V_CHOKE = 'Un point de passage obligé, en anglais « choke point » est un passage stratégique';
const V_ARRIERE = "L'arrière-pays (hinterland) est l'aire d'attraction et de desserte continentale d'un port";
const V_AVANT =
  "L'avant-pays (foreland) désigne l'ensemble des pays territoires desservis par les lignes ou dessertes régulières qui touchent un port ou un aéroport";
const V_HUB = "des ports qui servent de centre d'éclatement pour le transport des marchandises";
const V_CONURBATION =
  'Le terme de conurbation désigne un ensemble de villes devenues coalescentes par extension de leurs périphéries';
const V_MEGAPOLE = "des populations égales ou supérieures à 10 millions d'habitants";
const V_MEGALOPOLE =
  "Une mégalopole est un réseau de villes à vaste échelle, intégrant des villes multimillionnaires reliées par un tissu dense d'axes de transport";
const V_DIASPORA = "indique la dispersion d'une population";
const V_MIGRANT = 'a person must have moved across an international border and changed his or her country of residence';
const V_INTERFACE =
  'Une interface est une bande de contact entre deux espaces de nature différente, engendrant des échanges entre ces deux espaces';
const V_REMISES = 'remises d’argent (rémitances)';

const vocabulaire: Notion = {
  classe: '4e',
  id: 'g4-reperes-vocabulaire',
  title: 'Le vocabulaire des repères de 4e',
  hint: 'Cherche le mot-clé : une ville, une population qui se déplace, un port ou une route en mer ?',
  memo: [
    'Villes : une **mégapole** compte au moins 10 millions d’habitants ; une **conurbation** réunit des villes qui se sont rejointes ; une **mégalopole** est un réseau de villes encore plus vaste.',
    'Mer : une **route maritime** relie de grands ensembles ; un **passage stratégique** est un point obligé. Un port a un **arrière-pays** (sur terre) et un **avant-pays** (au-delà des mers) ; c’est une **interface** entre les deux. Un **hub** maritime redistribue les marchandises.',
    'Migrations : un migrant international a franchi une frontière et changé de pays de résidence ; une **diaspora** est une population dispersée ; les **remises** sont l’argent envoyé au pays.',
  ],
  faits: [
    fait(
      'Qu’est-ce qu’une route maritime ?',
      'un espace de mer étroit et très long qui relie de grands ensembles continentaux',
      [
        ['une route goudronnée qui longe la côte', 'Il s’agit d’un trajet sur la mer.'],
        ['une zone où aucun navire ne passe', 'C’est au contraire un trajet privilégié des navires.'],
        ['la frontière entre deux ports', 'Une frontière n’est pas un trajet.'],
      ],
      ['Un espace marin long qui relie de grands ensembles continentaux est une route ', '.', ['maritime']],
      preuve(PPO, V_ROUTE, 'Les navires y passent de préférence.'),
    ),
    fait(
      'Qu’est-ce qu’un « choke point » ?',
      'un passage stratégique, point obligé du transport maritime',
      [
        ['un port de plaisance', 'Un choke point est un lieu de passage étroit.'],
        ['une grande gare', 'Le terme concerne ici la mer.'],
        ['un hub aérien', 'Il s’agit d’un passage maritime, pas d’un aéroport.'],
      ],
      ['En anglais, un passage stratégique est un choke ', '.', ['point']],
      preuve(CHOKE, V_CHOKE, 'C’est un goulet que les navires doivent emprunter.'),
    ),
    fait(
      'Qu’appelle-t-on l’arrière-pays d’un port ?',
      'l’aire que le port dessert à l’intérieur du continent',
      [
        ['les pays atteints par les lignes maritimes', 'C’est l’avant-pays.'],
        ['les fonds marins sous le port', 'L’arrière-pays est sur le continent.'],
        ['la partie du port réservée aux bateaux de plaisance', 'Le terme désigne un territoire desservi.'],
      ],
      ['L’aire continentale que dessert un port est son ', '.', ['arrière-pays', 'arriere-pays', 'hinterland']],
      preuve(ARRIERE, V_ARRIERE, 'Les marchandises y sont acheminées par la terre.'),
    ),
    fait(
      'Qu’appelle-t-on l’avant-pays d’un port ?',
      'les territoires atteints par les lignes régulières qui y passent',
      [
        ['les quartiers situés devant le port', 'Le terme désigne des territoires lointains desservis par les lignes.'],
        ['les terres agricoles proches', 'Il ne s’agit pas de l’intérieur des terres.'],
        ['la zone desservie par camion', 'La zone desservie sur le continent est l’arrière-pays.'],
      ],
      ['Les territoires desservis par les lignes d’un port forment son ', '.', ['avant-pays', 'foreland']],
      preuve(ARRIERE, V_AVANT, 'On y arrive par la mer ou par les airs.'),
    ),
    fait(
      'Qu’est-ce qu’un port qui sert de hub maritime ?',
      'un port qui redistribue les marchandises vers d’autres ports',
      [
        ['un port réservé aux bateaux de pêche', 'Un hub redistribue des marchandises, souvent en conteneurs.'],
        ['un port abandonné', 'Un hub est au contraire très actif.'],
        ['un port loin de toute route maritime', 'Les hubs maritimes sont sur les grandes routes.'],
      ],
      ['Un port pivot qui sert de centre d’éclatement est un ', ' maritime.', ['hub']],
      preuve(HUB, V_HUB, 'Les conteneurs y changent de navire.'),
    ),
    fait(
      'Comment appelle-t-on un ensemble de villes qui se sont rejointes en s’étendant ?',
      'une conurbation',
      [
        ['une mégapole', 'La mégapole se définit par le nombre d’habitants d’une agglomération.'],
        ['une diaspora', 'La diaspora concerne la dispersion d’une population.'],
        ['un arrière-pays', 'L’arrière-pays est la zone desservie par un port.'],
      ],
      ['Des villes rejointes par leurs périphéries forment une ', '.', ['conurbation']],
      preuve(CONURBATION, V_CONURBATION, 'Les périphéries se touchent.'),
    ),
    fait(
      'À partir de quelle taille parle-t-on de mégapole selon l’ONU ?',
      'au moins 10 millions d’habitants',
      [
        ['au moins 100 000 habitants', 'C’est bien trop peu.'],
        ['au moins 1 million d’habitants', 'Le seuil de l’ONU est dix fois plus élevé.'],
        ['au moins 100 millions d’habitants', 'C’est dix fois trop.'],
      ],
      ['Selon l’ONU, une mégapole compte au moins ', ' millions d’habitants.', ['10', 'dix']],
      preuve(MEGAPOLES, V_MEGAPOLE, 'Ce seuil vient de l’ONU.'),
    ),
    fait(
      'Qu’est-ce qui distingue une mégalopole ?',
      'un vaste réseau de grandes villes reliées par de nombreux axes',
      [
        ['une seule ville très peuplée', 'C’est le cas d’une mégapole.'],
        ['un seul port très actif', 'La mégalopole réunit plusieurs villes.'],
        ['un village isolé', 'La mégalopole est un ensemble très vaste.'],
      ],
      ['Une ', ' est un vaste réseau de villes reliées par de nombreux axes.', ['mégalopole', 'megalopole']],
      preuve(MEGALOPOLE, V_MEGALOPOLE, 'Elle réunit plusieurs grandes villes.'),
    ),
    fait(
      'Que désigne le mot « diaspora » ?',
      'une population dispersée',
      [
        ['un groupe de touristes en voyage', 'Une diaspora est une population installée ailleurs.'],
        ['un port à conteneurs', 'La diaspora concerne des personnes.'],
        ['un canal entre deux mers', 'Le mot désigne une dispersion de personnes.'],
      ],
      ['La dispersion d’une population dans plusieurs pays forme une ', '.', ['diaspora']],
      preuve(DIASPORA, V_DIASPORA, 'Le mot vient d’un verbe grec qui signifie semer.'),
    ),
    fait(
      'Selon l’ONU, qu’est-ce qu’un migrant international ?',
      'une personne qui a franchi une frontière et changé de pays de résidence',
      [
        [
          'une personne qui visite un pays le temps d’un week-end',
          'Un séjour bref n’est pas un changement de résidence.',
        ],
        ['une personne qui change de quartier', 'Il faut franchir une frontière.'],
        ['une personne qui vit toujours dans sa ville natale', 'Elle n’a pas changé de pays.'],
      ],
      ['Un migrant international a franchi une ', ' et changé de pays de résidence.', ['frontière', 'frontiere']],
      onu(
        V_MIGRANT,
        'pour compter un migrant international, la personne doit avoir franchi une frontière et changé de pays de résidence.',
        'La frontière et le changement de résidence sont les deux conditions.',
      ),
    ),
    fait(
      'Comment appelle-t-on une bande de contact entre deux espaces différents qui échangent ?',
      'une interface',
      [
        ['une conurbation', 'La conurbation est un ensemble de villes.'],
        ['une diaspora', 'La diaspora concerne la dispersion d’une population.'],
        ['un cap', 'Un cap est une avancée de terre dans la mer.'],
      ],
      ['Une bande de contact avec des échanges entre deux espaces est une ', '.', ['interface']],
      preuve(INTERFACE, V_INTERFACE, 'Un littoral avec des ports en est un exemple.'),
    ),
  ],
  paires3: [
    ['Mégapole', 'au moins 10 millions d’habitants'],
    ['Diaspora', 'population dispersée'],
    ['Arrière-pays', 'zone desservie sur le continent'],
  ],
  paires5: [
    ['Avant-pays', 'territoires atteints par les lignes du port'],
    ['Conurbation', 'villes rejointes par leurs périphéries'],
    ['Interface', 'bande de contact entre deux espaces'],
    ['Passage stratégique', 'point obligé du transport maritime'],
    ['Remises', 'argent envoyé vers la région de départ'],
  ],
  libres: [
    libre(
      'comment s’appelle la zone qu’un port dessert à l’intérieur du continent ?',
      [...noms('arrière-pays', 'l’', 'un '), 'hinterland', 'l’hinterland', 'arrière pays', 'arriere pays'],
      [
        ['avant-pays', 'L’avant-pays est l’ensemble des territoires atteints par les lignes.'],
        ['interface', 'L’interface est la bande de contact elle-même.'],
      ],
      preuve(ARRIERE, V_ARRIERE, 'C’est l’arrière-pays, ou hinterland.'),
    ),
    libre(
      'comment s’appellent les territoires atteints par les lignes régulières qui touchent un port ?',
      [...noms('avant-pays', 'l’', 'un '), 'foreland', 'avant pays'],
      [
        ['arrière-pays', 'L’arrière-pays est la zone desservie sur le continent.'],
        ['conurbation', 'La conurbation est un ensemble de villes.'],
      ],
      preuve(ARRIERE, V_AVANT, 'C’est l’avant-pays, ou foreland.'),
    ),
    libre(
      'quel mot désigne la dispersion d’une population dans plusieurs pays ?',
      noms('diaspora', 'la ', 'une '),
      [
        ['migration', 'La migration est le changement de domicile ; ici on décrit une dispersion durable.'],
        ['exode rural', 'L’exode rural est le départ des campagnes vers les villes.'],
      ],
      preuve(DIASPORA, V_DIASPORA, 'C’est la diaspora.'),
    ),
    libre(
      'comment appelle-t-on l’argent que des migrants envoient vers leur région de départ ?',
      [
        'remises',
        'les remises',
        'des remises',
        'une remise',
        'remise',
        'remises d’argent',
        'rémitances',
        'les rémitances',
        'transferts de fonds',
        'transfert de fonds',
        'transferts d’argent',
        'transfert d’argent',
      ],
      [
        ['impôts', 'Un impôt est versé à un État.'],
        ['salaires', 'Le salaire est l’argent gagné ; on demande l’argent envoyé.'],
      ],
      preuve(MIGRATIONS, V_REMISES, 'Ce sont les remises.'),
    ),
    libre(
      'quel nom donne-t-on à un vaste réseau de grandes villes reliées par de nombreux axes de transport ?',
      noms('mégalopole', 'la ', 'une '),
      [
        ['mégapole', 'La mégapole est une seule agglomération très peuplée.'],
        ['métropole', 'La métropole est une ville qui commande.'],
      ],
      preuve(MEGALOPOLE, V_MEGALOPOLE, 'C’est une mégalopole.'),
    ),
  ],
  docs: [
    {
      title: 'Le port de Lorvan',
      lines: [
        'Le port imaginaire de Lorvan reçoit des navires venus de nombreux pays lointains.',
        'Des trains et des camions portent ensuite les marchandises vers des villes de l’intérieur.',
        'Le port est au contact de la mer et de la terre.',
      ],
      qs: [
        question(
          'Comment appelle-t-on les villes de l’intérieur desservies par Lorvan ?',
          'son arrière-pays',
          [
            ['son avant-pays', 'L’avant-pays est atteint par les lignes maritimes.'],
            ['sa diaspora', 'La diaspora concerne des personnes dispersées.'],
          ],
          preuve(ARRIERE, V_ARRIERE, 'Les villes de l’intérieur forment l’aire de desserte continentale.'),
        ),
        question(
          'Quel mot décrit le contact entre la mer et la terre, avec des échanges ?',
          'une interface',
          [
            ['une conurbation', 'La conurbation réunit des villes.'],
            ['un détroit', 'Un détroit est un passage de mer étroit.'],
          ],
          preuve(INTERFACE, V_INTERFACE, 'La mer et la terre échangent par le port.'),
        ),
      ],
    },
    {
      title: 'Des familles dispersées',
      lines: [
        'Des familles d’un pays imaginaire vivent dans plusieurs pays.',
        'Elles restent en lien entre elles et avec leur région d’origine.',
        'Chaque mois, certaines y envoient de l’argent.',
      ],
      qs: [
        question(
          'Quel mot désigne ces familles dispersées qui gardent des liens ?',
          'une diaspora',
          [
            ['une mégalopole', 'La mégalopole est un réseau de villes.'],
            ['un hub', 'Un hub est un nœud de transport.'],
          ],
          preuve(
            DIASPORA,
            'Des groupes dispersés qui conservent et développent entre eux et avec la société d’origine',
            'Dispersion et liens : c’est une diaspora.',
          ),
        ),
        question(
          'Comment appelle-t-on l’argent envoyé chaque mois ?',
          'les remises',
          [
            ['les impôts', 'Un impôt est versé à un État.'],
            ['les redevances', 'Une redevance paie un droit de passage ou un service.'],
          ],
          preuve(MIGRATIONS, V_REMISES, 'Ce sont les remises.'),
        ),
      ],
    },
    {
      title: 'Les villes qui grandissent',
      lines: [
        'Deux villes voisines s’étendent chaque année.',
        'Leurs périphéries finissent par se toucher : elles forment un seul ensemble bâti.',
        'Chacune garde une partie des fonctions.',
      ],
      qs: [
        question(
          'Quel terme désigne cet ensemble ?',
          'une conurbation',
          [
            ['une route maritime', 'Une route maritime est un trajet en mer.'],
            ['un avant-pays', 'L’avant-pays concerne un port.'],
          ],
          preuve(CONURBATION, V_CONURBATION, 'Les périphéries se rejoignent : conurbation.'),
        ),
        question(
          'À quel ensemble plus vaste pourrait-elle appartenir si elle était reliée à d’autres grandes villes ?',
          'une mégalopole',
          [
            ['une diaspora', 'La diaspora concerne des personnes dispersées.'],
            ['un détroit', 'Un détroit est un passage de mer.'],
          ],
          preuve(MEGALOPOLE, V_MEGALOPOLE, 'La mégalopole est un réseau de villes plus vaste.'),
        ),
      ],
    },
  ],
  sources: [PPO],
};

export const NOTIONS: readonly Notion[] = [metropoles, flux, routes, vocabulaire];
export const SKILLS: readonly Skill[] = NOTIONS.map(notion);
