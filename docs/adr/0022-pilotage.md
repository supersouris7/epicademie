# 0022 — Pilotage : statistiques agrégées, anomalies de récompenses, erreurs récentes

- Statut : Acceptée
- Date : 2026-11-20

## Décision

- **Console d'administration** (rôle administrateur, vérifié par le contrat) : trois nouvelles
  rubriques s'ajoutent aux signalements et aux notions.
  - **Statistiques** : uniquement des agrégats (familles, profils, joueurs actifs sur 7 jours,
    séries, réponses, réussite sans aide, réponses par matière, boss vaincus, familles
    abonnées, paiements par issue, signalements ouverts). Aucune donnée personnelle (ni nom, ni
    e-mail, ni date de naissance).
  - **Courbes** (`GET /admin/trends`, mêmes contrôles d'accès) : comptes créés par jour et
    abonnements actifs par jour sur 30 jours, abonnements actifs par formule, revenus du mode
    test. Comptes agrégés seulement. Affichées en SVG inline avec leurs valeurs en tableau ;
    la console `/admin` est en thème sombre (classe `admin-dark`, variables locales dans
    `index.css`).
  - **Anomalies de récompenses**, avec des seuils larges (`ANOMALY_THRESHOLDS`) : on signale
    l'impossible, pas l'excellent. Quatre règles :
    - gain de plus de 300 pièces en une partie (maximum théorique ≈ 110) ;
    - plus de 40 séries en un jour ;
    - au moins 60 % des réponses en moins de 1,5 s (sur au moins 20 réponses en 7 jours) ;
    - solde hors norme (plus de 50 000 pièces ou plus de 200 rubis).

    Les profils apparaissent par identifiant seulement. Une anomalie se vérifie, elle ne
    sanctionne pas automatiquement.

  - **Erreurs récentes** : journal en mémoire (`withErrorJournal`) placé devant le suivi
    d'erreurs, regroupé par source et message, avec leur nombre (50 groupes au plus). Les
    paramètres des requêtes SQL échouées sont retirés du message (ils pourraient contenir des
    données). Les journaux structurés restent la source complète et durable.
- **Métriques Prometheus ajoutées** :
  - `questeo_errors_total{source}` ;
  - `questeo_rewards_total{currency}` (pièces et rubis distribués : dérive de l'économie) ;
  - `questeo_payments_total{status}`.

## Conséquences

- Les tableaux de bord externes (Grafana…) et les alertes se branchent sur `/api/metrics`
  (docs/operations/observabilite.md).
- Les anomalies sont calculées à la demande (pas de tâche planifiée). Elles sont bornées à
  100 lignes par règle.
