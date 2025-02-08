ALTER TABLE "circuits" RENAME COLUMN "circuit_id" TO "id";--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_circuit_id_circuits_circuit_id_fk";
--> statement-breakpoint
ALTER TABLE "circuit_points" DROP CONSTRAINT "circuit_points_circuit_id_circuits_circuit_id_fk";
--> statement-breakpoint
ALTER TABLE "circuit_points" DROP CONSTRAINT "circuit_points_circuit_id_poi_id_pk";--> statement-breakpoint
ALTER TABLE "circuits" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 2);--> statement-breakpoint
ALTER TABLE "circuit_points" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circuit_points" ADD CONSTRAINT "circuit_points_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("id") ON DELETE no action ON UPDATE no action;