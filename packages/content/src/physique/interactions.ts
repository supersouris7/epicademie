import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { association, maj, saisie } from '../sciences/st/outils.ts';
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
    texte: 'La Terre attire une pomme qui tombe d’une branche, sans que le sol l’ait encore touchée.',
    auteur: 'la Terre',
    receveur: 'la pomme',
    type: 'distance',
    why: 'La Terre agit sur la pomme par gravitation, même pendant la chute, sans contact.',
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
    prompt: `${a.texte} Il s’agit ici d’…`,
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

interface Systeme {
  readonly nom: string;
  readonly texte: string;
  /** [action, auteur (type)] : colonne de droite distincte. */
  readonly paires: readonly (readonly [string, string])[];
}

const SYSTEMES: readonly Systeme[] = [
  {
    nom: 'un voilier qui avance',
    texte: 'Un voilier avance sur la mer, tiré par une corde reliée à un autre bateau, le vent dans sa voile.',
    paires: [
      ['la voile est poussée', 'l’air (contact)'],
      ['la coque est soutenue', 'l’eau (contact)'],
      ['le voilier est tiré', 'la corde (contact)'],
      ['le voilier est attiré vers le bas', 'la Terre (à distance)'],
    ],
  },
  {
    nom: 'une luge tractée',
    texte:
      'Un enfant tire avec une corde une luge posée sur la neige ; un aimant fixé au bord attire une clé en fer posée sur la luge, sans la toucher.',
    paires: [
      ['la luge est tirée', 'la corde (contact)'],
      ['la luge est soutenue', 'la neige (contact)'],
      ['la luge est attirée vers le bas', 'la Terre (à distance)'],
      ['la clé est attirée vers le bord', 'l’aimant (à distance)'],
    ],
  },
  {
    nom: 'un cerf-volant',
    texte: 'Un cerf-volant vole, retenu par un fil, porté par le vent.',
    paires: [
      ['le cerf-volant est porté', 'le vent (contact)'],
      ['le cerf-volant est retenu', 'le fil (contact)'],
      ['le cerf-volant est attiré vers le bas', 'la Terre (à distance)'],
    ],
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const a = rng.pick(ACTIONS);
    const { answer, traps } = saisie(
      ['interaction', 'une interaction'],
      [
        ['action', 'Le mot attendu désigne l’action réciproque des deux corps, pas une seule action.'],
        ['force', 'La force modélise l’action ; l’action réciproque des deux corps a un autre nom.'],
        ['contact', 'Le contact désigne deux corps qui se touchent ; ce n’est pas le mot général.'],
      ],
    );
    return {
      prompt: `${a.texte} ${maj(a.auteur)} et ${a.receveur} agissent l’un sur l’autre. Quel mot désigne cette action réciproque ?`,
      answer,
      traps,
      hint: 'Le mot commence par le préfixe « inter- », qui évoque ce qui se passe entre deux corps.',
      steps: ['L’action réciproque de deux ou plusieurs corps porte un nom précis.', 'C’est une **interaction**.'],
      targetSeconds: 40,
    };
  }
  const s = rng.pick(SYSTEMES);
  return {
    prompt: `${s.texte} Associe chaque effet à son auteur et à la nature de l’action.`,
    answer: association(rng, s.paires),
    hint: 'Pour chaque effet, cherche le corps responsable, puis vérifie s’il touche l’objet.',
    steps: [
      'On cherche l’auteur de chaque action, puis on vérifie le contact.',
      s.paires.map(([e, a]) => `${e} → **${a}**`).join(' ; '),
    ],
    targetSeconds: 75,
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
    ],
    contact: ['la table'],
    distance: ['l’aimant', 'la Terre'],
  },
  {
    titre: 'La lampe suspendue',
    systeme: 'la lampe',
    lignes: [
      'Système étudié : une lampe suspendue au plafond par un câble.',
      'La lampe ne touche que le câble.',
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
  const why = `Actions de contact sur ${d.systeme} : ${liste(d.contact)}. Actions à distance : ${liste(d.distance)}.`;
  const candidats = [liste(autres), liste(tous), liste([...bons.slice(0, 1), ...autres.slice(0, 1)])];
  const { answer, traps } = choice(rng, bon, [
    ...[...new Set(candidats)].filter((c) => c !== bon).map((label) => ({ label, why })),
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
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
