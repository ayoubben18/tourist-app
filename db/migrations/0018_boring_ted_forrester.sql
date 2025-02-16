CREATE TYPE "public"."days_of_week" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
ALTER TABLE "guide_profiles" ADD COLUMN "available_days" "days_of_week"[];--> statement-breakpoint
ALTER TABLE "guide_profiles" ADD COLUMN "available_hours" json;