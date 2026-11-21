-- Session d'administration (21/11/2026) : mot de passe redemandé à chaque ouverture, 15 minutes.
-- Retour arrière : supprimer la colonne.
ALTER TABLE "auth_sessions" ADD COLUMN "admin_until" timestamp with time zone;