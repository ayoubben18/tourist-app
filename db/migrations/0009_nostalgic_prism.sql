ALTER TABLE "guide_profiles" RENAME COLUMN "guide_id" TO "id";--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_guide_id_guide_profiles_guide_id_fk";
--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guide_id_guide_profiles_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_profiles" ADD CONSTRAINT "guide_profiles_id_users_additional_info_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users_additional_info"("id") ON DELETE no action ON UPDATE no action;