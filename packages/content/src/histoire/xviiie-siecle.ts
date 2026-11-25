import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './xviiie-siecle-sources.ts';

/**
 * 4e, thème 1 « Le XVIIIe siècle : expansions, Lumières et révolutions » (lot hi-4e-01). Les faits sont dans
 * `xviiie-siecle-sources.ts` avec leur citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */

// ——— Notion 1 : bourgeoisies marchandes, négoces, traites négrières et esclavage ———

const negoces: Notion = {
  id: 'h4-negoces-traites',
  title: 'Négoce maritime, traite négrière et esclavage',
  hint: 'Relis le mémo : qui fait le commerce, quelle route suivent les navires et ce que subissent les personnes déportées.',
  memo: [
    'Au XVIIIe siècle, une **bourgeoisie** marchande, avec ses **négociants** et ses **armateurs**, s’enrichit dans les ports de l’Atlantique, comme Nantes ou Bordeaux, grâce au commerce avec les colonies.',
    'Une partie de ce commerce est la **traite négrière** : des navires vont d’Europe en Afrique, y acquièrent des captifs, les déportent vers les **plantations** des Amériques, puis rentrent avec des **denrées** : c’est le **commerce triangulaire**.',
    'La traite et l’**esclavage** déportent et privent de liberté des millions de personnes ; dès ce siècle, des voix les contestent et, en 1791, les esclaves de Saint-Domingue se révoltent.',
  ],
  faits: [
    {
      ...P.bourgeoisie,
      q: 'Sous l’Ancien Régime, qu’est-ce que la bourgeoisie ?',
      a: 'une classe distincte de la noblesse et du clergé, qui ne vit pas du travail de ses mains',
      wrong: [
        {
          label: 'l’ensemble des paysans qui cultivent la terre',
          why: 'Les paysans vivent du travail de leurs mains.',
        },
        { label: 'les membres du clergé', why: 'La bourgeoisie diffère justement du clergé.' },
        { label: 'les familles nobles de la cour', why: 'La bourgeoisie diffère de la noblesse.' },
      ],
      gap: ['La bourgeoisie diffère de la noblesse et du ', '.', ['clergé', 'clerge']],
      explain: 'Les négociants et les armateurs font partie de cette bourgeoisie, enrichie par le commerce.',
    },
    {
      ...P.negociant,
      q: 'Qu’est-ce qu’un négociant ?',
      a: 'une personne qui fait du commerce en gros',
      wrong: [
        { label: 'une personne qui cultive la terre d’un seigneur', why: 'C’est un paysan, pas un marchand.' },
        {
          label: 'un officier qui commande un navire de guerre',
          why: 'Un officier sert le roi : il ne fait pas le commerce.',
        },
        {
          label: 'un artisan qui vend ses seuls produits au détail',
          why: 'Le négociant fait du commerce en gros, à grande échelle.',
        },
      ],
      gap: ['Une personne qui fait du commerce en gros est un ', '.', ['négociant', 'negociant']],
      explain: 'Le négociant achète et vend en gros : c’est un grand marchand.',
    },
    {
      ...P.armateur,
      q: 'Que fait un armateur ?',
      a: 'il équipe un ou plusieurs navires',
      wrong: [
        {
          label: 'il fabrique des armes pour l’armée',
          why: 'Le mot ne vient pas des armes de guerre : il s’agit de navires.',
        },
        { label: 'il juge les marins en mer', why: 'Juger les marins n’est pas le rôle d’un armateur.' },
        {
          label: 'il cultive la canne à sucre',
          why: 'La culture de la canne se fait dans les plantations, pas à bord des navires.',
        },
      ],
      gap: ['Celui qui équipe un ou plusieurs navires est un ', '.', ['armateur']],
      explain: 'L’armateur équipe des navires pour le commerce ou la pêche.',
    },
    {
      ...P.ports,
      q: 'Quel groupe réunit des ports français enrichis par le grand commerce maritime au XVIIIe siècle ?',
      a: 'Nantes et Bordeaux',
      wrong: [
        {
          label: 'Lyon et Dijon',
          why: 'Ces villes sont à l’intérieur des terres : elles ne sont pas des ports de l’Atlantique.',
        },
        { label: 'Strasbourg et Reims', why: 'Ce sont des villes de l’est, éloignées de l’océan.' },
        { label: 'Toulouse et Clermont', why: 'Ces villes ne sont pas des ports maritimes.' },
      ],
      gap: [
        'Au XVIIIe siècle, les ports de Nantes, de ',
        ', de La Rochelle et de Rouen se développent par le commerce maritime.',
        ['Bordeaux'],
      ],
      explain: 'Les ports de la façade atlantique profitent du commerce avec les colonies.',
    },
    {
      ...P.triangle,
      q: 'Comment appelle-t-on le commerce qui relie l’Europe, l’Afrique de l’Ouest et l’Amérique ?',
      a: 'le commerce triangulaire',
      wrong: [
        {
          label: 'le commerce « en droiture »',
          why: 'En droiture, on va directement entre la métropole et la colonie, sans passer par l’Afrique ni faire la traite.',
        },
        {
          label: 'la route de la soie',
          why: 'La route de la soie relie l’Europe et l’Asie, bien avant le XVIIIe siècle.',
        },
        {
          label: 'le grand cabotage',
          why: 'Le cabotage longe les côtes, ici pour redistribuer les produits en Europe.',
        },
      ],
      gap: ['Le commerce reliant l’Europe, l’Afrique de l’Ouest et l’Amérique est dit ', '.', ['triangulaire']],
      explain: 'Les trois étapes dessinent un triangle sur la carte de l’Atlantique.',
    },
    {
      ...P.droiture,
      q: 'Comment se fait la majorité des échanges entre la France et ses colonies ?',
      a: 'par le commerce « en droiture », sans traite',
      wrong: [
        {
          label: 'par le commerce triangulaire uniquement',
          why: 'La traite existe, mais la majorité des échanges avec les colonies se fait en droiture.',
        },
        {
          label: 'par des caravanes à travers l’Asie',
          why: 'Les colonies sont outre-mer : on les rejoint par la mer.',
        },
        { label: 'par des convois terrestres en Europe', why: 'Aucune route terrestre ne mène aux Antilles.' },
      ],
      gap: ['La majorité des échanges avec les colonies se fait en ', ', sans traite.', ['droiture']],
      explain: 'Le commerce en droiture emporte des biens vers les colonies et rapporte des denrées coloniales.',
    },
    {
      ...P.plantation,
      q: 'Quels produits portent l’essor de l’économie de plantation ?',
      a: 'le sucre, le cacao, le café et le tabac',
      wrong: [
        { label: 'le blé, l’orge et le seigle', why: 'Ce sont les céréales cultivées en Europe.' },
        {
          label: 'le charbon, le fer et l’acier',
          why: 'Ce sont des produits des mines et des forges, pas des plantations.',
        },
        {
          label: 'la soie, la porcelaine et le thé seulement',
          why: 'La soie et la porcelaine viennent d’Asie : ce ne sont pas des cultures de plantation américaines.',
        },
      ],
      gap: ['Les plantations produisent le ', ', le cacao, le café et le tabac.', ['sucre']],
      explain: 'Ces cultures destinées à l’Europe se développent aux Amériques et dans l’océan Indien.',
    },
    {
      ...P.codeNoir,
      q: 'Comment le Code noir considère-t-il la personne mise en esclavage ?',
      a: 'comme un bien qu’un maître peut acquérir',
      wrong: [
        {
          label: 'comme un citoyen égal en droits',
          why: 'L’égalité en droits est un principe de 1789, contraire à ce que fait le Code noir.',
        },
        {
          label: 'comme un ouvrier salarié libre',
          why: 'Un salarié est payé et peut partir : ce n’est pas le cas d’un esclave.',
        },
        {
          label: 'comme un apprenti libéré après sa formation',
          why: 'L’esclave n’est pas un apprenti : rien ne lui promet la liberté, il appartient à un maître.',
        },
      ],
      gap: ['Le Code noir fait de l’esclave un être « ', ' », comme un bien.', ['meuble']],
      explain:
        'En droit, « meuble » signifie un bien que l’on peut acheter et posséder : le Code noir légalise l’esclavage.',
    },
    {
      ...P.orientale,
      q: 'Quelle traite, plus ancienne que la traite occidentale, commence au VIIe siècle ?',
      a: 'la traite orientale',
      wrong: [
        {
          label: 'la traite atlantique',
          why: 'La traite atlantique est liée à l’expansion européenne, à partir du XVe siècle.',
        },
        { label: 'le commerce en droiture', why: 'Le commerce en droiture ne comporte pas de traite.' },
        {
          label: 'le commerce triangulaire',
          why: 'Il est lié à la traite occidentale, qui est la plus récente des deux.',
        },
      ],
      gap: ['La traite ', ', plus ancienne, commence au VIIe siècle.', ['orientale']],
      explain: 'Il y a plusieurs traites négrières : la traite occidentale se superpose à une traite orientale.',
    },
  ],
  paires3: [
    ['Négociant', 'Grand marchand qui commerce en gros'],
    ['Armateur', 'Personne qui équipe des navires'],
    ['Plantation', 'Grand domaine des colonies produisant sucre ou café'],
  ],
  paires5: [
    ['Commerce triangulaire', 'Relie l’Europe, l’Afrique de l’Ouest et l’Amérique'],
    ['Commerce « en droiture »', 'Relie directement métropole et colonies, sans traite'],
    ['Code noir', 'Texte qui fait de l’esclave un bien'],
    ['Montesquieu', 'Critique l’esclavage dans L’Esprit des lois'],
    ['Saint-Domingue', 'Colonie où les esclaves se révoltent en 1791'],
  ],
  frise: [
    { ...P.colbert, label: 'Colbert crée la Compagnie des Indes orientales', date: '1664' },
    { ...P.codeDate, label: 'Le Code noir s’applique aux Antilles', date: '1685' },
    { ...P.montesquieuEsclavage, label: 'Montesquieu critique l’esclavage', date: '1748' },
    { ...P.traiteParis, label: 'Traité de Paris', date: '1763' },
    { ...P.societe, label: 'Une société pour l’abolition est créée en France', date: '1788' },
    { ...P.saintDomingue, label: 'Révolte des esclaves de Saint-Domingue', date: '1791' },
  ],
  libres: [
    {
      ...P.colbert,
      q: 'quel ministre crée la Compagnie des Indes orientales en 1664 ?',
      accepted: ['Colbert'],
      traps: [
        { text: 'Turgot', why: 'Turgot est un ministre du début du règne de Louis XVI, un siècle plus tard.' },
        { text: 'Richelieu', why: 'Richelieu est un autre ministre : la compagnie de 1664 est liée à Colbert.' },
      ],
      explain: 'C’est Colbert, ministre de Louis XIV, qui la crée.',
    },
    {
      ...P.triangle,
      q: 'quel adjectif qualifie le commerce entre l’Europe, l’Afrique de l’Ouest et l’Amérique ?',
      accepted: ['triangulaire', 'commerce triangulaire'],
      traps: [
        { text: 'en droiture', why: 'Le commerce en droiture ne passe pas par l’Afrique.' },
        { text: 'oriental', why: 'La traite orientale va de l’Afrique subsaharienne vers le monde musulman.' },
      ],
      explain: 'On parle de commerce triangulaire.',
    },
    {
      ...P.negoce,
      q: 'quel nom, de la même famille que « négociant », désigne une activité commerciale importante, surtout en gros ?',
      accepted: ['négoce', 'negoce', 'le négoce'],
      traps: [
        { text: 'cabotage', why: 'Le cabotage est une navigation le long des côtes.' },
        { text: 'artisanat', why: 'L’artisanat est la fabrication d’objets, pas le commerce de gros.' },
      ],
      explain: 'Le mot est négoce, d’où vient négociant.',
    },
    {
      ...P.saintDomingue,
      q: 'dans quelle colonie les esclaves se révoltent-ils en 1791 ?',
      accepted: ['Saint-Domingue', 'Saint Domingue'],
      traps: [
        { text: 'Canada', why: 'La France abandonne le Canada au traité de Paris de 1763.' },
        { text: 'Pondichéry', why: 'Pondichéry est un comptoir de l’Inde.' },
      ],
      explain: 'La révolte a lieu à Saint-Domingue, une colonie des Antilles.',
    },
  ],
  docs: [
    {
      title: 'Le registre d’un armateur',
      lines: [
        'Un registre fictif d’un port de l’Atlantique note le départ d’un navire.',
        '« Nous embarquons des tissus et des outils pour la côte d’Afrique. »',
        '« Là, nous les échangerons contre des captifs, que nous conduirons de force aux Antilles. »',
        '« Au retour, la cale sera chargée de sucre et de café. »',
      ],
      qs: [
        {
          ...P.triangle,
          q: 'Quel type de commerce ce navire pratique-t-il ?',
          a: 'le commerce triangulaire',
          wrong: [
            {
              label: 'le commerce en droiture',
              why: 'Le navire passe par l’Afrique et y acquiert des captifs : ce n’est pas la droiture.',
            },
            {
              label: 'le commerce de la route de la soie',
              why: 'Le navire va en Afrique puis aux Antilles, pas en Asie.',
            },
          ],
          explain: 'Europe, Afrique, Amériques, puis retour : trois étapes, avec la traite d’êtres humains.',
        },
        {
          ...P.retour,
          q: 'Que rapporte le navire en Europe au retour ?',
          a: 'des denrées coloniales',
          wrong: [
            {
              label: 'des captifs',
              why: 'Les captifs sont débarqués aux Antilles ; la cale du retour porte sucre et café.',
            },
            { label: 'des tissus et des outils', why: 'Ils partent d’Europe vers l’Afrique, au début du voyage.' },
          ],
          explain: 'Le sucre et le café sont des denrées coloniales produites dans les plantations.',
        },
      ],
    },
    {
      title: 'Une discussion dans un salon',
      lines: [
        'Dans un salon fictif, deux invités débattent du commerce des colonies.',
        'Le premier dit : « Sans la traite, les ports seraient ruinés ! »',
        'La seconde répond : « Une personne ne peut pas être un bien que l’on achète. »',
        'Elle cite un auteur qui, dans L’Esprit des lois, critique l’esclavage.',
      ],
      qs: [
        {
          ...P.montesquieuEsclavage,
          q: 'Quel auteur la seconde invitée cite-t-elle ?',
          a: 'Montesquieu',
          wrong: [
            {
              label: 'Colbert',
              why: 'Colbert est un ministre : il est à l’origine du Code noir, pas de L’Esprit des lois.',
            },
            { label: 'Robespierre', why: 'Robespierre est un homme de la Révolution, plus tard dans le siècle.' },
          ],
          explain: 'L’Esprit des lois (1748) est de Montesquieu.',
        },
        {
          ...P.codeNoir,
          q: 'À quel texte l’invitée s’oppose-t-elle quand elle refuse qu’une personne soit un « bien » ?',
          a: 'au Code noir',
          wrong: [
            {
              label: 'à la Déclaration des droits de l’homme et du citoyen',
              why: 'La Déclaration affirme l’égalité devant la loi : elle ne fait pas d’une personne un bien.',
            },
            {
              label: 'au traité de Paris',
              why: 'Le traité de Paris (1763) règle un partage de territoires entre États.',
            },
          ],
          explain: 'Le Code noir définit l’esclave comme un « meuble », c’est-à-dire un bien.',
        },
      ],
    },
    {
      title: 'Le bilan d’un siècle',
      lines: [
        'Un cours fictif résume l’essor du grand commerce.',
        'Les ports de Nantes et de Bordeaux se développent grâce aux échanges avec les colonies.',
        'Des plantations des Antilles produisent le sucre avec le travail forcé d’esclaves africains.',
        'La traite atlantique et les autres traites ont déporté des millions de personnes.',
      ],
      qs: [
        {
          ...P.canne,
          q: 'Pourquoi la culture de la canne à sucre est-elle liée à la traite ?',
          a: 'elle réclame une main-d’œuvre nombreuse, fournie par l’esclavage',
          wrong: [
            { label: 'elle pousse seulement sur la côte d’Afrique', why: 'La canne est implantée dans les Caraïbes.' },
            {
              label: 'elle se cultive sans travailleurs',
              why: 'Le texte et le programme disent le contraire : elle demande beaucoup de bras.',
            },
          ],
          explain: 'La canne consomme beaucoup de main-d’œuvre, ce qui alimente la traite et l’esclavage.',
        },
        {
          ...P.deplacement,
          q: 'Quelle expression décrit le mieux l’ampleur de la traite évoquée à la dernière ligne ?',
          a: 'le déplacement forcé de millions de personnes',
          wrong: [
            {
              label: 'un voyage librement choisi par quelques familles',
              why: 'Les personnes déportées ne choisissent rien : le déplacement est forcé.',
            },
            {
              label: 'un échange limité à quelques centaines de personnes',
              why: 'Le phénomène est massif : il s’agit de millions de personnes.',
            },
          ],
          explain: 'Au moins 11 millions de personnes sont déplacées de force.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : l'Europe des Lumières ———

const lumieres: Notion = {
  id: 'h4-europe-lumieres',
  title: 'L’Europe des Lumières',
  hint: 'Relis le mémo : quel outil de pensée, quels relais des idées et quelle critique du pouvoir ?',
  memo: [
    'Les **Lumières** sont un mouvement européen : au nom de la **raison**, des **philosophes** critiquent les idées reçues, le pouvoir sans limite et l’intolérance.',
    'Leurs idées circulent par les livres, les académies, les **salons** et l’**Encyclopédie** de Diderot et d’Alembert, malgré la **censure**.',
    'Certains rois se disent proches des philosophes : c’est le **despotisme éclairé** ; d’autres auteurs veulent limiter le pouvoir ou le confier au peuple, contre l’**absolutisme**.',
  ],
  faits: [
    {
      ...P.raison,
      q: 'À quoi les hommes des Lumières veulent-ils que tout soit conforme ?',
      a: 'à la raison',
      wrong: [
        { label: 'à la tradition', why: 'Les Lumières interrogent justement la tradition.' },
        { label: 'à la seule volonté du roi', why: 'Les Lumières critiquent le pouvoir sans limite.' },
        { label: 'à la coutume des ancêtres', why: 'La coutume est ce qu’ils soumettent à l’examen.' },
      ],
      gap: ['On cherche désormais ce qui est conforme à la ', '.', ['raison']],
      explain: 'La raison est l’outil qui permet à chacun d’examiner les idées reçues.',
    },
    {
      ...P.europe,
      q: 'Les Lumières sont un mouvement…',
      a: 'européen',
      wrong: [
        { label: 'uniquement français', why: 'Les Lumières existent en Angleterre, en Allemagne, en Italie…' },
        { label: 'réservé à la cour de Versailles', why: 'Les idées circulent bien au-delà de la cour.' },
        {
          label: 'uniquement religieux',
          why: 'Les Lumières touchent la politique, la société, les sciences et la religion.',
        },
      ],
      gap: ['Les Lumières sont un phénomène ', '.', ['européen', 'europeen']],
      explain: 'Enlightenment, Aufklärung, Illuminismo : le mouvement a des noms dans plusieurs langues.',
    },
    {
      ...P.encyclopedie,
      q: 'Quel grand ouvrage, dirigé par Diderot et d’Alembert, diffuse les idées nouvelles ?',
      a: 'l’Encyclopédie',
      wrong: [
        { label: 'l’Esprit des lois', why: 'L’Esprit des lois est l’œuvre de Montesquieu.' },
        { label: 'le Code civil', why: 'Le Code civil date de 1804, après la Révolution.' },
        { label: 'le Traité sur la tolérance', why: 'Le Traité sur la tolérance est de Voltaire.' },
      ],
      gap: [
        'Diderot et d’Alembert dirigent l’',
        ', qui diffuse les idées nouvelles.',
        ['Encyclopédie', 'Encyclopedie'],
      ],
      explain: 'L’Encyclopédie rassemble les savoirs et diffuse de nouvelles idées.',
    },
    {
      ...P.interdiction,
      q: 'Que se passe-t-il pour les deux premiers volumes de l’Encyclopédie en 1752 ?',
      a: 'le Conseil du roi en interdit la diffusion',
      wrong: [
        { label: 'le roi les achète tous', why: 'Le pouvoir les interdit au lieu de les soutenir.' },
        {
          label: 'ils sont traduits en latin par l’Église',
          why: 'Les autorités religieuses se sont au contraire opposées à l’ouvrage.',
        },
        { label: 'ils sont perdus en mer', why: 'Rien de tel : le pouvoir en a interdit la diffusion.' },
      ],
      gap: ['En 1752, le Conseil du roi ', ' la diffusion des deux premiers volumes.', ['interdit']],
      explain: 'La censure frappe l’Encyclopédie, qui doit contourner les interdits.',
    },
    {
      ...P.lieux,
      q: 'Lequel de ces lieux ou moyens diffuse les idées des Lumières ?',
      a: 'les salons et les académies',
      wrong: [
        {
          label: 'les corporations de métiers seulement',
          why: 'Les corporations organisent des métiers, elles ne sont pas le grand relais cité ici.',
        },
        {
          label: 'les plantations des colonies',
          why: 'Les plantations sont des domaines agricoles des colonies : ce ne sont pas des lieux de débat des idées.',
        },
        {
          label: 'les seules campagnes isolées',
          why: 'La diffusion passe surtout par les villes et les sociétés de pensée.',
        },
      ],
      gap: [
        'Les idées circulent par le livre, les académies et les ',
        '.',
        ['salons', 'salon', 'loges', 'loges maçonniques', 'loges maconniques'],
      ],
      explain: 'Livres, académies, loges et salons sont des lieux et des moyens où l’on discute les idées.',
    },
    {
      ...P.despote,
      q: 'Quel souverain de Prusse est cité comme despote éclairé ?',
      a: 'Frédéric II',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV, roi de France, incarne la monarchie absolue.' },
        { label: 'Charles Quint', why: 'Charles Quint vit au XVIe siècle.' },
        { label: 'Soliman le Magnifique', why: 'Soliman dirige l’empire ottoman au XVIe siècle.' },
      ],
      gap: ['En Prusse, le roi ', ' II est cité comme despote éclairé.', ['Frédéric', 'Frederic']],
      explain: 'Frédéric II de Prusse, Catherine II en Russie et Joseph II à Vienne en sont des exemples.',
    },
    {
      ...P.montesquieuPouvoir,
      q: 'Selon Montesquieu, qu’est-ce qui doit arrêter le pouvoir ?',
      a: 'le pouvoir',
      wrong: [
        { label: 'la religion', why: 'Montesquieu imagine des pouvoirs qui se limitent les uns les autres.' },
        { label: 'l’armée', why: 'Il ne s’agit pas de la force, mais de l’équilibre entre pouvoirs.' },
        { label: 'la fortune des négociants', why: 'L’argent n’est pas le remède qu’il propose.' },
      ],
      gap: ['« Il faut que, par la disposition des choses, le ', ' arrête le pouvoir. »', ['pouvoir']],
      explain: 'Montesquieu veut des contre-pouvoirs pour protéger la liberté.',
    },
    {
      ...P.calas,
      q: 'Dans l’affaire Calas, que fait Voltaire ?',
      a: 'il porte l’affaire devant l’opinion pour obtenir la révision du procès',
      wrong: [
        { label: 'il fait exécuter le père de la victime', why: 'Voltaire défend l’innocence de Calas.' },
        { label: 'il juge lui-même le procès au parlement', why: 'Voltaire n’est pas juge : il mobilise l’opinion.' },
        { label: 'il demande qu’on oublie le jugement', why: 'Il veut au contraire que le procès soit revu.' },
      ],
      gap: [
        'Voltaire porte l’affaire Calas devant l’',
        ' pour obtenir la révision du procès.',
        ['opinion', 'opinion publique'],
      ],
      explain: 'L’opinion publique devient un lieu où l’on débat des jugements du pouvoir.',
    },
    {
      ...P.souverainete,
      q: 'Dans l’idée de souveraineté défendue au siècle des Lumières, où se trouve la source de tout pouvoir ?',
      a: 'dans le peuple',
      wrong: [
        { label: 'dans le roi seul', why: 'Un pouvoir concentré dans le seul roi est celui de la monarchie absolue.' },
        { label: 'dans les chefs religieux', why: 'Cette pensée sépare le religieux du politique.' },
        { label: 'dans les grands négociants', why: 'La richesse n’est pas la source du pouvoir dans cette idée.' },
      ],
      gap: ['Selon l’idée de souveraineté, la source de tout pouvoir est dans le ', '.', ['peuple']],
      explain: 'C’est une contestation de l’absolutisme : le pouvoir vient du peuple, non du roi seul.',
    },
  ],
  paires3: [
    ['Montesquieu', 'Veut que le pouvoir arrête le pouvoir'],
    ['Diderot', 'Codirige l’Encyclopédie'],
    ['Frédéric II', 'Roi de Prusse, despote éclairé'],
  ],
  paires5: [
    ['Voltaire', 'Défend Calas et prône la tolérance'],
    ['Kant', 'Écrit « Qu’est-ce que les Lumières ? »'],
    ['Catherine II', 'Despote éclairée à Saint-Pétersbourg'],
    ['Aufklärung', 'Nom allemand des Lumières'],
    ['Censure', 'Contrôle du pouvoir sur ce qui peut être publié'],
  ],
  frise: [
    { ...P.montesquieuEsclavage, label: 'Parution de L’Esprit des lois', date: '1748' },
    { ...P.premierVolume, label: 'Premier volume de l’Encyclopédie', date: '1751' },
    { ...P.tolerance, label: 'Traité sur la tolérance de Voltaire', date: '1763' },
    { ...P.planches, label: 'Derniers volumes de planches de l’Encyclopédie', date: '1772' },
    { ...P.kant, label: 'Kant répond à « Qu’est-ce que les Lumières ? »', date: '1784' },
  ],
  libres: [
    {
      ...P.despotisme,
      q: 'quelle expression désigne la conception du pouvoir inspirée par des souverains proches des Lumières (deux mots) ?',
      accepted: ['despotisme éclairé', 'despotisme eclaire', 'le despotisme éclairé'],
      traps: [
        {
          text: 'monarchie absolue',
          why: 'La monarchie absolue ne se réclame pas, en elle-même, des idées des Lumières.',
        },
        { text: 'démocratie', why: 'Dans une démocratie, le peuple gouverne : le despote éclairé garde le pouvoir.' },
      ],
      explain: 'Le despotisme éclairé : un souverain qui se réclame de la raison mais garde le peuple soumis.',
    },
    {
      ...P.tolerance,
      q: 'quel écrivain publie le Traité sur la tolérance en 1763 ?',
      accepted: ['Voltaire'],
      traps: [
        { text: 'Montesquieu', why: 'Montesquieu publie L’Esprit des lois en 1748.' },
        { text: 'Diderot', why: 'Diderot codirige l’Encyclopédie.' },
      ],
      explain: 'Voltaire dénonce le fanatisme dans ce texte, après l’affaire Calas.',
    },
    {
      ...P.encyclopedie,
      q: 'quel savant codirige l’Encyclopédie avec Diderot ?',
      accepted: ['d’Alembert', "d'Alembert", 'Alembert', 'Jean le Rond d’Alembert', "Jean le Rond d'Alembert"],
      traps: [
        { text: 'Voltaire', why: 'Voltaire est un grand auteur des Lumières, mais pas le codirecteur cité.' },
        { text: 'Kant', why: 'Kant est un philosophe allemand, auteur d’un article sur les Lumières.' },
      ],
      explain: 'Diderot et d’Alembert dirigent l’Encyclopédie.',
    },
    {
      ...P.montesquieuEsclavage,
      q: 'quel auteur publie L’Esprit des lois en 1748 ?',
      accepted: ['Montesquieu'],
      traps: [
        { text: 'Rousseau', why: 'Rousseau est un autre auteur des Lumières, mais pas celui de L’Esprit des lois.' },
        { text: 'Voltaire', why: 'Voltaire écrit notamment le Traité sur la tolérance.' },
      ],
      explain: 'L’Esprit des lois est l’œuvre de Montesquieu.',
    },
  ],
  docs: [
    {
      title: 'La lettre d’une lectrice',
      lines: [
        'Dans une lettre fictive, une lectrice écrit à une amie.',
        '« Nous nous réunissons chez une hôtesse qui reçoit des savants et des écrivains. »',
        '« On y lit les volumes de Diderot, que le Conseil du roi a déjà voulu arrêter. »',
        '« Chacun discute, et nul argument n’est accepté sans examen. »',
      ],
      qs: [
        {
          ...P.salons,
          q: 'Quel relais des idées des Lumières cette lectrice décrit-elle ?',
          a: 'un salon',
          wrong: [
            { label: 'une plantation', why: 'La plantation est un domaine agricole des colonies.' },
            { label: 'un parlement anglais', why: 'Il s’agit d’une réunion privée chez une hôtesse.' },
          ],
          explain: 'Un salon réunit chez une personne des gens qui discutent des idées et des œuvres.',
        },
        {
          ...P.interdiction,
          q: 'Quel obstacle l’ouvrage de Diderot rencontre-t-il ?',
          a: 'la censure du pouvoir',
          wrong: [
            { label: 'l’absence de lecteurs', why: 'Les amies le lisent : c’est le pouvoir qui s’y oppose.' },
            {
              label: 'une pénurie d’imprimerie au Moyen Âge',
              why: 'Nous sommes au XVIIIe siècle, et l’obstacle vient du Conseil du roi.',
            },
          ],
          explain: 'Le Conseil du roi interdit en 1752 la diffusion des deux premiers volumes.',
        },
      ],
    },
    {
      title: 'Deux manières de gouverner',
      lines: [
        'Un professeur compare, dans un résumé fictif, deux avis.',
        'A : « Un souverain instruit par les philosophes doit réformer son royaume, sans partager son pouvoir. »',
        'B : « Les pouvoirs doivent être répartis, pour que le pouvoir arrête le pouvoir. »',
        'Les deux discutent des limites de la monarchie absolue.',
      ],
      qs: [
        {
          ...P.limite,
          q: 'À quelle idée l’avis A correspond-il ?',
          a: 'au despotisme éclairé',
          wrong: [
            {
              label: 'à la souveraineté du peuple',
              why: 'Dans l’avis A, le souverain garde le pouvoir : le peuple reste soumis.',
            },
            { label: 'à la séparation des pouvoirs', why: 'La répartition des pouvoirs est l’avis B.' },
          ],
          explain: 'Le despote éclairé cultive la raison, mais garde le peuple soumis.',
        },
        {
          ...P.montesquieuPouvoir,
          q: 'Quel auteur défend l’idée de l’avis B ?',
          a: 'Montesquieu',
          wrong: [
            { label: 'Frédéric II', why: 'Frédéric II est un souverain qui garde le pouvoir.' },
            { label: 'Louis XIV', why: 'Louis XIV concentre le pouvoir : il n’appelle pas à le limiter.' },
          ],
          explain: 'Montesquieu veut que le pouvoir arrête le pouvoir.',
        },
      ],
    },
    {
      title: 'Un philosophe d’Europe',
      lines: [
        'Une fiche fictive présente un texte de 1784.',
        'Son auteur y insiste sur la raison de chacun.',
        'Selon lui, chacun doit pouvoir critiquer les idées reçues.',
        'La fiche rappelle que ce mouvement dépasse la France.',
      ],
      qs: [
        {
          ...P.critique,
          q: 'De quelle idée des Lumières cette fiche parle-t-elle ?',
          a: 'l’usage de la raison pour critiquer les idées reçues',
          wrong: [
            { label: 'l’obéissance aux traditions', why: 'La fiche parle au contraire de critiquer les idées reçues.' },
            { label: 'le pouvoir absolu du roi', why: 'Le texte met la raison de chacun au premier plan.' },
          ],
          explain: 'Kant, en 1784, insiste sur la raison individuelle.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : la Révolution française et l'Empire ———

const revolution: Notion = {
  id: 'h4-revolution-empire',
  title: 'La Révolution française et l’Empire',
  hint: 'Relis le mémo : situe l’année, le principe ou le régime, de 1789 à la chute de l’Empire.',
  memo: [
    'En 1789, la **Révolution** abolit les **privilèges** et proclame la **Déclaration des droits de l’homme et du citoyen** : égalité devant la loi, libertés et **souveraineté nationale** rompent avec l’**Ancien Régime**.',
    'La monarchie tombe : la **République** naît en 1792 en pleine guerre, Louis XVI est exécuté en 1793, puis vient la **Terreur** ; en 1799, Bonaparte prend le pouvoir par un **coup d’État**.',
    'Empereur en 1804, il garde certains acquis (**Code civil**, préfets) et les diffuse en Europe, tout en limitant les libertés ; sa domination s’effondre en 1814-1815.',
  ],
  faits: [
    {
      ...P.privileges,
      q: 'Qu’est-ce qui est aboli lors de la nuit du 4 août 1789 ?',
      a: 'les privilèges',
      wrong: [
        { label: 'la République', why: 'La République n’existe pas encore en 1789.' },
        { label: 'les préfets', why: 'Les préfets sont créés plus tard, sous Bonaparte.' },
        { label: 'le Code civil', why: 'Le Code civil date de 1804.' },
      ],
      gap: ['La nuit du 4 août 1789, on abolit les ', '.', ['privilèges', 'privileges']],
      explain: 'Les privilèges disparaissent : les citoyens sont égaux devant la loi.',
    },
    {
      ...P.declaration,
      q: 'Quel texte est adopté le 26 août 1789 ?',
      a: 'la Déclaration des droits de l’homme et du citoyen',
      wrong: [
        { label: 'le Code civil', why: 'Le Code civil est promulgué en 1804.' },
        { label: 'le Code noir', why: 'Le Code noir date de 1685.' },
        {
          label: 'la Déclaration des droits de la femme et de la citoyenne',
          why: 'Olympe de Gouges la publie en 1791.',
        },
      ],
      gap: ['La Déclaration des droits de l’homme et du ', ' est adoptée le 26 août 1789.', ['citoyen']],
      explain: 'Ce texte proclame les principes du nouvel ordre politique.',
    },
    {
      ...P.principes,
      q: 'Lequel de ces principes est proclamé en 1789 ?',
      a: 'la souveraineté nationale',
      wrong: [
        { label: 'le droit divin du roi', why: 'La monarchie de droit divin appartient à l’Ancien Régime.' },
        { label: 'les privilèges de naissance', why: 'Ils sont justement abolis.' },
        { label: 'le pouvoir sans limites du roi', why: 'La Révolution rompt avec ce pouvoir.' },
      ],
      gap: ['En 1789 est proclamée la souveraineté ', ' : le pouvoir vient de la Nation.', ['nationale']],
      explain: 'La souveraineté n’appartient plus au roi seul : elle appartient à la Nation.',
    },
    {
      ...P.execution,
      q: 'Quand Louis XVI est-il exécuté ?',
      a: 'le 21 janvier 1793',
      wrong: [
        { label: 'le 14 juillet 1789', why: 'Le 14 juillet 1789 est la révolte du peuple parisien.' },
        { label: 'le 9 novembre 1799', why: 'C’est le coup d’État du 18 brumaire.' },
        { label: 'le 26 août 1789', why: 'C’est la date de la Déclaration des droits.' },
      ],
      gap: ['Louis XVI est exécuté le 21 janvier ', '.', ['1793']],
      explain: 'Jugé par la Convention, le roi est exécuté en janvier 1793.',
    },
    {
      ...P.terreur,
      q: 'Comment appelle-t-on le régime instauré sous Robespierre, avec de multiples condamnations à mort ?',
      a: 'la Terreur',
      wrong: [
        { label: 'le Consulat', why: 'Le Consulat commence après le coup d’État de 1799.' },
        { label: 'la Fronde', why: 'La Fronde est une révolte du XVIIe siècle.' },
        { label: 'l’Ancien Régime', why: 'L’Ancien Régime précède la Révolution.' },
      ],
      gap: ['Le régime de répression instauré sous Robespierre est appelé la ', '.', ['Terreur']],
      explain: 'La Terreur s’achève après la chute de Robespierre en 1794.',
    },
    {
      ...P.brumaire,
      q: 'Comment Bonaparte prend-il le pouvoir le 9 novembre 1799 ?',
      a: 'par un coup d’État',
      wrong: [
        { label: 'par une élection au suffrage universel', why: 'Il prend le pouvoir par la force, sans élection.' },
        { label: 'par un héritage royal', why: 'Bonaparte n’hérite pas d’un trône.' },
        { label: 'par un vote des états généraux', why: 'Les états généraux appartiennent à 1789.' },
      ],
      gap: ['Le 9 novembre 1799, Bonaparte agit par un coup d’', '.', ['État', 'Etat']],
      explain: 'C’est le coup d’État du 18 brumaire.',
    },
    {
      ...P.codeCivil,
      q: 'Quel texte de 1804 unifie le droit français selon le principe de l’égalité devant la loi ?',
      a: 'le Code civil',
      wrong: [
        { label: 'le Code noir', why: 'Le Code noir date de 1685 et concerne l’esclavage.' },
        { label: 'la Constitution civile du clergé', why: 'Ce texte organise l’Église pendant la Révolution.' },
        { label: 'l’édit de Nantes', why: 'L’édit de Nantes date de 1598.' },
      ],
      gap: ['En 1804, le Code ', ' unifie le droit français.', ['civil']],
      explain: 'Le Code civil donne les mêmes règles de droit à tout le pays.',
    },
    {
      ...P.rayonnement,
      q: 'Quelle portée ont en Europe les réformes révolutionnaires puis napoléoniennes ?',
      a: 'elles rayonnent bien au-delà de la France',
      wrong: [
        { label: 'elles restent inconnues hors de France', why: 'Les réformes sont reprises ou discutées en Europe.' },
        { label: 'elles rétablissent partout les privilèges', why: 'Elles les remettent au contraire en cause.' },
        { label: 'elles ne concernent que les colonies d’Asie', why: 'Elles touchent l’Europe.' },
      ],
      gap: ['Les réformes révolutionnaires puis napoléoniennes rayonnent dans toute l’', '.', ['Europe']],
      explain: 'Guerres et réformes diffusent des changements politiques et sociaux en Europe.',
    },
    {
      ...P.esclavage,
      q: 'Que devient l’esclavage dans les colonies françaises en 1794 puis en 1802 ?',
      a: 'aboli en 1794, puis rétabli en 1802',
      wrong: [
        { label: 'rétabli en 1794, puis aboli en 1802', why: 'C’est l’inverse : la Convention l’abolit d’abord.' },
        {
          label: 'aboli en 1794 et pour toujours',
          why: 'Il est rétabli sous Napoléon en 1802 ; l’abolition définitive vient plus tard.',
        },
        { label: 'jamais remis en cause', why: 'La Convention l’abolit en 1794.' },
      ],
      gap: ['La Convention abolit l’esclavage en 1794 ; Napoléon le ', ' en 1802.', ['rétablit', 'retablit']],
      explain: 'L’histoire de l’abolition n’est pas linéaire : l’abolition définitive date de 1848.',
    },
  ],
  paires3: [
    ['4 août 1789', 'Abolition des privilèges'],
    ['26 août 1789', 'Déclaration des droits de l’homme et du citoyen'],
    ['1804', 'Proclamation de l’Empire'],
  ],
  paires5: [
    ['14 juillet 1789', 'Révolte du peuple parisien'],
    ['21 janvier 1793', 'Exécution de Louis XVI'],
    ['9 novembre 1799', 'Coup d’État de Bonaparte'],
    ['Code civil', 'Unification du droit, égalité devant la loi'],
    ['Préfets', 'Représentants de l’État dans les départements'],
  ],
  frise: [
    { ...P.bastille, label: 'Révolte du peuple parisien', date: '14 juillet 1789' },
    { ...P.republique, label: 'Mise en place de la Première République', date: 'septembre 1792' },
    { ...P.execution, label: 'Exécution de Louis XVI', date: '1793' },
    { ...P.brumaire, label: 'Coup d’État du 18 brumaire', date: '1799' },
    { ...P.empire, label: 'Établissement de l’Empire', date: '1804' },
    { ...P.domination, label: 'Fin de la domination napoléonienne sur l’Europe', date: '1814-1815' },
  ],
  libres: [
    {
      ...P.privileges,
      q: 'qu’abolit-on dans la nuit du 4 août 1789 (un mot, au pluriel) ?',
      accepted: ['privilèges', 'privileges', 'les privilèges', 'les privileges'],
      traps: [
        { text: 'préfets', why: 'Les préfets sont créés sous Bonaparte.' },
        { text: 'impôts', why: 'C’est l’inégalité de statut, les privilèges, qui est supprimée cette nuit-là.' },
      ],
      explain: 'La nuit du 4 août abolit les privilèges.',
    },
    {
      ...P.consul,
      q: 'quel titre Bonaparte obtient-il à vie en 1802 ?',
      accepted: ['consul', 'consul à vie', 'consul a vie', 'Premier consul'],
      traps: [
        { text: 'empereur', why: 'L’Empire est établi en 1804.' },
        { text: 'roi', why: 'La royauté a été abolie : Bonaparte ne prend pas le titre de roi.' },
      ],
      explain: 'Bonaparte devient « Consul à vie » en 1802.',
    },
    {
      ...P.codeCivil,
      q: 'quel code, promulgué en 1804, unifie le droit français (deux mots) ?',
      accepted: ['Code civil', 'le Code civil'],
      traps: [
        { text: 'Code noir', why: 'Le Code noir date de 1685.' },
        { text: 'Code pénal', why: 'Le code demandé unifie le droit civil, en 1804.' },
      ],
      explain: 'Il s’agit du Code civil.',
    },
    {
      ...P.prefets,
      q: 'quel nom portent les représentants de l’État mis en place dans les départements (au pluriel) ?',
      accepted: ['préfets', 'prefets', 'les préfets', 'les prefets'],
      traps: [
        { text: 'intendants', why: 'Les intendants sont des agents du roi sous l’Ancien Régime.' },
        { text: 'consuls', why: 'Les consuls dirigent l’État au début du Consulat.' },
      ],
      explain: 'La réorganisation de l’État met en place les préfets.',
    },
  ],
  docs: [
    {
      title: 'Journal d’un témoin de 1789',
      lines: [
        'Un journal fictif d’habitant de Paris commence en août 1789.',
        '« Cette nuit, les députés ont supprimé les avantages réservés à certains. »',
        '« Quelques semaines plus tard, un texte déclare les citoyens égaux devant la loi. »',
        '« Il ajoute que le pouvoir vient de la Nation. »',
      ],
      qs: [
        {
          ...P.privileges,
          q: 'De quel événement parle la deuxième ligne du journal ?',
          a: 'l’abolition des privilèges',
          wrong: [
            { label: 'l’exécution de Louis XVI', why: 'Le roi est exécuté en 1793.' },
            { label: 'le coup d’État du 18 brumaire', why: 'Il a lieu en 1799.' },
          ],
          explain: 'La nuit du 4 août 1789, les privilèges sont abolis.',
        },
        {
          ...P.principes,
          q: 'Quel principe la dernière ligne désigne-t-elle ?',
          a: 'la souveraineté nationale',
          wrong: [
            {
              label: 'la monarchie de droit divin',
              why: 'Dans ce cas, le pouvoir viendrait de Dieu et appartiendrait au roi.',
            },
            { label: 'le privilège de naissance', why: 'Les privilèges viennent d’être abolis.' },
          ],
          explain: 'Le pouvoir qui vient de la Nation, c’est la souveraineté nationale.',
        },
      ],
    },
    {
      title: 'Une voix pour les femmes',
      lines: [
        'Un texte fictif présente une femme de lettres de la Révolution.',
        'En 1791, elle publie une déclaration qui réclame les mêmes droits pour les femmes.',
        'Elle écrit en écho à la Déclaration de 1789.',
        'Elle défend aussi l’abolition de l’esclavage.',
      ],
      qs: [
        {
          ...P.gouges,
          q: 'De qui parle ce texte ?',
          a: 'Olympe de Gouges',
          wrong: [
            { label: 'Catherine II', why: 'Catherine II dirige l’Empire russe.' },
            { label: 'Marie-Antoinette', why: 'La reine reçoit la déclaration mais n’en est pas l’autrice.' },
          ],
          explain: 'Olympe de Gouges publie en 1791 la Déclaration des droits de la femme et de la citoyenne.',
        },
      ],
    },
    {
      title: 'L’Europe sous Napoléon',
      lines: [
        'Un résumé fictif décrit la période de l’Empire.',
        'Le droit est unifié par un code, et des préfets représentent l’État dans les départements.',
        'Ces réformes se répandent en Europe avec les guerres.',
        'Les libertés sont pourtant de moins en moins respectées, et la domination finit par s’effondrer.',
      ],
      qs: [
        {
          ...P.libertes,
          q: 'Quelle limite le texte montre-t-il dans le régime napoléonien ?',
          a: 'les libertés publiques sont de moins en moins respectées',
          wrong: [
            {
              label: 'les privilèges de la noblesse sont rétablis par le Code civil',
              why: 'Le Code civil affirme l’égalité devant la loi.',
            },
            {
              label: 'la France perd ses préfets',
              why: 'Les préfets représentent justement l’État dans les départements.',
            },
          ],
          explain: 'Il garde certains acquis, mais respecte de moins en moins les libertés publiques.',
        },
        {
          ...P.domination,
          q: 'Quand cette domination sur l’Europe est-elle mise à bas ?',
          a: 'en 1814 et 1815',
          wrong: [
            { label: 'en 1789 et 1790', why: 'C’est le début de la Révolution.' },
            { label: 'en 1793 et 1794', why: 'C’est le temps de la Terreur.' },
          ],
          explain: 'La domination, instable et contestée, s’achève en 1814-1815.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [negoces, lumieres, revolution];

export const SOURCE_PROGRAMME = 'cycle4-2020';
export const SOURCE_RESSOURCE = 'eduscol-4e-xviiie';

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => {
  const s = notion(n, SOURCE_PROGRAMME, 'quatrième');
  return { ...s, lesson: { ...s.lesson, sources: [...new Set([...(s.lesson.sources ?? []), SOURCE_RESSOURCE])] } };
});
