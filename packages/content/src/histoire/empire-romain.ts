import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './empire-romain-sources.ts';

/**
 * 6e, thème 3 « L'empire romain dans le monde antique » (lot hi-6e-03). Chaque fait cite le programme du cycle 3 ou la
 * ressource d'accompagnement Éduscol du thème ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

// ——— Notion 1 : conquêtes, paix romaine et romanisation ———

const romanisation: Notion = {
  id: 'h6-romanisation',
  title: 'Conquêtes, paix romaine et romanisation',
  hint: 'Distingue les trois piliers de l’unité de l’empire : le pouvoir de l’empereur, la romanisation et le prestige de Rome.',
  memo: [
    'Par l’enchaînement des conquêtes, Rome forme un vaste **empire** qui réunit des peuples et des cultures variés, répartis en **provinces**. En 27 avant J.-C., le Sénat donne à Octave le nom d’Auguste : il est le premier **empereur**.',
    'Aux Ier et IIe siècles, c’est la **paix romaine** (pax romana) : l’armée maintient l’ordre et protège les frontières. L’unité repose sur le pouvoir de l’empereur, sur le prestige de Rome, l’**Urbs**, et sur le **culte impérial**.',
    'La **romanisation** est la diffusion du mode de vie et du modèle civique romains : forum, thermes, théâtres. La **citoyenneté** romaine s’étend peu à peu, jusqu’à l’édit de Caracalla (212), qui l’accorde à tous les hommes libres.',
  ],
  faits: [
    {
      ...P.auguste,
      q: 'Quel nom Octave reçoit-il du Sénat en 27 avant J.-C. ?',
      a: 'Auguste',
      wrong: [
        { label: 'Constantin', why: 'Constantin est un empereur du IVe siècle, qui favorise le christianisme.' },
        { label: 'Wudi', why: 'Wudi est un empereur de la Chine des Han, pas un empereur romain.' },
        {
          label: 'Jules César',
          why: 'Jules César est le père adoptif d’Octave : son nom se retrouve dans le titre « Caesar », mais Octave est appelé Auguste.',
        },
      ],
      gap: ['En 27 avant J.-C., le Sénat donne à Octave le nom d’', '.', ['Auguste']],
      explain: 'En 27 avant J.-C., Octave devient Auguste : il inaugure le titre des empereurs romains.',
    },
    {
      ...P.caracalla,
      q: 'Quel édit de 212 accorde la citoyenneté romaine à tous les hommes libres de l’empire ?',
      a: 'l’édit de Caracalla',
      wrong: [
        { label: 'l’édit de Nantes', why: 'L’édit de Nantes est associé à Henri IV, bien plus tard.' },
        {
          label: 'le concile de Nicée',
          why: 'Le concile de Nicée (325) réunit des évêques : il ne parle pas de citoyenneté.',
        },
        {
          label: 'l’édit de Thessalonique',
          why: 'L’édit de Thessalonique (380) concerne la religion : il fait du christianisme la religion officielle.',
        },
      ],
      gap: ['En 212, l’édit de ', ' accorde la citoyenneté romaine à tous les hommes libres.', ['Caracalla']],
      explain: 'La citoyenneté romaine s’étend progressivement, jusqu’à l’édit de Caracalla de 212.',
    },
    {
      ...P.armee,
      q: 'Sur quoi le pouvoir impérial s’appuie-t-il pour maintenir l’ordre dans l’empire et le protéger ?',
      a: 'sur l’armée',
      wrong: [
        { label: 'sur les mandarins', why: 'Les mandarins sont les fonctionnaires de la Chine des Han.' },
        {
          label: 'sur l’assemblée des citoyens d’Athènes',
          why: 'Cette assemblée appartient à la démocratie athénienne, pas au pouvoir de l’empereur romain.',
        },
        {
          label: 'sur les évêques',
          why: 'Les évêques dirigent les communautés chrétiennes ; ils ne protègent pas les frontières.',
        },
      ],
      gap: ['Le pouvoir impérial s’appuie sur l’', ', qui maintient l’ordre et protège l’empire.', ['armée', 'armee']],
      explain:
        'L’armée maintient l’ordre à l’intérieur et protège les frontières : elle contribue à l’unité de l’empire.',
    },
    {
      ...P.romanisation,
      q: 'Comment appelle-t-on la diffusion du mode de vie et du modèle civique romains dans l’empire ?',
      a: 'la romanisation',
      wrong: [
        {
          label: 'la sédentarisation',
          why: 'La sédentarisation date du néolithique : des groupes humains se fixent en un lieu.',
        },
        { label: 'la démocratie', why: 'La démocratie est un régime politique, né à Athènes.' },
        {
          label: 'la christianisation',
          why: 'La christianisation est la diffusion du christianisme, pas celle du modèle romain.',
        },
      ],
      gap: ['La diffusion du modèle romain dans les provinces s’appelle la ', '.', ['romanisation']],
      explain: 'La romanisation diffuse un plan de ville, mais aussi un modèle civique.',
    },
    {
      ...P.monuments,
      q: 'Quels monuments caractérisent une cité romanisée ?',
      a: 'le forum, les thermes et le théâtre',
      wrong: [
        { label: 'des châteaux forts', why: 'Les châteaux forts appartiennent au Moyen Âge.' },
        { label: 'des pyramides', why: 'Les pyramides évoquent l’Égypte ancienne, bien antérieure à l’empire romain.' },
        { label: 'des cathédrales gothiques', why: 'Les cathédrales gothiques sont construites au Moyen Âge.' },
      ],
      gap: ['Dans une cité romanisée, on trouve un ', ', des thermes et un théâtre.', ['forum']],
      explain: 'Forum, thermes et théâtres sont des monuments caractéristiques de la culture romaine.',
    },
    {
      ...P.rome,
      q: 'Quelle cité est la plus peuplée de l’empire, siège du pouvoir et ville de l’empereur ?',
      a: 'Rome',
      wrong: [
        { label: 'Athènes', why: 'Athènes est une cité grecque, célèbre pour sa démocratie.' },
        { label: 'Jérusalem', why: 'Jérusalem est la ville du Temple, prise par Titus en 70.' },
        { label: 'Arles', why: 'Arles est une cité de province romanisée, pas la ville de l’empereur.' },
      ],
      gap: ['La ville de l’empereur, cité la plus peuplée de l’empire, est ', '.', ['Rome']],
      explain: 'Rome, l’Urbs, est la cité la plus peuplée, le siège du pouvoir et la ville de l’empereur.',
    },
    {
      ...P.pax,
      q: 'À quelle période parle-t-on de « paix romaine » (pax romana) ?',
      a: 'aux Ier et IIe siècles',
      wrong: [
        { label: 'au XIIIe siècle', why: 'Le XIIIe siècle est le siècle de Louis IX, au Moyen Âge.' },
        {
          label: 'au Ve siècle',
          why: 'À la fin du Ve siècle, l’empire romain d’Occident s’effondre : ce n’est pas une période de paix.',
        },
        {
          label: 'au IIe siècle avant J.-C.',
          why: 'Au IIe siècle avant J.-C., Rome mène encore ses grandes conquêtes.',
        },
      ],
      gap: [
        'La paix romaine correspond aux Ier et ',
        ' siècles.',
        ['IIe', '2e', 'IIème', '2ème', 'deuxième', 'deuxieme', 'second'],
      ],
      explain: 'Aux Ier et IIe siècles, l’empire romain vit au temps de la pax romana.',
    },
  ],
  paires3: [
    ['Auguste', 'Premier empereur (27 av. J.-C.)'],
    ['Caracalla', 'Citoyenneté pour tous les hommes libres (212)'],
    ['Rome', 'Ville de l’empereur'],
  ],
  paires5: [
    ['Auguste', 'Premier empereur (27 av. J.-C.)'],
    ['Caracalla', 'Citoyenneté pour tous les hommes libres (212)'],
    ['Rome', 'Ville de l’empereur'],
    ['Trajan', 'Premier empereur non italien'],
    ['L’armée', 'Maintien de l’ordre et protection des frontières'],
  ],
  ordre: [
    'Conquête de la Gaule par César',
    'Octave reçoit le nom d’Auguste (27 av. J.-C.)',
    'Paix romaine (Ier-IIe siècles)',
    'Édit de Caracalla (212)',
  ],
  libres: [
    {
      ...P.caracalla,
      q: 'En quelle année l’édit de Caracalla accorde-t-il la citoyenneté romaine à tous les hommes libres ?',
      accepted: ['212', 'en 212'],
      traps: [
        { text: '380', why: '380 est l’année de l’édit de Thessalonique, sur la religion.' },
        { text: '325', why: '325 est l’année du concile de Nicée.' },
      ],
      explain: 'L’édit de Caracalla date de 212.',
    },
    {
      ...P.auguste,
      q: 'Quel nom Octave porte-t-il à partir de 27 avant J.-C. ? (un nom)',
      accepted: ['Auguste'],
      traps: [
        { text: 'César', why: 'Jules César est son père adoptif ; Octave, lui, devient Auguste.' },
        { text: 'Trajan', why: 'Trajan est un successeur d’Auguste, le premier empereur non italien.' },
      ],
      explain: 'En 27 avant J.-C., le Sénat donne à Octave le nom d’Auguste.',
    },
    {
      ...P.romanisation,
      q: 'Comment appelle-t-on la diffusion de la culture et du modèle civique romains dans les provinces ? (un mot)',
      accepted: ['romanisation', 'la romanisation'],
      traps: [
        {
          text: 'colonisation',
          why: 'La colonisation désigne l’installation sur un territoire pour le contrôler ; la diffusion du modèle romain se nomme romanisation.',
        },
        { text: 'christianisation', why: 'La christianisation est la diffusion du christianisme.' },
      ],
      explain: 'C’est la romanisation : un plan de ville, mais aussi un modèle civique.',
    },
    {
      ...P.culte,
      q: 'Quel culte, rendu à l’empereur, garantit surtout l’unité de l’empire ? (deux mots)',
      accepted: ['culte impérial', 'le culte impérial', 'culte imperial', 'le culte imperial'],
      traps: [
        {
          text: 'christianisme',
          why: 'Les chrétiens refusent justement le culte impérial : le christianisme n’est pas ce culte.',
        },
        { text: 'judaïsme', why: 'Les Juifs refusent eux aussi le culte impérial.' },
      ],
      explain: 'L’unité de l’empire est garantie par le prestige de Rome et surtout par le culte impérial.',
    },
  ],
  docs: [
    {
      title: 'Un habitant d’une cité de province',
      lines: [
        'J’habite Arles, une cité de province.',
        'Le matin, je règle mes affaires au forum ; l’après-midi, je vais aux thermes.',
        'Les jours de fête, nous assistons aux spectacles du théâtre.',
        'Au temple, nous honorons Rome et l’empereur.',
        'Mon père est devenu citoyen romain : il participe aux affaires de la cité.',
      ],
      qs: [
        {
          ...P.monuments,
          q: 'Quel phénomène ce texte illustre-t-il ?',
          a: 'la romanisation',
          wrong: [
            { label: 'la christianisation', why: 'Le texte ne parle pas du christianisme.' },
            { label: 'la sédentarisation', why: 'La sédentarisation date du néolithique.' },
          ],
          explain: 'Forum, thermes, théâtre, culte de Rome : la cité vit à la romaine.',
        },
        {
          ...P.culteCite,
          q: 'Quel culte relie les habitants de la cité à l’empire ?',
          a: 'le culte de Rome et de l’empereur',
          wrong: [
            {
              label: 'le culte d’un dieu unique',
              why: 'Le texte parle de Rome et de l’empereur, pas d’un dieu unique.',
            },
            { label: 'aucun culte', why: 'Relis la ligne 4 : au temple, on honore Rome et l’empereur.' },
          ],
          explain: 'Le culte de Rome et de l’empereur inscrit la cité et ses habitants dans l’empire.',
        },
      ],
    },
    {
      title: 'Le titre d’Auguste',
      lines: [
        'En 27 avant J.-C., le Sénat donne à Octave le nom d’Auguste.',
        'Son titre complet est : Imperator Caesar Augustus.',
        'Imperator rappelle le triomphe des généraux victorieux.',
        'Caesar rappelle l’héritage de Jules César, son père adoptif.',
        'Augustus désigne une autorité éminente et sacrée.',
      ],
      qs: [
        {
          ...P.titre,
          q: 'Que rappelle le mot « Caesar » dans le titre de l’empereur ?',
          a: 'l’héritage de Jules César',
          wrong: [
            { label: 'une autorité sacrée', why: 'C’est le sens d’« Augustus » (ligne 5).' },
            { label: 'le triomphe des généraux', why: 'C’est le sens d’« Imperator » (ligne 3).' },
          ],
          explain: 'Caesar renvoie à Jules César, dont Octave est le fils adoptif.',
        },
        {
          ...P.auguste,
          q: 'Qui donne à Octave le nom d’Auguste ?',
          a: 'le Sénat',
          wrong: [
            { label: 'l’armée', why: 'Relis la ligne 1 : c’est une décision du Sénat.' },
            { label: 'Jules César', why: 'Jules César est son père adoptif ; la décision vient du Sénat.' },
          ],
          explain: 'Octave devient Auguste en 27 avant J.-C., par la décision du Sénat.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : des chrétiens dans l’empire ———

const chretiens: Notion = {
  id: 'h6-chretiens-empire',
  title: 'Des chrétiens dans l’empire',
  hint: 'Situe chaque fait : les premières communautés (Ier-IIe siècles), les persécutions, puis le IVe siècle.',
  memo: [
    'Le **christianisme** est issu du **judaïsme** et se développe dans le monde grec et romain. C’est un **monothéisme**, qui se réclame de Jésus, appelé aussi Christ. Les lettres de Paul sont les plus anciens écrits qui attestent ces premières communautés.',
    'Les chrétiens, comme les Juifs, refusent le **culte impérial**, qu’ils perçoivent comme une **idolâtrie**. Ils subissent des **persécutions**, sous Néron puis sous Dioclétien.',
    'Au IVe siècle, Constantin favorise le christianisme et convoque le **concile** de Nicée (325), qui réunit des **évêques**. En 380, l’**édit** de Thessalonique de Théodose Ier en fait la religion officielle de l’Empire d’Orient : c’est un christianisme impérial.',
  ],
  faits: [
    {
      ...P.issu,
      q: 'De quelle religion le christianisme est-il issu ?',
      a: 'du judaïsme',
      wrong: [
        { label: 'du culte impérial', why: 'Les chrétiens refusent le culte impérial : ils n’en sont pas issus.' },
        {
          label: 'du polythéisme grec',
          why: 'Le polythéisme honore plusieurs dieux ; le christianisme est un monothéisme, issu du judaïsme.',
        },
        { label: 'de la religion des Han', why: 'La Chine des Han est un autre monde ancien, lointain.' },
      ],
      gap: [
        'Le christianisme est issu du ',
        ' et se développe dans le monde grec et romain.',
        ['judaïsme', 'judaisme'],
      ],
      explain: 'Le christianisme naît du judaïsme, puis se développe dans le monde grec et romain.',
    },
    {
      ...P.idolatrie,
      q: 'Pourquoi les chrétiens refusent-ils le culte impérial ?',
      a: 'ils y voient une idolâtrie',
      wrong: [
        { label: 'ils vivent hors de l’empire', why: 'Les communautés chrétiennes vivent dans l’empire.' },
        {
          label: 'l’empereur le leur interdit',
          why: 'Au contraire, le culte impérial est attendu de tous les habitants.',
        },
        {
          label: 'ils ne sont pas citoyens romains',
          why: 'Certains chrétiens sont citoyens, comme Paul : la raison est religieuse.',
        },
      ],
      gap: ['Les chrétiens refusent le culte impérial, qu’ils perçoivent comme une ', '.', ['idolâtrie', 'idolatrie']],
      explain: 'Pour les chrétiens comme pour les Juifs, rendre un culte à l’empereur est une idolâtrie.',
    },
    {
      ...P.persecutions,
      q: 'Sous quels empereurs les chrétiens subissent-ils des persécutions ?',
      a: 'Néron et Dioclétien',
      wrong: [
        { label: 'Clovis et Charlemagne', why: 'Ce sont des rois francs chrétiens, bien plus tardifs.' },
        { label: 'Wudi et ses successeurs', why: 'Wudi est un empereur de la Chine des Han.' },
        {
          label: 'Constantin et Théodose Ier',
          why: 'Constantin favorise le christianisme et Théodose Ier en fait la religion officielle.',
        },
      ],
      gap: ['Des persécutions ont lieu sous Néron et sous ', '.', ['Dioclétien', 'Diocletien']],
      explain: 'Les chrétiens sont persécutés sous Néron, puis sous Dioclétien.',
    },
    {
      ...P.nicee,
      q: 'Quel empereur convoque le concile de Nicée en 325 ?',
      a: 'Constantin',
      wrong: [
        { label: 'Néron', why: 'Néron persécute les chrétiens : il ne réunit pas de concile.' },
        { label: 'Auguste', why: 'Auguste devient empereur en 27 avant J.-C., avant les débuts du christianisme.' },
        { label: 'Théodose Ier', why: 'Théodose Ier est l’empereur de l’édit de Thessalonique (380).' },
      ],
      gap: ['En 325, l’empereur ', ' convoque le concile de Nicée.', ['Constantin']],
      explain: 'Constantin favorise le christianisme et convoque lui-même le concile de Nicée en 325.',
    },
    {
      ...P.thessalonique,
      q: 'Que décide l’édit de Thessalonique en 380 ?',
      a: 'le christianisme devient la religion officielle',
      wrong: [
        { label: 'les chrétiens sont persécutés', why: 'Les persécutions ont lieu avant, sous Néron et Dioclétien.' },
        {
          label: 'tous les hommes libres deviennent citoyens',
          why: 'C’est l’édit de Caracalla, en 212.',
        },
        {
          label: 'le Temple de Jérusalem est détruit',
          why: 'Le Temple est détruit en 70, après la prise de Jérusalem.',
        },
      ],
      gap: [
        'En 380, l’édit de Thessalonique fait du christianisme la religion ',
        ' de l’Empire d’Orient.',
        ['officielle', 'officielle et unique'],
      ],
      explain: 'Par l’édit de Thessalonique, Théodose Ier fait du christianisme la religion officielle et unique.',
    },
    {
      ...P.eveques,
      q: 'Qui dirige les communautés chrétiennes au IVe siècle ?',
      a: 'des évêques',
      wrong: [
        { label: 'des mandarins', why: 'Les mandarins sont les fonctionnaires de la Chine des Han.' },
        { label: 'des généraux', why: 'Les généraux commandent l’armée, pas les communautés chrétiennes.' },
        {
          label: 'un conseil d’anciens',
          why: 'C’est l’organisation des premières communautés ; au IVe siècle, elles sont dirigées par des évêques.',
        },
      ],
      gap: ['Au IVe siècle, les communautés chrétiennes sont dirigées par des ', '.', ['évêques', 'eveques']],
      explain: 'Au IVe siècle, des évêques dirigent les communautés ; à Nicée, ils définissent les croyances.',
    },
    {
      ...P.paul,
      q: 'Quels sont les plus anciens documents écrits qui attestent l’existence des communautés chrétiennes ?',
      a: 'les lettres de Paul',
      wrong: [
        { label: 'l’édit de Thessalonique', why: 'L’édit de Thessalonique date de 380, bien plus tard.' },
        { label: 'les décisions du concile de Nicée', why: 'Le concile de Nicée a lieu en 325.' },
        { label: 'le titre d’Auguste', why: 'Ce titre concerne l’empereur, pas les communautés chrétiennes.' },
      ],
      gap: ['Les ', ' de Paul sont les plus anciens écrits sur les communautés chrétiennes.', ['lettres']],
      explain:
        'Les lettres de Paul sont les plus anciens documents écrits sur les communautés qui se réfèrent à Jésus.',
    },
  ],
  paires3: [
    ['Néron', 'Persécution des chrétiens'],
    ['Constantin', 'Concile de Nicée (325)'],
    ['Théodose Ier', 'Édit de Thessalonique (380)'],
  ],
  paires5: [
    ['Néron', 'Persécution des chrétiens'],
    ['Constantin', 'Concile de Nicée (325)'],
    ['Théodose Ier', 'Édit de Thessalonique (380)'],
    ['Paul', 'Plus anciennes lettres chrétiennes'],
    ['Titus', 'Prise de Jérusalem (70)'],
  ],
  ordre: [
    'Prise de Jérusalem par Titus (70)',
    'Formation du Nouveau Testament (IIe siècle)',
    'Concile de Nicée (325)',
    'Édit de Thessalonique (380)',
  ],
  libres: [
    {
      ...P.thessalonique,
      q: 'En quelle année l’édit de Thessalonique fait-il du christianisme la religion officielle ?',
      accepted: ['380', 'en 380'],
      traps: [
        { text: '325', why: '325 est l’année du concile de Nicée.' },
        { text: '212', why: '212 est l’année de l’édit de Caracalla, sur la citoyenneté.' },
      ],
      explain: 'L’édit de Thessalonique date de 380.',
    },
    {
      ...P.nicee,
      q: 'Dans quelle ville Constantin réunit-il un concile en 325 ?',
      accepted: ['Nicée', 'Nicee', 'à Nicée', 'a Nicee'],
      traps: [
        { text: 'Thessalonique', why: 'Thessalonique est la ville de l’édit de 380.' },
        { text: 'Jérusalem', why: 'Jérusalem est prise par Titus en 70 ; le concile se tient ailleurs.' },
      ],
      explain: 'C’est le concile de Nicée, en 325.',
    },
    {
      ...P.issu,
      q: 'De quelle religion le christianisme est-il issu ? (un mot)',
      accepted: ['judaïsme', 'judaisme', 'le judaïsme', 'le judaisme'],
      traps: [
        { text: 'polythéisme', why: 'Le christianisme est un monothéisme : il n’est pas issu du polythéisme.' },
        { text: 'islam', why: 'L’islam apparaît plus tard ; le christianisme est issu du judaïsme.' },
      ],
      explain: 'Le christianisme est issu du judaïsme.',
    },
  ],
  docs: [
    {
      title: 'Paul, un voyageur de la Méditerranée',
      lines: [
        'Paul est un Juif de culture grecque.',
        'Il voyage autour de la Méditerranée et écrit des lettres aux communautés qui suivent Jésus, appelé Christ.',
        'Il prêche aussi auprès de populations qui ne sont pas juives.',
        'Arrêté, il fait valoir qu’il est citoyen romain.',
      ],
      qs: [
        {
          ...P.paulNonJuifs,
          q: 'À qui Paul s’adresse-t-il aussi, en plus des Juifs ?',
          a: 'à des populations non juives',
          wrong: [
            { label: 'seulement aux empereurs', why: 'Relis la ligne 3 : il prêche auprès de populations non juives.' },
            { label: 'aux marchands de la Chine des Han', why: 'Paul voyage autour de la Méditerranée, pas en Chine.' },
          ],
          explain: 'La prédication de Paul touche des populations non juives.',
        },
        {
          ...P.paulCitoyen,
          q: 'Quel statut Paul fait-il valoir quand il est arrêté ?',
          a: 'la citoyenneté romaine',
          wrong: [
            { label: 'le titre d’empereur', why: 'Paul n’est pas empereur.' },
            { label: 'la fonction d’évêque', why: 'Relis la ligne 4 : il se dit citoyen romain.' },
          ],
          explain: 'Paul se prévaut de sa citoyenneté romaine.',
        },
      ],
    },
    {
      title: 'Théodose Ier et l’évêque Ambroise',
      lines: [
        'À Thessalonique, une émeute est durement réprimée sur ordre de l’empereur Théodose Ier.',
        'Ambroise, évêque de Milan, exige que l’empereur fasse pénitence.',
        'Théodose Ier s’incline et fait pénitence devant l’évêque.',
        'C’est le même empereur qui a fait du christianisme la religion officielle par l’édit de Thessalonique.',
      ],
      qs: [
        {
          ...P.ambroise,
          q: 'Devant qui l’empereur Théodose Ier fait-il pénitence ?',
          a: 'Ambroise, évêque de Milan',
          wrong: [
            { label: 'Constantin', why: 'Constantin est un empereur plus ancien, celui du concile de Nicée.' },
            { label: 'Paul', why: 'Paul appartient au temps des premières communautés, bien avant Théodose Ier.' },
          ],
          explain: 'Théodose Ier est contraint de faire pénitence devant Ambroise, évêque de Milan.',
        },
        {
          ...P.rapport,
          q: 'Que montre cet épisode ?',
          a: 'un nouveau rapport de force entre l’Église et l’empereur',
          wrong: [
            {
              label: 'la persécution des chrétiens par l’empereur',
              why: 'Le christianisme est déjà religion officielle : l’empereur ne persécute pas l’Église.',
            },
            {
              label: 'la fin du christianisme impérial',
              why: 'Au contraire, Théodose Ier a fait du christianisme la religion officielle.',
            },
          ],
          explain: 'Un évêque impose une pénitence à l’empereur : c’est un nouveau rapport de force.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : la route de la soie et la Chine des Han ———

const soie: Notion = {
  id: 'h6-route-soie-han',
  title: 'La route de la soie et la Chine des Han',
  hint: 'Pense aux deux empires et à ce qui circule entre eux : qui produit quoi, et depuis quand ?',
  memo: [
    'En Chine, la **dynastie** des Han règne de 202 avant J.-C. à 220 (avec une courte interruption). Son État centralisé, hérité de la dynastie Qin, s’appuie sur des **mandarins** ; la culture se diffuse mieux grâce au papier.',
    'L’empereur Wudi renforce le pouvoir impérial et agrandit le territoire : les Chinois contrôlent la **route de la soie**. Un commerce régulier relie Rome et la Chine depuis le IIe siècle avant J.-C.',
    'On échange la soie chinoise contre des verreries, des tissus et des tapis de l’empire romain. Les contacts directs sont peu nombreux : des peuples **intermédiaires** relaient les échanges.',
  ],
  faits: [
    {
      ...P.dynastie,
      q: 'Quelle dynastie règne sur la Chine de 202 avant J.-C. à 220 ?',
      a: 'les Han',
      wrong: [
        { label: 'les Carolingiens', why: 'Les Carolingiens sont une dynastie franque, celle de Charlemagne.' },
        { label: 'les Mérovingiens', why: 'Les Mérovingiens sont la dynastie franque de Clovis.' },
        {
          label: 'les Qin',
          why: 'Les Qin précèdent les Han : les Han héritent de leur État centralisé.',
        },
      ],
      gap: ['De 202 avant J.-C. à 220, la Chine est gouvernée par la dynastie des ', '.', ['Han']],
      explain: 'La dynastie des Han règne de 202 avant J.-C. à 220.',
    },
    {
      ...P.echanges,
      q: 'Quel produit chinois donne son nom à la route qui relie la Chine au monde romain ?',
      a: 'la soie',
      wrong: [
        { label: 'le blé', why: 'Le blé vient des provinces (Afrique, Égypte) pour nourrir Rome.' },
        { label: 'le verre', why: 'Les verreries viennent de l’empire romain.' },
        {
          label: 'le papier',
          why: 'Le papier aide à diffuser la culture en Chine, mais la route porte le nom de la soie.',
        },
      ],
      gap: ['La route de la ', ' relie la Chine et le monde romain.', ['soie']],
      explain: 'La soie chinoise est le produit phare des échanges : elle donne son nom à la route.',
    },
    {
      ...P.commerce,
      q: 'Depuis quand un commerce régulier existe-t-il entre Rome et la Chine ?',
      a: 'depuis le IIe siècle avant J.-C.',
      wrong: [
        { label: 'depuis le XIIIe siècle', why: 'Le XIIIe siècle est le temps de Louis IX, au Moyen Âge.' },
        { label: 'depuis 380', why: '380 est l’année de l’édit de Thessalonique.' },
        {
          label: 'depuis le IIe siècle après J.-C.',
          why: 'Attention au sens du temps : le commerce commence avant J.-C., au IIe siècle avant notre ère.',
        },
      ],
      gap: [
        'Un commerce régulier entre Rome et la Chine existe depuis le ',
        ' siècle avant J.-C.',
        ['IIe', '2e', 'IIème', '2ème', 'deuxième', 'deuxieme'],
      ],
      explain: 'Le commerce régulier entre Rome et la Chine existe depuis le IIe siècle avant J.-C.',
    },
    {
      ...P.echanges,
      q: 'Quels produits de l’empire romain sont échangés contre la soie chinoise ?',
      a: 'des verreries, des tissus et des tapis',
      wrong: [
        { label: 'du papier et de la soie', why: 'Le papier et la soie sont des produits de la Chine.' },
        { label: 'du blé d’Égypte', why: 'Le blé des provinces est envoyé vers Rome pour nourrir la plèbe.' },
        { label: 'des fauves pour les jeux', why: 'Les fauves sont transportés vers Rome pour les jeux.' },
      ],
      gap: [
        'Contre la soie chinoise, l’empire romain échange des ',
        ', des tissus et des tapis.',
        ['verreries', 'verrerie'],
      ],
      explain: 'Les échanges concernent la soie chinoise, mais aussi les verreries, tissus et tapis romains.',
    },
    {
      ...P.papier,
      q: 'Grâce à quel support la culture se diffuse-t-elle mieux dans la Chine des Han ?',
      a: 'le papier',
      wrong: [
        { label: 'la soie', why: 'La soie est le tissu précieux que la Chine exporte.' },
        { label: 'le verre', why: 'Les verreries viennent de l’empire romain.' },
        { label: 'les tapis', why: 'Les tapis font partie des produits venus de l’empire romain.' },
      ],
      gap: ['Dans la Chine des Han, la culture se diffuse mieux grâce au ', '.', ['papier']],
      explain: 'La culture chinoise est en plein essor, mieux diffusée grâce au papier.',
    },
    {
      ...P.wudi,
      q: 'Quel empereur han renforce le pouvoir impérial et assure aux Chinois le contrôle de la route de la soie ?',
      a: 'Wudi',
      wrong: [
        { label: 'Auguste', why: 'Auguste est le premier empereur romain, pas un empereur chinois.' },
        { label: 'Constantin', why: 'Constantin est un empereur romain du IVe siècle.' },
        { label: 'Trajan', why: 'Trajan est un empereur romain, le premier non italien.' },
      ],
      gap: ['L’empereur ', ' assure aux Chinois le contrôle de la route de la soie.', ['Wudi', 'Wu-Ti', 'Wu Ti']],
      explain: 'Sous Wudi, la Chine des Han s’étend et contrôle la route de la soie.',
    },
    {
      ...P.contacts,
      q: 'Comment sont les contacts directs entre l’empire romain et la Chine ?',
      a: 'peu nombreux',
      wrong: [
        { label: 'quotidiens', why: 'Les deux empires sont très éloignés : les contacts directs sont rares.' },
        { label: 'interdits par l’empereur', why: 'Aucun texte ne parle d’interdiction : le commerce existe.' },
        {
          label: 'inexistants',
          why: 'Il existe un commerce régulier et quelques contacts directs, mais ils sont peu nombreux.',
        },
      ],
      gap: ['Les contacts directs entre l’empire romain et la Chine sont peu ', '.', ['nombreux']],
      explain: 'Les contacts directs sont peu nombreux et surtout connus par des sources chinoises.',
    },
  ],
  paires3: [
    ['Les Han', 'Dynastie chinoise'],
    ['La soie', 'Produit chinois'],
    ['Les verreries', 'Produit de l’empire romain'],
  ],
  paires5: [
    ['Les Han', 'Dynastie chinoise (202 av. J.-C. - 220)'],
    ['Wudi', 'Empereur qui contrôle la route de la soie'],
    ['Le papier', 'Support qui diffuse la culture chinoise'],
    ['La soie', 'Produit chinois vendu vers l’Occident'],
    ['Auguste', 'Premier empereur romain'],
  ],
  ordre: [
    'Début de la dynastie des Han (202 av. J.-C.)',
    'Octave reçoit le nom d’Auguste (27 av. J.-C.)',
    'Édit de Caracalla (212)',
    'Fin de la dynastie des Han (220)',
  ],
  libres: [
    {
      ...P.dynastie,
      q: 'Quelle dynastie gouverne la Chine au temps de l’empereur romain Auguste ? (un nom)',
      accepted: ['Han', 'les Han', 'dynastie Han', 'la dynastie Han', 'dynastie des Han', 'la dynastie des Han'],
      traps: [
        { text: 'Qin', why: 'La dynastie Qin précède celle des Han.' },
        { text: 'Carolingiens', why: 'Les Carolingiens sont une dynastie franque, bien plus tardive.' },
      ],
      explain: 'De 202 avant J.-C. à 220, la Chine est gouvernée par les Han : Auguste est leur contemporain.',
    },
    {
      ...P.echanges,
      q: 'Quel tissu précieux la Chine fait-elle circuler vers le monde romain ? (un mot)',
      accepted: ['soie', 'la soie'],
      traps: [
        { text: 'verre', why: 'Le verre fait partie des produits venus de l’empire romain.' },
        { text: 'tapis', why: 'Les tapis viennent de l’empire romain.' },
      ],
      explain: 'C’est la soie, qui donne son nom à la route.',
    },
    {
      ...P.papier,
      q: 'Quel support permet de mieux diffuser la culture dans la Chine des Han ? (un mot)',
      accepted: ['papier', 'le papier'],
      traps: [
        { text: 'soie', why: 'La soie est le tissu échangé sur la route.' },
        { text: 'parchemin', why: 'Ce n’est pas le support cité pour la Chine des Han : c’est le papier.' },
      ],
      explain: 'La culture chinoise est mieux diffusée grâce au papier.',
    },
    {
      ...P.dynastie,
      q: 'En quelle année se termine la dynastie des Han ?',
      accepted: ['220', 'en 220'],
      traps: [
        { text: '202', why: '202 avant J.-C. est le début de la dynastie, pas sa fin.' },
        { text: '212', why: '212 est l’année de l’édit de Caracalla, dans l’empire romain.' },
      ],
      explain: 'La dynastie des Han règne de 202 avant J.-C. à 220.',
    },
  ],
  docs: [
    {
      title: 'Sur la route de la soie',
      lines: [
        'Une caravane quitte la Chine des Han, chargée de soie.',
        'Elle parcourt de très longues distances ; des marchands d’autres peuples prennent le relais.',
        'En sens inverse, des verreries, des tissus et des tapis de l’empire romain gagnent l’Orient.',
        'Rares sont les Romains qui ont rencontré un Chinois.',
      ],
      qs: [
        {
          ...P.intermediaires,
          q: 'Pourquoi Romains et Chinois se rencontrent-ils rarement ?',
          a: 'des marchands intermédiaires relaient le commerce',
          wrong: [
            { label: 'leur commerce est interdit', why: 'Le texte décrit un commerce : il n’est pas interdit.' },
            { label: 'ils n’échangent aucun produit', why: 'Relis les lignes 1 et 3 : des produits circulent.' },
          ],
          explain: 'D’autres peuples servent d’intermédiaires entre Rome et la Chine.',
        },
        {
          ...P.echanges,
          q: 'Quel produit part de la Chine ?',
          a: 'la soie',
          wrong: [
            { label: 'les verreries', why: 'Les verreries viennent de l’empire romain (ligne 3).' },
            { label: 'les tapis', why: 'Les tapis viennent de l’empire romain (ligne 3).' },
          ],
          explain: 'La caravane part de Chine chargée de soie.',
        },
      ],
    },
    {
      title: 'L’empire des Han',
      lines: [
        'De 202 avant J.-C. à 220, la dynastie des Han gouverne la Chine.',
        'L’État est centralisé : il hérite de l’organisation de la dynastie Qin.',
        'Des mandarins administrent l’empire.',
        'L’empereur Wudi agrandit le territoire et prend le contrôle de la route de la soie.',
        'Grâce au papier, la culture se diffuse mieux.',
      ],
      qs: [
        {
          ...P.etat,
          q: 'De quelle dynastie l’État centralisé des Han hérite-t-il ?',
          a: 'de la dynastie Qin',
          wrong: [
            { label: 'de l’empire romain', why: 'L’empire romain est un autre monde, très éloigné.' },
            { label: 'des cités grecques', why: 'Les cités grecques sont en Méditerranée, pas en Chine.' },
          ],
          explain: 'L’État centralisé des Han est un héritage de la dynastie Qin.',
        },
        {
          ...P.rapprochements,
          q: 'Quel point commun peut-on établir entre l’empire des Han et l’empire romain ?',
          a: 'une extension territoriale',
          wrong: [
            { label: 'une démocratie comme à Athènes', why: 'Les deux empires sont dirigés par un empereur.' },
            {
              label: 'le christianisme comme religion officielle',
              why: 'Le christianisme ne concerne pas la Chine des Han ; dans l’empire romain, il devient officiel en 380.',
            },
          ],
          explain: 'Comme Rome, la Chine des Han étend son territoire (ligne 4).',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [romanisation, chretiens, soie];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'sixième'));
