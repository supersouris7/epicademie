-- Amis d'autres familles (21/11/2026) : code ami par profil (attribué à la première visite de
-- « Mes amis »), amitiés à double validation (ami + parents). Retour arrière : supprimer la table
-- et la colonne.
CREATE TABLE "friendships" (
	"profile_a" uuid NOT NULL,
	"profile_b" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"accepted_at" timestamp with time zone,
	"parent_a_at" timestamp with time zone,
	"parent_b_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_profile_a_profile_b_pk" PRIMARY KEY("profile_a","profile_b"),
	CONSTRAINT "friendships_ordered" CHECK ("friendships"."profile_a" < "friendships"."profile_b")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "friend_code" text;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_profile_a_profiles_id_fk" FOREIGN KEY ("profile_a") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_profile_b_profiles_id_fk" FOREIGN KEY ("profile_b") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friendships_b_idx" ON "friendships" USING btree ("profile_b");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_friend_code_idx" ON "profiles" USING btree ("friend_code");