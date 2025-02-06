ALTER TABLE "guide_profiles" DROP CONSTRAINT "guide_profiles_guide_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "guide_profiles" ADD CONSTRAINT "guide_profiles_guide_id_users_additional_info_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."users_additional_info"("id") ON DELETE no action ON UPDATE no action;