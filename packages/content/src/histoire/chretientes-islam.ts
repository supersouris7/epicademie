import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './chretientes-islam-sources.ts';

/**
 * 5e, thème 1 « Chrétientés et islam (VIe-XIIIe siècles), des mondes en contact » (lot hi-5e-01). Chaque fait cite le
 * programme du cycle 4 ou la ressource d'accompagnement Éduscol du thème ; les textes à lire du niveau 5 sont écrits
 * pour l'exercice.
 */
export const SOURCE = 'cycle4-2020';

// ——— Notion 1 : Byzance et l'Europe carolingienne ———

const byzance: Notion = {
  id: 'h5-byzance-carolingiens',
  title: 'Byzance et l’Europe carolingienne',
  hint: 'Situe d’abord la question : Constantinople (l’Orient) ou l’Occident de Charlemagne ? Puis cherche le titre, la date ou l’acteur.',
  memo: [
    'De Justinien (527-565) à la prise de Bagdad (1258), on étudie comment des empires naissent, s’unissent ou se morcellent. À Constantinople, capitale de l’**empire byzantin**, l’empereur porte le titre de **basileus** ; il nomme le **patriarche** de Constantinople.',
    'En Occident, **Charlemagne** est couronné empereur en 800 : il reprend le titre d’Auguste, héritage des empereurs romains. Depuis son palais d’Aix-la-Chapelle, il gouverne avec des représentants du pouvoir central.',
    'Mais l’empire **carolingien** se morcelle : le traité de Verdun le partage en 843. En 962, Otton Ier restaure la dignité impériale : c’est le début du **Saint-Empire romain germanique**.',
  ],
  faits: [
    {
      ...P.couronnement,
      q: 'En quelle année Charlemagne est-il couronné empereur ?',
      a: '800',
      wrong: [
        { label: '1258', why: '1258 est l’année de la prise de Bagdad par les Mongols, qui clôt la période.' },
        { label: '622', why: '622 est l’année de l’Hégire, début de l’ère musulmane.' },
        { label: '843', why: 'En 843, le traité de Verdun partage l’empire : c’est après le règne de Charlemagne.' },
      ],
      gap: ['Charlemagne est couronné empereur en ', ' : il reprend le titre d’Auguste.', ['800', 'l’an 800']],
      explain: 'Charlemagne est couronné empereur en 800 et reprend le titre d’Auguste des empereurs romains.',
    },
    {
      ...P.basileus,
      q: 'Quel titre porte l’empereur à Constantinople ?',
      a: 'basileus',
      wrong: [
        { label: 'calife', why: 'Le calife est le « successeur » de Muhammad, dans le monde musulman.' },
        { label: 'pape', why: 'Le pape est le chef de l’Église d’Occident, à Rome : ce n’est pas un empereur.' },
        {
          label: 'patriarche',
          why: 'Le patriarche est le chef religieux de l’Église de Constantinople ; il est nommé par l’empereur.',
        },
      ],
      gap: ['À Constantinople, l’empereur porte le titre de ', '.', ['basileus']],
      explain: 'Le titre romain d’Auguste devient, à Constantinople, celui de basileus.',
    },
    {
      ...P.justinien,
      q: 'Quel empereur, au VIe siècle, tente une dernière fois de reconstituer l’unité de l’empire romain ?',
      a: 'Justinien',
      wrong: [
        { label: 'Haroun al-Rachid', why: 'Haroun al-Rachid est un calife abbasside de Bagdad, pas un empereur.' },
        {
          label: 'Otton Ier',
          why: 'Otton Ier restaure la dignité impériale en Occident en 962, bien après le VIe siècle.',
        },
        {
          label: 'Charlemagne',
          why: 'Charlemagne est couronné en 800, en Occident : il ne règne pas au VIe siècle.',
        },
      ],
      gap: ['Au VIe siècle, l’empereur ', ' tente de reconstituer l’unité de l’empire romain.', ['Justinien']],
      explain: 'Le règne de Justinien (527-565) est la dernière tentative de reconstituer l’unité de l’empire romain.',
    },
    {
      ...P.verdun,
      q: 'Quel traité partage l’empire carolingien en 843 ?',
      a: 'le traité de Verdun',
      wrong: [
        { label: 'l’édit de Nantes', why: 'L’édit de Nantes est associé à Henri IV, à la fin du XVIe siècle.' },
        { label: 'le concile de Nicée', why: 'Le concile de Nicée (325) réunit des évêques : ce n’est pas un traité.' },
        {
          label: 'le traité d’Aix-la-Chapelle',
          why: 'Aix-la-Chapelle est la ville du palais de Charlemagne ; le partage de 843 se fait à Verdun.',
        },
      ],
      gap: ['En 843, le traité de ', ' partage l’empire carolingien.', ['Verdun']],
      explain: 'Le morcellement de l’empire carolingien est effectif en 843, au traité de Verdun.',
    },
    {
      ...P.aix,
      q: 'Dans quelle ville se trouve le palais où l’on étudie Charlemagne et le lien entre religion et pouvoir ?',
      a: 'Aix-la-Chapelle',
      wrong: [
        { label: 'Bagdad', why: 'Bagdad est la capitale des califes abbassides.' },
        { label: 'Constantinople', why: 'Constantinople est la ville du basileus, l’empereur byzantin.' },
        { label: 'Damas', why: 'Damas est la capitale des califes omeyyades.' },
      ],
      gap: ['On étudie Charlemagne en son palais d’', '.', ['Aix-la-Chapelle', 'Aix la Chapelle', 'Aix']],
      explain: 'Le palais d’Aix-la-Chapelle montre le lien entre la religion et le pouvoir de Charlemagne.',
    },
    {
      ...P.patriarche,
      q: 'Dans l’empire byzantin, qui nomme le patriarche de Constantinople ?',
      a: 'l’empereur byzantin',
      wrong: [
        { label: 'le calife', why: 'Le calife gouverne le monde musulman, pas l’Église de Constantinople.' },
        {
          label: 'le pape',
          why: 'Le pape construit son autorité sur l’Église d’Occident ; à Constantinople, c’est l’empereur qui nomme le patriarche.',
        },
        {
          label: 'les évêques d’Occident',
          why: 'Les évêques d’Occident sont liés au pape, à Rome, pas à Constantinople.',
        },
      ],
      gap: ['Le patriarche de Constantinople est nommé par l’', ' byzantin, qui le soumet.', ['empereur']],
      explain:
        'L’empereur byzantin est le vrai chef religieux de l’Orient : il nomme le patriarche, qui lui est soumis.',
    },
    {
      ...P.otton,
      q: 'Qui restaure la dignité impériale en Occident en 962 ?',
      a: 'Otton Ier',
      wrong: [
        { label: 'Justinien', why: 'Justinien règne à Constantinople au VIe siècle.' },
        {
          label: 'Hugues Capet',
          why: 'Hugues Capet devient « roi des Francs » en 987 : il est roi, pas empereur.',
        },
        {
          label: 'Louis le Pieux',
          why: 'Louis le Pieux est l’héritier de Charlemagne, au IXe siècle ; il prépare le partage de l’empire.',
        },
      ],
      gap: [
        'En 962, ',
        ' restaure la dignité impériale : c’est le début du Saint-Empire romain germanique.',
        ['Otton Ier', 'Otton 1er', 'Otton I', 'Otton'],
      ],
      explain: 'Otton Ier restaure la dignité impériale en 962 : c’est le début du Saint-Empire romain germanique.',
    },
    {
      ...P.pertes,
      q: 'Quelles régions l’empire byzantin perd-il lors de la conquête arabe ?',
      a: 'la Syrie, l’Égypte et l’Afrique',
      wrong: [
        { label: 'la Chine et l’Inde', why: 'La Chine et l’Inde n’ont jamais fait partie de l’empire byzantin.' },
        {
          label: 'la Gaule et la Germanie',
          why: 'La Gaule et la Germanie appartiennent à l’Occident, celui des Francs, pas à l’empire byzantin.',
        },
        {
          label: 'Constantinople et ses environs',
          why: 'Constantinople reste la capitale de l’empire byzantin ; elle n’est pas prise par la conquête arabe.',
        },
      ],
      gap: [
        'La conquête arabe fait perdre à l’empire byzantin la Syrie, l’',
        ' et toute l’Afrique.',
        ['Égypte', 'Egypte'],
      ],
      explain: 'La conquête arabe fait perdre à l’empire byzantin la Syrie, l’Égypte et toute l’Afrique.',
    },
  ],
  paires3: [
    ['Le basileus', 'Titre de l’empereur à Constantinople'],
    ['Aix-la-Chapelle', 'Ville du palais de Charlemagne'],
    ['Le traité de Verdun', 'Partage de l’empire carolingien'],
  ],
  paires5: [
    ['Justinien', 'Empereur à Constantinople de 527 à 565'],
    ['Charlemagne', 'Couronné empereur en 800'],
    ['Louis le Pieux', 'Seul héritier de Charlemagne'],
    ['Otton Ier', 'Restaure la dignité impériale en 962'],
    ['Héraclius', 'Prend le titre de basileus'],
  ],
  frise: [
    { ...P.justinien, label: 'Règne de Justinien', date: '527-565' },
    { ...P.couronnement, label: 'Couronnement impérial de Charlemagne', date: '800' },
    { ...P.verdun, label: 'Partage de l’empire carolingien au traité de Verdun', date: '843' },
    { ...P.otton, label: 'Otton Ier restaure la dignité impériale', date: '962' },
  ],
  libres: [
    {
      ...P.basileus,
      q: 'Quel titre l’empereur porte-t-il à Constantinople ? (un mot)',
      accepted: ['basileus', 'le basileus'],
      traps: [
        { text: 'calife', why: 'Le calife est le « successeur » de Muhammad, dans le monde musulman.' },
        {
          text: 'Auguste',
          why: 'Auguste est le titre romain ; à Constantinople, il devient celui de basileus (Charlemagne, lui, reprend « Auguste »).',
        },
      ],
      explain: 'À Constantinople, le titre d’Auguste devient celui de basileus.',
    },
    {
      ...P.couronnement,
      q: 'En quelle année a lieu le couronnement impérial de Charlemagne ?',
      accepted: ['800', 'en 800', 'l’an 800', 'en l’an 800'],
      traps: [
        { text: '843', why: '843 est l’année du traité de Verdun, qui partage l’empire.' },
        { text: '962', why: '962 est l’année où Otton Ier restaure la dignité impériale.' },
      ],
      explain: 'Charlemagne est couronné empereur en 800.',
    },
    {
      ...P.verdun,
      q: 'Dans quelle ville est signé le traité qui partage l’empire carolingien en 843 ? (un nom)',
      accepted: ['Verdun', 'à Verdun'],
      traps: [
        { text: 'Aix-la-Chapelle', why: 'Aix-la-Chapelle est la ville du palais de Charlemagne.' },
        { text: 'Constantinople', why: 'Constantinople est la capitale de l’empire byzantin.' },
      ],
      explain: 'Le morcellement de l’empire est effectif en 843, au traité de Verdun.',
    },
    {
      ...P.justinien,
      q: 'Quel empereur ouvre la période étudiée, au VIe siècle ? (un nom)',
      accepted: ['Justinien', 'l’empereur Justinien'],
      traps: [
        { text: 'Charlemagne', why: 'Charlemagne est couronné en 800 : il règne à la fin du VIIIe siècle et au IXe.' },
        { text: 'Otton', why: 'Otton Ier restaure la dignité impériale en 962, au Xe siècle.' },
      ],
      explain: 'La période s’ouvre avec le règne de l’empereur Justinien (527-565).',
    },
  ],
  docs: [
    {
      title: 'Charlemagne, empereur en Occident',
      lines: [
        'En 800, Charlemagne, roi des Francs, est couronné empereur.',
        'Il reprend le titre d’Auguste, porté autrefois par les empereurs romains.',
        'Depuis son palais d’Aix-la-Chapelle, il gouverne un vaste empire chrétien.',
        'Pour contrôler ce territoire, il s’appuie sur des représentants du pouvoir central.',
        'Après lui, l’empire est partagé : le partage devient effectif en 843.',
      ],
      qs: [
        {
          ...P.couronnement,
          q: 'Quel héritage Charlemagne revendique-t-il en reprenant le titre d’Auguste ?',
          a: 'celui des empereurs romains',
          wrong: [
            { label: 'celui des califes de Bagdad', why: 'Le calife est le successeur de Muhammad, pas d’Auguste.' },
            { label: 'celui des pharaons d’Égypte', why: 'Le texte (ligne 2) parle des empereurs romains.' },
          ],
          explain: 'En reprenant le titre d’Auguste, Charlemagne se place dans l’héritage des empereurs romains.',
        },
        {
          ...P.representants,
          q: 'Sur qui Charlemagne s’appuie-t-il pour contrôler son territoire ?',
          a: 'sur des représentants du pouvoir central',
          wrong: [
            {
              label: 'sur le basileus de Constantinople',
              why: 'Le basileus règne en Orient, pas sur l’empire de Charlemagne.',
            },
            { label: 'sur le calife de Damas', why: 'Le texte ne parle pas de calife : relis la ligne 4.' },
          ],
          explain: 'Ligne 4 : pour gouverner un territoire si vaste, l’empereur s’appuie sur des représentants.',
        },
        {
          ...P.verdun,
          q: 'Que devient l’empire après Charlemagne ?',
          a: 'il est partagé',
          wrong: [
            { label: 'il s’étend jusqu’à l’Indus', why: 'C’est le territoire omeyyade qui va jusqu’à l’Indus.' },
            {
              label: 'il est rattaché à l’empire byzantin',
              why: 'Le texte (ligne 5) parle d’un partage, pas d’un rattachement à Constantinople.',
            },
          ],
          explain: 'Ligne 5 : l’empire carolingien se morcelle ; le partage est effectif en 843 (traité de Verdun).',
        },
      ],
    },
    {
      title: 'Constantinople, ville du basileus',
      lines: [
        'À Constantinople, l’empereur porte le titre de basileus.',
        'Son palais se dresse près d’une grande basilique.',
        'Le basileus nomme le patriarche de Constantinople, qui lui est soumis.',
        'Avec la conquête arabe, l’empire perd la Syrie, l’Égypte et toute l’Afrique.',
      ],
      qs: [
        {
          ...P.patriarche,
          q: 'D’après le texte, qui nomme le patriarche de Constantinople ?',
          a: 'le basileus',
          wrong: [
            { label: 'le pape', why: 'Le pape est à Rome ; ligne 3, c’est le basileus qui nomme le patriarche.' },
            { label: 'le calife', why: 'Le calife gouverne le monde musulman, pas l’Église de Constantinople.' },
          ],
          explain: 'Ligne 3 : l’empereur byzantin nomme le patriarche, qui lui est soumis.',
        },
        {
          ...P.palaisBasilique,
          q: 'Que montre la proximité entre le palais et la basilique ?',
          a: 'le lien étroit entre le pouvoir et la religion',
          wrong: [
            {
              label: 'la séparation entre le pouvoir et la religion',
              why: 'Le palais et la basilique sont proches : pouvoir et religion sont liés, pas séparés.',
            },
            {
              label: 'l’absence de religion à Constantinople',
              why: 'Une basilique est un lieu de culte chrétien : la religion est bien présente.',
            },
          ],
          explain: 'La proximité entre palais et basilique montre le lien entre le pouvoir de l’empereur et l’Église.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : de la naissance de l'islam à la prise de Bagdad ———

const islam: Notion = {
  id: 'h5-islam-bagdad',
  title: 'De la naissance de l’islam à la prise de Bagdad',
  hint: 'Repère la dynastie et sa capitale : Omeyyades à Damas, Abbassides à Bagdad. Puis vérifie la date.',
  memo: [
    'En 622, l’**Hégire** marque le début de l’ère musulmane. Le **calife** (« successeur ») se réclame de l’héritage de Muhammad. Le programme invite à comparer ses fonctions à celles du basileus et de l’empereur.',
    'Très tôt, le monde musulman se divise : à propos d’Ali, quatrième calife, naît l’opposition entre **sunnites** et **chiites**. Les **Omeyyades** règnent depuis Damas jusqu’en 750 ; puis les **Abbassides** s’imposent et gouvernent depuis Bagdad.',
    'Un Omeyyade rescapé fonde un nouvel État à Cordoue. En 1258, la prise de Bagdad par les **Mongols** met fin à la puissance du **califat** abbasside. Retiens le couple : Damas (Omeyyades), puis Bagdad (Abbassides).',
  ],
  faits: [
    {
      ...P.hegire,
      q: 'Quelle année marque l’Hégire et le début de l’ère musulmane ?',
      a: '622',
      wrong: [
        { label: '1258', why: '1258 est l’année de la prise de Bagdad par les Mongols.' },
        { label: '800', why: '800 est l’année du couronnement impérial de Charlemagne.' },
        { label: '750', why: 'En 750, les Abbassides remplacent les Omeyyades : c’est plus tard.' },
      ],
      gap: ['En ', ', l’Hégire marque le début de l’ère musulmane.', ['622']],
      explain: 'L’Hégire, en 622, marque le début de l’ère musulmane.',
    },
    {
      ...P.calife,
      q: 'Que signifie le mot « calife » ?',
      a: 'successeur',
      wrong: [
        { label: 'empereur', why: 'L’empereur à Constantinople s’appelle basileus ; calife veut dire « successeur ».' },
        { label: 'marchand', why: 'Le calife n’est pas un marchand : c’est le successeur de Muhammad.' },
        {
          label: 'traducteur',
          why: 'Les traducteurs (à Tolède par exemple) transmettent des textes ; calife veut dire « successeur ».',
        },
      ],
      gap: ['Le mot « calife » signifie « ', ' » : le calife se réclame de l’héritage de Muhammad.', ['successeur']],
      explain: 'Le calife (« successeur ») se réclame de l’héritage de Muhammad.',
    },
    {
      ...P.ali,
      q: 'À propos de quel calife naissent les divisions entre musulmans ?',
      a: 'Ali',
      wrong: [
        { label: 'Justinien', why: 'Justinien est un empereur byzantin du VIe siècle, pas un calife.' },
        {
          label: 'Saladin',
          why: 'Saladin est lié au Caire et à la dynastie des Ayyoubides, bien plus tard (XIIe siècle).',
        },
        {
          label: 'Haroun al-Rachid',
          why: 'Haroun al-Rachid est un calife abbasside, contemporain de Charlemagne : les divisions sont plus anciennes.',
        },
      ],
      gap: [
        'Les divisions entre musulmans naissent à propos du quatrième calife, ',
        ', cousin et gendre de Muhammad.',
        ['Ali'],
      ],
      explain: 'C’est à propos d’Ali, quatrième calife, cousin et gendre de Muhammad, que naissent les divisions.',
    },
    {
      ...P.omeyyades,
      q: 'Quelle est la capitale de la dynastie des Omeyyades ?',
      a: 'Damas',
      wrong: [
        { label: 'Aix-la-Chapelle', why: 'Aix-la-Chapelle est la ville du palais de Charlemagne.' },
        { label: 'Constantinople', why: 'Constantinople est la capitale de l’empire byzantin.' },
        { label: 'Bagdad', why: 'Bagdad est la capitale des Abbassides, qui succèdent aux Omeyyades.' },
      ],
      gap: ['Les Omeyyades dominent le monde musulman jusqu’en 750 depuis leur capitale, ', '.', ['Damas']],
      explain: 'Les Omeyyades dominent le monde musulman jusqu’en 750, depuis leur capitale de Damas.',
    },
    {
      ...P.abbassides,
      q: 'Quelle dynastie s’impose après les Omeyyades et reste au pouvoir jusqu’en 1258 ?',
      a: 'les Abbassides',
      wrong: [
        { label: 'les Carolingiens', why: 'Les Carolingiens sont la dynastie de Charlemagne, en Occident.' },
        {
          label: 'les Mongols',
          why: 'Les Mongols prennent Bagdad en 1258 : ils mettent fin à la puissance abbasside.',
        },
        {
          label: 'les Ayyoubides',
          why: 'Les Ayyoubides sont la dynastie de Saladin, au Caire ; ils ne remplacent pas les Omeyyades en 750.',
        },
      ],
      gap: [
        'Après 750, la dynastie des ',
        ' s’impose ; elle reste au pouvoir jusqu’en 1258.',
        ['Abbassides', 'Abbasides'],
      ],
      explain: 'Après les Omeyyades, la dynastie des Abbassides s’impose et reste au pouvoir jusqu’en 1258.',
    },
    {
      ...P.bagdad,
      q: 'Qui prend Bagdad en 1258 ?',
      a: 'les Mongols',
      wrong: [
        { label: 'les Francs', why: 'Les Francs sont le peuple de Charlemagne, en Occident.' },
        { label: 'les Byzantins', why: 'Les Byzantins ne prennent pas Bagdad : ce sont les Mongols.' },
        {
          label: 'les Omeyyades de Cordoue',
          why: 'Les Omeyyades de Cordoue gouvernent en péninsule Ibérique ; Bagdad tombe aux mains des Mongols.',
        },
      ],
      gap: ['En 1258, les ', ' prennent Bagdad.', ['Mongols']],
      explain: 'La prise de Bagdad par les Mongols, en 1258, met fin à la puissance du califat abbasside.',
    },
    {
      ...P.cordoue,
      q: 'Où un Omeyyade rescapé fonde-t-il un nouvel État ?',
      a: 'à Cordoue',
      wrong: [
        { label: 'à Constantinople', why: 'Constantinople est la capitale de l’empire byzantin.' },
        { label: 'à Aix-la-Chapelle', why: 'Aix-la-Chapelle est la ville du palais de Charlemagne.' },
        { label: 'à Bagdad', why: 'Bagdad est la capitale des Abbassides, les vainqueurs des Omeyyades.' },
      ],
      gap: ['Un Omeyyade rescapé fonde un nouvel État à ', '.', ['Cordoue']],
      explain: 'Rescapé de la défaite des Omeyyades, un membre de la dynastie fonde un nouvel État à Cordoue.',
    },
    {
      ...P.territoire,
      q: 'Jusqu’où s’étend le territoire dominé par les Omeyyades ?',
      a: 'de l’Indus à la péninsule Ibérique',
      wrong: [
        { label: 'de la Chine au Japon', why: 'La Chine et le Japon sont hors du monde musulman étudié.' },
        { label: 'de la Gaule à la Germanie', why: 'La Gaule et la Germanie forment l’empire de Charlemagne.' },
        {
          label: 'de Damas à Bagdad seulement',
          why: 'Le territoire omeyyade est immense : il va bien au-delà, de l’Indus à la péninsule Ibérique.',
        },
      ],
      gap: ['Le territoire omeyyade va de l’', ' à la péninsule Ibérique.', ['Indus']],
      explain: 'Les Omeyyades peinent à stabiliser un territoire immense, de l’Indus à la péninsule Ibérique.',
    },
  ],
  paires3: [
    ['Le calife', 'Successeur de Muhammad'],
    ['Damas', 'Capitale des Omeyyades'],
    ['Bagdad', 'Capitale des Abbassides'],
  ],
  paires5: [
    ['L’Hégire', 'Début de l’ère musulmane (622)'],
    ['Ali', 'Quatrième calife, cousin et gendre de Muhammad'],
    ['Les Omeyyades', 'Dynastie qui domine jusqu’en 750'],
    ['Les Abbassides', 'Dynastie au pouvoir jusqu’en 1258'],
    ['Les Mongols', 'Prennent Bagdad en 1258'],
  ],
  frise: [
    { ...P.hegire, label: 'L’Hégire, début de l’ère musulmane', date: '622' },
    { ...P.omeyyades, label: 'Fin de la domination des Omeyyades', date: '750' },
    { ...P.couronnement, label: 'Couronnement impérial de Charlemagne', date: '800' },
    { ...P.bagdad, label: 'Prise de Bagdad par les Mongols', date: '1258' },
  ],
  libres: [
    {
      ...P.calife,
      q: 'Quel titre, qui signifie « successeur », porte celui qui se réclame de l’héritage de Muhammad ? (un mot)',
      accepted: ['calife', 'le calife', 'khalife'],
      traps: [
        { text: 'basileus', why: 'Le basileus est l’empereur à Constantinople.' },
        {
          text: 'imam',
          why: 'Pour les chiites, Ali est le premier imam ; le titre qui veut dire « successeur » est calife.',
        },
      ],
      explain: 'Le calife (« successeur ») se réclame de l’héritage de Muhammad.',
    },
    {
      ...P.bagdad,
      q: 'En quelle année les Mongols prennent-ils Bagdad ?',
      accepted: ['1258', 'en 1258'],
      traps: [
        { text: '750', why: 'En 750, les Abbassides remplacent les Omeyyades.' },
        { text: '622', why: '622 est l’année de l’Hégire.' },
      ],
      explain: 'La prise de Bagdad par les Mongols date de 1258 : elle clôt la période étudiée.',
    },
    {
      ...P.capitaleAbbassides,
      q: 'Quelle ville est la capitale des Abbassides ? (un nom)',
      accepted: ['Bagdad', 'Baghdad'],
      traps: [
        { text: 'Damas', why: 'Damas est la capitale des Omeyyades, avant 750.' },
        { text: 'Cordoue', why: 'Cordoue est la ville où un Omeyyade rescapé fonde un nouvel État.' },
      ],
      explain: 'Bagdad est la capitale des Abbassides.',
    },
    {
      ...P.chiites,
      q: 'Pour quel groupe de musulmans Ali est-il le premier imam ? (un mot)',
      accepted: ['chiites', 'les chiites', 'chiite'],
      traps: [
        {
          text: 'sunnites',
          why: 'Sunnites et chiites s’opposent à propos d’Ali ; ce sont les chiites qui voient en lui le premier imam.',
        },
        { text: 'Omeyyades', why: 'Les Omeyyades sont une dynastie de califes, pas un courant de l’islam.' },
      ],
      explain: 'L’opposition entre sunnites et chiites naît à propos d’Ali ; pour les chiites, il est le premier imam.',
    },
  ],
  docs: [
    {
      title: 'La Grande mosquée de Damas',
      lines: [
        'À Damas, capitale des Omeyyades, s’élève la Grande mosquée.',
        'Elle est construite à l’emplacement d’une ancienne église chrétienne.',
        'Cette église avait elle-même remplacé un temple romain.',
        'Tout près se dresse la citadelle, lieu du pouvoir.',
      ],
      qs: [
        {
          ...P.mosquee,
          q: 'Que montre la succession temple romain, église, mosquée au même endroit ?',
          a: 'la succession des religions dans un même lieu',
          wrong: [
            {
              label: 'que Damas a toujours été musulmane',
              why: 'Lignes 2 et 3 : avant la mosquée, il y avait une église, et avant elle un temple romain.',
            },
            {
              label: 'que les Romains ont construit la mosquée',
              why: 'Les Romains ont construit un temple ; la mosquée vient bien après (ligne 3).',
            },
          ],
          explain:
            'Le même lieu accueille un temple romain, puis une église, puis une mosquée : les religions se succèdent.',
        },
        {
          ...P.omeyyades,
          q: 'De quelle dynastie Damas est-elle la capitale ?',
          a: 'des Omeyyades',
          wrong: [
            { label: 'des Abbassides', why: 'Les Abbassides gouvernent depuis Bagdad.' },
            { label: 'des Carolingiens', why: 'Les Carolingiens gouvernent en Occident, depuis Aix-la-Chapelle.' },
          ],
          explain: 'Ligne 1 : Damas est la capitale des Omeyyades.',
        },
        {
          ...P.citadelle,
          q: 'Que suggère la proximité entre la mosquée et la citadelle ?',
          a: 'un lien fort entre pouvoir et religion',
          wrong: [
            {
              label: 'une séparation entre pouvoir et religion',
              why: 'La citadelle (le pouvoir) est tout près de la mosquée : ils sont liés.',
            },
            {
              label: 'l’absence de pouvoir à Damas',
              why: 'Ligne 4 : la citadelle est le lieu du pouvoir.',
            },
          ],
          explain: 'Mosquée et citadelle sont voisines : au Moyen Âge, pouvoir et religion sont étroitement liés.',
        },
      ],
    },
    {
      title: 'Un monde musulman divisé',
      lines: [
        'Le calife se présente comme le successeur de Muhammad.',
        'À propos du quatrième calife, Ali, les musulmans se divisent : sunnites d’un côté, chiites de l’autre.',
        'En 750, les Abbassides remplacent les Omeyyades ; ils gouvernent depuis Bagdad.',
        'Un Omeyyade rescapé fonde un nouvel État à Cordoue.',
        'En 1258, les Mongols prennent Bagdad : la puissance du califat abbasside s’effondre.',
      ],
      qs: [
        {
          ...P.diversite,
          q: 'Que montre ce texte sur le monde musulman ?',
          a: 'il est marqué très tôt par des divisions',
          wrong: [
            {
              label: 'il reste uni sous un seul pouvoir',
              why: 'Lignes 2 à 4 : divisions religieuses, changement de dynastie et nouvel État à Cordoue.',
            },
            {
              label: 'il ne change pas en six siècles',
              why: 'Le texte décrit des changements : nouvelles dynasties, nouvel État, prise de Bagdad.',
            },
          ],
          explain: 'L’islam, comme le christianisme, est très tôt marqué par la diversité et les divisions.',
        },
        {
          ...P.bagdad,
          q: 'Quel événement met fin à la puissance du califat abbasside ?',
          a: 'la prise de Bagdad par les Mongols',
          wrong: [
            {
              label: 'la fondation d’un État à Cordoue',
              why: 'Après la fondation de Cordoue, les Abbassides restent au pouvoir jusqu’en 1258.',
            },
            {
              label: 'le couronnement de Charlemagne',
              why: 'Le couronnement de Charlemagne (800) a lieu en Occident et n’est pas dans le texte.',
            },
          ],
          explain: 'Ligne 5 : en 1258, la prise de Bagdad par les Mongols met fin à la puissance abbasside.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : des mondes en contact ———

const contacts: Notion = {
  id: 'h5-mondes-contact',
  title: 'Des mondes en contact',
  hint: 'Demande-toi si le contact est pacifique (diplomatie, commerce, savoirs) ou guerrier (croisades, pillage), puis vérifie la date.',
  memo: [
    'Chrétientés et islam sont en contact autour de la Méditerranée, sillonnée par des marins, des guerriers et des marchands. Ces contacts peuvent être pacifiques ou guerriers : il faut garder les deux en tête.',
    'Contacts pacifiques : Charlemagne noue des relations **diplomatiques** avec Haroun al-Rachid, calife de Bagdad ; à Tolède, des traducteurs aident au partage de l’héritage antique ; le commerce est d’abord dominé par Byzance, puis par les cités italiennes.',
    'Contacts guerriers : les **croisades** (prise de Jérusalem en 1099). Les deux **chrétientés** s’écartent : **excommunication** mutuelle du pape et du patriarche en 1054, puis sac de Constantinople par les croisés en 1204.',
  ],
  faits: [
    {
      ...P.schisme,
      q: 'Que se passe-t-il en 1054 entre le pape et le patriarche de Constantinople ?',
      a: 'une excommunication mutuelle',
      wrong: [
        {
          label: 'une alliance contre les Mongols',
          why: 'Les Mongols prennent Bagdad en 1258 ; en 1054, c’est une rupture.',
        },
        { label: 'le couronnement de Charlemagne', why: 'Charlemagne est couronné en 800.' },
        {
          label: 'le sac de Constantinople',
          why: 'Le sac de Constantinople par les croisés date de 1204, pas de 1054.',
        },
      ],
      gap: ['En 1054, le pape et le patriarche de Constantinople s’', ' mutuellement.', ['excommunient']],
      explain: 'En 1054, le pape et le patriarche de Constantinople s’excommunient mutuellement.',
    },
    {
      ...P.sac,
      q: 'Quel événement de 1204 marque la rupture définitive entre chrétientés d’Occident et d’Orient ?',
      a: 'le sac de Constantinople par les croisés',
      wrong: [
        { label: 'l’Hégire', why: 'L’Hégire date de 622 : c’est le début de l’ère musulmane.' },
        { label: 'le traité de Verdun', why: 'Le traité de Verdun (843) partage l’empire carolingien.' },
        { label: 'la prise de Bagdad par les Mongols', why: 'Bagdad est prise en 1258, par les Mongols.' },
      ],
      gap: [
        'En 1204, les croisés pillent ',
        ' : c’est la rupture définitive entre chrétientés d’Occident et d’Orient.',
        ['Constantinople'],
      ],
      explain: 'Le sac de Constantinople par les croisés, en 1204, sépare définitivement les deux chrétientés.',
    },
    {
      ...P.haroun,
      q: 'Avec quel calife abbasside Charlemagne noue-t-il des relations diplomatiques ?',
      a: 'Haroun al-Rachid',
      wrong: [
        { label: 'Justinien', why: 'Justinien est un empereur byzantin du VIe siècle, pas un calife.' },
        { label: 'Otton Ier', why: 'Otton Ier est un empereur d’Occident, en 962.' },
        {
          label: 'Ali',
          why: 'Ali est le quatrième calife, au VIIe siècle, bien avant Charlemagne ; il n’est pas abbasside.',
        },
      ],
      gap: [
        'Charlemagne noue des relations diplomatiques avec le calife abbasside ',
        ', à Bagdad.',
        ['Haroun al-Rachid', 'Haroun al Rachid', 'Haroun al-Rashid', 'Haroun'],
      ],
      explain: 'Charlemagne noue des relations diplomatiques avec Haroun al-Rachid, calife abbasside de Bagdad.',
    },
    {
      ...P.mediterranee,
      q: 'Quel espace, sillonné par des marins, des guerriers et des marchands, est un lieu d’échanges scientifiques et culturels ?',
      a: 'la Méditerranée',
      wrong: [
        { label: 'l’océan Pacifique', why: 'L’océan Pacifique est très loin des mondes chrétien et musulman étudiés.' },
        { label: 'la mer Baltique', why: 'La mer Baltique, au nord de l’Europe, n’est pas l’espace de ces contacts.' },
        {
          label: 'l’océan Atlantique',
          why: 'L’espace qui relie Byzance, l’Occident et le monde musulman est la Méditerranée.',
        },
      ],
      gap: [
        'La ',
        ' est un lieu d’échanges scientifiques, culturels et artistiques.',
        ['Méditerranée', 'mer Méditerranée', 'Mediterranee', 'mer Mediterranee'],
      ],
      explain: 'La Méditerranée relie les trois mondes : on y fait la guerre, du commerce et des échanges de savoirs.',
    },
    {
      ...P.tolede,
      q: 'Dans quelle ville des traducteurs aident-ils au partage de l’héritage antique entre les mondes ?',
      a: 'Tolède',
      wrong: [
        { label: 'Verdun', why: 'Verdun est la ville du traité de 843, qui partage l’empire carolingien.' },
        { label: 'Poitiers', why: 'Poitiers évoque une bataille (732 ou 733), pas des traducteurs.' },
        {
          label: 'Aix-la-Chapelle',
          why: 'Aix-la-Chapelle est la ville du palais de Charlemagne ; les traducteurs cités sont ceux de Tolède.',
        },
      ],
      gap: ['Les traducteurs de ', ' participent au partage de l’héritage antique.', ['Tolède', 'Tolede']],
      explain:
        'Le partage de l’héritage antique passe par les traducteurs de Tolède et l’école d’astronomie de Cordoue.',
    },
    {
      ...P.commerce,
      q: 'Qui domine les échanges commerciaux en Méditerranée ?',
      a: 'd’abord l’empire byzantin, puis les cités italiennes',
      wrong: [
        { label: 'les Mongols seulement', why: 'Les Mongols viennent d’Asie et ne dominent pas la Méditerranée.' },
        {
          label: 'les Carolingiens seulement',
          why: 'L’empire carolingien n’est pas une grande puissance maritime en Méditerranée.',
        },
        {
          label: 'd’abord les cités italiennes, puis l’empire byzantin',
          why: 'C’est l’inverse : l’empire byzantin domine d’abord, puis les cités italiennes.',
        },
      ],
      gap: [
        'Le commerce méditerranéen est d’abord dominé par l’empire byzantin, puis par les cités ',
        '.',
        ['italiennes'],
      ],
      explain: 'Les échanges commerciaux sont d’abord dominés par l’empire byzantin, puis par les cités italiennes.',
    },
    {
      ...P.croisadesByzantins,
      q: 'Les premières croisades ont aussi pour objet de soutenir quel peuple face aux Turcs ?',
      a: 'les Byzantins',
      wrong: [
        { label: 'les Mongols', why: 'Les Mongols arrivent plus tard et prennent Bagdad en 1258.' },
        { label: 'les Omeyyades', why: 'Les Omeyyades sont une dynastie de califes, pas des alliés des croisés.' },
        {
          label: 'les Abbassides',
          why: 'Les Abbassides sont des califes musulmans ; les croisades soutiennent les chrétiens byzantins.',
        },
      ],
      gap: ['Les premières croisades ont aussi pour objet de soutenir les ', ' face aux Turcs.', ['Byzantins']],
      explain: 'Les premières croisades veulent aussi soutenir les Byzantins face aux Turcs.',
    },
    {
      ...P.jerusalem,
      q: 'Quelle ville est prise en 1099, lors de la première croisade ?',
      a: 'Jérusalem',
      wrong: [
        { label: 'Bagdad', why: 'Bagdad est prise par les Mongols en 1258.' },
        { label: 'Cordoue', why: 'Cordoue est la ville d’un nouvel État omeyyade, en péninsule Ibérique.' },
        { label: 'Constantinople', why: 'Constantinople est prise et pillée par les croisés en 1204, pas en 1099.' },
      ],
      gap: ['En 1099, les croisés prennent ', '.', ['Jérusalem', 'Jerusalem']],
      explain: 'La prise de Jérusalem, en 1099, est un épisode guerrier des contacts entre les mondes.',
    },
  ],
  paires3: [
    ['1054', 'Excommunication mutuelle du pape et du patriarche'],
    ['1099', 'Prise de Jérusalem'],
    ['1204', 'Sac de Constantinople par les croisés'],
  ],
  paires5: [
    ['Haroun al-Rachid', 'Calife en relation avec Charlemagne'],
    ['Tolède', 'Ville de traducteurs'],
    ['Cordoue', 'École d’astronomie'],
    ['Saladin', 'Échange des lettres avec Richard Cœur de Lion'],
    ['Alexis Comnène', 'Voit passer les chefs de la première croisade'],
  ],
  frise: [
    { ...P.poitiers, label: 'Bataille dite de Poitiers', date: '732 ou 733' },
    { ...P.schisme, label: 'Excommunication mutuelle du pape et du patriarche', date: '1054' },
    { ...P.jerusalem, label: 'Prise de Jérusalem', date: '1099' },
    { ...P.sac, label: 'Sac de Constantinople par les croisés', date: '1204' },
  ],
  libres: [
    {
      ...P.sac,
      q: 'En quelle année les croisés pillent-ils Constantinople ?',
      accepted: ['1204', 'en 1204'],
      traps: [
        { text: '1054', why: '1054 est l’année de l’excommunication mutuelle du pape et du patriarche.' },
        { text: '1099', why: '1099 est l’année de la prise de Jérusalem.' },
      ],
      explain: 'Le sac de Constantinople par les croisés date de 1204.',
    },
    {
      ...P.schisme,
      q: 'En quelle année le pape et le patriarche de Constantinople s’excommunient-ils mutuellement ?',
      accepted: ['1054', 'en 1054'],
      traps: [
        { text: '1204', why: '1204 est l’année du sac de Constantinople, la rupture définitive.' },
        { text: '800', why: '800 est l’année du couronnement de Charlemagne.' },
      ],
      explain: 'L’excommunication mutuelle du pape et du patriarche date de 1054.',
    },
    {
      ...P.mediterranee,
      q: 'Quelle mer, sillonnée par des marins, des guerriers et des marchands, relie ces mondes ? (un nom)',
      accepted: [
        'Méditerranée',
        'la Méditerranée',
        'mer Méditerranée',
        'la mer Méditerranée',
        'Mediterranee',
        'la Mediterranee',
      ],
      traps: [
        { text: 'Atlantique', why: 'L’espace de contact étudié est la Méditerranée, pas l’Atlantique.' },
        { text: 'mer du Nord', why: 'La mer du Nord est loin de Byzance et du monde musulman.' },
      ],
      explain: 'La Méditerranée est l’espace des contacts entre chrétientés et islam.',
    },
    {
      ...P.haroun,
      q: 'Quel calife abbasside entretient des relations diplomatiques avec Charlemagne ? (un nom)',
      accepted: ['Haroun al-Rachid', 'Haroun al Rachid', 'Haroun al-Rashid', 'Haroun'],
      traps: [
        { text: 'Saladin', why: 'Saladin vit au XIIe siècle et échange avec Richard Cœur de Lion.' },
        { text: 'Ali', why: 'Ali est le quatrième calife, bien avant Charlemagne.' },
      ],
      explain: 'Charlemagne noue des relations diplomatiques avec Haroun al-Rachid, calife abbasside de Bagdad.',
    },
  ],
  docs: [
    {
      title: 'Charlemagne et le calife',
      lines: [
        'Vers l’an 800, Charlemagne règne à Aix-la-Chapelle ; Haroun al-Rachid est calife à Bagdad.',
        'Les deux souverains nouent des relations diplomatiques.',
        'Ils ont un adversaire commun : les Omeyyades d’Al-Andalus, en péninsule Ibérique.',
        'Dans la mémoire collective, on retient surtout la bataille dite de Poitiers (732 ou 733).',
        'Pourtant, à l’époque, elle n’est pas perçue comme un affrontement décisif.',
      ],
      qs: [
        {
          ...P.haroun,
          q: 'Pourquoi Charlemagne noue-t-il des relations avec le calife de Bagdad ?',
          a: 'pour prendre à revers les Omeyyades d’Al-Andalus',
          wrong: [
            {
              label: 'pour attaquer Constantinople',
              why: 'Le texte ne parle pas de Constantinople : relis la ligne 3.',
            },
            {
              label: 'pour partager son empire',
              why: 'Le partage de l’empire carolingien (843) n’a rien à voir avec le calife.',
            },
          ],
          explain: 'Ligne 3 : les deux souverains ont un adversaire commun, les Omeyyades d’Al-Andalus.',
        },
        {
          ...P.rapports,
          q: 'Que montre ce texte sur les relations entre chrétiens et musulmans ?',
          a: 'elles ne se résument pas à des affrontements',
          wrong: [
            { label: 'elles sont uniquement guerrières', why: 'Ligne 2 : il y a aussi des relations diplomatiques.' },
            { label: 'elles n’existent pas', why: 'Les deux souverains sont en relation (ligne 2).' },
          ],
          explain: 'Relations diplomatiques et alliances montrent que les contacts ne sont pas seulement militaires.',
        },
        {
          ...P.poitiers,
          q: 'Comment la bataille dite de Poitiers est-elle perçue à l’époque ?',
          a: 'comme un affrontement qui n’est pas décisif',
          wrong: [
            {
              label: 'comme la victoire décisive des chrétiens sur les musulmans',
              why: 'C’est la mémoire collective plus tardive ; ligne 5, à l’époque, elle n’est pas perçue comme décisive.',
            },
            {
              label: 'comme le couronnement de Charlemagne',
              why: 'Le couronnement de Charlemagne a lieu en 800 ; Poitiers est une bataille.',
            },
          ],
          explain: 'Ligne 5 : à l’époque, la bataille dite de Poitiers n’est pas perçue comme un affrontement décisif.',
        },
      ],
    },
    {
      title: 'Une mer de contacts',
      lines: [
        'Sur la Méditerranée se croisent des marins, des guerriers et des marchands.',
        'Le commerce y est d’abord dominé par l’empire byzantin, puis par les cités italiennes.',
        'À Tolède, des traducteurs font passer des textes antiques d’une langue à l’autre.',
        'En 1204, des croisés pillent Constantinople : les chrétientés d’Occident et d’Orient se séparent.',
      ],
      qs: [
        {
          ...P.pacifiques,
          q: 'D’après le texte, quels types de contacts existent autour de la Méditerranée ?',
          a: 'des contacts pacifiques et des contacts guerriers',
          wrong: [
            {
              label: 'seulement des guerres',
              why: 'Lignes 2 et 3 : commerce et traductions sont des contacts pacifiques.',
            },
            { label: 'seulement du commerce', why: 'Ligne 4 : le sac de Constantinople est un épisode guerrier.' },
          ],
          explain: 'Le texte mêle commerce, savoirs (contacts pacifiques) et pillage (contact guerrier).',
        },
        {
          ...P.commerce,
          q: 'Qui domine d’abord le commerce méditerranéen ?',
          a: 'l’empire byzantin',
          wrong: [
            { label: 'les cités italiennes', why: 'Ligne 2 : les cités italiennes dominent ensuite, pas d’abord.' },
            { label: 'les Mongols', why: 'Les Mongols ne sont pas cités : ils ne dominent pas la Méditerranée.' },
          ],
          explain: 'Ligne 2 : le commerce est d’abord dominé par l’empire byzantin.',
        },
        {
          ...P.tolede,
          q: 'Quel est le rôle des traducteurs de Tolède ?',
          a: 'partager l’héritage antique',
          wrong: [
            {
              label: 'diriger les croisades',
              why: 'Les traducteurs transmettent des textes ; ils ne mènent pas de guerre.',
            },
            { label: 'élire le calife', why: 'Le texte ne parle pas du calife : relis la ligne 3.' },
          ],
          explain: 'Ligne 3 : en traduisant des textes antiques, ils aident au partage de l’héritage antique.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [byzance, islam, contacts];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'cinquième'));
