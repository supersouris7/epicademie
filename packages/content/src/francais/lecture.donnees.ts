/**
 * Données du chapitre « Lire et comprendre » (CM1). Faits cités : identifiant de source (registre `sources.ts`) et
 * citation exacte. Tous les textes à lire sont écrits pour l'exercice.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const faits = new Map<string, Fait>();
const fait = (id: string, source: string, citation: string): string => {
  faits.set(id, { id, source, citation });
  return id;
};
/** Article du Dictionnaire de l'Académie française, 9e édition (identifiant `academie-…`). */
const acad = (id: string, citation: string) => fait(`def-${id}`, `academie-${id}`, citation);

// ───────────────────────── Programme (CM1, lecture et vocabulaire) ─────────────────────────

fait(
  'prog-explicite',
  PROGRAMME,
  'Repérer, dans un texte, les informations explicites et pointer des informations implicites',
);
fait('prog-strategies', PROGRAMME, 'Développer des stratégies de compréhension');
fait(
  'prog-contexte',
  PROGRAMME,
  'Identifier les mots inconnus, lors de ses différentes lectures, et rechercher leur signification en s’appuyant sur la morphologie et sur le contexte',
);
fait('prog-documents', PROGRAMME, 'Trouver dans des documents simples les réponses à des questions');
fait('prog-nature-source', PROGRAMME, 'Donner la nature et la source d’un document');
fait(
  'prog-composites',
  PROGRAMME,
  'Découvrir des documents composites et y repérer des informations grâce à un questionnement',
);

// ───────────────────────── Définitions ─────────────────────────

acad('ou', 'En quel lieu, en quel endroit ?');
acad('quand', 'À quel moment, dans combien de temps.');
acad('lieu', 'Portion déterminée de l’espace.');
acad('moment', 'Intervalle de temps.');
acad(
  'implicite',
  'Qui est contenu dans un discours, une proposition, sans y être énoncé expressément, mais qui s’en tire naturellement par induction ou déduction.',
);
acad('indice', 'Signe apparent et probable qu’une chose est, existe, qui met sur la trace de son existence.');
acad('contexte', 'Ensemble du texte entourant un mot, une phrase, un passage.');
acad('recit', 'Relation, narration, orale ou écrite, d’un évènement.');
acad('chronologie', 'Ensemble de faits historiques présentés dans l’ordre de leur succession.');
acad('puis', 'Ensuite, après.');
acad('enfin', 'En dernier lieu.');
acad('abord', 'D’abord, en premier lieu.');
acad('auparavant', 'À une époque antérieure ; avant tel fait déjà daté.');
acad('lendemain', 'Le jour qui suit celui dont on parle.');
acad('consigne', 'Ordre formel, instruction ou série d’instructions');
acad(
  'legende',
  'Notice, liste placée dans un coin ou aux marges d’une carte géographique, d’un plan, etc., et fournissant l’explication des signes conventionnels utilisés.',
);

// ───────────────────────── 1. Qui, quoi, où, quand ─────────────────────────

export type Cle = 'qui' | 'quoi' | 'ou' | 'quand';

export interface Info {
  /** Question posée à l'élève. */
  readonly question: string;
  /** Réponse telle qu'on la lit dans le texte. */
  readonly rep: string;
  /** Écritures acceptées à la saisie. */
  readonly ecrit: readonly string[];
  /** Réponse fausse de la même sorte. */
  readonly autre: string;
}

export interface Histoire {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly infos: Readonly<Record<Cle, Info>>;
}

const info = (question: string, rep: string, autre: string, ...variantes: readonly string[]): Info => ({
  question,
  rep,
  autre,
  ecrit: [rep, ...variantes],
});

export const HISTOIRES: readonly Histoire[] = [
  {
    titre: 'La graine',
    lignes: ['Ce matin, Lina plante une graine', 'dans le jardin de l’école.'],
    infos: {
      qui: info('Qui plante une graine ?', 'Lina', 'la maîtresse'),
      quoi: info('Que plante Lina ?', 'une graine', 'un arbre', 'graine', 'la graine'),
      ou: info(
        'Où Lina plante-t-elle la graine ?',
        'dans le jardin de l’école',
        'dans la cour de la mairie',
        'le jardin de l’école',
        'jardin de l’école',
        'dans le jardin',
        'le jardin',
        'jardin',
      ),
      quand: info('Quand Lina plante-t-elle la graine ?', 'ce matin', 'hier soir', 'le matin', 'matin'),
    },
  },
  {
    titre: 'Le cerf-volant',
    lignes: ['Samedi, Noé fait voler un cerf-volant', 'sur la plage.'],
    infos: {
      qui: info('Qui fait voler le cerf-volant ?', 'Noé', 'un pêcheur'),
      quoi: info('Que fait voler Noé ?', 'un cerf-volant', 'un ballon', 'cerf-volant', 'le cerf-volant'),
      ou: info(
        'Où Noé fait-il voler son cerf-volant ?',
        'sur la plage',
        'dans la forêt',
        'la plage',
        'plage',
        'à la plage',
      ),
      quand: info('Quand Noé fait-il voler son cerf-volant ?', 'samedi', 'lundi', 'le samedi'),
    },
  },
  {
    titre: 'La tarte',
    lignes: ['Dimanche midi, Papi prépare une tarte', 'dans la cuisine.'],
    infos: {
      qui: info('Qui prépare la tarte ?', 'Papi', 'Mamie'),
      quoi: info('Que prépare Papi ?', 'une tarte', 'une soupe', 'tarte', 'la tarte'),
      ou: info(
        'Où Papi prépare-t-il la tarte ?',
        'dans la cuisine',
        'dans le garage',
        'la cuisine',
        'cuisine',
        'à la cuisine',
      ),
      quand: info('Quand Papi prépare-t-il la tarte ?', 'dimanche midi', 'mardi soir', 'dimanche', 'le dimanche midi'),
    },
  },
  {
    titre: 'Le livre',
    lignes: ['Après la classe, Sami choisit un livre', 'à la bibliothèque.'],
    infos: {
      qui: info('Qui choisit un livre ?', 'Sami', 'le gardien'),
      quoi: info('Que choisit Sami ?', 'un livre', 'un film', 'livre', 'le livre'),
      ou: info(
        'Où Sami choisit-il le livre ?',
        'à la bibliothèque',
        'à la piscine',
        'la bibliothèque',
        'bibliothèque',
        'dans la bibliothèque',
      ),
      quand: info('Quand Sami choisit-il le livre ?', 'après la classe', 'avant le petit-déjeuner'),
    },
  },
  {
    titre: 'Le nid',
    lignes: ['Au printemps, un merle construit son nid', 'dans la haie.'],
    infos: {
      qui: info('Qui construit un nid ?', 'un merle', 'un hibou', 'merle', 'le merle'),
      quoi: info('Que construit le merle ?', 'son nid', 'une cabane', 'un nid', 'le nid', 'nid'),
      ou: info('Où le merle construit-il son nid ?', 'dans la haie', 'sur le toit', 'la haie', 'haie'),
      quand: info('Quand le merle construit-il son nid ?', 'au printemps', 'en hiver', 'le printemps', 'printemps'),
    },
  },
  {
    titre: 'Le dessin',
    lignes: ['Mercredi après-midi, Aya dessine un dragon', 'dans sa chambre.'],
    infos: {
      qui: info('Qui dessine un dragon ?', 'Aya', 'son frère'),
      quoi: info('Que dessine Aya ?', 'un dragon', 'un château', 'dragon', 'le dragon'),
      ou: info('Où Aya dessine-t-elle ?', 'dans sa chambre', 'dans le salon', 'sa chambre', 'chambre', 'la chambre'),
      quand: info(
        'Quand Aya dessine-t-elle ?',
        'mercredi après-midi',
        'jeudi matin',
        'mercredi',
        'le mercredi',
        'mercredi après midi',
        'mercredi apres-midi',
      ),
    },
  },
  {
    titre: 'La photo',
    lignes: ['Hier, Malik a photographié un écureuil', 'au parc.'],
    infos: {
      qui: info('Qui a photographié un écureuil ?', 'Malik', 'un promeneur'),
      quoi: info(
        'Qu’est-ce que Malik a photographié ?',
        'un écureuil',
        'un canard',
        'écureuil',
        'l’écureuil',
        'un ecureuil',
      ),
      ou: info('Où Malik a-t-il pris la photo ?', 'au parc', 'au zoo', 'le parc', 'parc', 'dans le parc'),
      quand: info('Quand Malik a-t-il pris la photo ?', 'hier', 'ce soir'),
    },
  },
  {
    titre: 'Le match',
    lignes: ['Vendredi soir, notre équipe gagne le match', 'au gymnase.'],
    infos: {
      qui: info('Qui gagne le match ?', 'notre équipe', 'l’équipe adverse', 'équipe', 'l’équipe'),
      quoi: info('Que gagne notre équipe ?', 'le match', 'la course', 'match', 'un match'),
      ou: info(
        'Où notre équipe gagne-t-elle le match ?',
        'au gymnase',
        'au stade',
        'le gymnase',
        'gymnase',
        'dans le gymnase',
      ),
      quand: info('Quand notre équipe gagne-t-elle le match ?', 'vendredi soir', 'lundi matin', 'vendredi'),
    },
  },
];

export interface QuestionPiege {
  readonly question: string;
  readonly accepted: readonly string[];
  readonly pieges: readonly (readonly [string, string])[];
  /** Phrase du texte qui prouve la réponse. */
  readonly preuve: string;
}

export interface TextePiege {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly questions: readonly QuestionPiege[];
}

const autreMoment = (m: string) => `« ${m} » est un autre moment du texte. Relis la question.`;
const autreLieu = (l: string) => `« ${l} » est un autre lieu du texte. Relis la question.`;
const autrePersonne = (p: string) => `« ${p} » est un autre personnage. Qui fait l’action demandée ?`;

/** Niveau 4 : deux personnages, deux lieux ou deux moments. */
export const TEXTES_PIEGES: readonly TextePiege[] = [
  {
    titre: 'Deux sorties',
    lignes: [
      'Lundi, Inès est allée à la piscine.',
      'Jeudi, elle est allée au musée avec son oncle Paul.',
      'Au musée, Paul a perdu son écharpe.',
    ],
    questions: [
      {
        question: 'Quand Inès est-elle allée au musée ?',
        accepted: ['jeudi', 'le jeudi'],
        pieges: [['lundi', autreMoment('lundi')]],
        preuve: 'La ligne 2 dit : « Jeudi, elle est allée au musée ».',
      },
      {
        question: 'Qui a perdu son écharpe ?',
        accepted: ['Paul', 'son oncle', 'son oncle Paul', 'l’oncle', 'l’oncle Paul', 'oncle Paul'],
        pieges: [['Inès', autrePersonne('Inès')]],
        preuve: 'La ligne 3 dit : « Paul a perdu son écharpe ».',
      },
    ],
  },
  {
    titre: 'Le chat caché',
    lignes: [
      'Le matin, le chat Pistache dort sur le fauteuil.',
      'Le soir, il se cache sous le lit.',
      'Le chien Boule, lui, reste dans le couloir.',
    ],
    questions: [
      {
        question: 'Où Pistache se cache-t-il le soir ?',
        accepted: ['sous le lit', 'le lit', 'lit'],
        pieges: [
          ['sur le fauteuil', autreLieu('sur le fauteuil')],
          ['dans le couloir', autreLieu('dans le couloir')],
        ],
        preuve: 'La ligne 2 dit : « Le soir, il se cache sous le lit ».',
      },
      {
        question: 'Qui reste dans le couloir ?',
        accepted: ['Boule', 'le chien', 'le chien Boule', 'chien'],
        pieges: [['Pistache', autrePersonne('Pistache')]],
        preuve: 'La ligne 3 dit : « Le chien Boule, lui, reste dans le couloir ».',
      },
    ],
  },
  {
    titre: 'La kermesse',
    lignes: [
      'Samedi matin, Tom installe les tables dans la cour.',
      'Samedi après-midi, Zoé vend des gâteaux près du portail.',
      'Le soir, tout le monde range la salle de classe.',
    ],
    questions: [
      {
        question: 'Où Zoé vend-elle des gâteaux ?',
        accepted: ['près du portail', 'le portail', 'portail'],
        pieges: [
          ['dans la cour', autreLieu('dans la cour')],
          ['la salle de classe', autreLieu('la salle de classe')],
        ],
        preuve: 'La ligne 2 dit : « Zoé vend des gâteaux près du portail ».',
      },
      {
        question: 'Qui installe les tables ?',
        accepted: ['Tom'],
        pieges: [['Zoé', autrePersonne('Zoé')]],
        preuve: 'La ligne 1 dit : « Tom installe les tables ».',
      },
    ],
  },
  {
    titre: 'Les cousins',
    lignes: [
      'En juillet, Hugo campe à la montagne.',
      'En août, sa cousine Jade visite un phare.',
      'En septembre, les deux cousins se retrouvent chez Mamie.',
    ],
    questions: [
      {
        question: 'Quand Jade visite-t-elle un phare ?',
        accepted: ['août', 'en août', 'aout', 'en aout'],
        pieges: [
          ['juillet', autreMoment('juillet')],
          ['septembre', autreMoment('septembre')],
        ],
        preuve: 'La ligne 2 dit : « En août, sa cousine Jade visite un phare ».',
      },
      {
        question: 'Où les deux cousins se retrouvent-ils ?',
        accepted: ['chez Mamie', 'Mamie', 'la maison de Mamie', 'chez leur Mamie'],
        pieges: [['à la montagne', autreLieu('à la montagne')]],
        preuve: 'La ligne 3 dit : « les deux cousins se retrouvent chez Mamie ».',
      },
    ],
  },
  {
    titre: 'La boulangère',
    lignes: [
      'Avant l’aube, madame Roux pétrit le pain.',
      'À huit heures, son fils Léo ouvre la boutique.',
      'À midi, un client emporte la dernière brioche.',
    ],
    questions: [
      {
        question: 'Qui ouvre la boutique ?',
        accepted: ['Léo', 'son fils', 'son fils Léo', 'le fils', 'Leo'],
        pieges: [
          ['madame Roux', autrePersonne('madame Roux')],
          ['un client', autrePersonne('un client')],
        ],
        preuve: 'La ligne 2 dit : « son fils Léo ouvre la boutique ».',
      },
      {
        question: 'Quand un client emporte-t-il la dernière brioche ?',
        accepted: ['à midi', 'midi', 'a midi'],
        pieges: [
          ['à huit heures', autreMoment('à huit heures')],
          ['avant l’aube', autreMoment('avant l’aube')],
        ],
        preuve: 'La ligne 3 dit : « À midi, un client emporte la dernière brioche ».',
      },
    ],
  },
];

export interface Trou {
  readonly etiquette: string;
  readonly bon: string;
  readonly faux: readonly [string, string];
  readonly preuve: string;
}

export interface TexteLong {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly trous: readonly Trou[];
}

const trou = (etiquette: string, bon: string, faux: readonly [string, string], preuve: string): Trou => ({
  etiquette,
  bon,
  faux,
  preuve,
});

export const LONGS_QUI: readonly TexteLong[] = [
  {
    titre: 'La bouteille',
    lignes: [
      'Mardi, après l’orage, Yanis marche au bord de la rivière.',
      'Son voisin, monsieur Petit, pêche un peu plus loin.',
      'Près du vieux pont, Yanis aperçoit une bouteille coincée.',
      'Il la ramasse avec un grand bâton.',
      'Dedans, il trouve un message roulé.',
      'Le soir, il le lit à sa sœur.',
    ],
    trous: [
      trou(
        'Qui trouve le message ?',
        'Yanis',
        ['monsieur Petit', 'sa sœur'],
        'Yanis ramasse la bouteille et trouve le message.',
      ),
      trou(
        'Qu’aperçoit-il ?',
        'une bouteille',
        ['un grand bâton', 'un poisson'],
        'La ligne 3 parle d’une bouteille coincée.',
      ),
      trou(
        'Où est la bouteille ?',
        'près du vieux pont',
        ['dans un jardin', 'chez monsieur Petit'],
        'La ligne 3 dit : « Près du vieux pont ».',
      ),
      trou(
        'Quand lit-il le message ?',
        'le soir',
        ['avant l’orage', 'le matin'],
        'La ligne 6 dit : « Le soir, il le lit ».',
      ),
    ],
  },
  {
    titre: 'Le spectacle',
    lignes: [
      'Depuis janvier, la classe de madame Diallo répète une pièce.',
      'Chaque vendredi, les élèves montent sur la scène de la mairie.',
      'Nina joue la reine, et Adam fabrique les décors.',
      'En juin, ils jouent enfin devant les familles.',
      'À la fin, le public applaudit très fort.',
    ],
    trous: [
      trou(
        'Qui fabrique les décors ?',
        'Adam',
        ['Nina', 'madame Diallo'],
        'La ligne 3 dit : « Adam fabrique les décors ».',
      ),
      trou(
        'Que répète la classe ?',
        'une pièce',
        ['une chanson', 'une danse'],
        'La ligne 1 dit : « la classe répète une pièce ».',
      ),
      trou(
        'Où les élèves répètent-ils le vendredi ?',
        'à la mairie',
        ['au gymnase', 'à la bibliothèque'],
        'La ligne 2 parle de la scène de la mairie.',
      ),
      trou(
        'Quand jouent-ils devant les familles ?',
        'en juin',
        ['en janvier', 'un vendredi'],
        'La ligne 4 dit : « En juin, ils jouent enfin ».',
      ),
    ],
  },
  {
    titre: 'Le potager',
    lignes: [
      'Au mois d’avril, Mamie Rose retourne la terre derrière la maison.',
      'Son petit-fils Elio sème des radis.',
      'Il les arrose tous les soirs avec un petit arrosoir.',
      'Trois semaines plus tard, les premiers radis sortent.',
      'Elio les croque au déjeuner.',
    ],
    trous: [
      trou('Qui sème les radis ?', 'Elio', ['Mamie Rose', 'un voisin'], 'La ligne 2 dit : « Elio sème des radis ».'),
      trou('Que sème-t-il ?', 'des radis', ['des carottes', 'des fleurs'], 'La ligne 2 dit : « sème des radis ».'),
      trou(
        'Où se trouve le potager ?',
        'derrière la maison',
        ['devant l’école', 'sur le balcon'],
        'La ligne 1 dit : « derrière la maison ».',
      ),
      trou(
        'Quand Elio arrose-t-il ?',
        'tous les soirs',
        ['tous les matins', 'une fois par mois'],
        'La ligne 3 dit : « tous les soirs ».',
      ),
    ],
  },
  {
    titre: 'La randonnée',
    lignes: [
      'Dimanche, Clara et son père partent tôt en randonnée.',
      'Ils suivent un sentier qui traverse la forêt.',
      'Vers midi, ils s’assoient au bord d’un lac.',
      'Clara partage son pain avec un canard.',
      'Puis ils rentrent avant la nuit.',
    ],
    trous: [
      trou('Qui accompagne Clara ?', 'son père', ['sa mère', 'son maître'], 'La ligne 1 dit : « Clara et son père ».'),
      trou(
        'Que partage Clara ?',
        'son pain',
        ['sa gourde', 'son manteau'],
        'La ligne 4 dit : « Clara partage son pain ».',
      ),
      trou(
        'Où s’assoient-ils vers midi ?',
        'au bord d’un lac',
        ['au sommet d’une tour', 'dans la voiture'],
        'La ligne 3 dit : « au bord d’un lac ».',
      ),
      trou('Quand partent-ils ?', 'dimanche', ['samedi', 'pendant la nuit'], 'La ligne 1 dit : « Dimanche ».'),
    ],
  },
];

// ───────────────────────── 2. Inférences ─────────────────────────

export interface Devinette {
  readonly lignes: readonly string[];
  readonly question: string;
  readonly bon: string;
  readonly faux: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  /** Les indices du texte. */
  readonly indices: string;
}

const nonIndice = (r: string, i: string): readonly [string, string] => [
  r,
  `Aucun indice ne parle de ça. Relis : ${i}.`,
];

const devinette = (
  lignes: readonly string[],
  question: string,
  bon: string,
  indices: string,
  [a, b, c]: readonly [string, string, string],
): Devinette => ({
  lignes,
  question,
  bon,
  indices,
  faux: [nonIndice(a, indices), nonIndice(b, indices), nonIndice(c, indices)],
});

export const DEVINETTES: readonly Devinette[] = [
  devinette(
    ['Léa enfile ses bottes.', 'Elle ouvre son parapluie avant de sortir.'],
    'Quel temps fait-il ?',
    'Il pleut.',
    '« bottes » et « parapluie »',
    ['Il fait très chaud.', 'Il y a du brouillard.', 'Le ciel est sans un nuage.'],
  ),
  devinette(
    ['Malo souffle les huit bougies.', 'Tout le monde chante autour du gâteau.'],
    'Que fête-t-on ?',
    'un anniversaire',
    '« bougies » et « gâteau »',
    ['la rentrée des classes', 'un match de basket', 'un déménagement'],
  ),
  devinette(
    ['Rémi met son pyjama.', 'Il se brosse les dents et éteint la lumière.'],
    'Que va faire Rémi ?',
    'aller dormir',
    '« pyjama » et « éteint la lumière »',
    ['partir à l’école', 'jouer au football', 'préparer le déjeuner'],
  ),
  devinette(
    ['Sur le quai, le contrôleur siffle.', 'Les voyageurs montent vite avec leurs valises.'],
    'Où sommes-nous ?',
    'dans une gare',
    '« quai », « voyageurs » et « valises »',
    ['dans une cuisine', 'dans une forêt', 'dans une salle de classe'],
  ),
  devinette(
    ['La dame en blouse regarde la gorge de Tim.', 'Elle écrit une ordonnance.'],
    'Qui est la dame ?',
    'un médecin',
    '« gorge » et « ordonnance »',
    ['une boulangère', 'une factrice', 'une chanteuse'],
  ),
  devinette(
    ['Les feuilles tombent des arbres.', 'Papa ramasse des châtaignes dans l’allée.'],
    'En quelle saison sommes-nous ?',
    'en automne',
    '« les feuilles tombent » et « châtaignes »',
    ['au printemps', 'en été', 'en hiver, sous la neige'],
  ),
  devinette(
    ['Julie a les larmes aux yeux.', 'Elle fait un dernier signe à son amie qui déménage.'],
    'Que ressent Julie ?',
    'de la tristesse',
    '« larmes » et « dernier signe »',
    ['de la joie', 'de la fierté', 'de l’ennui devant la télévision'],
  ),
  devinette(
    ['Il ajoute la farine, casse les œufs', 'puis allume le four.'],
    'Que prépare-t-il ?',
    'un gâteau',
    '« farine », « œufs » et « four »',
    ['un lit', 'un jardin', 'un dessin'],
  ),
];

/** Phrase ↔ ce qu'on devine (déductions toutes différentes, sans aucun mot de la phrase). */
export const PAIRES_DEVINEES: readonly (readonly [string, string])[] = [
  ['Max ouvre son parapluie.', 'Il pleut.'],
  ['Ana bâille et frotte ses yeux.', 'Quelqu’un a sommeil.'],
  ['Le ventre de Louis gargouille.', 'Quelqu’un a faim.'],
  ['Nora grelotte sans son manteau.', 'Quelqu’un a froid.'],
  ['Hugo boit trois verres d’eau d’un coup.', 'Quelqu’un a soif.'],
  ['Emma saute de joie en lisant la lettre.', 'Cette nouvelle fait plaisir.'],
  ['La salle applaudit longtemps les acteurs.', 'Le spectacle a plu.'],
  ['Tom regarde sa montre et court vers l’arrêt.', 'Quelqu’un est en retard.'],
];

export interface Enigme {
  readonly lignes: readonly string[];
  readonly question: string;
  readonly accepted: readonly string[];
  readonly pieges: readonly (readonly [string, string])[];
  readonly indices: string;
}

/** Niveau 3 : on écrit la réponse. */
export const ENIGMES: readonly Enigme[] = [
  {
    lignes: ['La neige couvre le toit.', 'Mia sort sa luge et met ses moufles.'],
    question: 'En quelle saison sommes-nous ? Écris-la.',
    accepted: ['hiver', 'en hiver', 'l’hiver', 'c’est l’hiver'],
    pieges: [
      ['été', 'En été, il ne neige pas ici. Relis « neige » et « moufles ».'],
      ['automne', 'La neige et la luge font penser à une saison plus froide.'],
    ],
    indices: '« neige », « luge » et « moufles »',
  },
  {
    lignes: ['Sacha pose sa serviette au bord du bassin.', 'Il met son bonnet de bain, puis plonge.'],
    question: 'Dans quel lieu Sacha se trouve-t-il ? Écris-le.',
    accepted: ['piscine', 'à la piscine', 'la piscine', 'une piscine', 'dans une piscine', 'dans la piscine'],
    pieges: [
      ['école', 'Rien ne parle de classe. Relis « plonge ».'],
      ['maison', 'Le bonnet de bain et le plongeon montrent un autre lieu.'],
    ],
    indices: '« bassin », « bonnet de bain » et « plonge »',
  },
  {
    lignes: ['Monsieur Benali coupe des mèches avec ses ciseaux.', 'Puis il montre le résultat dans un miroir.'],
    question: 'Quel est le métier de monsieur Benali ? Écris-le.',
    accepted: ['coiffeur', 'un coiffeur', 'il est coiffeur', 'barbier', 'un barbier'],
    pieges: [
      ['jardinier', 'Les mèches sont des cheveux, pas des plantes.'],
      ['couturier', 'Les mèches sont des cheveux, pas du tissu.'],
    ],
    indices: '« mèches », « ciseaux » et « miroir »',
  },
  {
    lignes: ['Inaya a les mains qui tremblent.', 'Dans le noir, elle n’ose pas avancer.'],
    question: 'Que ressent Inaya ? Écris un seul nom.',
    accepted: [
      'peur',
      'la peur',
      'de la peur',
      'frayeur',
      'la frayeur',
      'crainte',
      'la crainte',
      'angoisse',
      'de l’angoisse',
      'l’angoisse',
      'inquiétude',
      'de l’inquiétude',
      'l’inquiétude',
    ],
    pieges: [
      ['joie', 'Quand on est joyeux, on n’hésite pas à avancer.'],
      ['colère', 'Rien ne montre qu’elle est fâchée. Pense au « noir ».'],
    ],
    indices: '« tremblent », « noir » et « n’ose pas »',
  },
  {
    lignes: ['Les élèves rangent leurs cahiers.', 'La cloche sonne : les parents attendent au portail.'],
    question: 'Quel moment de la journée d’école est-ce ? Complète : la … des classes.',
    accepted: ['fin', 'la fin', 'la fin des classes', 'sortie', 'la sortie', 'la sortie des classes'],
    pieges: [
      ['rentrée', 'À la rentrée, on sort ses cahiers. Ici, on les range.'],
      ['récréation', 'À la récréation, les parents n’attendent pas au portail.'],
    ],
    indices: '« rangent » et « les parents attendent »',
  },
];

/** Niveau 4 : un mot du texte attire vers une fausse piste. */
export const ENIGMES_PIEGES: readonly Enigme[] = [
  {
    lignes: [
      'Sur le mur, une affiche montre la mer.',
      'Autour d’Ali, des patients attendent. Une dame appelle : « Au suivant ! »',
      'Ali serre sa joue : sa dent lui fait mal.',
    ],
    question: 'Chez qui Ali attend-il ? Écris le métier.',
    accepted: ['dentiste', 'un dentiste', 'le dentiste', 'chez le dentiste', 'chez un dentiste'],
    pieges: [
      ['pêcheur', 'La mer est seulement sur l’affiche. Pense à la dent.'],
      ['coiffeur', 'On attend aussi chez le coiffeur, mais la dent fait mal.'],
    ],
    indices: '« patients » et « sa dent lui fait mal »',
  },
  {
    lignes: [
      'L’été dernier, Maé a vu la plage.',
      'Aujourd’hui, elle porte un casque, monte sur son vélo et pédale vers l’école.',
      'Sur le chemin, les jonquilles viennent de fleurir.',
    ],
    question: 'En quelle saison se passe la scène d’aujourd’hui ?',
    accepted: ['printemps', 'au printemps', 'le printemps'],
    pieges: [
      ['été', 'L’été, c’est le souvenir de la ligne 1. Regarde « Aujourd’hui » et les jonquilles.'],
      ['hiver', 'En hiver, on ne voit pas les jonquilles fleurir ainsi.'],
    ],
    indices: '« Aujourd’hui » et « les jonquilles viennent de fleurir »',
  },
  {
    lignes: [
      'Zélie dit qu’elle adore les piqûres, mais elle se cache derrière son père.',
      'Elle ne regarde pas l’infirmier et retient ses larmes.',
    ],
    question: 'Que ressent vraiment Zélie ? Écris un seul nom.',
    accepted: [
      'peur',
      'la peur',
      'de la peur',
      'crainte',
      'la crainte',
      'inquiétude',
      'de l’inquiétude',
      'angoisse',
      'de l’angoisse',
      'l’angoisse',
    ],
    pieges: [
      ['joie', 'Ses paroles disent le contraire de ses gestes. Regarde ce qu’elle fait.'],
      ['colère', 'Elle ne crie pas et ne se fâche pas. Regarde ses larmes.'],
    ],
    indices: '« se cache » et « retient ses larmes »',
  },
  {
    lignes: [
      'Hier, Noam a rêvé d’être pompier.',
      'Ce matin, sa mère mélange la pâte, la met au four et vend les pains chauds aux voisins.',
    ],
    question: 'Quel métier fait la mère de Noam ?',
    accepted: ['boulangère', 'une boulangère', 'la boulangère', 'boulanger'],
    pieges: [
      ['pompier', 'Pompier, c’est le rêve de Noam. La question parle de sa mère.'],
      ['cuisinière', 'Elle vend des pains : il existe un métier plus précis.'],
    ],
    indices: '« pâte », « four » et « pains »',
  },
];

export const LONGS_INFERENCE: readonly TexteLong[] = [
  {
    titre: 'Le grand jour',
    lignes: [
      'Le réveil sonne à six heures. Dehors, il fait encore nuit.',
      'Louise vérifie sa valise et son billet.',
      'Elle saute de joie : sa grand-mère l’attend à l’autre bout du pays.',
      'Sur le quai, près des rails, un haut-parleur annonce le départ.',
    ],
    trous: [
      trou('Louise va', 'partir en voyage', ['aller à la piscine', 'rester au lit'], '« valise » et « billet ».'),
      trou('Louise se sent', 'heureuse', ['triste', 'fâchée'], '« Elle saute de joie ».'),
      trou(
        'Elle est',
        'dans une gare',
        ['dans un parc', 'dans une cuisine'],
        '« quai », « rails » et « haut-parleur ».',
      ),
      trou('Elle voyage', 'en train', ['à cheval', 'en bateau'], '« quai » et « rails ».'),
    ],
  },
  {
    titre: 'La cabane',
    lignes: [
      'Marius apporte des planches, un marteau et des clous.',
      'Au pied du grand chêne, il tape pendant des heures.',
      'Son ventre gargouille, mais il continue.',
      'Quand il a fini, il bombe le torse et appelle ses amis.',
    ],
    trous: [
      trou('Marius', 'construit une cabane', ['lave une voiture', 'prépare un repas'], '« planches » et « clous ».'),
      trou('Il travaille', 'dehors', ['à la piscine', 'dans une cave'], '« Au pied du grand chêne ».'),
      trou('Pendant son travail, il a', 'faim', ['sommeil', 'très froid'], '« Son ventre gargouille ».'),
      trou('À la fin, il est', 'fier', ['inquiet', 'déçu'], '« il bombe le torse et appelle ses amis ».'),
    ],
  },
  {
    titre: 'L’orage',
    lignes: [
      'Le ciel devient tout noir au-dessus du champ.',
      'Un grondement éclate. Le petit chien de Fanny se glisse sous la table.',
      'Il tremble et ne veut plus sortir.',
      'Fanny ferme les volets et allume une lampe.',
    ],
    trous: [
      trou('Dehors,', 'un orage arrive', ['la neige fond', 'le soleil brille'], '« tout noir » et « grondement ».'),
      trou('Le chien a', 'peur', ['faim', 'envie de jouer'], '« il tremble » et « se glisse sous la table ».'),
      trou(
        'Il se cache',
        'sous la table',
        ['dans le jardin', 'sur le toit'],
        'La ligne 2 dit : « se glisse sous la table ».',
      ),
      trou('Fanny allume la lampe car', 'il fait sombre', ['elle va dormir', 'il fait chaud'], '« tout noir ».'),
    ],
  },
  {
    titre: 'Le premier pas',
    lignes: [
      'Ce lundi, Rayan entre dans une école qu’il ne connaît pas.',
      'Il reste près de la porte, les mains dans les poches.',
      'Une fille lui sourit et lui montre une place libre.',
      'Rayan respire et sourit à son tour.',
    ],
    trous: [
      trou('Rayan est', 'un nouvel élève', ['le directeur', 'un facteur'], '« une école qu’il ne connaît pas ».'),
      trou('Au début, il se sent', 'intimidé', ['très à l’aise', 'en colère'], '« Il reste près de la porte ».'),
      trou('La fille veut', 'l’accueillir', ['le chasser', 'le gronder'], '« lui sourit et lui montre une place ».'),
      trou('À la fin, Rayan se sent', 'rassuré', ['encore plus perdu', 'furieux'], '« respire et sourit ».'),
    ],
  },
];

// ───────────────────────── 3. Sens d'un mot dans le texte ─────────────────────────

export interface Mot {
  readonly mot: string;
  readonly lignes: readonly string[];
  /** Sens dans ce texte, en mots simples (d'après la citation). */
  readonly sens: string;
  /** Sens qui ne convient pas ; le premier est, pour un mot à plusieurs sens, un autre sens réel. */
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

/** `dico` : Académie française (par défaut) ou Trésor de la langue française (`cnrtl`). */
type Article = { readonly article: string; readonly citation: string; readonly dico?: 'cnrtl' };

const mot = (m: Omit<Mot, 'faitId'> & Article): Mot => {
  const { article, citation, dico = 'academie', ...reste } = m;
  return { ...reste, faitId: fait(`mot-${article}`, `${dico}-${article}`, citation) };
};

/** Mots à plusieurs sens : le contexte choisit. */
export const MOTS_PLUSIEURS_SENS: readonly Mot[] = [
  mot({
    mot: 'grue',
    lignes: ['Sur le chantier, la grue soulève une lourde poutre.', 'Les ouvriers la guident.'],
    sens: 'un engin qui soulève des charges',
    faux: [
      autreSens('un grand oiseau au long cou', 'grue'),
      hors('un outil pour creuser'),
      hors('un camion de pompiers'),
    ],
    indice: '« chantier » et « soulève »',
    article: 'grue',
    citation: 'Engin de levage à charpente métallique',
  }),
  mot({
    mot: 'baguette',
    lignes: ['La fée agite sa baguette.', 'Aussitôt, la citrouille devient un carrosse.'],
    sens: 'un bâton mince',
    faux: [autreSens('un pain long', 'baguette'), hors('un chapeau pointu'), hors('un livre de contes')],
    indice: '« fée » et « agite »',
    article: 'baguette',
    citation: 'Bâton mince et flexible.',
  }),
  mot({
    mot: 'addition',
    lignes: ['Le repas est fini au restaurant.', 'Maman demande l’addition au serveur.'],
    sens: 'la note à payer',
    faux: [autreSens('une opération de calcul', 'addition'), hors('un dessert'), hors('une table libre')],
    indice: '« restaurant » et « serveur »',
    article: 'addition',
    citation: 'Note indiquant le total à payer dans un restaurant, un hôtel.',
  }),
  mot({
    mot: 'mine',
    lignes: ['Ce matin, Théo est pâle et fatigué.', '« Tu as mauvaise mine », dit son père.'],
    sens: 'l’air du visage',
    faux: [
      autreSens('la pointe qui écrit dans un crayon', 'mine'),
      hors('un sac de classe'),
      hors('une mauvaise note'),
    ],
    indice: '« pâle et fatigué »',
    article: 'mine',
    citation: 'Aspect que présente une personne et, plus particulièrement, expression qu’offre son visage.',
  }),
  mot({
    mot: 'bureau',
    lignes: ['Lili pose son cahier sur son bureau.', 'Elle s’assied et commence à écrire.'],
    sens: 'une table pour travailler',
    faux: [
      autreSens('une salle où travaillent des employés', 'bureau'),
      hors('une armoire à habits'),
      hors('un tapis'),
    ],
    indice: '« pose son cahier sur » et « écrire »',
    article: 'bureau',
    citation: 'Table, munie ou non de tiroirs, de tablettes, devant laquelle on s’assoit pour lire, pour écrire',
  }),
  mot({
    mot: 'pièce',
    lignes: ['Il manque une pièce au puzzle.', 'Sam la cherche sous le canapé.'],
    sens: 'un morceau d’un ensemble',
    faux: [
      autreSens('une salle de la maison', 'pièce'),
      autreSens('une petite monnaie ronde', 'pièce'),
      hors('la boîte du jeu'),
    ],
    indice: '« puzzle » et « manque »',
    article: 'piece',
    citation: 'Partie, morceau, portion considérés indépendamment du tout auquel ils appartiennent.',
  }),
];

/** Mots plus rares : les mots autour aident. */
export const MOTS_RARES: readonly Mot[] = [
  mot({
    mot: 'paisible',
    lignes: ['Le lac est paisible ce soir.', 'Pas une vague, pas un bruit.'],
    sens: 'calme et doux',
    faux: [hors('agité et bruyant'), hors('très profond'), hors('rempli de poissons')],
    indice: '« pas une vague, pas un bruit »',
    article: 'paisible',
    citation: 'Qui est doux, calme et pacifique',
  }),
  mot({
    mot: 'ravi',
    lignes: ['Quand il ouvre son cadeau, Oscar est ravi.', 'Il rit et remercie tout le monde.'],
    sens: 'très content',
    faux: [hors('très fâché'), hors('très fatigué'), hors('très pressé')],
    indice: '« il rit et remercie »',
    article: 'ravi',
    citation: 'Qui éprouve un plaisir vif, un grand contentement.',
  }),
  mot({
    mot: 'épuisé',
    lignes: ['Après la longue course, Nils est épuisé.', 'Il ne peut plus faire un seul pas.'],
    sens: 'à bout de forces',
    faux: [hors('très content'), hors('plein d’énergie'), hors('très surpris')],
    indice: '« longue course » et « plus faire un seul pas »',
    article: 'epuise',
    citation: 'Qui est à bout de forces, de résistance ; exténué.',
  }),
  mot({
    mot: 'sentier',
    lignes: ['Les marcheurs suivent un sentier dans les bois.', 'Ils passent un par un entre les fougères.'],
    sens: 'un chemin étroit',
    faux: [hors('une grande route pour les voitures'), hors('un ruisseau'), hors('une cabane en bois')],
    indice: '« suivent » et « un par un »',
    article: 'sentier',
    citation: 'Chemin étroit qui passe à travers champs, monts, bois, etc.',
  }),
  mot({
    mot: 'frayeur',
    lignes: ['Un bruit énorme éclate dans la nuit.', 'Saisi de frayeur, le lapin bondit dans son trou.'],
    sens: 'une peur soudaine et forte',
    faux: [hors('une grande joie'), hors('un petit froid'), hors('une envie de dormir')],
    indice: '« bruit énorme » et « bondit dans son trou »',
    article: 'frayeur',
    citation: 'Peur brusque et violente',
  }),
  mot({
    mot: 'déguerpir',
    lignes: ['Le renard entend le chien aboyer.', 'Il préfère déguerpir : en un instant, il a disparu.'],
    sens: 'partir très vite pour échapper à un danger',
    faux: [hors('s’asseoir tranquillement'), hors('chasser le chien'), hors('creuser un trou lentement')],
    indice: '« en un instant, il a disparu »',
    article: 'deguerpir',
    citation: 'Se sauver, partir brusquement pour échapper à une situation difficile ou dangereuse.',
  }),
  mot({
    mot: 'dissimuler',
    lignes: ['Pour la surprise, Anna veut dissimuler le paquet.', 'Elle le glisse derrière le rideau.'],
    sens: 'cacher',
    faux: [hors('montrer à tous'), hors('déchirer'), hors('peser')],
    indice: '« surprise » et « derrière le rideau »',
    article: 'dissimuler',
    dico: 'cnrtl',
    citation: 'Cacher pour autrui, autant que faire se peut, par un moyen approprié.',
  }),
  mot({
    mot: 'contempler',
    lignes: ['Assise sur le rocher, Aïcha reste à contempler le coucher du soleil.', 'Elle ne bouge plus.'],
    sens: 'regarder longuement avec attention',
    faux: [hors('dessiner très vite'), hors('tourner le dos'), hors('éteindre')],
    indice: '« reste » et « ne bouge plus »',
    article: 'contempler',
    citation: 'Considérer avec attention un être ou une chose.',
  }),
  mot({
    mot: 'averse',
    lignes: ['Une averse surprend les promeneurs.', 'En deux minutes, ils sont trempés.'],
    sens: 'une pluie soudaine et forte',
    faux: [hors('un grand soleil'), hors('un petit brouillard'), hors('un chien errant')],
    indice: '« trempés »',
    article: 'averse',
    citation: 'Pluie subite et abondante.',
  }),
  mot({
    mot: 'frissonner',
    lignes: ['Sans pull, Eliott se met à frissonner.', 'Le vent glacé entre par la fenêtre.'],
    sens: 'trembler légèrement',
    faux: [hors('transpirer beaucoup'), hors('chanter fort'), hors('s’endormir')],
    indice: '« sans pull » et « vent glacé »',
    article: 'frissonner',
    citation: 'Être pris d’un frisson, de frissons.',
  }),
];

/** Niveau 4 : texte plus long où d'autres mots du texte attirent vers une fausse piste. */
export interface MotCherche {
  readonly mot: string;
  readonly lignes: readonly string[];
  readonly indice: string;
  readonly rivaux: readonly string[];
}

export const MOTS_CHERCHES: readonly MotCherche[] = [
  {
    mot: 'grue',
    lignes: [
      'Sur le chantier, une pelleteuse creuse un grand trou.',
      'Un camion apporte de lourdes poutres.',
      'Puis la grue les soulève jusqu’en haut du mur.',
    ],
    indice: '« les soulève jusqu’en haut du mur »',
    rivaux: ['pelleteuse', 'camion', 'chantier'],
  },
  {
    mot: 'baguette',
    lignes: [
      'La fée pose son chapeau près d’un vieux grimoire.',
      'Elle prend sa baguette, fine et légère,',
      'puis l’agite pour dessiner un cercle dans l’air.',
    ],
    indice: '« fine et légère » et « l’agite »',
    rivaux: ['grimoire', 'chapeau', 'cercle'],
  },
  {
    mot: 'addition',
    lignes: [
      'Au restaurant, Papa lit le menu et choisit un plat.',
      'Après le dessert, il demande l’addition au serveur,',
      'puis il sort sa carte pour payer.',
    ],
    indice: '« Après le dessert » et « pour payer »',
    rivaux: ['menu', 'carte', 'dessert'],
  },
  {
    mot: 'mine',
    lignes: [
      'Ce matin, Théo parle d’une petite voix et garde les yeux mi-clos.',
      'Son père observe son visage pâle :',
      '« Tu as mauvaise mine, reste au chaud. »',
    ],
    indice: '« observe son visage pâle »',
    rivaux: ['voix', 'yeux', 'chaud'],
  },
  {
    mot: 'bureau',
    lignes: [
      'Dans sa chambre, Lili tire sa chaise près de son bureau.',
      'Elle pose son cahier dessus, à côté de la lampe,',
      'puis se met à écrire.',
    ],
    indice: '« Elle pose son cahier dessus » et « écrire »',
    rivaux: ['chaise', 'lampe', 'chambre'],
  },
  {
    mot: 'pièce',
    lignes: [
      'Sam termine son puzzle sur le tapis du salon.',
      'La boîte est vide, mais l’image a encore un trou :',
      'il manque une pièce au milieu du ciel.',
    ],
    indice: '« puzzle » et « encore un trou »',
    rivaux: ['boîte', 'image', 'tapis'],
  },
];

/** Textes à mots multiples (niveau 5) : chaque mot (des listes ci-dessus) a son indice, cité du récit. */
export const RECITS_MOTS: readonly {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly mots: readonly { readonly mot: string; readonly indice: string }[];
}[] = [
  {
    titre: 'La promenade',
    lignes: [
      'Le matin, la forêt est paisible : on n’entend aucun bruit.',
      'Lou et son grand-père suivent un sentier entre les arbres, l’un derrière l’autre.',
      'Soudain, une averse éclate : en un instant, ils sont trempés.',
      'Un renard entend un chien aboyer et préfère déguerpir : on ne le voit déjà plus.',
    ],
    mots: [
      { mot: 'paisible', indice: '« on n’entend aucun bruit »' },
      { mot: 'sentier', indice: '« entre les arbres » et « l’un derrière l’autre »' },
      { mot: 'averse', indice: '« Soudain » et « ils sont trempés »' },
      { mot: 'déguerpir', indice: '« entend un chien aboyer » et « on ne le voit déjà plus »' },
    ],
  },
  {
    titre: 'La surprise',
    lignes: [
      'Mila veut dissimuler le cadeau sous le lit, pour que personne ne le voie.',
      'Puis elle reste à la fenêtre pour contempler la neige : pendant une heure, ses yeux ne quittent pas les flocons.',
      'Quand son frère découvre le paquet, il est ravi : il rit et saute de joie.',
      'Le soir, épuisé, il n’a plus la force de monter l’escalier et s’endort sur le tapis.',
    ],
    mots: [
      { mot: 'dissimuler', indice: '« sous le lit » et « pour que personne ne le voie »' },
      { mot: 'contempler', indice: '« pendant une heure » et « ses yeux ne quittent pas les flocons »' },
      { mot: 'ravi', indice: '« il rit et saute de joie »' },
      { mot: 'épuisé', indice: '« n’a plus la force » et « s’endort sur le tapis »' },
    ],
  },
  {
    titre: 'La nuit d’hiver',
    lignes: [
      'Dehors, le vent glacé fait frissonner Basile, et ses dents claquent.',
      'Un cri soudain dans le noir le remplit de frayeur : son cœur bondit.',
      'Il court sur le sentier, où les branches des deux côtés frôlent ses épaules.',
      'Chez lui, près du feu, tout redevient paisible : plus un bruit, plus de danger.',
    ],
    mots: [
      { mot: 'frissonner', indice: '« vent glacé » et « ses dents claquent »' },
      { mot: 'frayeur', indice: '« Un cri soudain dans le noir » et « son cœur bondit »' },
      { mot: 'sentier', indice: '« Il court sur le sentier » et « frôlent ses épaules »' },
      { mot: 'paisible', indice: '« plus un bruit, plus de danger »' },
    ],
  },
];

// ───────────────────────── 4. Ordre des événements ─────────────────────────

export interface Recit {
  readonly titre: string;
  readonly lignes: readonly string[];
  /** Événements dans l'ordre où ils se passent. */
  readonly evenements: readonly string[];
  /** Ce qui permet de retrouver l'ordre. */
  readonly preuve: string;
}

/** Trois événements, racontés dans l'ordre (niveaux 1 et 2). */
export const RECITS_COURTS: readonly Recit[] = [
  {
    titre: 'Le goûter',
    lignes: ['D’abord, Nino se lave les mains.', 'Puis il coupe une pomme.', 'Enfin, il la croque.'],
    evenements: ['Nino se lave les mains', 'Nino coupe une pomme', 'Nino croque la pomme'],
    preuve: '« D’abord », « Puis » et « Enfin » donnent l’ordre.',
  },
  {
    titre: 'La plante',
    lignes: ['D’abord, Sara sème la graine.', 'Ensuite, elle l’arrose.', 'Enfin, une pousse sort de terre.'],
    evenements: ['Sara sème la graine', 'Sara arrose la graine', 'une pousse sort de terre'],
    preuve: '« D’abord », « Ensuite » et « Enfin » donnent l’ordre.',
  },
  {
    titre: 'Le courrier',
    lignes: ['D’abord, Yann écrit une carte.', 'Puis il colle un timbre.', 'Enfin, il la glisse dans la boîte.'],
    evenements: ['Yann écrit une carte', 'Yann colle un timbre', 'Yann glisse la carte dans la boîte'],
    preuve: '« D’abord », « Puis » et « Enfin » donnent l’ordre.',
  },
  {
    titre: 'Le réveil',
    lignes: ['D’abord, le réveil sonne.', 'Puis Maya ouvre les volets.', 'Enfin, elle descend déjeuner.'],
    evenements: ['le réveil sonne', 'Maya ouvre les volets', 'Maya descend déjeuner'],
    preuve: '« D’abord », « Puis » et « Enfin » donnent l’ordre.',
  },
];

/** Quatre événements racontés dans l'ordre (niveaux 2 et 3). */
export const RECITS_QUATRE: readonly Recit[] = [
  {
    titre: 'La cabane aux oiseaux',
    lignes: [
      'Au début, Elsa dessine un plan.',
      'Après cela, elle découpe les planches.',
      'Puis elle les cloue.',
      'Pour finir, elle accroche la cabane à un arbre.',
    ],
    evenements: [
      'Elsa dessine un plan',
      'Elsa découpe les planches',
      'Elsa cloue les planches',
      'Elsa accroche la cabane',
    ],
    preuve: '« Au début », « Après cela », « Puis », « Pour finir » donnent l’ordre.',
  },
  {
    titre: 'La sortie au musée',
    lignes: [
      'Le matin, la classe monte dans le car.',
      'Une heure plus tard, elle arrive au musée.',
      'Ensuite, un guide présente un squelette géant.',
      'Au retour, les élèves chantent.',
    ],
    evenements: [
      'la classe monte dans le car',
      'la classe arrive au musée',
      'un guide présente un squelette',
      'les élèves chantent au retour',
    ],
    preuve: '« Le matin », « Une heure plus tard », « Ensuite », « Au retour » donnent l’ordre.',
  },
  {
    titre: 'La soupe',
    lignes: [
      'D’abord, Karim épluche les légumes.',
      'Puis il les met dans la marmite.',
      'Ensuite, il ajoute de l’eau.',
      'Enfin, il allume le feu.',
    ],
    evenements: [
      'Karim épluche les légumes',
      'Karim met les légumes dans la marmite',
      'Karim ajoute de l’eau',
      'Karim allume le feu',
    ],
    preuve: '« D’abord », « Puis », « Ensuite », « Enfin » donnent l’ordre.',
  },
  {
    titre: 'Le chaton',
    lignes: [
      'Lundi, Nora trouve un chaton dans la cour.',
      'Mardi, elle l’emmène chez le vétérinaire.',
      'Mercredi, elle lui achète un panier.',
      'Jeudi, le chaton s’endort dedans.',
    ],
    evenements: [
      'Nora trouve un chaton',
      'Nora emmène le chaton chez le vétérinaire',
      'Nora achète un panier',
      'le chaton s’endort dans le panier',
    ],
    preuve: 'Les jours se suivent : lundi, mardi, mercredi, jeudi.',
  },
];

/** Le texte ne raconte pas dans l'ordre (niveau 4). */
export const RECITS_DESORDRE: readonly Recit[] = [
  {
    titre: 'La médaille',
    lignes: [
      'Hugo montre sa médaille à la classe.',
      'Il l’a gagnée dimanche, en courant un long parcours.',
      'La veille, il avait acheté des chaussures neuves.',
      'Avant cet achat, il s’était entraîné pendant un mois.',
      'Lundi, avant d’aller en classe, il avait mal aux jambes.',
    ],
    evenements: [
      'Hugo s’entraîne',
      'Hugo achète des chaussures',
      'Hugo court le parcours',
      'Hugo a mal aux jambes',
      'Hugo montre sa médaille à la classe',
    ],
    preuve: 'Suis les indices : « avant cet achat », « la veille », « dimanche », « lundi, avant la classe ».',
  },
  {
    titre: 'Le gâteau raté',
    lignes: [
      'Zia ouvre vite la fenêtre : la cuisine est pleine de fumée.',
      'Elle avait oublié son gâteau dans le four.',
      'Avant de le mettre au four, elle avait mélangé la pâte.',
      'Avant de mélanger, elle avait acheté des œufs.',
    ],
    evenements: [
      'Zia achète des œufs',
      'Zia mélange la pâte',
      'Zia met le gâteau au four',
      'la cuisine se remplit de fumée',
      'Zia ouvre la fenêtre',
    ],
    preuve: 'Le mot « avant » fait remonter le temps. La fumée vient du gâteau oublié, puis Zia ouvre.',
  },
  {
    titre: 'Le trésor',
    lignes: [
      'Sami ouvre le coffre : il est plein de billes.',
      'Il l’avait déterré au pied du pommier.',
      'Avant de creuser, il avait lu une vieille carte.',
      'Cette carte, il l’avait trouvée dans le grenier.',
      'Après avoir ouvert le coffre, il appelle sa sœur.',
    ],
    evenements: [
      'Sami trouve la carte',
      'Sami lit la carte',
      'Sami déterre le coffre',
      'Sami ouvre le coffre',
      'Sami appelle sa sœur',
    ],
    preuve: 'On remonte le temps : la carte est trouvée avant d’être lue, puis on creuse.',
  },
  {
    titre: 'La fête des voisins',
    lignes: [
      'À la fin de la soirée, les voisins rangent les chaises.',
      'Au début, ils avaient dressé de grandes tables.',
      'Après le repas, ils avaient dansé.',
      'Juste après avoir dressé les tables, ils avaient mangé ensemble.',
    ],
    evenements: [
      'les voisins dressent les tables',
      'les voisins mangent',
      'les voisins dansent',
      'les voisins rangent les chaises',
    ],
    preuve: '« Au début », « Après le repas » et « À la fin » donnent l’ordre.',
  },
];

/** Niveau 5 : récits longs, propres à ce niveau ; le premier fait arrivé est raconté en dernier. */
export interface RecitLong {
  readonly titre: string;
  readonly lignes: readonly string[];
  /** Dans l'ordre où ils se passent, avec la preuve (citée du récit) de leur place. */
  readonly evenements: readonly { readonly fait: string; readonly raison: string }[];
}

export const RECITS_LONGS: readonly RecitLong[] = [
  {
    titre: 'Le spectacle',
    lignes: [
      'Samedi soir, Lila salue le public sous les applaudissements.',
      'Le lendemain, elle range son costume dans une malle.',
      'Une semaine après, elle prête cette malle à son cousin.',
      'Avant de monter sur scène, ce samedi, elle s’était maquillée.',
      'La veille du spectacle, elle avait répété une dernière fois.',
      'Auparavant, elle avait cousu son costume.',
      'Mais avant de le coudre, elle avait choisi un tissu rouge au marché.',
    ],
    evenements: [
      { fait: 'Lila choisit un tissu', raison: '« avant de le coudre » : le tissu est choisi avant tout le reste.' },
      {
        fait: 'Lila coud son costume',
        raison: '« Auparavant » : le costume est cousu avant la répétition, une fois le tissu choisi.',
      },
      {
        fait: 'Lila répète une dernière fois',
        raison: '« La veille du spectacle » : la répétition a lieu le vendredi, après la couture.',
      },
      {
        fait: 'Lila se maquille',
        raison: '« Avant de monter sur scène, ce samedi » : le maquillage vient après la répétition de la veille.',
      },
      {
        fait: 'Lila salue le public',
        raison: '« Samedi soir » : Lila salue après être montée sur scène, donc après le maquillage.',
      },
      {
        fait: 'Lila range son costume',
        raison: '« Le lendemain » : le costume est rangé le jour qui suit le spectacle.',
      },
      {
        fait: 'Lila prête la malle',
        raison: '« Une semaine après » : le prêt vient bien après le rangement du costume.',
      },
    ],
  },
  {
    titre: 'Les tomates',
    lignes: [
      'En juillet, Adam croque sa première tomate.',
      'Le lendemain, il en offre un panier à sa voisine.',
      'Une semaine après, la voisine lui apporte une tarte.',
      'Sa première tomate, il l’avait cueillie la veille du jour où il l’a croquée.',
      'En mai, il avait planté les jeunes pieds dehors.',
      'Auparavant, il les avait fait pousser dans des pots.',
      'Tout cela avait commencé en mars, quand il avait acheté un sachet de graines.',
    ],
    evenements: [
      {
        fait: 'Adam achète des graines',
        raison: '« Tout cela avait commencé en mars » : l’achat des graines est le premier fait.',
      },
      {
        fait: 'les plants poussent dans des pots',
        raison: '« Auparavant » : les plants poussent en pots avant d’aller dehors, une fois les graines achetées.',
      },
      { fait: 'Adam plante les pieds dehors', raison: '« En mai » : la plantation dehors vient après les pots.' },
      {
        fait: 'Adam cueille la tomate',
        raison:
          '« la veille » : la tomate est cueillie un jour avant d’être croquée, en juillet, après la plantation de mai.',
      },
      {
        fait: 'Adam croque la tomate',
        raison: '« En juillet, Adam croque » : il croque la tomate le lendemain de sa cueillette.',
      },
      {
        fait: 'Adam offre un panier',
        raison: '« Le lendemain » : le panier est offert le jour qui suit la première tomate.',
      },
      {
        fait: 'la voisine apporte une tarte',
        raison: '« Une semaine après » : la tarte arrive bien après le panier offert.',
      },
    ],
  },
  {
    titre: 'Le colis',
    lignes: [
      'Jeudi, Inès ouvre enfin le colis de son grand-père.',
      'Le lendemain, elle lui téléphone pour le remercier.',
      'Une semaine après, elle lui envoie un dessin.',
      'La veille de l’ouverture, le facteur avait déposé le colis chez la voisine.',
      'Lundi, son grand-père l’avait porté à la poste.',
      'Auparavant, il avait emballé un livre dans du carton.',
      'Ce livre, il l’avait acheté la semaine précédente.',
    ],
    evenements: [
      {
        fait: 'le grand-père achète un livre',
        raison: '« la semaine précédente » : l’achat du livre vient avant tout le reste.',
      },
      {
        fait: 'le grand-père emballe le livre',
        raison: '« Auparavant » : le livre est emballé avant d’être porté à la poste.',
      },
      { fait: 'le grand-père va à la poste', raison: '« Lundi » : le colis part à la poste une fois emballé.' },
      {
        fait: 'le facteur dépose le colis',
        raison: '« La veille de l’ouverture » : le facteur passe le mercredi, après l’envoi de lundi.',
      },
      {
        fait: 'Inès ouvre le colis',
        raison: '« Jeudi » : Inès ouvre le colis le jour qui suit le passage du facteur.',
      },
      { fait: 'Inès téléphone', raison: '« Le lendemain » : l’appel a lieu après l’ouverture du colis.' },
      { fait: 'Inès envoie un dessin', raison: '« Une semaine après » : le dessin part bien après l’appel.' },
    ],
  },
  {
    titre: 'Le bateau',
    lignes: [
      'Dimanche, le petit bateau de Noé flotte sur l’étang.',
      'Le lendemain, Noé le fait sécher au soleil.',
      'Une semaine après, il l’offre à sa petite sœur.',
      'La veille de sa sortie sur l’étang, il avait fixé la voile au mât.',
      'Auparavant, il avait peint la coque en bleu.',
      'Avant de peindre, il avait collé les planches de la coque.',
      'Mais tout au départ, il avait dessiné le bateau sur une feuille.',
    ],
    evenements: [
      {
        fait: 'Noé dessine le bateau',
        raison: '« tout au départ » : le dessin est le premier fait, même s’il est raconté en dernier.',
      },
      {
        fait: 'Noé colle les planches',
        raison: '« Avant de peindre » : les planches sont collées avant la peinture, après le dessin.',
      },
      { fait: 'Noé peint la coque', raison: '« Auparavant » : la coque est peinte avant la pose de la voile.' },
      {
        fait: 'Noé fixe la voile',
        raison: '« La veille de sa sortie sur l’étang » : la voile est fixée le samedi, après la peinture.',
      },
      {
        fait: 'le bateau flotte sur l’étang',
        raison: '« Dimanche » : le bateau flotte le jour qui suit la pose de la voile.',
      },
      {
        fait: 'Noé fait sécher le bateau',
        raison: '« Le lendemain » : le bateau sèche le lundi, après l’essai sur l’eau.',
      },
      { fait: 'Noé offre le bateau', raison: '« Une semaine après » : le cadeau vient bien après le séchage.' },
    ],
  },
];

// ───────────────────────── 5. Consigne et document légendé ─────────────────────────

export interface Verbe {
  readonly verbe: string;
  /** Phrase de consigne complète. */
  readonly consigne: string;
  /** Ce qu'on doit faire. */
  readonly geste: string;
  readonly faitId: string;
}

const verbe = (verbeInfinitif: string, consigne: string, geste: string, source: string, citation: string): Verbe => ({
  verbe: verbeInfinitif,
  consigne,
  geste,
  faitId: fait(`geste-${verbeInfinitif}`, source, citation),
});

export const VERBES: readonly Verbe[] = [
  verbe(
    'souligner',
    'Souligne le verbe.',
    'tirer un trait sous le mot',
    'cnrtl-souligner',
    'Tracer un trait, tirer une ligne sous un ou plusieurs signes graphiques',
  ),
  verbe(
    'entourer',
    'Entoure le nom.',
    'faire une ligne ronde tout autour du mot',
    'academie-entourer',
    'Entourer un mot d’un trait de couleur.',
  ),
  verbe(
    'cocher',
    'Coche la bonne réponse.',
    'faire une marque, comme une croix, près de la réponse',
    'academie-cocher',
    'Cochez d’une croix la réponse juste.',
  ),
  verbe(
    'barrer',
    'Barre l’intrus.',
    'rayer d’un trait ce qui ne va pas',
    'academie-barrer',
    'Rayer d’un ou de plusieurs traits ce qui est écrit',
  ),
  verbe(
    'relier',
    'Relie chaque mot à son image.',
    'réunir deux éléments par un trait',
    'academie-relier',
    'Réunir entre eux divers éléments, les assembler.',
  ),
  verbe(
    'recopier',
    'Recopie la phrase.',
    'écrire à nouveau le texte tel qu’il est',
    'academie-recopier',
    'Transcrire à la main un écrit, un texte.',
  ),
  verbe(
    'encadrer',
    'Encadre la date.',
    'tracer un cadre, comme un rectangle, autour',
    'academie-encadrer',
    'Encadrer d’un trait rouge un article intéressant.',
  ),
  verbe('compléter', 'Complète la phrase.', 'ajouter ce qui manque', 'academie-completer', 'Rendre complet.'),
  verbe(
    'colorier',
    'Colorie le dessin.',
    'mettre des couleurs sur le dessin',
    'academie-colorier',
    'Teinter un dessin, une surface, de diverses couleurs.',
  ),
  verbe(
    'numéroter',
    'Numérote les images.',
    'mettre un numéro sur chaque image',
    'academie-numeroter',
    'Distinguer par un numéro des choses de même ordre.',
  ),
];

export interface Objet {
  readonly signe: string;
  readonly nom: string;
}

export interface Plan {
  readonly titre: string;
  /** Légende : un signe, un nom. */
  readonly legende: readonly Objet[];
  /** Cases remplies : « B2 » → signe. */
  readonly cases: Readonly<Record<string, string>>;
}

export const PLANS: readonly Plan[] = [
  {
    titre: 'Le parc',
    legende: [
      { signe: '▲', nom: 'un arbre' },
      { signe: '●', nom: 'un banc' },
      { signe: '★', nom: 'une fontaine' },
      { signe: '■', nom: 'une cabane' },
    ],
    cases: { A1: '▲', B2: '●', C2: '★', B3: '■' },
  },
  {
    titre: 'La cour de l’école',
    legende: [
      { signe: '▲', nom: 'un panier de basket' },
      { signe: '●', nom: 'un banc' },
      { signe: '★', nom: 'un robinet' },
      { signe: '■', nom: 'un abri' },
    ],
    cases: { B1: '▲', C1: '●', A2: '★', C3: '■' },
  },
  {
    titre: 'La salle de classe',
    legende: [
      { signe: '▲', nom: 'le tableau' },
      { signe: '●', nom: 'la poubelle' },
      { signe: '★', nom: 'la bibliothèque' },
      { signe: '■', nom: 'le bureau du maître' },
    ],
    cases: { B1: '▲', A3: '●', C3: '★', C1: '■' },
  },
  {
    titre: 'Le camping',
    legende: [
      { signe: '▲', nom: 'une tente' },
      { signe: '●', nom: 'un point d’eau' },
      { signe: '★', nom: 'un feu' },
      { signe: '■', nom: 'la réception' },
    ],
    cases: { A1: '■', C1: '▲', B2: '★', A3: '●' },
  },
];

export interface Suite {
  readonly titre: string;
  readonly consigne: string;
  /** Actions dans l'ordre à suivre. */
  readonly actions: readonly string[];
}

/** Consignes à plusieurs étapes, écrites dans le désordre (niveau 4). */
export const SUITES: readonly Suite[] = [
  {
    titre: 'Exercice de grammaire',
    consigne:
      'Avant de souligner les verbes, lis tout le texte. Après les avoir soulignés, recopie-les. Pour finir, écris leur infinitif.',
    actions: ['lire le texte', 'souligner les verbes', 'recopier les verbes', 'écrire les infinitifs'],
  },
  {
    titre: 'Fiche de calcul',
    consigne:
      'Écris ton prénom après avoir sorti ton crayon. Ensuite, fais les calculs. Relis-les juste avant de rendre la fiche.',
    actions: ['sortir le crayon', 'écrire le prénom', 'faire les calculs', 'relire les calculs', 'rendre la fiche'],
  },
  {
    titre: 'Arts plastiques',
    consigne:
      'Colorie le dessin après l’avoir découpé. Avant de découper, trace le contour. Enfin, colle-le sur la feuille.',
    actions: ['tracer le contour', 'découper le dessin', 'colorier le dessin', 'coller le dessin'],
  },
  {
    titre: 'Lecture',
    consigne:
      'Avant de répondre, lis la question. Mais lis d’abord le texte, avant la question. Après avoir répondu, vérifie ta phrase.',
    actions: ['lire le texte', 'lire la question', 'répondre', 'vérifier la phrase'],
  },
];

export interface DocumentSource {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly source: string;
  readonly nature: string;
  readonly trous: readonly Trou[];
}

export const NATURES = ['une recette', 'une affiche', 'une lettre', 'un horaire', 'une règle de jeu'] as const;

/** Documents avec titre, texte, légende et source (niveau 5). */
export const DOCUMENTS: readonly DocumentSource[] = [
  {
    titre: 'Salade de fruits',
    lignes: [
      'Ingrédients : 2 pommes, 1 banane, 1 orange.',
      '1. Lave les fruits. 2. ★ Coupe-les. 3. Mélange-les.',
      'Légende : ★ = demande l’aide d’un adulte (étape 2).',
    ],
    source: 'La classe de CM1',
    nature: 'une recette',
    trous: [
      trou('L’étape marquée ★ est :', 'couper', ['laver', 'mélanger'], 'La légende dit : étape 2.'),
      trou('Il faut', '2 pommes', ['3 pommes', '1 pomme'], 'Les ingrédients disent : « 2 pommes ».'),
    ],
  },
  {
    titre: 'Fête du livre',
    lignes: [
      'Samedi, de 10 h à 17 h, salle des fêtes.',
      'Entrée gratuite. Programme : ● à 14 h.',
      'Légende : ● = atelier pour les enfants.',
    ],
    source: 'La bibliothèque municipale',
    nature: 'une affiche',
    trous: [
      trou(
        'L’atelier pour les enfants a lieu à',
        '14 h',
        ['10 h', '17 h'],
        'La légende dit que ● est l’atelier : ● à 14 h.',
      ),
      trou('L’entrée est', 'gratuite', ['à 2 euros', 'à 5 euros'], 'La ligne 2 dit : « Entrée gratuite ».'),
    ],
  },
  {
    titre: 'Bus de la ligne 3',
    lignes: [
      'Mairie : 8 h 10. Gare : 8 h 25. Collège : 8 h 40.',
      'Le bus passe du lundi au samedi. Dimanche : ★.',
      'Légende : ★ = aucun bus.',
    ],
    source: 'La société de transport',
    nature: 'un horaire',
    trous: [
      trou('Le bus passe à la gare à', '8 h 25', ['8 h 10', '8 h 40'], 'La ligne 1 dit : « Gare : 8 h 25 ».'),
      trou('Le jour sans bus est', 'le dimanche', ['le lundi', 'le samedi'], 'Le signe ★ veut dire « aucun bus ».'),
    ],
  },
  {
    titre: 'Le jeu des quatre coins',
    lignes: [
      'Quatre joueurs se placent dans les coins. Un cinquième est au centre.',
      'Au signal, les joueurs changent de coin.',
      'Légende : ■ = joueur du centre, qui essaie de prendre un coin libre.',
    ],
    source: 'Le centre de loisirs',
    nature: 'une règle de jeu',
    trous: [
      trou(
        'Le joueur ■ se trouve d’abord',
        'au centre',
        ['dans un coin', 'hors du jeu'],
        'La ligne 1 dit : « Un cinquième est au centre ».',
      ),
      trou(
        'Les joueurs changent de coin',
        'au signal',
        ['quand ils veulent', 'jamais'],
        'La ligne 2 dit : « Au signal ».',
      ),
    ],
  },
];

export const FAITS_LECTURE: readonly Fait[] = [...faits.values()];

export const faitLecture = (id: string): Fait => {
  const f = faits.get(id);
  if (!f) throw new RangeError(`fait inconnu : ${id}`);
  return f;
};

/** Identifiants de sources distincts des faits donnés. */
export const sourcesLecture = (ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitLecture(id).source)]),
];
