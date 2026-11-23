-- Validation d'adresse e-mail et connexion Google (#43). Les comptes existants sont considérés vérifiés.
-- Retour arrière :
--   DROP TABLE "email_verifications";
--   ALTER TABLE "accounts" DROP COLUMN "email_verified_at", DROP COLUMN "google_sub";
CREATE TABLE "email_verifications" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "google_sub" text;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_verifications_account_idx" ON "email_verifications" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_google_sub_unique" ON "accounts" USING btree ("google_sub");--> statement-breakpoint
UPDATE "accounts" SET "email_verified_at" = now() WHERE "email" IS NOT NULL;
