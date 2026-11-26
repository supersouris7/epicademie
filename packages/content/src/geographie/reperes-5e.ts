import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { zoneName } from '../cartes.ts';
import { notion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * Cinquième, « Repères de 5e » (lot ge-5e-04) : lire les cartes, situer les grands foyers de population et les
 * ressources des thèmes 1 à 3, maîtriser le vocabulaire. Chaque fait cite une source du registre avec sa citation
 * exacte (programme du cycle 4, glossaire de Géoconfluences). La position des zones vient du registre des cartes ;
 * les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const CARTE = 'geoconfluences-carte-croquis-schema';
const FIGURE = 'geoconfluences-figure';
const PROJECTION = 'geoconfluences-projection';
const ECHELLE = 'geoconfluences-echelle';
const CENTRAGE = 'geoconfluences-centrage';
const CHOROPLETHE = 'geoconfluences-choroplethe';
const EQUATEUR = 'geoconfluences-equateur';
const COORDONNEES = 'geoconfluences-coordonnees';
const ORIENTATION = 'geoconfluences-orientation';
const FOYER = 'geoconfluences-foyer-de-peuplement';
const PETROLE = 'geoconfluences-petrole';
const CHARBON = 'geoconfluences-charbon';
const OPEP = 'geoconfluences-opep';
const RESERVES = 'geoconfluences-reserves';
const LITHIUM = 'geoconfluences-lithium';
const MALEDICTION = 'geoconfluences-malediction-des-ressources';
const AQUACULTURE = 'geoconfluences-aquaculture';
const ZEE = 'geoconfluences-zee';
const RESSOURCE = 'geoconfluences-ressource';
const DURABLE = 'geoconfluences-developpement-durable';
const TRANSITION = 'geoconfluences-transition-demographique';
const SOLDE = 'geoconfluences-solde-naturel';
const IDH = 'geoconfluences-idh';
const RISQUE = 'geoconfluences-risque';
const VULNERABILITE = 'geoconfluences-vulnerabilite';
const RESILIENCE = 'geoconfluences-resilience';
const ADAPTATION = 'geoconfluences-adaptation';
const PREVENTION = 'geoconfluences-prevention';
const SECURITE = 'geoconfluences-securite-alimentaire';
const RENOUVELABLE = 'geoconfluences-energie-renouvelable';

type Wrong = { readonly label: string; readonly why: string };
const faux = (...w: [string, string][]): Wrong[] => w.map(([label, why]) => ({ label, why }));

/** Preuve d’un fait : source du registre, citation exacte et explication donnée à l’élève. */
interface Preuve {
  readonly quote: string;
  readonly src: string;
  readonly explain: string;
}
const preuve = (src: string, quote: string, explain: string): Preuve => ({ quote, src, explain });

/** Fait cité : question, réponse, erreurs expliquées, texte à trous, preuve. */
const fait = (q: string, a: string, wrong: [string, string][], gap: Fait['gap'], p: Preuve): Fait => ({
  q,
  a,
  wrong: faux(...wrong),
  gap,
  ...p,
});

const libre = (q: string, accepted: readonly string[], pieges: [string, string][], p: Preuve): Libre => ({
  q,
  accepted,
  traps: pieges.map(([text, why]) => ({ text, why })),
  ...p,
});

const question = (q: string, a: string, wrong: [string, string][], p: Preuve) => ({
  q,
  a,
  wrong: faux(...wrong),
  ...p,
});

/** Écritures d’un mot : avec ou sans article, avec ou sans accent. */
const noms = (nom: string, ...articles: string[]): string[] =>
  [nom, ...articles.map((a) => `${a}${nom}`)].flatMap((n) => [
    ...new Set([n, n.normalize('NFD').replace(/\p{M}/gu, '')]),
  ]);

const continent = (zone: string) => zoneName('monde', zone) ?? zone;
const CONTINENTS = ['europe', 'asie', 'afrique', 'amerique-nord', 'amerique-sud', 'oceanie'] as const;

// ——— Carte : situer un lieu des repères sur le planisphère ———

interface Lieu {
  readonly nom: string;
  readonly zone: (typeof CONTINENTS)[number];
  /** Citation de la source qui nomme ce lieu. */
  readonly quote: string;
}

/**
 * Question de carte sur un lieu cité par la source : continent à choisir (niveaux 1 et 2), à toucher (3 et 4) ; le
 * niveau 5 reste sur les textes à lire. `pools` : lieux du niveau 3 puis lieux du niveau 4.
 */
const carteLieux =
  (pools: readonly [readonly Lieu[], readonly Lieu[]], sujet: string) =>
  (rng: Rng, level: Level): QuestionDraft | undefined => {
    if (level === 5) return undefined;
    const hint = 'Retrouve d’abord le pays ou la région citée, puis son continent sur le planisphère.';
    const pool = level <= 2 ? [...pools[0], ...pools[1]] : level === 4 ? pools[1] : pools[0];
    const lieu = rng.pick(pool);
    const cible = (l: Lieu) => `le continent ${sujet} « ${l.nom} »`;
    const autres = rng.shuffle(CONTINENTS.filter((c) => c !== lieu.zone));
    const why = (z: string) => `Tu as choisi ${continent(z)} : « ${lieu.nom} » se trouve sur un autre continent.`;
    const steps = [
      `Cherchons ce que dit le site de géographie Géoconfluences : « ${lieu.quote} ».`,
      'Sur le planisphère, on cherche le continent qui porte ce lieu.',
    ];
    const fin = `La réponse est : **${continent(lieu.zone)}**.`;
    if (level <= 2) {
      return {
        prompt: `${level === 1 ? '' : 'Attention aux pièges ! '}Quel est ${cible(lieu)} ?`,
        figure: { kind: 'map', map: 'monde' },
        ...choice(
          rng,
          continent(lieu.zone),
          autres.slice(0, level === 1 ? 2 : 3).map((z) => ({ label: continent(z), why: why(z) })),
        ),
        hint,
        steps: [...steps, fin],
        targetSeconds: 25,
      };
    }
    const traps: Trap[] = autres.slice(0, 2).map((z) => ({ zone: z, why: why(z) }));
    return {
      prompt: `${level === 3 ? 'Sur le planisphère, touche' : 'Sans aide : touche'} ${cible(lieu)}.`,
      figure: { kind: 'map', map: 'monde' },
      answer: { kind: 'zone', map: 'monde', zone: lieu.zone },
      traps,
      hint,
      steps: [...steps, fin],
      targetSeconds: 30,
    };
  };

// ——— Notion 1 : lire les cartes du programme ———

const C_ECHELLE =
  "l'échelle désigne le rapport entre une distance réelle, mesurée dans l'espace terrestre et celle de sa représentation sur une carte";
const C_PETITE =
  'pour étudier un phénomène géographique sur une grande échelle (mondiale par exemple), il faut une carte à petite échelle';
const C_NIVEAUX = '(échelle locale, infranationale ou régionale, nationale, continentale, mondiale...)';
const C_LEGENDE =
  'Chaque figuré est présent au moins une fois sur la carte, et il est repris dans la légende qui en donne la clé de compréhension';
const C_TYPES = 'Ils sont classés en trois grands types : figurés ponctuels, linéaires et surfaciques';
const C_ABSOLUE =
  'une donnée absolue (population, PIB, volumes, etc.) est représentée par un figuré ponctuel (cercles proportionnels, carrés proportionnels…)';
const C_RELATIVE =
  'une donnée relative (densité de population, PIB par habitant, volume par habitant…) est représentée par un figuré surfacique avec une variation d’intensité';
const C_CHOROPLETHE = 'Elle représente des données par des plages de valeur discrétisées';
const C_PROJECTION = 'Aucune projection ne permet la représentation d’une sphère sur un plan sans déformation';
const C_CENTRAGE = "le centrage désigne le choix de l'espace qui figurera au centre de la carte";
const C_ORIENTATION = "L'orientation au Nord n'est donc qu'une convention";
const C_EQUATEUR = 'L’équateur est la ligne imaginaire qui sépare la Terre en deux hémisphères';
const C_LATITUDE = 'La latitude est définie par la distance angulaire d’un point à l’équateur, mesurée en degrés';
const C_CROQUIS = "Le croquis est une carte réalisée à la main à partir d'un fond de carte";

const figures = (rng: Rng, level: Level): QuestionDraft | undefined => {
  if (level > 2) return undefined;
  const cas = rng.pick([
    { zone: 'nil', type: 'un figuré linéaire', forme: 'une ligne' },
    { zone: 'amazone', type: 'un figuré linéaire', forme: 'une ligne' },
    { zone: 'afrique', type: 'un figuré surfacique', forme: 'une surface' },
    { zone: 'asie', type: 'un figuré surfacique', forme: 'une surface' },
  ]);
  const autre = cas.type === 'un figuré linéaire' ? 'un figuré surfacique' : 'un figuré linéaire';
  const wrong: Wrong[] = faux(
    [autre, `Sur cette carte, l’élément repéré A est dessiné comme ${cas.forme}.`],
    ['un figuré ponctuel', 'Un figuré ponctuel est un point ou un petit symbole placé à un endroit.'],
    ...(level === 2
      ? ([['une échelle', 'L’échelle indique un rapport entre distances : ce n’est pas un figuré.']] as [
          string,
          string,
        ][])
      : []),
  );
  return {
    prompt: `Sur ce planisphère, de quel type est le figuré mis en couleur et désigné par la lettre A (sans compter le rond de la lettre) ?`,
    figure: { kind: 'map', map: 'monde', highlight: [cas.zone], marks: [{ zone: cas.zone, label: 'A' }] },
    ...choice(rng, cas.type, wrong),
    hint: 'Demande-toi si l’élément est un point, une ligne ou une surface.',
    steps: [
      `Cherchons ce que dit le site de géographie Géoconfluences : « ${C_TYPES} ».`,
      `Au repère A, on voit ${cas.forme} : ${continent(cas.zone)}.`,
      `C’est donc **${cas.type}**.`,
    ],
    targetSeconds: 30,
  };
};

const cartes: Notion = {
  classe: '5e',
  id: 'g5-cartes',
  title: 'Lire les cartes du programme',
  hint: 'Commence par le titre et la légende, puis regarde l’échelle et la forme des figurés.',
  memo: [
    'La **légende** explique chaque **figuré** (point, ligne ou surface) ; l’**échelle** compare la distance sur la carte à la distance réelle. Un **planisphère** représente le monde entier.',
    'Une quantité (population) se montre avec des cercles proportionnels ; un taux ou une densité, avec des plages de plus en plus foncées : c’est une carte **choroplèthe**.',
    'Toute **projection** déforme la Terre, et le centre comme l’orientation d’un planisphère sont des choix : lis une carte avec esprit critique.',
  ],
  faits: [
    fait(
      'Que désigne l’échelle d’une carte ?',
      'le rapport entre une distance sur la carte et la distance réelle',
      [
        ['la liste des figurés et de leur sens', 'C’est le rôle de la légende.'],
        ['la direction du nord', 'C’est une question d’orientation.'],
        ['le choix de l’espace placé au centre', 'C’est le centrage de la carte.'],
      ],
      ['L’', ' est le rapport entre une distance réelle et sa représentation sur la carte.', ['échelle', 'echelle']],
      preuve(
        ECHELLE,
        C_ECHELLE,
        'Grâce à l’échelle, on retrouve une distance réelle à partir d’une mesure sur la carte.',
      ),
    ),
    fait(
      'Pour étudier un phénomène à l’échelle du monde, quelle carte faut-il ?',
      'une carte à petite échelle',
      [
        ['une carte à grande échelle', 'La grande échelle montre un petit espace avec beaucoup de détails.'],
        ['un plan de quartier', 'Un plan de quartier montre un espace local.'],
        ['une carte sans aucune échelle', 'Sans échelle, on ne peut pas comparer les distances.'],
      ],
      ['Pour étudier un phénomène mondial, il faut une carte à ', ' échelle.', ['petite']],
      preuve(
        ECHELLE,
        C_PETITE,
        'Plus la réduction est forte, plus l’espace représenté est vaste : on parle de petite échelle.',
      ),
    ),
    fait(
      'Où trouve-t-on la clé de compréhension des figurés d’une carte ?',
      'dans la légende',
      [
        ['dans le titre seul', 'Le titre annonce le sujet, il n’explique pas chaque figuré.'],
        ['dans l’échelle', 'L’échelle concerne les distances.'],
        ['dans la projection', 'La projection est la manière de mettre la Terre à plat.'],
      ],
      ['Chaque figuré de la carte est repris dans la ', '.', ['légende', 'legende']],
      preuve(FIGURE, C_LEGENDE, 'La légende dit ce que représente chaque point, ligne ou surface.'),
    ),
    fait(
      'Quels sont les trois grands types de figurés ?',
      'ponctuels, linéaires et surfaciques',
      [
        ['petits, moyens et grands', 'La taille peut varier, mais ce n’est pas le classement des types.'],
        ['rouges, verts et bleus', 'La couleur est une variation possible, pas un type de figuré.'],
        ['locaux, nationaux et mondiaux', 'Ce sont des échelles, pas des figurés.'],
      ],
      ['Les figurés sont ponctuels, ', ' ou surfaciques.', ['linéaires', 'lineaires', 'linéaire']],
      preuve(FIGURE, C_TYPES, 'Un point, une ligne ou une surface : la forme suit la nature de l’information.'),
    ),
    fait(
      'Quel figuré convient pour montrer un nombre d’habitants (une donnée absolue) ?',
      'des cercles proportionnels',
      [
        ['des plages de plus en plus foncées', 'Les plages conviennent aux données relatives, comme la densité.'],
        ['des flèches', 'Les flèches montrent des déplacements, pas une quantité par lieu.'],
        ['des traits de frontière', 'Une frontière est une limite : elle ne mesure pas une population.'],
      ],
      ['Une donnée absolue se représente par des cercles ', '.', ['proportionnels', 'proportionnel']],
      preuve(FIGURE, C_ABSOLUE, 'Plus la quantité est grande, plus le symbole est grand.'),
    ),
    fait(
      'Quel figuré convient pour montrer une densité de population (une donnée relative) ?',
      'un figuré de surface avec une variation d’intensité',
      [
        ['des cercles proportionnels', 'Ils conviennent aux quantités, comme un nombre d’habitants.'],
        ['un seul point au centre du pays', 'Un point unique ne montre pas les différences entre les espaces.'],
        ['des flèches de largeur variable', 'Les flèches montrent des flux, pas une densité.'],
      ],
      ['Une densité se représente par un figuré ', ' dont l’intensité varie.', ['surfacique', 'de surface']],
      preuve(FIGURE, C_RELATIVE, 'La teinte, du clair au foncé, indique des valeurs faibles à fortes.'),
    ),
    fait(
      'Qu’est-ce qu’une carte choroplèthe représente ?',
      'des données rangées en plages de valeurs',
      [
        ['uniquement des reliefs en trois dimensions', 'Elle montre des données statistiques par plages.'],
        ['des trajets de navires', 'Les trajets sont des lignes ou des flèches.'],
        ['les seules frontières des États', 'Elle représente des valeurs, pas seulement des limites.'],
      ],
      ['Une carte choroplèthe représente des données par des ', ' de valeurs.', ['plages', 'plage', 'classes']],
      preuve(CHOROPLETHE, C_CHOROPLETHE, 'Chaque plage regroupe des valeurs proches sous une même teinte.'),
    ),
    fait(
      'Que peut-on dire de toutes les projections cartographiques ?',
      'elles déforment toutes un peu la Terre',
      [
        ['elles sont toutes parfaitement exactes', 'Mettre une sphère à plat entraîne toujours une déformation.'],
        ['elles ne servent que pour les petits pays', 'Un planisphère utilise aussi une projection.'],
        ['elles suppriment l’échelle', 'La projection met la sphère à plat ; elle ne supprime pas l’échelle.'],
      ],
      ['Aucune ', ' ne représente la sphère à plat sans déformation.', ['projection']],
      preuve(
        PROJECTION,
        C_PROJECTION,
        'Une sphère ne peut pas être aplatie sans déformer des surfaces, des distances ou des angles.',
      ),
    ),
    fait(
      'Comment appelle-t-on le choix de l’espace placé au milieu d’un planisphère ?',
      'le centrage',
      [
        ['la légende', 'La légende explique les figurés.'],
        ['l’échelle', 'L’échelle concerne les distances.'],
        ['la discrétisation', 'La discrétisation range des données en classes.'],
      ],
      ['Le ', ' désigne le choix de l’espace placé au centre de la carte.', ['centrage']],
      preuve(CENTRAGE, C_CENTRAGE, 'On peut centrer un planisphère sur l’Europe, sur la Chine ou sur un pôle.'),
    ),
    fait(
      'Pourquoi le nord est-il souvent placé en haut des cartes ?',
      'par convention',
      [
        ['parce que la Terre a un haut et un bas', 'Dans l’espace, il n’y a ni haut ni bas.'],
        ['parce que le nord est plus peuplé', 'Le peuplement ne fixe pas l’orientation.'],
        ['parce que toute carte est obligée de le faire', 'Des cartes anciennes étaient orientées à l’est ou au sud.'],
      ],
      ['L’orientation au nord n’est qu’une ', '.', ['convention']],
      preuve(ORIENTATION, C_ORIENTATION, 'Une carte pourrait être orientée autrement.'),
    ),
    fait(
      'Quelle ligne imaginaire sépare la Terre en deux hémisphères, nord et sud ?',
      'l’équateur',
      [
        ['le méridien de Greenwich', 'Il sert à séparer les hémisphères est et ouest.'],
        ['le tropique du Cancer', 'C’est un parallèle situé au nord de l’équateur.'],
        ['le cercle polaire', 'Il entoure une région proche d’un pôle.'],
      ],
      ['La ligne imaginaire qui sépare les hémisphères nord et sud est l’', '.', ['équateur', 'equateur']],
      preuve(EQUATEUR, C_EQUATEUR, 'Il est à égale distance des deux pôles.'),
    ),
  ],
  paires3: [
    ['Légende', 'explique les figurés'],
    ['Échelle', 'compare les distances'],
    ['Équateur', 'sépare le nord et le sud'],
  ],
  paires5: [
    ['Figuré ponctuel', 'cercle proportionnel'],
    ['Carte choroplèthe', 'plages de valeurs'],
    ['Projection', 'mise à plat qui déforme'],
    ['Centrage', 'choix de l’espace placé au milieu'],
    ['Croquis', 'carte faite à la main sur un fond'],
  ],
  ordre: [
    'l’échelle locale',
    'l’échelle régionale',
    'l’échelle nationale',
    'l’échelle continentale',
    'l’échelle mondiale',
  ],
  consigne: {
    prompt: 'Range ces échelles, du plus petit espace au plus vaste.',
    hint: 'Commence par ton voisinage et finis par la Terre entière.',
    why: 'L’espace étudié grandit : local, régional, national, continental, puis mondial.',
    fin: 'La première est',
    quote: C_NIVEAUX,
    src: ECHELLE,
  },
  libres: [
    libre(
      'comment s’appelle la partie de la carte qui explique le sens des figurés ?',
      noms('légende', 'la ', 'une '),
      [
        ['échelle', 'L’échelle sert à mesurer les distances.'],
        ['titre', 'Le titre annonce le sujet de la carte.'],
      ],
      preuve(FIGURE, C_LEGENDE, 'La légende donne la clé de compréhension.'),
    ),
    libre(
      'quel mot désigne la ligne imaginaire qui sépare les hémisphères nord et sud ?',
      noms('équateur', 'l’', 'un '),
      [
        ['méridien', 'Un méridien relie les pôles : il ne sépare pas le nord et le sud.'],
        ['tropique', 'Les tropiques sont situés au nord et au sud de l’équateur.'],
      ],
      preuve(EQUATEUR, C_EQUATEUR, 'L’équateur partage la Terre en deux moitiés.'),
    ),
    libre(
      'quel nom donne-t-on au procédé qui reporte la surface de la Terre sur une carte plane ?',
      noms('projection', 'la ', 'une '),
      [
        ['échelle', 'L’échelle compare des distances.'],
        ['orientation', 'L’orientation concerne la direction en haut de la carte.'],
      ],
      preuve(PROJECTION, C_PROJECTION, 'Toute projection déforme un peu la sphère.'),
    ),
    libre(
      'quelle coordonnée mesure en degrés l’éloignement d’un point par rapport à l’équateur ?',
      noms('latitude', 'la ', 'une '),
      [
        ['longitude', 'La longitude se mesure à partir du méridien d’origine.'],
        ['altitude', 'L’altitude indique une hauteur.'],
      ],
      preuve(COORDONNEES, C_LATITUDE, 'La latitude va de 0° à l’équateur à 90° aux pôles.'),
    ),
    libre(
      'comment appelle-t-on une carte dessinée à la main à partir d’un fond de carte ?',
      noms('croquis', 'un ', 'le '),
      [
        ['schéma', 'Le schéma se fait à main levée, sans fond de carte.'],
        ['photographie', 'Une photographie n’est pas dessinée à la main.'],
      ],
      preuve(CARTE, C_CROQUIS, 'Le croquis part d’un fond de carte.'),
    ),
  ],
  docs: [
    {
      title: 'Une élève prépare son exposé',
      lines: [
        'Léa veut comparer la population des grandes régions du monde.',
        'Elle choisit un planisphère et dessine des cercles dont la taille dépend du nombre d’habitants.',
        'Elle ajoute une légende et un titre.',
      ],
      qs: [
        question(
          'Quel type de figuré Léa a-t-elle utilisé ?',
          'un figuré ponctuel proportionnel',
          [
            ['un figuré linéaire', 'Une ligne montre un tracé ou une liaison.'],
            ['des plages de couleur', 'Les plages conviennent aux données relatives, comme la densité.'],
          ],
          preuve(FIGURE, C_ABSOLUE, 'Un nombre d’habitants est une donnée absolue : la taille du cercle la traduit.'),
        ),
        question(
          'À quoi sert la légende ajoutée par Léa ?',
          'à expliquer le sens des cercles',
          [
            ['à mesurer les distances', 'C’est le rôle de l’échelle.'],
            ['à déformer la carte', 'La déformation vient de la projection.'],
          ],
          preuve(FIGURE, C_LEGENDE, 'La légende est la clé de lecture des figurés.'),
        ),
      ],
    },
    {
      title: 'Deux planisphères différents',
      lines: [
        'Un premier planisphère place l’Europe au milieu.',
        'Un second place un autre continent au milieu et déforme les surfaces autrement.',
        'La classe se demande lequel est « le vrai ».',
      ],
      qs: [
        question(
          'Quel choix différent explique que l’Europe soit au milieu sur un seul des deux ?',
          'le centrage',
          [
            ['la légende', 'La légende explique les figurés, elle ne déplace pas les continents.'],
            ['la discrétisation', 'La discrétisation concerne des classes de données.'],
          ],
          preuve(CENTRAGE, C_CENTRAGE, 'Le cartographe choisit l’espace placé au centre.'),
        ),
        question(
          'Que faut-il répondre à la classe ?',
          'aucune projection n’est exacte : chacune déforme',
          [
            ['seul le planisphère centré sur l’Europe est exact', 'Le centrage est un choix, pas une preuve.'],
            ['les deux sont forcément faux et inutiles', 'Une carte reste utile si on connaît ses limites.'],
          ],
          preuve(PROJECTION, C_PROJECTION, 'Mettre une sphère à plat oblige à déformer.'),
        ),
      ],
    },
    {
      title: 'La carte de la densité',
      lines: [
        'Un manuel montre la densité de population de chaque région d’un pays.',
        'Les régions sont coloriées en cinq teintes, du plus clair au plus foncé.',
        'Chaque teinte correspond à un intervalle de valeurs noté sous la carte.',
      ],
      qs: [
        question(
          'Quel nom porte ce type de carte ?',
          'une carte choroplèthe',
          [
            ['un croquis sans fond', 'Cette carte repose sur des plages de valeurs statistiques.'],
            ['une carte en cercles proportionnels', 'Ici, ce sont des surfaces coloriées, pas des cercles.'],
          ],
          preuve(CHOROPLETHE, C_CHOROPLETHE, 'Elle range les données en plages de valeurs.'),
        ),
        question(
          'Où le lecteur doit-il chercher le sens des teintes ?',
          'dans la légende',
          [
            ['dans l’échelle des distances', 'L’échelle concerne les kilomètres, pas les teintes.'],
            ['dans l’orientation', 'L’orientation indique une direction.'],
          ],
          preuve(FIGURE, C_LEGENDE, 'La légende reprend chaque figuré.'),
        ),
      ],
    },
  ],
  carte: figures,
};

// ——— Notion 2 : les grands foyers de population ———

const F_DEF = 'Un foyer de peuplement est un espace densément et fortement peuplé depuis longtemps';
const F_DENSE = 'Densément peuplé signifie qu’il a un nombre élevé d’habitants par kilomètre carré';
const F_FORT = 'fortement peuplé indique un nombre élevé d’habitants au total';
const F_DEUX =
  'Les deux principaux foyers de peuplement à l’échelle mondiale sont la Chine de l’Est et l’Inde du Nord et du Pakistan, avec environ 1 milliard d’habitants chacun';
const F_AUTRES =
  'L’Europe (500 millions), notamment la dorsale européenne, le Golfe de Guinée (200 millions) et la façade orientale des États-Unis (100 millions) forment également des foyers importants';
const F_SECONDAIRES =
  'Californie, centre du Mexique, Sud-Est du Brésil, littoral du Maghreb, vallée du Nil, hauts-plateaux éthiopiens, région des Grands Lacs africains, Asie du Sud-Est, île de Java, Japon';
const F_MOITIE = 'La moitié des huit milliards d’habitants de la Terre vit dans un foyer de population situé en Asie';
const F_DUREE =
  'La présence d’un foyer de population s’explique par l’accumulation des humains dans la très longue durée';
const F_RURAL =
  'Certains foyers de peuplement sont caractérisés par des densités rurales très élevées (hauts-plateaux de l’Éthiopie), d’autres par un semis serré de villes grandes et moyennes (Mexique central)';

const FOYERS_IMPORTANTS: readonly Lieu[] = [
  { nom: 'Chine de l’Est', zone: 'asie', quote: F_DEUX },
  { nom: 'Inde du Nord', zone: 'asie', quote: F_DEUX },
  { nom: 'golfe de Guinée', zone: 'afrique', quote: F_AUTRES },
  { nom: 'façade orientale des États-Unis', zone: 'amerique-nord', quote: F_AUTRES },
  { nom: 'dorsale européenne', zone: 'europe', quote: F_AUTRES },
];
const FOYERS_SECONDAIRES: readonly Lieu[] = [
  { nom: 'Californie', zone: 'amerique-nord', quote: F_SECONDAIRES },
  { nom: 'centre du Mexique', zone: 'amerique-nord', quote: F_SECONDAIRES },
  { nom: 'Sud-Est du Brésil', zone: 'amerique-sud', quote: F_SECONDAIRES },
  { nom: 'vallée du Nil', zone: 'afrique', quote: F_SECONDAIRES },
  { nom: 'hauts-plateaux éthiopiens', zone: 'afrique', quote: F_SECONDAIRES },
  { nom: 'île de Java', zone: 'asie', quote: F_SECONDAIRES },
];

const foyers: Notion = {
  classe: '5e',
  id: 'g5-foyers-population',
  title: 'Les grands foyers de population',
  hint: 'Distingue la densité (habitants par km²) du total d’habitants, puis situe chaque foyer.',
  memo: [
    'Un **foyer de peuplement** est un espace densément et fortement peuplé depuis longtemps. La **densité** compte les habitants par km².',
    'Les deux principaux sont la Chine de l’Est et l’Inde du Nord avec le Pakistan, environ 1 milliard d’habitants chacun ; viennent ensuite notamment l’Europe, le golfe de Guinée et la façade orientale des États-Unis.',
    'Des foyers secondaires existent ailleurs, comme la vallée du Nil ou le Sud-Est du Brésil. La longue durée explique ces concentrations.',
  ],
  faits: [
    fait(
      'Qu’est-ce qu’un foyer de peuplement ?',
      'un espace densément et fortement peuplé depuis longtemps',
      [
        ['une ville fondée récemment', 'Un foyer se constitue sur des siècles, parfois des millénaires.'],
        ['un vaste espace presque vide', 'Un foyer est au contraire très peuplé.'],
        ['la maison principale d’une famille', 'En géographie, le foyer est un espace à grande échelle.'],
      ],
      ['Un foyer de peuplement est un espace densément et fortement peuplé depuis ', '.', ['longtemps']],
      preuve(FOYER, F_DEF, 'Trois idées : une forte densité, beaucoup d’habitants et une longue durée.'),
    ),
    fait(
      'Que signifie « densément peuplé » ?',
      'un nombre élevé d’habitants par kilomètre carré',
      [
        ['un nombre élevé d’habitants au total', 'C’est le sens de « fortement peuplé ».'],
        ['une population très jeune', 'La densité ne dit rien de l’âge.'],
        ['une croissance très rapide', 'La densité ne mesure pas une évolution.'],
      ],
      ['« Densément peuplé » : un nombre élevé d’habitants par ', ' carré.', ['kilomètre', 'kilometre', 'km']],
      preuve(FOYER, F_DENSE, 'La densité rapporte les habitants à la surface.'),
    ),
    fait(
      'Que signifie « fortement peuplé » ?',
      'un nombre élevé d’habitants au total',
      [
        ['un nombre élevé d’habitants par kilomètre carré', 'C’est le sens de « densément peuplé ».'],
        ['un relief élevé', 'Le mot « fortement » porte sur la population.'],
        ['des habitants installés depuis hier', 'La durée n’est pas le sens de ce terme.'],
      ],
      ['« Fortement peuplé » : un nombre élevé d’habitants au ', '.', ['total']],
      preuve(FOYER, F_FORT, 'C’est un effectif total, pas un rapport à la surface.'),
    ),
    fait(
      'Environ combien d’habitants compte chacun des deux principaux foyers (Chine de l’Est ; Inde du Nord et Pakistan) ?',
      'environ 1 milliard',
      [
        ['environ 10 millions', 'C’est cent fois trop peu pour l’une de ces immenses concentrations.'],
        ['environ 100 millions', 'C’est l’ordre de grandeur de la façade orientale des États-Unis.'],
        ['environ 8 milliards', 'Huit milliards est la population de la Terre entière.'],
      ],
      ['Chacun des deux principaux foyers compte environ 1 ', ' d’habitants.', ['milliard']],
      preuve(FOYER, F_DEUX, 'Ce sont les deux plus grandes concentrations humaines.'),
    ),
    fait(
      'Selon Géoconfluences, environ combien d’habitants le foyer européen compte-t-il ?',
      'environ 500 millions',
      [
        ['environ 5 millions', 'C’est cent fois trop peu.'],
        ['environ 1 milliard', 'C’est l’ordre de grandeur des deux principaux foyers asiatiques.'],
        ['environ 200 millions', 'C’est le chiffre donné pour le golfe de Guinée.'],
      ],
      ['Le foyer européen compte environ ', ' millions d’habitants.', ['500', 'cinq cents', 'cinq cent']],
      preuve(FOYER, F_AUTRES, 'L’Europe, notamment sa dorsale, forme un foyer important.'),
    ),
    fait(
      'Quel foyer d’Afrique compte environ 200 millions d’habitants ?',
      'le golfe de Guinée',
      [
        ['le centre du Sahara', 'Le Sahara est un désert très peu peuplé.'],
        ['la façade orientale des États-Unis', 'Elle est en Amérique du Nord.'],
        ['la dorsale européenne', 'Elle se trouve en Europe.'],
      ],
      ['En Afrique, le foyer du golfe de ', ' compte environ 200 millions d’habitants.', ['Guinée', 'Guinee']],
      preuve(FOYER, F_AUTRES, 'Le golfe de Guinée est un foyer important.'),
    ),
    fait(
      'Quelle part de la population mondiale vit dans un foyer situé en Asie ?',
      'la moitié',
      [
        ['un dixième', 'C’est beaucoup trop peu.'],
        ['la totalité', 'D’autres foyers se trouvent hors d’Asie.'],
        ['un centième', 'L’Asie réunit de très grands foyers.'],
      ],
      ['La ', ' des habitants de la Terre vit dans un foyer situé en Asie.', ['moitié', 'moitie']],
      preuve(FOYER, F_MOITIE, 'Sur environ huit milliards d’habitants, quatre milliards sont dans un foyer asiatique.'),
    ),
    fait(
      'Qu’est-ce qui explique la présence d’un foyer de population ?',
      'l’accumulation des humains dans la très longue durée',
      [
        ['une seule vague d’arrivées l’an dernier', 'Un foyer se construit lentement, sur des siècles.'],
        ['la seule présence de pétrole', 'La source n’explique pas les foyers par une ressource unique.'],
        ['le hasard d’un recensement', 'Un recensement compte les habitants, il ne les crée pas.'],
      ],
      ['Un foyer s’explique par l’accumulation des humains dans la très longue ', '.', ['durée', 'duree']],
      preuve(FOYER, F_DUREE, 'Des sociétés rurales à la croissance lente ont grandi sur des siècles.'),
    ),
    fait(
      'Lequel de ces espaces est cité parmi les foyers secondaires ?',
      'la vallée du Nil',
      [
        ['l’Antarctique', 'Ce continent n’a pas de population permanente.'],
        ['la Chine de l’Est', 'C’est l’un des deux principaux foyers.'],
        ['l’Inde du Nord', 'Elle appartient aux deux principaux foyers.'],
      ],
      ['Parmi les foyers secondaires figure la vallée du ', '.', ['Nil']],
      preuve(FOYER, F_SECONDAIRES, 'La vallée du Nil est un foyer secondaire.'),
    ),
    fait(
      'Quel exemple de foyer à densités rurales très élevées Géoconfluences donne-t-il ?',
      'les hauts-plateaux de l’Éthiopie',
      [
        ['le Mexique central', 'La source le cite pour son semis serré de villes.'],
        ['l’Antarctique', 'Il n’est pas habité en permanence.'],
        ['la façade orientale des États-Unis', 'La source ne la donne pas en exemple de densités rurales.'],
      ],
      ['Les hauts-plateaux de l’', ' ont des densités rurales très élevées.', ['Éthiopie', 'Ethiopie']],
      preuve(FOYER, F_RURAL, 'La concentration peut être rurale, et pas seulement urbaine.'),
    ),
  ],
  paires3: [
    ['Chine de l’Est', 'environ 1 milliard'],
    ['Europe', 'environ 500 millions'],
    ['golfe de Guinée', 'environ 200 millions'],
  ],
  paires5: [
    ['Chine de l’Est', 'environ 1 milliard'],
    ['Europe', 'environ 500 millions'],
    ['golfe de Guinée', 'environ 200 millions'],
    ['façade orientale des États-Unis', 'environ 100 millions'],
    ['hauts-plateaux éthiopiens', 'densités rurales très élevées'],
  ],
  ordre: ['la Chine de l’Est', 'l’Europe', 'le golfe de Guinée', 'la façade orientale des États-Unis'],
  consigne: {
    prompt: 'Classe ces foyers du plus peuplé au moins peuplé.',
    hint: 'Commence par le foyer qui compte environ un milliard d’habitants.',
    why: 'Environ 1 milliard, puis 500, 200 et 100 millions d’habitants.',
    fin: 'Le plus peuplé est',
    quote: F_AUTRES,
    src: FOYER,
  },
  libres: [
    libre(
      'quel pays d’Asie possède à l’est l’un des deux principaux foyers de peuplement ?',
      noms('Chine', 'la ', 'La '),
      [
        ['Japon', 'Le Japon est cité parmi les foyers secondaires.'],
        ['Indonésie', 'L’île de Java est un foyer secondaire.'],
      ],
      preuve(FOYER, F_DEUX, 'La Chine de l’Est compte environ un milliard d’habitants.'),
    ),
    libre(
      'quel fleuve donne son nom à une vallée d’Afrique citée parmi les foyers secondaires ?',
      ['Nil', 'le Nil', 'vallée du Nil', 'la vallée du Nil', 'vallee du Nil', 'la vallee du Nil'],
      [
        ['Congo', 'La source cite la vallée d’un autre fleuve.'],
        ['Amazone', 'L’Amazone coule en Amérique du Sud.'],
      ],
      preuve(FOYER, F_SECONDAIRES, 'Il s’agit de la vallée du Nil.'),
    ),
    libre(
      'quelle île, dont le nom commence par J, figure parmi les foyers secondaires cités par Géoconfluences ?',
      ['Java', 'île de Java', 'l’île de Java', 'ile de Java', 'l’ile de Java'],
      [
        ['Madagascar', 'Madagascar est proche de l’Afrique.'],
        ['Islande', 'L’Islande est une île d’Europe, peu peuplée.'],
      ],
      preuve(FOYER, F_SECONDAIRES, 'L’île de Java est un foyer secondaire.'),
    ),
    libre(
      'comment appelle-t-on le nombre d’habitants par kilomètre carré ?',
      [...noms('densité', 'la ', 'une '), ...noms('densité de population', 'la ')],
      [
        ['natalité', 'La natalité concerne les naissances.'],
        ['solde naturel', 'Le solde naturel compare les naissances et les décès.'],
      ],
      preuve(FOYER, F_DENSE, 'C’est la densité de population.'),
    ),
  ],
  docs: [
    {
      title: 'Les grands foyers sur le planisphère',
      lines: [
        'Sur la carte d’un atlas, deux grandes zones d’Asie sont presque entièrement foncées.',
        'La première est située dans l’est de la Chine.',
        'La seconde couvre le nord de l’Inde et le Pakistan.',
        'D’autres taches, plus petites, apparaissent en Europe et sur le golfe de Guinée.',
      ],
      qs: [
        question(
          'Environ combien d’habitants compte la première zone ?',
          'environ 1 milliard',
          [
            ['environ 100 millions', 'C’est l’ordre de grandeur de la façade orientale des États-Unis.'],
            ['environ 8 milliards', 'C’est la population mondiale.'],
          ],
          preuve(FOYER, F_DEUX, 'La Chine de l’Est est l’un des deux principaux foyers.'),
        ),
        question(
          'Comment appelle-t-on ces espaces densément et fortement peuplés depuis longtemps ?',
          'des foyers de peuplement',
          [
            ['des zones économiques exclusives', 'Elles sont en mer et concernent des droits sur les ressources.'],
            ['des vides humains', 'Un vide humain est très peu peuplé.'],
          ],
          preuve(FOYER, F_DEF, 'La définition réunit densité, effectif et longue durée.'),
        ),
      ],
    },
    {
      title: 'Deux manières d’être peuplé',
      lines: [
        'Sur les hauts-plateaux d’Éthiopie, de nombreux agriculteurs vivent dans les campagnes.',
        'Au centre du Mexique, on trouve de nombreuses villes grandes et moyennes, proches les unes des autres.',
        'Les deux espaces appartiennent à des foyers de peuplement.',
      ],
      qs: [
        question(
          'Qu’est-ce qui caractérise surtout le premier espace ?',
          'des densités rurales très élevées',
          [
            ['un semis serré de grandes villes', 'La source associe ce trait au Mexique central.'],
            ['une absence totale d’habitants', 'Le texte parle de nombreux agriculteurs.'],
          ],
          preuve(FOYER, F_RURAL, 'Les campagnes y sont très densément peuplées.'),
        ),
        question(
          'Quel mot désigne le rapport entre les habitants et la surface ?',
          'la densité',
          [
            ['le total', 'Le total ne tient pas compte de la surface.'],
            ['le solde naturel', 'Il compare naissances et décès.'],
          ],
          preuve(FOYER, F_DENSE, 'La densité se compte en habitants par km².'),
        ),
      ],
    },
    {
      title: 'Pourquoi tant de monde au même endroit ?',
      lines: [
        'Un guide explique qu’une région est habitée par des paysans depuis environ deux mille ans.',
        'La population y a augmenté lentement, malgré des guerres et des épidémies.',
        'Aujourd’hui, elle forme une très grande concentration humaine.',
      ],
      qs: [
        question(
          'Quelle explication le texte met-il en avant ?',
          'l’accumulation des habitants sur une très longue durée',
          [
            ['une arrivée massive l’an dernier', 'Le texte parle d’environ deux mille ans.'],
            ['l’absence d’agriculture', 'Le texte évoque des paysans.'],
          ],
          preuve(FOYER, F_DUREE, 'La population s’est accumulée au fil des siècles.'),
        ),
        question(
          'Comment appelle-t-on une telle région ?',
          'un foyer de peuplement',
          [
            ['un front pionnier', 'Un front pionnier est un espace en cours de mise en valeur.'],
            ['un archipel', 'Un archipel est un groupe d’îles.'],
          ],
          preuve(FOYER, F_DEF, 'Elle est densément et fortement peuplée depuis longtemps.'),
        ),
      ],
    },
  ],
  carte: carteLieux([FOYERS_IMPORTANTS, FOYERS_SECONDAIRES], 'du foyer'),
};

// ——— Notion 3 : repères sur les ressources ———

const R_FOSSILE =
  'Appartenant au groupe des énergies fossiles non renouvelables, le pétrole est un hydrocarbure liquide';
const R_AFFLEURENT =
  'Certains gisements qui affleurent à la surface des sols au Moyen-Orient sont ainsi connus dès l’Antiquité';
const R_PRODUCTION =
  'la moitié de la production mondiale de pétrole demeure dominée par les États-Unis, la Russie, l’Arabie saoudite et le Canada';
const R_RESERVES_PETROLE =
  '62 % des réserves sont contrôlées par seulement cinq États (Venezuela, Arabie saoudite, Canada, Iran et Irak)';
const R_OFFSHORE =
  'l’exploitation du pétrole offshore débute dans le golfe du Mexique dans les années 1950 puis en mer du Nord dans les années 1970';
const R_CHARBON =
  'La localisation des gisements, présents dans plus de 70 pays, font du charbon une énergie bien mieux répartie que les hydrocarbures';
const R_CHARBON_REGIONS =
  'On retrouve ce modèle en Europe (Manchester, Sheffield, Glasgow, Ruhr, Sillon wallon, Pas-de-Calais, Oural, Donetsk dans le Donbass)';
const R_SHANXI = 'en Afrique du Sud (Highveld, Witbank) ou en Chine (Shanxi)';
const R_SURFACE = 'gisements de surface à l’exploitation mécanisée (Wyoming, Queensland en Australie, Indonésie...)';
const R_OPEP =
  'L’OPEP, Organisation des pays exportateurs de pétrole, est une organisation intergouvernementale fondée en 1960';
const R_SIEGE = 'Son siège est à Vienne en Autriche';
const R_RESERVE =
  'Les réserves sont, au sens géologique, l’état des ressources à un moment donné, et qui sont économiquement et techniquement récupérables';
const R_ANDES = 'les principaux gisements se trouvent dans l’Altiplano de la Cordillère des Andes';
const R_BATTERIES = 'il est surtout indispensable dans les batteries électriques';
const R_MALEDICTION =
  'La R.D.C. et ses diamants, la Russie (ou l’Alaska) et ses hydrocarbures, le Tchad ou le Niger et leur uranium, la Nouvelle-Calédonie et son nickel';
const R_MALEDICTION_DEF = 'désigne l’ensemble des retombées négatives liées à leur exploitation';
const R_ACCAPAREMENT = 'accaparement par un groupe social';
const R_AUTRES_SECTEURS =
  'le secteur de l’énergie peut occuper une place si considérable dans les recettes fiscales et l’ensemble des exportations d’un État que cette manne entrave le développement des autres secteurs d’activités';
const R_AQUACULTURE =
  'L’Asie produit les neuf dixièmes de la production aquacole, avec la Chine comme premier producteur';
const R_ZEE =
  "sur laquelle un État riverain (parfois plusieurs États dans le cas d'accords de gestion partagée) dispose de l'exclusivité d'exploitation des ressources";

const RESSOURCES_PRINCIPALES: readonly Lieu[] = [
  { nom: 'Arabie saoudite (pétrole)', zone: 'asie', quote: R_PRODUCTION },
  { nom: 'Venezuela (réserves de pétrole)', zone: 'amerique-sud', quote: R_RESERVES_PETROLE },
  { nom: 'Ruhr (charbon)', zone: 'europe', quote: R_CHARBON_REGIONS },
  { nom: 'Canada (pétrole)', zone: 'amerique-nord', quote: R_PRODUCTION },
  { nom: 'Niger (uranium)', zone: 'afrique', quote: R_MALEDICTION },
];
const RESSOURCES_RARES: readonly Lieu[] = [
  { nom: 'Altiplano des Andes (lithium)', zone: 'amerique-sud', quote: R_ANDES },
  { nom: 'Shanxi (charbon)', zone: 'asie', quote: R_SHANXI },
  { nom: 'Nouvelle-Calédonie (nickel)', zone: 'oceanie', quote: R_MALEDICTION },
  { nom: 'République démocratique du Congo (diamants)', zone: 'afrique', quote: R_MALEDICTION },
  { nom: 'Wyoming (charbon)', zone: 'amerique-nord', quote: R_SURFACE },
];

const ressources: Notion = {
  classe: '5e',
  id: 'g5-reperes-ressources',
  title: 'Repères : les ressources dans le monde',
  hint: 'Associe la ressource à son lieu : pétrole, charbon, lithium ou produits de la mer.',
  memo: [
    'Les ressources sont inégalement réparties. Pour le pétrole, cinq États (Venezuela, Arabie saoudite, Canada, Iran, Irak) contrôlent 62 % des **réserves**.',
    'L’**OPEP** réunit des pays exportateurs de pétrole. Les gisements de **charbon** sont mieux répartis ; le **lithium** vient notamment de l’Altiplano des Andes.',
    'La **zone économique exclusive** est un enjeu fort pour les États riverains. En mer, on exploite du pétrole **offshore** ; l’Asie domine l’**aquaculture**.',
    'Autres repères : l’uranium au Niger, le nickel en Nouvelle-Calédonie, les diamants en République démocratique du Congo, les hydrocarbures en Russie.',
    'La **malédiction des ressources** désigne les effets négatifs liés à leur exploitation : un groupe qui garde la richesse, d’autres activités qui reculent.',
  ],
  faits: [
    fait(
      'À quelle famille d’énergies le pétrole appartient-il ?',
      'les énergies fossiles non renouvelables',
      [
        ['les énergies renouvelables', 'Le pétrole ne se reconstitue pas à l’échelle humaine.'],
        ['les énergies du vent', 'Le vent fournit l’énergie éolienne, pas du pétrole.'],
        ['les énergies du soleil captées par panneaux', 'Les panneaux solaires n’utilisent pas de pétrole.'],
      ],
      ['Le pétrole est une énergie fossile non ', '.', ['renouvelable', 'renouvelables']],
      preuve(PETROLE, R_FOSSILE, 'Le pétrole est un hydrocarbure liquide, extrait du sous-sol.'),
    ),
    fait(
      'Dans quelle région des gisements de pétrole qui affleurent étaient-ils connus dès l’Antiquité ?',
      'au Moyen-Orient',
      [
        ['en Antarctique', 'Ce continent n’est pas cité pour ces usages anciens.'],
        ['en Amazonie', 'La source cite une autre région.'],
        ['en Scandinavie', 'La mer du Nord est exploitée bien plus tard.'],
      ],
      [
        'Certains gisements de pétrole du Moyen-Orient sont connus dès l’',
        ' (une grande période de l’histoire).',
        ['Antiquité', 'Antiquite'],
      ],
      preuve(PETROLE, R_AFFLEURENT, 'Ces affleurements servaient déjà à alimenter des lampes.'),
    ),
    fait(
      'Quel groupe de quatre pays domine la moitié de la production mondiale de pétrole ?',
      'les États-Unis, la Russie, l’Arabie saoudite et le Canada',
      [
        ['la France, l’Italie, l’Espagne et le Portugal', 'Ces pays ne sont pas cités parmi les grands producteurs.'],
        ['le Japon, la Suisse, l’Autriche et la Belgique', 'Ces pays ne sont pas de grands producteurs de pétrole.'],
        [
          'le Venezuela, l’Iran, l’Irak et le Nigeria',
          'Certains ont d’importantes réserves, mais ce n’est pas le groupe cité pour la moitié de la production.',
        ],
      ],
      [
        'La moitié de la production mondiale de pétrole est dominée par les États-Unis, la Russie, l’Arabie saoudite et le ',
        '.',
        ['Canada'],
      ],
      preuve(PETROLE, R_PRODUCTION, 'Produire beaucoup n’est pas la même chose que détenir de grandes réserves.'),
    ),
    fait(
      'Combien d’États contrôlent environ 62 % des réserves mondiales de pétrole ?',
      'cinq',
      [
        ['un seul', 'Les réserves sont concentrées, mais entre plusieurs États.'],
        ['cinquante', 'La concentration est bien plus forte.'],
        ['tous les États à parts égales', 'Les réserves sont très inégalement réparties.'],
      ],
      ['Environ 62 % des réserves de pétrole sont contrôlées par ', ' États.', ['cinq', '5']],
      preuve(PETROLE, R_RESERVES_PETROLE, 'Venezuela, Arabie saoudite, Canada, Iran et Irak.'),
    ),
    fait(
      'Où l’exploitation du pétrole offshore débute-t-elle, dans les années 1950 ?',
      'dans le golfe du Mexique',
      [
        ['en mer du Nord', 'La mer du Nord vient ensuite, dans les années 1970.'],
        ['dans le désert du Sahara', 'Offshore signifie en mer.'],
        ['dans le lac Léman', '« Offshore » signifie en mer : un lac n’est pas la mer.'],
      ],
      ['L’exploitation offshore débute dans le golfe du ', ' dans les années 1950.', ['Mexique']],
      preuve(PETROLE, R_OFFSHORE, 'Puis elle s’étend en mer du Nord.'),
    ),
    fait(
      'Par rapport aux hydrocarbures, comment les gisements de charbon sont-ils répartis ?',
      'beaucoup mieux : on en trouve dans plus de 70 pays',
      [
        ['beaucoup moins bien : un seul pays en possède', 'La source parle de plus de 70 pays.'],
        ['uniquement en mer', 'Le charbon se trouve dans le sous-sol, en gisements.'],
        ['seulement dans les pôles', 'Des gisements existent sur plusieurs continents.'],
      ],
      ['Des gisements de charbon sont présents dans plus de ', ' pays.', ['70', 'soixante-dix']],
      preuve(CHARBON, R_CHARBON, 'Cette répartition plus large distingue le charbon du pétrole et du gaz.'),
    ),
    fait(
      'En quelle année l’OPEP a-t-elle été fondée ?',
      'en 1960',
      [
        ['en 1815', 'Le pétrole n’était pas encore une industrie mondiale.'],
        ['en 2015', '2015 est l’année des objectifs de développement durable et de l’accord de Paris.'],
        ['en 1900', 'L’organisation est plus récente.'],
      ],
      ['L’OPEP a été fondée en ', '.', ['1960']],
      preuve(OPEP, R_OPEP, 'Elle regroupe des pays exportateurs pour peser sur les prix.'),
    ),
    fait(
      'Dans quelle ville est le siège de l’OPEP ?',
      'à Vienne, en Autriche',
      [
        ['à Riyad, en Arabie saoudite', 'L’Arabie saoudite est membre, mais le siège est ailleurs.'],
        ['à New York', 'New York accueille le siège de l’ONU, pas celui de l’OPEP.'],
        ['à Caracas, au Venezuela', 'Le Venezuela est fondateur, mais le siège est ailleurs.'],
      ],
      ['Le siège de l’OPEP est à ', ', en Autriche.', ['Vienne']],
      preuve(OPEP, R_SIEGE, 'L’Autriche était un pays neutre pendant la Guerre froide.'),
    ),
    fait(
      'Dans quel type de produit le lithium est-il surtout indispensable aujourd’hui ?',
      'les batteries électriques',
      [
        ['les carburants des avions', 'Les carburants viennent surtout du pétrole.'],
        [
          'les engrais des champs',
          'Les engrais ne sont pas l’usage principal : pense aux téléphones et aux voitures électriques.',
        ],
        [
          'les tuiles des toits',
          'Les tuiles ne sont pas l’usage principal : pense aux objets qui stockent de l’électricité.',
        ],
      ],
      ['Le lithium est surtout indispensable dans les ', ' électriques.', ['batteries', 'batterie']],
      preuve(LITHIUM, R_BATTERIES, 'Les téléphones et les voitures électriques en ont besoin.'),
    ),
    fait(
      'Quelle part de la production aquacole mondiale l’Asie fournit-elle ?',
      'environ les neuf dixièmes',
      [
        ['environ un dixième', 'C’est l’inverse : l’Asie domine très largement.'],
        ['environ la moitié', 'La part est bien plus forte.'],
        ['aucune', 'L’Asie est la première région productrice.'],
      ],
      ['L’Asie produit les ', ' dixièmes de la production aquacole.', ['neuf', '9']],
      preuve(AQUACULTURE, R_AQUACULTURE, 'La Chine est le premier producteur.'),
    ),
    fait(
      'Qui dispose des droits exclusifs sur les ressources d’une zone économique exclusive ?',
      'l’État riverain',
      [
        ['n’importe quel bateau', 'La ZEE réserve l’exploitation à un État riverain.'],
        ['l’ONU seule', 'L’ONU a défini les règles, mais ce sont les riverains qui exploitent.'],
        ['les pays sans littoral', 'La zone borde les côtes d’un État riverain.'],
      ],
      ['Dans une ZEE, l’exploitation des ressources revient à l’État ', '.', ['riverain', 'côtier', 'cotier']],
      preuve(ZEE, R_ZEE, 'Cette règle fait des ZEE un enjeu géopolitique.'),
    ),
  ],
  paires3: [
    ['Lithium', 'Altiplano des Andes'],
    ['Aquaculture', 'Asie en tête'],
    ['Charbon', 'plus de 70 pays'],
  ],
  paires5: [
    ['Niger', 'uranium'],
    ['Nouvelle-Calédonie', 'nickel'],
    ['République démocratique du Congo', 'diamants'],
    ['Russie', 'hydrocarbures'],
    ['Altiplano des Andes', 'lithium'],
  ],
  libres: [
    libre(
      'quel métal utilisé dans les batteries a ses principaux gisements dans l’Altiplano des Andes ?',
      noms('lithium', 'le ', 'du '),
      [
        ['uranium', 'La source cite l’uranium pour le Niger et le Tchad.'],
        ['nickel', 'La source cite le nickel pour la Nouvelle-Calédonie.'],
      ],
      preuve(LITHIUM, R_ANDES, 'C’est le lithium.'),
    ),
    libre(
      'quelle organisation de pays exportateurs de pétrole, désignée par un sigle, a été fondée en 1960 ?',
      ['OPEP', 'l’OPEP', 'Opep', 'l’Opep'],
      [
        ['ONU', 'L’ONU est l’Organisation des Nations Unies.'],
        ['UE', 'L’UE est l’Union européenne.'],
      ],
      preuve(OPEP, R_OPEP, 'C’est l’OPEP.'),
    ),
    libre(
      'comment appelle-t-on la bande de mer où un État riverain a seul le droit d’exploiter les ressources ?',
      [
        'zone économique exclusive',
        'la zone économique exclusive',
        'une zone économique exclusive',
        'zone economique exclusive',
        'ZEE',
        'la ZEE',
        'une ZEE',
      ],
      [
        ['haute mer', 'La haute mer est hors des droits exclusifs d’un État.'],
        ['littoral', 'Le littoral est la zone de contact entre la terre et la mer.'],
      ],
      preuve(ZEE, R_ZEE, 'C’est la zone économique exclusive (ZEE).'),
    ),
    libre(
      'quel nom donne-t-on à la partie des ressources que l’on peut récupérer avec les techniques et les coûts du moment ?',
      [...noms('réserves', 'les ', 'des '), ...noms('réserve', 'la ', 'une ')],
      [
        ['ressources', 'La ressource inclut aussi ce qui n’est pas encore exploitable.'],
        ['consommation', 'La consommation est ce qu’on utilise.'],
      ],
      preuve(RESERVES, R_RESERVE, 'Les réserves sont les ressources récupérables aujourd’hui.'),
    ),
    libre(
      'quel adjectif anglais désigne l’exploitation du pétrole en mer ?',
      ['offshore', 'off-shore', 'off shore', 'en offshore'],
      [
        ['onshore', 'Onshore désigne au contraire l’exploitation à terre.'],
        ['fossile', 'Fossile désigne la famille d’énergie, pas le lieu en mer.'],
      ],
      preuve(PETROLE, R_OFFSHORE, 'On parle d’exploitation offshore.'),
    ),
  ],
  docs: [
    {
      title: 'Des batteries pour les voitures',
      lines: [
        'Une entreprise fabrique des batteries pour des voitures électriques.',
        'Elle cherche un métal extrait de lacs de sel, dans une région de montagne d’Amérique du Sud.',
        'Le Chili, l’Argentine et la Bolivie sont cités dans son rapport.',
      ],
      qs: [
        question(
          'De quel métal l’entreprise a-t-elle besoin ?',
          'le lithium',
          [
            ['le charbon', 'Le charbon est une roche combustible, pas ce métal.'],
            ['le nickel de Nouvelle-Calédonie', 'La Nouvelle-Calédonie est en Océanie.'],
          ],
          preuve(LITHIUM, R_ANDES, 'Les principaux gisements sont dans l’Altiplano des Andes.'),
        ),
        question(
          'Dans quel objet ce métal est-il surtout indispensable ?',
          'les batteries électriques',
          [
            ['les pneus', 'Le lithium sert surtout aux batteries électriques, pas aux pneus.'],
            ['le papier', 'Le lithium sert surtout aux batteries électriques, pas au papier.'],
          ],
          preuve(LITHIUM, R_BATTERIES, 'La demande a beaucoup augmenté avec ces batteries.'),
        ),
      ],
    },
    {
      title: 'Un conflit en mer',
      lines: [
        'Deux États voisins se disputent une bande de mer riche en poissons et en hydrocarbures.',
        'Chacun veut que cette bande fasse partie de l’espace où il exploite seul les ressources.',
      ],
      qs: [
        question(
          'Comment appelle-t-on cet espace ?',
          'une zone économique exclusive',
          [
            ['un front pionnier', 'Un front pionnier est un espace de mise en valeur nouvelle.'],
            ['un foyer de peuplement', 'Un foyer concerne la population.'],
          ],
          preuve(ZEE, R_ZEE, 'La ZEE donne à un État riverain des droits exclusifs sur les ressources.'),
        ),
        question(
          'Que gagnera l’État à qui cet espace sera reconnu ?',
          'le droit d’exploiter seul ses ressources',
          [
            [
              'l’obligation de laisser tous les bateaux y exploiter les ressources',
              'Le texte parle d’un seul exploitant.',
            ],
            ['de nouveaux habitants installés sur la mer', 'La dispute porte sur des poissons et des hydrocarbures.'],
          ],
          preuve(ZEE, R_ZEE, 'La zone donne à un État riverain l’exclusivité de l’exploitation.'),
        ),
      ],
    },
    {
      title: 'Une richesse qui ne profite pas à tous',
      lines: [
        'Dans un pays imaginaire, le pétrole apporte presque tout l’argent des ventes à l’étranger.',
        'Un petit groupe de personnes garde la plus grande partie de cet argent.',
        'Les usines et les fermes du pays sont délaissées : leur activité recule.',
      ],
      qs: [
        question(
          'Comment les géographes appellent-ils les effets négatifs liés à l’exploitation d’une telle richesse ?',
          'la malédiction des ressources',
          [
            ['la transition démographique', 'La transition démographique concerne la population.'],
            ['le développement durable', 'Le texte décrit au contraire des effets négatifs.'],
          ],
          preuve(MALEDICTION, R_MALEDICTION_DEF, 'On parle de « malédiction des ressources ».'),
        ),
        question(
          'À qui profite surtout l’argent du pétrole dans ce pays ?',
          'à un petit groupe de personnes',
          [
            ['à tous les habitants à parts égales', 'Le texte dit qu’un petit groupe en garde la plus grande partie.'],
            ['surtout aux familles des fermes', 'Les fermes sont délaissées : leur activité recule.'],
          ],
          preuve(MALEDICTION, R_ACCAPAREMENT, 'Un groupe peut s’emparer de la richesse tirée d’une ressource.'),
        ),
        question(
          'Que deviennent les autres secteurs de l’économie, comme les usines et les fermes ?',
          'leur activité recule',
          [
            ['ils se développent aussi vite que le pétrole', 'Le texte dit qu’ils sont délaissés.'],
            ['ils remplacent le pétrole dans les ventes à l’étranger', 'Le pétrole apporte presque tout cet argent.'],
          ],
          preuve(
            MALEDICTION,
            R_AUTRES_SECTEURS,
            'Quand une ressource prend toute la place, les autres activités peinent à se développer.',
          ),
        ),
      ],
    },
  ],
  sources: [CHARBON, PETROLE, LITHIUM, MALEDICTION],
  carte: carteLieux([RESSOURCES_PRINCIPALES, RESSOURCES_RARES], 'du repère'),
};

// ——— Notion 4 : le vocabulaire de la géographie de 5e ———

const V_RESSOURCE = "il n'y a pas de ressource sans besoin des sociétés";
const V_DURABLE =
  'mode de développement qui répond aux besoins du présent sans compromettre la capacité des générations futures de répondre aux leurs';
const V_TRANSITION =
  "La transition démographique est le passage d'une situation dite d'ancien régime démographique, caractérisée par une natalité et mortalité élevées, à une situation dite de nouveau régime démographique dans lequel la natalité et la mortalité sont basses";
const V_SOLDE =
  'Le solde naturel, ou parfois le bilan naturel, désigne la différence entre le taux brut de natalité et le taux brut de mortalité pour une population étudiée';
const V_IDH = 'L’indice de développement humain (IDH) est un indice composite';
const V_IDH_DIMENSIONS =
  'vivre une vie longue et en bonne santé, acquérir des connaissances et jouir d’un niveau de vie décent';
const V_SECURITE =
  'la sécurité alimentaire existe lorsque tous les êtres humains ont, à tout moment, un accès physique et économique à une nourriture suffisante, saine et nutritive';
const V_RENOUVELABLE =
  'Une énergie est dite renouvelable lorsqu’elle est dérivée de processus naturels en perpétuel renouvellement';
const V_RISQUE = "un risque est la possibilité qu'un aléa se produise et touche une population vulnérable à cet aléa";
const V_VULNERABILITE =
  "La vulnérabilité exprime le niveau d'effet prévisible d'un phénomène naturel (un aléa) sur des enjeux";
const V_RESILIENCE = 'La résilience est la capacité d’un système à revenir à son état initial après avoir été perturbé';
const V_ADAPTATION =
  "la faculté d'un système, par exemple économique, d’un territoire ou d’une population, à ajuster ses mécanismes et sa structure pour tenir compte des changements environnementaux réels, potentiels ou supposés";
const V_PREVENTION =
  'La prévention a pour but d’anticiper la manifestation éventuelle d’un risque en limitant ses effets destructeurs';

const vocabulaire: Notion = {
  classe: '5e',
  id: 'g5-vocabulaire',
  title: 'Le vocabulaire de la géographie de 5e',
  hint: 'Cherche le mot-clé de la définition : population, développement, ressource ou risque.',
  memo: [
    'Population : le **solde naturel** compare naissances et décès ; la **transition démographique** fait passer de taux élevés à des taux bas.',
    'Développement : l’**IDH** mêle santé, éducation et niveau de vie ; le **développement durable** pense aussi aux générations futures. La **sécurité alimentaire** vise une nourriture suffisante pour tous.',
    'Risques : il y a un **risque** quand un **aléa** peut se produire et toucher une population vulnérable. La prévention agit avant, l’adaptation ajuste les façons de faire, la **résilience** aide à se relever.',
    'Ressources : il n’y a pas de ressource sans besoin des sociétés. Une énergie renouvelable vient de processus naturels qui se renouvellent sans cesse.',
  ],
  faits: [
    fait(
      'Quel terme désigne la différence entre le taux de natalité et le taux de mortalité ?',
      'le solde naturel',
      [
        ['le solde migratoire', 'Il concerne les arrivées et les départs.'],
        ['la densité', 'La densité rapporte les habitants à la surface.'],
        ['l’indice de développement humain', 'L’IDH mesure le développement.'],
      ],
      ['La différence entre natalité et mortalité est le solde ', '.', ['naturel']],
      preuve(SOLDE, V_SOLDE, 'Un solde positif signifie plus de naissances que de décès.'),
    ),
    fait(
      'Comment nomme-t-on le passage d’une natalité et d’une mortalité élevées à des taux bas ?',
      'la transition démographique',
      [
        ['la transition énergétique', 'Elle concerne les sources d’énergie.'],
        ['l’exode rural', 'C’est le départ des campagnes vers les villes.'],
        ['la migration', 'Une migration est un déplacement de population.'],
      ],
      [
        'Le passage à des taux bas de natalité et de mortalité est la transition ',
        '.',
        ['démographique', 'demographique'],
      ],
      preuve(
        TRANSITION,
        V_TRANSITION,
        'La natalité baisse après la mortalité : la population augmente vite entre les deux.',
      ),
    ),
    fait(
      'Quel indice composite mesure le développement humain ?',
      'l’IDH',
      [
        ['le PIB', 'Le PIB mesure la richesse produite.'],
        ['l’ICU', 'L’îlot de chaleur urbain concerne le climat des villes.'],
        ['le solde naturel', 'Il compare naissances et décès.'],
      ],
      ['L’indice de développement humain est abrégé par le sigle ', '.', ['IDH', 'idh']],
      preuve(IDH, V_IDH, 'Un indice composite combine plusieurs indicateurs.'),
    ),
    fait(
      'Quels trois domaines l’IDH prend-il en compte ?',
      'la santé, les connaissances et le niveau de vie',
      [
        ['la surface, le relief et le climat', 'Ce sont des caractères physiques du territoire.'],
        ['le pétrole, le gaz et le charbon', 'Ce sont des ressources énergétiques.'],
        ['les routes, les ports et les gares', 'Ce sont des infrastructures de transport.'],
      ],
      ['L’IDH tient compte de la santé, des connaissances et du niveau de ', '.', ['vie']],
      preuve(IDH, V_IDH_DIMENSIONS, 'Il dépasse la seule mesure de la richesse.'),
    ),
    fait(
      'Que cherche le développement durable ?',
      'répondre aux besoins du présent sans compromettre ceux des générations futures',
      [
        ['consommer tout de suite toutes les ressources', 'Cela priverait les générations futures.'],
        ['arrêter toute activité humaine', 'Il vise à répondre aux besoins présents.'],
        ['réserver les ressources à un seul pays', 'La définition porte sur les besoins présents et futurs.'],
      ],
      [
        'Le développement durable ne compromet pas la capacité des générations ',
        ' à répondre à leurs besoins.',
        ['futures'],
      ],
      preuve(DURABLE, V_DURABLE, 'Il relie le présent et l’avenir.'),
    ),
    fait(
      'Quand la sécurité alimentaire existe-t-elle ?',
      'quand tous ont accès à une nourriture suffisante, saine et nutritive',
      [
        ['quand les supermarchés sont gardés', 'Le mot désigne l’accès à la nourriture, pas la surveillance.'],
        ['quand une partie de la population mange à sa faim', 'La définition concerne tous les êtres humains.'],
        ['quand on interdit toute importation', 'La définition porte sur l’accès, pas sur le commerce.'],
      ],
      ['La sécurité ', ' vise une nourriture suffisante, saine et nutritive pour tous.', ['alimentaire']],
      preuve(SECURITE, V_SECURITE, 'L’accès doit être physique et économique.'),
    ),
    fait(
      'Qu’est-ce qu’une énergie renouvelable ?',
      'une énergie issue de processus naturels qui se renouvellent sans cesse',
      [
        ['une énergie tirée d’un stock qui s’épuise', 'C’est le cas des énergies fossiles.'],
        ['une énergie que l’on achète deux fois', 'Le mot renvoie au renouvellement naturel.'],
        ['une énergie réservée à l’industrie', 'La définition ne dépend pas de l’utilisateur.'],
      ],
      ['Une énergie issue de processus naturels qui se renouvellent est ', '.', ['renouvelable']],
      preuve(RENOUVELABLE, V_RENOUVELABLE, 'Le soleil et le vent en sont des sources.'),
    ),
    fait(
      'Quand parle-t-on de risque ?',
      'quand un aléa peut se produire et toucher une population vulnérable',
      [
        ['quand un aléa ne touche aucune population', 'Sans population exposée, il n’y a pas de risque.'],
        ['quand la catastrophe est terminée', 'Le risque est une possibilité, avant l’événement.'],
        ['quand le temps est ensoleillé', 'Le risque suppose un aléa et une population vulnérable.'],
      ],
      ['Un risque suppose un ', ' et une population vulnérable.', ['aléa', 'alea']],
      preuve(RISQUE, V_RISQUE, 'Les deux ingrédients sont l’aléa et la vulnérabilité.'),
    ),
    fait(
      'Qu’exprime la vulnérabilité ?',
      'le niveau d’effet prévisible d’un aléa sur des enjeux',
      [
        ['la force du vent seule', 'La force d’un phénomène caractérise l’aléa.'],
        ['la date d’une catastrophe', 'La vulnérabilité mesure un effet prévisible.'],
        ['le nombre de secouristes', 'Les secours ne définissent pas la vulnérabilité.'],
      ],
      ['La ', ' exprime l’effet prévisible d’un aléa sur des enjeux.', ['vulnérabilité', 'vulnerabilite']],
      preuve(VULNERABILITE, V_VULNERABILITE, 'Plus les enjeux sont fragiles, plus l’effet est fort.'),
    ),
    fait(
      'Qu’est-ce que la résilience ?',
      'la capacité à revenir à son état initial après une perturbation',
      [
        ['la capacité à empêcher tout aléa', 'On ne peut pas empêcher tous les aléas.'],
        ['la destruction d’un territoire', 'La résilience désigne au contraire la capacité à se relever.'],
        ['le calcul d’un taux de natalité', 'Cela concerne la population, pas le risque.'],
      ],
      ['La ', ' est la capacité à revenir à son état initial après une perturbation.', ['résilience', 'resilience']],
      preuve(RESILIENCE, V_RESILIENCE, 'Un territoire résilient se relève après un choc.'),
    ),
    fait(
      'Quel est le but de la prévention ?',
      'anticiper un risque pour limiter ses effets destructeurs',
      [
        ['attendre la catastrophe pour réagir', 'La prévention agit avant.'],
        ['provoquer un aléa pour l’étudier', 'La prévention cherche à limiter les effets.'],
        ['cacher l’existence du risque', 'La prévention anticipe au lieu de cacher.'],
      ],
      ['La ', ' anticipe un risque en limitant ses effets.', ['prévention', 'prevention']],
      preuve(PREVENTION, V_PREVENTION, 'On agit avant que le risque ne se réalise.'),
    ),
  ],
  paires3: [
    ['Solde naturel', 'naissances moins décès'],
    ['IDH', 'mesure du développement humain'],
    ['Résilience', 'capacité à se relever'],
  ],
  paires5: [
    ['Transition démographique', 'passage à des taux bas'],
    ['Développement durable', 'penser aux générations futures'],
    ['Vulnérabilité', 'effet prévisible d’un aléa'],
    ['Énergie renouvelable', 'processus naturel sans cesse renouvelé'],
    ['Sécurité alimentaire', 'nourriture suffisante pour tous'],
  ],
  libres: [
    libre(
      'quel mot désigne la capacité d’un système à revenir à son état initial après une perturbation ?',
      noms('résilience', 'la ', 'une '),
      [
        ['résistance', 'La résistance cherche à s’opposer à l’aléa.'],
        ['vulnérabilité', 'La vulnérabilité désigne la fragilité face à un effet.'],
      ],
      preuve(RESILIENCE, V_RESILIENCE, 'C’est la résilience.'),
    ),
    libre(
      'quel mot désigne la faculté d’un territoire ou d’une population à s’ajuster aux changements environnementaux ?',
      [...noms('adaptation', 'l’', 'une '), ...noms('adaptabilité', 'l’', 'une ')],
      [
        ['prévision', 'La prévision cherche à annoncer ce qui va se produire.'],
        ['résilience', 'La résilience est la capacité à revenir à l’état initial ; ici, on change sa façon de faire.'],
        ['catastrophe', 'La catastrophe est la réalisation d’un risque.'],
      ],
      preuve(ADAPTATION, V_ADAPTATION, 'On parle d’adaptation (ou d’adaptabilité).'),
    ),
    libre(
      'quel est le sigle de l’indice qui mesure le développement humain ?',
      ['IDH', 'l’IDH', 'idh'],
      [
        ['PIB', 'Le PIB mesure la richesse produite.'],
        ['ODD', 'Les ODD sont les objectifs de développement durable.'],
      ],
      preuve(IDH, V_IDH, 'C’est l’IDH.'),
    ),
    libre(
      'comment qualifie-t-on le développement qui répond aux besoins présents sans priver les générations futures ?',
      [
        'durable',
        'développement durable',
        'le développement durable',
        'developpement durable',
        'soutenable',
        'développement soutenable',
      ],
      [
        ['rapide', 'La vitesse n’est pas le critère de cette définition.'],
        ['émergent', 'L’émergence désigne une intégration à l’économie mondiale.'],
      ],
      preuve(DURABLE, V_DURABLE, 'On parle de développement durable.'),
    ),
    libre(
      'quel mot de six lettres complète la phrase « il n’y a pas de ressource sans … des sociétés » ?',
      ['besoin', 'un besoin', 'le besoin', 'besoins', 'les besoins', 'des besoins'],
      [
        ['frontière', 'La définition ne parle pas de frontière.'],
        ['climat', 'La définition lie la ressource à ce que les sociétés demandent.'],
      ],
      preuve(RESSOURCE, V_RESSOURCE, 'Ce sont les besoins des sociétés qui font la ressource.'),
    ),
  ],
  docs: [
    {
      title: 'Après l’inondation',
      lines: [
        'Une ville a été inondée.',
        'Elle avait prévu des plans, déplacé ses réserves et averti les habitants.',
        'Quelques mois plus tard, les écoles et les commerces fonctionnent de nouveau.',
      ],
      qs: [
        question(
          'Quel mot désigne cette capacité à repartir après la perturbation ?',
          'la résilience',
          [
            ['l’aléa', 'L’aléa est le phénomène possible, ici l’inondation.'],
            ['la natalité', 'La natalité concerne les naissances.'],
          ],
          preuve(RESILIENCE, V_RESILIENCE, 'La ville retrouve son fonctionnement : elle est résiliente.'),
        ),
        question(
          'Quel mot désigne les actions menées avant pour limiter les dégâts ?',
          'la prévention',
          [
            ['la transition démographique', 'Elle concerne la natalité et la mortalité.'],
            ['la salinisation', 'La salinisation concerne le sel dans les sols.'],
          ],
          preuve(PREVENTION, V_PREVENTION, 'La prévention anticipe le risque.'),
        ),
      ],
    },
    {
      title: 'Comparer deux pays',
      lines: [
        'Un rapport compare deux pays qui produisent une richesse proche.',
        'Dans le premier, les habitants vivent plus longtemps et vont plus longtemps à l’école.',
        'L’auteur choisit un indice qui combine santé, éducation et niveau de vie.',
      ],
      qs: [
        question(
          'Quel indice l’auteur a-t-il choisi ?',
          'l’IDH',
          [
            ['le solde naturel', 'Il ne compare que les naissances et les décès.'],
            ['le bouquet énergétique', 'Il décrit les sources d’énergie consommées.'],
          ],
          preuve(IDH, V_IDH_DIMENSIONS, 'L’IDH combine ces trois dimensions.'),
        ),
        question(
          'Quelle dimension le texte évoque-t-il avec « vivre plus longtemps » ?',
          'la santé',
          [
            ['les transports', 'Les transports ne font pas partie des trois dimensions.'],
            ['le relief', 'Le relief n’est pas une dimension de l’IDH.'],
          ],
          preuve(IDH, V_IDH_DIMENSIONS, 'Une vie longue et en bonne santé est la première dimension.'),
        ),
      ],
    },
    {
      title: 'L’énergie d’une île',
      lines: [
        'Une île installe des éoliennes et des panneaux solaires.',
        'Le vent et le soleil reviennent sans cesse.',
        'Les élus veulent aussi penser aux habitants qui naîtront plus tard.',
      ],
      qs: [
        question(
          'Quel qualificatif convient à ces sources d’énergie ?',
          'renouvelables',
          [
            ['fossiles', 'Les énergies fossiles viennent de stocks qui s’épuisent.'],
            ['vulnérables', 'La vulnérabilité concerne les effets d’un aléa.'],
          ],
          preuve(RENOUVELABLE, V_RENOUVELABLE, 'Le vent et le soleil sont des processus naturels renouvelés.'),
        ),
        question(
          'Quelle idée correspond au souci des habitants futurs ?',
          'le développement durable',
          [
            ['le solde naturel', 'Il mesure la différence entre naissances et décès.'],
            ['la prévision météo', 'Elle annonce le temps à venir.'],
          ],
          preuve(DURABLE, V_DURABLE, 'Il tient compte des générations futures.'),
        ),
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [cartes, foyers, ressources, vocabulaire];
export const SKILLS: readonly Skill[] = NOTIONS.map(notion);
