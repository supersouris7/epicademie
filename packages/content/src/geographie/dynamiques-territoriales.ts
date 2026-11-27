import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Troisième, thème 1 « Dynamiques territoriales de la France contemporaine » (lot ge-3e-01) : aires urbaines, espaces
 * productifs, espaces de faible densité, vocabulaire. Chaque fait cite une source du registre avec sa citation exacte :
 * programme du cycle 4, INSEE et glossaire de Géoconfluences (ENS de Lyon, DGESCO). Le programme dit « aires
 * urbaines » ; l’INSEE les a remplacées en 2020 par les « aires d’attraction des villes » : la notion l’explique. Les
 * textes à lire du niveau 5 sont écrits pour l’exercice (lieux fictifs).
 */

const AIRE_ATTRACTION = 'insee-aire-attraction';
const AIRE_URBAINE = 'insee-aire-urbaine';
const UNITE_URBAINE = 'insee-unite-urbaine';
const BANLIEUE = 'insee-banlieue';
const RURAL_INSEE = 'insee-territoires-ruraux';
const PERIURB = 'geoconfluences-periurbanisation';
const AGGLO = 'geoconfluences-agglomeration';
const ZONAGE = 'geoconfluences-aires-attraction';
const PENDULAIRE = 'geoconfluences-mobilite-pendulaire';
const METROPOLISATION = 'geoconfluences-metropolisation';
const METROPOLE = 'geoconfluences-metropole';
const PRODUCTIF = 'geoconfluences-espace-productif';
const SECTEURS = 'geoconfluences-secteurs-productifs';
const DESINDUS = 'geoconfluences-desindustrialisation';
const RECONVERSION = 'geoconfluences-reconversion';
const FRICHE = 'geoconfluences-friche';
const TECHNOPOLE = 'geoconfluences-technopole';
const COMPETITIVITE = 'geoconfluences-pole-de-competitivite';
const AGRO = 'geoconfluences-agroalimentaire';
const INDUS_TOURISME = 'geoconfluences-industrie-touristique';
const CBD = 'geoconfluences-cbd';
const DIAGONALE = 'geoconfluences-diagonale-faibles-densites';
const DEPRISE = 'geoconfluences-deprise';
const RENAISSANCE = 'geoconfluences-renaissance-rurale';
const NEORURAUX = 'geoconfluences-neoruraux';
const MONTAGNE = 'geoconfluences-montagne';
const MULTI = 'geoconfluences-multifonctionnalite';
const AGRITOURISME = 'geoconfluences-agritourisme';
const PRESENTIELLE = 'geoconfluences-economie-presentielle';

// Programme du cycle 4, géographie, classe de 3e, thème 1.
const P_DIVERSITE =
  'La géographie des aires urbaines permet de sensibiliser les élèves à la diversité des espaces (centraux, péricentraux, périurbains, suburbains) concernés par l’urbanisation et aux relations entre les aires d’influences urbaines';
const P_MONDIALISEE = 'Les aires urbaines, une nouvelle géographie d’une France mondialisée';
const P_MUTATIONS =
  'Les mutations des espaces productifs, à dominante industrielle, agricole, touristique ou d’affaires, sont abordées en lien avec l’urbanisation et la mondialisation qui en redessinent la géographie';
const P_FAIBLE =
  'Les espaces de faible densité (espaces ruraux, montagnes, secteurs touristiques peu urbanisés) sont abordés sous l’angle de la diversité de leurs dynamiques et de leurs atouts';
const P_ATOUTS =
  'Ce ne sont pas seulement des marges délaissées et des espaces sans ressources productives via notamment les activités agricoles, touristiques ou liées à l’accueil de nouveaux types d’habitants';

// INSEE.
const I_AIRE =
  'Une aire est un ensemble de communes, d’un seul tenant et sans enclave, constitué d’un pôle de population et d’emploi, et d’une couronne qui regroupe les communes dont au moins 15 % des actifs occupés travaillent dans le pôle';
const I_COMMUNE_CENTRE = 'La commune la plus peuplée du pôle est appelée commune-centre';
const I_REMPLACE =
  'Le zonage en aires d’attraction des villes (AAV) 2020 se substitue au zonage en aires urbaines (ZAU) de 2010';
const I_ANCIENNE = 'au moins 40 % de la population résidente ayant un emploi travaille dans le pôle';
const I_UNITE =
  'une commune ou un ensemble de communes présentant une zone de bâti continu (pas de coupure de plus de 200 mètres entre deux constructions) qui compte au moins 2 000 habitants';
const I_200 = 'pas de coupure de plus de 200 mètres entre deux constructions';
const I_BANLIEUE = 'Les communes qui ne sont pas villes-centres constituent la banlieue de l’unité urbaine';
const I_TOURISME = 'Le tourisme est très présent dans le rural';
const I_ACTIVITES = 'Les secteurs d’activité agricole et industrielle sont des marqueurs forts du rural';
const I_ARTIFICIEL =
  'Faiblement artificialisés et relativement peu peuplés, les espaces ruraux ne sont pas pour autant des espaces naturels';

// Géoconfluences : aires urbaines.
const G_PERIURB =
  'La périurbanisation correspond à l’extension des surfaces artificialisées en périphéries des agglomérations urbaines';
const G_AUTO = 'avec la démocratisation de l’automobile, et l’attrait du logement individuel';
const G_PERI_ESPACE = 'un espace de transition entre l’agglomération et l’espace rural : c’est l’espace périurbain';
const G_PENDULAIRE =
  'La mobilité pendulaire, ou mobilité alternante, désigne les navettes quotidiennes domicile-travail';
const G_ETRANGER = 'faire apparaitre l’influence des grandes villes étrangères frontalières en France';
const G_METROPOLISATION =
  'La métropolisation désigne le processus de concentration de populations, d’activités, de valeur dans des villes de grande taille';
const G_METROPOLE =
  'qui exerce des fonctions de commandement, d’organisation et d’impulsion sur une région et qui permet son intégration avec le reste du monde';

// Géoconfluences : espaces productifs.
const G_PRODUCTIF =
  'L’espace productif est la dimension spatiale du système productif, c’est-à-dire d’un ensemble d’activités productives fonctionnant en système';
const G_SECTEURS = 'les géographes préfèrent parler aujourd’hui de systèmes productifs ou d’espaces productifs';
const G_DESINDUS =
  'La désindustrialisation peut désigner la destruction d’emploi industriel ou le recul de l’activité manufacturière';
const G_OUVERTURE = 'une conséquence de l’ouverture des échanges mondiaux';
const G_RECONVERSION =
  'La conversion ou la reconversion est la transformation des activités d’un territoire en vue de son adaptation à un nouvel environnement';
const G_FRICHE = 'Les friches sont des terrains qui ont perdu leur fonction, leur vocation';
const G_TECHNOPOLE =
  'réunit, sur un site le plus souvent périurbain ou suburbain, des activités qui ont en commun de recourir à des technologies innovantes';
const G_COMPETITIVITE = 'un réseau d’entreprises, d’unités de recherche et de formation, et d’organismes publics';
const G_AMONT =
  'En amont, on trouve principalement des services (banque, assurance, mécanique, soins vétérinaires…) mais aussi des industries (engrais, produits phytosanitaires) et d’autres productions agricoles transformés (granulés pour le bétail, semences…)';
const G_AVAL =
  'Les activités d’aval comprennent la transformation et le conditionnement (conserveries…), la logistique et la commercialisation';
const G_TOURISTIQUE =
  'L’industrie touristique désigne l’ensemble de productions et de services destinés à répondre aux attentes du touriste';
const G_CBD = 'un espace où se concentrent des activités à très forte valeur ajoutée financière';

// Géoconfluences : espaces de faible densité.
const G_DIAGONALE = 'formant une bande traversant le pays du Nord-Est au Sud-Ouest';
const G_VIDE =
  'l’expression « diagonale du vide », qui a connu une grande fortune dans la géographie scolaire, est aujourd’hui abandonnée par les géographes';
const G_AILLEURS = 'on trouve aussi des territoires de faible densité ailleurs que dans ladite diagonale';
const G_DEPRISE = 'La déprise agricole signifie le recul des superficies cultivées';
const G_PAYSAGES = 'Les friches, agricoles ou urbaines, sont les paysages caractéristiques de la déprise';
const G_RENAISSANCE = 'le processus de repeuplement des espaces ruraux';
const G_NEORURAUX =
  'Les néoruraux désignent les nouveaux habitants des communes rurales, originaires de communes urbaines';
const G_MONTAGNE =
  'La contrainte s’exprime par le relief mais également par les particularités climatiques de la montagne';
const G_MULTI = 'La multifonctionnalité se dit d’un espace dans lequel différentes fonctions se côtoient';
const G_AGRITOURISME =
  'L’agritourisme (parfois agrotourisme) est l’exercice d’au moins une activité touristique ou de loisirs au sein d’une exploitation agricole';
const G_PRESENTIELLE =
  'la production de biens et de services pour les personnes présentes dans un territoire donné, qu’elles soient résidentes ou non';

const CLASSE = '3e';

// ——— Notion 1 : les aires urbaines ———

const airesUrbaines: Notion = {
  classe: CLASSE,
  id: 'g3-aires-urbaines',
  title: 'Les aires urbaines, géographie d’une France mondialisée',
  hint: 'Pense à la ville qui attire, à ce qui l’entoure et aux déplacements entre les deux.',
  memo: [
    'Une **aire urbaine** réunit un **pôle** (ville et banlieue, riches en emplois) et sa **couronne**, d’où des habitants viennent travailler. Depuis 2020, l’INSEE parle d’**aire d’attraction** des villes.',
    'La **périurbanisation** et les **mobilités pendulaires** étendent ces aires ; la **métropolisation** y concentre habitants, activités et richesses. Au brevet, distingue toujours centre, banlieue et couronne.',
  ],
  faits: [
    {
      q: 'Selon le programme, quels espaces concernés par l’urbanisation la géographie des aires urbaines montre-t-elle ?',
      a: 'des espaces centraux, péricentraux, périurbains et suburbains',
      wrong: [
        { label: 'uniquement les centres des villes', why: 'L’urbanisation touche aussi les périphéries des villes.' },
        {
          label: 'des espaces polaires et désertiques',
          why: 'Ces milieux ne sont pas ceux que l’urbanisation des villes décrit ici.',
        },
        {
          label: 'uniquement des espaces agricoles éloignés de toute ville',
          why: 'Les aires urbaines partent des villes et de leur influence.',
        },
      ],
      gap: [
        'La géographie des aires urbaines montre la diversité des espaces centraux, péricentraux, ',
        ' et suburbains.',
        ['périurbains', 'periurbains'],
      ],
      choix: ['périurbains', 'polaires', 'maritimes'],
      quote: P_DIVERSITE,
      explain: 'L’urbanisation ne concerne pas que le centre : elle gagne plusieurs types d’espaces.',
    },
    {
      q: 'Aujourd’hui, quel zonage de l’INSEE remplace les aires urbaines ?',
      a: 'les aires d’attraction des villes',
      wrong: [
        {
          label: 'les régions administratives',
          why: 'Les régions sont un découpage administratif, pas un zonage autour des villes.',
        },
        {
          label: 'les parcs naturels régionaux',
          why: 'Un parc naturel protège un territoire : il ne mesure pas l’influence d’une ville.',
        },
        {
          label: 'les unités urbaines',
          why: 'Les unités urbaines reposent sur la continuité du bâti et existaient déjà à côté des aires urbaines.',
        },
      ],
      gap: ['Depuis 2020, les aires urbaines sont remplacées par les aires d’', ' des villes.', ['attraction']],
      choix: ['attraction', 'habitation', 'administration'],
      quote: I_REMPLACE,
      explain: 'Le programme dit « aires urbaines » ; l’INSEE utilise depuis 2020 les aires d’attraction des villes.',
      src: AIRE_ATTRACTION,
    },
    {
      q: 'De quoi une aire d’attraction d’une ville est-elle composée ?',
      a: 'd’un pôle de population et d’emploi, et d’une couronne',
      wrong: [
        {
          label: 'd’un massif montagneux et de ses vallées',
          why: 'Ce découpage décrit un relief, pas l’influence d’une ville.',
        },
        {
          label: 'd’une région et de ses départements',
          why: 'C’est un découpage administratif, sans lien avec les trajets vers l’emploi.',
        },
        {
          label: 'uniquement de la commune la plus peuplée',
          why: 'La commune-centre n’est qu’une partie du pôle ; la couronne en fait aussi partie.',
        },
      ],
      gap: [
        'Une aire d’attraction associe un pôle et une ',
        ' dont des actifs viennent travailler dans le pôle.',
        ['couronne'],
      ],
      choix: ['couronne', 'frontière', 'montagne'],
      quote: I_AIRE,
      explain: 'Le pôle offre des habitants et des emplois ; la couronne regroupe les communes qui dépendent de lui.',
      src: AIRE_ATTRACTION,
    },
    {
      q: 'Quelle part des actifs d’une commune doit travailler dans le pôle pour qu’elle soit dans la couronne (zonage de 2020) ?',
      a: 'au moins 15 %',
      wrong: [
        { label: 'au moins 40 %', why: '40 % était le seuil de l’ancien zonage en aires urbaines.' },
        { label: 'au moins 90 %', why: 'Le seuil est bien plus bas : une partie des actifs suffit.' },
        { label: 'au moins 1 %', why: 'Un seuil aussi bas rattacherait presque toutes les communes.' },
      ],
      gap: ['La couronne regroupe les communes dont au moins ', ' % des actifs travaillent dans le pôle.', ['15']],
      quote: I_AIRE,
      explain:
        'Le critère de 2020 est de 15 % des actifs occupés ; il était de 40 % avec les anciennes aires urbaines.',
      src: AIRE_ATTRACTION,
    },
    {
      q: 'Comment appelle-t-on la commune la plus peuplée du pôle ?',
      a: 'la commune-centre',
      wrong: [
        { label: 'la couronne', why: 'La couronne est l’ensemble des communes autour du pôle.' },
        { label: 'la banlieue', why: 'La banlieue désigne les communes du pôle qui entourent la ville-centre.' },
        { label: 'la commune périurbaine', why: 'L’espace périurbain est au-delà de l’agglomération.' },
      ],
      gap: ['La commune la plus peuplée du pôle est la commune-', '.', ['centre']],
      choix: ['centre', 'couronne', 'frontière'],
      quote: I_COMMUNE_CENTRE,
      explain: 'Le pôle est dirigé par sa commune la plus peuplée : la commune-centre.',
      src: AIRE_ATTRACTION,
    },
    {
      q: 'Comment appelle-t-on les navettes quotidiennes entre le domicile et le travail ?',
      a: 'les mobilités pendulaires',
      wrong: [
        {
          label: 'les migrations internationales',
          why: 'Une migration implique de changer de domicile, souvent de pays.',
        },
        { label: 'l’exode rural', why: 'L’exode rural est un départ durable des campagnes vers les villes.' },
        { label: 'le tourisme', why: 'Le tourisme est un séjour hors des lieux du quotidien.' },
      ],
      gap: ['Les trajets quotidiens domicile-travail sont des mobilités ', '.', ['pendulaires']],
      choix: ['pendulaires', 'touristiques', 'définitives'],
      quote: G_PENDULAIRE,
      explain: 'Comme un pendule, le navetteur fait l’aller-retour chaque jour : ces trajets relient couronne et pôle.',
      src: PENDULAIRE,
    },
    {
      q: 'Comment appelle-t-on l’extension des surfaces bâties et des routes autour des agglomérations ?',
      a: 'la périurbanisation',
      wrong: [
        {
          label: 'la métropolisation',
          why: 'Elle désigne la concentration dans les grandes villes, pas l’étalement en périphérie.',
        },
        { label: 'la désindustrialisation', why: 'Elle désigne le recul de l’industrie.' },
        {
          label: 'la déprise agricole',
          why: 'La déprise est un recul des surfaces cultivées, pas une extension de la ville.',
        },
      ],
      gap: ['La ', ' étend les surfaces artificialisées autour des agglomérations.', ['périurbanisation']],
      choix: ['périurbanisation', 'métropolisation', 'désindustrialisation'],
      quote: G_PERIURB,
      explain: 'Maisons, routes et parkings gagnent les périphéries : c’est la périurbanisation.',
      src: PERIURB,
    },
    {
      q: 'Qu’est-ce qui a favorisé la périurbanisation dans la seconde moitié du XXe siècle ?',
      a: 'la diffusion de la voiture et l’attrait de la maison individuelle',
      wrong: [
        {
          label: 'la disparition de l’automobile',
          why: 'C’est l’inverse : la voiture s’est diffusée et permet d’habiter plus loin.',
        },
        {
          label: 'le retour de tous les emplois dans les campagnes',
          why: 'Beaucoup de périurbains travaillent toujours en ville.',
        },
        {
          label: 'l’interdiction de construire hors des centres',
          why: 'Les périphéries se sont au contraire beaucoup construites.',
        },
      ],
      gap: [
        'La périurbanisation s’accélère avec la démocratisation de l’',
        ' et l’attrait de la maison individuelle.',
        ['automobile', 'auto'],
      ],
      choix: ['automobile', 'avion', 'agriculture'],
      quote: G_AUTO,
      explain: 'La voiture permet de parcourir chaque jour la distance entre un pavillon éloigné et l’emploi.',
      src: PERIURB,
    },
    {
      q: 'Comment appelle-t-on la concentration des populations, des activités et de la valeur dans les grandes villes ?',
      a: 'la métropolisation',
      wrong: [
        { label: 'la périurbanisation', why: 'La périurbanisation décrit l’étalement autour des agglomérations.' },
        { label: 'la renaissance rurale', why: 'C’est le repeuplement des campagnes.' },
        { label: 'la reconversion', why: 'La reconversion transforme les activités d’un territoire.' },
      ],
      gap: ['La ', ' concentre populations et richesses dans les plus grandes villes.', ['métropolisation']],
      choix: ['métropolisation', 'reconversion', 'déprise'],
      quote: G_METROPOLISATION,
      explain: 'Dans une France mondialisée, les métropoles attirent habitants, emplois et richesses.',
      src: METROPOLISATION,
    },
  ],
  paires3: [
    ['pôle', 'lieu de population et d’emploi'],
    ['couronne', 'communes autour du pôle, d’où des actifs viennent y travailler'],
    ['mobilité pendulaire', 'aller-retour quotidien domicile-travail'],
  ],
  paires5: [
    ['commune-centre', 'commune la plus peuplée du pôle'],
    ['banlieue', 'communes de l’unité urbaine autour de la ville-centre'],
    ['espace périurbain', 'transition entre l’agglomération et l’espace rural'],
    ['périurbanisation', 'extension des surfaces artificialisées autour des agglomérations'],
    ['métropolisation', 'concentration des activités dans les grandes villes'],
  ],
  libres: [
    {
      q: 'quel nom l’INSEE donne-t-il à un ensemble de communes au bâti continu comptant au moins 2 000 habitants ?',
      accepted: [
        'unité urbaine',
        'unite urbaine',
        'une unité urbaine',
        'l’unité urbaine',
        'agglomération',
        'agglomeration',
      ],
      traps: [
        { text: 'aire urbaine', why: 'L’aire urbaine ajoutait la couronne, définie par les trajets domicile-travail.' },
        { text: 'couronne', why: 'La couronne regroupe les communes autour du pôle.' },
      ],
      quote: I_UNITE,
      explain:
        'L’unité urbaine repose sur le bâti continu (pas plus de 200 mètres entre deux constructions) et sur 2 000 habitants.',
      src: UNITE_URBAINE,
    },
    {
      q: 'comment appelle-t-on l’espace de transition situé entre l’agglomération et l’espace rural ?',
      accepted: [
        'périurbain',
        'espace périurbain',
        'l’espace périurbain',
        'le périurbain',
        'periurbain',
        'espace periurbain',
        'couronne périurbaine',
      ],
      traps: [
        { text: 'banlieue', why: 'La banlieue fait partie de l’agglomération ; l’espace cherché est au-delà.' },
        { text: 'ville-centre', why: 'La ville-centre est au cœur de l’agglomération.' },
      ],
      quote: G_PERI_ESPACE,
      explain: 'L’étalement urbain et la périurbanisation créent cet espace entre la ville et la campagne.',
      src: AGGLO,
    },
    {
      q: 'comment appelle-t-on la commune la plus peuplée du pôle d’une aire d’attraction ?',
      accepted: [
        'commune-centre',
        'commune centre',
        'la commune-centre',
        'ville-centre',
        'ville centre',
        'la ville-centre',
      ],
      traps: [
        { text: 'banlieue', why: 'La banlieue entoure la commune principale : ce n’est pas elle.' },
        { text: 'couronne', why: 'La couronne regroupe les communes autour du pôle.' },
      ],
      quote: I_COMMUNE_CENTRE,
      explain: 'La commune la plus peuplée du pôle est la commune-centre.',
      src: AIRE_ATTRACTION,
    },
  ],
  docs: [
    {
      title: 'La famille de Valmer',
      lines: [
        'Lina habite Sainte-Aube, un village à 25 km de Valmer.',
        'Valmer concentre les emplois, avec sa banlieue.',
        'Chaque matin, ses parents partent travailler à Valmer et rentrent le soir.',
        'Autour de Sainte-Aube, de nouvelles maisons remplacent des champs.',
      ],
      qs: [
        {
          q: 'Dans quelle partie de l’aire de Valmer le village de Sainte-Aube se situe-t-il le plus probablement ?',
          a: 'dans la couronne',
          wrong: [
            {
              label: 'dans la ville-centre',
              why: 'Sainte-Aube est à 25 km de Valmer : ce n’est pas la commune principale.',
            },
            {
              label: 'hors de toute influence de Valmer',
              why: 'Les parents travaillent à Valmer : le village est sous son influence.',
            },
          ],
          quote: I_AIRE,
          explain:
            'Un village dont des actifs travaillent dans le pôle, au-delà d’un certain seuil, appartient à sa couronne.',
          src: AIRE_ATTRACTION,
        },
        {
          q: 'Quel nom donne-t-on aux trajets des parents de Lina ?',
          a: 'des mobilités pendulaires',
          wrong: [
            { label: 'des migrations internationales', why: 'Ils ne changent ni de domicile ni de pays.' },
            {
              label: 'des séjours touristiques',
              why: 'Ils font un trajet de travail quotidien, pas un séjour de loisir.',
            },
          ],
          quote: G_PENDULAIRE,
          explain: 'Aller et retour chaque jour entre domicile et travail : c’est la définition.',
          src: PENDULAIRE,
        },
        {
          q: 'Quel processus montrent les nouvelles maisons construites sur des champs autour du village ?',
          a: 'la périurbanisation',
          wrong: [
            {
              label: 'la déprise agricole liée à l’exode',
              why: 'La population ne s’en va pas : des maisons et des habitants arrivent.',
            },
            { label: 'la désindustrialisation', why: 'Le texte ne parle pas d’usines qui ferment.' },
          ],
          quote: G_PERIURB,
          explain: 'De nouvelles surfaces sont artificialisées en périphérie de l’agglomération.',
          src: PERIURB,
        },
      ],
    },
    {
      title: 'Une ville, deux époques',
      lines: [
        'En 1975, la ville fictive de Brancy forme une agglomération entourée de champs.',
        'Aujourd’hui, des lotissements s’égrènent loin du centre, le long des routes.',
        'Leurs habitants travaillent surtout à Brancy et utilisent leur voiture.',
        'Le centre de Brancy rassemble des sièges d’entreprises et une université.',
      ],
      qs: [
        {
          q: 'Entre les deux époques, quelle évolution le texte montre-t-il ?',
          a: 'l’étalement de la ville en périphérie',
          wrong: [
            {
              label: 'le recul de l’influence de Brancy',
              why: 'Les habitants des lotissements travaillent toujours à Brancy.',
            },
            {
              label: 'la disparition de l’agglomération',
              why: 'L’agglomération reste : la ville s’étend autour d’elle.',
            },
          ],
          quote: G_PERIURB,
          explain: 'Des lotissements éloignés du centre montrent que les surfaces bâties s’étendent en périphérie.',
          src: PERIURB,
        },
        {
          q: 'Pourquoi les habitants des lotissements restent-ils liés à Brancy ?',
          a: 'ils y travaillent et s’y rendent chaque jour',
          wrong: [
            { label: 'ils dorment au centre de Brancy', why: 'Ils habitent les lotissements, loin du centre.' },
            {
              label: 'ils cultivent les champs autour de Brancy',
              why: 'Le texte dit qu’ils travaillent surtout à Brancy.',
            },
          ],
          quote: I_AIRE,
          explain: 'Le travail dans le pôle est le critère qui relie une commune à une ville.',
          src: AIRE_ATTRACTION,
        },
        {
          q: 'Quel processus le centre de Brancy, avec ses sièges et son université, illustre-t-il ?',
          a: 'la concentration des activités dans la grande ville',
          wrong: [
            {
              label: 'la déprise du centre',
              why: 'Un centre qui rassemble entreprises et université n’est pas en recul.',
            },
            { label: 'le repeuplement des campagnes', why: 'Le centre de Brancy n’est pas une campagne.' },
          ],
          quote: G_METROPOLISATION,
          explain: 'La métropolisation concentre les activités à forte valeur dans les grandes villes.',
          src: METROPOLISATION,
        },
      ],
    },
    {
      title: 'Une ville près de la frontière',
      lines: [
        'La ville fictive de Rochemont est située en France, près de la frontière.',
        'Des habitants de ses environs vont travailler dans une grande ville du pays voisin.',
        'Un aéroport et des trains rapides relient la métropole de Rochemont à d’autres métropoles.',
        'Elle accueille des services de haut niveau qui rayonnent sur sa région.',
      ],
      qs: [
        {
          q: 'Que montrent les trajets vers la ville du pays voisin ?',
          a: 'une ville étrangère peut exercer son influence sur des communes françaises',
          wrong: [
            {
              label: 'l’influence d’une ville s’arrête toujours à la frontière',
              why: 'Les actifs franchissent justement la frontière.',
            },
            {
              label: 'ces habitants ont tous changé de pays de résidence',
              why: 'Ils habitent les environs de Rochemont et vont seulement y travailler.',
            },
          ],
          quote: G_ETRANGER,
          explain: 'Dans une France mondialisée, les aires d’influence peuvent traverser les frontières.',
          src: ZONAGE,
        },
        {
          q: 'Quel rôle de métropole les services de haut niveau et les liaisons de Rochemont illustrent-ils ?',
          a: 'commander une région et la relier au reste du monde',
          wrong: [
            { label: 'isoler la région des échanges', why: 'L’aéroport et les trains relient au contraire la région.' },
            { label: 'se limiter à l’agriculture locale', why: 'Une métropole concentre des services de haut niveau.' },
          ],
          quote: G_METROPOLE,
          explain: 'Une métropole anime sa région et l’intègre au monde.',
          src: METROPOLE,
        },
        {
          q: 'Selon le programme, de quoi cette géographie des aires urbaines est-elle le signe ?',
          a: 'd’une France mondialisée',
          wrong: [
            {
              label: 'd’une France sans lien avec le monde',
              why: 'Les liaisons internationales de Rochemont montrent l’inverse.',
            },
            { label: 'd’une France sans villes', why: 'Le sujet porte justement sur les aires urbaines.' },
          ],
          quote: P_MONDIALISEE,
          explain: 'Le programme associe les aires urbaines à la mondialisation de la France.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : les espaces productifs ———

const espacesProductifs: Notion = {
  classe: CLASSE,
  id: 'g3-espaces-productifs',
  title: 'Les espaces productifs et leurs évolutions',
  hint: 'Demande-toi ce qu’on y produit (usines, champs, tourisme, bureaux) et ce qui change.',
  memo: [
    'Un **espace productif** est un lieu organisé pour produire : industrie, agriculture, tourisme ou affaires. L’urbanisation et la **mondialisation** en redessinent la géographie.',
    'La **désindustrialisation** fait reculer des activités ; la **reconversion** en développe d’autres, par exemple sur une **friche**. Les **technopôles** réunissent recherche et entreprises innovantes.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’un espace productif ?',
      a: 'un lieu organisé par des activités productives liées entre elles',
      wrong: [
        {
          label: 'un espace réservé aux seuls logements',
          why: 'Un espace résidentiel loge : il ne se définit pas par la production.',
        },
        {
          label: 'un espace sans aucune activité humaine',
          why: 'Un espace productif est au contraire organisé par des activités.',
        },
        {
          label: 'une frontière entre deux États',
          why: 'Une frontière sépare ; elle ne désigne pas un ensemble d’activités.',
        },
      ],
      gap: ['Un espace productif est lié à un ensemble d’activités ', ' fonctionnant en système.', ['productives']],
      choix: ['productives', 'résidentielles', 'scolaires'],
      quote: G_PRODUCTIF,
      explain: 'On regarde un territoire à travers ce qu’il produit et les liens entre ces activités.',
      src: PRODUCTIF,
    },
    {
      q: 'Quels types d’espaces productifs le programme cite-t-il ?',
      a: 'industriels, agricoles, touristiques et d’affaires',
      wrong: [
        { label: 'uniquement des espaces agricoles', why: 'L’agriculture n’est qu’un des quatre types cités.' },
        {
          label: 'uniquement des espaces désertiques et polaires',
          why: 'Ce sont des milieux, pas des types d’espaces productifs.',
        },
        { label: 'des zones militaires et des frontières', why: 'Le programme ne les cite pas.' },
      ],
      gap: [
        'Les espaces productifs peuvent être à dominante industrielle, agricole, touristique ou d’',
        '.',
        ['affaires'],
      ],
      choix: ['affaires', 'habitation', 'enseignement'],
      quote: P_MUTATIONS,
      explain: 'Le thème étudie les mutations de ces quatre grandes dominantes.',
    },
    {
      q: 'Avec quels deux processus les mutations des espaces productifs sont-elles liées, selon le programme ?',
      a: 'l’urbanisation et la mondialisation',
      wrong: [
        {
          label: 'la glaciation et la sécheresse',
          why: 'Le programme ne les cite pas comme moteurs de ces mutations.',
        },
        {
          label: 'la colonisation et l’exode rural du XIXe siècle',
          why: 'Le sujet porte sur la France contemporaine.',
        },
        {
          label: 'la fin des échanges et le retour à l’autarcie',
          why: 'C’est l’inverse : les échanges se sont intensifiés.',
        },
      ],
      gap: ['Les espaces productifs sont redessinés par l’urbanisation et la ', '.', ['mondialisation']],
      choix: ['mondialisation', 'déprise', 'reconversion'],
      quote: P_MUTATIONS,
      explain: 'Villes et échanges mondiaux déplacent les activités et transforment les lieux de production.',
    },
    {
      q: 'Que désigne la désindustrialisation ?',
      a: 'la destruction d’emplois industriels ou le recul de l’industrie',
      wrong: [
        { label: 'la création massive d’usines nouvelles', why: 'Le préfixe « dés » indique un recul.' },
        { label: 'le repeuplement des campagnes', why: 'C’est la renaissance rurale.' },
        { label: 'l’étalement des villes', why: 'C’est la périurbanisation.' },
      ],
      gap: ['La désindustrialisation désigne le ', ' de l’activité industrielle ou de l’emploi industriel.', ['recul']],
      choix: ['recul', 'développement', 'transport'],
      quote: G_DESINDUS,
      explain: 'L’industrie perd des emplois ou de la place dans l’économie.',
      src: DESINDUS,
    },
    {
      q: 'La désindustrialisation est notamment liée à quel phénomène ?',
      a: 'l’ouverture des échanges mondiaux',
      wrong: [
        {
          label: 'la disparition de la concurrence entre pays',
          why: 'La concurrence s’est au contraire accrue avec l’ouverture.',
        },
        { label: 'le retour des paysans vers la mer', why: 'Cette réponse n’a pas de lien avec l’industrie.' },
        {
          label: 'l’arrêt de toute production dans le monde',
          why: 'La production mondiale continue : ce sont les lieux et les emplois qui changent.',
        },
      ],
      gap: ['La désindustrialisation est une conséquence de l’ouverture des échanges ', '.', ['mondiaux']],
      choix: ['mondiaux', 'scolaires', 'religieux'],
      quote: G_OUVERTURE,
      explain: 'La concurrence avec des pays aux salaires plus bas pèse sur certaines industries.',
      src: DESINDUS,
    },
    {
      q: 'Comment appelle-t-on la transformation des activités d’un territoire pour l’adapter à un nouvel environnement ?',
      a: 'la reconversion',
      wrong: [
        {
          label: 'la désindustrialisation',
          why: 'Elle désigne un recul ; la reconversion répond par d’autres activités.',
        },
        { label: 'la périurbanisation', why: 'Elle étend la ville en périphérie.' },
        { label: 'la métropolisation', why: 'Elle désigne la concentration dans les grandes villes.' },
      ],
      gap: [
        'La ',
        ' transforme les activités d’un territoire pour l’adapter à un nouveau contexte.',
        ['reconversion', 'conversion'],
      ],
      choix: ['reconversion', 'déprise', 'métropolisation'],
      quote: G_RECONVERSION,
      explain: 'Un ancien bassin industriel peut se tourner vers de nouvelles activités.',
      src: RECONVERSION,
    },
    {
      q: 'Qu’est-ce qu’une friche ?',
      a: 'un terrain qui a perdu sa fonction',
      wrong: [
        { label: 'un terrain qui vient d’être bâti', why: 'Un terrain neuf a une fonction, il n’est pas à l’abandon.' },
        {
          label: 'une zone protégée par un parc national',
          why: 'Un parc protège un espace : ce n’est pas un abandon.',
        },
        { label: 'un centre commercial très fréquenté', why: 'Il remplit pleinement sa fonction.' },
      ],
      gap: ['Une friche est un terrain qui a perdu sa ', ' ou sa vocation.', ['fonction']],
      choix: ['fonction', 'frontière', 'altitude'],
      quote: G_FRICHE,
      explain: 'Une usine fermée peut laisser une friche, qu’on peut ensuite réaménager.',
      src: FRICHE,
    },
    {
      q: 'Qu’est-ce qu’un technopôle ?',
      a: 'un site qui réunit des activités à technologies innovantes',
      wrong: [
        {
          label: 'une région agricole spécialisée dans le blé',
          why: 'Le technopôle concerne la recherche et les technologies, non les cultures.',
        },
        {
          label: 'un port réservé aux pétroliers',
          why: 'Le technopôle concerne la recherche et l’innovation, pas le transport du pétrole.',
        },
        { label: 'un parc national de montagne', why: 'Un parc protège la nature.' },
      ],
      gap: ['Un technopôle réunit des activités qui recourent à des technologies ', '.', ['innovantes']],
      choix: ['innovantes', 'anciennes', 'agricoles'],
      quote: G_TECHNOPOLE,
      explain: 'Universités, centres de recherche et entreprises y sont rapprochés, souvent en périphérie de ville.',
      src: TECHNOPOLE,
    },
    {
      q: 'Quels acteurs un pôle de compétitivité, labellisé (reconnu officiellement) par l’État, réunit-il ?',
      a: 'des entreprises, des unités de recherche et de formation et des organismes publics',
      wrong: [
        { label: 'seulement des agriculteurs voisins', why: 'Le réseau réunit des acteurs plus divers.' },
        {
          label: 'seulement des touristes étrangers',
          why: 'Ce ne sont pas des acteurs de la recherche ni des entreprises.',
        },
        {
          label: 'des communes sans aucune activité',
          why: 'Un pôle de compétitivité vise justement l’activité et l’innovation.',
        },
      ],
      gap: [
        'Un pôle de compétitivité est un réseau d’entreprises, de recherche et d’organismes publics, labellisé par l’',
        '.',
        ['État'],
      ],
      choix: ['État', 'Europe', 'Océan'],
      quote: G_COMPETITIVITE,
      explain: 'Ces acteurs se regroupent sur un domaine d’avenir.',
      src: COMPETITIVITE,
    },
    {
      q: 'Dans la filière agroalimentaire, qu’appelle-t-on les activités d’aval ?',
      a: 'la transformation et le conditionnement, la logistique et la vente',
      wrong: [
        {
          label: 'la fourniture d’engrais et de semences',
          why: 'Les fournisseurs se situent en amont, avant la production agricole.',
        },
        {
          label: 'le travail des champs seulement',
          why: 'La production agricole est au centre de la filière, pas en aval.',
        },
        { label: 'les services vétérinaires', why: 'Ils se situent en amont.' },
      ],
      gap: [
        'Après la production agricole, l’',
        ' de la filière transforme, transporte et vend les produits.',
        ['aval'],
      ],
      choix: ['aval', 'amont', 'pôle'],
      quote: G_AVAL,
      explain: 'La filière relie des fournisseurs, des agriculteurs, des transformateurs et des vendeurs.',
      src: AGRO,
    },
    {
      q: 'Que désigne l’industrie touristique ?',
      a: 'les productions et services destinés à répondre aux attentes du touriste',
      wrong: [
        { label: 'les usines qui fabriquent des machines agricoles', why: 'Elles ne s’adressent pas au touriste.' },
        {
          label: 'les seuls monuments anciens',
          why: 'Les monuments sont des ressources ; l’industrie touristique réunit les services autour.',
        },
        { label: 'les navettes quotidiennes vers le travail', why: 'Ce sont des mobilités pendulaires.' },
      ],
      gap: ['Voyagistes, hébergements et restaurants répondent aux attentes du ', '.', ['touriste']],
      choix: ['touriste', 'navetteur', 'agriculteur'],
      quote: G_TOURISTIQUE,
      explain: 'Transport, hébergement et restauration forment un véritable système productif.',
      src: INDUS_TOURISME,
    },
  ],
  paires3: [
    ['désindustrialisation', 'recul de l’industrie'],
    ['reconversion', 'transformation des activités d’un territoire'],
    ['technopôle', 'site réunissant recherche et entreprises innovantes'],
  ],
  paires5: [
    ['friche', 'terrain qui a perdu sa fonction'],
    ['pôle de compétitivité', 'réseau d’entreprises et de recherche labellisé par l’État'],
    ['quartier d’affaires', 'espace d’activités à très forte valeur ajoutée financière'],
    ['filière agroalimentaire', 'chaîne qui relie fournisseurs, agriculteurs, transformateurs et vendeurs'],
    ['industrie touristique', 'productions et services pour les touristes'],
  ],
  ordre: [
    'fournir des semences et des engrais',
    'cultiver les champs',
    'transformer et conditionner les produits',
    'vendre les produits aux clients',
  ],
  consigne: {
    prompt: 'Remets dans l’ordre les étapes d’une filière agroalimentaire, de l’amont vers l’aval.',
    hint: 'Pense à ce qui doit exister avant de pouvoir récolter, puis après.',
    why: 'L’amont fournit l’agriculteur ; la production agricole est au centre ; l’aval transforme puis commercialise.',
    fin: 'La première étape est',
    quote: G_AMONT,
    src: AGRO,
  },
  libres: [
    {
      q: 'comment appelle-t-on un site, souvent périurbain, qui réunit universités, recherche et entreprises innovantes ?',
      accepted: ['technopôle', 'technopole', 'un technopôle', 'le technopôle', 'technopôles'],
      traps: [
        { text: 'friche', why: 'Une friche est un terrain qui a perdu sa fonction.' },
        { text: 'banlieue', why: 'La banlieue désigne des communes autour d’une ville-centre.' },
      ],
      quote: G_TECHNOPOLE,
      explain:
        'Sophia-Antipolis, près de Nice et Antibes, est un des premiers exemples en France. À ne pas confondre avec une technopole (sans accent), qui désigne une grande ville tournée vers l’innovation.',
      src: TECHNOPOLE,
    },
    {
      q: 'comment appelle-t-on un terrain, par exemple une ancienne usine, qui a perdu sa fonction ?',
      accepted: ['friche', 'une friche', 'la friche', 'friche industrielle', 'une friche industrielle'],
      traps: [
        { text: 'technopôle', why: 'Un technopôle réunit recherche et entreprises : il est actif.' },
        { text: 'reconversion', why: 'La reconversion est la transformation qui peut suivre l’abandon.' },
      ],
      quote: G_FRICHE,
      explain: 'La friche attend souvent un nouvel usage.',
      src: FRICHE,
    },
    {
      q: 'quel mot désigne le recul de l’activité industrielle ou la destruction d’emplois industriels ?',
      accepted: ['désindustrialisation', 'desindustrialisation', 'la désindustrialisation'],
      traps: [
        { text: 'reconversion', why: 'La reconversion développe de nouvelles activités après un recul.' },
        { text: 'industrialisation', why: 'L’industrialisation est le développement de l’industrie, l’inverse.' },
      ],
      quote: G_DESINDUS,
      explain: 'Le préfixe « dés » signale que l’industrie recule.',
      src: DESINDUS,
    },
  ],
  docs: [
    {
      title: 'Le bassin de Ferrange',
      lines: [
        'À Ferrange, ville fictive, les hauts-fourneaux ont fermé il y a plusieurs décennies.',
        'De vastes bâtiments sont restés vides pendant des années.',
        'Aujourd’hui, une école d’ingénieurs et des entreprises du numérique y sont installées.',
      ],
      qs: [
        {
          q: 'Quel phénomène la fermeture des hauts-fourneaux illustre-t-elle ?',
          a: 'la désindustrialisation',
          wrong: [
            { label: 'la périurbanisation', why: 'Elle étend la ville ; le texte parle de la fermeture d’usines.' },
            { label: 'la renaissance rurale', why: 'Elle concerne le repeuplement des campagnes.' },
          ],
          quote: G_DESINDUS,
          explain: 'Les emplois et l’activité industrielle reculent.',
          src: DESINDUS,
        },
        {
          q: 'Avant l’arrivée des nouvelles activités, comment qualifier les bâtiments vides ?',
          a: 'des friches industrielles',
          wrong: [
            { label: 'des technopôles', why: 'Vides et sans activité, ils ne réunissent ni recherche ni entreprises.' },
            { label: 'des quartiers d’affaires', why: 'Aucune activité financière ne s’y concentre.' },
          ],
          quote: G_FRICHE,
          explain: 'Ils ont perdu leur fonction.',
          src: FRICHE,
        },
        {
          q: 'Comment nommer la transformation qui a installé école et entreprises sur le site ?',
          a: 'une reconversion',
          wrong: [
            { label: 'une désindustrialisation', why: 'La désindustrialisation est le recul qui a précédé.' },
            { label: 'une déprise agricole', why: 'Il ne s’agit pas de terres cultivées.' },
          ],
          quote: G_RECONVERSION,
          explain: 'Le territoire change d’activités pour s’adapter.',
          src: RECONVERSION,
        },
      ],
    },
    {
      title: 'La plaine de Beaulieu',
      lines: [
        'Dans la plaine fictive de Beaulieu, des agriculteurs cultivent de grandes parcelles.',
        'Une coopérative leur vend semences et engrais.',
        'Leur récolte est transformée dans une usine voisine puis vendue dans le monde.',
      ],
      qs: [
        {
          q: 'Quelle activité de la filière se situe en aval des champs ?',
          a: 'la transformation de la récolte',
          wrong: [
            { label: 'la vente de semences', why: 'Elle intervient avant la culture : c’est l’amont.' },
            { label: 'la vente d’engrais', why: 'Les engrais sont fournis avant la production : amont.' },
          ],
          quote: G_AVAL,
          explain: 'L’aval vient après la production agricole.',
          src: AGRO,
        },
        {
          q: 'Que montre la vente de la récolte dans le monde ?',
          a: 'l’espace productif est relié à la mondialisation',
          wrong: [
            { label: 'la plaine vit sans échanges', why: 'La récolte est vendue au loin.' },
            { label: 'l’agriculture a disparu', why: 'Les agriculteurs cultivent toujours de grandes parcelles.' },
          ],
          quote: P_MUTATIONS,
          explain: 'La mondialisation redessine la géographie des espaces productifs.',
        },
        {
          q: 'De quel type d’espace productif cette plaine relève-t-elle d’abord ?',
          a: 'un espace productif à dominante agricole',
          wrong: [
            { label: 'un espace à dominante d’affaires', why: 'Le texte ne décrit ni bureaux ni finance.' },
            { label: 'un espace à dominante touristique', why: 'Aucun visiteur ni hébergement n’est cité.' },
          ],
          quote: P_MUTATIONS,
          explain: 'La culture des champs organise ce territoire, avec des industries autour.',
        },
      ],
    },
    {
      title: 'Deux quartiers de Sellac',
      lines: [
        'À Sellac, métropole fictive, des tours abritent les sièges de banques et d’entreprises.',
        'En périphérie, un parc réunit des laboratoires, une université et de jeunes entreprises de haute technologie.',
        'Au bord du lac voisin, hôtels et restaurants accueillent des visiteurs.',
      ],
      qs: [
        {
          q: 'Quel espace productif les tours de banques représentent-elles ?',
          a: 'un quartier d’affaires',
          wrong: [
            { label: 'une friche', why: 'Un espace plein d’activités n’est pas abandonné.' },
            { label: 'un espace agricole', why: 'Les tours n’accueillent pas de cultures.' },
          ],
          quote: G_CBD,
          explain: 'Les activités financières à forte valeur ajoutée s’y concentrent.',
          src: CBD,
        },
        {
          q: 'Comment appeler le parc de laboratoires et d’entreprises innovantes ?',
          a: 'un technopôle',
          wrong: [
            { label: 'un bassin céréalier', why: 'On n’y cultive pas de céréales.' },
            {
              label: 'une station balnéaire',
              why: 'Une station balnéaire accueille des vacanciers au bord de la mer, pas des laboratoires.',
            },
          ],
          quote: G_TECHNOPOLE,
          explain: 'Recherche, université et entreprises innovantes y sont réunies.',
          src: TECHNOPOLE,
        },
        {
          q: 'À quelle dominante rattacher les hôtels et restaurants du lac ?',
          a: 'la dominante touristique',
          wrong: [
            { label: 'la dominante industrielle', why: 'Aucune usine n’est citée au bord du lac.' },
            { label: 'la dominante agricole', why: 'Les hôtels n’assurent pas de production agricole.' },
          ],
          quote: G_TOURISTIQUE,
          explain: 'Ces services répondent aux attentes des visiteurs.',
          src: INDUS_TOURISME,
        },
      ],
    },
  ],
};

// ——— Notion 3 : les espaces de faible densité ———

const faibleDensite: Notion = {
  classe: CLASSE,
  id: 'g3-faible-densite',
  title: 'Les espaces de faible densité et leurs atouts',
  hint: 'Pense aux espaces peu peuplés, à la variété de leurs évolutions et à ce qu’ils offrent.',
  memo: [
    'Les espaces de **faible densité** (**espaces ruraux**, montagnes, secteurs touristiques peu urbanisés) évoluent de façons très différentes. Ce ne sont pas seulement des marges délaissées.',
    'Certains connaissent la **déprise**, d’autres la **renaissance rurale**, avec des **néoruraux**. Leurs atouts : agriculture, tourisme, accueil de nouveaux habitants.',
  ],
  faits: [
    {
      q: 'Quels espaces le programme range-t-il parmi les espaces de faible densité ?',
      a: 'les espaces ruraux, les montagnes et les secteurs touristiques peu urbanisés',
      wrong: [
        { label: 'les centres des métropoles', why: 'Un centre de métropole est très densément peuplé.' },
        { label: 'les banlieues très peuplées', why: 'Les banlieues font partie des agglomérations, à forte densité.' },
        { label: 'les quartiers d’affaires', why: 'Ils concentrent beaucoup d’activités en ville.' },
      ],
      gap: [
        'Espaces ruraux, ',
        ' et secteurs touristiques peu urbanisés sont des espaces de faible densité.',
        ['montagnes'],
      ],
      choix: ['montagnes', 'centres-villes', 'ports'],
      quote: P_FAIBLE,
      explain: 'Ces trois types d’espaces ont en commun un peuplement peu dense.',
    },
    {
      q: 'Sous quel angle le programme demande-t-il d’étudier les espaces de faible densité ?',
      a: 'la diversité de leurs dynamiques et de leurs atouts',
      wrong: [
        { label: 'leur seul déclin', why: 'Le programme refuse de les voir uniquement comme des marges délaissées.' },
        { label: 'leur transformation en métropoles', why: 'Ce n’est pas l’angle proposé.' },
        {
          label: 'la seule histoire de leurs frontières',
          why: 'Le sujet porte sur leurs dynamiques actuelles et leurs atouts.',
        },
      ],
      gap: ['On étudie la diversité de leurs dynamiques et de leurs ', '.', ['atouts']],
      choix: ['atouts', 'frontières', 'langues'],
      quote: P_FAIBLE,
      explain: 'Ces espaces ne suivent pas tous la même trajectoire.',
    },
    {
      q: 'Parmi ces affirmations, laquelle correspond à la vision du programme ?',
      a: 'ils disposent de ressources productives et d’atouts variés',
      wrong: [
        { label: 'ils sont tous des marges délaissées', why: 'Le programme écarte cette vision trop simple.' },
        {
          label: 'ils n’ont aucune ressource productive',
          why: 'Agriculture, tourisme et accueil d’habitants sont des ressources.',
        },
        {
          label: 'ils n’attirent jamais de nouveaux habitants',
          why: 'L’accueil de nouveaux habitants est cité par le programme.',
        },
      ],
      gap: [
        'Les atouts sont notamment les activités agricoles, touristiques et l’accueil de nouveaux types d’',
        '.',
        ['habitants'],
      ],
      choix: ['habitants', 'usines', 'frontières'],
      quote: P_ATOUTS,
      explain: 'Le programme invite à voir leurs ressources et pas seulement leurs difficultés.',
    },
    {
      q: 'Comment l’INSEE décrit-il les espaces ruraux au regard des espaces naturels ?',
      a: 'peu peuplés et peu artificialisés, mais pas pour autant naturels',
      wrong: [
        { label: 'des espaces totalement sauvages', why: 'Les sociétés les ont profondément transformés.' },
        { label: 'des espaces entièrement bâtis', why: 'Ils sont au contraire faiblement artificialisés.' },
        { label: 'des espaces sans aucun habitant', why: 'Ils sont peu peuplés, mais habités.' },
      ],
      gap: ['Les espaces ruraux sont peu artificialisés mais ne sont pas pour autant des espaces ', '.', ['naturels']],
      choix: ['naturels', 'urbains', 'maritimes'],
      quote: I_ARTIFICIEL,
      explain: 'Champs, forêts exploitées et villages montrent la marque des sociétés.',
      src: RURAL_INSEE,
    },
    {
      q: 'Que désigne la déprise agricole ?',
      a: 'le recul des surfaces cultivées',
      wrong: [
        { label: 'la hausse rapide des surfaces cultivées', why: 'La déprise désigne un recul.' },
        { label: 'l’arrivée de nombreux touristes', why: 'Le tourisme n’est pas la définition de la déprise.' },
        { label: 'la construction de lotissements', why: 'C’est la périurbanisation.' },
      ],
      gap: ['La déprise agricole signifie le recul des surfaces ', '.', ['cultivées', 'cultivees']],
      choix: ['cultivées', 'bâties', 'touristiques'],
      quote: G_DEPRISE,
      explain: 'Des terres sont abandonnées ou moins exploitées.',
      src: DEPRISE,
    },
    {
      q: 'Quel paysage caractérise la déprise ?',
      a: 'la friche',
      wrong: [
        { label: 'le quartier d’affaires', why: 'Il est lié à la concentration d’activités en ville.' },
        { label: 'le lotissement neuf', why: 'Un lotissement neuf traduit des arrivées.' },
        { label: 'la station de ski très fréquentée', why: 'La fréquentation n’est pas un signe d’abandon.' },
      ],
      gap: ['Les ', ', agricoles ou urbaines, sont les paysages de la déprise.', ['friches', 'friche']],
      choix: ['friches', 'tours', 'plages'],
      quote: G_PAYSAGES,
      explain: 'Les terres abandonnées se couvrent de végétation spontanée.',
      src: DEPRISE,
    },
    {
      q: 'Qu’est-ce que la renaissance rurale ?',
      a: 'le repeuplement d’espaces ruraux',
      wrong: [
        { label: 'l’abandon définitif des campagnes', why: 'C’est l’inverse : des habitants y reviennent.' },
        { label: 'la disparition de l’agriculture', why: 'La renaissance rurale concerne la population.' },
        { label: 'la concentration dans les métropoles', why: 'C’est la métropolisation.' },
      ],
      gap: ['La renaissance rurale désigne le ', ' des espaces ruraux.', ['repeuplement']],
      choix: ['repeuplement', 'dépeuplement', 'bétonnage'],
      quote: G_RENAISSANCE,
      explain: 'Après des décennies de baisse, la population de certaines campagnes remonte.',
      src: RENAISSANCE,
    },
    {
      q: 'Qui sont les néoruraux ?',
      a: 'de nouveaux habitants des communes rurales venus de communes urbaines',
      wrong: [
        {
          label: 'des agriculteurs qui quittent la campagne pour la ville',
          why: 'Le préfixe « néo » indique de nouveaux arrivants dans le rural.',
        },
        { label: 'des touristes de passage une journée', why: 'Ils ne s’installent pas.' },
        { label: 'des habitants de toujours de la même ferme', why: 'Ils sont nouveaux et viennent de la ville.' },
      ],
      gap: ['Les néoruraux viennent de communes ', ' et s’installent dans des communes rurales.', ['urbaines']],
      choix: ['urbaines', 'insulaires', 'montagnardes'],
      quote: G_NEORURAUX,
      explain: 'Ces arrivées contribuent au repeuplement et peuvent transformer la vie locale.',
      src: NEORURAUX,
    },
    {
      q: 'Dans la montagne, par quoi s’expriment les contraintes ?',
      a: 'par le relief et par le climat',
      wrong: [
        { label: 'par la seule densité des villes', why: 'La contrainte de montagne tient au milieu.' },
        { label: 'par la seule frontière', why: 'Une frontière n’est pas la contrainte physique décrite.' },
        { label: 'par la présence de la mer', why: 'La mer ne caractérise pas la montagne.' },
      ],
      gap: ['En montagne, les contraintes viennent du relief et du ', '.', ['climat']],
      choix: ['climat', 'commerce', 'tramway'],
      quote: G_MONTAGNE,
      explain: 'Pente et froid compliquent les activités ; les sociétés s’adaptent et en tirent aussi des atouts.',
      src: MONTAGNE,
    },
    {
      q: 'Selon l’INSEE, quelle activité est très présente dans le rural, en plus de l’agriculture et de l’industrie ?',
      a: 'le tourisme',
      wrong: [
        { label: 'la finance internationale', why: 'Elle se concentre dans les quartiers d’affaires.' },
        { label: 'les ports à conteneurs', why: 'Ils sont situés sur des littoraux très équipés.' },
        { label: 'les aéroports de correspondance', why: 'Ils sont associés aux métropoles.' },
      ],
      gap: ['Le ', ' est très présent dans le rural.', ['tourisme']],
      choix: ['tourisme', 'métro', 'port'],
      quote: I_TOURISME,
      explain: 'Le tourisme est un atout pour de nombreux espaces ruraux.',
      src: RURAL_INSEE,
    },
  ],
  paires3: [
    ['déprise', 'recul des habitants et des activités'],
    ['renaissance rurale', 'repeuplement de campagnes'],
    ['néoruraux', 'nouveaux habitants venus de la ville'],
  ],
  paires5: [
    ['agritourisme', 'activité touristique sur une exploitation agricole'],
    ['multifonctionnalité', 'plusieurs fonctions qui se côtoient'],
    ['friche agricole', 'terre cultivée laissée à l’abandon'],
    ['diagonale des faibles densités', 'bande peu peuplée du Nord-Est au Sud-Ouest'],
    ['économie présentielle', 'production pour les personnes présentes, habitants ou visiteurs'],
  ],
  libres: [
    {
      q: 'comment appelle-t-on les nouveaux habitants des communes rurales venus de la ville ?',
      accepted: [
        'néoruraux',
        'neoruraux',
        'néo-ruraux',
        'neo-ruraux',
        'les néoruraux',
        'les néo-ruraux',
        'des néoruraux',
        'des néo-ruraux',
      ],
      traps: [
        {
          text: 'navetteurs',
          why: 'Les navetteurs font des trajets quotidiens : le mot ne dit pas d’où ils viennent.',
        },
        { text: 'touristes', why: 'Les touristes séjournent sans s’installer.' },
      ],
      quote: G_NEORURAUX,
      explain: '« Néo » veut dire nouveau.',
      src: NEORURAUX,
    },
    {
      q: 'quel mot désigne le recul des surfaces cultivées et des activités dans un espace ?',
      accepted: ['déprise', 'deprise', 'la déprise', 'déprise agricole', 'la déprise agricole'],
      traps: [
        { text: 'périurbanisation', why: 'Elle fait avancer la ville au contraire.' },
        { text: 'renaissance rurale', why: 'Elle désigne un repeuplement.' },
      ],
      quote: G_DEPRISE,
      explain: 'La déprise se lit dans les terres abandonnées.',
      src: DEPRISE,
    },
    {
      q: 'comment appelle-t-on une activité touristique ou de loisirs exercée au sein d’une exploitation agricole ?',
      accepted: ['agritourisme', 'agrotourisme', 'l’agritourisme', 'l’agrotourisme', 'agro-tourisme'],
      traps: [
        { text: 'tourisme balnéaire', why: 'Le balnéaire concerne les bords de mer.' },
        { text: 'agriculture vivrière', why: 'L’agriculture vivrière nourrit la famille ; ce n’est pas du tourisme.' },
      ],
      quote: G_AGRITOURISME,
      explain: 'Gîte à la ferme ou vente directe apportent un revenu complémentaire.',
      src: AGRITOURISME,
    },
  ],
  docs: [
    {
      title: 'Le plateau de Montclar',
      lines: [
        'Au plateau fictif de Montclar, les terres les plus pentues ne sont plus cultivées.',
        'Les ronces gagnent les anciens champs.',
        'Depuis dix ans, des familles venues de la ville s’installent et ouvrent des ateliers.',
        'Une ferme propose des chambres et la vente de ses fromages aux visiteurs.',
      ],
      qs: [
        {
          q: 'Quel phénomène les terres laissées aux ronces montrent-elles ?',
          a: 'la déprise agricole',
          wrong: [
            { label: 'la périurbanisation', why: 'Le texte ne décrit pas la ville qui avance.' },
            { label: 'la désindustrialisation', why: 'Il s’agit de terres agricoles, pas d’usines.' },
          ],
          quote: G_DEPRISE,
          explain: 'La surface cultivée recule.',
          src: DEPRISE,
        },
        {
          q: 'Comment nommer les familles venues de la ville ?',
          a: 'des néoruraux',
          wrong: [
            { label: 'des touristes', why: 'Elles s’installent et travaillent sur place.' },
            { label: 'des navetteurs', why: 'Le texte ne mentionne aucun trajet vers une ville.' },
          ],
          quote: G_NEORURAUX,
          explain: 'De nouveaux habitants d’origine urbaine arrivent dans le rural.',
          src: NEORURAUX,
        },
        {
          q: 'Quelle activité associe la ferme, ses chambres et la vente aux visiteurs ?',
          a: 'l’agritourisme',
          wrong: [
            { label: 'la métropolisation', why: 'Elle concerne les grandes villes.' },
            {
              label: 'la désindustrialisation',
              why: 'La ferme développe une activité, elle n’est pas une industrie en recul.',
            },
          ],
          quote: G_AGRITOURISME,
          explain: 'Une activité touristique s’ajoute à la production agricole.',
          src: AGRITOURISME,
        },
      ],
    },
    {
      title: 'Une vallée de montagne',
      lines: [
        'Dans la vallée fictive de Haute-Roche, la pente et le froid limitent les cultures.',
        'En hiver, des visiteurs remplissent la station de ski.',
        'En été, des éleveurs vendent leurs produits aux randonneurs.',
        'Quelques entreprises et des artisans travaillent aussi sur place.',
      ],
      qs: [
        {
          q: 'D’après le texte, quelles contraintes la montagne impose-t-elle aux cultures ?',
          a: 'des contraintes de relief et de climat',
          wrong: [
            { label: 'des contraintes de frontière', why: 'Aucune frontière n’est citée.' },
            { label: 'une trop forte densité urbaine', why: 'La vallée est peu urbanisée.' },
          ],
          quote: G_MONTAGNE,
          explain: 'La pente relève du relief, le froid du climat.',
          src: MONTAGNE,
        },
        {
          q: 'Quelle idée la diversité des activités de la vallée illustre-t-elle ?',
          a: 'la multifonctionnalité',
          wrong: [
            { label: 'la spécialisation dans une seule activité', why: 'Élevage, tourisme et artisanat coexistent.' },
            { label: 'la déprise totale', why: 'La vallée reste active toute l’année.' },
          ],
          quote: G_MULTI,
          explain: 'Plusieurs fonctions se côtoient dans le même espace.',
          src: MULTI,
        },
        {
          q: 'Comment appeler l’économie qui produit des biens et des services pour les personnes présentes dans la vallée, visiteurs compris ?',
          a: 'une économie présentielle',
          wrong: [
            {
              label: 'une économie sans clients sur place',
              why: 'Les visiteurs et les habitants présents sont justement les clients.',
            },
            { label: 'une économie de quartier d’affaires', why: 'La vallée n’accueille pas de sièges financiers.' },
          ],
          quote: G_PRESENTIELLE,
          explain: 'On produit pour les personnes présentes, habitants comme visiteurs.',
          src: PRESENTIELLE,
        },
      ],
    },
    {
      title: 'Sur la carte de France',
      lines: [
        'Un professeur montre une bande de territoires peu peuplés qui traverse le pays.',
        'Elle va du Nord-Est au Sud-Ouest.',
        'Il précise qu’on trouve aussi de faibles densités ailleurs.',
        'Il refuse d’appeler cette bande « diagonale du vide ».',
      ],
      qs: [
        {
          q: 'Quel nom les géographes préfèrent-ils pour cette bande ?',
          a: 'la diagonale des faibles densités',
          wrong: [
            { label: 'la mégalopole', why: 'Une mégalopole est un réseau très dense de grandes villes.' },
            { label: 'la diagonale du vide', why: 'Cette expression est aujourd’hui abandonnée par les géographes.' },
          ],
          quote: G_VIDE,
          explain: 'Le mot « vide » est trompeur : ces espaces sont habités.',
          src: DIAGONALE,
        },
        {
          q: 'Dans quelle direction la bande traverse-t-elle la France ?',
          a: 'du Nord-Est au Sud-Ouest',
          wrong: [
            { label: 'du Nord-Ouest au Sud-Est', why: 'Le texte dit Nord-Est vers Sud-Ouest.' },
            { label: 'd’est en ouest le long de la Méditerranée', why: 'La bande part du Nord-Est.' },
          ],
          quote: G_DIAGONALE,
          explain: 'Repère-la sur un croquis du Nord-Est vers le Sud-Ouest.',
          src: DIAGONALE,
        },
        {
          q: 'Que faut-il retenir des autres régions françaises ?',
          a: 'des faibles densités existent aussi hors de la bande',
          wrong: [
            { label: 'toutes les autres régions sont très denses', why: 'Le texte affirme le contraire.' },
            { label: 'la bande est le seul espace rural', why: 'D’autres territoires peu peuplés existent.' },
          ],
          quote: G_AILLEURS,
          explain: 'La diagonale est une représentation simplifiée.',
          src: DIAGONALE,
        },
      ],
    },
  ],
};

// ——— Notion 4 : le vocabulaire ———

const vocabulaire: Notion = {
  classe: CLASSE,
  id: 'g3-vocabulaire-territoires',
  title: 'Le vocabulaire des dynamiques territoriales',
  hint: 'Regarde les débuts de mots (péri, dé, re, multi) et demande-toi s’il s’agit d’un lieu, d’un trajet ou d’un changement.',
  memo: [
    'Les débuts de mots aident : « péri » veut dire autour, « dé » indique un recul, « re » une nouvelle fois ou un retour. Ainsi la **périurbanisation** étend la ville autour d’elle.',
    'Au brevet, emploie les mots exacts : **aire d’attraction**, **mobilité pendulaire**, **reconversion**, **déprise**, **multifonctionnalité**.',
  ],
  faits: [
    {
      q: 'Quel mot désigne un ensemble de communes au bâti continu, d’au moins 2 000 habitants ?',
      a: 'l’unité urbaine',
      wrong: [
        { label: 'la couronne', why: 'La couronne est définie par les trajets vers le pôle.' },
        { label: 'la friche', why: 'La friche est un terrain qui a perdu sa fonction.' },
        { label: 'la métropolisation', why: 'C’est un processus de concentration, pas un ensemble de communes.' },
      ],
      gap: [
        'Pour une unité urbaine, il ne doit pas y avoir de coupure de plus de ',
        ' mètres entre deux constructions.',
        ['200'],
      ],
      quote: I_200,
      explain: 'La continuité du bâti, avec le seuil de 200 mètres, définit l’unité urbaine.',
      src: UNITE_URBAINE,
    },
    {
      q: 'Comment appelle-t-on les communes d’une unité urbaine qui ne sont pas villes-centres ?',
      a: 'la banlieue',
      wrong: [
        { label: 'la couronne', why: 'La couronne est située autour du pôle, hors du bâti continu.' },
        { label: 'le technopôle', why: 'C’est un site d’innovation.' },
        { label: 'la friche', why: 'La friche n’est pas un ensemble de communes.' },
      ],
      gap: ['Les communes d’une unité urbaine qui ne sont pas villes-centres forment la ', '.', ['banlieue']],
      choix: ['banlieue', 'couronne', 'friche'],
      quote: I_BANLIEUE,
      explain: 'La banlieue complète la ville-centre dans le bâti continu.',
      src: BANLIEUE,
    },
    {
      q: 'Quel mot désigne les navettes quotidiennes entre domicile et travail ?',
      a: 'les mobilités pendulaires',
      wrong: [
        { label: 'les néoruraux', why: 'Ce sont des habitants, pas des trajets.' },
        { label: 'les migrations internationales', why: 'Une migration implique un changement de domicile.' },
        { label: 'la reconversion', why: 'C’est la transformation des activités d’un territoire.' },
      ],
      gap: ['La mobilité ', ', ou alternante, désigne les navettes domicile-travail.', ['pendulaire']],
      choix: ['pendulaire', 'agricole', 'résidentielle'],
      quote: G_PENDULAIRE,
      explain: 'On parle aussi de mobilité alternante.',
      src: PENDULAIRE,
    },
    {
      q: 'Qu’est-ce que la multifonctionnalité d’un espace ?',
      a: 'plusieurs fonctions s’y côtoient',
      wrong: [
        { label: 'une seule activité y domine tout', why: 'C’est la spécialisation, le contraire.' },
        { label: 'aucune activité n’y existe', why: 'La multifonctionnalité suppose plusieurs activités.' },
        { label: 'l’espace est entièrement urbanisé', why: 'Elle ne dépend pas du taux d’urbanisation.' },
      ],
      gap: ['La multifonctionnalité désigne un espace où différentes ', ' se côtoient.', ['fonctions']],
      choix: ['fonctions', 'frontières', 'régions'],
      quote: G_MULTI,
      explain: 'Un village peut à la fois produire, loger et accueillir des visiteurs.',
      src: MULTI,
    },
    {
      q: 'Dans quel cas parle-t-on d’agritourisme ?',
      a: 'quand une activité touristique ou de loisirs a lieu sur une exploitation agricole',
      wrong: [
        { label: 'quand on visite un quartier d’affaires', why: 'Il n’y a pas d’exploitation agricole.' },
        { label: 'quand une usine ferme', why: 'Cela relève de la désindustrialisation.' },
        { label: 'quand des habitants font la navette vers la ville', why: 'Ce sont des mobilités pendulaires.' },
      ],
      gap: ['L’agritourisme est une activité de loisirs au sein d’une exploitation ', '.', ['agricole']],
      choix: ['agricole', 'minière', 'portuaire'],
      quote: G_AGRITOURISME,
      explain: '« Agri » renvoie à l’agriculture.',
      src: AGRITOURISME,
    },
    {
      q: 'Quelle expression les géographes préfèrent-ils aux anciens « secteurs » pour étudier ce que produit un territoire ?',
      a: 'systèmes productifs ou espaces productifs',
      wrong: [
        { label: 'frontières naturelles', why: 'Les frontières ne décrivent pas la production.' },
        { label: 'zones sans activité', why: 'L’étude porte justement sur la production.' },
        { label: 'couronnes périurbaines', why: 'La couronne concerne les trajets autour d’un pôle.' },
      ],
      gap: ['Les géographes parlent aujourd’hui de systèmes productifs ou d’espaces ', '.', ['productifs']],
      choix: ['productifs', 'périurbains', 'protégés'],
      quote: G_SECTEURS,
      explain: 'Les activités se mêlent trop pour les séparer en trois secteurs seulement.',
      src: SECTEURS,
    },
    {
      q: 'Que signifie le terme « reconversion » pour un territoire ?',
      a: 'transformer ses activités pour s’adapter à un nouveau contexte',
      wrong: [
        {
          label: 'arrêter définitivement toute activité',
          why: 'La reconversion remplace les activités, elle ne les supprime pas toutes.',
        },
        { label: 'étendre la ville dans les champs', why: 'C’est la périurbanisation.' },
        { label: 'fixer une nouvelle frontière', why: 'La reconversion est économique.' },
      ],
      gap: ['La reconversion est la transformation des ', ' d’un territoire.', ['activités']],
      choix: ['activités', 'frontières', 'montagnes'],
      quote: G_RECONVERSION,
      explain: '« Re » indique qu’on se tourne vers autre chose.',
      src: RECONVERSION,
    },
    {
      q: 'Dans l’ancien zonage en aires urbaines, quelle part des actifs d’une commune devait travailler dans le pôle ou ses communes attirées ?',
      a: 'au moins 40 %',
      wrong: [
        { label: 'au moins 15 %', why: '15 % est le seuil du zonage de 2020.' },
        { label: 'au moins 2 %', why: 'Le seuil était bien plus élevé.' },
        { label: '100 %', why: 'Une partie des actifs suffisait.' },
      ],
      gap: ['Avec l’ancien zonage, la couronne exigeait au moins ', ' % des actifs travaillant dans le pôle.', ['40']],
      quote: I_ANCIENNE,
      explain: 'L’ancien seuil (40 %) est plus exigeant que celui de 2020 (15 %).',
      src: AIRE_URBAINE,
    },
    {
      q: 'Quel secteur d’activité marque fortement le rural, avec l’agriculture, selon l’INSEE ?',
      a: 'l’industrie',
      wrong: [
        { label: 'la finance mondiale', why: 'Elle marque surtout les quartiers d’affaires.' },
        { label: 'le transport aérien international', why: 'Il n’est pas un marqueur du rural.' },
        { label: 'la haute couture', why: 'L’INSEE ne la cite pas.' },
      ],
      gap: ['L’agriculture et l’', ' sont des marqueurs forts du rural.', ['industrie']],
      choix: ['industrie', 'aéronautique civile', 'finance'],
      quote: I_ACTIVITES,
      explain: 'Le rural n’est pas seulement agricole : l’industrie y compte.',
      src: RURAL_INSEE,
    },
  ],
  paires3: [
    ['périurbanisation', 'extension autour de la ville'],
    ['désindustrialisation', 'recul de l’industrie'],
    ['renaissance rurale', 'retour de population dans les campagnes'],
  ],
  paires5: [
    ['unité urbaine', 'communes au bâti continu d’au moins 2 000 habitants'],
    ['technopôle', 'site d’activités à technologies innovantes'],
    ['reconversion', 'nouvelles activités pour un territoire'],
    ['multifonctionnalité', 'plusieurs fonctions au même endroit'],
    ['déprise', 'recul de l’occupation d’un espace'],
  ],
  libres: [
    {
      q: 'quel mot désigne la transformation des activités d’un territoire pour l’adapter à un nouveau contexte ?',
      accepted: ['reconversion', 'conversion', 'la reconversion', 'la conversion'],
      traps: [
        { text: 'désindustrialisation', why: 'Elle désigne un recul ; le mot cherché désigne la transformation.' },
        { text: 'périurbanisation', why: 'Elle concerne l’extension des villes.' },
      ],
      quote: G_RECONVERSION,
      explain: 'La reconversion donne de nouvelles activités à un territoire.',
      src: RECONVERSION,
    },
    {
      q: 'comment nomme-t-on le fait que différentes fonctions se côtoient dans un même espace ?',
      accepted: ['multifonctionnalité', 'multifonctionnalite', 'la multifonctionnalité'],
      traps: [
        { text: 'spécialisation', why: 'La spécialisation est le contraire : une activité domine.' },
        { text: 'métropolisation', why: 'C’est la concentration dans les grandes villes.' },
      ],
      quote: G_MULTI,
      explain: '« Multi » veut dire plusieurs.',
      src: MULTI,
    },
    {
      q: 'comment appelle-t-on le repeuplement des campagnes après une période de recul ?',
      accepted: ['renaissance rurale', 'la renaissance rurale'],
      traps: [
        { text: 'exode rural', why: 'L’exode rural est le départ des campagnes.' },
        { text: 'déprise', why: 'La déprise est un recul.' },
      ],
      quote: G_RENAISSANCE,
      explain: 'Le mot « renaissance » image le retour d’habitants.',
      src: RENAISSANCE,
    },
  ],
  docs: [
    {
      title: 'Copie de brevet : le mot juste (1)',
      lines: [
        'Un élève écrit : « Les gens de la couronne vont chaque jour à la ville puis rentrent chez eux. »',
        'Le correcteur demande de remplacer cette longue phrase par le terme exact.',
      ],
      qs: [
        {
          q: 'Quel terme remplace la phrase de l’élève ?',
          a: 'les mobilités pendulaires',
          wrong: [
            { label: 'l’exode rural', why: 'L’exode est un départ durable, pas un aller-retour quotidien.' },
            { label: 'la reconversion', why: 'Elle concerne les activités d’un territoire.' },
          ],
          quote: G_PENDULAIRE,
          explain: 'Le va-et-vient quotidien domicile-travail a un nom précis.',
          src: PENDULAIRE,
        },
      ],
    },
    {
      title: 'Copie de brevet : le mot juste (2)',
      lines: [
        'Un élève écrit : « Des terres ne sont plus cultivées et le paysage se couvre de ronces. »',
        'Le correcteur attend le nom du phénomène.',
      ],
      qs: [
        {
          q: 'Quel terme nomme ce que décrit l’élève ?',
          a: 'la déprise agricole',
          wrong: [
            { label: 'la métropolisation', why: 'Elle concerne les grandes villes.' },
            { label: 'la multifonctionnalité', why: 'La phrase décrit un abandon, pas plusieurs fonctions.' },
          ],
          quote: G_DEPRISE,
          explain: 'La surface cultivée recule.',
          src: DEPRISE,
        },
      ],
    },
    {
      title: 'Copie de brevet : le mot juste (3)',
      lines: [
        'Un élève écrit : « Autour d’un village, des maisons sont à la fois des logements, des gîtes et des ateliers. »',
        'Le correcteur attend le nom de ce caractère.',
      ],
      qs: [
        {
          q: 'Quel terme nomme le mélange de fonctions décrit ?',
          a: 'la multifonctionnalité',
          wrong: [
            { label: 'la désindustrialisation', why: 'Elle désigne un recul de l’industrie.' },
            { label: 'la mobilité pendulaire', why: 'La phrase ne décrit aucun déplacement quotidien.' },
          ],
          quote: G_MULTI,
          explain: 'Loger, accueillir et produire sont plusieurs fonctions réunies.',
          src: MULTI,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [airesUrbaines, espacesProductifs, faibleDensite, vocabulaire];

export const SKILLS: readonly Skill[] = NOTIONS.map(notion);
