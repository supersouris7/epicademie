import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, thème 2 « Se loger, travailler, se cultiver, avoir des loisirs en France » (lot ge-cm1-02). Chaque fait cite
 * le programme du cycle 3 (registre `cycle3-2020`) avec sa citation exacte ; les textes à lire du niveau 5 sont
 * écrits pour l’exercice.
 */

const Q_THEME = 'Se loger, travailler, se cultiver, avoir des loisirs en France';
const Q_URBAIN = 'Dans des espaces urbains';
const Q_TOURISTIQUE = 'Dans un espace touristique';
const Q_ACTES =
  'Ils comprennent que les actes du quotidien s’accomplissent dans des espaces qui sont organisés selon différentes logiques et nécessitent des déplacements';
const Q_TOURIST =
  'Le travail sur un espace touristique montre par ailleurs qu’on peut habiter un lieu de façon temporaire et il permet d’observer la cohabitation de divers acteurs';
const Q_PROD = 'Ils découvrent la spécificité des espaces de production';
const Q_IDENT = 'les élèves apprennent à identifier et à caractériser des espaces et leurs fonctions';
const Q_ACCES =
  'Il faut pour cela pouvoir y accéder, le parcourir, en connaître les fonctions, le partager avec d’autres';
const Q_OUTILS =
  'En privilégiant les outils du géographe (documents cartographiques, photographies, systèmes d’information géographique)';
const Q_PRATIQUER =
  'pratiquer un lieu, pour une personne, c’est en avoir l’usage et y accomplir des actes du quotidien comme le travail, les achats, les loisirs';
const Q_HABITER =
  'habiter ne se réduit pas à résider, avoir son domicile quelque part. S’intéresser à l’habiter consiste à observer les façons dont les humains organisent et pratiquent leurs espaces de vie';

// ——— Notion 1 : espaces urbains ———

const espacesUrbains: Notion = {
  id: 'gcm1-espaces-urbains',
  title: 'Les espaces urbains',
  hint: 'Pense à une ville : à quoi servent l’école, la gare, le marché, et comment y va-t-on ?',
  memo: [
    'Un **espace urbain**, c’est la ville. On y accomplit des actes du quotidien : se loger, travailler, avoir des loisirs.',
    'Chaque lieu a une **fonction** : l’école sert à apprendre, le marché à acheter. Pour passer de l’un à l’autre, on fait des **déplacements**.',
    'Le géographe utilise des cartes, des photographies et des **systèmes d’information géographique** (des cartes sur ordinateur) pour repérer ces fonctions. Exemple : sur un plan, la gare est le lieu des départs.',
  ],
  faits: [
    {
      q: 'Que cherche-t-on à identifier dans un espace urbain, avec les outils du géographe ?',
      a: 'ses fonctions',
      wrong: [
        {
          label: 'le nom de chaque habitant',
          why: 'On étudie les espaces et ce à quoi ils servent, pas la liste des habitants.',
        },
        { label: 'son prix en euros', why: 'Le programme parle de fonctions, pas de prix.' },
        {
          label: 'la couleur des maisons',
          why: 'La couleur n’explique pas à quoi sert un espace : ce sont ses fonctions qu’on cherche.',
        },
      ],
      gap: [
        'Les élèves apprennent à identifier et à caractériser des espaces et leurs ',
        '.',
        ['fonctions', 'fonction'],
      ],
      quote: Q_IDENT,
      explain: 'Le programme demande d’identifier et de caractériser des espaces et leurs fonctions.',
    },
    {
      q: 'Pour accomplir les actes du quotidien en ville, il faut souvent…',
      a: 'se déplacer',
      wrong: [
        {
          label: 'ne jamais bouger',
          why: 'Les actes du quotidien nécessitent des déplacements : on va d’un lieu à l’autre.',
        },
        {
          label: 'tout faire au même endroit',
          why: 'Les espaces sont organisés selon différentes logiques : les lieux sont séparés.',
        },
        { label: 'quitter la ville', why: 'Les actes du quotidien se font justement dans la ville, en s’y déplaçant.' },
      ],
      gap: [
        'Les actes du quotidien s’accomplissent dans des espaces et nécessitent des ',
        '.',
        ['déplacements', 'déplacement'],
      ],
      quote: Q_ACTES,
      explain: 'Les actes du quotidien s’accomplissent dans des espaces et nécessitent des déplacements.',
    },
    {
      q: 'Quels outils aident le géographe à étudier une ville ?',
      a: 'des cartes, des photographies et des systèmes d’information géographique',
      wrong: [
        {
          label: 'des recettes de cuisine',
          why: 'Une recette ne montre pas un espace. Le géographe utilise cartes et photographies.',
        },
        { label: 'des partitions de musique', why: 'Une partition n’aide pas à localiser ni à décrire un espace.' },
        { label: 'des tickets de cinéma', why: 'Un ticket n’est pas un outil du géographe.' },
      ],
      gap: [
        'Les outils du géographe : documents ',
        ', photographies, systèmes d’information géographique.',
        ['cartographiques'],
      ],
      quote: Q_OUTILS,
      explain: 'Le programme cite : documents cartographiques, photographies, systèmes d’information géographique.',
    },
    {
      q: 'Dans un espace urbain, les actes du quotidien s’accomplissent dans des espaces organisés selon différentes…',
      a: 'logiques',
      wrong: [
        {
          label: 'saisons',
          why: 'Les saisons sont des périodes de l’année. Le programme parle de logiques d’organisation.',
        },
        { label: 'monnaies', why: 'Une monnaie sert à payer. Le programme parle de logiques d’organisation.' },
        { label: 'langues', why: 'Les langues ne décrivent pas l’organisation d’un espace.' },
      ],
      gap: ['Ces espaces sont organisés selon différentes ', '.', ['logiques', 'logique']],
      quote: Q_ACTES,
      explain: 'Les espaces sont organisés selon différentes logiques : chaque lieu a sa place et sa fonction.',
    },
  ],
  paires3: [
    ['Urbain', 'Qui concerne la ville'],
    ['Fonction', 'Ce à quoi sert un espace'],
    ['Déplacement', 'Aller d’un lieu à un autre'],
  ],
  paires5: [
    ['Urbain', 'Qui concerne la ville'],
    ['Fonction', 'Ce à quoi sert un espace'],
    ['Déplacement', 'Aller d’un lieu à un autre'],
    ['Carte', 'Un document qui montre un espace vu de dessus'],
    ['Quotidien', 'Qui se passe tous les jours'],
  ],
  libres: [
    {
      q: 'Les actes du quotidien en ville nécessitent des … (un mot : aller d’un lieu à un autre).',
      accepted: ['déplacements', 'déplacement', 'les déplacements'],
      traps: [
        { text: 'repos', why: 'Le repos est le contraire : on ne bouge pas. Le programme parle de déplacements.' },
        {
          text: 'vacances',
          why: 'Les vacances sont une période. Le mot cherché veut dire « aller d’un lieu à un autre ».',
        },
      ],
      quote: Q_ACTES,
      explain: 'Les actes du quotidien nécessitent des déplacements.',
    },
    {
      q: 'Dans un espace urbain, on cherche à identifier ses … (un mot : à quoi servent ses lieux).',
      accepted: ['fonctions', 'fonction', 'les fonctions'],
      traps: [
        { text: 'prix', why: 'Le prix n’est pas ce que le programme demande d’identifier.' },
        { text: 'couleurs', why: 'Les couleurs ne disent pas à quoi sert un lieu.' },
      ],
      quote: Q_IDENT,
      explain: 'On apprend à identifier les espaces et leurs fonctions.',
    },
    {
      q: 'Un espace où l’on se loge, travaille et a des loisirs dans une ville est un espace … (un mot).',
      accepted: ['urbain', 'urbains', 'un espace urbain'],
      traps: [
        { text: 'rural', why: 'Rural veut dire « de la campagne », pas de la ville.' },
        { text: 'touristique', why: 'Un espace touristique est étudié à part dans le programme.' },
      ],
      quote: Q_URBAIN,
      explain: 'Le programme étudie « se loger, travailler… » dans des espaces urbains.',
    },
  ],
  docs: [
    {
      title: 'Une journée en ville',
      lines: [
        'Une élève dort dans son appartement. Son école est à l’autre bout du quartier.',
        'Le mercredi, elle va au stade en bus. Le samedi, elle fait les courses au marché.',
      ],
      qs: [
        {
          q: 'Pourquoi l’élève doit-elle se déplacer ?',
          a: 'parce que l’appartement, l’école, le stade et le marché sont à des endroits différents',
          wrong: [
            {
              label: 'parce qu’elle n’aime pas rester chez elle',
              why: 'Le texte ne parle pas de ses goûts : il montre des lieux séparés.',
            },
            {
              label: 'parce que la ville n’a aucune fonction',
              why: 'Au contraire, chaque lieu a une fonction : dormir, apprendre, jouer, acheter.',
            },
          ],
          quote: Q_ACTES,
          explain:
            'Les actes du quotidien s’accomplissent dans des espaces différents : ils nécessitent des déplacements.',
        },
      ],
    },
    {
      title: 'Sur le plan de la ville',
      lines: [
        'Le plan montre une mairie, une gare, une école, un stade et un marché.',
        'Un géographe regarde le plan et note à quoi sert chaque lieu.',
      ],
      qs: [
        {
          q: 'Que fait le géographe avec ce plan ?',
          a: 'il identifie les fonctions des espaces',
          wrong: [
            { label: 'il compte les habitants', why: 'Le plan montre des lieux, pas des habitants.' },
            { label: 'il mesure la température', why: 'Un plan ne mesure pas la température : il montre des lieux.' },
          ],
          quote: Q_IDENT,
          explain: 'Noter à quoi sert chaque lieu, c’est identifier les fonctions des espaces.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : espaces touristiques ———

const espacesTouristiques: Notion = {
  id: 'gcm1-espaces-touristiques',
  title: 'Les espaces touristiques',
  hint: 'Pense à un lieu de vacances : qui y vient, qui y travaille, et pour combien de temps ?',
  memo: [
    'Un **espace touristique** accueille des visiteurs : plage, montagne, musée. Les touristes y habitent de façon **temporaire**, pas pour toujours.',
    'Dans ce lieu, plusieurs **acteurs** se croisent : les touristes, les commerçants, les habitants. C’est la **cohabitation**.',
    'Exemple : une famille loue un appartement une semaine au bord de la mer.',
  ],
  faits: [
    {
      q: 'Dans un espace touristique, on peut habiter un lieu de façon…',
      a: 'temporaire',
      wrong: [
        { label: 'éternelle', why: 'Un touriste ne reste pas pour toujours : il repart.' },
        { label: 'secrète', why: 'Le programme parle de la durée du séjour, pas de secret.' },
        { label: 'obligatoire', why: 'Le programme parle de la durée du séjour, pas d’une obligation.' },
      ],
      gap: ['On peut habiter un lieu de façon ', ' dans un espace touristique.', ['temporaire', 'temporairement']],
      quote: Q_TOURIST,
      explain: 'Un espace touristique montre qu’on peut habiter un lieu de façon temporaire.',
    },
    {
      q: 'Dans un espace touristique, on observe la cohabitation de divers…',
      a: 'acteurs',
      wrong: [
        {
          label: 'volcans',
          why: 'Un volcan est un relief. Il ne cohabite pas : le programme parle de personnes ou de groupes.',
        },
        {
          label: 'saisons',
          why: 'Les saisons se suivent. Le programme parle de personnes ou de groupes qui agissent.',
        },
        { label: 'océans', why: 'Un océan n’est pas un acteur : le programme parle de personnes ou de groupes.' },
      ],
      gap: ['Un espace touristique permet d’observer la cohabitation de divers ', '.', ['acteurs', 'acteur']],
      quote: Q_TOURIST,
      explain: 'On observe la cohabitation de divers acteurs : touristes, commerçants, habitants.',
    },
    {
      q: 'Une famille passe une semaine de vacances dans un village. Comment habite-t-elle le lieu ?',
      a: 'de façon temporaire',
      wrong: [
        { label: 'de façon permanente', why: 'Elle repart après une semaine : ce n’est pas permanent.' },
        {
          label: 'elle n’habite pas du tout le lieu',
          why: 'Le programme dit qu’on peut habiter un lieu de façon temporaire.',
        },
        { label: 'comme un maire', why: 'Le maire dirige la commune. Une famille en vacances ne la dirige pas.' },
      ],
      gap: ['Un touriste habite le lieu de façon ', ', pas pour toujours.', ['temporaire', 'temporairement']],
      quote: Q_TOURIST,
      explain: 'Le séjour est court : celui qui passe des vacances habite le lieu de façon temporaire.',
    },
    {
      q: 'Pour pratiquer un lieu touristique (une plage, un musée), il faut pouvoir…',
      a: 'y accéder',
      wrong: [
        { label: 'le déplacer', why: 'Un lieu ne se déplace pas : on s’y rend.' },
        { label: 'l’acheter', why: 'Le programme dit qu’il faut pouvoir y accéder, pas l’acheter.' },
        { label: 'le fermer', why: 'Le programme dit qu’il faut pouvoir y accéder, pas le fermer.' },
      ],
      gap: ['Pour pratiquer un lieu, il faut pouvoir y ', ', le parcourir et le partager.', ['accéder', 'acceder']],
      quote: Q_ACCES,
      explain: 'Pour pratiquer un lieu, il faut pouvoir y accéder, le parcourir, en connaître les fonctions.',
    },
  ],
  paires3: [
    ['Touriste', 'Visiteur qui séjourne un temps dans un lieu'],
    ['Acteur', 'Personne ou groupe qui agit dans un espace'],
    ['Cohabitation', 'Fait de vivre ou d’agir ensemble au même endroit'],
  ],
  paires5: [
    ['Touriste', 'Visiteur qui séjourne un temps dans un lieu'],
    ['Acteur', 'Personne ou groupe qui agit dans un espace'],
    ['Cohabitation', 'Fait de vivre ou d’agir ensemble au même endroit'],
    ['Temporaire', 'Qui ne dure pas toujours'],
    ['Accéder', 'Pouvoir arriver dans un lieu'],
  ],
  libres: [
    {
      q: 'Un touriste habite un lieu de façon … (un mot : pas pour toujours).',
      accepted: ['temporaire', 'temporairement'],
      traps: [
        { text: 'permanente', why: 'Permanent veut dire « pour toujours ». Un touriste repart.' },
        { text: 'éternelle', why: 'Éternel veut dire « sans fin ». Un touriste repart.' },
      ],
      quote: Q_TOURIST,
      explain: 'Un touriste habite le lieu de façon temporaire.',
    },
    {
      q: 'Dans un espace touristique cohabitent divers … (un mot : les personnes ou groupes qui agissent).',
      accepted: ['acteurs', 'acteur', 'les acteurs'],
      traps: [
        { text: 'paysages', why: 'Un paysage se regarde : il n’agit pas.' },
        { text: 'volcans', why: 'Un volcan est un relief, pas une personne ni un groupe.' },
      ],
      quote: Q_TOURIST,
      explain: 'On y observe la cohabitation de divers acteurs.',
    },
    {
      q: 'Un lieu où viennent des visiteurs pour la plage ou le musée est un espace … (un mot).',
      accepted: ['touristique', 'touristiques', 'un espace touristique'],
      traps: [
        { text: 'agricole', why: 'Un espace agricole sert à cultiver, pas à accueillir des visiteurs.' },
        { text: 'industriel', why: 'Un espace industriel sert à fabriquer, pas à accueillir des visiteurs.' },
      ],
      quote: Q_TOURISTIQUE,
      explain: 'Le programme étudie « se loger, travailler… » dans un espace touristique.',
    },
  ],
  docs: [
    {
      title: 'Une semaine à la mer',
      lines: [
        'Une famille loue un appartement au bord de la mer pour une semaine.',
        'Un restaurateur sert les touristes. Un pêcheur vend son poisson. Des habitants se promènent sur la plage.',
      ],
      qs: [
        {
          q: 'Que montre ce texte pour la famille ?',
          a: 'elle habite le lieu de façon temporaire',
          wrong: [
            { label: 'elle habite là toute l’année', why: 'Le texte dit qu’elle loue pour une semaine.' },
            { label: 'elle dirige le village', why: 'Le texte ne dit rien de tel : elle est en vacances.' },
          ],
          quote: Q_TOURIST,
          explain: 'Une location d’une semaine, c’est habiter un lieu de façon temporaire.',
        },
        {
          q: 'Que montre ce texte sur les personnes présentes sur la plage ?',
          a: 'la cohabitation de divers acteurs',
          wrong: [
            {
              label: 'il n’y a qu’un seul acteur',
              why: 'Le texte en cite plusieurs : touristes, restaurateur, pêcheur, habitants.',
            },
            {
              label: 'les touristes sont seuls au monde',
              why: 'Le texte montre aussi un restaurateur, un pêcheur et des habitants.',
            },
          ],
          quote: Q_TOURIST,
          explain: 'Touristes, restaurateur, pêcheur, habitants : divers acteurs cohabitent.',
        },
      ],
    },
    {
      title: 'Au musée',
      lines: ['On arrive au musée en train, en bus ou à pied.', 'Il est ouvert tous les jours.'],
      qs: [
        {
          q: 'De quoi a-t-on besoin pour pratiquer ce lieu ?',
          a: 'pouvoir y accéder',
          wrong: [
            { label: 'pouvoir le déplacer', why: 'Un musée ne se déplace pas : on s’y rend.' },
            { label: 'être seul dedans', why: 'Le programme dit qu’on partage un lieu avec d’autres.' },
          ],
          quote: Q_ACCES,
          explain: 'Train, bus, à pied : le texte parle de la façon d’y accéder.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : se loger ———

const logement: Notion = {
  id: 'gcm1-logement',
  title: 'Se loger',
  hint: 'Pense à la différence entre dormir chez toi et vivre dans ton quartier.',
  memo: [
    'Se loger, c’est avoir un **logement** : un lieu où l’on vit. Mais **habiter**, c’est plus que **résider**.',
    'Habiter, c’est aussi pratiquer les lieux autour : l’école, les magasins, les **loisirs**. Ce sont des actes du **quotidien**.',
    'Exemple : tu résides dans ton appartement, mais tu habites aussi ton quartier.',
  ],
  faits: [
    {
      q: 'Se loger, travailler, se cultiver, avoir des… Quel mot complète le titre du thème ?',
      a: 'loisirs',
      wrong: [
        { label: 'soucis', why: 'Le thème parle des actes du quotidien : les loisirs en font partie, pas les soucis.' },
        { label: 'impôts', why: 'Les impôts ne sont pas au titre de ce thème.' },
        { label: 'voyages en avion', why: 'Le titre dit « avoir des loisirs ».' },
      ],
      gap: ['Se loger, travailler, se cultiver, avoir des ', ' en France.', ['loisirs']],
      quote: Q_THEME,
      explain: 'Le thème s’intitule : se loger, travailler, se cultiver, avoir des loisirs en France.',
    },
    {
      q: 'Habiter ne se réduit pas à…',
      a: 'résider, avoir son domicile quelque part',
      wrong: [
        { label: 'voyager loin', why: 'Le programme oppose habiter à résider, pas à voyager.' },
        { label: 'pratiquer des lieux', why: 'C’est l’inverse : habiter, c’est aussi pratiquer des lieux.' },
        { label: 'observer son quartier', why: 'Observer et pratiquer ses espaces de vie fait partie d’habiter.' },
      ],
      gap: ['Habiter ne se réduit pas à ', ', avoir son domicile quelque part.', ['résider', 'resider']],
      quote: Q_HABITER,
      explain: 'Résider, c’est avoir son domicile quelque part. Habiter est plus large.',
    },
    {
      q: 'Quel est le point commun entre se loger, travailler et avoir des loisirs ?',
      a: 'ce sont des actes du quotidien',
      wrong: [
        {
          label: 'ce sont des vacances',
          why: 'Les vacances ne sont pas tous les jours : ici on parle d’actes du quotidien.',
        },
        { label: 'ce sont des métiers', why: 'Un loisir n’est pas un métier : ce sont des actes de tous les jours.' },
        { label: 'ce sont des lieux', why: 'Se loger est un acte, pas un lieu : on l’accomplit dans des lieux.' },
      ],
      gap: ['Le travail, les achats, les loisirs sont des actes du ', '.', ['quotidien']],
      quote: Q_PRATIQUER,
      explain: 'Pratiquer un lieu, c’est y accomplir des actes du quotidien.',
    },
    {
      q: 'Pour pratiquer un lieu, il faut pouvoir y accéder, le parcourir et en connaître…',
      a: 'les fonctions',
      wrong: [
        { label: 'le prix', why: 'Le programme demande d’en connaître les fonctions, pas le prix.' },
        { label: 'le nombre de fenêtres', why: 'Le nombre de fenêtres ne dit pas à quoi sert un lieu.' },
        { label: 'la date de construction', why: 'Le programme demande d’en connaître les fonctions.' },
      ],
      gap: ['Il faut en connaître les ', ' et le partager avec d’autres.', ['fonctions']],
      quote: Q_ACCES,
      explain: 'Pour pratiquer un lieu, on doit en connaître les fonctions et le partager avec d’autres.',
    },
  ],
  paires3: [
    ['Résider', 'Avoir son domicile quelque part'],
    ['Habiter', 'Organiser et pratiquer ses espaces de vie'],
    ['Loisirs', 'Activités pour se détendre'],
  ],
  paires5: [
    ['Résider', 'Avoir son domicile quelque part'],
    ['Habiter', 'Organiser et pratiquer ses espaces de vie'],
    ['Loisirs', 'Activités pour se détendre'],
    ['Quotidien', 'Qui se passe tous les jours'],
    ['Logement', 'Lieu où l’on vit et où l’on dort'],
  ],
  libres: [
    {
      q: 'Avoir son domicile quelque part, c’est … (un verbe en -er).',
      accepted: ['résider', 'resider'],
      traps: [
        { text: 'voyager', why: 'Voyager, c’est se déplacer. Le mot cherché veut dire « avoir son domicile ».' },
        {
          text: 'visiter',
          why: 'Visiter, c’est passer un moment dans un lieu. Le mot cherché veut dire « avoir son domicile ».',
        },
        {
          text: 'habiter',
          why: 'Habiter est plus large : c’est aussi pratiquer les lieux. Ici, on cherche seulement « avoir son domicile ».',
        },
      ],
      quote: Q_HABITER,
      explain: 'Résider, c’est avoir son domicile quelque part.',
    },
    {
      q: 'Se loger est un acte du … (un mot : de tous les jours).',
      accepted: ['quotidien', 'le quotidien'],
      traps: [
        {
          text: 'dimanche',
          why: 'Le dimanche n’arrive qu’une fois par semaine. Le mot cherché veut dire « de tous les jours ».',
        },
        { text: 'hasard', why: 'Le hasard n’a rien à voir : on parle des actes de tous les jours.' },
      ],
      quote: Q_PRATIQUER,
      explain: 'Se loger, travailler, avoir des loisirs : ce sont des actes du quotidien.',
    },
    {
      q: 'Habiter, c’est organiser et … ses espaces de vie (un verbe en -er).',
      accepted: ['pratiquer'],
      traps: [
        { text: 'oublier', why: 'On n’oublie pas ses espaces de vie : on les organise et on s’en sert.' },
        { text: 'vendre', why: 'Vendre n’est pas ce que dit le programme : on pratique ses espaces de vie.' },
      ],
      quote: Q_HABITER,
      explain: 'Habiter, c’est observer comment les humains organisent et pratiquent leurs espaces de vie.',
    },
  ],
  docs: [
    {
      title: 'Mon quartier',
      lines: [
        'Une élève dort dans son appartement.',
        'Le matin, elle va à l’école à pied. Le mercredi, elle joue au stade.',
      ],
      qs: [
        {
          q: 'Quel mot décrit le fait d’avoir son domicile quelque part, comme son appartement ?',
          a: 'résider',
          wrong: [
            {
              label: 'pratiquer un lieu',
              why: 'Pratiquer, c’est s’en servir pour des actes du quotidien, comme aller à l’école.',
            },
            { label: 'voyager', why: 'Voyager, c’est partir loin : elle reste dans son quartier.' },
          ],
          quote: Q_HABITER,
          explain: 'Avoir son domicile quelque part, c’est résider.',
        },
        {
          q: 'Que fait-elle en allant à l’école et au stade ?',
          a: 'elle pratique des lieux',
          wrong: [
            {
              label: 'elle réside seulement',
              why: 'Résider, c’est avoir son domicile. Aller à l’école et au stade, c’est pratiquer des lieux.',
            },
            { label: 'elle déménage', why: 'Déménager, c’est changer de domicile : le texte n’en parle pas.' },
          ],
          quote: Q_PRATIQUER,
          explain: 'École et loisirs sont des actes du quotidien : elle pratique ces lieux.',
        },
      ],
    },
    {
      title: 'Le week-end',
      lines: ['Samedi, un enfant va au cinéma avec sa famille.', 'Dimanche, il va à la piscine.'],
      qs: [
        {
          q: 'Comment appelle-t-on ces sorties dans le programme ?',
          a: 'des loisirs',
          wrong: [
            { label: 'du travail', why: 'Le cinéma et la piscine ne sont pas du travail : ce sont des loisirs.' },
            { label: 'des achats', why: 'Il ne s’agit pas d’acheter : ce sont des sorties pour se détendre.' },
          ],
          quote: Q_PRATIQUER,
          explain: 'Le programme cite : le travail, les achats, les loisirs. Cinéma et piscine sont des loisirs.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : travailler ———

const travail: Notion = {
  id: 'gcm1-travail',
  title: 'Travailler',
  hint: 'Pense à un métier : où se fait-il, et que produit-on ?',
  memo: [
    'Travailler est un acte du **quotidien** : on le fait dans des lieux précis. Pour y aller, on fait un **déplacement**.',
    'Certains lieux sont des **espaces de production** : on y fabrique ou on y cultive. Exemple : un fournil où l’on fait le pain.',
    'Le géographe repère la **fonction** de chaque lieu avec des cartes et des photographies.',
  ],
  faits: [
    {
      q: 'Les élèves découvrent la spécificité des espaces de…',
      a: 'production',
      wrong: [
        { label: 'vacances', why: 'Les vacances sont liées aux espaces touristiques, pas aux espaces de production.' },
        { label: 'repos', why: 'Un espace de production sert à produire, pas à se reposer.' },
        { label: 'fête', why: 'Le programme parle d’espaces de production.' },
      ],
      gap: ['Ils découvrent la spécificité des espaces de ', '.', ['production']],
      quote: Q_PROD,
      explain: 'Le programme cite les espaces de production, où l’on travaille pour fabriquer ou cultiver.',
    },
    {
      q: 'Parmi les actes du quotidien cités par le programme, lequel parle du métier ?',
      a: 'le travail',
      wrong: [
        { label: 'les achats', why: 'Les achats, c’est acheter. Le métier, c’est le travail.' },
        { label: 'les loisirs', why: 'Les loisirs servent à se détendre. Le métier, c’est le travail.' },
        { label: 'le paysage', why: 'Le paysage est ce qu’on voit : ce n’est pas un acte.' },
      ],
      gap: [
        'Pratiquer un lieu, c’est y faire des actes du quotidien comme le ',
        ', les achats, les loisirs.',
        ['travail'],
      ],
      quote: Q_PRATIQUER,
      explain: 'Le programme cite : le travail, les achats, les loisirs.',
    },
    {
      q: 'Pour aller travailler, on a souvent besoin de…',
      a: 'se déplacer',
      wrong: [
        { label: 'ne plus bouger', why: 'Les actes du quotidien nécessitent des déplacements.' },
        {
          label: 'changer de pays',
          why: 'Le programme parle de déplacements du quotidien d’un lieu à un autre, pas de changer de pays.',
        },
        { label: 'dormir sur place', why: 'Le programme parle de déplacements pour accomplir les actes du quotidien.' },
      ],
      gap: ['Les actes du quotidien, comme le travail, nécessitent des ', '.', ['déplacements', 'déplacement']],
      quote: Q_ACTES,
      explain: 'Les actes du quotidien, dont le travail, nécessitent des déplacements.',
    },
    {
      q: 'Quels outils aident à repérer les lieux de travail sur un territoire ?',
      a: 'des cartes et des photographies',
      wrong: [
        { label: 'des chansons', why: 'Une chanson ne montre pas un espace.' },
        { label: 'des recettes', why: 'Une recette ne montre pas un espace.' },
        { label: 'des horoscopes', why: 'Un horoscope ne montre pas un espace.' },
      ],
      gap: [
        'Les outils du géographe : documents cartographiques, ',
        ', systèmes d’information géographique.',
        ['photographies', 'photos'],
      ],
      quote: Q_OUTILS,
      explain: 'Le géographe utilise des documents cartographiques et des photographies.',
    },
  ],
  paires3: [
    ['Travail', 'Un acte du quotidien fait dans un lieu'],
    ['Production', 'Fabriquer ou cultiver pour fournir des biens'],
    ['Déplacement', 'Aller d’un lieu à un autre'],
  ],
  paires5: [
    ['Travail', 'Un acte du quotidien fait dans un lieu'],
    ['Production', 'Fabriquer ou cultiver pour fournir des biens'],
    ['Déplacement', 'Aller d’un lieu à un autre'],
    ['Fonction', 'Ce à quoi sert un espace'],
    ['Acteur', 'Personne ou groupe qui agit dans un espace'],
  ],
  libres: [
    {
      q: 'Le travail, les achats et les loisirs sont des actes du … (un mot : de tous les jours).',
      accepted: ['quotidien', 'le quotidien'],
      traps: [
        { text: 'hasard', why: 'Le hasard n’a rien à voir : on parle des actes de tous les jours.' },
        {
          text: 'dimanche',
          why: 'Le dimanche n’arrive qu’une fois par semaine. Le mot cherché veut dire « de tous les jours ».',
        },
      ],
      quote: Q_PRATIQUER,
      explain: 'Le travail est un acte du quotidien.',
    },
    {
      q: 'Un espace où l’on fabrique ou cultive est un espace de … (un mot).',
      accepted: ['production', 'la production'],
      traps: [
        { text: 'vacances', why: 'Les vacances sont liées aux espaces touristiques.' },
        { text: 'repos', why: 'On ne se repose pas dans un espace de production : on y fabrique ou on y cultive.' },
      ],
      quote: Q_PROD,
      explain: 'Le programme cite la spécificité des espaces de production.',
    },
    {
      q: 'Pour aller travailler, on fait un … (un mot : aller d’un lieu à un autre).',
      accepted: ['déplacement', 'deplacement', 'un déplacement'],
      traps: [
        { text: 'sommeil', why: 'Le sommeil, c’est dormir. Le mot cherché veut dire « aller d’un lieu à un autre ».' },
        {
          text: 'repos',
          why: 'Le repos, c’est ne pas bouger. Le mot cherché veut dire « aller d’un lieu à un autre ».',
        },
      ],
      quote: Q_ACTES,
      explain: 'Aller travailler nécessite un déplacement.',
    },
  ],
  docs: [
    {
      title: 'Une boulangerie',
      lines: [
        'Un boulanger se lève à quatre heures. Il fabrique le pain dans son fournil.',
        'Puis il le vend dans sa boutique. Les clients viennent à pied.',
      ],
      qs: [
        {
          q: 'Quelle est la fonction du fournil ?',
          a: 'fabriquer le pain',
          wrong: [
            { label: 'vendre aux clients', why: 'On vend dans la boutique. Le fournil sert à fabriquer.' },
            { label: 'loger les clients', why: 'Les clients viennent à pied acheter : ils ne logent pas au fournil.' },
          ],
          quote: Q_IDENT,
          explain: 'Le fournil a pour fonction de fabriquer le pain : c’est un lieu de production.',
        },
      ],
    },
    {
      title: 'Le trajet du matin',
      lines: [
        'Une infirmière habite à la campagne.',
        'Chaque matin, elle prend sa voiture pour aller travailler à l’hôpital de la ville.',
      ],
      qs: [
        {
          q: 'Que montre ce texte ?',
          a: 'qu’on doit se déplacer pour aller travailler',
          wrong: [
            { label: 'qu’on travaille toujours chez soi', why: 'Le texte montre le contraire : elle va à l’hôpital.' },
            { label: 'qu’on ne se déplace jamais', why: 'Elle prend sa voiture chaque matin.' },
          ],
          quote: Q_ACTES,
          explain: 'Le lieu de travail est loin du logement : les actes du quotidien nécessitent des déplacements.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [espacesUrbains, espacesTouristiques, logement, travail];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
