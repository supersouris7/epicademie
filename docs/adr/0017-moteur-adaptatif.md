# 0017 — Moteur adaptatif et révisions espacées, déterministes et sans IA

- Statut : Acceptée
- Date : 2026-11-20

## Contexte

Chaque série d'entraînement doit proposer la bonne notion au bon niveau, sans répéter
inutilement, et faire revenir les notions avant qu'elles ne soient oubliées. Un modèle d'IA
générative serait coûteux, non reproductible et difficile à expliquer aux parents.

## Décision

Règles pures et testées dans `packages/engine/src/adaptive.ts` (série : `session.ts`,
répétition espacée : `srs.ts`) :

1. **État de chaque notion** (mêmes seuils que le suivi, ADR 0013), d'après les 10 dernières
   premières réponses : pas commencée, à travailler, en progression, à consolider, acquise.
2. **Niveau de départ** : 1 pour découvrir ou retravailler ; 2 en progression avancée (palier ≥ 2)
   ou à consolider ; 3 pour une notion acquise. Dans la série : niveau +1 après 2 réussites au
   niveau 1 (3 au-delà), −1 après 2 erreurs.
3. **Choix de la notion** (tirage pondéré) : poids selon l'état (à travailler 4, nouvelle ou en
   progression 3, à consolider 2, acquise 1) ; +2 si une révision est due, +1 de plus au-delà de
   7 jours de retard ; poids divisé par deux si la notion a déjà été travaillée aujourd'hui sans
   être due ; jamais deux fois de suite la même notion ; jamais deux fois le même énoncé.
4. **Variantes** : après une erreur, une question similaire (même notion, même niveau), 3 au
   plus par série. Le nombre de questions de la série ne change pas (4, ou 5 en calcul de tête).
5. **Aides** : une réussite au second essai (après l'indice) compte comme un échec de la
   première réponse ; l'état ne monte qu'avec des réussites sans aide.
6. **Répétition espacée** : réussite d'une série (≥ 80 %) → palier suivant, prochaine révision à
   J+2, J+5, puis tous les 30 jours une fois acquise (au plus une progression par jour) ; échec ou
   « je n'ai pas compris » → retour au palier 0, révision le lendemain.
7. **Révisions du jour** (page de la matière) : notions déjà étudiées dont la révision est due,
   et notions « à travailler » pas revues aujourd'hui ; priorité = jours de retard + 2 × poids de
   l'état ; 5 au plus. Aucune pénalité liée aux jours sans connexion : le retard fait seulement
   remonter la notion.
8. **Choix manuel** : l'enfant peut toujours choisir une notion précise ou tout un chapitre.

Données utilisées : palier, échéance, réponses récentes et jour de dernière pratique de chaque
notion (`skill_states`), déjà enregistrés.

## Conséquences

- Le comportement est reproductible et explicable (« cette notion revient parce que… »).
- Les seuils se changent en un seul endroit, avec leurs tests.

## Options écartées

- **IA générative** pour choisir ou rédiger les questions : coût, non-déterminisme, risque
  d'erreurs factuelles sans relecture.
- **Algorithmes de type SM-2 / FSRS** : plus fins, mais demandent des notes de difficulté
  ressentie et beaucoup plus de réponses par notion que n'en produit un élève de collège.
