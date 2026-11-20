import type { Demo, Rich } from './types.ts';

/**
 * Glossaire : les mots qui bloquent les enfants (retour terrain du 20/11/2026 : « quotient »,
 * « reste », « décimales », « cm² »…). Chaque mot a une définition courte, un exemple et, quand
 * c'est utile, un schéma. Les mots sont rendus touchables partout où ils apparaissent (énoncés,
 * explications, leçons) et regroupés dans « Mon dictionnaire ».
 *
 * Définitions conformes au vocabulaire des programmes de mathématiques des cycles 3 et 4
 * (Éduscol) ; chaque exemple est un calcul vérifié par les tests (glossary.test.ts).
 */
export interface GlossaryEntry {
  readonly id: string;
  /** Mot affiché en titre. */
  readonly word: string;
  /** Formes reconnues dans les textes (minuscules ; pluriels compris). */
  readonly forms: readonly string[];
  readonly definition: Rich;
  readonly example: Rich;
  readonly visual?: Demo;
  /** Famille de mots (regroupement du dictionnaire). */
  readonly family: GlossaryFamily;
}

export const GLOSSARY_FAMILIES = {
  operations: 'Les opérations',
  division: 'La division',
  decimaux: 'Les nombres décimaux',
  fractions: 'Les fractions',
  mesures: 'Longueurs, aires et volumes',
} as const;
export type GlossaryFamily = keyof typeof GLOSSARY_FAMILIES;

const DIVISION: Demo = { kind: 'division', dividend: 23, divisor: 5 };

export const GLOSSARY: readonly GlossaryEntry[] = [
  // ——— La division ———
  {
    id: 'division-euclidienne',
    word: 'division euclidienne',
    forms: ['division euclidienne', 'divisions euclidiennes'],
    definition:
      'La division « avec un reste », entre nombres entiers : on cherche combien de paquets entiers on peut faire (le **quotient**) et ce qui reste (le **reste**, toujours plus petit que le diviseur).',
    example: '23 ÷ 5 : on fait 4 paquets de 5 et il reste 3, car 23 = 5 × 4 + 3.',
    visual: DIVISION,
    family: 'division',
  },
  {
    id: 'dividende',
    word: 'dividende',
    forms: ['dividende', 'dividendes'],
    definition: 'Le nombre que l’on partage : celui qu’on divise. Il s’écrit en premier.',
    example: 'Dans 23 ÷ 5, le dividende est **23**.',
    visual: DIVISION,
    family: 'division',
  },
  {
    id: 'diviseur',
    word: 'diviseur',
    forms: ['diviseur', 'diviseurs'],
    definition:
      'Le nombre par lequel on divise : la taille des paquets (ou le nombre de parts). On dit aussi que 5 est **un diviseur de 20** quand la division de 20 par 5 tombe juste (reste 0).',
    example: 'Dans 23 ÷ 5, le diviseur est **5**.',
    visual: DIVISION,
    family: 'division',
  },
  {
    id: 'quotient',
    word: 'quotient',
    forms: ['quotient', 'quotients'],
    definition: 'Le résultat de la division : le nombre de paquets entiers qu’on peut faire.',
    example: 'Dans 23 ÷ 5, le quotient est **4** : on fait 4 paquets de 5.',
    visual: DIVISION,
    family: 'division',
  },
  {
    id: 'reste',
    word: 'reste',
    forms: ['reste', 'restes'],
    definition:
      'Ce qui reste quand on ne peut plus faire de paquet entier. Il est **toujours plus petit que le diviseur** (sinon, on pourrait encore faire un paquet).',
    example: 'Dans 23 ÷ 5, le reste est **3** : 23 = 5 × 4 + 3.',
    visual: DIVISION,
    family: 'division',
  },
  {
    id: 'multiple',
    word: 'multiple',
    forms: ['multiple', 'multiples'],
    definition: 'Un multiple de 5 est un nombre qu’on obtient en multipliant 5 par un nombre entier.',
    example: 'Les multiples de 5 : 0, 5, 10, 15, 20… 20 est un multiple de 5 car 20 = 5 × 4.',
    family: 'division',
  },
  // ——— Les opérations ———
  {
    id: 'somme',
    word: 'somme',
    forms: ['somme', 'sommes'],
    definition: 'Le résultat d’une addition.',
    example: 'La somme de 8 et 5 est 13 : 8 + 5 = 13.',
    family: 'operations',
  },
  {
    id: 'difference',
    word: 'différence',
    forms: ['différence', 'différences'],
    definition: 'Le résultat d’une soustraction : l’écart entre deux nombres.',
    example: 'La différence entre 12 et 7 est 5 : 12 − 7 = 5.',
    family: 'operations',
  },
  {
    id: 'produit',
    word: 'produit',
    forms: ['produit', 'produits'],
    definition: 'Le résultat d’une multiplication.',
    example: 'Le produit de 4 par 6 est 24 : 4 × 6 = 24.',
    family: 'operations',
  },
  {
    id: 'facteur',
    word: 'facteur',
    forms: ['facteur', 'facteurs'],
    definition: 'Chacun des nombres que l’on multiplie.',
    example: 'Dans 4 × 6 = 24, les facteurs sont 4 et 6.',
    family: 'operations',
  },
  {
    id: 'terme',
    word: 'terme',
    forms: ['terme', 'termes'],
    definition: 'Chacun des nombres que l’on additionne ou que l’on soustrait.',
    example: 'Dans 8 + 5 = 13, les termes sont 8 et 5.',
    family: 'operations',
  },
  {
    id: 'chiffre',
    word: 'chiffre',
    forms: ['chiffre', 'chiffres'],
    definition:
      'Un des dix signes 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 qui servent à écrire les nombres (comme les lettres servent à écrire les mots).',
    example: 'Le nombre 305 s’écrit avec 3 chiffres : 3, 0 et 5.',
    family: 'operations',
  },
  // ——— Les nombres décimaux ———
  {
    id: 'nombre-decimal',
    word: 'nombre décimal',
    forms: ['nombre décimal', 'nombres décimaux'],
    definition: 'Un nombre qui peut s’écrire avec une virgule et un nombre fini de chiffres après la virgule.',
    example: '12,75 est un nombre décimal ; 12 aussi (12 = 12,0).',
    visual: { kind: 'rangs', value: '12,75' },
    family: 'decimaux',
  },
  {
    id: 'partie-entiere',
    word: 'partie entière',
    forms: ['partie entière', 'parties entières'],
    definition: 'Le nombre écrit **avant** la virgule.',
    example: 'Dans 12,75, la partie entière est **12**.',
    visual: { kind: 'rangs', value: '12,75' },
    family: 'decimaux',
  },
  {
    id: 'decimale',
    word: 'décimales',
    forms: ['décimale', 'décimales', 'partie décimale', 'parties décimales'],
    definition:
      'Les chiffres écrits **après** la virgule s’appellent les décimales ; ensemble, ils forment la partie décimale.',
    example: '12,75 a deux décimales : **7** (les dixièmes) et **5** (les centièmes).',
    visual: { kind: 'rangs', value: '12,75' },
    family: 'decimaux',
  },
  {
    id: 'dixieme',
    word: 'dixième',
    forms: ['dixième', 'dixièmes'],
    definition: 'Une unité partagée en 10 parts égales : chaque part est un dixième. Un dixième = 0,1.',
    example: 'Dans 12,75, le chiffre des dixièmes est 7 : 7 dixièmes = 0,7.',
    visual: { kind: 'rangs', value: '12,75' },
    family: 'decimaux',
  },
  {
    id: 'centieme',
    word: 'centième',
    forms: ['centième', 'centièmes'],
    definition: 'Une unité partagée en 100 parts égales : chaque part est un centième. Un centième = 0,01.',
    example: 'Dans 12,75, le chiffre des centièmes est 5 : 5 centièmes = 0,05.',
    visual: { kind: 'rangs', value: '12,75' },
    family: 'decimaux',
  },
  {
    id: 'millieme',
    word: 'millième',
    forms: ['millième', 'millièmes'],
    definition: 'Une unité partagée en 1 000 parts égales : chaque part est un millième. Un millième = 0,001.',
    example: 'Dans 3,148, le chiffre des millièmes est 8.',
    visual: { kind: 'rangs', value: '3,148' },
    family: 'decimaux',
  },
  {
    id: 'arrondi',
    word: 'arrondi',
    forms: ['arrondi', 'arrondie', 'arrondis', 'arrondir'],
    definition: 'La valeur « ronde » la plus proche, plus simple à utiliser, à un rang choisi (unité, dixième…).',
    example: '12,7 arrondi à l’unité : 13 (12,7 est plus près de 13 que de 12).',
    family: 'decimaux',
  },
  // ——— Les fractions ———
  {
    id: 'numerateur',
    word: 'numérateur',
    forms: ['numérateur', 'numérateurs'],
    definition: 'Le nombre du **haut** d’une fraction : combien de parts on prend.',
    example: 'Dans {3/4}, le numérateur est 3 : on prend 3 parts.',
    family: 'fractions',
  },
  {
    id: 'denominateur',
    word: 'dénominateur',
    forms: ['dénominateur', 'dénominateurs'],
    definition: 'Le nombre du **bas** d’une fraction : en combien de parts égales on a partagé.',
    example: 'Dans {3/4}, le dénominateur est 4 : on a partagé en 4 parts égales.',
    family: 'fractions',
  },
  // ——— Longueurs, aires et volumes ———
  {
    id: 'longueur',
    word: 'longueur',
    forms: ['longueur', 'longueurs'],
    definition: 'La mesure d’un trait, d’un côté, d’une distance. Elle s’exprime en mm, cm, m, km…',
    example: 'Un côté de 3 cm : c’est 3 traits de 1 cm mis bout à bout.',
    visual: { kind: 'unites', focus: 'longueur' },
    family: 'mesures',
  },
  {
    id: 'perimetre',
    word: 'périmètre',
    forms: ['périmètre', 'périmètres'],
    definition: 'La **longueur du tour** d’une figure. C’est une longueur : elle s’exprime en cm, m… (sans petit 2).',
    example: 'Un carré de 3 cm de côté : périmètre = 3 + 3 + 3 + 3 = 12 cm.',
    visual: { kind: 'unites', focus: 'longueur' },
    family: 'mesures',
  },
  {
    id: 'aire',
    word: 'aire',
    forms: ['aire', 'aires'],
    definition:
      'La place occupée par une surface, à plat. On compte combien de **carrés de 1 cm sur 1 cm** la recouvrent : l’aire s’exprime en **cm²**.',
    example: 'Un rectangle de 3 cm sur 2 cm est recouvert par 3 × 2 = 6 carrés de 1 cm² : aire = 6 cm².',
    visual: { kind: 'unites', focus: 'aire' },
    family: 'mesures',
  },
  {
    id: 'volume',
    word: 'volume',
    forms: ['volume', 'volumes'],
    definition:
      'La place occupée par un objet dans l’espace. On compte combien de **cubes de 1 cm d’arête** le remplissent : le volume s’exprime en **cm³**.',
    example: 'Une boîte de 3 cm × 2 cm × 2 cm contient 3 × 2 × 2 = 12 cubes de 1 cm³ : volume = 12 cm³.',
    visual: { kind: 'unites', focus: 'volume' },
    family: 'mesures',
  },
  {
    id: 'cm2',
    word: 'cm² (centimètre carré)',
    forms: ['cm²', 'centimètre carré', 'centimètres carrés'],
    definition:
      'L’unité d’**aire** : l’aire d’un carré de 1 cm de côté. Le petit 2 rappelle les 2 dimensions (longueur et largeur).',
    example: '6 cm², c’est la place de 6 petits carrés de 1 cm sur 1 cm.',
    visual: { kind: 'unites', focus: 'aire' },
    family: 'mesures',
  },
  {
    id: 'cm3',
    word: 'cm³ (centimètre cube)',
    forms: ['cm³', 'centimètre cube', 'centimètres cubes'],
    definition:
      'L’unité de **volume** : le volume d’un cube de 1 cm d’arête. Le petit 3 rappelle les 3 dimensions (longueur, largeur, hauteur).',
    example: '12 cm³, c’est la place de 12 petits cubes de 1 cm d’arête. 1 cm³ = 1 mL.',
    visual: { kind: 'unites', focus: 'volume' },
    family: 'mesures',
  },
];

export const glossaryEntry = (id: string) => GLOSSARY.find((g) => g.id === id);

/** Morceau de texte : simple texte, ou mot du glossaire. */
export type TermPart = { readonly text: string; readonly term?: string };

const LETTER = '\\p{L}\\p{N}';
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FORMS = GLOSSARY.flatMap((g) => g.forms.map((f) => ({ form: f, id: g.id }))).sort(
  (a, b) => b.form.length - a.form.length,
);
const TERM_RE = new RegExp(`(?<![${LETTER}])(${FORMS.map((f) => escape(f.form)).join('|')})(?![${LETTER}])`, 'giu');
const ID_OF = new Map(FORMS.map((f) => [f.form, f.id]));

/** Découpe un texte simple en morceaux, en repérant les mots du glossaire (le plus long d'abord). */
export function splitTerms(text: string): TermPart[] {
  const out: TermPart[] = [];
  let last = 0;
  for (const m of text.matchAll(TERM_RE)) {
    const id = ID_OF.get(m[0].toLowerCase());
    if (!id) continue;
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[0], term: id });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** Mots du glossaire présents dans des textes (sans doublon, dans l'ordre d'apparition). */
export function termsIn(texts: readonly string[]): string[] {
  const seen = new Set<string>();
  for (const t of texts) for (const p of splitTerms(normalizeUnits(t))) if (p.term) seen.add(p.term);
  return [...seen];
}

/** « cm^2 » (balisage des contenus) → « cm² » : les unités d'aire et de volume sont des mots. */
export const normalizeUnits = (text: string) =>
  text.replace(
    /(?<![\p{L}])(mm|cm|dm|m|dam|hm|km)\^([23])/gu,
    (_, u: string, n: string) => `${u}${n === '2' ? '²' : '³'}`,
  );
