import { describe, expect, it } from 'vitest';

/**
 * Ton « pas encore » (docs/contenus/README.md) : aucun libellé dévalorisant dans les textes que
 * l'enfant peut lire. Le code est lu en entier (hors commentaires, identifiants et tests).
 */
const sources = import.meta.glob<string>(
  [
    '../../**/*.{ts,tsx}',
    '../../../../server/src/**/*.ts',
    '../../../../../packages/{shared,engine}/src/**/*.ts',
    '!../../**/*.test.{ts,tsx}',
    '!../../../../server/src/**/*.test.ts',
    '!../../../../../packages/*/src/**/*.test.ts',
    // Écrans réservés aux adultes (administration) et aides de test.
    '!../../features/admin/**',
    '!../../testing/**',
    // Catalogue des images (titres jamais affichés) et journal technique des e-mails.
    '!../../design/assets.generated.ts',
    '!../../../../server/src/core/mail/mailer.ts',
    '!../../../../../packages/shared/src/{admin,pedagogy}.ts',
  ],
  { query: '?raw', import: 'default', eager: true },
);

/** Contenus pédagogiques : les mots comme « nul » ou « échec » y ont un sens scolaire. */
const contents = import.meta.glob<string>(
  ['../../../../../packages/content/src/**/*.ts', '!../../../../../packages/content/src/**/*.test.ts'],
  { query: '?raw', import: 'default', eager: true },
);

const WORD = (words: string) => new RegExp(`(?<![\\p{L}])(?:${words})(?![\\p{L}])`, 'iu');
const FORBIDDEN = WORD(
  'rat(?:é|ée|és|ées|er)|échecs?|échoué[es]*|points? faibles?|mauvaises? (?:réponses?|notes?)|dommage|nul(?:le)?s?|insuffisante?s?|fragiles?|série perdue',
);
const FORBIDDEN_IN_CONTENT = WORD('c’est raté|raté !|la plus ratée|points faibles|quel dommage|c’est dommage');

/** Retire commentaires, identifiants entre apostrophes (`'a-travailler'`) et clés d'objet. */
const visibleText = (code: string) =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ''))
    .replace(/(^|[\s;,{(])\/\/.*$/gm, '$1')
    .replace(/'[a-z0-9_-]+'/g, "''")
    .replace(/^\s*[a-z]+:/gm, '');

const offences = (files: Record<string, string>, pattern: RegExp) =>
  Object.entries(files).flatMap(([file, code]) =>
    visibleText(code)
      .split('\n')
      .flatMap((line, i) => (pattern.test(line) ? [`${file}:${i + 1} ${line.trim()}`] : [])),
  );

describe('ton « pas encore »', () => {
  it('le contrôle repère bien un libellé dévalorisant', () => {
    for (const bad of ['Raté : −5 s', 'la notion la plus ratée', 'Tes points faibles', 'Mauvaise réponse !']) {
      expect(offences({ x: `const m = '${bad}';` }, FORBIDDEN)).toHaveLength(1);
    }
    expect(offences({ x: "// raté\nconst id = 'fragile';" }, FORBIDDEN)).toEqual([]);
  });

  it('aucun libellé dévalorisant dans les écrans, les répliques et les messages', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(200);
    expect(offences(sources, FORBIDDEN)).toEqual([]);
  });

  it('ni dans les contenus pédagogiques', () => {
    expect(Object.keys(contents).length).toBeGreaterThan(20);
    expect(offences(contents, FORBIDDEN_IN_CONTENT)).toEqual([]);
  });
});
