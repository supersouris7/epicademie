/** Date du jour (AAAA-MM-JJ) dans le fuseau de la famille, pour la répétition espacée. */
export function today(timeZone = process.env.TZ_FAMILY ?? 'Europe/Paris', now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
