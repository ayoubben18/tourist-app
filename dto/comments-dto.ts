import { Comment, UsersAdditionalInfo } from "@/db/migrations/schema";

type CommentsDTO = Comment & {
    creator_avatar: UsersAdditionalInfo["avatar_url"];
    creator: UsersAdditionalInfo["full_name"];
};

export { type CommentsDTO};