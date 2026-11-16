CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`theme` text DEFAULT 'auto' NOT NULL,
	`sound_on` integer DEFAULT true NOT NULL,
	`music_on` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
