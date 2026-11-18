ALTER TABLE `boss_records` ADD `best_medal` text DEFAULT 'bronze' NOT NULL;--> statement-breakpoint
UPDATE `boss_records` SET `best_medal` = CASE WHEN `best_hearts` >= 3 THEN 'or' WHEN `best_hearts` = 2 THEN 'argent' ELSE 'bronze' END;
