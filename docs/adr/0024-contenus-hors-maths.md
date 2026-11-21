# 0024 — Contenus hors maths et parcours Adulte

- Statut : Acceptée (en cours de déploiement par matière)
- Date : 2026-11-20

## Contexte

Décision produit : générer toutes les matières de toutes les classes, y compris une classe
Adulte. Règle de qualité : aucune relecture humaine, donc chaque fait doit être sourcé et
vérifié. Les maths représentent déjà environ 20 000 lignes de générateurs vérifiés.

## Décision

- **Classe Adulte** : jouable dès maintenant, sous forme d'un parcours de remise à niveau en
  maths (`ADULT_PATHS`, 16 chapitres déjà vérifiés, du quotidien vers le collège).
  - Aucun contenu nouveau, donc aucun risque factuel.
  - Chaque chapitre garde sa classe d'origine (suivi, abonnement).
- **Matières hors maths** : même moteur (`Chapter`/`Skill`, réponses texte et QCM, validateur
  sur toutes les notions × 3 niveaux × 20 graines).
  - Une matière devient « disponible » dès qu'elle a un premier chapitre vérifié.
  - Les classes sans contenu n'apparaissent pas dans la matière.
- **Vérification** : chaque donnée factuelle est confrontée à une source en ligne consultée,
  citée dans le code (URL, révision, date). Ce qui ne peut pas être vérifié n'est pas publié.
- **Sources** (règle du 21/11/2026) : **institutionnelles seulement** (Éduscol, BO, British
  Council, et pour les autres matières RAE ou Instituto Cervantes, BIPM, IGN, INSEE…).
- **Anglais livré (21/11/2026)**, du CM1 à la 3e :
  - choix des notions par classe : Éduscol, _Repères de progressivité linguistique — Anglais_ ;
  - formes et règles : British Council, LearnEnglish, _English grammar reference_ (seules les
    règles et les exemples que les pages donnent explicitement) ;
  - chapitres : be au présent et possessifs (CM1), pluriel (CM2), be au prétérit et présent
    simple (6e), verbes irréguliers et prétérit régulier (5e), comparatif et superlatif (4e),
    present perfect (3e) ;
  - verbes irréguliers : tableau de 52 verbes du British Council.
- **Espagnol (5e–3e)** : conjugaisons de la Real Academia Española (dle.rae.es) — présent,
  pretérito indefinido, futur, pretérito perfecto compuesto ; 22 verbes.
- **Physique-chimie (5e–3e)** : relations du programme du cycle 4 (BOEN n° 31 du 30 juillet 2020)
  et unités, symboles et préfixes du BIPM (SI, 9e édition).
- **Géographie (CM1–3e)** : INSEE, Code officiel géographique 2025 (régions, départements,
  préfectures) ; Union européenne (capitales et monnaie des 27 États membres).
- **Histoire (CM1–6e)** : faits écrits tels quels dans le programme du cycle 3 (citation gardée
  avec chaque question). Le cycle 4 reste à faire sur le même principe.
- **Ancien pilote** : anglais 5e, verbes irréguliers.
  - 24 verbes, tous vérifiés sur Wiktionary, _Appendix:English irregular verbs_,
    révision 91798533. Cambridge Dictionary refuse les accès automatisés.
  - Trois notions : prétérit, participe passé, phrase au passé.
  - Erreur typique reconnue : la forme régularisée (« goed »).

## Reste à produire (par ordre de valeur)

| Matière                 | Approche                                                            | Source de vérification                                        |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| Anglais (CM1–3e)        | vocabulaire thématique, be/have, présent, prétérit, futur           | dictionnaires, programmes de langues vivantes (cycles 3 et 4) |
| Espagnol (5e–3e)        | conjugaison des réguliers et des irréguliers fréquents, vocabulaire | RAE (conjugaisons), programmes LV cycle 4                     |
| Histoire (CM1–3e)       | repères chronologiques des programmes (dates, personnages)          | programmes et repères Éduscol, encyclopédies                  |
| Géographie (CM1–3e)     | repères spatiaux (capitales, fleuves, régions, continents)          | IGN/INSEE, sources institutionnelles                          |
| Physique-chimie (5e–3e) | unités, conversions, formules (v = d/t, P = m × g, U = R × I)       | programmes cycle 4, BIPM (SI)                                 |

Chaque chapitre suit le même circuit : données sourcées, générateurs, validateur et tests
automatiques, puis publication.

## Conséquences

- La version gratuite s'applique aussi : le 1er chapitre de chaque classe et matière est
  gratuit.
- Les boss des chapitres hors maths restent « À venir » tant qu'ils n'ont pas de problèmes et
  de pièges vérifiés.
