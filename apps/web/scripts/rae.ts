/**
 * Conjugaisons espagnoles tirées du Diccionario de la lengua española de la Real Academia
 * Española (https://dle.rae.es/<verbe>, tableaux « Indicativo »). Source institutionnelle
 * (règle du 21/11/2026). Écrit src/espagnol/conjugaisons.generated.ts.
 *
 *   pnpm --filter @epicademie/web exec tsx scripts/rae.ts
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const VERBS = [
  'hablar',
  'trabajar',
  'estudiar',
  'cantar',
  'bailar',
  'escuchar',
  'comer',
  'beber',
  'aprender',
  'leer',
  'vivir',
  'escribir',
  'abrir',
  'ser',
  'estar',
  'tener',
  'ir',
  'hacer',
  'poder',
  'querer',
  'decir',
  'venir',
] as const;

const TENSES = {
  Presente: 'present',
  'Pretérito perfecto simple / Pretérito': 'passeSimple',
  'Futuro simple / Futuro': 'futur',
  'Pretérito perfecto compuesto / Antepresente': 'passeCompose',
} as const;

/** Personnes gardées, dans l'ordre (usted / ustedes ne sont pas proposés aux élèves). */
const PERSONS: Record<string, string> = {
  yo: 'yo',
  'tú / vos': 'tu',
  'él, ella': 'el',
  'nosotros, nosotras': 'nosotros',
  'vosotros, vosotras': 'vosotros',
  'ellos, ellas': 'ellos',
};

const text = (h: string) =>
  h
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

function conjugate(verb: string) {
  // curl : le site refuse le client HTTP de Node (403), pas un navigateur ordinaire.
  const html = execFileSync(
    'curl',
    ['-sfL', '-A', 'Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0', `https://dle.rae.es/${verb}`],
    {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  const start = html.indexOf('id="Indicativo"');
  const end = html.indexOf('id="Subjuntivo"', start);
  if (start < 0 || end < 0) throw new Error(`${verb} : tableau Indicativo introuvable`);
  const section = html.slice(start, end);
  const out: Record<string, Record<string, string>> = {};
  for (const table of section.split('<table').slice(1)) {
    const heads = [...table.matchAll(/<th>([^<]+)<\/th>/g)].map((m) => text(m[1] ?? ''));
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1] ?? '');
    for (const row of rows) {
      const pronoun = [...row.matchAll(/c-th-secondary--visible"[^>]*>([^<]+)</g)].map((m) => text(m[1] ?? ''))[0];
      const person = pronoun ? PERSONS[pronoun] : undefined;
      if (!person) continue;
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1] ?? ''));
      heads.forEach((h, k) => {
        const tense = (TENSES as Record<string, string | undefined>)[h];
        const cell = cells[k];
        if (!tense || !cell) return;
        // « hablas / hablás » : la 1re forme (tú) ; le voseo n'est pas enseigné.
        (out[tense] ??= {})[person] = cell.split(' / ')[0]?.trim() ?? cell;
      });
    }
  }
  for (const t of Object.values(TENSES)) {
    if (Object.keys(out[t] ?? {}).length !== 6) throw new Error(`${verb} : ${t} incomplet ${JSON.stringify(out[t])}`);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all: Record<string, unknown> = {};
  for (const v of VERBS) {
    all[v] = conjugate(v);
    console.log(`✓ ${v}`);
  }
  const day = new Date().toISOString().slice(0, 10);
  writeFileSync(
    fileURLToPath(new URL('../../../packages/content/src/espagnol/conjugaisons.generated.ts', import.meta.url)),
    `// Fichier généré par apps/web/scripts/rae.ts le ${day} : ne pas modifier.\n// Source : Real Academia Española, Diccionario de la lengua española (https://dle.rae.es/<verbe>), tableaux « Indicativo ».\n\nexport const RAE_FETCHED_ON = '${day}';\n\nexport const CONJUGAISONS = ${JSON.stringify(all, null, 2)} as const;\n`,
  );
}
