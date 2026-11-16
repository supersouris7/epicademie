ALTER TABLE `profiles` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `birth_date` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `confused` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `skill_states` ADD `maintained` integer DEFAULT 0 NOT NULL;