import { Booking, UsersAdditionalInfo, Circuit } from "@/db/migrations/schema";

type GuideBookingsDTO = Omit<Booking, "test"> & {
    creator_avatar: UsersAdditionalInfo["avatar_url"];
    creator: UsersAdditionalInfo["full_name"];
    circuit_name: Circuit["name"];
    circuit_duration: Circuit["estimated_duration"];
};

export { type GuideBookingsDTO};