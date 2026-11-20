import { createHash, randomBytes } from 'node:crypto';

/**
 * Jetons secrets (session, réinitialisation de mot de passe) : 32 octets aléatoires envoyés au
 * client ; la base n'en garde que l'empreinte SHA-256 (une fuite de la base ne donne aucun
 * jeton utilisable).
 */
export const newToken = (): string => randomBytes(32).toString('base64url');
export const tokenHash = (token: string): string => createHash('sha256').update(token).digest('base64url');
