/**
 * Rôles et permissions de l'administration (docs/adr/0036-…). Chaque route d'administration du
 * contrat déclare UNE permission ; le serveur l'exige, la console s'en sert pour son menu.
 */

/** Du plus fort au plus faible : une personne de plusieurs groupes reçoit le premier de la liste. */
export const ADMIN_ROLES = ['proprietaire', 'moderation', 'pedagogie', 'lecture'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  proprietaire: 'Propriétaire',
  moderation: 'Modération et support',
  pedagogie: 'Pédagogie et contenus',
  lecture: 'Lecture seule',
};

const ALL = ADMIN_ROLES;

/** Rôles autorisés par permission. */
export const ADMIN_PERMISSIONS = {
  /** Statistiques et tendances agrégées (sans montant ni abonnement). */
  'stats:lire': ALL,
  /** Recherche et fiche d'un compte (données personnelles), anomalies par profil. */
  'comptes:lire': ['proprietaire', 'moderation'],
  /** Mot de passe temporaire, suppression. */
  'comptes:agir': ['proprietaire', 'moderation'],
  'signalements:lire': ALL,
  'signalements:traiter': ['proprietaire', 'moderation', 'pedagogie'],
  /** État des notions et historique. */
  'contenus:lire': ['proprietaire', 'pedagogie', 'lecture'],
  /** Activer, désactiver, marquer relue. */
  'contenus:modifier': ['proprietaire', 'pedagogie'],
  /** Encaissements et abonnements. */
  'finances:lire': ['proprietaire'],
  /** Journal d'audit et journal des erreurs. */
  'audit:lire': ['proprietaire'],
} as const satisfies Record<string, readonly AdminRole[]>;
export type AdminPermission = keyof typeof ADMIN_PERMISSIONS;

export const can = (role: AdminRole, permission: AdminPermission): boolean =>
  (ADMIN_PERMISSIONS[permission] as readonly AdminRole[]).includes(role);

/** Groupe du fournisseur d'identité qui donne un rôle. */
export const adminGroup = (role: AdminRole): string => `epicademie-${role}`;

/** Rôle le plus fort parmi les groupes ; `null` : aucun groupe d'administration. */
export const roleFromGroups = (groups: readonly string[]): AdminRole | null =>
  ADMIN_ROLES.find((role) => groups.includes(adminGroup(role))) ?? null;
