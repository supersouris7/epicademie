import { z } from 'zod';
import { GRADES } from './grades.ts';
import { AvatarConfigSchema, ProfileNameSchema } from './profile.ts';

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
  /** `email` est nul pour un compte élève autonome (moins de 15 ans : aucune donnée personnelle). */
  account: z.object({ id: z.uuid(), email: z.string().nullable(), role: z.enum(ACCOUNT_ROLES) }),
  /** `autonomous` : famille d'un élève de moins de 15 ans, sans parent rattaché. */
  family: z.object({ id: z.uuid(), autonomous: z.boolean() }),
  /** Mot de passe confirmé récemment : actions réservées au parent permises (voir `parentUntil`). */
  parent: z.boolean(),
  /** Fin du déverrouillage parent (ISO), ou null. */
  parentUntil: z.string().nullable(),
  /** Un code PIN parent est choisi (sinon : mot de passe du compte). */
  hasPin: z.boolean(),
  /** Fin de la session d'administration (compte admin, ISO), ou null si fermée. */
  adminUntil: z.string().nullable(),
});
export type Me = z.infer<typeof MeSchema>;

/**
 * Élève de moins de 15 ans (RGPD art. 8, loi française) : compte sans donnée personnelle
 * (pseudo + avatar + classe). L'âge sert à orienter l'inscription et n'est pas conservé.
 */
export const STUDENT_AUTONOMOUS_MAX_AGE = 14;
export const StudentSignupSchema = z.object({
  name: ProfileNameSchema,
  avatar: AvatarConfigSchema,
  grade: z.enum(GRADES),
  age: z.number().int().min(3).max(STUDENT_AUTONOMOUS_MAX_AGE, 'À partir de 15 ans, crée un compte avec ton e-mail.'),
});
export type StudentSignup = z.infer<typeof StudentSignupSchema>;

/** Code de récupération (montré une seule fois) : 16 caractères, avec ou sans tirets. */
export const RecoveryCodeSchema = z.string().trim().min(8).max(40);
export const StudentRecoverSchema = z.object({ code: RecoveryCodeSchema });
export const StudentSignupResultSchema = z.object({ me: MeSchema, recoveryCode: z.string() });
export type StudentSignupResult = z.infer<typeof StudentSignupResultSchema>;
export const RecoveryCodeResultSchema = z.object({ recoveryCode: z.string() });

/** Invitation : code court à durée limitée et à usage unique, saisi par un parent. */
export const InviteResultSchema = z.object({ code: z.string(), expiresAt: z.string() });
export type InviteResult = z.infer<typeof InviteResultSchema>;
export const FamilyJoinSchema = z.object({ code: z.string().trim().min(4).max(20) });
export const FamilyJoinResultSchema = z.object({ joined: z.array(z.string()) });
export type FamilyJoinResult = z.infer<typeof FamilyJoinResultSchema>;
