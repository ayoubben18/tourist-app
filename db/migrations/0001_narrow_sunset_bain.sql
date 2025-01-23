CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."guide_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('visitor', 'guide', 'admin');--> statement-breakpoint
CREATE TABLE "bookings" (
	"booking_id" serial PRIMARY KEY NOT NULL,
	"circuit_id" integer,
	"tourist_id" uuid,
	"guide_id" uuid,
	"booking_date" date NOT NULL,
	"start_time" time NOT NULL,
	"status" "booking_status",
	"created_at" timestamp DEFAULT now(),
	"total_price" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "circuit_points" (
	"circuit_id" integer NOT NULL,
	"poi_id" integer NOT NULL,
	"sequence_order" integer NOT NULL,
	CONSTRAINT "circuit_points_circuit_id_poi_id_pk" PRIMARY KEY("circuit_id","poi_id")
);
--> statement-breakpoint
CREATE TABLE "circuits" (
	"circuit_id" serial PRIMARY KEY NOT NULL,
	"creator_id" uuid,
	"city_id" integer,
	"name" text NOT NULL,
	"description" text,
	"estimated_duration" integer,
	"distance" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"is_public" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"city_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"description" text,
	"coordinates" "point"
);
--> statement-breakpoint
CREATE TABLE "guide_profiles" (
	"guide_id" uuid PRIMARY KEY NOT NULL,
	"verification_status" "guide_status",
	"rating" numeric(3, 2),
	"price_per_hour" numeric(10, 2),
	"available_hours" json,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "points_of_interest" (
	"poi_id" serial PRIMARY KEY NOT NULL,
	"city_id" integer,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"coordinates" "point",
	"estimated_duration" integer,
	"opening_hours" json,
	"address" text
);
--> statement-breakpoint
CREATE TABLE "users_additional_info" (
	"id" uuid NOT NULL,
	"bio" text,
	"avatar_url" text,
	"full_name" text,
	"role" "user_roles",
	CONSTRAINT "users_additional_info_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_circuit_id_circuits_circuit_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("circuit_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tourist_id_users_id_fk" FOREIGN KEY ("tourist_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guide_id_guide_profiles_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide_profiles"("guide_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit_points" ADD CONSTRAINT "circuit_points_circuit_id_circuits_circuit_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("circuit_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit_points" ADD CONSTRAINT "circuit_points_poi_id_points_of_interest_poi_id_fk" FOREIGN KEY ("poi_id") REFERENCES "public"."points_of_interest"("poi_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuits" ADD CONSTRAINT "circuits_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuits" ADD CONSTRAINT "circuits_city_id_cities_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("city_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_profiles" ADD CONSTRAINT "guide_profiles_guide_id_users_id_fk" FOREIGN KEY ("guide_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_city_id_cities_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("city_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_additional_info" ADD CONSTRAINT "fk_users_additional_info_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;