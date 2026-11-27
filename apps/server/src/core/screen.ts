/**
 * Écrans connus de l'appli (routes de `apps/web/src/app/App.tsx`), avec leurs paramètres nommés.
 * Seuls ces motifs sont conservés : tout autre chemin devient `/autre` (jamais de texte libre,
 * d'identifiant ni de segment saisi par un utilisateur dans les signalements ou erreurs).
 */
const ROUTES = [
  '/',
  '/bienvenue',
  '/eleve',
  '/eleve/inscription',
  '/eleve/code',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/mot-de-passe/nouveau',
  '/a-propos',
  '/admin',
  '/parent',
  '/tv',
  '/parent/enfant/:profileId',
  '/parent/abonnement',
  '/parent/abonnement/simulateur',
  '/parent/profils',
  '/parent/profils/nouveau',
  '/parent/profils/:id/modifier',
  '/parent/reglages',
  '/abonnement',
  '/profils/nouveau',
  '/profils/:id/modifier',
  '/hub',
  '/shop',
  '/heros',
  '/dictionnaire',
  '/multi',
  '/arene',
  '/connectes',
  '/amis',
  '/partie/defi/:defi/:subject',
  '/jouer/:modeId',
  '/jouer/entrainement/:subject',
  '/jouer/entrainement/:subject/:chapterId',
  '/partie/entrainement/:chapterId/:skillId',
  '/jouer/boss/:subject',
  '/partie/boss/:chapterId',
  '/progres',
  '/progres/trophees',
  '/progres/:subject',
  '/parametres',
] as const;

export const UNKNOWN_SCREEN = '/autre';

const segments = (path: string) => path.split('/').filter(Boolean);

const matches = (route: string, parts: readonly string[]): boolean => {
  const pattern = segments(route);
  return pattern.length === parts.length && pattern.every((seg, i) => seg.startsWith(':') || seg === parts[i]);
};

/** Route connue de l'appli (motif, sans valeur de paramètre) ou `/autre`. */
export function normalizeScreen(path: string): string {
  const parts = segments((path.split(/[?#]/)[0] ?? '').slice(0, 200));
  // `/abonnement/*` : tout ce qui suit est ignoré.
  if (parts[0] === 'abonnement') return '/abonnement';
  // Le motif le plus précis d'abord : un segment fixe l'emporte sur un paramètre.
  const found = ROUTES.filter((r) => matches(r, parts)).sort((a, b) => a.split(':').length - b.split(':').length)[0];
  return found ?? UNKNOWN_SCREEN;
}

/** Version de l'appli : jeton court (`1.2.3`, `sha-abc123`), sinon « inconnue ». */
export function normalizeVersion(version: string | undefined): string {
  return version && /^[A-Za-z0-9._+-]{1,40}$/.test(version) ? version : 'inconnue';
}
