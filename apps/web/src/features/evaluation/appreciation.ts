import type { MoodId } from '../../shared/ui/mascot/moods.ts';
import { note20 } from './texts.ts';

/**
 * Appréciation d'une note sur 20 : un mot court pour les parents, une phrase drôle et bienveillante
 * de Questy (petit robot à visage LED) pour l'élève. Jamais de moquerie, même pour une note basse :
 * une note basse est une marge de progression. La phrase est choisie par l'identifiant de l'épreuve
 * (stable d'un affichage à l'autre).
 */
export interface Appreciation {
  /** Mot court, sobre (espace parent, historique). */
  readonly label: string;
  /** Phrase de Questy (bilan de l'élève). */
  readonly line: string;
  readonly mood: MoodId;
}

interface Band {
  readonly min: number;
  readonly label: string;
  readonly mood: MoodId;
  readonly lines: readonly string[];
}

/** Du plus haut au plus bas : la première tranche dont le minimum est atteint. */
const BANDS: readonly Band[] = [
  {
    min: 20,
    label: 'Sans faute',
    mood: 'love',
    lines: [
      '20 sur 20 ! Je déclare officiellement ton cerveau trésor national.',
      'Sans faute ! Je dois m’asseoir… ah non, je n’ai pas de jambes pliables.',
      'Parfait ! Je fais une danse de la victoire. Dans ma tête. Avec mes LED.',
    ],
  },
  {
    min: 17,
    label: 'Très bien maîtrisé',
    mood: 'wow',
    lines: [
      'Waouh ! Tu ne serais pas un peu robot, toi aussi ?',
      'Presque parfait ! Je crois que je vais te demander des cours.',
      'Impressionnant ! Mes circuits ont fait des étincelles de joie.',
    ],
  },
  {
    min: 14,
    label: 'Bien maîtrisé',
    mood: 'proud',
    lines: [
      'Bien maîtrisé ! Mes LED rougissent de fierté.',
      'Tu cartonnes ! Je vais devoir inventer des questions plus coriaces.',
      'Excellent travail ! Même mon processeur applaudit (il n’a pas de mains, mais il essaie).',
    ],
  },
  {
    min: 10,
    label: 'En bonne voie',
    mood: 'cool',
    lines: [
      'En bonne voie ! Encore un petit effort et je devrai mettre des lunettes de soleil.',
      'Plus de la moitié dans la poche ! L’autre moitié n’a qu’à bien se tenir.',
      'Solide ! Quelques notions à faire briller et ce sera éblouissant.',
    ],
  },
  {
    min: 6,
    label: 'En chemin',
    mood: 'happy',
    lines: [
      'Ça bouge ! Encore quelques entraînements et ta note va faire des bonds de kangourou.',
      'Tu as posé les fondations. Maintenant, on construit le château !',
      'Mon détecteur de progrès bipe déjà. Continue, il adore ça !',
    ],
  },
  {
    min: 0,
    label: 'Tout début',
    mood: 'wink',
    lines: [
      'Les plus grands héros ont commencé avec une épée en carton. On l’aiguise ensemble ?',
      'Mes capteurs détectent une énorme marge de progrès. C’est la meilleure nouvelle du jour !',
      'C’était l’échauffement. Le cerveau, ça se muscle… et j’ai plein d’haltères pour toi !',
    ],
  },
];

const PARTIAL_LINE =
  'Épreuve écourtée, mais chaque réponse m’a appris quelque chose sur toi. On reprend quand tu veux !';

/** Petit hachage stable (identifiant d'épreuve) pour varier la phrase sans la changer d'un affichage à l'autre. */
const pick = (lines: readonly string[], key: string): string => {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return lines[h % lines.length] ?? '';
};

/** Appréciation d'une maîtrise en % (null : pas de note fiable, pas d'appréciation). */
export function appreciation(mastery: number | null, key: string, partial = false): Appreciation | null {
  if (mastery === null) return null;
  const note = note20(mastery);
  const band = BANDS.find((b) => note >= b.min);
  if (!band) return null;
  return { label: band.label, mood: band.mood, line: partial ? PARTIAL_LINE : pick(band.lines, key) };
}
