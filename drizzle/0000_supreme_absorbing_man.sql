CREATE TABLE `daily_puzzles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`mode` text NOT NULL,
	`seed_a` text NOT NULL,
	`seed_b` text,
	`target` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_puzzles_date_mode_uq` ON `daily_puzzles` (`date`,`mode`);--> statement-breakpoint
CREATE INDEX `daily_puzzles_date_idx` ON `daily_puzzles` (`date`);