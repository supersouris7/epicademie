import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { maj } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesInteractions } from './donnees-interactions.ts';

// ——— Les interactions : actions de contact et à distance (4e) ———

const CONTACT = 'une action de contact';
const DISTANCE = 'une action à distance';

type Type = 'contact' | 'distance';

interface Action {
  readonly texte: string;
  /** Qui agit, sur qui. */
  readonly auteur: string;
  readonly receveur: string;
  readonly type: Type;
  readonly why: string;
}

const ACTIONS: readonly Action[] = [
  {
    texte: 'Le pied d’un joueur frappe un ballon.',
    auteur: 'le pied',
    receveur: 'le ballon',
    type: 'contact',
    why: 'Le pied touche le ballon pendant la frappe.',
  },
  {
    texte: 'Une main pousse une porte.',
    auteur: 'la main',
    receveur: 'la porte',
    type: 'contact',
    why: 'La main touche la porte qu’elle pousse.',
  },
  {
    texte: 'Un fil retient une lampe suspendue.',
    auteur: 'le fil',
    receveur: 'la lampe',
    type: 'contact',
    why: 'Le fil est attaché à la lampe : ils se touchent.',
  },
  {
    texte: 'Une table soutient un livre posé sur elle.',
    auteur: 'la table',
    receveur: 'le livre',
    type: 'contact',
    why: 'Le livre repose sur la table : ils se touchent.',
  },
  {
    texte: 'La Terre attire une pomme qui tombe d’une branche.',
    auteur: 'la Terre',
    receveur: 'la pomme',
    type: 'distance',
    why: 'La Terre agit à distance sur la pomme par gravitation, qu’elle tombe ou qu’elle soit posée.',
  },
  {
    texte: 'Un aimant, tenu à quelques centimètres d’un clou en fer, attire ce clou.',
    auteur: 'l’aimant',
    receveur: 'le clou',
    type: 'distance',
    why: 'L’aimant et le clou ne se touchent pas : l’action s’exerce à distance.',
  },
  {
    texte: 'La Terre attire la Lune.',
    auteur: 'la Terre',
    receveur: 'la Lune',
    type: 'distance',
    why: 'La Terre et la Lune ne se touchent pas : la gravitation agit à distance.',
  },
];

const libelle = (t: Type) => (t === 'contact' ? CONTACT : DISTANCE);

const niveau1 = (rng: Rng): QuestionDraft => {
  const a = rng.pick(ACTIONS);
  const bon = libelle(a.type);
  const autre = libelle(a.type === 'contact' ? 'distance' : 'contact');
  const { answer, traps } = choice(rng, bon, [
    { label: autre, why: a.why },
    { label: 'aucune action', why: `${maj(a.auteur)} agit bien sur ${a.receveur}. ${a.why}` },
  ]);
  return {
    prompt: `${a.texte} Quel type d’action est décrit ?`,
    answer,
    traps,
    hint: 'Les deux corps se touchent-ils ?',
    steps: [a.why, `C’est **${bon}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const type: Type = rng.pick(['contact', 'distance']);
  const bon = rng.pick(ACTIONS.filter((a) => a.type === type));
  const faux = rng.shuffle(ACTIONS.filter((a) => a.type !== type && a.receveur !== bon.receveur)).slice(0, 3);
  const { answer, traps } = choice(
    rng,
    bon.texte,
    faux.map((a) => ({ label: a.texte, why: a.why })),
  );
  return {
    prompt: `Parmi ces situations, laquelle décrit ${libelle(type)} ?`,
    answer,
    traps,
    hint: 'Pour chaque phrase, demande-toi si les deux corps se touchent.',
    steps: [bon.why, `La bonne situation est : **${bon.texte}**`],
    targetSeconds: 45,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const a = rng.pick(ACTIONS);
  const types = [CONTACT, DISTANCE];
  return {
    prompt: `${a.texte} Complète l’analyse de cette situation.`,
    answer: {
      kind: 'cloze',
      parts: [
        `L’action exercée sur ${a.receveur} par ${a.auteur} est `,
        '. Comme les deux corps agissent l’un sur l’autre, on parle d’une ',
        ' entre eux.',
      ],
      blanks: [
        { mode: 'list', options: types, correct: a.type === 'contact' ? 0 : 1 },
        { mode: 'text', accepted: ['interaction'] },
      ],
    },
    hint: 'Le second mot désigne une action réciproque entre deux corps.',
    steps: [
      a.why,
      'Une action réciproque entre deux corps s’appelle une interaction.',
      `**${libelle(a.type)}** ; une **interaction**.`,
    ],
    targetSeconds: 60,
  };
};

interface Effet {
  /** Effet seul : ni l’auteur ni la nature n’y figurent. */
  readonly effet: string;
  readonly auteur: string;
  readonly type: Type;
}

interface Systeme {
  readonly texte: string;
  readonly effets: readonly Effet[];
}

const effet = (e: string, auteur: string, type: Type): Effet => ({ effet: e, auteur, type });

const SYSTEMES: readonly Systeme[] = [
  {
    texte:
      'Un jour de vent, un voilier est sur la mer, voile gonflée. Une corde tendue va de son avant à un bateau à moteur qui le précède.',
    effets: [
      effet('Le voilier est attiré vers le bas', 'la Terre', 'distance'),
      effet('L’avant du voilier est tiré', 'la corde', 'contact'),
      effet('La voile est poussée', 'l’air', 'contact'),
      effet('La coque est soutenue', 'l’eau', 'contact'),
    ],
  },
  {
    texte:
      'Un enfant fait avancer une luge sur la neige à l’aide d’une corde. Sur la luge, une clé en fer se trouve à quelques centimètres d’un aimant fixé au bord, sans le toucher.',
    effets: [
      effet('La luge est tirée vers l’avant', 'la corde', 'contact'),
      effet('La luge est attirée vers le bas', 'la Terre', 'distance'),
      effet('La clé est attirée vers le bord', 'l’aimant', 'distance'),
      effet('La luge est soutenue', 'la neige', 'contact'),
    ],
  },
  {
    texte:
      'Un jour de vent, un cerf-volant est en l’air. Un enfant resté au sol tient le bout de la ficelle attachée au cerf-volant.',
    effets: [
      effet('Le cerf-volant est attiré vers le bas', 'la Terre', 'distance'),
      effet('Le cerf-volant est soutenu', 'l’air', 'contact'),
      effet('Le cerf-volant est empêché de partir au loin', 'la ficelle', 'contact'),
    ],
  },
];

const NATURES = ['de contact', 'à distance'];

/** Pour chaque effet, l’élève choisit séparément l’auteur puis la nature de l’action. */
const niveau4 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYSTEMES);
  // Ordre fixe (un énoncé, une réponse) : les auteurs sont rangés par ordre alphabétique, pas comme les effets.
  const { effets } = s;
  const auteurs = effets.map((e) => e.auteur).sort((a, b) => a.localeCompare(b, 'fr'));
  return {
    prompt: `${s.texte} Pour chaque effet, choisis son auteur, puis la nature de l’action.`,
    answer: {
      kind: 'cloze',
      parts: [...effets.flatMap((e, i) => [`${i === 0 ? '' : '. '}${e.effet} : auteur `, ', action ']), '.'],
      blanks: effets.flatMap((e) => [
        { mode: 'list' as const, options: auteurs, correct: auteurs.indexOf(e.auteur) },
        { mode: 'list' as const, options: NATURES, correct: e.type === 'contact' ? 0 : 1 },
      ]),
    },
    hint: 'Pour chaque effet, cherche d’abord le corps responsable, puis demande-toi s’il touche ce qui subit l’action.',
    steps: [
      'On cherche l’auteur de chaque action, puis on vérifie s’il y a contact.',
      'Un auteur qui touche ce qu’il pousse, tire ou soutient (même l’air, invisible) exerce une action de contact. La Terre ou un aimant peuvent agir sans toucher.',
      effets.map((e) => `${e.effet} : **${e.auteur}**, action ${NATURES[e.type === 'contact' ? 0 : 1]}`).join(' ; '),
    ],
    targetSeconds: 120,
  };
};

interface Dossier {
  readonly titre: string;
  readonly systeme: string;
  readonly lignes: readonly string[];
  readonly contact: readonly string[];
  readonly distance: readonly string[];
}

const DOSSIERS: readonly Dossier[] = [
  {
    titre: 'La bille et l’aimant',
    systeme: 'la bille',
    lignes: [
      'Système étudié : une bille en fer posée sur une table.',
      'Un aimant est tenu au-dessus de la bille, sans la toucher.',
      'L’aimant attire la bille sans réussir à la soulever : elle reste sur la table.',
      'La Terre attire la bille.',
      'On néglige l’action de l’air.',
    ],
    contact: ['la table'],
    distance: ['l’aimant', 'la Terre'],
  },
  {
    titre: 'La lampe suspendue',
    systeme: 'la lampe',
    lignes: [
      'Système étudié : une lampe suspendue au plafond par un câble.',
      'On néglige l’action de l’air.',
      'La Terre attire la lampe.',
    ],
    contact: ['le câble'],
    distance: ['la Terre'],
  },
  {
    titre: 'Le parachutiste',
    systeme: 'le parachutiste',
    lignes: [
      'Système étudié : un parachutiste, parachute ouvert, loin du sol.',
      'Les suspentes sont attachées à son harnais.',
      'L’air touche son corps.',
      'La Terre l’attire.',
    ],
    contact: ['les suspentes', 'l’air'],
    distance: ['la Terre'],
  },
];

const liste = (l: readonly string[]) =>
  l.length === 1 ? String(l[0]) : `${l.slice(0, -1).join(', ')} et ${String(l.at(-1))}`;

const niveau5 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DOSSIERS);
  const type: Type = rng.pick(['contact', 'distance']);
  const bons = type === 'contact' ? d.contact : d.distance;
  const autres = type === 'contact' ? d.distance : d.contact;
  const tous = [...d.contact, ...d.distance];
  const bon = liste(bons);
  /** Deux listes des mêmes corps dans un autre ordre sont la même proposition. */
  const cle = (l: readonly string[]) => [...l].sort().join('|');
  const why = `Actions de contact sur ${d.systeme} : ${liste(d.contact)}. Actions à distance : ${liste(d.distance)}.`;
  const candidats = new Map(
    [autres, tous, [...bons.slice(0, 1), ...autres.slice(0, 1)]].map((l) => [cle(l), liste(l)] as const),
  );
  candidats.delete(cle(bons));
  const { answer, traps } = choice(rng, bon, [
    ...[...candidats.values()].map((label) => ({ label, why })),
    { label: 'aucun corps', why: `Plusieurs corps agissent sur ${d.systeme}. ${why}` },
  ]);
  return {
    prompt: `Lis le document. Dans un diagramme objet-interaction, quels corps exercent sur ${d.systeme} une action ${type === 'contact' ? 'de contact' : 'à distance'} (et seulement ceux-là) ?`,
    figure: { kind: 'document', title: d.titre, lines: d.lignes },
    answer,
    traps,
    hint: 'Dresse la liste des corps qui agissent sur le système, puis trie-les selon qu’ils le touchent ou non.',
    steps: [
      'On part du système étudié et on cherche tous les corps qui agissent sur lui.',
      why,
      `Réponse : **${bon}**.`,
    ],
    targetSeconds: 100,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const interactionsNotion: Skill = {
  id: 'p4-interactions',
  title: 'Les interactions',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **interaction** est une action réciproque entre deux corps : si la main pousse la porte, la porte agit aussi sur la main.',
      'Une **action de contact** s’exerce entre deux corps qui se touchent (une corde qui tire) ; une **action à distance** s’exerce sans contact (la Terre qui attire une pomme).',
    ],
    ...referencesInteractions(
      'identifier',
      'contact-distance',
      'interaction-force',
      'interaction',
      'contact',
      'a-distance',
      'gravitation',
      'poids',
      'aimant',
      'diagramme',
      'suspente',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
