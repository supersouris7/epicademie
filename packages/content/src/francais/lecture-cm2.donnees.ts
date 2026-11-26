/**
 * Données du chapitre « Lire et comprendre » (CM2). Faits cités : identifiant de source (registre `sources.ts`) et
 * citation exacte. Tous les textes à lire sont écrits pour l'exercice.
 */
import type { TexteLong, Trou } from './lecture.donnees.ts';
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const faits = new Map<string, Fait>();
const fait = (id: string, source: string, citation: string): string => {
  faits.set(id, { id: `l2-${id}`, source, citation });
  return `l2-${id}`;
};
/** Article du Dictionnaire de l'Académie française, 9e édition (identifiant `academie-…`). */
const acad = (article: string, citation: string, id = article) => fait(`def-${id}`, `academie-${article}`, citation);
/** Article du Trésor de la langue française informatisé (identifiant `cnrtl-…`). */
const tlf = (article: string, citation: string, id = article) => fait(`def-${id}`, `cnrtl-${article}`, citation);

// ───────────────────────── Programme (cycle 3, CM2) ─────────────────────────

fait(
  'prog-essentiel',
  PROGRAMME,
  'Restituer l’essentiel d’un texte qui contient des informations explicites et des informations implicites',
);
fait(
  'prog-genres',
  PROGRAMME,
  'Reconnaître et nommer les principaux genres littéraires à l’aide de critères travaillés en classe',
);
fait(
  'prog-composite',
  PROGRAMME,
  'Reconnaître et nommer les caractéristiques des différents éléments d’un document composite',
);
fait(
  'prog-rapprocher',
  PROGRAMME,
  'Rapprocher deux documents convergents, de genres différents, pour repérer et compléter les informations',
);
fait(
  'prog-inferences',
  PROGRAMME,
  'À partir de questions posées, prélever des informations (en faisant des inférences si nécessaire) qui seront combinées pour donner un sens global au(x) document(s)',
);
fait(
  'prog-contexte',
  PROGRAMME,
  'Se servir du contexte et de la morphologie pour comprendre les mots inconnus rencontrés au cours de sa lecture',
);
fait(
  'prog-polysemie',
  PROGRAMME,
  'Approfondir sa compréhension de la notion de polysémie dans un contexte non référentiel',
);
fait('prog-motivations', PROGRAMME, 'conduisent les élèves à comprendre les motivations de ces personnages');
fait(
  'prog-reprises',
  PROGRAMME,
  'les reprises pronominales et le choix des temps verbaux constituent notamment un point d’attention',
);

// ───────────────────────── Définitions ─────────────────────────

acad('narratif', 'Relatif à la narration, au récit.');
acad('recit', 'Relation, narration, orale ou écrite, d’un évènement.');
acad(
  'fiction',
  'Œuvre de fiction, œuvre littéraire ou artistique née de l’imagination de l’auteur, par opposition à Œuvre documentaire, historique, biographique, etc.',
);
acad('poeme', 'pièce en vers');
acad('dialogue', 'l’ensemble des paroles qu’échangent les personnages');
tlf('documentaire', 'Qui a le caractère, l’intérêt d’un document; qui offre une source de documents.');
acad('document', 'Écrit ou, par extension, tout objet pouvant apporter un renseignement, établir ou infirmer un fait.');
tlf('titre', 'Inscription au début d’un ouvrage pour indiquer son sujet');
acad('paragraphe', 'Subdivision d’un texte en prose, marquée par un alinéa ou un retour à la ligne');
acad('schema', 'Tracé figurant de façon simplifiée la disposition d’un lieu, le fonctionnement d’un système');
acad(
  'legende',
  'Notice, liste placée dans un coin ou aux marges d’une carte géographique, d’un plan, etc., et fournissant l’explication des signes conventionnels utilisés.',
);
acad(
  'implicite',
  'Qui est contenu dans un discours, une proposition, sans y être énoncé expressément, mais qui s’en tire naturellement par induction ou déduction.',
);
acad('indice', 'Signe apparent et probable qu’une chose est, existe, qui met sur la trace de son existence.');
acad('contexte', 'Ensemble du texte entourant un mot, une phrase, un passage.');
acad('polysemie', 'Caractère d’un mot qui présente plusieurs sens.');
acad('narrateur', 'Celui, celle qui narre, qui raconte quelque chose.');
acad('auteur', 'Personne qui a composé et réalisé une œuvre littéraire, scientifique ou artistique.');
acad('personnage', 'Être fictif d’une œuvre littéraire quelle qu’elle soit');
tlf('je', 'celui, celle qui dit « je »');

/** Faits de définition utilisés par chaque notion. */
export const DEFINITIONS = {
  narratif: ['l2-def-narratif', 'l2-def-recit', 'l2-def-fiction', 'l2-def-poeme', 'l2-def-dialogue'],
  documentaire: [
    'l2-def-documentaire',
    'l2-def-document',
    'l2-def-fiction',
    'l2-def-titre',
    'l2-def-paragraphe',
    'l2-def-schema',
    'l2-def-legende',
  ],
  inferences: ['l2-def-implicite', 'l2-def-indice'],
  sens: ['l2-def-contexte', 'l2-def-polysemie'],
  personnages: ['l2-def-narrateur', 'l2-def-auteur', 'l2-def-personnage', 'l2-def-je', 'l2-def-dialogue'],
} as const;

const trou = (etiquette: string, bon: string, faux: readonly [string, string], preuve: string): Trou => ({
  etiquette,
  bon,
  faux,
  preuve,
});

/** Question à choix : réponse juste, distracteurs expliqués. */
export interface Choix {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly question: string;
  readonly bon: string;
  readonly faux: readonly (readonly [string, string])[];
  readonly preuve: string;
}

/** Question à saisie : écritures justes et erreurs typiques expliquées. */
export interface Saisie {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly question: string;
  readonly accepted: readonly string[];
  readonly pieges: readonly (readonly [string, string])[];
  readonly preuve: string;
}

/** Suite d'événements à remettre dans l'ordre. */
export interface Suite {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly ordre: readonly string[];
  readonly preuve: string;
}

// ───────────────────────── 1. Texte narratif ─────────────────────────

export type Genre = 'recit' | 'poeme' | 'theatre' | 'documentaire';

export const GENRES: Readonly<Record<Genre, { readonly nom: string; readonly critere: string }>> = {
  recit: { nom: 'un récit', critere: 'il raconte des événements vécus par des personnages' },
  poeme: { nom: 'un poème', critere: 'il est écrit en vers, souvent avec des rimes' },
  theatre: { nom: 'une pièce de théâtre', critere: 'les noms des personnages précèdent leurs paroles' },
  documentaire: { nom: 'un documentaire', critere: 'il donne des informations sur un sujet réel' },
};

export interface Extrait {
  readonly genre: Genre;
  readonly lignes: readonly string[];
}

const extrait = (genre: Genre, ...lignes: string[]): Extrait => ({ genre, lignes });

export const EXTRAITS: readonly Extrait[] = [
  extrait(
    'recit',
    'Ce soir-là, Nora entendit un bruit au grenier.',
    'Elle prit sa lampe et monta sans faire de bruit.',
  ),
  extrait('recit', 'Le vieux pêcheur tira son filet.', 'Une petite boîte brillait au fond : il la saisit.'),
  extrait('recit', 'Soudain, le chien partit en courant vers la forêt.', 'Basile le suivit, très inquiet.'),
  extrait('poeme', 'La lune pose sur le toit', 'Un grand manteau couleur de soie ;', 'La nuit chuchote autour de moi.'),
  extrait('poeme', 'Petit ruisseau qui court sans bruit,', 'Tu chantes encore après la pluie.'),
  extrait('poeme', 'Sous le vieux chêne endormi,', 'Un hérisson fait son nid ;', 'Dehors, l’hiver est parti.'),
  extrait('theatre', 'LÉA. — Tu as vu mon cahier ?', 'TOM (en cherchant sous la table). — Non, pas ici !'),
  extrait('theatre', 'LE ROI. — Où est passée ma couronne ?', 'LE PAGE (tremblant). — Je l’ignore, Majesté.'),
  extrait('theatre', 'INÈS. — Vite, le bus arrive !', 'PAUL (essoufflé). — Attends-moi !'),
  extrait('documentaire', 'Le hérisson est un petit mammifère.', 'La nuit, il cherche des insectes et des vers.'),
  extrait(
    'documentaire',
    'Un volcan est une montagne d’où sort de la lave.',
    'La lave est une roche fondue très chaude.',
  ),
  extrait('documentaire', 'La baleine bleue vit dans les océans.', 'C’est un mammifère : elle respire de l’air.'),
];

/** Niveau 3 : les phrases d'un récit à remettre dans l'ordre (connecteurs et enchaînement des faits). */
export const RECITS_A_CONSTRUIRE: readonly Suite[] = [
  {
    titre: 'Le cartable',
    lignes: [],
    ordre: [
      'Un matin, Jules oublie son cartable dans le bus.',
      'Il s’en aperçoit seulement devant la porte de la classe.',
      'Alors, sa maîtresse téléphone au dépôt des bus.',
      'Le soir, Jules y récupère enfin son cartable.',
    ],
    preuve: 'Jules oublie d’abord le cartable, puis il s’en aperçoit, on appelle, et il le récupère enfin.',
  },
  {
    titre: 'La cabane',
    lignes: [],
    ordre: [
      'Au début de l’été, Sana ramasse des branches mortes.',
      'Puis elle les attache pour monter les murs de sa cabane.',
      'Mais un orage éclate et renverse tout.',
      'Le lendemain, elle reconstruit sa cabane, plus solide.',
    ],
    preuve: 'Les branches servent aux murs, l’orage les renverse, puis « le lendemain » Sana recommence.',
  },
  {
    titre: 'Le chaton',
    lignes: [],
    ordre: [
      'Un soir, Milo entend un miaulement sous une voiture.',
      'Il s’allonge et découvre un chaton tremblant.',
      'Ensuite, il l’enveloppe dans son écharpe pour le réchauffer.',
      'Depuis ce jour, le chaton dort au pied de son lit.',
    ],
    preuve: 'Milo entend, découvre, réchauffe le chaton, et « depuis ce jour » le garde.',
  },
  {
    titre: 'Le trésor',
    lignes: [],
    ordre: [
      'Un jour de pluie, Louise fouille dans le vieux coffre du grenier.',
      'Elle y trouve une carte couverte de croix rouges.',
      'Aussitôt, elle court la montrer à son frère.',
      'Ensemble, ils partent chercher la première croix.',
    ],
    preuve: 'La carte se trouve dans le coffre, Louise la montre à son frère, puis ils partent.',
  },
];

/** Niveau 4 : récit qui ressemble à un documentaire, ou documentaire qui ressemble à un récit. */
export interface Piege {
  readonly genre: 'recit' | 'documentaire';
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly preuve: string;
}

export const TEXTES_TROMPEURS: readonly Piege[] = [
  {
    genre: 'recit',
    titre: 'La traversée',
    lignes: [
      'Les manchots peuvent nager très longtemps.',
      'Ce matin-là, pourtant, le petit Pilou refusa d’entrer dans l’eau.',
      'Sa mère le poussa doucement ; il plongea enfin, ravi.',
    ],
    preuve:
      'La première ligne informe, mais ensuite Pilou, un personnage, vit un événement raconté : « refusa », « plongea ».',
  },
  {
    genre: 'documentaire',
    titre: 'Une journée de fourmi',
    lignes: [
      'Chaque matin, la fourmi ouvrière sort de la fourmilière.',
      'Elle repère de la nourriture et laisse une trace odorante.',
      'Ses compagnes suivent cette trace pour l’aider.',
    ],
    preuve:
      'Aucun événement unique n’est raconté : le texte explique ce que font les fourmis en général (« chaque matin »).',
  },
  {
    genre: 'recit',
    titre: 'Le phare',
    lignes: [
      'Un phare envoie de la lumière aux navires.',
      'La nuit de la tempête, le gardien Armel vit la lampe s’éteindre.',
      'Il grimpa les marches quatre à quatre pour la rallumer.',
    ],
    preuve: 'Armel vit un événement précis, « la nuit de la tempête » : le texte raconte une histoire.',
  },
  {
    genre: 'documentaire',
    titre: 'Le voyage des hirondelles',
    lignes: [
      'En automne, les hirondelles quittent la France.',
      'Elles volent vers l’Afrique, où elles trouvent des insectes.',
      'Au printemps, elles reviennent pour faire leur nid.',
    ],
    preuve: 'Le texte parle de toutes les hirondelles et donne des faits réels : il informe.',
  },
];

/** Niveau 4 : le texte ne suit pas l'ordre des faits. */
export const RECITS_DANS_LE_DESORDRE: readonly Suite[] = [
  {
    titre: 'La médaille',
    lignes: [
      'Hugo montre sa médaille à toute la famille.',
      'Il l’a gagnée dimanche, à la course du village.',
      'Avant le départ, il avait lacé deux fois ses chaussures.',
      'La veille, il s’était couché très tôt.',
      'Pendant la course, il a doublé trois coureurs dans la montée.',
    ],
    ordre: [
      'Hugo se couche tôt',
      'Hugo lace ses chaussures',
      'Hugo double trois coureurs',
      'Hugo gagne sa médaille',
      'Hugo montre sa médaille',
    ],
    preuve: '« La veille » et « avant le départ » renvoient plus tôt ; la médaille est montrée après la course.',
  },
  {
    titre: 'Le gâteau',
    lignes: [
      'Mina sert un gâteau doré à ses amis.',
      'Une heure plus tôt, elle l’avait glissé dans le four.',
      'Auparavant, elle avait mélangé la farine et les œufs.',
      'Pour cela, elle avait d’abord fait les courses au marché.',
      'Après la cuisson, elle l’a laissé refroidir.',
    ],
    ordre: [
      'Mina fait les courses',
      'Mina mélange la farine et les œufs',
      'Mina met le gâteau au four',
      'Le gâteau refroidit',
      'Mina sert le gâteau',
    ],
    preuve: '« Auparavant » et « d’abord » remontent le temps : le texte commence par la fin.',
  },
  {
    titre: 'La lettre',
    lignes: [
      'Ce vendredi, Enzo reçoit une réponse de son correspondant.',
      'Il avait posté sa lettre dix jours plus tôt.',
      'Avant cela, il avait choisi un joli timbre.',
      'Mais d’abord, il avait écrit deux pages sur son école.',
      'En découvrant la réponse, il saute de joie.',
    ],
    ordre: [
      'Enzo écrit sa lettre',
      'Enzo choisit un timbre',
      'Enzo poste sa lettre',
      'Enzo reçoit une réponse',
      'Enzo saute de joie',
    ],
    preuve: '« Mais d’abord » désigne le tout premier fait, puis le timbre, puis la poste.',
  },
];

export const LONGS_RECITS: readonly TexteLong[] = [
  {
    titre: 'La clé du jardin',
    lignes: [
      'Depuis des semaines, Salomé regardait la petite porte du mur.',
      'Un après-midi, elle découvrit une clé rouillée sous une pierre.',
      'Elle hésita longtemps, puis la glissa dans la serrure.',
      'La porte grinça et s’ouvrit sur un jardin abandonné.',
      'Le soir, Salomé raconta tout à son grand-père, qui sourit.',
    ],
    trous: [
      trou(
        'Ce texte est',
        'un récit',
        ['un poème', 'un documentaire'],
        'Il raconte ce qui arrive à Salomé, dans l’ordre.',
      ),
      trou('Le personnage principal est', 'Salomé', ['le grand-père', 'la porte'], 'C’est elle qui agit : « Salomé ».'),
      trou(
        'Salomé trouve d’abord',
        'une clé rouillée',
        ['un jardin abandonné', 'une lettre'],
        'La ligne 2 dit : « elle découvrit une clé rouillée ».',
      ),
      trou(
        'À la fin, Salomé',
        'raconte tout à son grand-père',
        ['referme la porte', 'jette la clé'],
        'La dernière ligne dit : « Salomé raconta tout ».',
      ),
    ],
  },
  {
    titre: 'Le renard',
    lignes: [
      'Un soir d’hiver, un renard affamé s’approcha de la ferme.',
      'La fermière avait laissé le poulailler entrouvert.',
      'Mais le chien aboya si fort que le renard s’arrêta net.',
      'Il fit demi-tour et disparut entre les arbres.',
      'Depuis, la fermière vérifie la porte chaque soir.',
    ],
    trous: [
      trou('Ce texte est', 'un récit', ['une pièce de théâtre', 'un documentaire'], 'Il raconte une suite de faits.'),
      trou('Le renard vient parce qu’il est', 'affamé', ['perdu', 'blessé'], 'La ligne 1 dit : « un renard affamé ».'),
      trou(
        'Ce qui arrête le renard :',
        'les aboiements du chien',
        ['la porte fermée', 'la fermière'],
        'La ligne 3 dit : « le chien aboya si fort ».',
      ),
      trou(
        'À la fin, la fermière',
        'vérifie la porte chaque soir',
        ['adopte le renard', 'vend ses poules'],
        'La dernière ligne dit : « la fermière vérifie la porte ».',
      ),
    ],
  },
  {
    titre: 'La radio du phare',
    lignes: [
      'Cette nuit-là, la tempête secouait l’île.',
      'Ilyes réparait un vieux poste de radio avec sa tante.',
      'Tout à coup, une voix appela au secours : un bateau dérivait.',
      'La tante donna aussitôt l’alerte aux sauveteurs.',
      'À l’aube, le bateau rentrait au port, sain et sauf.',
    ],
    trous: [
      trou('Ce texte est', 'un récit', ['un poème', 'un mode d’emploi'], 'Des personnages vivent des événements.'),
      trou(
        'L’événement qui change tout est',
        'l’appel au secours',
        ['la réparation de la radio', 'le retour au port'],
        '« Tout à coup » annonce l’appel : un bateau dérive.',
      ),
      trou(
        'L’alerte est donnée par',
        'la tante',
        ['Ilyes', 'les sauveteurs'],
        'La ligne 4 dit : « La tante donna aussitôt l’alerte ».',
      ),
      trou(
        'L’histoire se termine',
        'à l’aube',
        ['en pleine tempête', 'à midi'],
        'La dernière ligne commence par « À l’aube ».',
      ),
    ],
  },
];

// ───────────────────────── 2. Texte documentaire ─────────────────────────

export const SUJETS: readonly Choix[] = [
  {
    titre: 'Document',
    lignes: ['Les abeilles vivent en colonie dans une ruche.', 'Les ouvrières récoltent le nectar des fleurs.'],
    question: 'De quoi parle surtout ce document ?',
    bon: 'de la vie des abeilles',
    faux: [
      ['de la fabrication d’un pot', 'Le texte ne parle d’aucun pot. Les abeilles sont citées dès le début.'],
      ['des fleurs du jardin', 'Les fleurs servent aux abeilles, mais le sujet principal est la colonie.'],
    ],
    preuve: 'Les deux phrases parlent des abeilles : « abeilles », « ouvrières ».',
  },
  {
    titre: 'Document',
    lignes: ['La Lune tourne autour de la Terre.', 'Elle ne produit pas de lumière : elle renvoie celle du Soleil.'],
    question: 'De quoi parle surtout ce document ?',
    bon: 'de la Lune',
    faux: [
      ['du Soleil', 'Le Soleil est cité pour expliquer la lumière, mais tout parle de la Lune.'],
      ['d’une fusée', 'Aucune fusée n’est citée dans le texte.'],
    ],
    preuve: '« La Lune » puis « Elle » : les deux phrases parlent de la Lune.',
  },
  {
    titre: 'Document',
    lignes: ['Le castor coupe des arbres avec ses dents.', 'Avec les branches, il construit un barrage.'],
    question: 'De quoi parle surtout ce document ?',
    bon: 'du travail du castor',
    faux: [
      ['des bûcherons', 'Ce n’est pas un humain qui coupe les arbres : c’est le castor.'],
      ['de la pêche en rivière', 'La pêche n’est jamais citée.'],
    ],
    preuve: 'Le castor coupe et construit : le document parle de son travail.',
  },
  {
    titre: 'Document',
    lignes: ['Un musée conserve des objets anciens.', 'Les visiteurs les regardent sans les toucher.'],
    question: 'De quoi parle surtout ce document ?',
    bon: 'du musée et de ses visiteurs',
    faux: [
      ['d’une brocante', 'On n’achète rien : le texte parle d’un musée.'],
      ['d’un atelier de réparation', 'Les objets sont conservés, pas réparés ici.'],
    ],
    preuve: '« Un musée » et « les visiteurs » : voilà le sujet.',
  },
];

export interface Paragraphe {
  readonly titre: string;
  readonly phrase: string;
}

export interface Dossier {
  readonly sujet: string;
  readonly paragraphes: readonly [Paragraphe, Paragraphe, Paragraphe];
}

const par = (titre: string, phrase: string): Paragraphe => ({ titre, phrase });

export const DOSSIERS: readonly Dossier[] = [
  {
    sujet: 'La grenouille',
    paragraphes: [
      par('Où vit-elle ?', 'On la trouve près des mares et des étangs.'),
      par('Que mange-t-elle ?', 'Elle attrape des insectes avec sa langue collante.'),
      par('Comment naît-elle ?', 'Elle sort d’un œuf, d’abord sous la forme d’un têtard.'),
    ],
  },
  {
    sujet: 'Le chameau',
    paragraphes: [
      par('Son milieu', 'Il vit dans des déserts très secs.'),
      par('Ses bosses', 'Elles contiennent de la graisse qui lui sert de réserve.'),
      par('Son utilité', 'Des voyageurs le chargent pour transporter des marchandises.'),
    ],
  },
  {
    sujet: 'Le vélo',
    paragraphes: [
      par('Les pièces', 'Un cadre, deux roues, des pédales et un guidon le composent.'),
      par('La sécurité', 'Un casque protège la tête en cas de chute.'),
      par('L’entretien', 'On huile la chaîne et on gonfle les pneus régulièrement.'),
    ],
  },
  {
    sujet: 'La forêt',
    paragraphes: [
      par('Les plantes', 'Des arbres, des mousses et des fougères y poussent.'),
      par('Les animaux', 'On y rencontre des cerfs, des écureuils et des pics.'),
      par('La protection', 'Il ne faut pas y allumer de feu.'),
    ],
  },
];

export const INFOS_A_PRELEVER: readonly Saisie[] = [
  {
    titre: 'La tortue luth',
    lignes: [
      'La tortue luth est la plus grande tortue de mer.',
      'Elle se nourrit surtout de méduses.',
      'La femelle revient sur une plage pour pondre ses œufs.',
    ],
    question: 'Écris ce que mange surtout la tortue luth.',
    accepted: ['des méduses', 'les méduses', 'méduses', 'de méduses', 'méduse', 'une méduse'],
    pieges: [
      ['des œufs', 'Les œufs sont pondus par la femelle ; elle ne s’en nourrit pas ici.'],
      ['des poissons', 'Le texte ne parle pas de poissons : relis la ligne 2.'],
    ],
    preuve: 'La ligne 2 dit : « Elle se nourrit surtout de méduses. »',
  },
  {
    titre: 'Le papier',
    lignes: [
      'Le papier neuf se fabrique à partir du bois.',
      'On le broie pour obtenir une pâte avec de l’eau.',
      'La pâte est ensuite pressée puis séchée.',
    ],
    question: 'Écris la matière qui sert à fabriquer le papier neuf.',
    accepted: ['le bois', 'bois', 'du bois'],
    pieges: [
      ['la pâte', 'La pâte vient après : elle est fabriquée à partir d’une autre matière.'],
      ['l’eau', 'L’eau aide à faire la pâte, mais le papier neuf vient d’une autre matière.'],
    ],
    preuve: 'La ligne 1 dit : « à partir du bois ».',
  },
  {
    titre: 'Le manchot empereur',
    lignes: [
      'Le manchot empereur vit en Antarctique.',
      'C’est le mâle qui couve l’œuf sur ses pattes.',
      'Pendant ce temps, la femelle part se nourrir en mer.',
    ],
    question: 'Écris qui couve l’œuf : le mâle ou la femelle ?',
    accepted: ['le mâle', 'mâle', 'le male', 'male'],
    pieges: [
      ['la femelle', 'La femelle part se nourrir en mer pendant la couvaison.'],
      ['le petit', 'Le petit n’est pas encore sorti de l’œuf.'],
    ],
    preuve: 'La ligne 2 dit : « C’est le mâle qui couve l’œuf ».',
  },
  {
    titre: 'La bibliothèque',
    lignes: [
      'La bibliothèque du quartier ouvre le mercredi et le samedi.',
      'On peut emprunter cinq livres à la fois.',
      'Le prêt dure trois semaines.',
    ],
    question: 'Écris combien de semaines dure le prêt.',
    accepted: ['trois', '3', 'trois semaines', '3 semaines'],
    pieges: [
      ['cinq', '« Cinq » compte les livres, pas les semaines.'],
      ['deux', 'Deux jours d’ouverture sont cités, mais la question porte sur le prêt.'],
    ],
    preuve: 'La ligne 3 dit : « Le prêt dure trois semaines. »',
  },
];

/** Niveau 4 : il faut rapprocher deux documents pour répondre. */
export const DEUX_DOCUMENTS: readonly Saisie[] = [
  {
    titre: 'Deux documents sur le marché',
    lignes: [
      'Document 1 (article) : « Le marché a lieu le jour du cours de natation. »',
      'Document 2 (affiche de la piscine) : « Cours de natation : chaque jeudi. »',
    ],
    question: 'Écris le jour du marché.',
    accepted: ['jeudi', 'le jeudi', 'chaque jeudi'],
    pieges: [
      ['mercredi', 'Aucun document ne parle du mercredi. Rapproche les deux lignes.'],
      ['natation', 'La natation relie les deux documents, mais on cherche un jour.'],
    ],
    preuve: 'Le marché a lieu le jour de la natation ; l’affiche donne ce jour : jeudi.',
  },
  {
    titre: 'Deux documents sur le sentier',
    lignes: [
      'Document 1 (guide) : « Le sentier bleu passe par le lac. Le sentier vert longe la rivière. »',
      'Document 2 (panneau) : « Fermeture du sentier du lac pour travaux. »',
    ],
    question: 'Écris la couleur du sentier fermé.',
    accepted: ['bleu', 'le bleu', 'sentier bleu', 'le sentier bleu'],
    pieges: [
      ['vert', 'Le sentier vert longe la rivière : le panneau parle du sentier du lac.'],
      ['rouge', 'Aucun document ne cite de sentier rouge.'],
    ],
    preuve: 'Le panneau ferme le sentier du lac ; le guide dit que le bleu passe par le lac.',
  },
  {
    titre: 'Deux documents sur les oiseaux',
    lignes: [
      'Document 1 (fiche) : « La mésange pèse environ 18 grammes, le moineau environ 30 grammes. »',
      'Document 2 (carnet) : « L’oiseau le plus léger du jardin a niché dans le pommier. »',
      'Dans ce jardin, on ne voit que des mésanges et des moineaux.',
    ],
    question: 'Écris l’oiseau qui a niché dans le pommier.',
    accepted: ['la mésange', 'mésange', 'une mésange', 'mesange', 'la mesange'],
    pieges: [
      ['le moineau', 'Le moineau pèse plus lourd : ce n’est pas le plus léger.'],
      ['le merle', 'La ligne 3 dit qu’on ne voit que des mésanges et des moineaux.'],
    ],
    preuve: 'La fiche montre que la mésange est la plus légère ; le carnet parle du plus léger.',
  },
  {
    titre: 'Deux documents sur la salle',
    lignes: [
      'Document 1 (programme) : « L’exposé sur les volcans a lieu dans la salle des cartes. »',
      'Document 2 (plan) : « Salle des cartes : au deuxième étage. »',
    ],
    question: 'Écris l’étage où a lieu l’exposé sur les volcans.',
    accepted: ['deuxième', 'le deuxième', 'au deuxième étage', 'deuxième étage', '2', '2e', 'le 2e', 'au 2e étage'],
    pieges: [
      ['premier', 'Aucun document ne parle du premier étage.'],
      ['la salle des cartes', 'C’est la salle ; la question demande l’étage.'],
    ],
    preuve: 'Le programme donne la salle ; le plan donne son étage.',
  },
];

/** Niveau 4 : les éléments d'un document composite et leur rôle. */
export const ELEMENTS: readonly (readonly [string, string])[] = [
  ['le titre', 'annonce le sujet du document'],
  ['le paragraphe', 'développe une idée en quelques phrases'],
  ['le schéma', 'montre de façon simplifiée comment c’est fait'],
  ['la légende', 'explique les signes d’un dessin ou d’un plan'],
  ['la source', 'dit d’où vient l’information'],
];

export const LONGS_DOCUMENTS: readonly TexteLong[] = [
  {
    titre: 'Le blaireau',
    lignes: [
      'Le blaireau creuse un terrier à plusieurs sorties.',
      'Il y dort le jour et sort chercher sa nourriture la nuit.',
      'Repas observés : vers de terre (beaucoup), fruits (parfois).',
      'Source : fiche écrite pour l’exercice.',
    ],
    trous: [
      trou(
        'Ce document est',
        'un texte documentaire',
        ['un poème', 'une pièce de théâtre'],
        'Il donne des informations sur un animal réel.',
      ),
      trou(
        'Le blaireau dort',
        'le jour',
        ['la nuit', 'tout l’hiver seulement'],
        'La ligne 2 dit : « Il y dort le jour ».',
      ),
      trou(
        'Il mange le plus souvent',
        'des vers de terre',
        ['des fruits', 'des poissons'],
        'La ligne 3 dit « beaucoup » après les vers de terre.',
      ),
      trou('Il cherche sa nourriture', 'la nuit', ['à midi', 'le jour'], 'Il « sort chercher sa nourriture la nuit ».'),
    ],
  },
  {
    titre: 'La lavande',
    lignes: [
      'La lavande est une plante à fleurs violettes et parfumées.',
      'Elle aime le soleil et les sols secs.',
      'Calendrier : floraison en été ; coupe après la floraison.',
      'Source : fiche écrite pour l’exercice.',
    ],
    trous: [
      trou(
        'Ce document sert à',
        'informer sur une plante',
        ['raconter une aventure', 'donner une recette'],
        'Il décrit la lavande et son calendrier.',
      ),
      trou('Elle fleurit', 'en été', ['en hiver', 'au printemps'], 'La ligne 3 dit : « floraison en été ».'),
      trou(
        'On la coupe',
        'après la floraison',
        ['avant la floraison', 'en plein hiver'],
        'La ligne 3 dit : « coupe après la floraison ».',
      ),
      trou(
        'Un sol qui lui convient :',
        'un sol sec',
        ['un sol inondé', 'un sol gelé'],
        'La ligne 2 dit qu’elle aime « les sols secs ».',
      ),
    ],
  },
  {
    titre: 'Le tri des déchets',
    lignes: [
      'Trier permet de réutiliser certaines matières.',
      'Bac jaune : emballages en métal ou en plastique, cartons.',
      'Borne verte : bouteilles et pots en verre.',
      'Source : fiche écrite pour l’exercice, règles d’une ville imaginaire.',
    ],
    trous: [
      trou(
        'Ce document est surtout fait pour',
        'expliquer comment trier',
        ['raconter une histoire', 'vendre des bacs'],
        'Il donne les règles de tri.',
      ),
      trou(
        'Un pot en verre va',
        'dans la borne verte',
        ['dans le bac jaune', 'dans le compost'],
        'La ligne 3 cite « bouteilles et pots en verre ».',
      ),
      trou(
        'Une boîte en carton va',
        'dans le bac jaune',
        ['dans la borne verte', 'dans la nature'],
        'La ligne 2 cite les cartons.',
      ),
      trou(
        'Ces règles viennent',
        'd’une ville imaginaire',
        ['d’un roman', 'd’un journal célèbre'],
        'La source le dit à la dernière ligne.',
      ),
    ],
  },
];

// ───────────────────────── 3. Inférences ─────────────────────────

export const DEVINETTES: readonly Choix[] = [
  {
    titre: 'Le détective',
    lignes: ['Noémie enfile ses bottes et prend son parapluie.', 'Sur le trottoir, des flaques brillent partout.'],
    question: 'Quel temps fait-il probablement ?',
    bon: 'Il pleut ou il vient de pleuvoir.',
    faux: [
      ['Il fait une chaleur sèche.', 'Avec des flaques partout, le sol n’est pas sec.'],
      ['Il neige abondamment.', 'On parle de flaques et de parapluie, pas de neige.'],
      ['Le vent souffle sans pluie.', 'Le vent seul ne fait pas de flaques.'],
    ],
    preuve: '« bottes », « parapluie » et « flaques » font penser à la pluie.',
  },
  {
    titre: 'Le détective',
    lignes: ['Hector souffle sur sa cuillère avant de la porter à sa bouche.', 'De la vapeur monte de son bol.'],
    question: 'Que peut-on comprendre ?',
    bon: 'Son repas est très chaud.',
    faux: [
      ['Son repas est glacé.', 'La vapeur montre que le bol n’est pas froid.'],
      ['Il joue avec sa cuillère.', 'Il souffle pour refroidir, pas pour jouer.'],
      ['Son bol est vide.', 'Il porte la cuillère à sa bouche : il y a quelque chose à manger.'],
    ],
    preuve: '« souffle » et « vapeur » montrent que c’est brûlant.',
  },
  {
    titre: 'Le détective',
    lignes: ['Le stade se vide. Des maillots rouges chantent en sortant.', 'Les maillots bleus marchent tête baissée.'],
    question: 'Qui a sans doute gagné le match ?',
    bon: 'l’équipe en rouge',
    faux: [
      ['l’équipe en bleu', 'Les bleus baissent la tête : ils semblent déçus.'],
      ['personne, le match va commencer', 'Le stade se vide : le match est fini.'],
      ['les arbitres', 'Les arbitres ne gagnent pas un match.'],
    ],
    preuve: 'Les rouges chantent, les bleus sont tristes.',
  },
  {
    titre: 'Le détective',
    lignes: ['Maël regarde l’horloge toutes les minutes.', 'Il tape du pied et soupire près de la porte.'],
    question: 'Que ressent Maël ?',
    bon: 'Il est impatient.',
    faux: [
      ['Il est endormi.', 'Il bouge et regarde sans cesse l’heure : il ne dort pas.'],
      ['Il est très détendu.', 'Taper du pied et soupirer ne montrent pas le calme.'],
      ['Il est enrhumé.', 'Rien ne parle d’un rhume.'],
    ],
    preuve: '« horloge », « tape du pied » et « soupire » montrent l’attente.',
  },
  {
    titre: 'Le détective',
    lignes: ['Une valise ouverte, des maillots de bain et de la crème solaire', 'sont posés sur le lit de Clara.'],
    question: 'Que prépare Clara ?',
    bon: 'un départ au bord de l’eau',
    faux: [
      ['un séjour à la neige', 'On n’emporte pas de maillot de bain pour skier.'],
      ['sa rentrée à l’école', 'La crème solaire et les maillots ne vont pas avec la rentrée.'],
      ['un déménagement définitif', 'Une seule valise et des affaires de bain : ce sont des vacances.'],
    ],
    preuve: '« maillots de bain » et « crème solaire » évoquent la baignade.',
  },
];

export const PAIRES: readonly (readonly [string, string])[] = [
  ['Arthur bâille et ferme les yeux sur son livre.', 'Le sommeil le gagne.'],
  ['Les vitres tremblent, un grondement suit une lueur dans le ciel.', 'Un orage approche.'],
  ['La boulangère affiche « Fermé » et baisse son rideau.', 'La boutique ne vend plus aujourd’hui.'],
  ['Le chien de Rose court vers la porte en remuant la queue.', 'Quelqu’un qu’il aime arrive.'],
  ['Samira relit la note, puis cache la feuille au fond du sac.', 'Le résultat la déçoit.'],
  ['Les branches sont nues et la mare est gelée.', 'C’est la saison froide.'],
  ['Le public se lève et applaudit longtemps.', 'Le spectacle a beaucoup plu.'],
  ['Des miettes traînent près de la boîte de biscuits ouverte.', 'Un gourmand est passé par là.'],
];

export const ENIGMES: readonly Saisie[] = [
  {
    titre: 'Une énigme',
    lignes: ['La salle est noire. Sur le grand écran, des images défilent.', 'Mon voisin grignote du maïs soufflé.'],
    question: 'Écris le lieu où je me trouve.',
    accepted: ['au cinéma', 'le cinéma', 'cinéma', 'un cinéma', 'dans un cinéma', 'cinema', 'au cinema'],
    pieges: [
      ['au théâtre', 'Au théâtre, des acteurs jouent sur scène : ici, des images sur un écran.'],
      ['à la maison', 'Une grande salle noire avec des voisins n’est pas un salon.'],
    ],
    preuve: '« salle noire », « grand écran » et « maïs soufflé »',
  },
  {
    titre: 'Une énigme',
    lignes: [
      'Il a rempli une trousse, vérifié son sac et choisi sa tenue.',
      'Demain, après les grandes vacances, il revoit sa classe.',
    ],
    question: 'Écris le nom du jour qu’il prépare : la…',
    accepted: ['rentrée', 'la rentrée', 'rentree', 'la rentree', 'rentrée des classes', 'la rentrée des classes'],
    pieges: [
      ['kermesse', 'Une kermesse ne vient pas juste après les grandes vacances.'],
      ['sortie', 'On parle de revoir sa classe après les vacances, pas d’une sortie.'],
    ],
    preuve: '« trousse », « sac » et « après les grandes vacances »',
  },
  {
    titre: 'Une énigme',
    lignes: ['Elle porte une blouse blanche et un stéthoscope.', 'Elle écoute mon cœur, puis écrit une ordonnance.'],
    question: 'Écris le métier de cette personne.',
    accepted: ['médecin', 'un médecin', 'docteur', 'une docteure', 'docteure', 'une médecin', 'medecin', 'doctoresse'],
    pieges: [
      ['pharmacienne', 'La pharmacienne donne les médicaments, elle n’écrit pas l’ordonnance.'],
      ['vétérinaire', 'Le vétérinaire soigne les animaux : ici, c’est mon cœur qu’on écoute.'],
    ],
    preuve: '« stéthoscope » et « ordonnance »',
  },
  {
    titre: 'Une énigme',
    lignes: [
      'Ce matin, tout est blanc dehors. Les voitures roulent au pas.',
      'Les enfants font un bonhomme avec leurs moufles.',
    ],
    question: 'Écris ce qui est tombé pendant la nuit.',
    accepted: ['de la neige', 'la neige', 'neige'],
    pieges: [
      ['de la pluie', 'La pluie ne rend pas tout blanc et ne fait pas de bonhomme.'],
      ['des feuilles', 'Les feuilles ne sont pas blanches.'],
    ],
    preuve: '« tout est blanc » et « un bonhomme »',
  },
];

export const ENIGMES_PIEGES: readonly Saisie[] = [
  {
    titre: 'Une énigme piégée',
    lignes: [
      'Anouk met son maillot et plonge. L’eau sent le chlore.',
      'Au bout de la ligne, elle touche le mur et sort la tête.',
      'La neige tombe pourtant derrière les grandes vitres.',
    ],
    question: 'Écris où se trouve Anouk.',
    accepted: ['à la piscine', 'la piscine', 'piscine', 'une piscine', 'dans une piscine', 'dans la piscine'],
    pieges: [
      ['à la mer', 'La mer ne sent pas le chlore et n’a pas de ligne ni de mur.'],
      ['à la montagne', 'La neige est dehors, derrière les vitres : Anouk nage à l’intérieur.'],
    ],
    preuve: '« chlore », « ligne » et « mur » : le plongeon a lieu dans un bassin couvert.',
  },
  {
    titre: 'Une énigme piégée',
    lignes: [
      'Rayan dit : « Quel beau cadeau ! » en ouvrant le paquet.',
      'Puis il repose les chaussettes sans les regarder.',
      'Ses épaules tombent et il ne sourit plus.',
    ],
    question: 'Écris ce que ressent vraiment Rayan : il est…',
    accepted: ['déçu', 'decu', 'il est déçu', 'deçu'],
    pieges: [
      ['ravi', 'Ses mots semblent joyeux, mais ses gestes disent le contraire.'],
      ['en colère', 'Il ne crie pas et ne s’agite pas : il est plutôt abattu.'],
    ],
    preuve: 'Les épaules tombent, il ne regarde pas et ne sourit plus.',
  },
  {
    titre: 'Une énigme piégée',
    lignes: [
      'Papi dit qu’il adore le printemps, et pourtant il éternue sans arrêt.',
      'Il se frotte les yeux devant les arbres en fleurs.',
      'Il prend le comprimé que son médecin lui a donné contre cette gêne.',
    ],
    question: 'Écris ce dont souffre sans doute Papi : une…',
    accepted: ['allergie', 'une allergie', 'allergie au pollen', 'une allergie au pollen'],
    pieges: [
      ['grippe', 'Les yeux qui grattent devant les fleurs ne font pas penser à la grippe.'],
      ['blessure', 'Il éternue : il ne s’est pas blessé.'],
    ],
    preuve: '« éternue », « se frotte les yeux » et « arbres en fleurs »',
  },
  {
    titre: 'Une énigme piégée',
    lignes: [
      'Le chat de Julie dort sur le lit, bien sec. La porte du jardin est restée ouverte.',
      'Pourtant, le vase est brisé et des traces de pattes mouillées partent vers la niche.',
      'Dehors, le chien secoue son poil trempé.',
    ],
    question: 'Écris quel animal a sans doute cassé le vase.',
    accepted: ['le chien', 'chien', 'un chien'],
    pieges: [
      ['le chat', 'Le chat dort, bien sec, et les traces vont vers la niche.'],
      ['un oiseau', 'Aucune plume n’est citée, et un oiseau n’a pas de pattes qui vont à la niche.'],
    ],
    preuve: 'Le chat est sec ; les traces mouillées mènent à la niche et le chien est trempé.',
  },
];

export const LONGS_INFERENCE: readonly TexteLong[] = [
  {
    titre: 'Le colis',
    lignes: [
      'Depuis lundi, Maya guette la fenêtre chaque matin.',
      'Enfin, un fourgon jaune s’arrête devant la maison.',
      'Elle dévale l’escalier en pantoufles et ouvre avant la sonnette.',
      'Dans le carton, elle trouve des lames neuves pour ses patins.',
      'Le soir, elle consulte les horaires de la patinoire.',
    ],
    trous: [
      trou(
        'Maya guette parce qu’elle',
        'attend un colis',
        ['surveille le voisin', 'cherche son chat'],
        '« guette la fenêtre » puis « un fourgon jaune » : elle attendait la livraison.',
      ),
      trou(
        'Elle descend vite parce qu’elle est',
        'impatiente',
        ['fatiguée', 'fâchée'],
        '« dévale l’escalier en pantoufles » montre sa hâte.',
      ),
      trou(
        'Le fourgon jaune sert à',
        'livrer des paquets',
        ['éteindre un incendie', 'ramasser les ordures'],
        'Juste après son arrivée, Maya ouvre un carton.',
      ),
      trou(
        'Maya va sans doute',
        'aller patiner',
        ['partir à la mer', 'faire du vélo'],
        'Des « lames neuves » et les « horaires de la patinoire ».',
      ),
    ],
  },
  {
    titre: 'Le nouveau',
    lignes: [
      'Ce lundi, un garçon reste seul près du portail.',
      'Il tient fort la bretelle de son sac et regarde ses chaussures.',
      'Il ne connaît aucun prénom dans la cour.',
      'Awa s’approche et lui propose de rejoindre leur partie de ballon.',
      'Il relève la tête et un sourire apparaît.',
    ],
    trous: [
      trou(
        'Ce garçon est probablement',
        'un nouvel élève',
        ['le directeur', 'un spectateur'],
        'Il « ne connaît aucun prénom » et attend seul près du portail.',
      ),
      trou(
        'Au début, il se sent',
        'intimidé',
        ['très fier', 'amusé'],
        'Il serre son sac et « regarde ses chaussures ».',
      ),
      trou(
        'Awa agit pour',
        'l’aider à se sentir accueilli',
        ['se moquer de lui', 'lui prendre son sac'],
        'Elle « lui propose de rejoindre leur partie ».',
      ),
      trou('À la fin, il est', 'soulagé', ['en colère', 'effrayé'], 'Il « relève la tête et un sourire apparaît ».'),
    ],
  },
  {
    titre: 'La nuit au refuge',
    lignes: [
      'La neige couvre le sentier et la lumière baisse.',
      'Elias et sa mère pressent le pas, les doigts engourdis.',
      'Ils aperçoivent une fumée au-dessus d’un toit.',
      'Le gardien leur tend deux bols sans poser de question.',
      'Plus tard, ils étalent leurs chaussettes près du poêle.',
    ],
    trous: [
      trou(
        'Ils pressent le pas parce que',
        'la nuit approche',
        ['ils jouent à courir', 'le soleil brûle'],
        '« la lumière baisse » : il faut arriver avant la nuit.',
      ),
      trou(
        'Leurs doigts montrent qu’il fait',
        'très froid',
        ['très chaud', 'doux'],
        'Les doigts sont « engourdis » dans la neige.',
      ),
      trou(
        'La fumée leur apprend',
        'qu’il y a un lieu chauffé',
        ['qu’il y a un incendie', 'que la neige fond'],
        'La fumée sort d’un toit, et le gardien les accueille.',
      ),
      trou(
        'Leurs chaussettes sont sans doute',
        'mouillées',
        ['neuves', 'trouées'],
        'Les « chaussettes près du poêle », après la neige : on les fait sécher.',
      ),
    ],
  },
];

// ───────────────────────── 4. Sens d'un mot ─────────────────────────

export interface Mot {
  readonly mot: string;
  readonly lignes: readonly string[];
  /** Sens dans ce texte, en mots simples (d'après la citation). */
  readonly sens: string;
  readonly faux: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  readonly indice: string;
  readonly faitId: string;
}

const autreSens = (s: string, mot: string): readonly [string, string] => [
  s,
  `« ${mot} » peut avoir ce sens ailleurs, mais pas dans ce texte. Relis les mots autour.`,
];
const hors = (s: string): readonly [string, string] => [
  s,
  'Ce sens ne va pas avec le texte. Remplace le mot et relis.',
];

type Dico = 'academie' | 'cnrtl';
const mot = (
  m: Omit<Mot, 'faitId'>,
  article: string,
  citation: string,
  dico: Dico = 'academie',
  id = article,
): Mot => ({
  ...m,
  faitId: fait(`mot-${id}`, `${dico}-${article}`, citation),
});

/** Mots à plusieurs sens : le contexte choisit. Deux entrées pour un même mot ont des textes et des sens différents. */
export const POLYSEMIE: readonly Mot[] = [
  mot(
    {
      mot: 'feuille',
      lignes: ['Rose prend une feuille et son crayon.', 'Elle y dessine un phare.'],
      sens: 'un morceau de papier pour écrire ou dessiner',
      faux: [
        autreSens('une partie plate d’une plante', 'feuille'),
        hors('une petite fenêtre'),
        hors('un outil pour couper'),
      ],
      indice: '« crayon » et « dessine »',
    },
    'feuille',
    'Morceau de papier généralement rectangulaire, sur lequel on écrit, on dessine.',
    'academie',
    'feuille-papier',
  ),
  mot(
    {
      mot: 'feuille',
      lignes: ['Sur la branche, une feuille tremble au vent.', 'Elle est dentelée et toute verte.'],
      sens: 'une partie plate d’une plante',
      faux: [
        autreSens('un morceau de papier pour écrire ou dessiner', 'feuille'),
        hors('une petite lampe'),
        hors('un instrument de musique'),
      ],
      indice: '« branche » et « dentelée »',
    },
    'feuille',
    'Organe végétal, généralement mince et plat, naissant d’un bourgeon',
    'academie',
    'feuille-plante',
  ),
  mot(
    {
      mot: 'glace',
      lignes: ['Après la chute de neige, la glace recouvre la mare.', 'Les canards glissent dessus.'],
      sens: 'de l’eau solidifiée par le froid',
      faux: [
        autreSens('un miroir', 'glace'),
        autreSens('un dessert froid et sucré', 'glace'),
        hors('une pierre précieuse'),
      ],
      indice: '« neige », « mare » et « glissent »',
    },
    'glace',
    'Eau solidifiée par le gel.',
    'academie',
    'glace-gel',
  ),
  mot(
    {
      mot: 'glace',
      lignes: ['Avant de sortir, Farid se regarde dans la glace.', 'Il recoiffe sa mèche.'],
      sens: 'un miroir',
      faux: [
        autreSens('de l’eau solidifiée par le froid', 'glace'),
        autreSens('un dessert froid et sucré', 'glace'),
        hors('un manteau d’hiver'),
      ],
      indice: '« se regarde » et « recoiffe »',
    },
    'glace',
    'Désigne également les miroirs de grande dimension',
    'academie',
    'glace-miroir',
  ),
  mot(
    {
      mot: 'glace',
      lignes: ['Au dessert, Lou choisit une glace à la vanille.', 'Elle la lèche avant qu’elle fonde.'],
      sens: 'un dessert froid et sucré',
      faux: [
        autreSens('un miroir', 'glace'),
        autreSens('de l’eau solidifiée par le froid', 'glace'),
        hors('un fruit du jardin'),
      ],
      indice: '« dessert », « vanille » et « lèche »',
    },
    'glace',
    'Préparation à base de lait ou de crème parfumés qu’on fait congeler.',
    'academie',
    'glace-dessert',
  ),
  mot(
    {
      mot: 'carte',
      lignes: ['Au restaurant, le serveur tend la carte à Zoé.', 'Elle choisit un plat et un dessert.'],
      sens: 'la liste des plats proposés',
      faux: [
        autreSens('un petit carton pour jouer', 'carte'),
        hors('une assiette creuse'),
        hors('la nappe de la table'),
      ],
      indice: '« restaurant » et « choisit un plat »',
    },
    'carte',
    'Liste des mets, des vins, proposés au choix du client, avec leur prix.',
    'academie',
    'carte-menu',
  ),
  mot(
    {
      mot: 'carte',
      lignes: ['Pour la bataille, Max pose une carte sur la table.', 'C’est le roi de cœur !'],
      sens: 'un petit carton pour jouer',
      faux: [
        autreSens('la liste des plats proposés', 'carte'),
        hors('un billet de train'),
        hors('une pièce de monnaie'),
      ],
      indice: '« bataille » et « roi de cœur »',
    },
    'carte',
    'petit carton rectangulaire fin illustré sur un côté par une figure et une couleur',
    'academie',
    'carte-jeu',
  ),
  mot(
    {
      mot: 'plume',
      lignes: ['Le corbeau perd une plume noire en s’envolant.', 'Elle tourne dans le vent.'],
      sens: 'ce qui recouvre le corps d’un oiseau',
      faux: [autreSens('un instrument pour écrire', 'plume'), hors('un morceau de bois'), hors('une griffe d’animal')],
      indice: '« corbeau » et « en s’envolant »',
    },
    'plume',
    'Chacun des tuyaux cornés et effilés, garnis de barbes et de duvet, qui recouvrent l’épiderme des oiseaux.',
    'academie',
    'plume-oiseau',
  ),
  mot(
    {
      mot: 'plume',
      lignes: ['L’écrivain trempe sa plume dans l’encrier.', 'Il commence sa lettre.'],
      sens: 'un instrument pour écrire',
      faux: [
        autreSens('ce qui recouvre le corps d’un oiseau', 'plume'),
        hors('un tampon pour effacer'),
        hors('une règle en bois'),
      ],
      indice: '« encrier » et « lettre »',
    },
    'plume',
    'Plume d’oiseau, taillée en pointe à une extrémité et fendue, dont on se servait pour écrire',
    'academie',
    'plume-ecrire',
  ),
  mot(
    {
      mot: 'bouton',
      lignes: ['Au jardin, un bouton de rose attend le soleil.', 'Demain, il s’ouvrira.'],
      sens: 'une fleur pas encore ouverte',
      faux: [autreSens('une petite pièce cousue sur un habit', 'bouton'), hors('une épine'), hors('une racine')],
      indice: '« rose » et « s’ouvrira »',
    },
    'bouton',
    'La fleur avant qu’elle s’épanouisse.',
    'academie',
    'bouton-fleur',
  ),
  mot(
    {
      mot: 'bouton',
      lignes: ['Il manque un bouton à la veste de Papa.', 'Mamie prend du fil et une aiguille.'],
      sens: 'une petite pièce cousue sur un habit',
      faux: [autreSens('une fleur pas encore ouverte', 'bouton'), hors('une poche'), hors('une fermeture à clé')],
      indice: '« veste », « fil » et « aiguille »',
    },
    'bouton',
    'Petite pièce de matière dure, le plus souvent ronde, cousue sur un vêtement',
    'academie',
    'bouton-habit',
  ),
];

/** Mots moins courants. */
export const MOTS_RARES: readonly Mot[] = [
  mot(
    {
      mot: 'pénombre',
      lignes: ['Les volets sont presque fermés.', 'Dans la pénombre, on devine à peine les meubles.'],
      sens: 'une faible clarté',
      faux: [hors('un grand soleil'), hors('un bruit sourd'), hors('une odeur forte')],
      indice: '« presque fermés » et « à peine »',
    },
    'penombre',
    'Demi-jour ; faible clarté.',
  ),
  mot(
    {
      mot: 'chancelle',
      lignes: ['Après le manège, Timéo chancelle.', 'Sa sœur lui tient le bras pour qu’il ne tombe pas.'],
      sens: 'penche d’un côté et de l’autre, comme s’il allait tomber',
      faux: [hors('chante à pleine voix'), hors('court très vite'), hors('s’endort aussitôt')],
      indice: '« le manège » et « qu’il ne tombe pas »',
    },
    'chanceler',
    'Pencher de côté et d’autre comme si on allait tomber',
  ),
  mot(
    {
      mot: 'arpente',
      lignes: ['Inquiet, le directeur arpente le couloir.', 'Il va d’un bout à l’autre, à grands pas.'],
      sens: 'parcourt à grands pas',
      faux: [hors('balaie avec soin'), hors('peint en blanc'), hors('regarde de loin')],
      indice: '« d’un bout à l’autre » et « grands pas »',
    },
    'arpenter',
    'Parcourir à grands pas.',
  ),
  mot(
    {
      mot: 'hisse',
      lignes: ['Avec ses deux bras, Nino hisse le sac sur l’étagère.', 'Il souffle fort.'],
      sens: 'fait monter à la force des bras',
      faux: [hors('vide complètement'), hors('range par couleur'), hors('cache sous le lit')],
      indice: '« deux bras » et « sur l’étagère »',
    },
    'hisser',
    'Faire monter par la force des bras.',
  ),
  mot(
    {
      mot: 'lugubre',
      lignes: ['La maison abandonnée a un air lugubre.', 'On frissonne rien qu’à la voir.'],
      sens: 'triste et sombre, qui fait penser à la mort',
      faux: [hors('gai et coloré'), hors('neuf et propre'), hors('chaud et accueillant')],
      indice: '« abandonnée » et « on frissonne »',
    },
    'lugubre',
    'Qui évoque le deuil et la mort, qui marque ou inspire une sombre tristesse.',
  ),
  mot(
    {
      mot: 'épie',
      lignes: ['Caché derrière le rideau, le chat épie le moineau.', 'Il ne bouge pas d’un poil.'],
      sens: 'observe en secret, avec attention',
      faux: [hors('chasse à grands cris'), hors('appelle gentiment'), hors('ignore complètement')],
      indice: '« caché » et « ne bouge pas »',
    },
    'epier',
    'Observer quelqu’un secrètement et avec attention.',
  ),
  mot(
    {
      mot: 'récif',
      lignes: ['La barque a heurté un récif tout près de la côte.', 'Des vagues se brisent juste dessus.'],
      sens: 'un rocher à fleur d’eau près de la côte',
      faux: [hors('un grand filet'), hors('un phare allumé'), hors('un poisson géant')],
      indice: '« heurté », « près de la côte » et « des vagues se brisent »',
    },
    'recif',
    'Rocher ou chaîne de rochers à fleur d’eau, situés au voisinage des côtes.',
  ),
  mot(
    {
      mot: 'embarcation',
      lignes: ['Les pêcheurs montent dans une petite embarcation.', 'Ils rament vers le large.'],
      sens: 'un petit bateau',
      faux: [hors('une longue plage'), hors('un grand panier'), hors('une cabane en bois')],
      indice: '« montent dans » et « ils rament »',
    },
    'embarcation',
    'Nom donné à tout bateau de petite dimension.',
  ),
  mot(
    {
      mot: 'murmure',
      lignes: ['Dans la bibliothèque, Élise murmure un secret.', 'Seule son amie, tout près, l’entend.'],
      sens: 'parle tout bas',
      faux: [hors('crie très fort'), hors('rit aux éclats'), hors('chante en chœur')],
      indice: '« bibliothèque » et « tout près »',
    },
    'murmurer',
    'Parler sourdement ou à mi-voix',
  ),
  mot(
    {
      mot: 'vacarme',
      lignes: ['Les casseroles tombent et les enfants crient.', 'Quel vacarme dans la cuisine !'],
      sens: 'un grand bruit',
      faux: [hors('un grand calme'), hors('un bon repas'), hors('une douce odeur')],
      indice: '« tombent » et « crient »',
    },
    'vacarme',
    'Grand bruit provoqué par des gens qui crient, se querellent ou s’amusent.',
    'cnrtl',
  ),
  mot(
    {
      mot: 'vétuste',
      lignes: ['Le hangar vétuste a un toit percé.', 'Ses planches grisâtres tombent en morceaux.'],
      sens: 'vieux et en mauvais état',
      faux: [hors('grand et lumineux'), hors('neuf et brillant'), hors('rond et petit')],
      indice: '« toit percé » et « tombent en morceaux »',
    },
    'vetuste',
    'Qui est vieux et en mauvais état.',
    'cnrtl',
  ),
  mot(
    {
      mot: 'scrute',
      lignes: ['La vigie scrute l’horizon avec sa longue-vue.', 'Elle cherche la terre au loin.'],
      sens: 'regarde avec grande attention pour découvrir quelque chose',
      faux: [hors('dessine au crayon'), hors('oublie aussitôt'), hors('nettoie avec un chiffon')],
      indice: '« longue-vue » et « cherche »',
    },
    'scruter',
    'Regarder quelque chose avec la plus grande attention',
  ),
  mot(
    {
      mot: 'dérobé',
      lignes: ['Une pie a dérobé la bague posée sur le rebord.', 'Elle s’enfuit avec son butin.'],
      sens: 'volé',
      faux: [hors('réparé'), hors('essuyé'), hors('mesuré')],
      indice: '« s’enfuit » et « butin »',
    },
    'derober',
    'Enlever furtivement, voler.',
  ),
];

/** Niveau 4 : un mot à décomposer pour retrouver le mot qu'il contient. */
export interface Derive {
  readonly mot: string;
  readonly base: string;
  readonly sens: string;
  readonly lignes: readonly string[];
  readonly faitId: string;
}

const derive = (m: Omit<Derive, 'faitId'>, article: string, citation: string): Derive => ({
  ...m,
  faitId: fait(`mot-${article}`, `academie-${article}`, citation),
});

export const DERIVES: readonly Derive[] = [
  derive(
    {
      mot: 'illisible',
      base: 'lisible',
      sens: 'qu’on ne peut pas lire',
      lignes: ['La pluie a mouillé la lettre.', 'L’adresse est devenue illisible.'],
    },
    'illisible',
    'Qu’on ne peut lire ; très difficile à lire.',
  ),
  derive(
    {
      mot: 'immangeable',
      base: 'mangeable',
      sens: 'qu’on ne peut pas manger',
      lignes: ['Léon a versé tout le sel dans la soupe.', 'Elle est immangeable !'],
    },
    'immangeable',
    'Qui ne peut être mangé ; trop mauvais pour être mangé.',
  ),
  derive(
    {
      mot: 'inaudible',
      base: 'audible',
      sens: 'qu’on ne peut pas entendre',
      lignes: ['La perceuse fait un bruit terrible.', 'La voix de la guide devient inaudible.'],
    },
    'inaudible',
    'Qui n’est pas audible, qui ne peut être perçu par l’ouïe.',
  ),
];

export interface RecitMots extends Omit<TexteLong, 'trous'> {
  readonly mots: readonly { readonly mot: string; readonly indice: string }[];
}

export const RECITS_MOTS: readonly RecitMots[] = [
  {
    titre: 'Le naufrage évité',
    lignes: [
      'Les marins montent dans une petite embarcation.',
      'Dans la pénombre du soir, la côte se devine à peine.',
      'La vigie scrute l’eau noire et aperçoit un récif.',
      '« Rocher droit devant ! » : ils virent juste à temps.',
    ],
    mots: [
      { mot: 'embarcation', indice: '« les marins montent dans »' },
      { mot: 'pénombre', indice: '« du soir » et « à peine »' },
      { mot: 'scrute', indice: '« la vigie » et « aperçoit »' },
      { mot: 'récif', indice: '« Rocher droit devant »' },
    ],
  },
  {
    titre: 'Le grenier',
    lignes: [
      'Au grenier, un escalier vétuste grince sous les pas.',
      'Dans la pénombre, Camille chancelle sur une planche.',
      'Elle hisse un vieux coffre sur la table avec ses deux bras.',
      'Le couvercle claque : quel vacarme !',
    ],
    mots: [
      { mot: 'vétuste', indice: '« grince sous les pas »' },
      { mot: 'chancelle', indice: '« sur une planche »' },
      { mot: 'hisse', indice: '« sur la table avec ses deux bras »' },
      { mot: 'vacarme', indice: '« le couvercle claque »' },
    ],
  },
  {
    titre: 'La voleuse',
    lignes: [
      'Tapi derrière la haie, Aziz épie la pie.',
      'Elle a dérobé un bouchon brillant et l’emporte au nid.',
      'Le garçon arpente le jardin, d’un arbre à l’autre.',
      '« La voilà ! » murmure-t-il à sa sœur.',
    ],
    mots: [
      { mot: 'épie', indice: '« tapi derrière la haie »' },
      { mot: 'dérobé', indice: '« l’emporte au nid »' },
      { mot: 'arpente', indice: '« d’un arbre à l’autre »' },
      { mot: 'murmure', indice: '« à sa sœur », tout bas pour ne pas effrayer la pie' },
    ],
  },
];

// ───────────────────────── 5. Personnages et narrateur ─────────────────────────

export const QUI_RACONTE: readonly Choix[] = [
  {
    titre: 'Qui raconte ?',
    lignes: ['« Zoé, à table ! » crie maman.', 'Je pose mon livre et je descends l’escalier.'],
    question: 'Qui raconte cette histoire ?',
    bon: 'Zoé',
    faux: [
      ['maman', 'Maman appelle Zoé. Celle qui dit « je » lui obéit.'],
      ['le livre', 'Un livre ne raconte pas ici : c’est la personne qui le pose.'],
    ],
    preuve: 'Maman appelle Zoé, puis « je » descend : « je » désigne Zoé.',
  },
  {
    titre: 'Qui raconte ?',
    lignes: ['Le maître regarde la classe : « Bastien, au tableau. »', 'Je me lève en tremblant.'],
    question: 'Qui raconte cette histoire ?',
    bon: 'Bastien',
    faux: [
      ['le maître', 'Le maître appelle ; c’est l’élève appelé qui dit « je ».'],
      ['la classe', 'La classe regarde : une seule personne se lève.'],
    ],
    preuve: 'Bastien est appelé et « je me lève » : « je » désigne Bastien.',
  },
  {
    titre: 'Qui raconte ?',
    lignes: ['« Merci, Hind, tu m’as sauvé ! » souffle mon voisin.', 'Je rougis et je range la corde.'],
    question: 'Qui raconte cette histoire ?',
    bon: 'Hind',
    faux: [
      ['le voisin', 'Le voisin remercie Hind. Celle qui répond dit « je ».'],
      ['la corde', 'Une corde est un objet : elle ne raconte rien ici.'],
    ],
    preuve: 'Le voisin dit « Hind », puis « je rougis » : « je » désigne Hind.',
  },
  {
    titre: 'Qui raconte ?',
    lignes: ['« Joyeux anniversaire, Oscar ! » disent mes cousins.', 'Je souffle mes dix bougies.'],
    question: 'Qui raconte cette histoire ?',
    bon: 'Oscar',
    faux: [
      ['les cousins', 'Les cousins souhaitent l’anniversaire à Oscar : ce n’est pas eux qui soufflent.'],
      ['les bougies', 'Les bougies sont des objets : elles ne parlent pas.'],
    ],
    preuve: 'On fête Oscar et « je souffle mes dix bougies » : « je » désigne Oscar.',
  },
];

export interface Reprise {
  readonly lignes: readonly string[];
  readonly paires: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  readonly preuve: string;
}

export const REPRISES: readonly Reprise[] = [
  {
    lignes: [
      'Madame Roux, la boulangère, salue Théo, son jeune voisin.',
      'La commerçante offre une brioche au garçon.',
      'Son chien Pompon l’attend ; l’animal remue la queue.',
    ],
    paires: [
      ['la commerçante', 'Madame Roux'],
      ['le garçon', 'Théo'],
      ['l’animal', 'Pompon'],
    ],
    preuve: 'La commerçante tient la boulangerie, le garçon est le voisin, l’animal est le chien.',
  },
  {
    lignes: [
      'Le capitaine Morel donne un ordre à Iris, la nouvelle apprentie.',
      'L’officier montre le perroquet Coco perché sur le mât.',
      'La jeune fille grimpe ; l’oiseau s’envole aussitôt.',
    ],
    paires: [
      ['l’officier', 'le capitaine Morel'],
      ['la jeune fille', 'Iris'],
      ['l’oiseau', 'Coco'],
    ],
    preuve:
      'Le capitaine est un officier, Iris est la jeune fille qui reçoit l’ordre de grimper, le perroquet est un oiseau.',
  },
  {
    lignes: [
      'Le docteur Lemaire examine Paulette, une dame âgée.',
      'Le médecin rassure sa patiente.',
      'Sous la chaise, le chat Biscuit ronronne : le félin n’a pas peur.',
    ],
    paires: [
      ['le médecin', 'le docteur Lemaire'],
      ['sa patiente', 'Paulette'],
      ['le félin', 'Biscuit'],
    ],
    preuve: 'Le médecin est le docteur, la patiente est la dame qu’il examine, le chat est un félin.',
  },
];

export const QUI_SE_CACHE: readonly Saisie[] = [
  {
    titre: 'La randonnée',
    lignes: ['Agathe et son père montent vers le col.', 'Elle porte le sac ; lui tient la carte.'],
    question: 'Écris le nom du personnage désigné par « Elle ».',
    accepted: ['Agathe'],
    pieges: [
      ['son père', '« Elle » est un pronom féminin : il ne peut pas désigner le père.'],
      ['la carte', '« Elle » agit en portant le sac : c’est une personne.'],
    ],
    preuve: '« Elle » est féminin : c’est Agathe. « lui » renvoie au père.',
  },
  {
    titre: 'La partie d’échecs',
    lignes: ['Victor joue contre Salima.', 'Quand elle déplace sa reine, il fronce les sourcils.'],
    question: 'Écris le nom du personnage désigné par « il ».',
    accepted: ['Victor'],
    pieges: [
      ['Salima', '« il » est masculin : c’est Salima qui déplace la reine (« elle »).'],
      ['la reine', 'La reine est une pièce du jeu : elle ne fronce pas les sourcils.'],
    ],
    preuve: '« il » est masculin : il remplace Victor.',
  },
  {
    titre: 'Le potager',
    lignes: ['Mamie confie l’arrosoir à Elouan.', '« Verse doucement », lui dit-elle.'],
    question: 'Écris le nom du personnage qui reçoit le conseil (« lui »).',
    accepted: ['Elouan'],
    pieges: [
      ['Mamie', 'C’est Mamie qui parle : elle donne le conseil à quelqu’un d’autre.'],
      ['l’arrosoir', 'Un objet ne reçoit pas de conseil.'],
    ],
    preuve: 'Mamie parle et s’adresse à celui qui a l’arrosoir : Elouan.',
  },
  {
    titre: 'Le gymnase',
    lignes: ['Lucas rattrape Nadia au bord du tapis.', '« Tu m’as évité une chute ! » dit-elle.'],
    question: 'Écris le nom du personnage qui parle.',
    accepted: ['Nadia'],
    pieges: [
      ['Lucas', '« dit-elle » : c’est une fille qui parle, et Lucas est celui qui l’a aidée.'],
      ['le tapis', 'Un tapis ne parle pas.'],
    ],
    preuve: '« dit-elle » désigne Nadia, que Lucas vient de rattraper.',
  },
];

export const NARRATEURS_CACHES: readonly Saisie[] = [
  {
    titre: 'Le concours',
    lignes: [
      'Les juges appellent le numéro sept.',
      'Mon frère Léon me tape sur l’épaule : « À toi, Maëlle ! »',
      'Je m’avance vers le piano, les mains moites.',
    ],
    question: 'Écris le prénom du narrateur ou de la narratrice.',
    accepted: ['Maëlle', 'Maelle'],
    pieges: [
      ['Léon', 'Léon est le frère de celle qui raconte : il l’encourage.'],
      ['les juges', 'Les juges appellent, mais ne disent pas « je ».'],
    ],
    preuve: 'Léon dit « À toi, Maëlle » à celle qui dit « me » et « je ».',
  },
  {
    titre: 'La cabane',
    lignes: [
      'Ma cousine Sofia cloue les planches.',
      'Elle me crie : « Passe-moi le marteau, Aymeric ! »',
      'Je grimpe aussitôt à l’échelle.',
    ],
    question: 'Écris le prénom du narrateur ou de la narratrice.',
    accepted: ['Aymeric'],
    pieges: [
      ['Sofia', 'Sofia est la cousine : elle crie vers celui qui raconte.'],
      ['le marteau', 'Un outil ne raconte pas.'],
    ],
    preuve: 'Sofia demande le marteau à « Aymeric », celui qui dit « je ».',
  },
  {
    titre: 'La tempête',
    lignes: [
      'Mon ami Gaspard claque des dents sous la tente.',
      '« Ysée, tu crois que le toit va tenir ? »',
      'Je lui réponds que oui, mais je n’en suis pas sûre.',
    ],
    question: 'Écris le prénom du narrateur ou de la narratrice.',
    accepted: ['Ysée', 'Ysee'],
    pieges: [
      ['Gaspard', 'Gaspard pose la question à son amie : il n’est pas le narrateur.'],
      ['le toit', 'Le toit est celui de la tente : il ne parle pas.'],
    ],
    preuve: 'Gaspard s’adresse à Ysée, qui répond : « Je lui réponds ».',
  },
  {
    titre: 'Le marché',
    lignes: [
      'La fleuriste enveloppe un bouquet de tulipes.',
      '« Voilà, Noham, ta maman sera contente. »',
      'Je paie avec mes pièces et je cours à la maison.',
    ],
    question: 'Écris le prénom du narrateur ou de la narratrice.',
    accepted: ['Noham'],
    pieges: [
      ['la fleuriste', 'La fleuriste vend le bouquet : elle parle à son jeune client.'],
      ['maman', 'Maman recevra les fleurs : elle n’est pas dans la boutique.'],
    ],
    preuve: 'La fleuriste appelle « Noham » celui qui paie et dit « je ».',
  },
];

export const MOTIVATIONS: readonly (readonly [string, string])[] = [
  ['Ousmane partage son goûter avec un camarade qui n’a rien.', 'Il veut être solidaire.'],
  ['Jade cache la surprise sous son lit avant la fête.', 'Elle veut garder le secret.'],
  ['Le petit renard recule derrière sa mère devant le chien.', 'Il cherche une protection.'],
  ['Elsa relit trois fois son poème avant de monter sur scène.', 'Elle veut éviter de se tromper.'],
  ['Marc rend le portefeuille trouvé à son propriétaire.', 'Il veut agir honnêtement.'],
  ['La reine fait fermer les portes quand l’armée approche.', 'Elle veut défendre la ville.'],
  ['Pia apporte une tisane à son grand frère enrhumé.', 'Elle prend soin de lui.'],
  ['Le chevalier s’entraîne chaque jour avant le tournoi.', 'Il souhaite remporter l’épreuve.'],
];

export const LONGS_PERSONNAGES: readonly TexteLong[] = [
  {
    titre: 'Le grand plongeoir',
    lignes: [
      'Je m’appelle Robin et j’ai le cœur qui cogne.',
      'En bas, ma sœur Lila agite la main pour m’encourager.',
      'Le maître-nageur attend, sifflet au cou.',
      'Je ferme les yeux et je saute, pour prouver que je peux le faire.',
    ],
    trous: [
      trou('Le narrateur est', 'Robin', ['Lila', 'le maître-nageur'], '« Je m’appelle Robin » : il raconte.'),
      trou(
        'Ce narrateur est',
        'un personnage de l’histoire',
        ['l’auteur d’un article', 'un spectateur absent de l’histoire'],
        'Il dit « je » et agit dans l’histoire.',
      ),
      trou('« ma sœur » désigne', 'Lila', ['Robin', 'le maître-nageur'], 'La ligne 2 dit : « ma sœur Lila ».'),
      trou(
        'Robin saute surtout pour',
        'prouver qu’il peut le faire',
        ['faire rire Lila', 'récupérer un sifflet'],
        'La dernière ligne le dit : « pour prouver que je peux le faire ».',
      ),
    ],
  },
  {
    titre: 'Le colporteur',
    lignes: [
      'Un colporteur arrive au village, son sac sur le dos.',
      'La vieille Agnès le fait entrer, car il a l’air épuisé.',
      'L’homme la remercie et pose un ruban bleu sur la table.',
      '« C’est pour vous », dit-il avant de repartir.',
    ],
    trous: [
      trou(
        'Le narrateur de ce récit',
        'ne participe pas à l’histoire',
        ['est le colporteur', 'est la vieille Agnès'],
        'Aucun « je » dans le récit : on parle des personnages avec « il » et « elle ».',
      ),
      trou(
        '« L’homme » désigne',
        'le colporteur',
        ['Agnès', 'un voisin'],
        'Seul le colporteur est un homme dans le récit.',
      ),
      trou(
        'Agnès le fait entrer parce qu’il',
        'a l’air épuisé',
        ['apporte un ruban', 'est son fils'],
        'La ligne 2 dit : « car il a l’air épuisé ».',
      ),
      trou(
        '« vous », dans la réplique, désigne',
        'Agnès',
        ['le colporteur', 'les villageois'],
        'Le colporteur parle à celle qui l’a accueilli.',
      ),
    ],
  },
  {
    titre: 'Le carnet',
    lignes: [
      'Hier, j’ai trouvé un carnet sur un banc.',
      'La jeune femme du kiosque, Maud, m’a vue le ramasser.',
      '« Tu es honnête, Lison », m’a-t-elle dit quand je le lui ai confié.',
      'Je voulais qu’elle le rende à son propriétaire.',
    ],
    trous: [
      trou('La narratrice s’appelle', 'Lison', ['Maud', 'le propriétaire'], 'Maud lui dit : « Tu es honnête, Lison ».'),
      trou(
        '« elle », dans « qu’elle le rende », désigne',
        'Maud',
        ['Lison', 'le carnet'],
        'Lison confie le carnet à Maud et veut qu’elle le rende.',
      ),
      trou(
        'Lison confie le carnet parce qu’elle veut',
        'qu’il soit rendu',
        ['le garder', 'le vendre'],
        'La dernière ligne le dit.',
      ),
      trou(
        'Ce récit est raconté par',
        'un personnage de l’histoire',
        ['quelqu’un d’extérieur', 'un journal'],
        'On lit « j’ai trouvé » : la narratrice agit dans l’histoire.',
      ),
    ],
  },
];

export const FAITS_LECTURE_CM2: readonly Fait[] = [...faits.values()];

export const faitLectureCm2 = (id: string): Fait => {
  const f = FAITS_LECTURE_CM2.find((x) => x.id === id);
  if (!f) throw new RangeError(`fait inconnu : ${id}`);
  return f;
};

/** Identifiants de sources distincts des faits donnés. */
export const sourcesLectureCm2 = (ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitLectureCm2(id).source)]),
];
