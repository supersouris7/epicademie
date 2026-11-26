import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { ordre } from '../st/outils.ts';
import { PROGRAMME } from './donnees-terre.ts';
import { qcm } from './kit.ts';
import { associer, document, ecrire, termeQcm, variantes } from './terre-kit.ts';

// ——— Structure du globe : croûte, manteau, noyau, lithosphère et asthénosphère ———

const DEFS = {
  croûte: 'la surface solidifiée du globe, aussi appelée écorce terrestre',
  manteau: 'la partie du globe située entre la croûte et le noyau, faite de roches solides',
  noyau: 'la partie centrale de la Terre',
  'noyau externe': 'la couche de métal liquide (surtout du fer et du nickel) autour du centre',
  graine: 'la boule de métal solide située au centre de la Terre',
  lithosphère: 'l’enveloppe extérieure solide et rigide du globe, épaisse d’environ 70 à 100 km',
  asthénosphère: 'la couche déformable du manteau sur laquelle repose la lithosphère',
  Moho: 'la limite entre la croûte et le manteau',
} as const;
type Terme = keyof typeof DEFS;
const TERMES = Object.keys(DEFS) as Terme[];

/** Pourquoi : le repère à retenir pour chaque terme. */
const REPERES: Readonly<Record<Terme, string>> = {
  croûte: 'Repère : c’est la couche sur laquelle nous vivons, au-dessus du Moho.',
  manteau:
    'Repère : il est sous la croûte et entoure le noyau ; ses roches sont solides, ce n’est pas un océan de magma.',
  noyau: 'Repère : il occupe le centre, sous le manteau.',
  'noyau externe': 'Repère : c’est la partie liquide et métallique du noyau, qui entoure la graine.',
  graine: 'Repère : elle est tout au centre et, contrairement au noyau externe, elle est solide.',
  lithosphère: 'Repère : « rigide » est le mot clé ; elle comprend la croûte et le haut du manteau.',
  asthénosphère: 'Repère : « déformable » est le mot clé ; elle est juste sous la lithosphère.',
  Moho: 'Repère : ce n’est pas une couche mais une limite, au bas de la croûte.',
};

const INDICE = 'Demande-toi si l’on parle d’une couche (laquelle, à quelle profondeur) ou d’une limite.';

/** Niveau 1 : trois couches très différentes. */
const SIMPLES = ['croûte', 'manteau', 'noyau'] as const;

const PROFONDEUR = ['la croûte', 'le manteau', 'le noyau externe', 'la graine (noyau interne)'];
const ENVELOPPES = ['la lithosphère', 'l’asthénosphère', 'le noyau externe', 'la graine (noyau interne)'];

const SAISIES: readonly {
  readonly t: Terme;
  readonly accepted: readonly string[];
  readonly erreurs: readonly (readonly [string, Terme])[];
  /** Définition propre à la saisie, quand celle des QCM contient déjà une réponse acceptée. */
  readonly def?: string;
}[] = [
  { t: 'lithosphère', accepted: variantes('lithosphère', 'la'), erreurs: [['asthénosphère', 'asthénosphère']] },
  {
    t: 'asthénosphère',
    accepted: variantes('asthénosphère', 'l’'),
    erreurs: [['lithosphère', 'lithosphère']],
  },
  {
    t: 'manteau',
    accepted: variantes('manteau', 'le'),
    erreurs: [
      ['noyau', 'noyau'],
      ['croûte', 'croûte'],
    ],
  },
  {
    t: 'graine',
    accepted: [...variantes('graine', 'la'), 'noyau interne', 'le noyau interne'],
    erreurs: [
      ['noyau externe', 'noyau externe'],
      ['noyau', 'noyau'],
    ],
  },
  {
    t: 'Moho',
    accepted: [...variantes('Moho', 'le'), 'discontinuité de Mohorovicic', 'Mohorovicic'],
    erreurs: [['lithosphère', 'lithosphère']],
  },
  {
    t: 'croûte',
    def: 'la couche solide la plus superficielle du globe, située au-dessus du Moho',
    accepted: [
      ...variantes('croûte', 'la'),
      ...variantes('croûte terrestre', 'la'),
      ...variantes('écorce terrestre', 'l’'),
    ],
    erreurs: [['lithosphère', 'lithosphère']],
  },
];

/** Indices indirects (profondeur, état, mouvement) : différents des définitions des niveaux 1 à 4. */
const POINTS: readonly (readonly [string, Terme])[] = [
  ['des roches solides qui bougent très lentement (convection), sous le Moho', 'manteau'],
  ['du fer et du nickel fondus, vers 3 500 km de profondeur', 'noyau externe'],
  ['du métal solide, entouré de toutes parts par du métal liquide', 'graine'],
  ['des roches situées juste au-dessus du Moho', 'croûte'],
];

/** Niveau 5 : carnet d'un modèle numérique du globe (inventé). */
function carnet(rng: Rng): QuestionDraft {
  const nom = rng.pick(['Globe Alba', 'Globe Boréal', 'Globe Céleste']);
  if (rng.int(0, 1) === 0) {
    const lettre = rng.pick(['A', 'B', 'C']);
    const [indice, terme] = rng.pick(POINTS);
    const autres = rng.shuffle(['croûte', 'manteau', 'noyau externe', 'graine'] as const).filter((t) => t !== terme);
    const q = qcm(
      rng,
      {
        prompt: `Dans la maquette « ${nom} », le point ${lettre} correspond à : ${indice}. Dans quelle partie du globe se trouve-t-il ?`,
        bonne: terme,
        fausses: autres.slice(0, 3).map((a) => [a, `${a.charAt(0).toUpperCase()}${a.slice(1)} : ${DEFS[a]}.`]),
        indice: 'Repère deux informations : solide ou liquide, et position par rapport au centre.',
        explication: [`La description correspond à ${DEFS[terme]}.`, REPERES[terme]],
      },
      45,
    );
    return {
      ...q,
      figure: document(`Maquette : ${nom}`, [
        `Notes sur la maquette « ${nom} » (modèle inventé).`,
        `Point ${lettre} : ${indice}.`,
        'Le modèle représente le globe coupé en deux, de la surface au centre.',
      ]),
    };
  }
  const forage = rng.pick(['Orvan', 'Sarel', 'Veyrac']);
  const q = qcm(
    rng,
    {
      prompt: `Un forage imaginaire « ${forage} » traverse la croûte et franchit le Moho. Dans quelle partie du globe arrive-t-il ?`,
      bonne: 'dans le manteau',
      fausses: [
        ['dans le noyau externe', 'Le noyau externe commence vers 3 000 km de profondeur, bien sous le Moho.'],
        ['dans la graine', 'La graine est au centre de la Terre, très loin sous le Moho.'],
        ['il reste dans la croûte', 'Le Moho est la limite qui sépare la croûte de la partie située en dessous.'],
      ],
      indice: 'Le Moho est une limite : cherche ce qui se trouve juste en dessous de la croûte.',
      explication: ['Le Moho est la limite entre la croûte et le manteau : sous lui commence le manteau.'],
    },
    45,
  );
  return {
    ...q,
    figure: document(`Forage imaginaire : ${forage}`, [
      `Projet « ${forage} » (inventé) : forer sous le fond d’un océan.`,
      'Les premiers kilomètres traversent les roches de la croûte océanique.',
      'L’outil de forage atteint ensuite la limite appelée Moho et la dépasse.',
    ]),
  };
}

export const structureGlobe: Skill = {
  id: 'v4-structure-globe',
  title: 'La structure du globe',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'De la surface au centre : la **croûte**, le **manteau** (roches solides), puis le **noyau** : externe (métal liquide), puis la **graine** (métal solide).',
      'La **lithosphère**, enveloppe rigide d’environ 70 à 100 km, repose sur l’**asthénosphère**, plus déformable. Attention : le manteau n’est pas un océan de magma.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « le globe terrestre (forme, rotation, dynamique interne et tectonique des plaques lithosphériques ».`,
    sources: [
      PROGRAMME,
      'academie-croute',
      'academie-manteau',
      'academie-noyau',
      'academie-lithosphere',
      'academie-asthenosphere',
      'insu-manteau',
      'insu-noyau',
      'insu-moho',
      'insu-verre-olivine',
    ],
  },
  generate: (rng, level) => {
    if (level === 1) {
      const t = rng.pick(SIMPLES);
      return qcm(
        rng,
        termeQcm(
          DEFS,
          t,
          SIMPLES.filter((x) => x !== t),
          INDICE,
          REPERES[t],
        ),
        25,
      );
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) {
        const t = rng.pick(TERMES.filter((x) => x !== 'noyau'));
        const autres = rng.shuffle(TERMES.filter((x) => x !== t && x !== 'noyau')).slice(0, 3);
        return qcm(rng, termeQcm(DEFS, t, autres, INDICE, REPERES[t]), 35);
      }
      const termes = rng.shuffle(TERMES.filter((x) => x !== 'noyau')).slice(0, 3);
      return associer(
        rng,
        termes.map((t) => [t, DEFS[t]] as const),
        {
          prompt: `Associe chaque terme à sa description : ${termes.join(', ')}.`,
          indice: 'Classe les termes de la surface vers le centre.',
          explication: 'Chaque terme a une position et un état (solide, liquide) précis.',
        },
        45,
      );
    }
    if (level === 3) {
      const forme = rng.int(0, 3);
      if (forme <= 1) {
        const couches = forme === 0 ? PROFONDEUR : ENVELOPPES;
        const vers = rng.int(0, 1) === 0;
        const suite = vers ? couches : [...couches].reverse();
        return {
          prompt: `Range ces parties du globe ${vers ? 'de la surface vers le centre' : 'du centre vers la surface'} (${forme === 0 ? 'd’après leur nature' : 'd’après leur rigidité'}).`,
          answer: ordre(rng, suite),
          hint: 'Imagine un forage : qu’est-ce que tu traverses en premier sous tes pieds ?',
          steps: [
            forme === 0
              ? 'Repère : les roches (croûte puis manteau) sont à l’extérieur ; le métal, liquide puis solide, est au cœur.'
              : 'L’enveloppe rigide est en surface et repose sur la couche déformable ; le noyau est bien plus profond.',
            `Ordre attendu : **${suite.join(' → ')}**.`,
          ],
          targetSeconds: 50,
        };
      }
      if (forme === 2) {
        return {
          prompt: 'Complète la description du noyau terrestre.',
          answer: {
            kind: 'cloze',
            parts: ['Le noyau externe est ', ' ; la graine, au centre, est ', '.'],
            blanks: [
              { mode: 'list', options: ['liquide', 'solide', 'gazeux'], correct: 0 },
              { mode: 'list', options: ['liquide', 'solide', 'gazeuse'], correct: 1 },
            ],
          },
          hint: 'Les deux parties sont métalliques, mais pas dans le même état.',
          steps: [
            'Le noyau comporte un océan de métal liquide qui entoure une boule de métal solide.',
            'Noyau externe **liquide**, graine **solide**.',
          ],
          targetSeconds: 30,
        };
      }
      return {
        prompt: 'Complète : comment s’empilent la lithosphère et l’asthénosphère ?',
        answer: {
          kind: 'cloze',
          parts: ['L’enveloppe rigide, la ', ', repose sur une couche déformable, l’', '.'],
          blanks: [
            { mode: 'list', options: ['lithosphère', 'graine', 'croûte océanique'], correct: 0 },
            { mode: 'list', options: ['atmosphère', 'asthénosphère', 'écorce'], correct: 1 },
          ],
        },
        hint: 'La couche rigide porte un nom construit sur le mot grec qui veut dire « pierre ».',
        steps: [
          'La lithosphère est rigide ; la couche sur laquelle elle repose se déforme.',
          'La **lithosphère** repose sur l’**asthénosphère**.',
        ],
        targetSeconds: 30,
      };
    }
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        const serie = rng.int(0, 1);
        const termes: readonly Terme[] =
          serie === 0
            ? ['croûte', 'Moho', 'manteau', 'noyau externe', 'graine']
            : ['lithosphère', 'asthénosphère', 'manteau', 'graine', 'Moho'];
        return associer(
          rng,
          termes.map((t) => [t, DEFS[t]] as const),
          {
            prompt: `Associe les cinq termes à leur description : ${termes.join(', ')}.`,
            indice: 'Commence par la limite, puis classe les couches de haut en bas.',
            explication: 'On repère les couches, leur état et la limite.',
          },
          70,
        );
      }
      const s = rng.pick(SAISIES);
      return ecrire(
        {
          prompt: `Écris le terme qui désigne ${s.def ?? DEFS[s.t]}.`,
          accepted: s.accepted,
          erreurs: s.erreurs.map(([texte, cle]) => [texte, `« ${texte} » désigne ${DEFS[cle]}.`]),
          indice: INDICE,
          explication: `La définition décrit ${s.def ?? DEFS[s.t]}. ${REPERES[s.t]}`,
        },
        35,
      );
    }
    return carnet(rng);
  },
};
