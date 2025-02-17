import { GuideProfile, UsersAdditionalInfo } from "@/db/migrations/schema";

type GuideDTO = Omit<
  GuideProfile,
  | "id"
  | "verification_status"
  | "authorization_document"
  | "verified_at"
  | "available_days"
> & {
  id: UsersAdditionalInfo["id"];
  full_name: UsersAdditionalInfo["full_name"];
  avatar_url: UsersAdditionalInfo["avatar_url"];
};

export { type GuideDTO };
