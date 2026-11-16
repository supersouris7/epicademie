CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`profile_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`level` integer NOT NULL,
	`seed` integer NOT NULL,
	`variant` integer NOT NULL,
	`response` text NOT NULL,
	`correct` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`xp` integer NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempts_session_idx` ON `attempts` (`session_id`);--> statement-breakpoint
CREATE INDEX `attempts_profile_skill_idx` ON `attempts` (`profile_id`,`skill_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`mode` text NOT NULL,
	`subject` text NOT NULL,
	`chapter_id` text NOT NULL,
	`skill_id` text,
	`started_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`finished_at` text,
	`answered` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `skill_states` (
	`profile_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`stage` integer DEFAULT 0 NOT NULL,
	`due` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`recent` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`profile_id`, `skill_id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
