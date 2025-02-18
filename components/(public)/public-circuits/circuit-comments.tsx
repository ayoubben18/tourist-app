import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircuitCommentsDTO } from "@/dto/circuit-comments-dto";
import { Star } from "lucide-react";
import { useState } from "react";

interface CommentsProps {
  comments: CircuitCommentsDTO[] | undefined;
  commentsLoading: boolean;
  commentsError: boolean;
  currentUser: string | null | undefined;
  onDelete: (comment_id: number) => Promise<void>;
}

export default function Comments({
  comments,
  commentsLoading,
  commentsError,
  currentUser,
  onDelete,
}: CommentsProps) {
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

  if (commentsLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-3/4 mt-3 ml-11" />
            <Skeleton className="h-4 w-1/2 mt-2 ml-11" />
          </div>
        ))}
      </div>
    );
  }

  if (commentsError) {
    return (
      <div className="text-center py-4 text-destructive">
        Error loading comments
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      comment.creator_avatar ||
                      "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
                    }
                    alt={comment.creator!}
                  />
                  <AvatarFallback>{comment.creator?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h4 className="font-medium">{comment.creator}</h4>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(comment.created_at!).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 flex justify-between items-center pl-1">
              <div className="flex flex-col gap-1 my-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${
                        index < (comment.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-none text-yellow-400"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm">{comment.comment}</p>
              </div>
              {currentUser === comment.user_id && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    setDeletingCommentId(comment.id);
                    await onDelete(comment.id);
                    setDeletingCommentId(null);
                  }}
                  disabled={deletingCommentId === comment.id}
                >
                  {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}
