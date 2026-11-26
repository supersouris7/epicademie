-- Rôles d'administration (docs/adr/0036) : ajouts seuls (deux tables, deux colonnes nullables).
-- L'image précédente reste utilisable sur ce schéma. Retour arrière :
--   DROP TABLE "admin_access_events";
--   DROP TABLE "admin_sessions";
--   ALTER TABLE "admin_audit" DROP COLUMN "admin_sub";
--   ALTER TABLE "content_events" DROP COLUMN "admin_sub";
--   DELETE FROM drizzle.__drizzle_migrations WHERE created_at = 1796000000000;
CREATE TABLE "admin_access_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_access_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"operator" text NOT NULL,
	"admin_sub" text,
	"action" text NOT NULL,
	"detail" text
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"sub" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_audit" ADD COLUMN "admin_sub" text;--> statement-breakpoint
ALTER TABLE "content_events" ADD COLUMN "admin_sub" text;--> statement-breakpoint
CREATE INDEX "admin_access_events_at_idx" ON "admin_access_events" USING btree ("at");--> statement-breakpoint
CREATE INDEX "admin_sessions_sub_idx" ON "admin_sessions" USING btree ("sub");