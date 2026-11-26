import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES } from './guerres-totales-sources.ts';

/**
 * 3e, « La Première Guerre mondiale et les totalitarismes » (lot hi-3e-01) : premiers sous-thèmes du thème 1 du
 * programme du cycle 4, « L’Europe, un théâtre majeur des guerres totales (1914-1945) ». Les textes à lire du niveau 5
 * sont écrits pour l’exercice.
 */
export const SOURCE = 'cycle4-2020';

/** Une année seule ou précédée de « en ». */
const annee = (a: string) => [a, `en ${a}`, `l’an ${a}`, `l’année ${a}`];

/** Un mot ou un groupe nominal, avec ou sans article. */
const mot = (word: string, ...articles: string[]) => [word, ...articles.map((a) => `${a}${word}`)];

// ——— Notion 1 : la guerre totale ———

const guerreTotale: Notion = {
  id: 'h3-guerre-totale',
  title: 'La Première Guerre mondiale, une guerre totale',
  hint: 'Situe d’abord la question : au front, à l’arrière ou dans la chronologie de 1914 à 1918.',
  memo: [
    'De 1914 à 1918, la Grande Guerre mobilise les **civils** aussi bien que les militaires : on parle de **guerre totale**.',
    'À l’arrière, le **front intérieur** s’organise : **économie de guerre** (les femmes remplacent une partie des hommes), **propagande** et **Union sacrée** (4 août 1914). Au combat, les **tranchées** sont le symbole de cette guerre industrielle.',
    'Le conflit fait plus de 9 millions de morts et disparus, dont 1,4 million pour la France. Astuce brevet : classe chaque exemple dans une case : combattre, produire, convaincre ou subir.',
  ],
  faits: [
    {
      q: 'Pendant la Grande Guerre, qui est mobilisé dans les pays en guerre ?',
      a: 'les civils aussi bien que les militaires',
      wrong: [
        { label: 'les militaires seuls', why: 'Dans une guerre totale, les civils sont eux aussi mobilisés.' },
        { label: 'les civils seuls', why: 'Les militaires combattent : la guerre mobilise les deux.' },
        {
          label: 'uniquement les volontaires des colonies',
          why: 'Les colonies participent, mais la mobilisation touche toute la société.',
        },
      ],
      gap: ['La Grande Guerre mobilise les ', ' aussi bien que les militaires.', ['civils']],
      ...PREUVES.mobilise,
      explain: 'Civils et militaires sont mobilisés : c’est le cœur de la notion de guerre totale.',
    },
    {
      q: 'Quel nom donne-t-on à ce qui se passe à l’arrière, loin des combats ?',
      a: 'le front intérieur',
      wrong: [
        { label: 'le front de l’Est', why: 'Le front de l’Est est une zone de combats entre armées.' },
        { label: 'l’armistice', why: 'L’armistice est un arrêt des combats, signé en 1918.' },
        { label: 'la ligne des tranchées', why: 'Les tranchées sont à l’avant, là où l’on combat.' },
      ],
      gap: ['À l’arrière, on parle du « front ', ' ».', ['intérieur', 'interieur']],
      ...PREUVES.frontInterieur,
      explain: 'Le « front intérieur » désigne ce qui se passe à l’arrière : les civils y soutiennent la guerre.',
    },
    {
      q: 'Quel type d’économie est mis en place dès 1914 ?',
      a: 'une économie de guerre',
      wrong: [
        { label: 'une économie de loisirs', why: 'La production est tournée vers l’effort de guerre.' },
        { label: 'une économie sans usines', why: 'La Grande Guerre est une guerre industrielle.' },
        {
          label: 'une économie réservée aux soldats',
          why: 'Les femmes et les travailleurs coloniaux produisent à l’arrière.',
        },
      ],
      gap: ['Dès 1914, les États mettent en place une économie de ', '.', ['guerre']],
      ...PREUVES.economie,
      explain: 'L’économie de guerre met la production au service du conflit.',
    },
    {
      q: 'Quel moyen sert à mobiliser les esprits pendant la guerre ?',
      a: 'la propagande',
      wrong: [
        { label: 'l’armistice', why: 'L’armistice suspend les combats : il ne cherche pas à convaincre.' },
        { label: 'la collectivisation', why: 'La collectivisation concerne l’URSS de Staline, à partir de 1929.' },
        { label: 'la démobilisation', why: 'La démobilisation renvoie les soldats chez eux, après la guerre.' },
      ],
      gap: ['On mobilise les esprits par la ', '.', ['propagande']],
      ...PREUVES.propagande,
      explain:
        'La propagande cherche à convaincre ; des autorités morales (Églises, intellectuels, école) y participent.',
    },
    {
      q: 'Dans l’économie de guerre, qui compense en partie le manque d’hommes à l’arrière ?',
      a: 'les femmes et les travailleurs coloniaux',
      wrong: [
        { label: 'les soldats au front', why: 'Les soldats au front combattent, ils ne sont pas à l’arrière.' },
        { label: 'les généraux', why: 'Les généraux commandent les armées.' },
        { label: 'personne : les usines ferment', why: 'Au contraire, les usines produisent pour la guerre.' },
      ],
      gap: [
        'Les femmes et les travailleurs venus des colonies, dits travailleurs ',
        ', remplacent en partie les hommes partis combattre.',
        ['coloniaux'],
      ],
      ...PREUVES.economie,
      explain: 'Les femmes, les travailleurs coloniaux et même des enfants remplacent des hommes partis combattre.',
    },
    {
      q: 'Quelle expression le président Poincaré introduit-il le 4 août 1914 ?',
      a: 'l’Union sacrée',
      wrong: [
        { label: 'le Front populaire', why: 'Le Front populaire est une alliance des années 1930.' },
        { label: 'la paix de Versailles', why: 'La paix de Versailles est signée en 1919, après la guerre.' },
        { label: 'la Grande Terreur', why: 'La Grande Terreur se déroule en URSS en 1937-1938.' },
      ],
      gap: ['Le 4 août 1914, Poincaré introduit le terme d’« Union ', ' ».', ['sacrée', 'sacree']],
      ...PREUVES.unionSacree,
      explain: 'L’Union sacrée appelle à la solidarité nationale face à l’ennemi.',
    },
    {
      q: 'Quel lieu des combats est devenu le symbole de la Grande Guerre ?',
      a: 'la tranchée',
      wrong: [
        { label: 'le château fort', why: 'Le château fort appartient au Moyen Âge.' },
        { label: 'la barricade', why: 'La barricade est associée aux révolutions du XIXe siècle.' },
        { label: 'le port de commerce', why: 'Un port n’est pas le lieu type des combats de 1914-1918.' },
      ],
      gap: ['La ', ' est le symbole des combats de la Grande Guerre.', ['tranchée', 'tranchee']],
      ...PREUVES.tranchee,
      explain: 'Les soldats s’abritent dans des tranchées : elles symbolisent ce conflit.',
    },
    {
      q: 'Après la guerre de mouvement, quelle forme prend le conflit ?',
      a: 'une guerre de position',
      wrong: [
        { label: 'une guerre froide', why: 'La guerre froide oppose les États-Unis et l’URSS après 1945.' },
        { label: 'une guerre de religion', why: 'Les guerres de religion datent du XVIe siècle.' },
        { label: 'une paix armée', why: 'Les combats continuent : ce n’est pas une paix.' },
      ],
      gap: ['La guerre de mouvement laisse place à une guerre de ', '.', ['position', 'positions']],
      ...PREUVES.mouvementPosition,
      explain: 'Les armées passent du mouvement à la guerre de position : le front se fige.',
    },
    {
      q: 'Pourquoi l’année 1917 est-elle une année de crise en France ?',
      a: 'des mutineries éclatent dans l’armée',
      wrong: [
        { label: 'la guerre est déjà terminée', why: 'Les combats cessent le 11 novembre 1918.' },
        { label: 'le Front populaire arrive au pouvoir', why: 'Le Front populaire gagne les élections en 1936.' },
        { label: 'la guerre vient de commencer', why: 'La guerre a commencé en 1914.' },
      ],
      gap: [
        'En 1917, après l’offensive du Chemin des Dames, des ',
        ' éclatent dans l’armée.',
        ['mutineries', 'révoltes', 'revoltes'],
      ],
      ...PREUVES.mutineries,
      explain: 'L’échec de l’offensive du Chemin des Dames est suivi de mutineries.',
    },
    {
      q: 'Combien de civils belges et français sont exécutés entre août et octobre 1914 ?',
      a: '6 500',
      wrong: [
        { label: 'aucun', why: 'Les civils sont frappés par les violences de guerre dès 1914.' },
        { label: '9 millions', why: 'Plus de 9 millions, c’est le total des morts et disparus du conflit.' },
        { label: '1,4 million', why: '1,4 million est le nombre de morts et disparus pour la France.' },
      ],
      gap: ['Entre août et octobre 1914, ', ' civils belges et français sont exécutés.', ['6 500', '6500', '6.500']],
      ...PREUVES.executions,
      explain: 'Les civils subissent des violences dès l’invasion de 1914.',
    },
    {
      q: 'Quel est l’ordre de grandeur du nombre de morts et disparus de la Grande Guerre ?',
      a: 'plus de 9 millions',
      wrong: [
        { label: 'environ 9 000', why: 'Le bilan se compte en millions.' },
        { label: 'environ 100 000', why: 'Le bilan est bien plus lourd : plusieurs millions.' },
        { label: 'plus de 90 millions', why: 'Le conflit a fait plus de 9 millions de morts et disparus.' },
      ],
      gap: ['Le conflit fait plus de ', ' millions de morts et disparus.', ['9', 'neuf']],
      ...PREUVES.morts,
      explain: 'La guerre fait plus de 9 millions de morts et disparus, dont 1,4 million pour la France.',
    },
  ],
  paires3: [
    ['Front intérieur', 'Ce qui se passe à l’arrière'],
    ['Propagande', 'Mobiliser les esprits'],
    ['Tranchée', 'Symbole des combats'],
  ],
  paires5: [
    ['Union sacrée', 'Expression introduite par Poincaré'],
    ['Économie de guerre', 'Production au service du conflit'],
    ['1917', 'Année de crise : mutineries et grèves'],
    ['11 novembre 1918', 'Signature de l’armistice'],
    ['Verdun', 'Bataille de 1916'],
  ],
  frise: [
    { label: 'L’appel à l’Union sacrée', date: '1914', ...PREUVES.unionDate },
    { label: 'La bataille de Verdun', date: '1916', ...PREUVES.verdun },
    { label: 'Une année de crise : mutineries et grèves', date: '1917', ...PREUVES.crise1917 },
    { label: 'La signature de l’armistice à Rethondes', date: '1918', ...PREUVES.armistice },
  ],
  libres: [
    {
      q: 'Comment appelle-t-on une guerre qui mobilise toute la société, civils comme militaires ?',
      accepted: [...mot('guerre totale', 'une ', 'la '), 'totale'],
      traps: [
        { text: 'guerre de position', why: 'La guerre de position décrit un front qui se fige.' },
        { text: 'guerre froide', why: 'La guerre froide est un conflit d’après 1945.' },
      ],
      ...PREUVES.mobilise,
      explain: 'Une guerre totale mobilise les civils aussi bien que les militaires.',
    },
    {
      q: 'Quel mot désigne les moyens utilisés pour mobiliser les esprits et convaincre la population ?',
      accepted: mot('propagande', 'la ', 'une '),
      traps: [
        {
          text: 'mobilisation',
          why: 'La mobilisation est l’appel de toutes les forces ; le moyen de convaincre est la propagande.',
        },
        { text: 'censure', why: 'La censure interdit des informations ; ici, on cherche à convaincre.' },
      ],
      ...PREUVES.propagande,
      explain: 'La propagande mobilise les esprits.',
    },
    {
      q: 'Quel fossé creusé, abri des soldats, est le symbole des combats de la Grande Guerre ?',
      accepted: ['tranchée', 'tranchées', 'tranchee', 'tranchees', 'la tranchée', 'les tranchées', 'une tranchée'],
      traps: [
        { text: 'bunker', why: 'Le mot attendu pour la Grande Guerre est celui du fossé creusé : la tranchée.' },
        { text: 'château', why: 'Le château n’est pas l’abri des combattants de 1914-1918.' },
      ],
      ...PREUVES.tranchee,
      explain: 'La tranchée est le symbole des combats.',
    },
    {
      q: 'Quel nom porte l’appel à la solidarité nationale lancé en France en août 1914 (deux mots) ?',
      accepted: ['Union sacrée', 'Union sacree', 'l’Union sacrée', 'l’Union sacree'],
      traps: [
        { text: 'Front populaire', why: 'Le Front populaire date de 1936.' },
        { text: 'front intérieur', why: 'Le front intérieur désigne l’arrière, pas cet appel.' },
      ],
      ...PREUVES.solidarite,
      explain: 'L’Union sacrée traduit la solidarité face à l’ennemi.',
    },
    {
      q: 'En quelle année est signé l’armistice à Rethondes ?',
      accepted: annee('1918'),
      traps: [
        { text: '1914', why: '1914 est le début de la guerre.' },
        { text: '1919', why: '1919 est l’année du traité de Versailles ; l’armistice est signé avant.' },
      ],
      ...PREUVES.armistice,
      explain: 'L’armistice est signé le 11 novembre 1918.',
    },
    {
      q: 'En quelle année commence la Grande Guerre ?',
      accepted: annee('1914'),
      traps: [
        { text: '1918', why: '1918 est la fin de la guerre.' },
        { text: '1939', why: '1939 est le début de la Seconde Guerre mondiale.' },
      ],
      ...PREUVES.reperesGuerre,
      explain: 'La Grande Guerre dure de 1914 à 1918.',
    },
  ],
  docs: [
    {
      title: 'Une ville à l’arrière, 1916',
      lines: [
        'Dans une usine, des ouvrières fabriquent des obus à la place des hommes partis combattre.',
        'Sur les murs, des affiches appellent chacun à soutenir les soldats.',
        'Les familles attendent des lettres du front.',
      ],
      qs: [
        {
          q: 'Quelle notion les deux premières lignes illustrent-elles ?',
          a: 'la mobilisation des civils dans une guerre totale',
          wrong: [
            { label: 'la guerre de mouvement', why: 'Le texte décrit l’arrière, pas des armées en marche.' },
            { label: 'la sortie de guerre', why: 'Les soldats combattent encore : la guerre n’est pas finie.' },
            { label: 'un régime à parti unique', why: 'Aucune ligne ne parle d’un parti qui prend tous les pouvoirs.' },
          ],
          ...PREUVES.economie,
          explain: 'Usines et affiches montrent que les civils produisent et sont appelés à soutenir la guerre.',
        },
        {
          q: 'À quel moyen les affiches de la ligne 2 correspondent-elles ?',
          a: 'la propagande',
          wrong: [
            { label: 'l’armistice', why: 'L’armistice suspend les combats.' },
            { label: 'la guerre de position', why: 'La guerre de position concerne le front.' },
            { label: 'la collectivisation', why: 'La collectivisation concerne l’URSS des années 1930.' },
          ],
          ...PREUVES.propagande,
          explain: 'Les affiches cherchent à mobiliser les esprits.',
        },
      ],
    },
    {
      title: 'Deux moments de la guerre',
      lines: [
        'Au début du conflit, des civils sont exécutés dans les régions envahies de Belgique et de France.',
        'En 1918, des canons à longue portée bombardent Paris, loin des tranchées.',
      ],
      qs: [
        {
          q: 'Que montrent ces deux lignes sur les civils ?',
          a: 'ils subissent eux aussi la violence de guerre',
          wrong: [
            { label: 'ils sont toujours protégés des combats', why: 'Les deux lignes montrent des civils frappés.' },
            { label: 'ils commandent les armées', why: 'Le texte ne parle pas de commandement.' },
            { label: 'ils ne sont touchés qu’après 1918', why: 'La première ligne date du début de la guerre.' },
          ],
          ...PREUVES.paris1918,
          explain: 'Invasion et bombardements frappent des civils : la distinction entre front et arrière s’efface.',
        },
        {
          q: 'En te souvenant des guerres industrielles : pourquoi Paris peut-elle être touchée loin du front ?',
          a: 'des armes à longue portée atteignent l’arrière',
          wrong: [
            {
              label: 'les tranchées traversent le centre de Paris',
              why: 'La ligne 2 dit que Paris est loin des tranchées.',
            },
            { label: 'Paris est une colonie ennemie', why: 'Paris est la capitale de la France.' },
            { label: 'la guerre est terminée', why: 'En 1918, avant l’armistice, les combats continuent.' },
          ],
          ...PREUVES.paris1918,
          explain: 'Les canons lourds portent jusqu’à Paris.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : le génocide des Arméniens ———

const genocideArmeniens: Notion = {
  id: 'h3-genocide-armeniens',
  title: 'Le génocide des Arméniens',
  hint: 'Replace les faits : un empire en guerre, une population visée, des repères de 1915 à aujourd’hui.',
  memo: [
    'En 1915, pendant la Grande Guerre, les Arméniens de l’**Empire ottoman** sont victimes d’un **génocide** : l’extermination systématique d’un groupe humain.',
    'Le 24 avril 1915, près de 600 intellectuels arméniens sont arrêtés à Constantinople. Puis viennent les massacres et la **déportation**, notamment vers les déserts de Mésopotamie et de Syrie : plus d’un million de morts.',
    'L’Empire ottoman, allié de l’Allemagne et de l’Autriche-Hongrie, est alors dirigé par les Jeunes-Turcs : leur parti, Union et Progrès, exerce une dictature. Autres repères : massacres de 1894-1896, procès des responsables en 1919, journée du 24 avril créée en 2019.',
    'La France reconnaît ce génocide par la loi du 29 janvier 2001 et le commémore chaque 24 avril. Astuce brevet : donne toujours le lieu, la date et le contexte de guerre.',
  ],
  faits: [
    {
      q: 'Quelle population est victime d’un génocide dans l’Empire ottoman à partir de 1915 ?',
      a: 'les Arméniens',
      wrong: [
        { label: 'les Britanniques', why: 'Les Britanniques ne sont pas une population visée par ce génocide.' },
        { label: 'les Italiens', why: 'Le génocide de 1915 vise les Arméniens de l’Empire ottoman.' },
        { label: 'les Belges', why: 'Des civils belges sont frappés en 1914, mais pas dans l’Empire ottoman.' },
      ],
      gap: ['En 1915 commence le génocide des ', '.', ['Arméniens', 'Armeniens']],
      ...PREUVES.ottoman,
      explain: 'Les Arméniens de l’Empire ottoman sont victimes d’un génocide.',
    },
    {
      q: 'Dans quel État le génocide des Arméniens est-il commis ?',
      a: 'l’Empire ottoman',
      wrong: [
        { label: 'le Royaume-Uni', why: 'Le Royaume-Uni combat contre l’Empire ottoman.' },
        { label: 'la République française', why: 'La France n’est pas le lieu de ce génocide.' },
        { label: 'l’Italie', why: 'Les victimes vivaient dans l’Empire ottoman.' },
      ],
      gap: ['Le génocide est commis dans l’Empire ', '.', ['ottoman', 'turc']],
      ...PREUVES.ottoman,
      explain: 'La tragédie se déroule dans l’Empire ottoman, un État en guerre.',
    },
    {
      q: 'Aux côtés de quels États l’Empire ottoman se range-t-il en 1914 ?',
      a: 'l’Allemagne et l’Autriche-Hongrie',
      wrong: [
        { label: 'la France et le Royaume-Uni', why: 'La France et le Royaume-Uni sont ses adversaires.' },
        { label: 'les États-Unis seuls', why: 'Les États-Unis n’entrent en guerre qu’en 1917.' },
        { label: 'aucun : il reste neutre', why: 'L’Empire ottoman entre dans la guerre en 1914.' },
      ],
      gap: [
        'En novembre 1914, l’Empire ottoman se range aux côtés de l’Allemagne et de l’',
        '.',
        ['Autriche-Hongrie', 'Autriche Hongrie'],
      ],
      ...PREUVES.alliance,
      explain: 'Le génocide se déroule alors que l’Empire ottoman est en guerre.',
    },
    {
      q: 'Quel parti exerce une dictature sur l’Empire ottoman à la veille de la guerre ?',
      a: 'le parti Union et Progrès, des Jeunes-Turcs',
      wrong: [
        { label: 'le parti communiste soviétique', why: 'Il dirige l’URSS, pas l’Empire ottoman.' },
        { label: 'le parti nazi', why: 'Le régime nazi s’impose en Allemagne en 1933.' },
        { label: 'le parti radical', why: 'Le parti radical est un parti français, membre du Front populaire.' },
      ],
      gap: ['Les ministres du gouvernement appartiennent au parti Union et ', '.', ['Progrès', 'Progres']],
      ...PREUVES.jeunesTurcs,
      explain: 'Les principaux ministres jeunes-turcs sont membres du parti Union et Progrès.',
    },
    {
      q: 'Que se passe-t-il à Constantinople le 24 avril 1915 ?',
      a: 'l’arrestation de près de 600 intellectuels arméniens',
      wrong: [
        { label: 'la signature de l’armistice', why: 'L’armistice de Rethondes date du 11 novembre 1918.' },
        { label: 'le procès des responsables', why: 'Le procès des unionistes se tient en 1919.' },
        { label: 'la reconnaissance du génocide par la France', why: 'La loi française date de 2001.' },
      ],
      gap: [
        'Le 24 avril 1915, près de 600 intellectuels ',
        ' sont arrêtés à Constantinople.',
        ['arméniens', 'armeniens'],
      ],
      ...PREUVES.rafle,
      explain: 'Ces intellectuels sont déportés ou assassinés : ce jour marque le début du génocide.',
    },
    {
      q: 'Quel est l’ordre de grandeur du nombre de morts du génocide des Arméniens ?',
      a: 'plus d’un million',
      wrong: [
        { label: 'quelques centaines', why: 'Près de 600, c’est le nombre d’intellectuels arrêtés le 24 avril 1915.' },
        { label: 'environ 30 000', why: 'Le bilan du génocide est bien plus lourd : plus d’un million.' },
        { label: 'plus de 100 millions', why: 'Ce chiffre dépasse de très loin la population concernée.' },
      ],
      gap: ['Le génocide provoque la mort de plus d’un ', ' de personnes.', ['million']],
      ...PREUVES.bilanGenocide,
      explain: 'Le génocide a provoqué la mort de plus d’un million de personnes.',
    },
    {
      q: 'Pendant le génocide des Arméniens, vers quels lieux les convois de déportés sont-ils envoyés, souvent pour y mourir ?',
      a: 'les déserts de Mésopotamie et de Syrie',
      wrong: [
        { label: 'les ports de la mer du Nord', why: 'Ces lieux sont hors de l’Empire ottoman.' },
        { label: 'les Alpes', why: 'Les Alpes ne font pas partie de l’Empire ottoman.' },
        { label: 'les plaines de Russie', why: 'La Russie n’est pas la destination des convois.' },
      ],
      gap: ['Les déserts de Mésopotamie et de ', ' sont le tombeau de nombreux déportés.', ['Syrie']],
      ...PREUVES.deserts,
      explain: 'La déportation vers ces déserts fait partie de l’extermination.',
    },
    {
      q: 'Pendant le génocide des Arméniens, qui est organisé en convois sur la route de la déportation ?',
      a: 'des femmes, des enfants et des vieillards',
      wrong: [
        { label: 'les ministres du gouvernement', why: 'Le gouvernement jeune-turc n’est pas déporté.' },
        { label: 'les soldats allemands', why: 'L’Allemagne est l’alliée de l’Empire ottoman.' },
        { label: 'les diplomates étrangers', why: 'Les diplomates observent les faits ; ils ne sont pas déportés.' },
      ],
      gap: ['Femmes, enfants et ', ' sont organisés en convois de déportation.', ['vieillards', 'personnes âgées']],
      ...PREUVES.convois,
      explain: 'La déportation frappe des familles entières.',
    },
    {
      q: 'Pendant le génocide des Arméniens, à quoi la déportation sert-elle de couverture, selon les historiens ?',
      a: 'à des ordres de mise à mort donnés en secret',
      wrong: [
        { label: 'à un retour volontaire des familles', why: 'Il s’agit d’une déportation forcée.' },
        { label: 'à un simple recensement', why: 'La déportation s’accompagne de massacres.' },
        { label: 'à des élections libres', why: 'Le parti au pouvoir exerce une dictature.' },
      ],
      gap: ['Les ordres de mise à mort sont donnés dans le ', ', la déportation servant de couverture.', ['secret']],
      ...PREUVES.secret,
      explain: 'Les ordres secrets montrent que le crime est organisé.',
    },
    {
      q: 'En quelle année une loi française reconnaît-elle publiquement le génocide arménien ?',
      a: '2001',
      wrong: [
        { label: '1915', why: '1915 est l’année du début du génocide.' },
        { label: '1919', why: '1919 est l’année du procès des unionistes à Constantinople.' },
        { label: '2019', why: '2019 est l’année du décret qui crée la journée du 24 avril.' },
      ],
      gap: ['La France reconnaît le génocide arménien par une loi de ', '.', ['2001']],
      ...PREUVES.loiDate,
      explain: 'La loi du 29 janvier 2001 reconnaît le génocide arménien de 1915.',
    },
  ],
  paires3: [
    ['24 avril 1915', 'Arrestation d’intellectuels arméniens'],
    ['Empire ottoman', 'État où le génocide est commis'],
    ['2001', 'Loi française de reconnaissance'],
  ],
  paires5: [
    ['1894-1896', 'Grands massacres d’Arméniens'],
    ['1915', 'Début du génocide'],
    ['1919', 'Procès des unionistes à Constantinople'],
    ['2001', 'Reconnaissance par la loi française'],
    ['2019', 'Décret créant la journée de commémoration'],
  ],
  frise: [
    { label: 'De grands massacres d’Arméniens', date: '1894-1896', ...PREUVES.massacres1894 },
    { label: 'L’arrestation d’intellectuels arméniens à Constantinople', date: '1915', ...PREUVES.rafle },
    { label: 'Le procès des unionistes à Constantinople', date: '1919', ...PREUVES.proces1919 },
    { label: 'La loi française reconnaissant le génocide', date: '2001', ...PREUVES.loiDate },
    { label: 'Le décret créant la journée du 24 avril', date: '2019', ...PREUVES.commemoration },
  ],
  libres: [
    {
      q: 'Quel mot désigne l’extermination systématique d’un groupe humain ?',
      accepted: ['génocide', 'genocide', 'un génocide', 'le génocide'],
      traps: [
        {
          text: 'déportation',
          why: 'La déportation est le transfert forcé ; l’extermination d’un groupe est un génocide.',
        },
        { text: 'mutinerie', why: 'Une mutinerie est une révolte de soldats.' },
      ],
      ...PREUVES.definition,
      explain: 'Le génocide est l’extermination systématique d’un groupe humain.',
    },
    {
      q: 'Dans quel empire les Arméniens sont-ils victimes d’un génocide ?',
      accepted: [
        'ottoman',
        'Empire ottoman',
        'l’Empire ottoman',
        'dans l’Empire ottoman',
        'l’empire des Ottomans',
        'turc',
        'Empire turc',
        'l’Empire turc',
      ],
      traps: [
        { text: 'russe', why: 'La Russie est un État voisin ; le génocide a lieu dans l’Empire ottoman.' },
        { text: 'austro-hongrois', why: 'L’Autriche-Hongrie est alliée de l’Empire ottoman.' },
      ],
      ...PREUVES.ottoman,
      explain: 'Les Arméniens de l’Empire ottoman sont victimes d’un génocide.',
    },
    {
      q: 'En quelle année commence le génocide des Arméniens ?',
      accepted: annee('1915'),
      traps: [
        { text: '1914', why: 'En 1914, l’Empire ottoman entre en guerre ; le génocide commence l’année suivante.' },
        { text: '2001', why: '2001 est l’année de la loi française de reconnaissance.' },
      ],
      ...PREUVES.armeniensProgramme,
      explain: 'Le génocide des Arméniens commence en 1915.',
    },
    {
      q: 'Quel jour d’avril la France commémore-t-elle le génocide arménien ? (jour et mois)',
      accepted: ['24 avril', 'le 24 avril', '24/04'],
      traps: [
        { text: '27 janvier', why: 'Le 27 janvier est la journée de la mémoire des génocides en général.' },
        { text: '11 novembre', why: 'Le 11 novembre commémore l’armistice de 1918.' },
      ],
      ...PREUVES.commemoration,
      explain: 'La journée de commémoration est le 24 avril.',
    },
    {
      q: 'Comment appelle-t-on le transfert forcé des Arméniens hors de chez eux ?',
      accepted: ['déportation', 'deportation', 'la déportation', 'une déportation'],
      traps: [
        { text: 'émigration', why: 'L’émigration est un départ choisi ; ici le départ est forcé.' },
        { text: 'mobilisation', why: 'La mobilisation est l’appel à participer à la guerre.' },
      ],
      ...PREUVES.convois,
      explain: 'La déportation est un transfert forcé.',
    },
  ],
  docs: [
    {
      title: 'Le récit d’une classe',
      lines: [
        'Au printemps 1915, l’Empire ottoman est en guerre.',
        'Des notables arméniens sont arrêtés.',
        'Puis des familles sont contraintes de partir à pied vers des régions désertiques ; beaucoup meurent.',
        'Des ordres de tuer sont donnés en secret.',
      ],
      qs: [
        {
          q: 'Quel crime ce texte décrit-il ?',
          a: 'un génocide',
          wrong: [
            {
              label: 'une bataille entre deux armées',
              why: 'Les victimes sont des familles, pas une armée au combat.',
            },
            { label: 'une grève d’usine', why: 'Le texte décrit des arrestations, des départs forcés et des morts.' },
            { label: 'une élection contestée', why: 'Aucune élection n’est évoquée.' },
          ],
          ...PREUVES.armeniensProgramme,
          explain:
            'Arrestations, déportation et ordres de tuer visant un peuple caractérisent le génocide des Arméniens.',
        },
        {
          q: 'En réutilisant la notion de guerre totale : dans quel contexte ces violences ont-elles lieu ?',
          a: 'la Première Guerre mondiale, qui frappe aussi les civils',
          wrong: [
            { label: 'la guerre froide', why: 'La guerre froide débute après 1945.' },
            { label: 'la crise économique de 1929', why: 'Les faits datent de 1915.' },
            { label: 'une période de paix en Europe', why: 'La ligne 1 dit que l’Empire ottoman est en guerre.' },
          ],
          ...PREUVES.radicalisation,
          explain: 'Dans la guerre, des violences plus anciennes se radicalisent.',
        },
      ],
    },
    {
      title: 'Se souvenir',
      lines: [
        'Chaque 24 avril, une cérémonie rappelle les victimes arméniennes de 1915.',
        'Une loi de 2001 a affirmé que la France reconnaît publiquement ce génocide.',
      ],
      qs: [
        {
          q: 'Que rappelle la date du 24 avril ?',
          a: 'les arrestations de 1915 à Constantinople, début du génocide',
          wrong: [
            { label: 'l’armistice de Rethondes', why: 'L’armistice date du 11 novembre 1918.' },
            { label: 'le vote de la loi de 2001', why: 'La loi date du 29 janvier 2001.' },
            { label: 'l’entrée en guerre de 1914', why: 'La date renvoie au 24 avril 1915.' },
          ],
          ...PREUVES.rafle,
          explain: 'La date est fixée en référence au 24 avril 1915.',
        },
        {
          q: 'Quel texte permet à la France de reconnaître ce génocide ?',
          a: 'une loi de 2001',
          wrong: [
            {
              label: 'le traité de Versailles',
              why: 'Le traité de Versailles de 1919 règle la paix avec l’Allemagne.',
            },
            { label: 'les accords Matignon', why: 'Les accords Matignon de 1936 concernent le travail.' },
            { label: 'les lois de Nuremberg', why: 'Les lois de Nuremberg sont des lois antisémites nazies de 1935.' },
          ],
          ...PREUVES.loi2001,
          explain: 'La loi dit : « La France reconnaît publiquement le génocide arménien de 1915. »',
        },
      ],
    },
  ],
};

// ——— Notion 3 : les démocraties fragilisées ———

const democraties: Notion = {
  id: 'h3-democraties-fragilisees',
  title: 'Les démocraties fragilisées dans l’entre-deux-guerres',
  hint: 'Repère la cause : une crise économique, une crise politique ou une menace venue d’autres pays.',
  memo: [
    'Entre les deux guerres, les **démocraties** sont fragilisées : la **crise** de 1929, partie des États-Unis, provoque un **chômage de masse**, et des **ligues** antiparlementaires contestent le régime.',
    'En France, après la crise politique (émeute du 6 février 1934), la gauche s’unit contre le fascisme : le **Front populaire** gagne en 1936, avec Léon Blum. Viennent les accords Matignon, les congés payés et les 40 heures.',
    'Astuce brevet : explique toujours en trois temps, crise, contestation, réponse. En Europe centrale et orientale, les pays basculent vers des régimes autoritaires, sauf la Tchécoslovaquie. En 1938, les accords de Munich prévoient que l’Allemagne annexe les Sudètes, une région tchécoslovaque.',
  ],
  faits: [
    {
      q: 'Dans quel pays la crise de 1929 commence-t-elle ?',
      a: 'aux États-Unis',
      wrong: [
        { label: 'en France', why: 'En France, les difficultés deviennent très significatives à partir de 1931.' },
        { label: 'en URSS', why: 'La crise est partie de la société américaine.' },
        { label: 'en Italie', why: 'L’épicentre de la crise est américain.' },
      ],
      gap: ['La société ', ' est l’épicentre de la crise de 1929.', ['américaine', 'americaine']],
      ...PREUVES.epicentre,
      explain: 'La crise part des États-Unis puis gagne le reste du monde.',
    },
    {
      q: 'Quelle conséquence sociale très visible la crise entraîne-t-elle ?',
      a: 'un chômage de masse',
      wrong: [
        { label: 'une hausse générale des salaires', why: 'La crise appauvrit de nombreux salariés.' },
        {
          label: 'la fin de toutes les usines',
          why: 'La production baisse, mais les usines ne disparaissent pas toutes.',
        },
        { label: 'un manque de main-d’œuvre', why: 'C’est l’inverse : beaucoup de travailleurs sont sans emploi.' },
      ],
      gap: ['La crise provoque l’émergence d’un ', ' de masse.', ['chômage', 'chomage']],
      ...PREUVES.chomage,
      explain: 'Le chômage de masse touche de nombreux actifs et nourrit le mécontentement.',
    },
    {
      q: 'Quelle vague politique s’étend en France au début des années 1930 ?',
      a: 'l’antiparlementarisme',
      wrong: [
        { label: 'le suffrage censitaire', why: 'Le suffrage censitaire appartient au XIXe siècle.' },
        { label: 'la collectivisation', why: 'La collectivisation concerne l’URSS.' },
        { label: 'la démobilisation', why: 'La démobilisation des soldats suit la Grande Guerre.' },
      ],
      gap: ['Une vague d’', ' s’étend : le Parlement est contesté.', ['antiparlementarisme']],
      ...PREUVES.antiparlementarisme,
      explain: 'L’antiparlementarisme critique le Parlement, cœur de la démocratie.',
    },
    {
      q: 'Que se passe-t-il à Paris le 6 février 1934 ?',
      a: 'une manifestation tourne à l’émeute',
      wrong: [
        { label: 'les accords Matignon sont signés', why: 'Les accords Matignon datent de juin 1936.' },
        { label: 'le Front populaire gagne les élections', why: 'Sa victoire date de mai 1936.' },
        { label: 'la guerre est déclarée', why: 'La France entre en guerre en septembre 1939.' },
      ],
      gap: ['Le 6 février 1934, une manifestation tourne à l’', '.', ['émeute', 'emeute']],
      ...PREUVES.fevrier1934,
      explain: 'Cette émeute montre la fragilité de la République.',
    },
    {
      q: 'Quelle alliance électorale remporte les élections de 1936 ?',
      a: 'le Front populaire',
      wrong: [
        { label: 'l’Union sacrée', why: 'L’Union sacrée date de la Grande Guerre.' },
        {
          label: 'les ligues antiparlementaires',
          why: 'Les ligues contestent le Parlement ; elles ne forment pas cette alliance.',
        },
        { label: 'le parti Union et Progrès', why: 'C’est un parti de l’Empire ottoman.' },
      ],
      gap: ['En mai 1936, le Front ', ' remporte les élections.', ['populaire', 'Populaire']],
      ...PREUVES.alliance1936,
      explain: 'Le Front populaire réunit le PCF, la SFIO et le parti radical.',
    },
    {
      q: 'Qui dirige le gouvernement du Front populaire en 1936 ?',
      a: 'Léon Blum',
      wrong: [
        { label: 'Raymond Poincaré', why: 'Poincaré est le président de 1914, qui parle d’Union sacrée.' },
        { label: 'Jules Ferry', why: 'Jules Ferry agit au XIXe siècle.' },
        { label: 'Napoléon III', why: 'Napoléon III dirige le Second Empire, au XIXe siècle.' },
      ],
      gap: ['En 1936, le gouvernement du Front populaire est présidé par Léon ', '.', ['Blum']],
      ...PREUVES.blum,
      explain: 'Léon Blum préside le gouvernement.',
    },
    {
      q: 'Quels accords sont signés dans la nuit du 7 au 8 juin 1936 ?',
      a: 'les accords Matignon',
      wrong: [
        { label: 'les accords de Munich', why: 'Les accords de Munich datent de septembre 1938.' },
        { label: 'les accords de Locarno', why: 'Les accords de Locarno sont des années 1920.' },
        { label: 'les lois de Nuremberg', why: 'Ce sont des lois nazies de 1935.' },
      ],
      gap: ['En juin 1936 sont signés les accords ', '.', ['Matignon', 'de Matignon']],
      ...PREUVES.matignon,
      explain: 'Les accords Matignon mettent d’accord patronat et syndicat CGT.',
    },
    {
      q: 'Combien de jours de vacances la loi sur les congés payés accorde-t-elle aux salariés en 1936 ?',
      a: 'quinze jours',
      wrong: [
        { label: 'aucun jour', why: 'La loi crée justement des vacances payées.' },
        { label: 'quarante jours', why: '40 est le nombre d’heures de travail par semaine.' },
        { label: 'cinq semaines', why: 'La loi de 1936 accorde quinze jours.' },
      ],
      gap: ['La loi de 1936 accorde ', ' jours de congés payés.', ['quinze', '15']],
      ...PREUVES.conges,
      explain: 'Les salariés obtiennent quinze jours de congés payés.',
    },
    {
      q: 'Quelle durée hebdomadaire du travail la loi de 1936 fixe-t-elle ?',
      a: '40 heures',
      wrong: [
        { label: '15 heures', why: 'Le nombre 15 concerne les jours de congés payés.' },
        { label: '60 heures', why: 'La loi réduit la semaine à 40 heures.' },
        { label: '35 heures', why: 'La loi de 1936 fixe 40 heures.' },
      ],
      gap: ['La loi fixe à ', ' heures la durée du travail par semaine.', ['40', 'quarante']],
      ...PREUVES.quarante,
      explain: 'La semaine de travail est fixée à 40 heures.',
    },
    {
      q: 'Qu’est-ce qui unit les partis du Front populaire, comme un « ciment » ?',
      a: 'l’antifascisme',
      wrong: [
        { label: 'le retour de la monarchie', why: 'Le Front populaire est une alliance républicaine.' },
        { label: 'l’antiparlementarisme', why: 'Au contraire, il veut défendre la République.' },
        { label: 'la collectivisation des terres', why: 'La collectivisation est une politique soviétique.' },
      ],
      gap: ['Ce qui unit les partis du Front populaire, son « ciment », est l’', '.', ['antifascisme']],
      ...PREUVES.antifascisme,
      explain: 'Les partis s’unissent contre le fascisme.',
    },
    {
      q: 'Quel pays d’Europe centrale et orientale ne bascule pas vers un régime autoritaire dans les années 1930 ?',
      a: 'la Tchécoslovaquie',
      wrong: [
        { label: 'l’Italie', why: 'L’Italie est une dictature fasciste depuis les années 1920.' },
        { label: 'l’Allemagne', why: 'L’Allemagne devient nazie en 1933.' },
        { label: 'l’URSS', why: 'L’URSS est une dictature dirigée par Staline.' },
      ],
      gap: [
        'Dans les années 1930, les pays d’Europe centrale et orientale basculent vers des régimes autoritaires, sauf la ',
        '.',
        ['Tchécoslovaquie', 'Tchecoslovaquie'],
      ],
      ...PREUVES.centre,
      explain: 'La Tchécoslovaquie fait exception.',
    },
  ],
  paires3: [
    ['1929', 'Début de la crise économique'],
    ['Congés payés', 'Quinze jours de vacances'],
    ['Léon Blum', 'Chef du gouvernement en 1936'],
  ],
  paires5: [
    ['Ligues', 'Groupes antiparlementaires'],
    ['6 février 1934', 'Manifestation qui tourne à l’émeute'],
    ['Front populaire', 'Alliance victorieuse en mai 1936'],
    ['Accords Matignon', 'Hausse des salaires et droit syndical'],
    ['Accords de Munich', 'Annexion des Sudètes par l’Allemagne'],
  ],
  frise: [
    { label: 'Le début de la crise économique mondiale', date: '1929', ...PREUVES.diffusion },
    { label: 'L’émeute du 6 février à Paris', date: '1934', ...PREUVES.fevrier1934 },
    { label: 'La victoire du Front populaire', date: '1936', ...PREUVES.victoire },
    { label: 'Les accords de Munich', date: '1938', ...PREUVES.munich },
  ],
  libres: [
    {
      q: 'Quelle alliance de gauche gagne les élections de 1936 ? (deux mots)',
      accepted: ['Front populaire', 'le Front populaire'],
      traps: [
        { text: 'front intérieur', why: 'Le front intérieur désigne l’arrière pendant la guerre.' },
        { text: 'Union sacrée', why: 'L’Union sacrée date de 1914.' },
      ],
      ...PREUVES.alliance1936,
      explain: 'Le Front populaire gagne les élections de mai 1936.',
    },
    {
      q: 'Quel homme politique dirige le gouvernement du Front populaire ?',
      accepted: ['Léon Blum', 'Leon Blum', 'Blum'],
      traps: [
        { text: 'Poincaré', why: 'Poincaré préside la République en 1914.' },
        {
          text: 'Daladier',
          why: 'Daladier signe les accords de Munich en 1938 ; en 1936, le chef du gouvernement est Blum.',
        },
      ],
      ...PREUVES.blum,
      explain: 'Léon Blum préside le gouvernement en 1936.',
    },
    {
      q: 'Comment appelle-t-on la situation où de très nombreuses personnes n’ont pas d’emploi ?',
      accepted: [
        'chômage de masse',
        'chomage de masse',
        'un chômage de masse',
        'le chômage de masse',
        'chômage',
        'chomage',
        'le chômage',
      ],
      traps: [
        { text: 'grève', why: 'La grève est un arrêt volontaire du travail.' },
        { text: 'crise', why: 'La crise est la cause ; on demande ici le nom du manque d’emplois.' },
      ],
      ...PREUVES.chomage,
      explain: 'La crise provoque un chômage de masse.',
    },
    {
      q: 'Quel nom portent les accords signés en juin 1936 entre les patrons et le syndicat CGT, sous le gouvernement de Léon Blum ?',
      accepted: [
        'Matignon',
        'accords Matignon',
        'les accords Matignon',
        'accords de Matignon',
        'les accords de Matignon',
      ],
      traps: [
        { text: 'Munich', why: 'Les accords de Munich datent de 1938.' },
        { text: 'Versailles', why: 'Le traité de Versailles date de 1919.' },
      ],
      ...PREUVES.matignon,
      explain: 'Ce sont les accords Matignon.',
    },
    {
      q: 'En quelle année le Front populaire arrive-t-il au pouvoir ?',
      accepted: annee('1936'),
      traps: [
        { text: '1934', why: '1934 est l’année de l’émeute du 6 février.' },
        { text: '1929', why: '1929 est le début de la crise économique.' },
      ],
      ...PREUVES.victoire,
      explain: 'La victoire date de mai 1936.',
    },
    {
      q: 'En quelle année la crise économique mondiale débute-t-elle ?',
      accepted: annee('1929'),
      traps: [
        { text: '1936', why: '1936 est l’année du Front populaire.' },
        { text: '1919', why: '1919 est l’année du traité de Versailles.' },
      ],
      ...PREUVES.diffusion,
      explain: 'La crise commence en 1929.',
    },
  ],
  docs: [
    {
      title: 'Une famille en 1935',
      lines: [
        'Le père a perdu son emploi depuis plusieurs mois.',
        'La famille juge le gouvernement incapable de sortir le pays de la crise.',
        'Dans la rue, des ligues réclament un changement de régime et attaquent les députés.',
      ],
      qs: [
        {
          q: 'Quelle fragilité de la démocratie la ligne 3 montre-t-elle ?',
          a: 'l’antiparlementarisme des ligues',
          wrong: [
            { label: 'la victoire du suffrage universel', why: 'La ligne 3 décrit une contestation des députés.' },
            { label: 'une économie de guerre', why: 'Le texte se passe en temps de paix.' },
            { label: 'la collectivisation des terres', why: 'La collectivisation se déroule en URSS.' },
          ],
          ...PREUVES.ligues,
          explain: 'Les ligues attaquent le Parlement.',
        },
        {
          q: 'Quelle cause économique les lignes 1 et 2 évoquent-elles ?',
          a: 'la crise née en 1929 et son chômage',
          wrong: [
            { label: 'la mobilisation de 1914', why: 'La scène se passe en 1935, en temps de paix.' },
            { label: 'la séparation des Églises et de l’État', why: 'Elle date de 1905 et ne cause pas ce chômage.' },
            { label: 'la guerre froide', why: 'La guerre froide débute après 1945.' },
          ],
          ...PREUVES.france1931,
          explain: 'En France, la crise pèse lourdement à partir de 1931.',
        },
      ],
    },
    {
      title: 'Été 1936',
      lines: [
        'Les grèves occupent de nombreuses usines.',
        'Gouvernement, patronat et CGT trouvent un accord.',
        'Une loi donne aux salariés des vacances payées.',
      ],
      qs: [
        {
          q: 'Quel accord la ligne 2 désigne-t-elle ?',
          a: 'les accords Matignon',
          wrong: [
            { label: 'les accords de Munich', why: 'Munich, en 1938, concerne les Sudètes.' },
            { label: 'l’armistice de Rethondes', why: 'L’armistice date de 1918.' },
            { label: 'le traité de Versailles', why: 'Le traité de Versailles date de 1919.' },
          ],
          ...PREUVES.matignon,
          explain: 'Les accords Matignon sont signés en juin 1936.',
        },
        {
          q: 'En réutilisant la notion de démocratie : comment la crise est-elle ici traitée ?',
          a: 'par une négociation et des lois',
          wrong: [
            { label: 'par la suppression des élections', why: 'La démocratie française continue de fonctionner.' },
            { label: 'par un parti unique', why: 'Plusieurs partis existent.' },
            {
              label: 'par des camps de travail',
              why: 'Les camps relèvent de régimes totalitaires, comme l’URSS de Staline.',
            },
          ],
          ...PREUVES.reponse,
          explain: 'Le Front populaire répond à la crise dans le cadre de la République.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : les régimes totalitaires ———

const totalitaires: Notion = {
  id: 'h3-regimes-totalitaires',
  title: 'Les régimes totalitaires',
  hint: 'Associe à chaque régime son chef, son pays, une date et une méthode : parti unique, propagande ou terreur.',
  memo: [
    'Un régime **totalitaire** repose sur un **parti unique**, interdit l’opposition, concentre tous les pouvoirs et veut contrôler toute la société, avec la **propagande**, la **censure** et la **terreur**.',
    'En URSS, issue de la révolution de 1917, Staline s’impose en 1928 puis lance la **collectivisation** (1929) ; son communisme s’impose aussi par la Grande Terreur (1937-1938). En Italie, Mussolini arrive au pouvoir en 1922 (**fascisme**). En Allemagne, Hitler arrive au pouvoir en 1933 (**nazisme**) et prend le titre de Führer en 1934.',
    'Astuce brevet : ces régimes ont des points communs, mais pas les mêmes idées ; cite toujours le pays et le chef. L’Allemagne nazie mène une politique **antisémite** : lois de Nuremberg (1935), nuit de Cristal (1938).',
  ],
  faits: [
    {
      q: 'Combien de partis un régime totalitaire autorise-t-il à gouverner ?',
      a: 'un seul : le parti unique',
      wrong: [
        { label: 'tous les partis, librement', why: 'Le régime totalitaire interdit toute opposition.' },
        { label: 'deux partis qui alternent', why: 'L’alternance n’existe pas dans un régime totalitaire.' },
        { label: 'les partis choisis à chaque élection libre', why: 'Il n’y a pas d’élection libre entre partis.' },
      ],
      gap: ['Un régime totalitaire fonctionne avec un parti ', '.', ['unique']],
      ...PREUVES.totalitaire,
      explain: 'Le parti unique interdit toute opposition.',
    },
    {
      q: 'Par quels moyens les régimes totalitaires s’enracinent-ils ?',
      a: 'la violence et la terreur',
      wrong: [
        { label: 'la liberté de la presse', why: 'La liberté de la presse est le contraire du contrôle totalitaire.' },
        { label: 'des élections libres', why: 'Ces régimes interdisent l’opposition.' },
        { label: 'la séparation des pouvoirs', why: 'Le pouvoir y est concentré.' },
      ],
      gap: ['Ces régimes s’enracinent par la violence et la peur extrême, appelée la ', '.', ['terreur']],
      ...PREUVES.terreur,
      explain: 'La terreur sert à imposer le régime.',
    },
    {
      q: 'En quelle année Mussolini parvient-il au pouvoir en Italie ?',
      a: '1922',
      wrong: [
        { label: '1933', why: '1933 est l’arrivée au pouvoir d’Hitler.' },
        { label: '1917', why: '1917 est l’année de la révolution russe.' },
        { label: '1936', why: '1936 est l’année du Front populaire en France.' },
      ],
      gap: ['En ', ', Mussolini parvient au pouvoir en Italie.', ['1922']],
      ...PREUVES.mussolini,
      explain: 'Mussolini arrive au pouvoir en octobre 1922.',
    },
    {
      q: 'Quelle doctrine Mussolini érige-t-il en système politique ?',
      a: 'le fascisme',
      wrong: [
        { label: 'le bolchevisme', why: 'Le bolchevisme est la doctrine de la révolution russe.' },
        { label: 'le nazisme', why: 'Le nazisme est le régime d’Hitler.' },
        { label: 'le parlementarisme', why: 'Le fascisme concentre le pouvoir ; il ne s’appuie pas sur le Parlement.' },
      ],
      gap: ['En Italie, la doctrine de Mussolini est le ', '.', ['fascisme']],
      ...PREUVES.fascisme,
      explain: 'Le fascisme est la doctrine de Mussolini.',
    },
    {
      q: 'Dans quel pays la guerre totale installe-t-elle les conditions de la révolution bolchevique ?',
      a: 'la Russie',
      wrong: [
        { label: 'l’Italie', why: 'En Italie s’installe le fascisme.' },
        { label: 'la France', why: 'La France reste une République après 1918.' },
        { label: 'le Royaume-Uni', why: 'Le Royaume-Uni garde son régime parlementaire.' },
      ],
      gap: ['La révolution bolchevique éclate en ', ' pendant la Grande Guerre.', ['Russie']],
      ...PREUVES.russie,
      explain: 'La Russie connaît la révolution en 1917.',
    },
    {
      q: 'Quel dirigeant s’impose définitivement en URSS en 1928 ?',
      a: 'Staline',
      wrong: [
        { label: 'Mussolini', why: 'Mussolini dirige l’Italie.' },
        { label: 'Hitler', why: 'Hitler dirige l’Allemagne à partir de 1933.' },
        { label: 'Léon Blum', why: 'Léon Blum est le chef du gouvernement français en 1936.' },
      ],
      gap: ['En 1928, ', ' s’impose définitivement en URSS.', ['Staline']],
      ...PREUVES.staline1928,
      explain: 'Staline s’impose en 1928.',
    },
    {
      q: 'Quelle politique Staline lance-t-il en 1929 dans les campagnes ?',
      a: 'la collectivisation des terres',
      wrong: [
        { label: 'les congés payés', why: 'Les congés payés sont une loi française de 1936.' },
        { label: 'l’Union sacrée', why: 'L’Union sacrée date de 1914 en France.' },
        { label: 'les lois de Nuremberg', why: 'Ce sont des lois nazies de 1935.' },
      ],
      gap: ['En 1929, Staline lance la ', ' des terres.', ['collectivisation']],
      ...PREUVES.collectivisation,
      explain: 'La collectivisation s’accompagne d’une industrialisation à marche forcée.',
    },
    {
      q: 'Comment appelle-t-on la vague de répression lancée en URSS en 1937-1938 ?',
      a: 'la Grande Terreur',
      wrong: [
        { label: 'la Grande Dépression', why: 'La Grande Dépression est la crise économique née en 1929.' },
        { label: 'la Grande Guerre', why: 'La Grande Guerre dure de 1914 à 1918.' },
        { label: 'la nuit de Cristal', why: 'La nuit de Cristal est un pogrom nazi de 1938.' },
      ],
      gap: ['En 1937-1938, l’URSS connaît la Grande ', '.', ['Terreur']],
      ...PREUVES.grandeTerreur,
      explain: 'La Grande Terreur est une répression de masse.',
    },
    {
      q: 'Quand Adolf Hitler arrive-t-il au pouvoir en Allemagne ?',
      a: 'en janvier 1933',
      wrong: [
        { label: 'en octobre 1922', why: 'Octobre 1922 est l’arrivée de Mussolini au pouvoir.' },
        { label: 'en novembre 1918', why: 'En 1918, la guerre s’achève.' },
        { label: 'en juin 1936', why: 'Juin 1936 est la date des accords Matignon.' },
      ],
      gap: ['Hitler arrive au pouvoir en janvier ', '.', ['1933']],
      ...PREUVES.hitler1933,
      explain: 'Hitler arrive au pouvoir en janvier 1933.',
    },
    {
      q: 'Quel titre Hitler adopte-t-il à partir de 1934 ?',
      a: 'Führer',
      wrong: [
        { label: 'Duce', why: 'Duce est le titre pris par Mussolini.' },
        { label: 'Tsar', why: 'Le tsar était le souverain russe avant 1917.' },
        { label: 'Président du Conseil', why: 'Ce titre désigne le chef du gouvernement français.' },
      ],
      gap: ['À partir de 1934, Hitler adopte le titre de « ', ' ».', ['Führer', 'Fuhrer', 'Fuehrer']],
      ...PREUVES.fuhrer,
      explain: 'Hitler porte le titre de Führer.',
    },
    {
      q: 'Quelle politique le parti nazi mène-t-il contre les Juifs avec les lois de Nuremberg de 1935 ?',
      a: 'une politique antisémite',
      wrong: [
        { label: 'une politique d’égalité des droits', why: 'Ces lois privent les Juifs de droits.' },
        { label: 'une politique de liberté religieuse', why: 'Les nazis persécutent les Juifs.' },
        { label: 'une politique de congés payés', why: 'Les congés payés sont une loi française de 1936.' },
      ],
      gap: ['Les lois de Nuremberg font partie de la politique ', ' des nazis.', ['antisémite', 'antisemite']],
      ...PREUVES.nuremberg,
      explain: 'Les lois de Nuremberg sont une étape de la politique antisémite nazie.',
    },
    {
      q: 'Comment appelle-t-on le pogrom nazi des 9 et 10 novembre 1938 ?',
      a: 'la nuit de Cristal',
      wrong: [
        { label: 'la Grande Terreur', why: 'La Grande Terreur se déroule en URSS.' },
        { label: 'la marche sur Rome', why: 'Cet épisode concerne l’Italie de Mussolini.' },
        { label: 'le 6 février', why: 'Le 6 février 1934 est une émeute à Paris.' },
      ],
      gap: ['Le pogrom de novembre 1938 est appelé la nuit de ', '.', ['Cristal']],
      ...PREUVES.pogrom,
      explain: 'La nuit de Cristal est un vaste pogrom contre les Juifs.',
    },
    {
      q: 'Quels outils servent aux régimes totalitaires à diffuser leurs idées et à faire taire les critiques ?',
      a: 'la propagande et la censure',
      wrong: [
        { label: 'la presse libre et le débat', why: 'Un régime totalitaire interdit la contradiction.' },
        { label: 'le droit de grève et les élections libres', why: 'Ces libertés sont celles d’une démocratie.' },
        { label: 'l’alternance entre partis', why: 'Le parti unique exclut l’alternance.' },
      ],
      gap: [
        'Pour diffuser ses idées, un régime totalitaire utilise la ',
        ' ; pour faire taire les critiques, la censure.',
        ['propagande'],
      ],
      ...PREUVES.ressorts,
      explain: 'La propagande diffuse les idées du régime ; la censure fait taire les autres.',
    },
  ],
  paires3: [
    ['Mussolini', 'Italie fasciste'],
    ['Staline', 'URSS communiste'],
    ['Hitler', 'Allemagne nazie'],
  ],
  paires5: [
    ['1922', 'Mussolini au pouvoir'],
    ['1929', 'Collectivisation en URSS'],
    ['1933', 'Hitler au pouvoir'],
    ['1935', 'Lois de Nuremberg'],
    ['1937-1938', 'Grande Terreur'],
  ],
  frise: [
    { label: 'La révolution russe', date: '1917', ...PREUVES.revolution1917 },
    { label: 'L’arrivée de Mussolini au pouvoir', date: '1922', ...PREUVES.mussolini },
    { label: 'La collectivisation lancée par Staline', date: '1929', ...PREUVES.collectivisation },
    { label: 'L’arrivée d’Hitler au pouvoir', date: '1933', ...PREUVES.hitler1933 },
    { label: 'La nuit de Cristal', date: '1938', ...PREUVES.cristal },
  ],
  libres: [
    {
      q: 'Comment qualifie-t-on un régime à parti unique qui veut contrôler toute la société ?',
      accepted: ['totalitaire', 'un régime totalitaire', 'régime totalitaire', 'totalitarisme', 'un totalitarisme'],
      traps: [
        { text: 'démocratique', why: 'Une démocratie permet l’opposition et plusieurs partis.' },
        { text: 'parlementaire', why: 'Un régime parlementaire donne un rôle central au Parlement.' },
        {
          text: 'dictature',
          why: 'C’est bien une dictature, mais quand elle veut contrôler toute la société, le mot précis est « totalitaire ».',
        },
      ],
      ...PREUVES.totalitaire,
      explain: 'C’est un régime totalitaire.',
    },
    {
      q: 'Qui dirige l’Italie fasciste à partir de 1922 ?',
      accepted: ['Mussolini', 'Benito Mussolini'],
      traps: [
        { text: 'Hitler', why: 'Hitler dirige l’Allemagne.' },
        { text: 'Staline', why: 'Staline dirige l’URSS.' },
      ],
      ...PREUVES.mussolini,
      explain: 'Mussolini est au pouvoir à partir de 1922.',
    },
    {
      q: 'Qui dirige l’URSS quand éclate la Grande Terreur en 1937 ?',
      accepted: ['Staline', 'Joseph Staline', 'Iossif Staline'],
      traps: [
        { text: 'Mussolini', why: 'Mussolini dirige l’Italie.' },
        { text: 'Lénine', why: 'Lénine précède Staline : en 1937, c’est Staline qui dirige l’URSS.' },
      ],
      ...PREUVES.staline1937,
      explain: 'Staline dirige l’URSS.',
    },
    {
      q: 'En quelle année Hitler arrive-t-il au pouvoir ?',
      accepted: annee('1933'),
      traps: [
        { text: '1922', why: '1922 est l’arrivée de Mussolini.' },
        { text: '1939', why: '1939 est le début de la Seconde Guerre mondiale.' },
      ],
      ...PREUVES.hitler1933,
      explain: 'Hitler arrive au pouvoir en 1933.',
    },
    {
      q: 'Quel titre allemand Hitler porte-t-il à partir de 1934 ?',
      accepted: ['Führer', 'Fuhrer', 'Fuehrer', 'le Führer'],
      traps: [
        { text: 'Duce', why: 'Duce désigne Mussolini.' },
        { text: 'Kaiser', why: 'Le Kaiser était l’empereur allemand, avant 1918.' },
      ],
      ...PREUVES.fuhrer,
      explain: 'Hitler est le Führer.',
    },
    {
      q: 'Quel nom porte la mise en commun forcée des terres lancée par Staline ?',
      accepted: [
        'collectivisation',
        'la collectivisation',
        'collectivisation des terres',
        'la collectivisation des terres',
      ],
      traps: [
        {
          text: 'industrialisation',
          why: 'L’industrialisation concerne les usines ; on demande ce qui touche les terres.',
        },
        {
          text: 'planification',
          why: 'La planification fixe des objectifs ; la mise en commun des terres est la collectivisation.',
        },
      ],
      ...PREUVES.collectivisation,
      explain: 'La collectivisation regroupe les exploitations agricoles.',
    },
  ],
  docs: [
    {
      title: 'Une école dans un État à parti unique',
      lines: [
        'Chaque matin, les élèves saluent le portrait du chef.',
        'Un seul parti existe ; les journaux répètent ses mots d’ordre.',
        'Les voisins qui critiquent le gouvernement sont arrêtés.',
      ],
      qs: [
        {
          q: 'Quel type de régime ce texte décrit-il ?',
          a: 'un régime totalitaire',
          wrong: [
            { label: 'une démocratie libérale', why: 'La critique est punie et un seul parti existe.' },
            { label: 'une monarchie parlementaire', why: 'Aucun Parlement libre n’apparaît.' },
            {
              label: 'une république du Front populaire',
              why: 'Le Front populaire respecte la République et ses libertés.',
            },
          ],
          ...PREUVES.totalitaire,
          explain: 'Parti unique, culte du chef et arrestations caractérisent un régime totalitaire.',
        },
        {
          q: 'Quel moyen la ligne 3 illustre-t-elle ?',
          a: 'la terreur contre les opposants',
          wrong: [
            { label: 'la liberté d’expression', why: 'Les critiques sont punies.' },
            { label: 'la grève', why: 'La ligne ne parle pas d’arrêt du travail.' },
            { label: 'le suffrage universel', why: 'La ligne ne parle pas d’élection.' },
          ],
          ...PREUVES.terreur,
          explain: 'La terreur réduit au silence les opposants.',
        },
      ],
    },
    {
      title: 'Une frise de classe',
      lines: [
        'Une élève résume : « Pendant la Grande Guerre, la Russie connaît une révolution. »',
        '« Quelques années plus tard, un dirigeant s’impose et collectivise les terres. »',
        '« En Allemagne, la crise de 1929 favorise ensuite l’arrivée au pouvoir d’un parti raciste. »',
      ],
      qs: [
        {
          q: 'Quel dirigeant la ligne 2 désigne-t-elle ?',
          a: 'Staline',
          wrong: [
            { label: 'Mussolini', why: 'Mussolini dirige l’Italie, pas la Russie.' },
            { label: 'Hitler', why: 'Hitler dirige l’Allemagne, dont parle la ligne 3.' },
            { label: 'Poincaré', why: 'Poincaré est un président français.' },
          ],
          ...PREUVES.collectivisation,
          explain: 'Staline lance la collectivisation.',
        },
        {
          q: 'En réutilisant la crise de 1929 : quel régime la ligne 3 évoque-t-elle ?',
          a: 'le régime nazi',
          wrong: [
            { label: 'le régime fasciste italien', why: 'Il s’installe dès 1922, en Italie.' },
            { label: 'le régime soviétique', why: 'Il naît de la révolution russe de 1917.' },
            { label: 'le Front populaire', why: 'C’est une alliance française contre le fascisme.' },
          ],
          ...PREUVES.depression,
          explain: 'Après la Grande Dépression, le régime nazi s’impose.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [guerreTotale, genocideArmeniens, democraties, totalitaires];

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'troisième'));
