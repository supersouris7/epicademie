# Sécurité

Public : des enfants (CM1 → 3e). Exigences : protection des données personnelles (RGPD,
données de mineurs), robustesse face aux abus, aucune fuite d'information interne.

## Défenses en place

| Menace                                    | Défense                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Triche (réponses ou gains falsifiés)      | le serveur régénère les questions, corrige et calcule tous les gains                               |
| Entrées malformées ou hostiles            | validation Zod stricte de chaque entrée HTTP et temps réel ; corps limité à 64 Kio                 |
| Injection SQL                             | requêtes paramétrées (Drizzle), aucun SQL concaténé avec une entrée                                |
| XSS, clickjacking, MIME sniffing          | CSP stricte (`script-src 'self'`, `frame-ancestors 'none'`), en-têtes helmet                       |
| Abus, boucles client                      | limite de débit HTTP par IP ; seau à jetons par connexion temps réel                               |
| Connexion temps réel depuis un autre site | contrôle d'origine (même domaine ou `CORS_ORIGINS`)                                                |
| Contenu inapproprié entre enfants         | pas de texte libre : messages prédéfinis et emoji seulement                                        |
| Fuite d'information                       | erreurs 500 neutres ; pile et détail uniquement dans les journaux                                  |
| Données personnelles dans les journaux    | pas de corps de requête journalisé ; en-têtes sensibles masqués ; métriques sans URL brute         |
| Incohérence en cas de bug                 | transactions, verrous de ligne, contraintes CHECK en base                                          |
| Droit à l'effacement                      | suppression d'un profil en cascade sur toutes ses données                                          |
| Chaîne d'approvisionnement                | versions épinglées publiées depuis au moins deux semaines, lockfile, CI `--frozen-lockfile`        |
| Conteneur                                 | image minimale, utilisateur non root, secrets par variables d'environnement (`.env` non versionné) |

## Limites connues (chantiers suivants)

- **Pas encore de comptes** : en bêta, tout appareil qui atteint le serveur voit et ouvre tous
  les profils. Avant la vente : compte parent (e-mail + mot de passe ou lien magique), profils
  enfants rattachés, sessions sécurisées (cookie `HttpOnly`, `Secure`, `SameSite`), isolation
  des données par compte, protection CSRF.
- HSTS ajouté par le proxy TLS de production (pas par l'application, servie en HTTP en local).
