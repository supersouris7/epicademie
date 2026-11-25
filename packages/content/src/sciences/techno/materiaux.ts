import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, formes, maj, notion, qcm, saisie } from './outils.ts';

// ——— Les matériaux d'un objet et les procédés de réalisation ———

interface Materiau {
  readonly nom: string;
  readonly article: 'le' | 'l’';
  readonly description: string;
}

/** Descriptions reprises des définitions citées dans `donnees.ts`. */
const MATERIAUX: readonly Materiau[] = [
  { nom: 'acier', article: 'l’', description: 'un métal plus dur que le fer, obtenu en alliant du fer et du carbone' },
  { nom: 'aluminium', article: 'l’', description: 'un métal blanc, très léger' },
  { nom: 'cuivre', article: 'le', description: 'un métal rouge-brun, bon conducteur de l’électricité' },
  {
    nom: 'verre',
    article: 'le',
    description: 'une substance transparente et cassante, obtenue en faisant fondre du sable',
  },
  { nom: 'bois', article: 'le', description: 'la matière du tronc et des branches d’un arbre' },
];

/** Matériau nommé (les noms utilisés par les exercices existent tous dans `MATERIAUX`). */
const materiau = (nom: string): Materiau => {
  const trouve = MATERIAUX.find((m) => m.nom === nom);
  if (!trouve) throw new Error(`Matériau inconnu : ${nom}`);
  return trouve;
};

const avecArticle = (m: Materiau) => (m.article === 'l’' ? `l’${m.nom}` : `le ${m.nom}`);
const pourquoiMat = (m: Materiau) => `${maj(avecArticle(m))} est ${m.description}.`;

type Famille = 'ajout de matière' | 'enlèvement de matière' | 'mise en forme' | 'assemblage';
const FAMILLES: readonly Famille[] = ['ajout de matière', 'enlèvement de matière', 'mise en forme', 'assemblage'];

const SENS: Record<Famille, string> = {
  'ajout de matière': 'on construit la pièce en ajoutant de la matière',
  'enlèvement de matière': 'on retire de la matière à une pièce de départ',
  'mise en forme': 'on change la forme de la matière sans l’ajouter ni l’enlever',
  assemblage: 'on réunit plusieurs pièces',
};

interface Procede {
  readonly nom: string;
  readonly famille: Famille;
  readonly description: string;
}

const PROCEDES: readonly Procede[] = [
  {
    nom: 'l’impression 3D',
    famille: 'ajout de matière',
    description: 'une imprimante dépose la matière pour construire la pièce',
  },
  { nom: 'le perçage', famille: 'enlèvement de matière', description: 'un foret fait des trous dans la matière' },
  {
    nom: 'l’usinage',
    famille: 'enlèvement de matière',
    description: 'une machine façonne une pièce brute jusqu’à sa forme définitive',
  },
  { nom: 'le pliage', famille: 'mise en forme', description: 'on plie une plaque pour obtenir un angle' },
  {
    nom: 'le thermoformage',
    famille: 'mise en forme',
    description: 'on chauffe un matériau pour lui donner une forme',
  },
  { nom: 'le boulonnage', famille: 'assemblage', description: 'on relie des pièces avec une vis à tête et un écrou' },
  { nom: 'le soudage', famille: 'assemblage', description: 'on fait adhérer des pièces en un tout continu' },
  { nom: 'le rivetage', famille: 'assemblage', description: 'on fixe des pièces avec des rivets' },
];

const sansArticle = (s: string) => s.replace(/^(l’|le |la )/, '');
const pourquoiProcede = (p: Procede) =>
  `${maj(p.nom)} : ${p.description}. C’est un procédé de la famille « ${p.famille} ».`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const cible = rng.pick(MATERIAUX);
  const autres = rng.shuffle(MATERIAUX.filter((m) => m !== cible)).slice(0, 2);
  return {
    prompt: `Quel matériau est ${cible.description} ?`,
    ...qcm(
      rng,
      avecArticle(cible),
      autres.map((m) => ({ label: avecArticle(m), why: pourquoiMat(m) })),
    ),
    hint: 'Repère les mots qui décrivent l’aspect, le poids ou l’origine.',
    steps: [
      'On relie la description à un matériau connu.',
      pourquoiMat(cible),
      `La réponse est **${avecArticle(cible)}**.`,
    ],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const p = rng.pick(PROCEDES);
  return {
    prompt: `À quelle famille appartient ce procédé : ${p.nom} (${p.description}) ?`,
    ...qcm(
      rng,
      p.famille,
      FAMILLES.filter((f) => f !== p.famille).map((f) => ({
        label: f,
        why: `Avec « ${f} », ${SENS[f]}. Ce n’est pas ce que fait ce procédé : ${p.description}.`,
      })),
    ),
    hint: 'Demande-toi : la matière est-elle ajoutée, retirée, déformée ou réunie à une autre pièce ?',
    steps: ['On observe ce qui arrive à la matière.', pourquoiProcede(p), `La famille est **${p.famille}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const m = rng.pick(MATERIAUX);
    const { answer, traps } = saisie(
      formes(m.nom, m.article),
      rng.shuffle(MATERIAUX.filter((x) => x !== m)).map((x) => [x.nom, pourquoiMat(x)] as const),
    );
    return {
      prompt: `Écris le nom du matériau : ${m.description}.`,
      answer,
      traps,
      hint: 'Un seul mot suffit : pense à l’aspect et à l’origine décrits.',
      steps: ['On repère les indices de la description.', pourquoiMat(m), `La réponse est **${m.nom}**.`],
      targetSeconds: 35,
    };
  }
  const p = rng.pick(PROCEDES.filter((x) => x.nom !== 'l’impression 3D'));
  const mot = sansArticle(p.nom);
  const { answer, traps } = saisie(
    [mot, p.nom],
    PROCEDES.filter((x) => x !== p).map((x) => [sansArticle(x.nom), pourquoiProcede(x)] as const),
  );
  return {
    prompt: `Écris le nom du procédé : ${p.description}.`,
    answer,
    traps,
    hint: 'Le nom du procédé ressemble souvent au verbe de l’action décrite.',
    steps: ['On repère l’action décrite.', pourquoiProcede(p), `La réponse est **${mot}**.`],
    targetSeconds: 35,
  };
};

const ASSEMBLAGES: readonly { scene: string; demontable: boolean; why: string }[] = [
  {
    scene: 'Deux planches sont réunies par des vis et des écrous.',
    demontable: true,
    why: 'On peut dévisser les vis et les écrous, puis les séparer sans casser les pièces.',
  },
  {
    scene: 'La roue d’un jouet est tenue par un boulon.',
    demontable: true,
    why: 'Un boulon se dévisse : la roue peut être retirée puis remontée.',
  },
  {
    scene: 'Le couvercle d’un boîtier est fixé par quatre vis.',
    demontable: true,
    why: 'On retire les vis pour ouvrir le boîtier, puis on les remet.',
  },
  {
    scene: 'Deux tubes d’acier sont soudés l’un à l’autre.',
    demontable: false,
    why: 'La soudure fait des pièces un tout continu : pour les séparer, il faut les abîmer.',
  },
  {
    scene: 'Deux tôles sont réunies par des rivets.',
    demontable: false,
    why: 'Pour séparer des pièces rivetées, il faut détruire le rivet.',
  },
  {
    scene: 'Deux pièces en plastique sont soudées par la chaleur.',
    demontable: false,
    why: 'La soudure fait des pièces un tout continu : on ne les sépare pas sans dommage.',
  },
];

const MOT_DEMONTABLE = ['démontable', 'demontable'];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const choisis = rng.shuffle(PROCEDES).slice(0, 5);
    const paires = choisis.map((p) => [p.nom, p.description] as const);
    return {
      prompt: `Associe chaque procédé à son principe : ${choisis.map((p) => p.nom).join(' ; ')}.`,
      answer: association(rng, paires),
      hint: 'Repère dans chaque description le geste principal : plier, trouer, chauffer, déposer, réunir.',
      steps: [
        'Chaque procédé a un geste caractéristique.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const cas = rng.pick(ASSEMBLAGES);
  const bon = cas.demontable ? MOT_DEMONTABLE : ['fixe'];
  const { answer, traps } = saisie(bon, [[cas.demontable ? 'fixe' : 'démontable', cas.why]]);
  return {
    prompt: `${cas.scene} Cet assemblage est-il fixe ou démontable ? Écris un seul de ces deux mots.`,
    answer,
    traps,
    hint: 'Peut-on séparer les pièces, puis les remonter, sans rien casser ?',
    steps: ['On se demande si les pièces se séparent sans dommage.', cas.why, `La réponse est **${bon[0]}**.`],
    targetSeconds: 30,
  };
};

/** Choisir un matériau à partir d'une exigence (une seule réponse parmi les quatre proposées). */
const EXIGENCES: readonly { objet: string; exigence: string; bon: string; rivaux: readonly string[] }[] = [
  {
    objet: 'les fils d’une rallonge',
    exigence: 'la partie métallique doit bien conduire l’électricité et être rouge-brun',
    bon: 'cuivre',
    rivaux: ['verre', 'bois', 'aluminium'],
  },
  {
    objet: 'le cadre d’un objet à porter souvent',
    exigence: 'un métal blanc et très léger est demandé',
    bon: 'aluminium',
    rivaux: ['acier', 'cuivre', 'verre'],
  },
  {
    objet: 'la vitre d’un présentoir',
    exigence: 'la pièce doit être transparente',
    bon: 'verre',
    rivaux: ['bois', 'acier', 'cuivre'],
  },
  {
    objet: 'l’axe d’une roue très sollicité',
    exigence: 'un métal plus dur et plus résistant que le fer est demandé',
    bon: 'acier',
    rivaux: ['verre', 'bois', 'cuivre'],
  },
  {
    objet: 'les pieds d’un tabouret',
    exigence: 'le matériau doit provenir du tronc d’un arbre',
    bon: 'bois',
    rivaux: ['verre', 'acier', 'aluminium'],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cas = rng.pick(EXIGENCES);
    const bon = materiau(cas.bon);
    const rivaux = cas.rivaux.map(materiau);
    return {
      prompt: `Tu choisis le matériau pour ${cas.objet}. Exigence du cahier des charges : ${cas.exigence}.`,
      ...qcm(
        rng,
        avecArticle(bon),
        rivaux.map((m) => ({ label: avecArticle(m), why: pourquoiMat(m) })),
      ),
      hint: 'Lis chaque mot de l’exigence, puis vérifie quel matériau le remplit.',
      steps: [
        'On compare l’exigence aux propriétés des matériaux.',
        pourquoiMat(bon),
        `La réponse est **${avecArticle(bon)}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const familles = rng.shuffle(FAMILLES);
  const etapes = familles.map((f) => rng.pick(PROCEDES.filter((p) => p.famille === f)));
  const cible = rng.pick(familles);
  const bonne = familles.indexOf(cible);
  const labels = etapes.map((_, i) => `Opération ${i + 1}`);
  return {
    prompt: `La fiche décrit quatre opérations réalisées en atelier. Laquelle est un procédé de la famille « ${cible} » ?`,
    figure: {
      kind: 'document',
      title: 'Fiche de fabrication',
      lines: etapes.map((p, i) => `${labels[i]} : ${p.description}.`),
    },
    answer: { kind: 'choice', options: labels, correct: bonne },
    traps: etapes.flatMap((p, i) => (i === bonne ? [] : [{ option: i, why: pourquoiProcede(p) }])),
    hint: 'Pour chaque opération, demande-toi ce qui arrive à la matière.',
    steps: [
      `Dans la famille « ${cible} », ${SENS[cible]}.`,
      ...etapes.slice(bonne, bonne + 1).map(pourquoiProcede),
      `La réponse est **${labels[bonne]}**.`,
    ],
    targetSeconds: 70,
  };
};

export const materiaux = notion(
  {
    id: 't5-materiaux',
    title: 'Les matériaux et les procédés de réalisation',
    memo: [
      'Un **matériau** est une matière qui entre dans la fabrication d’un objet : acier, aluminium, cuivre, verre ou bois.',
      'Un **procédé** peut ajouter de la matière (impression 3D), en enlever (perçage), la **mettre en forme** (pliage) ou réaliser un **assemblage**, fixe (soudure) ou démontable (vis).',
    ],
    attendu: 'Identifier les principaux matériaux constitutifs d’un OST',
    sources: [
      'cnrtl-materiau',
      'cnrtl-acier',
      'cnrtl-aluminium',
      'cnrtl-cuivre',
      'cnrtl-verre',
      'cnrtl-bois',
      'cnrtl-thermoformage',
      'cnrtl-pliage',
      'cnrtl-usinage',
      'cnrtl-percage',
      'cnrtl-souder',
      'cnrtl-riveter',
      'cnrtl-boulon',
    ],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
