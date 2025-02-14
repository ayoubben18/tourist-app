import { GuidesComments, UsersAdditionalInfo } from "@/db/migrations/schema";

type GuideCommentsDTO = GuidesComments & {
    creator_avatar: UsersAdditionalInfo["avatar_url"];
    creator: UsersAdditionalInfo["full_name"];
};

export { type GuideCommentsDTO};