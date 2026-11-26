import { afterEach, describe, expect, it, vi } from 'vitest';
import { installChunkReload } from './chunkReload.ts';

const fail = () => window.dispatchEvent(new Event('vite:preloadError'));

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

  it('hors ligne : pas de rechargement', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
    const reload = vi.fn();
    const remove = installChunkReload(reload);
    fail();
    expect(reload).not.toHaveBeenCalled();
    remove();
  });
});
