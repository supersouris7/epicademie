import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
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

// ——— Besoins des végétaux chlorophylliens : matières prélevées, photosynthèse, sèves, stockage ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Où une plante enracinée dans le sol prélève-t-elle surtout l’eau ?',
    'Par ses racines',
    [
      ['Par ses fleurs', 'Les fleurs ne sont pas dans le sol : elles ne peuvent pas y prélever l’eau.'],
      ['Par ses fruits', 'Les fruits ne sont pas l’organe qui prélève l’eau du sol.'],
    ],
    'Pense à la partie de la plante qui est dans le sol.',
    'Les racines fixent la plante et assurent son alimentation en eau.',
  ),
  choisir(
    'Quelle source d’énergie une plante verte utilise-t-elle pour fabriquer sa matière ?',
    'La lumière',
    [
      ['Le bruit', 'Le son n’apporte pas l’énergie de la photosynthèse.'],
      ['L’obscurité', 'Sans lumière, la photosynthèse n’a pas lieu.'],
    ],
    'Pense à ce que reçoit une plante placée près d’une fenêtre.',
    'La photosynthèse se réalise sous l’action de la lumière.',
  ),
  choisir(
    'Quel gaz une plante verte prélève-t-elle pour la photosynthèse ?',
    'Le dioxyde de carbone',
    [
      ['La vapeur d’eau', 'La plante prend son eau dans le sol ; la photosynthèse utilise un autre gaz.'],
      ['Le dioxygène', 'La photosynthèse rejette du dioxygène : ce n’est pas le gaz qu’elle prélève.'],
    ],
    'C’est aussi un gaz rejeté par la respiration.',
    'La photosynthèse utilise l’eau, les sels minéraux et le dioxyde de carbone.',
  ),
  choisir(
    'Quel pigment vert permet à une plante de réaliser la photosynthèse ?',
    'La chlorophylle',
    [
      ['L’amidon', 'L’amidon est une réserve de nourriture, pas un pigment.'],
      ['La sève', 'La sève est un liquide qui transporte des matières dans la plante.'],
    ],
    'Ce pigment donne leur couleur verte aux feuilles.',
    'La chlorophylle est le pigment vert qui assure la photosynthèse.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Lors de la photosynthèse, quel gaz la plante rejette-t-elle ?',
    'Le dioxygène',
    [
      ['Le dioxyde de carbone', 'C’est le gaz prélevé par la photosynthèse, pas celui qu’elle rejette.'],
      ['Le diazote', 'La photosynthèse ne rejette pas de diazote.'],
      ['Aucun gaz', 'La photosynthèse s’accompagne d’un rejet de dioxygène.'],
    ],
    'C’est aussi le gaz que les organismes absorbent pour respirer.',
    'La photosynthèse s’accompagne d’un rejet de dioxygène.',
  ),
  choisir(
    'Par quels dispositifs de la feuille les gaz passent-ils entre l’air et l’intérieur de la plante ?',
    'Les stomates',
    [
      ['Les racines', 'Les racines fixent la plante et prélèvent l’eau et les sels minéraux dans le sol.'],
      ['Les grains d’amidon', 'L’amidon est une réserve : il ne fait pas passer les gaz.'],
      ['Les vaisseaux du bois', 'Ces canaux transportent la sève brute, pas les gaz de l’air.'],
    ],
    'Ils sont situés dans la « peau » de la feuille, notamment sur sa face inférieure.',
    'Les stomates permettent une diffusion rapide des gaz entre le milieu extérieur et l’intérieur de la feuille.',
  ),
  choisir(
    'Quel liquide monte dans la plante en transportant l’eau et les sels minéraux ?',
    'La sève brute',
    [
      ['La sève élaborée', 'La sève élaborée transporte aussi les matières fabriquées par la photosynthèse.'],
      ['L’amidon', 'L’amidon est une réserve solide en grains, pas un liquide qui circule.'],
      ['La chlorophylle', 'La chlorophylle est un pigment : elle ne transporte rien.'],
    ],
    'Elle n’a pas encore été « transformée » par la photosynthèse.',
    'On appelle sève brute le flot qui monte.',
  ),
  choisir(
    'Que signifie qu’une plante verte est « autotrophe » ?',
    'Elle fabrique sa matière organique à partir de matières minérales',
    [
      ['Elle se nourrit d’autres êtres vivants', 'C’est le cas des êtres vivants hétérotrophes.'],
      ['Elle ne prélève rien dans son milieu', 'Elle prélève de l’eau, des sels minéraux et du dioxyde de carbone.'],
      ['Elle peut se passer de lumière', 'Une plante verte a besoin de lumière pour la photosynthèse.'],
    ],
    'Compare avec un animal : doit-il manger d’autres êtres vivants ? Et la plante ?',
    'Un être autotrophe élabore des substances organiques à partir d’éléments minéraux.',
  ),
  associer(
    'Associe chaque élément à son rôle',
    [
      ['La racine', 'prélève l’eau et les sels minéraux'],
      ['Le stomate', 'laisse passer les gaz'],
      ['La chlorophylle', 'permet d’utiliser la lumière'],
    ],
    'Cherche ce qui est dans le sol, ce qui est une ouverture et ce qui est un pigment.',
    'Chaque élément a une fonction précise dans la nutrition de la plante.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète le bilan de la photosynthèse.',
    [
      'À la lumière, une plante verte utilise l’eau, des sels minéraux et le dioxyde de ',
      ' pour fabriquer de la matière organique, et elle rejette du ',
      '.',
    ],
    [['carbone'], ['dioxygène', 'dioxygene', 'oxygène', 'oxygene']],
    'Le premier gaz entre dans la feuille, le second en sort.',
    'La photosynthèse consomme du dioxyde de carbone et rejette du dioxygène.',
  ),
  completer(
    'Complète les noms des deux sèves.',
    [
      'La sève ',
      ' monte avec l’eau et les sels minéraux ; la sève ',
      ' contient des matières fabriquées grâce à la photosynthèse.',
    ],
    [['brute'], ['élaborée', 'elaboree', 'élaboree', 'elaborée']],
    'L’une n’est pas encore transformée, l’autre l’a été.',
    'La sève brute monte ; la sève élaborée contient des matières issues de la photosynthèse.',
  ),
  ranger(
    'Remets dans l’ordre le trajet qui mène de l’eau du sol à la matière organique d’une feuille.',
    [
      'L’eau est dans le sol',
      'Les racines la prélèvent',
      'La sève brute la monte dans les vaisseaux',
      'La feuille l’utilise à la lumière pour fabriquer de la matière organique',
    ],
    'Pars du sol et monte jusqu’à la feuille.',
    'L’eau est prélevée par les racines puis transportée jusqu’aux feuilles, lieu de la photosynthèse.',
  ),
  ecrire(
    'Écris le nom du phénomène par lequel une plante verte fabrique de la matière organique à la lumière.',
    ['photosynthèse', 'la photosynthèse', 'photosynthese', 'la photosynthese'],
    [
      ['respiration', 'La respiration est un échange de gaz : absorption de dioxygène et rejet de dioxyde de carbone.'],
      ['chlorophylle', 'La chlorophylle est le pigment qui permet ce phénomène, pas le phénomène.'],
    ],
    'Son nom associe l’idée de lumière et celle de fabrication.',
    'C’est la synthèse de substances organiques sous l’action de la lumière.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  ecrire(
    'Une plante met en réserve, sous forme de grains, une partie de la matière qu’elle a fabriquée. Écris le nom de cette substance, abondante dans les céréales.',
    ['amidon', 'l’amidon', 'de l’amidon'],
    [
      ['chlorophylle', 'La chlorophylle est le pigment vert, pas une réserve.'],
      ['sève', 'La sève transporte des matières ; elle n’est pas la réserve en grains.'],
    ],
    'Cette substance se présente sous forme de grains blancs.',
    'L’amidon constitue la réserve alimentaire de nombreux végétaux.',
  ),
  ecrire(
    'Écris le nom de l’association entre les racines d’une plante et les filaments d’un champignon.',
    ['mycorhize', 'une mycorhize', 'la mycorhize', 'mycorhizes', 'des mycorhizes'],
    [
      ['stomate', 'Un stomate est un dispositif de la feuille qui laisse passer les gaz.'],
      ['racine', 'La racine ne désigne que la partie de la plante, pas l’association avec le champignon.'],
    ],
    'Il commence par la lettre « m » et se forme sous terre.',
    'Une mycorhize associe les racines d’un végétal et le mycélium d’un champignon.',
  ),
  ecrire(
    'Une plante est bien éclairée et reçoit eau et sels minéraux, mais son air est privé d’un gaz : la photosynthèse s’arrête. Écris le nom de ce gaz.',
    ['dioxyde de carbone', 'le dioxyde de carbone', 'CO2', 'gaz carbonique'],
    [
      ['dioxygène', 'La photosynthèse rejette du dioxygène : ce n’est pas la matière qui lui manque.'],
      ['lumière', 'La plante est éclairée, et la lumière n’est pas un gaz.'],
    ],
    'Liste les matières utilisées par la photosynthèse, puis cherche celle qui vient de l’air.',
    'La photosynthèse utilise l’eau, les sels minéraux et un gaz de l’air, le dioxyde de carbone.',
  ),
  associer(
    'Associe chaque lieu ou transport à son rôle',
    [
      ['La feuille verte', 'fabrique de la matière organique à la lumière'],
      ['La racine', 'prélève l’eau dans le sol'],
      ['La sève brute', 'monte l’eau et les sels minéraux'],
      ['La sève élaborée', 'transporte des matières issues de la photosynthèse'],
      ['La graine de céréale', 'met de l’amidon en réserve'],
    ],
    'Distingue les lieux de prélèvement, de fabrication, de transport et de stockage.',
    'La plante prélève, transporte, fabrique et stocke de la matière dans des lieux différents.',
  ),
];

const serie = (rng: Parameters<Modele>[0]) => {
  const bas = rng.int(2, 6);
  const haut = bas + rng.int(5, 12);
  return {
    bas,
    haut,
    lines: [
      'Des plants identiques sont suivis 3 semaines. La matière produite est mesurée en grammes.',
      `Pot A : lumière, eau, sels minéraux, air normal → ${haut} g.`,
      `Pot B : comme A, mais sans sels minéraux → ${bas} g.`,
      'Pot C : comme A, mais à l’obscurité → 0 g.',
    ],
    releve: `Pot A (tout ce qu’il faut) : ${haut} g ; pot B (sans sels minéraux) : ${bas} g ; pot C (obscurité) : 0 g.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const s = serie(rng);
    return surDocument(
      'Carnet de culture',
      s.lines,
      ecart(
        `${s.releve} Combien de grammes de matière le pot A a-t-il produits de plus que le pot B ?`,
        s.haut,
        s.bas,
        'Compare les deux pots qui ne diffèrent que par les sels minéraux.',
        'On soustrait la production du pot B de celle du pot A.',
      ),
    );
  },
  (rng) => {
    const s = serie(rng);
    return surDocument(
      'Carnet de culture',
      s.lines,
      choisir(
        `${s.releve} Quelle conclusion la comparaison des pots A et C permet-elle ?`,
        'La plante a besoin de lumière pour produire de la matière',
        [
          [
            'La plante a besoin de sels minéraux pour produire de la matière',
            'Entre A et C, les sels minéraux ne changent pas : c’est la lumière qui change.',
          ],
          [
            'L’eau est inutile à la plante',
            'Les deux pots reçoivent de l’eau : cette comparaison ne dit rien sur l’eau.',
          ],
          ['La plante produit plus à l’obscurité', 'Le pot C ne produit rien, contrairement au pot A.'],
        ],
        'Repère la seule différence entre les deux pots.',
        'Une seule condition change entre A et C : la lumière.',
      )(rng),
    );
  },
  (rng) => {
    const s = serie(rng);
    return surDocument(
      'Carnet de culture',
      s.lines,
      choisir(
        `${s.releve} Quelle paire de pots permet de tester le besoin en sels minéraux ?`,
        'A et B',
        [
          ['A et C', 'Entre A et C, c’est la lumière qui change.'],
          ['B et C', 'Entre B et C, deux conditions changent à la fois : on ne peut pas conclure.'],
        ],
        'Il faut deux pots qui ne diffèrent que par une seule condition.',
        'Seuls les sels minéraux diffèrent entre A et B.',
      )(rng),
    );
  },
];

export const vegetaux: Skill = {
  id: 'v5-besoins-vegetaux',
  title: 'Les besoins des végétaux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une plante verte prélève de l’eau et des sels minéraux par ses racines, et du dioxyde de carbone par les **stomates** de ses feuilles. Avec la lumière captée par la **chlorophylle**, elle fabrique sa matière : c’est la **photosynthèse**, qui rejette du dioxygène.',
      'La **sève brute** monte l’eau et les sels minéraux ; la **sève élaborée** transporte des matières fabriquées. Une partie est mise en réserve, souvent sous forme d’**amidon**.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Relier les besoins des cellules d’une plante chlorophyllienne (CO2, eau, sels minéraux et énergie lumineuse), les lieux de production ou de prélèvement de matière et de stockage et les systèmes de transport au sein de la plante. »`,
    sources: [
      PROGRAMME,
      'academie-photosynthese',
      'academie-chlorophylle',
      'academie-autotrophe',
      'cnrtl-racine',
      'cnrtl-stomate',
      'cnrtl-seve',
      'cnrtl-amidon',
      'academie-mycorhize',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
