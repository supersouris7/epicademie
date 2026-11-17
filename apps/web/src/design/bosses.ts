import type { Chapter, DomainId } from '@questeo/content';

/** Un boss par domaine des maths, recoloré selon le chapitre (docs/SPEC.md §6.2 bis). */
export interface BossIdentity {
  readonly id: string;
  readonly name: string;
  /** Mobs envoyés par ce boss (identifiants de bosses/minions). */
  readonly mobs: readonly string[];
  /** Arène (environments/arenas). */
  readonly arena: string;
  /** Couleurs du décor de remplacement tant que l'arène n'est pas livrée. */
  readonly sky: readonly [string, string];
}

export const DOMAIN_BOSSES: Record<DomainId, BossIdentity> = {
  nombres: {
    id: 'golem-des-equations',
    name: 'Golem des Équations',
    mobs: ['calculatrice', 'cube-bot', 'bloc-code'],
    arena: 'nombres',
    sky: ['#3b1d6e', '#8a5cd6'],
  },
  geometrie: {
    id: 'geomatrix',
    name: 'Géomatrix',
    mobs: ['equerre', 'compas', 'cube-bot'],
    arena: 'geometrie',
    sky: ['#1b2a6b', '#5a7be0'],
  },
  donnees: {
    id: 'probabot',
    name: 'Probabot',
    mobs: ['de', 'camembert', 'calculatrice'],
    arena: 'donnees',
    sky: ['#4a2a12', '#d69a3c'],
  },
  fonctions: {
    id: 'courbix',
    name: 'Courbix',
    mobs: ['courbe', 'camembert', 'calculatrice'],
    arena: 'fonctions',
    sky: ['#0b1d3a', '#1f8fb0'],
  },
  informatique: {
    id: 'ia-des-connaissances',
    name: 'IA des Connaissances',
    mobs: ['bug', 'bloc-code', 'cube-bot'],
    arena: 'informatique',
    sky: ['#081a2a', '#2a7a9a'],
  },
};

/** Teinte du boss selon le chapitre : deux chapitres d'un même domaine n'ont pas le même boss à l'écran. */
const CHAPTER_HUE: Record<string, number> = {
  'm5-relatifs': 0,
  'm5-fractions': 150,
  'm5-proportionnalite': 0,
};

export const bossOf = (chapter: Chapter) => DOMAIN_BOSSES[chapter.domain];
export const bossFilter = (chapterId: string) => {
  const hue = CHAPTER_HUE[chapterId] ?? 0;
  return hue ? `hue-rotate(${hue}deg)` : undefined;
};
/** Mob affiché pour la question n°`turn` (cosmétique). */
export const mobOf = (boss: BossIdentity, turn: number) => boss.mobs[turn % boss.mobs.length] ?? 'calculatrice';
