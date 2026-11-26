/**
 * Données du chapitre « Pronoms et groupe nominal » (6e) : faits cités et banques de phrases écrites
 * pour l'exercice (aucun prénom). Chaque fait porte l'identifiant de sa source (registre `sources.ts`)
 * et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

export const FAITS_PRONOMS_GN_6E: readonly Fait[] = [
  prog('pronom-fonction-programme', 'Identifier aisément les pronoms personnels et préciser leur fonction'),
  prog('antecedent-programme', 'Mettre en relation un pronom personnel avec son antécédent'),
  prog('gn-programme', 'Identifier le groupe nominal, quelle que soit sa fonction dans la phrase'),
  prog(
    'expansions-programme',
    'Identifier et différencier sans ambigüité adjectif/groupe adjectival de fonction épithète et groupe nominal prépositionnel de fonction complément du nom',
  ),
  gram(
    'pronom-formes',
    'Ce type de pronom comporte de nombreuses formes qui varient selon la personne, le genre, le nombre et la fonction.',
  ),
  gram('pronoms-sujets', 'pronoms personnels de fonction sujet : je, tu, il(s)'),
  gram('nous-vous', 'pronoms personnels de fonction sujet ou complément (direct ou indirect) : nous, vous'),
  gram('me-te', 'pronoms personnels de fonction complément d’objet (direct ou indirect) : me, te, se'),
  gram('pronoms-cod', 'pronoms personnels de fonction complément d’objet direct : le, la, les'),
  gram('pronoms-coi', 'pronoms personnels de fonction complément d’objet indirect : lui'),
  gram('antecedent', 'substitut d’un groupe nominal (GN), qui est nommé « antécédent » du pronom personnel'),
  gram('tient-lieu', 'considérer que le pronom tient lieu d’un GN'),
  gram('gn-noyau', 'Le groupe nominal (GN) est un groupe syntaxique dont le noyau est un nom (N).'),
  gram('gn-formule', 'La formule générale du GN est donc la suivante : GN = Dét + N (+ Exp)'),
  gram(
    'gn-sujet',
    'il est l’équivalent syntaxique d’un groupe nominal (GN) et peut être remplacé par il, elle ou cela',
  ),
  gram('gn-cod', 'GN COD : Le facteur distribue le courrier'),
  gram('gn-attribut', 'La fonction attribut du sujet peut être assurée par un GN ou par un adjectif'),
  gram(
    'gn-circonstanciel',
    'La fonction complément circonstanciel peut être assurée par des groupes prépositionnels (GP), par des groupes nominaux (GN), par des adverbes ou par des propositions subordonnées.',
  ),
  gram('gnp', 'Le groupe nominal prépositionnel (GNP) est un groupe nominal introduit par une préposition.'),
  gram(
    'expansion',
    'L’expression « expansion du nom » permet de regrouper sous un même terme les fonctions épithète et complément du nom',
  ),
  gram(
    'epithete-directe',
    'elle relie un constituant (adjectival ou nominal) au nom d’une manière non pas indirecte mais directe, c’est-à-dire sans préposition',
  ),
  gram('groupe-adjectival', 'On parlera donc d’« adjectif épithète » (ou « groupe adjectival épithète »)'),
  gram('cdn-gp', 'La fonction complément du nom est principalement exercée par un groupe prépositionnel (GP).'),
  gram(
    'cdn-indirecte',
    'la fonction complément du nom est une relation indirecte, passant par la préposition de, entre le nom avocate et le nom talent',
  ),
  gram('adjectif-accord', 'Il s’accorde en genre et en nombre avec le nom auquel il se rapporte.'),
];

export const faitPronomsGn6e = (id: string): Fait => {
  const x = FAITS_PRONOMS_GN_6E.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesPronomsGn6e = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitPronomsGn6e(id).source)]),
];

// ───────────────────────── 1. Le pronom personnel et sa fonction ─────────────────────────

export type FonctionPronom = 'sujet' | 'complément d’objet direct' | 'complément d’objet indirect';
const S: FonctionPronom = 'sujet';
const D: FonctionPronom = 'complément d’objet direct';
const I: FonctionPronom = 'complément d’objet indirect';

/** Phrase avec un seul pronom personnel. `nom` : un nom de la phrase. */
export interface PronomPhrase {
  readonly phrase: string;
  readonly pronom: string;
  readonly fonction: FonctionPronom;
  readonly verbe: string;
  readonly nom: string;
  /** Manipulation qui prouve la fonction. */
  readonly preuve: string;
}

const sujet = (phrase: string, pronom: string, verbe: string, nom: string): PronomPhrase => ({
  phrase,
  pronom,
  fonction: S,
  verbe,
  nom,
  preuve: `« ${pronom} » commande l’accord du verbe « ${verbe} ».`,
});
const objet = (
  fonction: FonctionPronom,
  phrase: string,
  [pronom, verbe]: readonly [string, string],
  nom: string,
  construction: string,
): PronomPhrase => ({
  phrase,
  pronom,
  fonction,
  verbe,
  nom,
  preuve: `On dit « ${construction} » : le complément se construit ${fonction === D ? 'sans préposition' : 'avec la préposition « à »'}.`,
});

export const SUJETS_PRONOMS: readonly PronomPhrase[] = [
  sujet('Nous observons les étoiles.', 'Nous', 'observons', 'étoiles'),
  sujet('Vous préparez le voyage.', 'Vous', 'préparez', 'voyage'),
  sujet('Elles traversent la forêt.', 'Elles', 'traversent', 'forêt'),
  sujet('Il répare la barque.', 'Il', 'répare', 'barque'),
  sujet('Tu relis le poème.', 'Tu', 'relis', 'poème'),
  sujet('Ils attendent la marée.', 'Ils', 'attendent', 'marée'),
  sujet('Je classe les fossiles.', 'Je', 'classe', 'fossiles'),
  sujet('Elle dessine la carte.', 'Elle', 'dessine', 'carte'),
];

export const OBJETS_PRONOMS: readonly PronomPhrase[] = [
  objet(D, 'Le gardien nous surveille.', ['nous', 'surveille'], 'gardien', 'surveiller quelqu’un'),
  objet(D, 'La guide vous accompagne.', ['vous', 'accompagne'], 'guide', 'accompagner quelqu’un'),
  objet(D, 'Ce vacarme me réveille.', ['me', 'réveille'], 'vacarme', 'réveiller quelqu’un'),
  objet(D, 'La foule te regarde.', ['te', 'regarde'], 'foule', 'regarder quelqu’un'),
  objet(D, 'Les voisins les saluent.', ['les', 'saluent'], 'voisins', 'saluer quelqu’un'),
  objet(D, 'Le marin la répare.', ['la', 'répare'], 'marin', 'réparer quelque chose'),
  objet(D, 'Les élèves le consultent.', ['le', 'consultent'], 'élèves', 'consulter quelque chose'),
  objet(I, 'La bibliothécaire nous parle.', ['nous', 'parle'], 'bibliothécaire', 'parler à quelqu’un'),
  objet(I, 'Le maire leur répond.', ['leur', 'répond'], 'maire', 'répondre à quelqu’un'),
  objet(I, 'Le mousse lui obéit.', ['lui', 'obéit'], 'mousse', 'obéir à quelqu’un'),
  objet(I, 'Ce paysage me plaît.', ['me', 'plaît'], 'paysage', 'plaire à quelqu’un'),
  objet(I, 'La directrice vous téléphone.', ['vous', 'téléphone'], 'directrice', 'téléphoner à quelqu’un'),
  objet(I, 'Le facteur te sourit.', ['te', 'sourit'], 'facteur', 'sourire à quelqu’un'),
];

/** Groupe nominal à remplacer par un pronom. */
export interface Remplacement {
  readonly phrase: string;
  readonly groupe: string;
  /** Phrase réécrite, le pronom étant remplacé par « … ». */
  readonly trou: string;
  readonly pronom: string;
  readonly fonction: FonctionPronom;
  readonly accord: string;
}

const rem = (
  fonction: FonctionPronom,
  [phrase, trou]: readonly [string, string],
  [groupe, pronom]: readonly [string, string],
  accord: string,
): Remplacement => ({ phrase, trou, groupe, pronom, fonction, accord });

export const REMPLACEMENTS: readonly Remplacement[] = [
  rem(S, ['La gardienne ferme les grilles.', '… ferme les grilles.'], ['La gardienne', 'Elle'], 'féminin singulier'),
  rem(S, ['Les marins hissent la voile.', '… hissent la voile.'], ['Les marins', 'Ils'], 'masculin pluriel'),
  rem(S, ['Le volcan gronde depuis hier.', '… gronde depuis hier.'], ['Le volcan', 'Il'], 'masculin singulier'),
  rem(S, ['Les cigognes bâtissent un nid.', '… bâtissent un nid.'], ['Les cigognes', 'Elles'], 'féminin pluriel'),
  rem(D, ['Le jardinier taille les rosiers.', 'Le jardinier … taille.'], ['les rosiers', 'les'], 'pluriel'),
  rem(D, ['La classe prépare le spectacle.', 'La classe … prépare.'], ['le spectacle', 'le'], 'masculin singulier'),
  rem(D, ['Le mousse nettoie la cale.', 'Le mousse … nettoie.'], ['la cale', 'la'], 'féminin singulier'),
  rem(I, ['Le maire répond aux habitants.', 'Le maire … répond.'], ['aux habitants', 'leur'], 'pluriel'),
  rem(I, ['Le chiot obéit à sa maîtresse.', 'Le chiot … obéit.'], ['à sa maîtresse', 'lui'], 'singulier'),
  rem(I, ['La nièce écrit à son oncle.', 'La nièce … écrit.'], ['à son oncle', 'lui'], 'singulier'),
  rem(I, ['Le guide parle aux visiteuses.', 'Le guide … parle.'], ['aux visiteuses', 'leur'], 'pluriel'),
];

/** Phrase avec un pronom sujet et un pronom complément. */
export interface DeuxFonctions {
  readonly phrase: string;
  readonly sujet: string;
  readonly complement: string;
  readonly fonction: Exclude<FonctionPronom, 'sujet'>;
  readonly construction: string;
}

const deux = (
  phrase: string,
  [sujetP, complement]: readonly [string, string],
  fonction: DeuxFonctions['fonction'],
  construction: string,
): DeuxFonctions => ({ phrase, sujet: sujetP, complement, fonction, construction });

export const DEUX_FONCTIONS: readonly DeuxFonctions[] = [
  deux('Nous leur écrivons.', ['Nous', 'leur'], I, 'écrire à quelqu’un'),
  deux('Vous nous attendez.', ['Vous', 'nous'], D, 'attendre quelqu’un'),
  deux('Elle nous téléphone.', ['Elle', 'nous'], I, 'téléphoner à quelqu’un'),
  deux('Ils vous remercient.', ['Ils', 'vous'], D, 'remercier quelqu’un'),
  deux('Tu me réponds.', ['Tu', 'me'], I, 'répondre à quelqu’un'),
  deux('Je te reconnais.', ['Je', 'te'], D, 'reconnaître quelqu’un'),
  deux('Elles lui sourient.', ['Elles', 'lui'], I, 'sourire à quelqu’un'),
  deux('Il nous observe.', ['Il', 'nous'], D, 'observer quelqu’un'),
  deux('Nous vous obéissons.', ['Nous', 'vous'], I, 'obéir à quelqu’un'),
];

// ───────────────────────── 2. Le pronom et son antécédent ─────────────────────────

export type PronomSujet3 = 'Il' | 'Elle' | 'Ils' | 'Elles';

export const MARQUES: Readonly<Record<PronomSujet3, string>> = {
  Il: 'masculin singulier',
  Elle: 'féminin singulier',
  Ils: 'masculin pluriel',
  Elles: 'féminin pluriel',
};

/** Deux phrases : le pronom de la seconde reprend un groupe nominal de la première. */
export interface Reprise {
  readonly premiere: string;
  readonly pronom: PronomSujet3;
  readonly suite: string;
  readonly antecedent: string;
  /** Autre groupe nominal de la première phrase, d'un autre genre ou d'un autre nombre. */
  readonly autre: string;
  readonly verbe: string;
}

const reprise = (
  premiere: string,
  [pronom, suite]: readonly [PronomSujet3, string],
  [antecedent, autre]: readonly [string, string],
  verbe: string,
): Reprise => ({ premiere, pronom, suite, antecedent, autre, verbe });

export const REPRISES: readonly Reprise[] = [
  reprise('Les marins repèrent une île.', ['Elle', 'paraît déserte.'], ['une île', 'Les marins'], 'repèrent'),
  reprise('La voyageuse ouvre son carnet.', ['Il', 'contient des croquis.'], ['son carnet', 'La voyageuse'], 'ouvre'),
  reprise(
    'Le jardinier taille les rosiers.',
    ['Ils', 'fleuriront au printemps.'],
    ['les rosiers', 'Le jardinier'],
    'taille',
  ),
  reprise('La bergère appelle ses chiens.', ['Ils', 'reviennent aussitôt.'], ['ses chiens', 'La bergère'], 'appelle'),
  reprise('Le pêcheur examine ses voiles.', ['Elles', 'sont déchirées.'], ['ses voiles', 'Le pêcheur'], 'examine'),
  reprise(
    'Cette ville possède un vieux port.',
    ['Il', 'attire de nombreux bateaux.'],
    ['un vieux port', 'Cette ville'],
    'possède',
  ),
  reprise(
    'Les chercheurs étudient une météorite.',
    ['Elle', 'vient de l’espace.'],
    ['une météorite', 'Les chercheurs'],
    'étudient',
  ),
  reprise(
    'Le conteur décrit des géantes.',
    ['Elles', 'vivent sous la montagne.'],
    ['des géantes', 'Le conteur'],
    'décrit',
  ),
  reprise('Le comédien porte une cape.', ['Elle', 'traîne sur le plancher.'], ['une cape', 'Le comédien'], 'porte'),
  reprise('Les élèves visitent un phare.', ['Il', 'domine toute la côte.'], ['un phare', 'Les élèves'], 'visitent'),
];

/** Pronom et antécédent à retrouver. */
export interface Lien {
  readonly pronom: string;
  readonly antecedent: string;
}

/** Deux phrases : la seconde contient un pronom sujet et un pronom complément. */
export interface DoubleReprise {
  readonly premiere: string;
  readonly seconde: string;
  readonly sujet: Lien;
  readonly complement: Lien;
}

const dr = (
  [premiere, seconde]: readonly [string, string],
  [ps, as]: readonly [string, string],
  [pc, ac]: readonly [string, string],
): DoubleReprise => ({
  premiere,
  seconde,
  sujet: { pronom: ps, antecedent: as },
  complement: { pronom: pc, antecedent: ac },
});

export const DOUBLES_REPRISES: readonly DoubleReprise[] = [
  dr(['Le savant observe les planètes.', 'Il les dessine chaque nuit.'], ['Il', 'Le savant'], ['les', 'les planètes']),
  dr(['La reine reçoit un messager.', 'Elle l’écoute longuement.'], ['Elle', 'La reine'], ['l’', 'un messager']),
  dr(
    ['La maire rencontre les commerçants.', 'Elle leur présente le projet.'],
    ['Elle', 'La maire'],
    ['leur', 'les commerçants'],
  ),
  dr(['Les bergers retrouvent la brebis.', 'Ils la ramènent au village.'], ['Ils', 'Les bergers'], ['la', 'la brebis']),
  dr(['Le mousse salue les passagères.', 'Il leur montre le pont.'], ['Il', 'Le mousse'], ['leur', 'les passagères']),
  dr(
    ['Les voisines aident le vieux fermier.', 'Elles lui apportent des outils.'],
    ['Elles', 'Les voisines'],
    ['lui', 'le vieux fermier'],
  ),
];

/** Court récit : pronom complément en ligne 2, pronom sujet et pronom complément en ligne 4. */
export interface Recit {
  readonly titre: string;
  readonly lignes: readonly [string, string, string, string];
  readonly milieu: Lien & { readonly fonction: Exclude<FonctionPronom, 'sujet'> };
  readonly sujet: Lien;
  readonly complement: Lien;
}

export const RECITS: readonly Recit[] = [
  {
    titre: 'À bord',
    lignes: [
      'La capitaine consulte les cartes.',
      'Elle les compare avec son journal.',
      'Un matelot apporte une lanterne.',
      'Il la pose près du gouvernail.',
    ],
    milieu: { pronom: 'les', antecedent: 'les cartes', fonction: D },
    sujet: { pronom: 'Il', antecedent: 'Un matelot' },
    complement: { pronom: 'la', antecedent: 'une lanterne' },
  },
  {
    titre: 'La veillée',
    lignes: [
      'Le conteur réunit les enfants.',
      'Il leur raconte un mythe.',
      'Une fillette allume une torche.',
      'Elle la tient près du mur.',
    ],
    milieu: { pronom: 'leur', antecedent: 'les enfants', fonction: I },
    sujet: { pronom: 'Elle', antecedent: 'Une fillette' },
    complement: { pronom: 'la', antecedent: 'une torche' },
  },
  {
    titre: 'L’herbier',
    lignes: [
      'La botaniste cueille des fougères.',
      'Elle les range dans une boîte.',
      'Son assistant dessine un insecte.',
      'Il le colorie avec soin.',
    ],
    milieu: { pronom: 'les', antecedent: 'des fougères', fonction: D },
    sujet: { pronom: 'Il', antecedent: 'Son assistant' },
    complement: { pronom: 'le', antecedent: 'un insecte' },
  },
  {
    titre: 'Au château',
    lignes: [
      'La gardienne accueille les visiteurs.',
      'Elle leur ouvre la grande salle.',
      'Un peintre observe une armure.',
      'Il la reproduit sur sa toile.',
    ],
    milieu: { pronom: 'leur', antecedent: 'les visiteurs', fonction: I },
    sujet: { pronom: 'Il', antecedent: 'Un peintre' },
    complement: { pronom: 'la', antecedent: 'une armure' },
  },
];

// ───────────────────────── 3. Le groupe nominal ─────────────────────────

export type FonctionGn = 'sujet' | 'complément d’objet direct' | 'attribut du sujet' | 'complément circonstanciel';

/** Groupe nominal employé sans préposition. */
export interface GroupeNom {
  readonly phrase: string;
  readonly gn: string;
  readonly noyau: string;
  readonly fonction: FonctionGn;
  readonly verbe: string;
  /** Suite de mots qui ne forme pas un groupe (à cheval sur deux groupes). */
  readonly coupe: string;
  /** Trois mots de la phrase qui ne sont pas le noyau. */
  readonly autres: readonly [string, string, string];
}

const gn = (
  fonction: FonctionGn,
  phrase: string,
  [groupe, noyau]: readonly [string, string],
  [verbe, coupe]: readonly [string, string],
  autres: GroupeNom['autres'],
): GroupeNom => ({ fonction, phrase, gn: groupe, noyau, verbe, coupe, autres });

export const GROUPES_NOMINAUX: readonly GroupeNom[] = [
  gn(
    'sujet',
    'La vieille horloge du salon sonne midi.',
    ['La vieille horloge du salon', 'horloge'],
    ['sonne', 'du salon sonne'],
    ['vieille', 'salon', 'La'],
  ),
  gn(
    'sujet',
    'Les sentiers escarpés de la vallée montent vers le col.',
    ['Les sentiers escarpés de la vallée', 'sentiers'],
    ['montent', 'la vallée montent'],
    ['escarpés', 'vallée', 'Les'],
  ),
  gn(
    'complément d’objet direct',
    'Le libraire expose un magnifique atlas ancien.',
    ['un magnifique atlas ancien', 'atlas'],
    ['expose', 'libraire expose un'],
    ['magnifique', 'ancien', 'libraire'],
  ),
  gn(
    'complément d’objet direct',
    'Les élèves étudient les volcans endormis d’Auvergne.',
    ['les volcans endormis d’Auvergne', 'volcans'],
    ['étudient', 'élèves étudient les'],
    ['endormis', 'Auvergne', 'élèves'],
  ),
  gn(
    'attribut du sujet',
    'Cet inconnu est un célèbre navigateur portugais.',
    ['un célèbre navigateur portugais', 'navigateur'],
    ['est', 'inconnu est un'],
    ['célèbre', 'portugais', 'inconnu'],
  ),
  gn(
    'attribut du sujet',
    'La baleine reste un animal très mystérieux.',
    ['un animal très mystérieux', 'animal'],
    ['reste', 'baleine reste un'],
    ['mystérieux', 'très', 'baleine'],
  ),
  gn(
    'complément circonstanciel',
    'La troupe répète sa pièce chaque mercredi après-midi.',
    ['chaque mercredi après-midi', 'mercredi'],
    ['répète', 'troupe répète sa'],
    ['après-midi', 'chaque', 'troupe'],
  ),
  gn(
    'complément circonstanciel',
    'Le boulanger allume son four le matin du marché.',
    ['le matin du marché', 'matin'],
    ['allume', 'boulanger allume son'],
    ['marché', 'le', 'four'],
  ),
];

/** Groupe nominal introduit par une préposition. */
export interface GroupePrep {
  readonly phrase: string;
  readonly prep: string;
  readonly gn: string;
  readonly noyau: string;
  readonly fonction: 'complément d’objet indirect' | 'complément circonstanciel';
}

const gp = (
  fonction: GroupePrep['fonction'],
  phrase: string,
  [prep, groupe, noyau]: readonly [string, string, string],
): GroupePrep => ({ fonction, phrase, prep, gn: groupe, noyau });

export const GROUPES_PREPOSITIONNELS: readonly GroupePrep[] = [
  gp('complément d’objet indirect', 'Le chiot obéit à son nouveau maître.', ['à', 'son nouveau maître', 'maître']),
  gp('complément d’objet indirect', 'Les marins rêvent de leur île natale.', ['de', 'leur île natale', 'île']),
  gp('complément d’objet indirect', 'La récolte dépend de la météo estivale.', ['de', 'la météo estivale', 'météo']),
  gp('complément d’objet indirect', 'Ce chaton ressemble à un petit tigre.', ['à', 'un petit tigre', 'tigre']),
  gp('complément circonstanciel', 'Un héron dort sur la berge boueuse.', ['sur', 'la berge boueuse', 'berge']),
  gp('complément circonstanciel', 'Le renard se cache sous une souche creuse.', [
    'sous',
    'une souche creuse',
    'souche',
  ]),
  gp('complément circonstanciel', 'Les cavaliers partent avant le premier orage.', [
    'avant',
    'le premier orage',
    'orage',
  ]),
  gp('complément circonstanciel', 'La fête continue malgré une pluie battante.', [
    'malgré',
    'une pluie battante',
    'pluie',
  ]),
];

// ───────────────────────── 4. Épithète ou complément du nom ─────────────────────────

export type Expansion = 'épithète' | 'complément du nom';

/** Groupe nominal avec une seule expansion. */
export interface AvecExpansion {
  readonly avant: string;
  readonly gn: string;
  readonly noyau: string;
  readonly expansion: string;
}

const exp = (avant: string, groupe: string, noyau: string, expansion: string): AvecExpansion => ({
  avant,
  gn: groupe,
  noyau,
  expansion,
});

export const EPITHETES: readonly AvecExpansion[] = [
  exp('Les randonneurs longent', 'une vallée profonde', 'vallée', 'profonde'),
  exp('La classe découvre', 'un récit passionnant', 'récit', 'passionnant'),
  exp('Le navire contourne', 'de hautes falaises', 'falaises', 'hautes'),
  exp('Le passeur détache', 'une très vieille barque', 'barque', 'très vieille'),
  exp('Les pilotes redoutent', 'ce ciel orageux', 'ciel', 'orageux'),
  exp('Les maçons restaurent', 'des remparts imposants', 'remparts', 'imposants'),
  exp('Le professeur quitte', 'une salle extrêmement bruyante', 'salle', 'extrêmement bruyante'),
  exp('L’explorateur franchit', 'un étroit passage', 'passage', 'étroit'),
  exp('Le héros affronte', 'un monstre vraiment effrayant', 'monstre', 'vraiment effrayant'),
];

export const COMPLEMENTS_DU_NOM: readonly AvecExpansion[] = [
  exp('Le passeur détache', 'une barque de pêcheur', 'barque', 'de pêcheur'),
  exp('L’antiquaire ouvre', 'un coffre en bois', 'coffre', 'en bois'),
  exp('La famille organise', 'une promenade en forêt', 'promenade', 'en forêt'),
  exp('Les voyageurs cherchent', 'la gare de la ville', 'gare', 'de la ville'),
  exp('La cuisinière remplit', 'une tasse à fleurs', 'tasse', 'à fleurs'),
  exp('Le jeune acteur enfile', 'un costume sans manches', 'costume', 'sans manches'),
  exp('L’archiviste déchiffre', 'le journal d’un explorateur', 'journal', 'd’un explorateur'),
  exp('La romancière prépare', 'son départ pour l’Écosse', 'départ', 'pour l’Écosse'),
  exp('Les archéologues dégagent', 'les ruines d’un temple', 'ruines', 'd’un temple'),
];

/** Groupe nominal avec une épithète et un complément du nom. */
export interface Complet {
  readonly gn: string;
  readonly noyau: string;
  readonly epithete: string;
  readonly complement: string;
}

const complet = (groupe: string, noyau: string, epithete: string, complement: string): Complet => ({
  gn: groupe,
  noyau,
  epithete,
  complement,
});

export const COMPLETS: readonly Complet[] = [
  complet('une longue promenade en forêt', 'promenade', 'longue', 'en forêt'),
  complet('un vieux coffre en bois', 'coffre', 'vieux', 'en bois'),
  complet('la petite gare de la ville', 'gare', 'petite', 'de la ville'),
  complet('un étrange billet sans signature', 'billet', 'étrange', 'sans signature'),
  complet('de grands vases en cristal', 'vases', 'grands', 'en cristal'),
  complet('un manteau de laine très épais', 'manteau', 'très épais', 'de laine'),
  complet('une barque de pêcheur toute neuve', 'barque', 'toute neuve', 'de pêcheur'),
  complet('une histoire de voyage captivante', 'histoire', 'captivante', 'de voyage'),
];
