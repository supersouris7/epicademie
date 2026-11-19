/**
 * Catalogue central des assets graphiques d'Academy Fighters.
 *
 * Source unique pour :
 * - l'arborescence (public/assets et assets-src/originals) ;
 * - le guide de génération ChatGPT (docs/ASSETS-CHATGPT.md, généré par scripts/assets/plan.ts) ;
 * - l'affichage (`assetSrc(id)` : image finale si livrée, sinon SVG provisoire).
 *
 * Règle : aucune image ne contient de texte (sauf le logo et le badge XP). Les libellés sont écrits
 * par l'application, pour rester lisibles et modifiables.
 *
 * Statuts : `disponible` (image finale présente), `provisoire` (SVG de remplacement), `manquant`.
 *
 * Le catalogue est réparti par famille dans `catalog/` ; ce fichier les rassemble et fournit
 * la recherche d'une image (`assetSrc`).
 */
import { AVAILABLE } from './assets.available.ts';
import { SVG_ASSETS } from './assets.generated.ts';
import { envAssets } from './catalog/arenas.ts';
import { bossAssets, empereurAssets, golemExtras, minionAssets, piBotAssets } from './catalog/bosses.ts';
import { brandAssets } from './catalog/brand.ts';
import { effectAssets } from './catalog/effects.ts';
import { type AnimationState, characterAssets, weaponAssets } from './catalog/heroes.ts';
import { iconAssets } from './catalog/icons.ts';
import { type AssetStatus, KINDS, type PlannedAsset, type Priority } from './catalog/kinds.ts';
import { keyArt, questyAssets } from './catalog/questy.ts';
import { uiAssets } from './catalog/ui.ts';

export {
  type AssetStatus,
  type Priority,
  type GenSize,
  type AssetKind,
  KINDS,
  type KindId,
  type PlannedAsset,
} from './catalog/kinds.ts';
export { QUESTY_LOOK, type QuestyMood } from './catalog/questy.ts';
export {
  type CharacterSpec,
  CHARACTERS,
  ANIMATION_STATES,
  type AnimationState,
  HERO_EXPRESSIONS,
  type HeroExpression,
} from './catalog/heroes.ts';
export { BOSS_EXPRESSIONS, type BossExpression, PI_BOT_POSES, PI_BOT_HEADS, type PiBotHead } from './catalog/bosses.ts';
export { ARENA_VARIANTS } from './catalog/arenas.ts';

export const PLANNED_ASSETS: readonly PlannedAsset[] = [
  ...brandAssets,
  ...uiAssets,
  ...iconAssets,
  ...questyAssets,
  ...characterAssets,
  ...weaponAssets,
  ...bossAssets,
  ...golemExtras,
  ...minionAssets,
  ...piBotAssets,
  ...empereurAssets,
  ...effectAssets,
  ...envAssets,
  keyArt,
];

// ─── Manifeste ─────────────────────────────────────────────────────────────

export interface ManifestEntry {
  readonly id: string;
  readonly category: string;
  readonly path: string;
  readonly format: 'svg' | 'webp' | 'composant';
  readonly size: string;
  readonly usage: string;
  readonly status: AssetStatus;
  readonly priority?: Priority;
}

const available = new Set<string>(AVAILABLE);
const dir = (file: string) => file.split('/').slice(0, -1).join('/');

/** Manifeste complet (page de prévisualisation, tests). */
export const MANIFEST: readonly ManifestEntry[] = [
  ...PLANNED_ASSETS.map((p): ManifestEntry => {
    const k = KINDS[p.kind];
    return {
      id: p.id,
      category: dir(p.file),
      path: `/assets/${p.file}`,
      format: 'webp',
      size: `${k.final[0]}×${k.final[1]}`,
      usage: p.usage,
      status: available.has(p.file) ? 'disponible' : p.fallback ? 'provisoire' : 'manquant',
      priority: p.priority,
    };
  }),
  ...Object.entries(SVG_ASSETS).map(([id, s]): ManifestEntry => ({
    id: `svg-${id}`,
    category: s.category,
    path: s.path,
    format: 'svg',
    size: s.viewBox,
    usage: `${s.usage} (remplaçant vectoriel provisoire)`,
    status: 'provisoire',
  })),
  {
    id: 'questy-led',
    category: 'characters/questy',
    path: 'src/components/mascot/Questy.tsx',
    format: 'composant',
    size: 'vectoriel',
    usage: 'Questy LED dessiné en code : remplaçant des têtes de Questy tant qu’elles ne sont pas livrées.',
    status: 'provisoire',
  },
];

const byId = new Map(PLANNED_ASSETS.map((p) => [p.id, p]));

/** URL de l'image finale si elle est livrée (sans remplaçant provisoire), sinon null. */
export function deliveredSrc(id: string): string | null {
  const p = byId.get(id);
  return p && available.has(p.file) ? `/assets/${p.file}` : null;
}

/** Pose d'un héros : la pose demandée si elle est livrée, sinon sa pose d'attente, sinon le provisoire. */
export const heroPoseSrc = (hero: string, state: AnimationState): string | null =>
  deliveredSrc(`characters-${hero}-pose-${state}`) ??
  deliveredSrc(`characters-${hero}-pose-idle`) ??
  assetSrc(`characters-${hero}-pose-${state}`);

/** URL à afficher : image finale si livrée, sinon SVG provisoire, sinon null. */
export function assetSrc(id: string): string | null {
  const p = byId.get(id);
  if (!p) return null;
  if (available.has(p.file)) return `/assets/${p.file}`;
  return p.fallback ? SVG_ASSETS[p.fallback].path : null;
}
