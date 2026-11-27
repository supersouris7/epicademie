/** Date locale AAAA-MM-JJ. */
export function localToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function randomSeed(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] ?? 1;
}

/** « Aujourd’hui », « Hier », « Il y a 2 semaines » : ancienneté d'un jour AAAA-MM-JJ, vue du jour `today`. */
export function ago(day: string, today: string): string {
  const days = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${day}T00:00:00Z`)) / 86_400_000);
  if (days <= 0) return 'Aujourd’hui';
  if (days === 1) return 'Hier';
  if (days < 14) return `Il y a ${days} jours`;
  if (days < 60) return `Il y a ${Math.floor(days / 7)} semaines`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}
