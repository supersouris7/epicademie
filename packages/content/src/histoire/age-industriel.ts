import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './age-industriel-sources.ts';

/**
 * CM2, thème 2 « L’âge industriel en France » (lot hi-cm2-02). Chaque fait cite le programme du cycle 3, la BnF ou le
 * Sénat ; les textes à lire du niveau 5 sont écrits pour l’exercice.
 */
export const SOURCE = 'cycle3-2020';

const energies: Notion = {
  id: 'hcm2-energies-machines',
  title: 'Énergies et machines',
  hint: 'Relis le mémo : cherche les deux grandes énergies, les machines et leurs inventeurs.',
  memo: [
    'Entre dans l’**âge industriel** ! Pour faire tourner les **machines**, il faut de l’**énergie** : d’abord le **charbon**, puis le **pétrole**.',
    'La **machine à vapeur** utilise la vapeur d’eau pour produire un mouvement. Denis Papin en donne la première description en 1687. L’Écossais James Watt l’améliore au XVIIIe siècle et dépose un **brevet** en 1769. Elle devient le **pilier** de la révolution industrielle.',
    'Puis arrivent d’autres inventions : le **moteur** de Lenoir en 1860 et, en 1884, l’une des premières automobiles à essence. Ces changements prennent beaucoup de temps.',
  ],
  faits: [
    {
      ...P.energies,
      q: 'Quelle est la première grande énergie de l’âge industriel ?',
      a: 'le charbon',
      wrong: [
        {
          label: 'l’électricité',
          why: 'L’électricité n’est pas la première grande énergie citée : cherche une roche noire.',
        },
        { label: 'l’énergie nucléaire', why: 'L’énergie nucléaire vient bien plus tard, au XXe siècle.' },
        { label: 'le pétrole', why: 'Le pétrole est important aussi, mais il vient après.' },
      ],
      gap: ['L’âge industriel utilise d’abord le ', ', puis le pétrole.', ['charbon']],
      explain: 'On utilise d’abord le charbon, puis le pétrole.',
    },
    {
      ...P.energies,
      q: 'Après le charbon, quelle grande énergie sert à l’âge industriel ?',
      a: 'le pétrole',
      wrong: [
        { label: 'le bois', why: 'Le bois est utilisé depuis très longtemps : il ne vient pas après le charbon.' },
        {
          label: 'la force des chevaux',
          why: 'On utilise la force des chevaux depuis bien avant le charbon des usines.',
        },
        { label: 'le vent des moulins', why: 'Les moulins à vent sont bien plus anciens que l’âge industriel.' },
      ],
      gap: ['Les énergies majeures de l’âge industriel sont le charbon puis le ', '.', ['pétrole', 'petrole']],
      explain: 'Le programme cite le charbon puis le pétrole.',
    },
    {
      ...P.papin,
      q: 'Qui donne, en 1687, la première description d’une machine à vapeur ?',
      a: 'Denis Papin',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV est le roi de cette époque, pas l’auteur de cette description.' },
        { label: 'Étienne Lenoir', why: 'Lenoir invente un moteur bien plus tard, en 1860.' },
        { label: 'James Watt', why: 'James Watt améliore la machine bien plus tard, au XVIIIe siècle.' },
      ],
      gap: ['En 1687, Denis ', ' décrit une machine à vapeur.', ['Papin', 'papin']],
      explain: 'Denis Papin décrit le premier une machine à vapeur.',
    },
    {
      ...P.watt,
      q: 'Quel ingénieur écossais améliore la machine à vapeur et dépose un brevet en 1769 ?',
      a: 'James Watt',
      wrong: [
        { label: 'Napoléon Bonaparte', why: 'Napoléon est un général devenu empereur.' },
        { label: 'Étienne Lenoir', why: 'Lenoir invente un moteur en 1860, près d’un siècle plus tard.' },
        { label: 'Denis Papin', why: 'Papin travaille avant : il décrit la machine en 1687.' },
      ],
      gap: ['L’ingénieur écossais James ', ' dépose un brevet en 1769.', ['Watt', 'watt']],
      explain: 'James Watt améliore la machine à vapeur et protège son invention par un brevet.',
    },
    {
      ...P.pilier,
      q: 'Quelle machine est le pilier de la révolution industrielle ?',
      a: 'la machine à vapeur',
      wrong: [
        { label: 'le moulin à eau', why: 'Le moulin à eau existe depuis bien avant l’âge industriel.' },
        { label: 'la machine à écrire', why: 'La machine à écrire sert à rédiger des textes.' },
        {
          label: 'la machine à coudre',
          why: 'La machine à coudre est la vedette d’une exposition, mais elle n’est pas ce pilier.',
        },
      ],
      gap: ['La machine à ', ' est le pilier de la révolution industrielle.', ['vapeur']],
      explain: 'La machine à vapeur est au cœur de la révolution industrielle.',
    },
    {
      ...P.essence,
      q: 'En quelle année Édouard Delamare-Debouteville construit-il son automobile à essence, l’une des premières ?',
      a: '1884',
      wrong: [
        { label: '800', why: 'En 800, Charlemagne devient empereur.' },
        { label: '1687', why: '1687, c’est la machine à vapeur décrite par Papin.' },
        { label: '1860', why: '1860, c’est le moteur de Lenoir : l’automobile à essence vient après.' },
      ],
      gap: ['Delamare-Debouteville construit son automobile à essence en ', '.', ['1884']],
      explain: 'En 1884, Édouard Delamare-Debouteville construit une automobile à essence, l’une des premières.',
    },
    {
      ...P.duree,
      q: 'L’industrialisation se fait-elle d’un seul coup ?',
      a: 'non, elle s’inscrit dans la durée',
      wrong: [
        { label: 'oui, en une seule année', why: 'Le changement dure bien plus qu’une année.' },
        { label: 'oui, dès la première machine inventée', why: 'Une seule machine ne transforme pas tout d’un coup.' },
        { label: 'non, elle ne touche qu’un seul métier', why: 'Elle touche tous les secteurs de la production.' },
      ],
      gap: ['L’industrialisation est un long changement : elle s’inscrit dans la ', '.', ['durée', 'duree']],
      explain: 'C’est un changement long, qui touche tous les secteurs de la production.',
    },
  ],
  paires3: [
    ['Le charbon', 'La première grande énergie de l’âge industriel'],
    ['Le pétrole', 'La grande énergie qui vient ensuite'],
    ['Denis Papin', 'La machine à vapeur décrite en 1687'],
  ],
  paires5: [
    ['Le charbon', 'La première grande énergie de l’âge industriel'],
    ['Le pétrole', 'La grande énergie qui vient ensuite'],
    ['Denis Papin', 'La machine à vapeur décrite en 1687'],
    ['James Watt', 'Un brevet déposé en 1769'],
    ['Étienne Lenoir', 'Un moteur inventé en 1860'],
  ],
  frise: [
    { ...P.papin, label: 'Papin décrit une machine à vapeur', date: '1687' },
    { ...P.watt, label: 'Watt dépose un brevet', date: '1769' },
    { ...P.lenoir, label: 'Lenoir invente un moteur', date: '1860' },
    { ...P.essence, label: 'Delamare-Debouteville construit une automobile à essence', date: '1884' },
  ],
  libres: [
    {
      ...P.energies,
      q: 'quelle énergie noire et solide est la première grande énergie de l’âge industriel ? (un mot)',
      accepted: ['charbon', 'le charbon'],
      traps: [
        { text: 'pétrole', why: 'Le pétrole est liquide et vient ensuite.' },
        { text: 'bois', why: 'Le bois est plus ancien : cherche une roche noire.' },
      ],
      explain: 'Le charbon est une roche noire : on l’utilise avant le pétrole.',
    },
    {
      ...P.energies,
      q: 'quelle énergie liquide vient après le charbon ? (un mot)',
      accepted: ['pétrole', 'petrole', 'le pétrole', 'le petrole'],
      traps: [
        { text: 'charbon', why: 'Le charbon vient en premier.' },
        { text: 'eau', why: 'L’eau sert à faire de la vapeur, mais ce n’est pas l’énergie citée après le charbon.' },
      ],
      explain: 'Le pétrole est liquide ; il devient une grande énergie après le charbon.',
    },
    {
      ...P.pilier,
      q: 'la machine à … est le pilier de la révolution industrielle (un mot).',
      accepted: ['vapeur', 'à vapeur'],
      traps: [
        { text: 'écrire', why: 'La machine à écrire sert à taper des textes.' },
        { text: 'coudre', why: 'La machine à coudre est utile, mais ce n’est pas ce pilier.' },
      ],
      explain: 'La machine à vapeur est si importante qu’elle porte toute la révolution industrielle.',
    },
    {
      ...P.watt,
      q: 'quel est le nom de famille de l’ingénieur écossais qui dépose un brevet en 1769 ?',
      accepted: ['Watt', 'James Watt', 'watt', 'james watt'],
      traps: [
        { text: 'Papin', why: 'Papin vit avant : sa description date de 1687.' },
        { text: 'Lenoir', why: 'Lenoir invente un moteur en 1860.' },
      ],
      explain: 'Watt améliore la machine à vapeur, puis protège son travail par un brevet.',
    },
  ],
  docs: [
    {
      title: 'Visite à l’exposition',
      lines: [
        'En 1855, Paris organise une grande exposition.',
        'Une galerie est réservée aux machines : elles triomphent !',
        'La grande vedette est une machine à coudre.',
        'Zoé regarde les roues tourner sans fin.',
      ],
      qs: [
        {
          ...P.coudre,
          q: 'Quelle machine est la vedette de l’exposition ?',
          a: 'une machine à coudre',
          wrong: [
            { label: 'une automobile à essence', why: 'La troisième ligne nomme une autre machine.' },
            { label: 'une machine à vapeur', why: 'La vapeur n’est pas citée : relis la troisième ligne.' },
          ],
          explain: 'La troisième ligne cite la machine à coudre.',
        },
        {
          ...P.triomphe,
          q: 'Qu’est-ce qui triomphe dans cette exposition ?',
          a: 'la machine',
          wrong: [
            { label: 'le travail fait à la main', why: 'La galerie montre des machines : relis la deuxième ligne.' },
            { label: 'le moulin à vent', why: 'Aucun moulin dans ce texte.' },
          ],
          explain: 'La deuxième ligne dit que les machines triomphent.',
        },
      ],
    },
    {
      title: 'Un chantier bruyant',
      lines: [
        'Au XIXe siècle, un grand magasin s’agrandit.',
        'Des ouvriers montent des pierres et du fer.',
        'Les machines marchent à la vapeur et sifflent.',
        'Au loin, des bateaux avancent eux aussi à la vapeur.',
      ],
      qs: [
        {
          ...P.chantier,
          q: 'Avec quoi marchent les machines du chantier ?',
          a: 'à la vapeur',
          wrong: [
            { label: 'au pétrole', why: 'Le texte ne parle pas de pétrole : relis la troisième ligne.' },
            { label: 'à la force des chevaux', why: 'Aucun cheval ne fait marcher les machines dans ce texte.' },
          ],
          explain: 'La troisième ligne dit que les machines marchent à la vapeur.',
        },
        {
          ...P.navigation,
          q: 'Dans ce texte, quel transport utilise lui aussi la vapeur ?',
          a: 'les bateaux',
          wrong: [
            { label: 'les automobiles', why: 'Le texte ne parle pas d’automobiles.' },
            { label: 'les charrettes', why: 'Le texte ne parle pas de charrettes.' },
          ],
          explain: 'La dernière ligne montre la navigation à vapeur.',
        },
      ],
    },
  ],
};

const travail: Notion = {
  id: 'hcm2-travail',
  title: 'Travailler à la mine, à l’usine, à l’atelier, au grand magasin',
  hint: 'Relis le mémo : à quel lieu de travail la question te fait-elle penser ?',
  memo: [
    'À l’âge industriel, de nouveaux métiers apparaissent. On travaille à la **mine**, à l’**usine**, à l’**atelier** ou au **grand magasin**. L’usine et l’atelier sont des lieux de travail où l’on produit, avec des **machines** et des outils. Une usine est un grand bâtiment avec des machines. Un atelier est une pièce ou un petit bâtiment où l’on fabrique des objets avec des outils.',
    'À la mine, on extrait le charbon. Pour son roman Germinal, publié en 1885, Émile Zola enquête dans les mines d’Anzin. Il décrit des trains de **berlines**, un cheval qui les traîne et un enfant qui les conduit. En 1906, à Courrières, une **catastrophe** est très meurtrière. Au début du XXe siècle, la journée de huit heures est instaurée pour les mineurs.',
    'Les grands magasins se développent : La Belle Jardinière (1824), puis les Galeries du Louvre (1855). Au Bon Marché, un grand magasin de Paris, le patron Aristide Boucicaut donne droit à deux repas par jour à chaque employé. Dans Au Bonheur des dames, Zola montre un grand magasin : prix fixes et affichés, publicité.',
  ],
  faits: [
    {
      ...P.lieux,
      q: 'Où travaille un mineur ?',
      a: 'à la mine',
      wrong: [
        { label: 'à l’usine', why: 'À l’usine, on produit avec des machines : le mineur, lui, extrait le charbon.' },
        { label: 'à l’atelier', why: 'L’atelier est un lieu de fabrication : on n’y extrait pas le charbon.' },
        { label: 'au grand magasin', why: 'Au grand magasin, on vend des marchandises.' },
      ],
      gap: ['Le mineur travaille à la ', '.', ['mine']],
      explain: 'Le mineur travaille à la mine.',
    },
    {
      ...P.anzin,
      q: 'Dans les mines de quelle ville du Nord Émile Zola va-t-il enquêter ?',
      a: 'Anzin',
      wrong: [
        { label: 'Saint-Étienne', why: 'Le mémo cite une autre ville pour l’enquête de Zola.' },
        { label: 'Courrières', why: 'Courrières est connue pour la catastrophe de 1906.' },
        { label: 'Lille', why: 'Zola mène son enquête dans les mines d’une autre ville.' },
      ],
      gap: ['Zola visite les mines d’', ' pour écrire Germinal.', ['Anzin', 'anzin']],
      explain: 'Pour son roman Germinal, Zola enquête dans les mines d’Anzin.',
    },
    {
      ...P.berlines,
      q: 'Dans la galerie, qu’est-ce qu’un « train de berlines » ?',
      a: 'une file de petits wagons de mine',
      wrong: [
        { label: 'un train de voyageurs qui relie deux villes', why: 'Ce train circule dans la galerie de la mine.' },
        {
          label: 'une équipe de mineurs qui descend au travail',
          why: 'Les berlines sont des wagons, pas des personnes.',
        },
        { label: 'une machine qui remonte l’eau de la mine', why: 'Les berlines roulent à la file dans la galerie.' },
      ],
      gap: ['Au fond de la mine roule un train de ', '.', ['berlines', 'berline']],
      explain: 'Les berlines sont les wagonnets qui circulent dans les galeries.',
    },
    {
      ...P.cheval,
      q: 'Dans la mine décrite par Zola, qu’est-ce qui traîne les berlines ?',
      a: 'un cheval',
      wrong: [
        { label: 'une locomotive', why: 'Zola n’aperçoit pas une machine, mais un animal.' },
        { label: 'un âne', why: 'Zola nomme un autre animal, plus grand.' },
        { label: 'un mulet', why: 'Zola nomme un autre animal.' },
      ],
      gap: ['Dans la galerie, un ', ' blanc traîne les berlines.', ['cheval']],
      explain: 'Zola aperçoit un cheval blanc qui traîne le train.',
    },
    {
      ...P.courrieres,
      q: 'Quelle catastrophe minière de 1906 est la plus meurtrière ?',
      a: 'celle de Courrières',
      wrong: [
        { label: 'celle d’Anzin', why: 'Anzin est la ville où Zola enquête.' },
        { label: 'celle de Saint-Étienne', why: 'La catastrophe de 1906 porte le nom d’un autre lieu.' },
        { label: 'celle de Carmaux', why: 'La catastrophe de 1906 porte le nom d’un autre lieu.' },
      ],
      gap: [
        'En 1906, la catastrophe de ',
        ' frappe les mineurs.',
        ['Courrières', 'Courrieres', 'courrières', 'courrieres'],
      ],
      explain: 'La catastrophe de Courrières, en 1906, est la plus meurtrière.',
    },
    {
      ...P.huitHeures,
      q: 'Au début du XXe siècle, quelle journée de travail est instaurée pour les mineurs ?',
      a: 'la journée de huit heures',
      wrong: [
        { label: 'la journée de dix heures', why: 'La journée instaurée pour les mineurs est plus courte.' },
        { label: 'la journée de douze heures', why: 'La journée instaurée pour les mineurs est bien plus courte.' },
        { label: 'la journée de six heures', why: 'La journée instaurée pour les mineurs est un peu plus longue.' },
      ],
      gap: ['La journée de travail des mineurs passe à ', ' heures.', ['huit', '8']],
      explain: 'Au début du XXe siècle, la journée de huit heures est instaurée pour les mineurs.',
    },
    {
      ...P.pratiques,
      q: 'Dans le grand magasin du roman de Zola, comment sont les prix ?',
      a: 'fixes et affichés',
      wrong: [
        { label: 'discutés avec chaque client', why: 'Un prix fixe ne se discute pas.' },
        { label: 'cachés jusqu’au paiement', why: 'Dans ces magasins, au contraire, les prix sont affichés.' },
        { label: 'différents selon la fortune du client', why: 'Un prix fixe est le même pour tous.' },
      ],
      gap: ['Au grand magasin, les prix sont fixes et ', '.', ['affichés', 'affiches', 'affiché']],
      explain: 'Les prix sont fixes et affichés : tout le monde les voit.',
    },
    {
      ...P.repas,
      q: 'Au Bon Marché, dont Aristide Boucicaut est le patron, à quoi chaque employé a-t-il droit chaque jour ?',
      a: 'deux repas complets',
      wrong: [
        { label: 'un seul repas, le soir', why: 'Le règlement prévoit plus d’un repas.' },
        { label: 'une pause sans nourriture', why: 'Le règlement parle de repas.' },
        { label: 'une somme d’argent pour acheter son repas', why: 'Le règlement prévoit des repas, pas de l’argent.' },
      ],
      gap: ['Chaque employé a droit à ', ' repas par jour.', ['deux', '2']],
      explain: 'Le règlement prévoit deux repas gratuits par jour.',
    },
    {
      ...P.unites,
      q: 'À l’âge industriel, que sont les usines et les ateliers ?',
      a: 'des lieux de travail où l’on produit',
      wrong: [
        { label: 'des logements pour les familles', why: 'On y vient pour travailler, pas pour habiter.' },
        { label: 'des commerces à nombreux rayons', why: 'Cela décrit plutôt un grand magasin.' },
        { label: 'des galeries pour extraire le charbon', why: 'Les galeries se trouvent à la mine.' },
      ],
      gap: ['L’usine et l’atelier sont des lieux de ', '.', ['travail', 'production', 'fabrication']],
      explain: 'Les usines et les ateliers sont des cadres de travail, où l’on produit.',
    },
    {
      ...P.outils,
      q: 'À l’intérieur des usines et des ateliers, avec quoi produit-on ?',
      a: 'des machines et des outils',
      wrong: [
        { label: 'des affiches et des rayons', why: 'Les affiches et les rayons font penser au grand magasin.' },
        { label: 'des charrues et des bœufs', why: 'Les charrues et les bœufs servent aux champs.' },
        { label: 'des wagons et des rails seulement', why: 'Les wagons servent à transporter.' },
      ],
      gap: ['Dans les usines et les ateliers, on produit avec des outils et des ', '.', ['machines', 'machine']],
      explain: 'On y trouve les machines et les outils de production.',
    },
  ],
  paires3: [
    ['La mine', 'Le lieu où l’on extrait le charbon'],
    ['Le grand magasin', 'Le lieu où l’on vend des marchandises très variées'],
    ['L’usine', 'Un grand bâtiment où l’on fabrique avec des machines'],
  ],
  paires5: [
    ['La mine', 'Le lieu où l’on extrait le charbon'],
    ['Le grand magasin', 'Le lieu où l’on vend des marchandises très variées'],
    ['L’usine', 'Un grand bâtiment où l’on fabrique avec des machines'],
    ['Germinal', 'Le roman de Zola sur la mine'],
    ['Courrières', 'Une catastrophe minière en 1906'],
  ],
  frise: [
    { ...P.jardiniere, label: 'Le magasin La Belle Jardinière apparaît', date: '1824' },
    { ...P.louvre, label: 'Les Galeries du Louvre ouvrent', date: '1855' },
    { ...P.germinal, label: 'Zola publie le roman Germinal en librairie', date: '1885' },
    { ...P.courrieres, label: 'La catastrophe de Courrières frappe la mine', date: '1906' },
  ],
  libres: [
    {
      ...P.anzin,
      q: 'dans les mines de quelle ville du Nord Zola enquête-t-il pour écrire Germinal ? (un nom)',
      accepted: ['Anzin', 'anzin'],
      traps: [
        { text: 'Courrières', why: 'Courrières est connue pour la catastrophe de 1906.' },
        { text: 'Paris', why: 'Zola quitte Paris pour visiter des mines du Nord.' },
      ],
      explain: 'Pour se documenter, Zola se rend dans les mines d’Anzin.',
    },
    {
      ...P.unites,
      q: 'comment appelle-t-on la pièce ou le petit bâtiment où l’on fabrique des objets avec des outils ? (un mot)',
      accepted: ['atelier', 'un atelier', 'l’atelier', 'ateliers'],
      traps: [
        { text: 'usine', why: 'Une usine est un grand bâtiment, avec des machines.' },
        { text: 'mine', why: 'À la mine, on extrait le charbon.' },
      ],
      explain: 'Ce petit lieu de fabrication est l’atelier.',
    },
    {
      ...P.germinal,
      q: 'quel roman de Zola, publié en 1885, parle de la mine ? (un titre)',
      accepted: ['Germinal', 'germinal'],
      traps: [
        { text: 'Au Bonheur des Dames', why: 'Ce roman parle d’un grand magasin.' },
        { text: 'La Terre', why: 'Ce n’est pas le roman sur la mine.' },
      ],
      explain: 'Zola enquête dans les mines, puis publie Germinal en 1885.',
    },
    {
      ...P.lieux,
      q: 'où vend-on beaucoup de marchandises à Paris, comme au Bon Marché ? (deux mots)',
      accepted: [
        'grand magasin',
        'le grand magasin',
        'au grand magasin',
        'un grand magasin',
        'grands magasins',
        'les grands magasins',
      ],
      traps: [
        { text: 'atelier', why: 'Un atelier sert surtout à fabriquer.' },
        { text: 'mine', why: 'À la mine, on extrait le charbon.' },
      ],
      explain: 'Un très grand commerce aux nombreux rayons s’appelle un grand magasin.',
    },
    {
      ...P.enfant,
      q: 'dans la galerie décrite par Zola, qui conduit la première berline ? (un mot)',
      accepted: ['un enfant', 'enfant', 'l’enfant'],
      traps: [
        { text: 'ingénieur', why: 'L’ingénieur marche devant le visiteur : il ne conduit pas la berline.' },
        { text: 'cheval', why: 'Le cheval traîne les berlines : il ne les conduit pas.' },
      ],
      explain: 'Zola note qu’un enfant, assis sur la première berline, la conduit.',
    },
  ],
  docs: [
    {
      title: 'Carnet d’une visite sous terre',
      lines: [
        'La galerie est sombre, les lampes éclairent peu.',
        'Un roulement arrive : ce sont des wagonnets.',
        'Un cheval blanc les traîne.',
        'Un enfant est assis sur le premier : il conduit.',
      ],
      qs: [
        {
          ...P.cheval,
          q: 'Qui traîne les wagonnets ?',
          a: 'un cheval blanc',
          wrong: [
            { label: 'une locomotive à vapeur', why: 'Le texte nomme un animal.' },
            { label: 'l’ingénieur', why: 'Aucun ingénieur ne tire les wagonnets dans ce texte.' },
          ],
          explain: 'La troisième ligne désigne le cheval blanc.',
        },
        {
          ...P.berlines,
          q: 'Quel est le nom des wagonnets de ce texte ?',
          a: 'des berlines',
          wrong: [
            { label: 'des galeries', why: 'La galerie est le couloir sous terre.' },
            { label: 'des lampes', why: 'Les lampes servent à éclairer.' },
          ],
          explain: 'Les wagonnets de la mine sont les berlines.',
        },
        {
          ...P.enfant,
          q: 'Que montre ce texte sur le travail de cette époque ?',
          a: 'des enfants travaillaient à la mine',
          wrong: [
            {
              label: 'les enfants allaient seulement à l’école',
              why: 'La dernière ligne montre un enfant qui conduit les wagonnets.',
            },
            { label: 'seuls des adultes descendaient sous terre', why: 'Le texte montre un enfant dans la galerie.' },
          ],
          explain: 'La dernière ligne montre un enfant au travail.',
        },
      ],
    },
    {
      title: 'Au rayon des tissus',
      lines: [
        'À Paris, Lina entre dans un immense magasin.',
        'Chaque objet porte son prix, le même pour tous.',
        'Une affiche annonce une grande vente.',
        'Les employés mangent sur place deux fois par jour.',
      ],
      qs: [
        {
          ...P.pratiques,
          q: 'Quel lieu de travail Lina découvre-t-elle ?',
          a: 'un grand magasin',
          wrong: [
            { label: 'un atelier', why: 'Le texte montre des ventes, pas la fabrication d’objets.' },
            { label: 'une usine', why: 'Aucune machine ne fabrique d’objets dans ce texte.' },
          ],
          explain: 'Les prix affichés et la publicité montrent un grand magasin.',
        },
        {
          ...P.repas,
          q: 'D’après le texte, quel avantage reçoivent les employés ?',
          a: 'des repas sur place',
          wrong: [
            { label: 'un logement près du magasin', why: 'La dernière ligne ne parle pas de logement.' },
            { label: 'des journées plus courtes', why: 'La dernière ligne ne parle pas des horaires.' },
          ],
          explain: 'La dernière ligne parle des repas.',
        },
        {
          ...P.pratiques,
          q: 'Comment le magasin attire-t-il les clients dans la troisième ligne ?',
          a: 'avec une affiche publicitaire',
          wrong: [
            { label: 'en discutant chaque prix', why: 'La deuxième ligne dit que le prix est le même pour tous.' },
            { label: 'en offrant des repas aux clients', why: 'Les repas sont pour les employés.' },
          ],
          explain: 'L’affiche fait de la publicité.',
        },
      ],
    },
    {
      title: 'Deux lieux de travail',
      lines: [
        'Le matin, Jules entre dans une grande usine.',
        'Autour de lui, de grosses machines tournent.',
        'Sa tante travaille dans un petit atelier.',
        'Elle coud avec des aiguilles et des ciseaux.',
      ],
      qs: [
        {
          ...P.outils,
          q: 'Dans quel lieu de ce texte tournent de grosses machines ?',
          a: 'à l’usine',
          wrong: [
            { label: 'à l’atelier', why: 'La troisième ligne parle d’un petit atelier, sans grosses machines.' },
            { label: 'à la mine', why: 'Le texte ne parle pas de mine.' },
          ],
          explain: 'Les deux premières lignes montrent les machines de l’usine.',
        },
        {
          ...P.outils,
          q: 'Avec quels outils la tante travaille-t-elle ?',
          a: 'des aiguilles et des ciseaux',
          wrong: [
            { label: 'de grosses machines', why: 'Les grosses machines sont dans l’usine de Jules.' },
            { label: 'un pic et une lampe', why: 'Le texte ne montre pas le travail à la mine.' },
          ],
          explain: 'La dernière ligne cite les outils de la tante.',
        },
        {
          ...P.unites,
          q: 'Que montre ce texte sur le travail de cette époque ?',
          a: 'on travaille dans des lieux différents',
          wrong: [
            { label: 'tout le monde travaille à l’usine', why: 'La tante travaille dans un atelier.' },
            { label: 'les outils ont tous disparu', why: 'La tante utilise des aiguilles et des ciseaux.' },
          ],
          explain: 'Jules est à l’usine et sa tante à l’atelier : ce sont deux cadres de travail.',
        },
      ],
    },
  ],
};

const ville: Notion = {
  id: 'hcm2-ville-industrielle',
  title: 'La ville industrielle',
  hint: 'Relis le mémo : cherche les usines, les grands travaux et le logement des habitants.',
  memo: [
    'Les **villes** réunissent des usines, des commerces et des banques : elles grandissent comme jamais. C’est la **ville industrielle**. Les ouvriers ont du mal à s’y loger.',
    'À Paris, de 1853 à 1870, le **préfet** Haussmann transforme la ville : larges rues, réseaux d’eau et de gaz, parcs. Grâce à l’éclairage électrique, des travaux continuent la nuit. Mais des habitants pauvres subissent l’**expulsion** : ils doivent quitter leur logement. La misère s’installe dans les **banlieues**.',
    'Souvent, de grands patrons construisent des cités pour loger les ouvriers. La loi de 1894 concerne les **HBM** (habitations à bon marché). Pour le **métro**, on pense à des abonnements ouvriers : les mal-logés pourraient habiter en banlieue. Les travaux préparatoires commencent en 1898 et la première ligne ouvre à Paris en 1900.',
  ],
  faits: [
    {
      ...P.haussmann,
      q: 'Quel préfet transforme Paris de 1853 à 1870 ?',
      a: 'Haussmann',
      wrong: [
        { label: 'Jules Ferry', why: 'Jules Ferry est connu pour les lois sur l’école.' },
        { label: 'Émile Zola', why: 'Émile Zola est un écrivain.' },
        { label: 'Aristide Boucicaut', why: 'Aristide Boucicaut est le patron du Bon Marché.' },
      ],
      gap: ['Le préfet ', ' transforme Paris.', ['Haussmann', 'haussmann']],
      explain: 'Le préfet de la Seine, Haussmann, remodèle Paris.',
    },
    {
      ...P.villes,
      q: 'À l’âge industriel, que deviennent les villes qui réunissent les usines et le commerce ?',
      a: 'elles se développent beaucoup',
      wrong: [
        {
          label: 'elles se vident au profit des campagnes',
          why: 'Au contraire, les villes concentrent les activités.',
        },
        { label: 'elles gardent la même taille', why: 'Les usines et le commerce font grandir les villes.' },
        { label: 'elles perdent leurs commerces', why: 'Les villes concentrent aussi les activités commerciales.' },
      ],
      gap: [
        'Les villes connaissent un très fort ',
        ' : elles grandissent comme jamais.',
        ['développement', 'developpement', 'essor', 'agrandissement', 'accroissement'],
      ],
      explain: 'Les villes concentrent les activités et grandissent comme jamais.',
    },
    {
      ...P.reseaux,
      q: 'Quels réseaux sont créés pendant les travaux d’Haussmann ?',
      a: 'les réseaux d’eau et de gaz',
      wrong: [
        { label: 'l’électricité et le téléphone', why: 'Les réseaux créés par ces travaux transportent autre chose.' },
        {
          label: 'le chemin de fer et le tramway',
          why: 'Ce sont des transports : cherche ce qui arrive par des tuyaux.',
        },
        { label: 'le métro et l’autobus', why: 'La première ligne du métro ouvre bien plus tard, en 1900.' },
      ],
      gap: ['Haussmann fait créer des réseaux d’eau et de ', '.', ['gaz']],
      explain: 'Les travaux créent des réseaux d’eau et de gaz.',
    },
    {
      ...P.expulsion,
      q: 'Pour les habitants pauvres, quelle conséquence ont les grands travaux de Paris ?',
      a: 'l’expulsion : ils doivent quitter leur logement',
      wrong: [
        {
          label: 'un logement neuf offert au centre',
          why: 'Les petites gens ne sont pas relogées gratuitement au centre.',
        },
        { label: 'une baisse de leur loyer', why: 'Beaucoup doivent au contraire partir.' },
        { label: 'un emploi garanti sur les chantiers', why: 'Le mémo parle d’habitants qui doivent partir.' },
      ],
      gap: ['Des habitants pauvres sont chassés vers les ', '.', ['banlieues', 'banlieue']],
      explain: 'Beaucoup doivent partir et la misère s’installe dans les banlieues.',
    },
    {
      ...P.logement,
      q: 'Quand des usines apparaissent partout, quel problème se pose pour les ouvriers ?',
      a: 'trouver un logement',
      wrong: [
        { label: 'trouver une école', why: 'La question posée par les nouvelles usines concerne l’habitat.' },
        { label: 'trouver du charbon', why: 'La question posée par les nouvelles usines concerne l’habitat.' },
        { label: 'se nourrir au grand magasin', why: 'La question posée par les nouvelles usines concerne l’habitat.' },
      ],
      gap: ['La nombreuse main-d’œuvre doit trouver où se ', '.', ['loger']],
      explain: 'Les usines demandent beaucoup de bras, qu’il faut loger.',
    },
    {
      ...P.cites,
      q: 'Qui construit souvent les cités pour loger les ouvriers, avant le début du XXe siècle ?',
      a: 'de grands patrons',
      wrong: [
        { label: 'l’État surtout', why: 'Jusqu’au début du XXe siècle, ces projets sont surtout privés.' },
        { label: 'les ouvriers eux-mêmes', why: 'Les ouvriers habitent ces cités, que d’autres font construire.' },
        {
          label: 'le préfet Haussmann',
          why: 'Haussmann transforme Paris : les cités ouvrières sont souvent une autre initiative.',
        },
      ],
      gap: [
        'Souvent, de grands ',
        ' construisent des cités pour les ouvriers.',
        ['patrons', 'patron', 'industriels', 'industriel'],
      ],
      explain: 'Ce sont bien souvent les grands patrons qui construisent ces cités.',
    },
    {
      ...P.metroLigne,
      q: 'En quelle année ouvre la première ligne du métro de Paris ?',
      a: '1900',
      wrong: [
        { label: '1853', why: 'En 1853, les travaux d’Haussmann commencent.' },
        { label: '1870', why: 'En 1870, la période des travaux d’Haussmann se termine.' },
        { label: '1894', why: '1894 est l’année de la loi sur les HBM.' },
      ],
      gap: ['La première ligne du métro de Paris ouvre en ', '.', ['1900']],
      explain: 'La première ligne ouvre le 19 juillet 1900.',
    },
  ],
  paires3: [
    ['Haussmann', 'Le préfet qui transforme Paris'],
    ['HBM', 'Des habitations à bon marché'],
    ['Le métro', 'Un train qui circule dans la ville'],
  ],
  paires5: [
    ['Haussmann', 'Le préfet qui transforme Paris'],
    ['HBM', 'Des habitations à bon marché'],
    ['Le métro', 'Un train qui circule dans la ville'],
    ['La banlieue', 'Les alentours de la grande ville'],
    ['L’éclairage électrique', 'Ce qui permet de continuer les travaux la nuit'],
  ],
  frise: [
    { ...P.haussmann, label: 'Les grands travaux d’Haussmann commencent', date: '1853' },
    { ...P.hbm, label: 'La loi sur les HBM est votée', date: '1894' },
    { ...P.metroTravaux, label: 'Les travaux préparatoires du métro commencent', date: '1898' },
    { ...P.metroLigne, label: 'La première ligne du métro ouvre', date: '1900' },
  ],
  libres: [
    {
      ...P.haussmann,
      q: 'quel préfet remodèle Paris à partir de 1853 ? (un nom)',
      accepted: ['Haussmann', 'haussmann', 'Georges Eugène Haussmann', 'le baron Haussmann', 'baron Haussmann'],
      traps: [
        { text: 'Ferry', why: 'Jules Ferry s’occupe de l’école.' },
        { text: 'Zola', why: 'Zola est un écrivain.' },
      ],
      explain: 'Préfet de la Seine, Haussmann dirige les grands travaux de Paris.',
    },
    {
      ...P.metroTravaux,
      q: 'comment s’appelle, en abrégé, le chemin de fer métropolitain de Paris ? (un mot)',
      accepted: ['métro', 'metro', 'le métro', 'le metro'],
      traps: [
        { text: 'tramway', why: 'Le tramway roule dans les rues : cherche l’abréviation de métropolitain.' },
        { text: 'bus', why: 'Le bus n’a pas de rails.' },
      ],
      explain: '« Métro » est le nom court du chemin de fer métropolitain.',
    },
    {
      ...P.hbm,
      q: 'complète : HBM veut dire « habitations à … marché » (un mot).',
      accepted: ['bon'],
      traps: [
        { text: 'grand', why: 'Le B veut dire « bon ».' },
        { text: 'petit', why: 'Le mot commence par un B.' },
      ],
      explain: '« À bon marché » veut dire peu cher : ces logements sont faits pour coûter moins.',
    },
    {
      ...P.expulsion,
      q: 'les zones autour de la grande ville, où partent des habitants chassés, sont les … (un mot).',
      accepted: ['banlieues', 'banlieue', 'les banlieues'],
      traps: [
        { text: 'campagnes', why: 'La campagne est loin de la ville : cherche le mot pour ses alentours.' },
        { text: 'usines', why: 'Les usines sont des lieux de travail.' },
      ],
      explain: 'Les communes autour d’une grande ville forment la banlieue.',
    },
  ],
  docs: [
    {
      title: 'Le quartier de Gaspard',
      lines: [
        'À Paris, des maisons sont démolies près de chez Gaspard.',
        'Une large rue droite va les remplacer.',
        'La nuit, des lampes électriques éclairent le chantier.',
        'Sa famille doit partir habiter loin du centre.',
      ],
      qs: [
        {
          ...P.haussmann,
          q: 'Quel grand changement le quartier de Gaspard vit-il ?',
          a: 'les grands travaux de transformation de Paris',
          wrong: [
            { label: 'l’installation d’une ferme en ville', why: 'Le texte parle de démolitions et d’une large rue.' },
            { label: 'l’ouverture d’une mine de charbon', why: 'Le texte parle de maisons et de rues.' },
          ],
          explain: 'Démolitions et larges rues : ce sont les grands travaux d’Haussmann.',
        },
        {
          ...P.electricite,
          q: 'Pourquoi le chantier peut-il continuer la nuit ?',
          a: 'grâce à l’éclairage électrique',
          wrong: [
            { label: 'grâce à des lampes à gaz', why: 'La troisième ligne cite d’autres lampes.' },
            { label: 'grâce à des bougies', why: 'La troisième ligne parle de lampes électriques.' },
          ],
          explain: 'La troisième ligne cite les lampes électriques.',
        },
        {
          ...P.expulsion,
          q: 'Quelle conséquence la dernière ligne montre-t-elle ?',
          a: 'des habitants doivent s’éloigner du centre',
          wrong: [
            { label: 'des habitants s’installent plus près du centre', why: 'La dernière ligne dit le contraire.' },
            { label: 'des habitants gardent leur logement', why: 'La famille doit partir.' },
          ],
          explain: 'Les petites gens sont parfois chassées vers les banlieues.',
        },
      ],
    },
    {
      title: 'Le trajet de Rose',
      lines: [
        'Rose habite près d’une usine, en banlieue.',
        'Le logement est cher dans la grande ville.',
        'Un nouveau train circule dans Paris : le métro.',
        'On imagine des billets moins chers pour les ouvriers.',
      ],
      qs: [
        {
          ...P.abonnements,
          q: 'Pourquoi pense-t-on à des billets moins chers pour les ouvriers ?',
          a: 'pour qu’ils puissent se loger en banlieue',
          wrong: [
            { label: 'pour qu’ils partent en vacances', why: 'Le texte parle du logement près de la ville.' },
            {
              label: 'pour qu’ils retournent vivre aux champs',
              why: 'Le texte ne parle pas d’un retour à la campagne.',
            },
          ],
          explain: 'Le logement est cher en ville : des billets moins chers aideraient à habiter en banlieue.',
        },
        {
          ...P.villes,
          q: 'Que montre ce texte sur la ville industrielle ?',
          a: 'elle s’étend et les transports changent',
          wrong: [
            { label: 'elle reste petite et ne change pas', why: 'Le texte montre une banlieue et un nouveau train.' },
            { label: 'ses transports disparaissent', why: 'La troisième ligne cite un nouveau transport.' },
          ],
          explain: 'La ville grandit : banlieues, usines et métro.',
        },
      ],
    },
  ],
};

const rural: Notion = {
  id: 'hcm2-monde-rural',
  title: 'Le monde rural',
  hint: 'Relis le mémo : pense aux champs, aux paysans et à ce qui change à la campagne.',
  memo: [
    'Le **monde rural**, c’est la **campagne**. En 1846, les statistiques distinguent les communes rurales des communes urbaines, autour d’un **seuil** de 2 000 habitants.',
    'En 1849, un tableau de Rosa Bonheur montre des bœufs qui tirent la **charrue**. L’industrialisation change aussi les champs : un **engrais**, le **guano**, augmente beaucoup les **rendements**.',
    'À la fin du XIXe siècle, le train Scotte, à vapeur et sans rails, est conçu notamment pour les zones rurales. La campagne nourrit l’industrie en **denrées** agricoles. La **main-d’œuvre** paysanne alimente aussi les villes et les usines.',
  ],
  faits: [
    {
      ...P.seuil,
      q: 'En 1846, autour de combien d’habitants se fait la différence entre commune rurale et commune urbaine ?',
      a: '2 000 habitants',
      wrong: [
        { label: '500 habitants', why: 'Le seuil est plus élevé.' },
        { label: '20 000 habitants', why: 'Le seuil est dix fois plus petit.' },
        { label: '5 000 habitants', why: 'Le seuil est moins élevé.' },
      ],
      gap: ['En 1846, le seuil est d’environ ', ' habitants.', ['2 000', '2000', 'deux mille']],
      explain: 'La limite se situe autour de 2 000 habitants.',
    },
    {
      ...P.labour,
      q: 'En 1849, quels animaux tirent les charrues dans un célèbre tableau de la Nièvre ?',
      a: 'des bœufs',
      wrong: [
        { label: 'des chevaux', why: 'Ce tableau montre d’autres animaux.' },
        { label: 'des ânes', why: 'Ce tableau montre des animaux plus grands.' },
        { label: 'des mulets', why: 'Ce tableau montre d’autres animaux.' },
      ],
      gap: ['Des ', ' tirent les charrues dans le tableau de Rosa Bonheur.', ['bœufs', 'boeufs', 'bœuf', 'boeuf']],
      explain: 'Deux attelages de bœufs tirent les charrues.',
    },
    {
      ...P.tableau,
      q: 'Quelle artiste peint le labour dans la Nièvre ?',
      a: 'Rosa Bonheur',
      wrong: [
        { label: 'Gustave Courbet', why: 'Le mémo nomme une autre artiste pour ce tableau.' },
        { label: 'Jean-François Millet', why: 'Le mémo nomme une autre artiste pour ce tableau.' },
        { label: 'Claude Monet', why: 'Le mémo nomme une autre artiste pour ce tableau.' },
      ],
      gap: ['Le tableau du labour est peint par Rosa ', '.', ['Bonheur', 'bonheur']],
      explain: 'Rosa Bonheur a peint ce labour.',
    },
    {
      ...P.engrais,
      q: 'Quel effet l’engrais naturel appelé guano a-t-il sur l’agriculture ?',
      a: 'il augmente beaucoup les rendements',
      wrong: [
        { label: 'il fait baisser les rendements', why: 'Au contraire, le guano fait récolter davantage.' },
        { label: 'il remplace les bœufs pour labourer', why: 'Un engrais nourrit la terre : il ne laboure pas.' },
        { label: 'il protège les champs du gel', why: 'Le guano agit sur la quantité récoltée.' },
      ],
      gap: [
        'Le guano permet d’augmenter les ',
        '.',
        ['rendements', 'rendement', 'récoltes', 'récolte', 'recoltes', 'recolte'],
      ],
      explain: 'Avec cet engrais, on récolte bien davantage.',
    },
    {
      ...P.denrees,
      q: 'Que fournit la campagne à l’industrie ?',
      a: 'des denrées agricoles',
      wrong: [
        { label: 'des minerais', why: 'Les minerais sortent des mines et des carrières.' },
        { label: 'du charbon', why: 'Le charbon sort des mines.' },
        { label: 'des machines', why: 'Les machines servent à produire : elles ne poussent pas dans les champs.' },
      ],
      gap: ['L’industrie est alimentée en denrées ', '.', ['agricoles', 'agricole', 'alimentaires', 'alimentaire']],
      explain: 'Les produits des champs alimentent l’industrie.',
    },
    {
      ...P.scotte,
      q: 'Pour quelles zones le « train Scotte » à vapeur est-il notamment conçu ?',
      a: 'les zones rurales',
      wrong: [
        {
          label: 'les centres des grandes villes',
          why: 'Ce train vise surtout des lieux sans chemin de fer, à la campagne.',
        },
        { label: 'les galeries des mines', why: 'Dans les galeries roulent les berlines.' },
        { label: 'les ports de mer', why: 'Ce train est pensé pour la campagne.' },
      ],
      gap: ['Le train Scotte est conçu notamment pour les zones ', '.', ['rurales', 'rurale']],
      explain: 'Il est conçu notamment pour la campagne, d’abord pour transporter des marchandises.',
    },
    {
      ...P.paysans,
      q: 'Quelle main-d’œuvre alimente l’industrialisation et l’urbanisation de la France ?',
      a: 'la main-d’œuvre paysanne',
      wrong: [
        { label: 'la main-d’œuvre des marins', why: 'Le mémo parle de personnes venues des champs.' },
        { label: 'la main-d’œuvre des commerçants', why: 'Le mémo parle de personnes venues des champs.' },
        { label: 'la main-d’œuvre des soldats', why: 'Le mémo parle de personnes venues des champs.' },
      ],
      gap: ['La main-d’œuvre venue des champs s’appelle la main-d’œuvre ', '.', ['paysanne', 'rurale', 'agricole']],
      explain: 'Des paysans partent travailler dans les villes et les usines.',
    },
  ],
  paires3: [
    ['La charrue', 'L’outil qui retourne la terre'],
    ['L’engrais', 'Ce qui aide les plantes à pousser'],
    ['Le monde rural', 'La campagne'],
  ],
  paires5: [
    ['La charrue', 'L’outil qui retourne la terre'],
    ['L’engrais', 'Ce qui aide les plantes à pousser'],
    ['Le monde rural', 'La campagne'],
    ['Rosa Bonheur', 'La peintre du labour dans la Nièvre'],
    ['Le train Scotte', 'Un transport à vapeur conçu pour la campagne'],
  ],
  libres: [
    {
      ...P.labour,
      q: 'quel outil tiré par les bœufs retourne la terre ? (un mot)',
      accepted: ['charrue', 'la charrue', 'une charrue'],
      traps: [
        { text: 'râteau', why: 'Le râteau est tenu à la main.' },
        { text: 'berline', why: 'La berline est un wagonnet de mine.' },
      ],
      explain: 'Pour retourner la terre, les bœufs tirent une charrue.',
    },
    {
      ...P.rural,
      q: 'le monde … désigne la campagne (un mot).',
      accepted: ['rural'],
      traps: [
        { text: 'urbain', why: 'Urbain désigne la ville.' },
        { text: 'industriel', why: 'Industriel désigne les usines.' },
      ],
      explain: '« Rural » veut dire « de la campagne » ; son contraire est « urbain ».',
    },
    {
      ...P.seuil,
      q: 'en 1846, une commune est dite rurale ou urbaine autour d’un seuil de combien d’habitants ? (un nombre)',
      accepted: ['2000', '2 000', 'deux mille'],
      traps: [
        { text: '200', why: 'Il manque un zéro.' },
        { text: '20000', why: 'Il y a un zéro de trop.' },
      ],
      explain: 'Les statistiques placent la limite autour de 2 000 habitants.',
    },
    {
      ...P.engrais,
      q: 'les engrais font augmenter les …, c’est-à-dire ce que l’on récolte sur un champ (un mot).',
      accepted: [
        'rendements',
        'rendement',
        'les rendements',
        'récoltes',
        'récolte',
        'les récoltes',
        'recoltes',
        'recolte',
      ],
      traps: [
        { text: 'prix', why: 'On parle de la quantité récoltée.' },
        { text: 'impôts', why: 'L’impôt est une somme versée à l’État.' },
      ],
      explain: 'Le rendement mesure ce qu’un champ donne à la récolte.',
    },
  ],
  docs: [
    {
      title: 'La ferme de Louis',
      lines: [
        'Au milieu du XIXe siècle, Louis aide son père aux champs.',
        'Deux bœufs tirent la charrue dans la colline.',
        'Plus tard, un engrais fait pousser davantage de blé.',
        'Sa sœur part travailler à l’usine, en ville.',
      ],
      qs: [
        {
          ...P.engrais,
          q: 'Quel changement apporte l’engrais ?',
          a: 'on récolte davantage',
          wrong: [
            { label: 'on récolte moins', why: 'La troisième ligne dit que le blé pousse davantage.' },
            { label: 'on cesse de cultiver du blé', why: 'Le blé pousse toujours, et mieux.' },
          ],
          explain: 'La troisième ligne montre une récolte plus grande.',
        },
        {
          ...P.paysans,
          q: 'Que fait la sœur de Louis, comme d’autres paysans ?',
          a: 'elle quitte la campagne pour travailler en ville',
          wrong: [
            { label: 'elle quitte la ville pour travailler aux champs', why: 'La dernière ligne dit le contraire.' },
            { label: 'elle reste aux champs toute sa vie', why: 'La dernière ligne dit qu’elle part.' },
          ],
          explain: 'La main-d’œuvre paysanne alimente les usines et les villes.',
        },
        {
          ...P.labour,
          q: 'Dans ce texte, qu’est-ce qui tire la charrue ?',
          a: 'des animaux',
          wrong: [
            { label: 'une machine à vapeur', why: 'La deuxième ligne cite des bœufs.' },
            { label: 'le père de Louis', why: 'La deuxième ligne dit qui tire la charrue.' },
          ],
          explain: 'Les bœufs sont des animaux de trait.',
        },
      ],
    },
    {
      title: 'Le colis de la vallée',
      lines: [
        'Un village n’a pas encore de chemin de fer.',
        'Une voiture à vapeur sans rails y passe.',
        'Elle emporte les produits des champs.',
        'Ils partiront vers la ville.',
      ],
      qs: [
        {
          ...P.sansRail,
          q: 'Pourquoi cette voiture à vapeur est-elle utile au village ?',
          a: 'le chemin de fer n’y passe pas encore',
          wrong: [
            {
              label: 'un train y passe déjà chaque jour',
              why: 'La première ligne dit qu’il n’y a pas encore de chemin de fer.',
            },
            { label: 'elle remplace la charrue dans les champs', why: 'La voiture transporte des produits.' },
          ],
          explain: 'La première ligne dit qu’il n’y a pas encore de chemin de fer.',
        },
        {
          ...P.denrees,
          q: 'Que transporte la voiture ?',
          a: 'des produits agricoles',
          wrong: [
            { label: 'des minerais', why: 'Le texte ne parle pas de mine.' },
            { label: 'des machines d’usine', why: 'La troisième ligne cite les produits des champs.' },
          ],
          explain: 'La troisième ligne cite les produits des champs.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [energies, travail, ville, rural];

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'CM2'));
