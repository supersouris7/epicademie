import { a } from './kinds.ts';

/** Catalogue des images — Kit combat : héros */

export interface CharacterSpec {
  readonly id: string;
  readonly name: string;
  /** Rôle, pour la carte du héros. */
  readonly role: string;
  readonly look: string;
  readonly weapon: string;
}

/** Cinq héros très différents (silhouette, style, arme) : deux garçons, deux filles, un chat. */
export const CHARACTERS: readonly CharacterSpec[] = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'L’inventeur',
    look: 'Alex, garçon de 12 ans, cheveux roux en pics avec des mèches rasées sur le côté, yeux bleus, pansement sur la joue, foulard jaune, veste blanche et dorée, pantalon violet, gants noirs sans doigts, grosses baskets blanches et dorées, sac à dos à deux batteries de plasma lumineuses',
    weapon: 'canon à plasma blanc et doré tenu à deux mains, bouche ronde où tourbillonne une énergie violette',
  },
  {
    id: 'tao',
    name: 'Tao',
    role: 'L’explorateur',
    look: 'Tao, garçon de 12 ans, mince et agile, cheveux noirs raides en épis, bandana vert noué sur le front aux pans qui volent, yeux en amande pétillants, grand sourire, gilet sans manches beige sable à poches multiples sur t-shirt vert forêt, short cargo marron, grosses chaussures de randonnée orange, boussole dorée autour du cou, petit sac à dos avec une corde enroulée',
    weapon:
      'arbalète-tech compacte vert et or tenue à deux mains, avec une lunette de visée ronde et des branches recourbées lumineuses',
  },
  {
    id: 'lina',
    name: 'Lina',
    role: 'L’électrique',
    look: 'Lina, fille de 12 ans, longs cheveux violets en queue de cheval haute, barrette étoile dorée, boucles d’oreilles étoiles, yeux violets, veste courte blanche et violette à liserés dorés, jupe plissée violette, chaussettes rayées violettes, baskets blanches à étoile, gants violets chargés d’éclairs',
    weapon: 'éclairs violets qu’elle lance de ses poings (boule d’énergie)',
  },
  {
    id: 'ayla',
    name: 'Ayla',
    role: 'La graffeuse',
    look: 'Ayla, fille de 12 ans, petite et vive, peau claire avec des taches de rousseur, cheveux violets courts en coupe asymétrique avec une longue mèche turquoise, casque audio jaune fluo autour du cou, sourire espiègle, veste bomber noire couverte de patchs colorés (formes, étoiles, éclairs), t-shirt jaune, pantalon baggy gris, rangers noires lacées de turquoise, éclaboussures de peinture turquoise et jaune sur les vêtements',
    weapon:
      'bombe-blaster : pistolet de peinture turquoise et jaune monté sur une bombe aérosol géante, buse ronde à l’avant',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Le chat ninja',
    look: 'Pixel, chat gris tigré debout sur deux pattes, capuche et longue écharpe violettes, yeux jaunes, tenue de ninja noire à liserés dorés, sacoche violette à patte de chat, queue grise touffue',
    weapon: 'boule d’énergie violette lancée d’une patte, bouclier violet à empreinte de patte',
  },
];

export const ANIMATION_STATES = ['idle', 'run', 'shoot', 'hurt', 'victory', 'defeat'] as const;
/** États affichables : ceux de la planche de poses, plus le saut et le bouclier (livrés pour Alex). */
export type AnimationState = (typeof ANIMATION_STATES)[number] | 'jump' | 'shield';

/** Expressions d'Alex, livrées en têtes séparées (characters/alex/head-<expression>.webp). */
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

export const POSES: Record<(typeof ANIMATION_STATES)[number], string> = {
  idle: 'attente : debout, détendu, arme prête',
  run: 'course : grande foulée vers la droite, un pied décollé, buste penché en avant',
  shoot: 'tir : arme pointée vers la droite, petit éclair à la bouche du canon',
  hurt: 'touché : recule d’un pas, grimace comique (dessin animé, aucune blessure)',
  victory: 'victoire : saute de joie, poing ou patte levé',
  defeat: 'défaite : assis par terre, étourdi, petites spirales au-dessus de la tête',
};

export const characterAssets = CHARACTERS.flatMap((ch) => {
  const base = `characters/${ch.id}`;
  const ref = { reference: `characters-${ch.id}-model-sheet`, fallback: 'placeholder-character' } as const;
  return [
    a(
      'sheet',
      `${base}/model-sheet.webp`,
      `${ch.name} — fiche de modèle`,
      `${ch.look}. Arme : ${ch.weapon}. Fiche de modèle : 4 vues alignées (face, trois quarts gauche, profil, dos), plus l’arme seule en grand à droite`,
      'Référence de cohérence (non affichée).',
      1,
    ),
    a(
      'portrait',
      `${base}/portrait.webp`,
      `${ch.name} — portrait`,
      `${ch.look}. Expression énergique.`,
      'Avatar et carte du héros.',
      1,
      ref,
    ),
    ...ANIMATION_STATES.map((state) =>
      a(
        'pose',
        `${base}/pose-${state}.webp`,
        `${ch.name} — pose ${state}`,
        `${ch.name} (exactement comme sur sa fiche de modèle), avec son arme. Pose ${POSES[state]}`,
        'Combat : une image par état, enchaînées par animation.',
        1,
        { ...ref, sheet: `${ch.id}-poses` },
      ),
    ),
    // Alex, Lina et Pixel : poses et expressions livrées une à une (packs du 18/11/2026).
    ...(['alex', 'lina', 'pixel'].includes(ch.id)
      ? [
          ...(['jump', 'shield'] as const).map((state) =>
            a(
              'pose',
              `${base}/pose-${state}.webp`,
              `${ch.name} — pose ${state}`,
              `${ch.name}, pose ${state}`,
              'Combat.',
              1,
              ref,
            ),
          ),
          ...HERO_EXPRESSIONS.map((e) =>
            a(
              'expression',
              `${base}/head-${e}.webp`,
              `${ch.name} — ${e}`,
              `${ch.name}, tête seule, expression ${e}`,
              'Réactions pendant le combat.',
              1,
              ref,
            ),
          ),
        ]
      : []),
  ];
});

/** « de Tao », « d’Alex », « d’Ayla ». */
export const de = (name: string) => (/^[AEIOUYÀÉ]/i.test(name) ? `d’${name}` : `de ${name}`);

export const weaponAssets = CHARACTERS.map((ch) =>
  a(
    'weapon',
    `weapons/${ch.id}.webp`,
    `Arme ${de(ch.name)}`,
    `arme ${de(ch.name)} : ${ch.weapon}`,
    'Carte du héros, arsenal.',
    2,
    {
      sheet: 'armes',
    },
  ),
);
