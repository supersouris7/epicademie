/**
 * Aperçu de relecture : `node apps/server/scripts/apercu.ts <chapitre|notion>… [--out fichier.md]`.
 * Écrit pour chaque notion 5 niveaux × 3 graines (énoncé, réponse, pièges, indice, étapes, sources).
 */
import { writeFileSync } from 'node:fs';
import { previewOf } from '@epicademie/content';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const out = outAt >= 0 ? args.splice(outAt, 2)[1] : undefined;
if (args.length === 0) {
  console.error('Usage : apercu.ts <chapitre|notion>… [--out fichier.md]');
  process.exit(2);
}
const md = args.map((id) => previewOf(id)).join('\n');
if (out) writeFileSync(out, md);
else process.stdout.write(md);
