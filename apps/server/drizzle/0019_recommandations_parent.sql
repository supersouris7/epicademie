-- Recommandations de travail d'un parent à son enfant (22/11/2026, #75).
-- Retour arrière : DROP TABLE "recommendations"; (aucune autre table touchée).
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"skill_id" text NOT NULL,
	"note" text,
	"status" text DEFAULT 'en-attente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"correct" integer,
	"answered" integer,
	CONSTRAINT "recommendations_note_len" CHECK ("recommendations"."note" is null or char_length("recommendations"."note") <= 140),
	CONSTRAINT "recommendations_status" CHECK ("recommendations"."status" in ('en-attente', 'faite', 'annulee'))
);
--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recommendations_profile_status_idx" ON "recommendations" USING btree ("profile_id","status");