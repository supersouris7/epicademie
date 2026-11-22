import { createHash, randomBytes, randomInt } from 'node:crypto';

/**
 * Jetons secrets (session, réinitialisation de mot de passe) : 32 octets aléatoires envoyés au
 * client ; la base n'en garde que l'empreinte SHA-256 (une fuite de la base ne donne aucun
 * jeton utilisable).
 */
export const newToken = (): string => randomBytes(32).toString('base64url');
export const tokenHash = (token: string): string => createHash('sha256').update(token).digest('base64url');

/** Alphabet des codes saisis à la main : sans 0/O ni 1/I/L (confusions), 31 symboles. */
const CODE_SYMBOLS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Code court lisible (récupération, invitation) : `length` symboles tirés au hasard
 * cryptographique, groupés par 4 (`ABCD-EFGH`). 16 symboles ≈ 80 bits, 8 ≈ 40 bits.
 */
export function newCode(length: number): string {
  const symbols = Array.from({ length }, () => CODE_SYMBOLS[randomInt(CODE_SYMBOLS.length)]);
  return symbols.join('').replace(/(.{4})(?=.)/g, '$1-');
}

/** Empreinte d'un code saisi : casse, espaces et tirets sont sans importance. */
export const codeHash = (code: string): string => tokenHash(code.toUpperCase().replace(/[^A-Z0-9]/g, ''));
