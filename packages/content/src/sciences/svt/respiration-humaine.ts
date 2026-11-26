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

// ——— Le corps en activité : la respiration chez l'être humain (appareil respiratoire, échanges entre air et sang) ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Quels organes assurent les échanges gazeux entre l’air et le sang chez l’être humain ?',
    'Les poumons',
    [
      ['Le cœur', 'Le cœur propulse le sang : les échanges avec l’air ne s’y font pas.'],
      ['L’estomac', 'L’estomac est un organe de la digestion.'],
    ],
    'Cherche les organes situés dans la cage thoracique où entre l’air.',
    'Les poumons sont les organes où se font les échanges gazeux avec le milieu extérieur.',
  ),
  choisir(
    'Comment appelle-t-on l’action de faire entrer l’air dans les poumons ?',
    'L’inspiration',
    [
      ['L’expiration', 'L’expiration est le mouvement inverse : l’air est expulsé.'],
      ['La digestion', 'La digestion concerne les aliments, pas l’air.'],
    ],
    'Pense au sens du trajet : ici, l’air arrive de l’extérieur.',
    'Inspirer, c’est faire pénétrer l’air dans les poumons ; expirer, c’est l’expulser.',
  ),
  choisir(
    'Quel muscle est le principal muscle de l’inspiration ?',
    'Le diaphragme',
    [
      ['Le cœur', 'Le cœur est un muscle qui fait circuler le sang.'],
      ['Le biceps', 'Le biceps fait bouger le bras.'],
    ],
    'Il forme une cloison entre le thorax et l’abdomen.',
    'Le diaphragme, cloison musculaire sous les poumons, est le principal muscle inspirateur.',
  ),
  choisir(
    'Quel liquide emporte le dioxygène depuis les poumons vers le reste du corps ?',
    'Le sang',
    [
      ['La salive', 'La salive intervient dans la bouche, pour la digestion.'],
      ['La bile', 'La bile est un liquide de la digestion.'],
    ],
    'Il circule dans les vaisseaux.',
    'Le sang assure le transport des gaz.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Quel conduit relie le larynx aux bronches ?',
    'La trachée',
    [
      ['L’œsophage', 'L’œsophage conduit les aliments vers l’estomac, pas l’air vers les bronches.'],
      ['Une artère', 'Les artères transportent du sang, pas de l’air.'],
      ['L’intestin grêle', 'C’est un segment du tube digestif.'],
    ],
    'C’est un conduit d’air fait de cartilage, au-dessus des deux bronches.',
    'La trachée est le conduit aérien qui relie le larynx aux bronches.',
  ),
  choisir(
    'Où se terminent les bronchioles, les plus fines ramifications des bronches ?',
    'Dans les alvéoles pulmonaires',
    [
      ['Dans le cœur', 'L’air ne passe pas par le cœur.'],
      ['Dans l’estomac', 'L’estomac appartient au tube digestif.'],
      ['Dans la trachée', 'La trachée est au début du trajet de l’air, avant les bronches.'],
    ],
    'Il s’agit de minuscules cavités au bout de l’arbre bronchique.',
    'Les alvéoles pulmonaires sont à l’extrémité des bronchioles.',
  ),
  choisir(
    'Quels éléments du sang fixent le dioxygène au passage dans les poumons ?',
    'Les globules rouges',
    [
      ['Les globules blancs', 'Les globules blancs ne sont pas les éléments qui fixent le dioxygène.'],
      ['Les plaquettes', 'Les plaquettes ne sont pas les éléments qui fixent le dioxygène.'],
      ['Les sels minéraux', 'Ce sont des substances dissoutes, pas des cellules transportant le dioxygène.'],
    ],
    'Le sang contient plusieurs sortes d’éléments : pense à ceux qui participent à son oxygénation.',
    'L’oxygénation du sang est la fixation du dioxygène par les globules rouges.',
  ),
  choisir(
    'Au niveau des poumons, quels échanges ont lieu entre l’air des alvéoles et le sang ?',
    'Le dioxygène passe dans le sang et le dioxyde de carbone passe dans l’air',
    [
      [
        'Le dioxyde de carbone passe dans le sang et le dioxygène passe dans l’air',
        'C’est l’inverse : le corps absorbe du dioxygène et élimine du dioxyde de carbone.',
      ],
      ['Les deux gaz passent seulement dans le sang', 'La respiration élimine aussi un gaz : le dioxyde de carbone.'],
      ['Aucun gaz ne traverse', 'Les poumons sont justement le lieu des échanges gazeux.'],
    ],
    'Repense au bilan de la respiration : un gaz absorbé, un gaz rejeté.',
    'Le sang se charge en dioxygène et libère du dioxyde de carbone, qui sera expiré.',
  ),
  associer(
    'Associe chaque mot à ce qu’il désigne',
    [
      ['L’inspiration', 'l’entrée de l’air dans les poumons'],
      ['L’expiration', 'la sortie de l’air des poumons'],
      ['Le diaphragme', 'le principal muscle inspirateur'],
    ],
    'Sépare d’abord les deux mouvements de l’air du muscle.',
    'Les deux mouvements sont opposés, et le diaphragme est un muscle.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète le trajet de l’air inspiré.',
    [
      'Après le larynx, l’air entre dans la ',
      ', puis dans les deux ',
      ' ; viennent ensuite les bronchioles et les alvéoles pulmonaires.',
    ],
    [
      ['trachée', 'trachee'],
      ['bronches', 'bronche'],
    ],
    'Le premier conduit est unique ; ensuite il se divise en deux.',
    'La trachée se divise en deux bronches qui entrent dans les poumons.',
  ),
  ranger(
    'Range dans l’ordre le trajet de l’air inspiré.',
    ['la trachée', 'les bronches', 'les bronchioles', 'les alvéoles pulmonaires'],
    'Va du conduit le plus large vers les plus petites cavités.',
    'La trachée se ramifie en bronches, puis en bronchioles terminées par les alvéoles.',
  ),
  ecrire(
    'Écris le nom des minuscules cavités situées au bout des bronchioles, où se font les échanges avec le sang.',
    [
      'alvéoles',
      'alvéoles pulmonaires',
      'les alvéoles',
      'les alvéoles pulmonaires',
      'alvéole',
      'alveoles',
      'alvéole pulmonaire',
      'l’alvéole pulmonaire',
      'alveoles pulmonaires',
    ],
    [
      ['bronches', 'Les bronches conduisent l’air : elles sont en amont des cavités cherchées.'],
      ['villosités', 'Les villosités sont des replis de l’intestin.'],
    ],
    'Leur nom commence par « al ».',
    'Les alvéoles pulmonaires sont à l’extrémité des bronchioles.',
  ),
  ecrire(
    'Écris le nom de la cloison musculaire qui sépare le thorax de l’abdomen et permet surtout d’inspirer.',
    ['diaphragme', 'le diaphragme'],
    [
      ['plèvre', 'La plèvre n’est pas un muscle : cherche le muscle inspirateur.'],
      ['trachée', 'La trachée est un conduit d’air, pas un muscle.'],
    ],
    'Son nom commence par « dia ».',
    'Le diaphragme est le principal muscle inspirateur.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  associer(
    'Associe chaque élément de la respiration à sa description',
    [
      ['La trachée', 'relie le larynx aux bronches'],
      ['Les bronches', 'deux conduits qui entrent dans les poumons'],
      ['Les alvéoles pulmonaires', 'extrémités des bronchioles'],
      ['Le diaphragme', 'cloison musculaire entre thorax et abdomen'],
      ['Les globules rouges', 'fixent le dioxygène dans le sang'],
    ],
    'Suis le trajet de l’air, puis celui du dioxygène dans le sang.',
    'Chaque élément a un rôle précis, de la trachée jusqu’au sang.',
  ),
  ranger(
    'Range dans l’ordre le trajet d’une molécule de dioxygène inspirée, jusqu’au sang.',
    ['la trachée', 'les bronches', 'les bronchioles', 'une alvéole pulmonaire', 'un capillaire sanguin'],
    'Le sang est la dernière étape : trouve d’abord les conduits d’air.',
    'Le dioxygène arrive dans l’alvéole puis passe dans le sang d’un capillaire.',
  ),
  completer(
    'Complète les échanges réalisés au niveau des poumons.',
    ['Le sang prend du ', ' à l’air des alvéoles et lui cède du ', ' de carbone.'],
    [['dioxygène', 'dioxygene', 'oxygène', 'oxygene'], ['dioxyde']],
    'Un gaz entre dans le sang, l’autre en sort.',
    'Le sang s’oxygène et se débarrasse de dioxyde de carbone.',
  ),
  ecrire(
    'Écris le nom des très fins vaisseaux à travers lesquels les gaz s’échangent entre le sang et les cellules ou l’air des alvéoles.',
    [
      'capillaires',
      'les capillaires',
      'capillaire',
      'des capillaires',
      'capillaires sanguins',
      'les capillaires sanguins',
      'vaisseaux capillaires',
      'les vaisseaux capillaires',
    ],
    [
      ['artères', 'Les artères conduisent le sang depuis le cœur : leur rôle n’est pas l’échange.'],
      ['veines', 'Les veines ramènent le sang vers le cœur : leur rôle n’est pas l’échange.'],
    ],
    'Leur nom évoque la finesse d’un cheveu.',
    'Les capillaires permettent les échanges nutritifs et gazeux.',
  ),
];

const mesures = (rng: Parameters<Modele>[0]) => {
  const o2Insp = rng.int(40, 45);
  const o2Exp = o2Insp - rng.int(8, 12);
  const co2Insp = rng.int(2, 3);
  const co2Exp = co2Insp + rng.int(6, 8);
  const qui = rng.pick(['Une élève', 'Un nageur', 'Une coureuse', 'Un adulte au repos']);
  return {
    o2Insp,
    o2Exp,
    co2Insp,
    co2Exp,
    lines: [
      `${qui} souffle dans un appareil de mesure (unité du capteur).`,
      `Air inspiré : dioxygène ${o2Insp} ; dioxyde de carbone ${co2Insp}.`,
      `Air expiré : dioxygène ${o2Exp} ; dioxyde de carbone ${co2Exp}.`,
    ],
    releve: `Air inspiré : dioxygène ${o2Insp}, dioxyde de carbone ${co2Insp}. Air expiré : dioxygène ${o2Exp}, dioxyde de carbone ${co2Exp}.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const m = mesures(rng);
    return surDocument(
      'Air inspiré et air expiré',
      m.lines,
      ecart(
        `${m.releve} Combien d’unités de dioxygène manquent dans l’air expiré par rapport à l’air inspiré ?`,
        m.o2Insp,
        m.o2Exp,
        'Compare les deux valeurs du dioxygène seulement.',
        'On retire la valeur de l’air expiré de celle de l’air inspiré.',
      ),
    );
  },
  (rng) => {
    const m = mesures(rng);
    return surDocument(
      'Air inspiré et air expiré',
      m.lines,
      ecart(
        `${m.releve} De combien d’unités le dioxyde de carbone est-il plus élevé dans l’air expiré ?`,
        m.co2Exp,
        m.co2Insp,
        'Compare les deux valeurs du dioxyde de carbone seulement.',
        'On retire la valeur de l’air inspiré de celle de l’air expiré.',
      ),
    );
  },
  (rng) => {
    const m = mesures(rng);
    return surDocument(
      'Air inspiré et air expiré',
      m.lines,
      choisir(
        `${m.releve} Comment expliquer la baisse du dioxygène dans l’air expiré ?`,
        'Une partie du dioxygène est passée dans le sang au niveau des alvéoles',
        [
          [
            'Le dioxygène s’est transformé en air dans la trachée',
            'La trachée conduit l’air : les échanges se font au niveau des alvéoles.',
          ],
          [
            'Le sang a libéré du dioxygène dans les alvéoles',
            'Alors l’air expiré contiendrait davantage de dioxygène, pas moins.',
          ],
          ['Le dioxygène est digéré par l’estomac', 'L’estomac digère des aliments, pas les gaz de la respiration.'],
        ],
        'Où l’air et le sang sont-ils au contact ?',
        'Le sang fixe du dioxygène au passage dans les poumons.',
      )(rng),
    );
  },
];

export const respirationHumaine: Skill = {
  id: 'v5-respiration-humaine',
  title: 'La respiration chez l’être humain',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’air entre par l’**inspiration** et sort par l’**expiration** ; le **diaphragme** est le principal muscle inspirateur. L’air inspiré suit la trachée, les **bronches** puis les bronchioles.',
      'Au bout, les **alvéoles pulmonaires** : le sang des capillaires y prend du **dioxygène** et libère du dioxyde de carbone.',
    ],
    source:
      'Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Expliquer comment le système nerveux, le système respiratoire et le système cardiovasculaire interviennent lors d’un effort musculaire ».',
    sources: [
      PROGRAMME,
      'bo-svt-college-2008',
      'cnrtl-respiration',
      'academie-poumon',
      'cnrtl-poumon',
      'cnrtl-trachee',
      'academie-bronche',
      'academie-alveole',
      'academie-diaphragme',
      'academie-inspiration',
      'academie-expiration',
      'academie-sang',
      'academie-capillaire',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
