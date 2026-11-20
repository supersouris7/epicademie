import { a } from './kinds.ts';

/**
 * Catalogue des images — héros (refonte du 20/11/2026 : planches fournies par l'utilisateur,
 * découpées par `assets:sprites`). Deux héros : Alex et Lina. Pour chacun, deux animations
 * (sur place, victoire : 8 images en bande), cinq poses fixes et douze expressions.
 */

export interface CharacterSpec {
  readonly id: string;
  readonly name: string;
  /** Rôle, pour la carte du héros. */
  readonly role: string;
  readonly look: string;
  readonly weapon: string;
}

export const CHARACTERS: readonly CharacterSpec[] = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'L’inventeur',
    look: 'Alex, garçon aux cheveux châtains en épis, lunettes d’aviateur dorées sur un bandeau violet, pansement sur la joue, veste crème orange et violette, pantalon cargo violet, baskets violettes et orange',
    weapon: 'pistolet-blaster cyan et doré',
  },
  {
    id: 'lina',
    name: 'Lina',
    role: 'L’électrique',
    look: 'Lina, fille aux longs cheveux violets en queue de cheval, barrette étoile dorée, veste violette et blanche à liserés dorés, jupe plissée violette, chaussettes rayées, baskets blanches à étoile',
    weapon: 'gants chargés d’éclairs violets (boule d’énergie, bouclier)',
  },
];

/** Animations en bande de 8 images (planches « sur place » et « victoire »). */
export const HERO_ANIMS = ['idle', 'victory'] as const;
/** Poses fixes (planche de 5 poses). */
export const HERO_POSES = ['run', 'shoot', 'shield', 'hurt', 'defeat'] as const;
/** États affichables d'un héros : une animation ou une pose fixe. */
export type AnimationState = (typeof HERO_ANIMS)[number] | (typeof HERO_POSES)[number];

/** Expressions livrées en têtes séparées (characters/<héros>/head-<expression>.webp). */
export const HERO_EXPRESSIONS = [
  'joie',
  'rire',
  'enthousiaste',
  'confiant',
  'determine',
  'clin-oeil',
  'surprise',
  'reflexion',
  'affection',
  'colere',
  'triste',
  'etourdi',
] as const;
export type HeroExpression = (typeof HERO_EXPRESSIONS)[number];

const POSE_LABELS: Record<(typeof HERO_POSES)[number], string> = {
  run: 'course',
  shoot: 'tir',
  shield: 'bouclier',
  hurt: 'touché',
  defeat: 'K.-O.',
};

export const characterAssets = CHARACTERS.flatMap((ch) => {
  const base = `characters/${ch.id}`;
  return [
    ...HERO_ANIMS.map((anim) =>
      a(
        'pose',
        `${base}/anim-${anim}.webp`,
        `${ch.name} — animation ${anim === 'idle' ? 'sur place' : 'victoire'}`,
        `${ch.look}. Animation ${anim} en 8 images.`,
        'Combat et accueil : bande de 8 images jouée en boucle.',
        1,
      ),
    ),
    ...HERO_POSES.map((pose) =>
      a(
        'pose',
        `${base}/pose-${pose}.webp`,
        `${ch.name} — pose ${POSE_LABELS[pose]}`,
        `${ch.look}. Pose ${POSE_LABELS[pose]}.`,
        'Combat : pose fixe.',
        1,
      ),
    ),
    ...HERO_EXPRESSIONS.map((e) =>
      a(
        'expression',
        `${base}/head-${e}.webp`,
        `${ch.name} — ${e}`,
        `${ch.name}, tête seule, expression ${e}`,
        'Réactions pendant le combat, portrait du HUD.',
        1,
      ),
    ),
  ];
});
