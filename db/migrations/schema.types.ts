import type { bookings, circuits, cities, guide_profiles, points_of_interest, users_additional_info, circuit_comments, favorites, guides_comments, likes } from "./schema";



export type Circuit = typeof circuits.$inferSelect;
export type UsersAdditionalInfo = typeof users_additional_info.$inferSelect;
export type City = typeof cities.$inferSelect;
export type PointOfInterest = typeof points_of_interest.$inferSelect;
export type GuideProfile = typeof guide_profiles.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type CircuitComments = typeof circuit_comments.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type GuidesComments = typeof guides_comments.$inferSelect;
