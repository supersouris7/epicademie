import type { SubjectId } from '@epicademie/shared';

/**
 * Relique de chaque matière : chaque boss de chapitre vaincu en donne un éclat. Son icône sert aussi
 * d'icône de la matière en Mode Histoire.
 */
export const RELICS: Record<SubjectId, { readonly name: string; readonly icon: string }> = {
  maths: { name: 'Cristal des maths', icon: 'icons-subjects-boss-maths' },
  francais: { name: 'Plume du français', icon: 'icons-subjects-boss-francais' },
  sciences: { name: 'Fiole des sciences', icon: 'icons-subjects-boss-physique' },
  anglais: { name: 'Grimoire d’anglais', icon: 'icons-subjects-boss-anglais' },
  espagnol: { name: 'Éventail d’Espagne', icon: 'icons-subjects-boss-espagnol' },
  histoire: { name: 'Casque du légionnaire', icon: 'icons-subjects-boss-histoire' },
  geographie: { name: 'Boussole de l’explorateur', icon: 'icons-subjects-boss-geographie' },
};
