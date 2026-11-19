/**
 * Limiteur de débit par « seau à jetons » : `capacity` actions d'affilée, puis une action
 * tous les `refillMs`. Protège le temps réel d'un client qui boucle ou d'un abus.
 */
export function tokenBucket(capacity: number, refillMs: number, now: () => number = Date.now) {
  let tokens = capacity;
  let last = now();
  return {
    take(): boolean {
      const t = now();
      tokens = Math.min(capacity, tokens + (t - last) / refillMs);
      last = t;
      if (tokens < 1) return false;
      tokens -= 1;
      return true;
    },
  };
}
