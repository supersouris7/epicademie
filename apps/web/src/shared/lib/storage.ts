/**
 * Accès localStorage tolérant (navigation privée, stockage bloqué).
 *
 * Renommage du produit : les clés « epicademie… » héritent des anciennes clés « questeo… » (même suffixe). Une valeur
 * absente sous la nouvelle clé est reprise une fois sous l'ancienne, réécrite sous la nouvelle puis l'ancienne est
 * supprimée : personne ne perd son profil ni ses préférences.
 */
const PREFIX = 'epicademie';
const LEGACY_PREFIX = 'questeo';

export const safeStorage = {
  get(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      if (value !== null || !key.startsWith(PREFIX)) return value;
      const legacyKey = LEGACY_PREFIX + key.slice(PREFIX.length);
      const legacy = localStorage.getItem(legacyKey);
      if (legacy !== null) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(legacyKey);
      }
      return legacy;
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null): void {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* stockage indisponible : on ignore */
    }
  },
};
