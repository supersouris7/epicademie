import { z } from 'zod';

/**
 * Comptes familiaux : un compte parent (e-mail + mot de passe) par famille, des profils enfants
 * rattachés à la famille. Voir docs/adr/0012-comptes-familiaux.md.
 */

/** Rôles d'un compte : parent (famille), administrateur (contenus, signalements). */
export const ACCOUNT_ROLES = ['parent', 'admin'] as const;
export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Adresse trop longue')
  .pipe(z.email({ message: 'Adresse e-mail invalide' }));

/** Longueur minimale recommandée (ANSSI : 12 caractères pour un mot de passe seul). */
export const PASSWORD_MIN = 12;
export const PasswordSchema = z
  .string()
  .min(PASSWORD_MIN, `Au moins ${PASSWORD_MIN} caractères`)
  .max(200, '200 caractères maximum');

export const SignupSchema = z.object({ email: EmailSchema, password: PasswordSchema });
export type Signup = z.infer<typeof SignupSchema>;

/** Connexion : pas de règle de longueur (un ancien mot de passe court doit pouvoir se tester). */
export const LoginSchema = z.object({ email: EmailSchema, password: z.string().min(1).max(200) });
export type Login = z.infer<typeof LoginSchema>;

export const PasswordConfirmSchema = z.object({ password: z.string().min(1).max(200) });
/** Code PIN de l'Espace parent : 4 chiffres. */
export const ParentPinSchema = z.string().regex(/^\d{4}$/, 'Le code PIN a 4 chiffres.');
export const ParentPinSetSchema = z.object({ password: z.string().min(1).max(200), pin: ParentPinSchema });
export const ParentPinUnlockSchema = z.object({ pin: ParentPinSchema });
export const PasswordForgotSchema = z.object({ email: EmailSchema });
export const PasswordResetSchema = z.object({ token: z.string().min(20).max(200), password: PasswordSchema });

/** Session courante : le compte, sa famille, et si les actions « parent » sont déverrouillées. */
export const MeSchema = z.object({
  account: z.object({ id: z.uuid(), email: z.string(), role: z.enum(ACCOUNT_ROLES) }),
  family: z.object({ id: z.uuid() }),
  /** Mot de passe confirmé récemment : actions réservées au parent permises (voir `parentUntil`). */
  parent: z.boolean(),
  /** Fin du déverrouillage parent (ISO), ou null. */
  parentUntil: z.string().nullable(),
  /** Un code PIN parent est choisi (sinon : mot de passe du compte). */
  hasPin: z.boolean(),
});
export type Me = z.infer<typeof MeSchema>;
