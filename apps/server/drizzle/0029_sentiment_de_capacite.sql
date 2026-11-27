-- « Je me sens capable ? » : réponse facultative de fin de séance (1 à 3), rangée avec la partie
-- (donc exportée et effacée avec la famille). Colonne nullable : compatible avec le code précédent.
-- Retour arrière :
--   ALTER TABLE "sessions" DROP CONSTRAINT "sessions_feeling_range";
--   ALTER TABLE "sessions" DROP COLUMN "feeling";
ALTER TABLE "sessions" ADD COLUMN "feeling" smallint;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_feeling_range" CHECK ("sessions"."feeling" between 1 and 3);
