ALTER TABLE "cities" RENAME COLUMN "city_id" TO "id";--> statement-breakpoint
ALTER TABLE "circuits" DROP CONSTRAINT "circuits_city_id_cities_city_id_fk";
--> statement-breakpoint
ALTER TABLE "points_of_interest" DROP CONSTRAINT "points_of_interest_city_id_cities_city_id_fk";
--> statement-breakpoint
ALTER TABLE "cities" ADD COLUMN "google_place_id" text;--> statement-breakpoint
ALTER TABLE "circuits" ADD CONSTRAINT "circuits_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_google_place_id_unique" UNIQUE("google_place_id");