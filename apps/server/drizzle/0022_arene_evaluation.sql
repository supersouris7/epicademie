-- Arène d'évaluation (22/11/2026, #12) : épreuves, résultats par compétence, chapitres déclarés.
-- Retour arrière (suppression de données : accord du client en production) :
--   DROP TABLE "evaluation_competences", "evaluations", "studied_chapters";
--   DELETE FROM "sessions" WHERE "mode" = 'evaluation';
-- (la seconde commande supprime aussi les "attempts" de ces parties, par cascade ; sans elle l'ancien contrat refuse le mode)
CREATE TABLE "evaluation_competences" (
	"evaluation_id" uuid NOT NULL,
	"competence_id" text NOT NULL,
	"role" text NOT NULL,
	"domain" text NOT NULL,
	"essential" boolean NOT NULL,
	"state" text NOT NULL,
	"rate" smallint,
	"weight" smallint DEFAULT 0 NOT NULL,
	"arena_answers" smallint DEFAULT 0 NOT NULL,
	"weakest_skill_id" text,
	CONSTRAINT "evaluation_competences_evaluation_id_competence_id_pk" PRIMARY KEY("evaluation_id","competence_id"),
	CONSTRAINT "evaluation_competences_role" CHECK ("evaluation_competences"."role" in ('score', 'prerequis', 'avance')),
	CONSTRAINT "evaluation_competences_state" CHECK ("evaluation_competences"."state" in ('non-etudiee', 'non-evaluee', 'evaluation-insuffisante', 'en-difficulte', 'maitrisee', 'a-consolider', 'en-cours')),
	CONSTRAINT "evaluation_competences_rate_range" CHECK ("evaluation_competences"."rate" is null or "evaluation_competences"."rate" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"kind" text NOT NULL,
	"profile_grade" text NOT NULL,
	"referential_grade" text NOT NULL,
	"referential_version" smallint NOT NULL,
	"school_year" smallint NOT NULL,
	"status" text DEFAULT 'en-cours' NOT NULL,
	"state" jsonb,
	"partial" boolean DEFAULT false NOT NULL,
	"mastery" smallint,
	"coverage" smallint,
	"studied" smallint,
	"evaluated_count" smallint DEFAULT 0 NOT NULL,
	"mastered_count" smallint DEFAULT 0 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"coins" integer DEFAULT 0 NOT NULL,
	"chest" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	CONSTRAINT "evaluations_kind" CHECK ("evaluations"."kind" in ('origines', 'progression', 'maitres')),
	CONSTRAINT "evaluations_status" CHECK ("evaluations"."status" in ('en-cours', 'terminee', 'expiree')),
	CONSTRAINT "evaluations_mastery_range" CHECK ("evaluations"."mastery" is null or "evaluations"."mastery" between 0 and 100),
	CONSTRAINT "evaluations_coverage_range" CHECK ("evaluations"."coverage" is null or "evaluations"."coverage" between 0 and 100),
	CONSTRAINT "evaluations_studied_range" CHECK ("evaluations"."studied" is null or "evaluations"."studied" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "studied_chapters" (
	"profile_id" uuid NOT NULL,
	"school_year" smallint NOT NULL,
	"chapter_id" text NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studied_chapters_profile_id_school_year_chapter_id_pk" PRIMARY KEY("profile_id","school_year","chapter_id"),
	CONSTRAINT "studied_chapters_status" CHECK ("studied_chapters"."status" in ('vu', 'pas-vu', 'ne-sait-pas'))
);
--> statement-breakpoint
ALTER TABLE "evaluation_competences" ADD CONSTRAINT "evaluation_competences_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studied_chapters" ADD CONSTRAINT "studied_chapters_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "evaluations_session_idx" ON "evaluations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "evaluations_profile_subject_idx" ON "evaluations" USING btree ("profile_id","subject","finished_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "evaluations_open_idx" ON "evaluations" USING btree ("profile_id","subject") WHERE "evaluations"."status" = 'en-cours';