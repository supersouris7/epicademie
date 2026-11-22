-- Élève autonome de moins de 15 ans (22/11/2026, #44) : e-mail et mot de passe facultatifs, code de
-- récupération haché, famille « autonome », invitations de rattachement.
-- Retour arrière : supprimer les comptes sans e-mail (familles autonomes), remettre NOT NULL sur
-- email et password_hash, supprimer la table family_invites et les colonnes recovery_hash, autonomous.
CREATE TABLE "family_invites" (
	"code_hash" text PRIMARY KEY NOT NULL,
	"family_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "recovery_hash" text;--> statement-breakpoint
ALTER TABLE "families" ADD COLUMN "autonomous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "family_invites" ADD CONSTRAINT "family_invites_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "family_invites_family_idx" ON "family_invites" USING btree ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_recovery_unique" ON "accounts" USING btree ("recovery_hash");