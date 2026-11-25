import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM2, thème 3 « Mieux habiter » (lot ge-cm2-03). Chaque fait cite une source du registre avec sa citation exacte :
 * programme du cycle 3, ministère chargé de la transition écologique, INSEE (développement durable), ADEME, CNRTL.
 * Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const TRAME = 'ecologie-trame-verte';
const PLAN = 'ecologie-nature-ville';
const QUARTIER = 'ecologie-ecoquartier';
const BIO = 'ecologie-biodechets';
const CIRC = 'ecologie-economie-circulaire';
const ODD = 'ecologie-odd';
const INSEE = 'insee-developpement-durable';

// Programme du cycle 3.
const Q_PLACE =
  'La place réservée dans la ville aux espaces verts, aux circulations douces, aux berges et corridors verts, au développement de la biodiversité';
const Q_ACTEURS = 'autant d’occasions de réfléchir aux choix des acteurs dans les politiques de développement durable';
const Q_ECHELLES = 'à l’échelle des territoires de proximité (quartier, commune, métropole, région)';

// Ministère chargé de la transition écologique.
const Q_TVB =
  'La trame verte et bleue (TVB) vise à préserver et à restaurer un réseau de continuités écologiques pour que les espèces animales et végétales puissent circuler, s’alimenter, se reproduire, se reposer';
const Q_BLEUE =
  'La trame bleue fait référence aux réseaux aquatiques et humides : fleuves, rivières, canaux, étangs, zones humides';
const Q_VERTE = 'La trame verte fait référence aux milieux naturels et semi-naturels terrestres';
const Q_CORRIDORS = 'constitués de réservoirs de biodiversité reliés les uns aux autres par des corridors écologiques';
const Q_CONNECTER =
  'Le milieu urbain dense est également concerné par la trame verte et bleue. Dans ce contexte, travailler sur la trame verte et bleue implique de connecter les espaces verts';
const Q_GESTES =
  'Arrêter les traitements phytosanitaires, faucher tardivement, planter des essences locales…les actions possibles sont diverses';
const Q_FRAIS =
  'La nature améliore la résilience climatique des villes par le rafraichissement et la limitation des impacts des inondations';
const Q_SANTE =
  'Elle participe aussi à l’amélioration de la santé et du cadre de vie des habitants via la dépollution de l’air, du sol, de l’eau';

const Q_TRI =
  'À compter du 1er janvier 2024, conformément au droit européen et à la loi antigaspillage de 2020, le tri des biodéchets est généralisé et concerne tous les professionnels et les particuliers';
const Q_COMPOSTER =
  'Le compostage domestique consiste à mettre ses déchets de cuisine (épluchures de fruits et légumes, coquilles d’œuf...) ou ses restes de repas (trognons, os, couenne…) dans un composteur';
const Q_TERREAU = 'Le compost se présente comme un terreau qui peut être utilisé sur ses plantes de jardinage';
const Q_VERTS =
  'Les déchets issus de l’entretien des parcs et jardin, aussi appelé « déchets verts », tels que les tontes de pelouse et fauchage, les feuilles mortes';
const Q_LINEAIRE = 'basé sur une économie linéaire (extraire, fabriquer, consommer, jeter)';
const Q_DUREE =
  'L’allongement de la durée d’usage des produits par le recours à la réparation, à la vente ou à l’achat d’occasion, par le don';
const Q_PRIORITE =
  'par ordre de priorité, à la prévention de la production de déchets, notamment par le réemploi des produits, et, suivant la hiérarchie des modes de traitement des déchets, à une réutilisation, à un recyclage ou, à défaut, à une valorisation des déchets';

const Q_FACON =
  'Elle vise à favoriser l’émergence d’une nouvelle façon de concevoir, de construire et de gérer la ville durablement';
const Q_LANCEE = 'lancée en 2009 en application de la loi Grenelle 2';
const Q_LABEL =
  'Le label ÉcoQuartier distingue et valorise des démarches de conception et de réalisation de quartiers qui respectent les principes du développement durable tout en s’adaptant aux caractéristiques de leurs territoires';
const Q_PORTEURS =
  'tous les types de porteurs de projets : collectivités locales, aménageurs, entreprises privées ou collectifs citoyens';
const Q_PROJETS =
  'Elle accompagne tous les types de projets : neufs ou de renouvellement urbain, rénovations de quartiers prioritaires';
const Q_VOLONTAIRE = 'Chercher à obtenir le label ÉcoQuartier est une démarche volontaire et partenariale';
const Q_MODELE = "il ne propose pas de modèle d'ÉcoQuartier, il n'apporte pas de solution toute faite";

const Q_CIRCULAIRE = 'Il s’agit de passer d’une société du tout jetable à un modèle économique plus circulaire';
const Q_AGENDA = 'Les 17 objectifs de développement durable, et leurs 169 cibles forment le cœur de l’agenda 2030';

// INSEE, ADEME, CNRTL.
const Q_DURABLE =
  'un développement qui répond aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs';
const Q_PILIERS = 'un développement économiquement efficace, socialement équitable et écologiquement soutenable';
const Q_NOUVELLES =
  'de nouvelles mobilités se dessinent, notamment avec le développement des pistes cyclables, du covoiturage, de l’autopartage';
const Q_RECYCLER = 'Soumettre au recyclage des déchets naturels ou industriels pour en faire un nouvel usage';
const Q_PASSAGE = "Fait de passer graduellement d'un état à un autre";

// ——— Notion 1 : la nature en ville ———

const natureVille: Notion = {
  classe: 'CM2',
  id: 'gcm2-nature-ville',
  title: 'La nature en ville',
  hint: 'Pense aux plantes et aux animaux : où peuvent-ils vivre et circuler dans la ville ?',
  memo: [
    'En ville, on peut faire de la place à la nature : parcs, berges, arbres. C’est bon pour la **biodiversité**.',
    'La **trame verte et bleue** relie les milieux naturels : le vert sur la terre, le bleu dans l’eau. Un **corridor écologique** est un passage pour les espèces.',
    'La nature rafraîchit aussi la ville. Exemple : un parc relié à la rivière par une allée d’arbres.',
  ],
  faits: [
    {
      q: 'À quoi sert la trame verte et bleue pour les animaux et les plantes ?',
      a: 'à leur permettre de circuler et de vivre',
      wrong: [
        { label: 'à les enfermer chacun dans un seul parc', why: 'Au contraire : elle relie les milieux naturels.' },
        {
          label: 'à les remplacer par des routes',
          why: 'Elle préserve et restaure des milieux naturels, elle ne les remplace pas.',
        },
        {
          label: 'à les peindre en vert et en bleu',
          why: 'Les couleurs sont des images : le vert désigne la terre, le bleu désigne l’eau.',
        },
      ],
      gap: [
        'La trame verte et bleue aide les espèces animales et végétales à ',
        ', à se nourrir et à se reproduire.',
        ['circuler', 'se déplacer'],
      ],
      quote: Q_TVB,
      explain: 'Les espèces doivent pouvoir circuler, s’alimenter, se reproduire et se reposer.',
      src: TRAME,
    },
    {
      q: 'Dans la trame verte et bleue, que désigne la trame bleue ?',
      a: 'les rivières, les étangs et les zones humides',
      wrong: [
        { label: 'les toits des immeubles', why: 'La trame bleue concerne l’eau, pas les toits.' },
        { label: 'les pistes cyclables', why: 'Une piste cyclable sert aux vélos : ce n’est pas un milieu d’eau.' },
        { label: 'les milieux naturels sur la terre ferme', why: 'Ceux-là forment la trame verte.' },
      ],
      gap: ['La trame ', ' désigne les milieux d’eau et les milieux humides.', ['bleue']],
      quote: Q_BLEUE,
      explain: 'La trame bleue regroupe les réseaux d’eau et les zones humides.',
      src: TRAME,
    },
    {
      q: 'Que relie un corridor écologique ?',
      a: 'des réservoirs de biodiversité',
      wrong: [
        { label: 'des parkings', why: 'Un parking accueille des voitures, pas une riche variété d’êtres vivants.' },
        { label: 'des salles de cinéma', why: 'Le corridor écologique concerne les milieux naturels.' },
        { label: 'des prises électriques', why: 'Le mot « réseau » parle ici de nature, pas d’électricité.' },
      ],
      gap: ['Les réservoirs de biodiversité sont reliés par des ', ' écologiques.', ['corridors', 'corridor']],
      quote: Q_CORRIDORS,
      explain: 'Les corridors écologiques relient les réservoirs de biodiversité entre eux.',
      src: TRAME,
    },
    {
      q: 'Que peut apporter la nature à une ville quand il fait chaud ?',
      a: 'du rafraîchissement',
      wrong: [
        { label: 'davantage de chaleur', why: 'La nature aide au contraire à rafraîchir la ville.' },
        { label: 'de la neige en été', why: 'La nature rafraîchit, mais elle ne fait pas neiger.' },
        { label: 'plus de bruit de moteurs', why: 'Les moteurs ne viennent pas de la nature.' },
      ],
      gap: [
        'En ville, la nature rafraîchit et limite les effets des ',
        ' quand l’eau déborde.',
        ['inondations', 'inondation'],
      ],
      quote: Q_FRAIS,
      explain: 'La nature rafraîchit la ville et limite les effets des inondations.',
      src: PLAN,
    },
    {
      q: 'Quel geste favorise la nature dans les espaces verts ?',
      a: 'planter des espèces d’arbres de la région',
      wrong: [
        {
          label: 'couvrir toute la pelouse de béton',
          why: 'Le béton retire de la place à la nature.',
        },
        {
          label: 'tondre le plus souvent possible',
          why: 'La source conseille au contraire de faucher tard.',
        },
        {
          label: 'ajouter des produits chimiques sur les plantes',
          why: 'La source conseille d’arrêter les traitements chimiques.',
        },
      ],
      gap: ['Pour aider la biodiversité, on peut planter des essences ', '.', ['locales', 'locale', 'régionales']],
      quote: Q_GESTES,
      explain: 'Les « essences locales » sont les espèces d’arbres et de plantes de la région.',
      src: TRAME,
    },
  ],
  paires3: [
    ['Biodiversité', 'La variété des êtres vivants'],
    ['Trame bleue', 'Les milieux d’eau et humides'],
    ['Corridor écologique', 'Un passage entre des milieux naturels'],
  ],
  paires5: [
    ['Biodiversité', 'La variété des êtres vivants'],
    ['Trame bleue', 'Les milieux d’eau et humides'],
    ['Corridor écologique', 'Un passage entre des milieux naturels'],
    ['Trame verte', 'Les milieux naturels sur la terre'],
    ['Berge', 'Le bord d’une rivière'],
  ],
  libres: [
    {
      q: 'Quel mot désigne la variété des êtres vivants (il commence par « bio ») ?',
      accepted: ['biodiversité', 'la biodiversité'],
      traps: [
        { text: 'biodéchet', why: 'Un biodéchet est un reste de cuisine ou de jardin.' },
        { text: 'biologie', why: 'La biologie est la science du vivant, pas sa variété.' },
      ],
      quote: Q_PLACE,
      explain: 'Le programme parle du développement de la biodiversité dans la ville.',
    },
    {
      q: 'La trame des rivières et des étangs porte le nom d’une couleur : laquelle ?',
      accepted: ['bleue', 'bleu', 'la trame bleue', 'trame bleue'],
      traps: [
        { text: 'verte', why: 'La trame verte concerne les milieux naturels sur la terre.' },
        { text: 'noire', why: 'La trame noire parle de la nuit et de l’éclairage.' },
      ],
      quote: Q_BLEUE,
      explain: 'L’eau fait partie de la trame bleue.',
      src: TRAME,
    },
    {
      q: 'La trame des milieux naturels sur la terre porte le nom d’une couleur : laquelle ?',
      accepted: ['verte', 'vert', 'la trame verte', 'trame verte'],
      traps: [
        { text: 'bleue', why: 'La trame bleue concerne l’eau.' },
        { text: 'marron', why: 'La source parle d’une trame verte, pas marron.' },
      ],
      quote: Q_VERTE,
      explain: 'Les milieux naturels de la terre forment la trame verte.',
      src: TRAME,
    },
  ],
  docs: [
    {
      title: 'Le projet du quartier des Saules',
      lines: [
        'Deux petits parcs sont séparés par de grandes rues.',
        'La commune veut planter une longue allée d’arbres entre les deux parcs.',
        'Les oiseaux et les insectes pourront passer de l’un à l’autre.',
      ],
      qs: [
        {
          q: 'Quel rôle jouera l’allée d’arbres ?',
          a: 'un passage entre deux milieux naturels',
          wrong: [
            { label: 'un parking pour les voitures', why: 'Le texte parle d’arbres et d’animaux, pas de voitures.' },
            { label: 'une barrière contre les oiseaux', why: 'Au contraire, les oiseaux pourront passer.' },
          ],
          quote: Q_CONNECTER,
          explain: 'En ville, on relie les espaces verts pour que les espèces circulent.',
          src: TRAME,
        },
      ],
    },
    {
      title: 'Une cour qui change',
      lines: [
        'La cour d’une école est entièrement recouverte de goudron. En été, il y fait très chaud.',
        'On retire une partie du goudron pour planter des arbres et des buissons.',
      ],
      qs: [
        {
          q: 'Quel effet peut-on attendre des plantations ?',
          a: 'une cour plus fraîche',
          wrong: [
            { label: 'une cour plus chaude', why: 'La nature aide à rafraîchir la ville.' },
            { label: 'moins d’êtres vivants', why: 'Des plantes en plus offrent de la place au vivant.' },
          ],
          quote: Q_FRAIS,
          explain: 'La nature améliore la résistance des villes à la chaleur en les rafraîchissant.',
          src: PLAN,
        },
        {
          q: 'En plus de la fraîcheur, que peut améliorer cette nature ?',
          a: 'le cadre de vie des élèves',
          wrong: [
            { label: 'la vitesse des voitures', why: 'Les plantations ne concernent pas la vitesse des voitures.' },
            { label: 'la quantité de goudron', why: 'On a justement retiré du goudron.' },
          ],
          quote: Q_SANTE,
          explain: 'La nature participe à améliorer la santé et le cadre de vie des habitants.',
          src: PLAN,
        },
      ],
    },
  ],
};

// ——— Notion 2 : recycler ———

const recycler: Notion = {
  classe: 'CM2',
  id: 'gcm2-recycler',
  title: 'Recycler',
  hint: 'Pose-toi la question : l’objet est-il évité, utilisé encore, ou transformé ?',
  memo: [
    '**Recycler**, c’est traiter des déchets pour en faire un nouvel usage. Trier ne suffit pas : c’est le début.',
    'Mieux vaut d’abord éviter le déchet, par exemple avec le **réemploi** : on donne ou on répare un objet.',
    'Les **biodéchets** peuvent devenir du **compost**. Exemple : des épluchures nourrissent ensuite le jardin.',
  ],
  faits: [
    {
      q: 'Que veut dire recycler un déchet ?',
      a: 'le traiter pour en faire un nouvel usage',
      wrong: [
        { label: 'le laisser par terre', why: 'Un déchet abandonné n’a aucun nouvel usage.' },
        { label: 'le cacher dans un placard', why: 'Le cacher ne le transforme pas.' },
        { label: 'le jeter avec tout le reste', why: 'Un déchet mélangé et jeté n’est pas recyclé.' },
      ],
      gap: ['Recycler des déchets, c’est les traiter pour en faire un nouvel ', '.', ['usage', 'emploi']],
      quote: Q_RECYCLER,
      explain: 'Recycler donne un nouvel usage à la matière des déchets.',
      src: 'cnrtl-recycler',
    },
    {
      q: 'Que peut-on mettre dans un composteur ?',
      a: 'des épluchures de légumes',
      wrong: [
        { label: 'une bouteille en verre', why: 'Le verre n’est pas un reste de cuisine qui se décompose.' },
        { label: 'une pile usée', why: 'Une pile n’est pas un déchet de cuisine.' },
        { label: 'un jouet en plastique', why: 'Le plastique du jouet n’est pas un reste de repas.' },
      ],
      gap: [
        'Dans un composteur, on met des déchets de cuisine, comme des ',
        ' de fruits et de légumes.',
        ['épluchures', 'épluchure', 'pelures', 'pelure'],
      ],
      quote: Q_COMPOSTER,
      explain: 'Épluchures, coquilles d’œuf et restes de repas vont au composteur.',
      src: BIO,
    },
    {
      q: 'À quoi peut servir le compost fait à la maison ?',
      a: 'à nourrir les plantes du jardin',
      wrong: [
        { label: 'à fabriquer des vitres', why: 'Le compost ressemble à un terreau, pas à du verre.' },
        { label: 'à faire rouler une voiture', why: 'Le compost est utilisé pour le jardinage.' },
        { label: 'à emballer les cadeaux', why: 'Le compost est une sorte de terre, pas un emballage.' },
      ],
      gap: ['Le compost se présente comme un ', ' que l’on utilise pour ses plantes.', ['terreau', 'engrais']],
      quote: Q_TERREAU,
      explain: 'Le compost est un terreau utile pour les plantes de jardinage.',
      src: BIO,
    },
    {
      q: 'Depuis le 1er janvier 2024 en France, qui est concerné par le tri des biodéchets ?',
      a: 'les particuliers comme les professionnels',
      wrong: [
        { label: 'seulement les restaurants', why: 'Les particuliers sont concernés aussi.' },
        { label: 'seulement les jardiniers', why: 'Le tri concerne tout le monde, pas un seul métier.' },
        { label: 'personne', why: 'Le tri des biodéchets est généralisé.' },
      ],
      gap: ['Le tri des biodéchets concerne les professionnels et les ', '.', ['particuliers', 'ménages']],
      quote: Q_TRI,
      explain: 'Le tri est généralisé : il concerne les professionnels et les particuliers.',
      src: BIO,
    },
    {
      q: 'Quel geste permet à un objet de servir plus longtemps ?',
      a: 'le réparer',
      wrong: [
        { label: 'le jeter tout de suite', why: 'Jeter arrête l’usage de l’objet.' },
        { label: 'le brûler', why: 'Un objet brûlé ne sert plus.' },
        { label: 'en acheter un neuf sans raison', why: 'Cela ne prolonge pas la vie de l’ancien objet.' },
      ],
      gap: ['Pour qu’un objet dure, on peut le donner, le vendre d’occasion ou, s’il est cassé, le ', '.', ['réparer']],
      quote: Q_DUREE,
      explain: 'La réparation, l’occasion et le don allongent la durée d’usage des produits.',
      src: CIRC,
    },
  ],
  paires3: [
    ['Recycler', 'Traiter des déchets pour un nouvel usage'],
    ['Biodéchet', 'Reste de cuisine ou de jardin'],
    ['Réemploi', 'Utiliser encore un objet'],
  ],
  paires5: [
    ['Recycler', 'Traiter des déchets pour un nouvel usage'],
    ['Biodéchet', 'Reste de cuisine ou de jardin'],
    ['Réemploi', 'Utiliser encore un objet'],
    ['Composteur', 'Bac où des restes se transforment'],
    ['Déchets verts', 'Tontes de pelouse et feuilles mortes'],
  ],
  ordre: ['éviter de produire le déchet', 'réutiliser', 'recycler', 'valoriser d’une autre façon'],
  consigne: {
    prompt: 'Range ces choix face aux déchets, du premier à préférer au dernier.',
    hint: 'Le meilleur déchet est celui que l’on ne produit pas.',
    why: 'La loi donne un ordre de priorité : prévention, réutilisation, recyclage, puis valorisation.',
    fin: 'Le premier choix est',
    quote: Q_PRIORITE,
    src: CIRC,
  },
  libres: [
    {
      q: 'Quel verbe veut dire « traiter des déchets pour en faire un nouvel usage » ?',
      accepted: ['recycler'],
      traps: [
        { text: 'jeter', why: 'Jeter ne donne pas de nouvel usage.' },
        { text: 'trier', why: 'Trier, c’est séparer les déchets. Le traitement vient après.' },
      ],
      quote: Q_RECYCLER,
      explain: 'Le verbe est recycler.',
      src: 'cnrtl-recycler',
    },
    {
      q: 'Comment appelle-t-on le terreau obtenu avec les biodéchets dans un composteur ?',
      accepted: ['compost', 'le compost', 'du compost'],
      traps: [
        { text: 'composteur', why: 'Le composteur est le bac. On demande ce qu’on obtient.' },
        { text: 'plastique', why: 'Le plastique n’est pas fabriqué avec des restes de cuisine.' },
      ],
      quote: Q_TERREAU,
      explain: 'On obtient du compost.',
      src: BIO,
    },
    {
      q: 'Les tontes de pelouse et les feuilles mortes sont des déchets … (une couleur).',
      accepted: ['verts', 'vert', 'déchets verts'],
      traps: [
        { text: 'bleus', why: 'On parle de « déchets verts » pour les parcs et les jardins.' },
        { text: 'jaunes', why: 'Même sèches, les feuilles mortes sont classées dans les déchets verts.' },
      ],
      quote: Q_VERTS,
      explain: 'Les déchets des parcs et jardins sont appelés déchets verts.',
      src: BIO,
    },
  ],
  docs: [
    {
      title: 'À la cantine',
      lines: [
        'Après le repas, les élèves mettent les épluchures et les restes dans un bac à part.',
        'Un composteur est installé près du potager de l’école.',
        'Au printemps, les élèves étalent le compost au pied des plantes.',
      ],
      qs: [
        {
          q: 'Que deviennent les restes du repas dans ce texte ?',
          a: 'un compost utile au potager',
          wrong: [
            { label: 'du verre neuf', why: 'Des restes de repas ne deviennent pas du verre.' },
            { label: 'des déchets mélangés à la poubelle', why: 'Les élèves les mettent dans un bac à part.' },
          ],
          quote: Q_TERREAU,
          explain: 'Triés puis compostés, les restes servent aux plantes.',
          src: BIO,
        },
      ],
    },
    {
      title: 'Le vélo de Sami',
      lines: [
        'Un enfant a un vélo devenu trop petit. Il roule encore bien.',
        'Sa famille le donne à une voisine plus jeune au lieu de le jeter.',
      ],
      qs: [
        {
          q: 'Pourquoi ce don limite-t-il les déchets ?',
          a: 'parce que le vélo sert plus longtemps',
          wrong: [
            { label: 'parce que le vélo est fondu', why: 'Le vélo n’est pas transformé : il roule encore.' },
            { label: 'parce que le vélo va au composteur', why: 'Un vélo n’est pas un reste de cuisine.' },
          ],
          quote: Q_DUREE,
          explain: 'Le don allonge la durée d’usage d’un produit.',
          src: CIRC,
        },
        {
          q: 'Comment appeler le modèle « fabriquer, consommer, jeter » que la famille évite ?',
          a: 'une économie linéaire',
          wrong: [
            { label: 'une économie circulaire', why: 'L’économie circulaire cherche justement à moins jeter.' },
            { label: 'un compostage', why: 'Le compostage transforme des restes naturels.' },
          ],
          quote: Q_LINEAIRE,
          explain: 'L’économie linéaire va tout droit : extraire, fabriquer, consommer, jeter.',
          src: CIRC,
        },
      ],
    },
  ],
};

// ——— Notion 3 : l'écoquartier ———

const ecoquartier: Notion = {
  classe: 'CM2',
  id: 'gcm2-ecoquartier',
  title: 'Habiter un écoquartier',
  hint: 'Pense à un quartier : comment est-il conçu pour durer, et qui porte le projet ?',
  memo: [
    'Un **écoquartier** est un quartier pensé, construit et géré pour le **développement durable**.',
    'Il peut être neuf ou rénové. Il n’y a pas de modèle unique : chaque projet s’adapte à son territoire.',
    'Le **label** ÉcoQuartier distingue des quartiers qui respectent ces principes. Exemple : une commune demande ce label.',
  ],
  faits: [
    {
      q: 'La démarche ÉcoQuartier veut une nouvelle façon de concevoir, construire et gérer la ville…',
      a: 'durablement',
      wrong: [
        { label: 'le plus vite possible', why: 'La démarche vise la durée, pas la vitesse.' },
        { label: 'sans aucun habitant', why: 'Un quartier est fait pour des habitants.' },
        { label: 'pour un seul été', why: 'La ville durable est pensée pour longtemps.' },
      ],
      gap: ['Un écoquartier vise à concevoir, construire et gérer la ville de façon ', '.', ['durable']],
      quote: Q_FACON,
      explain: 'La démarche vise à concevoir, construire et gérer la ville durablement.',
      src: QUARTIER,
    },
    {
      q: 'Que distingue le label ÉcoQuartier ?',
      a: 'des quartiers qui respectent le développement durable',
      wrong: [
        { label: 'les quartiers les plus bruyants', why: 'Le label ne récompense pas le bruit.' },
        { label: 'les magasins les moins chers', why: 'Le label porte sur des quartiers, pas sur des prix.' },
        { label: 'les rues les plus longues', why: 'La longueur d’une rue n’est pas un principe durable.' },
      ],
      gap: [
        'Le label ÉcoQuartier distingue des quartiers qui respectent les principes du développement ',
        '.',
        ['durable'],
      ],
      quote: Q_LABEL,
      explain: 'Le label valorise des quartiers qui respectent le développement durable.',
      src: QUARTIER,
    },
    {
      q: 'Un écoquartier peut-il concerner un quartier déjà construit ?',
      a: 'oui, il peut être neuf ou rénové',
      wrong: [
        { label: 'non, il doit être entièrement neuf', why: 'La démarche accompagne aussi les rénovations.' },
        { label: 'non, il doit être sans maisons', why: 'Un quartier comprend des lieux où vivre.' },
        {
          label: 'oui, mais seulement à Paris',
          why: 'La démarche concerne la métropole et l’outre-mer, villes et campagnes.',
        },
      ],
      gap: [
        'Un projet d’écoquartier peut être neuf ou concerner la ',
        ' de quartiers anciens.',
        ['rénovation', 'réhabilitation'],
      ],
      quote: Q_PROJETS,
      explain: 'Projets neufs, renouvellement urbain et rénovations sont accompagnés.',
      src: QUARTIER,
    },
    {
      q: 'Qui peut porter un projet d’écoquartier ?',
      a: 'une commune, une entreprise ou un groupe de citoyens',
      wrong: [
        { label: 'seulement les enfants', why: 'Les porteurs cités sont des collectivités, entreprises ou citoyens.' },
        { label: 'seulement un roi', why: 'La France n’a pas de roi pour décider des quartiers.' },
        {
          label: 'seulement un pays étranger',
          why: 'Des acteurs locaux peuvent porter le projet.',
        },
      ],
      gap: [
        'Des collectivités locales, des entreprises ou des collectifs de ',
        ' peuvent porter un projet.',
        ['citoyens', 'citoyen', 'habitants'],
      ],
      quote: Q_PORTEURS,
      explain: 'Collectivités, aménageurs, entreprises privées ou collectifs citoyens peuvent porter un projet.',
      src: QUARTIER,
    },
    {
      q: 'Existe-t-il un modèle unique d’écoquartier à copier partout ?',
      a: 'non, chaque territoire trouve ses réponses',
      wrong: [
        { label: 'oui, un seul plan pour toute la France', why: 'Le label ne propose pas de modèle tout fait.' },
        { label: 'oui, tous les immeubles sont identiques', why: 'Les projets s’adaptent à leur territoire.' },
        { label: 'oui, celui de la plus grande ville', why: 'Aucune ville ne sert de modèle à copier.' },
      ],
      gap: ['Le label ne propose pas de ', ' d’écoquartier à copier.', ['modèle']],
      quote: Q_MODELE,
      explain: 'La démarche n’apporte pas de solution toute faite.',
      src: QUARTIER,
    },
  ],
  paires3: [
    ['Écoquartier', 'Quartier pensé pour le développement durable'],
    ['Label', 'Marque qui reconnaît un projet'],
    ['Rénovation', 'Remise en bon état'],
  ],
  paires5: [
    ['Écoquartier', 'Quartier pensé pour le développement durable'],
    ['Label', 'Marque qui reconnaît un projet'],
    ['Rénovation', 'Remise en bon état'],
    ['Acteur', 'Personne ou groupe qui agit'],
    ['Projet neuf', 'Quartier qui n’existait pas encore'],
  ],
  libres: [
    {
      q: 'Comment s’appelle un quartier pensé, construit et géré pour le développement durable ?',
      accepted: ['écoquartier', 'un écoquartier', 'l’écoquartier', 'éco-quartier', 'un éco-quartier'],
      traps: [
        { text: 'lotissement', why: 'Un lotissement est un ensemble de terrains : rien n’y dit « durable ».' },
        { text: 'métropole', why: 'Une métropole est bien plus grande qu’un quartier.' },
      ],
      quote: Q_FACON,
      explain: 'La démarche qui vise la ville durable à l’échelle d’un quartier s’appelle ÉcoQuartier.',
      src: QUARTIER,
    },
    {
      q: 'En quelle année la démarche ÉcoQuartier a-t-elle été lancée ?',
      accepted: ['2009', 'en 2009'],
      traps: [
        { text: '2030', why: '2030 est l’horizon de l’agenda 2030, pas le lancement.' },
        { text: '1992', why: '1992 est l’année du Sommet de la Terre à Rio.' },
      ],
      quote: Q_LANCEE,
      explain: 'La démarche a été lancée en 2009.',
      src: QUARTIER,
    },
    {
      q: 'Quel mot désigne la marque ÉcoQuartier qui distingue des quartiers (un mot de cinq lettres) ?',
      accepted: ['label', 'un label', 'le label'],
      traps: [
        { text: 'lac', why: 'Un lac est une étendue d’eau.' },
        { text: 'loi', why: 'Une loi est une règle. La marque s’appelle un label.' },
      ],
      quote: Q_LABEL,
      explain: 'On parle du label ÉcoQuartier.',
      src: QUARTIER,
    },
  ],
  docs: [
    {
      title: 'Une ancienne usine',
      lines: [
        'Dans une commune, une usine fermée laisse un grand terrain vide près du centre.',
        'La mairie et des habitants préparent ensemble des logements, un jardin et des pistes cyclables.',
        'Ils veulent demander le label ÉcoQuartier.',
      ],
      qs: [
        {
          q: 'Pourquoi ce projet peut-il entrer dans la démarche ?',
          a: 'parce qu’elle accompagne aussi la transformation de la ville existante',
          wrong: [
            {
              label: 'parce qu’il faut toujours construire dans les champs',
              why: 'La démarche privilégie les projets qui évitent d’étendre le sol construit.',
            },
            {
              label: 'parce que la demande du label est obligatoire',
              why: 'Demander le label est une démarche volontaire.',
            },
          ],
          quote: Q_PROJETS,
          explain: 'Le renouvellement urbain, c’est refaire la ville sur la ville : il est accompagné.',
          src: QUARTIER,
        },
        {
          q: 'La mairie est-elle obligée de demander le label ?',
          a: 'non, c’est un choix volontaire',
          wrong: [
            { label: 'oui, tous les quartiers doivent le demander', why: 'La démarche est volontaire.' },
            { label: 'oui, sinon les habitants doivent partir', why: 'Rien de tel : le label est un choix.' },
          ],
          quote: Q_VOLONTAIRE,
          explain: 'Chercher à obtenir le label est une démarche volontaire et partagée.',
          src: QUARTIER,
        },
      ],
    },
    {
      title: 'Deux communes, deux projets',
      lines: [
        'Une commune de montagne et une commune au bord de la mer préparent chacune un écoquartier.',
        'Leurs plans sont très différents.',
      ],
      qs: [
        {
          q: 'Pourquoi des plans différents sont-ils normaux ?',
          a: 'parce que chaque quartier s’adapte à son territoire',
          wrong: [
            { label: 'parce qu’une des communes s’est trompée', why: 'Il n’y a pas un seul bon plan.' },
            { label: 'parce qu’il faut copier un modèle unique', why: 'La démarche ne propose pas de modèle.' },
          ],
          quote: Q_LABEL,
          explain: 'Le label valorise des quartiers adaptés aux caractéristiques de leur territoire.',
          src: QUARTIER,
        },
      ],
    },
  ],
};

// ——— Notion 4 : la transition ———

const transition: Notion = {
  classe: 'CM2',
  id: 'gcm2-transition',
  title: 'La transition vers un développement durable',
  hint: 'Pense au présent et à l’avenir : qui choisit, et pour qui ?',
  memo: [
    'Une **transition** est un passage, souvent petit à petit, d’un état à un autre. Exemple : passer du tout jetable au réemploi.',
    'Le **développement durable** répond aux besoins d’aujourd’hui en pensant aux **générations** futures.',
    'Des **acteurs** font des choix pour mieux habiter : habitants, communes, entreprises.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’une transition ?',
      a: 'un passage graduel d’un état à un autre',
      wrong: [
        { label: 'un arrêt définitif', why: 'Une transition est un passage : quelque chose change.' },
        { label: 'une fête de quartier', why: 'Une fête n’est pas un changement d’état.' },
        { label: 'un retour immédiat en arrière', why: 'La transition fait passer vers un autre état, petit à petit.' },
      ],
      gap: ['Une transition fait passer petit à petit d’un état à un ', '.', ['autre']],
      quote: Q_PASSAGE,
      explain: 'Graduellement veut dire petit à petit.',
      src: 'cnrtl-transition',
    },
    {
      q: 'Le développement durable répond aux besoins du présent en pensant aussi à qui ?',
      a: 'aux générations futures',
      wrong: [
        { label: 'à personne d’autre', why: 'Il ne doit pas compromettre l’avenir des suivants.' },
        { label: 'aux seuls adultes d’aujourd’hui', why: 'La définition parle aussi de l’avenir.' },
        { label: 'aux personnages de contes', why: 'Il s’agit de personnes réelles qui vivront après nous.' },
      ],
      gap: [
        'Le développement durable ne doit pas empêcher les générations ',
        ' de répondre à leurs besoins.',
        ['futures', 'future', 'à venir'],
      ],
      quote: Q_DURABLE,
      explain: 'Répondre à aujourd’hui sans compromettre demain.',
      src: INSEE,
    },
    {
      q: 'Quels sont les trois piliers du développement durable ?',
      a: 'l’économie, l’écologie et le social',
      wrong: [
        { label: 'le sport, la musique et le cinéma', why: 'Ce sont des loisirs, pas les trois piliers.' },
        { label: 'le soleil, la pluie et le vent', why: 'Ce sont des éléments du temps qu’il fait.' },
        { label: 'la route, le rail et l’avion', why: 'Ce sont des moyens de transport.' },
      ],
      gap: [
        'Les trois piliers du développement durable : l’économie, le social et l’',
        '.',
        ['écologie', 'environnement'],
      ],
      quote: Q_PILIERS,
      explain: 'Un développement efficace, équitable (juste) et soutenable pour la nature.',
      src: INSEE,
    },
    {
      q: 'De quelle société l’économie circulaire veut-elle sortir ?',
      a: 'la société du tout jetable',
      wrong: [
        { label: 'la société de la réparation', why: 'La réparation fait justement partie de la solution.' },
        { label: 'la société du don', why: 'Le don aide à faire durer les objets.' },
        { label: 'la société de la lecture', why: 'La lecture n’a pas de lien avec les déchets.' },
      ],
      gap: ['L’économie circulaire veut passer d’une société du tout ', ' à un modèle plus circulaire.', ['jetable']],
      quote: Q_CIRCULAIRE,
      explain: 'On cherche à moins jeter et moins gaspiller.',
      src: CIRC,
    },
    {
      q: 'Quel aménagement fait partie des nouvelles façons de se déplacer ?',
      a: 'des pistes cyclables',
      wrong: [
        { label: 'une salle de cinéma', why: 'Elle ne sert pas à se déplacer.' },
        {
          label: 'une voiture pour chaque trajet, toujours seul',
          why: 'Le partage et le vélo sont les nouveautés citées.',
        },
        { label: 'une piscine privée', why: 'Une piscine n’est pas un moyen de se déplacer.' },
      ],
      gap: ['De nouvelles mobilités se développent avec les pistes ', ' et le covoiturage.', ['cyclables', 'cyclable']],
      quote: Q_NOUVELLES,
      explain: 'Pistes cyclables, covoiturage et autopartage sont cités par l’ADEME.',
      src: 'ademe-trajets',
    },
  ],
  paires3: [
    ['Transition', 'Passage d’un état à un autre'],
    ['Génération future', 'Les personnes qui viendront après nous'],
    ['Acteur', 'Personne ou groupe qui agit'],
  ],
  paires5: [
    ['Transition', 'Passage d’un état à un autre'],
    ['Génération future', 'Les personnes qui viendront après nous'],
    ['Acteur', 'Personne ou groupe qui agit'],
    ['Développement durable', 'Penser au présent et à l’avenir'],
    ['Covoiturage', 'Partager une voiture pour un trajet'],
  ],
  libres: [
    {
      q: 'Quel mot désigne un passage, petit à petit, d’un état à un autre (il commence par « tra ») ?',
      accepted: ['transition', 'la transition', 'une transition'],
      traps: [
        { text: 'transport', why: 'Un transport déplace des personnes ou des choses.' },
        { text: 'tradition', why: 'Une tradition se transmet : ce n’est pas un passage vers un autre état.' },
      ],
      quote: Q_PASSAGE,
      explain: 'Le mot est transition.',
      src: 'cnrtl-transition',
    },
    {
      q: 'Quel adjectif complète « développement … » : répondre au présent sans compromettre l’avenir ?',
      accepted: ['durable', 'développement durable'],
      traps: [
        { text: 'rapide', why: 'La vitesse ne dit rien des générations futures.' },
        { text: 'urbain', why: 'Urbain veut dire « de la ville ».' },
      ],
      quote: Q_DURABLE,
      explain: 'On parle de développement durable.',
      src: INSEE,
    },
    {
      q: 'Combien l’agenda 2030 compte-t-il d’objectifs de développement durable ?',
      accepted: ['17', 'dix-sept', '17 objectifs'],
      traps: [
        { text: '3', why: 'Trois est le nombre de piliers.' },
        { text: '169', why: '169 est le nombre de cibles, plus précises que les objectifs.' },
      ],
      quote: Q_AGENDA,
      explain: 'Il y a 17 objectifs et 169 cibles.',
      src: ODD,
    },
  ],
  docs: [
    {
      title: 'Le conseil du quartier',
      lines: [
        'La commune veut transformer une rue très passante.',
        'Des habitants demandent des arbres et une piste cyclable.',
        'Des commerçants demandent des places de livraison. La mairie réunit tout le monde.',
      ],
      qs: [
        {
          q: 'Que montre cette réunion ?',
          a: 'plusieurs acteurs participent aux choix',
          wrong: [
            { label: 'une seule personne a un avis', why: 'Habitants, commerçants et mairie sont présents.' },
            { label: 'la rue ne peut jamais changer', why: 'La commune veut justement la transformer.' },
          ],
          quote: Q_ACTEURS,
          explain: 'Le programme invite à réfléchir aux choix des acteurs.',
        },
        {
          q: 'À quelle échelle ce projet se déroule-t-il ?',
          a: 'un territoire de proximité',
          wrong: [
            { label: 'la planète entière', why: 'Il s’agit d’une rue d’une commune.' },
            { label: 'un autre continent', why: 'Le projet est tout près des habitants.' },
          ],
          quote: Q_ECHELLES,
          explain: 'Quartier et commune sont des territoires de proximité.',
        },
      ],
    },
    {
      title: 'Choisir pour demain',
      lines: [
        'Une ville garde un espace naturel au lieu de tout construire.',
        'Elle explique : « Les enfants de demain en auront besoin aussi. »',
      ],
      qs: [
        {
          q: 'À quelle idée ce choix correspond-il le mieux ?',
          a: 'le développement durable',
          wrong: [
            { label: 'le tout jetable', why: 'Le tout jetable ne garde rien pour demain.' },
            {
              label: 'un développement sans penser à l’avenir',
              why: 'La ville parle justement des enfants de demain.',
            },
          ],
          quote: Q_DURABLE,
          explain: 'La ville pense aux besoins des générations futures.',
          src: INSEE,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [natureVille, recycler, ecoquartier, transition];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
