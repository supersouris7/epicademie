CREATE TABLE "owned_heroes" (
	"profile_id" uuid NOT NULL,
	"hero" text NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "owned_heroes_profile_id_hero_pk" PRIMARY KEY("profile_id","hero")
);
--> statement-breakpoint
ALTER TABLE "owned_heroes" ADD CONSTRAINT "owned_heroes_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Chaque profil existant garde son héros actuel comme héros de départ (aucune perte).
INSERT INTO "owned_heroes" ("profile_id", "hero", "source") SELECT "id", "hero", 'depart' FROM "profiles" ON CONFLICT DO NOTHING;
