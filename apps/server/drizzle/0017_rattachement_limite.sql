-- Limite des tentatives de rattachement par compte (22/11/2026, #44).
-- Retour arrière : supprimer les deux colonnes.
ALTER TABLE "accounts" ADD COLUMN "join_failures" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "join_locked_until" timestamp with time zone;