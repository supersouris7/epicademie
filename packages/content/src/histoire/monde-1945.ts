import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES } from './monde-1945-sources.ts';

/**
 * 3e, « Le monde depuis 1945 » (lot hi-3e-03) : thème 2 du programme du cycle 4. La guerre d'Algérie est l'exemple
 * d'accès à l'indépendance. Sujets sensibles (guerre, terrorisme) : énoncés sobres, sans détail inutile. Les textes
 * à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle4-2020';

/** Une année seule ou précédée de « en ». */
const annee = (a: string) => [a, `en ${a}`, `l’an ${a}`, `l’année ${a}`];

/** Un mot ou un groupe nominal, avec ou sans article. */
const mot = (word: string, ...articles: string[]) => [word, ...articles.map((a) => `${a}${word}`)];

const w = (label: string, why: string) => ({ label, why });
const t = (text: string, why: string) => ({ text, why });

// ——— Notion 1 ———

const independances: Notion = {
  id: 'h3-decolonisation',
  title: 'Indépendances et construction de nouveaux États',
  hint: 'Distingue la date, l’acteur et l’événement : colonie, lutte, indépendance, nouvel État.',
  memo: [
    'Après 1945, les empires coloniaux s’effondrent vite : c’est la **décolonisation**. L’ONU soutient le droit des peuples à disposer d’eux-mêmes (Charte de 1945, déclaration de 1960).',
    'Exemple à connaître : l’Algérie, **colonie** depuis 1830, vit une guerre de 1954 à 1962. Après les accords d’Évian (18 mars 1962), elle devient **indépendante** le 5 juillet 1962.',
    'Les nouveaux États du **Tiers-Monde** se réunissent à Bandung en 1955 et cherchent le **non-alignement**. Astuce brevet : cite une date, un acteur et un lieu.',
  ],
  faits: [
    {
      q: 'Selon le programme, quel est un fait majeur du second XXe siècle ?',
      a: 'l’effondrement rapide des empires coloniaux',
      wrong: [
        w('la naissance des premiers empires coloniaux', 'Les conquêtes coloniales sont bien plus anciennes.'),
        w('le maintien de toutes les colonies', 'Au contraire, les colonies accèdent à l’indépendance.'),
        w('la disparition de tous les États', 'Le nombre d’États augmente fortement après 1945.'),
      ],
      gap: ['L’effondrement rapide des empires ', ' est un fait majeur du second XXe siècle.', ['coloniaux']],
      ...PREUVES.programmeEmpires,
      explain: 'Les empires coloniaux s’effondrent rapidement après 1945.',
    },
    {
      q: 'Comment appelle-t-on le processus par lequel des colonies accèdent à l’indépendance après 1945 ?',
      a: 'la décolonisation',
      wrong: [
        w('la colonisation', 'La colonisation est le mouvement inverse : la prise de contrôle d’un territoire.'),
        w('la mondialisation', 'La mondialisation désigne la multiplication des échanges dans le monde.'),
        w('la réunification', 'La réunification rassemble un pays divisé, comme l’Allemagne.'),
      ],
      gap: [
        'Après la Seconde Guerre mondiale, la ',
        ' fait naître de nouveaux États.',
        ['décolonisation', 'decolonisation'],
      ],
      ...PREUVES.decolonisation,
      explain: 'La décolonisation fait accéder à l’indépendance de nouveaux États.',
    },
    {
      q: 'Quel principe la Charte des Nations unies, signée en 1945, reconnaît-elle aux peuples ?',
      a: 'le droit de disposer d’eux-mêmes',
      wrong: [
        w('le devoir de rester sous domination coloniale', 'La Charte affirme au contraire l’égalité des peuples.'),
        w('le droit de veto au Conseil de sécurité', 'Le veto appartient à cinq États, pas à tous les peuples.'),
        w('le droit de conquérir de nouveaux territoires', 'La Charte vise à maintenir la paix.'),
      ],
      gap: ['La Charte de l’ONU reconnaît le droit des peuples à disposer d’', '.', ['eux-mêmes', 'eux mêmes']],
      ...PREUVES.charte,
      explain: 'C’est le droit des peuples à disposer d’eux-mêmes, base de la décolonisation.',
    },
    {
      q: 'En 1945, quelle part de la population mondiale vit dans des territoires dépendant de puissances coloniales ?',
      a: 'près d’un tiers',
      wrong: [
        w('presque la totalité', 'Environ 750 millions de personnes sont concernées, pas toute l’humanité.'),
        w('moins d’un centième', 'Cette part est beaucoup trop faible : 750 millions de personnes sont concernées.'),
        w('les trois quarts', 'C’est trop : près d’un tiers de la population mondiale.'),
      ],
      gap: ['En 1945, près d’un ', ' de la population mondiale vit sous domination coloniale.', ['tiers']],
      ...PREUVES.tiersPopulation,
      explain: 'Environ 750 millions de personnes, soit près du tiers de l’humanité, sont concernées.',
    },
    {
      q: 'En quelle année l’ONU adopte-t-elle la déclaration sur l’indépendance des pays et des peuples coloniaux ?',
      a: '1960',
      wrong: [
        w('1945', '1945 est l’année de la création de l’ONU.'),
        w('1955', '1955 est l’année de la conférence de Bandung.'),
        w('1989', '1989 est l’année de la chute du mur de Berlin.'),
      ],
      gap: ['La résolution 1514 sur l’indépendance des peuples coloniaux date de ', '.', annee('1960')],
      ...PREUVES.resolution1514,
      explain: 'La résolution 1514 est adoptée en 1960.',
    },
    {
      q: 'Quelle conférence de 1955 est la première conférence afro-asiatique ?',
      a: 'la conférence de Bandung',
      wrong: [
        w('la conférence de San Francisco', 'Elle élabore la Charte de l’ONU en 1945.'),
        w('la conférence de Rio', 'Elle porte sur l’environnement et le développement, en 1992.'),
        w('la COP21 de Paris', 'Elle porte sur le climat, en 2015.'),
      ],
      gap: ['En 1955, la première conférence afro-asiatique se tient à ', '.', ['Bandung', 'Bandoeng']],
      ...PREUVES.bandung,
      explain: 'La conférence de Bandung réunit des pays d’Afrique et d’Asie.',
    },
    {
      q: 'Quel terme, forgé par Alfred Sauvy en 1952, désigne les pays qui émergent sur la scène internationale entre les deux blocs ?',
      a: 'le Tiers-Monde',
      wrong: [
        w('le bloc de l’Est', 'Le bloc de l’Est regroupe les pays liés à l’URSS.'),
        w('le monde libre', 'Le « monde libre » désigne le camp des États-Unis.'),
        w('le Nouveau Monde', 'Le Nouveau Monde désigne traditionnellement l’Amérique.'),
      ],
      gap: ['Alfred Sauvy forge en 1952 l’expression « ', ' ».', ['Tiers-Monde', 'Tiers Monde']],
      ...PREUVES.tiersMonde,
      explain: 'Le Tiers-Monde est l’expression forgée par Alfred Sauvy.',
    },
    {
      q: 'Comment appelle-t-on l’attitude qui refuse de choisir l’un des deux blocs de la guerre froide ?',
      a: 'le non-alignement',
      wrong: [
        w('l’endiguement', 'L’endiguement est la politique américaine contre l’expansion soviétique.'),
        w('la dissuasion', 'La dissuasion repose sur la menace des armes nucléaires.'),
        w('l’élargissement', 'L’élargissement désigne l’entrée de nouveaux pays dans l’Union européenne.'),
      ],
      gap: ['Le refus de s’aligner sur l’un des deux blocs s’appelle le non-', '.', ['alignement']],
      ...PREUVES.nonAlignement,
      explain: 'Le non-alignement cherche à échapper à la bipolarisation du monde.',
    },
    {
      q: 'Depuis quelle année l’Algérie est-elle une colonie française avant son indépendance ?',
      a: '1830',
      wrong: [
        w('1789', '1789 est l’année du début de la Révolution française.'),
        w('1914', '1914 est l’année du début de la Première Guerre mondiale.'),
        w('1945', '1945 est la fin de la Seconde Guerre mondiale : la colonisation est bien antérieure.'),
      ],
      gap: ['L’Algérie est une colonie française depuis ', '.', annee('1830')],
      ...PREUVES.algerie1830,
      explain: 'La France colonise l’Algérie à partir de 1830.',
    },
    {
      q: 'Quel mouvement lance en 1954 une série d’attentats contre la présence française en Algérie ?',
      a: 'le Front de libération nationale (FLN)',
      wrong: [
        w(
          'l’Organisation de l’armée secrète (OAS)',
          'L’OAS est partisane de l’Algérie française : elle apparaît à la fin de la guerre.',
        ),
        w('l’Organisation des Nations unies (ONU)', 'L’ONU est une organisation internationale.'),
        w('l’Organisation du traité de l’Atlantique Nord (OTAN)', 'L’OTAN est une alliance militaire.'),
      ],
      gap: ['En 1954, le Front de libération ', ' lance des attentats en Algérie.', ['nationale']],
      ...PREUVES.fln,
      explain: 'Le FLN lutte pour l’indépendance algérienne à partir de 1954.',
    },
    {
      q: 'Quels accords, signés le 18 mars 1962, prévoient la fin de la guerre d’Algérie ?',
      a: 'les accords d’Évian',
      wrong: [
        w('les traités de Rome', 'Les traités de Rome de 1957 concernent la construction européenne.'),
        w('l’accord de Paris', 'L’accord de Paris de 2015 concerne le climat.'),
        w('les accords de Schengen', 'Schengen concerne la circulation entre pays européens.'),
      ],
      gap: ['Le 18 mars 1962 sont signés les accords d’', '.', ['Évian', 'Evian']],
      ...PREUVES.accords,
      explain: 'Les accords d’Évian ouvrent la voie à l’indépendance de l’Algérie.',
    },
    {
      q: 'Quand l’indépendance de l’Algérie est-elle proclamée ?',
      a: 'le 5 juillet 1962',
      wrong: [
        w('le 8 mai 1945', 'C’est la victoire sur l’Allemagne nazie en Europe.'),
        w('le 18 mars 1962', 'C’est la signature des accords d’Évian, avant la proclamation.'),
        w('le 24 février 1971', 'C’est la date de la nationalisation du pétrole et du gaz algériens.'),
      ],
      gap: ['L’indépendance de l’Algérie est proclamée le 5 juillet ', '.', annee('1962')],
      ...PREUVES.independance,
      explain: 'La proclamation du 5 juillet 1962 suit le référendum et les accords d’Évian.',
    },
    {
      q: 'Comment les Algériens se prononcent-ils au référendum de juillet 1962 ?',
      a: 'à plus de 90 % pour l’indépendance',
      wrong: [
        w('à plus de 90 % contre l’indépendance', 'C’est l’inverse du résultat.'),
        w('à égalité entre les deux choix', 'Le résultat est très net.'),
        w('ils ne sont pas consultés', 'Un référendum est organisé en juillet 1962.'),
      ],
      gap: ['En juillet 1962, les Algériens votent à plus de 90 % pour l’', '.', ['indépendance', 'independance']],
      ...PREUVES.referendum,
      explain: 'Le référendum donne une très large majorité à l’indépendance.',
    },
    {
      q: 'Quelle mesure économique l’Algérie indépendante prend-elle le 24 février 1971 ?',
      a: 'la nationalisation du pétrole et du gaz',
      wrong: [
        w('la création de la monnaie euro', 'L’euro est la monnaie de pays de l’Union européenne.'),
        w('l’adhésion à la Communauté économique européenne', 'La CEE est une organisation européenne.'),
        w('la suppression de toute frontière', 'Un nouvel État contrôle au contraire son territoire.'),
      ],
      gap: ['En 1971, l’Algérie procède à la ', ' du pétrole et du gaz.', ['nationalisation']],
      ...PREUVES.nationalisation,
      explain: 'Un nouvel État veut contrôler ses ressources : il les nationalise.',
    },
  ],
  paires3: [
    ['Décolonisation', 'Accès des colonies à l’indépendance'],
    ['Conférence de Bandung', 'Réunion afro-asiatique de 1955'],
    ['FLN', 'Mouvement algérien qui lutte pour l’indépendance'],
  ],
  paires5: [
    ['1830', 'Début de la colonisation française en Algérie'],
    ['1955', 'Conférence de Bandung'],
    ['1960', 'Déclaration de l’ONU sur l’indépendance des peuples coloniaux'],
    ['18 mars 1962', 'Signature des accords d’Évian'],
    ['24 février 1971', 'Nationalisation du pétrole et du gaz algériens'],
  ],
  frise: [
    { label: 'La signature de la Charte des Nations unies', date: '1945', ...PREUVES.charte },
    { label: 'La conférence de Bandung', date: '1955', ...PREUVES.bandung },
    { label: 'La déclaration de l’ONU sur les peuples coloniaux', date: '1960', ...PREUVES.resolution1514 },
    { label: 'La proclamation de l’indépendance de l’Algérie', date: '1962', ...PREUVES.independance },
    { label: 'La nationalisation du pétrole et du gaz algériens', date: '1971', ...PREUVES.nationalisation },
  ],
  libres: [
    {
      q: 'Quel mot désigne le processus qui fait accéder des colonies à l’indépendance ?',
      accepted: [...mot('décolonisation', 'la ', 'une '), 'decolonisation', 'la decolonisation'],
      traps: [
        t('colonisation', 'La colonisation est la prise de contrôle d’un territoire.'),
        t('mondialisation', 'La mondialisation concerne les échanges à l’échelle du monde.'),
      ],
      ...PREUVES.decolonisation,
      explain: 'La décolonisation est la fin de la domination coloniale.',
    },
    {
      q: 'Dans quelle ville se tient la conférence afro-asiatique de 1955 ?',
      accepted: ['Bandung', 'à Bandung', 'Bandoeng'],
      traps: [
        t('Évian', 'Évian est la ville des accords de 1962.'),
        t('San Francisco', 'San Francisco accueille la conférence sur la Charte de l’ONU en 1945.'),
      ],
      ...PREUVES.bandung,
      explain: 'Bandung accueille la première conférence afro-asiatique.',
    },
    {
      q: 'Quel est le sigle du mouvement qui lance des attentats en Algérie en 1954 ?',
      accepted: [...mot('FLN', 'le '), 'F.L.N.', 'Front de libération nationale', 'le Front de libération nationale'],
      traps: [
        t('OAS', 'L’OAS est partisane de l’Algérie française.'),
        t('ONU', 'L’ONU est l’organisation internationale.'),
      ],
      ...PREUVES.fln,
      explain: 'Le Front de libération nationale (FLN) déclenche la lutte en 1954.',
    },
    {
      q: 'Dans quelle ville sont signés, en mars 1962, les accords qui prévoient la fin de la guerre d’Algérie ?',
      accepted: ['Évian', 'Evian', 'à Évian', 'à Evian'],
      traps: [
        t('Bandung', 'Bandung accueille la conférence de 1955.'),
        t('Alger', 'Les accords de 1962 ne sont pas signés à Alger.'),
      ],
      ...PREUVES.accords,
      explain: 'Les accords d’Évian sont signés le 18 mars 1962.',
    },
    {
      q: 'En quelle année l’Algérie devient-elle indépendante ?',
      accepted: annee('1962'),
      traps: [
        t('1954', '1954 est le début de la guerre d’Algérie.'),
        t('1960', '1960 est l’année de la déclaration de l’ONU sur les peuples coloniaux.'),
      ],
      ...PREUVES.independance,
      explain: 'L’indépendance est proclamée le 5 juillet 1962.',
    },
    {
      q: 'Quelle expression désigne les pays qui émergent à Bandung, entre les deux blocs ?',
      accepted: [...mot('Tiers-Monde', 'le '), 'Tiers Monde', 'le Tiers Monde'],
      traps: [
        t('bloc de l’Est', 'Le bloc de l’Est est lié à l’URSS.'),
        t('Union européenne', 'L’Union européenne rassemble des pays d’Europe.'),
      ],
      ...PREUVES.tiersMonde,
      explain: 'Le Tiers-Monde cherche sa place entre les deux blocs.',
    },
  ],
  docs: [
    {
      title: 'L’essor des nouveaux États',
      lines: [
        'En 1945, près d’un tiers de la population mondiale vit sous domination coloniale.',
        'La Charte des Nations unies affirme le droit des peuples à disposer d’eux-mêmes.',
        'En 1955, des pays d’Afrique et d’Asie se réunissent à Bandung.',
        'En 1960, l’ONU adopte une déclaration sur l’indépendance des peuples coloniaux.',
      ],
      qs: [
        {
          q: 'D’après les lignes 3 et 4, quelle évolution les peuples colonisés obtiennent-ils à l’échelle internationale ?',
          a: 'leur voix se fait entendre à Bandung puis à l’ONU',
          wrong: [
            w('ils perdent tout soutien international', 'L’ONU adopte au contraire une déclaration en leur faveur.'),
            w('ils rejoignent tous le bloc soviétique', 'Le texte ne le dit pas.'),
          ],
          ...PREUVES.resolution1514,
          explain: 'La conférence de Bandung puis la résolution de 1960 portent la cause de l’indépendance.',
        },
        {
          q: 'En mobilisant tes connaissances : quel principe de la ligne 2 justifie la décolonisation ?',
          a: 'le droit des peuples à disposer d’eux-mêmes',
          wrong: [
            w('le droit de veto', 'Le veto concerne cinq membres du Conseil de sécurité.'),
            w('la doctrine Truman', 'La doctrine Truman est une politique de la guerre froide.'),
          ],
          ...PREUVES.charte,
          explain: 'La Charte de 1945 reconnaît ce droit.',
        },
        {
          q: 'D’après la ligne 1, que signifie « domination coloniale » ?',
          a: 'des territoires qui dépendent d’une puissance étrangère',
          wrong: [
            w('des pays qui se gouvernent seuls', 'C’est la définition de l’indépendance.'),
            w('des États membres de l’Union européenne', 'Le texte parle de colonies, pas de l’Union européenne.'),
          ],
          ...PREUVES.tiersPopulation,
          explain: 'Un territoire colonisé n’est pas autonome : il dépend d’une puissance coloniale.',
        },
      ],
    },
    {
      title: 'L’Algérie vers l’indépendance',
      lines: [
        'L’Algérie, colonie française depuis 1830, réclame l’indépendance après 1945.',
        'En 1954, le FLN lance des attentats : commence une guerre qui dure jusqu’en 1962.',
        'Attentats et répression se succèdent, notamment lors de la bataille d’Alger en 1957.',
        'Après les accords d’Évian, l’indépendance est proclamée le 5 juillet 1962.',
        'Une majeure partie de la communauté française d’Algérie et des harkis part alors dans la douleur.',
      ],
      qs: [
        {
          q: 'D’après la ligne 3, comment peut-on décrire cette guerre ?',
          a: 'un conflit violent marqué par des attentats et une répression',
          wrong: [
            w('un échange pacifique entre deux États', 'Le texte parle d’attentats et de répression.'),
            w('un conflit sans conséquences pour les civils', 'La ligne 5 montre des départs douloureux.'),
          ],
          ...PREUVES.violences,
          explain: 'La guerre d’Algérie est marquée par la violence des deux côtés.',
        },
        {
          q: 'En mobilisant tes connaissances : qui sont les harkis évoqués à la ligne 5 ?',
          a: 'des hommes engagés dans l’armée française pendant la guerre d’Algérie',
          wrong: [
            w('des combattants du FLN', 'Le FLN combat l’armée française.'),
            w('des soldats de l’ONU', 'Le texte ne parle pas de l’ONU.'),
          ],
          ...PREUVES.departs,
          explain: 'Les harkis sont engagés dans l’armée française.',
        },
        {
          q: 'D’après le texte, combien d’années environ séparent le début de la guerre de l’indépendance ?',
          a: 'environ huit ans',
          wrong: [
            w('environ deux ans', 'De 1954 à 1962, il s’écoule davantage.'),
            w('plus d’un siècle', 'La colonisation dure depuis 1830, mais la guerre commence en 1954.'),
          ],
          ...PREUVES.guerreAlgerie,
          explain: 'De 1954 à 1962, la guerre dure environ huit ans.',
        },
      ],
    },
  ],
};

// ——— Notion 2 ———

const guerreFroide: Notion = {
  id: 'h3-guerre-froide',
  title: 'Un monde bipolaire au temps de la guerre froide',
  hint: 'Pense aux deux blocs : États-Unis d’un côté, URSS de l’autre, et leurs crises.',
  memo: [
    'La **guerre froide** (à partir de 1947, jusqu’en 1991) oppose deux **superpuissances**, les États-Unis et l’URSS, sans combat direct entre elles : le monde est **bipolaire**.',
    'Un **rideau de fer** divise l’Europe ; le mur de Berlin (1961) en devient le symbole. La crise de Cuba (1962) est l’apogée du conflit, puis vient la **détente**.',
    'La menace nucléaire pèse sur les deux camps : c’est la **dissuasion**. Astuce brevet : pour une crise, donne la date, les deux camps et l’enjeu.',
  ],
  faits: [
    {
      q: 'Quelles sont les deux superpuissances de la guerre froide ?',
      a: 'les États-Unis et l’URSS',
      wrong: [
        w('la France et le Royaume-Uni', 'Ils appartiennent au camp occidental, sans être les deux superpuissances.'),
        w('l’Allemagne et le Japon', 'Ces deux pays sont vaincus en 1945.'),
        w('la Chine et l’Inde', 'La guerre froide oppose d’abord Américains et Soviétiques.'),
      ],
      gap: [
        'Les deux superpuissances sont les États-Unis et l’',
        '.',
        ['URSS', 'U.R.S.S.', 'Union soviétique', 'Union sovietique'],
      ],
      ...PREUVES.superpuissances,
      explain: 'Après 1945, deux superpuissances dominent : les États-Unis et l’URSS.',
    },
    {
      q: 'Pourquoi dit-on que cette guerre est « froide » ?',
      a: 'les deux superpuissances ne s’affrontent pas directement',
      wrong: [
        w('elle se déroule seulement dans les régions polaires', 'Le mot « froide » ne désigne pas le climat.'),
        w('elle ne provoque aucune crise', 'Elle engendre au contraire de nombreuses crises.'),
        w('les deux camps sont alliés', 'Les deux camps sont au contraire rivaux.'),
      ],
      gap: [
        'Dans la guerre froide, il n’y a pas de conflit ',
        ' entre les deux superpuissances.',
        ['direct', 'militaire direct'],
      ],
      ...PREUVES.indirect,
      explain: 'Les affrontements sont localisés, sans guerre directe entre les deux Grands.',
    },
    {
      q: 'Qu’est-ce que le « rideau de fer » ?',
      a: 'la frontière symbolique qui divise l’Europe en deux camps',
      wrong: [
        w('une arme secrète des États-Unis', 'C’est une image pour parler d’une frontière.'),
        w('le mur qui entoure Paris', 'Le rideau de fer divise l’Europe entière.'),
        w('un traité de paix entre les deux Grands', 'Il symbolise au contraire la séparation.'),
      ],
      gap: ['La frontière symbolique qui divise l’Europe s’appelle le rideau de ', '.', ['fer']],
      ...PREUVES.rideau,
      explain: 'Churchill popularise l’expression en 1947.',
    },
    {
      q: 'Quelle doctrine, énoncée le 12 mars 1947, oppose le « monde libre » au bloc communiste ?',
      a: 'la doctrine Truman',
      wrong: [
        w('la doctrine Jdanov', 'La doctrine Jdanov est la réponse soviétique.'),
        w('la doctrine de la souveraineté limitée', 'Cette théorie n’est pas celle de 1947.'),
        w('la déclaration Schuman', 'La déclaration Schuman de 1950 concerne l’Europe.'),
      ],
      gap: ['Le 12 mars 1947, les États-Unis énoncent la doctrine ', '.', ['Truman']],
      ...PREUVES.truman,
      explain: 'La doctrine Truman définit deux mondes incompatibles.',
    },
    {
      q: 'Quelle politique américaine consiste à aider les pays menacés par l’expansion soviétique ?',
      a: 'l’endiguement (containment)',
      wrong: [
        w('le non-alignement', 'Le non-alignement refuse de choisir un camp.'),
        w('la détente', 'La détente est une période d’apaisement.'),
        w('l’élargissement', 'L’élargissement concerne l’Union européenne.'),
      ],
      gap: ['La politique américaine contre l’expansion soviétique s’appelle l’', '.', ['endiguement', 'containment']],
      ...PREUVES.endiguement,
      explain: 'L’endiguement est une politique d’aide aux pays menacés.',
    },
    {
      q: 'Quel plan d’aide américain à l’Europe illustre cette politique à partir de 1948 ?',
      a: 'le plan Marshall',
      wrong: [
        w('le plan Schuman', 'Le plan Schuman crée la coopération européenne du charbon et de l’acier.'),
        w('le plan Jdanov', 'Jdanov porte la doctrine soviétique.'),
        w('l’accord de Paris', 'L’accord de Paris concerne le climat.'),
      ],
      gap: ['De 1948 à 1952, les États-Unis aident l’Europe avec le plan ', '.', ['Marshall']],
      ...PREUVES.endiguement,
      explain: 'Le plan Marshall finance l’Europe pour freiner l’influence soviétique.',
    },
    {
      q: 'Quelle alliance militaire, créée le 4 avril 1949, réunit les États-Unis, le Canada et des pays d’Europe occidentale ?',
      a: 'l’OTAN',
      wrong: [
        w('la CECA', 'La CECA est une communauté économique européenne.'),
        w('l’ONU', 'L’ONU réunit des États du monde entier.'),
        w('le Comecon', 'Le Comecon est la coopération économique du bloc soviétique.'),
      ],
      gap: ['Le 4 avril 1949 est créée l’Organisation du traité de l’Atlantique ', ' (OTAN).', ['Nord', 'nord']],
      ...PREUVES.otan,
      explain: 'L’OTAN est l’alliance militaire du camp occidental.',
    },
    {
      q: 'Quel événement d’août 1961 symbolise la séparation de l’Europe de l’Est et de l’Ouest ?',
      a: 'la construction du mur de Berlin',
      wrong: [
        w('la chute du mur de Berlin', 'La chute du mur date de 1989.'),
        w('la crise de Cuba', 'La crise de Cuba date de 1962.'),
        w('la guerre de Corée', 'La guerre de Corée commence en 1950.'),
      ],
      gap: ['En août 1961, le gouvernement d’Allemagne de l’Est construit un mur à ', '.', ['Berlin']],
      ...PREUVES.mur,
      explain: 'Le mur de Berlin devient le symbole de la coupure du continent.',
    },
    {
      q: 'Quelle crise de 1962 marque l’apogée de la guerre froide ?',
      a: 'la crise de Cuba',
      wrong: [
        w('la crise de Suez', 'La crise de Suez date de 1956.'),
        w('la guerre de Corée', 'Elle a lieu de 1950 à 1953.'),
        w('l’invasion de l’Afghanistan', 'L’URSS envahit l’Afghanistan en 1979.'),
      ],
      gap: ['En 1962, la crise de ', ' marque l’apogée de la guerre froide.', ['Cuba']],
      ...PREUVES.cuba,
      explain: 'La crise de Cuba est le moment le plus tendu entre les deux Grands.',
    },
    {
      q: 'Comment appelle-t-on la menace qui dissuade chaque camp d’attaquer, grâce aux armes nucléaires ?',
      a: 'la dissuasion nucléaire',
      wrong: [
        w('la détente', 'La détente désigne un apaisement politique.'),
        w('la décolonisation', 'La décolonisation concerne l’indépendance des colonies.'),
        w('le désarmement total', 'Les deux camps gardent leurs armes.'),
      ],
      gap: ['La capacité de chaque camp à détruire l’autre fonde la ', ' nucléaire.', ['dissuasion']],
      ...PREUVES.dissuasion,
      explain: 'Chacun évite d’aggraver les crises par peur de la destruction mutuelle.',
    },
    {
      q: 'Comment appelle-t-on la période d’apaisement entre les deux blocs, à partir des années 1970 ?',
      a: 'la Détente',
      wrong: [
        w('la guerre totale', 'La guerre totale désigne un conflit mobilisant tout un pays.'),
        w('l’endiguement', 'L’endiguement est la politique américaine de 1947.'),
        w('l’Union sacrée', 'L’Union sacrée date de 1914.'),
      ],
      gap: ['Dans les années 1970, la période d’apaisement s’appelle la ', '.', ['Détente', 'la Détente', 'detente']],
      ...PREUVES.detente,
      explain: 'La Détente permet des accords de limitation des armements.',
    },
    {
      q: 'Quels deux événements marquent la fin de la guerre froide ?',
      a: 'la chute du mur de Berlin (1989) puis la disparition de l’URSS (1991)',
      wrong: [
        w('la crise de Cuba puis la guerre de Corée', 'Ce sont des crises de la guerre froide, pas sa fin.'),
        w(
          'la création de l’OTAN puis la construction du mur',
          'Ces événements renforcent l’opposition entre les blocs.',
        ),
        w('la conférence de Bandung puis le référendum de 1962', 'Ce sont des moments de la décolonisation.'),
      ],
      gap: ['La guerre froide s’achève avec la disparition de l’URSS en ', '.', annee('1991')],
      ...PREUVES.finGuerreFroide,
      explain: 'La guerre froide finit avec la disparition de l’URSS en 1991.',
    },
    {
      q: 'Selon le programme, quels types de guerre les États-Unis et l’URSS se livrent-ils aussi ?',
      a: 'une guerre idéologique et culturelle, d’opinion et d’information',
      wrong: [
        w('une guerre limitée au commerce des céréales', 'Le programme parle aussi d’idéologie et de culture.'),
        w('une guerre sans aucune propagande', 'La guerre d’opinion en fait partie.'),
        w('une guerre uniquement coloniale', 'Les rivalités portent sur des modèles opposés.'),
      ],
      gap: ['Les États-Unis et l’URSS se livrent une guerre ', ' et culturelle.', ['idéologique', 'ideologique']],
      ...PREUVES.programmeOpinion,
      explain: 'Chaque camp cherche à convaincre l’opinion et à affirmer sa puissance.',
    },
    {
      q: 'Pourquoi le Conseil de sécurité de l’ONU est-il souvent bloqué pendant la guerre froide ?',
      a: 'les deux Grands y utilisent leur droit de veto',
      wrong: [
        w('il n’existe pas encore', 'L’ONU est créée en 1945.'),
        w('les pays du Tiers-Monde en sont les seuls membres', 'Les grandes puissances y siègent.'),
        w('il ne vote jamais', 'Le blocage vient du veto sur des questions stratégiques.'),
      ],
      gap: ['Le Conseil de sécurité de l’ONU est bloqué par le droit de ', '.', ['veto', 'véto']],
      ...PREUVES.vetoBlocage,
      explain: 'Le veto permet à un Grand d’empêcher une décision.',
    },
  ],
  paires3: [
    ['Rideau de fer', 'Frontière symbolique entre les deux camps'],
    ['Mur de Berlin', 'Symbole de la séparation construit en 1961'],
    ['Dissuasion', 'Peur de la destruction par les armes nucléaires'],
  ],
  paires5: [
    ['12 mars 1947', 'Doctrine Truman'],
    ['22 septembre 1947', 'Doctrine Jdanov'],
    ['4 avril 1949', 'Création de l’OTAN'],
    ['1962', 'Crise de Cuba'],
    ['9 novembre 1989', 'Chute du mur de Berlin'],
  ],
  frise: [
    { label: 'La doctrine Truman', date: '1947', ...PREUVES.truman },
    { label: 'La création de l’OTAN', date: '1949', ...PREUVES.otan },
    { label: 'La construction du mur de Berlin', date: '1961', ...PREUVES.murDate },
    { label: 'La crise de Cuba', date: '1962', ...PREUVES.cuba },
    { label: 'La chute du mur de Berlin', date: '1989', ...PREUVES.chuteMur },
  ],
  libres: [
    {
      q: 'Comment appelle-t-on un monde organisé autour de deux pôles de puissance ?',
      accepted: [...mot('bipolaire', 'un monde ', 'monde '), 'bipolarité', 'la bipolarité'],
      traps: [
        t('unipolaire', 'Un monde unipolaire n’a qu’un seul pôle dominant.'),
        t('multipolaire', 'Un monde multipolaire a plusieurs pôles.'),
      ],
      ...PREUVES.bipolarite,
      explain: 'Deux superpuissances organisent le monde : il est bipolaire.',
    },
    {
      q: 'Quelle expression désigne la frontière symbolique qui coupe l’Europe en deux ?',
      accepted: [...mot('rideau de fer', 'le ', 'un ')],
      traps: [
        t('mur de Berlin', 'Le mur de Berlin (1961) est un symbole précis, dans une seule ville.'),
        t('ligne Maginot', 'La ligne Maginot est une ligne de fortifications d’avant 1940.'),
      ],
      ...PREUVES.rideau,
      explain: 'C’est le « rideau de fer ».',
    },
    {
      q: 'Dans quelle ville le gouvernement d’Allemagne de l’Est construit-il un mur en 1961 ?',
      accepted: ['Berlin', 'à Berlin'],
      traps: [t('Bonn', 'Le mur de 1961 est construit à Berlin.'), t('Moscou', 'Moscou est la capitale de l’URSS.')],
      ...PREUVES.mur,
      explain: 'Le mur de Berlin devient le symbole de la guerre froide.',
    },
    {
      q: 'Quel pays donne son nom à la crise de 1962, apogée de la guerre froide ?',
      accepted: ['Cuba', 'la crise de Cuba', 'à Cuba'],
      traps: [
        t('Corée', 'La guerre de Corée date de 1950-1953.'),
        t('Afghanistan', 'L’invasion de l’Afghanistan date de 1979.'),
      ],
      ...PREUVES.cuba,
      explain: 'La crise de Cuba (1962) marque l’apogée du conflit.',
    },
    {
      q: 'En quelle année le mur de Berlin tombe-t-il ?',
      accepted: annee('1989'),
      traps: [
        t('1961', '1961 est la date de sa construction.'),
        t('1991', '1991 est la date de la disparition de l’URSS.'),
      ],
      ...PREUVES.chuteMur,
      explain: 'Le mur tombe le 9 novembre 1989.',
    },
    {
      q: 'Quel est le sigle de l’alliance militaire occidentale créée en 1949 ?',
      accepted: [...mot('OTAN', 'l’'), 'O.T.A.N.'],
      traps: [
        t('ONU', 'L’ONU est une organisation mondiale.'),
        t('CECA', 'La CECA est une communauté économique européenne.'),
      ],
      ...PREUVES.otanAlliance,
      explain: 'L’OTAN est créée en avril 1949.',
    },
  ],
  docs: [
    {
      title: 'Un affrontement entre deux camps',
      lines: [
        'Après 1945, les États-Unis et l’URSS veulent étendre leur influence.',
        'En 1947, la doctrine Truman puis la doctrine Jdanov opposent deux visions du monde.',
        'En 1949, l’OTAN réunit les alliés occidentaux des États-Unis.',
        'La peur des armes nucléaires empêche un affrontement direct entre les deux Grands.',
      ],
      qs: [
        {
          q: 'D’après la ligne 4, quel effet a la menace nucléaire ?',
          a: 'elle empêche un affrontement direct',
          wrong: [
            w('elle déclenche une guerre mondiale', 'Le texte dit au contraire qu’elle l’empêche.'),
            w('elle met fin à toute rivalité', 'Les rivalités continuent.'),
          ],
          ...PREUVES.dissuasion,
          explain: 'La dissuasion limite les crises entre les deux Grands.',
        },
        {
          q: 'En mobilisant tes connaissances : comment appelle-t-on le monde décrit dans les lignes 1 et 2 ?',
          a: 'un monde bipolaire',
          wrong: [
            w('un monde unipolaire', 'Deux puissances s’opposent, pas une seule.'),
            w('un monde sans alliances', 'Les alliances sont au cœur du conflit.'),
          ],
          ...PREUVES.bipolarite,
          explain: 'Deux pôles, deux camps : le monde est bipolaire.',
        },
        {
          q: 'D’après la ligne 2, que montrent les deux doctrines de 1947 ?',
          a: 'deux camps qui s’opposent par leurs idées',
          wrong: [
            w('un accord de paix entre les deux Grands', 'Elles marquent au contraire la rupture.'),
            w('la fin de la guerre froide', 'La guerre froide commence à cette période.'),
          ],
          ...PREUVES.programmeGuerreFroide,
          explain: 'La confrontation Est-Ouest oppose des modèles antagonistes.',
        },
      ],
    },
    {
      title: 'Berlin et les crises',
      lines: [
        'En août 1961, un mur est construit à Berlin.',
        'En 1962, la crise de Cuba porte la tension à son maximum.',
        'Dans les années 1970, une période d’apaisement commence.',
        'En 1989, le mur de Berlin tombe ; l’URSS disparaît en 1991.',
      ],
      qs: [
        {
          q: 'D’après le texte, quel événement porte la tension à son maximum ?',
          a: 'la crise de Cuba',
          wrong: [
            w('la chute du mur de Berlin', 'La chute du mur marque la fin de la guerre froide.'),
            w('le début de la période d’apaisement', 'Elle fait au contraire baisser la tension.'),
          ],
          ...PREUVES.cuba,
          explain: 'La ligne 2 désigne la crise de Cuba.',
        },
        {
          q: 'En mobilisant tes connaissances : quel nom donne-t-on à la période de la ligne 3 ?',
          a: 'la Détente',
          wrong: [
            w('la Libération', 'La Libération concerne la France en 1944.'),
            w('la dissuasion', 'La dissuasion est une stratégie, pas la période d’apaisement.'),
          ],
          ...PREUVES.detente,
          explain: 'La période d’apaisement des années 1970 est la Détente.',
        },
        {
          q: 'D’après le texte, quelle ville est coupée par un mur en 1961 ?',
          a: 'Berlin',
          wrong: [
            w('Moscou', 'Le texte parle de Berlin.'),
            w('La Havane', 'La Havane est la capitale de Cuba ; le mur est à Berlin.'),
          ],
          ...PREUVES.mur,
          explain: 'Le mur coupe Berlin et symbolise la guerre froide.',
        },
      ],
    },
  ],
};

// ——— Notion 3 ———

const projetEuropeen: Notion = {
  id: 'h3-projet-europeen',
  title: 'Affirmation et mise en œuvre du projet européen',
  hint: 'Repère l’étape : charbon et acier, marché commun, Parlement élu, Union européenne, euro.',
  memo: [
    'Après 1945, des Européens veulent la paix. Le 9 mai 1950, Schuman propose de mettre en commun charbon et acier : la **CECA** (1951) réunit six pays.',
    'En 1957, les traités de Rome créent la **CEE** et l’**Euratom**. En 1992, le traité de Maastricht fonde l’**Union européenne** ; l’**euro** arrive ensuite.',
    'L’**élargissement** fait passer l’Europe de 6 à 28 pays, puis 27 après le départ du Royaume-Uni. Astuce brevet : cite une réalisation concrète et sa date.',
  ],
  faits: [
    {
      q: 'Quel ministre français propose, le 9 mai 1950, une coopération sur le charbon et l’acier ?',
      a: 'Robert Schuman',
      wrong: [
        w('Alfred Sauvy', 'Sauvy forge l’expression « Tiers-Monde ».'),
        w('Winston Churchill', 'Churchill est un Premier ministre britannique.'),
        w('Harry Truman', 'Truman est un président des États-Unis.'),
      ],
      gap: ['Le 9 mai 1950, le ministre Robert ', ' présente un plan de coopération européenne.', ['Schuman']],
      ...PREUVES.schuman9mai,
      explain: 'La déclaration Schuman du 9 mai 1950 lance la construction européenne.',
    },
    {
      q: 'Qui conçoit le projet de la CECA, proposé à Robert Schuman ?',
      a: 'Jean Monnet',
      wrong: [
        w('Paul-Henri Spaak', 'Spaak prépare surtout le traité de Rome.'),
        w('Andreï Jdanov', 'Jdanov est un dirigeant soviétique.'),
        w('Lech Walesa', 'Walesa dirige un syndicat polonais dans les années 1980.'),
      ],
      gap: ['Le projet de la CECA est conçu par Jean ', '.', ['Monnet']],
      ...PREUVES.monnet,
      explain: 'Jean Monnet est considéré comme un inspirateur de la construction européenne.',
    },
    {
      q: 'Pourquoi les fondateurs veulent-ils mettre en commun le charbon et l’acier ?',
      a: 'pour rendre impossible une guerre entre la France et l’Allemagne',
      wrong: [
        w('pour préparer ensemble une guerre contre les voisins', 'Le but est au contraire la paix.'),
        w('pour supprimer toute industrie en Europe', 'Il s’agit de produire ensemble.'),
        w('pour quitter l’ONU', 'La CECA est une communauté européenne.'),
      ],
      gap: [
        'Les fondateurs veulent rendre la guerre « matériellement ',
        ' » entre la France et l’Allemagne.',
        ['impossible'],
      ],
      ...PREUVES.guerreImpossible,
      explain: 'Le charbon et l’acier servent à fabriquer des armes : les gérer ensemble protège la paix.',
    },
    {
      q: 'Selon la déclaration Schuman, comment l’Europe se construira-t-elle ?',
      a: 'par des réalisations concrètes',
      wrong: [
        w('d’un coup, par une construction d’ensemble', 'La déclaration dit exactement le contraire.'),
        w('par une guerre de conquête', 'Le projet vise la paix.'),
        w('par la seule victoire d’un pays', 'Il s’agit d’une coopération.'),
      ],
      gap: [
        'L’Europe se fera par des réalisations ',
        ' créant d’abord une solidarité de fait.',
        ['concrètes', 'concretes'],
      ],
      ...PREUVES.realisations,
      explain: 'La construction avance étape par étape, par des réalisations concrètes.',
    },
    {
      q: 'Combien de pays signent en 1951 le traité de la CECA ?',
      a: 'six',
      wrong: [
        w('douze', 'Douze est le nombre d’États en 1986.'),
        w('neuf', 'Neuf est le nombre d’États en 1973.'),
        w('vingt-sept', 'Vingt-sept est un nombre bien plus récent.'),
      ],
      gap: ['La CECA réunit ', ' pays fondateurs.', ['six', '6']],
      ...PREUVES.fondateurs,
      explain: 'France, Allemagne, Italie, Pays-Bas, Belgique et Luxembourg : six pays.',
    },
    {
      q: 'Quel traité, signé en 1957, établit la Communauté économique européenne (CEE) ?',
      a: 'le traité de Rome',
      wrong: [
        w('le traité de Maastricht', 'Maastricht (1992) crée l’Union européenne.'),
        w('le traité de Lisbonne', 'Lisbonne date de 2007.'),
        w('le traité de Versailles', 'Versailles date de 1919.'),
      ],
      gap: ['En 1957, la CEE est établie par le traité de ', '.', ['Rome']],
      ...PREUVES.rome,
      explain: 'Les traités de Rome de 1957 créent la CEE et l’Euratom.',
    },
    {
      q: 'Quelle politique européenne, mise en place en 1962, organise en commun la production alimentaire ?',
      a: 'la politique agricole commune',
      wrong: [
        w('la politique spatiale commune', 'La politique de 1962 concerne l’agriculture.'),
        w('l’union monétaire', 'La monnaie commune arrive bien plus tard.'),
        w('le programme Erasmus', 'Erasmus (1987) aide les étudiants.'),
      ],
      gap: ['En 1962 est lancée la politique ', ' commune.', ['agricole']],
      ...PREUVES.pac,
      explain: 'La politique agricole commune est une réalisation concrète.',
    },
    {
      q: 'Quelle élection européenne a lieu pour la première fois au suffrage direct en 1979 ?',
      a: 'celle des députés du Parlement européen',
      wrong: [
        w('celle du président de l’ONU', 'L’ONU n’est pas une institution européenne.'),
        w('celle du maire de Strasbourg', 'Il s’agit d’une élection européenne.'),
        w('celle des députés de l’Assemblée nationale française', 'L’Assemblée nationale est élue en France.'),
      ],
      gap: ['En 1979, les citoyens élisent pour la première fois au suffrage direct le ', ' européen.', ['Parlement']],
      ...PREUVES.suffrage,
      explain: 'L’élection au suffrage direct renforce la dimension démocratique.',
    },
    {
      q: 'Quel programme, lancé en 1987, aide des étudiants à étudier dans un autre pays européen ?',
      a: 'Erasmus',
      wrong: [
        w('Euratom', 'Euratom concerne l’énergie atomique.'),
        w('Comecon', 'Le Comecon est la coopération du bloc soviétique.'),
        w('le plan Marshall', 'Le plan Marshall est une aide américaine d’après-guerre.'),
      ],
      gap: ['Le programme ', ' aide les étudiants à étudier dans un autre pays européen.', ['Erasmus']],
      ...PREUVES.erasmus,
      explain: 'Erasmus est une réalisation concrète pour la jeunesse.',
    },
    {
      q: 'Quel traité, signé en 1992, crée officiellement l’« Union européenne » ?',
      a: 'le traité de Maastricht',
      wrong: [
        w('le traité de Rome', 'Le traité de Rome (1957) crée la CEE.'),
        w('le traité de Paris de 1951', 'Il crée la CECA.'),
        w('l’accord de Paris', 'Il porte sur le climat.'),
      ],
      gap: ['L’Union européenne est créée par le traité de ', '.', ['Maastricht']],
      ...PREUVES.union,
      explain: 'Le traité de Maastricht entre en vigueur en 1993.',
    },
    {
      q: 'Quel accord permet de voyager entre plusieurs pays sans contrôle des passeports aux frontières ?',
      a: 'l’accord de Schengen',
      wrong: [
        w('l’accord de Paris', 'Il porte sur le climat.'),
        w('les accords d’Évian', 'Ils concernent l’Algérie.'),
        w('le traité de Versailles', 'Il met fin à la Première Guerre mondiale.'),
      ],
      gap: ['L’accord de ', ' permet de circuler sans contrôle des passeports.', ['Schengen']],
      ...PREUVES.schengen,
      explain: 'Schengen facilite la circulation des personnes.',
    },
    {
      q: 'Quelle monnaie commune naît le 1er janvier 1999 ?',
      a: 'l’euro',
      wrong: [
        w('le franc', 'Le franc est une ancienne monnaie nationale française.'),
        w('le dollar', 'Le dollar est la monnaie des États-Unis.'),
        w('le mark', 'Le mark est une ancienne monnaie allemande.'),
      ],
      gap: ['Le 1er janvier 1999 naît la monnaie commune : l’', '.', ['euro']],
      ...PREUVES.euro,
      explain: 'Les billets et les pièces en euros arrivent en 2002.',
    },
    {
      q: 'Dans quel contexte international débute la construction européenne ?',
      a: 'le début de la guerre froide, qui divise le continent',
      wrong: [
        w('la fin de la décolonisation', 'La construction commence pendant la décolonisation, pas après.'),
        w('la chute du mur de Berlin', 'La chute du mur date de 1989.'),
        w('la Grande Dépression des années 1930', 'La crise de 1929 précède la Seconde Guerre mondiale.'),
      ],
      gap: ['La construction européenne débute au temps de la guerre ', '.', ['froide']],
      ...PREUVES.contexte,
      explain: 'La CECA et la CEE naissent pendant la guerre froide.',
    },
    {
      q: 'Quel pays quitte l’Union européenne le 31 janvier 2020 ?',
      a: 'le Royaume-Uni',
      wrong: [
        w('la France', 'La France est un pays fondateur toujours membre.'),
        w('la Croatie', 'La Croatie rejoint l’Union en 2013.'),
        w('la Grèce', 'La Grèce est membre depuis 1981.'),
      ],
      gap: ['Le 31 janvier 2020, le ', ' quitte l’Union européenne.', ['Royaume-Uni', 'Royaume Uni']],
      ...PREUVES.brexit,
      explain: 'Le Royaume-Uni quitte l’Union le 31 janvier 2020.',
    },
    {
      q: 'Combien d’États membres compte l’Union européenne après le départ du Royaume-Uni ?',
      a: '27',
      wrong: [
        w('6', 'Six est le nombre de pays fondateurs.'),
        w('12', 'Douze est le nombre d’États en 1986.'),
        w('28', '28 est le nombre d’États avant le départ du Royaume-Uni.'),
      ],
      gap: ['Depuis le départ du Royaume-Uni, l’Union européenne compte ', ' États membres.', ['27', 'vingt-sept']],
      ...PREUVES.vingtSept,
      explain: 'Les élargissements ont fait passer l’Europe de 6 à 28 pays, puis 27 après le départ britannique.',
    },
  ],
  paires3: [
    ['CECA', 'Mise en commun du charbon et de l’acier'],
    ['Traités de Rome', 'Création de la CEE et d’Euratom'],
    ['Maastricht', 'Création de l’Union européenne'],
  ],
  paires5: [
    ['9 mai 1950', 'Déclaration Schuman'],
    ['1979', 'Premières élections européennes au suffrage direct'],
    ['1987', 'Lancement d’Erasmus'],
    ['1992', 'Signature du traité de Maastricht'],
    ['2020', 'Départ du Royaume-Uni de l’Union'],
  ],
  frise: [
    { label: 'La création de la CECA par traité', date: '1951', ...PREUVES.ceca },
    { label: 'La création de la CEE par le traité de Rome', date: '1957', ...PREUVES.rome },
    { label: 'La première élection du Parlement européen au suffrage direct', date: '1979', ...PREUVES.suffrageDate },
    { label: 'La signature du traité de Maastricht', date: '1992', ...PREUVES.maastricht },
    { label: 'L’arrivée des billets et des pièces en euros', date: '2002', ...PREUVES.billets },
  ],
  libres: [
    {
      q: 'Quel est le sigle de la première communauté européenne, créée en 1951 ?',
      accepted: [...mot('CECA', 'la '), 'C.E.C.A.'],
      traps: [t('CEE', 'La CEE est créée en 1957.'), t('OTAN', 'L’OTAN est une alliance militaire.')],
      ...PREUVES.ceca,
      explain: 'La CECA est la Communauté européenne du charbon et de l’acier.',
    },
    {
      q: 'Dans quelle ville sont signés les traités qui créent la CEE en 1957 ?',
      accepted: ['Rome', 'à Rome'],
      traps: [
        t('Maastricht', 'Maastricht (1992) crée l’Union européenne.'),
        t('Lisbonne', 'Le traité de Lisbonne date de 2007.'),
      ],
      ...PREUVES.rome,
      explain: 'Les traités de Rome créent la CEE et l’Euratom.',
    },
    {
      q: 'Quel ministre prononce la déclaration du 9 mai 1950 ?',
      accepted: ['Schuman', 'Robert Schuman', 'R. Schuman'],
      traps: [
        t('Monnet', 'Jean Monnet conçoit le projet, mais ne prononce pas la déclaration.'),
        t('Adenauer', 'Adenauer est le chancelier allemand.'),
      ],
      ...PREUVES.schuman9mai,
      explain: 'Robert Schuman présente son plan le 9 mai 1950.',
    },
    {
      q: 'Dans quelle ville est signé en 1992 le traité qui crée l’Union européenne ?',
      accepted: ['Maastricht', 'à Maastricht'],
      traps: [
        t('Rome', 'Rome accueille les traités de 1957.'),
        t('Schengen', 'Schengen concerne la circulation aux frontières.'),
      ],
      ...PREUVES.maastricht,
      explain: 'Le traité de Maastricht est signé le 7 février 1992.',
    },
    {
      q: 'Quel nom porte la monnaie commune née en 1999 ?',
      accepted: [...mot('euro', 'l’', 'un ')],
      traps: [
        t('franc', 'Le franc est une ancienne monnaie.'),
        t('écu', 'La monnaie née en 1999 s’appelle autrement.'),
      ],
      ...PREUVES.euro,
      explain: 'L’euro naît le 1er janvier 1999.',
    },
    {
      q: 'Combien de pays fondateurs signent le traité de la CECA ?',
      accepted: ['6', 'six'],
      traps: [t('12', 'Douze est le nombre d’États en 1986.'), t('27', 'Vingt-sept est un nombre bien plus récent.')],
      ...PREUVES.fondateurs,
      explain: 'Six pays fondent la CECA.',
    },
  ],
  docs: [
    {
      title: 'De la CECA à la CEE',
      lines: [
        'En mai 1950, Robert Schuman propose de mettre en commun le charbon et l’acier.',
        'Il veut créer une solidarité concrète entre la France et l’Allemagne pour éviter la guerre.',
        'Six pays signent en 1951 le traité de la CECA.',
        'En 1957, les mêmes six pays élargissent leur coopération avec la CEE et l’Euratom.',
      ],
      qs: [
        {
          q: 'D’après la ligne 2, quel est le but principal du projet de 1950 ?',
          a: 'garantir la paix entre la France et l’Allemagne',
          wrong: [
            w('préparer une guerre commune', 'Le texte parle d’éviter la guerre.'),
            w('fonder une alliance militaire avec les États-Unis', 'C’est l’OTAN, pas la CECA.'),
          ],
          ...PREUVES.guerreImpossible,
          explain: 'La mise en commun rend la guerre impossible.',
        },
        {
          q: 'En mobilisant tes connaissances : quel traité de la ligne 4 crée la CEE ?',
          a: 'le traité de Rome',
          wrong: [
            w('le traité de Maastricht', 'Maastricht est signé en 1992.'),
            w('le traité de Lisbonne', 'Lisbonne est signé en 2007.'),
          ],
          ...PREUVES.rome,
          explain: 'La CEE est créée en 1957 par le traité de Rome.',
        },
        {
          q: 'D’après le texte, comment la coopération évolue-t-elle entre 1951 et 1957 ?',
          a: 'elle s’étend à d’autres domaines',
          wrong: [
            w('elle s’arrête', 'La ligne 4 montre qu’elle s’élargit.'),
            w('elle perd tous ses membres', 'Les mêmes six pays poursuivent.'),
          ],
          ...PREUVES.euratom,
          explain: 'La CEE et l’Euratom étendent la coopération.',
        },
      ],
    },
    {
      title: 'Une Europe qui s’approfondit et s’élargit',
      lines: [
        'En 1973, le Danemark, l’Irlande et le Royaume-Uni rejoignent la Communauté : elle compte neuf pays.',
        'En 1979, les citoyens élisent directement leurs députés européens.',
        'En 1992, le traité de Maastricht fonde l’Union européenne.',
        'En 2004, dix pays adhèrent, dont plusieurs d’Europe centrale et orientale.',
      ],
      qs: [
        {
          q: 'D’après la ligne 4, quelle division de l’après-guerre l’élargissement de 2004 aide-t-il à dépasser ?',
          a: 'la division de l’Europe entre l’Est et l’Ouest',
          wrong: [
            w('la séparation entre la France et ses colonies', 'Le texte parle de l’Europe centrale et orientale.'),
            w('la division entre le Nord et le Sud de l’Afrique', 'Le texte parle d’Europe.'),
          ],
          ...PREUVES.elargissement2004,
          explain: 'L’adhésion de pays d’Europe centrale et orientale met fin à la division du continent.',
        },
        {
          q: 'En mobilisant tes connaissances : quel événement de 1989 facilite cet élargissement à l’Est ?',
          a: 'la chute du mur de Berlin',
          wrong: [
            w('la crise de Cuba', 'La crise de Cuba date de 1962.'),
            w('la conférence de Bandung', 'Bandung date de 1955.'),
          ],
          ...PREUVES.chuteMur,
          explain: 'La chute du mur ouvre la frontière entre l’Est et l’Ouest.',
        },
        {
          q: 'D’après la ligne 1, combien de pays compte la Communauté en 1973 ?',
          a: 'neuf',
          wrong: [
            w('six', 'Six est le nombre de pays fondateurs.'),
            w('douze', 'Douze est le nombre d’États en 1986.'),
          ],
          ...PREUVES.neuf,
          explain: 'Avec les trois nouveaux membres, la Communauté passe de six à neuf pays.',
        },
      ],
    },
  ],
};

// ——— Notion 4 ———

const apres1989: Notion = {
  id: 'h3-apres-1989',
  title: 'Enjeux et conflits dans le monde après 1989',
  hint: 'Situe la question : un conflit, une organisation internationale ou une conférence pour le climat.',
  memo: [
    'Après la chute de l’URSS (1991), le monde n’est plus **bipolaire**. De nouveaux conflits éclatent, comme en Yougoslavie, et le **terrorisme** frappe (11 septembre 2001).',
    'L’**ONU** veut maintenir la paix, avec les **Casques bleus**, mais un membre permanent du Conseil de sécurité peut bloquer une décision par son **droit de veto**.',
    'Des conférences mondiales traitent des défis communs : Rio (1992) pour le **développement durable**, Paris (2015) pour le climat. Astuce brevet : nomme un acteur et une difficulté.',
  ],
  faits: [
    {
      q: 'Quel État disparaît en 1991 et donne naissance à de nouvelles républiques indépendantes ?',
      a: 'l’URSS',
      wrong: [
        w('les États-Unis', 'Les États-Unis restent une grande puissance.'),
        w('la France', 'La France ne disparaît pas.'),
        w('le Royaume-Uni', 'Le Royaume-Uni existe toujours.'),
      ],
      gap: [
        'En 1991, la disparition de l’',
        ' fait naître de nouvelles républiques.',
        ['URSS', 'U.R.S.S.', 'Union soviétique', 'Union sovietique'],
      ],
      ...PREUVES.urss1991,
      explain: 'La disparition de l’URSS met fin au monde bipolaire.',
    },
    {
      q: 'Dans quel pays des Balkans les guerres des années 1990 font-elles des dizaines de milliers de victimes ?',
      a: 'la Yougoslavie',
      wrong: [
        w('la Suisse', 'La Suisse ne connaît pas ces guerres.'),
        w('le Danemark', 'Le Danemark n’est pas dans les Balkans.'),
        w('le Portugal', 'Le Portugal n’est pas dans les Balkans.'),
      ],
      gap: ['Dans les années 1990, des guerres suivent la dislocation de la ', '.', ['Yougoslavie']],
      ...PREUVES.yougoslavie,
      explain: 'L’éclatement de la Yougoslavie s’accompagne de guerres.',
    },
    {
      q: 'Quel attentat frappe les États-Unis le 11 septembre 2001 ?',
      a: 'des avions détournés percutent le World Trade Center et le Pentagone',
      wrong: [
        w('une bombe atomique détruit une ville', 'Ce n’est pas ce qui s’est passé en 2001.'),
        w('un débarquement militaire sur la côte', 'Il s’agit d’un attentat terroriste.'),
        w('la construction d’un mur à New York', 'Aucun mur n’est construit.'),
      ],
      gap: ['Le 11 septembre ', ', des attentats frappent New York et Washington.', annee('2001')],
      ...PREUVES.attaques,
      explain: 'Le 11 septembre 2001 devient le symbole du terrorisme international.',
    },
    {
      q: 'Comment appelle-t-on des actes de violence organisés pour désorganiser la société et créer l’insécurité ?',
      a: 'le terrorisme',
      wrong: [
        w('la diplomatie', 'La diplomatie cherche des solutions par la négociation.'),
        w('le référendum', 'Un référendum est un vote des citoyens.'),
        w('le développement durable', 'Il concerne l’avenir de la planète et des sociétés.'),
      ],
      gap: [
        'Des actes de violence pour désorganiser la société et créer l’insécurité : c’est le ',
        '.',
        ['terrorisme'],
      ],
      ...PREUVES.terrorismeDef,
      explain: 'Le terrorisme est une violence organisée qui vise la société.',
    },
    {
      q: 'Quelle guerre de 1991 illustre la puissance des États-Unis à la fin de la guerre froide ?',
      a: 'la guerre du Golfe',
      wrong: [
        w('la guerre de Corée', 'Elle date de 1950-1953.'),
        w('la guerre d’Algérie', 'Elle oppose la France et le FLN de 1954 à 1962.'),
        w('la Grande Guerre', 'Elle date de 1914-1918.'),
      ],
      gap: ['En 1991, la guerre du ', ' illustre la puissance américaine.', ['Golfe']],
      ...PREUVES.golfe,
      explain: 'La fin de la guerre froide fait des États-Unis la seule superpuissance.',
    },
    {
      q: 'Quelle expression utilise un spécialiste pour décrire le monde après la guerre froide ?',
      a: 'un système « post-bipolaire »',
      wrong: [
        w('un système « bipolaire »', 'La bipolarité est celle de la guerre froide.'),
        w('un système « colonial »', 'Les empires coloniaux se sont effondrés.'),
        w('un système « féodal »', 'Le féodalisme appartient au Moyen Âge.'),
      ],
      gap: ['Après la guerre froide, on parle d’un système « post-', ' ».', ['bipolaire']],
      ...PREUVES.postBipolaire,
      explain: '« Post » signifie après : le monde n’est plus à deux pôles.',
    },
    {
      q: 'Pour quel objectif principal l’ONU est-elle créée en 1945 ?',
      a: 'maintenir la paix et la sécurité internationales',
      wrong: [
        w('créer une monnaie commune', 'Une monnaie commune est une réalisation européenne.'),
        w('diriger les colonies', 'L’ONU soutient au contraire la décolonisation.'),
        w('organiser les seules conférences sportives', 'Son rôle est politique et mondial.'),
      ],
      gap: [
        'L’ONU est créée pour assurer le maintien de la paix et de la ',
        ' internationales.',
        ['sécurité', 'securite'],
      ],
      ...PREUVES.onuMission,
      explain: 'La paix et la sécurité sont la mission principale de l’ONU.',
    },
    {
      q: 'Que peuvent faire les cinq membres permanents du Conseil de sécurité avec leur droit de veto ?',
      a: 'faire rejeter une décision par leur vote négatif',
      wrong: [
        w('adopter seuls toutes les décisions', 'Il faut réunir une majorité de voix.'),
        w('supprimer l’ONU', 'Le veto porte sur les résolutions.'),
        w('élire le Parlement européen', 'Le Parlement européen est élu par les citoyens.'),
      ],
      gap: ['Un membre permanent peut faire rejeter une décision grâce à son droit de ', '.', ['veto', 'véto']],
      ...PREUVES.vetoRejet,
      explain: 'Le veto est une cause de blocage de la coopération internationale.',
    },
    {
      q: 'Quels pays sont les membres permanents du Conseil de sécurité ?',
      a: 'la Chine, les États-Unis, la Russie, la France et le Royaume-Uni',
      wrong: [
        w('l’Allemagne, le Japon, le Brésil, l’Inde et l’Italie', 'Aucun de ces pays n’est membre permanent.'),
        w('les six pays fondateurs de la CECA', 'La CECA est une communauté européenne.'),
        w('tous les États membres de l’ONU', 'Le Conseil compte 15 membres, dont 5 permanents.'),
      ],
      gap: ['Le Conseil de sécurité compte ', ' membres permanents.', ['cinq', '5']],
      ...PREUVES.membresPermanents,
      explain: 'Les cinq membres permanents disposent du veto.',
    },
    {
      q: 'Comment appelle-t-on les soldats, policiers ou civils déployés pour les opérations de maintien de la paix de l’ONU ?',
      a: 'les Casques bleus',
      wrong: [
        w('les Poilus', 'Les poilus sont les soldats de 1914-1918.'),
        w('les harkis', 'Les harkis servent dans l’armée française en Algérie.'),
        w('les Casques verts', 'Ce n’est pas leur nom.'),
      ],
      gap: ['Les forces de maintien de la paix de l’ONU sont les Casques ', '.', ['bleus']],
      ...PREUVES.casquesBleus,
      explain: 'Les Casques bleus sont déployés depuis 1948.',
    },
    {
      q: 'Après la fin de la guerre froide, comment évolue le nombre de missions de maintien de la paix de l’ONU ?',
      a: 'il augmente rapidement',
      wrong: [
        w('il tombe à zéro', 'L’ONU lance au contraire de nouvelles missions.'),
        w('il reste exactement le même', 'Le contexte change et le nombre de missions augmente.'),
        w('il diminue sans arrêt', 'La tendance est à la hausse après la guerre froide.'),
      ],
      gap: [
        'Avec la fin de la guerre froide, le nombre de missions de maintien de la paix a rapidement ',
        '.',
        ['augmenté', 'augmente'],
      ],
      ...PREUVES.hausseMissions,
      explain: 'La fin de la rivalité des blocs permet davantage d’interventions.',
    },
    {
      q: 'Quelle conférence mondiale de 1992 proclame le développement durable comme objectif ?',
      a: 'le Sommet de la Terre à Rio de Janeiro',
      wrong: [
        w('la conférence de Bandung', 'Bandung (1955) réunit des pays d’Afrique et d’Asie.'),
        w('la conférence de San Francisco', 'San Francisco (1945) crée la Charte de l’ONU.'),
        w('la crise de Cuba', 'Ce n’est pas une conférence.'),
      ],
      gap: ['En 1992, le Sommet de la Terre se tient à ', ' de Janeiro.', ['Rio']],
      ...PREUVES.durable,
      explain: 'Rio met le développement durable au cœur de l’action internationale.',
    },
    {
      q: 'En quelle année la COP21 adopte-t-elle l’accord de Paris sur le climat ?',
      a: '2015',
      wrong: [
        w('1992', '1992 est l’année du Sommet de la Terre à Rio.'),
        w('2001', '2001 est l’année des attentats du 11 septembre.'),
        w('1989', '1989 est la chute du mur de Berlin.'),
      ],
      gap: ['L’accord de Paris est adopté le 12 décembre ', '.', annee('2015')],
      ...PREUVES.accordParis,
      explain: 'La COP21 se tient à Paris en 2015.',
    },
    {
      q: 'Quelle limite principale l’accord de Paris montre-t-il, malgré son caractère contraignant ?',
      a: 'il n’a pas de sanction ni de mécanisme coercitif',
      wrong: [
        w('il n’a aucun objectif', 'Il fixe au contraire des objectifs de température.'),
        w('il ne concerne qu’un seul pays', 'La quasi-totalité des États s’engage.'),
        w('il interdit toute coopération', 'Il organise au contraire la coopération.'),
      ],
      gap: ['L’accord de Paris n’a ni mécanisme coercitif ni ', ' pour les États.', ['sanction', 'sanctions']],
      ...PREUVES.limites,
      explain: 'La coopération internationale a des avancées et des difficultés.',
    },
  ],
  paires3: [
    ['Casques bleus', 'Forces de maintien de la paix de l’ONU'],
    ['Droit de veto', 'Pouvoir de bloquer une décision'],
    ['Développement durable', 'Concept proclamé au Sommet de la Terre'],
  ],
  paires5: [
    ['1991', 'Disparition de l’URSS'],
    ['1992', 'Sommet de la Terre à Rio'],
    ['1993', 'Scission de la Tchécoslovaquie'],
    ['2001', 'Attentats du 11 septembre'],
    ['2015', 'Accord de Paris sur le climat'],
  ],
  frise: [
    { label: 'La disparition de l’URSS', date: '1991', ...PREUVES.urss1991 },
    { label: 'Le Sommet de la Terre à Rio', date: '1992', ...PREUVES.rio },
    { label: 'Les attentats aux États-Unis', date: '2001', ...PREUVES.attaquesDate },
    { label: 'L’indépendance du Soudan du Sud', date: '2011', ...PREUVES.soudan },
    { label: 'L’accord de Paris sur le climat', date: '2015', ...PREUVES.accordParis },
  ],
  libres: [
    {
      q: 'Quel nom portent les forces de maintien de la paix de l’ONU, d’après la couleur de leur casque ?',
      accepted: [...mot('Casques bleus', 'les ', 'des '), 'Casque bleu'],
      traps: [t('Poilus', 'Les poilus sont les soldats de 1914-1918.'), t('Casques verts', 'La couleur est le bleu.')],
      ...PREUVES.casquesBleus,
      explain: 'Les Casques bleus interviennent pour l’ONU.',
    },
    {
      q: 'Quel mot désigne le pouvoir d’un membre permanent de bloquer une décision du Conseil de sécurité ?',
      accepted: [...mot('veto', 'le ', 'un ', 'le droit de '), 'véto'],
      traps: [
        t('vote', 'Un vote ordinaire ne bloque pas à lui seul.'),
        t('référendum', 'Un référendum consulte les citoyens.'),
      ],
      ...PREUVES.vetoRejet,
      explain: 'C’est le droit de veto.',
    },
    {
      q: 'Dans quelle ville brésilienne se tient le Sommet de la Terre en 1992 ?',
      accepted: ['Rio', 'Rio de Janeiro', 'à Rio', 'à Rio de Janeiro'],
      traps: [
        t('Paris', 'Paris accueille la COP21 en 2015.'),
        t('Bandung', 'Bandung accueille la conférence de 1955.'),
      ],
      ...PREUVES.rio,
      explain: 'Rio de Janeiro accueille le Sommet de la Terre.',
    },
    {
      q: 'Dans quelle ville est adopté en 2015 l’accord sur le climat de la COP21 ?',
      accepted: ['Paris', 'à Paris'],
      traps: [t('Rio', 'Rio accueille le sommet de 1992.'), t('New York', 'L’accord porte le nom d’une autre ville.')],
      ...PREUVES.accordParis,
      explain: 'On parle de l’accord de Paris.',
    },
    {
      q: 'Quel mot désigne des violences organisées pour désorganiser la société et créer l’insécurité ?',
      accepted: [...mot('terrorisme', 'le ')],
      traps: [
        t('diplomatie', 'La diplomatie négocie.'),
        t('élargissement', 'L’élargissement concerne l’Union européenne.'),
      ],
      ...PREUVES.terrorismeDef,
      explain: 'Il s’agit du terrorisme.',
    },
    {
      q: 'Quel pays des Balkans se disloque à partir de 1991, au prix de guerres ?',
      accepted: [...mot('Yougoslavie', 'la ')],
      traps: [
        t('Tchécoslovaquie', 'La Tchécoslovaquie se divise en deux États en 1993.'),
        t('Grèce', 'La Grèce ne se disloque pas.'),
      ],
      ...PREUVES.yougoslavie,
      explain: 'La Yougoslavie éclate et connaît des guerres.',
    },
  ],
  docs: [
    {
      title: 'Les défis après la guerre froide',
      lines: [
        'La disparition de l’URSS en 1991 met fin à l’opposition entre les deux blocs.',
        'Dans les Balkans, la Yougoslavie se disloque au prix de guerres.',
        'En 2001, des attentats frappent New York et Washington.',
        'L’ONU envoie des Casques bleus dans de nombreuses zones de conflit.',
      ],
      qs: [
        {
          q: 'D’après les lignes 2 et 3, quelles formes de violence le texte montre-t-il ?',
          a: 'des guerres liées à l’éclatement d’un État et des attentats terroristes',
          wrong: [
            w('seulement une guerre entre les deux blocs', 'La guerre froide est terminée.'),
            w('uniquement des conflits en Amérique du Sud', 'Le texte cite les Balkans et les États-Unis.'),
          ],
          ...PREUVES.programmeConflits,
          explain: 'Les conflits contemporains ont des formes et des territoires variés.',
        },
        {
          q: 'En mobilisant tes connaissances : quel type de monde la ligne 1 fait-elle disparaître ?',
          a: 'le monde bipolaire de la guerre froide',
          wrong: [
            w('le monde féodal', 'Le monde féodal appartient au Moyen Âge.'),
            w('le monde d’avant 1914', 'La guerre froide est postérieure à 1945.'),
          ],
          ...PREUVES.postBipolaire,
          explain: 'Sans l’URSS, le monde n’est plus organisé en deux blocs.',
        },
        {
          q: 'D’après la ligne 4, quel acteur intervient dans des zones de conflit ?',
          a: 'l’ONU avec ses Casques bleus',
          wrong: [
            w('la CECA', 'La CECA est une communauté économique.'),
            w('le FLN', 'Le FLN est un mouvement de la guerre d’Algérie.'),
          ],
          ...PREUVES.casquesBleus,
          explain: 'L’ONU cherche à maintenir la paix.',
        },
      ],
    },
    {
      title: 'La coopération pour le climat',
      lines: [
        'En 1992, le Sommet de la Terre à Rio met en avant le développement durable.',
        'En décembre 2015, la COP21 adopte à Paris un accord sur le climat.',
        'Les États veulent contenir le réchauffement bien en dessous de 2 °C.',
        'L’accord est contraignant mais sans sanction : les efforts sont jugés insuffisants.',
      ],
      qs: [
        {
          q: 'D’après la ligne 4, quelle difficulté la coopération internationale rencontre-t-elle ?',
          a: 'l’absence de sanction face à des efforts insuffisants',
          wrong: [
            w('l’impossibilité de réunir les États', 'Un accord a été adopté.'),
            w('l’absence de tout objectif commun', 'La ligne 3 fixe un objectif.'),
          ],
          ...PREUVES.limites,
          explain: 'La coopération a des avancées mais aussi des difficultés.',
        },
        {
          q: 'D’après le texte, quel objectif de température les États se fixent-ils ?',
          a: 'rester bien en dessous de 2 °C de réchauffement',
          wrong: [
            w('atteindre 5 °C de réchauffement', 'Ils veulent au contraire limiter le réchauffement.'),
            w('baisser la température de 2 °C', 'L’objectif est de limiter la hausse.'),
          ],
          ...PREUVES.deuxDegres,
          explain: 'La ligne 3 donne cet objectif.',
        },
        {
          q: 'En mobilisant tes connaissances : quel échelon d’action politique illustrent ces conférences ?',
          a: 'l’échelle mondiale',
          wrong: [
            w('l’échelle d’une seule commune', 'Des États du monde entier participent.'),
            w('l’échelle d’une seule région française', 'Les conférences réunissent de nombreux pays.'),
          ],
          ...PREUVES.programmeClimat,
          explain: 'Le programme parle du niveau global de l’action politique.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [independances, guerreFroide, projetEuropeen, apres1989];

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'troisième'));
