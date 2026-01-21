CREATE TABLE `image_forwards` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`platform_image_id` text NOT NULL,
	`link` text NOT NULL,
	`forward_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`forward_config_id` text NOT NULL,
	`image_id` text NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx-image_forwards-image_id` ON `image_forwards` (`image_id`);--> statement-breakpoint
CREATE TABLE `image_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`platform_image_id` text NOT NULL,
	`link` text NOT NULL,
	`imported_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`image_id` text NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx-image_imports-image_id` ON `image_imports` (`image_id`);--> statement-breakpoint
CREATE TABLE `images` (
	`id` text PRIMARY KEY NOT NULL,
	`alt` text,
	`path` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`added_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`small_size` integer DEFAULT 0 NOT NULL,
	`large_size` integer DEFAULT 0 NOT NULL,
	`original_size` integer DEFAULT 0 NOT NULL,
	`original_path` text
);
--> statement-breakpoint
CREATE INDEX `idx-images-created_at` ON `images` (`created_at`);--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx-logs-created_at` ON `logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx-logs-type` ON `logs` (`type`);--> statement-breakpoint
CREATE TABLE `post_forwards` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`platform_post_id` text NOT NULL,
	`link` text NOT NULL,
	`forward_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`forward_config_id` text NOT NULL,
	`post_id` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx-post_forwards-post_id` ON `post_forwards` (`post_id`);--> statement-breakpoint
CREATE TABLE `post_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`platform_post_id` text NOT NULL,
	`link` text NOT NULL,
	`imported_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`post_id` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx-post_imports-post_id` ON `post_imports` (`post_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`added_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`content` text NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`images_order` text,
	`parent_post_id` text,
	FOREIGN KEY (`parent_post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx-posts-created_at` ON `posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx-posts-parent_post_id` ON `posts` (`parent_post_id`);--> statement-breakpoint
CREATE TABLE `posts_to_images` (
	`post_id` text NOT NULL,
	`image_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `image_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`image_id`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
