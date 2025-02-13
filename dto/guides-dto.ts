import { GuideProfile, UsersAdditionalInfo } from "@/db/migrations/schema";

type GuideDTO = Omit<GuideProfile, "id"> & {
  id: UsersAdditionalInfo["id"];
  full_name: UsersAdditionalInfo["full_name"];
  avatar_url: UsersAdditionalInfo["avatar_url"];
};

export { type GuideDTO };
