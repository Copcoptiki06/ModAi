CREATE TABLE `ai_interactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_username` text NOT NULL,
	`question_id` integer,
	`kind` text NOT NULL,
	`content` text NOT NULL,
	`helped` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_username` text NOT NULL,
	`question_id` integer NOT NULL,
	`answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`hints_used` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`teacher_username` text NOT NULL,
	`grade` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer NOT NULL,
	`student_username` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`class_id` integer,
	`teacher_username` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`unit` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grade` integer NOT NULL,
	`unit` text NOT NULL,
	`topic` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`options_json` text DEFAULT '[]' NOT NULL,
	`correct_answer` text NOT NULL,
	`hint` text NOT NULL,
	`image_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text,
	`name` text NOT NULL,
	`email` text,
	`teacher_username` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
