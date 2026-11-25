import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './guerres-europe-sources.ts';

/**
 * CM2, thème 3 « La France, des guerres mondiales à l’Union européenne » (lot hi-cm2-03). Chaque fait cite une source
 * institutionnelle ; les textes à lire du niveau 5 sont écrits pour l’exercice.
 */
export const SOURCE = 'cycle3-2020';

const premiere: Notion = {
  id: 'hcm2-premiere-guerre',
  title: 'La Première Guerre mondiale',
  hint: 'Relis le mémo : cherche les dates, l’armistice et les personnes touchées par la guerre.',
  memo: [
    'La **Première Guerre mondiale** dure de 1914 à 1918. On l’appelle aussi la **Grande Guerre**. Les soldats français sont surnommés les **poilus**. Au front, ils vivent dans des **tranchées**.',
    'Quelques repères : la bataille de la Marne en 1914, celle de Verdun en 1916. En 1917, les États-Unis entrent en guerre. Le 11 novembre 1918, l’**armistice** arrête les combats. La paix est signée à Versailles en 1919.',
    'Le bilan est terrible : plus de 9 millions de morts et disparus, dont environ 1,4 million pour la France. Les **civils**, qui ne sont pas soldats, souffrent aussi. Des villes comme Lens sont détruites.',
  ],
  faits: [
    {
      ...P.dates1418,
      q: 'En quelles années se déroule la Première Guerre mondiale ?',
      a: 'de 1914 à 1918',
      wrong: [
        { label: 'de 1789 à 1799', why: 'Ces années sont celles de la Révolution française.' },
        { label: 'de 1939 à 1945', why: 'Ce sont les années de la Seconde Guerre mondiale.' },
        { label: 'de 1870 à 1871', why: 'C’est une guerre plus ancienne, au XIXe siècle.' },
      ],
      gap: ['La guerre de 1914-', ' est un conflit très meurtrier.', ['1918']],
      explain: 'La Grande Guerre commence en 1914 et s’achève en 1918.',
    },
    {
      ...P.grandeGuerre,
      q: 'Quel autre nom donne-t-on à la Première Guerre mondiale ?',
      a: 'la Grande Guerre',
      wrong: [
        { label: 'la guerre de Cent Ans', why: 'C’est un conflit du Moyen Âge.' },
        { label: 'les guerres de religion', why: 'Elles ont lieu au XVIe siècle, au temps des rois.' },
        { label: 'la guerre froide', why: 'Elle commence après la Seconde Guerre mondiale.' },
      ],
      gap: ['La Première Guerre mondiale est aussi appelée la Grande ', '.', ['Guerre', 'guerre']],
      explain: 'Les contemporains l’ont appelée la Grande Guerre.',
    },
    {
      ...P.cessez,
      q: 'Quel jour de 1918 les combats s’arrêtent-ils ?',
      a: 'le 11 novembre',
      wrong: [
        { label: 'le 14 juillet', why: 'C’est le jour de la fête nationale, liée à la Révolution.' },
        { label: 'le 8 mai', why: 'Le 8 mai rappelle la fin d’une autre guerre, en 1945.' },
        { label: 'le 28 juin', why: 'Le 28 juin 1919, on signe la paix à Versailles, plus tard.' },
      ],
      gap: ['En 1918, les combats s’arrêtent le 11 ', '.', ['novembre']],
      explain: 'Le 11 novembre 1918, les combats sont suspendus à 11 heures.',
    },
    {
      ...P.armistice,
      q: 'Qu’est-ce qu’un armistice ?',
      a: 'un arrêt provisoire des combats pour négocier',
      wrong: [
        { label: 'le début d’une guerre', why: 'C’est le contraire : on arrête de se battre.' },
        { label: 'une grande bataille', why: 'Pendant un armistice, on ne se bat plus.' },
        { label: 'le traité de paix définitif', why: 'La paix définitive est signée plus tard, par un traité.' },
      ],
      gap: ['L’arrêt provisoire des combats pour négocier s’appelle un ', '.', ['armistice']],
      explain: 'L’armistice suspend les combats en attendant la paix.',
    },
    {
      ...P.versailles,
      q: 'Dans quelle ville la paix est-elle signée le 28 juin 1919 ?',
      a: 'à Versailles',
      wrong: [
        {
          label: 'à Londres',
          why: 'Londres est la capitale du Royaume-Uni : ce n’est pas le lieu de cette signature.',
        },
        { label: 'à Verdun', why: 'Verdun est le lieu d’une grande bataille en 1916.' },
        { label: 'à Rethondes', why: 'À Rethondes, on signe l’armistice en novembre 1918.' },
      ],
      gap: ['Le 28 juin 1919, la paix est signée à ', '.', ['Versailles', 'versailles']],
      explain: 'La signature à Versailles met vraiment fin à la guerre.',
    },
    {
      ...P.morts,
      q: 'Combien de morts et disparus la guerre fait-elle pour la France ?',
      a: 'environ 1,4 million',
      wrong: [
        { label: 'environ 1 400', why: 'Le nombre est mille fois plus grand : la guerre touche tout le pays.' },
        { label: 'environ 14 000', why: 'Le bilan est bien plus lourd.' },
        { label: 'environ 140 millions', why: 'C’est bien plus que toute la population de la France.' },
      ],
      gap: ['La France compte environ 1,4 ', ' de morts et disparus.', ['million', 'millions']],
      explain: 'Le conflit fait plus de 9 millions de morts et disparus, dont 1,4 million pour la France.',
    },
    {
      ...P.civils,
      q: 'Que vivent les civils pendant la Grande Guerre ?',
      a: 'ils souffrent eux aussi de la violence de la guerre',
      wrong: [
        { label: 'ils ne sont jamais touchés', why: 'La guerre atteint aussi les personnes qui ne combattent pas.' },
        { label: 'ils vivent comme en temps de paix', why: 'La guerre bouleverse leur vie.' },
        { label: 'seuls les soldats souffrent', why: 'Les civils sont touchés de bien des manières.' },
      ],
      gap: ['Les personnes qui ne sont pas soldats sont appelées les ', '.', ['civils', 'civil']],
      explain: 'Invasion, bombardements, deuils : les civils sont aussi frappés.',
    },
  ],
  paires3: [
    ['Un armistice', 'un arrêt provisoire des combats'],
    ['Un poilu', 'un surnom des soldats français'],
    ['1916', 'la bataille de Verdun'],
  ],
  paires5: [
    ['Un armistice', 'un arrêt provisoire des combats'],
    ['Un poilu', 'un surnom des soldats français'],
    ['1916', 'la bataille de Verdun'],
    ['1917', 'l’entrée en guerre des États-Unis'],
    ['1919', 'la signature de la paix à Versailles'],
  ],
  frise: [
    { ...P.marne, label: 'La bataille de la Marne', date: '1914' },
    { ...P.verdun, label: 'La bataille de Verdun', date: '1916' },
    { ...P.etatsUnis, label: 'L’entrée en guerre des États-Unis', date: '1917' },
    { ...P.rethondes, label: 'L’armistice signé à Rethondes', date: '1918' },
    { ...P.versailles, label: 'La paix signée à Versailles', date: '1919' },
  ],
  libres: [
    {
      ...P.verdun,
      q: 'quelle ville de l’est de la France donne son nom à une grande bataille de 1916 ? (un mot)',
      accepted: ['Verdun', 'verdun'],
      traps: [
        { text: 'Marne', why: 'La Marne est une rivière ; sa première bataille date de 1914.' },
        { text: 'Versailles', why: 'À Versailles, on signe la paix en 1919.' },
      ],
      explain: 'La bataille de Verdun dure de février à décembre 1916.',
    },
    {
      ...P.poilus,
      q: 'quel surnom donne-t-on aux soldats français de la Grande Guerre ? (un mot, au pluriel)',
      accepted: ['poilus', 'les poilus', 'Poilus'],
      traps: [
        { text: 'grognards', why: 'Les grognards sont les soldats de Napoléon.' },
        { text: 'résistants', why: 'On parle de résistants pendant la Seconde Guerre mondiale.' },
      ],
      explain: 'Les soldats de 1914-1918 sont surnommés les poilus.',
    },
    {
      ...P.cessez,
      q: 'en quelle année les combats de la Grande Guerre s’arrêtent-ils ? (en chiffres)',
      accepted: ['1918'],
      traps: [
        { text: '1914', why: '1914 est l’année du début de la guerre.' },
        { text: '1945', why: '1945 est la fin de la Seconde Guerre mondiale.' },
      ],
      explain: 'L’armistice date du 11 novembre 1918.',
    },
    {
      ...P.etatsUnis,
      q: 'en 1917, quel grand pays d’Amérique entre en guerre ? (deux mots)',
      accepted: ['les États-Unis', 'États-Unis', 'Etats-Unis', 'les Etats-Unis'],
      traps: [
        { text: 'Canada', why: 'Le grand pays attendu ici est le voisin du sud du Canada.' },
        { text: 'Brésil', why: 'Cherche un pays d’Amérique du Nord.' },
      ],
      explain: 'L’entrée en guerre des États-Unis date de 1917.',
    },
  ],
  docs: [
    {
      title: 'Au village de Jeanne',
      lines: [
        '1914 : le père de Jeanne part combattre.',
        'Il vit dans une tranchée, avec les autres poilus.',
        'Au village, Jeanne et sa mère attendent des nouvelles.',
        'Le 11 novembre 1918, les cloches sonnent : les combats s’arrêtent.',
      ],
      qs: [
        {
          ...P.cessez,
          q: 'Que se passe-t-il le 11 novembre 1918 ?',
          a: 'les combats s’arrêtent',
          wrong: [
            { label: 'la guerre commence', why: 'La première ligne place le départ en 1914.' },
            { label: 'la bataille de Verdun commence', why: 'Relis la dernière ligne : on ne se bat plus.' },
          ],
          explain: 'La dernière ligne dit que les combats s’arrêtent.',
        },
        {
          ...P.civils,
          q: 'Qui, dans ce texte, est un civil touché par la guerre ?',
          a: 'Jeanne',
          wrong: [
            { label: 'le père parti combattre', why: 'Il combat : il est soldat.' },
            { label: 'les poilus de la tranchée', why: 'Les poilus sont des soldats.' },
          ],
          explain: 'Jeanne n’est pas soldat, mais la guerre bouleverse sa vie.',
        },
      ],
    },
    {
      title: 'Après la bataille',
      lines: [
        'En 1918, la ville de Lens est en ruines.',
        'Les maisons et les mines ont été détruites.',
        'Les habitants devront reconstruire.',
        'En 1919, la paix est signée à Versailles.',
      ],
      qs: [
        {
          ...P.lens,
          q: 'Dans quel état se trouve Lens en 1918 ?',
          a: 'la ville est détruite',
          wrong: [
            { label: 'la ville est intacte', why: 'La première ligne parle de ruines.' },
            { label: 'la ville vient d’être créée', why: 'Les maisons existaient avant la guerre.' },
          ],
          explain: 'La guerre a détruit la ville : ses habitants devront la reconstruire.',
        },
        {
          ...P.versailles,
          q: 'D’après le texte, que se passe-t-il à Versailles en 1919 ?',
          a: 'on signe la paix',
          wrong: [
            { label: 'on commence une bataille', why: 'La dernière ligne parle de paix.' },
            { label: 'on détruit les mines', why: 'Les mines détruites sont à Lens.' },
          ],
          explain: 'La dernière ligne dit que la paix est signée à Versailles.',
        },
      ],
    },
  ],
};

const seconde: Notion = {
  id: 'hcm2-seconde-guerre',
  title: 'La Seconde Guerre mondiale',
  hint: 'Relis le mémo : repère les dates, la Résistance, la collaboration et le génocide des Juifs.',
  memo: [
    'La **Seconde Guerre mondiale** commence en 1939, quand l’Allemagne envahit la Pologne. En 1940, la France est battue et l’**Occupation** commence. Le **régime de Vichy**, dirigé par le maréchal Pétain, choisit la **collaboration** : il se met au service de l’occupant.',
    'D’autres refusent. Le 18 juin 1940, le général de Gaulle appelle à continuer le combat : c’est la **France libre**, devenue la **France combattante**. En France, la **Résistance** lutte en secret. Jean Moulin cherche à l’unir.',
    'L’Allemagne **nazie** commet un **génocide** contre les Juifs : la **Shoah**. D’autres populations, comme les **Roms**, sont persécutées. Les Alliés débarquent en Normandie en 1944. La guerre finit en Europe le 8 mai 1945, puis en Asie le 2 septembre.',
  ],
  faits: [
    {
      ...P.pologne,
      q: 'Quel pays l’Allemagne envahit-elle en septembre 1939 ?',
      a: 'la Pologne',
      wrong: [
        { label: 'le Japon', why: 'Le Japon est en Asie, très loin de l’Allemagne.' },
        { label: 'les États-Unis', why: 'Les États-Unis sont de l’autre côté de l’océan Atlantique.' },
        { label: 'l’Italie', why: 'L’Italie n’est pas le pays envahi en 1939.' },
      ],
      gap: ['En septembre 1939, l’Allemagne envahit la ', '.', ['Pologne', 'pologne']],
      explain: 'L’invasion de la Pologne ouvre la guerre.',
    },
    {
      ...P.appel,
      q: 'Qui appelle, le 18 juin 1940, à poursuivre le combat ?',
      a: 'le général de Gaulle',
      wrong: [
        { label: 'le maréchal Pétain', why: 'Pétain annonce au contraire la fin des combats.' },
        { label: 'Napoléon Bonaparte', why: 'Napoléon vit bien avant, au temps de la Révolution et de l’Empire.' },
        { label: 'Jean Moulin', why: 'Jean Moulin unit la Résistance un peu plus tard.' },
      ],
      gap: ['Le 18 juin 1940, le général de ', ' lance un appel depuis Londres.', ['Gaulle', 'gaulle']],
      explain: 'Au micro de la BBC, à Londres, de Gaulle appelle les soldats à le rejoindre.',
    },
    {
      ...P.collaboration,
      q: 'Pendant l’Occupation, comment appelle-t-on le fait de se mettre au service de l’occupant ?',
      a: 'la collaboration',
      wrong: [
        { label: 'la Résistance', why: 'Résister, c’est au contraire lutter contre l’occupant.' },
        { label: 'la Libération', why: 'La Libération, c’est la fin de l’Occupation.' },
        { label: 'l’armistice', why: 'Un armistice est un arrêt des combats.' },
      ],
      gap: ['Se mettre au service de l’occupant, c’est la ', '.', ['collaboration']],
      explain: 'La collaboration est le choix de servir l’occupant.',
    },
    {
      ...P.moulin,
      q: 'Qui reçoit, en 1943, la mission de rassembler la Résistance ?',
      a: 'Jean Moulin',
      wrong: [
        { label: 'Louis XVI', why: 'Louis XVI est un roi du XVIIIe siècle.' },
        { label: 'Robert Schuman', why: 'Robert Schuman est connu pour la construction de l’Europe.' },
        { label: 'le maréchal Pétain', why: 'Pétain dirige le régime de Vichy.' },
      ],
      gap: ['En 1943, Jean ', ' doit rassembler la Résistance.', ['Moulin', 'moulin']],
      explain: 'Jean Moulin unit les résistants dans la clandestinité.',
    },
    {
      ...P.motShoah,
      q: 'Quel mot désigne le génocide des Juifs par les nazis ?',
      a: 'la Shoah',
      wrong: [
        { label: 'l’Occupation', why: 'L’Occupation est la présence de l’armée ennemie dans un pays.' },
        { label: 'le Débarquement', why: 'Le Débarquement est une opération des Alliés en 1944.' },
        { label: 'la collaboration', why: 'La collaboration est le fait de servir l’occupant.' },
      ],
      gap: ['Le génocide des Juifs est appelé la ', '.', ['Shoah', 'shoah']],
      explain: 'Le génocide des Juifs par les nazis s’appelle la Shoah.',
    },
    {
      ...P.roms,
      q: 'Pendant cette guerre, à part les Juifs, quelle population subit aussi un génocide ?',
      a: 'les Roms',
      wrong: [
        { label: 'les soldats alliés', why: 'Ce sont des combattants : on cherche une population persécutée.' },
        { label: 'les Gaulois', why: 'Les Gaulois vivent dans l’Antiquité.' },
        { label: 'les poilus', why: 'Les poilus sont les soldats de 1914-1918.' },
      ],
      gap: ['Des centaines de milliers de ', ' sont exterminés pendant la guerre.', ['Roms', 'roms']],
      explain: 'Les Roms sont eux aussi persécutés et exterminés.',
    },
    {
      ...P.victoire,
      q: 'Quel jour de 1945 la guerre finit-elle en Europe ?',
      a: 'le 8 mai',
      wrong: [
        { label: 'le 11 novembre', why: 'Le 11 novembre rappelle la fin de la guerre de 1914-1918.' },
        { label: 'le 14 juillet', why: 'C’est le jour de la fête nationale.' },
        { label: 'le 18 juin', why: 'Le 18 juin rappelle l’appel du général de Gaulle en 1940.' },
      ],
      gap: ['La guerre finit en Europe le 8 ', ' 1945.', ['mai']],
      explain: 'Le 8 mai 1945, les Alliés sont victorieux de l’Allemagne nazie.',
    },
    {
      ...P.japon,
      q: 'Quel pays signe sa capitulation le 2 septembre 1945 ?',
      a: 'le Japon',
      wrong: [
        { label: 'la Pologne', why: 'La Pologne est envahie au début de la guerre.' },
        { label: 'la France', why: 'La France fait partie des vainqueurs en 1945.' },
        { label: 'l’Allemagne', why: 'L’Allemagne capitule plus tôt, en mai 1945.' },
      ],
      gap: ['Le 2 septembre 1945, la capitulation du ', ' met fin à la guerre.', ['Japon', 'japon']],
      explain: 'La guerre continue en Asie jusqu’à la capitulation japonaise.',
    },
  ],
  paires3: [
    ['La Résistance', 'la lutte secrète contre l’occupant'],
    ['La collaboration', 'le fait de servir l’occupant'],
    ['La Shoah', 'le génocide des Juifs'],
  ],
  paires5: [
    ['La Résistance', 'la lutte secrète contre l’occupant'],
    ['La collaboration', 'le fait de servir l’occupant'],
    ['La Shoah', 'le génocide des Juifs'],
    ['La France libre', 'l’organisation créée par de Gaulle à Londres'],
    ['8 mai 1945', 'la fin de la guerre en Europe'],
  ],
  frise: [
    { ...P.pologne, label: 'L’Allemagne envahit la Pologne', date: '1939' },
    { ...P.appel, label: 'L’appel du général de Gaulle', date: '1940' },
    { ...P.combattante, label: 'La France libre devient la France combattante', date: '1942' },
    { ...P.debarquement, label: 'Le débarquement allié en Normandie', date: '1944' },
    { ...P.victoire, label: 'La fin de la guerre en Europe', date: '1945' },
  ],
  libres: [
    {
      ...P.appel,
      q: 'quelle est la ville d’où le général de Gaulle parle à la radio le 18 juin 1940 ? (un mot)',
      accepted: ['Londres', 'londres'],
      traps: [
        { text: 'Paris', why: 'Paris va être occupée : de Gaulle est parti en Angleterre.' },
        { text: 'Vichy', why: 'Vichy est la ville du régime dirigé par Pétain.' },
      ],
      explain: 'De Gaulle parle au micro de la BBC, à Londres.',
    },
    {
      ...P.clandestins,
      q: 'comment appelle-t-on le mouvement secret qui lutte contre l’occupant ? (un mot)',
      accepted: ['Résistance', 'la Résistance', 'résistance', 'resistance', 'la résistance', 'la resistance'],
      traps: [
        { text: 'collaboration', why: 'La collaboration, c’est servir l’occupant : c’est l’inverse.' },
        { text: 'Occupation', why: 'L’Occupation est la présence de l’ennemi.' },
      ],
      explain: 'La Résistance agit en secret, par exemple avec des journaux clandestins.',
    },
    {
      ...P.debarquement,
      q: 'dans quelle région les Alliés débarquent-ils en 1944, le 6 juin ? (un mot)',
      accepted: ['Normandie', 'normandie', 'en Normandie'],
      traps: [
        { text: 'Bretagne', why: 'Le débarquement du 6 juin a lieu plus à l’est.' },
        { text: 'Alsace', why: 'L’Alsace n’a pas de côte sur la mer.' },
      ],
      explain: 'Le débarquement allié du 6 juin 1944 a lieu en Normandie.',
    },
    {
      ...P.motShoah,
      q: 'quel mot désigne le génocide des Juifs ? (un mot)',
      accepted: ['Shoah', 'la Shoah', 'shoah', 'la shoah'],
      traps: [
        { text: 'Occupation', why: 'L’Occupation est la présence de l’armée ennemie.' },
        { text: 'armistice', why: 'Un armistice arrête les combats.' },
      ],
      explain: 'La Shoah est le génocide des Juifs par les nazis.',
    },
    {
      ...P.france1939,
      q: 'en quelle année la France entre-t-elle dans cette guerre ? (en chiffres)',
      accepted: ['1939'],
      traps: [
        { text: '1914', why: '1914 est le début de la Première Guerre mondiale.' },
        { text: '1945', why: '1945 est la fin de la guerre.' },
      ],
      explain: 'La France entre en guerre le 3 septembre 1939.',
    },
  ],
  docs: [
    {
      title: 'Le poste de radio',
      lines: [
        'Juin 1940 : l’armée française est battue.',
        'Un soir, Louis écoute la radio de Londres.',
        'Le général de Gaulle demande aux soldats de le rejoindre.',
        'Louis décide de distribuer en secret un journal interdit.',
      ],
      qs: [
        {
          ...P.appel,
          q: 'Que demande le général de Gaulle ?',
          a: 'de le rejoindre pour continuer à combattre',
          wrong: [
            { label: 'd’arrêter de se battre', why: 'La troisième ligne appelle les soldats à le rejoindre.' },
            { label: 'de collaborer avec l’occupant', why: 'De Gaulle refuse la défaite.' },
          ],
          explain: 'Le 18 juin 1940, il appelle à poursuivre le combat.',
        },
        {
          ...P.clandestins,
          q: 'En distribuant ce journal, que fait Louis ?',
          a: 'il entre dans la Résistance',
          wrong: [
            { label: 'il choisit la collaboration', why: 'Un journal interdit lutte contre l’occupant.' },
            {
              label: 'il signe un armistice',
              why: 'Un armistice est signé par des chefs, pas en distribuant un journal.',
            },
          ],
          explain: 'Publier et diffuser des journaux clandestins est un acte de résistance.',
        },
      ],
    },
    {
      title: 'La famille de Sarah',
      lines: [
        'Paris, juillet 1942, pendant l’Occupation.',
        'Sarah est une enfant juive.',
        'La police française arrête sa famille avec des milliers d’autres Juifs.',
        'Beaucoup seront déportés, c’est-à-dire emmenés de force vers des camps.',
      ],
      qs: [
        {
          ...P.rafle,
          q: 'Pourquoi la famille de Sarah est-elle arrêtée ?',
          a: 'parce qu’elle est juive',
          wrong: [
            {
              label: 'parce qu’elle a commis un vol',
              why: 'Le texte ne parle d’aucune faute : la famille est visée parce qu’elle est juive.',
            },
            {
              label: 'parce qu’elle combat à l’armée',
              why: 'Sarah est une enfant : la famille n’est pas arrêtée pour avoir combattu.',
            },
          ],
          explain: 'En juillet 1942, des milliers de Juifs sont arrêtés à Paris, dont des enfants.',
        },
        {
          ...P.livrer,
          q: 'D’après l’histoire, quel pouvoir aide l’occupant à arrêter les Juifs ?',
          a: 'le régime de Vichy, par sa police',
          wrong: [
            { label: 'la France libre', why: 'La France libre combat l’occupant depuis l’extérieur.' },
            { label: 'la Résistance', why: 'La Résistance lutte contre l’occupant.' },
          ],
          explain: 'Le gouvernement de Vichy accepte de livrer des milliers de Juifs à l’occupant.',
        },
      ],
    },
  ],
};

const europe: Notion = {
  id: 'hcm2-construction-europeenne',
  title: 'La construction européenne',
  hint: 'Relis le mémo : cherche pourquoi les pays s’unissent, les grandes dates et les symboles.',
  memo: [
    'Après les guerres, des pays d’Europe veulent la **paix**. Le 9 mai 1950, Robert Schuman, ministre français, propose de mettre en commun le **charbon** et l’**acier**.',
    'En 1951 naît la **CECA**, avec six pays, dont la France et l’Allemagne. En 1957, le **traité** de Rome crée la **CEE**. Le traité de Maastricht, signé en 1992, crée l’**Union européenne**. L’**euro**, une monnaie commune, apparaît en 1999.',
    'L’Union a des **symboles** : un drapeau bleu à 12 étoiles, un hymne tiré de Beethoven, et la **devise** « Unie dans la diversité ». Le 9 mai est la Journée de l’Europe.',
  ],
  faits: [
    {
      ...P.paix,
      q: 'Pourquoi des pays d’Europe commencent-ils à s’unir après 1945 ?',
      a: 'pour mettre fin aux guerres',
      wrong: [
        {
          label: 'pour préparer une nouvelle guerre',
          why: 'C’est le contraire : ils veulent éviter un nouveau conflit.',
        },
        { label: 'pour avoir un seul roi', why: 'L’Europe n’est pas un royaume.' },
        { label: 'pour supprimer toutes les langues', why: 'L’Union garde les langues de ses pays.' },
      ],
      gap: ['Les pays s’unissent pour construire la ', '.', ['paix']],
      explain: 'Après deux guerres mondiales, l’objectif est la paix.',
    },
    {
      ...P.schuman,
      q: 'Quel ministre français propose, le 9 mai 1950, une coopération en Europe ?',
      a: 'Robert Schuman',
      wrong: [
        { label: 'Jean Moulin', why: 'Jean Moulin est un résistant de la Seconde Guerre mondiale.' },
        { label: 'Jules Ferry', why: 'Jules Ferry est lié à l’école de la République au XIXe siècle.' },
        { label: 'Charles de Gaulle', why: 'De Gaulle est l’auteur de l’appel du 18 juin 1940.' },
      ],
      gap: ['La déclaration du 9 mai 1950 est prononcée par Robert ', '.', ['Schuman', 'schuman']],
      explain: 'La déclaration Schuman lance la construction européenne.',
    },
    {
      ...P.six,
      q: 'Combien de pays signent le premier traité, sur le charbon et l’acier ?',
      a: 'six pays',
      wrong: [
        { label: 'deux pays', why: 'La France et l’Allemagne ne sont pas seules.' },
        { label: 'vingt-sept pays', why: 'L’Union s’est agrandie bien plus tard.' },
        { label: 'douze pays', why: 'Le nombre d’étoiles du drapeau est 12, mais les fondateurs sont moins nombreux.' },
      ],
      gap: ['Au départ, ', ' pays signent le traité du charbon et de l’acier.', ['six', '6']],
      explain: 'Allemagne, France, Italie, Pays-Bas, Belgique et Luxembourg.',
    },
    {
      ...P.rome,
      q: 'Quel traité crée la CEE en 1957 ?',
      a: 'le traité de Rome',
      wrong: [
        { label: 'le traité de Versailles', why: 'Il met fin à la Première Guerre mondiale en 1919.' },
        { label: 'l’édit de Nantes', why: 'C’est un texte du roi Henri IV, au temps des rois.' },
        { label: 'le traité de Maastricht', why: 'Maastricht arrive plus tard, en 1992.' },
      ],
      gap: ['La CEE est créée par le traité de ', '.', ['Rome', 'rome']],
      explain: 'En 1957, le traité de Rome crée la Communauté économique européenne.',
    },
    {
      ...P.union,
      q: 'Quel traité crée officiellement l’Union européenne ?',
      a: 'le traité de Maastricht',
      wrong: [
        { label: 'le traité de Rome', why: 'Rome crée la CEE en 1957, avant l’Union.' },
        { label: 'l’armistice de Rethondes', why: 'Il arrête les combats en 1918.' },
        { label: 'la déclaration Schuman', why: 'C’est une proposition de 1950, pas le traité qui crée l’Union.' },
      ],
      gap: ['L’Union européenne est créée par le traité de ', '.', ['Maastricht', 'maastricht']],
      explain: 'Le traité de Maastricht entre en vigueur en 1993.',
    },
    {
      ...P.drapeau,
      q: 'Combien d’étoiles dorées compte le drapeau européen ?',
      a: '12',
      wrong: [
        { label: '6', why: 'Six est le nombre des pays fondateurs.' },
        { label: '27', why: 'Le nombre d’étoiles ne suit pas le nombre de pays.' },
        { label: '50', why: 'Le cercle compte beaucoup moins d’étoiles.' },
      ],
      gap: ['Le drapeau porte un cercle de ', ' étoiles dorées.', ['12', 'douze']],
      explain: 'Douze étoiles en cercle, signe d’unité.',
    },
    {
      ...P.devise,
      q: 'Quelle est la devise de l’Union européenne ?',
      a: '« Unie dans la diversité »',
      wrong: [
        { label: '« Liberté, Égalité, Fraternité »', why: 'C’est la devise de la République française.' },
        { label: '« Chacun pour soi »', why: 'L’Union cherche au contraire à rassembler.' },
        { label: '« Tous pareils »', why: 'La devise parle de diversité : les pays restent différents.' },
      ],
      gap: ['La devise est « Unie dans la ', ' ».', ['diversité', 'diversite']],
      explain: 'Les pays sont différents, et pourtant unis.',
    },
    {
      ...P.hymne,
      q: 'Quel compositeur a écrit la musique de l’hymne européen ?',
      a: 'Beethoven',
      wrong: [
        { label: 'Mozart', why: 'C’est un autre grand compositeur : cherche celui de la Neuvième symphonie.' },
        { label: 'Louis XIV', why: 'Louis XIV est un roi, pas le compositeur.' },
        { label: 'Victor Hugo', why: 'Victor Hugo est un écrivain.' },
      ],
      gap: ['La musique de l’hymne européen est de Ludwig van ', '.', ['Beethoven', 'beethoven']],
      explain: 'L’hymne vient de la Neuvième symphonie de Beethoven.',
    },
  ],
  paires3: [
    ['La CECA', 'la communauté du charbon et de l’acier'],
    ['La CEE', 'la communauté créée à Rome en 1957'],
    ['9 mai', 'la Journée de l’Europe'],
  ],
  paires5: [
    ['La CECA', 'la communauté du charbon et de l’acier'],
    ['La CEE', 'la communauté créée à Rome en 1957'],
    ['9 mai', 'la Journée de l’Europe'],
    ['Maastricht', 'le traité qui crée l’Union européenne'],
    ['L’euro', 'une monnaie commune'],
  ],
  frise: [
    { ...P.schuman, label: 'La déclaration de Robert Schuman', date: '1950' },
    { ...P.ceca, label: 'La communauté du charbon et de l’acier', date: '1951' },
    { ...P.rome, label: 'Le traité de Rome', date: '1957' },
    { ...P.maastricht, label: 'Le traité de Maastricht', date: '1992' },
  ],
  libres: [
    {
      ...P.euro,
      q: 'comment s’appelle la monnaie commune lancée en 1999 ? (un mot)',
      accepted: ['euro', 'l’euro', 'Euro', "l'euro"],
      traps: [
        { text: 'franc', why: 'Le franc est l’ancienne monnaie de la France.' },
        { text: 'dollar', why: 'Le dollar est la monnaie des États-Unis.' },
      ],
      explain: 'L’euro est introduit en 1999 dans 11 pays.',
    },
    {
      ...P.journeeEurope,
      q: 'quel mois fête-t-on la Journée de l’Europe, le 9 ? (un mot)',
      accepted: ['mai', 'le 9 mai', '9 mai'],
      traps: [
        { text: 'novembre', why: 'En novembre, on se souvient de l’armistice de 1918.' },
        { text: 'juillet', why: 'En juillet, on fête le 14 juillet.' },
      ],
      explain: 'Le 9 mai rappelle la déclaration Schuman de 1950.',
    },
    {
      ...P.six,
      q: 'quel grand voisin de l’est, ancien ennemi de la France, fait partie des six pays fondateurs ? (un mot)',
      accepted: ['Allemagne', 'l’Allemagne', "l'Allemagne", 'allemagne'],
      traps: [
        { text: 'Italie', why: 'L’Italie est fondatrice, mais c’est le voisin du sud-est.' },
        { text: 'Pologne', why: 'La Pologne ne fait pas partie des six fondateurs.' },
      ],
      explain: 'L’Allemagne et la France, anciennes ennemies, construisent l’Europe ensemble.',
    },
    {
      ...P.rome,
      q: 'dans quelle ville est signé le traité de 1957 qui crée la CEE ? (un mot)',
      accepted: ['Rome', 'rome'],
      traps: [
        { text: 'Maastricht', why: 'Le traité de Maastricht date de 1992.' },
        { text: 'Versailles', why: 'Le traité de Versailles date de 1919.' },
      ],
      explain: 'Le traité de Rome date de 1957.',
    },
  ],
  docs: [
    {
      title: 'Le charbon en commun',
      lines: [
        '1950 : l’Europe sort à peine d’une terrible guerre.',
        'Robert Schuman propose une idée neuve.',
        'La France et l’Allemagne mettraient en commun charbon et acier.',
        'Ainsi, aucun pays ne préparerait seul des armes contre les autres.',
      ],
      qs: [
        {
          ...P.armes,
          q: 'Quel est le but de cette idée ?',
          a: 'empêcher une nouvelle guerre',
          wrong: [
            { label: 'fabriquer plus d’armes contre ses voisins', why: 'La dernière ligne veut empêcher cela.' },
            { label: 'fermer toutes les mines', why: 'On met le charbon en commun, on ne l’arrête pas.' },
          ],
          explain: 'En partageant charbon et acier, chaque pays peut moins préparer une guerre seul.',
        },
        {
          ...P.schuman,
          q: 'Qui propose cette idée en 1950 ?',
          a: 'Robert Schuman',
          wrong: [
            { label: 'Jean Moulin', why: 'Jean Moulin est un résistant de la guerre : il n’est pas dans ce texte.' },
            { label: 'le roi Louis XIV', why: 'Le roi vit trois siècles plus tôt.' },
          ],
          explain: 'La deuxième ligne nomme Robert Schuman.',
        },
      ],
    },
    {
      title: 'La classe en fête',
      lines: [
        'Le 9 mai, la classe de Nora fête l’Europe.',
        'Elle dessine un drapeau bleu avec un cercle d’étoiles.',
        'Elle écrit la devise : « Unie dans la diversité ».',
        'Un élève chante la musique de Beethoven.',
      ],
      qs: [
        {
          ...P.journeeEurope,
          q: 'Que célèbre la classe le 9 mai ?',
          a: 'la Journée de l’Europe',
          wrong: [
            { label: 'l’armistice de 1918', why: 'L’armistice est rappelé le 11 novembre.' },
            { label: 'la prise de la Bastille', why: 'Elle est rappelée le 14 juillet.' },
          ],
          explain: 'La première ligne parle de fêter l’Europe, le 9 mai.',
        },
        {
          ...P.etoiles,
          q: 'Le nombre d’étoiles du drapeau compte-t-il les pays de l’Union ?',
          a: 'non, le cercle d’étoiles signifie l’unité',
          wrong: [
            { label: 'oui, une étoile par pays', why: 'Le nombre d’étoiles reste 12, même si les pays changent.' },
            { label: 'oui, une étoile par capitale', why: 'Les étoiles ne représentent ni des capitales ni des pays.' },
          ],
          explain: 'Les 12 étoiles ne comptent pas les pays : leur cercle est un signe d’unité.',
        },
      ],
    },
  ],
};

const memoire: Notion = {
  id: 'hcm2-lieux-memoire',
  title: 'Les lieux de mémoire des deux guerres',
  hint: 'Relis le mémo : quel lieu ou quelle date aide à se souvenir de quoi ?',
  memo: [
    'Un **lieu de mémoire** est un lieu dont on a choisi d’entretenir le souvenir. Par exemple : des **tranchées**, les plages du Débarquement, un camp, un musée. On y garde une attitude de **recueillement**.',
    'Après 1918, des **monuments aux morts** sont construits dans les communes. On y grave les noms. À Paris, le **Soldat inconnu** repose sous l’Arc de Triomphe depuis 1921, et une flamme du souvenir y est allumée depuis 1923.',
    'Des **dates de commémoration** rappellent le passé : le 11 novembre, le 8 mai, le 27 mai pour la Résistance, un jour de juillet pour les victimes des crimes racistes et antisémites (contre les Juifs), le dernier dimanche d’avril pour la **Déportation**.',
  ],
  faits: [
    {
      ...P.definition,
      q: 'Qu’est-ce qu’un lieu de mémoire ?',
      a: 'un lieu dont on a choisi d’entretenir le souvenir',
      wrong: [
        { label: 'un lieu où l’on oublie le passé', why: 'C’est le contraire : on veut se souvenir.' },
        {
          label: 'un magasin de souvenirs de vacances',
          why: 'Ce n’est pas un commerce : on y rappelle des événements importants.',
        },
        {
          label: 'une école où l’on apprend par cœur',
          why: 'Le mot « mémoire » désigne ici le souvenir d’événements passés.',
        },
      ],
      gap: ['Dans un lieu de mémoire, on entretient le ', ' d’événements passés.', ['souvenir']],
      explain: 'La collectivité y garde le souvenir d’événements marquants.',
    },
    {
      ...P.recueillement,
      q: 'Comment se comporte-t-on dans un lieu de mémoire ?',
      a: 'avec respect et recueillement',
      wrong: [
        {
          label: 'comme dans une cour de récréation',
          why: 'On ne crie pas et on ne joue pas : c’est un lieu de souvenir.',
        },
        { label: 'comme dans un parc d’attractions', why: 'Ce n’est pas un lieu de jeu.' },
        { label: 'comme n’importe où, sans faire attention', why: 'Ce n’est pas un endroit comme un autre.' },
      ],
      gap: ['Un lieu de mémoire est un lieu de souvenir et de ', '.', ['recueillement']],
      explain: 'Le recueillement, c’est le silence attentif et respectueux.',
    },
    {
      ...P.monuments,
      q: 'Que construit-on dans les communes après la guerre de 1914-1918 ?',
      a: 'des monuments aux morts',
      wrong: [
        { label: 'des châteaux forts', why: 'Les châteaux forts datent du Moyen Âge.' },
        { label: 'des grands magasins', why: 'Les grands magasins sont des lieux de commerce du XIXe siècle.' },
        { label: 'des arènes romaines', why: 'Les arènes datent de l’Antiquité.' },
      ],
      gap: ['Après 1918, les communes élèvent des monuments aux ', '.', ['morts', 'Morts']],
      explain: 'Environ 36 000 monuments aux morts sont construits de 1920 à 1925.',
    },
    {
      ...P.inconnu,
      q: 'Sous quel monument de Paris le Soldat inconnu est-il inhumé ?',
      a: 'l’Arc de Triomphe',
      wrong: [
        { label: 'la tour Eiffel', why: 'La tour Eiffel n’abrite pas de tombe.' },
        {
          label: 'le château de Versailles',
          why: 'Versailles est une autre ville, liée aux rois et au traité de 1919.',
        },
        { label: 'le Vélodrome d’hiver', why: 'Ce stade est lié à la rafle de 1942.' },
      ],
      gap: ['Le Soldat inconnu repose sous l’Arc de ', '.', ['Triomphe', 'triomphe']],
      explain: 'Il y est inhumé le 28 janvier 1921.',
    },
    {
      ...P.mai27,
      q: 'Quelle journée rappelle, le 27 mai, l’engagement contre l’occupant ?',
      a: 'la Journée nationale de la Résistance',
      wrong: [
        { label: 'la Journée de l’Europe', why: 'La Journée de l’Europe a lieu le 9 mai.' },
        { label: 'la fête nationale', why: 'La fête nationale est le 14 juillet.' },
        { label: 'l’armistice de 1918', why: 'Il est rappelé le 11 novembre.' },
      ],
      gap: ['Le 27 mai est la Journée nationale de la ', '.', ['Résistance', 'résistance', 'Resistance', 'resistance']],
      explain: 'Le 27 mai 1943 a lieu la première réunion du Conseil de la Résistance.',
    },
    {
      ...P.deportation,
      q: 'Quel dimanche est consacré au souvenir de la Déportation ?',
      a: 'le dernier dimanche d’avril',
      wrong: [
        { label: 'le premier dimanche de janvier', why: 'Le mois choisi est plus tard dans l’année.' },
        { label: 'le troisième dimanche de juin', why: 'Cherche un dimanche de printemps, à la fin du mois.' },
        { label: 'le dimanche avant Noël', why: 'La date se situe au printemps.' },
      ],
      gap: [
        'Le dernier dimanche d’avril, on se souvient de la ',
        '.',
        ['Déportation', 'déportation', 'Deportation', 'deportation'],
      ],
      explain: 'Ce jour honore les victimes et les héros de la Déportation.',
    },
    {
      ...P.janvier27,
      q: 'Quel camp découvert le 27 janvier 1945 est lié à une journée du souvenir ?',
      a: 'Auschwitz',
      wrong: [
        { label: 'Verdun', why: 'Verdun est une bataille de 1916.' },
        { label: 'Rethondes', why: 'Rethondes est le lieu de l’armistice de 1918.' },
        { label: 'Versailles', why: 'Versailles est le lieu de la signature de la paix en 1919.' },
      ],
      gap: ['Le 27 janvier rappelle la découverte du camp d’', '.', ['Auschwitz', 'auschwitz']],
      explain: 'La date du 27 janvier est une journée de mémoire des génocides.',
    },
  ],
  paires3: [
    ['11 novembre', 'l’armistice de 1918 et les morts pour la France'],
    ['8 mai', 'la victoire de 1945'],
    ['27 mai', 'la Résistance'],
  ],
  paires5: [
    ['11 novembre', 'l’armistice de 1918 et les morts pour la France'],
    ['8 mai', 'la victoire de 1945'],
    ['27 mai', 'la Résistance'],
    ['27 janvier', 'la mémoire des génocides'],
    ['Dernier dimanche d’avril', 'le souvenir de la Déportation'],
  ],
  frise: [
    { ...P.inconnu, label: 'Le Soldat inconnu est inhumé à Paris', date: '1921' },
    { ...P.flamme, label: 'La flamme du souvenir est allumée', date: '1923' },
    { ...P.deportation, label: 'Une loi consacre un jour au souvenir de la Déportation', date: '1954' },
    { ...P.tousMorts, label: 'Le 11 novembre honore tous les « morts pour la France »', date: '2012' },
    { ...P.journeeResistance, label: 'La Journée de la Résistance est instaurée', date: '2013' },
  ],
  libres: [
    {
      ...P.inconnu,
      q: 'quel monument de Paris abrite la tombe du Soldat inconnu ?',
      accepted: ['l’Arc de Triomphe', 'Arc de Triomphe', "l'Arc de Triomphe", 'arc de triomphe'],
      traps: [
        { text: 'la tour Eiffel', why: 'La tour Eiffel n’abrite pas de tombe.' },
        { text: 'le Panthéon', why: 'Le Soldat inconnu repose sous un grand arc.' },
      ],
      explain: 'Le Soldat inconnu repose sous l’Arc de Triomphe.',
    },
    {
      ...P.rethondes,
      q: 'quel jour de novembre se souvient-on de l’armistice de 1918 ? (en chiffres)',
      accepted: ['11', 'le 11', '11 novembre', 'le 11 novembre'],
      traps: [
        { text: '8', why: 'Le 8 est associé au mois de mai.' },
        { text: '14', why: 'Le 14 juillet est la fête nationale.' },
      ],
      explain: 'L’armistice date du 11 novembre 1918.',
    },
    {
      ...P.victoire,
      q: 'quel jour de mai se souvient-on de la victoire de 1945 ? (en chiffres)',
      accepted: ['8', 'le 8', '8 mai', 'le 8 mai'],
      traps: [
        { text: '9', why: 'Le 9 mai est la Journée de l’Europe.' },
        { text: '27', why: 'Le 27 mai rappelle la Résistance.' },
      ],
      explain: 'La guerre finit en Europe le 8 mai 1945.',
    },
    {
      ...P.noms,
      q: 'que grave-t-on sur les monuments aux morts pour se souvenir de chaque disparu ? (un mot)',
      accepted: ['noms', 'les noms', 'nom', 'le nom', 'leurs noms'],
      traps: [
        { text: 'dessins', why: 'Ce qui permet d’identifier chaque personne s’écrit en lettres.' },
        { text: 'prix', why: 'Rien n’est à vendre sur un monument.' },
      ],
      explain: 'Chaque mort a droit à son nom gravé dans sa commune.',
    },
  ],
  docs: [
    {
      title: 'Sur la place du village',
      lines: [
        'Au centre du village se dresse un monument de pierre.',
        'Une longue liste de noms y est gravée, avec les dates 1914-1918.',
        'Le 11 novembre, les élèves viennent y déposer des fleurs.',
        'Ils gardent le silence un instant.',
      ],
      qs: [
        {
          ...P.noms,
          q: 'À qui sert surtout ce monument ?',
          a: 'à se souvenir des morts de la guerre',
          wrong: [
            { label: 'à indiquer le chemin de l’école', why: 'La liste de noms rappelle des personnes disparues.' },
            { label: 'à décorer un grand magasin', why: 'Le monument est au centre du village pour le souvenir.' },
          ],
          explain: 'Les noms gravés rappellent les habitants morts à la guerre.',
        },
        {
          ...P.recueillement,
          q: 'Pourquoi les élèves gardent-ils le silence ?',
          a: 'pour se recueillir',
          wrong: [
            { label: 'parce qu’ils sont punis', why: 'Le texte parle d’une cérémonie du souvenir.' },
            {
              label: 'pour écouter la sonnerie de la récréation',
              why: 'Ils sont devant un monument, pas dans la cour.',
            },
          ],
          explain: 'Le silence est une marque de recueillement et de respect.',
        },
      ],
    },
    {
      title: 'La visite',
      lines: [
        'La classe visite une plage de Normandie.',
        'En juin 1944, des soldats alliés y ont débarqué.',
        'Une guide raconte leur histoire.',
        'Aujourd’hui, la plage est un lieu de mémoire.',
      ],
      qs: [
        {
          ...P.sites,
          q: 'Pourquoi cette plage est-elle un lieu de mémoire ?',
          a: 'parce qu’on y entretient le souvenir du Débarquement',
          wrong: [
            {
              label: 'parce qu’on y trouve des coquillages',
              why: 'La mémoire ici est celle d’un événement historique.',
            },
            { label: 'parce qu’une école s’y trouve', why: 'Le texte ne parle d’aucune école sur la plage.' },
          ],
          explain: 'Les plages du Débarquement sont des sites de mémoire des conflits.',
        },
        {
          ...P.debarquement,
          q: 'Quand les soldats alliés ont-ils débarqué ?',
          a: 'en 1944',
          wrong: [
            { label: 'en 1918', why: '1918 est la fin de la Première Guerre mondiale.' },
            { label: 'en 1950', why: '1950 est l’année de la déclaration Schuman.' },
          ],
          explain: 'La deuxième ligne donne juin 1944.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [premiere, seconde, europe, memoire];

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'CM2'));
