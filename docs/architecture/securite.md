# Sécurité

Public : des enfants (CM1 → 3e). Exigences : protection des données personnelles (RGPD,
données de mineurs), robustesse face aux abus, aucune fuite d'information interne.

## Défenses en place

| Menace                                    | Défense                                                                                                                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accès sans compte                         | toute route non publique exige une session (cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production, jeton aléatoire de 256 bits, base ne gardant que son empreinte SHA-256), [ADR 0012](../adr/0012-comptes-familiaux.md) |
| Accès aux données d'une autre famille     | chaque profil, partie ou combat désigné est vérifié contre la famille de la session ; sinon 404 (existence non révélée) ; temps réel limité à la famille                                                                     |
| Enfant qui agit à la place du parent      | actions parent (créer, supprimer un profil, changer l'identité) : mot de passe confirmé depuis moins de 10 minutes                                                                                                           |
| Mots de passe devinés ou volés            | scrypt salé (N = 2¹⁵), 12 caractères minimum, 10 tentatives par minute et par IP, temps de réponse identique que le compte existe ou non                                                                                     |
| Requêtes forgées depuis un autre site     | cookie `SameSite=Lax` et refus de toute modification dont l'en-tête `Origin` n'est pas le site                                                                                                                               |
| Mot de passe oublié                       | lien à usage unique valable 1 h (empreinte en base), réponse identique que l'adresse existe ou non, toutes les sessions fermées après changement                                                                             |
| Triche (réponses ou gains falsifiés)      | le serveur régénère les questions, corrige et calcule tous les gains                                                                                                                                                         |
| Entrées malformées ou hostiles            | validation Zod stricte de chaque entrée HTTP et temps réel ; corps limité à 64 Kio                                                                                                                                           |
| Injection SQL                             | requêtes paramétrées (Drizzle), aucun SQL concaténé avec une entrée                                                                                                                                                          |
| XSS, clickjacking, MIME sniffing          | CSP stricte (`script-src 'self'`, `frame-ancestors 'none'`), en-têtes helmet                                                                                                                                                 |
| Abus, boucles client                      | limite de débit HTTP par IP ; seau à jetons par connexion temps réel                                                                                                                                                         |
| Connexion temps réel depuis un autre site | contrôle d'origine (même domaine ou `CORS_ORIGINS`)                                                                                                                                                                          |
| Contenu inapproprié entre enfants         | pas de texte libre : messages prédéfinis et emoji seulement                                                                                                                                                                  |
| Fuite d'information                       | erreurs 500 neutres ; pile et détail uniquement dans les journaux                                                                                                                                                            |
| Données personnelles dans les journaux    | pas de corps de requête journalisé ; en-têtes sensibles masqués ; métriques sans URL brute                                                                                                                                   |
| Incohérence en cas de bug                 | transactions, verrous de ligne, contraintes CHECK en base                                                                                                                                                                    |
| Droit à l'effacement                      | suppression d'un profil en cascade sur toutes ses données                                                                                                                                                                    |
| Chaîne d'approvisionnement                | versions et images épinglées (empreintes), actions GitHub épinglées par commit, Dependabot avec délai de 14 jours, `pnpm audit` propre ([ADR 0011](../adr/0011-chaine-d-approvisionnement.md))                               |
| Conteneur                                 | image minimale sans npm/corepack, utilisateur non root, analyse Trivy bloquante en CI, secrets par variables d'environnement (`.env` non versionné)                                                                          |
| Données relues en base                    | état des combats versionné et validé à la lecture ([ADR 0009](../adr/0009-etat-des-combats.md))                                                                                                                              |

## Limites connues (chantiers suivants)

- HSTS ajouté par le proxy TLS de production (pas par l'application, servie en HTTP en local).
