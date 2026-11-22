import type { EvalChapter } from '../../types.ts';
import { CE2_ESPACE } from './espace.ts';
import { CE2_GRANDEURS } from './grandeurs.ts';
import { CE2_NOMBRES } from './nombres.ts';

/**
 * Fondamentaux de maths du CE2 (programme du cycle 2, BO n°41 du 31 octobre 2024). Utilisés seulement par
 * l'Épreuve des Origines et l'exploration des prérequis (ADR 0030) : hors de `MATHS_CHAPTERS`, donc
 * aucune classe CE2 jouable en Entraînement. Identifiants `mce2-*` attendus par le référentiel.
 */
export const CE2_CHAPTERS: readonly EvalChapter[] = [...CE2_NOMBRES, ...CE2_GRANDEURS, ...CE2_ESPACE];
