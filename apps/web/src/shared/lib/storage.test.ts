import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeStorage } from './storage.ts';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('stockage local tolérant', () => {
  it('lit, écrit et efface', () => {
    safeStorage.set('k', 'v');
    expect(safeStorage.get('k')).toBe('v');
    safeStorage.set('k', null);
    expect(safeStorage.get('k')).toBeNull();
  });

  it('stockage bloqué (navigation privée) : ni erreur ni valeur', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    expect(() => safeStorage.set('k', 'v')).not.toThrow();
    expect(safeStorage.get('k')).toBeNull();
  });
});
