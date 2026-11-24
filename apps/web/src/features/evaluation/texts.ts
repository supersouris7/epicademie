import {
  generate,
  generateCe2,
  getCe2Chapter,
  getCe2Skill,
  getChapter,
  DOMAINS,
  type DomainId,
  type Question,
} from '@epicademie/content';
import type { EvaluationKind } from '@epicademie/shared';

/** Question d'une épreuve : les notions du CE2 (prérequis) viennent d'un registre à part. */
export const generateEvaluation = (skillId: string, level: 1 | 2 | 3, seed: number): Question =>
  getCe2Skill(skillId) ? generateCe2(skillId, level, seed) : generate(skillId, level, seed);

/** Titre d'une compétence (= chapitre du contenu). */
export const competenceTitle = (id: string): string => getChapter(id)?.title ?? getCe2Chapter(id)?.title ?? id;

export const domainLabel = (id: string): string => (id in DOMAINS ? DOMAINS[id as DomainId] : id);

const GRADE_NAMES: Record<string, string> = {
  ce2: 'CE2',
  cm1: 'CM1',
  cm2: 'CM2',
  '6e': '6e',
  '5e': '5e',
  '4e': '4e',
  '3e': '3e',
};
export const gradeName = (id: string | null): string => (id ? (GRADE_NAMES[id] ?? id) : '');

/** Les trois épreuves : nom, promesse. Seule l'Épreuve des Origines est ouverte pour l'instant. */
export const KIND_INFO: Record<EvaluationKind, { name: string; pitch: (grade: string) => string; open: boolean }> = {
  origines: {
    name: 'Épreuve des Origines',
    pitch: (g) => `Ce que tu sais de ${g}, l’année passée : le point de départ de ta classe.`,
    open: true,
  },
  progression: { name: 'Épreuve de Progression', pitch: () => 'Mesure ce que tu as appris cette année.', open: false },
  maitres: { name: 'Épreuve des Maîtres', pitch: () => 'Le grand bilan de ton année.', open: false },
};

/** Pourcentage d'un bilan : arrondi à 5 % (ADR 0030). */
export const round5 = (value: number): number => Math.min(100, Math.max(0, Math.round(value / 5) * 5));
