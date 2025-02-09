import { PointOfInterest } from "@/db/migrations/schema";

type PointOfInterestDTO = Omit<PointOfInterest, "city_id">;

export { type PointOfInterestDTO };
