-- Niveaux de difficulté 1 à 5 (docs/adr/0034) : contraintes élargies de 1-3 à 1-5.
-- Retour arrière (impossible si des réponses de niveau 4 ou 5 existent : les supprimer ou les ramener à 3 d'abord) :
--   ALTER TABLE "attempts" DROP CONSTRAINT "attempts_level_range";
--   ALTER TABLE "attempts" ADD CONSTRAINT "attempts_level_range" CHECK ("level" between 1 and 3);
--   ALTER TABLE "question_reports" DROP CONSTRAINT "question_reports_level_range";
--   ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_level_range" CHECK ("level" is null or "level" between 1 and 3);
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_level_range";--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_level_range" CHECK ("attempts"."level" between 1 and 5);--> statement-breakpoint
ALTER TABLE "question_reports" DROP CONSTRAINT "question_reports_level_range";--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_level_range" CHECK ("question_reports"."level" is null or "question_reports"."level" between 1 and 5);
