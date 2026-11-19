/**
 * Horloge injectable : le jour « famille » (répétition espacée) et l'instant présent.
 * Les services la reçoivent en dépendance, ce qui rend les tests déterministes.
 */
export interface Clock {
  /** Date du jour AAAA-MM-JJ dans le fuseau de la famille. */
  readonly today: () => string;
  readonly now: () => Date;
}

export function dayIn(timeZone: string, now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function systemClock(timeZone: string): Clock {
  return { today: () => dayIn(timeZone, new Date()), now: () => new Date() };
}
