import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-nerveux.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— Le réflexe : une réponse involontaire dont le centre nerveux peut être la moelle épinière ———

const DEFS = {
  réflexe: 'une réponse involontaire, immédiate et prévisible à un stimulus précis',
  stimulus: 'un agent, comme la lumière ou la chaleur, capable de provoquer une réponse de l’organisme',
  'arc réflexe': 'le trajet du message, du récepteur au centre nerveux puis jusqu’à l’organe qui répond',
  'moelle épinière': 'le centre nerveux logé dans la colonne vertébrale',
  effecteur: 'l’organe, par exemple un muscle, qui exécute la réponse',
  'nerf sensitif': 'le nerf qui conduit le message vers le centre nerveux',
  'nerf moteur': 'le nerf qui conduit le message du centre nerveux vers le muscle',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  réflexe: 'Repère : on ne le décide pas.',
  stimulus: 'Repère : c’est ce qui déclenche la réponse.',
  'arc réflexe': 'Repère : c’est un trajet, pas un organe.',
  'moelle épinière': 'Repère : elle est protégée par les vertèbres.',
  effecteur: 'Repère : il agit à la fin du trajet.',
  'nerf sensitif': 'Repère : il apporte l’information au centre.',
  'nerf moteur': 'Repère : il porte la commande vers le muscle.',
};

const INDICE = 'Repère s’il s’agit d’une réponse, de ce qui la déclenche, d’un trajet, d’un nerf ou d’un organe.';

const saisie = saisieur(DEFS, INDICE);

export const reflexe: Skill = {
  id: 'v4-reflexe',
  title: 'Le réflexe',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **réflexe** est une réponse involontaire et rapide à un **stimulus** : on retire la main d’une plaque brûlante avant d’avoir perçu la douleur.',
      'Le message suit un trajet : récepteur, nerf sensitif, centre nerveux (par exemple la **moelle épinière**), nerf moteur, muscle.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Message nerveux, centres nerveux, nerfs, cellules nerveuses ».`,
    sources: [PROGRAMME, 'academie-reflexe', 'academie-nerf', 'academie-moelle', 'cnrtl-stimulus', 'inserm-douleur'],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['réflexe', 'stimulus', 'effecteur'],
    cas: [
      {
        prompt: 'Laquelle de ces actions est un réflexe ?',
        bonne: 'retirer sa main d’une plaque brûlante avant même d’avoir mal',
        fausses: [
          ['écrire son nom', 'On décide d’écrire : c’est un mouvement volontaire.'],
          ['choisir un dessert', 'C’est un choix.'],
          ['répondre à une question en classe', 'On réfléchit avant de répondre.'],
        ],
        indice: 'Cherche la réponse qu’on ne décide pas.',
        explication: ['Un réflexe est involontaire, immédiat et prévisible.'],
      },
      {
        prompt: 'Main sur une surface brûlante : quel événement arrive en premier ?',
        bonne: 'la main est retirée',
        fausses: [
          ['la douleur est perçue', 'La main est retirée avant ce décryptage par le cerveau.'],
          ['la personne choisit ce qu’elle va faire', 'Le retrait ne résulte pas d’un choix.'],
          ['le muscle attend une décision', 'La réponse ne dépend pas d’une décision.'],
        ],
        indice: 'Le trajet le plus court agit avant la perception.',
        explication: ['La main est dégagée avant que le cerveau ait identifié la douleur.'],
      },
      {
        prompt: 'Une main touche une surface brûlante et se retire aussitôt. Quel centre nerveux permet ce réflexe ?',
        bonne: 'la moelle épinière',
        fausses: [
          ['le muscle du bras', 'Le muscle exécute la réponse : ce n’est pas un centre nerveux.'],
          ['la peau', 'La peau porte des récepteurs.'],
          ['le cœur', 'Le cœur assure la circulation du sang.'],
        ],
        indice: 'Ni la peau ni le muscle : quelle partie reçoit le message et élabore la réponse ?',
        explication: ['L’arc réflexe se situe au sein de la moelle épinière.'],
      },
      {
        prompt: 'Qu’est-ce qui distingue un réflexe d’un mouvement volontaire ?',
        bonne: 'il se produit sans qu’on le décide',
        fausses: [
          ['il n’a besoin d’aucun message nerveux', 'Un réflexe repose sur un message nerveux.'],
          ['il n’utilise aucun muscle', 'La réponse peut être une contraction musculaire.'],
          ['il dépend du choix de la personne', 'Au contraire, il est involontaire.'],
        ],
        indice: 'Pense à la volonté.',
        explication: ['Le réflexe est involontaire, alors que le mouvement volontaire est décidé.'],
      },
      {
        prompt: 'Qu’est-ce qu’un réflexe conditionné ?',
        bonne: 'un réflexe acquis par apprentissage',
        fausses: [
          ['un réflexe présent chez tous dès la naissance', 'Le réflexe conditionné s’acquiert.'],
          ['une décision prise après réflexion', 'Un réflexe reste involontaire.'],
          ['une maladie des nerfs', 'C’est un mode de réponse, pas une maladie.'],
        ],
        indice: 'Le mot « conditionné » évoque un entraînement ou une expérience répétée.',
        explication: ['Les réflexes conditionnés sont acquis par apprentissage.'],
      },
    ],
    rangements: [
      {
        prompt: 'Range les étapes d’un arc réflexe.',
        suite: [
          'un stimulus agit sur un récepteur',
          'le nerf sensitif conduit le message vers la moelle épinière',
          'la moelle épinière élabore la réponse',
          'le nerf moteur conduit le message vers le muscle',
          'le muscle se contracte',
        ],
        indice: 'Commence par ce qui déclenche et termine par l’action.',
        explication: 'Le trajet va du récepteur au centre nerveux, puis à l’effecteur.',
      },
      {
        prompt: 'Main sur une surface brûlante : range les événements.',
        suite: [
          'la main touche la surface brûlante',
          'la main est retirée grâce à la moelle épinière',
          'le cerveau identifie la douleur',
        ],
        indice: 'Le retrait n’attend pas la perception.',
        explication: 'La main est retirée avant que la douleur soit identifiée par le cerveau.',
      },
    ],
    trous: [
      {
        prompt: 'Complète la définition.',
        parts: ['Un réflexe est une réponse ', ' à un stimulus ; elle est immédiate et ', '.'],
        choix: [
          [['involontaire', 'décidée', 'facultative'], 0],
          [['prévisible', 'imprévisible', 'lente'], 0],
        ],
        indice: 'La volonté n’intervient pas, et on peut s’attendre à la réponse.',
        explication: 'Ces caractères distinguent un réflexe d’une action choisie.',
      },
      {
        prompt: 'Complète : les nerfs de l’arc réflexe.',
        parts: [
          'Le message va du récepteur au centre nerveux par le nerf ',
          ', puis du centre nerveux au muscle par le nerf ',
          '.',
        ],
        choix: [
          [['sensitif', 'moteur', 'optique'], 0],
          [['sensitif', 'moteur', 'optique'], 1],
        ],
        indice: 'L’un apporte l’information, l’autre commande.',
        explication: 'Le nerf sensitif entre dans le centre ; le nerf moteur en repart.',
      },
      {
        prompt: 'Complète : le retrait de la main.',
        parts: [
          'Lors du retrait, le centre nerveux de l’arc réflexe est la ',
          ' ; la douleur est identifiée ensuite par le ',
          '.',
        ],
        choix: [
          [['moelle épinière', 'moelle osseuse', 'peau'], 0],
          [['cerveau', 'muscle', 'cœur'], 0],
        ],
        indice: 'Un centre dans le dos, un autre dans la tête.',
        explication: 'La moelle épinière permet la réponse rapide ; le cerveau identifie la douleur.',
      },
    ],
    faciles: [
      saisie('réflexe', ['un', 'le'], ['stimulus', 'effecteur'], ['réflexes', 'un acte réflexe']),
      saisie(
        'stimulus',
        ['un', 'le'],
        ['réflexe', 'effecteur'],
        ['stimuli', 'les stimuli', 'stimulation', 'une stimulation'],
      ),
      saisie('nerf moteur', ['le', 'un'], ['nerf sensitif', 'effecteur'], ['nerfs moteurs']),
    ],
    saisies: [
      saisie('arc réflexe', ['l’', 'un'], ['réflexe', 'stimulus'], ['arcs réflexes']),
      saisie('moelle épinière', ['la'], ['arc réflexe', 'effecteur'], ['moelle', 'la moelle']),
      saisie('effecteur', ['l’', 'un'], ['stimulus', 'nerf moteur'], ['organe effecteur', 'l’organe effecteur']),
      saisie(
        'nerf sensitif',
        ['le', 'un'],
        ['nerf moteur', 'moelle épinière'],
        ['nerfs sensitifs', 'nerf sensoriel', 'le nerf sensoriel', 'un nerf sensoriel'],
      ),
    ],
    series: [
      [
        ['stimulus', 'déclenche la réponse'],
        ['récepteur', 'détecte la stimulation et produit un message'],
        ['nerf sensitif', 'conduit le message vers le centre nerveux'],
        ['nerf moteur', 'conduit le message vers le muscle'],
        ['muscle', 'se contracte pour réaliser la réponse'],
      ],
      [
        ['réflexe conditionné', 'est acquis par apprentissage'],
        ['réflexe archaïque', 'existe chez le nouveau-né puis disparaît dans les premiers mois'],
        ['réflexe médullaire', 'fait intervenir la moelle épinière'],
        ['mouvement volontaire', 'est décidé par la personne'],
        ['arc réflexe', 'désigne le trajet suivi par le message'],
      ],
    ],
    pieges: [
      {
        prompt: 'Un camarade affirme : « un réflexe ne passe par aucun centre nerveux. » Qu’en penser ?',
        bonne: 'c’est faux : le message passe par un centre nerveux, comme la moelle épinière',
        fausses: [
          ['c’est vrai : le nerf sensitif commande directement le muscle', 'Le trajet passe par un centre nerveux.'],
          ['c’est vrai : un réflexe n’utilise pas de nerf', 'Il utilise les nerfs sensitif et moteur.'],
          [
            'c’est faux : seul le cerveau commande tous les réflexes',
            'La moelle épinière intervient dans des réflexes.',
          ],
        ],
        indice: 'Relis les étapes de l’arc réflexe.',
        explication: ['L’arc réflexe relie le récepteur à l’effecteur en passant par un centre nerveux.'],
      },
      {
        prompt: 'Pourquoi la main est-elle retirée avant que la douleur soit identifiée ?',
        bonne: 'la réponse passe par la moelle épinière et ne dépend pas de l’identification par le cerveau',
        fausses: [
          ['la douleur n’existe pas', 'Elle est bien identifiée ensuite par le cerveau.'],
          ['les muscles perçoivent la douleur avant le cerveau', 'Les muscles exécutent la réponse.'],
          ['aucun message ne part de la peau', 'Les récepteurs de la peau envoient un message.'],
        ],
        indice: 'Compare les deux trajets du message.',
        explication: ['L’arc réflexe est situé dans la moelle épinière ; la perception vient du cerveau.'],
      },
      {
        prompt: 'Le réflexe de succion d’un nouveau-né est un réflexe archaïque. Que signifie « archaïque » ici ?',
        bonne: 'il est observable chez le nouveau-né et disparaît dans les premiers mois de la vie',
        fausses: [
          ['il est acquis à l’école', 'Il est présent chez le nouveau-né.'],
          ['il apparaît à la puberté', 'Il concerne le début de la vie.'],
          ['il est décidé par le bébé', 'Un réflexe est involontaire.'],
        ],
        indice: 'Pense au moment de la vie où on le voit.',
        explication: ['Les réflexes archaïques se voient chez le nouveau-né puis disparaissent.'],
      },
    ],
    dossiers: [
      {
        titre: 'Observation « coup sous la rotule »',
        lignes: [
          'Observation (inventée) faite en cours.',
          'Un élève est assis, jambe pendante ; on lui donne un petit coup sous la rotule.',
          'À chaque essai, la jambe se tend sans qu’il l’ait décidé.',
        ],
        questions: [
          {
            prompt: 'Quels indices montrent qu’il s’agit d’un réflexe ?',
            bonne: 'la réponse est involontaire et se reproduit de façon prévisible',
            fausses: [
              ['l’élève choisit de tendre sa jambe', 'Le document précise qu’il ne décide pas.'],
              ['la réponse change à chaque essai', 'Elle se reproduit à chaque essai.'],
              ['la jambe se tend sans aucun message nerveux', 'Un réflexe repose sur un message nerveux.'],
            ],
            indice: 'Relis la dernière ligne.',
            explication: ['Involontaire et prévisible : ce sont les caractères d’un réflexe.'],
          },
          {
            prompt: 'Dans cette observation, quel est le stimulus ?',
            bonne: 'le petit coup sous la rotule',
            fausses: [
              ['la jambe qui se tend', 'C’est la réponse.'],
              ['le nerf moteur', 'C’est une voie du message.'],
              ['la position assise', 'Elle ne déclenche pas la réponse à elle seule.'],
            ],
            indice: 'Cherche ce qui déclenche la réponse.',
            explication: ['Le stimulus est l’agent qui provoque la réponse.'],
          },
        ],
      },
      {
        titre: 'Mesures « deux réponses »',
        lignes: [
          'Mesures (inventées) sur un même élève.',
          'Réponse A : la main s’écarte d’une surface très chaude en 0,1 seconde.',
          'Réponse B : il appuie sur un bouton quand il décide qu’une image lui plaît, en 0,6 seconde.',
        ],
        questions: [
          {
            prompt: 'Quelle réponse est un réflexe, et pourquoi ?',
            bonne: 'la réponse A : elle est immédiate et ne demande pas de décision',
            fausses: [
              ['la réponse B : elle est décidée', 'Une décision exclut le réflexe.'],
              ['la réponse B : elle utilise un bouton', 'L’objet utilisé ne fait pas un réflexe.'],
              ['les deux : elles utilisent des muscles', 'Utiliser des muscles ne suffit pas.'],
            ],
            indice: 'Cherche la réponse sans choix.',
            explication: ['La réponse A est involontaire et rapide.'],
          },
          {
            prompt: 'Dans la réponse A, par quel type de nerf le message parvient-il aux muscles du bras ?',
            bonne: 'par un nerf moteur',
            fausses: [
              ['par un nerf sensitif', 'Il conduit le message vers le centre nerveux.'],
              ['par le nerf optique', 'Il relie l’œil au cerveau.'],
              ['par une artère', 'Elle transporte du sang.'],
            ],
            indice: 'Repense au sens du message : du centre vers le muscle.',
            explication: ['Le nerf moteur conduit le message du centre nerveux vers le muscle.'],
          },
        ],
      },
    ],
  }),
};
