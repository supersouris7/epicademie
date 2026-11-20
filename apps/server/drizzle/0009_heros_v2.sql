-- Refonte des personnages (20/11/2026) : seuls Alex et Lina restent jouables. Les profils qui
-- avaient un autre héros (Tao, Ayla, Pixel) passent sur Alex ; leurs progrès ne changent pas.
UPDATE "profiles" SET "hero" = 'alex' WHERE "hero" NOT IN ('alex', 'lina');--> statement-breakpoint
DELETE FROM "owned_heroes" WHERE "hero" NOT IN ('alex', 'lina');--> statement-breakpoint
-- Chaque profil possède le héros qu'il porte (héros de départ).
INSERT INTO "owned_heroes" ("profile_id", "hero", "source")
SELECT "id", "hero", 'depart' FROM "profiles" ON CONFLICT DO NOTHING;
