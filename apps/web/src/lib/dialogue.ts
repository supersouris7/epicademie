/**
 * Banque de dialogues d'Academy Fighters : chaque réplique porte son expression de visage.
 * Personnalités :
 * - Alex, l'inventeur : geek enthousiaste, jeux de mots techno et maths.
 * - Lina, l'électrique : survoltée, compétitive, tout fait des étincelles.
 * - Pixel, le chat ninja : flegmatique et taquin, « miaou », fausse sagesse ninja.
 * - Le Golem des Équations : grand méchant théâtral et vantard, mauvais perdant.
 * - Le π-bot : petit robot fayot du Golem, bip-bip et zèle.
 * Pour tous les âges : drôle, jamais méchant envers le joueur.
 */
import type { HeroId } from '@questeo/shared';
import type { BossExpression, HeroExpression, PiBotHead } from '../design/assets.ts';

export interface Line<F extends string = string> {
  readonly text: string;
  readonly face: F;
}
type HeroLine = Line<HeroExpression>;
type BossLine = Line<BossExpression>;
type MobLine = Line<PiBotHead>;

const L = <F extends string>(face: F, text: string): Line<F> => ({ face, text });

// ——— Tirage sans répéter la dernière réplique d'une même liste ———

const lastPick = new Map<readonly unknown[], number>();
export function pick<T>(list: readonly T[], random: () => number = Math.random): T {
  if (list.length === 0) throw new Error('liste vide');
  const prev = lastPick.get(list);
  let i = Math.floor(random() * list.length);
  if (list.length > 1 && i === prev) i = (i + 1) % list.length;
  lastPick.set(list, i);
  return list[i] as T;
}

/** Les héros parlent d'eux au masculin ou au féminin (accords des répliques du boss). */
export const HERO_GENDER: Record<HeroId, 'garcon' | 'fille'> = {
  alex: 'garcon',
  tao: 'garcon',
  lina: 'fille',
  ayla: 'fille',
  pixel: 'garcon',
};

// ——— Voix des héros ———

export type HeroMoment =
  // Entraînement
  | 'start'
  | 'correct'
  | 'streak'
  | 'wrong'
  | 'retried'
  | 'lastOne'
  // Combat
  | 'comeback'
  | 'shoot'
  | 'hurt'
  | 'shield'
  | 'bossArrives'
  | 'rage'
  | 'victory'
  | 'defeat';

type Voice = Record<HeroMoment, readonly HeroLine[]>;

const ALEX: Voice = {
  start: [
    L('determine', 'Initialisation du cerveau… 100 % ! On y va !'),
    L('enthousiaste', 'Mode calcul activé !'),
    L('confiant', 'Prêt pour le loot ? Moi oui.'),
    L('clin-oeil', 'J’ai mis à jour mon cerveau ce matin.'),
  ],
  correct: [
    L('joie', 'Calcul lancé… résultat : victoire !'),
    L('clin-oeil', 'Bug ? Quel bug ?'),
    L('confiant', 'Mon processeur chauffe… de bonheur.'),
    L('enthousiaste', 'Ça, c’est de l’ingénierie !'),
    L('joie', 'Réponse validée, compilation réussie !'),
  ],
  streak: [
    L('rire', 'Je suis en surchauffe ! Ha ha !'),
    L('enthousiaste', 'Série infinie… enfin presque !'),
    L('confiant', 'Mon algorithme est imbattable.'),
  ],
  wrong: [
    L('surprise', 'Erreur 404 : bonne réponse introuvable.'),
    L('reflexion', 'Hmm… je recalibre.'),
    L('triste', 'Mon logiciel a planté…'),
    L('etourdi', 'Court-circuit dans les neurones !'),
  ],
  retried: [L('joie', 'Patch installé, problème réglé !'), L('clin-oeil', 'Version 2.0 : sans bug.')],
  lastOne: [L('determine', 'Dernière ligne de code !'), L('determine', 'On termine le programme en beauté.')],
  comeback: [
    L('confiant', 'Tu sais ce qui est petit ? Tes chances de gagner.'),
    L('clin-oeil', 'J’ai calculé tes points faibles. Il y en a beaucoup.'),
    L('rire', 'Un golem en pierre ? Je vais te mettre à jour, toi !'),
    L('determine', 'Mon canon à plasma a soif de bonnes réponses.'),
    L('confiant', 'Ta capuche, c’est pour cacher que tu révises en secret ?'),
  ],
  shoot: [
    L('enthousiaste', 'Plasma envoyé !'),
    L('joie', 'Livraison express de bonne réponse !'),
    L('clin-oeil', 'Ça, c’est de la physique appliquée.'),
    L('rire', 'Boum ! Théorème vérifié !'),
  ],
  hurt: [
    L('colere', 'Hé ! Ma veste était neuve !'),
    L('etourdi', 'Système… endommagé…'),
    L('triste', 'Ouille, ça pique en binaire.'),
    L('surprise', 'Je n’avais pas prévu ça dans mes plans !'),
  ],
  shield: [L('confiant', 'Bouclier activé. Prévu, calculé.'), L('clin-oeil', 'Raté ! Mon bouclier, c’est du solide.')],
  bossArrives: [L('surprise', 'Waouh… il est encore plus grand en vrai.'), L('determine', 'Enfin le grand méchant !')],
  rage: [L('surprise', 'Il… il surchauffe ?!'), L('determine', 'Plus il s’énerve, plus il fait d’erreurs !')],
  victory: [
    L('rire', 'Équation résolue ! Ha ha !'),
    L('enthousiaste', 'Victoire installée avec succès !'),
    L('affection', 'Merci Questy, on fait une sacrée équipe !'),
  ],
  defeat: [
    L('determine', 'Mise à jour nécessaire… je reviendrai plus fort !'),
    L('reflexion', 'Je vais améliorer mon algorithme.'),
  ],
};

const LINA: Voice = {
  start: [
    L('enthousiaste', 'Chargée à 100 % ! Ça va faire des étincelles !'),
    L('determine', 'Prête ? Moi je suis née prête !'),
    L('confiant', 'Allez, on électrise ces questions !'),
    L('clin-oeil', 'Je sens que ça va être électrique…'),
  ],
  correct: [
    L('joie', 'Zap ! Suivante !'),
    L('enthousiaste', 'Coup de foudre pour cette réponse !'),
    L('confiant', 'Trop rapide pour toi, la question !'),
    L('clin-oeil', 'Et de une, comme l’éclair !'),
    L('rire', 'Bzzzt ! Dans le mille !'),
  ],
  streak: [
    L('rire', 'Je suis survoltée !'),
    L('enthousiaste', 'Personne ne m’arrête, je suis à haute tension !'),
    L('confiant', 'Record battu ? Évidemment.'),
  ],
  wrong: [
    L('colere', 'Grr ! Petite panne de courant !'),
    L('surprise', 'Hein ?! Ça ne compte pas, j’étais pas chargée !'),
    L('reflexion', 'Ok, je rebranche mes neurones…'),
    L('triste', 'Fusible grillé…'),
  ],
  retried: [L('joie', 'Rechargée et réparée !'), L('confiant', 'Deuxième éclair, toujours plus fort !')],
  lastOne: [L('determine', 'Dernier coup de tonnerre !'), L('determine', 'On finit en beauté, à pleine puissance !')],
  comeback: [
    L('confiant', 'Ton cube, je vais le recharger… à coups d’éclairs !'),
    L('rire', 'Tu me fais même pas peur, tu fais à peine du 2 volts.'),
    L('determine', 'Prépare-toi, ça va être la tempête !'),
    L('clin-oeil', 'Ta cape va friser, je te préviens.'),
    L('confiant', 'Je suis la plus rapide de l’académie. Toi, t’es le plus… gris.'),
  ],
  shoot: [
    L('enthousiaste', 'Éclair envoyé !'),
    L('rire', 'Zzzap ! Prends ça !'),
    L('confiant', 'Haute tension, livraison immédiate !'),
    L('joie', 'Foudroyé !'),
  ],
  hurt: [
    L('colere', 'Hé ! On ne touche pas à mes cheveux !'),
    L('etourdi', 'Ça… ça m’a déchargée…'),
    L('surprise', 'Il a osé ?!'),
    L('triste', 'Aïe, batterie faible…'),
  ],
  shield: [L('confiant', 'Mon bouclier électrique te dit non !'), L('rire', 'Raté ! Ça grésille, hein ?')],
  bossArrives: [
    L('determine', 'Enfin un adversaire à ma taille !'),
    L('enthousiaste', 'Le grand boss ! Ça va chauffer !'),
  ],
  rage: [L('surprise', 'Il s’énerve ? Moi aussi je peux !'), L('determine', 'Rage contre foudre, on va voir !')],
  victory: [
    L('rire', 'K.O. électrique ! Trop facile !'),
    L('enthousiaste', 'Qui est la championne ? C’est moi !'),
    L('affection', 'Questy, t’es le meilleur coéquipier !'),
  ],
  defeat: [
    L('determine', 'Je recharge mes batteries… et je reviens plus forte !'),
    L('colere', 'Revanche ! Tout de suite !'),
  ],
};

const PIXEL: Voice = {
  start: [
    L('confiant', 'Miaou. Réveillez-moi quand c’est difficile.'),
    L('determine', 'Le ninja est prêt. Après la sieste.'),
    L('clin-oeil', 'Neuf vies, zéro stress.'),
    L('reflexion', 'Le calme avant la tempête… miaou.'),
  ],
  correct: [
    L('confiant', 'Miaou. Trop facile.'),
    L('clin-oeil', 'Le ninja frappe sans bruit.'),
    L('joie', 'Croquette méritée.'),
    L('confiant', 'Je l’avais vue venir, cette réponse.'),
    L('rire', 'Ronron de victoire.'),
  ],
  streak: [
    L('confiant', 'Je ronronne de satisfaction.'),
    L('rire', 'Même mes moustaches sont impressionnées.'),
    L('enthousiaste', 'Combo ninja !'),
  ],
  wrong: [
    L('surprise', 'J’ai fait exprès. Pour voir.'),
    L('triste', 'Même les chats ratent un saut parfois…'),
    L('reflexion', 'Hmm. Le ninja médite.'),
    L('etourdi', 'J’ai couru après ma queue, pardon.'),
  ],
  retried: [L('clin-oeil', 'Un chat retombe toujours sur ses pattes.'), L('confiant', 'Rattrapé. Comme une souris.')],
  lastOne: [L('determine', 'Dernier coup de griffe.'), L('confiant', 'Et après, une sieste bien méritée.')],
  comeback: [
    L('confiant', 'Ta pierre, je vais m’en servir comme griffoir.'),
    L('clin-oeil', 'Un golem ? J’en ai vu des plus gros dans la litière.'),
    L('reflexion', 'Le sage ninja dit : celui qui crie fort compte mal.'),
    L('rire', 'Ta capuche est presque aussi belle que la mienne. Presque.'),
    L('confiant', 'J’ai neuf vies. Toi, t’en as trois. Fais le calcul.'),
  ],
  shoot: [
    L('confiant', 'Boule ninja.'),
    L('clin-oeil', 'Shuriken de bonne réponse.'),
    L('joie', 'Miaou-boum !'),
    L('rire', 'Coup de patte magique !'),
  ],
  hurt: [
    L('colere', 'Pfff ! Mon pelage !'),
    L('surprise', 'Même pas mal. Bon, un peu.'),
    L('etourdi', 'Je vois des souris partout…'),
    L('triste', 'Une vie de moins. Il m’en reste huit.'),
  ],
  shield: [L('confiant', 'Bouclier patte-ninja. Raté.'), L('clin-oeil', 'Tu tapes comme une pelote de laine.')],
  bossArrives: [
    L('reflexion', 'Grand, gris, bruyant… comme un aspirateur.'),
    L('confiant', 'Ah. Le gros chat de l’histoire.'),
  ],
  rage: [
    L('surprise', 'Il fait son crise. Moi je fais ma sieste ? Non ?'),
    L('determine', 'Les ninjas adorent les colères : ça rend maladroit.'),
  ],
  victory: [
    L('rire', 'Miaou-victoire !'),
    L('confiant', 'Et maintenant… la sieste du champion.'),
    L('affection', 'Questy, tu mérites une caresse.'),
  ],
  defeat: [
    L('determine', 'Il me reste huit vies. Je reviendrai.'),
    L('reflexion', 'Le ninja apprend de ses erreurs… après la sieste.'),
  ],
};

/** Héros sans voix propre (à venir) : répliques générales. */
const GENERIC: Voice = { ...ALEX };

const VOICES: Record<HeroId, Voice> = { alex: ALEX, lina: LINA, pixel: PIXEL, tao: GENERIC, ayla: GENERIC };

export const heroSays = (hero: HeroId, moment: HeroMoment): HeroLine => pick(VOICES[hero][moment]);

// ——— Le Golem des Équations ———

export type BossMoment =
  | 'taunt'
  | 'counter'
  | 'onHit'
  | 'onHeroMiss'
  | 'onShield'
  | 'arrival'
  | 'rageDebut'
  | 'rageMontee'
  | 'rageCri'
  | 'ko'
  | 'wins';

const GOLEM: Record<BossMoment, readonly BossLine[]> = {
  taunt: [
    L('moqueur', 'Haha ! Personne ne passe ce chapitre sans perdre ses cœurs !'),
    L('menace', 'Je suis le maître des maths. Toi, t’es le maître des… brouillons ?'),
    L('rire', 'Tu comptes encore sur tes doigts ? Hahaha !'),
    L('clin-oeil', 'Mes mobs ont faim de mauvaises réponses.'),
    L('concentre', 'J’ai préparé des questions spéciales. Spécialement dures.'),
    L('moqueur', 'Même ma capuche est plus maligne que toi !'),
  ],
  counter: [
    L('colere', 'QUOI ?! On ne parle pas comme ça au Golem !'),
    L('perplexe', 'Euh… j’avais préparé une réponse… attends…'),
    L('furieux', 'Tu vas regretter cette vanne, petit !'),
    L('moqueur', 'Parle toujours, tes cœurs vont bientôt se taire.'),
    L('rire', 'Hahaha ! Mignon. Allez, mes mobs, à table !'),
  ],
  onHit: [
    L('surprise', 'Hé ! Ça chatouille !'),
    L('inquiet', 'Il… il sait calculer ?!'),
    L('colere', 'Ma belle cape !'),
    L('triste', 'Ça, c’était pas dans mon plan…'),
    L('furieux', 'Tu vas me le payer en fractions !'),
  ],
  onHeroMiss: [
    L('rire', 'Hahaha ! Mauvaise réponse !'),
    L('moqueur', 'Tu veux une calculatrice ? Ah non, c’est moi qui les ai !'),
    L('clin-oeil', 'Merci pour le cœur, je le garde en souvenir.'),
    L('rire', 'Même mon π-bot savait celle-là !'),
  ],
  onShield: [L('perplexe', 'Un bouclier ?! Ça ne compte pas !'), L('colere', 'Tricheur ! Enfin… malin.')],
  arrival: [
    L('moqueur', 'Bravo pour mes petits robots. Maintenant… c’est MOI !'),
    L('menace', 'Tu as battu mes mobs ? Ils n’étaient que l’échauffement.'),
    L('clin-oeil', 'Tiens, tiens… le héros a survécu. Plus pour longtemps !'),
  ],
  rageDebut: [
    L('colere', 'Grrr… Tu m’as touché deux fois ? Tu vas le regretter…'),
    L('furieux', 'Plus personne ne se moque de mes équations !'),
  ],
  rageMontee: [
    L('furieux', 'Je sens… la puissance… des opérations… MONTER !'),
    L('furieux', 'Plus… Moins… Fois… Divisé… TOUT EXPLOSE !'),
  ],
  rageCri: [
    L('furieux', 'MODE RAGE ! Plus personne ne m’arrête !'),
    L('furieux', 'AAARGH ! Je suis le GOLEM DES ÉQUATIONS !'),
  ],
  ko: [
    L('ko', 'Impossible… battu par un élève…'),
    L('ko', 'Je… reviendrai… avec des fractions…'),
    L('triste', 'Ma réputation… en miettes…'),
  ],
  wins: [
    L('rire', 'Hahaha ! Retourne réviser !'),
    L('moqueur', 'Reviens quand tu sauras tes tables !'),
    L('clin-oeil', 'C’était trop facile. Allez, entraîne-toi un peu.'),
  ],
};

export const bossSays = (moment: BossMoment): BossLine => pick(GOLEM[moment]);

// ——— Le π-bot ———

export type MobMoment = 'appear' | 'onHit' | 'onHeroMiss';
const PI_BOT: Record<MobMoment, readonly MobLine[]> = {
  appear: [
    L('menace', 'Bip bip ! Intrus détecté !'),
    L('moqueur', 'Le patron dit que tu vas perdre. Bip !'),
    L('joie', 'Π-bot, au rapport ! Prêt à faire des bêtises !'),
    L('colere', 'Halte ! Contrôle des tables de multiplication !'),
  ],
  onHit: [
    L('etourdi', 'Bip… bop… bzzz…'),
    L('triste', 'Patron, je rentre au garage…'),
    L('surprise', 'Erreur système ! Erreur système !'),
    L('dort', 'Mise en veille… zzz…'),
  ],
  onHeroMiss: [
    L('rire', 'Bip ! Bip ! Hihihi !'),
    L('moqueur', 'Je vais le dire au patron !'),
    L('amour', 'J’adore les mauvaises réponses !'),
    L('idee', 'J’ai une idée : tu devrais réviser !'),
  ],
};
export const mobSays = (moment: MobMoment): MobLine => pick(PI_BOT[moment]);

// ——— Questy ———

export type QuestyMoment = 'faceOff' | 'arrival' | 'hubAlone' | 'hubFriends';
const QUESTY: Record<QuestyMoment, readonly string[]> = {
  faceOff: [
    'Ne l’écoute pas ! Chaque bonne réponse, c’est un tir. 4 mobs, puis lui.',
    'Il fait le malin… Prends ton temps et vise juste !',
    'Ton entraînement va payer : montre-lui ce que tu sais !',
    'Une erreur ? Pas grave, il te reste tes cœurs. On y va !',
  ],
  arrival: [
    'Bravo, tous les mobs sont battus ! Presque fini : plus que lui !',
    'Le voilà ! 3 bonnes réponses et il est à terre !',
  ],
  hubAlone: [
    'Personne d’autre n’est connecté pour l’instant. Parfait pour s’entraîner !',
    'Calme plat aujourd’hui. On en profite pour gagner du loot ?',
  ],
  hubFriends: ['Regarde qui est là :', 'Tes amis sont connectés :', 'Du monde à l’académie :'],
};
export const questySays = (moment: QuestyMoment): string => pick(QUESTY[moment]);

// ——— Échanges aller-retour (face-à-face) ———

export type Speaker = 'boss' | 'hero';
export interface Exchange {
  readonly speaker: Speaker;
  readonly line: Line;
}

/**
 * Vannes du face-à-face : le boss provoque (réplique liée au chapitre), le héros répond avec sa
 * personnalité, le boss réplique, le héros a le dernier mot. Tirées au hasard : jamais le même échange.
 */
export function faceOffExchange(hero: HeroId, bossOpening: string): Exchange[] {
  const openFace = pick(GOLEM.taunt).face;
  return [
    { speaker: 'boss', line: { text: bossOpening, face: openFace } },
    { speaker: 'hero', line: heroSays(hero, 'comeback') },
    { speaker: 'boss', line: bossSays('counter') },
    { speaker: 'hero', line: heroSays(hero, 'start') },
  ];
}
