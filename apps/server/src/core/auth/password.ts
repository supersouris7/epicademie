import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Hachage des mots de passe : scrypt (Node, sans dépendance), sel aléatoire de 16 octets,
 * paramètres stockés avec le hash pour pouvoir les durcir plus tard sans casser les anciens
 * comptes. Format : `scrypt$N$r$p$sel$hash` (base64url).
 *
 * N = 2^15, r = 8, p = 1 : ≈ 32 Mio de mémoire et quelques dizaines de ms par vérification
 * (recommandation OWASP pour scrypt).
 */

const PARAMS = { N: 2 ** 15, r: 8, p: 1 } as const;
const KEY_LENGTH = 32;
/** Mémoire maximale autorisée pour scrypt (≥ 128 · N · r). */
const MAX_MEM = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { ...opts, maxmem: MAX_MEM }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, salt.toString('base64url'), key.toString('base64url')].join('$');
}

/** Vrai si le mot de passe correspond au hash (comparaison à temps constant). */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !n || !r || !p || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const key = await derive(password, Buffer.from(salt, 'base64url'), { N: Number(n), r: Number(r), p: Number(p) });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

let dummy: Promise<string> | null = null;

/**
 * Hash factice : vérifié quand l'e-mail n'existe pas, pour que le temps de réponse ne révèle
 * pas l'existence d'un compte. Calculé une fois, au premier besoin.
 */
export function dummyHash(): Promise<string> {
  dummy ??= hashPassword(randomBytes(16).toString('hex'));
  return dummy;
}
