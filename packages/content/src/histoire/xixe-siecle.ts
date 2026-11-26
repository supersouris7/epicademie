import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './xixe-siecle-sources.ts';

/**
 * 4e, thème 2 « L’Europe et le monde au XIXe siècle » (lot hi-4e-02). Les faits sont dans `xixe-siecle-sources.ts`
 * avec leur citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */

// ——— Notion 1 : l'Europe de la « révolution industrielle » ———

const industrie: Notion = {
  id: 'h4-revolution-industrielle',
  title: 'L’Europe de la « révolution industrielle »',
  hint: 'Relis le mémo : cherche où et quand l’industrie se développe, avec quelles énergies et ce qui change pour la société.',
  memo: [
    'La **révolution industrielle** commence en Angleterre dans le dernier tiers du XVIIIe siècle ; l’**industrialisation** gagne ensuite la Belgique (en Wallonie), la France et le nord de l’Italie dans les années 1820-1830, puis l’Allemagne et les États-Unis au milieu du XIXe siècle.',
    'La première révolution industrielle repose sur le charbon, le moteur à vapeur, le textile et le fer ; à partir des années 1870, la **seconde révolution industrielle** s’appuie sur l’électricité, le pétrole et le **moteur à explosion**. Les transports sont eux aussi bouleversés.',
    'Dans l’industrie, la **division du travail**, la **mécanisation** et des effectifs importants de **salariés** transforment la société : c’est l’essor du **salariat**. La **condition ouvrière** est très pénible jusqu’au milieu du siècle, les femmes forment en France un tiers des ouvriers, et le sort des ouvriers pose la **question sociale**. De nouvelles idées, comme le **socialisme**, et le **syndicalisme**, dont l’Angleterre est pionnière, y répondent. Repères : la grande famine d’Irlande commence en 1845 et pousse à l’**émigration** vers les États-Unis ; en 1848, la révolution traverse l’Europe et fait évoluer l’idée de nationalité et le droit au travail, avec les journées de juin en France ; depuis 1851, l’Angleterre est majoritairement urbaine, alors que la France reste longtemps rurale ; la crise de 1873, d’abord bancaire, ouvre un ralentissement de la croissance jusqu’en 1896.',
  ],
  faits: [
    {
      ...P.debuts,
      q: 'Dans quel pays la « révolution industrielle » commence-t-elle ?',
      a: 'en Angleterre',
      wrong: [
        { label: 'au Japon', why: 'Le Japon s’affirme comme puissance industrielle bien plus tard, après 1870.' },
        { label: 'en Russie', why: 'La Russie n’est pas le pays où débute l’industrialisation.' },
        {
          label: 'en Allemagne',
          why: 'L’Allemagne s’industrialise à partir du milieu du XIXe siècle, bien après les débuts.',
        },
      ],
      gap: ['La « révolution industrielle » commence en ', ' au XVIIIe siècle.', ['Angleterre']],
      explain: 'L’Angleterre est la première à connaître ces transformations rapides de l’économie.',
    },
    {
      ...P.premiere,
      q: 'Quelle énergie marque la première révolution industrielle ?',
      a: 'le charbon',
      wrong: [
        { label: 'l’électricité', why: 'L’électricité marque la seconde révolution industrielle, après 1870.' },
        { label: 'l’énergie nucléaire', why: 'L’énergie nucléaire appartient au XXe siècle.' },
        { label: 'le pétrole', why: 'Le pétrole marque la seconde révolution industrielle, à partir des années 1870.' },
      ],
      gap: ['La première révolution industrielle repose sur une énergie tirée de la mine : le ', '.', ['charbon']],
      explain: 'Le charbon alimente le moteur à vapeur, au cœur de la première révolution industrielle.',
    },
    {
      ...P.seconde,
      q: 'Quelles énergies marquent la seconde révolution industrielle ?',
      a: 'l’électricité et le pétrole',
      wrong: [
        {
          label: 'le bois et le vent',
          why: 'Ce sont des sources d’énergie bien plus anciennes, d’avant l’industrialisation.',
        },
        { label: 'le charbon et la force animale', why: 'La force animale ne caractérise pas cette nouvelle phase.' },
        {
          label: 'le charbon et la vapeur seulement',
          why: 'Le charbon et la vapeur caractérisent la première révolution industrielle.',
        },
      ],
      gap: [
        'La seconde révolution industrielle, à partir des années 1870, s’appuie sur l’électricité et le ',
        '.',
        ['pétrole', 'petrole'],
      ],
      explain: 'Ces nouvelles énergies s’ajoutent au charbon à partir des années 1870.',
    },
    {
      ...P.caracteres,
      q: 'Quel statut ont les nombreux travailleurs de l’industrie, payés pour leur travail ?',
      a: 'ils sont salariés',
      wrong: [
        { label: 'ils sont esclaves', why: 'Un esclave appartient à un maître et n’est pas payé.' },
        { label: 'ils sont seigneurs', why: 'Un seigneur domine des terres : ce n’est pas un travailleur d’usine.' },
        {
          label: 'ils sont propriétaires de l’usine',
          why: 'Les ouvriers ne possèdent pas l’usine : ils y travaillent contre un salaire.',
        },
      ],
      gap: [
        'L’industrie réunit une division du travail et des effectifs importants de ',
        '.',
        ['salariés', 'salaries', 'salarié'],
      ],
      explain: 'Les salariés reçoivent un salaire : l’industrie développe le salariat.',
    },
    {
      ...P.urbain,
      q: 'Au milieu du XIXe siècle, quel pays est déjà majoritairement urbain (depuis 1851) ?',
      a: 'l’Angleterre',
      wrong: [
        { label: 'la France', why: 'La France reste majoritairement rurale jusqu’aux années 1930.' },
        {
          label: 'aucun pays d’Europe',
          why: 'Un pays est majoritairement urbain depuis 1851, parce qu’il s’est industrialisé le premier.',
        },
        {
          label: 'l’Irlande',
          why: 'L’Irlande ne connaît pas ce développement économique : beaucoup de ses habitants émigrent.',
        },
      ],
      gap: ['Depuis 1851, l’', ' est un pays majoritairement urbain.', ['Angleterre']],
      explain: 'Les usines attirent les habitants vers les villes, d’abord en Angleterre.',
    },
    {
      ...P.emigration,
      q: 'Que font beaucoup d’habitants des régions qui ne se développent pas économiquement, comme en Irlande ?',
      a: 'ils émigrent',
      wrong: [
        { label: 'ils deviennent tous patrons', why: 'Les régions pauvres n’offrent pas ces débouchés.' },
        {
          label: 'ils créent aussitôt de grandes usines',
          why: 'C’est justement le développement économique qui leur manque.',
        },
        {
          label: 'ils restent sur place et la population augmente',
          why: 'Beaucoup tentent au contraire leur chance ailleurs.',
        },
      ],
      gap: ['Quitter son pays pour s’installer ailleurs, c’est l’', '.', ['émigration', 'emigration']],
      explain: 'L’Europe devient un espace d’émigration, comme on le voit avec l’Irlande ou l’Italie.',
    },
    {
      ...P.questionSociale,
      q: 'Quel sort désigne-t-on surtout quand on parle de « la question sociale » ?',
      a: 'celui des ouvriers',
      wrong: [
        { label: 'celui des rois', why: 'La question sociale ne concerne pas le sort des souverains.' },
        { label: 'celui des seigneurs', why: 'La seigneurie appartient à une autre époque.' },
        {
          label: 'celui des grands banquiers',
          why: 'La « question sociale » vise les travailleurs dans la difficulté.',
        },
      ],
      gap: ['La « question sociale » concerne surtout le sort des ', '.', ['ouvriers', 'ouvrier']],
      explain: 'L’insécurité et la pénibilité du monde ouvrier en font un problème de toute la société.',
    },
    {
      ...P.socialisme,
      q: 'Quelle doctrine critique le capitalisme et veut une société plus égalitaire ?',
      a: 'le socialisme',
      wrong: [
        { label: 'l’absolutisme', why: 'L’absolutisme est un pouvoir royal sans limite, d’un siècle antérieur.' },
        {
          label: 'le despotisme éclairé',
          why: 'C’est une conception du pouvoir des monarques du XVIIIe siècle.',
        },
        { label: 'le capitalisme', why: 'La doctrine cherchée critique justement le capitalisme.' },
      ],
      gap: [
        'La doctrine qui critique le capitalisme et veut une société plus égalitaire s’appelle le ',
        '.',
        ['socialisme'],
      ],
      explain:
        'Le socialisme se développe en Europe à partir du XIXe siècle, à la suite de la révolution industrielle.',
    },
    {
      ...P.crise,
      q: 'Comment commence la crise de 1873 ?',
      a: 'par une crise bancaire',
      wrong: [
        { label: 'par une famine en Irlande', why: 'La grande famine irlandaise date des années 1840.' },
        { label: 'par la fin du charbon', why: 'Le charbon reste utilisé : la crise a une autre origine.' },
        { label: 'par une révolte d’esclaves', why: 'Il ne s’agit pas d’une révolte mais d’un choc financier.' },
      ],
      gap: ['La crise de 1873 commence par une crise ', '.', ['bancaire']],
      explain: 'Les crises périodiques frappent l’économie industrielle et le travail.',
    },
    {
      ...P.transports,
      q: 'Quelle grande transformation naît avec l’industrialisation et rapproche les territoires ?',
      a: 'la révolution des transports',
      wrong: [
        { label: 'la réforme grégorienne', why: 'C’est une réforme de l’Église au Moyen Âge.' },
        { label: 'les grandes découvertes', why: 'Elles datent de la fin du XVe et du XVIe siècle.' },
        { label: 'la disparition des ports', why: 'Les ports se développent au contraire fortement.' },
      ],
      gap: ['L’industrialisation fait naître une profonde révolution des ', '.', ['transports', 'transport']],
      explain: 'Chemins de fer, ports et canaux permettent d’acheminer marchandises et personnes.',
    },
  ],
  paires3: [
    ['Salariat', 'Travail rémunéré par un salaire'],
    ['Émigration', 'Départ pour s’installer dans un autre pays'],
    ['Socialisme', 'Doctrine qui critique le capitalisme'],
  ],
  paires5: [
    ['Première révolution industrielle', 'Charbon et moteur à vapeur'],
    ['Seconde révolution industrielle', 'Électricité, pétrole et moteur à explosion'],
    ['Question sociale', 'Problème posé par le sort des ouvriers'],
    ['Angleterre', 'Pays pionnier du syndicalisme'],
    ['Irlande', 'Grande famine à partir de 1845'],
  ],
  frise: [
    { ...P.famine, label: 'La grande famine irlandaise commence', date: '1845' },
    { ...P.juin1848, label: 'En France, les journées de juin', date: '1848' },
    { ...P.urbain, label: 'L’Angleterre devient majoritairement urbaine', date: '1851' },
    { ...P.crise, label: 'Une crise bancaire ouvre une longue crise', date: '1873' },
    { ...P.crise, label: 'La longue phase de ralentissement s’achève', date: '1896' },
  ],
  libres: [
    {
      ...P.debuts,
      q: 'dans quel pays la « révolution industrielle » commence-t-elle ?',
      accepted: ['Angleterre', 'l’Angleterre', 'en Angleterre'],
      traps: [
        { text: 'France', why: 'La France s’industrialise à partir des années 1820 et 1830.' },
        { text: 'Allemagne', why: 'L’Allemagne s’industrialise à partir du milieu du XIXe siècle.' },
      ],
      explain: 'Les débuts ont lieu en Angleterre, au dernier tiers du XVIIIe siècle.',
    },
    {
      ...P.salariat,
      q: 'quel nom désigne le régime où le travail est rémunéré par un salaire ?',
      accepted: ['salariat', 'le salariat'],
      traps: [
        { text: 'servage', why: 'Le servage est une dépendance des paysans au Moyen Âge.' },
        { text: 'esclavage', why: 'L’esclave n’est pas payé : il appartient à un maître.' },
      ],
      explain: 'Au XIXe siècle, l’industrie entraîne l’essor du salariat.',
    },
    {
      ...P.socialisme,
      q: 'quelle doctrine, née au XIXe siècle de la critique du capitalisme, veut une société plus égalitaire ?',
      accepted: ['socialisme', 'le socialisme'],
      traps: [
        { text: 'absolutisme', why: 'L’absolutisme désigne un pouvoir sans limite du monarque.' },
        { text: 'capitalisme', why: 'Cette doctrine critique justement le capitalisme.' },
      ],
      explain: 'Il s’agit du socialisme.',
    },
    {
      ...P.premiere,
      q: 'quelle énergie, extraite des mines, marque la première révolution industrielle ?',
      accepted: ['charbon', 'le charbon', 'houille', 'la houille'],
      traps: [
        { text: 'pétrole', why: 'Le pétrole marque la seconde révolution industrielle.' },
        { text: 'électricité', why: 'L’électricité marque la seconde révolution industrielle.' },
      ],
      explain: 'C’est le charbon qui alimente le moteur à vapeur.',
    },
  ],
  docs: [
    {
      title: 'Le carnet d’une ouvrière',
      lines: [
        'Un carnet fictif de 1840 décrit la vie d’une famille dans une ville textile française.',
        '« Je travaille à la filature, de longues heures, contre un petit salaire. »',
        '« Mon mari aussi est payé à la semaine ; une maladie nous plongerait dans la misère. »',
        '« Les machines tournent grâce à la vapeur. »',
      ],
      qs: [
        {
          ...P.caracteres,
          q: 'Quel statut de travailleur le texte montre-t-il ?',
          a: 'des salariés',
          wrong: [
            { label: 'des esclaves', why: 'Les personnages sont payés : ils ne sont pas la propriété d’un maître.' },
            { label: 'des artisans patrons', why: 'Ils travaillent pour un employeur contre un salaire.' },
          ],
          explain: 'Travailler contre un salaire, c’est être salarié : l’industrie développe le salariat.',
        },
        {
          ...P.condition,
          q: 'Que montre ce carnet sur les ouvriers avant le milieu du siècle ?',
          a: 'des conditions de vie et de travail pénibles',
          wrong: [
            { label: 'une vie confortable et sûre', why: 'Le texte évoque la fatigue et le risque de misère.' },
            { label: 'la fin du travail des femmes', why: 'La narratrice travaille justement à la filature.' },
          ],
          explain: 'Longues heures, petit salaire, risque de misère : la condition ouvrière est très dure.',
        },
      ],
    },
    {
      title: 'Un voyageur en 1890',
      lines: [
        'Un récit fictif décrit une ville industrielle à la fin du XIXe siècle.',
        '« Les rues sont éclairées à l’électricité et l’on voit passer une voiture à pétrole. »',
        '« Pourtant, le charbon fait toujours tourner bien des usines. »',
      ],
      qs: [
        {
          ...P.seconde,
          q: 'À quelle phase de l’industrialisation ces nouveautés appartiennent-elles ?',
          a: 'à la seconde révolution industrielle',
          wrong: [
            {
              label: 'à la première révolution industrielle',
              why: 'La première repose surtout sur le charbon et la vapeur, pas sur l’électricité et le pétrole.',
            },
            { label: 'à l’économie de plantation', why: 'L’économie de plantation concerne les cultures coloniales.' },
          ],
          explain: 'Électricité et pétrole caractérisent la seconde révolution industrielle, après 1870.',
        },
      ],
    },
    {
      title: 'La traversée de Seán',
      lines: [
        'Une lettre fictive, datée de 1847, est écrite par un jeune Irlandais.',
        '« La famine ravage notre campagne depuis deux ans. »',
        '« Je vends le peu que nous avons et je m’embarque pour l’Amérique. »',
      ],
      qs: [
        {
          ...P.famine,
          q: 'Quel phénomène la lettre illustre-t-elle ?',
          a: 'l’émigration des Irlandais vers les États-Unis',
          wrong: [
            {
              label: 'l’arrivée massive de familles en Irlande',
              why: 'Le jeune homme quitte l’Irlande : il ne s’y installe pas.',
            },
            { label: 'la conquête coloniale de l’Irlande', why: 'La lettre raconte un départ, pas une conquête.' },
          ],
          explain: 'La grande famine, commencée en 1845, accroît les départs vers les États-Unis.',
        },
      ],
    },
    {
      title: 'L’Europe en mouvement',
      lines: [
        'Un résumé fictif évoque une année agitée.',
        '« En 1848, des révolutions éclatent dans plusieurs pays d’Europe. »',
        '« En juin, à Paris, des ouvriers se soulèvent. »',
        '« Partout, on parle de nations et de droit au travail. »',
      ],
      qs: [
        {
          ...P.revolution1848,
          q: 'Quelles deux idées la révolution de 1848 fait-elle évoluer ?',
          a: 'l’idée de nationalité et le droit au travail',
          wrong: [
            {
              label: 'la traite négrière et la plantation',
              why: 'Ce ne sont pas les idées que le texte met en avant.',
            },
            {
              label: 'le droit divin et les privilèges',
              why: 'Ces idées de l’Ancien Régime ne sont pas celles de 1848.',
            },
          ],
          explain: 'La révolution de 1848 fait évoluer à la fois l’idée de nationalité et celle du droit au travail.',
        },
        {
          ...P.juin1848,
          q: 'Que révèlent les journées de juin 1848 en France ?',
          a: 'de fortes divisions sociales',
          wrong: [
            {
              label: 'la disparition des ouvriers',
              why: 'Le texte montre au contraire des ouvriers qui se soulèvent.',
            },
            { label: 'la fin de toute industrie', why: 'Un soulèvement social ne met pas fin à l’industrie.' },
          ],
          explain: 'Ces journées révèlent l’ampleur des clivages sociaux.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : conquêtes et sociétés coloniales ———

const coloniales: Notion = {
  id: 'h4-conquetes-coloniales',
  title: 'Conquêtes et sociétés coloniales',
  hint: 'Relis le mémo : pourquoi et comment les Européens conquièrent, quels territoires la France domine et comment vit une société coloniale.',
  memo: [
    'Au XIXe siècle, de nouvelles **conquêtes coloniales** renforcent la domination de l’Europe sur le monde, qui aboutit à la colonisation des trois quarts de la planète. L’Europe a pour elle une supériorité militaire et maritime ; les États rivaux cherchent du prestige, des points d’appui, des **matières premières** et des **débouchés**.',
    'Une **colonie** est un territoire conquis hors d’Europe, que sa **métropole** administre et exploite ; dans une colonie de peuplement, des colons de la métropole s’installent en nombre. Dans un **protectorat**, un État puissant contrôle l’administration, la sécurité intérieure et les relations extérieures d’un autre en lui laissant certains pouvoirs. Les **indigènes** sont les populations autochtones d’un pays colonisé ou sous protectorat.',
    'Les conquêtes se font par la violence ou par des traités inégaux et rencontrent de vives **résistances**. Une **société coloniale** est marquée par la hiérarchie des pouvoirs, l’inégalité des droits et une inégalité de considération qui va jusqu’au racisme ; des résistances et des contacts avec des élites locales préparent l’émancipation. Repères pour l’empire français : 1830, début de la conquête de l’Algérie ; 1881, protectorat sur la Tunisie ; 1883 sur l’Annam et 1885 sur le Tonkin ; en 1885, Jules Ferry défend la colonisation devant les députés, au nom d’idées économiques, de civilisation et patriotiques, face à Clemenceau ; la même année, la conférence de Berlin est un moment clé du partage de l’Afrique ; en 1896, les Abyssins battent les Italiens à Adoua. Gallieni (Madagascar) et Lyautey (Maroc) comptent aussi parmi les acteurs.',
  ],
  faits: [
    {
      ...P.colonie,
      q: 'Qu’est-ce qu’une colonie, au sens de l’histoire contemporaine ?',
      a: 'un territoire conquis par une puissance européenne, qui l’administre et l’exploite',
      wrong: [
        {
          label: 'un État indépendant qui commerce librement avec l’Europe',
          why: 'Une colonie n’est pas indépendante : une puissance la domine.',
        },
        { label: 'un groupe de vacances pour des enfants', why: 'Ce sens du mot n’a rien d’historique ici.' },
        {
          label: 'une ville d’Europe gouvernée par ses habitants',
          why: 'La colonie est située hors d’Europe et dépend d’une puissance.',
        },
      ],
      gap: ['Un territoire hors d’Europe, conquis et administré par une puissance, est une ', '.', ['colonie']],
      explain: 'La puissance y installe ses ressortissants, l’exploite et la contrôle militairement.',
    },
    {
      ...P.metropole,
      q: 'Comment appelle-t-on l’État dont dépendent des colonies ?',
      a: 'la métropole',
      wrong: [
        { label: 'le protectorat', why: 'Le protectorat est un régime de tutelle sur un autre État.' },
        { label: 'le comptoir', why: 'Un comptoir est un établissement de commerce installé au loin.' },
        { label: 'la colonie de peuplement', why: 'C’est l’une des colonies, pas l’État qui les domine.' },
      ],
      gap: ['L’État considéré par rapport à ses colonies est appelé la ', '.', ['métropole', 'metropole']],
      explain: 'La métropole est le pays qui domine les colonies.',
    },
    {
      ...P.protectorat,
      q: 'Dans quel régime un État puissant contrôle-t-il un autre État en lui laissant certains pouvoirs ?',
      a: 'le protectorat',
      wrong: [
        { label: 'la république', why: 'Une république est un régime politique d’un État, pas une tutelle.' },
        {
          label: 'la monarchie absolue',
          why: 'C’est le pouvoir sans limite d’un roi, pas la tutelle d’un État sur un autre.',
        },
        {
          label: 'l’indépendance',
          why: 'Un État indépendant n’est contrôlé par aucun autre.',
        },
      ],
      gap: ['Ce régime de tutelle, qui laisse certains pouvoirs à l’État dominé, est le ', '.', ['protectorat']],
      explain: 'Le protectorat contrôle l’administration, la sécurité et les relations extérieures.',
    },
    {
      ...P.superiorite,
      q: 'Qu’est-ce qui donne à l’Europe un avantage décisif dans les conquêtes ?',
      a: 'ses progrès techniques, qui donnent une supériorité militaire et maritime',
      wrong: [
        { label: 'une population moins nombreuse que partout ailleurs', why: 'Ce n’est pas un avantage militaire.' },
        { label: 'l’absence de navires', why: 'La maîtrise des mers est au contraire essentielle.' },
        {
          label: 'le refus de commercer avec les autres continents',
          why: 'La colonisation s’accompagne de la croissance des échanges.',
        },
      ],
      gap: ['Les progrès techniques donnent à l’Europe une supériorité militaire et ', ' considérable.', ['maritime']],
      explain: 'Armes et navires modernes facilitent la conquête.',
    },
    {
      ...P.motifs,
      q: 'Que cherchent notamment les États rivaux dans la conquête coloniale ?',
      a: 'des matières premières et des débouchés',
      wrong: [
        {
          label: 'la fin de leur commerce',
          why: 'La colonisation vise au contraire à développer les échanges.',
        },
        { label: 'la perte de leur puissance', why: 'La conquête est recherchée pour la puissance et le prestige.' },
        {
          label: 'des terres sans aucune ressource',
          why: 'Les ressources des territoires conquis sont convoitées.',
        },
      ],
      gap: [
        'Les États cherchent des sources de matières premières et des ',
        '.',
        ['débouchés', 'debouches', 'débouché'],
      ],
      explain: 'Les débouchés sont les marchés où vendre les produits.',
    },
    {
      ...P.algerie,
      q: 'Quelle conquête la France commence-t-elle en 1830 ?',
      a: 'celle de l’Algérie',
      wrong: [
        { label: 'celle de l’Inde', why: 'L’Inde est dominée par l’Angleterre.' },
        { label: 'celle du Canada', why: 'La France a abandonné le Canada en 1763.' },
        { label: 'celle de la Tunisie', why: 'La Tunisie devient un protectorat plus tard, en 1881.' },
      ],
      gap: ['En 1830, la France commence la conquête de l’', '.', ['Algérie', 'Algerie']],
      explain: 'La conquête commencée en 1830 doit asseoir la puissance française en Méditerranée.',
    },
    {
      ...P.inegalite,
      q: 'Qu’est-ce qui caractérise les rapports dans une société coloniale ?',
      a: 'la hiérarchie des pouvoirs et l’inégalité des droits',
      wrong: [
        {
          label: 'l’égalité complète des droits entre tous',
          why: 'Les colonisés n’ont pas les mêmes droits que les colonisateurs.',
        },
        {
          label: 'l’absence de toute différence entre colons et colonisés',
          why: 'Les deux groupes sont justement dans des situations très inégales.',
        },
        {
          label: 'la domination des colonisés sur les colons',
          why: 'C’est le rapport inverse qui s’impose dans une situation coloniale.',
        },
      ],
      gap: [
        'Dans une société coloniale, les droits sont marqués par l’',
        ' entre les habitants.',
        ['inégalité', 'inegalite'],
      ],
      explain: 'La hiérarchie et l’inégalité vont jusqu’au racisme.',
    },
    {
      ...P.resistances,
      q: 'Comment les populations réagissent-elles souvent aux conquêtes ?',
      a: 'par de vives résistances',
      wrong: [
        {
          label: 'toujours par un accord enthousiaste',
          why: 'Des conquêtes se heurtent à des oppositions armées ou politiques.',
        },
        { label: 'en ignorant les conquérants', why: 'La conquête bouleverse la vie : elle suscite des réactions.' },
        {
          label: 'en demandant à être conquises partout',
          why: 'La violence des guerres de conquête montre le contraire.',
        },
      ],
      gap: ['Les conquêtes ne se sont pas faites sans de vives ', '.', ['résistances', 'resistances', 'résistance']],
      explain: 'Des résistances se manifestent tout au long de la période.',
    },
    {
      ...P.berlin,
      q: 'Quelle réunion de 1885 est un moment clé du partage de l’Afrique ?',
      a: 'la conférence de Berlin',
      wrong: [
        { label: 'le traité de Paris', why: 'Le traité de Paris de 1763 concerne notamment l’Amérique du Nord.' },
        { label: 'l’exposition universelle de Paris', why: 'Une exposition n’est pas une conférence de partage.' },
        { label: 'la conférence de la nuit du 4 août', why: 'La nuit du 4 août 1789 abolit les privilèges en France.' },
      ],
      gap: ['En 1885, la conférence de ', ' marque le partage colonial de l’Afrique.', ['Berlin']],
      explain: 'La conférence de Berlin en fixe des règles entre puissances.',
    },
    {
      ...P.clemenceau,
      q: 'Face à quel adversaire Jules Ferry défend-il la colonisation en 1885 ?',
      a: 'Clemenceau',
      wrong: [
        { label: 'Napoléon Bonaparte', why: 'Bonaparte appartient au début du siècle.' },
        { label: 'Colbert', why: 'Colbert est un ministre de Louis XIV.' },
        { label: 'Victor Schoelcher', why: 'Schoelcher est connu pour l’abolition de l’esclavage en 1848.' },
      ],
      gap: ['En 1885, Jules Ferry s’oppose à ', ' sur la politique coloniale.', ['Clemenceau', 'Clémenceau']],
      explain: 'La colonisation est débattue : tous les responsables politiques ne l’approuvent pas.',
    },
  ],
  paires3: [
    ['Colonie', 'Territoire conquis et administré par une puissance'],
    ['Métropole', 'État considéré par rapport à ses colonies'],
    ['Protectorat', 'Tutelle qui laisse certains pouvoirs à un État'],
  ],
  paires5: [
    ['Algérie', 'Conquête commencée en 1830'],
    ['Tunisie', 'Protectorat français en 1881'],
    ['Madagascar', 'Territoire associé à Gallieni'],
    ['Maroc', 'Territoire associé à Lyautey'],
    ['Adoua', 'Victoire des Abyssins sur les Italiens en 1896'],
  ],
  frise: [
    { ...P.algerie, label: 'La France commence la conquête de l’Algérie', date: '1830' },
    { ...P.protectorats, label: 'La Tunisie devient un protectorat français', date: '1881' },
    { ...P.protectorats, label: 'L’Annam devient un protectorat français', date: '1883' },
    { ...P.berlin, label: 'Conférence de Berlin sur l’Afrique', date: '1885' },
    { ...P.adoua, label: 'Les Abyssins battent les Italiens à Adoua', date: '1896' },
  ],
  libres: [
    {
      ...P.metropole,
      q: 'quel nom désigne un État par rapport à ses colonies ?',
      accepted: ['métropole', 'metropole', 'la métropole', 'une métropole'],
      traps: [
        { text: 'protectorat', why: 'Le protectorat est un régime de tutelle sur un autre État.' },
        { text: 'colonie', why: 'La colonie est le territoire dominé, pas l’État qui domine.' },
      ],
      explain: 'On parle de la métropole.',
    },
    {
      ...P.protectorats,
      q: 'comment appelle-t-on le régime de tutelle imposé à la Tunisie en 1881 ?',
      accepted: ['protectorat', 'un protectorat', 'le protectorat'],
      traps: [
        { text: 'colonie de peuplement', why: 'La Tunisie conserve certaines institutions : c’est une tutelle.' },
        { text: 'indépendance', why: 'La Tunisie perd justement une partie de son autonomie.' },
      ],
      explain: 'La Tunisie devient un protectorat français.',
    },
    {
      ...P.indigene,
      q: 'quel mot de l’époque désigne les populations autochtones d’un pays colonisé ?',
      accepted: ['indigènes', 'indigène', 'indigenes', 'indigene', 'les indigènes'],
      traps: [
        { text: 'colons', why: 'Les colons sont ceux qui viennent s’installer depuis la métropole.' },
        { text: 'émigrants', why: 'Les émigrants quittent leur pays : les autochtones y vivent.' },
      ],
      explain: 'Ce terme, lié au vocabulaire colonial, désigne les populations autochtones.',
    },
    {
      ...P.berlin,
      q: 'dans quelle ville se tient, en 1885, la conférence qui marque le partage de l’Afrique ?',
      accepted: ['Berlin'],
      traps: [
        { text: 'Paris', why: 'La conférence de 1885 sur l’Afrique ne se tient pas à Paris.' },
        { text: 'Londres', why: 'La conférence de 1885 sur l’Afrique ne se tient pas à Londres.' },
      ],
      explain: 'Il s’agit de la conférence de Berlin.',
    },
  ],
  docs: [
    {
      title: 'Un débat à la Chambre',
      lines: [
        'Un compte rendu fictif résume une séance de députés en 1885.',
        'Un orateur soutient la colonisation : il faut, dit-il, trouver des marchés pour nos usines.',
        'Un autre député lui répond que l’on ne peut imposer sa loi à des peuples par la force.',
      ],
      qs: [
        {
          ...P.ferry,
          q: 'Quel argument le premier orateur avance-t-il ?',
          a: 'un argument économique : trouver des débouchés',
          wrong: [
            { label: 'un argument religieux : convertir les peuples', why: 'Le texte parle de marchés et d’usines.' },
            {
              label: 'un argument contre l’industrie',
              why: 'Il veut au contraire aider les usines à vendre.',
            },
          ],
          explain: 'Les idées économiques font partie des justifications avancées par Jules Ferry.',
        },
        {
          ...P.clemenceau,
          q: 'Que montre la réponse du second député ?',
          a: 'la colonisation est critiquée à son époque même',
          wrong: [
            { label: 'tous les députés approuvent la conquête', why: 'Le second député s’y oppose.' },
            {
              label: 'la colonisation est interdite par la loi',
              why: 'On débat justement pour savoir s’il faut la mener.',
            },
          ],
          explain: 'Des responsables politiques, comme Clemenceau, s’opposent à cette politique.',
        },
      ],
    },
    {
      title: 'Un village sous administration',
      lines: [
        'Un récit fictif décrit un village d’un territoire colonisé.',
        'Les colons possèdent les meilleures terres et font les lois.',
        'Les habitants autochtones n’ont pas les mêmes droits et ne peuvent pas décider.',
        'Certains d’entre eux refusent de se soumettre.',
      ],
      qs: [
        {
          ...P.inegalite,
          q: 'Quelle caractéristique de la société coloniale ce récit montre-t-il ?',
          a: 'l’inégalité des droits entre colons et colonisés',
          wrong: [
            { label: 'l’égalité devant la loi', why: 'Seuls les colons décident : les droits sont inégaux.' },
            {
              label: 'la disparition de toute hiérarchie',
              why: 'Le récit montre au contraire un pouvoir hiérarchisé.',
            },
          ],
          explain: 'La hiérarchie des pouvoirs et l’inégalité des droits marquent cette société.',
        },
        {
          ...P.resistances,
          q: 'Comment appelle-t-on le refus de se soumettre évoqué à la dernière ligne ?',
          a: 'une résistance',
          wrong: [
            { label: 'une émigration', why: 'Les habitants ne partent pas : ils refusent de se soumettre.' },
            { label: 'un protectorat', why: 'Le protectorat est un régime de tutelle, pas un refus.' },
          ],
          explain: 'La colonisation rencontre des résistances tout au long de la période.',
        },
      ],
    },
    {
      title: 'Les frontières sur la carte',
      lines: [
        'Un article fictif raconte le tracé de zones d’influence en Afrique.',
        'En 1885, des puissances européennes discutent à Berlin des règles à suivre.',
        'Les populations africaines ne prennent pas part à ces discussions.',
      ],
      qs: [
        {
          ...P.berlin,
          q: 'De quel processus cet article parle-t-il ?',
          a: 'du partage colonial de l’Afrique entre puissances européennes',
          wrong: [
            {
              label: 'de l’indépendance des États africains',
              why: 'Les puissances étendent au contraire leur domination.',
            },
            { label: 'de la traite atlantique du XVIIIe siècle', why: 'Le texte situe la discussion en 1885.' },
          ],
          explain: 'La conférence de Berlin est un moment clé de ce partage.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : l'abolition de l'esclavage ———

const abolition: Notion = {
  id: 'h4-abolition-esclavage',
  title: 'L’abolition de l’esclavage, un long processus',
  hint: 'Relis le mémo : retrouve les dates, les pays, les personnes qui luttent et les décisions prises, dans l’ordre.',
  memo: [
    'L’**abolition** de l’**esclavage** est l’aboutissement d’un **long processus**. Depuis 1685, la vie des esclaves des Antilles est régie par le **Code noir**. Au XVIIIe siècle, des voix réclament l’abolition au nom de la liberté et de l’égalité ; en Angleterre, le mouvement **abolitionniste** a un large écho, et en France la Société des Amis des Noirs fait pression.',
    'À Saint-Domingue, des esclaves se révoltent en août 1791 : la révolte mène à l’indépendance en 1804, sous le nom d’Haïti. L’esclavage est aboli à Saint-Domingue en 1793, puis dans les colonies françaises par la Convention en 1794, au nom du principe que les hommes sont libres et égaux en droits ; Napoléon le rétablit en 1802.',
    'La **traite** est interdite par l’Angleterre à ses ressortissants en 1808, puis par la France en 1818. En 1848, sous la **Deuxième République**, **Victor Schoelcher**, chef de file des abolitionnistes français, fait promulguer le **décret** du 27 avril : l’esclavage est définitivement aboli en France. La France rejoint alors l’Angleterre ; Schoelcher obtient aussi des écoles gratuites et obligatoires dans les colonies. Si la traite atlantique disparaît peu à peu, le nombre d’esclaves augmente en Afrique au XIXe siècle. Un esclave libéré est un **affranchi**.',
  ],
  faits: [
    {
      ...P.decret,
      q: 'Qui fait promulguer le décret du 27 avril 1848 abolissant l’esclavage ?',
      a: 'Victor Schoelcher',
      wrong: [
        { label: 'Napoléon Bonaparte', why: 'Bonaparte rétablit l’esclavage en 1802.' },
        { label: 'Colbert', why: 'Colbert est lié au Code noir de 1685, un siècle et demi plus tôt.' },
        { label: 'Jules Ferry', why: 'Jules Ferry défend la colonisation à la fin du siècle, après 1848.' },
      ],
      gap: ['Le décret du 27 avril 1848 doit beaucoup à Victor ', '.', ['Schoelcher', 'Schœlcher']],
      explain: 'Schoelcher, nommé au gouvernement de la Deuxième République, obtient ce décret.',
    },
    {
      ...P.decret,
      q: 'En quelle année l’esclavage est-il définitivement aboli en France ?',
      a: 'en 1848',
      wrong: [
        { label: 'en 1794', why: 'L’abolition de 1794 n’est pas définitive : Napoléon rétablit l’esclavage.' },
        { label: 'en 1802', why: '1802 est l’année du rétablissement.' },
        { label: 'en 1789', why: 'La Révolution commence en 1789 sans abolir encore l’esclavage.' },
      ],
      gap: ['L’esclavage est définitivement aboli en France en ', '.', ['1848']],
      explain: 'Le décret du 27 avril 1848 met fin à l’esclavage dans les colonies françaises.',
    },
    {
      ...P.trois,
      q: 'Que se passe-t-il en 1802 pour l’esclavage dans les colonies françaises ?',
      a: 'Napoléon le rétablit',
      wrong: [
        { label: 'il est aboli pour la première fois', why: 'La première abolition date de 1794.' },
        { label: 'il est aboli définitivement', why: 'L’abolition définitive date de 1848.' },
        { label: 'la France interdit la traite', why: 'La France interdit la traite en 1818.' },
      ],
      gap: ['En 1802, l’esclavage est ', ' par Napoléon.', ['rétabli', 'retabli', 'restauré', 'restaure']],
      explain: 'La liberté acquise en 1794 est remise en cause en 1802.',
    },
    {
      ...P.principe,
      q: 'Au nom de quel principe la République abolit-elle l’esclavage en 1794 ?',
      a: 'tous les hommes sont libres et égaux en droits',
      wrong: [
        { label: 'le roi est maître de ses sujets', why: 'La France est alors une République.' },
        {
          label: 'les maîtres ont un droit de propriété sur les personnes',
          why: 'C’est ce que l’abolition remet justement en cause.',
        },
        { label: 'seuls les nobles sont libres', why: 'La Révolution rejette ces privilèges de naissance.' },
      ],
      gap: [
        'L’abolition de 1794 s’appuie sur le principe que tous les hommes sont libres et ',
        ' en droits.',
        ['égaux', 'egaux'],
      ],
      explain: 'La liberté et l’égalité des droits fondent l’abolition.',
    },
    {
      ...P.revolte,
      q: 'Où les esclaves se révoltent-ils en août 1791, avant de conduire à la naissance d’un nouvel État ?',
      a: 'à Saint-Domingue',
      wrong: [
        { label: 'à Madagascar', why: 'Madagascar est une conquête coloniale plus tardive.' },
        { label: 'en Algérie', why: 'La conquête de l’Algérie commence en 1830.' },
        { label: 'au Canada', why: 'Le Canada n’est pas le lieu de cette révolte.' },
      ],
      gap: ['En août 1791, les esclaves de Saint-', ' se révoltent.', ['Domingue']],
      explain: 'La révolte de Saint-Domingue conduit à l’indépendance.',
    },
    {
      ...P.haiti,
      q: 'Quel nom prend Saint-Domingue à son indépendance en 1804 ?',
      a: 'Haïti',
      wrong: [
        { label: 'Martinique', why: 'La Martinique est une autre île, restée colonie.' },
        { label: 'Guadeloupe', why: 'La Guadeloupe est une autre île des Antilles.' },
        { label: 'Réunion', why: 'La Réunion est dans l’océan Indien.' },
      ],
      gap: ['En 1804, Saint-Domingue devient indépendante sous le nom d’', '.', ['Haïti', 'Haiti']],
      explain: 'Haïti est la première république issue d’une révolte d’esclaves.',
    },
    {
      ...P.traiteAnglaise,
      q: 'Quel pays interdit la traite à ses ressortissants en 1808 ?',
      a: 'l’Angleterre',
      wrong: [
        { label: 'la France', why: 'La France interdit la traite en 1818.' },
        { label: 'le Portugal', why: 'La décision de 1808 est celle d’une autre puissance maritime.' },
        { label: 'l’Espagne', why: 'La décision de 1808 est celle de l’Angleterre.' },
      ],
      gap: ['En 1808, l’', ' interdit la traite à ses ressortissants.', ['Angleterre']],
      explain: 'La marine britannique arraisonne ensuite des navires négriers.',
    },
    {
      ...P.traiteFrancaise,
      q: 'En quelle année la France interdit-elle la traite ?',
      a: 'en 1818',
      wrong: [
        { label: 'en 1848', why: 'En 1848, c’est l’esclavage lui-même qui est aboli.' },
        { label: 'en 1802', why: '1802 est l’année du rétablissement de l’esclavage.' },
        { label: 'en 1831', why: '1831 est l’année où la France accepte le droit de visite des navires.' },
      ],
      gap: ['La France interdit la traite en ', '.', ['1818']],
      explain: 'Interdire la traite ne suffit pas à abolir l’esclavage.',
    },
    {
      ...P.abolitionnisme,
      q: 'Comment appelle-t-on la doctrine favorable à l’abolition de l’esclavage ?',
      a: 'l’abolitionnisme',
      wrong: [
        { label: 'l’absolutisme', why: 'L’absolutisme concerne le pouvoir du roi.' },
        { label: 'le socialisme', why: 'Le socialisme critique le capitalisme.' },
        { label: 'le protectorat', why: 'C’est un régime de tutelle sur un État.' },
      ],
      gap: ['La doctrine favorable à l’abolition de l’esclavage est l’', '.', ['abolitionnisme']],
      explain: 'Les abolitionnistes luttent contre l’esclavage et la traite.',
    },
    {
      ...P.afrique,
      q: 'Que devient le nombre d’esclaves sur le continent africain au XIXe siècle ?',
      a: 'il augmente',
      wrong: [
        {
          label: 'il tombe à zéro dès 1808',
          why: 'L’interdiction anglaise de 1808 ne supprime pas l’esclavage partout.',
        },
        { label: 'il disparaît en 1848', why: 'Le décret de 1848 concerne les colonies françaises.' },
        { label: 'l’esclavage n’y existe pas', why: 'L’esclavage existe bien en Afrique à cette période.' },
      ],
      gap: ['Au XIXe siècle, le nombre d’esclaves sur le continent africain ', '.', ['augmente']],
      explain: 'La fin de la traite atlantique ne met pas fin à l’esclavage dans le monde.',
    },
  ],
  paires3: [
    ['Abolition', 'Action d’abolir, de supprimer'],
    ['Affranchi', 'Personne libérée de sa servitude'],
    ['Abolitionnisme', 'Doctrine favorable à la fin de l’esclavage'],
  ],
  paires5: [
    ['1794', 'Abolition par la Convention'],
    ['1802', 'Rétablissement par Napoléon'],
    ['1808', 'L’Angleterre interdit la traite'],
    ['1848', 'Abolition définitive en France'],
    ['Haïti', 'Nom pris par Saint-Domingue indépendante'],
  ],
  frise: [
    { ...P.revolte, label: 'Révolte des esclaves de Saint-Domingue', date: '1791' },
    { ...P.trois, label: 'La Convention abolit l’esclavage', date: '1794' },
    { ...P.trois, label: 'Napoléon rétablit l’esclavage', date: '1802' },
    { ...P.haiti, label: 'Haïti devient indépendante', date: '1804' },
    { ...P.traiteAnglaise, label: 'L’Angleterre interdit la traite', date: '1808' },
    { ...P.decret, label: 'Décret d’abolition définitive en France', date: '1848' },
  ],
  libres: [
    {
      ...P.decret,
      q: 'quel homme politique fait promulguer le décret d’abolition du 27 avril 1848 ?',
      accepted: ['Victor Schoelcher', 'Schoelcher', 'Victor Schœlcher', 'Schœlcher'],
      traps: [
        { text: 'Napoléon', why: 'Napoléon rétablit l’esclavage en 1802.' },
        { text: 'Colbert', why: 'Colbert est lié au Code noir de 1685.' },
      ],
      explain: 'C’est Victor Schoelcher.',
    },
    {
      ...P.haiti,
      q: 'quel nom prend Saint-Domingue à son indépendance en 1804 ?',
      accepted: ['Haïti', 'Haiti'],
      traps: [
        { text: 'Martinique', why: 'La Martinique est une autre île.' },
        { text: 'Guadeloupe', why: 'La Guadeloupe est une autre île.' },
      ],
      explain: 'Saint-Domingue devient Haïti.',
    },
    {
      ...P.affranchi,
      q: 'comment appelle-t-on une personne libérée de sa servitude ?',
      accepted: ['affranchi', 'un affranchi', 'affranchie', 'une affranchie'],
      traps: [
        { text: 'colon', why: 'Un colon est un habitant venu de la métropole.' },
        { text: 'salarié', why: 'Un salarié est payé pour son travail : le mot cherché dit qu’il a été libéré.' },
      ],
      explain: 'On parle d’un affranchi.',
    },
    {
      ...P.trois,
      q: 'en quelle année Napoléon rétablit-il l’esclavage ?',
      accepted: ['1802', 'en 1802'],
      traps: [
        { text: '1794', why: '1794 est l’année de la première abolition.' },
        { text: '1848', why: '1848 est l’année de l’abolition définitive.' },
      ],
      explain: 'Le rétablissement a lieu en 1802.',
    },
  ],
  docs: [
    {
      title: 'Le témoignage d’un affranchi',
      lines: [
        'Un récit fictif donne la parole à un homme des Antilles françaises.',
        '« En mai 1848, la nouvelle est arrivée : un décret de la République met fin à l’esclavage. »',
        '« Personne ne peut plus être la propriété d’un autre ; nos enfants iront à l’école. »',
      ],
      qs: [
        {
          ...P.decretSenat,
          q: 'À quel événement cet homme fait-il référence ?',
          a: 'à l’abolition de l’esclavage de 1848',
          wrong: [
            { label: 'à l’abolition de 1794', why: 'Le récit parle de 1848 et d’un décret de la République.' },
            { label: 'au rétablissement de 1802', why: 'Le décret met fin à l’esclavage : il ne le rétablit pas.' },
          ],
          explain: 'En 1848, le décret abolit l’esclavage dans les territoires français.',
        },
        {
          ...P.ecoles,
          q: 'Quelle mesure obtenue par Schoelcher correspond à la dernière phrase ?',
          a: 'des écoles gratuites et obligatoires dans les colonies',
          wrong: [
            {
              label: 'des plantations réservées aux affranchis',
              why: 'Le texte parle de l’école des enfants, pas de terres.',
            },
            { label: 'le retour de la traite', why: 'La traite est contraire à la liberté annoncée.' },
          ],
          explain: 'Schoelcher obtient dès 1848 l’ouverture d’écoles dans les colonies.',
        },
      ],
    },
    {
      title: 'Une chronologie incomplète',
      lines: [
        'Un élève fictif résume ses recherches.',
        '« La République a d’abord supprimé l’esclavage. »',
        '« Quelques années plus tard, un général devenu chef de l’État l’a remis en place. »',
        '« Il a fallu attendre un demi-siècle pour une abolition qui dure. »',
      ],
      qs: [
        {
          ...P.trois,
          q: 'Qui est le dirigeant de la deuxième étape ?',
          a: 'Napoléon Bonaparte',
          wrong: [
            { label: 'Victor Schoelcher', why: 'Schoelcher agit pour l’abolition, en 1848.' },
            { label: 'Louis XIV', why: 'Louis XIV règne bien avant la Révolution.' },
          ],
          explain: 'Napoléon rétablit l’esclavage en 1802.',
        },
        {
          ...P.aboutissement,
          q: 'Que montre cette chronologie sur l’abolition ?',
          a: 'elle est un long processus, avec des retours en arrière',
          wrong: [
            {
              label: 'elle est obtenue en une seule fois',
              why: 'L’esclavage est rétabli avant d’être aboli de nouveau.',
            },
            { label: 'elle n’a jamais lieu', why: 'La dernière étape est une abolition qui dure.' },
          ],
          explain: 'L’abolition aboutit après un long processus.',
        },
      ],
    },
    {
      title: 'Un navire arrêté en mer',
      lines: [
        'Un récit fictif de 1820 raconte une patrouille de la marine britannique.',
        'Les marins arrêtent un navire qui transporte des captifs africains.',
        'Les captifs sont rapatriés en Afrique.',
      ],
      qs: [
        {
          ...P.traiteAnglaise,
          q: 'Quelle interdiction cette patrouille fait-elle appliquer ?',
          a: 'l’interdiction de la traite',
          wrong: [
            {
              label: 'l’interdiction du commerce en droiture',
              why: 'Ce navire transporte des captifs : c’est la traite.',
            },
            {
              label: 'l’interdiction de l’émigration',
              why: 'Les captifs sont emmenés de force : ce ne sont pas des émigrants.',
            },
          ],
          explain: 'L’Angleterre a interdit la traite à ses ressortissants en 1808.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [industrie, coloniales, abolition];

export const SOURCE_PROGRAMME = 'cycle4-2020';
export const SOURCE_RESSOURCE = 'eduscol-4e-xixe';

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => {
  const s = notion(n, SOURCE_PROGRAMME, 'quatrième');
  return { ...s, lesson: { ...s.lesson, sources: [...new Set([...(s.lesson.sources ?? []), SOURCE_RESSOURCE])] } };
});
