# 0014 — Fiabilité pédagogique : validation automatique, signalements, désactivation

- Statut : Acceptée
- Date : 2026-11-20

## Contexte

Le contenu est généré par programme (des milliers de variantes par notion) et n'est pas relu
question par question. Une réponse attendue fausse, une erreur typique qui contredit la bonne
réponse ou un QCM aux propositions en double ferait douter l'enfant et le parent.

## Décision

- **Modèle pédagogique** : chaque notion est rattachée à une matière, une classe, un chapitre, un
  domaine, une référence au programme (`lesson.source`), une **version** (`Skill.version`) ;
  chaque question à un niveau (difficulté 1–3), un type de réponse, une correction pas à pas et
  un indice. L'**état de validation** d'une notion est calculé : désactivée, contrôles
  automatiques en échec, signalée, relue par l'équipe, ou contrôles automatiques réussis.
- **Validation automatique** (`packages/content/src/validate.ts`), bloquante en CI sur toutes les
  notions × 3 niveaux × 20 variantes : textes non vides et sans trace de bug, bonne réponse
  saisissable et **jugée juste par la correction** (y compris ses formes équivalentes), erreurs
  typiques **jamais égales à une réponse juste et toujours jugées fausses**, QCM sans doublon,
  bornes numériques, figures cohérentes, et **même énoncé ⇒ même réponse** d'une variante à
  l'autre. Premier passage : 60 problèmes signalés, dont 2 vraies contradictions corrigées dans
  l'aire du disque et le volume du cylindre (rayon 2 : 2πr = πr² ; rayon 10 : 314 accepté et
  « non arrondi » à la fois).
- **Signalements** : bouton « Signaler cette question » sur chaque question (entraînement, combat),
  motif à choisir parmi cinq, précision facultative ; la question exacte (notion, niveau, graine,
  version) est enregistrée et régénérée dans la console.
  Signalement général distinct (« Signaler un problème sur cet écran », menu, Espace parent, drapeau du mode debug
  activable dans /admin, réglage propre à l’appareil).
- **Administration** (`/admin`, rôle administrateur) : traitement des signalements, liste des
  notions et de leur état, désactivation/réactivation, marquage « relue » de la version, et
  **historique** de chaque décision (`content_events`).
- **Désactivation** : la notion n'est plus proposée (liste des notions, « tout le chapitre »,
  réserves des combats ; un boss sans question disponible est « en maintenance ») ; les réponses
  passées restent dans le suivi.

## Conséquences

- Une régression de générateur qui casse une question fait échouer la CI.
- La validation automatique ne juge pas la qualité pédagogique : la relecture humaine reste
  tracée par notion et par version.

## Options écartées

- **Désactiver une variante (graine) précise** : un défaut vient presque toujours du générateur ;
  on désactive la notion et on corrige le générateur (nouvelle version).
- **Texte libre obligatoire** dans les signalements : le motif suffit et évite d'exposer des
  données personnelles écrites par un enfant.
