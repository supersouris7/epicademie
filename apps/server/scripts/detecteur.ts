/**
 * Détecteur des notions à reprendre (docs/contenus/README.md §8), sans IA :
 * `node apps/server/scripts/detecteur.ts` réécrit docs/contenus/detecteur.tsv.
 */
import { writeFileSync } from 'node:fs';
import { analyzeCatalog, toTsv } from '@epicademie/content';

const reports = analyzeCatalog();
writeFileSync(new URL('../../../docs/contenus/detecteur.tsv', import.meta.url), toTsv(reports));
console.log(`${reports.length} notions signalées : docs/contenus/detecteur.tsv`);
