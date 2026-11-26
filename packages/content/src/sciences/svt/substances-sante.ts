import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-nerveux.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— Substances et santé : perturbations du système nerveux, dépendance, dopage ———

const DEFS = {
  addiction:
    'la maladie marquée par une perte de contrôle face à une substance ou à un comportement, malgré les conséquences négatives',
  'substance psychoactive':
    'une substance qui agit sur le cerveau et modifie les perceptions, l’humeur ou le comportement',
  nicotine: 'la substance du tabac qui entraîne la dépendance',
  tolérance: 'le fait qu’il faut des quantités plus grandes pour obtenir le même effet',
  sevrage: 'l’arrêt de la consommation d’une substance dont on est dépendant',
  dopage: 'la prise ou l’administration d’un produit stimulant avant une épreuve sportive',
  'tabagisme passif': 'le fait d’inhaler la fumée de tabac dégagée par d’autres fumeurs',
  craving: 'une envie intense et difficile à contrôler de consommer',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  addiction: 'Repère : la personne ne parvient plus à contrôler.',
  'substance psychoactive': 'Repère : elle modifie le fonctionnement du cerveau.',
  nicotine: 'Repère : elle se trouve dans le tabac.',
  tolérance: 'Repère : l’organisme réagit moins à la même quantité.',
  sevrage: 'Repère : il s’agit d’un arrêt.',
  dopage: 'Repère : le contexte est une compétition.',
  'tabagisme passif': 'Repère : la personne exposée ne fume pas elle-même.',
  craving: 'Repère : c’est une envie pressante.',
};

const INDICE = 'Demande-toi s’il s’agit d’un produit, d’un effet sur l’organisme, d’une maladie ou d’un arrêt.';

const saisie = saisieur(DEFS, INDICE);

export const substancesSante: Skill = {
  id: 'v4-substances-sante',
  title: 'Substances et santé',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Alcool, tabac ou cannabis sont des **substances psychoactives** : ils agissent sur le cerveau ; l’alcool, par exemple, augmente le temps de réaction.',
      'Consommer de façon répétée peut mener à l’**addiction** : on perd le contrôle. Le **dopage** consiste à prendre un produit stimulant avant une épreuve sportive.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « perturbations par certaines situations ou consommations (seuils, excès, dopage, limites et effets de l’entraînement) ».`,
    sources: [
      PROGRAMME,
      'inserm-addictions',
      'inserm-alcool-sante',
      'spf-tabac-sante',
      'spf-alcool-risques',
      'spf-drogues-enjeux',
      'academie-dopage',
      'cnrtl-psychotrope',
    ],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['addiction', 'nicotine', 'dopage'],
    cas: [
      {
        prompt: 'Quelle situation évoque une addiction ?',
        bonne: 'ne plus réussir à arrêter une pratique malgré ses conséquences négatives',
        fausses: [
          ['boire de l’eau quand on a soif', 'C’est un besoin normal de l’organisme.'],
          ['faire du sport une fois par semaine', 'Une pratique contrôlée n’est pas une addiction.'],
          ['regarder une seule fois un film', 'Une expérience unique ne montre pas une perte de contrôle.'],
        ],
        indice: 'Cherche la perte de contrôle.',
        explication: ['L’addiction se caractérise par une perte progressive de contrôle.'],
      },
      {
        prompt: 'Une addiction peut-elle exister sans consommer de produit ?',
        bonne: 'oui, par exemple avec les jeux d’argent',
        fausses: [
          ['non, il faut toujours une substance', 'Certains comportements peuvent devenir addictifs.'],
          [
            'non, seuls les médicaments créent des addictions',
            'Les addictions concernent plusieurs substances et comportements.',
          ],
          ['oui, mais seulement chez les enfants', 'Les adultes peuvent aussi être concernés.'],
        ],
        indice: 'L’addiction peut viser un comportement.',
        explication: ['L’Inserm cite des comportements, comme les jeux de hasard et d’argent.'],
      },
      {
        prompt: 'Après avoir consommé de l’alcool, que devient le temps de réaction ?',
        bonne: 'il augmente : on réagit moins vite',
        fausses: [
          ['il diminue : on réagit plus vite', 'L’alcool ralentit les réactions.'],
          ['il ne change jamais', 'Les effets commencent dès le premier verre.'],
          ['il devient nul', 'Un temps de réaction ne disparaît pas.'],
        ],
        indice: 'Un temps plus long signifie une réaction plus lente.',
        explication: ['L’alcool augmente le temps de réaction et diminue la vigilance.'],
      },
      {
        prompt: 'Quelle substance du tabac entraîne la dépendance ?',
        bonne: 'la nicotine',
        fausses: [
          [
            'le monoxyde de carbone',
            'C’est un gaz toxique de la fumée, mais la dépendance vient d’une autre substance.',
          ],
          ['les goudrons', 'Ils sont toxiques ; la dépendance vient d’une autre substance.'],
          ['le plomb', 'C’est un métal lourd présent dans la fumée.'],
        ],
        indice: 'Cherche la substance qui pousse à fumer de nouveau.',
        explication: ['La nicotine est la substance qui entraîne la dépendance.'],
      },
      {
        prompt: 'Pour un adolescent, quelle option face à l’alcool est la plus sûre selon l’Inserm ?',
        bonne: 'ne pas en consommer',
        fausses: [
          ['en boire un verre chaque jour', 'La consommation est déconseillée à cet âge.'],
          ['ne pas dépasser dix verres par semaine', 'Ce repère concerne les adultes qui consomment.'],
          ['concentrer les verres sur le week-end', 'Les consommations importantes en une occasion sont risquées.'],
        ],
        indice: 'Le cerveau des adolescents est encore en maturation.',
        explication: ['Pendant l’adolescence, l’option la plus sûre est de ne pas consommer d’alcool.'],
      },
    ],
    rangements: [
      {
        prompt: 'Range les étapes d’installation d’une addiction.',
        suite: [
          'une consommation active le circuit de la récompense du cerveau',
          'la consommation se répète',
          'il faut de plus grandes quantités pour obtenir le même effet',
          'la personne perd le contrôle malgré les conséquences négatives',
        ],
        indice: 'Tout commence par l’effet ressenti, la perte de contrôle vient ensuite.',
        explication: 'La répétition modifie le circuit de la récompense, puis le contrôle se perd.',
      },
      {
        prompt: 'Range le trajet de l’alcool et ses effets.',
        suite: [
          'la boisson alcoolisée est avalée',
          'l’éthanol (l’alcool de la boisson) passe dans le sang par le tube digestif',
          'le sang apporte l’éthanol au cerveau',
          'le temps de réaction augmente',
        ],
        indice: 'Le produit doit atteindre le cerveau pour agir sur les réactions.',
        explication: 'L’éthanol passe dans le sang, atteint le cerveau et modifie les réactions.',
      },
    ],
    trous: [
      {
        prompt: 'Complète : l’alcool et les réactions.',
        parts: ['L’alcool ', ' le temps de réaction et ', ' la vigilance.'],
        choix: [
          [['augmente', 'diminue', 'supprime'], 0],
          [['diminue', 'augmente', 'ne change pas'], 0],
        ],
        indice: 'On réagit moins vite et on est moins attentif.',
        explication: 'Le temps de réaction s’allonge tandis que la vigilance baisse.',
      },
      {
        prompt: 'Complète : le tabac.',
        parts: ['La ', ' du tabac entraîne la dépendance ; il n’existe pas de seuil en dessous duquel fumer est ', '.'],
        choix: [
          [['nicotine', 'mélatonine', 'salive'], 0],
          [['sans risque', 'interdit aux adultes', 'visible'], 0],
        ],
        indice: 'Pense à la substance addictive, puis au danger.',
        explication: 'La nicotine crée la dépendance et aucune dose de tabac n’est sans risque.',
      },
      {
        prompt: 'Complète : les deux tabagismes.',
        parts: [
          'Le tabagisme ',
          ' consiste à respirer la fumée des autres ; le tabagisme ',
          ' concerne la personne qui fume.',
        ],
        choix: [
          [['passif', 'actif', 'sportif'], 0],
          [['actif', 'passif', 'sportif'], 0],
        ],
        indice: 'L’un subit, l’autre agit.',
        explication: 'La personne exposée sans fumer subit le tabagisme passif.',
      },
    ],
    faciles: [
      saisie('addiction', ['l’', 'une'], ['dopage', 'nicotine'], ['dépendance', 'la dépendance', 'addictions']),
      saisie('dopage', ['le'], ['addiction', 'sevrage']),
      saisie('nicotine', ['la'], ['tolérance', 'dopage']),
    ],
    saisies: [
      saisie('tolérance', ['la'], ['sevrage', 'craving'], ['accoutumance', 'l’accoutumance']),
      saisie('sevrage', ['le', 'un'], ['craving', 'tolérance']),
      saisie('tabagisme passif', ['le'], ['nicotine', 'addiction']),
      saisie(
        'substance psychoactive',
        ['une', 'la'],
        ['nicotine', 'dopage'],
        [
          'psychotrope',
          'un psychotrope',
          'substances psychoactives',
          'psychotropes',
          'drogue',
          'une drogue',
          'la drogue',
        ],
      ),
      saisie('craving', ['le', 'un'], ['sevrage', 'tolérance']),
    ],
    series: [
      [
        ['nicotine', DEFS.nicotine],
        ['craving', DEFS.craving],
        ['tolérance', DEFS['tolérance']],
        ['sevrage', DEFS.sevrage],
        ['dopage', DEFS.dopage],
      ],
      [
        ['alcool', 'augmente le temps de réaction'],
        ['tabac', 'une personne qui fume régulièrement sur deux en meurt'],
        ['cannabis', 'drogue illicite la plus utilisée en France'],
        ['tabagisme passif', 'fumée des autres respirée'],
        ['jeux d’argent', 'comportement pouvant devenir addictif sans produit'],
      ],
    ],
    pieges: [
      {
        prompt: 'Quelqu’un dit : « fumer très peu ne présente aucun risque. » Que répondre ?',
        bonne: 'c’est faux : il n’existe pas de seuil sans risque',
        fausses: [
          ['c’est vrai sous cinq cigarettes par jour', 'Aucun seuil sans risque n’existe.'],
          ['c’est vrai chez les jeunes', 'La dépendance peut apparaître vite, même avec peu de tabac.'],
          ['c’est vrai si l’on fume dehors', 'Le tabac reste toxique.'],
        ],
        indice: 'Existe-t-il une quantité sans danger ?',
        explication: ['Santé publique France indique qu’aucun seuil ne rend le tabac sans risque.'],
      },
      {
        prompt: 'Pour les adultes, l’Inserm donne un repère de consommation d’alcool. Que signifie-t-il ?',
        bonne: 'il limite les risques, sans rendre la consommation sans danger',
        fausses: [
          ['en dessous, l’alcool est totalement sans danger', 'Il n’existe pas de seuil totalement sans danger.'],
          ['il faut atteindre cette quantité pour rester en bonne santé', 'L’alcool n’a pas de bénéfice démontré.'],
          ['il vaut aussi pour les adolescents', 'Pour eux, ne pas consommer est l’option la plus sûre.'],
        ],
        indice: 'Un repère n’est pas une garantie.',
        explication: [
          'Le repère (par exemple 10 verres standards au plus par semaine ; un verre standard contient environ 10 g d’alcool pur) vise à limiter les risques.',
        ],
      },
      {
        prompt: 'Un conducteur a consommé de l’alcool et aussi du cannabis. Qu’indique l’étude citée par l’Inserm ?',
        bonne: 'le risque d’être responsable d’un accident mortel est bien plus élevé qu’après un excès d’alcool seul',
        fausses: [
          ['le cannabis annule les effets de l’alcool', 'Les risques s’additionnent et s’aggravent.'],
          ['le risque ne change pas', 'L’étude rapporte une forte augmentation.'],
          ['le risque diminue', 'Il augmente.'],
        ],
        indice: 'Mélanger les produits n’est pas protecteur.',
        explication: [
          'Le risque est multiplié par 15 quand les deux sont associés, contre 8,5 après une prise excessive d’alcool.',
        ],
      },
    ],
    dossiers: [
      {
        titre: 'Situation « avant de conduire » (fictive)',
        lignes: [
          'Situation (inventée) pour exercice.',
          'Après avoir bu de l’alcool, un adulte veut reprendre le volant.',
          'Il déclare se sentir « en pleine forme ».',
        ],
        questions: [
          {
            prompt: 'Pourquoi son impression ne suffit-elle pas ?',
            bonne: 'l’alcool allonge le temps de réaction, même quand on ne s’en rend pas compte',
            fausses: [
              ['les effets de l’alcool apparaissent seulement le lendemain', 'Ils commencent dès le premier verre.'],
              ['se sentir en forme prouve que la réaction est rapide', 'Le ressenti peut tromper.'],
              ['l’alcool n’agit que sur les muscles des jambes', 'Il agit sur le cerveau.'],
            ],
            indice: 'Distingue ce qu’on ressent et ce que le corps fait.',
            explication: [
              'Les effets commencent dès le premier verre, parfois sans que la personne en ait conscience.',
            ],
          },
          {
            prompt:
              'Quel organe, atteint par l’éthanol (l’alcool de la boisson), commande la vigilance et le jugement ?',
            bonne: 'le cerveau',
            fausses: [
              ['la moelle osseuse', 'Elle fabrique des cellules du sang.'],
              ['le poumon', 'Il assure les échanges respiratoires.'],
              ['la peau', 'Elle protège et porte des récepteurs.'],
            ],
            indice: 'C’est un centre nerveux.',
            explication: ['L’éthanol agit sur le cerveau, qui assure la vigilance.'],
          },
        ],
      },
      {
        titre: 'Récit « un joueur » (fictif)',
        lignes: [
          'Récit (inventé) pour exercice.',
          'Une personne mise de plus en plus d’argent au jeu et n’arrive plus à s’arrêter.',
          'Elle délaisse ses amis et ses autres activités.',
        ],
        questions: [
          {
            prompt: 'Que décrit ce récit ?',
            bonne: 'une addiction à un comportement',
            fausses: [
              ['un dopage', 'Le dopage concerne un produit pris avant une épreuve sportive.'],
              ['un tabagisme passif', 'Aucune fumée de tabac n’est en cause.'],
              ['un sevrage', 'La personne ne s’arrête pas.'],
            ],
            indice: 'Aucune substance n’est citée.',
            explication: ['La perte de contrôle et le délaissement d’autres activités évoquent une addiction.'],
          },
          {
            prompt: 'Pourquoi une personne dépendante peut-elle avoir besoin de miser ou consommer davantage ?',
            bonne: 'le circuit de la récompense du cerveau devient moins sensible',
            fausses: [
              ['la moelle épinière décide à sa place', 'La moelle épinière n’explique pas ce besoin.'],
              ['les récepteurs de la peau disparaissent', 'La peau n’est pas en cause.'],
              ['le besoin vient toujours d’un manque d’eau', 'Aucun lien avec la soif.'],
            ],
            indice: 'Pense au circuit activé par la drogue ou le jeu.',
            explication: ['Quand l’addiction s’installe, le système de récompense devient moins sensible.'],
          },
        ],
      },
    ],
  }),
};
