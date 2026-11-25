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
    'La **machine à vapeur** utilise la vapeur d’eau pour produire un mouvement. Denis Papin en donne la première description en 1687. L’Écossais James Watt l’améliore au XVIIIe siècle : elle devient le **pilier** de la révolution industrielle.',
    'Puis arrivent d’autres inventions : le **moteur** de Lenoir en 1860 et une automobile à essence en 1884. Ces changements prennent beaucoup de temps.',
  ],
  faits: [
    {
      ...P.energies,
      q: 'Quelle est la première grande énergie de l’âge industriel ?',
      a: 'le charbon',
      wrong: [
        { label: 'l’énergie des fusées', why: 'Les fusées spatiales viennent bien plus tard.' },
        {
          label: 'l’énergie des piles de télécommande',
          why: 'Une petite pile ne peut pas faire tourner les grandes machines.',
        },
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
        {
          label: 'le bois des cabanes',
          why: 'Le bois est utilisé depuis très longtemps : il ne vient pas après le charbon.',
        },
        {
          label: 'la force des chevaliers',
          why: 'La force d’une personne n’est pas une des grandes énergies de cette époque.',
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
        { label: 'Jules Ferry', why: 'Jules Ferry est connu pour les lois sur l’école.' },
        { label: 'Louis XIV', why: 'Louis XIV est un roi, pas l’auteur de cette description.' },
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
        { label: 'Jules Ferry', why: 'Jules Ferry s’occupe de l’école, pas des machines.' },
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
        { label: 'la machine à écrire', why: 'La machine à écrire sert à rédiger des textes.' },
        { label: 'la console de jeux', why: 'La console de jeux est une invention bien plus récente.' },
        { label: 'le moulin à eau', why: 'Le moulin à eau existe depuis bien avant l’âge industriel.' },
      ],
      gap: ['La machine à ', ' est le pilier de la révolution industrielle.', ['vapeur']],
      explain: 'La machine à vapeur est au cœur de la révolution industrielle.',
    },
    {
      ...P.essence,
      q: 'En quelle année la première automobile à essence est-elle construite ?',
      a: '1884',
      wrong: [
        { label: '1789', why: '1789 est le début de la Révolution : pas encore d’automobile à essence.' },
        { label: '800', why: 'En 800, Charlemagne devient empereur.' },
        { label: '1687', why: '1687, c’est la machine à vapeur décrite par Papin.' },
      ],
      gap: ['La première automobile à essence est construite en ', '.', ['1884']],
      explain: 'En 1884, Édouard Delamare-Debouteville construit la première automobile à essence.',
    },
    {
      ...P.duree,
      q: 'L’industrialisation se fait-elle d’un seul coup ?',
      a: 'non, elle s’inscrit dans la durée',
      wrong: [
        { label: 'oui, en une seule journée', why: 'Un si grand changement ne peut pas se faire en un jour.' },
        { label: 'oui, pendant une seule fête', why: 'Une fête ne transforme pas les usines.' },
        { label: 'oui, en une seule année', why: 'Le changement dure bien plus qu’une année.' },
      ],
      gap: ['L’industrialisation est un processus qui s’inscrit dans la ', '.', ['durée', 'duree']],
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
    { ...P.essence, label: 'La première automobile à essence est construite', date: '1884' },
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
            { label: 'une machine à laver', why: 'Le texte ne parle pas de lavage : relis la troisième ligne.' },
            { label: 'une machine à voyager dans le temps', why: 'Cette machine n’existe pas dans le texte.' },
          ],
          explain: 'La troisième ligne cite la machine à coudre.',
        },
        {
          ...P.triomphe,
          q: 'Qu’est-ce qui triomphe dans cette exposition ?',
          a: 'la machine',
          wrong: [
            { label: 'le cheval de course', why: 'Le texte parle d’une galerie réservée à autre chose.' },
            { label: 'la couronne du roi', why: 'Aucune couronne dans ce texte.' },
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
            { label: 'à l’énergie solaire', why: 'Le texte ne parle pas du soleil.' },
            { label: 'avec des piles', why: 'Le texte ne parle pas de piles.' },
          ],
          explain: 'La troisième ligne dit que les machines marchent à la vapeur.',
        },
        {
          ...P.navigation,
          q: 'Quel transport utilise lui aussi la vapeur ?',
          a: 'les bateaux',
          wrong: [
            { label: 'les fusées', why: 'Aucune fusée dans ce texte.' },
            { label: 'les vélos', why: 'Le texte ne parle pas de vélos.' },
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
    'À l’âge industriel, de nouveaux métiers apparaissent. On travaille à la **mine**, à l’**usine**, à l’**atelier** ou au **grand magasin**.',
    'Au fond de la mine, on extrait le charbon. L’écrivain Émile Zola l’a visitée : il décrit des trains de **berlines**, un cheval qui les traîne et un enfant qui les conduit. Le travail y est dangereux : à Courrières, en 1906, une **catastrophe** est très meurtrière.',
    'Le Bon Marché est un grand magasin de Paris. Dans son roman Au Bonheur des dames, Zola en montre un : prix fixes et affichés, et publicité pour attirer les clients.',
  ],
  faits: [
    {
      ...P.lieux,
      q: 'Où travaille un mineur ?',
      a: 'à la mine',
      wrong: [
        { label: 'dans un château de roi', why: 'Un château n’est pas un lieu où l’on extrait du charbon.' },
        { label: 'dans une école', why: 'L’école sert à apprendre.' },
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
        { label: 'Marseille', why: 'Marseille est un grand port du Sud.' },
        { label: 'Versailles', why: 'Versailles est connue pour son château.' },
        { label: 'Courrières', why: 'Courrières est connue pour la catastrophe de 1906.' },
      ],
      gap: ['Zola visite les mines d’', ' pour écrire Germinal.', ['Anzin', 'anzin']],
      explain: 'Pour son roman Germinal, Zola enquête dans les mines d’Anzin.',
    },
    {
      ...P.berlines,
      q: 'Dans la galerie, qu’est-ce qu’un « train de berlines » ?',
      a: 'une file de petits wagons de mine',
      wrong: [
        { label: 'un train de voyageurs pour la mer', why: 'Ce train roule sous la terre, pas vers la plage.' },
        { label: 'une file de voitures de roi', why: 'Les rois n’ont rien à voir avec la mine.' },
        { label: 'une machine qui coud', why: 'Les berlines servent à transporter, pas à coudre.' },
      ],
      gap: ['Au fond de la mine roule un train de ', '.', ['berlines', 'berline']],
      explain: 'Les berlines sont les wagonnets qui circulent dans les galeries.',
    },
    {
      ...P.cheval,
      q: 'Dans la mine décrite par Zola, quel animal traîne les berlines ?',
      a: 'un cheval',
      wrong: [
        { label: 'un éléphant', why: 'Zola ne parle pas d’éléphant.' },
        { label: 'un dauphin', why: 'Un dauphin vit dans la mer.' },
        { label: 'un bœuf', why: 'Les bœufs tirent des charrues aux champs ; Zola décrit un autre animal.' },
      ],
      gap: ['Dans la galerie, un ', ' blanc traîne les berlines.', ['cheval']],
      explain: 'Zola aperçoit un cheval blanc qui traîne le train.',
    },
    {
      ...P.courrieres,
      q: 'Quelle catastrophe minière de 1906 est la plus meurtrière ?',
      a: 'celle de Courrières',
      wrong: [
        { label: 'celle de Versailles', why: 'Versailles n’est pas une mine.' },
        { label: 'celle d’Athènes', why: 'Athènes est une cité grecque de l’Antiquité.' },
        { label: 'celle d’Anzin', why: 'Anzin est la ville où Zola enquête.' },
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
        { label: 'la journée de zéro heure', why: 'Les mineurs continuent à travailler.' },
        { label: 'la journée de cent heures', why: 'Un jour ne compte que vingt-quatre heures.' },
        { label: 'la journée de vingt heures', why: 'La loi limite la journée bien plus tôt.' },
      ],
      gap: ['La journée de travail des mineurs passe à ', ' heures.', ['huit', '8']],
      explain: 'Au début du XXe siècle, la journée de huit heures est instaurée pour les mineurs.',
    },
    {
      ...P.pratiques,
      q: 'Dans le grand magasin du roman de Zola, comment sont les prix ?',
      a: 'fixes et affichés',
      wrong: [
        { label: 'secrets et jamais écrits', why: 'Dans ces magasins, au contraire, on voit les prix.' },
        { label: 'payés seulement en pommes', why: 'Les clients paient avec de l’argent.' },
        { label: 'choisis au hasard par chaque client', why: 'Un prix fixe ne change pas selon le client.' },
      ],
      gap: ['Au grand magasin, les prix sont fixes et ', '.', ['affichés', 'affiches', 'affiché']],
      explain: 'Les prix sont fixes et affichés : tout le monde les voit.',
    },
    {
      ...P.repas,
      q: 'Au magasin d’Aristide Boucicaut, à quoi chaque employé a-t-il droit chaque jour ?',
      a: 'deux repas complets',
      wrong: [
        { label: 'un voyage en bateau', why: 'Le règlement ne parle pas de voyage.' },
        { label: 'un cheval', why: 'Le règlement parle de nourriture.' },
        { label: 'dix goûters', why: 'Le règlement parle de repas, et il y en a moins.' },
      ],
      gap: ['Chaque employé a droit à ', ' repas par jour.', ['deux', '2']],
      explain: 'Le règlement prévoit deux repas gratuits par jour.',
    },
  ],
  paires3: [
    ['La mine', 'Le lieu où l’on extrait le charbon'],
    ['Le grand magasin', 'Le lieu où l’on vend des marchandises très variées'],
    ['La berline', 'Un petit wagon qui roule dans les galeries'],
  ],
  paires5: [
    ['La mine', 'Le lieu où l’on extrait le charbon'],
    ['Le grand magasin', 'Le lieu où l’on vend des marchandises très variées'],
    ['La berline', 'Un petit wagon qui roule dans les galeries'],
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
      ...P.lieux,
      q: 'le mineur travaille à la … (un mot).',
      accepted: ['mine', 'la mine'],
      traps: [
        { text: 'usine', why: 'À l’usine, on fabrique avec des machines : le mineur creuse sous terre.' },
        { text: 'école', why: 'On n’extrait pas de charbon à l’école.' },
      ],
      explain: 'Le mineur extrait le charbon : son lieu de travail est la mine.',
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
        { text: 'roi', why: 'Aucun roi dans cette galerie.' },
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
            { label: 'la mine était un terrain de jeux', why: 'L’enfant conduit un train : c’est un travail.' },
            { label: 'seuls des rois travaillaient à la mine', why: 'Aucun roi dans ce texte.' },
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
            { label: 'une mine', why: 'Il n’y a ni galerie ni charbon.' },
            { label: 'une ferme', why: 'Le texte parle de ventes à Paris.' },
          ],
          explain: 'Les prix affichés et la publicité montrent un grand magasin.',
        },
        {
          ...P.repas,
          q: 'D’après le texte, quel avantage reçoivent les employés ?',
          a: 'des repas sur place',
          wrong: [
            { label: 'des vacances sur la Lune', why: 'Le texte parle de repas.' },
            { label: 'un château', why: 'Aucun château n’est cité.' },
          ],
          explain: 'La dernière ligne parle des repas.',
        },
        {
          ...P.pratiques,
          q: 'Comment le magasin attire-t-il les clients dans la troisième ligne ?',
          a: 'avec une affiche publicitaire',
          wrong: [
            { label: 'en cachant les prix', why: 'La deuxième ligne montre le contraire.' },
            { label: 'avec un train de berlines', why: 'Les berlines sont à la mine.' },
          ],
          explain: 'L’affiche fait de la publicité.',
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
    'À Paris, de 1853 à 1870, le **préfet** Haussmann transforme la ville : larges rues, réseaux d’eau et de gaz, parcs. Mais des habitants pauvres sont chassés vers les **banlieues**.',
    'Plus tard, la loi de 1894 encourage les **HBM** (habitations à bon marché). En 1900, la première ligne du **métro** ouvre à Paris.',
  ],
  faits: [
    {
      ...P.haussmann,
      q: 'Quel préfet transforme Paris de 1853 à 1870 ?',
      a: 'Haussmann',
      wrong: [
        { label: 'Charlemagne', why: 'Charlemagne est empereur au Moyen Âge.' },
        { label: 'James Watt', why: 'James Watt s’occupe de la machine à vapeur.' },
        { label: 'Jules Ferry', why: 'Jules Ferry est connu pour les lois sur l’école.' },
      ],
      gap: ['Le préfet ', ' transforme Paris.', ['Haussmann', 'haussmann']],
      explain: 'Le préfet de la Seine, Haussmann, remodèle Paris.',
    },
    {
      ...P.villes,
      q: 'À l’âge industriel, que deviennent les villes qui réunissent les usines et le commerce ?',
      a: 'elles se développent beaucoup',
      wrong: [
        { label: 'elles disparaissent toutes', why: 'Au contraire, les villes attirent les activités.' },
        { label: 'elles flottent sur la mer', why: 'Une ville industrielle reste sur la terre.' },
        { label: 'elles restent exactement pareilles', why: 'Les grands travaux et les usines les changent.' },
      ],
      gap: ['Les villes connaissent un ', ' sans précédent.', ['développement', 'developpement']],
      explain: 'Les villes concentrent les activités et grandissent comme jamais.',
    },
    {
      ...P.reseaux,
      q: 'Quels réseaux sont créés pendant les travaux d’Haussmann ?',
      a: 'les réseaux d’eau et de gaz',
      wrong: [
        {
          label: 'les réseaux de téléphones portables',
          why: 'Les téléphones portables n’existent pas à cette époque.',
        },
        { label: 'les réseaux de jeux en ligne', why: 'Les jeux en ligne sont très récents.' },
        { label: 'les réseaux de pétrole sous les maisons', why: 'Les travaux parlent d’eau et de gaz.' },
      ],
      gap: ['Haussmann fait créer des réseaux d’eau et de ', '.', ['gaz']],
      explain: 'Les travaux créent des réseaux d’eau et de gaz.',
    },
    {
      ...P.expulsion,
      q: 'Pour les habitants pauvres, quel est le prix des grands travaux de Paris ?',
      a: 'l’expulsion vers les banlieues',
      wrong: [
        { label: 'un château offert à chacun', why: 'Les pauvres ne reçoivent pas de château.' },
        { label: 'un voyage en Chine', why: 'Les travaux ne font pas voyager les habitants au loin.' },
        { label: 'des vacances au bord de la mer', why: 'Ils perdent leur logement : ce ne sont pas des vacances.' },
      ],
      gap: ['Des habitants pauvres sont chassés vers les ', '.', ['banlieues', 'banlieue']],
      explain: 'Beaucoup doivent partir et la misère s’installe dans les banlieues.',
    },
    {
      ...P.logement,
      q: 'Quand des usines apparaissent partout, quel problème se pose pour les ouvriers ?',
      a: 'trouver un logement',
      wrong: [
        { label: 'trouver des dragons', why: 'Il n’y a pas de dragons dans les usines.' },
        { label: 'apprendre à bâtir des pyramides', why: 'Les pyramides sont antiques.' },
        { label: 'trouver un trône', why: 'Les ouvriers ne cherchent pas à régner.' },
      ],
      gap: ['La nombreuse main-d’œuvre doit trouver où se ', '.', ['loger']],
      explain: 'Les usines demandent beaucoup de bras, qu’il faut loger.',
    },
    {
      ...P.cites,
      q: 'Qui construit souvent les cités pour loger les ouvriers, avant le début du XXe siècle ?',
      a: 'de grands patrons',
      wrong: [
        { label: 'les chevaliers', why: 'Les chevaliers appartiennent au Moyen Âge.' },
        { label: 'les enfants de l’école', why: 'Les enfants ne construisent pas des cités.' },
        { label: 'les Romains', why: 'Les Romains vivent dans l’Antiquité.' },
      ],
      gap: ['Souvent, de grands ', ' construisent des cités pour les ouvriers.', ['patrons', 'patron']],
      explain: 'Ce sont bien souvent les grands patrons qui construisent ces cités.',
    },
    {
      ...P.metroLigne,
      q: 'En quelle année ouvre la première ligne du métro de Paris ?',
      a: '1900',
      wrong: [
        { label: '1789', why: '1789 est le début de la Révolution.' },
        { label: '800', why: 'En 800, il n’y a pas de métro.' },
        { label: '1853', why: 'En 1853, les travaux d’Haussmann commencent.' },
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
            { label: 'la construction d’un château fort', why: 'Les châteaux forts sont du Moyen Âge.' },
            { label: 'la découverte d’une mine d’or', why: 'Le texte parle de maisons et de rues.' },
          ],
          explain: 'Démolitions et larges rues : ce sont les grands travaux d’Haussmann.',
        },
        {
          ...P.electricite,
          q: 'Pourquoi le chantier peut-il continuer la nuit ?',
          a: 'grâce à l’éclairage électrique',
          wrong: [
            { label: 'grâce à la lumière des bougies du roi', why: 'Le texte parle de lampes électriques.' },
            { label: 'parce qu’il fait jour toute la nuit', why: 'La nuit reste sombre sans lampes.' },
          ],
          explain: 'La troisième ligne cite les lampes électriques.',
        },
        {
          ...P.expulsion,
          q: 'Quelle conséquence la dernière ligne montre-t-elle ?',
          a: 'des habitants doivent s’éloigner du centre',
          wrong: [
            { label: 'tous les habitants deviennent riches', why: 'La famille perd son logement.' },
            { label: 'la ville se vide de ses rues', why: 'Au contraire, une nouvelle rue est créée.' },
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
          q: 'Pourquoi pense-t-on à des tarifs avantageux pour les ouvriers ?',
          a: 'pour que les mal-logés puissent habiter en banlieue',
          wrong: [
            { label: 'pour qu’ils partent en croisière', why: 'Le métro ne va pas en mer.' },
            { label: 'pour que les rois voyagent seuls', why: 'Les rois ne sont pas concernés.' },
          ],
          explain: 'Des abonnements ouvriers aident ceux qui se logent en banlieue.',
        },
        {
          ...P.villes,
          q: 'Que montre ce texte sur la ville industrielle ?',
          a: 'elle s’étend et les transports changent',
          wrong: [
            { label: 'elle ne compte aucune usine', why: 'La première ligne cite une usine.' },
            { label: 'personne n’y travaille', why: 'Les ouvriers y travaillent.' },
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
    'La campagne nourrit l’industrie en **denrées** agricoles. La **main-d’œuvre** paysanne alimente aussi les villes et les usines.',
  ],
  faits: [
    {
      ...P.seuil,
      q: 'En 1846, autour de combien d’habitants se fait la différence entre commune rurale et commune urbaine ?',
      a: '2 000 habitants',
      wrong: [
        { label: '2 habitants', why: 'Deux personnes ne forment pas une ville.' },
        { label: '200 millions d’habitants', why: 'Ce nombre dépasse de loin une commune.' },
        { label: '20 000 habitants', why: 'Le seuil est dix fois plus petit.' },
      ],
      gap: ['En 1846, le seuil est d’environ ', ' habitants.', ['2 000', '2000', 'deux mille']],
      explain: 'La limite se situe autour de 2 000 habitants.',
    },
    {
      ...P.labour,
      q: 'En 1849, quels animaux tirent les charrues dans un célèbre tableau de la Nièvre ?',
      a: 'des bœufs',
      wrong: [
        { label: 'des dauphins', why: 'Les dauphins vivent dans la mer.' },
        { label: 'des lions', why: 'Les lions ne labourent pas les champs.' },
        { label: 'des chiens', why: 'Les chiens sont trop petits pour tirer cette charrue.' },
      ],
      gap: ['Des ', ' tirent les charrues dans le tableau de Rosa Bonheur.', ['bœufs', 'boeufs', 'bœuf', 'boeuf']],
      explain: 'Deux attelages de bœufs tirent les charrues.',
    },
    {
      ...P.tableau,
      q: 'Quelle artiste peint le labour dans la Nièvre ?',
      a: 'Rosa Bonheur',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV est un roi.' },
        { label: 'James Watt', why: 'Watt est un ingénieur.' },
        { label: 'Hubertine Auclert', why: 'Hubertine Auclert est connue pour son combat pour le vote des femmes.' },
      ],
      gap: ['Le tableau du labour est peint par Rosa ', '.', ['Bonheur', 'bonheur']],
      explain: 'Rosa Bonheur a peint ce labour.',
    },
    {
      ...P.engrais,
      q: 'Quel effet l’engrais naturel appelé guano a-t-il sur l’agriculture ?',
      a: 'il augmente beaucoup les rendements',
      wrong: [
        { label: 'il fait disparaître les champs', why: 'Au contraire, il aide les plantes.' },
        { label: 'il transforme le blé en charbon', why: 'Aucun engrais ne fait cela.' },
        { label: 'il arrête la pluie', why: 'Un engrais ne change pas la météo.' },
      ],
      gap: ['Le guano permet d’augmenter les ', '.', ['rendements', 'rendement']],
      explain: 'Avec cet engrais, on récolte bien davantage.',
    },
    {
      ...P.denrees,
      q: 'Que fournit la campagne à l’industrie ?',
      a: 'des denrées agricoles',
      wrong: [
        { label: 'des fusées', why: 'Les champs ne produisent pas de fusées.' },
        { label: 'des trônes', why: 'Un trône n’est pas un produit agricole.' },
        { label: 'des téléphones', why: 'Les téléphones ne poussent pas dans les champs.' },
      ],
      gap: ['L’industrie est alimentée en denrées ', '.', ['agricoles', 'agricole']],
      explain: 'Les produits des champs alimentent l’industrie.',
    },
    {
      ...P.scotte,
      q: 'Pour quelles zones le « train Scotte » à vapeur est-il d’abord conçu ?',
      a: 'les zones rurales',
      wrong: [
        { label: 'les fonds marins', why: 'Un train ne roule pas sous l’océan.' },
        { label: 'la Lune', why: 'Personne ne roulait sur la Lune.' },
        { label: 'les couloirs des châteaux', why: 'Ce train transporte des marchandises à la campagne.' },
      ],
      gap: ['Le train Scotte est conçu notamment pour les zones ', '.', ['rurales', 'rurale']],
      explain: 'Il sert d’abord à transporter des marchandises à la campagne.',
    },
    {
      ...P.paysans,
      q: 'Quelle main-d’œuvre alimente l’industrialisation et l’urbanisation de la France ?',
      a: 'la main-d’œuvre paysanne',
      wrong: [
        { label: 'les chevaliers', why: 'Les chevaliers appartiennent au Moyen Âge.' },
        { label: 'les robots', why: 'Les robots sont bien plus récents.' },
        { label: 'les rois', why: 'Les rois ne travaillent pas à l’usine.' },
      ],
      gap: ['Les villes et les usines reçoivent une main-d’œuvre ', '.', ['paysanne']],
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
      accepted: ['rendements', 'rendement', 'les rendements'],
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
        'Au milieu du siècle, Louis aide son père aux champs.',
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
            { label: 'les bœufs apprennent à lire', why: 'Le texte ne parle que de la récolte.' },
            { label: 'le blé disparaît', why: 'Le blé pousse mieux.' },
          ],
          explain: 'La troisième ligne montre une récolte plus grande.',
        },
        {
          ...P.paysans,
          q: 'Que fait la sœur de Louis, comme d’autres paysans ?',
          a: 'elle quitte la campagne pour travailler en ville',
          wrong: [
            { label: 'elle devient reine', why: 'Le texte parle d’une usine.' },
            { label: 'elle reste aux champs toute sa vie', why: 'La dernière ligne dit qu’elle part.' },
          ],
          explain: 'La main-d’œuvre paysanne alimente les usines et les villes.',
        },
        {
          ...P.labour,
          q: 'Dans ce texte, qu’est-ce qui tire la charrue ?',
          a: 'des animaux',
          wrong: [
            { label: 'une automobile électrique', why: 'Le texte cite des bœufs.' },
            { label: 'un train de berlines', why: 'Les berlines sont à la mine.' },
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
            { label: 'le village est au fond de la mer', why: 'Le texte parle d’un village à la campagne.' },
            { label: 'personne n’y cultive rien', why: 'La troisième ligne cite les produits des champs.' },
          ],
          explain: 'La première ligne dit qu’il n’y a pas encore de chemin de fer.',
        },
        {
          ...P.denrees,
          q: 'Que transporte la voiture ?',
          a: 'des produits agricoles',
          wrong: [
            { label: 'des couronnes', why: 'Aucune couronne dans le texte.' },
            { label: 'des ouvriers de la Lune', why: 'Le texte parle des champs.' },
          ],
          explain: 'La troisième ligne cite les produits des champs.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [energies, travail, ville, rural];

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'CM2'));
