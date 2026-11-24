/** Textes et durées des scènes du combat de boss. */
import { accord, pickAt, type Profile } from '@epicademie/shared';

type Gender = Profile['gender'];

/** Secondes laissées pour relancer le combat après une défaite. */
export const RETRY_SECONDS = 5;

/** Titre de chapitre dans une phrase : minuscule en tête (« Fractions » → « fractions »), sigles gardés. */
export const inSentence = (title: string) =>
  /^[A-ZÉ][a-zé]/.test(title) ? title.charAt(0).toLowerCase() + title.slice(1) : title;

/**
 * Gros plan du boss à l'entrée de la matière : il provoque, selon les victoires déjà remportées
 * contre lui dans cette matière. `r` ∈ [0, 1[ choisit la réplique (tirée une fois à l'affichage).
 */
export function subjectTaunt(wins: number, gender: Gender, r: number, subject = 'maths'): string {
  const vaincu = accord(gender, 'vaincu', 'vaincue');
  // Hors maths : répliques sans calcul (les boss de ces matières n'ont pas le cube des opérations).
  if (subject !== 'maths')
    return pickAt(
      wins === 0
        ? [
            'Hahaha ! Un nouveau challenger ? Choisis ton chapitre… et prépare-toi à perdre tes cœurs !',
            'Mes mobs n’ont pas mangé de héros depuis longtemps… Choisis ton chapitre, si tu l’oses !',
          ]
        : [
            `Tu m’as ${vaincu} ${wins} fois ? Simple échauffement ! Choisis ton chapitre, je t’attends.`,
            `${wins} défaite${wins > 1 ? 's' : ''} ? Je m’en souviens à peine. Viens, que je prenne ma revanche !`,
          ],
      r,
    );
  if (wins === 0)
    return pickAt(
      [
        'Hahaha ! Un nouveau challenger ? Choisis ton chapitre… et prépare-toi à perdre tes cœurs !',
        'Je suis le maître des maths ! Aucun chapitre ne te résistera ? C’est ce qu’on va voir !',
        'Mes mobs n’ont pas mangé de héros depuis longtemps… Choisis ton chapitre, si tu l’oses !',
        'Mon cube des opérations a tout calculé : tu vas perdre. Choisis ton chapitre !',
      ],
      r,
    );
  return pickAt(
    [
      `Tu m’as ${vaincu} ${wins} fois ? Simple échauffement ! Choisis ton chapitre, je t’attends.`,
      'Encore toi ! Cette fois, mes équations vont te faire tourner la tête, haha !',
      'Tu reviens ? Mon cube a recalculé ta défaite, haha !',
      `${wins} défaite${wins > 1 ? 's' : ''} ? Je m’en souviens à peine. Viens, que je prenne ma revanche !`,
    ],
    r,
  );
}

/** Face-à-face avant le combat : le boss provoque sur le chapitre, plus vexé s'il a déjà été battu dessus. */
export function faceOffTaunt(chapterTitle: string, beaten: boolean, gender: Gender, r: number): string {
  const t = inSentence(chapterTitle);
  const battu = accord(gender, 'battu', 'battue');
  return pickAt(
    beaten
      ? [
          `Tu m’as peut-être ${battu}… Mais tu ne feras pas long feu en ${t}, haha !`,
          `Encore toi ? La dernière fois, c’était de la chance. Cette fois, ${t}, c’est mon terrain !`,
          `Revanche ! J’ai révisé ${t} toute la nuit, hahaha !`,
        ]
      : [
          `Haha ! ${chapterTitle} ? Personne ne passe ce chapitre sans perdre ses cœurs !`,
          `Tu crois pouvoir me battre en ${t} ? Mes mobs vont te dévorer !`,
          `Bienvenue sur mon terrain : ${t}. Tu vas trembler, haha !`,
        ],
    r,
  );
}

/** Questy répond au boss et remotive le joueur. */
export const QUESTY_REPLIES = [
  'Ne l’écoute pas ! Chaque bonne réponse, c’est un tir. 4 mobs, puis lui.',
  'Il fait le malin… Prends ton temps et vise juste !',
  'Ton entraînement va payer : montre-lui ce que tu sais !',
  'Une erreur ? Pas grave, il te reste tes cœurs. On y va !',
] as const;
export const questyReply = (r: number) => pickAt(QUESTY_REPLIES, r);
