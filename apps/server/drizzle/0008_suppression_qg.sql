-- Suppression du QG (décision du 20/11/2026) : les cosmétiques achetés sont remboursés au prix
-- du catalogue (pièces et rubis) avant la suppression des tables.
UPDATE "profiles" AS p
SET "coins" = p."coins" + r.coins, "rubies" = p."rubies" + r.rubies
FROM (
  SELECT "profile_id",
    SUM(CASE "cosmetic" WHEN 'fond-foret' THEN 400 WHEN 'cadre-feu' THEN 300 ELSE 0 END) AS coins,
    SUM(CASE "cosmetic" WHEN 'fond-nuit' THEN 2 WHEN 'fond-ocean' THEN 3 WHEN 'cadre-or' THEN 4
      WHEN 'titre-legende' THEN 8 ELSE 0 END) AS rubies
  FROM "owned_cosmetics" GROUP BY "profile_id"
) AS r
WHERE p."id" = r."profile_id";--> statement-breakpoint
DROP TABLE "hq_layouts" CASCADE;--> statement-breakpoint
DROP TABLE "owned_cosmetics" CASCADE;
