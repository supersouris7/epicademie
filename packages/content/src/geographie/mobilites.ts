import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Quatrième, thème 2 « Les mobilités humaines transnationales » (lot ge-4e-02) : un monde de migrants, le tourisme et
 * ses espaces, vocabulaire. Chaque fait cite une source du registre avec sa citation exacte : programme du cycle 4,
 * glossaire de Géoconfluences (ENS de Lyon, DGESCO) et Union européenne (Erasmus+). Les textes à lire du niveau 5
 * sont écrits pour l’exercice (personnes désignées par une lettre, lieux fictifs).
 */

const MIGRANT = 'geoconfluences-migrant';
const MIGRATION = 'geoconfluences-migration';
const INTERNATIONALES = 'geoconfluences-migrations-internationales';
const REFUGIE = 'geoconfluences-refugie';
const ASILE = 'geoconfluences-demandeur-asile';
const DEPLACE = 'geoconfluences-deplace';
const DIASPORA = 'geoconfluences-diaspora';
const PUSH = 'geoconfluences-pull-and-push';
const MOBILITE = 'geoconfluences-mobilite';
const TOURISME = 'geoconfluences-tourisme';
const TOURISTE = 'geoconfluences-touriste';
const EXCURSION = 'geoconfluences-excursionnisme';
const MASSE = 'geoconfluences-tourisme-de-masse';
const DURABLE = 'geoconfluences-tourisme-durable';
const MISE = 'geoconfluences-mise-en-tourisme';
const SITE = 'geoconfluences-site-touristique';
const COMPTOIR = 'geoconfluences-comptoir-touristique';
const STATION = 'geoconfluences-station-touristique';
const SURTOURISME = 'geoconfluences-surtourisme';
const ERASMUS = 'ue-erasmus-plus';

// Programme du cycle 4, géographie, classe de 4e, thème 2.
const P_MOTIFS =
  'Les migrations transnationales, dont les motivations peuvent être extrêmement variées (Erasmus, suite de conflits, crise climatique, raisons économiques, etc.)';
const P_SUDS =
  'cette géographie des migrations n’est pas centrée sur la seule Europe, ni marquée par les seuls mouvements des « Suds » vers les « Nords », mais comporte aussi des foyers de migrations intracontinentales sud-sud';
const P_MASSIF =
  'Quant au tourisme international, il constitue désormais le mouvement de population le plus massif que le monde ait jamais connu';
const P_EFFETS = 'il est porteur d’effets économiques, sociaux, territoriaux et environnementaux très importants';

// Migrations.
const G_INED = 'des personnes installées dans un pays différent de celui où elles sont nées';
const G_281 = 'représentaient 281 millions de personnes, soit 3,6 % de la population mondiale';
const G_CONTINENTS = 'L’Asie et l’Europe sont les deux continents où vivent le plus de migrants internationaux';
const G_PARTIE =
  'elles ne représentent qu’une partie de l’ensemble des migrations internationales, sans parler de l’ensemble des migrations';
const G_ARGENT = 'remises d’argent (rémitances)';
const G_REFUGIE =
  'une personne qui se trouve hors du pays dont elle a la nationalité ou dans lequel elle a sa résidence habituelle';
const G_PERSECUTE = 'craint avec raison d’être persécutée';
const G_RENVOI = 'le réfugié ne peut être renvoyé dans son pays d’origine';
const G_DEPLACES =
  'les victimes d’un conflit, qui se déplacent en restant au sein de leur pays sont appelées les déplacés';
const G_PREMIER =
  'Plus des 2/3 des réfugiés dans le monde résident dans des pays dits de « premier accueil » localisés dans des pays du Sud';
const G_ENV = 'L’immense majorité de ces personnes restent dans le même pays';
const G_PUSH =
  'Le push est le phénomène provoquant le départ d’une personne ou d’une population hors de son pays d’origine';
const G_PULL = 'le pull est un phénomène attirant des migrants vers leur destination';
const G_ECONOMIE = 'la cause économique est un des principaux facteurs des migrations internationales';
const G_ERASMUS = 'Erasmus+ offre des possibilités de mobilité et de coopération dans';

// Tourisme.
const G_TOURISME = 'tout voyage hors du domicile habituel pour au moins une nuit et au plus un an, et pour tout motif';
const G_DOMESTIQUE = 'le tourisme domestique reste largement supérieur au tourisme international, à l’échelle mondiale';
const G_MEDITERRANEE = 'Le bassin méditerranéen est, de loin, la première région touristique du monde';
const G_COTES = 'Le tourisme en Méditerranée reste essentiellement concentré sur les bandes côtières';
const G_ARTIFICIEL = 'alimenter la pression sur les littoraux et à provoquer leur artificialisation';
const G_RETOMBEES = 'bénéficient donc relativement peu des retombées du tourisme international';
const G_EAU = 'gestion des déchets, approvisionnements en eau concentrés en pleine période de sécheresse estivale';
const G_STATION = 'les stations touristiques sont en effet créées par et pour les touristes';
const G_OUVERT = 'la station est un lieu ouvert, habitée par une population permanente';
const G_SITE = 'Un site touristique est un lieu de passage, mais non de séjour';
const G_COMPTOIR =
  'C’est un lieu fermé où s’applique une réglementation spécifique et au sein duquel la fonction d’hébergement est essentielle';
const G_MISE =
  'La mise en tourisme est le processus de création d’un lieu touristique ou de transformation d’un lieu ancien par le tourisme';
const G_SUR = 'désigne les effets négatifs produits par une fréquentation touristique excessive dans certains lieux';
const G_VENISE = 'Le centre historique de Venise';
const G_HABITANTS = 'au détriment de la qualité de vie des résidents';
const G_DURABLE =
  'qui tient pleinement compte de ses impacts économiques, sociaux et environnementaux actuels et futurs';

// Vocabulaire.
const G_MIGRATION = 'La migration est le fait de changer de domicile pour une durée longue ou définitive';
const G_IMMIGRE =
  'Il devient immigré lorsqu’il s’installe dans un pays tiers (et un émigré du point de vue du pays de départ)';
const G_ASILE = 'qui sont en attente de l’octroi du statut de réfugié';
const G_DEPOT =
  'ont déposé une demande d’asile arguant de leur besoin de protection à l’extérieur de leur pays d’origine';
const G_DIASPORA = 'indique la dispersion d’une population';
const G_LIENS =
  'des échanges matériels et immatériels organisés en réseaux (personnes, biens, informations, capitaux, etc.)';
const G_TOURISTE =
  'effectue au moins une nuitée sur place, ce qui le différencie de l’excursionniste qui fait l’aller-retour dans la même journée';
const G_EXCURSION = 'un déplacement de moins de 24 heures dans le cadre d’une mobilité de loisir';
const G_DUREE = 'voyage touristique, qui dure au moins deux jours, mais moins d’un an';
const G_MOBILITE = 'la mobilité désigne un changement de lieu accompli par une ou des personnes';
const G_TYPES =
  'les mobilités définitives ou de longue durée, appelées migrations (internationales si une frontière est franchie, intérieures sinon)';
const G_MASSE = 'Il met en œuvre des flux inégalés';

// ——— Notion 1 : un monde de migrants ———

const migrants: Notion = {
  classe: '4e',
  id: 'g4-monde-migrants',
  title: 'Un monde de migrants',
  hint: 'Demande-toi qui se déplace, pour quelle raison, et si une frontière est franchie.',
  memo: [
    'Un **migrant international** est installé dans un autre pays que celui où il est né : on en comptait 281 millions en 2024, soit 3,6 % de la population mondiale.',
    'Les motifs sont variés (travail, études, conflits, climat) et les flux ne vont pas que des « Suds » vers les « Nords » : il existe aussi des **migrations Sud-Sud**.',
    'Un **réfugié** a fui son pays par crainte de persécutions ; un **déplacé** interne reste dans son pays.',
  ],
  faits: [
    {
      q: 'Selon la définition citée par Géoconfluences (INED), qu’est-ce qu’un migrant international ?',
      a: 'une personne installée dans un autre pays que celui où elle est née',
      wrong: [
        {
          label: 'une personne qui visite un pays le temps de ses vacances',
          why: 'Un séjour de vacances relève du tourisme : la personne ne s’installe pas.',
        },
        {
          label: 'une personne qui change de quartier dans sa ville',
          why: 'Sans franchir de frontière, il s’agit d’une migration intérieure.',
        },
        {
          label: 'une personne qui fait chaque jour le trajet jusqu’à son travail',
          why: 'Ce trajet quotidien est une mobilité de travail, pas une installation.',
        },
      ],
      gap: ['Un migrant international est installé dans un pays ', ' de celui où il est né.', ['différent']],
      choix: ['différent', 'voisin forcément', 'plus riche forcément'],
      quote: G_INED,
      explain: 'Deux idées comptent : la personne s’est installée, et le pays n’est pas celui de sa naissance.',
      src: INTERNATIONALES,
    },
    {
      q: 'Combien de migrants internationaux comptait-on dans le monde en 2024 ?',
      a: '281 millions',
      wrong: [
        { label: '28 millions', why: 'C’est environ dix fois trop peu.' },
        { label: '2,8 milliards', why: 'C’est environ dix fois trop : la plupart des humains ne migrent pas.' },
        { label: '3,6 millions', why: '3,6 est la part en pourcentage de la population mondiale, pas le nombre.' },
      ],
      gap: ['En 2024, le monde comptait ', ' millions de migrants internationaux.', ['281']],
      choix: ['281', '28', '810'],
      quote: G_281,
      explain: 'Ce nombre représente un mouvement de très grande ampleur à l’échelle du monde.',
      src: INTERNATIONALES,
    },
    {
      q: 'En 2024, quelle part de la population mondiale les migrants internationaux représentaient-ils ?',
      a: 'environ 3,6 %',
      wrong: [
        { label: 'environ 36 %', why: 'Cela ferait plus d’une personne sur trois : c’est dix fois trop.' },
        { label: 'environ 60 %', why: 'La grande majorité des humains vivent dans leur pays de naissance.' },
        { label: 'environ 0,036 %', why: 'C’est cent fois trop peu.' },
      ],
      gap: ['Les migrants internationaux représentent environ ', ' % de la population mondiale.', ['3,6']],
      choix: ['3,6', '36', '63'],
      quote: G_281,
      explain: 'Les migrants sont nombreux, mais restent une petite minorité de la population mondiale.',
      src: INTERNATIONALES,
    },
    {
      q: 'Quelles sont les raisons des migrations transnationales ?',
      a: 'des motivations très variées : études, conflits, climat, économie',
      wrong: [
        { label: 'uniquement la guerre', why: 'Les conflits comptent, mais le programme cite bien d’autres motifs.' },
        { label: 'uniquement les vacances', why: 'Les vacances relèvent du tourisme, pas de la migration.' },
        {
          label: 'uniquement la recherche d’un travail',
          why: 'Les raisons économiques sont importantes, mais ne sont pas les seules.',
        },
      ],
      gap: ['Les motivations des migrations transnationales sont très ', '.', ['variées']],
      choix: ['variées', 'identiques', 'rares'],
      quote: P_MOTIFS,
      explain: 'Un étudiant Erasmus, une famille fuyant un conflit et un travailleur n’ont pas le même motif.',
    },
    {
      q: 'Que montre la géographie mondiale des migrations ?',
      a: 'des flux existent aussi entre pays des « Suds »',
      wrong: [
        {
          label: 'tous les migrants se dirigent vers l’Europe',
          why: 'La géographie des migrations n’est pas centrée sur la seule Europe.',
        },
        {
          label: 'les migrants vont seulement des « Suds » vers les « Nords »',
          why: 'Il existe aussi des foyers de migrations sud-sud.',
        },
        {
          label: 'les migrations ne franchissent jamais les frontières',
          why: 'Les migrations transnationales franchissent justement des frontières.',
        },
      ],
      gap: ['Il existe des foyers de migrations intracontinentales Sud-', '.', ['Sud']],
      choix: ['Sud', 'Nord', 'Est'],
      quote: P_SUDS,
      explain: 'Beaucoup de migrations se font à l’intérieur d’un même continent, entre pays des « Suds ».',
    },
    {
      q: 'Selon la Convention de Genève, où se trouve un réfugié ?',
      a: 'hors de son pays, par crainte de persécutions',
      wrong: [
        {
          label: 'dans son pays, après un changement de région',
          why: 'Une personne contrainte de partir sans quitter son pays est un déplacé.',
        },
        { label: 'à l’étranger pour des vacances', why: 'Les vacances relèvent du tourisme.' },
        {
          label: 'à l’étranger, uniquement pour gagner plus d’argent',
          why: 'Partir pour un meilleur travail ne suffit pas à obtenir le statut de réfugié.',
        },
      ],
      gap: ['Un réfugié se trouve ', ' de son pays et craint d’être persécuté.', ['hors']],
      choix: ['hors', 'au centre', 'en vacances loin'],
      quote: G_REFUGIE,
      explain: 'La définition juridique exige d’être hors de son pays et de craindre avec raison d’être persécuté.',
      src: REFUGIE,
    },
    {
      q: 'Une personne fuit un conflit mais reste à l’intérieur de son pays. Comment la désigne-t-on ?',
      a: 'un déplacé',
      wrong: [
        { label: 'un réfugié', why: 'Le réfugié a franchi une frontière internationale.' },
        { label: 'un touriste', why: 'Le touriste voyage pour un séjour temporaire choisi.' },
        { label: 'un excursionniste', why: 'L’excursionniste fait un aller-retour dans la journée.' },
      ],
      gap: ['Une victime d’un conflit qui reste dans son pays est un ', '.', ['déplacé']],
      choix: ['déplacé', 'réfugié', 'touriste'],
      quote: G_DEPLACES,
      explain: 'La frontière fait la différence : sans la franchir, la personne est déplacée.',
      src: REFUGIE,
    },
    {
      q: 'Où résident la plupart des réfugiés dans le monde ?',
      a: 'dans des pays de premier accueil situés au Sud',
      wrong: [
        {
          label: 'presque tous dans les pays de l’Union européenne',
          why: 'Plus des deux tiers sont accueillis dans des pays du Sud.',
        },
        {
          label: 'dans leur propre pays d’origine',
          why: 'Par définition, un réfugié se trouve hors de son pays.',
        },
        { label: 'sur des navires en haute mer', why: 'Les réfugiés sont accueillis dans des États.' },
      ],
      gap: ['Plus des deux tiers des réfugiés résident dans des pays du ', '.', ['Sud']],
      choix: ['Sud', 'Nord', 'pôle'],
      quote: G_PREMIER,
      explain: 'Ce sont souvent des États voisins du pays quitté : on parle de pays de premier accueil.',
      src: ASILE,
    },
    {
      q: 'Dans l’analyse des migrations, qu’appelle-t-on un facteur « push » ?',
      a: 'un phénomène qui pousse à quitter son pays',
      wrong: [
        { label: 'un phénomène qui attire vers la destination', why: 'C’est la définition du facteur « pull ».' },
        { label: 'un moyen de transport', why: '« Push » désigne une cause de départ, pas un véhicule.' },
        { label: 'une somme envoyée à la famille', why: 'Cet argent envoyé est une remise.' },
      ],
      gap: ['Le facteur qui pousse au départ est appelé facteur « ', ' ».', ['push']],
      choix: ['push', 'pull', 'hub'],
      quote: G_PUSH,
      explain: 'En anglais, to push veut dire pousser : conflit, disette ou oppression poussent à partir.',
      src: PUSH,
    },
    {
      q: 'Sur quels deux continents vivent le plus de migrants internationaux ?',
      a: 'l’Asie et l’Europe',
      wrong: [
        { label: 'l’Afrique et l’Océanie', why: 'Les deux continents cités en tête sont d’autres.' },
        { label: 'l’Océanie et l’Antarctique', why: 'Les deux continents cités en tête sont d’autres.' },
        { label: 'l’Afrique et l’Amérique du Sud', why: 'Les migrants vivent surtout sur deux autres continents.' },
      ],
      gap: ['L’Europe et l’', ' sont les continents où vivent le plus de migrants internationaux.', ['Asie']],
      choix: ['Asie', 'Océanie', 'Afrique'],
      quote: G_CONTINENTS,
      explain: 'La géographie des migrations ne concerne pas la seule Europe : l’Asie est aussi en tête.',
      src: INTERNATIONALES,
    },
    {
      q: 'Que garantit la Convention de Genève à un réfugié ?',
      a: 'il ne peut pas être renvoyé dans son pays d’origine',
      wrong: [
        { label: 'il doit retourner chez lui après un mois', why: 'Le renvoi dans le pays d’origine est interdit.' },
        { label: 'il reçoit des vacances gratuites', why: 'Le statut de réfugié est une protection, pas un séjour.' },
        { label: 'il perd toute protection à la frontière', why: 'Le statut existe justement pour le protéger.' },
      ],
      gap: ['Un réfugié ne peut pas être ', ' dans son pays d’origine.', ['renvoyé']],
      choix: ['renvoyé', 'invité', 'photographié'],
      quote: G_RENVOI,
      explain: 'Le renvoyer pourrait menacer sa vie ou sa liberté.',
      src: REFUGIE,
    },
    {
      q: 'Les personnes déplacées à cause de l’environnement partent-elles surtout à l’étranger ?',
      a: 'non, l’immense majorité restent dans leur pays',
      wrong: [
        { label: 'oui, presque toutes changent de continent', why: 'La plupart restent dans le même pays.' },
        {
          label: 'oui, elles deviennent toutes réfugiées',
          why: 'Le statut de réfugié a une définition juridique différente.',
        },
        { label: 'non, car personne n’est déplacé pour ce motif', why: 'Ces déplacements existent et augmentent.' },
      ],
      gap: ['L’immense majorité des déplacés environnementaux restent dans le même ', '.', ['pays']],
      choix: ['pays', 'bateau', 'hôtel'],
      quote: G_ENV,
      explain: 'On les compte donc surtout parmi les déplacés internes.',
      src: DEPLACE,
    },
    {
      q: 'Quelle cause est l’un des principaux facteurs des migrations internationales ?',
      a: 'la cause économique',
      wrong: [
        { label: 'le changement d’heure', why: 'Il ne fait pas migrer les populations.' },
        { label: 'l’envie de voyager un week-end', why: 'Un week-end est un séjour temporaire, pas une migration.' },
        {
          label: 'le choix d’une nouvelle monnaie',
          why: 'Le facteur cité est la recherche d’une meilleure situation.',
        },
      ],
      gap: ['La cause ', ' est un des principaux facteurs des migrations internationales.', ['économique']],
      choix: ['économique', 'astronomique', 'sportive'],
      quote: G_ECONOMIE,
      explain: 'Partir chercher une meilleure situation professionnelle est un motif majeur.',
      src: MIGRATION,
    },
  ],
  paires3: [
    ['Réfugié', 'Hors de son pays, craint des persécutions'],
    ['Déplacé interne', 'Contraint de partir sans quitter son pays'],
    ['Touriste', 'En séjour temporaire, par exemple pour ses loisirs'],
  ],
  paires5: [
    ['Réfugié', 'Hors de son pays, craint des persécutions'],
    ['Déplacé interne', 'Contraint de partir sans quitter son pays'],
    ['Facteur « push »', 'Cause qui pousse à quitter son pays'],
    ['Facteur « pull »', 'Attrait de la destination'],
    ['Remises', 'Argent envoyé vers la région de départ'],
  ],
  ordre: [
    'Quitter son pays pour chercher une protection',
    'Déposer une demande d’asile',
    'Attendre l’examen de sa demande',
    'Obtenir le statut de réfugié',
  ],
  consigne: {
    prompt: 'Voici le parcours d’une personne dont la demande d’asile est acceptée. Remets les étapes dans l’ordre.',
    hint: 'Une décision ne peut venir qu’après une demande et son examen.',
    why: 'On part, on dépose une demande, on attend, puis l’État répond : ici, la réponse est favorable.',
    fin: 'La première étape est',
    quote: G_DEPOT,
    src: ASILE,
  },
  sources: [ASILE, MIGRANT],
  libres: [
    {
      q: 'Comment appelle-t-on une personne qui, hors de son pays, craint avec raison d’y être persécutée et que protège la Convention de Genève ?',
      accepted: ['réfugié', 'un réfugié', 'le réfugié', 'réfugiée', 'une réfugiée', 'réfugiés'],
      traps: [
        { text: 'déplacé', why: 'Le déplacé interne n’a pas franchi de frontière.' },
        { text: 'touriste', why: 'Le touriste voyage librement, pour un séjour temporaire.' },
      ],
      quote: G_PERSECUTE,
      explain: 'Le statut de réfugié est une définition juridique du droit international.',
      src: REFUGIE,
    },
    {
      q: 'Comment appelle-t-on l’argent que des migrants envoient vers leur région de départ ?',
      accepted: [
        'remises',
        'les remises',
        'des remises',
        'une remise',
        'remises d’argent',
        'remises migratoires',
        'rémitances',
        'les rémitances',
        'transferts d’argent',
      ],
      traps: [
        { text: 'impôts', why: 'Un impôt est versé à un État ou à une collectivité, pas à sa famille.' },
        { text: 'salaires', why: 'Le salaire est gagné au travail ; on demande l’argent envoyé.' },
      ],
      quote: G_ARGENT,
      explain: 'Les remises relient le pays d’arrivée et la région de départ.',
      src: INTERNATIONALES,
    },
    {
      q: 'Quel mot désigne, en un seul terme, les personnes contraintes de fuir un conflit en restant dans leur pays ?',
      accepted: ['déplacés', 'les déplacés', 'des déplacés', 'un déplacé', 'déplacé', 'déplacés internes'],
      traps: [
        { text: 'réfugiés', why: 'Les réfugiés ont franchi une frontière internationale.' },
        { text: 'touristes', why: 'Les touristes ne fuient pas un conflit.' },
      ],
      quote: G_DEPLACES,
      explain: 'On parle de déplacés, ou déplacés internes.',
      src: REFUGIE,
    },
    {
      q: 'Quel programme de l’Union européenne soutient notamment la mobilité des étudiants ?',
      accepted: ['Erasmus', 'Erasmus+', 'le programme Erasmus', 'Erasmus plus', 'programme Erasmus'],
      traps: [
        { text: 'UNESCO', why: 'L’UNESCO est une organisation des Nations unies, pas un programme de l’Union.' },
        { text: 'Schengen', why: 'Schengen concerne la circulation entre États, pas un programme d’études.' },
      ],
      quote: G_ERASMUS,
      explain: 'Erasmus+ ouvre des possibilités de mobilité, notamment dans l’enseignement supérieur.',
      src: ERASMUS,
    },
    {
      q: 'Quel mot anglais désigne un facteur qui pousse à quitter son pays, comme un conflit armé ?',
      accepted: ['push', 'push factor', 'un push factor', 'facteur push', 'le facteur push', 'push factors'],
      traps: [
        { text: 'pull', why: 'Le facteur « pull » attire vers la destination.' },
        { text: 'hub', why: 'Un hub est un nœud de transport.' },
      ],
      quote: G_PUSH,
      explain: '« To push » veut dire pousser : c’est ce qui provoque le départ.',
      src: PUSH,
    },
  ],
  docs: [
    {
      title: 'Trois départs (cas fictifs)',
      lines: [
        'A étudie un semestre dans une université d’un autre pays de l’Union européenne grâce à un programme d’échange.',
        'B a fui des combats : sa famille a gagné une autre région du même pays.',
        'C a franchi la frontière par crainte d’être persécutée pour ses opinions et demande l’asile.',
      ],
      qs: [
        {
          q: 'D’après la ligne 2, comment désigner B ?',
          a: 'un déplacé interne',
          wrong: [
            { label: 'un réfugié', why: 'B n’a franchi aucune frontière.' },
            { label: 'un touriste', why: 'B fuit des combats : ce n’est pas un voyage de loisirs.' },
            { label: 'un étudiant en échange', why: 'C’est la situation de A.' },
          ],
          quote: G_DEPLACES,
          explain: 'B fuit un conflit sans quitter son pays : c’est un déplacé interne.',
          src: REFUGIE,
        },
        {
          q: 'D’après la ligne 3, quelle est la situation de C au moment de sa demande ?',
          a: 'une demandeuse d’asile',
          wrong: [
            { label: 'une déplacée interne', why: 'C a franchi une frontière.' },
            { label: 'une excursionniste', why: 'Une excursion dure moins d’une journée.' },
            {
              label: 'une réfugiée déjà reconnue',
              why: 'La demande vient d’être déposée : le statut n’est pas encore accordé.',
            },
          ],
          quote: G_ASILE,
          explain: 'Tant que la réponse n’est pas donnée, la personne est demandeuse d’asile.',
          src: ASILE,
        },
        {
          q: 'Que montrent ces trois situations réunies ?',
          a: 'les motifs de mobilité sont très variés',
          wrong: [
            { label: 'tous les départs ont la même cause', why: 'Études, combats et persécutions diffèrent.' },
            { label: 'tous les départs franchissent une frontière', why: 'B reste dans son pays.' },
            { label: 'toutes ces personnes sont des touristes', why: 'Aucune ne voyage pour des vacances.' },
          ],
          quote: P_MOTIFS,
          explain: 'Études, conflit, persécution : les motivations sont diverses.',
        },
      ],
    },
    {
      title: 'Entre Kalia et Montor (pays fictifs)',
      lines: [
        'Chaque année, des milliers d’habitants de Kalia partent travailler à Montor, le pays voisin.',
        'Kalia et Montor sont deux pays des « Suds » situés sur le même continent.',
        'Les travailleurs envoient une partie de leur salaire à leurs familles restées à Kalia.',
      ],
      qs: [
        {
          q: 'D’après les lignes 1 et 2, de quel type de flux s’agit-il ?',
          a: 'une migration Sud-Sud',
          wrong: [
            { label: 'une migration Sud-Nord', why: 'Les deux pays appartiennent aux « Suds ».' },
            { label: 'un flux touristique', why: 'Ces habitants partent travailler, pas visiter.' },
            { label: 'un déplacement interne', why: 'Ils passent d’un pays à un autre.' },
          ],
          quote: P_SUDS,
          explain: 'Deux pays des « Suds » d’un même continent : c’est une migration intracontinentale Sud-Sud.',
        },
        {
          q: 'Comment appelle-t-on l’argent décrit à la ligne 3 ?',
          a: 'des remises',
          wrong: [
            { label: 'des impôts', why: 'L’argent va aux familles, pas à un État.' },
            { label: 'des recettes touristiques', why: 'Il vient de travailleurs, pas de visiteurs.' },
            { label: 'des facteurs « push »', why: 'Un facteur « push » est une cause de départ.' },
          ],
          quote: G_ARGENT,
          explain: 'L’argent envoyé vers le pays de départ forme les remises.',
          src: INTERNATIONALES,
        },
      ],
    },
    {
      title: 'Un exposé à corriger (récit fictif)',
      lines: [
        'D affirme : « Presque tous les migrants du monde vont d’un pays pauvre vers un pays riche. »',
        'La professeure répond que ces flux existent, mais qu’ils ne sont qu’une partie des migrations internationales.',
        'Elle montre ensuite une carte avec des flux entre pays voisins d’Afrique.',
      ],
      qs: [
        {
          q: 'Pourquoi l’affirmation de la ligne 1 doit-elle être corrigée ?',
          a: 'les flux des pays précaires vers les pays favorisés ne sont qu’une partie du total',
          wrong: [
            {
              label: 'aucun migrant ne va vers un pays riche',
              why: 'La ligne 2 reconnaît que ces flux existent.',
            },
            { label: 'les migrations internationales ont disparu', why: 'Elles restent d’une grande ampleur.' },
            { label: 'les migrants restent tous dans leur pays', why: 'Les cartes montrent des franchissements.' },
          ],
          quote: G_PARTIE,
          explain: 'Les médias insistent sur un type de flux, mais il en existe beaucoup d’autres.',
          src: INTERNATIONALES,
        },
      ],
    },
  ],
};

// ——— Notion 2 : le tourisme et ses espaces ———

const tourisme: Notion = {
  classe: '4e',
  id: 'g4-tourisme-espaces',
  title: 'Le tourisme et ses espaces',
  hint: 'Observe le lieu : y dort-on, est-il ouvert ou fermé, et quels effets la fréquentation a-t-elle ?',
  memo: [
    'Le **tourisme international** est devenu le mouvement de population le plus massif de l’histoire ; le **bassin méditerranéen** est la première région touristique du monde.',
    'Les lieux diffèrent : on passe dans un **site touristique**, on séjourne dans une **station touristique** ouverte ou dans un **comptoir touristique** fermé.',
    'Le tourisme a des effets économiques, sociaux, territoriaux et environnementaux : le **surtourisme** à Venise en est un exemple, le **tourisme durable** cherche à les maîtriser.',
  ],
  faits: [
    {
      q: 'Comment le programme présente-t-il le tourisme international ?',
      a: 'le mouvement de population le plus massif de l’histoire du monde',
      wrong: [
        { label: 'un phénomène rare et en voie de disparition', why: 'Au contraire, ses flux sont immenses.' },
        { label: 'un déplacement limité à un seul continent', why: 'Il relie des pays du monde entier.' },
        { label: 'un mouvement sans effet sur les territoires', why: 'Il a de très importants effets.' },
      ],
      gap: ['Le tourisme international est le mouvement de population le plus ', ' jamais connu.', ['massif']],
      choix: ['massif', 'discret', 'ancien'],
      quote: P_MASSIF,
      explain: 'Jamais autant de personnes ne s’étaient déplacées pour des séjours temporaires.',
    },
    {
      q: 'Quels types d’effets le tourisme international produit-il ?',
      a: 'économiques, sociaux, territoriaux et environnementaux',
      wrong: [
        { label: 'uniquement économiques', why: 'Il transforme aussi les sociétés, les espaces et les milieux.' },
        { label: 'uniquement environnementaux', why: 'Ses effets touchent aussi l’économie et les habitants.' },
        { label: 'aucun effet durable', why: 'Ses effets sont très importants.' },
      ],
      gap: ['Le tourisme a des effets économiques, sociaux, territoriaux et ', '.', ['environnementaux']],
      choix: ['environnementaux', 'astronomiques', 'grammaticaux'],
      quote: P_EFFETS,
      explain: 'Il crée des revenus, mais change aussi la vie des habitants, les paysages et les milieux.',
    },
    {
      q: 'Quelle est la première région touristique du monde ?',
      a: 'le bassin méditerranéen',
      wrong: [
        { label: 'l’Antarctique', why: 'Ce n’est pas la région citée comme première.' },
        { label: 'le désert du Sahara', why: 'Ce n’est pas la région citée comme première.' },
        { label: 'les régions polaires du Nord', why: 'Ce n’est pas la région citée comme première.' },
      ],
      gap: ['Le bassin ', ' est la première région touristique du monde.', ['méditerranéen']],
      choix: ['méditerranéen', 'amazonien', 'polaire'],
      quote: G_MEDITERRANEE,
      explain: 'Les pays qui bordent la Méditerranée accueillent une très grande part des touristes.',
      src: TOURISME,
    },
    {
      q: 'Où le tourisme se concentre-t-il surtout autour de la Méditerranée ?',
      a: 'sur les bandes côtières',
      wrong: [
        { label: 'au fond de l’intérieur des terres', why: 'Le tourisme pénètre assez peu en profondeur.' },
        { label: 'uniquement en haute mer', why: 'Les séjours se concentrent sur la côte.' },
        { label: 'de façon égale sur tous les territoires', why: 'La répartition est très inégale.' },
      ],
      gap: ['Autour de la Méditerranée, le tourisme se concentre sur les bandes ', '.', ['côtières']],
      choix: ['côtières', 'montagneuses', 'désertiques'],
      quote: G_COTES,
      explain: 'La proximité de la mer attire les séjours, ce qui augmente la pression sur les littoraux.',
      src: TOURISME,
    },
    {
      q: 'Qu’est-ce qui caractérise une station touristique ?',
      a: 'un lieu créé par et pour les touristes',
      wrong: [
        {
          label: 'un lieu de passage sans hébergement',
          why: 'C’est la définition d’un site touristique.',
        },
        { label: 'un lieu interdit à tout visiteur', why: 'La station existe pour accueillir les touristes.' },
        { label: 'un lieu où l’on ne fait que travailler la terre', why: 'Ce serait un espace agricole.' },
      ],
      gap: ['Une station touristique est créée par et pour les ', '.', ['touristes']],
      choix: ['touristes', 'agriculteurs', 'douaniers'],
      quote: G_STATION,
      explain: 'L’activité touristique a créé le lieu et y garde la première place.',
      src: STATION,
    },
    {
      q: 'Comment un géographe nomme-t-il un lieu que l’on visite en passant, sans y séjourner ?',
      a: 'un site touristique',
      wrong: [
        { label: 'une station touristique', why: 'Dans une station, on séjourne.' },
        { label: 'un comptoir touristique', why: 'Dans un comptoir, l’hébergement est essentiel.' },
        { label: 'une ville-dortoir', why: 'Ce terme désigne un lieu de logement, pas de visite.' },
      ],
      gap: ['Un lieu de passage, mais non de séjour, est un ', ' touristique.', ['site']],
      choix: ['site', 'séjour', 'comptoir'],
      quote: G_SITE,
      explain: 'On le visite sans y dormir : c’est un lieu de passage.',
      src: SITE,
    },
    {
      q: 'Qu’est-ce qui distingue un comptoir touristique d’une station touristique ?',
      a: 'c’est un lieu fermé, géré avec des règles propres',
      wrong: [
        { label: 'c’est un lieu sans hébergement', why: 'L’hébergement y est au contraire essentiel.' },
        { label: 'il est ouvert à tous et habité comme une ville', why: 'C’est la station qui est un lieu ouvert.' },
        { label: 'il n’est créé pour aucun touriste', why: 'Il est créé par et pour le tourisme.' },
      ],
      gap: ['Un comptoir touristique est un lieu ', ', avec une réglementation spécifique.', ['fermé']],
      choix: ['fermé', 'ouvert', 'abandonné'],
      quote: G_COMPTOIR,
      explain: 'Le comptoir est fermé et tenu par un acteur unique ; la station reste ouverte.',
      src: COMPTOIR,
    },
    {
      q: 'Que désigne le surtourisme ?',
      a: 'les effets négatifs d’une fréquentation touristique excessive',
      wrong: [
        { label: 'un voyage qui coûte très cher', why: 'Le préfixe « sur » porte sur la fréquentation, pas le prix.' },
        { label: 'un tourisme qui respecte les milieux', why: 'C’est l’objectif du tourisme durable.' },
        { label: 'une absence totale de visiteurs', why: 'C’est l’inverse.' },
      ],
      gap: ['Le surtourisme désigne les effets négatifs d’une fréquentation touristique ', '.', ['excessive']],
      choix: ['excessive', 'nulle', 'gratuite'],
      quote: G_SUR,
      explain: 'Trop de visiteurs au même endroit peut dégrader le lieu et la vie des habitants.',
      src: SURTOURISME,
    },
    {
      q: 'Quel tourisme tient compte de ses effets économiques, sociaux et environnementaux, présents et futurs ?',
      a: 'le tourisme durable',
      wrong: [
        { label: 'le surtourisme', why: 'Le surtourisme désigne des effets négatifs excessifs.' },
        { label: 'l’excursionnisme', why: 'L’excursionnisme désigne une sortie sans nuitée.' },
        { label: 'le tourisme de masse', why: 'Il désigne l’accès du plus grand nombre au tourisme.' },
      ],
      gap: ['Le tourisme ', ' tient compte de ses impacts actuels et futurs.', ['durable']],
      choix: ['durable', 'massif', 'pendulaire'],
      quote: G_DURABLE,
      explain: 'Il répond aux besoins des visiteurs, des professionnels, de l’environnement et des habitants.',
      src: DURABLE,
    },
    {
      q: 'À l’échelle mondiale, quel tourisme est le plus important : domestique (dans son pays) ou international ?',
      a: 'le tourisme domestique, largement supérieur',
      wrong: [
        { label: 'le tourisme international, de très loin', why: 'C’est le tourisme dans son propre pays qui domine.' },
        { label: 'les deux sont exactement égaux', why: 'L’un est largement supérieur à l’autre.' },
        { label: 'aucun des deux n’existe', why: 'Les deux formes de tourisme sont importantes.' },
      ],
      gap: ['Le tourisme ', ' reste largement supérieur au tourisme international.', ['domestique']],
      choix: ['domestique', 'spatial', 'polaire'],
      quote: G_DOMESTIQUE,
      explain: 'Même si les flux internationaux sont immenses, la plupart des voyages restent dans le pays.',
      src: TOURISME,
    },
  ],
  paires3: [
    ['Site touristique', 'Lieu visité en passant, sans séjour'],
    ['Station touristique', 'Lieu de séjour ouvert, créé pour les touristes'],
    ['Comptoir touristique', 'Lieu de séjour fermé, aux règles propres'],
  ],
  paires5: [
    ['Site touristique', 'Lieu visité en passant, sans séjour'],
    ['Station touristique', 'Lieu de séjour ouvert, créé pour les touristes'],
    ['Comptoir touristique', 'Lieu de séjour fermé, aux règles propres'],
    ['Surtourisme', 'Effets négatifs d’une fréquentation excessive'],
    ['Mise en tourisme', 'Création ou transformation d’un lieu par le tourisme'],
  ],
  libres: [
    {
      q: 'Quel mot désigne les effets négatifs d’une fréquentation touristique excessive dans un lieu ?',
      accepted: ['surtourisme', 'le surtourisme', 'un surtourisme', 'overtourisme', 'overtourism', 'sur-tourisme'],
      traps: [
        { text: 'tourisme durable', why: 'Le tourisme durable cherche au contraire à limiter les effets négatifs.' },
        { text: 'tourisme de masse', why: 'Le tourisme de masse ne désigne pas à lui seul des effets excessifs.' },
      ],
      quote: G_SUR,
      explain: 'Le mot associe « sur » (trop) et « tourisme ».',
      src: SURTOURISME,
    },
    {
      q: 'Quelle ville italienne est citée comme exemple emblématique de surtourisme dans son centre historique ?',
      accepted: ['Venise', 'la ville de Venise', 'Venezia'],
      traps: [
        { text: 'Turin', why: 'L’exemple emblématique cité par la source est une autre ville.' },
        { text: 'Rome', why: 'L’exemple emblématique cité par la source est un autre centre historique.' },
      ],
      quote: G_VENISE,
      explain: 'À Venise, la pression touristique pèse sur la vie des habitants.',
      src: SURTOURISME,
    },
    {
      q: 'Quelle région du monde, bordant une mer entre l’Europe et l’Afrique, est la première région touristique ?',
      accepted: [
        'le bassin méditerranéen',
        'bassin méditerranéen',
        'la Méditerranée',
        'Méditerranée',
        'bassin de la Méditerranée',
        'le bassin de la Méditerranée',
      ],
      traps: [
        { text: 'les Caraïbes', why: 'Les Caraïbes sont en Amérique : elles ne bordent pas cette mer.' },
        { text: 'la mer Baltique', why: 'La Baltique ne sépare pas l’Europe de l’Afrique.' },
      ],
      quote: G_MEDITERRANEE,
      explain: 'Le bassin méditerranéen est, de loin, la première région touristique du monde.',
      src: TOURISME,
    },
    {
      q: 'Comment appelle-t-on le processus qui crée un lieu touristique ou transforme un lieu ancien par le tourisme ?',
      accepted: [
        'mise en tourisme',
        'la mise en tourisme',
        'une mise en tourisme',
        'touristification',
        'la touristification',
      ],
      traps: [
        { text: 'gentrification', why: 'La gentrification est l’embourgeoisement d’un quartier populaire.' },
        { text: 'périurbanisation', why: 'La périurbanisation étend la ville en périphérie.' },
      ],
      quote: G_MISE,
      explain: 'On parle de mise en tourisme, ou touristification.',
      src: MISE,
    },
    {
      q: 'Comment appelle-t-on le tourisme qui prend en compte ses impacts pour respecter les habitants et l’environnement, aujourd’hui et demain ?',
      accepted: ['tourisme durable', 'le tourisme durable', 'un tourisme durable', 'durable'],
      traps: [
        { text: 'surtourisme', why: 'Le surtourisme désigne des effets négatifs excessifs.' },
        { text: 'tourisme de masse', why: 'Il désigne l’accès du plus grand nombre au tourisme.' },
      ],
      quote: G_DURABLE,
      explain: 'La durabilité vise les générations présentes et futures.',
      src: DURABLE,
    },
  ],
  docs: [
    {
      title: 'La baie d’Orsane (lieu fictif)',
      lines: [
        'Sur la côte, des hôtels et une promenade ont été construits pour les vacanciers ; des habitants y vivent toute l’année.',
        'À l’entrée de la baie, un enclos privé, géré par une seule société, loge ses clients derrière un portail.',
        'Sur la colline, les visiteurs viennent voir des ruines pendant une heure, puis repartent.',
      ],
      qs: [
        {
          q: 'Quel type de lieu la ligne 1 décrit-elle ?',
          a: 'une station touristique',
          wrong: [
            { label: 'un site touristique', why: 'Ici on séjourne : il y a des hôtels.' },
            { label: 'un comptoir touristique', why: 'Le lieu est habité et ouvert.' },
            { label: 'un quartier des affaires', why: 'Il accueille des vacanciers, pas des bureaux.' },
          ],
          quote: G_OUVERT,
          explain: 'Lieu construit pour les vacanciers, ouvert et habité : une station.',
          src: STATION,
        },
        {
          q: 'Quel type de lieu la ligne 2 décrit-elle ?',
          a: 'un comptoir touristique',
          wrong: [
            { label: 'une station touristique', why: 'La station est un lieu ouvert.' },
            { label: 'un site touristique', why: 'Les clients y sont logés.' },
            { label: 'un quartier informel', why: 'Il s’agit d’un lieu de vacances géré par une société.' },
          ],
          quote: G_COMPTOIR,
          explain: 'Fermé, géré par un seul acteur, avec hébergement : c’est un comptoir.',
          src: COMPTOIR,
        },
        {
          q: 'Quel type de lieu la ligne 3 décrit-elle ?',
          a: 'un site touristique',
          wrong: [
            { label: 'une station touristique', why: 'Les visiteurs ne séjournent pas sur la colline.' },
            { label: 'un comptoir touristique', why: 'Il n’y a aucun hébergement.' },
            { label: 'une mégapole', why: 'Une mégapole est une ville géante.' },
          ],
          quote: G_SITE,
          explain: 'On passe sans dormir : c’est un site touristique.',
          src: SITE,
        },
      ],
    },
    {
      title: 'Été à Calvéra (lieu fictif)',
      lines: [
        'En août, la petite ville de Calvéra reçoit dix fois plus de personnes que le reste de l’année.',
        'L’eau manque et les déchets s’accumulent.',
        'Des logements sont loués aux visiteurs : plusieurs habitants ne trouvent plus à se loger.',
      ],
      qs: [
        {
          q: 'Quel terme résume la situation décrite aux lignes 1 à 3 ?',
          a: 'le surtourisme',
          wrong: [
            { label: 'le tourisme durable', why: 'Les habitants et l’environnement subissent des dégâts.' },
            { label: 'l’excursionnisme', why: 'Ce mot désigne une sortie à la journée, pas ces effets.' },
            { label: 'la périurbanisation', why: 'Le texte ne décrit pas l’étalement d’une ville.' },
          ],
          quote: G_SUR,
          explain: 'La fréquentation est excessive et ses effets sont négatifs.',
          src: SURTOURISME,
        },
        {
          q: 'D’après la ligne 3, qui subit les conséquences de cette fréquentation ?',
          a: 'les habitants de la ville',
          wrong: [
            { label: 'seulement les visiteurs', why: 'La ligne 3 parle des habitants.' },
            { label: 'personne', why: 'Des habitants ne trouvent plus à se loger.' },
            { label: 'les agriculteurs d’un autre pays', why: 'Le texte ne parle pas d’eux.' },
          ],
          quote: G_HABITANTS,
          explain: 'Le logement est utilisé pour les visiteurs, au détriment de la vie des résidents.',
          src: SURTOURISME,
        },
        {
          q: 'Quel type d’effet la ligne 2 illustre-t-elle ?',
          a: 'un effet environnemental',
          wrong: [
            { label: 'un effet grammatical', why: 'Le tourisme n’a pas d’effet de ce type.' },
            { label: 'un effet positif sur la ressource en eau', why: 'La ligne 2 dit que l’eau manque.' },
            { label: 'aucun effet', why: 'Le manque d’eau et les déchets sont des effets visibles.' },
          ],
          quote: G_EAU,
          explain: 'L’eau et les déchets concernent l’environnement et sa gestion.',
          src: TOURISME,
        },
      ],
    },
    {
      title: 'Deux rives (cas fictif)',
      lines: [
        'Au nord d’une mer, le pays Vallona accueille des millions de visiteurs étrangers.',
        'Au sud, le pays Ténéria n’en reçoit que peu et tire peu de revenus de cette activité.',
        'Sur les deux rives, les hôtels s’alignent surtout le long du littoral et remplacent des milieux naturels.',
      ],
      qs: [
        {
          q: 'Que montrent les lignes 1 et 2 ?',
          a: 'les retombées du tourisme international sont inégales',
          wrong: [
            { label: 'les deux pays profitent exactement autant', why: 'Leurs fréquentations diffèrent beaucoup.' },
            { label: 'le tourisme n’apporte jamais de revenus', why: 'La ligne 2 évoque des revenus.' },
            { label: 'le pays du sud est le plus visité', why: 'C’est Vallona, au nord, qui accueille le plus.' },
          ],
          quote: G_RETOMBEES,
          explain: 'Les territoires ne profitent pas tous de la même façon du tourisme.',
          src: TOURISME,
        },
        {
          q: 'Quel effet sur le littoral la ligne 3 décrit-elle ?',
          a: 'son artificialisation',
          wrong: [
            { label: 'sa protection totale', why: 'Des milieux naturels sont remplacés.' },
            { label: 'son abandon', why: 'Les constructions s’y multiplient.' },
            { label: 'son éloignement de la mer', why: 'Les hôtels sont au bord de la côte.' },
          ],
          quote: G_ARTIFICIEL,
          explain: 'Les constructions remplacent des milieux naturels : c’est l’artificialisation.',
          src: TOURISME,
        },
      ],
    },
  ],
};

// ——— Notion 3 : le vocabulaire ———

const vocabulaire: Notion = {
  classe: '4e',
  id: 'g4-vocabulaire-mobilites',
  title: 'Le vocabulaire des mobilités humaines',
  hint: 'Cherche le critère du mot : la durée, la frontière franchie, la raison du départ ou le point de vue.',
  memo: [
    'La **mobilité** est un changement de lieu : la **migration** est un changement de domicile durable, le **tourisme** un séjour temporaire d’au moins une nuit et d’un an au plus.',
    'Une même personne est un **émigré** pour le pays de départ et un **immigré** pour le pays d’arrivée.',
    'L’**excursionniste** rentre le jour même ; une **diaspora** est une population dispersée qui garde des liens.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’une migration ?',
      a: 'un changement de domicile pour une durée longue ou définitive',
      wrong: [
        { label: 'une promenade dans la journée', why: 'Une sortie à la journée est une excursion.' },
        { label: 'un trajet quotidien jusqu’au travail', why: 'On rentre chaque soir : le domicile ne change pas.' },
        { label: 'un séjour de vacances d’une semaine', why: 'C’est un voyage touristique.' },
      ],
      gap: ['La migration est un changement de ', ' pour une durée longue ou définitive.', ['domicile']],
      choix: ['domicile', 'prénom', 'climat'],
      quote: G_MIGRATION,
      explain: 'Deux critères : on change de domicile et c’est durable.',
      src: MIGRATION,
    },
    {
      q: 'Du point de vue du pays d’arrivée, comment nomme-t-on la personne qui s’y installe après avoir quitté son pays ?',
      a: 'un immigré',
      wrong: [
        { label: 'un émigré', why: '« Émigré » exprime le point de vue du pays de départ.' },
        { label: 'un excursionniste', why: 'L’excursionniste ne s’installe pas.' },
        { label: 'un touriste', why: 'Le touriste repart après un séjour temporaire.' },
      ],
      gap: ['Pour le pays où elle s’installe, la personne est un ', '.', ['immigré']],
      choix: ['immigré', 'émigré', 'excursionniste'],
      quote: G_IMMIGRE,
      explain: 'Le préfixe « im » regarde l’arrivée, « é » regarde le départ.',
      src: MIGRANT,
    },
    {
      q: 'Qui est un demandeur d’asile ?',
      a: 'une personne qui attend la réponse à sa demande de protection',
      wrong: [
        { label: 'une personne déjà reconnue réfugiée', why: 'Le statut est alors accordé : l’attente est finie.' },
        { label: 'une personne qui voyage pour ses loisirs', why: 'C’est un touriste.' },
        {
          label: 'une personne qui cherche un logement de vacances',
          why: 'L’asile est une protection, pas un séjour.',
        },
      ],
      gap: ['Le demandeur d’asile attend l’octroi du statut de ', '.', ['réfugié']],
      choix: ['réfugié', 'touriste', 'excursionniste'],
      quote: G_ASILE,
      explain: 'Il a déposé une demande et attend la décision.',
      src: ASILE,
    },
    {
      q: 'Qu’est-ce qui différencie un touriste d’un excursionniste ?',
      a: 'le touriste passe au moins une nuit sur place',
      wrong: [
        { label: 'le touriste voyage toujours à l’étranger', why: 'Un touriste peut voyager dans son propre pays.' },
        { label: 'l’excursionniste reste plusieurs semaines', why: 'Il rentre dans la journée.' },
        { label: 'le touriste se déplace pour changer de domicile', why: 'Changer de domicile est une migration.' },
      ],
      gap: ['Contrairement à l’excursionniste, le touriste effectue au moins une ', '.', ['nuitée']],
      choix: ['nuitée', 'migration', 'frontière'],
      quote: G_TOURISTE,
      explain: 'La nuit passée sur place sépare le touriste de l’excursionniste.',
      src: TOURISTE,
    },
    {
      q: 'Selon la définition internationale retenue par l’ONU, combien de temps au plus dure un voyage touristique ?',
      a: 'un an',
      wrong: [
        { label: 'un jour', why: 'En moins d’une journée, sans nuit, c’est une excursion.' },
        { label: 'un mois', why: 'La limite haute est plus longue.' },
        { label: 'dix ans', why: 'Une si longue installation n’est pas du tourisme.' },
      ],
      gap: ['Un voyage touristique dure au moins une nuit et au plus un ', '.', ['an']],
      choix: ['an', 'jour', 'siècle'],
      quote: G_TOURISME,
      explain: 'Entre une nuit et un an, le voyage hors du domicile habituel compte comme tourisme.',
      src: TOURISME,
    },
    {
      q: 'Que désigne le mot « diaspora » ?',
      a: 'la dispersion d’une population dans plusieurs lieux',
      wrong: [
        { label: 'un séjour de vacances', why: 'La diaspora concerne des populations installées au loin.' },
        { label: 'un type d’hôtel', why: 'Le mot désigne un phénomène migratoire.' },
        { label: 'une frontière fermée', why: 'Une diaspora relie au contraire des lieux éloignés.' },
      ],
      gap: ['Le mot diaspora indique la ', ' d’une population.', ['dispersion']],
      choix: ['dispersion', 'concentration', 'disparition'],
      quote: G_DIASPORA,
      explain: 'Les membres d’une diaspora gardent des liens entre eux et avec le pays d’origine.',
      src: DIASPORA,
    },
    {
      q: 'Qu’est-ce que la mobilité en géographie ?',
      a: 'un changement de lieu accompli par une ou des personnes',
      wrong: [
        { label: 'un bâtiment qui ne bouge pas', why: 'La mobilité suppose un déplacement.' },
        { label: 'la hauteur d’un relief', why: 'Le relief concerne la forme du sol.' },
        { label: 'le nombre d’habitants d’un pays', why: 'C’est la population.' },
      ],
      gap: ['La mobilité désigne un changement de ', ' accompli par des personnes.', ['lieu']],
      choix: ['lieu', 'langue', 'métier'],
      quote: G_MOBILITE,
      explain: 'Migrations et tourisme sont deux formes de mobilité.',
      src: MOBILITE,
    },
    {
      q: 'Quel est le facteur « pull » d’une migration ?',
      a: 'ce qui attire vers la destination',
      wrong: [
        { label: 'ce qui pousse à partir', why: 'C’est le facteur « push ».' },
        { label: 'le prix du billet de retour', why: 'Le terme désigne l’attrait de la destination.' },
        { label: 'la date du départ', why: 'Il s’agit d’une cause, pas d’une date.' },
      ],
      gap: ['Le facteur qui attire les migrants vers leur destination est dit « ', ' ».', ['pull']],
      choix: ['pull', 'push', 'hub'],
      quote: G_PULL,
      explain: 'En anglais, to pull veut dire tirer : emploi ou sécurité attirent.',
      src: PUSH,
    },
    {
      q: 'Quel tourisme met en œuvre des flux inégalés, tout en restant très diversifié ?',
      a: 'le tourisme de masse',
      wrong: [
        { label: 'l’excursionnisme', why: 'L’excursionnisme désigne des sorties sans nuitée.' },
        { label: 'la migration pendulaire', why: 'C’est un trajet quotidien, pas du tourisme.' },
        { label: 'le tourisme réservé à quelques aristocrates', why: 'Les flux inégalés viennent du grand nombre.' },
      ],
      gap: ['Le tourisme de ', ' met en œuvre des flux inégalés.', ['masse']],
      choix: ['masse', 'proximité', 'luxe'],
      quote: G_MASSE,
      explain: 'Le grand nombre accède au tourisme, avec des pratiques très variées.',
      src: MASSE,
    },
  ],
  paires3: [
    ['Émigré', 'Vu du pays de départ'],
    ['Immigré', 'Vu du pays d’arrivée'],
    ['Diaspora', 'Population dispersée qui garde des liens'],
  ],
  paires5: [
    ['Émigré', 'Vu du pays de départ'],
    ['Immigré', 'Vu du pays d’arrivée'],
    ['Diaspora', 'Population dispersée qui garde des liens'],
    ['Touriste', 'Voyageur qui passe au moins une nuit sur place'],
    ['Excursionniste', 'Voyageur de loisir qui rentre le jour même'],
  ],
  ordre: [
    'Une excursion à la journée',
    'Un séjour de vacances de deux semaines',
    'Un voyage touristique de six mois',
    'Une installation de plusieurs années à l’étranger',
  ],
  consigne: {
    prompt: 'Range ces mobilités de la plus courte à la plus longue.',
    hint: 'Compare les durées : quelques heures, des semaines, des mois, des années.',
    why: 'L’excursion dure moins d’un jour, le voyage touristique moins d’un an, l’installation dure davantage.',
    fin: 'La plus courte est',
    quote: G_DUREE,
    src: EXCURSION,
  },
  libres: [
    {
      q: 'Comment appelle-t-on la personne qui s’est installée dans un pays, vue depuis ce pays d’arrivée ?',
      accepted: ['immigré', 'un immigré', 'l’immigré', 'immigrée', 'une immigrée', 'immigrant', 'un immigrant'],
      traps: [
        { text: 'émigré', why: '« Émigré » est le point de vue du pays de départ.' },
        { text: 'touriste', why: 'Le touriste n’est que de passage.' },
      ],
      quote: G_IMMIGRE,
      explain: 'Vu du pays d’arrivée, la personne est immigrée.',
      src: MIGRANT,
    },
    {
      q: 'Comment appelle-t-on une population dispersée dans plusieurs pays qui garde des liens avec son origine ?',
      accepted: ['diaspora', 'une diaspora', 'la diaspora', 'diasporas'],
      traps: [
        { text: 'frontière', why: 'Une frontière sépare des États, ce n’est pas une population.' },
        { text: 'banlieue', why: 'La banlieue est un territoire autour d’une ville.' },
      ],
      quote: G_LIENS,
      explain: 'Personnes, biens, informations et capitaux circulent au sein d’une diaspora.',
      src: DIASPORA,
    },
    {
      q: 'Comment appelle-t-on celui qui fait une sortie de loisir de moins de 24 heures, sans nuit sur place ?',
      accepted: ['excursionniste', 'un excursionniste', 'l’excursionniste', 'une excursionniste'],
      traps: [
        { text: 'touriste', why: 'Le touriste passe au moins une nuit sur place.' },
        { text: 'migrant', why: 'Le migrant change durablement de domicile.' },
      ],
      quote: G_EXCURSION,
      explain: 'Sans nuitée, il s’agit d’une excursion.',
      src: EXCURSION,
    },
    {
      q: 'Comment les géographes appellent-ils une mobilité de longue durée ou définitive, dite internationale quand une frontière est franchie ?',
      accepted: ['migration', 'une migration', 'la migration', 'migrations'],
      traps: [
        { text: 'excursion', why: 'L’excursion dure moins d’une journée.' },
        { text: 'tourisme', why: 'Le tourisme est un séjour temporaire d’un an au plus.' },
      ],
      quote: G_TYPES,
      explain: 'La migration est une mobilité durable, internationale si une frontière est franchie.',
      src: MOBILITE,
    },
    {
      q: 'Comment appelle-t-on la personne qui quitte son pays, vue depuis ce pays de départ ?',
      accepted: ['émigré', 'un émigré', 'l’émigré', 'émigrée', 'une émigrée', 'émigrant', 'un émigrant'],
      traps: [
        { text: 'immigré', why: '« Immigré » est le point de vue du pays d’arrivée.' },
        { text: 'déplacé', why: 'Le déplacé est contraint de partir, souvent sans quitter son pays.' },
      ],
      quote: G_IMMIGRE,
      explain: 'Vu du pays de départ, la personne est émigrée.',
      src: MIGRANT,
    },
  ],
  docs: [
    {
      title: 'Carnet d’une famille (récit fictif)',
      lines: [
        'Samedi, E fait un aller-retour dans la journée pour visiter un château.',
        'En juillet, F passe dix jours à la mer, puis rentre chez elle.',
        'G a quitté son pays il y a six ans pour s’installer durablement à l’étranger.',
      ],
      qs: [
        {
          q: 'Quel mot convient à E ?',
          a: 'un excursionniste',
          wrong: [
            { label: 'un touriste', why: 'E ne passe pas la nuit sur place.' },
            { label: 'un immigré', why: 'E ne s’installe pas.' },
            { label: 'un demandeur d’asile', why: 'Aucune demande de protection n’est évoquée.' },
          ],
          quote: G_EXCURSION,
          explain: 'Aller-retour dans la journée : c’est une excursion.',
          src: EXCURSION,
        },
        {
          q: 'Quel mot convient à F ?',
          a: 'une touriste',
          wrong: [
            { label: 'une excursionniste', why: 'F passe plusieurs nuits sur place.' },
            { label: 'une migrante', why: 'F rentre chez elle : son domicile ne change pas.' },
            { label: 'une déplacée', why: 'F n’est pas contrainte de partir.' },
          ],
          quote: G_TOURISTE,
          explain: 'Elle passe des nuits sur place pour ses vacances, puis rentre.',
          src: TOURISTE,
        },
        {
          q: 'Du point de vue de son pays de départ, qu’est-ce que G ?',
          a: 'un émigré',
          wrong: [
            { label: 'un immigré', why: 'Immigré est le point de vue du pays d’arrivée.' },
            { label: 'un excursionniste', why: 'G est parti depuis six ans.' },
            { label: 'un touriste', why: 'Un voyage touristique dure un an au plus.' },
          ],
          quote: G_IMMIGRE,
          explain: 'Vu du pays qu’il a quitté, G est un émigré.',
          src: MIGRANT,
        },
      ],
    },
    {
      title: 'Une communauté dispersée (cas fictif)',
      lines: [
        'Les membres du peuple imaginaire des Lorins vivent depuis longtemps dans cinq pays différents.',
        'Ils échangent des nouvelles, de l’argent et des produits, et gardent la mémoire de leur terre d’origine.',
        'Leurs enfants vont à l’école de leur pays d’installation.',
      ],
      qs: [
        {
          q: 'Quel mot désigne l’ensemble formé par les Lorins ?',
          a: 'une diaspora',
          wrong: [
            { label: 'une mégalopole', why: 'Une mégalopole est un réseau de villes.' },
            { label: 'un excursionnisme', why: 'Il ne s’agit pas de sorties à la journée.' },
            { label: 'une station touristique', why: 'Il s’agit d’une population, pas d’un lieu de séjour.' },
          ],
          quote: G_LIENS,
          explain: 'Dispersion, liens et mémoire commune : c’est une diaspora.',
          src: DIASPORA,
        },
      ],
    },
    {
      title: 'Au guichet des départs (cas fictifs)',
      lines: [
        'H a déposé une demande de protection à l’étranger et attend la réponse.',
        'I a obtenu ce statut après examen de son dossier.',
        'J a emménagé dans une autre région de son pays pour un emploi.',
      ],
      qs: [
        {
          q: 'Quel terme convient à H ?',
          a: 'demandeur d’asile',
          wrong: [
            { label: 'réfugié reconnu', why: 'H attend encore la réponse.' },
            { label: 'touriste', why: 'H cherche une protection, pas des vacances.' },
            { label: 'excursionniste', why: 'H ne fait pas une sortie à la journée.' },
          ],
          quote: G_ASILE,
          explain: 'Demande déposée, réponse attendue : demandeur d’asile.',
          src: ASILE,
        },
        {
          q: 'Quel type de mobilité J a-t-il accompli ?',
          a: 'une migration intérieure',
          wrong: [
            { label: 'une migration internationale', why: 'J n’a franchi aucune frontière.' },
            { label: 'un voyage touristique', why: 'J change de domicile pour un emploi.' },
            { label: 'une excursion', why: 'Un emménagement est durable.' },
          ],
          quote: G_TYPES,
          explain: 'Changement durable de domicile sans frontière franchie : migration intérieure.',
          src: MOBILITE,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [migrants, tourisme, vocabulaire];

export const SKILLS: readonly Skill[] = NOTIONS.map(notion);
