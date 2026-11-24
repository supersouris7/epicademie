import type { Competence } from './types.ts';

/**
 * Gabarit de référentiel d'évaluation (Arène), à copier pour une nouvelle matière :
 *
 *   export const <MATIERE>_REFERENTIAL: Referential = {
 *     subject: '<matiere>',
 *     version: 1,
 *     grades: { cm1: [E('id-chapitre'), o('autre-id', 'id-chapitre')], … },
 *   };
 *
 * puis l'ajouter à `REFERENTIALS` (index.ts). Une compétence = un chapitre du catalogue ; `E` = essentielle
 * (vérifiée par Origines et Maîtres), `o` = non essentielle ; les identifiants suivants sont les prérequis
 * (même classe ou antérieure, sans cycle, le premier étant le principal). `referentiel.test.ts` contrôle
 * tout référentiel enregistré : rattachement exact des chapitres, unicité, prérequis, cycles, 6 à 9
 * essentielles par classe sur 3 domaines au moins, couverture des domaines.
 */
export const E = (id: string, ...prerequisites: string[]): Competence => ({ id, essential: true, prerequisites });
export const o = (id: string, ...prerequisites: string[]): Competence => ({ id, essential: false, prerequisites });
