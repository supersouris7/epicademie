-- Médaille de diamant (série réussie sans aide) : note de série élargie de 0-5 à 0-6.
-- Les 5 acquis jusqu'ici l'ont été sans aucune erreur ni aide : ils deviennent 6 (diamant), rien n'est perdu.
-- Retour arrière (les diamants redeviennent de l'or) :
--   UPDATE "skill_states" SET "best_series" = 5 WHERE "best_series" = 6;
--   ALTER TABLE "skill_states" DROP CONSTRAINT "skill_states_best_range";
--   ALTER TABLE "skill_states" ADD CONSTRAINT "skill_states_best_range" CHECK ("best_series" between 0 and 5);
ALTER TABLE "skill_states" DROP CONSTRAINT "skill_states_best_range";--> statement-breakpoint
ALTER TABLE "skill_states" ADD CONSTRAINT "skill_states_best_range" CHECK ("skill_states"."best_series" between 0 and 6);--> statement-breakpoint
UPDATE "skill_states" SET "best_series" = 6 WHERE "best_series" = 5;
