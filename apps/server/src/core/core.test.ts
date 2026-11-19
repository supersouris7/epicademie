import { describe, expect, it, vi } from 'vitest';
import { dayIn, systemClock } from './clock.ts';
import { AppError, badRequest, conflict, notFound } from './errors.ts';
import { logErrorReporter, memoryErrorReporter } from './observability/error-reporter.ts';
import type { FastifyBaseLogger } from 'fastify';

describe('socle', () => {
  it('jour dans le fuseau de la famille', () => {
    expect(dayIn('Europe/Paris', new Date('2026-11-19T23:30:00Z'))).toBe('2026-11-20');
    expect(systemClock('Europe/Paris').today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(systemClock('Europe/Paris').now()).toBeInstanceOf(Date);
  });

  it('erreurs métier : code et statut HTTP', () => {
    expect(notFound('x')).toMatchObject({ code: 'NOT_FOUND', status: 404 });
    expect(conflict('x').status).toBe(409);
    expect(badRequest('x').status).toBe(400);
    expect(new AppError('UNAVAILABLE', 'x').status).toBe(503);
  });

  it('suivi d’erreurs : journal par défaut, mémoire en test', () => {
    const error = vi.fn();
    logErrorReporter({ error } as unknown as FastifyBaseLogger).capture(new Error('boum'), { route: '/x' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ report: true, route: '/x' }), 'erreur signalée');
    const mem = memoryErrorReporter();
    mem.capture('e');
    expect(mem.errors).toEqual(['e']);
  });
});
