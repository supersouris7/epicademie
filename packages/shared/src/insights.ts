import { z } from 'zod';
import { SUBSCRIPTION_STATUSES } from './billing.ts';
import { SUBJECT_IDS } from './subjects.ts';

/**
 * Pilotage (administration) : statistiques agrégées, erreurs récentes, anomalies de
 * récompenses (docs/adr/0022-pilotage.md). Aucune donnée personnelle : pas de nom, pas
 * d'e-mail, pas de date de naissance ; les profils n'apparaissent que par identifiant.
 */

const count = z.number().int().nonnegative();

export const AdminStatsSchema = z.object({
  /** Jour du calcul (AAAA-MM-JJ) ; « récents » = 7 derniers jours. */
  day: z.string(),
  families: count,
  profiles: count,
  activeProfiles7d: count,
  finishedSeries7d: count,
  /** Premières réponses individuelles des 7 derniers jours. */
  answers7d: count,
  /** Part de réussite sans aide sur ces réponses (null : aucune réponse). */
  autonomousRate7d: z.number().min(0).max(1).nullable(),
  answersBySubject7d: z.array(z.object({ subject: z.enum(SUBJECT_IDS), answers: count })),
  bossWins: count,
  premiumFamilies: count,
  payments: z.array(z.object({ status: z.enum(SUBSCRIPTION_STATUSES), count, amountCents: count })),
  openReports: count,
});
export type AdminStats = z.infer<typeof AdminStatsSchema>;

export const ERROR_SOURCES = ['server', 'client', 'realtime', 'process'] as const;

/** Erreurs récentes regroupées par message (depuis le démarrage du serveur). */
export const AdminErrorSchema = z.object({
  source: z.enum(ERROR_SOURCES),
  message: z.string(),
  route: z.string().nullable(),
  count,
  firstAt: z.string(),
  lastAt: z.string(),
});
export type AdminError = z.infer<typeof AdminErrorSchema>;

export const ANOMALY_RULES = ['gain-de-serie', 'series-par-jour', 'reponses-eclair', 'solde-hors-norme'] as const;
export type AnomalyRule = (typeof ANOMALY_RULES)[number];

export const ANOMALY_LABELS: Record<AnomalyRule, string> = {
  'gain-de-serie': 'Gain de pièces impossible pour une série',
  'series-par-jour': 'Trop de séries en un jour',
  'reponses-eclair': 'Réponses trop rapides pour être lues',
  'solde-hors-norme': 'Solde hors norme',
};

export const AnomalySchema = z.object({
  rule: z.enum(ANOMALY_RULES),
  profileId: z.uuid(),
  /** Explication chiffrée (« 412 pièces en une série ; maximum attendu 150 »). */
  detail: z.string(),
  at: z.string().nullable(),
});
export type Anomaly = z.infer<typeof AnomalySchema>;
