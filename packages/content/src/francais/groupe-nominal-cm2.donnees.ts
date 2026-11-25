/**
 * Données du chapitre « Le groupe nominal enrichi » (CM2) : faits cités et banques de groupes écrits pour
 * l'exercice. Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

export const FAITS_GN_CM2: readonly Fait[] = [
  prog('expansion-programme', 'Aborder la notion d’expansion du nom : adjectif et/ou groupe nominal prépositionnel'),
  prog('complement-programme', 'Aborder la notion de complément du nom'),
  prog('epithete-attribut', 'Différencier épithète et attribut du sujet'),
  prog(
    'chaine',
    'Consolider la maîtrise de la chaîne d’accords dans le groupe nominal pour les cas les plus réguliers',
  ),
  gram('formule', 'La formule générale du groupe nominal est donc la suivante : GN = Dét + N (+ Exp)'),
  gram(
    'expansion',
    'Le terme « expansion » est donc un terme général de fonction, qui regroupe d’une manière indistincte la fonction épithète et la fonction complément du nom.',
  ),
  gram('facultative', 'facultatif, pouvant être ou bien un Adj épithète ou bien un GNP complément du nom'),
  gram('preposition', 'Elle introduit un groupe prépositionnel qui joue un rôle de complément.'),
  gram('gnp', 'Le groupe nominal prépositionnel (GNP) est un groupe nominal introduit par une préposition.'),
  gram('complement-gp', 'La fonction complément du nom est principalement exercée par un groupe prépositionnel (GP).'),
  gram(
    'relations',
    'la fonction épithète désigne la relation entre l’adjectif et le nom tandis que la fonction complément du nom désigne la relation entre le GNP et le nom dont il est complément',
  ),
  gram('sans-preposition', 'd’une manière non pas indirecte mais directe, c’est-à-dire sans préposition'),
  gram(
    'attribut',
    'dans le cas de l’attribut du sujet, le groupe verbal est constitué d’un verbe dit « attributif » (en premier lieu le verbe être)',
  ),
  gram('attributifs-rester', 'D’autres verbes attributifs ajoutent des nuances aspectuelles'),
  gram('attributifs-sembler', 'sembler, paraître, avoir l’air'),
  gram('accord-adjectif', 'Il s’accorde en genre et en nombre avec le nom auquel il se rapporte.'),
  gram('accord-determinant', 'Le déterminant s’accorde en genre et en nombre avec le nom.'),
];

export const faitGnCm2 = (id: string): Fait => {
  const x = FAITS_GN_CM2.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesGnCm2 = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitGnCm2(id).source)]),
];

// Aucun prénom dans les phrases.

// ───────────────────────── Groupes à expansions ─────────────────────────

/** Un groupe nominal sujet avec un adjectif (avant ou après le nom) et un groupe nominal prépositionnel. */
export interface GroupeEnrichi {
  readonly det: string;
  readonly avant?: string;
  readonly nom: string;
  readonly apres?: string;
  /** Complément du nom : préposition comprise. */
  readonly complement: string;
  readonly verbe: string;
}

const ge = (groupe: string, complement: string, verbe: string): GroupeEnrichi => {
  const [det = '', avant = '', nom = '', apres = ''] = groupe.split('|');
  return { det, nom, complement, verbe, ...(avant ? { avant } : {}), ...(apres ? { apres } : {}) };
};

export const GROUPES_ENRICHIS: readonly GroupeEnrichi[] = [
  ge('le|petit|chat|', 'de ma tante', 'dort'),
  ge('la||porte|verte', 'de la cabane', 'grince'),
  ge('un|grand|sapin|', 'du jardin', 'penche'),
  ge('le||chien|noir', 'du berger', 'aboie'),
  ge('une|vieille|malle|', 'en bois', 'reste ouverte'),
  ge('la||tasse|bleue', 'de mon père', 'fume'),
  ge('le|gros|ballon|', 'de mon cousin', 'rebondit'),
  ge('une||lampe|neuve', 'du salon', 'brille'),
  ge('la|jolie|robe|', 'de la poupée', 'sèche'),
  ge('un||sac|lourd', 'de pommes', 'tombe'),
];

export const adjectifGe = (g: GroupeEnrichi): string => g.avant ?? g.apres ?? '';

/** Écriture du groupe, avec ou sans chacune de ses expansions. */
export const texteGroupe = (g: GroupeEnrichi, adjectif = true, complement = true): string =>
  [g.det, adjectif ? g.avant : '', g.nom, adjectif ? g.apres : '', complement ? g.complement : '']
    .filter(Boolean)
    .join(' ');

export const phrase = (groupe: string, verbe: string): string =>
  `${groupe.charAt(0).toUpperCase()}${groupe.slice(1)} ${verbe}.`;

// ───────────────────────── Complément du nom et autres groupes ─────────────────────────

/**
 * Phrase qui commence par un groupe circonstanciel : un seul groupe complète le nom du sujet. `leurre` est un
 * groupe qui commence par une préposition mais ne complète pas ce nom.
 */
export interface PhraseComplement {
  readonly leurre: string;
  readonly det: string;
  readonly nom: string;
  readonly complement: string;
  readonly verbe: string;
}

const pc = (leurre: string, det: string, nom: string, complement: string, verbe: string): PhraseComplement => ({
  leurre,
  det,
  nom,
  complement,
  verbe,
});

export const PHRASES_COMPLEMENT: readonly PhraseComplement[] = [
  pc('Dans le jardin', 'la', 'porte', 'de la cabane', 'grince'),
  pc('Avant midi', 'le', 'chien', 'du voisin', 'aboie'),
  pc('Sur la table', 'la', 'tasse', 'de mon père', 'fume'),
  pc('Après la pluie', 'les', 'bottes', 'du jardinier', 'sèchent'),
  pc('Dans le grenier', 'une', 'malle', 'en bois', 'dort'),
  pc('Pendant la fête', 'la', 'voisine', 'de mon oncle', 'chante'),
  pc('Sous le lit', 'le', 'ballon', 'de mon cousin', 'se cache'),
  pc('Près du port', 'un', 'bateau', 'à voiles', 'attend'),
  pc('Depuis ce matin', 'la', 'cloche', 'de l’école', 'sonne'),
  pc('Au bord de la route', 'une', 'maison', 'en pierre', 'résiste'),
];

export const texteComplement = (p: PhraseComplement): string =>
  `${p.leurre}, ${p.det} ${p.nom} ${p.complement} ${p.verbe}.`;

// ───────────────────────── Épithète et attribut ─────────────────────────

/** Le même adjectif : épithète dans une phrase, attribut du sujet avec un verbe attributif. */
export interface Adjectif {
  readonly sujet: string;
  readonly nom: string;
  readonly adjectif: string;
  /** Verbe d'action de la phrase où l'adjectif est épithète. */
  readonly action: string;
}

const adj = (sujet: string, nom: string, adjectif: string, action: string): Adjectif => ({
  sujet,
  nom,
  adjectif,
  action,
});

export const ADJECTIFS: readonly Adjectif[] = [
  adj('Le lac', 'lac', 'calme', 'brille'),
  adj('Le chemin', 'chemin', 'étroit', 'monte'),
  adj('La soupe', 'soupe', 'chaude', 'fume'),
  adj('La mer', 'mer', 'agitée', 'gronde'),
  adj('Le linge', 'linge', 'humide', 'pend'),
  adj('La porte', 'porte', 'lourde', 'grince'),
  adj('Le chat', 'chat', 'paisible', 'ronronne'),
  adj('La tour', 'tour', 'solide', 'domine la ville'),
];

export const VERBES_ATTRIBUTIFS = ['est', 'semble', 'paraît', 'reste'] as const;

export const phraseEpithete = (a: Adjectif): string => `${a.sujet} ${a.adjectif} ${a.action}.`;
export const phraseAttribut = (a: Adjectif, verbe: string): string => `${a.sujet} ${verbe} ${a.adjectif}.`;

/** Deux adjectifs : une épithète dans le groupe sujet et un attribut du sujet après un verbe attributif. */
export interface DeuxAdjectifs {
  readonly texte: string;
  readonly nom: string;
  readonly epithete: string;
  readonly verbe: string;
  readonly attribut: string;
}

const deux = (
  det: string,
  [epithete, nom]: readonly [string, string],
  verbe: string,
  attribut: string,
): DeuxAdjectifs => ({ texte: `${det} ${epithete} ${nom} ${verbe} ${attribut}.`, nom, epithete, verbe, attribut });

/** Même construction, avec l'épithète placée après le nom. */
const deuxApres = (det: string, [nom, epithete]: readonly [string, string], verbe: string, attribut: string) => ({
  ...deux(det, [nom, epithete], verbe, attribut),
  nom,
  epithete,
});

export const DEUX_ADJECTIFS: readonly DeuxAdjectifs[] = [
  deux('La', ['petite', 'fille'], 'semble', 'fière'),
  deuxApres('Le', ['chien', 'noir'], 'paraît', 'inquiet'),
  deux('Le', ['vieux', 'marin'], 'reste', 'silencieux'),
  deuxApres('La', ['rivière', 'profonde'], 'devient', 'dangereuse'),
  deux('Ce', ['gros', 'gâteau'], 'est', 'délicieux'),
  deuxApres('La', ['robe', 'neuve'], 'paraît', 'élégante'),
  deux('Le', ['grand', 'sapin'], 'devient', 'sombre'),
  deux('La', ['jeune', 'élève'], 'reste', 'attentive'),
];

/** Épithète placée après le verbe, dans le groupe nominal qui complète ce verbe. */
export interface EpitheteApresVerbe {
  readonly texte: string;
  readonly nom: string;
  readonly adjectif: string;
  readonly verbe: string;
}

const apresVerbe = (sujet: string, verbe: string, det: string, nom: string, adjectif: string): EpitheteApresVerbe => ({
  texte: `${sujet} ${verbe} ${det} ${nom} ${adjectif}.`,
  nom,
  adjectif,
  verbe,
});

export const EPITHETES_APRES_VERBE: readonly EpitheteApresVerbe[] = [
  apresVerbe('Mon frère', 'porte', 'un', 'pull', 'rouge'),
  apresVerbe('La bergère', 'suit', 'un', 'sentier', 'pierreux'),
  apresVerbe('Le facteur', 'ouvre', 'une', 'barrière', 'rouillée'),
  apresVerbe('Ma tante', 'prépare', 'une', 'tarte', 'sucrée'),
  apresVerbe('Le peintre', 'choisit', 'un', 'pinceau', 'fin'),
  apresVerbe('La classe', 'regarde', 'un', 'film', 'amusant'),
];

// ───────────────────────── Chaîne d'accord ─────────────────────────

export type Genre = 'm' | 'f';
export type Nombre = 'sg' | 'pl';

/** Groupe à accorder : nom régulier, un adjectif avant, un après, tous deux réguliers (e, s). */
export interface Accord {
  readonly nom: string;
  readonly genre: Genre;
  /** Formes de base (masculin singulier) des adjectifs. */
  readonly avant: string;
  readonly apres: string;
  readonly complement: string;
  /** Genre et nombre du nom placé dans le complément. */
  readonly nomComplement: { readonly nom: string; readonly genre: Genre; readonly nombre: Nombre };
  readonly verbe: readonly [string, string];
}

const ac = (
  nom: string,
  genre: Genre,
  [avant, apres]: readonly [string, string],
  [complement, nomC, genreC, nombreC]: readonly [string, string, Genre, Nombre],
  verbe: readonly [string, string],
): Accord => ({
  nom,
  genre,
  avant,
  apres,
  complement,
  nomComplement: { nom: nomC, genre: genreC, nombre: nombreC },
  verbe,
});

export const ACCORDS_GN: readonly Accord[] = [
  ac('porte', 'f', ['petit', 'vert'], ['du chalet', 'chalet', 'm', 'sg'], ['grince', 'grincent']),
  ac('roue', 'f', ['petit', 'noir'], ['du vélo', 'vélo', 'm', 'sg'], ['tourne', 'tournent']),
  ac('clé', 'f', ['petit', 'doré'], ['du coffre', 'coffre', 'm', 'sg'], ['brille', 'brillent']),
  ac('sac', 'm', ['grand', 'bleu'], ['de ma cousine', 'cousine', 'f', 'sg'], ['attend', 'attendent']),
  ac('toit', 'm', ['grand', 'pointu'], ['de la maison', 'maison', 'f', 'sg'], ['dépasse', 'dépassent']),
  ac('fenêtre', 'f', ['joli', 'rond'], ['du grenier', 'grenier', 'm', 'sg'], ['claque', 'claquent']),
  ac('volet', 'm', ['grand', 'vert'], ['de la ferme', 'ferme', 'f', 'sg'], ['bat', 'battent']),
  ac('botte', 'f', ['grand', 'noir'], ['du jardinier', 'jardinier', 'm', 'sg'], ['sèche', 'sèchent']),
  ac('maillot', 'm', ['joli', 'bleu'], ['des joueuses', 'joueuses', 'f', 'pl'], ['sèche', 'sèchent']),
  ac('dessin', 'm', ['joli', 'coloré'], ['de mes sœurs', 'sœurs', 'f', 'pl'], ['plaît', 'plaisent']),
  ac('lanterne', 'f', ['petit', 'rond'], ['des marins', 'marins', 'm', 'pl'], ['éclaire', 'éclairent']),
];

/** Accord régulier : e au féminin, s au pluriel. */
export const accorder = (base: string, genre: Genre, nombre: Nombre): string =>
  `${base}${genre === 'f' ? 'e' : ''}${nombre === 'pl' ? 's' : ''}`;

export const nomAu = (a: Accord, nombre: Nombre): string => `${a.nom}${nombre === 'pl' ? 's' : ''}`;

export const determinant = (genre: Genre, nombre: Nombre): string =>
  nombre === 'pl' ? 'les' : genre === 'm' ? 'le' : 'la';
