import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES } from './seconde-guerre-sources.ts';

/**
 * 3e, « La Seconde Guerre mondiale » (lot hi-3e-02) : suite du thème 1 du programme du cycle 4, « L’Europe, un
 * théâtre majeur des guerres totales (1914-1945) ». Sujet sensible : énoncés sobres, sans détail inutile. Les textes
 * à lire du niveau 5 sont écrits pour l’exercice.
 */
export const SOURCE = 'cycle4-2020';

/** Une année seule ou précédée de « en ». */
const annee = (a: string) => [a, `en ${a}`, `l’an ${a}`, `l’année ${a}`];

/** Un mot ou un groupe nominal, avec ou sans article. */
const mot = (word: string, ...articles: string[]) => [word, ...articles.map((a) => `${a}${word}`)];

// ——— Notion 1 ———

const aneantissement: Notion = {
  id: 'h3-guerre-aneantissement',
  title: 'La Seconde Guerre mondiale, une guerre d’anéantissement',
  hint: 'Situe la question : un front, une date ou une forme de violence contre les civils.',
  memo: [
    'La Deuxième Guerre mondiale (1939-1945) est un conflit **planétaire** marqué par la violence de masse : sur le front de l’Est, elle prend la figure d’une **guerre d’anéantissement**.',
    'Le 22 juin 1941, Hitler attaque l’**URSS** (opération Barbarossa) : le but mêle objectifs militaires, politiques, économiques et raciaux, dont l’aménagement d’un **espace vital** aux dépens des peuples de l’Est. Cette radicalisation est une des causes des **génocides** juif et tsigane.',
    'Les **civils** sont acteurs et victimes : bombardements de masse, jusqu’aux **bombes atomiques** sur Hiroshima (6 août 1945) et Nagasaki (9 août). Astuce brevet : donne un lieu, une date et la violence subie.',
  ],
  faits: [
    {
      q: 'Selon le programme, qu’est-ce qui caractérise la Deuxième Guerre mondiale ?',
      a: 'la violence de masse et l’anéantissement',
      wrong: [
        { label: 'une guerre limitée à une seule frontière', why: 'Le conflit a des dimensions planétaires.' },
        {
          label: 'une paix armée sans combats',
          why: 'Une paix armée n’est pas une guerre : les combats sont au contraire très violents.',
        },
        { label: 'des combats réservés aux seuls soldats', why: 'Les civils sont aussi au cœur du conflit.' },
      ],
      gap: [
        'La violence de masse et l’',
        ' caractérisent la Deuxième Guerre mondiale.',
        ['anéantissement', 'aneantissement', 'destruction'],
      ],
      ...PREUVES.programmeAneantissement,
      explain: 'Le programme associe à ce conflit la violence de masse et l’anéantissement.',
    },
    {
      q: 'Quelle est l’étendue de ce conflit ?',
      a: 'il a des dimensions planétaires',
      wrong: [
        { label: 'il reste limité à la France', why: 'La guerre touche bien d’autres régions du monde.' },
        {
          label: 'il ne concerne que l’Europe de l’Ouest',
          why: 'Le front de l’Est et le Pacifique en font un conflit mondial.',
        },
        { label: 'il se déroule uniquement en mer', why: 'Les combats ont lieu sur terre, sur mer et dans les airs.' },
      ],
      gap: [
        'La Deuxième Guerre mondiale est un conflit aux dimensions ',
        '.',
        ['planétaires', 'planetaires', 'mondiales'],
      ],
      ...PREUVES.programmeAneantissement,
      explain: 'C’est un conflit mondial : il dépasse largement l’Europe.',
    },
    {
      q: 'Après quelle agression la France entre-t-elle en guerre le 3 septembre 1939 ?',
      a: 'l’agression allemande contre la Pologne',
      wrong: [
        { label: 'l’attaque allemande contre l’URSS', why: 'L’URSS est attaquée en 1941.' },
        { label: 'la bombe sur Hiroshima', why: 'Hiroshima est bombardée en 1945, à la fin de la guerre.' },
        { label: 'le débarquement en Normandie', why: 'Le débarquement a lieu en 1944.' },
      ],
      gap: ['Le 3 septembre 1939, la guerre est déclarée après l’agression allemande contre la ', '.', ['Pologne']],
      ...PREUVES.declaree,
      explain: 'L’invasion de la Pologne déclenche l’entrée en guerre de la France.',
    },
    {
      q: 'Sur quel front la guerre prend-elle la figure d’une « guerre d’anéantissement » à partir de 1941 ?',
      a: 'le front de l’Est',
      wrong: [
        {
          label: 'le front de l’Ouest',
          why: 'La guerre d’anéantissement est associée à l’attaque contre l’URSS, à l’est.',
        },
        { label: 'le front intérieur français', why: 'Le « front intérieur » désigne l’arrière, loin des combats.' },
        { label: 'le front du Pacifique', why: 'La ressource parle de la guerre contre l’URSS.' },
      ],
      gap: ['La guerre d’anéantissement se déroule sur le front de l’', '.', ['Est']],
      ...PREUVES.frontEst,
      explain: 'L’attaque de l’URSS ouvre une guerre d’anéantissement sur le front de l’Est.',
    },
    {
      q: 'Quel pays Hitler attaque-t-il le 22 juin 1941 ?',
      a: 'l’URSS',
      wrong: [
        { label: 'le Japon', why: 'Le Japon n’est pas la cible de l’Allemagne le 22 juin 1941.' },
        { label: 'la Suisse', why: 'La Suisse n’est pas la cible de cette attaque.' },
        { label: 'la Pologne', why: 'La Pologne est envahie dès 1939.' },
      ],
      gap: ['Le 22 juin 1941, Hitler attaque l’', '.', ['URSS', 'U.R.S.S.', 'Union soviétique', 'Union sovietique']],
      ...PREUVES.frontEst,
      explain: 'Cette attaque ouvre le front de l’Est.',
    },
    {
      q: 'Quel nom porte l’opération allemande contre l’URSS ?',
      a: 'Barbarossa',
      wrong: [
        { label: 'Overlord', why: 'Overlord désigne le débarquement allié en Normandie.' },
        { label: 'Bagration', why: 'Bagration est l’offensive soviétique de 1944.' },
        { label: 'Union sacrée', why: 'L’Union sacrée date de 1914.' },
      ],
      gap: ['L’opération contre l’URSS s’appelle l’opération ', '.', ['Barbarossa', 'Barbarosse']],
      ...PREUVES.barbarossa,
      explain: 'L’opération Barbarossa accomplit le projet national-socialiste.',
    },
    {
      q: 'Comment appelle-t-on le territoire que les nazis veulent aménager au détriment des populations de l’Est ?',
      a: 'l’espace vital',
      wrong: [
        { label: 'la zone libre', why: 'La zone libre est une partie de la France en 1940.' },
        { label: 'l’empire colonial', why: 'L’empire colonial désigne des territoires outre-mer.' },
        { label: 'le front intérieur', why: 'Le front intérieur est l’arrière d’un pays en guerre.' },
      ],
      gap: ['Les nazis veulent aménager un « espace ', ' » au détriment des populations de l’Est.', ['vital']],
      ...PREUVES.espaceVital,
      explain: 'L’espace vital est un but de la guerre contre l’URSS.',
    },
    {
      q: 'De quelle catégorie de violences la guerre à l’Est est-elle une des causes ?',
      a: 'les génocides juif et tsigane',
      wrong: [
        { label: 'la crise de 1929', why: 'La crise de 1929 est antérieure à la guerre.' },
        { label: 'la révolution russe', why: 'La révolution russe date de 1917.' },
        { label: 'les mutineries de 1917', why: 'Les mutineries appartiennent à la Première Guerre mondiale.' },
      ],
      gap: [
        'La radicalisation de la guerre à l’Est est une des causes des ',
        ' juif et tsigane.',
        ['génocides', 'genocides'],
      ],
      ...PREUVES.causeGenocides,
      explain: 'La guerre à l’Est radicalise les violences jusqu’aux génocides.',
    },
    {
      q: 'Qui est placé au cœur du conflit, à la fois comme acteurs et comme victimes ?',
      a: 'les civils',
      wrong: [
        { label: 'les seuls généraux', why: 'Les généraux commandent, mais le conflit frappe toute la population.' },
        { label: 'les seuls soldats', why: 'Les civils sont eux aussi acteurs et victimes.' },
        { label: 'les seuls diplomates', why: 'La guerre touche bien au-delà des diplomates.' },
      ],
      gap: ['Les ', ' sont à la fois acteurs et victimes du conflit.', ['civils']],
      ...PREUVES.civils,
      explain: 'Les civils subissent des violences extrêmes.',
    },
    {
      q: 'Quelle ville japonaise reçoit la première bombe atomique, le 6 août 1945 ?',
      a: 'Hiroshima',
      wrong: [
        { label: 'Nagasaki', why: 'Nagasaki est bombardée trois jours plus tard, le 9 août.' },
        { label: 'Rethondes', why: 'Rethondes est un lieu d’armistice, en France.' },
        { label: 'Dresde', why: 'Dresde est une ville allemande bombardée.' },
      ],
      gap: ['Le 6 août 1945, la première bombe atomique est larguée sur ', '.', ['Hiroshima']],
      ...PREUVES.hiroshima,
      explain: 'Hiroshima est la première ville frappée, puis Nagasaki le 9 août.',
    },
    {
      q: 'Quels objectifs la guerre contre l’URSS mêle-t-elle ?',
      a: 'des objectifs militaires, politiques, économiques et raciaux',
      wrong: [
        { label: 'uniquement des objectifs sportifs', why: 'Cette guerre n’a rien d’une compétition.' },
        {
          label: 'seulement la libération de la France',
          why: 'La guerre contre l’URSS ne vise pas la libération de la France.',
        },
        {
          label: 'la recherche d’un accord de paix',
          why: 'C’est une guerre d’anéantissement, pas une recherche de paix.',
        },
      ],
      gap: [
        'La guerre contre l’URSS mêle des objectifs militaires, politiques, économiques et ',
        '.',
        ['raciaux', 'racistes'],
      ],
      ...PREUVES.croisade,
      explain: 'La dimension raciale distingue cette guerre.',
    },
    {
      q: 'Que signifie le mot « anéantissement » ?',
      a: 'une destruction complète',
      wrong: [
        { label: 'un arrêt provisoire des combats', why: 'C’est la définition d’un armistice.' },
        { label: 'une alliance entre deux pays', why: 'Anéantir n’est pas s’allier.' },
        { label: 'une reconstruction après la guerre', why: 'Anéantir, c’est au contraire détruire.' },
      ],
      gap: ['Le mot « anéantissement » désigne une destruction ', '.', ['complète', 'complete', 'totale']],
      ...PREUVES.aneantissement,
      explain: 'Anéantir, c’est détruire complètement.',
    },
    {
      q: 'Quel pacte l’Allemagne et l’URSS signent-elles le 23 août 1939 ?',
      a: 'le pacte germano-soviétique',
      wrong: [
        { label: 'le traité de Versailles', why: 'Il date de 1919.' },
        { label: 'les accords de Munich', why: 'Ils sont signés en 1938, sans l’URSS.' },
        { label: 'l’armistice de Rethondes', why: 'L’armistice de juin 1940 concerne la France et l’Allemagne.' },
      ],
      gap: ['Le 23 août 1939 est signé le pacte germano-', '.', ['soviétique', 'sovietique']],
      ...PREUVES.pacte,
      explain: 'L’Allemagne et l’URSS signent un pacte avant d’être ennemies en 1941.',
    },
    {
      q: 'Quel jour marque la victoire sur l’Allemagne nazie en Europe ?',
      a: 'le 8 mai 1945',
      wrong: [
        { label: 'le 11 novembre 1918', why: 'C’est l’armistice de la Première Guerre mondiale.' },
        { label: 'le 18 juin 1940', why: 'C’est le jour de l’appel du général de Gaulle.' },
        { label: 'le 2 septembre 1945', why: 'Le 2 septembre, le Japon capitule.' },
      ],
      gap: ['La victoire des Alliés sur l’Allemagne nazie, en Europe, date du 8 mai ', '.', ['1945']],
      ...PREUVES.victoire,
      explain: 'La guerre se termine en Europe le 8 mai 1945.',
    },
  ],
  paires3: [
    ['Opération Barbarossa', 'Attaque allemande contre l’URSS'],
    ['Espace vital', 'Territoire que les nazis veulent à l’Est'],
    ['Hiroshima', 'Ville bombardée le 6 août 1945'],
  ],
  paires5: [
    ['23 août 1939', 'Signature du pacte germano-soviétique'],
    ['3 septembre 1939', 'La France entre en guerre'],
    ['22 juin 1941', 'Attaque de l’URSS'],
    ['8 mai 1945', 'Victoire des Alliés en Europe'],
    ['2 septembre 1945', 'Capitulation du Japon'],
  ],
  frise: [
    { label: 'L’invasion de la Pologne par l’Allemagne', date: '1939', ...PREUVES.pologne },
    { label: 'L’attaque de l’URSS par Hitler', date: '1941', ...PREUVES.frontEst },
    { label: 'Le débarquement allié en Normandie', date: '1944', ...PREUVES.debarquement },
    { label: 'La capitulation du Japon', date: '1945', ...PREUVES.japon },
  ],
  libres: [
    {
      q: 'Comment appelle-t-on la guerre menée sur le front de l’Est, qui vise la destruction complète de l’adversaire ?',
      accepted: mot('guerre d’anéantissement', 'une ', 'la '),
      traps: [
        { text: 'guerre de position', why: 'La guerre de position décrit un front figé, surtout en 1914-1918.' },
        { text: 'guerre froide', why: 'La guerre froide oppose les États-Unis et l’URSS après 1945.' },
      ],
      ...PREUVES.frontEst,
      explain: 'Anéantir, c’est détruire complètement : on parle de guerre d’anéantissement.',
    },
    {
      q: 'Quel pays Hitler attaque-t-il le 22 juin 1941 ?',
      accepted: [...mot('URSS', 'l’'), 'U.R.S.S.', ...mot('Union soviétique', 'l’'), 'Union sovietique'],
      traps: [
        { text: 'Pologne', why: 'La Pologne est envahie en 1939.' },
        { text: 'Royaume-Uni', why: 'Le Royaume-Uni est en guerre contre l’Allemagne depuis 1939.' },
      ],
      ...PREUVES.frontEst,
      explain: 'Le front de l’Est s’ouvre avec l’attaque de l’URSS.',
    },
    {
      q: 'Quelle ville japonaise est bombardée le 9 août 1945, après Hiroshima ?',
      accepted: mot('Nagasaki', 'à '),
      traps: [
        { text: 'Hiroshima', why: 'Hiroshima est bombardée le 6 août.' },
        { text: 'Tokyo', why: 'La seconde bombe atomique vise une autre ville.' },
      ],
      ...PREUVES.hiroshima,
      explain: 'La seconde bombe atomique est lancée sur Nagasaki.',
    },
    {
      q: 'En quelle année le Japon capitule-t-il, mettant fin à la Seconde Guerre mondiale ?',
      accepted: annee('1945'),
      traps: [
        { text: '1944', why: '1944 est l’année du débarquement en Normandie.' },
        { text: '1941', why: 'En 1941, la guerre s’élargit : elle ne finit pas.' },
      ],
      ...PREUVES.japon,
      explain: 'Le Japon capitule le 2 septembre 1945.',
    },
    {
      q: 'Quel nom porte l’opération allemande lancée contre l’URSS ?',
      accepted: [...mot('Barbarossa', 'opération ', 'l’opération '), 'Barbarosse'],
      traps: [
        { text: 'Overlord', why: 'Overlord est le débarquement allié en Normandie.' },
        { text: 'Bagration', why: 'Bagration est une offensive soviétique.' },
      ],
      ...PREUVES.barbarossa,
      explain: 'C’est l’opération Barbarossa.',
    },
    {
      q: 'Quel mot désigne les personnes non militaires, visées par les bombardements de masse ?',
      accepted: mot('civils', 'les ', 'des '),
      traps: [
        { text: 'soldats', why: 'Les soldats sont des militaires.' },
        { text: 'généraux', why: 'Les généraux sont des militaires.' },
      ],
      ...PREUVES.bombardements,
      explain: 'Les bombardements de masse peuvent cibler de très nombreux civils.',
    },
  ],
  docs: [
    {
      title: 'Le front de l’Est',
      lines: [
        'Le 22 juin 1941, l’Allemagne d’Hitler attaque l’URSS.',
        'La guerre menée à l’Est devient une « croisade » d’anéantissement.',
        'Les nazis veulent aménager un « espace vital » aux dépens des populations de l’Est.',
        'Cette radicalisation est une des causes des génocides juif et tsigane.',
      ],
      qs: [
        {
          q: 'Quelle expression de la ligne 3 désigne le territoire convoité à l’Est ?',
          a: 'l’espace vital',
          wrong: [
            { label: 'la zone libre', why: 'La zone libre est en France.' },
            { label: 'le front intérieur', why: 'Il s’agit de l’arrière d’un pays en guerre.' },
          ],
          ...PREUVES.espaceVital,
          explain: 'La ligne 3 parle d’« espace vital ».',
        },
        {
          q: 'D’après la ligne 4, quelle est une des conséquences de la radicalisation de la guerre ?',
          a: 'elle contribue aux génocides juif et tsigane',
          wrong: [
            { label: 'elle met fin aux violences contre les civils', why: 'Au contraire, les violences s’aggravent.' },
            { label: 'elle crée la guerre froide', why: 'La guerre froide vient après 1945.' },
          ],
          ...PREUVES.causeGenocides,
          explain: 'Le texte lie la radicalisation aux génocides.',
        },
        {
          q: 'En mobilisant tes connaissances : quel nom porte l’attaque évoquée à la ligne 1 ?',
          a: 'l’opération Barbarossa',
          wrong: [
            { label: 'l’opération Overlord', why: 'Overlord est le débarquement en Normandie.' },
            { label: 'l’opération Bagration', why: 'Bagration est une offensive soviétique de 1944.' },
          ],
          ...PREUVES.barbarossa,
          explain: 'L’attaque de l’URSS est l’opération Barbarossa.',
        },
      ],
    },
    {
      title: 'La fin de la guerre',
      lines: [
        'Pendant la guerre, des bombardements de masse frappent aussi de très nombreux civils.',
        'Le 6 août 1945, une bombe atomique est larguée sur Hiroshima, au Japon.',
        'Le 9 août, une seconde bombe frappe Nagasaki.',
        'Le 2 septembre 1945, la capitulation du Japon met fin à la guerre.',
      ],
      qs: [
        {
          q: 'D’après le texte, quel événement met fin à la guerre ?',
          a: 'la capitulation du Japon',
          wrong: [
            {
              label: 'la capitulation allemande du 8 mai',
              why: 'Elle met fin à la guerre en Europe seulement, et le texte ne la cite pas.',
            },
            { label: 'le débarquement en Normandie', why: 'Le débarquement a lieu en 1944.' },
          ],
          ...PREUVES.japon,
          explain: 'La ligne 4 indique que la capitulation du Japon met fin à la guerre.',
        },
        {
          q: 'Quelle arme, utilisée aux lignes 2 et 3, est nouvelle dans l’histoire ?',
          a: 'l’arme atomique',
          wrong: [
            { label: 'le char d’assaut', why: 'Le char est utilisé depuis la Première Guerre mondiale.' },
            { label: 'la tranchée', why: 'La tranchée est un abri, non une arme nouvelle.' },
          ],
          ...PREUVES.atomique,
          explain: 'C’est le premier et unique usage de l’arme atomique dans l’histoire.',
        },
        {
          q: 'D’après la ligne 1, qui est aussi frappé par les bombardements de masse ?',
          a: 'de très nombreux civils',
          wrong: [
            { label: 'uniquement des navires de guerre', why: 'Le texte parle des civils.' },
            { label: 'uniquement des soldats', why: 'Le texte parle aussi des civils.' },
          ],
          ...PREUVES.bombardements,
          explain: 'Les bombardements de masse peuvent cibler de très nombreux civils.',
        },
      ],
    },
  ],
};

// ——— Notion 2 ———

const genocide: Notion = {
  id: 'h3-genocide-juifs-tsiganes',
  title: 'Le génocide des Juifs et des Tsiganes',
  hint: 'Repère d’abord le mot ou la date : de la persécution à l’extermination, les étapes se suivent.',
  memo: [
    'Un **génocide** est une entreprise d’**extermination** systématique d’un groupe humain : l’Allemagne nazie l’a commis contre les Juifs et les **Tsiganes** (Roms).',
    'La **persécution** précède l’extermination : lois de Nuremberg (1935), nuit de Cristal (1938), **ghettos**, puis, à partir de l’été 1941, massacres par les **Einsatzgruppen** et **centres de mise à mort** en Pologne.',
    'Le mot **Shoah** désigne le génocide des Juifs : plus de 6 millions de victimes. Selon les estimations, plus de 500 000 Roms (Tsiganes) ont été exterminés. En France, le gouvernement de Vichy a livré des Juifs à l’occupant (rafle du Vél’ d’Hiv’, 1942).',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’un génocide ?',
      a: 'une entreprise d’extermination systématique d’un groupe humain',
      wrong: [
        {
          label: 'un combat entre deux armées',
          why: 'Un combat oppose des soldats : le génocide vise un groupe humain à détruire.',
        },
        { label: 'une crise économique mondiale', why: 'La crise économique n’est pas une extermination.' },
        { label: 'un accord pour arrêter les combats', why: 'C’est la définition d’un armistice.' },
      ],
      gap: [
        'Un génocide est une entreprise d’',
        ' systématique d’un groupe humain.',
        ['extermination', 'anéantissement', 'aneantissement', 'destruction'],
      ],
      ...PREUVES.definition,
      explain: 'Le génocide vise la destruction d’un groupe humain.',
    },
    {
      q: 'Contre quelles populations le régime nazi a-t-il perpétré un génocide ?',
      a: 'les Juifs et les Tsiganes',
      wrong: [
        {
          label: 'les seuls soldats ennemis',
          why: 'Le génocide vise des populations civiles à cause de ce qu’elles sont.',
        },
        {
          label: 'les seuls habitants des villes bombardées',
          why: 'Les bombardements ne définissent pas un génocide.',
        },
        {
          label: 'uniquement les prisonniers de guerre',
          why: 'Le génocide nazi vise les populations juive et tsigane.',
        },
      ],
      gap: [
        'Le régime nazi a perpétré un génocide contre les populations juive et ',
        '.',
        ['tsigane', 'tzigane', 'rom'],
      ],
      ...PREUVES.victimes,
      explain: 'Le dictionnaire cite les populations juive et tsigane.',
    },
    {
      q: 'Quel mot Éduscol préfère-t-il pour désigner le génocide des Juifs par les nazis ?',
      a: 'Shoah',
      wrong: [
        { label: 'Holocauste', why: 'Ce mot renvoie à un sacrifice religieux : Éduscol préfère un autre terme.' },
        { label: 'Pogrom', why: 'Un pogrom est une attaque violente contre des Juifs, pas le nom du génocide.' },
        { label: 'Déportation', why: 'La déportation est un transfert vers un camp.' },
      ],
      gap: ['Pour désigner ce génocide, Éduscol préfère au mot « Holocauste » le mot « ', ' ».', ['Shoah']],
      ...PREUVES.motShoah,
      explain: '« Shoah » est le mot préféré en France.',
    },
    {
      q: 'Combien de Juifs l’Allemagne nazie a-t-elle tués au cours de la Shoah ?',
      a: 'plus de 6 millions',
      wrong: [
        { label: 'environ 60 000', why: 'Le bilan est de plusieurs millions de morts.' },
        { label: 'environ 600', why: 'Le bilan est de plusieurs millions de morts.' },
        { label: 'environ 50 000', why: 'Le bilan est de plusieurs millions de morts.' },
      ],
      gap: ['Au cours de la Shoah, l’Allemagne nazie a tué plus de ', ' millions de Juifs.', ['6', 'six']],
      ...PREUVES.shoah,
      explain: 'Le bilan dépasse 6 millions de victimes juives.',
    },
    {
      q: 'Selon les estimations rappelées par le Parlement européen, combien de Roms ont été exterminés ?',
      a: 'plus de 500 000',
      wrong: [
        { label: 'aucun', why: 'Les Roms (Tsiganes) ont subi un génocide.' },
        { label: 'environ 500', why: 'Les victimes se comptent en centaines de milliers.' },
        { label: 'plus de 50 millions', why: 'Le Parlement européen évoque plus de 500 000 victimes roms.' },
      ],
      gap: [
        'Selon les estimations, plus de ',
        ' Roms ont été exterminés pendant la guerre.',
        ['500 000', '500000', '500.000', 'cinq cent mille'],
      ],
      ...PREUVES.roms,
      explain: 'L’estimation citée est de plus de 500 000 victimes.',
    },
    {
      q: 'Quelles lois de 1935 mettent en place une ségrégation contre les Juifs en Allemagne ?',
      a: 'les lois de Nuremberg',
      wrong: [
        { label: 'les lois de Jules Ferry', why: 'Ces lois concernent l’école en France.' },
        { label: 'les accords Matignon', why: 'Ces accords sociaux datent de 1936, en France.' },
        { label: 'le traité de Versailles', why: 'Ce traité met fin à la guerre de 1914-1918 avec l’Allemagne.' },
      ],
      gap: [
        'En 1935, les lois de ',
        ' organisent la ségrégation contre les Juifs.',
        ['Nuremberg', 'Nurembourg', 'Nürnberg'],
      ],
      ...PREUVES.nuremberg,
      explain: 'Les lois de Nuremberg sont une étape de la persécution.',
    },
    {
      q: 'Comment s’appellent les groupes qui commettent les premiers massacres collectifs de Juifs à l’Est en 1941 ?',
      a: 'les Einsatzgruppen',
      wrong: [
        { label: 'les Poilus', why: 'Les Poilus sont les soldats français de 1914-1918.' },
        { label: 'les Alliés', why: 'Les Alliés combattent l’Allemagne nazie.' },
        { label: 'les Maquis', why: 'Les maquis regroupent des résistants.' },
      ],
      gap: [
        'Dès l’été 1941, des massacres collectifs sont perpétrés par les ',
        '.',
        ['Einsatzgruppen', 'Einsatzgruppe', 'Einsatz Gruppen'],
      ],
      ...PREUVES.einsatz,
      explain: 'Les Einsatzgruppen mènent les premiers massacres de masse à l’Est.',
    },
    {
      q: 'Sur quel territoire les nazis implantent-ils les centres de mise à mort ?',
      a: 'le territoire polonais',
      wrong: [
        { label: 'le territoire britannique', why: 'Le Royaume-Uni n’est pas occupé.' },
        { label: 'le territoire des États-Unis', why: 'Les États-Unis combattent l’Allemagne.' },
        { label: 'le territoire japonais', why: 'Les centres de mise à mort sont en Europe.' },
      ],
      gap: ['Les centres de mise à mort sont implantés sur le territoire ', '.', ['polonais']],
      ...PREUVES.centres,
      explain: 'Ces centres se trouvent en Pologne occupée.',
    },
    {
      q: 'Dans le processus génocidaire, quelle est l’étape ultime après identification, expropriation et concentration ?',
      a: 'l’extermination',
      wrong: [
        { label: 'l’armistice', why: 'L’armistice est un arrêt des combats.' },
        { label: 'la propagande', why: 'La propagande n’est pas citée parmi les étapes.' },
        { label: 'la libération', why: 'La libération met fin à l’occupation.' },
      ],
      gap: ['L’étape ultime du processus génocidaire est l’', '.', ['extermination']],
      ...PREUVES.etapes,
      explain: 'Identifier, exproprier, concentrer, puis exterminer.',
    },
    {
      q: 'Que désigne le mot « déportation » dans le contexte nazi ?',
      a: 'le transfert et l’internement dans un camp de concentration ou d’extermination',
      wrong: [
        { label: 'un retour volontaire au pays', why: 'La déportation est imposée.' },
        { label: 'le vote d’une loi', why: 'Ce n’est pas un transfert de personnes.' },
        { label: 'un départ en vacances', why: 'La déportation est une violence imposée aux victimes.' },
      ],
      gap: [
        'La déportation est le transfert et l’internement dans un camp de concentration ou d’',
        '.',
        ['extermination'],
      ],
      ...PREUVES.deportation,
      explain: 'Les déportés sont envoyés et enfermés dans des camps.',
    },
    {
      q: 'Dans certaines villes d’Europe, comment appelle-t-on le quartier où résidaient les Juifs, par choix ou par obligation ?',
      a: 'un ghetto',
      wrong: [
        { label: 'un maquis', why: 'Un maquis abrite des résistants armés.' },
        { label: 'une zone libre', why: 'La zone libre est une partie de la France en 1940.' },
        { label: 'un camp d’extermination', why: 'Un camp d’extermination est un lieu de mise à mort.' },
      ],
      gap: ['Ce quartier où résidaient les Juifs s’appelle un ', '.', ['ghetto']],
      ...PREUVES.ghetto,
      explain: 'Les nazis contraignent ensuite des Juifs à vivre dans des ghettos.',
    },
    {
      q: 'Quelle suite d’actions décrit le processus du génocide des Tsiganes ?',
      a: 'recensement, stérilisations, massacres, ghettoïsation et déportations',
      wrong: [
        { label: 'élections, réformes, congés payés', why: 'Ces actions n’ont rien à voir avec un génocide.' },
        { label: 'armistice, traité de paix, reconstruction', why: 'Ces mots désignent la fin d’une guerre.' },
        {
          label: 'exil volontaire, retour, indemnisation immédiate',
          why: 'Les victimes subissent des violences imposées.',
        },
      ],
      gap: [
        'Le processus comprend recensement, stérilisations, massacres, ghettoïsation et ',
        '.',
        ['déportations', 'deportations', 'déportation', 'deportation'],
      ],
      ...PREUVES.processusTsigane,
      explain: 'Le génocide suit des étapes qui mènent à la mise à mort.',
    },
  ],
  paires3: [
    ['Shoah', 'Génocide des Juifs'],
    ['Einsatzgruppen', 'Auteurs de massacres collectifs à l’Est'],
    ['Lois de Nuremberg', 'Ségrégation des Juifs en 1935'],
  ],
  paires5: [
    ['Antisémitisme', 'Racisme dirigé contre les Juifs'],
    ['Ghetto', 'Quartier où des Juifs sont tenus de résider'],
    ['Nuit de Cristal', 'Pogrom de novembre 1938'],
    ['Rafle du Vél’ d’Hiv’', 'Arrestations de Juifs à Paris en 1942'],
    ['27 janvier 1945', 'Découverte du camp d’Auschwitz'],
  ],
  frise: [
    { label: 'L’arrivée d’Hitler au pouvoir', date: '1933', ...PREUVES.hitler1933 },
    { label: 'Les lois de Nuremberg', date: '1935', ...PREUVES.nuremberg },
    { label: 'La nuit de Cristal', date: '1938', ...PREUVES.cristal },
    { label: 'Les premiers massacres collectifs à l’Est', date: '1941', ...PREUVES.einsatz },
    { label: 'La rafle du Vél’ d’Hiv’', date: '1942', ...PREUVES.rafle },
    { label: 'La découverte du camp d’Auschwitz', date: '1945', ...PREUVES.auschwitz },
  ],
  libres: [
    {
      q: 'Comment appelle-t-on l’entreprise d’extermination systématique d’un groupe humain ?',
      accepted: mot('génocide', 'un ', 'le '),
      traps: [
        {
          text: 'pogrom',
          why: 'Un pogrom est une attaque violente contre des Juifs ; le génocide vise l’extermination d’un groupe.',
        },
        { text: 'ségrégation', why: 'La ségrégation sépare des personnes : ce n’est pas leur extermination.' },
      ],
      ...PREUVES.definition,
      explain: 'C’est la définition du génocide.',
    },
    {
      q: 'Quel mot hébreu désigne le génocide des Juifs par les nazis ?',
      accepted: mot('Shoah', 'la '),
      traps: [
        { text: 'Holocauste', why: 'C’est un autre terme, que Éduscol déconseille.' },
        { text: 'Torah', why: 'La Torah est un texte religieux juif.' },
      ],
      ...PREUVES.motShoah,
      explain: 'La Shoah désigne le génocide des Juifs.',
    },
    {
      q: 'Quel peuple, aussi appelé Roms, a subi avec les Juifs un génocide nazi ?',
      accepted: [
        ...mot('Tsiganes', 'les ', 'des '),
        ...mot('Tziganes', 'les ', 'des '),
        'tsigane',
        'tzigane',
        ...mot('Roms', 'les ', 'des '),
      ],
      traps: [
        { text: 'Arméniens', why: 'Le génocide des Arméniens date de 1915, dans l’Empire ottoman.' },
        { text: 'Polonais', why: 'La question porte sur le peuple aussi appelé Roms.' },
      ],
      ...PREUVES.victimes,
      explain: 'Les Tsiganes (Roms) ont aussi subi un génocide.',
    },
    {
      q: 'Quel camp est découvert le 27 janvier 1945, date retenue pour la journée de mémoire des génocides ?',
      accepted: mot('Auschwitz', 'le camp d’', 'camp d’'),
      traps: [
        {
          text: 'Drancy',
          why: 'Drancy, près de Paris, est un camp d’internement d’où partaient des déportés de France.',
        },
        { text: 'Rethondes', why: 'Rethondes est un lieu d’armistice.' },
      ],
      ...PREUVES.auschwitz,
      explain: 'Le 27 janvier 1945, le camp d’Auschwitz est découvert.',
    },
    {
      q: 'Comment appelle-t-on le racisme dirigé contre les Juifs ?',
      accepted: [...mot('antisémitisme', 'l’'), 'antisemitisme'],
      traps: [
        { text: 'antifascisme', why: 'L’antifascisme s’oppose au fascisme.' },
        { text: 'antiparlementarisme', why: 'L’antiparlementarisme rejette le Parlement.' },
      ],
      ...PREUVES.antisemitisme,
      explain: 'L’antisémitisme vise les Juifs.',
    },
    {
      q: 'En quelle année a lieu la rafle du Vél’ d’Hiv’, à Paris ?',
      accepted: annee('1942'),
      traps: [
        { text: '1938', why: '1938 est l’année de la nuit de Cristal, en Allemagne.' },
        { text: '1945', why: '1945 est l’année de la découverte d’Auschwitz.' },
      ],
      ...PREUVES.rafle,
      explain: 'La rafle a lieu les 16 et 17 juillet 1942.',
    },
  ],
  docs: [
    {
      title: 'De la persécution à l’extermination',
      lines: [
        'Dès 1933, l’Allemagne nazie met en place une ségrégation contre les Juifs ; les lois de Nuremberg suivent en 1935.',
        'En novembre 1938, la nuit de Cristal est un vaste pogrom.',
        'Dès l’été 1941, à l’Est, les Einsatzgruppen commettent les premiers massacres collectifs.',
        'Des centres de mise à mort sont ensuite implantés sur le territoire polonais.',
      ],
      qs: [
        {
          q: 'D’après le texte, quel événement de la ligne 2 est un pogrom ?',
          a: 'la nuit de Cristal',
          wrong: [
            { label: 'les lois de Nuremberg', why: 'Ce sont des lois de ségrégation (ligne 1).' },
            { label: 'la découverte d’Auschwitz', why: 'Elle n’est pas dans le texte et date de 1945.' },
          ],
          ...PREUVES.cristal,
          explain: 'La ligne 2 qualifie la nuit de Cristal de pogrom.',
        },
        {
          q: 'Quel changement apparaît entre les lignes 1 et 3 ?',
          a: 'on passe de la ségrégation aux massacres de masse',
          wrong: [
            {
              label: 'on passe des massacres à une ségrégation plus faible',
              why: 'L’ordre du temps est l’inverse : la violence s’aggrave.',
            },
            { label: 'la persécution s’arrête en 1941', why: 'En 1941 commencent au contraire les massacres.' },
          ],
          ...PREUVES.etapes,
          explain: 'Le génocide résulte d’un processus qui s’aggrave jusqu’à l’extermination.',
        },
        {
          q: 'En réutilisant ton cours : quel mot désigne le génocide des Juifs évoqué par ce texte ?',
          a: 'la Shoah',
          wrong: [
            { label: 'la Résistance', why: 'La Résistance s’oppose à l’occupant.' },
            { label: 'l’armistice', why: 'L’armistice arrête les combats.' },
          ],
          ...PREUVES.motShoah,
          explain: 'Le génocide des Juifs est la Shoah.',
        },
      ],
    },
    {
      title: 'La France et la mémoire',
      lines: [
        'Les 16 et 17 juillet 1942, la police parisienne arrête 12 884 hommes et femmes juifs de la région parisienne, dont environ 4 000 enfants.',
        'Le gouvernement de Vichy accepte de livrer à l’occupant des milliers de Juifs.',
        'Le 27 janvier 1945 est le jour de la découverte du camp d’Auschwitz.',
        'La France a retenu le 27 janvier pour une journée de mémoire.',
      ],
      qs: [
        {
          q: 'D’après la ligne 1, qui arrête les personnes juives en juillet 1942 ?',
          a: 'la police parisienne',
          wrong: [
            { label: 'les armées alliées', why: 'Les Alliés combattent l’Allemagne nazie.' },
            { label: 'les résistants', why: 'Les résistants s’opposent à l’occupant.' },
          ],
          ...PREUVES.rafle,
          explain: 'La ligne 1 nomme la police parisienne.',
        },
        {
          q: 'D’après la ligne 2, quelle est l’attitude du gouvernement de Vichy ?',
          a: 'il accepte de livrer des Juifs à l’occupant',
          wrong: [
            { label: 'il refuse de livrer des Juifs', why: 'Le texte dit le contraire.' },
            { label: 'il combat l’occupant par les armes', why: 'Vichy collabore avec l’occupant.' },
          ],
          ...PREUVES.livrer,
          explain: 'Vichy participe à la politique de déportation.',
        },
        {
          q: 'Que commémore la journée du 27 janvier évoquée à la ligne 4 ?',
          a: 'la mémoire des génocides et la prévention des crimes contre l’humanité',
          wrong: [
            { label: 'la fin de la Première Guerre mondiale', why: 'Elle est commémorée le 11 novembre.' },
            { label: 'l’appel du général de Gaulle', why: 'L’appel date du 18 juin 1940.' },
          ],
          ...PREUVES.auschwitz,
          explain: 'Le 27 janvier, découverte d’Auschwitz, est une journée de mémoire des génocides.',
        },
      ],
    },
  ],
};

// ——— Notion 3 ———

const franceOccupee: Notion = {
  id: 'h3-france-occupee',
  title: 'La France défaite et occupée',
  hint: 'Situe la question entre la défaite de 1940, la vie sous l’Occupation et la Libération.',
  memo: [
    'La bataille de France commence le 10 mai 1940 : des habitants fuient vers le sud (l’**exode**) et les Allemands entrent à Paris le 14 juin.',
    'Le maréchal Pétain demande l’**armistice**, signé le 22 juin à Rethondes. La France est coupée entre une **zone occupée** et une **zone libre**, puis occupée en entier ; le gouvernement s’installe à Vichy.',
    'Sous l’**Occupation** (1940-1944), il y a le **rationnement** puis le Service du travail obligatoire (1943). Paris se libère en août 1944. Astuce brevet : distingue la défaite (1940), l’Occupation et la Libération.',
  ],
  faits: [
    {
      q: 'Quand la bataille de France commence-t-elle ?',
      a: 'le 10 mai 1940',
      wrong: [
        { label: 'le 3 septembre 1939', why: 'Le 3 septembre 1939, la France déclare la guerre.' },
        { label: 'le 22 juin 1940', why: 'Le 22 juin, c’est la signature de l’armistice.' },
        { label: 'le 6 juin 1944', why: 'C’est le débarquement en Normandie.' },
      ],
      gap: ['La bataille de France commence le 10 mai ', '.', ['1940']],
      ...PREUVES.offensive,
      explain: 'L’offensive allemande débute le 10 mai 1940.',
    },
    {
      q: 'Comment appelle-t-on la fuite de nombreux habitants vers le sud en 1940 ?',
      a: 'l’exode',
      wrong: [
        { label: 'la Libération', why: 'La Libération met fin à l’Occupation.' },
        { label: 'la déportation', why: 'La déportation est un transfert imposé vers des camps.' },
        { label: 'la mobilisation', why: 'La mobilisation appelle les forces d’un pays à la guerre.' },
      ],
      gap: ['La fuite des habitants vers le sud s’appelle l’', '.', ['exode']],
      ...PREUVES.exode,
      explain: 'Terrifiés par les combats, de nombreux habitants partent vers le sud.',
    },
    {
      q: 'Quel jour les troupes allemandes entrent-elles à Paris ?',
      a: 'le 14 juin 1940',
      wrong: [
        { label: 'le 25 août 1944', why: 'Le 25 août 1944 se situe lors des combats de la Libération.' },
        { label: 'le 11 novembre 1918', why: 'C’est l’armistice de la Première Guerre mondiale.' },
        { label: 'le 18 juin 1940', why: 'Le 18 juin est le jour de l’appel du général de Gaulle.' },
      ],
      gap: ['Les troupes allemandes entrent à Paris le ', ' juin 1940.', ['14', 'quatorze']],
      ...PREUVES.paris,
      explain: 'Paris est occupée à partir du 14 juin 1940.',
    },
    {
      q: 'Qui annonce, le 17 juin 1940, la fin des combats à la radio ?',
      a: 'le maréchal Pétain',
      wrong: [
        { label: 'le général de Gaulle', why: 'Le 18 juin, de Gaulle appelle au contraire à poursuivre le combat.' },
        { label: 'Jean Moulin', why: 'Jean Moulin est un résistant.' },
        { label: 'Adolf Hitler', why: 'Le discours est celui d’un dirigeant français.' },
      ],
      gap: ['Le 17 juin 1940, le maréchal ', ' annonce la fin des combats.', ['Pétain', 'Petain', 'Philippe Pétain']],
      ...PREUVES.petain17,
      explain: 'Pétain annonce la fin des combats.',
    },
    {
      q: 'Que signe la France à Rethondes le 22 juin 1940 ?',
      a: 'un armistice',
      wrong: [
        { label: 'un traité de paix', why: 'Un armistice suspend les combats : ce n’est pas un traité de paix.' },
        { label: 'une déclaration de guerre', why: 'La guerre a été déclarée en septembre 1939.' },
        { label: 'une constitution', why: 'La constitution n’est pas signée à Rethondes.' },
      ],
      gap: ['Le 22 juin 1940, l’', ' est signé à Rethondes.', ['armistice']],
      ...PREUVES.armistice,
      explain: 'L’armistice est signé à Rethondes.',
    },
    {
      q: 'Comment s’appelle la partie de la France où le gouvernement français veut fixer son siège après l’armistice ?',
      a: 'la zone libre',
      wrong: [
        { label: 'la zone occupée', why: 'La zone occupée est tenue par les troupes allemandes.' },
        { label: 'l’espace vital', why: 'L’espace vital concerne les projets nazis à l’Est.' },
        { label: 'l’empire colonial', why: 'L’empire colonial est outre-mer.' },
      ],
      gap: ['Après l’armistice, le gouvernement fixe son siège en zone ', '.', ['libre', 'sud', 'Sud']],
      ...PREUVES.zoneLibre,
      explain: 'Le gouvernement quitte la zone occupée pour la zone libre.',
    },
    {
      q: 'Comment appelle-t-on la partie de la France tenue par les troupes allemandes après l’armistice ?',
      a: 'la zone occupée',
      wrong: [
        { label: 'la zone libre', why: 'La zone libre n’est pas encore occupée en 1940.' },
        { label: 'la France libre', why: 'La France libre est l’organisation du général de Gaulle.' },
        { label: 'le front intérieur', why: 'Le front intérieur désigne l’arrière d’un pays en guerre.' },
      ],
      gap: ['Après l’armistice, Bordeaux se trouve en zone ', '.', ['occupée', 'occupee', 'nord', 'Nord']],
      ...PREUVES.zoneOccupee,
      explain: 'Les troupes allemandes tiennent la zone occupée.',
    },
    {
      q: 'Dans quelle ville le gouvernement s’installe-t-il à partir de juillet 1940 ?',
      a: 'Vichy',
      wrong: [
        { label: 'Londres', why: 'Londres est la ville où le général de Gaulle continue le combat.' },
        { label: 'Bordeaux', why: 'Le gouvernement y passe avant de partir : la ville est en zone occupée.' },
        { label: 'Berlin', why: 'Berlin est la capitale de l’Allemagne.' },
      ],
      gap: ['Début juillet 1940, le gouvernement décide de transférer son siège à ', '.', ['Vichy']],
      ...PREUVES.vichySiege,
      explain: 'Vichy dispose de nombreux hôtels pour accueillir les pouvoirs publics.',
    },
    {
      q: 'Pendant l’Occupation, comment la France est-elle occupée entre 1940 et 1944 ?',
      a: 'd’abord en partie, puis entièrement',
      wrong: [
        { label: 'jamais, aucune troupe étrangère n’entre en France', why: 'La France est occupée pendant la guerre.' },
        {
          label: 'entièrement dès 1940, puis plus du tout',
          why: 'En 1940, une zone reste libre ; l’occupation s’étend ensuite.',
        },
        { label: 'seulement à partir de 1945', why: 'En 1945 la France est libérée.' },
      ],
      gap: [
        'De 1940 à 1944, la France fut partiellement, puis ',
        ' occupée.',
        ['entièrement', 'entierement', 'totalement', 'complètement', 'completement'],
      ],
      ...PREUVES.occupationDef,
      explain: 'L’occupation devient totale.',
    },
    {
      q: 'Comment appelle-t-on la mesure qui limite les quantités de biens de première nécessité ?',
      a: 'le rationnement',
      wrong: [
        { label: 'l’exode', why: 'L’exode est une fuite de population.' },
        { label: 'la mobilisation', why: 'La mobilisation concerne les forces pour la guerre.' },
        { label: 'la censure', why: 'La censure interdit des informations.' },
      ],
      gap: ['Quand les biens manquent, on met en place le ', '.', ['rationnement']],
      ...PREUVES.rationnement,
      explain: 'Le rationnement limite les produits disponibles.',
    },
    {
      q: 'À partir de février 1943, pour quelle obligation des hommes sont-ils requis ?',
      a: 'le Service du travail obligatoire (STO)',
      wrong: [
        { label: 'le service militaire dans la France libre', why: 'La France libre réunit des volontaires.' },
        { label: 'les congés payés', why: 'Les congés payés datent de 1936.' },
        { label: 'le suffrage universel', why: 'Le suffrage universel est le droit de vote.' },
      ],
      gap: ['Des hommes requis pour le Service du travail ', ' prennent le maquis.', ['obligatoire']],
      ...PREUVES.sto,
      explain: 'Le STO date de 1943 ; certains refusent et rejoignent le maquis.',
    },
    {
      q: 'Quand les combats de la Libération de Paris ont-ils lieu ?',
      a: 'en août 1944',
      wrong: [
        { label: 'en juin 1940', why: 'En juin 1940, les Allemands entrent à Paris.' },
        { label: 'en mai 1945', why: 'Le 8 mai 1945 marque la victoire en Europe.' },
        { label: 'en novembre 1918', why: 'Il s’agit de la Première Guerre mondiale.' },
      ],
      gap: ['Les combats de la Libération de Paris ont lieu en août ', '.', ['1944']],
      ...PREUVES.parisLibere,
      explain: 'L’insurrection parisienne et les combats se déroulent du 19 au 25 août 1944.',
    },
  ],
  paires3: [
    ['Exode', 'Fuite d’habitants vers le sud'],
    ['Armistice', 'Arrêt provisoire des combats'],
    ['Rationnement', 'Quantités limitées de produits'],
  ],
  paires5: [
    ['10 mai 1940', 'Début de la bataille de France'],
    ['14 juin 1940', 'Les Allemands entrent à Paris'],
    ['22 juin 1940', 'Signature de l’armistice'],
    ['Février 1943', 'Service du travail obligatoire'],
    ['Août 1944', 'Combats de la Libération de Paris'],
  ],
  frise: [
    { label: 'La déclaration de guerre à l’Allemagne', date: '1939', ...PREUVES.guerre1939 },
    { label: 'La signature de l’armistice à Rethondes', date: '1940', ...PREUVES.armistice },
    { label: 'Le Service du travail obligatoire', date: '1943', ...PREUVES.sto },
    { label: 'Les combats de la Libération de Paris', date: '1944', ...PREUVES.parisLibere },
    { label: 'La victoire des Alliés en Europe', date: '1945', ...PREUVES.victoire },
  ],
  libres: [
    {
      q: 'Quel nom donne-t-on à l’arrêt provisoire des combats signé le 22 juin 1940 ?',
      accepted: [...mot('armistice', 'l’', 'un '), 'l’armistice de 1940'],
      traps: [
        { text: 'capitulation', why: 'Le texte signé le 22 juin est un armistice.' },
        { text: 'paix', why: 'Un armistice n’est pas encore un traité de paix.' },
      ],
      ...PREUVES.armisticeDef,
      explain: 'L’armistice est un arrêt provisoire des hostilités.',
    },
    {
      q: 'Comment appelle-t-on la fuite massive d’habitants vers le sud pendant la bataille de France ?',
      accepted: mot('exode', 'l’', 'un '),
      traps: [
        { text: 'exil', why: 'Le mot du cours pour cette fuite massive de 1940 est un autre.' },
        { text: 'déportation', why: 'La déportation est un transfert imposé vers des camps.' },
      ],
      ...PREUVES.exode,
      explain: 'C’est l’exode.',
    },
    {
      q: 'Dans quelle localité l’armistice de juin 1940 est-il signé ?',
      accepted: mot('Rethondes', 'à '),
      traps: [
        { text: 'Vichy', why: 'Vichy devient le siège du gouvernement.' },
        { text: 'Londres', why: 'Londres est la ville de l’appel du 18 juin.' },
      ],
      ...PREUVES.armistice,
      explain: 'L’armistice est signé à Rethondes.',
    },
    {
      q: 'Dans quelle ville le gouvernement français s’installe-t-il en juillet 1940 ?',
      accepted: mot('Vichy', 'à '),
      traps: [
        { text: 'Bordeaux', why: 'Le gouvernement quitte Bordeaux, située en zone occupée.' },
        { text: 'Paris', why: 'Paris est occupée.' },
      ],
      ...PREUVES.vichySiege,
      explain: 'Le siège est transféré à Vichy.',
    },
    {
      q: 'Comment appelle-t-on la partie de la France non occupée en 1940 ?',
      accepted: mot('zone libre', 'la ', 'une '),
      traps: [
        { text: 'zone occupée', why: 'C’est la partie tenue par les Allemands.' },
        { text: 'France libre', why: 'La France libre est l’organisation du général de Gaulle.' },
      ],
      ...PREUVES.zoneLibre,
      explain: 'C’est la zone libre.',
    },
    {
      q: 'Quel mot désigne la limitation des biens de première nécessité disponibles pour la population ?',
      accepted: mot('rationnement', 'le ', 'un '),
      traps: [
        { text: 'collaboration', why: 'La collaboration est le service de l’occupant.' },
        { text: 'exode', why: 'L’exode est une fuite de population.' },
      ],
      ...PREUVES.rationnement,
      explain: 'C’est le rationnement.',
    },
  ],
  docs: [
    {
      title: 'Le printemps 1940',
      lines: [
        'Le 10 mai 1940, la bataille de France commence.',
        'De nombreux habitants, terrifiés par l’avancée des combats, tentent de rejoindre le Sud.',
        'Le 14 juin, les troupes allemandes entrent à Paris.',
        'Le 22 juin, l’armistice est signé à Rethondes.',
      ],
      qs: [
        {
          q: 'Quel mot de cours désigne le mouvement décrit à la ligne 2 ?',
          a: 'l’exode',
          wrong: [
            { label: 'la mobilisation', why: 'La mobilisation appelle les forces à la guerre.' },
            { label: 'la déportation', why: 'La déportation est imposée et mène à des camps.' },
          ],
          ...PREUVES.exode,
          explain: 'La fuite vers le Sud est l’exode.',
        },
        {
          q: 'D’après le texte, quel événement a lieu après l’entrée des Allemands à Paris ?',
          a: 'la signature de l’armistice',
          wrong: [
            { label: 'le début de la bataille de France', why: 'La ligne 1 date ce début au 10 mai, avant.' },
            { label: 'la libération de Paris', why: 'Elle n’a lieu qu’en 1944.' },
          ],
          ...PREUVES.armistice,
          explain: 'L’armistice du 22 juin vient après le 14 juin.',
        },
        {
          q: 'En utilisant tes connaissances : quelle conséquence politique la défaite de juin 1940 provoque-t-elle ?',
          a: 'un effondrement politique, social et moral',
          wrong: [
            { label: 'un renforcement de la IIIe République', why: 'La défaite fragilise au contraire le régime.' },
            { label: 'la fin immédiate de la guerre dans le monde', why: 'La guerre continue jusqu’en 1945.' },
          ],
          ...PREUVES.defaite,
          explain: 'La défaite provoque un effondrement politique, social et moral.',
        },
      ],
    },
    {
      title: 'Vivre sous l’Occupation',
      lines: [
        'De 1940 à 1944, la France est d’abord occupée en partie, puis entièrement.',
        'Les biens de première nécessité sont rationnés.',
        'En 1943, des hommes sont requis pour le Service du travail obligatoire ; certains prennent le maquis.',
        'En août 1944, les combats de la Libération se déroulent à Paris.',
      ],
      qs: [
        {
          q: 'D’après la ligne 3, que font certains hommes requis pour le STO ?',
          a: 'ils prennent le maquis',
          wrong: [
            { label: 'ils signent un armistice', why: 'Les hommes requis ne signent pas d’armistice.' },
            { label: 'ils entrent au gouvernement', why: 'Le texte parle du maquis.' },
          ],
          ...PREUVES.sto,
          explain: 'Certains refusent et rejoignent le maquis.',
        },
        {
          q: 'Quel mot résume la situation décrite à la ligne 2 ?',
          a: 'le rationnement',
          wrong: [
            { label: 'l’exode', why: 'L’exode est la fuite de 1940.' },
            { label: 'la collaboration', why: 'La collaboration est une aide à l’occupant.' },
          ],
          ...PREUVES.rationnement,
          explain: 'Les biens limités sont rationnés.',
        },
        {
          q: 'Quel élément du texte date la Libération de Paris ?',
          a: 'août 1944, à la ligne 4',
          wrong: [
            { label: '1940, à la ligne 1', why: '1940 marque le début de l’Occupation.' },
            { label: '1943, à la ligne 3', why: '1943 est l’année du STO.' },
          ],
          ...PREUVES.parisLibere,
          explain: 'La ligne 4 situe les combats de la Libération en août 1944.',
        },
      ],
    },
  ],
};

// ——— Notion 4 ———

const vichy: Notion = {
  id: 'h3-vichy-resistance',
  title: 'Vichy, la collaboration et la Résistance',
  hint: 'Demande-toi qui agit : le régime de Vichy, un acteur de la collaboration ou la Résistance.',
  memo: [
    'Le 10 juillet 1940, le Parlement donne les **pleins pouvoirs** au maréchal Pétain : l’**État français** de Vichy, autoritaire, rejette les valeurs républicaines.',
    'Vichy choisit la **collaboration** avec l’occupant et crée la **Milice** (1943) pour combattre la Résistance.',
    'La **Résistance** continue le combat : appel du général de Gaulle (18 juin 1940), France libre, **maquis**, journaux **clandestins** ; Jean Moulin l’unit au sein du Conseil national de la Résistance (1943). Astuce brevet : oppose collaboration et Résistance.',
  ],
  faits: [
    {
      q: 'Le 10 juillet 1940, à qui le Parlement donne-t-il les pleins pouvoirs ?',
      a: 'au gouvernement du maréchal Pétain',
      wrong: [
        { label: 'au général de Gaulle', why: 'Le général de Gaulle a rejoint Londres pour continuer le combat.' },
        { label: 'à Jean Moulin', why: 'Jean Moulin est un résistant.' },
        { label: 'au Front populaire', why: 'Le Front populaire est une alliance de 1936.' },
      ],
      gap: [
        'Le 10 juillet 1940, les pleins pouvoirs vont au gouvernement du maréchal ',
        '.',
        ['Pétain', 'Petain', 'Philippe Pétain'],
      ],
      ...PREUVES.pouvoirs,
      explain: 'Le vote donne tous les pouvoirs au gouvernement de Pétain.',
    },
    {
      q: 'Combien de parlementaires votent contre les pleins pouvoirs le 10 juillet 1940 ?',
      a: '80',
      wrong: [
        { label: '569', why: '569 est le nombre de voix pour.' },
        { label: 'aucun', why: 'Une partie des parlementaires s’y oppose.' },
        { label: '627', why: '627 est le nombre de voix pour au vote préparatoire du 9 juillet.' },
      ],
      gap: [
        'Le 10 juillet 1940, ',
        ' parlementaires votent contre les pleins pouvoirs.',
        ['80', 'quatre-vingts', 'quatre vingts', 'quatre-vingt'],
      ],
      ...PREUVES.pleinsPouvoirs,
      explain: 'Le texte est adopté par 569 voix contre 80.',
    },
    {
      q: 'Quel nom porte le régime fondé en juillet 1940 par les actes constitutionnels ?',
      a: 'l’État français',
      wrong: [
        { label: 'la Ve République', why: 'La Ve République est fondée après la guerre.' },
        { label: 'la France libre', why: 'La France libre est l’organisation du général de Gaulle.' },
        { label: 'l’Empire', why: 'Le régime de 1940 ne porte pas ce nom.' },
      ],
      gap: ['Les actes constitutionnels de juillet 1940 fondent l’État ', '.', ['français', 'francais']],
      ...PREUVES.etatFrancais,
      explain: 'Le régime de Vichy est appelé l’État français.',
    },
    {
      q: 'Quelle devise le texte du 10 juillet 1940 annonce-t-il pour la nouvelle Constitution ?',
      a: 'Travail, Famille, Patrie',
      wrong: [
        { label: 'Liberté, Égalité, Fraternité', why: 'C’est la devise de la République, que Vichy abandonne.' },
        { label: 'Union, Paix, Progrès', why: 'Le texte cite d’autres valeurs.' },
        { label: 'Unie dans la diversité', why: 'C’est la devise de l’Union européenne.' },
      ],
      gap: ['La nouvelle Constitution doit garantir les droits du Travail, de la Famille et de la ', '.', ['Patrie']],
      ...PREUVES.devise,
      explain: 'Travail, Famille et Patrie remplacent les valeurs républicaines.',
    },
    {
      q: 'Comment l’Assemblée nationale décrit-elle le régime de Vichy ?',
      a: 'autoritaire et hostile aux valeurs républicaines',
      wrong: [
        { label: 'démocratique et attaché à la République', why: 'Vichy rejette les valeurs républicaines.' },
        { label: 'élu librement et favorable aux libertés', why: 'C’est un régime hors de la démocratie.' },
        { label: 'communiste et révolutionnaire', why: 'Vichy n’est pas un régime communiste.' },
      ],
      gap: ['Vichy est un régime ', ' et très hostile aux valeurs républicaines.', ['autoritaire']],
      ...PREUVES.autoritaire,
      explain: 'C’est un régime autoritaire.',
    },
    {
      q: 'Comment appelle-t-on, pendant l’Occupation, le fait de se mettre au service de l’occupant ?',
      a: 'la collaboration',
      wrong: [
        { label: 'la Résistance', why: 'La Résistance s’oppose à l’occupant.' },
        { label: 'la mobilisation', why: 'La mobilisation rassemble les forces d’un pays.' },
        { label: 'le rationnement', why: 'Le rationnement limite les produits.' },
      ],
      gap: ['Se mettre au service de l’occupant, c’est la ', '.', ['collaboration']],
      ...PREUVES.collaboration,
      explain: 'La collaboration, c’est servir l’occupant.',
    },
    {
      q: 'Quelle organisation le gouvernement de Vichy crée-t-il en 1943 pour combattre la Résistance ?',
      a: 'la Milice',
      wrong: [
        { label: 'la France libre', why: 'La France libre combat l’occupant.' },
        { label: 'le Conseil national de la Résistance', why: 'Il unit la Résistance.' },
        { label: 'la Sécurité sociale', why: 'La Sécurité sociale est créée en 1945.' },
      ],
      gap: [
        'En 1943, Vichy crée la ',
        ' pour combattre la Résistance.',
        ['Milice', 'Milice française', 'Milice francaise'],
      ],
      ...PREUVES.milice,
      explain: 'La Milice renforce la répression.',
    },
    {
      q: 'Que fait le général de Gaulle le 18 juin 1940 à la BBC ?',
      a: 'il appelle les soldats à le rejoindre pour poursuivre les combats',
      wrong: [
        { label: 'il annonce la fin des combats', why: 'La fin des combats est annoncée par Pétain le 17 juin.' },
        { label: 'il signe l’armistice', why: 'L’armistice est signé le 22 juin, sans lui.' },
        { label: 'il reçoit les pleins pouvoirs', why: 'Les pleins pouvoirs vont à Pétain en juillet.' },
      ],
      gap: ['Le 18 juin 1940, le général de Gaulle appelle à poursuivre les combats depuis ', '.', ['Londres']],
      ...PREUVES.appel,
      explain: 'L’appel du 18 juin est lancé depuis Londres.',
    },
    {
      q: 'Quel nom la France libre prend-elle en juillet 1942 ?',
      a: 'la France combattante',
      wrong: [
        { label: 'l’État français', why: 'L’État français est le régime de Vichy.' },
        { label: 'la Milice', why: 'La Milice combat la Résistance.' },
        { label: 'le Front populaire', why: 'Le Front populaire date de 1936.' },
      ],
      gap: ['En juillet 1942, la France libre devient la France ', '.', ['combattante']],
      ...PREUVES.combattante,
      explain: 'La France libre devient la France combattante.',
    },
    {
      q: 'Quelle mission Jean Moulin reçoit-il en 1943 ?',
      a: 'rassembler toutes les composantes de la Résistance',
      wrong: [
        { label: 'organiser la collaboration avec l’occupant', why: 'Jean Moulin combat l’occupant.' },
        { label: 'signer l’armistice', why: 'L’armistice date de 1940.' },
        { label: 'diriger la Milice', why: 'La Milice combat la Résistance.' },
      ],
      gap: ['En 1943, Jean ', ' reçoit la mission de rassembler la Résistance.', ['Moulin']],
      ...PREUVES.moulin,
      explain: 'Jean Moulin unit la Résistance.',
    },
    {
      q: 'Quand le programme du Conseil national de la Résistance est-il adopté ?',
      a: 'le 15 mars 1944',
      wrong: [
        { label: 'le 18 juin 1940', why: 'C’est le jour de l’appel du général de Gaulle.' },
        { label: 'le 10 juillet 1940', why: 'C’est le vote des pleins pouvoirs.' },
        { label: 'le 8 mai 1945', why: 'C’est la victoire en Europe.' },
      ],
      gap: ['Le programme du CNR est adopté le 15 mars ', '.', ['1944']],
      ...PREUVES.programmeCnr,
      explain: 'Le CNR adopte son programme à l’unanimité.',
    },
    {
      q: 'Comment appelle-t-on l’ensemble des actions d’opposition menées dans les pays occupés par l’Allemagne nazie ?',
      a: 'la Résistance',
      wrong: [
        { label: 'la collaboration', why: 'La collaboration sert l’occupant.' },
        { label: 'la mobilisation', why: 'La mobilisation rassemble les forces d’un pays.' },
        { label: 'l’exode', why: 'L’exode est une fuite de population.' },
      ],
      gap: ['Les actions d’opposition à l’occupant forment la ', '.', ['Résistance', 'Resistance']],
      ...PREUVES.resistanceDef,
      explain: 'La Résistance s’oppose à l’occupant.',
    },
    {
      q: 'Comment s’appelle l’armée que le général de Gaulle forme à l’été 1940 ?',
      a: 'les Forces françaises libres (FFL)',
      wrong: [
        { label: 'la Milice', why: 'La Milice est créée par Vichy contre la Résistance.' },
        { label: 'la Wehrmacht', why: 'C’est l’armée allemande.' },
        { label: 'les Einsatzgruppen', why: 'Ce sont des groupes nazis auteurs de massacres.' },
      ],
      gap: ['À l’été 1940, de Gaulle forme les Forces françaises ', '.', ['libres']],
      ...PREUVES.franceLibre,
      explain: 'Les FFL combattent avec la France libre.',
    },
  ],
  paires3: [
    ['Collaboration', 'Se mettre au service de l’occupant'],
    ['Résistance', 'Actions d’opposition à l’occupant'],
    ['Maquis', 'Zone retirée où se cachent des résistants armés'],
  ],
  paires5: [
    ['Maréchal Pétain', 'Reçoit les pleins pouvoirs en 1940'],
    ['Général de Gaulle', 'Lance l’appel du 18 juin'],
    ['Jean Moulin', 'Rassemble la Résistance en 1943'],
    ['Milice', 'Créée par Vichy contre la Résistance'],
    ['Tracts et journaux clandestins', 'Moyens de convaincre contre l’occupant'],
  ],
  frise: [
    { label: 'Le vote des pleins pouvoirs à Pétain', date: '1940', ...PREUVES.pleinsPouvoirs },
    { label: 'La France libre devient la France combattante', date: '1942', ...PREUVES.combattante },
    { label: 'La première réunion du Conseil national de la Résistance', date: '1943', ...PREUVES.cnr },
    { label: 'L’adoption du programme du CNR', date: '1944', ...PREUVES.programmeCnr },
  ],
  libres: [
    {
      q: 'Quel maréchal dirige le gouvernement de Vichy ?',
      accepted: [...mot('Pétain', 'le maréchal ', 'maréchal '), 'Petain', 'Philippe Pétain'],
      traps: [
        { text: 'de Gaulle', why: 'Le général de Gaulle dirige la France libre.' },
        { text: 'Moulin', why: 'Jean Moulin est un résistant.' },
      ],
      ...PREUVES.pouvoirs,
      explain: 'Le gouvernement de Vichy est celui du maréchal Pétain.',
    },
    {
      q: 'Quel général lance, depuis Londres, l’appel du 18 juin 1940 ?',
      accepted: [...mot('de Gaulle', 'le général ', 'général ', 'Charles '), 'Gaulle'],
      traps: [
        { text: 'Pétain', why: 'Pétain annonce la fin des combats.' },
        { text: 'Moulin', why: 'Jean Moulin n’est pas général.' },
      ],
      ...PREUVES.appel,
      explain: 'L’appel est celui du général de Gaulle.',
    },
    {
      q: 'Quel résistant reçoit en 1943 la mission de rassembler la Résistance ?',
      accepted: ['Jean Moulin', 'Moulin'],
      traps: [
        { text: 'Pétain', why: 'Pétain dirige le gouvernement de Vichy.' },
        { text: 'de Gaulle', why: 'De Gaulle envoie la mission ; il ne la reçoit pas.' },
      ],
      ...PREUVES.moulin,
      explain: 'C’est Jean Moulin.',
    },
    {
      q: 'Comment appelle-t-on la politique du gouvernement de Vichy qui se met au service de l’occupant ?',
      accepted: mot('collaboration', 'la ', 'une '),
      traps: [
        { text: 'Résistance', why: 'La Résistance combat l’occupant.' },
        { text: 'neutralité', why: 'Une politique neutre ne sert pas l’occupant.' },
      ],
      ...PREUVES.collaborationPolitique,
      explain: 'C’est la collaboration.',
    },
    {
      q: 'Quelle organisation de volontaires le gouvernement de Vichy crée-t-il en 1943 contre la Résistance ?',
      accepted: [...mot('Milice', 'la '), 'Milice française', 'la Milice française'],
      traps: [
        { text: 'Wehrmacht', why: 'La question porte sur une organisation créée par Vichy.' },
        { text: 'FFL', why: 'Les FFL sont les Forces françaises libres.' },
      ],
      ...PREUVES.milice,
      explain: 'C’est la Milice.',
    },
    {
      q: 'Comment appelle-t-on les régions retirées où se cachent des résistants armés ?',
      accepted: [...mot('maquis', 'le ', 'les ', 'des '), 'les maquis'],
      traps: [
        { text: 'zone libre', why: 'La zone libre est une partie de la France en 1940.' },
        { text: 'ghetto', why: 'Un ghetto est un quartier où des Juifs sont isolés.' },
      ],
      ...PREUVES.maquis,
      explain: 'Ces régions et ces groupes sont les maquis.',
    },
  ],
  docs: [
    {
      title: 'Deux choix face à la défaite',
      lines: [
        'Le 17 juin 1940, le maréchal Pétain annonce la fin des combats.',
        'Le 18 juin, le général de Gaulle appelle depuis Londres les soldats à poursuivre les combats.',
        'Le 10 juillet, le Parlement donne les pleins pouvoirs au gouvernement de Pétain.',
        'Le régime de Vichy rejette les valeurs républicaines et collabore avec l’occupant.',
      ],
      qs: [
        {
          q: 'Quelle ligne montre un refus de la défaite ?',
          a: 'la ligne 2',
          wrong: [
            { label: 'la ligne 1', why: 'Pétain annonce la fin des combats.' },
            { label: 'la ligne 3', why: 'Ce vote donne le pouvoir à Pétain.' },
          ],
          ...PREUVES.appel,
          explain: 'L’appel du 18 juin refuse la défaite.',
        },
        {
          q: 'Quel choix de politique est décrit à la ligne 4 ?',
          a: 'la collaboration',
          wrong: [
            { label: 'la Résistance', why: 'La Résistance combat l’occupant.' },
            { label: 'la neutralité', why: 'Le texte dit que Vichy collabore.' },
          ],
          ...PREUVES.collaborationPolitique,
          explain: 'La ligne 4 parle de collaboration.',
        },
        {
          q: 'En mobilisant ton cours : quelle organisation le régime de Vichy crée-t-il en 1943 contre la Résistance ?',
          a: 'la Milice',
          wrong: [
            { label: 'les Forces françaises libres', why: 'Elles combattent avec de Gaulle.' },
            { label: 'le Conseil national de la Résistance', why: 'Il unit les résistants.' },
          ],
          ...PREUVES.milice,
          explain: 'La Milice est créée en 1943.',
        },
      ],
    },
    {
      title: 'Unir la Résistance',
      lines: [
        'Dans la France occupée, des résistants publient des tracts et des journaux clandestins.',
        'En 1943, Jean Moulin reçoit la mission de rassembler les composantes de la Résistance.',
        'Le 27 mai 1943, le Conseil de la Résistance se réunit clandestinement à Paris.',
        'Le 15 mars 1944, son programme est adopté.',
      ],
      qs: [
        {
          q: 'D’après la ligne 1, quel moyen les résistants emploient-ils pour convaincre la population ?',
          a: 'des tracts et des journaux clandestins',
          wrong: [
            { label: 'des élections libres', why: 'L’occupation ne permet pas de telles élections.' },
            { label: 'des affiches officielles de Vichy', why: 'Vichy n’est pas la Résistance.' },
          ],
          ...PREUVES.clandestins,
          explain: 'La ligne 1 cite tracts et journaux clandestins.',
        },
        {
          q: 'Quel résultat les lignes 2 et 3 montrent-elles ?',
          a: 'la Résistance s’organise et s’unit',
          wrong: [
            { label: 'la Résistance disparaît', why: 'La réunion montre au contraire son union.' },
            {
              label: 'la collaboration prend fin dès 1943',
              why: 'Le texte ne parle pas de la fin de la collaboration.',
            },
          ],
          ...PREUVES.cnr,
          explain: 'Le Conseil réunit les résistants.',
        },
        {
          q: 'Quelle est la dernière étape présentée dans le texte ?',
          a: 'l’adoption du programme en 1944',
          wrong: [
            { label: 'l’appel du 18 juin', why: 'Il n’est pas dans ce texte et date de 1940.' },
            { label: 'la réunion du 27 mai 1943', why: 'Elle précède l’adoption du programme.' },
          ],
          ...PREUVES.programmeCnr,
          explain: 'Le programme est adopté le 15 mars 1944.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [aneantissement, genocide, franceOccupee, vichy];

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'troisième'));
