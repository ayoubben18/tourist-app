CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"circuit_id" integer,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;