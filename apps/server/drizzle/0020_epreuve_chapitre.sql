-- Épreuve du chapitre (22/11/2026, #92) : drapeau sur la partie + récompense unique par chapitre et profil.
-- Retour arrière : DROP TABLE "chapter_rewards"; ALTER TABLE "sessions" DROP COLUMN "epreuve";
CREATE TABLE "chapter_rewards" (
	"profile_id" uuid NOT NULL,
	"chapter_id" text NOT NULL,
	"session_id" uuid,
	"obtained_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chapter_rewards_profile_id_chapter_id_pk" PRIMARY KEY("profile_id","chapter_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "epreuve" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chapter_rewards" ADD CONSTRAINT "chapter_rewards_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;