CREATE TABLE `boss_records` (
	`profile_id` text NOT NULL,
	`chapter_id` text NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`best_hearts` integer DEFAULT 0 NOT NULL,
	`first_won_at` text NOT NULL,
	PRIMARY KEY(`profile_id`, `chapter_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`profile_id` text NOT NULL,
	`item` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`profile_id`, `item`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `grade` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `ammo` text;--> statement-breakpoint
-- Nassim s'appelle maintenant Alex (la valeur par défaut de la colonne reste fixée par le code à la création).
UPDATE `profiles` SET `hero` = 'alex' WHERE `hero` = 'nassim';--> statement-breakpoint
ALTER TABLE `sessions` ADD `battle` text;