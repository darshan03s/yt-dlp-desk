CREATE TABLE `download_history` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`source` text NOT NULL,
	`thumbnail` text NOT NULL,
	`thumbnail_local` text NOT NULL,
	`uploader` text NOT NULL,
	`uploader_url` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`duration` text NOT NULL,
	`format` text NOT NULL,
	`command` text NOT NULL,
	`complete_output` text NOT NULL,
	`download_path` text NOT NULL,
	`download_progress` real NOT NULL,
	`download_progress_string` text NOT NULL,
	`added_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`download_completed_at` text NOT NULL,
	`download_status` text NOT NULL,
	`download_command_base` text NOT NULL,
	`download_command_args` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `extra_commands_history` (
	`id` text PRIMARY KEY NOT NULL,
	`command` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `url_history` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`source` text NOT NULL,
	`thumbnail` text NOT NULL,
	`thumbnail_local` text NOT NULL,
	`uploader` text NOT NULL,
	`uploader_url` text NOT NULL,
	`duration` text,
	`created_at` text NOT NULL,
	`added_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
