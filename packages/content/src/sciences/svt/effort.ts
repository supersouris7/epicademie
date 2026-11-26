import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { BO_EFFORT } from './donnees-corps.ts';
import {
  associer,
  choisir,
  completer,
  ecart,
  ecrire,
  generer,
  ranger,
  surDocument,
  type Modele,
} from './nutrition-kit.ts';

// ——— Le corps en activité : l'effort musculaire (besoins des muscles, rythmes cardiaque et respiratoire, limites) ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Pendant un effort physique, comment évolue la fréquence cardiaque ?',
    'Elle augmente',
    [
      ['Elle diminue', 'Les muscles ont alors besoin de plus de dioxygène : le cœur bat plus vite.'],
      ['Elle reste forcément la même', 'L’effort modifie le fonctionnement du cœur.'],
    ],
    'Rappelle-toi ce que tu ressens dans ta poitrine quand tu cours.',
    'Au cours d’un effort, la fréquence cardiaque est modifiée : elle augmente.',
  ),
  choisir(
    'Quels organes se contractent pour produire les mouvements du corps ?',
    'Les muscles',
    [
      ['Les poumons', 'Les poumons assurent les échanges gazeux.'],
      ['Les os', 'Les os soutiennent le corps, mais ils ne se contractent pas.'],
    ],
    'Ils sont formés de fibres qui se contractent.',
    'Les muscles se contractent et produisent les mouvements.',
  ),
  choisir(
    'Pendant un effort, les muscles consomment…',
    'plus de dioxygène qu’au repos',
    [
      ['moins de dioxygène qu’au repos', 'Un muscle en activité a besoin de davantage de dioxygène.'],
      ['aucun dioxygène', 'Le dioxygène intervient pour fournir de l’énergie aux muscles.'],
    ],
    'Un muscle qui travaille a-t-il plus ou moins de besoins ?',
    'L’effort physique augmente la consommation de dioxygène.',
  ),
  choisir(
    'Pendant un effort, comment évolue la fréquence respiratoire ?',
    'Elle augmente',
    [
      ['Elle diminue', 'L’organisme a besoin de plus d’air pour apporter du dioxygène.'],
      ['Elle s’arrête', 'La respiration continue pendant tout effort.'],
    ],
    'Rappelle-toi ton souffle après un sprint.',
    'La fréquence respiratoire fait partie des paramètres modifiés par l’effort.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Que devient la consommation de dioxygène quand l’effort devient plus intense ?',
    'Elle augmente, mais elle a une limite',
    [
      [
        'Elle augmente sans aucune limite',
        'L’organisme a des limites : la consommation de dioxygène ne monte pas sans fin.',
      ],
      ['Elle diminue', 'Plus l’effort est intense, plus la consommation augmente.'],
      ['Elle ne dépend pas de l’intensité', 'La consommation dépend justement de l’intensité de l’effort.'],
    ],
    'Pense à la fois à la tendance et aux capacités de l’organisme.',
    'Plus l’effort est intense, plus la consommation de dioxygène augmente, jusqu’à une limite.',
  ),
  choisir(
    'À quoi servent l’augmentation des fréquences cardiaque et respiratoire pendant l’effort ?',
    'À mieux approvisionner les muscles en dioxygène et en nutriments',
    [
      ['À retirer tout le sang des muscles', 'Les muscles ont au contraire besoin de plus d’apports par le sang.'],
      ['À accélérer la digestion', 'Le but est d’approvisionner les muscles en activité.'],
      [
        'À empêcher les muscles de se contracter',
        'Les muscles se contractent pendant l’effort et ont besoin d’apports.',
      ],
    ],
    'Pense aux besoins des muscles qui travaillent.',
    'Ces changements permettent un meilleur approvisionnement des muscles.',
  ),
  choisir(
    'Qu’est-ce qu’un échauffement avant un effort intense ?',
    'Une préparation des muscles par des mouvements appropriés',
    [
      ['Un repos complet avant de commencer', 'S’échauffer demande justement de bouger.'],
      ['Un repas pris au dernier moment', 'L’échauffement prépare les muscles par des mouvements.'],
      ['La mesure du pouls', 'La mesure du pouls sert à compter les battements, pas à préparer les muscles.'],
    ],
    'Il fait appel au mouvement.',
    'L’échauffement prépare les muscles à un effort intense.',
  ),
  associer(
    'Associe chaque grandeur à sa signification',
    [
      ['La fréquence cardiaque', 'le nombre de battements du cœur par minute'],
      ['La fréquence respiratoire', 'le nombre de respirations par minute'],
      ['Le pouls', 'le battement des artères que l’on peut sentir'],
    ],
    'Deux grandeurs se comptent par minute ; la troisième se sent sur une artère.',
    'Ces grandeurs permettent de suivre le fonctionnement du corps à l’effort.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète la règle de l’effort.',
    ['Plus l’effort est intense, plus la consommation de ', ' ', '.'],
    [['dioxygène', 'dioxygene', 'oxygène', 'oxygene'], ['augmente']],
    'Pense au gaz absorbé par la respiration et à son évolution.',
    'La consommation de dioxygène augmente avec l’intensité, jusqu’à une limite.',
  ),
  completer(
    'Complète les noms des deux rythmes.',
    ['Pendant l’effort, la fréquence ', ' (battements du cœur) et la fréquence ', ' (mouvements de l’air) augmentent.'],
    [['cardiaque'], ['respiratoire', 'ventilatoire']],
    'L’un vient du mot « cœur », l’autre du mot « respirer ».',
    'Les rythmes cardiaque et respiratoire augmentent à l’effort.',
  ),
  ranger(
    'Range dans l’ordre les étapes pour mesurer ta fréquence cardiaque au poignet.',
    [
      'poser deux doigts à l’intérieur du poignet',
      'compter les battements pendant 30 secondes',
      'multiplier le nombre par 2',
      'noter le résultat en battements par minute',
    ],
    'On repère, on compte, on calcule, puis on note.',
    'Une demi-minute de comptage multipliée par 2 donne le nombre par minute.',
  ),
  ecrire(
    'Écris le nom de l’état d’une personne qui a la respiration haletante après un effort.',
    ['essoufflement', 'l’essoufflement', "l'essoufflement"],
    [
      ['échauffement', 'L’échauffement est la préparation des muscles avant l’effort.'],
      ['pouls', 'Le pouls est le battement des artères.'],
    ],
    'Le mot contient « souffle ».',
    'L’essoufflement est l’état d’une personne à la respiration haletante.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  associer(
    'Associe chaque élément à son rôle pendant un effort',
    [
      ['Les muscles', 'se contractent pour produire le mouvement'],
      ['Le cœur', 'propulse le sang'],
      ['Les poumons', 'réalisent les échanges gazeux avec l’air'],
      ['Le sang', 'transporte le dioxygène et les nutriments'],
      ['Les messages nerveux', 'agissent sur la fréquence du cœur'],
    ],
    'Relie le mouvement, le transport, les échanges et la commande.',
    'Plusieurs systèmes interviennent ensemble pendant un effort.',
  ),
  choisir(
    'Pendant un effort, qu’est-ce qui agit sur la fréquence du cœur, en lien avec le système nerveux ?',
    'Des messages nerveux envoyés au cœur',
    [
      ['La salive avalée', 'La salive intervient dans la digestion.'],
      ['La bile libérée par le foie', 'La bile intervient dans la digestion.'],
      ['Les os qui se déplacent', 'Les os ne transmettent pas de commande au cœur.'],
    ],
    'Le système nerveux communique par des messages.',
    'Des messages nerveux modulent (font varier) la fréquence du cœur.',
  ),
  ecrire(
    'Écris le nom de la préparation des muscles, par des mouvements appropriés, avant un effort intense.',
    ['échauffement', 'l’échauffement', "l'échauffement", 'echauffement', 'échauffement musculaire'],
    [
      ['essoufflement', 'L’essoufflement est la respiration haletante.'],
      ['absorption', 'L’absorption concerne l’intestin.'],
    ],
    'On le fait avant une compétition.',
    'L’échauffement prépare les muscles à un effort physique intense.',
  ),
  choisir(
    'Lors d’un effort long et peu intense, d’où vient surtout l’énergie des muscles ?',
    'De la respiration, qui utilise le dioxygène et les nutriments',
    [
      ['Uniquement de l’air expiré', 'L’air expiré est rejeté : l’énergie vient de la respiration avec nutriments.'],
      ['De la photosynthèse des muscles', 'La photosynthèse est propre aux végétaux verts.'],
      ['Uniquement de l’eau bue', 'L’eau ne fournit pas l’énergie : dioxygène et nutriments sont nécessaires.'],
    ],
    'Il faut un gaz et des substances venues des aliments.',
    'La respiration utilise le dioxygène et les nutriments pour fournir de l’énergie.',
  ),
];

const releve = (rng: Parameters<Modele>[0]) => {
  const coeurRepos = rng.int(60, 80);
  const coeurEffort = coeurRepos + rng.int(30, 55);
  const respRepos = rng.int(12, 16);
  const respEffort = respRepos + rng.int(18, 30);
  const qui = rng.pick(['Une élève', 'Un cycliste', 'Une rameuse', 'Un coureur']);
  return {
    coeurRepos,
    coeurEffort,
    respRepos,
    respEffort,
    lines: [
      `${qui} mesure ses rythmes avant puis pendant une course.`,
      `Au repos : ${coeurRepos} battements par minute ; ${respRepos} respirations par minute.`,
      `Pendant l’effort : ${coeurEffort} battements par minute ; ${respEffort} respirations par minute.`,
    ],
    texte: `Repos : ${coeurRepos} battements et ${respRepos} respirations par minute. Effort : ${coeurEffort} battements et ${respEffort} respirations par minute.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const m = releve(rng);
    return surDocument(
      'Carnet d’entraînement',
      m.lines,
      ecart(
        `${m.texte} De combien de battements par minute la fréquence cardiaque a-t-elle augmenté ?`,
        m.coeurEffort,
        m.coeurRepos,
        'Compare les deux valeurs en battements, pas les respirations.',
        'On retire la valeur au repos de la valeur à l’effort.',
      ),
    );
  },
  (rng) => {
    const m = releve(rng);
    return surDocument(
      'Carnet d’entraînement',
      m.lines,
      ecart(
        `${m.texte} De combien de respirations par minute la fréquence respiratoire a-t-elle augmenté ?`,
        m.respEffort,
        m.respRepos,
        'Compare les deux valeurs en respirations, pas les battements.',
        'On retire la valeur au repos de la valeur à l’effort.',
      ),
    );
  },
  (rng) => {
    const m = releve(rng);
    return surDocument(
      'Carnet d’entraînement',
      m.lines,
      choisir(
        `${m.texte} Comment interpréter ces changements ?`,
        'Les muscles reçoivent mieux le dioxygène et les nutriments dont ils ont davantage besoin',
        [
          [
            'Les muscles n’ont plus besoin de dioxygène',
            'Au contraire, la consommation de dioxygène augmente avec l’effort.',
          ],
          ['La digestion remplace la respiration', 'La respiration continue : elle est renforcée pendant l’effort.'],
          ['Le cœur s’arrête entre deux respirations', 'Les battements sont plus nombreux : le cœur ne s’arrête pas.'],
        ],
        'Relie les deux rythmes aux besoins des muscles.',
        'Le cœur et la respiration plus rapides améliorent l’approvisionnement des muscles.',
      )(rng),
    );
  },
  (rng) => {
    const n = rng.int(55, 80);
    const total = n * 2;
    return surDocument(
      'Mesure du pouls',
      [`Juste après un effort, on compte ${n} battements au poignet en 30 secondes.`],
      {
        prompt: `On compte ${n} battements au poignet en 30 secondes juste après un effort. Quelle est la fréquence cardiaque en battements par minute ?`,
        answer: num(total),
        traps: traps(r(total), [
          [n, 'Tu as gardé le nombre compté en 30 secondes : une minute en compte deux fois plus.'],
          [n + 30, 'On ne rajoute pas 30 : on tient compte du double de temps en multipliant par 2.'],
        ]),
        hint: 'Combien de fois 30 secondes y a-t-il dans une minute ?',
        steps: ['Une minute vaut deux fois 30 secondes.', `${n} × 2 = **${total}**.`],
        targetSeconds: 60,
      },
    );
  },
];

export const effortPhysique: Skill = {
  id: 'v5-effort',
  title: 'L’effort physique',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pendant un **effort physique**, les muscles consomment plus de dioxygène et de nutriments. La **fréquence cardiaque** et la **fréquence respiratoire** augmentent pour mieux les approvisionner.',
      'Les capacités ont une limite : la consommation de dioxygène ne monte pas sans fin. Avant un effort intense, on s’**échauffe**.',
    ],
    source:
      'Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Expliquer comment le système nerveux, le système respiratoire et le système cardiovasculaire interviennent lors d’un effort musculaire, en identifiant les capacités et les limites de l’organisme. »',
    sources: [
      PROGRAMME,
      'bo-svt-college-2008',
      BO_EFFORT,
      'academie-muscle',
      'academie-pouls',
      'academie-essoufflement',
      'academie-echauffement',
      'academie-sang',
      'academie-coeur',
      'cnrtl-poumon',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
