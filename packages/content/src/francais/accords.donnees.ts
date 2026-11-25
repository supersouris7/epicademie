/**
 * Données du chapitre « Les accords » (CM1) : faits cités et banques de mots et de phrases écrites pour l'exercice.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

const REGLES: readonly Fait[] = [
  prog(
    'variations',
    'Identifier, classer et repérer les critères de variations (genre, nombre, personne, temps) au sein des différentes classes grammaticales : déterminant, nom, adjectif, pronom personnel, verbe',
  ),
  prog(
    'regulieres',
    'Consolider la connaissance et la maîtrise des variations les plus régulières en genre et nombre des noms, des adjectifs, des déterminants',
  ),
  prog(
    'pluriels',
    'La connaissance et l’utilisation des pluriels irréguliers (-x ; -al/aux), introduits au cycle 2, sont stabilisées et complétées en fin de cycle 3',
  ),
  prog('marques-feminin', 'La connaissance et l’utilisation des marques du féminin sont consolidées'),
  prog('donneur', 'Repérer le donneur d’accord du groupe nominal : le nom noyau'),
  prog(
    'transformer',
    'Transformer le genre et le nombre de groupes nominaux simples isolés puis inscrits dans des phrases simples, en effectuant toutes les variations nécessaires',
  ),
  prog('sujet-noyau', 'Repérer le sujet du verbe : notamment le nom noyau dans le cas d’un groupe nominal'),
  prog('participe-etre', 'Accorder le participe passé avec le sujet dans le cas de l’emploi avec l’auxiliaire être'),
  gram('genres', 'Ils se répartissent par ailleurs en deux genres : masculin et féminin.'),
  gram('accord-adjectif', 'Il s’accorde en genre et en nombre avec le nom auquel il se rapporte.'),
  gram('accord-determinant', 'Le déterminant s’accorde en genre et en nombre avec le nom.'),
  gram('accord-verbe', 'Le groupe sujet (GS) règle l’accord du verbe'),
  gram('marque-ent', '-ent marque de troisième personne du pluriel dans chantaient'),
  gram('temps-composes', 'le participe est utilisé pour former les formes composées des temps du verbe'),
  {
    id: 'marque-s',
    source: 'academie-pluriel',
    citation: 'En français le « s » final est la marque ordinaire du pluriel des noms.',
  },
  {
    id: 'serie-ou',
    source: 'academie-pluriel',
    citation:
      'Les mots de la série « bijou, caillou, chou, genou, hibou, joujou et pou » prennent un « x » au pluriel.',
  },
  {
    id: 'terminaisons-feminin',
    source: 'academie-feminin',
    citation:
      'Dans « amante », « diablesse », « bienfaitrice », « e », « esse », « trice » sont des terminaisons féminines.',
  },
];

// ───────────────────────── Pluriel des noms ─────────────────────────

export type TypePluriel = 's' | 'x' | 'aux' | 'als';

export interface Pluriel {
  readonly s: string;
  readonly p: string;
  readonly type: TypePluriel;
  readonly fait: string;
}

/** Pluriel ordinaire en s : la règle suffit. */
const enS = (s: string): Pluriel => ({ s, p: `${s}s`, type: 's', fait: 'marque-s' });

export const PLURIELS_S: readonly Pluriel[] = [
  'lapin',
  'ballon',
  'cahier',
  'stylo',
  'livre',
  'jardin',
  'nuage',
  'sac',
  'chien',
  'robot',
].map(enS);

/** Noms en -ou qui ne sont pas dans la série : pluriel en s. */
export const PLURIELS_OU_S: readonly Pluriel[] = ['clou', 'trou'].map(enS);

const FAITS_PLURIELS: Fait[] = [];

/** Un pluriel attesté par l'article du mot dans le dictionnaire de l'Académie française. */
const atteste = (s: string, p: string, type: TypePluriel, source: string, citation: string): Pluriel => {
  const id = `pluriel-${source}`;
  FAITS_PLURIELS.push({ id, source: `academie-${source}`, citation });
  return { s, p, type, fait: id };
};

const serie = (s: string): Pluriel => ({ s, p: `${s}x`, type: 'x', fait: 'serie-ou' });

export const PLURIELS_OU_X: readonly Pluriel[] = ['bijou', 'caillou', 'chou', 'genou', 'hibou', 'joujou', 'pou'].map(
  serie,
);

export const PLURIELS_EAU: readonly Pluriel[] = [
  atteste('bateau', 'bateaux', 'x', 'bateau', 'Les bateaux à aubes du Mississippi.'),
  atteste('cadeau', 'cadeaux', 'x', 'cadeau', 'Combler, couvrir quelqu’un de cadeaux.'),
  atteste('oiseau', 'oiseaux', 'x', 'oiseau', 'Oiseaux migrateurs.'),
  atteste('château', 'châteaux', 'x', 'chateau', 'Des châteaux forts.'),
  atteste('drapeau', 'drapeaux', 'x', 'drapeau', 'Une ville pavoisée de drapeaux.'),
  atteste('bureau', 'bureaux', 'x', 'bureau', 'Les bureaux de ce ministère'),
  atteste('cheveu', 'cheveux', 'x', 'cheveu', 'Porter les cheveux courts, les cheveux longs.'),
  atteste('jeu', 'jeux', 'x', 'jeu', 'Les jeux de l’enfance.'),
];

export const PLURIELS_AUX: readonly Pluriel[] = [
  atteste('cheval', 'chevaux', 'aux', 'cheval', '(pluriel Chevaux)'),
  atteste('journal', 'journaux', 'aux', 'journal', '(pluriel Journaux)'),
  atteste('animal', 'animaux', 'aux', 'animal', '(pluriel Animaux, animales)'),
  atteste('bocal', 'bocaux', 'aux', 'bocal', '(pluriel Bocaux)'),
  atteste('canal', 'canaux', 'aux', 'canal', '(pluriel Canaux)'),
  atteste('hôpital', 'hôpitaux', 'aux', 'hopital', '(pluriel Hôpitaux)'),
  atteste('signal', 'signaux', 'aux', 'signal', '(pluriel Signaux)'),
  atteste('métal', 'métaux', 'aux', 'metal', '(pluriel Métaux)'),
];

export const PLURIELS_ALS: readonly Pluriel[] = [
  atteste('bal', 'bals', 'als', 'bal', '(pluriel Bals)'),
  atteste('carnaval', 'carnavals', 'als', 'carnaval', '(pluriel Carnavals)'),
  atteste('festival', 'festivals', 'als', 'festival', '(pluriel Festivals)'),
  atteste('chacal', 'chacals', 'als', 'chacal', '(pluriel Chacals)'),
  atteste('régal', 'régals', 'als', 'regal', '(pluriel Régals)'),
];

/** Phrases à compléter : le mot entre parenthèses est à écrire au pluriel. */
export const PHRASES_PLURIEL: readonly (readonly [string, string, string])[] = [
  ['Au pré, les', 'cheval', 'galopent.'],
  ['Au kiosque, on vend des', 'journal', 'et des revues.'],
  ['Au zoo, les', 'animal', 'dorment à l’ombre.'],
  ['Sur le port, les', 'bateau', 'attendent le vent.'],
  ['Pour la fête, nous ouvrons les', 'cadeau', 'ensemble.'],
  ['La nuit, les', 'hibou', 'chassent.'],
  ['Au jardin, mamie plante des', 'chou', 'et des radis.'],
  ['Sur la plage, je ramasse des', 'caillou', 'tout ronds.'],
  ['En été, la ville organise des', 'festival', 'de musique.'],
  ['Sur la colline, on voit deux', 'château', 'très anciens.'],
  ['Le menuisier enfonce des', 'clou', 'dans la planche.'],
  ['Au printemps, les', 'oiseau', 'font leur nid.'],
];

// ───────────────────────── Féminin des noms et des adjectifs ─────────────────────────

export type Regle = 'e' | 'double' | 'ere' | 'euse' | 'trice' | 've' | 'special';

export interface Feminin {
  readonly m: string;
  readonly f: string;
  readonly nature: 'nom' | 'adjectif';
  readonly regle: Regle;
  readonly fait: string;
}

const FAITS_FEMININS: Fait[] = [];

/** Un féminin attesté par l'entrée du mot (dictionnaire de l'Académie ou Trésor de la langue française). */
const fem =
  (prefixe: 'academie' | 'cnrtl') =>
  (m: string, f: string, nature: Feminin['nature'], regle: Regle, citation = `${m}, ${f}`.toUpperCase()): Feminin => {
    // L'identifiant de la source est le mot sans accents.
    const source = m.normalize('NFD').replace(/\p{M}/gu, '');
    const id = `feminin-${source}`;
    FAITS_FEMININS.push({ id, source: `${prefixe}-${source}`, citation });
    return { m, f, nature, regle, fait: id };
  };
const aca = fem('academie');
const tlf = fem('cnrtl');

export const FEMININS: readonly Feminin[] = [
  aca('ami', 'amie', 'nom', 'e'),
  aca('marchand', 'marchande', 'nom', 'e'),
  tlf('voisin', 'voisine', 'nom', 'e', 'VOISIN, -INE'),
  tlf('petit', 'petite', 'adjectif', 'e', 'PETIT, -ITE'),
  tlf('grand', 'grande', 'adjectif', 'e'),
  tlf('vert', 'verte', 'adjectif', 'e'),
  tlf('lourd', 'lourde', 'adjectif', 'e'),
  tlf('content', 'contente', 'adjectif', 'e', 'CONTENT, ENTE'),
  aca('joli', 'jolie', 'adjectif', 'e'),
  aca('noir', 'noire', 'adjectif', 'e'),
  aca('bleu', 'bleue', 'adjectif', 'e'),
  aca('fort', 'forte', 'adjectif', 'e'),
  aca('lion', 'lionne', 'nom', 'double'),
  aca('chien', 'chienne', 'nom', 'double'),
  aca('chat', 'chatte', 'nom', 'double'),
  aca('musicien', 'musicienne', 'nom', 'double'),
  aca('champion', 'championne', 'nom', 'double'),
  aca('fermier', 'fermière', 'nom', 'ere'),
  aca('écolier', 'écolière', 'nom', 'ere'),
  aca('léger', 'légère', 'adjectif', 'ere'),
  tlf('dernier', 'dernière', 'adjectif', 'ere', 'DERNIER, IÈRE'),
  aca('chanteur', 'chanteuse', 'nom', 'euse'),
  aca('danseur', 'danseuse', 'nom', 'euse'),
  tlf('vendeur', 'vendeuse', 'nom', 'euse', 'VENDEUR, -EUSE'),
  aca('heureux', 'heureuse', 'adjectif', 'euse'),
  tlf('peureux', 'peureuse', 'adjectif', 'euse', 'PEUREUX, -EUSE'),
  aca('directeur', 'directrice', 'nom', 'trice'),
  aca('acteur', 'actrice', 'nom', 'trice'),
  aca('instituteur', 'institutrice', 'nom', 'trice'),
  tlf('vif', 'vive', 'adjectif', 've'),
  tlf('sportif', 'sportive', 'adjectif', 've', 'SPORTIF, -IVE'),
  aca('blanc', 'blanche', 'adjectif', 'special', 'BLANC(c ne se prononce pas, même en liaison) , BLANCHE'),
  aca('doux', 'douce', 'adjectif', 'special'),
  tlf('vieux', 'vieille', 'adjectif', 'special', 'VIEUX, VIEIL, VIEILLE'),
  { m: 'beau', f: 'belle', nature: 'adjectif', regle: 'special', fait: 'beau-belle' },
];

const FAIT_BEAU: Fait = {
  id: 'beau-belle',
  source: 'academie-feminin',
  citation: '« Beau » fait « belle » au féminin.',
};

/** Noms (êtres animés) et adjectifs qui vont ensemble dans « Un … est … . » */
export const NOMS_ANIMES = [
  'ami',
  'marchand',
  'voisin',
  'lion',
  'chien',
  'chat',
  'champion',
  'musicien',
  'fermier',
  'écolier',
  'chanteur',
  'danseur',
  'vendeur',
] as const;
export const ADJECTIFS_ANIMES = [
  'content',
  'grand',
  'petit',
  'fort',
  'heureux',
  'peureux',
  'sportif',
  'doux',
  'léger',
] as const;

// ───────────────────────── Groupes nominaux (genre, nombre, accord) ─────────────────────────

export type Genre = 'm' | 'f';
export type Nombre = 'sg' | 'pl';

export interface NomSimple {
  readonly nom: string;
  readonly genre: Genre;
}

const noms = (genre: Genre, liste: readonly string[]): NomSimple[] => liste.map((nom) => ({ nom, genre }));

/** Noms au pluriel en s, dont le déterminant « un » ou « une » donne le genre. */
export const NOMS_SIMPLES: readonly NomSimple[] = [
  ...noms('m', ['lapin', 'ballon', 'cahier', 'stylo', 'crayon', 'jardin', 'sac', 'nuage', 'robot', 'chien']),
  ...noms('f', ['table', 'fleur', 'porte', 'pomme', 'maison', 'robe', 'chaise', 'balle', 'lampe', 'valise']),
];

export interface Adjectif {
  readonly m: string;
  readonly f: string;
  /** Place habituelle dans le groupe nominal. */
  readonly place: 'avant' | 'apres';
}

const adj = (m: string, place: Adjectif['place'], f = `${m}e`): Adjectif => ({ m, f, place });

/** Aucun de ces adjectifs ne finit par s ou x : le pluriel ajoute toujours un s. */
export const ADJECTIFS_GN: readonly Adjectif[] = [
  adj('petit', 'avant'),
  adj('grand', 'avant'),
  adj('joli', 'avant'),
  adj('vert', 'apres'),
  adj('noir', 'apres'),
  adj('bleu', 'apres'),
  adj('lourd', 'apres'),
];

// ───────────────────────── Accord sujet-verbe ─────────────────────────

export type Personne = 'tu' | 'il' | 'nous' | 'vous' | 'ils';

export const TERMINAISONS: Readonly<Record<Personne, string>> = {
  tu: 'es',
  il: 'e',
  nous: 'ons',
  vous: 'ez',
  ils: 'ent',
};

/** Verbes en -er réguliers qui commencent par une consonne et ne changent pas de radical. */
export const VERBES_ER = ['chanter', 'jouer', 'danser', 'sauter', 'marcher', 'parler', 'dessiner', 'rigoler'] as const;

export const conjuguer = (infinitif: string, p: Personne): string => `${infinitif.slice(0, -2)}${TERMINAISONS[p]}`;

export interface Sujet {
  readonly texte: string;
  readonly personne: Personne;
}

const sujets = (personne: Personne, liste: readonly string[]): Sujet[] => liste.map((texte) => ({ texte, personne }));

export const SUJETS: readonly Sujet[] = [
  ...sujets('tu', ['Tu']),
  ...sujets('nous', ['Nous']),
  ...sujets('vous', ['Vous']),
  ...sujets('il', ['Il', 'Elle', 'Le garçon', 'La fille', 'Mon copain', 'Ma voisine']),
  ...sujets('ils', ['Ils', 'Elles', 'Les garçons', 'Les filles', 'Mes copains', 'Tes voisines']),
];

/** Sujet éloigné, double ou caché derrière un autre mot. */
export interface SujetPiege {
  readonly debut: string;
  readonly infinitif: string;
  readonly fin: string;
  readonly personne: Personne;
  /** Terminaison qu'on écrit à tort en s'accordant avec le mauvais mot. */
  readonly fausse: Personne;
  readonly raison: string;
}

/** `accord` : la personne juste, puis celle qu'on écrit à tort. */
const sp = (
  debut: string,
  infinitif: string,
  fin: string,
  [personne, fausse]: readonly [Personne, Personne],
  raison: string,
): SujetPiege => ({ debut, infinitif, fin, personne, fausse, raison });

export const SUJETS_PIEGES: readonly SujetPiege[] = [
  sp(
    'Le chien de mes voisins',
    'sauter',
    'sur le lit',
    ['il', 'ils'],
    'Le sujet a pour nom noyau « chien » : un seul.',
  ),
  sp('Les fleurs du jardin', 'pousser', 'vite', ['ils', 'il'], 'Le sujet a pour nom noyau « fleurs » : plusieurs.'),
  sp('La maîtresse des petits', 'chanter', 'très bien', ['il', 'ils'], 'Le nom noyau est « maîtresse » : une seule.'),
  sp('Les élèves de ma classe', 'danser', 'ensemble', ['ils', 'il'], 'Le nom noyau est « élèves » : plusieurs.'),
  sp('Le chat et le lapin', 'jouer', 'dehors', ['ils', 'il'], 'Deux noms réunis par « et » : le sujet est au pluriel.'),
  sp('La fille et sa mère', 'marcher', 'vite', ['ils', 'il'], 'Deux noms réunis par « et » : le sujet est au pluriel.'),
  sp('Le soir, mes voisins', 'parler', 'fort', ['ils', 'il'], 'Le sujet est « mes voisins », pas « le soir ».'),
  sp('Dans la cour, la petite', 'sauter', 'à la corde', ['il', 'ils'], 'Le sujet est « la petite » : une seule.'),
  sp('Tu les', 'regarder', 'de loin', ['tu', 'ils'], 'Le sujet est « tu ». « les » complète le verbe.'),
  sp('Il nous', 'raconter', 'une blague', ['il', 'nous'], 'Le sujet est « il ». « nous » complète le verbe.'),
  sp('Elle les', 'aider', 'souvent', ['il', 'ils'], 'Le sujet est « elle ». « les » complète le verbe.'),
  sp('Les amis de mon frère', 'rigoler', 'sans arrêt', ['ils', 'il'], 'Le nom noyau est « amis » : plusieurs.'),
];

// ───────────────────────── Participe passé avec être ─────────────────────────

export interface SujetAccorde {
  readonly texte: string;
  readonly genre: Genre;
  readonly nombre: Nombre;
  /** Sujet piège : pourquoi il a ce genre et ce nombre. */
  readonly raison?: string;
}

const sa = (texte: string, genre: Genre, nombre: Nombre, raison?: string): SujetAccorde => ({
  texte,
  genre,
  nombre,
  ...(raison ? { raison } : {}),
});

export const SUJETS_PARTICIPE: readonly SujetAccorde[] = [
  sa('Il', 'm', 'sg'),
  sa('Le garçon', 'm', 'sg'),
  sa('Mon frère', 'm', 'sg'),
  sa('Elle', 'f', 'sg'),
  sa('La fille', 'f', 'sg'),
  sa('Ma sœur', 'f', 'sg'),
  sa('Ils', 'm', 'pl'),
  sa('Les garçons', 'm', 'pl'),
  sa('Mes frères', 'm', 'pl'),
  sa('Elles', 'f', 'pl'),
  sa('Les filles', 'f', 'pl'),
  sa('Mes sœurs', 'f', 'pl'),
];

/** Sujet éloigné du verbe ou double : le nom le plus proche du verbe n'est pas toujours le bon. */
export const SUJETS_PARTICIPE_PIEGES: readonly SujetAccorde[] = [
  sa('La sœur de mes voisins', 'f', 'sg', 'Le nom noyau est « sœur ».'),
  sa('Le frère de mes copines', 'm', 'sg', 'Le nom noyau est « frère ».'),
  sa('Les copines de mon frère', 'f', 'pl', 'Le nom noyau est « copines ».'),
  sa('Les cousins de ma voisine', 'm', 'pl', 'Le nom noyau est « cousins ».'),
  sa('La mère et la fille', 'f', 'pl', 'Deux noms féminins réunis par « et ».'),
  sa('Le père et le fils', 'm', 'pl', 'Deux noms masculins réunis par « et ».'),
  sa('La dame aux grands chapeaux', 'f', 'sg', 'Le nom noyau est « dame ».'),
  sa('Les joueurs de l’équipe', 'm', 'pl', 'Le nom noyau est « joueurs ».'),
];

export interface VerbeEtre {
  readonly infinitif: string;
  readonly participe: string;
  readonly fin: string;
}

export const VERBES_ETRE: readonly VerbeEtre[] = [
  { infinitif: 'arriver', participe: 'arrivé', fin: 'à l’heure' },
  { infinitif: 'partir', participe: 'parti', fin: 'très tôt' },
  { infinitif: 'tomber', participe: 'tombé', fin: 'dans la neige' },
  { infinitif: 'rester', participe: 'resté', fin: 'à la maison' },
  { infinitif: 'entrer', participe: 'entré', fin: 'sans bruit' },
  { infinitif: 'venir', participe: 'venu', fin: 'à la fête' },
  { infinitif: 'aller', participe: 'allé', fin: 'à la piscine' },
  { infinitif: 'rentrer', participe: 'rentré', fin: 'avant la nuit' },
];

export const accorderParticipe = (participe: string, s: Pick<SujetAccorde, 'genre' | 'nombre'>): string =>
  `${participe}${s.genre === 'f' ? 'e' : ''}${s.nombre === 'pl' ? 's' : ''}`;

// ───────────────────────── Faits et sources ─────────────────────────

export const FAITS_ACCORDS: readonly Fait[] = [...REGLES, ...FAITS_PLURIELS, ...FAITS_FEMININS, FAIT_BEAU];

export const faitAccord = (id: string): Fait => {
  const x = FAITS_ACCORDS.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesAccords = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitAccord(id).source)]),
];

// Aucun prénom dans les phrases.
