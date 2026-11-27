import { afterEach, describe, expect, it, vi } from 'vitest';
import { installChunkReload, reportChunkFailure } from './chunkReload.ts';

/** Comme Vite : l'événement porte l'erreur ; le rechargement est décidé juste après. */
const fail = (payload = new Error('morceau introuvable')) => {
  window.dispatchEvent(Object.assign(new Event('vite:preloadError'), { payload }));
  vi.advanceTimersByTime(0);
};

describe('écran introuvable après une mise à jour', () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('recharge la page, sans boucler', () => {
    vi.useFakeTimers({ now: 1_000_000 });
    const reload = vi.fn();
    const remove = installChunkReload(reload);
    fail();
    fail();
    expect(reload).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(61_000);
    fail();
    expect(reload).toHaveBeenCalledTimes(2);
    remove();
  });

  it('téléchargement d’avance en échec : pas de rechargement ; attendu par un écran : oui', () => {
    vi.useFakeTimers({ now: 1_000_000 });
    const reload = vi.fn();
    const remove = installChunkReload(reload);
    const early = new Error('en arrière-plan');
    window.dispatchEvent(Object.assign(new Event('vite:preloadError'), { payload: early }));
    reportChunkFailure(early, false);
    vi.advanceTimersByTime(0);
    expect(reload).not.toHaveBeenCalled();
    // La même erreur rendue à un écran affiché (module partagé) : on recharge.
    reportChunkFailure(early, true);
    fail(early);
    expect(reload).toHaveBeenCalledTimes(1);
    remove();
  });

  it('hors ligne : pas de rechargement', () => {
    vi.useFakeTimers();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
    const reload = vi.fn();
    const remove = installChunkReload(reload);
    fail();
    expect(reload).not.toHaveBeenCalled();
    remove();
  });
});
