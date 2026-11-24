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

  it('reprend une ancienne clé « questeo… » une fois, la réécrit sous le nouveau nom et la supprime', () => {
    localStorage.setItem('questeo.currentProfile', 'p1');
    expect(safeStorage.get('epicademie.currentProfile')).toBe('p1');
    expect(localStorage.getItem('epicademie.currentProfile')).toBe('p1');
    expect(localStorage.getItem('questeo.currentProfile')).toBeNull();
    localStorage.setItem('questeo:recent:p:s', '["a"]');
    expect(safeStorage.get('epicademie:recent:p:s')).toBe('["a"]');
  });

  it('la nouvelle clé l’emporte sur l’ancienne', () => {
    localStorage.setItem('epicademie.fullscreen', '1');
    localStorage.setItem('questeo.fullscreen', '0');
    expect(safeStorage.get('epicademie.fullscreen')).toBe('1');
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
