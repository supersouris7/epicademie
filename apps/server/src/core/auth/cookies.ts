/**
 * Cookies : lecture de l'en-tête `Cookie` et écriture de `Set-Cookie` (RFC 6265), sans
 * dépendance. Le cookie de session est `HttpOnly` (inaccessible au JavaScript de la page),
 * `SameSite=Lax` (pas envoyé par les requêtes d'autres sites) et `Secure` en production (HTTPS).
 */

export const SESSION_COOKIE = 'af_session';

export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

export interface CookieOptions {
  /** Durée de vie en secondes ; 0 efface le cookie. */
  readonly maxAge: number;
  readonly secure: boolean;
}

export function serializeCookie(name: string, value: string, { maxAge, secure }: CookieOptions): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}
