-- Signalements généraux et erreurs agrégées (22/11/2026).
-- Retour arrière : DELETE FROM question_reports WHERE kind = 'general'; supprimer les contraintes
-- et colonnes ajoutées (kind, screen, app_version, exported_at), remettre NOT NULL sur
-- skill_id/level/seed/skill_version, puis DROP TABLE client_errors.
CREATE TABLE "client_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" text NOT NULL,
	"message" text NOT NULL,
	"stack_top" text,
	"release" text,
	"path" text,
	"count" integer DEFAULT 1 NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"exported_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "question_reports" DROP CONSTRAINT "question_reports_level_range";--> statement-breakpoint
ALTER TABLE "question_reports" ALTER COLUMN "skill_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "question_reports" ALTER COLUMN "level" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "question_reports" ALTER COLUMN "seed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "question_reports" ALTER COLUMN "skill_version" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "question_reports" ADD COLUMN "kind" text DEFAULT 'question' NOT NULL;--> statement-breakpoint
ALTER TABLE "question_reports" ADD COLUMN "screen" text;--> statement-breakpoint
ALTER TABLE "question_reports" ADD COLUMN "app_version" text;--> statement-breakpoint
ALTER TABLE "question_reports" ADD COLUMN "exported_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "client_errors_fingerprint_uq" ON "client_errors" USING btree ("fingerprint");--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_question_fields" CHECK ("question_reports"."kind" = 'general' or "question_reports"."skill_id" is not null);--> statement-breakpoint
ALTER TABLE "question_reports" ADD CONSTRAINT "question_reports_level_range" CHECK ("question_reports"."level" is null or "question_reports"."level" between 1 and 3);