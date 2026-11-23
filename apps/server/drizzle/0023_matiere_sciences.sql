-- Matière unique « Sciences » (#76) : la matière « physique » devient « sciences » (domaine physique-chimie).
-- Les identifiants de chapitres (p5-…, p4-…, p3-…) et de notions ne changent pas : progression, tentatives et
-- récompenses (liés aux notions et chapitres) restent intacts ; seul le code de matière des parties et des
-- évaluations est renommé.
-- Retour arrière (après avoir remis le code précédent) :
--   UPDATE "sessions" SET "subject" = 'physique' WHERE "subject" = 'sciences';
--   UPDATE "evaluations" SET "subject" = 'physique' WHERE "subject" = 'sciences';
UPDATE "sessions" SET "subject" = 'sciences' WHERE "subject" = 'physique';--> statement-breakpoint
UPDATE "evaluations" SET "subject" = 'sciences' WHERE "subject" = 'physique';
