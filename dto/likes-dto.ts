import { Like, UsersAdditionalInfo } from "@/db/migrations/schema";

type LikesDTO = Like & {
    creator_avatar: UsersAdditionalInfo["avatar_url"];
    creator: UsersAdditionalInfo["full_name"];
};

export { type LikesDTO};