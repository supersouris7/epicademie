/**
 * Données du chapitre « Les accords » (CM2) : faits cités et phrases écrites pour l'exercice.
 * Les féminins et les pluriels déjà attestés au CM1 sont repris de `accords.donnees.ts`.
 */
import {
  FEMININS,
  PLURIELS_ALS,
  PLURIELS_AUX,
  PLURIELS_EAU,
  PLURIELS_OU_X,
  VERBES_ETRE,
  faitAccord,
  type Genre,
  type Nombre,
  type SujetAccorde,
  type VerbeEtre,
} from './accords.donnees.ts';
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait('eduscol-grammaire-francais');

const REGLES: readonly Fait[] = [
  prog(
    'sujet-inverse-programme',
    'Repérer les groupes sujets inversés dans un contexte de phrases simples, puis dans des cas plus complexes',
  ),
  prog(
    'chaine-attribut',
    'Conjointement à la notion de la fonction d’attribut du sujet, identifier et appliquer la chaîne d’accords sujet/verbe, sujet/attribut du sujet',
  ),
  prog('pp-etre-programme', 'Accorder le participe passé avec le sujet dans le cas de l’auxiliaire être'),
  prog(
    'temps-composes-programme',
    'Connaître la composition en deux parties (auxiliaire + participe passé) des temps composés (passé composé et plus-que-parfait)',
  ),
  prog(
    'pp-avoir-programme',
    'Accorder le participe passé avec le COD pour les verbes étudiés et conjugués avec l’auxiliaire avoir',
  ),
  prog(
    'pluriels-irreguliers',
    'La connaissance et l’utilisation des pluriels irréguliers (-x ; -al/aux), introduits au cycle 2, sont stabilisées et complétées en fin de cycle 3',
  ),
  prog(
    'variations-particulieres',
    'Rencontrer quelques variations particulières en contexte, en lien avec les apprentissages en orthographe lexicale',
  ),
  gram('accord-verbe-gs', 'Le groupe sujet (GS) règle l’accord du verbe'),
  gram('accord-adjectif-nom', 'Il s’accorde en genre et en nombre avec le nom auquel il se rapporte.'),
  gram('attribut-exemple', 'Adjectif attribut : ce cahier est beau, cette trousse est belle.'),
  gram('verbes-attributifs', 'D’autres verbes attributifs ajoutent des nuances aspectuelles'),
  {
    id: 'pp-etre-regle',
    source: 'cnrtl-etre',
    citation: 'Le part. passé s’accorde en genre et en nombre avec le suj. du verbe.',
  },
  {
    id: 'pp-avoir-regle',
    source: 'cnrtl-avoir',
    citation:
      'Le part. passé s’accorde en genre et en nombre avec le compl. d’obj. du verbe si celui-ci précède le verbe.',
  },
];

// ───────────────────────── 1. Accord sujet-verbe ─────────────────────────

export interface PhraseVerbe {
  /** Ce qui précède le verbe. */
  readonly avant: string;
  /** Ce qui suit le verbe, sans le point. */
  readonly apres: string;
  readonly infinitif: string;
  /** [singulier, pluriel] au présent. */
  readonly formes: readonly [string, string];
  readonly nombre: Nombre;
  /** Nom noyau du sujet. */
  readonly noyau: string;
  /** Trois autres mots de la phrase, qui ne commandent pas le verbe. */
  readonly autres: readonly [string, string, string];
}

const pv = (
  [avant, apres]: readonly [string, string],
  infinitif: string,
  formes: readonly [string, string],
  [nombre, noyau]: readonly [Nombre, string],
  autres: readonly [string, string, string],
): PhraseVerbe => ({ avant, apres, infinitif, formes, nombre, noyau, autres });

const VOLER = ['vole', 'volent'] as const;
const CHANTER = ['chante', 'chantent'] as const;
const BRILLER = ['brille', 'brillent'] as const;
const POUSSER = ['pousse', 'poussent'] as const;
const PASSER = ['passe', 'passent'] as const;
const DORMIR = ['dort', 'dorment'] as const;
const COURIR = ['court', 'courent'] as const;
const FLOTTER = ['flotte', 'flottent'] as const;
const ARRIVER = ['arrive', 'arrivent'] as const;
const ROULER = ['roule', 'roulent'] as const;
const SAUTER = ['saute', 'sautent'] as const;
const JAILLIR = ['jaillit', 'jaillissent'] as const;
const GRANDIR = ['grandit', 'grandissent'] as const;

/** Sujet placé juste après le verbe. */
export const INVERSES_SIMPLES: readonly PhraseVerbe[] = [
  pv(['Dans le ciel', 'les hirondelles'], 'voler', VOLER, ['pl', 'hirondelles'], ['ciel', 'Dans', 'les']),
  pv(['Au fond du jardin', 'un vieux pommier'], 'pousser', POUSSER, ['sg', 'pommier'], ['fond', 'jardin', 'vieux']),
  pv(['Sur la branche', 'un merle'], 'chanter', CHANTER, ['sg', 'merle'], ['branche', 'Sur', 'la']),
  pv(['Dans la nuit', 'les étoiles'], 'briller', BRILLER, ['pl', 'étoiles'], ['nuit', 'Dans', 'les']),
  pv(['Sur le port', 'les bateaux'], 'passer', PASSER, ['pl', 'bateaux'], ['port', 'Sur', 'les']),
  pv(['Près du feu', 'un gros chat'], 'dormir', DORMIR, ['sg', 'chat'], ['feu', 'Près', 'gros']),
  pv(['Dans le pré', 'les poulains'], 'courir', COURIR, ['pl', 'poulains'], ['pré', 'Dans', 'les']),
  pv(['Sur la mare', 'une plume'], 'flotter', FLOTTER, ['sg', 'plume'], ['mare', 'Sur', 'une']),
  pv(['Au loin', 'les premiers coureurs'], 'arriver', ARRIVER, ['pl', 'coureurs'], ['loin', 'Au', 'premiers']),
  pv(['Sur la route', 'un camion'], 'rouler', ROULER, ['sg', 'camion'], ['route', 'Sur', 'un']),
];

/** Sujet inversé, avec un autre nom, d'un autre nombre, placé avant le verbe. */
export const INVERSES_PIEGES: readonly PhraseVerbe[] = [
  pv(['Au sommet des arbres', 'un écureuil'], 'sauter', SAUTER, ['sg', 'écureuil'], ['sommet', 'arbres', 'Au']),
  pv(['Au-dessus de la ville', 'des cerfs-volants'], 'voler', VOLER, ['pl', 'cerfs-volants'], ['ville', 'la', 'de']),
  pv(['Entre les rochers', 'une petite source'], 'jaillir', JAILLIR, ['sg', 'source'], ['rochers', 'Entre', 'petite']),
  pv(
    ['Au bord de la rivière', 'de hauts roseaux'],
    'pousser',
    POUSSER,
    ['pl', 'roseaux'],
    ['bord', 'rivière', 'hauts'],
  ),
  pv(
    ['Dans les rues du village', 'un joyeux défilé'],
    'passer',
    PASSER,
    ['sg', 'défilé'],
    ['rues', 'village', 'joyeux'],
  ),
  pv(['Au milieu du salon', 'les jouets du bébé'], 'rouler', ROULER, ['pl', 'jouets'], ['milieu', 'salon', 'bébé']),
];

/** Sujet éloigné du verbe : le mot le plus proche n'est pas celui qui commande. */
export const ELOIGNES: readonly PhraseVerbe[] = [
  pv(['Les lampes de la grande salle', 'fort'], 'briller', BRILLER, ['pl', 'lampes'], ['salle', 'grande', 'fort']),
  pv(['Le chien de mes voisins', 'sur le canapé'], 'dormir', DORMIR, ['sg', 'chien'], ['voisins', 'canapé', 'mes']),
  pv(['La cage des oiseaux', 'au soleil'], 'briller', BRILLER, ['sg', 'cage'], ['oiseaux', 'soleil', 'des']),
  pv(['Les fleurs de ce massif', 'très vite'], 'pousser', POUSSER, ['pl', 'fleurs'], ['massif', 'vite', 'ce']),
  pv(
    ['Le capitaine des pompiers', 'vers la sortie'],
    'courir',
    COURIR,
    ['sg', 'capitaine'],
    ['pompiers', 'sortie', 'vers'],
  ),
  pv(['Les wagons du petit train', 'lentement'], 'rouler', ROULER, ['pl', 'wagons'], ['train', 'petit', 'lentement']),
  pv(['La voix des enfants', 'dans le couloir'], 'chanter', CHANTER, ['sg', 'voix'], ['enfants', 'couloir', 'des']),
  pv(['Les feuilles du vieux chêne', 'sur l’eau'], 'flotter', FLOTTER, ['pl', 'feuilles'], ['chêne', 'vieux', 'eau']),
  pv(['Les enfants de ma tante', 'en une année'], 'grandir', GRANDIR, ['pl', 'enfants'], ['tante', 'année', 'ma']),
  pv(['Le ballon des petits', 'par-dessus le mur'], 'passer', PASSER, ['sg', 'ballon'], ['petits', 'mur', 'des']),
];

export const textePhrase = (p: PhraseVerbe, verbe: string): string => `${p.avant} ${verbe} ${p.apres}.`;
export const verbeJuste = (p: PhraseVerbe): string => p.formes[p.nombre === 'sg' ? 0 : 1];
export const verbeFaux = (p: PhraseVerbe): string => p.formes[p.nombre === 'sg' ? 1 : 0];

// ───────────────────────── 2. Accord de l'attribut du sujet ─────────────────────────

export interface Adj {
  readonly base: string;
  readonly m: readonly [string, string];
  readonly f: readonly [string, string];
  /** Fait qui atteste le féminin. */
  readonly fait: string;
}

const feminin = (base: string) => {
  const x = FEMININS.find((y) => y.m === base);
  if (!x) throw new Error(`féminin inconnu : ${base}`);
  return x;
};

/** Adjectif dont le féminin est attesté au CM1 ; `mp` : masculin pluriel. */
const adj = (base: string, mp = `${base}s`): Adj => {
  const x = feminin(base);
  return { base, m: [base, mp], f: [x.f, `${x.f}s`], fait: x.fait };
};

/** Quatre formes différentes : le féminin et le pluriel s'entendent à l'écrit. */
export const ADJ_REGULIERS = {
  grand: adj('grand'),
  petit: adj('petit'),
  vert: adj('vert'),
  lourd: adj('lourd'),
} as const;

export const ADJ_PARTICULIERS = {
  content: adj('content'),
  heureux: adj('heureux', 'heureux'),
  doux: adj('doux', 'doux'),
  blanc: adj('blanc'),
  vif: adj('vif'),
  léger: adj('léger'),
  beau: adj('beau', 'beaux'),
} as const;

export const forme = (a: Adj, genre: Genre, nombre: Nombre): string => a[genre][nombre === 'sg' ? 0 : 1];

export interface Groupe {
  readonly texte: string;
  readonly genre: Genre;
  readonly nombre: Nombre;
  readonly noyau: string;
}

const g = (texte: string, genre: Genre, nombre: Nombre, noyau: string): Groupe => ({ texte, genre, nombre, noyau });

/** Objets qu'on peut dire grands, petits, verts ou lourds. */
export const OBJETS: readonly Groupe[] = [
  g('Le sac', 'm', 'sg', 'sac'),
  g('Le coffre', 'm', 'sg', 'coffre'),
  g('La valise', 'f', 'sg', 'valise'),
  g('La caisse', 'f', 'sg', 'caisse'),
  g('Les cartons', 'm', 'pl', 'cartons'),
  g('Les paniers', 'm', 'pl', 'paniers'),
  g('Les malles', 'f', 'pl', 'malles'),
  g('Les boîtes', 'f', 'pl', 'boîtes'),
];

export interface VerbeAttributif {
  readonly infinitif: string;
  readonly formes: readonly [string, string];
}

export const VERBES_ATTRIBUTIFS: readonly VerbeAttributif[] = [
  { infinitif: 'être', formes: ['est', 'sont'] },
  { infinitif: 'sembler', formes: ['semble', 'semblent'] },
  { infinitif: 'paraître', formes: ['paraît', 'paraissent'] },
  { infinitif: 'rester', formes: ['reste', 'restent'] },
  { infinitif: 'devenir', formes: ['devient', 'deviennent'] },
];

export interface AttributEloigne extends Groupe {
  readonly adjectif: Adj;
  readonly verbe: VerbeAttributif;
}

const verbeAttributif = (infinitif: string): VerbeAttributif => {
  const v = VERBES_ATTRIBUTIFS.find((x) => x.infinitif === infinitif);
  if (!v) throw new Error(`verbe inconnu : ${infinitif}`);
  return v;
};

const ae = (groupe: Groupe, verbe: string, adjectif: Adj): AttributEloigne => ({
  ...groupe,
  verbe: verbeAttributif(verbe),
  adjectif,
});

/** Sujet suivi d'un complément d'un autre genre ou d'un autre nombre. */
export const ATTRIBUTS_ELOIGNES: readonly AttributEloigne[] = [
  ae(g('Les amies de mon frère', 'f', 'pl', 'amies'), 'paraître', ADJ_PARTICULIERS.heureux),
  ae(g('La robe des poupées', 'f', 'sg', 'robe'), 'rester', ADJ_PARTICULIERS.blanc),
  ae(g('Les yeux de la chatte', 'm', 'pl', 'yeux'), 'être', ADJ_PARTICULIERS.vif),
  ae(g('La laine de ces moutons', 'f', 'sg', 'laine'), 'sembler', ADJ_PARTICULIERS.doux),
  ae(g('Les plumes de l’oiseau', 'f', 'pl', 'plumes'), 'être', ADJ_PARTICULIERS.léger),
  ae(g('Le père des jumelles', 'm', 'sg', 'père'), 'sembler', ADJ_PARTICULIERS.content),
  ae(g('Les fleurs du talus', 'f', 'pl', 'fleurs'), 'devenir', ADJ_PARTICULIERS.beau),
  ae(g('Le toit des cabanes', 'm', 'sg', 'toit'), 'devenir', ADJ_PARTICULIERS.blanc),
  ae(g('La sœur de mes voisins', 'f', 'sg', 'sœur'), 'paraître', ADJ_PARTICULIERS.content),
  ae(g('Les gestes de la danseuse', 'm', 'pl', 'gestes'), 'rester', ADJ_PARTICULIERS.léger),
];

// ───────────────────────── 3. Participe passé avec être ─────────────────────────

export const VERBES_ETRE_CM2: readonly VerbeEtre[] = [
  ...VERBES_ETRE,
  { infinitif: 'sortir', participe: 'sorti', fin: 'dans la cour' },
  { infinitif: 'revenir', participe: 'revenu', fin: 'avant midi' },
  { infinitif: 'descendre', participe: 'descendu', fin: 'au rez-de-chaussée' },
  { infinitif: 'monter', participe: 'monté', fin: 'au grenier' },
];

const sa = (texte: string, genre: Genre, nombre: Nombre, raison: string): SujetAccorde => ({
  texte,
  genre,
  nombre,
  raison,
});

/** Sujets placés après le verbe. */
export const SUJETS_APRES: readonly SujetAccorde[] = [
  sa('les nageuses', 'f', 'pl', 'Le sujet « les nageuses » est placé après.'),
  sa('les voisins', 'm', 'pl', 'Le sujet « les voisins » est placé après.'),
  sa('la maîtresse', 'f', 'sg', 'Le sujet « la maîtresse » est placé après.'),
  sa('le facteur', 'm', 'sg', 'Le sujet « le facteur » est placé après.'),
  sa('les deux sœurs', 'f', 'pl', 'Le sujet « les deux sœurs » est placé après.'),
  sa('les pompiers', 'm', 'pl', 'Le sujet « les pompiers » est placé après.'),
];

/** Verbes qui vont avec un sujet placé après. */
export const VERBES_APRES: readonly string[] = ['arriver', 'partir', 'entrer', 'venir', 'sortir', 'revenir'];

export const verbeEtre = (infinitif: string): VerbeEtre => {
  const v = VERBES_ETRE_CM2.find((x) => x.infinitif === infinitif);
  if (!v) throw new Error(`verbe inconnu : ${infinitif}`);
  return v;
};

// ───────────────────────── 4. Participe passé avec avoir ─────────────────────────

export interface Objet {
  /** Complément d'objet direct, avec son déterminant. */
  readonly cod: string;
  readonly genre: Genre;
  readonly nombre: Nombre;
  readonly infinitif: string;
  readonly participe: string;
}

const o = (cod: string, genre: Genre, nombre: Nombre, [infinitif, participe]: readonly [string, string]): Objet => ({
  cod,
  genre,
  nombre,
  infinitif,
  participe,
});

const MANGER = ['manger', 'mangé'] as const;
const RANGER = ['ranger', 'rangé'] as const;
const LAVER = ['laver', 'lavé'] as const;
const FERMER = ['fermer', 'fermé'] as const;
const TROUVER = ['trouver', 'trouvé'] as const;
const FINIR = ['finir', 'fini'] as const;
const CHOISIR = ['choisir', 'choisi'] as const;
const VOIR = ['voir', 'vu'] as const;

export const OBJETS_AVOIR: readonly Objet[] = [
  o('la tarte', 'f', 'sg', MANGER),
  o('les cerises', 'f', 'pl', MANGER),
  o('le gâteau', 'm', 'sg', MANGER),
  o('les billes', 'f', 'pl', RANGER),
  o('les cahiers', 'm', 'pl', RANGER),
  o('les vitres', 'f', 'pl', LAVER),
  o('la voiture', 'f', 'sg', LAVER),
  o('la porte', 'f', 'sg', FERMER),
  o('les volets', 'm', 'pl', FERMER),
  o('les clés', 'f', 'pl', TROUVER),
  o('le ballon', 'm', 'sg', TROUVER),
  o('la partie', 'f', 'sg', FINIR),
  o('les devoirs', 'm', 'pl', FINIR),
  o('les chaussures', 'f', 'pl', CHOISIR),
  o('les livres', 'm', 'pl', CHOISIR),
  o('la comète', 'f', 'sg', VOIR),
  o('les dauphins', 'm', 'pl', VOIR),
];

export interface Auteur {
  readonly texte: string;
  readonly aux: string;
}

export const AUTEURS: readonly Auteur[] = [
  { texte: 'je', aux: 'ai' },
  { texte: 'tu', aux: 'as' },
  { texte: 'il', aux: 'a' },
  { texte: 'elle', aux: 'a' },
  { texte: 'nous', aux: 'avons' },
  { texte: 'ils', aux: 'ont' },
  { texte: 'elles', aux: 'ont' },
];

/** « je les ai », « tu l’as ». */
export const avecPronom = (a: Auteur, x: Objet): string =>
  x.nombre === 'pl' ? `${a.texte} les ${a.aux}` : `${a.texte} l’${a.aux}`;
/** « j’ai », « tu as ». */
export const sansPronom = (a: Auteur): string => (a.texte === 'je' ? 'j’ai' : `${a.texte} ${a.aux}`);

// ───────────────────────── 5. Pluriels et féminins particuliers ─────────────────────────

export interface Forme {
  readonly base: string;
  readonly forme: string;
  /** Autre écriture admise. */
  readonly variante?: string;
  readonly genreOuNombre: 'pluriel' | 'féminin';
  readonly regle: string;
  /** L'erreur la plus tentante. */
  readonly faux: string;
  readonly fait: string;
}

const FAITS_FORMES: Fait[] = [];

const atteste = (source: string, mot: string, citation: string): string => {
  const id = `forme-${mot}`;
  FAITS_FORMES.push({ id, source, citation });
  return id;
};

const plur = (base: string, formePlurielle: string, faux: string, regle: string, faitId: string): Forme => ({
  base,
  forme: formePlurielle,
  genreOuNombre: 'pluriel',
  regle,
  faux,
  fait: faitId,
});

const fem = (base: string, formeFeminine: string, faux: string, regle: string, faitId: string): Forme => ({
  base,
  forme: formeFeminine,
  genreOuNombre: 'féminin',
  regle,
  faux,
  fait: faitId,
});

const pluriel = (liste: typeof PLURIELS_AUX, base: string) => {
  const x = liste.find((y) => y.s === base);
  if (!x) throw new Error(`pluriel inconnu : ${base}`);
  return x;
};

const enAux = (base: string): Forme => {
  const x = pluriel(PLURIELS_AUX, base);
  return plur(base, x.p, `${base}s`, 'Ici, -al devient **-aux**.', x.fait);
};
const enX = (base: string): Forme => {
  const x = pluriel(PLURIELS_EAU, base);
  return plur(base, x.p, `${base}s`, 'Ce nom en -eau ou -eu prend un **x**.', x.fait);
};
const enAls = (base: string): Forme => {
  const x = pluriel(PLURIELS_ALS, base);
  return plur(
    base,
    x.p,
    `${base.slice(0, -2)}aux`,
    `« ${base} » est une exception en -al : il prend un **s**.`,
    x.fait,
  );
};
const serieOu = (base: string): Forme => {
  const x = pluriel(PLURIELS_OU_X, base);
  return plur(base, x.p, `${base}s`, `« ${base} » fait partie des sept noms en -ou qui prennent un **x**.`, x.fait);
};
const duCm1 = (base: string, faux: string, regle: string): Forme => {
  const x = feminin(base);
  return fem(base, x.f, faux, regle, x.fait);
};

export const PLURIELS_COURANTS: readonly Forme[] = [
  ...['cheval', 'journal', 'animal', 'bocal', 'canal', 'hôpital', 'signal', 'métal'].map(enAux),
  ...['bateau', 'cadeau', 'oiseau', 'drapeau', 'bureau', 'cheveu', 'jeu'].map(enX),
];

export const PLURIELS_RARES: readonly Forme[] = [
  ...['bal', 'carnaval', 'festival', 'chacal', 'régal'].map(enAls),
  ...['bijou', 'caillou', 'genou', 'hibou', 'pou'].map(serieOu),
  plur(
    'travail',
    'travaux',
    'travails',
    'Ici, -ail devient **-aux**.',
    atteste('cnrtl-travail', 'travaux', 'Travaux d’aiguille, de dame.'),
  ),
  plur(
    'pneu',
    'pneus',
    'pneux',
    '« pneu » est une exception en -eu : il prend un **s**.',
    atteste('cnrtl-pneu', 'pneus', 'train de pneus; métro à pneus'),
  ),
  plur(
    'bleu',
    'bleus',
    'bleux',
    '« bleu » est une exception en -eu : il prend un **s**.',
    atteste('academie-bleu', 'bleus', 'Des yeux bleus.'),
  ),
];

export const FEMININS_COURANTS: readonly Forme[] = [
  duCm1('sportif', 'sportife', 'Ici, le -f devient **-ve**.'),
  duCm1('vif', 'vife', 'Ici, le -f devient **-ve**.'),
  duCm1('heureux', 'heureuxe', 'Ici, -eux devient **-euse**.'),
  duCm1('léger', 'légere', 'Ici, -er devient **-ère**, avec un accent grave.'),
  duCm1('directeur', 'directeuse', 'Ici, -teur devient **-trice**.'),
  fem(
    'gros',
    'grosse',
    'grose',
    'On double le s avant le e : **-sse**.',
    atteste('academie-gros', 'grosse', 'GROS, GROSSE'),
  ),
  fem(
    'long',
    'longue',
    'longe',
    'On ajoute **-ue** pour garder le son du g.',
    atteste('academie-long', 'longue', 'LONG, LONGUE'),
  ),
  fem(
    'nouveau',
    'nouvelle',
    'nouveaue',
    '-eau devient **-elle**.',
    atteste(
      'academie-nouveau',
      'nouvelle',
      'NOUVEAU (ou NOUVEL, devant les mots commençant par une voyelle ou un h muet), NOUVELLE',
    ),
  ),
];

export const FEMININS_RARES: readonly Forme[] = [
  duCm1('blanc', 'blance', 'Ici, le féminin se termine par **-che**.'),
  duCm1('doux', 'douse', '« doux » devient **douce**, avec un c.'),
  duCm1('beau', 'beaue', '-eau devient **-elle**.'),
  duCm1('vieux', 'vieuse', '« vieux » devient **vieille** : c’est à retenir.'),
  {
    ...fem(
      'frais',
      'fraîche',
      'fraise',
      '« frais » devient **fraîche** : c’est à retenir.',
      atteste('academie-frais', 'fraîche', 'FRAIS, FRAÎCHE'),
    ),
    // Orthographe rectifiée de 1990.
    variante: 'fraiche',
  },
  fem('sec', 'sèche', 'sèc', '« sec » devient **sèche**.', atteste('cnrtl-sec', 'seche', 'SEC, SÈCHE')),
  fem(
    'public',
    'publique',
    'publice',
    '-ic devient ici **-ique**.',
    atteste('academie-public', 'publique', 'Soulager la misère publique.'),
  ),
  fem(
    'fou',
    'folle',
    'foue',
    '« fou » devient **folle** : c’est à retenir.',
    atteste(
      'academie-fou',
      'folle',
      'FOU (ou FOL, devant un nom au singulier commençant par une voyelle ou un h muet), FOLLE',
    ),
  ),
  fem(
    'jumeau',
    'jumelle',
    'jumeaue',
    '-eau devient **-elle**.',
    atteste('academie-jumeau', 'jumelle', 'C’est sa sœur jumelle.'),
  ),
  fem(
    'loup',
    'louve',
    'loupe',
    '« loup » devient **louve** : c’est à retenir.',
    atteste('academie-loup', 'louve', 'Le loup, la louve, les louveteaux.'),
  ),
];

export interface PhraseForme {
  readonly debut: string;
  readonly base: string;
  readonly fin: string;
}

const pf = (debut: string, base: string, fin: string): PhraseForme => ({ debut, base, fin });

/** Phrases dont le mot entre parenthèses est à écrire au pluriel ou au féminin (selon la liste du mot). */
export const PHRASES_FORMES: readonly PhraseForme[] = [
  pf('Au centre équestre, deux', 'cheval', 'trottent.'),
  pf('Dans la vitrine brillent des', 'bijou', '.'),
  pf('En ville, la fête compte trois', 'bal', '.'),
  pf('Au garage, on change les', 'pneu', 'du car.'),
  pf('Les maçons ont commencé les', 'travail', '.'),
  pf('Sur le quai, les', 'bateau', 'attendent.'),
  pf('Cette salade est bien', 'frais', '.'),
  pf('Après la sécheresse, la terre est', 'sec', '.'),
  pf('La bibliothèque est', 'public', '.'),
  pf('Ma cousine a une sœur', 'jumeau', '.'),
  pf('Au zoo, la', 'loup', 'surveille ses petits.'),
  pf('Notre école a une', 'nouveau', 'cantine.'),
  pf('Cette corde est très', 'long', '.'),
];

export const formeParticuliere = (base: string): Forme => {
  const x = [...PLURIELS_COURANTS, ...PLURIELS_RARES, ...FEMININS_COURANTS, ...FEMININS_RARES].find(
    (y) => y.base === base,
  );
  if (!x) throw new Error(`forme inconnue : ${base}`);
  return x;
};

// ───────────────────────── Faits et sources ─────────────────────────

/** Faits propres au CM2, plus ceux du CM1 qui attestent les formes reprises. */
export const FAITS_ACCORDS_CM2: readonly Fait[] = [
  ...REGLES,
  ...FAITS_FORMES,
  ...new Set(
    [
      ...[...PLURIELS_COURANTS, ...PLURIELS_RARES, ...FEMININS_COURANTS, ...FEMININS_RARES].map((x) => x.fait),
      ...Object.values({ ...ADJ_REGULIERS, ...ADJ_PARTICULIERS }).map((a) => a.fait),
    ]
      .filter((id) => !FAITS_FORMES.some((f) => f.id === id))
      .map(faitAccord),
  ),
];

export const faitAccordCm2 = (id: string): Fait => {
  const x = FAITS_ACCORDS_CM2.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesAccordsCm2 = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitAccordCm2(id).source)]),
];

// Aucun prénom dans les phrases.
