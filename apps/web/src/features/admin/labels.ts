import { chapterOfAnySkill, getAnySkill, getChapter } from '@epicademie/content';
import { gradeInfo, OFFER_LABELS, PAYMENT_PROVIDER_LABELS, type AdminError, type Report } from '@epicademie/shared';

/** Vocabulaire de la console : formats et libellés français à la place des identifiants. */

export const nb = (n: number) => n.toLocaleString('fr-FR');
/** Accord : singulier pour 0 et 1 (règle française). */
export const plural = (n: number, one: string, many = `${one}s`) => `${nb(n)} ${n > 1 ? many : one}`;
export const money = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
export const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');
export const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export const skillTitle = (id: string) => getAnySkill(id)?.title ?? id;
export const chapterTitle = (id: string) => getChapter(id)?.title ?? id;
/** Classe d'une notion (« CM1 »), ou « — » si elle n'est plus au contenu. */
export const skillGrade = (id: string) => {
  const grade = chapterOfAnySkill(id)?.grade;
  return grade ? gradeInfo(grade).name : '—';
};
export const reportTitle = (r: Pick<Report, 'skillId' | 'screen'>) =>
  r.skillId ? skillTitle(r.skillId) : `Général${r.screen ? ` · ${r.screen}` : ''}`;

/** Libellé d'un code, ou le code lui-même s'il est inconnu (donnée ancienne). */
export const labelOf = (labels: Readonly<Record<string, string>>, code: string): string => labels[code] ?? code;
export const offerLabel = (offer: string) => labelOf(OFFER_LABELS, offer);
export const providerLabel = (provider: string) => labelOf(PAYMENT_PROVIDER_LABELS, provider);

export const ERROR_SOURCE_LABELS: Record<AdminError['source'], string> = {
  server: 'Serveur',
  client: 'Navigateur',
  realtime: 'Temps réel',
  process: 'Processus',
};

/** Messages connus (anglais) → libellé français ; le message d'origine reste dans le détail. */
const KNOWN_ERRORS: readonly (readonly [RegExp, string])[] = [
  [/headers after they are sent|already sent/i, 'Réponse envoyée deux fois'],
  [/cannot read properties|is not a function|is not defined/i, 'Erreur de programme (valeur manquante)'],
  [/failed query|database|connection terminated/i, 'Erreur de base de données'],
  [/failed to fetch|fetch failed|networkerror|load failed|econn/i, 'Connexion réseau interrompue'],
  [/dynamically imported module|importing a module|chunk/i, 'Fichier de l’application non chargé (mise à jour)'],
  [/timeout|timed out/i, 'Délai dépassé'],
];

const FALLBACK_ERRORS: Record<AdminError['source'], string> = {
  server: 'Erreur technique du serveur',
  client: 'Erreur dans le navigateur',
  realtime: 'Erreur du jeu en direct',
  process: 'Erreur du processus serveur',
};

export const errorLabel = (e: Pick<AdminError, 'source' | 'message'>) =>
  KNOWN_ERRORS.find(([pattern]) => pattern.test(e.message))?.[1] ?? FALLBACK_ERRORS[e.source];
