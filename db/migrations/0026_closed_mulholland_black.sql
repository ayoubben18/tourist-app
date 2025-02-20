ALTER TABLE "bookings" ADD COLUMN "booking_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "start_time";