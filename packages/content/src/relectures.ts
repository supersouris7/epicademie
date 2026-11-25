import type { Relecture } from './types.ts';
import { RELECTURES as MATHS } from './maths/relectures.ts';
import { RELECTURES as ANGLAIS } from './anglais/relectures.ts';
import { RELECTURES as EMC } from './emc/relectures.ts';
import { RELECTURES as ESPAGNOL } from './espagnol/relectures.ts';
import { RELECTURES as FRANCAIS } from './francais/relectures.ts';
import { RELECTURES as GEOGRAPHIE } from './geographie/relectures.ts';
import { RELECTURES as HISTOIRE } from './histoire/relectures.ts';
import { RELECTURES as PHYSIQUE } from './physique/relectures.ts';
import { RELECTURES as ST } from './sciences/st/relectures.ts';
import { RELECTURES as SVT } from './sciences/svt/relectures.ts';
import { RELECTURES as TECHNO } from './sciences/techno/relectures.ts';

/** Registre des relectures pédagogiques (docs/adr/0034, point 7) ; chaque matière tient le sien. */
export const RELECTURES: readonly Relecture[] = [
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

/** Une relecture « ok » existe pour cette notion à cette version. */
export const isReviewed = (skillId: string, version: number, list: readonly Relecture[] = RELECTURES): boolean =>
  list.some((r) => r.skillId === skillId && r.version === version && r.verdict === 'ok');
