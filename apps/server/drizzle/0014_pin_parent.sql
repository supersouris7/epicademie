-- Code PIN de l'Espace parent (21/11/2026) : empreinte du PIN et compteur d'erreurs (blocage).
-- Retour arrière : supprimer les trois colonnes.
ALTER TABLE "accounts" ADD COLUMN "parent_pin_hash" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "pin_failures" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "pin_locked_until" timestamp with time zone;