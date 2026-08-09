CREATE TABLE `add_ons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trip_package_id` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`is_optional` boolean DEFAULT true,
	CONSTRAINT `add_ons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` varchar(500),
	`content` text NOT NULL,
	`hero_image` text,
	`author` varchar(100) DEFAULT 'TripNaari Team',
	`category` varchar(100),
	`tags` json DEFAULT (JSON_ARRAY()),
	`is_published` boolean DEFAULT true,
	`seo_title` varchar(255),
	`seo_description` text,
	`published_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `booking_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int,
	`trip_package_id` int,
	`departure_id` int,
	`travelers` int NOT NULL,
	`total_amount` int,
	`status` varchar(50) DEFAULT 'pending',
	`special_requests` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `booking_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`category` varchar(50) NOT NULL,
	`priority` varchar(20) DEFAULT 'normal',
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` varchar(50) DEFAULT 'new',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `day_itineraries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trip_package_id` int NOT NULL,
	`day_number` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`location` varchar(150),
	`meals_included` json DEFAULT (JSON_ARRAY()),
	`activities` json DEFAULT (JSON_ARRAY()),
	`accommodation` varchar(255),
	`travel_notes` text,
	`image` text,
	CONSTRAINT `day_itineraries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departure_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trip_package_id` int NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`seats_total` int DEFAULT 16,
	`seats_booked` int DEFAULT 0,
	`price` int,
	`status` varchar(30) DEFAULT 'open',
	`is_guaranteed` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `departure_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exclusions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trip_package_id` int NOT NULL,
	`text` varchar(255) NOT NULL,
	CONSTRAINT `exclusions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` varchar(500) NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(100),
	`trip_package_id` int,
	`order` int DEFAULT 0,
	`is_published` boolean DEFAULT true,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` text NOT NULL,
	`alt` varchar(255),
	`caption` varchar(255),
	`trip_package_id` int,
	`tags` json DEFAULT (JSON_ARRAY()),
	`uploaded_at` timestamp DEFAULT (now()),
	CONSTRAINT `gallery_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hotel_previews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trip_package_id` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`category` varchar(50),
	`location` varchar(150),
	`image` text,
	`amenities` json DEFAULT (JSON_ARRAY()),
	`confirmation_timeline` varchar(255) DEFAULT 'Hotel name shared 7 days before departure',
	`is_tbc` boolean DEFAULT false,
	CONSTRAINT `hotel_previews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inclusions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trip_package_id` int NOT NULL,
	`text` varchar(255) NOT NULL,
	`category` varchar(100),
	`icon` varchar(50),
	CONSTRAINT `inclusions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`destination` varchar(150),
	`travel_month` varchar(50),
	`travelers` int DEFAULT 1,
	`travel_style` varchar(100),
	`budget` varchar(50),
	`message` text,
	`consent` boolean DEFAULT true,
	`source` varchar(100) DEFAULT 'website',
	`status` varchar(50) DEFAULT 'new',
	`notes` text,
	`follow_up_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(150),
	`source` varchar(50) DEFAULT 'footer',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `policy_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`version` int DEFAULT 1,
	`last_updated` timestamp DEFAULT (now()),
	`is_published` boolean DEFAULT true,
	CONSTRAINT `policy_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `policy_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `refund_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`booking_request_id` int,
	`lead_id` int,
	`reason` text NOT NULL,
	`amount_requested` int,
	`policy_acknowledged` boolean DEFAULT false,
	`status` varchar(50) DEFAULT 'pending',
	`admin_notes` text,
	`created_at` timestamp DEFAULT (now()),
	`resolved_at` timestamp,
	CONSTRAINT `refund_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` json,
	`description` text,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`location` varchar(100),
	`trip_slug` varchar(150),
	`rating` int DEFAULT 5,
	`content` text NOT NULL,
	`image` text,
	`is_featured` boolean DEFAULT false,
	`is_approved` boolean DEFAULT true,
	`travel_date` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trip_leaders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(150) NOT NULL,
	`bio` text,
	`specialties` json DEFAULT (JSON_ARRAY()),
	`languages` json DEFAULT (JSON_ARRAY()),
	`experience_years` int DEFAULT 3,
	`trips_led` int DEFAULT 50,
	`image` text,
	`instagram` varchar(100),
	`is_verified` boolean DEFAULT true,
	`safety_training` boolean DEFAULT true,
	`is_published` boolean DEFAULT true,
	CONSTRAINT `trip_leaders_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_leaders_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `trip_packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150) NOT NULL,
	`destination_slug` varchar(100),
	`title` varchar(255) NOT NULL,
	`short_description` varchar(500),
	`long_description` text,
	`duration_days` int NOT NULL,
	`duration_nights` int NOT NULL,
	`price_from` int NOT NULL,
	`price_original` int,
	`group_size_min` int DEFAULT 8,
	`group_size_max` int DEFAULT 16,
	`difficulty` varchar(50),
	`comfort_level` varchar(50),
	`is_women_only` boolean DEFAULT true,
	`is_family_friendly` boolean DEFAULT false,
	`is_featured` boolean DEFAULT false,
	`hero_image` text,
	`gallery` json DEFAULT (JSON_ARRAY()),
	`highlights` json DEFAULT (JSON_ARRAY()),
	`rating_avg` decimal(3,2) DEFAULT '4.9',
	`rating_count` int DEFAULT 127,
	`seo_title` varchar(255),
	`seo_description` text,
	`itinerary_change_policy` text,
	`itinerary_pdf` text,
	`is_published` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `trip_packages_id` PRIMARY KEY(`id`),
	CONSTRAINT `trip_packages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `add_ons` ADD CONSTRAINT `add_ons_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD CONSTRAINT `booking_requests_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD CONSTRAINT `booking_requests_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD CONSTRAINT `booking_requests_departure_id_departure_dates_id_fk` FOREIGN KEY (`departure_id`) REFERENCES `departure_dates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `day_itineraries` ADD CONSTRAINT `day_itineraries_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departure_dates` ADD CONSTRAINT `departure_dates_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exclusions` ADD CONSTRAINT `exclusions_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `faqs` ADD CONSTRAINT `faqs_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gallery_assets` ADD CONSTRAINT `gallery_assets_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hotel_previews` ADD CONSTRAINT `hotel_previews_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inclusions` ADD CONSTRAINT `inclusions_trip_package_id_trip_packages_id_fk` FOREIGN KEY (`trip_package_id`) REFERENCES `trip_packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refund_requests` ADD CONSTRAINT `refund_requests_booking_request_id_booking_requests_id_fk` FOREIGN KEY (`booking_request_id`) REFERENCES `booking_requests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refund_requests` ADD CONSTRAINT `refund_requests_lead_id_leads_id_fk` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE no action ON UPDATE no action;