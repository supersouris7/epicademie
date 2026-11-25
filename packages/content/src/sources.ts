import { SOURCES as COMMUN } from './sources-communes.ts';
import { SOURCES as MATHS } from './maths/sources.ts';
import { SOURCES as ANGLAIS } from './anglais/sources.ts';
import { SOURCES as ESPAGNOL } from './espagnol/sources.ts';
import { SOURCES as FRANCAIS } from './francais/sources.ts';
import { SOURCES as GEOGRAPHIE } from './geographie/sources.ts';
import { SOURCES as HISTOIRE } from './histoire/sources.ts';
import { SOURCES as EMC } from './emc/sources.ts';
import { SOURCES as PHYSIQUE } from './physique/sources.ts';
import { SOURCES as ST } from './sciences/st/sources.ts';
import { SOURCES as SVT } from './sciences/svt/sources.ts';
import { SOURCES as TECHNO } from './sciences/techno/sources.ts';
import type { Source } from './sources-outils.ts';

export type { Source } from './sources-outils.ts';

/**
 * Registre des sources (docs/adr/0034, point 6) : chaque notion (`Lesson.sources`) et chaque fait cite
 * un identifiant de ce registre. Seuls les domaines institutionnels de la liste ci-dessous sont admis.
 * Chaque matière tient ses sources dans `<matiere>/sources.ts` ; celles de plusieurs matières sont dans
 * `sources-communes.ts`.
 */

/** Domaines institutionnels autorisés (un domaine couvre ses sous-domaines). */
export const ALLOWED_DOMAINS: readonly string[] = [
  'education.gouv.fr',
  'eduscol.education.fr',
  'legifrance.gouv.fr',
  'cnrtl.fr',
  'academie-francaise.fr',
  'bnf.fr',
  'insee.fr',
  'ign.fr',
  'europa.eu',
  'vie-publique.fr',
  'assemblee-nationale.fr',
  'senat.fr',
  'britishcouncil.org',
  'rae.es',
  'cervantes.es',
  'bipm.org',
  'cnrs.fr',
  'inserm.fr',
  'santepubliquefrance.fr',
  'meteofrance.fr',
  'mnhn.fr',
  'cnes.fr',
  'ademe.fr',
  'ecologie.gouv.fr',
  'brgm.fr',
  'geoconfluences.ens-lyon.fr',
];

/** L'URL est en https et son domaine (ou un sous-domaine) est dans la liste autorisée. */
export function isAllowedUrl(url: string): boolean {
  const m = /^https:\/\/([a-z0-9.-]+)(?::\d+)?(?:[/?#]|$)/i.exec(url);
  if (!m) return false;
  const host = (m[1] ?? '').toLowerCase();
  return ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

export const SOURCES: readonly Source[] = [
  ...COMMUN,
  ...MATHS,
  ...ANGLAIS,
  ...ESPAGNOL,
  ...FRANCAIS,
  ...GEOGRAPHIE,
  ...HISTOIRE,
  ...EMC,
  ...PHYSIQUE,
  ...ST,
  ...SVT,
  ...TECHNO,
];

export const getSource = (id: string): Source | undefined => SOURCES.find((s) => s.id === id);
