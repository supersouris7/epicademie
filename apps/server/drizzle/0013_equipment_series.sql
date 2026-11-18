ALTER TABLE `profiles` ADD `equipped` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `skill_states` ADD `best_series` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `skill_states` SET `best_series` = CASE `stage` WHEN 3 THEN 5 WHEN 2 THEN 4 WHEN 1 THEN 3 ELSE 0 END;
