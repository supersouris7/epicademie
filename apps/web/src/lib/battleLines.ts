/** Textes et durées des scènes du combat de boss. */

/** Mots de Questy avant le combat : un tiré au hasard. */
export const INTRO_LINES = [
  'Chaque bonne réponse, c’est un tir ! 7 mobs, puis le boss.',
  'Prends ton temps et vise juste : 7 mobs, puis le boss !',
  'Ton entraînement va payer : montre-leur ce que tu sais !',
  'Une erreur ? Pas grave : il te reste tes cœurs. On y va !',
] as const;
export const randomIntroLine = () => INTRO_LINES[Math.floor(Math.random() * INTRO_LINES.length)] ?? INTRO_LINES[0];

/** Secondes laissées pour relancer le combat après une défaite. */
export const RETRY_SECONDS = 5;
