import { describe, expect, it } from 'vitest';
import { scrubError } from './scrub.ts';

const WORD = 'Courage, mon petit mot secret';

/** Erreur comme celle de Drizzle/pg : paramètres dans le message, `params`, `query` et `detail`. */
function dbError() {
  const pg = Object.assign(new Error('violation'), { detail: `Key (note)=(${WORD}) is bad`, code: '23514' });
  return Object.assign(
    new Error(`Failed query: insert into "recommendations" values ($1, $2)\nparams: abc,${WORD}`, { cause: pg }),
    { params: ['abc', WORD], query: 'insert into "recommendations" values ($1, $2)' },
  );
}

describe('scrubError', () => {
  it('retire params, query, detail et le « params: » du message, y compris dans les causes', () => {
    const clean = scrubError(dbError()) as Error & Record<string, unknown>;
    expect(
      JSON.stringify(clean, Object.getOwnPropertyNames(clean)) +
        JSON.stringify(clean.cause, ['stack', 'message', 'detail']),
    ).not.toContain('secret');
    expect(clean.message).toBe('Failed query: insert into "recommendations" values ($1, $2)');
    expect(clean.params).toBeUndefined();
    expect(clean.query).toBeUndefined();
    const cause = clean.cause as Error & Record<string, unknown>;
    expect(cause.detail).toBeUndefined();
    expect(cause.message).toBe('violation');
    expect(cause.code).toBe('23514');
    expect(clean).toBeInstanceOf(Error);
    expect(clean.stack).toBeTypeOf('string');
  });

  it('laisse intact ce qui n’est pas une erreur, et n’altère pas l’original', () => {
    expect(scrubError('texte')).toBe('texte');
    const original = dbError();
    scrubError(original);
    expect(original.params).toContain(WORD);
  });
});
