CREATE TABLE "guides_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"guide_id" uuid,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "guides_comments" ADD CONSTRAINT "guides_comments_guide_id_guide_profiles_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide_profiles"("id") ON DELETE no action ON UPDATE no action;