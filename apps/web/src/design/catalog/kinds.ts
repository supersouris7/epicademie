import { SVG_ASSETS } from '../assets.generated.ts';

/** Catalogue des images — Types et formats d'images du catalogue, constructeur `a()`. */

export type AssetStatus = 'disponible' | 'provisoire' | 'manquant';
/** 1 = interface actuelle, 2 = prochains modes (boss, personnages), 3 = plus tard. */
export type Priority = 1 | 2 | 3;

/** Formats de génération acceptés par les modèles GPT Image. */
export type GenSize = '1024x1024' | '1536x1024' | '1024x1536';

export interface AssetKind {
  readonly gen: GenSize;
  /** Dimensions finales en pixels (WebP), après détourage et redimensionnement. */
  readonly final: readonly [number, number];
  /** Consignes de cadrage communes à ce type d'asset. */
  readonly framing: string;
  /** Fond opaque (illustration plein cadre) au lieu d'un fond transparent. */
  readonly opaque?: boolean;
  /** Découpe en 9 parts (cadres et boutons étirables). */
  readonly nineSlice?: boolean;
  /** Grille utilisée quand plusieurs assets de ce type sont générés sur une même planche. */
  readonly grid?: { readonly gen: GenSize; readonly cols: number; readonly rows: number };
}

export const NINE_SLICE =
  'forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément';

export const KINDS = {
  icon: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'objet seul, centré, vu de face, marge de 10 % autour',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  glyph: {
    gen: '1024x1024',
    final: [256, 256],
    framing:
      'pictogramme blanc plein à contour violet très foncé épais, centré, vu de face, sans fond ni tuile, marge de 15 % autour',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  logo: {
    gen: '1536x1024',
    final: [1200, 800],
    framing: 'logo centré, marge de 8 %, lettrage parfaitement lisible et orthographié exactement',
  },
  keyart: {
    gen: '1536x1024',
    final: [1536, 1024],
    framing: 'illustration plein cadre, composition lisible en petit, sans aucun texte ni interface',
    opaque: true,
  },
  background: {
    gen: '1536x1024',
    final: [1536, 1024],
    framing:
      'décor plein cadre sans personnage ni texte, détails concentrés en haut et sur les côtés, zone centrale calme et un peu floue pour poser des menus par-dessus',
    opaque: true,
  },
  frame: {
    gen: '1536x1024',
    final: [768, 512],
    framing: `cadre d’interface vide, ${NINE_SLICE}`,
    nineSlice: true,
  },
  button: {
    gen: '1536x1024',
    final: [768, 256],
    framing: `bouton capsule vide (sans texte ni icône), très large et peu haut (rapport 3:1), ${NINE_SLICE}`,
    nineSlice: true,
    grid: { gen: '1536x1024', cols: 2, rows: 3 },
  },
  tile: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'tuile carrée aux coins arrondis, vide (sans icône), vue de face, marge de 8 %',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  ring: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'anneau de cadre rond vu de face, centre entièrement vide (transparent), marge de 6 %',
  },
  card: {
    gen: '1024x1536',
    final: [384, 576],
    framing: 'cadre de carte de collection vu de face, intérieur vide (transparent), bandeau vide en bas pour le nom',
  },
  mascot: {
    gen: '1024x1024',
    final: [512, 512],
    framing: 'Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur',
  },
  head: {
    gen: '1024x1024',
    final: [384, 384],
    framing:
      'tête seule de face (sans le corps), centrée, occupe 80 % de sa case, même angle et même taille d’une tête à l’autre',
    grid: { gen: '1536x1024', cols: 3, rows: 2 },
  },
  sheet: {
    gen: '1536x1024',
    final: [1536, 1024],
    framing:
      'fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol',
  },
  portrait: {
    gen: '1024x1024',
    final: [512, 512],
    framing:
      'tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond)',
  },
  expression: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'même cadrage exact que le portrait de référence, seule l’expression change',
  },
  pose: {
    gen: '1536x1024',
    final: [512, 512],
    framing:
      'personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases',
    grid: { gen: '1536x1024', cols: 3, rows: 2 },
  },
  boss: {
    gen: '1536x1024',
    final: [512, 512],
    framing:
      'boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases',
    grid: { gen: '1536x1024', cols: 2, rows: 2 },
  },
  minion: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'petit ennemi en pied, tourné vers la gauche, base à 90 % de sa case, occupe 70 % de la case',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  weapon: {
    gen: '1536x1024',
    final: [384, 256],
    framing:
      'arme seule vue de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur de sa case',
    grid: { gen: '1536x1024', cols: 3, rows: 2 },
  },
  projectile: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'projectile en mouvement vers la droite avec courte traînée à gauche, centré',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  effect: {
    gen: '1024x1024',
    final: [512, 512],
    framing: 'effet centré, bords nets (pas de grand halo flou)',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  // Arènes : 5 décors fournis par le client (paysage 16:9). Les autres cadrages sont tirés de la
  // même image par `pnpm --filter @questeo/web assets:arenas` (jamais d'étirement ; voir ARENA_VARIANTS).
  // L'affichage prend la variante dont les proportions sont les plus proches du cadre.
  arena: {
    gen: '1536x1024',
    final: [1600, 900],
    framing: 'décor 16:9 fourni par le client, sol dégagé au centre ; image entière',
    opaque: true,
  },
  arenaTall: {
    gen: '1024x1536',
    final: [1080, 1200],
    framing: 'cadrage 9:10 (smartphone, fenêtre étroite) : image pleine hauteur, rognée sur les côtés',
    opaque: true,
  },
  arenaWide: {
    gen: '1536x1024',
    final: [1920, 738],
    framing: 'cadrage 2,6:1 (tablette, ordinateur) : bande centrée sur l’horizon et le sol',
    opaque: true,
  },
  arenaPano: {
    gen: '1536x1024',
    final: [2640, 600],
    framing:
      'panorama 4,4:1 (écran large) : cadrage 2,6:1 prolongé de chaque côté par miroir, flou progressif et assombrissement',
    opaque: true,
  },
  floor: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords',
    opaque: true,
  },
  /** Grand boss en plein écran (illustration carrée détourée). */
  bossSquare: {
    gen: '1024x1024',
    final: [1024, 1024],
    framing: 'personnage en pied centré, de face, fond transparent, halo et effets autour de lui',
  },
  /** Bannière large (3:1) en haut d'un écran. */
  banner: {
    gen: '1536x1024',
    final: [1536, 512],
    framing: 'bannière très large, sujet au centre, fond peint jusqu’aux bords, sans texte',
    opaque: true,
  },
  /** Fond large (3:1) d'un rectangle de l'interface, affiché en object-cover. */
  panelBackdrop: {
    gen: '1536x1024',
    final: [1086, 362],
    framing: 'fond peint très large, motif centré, sans texte',
    opaque: true,
  },
  bossArt: {
    gen: '1536x1024',
    final: [1200, 800],
    framing: 'personnage en pied centré, de face, fond transparent, halo et effets autour de lui',
  },
  platform: {
    gen: '1536x1024',
    final: [512, 256],
    framing: 'plateforme flottante vue de face légèrement plongée, centrée, occupe 85 % de la largeur',
  },
  prop: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'objet de décor posé au sol, trois quarts face, base à 90 % de sa case',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
} as const satisfies Record<string, AssetKind>;

export type KindId = keyof typeof KINDS;

export interface PlannedAsset {
  readonly id: string;
  readonly kind: KindId;
  /** Chemin final servi (WebP), relatif à public/assets. */
  readonly file: string;
  readonly name: string;
  /** Description visuelle précise pour le générateur d'images. */
  readonly prompt: string;
  readonly usage: string;
  readonly priority: Priority;
  /** SVG provisoire affiché en attendant. */
  readonly fallback?: keyof typeof SVG_ASSETS;
  /** Asset à joindre comme référence (identifiant). */
  readonly reference?: string;
  /** Planche de génération groupée (découpée à l'import selon la grille du type). */
  readonly sheet?: string;
}

export type Extra = Partial<Pick<PlannedAsset, 'fallback' | 'reference' | 'sheet'>>;

export const a = (
  kind: KindId,
  file: string,
  name: string,
  prompt: string,
  usage: string,
  priority: Priority,
  extra: Extra = {},
): PlannedAsset => ({
  id: file.replace(/\.webp$/, '').replace(/\//g, '-'),
  kind,
  file,
  name,
  prompt,
  usage,
  priority,
  ...extra,
});

/** Découpe une liste en planches nommées `nom-1`, `nom-2`… de `size` éléments. */
export const chunk = (name: string, index: number, size: number, total: number) =>
  total > size ? `${name}-${Math.floor(index / size) + 1}` : name;
