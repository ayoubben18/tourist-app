ALTER TABLE "bookings" DROP CONSTRAINT "bookings_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tourist_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_guide_id_guide_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "circuit_comments" DROP CONSTRAINT "circuit_comments_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "circuit_comments" DROP CONSTRAINT "circuit_comments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "circuit_points" DROP CONSTRAINT "circuit_points_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "circuits" DROP CONSTRAINT "circuits_creator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "circuits" DROP CONSTRAINT "circuits_city_id_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "guide_profiles" DROP CONSTRAINT "guide_profiles_id_users_additional_info_id_fk";
--> statement-breakpoint
ALTER TABLE "guide_profiles" DROP CONSTRAINT "guide_profiles_authorization_document_objects_id_fk";
--> statement-breakpoint
ALTER TABLE "guides_comments" DROP CONSTRAINT "guides_comments_guide_id_guide_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "guides_comments" DROP CONSTRAINT "guides_comments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "points_of_interest" DROP CONSTRAINT "points_of_interest_city_id_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tourist_id_users_id_fk" FOREIGN KEY ("tourist_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guide_id_guide_profiles_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit_comments" ADD CONSTRAINT "circuit_comments_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit_comments" ADD CONSTRAINT "circuit_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit_points" ADD CONSTRAINT "circuit_points_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuits" ADD CONSTRAINT "circuits_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuits" ADD CONSTRAINT "circuits_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_profiles" ADD CONSTRAINT "guide_profiles_id_users_additional_info_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users_additional_info"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_profiles" ADD CONSTRAINT "guide_profiles_authorization_document_objects_id_fk" FOREIGN KEY ("authorization_document") REFERENCES "storage"."objects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guides_comments" ADD CONSTRAINT "guides_comments_guide_id_guide_profiles_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guides_comments" ADD CONSTRAINT "guides_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;