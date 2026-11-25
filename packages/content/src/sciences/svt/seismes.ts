import type { Skill } from '../../types.ts';
import { association, ordre, saisie } from '../st/outils.ts';
import { BRGM_SEISME, ECO_SEISMES, PROGRAMME, TLF_SISMOGRAPHE } from './donnees.ts';
import { qcm, type Qcm } from './kit.ts';

// ——— Séismes : rupture le long d'une faille, foyer, épicentre, magnitude, intensité, ondes ———

const DEFS = {
  séisme: 'une rupture le long d’une faille en profondeur, qui émet des ondes',
  faille: 'une cassure des roches le long de laquelle la rupture se produit',
  foyer: 'l’endroit en profondeur où la rupture commence',
  épicentre: 'le point de la surface situé au-dessus du foyer',
  magnitude: 'la mesure de la puissance libérée au moment du séisme',
  intensité: 'la sévérité de la secousse en un endroit donné',
  sismomètre: 'l’appareil qui enregistre les vibrations du sol',
} as const;
type Terme = keyof typeof DEFS;

const CONFUSIONS: Record<Terme, readonly [Terme, Terme]> = {
  séisme: ['faille', 'épicentre'],
  faille: ['foyer', 'séisme'],
  foyer: ['épicentre', 'faille'],
  épicentre: ['foyer', 'magnitude'],
  magnitude: ['intensité', 'sismomètre'],
  intensité: ['magnitude', 'épicentre'],
  sismomètre: ['magnitude', 'faille'],
};

const mot = (t: Terme, autres: readonly Terme[]): Qcm => ({
  prompt: `Quel mot désigne ${DEFS[t]} ?`,
  bonne: t,
  fausses: autres.map((a) => [a, `« ${a} » désigne ${DEFS[a]}.`]),
  indice: 'Demande-toi si on parle d’une cassure, d’un lieu, d’une mesure ou d’un appareil.',
  explication: [`La définition décrit précisément : ${DEFS[t]}.`],
});

const SITUATIONS: readonly Qcm[] = [
  {
    prompt: 'Où les séismes sont-ils d’abord concentrés à l’échelle du globe ?',
    bonne: 'Aux frontières entre les grandes plaques tectoniques',
    fausses: [
      ['Répartis exactement au hasard sur la planète', 'Les séismes ne se produisent pas n’importe où.'],
      ['Seulement au milieu des plaques', 'Les frontières des plaques sont les zones les plus concernées.'],
      ['Seulement dans les régions froides', 'La température de l’air n’explique pas les ruptures en profondeur.'],
    ],
    indice: 'Pense aux grandes plaques qui bougent les unes par rapport aux autres.',
    explication: ['Les mouvements des plaques accumulent des contraintes, surtout à leurs frontières.'],
  },
  {
    prompt: 'Pourquoi des roches finissent-elles par rompre lors d’un séisme ?',
    bonne: 'Des contraintes accumulées le long d’une faille se relâchent quand la rupture est atteinte',
    fausses: [
      [
        'Parce qu’il pleut beaucoup à la surface',
        'La pluie à la surface n’explique pas la mise sous tension des roches en profondeur.',
      ],
      [
        'Parce que le vent pousse les montagnes',
        'Le vent est un mouvement de l’air : il ne met pas les roches profondes sous tension.',
      ],
      [
        'Parce que la température de l’air change',
        'Les tensions viennent surtout des mouvements des plaques, pas de l’air.',
      ],
    ],
    indice: 'Les plaques bougent et les roches sont mises sous tension.',
    explication: ['Les mouvements des plaques chargent peu à peu des contraintes le long des failles.'],
  },
  {
    prompt: 'Peut-on dire à l’avance le jour et le lieu exacts du prochain séisme ?',
    bonne: 'Non : on peut seulement estimer des probabilités sur de longues périodes',
    fausses: [
      ['Oui, quelques jours avant, grâce à la météo', 'La météo ne permet pas de prévoir les ruptures en profondeur.'],
      ['Oui, une heure avant, dans tous les cas', 'Aucune méthode ne donne l’heure d’un séisme à venir.'],
      [
        'Non, et on ne sait rien des zones où il peut se produire',
        'On sait dresser des cartes de probabilité à partir des séismes passés.',
      ],
    ],
    indice: 'Distingue « prévoir la date » et « connaître les zones exposées ».',
    explication: ['On ne sait pas dire où et quand, mais des cartes d’aléa indiquent les zones exposées.'],
  },
  {
    prompt: 'En France, dans quel territoire le risque sismique est-il le plus fort ?',
    bonne: 'Les Antilles',
    fausses: [
      ['Le Bassin parisien', 'Ce n’est pas une zone de forte sismicité comparable aux Antilles.'],
      ['La côte de la Manche', 'La côte de la Manche n’est pas la zone la plus exposée.'],
      ['L’ensemble du territoire est exposé à égalité', 'Le zonage distingue des niveaux de sismicité différents.'],
    ],
    indice: 'Pense aux îles situées au contact de deux plaques tectoniques.',
    explication: ['Les Antilles sont au contact de deux plaques : c’est là que le risque est le plus fort.'],
  },
];

const ONDES = ['les ondes P (les plus rapides)', 'les ondes S (plus lentes)', 'les ondes de surface (les dernières)'];
const MECANISME = [
  'Les plaques tectoniques bougent',
  'Des contraintes s’accumulent le long d’une faille',
  'Les roches rompent au foyer',
  'Des ondes sismiques se propagent',
  'La secousse est ressentie à la surface',
];

const SAISIES: readonly { readonly t: Terme; readonly accepted: readonly string[]; readonly autre: Terme }[] = [
  { t: 'faille', accepted: ['faille', 'une faille', 'la faille'], autre: 'foyer' },
  { t: 'foyer', accepted: ['foyer', 'le foyer', 'hypocentre', 'l’hypocentre'], autre: 'épicentre' },
  { t: 'épicentre', accepted: ['épicentre', 'epicentre', 'l’épicentre'], autre: 'foyer' },
  { t: 'magnitude', accepted: ['magnitude', 'la magnitude'], autre: 'intensité' },
  { t: 'intensité', accepted: ['intensité', 'intensite', 'l’intensité'], autre: 'magnitude' },
  {
    t: 'sismomètre',
    accepted: ['sismomètre', 'sismometre', 'un sismomètre', 'sismographe', 'un sismographe'],
    autre: 'magnitude',
  },
];

export const seismes: Skill = {
  id: 'v5-seismes',
  title: 'Les séismes',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **séisme** est une rupture le long d’une **faille** : elle part du **foyer** et envoie des ondes. L’**épicentre** est le point de la surface juste au-dessus.',
      'La **magnitude** mesure la puissance libérée ; l’**intensité** décrit la secousse en un lieu et s’atténue avec la distance. On ne sait pas prévoir la date : on construit **parasismique**.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « le globe terrestre (forme, rotation, dynamique interne et tectonique des plaques lithosphériques ; séismes, éruptions volcaniques ».`,
    sources: [PROGRAMME, BRGM_SEISME, ECO_SEISMES, TLF_SISMOGRAPHE],
  },
  generate: (rng, level) => {
    if (level === 1) {
      const t = rng.pick<Terme>(['séisme', 'foyer', 'épicentre', 'magnitude', 'sismomètre']);
      return qcm(rng, mot(t, CONFUSIONS[t]), 25);
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) return qcm(rng, rng.pick(SITUATIONS), 35);
      const t = rng.pick(Object.keys(DEFS) as Terme[]);
      const autres = rng.shuffle((Object.keys(DEFS) as Terme[]).filter((x) => x !== t)).slice(0, 3);
      return qcm(rng, mot(t, autres), 35);
    }
    if (level === 3) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        return {
          prompt: 'Remets dans l’ordre les étapes d’un séisme.',
          answer: ordre(rng, MECANISME),
          hint: 'Commence par le mouvement des plaques et termine par ce que ressentent les habitants.',
          steps: [
            'Les contraintes viennent des plaques, puis les roches rompent et les ondes partent.',
            `Dernière étape : **${MECANISME[MECANISME.length - 1]}**.`,
          ],
          targetSeconds: 50,
        };
      }
      if (forme === 1) {
        return {
          prompt: 'Dans quel ordre les ondes sismiques arrivent-elles à une station ?',
          answer: ordre(rng, ONDES),
          hint: 'Les ondes « premières » portent bien leur nom, et celles de surface viennent après.',
          steps: [
            'Les ondes P vont le plus vite, les ondes S sont plus lentes, puis viennent les ondes de surface.',
            `Les premières arrivées sont **${ONDES[0]}**.`,
          ],
          targetSeconds: 35,
        };
      }
      const options = ['foyer', 'épicentre', 'faille'];
      const surfaceDabord = rng.int(0, 1) === 0;
      return {
        prompt: surfaceDabord
          ? 'Complète en distinguant le point de la surface du lieu profond.'
          : 'Complète en distinguant le lieu de la rupture et sa projection en surface.',
        answer: {
          kind: 'cloze',
          parts: surfaceDabord
            ? ['À la surface, on parle de l’', ' ; en profondeur, la rupture commence au ', '.']
            : ['La rupture commence au ', ' ; juste au-dessus, à la surface, se trouve l’', '.'],
          blanks: (surfaceDabord ? [1, 0] : [0, 1]).map((correct) => ({
            mode: 'list' as const,
            options,
            correct,
          })),
        },
        hint: 'L’un des deux mots commence par « épi », qui veut dire « au-dessus ».',
        steps: [
          'La rupture commence en profondeur, au foyer.',
          'La projection du **foyer** à la surface est l’**épicentre**.',
        ],
        targetSeconds: 30,
      };
    }
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        const serie = rng.int(0, 1);
        const termes: readonly Terme[] =
          serie === 0
            ? ['faille', 'foyer', 'épicentre', 'magnitude', 'intensité']
            : ['séisme', 'foyer', 'magnitude', 'intensité', 'sismomètre'];
        return {
          prompt: `Associe chaque mot à sa définition : ${termes.join(', ')}.`,
          answer: association(
            rng,
            termes.map((t) => [t, DEFS[t]] as const),
          ),
          hint: 'Distingue les lieux, les mesures et les objets.',
          steps: [
            'On trie : les lieux, puis les mesures, puis le reste.',
            `Attention à la paire magnitude / intensité : la magnitude, c’est **${DEFS.magnitude}**.`,
          ],
          targetSeconds: 60,
        };
      }
      const s = rng.pick(SAISIES);
      const { answer, traps } = saisie(s.accepted, [[s.autre, `« ${s.autre} » désigne ${DEFS[s.autre]}.`]]);
      return {
        prompt: `Écris le mot du vocabulaire sismique qui désigne ${DEFS[s.t]}.`,
        answer,
        traps,
        hint: `Il commence par la lettre « ${s.t.charAt(0)} ».`,
        steps: [`La définition décrit : ${DEFS[s.t]}.`, `C’est le mot **${s.t}**.`],
        targetSeconds: 30,
      };
    }
    // Niveau 5 : bulletin inventé, à analyser.
    const villes = rng.shuffle(['Aubel', 'Brévac', 'Cormel', 'Dorville']).slice(0, 3);
    const [pres, milieu, loin] = villes as [string, string, string];
    const intensites = rng.pick([
      [7, 5, 3],
      [6, 4, 3],
      [8, 6, 4],
    ] as const);
    const magnitude = rng.pick(['5,1', '5,4', '4,8']);
    const releves = rng.shuffle([
      [pres, intensites[0]],
      [milieu, intensites[1]],
      [loin, intensites[2]],
    ] as const);
    const lines = [
      `Séisme fictif, magnitude ${magnitude}. Le sol est de même nature dans toute la région.`,
      ...releves.map(([ville, i]) => `À ${ville}, l’intensité ressentie est de ${i}.`),
    ];
    const figure = {
      kind: 'document' as const,
      title: 'Bulletin sismique',
      lines,
      credit: 'Document écrit pour l’exercice',
    };
    const recit = releves.map(([v, i]) => `${v} : ${i}`).join(' ; ');
    if (rng.int(0, 1) === 0) {
      const q = qcm(
        rng,
        {
          prompt: `Intensités relevées (${recit}). Quelle ville est probablement la plus proche de l’épicentre ?`,
          bonne: pres,
          fausses: [
            [
              milieu,
              'La secousse y est plus faible qu’ailleurs au moins en un point : cherche l’intensité la plus forte.',
            ],
            [loin, 'C’est la secousse la plus faible : la ville est probablement la plus éloignée.'],
            [
              'Impossible à dire, car la magnitude est la même',
              'La magnitude est unique, mais l’intensité varie selon le lieu et indique la proximité.',
            ],
          ],
          indice: 'L’intensité s’atténue avec la distance.',
          explication: [
            'Le sol est identique partout : la secousse la plus forte indique le lieu le plus proche de l’épicentre.',
          ],
        },
        50,
      );
      return { ...q, figure };
    }
    const q = qcm(
      rng,
      {
        prompt: `Intensités relevées (${recit}), magnitude ${magnitude}. Quelle phrase est exacte ?`,
        bonne: 'La magnitude décrit la puissance libérée, et l’intensité change d’une ville à l’autre',
        fausses: [
          [
            'Chaque ville a sa propre magnitude, et la même intensité',
            'C’est l’inverse : la magnitude caractérise le séisme, l’intensité dépend du lieu.',
          ],
          [
            'La magnitude et l’intensité sont deux noms de la même mesure',
            'La magnitude mesure la puissance libérée, l’intensité la sévérité de la secousse en un lieu.',
          ],
          [
            `L’intensité à ${loin} augmente parce que la ville est éloignée`,
            'Au contraire, l’intensité s’atténue quand on s’éloigne.',
          ],
        ],
        indice: 'Une mesure décrit le séisme, l’autre ce qu’on ressent à un endroit.',
        explication: [
          'Un séisme libère une puissance (magnitude) ; la secousse varie d’un lieu à l’autre (intensité).',
        ],
      },
      50,
    );
    return { ...q, figure };
  },
};
