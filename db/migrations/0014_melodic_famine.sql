ALTER TABLE "comments" RENAME TO "circuit_comments";--> statement-breakpoint
ALTER TABLE "circuit_comments" DROP CONSTRAINT "comments_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "circuit_comments" DROP CONSTRAINT "comments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "circuit_comments" ADD CONSTRAINT "circuit_comments_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit_comments" ADD CONSTRAINT "circuit_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;