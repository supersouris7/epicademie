import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, thème 3 « Consommer en France » (lot ge-cm1-03). Chaque fait cite sa source (programme du cycle 3, textes de
 * l’Union européenne sur EUR-Lex, Trésor de la langue française) avec la citation exacte ; les textes à lire du
 * niveau 5 sont écrits pour l’exercice. Le « circuit long » n’a pas de définition citée : il est présenté par
 * contraste avec le circuit court (nombre limité d’acteurs).
 */

const Q_CONSO =
  'Consommer renvoie à un autre acte quotidien accompli dans le lieu habité afin de satisfaire des besoins individuels et collectifs';
const Q_ACTEURS =
  'L’étude permet d’envisager d’autres usages de ce lieu, d’en continuer l’exploration des fonctions et des réseaux et de faire intervenir d’autres acteurs';
const Q_TRAJET =
  'production, approvisionnement, distribution, exploitation sont envisagés à partir de cas simples qui permettent de repérer la géographie souvent complexe de la trajectoire d’un produit lorsqu’il arrive chez le consommateur';
const Q_POTABLE = 'Qui peut se boire sans danger pour la santé';
const Q_CAPTAGE =
  "Action de recueillir de l'eau (source, cours d'eau, vagues, etc.) par différents moyens, en vue de son utilisation";
const Q_NAPPE = 'Nappe souterraine située à un niveau peu profond et exploitée par des puits';
const Q_SOUTERRAINES = '"eaux souterraines": toutes les eaux se trouvant sous la surface du sol';
const Q_PATRIMOINE =
  "L'eau n'est pas un bien marchand comme les autres mais un patrimoine qu'il faut protéger, défendre et traiter comme tel";
const Q_USAGES = 'destinées à la boisson, à la cuisson, à la préparation d’aliments, ou à d’autres usages domestiques';
const Q_ETAPES_EAU = 'du prélèvement à la distribution des eaux en passant par le traitement et le stockage';
const Q_RENOUVELABLE =
  "une énergie produite à partir de sources non fossiles renouvelables, à savoir l'énergie éolienne, l'énergie solaire (solaire thermique et solaire photovoltaïque) et géothermique";
const Q_GEOTHERMIE = "l'énergie emmagasinée sous forme de chaleur sous la surface de la terre solide";
const Q_EOLIENNE = "Machine qui transforme en force motrice l'énergie du vent";
const Q_BARRAGE =
  "Ouvrage construit sur un cours d'eau, soit pour dériver ou régulariser le cours, soit pour en utiliser la retenue comme source d'énergie";
const Q_CHARBON = 'Solide résultant de la fossilisation de végétaux et qui existe en gisements';
const Q_DENREE =
  "toute substance ou produit, transformé, partiellement transformé ou non transformé, destiné à être ingéré ou raisonnablement susceptible d'être ingéré par l'être humain";
const Q_BOISSONS = 'Ce terme recouvre les boissons, les gommes à mâcher';
const Q_ETAPES =
  'toutes les étapes de la production, de la transformation et de la distribution des denrées alimentaires';
const Q_PRIMAIRE = "la production, l'élevage ou la culture de produits primaires, y compris la récolte, la traite";
const Q_TRACE =
  "la capacité de retracer, à travers toutes les étapes de la production, de la transformation et de la distribution, le cheminement d'une denrée alimentaire";
const Q_COURT = "un circuit d'approvisionnement impliquant un nombre limité d'opérateurs économiques";
const Q_LIENS =
  'des relations géographiques et sociales étroites entre les producteurs, les transformateurs et les consommateurs';
const Q_INTERMEDIAIRE = 'Agent économique se plaçant entre le producteur et le consommateur';
const Q_CONSOMMATEUR = 'utilise un bien ou un service pour satisfaire des besoins individuels ou collectifs';

// ——— Notion 1 : l’eau ———

const eau: Notion = {
  id: 'gcm1-eau',
  title: 'Consommer de l’eau',
  hint: 'Suis l’eau : d’où vient-elle, que lui fait-on, et à quoi sert-elle chez toi ?',
  memo: [
    'Boire est un **besoin**. L’eau est une **ressource** : on la prend dans la nature, à la surface ou sous le sol (les **eaux souterraines**).',
    'Le **captage** recueille l’eau. Puis viennent le traitement, le stockage et la **distribution** : elle arrive chez toi. Une **eau potable** se boit sans danger.',
    'Exemple : l’eau d’une source est captée, traitée, gardée en réserve, puis amenée à ton robinet. C’est un trésor à protéger !',
  ],
  faits: [
    {
      q: 'Que veut dire « eau potable » ?',
      a: 'une eau qu’on peut boire sans danger pour la santé',
      wrong: [
        { label: 'une eau très chaude', why: 'La chaleur ne dit pas si on peut boire l’eau sans danger.' },
        {
          label: 'une eau salée comme la mer',
          why: '« Potable » ne parle pas du sel : le mot dit qu’on peut boire sans danger.',
        },
        { label: 'une eau qui coule vite', why: 'Une eau qui coule vite peut quand même être dangereuse à boire.' },
      ],
      gap: ['Une eau qu’on peut boire sans danger pour la santé est une eau ', '.', ['potable']],
      quote: Q_POTABLE,
      src: 'cnrtl-potable',
      explain: 'Potable veut dire : qui peut se boire sans danger pour la santé.',
    },
    {
      q: 'Comment appelle-t-on l’action de recueillir de l’eau pour s’en servir ?',
      a: 'le captage',
      wrong: [
        { label: 'le stockage', why: 'Le stockage, c’est garder l’eau en réserve. Ici, on la recueille.' },
        { label: 'la cuisson', why: 'La cuisson, c’est faire cuire. Elle ne recueille pas l’eau.' },
        { label: 'la distribution', why: 'La distribution amène l’eau aux gens : elle vient après.' },
      ],
      gap: ['Le ', ' consiste à recueillir de l’eau pour l’utiliser.', ['captage']],
      quote: Q_CAPTAGE,
      src: 'cnrtl-captage',
      explain: 'Recueillir de l’eau pour l’utiliser, c’est le captage.',
    },
    {
      q: 'Où se trouvent les eaux souterraines ?',
      a: 'sous la surface du sol',
      wrong: [
        {
          label: 'dans les nuages',
          why: 'Dans les nuages, l’eau est dans le ciel. « Souterraine » veut dire sous la terre.',
        },
        {
          label: 'à la surface de la mer',
          why: 'La mer est à la surface. « Souterraine » veut dire en dessous du sol.',
        },
        { label: 'sur le toit des maisons', why: 'Un toit est au-dessus du sol, pas en dessous.' },
      ],
      gap: ['Les eaux souterraines se trouvent sous la surface du ', '.', ['sol']],
      quote: Q_SOUTERRAINES,
      src: 'ue-directive-cadre-eau-2000',
      explain: 'Les eaux souterraines sont sous la surface du sol.',
    },
    {
      q: 'Une nappe souterraine peu profonde est exploitée grâce à…',
      a: 'des puits',
      wrong: [
        { label: 'des éoliennes', why: 'L’éolienne utilise le vent. Pour une nappe, la définition cite les puits.' },
        { label: 'des routes', why: 'Une route sert à se déplacer, pas à atteindre l’eau du sous-sol.' },
        { label: 'des antennes', why: 'Une antenne sert à communiquer, pas à atteindre l’eau.' },
      ],
      gap: ['Une nappe souterraine peu profonde est exploitée par des ', '.', ['puits']],
      quote: Q_NAPPE,
      src: 'cnrtl-nappe',
      explain: 'Pour utiliser cette eau cachée, on creuse des puits.',
    },
    {
      q: 'D’après une règle européenne, l’eau est un patrimoine qu’il faut…',
      a: 'protéger',
      wrong: [
        { label: 'gaspiller', why: 'Gaspiller, c’est perdre l’eau. Un patrimoine, au contraire, se garde.' },
        { label: 'cacher', why: 'Cacher l’eau ne la garde pas propre. Le texte demande de la protéger.' },
        { label: 'oublier', why: 'Si on l’oublie, on n’en prend pas soin.' },
      ],
      gap: ['L’eau est un patrimoine qu’il faut ', ', défendre et traiter comme tel.', ['protéger']],
      quote: Q_PATRIMOINE,
      src: 'ue-directive-cadre-eau-2000',
      explain: 'L’eau est un patrimoine : un bien précieux à protéger.',
    },
  ],
  paires3: [
    ['Captage', 'Recueillir l’eau'],
    ['Potable', 'Qu’on peut boire sans danger'],
    ['Souterraine', 'Sous la surface du sol'],
  ],
  paires5: [
    ['Captage', 'Recueillir l’eau'],
    ['Potable', 'Qu’on peut boire sans danger'],
    ['Souterraine', 'Sous la surface du sol'],
    ['Puits', 'Trou qui permet d’exploiter une nappe'],
    ['Besoin', 'Ce qu’il faut pour vivre, comme boire'],
  ],
  ordre: ['Le captage de l’eau', 'Le traitement de l’eau', 'Le stockage de l’eau', 'La distribution de l’eau'],
  ordreTexte: {
    prompt: 'Remets dans l’ordre le trajet de l’eau, de la nature jusqu’à ton robinet.',
    hint: 'Demande-toi : que doit-on faire à l’eau avant qu’elle arrive chez toi ?',
    intro: 'Une règle européenne cite ces étapes, du prélèvement (le captage) à la distribution.',
    fin: 'La première étape est',
  },
  libres: [
    {
      q: 'quel adjectif désigne une eau que l’on peut boire sans danger ?',
      accepted: ['potable', 'eau potable', 'une eau potable'],
      traps: [
        {
          text: 'propre',
          why: 'Une eau qui paraît propre n’est pas forcément sans danger. Le mot précis est différent.',
        },
        { text: 'souterraine', why: 'Souterraine dit où se trouve l’eau, pas si on peut la boire.' },
      ],
      quote: Q_POTABLE,
      src: 'cnrtl-potable',
      explain: 'Une eau qu’on boit sans danger est potable.',
    },
    {
      q: 'comment nomme-t-on l’action de recueillir de l’eau dans la nature (un nom) ?',
      accepted: ['captage', 'le captage', 'le captage de l’eau', 'prélèvement', 'le prélèvement'],
      traps: [
        { text: 'stockage', why: 'Le stockage garde l’eau en réserve : elle a déjà été recueillie.' },
        { text: 'distribution', why: 'La distribution amène l’eau aux gens. Ce n’est pas la recueillir.' },
      ],
      quote: Q_CAPTAGE,
      src: 'cnrtl-captage',
      explain: 'Le captage, appelé aussi prélèvement, recueille l’eau.',
    },
    {
      q: 'comment appelle-t-on les eaux cachées sous la surface du sol (les eaux …) ?',
      accepted: ['souterraines', 'les eaux souterraines', 'eaux souterraines', 'souterraine'],
      traps: [
        { text: 'de surface', why: 'Les eaux de surface sont au-dessus : rivières ou lacs, par exemple.' },
        { text: 'potables', why: 'Potable dit qu’on peut boire l’eau, pas qu’elle est sous le sol.' },
      ],
      quote: Q_SOUTERRAINES,
      src: 'ue-directive-cadre-eau-2000',
      explain: 'Sous le sol, ce sont les eaux souterraines.',
    },
    {
      q: 'quel verbe en -er dit ce qu’il faut faire pour ce patrimoine qu’est l’eau, avec « défendre » ?',
      accepted: ['protéger', 'la protéger', 'préserver', 'la préserver'],
      traps: [
        { text: 'gaspiller', why: 'Gaspiller abîme le patrimoine au lieu d’en prendre soin.' },
        { text: 'acheter', why: 'Le texte dit que l’eau n’est pas un bien marchand comme les autres.' },
      ],
      quote: Q_PATRIMOINE,
      src: 'ue-directive-cadre-eau-2000',
      explain: 'Le texte demande de protéger l’eau.',
    },
  ],
  docs: [
    {
      title: 'Du puits au robinet',
      lines: [
        'Dans un village, on pompe l’eau d’une nappe qui est sous le sol.',
        'L’eau est ensuite traitée, puis gardée dans un château d’eau.',
        'Des tuyaux l’amènent enfin à l’école et aux maisons.',
      ],
      qs: [
        {
          q: 'Quelle eau le village utilise-t-il ?',
          a: 'une eau souterraine',
          wrong: [
            { label: 'de l’eau de mer', why: 'Le texte ne parle pas de la mer : la nappe est sous le sol.' },
            { label: 'de l’eau d’un lac', why: 'Un lac est à la surface. La nappe, elle, est sous le sol.' },
          ],
          quote: Q_SOUTERRAINES,
          src: 'ue-directive-cadre-eau-2000',
          explain: 'Une nappe sous le sol contient une eau souterraine.',
        },
        {
          q: 'Que font les tuyaux à la fin du trajet ?',
          a: 'ils distribuent l’eau',
          wrong: [
            { label: 'ils captent l’eau', why: 'Le captage a eu lieu au début, quand on a pompé la nappe.' },
            { label: 'ils fabriquent l’eau', why: 'Les tuyaux ne fabriquent rien : ils transportent l’eau.' },
          ],
          quote: Q_ETAPES_EAU,
          src: 'ue-directive-eau-potable-2020',
          explain: 'Amener l’eau aux gens, c’est la distribution.',
        },
      ],
    },
    {
      title: 'La cuisine de l’école',
      lines: [
        'À midi, la cantinière remplit des carafes au robinet.',
        'Elle fait aussi cuire des pâtes dans de l’eau.',
        'Les élèves se servent de leur école pour apprendre et pour manger.',
      ],
      qs: [
        {
          q: 'Pourquoi cette eau doit-elle être potable ?',
          a: 'parce qu’on la boit et qu’on cuisine avec',
          wrong: [
            {
              label: 'parce qu’elle remplit des carafes en verre',
              why: 'La matière des carafes ne change rien : c’est notre santé qui compte.',
            },
            {
              label: 'parce qu’elle sert seulement à arroser',
              why: 'Le texte parle de boire et de cuire, pas d’arroser.',
            },
          ],
          quote: Q_USAGES,
          src: 'ue-directive-eau-potable-2020',
          explain: 'L’eau pour boire et cuisiner est destinée à la consommation humaine : elle doit être sans danger.',
        },
        {
          q: 'Quel besoin la carafe d’eau aide-t-elle à satisfaire à la cantine ?',
          a: 'le besoin de boire des élèves',
          wrong: [
            {
              label: 'le besoin de se loger',
              why: 'Se loger, c’est avoir un lieu où vivre : une carafe n’y sert pas.',
            },
            { label: 'le besoin de se déplacer', why: 'Une carafe n’aide pas à aller d’un lieu à un autre.' },
          ],
          quote: Q_CONSO,
          explain: 'Consommer sert à satisfaire des besoins, ici ceux de toute une cantine.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : l’énergie ———

const energie: Notion = {
  id: 'gcm1-energie',
  title: 'Consommer de l’énergie',
  hint: 'Demande-toi d’où vient l’énergie : de quelle source dans la nature ?',
  memo: [
    'Se chauffer, s’éclairer : tu as un **besoin** d’énergie. Pour la produire, on utilise des **ressources**.',
    'Une **énergie renouvelable** vient d’une source non **fossile** : le vent, le Soleil, la chaleur du sous-sol, l’eau.',
    'Exemple : une éolienne utilise le vent. Le charbon, lui, est une **énergie fossile**.',
  ],
  faits: [
    {
      q: 'Quelle machine utilise l’énergie du vent ?',
      a: 'une éolienne',
      wrong: [
        { label: 'un puits', why: 'Un puits sert à atteindre l’eau, pas à utiliser le vent.' },
        { label: 'un poêle à charbon', why: 'Un poêle à charbon brûle du charbon : le vent ne le fait pas marcher.' },
        { label: 'un barrage', why: 'Un barrage retient l’eau d’un cours d’eau, pas le vent.' },
      ],
      gap: ['Une ', ' transforme l’énergie du vent.', ['éolienne', 'eolienne']],
      quote: Q_EOLIENNE,
      src: 'cnrtl-eolienne',
      explain: 'L’éolienne transforme l’énergie du vent.',
    },
    {
      q: 'Quelle énergie est renouvelable, d’après la liste européenne ?',
      a: 'l’énergie solaire',
      wrong: [
        {
          label: 'l’énergie du charbon',
          why: 'Le charbon est fossile. Une énergie renouvelable vient d’une source non fossile.',
        },
        {
          label: 'l’énergie du pétrole',
          why: 'Le pétrole ne figure pas dans la liste européenne des énergies renouvelables.',
        },
        {
          label: 'l’énergie des piles jetables',
          why: 'Les piles ne figurent pas dans la liste européenne des énergies renouvelables.',
        },
      ],
      gap: ['L’énergie venue du Soleil s’appelle l’énergie ', '.', ['solaire']],
      quote: Q_RENOUVELABLE,
      src: 'ue-directive-renouvelables-2018',
      explain: 'L’énergie solaire est dans la liste des énergies renouvelables.',
    },
    {
      q: 'Un barrage construit sur un cours d’eau peut servir à…',
      a: 'utiliser l’eau retenue comme source d’énergie',
      wrong: [
        { label: 'fabriquer du charbon', why: 'Le charbon vient de très vieux végétaux, pas d’un barrage.' },
        { label: 'faire souffler le vent', why: 'Un barrage retient de l’eau : il ne crée pas de vent.' },
        { label: 'faire briller le Soleil', why: 'Aucune construction ne commande le Soleil.' },
      ],
      gap: [
        'Un ',
        ' est un ouvrage construit sur un cours d’eau ; il peut retenir l’eau pour fournir de l’énergie.',
        ['barrage'],
      ],
      quote: Q_BARRAGE,
      src: 'cnrtl-barrage',
      explain: 'L’eau retenue par le barrage sert de source d’énergie.',
    },
    {
      q: 'Comment appelle-t-on l’énergie de la chaleur cachée sous la surface de la terre ?',
      a: 'l’énergie géothermique',
      wrong: [
        { label: 'l’énergie éolienne', why: '« Éolienne » parle du vent, pas de la chaleur du sous-sol.' },
        { label: 'l’énergie solaire', why: '« Solaire » parle du Soleil, pas du sous-sol.' },
        {
          label: 'l’énergie du charbon',
          why: 'Le charbon est un solide qu’on brûle, pas la chaleur du sous-sol elle-même.',
        },
      ],
      gap: ['La chaleur sous la surface de la terre donne l’énergie ', '.', ['géothermique', 'geothermique']],
      quote: Q_GEOTHERMIE,
      src: 'ue-directive-renouvelables-2018',
      explain: 'La chaleur sous la surface de la terre, c’est l’énergie géothermique.',
    },
    {
      q: 'Qu’est-ce que le charbon qu’on extrait du sol ?',
      a: 'un solide venu de très vieux végétaux fossilisés',
      wrong: [
        { label: 'un vent très fort', why: 'Le vent est de l’air qui bouge. Le charbon est un solide.' },
        { label: 'une eau chaude', why: 'Le charbon n’est pas un liquide : c’est un solide.' },
        { label: 'un rayon de Soleil', why: 'Le charbon est un solide que l’on trouve dans le sol.' },
      ],
      gap: ['On extrait du sol le ', ', un solide qui vient de végétaux fossilisés.', ['charbon', 'houille']],
      quote: Q_CHARBON,
      src: 'cnrtl-charbon',
      explain: 'Le charbon vient de végétaux devenus fossiles : c’est une énergie fossile.',
    },
  ],
  paires3: [
    ['Éolienne', 'Utilise le vent'],
    ['Solaire', 'Vient du Soleil'],
    ['Géothermique', 'Vient de la chaleur du sous-sol'],
  ],
  paires5: [
    ['Éolienne', 'Utilise le vent'],
    ['Solaire', 'Vient du Soleil'],
    ['Géothermique', 'Vient de la chaleur du sous-sol'],
    ['Barrage', 'Retient l’eau d’un cours d’eau'],
    ['Charbon', 'Solide venu de végétaux fossilisés'],
  ],
  libres: [
    {
      q: 'comment s’appelle la machine qui transforme l’énergie du vent ?',
      accepted: ['éolienne', 'eolienne', 'une éolienne', 'l’éolienne', 'moulin à vent', 'un moulin à vent'],
      traps: [
        { text: 'barrage', why: 'Le barrage utilise l’eau d’un cours d’eau, pas le vent.' },
        { text: 'moulin à eau', why: 'Un moulin à eau tourne grâce à l’eau, pas grâce au vent.' },
      ],
      quote: Q_EOLIENNE,
      src: 'cnrtl-eolienne',
      explain: 'C’est l’éolienne.',
    },
    {
      q: 'une énergie qui vient d’une source non fossile, comme le vent, est une énergie … (un adjectif).',
      accepted: ['renouvelable', 'renouvelables', 'une énergie renouvelable'],
      traps: [
        { text: 'fossile', why: 'C’est le contraire : le vent est une source non fossile.' },
        { text: 'potable', why: 'Potable se dit d’une eau qu’on peut boire.' },
      ],
      quote: Q_RENOUVELABLE,
      src: 'ue-directive-renouvelables-2018',
      explain: 'Le vent donne une énergie renouvelable.',
    },
    {
      q: 'quel solide, venu de végétaux fossilisés, peut-on brûler pour avoir de l’énergie ?',
      accepted: ['charbon', 'le charbon', 'du charbon', 'houille', 'la houille'],
      traps: [
        { text: 'pétrole', why: 'Le pétrole est une huile, donc un liquide.' },
        { text: 'bois', why: 'Le bois vient d’arbres, il n’est pas fossilisé.' },
      ],
      quote: Q_CHARBON,
      src: 'cnrtl-charbon',
      explain: 'Le solide venu de végétaux fossilisés est le charbon.',
    },
    {
      q: 'quel ouvrage construit sur un cours d’eau peut retenir l’eau pour fournir de l’énergie ?',
      accepted: ['barrage', 'un barrage', 'le barrage'],
      traps: [
        { text: 'pont', why: 'Un pont sert à traverser : il ne retient pas l’eau.' },
        { text: 'puits', why: 'Un puits atteint l’eau sous le sol, il n’est pas posé sur un cours d’eau.' },
      ],
      quote: Q_BARRAGE,
      src: 'cnrtl-barrage',
      explain: 'C’est le barrage.',
    },
  ],
  docs: [
    {
      title: 'La colline du village',
      lines: [
        'Sur la colline, de grandes machines tournent quand le vent souffle.',
        'Elles fournissent de l’électricité utilisée dans les maisons.',
        'La colline sert aussi aux promenades.',
      ],
      qs: [
        {
          q: 'Quelle sorte d’énergie ces machines utilisent-elles ?',
          a: 'une énergie renouvelable, celle du vent',
          wrong: [
            { label: 'une énergie fossile, celle du charbon', why: 'Le texte parle du vent, pas du charbon.' },
            { label: 'la chaleur du sous-sol', why: 'Les machines tournent avec le vent, pas avec la chaleur du sol.' },
          ],
          quote: Q_RENOUVELABLE,
          src: 'ue-directive-renouvelables-2018',
          explain: 'L’énergie éolienne est renouvelable.',
        },
        {
          q: 'Que montre aussi ce texte sur la colline ?',
          a: 'un même lieu peut avoir plusieurs usages',
          wrong: [
            {
              label: 'un lieu ne peut servir qu’à une chose',
              why: 'Le texte cite deux usages : l’électricité et les promenades.',
            },
            { label: 'personne ne va sur la colline', why: 'Le texte parle de promenades : des gens y vont.' },
          ],
          quote: Q_ACTEURS,
          explain: 'Consommer fait découvrir d’autres usages d’un lieu.',
        },
      ],
    },
    {
      title: 'L’hiver chez les voisins',
      lines: [
        'En hiver, une famille chauffe sa maison avec un poêle à charbon.',
        'Le charbon est livré par un camion.',
        'Les voisins, eux, ont des panneaux sur le toit qui captent le Soleil.',
      ],
      qs: [
        {
          q: 'Quelle famille utilise une énergie fossile ?',
          a: 'la famille au poêle à charbon',
          wrong: [
            { label: 'les voisins aux panneaux', why: 'Le Soleil donne une énergie renouvelable, pas fossile.' },
            { label: 'aucune des deux', why: 'Le charbon est fossile : une famille en utilise.' },
          ],
          quote: Q_CHARBON,
          src: 'cnrtl-charbon',
          explain: 'Le charbon est une énergie fossile.',
        },
        {
          q: 'Pourquoi le camion est-il utile à la famille ?',
          a: 'il lui apporte son énergie',
          wrong: [
            { label: 'il fabrique le charbon', why: 'Un camion transporte : le charbon vient du sol.' },
            { label: 'il remplace le poêle', why: 'Le camion livre, le poêle chauffe.' },
          ],
          quote: Q_TRAJET,
          explain: 'Avant d’arriver chez le consommateur, un produit suit un trajet.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : l’alimentation ———

const alimentation: Notion = {
  id: 'gcm1-alimentation',
  title: 'Satisfaire les besoins alimentaires',
  hint: 'Suis un aliment depuis le champ ou la ferme jusqu’à ton assiette.',
  memo: [
    'Manger est un **besoin**. Une **denrée alimentaire**, c’est tout ce que l’être humain peut avaler : une pomme, mais aussi une boisson.',
    'Avant ton assiette, elle suit des étapes : production, **transformation**, **distribution**. Au bout, il y a le **consommateur**.',
    'Exemple : le lait est produit à la ferme, devient un yaourt, puis il est vendu au magasin.',
  ],
  faits: [
    {
      q: 'Que désigne une « denrée alimentaire » ?',
      a: 'un produit que l’être humain peut avaler pour se nourrir ou boire',
      wrong: [
        { label: 'un meuble de la cuisine', why: 'On n’avale pas un meuble : ce n’est pas une denrée.' },
        { label: 'un jouet en plastique', why: 'Un jouet n’est pas fait pour être avalé.' },
        { label: 'un camion de livraison', why: 'Le camion transporte les aliments, il n’en est pas un.' },
      ],
      gap: ['Une ', ' alimentaire est un produit destiné à être avalé par l’être humain.', ['denrée', 'denree']],
      quote: Q_DENREE,
      src: 'ue-reglement-alimentation-2002',
      explain: 'Une denrée alimentaire est destinée à être avalée par l’être humain.',
    },
    {
      q: 'Laquelle de ces choses compte aussi parmi les denrées alimentaires ?',
      a: 'une boisson',
      wrong: [
        { label: 'une assiette', why: 'L’assiette porte le repas : on ne l’avale pas.' },
        {
          label: 'un médicament',
          why: 'La règle européenne ne range pas les médicaments dans les denrées alimentaires.',
        },
        {
          label: 'un aliment pour animaux',
          why: 'La règle européenne le classe à part : il n’est pas pour les humains.',
        },
      ],
      gap: ['Les denrées alimentaires comprennent les aliments et les ', '.', ['boissons', 'boisson']],
      quote: Q_BOISSONS,
      src: 'ue-reglement-alimentation-2002',
      explain: 'La règle européenne compte les boissons parmi les denrées alimentaires.',
    },
    {
      q: 'Récolter des légumes ou traire des vaches, c’est faire de la…',
      a: 'production',
      wrong: [
        { label: 'distribution', why: 'La distribution amène les aliments aux gens, après la production.' },
        { label: 'consommation', why: 'Consommer, c’est utiliser le produit : ici, on le crée.' },
        { label: 'publicité', why: 'La publicité fait connaître un produit, elle ne le produit pas.' },
      ],
      gap: ['La culture, l’élevage, la récolte et la traite font partie de la ', ' primaire.', ['production']],
      quote: Q_PRIMAIRE,
      src: 'ue-reglement-alimentation-2002',
      explain: 'La règle européenne appelle cela la production primaire.',
    },
    {
      q: 'Quel est le bon trio d’étapes suivi par les aliments ?',
      a: 'production, transformation, distribution',
      wrong: [
        { label: 'sommeil, jeu, lecture', why: 'Ce sont des activités d’une journée, pas les étapes d’un aliment.' },
        { label: 'captage, éolienne, barrage', why: 'Ces mots parlent d’eau et d’énergie.' },
        { label: 'achat, repas, récolte', why: 'La récolte vient avant l’achat : ce n’est pas le trio des étapes.' },
      ],
      gap: ['Les étapes sont la production, la ', ' et la distribution.', ['transformation']],
      quote: Q_ETAPES,
      src: 'ue-reglement-alimentation-2002',
      explain: 'Les denrées suivent production, transformation et distribution.',
    },
    {
      q: 'Comment appelle-t-on la capacité de retrouver le chemin d’un aliment, étape par étape ?',
      a: 'la traçabilité',
      wrong: [
        { label: 'la géothermie', why: 'La géothermie parle de la chaleur de la terre.' },
        { label: 'le captage', why: 'Le captage sert à recueillir de l’eau.' },
        { label: 'la cuisson', why: 'La cuisson fait cuire l’aliment, elle ne retrouve pas son chemin.' },
      ],
      gap: [
        'La ',
        ' permet de retracer le chemin d’un aliment.',
        ['traçabilité', 'tracabilité', 'traçabilite', 'tracabilite'],
      ],
      quote: Q_TRACE,
      src: 'ue-reglement-alimentation-2002',
      explain: 'Retracer le cheminement d’une denrée, c’est la traçabilité.',
    },
  ],
  paires3: [
    ['Production', 'Cultiver ou élever'],
    ['Transformation', 'Changer un produit en un autre'],
    ['Distribution', 'Amener le produit aux gens'],
  ],
  paires5: [
    ['Production', 'Cultiver ou élever'],
    ['Transformation', 'Changer un produit en un autre'],
    ['Distribution', 'Amener le produit aux gens'],
    ['Consommateur', 'Personne qui utilise le produit'],
    ['Traçabilité', 'Retrouver le chemin d’un aliment'],
  ],
  ordre: [
    'La production à la ferme',
    'La transformation en atelier',
    'La distribution au magasin',
    'Le repas du consommateur',
  ],
  ordreTexte: {
    prompt: 'Remets dans l’ordre le trajet d’un yaourt, depuis la ferme.',
    hint: 'Demande-toi : qu’arrive-t-il au lait avant que tu le manges en yaourt ?',
    intro:
      'La règle européenne parle de production, de transformation et de distribution ; le consommateur est au bout.',
    fin: 'La première étape est',
  },
  libres: [
    {
      q: 'comment nomme-t-on l’étape placée entre la production et la distribution (un nom) ?',
      accepted: ['transformation', 'la transformation', 'de transformation'],
      traps: [
        { text: 'distribution', why: 'Distribuer, c’est amener le produit aux gens. Ici, le lait change.' },
        { text: 'récolte', why: 'On récolte des cultures. Ici, le lait devient un autre produit.' },
      ],
      quote: Q_ETAPES,
      src: 'ue-reglement-alimentation-2002',
      explain: 'Changer le lait en fromage, c’est une transformation.',
    },
    {
      q: 'quelle étape consiste à cultiver et à élever (un nom) ?',
      accepted: ['production', 'la production', 'la production primaire', 'production primaire'],
      traps: [
        { text: 'distribution', why: 'La distribution vient après : elle amène le produit.' },
        { text: 'transformation', why: 'Transformer, c’est changer un produit qui existe déjà.' },
      ],
      quote: Q_PRIMAIRE,
      src: 'ue-reglement-alimentation-2002',
      explain: 'Cultiver et élever, c’est la production.',
    },
    {
      q: 'quel nom de la famille de « consommer » désigne la personne qui mange le produit ?',
      accepted: [
        'consommateur',
        'le consommateur',
        'un consommateur',
        'consommatrice',
        'la consommatrice',
        'une consommatrice',
      ],
      traps: [
        { text: 'producteur', why: 'Le producteur crée l’aliment.' },
        { text: 'transporteur', why: 'Le transporteur déplace l’aliment, sans forcément le manger.' },
      ],
      quote: Q_CONSOMMATEUR,
      src: 'cnrtl-consommateur',
      explain: 'Celui qui utilise le produit pour ses besoins est le consommateur.',
    },
    {
      q: 'quel mot désigne la capacité de retracer le chemin d’un aliment ?',
      accepted: ['traçabilité', 'tracabilité', 'traçabilite', 'tracabilite', 'la traçabilité'],
      traps: [
        { text: 'transformation', why: 'La transformation change le produit : elle ne retrace pas son chemin.' },
        { text: 'distribution', why: 'La distribution n’est qu’une étape du chemin.' },
      ],
      quote: Q_TRACE,
      src: 'ue-reglement-alimentation-2002',
      explain: 'C’est la traçabilité.',
    },
  ],
  docs: [
    {
      title: 'Le pain du matin',
      lines: [
        'Un agriculteur cultive du blé dans son champ.',
        'Au moulin, le blé devient de la farine.',
        'Le boulanger fait du pain et le vend dans sa boutique.',
      ],
      qs: [
        {
          q: 'Que se passe-t-il au moulin ?',
          a: 'une transformation du blé',
          wrong: [
            { label: 'la production du blé dans un champ', why: 'Le blé est cultivé avant, dans le champ.' },
            { label: 'le repas du consommateur', why: 'Au moulin, personne ne mange : on change le blé en farine.' },
          ],
          quote: Q_ETAPES,
          src: 'ue-reglement-alimentation-2002',
          explain: 'Le blé devient farine : c’est une transformation.',
        },
        {
          q: 'Quelle fonction a le champ dans ce texte ?',
          a: 'il sert à produire',
          wrong: [
            { label: 'il sert à loger les clients', why: 'Le texte ne parle pas de logement dans le champ.' },
            { label: 'il sert à vendre le pain', why: 'La vente a lieu à la boutique.' },
          ],
          quote: Q_PRIMAIRE,
          src: 'ue-reglement-alimentation-2002',
          explain: 'Cultiver, c’est produire : le champ est un espace de production.',
        },
      ],
    },
    {
      title: 'Le jus de pomme',
      lines: [
        'Des pommes sont cueillies dans un verger.',
        'Dans un atelier, on les presse pour faire du jus.',
        'Un magasin du quartier vend les bouteilles aux habitants.',
      ],
      qs: [
        {
          q: 'Quel acteur s’occupe de la dernière étape avant la maison ?',
          a: 'le magasin',
          wrong: [
            { label: 'le verger', why: 'Le verger est un lieu où poussent les fruits : c’est le début.' },
            { label: 'l’atelier', why: 'L’atelier transforme les pommes, puis le magasin vend.' },
          ],
          quote: Q_ACTEURS,
          explain: 'Plusieurs acteurs interviennent : ici le magasin distribue.',
        },
        {
          q: 'Le jus de pomme est-il une denrée alimentaire ?',
          a: 'oui, car les boissons en font partie',
          wrong: [
            { label: 'non, car il est liquide', why: 'Les boissons sont des denrées alimentaires, même liquides.' },
            { label: 'non, car il a été transformé', why: 'Une denrée peut être transformée ou non.' },
          ],
          quote: Q_BOISSONS,
          src: 'ue-reglement-alimentation-2002',
          explain: 'Les boissons sont des denrées alimentaires.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : circuits courts et longs ———

const circuits: Notion = {
  id: 'gcm1-circuits-courts-longs',
  title: 'Circuits courts et circuits longs',
  hint: 'Compte les personnes et les entreprises entre celui qui produit et celui qui achète.',
  memo: [
    'Un produit voyage du **producteur** au **consommateur**. Entre les deux, il y a parfois un **intermédiaire**, comme un revendeur.',
    'Dans un **circuit court**, peu d’acteurs participent. Dans un **circuit long**, le produit passe par plus d’intermédiaires.',
    'Exemple : des œufs achetés à la ferme suivent un circuit court. Compte les acteurs, pas seulement les kilomètres !',
  ],
  faits: [
    {
      q: 'Qu’est-ce qui caractérise un circuit court ?',
      a: 'un petit nombre d’acteurs entre le début et la fin',
      wrong: [
        { label: 'un très grand nombre de revendeurs', why: 'Beaucoup de revendeurs allongent le circuit.' },
        {
          label: 'un produit qu’on ne peut pas acheter',
          why: 'Dans un circuit court, le produit arrive bien au consommateur.',
        },
        {
          label: 'un trajet toujours fait en avion',
          why: 'La définition ne parle pas d’avion : elle compte les acteurs.',
        },
      ],
      gap: [
        'Un circuit court implique un nombre ',
        ' d’acteurs économiques.',
        ['limité', 'limite', 'petit', 'faible', 'réduit'],
      ],
      quote: Q_COURT,
      src: 'ue-reglement-rural-2013',
      explain: 'Un circuit court implique un nombre limité d’acteurs économiques.',
    },
    {
      q: 'Où se place un intermédiaire ?',
      a: 'entre le producteur et le consommateur',
      wrong: [
        {
          label: 'avant le producteur seulement',
          why: 'Il fait le lien entre deux personnes : il n’est pas avant le début.',
        },
        { label: 'après le repas', why: 'Après le repas, le produit n’est plus à vendre.' },
        { label: 'à la place du consommateur', why: 'Il n’utilise pas le produit pour lui : il fait le lien.' },
      ],
      gap: ['Un ', ' se place entre le producteur et le consommateur.', ['intermédiaire', 'intermediaire']],
      quote: Q_INTERMEDIAIRE,
      src: 'cnrtl-intermediaire',
      explain: 'L’intermédiaire est placé entre le producteur et le consommateur.',
    },
    {
      q: 'Qui utilise un produit pour satisfaire ses besoins ?',
      a: 'le consommateur',
      wrong: [
        { label: 'le camion', why: 'Un camion transporte : il n’a pas de besoins à satisfaire.' },
        { label: 'le champ', why: 'Un champ est un lieu, pas une personne.' },
        { label: 'l’intermédiaire', why: 'L’intermédiaire fait passer le produit, il se place entre les deux.' },
      ],
      gap: ['Le ', ' utilise un produit pour satisfaire ses besoins.', ['consommateur', 'client']],
      quote: Q_CONSOMMATEUR,
      src: 'cnrtl-consommateur',
      explain: 'C’est le consommateur qui utilise le produit.',
    },
    {
      q: 'Un circuit court crée des relations étroites entre producteurs, transformateurs et…',
      a: 'consommateurs',
      wrong: [
        { label: 'nuages', why: 'Les nuages ne sont pas des acteurs d’un circuit.' },
        { label: 'fleuves', why: 'Un fleuve n’est pas un acteur économique.' },
        { label: 'éoliennes', why: 'Une éolienne est une machine, pas une personne qui consomme.' },
      ],
      gap: [
        'Le circuit court rapproche les producteurs, les transformateurs et les ',
        '.',
        ['consommateurs', 'consommateur', 'clients', 'acheteurs'],
      ],
      quote: Q_LIENS,
      src: 'ue-reglement-rural-2013',
      explain: 'Le texte cite les producteurs, les transformateurs et les consommateurs.',
    },
    {
      q: 'Pour comprendre un circuit, que cherche-t-on à repérer ?',
      a: 'la trajectoire du produit jusqu’au consommateur',
      wrong: [
        { label: 'la couleur de l’emballage', why: 'La couleur ne dit rien du chemin suivi.' },
        { label: 'l’âge du vendeur', why: 'L’âge du vendeur ne décrit pas le chemin du produit.' },
        { label: 'le prénom du client', why: 'Le prénom du client ne montre pas le trajet.' },
      ],
      gap: [
        'La géographie repère la ',
        ' d’un produit lorsqu’il arrive chez le consommateur.',
        ['trajectoire', 'trajet'],
      ],
      quote: Q_TRAJET,
      explain: 'On suit la trajectoire du produit jusqu’au consommateur.',
    },
  ],
  paires3: [
    ['Producteur', 'Crée le produit'],
    ['Intermédiaire', 'Placé entre les deux bouts'],
    ['Consommateur', 'Utilise le produit'],
  ],
  paires5: [
    ['Producteur', 'Crée le produit'],
    ['Intermédiaire', 'Placé entre les deux bouts'],
    ['Consommateur', 'Utilise le produit'],
    ['Circuit court', 'Peu d’acteurs sur le trajet'],
    ['Circuit long', 'Plusieurs intermédiaires sur le trajet'],
  ],
  ordre: [
    'Le producteur récolte les fruits',
    'L’atelier en fait de la confiture',
    'Le magasin met le pot en vente',
    'Le consommateur ouvre le pot chez lui',
  ],
  ordreTexte: {
    prompt: 'Remets dans l’ordre le trajet d’un pot de confiture.',
    hint: 'Demande-toi qui doit avoir fini son travail avant que le suivant commence.',
    intro: 'Le pot suit la production, la transformation, puis la distribution jusqu’au consommateur.',
    fin: 'La première étape est',
  },
  libres: [
    {
      q: 'quel nom porte la personne placée entre le producteur et le consommateur ?',
      accepted: ['intermédiaire', 'intermediaire', 'un intermédiaire', 'l’intermédiaire', 'revendeur', 'un revendeur'],
      traps: [
        { text: 'producteur', why: 'Le producteur est au début du trajet.' },
        { text: 'consommateur', why: 'Le consommateur est à la fin du trajet.' },
      ],
      quote: Q_INTERMEDIAIRE,
      src: 'cnrtl-intermediaire',
      explain: 'C’est un intermédiaire.',
    },
    {
      q: 'un trajet avec un nombre limité d’acteurs est un circuit … (un adjectif).',
      accepted: ['court', 'circuit court', 'un circuit court'],
      traps: [
        { text: 'long', why: 'Un circuit long passe par davantage d’intermédiaires.' },
        { text: 'fermé', why: 'Cet adjectif ne dit rien du nombre d’acteurs.' },
      ],
      quote: Q_COURT,
      src: 'ue-reglement-rural-2013',
      explain: 'Peu d’acteurs : le circuit est court.',
    },
    {
      q: 'un fromage passe par un grossiste, un transporteur-revendeur, puis un supermarché : le circuit est … (un adjectif).',
      accepted: ['long', 'circuit long', 'un circuit long'],
      traps: [
        { text: 'court', why: 'Compte les acteurs : il y a plusieurs intermédiaires.' },
        { text: 'direct', why: 'Direct voudrait dire sans intermédiaire : ici il y en a plusieurs.' },
      ],
      quote: Q_COURT,
      src: 'ue-reglement-rural-2013',
      explain: 'Le nombre d’acteurs n’est plus limité : on parle de circuit long.',
    },
    {
      q: 'quel mot désigne le chemin suivi par un produit jusqu’à toi ?',
      accepted: [
        'trajectoire',
        'la trajectoire',
        'trajet',
        'le trajet',
        'parcours',
        'le parcours',
        'circuit',
        'le circuit',
      ],
      traps: [
        { text: 'captage', why: 'Le captage sert à recueillir de l’eau.' },
        { text: 'besoin', why: 'Le besoin explique pourquoi on achète, pas le chemin.' },
      ],
      quote: Q_TRAJET,
      explain: 'Le programme parle de la trajectoire d’un produit.',
    },
  ],
  docs: [
    {
      title: 'Le samedi au marché',
      lines: [
        'Une maraîchère cultive des carottes près de la ville.',
        'Le samedi, elle les vend elle-même au marché.',
        'Un habitant en achète pour sa soupe.',
      ],
      qs: [
        {
          q: 'Quel circuit les carottes suivent-elles ?',
          a: 'un circuit court',
          wrong: [
            {
              label: 'un circuit long',
              why: 'La maraîchère vend elle-même : il n’y a pas une suite d’intermédiaires.',
            },
            { label: 'aucun circuit', why: 'Les carottes passent bien de la productrice à l’habitant.' },
          ],
          quote: Q_COURT,
          src: 'ue-reglement-rural-2013',
          explain: 'Peu d’acteurs : c’est un circuit court.',
        },
        {
          q: 'Qui est le consommateur ?',
          a: 'l’habitant qui fait sa soupe',
          wrong: [
            { label: 'la maraîchère', why: 'Elle cultive et vend : ici, elle est la productrice.' },
            { label: 'le marché', why: 'Le marché est un lieu de vente, pas une personne.' },
          ],
          quote: Q_CONSOMMATEUR,
          src: 'cnrtl-consommateur',
          explain: 'L’habitant utilise les carottes pour son besoin.',
        },
      ],
    },
    {
      title: 'Le voyage des tomates',
      lines: [
        'Un producteur vend ses tomates à un grossiste.',
        'Le grossiste les revend à un supermarché loin de là.',
        'Un habitant les achète en faisant ses courses.',
      ],
      qs: [
        {
          q: 'Quels acteurs sont des intermédiaires ?',
          a: 'le grossiste et le supermarché',
          wrong: [
            { label: 'le producteur et l’habitant', why: 'Ils sont aux deux bouts du trajet, pas entre les deux.' },
            { label: 'seulement l’habitant', why: 'L’habitant est le consommateur : il est au bout.' },
          ],
          quote: Q_INTERMEDIAIRE,
          src: 'cnrtl-intermediaire',
          explain: 'Le grossiste et le supermarché sont placés entre producteur et consommateur.',
        },
        {
          q: 'Comment appeler ce trajet ?',
          a: 'un circuit long',
          wrong: [
            {
              label: 'un circuit court',
              why: 'Deux intermédiaires et un lieu lointain : on a là un circuit plus long.',
            },
            { label: 'une production', why: 'La production n’est que le début : on parle ici de tout le trajet.' },
          ],
          quote: Q_COURT,
          src: 'ue-reglement-rural-2013',
          explain: 'Plusieurs intermédiaires : on parle de circuit long.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [eau, energie, alimentation, circuits];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
