import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, thème 1 « Et avant la France ? » (lot hi-cm1-01). Chaque fait cite le programme du cycle 3
 * (registre `cycle3-2020`) avec sa citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

// ——— Notion 1 : traces d'une occupation ancienne du territoire ———

const traces: Notion = {
  id: 'hcm1-traces',
  hint: 'Pense à ce qu’il reste du passé autour de toi : un mur, un outil.',
  title: 'Traces d’une occupation ancienne du territoire',
  memo: [
    'Une **trace** est ce qui reste du passé : un outil, un mur, une route. Près de chez toi, il y en a peut-être déjà !',
    'Des traces de la **préhistoire** et de l’histoire montrent que des gens vivent ici depuis très longtemps : c’est l’ancienneté du **peuplement**.',
  ],
  faits: [
    {
      q: 'Les traces de la préhistoire trouvées en France montrent l’ancienneté de quoi ?',
      a: 'du peuplement',
      wrong: [
        {
          label: 'de la monnaie',
          why: 'La monnaie n’est pas le sujet : ces traces disent depuis quand des gens vivent ici.',
        },
        {
          label: 'des frontières',
          why: 'Les frontières ne sont pas ce que montrent ces traces. Elles montrent le peuplement.',
        },
        {
          label: 'des châteaux',
          why: 'Un château est bien plus récent. On cherche l’ancienneté de la présence des habitants.',
        },
      ],
      gap: ['Les traces anciennes montrent l’ancienneté du ', '.', ['peuplement']],
      quote: 'pour montrer l’ancienneté du peuplement et la pluralité des héritages',
      explain:
        'Les traces du passé montrent que des gens vivent ici depuis très longtemps : l’ancienneté du peuplement.',
    },
    {
      q: 'Pourquoi compare-t-on des traces proches de chez toi à celles d’un autre lieu de France ?',
      a: 'pour voir la pluralité des héritages',
      wrong: [
        {
          label: 'pour prouver qu’il n’y a qu’un seul héritage',
          why: 'C’est l’inverse : deux lieux différents montrent plusieurs héritages.',
        },
        {
          label: 'pour choisir la plus belle trace',
          why: 'On ne les classe pas : on les compare pour comprendre le passé.',
        },
        { label: 'pour effacer les traces les plus anciennes', why: 'On étudie les traces, on ne les efface pas.' },
      ],
      gap: ['Comparer deux lieux montre la pluralité des ', ' du passé.', ['héritages']],
      quote:
        'On confronte rapidement ces traces proches à des traces préhistoriques et historiques différentes relevées dans un autre lieu en France',
      explain: 'Deux lieux de France ont des traces différentes : cela montre la pluralité des héritages.',
    },
    {
      q: 'Que garde-t-on de la civilisation gauloise ?',
      a: 'des traces matérielles',
      wrong: [
        { label: 'aucune trace', why: 'Il en reste : le programme parle de traces matérielles que l’on garde.' },
        {
          label: 'seulement des chansons',
          why: 'Les chansons ne sont pas des traces matérielles. On garde des objets et des constructions.',
        },
        { label: 'uniquement des photographies', why: 'La photographie n’existe pas encore à cette époque.' },
      ],
      gap: ['De la civilisation gauloise, on garde des traces ', '.', ['matérielles', 'materielles']],
      quote: 'la civilisation gauloise, dont on garde des traces matérielles, ne connaît pas de rupture brusque',
      explain: 'Une trace matérielle se touche et se voit. On en garde de la civilisation gauloise.',
    },
    {
      q: 'Où commence-t-on à chercher des traces de la préhistoire et de l’histoire ?',
      a: 'dans ton environnement proche',
      wrong: [
        {
          label: 'uniquement dans un pays étranger',
          why: 'On commence près de chez toi, puis on compare avec un autre lieu en France.',
        },
        {
          label: 'seulement dans les livres',
          why: 'Il faut aussi observer sur place : les traces sont autour de toi.',
        },
        { label: 'au fond de l’océan', why: 'Ce n’est pas le point de départ : on part de ton environnement proche.' },
      ],
      gap: ['On repère des traces dans ton environnement ', '.', ['proche']],
      quote: 'on identifie des traces spécifiques de la préhistoire et de l’histoire dans leur environnement proche',
      explain: 'On part de ce qui est proche de toi : ton environnement proche.',
    },
  ],
  paires3: [
    ['Préhistoire', 'Époque avant l’écriture'],
    ['Trace', 'Ce qui reste du passé'],
    ['Peuplement', 'Présence d’habitants sur un territoire'],
  ],
  paires5: [
    ['Préhistoire', 'Époque avant l’écriture'],
    ['Trace', 'Ce qui reste du passé'],
    ['Peuplement', 'Présence d’habitants sur un territoire'],
    ['Héritage', 'Ce que le passé nous a laissé'],
    ['Trace matérielle', 'Une trace que l’on peut voir et toucher'],
  ],
  libres: [
    {
      q: 'Les traces de la préhistoire montrent l’ancienneté du … (un mot).',
      accepted: ['peuplement', 'le peuplement'],
      traps: [
        { text: 'passé', why: 'C’est trop vague. Le mot du programme est « peuplement » : la présence d’habitants.' },
        { text: 'territoire', why: 'Le territoire est le lieu. Ce qui est ancien, c’est le peuplement.' },
      ],
      quote: 'pour montrer l’ancienneté du peuplement et la pluralité des héritages',
      explain: 'Les traces de la préhistoire montrent l’ancienneté du peuplement.',
    },
    {
      q: 'Les traces que l’on peut toucher, comme un mur ou un outil, sont des traces … (un mot).',
      accepted: ['matérielles', 'materielles', 'matérielle'],
      traps: [
        { text: 'écrites', why: 'Une trace écrite est un texte. Un mur ou un outil se touche : il est matériel.' },
        { text: 'orales', why: 'Orale veut dire « dite à voix haute ». Un mur ne se dit pas, il se touche.' },
      ],
      quote: 'la civilisation gauloise, dont on garde des traces matérielles, ne connaît pas de rupture brusque',
      explain: 'Un mur, un outil, une route : ce sont des traces matérielles.',
    },
    {
      q: 'Autour de chez toi, tu cherches des traces dans ton environnement … (un mot).',
      accepted: ['proche'],
      traps: [
        { text: 'lointain', why: 'On commence près de toi. Le lointain vient après, pour comparer.' },
        { text: 'virtuel', why: 'On observe de vraies traces, autour de soi.' },
      ],
      quote: 'on identifie des traces spécifiques de la préhistoire et de l’histoire dans leur environnement proche',
      explain: 'On part de ton environnement proche, puis on compare avec un autre lieu.',
    },
  ],
  docs: [
    {
      title: 'Un sentier du patrimoine',
      lines: [
        'Au bord d’un champ, un panneau présente un grand mur de pierres.',
        'Les habitants viennent le voir : c’est une trace ancienne, proche de leur village.',
        'Dans une autre région, on a trouvé d’autres traces, différentes de celles-ci.',
      ],
      qs: [
        {
          q: 'Que montre la comparaison entre ces deux lieux ?',
          a: 'la pluralité des héritages',
          wrong: [
            {
              label: 'qu’il n’y a qu’un seul héritage',
              why: 'Deux lieux, deux traces différentes : il y a plusieurs héritages.',
            },
            { label: 'que les traces sont fausses', why: 'Rien dans le texte ne dit que ces traces sont fausses.' },
          ],
          quote:
            'On confronte rapidement ces traces proches à des traces préhistoriques et historiques différentes relevées dans un autre lieu en France',
          explain: 'Comparer deux lieux différents fait apparaître la pluralité des héritages.',
        },
      ],
    },
    {
      title: 'Des fouilles près de l’école',
      lines: [
        'Des archéologues dégagent des objets enfouis sous un champ.',
        'Ces objets sont très anciens : ils datent de la préhistoire.',
      ],
      qs: [
        {
          q: 'Ces objets sont des traces de la préhistoire. Que prouvent-ils sur le peuplement ?',
          a: 'qu’il est très ancien',
          wrong: [
            {
              label: 'qu’il est tout récent',
              why: 'Ces objets sont préhistoriques : le peuplement est donc ancien, pas récent.',
            },
            { label: 'qu’il n’a jamais existé', why: 'Des objets laissés par des gens prouvent leur présence.' },
          ],
          quote: 'pour montrer l’ancienneté du peuplement et la pluralité des héritages',
          explain: 'Des objets préhistoriques montrent l’ancienneté du peuplement.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : Celtes, Gaulois, Grecs et Romains ———

const heritages: Notion = {
  id: 'hcm1-heritages',
  hint: 'Relis le mémo : brassage, villes, routes… et pas de rupture brusque.',
  title: 'Celtes, Gaulois, Grecs et Romains : des héritages',
  memo: [
    'Les **Gaules** sont un lieu de **brassage** : les populations se mélangent, et les Celtes et les Gaulois rencontrent les civilisations de la Méditerranée.',
    'La **romanité** laisse beaucoup d’**héritages** : des villes, des routes, la religion chrétienne. Mais la civilisation gauloise ne disparaît pas d’un coup.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qui caractérise les Gaules ?',
      a: 'le brassage de leurs populations',
      wrong: [
        {
          label: 'une population qui ne rencontre personne',
          why: 'C’est l’inverse : les populations se mélangent et rencontrent d’autres civilisations.',
        },
        { label: 'un désert sans habitants', why: 'Les Gaules sont peuplées : on y trouve Celtes et Gaulois.' },
        { label: 'un seul peuple isolé', why: 'Il y a un brassage, c’est-à-dire un mélange de populations.' },
      ],
      gap: ['Les Gaules se caractérisent par le ', ' de leurs populations.', ['brassage']],
      quote: 'caractérisées par le brassage de leurs populations',
      explain: 'Brasser, c’est mélanger : les Gaules sont un lieu de brassage des populations.',
    },
    {
      q: 'Quel est un apport de la romanité ?',
      a: 'les routes',
      wrong: [
        { label: 'les avions', why: 'Les avions sont bien trop récents. Les Romains ont apporté des routes.' },
        { label: 'les trains', why: 'Le train arrive bien plus tard. L’apport romain, ce sont les routes.' },
        {
          label: 'l’imprimerie',
          why: 'L’imprimerie n’est pas dans la liste du programme : villes, routes, religion chrétienne.',
        },
      ],
      gap: ['Parmi les apports de la romanité : les villes, les ', ' et la religion chrétienne.', ['routes']],
      quote:
        'Les apports de la romanité sont néanmoins nombreux : villes, routes, religion chrétienne (mais aussi judaïsme) en sont des exemples.',
      explain: 'Villes, routes, religion chrétienne : ce sont des apports de la romanité.',
    },
    {
      q: 'Que dit le programme de la civilisation gauloise après la colonisation romaine ?',
      a: 'elle ne connaît pas de rupture brusque',
      wrong: [
        {
          label: 'elle disparaît en un seul jour',
          why: 'Il n’y a pas de rupture brusque : la civilisation gauloise continue.',
        },
        { label: 'elle n’a jamais existé', why: 'On en garde des traces matérielles.' },
        {
          label: 'elle devient aussitôt grecque',
          why: 'Rien de tel : la civilisation gauloise continue sans coupure brutale.',
        },
      ],
      gap: ['La civilisation gauloise ne connaît pas de rupture ', '.', ['brusque']],
      quote: 'la civilisation gauloise, dont on garde des traces matérielles, ne connaît pas de rupture brusque',
      explain: 'La colonisation romaine ne fait pas disparaître d’un coup la civilisation gauloise.',
    },
    {
      q: 'Avec quelles civilisations les Celtes et les Gaulois sont-ils en contact ?',
      a: 'les civilisations méditerranéennes',
      wrong: [
        { label: 'les civilisations du Pacifique', why: 'Le programme parle des civilisations de la Méditerranée.' },
        {
          label: 'les civilisations de l’espace',
          why: 'Cela n’existe pas : on parle des civilisations méditerranéennes.',
        },
        { label: 'aucune civilisation', why: 'Ils ont des contacts avec les civilisations méditerranéennes.' },
      ],
      gap: [
        'Les Celtes et les Gaulois sont en contact avec les civilisations ',
        '.',
        ['méditerranéennes', 'mediterraneennes'],
      ],
      quote:
        'On se centrera ensuite sur les Gaules, caractérisées par le brassage de leurs populations et les contacts entre Celtes, Gaulois et civilisations méditerranéennes.',
      explain: 'Les Gaules sont en contact avec les civilisations de la Méditerranée, comme les Grecs et les Romains.',
    },
  ],
  paires3: [
    ['Brassage', 'Mélange de populations'],
    ['Romanité', 'Ce qui vient du monde romain'],
    ['Colonisation', 'Installation d’un peuple sur le territoire d’un autre'],
  ],
  paires5: [
    ['Brassage', 'Mélange de populations'],
    ['Romanité', 'Ce qui vient du monde romain'],
    ['Colonisation', 'Installation d’un peuple sur le territoire d’un autre'],
    ['Héritage', 'Ce que le passé nous a laissé'],
    ['Les Gaules', 'Territoire où se mélangent des populations'],
  ],
  libres: [
    {
      q: 'Villes, routes, religion … : c’est un apport de la romanité (un mot).',
      accepted: ['chrétienne', 'chretienne', 'la religion chrétienne'],
      traps: [
        {
          text: 'gauloise',
          why: 'La religion chrétienne est l’exemple cité dans la liste des apports de la romanité.',
        },
        { text: 'grecque', why: 'Ce n’est pas l’exemple cité par le programme. Il parle de la religion chrétienne.' },
      ],
      quote:
        'Les apports de la romanité sont néanmoins nombreux : villes, routes, religion chrétienne (mais aussi judaïsme) en sont des exemples.',
      explain: 'Villes, routes, religion chrétienne : les exemples d’apports de la romanité.',
    },
    {
      q: 'Les populations des Gaules se mélangent : quel nom donne-t-on à ce mélange (un mot) ?',
      accepted: ['brassage', 'le brassage'],
      traps: [
        { text: 'partage', why: 'Partager n’est pas mélanger. Le mot du programme est « brassage ».' },
        { text: 'rupture', why: 'Une rupture est une coupure. Ici, tout se mélange : c’est un brassage.' },
      ],
      quote: 'caractérisées par le brassage de leurs populations',
      explain: 'Le brassage, c’est le mélange des populations.',
    },
    {
      q: 'La civilisation gauloise ne connaît pas de rupture … (un mot).',
      accepted: ['brusque'],
      traps: [
        { text: 'lente', why: 'Le programme dit que la rupture n’est pas brusque, c’est-à-dire pas soudaine.' },
        { text: 'violente', why: 'Le programme parle d’une coupure soudaine : « brusque ».' },
      ],
      quote: 'la civilisation gauloise, dont on garde des traces matérielles, ne connaît pas de rupture brusque',
      explain: 'Elle continue : pas de rupture brusque.',
    },
  ],
  docs: [
    {
      title: 'Une ville des Gaules',
      lines: [
        'Dans cette ville des Gaules, on construit une route large et droite.',
        'Des marchands venus de la Méditerranée y vendent leurs produits.',
        'Les habitants gardent pourtant leurs outils et leurs habitudes gauloises.',
      ],
      qs: [
        {
          q: 'Quelle phrase du texte montre que la civilisation gauloise continue ?',
          a: 'Les habitants gardent leurs outils et leurs habitudes',
          wrong: [
            {
              label: 'On construit une route large et droite',
              why: 'La route est un apport de la romanité, pas la continuité gauloise.',
            },
            {
              label: 'Des marchands vendent leurs produits',
              why: 'Ce sont les contacts avec la Méditerranée, pas la continuité gauloise.',
            },
          ],
          quote: 'la civilisation gauloise, dont on garde des traces matérielles, ne connaît pas de rupture brusque',
          explain: 'Garder ses outils et ses habitudes : pas de rupture brusque.',
        },
      ],
    },
    {
      title: 'Une route, une ville, une église',
      lines: [
        'Dans un village ancien, une route traverse les champs.',
        'Plus loin, une ville née à l’époque romaine compte une église.',
      ],
      qs: [
        {
          q: 'Ces trois éléments sont des exemples de quoi ?',
          a: 'des apports de la romanité',
          wrong: [
            {
              label: 'des inventions de l’époque moderne',
              why: 'Villes, routes et religion chrétienne viennent de la romanité.',
            },
            {
              label: 'des traces de la préhistoire',
              why: 'La préhistoire vient bien avant : ici, ce sont des apports de la romanité.',
            },
          ],
          quote:
            'Les apports de la romanité sont néanmoins nombreux : villes, routes, religion chrétienne (mais aussi judaïsme) en sont des exemples.',
          explain: 'Route, ville, église : des apports de la romanité.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : grands mouvements de populations ———

const mouvements: Notion = {
  id: 'hcm1-mouvements',
  hint: 'Pense à la frise : IVe siècle, puis fin du Ve siècle. Les peuples viennent de l’est.',
  title: 'Grands mouvements de populations (IVe-Xe siècles)',
  memo: [
    'À partir du IVe siècle, des peuples venus de l’est, comme les **Francs** et les **Wisigoths**, s’installent dans l’**empire romain d’Occident**.',
    'Ils arrivent sur plusieurs siècles, pas d’un seul coup. Vers la fin du Ve siècle, l’empire romain d’Occident s’effondre.',
  ],
  faits: [
    {
      q: 'À partir de quel siècle des peuples venus de l’est s’installent-ils dans l’empire romain d’Occident ?',
      a: 'le IVe siècle',
      wrong: [
        { label: 'le XVe siècle', why: 'C’est bien plus tard. Le programme indique le IVe siècle.' },
        { label: 'le Ier siècle', why: 'Trop tôt : l’installation commence à partir du IVe siècle.' },
        {
          label: 'le Ve siècle',
          why: 'Le Ve siècle est celui de l’effondrement de l’empire. L’installation commence avant, au IVe.',
        },
      ],
      gap: ['À partir du ', ' siècle, des peuples de l’est s’installent dans l’empire romain.', ['IVe', 'IV', '4e']],
      quote:
        "à partir du IVe siècle, des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident",
      explain: 'C’est à partir du IVe siècle que ces peuples s’installent.',
    },
    {
      q: 'D’où viennent les peuples qui s’installent dans l’empire romain d’Occident ?',
      a: 'de l’est',
      wrong: [
        { label: 'de l’ouest, par l’océan', why: 'Le programme dit « venus de l’est ».' },
        { label: 'de la lune', why: 'Ce sont des peuples humains venus de l’est.' },
        { label: 'du sud, par avion', why: 'Il n’y a pas d’avion à cette époque, et ils viennent de l’est.' },
      ],
      gap: ['Les peuples qui s’installent viennent de l’', '.', ['est']],
      quote:
        "à partir du IVe siècle, des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident",
      explain: 'Ils viennent de l’est.',
    },
    {
      q: 'Quels sont deux de ces peuples cités par le programme ?',
      a: 'les Francs et les Wisigoths',
      wrong: [
        { label: 'les Grecs et les Égyptiens', why: 'Les Francs et les Wisigoths sont cités pour ces arrivées.' },
        {
          label: 'les Gaulois et les Celtes',
          why: 'Gaulois et Celtes sont déjà sur place : ce sont d’autres peuples qui arrivent.',
        },
        {
          label: 'les Vikings et les Aztèques',
          why: 'Ils ne sont pas cités par le programme : ce sont les Francs et les Wisigoths.',
        },
      ],
      gap: ['Deux de ces peuples sont les Francs et les ', '.', ['Wisigoths']],
      quote:
        "à partir du IVe siècle, des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident",
      explain: 'Les Francs et les Wisigoths s’installent dans l’empire romain d’Occident.',
    },
    {
      q: 'Vers quand l’empire romain d’Occident s’effondre-t-il définitivement ?',
      a: 'vers la fin du Ve siècle',
      wrong: [
        {
          label: 'vers la fin du IIe siècle',
          why: 'C’est trop tôt : l’empire existe encore, il s’effondre vers la fin du Ve siècle.',
        },
        {
          label: 'au début du IVe siècle',
          why: 'Au IVe siècle, les peuples commencent à s’installer. L’empire tient encore.',
        },
        {
          label: 'vers la fin du XIe siècle',
          why: 'C’est bien trop tard. L’effondrement se place vers la fin du Ve siècle.',
        },
      ],
      gap: ['L’empire romain d’Occident s’effondre vers la fin du ', ' siècle.', ['Ve', 'V', '5e']],
      quote: "l'empire romain d'Occident, qui s'effondre définitivement vers la fin du Ve siècle",
      explain: 'L’empire romain d’Occident s’effondre vers la fin du Ve siècle.',
    },
  ],
  paires3: [
    ['Francs', 'Peuple venu de l’est'],
    ['IVe siècle', 'Début de l’installation des peuples de l’est'],
    ['Fin du Ve siècle', 'Effondrement de l’empire romain d’Occident'],
  ],
  paires5: [
    ['Francs', 'Peuple venu de l’est, cité avec les Wisigoths'],
    ['Wisigoths', 'Peuple venu de l’est, cité avec les Francs'],
    ['IVe siècle', 'Début de l’installation des peuples de l’est'],
    ['Fin du Ve siècle', 'Effondrement de l’empire romain d’Occident'],
    ['Mouvement de population', 'Déplacement d’un peuple vers un autre territoire'],
  ],
  ordre: [
    'IVe siècle : des peuples venus de l’est s’installent',
    'Fin du Ve siècle : l’empire romain d’Occident s’effondre',
    'Année 800 : Charlemagne est couronné empereur',
    'XIIIe siècle : règne de Louis IX',
  ],
  libres: [
    {
      q: 'Les Francs et les … s’installent dans l’empire romain d’Occident (un mot).',
      accepted: ['wisigoths', 'les wisigoths'],
      traps: [
        { text: 'gaulois', why: 'Les Gaulois sont déjà là. Le programme cite les Wisigoths avec les Francs.' },
        { text: 'romains', why: 'Les Romains sont les habitants de l’empire. Les arrivants sont les Wisigoths.' },
      ],
      quote:
        "des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident",
      explain: 'Les Francs et les Wisigoths.',
    },
    {
      q: 'Les peuples arrivent depuis l’… (un point cardinal).',
      accepted: ['est', 'l’est', "l'est"],
      traps: [
        { text: 'ouest', why: 'L’ouest est l’opposé : le programme dit « venus de l’est ».' },
        { text: 'nord', why: 'Le programme dit « venus de l’est », pas du nord.' },
      ],
      quote:
        "des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident",
      explain: 'Ils viennent de l’est.',
    },
    {
      q: 'L’empire romain d’Occident s’effondre vers la fin de quel siècle ? Réponds avec un chiffre romain.',
      accepted: ['Ve', 'V'],
      traps: [
        { text: 'IVe', why: 'Le IVe siècle est celui du début des installations. L’effondrement est à la fin du Ve.' },
        { text: 'VIe', why: 'Trop tard : l’effondrement a lieu vers la fin du Ve siècle.' },
      ],
      quote: "l'empire romain d'Occident, qui s'effondre définitivement vers la fin du Ve siècle",
      explain: 'Fin du Ve siècle.',
    },
  ],
  docs: [
    {
      title: 'Des voyageurs venus de l’est',
      lines: [
        'Au IVe siècle, des familles venues de l’est arrivent par petits groupes.',
        'Elles s’installent dans l’empire romain d’Occident.',
        'D’autres groupes les suivent pendant de nombreuses années.',
      ],
      qs: [
        {
          q: 'D’après ce texte, comment ces peuples arrivent-ils ?',
          a: 'peu à peu, sur plusieurs siècles',
          wrong: [
            {
              label: 'tous en une seule journée',
              why: 'Le texte dit « par petits groupes » et « pendant de nombreuses années ».',
            },
            { label: 'par avion', why: 'Il n’y a pas d’avion à cette époque. Ils arrivent peu à peu.' },
          ],
          quote:
            "des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident",
          explain: 'Les peuples de l’est s’installent sur plusieurs siècles.',
        },
      ],
    },
    {
      title: 'La fin d’un empire',
      lines: [
        'Les Francs et les Wisigoths vivent depuis longtemps dans l’empire.',
        'Vers la fin du Ve siècle, l’empire romain d’Occident s’effondre.',
      ],
      qs: [
        {
          q: 'Que se passe-t-il vers la fin du Ve siècle, après l’arrivée des peuples de l’est ?',
          a: 'l’effondrement de l’empire d’Occident',
          wrong: [
            {
              label: 'le couronnement de Charlemagne',
              why: 'Le couronnement a lieu en 800, bien après la fin du Ve siècle.',
            },
            { label: 'le début de la préhistoire', why: 'La préhistoire est bien plus ancienne.' },
          ],
          quote:
            "à partir du IVe siècle, des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident, qui s'effondre définitivement vers la fin du Ve siècle",
          explain: 'IVe siècle : arrivée des peuples ; fin du Ve siècle : effondrement.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : Clovis et Charlemagne ———

const rois: Notion = {
  id: 'hcm1-clovis-charlemagne',
  hint: 'Clovis est lié au baptême ; Charlemagne à l’an 800.',
  title: 'Clovis et Charlemagne, Mérovingiens et Carolingiens',
  memo: [
    '**Clovis** est un roi des Francs. Son **baptême** est un geste politique : il montre la continuité entre le monde romain et le monde mérovingien.',
    '**Charlemagne** est couronné **empereur** en 800. Il reconstitue un empire romain et chrétien.',
  ],
  faits: [
    {
      q: 'Clovis est le roi de quel peuple ?',
      a: 'les Francs',
      wrong: [
        { label: 'les Grecs', why: 'Clovis est roi des Francs, pas des Grecs.' },
        {
          label: 'les Lombards',
          why: 'Les Lombards sont liés à Charlemagne, qui est roi des Francs et des Lombards. Clovis est roi des Francs.',
        },
        { label: 'les Gaulois', why: 'Clovis est roi des Francs.' },
      ],
      gap: ['Clovis est le roi des ', '.', ['Francs']],
      quote:
        'Clovis, roi des Francs, est l’occasion de revisiter les relations entre les peuples dits barbares et l’empire romain',
      explain: 'Clovis est le roi des Francs.',
    },
    {
      q: 'Que montre le baptême de Clovis ?',
      a: 'la continuité entre le monde romain et le monde mérovingien',
      wrong: [
        {
          label: 'une rupture totale avec Rome',
          why: 'C’est l’inverse : le baptême atteste la continuité avec le monde romain.',
        },
        { label: 'la fin de la royauté', why: 'Clovis reste roi : son baptême est un geste politique.' },
        {
          label: 'la naissance de la préhistoire',
          why: 'La préhistoire est bien plus ancienne : sans rapport avec Clovis.',
        },
      ],
      gap: ['Le baptême de Clovis est un geste ', '.', ['politique']],
      quote:
        'de montrer la continuité entre mondes romain et mérovingien, dont atteste le geste politique de son baptême',
      explain:
        'Le baptême de Clovis est un geste politique qui montre la continuité entre mondes romain et mérovingien.',
    },
    {
      q: 'En quelle année Charlemagne est-il couronné empereur ?',
      a: '800',
      wrong: [
        { label: '1789', why: '1789 est le début de la Révolution. Charlemagne est couronné en 800.' },
        { label: '1515', why: 'Cette date est bien trop tardive pour Charlemagne. Il est couronné en 800.' },
        { label: '476', why: 'Cette date n’est pas dans le programme : Charlemagne est couronné empereur en 800.' },
      ],
      gap: ['Charlemagne est couronné empereur en l’an ', '.', ['800']],
      quote:
        'Charlemagne, couronné empereur en 800, roi des Francs et des Lombards, reconstitue un empire romain et chrétien',
      explain: 'Charlemagne est couronné empereur en 800.',
    },
    {
      q: 'Que reconstitue Charlemagne ?',
      a: 'un empire romain et chrétien',
      wrong: [
        {
          label: 'une république athénienne',
          why: 'Athènes est la cité grecque de la démocratie. Charlemagne reconstitue un empire romain et chrétien.',
        },
        { label: 'un royaume sans roi', why: 'Charlemagne est roi puis empereur : il reconstitue un empire.' },
        { label: 'un empire sans religion', why: 'Cet empire est romain et chrétien.' },
      ],
      gap: ['Charlemagne reconstitue un empire romain et ', '.', ['chrétien', 'chretien']],
      quote:
        'Charlemagne, couronné empereur en 800, roi des Francs et des Lombards, reconstitue un empire romain et chrétien',
      explain: 'Charlemagne reconstitue un empire romain et chrétien.',
    },
  ],
  paires3: [
    ['Clovis', 'Roi des Francs, il se fait baptiser'],
    ['Charlemagne', 'Couronné empereur en 800'],
    ['Les Francs', 'Peuple dont Clovis est le roi'],
  ],
  paires5: [
    ['Clovis', 'Son baptême est un geste politique'],
    ['Charlemagne', 'Il est couronné empereur en 800'],
    ['Mérovingiens', 'Famille de rois de Clovis'],
    ['Carolingiens', 'Famille de rois de Charlemagne'],
    ['Empire romain d’Occident', 'Il s’effondre vers la fin du Ve siècle'],
  ],
  ordre: [
    'Fin du Ve siècle : l’empire romain d’Occident s’effondre',
    'Année 800 : Charlemagne est couronné empereur',
    'XIIIe siècle : règne de Louis IX',
    'Année 1789 : début de la Révolution',
  ],
  libres: [
    {
      q: 'En quelle année Charlemagne est-il couronné empereur ? (4 chiffres ou moins)',
      accepted: ['800'],
      traps: [
        { text: '1789', why: '1789 est le début de la Révolution, bien plus tard.' },
        { text: '1000', why: 'Charlemagne est couronné en 800, pas en 1000.' },
      ],
      quote:
        'Charlemagne, couronné empereur en 800, roi des Francs et des Lombards, reconstitue un empire romain et chrétien',
      explain: 'Charlemagne est couronné empereur en 800.',
    },
    {
      q: 'Clovis est le roi des … (un mot).',
      accepted: ['francs', 'les francs'],
      traps: [
        { text: 'lombards', why: 'Charlemagne est roi des Francs et des Lombards. Clovis est le roi des Francs.' },
        { text: 'gaulois', why: 'Clovis est roi des Francs, pas des Gaulois.' },
      ],
      quote:
        'Clovis, roi des Francs, est l’occasion de revisiter les relations entre les peuples dits barbares et l’empire romain',
      explain: 'Clovis est le roi des Francs.',
    },
    {
      q: 'Charlemagne est roi des Francs et des … (un mot).',
      accepted: ['lombards', 'les lombards'],
      traps: [
        {
          text: 'wisigoths',
          why: 'Les Wisigoths sont cités pour les installations du IVe siècle. Charlemagne est roi des Francs et des Lombards.',
        },
        {
          text: 'romains',
          why: 'Charlemagne reconstitue un empire romain, mais il est roi des Francs et des Lombards.',
        },
      ],
      quote:
        'Charlemagne, couronné empereur en 800, roi des Francs et des Lombards, reconstitue un empire romain et chrétien',
      explain: 'Charlemagne est roi des Francs et des Lombards.',
    },
  ],
  docs: [
    {
      title: 'Le baptême d’un roi',
      lines: [
        'Un roi des Francs décide de se faire baptiser.',
        'Ce geste plaît aux habitants des anciennes terres romaines.',
        'Il montre que le nouveau pouvoir veut rester proche du monde romain.',
      ],
      qs: [
        {
          q: 'Quel roi ce texte raconte-t-il ?',
          a: 'Clovis',
          wrong: [
            {
              label: 'Charlemagne',
              why: 'Charlemagne est couronné empereur en 800. Le baptême est le geste politique de Clovis.',
            },
            { label: 'Louis XIV', why: 'Louis XIV est le roi Soleil, bien plus tard.' },
          ],
          quote:
            'de montrer la continuité entre mondes romain et mérovingien, dont atteste le geste politique de son baptême',
          explain: 'Le baptême est le geste politique de Clovis.',
        },
      ],
    },
    {
      title: 'Une couronne à Noël',
      lines: [
        'Un roi des Francs et des Lombards est couronné empereur.',
        'Il veut reconstituer un empire romain et chrétien.',
        'Cela se passe en l’an 800.',
      ],
      qs: [
        {
          q: 'De quel roi parle ce texte ?',
          a: 'Charlemagne',
          wrong: [
            { label: 'Clovis', why: 'Clovis est roi des Francs, sans couronne d’empereur en 800.' },
            { label: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes, bien plus tard.' },
          ],
          quote:
            'Charlemagne, couronné empereur en 800, roi des Francs et des Lombards, reconstitue un empire romain et chrétien',
          explain: 'Roi des Francs et des Lombards, couronné empereur en 800 : c’est Charlemagne.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [traces, heritages, mouvements, rois];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE));
