-- Administration par « opérateur » (#89) : plus de rôle « admin » ni de session admin sur les comptes de jeu.
-- Les comptes admin repassent en parent (aucune donnée perdue) ; l'auteur des décisions sur les notions
-- devient le nom de l'opérateur (l'ancien lien vers un compte est abandonné) ; journal d'audit des accès.
-- Retour arrière (dans cet ordre) :
--   ALTER TABLE "accounts" DROP CONSTRAINT "accounts_role_valid";
--   ALTER TABLE "accounts" ADD CONSTRAINT "accounts_role_valid" CHECK ("role" in ('parent', 'admin'));
--   -- (les comptes redevenus « parent » ne retrouvent le rôle admin que par UPDATE manuel)
--   ALTER TABLE "auth_sessions" ADD COLUMN "admin_until" timestamp with time zone;
--   ALTER TABLE "content_events" ADD COLUMN "account_id" uuid REFERENCES "accounts"("id") ON DELETE SET NULL;
--   ALTER TABLE "content_events" DROP COLUMN "operator";
--   DROP INDEX "accounts_created_at_idx"; DROP TABLE "admin_audit";
CREATE TABLE "admin_audit" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_audit_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"operator" text NOT NULL,
	"action" text NOT NULL,
	"account_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_role_valid";--> statement-breakpoint
ALTER TABLE "content_events" DROP CONSTRAINT "content_events_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN "operator" text;--> statement-breakpoint
CREATE INDEX "admin_audit_at_idx" ON "admin_audit" USING btree ("at");--> statement-breakpoint
CREATE INDEX "admin_audit_account_idx" ON "admin_audit" USING btree ("account_id","at");--> statement-breakpoint
CREATE INDEX "accounts_created_at_idx" ON "accounts" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "auth_sessions" DROP COLUMN "admin_until";--> statement-breakpoint
ALTER TABLE "content_events" DROP COLUMN "account_id";--> statement-breakpoint
UPDATE "accounts" SET "role" = 'parent' WHERE "role" <> 'parent';--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_role_valid" CHECK ("accounts"."role" = 'parent');