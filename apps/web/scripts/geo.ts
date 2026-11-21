/**
 * Données de géographie, sources institutionnelles (règle du 21/11/2026) :
 * - INSEE, Code officiel géographique au 1er janvier 2025 (régions, départements, communes :
 *   https://www.insee.fr/fr/information/8377162) : nom, chef-lieu, préfecture ;
 * - Union européenne, « Pays de l'UE » (https://european-union.europa.eu/…/eu-countries) :
 *   capitale et monnaie de chacun des 27 États membres.
 * Écrit packages/content/src/geographie/donnees.generated.ts.
 *
 *   pnpm --filter @questeo/web exec tsx scripts/geo.ts
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const get = (url: string) =>
  execFileSync('curl', ['-sfL', '-A', 'Mozilla/5.0 (X11; Linux x86_64) Firefox/128.0', url], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

/** CSV de l'INSEE : champs entre guillemets, séparés par des virgules. */
function csv(text: string): Record<string, string>[] {
  const [head = '', ...lines] = text.trim().split(/\r?\n/);
  const cols = head.split(',').map((c) => c.replace(/"/g, ''));
  return lines.map((l) => {
    const cells = [...l.matchAll(/"([^"]*)"|([^,]+)|(?<=,)(?=,|$)/g)].map((m) => m[1] ?? m[2] ?? '');
    return Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? '']));
  });
}

const INSEE = 'https://www.insee.fr/fr/statistiques/fichier/8377162';
const EU_SLUGS = [
  'austria',
  'belgium',
  'bulgaria',
  'croatia',
  'cyprus',
  'czechia',
  'denmark',
  'estonia',
  'finland',
  'france',
  'germany',
  'greece',
  'hungary',
  'ireland',
  'italy',
  'latvia',
  'lithuania',
  'luxembourg',
  'malta',
  'netherlands',
  'poland',
  'portugal',
  'romania',
  'slovakia',
  'slovenia',
  'spain',
  'sweden',
];

function euCountry(slug: string) {
  const html = get(`https://european-union.europa.eu/principles-countries-history/eu-countries/${slug}_fr`);
  const text = html
    .replace(/<[^>]+>/g, '|')
    .replace(/&#039;|&rsquo;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .replace(/(\s*\|\s*)+/g, '|');
  const field = (k: string) => new RegExp(`\\|${k}\\|:\\s*([^|]+)\\|`).exec(text)?.[1]?.trim();
  const name = /<title>([^<–]+)–/.exec(html)?.[1]?.trim();
  const capital = field('Capitale');
  const currency = field('Monnaie');
  if (!name || !capital || !currency) throw new Error(`${slug} : fiche incomplète (${name}, ${capital}, ${currency})`);
  return { name, capital, euro: currency.startsWith('euro') };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const communes = new Map(
    csv(get(`${INSEE}/v_commune_2025.csv`))
      .filter((c) => c.TYPECOM === 'COM')
      .map((c) => [c.COM, c.LIBELLE]),
  );
  const regions = csv(get(`${INSEE}/v_region_2025.csv`)).map((r) => ({
    code: r.REG,
    name: r.LIBELLE,
    chefLieu: communes.get(r.CHEFLIEU ?? '') ?? '',
  }));
  const departements = csv(get(`${INSEE}/v_departement_2025.csv`)).map((d) => ({
    code: d.DEP,
    name: d.LIBELLE,
    region: d.REG,
    prefecture: communes.get(d.CHEFLIEU ?? '') ?? '',
  }));
  for (const x of [...regions, ...departements]) if (!x.name) throw new Error(`Ligne incomplète ${JSON.stringify(x)}`);
  for (const x of regions) if (!x.chefLieu) throw new Error(`Chef-lieu introuvable : ${x.name}`);
  for (const x of departements) if (!x.prefecture) throw new Error(`Préfecture introuvable : ${x.name}`);
  const ue = EU_SLUGS.map((s) => {
    const c = euCountry(s);
    console.log(`✓ ${c.name} : ${c.capital}`);
    return c;
  });
  const day = new Date().toISOString().slice(0, 10);
  writeFileSync(
    fileURLToPath(new URL('../../../packages/content/src/geographie/donnees.generated.ts', import.meta.url)),
    `// Fichier généré par apps/web/scripts/geo.ts le ${day} : ne pas modifier.\n// Sources : INSEE, Code officiel géographique au 1er janvier 2025 ; Union européenne, « Pays de l’UE ».\n\nexport const GEO_FETCHED_ON = '${day}';\n\nexport const REGIONS = ${JSON.stringify(regions, null, 2)} as const;\n\nexport const DEPARTEMENTS = ${JSON.stringify(departements, null, 2)} as const;\n\nexport const PAYS_UE = ${JSON.stringify(ue, null, 2)} as const;\n`,
  );
  console.log(`${regions.length} régions, ${departements.length} départements, ${ue.length} pays de l’UE`);
}
