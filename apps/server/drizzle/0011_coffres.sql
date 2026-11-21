-- Coffres (21/11/2026) : la partie retient la rareté du coffre reçu. Avant, chaque série
-- d'entraînement terminée avec au moins une réponse en donnait un (rareté non gardée : « commun »),
-- pour que le badge « Chasseur de coffres » ne perde rien. Retour arrière : supprimer la colonne.
ALTER TABLE "sessions" ADD COLUMN "chest" text;--> statement-breakpoint
UPDATE "sessions" SET "chest" = 'commun'
WHERE "mode" <> 'boss' AND "finished_at" IS NOT NULL AND "answered" > 0;
