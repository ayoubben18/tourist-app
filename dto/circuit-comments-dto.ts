import { CircuitComments, UsersAdditionalInfo } from "@/db/migrations/schema";

type CircuitCommentsDTO = CircuitComments & {
    creator_avatar: UsersAdditionalInfo["avatar_url"];
    creator: UsersAdditionalInfo["full_name"];
};

export { type CircuitCommentsDTO};