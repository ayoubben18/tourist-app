import { Circuit, City, UsersAdditionalInfo } from "@/db/migrations/schema";

type CircuitsDTO = Omit<
  Circuit,
  | "city_id"
  | "user_id"
  | "created_at"
  | "updated_at"
  | "creator_id"
  | "is_public"
> & {
  image: City["image_url"];
  city: City["name"];
  country: City["country"];
  creator_avatar: UsersAdditionalInfo["avatar_url"];
  creator: UsersAdditionalInfo["full_name"];
};

export { type CircuitsDTO };
