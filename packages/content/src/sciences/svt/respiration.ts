import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { associer, choisir, completer, ecart, ecrire, generer, surDocument, type Modele } from './nutrition-kit.ts';

// ——— Respiration des êtres vivants : échanges gazeux, organes respiratoires selon les êtres vivants ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Quel gaz un être vivant absorbe-t-il quand il respire ?',
    'Le dioxygène',
    [
      ['Le dioxyde de carbone', 'C’est le gaz rejeté par la respiration.'],
      ['La vapeur d’eau', 'La respiration n’est pas définie par une absorption de vapeur d’eau.'],
    ],
    'C’est le gaz dont nos cellules ont besoin.',
    'Respirer, c’est absorber du dioxygène et rejeter du dioxyde de carbone.',
  ),
  choisir(
    'Quel gaz un être vivant rejette-t-il quand il respire ?',
    'Le dioxyde de carbone',
    [
      ['Le dioxygène', 'C’est le gaz absorbé par la respiration.'],
      ['L’hydrogène', 'La respiration ne rejette pas d’hydrogène.'],
    ],
    'Un gaz entre, un autre sort : cherche celui qui sort.',
    'La respiration élimine du dioxyde de carbone.',
  ),
  choisir(
    'Quel organe permet à un poisson de respirer ?',
    'Les branchies',
    [
      ['Les poumons', 'Les poumons sont notamment l’organe respiratoire des mammifères, des oiseaux et des reptiles.'],
      ['Les trachées d’insecte', 'Ces petits tubes remplis d’air sont ceux des insectes.'],
    ],
    'Cet organe est propre aux animaux aquatiques.',
    'Les branchies sont un organe respiratoire des animaux aquatiques.',
  ),
  choisir(
    'Une plante respire-t-elle ?',
    'Oui, elle échange des gaz avec l’atmosphère',
    [
      ['Non, seuls les animaux respirent', 'Les végétaux aussi échangent des gaz avec l’atmosphère.'],
      [
        'Non, elle fait seulement la photosynthèse',
        'La photosynthèse et la respiration sont deux phénomènes distincts.',
      ],
    ],
    'Une plante échange-t-elle des gaz avec l’air qui l’entoure ?',
    'Les végétaux aussi respirent.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Par quel organe un dauphin, mammifère marin, respire-t-il ?',
    'Des poumons',
    [
      ['Des branchies', 'Le dauphin vit dans l’eau, mais c’est un mammifère : il respire avec des poumons.'],
      ['Des trachées d’insecte', 'Seuls certains animaux comme les insectes ont ces tubes ramifiés.'],
      ['Des stomates', 'Les stomates se trouvent chez les végétaux.'],
    ],
    'Classe-le d’abord : est-ce un poisson ?',
    'Le dauphin est un mammifère, et le poumon est l’organe respiratoire principal des mammifères.',
  ),
  choisir(
    'Comment l’air circule-t-il pour la respiration chez un insecte ?',
    'Par des trachées, tubes ramifiés dans tout le corps',
    [
      ['Par des branchies', 'Les branchies sont un organe d’animaux aquatiques.'],
      ['Par des poumons', 'Les insectes ne respirent pas avec des poumons.'],
      ['Par les vaisseaux de la sève', 'La sève est le liquide des plantes.'],
    ],
    'Pense à des petits tubes remplis d’air.',
    'Les insectes respirent par des trachées.',
  ),
  choisir(
    'Quel organe respiratoire possède un têtard, larve d’amphibien ?',
    'Des branchies',
    [
      ['Des trachées d’insecte', 'Le têtard n’est pas un insecte.'],
      ['Des stomates', 'Les stomates se trouvent chez les végétaux.'],
      ['Aucun : le têtard ne respire pas', 'Tout animal échange des gaz : le têtard respire.'],
    ],
    'Le têtard vit dans l’eau.',
    'Les têtards, larves des amphibiens, ont des branchies.',
  ),
  choisir(
    'Quand une plante respire-t-elle ?',
    'Le jour et la nuit',
    [
      ['Seulement la nuit', 'La respiration ne s’arrête pas le jour ; seule la photosynthèse dépend de la lumière.'],
      ['Seulement le jour', 'La respiration continue la nuit.'],
      ['Seulement au printemps', 'La respiration ne dépend pas d’une saison précise.'],
    ],
    'La respiration ne dépend pas de la lumière comme la photosynthèse.',
    'La respiration des végétaux est diurne et nocturne.',
  ),
  associer(
    'Associe chaque être vivant à son organe d’échanges gazeux',
    [
      ['Le poisson', 'les branchies'],
      ['L’insecte', 'les trachées'],
      ['L’oiseau', 'les poumons'],
    ],
    'Pense au milieu de vie, puis au groupe de l’animal.',
    'Chaque groupe possède des organes adaptés aux échanges gazeux.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète le bilan de la respiration.',
    ['Un être vivant qui respire absorbe du ', ' et rejette du ', ' de carbone.'],
    [['dioxygène', 'dioxygene', 'oxygène', 'oxygene'], ['dioxyde']],
    'Le premier gaz entre, le second sort.',
    'La respiration absorbe du dioxygène et élimine du dioxyde de carbone.',
  ),
  ecrire(
    'Écris le nom de l’organe respiratoire propre aux animaux aquatiques comme les poissons.',
    ['branchie', 'branchies', 'les branchies', 'des branchies', 'la branchie'],
    [
      ['poumons', 'Les poumons servent à respirer dans l’air chez les mammifères, les oiseaux et les reptiles.'],
      ['ouïes', 'L’organe cherché est situé à l’intérieur des ouïes : « ouïes » n’est pas son nom.'],
    ],
    'Chez le poisson, il est situé à l’intérieur des ouïes.',
    'Les branchies sont l’organe respiratoire des animaux aquatiques.',
  ),
  ecrire(
    'Écris le nom des petits tubes remplis d’air qui permettent à un insecte de respirer.',
    ['trachées', 'les trachées', 'des trachées', 'trachée', 'trachees', 'les trachees'],
    [
      ['stomates', 'Les stomates concernent les végétaux.'],
      ['branchies', 'Les branchies sont des organes d’animaux aquatiques.'],
    ],
    'Le même mot désigne chez l’être humain un conduit de l’air.',
    'Les trachées des insectes sont des tubes ramifiés remplis d’air.',
  ),
  completer(
    'Complète avec les organes respiratoires.',
    ['Un reptile respire avec des ', ' ; un têtard respire avec des ', '.'],
    [
      ['poumons', 'poumon'],
      ['branchies', 'branchie'],
    ],
    'L’un respire dans l’air, l’autre vit dans l’eau.',
    'Les reptiles ont des poumons, les têtards des branchies.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  ecrire(
    'Une plante verte éclairée respire. Écris le nom de l’autre phénomène qu’elle réalise alors, et qui rejette du dioxygène.',
    ['photosynthèse', 'la photosynthèse', 'photosynthese', 'la photosynthese'],
    [
      ['respiration', 'La respiration absorbe du dioxygène ; on cherche le phénomène qui en rejette.'],
      ['pollinisation', 'La pollinisation est un transport de pollen, pas un échange de gaz.'],
    ],
    'Ce phénomène a besoin de lumière.',
    'La respiration a lieu jour et nuit ; à la lumière s’y ajoute la photosynthèse.',
  ),
  associer(
    'Associe chaque phénomène ou organe à sa description',
    [
      ['La respiration', 'absorbe du dioxygène et rejette du dioxyde de carbone'],
      ['La photosynthèse', 'se fait à la lumière et rejette du dioxygène'],
      ['Les branchies', 'organe d’animaux aquatiques'],
      ['Les trachées', 'tubes d’air des insectes'],
      ['Les poumons', 'organe principal des mammifères pour respirer'],
    ],
    'Sépare d’abord les deux phénomènes, puis les trois organes.',
    'Les deux phénomènes ont des échanges différents, et chaque organe appartient à des êtres vivants précis.',
  ),
  ecrire(
    'Écris le nom du dispositif de la feuille qui intervient dans la respiration de la plante.',
    ['stomate', 'stomates', 'les stomates', 'le stomate', 'des stomates'],
    [
      ['poumons', 'Les plantes n’ont pas de poumons.'],
      ['racines', 'La question porte sur un dispositif de la feuille.'],
    ],
    'Ce sont de toutes petites ouvertures de la surface de la feuille.',
    'Les stomates interviennent dans les échanges gazeux de la plante.',
  ),
  ecrire(
    'Quel gaz rejeté par la respiration des animaux et des végétaux les végétaux verts utilisent-ils pour se nourrir ? Écris son nom.',
    ['dioxyde de carbone', 'le dioxyde de carbone', 'CO2', 'gaz carbonique'],
    [
      ['dioxygène', 'Le dioxygène est absorbé par la respiration, pas rejeté.'],
      ['carbone', 'Précise le nom complet du gaz : le carbone seul n’est pas un gaz de l’air.'],
    ],
    'Il intervient dans la photosynthèse.',
    'Le dioxyde de carbone rejeté par la respiration est repris par les végétaux verts.',
  ),
];

const bocal = (rng: Parameters<Modele>[0]) => {
  const o2Debut = rng.int(40, 50);
  const o2Fin = o2Debut - rng.int(6, 14);
  const co2Debut = rng.int(2, 5);
  const co2Fin = co2Debut + rng.int(6, 14);
  const vivant = rng.pick(['des criquets', 'des graines en germination', 'une plante verte placée à l’obscurité']);
  return {
    o2Debut,
    o2Fin,
    co2Debut,
    co2Fin,
    lines: [
      `Un bocal fermé contient ${vivant}. Des capteurs mesurent les gaz (unité du capteur).`,
      `Au début : dioxygène ${o2Debut} ; dioxyde de carbone ${co2Debut}.`,
      `Après 2 heures : dioxygène ${o2Fin} ; dioxyde de carbone ${co2Fin}.`,
    ],
    releve: `Bocal avec ${vivant} : dioxygène ${o2Debut} → ${o2Fin} ; dioxyde de carbone ${co2Debut} → ${co2Fin}.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const b = bocal(rng);
    return surDocument(
      'Mesures dans un bocal',
      b.lines,
      ecart(
        `${b.releve} De combien d’unités le dioxygène a-t-il diminué ?`,
        b.o2Debut,
        b.o2Fin,
        'Compare la valeur de départ et la valeur finale du dioxygène.',
        'On retire la valeur finale de la valeur de départ.',
      ),
    );
  },
  (rng) => {
    const b = bocal(rng);
    return surDocument(
      'Mesures dans un bocal',
      b.lines,
      ecart(
        `${b.releve} De combien d’unités le dioxyde de carbone a-t-il augmenté ?`,
        b.co2Fin,
        b.co2Debut,
        'Compare la valeur finale et la valeur de départ du dioxyde de carbone.',
        'On retire la valeur de départ de la valeur finale.',
      ),
    );
  },
  (rng) => {
    const b = bocal(rng);
    return surDocument(
      'Mesures dans un bocal',
      b.lines,
      choisir(
        `${b.releve} Quel phénomène ces mesures mettent-elles en évidence ?`,
        'La respiration',
        [
          ['La photosynthèse', 'La photosynthèse rejetterait du dioxygène : ici, il diminue.'],
          ['La pollinisation', 'La pollinisation est un transport de pollen : elle ne se mesure pas avec ces gaz.'],
          ['Aucun phénomène : les gaz sont stables', 'Les deux valeurs changent entre le début et la fin.'],
        ],
        'Regarde quel gaz diminue et quel gaz augmente.',
        'Du dioxygène est absorbé et du dioxyde de carbone est rejeté.',
      )(rng),
    );
  },
];

export const respiration: Skill = {
  id: 'v5-respiration-etres-vivants',
  title: 'La respiration des êtres vivants',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **respiration** est un échange de gaz : un être vivant absorbe du **dioxygène** et rejette du dioxyde de carbone. Animaux et végétaux respirent, de jour comme de nuit.',
      'Les organes changent : **poumons** (mammifères, oiseaux, reptiles), **branchies** (poissons, têtards), **trachées** (insectes), stomates des feuilles chez les plantes.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « les végétaux verts se nourrissent du CO2 rejeté par la respiration des organismes (animaux et végétaux) ».`,
    sources: [
      PROGRAMME,
      'cnrtl-respiration',
      'cnrtl-poumon',
      'academie-branchie',
      'cnrtl-trachee',
      'cnrtl-stomate',
      'academie-dauphin',
      'academie-photosynthese',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
