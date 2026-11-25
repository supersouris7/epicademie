/**
 * Données du chapitre « Nature des mots » (CM2) : faits cités et banques de phrases écrites pour l'exercice.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GUIDE = 'eduscol-grammaire-francais';

const prog = (id: string, citation: string): Fait => ({ id, source: PROGRAMME, citation });
const guide = (id: string, citation: string): Fait => ({ id, source: GUIDE, citation });

export const FAITS_NATURE_CM2: readonly Fait[] = [
  prog('prepositions', 'Identifier et nommer les prépositions'),
  guide('preposition-invariable', 'La préposition est un mot invariable. Elle introduit un groupe prépositionnel'),
  guide(
    'preposition-place',
    'Les prépositions se placent devant un nom (une chaise de bureau), un groupe nominal (chez mes amis, pour Alice), un pronom (pour toi)',
  ),
  guide('preposition-frequentes', 'de, à, en, dans, pour, sur, avec, par, sans'),
  guide('preposition-locution', 'Les prépositions peuvent être constituées d’un seul mot (sur)'),
  guide('preposition-temps', 'Temps : avant l’orage, après l’été, depuis cette époque'),
  guide('preposition-cause', 'Cause : à cause de ces intempéries, grâce à votre intervention'),
  guide('preposition-but', 'But : pour toi'),
  guide('preposition-opposition', 'Opposition : malgré eux, contre tous les principes'),
  guide('preposition-lieu', 'Lieu : chez mes parents, en ville, dans la salle, autour de l’île'),
  prog(
    'subordination',
    'Identifier et nommer les conjonctions de subordination (en lien avec l’introduction des phrases complexes)',
  ),
  guide(
    'subordination-definition',
    'Les conjonctions de subordination sont des mots invariables qui introduisent une proposition subordonnée',
  ),
  guide('subordination-incluse', 'la proposition subordonnée inclut le mot subordonnant'),
  guide('subordination-temps', 'quand, lorsque, dès que, pendant que, avant que'),
  guide('subordination-cause', 'comme, parce que, puisque'),
  guide('subordination-but', 'afin que, pour que, de peur que'),
  guide('subordination-concession', 'même si, bien que, quoique'),
  guide('subordination-hypothese', 'si, au cas où, à condition que'),
  guide('coordination', 'Mais, ou, et, or, ni, car'),
  prog('deux-types', 'Reconnaître les deux types de pronoms personnels (sujet, compléments)'),
  prog('pronoms-objet', 'Identifier les pronoms personnels compléments d’objet'),
  guide('cod', 'pronoms personnels de fonction complément d’objet direct : le, la, les'),
  guide('coi', 'pronoms personnels de fonction complément d’objet indirect : lui'),
  guide('antecedent', 'le pronom la a pour antécédent le GN une maison'),
  guide(
    'leur-invariable',
    'Cette forme, toujours invariable, ne peut être confondue avec celle du déterminant possessif',
  ),
  prog('variations', 'Connaître les variations du pronom personnel (personne, nombre, fonction)'),
  guide('formes-variables', 'varient selon la personne, le genre, le nombre et la fonction'),
  guide('sujets', 'pronoms personnels de fonction sujet : je, tu, il(s), elle(s)'),
  guide('nous-vous', 'pronoms personnels de fonction sujet ou complément (direct ou indirect) : nous, vous'),
  guide('me-te', 'pronoms personnels de fonction complément d’objet (direct ou indirect) : me, te, se'),
  prog(
    'classes-variables',
    'Consolider les capacités à identifier, classer et repérer les variations des classes de mots : déterminant, nom, adjectif, pronom personnel, verbe',
  ),
  guide('verbe-varie', 'Le verbe varie en personne, en temps, en mode, en voix, en nombre et parfois en genre'),
  guide('adverbe-invariable', 'Les adverbes sont des mots invariables'),
  guide('coordination-invariable', 'Les conjonctions de coordination sont des mots invariables'),
  guide('prepositions-invariables', 'Les prépositions sont des mots invariables'),
];

export const faitNatureCm2 = (id: string): Fait => {
  const x = FAITS_NATURE_CM2.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme et guide de grammaire) des faits cités par une notion. */
export const sourcesDeCm2 = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitNatureCm2(id).source)]),
];

// ───────────────────────── Prépositions ─────────────────────────

/** Prépositions d'un seul mot utilisées dans les phrases, toutes citées par le guide. */
export const PREPOSITIONS = [
  'de',
  'à',
  'en',
  'dans',
  'pour',
  'sur',
  'avec',
  'par',
  'sans',
  'chez',
  'avant',
  'après',
  'depuis',
  'malgré',
  'contre',
] as const;

export interface PhrasePrep {
  /** Une seule préposition dans la phrase. */
  readonly texte: string;
  readonly prep: string;
  /** Trois autres mots de la phrase : déterminant, nom, verbe. */
  readonly det: string;
  readonly nom: string;
  readonly verbe: string;
}

const ph = (texte: string, prep: string, det: string, nom: string, verbe: string): PhrasePrep => ({
  texte,
  prep,
  det,
  nom,
  verbe,
});

export const PHRASES_PREP: readonly PhrasePrep[] = [
  ph('Le chat dort sur le canapé.', 'sur', 'le', 'chat', 'dort'),
  ph('Les enfants jouent dans la cour.', 'dans', 'la', 'cour', 'jouent'),
  ph('Mon frère part sans son manteau.', 'sans', 'son', 'manteau', 'part'),
  ph('Ma sœur dessine avec ses feutres.', 'avec', 'ses', 'feutres', 'dessine'),
  ph('Ce cadeau est pour ta cousine.', 'pour', 'ta', 'cadeau', 'est'),
  ph('Nous restons chez mes voisins.', 'chez', 'mes', 'voisins', 'restons'),
  ph('Le chien court après le ballon.', 'après', 'le', 'ballon', 'court'),
  ph('La classe sort avant la sonnerie.', 'avant', 'la', 'sonnerie', 'sort'),
  ph('Les joueurs avancent malgré la pluie.', 'malgré', 'la', 'pluie', 'avancent'),
  ph('Je pose mon vélo contre le mur.', 'contre', 'mon', 'vélo', 'pose'),
];

/** Phrases à préposition de plusieurs formes ou moins fréquentes (niveau 4). */
export const PREPS_RARES: readonly {
  readonly texte: string;
  readonly prep: string;
  readonly faux: readonly string[];
}[] = [
  { texte: 'Nous habitons ici depuis cet été.', prep: 'depuis', faux: ['ici', 'cet', 'habitons'] },
  { texte: 'Le match continue malgré le vent.', prep: 'malgré', faux: ['le', 'continue', 'vent'] },
  { texte: 'Le bateau tourne autour de cette île.', prep: 'autour de', faux: ['autour', 'cette', 'tourne'] },
  { texte: 'L’avion vole au-dessus de la ville.', prep: 'au-dessus de', faux: ['au-dessus', 'vole', 'ville'] },
  { texte: 'La course est annulée à cause de la neige.', prep: 'à cause de', faux: ['cause', 'annulée', 'neige'] },
  { texte: 'Il gagne grâce à son équipe.', prep: 'grâce à', faux: ['grâce', 'son', 'équipe'] },
];

export type Relation = 'le lieu' | 'le temps' | 'la cause' | 'le but' | 'l’opposition';
export const RELATIONS: readonly Relation[] = ['le lieu', 'le temps', 'la cause', 'le but', 'l’opposition'];

export const GROUPES_PREP: Record<Relation, readonly string[]> = {
  'le lieu': ['chez mes parents', 'dans la salle', 'autour de l’île'],
  'le temps': ['avant l’orage', 'après l’été', 'depuis cette époque'],
  'la cause': ['à cause de la pluie', 'à cause du bruit', 'grâce à ton aide'],
  'le but': ['pour toi', 'pour mes amis', 'pour ma tante'],
  'l’opposition': ['malgré eux', 'contre tous les autres', 'malgré la fatigue'],
};

/** Lignes d'un petit texte : nombre de prépositions (aucune forme contractée : « du », « au »). */
export interface LignePrep {
  readonly texte: string;
  readonly n: number;
}
const lp = (texte: string, n: number): LignePrep => ({ texte, n });

export const LIGNES_PREP: readonly LignePrep[] = [
  lp('Le matin, je pars avec mon sac.', 1),
  lp('Nous marchons dans la rue sans bruit.', 2),
  lp('Mon voisin range ses outils.', 0),
  lp('Après la classe, je rentre chez moi.', 2),
  lp('La chatte saute sur le lit.', 1),
  lp('Les élèves lisent très vite.', 0),
  lp('Ils jouent avec un ballon dans la cour.', 2),
  lp('Avant le repas, tu mets la table pour nous.', 2),
  lp('Le facteur passe depuis ce matin.', 1),
];

// ───────────────────────── Conjonctions de subordination ─────────────────────────

export type Sens = 'le temps' | 'la cause' | 'le but' | 'la condition' | 'la concession';

export interface PhraseSub {
  /** Phrase avec une seule conjonction de subordination et aucune autre conjonction ni préposition piège. */
  readonly principale: string;
  /** La proposition subordonnée, conjonction comprise, sans point. */
  readonly sub: string;
  readonly conj: string;
  readonly sens: Sens;
  /** Un nom et un verbe de la phrase. */
  readonly nom: string;
  readonly verbe: string;
}

const ps = (
  [principale, sub]: readonly [string, string],
  conj: string,
  sens: Sens,
  nom: string,
  verbe: string,
): PhraseSub => ({ principale, sub, conj, sens, nom, verbe });

export const PHRASES_SUB: readonly PhraseSub[] = [
  ps(['Je mets mon manteau', 'parce que le vent souffle'], 'parce que', 'la cause', 'manteau', 'souffle'),
  ps(['Le chien aboie', 'quand le facteur arrive'], 'quand', 'le temps', 'facteur', 'aboie'),
  ps(['Nous resterons dedans', 'si la pluie continue'], 'si', 'la condition', 'pluie', 'resterons'),
  ps(['Parle fort', 'pour que tes camarades entendent'], 'pour que', 'le but', 'camarades', 'entendent'),
  ps(['Mon frère sort', 'bien que la nuit tombe'], 'bien que', 'la concession', 'nuit', 'tombe'),
  ps(['La classe applaudit', 'lorsque le spectacle finit'], 'lorsque', 'le temps', 'spectacle', 'applaudit'),
  ps(['Tu peux jouer', 'puisque tes devoirs sont finis'], 'puisque', 'la cause', 'devoirs', 'jouer'),
  ps(['Je range ma chambre', 'pendant que ma sœur lit'], 'pendant que', 'le temps', 'chambre', 'range'),
  ps(['Il chuchote', 'afin que le bébé dorme'], 'afin que', 'le but', 'bébé', 'chuchote'),
  ps(['Elle continue sa course', 'quoique ses jambes tremblent'], 'quoique', 'la concession', 'jambes', 'continue'),
];

/** Phrases où la subordonnée commence la phrase ou la conjonction s'élide. */
export interface PhraseSubRare {
  readonly texte: string;
  readonly conj: string;
  readonly accepted: readonly string[];
}

const rare = (texte: string, conj: string, ...accepted: readonly string[]): PhraseSubRare => ({
  texte,
  conj,
  accepted: [conj, ...accepted],
});

export const SUBS_RARES: readonly PhraseSubRare[] = [
  rare('Comme il neige, nous restons dedans.', 'comme'),
  rare('Dès que le feu passe au vert, les voitures avancent.', 'dès que'),
  rare('Je chante lorsqu’il fait beau.', 'lorsque', 'lorsqu’', 'lorsqu'),
  rare('Reste assis puisqu’elle arrive.', 'puisque', 'puisqu’', 'puisqu'),
  rare('Quand le film commence, tout le monde se tait.', 'quand'),
  rare('Lave tes mains avant que nous mangions.', 'avant que'),
  rare('Il sourit parce qu’on le félicite.', 'parce que', 'parce qu’', 'parce qu'),
];

/** Phrases sans conjonction de subordination : coordination ou préposition (une seule par phrase). */
export const PHRASES_AUTRES_LIENS: readonly {
  readonly texte: string;
  readonly mot: string;
  readonly nature: 'une conjonction de coordination' | 'une préposition';
}[] = [
  { texte: 'Je veux sortir, mais il pleut.', mot: 'mais', nature: 'une conjonction de coordination' },
  { texte: 'Il rit car la blague est drôle.', mot: 'car', nature: 'une conjonction de coordination' },
  { texte: 'Tu lis et tu dessines.', mot: 'et', nature: 'une conjonction de coordination' },
  { texte: 'Veux-tu du lait ou du jus ?', mot: 'ou', nature: 'une conjonction de coordination' },
  { texte: 'Ils partent sans leurs gants.', mot: 'sans', nature: 'une préposition' },
  { texte: 'La balle roule dans le jardin.', mot: 'dans', nature: 'une préposition' },
  { texte: 'Nous lisons avant le repas.', mot: 'avant', nature: 'une préposition' },
];

// ───────────────────────── Pronoms compléments ─────────────────────────

export type Objet = 'le' | 'la' | 'les' | 'lui' | 'leur';

export interface Remplacement {
  readonly sujet: string;
  readonly verbe: string;
  readonly groupe: string;
  readonly pronom: Objet;
}

const rp = (sujet: string, verbe: string, groupe: string, pronom: Objet): Remplacement => ({
  sujet,
  verbe,
  groupe,
  pronom,
});

/** Les verbes commencent par une consonne : pas d'élision (« l’ »). */
export const DIRECTS: readonly Remplacement[] = [
  rp('Mon frère', 'mange', 'le gâteau', 'le'),
  rp('Ma sœur', 'range', 'la trousse', 'la'),
  rp('Le jardinier', 'plante', 'les fleurs', 'les'),
  rp('La voisine', 'lave', 'le vélo', 'le'),
  rp('Les garçons', 'regardent', 'la lune', 'la'),
  rp('Papa', 'prépare', 'les crêpes', 'les'),
  rp('Le guide', 'porte', 'la carte', 'la'),
  rp('Mon voisin', 'répare', 'le portail', 'le'),
];

export const INDIRECTS: readonly Remplacement[] = [
  rp('La maîtresse', 'parle', 'à la directrice', 'lui'),
  rp('Mon voisin', 'téléphone', 'à son fils', 'lui'),
  rp('Le guide', 'parle', 'aux visiteurs', 'leur'),
  rp('Ma tante', 'répond', 'à ses amies', 'leur'),
  rp('Le chien', 'ressemble', 'à ses parents', 'leur'),
  rp('Grand-mère', 'sourit', 'au bébé', 'lui'),
];

export const phraseComplete = (r: Remplacement): string => `${r.sujet} ${r.verbe} ${r.groupe}.`;
export const phraseRemplacee = (r: Remplacement, pronom: string = r.pronom): string =>
  `${r.sujet} ${pronom} ${r.verbe}.`;

/** Courtes phrases : sujet, pronom complément, verbe. */
export const MINI_PHRASES: readonly (readonly [string, string, string])[] = [
  ['Je', 'le', 'vois'],
  ['Tu', 'la', 'portes'],
  ['Il', 'les', 'compte'],
  ['Elle', 'me', 'regarde'],
  ['Nous', 'te', 'cherchons'],
  ['Je', 'lui', 'parle'],
  ['Elles', 'leur', 'répondent'],
];

/** Le même petit mot avant un verbe (pronom) ou avant un nom (déterminant). */
export const MOTS_AMBIGUS: readonly { readonly texte: string; readonly mot: string; readonly pronom: boolean }[] = [
  { texte: 'Mon frère le mange.', mot: 'le', pronom: true },
  { texte: 'Je ferme la fenêtre.', mot: 'la', pronom: false },
  { texte: 'Le chien la suit.', mot: 'la', pronom: true },
  { texte: 'Tu ranges les cahiers.', mot: 'les', pronom: false },
  { texte: 'Nous les saluons.', mot: 'les', pronom: true },
  { texte: 'Elle porte le sac.', mot: 'le', pronom: false },
  { texte: 'Ma sœur leur écrit.', mot: 'leur', pronom: true },
  { texte: 'Les voisins arrosent leur jardin.', mot: 'leur', pronom: false },
];

/** Contexte : le groupe est nommé à la première ligne, répété à la seconde. */
export interface Reprise extends Remplacement {
  readonly contexte: string;
  readonly quand: string;
}

const rep = (contexte: string, quand: string, r: Remplacement): Reprise => ({ ...r, contexte, quand });

export const REPRISES: readonly Reprise[] = [
  rep('Mon voisin a deux chiens.', 'Chaque soir', rp('il', 'promène', 'les chiens', 'les')),
  rep('Ma tante a une moto.', 'Le dimanche', rp('elle', 'lave', 'la moto', 'la')),
  rep('Le fermier a un âne.', 'Chaque matin', rp('il', 'brosse', 'l’âne', 'le')),
  rep('La classe reçoit des visiteurs.', 'Ensuite', rp('la maîtresse', 'parle', 'aux visiteurs', 'leur')),
  rep('Mon cousin attend sa mère.', 'Plus tard', rp('il', 'téléphone', 'à sa mère', 'lui')),
  rep('Grand-père cultive des tomates.', 'En été', rp('il', 'cueille', 'les tomates', 'les')),
];

// ───────────────────────── Variations du pronom ─────────────────────────

export interface Forme {
  /** Pronom sujet qui sert de repère. */
  readonly sujet: string;
  /** Complément d'objet direct et indirect de la même personne. */
  readonly cod: string;
  readonly coi: string;
  readonly personne: string;
  readonly pluriel: boolean;
}

const fo = (sujet: string, cod: string, coi: string, personne: string, pluriel: boolean): Forme => ({
  sujet,
  cod,
  coi,
  personne,
  pluriel,
});

export const FORMES: readonly Forme[] = [
  fo('je', 'me', 'me', '1re personne du singulier', false),
  fo('tu', 'te', 'te', '2e personne du singulier', false),
  fo('il', 'le', 'lui', '3e personne du singulier, masculin', false),
  fo('elle', 'la', 'lui', '3e personne du singulier, féminin', false),
  fo('nous', 'nous', 'nous', '1re personne du pluriel', true),
  fo('vous', 'vous', 'vous', '2e personne du pluriel', true),
  fo('ils', 'les', 'leur', '3e personne du pluriel, masculin', true),
  fo('elles', 'les', 'leur', '3e personne du pluriel, féminin', true),
];

/** Verbes commençant par une consonne, avec complément direct puis indirect. */
export const VERBES_COD = ['regarde', 'salue', 'suit', 'cherche', 'porte'] as const;
export const VERBES_COI = ['parle', 'répond', 'sourit', 'téléphone'] as const;

export interface Transformation {
  readonly contexte: string;
  readonly singulier: string;
  readonly pluriel: string;
  /** Le verbe oublié au singulier, et le pronom complément oublié. */
  readonly verbeOublie: string;
  readonly pronomOublie: string;
}

const tr = (contexte: string, singulier: string, pluriel: string, verbeOublie: string, pronomOublie: string) => ({
  contexte,
  singulier,
  pluriel,
  verbeOublie,
  pronomOublie,
});

export const TRANSFORMATIONS: readonly Transformation[] = [
  tr('Le garçon appelle son ami.', 'Il lui parle.', 'Ils leur parlent.', 'Ils leur parle.', 'Ils lui parlent.'),
  tr('La fille voit son voisin.', 'Elle le salue.', 'Elles les saluent.', 'Elles les salue.', 'Elles le saluent.'),
  tr('Le chien aperçoit la chatte.', 'Il la suit.', 'Ils les suivent.', 'Ils les suit.', 'Ils la suivent.'),
  tr(
    'La voisine écoute le bébé.',
    'Elle lui sourit.',
    'Elles leur sourient.',
    'Elles leur sourit.',
    'Elles lui sourient.',
  ),
  tr('Le guide attend la visiteuse.', 'Il la cherche.', 'Ils les cherchent.', 'Ils les cherche.', 'Ils la cherchent.'),
];

// ───────────────────────── Mots variables et invariables ─────────────────────────

export const INVARIABLES = [
  'dans',
  'sur',
  'avec',
  'sans',
  'pour',
  'chez',
  'depuis',
  'malgré',
  'souvent',
  'toujours',
  'hier',
  'demain',
  'très',
  'beaucoup',
  'mais',
  'et',
  'quand',
  'lorsque',
  'puisque',
] as const;

/** Mots variables sans ambiguïté, avec leur classe. */
export const VARIABLES: readonly { readonly mot: string; readonly classe: string; readonly autre: string }[] = [
  { mot: 'chien', classe: 'nom', autre: 'des chiens' },
  { mot: 'petit', classe: 'adjectif', autre: 'des petits pas, une petite porte' },
  { mot: 'chante', classe: 'verbe', autre: 'nous chantons' },
  { mot: 'maison', classe: 'nom', autre: 'des maisons' },
  { mot: 'vert', classe: 'adjectif', autre: 'des feuilles vertes' },
  { mot: 'dort', classe: 'verbe', autre: 'ils dorment' },
  { mot: 'mon', classe: 'déterminant', autre: 'ma, mes' },
  { mot: 'il', classe: 'pronom personnel', autre: 'elle, ils, elles' },
];

/** Phrase au pluriel : mots qui changent, mots qui restent. */
export interface Accord {
  readonly singulier: string;
  /** Segments entre les trous (un de plus que de trous). */
  readonly parts: readonly string[];
  /** Pour chaque trou : mot du singulier, forme attendue. */
  readonly trous: readonly (readonly [string, string])[];
}

export const ACCORDS: readonly Accord[] = [
  {
    singulier: 'Le petit chien dort dans la niche.',
    parts: ['Les ', ' ', ' ', ' ', ' les niches.'],
    trous: [
      ['petit', 'petits'],
      ['chien', 'chiens'],
      ['dort', 'dorment'],
      ['dans', 'dans'],
    ],
  },
  {
    singulier: 'Le grand garçon court après le bus.',
    parts: ['Les ', ' ', ' ', ' ', ' les bus.'],
    trous: [
      ['grand', 'grands'],
      ['garçon', 'garçons'],
      ['court', 'courent'],
      ['après', 'après'],
    ],
  },
  {
    singulier: 'La petite fille chante souvent dans la cour.',
    parts: ['Les ', ' ', ' ', ' ', ' dans les cours.'],
    trous: [
      ['petite', 'petites'],
      ['fille', 'filles'],
      ['chante', 'chantent'],
      ['souvent', 'souvent'],
    ],
  },
  {
    singulier: 'Le chat noir saute toujours sur la chaise.',
    parts: ['Les ', ' ', ' ', ' ', ' sur les chaises.'],
    trous: [
      ['chat', 'chats'],
      ['noir', 'noirs'],
      ['saute', 'sautent'],
      ['toujours', 'toujours'],
    ],
  },
];

/** Phrases avec un seul mot invariable. */
export const UN_INVARIABLE: readonly {
  readonly texte: string;
  readonly mot: string;
  readonly autres: readonly string[];
}[] = [
  { texte: 'Mon petit frère joue souvent.', mot: 'souvent', autres: ['petit', 'joue', 'frère'] },
  { texte: 'Les grands arbres bougent beaucoup.', mot: 'beaucoup', autres: ['grands', 'bougent', 'arbres'] },
  { texte: 'Ces élèves restent toujours calmes.', mot: 'toujours', autres: ['Ces', 'restent', 'calmes'] },
  { texte: 'Ta cousine arrive demain.', mot: 'demain', autres: ['Ta', 'arrive', 'cousine'] },
  { texte: 'Nos voisines chantent avec joie.', mot: 'avec', autres: ['Nos', 'chantent', 'joie'] },
  { texte: 'Le vieux chien dort depuis midi.', mot: 'depuis', autres: ['vieux', 'dort', 'midi'] },
  { texte: 'Les filles marchent sans bruit.', mot: 'sans', autres: ['filles', 'marchent', 'bruit'] },
];

/** Lignes d'un petit texte : nombre de mots invariables (de la liste `INVARIABLES`). */
export const LIGNES_INVARIABLES: readonly { readonly texte: string; readonly n: number }[] = [
  { texte: 'Hier, mon frère jouait dans le jardin.', n: 2 },
  { texte: 'Les petites filles chantent.', n: 0 },
  { texte: 'Nous restons souvent chez mes voisins.', n: 2 },
  { texte: 'Le chien est très content.', n: 1 },
  { texte: 'Tu pars sans ton sac quand je sors.', n: 2 },
  { texte: 'La voisine arrose ses fleurs rouges.', n: 0 },
  { texte: 'Elle lit beaucoup, mais son frère dessine.', n: 2 },
  { texte: 'Les élèves sortent avec leurs amis.', n: 1 },
];
