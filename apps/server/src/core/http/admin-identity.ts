import type { AdminRole } from '@epicademie/shared';

/** Personne reconnue par une requête d'administration (docs/adr/0036-…). Aucun compte de jeu. */
export interface AdminIdentity {
  /** Nom assaini, affiché et inscrit dans les journaux. */
  readonly name: string;
  readonly role: AdminRole;
  /** Identifiant chez le fournisseur d'identité ; `secours` ; `null` pour l'opérateur historique. */
  readonly sub: string | null;
  readonly via: 'sso' | 'secours' | 'operateur';
}

export const ADMIN_NAME_MAX = 40;

/** Nom sûr pour les journaux : sans caractère de contrôle, 40 caractères au plus. */
export function sanitizeAdminName(raw: unknown, fallback = 'operateur'): string {
  const text = typeof raw === 'string' ? raw : '';
  const clean = Array.from(text, (c) => {
    const code = c.codePointAt(0) ?? 0;
    return code < 32 || (code >= 127 && code <= 159) ? ' ' : c;
  })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.slice(0, ADMIN_NAME_MAX) || fallback;
}
