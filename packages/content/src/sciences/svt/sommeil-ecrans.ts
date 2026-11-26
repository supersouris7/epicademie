import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-nerveux.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— Sommeil et écrans : une condition du bon fonctionnement du système nerveux ———

const DEFS = {
  sommeil: 'une baisse de l’état de conscience qui sépare deux périodes d’éveil',
  'sommeil lent': 'la phase du repos nocturne caractérisée par des ondes cérébrales lentes',
  'sommeil paradoxal':
    'la phase du repos nocturne où l’activité du cerveau ressemble à celle de l’éveil et où le tonus des muscles disparaît',
  mélatonine: 'l’hormone produite dans l’obscurité, qui favorise l’endormissement',
  'horloge biologique': 'le mécanisme interne, situé dans le cerveau, qui impose un rythme à l’organisme',
  'rythme circadien': 'un rythme d’environ 24 heures',
  'lumière bleue': 'la lumière, abondante dans les écrans, qui freine l’hormone de l’endormissement',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  sommeil: 'Repère : il alterne avec l’éveil.',
  'sommeil lent': 'Repère : le nom renvoie à la forme des ondes du cerveau.',
  'sommeil paradoxal': 'Repère : le cerveau est actif alors que le corps est immobile.',
  mélatonine: 'Repère : elle est fabriquée quand il fait sombre.',
  'horloge biologique': 'Repère : elle donne l’heure intérieure.',
  'rythme circadien': 'Repère : il revient environ une fois par jour.',
  'lumière bleue': 'Repère : les écrans en émettent beaucoup.',
};

const INDICE = 'Demande-toi s’il s’agit d’un état, d’une phase, d’une hormone, d’un rythme ou d’une lumière.';

const saisie = saisieur(DEFS, INDICE);

export const sommeilEcrans: Skill = {
  id: 'v4-sommeil-ecrans',
  title: 'Sommeil et écrans',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **sommeil** aide le cerveau à consolider et trier ce qu’on a appris ; de 14 à 17 ans, Santé publique France recommande 9 à 10 heures par nuit.',
      'Le soir, la lumière des écrans freine la **mélatonine** et retarde l’**horloge biologique** : on s’endort plus tard. Coupe-les au moins une heure avant de dormir.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Activité cérébrale ; hygiène de vie : conditions d’un bon fonctionnement du système nerveux ».`,
    sources: [PROGRAMME, 'inserm-sommeil', 'inserm-chronobiologie', 'spf-sommeil-enjeux'],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['sommeil', 'mélatonine', 'horloge biologique'],
    cas: [
      {
        prompt: 'Quelle habitude favorise un endormissement à l’heure ?',
        bonne: 'arrêter les écrans au moins une heure avant de se coucher',
        fausses: [
          ['regarder des vidéos dans son lit', 'La lumière des écrans retarde l’endormissement.'],
          ['garder le téléphone allumé près de l’oreiller', 'Les notifications maintiennent en éveil.'],
          ['laisser une lumière vive allumée la nuit', 'La lumière freine la mélatonine.'],
        ],
        indice: 'Pense à la lumière le soir.',
        explication: ['L’Inserm conseille d’interrompre les écrans au moins une heure avant de dormir.'],
      },
      {
        prompt: 'Quel effet a la lumière des écrans utilisés tard le soir ?',
        bonne: 'elle retarde l’endormissement',
        fausses: [
          ['elle fait dormir plus tôt', 'La lumière du soir retarde l’horloge biologique.'],
          ['elle augmente la production de mélatonine', 'La lumière la freine.'],
          ['elle remplace le sommeil', 'Aucune lumière ne remplace le sommeil.'],
        ],
        indice: 'Réfléchis à ce que fait la lumière sur l’hormone de l’endormissement.',
        explication: ['La lumière bleue stimule des cellules de la rétine et retarde l’endormissement.'],
      },
      {
        prompt: 'Dans quelles conditions la mélatonine est-elle produite ?',
        bonne: 'dans l’obscurité',
        fausses: [
          ['en pleine lumière', 'La lumière perçue par la rétine freine sa production.'],
          ['uniquement pendant un effort sportif', 'Elle est liée à l’alternance jour-nuit.'],
          ['uniquement après un repas', 'La lumière est le facteur déterminant ici.'],
        ],
        indice: 'Elle est surnommée l’hormone du sommeil.',
        explication: ['La mélatonine est produite en situation d’obscurité.'],
      },
      {
        prompt: 'Selon Santé publique France, quelle durée de sommeil est recommandée de 14 à 17 ans ?',
        bonne: 'de 9 à 10 heures',
        fausses: [
          ['de 5 à 6 heures', 'C’est très en dessous de la recommandation.'],
          ['de 6 à 7 heures', 'C’est encore insuffisant à cet âge.'],
          ['de 13 à 14 heures', 'La recommandation est moins élevée.'],
        ],
        indice: 'Un adolescent a besoin de plus d’heures qu’on ne le croit souvent.',
        explication: ['La recommandation est de 9 à 10 heures pour les 14-17 ans.'],
      },
      {
        prompt: 'Que se passe-t-il pour les informations apprises pendant la nuit ?',
        bonne: 'le cerveau les consolide et les trie',
        fausses: [
          ['elles sont toutes effacées', 'Le sommeil aide au contraire à les mémoriser.'],
          ['elles sont stockées dans les muscles', 'La mémoire concerne le cerveau.'],
          ['le cerveau s’arrête complètement', 'Le cerveau reste actif en dormant.'],
        ],
        indice: 'Le sommeil est utile à la mémoire.',
        explication: ['Pendant le sommeil, le cerveau consolide, réorganise et trie les informations apprises.'],
      },
    ],
    rangements: [
      {
        prompt: 'Range la chaîne d’effets d’un écran utilisé tard le soir.',
        suite: [
          'on utilise un écran tard le soir',
          'des cellules de la rétine sont stimulées par la lumière bleue',
          'la production de mélatonine est freinée',
          'l’endormissement est retardé',
          'avec un lever à heure fixe, la nuit est écourtée',
        ],
        indice: 'La lumière agit d’abord sur l’œil.',
        explication:
          'La lumière agit sur la rétine, puis sur l’hormone, puis sur l’endormissement et la durée de la nuit.',
      },
      {
        prompt: 'Range les stades d’un premier cycle de la nuit.',
        suite: [
          'transition entre veille et sommeil',
          'sommeil lent léger',
          'sommeil lent profond',
          'sommeil paradoxal',
        ],
        indice: 'Le sommeil lent précède le sommeil paradoxal.',
        explication: 'Un cycle comporte des phases de sommeil lent puis de sommeil paradoxal.',
      },
    ],
    trous: [
      {
        prompt: 'Complète : la composition d’une nuit.',
        parts: ['La nuit est une succession de cycles : du sommeil ', ', puis du sommeil ', '.'],
        choix: [
          [['lent', 'artificiel', 'éveillé'], 0],
          [['paradoxal', 'artificiel', 'éveillé'], 0],
        ],
        indice: 'Le premier a des ondes lentes.',
        explication: 'Chaque cycle comporte du sommeil lent puis du sommeil paradoxal.',
      },
      {
        prompt: 'Complète : la mélatonine et la lumière.',
        parts: ['La mélatonine est produite dans l’', ' ; la lumière ', ' sa production.'],
        choix: [
          [['obscurité', 'éveil', 'effort'], 0],
          [['freine', 'augmente', 'ne modifie pas'], 0],
        ],
        indice: 'Elle accompagne la tombée de la nuit.',
        explication: 'L’obscurité permet la production, la lumière perçue par la rétine l’inhibe.',
      },
      {
        prompt: 'Complète : l’horloge biologique.',
        parts: [
          'L’horloge biologique règle des rythmes d’environ ',
          ' heures ; son synchroniseur le plus puissant est la ',
          '.',
        ],
        choix: [
          [['24', '12', '48'], 0],
          [['lumière', 'musique', 'soif'], 0],
        ],
        indice: 'Pense à l’alternance jour-nuit.',
        explication: 'Le rythme est proche d’une journée et la lumière le remet à l’heure.',
      },
    ],
    faciles: [
      saisie('sommeil', ['le'], ['mélatonine', 'horloge biologique']),
      saisie('mélatonine', ['la'], ['horloge biologique', 'lumière bleue']),
      saisie('sommeil paradoxal', ['le'], ['sommeil lent', 'sommeil']),
    ],
    saisies: [
      saisie('sommeil lent', ['le'], ['sommeil paradoxal', 'sommeil']),
      saisie('sommeil paradoxal', ['le'], ['sommeil lent', 'rythme circadien']),
      saisie('mélatonine', ['la'], ['lumière bleue', 'sommeil']),
      saisie(
        'horloge biologique',
        ['l’', 'une'],
        ['mélatonine', 'rythme circadien'],
        ['horloge interne', 'l’horloge interne'],
      ),
      saisie(
        'rythme circadien',
        ['le', 'un'],
        ['horloge biologique', 'sommeil'],
        ['cycle circadien', 'le cycle circadien', 'un cycle circadien', 'rythmes circadiens'],
      ),
    ],
    series: [
      [
        ['sommeil lent', 'phase aux ondes cérébrales lentes'],
        ['sommeil paradoxal', 'activité cérébrale proche de l’éveil, corps sans tonus'],
        ['mélatonine', 'hormone liée à l’obscurité'],
        ['lumière du matin', 'avance l’horloge biologique'],
        ['lumière du soir', 'retarde l’horloge biologique'],
      ],
      [
        ['manque de sommeil', 'augmente le risque d’irritabilité'],
        ['puberté', 'décale naturellement les rythmes vers le soir'],
        ['écrans avant de dormir', 'apportent de la lumière bleue le soir'],
        ['horloge biologique', 'située dans le cerveau'],
        ['rythme circadien', 'dure environ 24 heures'],
      ],
    ],
    pieges: [
      {
        prompt: 'Que se passe-t-il pendant le sommeil paradoxal ?',
        bonne: 'le cerveau est actif comme à l’éveil, alors que le tonus musculaire disparaît',
        fausses: [
          ['le cerveau est au repos total', 'Son activité est proche de celle de l’éveil.'],
          ['le corps bouge autant qu’à l’éveil', 'Le tonus musculaire est aboli.'],
          ['les ondes sont toutes lentes et profondes', 'Les ondes lentes caractérisent le sommeil lent.'],
        ],
        indice: 'Le mot « paradoxal » annonce un contraste entre cerveau et muscles.',
        explication: ['L’activité cérébrale ressemble à celle de l’éveil ; les muscles sont sans tonus.'],
      },
      {
        prompt: 'Un filtre anti-lumière bleue suffit-il à protéger le sommeil, selon l’Inserm ?',
        bonne: 'ce n’est pas démontré : son intérêt reste à vérifier',
        fausses: [
          ['oui, c’est prouvé depuis longtemps', 'Ces dispositifs n’ont pas été évalués scientifiquement.'],
          ['oui, il permet de dormir moins', 'Aucun filtre ne réduit le besoin de sommeil.'],
          ['oui, il remplace l’arrêt des écrans', 'L’Inserm recommande de réduire et d’interrompre les écrans.'],
        ],
        indice: 'Un outil non évalué ne permet pas de conclure.',
        explication: ['L’Inserm indique que ces dispositifs n’ont pas été évalués scientifiquement.'],
      },
      {
        prompt: 'Pourquoi beaucoup d’adolescents s’endorment-ils plus tard, même avant d’ajouter les écrans ?',
        bonne: 'les rythmes biologiques se décalent naturellement à la puberté',
        fausses: [
          ['les adolescents n’ont plus besoin de dormir', 'Ils ont encore besoin d’environ 9 à 10 heures.'],
          ['la mélatonine disparaît à la puberté', 'Elle reste produite, avec un rythme décalé.'],
          ['l’horloge biologique s’arrête', 'Elle continue de fonctionner.'],
        ],
        indice: 'Pense à ce qui change dans le corps à cet âge.',
        explication: ['La puberté s’accompagne d’un décalage naturel des rythmes biologiques.'],
      },
    ],
    dossiers: [
      {
        titre: 'Carnet de sommeil (fictif)',
        lignes: [
          'Carnet (inventé) d’une élève de 14 ans.',
          'Les soirs de semaine, elle regarde des vidéos au lit jusqu’à 23 h 30, puis s’endort.',
          'Elle se lève à 6 h 30 et somnole souvent en cours.',
        ],
        questions: [
          {
            prompt: 'Combien d’heures dort-elle au maximum ces soirs-là ?',
            bonne: '7 heures',
            fausses: [
              ['9 heures', 'De 23 h 30 à 6 h 30, il n’y a pas 9 heures.'],
              ['6 heures', 'Il y a une heure de plus entre 23 h 30 et 6 h 30.'],
              ['10 heures', 'Cette durée ne correspond pas au carnet.'],
            ],
            indice: 'Compte de 23 h 30 à 6 h 30.',
            explication: ['De 23 h 30 à 6 h 30, il y a 7 heures, sous les 9 à 10 heures recommandées.'],
          },
          {
            prompt: 'Quel changement agit sur la cause la plus visible dans ce carnet ?',
            bonne: 'arrêter les écrans au moins une heure avant de dormir et se coucher plus tôt',
            fausses: [
              ['augmenter la luminosité de l’écran', 'Plus de lumière retarde davantage l’endormissement.'],
              ['se lever encore plus tôt', 'La nuit serait plus courte.'],
              ['ne rien changer puisqu’elle dort la nuit', 'La durée est inférieure à la recommandation.'],
            ],
            indice: 'Relis la deuxième ligne du carnet.',
            explication: ['La vidéo au lit retarde le coucher et la lumière retarde l’endormissement.'],
          },
        ],
      },
      {
        titre: 'Essai en deux groupes (fictif)',
        lignes: [
          'Essai (inventé) sur une semaine.',
          'Groupe A : deux heures d’écran avant de dormir. Groupe B : un livre papier.',
          'Les élèves du groupe A se sont endormis en moyenne plus tard que ceux du groupe B.',
        ],
        questions: [
          {
            prompt: 'Quelle conclusion s’appuie sur ce seul essai ?',
            bonne: 'dans cet essai, les écrans du soir vont avec un endormissement plus tardif',
            fausses: [
              ['les écrans du soir font dormir plus tôt', 'Le résultat montre l’inverse.'],
              ['le livre papier empêche de dormir', 'Le groupe B s’endort plus tôt.'],
              ['tous les élèves ont exactement le même sommeil', 'Les moyennes diffèrent.'],
            ],
            indice: 'Compare les heures moyennes des deux groupes.',
            explication: ['La différence observée est un endormissement plus tardif avec les écrans.'],
          },
          {
            prompt: 'Quelle hormone permet d’expliquer ce résultat ?',
            bonne: 'la mélatonine, freinée par la lumière',
            fausses: [
              ['l’insuline, produite par le pancréas', 'Elle agit sur le sucre du sang.'],
              ['la testostérone', 'C’est une hormone sexuelle.'],
              ['la mélatonine, augmentée par la lumière', 'La lumière la freine.'],
            ],
            indice: 'C’est l’hormone de l’endormissement.',
            explication: ['La lumière bleue des écrans limite la production de mélatonine.'],
          },
        ],
      },
    ],
  }),
};
