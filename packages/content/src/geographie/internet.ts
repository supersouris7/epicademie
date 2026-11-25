import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM2, thème 2 « Communiquer d’un bout à l’autre du monde grâce à l’Internet » (lot ge-cm2-02). Chaque fait cite le
 * programme du cycle 3, l’Insee, vie-publique.fr, la Commission européenne ou le Dictionnaire de l’Académie
 * française (CNRTL), avec sa citation exacte ; les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

// ——— Citations exactes ———

const A_INTERNET =
  'Réseau mondial de télécommunication reliant entre eux des ordinateurs ou des réseaux locaux et permettant l’acheminement de données numérisées de toutes sortes (messages électroniques, textes, images, sons, etc.)';
const I_PROTOCOLE =
  'Ensemble de réseaux mondiaux interconnectés qui permet à des ordinateurs et à des serveurs de communiquer efficacement au moyen d’un protocole de communication commun (IP)';
const I_SERVICES = 'Ses principaux services sont le Web, le FTP, la messagerie et les groupes de discussion';
const UE_RESEAUX =
  'La connectivité englobe les réseaux numériques, depuis les structures mobiles et fixes jusqu’à l’internet, y compris les câbles et les satellites';

const UE_CABLES = 'Les câbles de données sous-marins, qui transportent 99 % du trafic Internet intercontinental';
const UE_ELLALINK = 'EllaLink, un câble sous-marin à fibres optiques reliant l’Europe à l’Amérique latine';
const VP_CENTRE =
  'Les centres de données ou data centers sont des bâtiments contenant des serveurs dans lesquels sont stockées et traitées les données';
const VP_EAU = 'Ces centres sont pointés pour leur consommation d’eau, nécessaire au refroidissement des serveurs';
const VP_LIEUX =
  'la proximité d’un réseau internet de fibre optique. Par exemple, Marseille qui est un point d’arrivée de nombreux câbles sous-marins de télécommunications';
const VP_ELEC = 'la présence d’une puissance électrique suffisante';

const VP_MONDE =
  'en 2021, l’Organisation des Nations unies (ONU) estime à près de trois milliards le nombre de personnes qui ne sont toujours pas connectées à internet';
const VP_ILLECTRONISME =
  'Une personne en situation d’illectronisme ne dispose pas des compétences numériques de base ou ne se sert pas d’internet';
const I_TAUX = 'En 2021, 15,4 % des personnes de 15 ans ou plus résidant en France sont en situation d’illectronisme';
const I_AGE = '62 % des 75 ans ou plus, contre seulement 2 % des 15-24 ans';
const I_DOM =
  'les habitants des départements d’outre-mer (DOM) sont un peu plus concernés que ceux de France métropolitaine (20 % contre 15 %)';
const VP_BAISSE = '5% n’utilisent pas internet (contre 10% en 2021)';
const I_EUROPE =
  'Le Danemark et le Luxembourg sont en tête avec moins de 5 % d’illectronisme, alors que la Bulgarie, la Roumanie, la Grèce ou encore l’Italie sont en bas du classement (de 22 % à 31 % d’illectronisme)';

const P_USAGES =
  'Ses usages définissent un nouveau rapport à l’espace et au temps caractérisé par l’immédiateté et la proximité';
const P_CITOYEN = 'Ils questionnent la citoyenneté';
const UE_LOIN = 'Cela nous permet de tendre la main aux autres, peu importe où ils se trouvent dans le monde';
const UE_COURS =
  'nous pouvons lire les dernières nouvelles quand et où nous le trouvons pratique, suivre des cours en ligne';
const VP_USAGES =
  'La plupart des internautes savent communiquer avec les outils numériques (envoi de mails, usage des réseaux sociaux)';
const VP_DEMARCHES =
  'Si la dématérialisation des services publics simplifie les démarches pour une grande partie des usagers, elle en exclut également certains';
const VP_PRIVE =
  'beaucoup rencontrent des difficultés pour utiliser des logiciels ou en matière de protection de la vie privée';

const ACADEMIE = 'cnrtl-academie-internet';
const INSEE_DEF = 'insee-internet';
const INSEE = 'insee-illectronisme';
const EU_CONNECT = 'ue-connectivite';
const EU_CABLES = 'ue-cables-sous-marins';
const EU_ELLALINK = 'ue-ellalink';
const VIE_CENTRES = 'viepublique-centres-donnees';
const VIE_MONDE = 'viepublique-internet-monde';
const VIE_ILLECTRONISME = 'viepublique-illectronisme';
const VIE_COMPETENCES = 'viepublique-competences-numeriques';

// ——— Notion 1 : un réseau mondial ———

const reseauMondial: Notion = {
  id: 'gcm2-internet-reseau',
  classe: 'CM2',
  title: 'Internet, un réseau mondial',
  hint: 'Imagine une immense toile : qu’est-ce qu’elle relie, et qu’est-ce qui y voyage ?',
  memo: [
    '**Internet** est un **réseau** mondial : il relie des ordinateurs entre eux, partout sur la planète.',
    'Des **données** y voyagent : messages, textes, images, sons. Les machines suivent la même règle, un **protocole**.',
    'Ce réseau utilise aussi des câbles et des **satellites**. Exemple : ta **messagerie** envoie un message loin de chez toi.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’Internet ?',
      a: 'un réseau mondial qui relie des ordinateurs',
      wrong: [
        {
          label: 'un seul ordinateur géant',
          why: 'Internet n’est pas une machine : c’est un réseau qui en relie beaucoup.',
        },
        { label: 'une chaîne de télévision', why: 'Une chaîne diffuse des émissions. Internet relie des ordinateurs.' },
        {
          label: 'un réseau réservé à une seule ville',
          why: 'Internet est mondial : il ne s’arrête pas aux limites d’une ville.',
        },
      ],
      gap: [
        'Internet est un réseau présent sur toute la planète : on dit qu’il est ',
        '.',
        ['mondial', 'planétaire', 'planetaire', 'international'],
      ],
      quote: A_INTERNET,
      explain: 'Le dictionnaire parle d’un réseau mondial qui relie des ordinateurs.',
      src: ACADEMIE,
    },
    {
      q: 'Qu’est-ce qui voyage sur Internet ?',
      a: 'des données : messages, textes, images, sons',
      wrong: [
        { label: 'seulement des textes écrits', why: 'Les textes voyagent, mais aussi les images et les sons.' },
        {
          label: 'les objets que l’on commande en ligne',
          why: 'La commande passe par Internet, mais l’objet voyage par la route ou l’avion.',
        },
        {
          label: 'seulement des sons, comme à la radio',
          why: 'Les sons voyagent, mais aussi les textes et les images.',
        },
      ],
      gap: [
        'Messages, textes, images et sons voyagent sous forme de ',
        ' numérisées.',
        ['données', 'donnees', 'informations', 'information'],
      ],
      quote: A_INTERNET,
      explain: 'Internet achemine des données de toutes sortes. Acheminer, c’est faire arriver quelque part.',
      src: ACADEMIE,
    },
    {
      q: 'Comment les ordinateurs d’Internet arrivent-ils à communiquer ?',
      a: 'avec une règle commune, appelée protocole',
      wrong: [
        {
          label: 'chacun invente son propre langage',
          why: 'Sans règle commune, les machines ne se comprendraient pas.',
        },
        {
          label: 'en s’envoyant des lettres par la poste',
          why: 'Les ordinateurs échangent par le réseau, pas par la poste.',
        },
        { label: 'seulement s’ils sont dans la même pièce', why: 'Internet relie des machines très éloignées.' },
      ],
      gap: ['Pour communiquer, les ordinateurs suivent une règle commune appelée ', '.', ['protocole', 'un protocole']],
      quote: I_PROTOCOLE,
      explain: 'Le protocole est la règle que toutes les machines suivent.',
      src: INSEE_DEF,
    },
    {
      q: 'Lequel est un service d’Internet ?',
      a: 'la messagerie',
      wrong: [
        {
          label: 'la distribution du courrier par le facteur',
          why: 'Le facteur apporte du papier dans les rues : ce n’est pas un service d’Internet.',
        },
        {
          label: 'les émissions de radio reçues par antenne',
          why: 'Ces émissions arrivent par une antenne, sans passer par Internet.',
        },
        {
          label: 'la livraison de colis par camion',
          why: 'Le camion roule sur la route : ce n’est pas un service du réseau.',
        },
      ],
      gap: ['Parmi les services d’Internet, il y a le Web et la ', ', pour envoyer des messages.', ['messagerie']],
      quote: I_SERVICES,
      explain: 'La messagerie fait partie des principaux services d’Internet.',
      src: INSEE_DEF,
    },
    {
      q: 'Quels équipements font partie des réseaux numériques ?',
      a: 'les câbles et les satellites',
      wrong: [
        {
          label: 'les rails et les aiguillages',
          why: 'Ils guident les trains : ils servent au transport des voyageurs.',
        },
        { label: 'les canaux et les écluses', why: 'Ils servent aux bateaux, pas aux données.' },
        { label: 'les autoroutes et les péages', why: 'Elles servent aux voitures et aux camions, pas aux données.' },
      ],
      gap: ['Les réseaux numériques comprennent des câbles et des ', ', dans l’espace.', ['satellites', 'satellite']],
      quote: UE_RESEAUX,
      explain: 'L’Union européenne cite les câbles et les satellites parmi les réseaux numériques.',
      src: EU_CONNECT,
    },
  ],
  paires3: [
    ['Internet', 'Un réseau mondial d’ordinateurs reliés'],
    ['Messagerie', 'Le service pour envoyer des messages'],
    ['Protocole', 'La règle commune pour communiquer'],
  ],
  paires5: [
    ['Internet', 'Un réseau mondial d’ordinateurs reliés'],
    ['Messagerie', 'Le service pour envoyer des messages'],
    ['Protocole', 'La règle commune pour communiquer'],
    ['Données', 'Ce qui voyage : textes, images, sons'],
    ['Satellite', 'Un relais placé dans l’espace'],
  ],
  libres: [
    {
      q: 'Internet est un réseau … (un mot : à l’échelle de toute la planète).',
      accepted: ['mondial', 'planétaire', 'planetaire', 'international'],
      traps: [
        { text: 'local', why: 'Un réseau local reste dans un petit espace. Internet couvre la planète.' },
        { text: 'national', why: 'National veut dire « d’un seul pays ». Internet va bien plus loin.' },
      ],
      quote: A_INTERNET,
      explain: 'Internet est un réseau mondial.',
      src: ACADEMIE,
    },
    {
      q: 'La règle commune qui permet aux ordinateurs de communiquer est un … (un mot).',
      accepted: ['protocole', 'un protocole'],
      traps: [
        { text: 'câble', why: 'Le câble transporte les données. La règle commune a un autre nom.' },
        { text: 'mot de passe', why: 'Un mot de passe protège un compte : ce n’est pas la règle commune.' },
      ],
      quote: I_PROTOCOLE,
      explain: 'On parle de protocole de communication.',
      src: INSEE_DEF,
    },
    {
      q: 'Pour envoyer un message à quelqu’un par Internet, j’utilise une … (le nom du service).',
      accepted: ['messagerie', 'une messagerie', 'la messagerie'],
      traps: [
        { text: 'poste', why: 'La poste transporte du courrier en papier. Sur Internet, le service a un autre nom.' },
        { text: 'télévision', why: 'La télévision diffuse des émissions : elle n’envoie pas tes messages.' },
      ],
      quote: I_SERVICES,
      explain: 'La messagerie est l’un des principaux services d’Internet.',
      src: INSEE_DEF,
    },
    {
      q: 'Textes, images et sons voyagent sur Internet sous forme de … numérisées (un mot).',
      accepted: ['données', 'donnees', 'des données', 'informations', 'des informations'],
      traps: [
        { text: 'lettres', why: 'Les lettres ne sont qu’une partie. Le mot cherché réunit textes, images et sons.' },
        { text: 'ondes', why: 'Le dictionnaire emploie un autre mot : ce qui est acheminé, ce sont des données.' },
      ],
      quote: A_INTERNET,
      explain: 'Ce qui voyage s’appelle des données.',
      src: ACADEMIE,
    },
  ],
  docs: [
    {
      title: 'Une photo qui fait le voyage',
      lines: [
        'Un élève de Nantes envoie une photo à sa cousine, au Canada.',
        'La photo est transformée en données.',
        'Les données passent d’une machine à l’autre grâce au réseau.',
        'La cousine voit la photo sur sa tablette.',
      ],
      qs: [
        {
          q: 'Que montre ce voyage ?',
          a: 'qu’Internet relie des appareils très éloignés',
          wrong: [
            { label: 'qu’une photo part par la poste', why: 'La photo voyage sous forme de données, par le réseau.' },
            {
              label: 'qu’Internet s’arrête aux frontières',
              why: 'La photo va de France au Canada : le réseau est mondial.',
            },
            {
              label: 'que la tablette est une messagerie',
              why: 'La tablette est un appareil. La messagerie est un service.',
            },
          ],
          quote: A_INTERNET,
          explain: 'Nantes et le Canada sont reliés : Internet est un réseau mondial.',
          src: ACADEMIE,
        },
      ],
    },
    {
      title: 'Deux machines différentes',
      lines: [
        'Un ordinateur en France et un autre au Japon sont de marques différentes.',
        'Pourtant, ils échangent des messages.',
        'Tous deux suivent la même règle de communication.',
      ],
      qs: [
        {
          q: 'Comment s’appelle cette règle commune ?',
          a: 'un protocole',
          wrong: [
            { label: 'un satellite', why: 'Un satellite est un relais dans l’espace, pas une règle.' },
            { label: 'une messagerie', why: 'La messagerie est un service. La règle commune est le protocole.' },
            { label: 'un serveur', why: 'Un serveur est un ordinateur : ce n’est pas une règle.' },
          ],
          quote: I_PROTOCOLE,
          explain: 'Grâce au même protocole, des machines différentes se comprennent.',
          src: INSEE_DEF,
        },
      ],
    },
    {
      title: 'Le message de la bibliothèque',
      lines: [
        'La bibliothécaire écrit à une classe qui habite dans un autre pays.',
        'Son ordinateur est relié au réseau.',
        'Elle utilise le service qui sert à envoyer des messages.',
        'La classe reçoit le texte et une image.',
      ],
      qs: [
        {
          q: 'Quel service d’Internet la bibliothécaire utilise-t-elle ?',
          a: 'la messagerie',
          wrong: [
            {
              label: 'le protocole',
              why: 'Le protocole est la règle commune des machines : ce n’est pas le service qui envoie.',
            },
            { label: 'le satellite', why: 'Le satellite est un équipement du réseau, pas un service pour écrire.' },
            {
              label: 'le Web',
              why: 'Le Web est un autre service : pour envoyer un message, on utilise la messagerie.',
            },
          ],
          quote: I_SERVICES,
          explain: 'Le service qui sert à envoyer des messages est la messagerie.',
          src: INSEE_DEF,
        },
      ],
    },
  ],
};

// ——— Notion 2 : câbles et centres de données ———

const cables: Notion = {
  id: 'gcm2-internet-cables',
  classe: 'CM2',
  title: 'Câbles et centres de données',
  hint: 'Internet a besoin de matériel bien réel : pense à ce qui transporte les données, et à ce qui les garde.',
  memo: [
    'Entre les continents, presque tout passe par des **câbles sous-marins** : 99 % du trafic. Marseille en voit arriver de nombreux.',
    'Les données sont gardées dans des **centres de données** : des bâtiments remplis de **serveurs**.',
    'Un centre de données cherche de la **fibre optique** et de l’électricité. L’eau peut servir à refroidir ses serveurs.',
  ],
  faits: [
    {
      q: 'Entre les continents, par où passe presque tout le trafic d’Internet ?',
      a: 'par des câbles posés sous la mer',
      wrong: [
        { label: 'par des avions', why: 'Les avions transportent des voyageurs et des marchandises, pas ce trafic.' },
        { label: 'par des routes', why: 'Une route ne traverse pas les océans et ne transporte pas ce trafic.' },
        {
          label: 'surtout par les satellites',
          why: 'Les satellites existent, mais 99 % du trafic entre continents passe par les câbles sous-marins.',
        },
      ],
      gap: ['Les câbles sous-', ' transportent 99 % du trafic Internet entre les continents.', ['marins']],
      quote: UE_CABLES,
      explain: 'Les câbles sous-marins transportent 99 % du trafic Internet entre les continents.',
      src: EU_CABLES,
    },
    {
      q: 'Le câble sous-marin EllaLink relie l’Europe à…',
      a: 'l’Amérique latine',
      wrong: [
        { label: 'l’Asie', why: 'EllaLink ne va pas vers l’Asie : il relie l’Europe à l’Amérique latine.' },
        { label: 'l’Australie', why: 'L’Australie est très loin de ce trajet : EllaLink rejoint l’Amérique latine.' },
        { label: 'l’Inde', why: 'EllaLink ne va pas vers l’Inde : il rejoint l’Amérique latine.' },
      ],
      gap: ['EllaLink est un câble qui relie l’Europe à l’', ' latine.', ['Amérique', 'Amerique']],
      quote: UE_ELLALINK,
      explain: 'EllaLink est un câble à fibres optiques entre l’Europe et l’Amérique latine.',
      src: EU_ELLALINK,
    },
    {
      q: 'Qu’est-ce qu’un centre de données ?',
      a: 'un bâtiment avec des serveurs qui stockent des données',
      wrong: [
        { label: 'une gare où l’on attend le train', why: 'Une gare sert aux voyageurs, pas aux données.' },
        {
          label: 'une bibliothèque de livres en papier',
          why: 'Les livres sont sur des étagères ; ici, ce sont des serveurs.',
        },
        { label: 'un satellite dans l’espace', why: 'Un centre de données est un bâtiment, construit sur Terre.' },
      ],
      gap: [
        'Dans un centre de données, des ordinateurs puissants appelés ',
        ' stockent les données.',
        ['serveurs', 'serveur'],
      ],
      quote: VP_CENTRE,
      explain: 'Un centre de données est un bâtiment qui contient des serveurs.',
      src: VIE_CENTRES,
    },
    {
      q: 'Certains centres de données consomment de l’eau. Pour quoi faire ?',
      a: 'refroidir les serveurs',
      wrong: [
        {
          label: 'produire l’électricité du centre',
          why: 'L’eau citée ne sert pas à produire du courant : elle refroidit les serveurs.',
        },
        {
          label: 'nettoyer les câbles sous-marins',
          why: 'Les câbles sont au fond de la mer ; cette eau-là sert aux serveurs.',
        },
        {
          label: 'éteindre des incendies chaque jour',
          why: 'L’eau est nécessaire au refroidissement des serveurs, qui chauffent.',
        },
      ],
      gap: ['L’eau sert à ', ' les serveurs qui chauffent.', ['refroidir', 'rafraîchir', 'rafraichir']],
      quote: VP_EAU,
      explain: 'Les serveurs chauffent : l’eau aide à les refroidir.',
      src: VIE_CENTRES,
    },
    {
      q: 'Quelle ville française voit arriver de nombreux câbles sous-marins ?',
      a: 'Marseille',
      wrong: [
        { label: 'Dijon', why: 'Dijon n’est pas au bord de la mer : aucun câble sous-marin n’y débarque.' },
        { label: 'Clermont-Ferrand', why: 'Cette ville est loin de la mer, au centre de la France.' },
        { label: 'Orléans', why: 'Orléans est au bord de la Loire, pas au bord de la mer.' },
      ],
      gap: ['En France, de nombreux câbles sous-marins arrivent dans la ville de ', '.', ['Marseille']],
      choix: ['Marseille', 'Dijon', 'Orléans'],
      quote: VP_LIEUX,
      explain: 'Marseille est un point d’arrivée de nombreux câbles sous-marins.',
      src: VIE_CENTRES,
    },
  ],
  paires3: [
    ['Câble sous-marin', 'Il transporte les données au fond de la mer'],
    ['Centre de données', 'Un bâtiment rempli de serveurs'],
    ['Eau', 'Elle peut refroidir les serveurs'],
  ],
  paires5: [
    ['Câble sous-marin', 'Il transporte les données au fond de la mer'],
    ['Centre de données', 'Un bâtiment rempli de serveurs'],
    ['Eau', 'Elle peut refroidir les serveurs'],
    ['Marseille', 'Une arrivée de nombreux câbles en France'],
    ['EllaLink', 'Un câble entre l’Europe et l’Amérique latine'],
  ],
  libres: [
    {
      q: 'Les câbles posés au fond de la mer sont des câbles … (un mot).',
      accepted: ['sous-marins', 'sous marins', 'sous-marin'],
      traps: [
        { text: 'aériens', why: 'Aérien veut dire « dans l’air ». Ces câbles sont sous la mer.' },
        { text: 'souterrains', why: 'Souterrain veut dire « sous la terre ». Ici, c’est sous la mer.' },
      ],
      quote: UE_CABLES,
      explain: 'On les appelle des câbles sous-marins.',
      src: EU_CABLES,
    },
    {
      q: 'Dans un centre, les données sont stockées sur des ordinateurs puissants appelés des … (un mot).',
      accepted: ['serveurs', 'serveur', 'des serveurs'],
      traps: [
        { text: 'satellites', why: 'Les satellites sont dans l’espace, pas dans le bâtiment.' },
        { text: 'câbles', why: 'Les câbles transportent les données ; ce sont les serveurs qui les stockent.' },
      ],
      quote: VP_CENTRE,
      explain: 'Les serveurs stockent et traitent les données.',
      src: VIE_CENTRES,
    },
    {
      q: 'Un centre de données cherche un réseau de fibre … (un mot) tout près.',
      accepted: ['optique'],
      traps: [
        { text: 'textile', why: 'La fibre textile sert aux vêtements, pas à transporter des données.' },
        { text: 'électrique', why: 'L’électricité est aussi nécessaire, mais la fibre dont on parle est optique.' },
      ],
      quote: VP_LIEUX,
      explain: 'La proximité d’un réseau de fibre optique aide à choisir le lieu.',
      src: VIE_CENTRES,
    },
    {
      q: 'En plus de la fibre optique, un centre de données a besoin d’une puissance … suffisante (un adjectif).',
      accepted: ['électrique', 'electrique'],
      traps: [
        { text: 'militaire', why: 'Il ne s’agit pas d’armée : les serveurs ont besoin de courant.' },
        { text: 'solaire', why: 'Le texte demande assez de puissance électrique, d’où qu’elle vienne.' },
      ],
      quote: VP_ELEC,
      explain: 'Les serveurs ont besoin d’électricité.',
      src: VIE_CENTRES,
    },
  ],
  docs: [
    {
      title: 'Où construire ?',
      lines: [
        'Une entreprise veut construire un centre de données.',
        'La ville A est loin de la fibre optique et a peu d’électricité disponible.',
        'La ville B est près d’un réseau de fibre optique et a assez d’électricité.',
      ],
      qs: [
        {
          q: 'Quelle ville convient le mieux ?',
          a: 'la ville B',
          wrong: [
            { label: 'la ville A', why: 'La ville A manque de fibre optique et d’électricité.' },
            {
              label: 'aucune, un centre de données flotte en mer',
              why: 'Un centre de données est un bâtiment : la ville B réunit ce qu’il cherche.',
            },
          ],
          quote: VP_LIEUX,
          explain: 'La ville B offre la fibre optique et l’électricité.',
          src: VIE_CENTRES,
        },
      ],
    },
    {
      title: 'Le voyage d’une vidéo',
      lines: [
        'Une vidéo est gardée sur un serveur, dans un bâtiment d’Amérique.',
        'Tu la regardes en France.',
        'Elle traverse l’océan Atlantique avant d’arriver sur ton écran.',
      ],
      qs: [
        {
          q: 'Par quel chemin la vidéo a-t-elle le plus de chances de traverser l’océan ?',
          a: 'par un câble sous-marin',
          wrong: [
            {
              label: 'par un paquebot',
              why: 'Un paquebot transporte des voyageurs, bien trop lentement pour ta vidéo.',
            },
            { label: 'par la route', why: 'Aucune route ne traverse l’océan Atlantique.' },
            { label: 'par un train', why: 'Un train roule sur des rails : il ne traverse pas l’océan Atlantique.' },
          ],
          quote: UE_CABLES,
          explain: '99 % du trafic entre continents passe par les câbles sous-marins.',
          src: EU_CABLES,
        },
        {
          q: 'Dans quel type de bâtiment la vidéo est-elle gardée ?',
          a: 'un centre de données',
          wrong: [
            { label: 'un aéroport', why: 'Un aéroport accueille des avions, il ne garde pas les vidéos.' },
            { label: 'une mairie', why: 'La mairie dirige la commune ; les serveurs sont dans un centre de données.' },
          ],
          quote: VP_CENTRE,
          explain: 'Un bâtiment rempli de serveurs est un centre de données.',
          src: VIE_CENTRES,
        },
      ],
    },
    {
      title: 'Une salle qui chauffe',
      lines: [
        'Dans un bâtiment, des centaines de serveurs fonctionnent jour et nuit.',
        'Ils gardent des photos et des vidéos.',
        'En travaillant, les machines chauffent beaucoup.',
        'Un technicien fait circuler de l’eau près d’elles.',
      ],
      qs: [
        {
          q: 'À quoi sert l’eau dans ce bâtiment ?',
          a: 'à refroidir les serveurs',
          wrong: [
            { label: 'à transporter les vidéos', why: 'Les données voyagent par le réseau, pas dans l’eau.' },
            {
              label: 'à produire l’électricité',
              why: 'Le texte dit que les machines chauffent : l’eau les refroidit.',
            },
            {
              label: 'à protéger les photos de la poussière',
              why: 'L’eau passe près des machines parce qu’elles chauffent.',
            },
          ],
          quote: VP_EAU,
          explain: 'Les serveurs chauffent : l’eau aide à les refroidir.',
          src: VIE_CENTRES,
        },
      ],
    },
  ],
};

// ——— Notion 3 : inégalités d’accès ———

const inegalites: Notion = {
  id: 'gcm2-internet-inegalites',
  classe: 'CM2',
  title: 'Des habitants inégalement connectés',
  hint: 'Tout le monde ne profite pas d’Internet de la même façon : compare les lieux, les âges et les dates.',
  memo: [
    'Dans le monde, tout le monde n’est pas **connecté** : en 2021, près de trois milliards de personnes ne l’étaient pas.',
    'En France, l’**illectronisme** touche des personnes qui n’utilisent pas Internet ou manquent de bases : en 2021, environ 15 personnes de 15 ans ou plus sur 100. De 2021 à 2025, chez les 16-74 ans, le non-usage d’Internet est passé de 10 à 5 sur 100.',
    'Les écarts dépendent de l’âge et du lieu : en 2021, les **DOM** étaient un peu plus touchés que la métropole, et la Bulgarie bien plus que le Danemark.',
  ],
  faits: [
    {
      q: 'En 2021, combien de personnes dans le monde n’étaient pas connectées à Internet ?',
      a: 'près de trois milliards',
      wrong: [
        { label: 'personne', why: 'Au contraire : beaucoup de personnes restaient sans connexion.' },
        { label: 'environ trois cents', why: 'C’est beaucoup trop peu : on compte en milliards.' },
        { label: 'environ trois millions', why: 'Il faut compter mille fois plus : des milliards.' },
      ],
      gap: ['En 2021, près de trois ', ' de personnes n’étaient pas connectées.', ['milliards', 'milliard']],
      quote: VP_MONDE,
      explain: 'L’ONU estimait ce nombre à près de trois milliards.',
      src: VIE_MONDE,
    },
    {
      q: 'Qu’est-ce que l’illectronisme ?',
      a: 'ne pas utiliser Internet ou manquer des bases du numérique',
      wrong: [
        {
          label: 'avoir trop d’ordinateurs chez soi',
          why: 'C’est l’inverse d’un manque : le mot parle de difficulté ou de non-usage.',
        },
        {
          label: 'ne pas savoir réparer un câble sous-marin',
          why: 'Il s’agit des compétences de base, pas d’un métier spécialisé.',
        },
        {
          label: 'une panne d’électricité dans une ville',
          why: 'Le mot décrit la situation d’une personne, pas une panne.',
        },
      ],
      gap: ['Une personne qui ne se sert pas d’Internet est en situation d’', '.', ['illectronisme']],
      quote: VP_ILLECTRONISME,
      explain: 'Illectronisme : ne pas avoir les compétences numériques de base, ou ne pas se servir d’Internet.',
      src: VIE_ILLECTRONISME,
    },
    {
      q: 'En France, en 2021, quelle part des personnes de 15 ans ou plus était en illectronisme ?',
      a: 'environ 15 sur 100',
      wrong: [
        { label: 'aucune', why: 'L’Insee en compte environ 15 sur 100.' },
        { label: 'environ 90 sur 100', why: 'C’est bien trop : la plupart des personnes ne sont pas concernées.' },
        { label: 'environ 50 sur 100', why: 'La moitié serait beaucoup trop : l’Insee mesure environ 15 sur 100.' },
      ],
      gap: [
        'En France, en 2021, environ ',
        ' personnes de 15 ans ou plus sur 100 étaient en illectronisme.',
        ['15', 'quinze'],
      ],
      quote: I_TAUX,
      explain: '15,4 %, c’est environ 15 personnes sur 100.',
      src: INSEE,
    },
    {
      q: 'En France, en 2021, quel âge était le plus touché par l’illectronisme ?',
      a: 'les 75 ans ou plus',
      wrong: [
        { label: 'les 15-24 ans', why: 'Ils étaient les moins touchés : environ 2 sur 100.' },
        { label: 'tous les âges pareil', why: 'Les écarts sont grands selon l’âge.' },
        { label: 'les bébés', why: 'L’étude compte les personnes de 15 ans ou plus.' },
      ],
      gap: ['En France, en 2021, l’illectronisme touchait surtout les personnes de ', ' ans ou plus.', ['75']],
      choix: ['75', '15', '30'],
      quote: I_AGE,
      explain: '62 % des 75 ans ou plus, contre 2 % des 15-24 ans.',
      src: INSEE,
    },
    {
      q: 'En France, en 2021, où l’illectronisme était-il un peu plus fréquent ?',
      a: 'dans les départements d’outre-mer',
      wrong: [
        { label: 'en France métropolitaine', why: 'La métropole comptait 15 %, contre 20 % dans les DOM.' },
        { label: 'pareil partout', why: 'Il y a un écart : 20 % contre 15 %.' },
        { label: 'nulle part en France', why: 'L’illectronisme existe en métropole comme outre-mer.' },
      ],
      gap: [
        'En France, en 2021, l’illectronisme était un peu plus fréquent dans les départements d’outre-',
        '.',
        ['mer'],
      ],
      quote: I_DOM,
      explain: 'Les DOM : 20 %, la France métropolitaine : 15 %.',
      src: INSEE,
    },
    {
      q: 'Chez les 16-74 ans en France, de 2021 à 2025, le non-usage d’Internet a…',
      a: 'baissé',
      wrong: [
        { label: 'augmenté', why: 'La part est passée de 10 % à 5 % : elle a diminué.' },
        { label: 'disparu complètement', why: 'En 2025, 5 % n’utilisaient toujours pas Internet.' },
        { label: 'doublé', why: 'C’est le contraire : la part a été divisée par deux.' },
      ],
      gap: [
        'En France, de 2021 à 2025, la part des 16-74 ans qui n’utilisent pas Internet est passée de 10 % à ',
        ' %.',
        ['5', 'cinq'],
      ],
      quote: VP_BAISSE,
      explain: 'La part est passée de 10 % en 2021 à 5 % en 2025.',
      src: VIE_COMPETENCES,
    },
    {
      q: 'En 2021, quel pays de l’Union européenne avait très peu d’illectronisme ?',
      a: 'le Danemark',
      wrong: [
        { label: 'la Bulgarie', why: 'La Bulgarie était au contraire parmi les pays les plus touchés.' },
        { label: 'la Roumanie', why: 'La Roumanie était en bas du classement : bien plus touchée.' },
        { label: 'la Grèce', why: 'La Grèce était elle aussi parmi les pays les plus touchés.' },
      ],
      gap: ['En 2021, il y avait ', ' d’illectronisme au Danemark qu’en Bulgarie.', ['moins']],
      choix: ['moins', 'plus', 'autant'],
      quote: I_EUROPE,
      explain: 'Chez les 16-74 ans : moins de 5 sur 100 au Danemark, au moins 22 sur 100 en Bulgarie.',
      src: INSEE,
    },
  ],
  paires3: [
    ['Monde, 2021', 'Près de trois milliards de personnes non connectées'],
    ['Illectronisme', 'Pas d’usage d’Internet ou pas les bases'],
    ['Outre-mer', 'Un peu plus touché que la métropole'],
  ],
  paires5: [
    ['Monde, 2021', 'Près de trois milliards de personnes non connectées'],
    ['Illectronisme', 'Pas d’usage d’Internet ou pas les bases'],
    ['Outre-mer', 'Un peu plus touché que la métropole'],
    ['75 ans ou plus', 'L’âge le plus touché en France'],
    ['15-24 ans', 'L’âge très peu touché en France'],
  ],
  libres: [
    {
      q: 'Ne pas se servir d’Internet ou manquer des bases du numérique, c’est l’… (un mot).',
      accepted: ['illectronisme', 'l’illectronisme'],
      traps: [
        { text: 'illettrisme', why: 'L’illettrisme concerne la lecture et l’écriture. Ici, on parle du numérique.' },
        {
          text: 'électricité',
          why: 'L’électricité fait marcher les appareils : ce n’est pas le nom de cette difficulté.',
        },
      ],
      quote: VP_ILLECTRONISME,
      explain: 'Le mot est « illectronisme ».',
      src: VIE_ILLECTRONISME,
    },
    {
      q: 'En 2021, dans le monde, près de … milliards de personnes n’étaient pas connectées (un nombre).',
      accepted: ['trois', '3'],
      traps: [
        { text: 'huit', why: 'Ce serait presque toute la planète. L’estimation est de près de trois milliards.' },
        { text: 'zéro', why: 'Beaucoup de personnes n’étaient pas connectées.' },
      ],
      quote: VP_MONDE,
      explain: 'L’ONU estimait près de trois milliards de personnes non connectées.',
      src: VIE_MONDE,
    },
    {
      q: 'DOM veut dire : départements d’… (un mot composé).',
      accepted: ['outre-mer', 'outre mer'],
      traps: [
        { text: 'montagne', why: 'La montagne est un relief. La lettre M de DOM vient de « mer ».' },
        { text: 'Europe', why: 'DOM désigne les départements situés outre-mer, loin de la métropole.' },
      ],
      quote: I_DOM,
      explain: 'DOM : départements d’outre-mer.',
      src: INSEE,
    },
    {
      q: 'En France, chez les 16-74 ans, de 2021 à 2025, le non-usage d’Internet a … (un verbe au participe passé).',
      accepted: ['baissé', 'diminué', 'baisse', 'diminue', 'reculé', 'chuté', 'chute', 'descendu'],
      traps: [
        { text: 'augmenté', why: 'La part est passée de 10 % à 5 % : elle a diminué.' },
        { text: 'grimpé', why: 'Grimper veut dire monter. La part est descendue.' },
      ],
      quote: VP_BAISSE,
      explain: 'La part a baissé, de 10 % à 5 %.',
      src: VIE_COMPETENCES,
    },
  ],
  docs: [
    {
      title: 'Deux voisins, deux situations',
      lines: [
        'Un jeune de 18 ans envoie des messages et cherche des informations en ligne.',
        'Son voisin de 80 ans n’utilise jamais Internet.',
        'Ils habitent pourtant la même rue.',
      ],
      qs: [
        {
          q: 'Quelle inégalité ce texte montre-t-il ?',
          a: 'une inégalité d’usage entre les âges',
          wrong: [
            { label: 'une inégalité entre deux continents', why: 'Les deux voisins habitent la même rue.' },
            { label: 'aucune différence', why: 'L’un utilise Internet, l’autre jamais.' },
            {
              label: 'une inégalité entre métropole et outre-mer',
              why: 'Ils habitent au même endroit : la différence est l’âge.',
            },
          ],
          quote: I_AGE,
          explain: 'En France, les plus âgés sont bien plus touchés que les plus jeunes.',
          src: INSEE,
        },
      ],
    },
    {
      title: 'Un formulaire en ligne',
      lines: [
        'Une mairie propose de faire une démarche sur Internet.',
        'Une famille la fait en quelques minutes.',
        'Un habitant qui ne sait pas se servir d’Internet est bloqué.',
      ],
      qs: [
        {
          q: 'Dans quelle situation se trouve cet habitant ?',
          a: 'en situation d’illectronisme',
          wrong: [
            { label: 'en situation de cohabitation', why: 'La cohabitation, c’est vivre ensemble au même endroit.' },
            {
              label: 'en voyage à l’étranger',
              why: 'Le texte ne parle pas de voyage : il ne sait pas utiliser Internet.',
            },
            {
              label: 'dans un centre de données',
              why: 'Un centre de données abrite des serveurs, pas cette difficulté.',
            },
          ],
          quote: VP_ILLECTRONISME,
          explain: 'Il ne se sert pas d’Internet : c’est l’illectronisme.',
          src: VIE_ILLECTRONISME,
        },
      ],
    },
    {
      title: 'Deux pays d’Europe',
      lines: [
        'En 2021, on compare des habitants de 16 à 74 ans.',
        'Au Danemark, moins de 5 personnes sur 100 sont en illectronisme.',
        'En Bulgarie, elles sont au moins 22 sur 100.',
        'Les deux pays font partie de l’Union européenne.',
      ],
      qs: [
        {
          q: 'Que montre cette comparaison ?',
          a: 'l’accès au numérique est inégal d’un pays à l’autre',
          wrong: [
            {
              label: 'les deux pays sont dans la même situation',
              why: 'Les nombres sont très différents : moins de 5 contre au moins 22 sur 100.',
            },
            {
              label: 'le Danemark est le pays le plus en difficulté',
              why: 'C’est l’inverse : il compte moins de personnes en illectronisme.',
            },
            {
              label: 'la différence vient de l’âge des deux pays',
              why: 'Le texte compare des lieux, avec la même tranche d’âge.',
            },
          ],
          quote: I_EUROPE,
          explain: 'Entre deux pays, les écarts sont grands : c’est une inégalité entre des lieux.',
          src: INSEE,
        },
      ],
    },
  ],
};

// ——— Notion 4 : les usages ———

const usages: Notion = {
  id: 'gcm2-internet-usages',
  classe: 'CM2',
  title: 'Un habitant connecté au monde',
  hint: 'Pense à ce que tu fais avec Internet : à quelle vitesse ça arrive, à quelle distance, et pour quoi faire ?',
  memo: [
    '**En ligne**, tu communiques, tu cherches des informations ou tu suis des cours, même très loin de chez toi.',
    'Internet change le rapport à l’espace et au temps : c’est l’**immédiateté** (tout de suite) et la **proximité** (comme tout près).',
    'Ces usages posent des questions de **citoyenneté**. Exemple : une démarche en ligne aide beaucoup de gens, mais en exclut certains.',
  ],
  faits: [
    {
      q: 'Ton message arrive presque tout de suite à l’autre bout du monde. C’est…',
      a: 'l’immédiateté',
      wrong: [
        { label: 'la lenteur', why: 'Au contraire : le message arrive très vite.' },
        { label: 'le relief', why: 'Le relief décrit les hauteurs du sol, pas la vitesse d’un message.' },
        { label: 'la production', why: 'La production, c’est fabriquer ou cultiver : ce n’est pas le sujet.' },
      ],
      gap: [
        'Ce qui arrive tout de suite, sans attendre, montre l’',
        '.',
        ['immédiateté', 'immediatete', 'instantanéité', 'instantaneite'],
      ],
      quote: P_USAGES,
      explain: 'Le programme parle d’immédiateté : on n’attend presque pas.',
    },
    {
      q: 'Grâce à Internet, avec qui peux-tu communiquer ?',
      a: 'avec des personnes très éloignées',
      wrong: [
        {
          label: 'seulement avec les personnes de ta classe',
          why: 'Internet permet d’aller bien au-delà de ta classe.',
        },
        { label: 'seulement avec les habitants de ta rue', why: 'La distance n’arrête pas le réseau.' },
        { label: 'avec personne', why: 'Internet sert justement à entrer en contact avec les autres.' },
      ],
      gap: ['Internet permet de contacter les autres, où qu’ils soient dans le ', '.', ['monde']],
      quote: UE_LOIN,
      explain: 'On peut joindre les autres, peu importe où ils se trouvent.',
      src: EU_CONNECT,
    },
    {
      q: 'Quel usage d’Internet permet d’apprendre à distance ?',
      a: 'suivre des cours en ligne',
      wrong: [
        {
          label: 'jouer à un jeu vidéo en ligne',
          why: 'C’est un usage d’Internet, mais il ne sert pas à suivre un cours.',
        },
        { label: 'acheter des chaussures en ligne', why: 'C’est un achat : cela ne sert pas à apprendre une leçon.' },
        { label: 'bloquer la géolocalisation', why: 'Cela protège ta position : ce n’est pas une façon d’apprendre.' },
      ],
      gap: ['Avec Internet, on peut suivre des cours en ', ', loin du professeur.', ['ligne']],
      choix: ['ligne', 'classe', 'récréation'],
      quote: UE_COURS,
      explain: 'On peut suivre des cours en ligne.',
      src: EU_CONNECT,
    },
    {
      q: 'Envoyer un mail ou utiliser un réseau social, c’est surtout…',
      a: 'communiquer',
      wrong: [
        { label: 'cultiver', why: 'Cultiver, c’est faire pousser des plantes.' },
        { label: 'se loger', why: 'Se loger, c’est avoir un endroit où habiter.' },
        { label: 'construire une route', why: 'Un mail ne construit rien : il sert à échanger.' },
      ],
      gap: ['Envoyer un mail, c’est un moyen de ', ' avec les outils numériques.', ['communiquer']],
      choix: ['communiquer', 'cultiver', 'se loger'],
      quote: VP_USAGES,
      explain: 'Mails et réseaux sociaux servent à communiquer.',
      src: VIE_COMPETENCES,
    },
    {
      q: 'Quand les services publics passent sur Internet, que se passe-t-il ?',
      a: 'beaucoup sont aidés, mais certains sont exclus',
      wrong: [
        { label: 'tout le monde est aidé de la même façon', why: 'Non : certaines personnes se retrouvent exclues.' },
        { label: 'plus personne ne peut faire de démarches', why: 'Pour beaucoup, les démarches sont plus simples.' },
        { label: 'les services publics disparaissent', why: 'Ils changent de forme, mais ne disparaissent pas.' },
      ],
      gap: [
        'Les démarches en ligne sont plus simples pour beaucoup, mais elles ',
        ' certaines personnes.',
        ['excluent'],
      ],
      choix: ['excluent', 'aident', 'amusent'],
      quote: VP_DEMARCHES,
      explain: 'La démarche en ligne simplifie pour beaucoup, et exclut certains.',
      src: VIE_COMPETENCES,
    },
  ],
  paires3: [
    ['Immédiateté', 'Presque aucune attente'],
    ['Proximité', 'Se sentir près, même de loin'],
    ['Cours en ligne', 'Apprendre à distance'],
  ],
  paires5: [
    ['Immédiateté', 'Presque aucune attente'],
    ['Proximité', 'Se sentir près, même de loin'],
    ['Cours en ligne', 'Apprendre à distance'],
    ['Messagerie', 'Écrire à quelqu’un'],
    ['Vie privée', 'Ce qu’on protège, comme sa position'],
  ],
  libres: [
    {
      q: 'Avec Internet, un message arrive presque aussitôt : c’est l’… (un mot).',
      accepted: ['immédiateté', 'immediatete', 'l’immédiateté', 'instantanéité', 'instantaneite', 'l’instantanéité'],
      traps: [
        { text: 'proximité', why: 'La proximité parle de la distance (se sentir près). Ici, on parle du temps.' },
        { text: 'attente', why: 'C’est l’inverse : on n’attend presque pas.' },
      ],
      quote: P_USAGES,
      explain: 'Le temps d’attente disparaît presque : c’est l’immédiateté.',
    },
    {
      q: 'Même à des milliers de kilomètres, on se sent près : c’est la … (un mot).',
      accepted: ['proximité', 'proximite', 'la proximité'],
      traps: [
        { text: 'immédiateté', why: 'L’immédiateté parle du temps (tout de suite). Ici, on parle de la distance.' },
        { text: 'distance', why: 'La distance, c’est être loin. Le mot cherché veut dire « être près ».' },
      ],
      quote: P_USAGES,
      explain: 'Se sentir près, c’est la proximité.',
    },
    {
      q: 'Droits, devoirs, respect des autres en ligne : Internet pose des questions de … (un mot de la famille de « citoyen »).',
      accepted: ['citoyenneté', 'citoyennete', 'la citoyenneté', 'civisme'],
      traps: [
        { text: 'météo', why: 'La météo parle du temps qu’il fait.' },
        { text: 'géographie', why: 'La géographie étudie les lieux. Le mot cherché concerne la vie du citoyen.' },
      ],
      quote: P_CITOYEN,
      explain: 'Le programme dit que les usages d’Internet questionnent la citoyenneté.',
    },
    {
      q: 'Bloquer la géolocalisation aide à protéger sa vie … (un mot).',
      accepted: ['privée', 'privee', 'personnelle'],
      traps: [
        { text: 'publique', why: 'La vie publique se voit par tous. On protège sa vie privée.' },
        { text: 'scolaire', why: 'La géolocalisation concerne ta position : elle touche à ta vie privée.' },
      ],
      quote: VP_PRIVE,
      explain: 'Protéger sa vie privée est une compétence numérique. Beaucoup la trouvent difficile.',
      src: VIE_COMPETENCES,
    },
  ],
  docs: [
    {
      title: 'Un appel du soir',
      lines: [
        'Une élève habite à Lille. Son grand-père habite à La Réunion.',
        'Le soir, ils se parlent en vidéo sur Internet.',
        'Ils se voient et se répondent sans attendre.',
      ],
      qs: [
        {
          q: 'Quels deux mots décrivent cet appel ?',
          a: 'immédiateté et proximité',
          wrong: [
            { label: 'relief et climat', why: 'Ces mots décrivent un milieu, pas un échange sur Internet.' },
            {
              label: 'lenteur et éloignement',
              why: 'Ils se répondent sans attendre et se voient comme s’ils étaient près.',
            },
            { label: 'production et logement', why: 'Ces mots parlent d’autres actes de la vie, pas de cet appel.' },
          ],
          quote: P_USAGES,
          explain: 'Sans attendre : immédiateté. Se voir malgré la distance : proximité.',
        },
      ],
    },
    {
      title: 'Une position partagée',
      lines: [
        'Un jeu sur tablette demande à connaître la position du joueur.',
        'La famille décide de bloquer la géolocalisation.',
      ],
      qs: [
        {
          q: 'Que protège la famille ?',
          a: 'sa vie privée',
          wrong: [
            { label: 'les câbles sous-marins', why: 'Bloquer la position ne change rien aux câbles.' },
            { label: 'la vitesse du réseau', why: 'Il ne s’agit pas de vitesse, mais d’informations sur la famille.' },
            { label: 'le paysage', why: 'Le paysage est ce que l’on voit : aucun rapport avec la position partagée.' },
          ],
          quote: VP_PRIVE,
          explain: 'Bloquer la géolocalisation protège des informations privées.',
          src: VIE_COMPETENCES,
        },
      ],
    },
    {
      title: 'La démarche de monsieur Martin',
      lines: [
        'Une mairie propose désormais une inscription sur Internet.',
        'La voisine de monsieur Martin la remplit en dix minutes.',
        'Monsieur Martin ne sait pas utiliser un ordinateur.',
        'Sans aide, il n’arrive pas à s’inscrire.',
      ],
      qs: [
        {
          q: 'Que montre cette situation ?',
          a: 'la démarche en ligne aide certains et en exclut d’autres',
          wrong: [
            {
              label: 'la démarche en ligne est plus simple pour tout le monde',
              why: 'Monsieur Martin n’y arrive pas : elle n’est pas simple pour tous.',
            },
            {
              label: 'la mairie ne propose plus aucune inscription',
              why: 'L’inscription existe toujours, sur Internet.',
            },
            { label: 'personne n’arrive à remplir la démarche', why: 'La voisine la remplit en dix minutes.' },
          ],
          quote: VP_DEMARCHES,
          explain: 'La voisine est aidée, monsieur Martin est mis à l’écart.',
          src: VIE_COMPETENCES,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [reseauMondial, cables, inegalites, usages];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
