import { GLOSSAIRE as ANGLAIS } from './anglais/glossaire.ts';
import { GLOSSAIRE as EMC } from './emc/glossaire.ts';
import { GLOSSAIRE as ESPAGNOL } from './espagnol/glossaire.ts';
import { GLOSSAIRE as FRANCAIS } from './francais/glossaire.ts';
import { GLOSSAIRE as GEOGRAPHIE } from './geographie/glossaire.ts';
import { GLOSSAIRE as HISTOIRE } from './histoire/glossaire.ts';
import { GLOSSAIRE as PHYSIQUE } from './physique/glossaire.ts';
import { GLOSSAIRE as ST } from './sciences/st/glossaire.ts';
import { GLOSSARY } from './glossary.ts';
import type { SubjectTerm } from './types.ts';

/** Glossaires par matière (sciences = physique-chimie ici ; les maths gardent `GLOSSARY`). */
export const SUBJECT_GLOSSARIES: Readonly<Record<string, readonly SubjectTerm[]>> = {
  maths: GLOSSARY.map((g) => ({
    id: g.id,
    word: g.word,
    forms: g.forms,
    definition: g.definition,
    example: g.example,
  })),
  anglais: ANGLAIS,
  francais: FRANCAIS,
  espagnol: ESPAGNOL,
  geographie: GEOGRAPHIE,
  histoire: [...HISTOIRE, ...EMC],
  sciences: [...PHYSIQUE, ...ST],
};

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, '’').trim();

/** Termes en gras (`**terme**`) d'un texte. */
export const boldTerms = (text: string): string[] => [...text.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1] ?? '');

/** Le terme est défini dans le glossaire (par son mot ou l'une de ses formes). */
export const isDefined = (term: string, glossary: readonly SubjectTerm[]): boolean =>
  glossary.some((g) => norm(g.word) === norm(term) || g.forms.some((f) => norm(f) === norm(term)));
