"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { getGuide } from "@/services/database/guide";
import {
  addComment,
  getComments,
  removeComment,
} from "@/services/database/guide-comments";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, DollarSign, MessageCircle, Star, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import StarRating from "@/components/shared/StarRating";

export default function guideDetails() {
  const { id } = useParams();
  const guide_id = String(id);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useIsAuthenticated();
  const {
    data: guide,
    isLoading: guideLoading,
    isError: guideError,
  } = useQuery({
    queryKey: useQueryCacheKeys.guide(guide_id),
    queryFn: () => getGuide({ guide_id: guide_id }),
  });

  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsError,
  } = useQuery({
    queryKey: useQueryCacheKeys.commentsOfGuide(guide_id),
    queryFn: () => getComments({ guide_id: guide_id }),
  });

  const { mutateAsync: commentMutation, isPending: isCommenting } = useMutation(
    {
      mutationFn: addComment,
      onSuccess: () => {
        toast.success("Comment added successfully!");
        setNewComment("");
        setNewRating(0);
        queryClient.invalidateQueries({
          queryKey: useQueryCacheKeys.commentsOfGuide(guide_id),
        });
      },
      onError: () => {
        toast.error("Failed to add comment");
      },
    }
  );

  const { mutateAsync: deleteCommentMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: removeComment,
      onSuccess: () => {
        toast.success("Comment deleted successfully!");
        setNewComment("");
        queryClient.invalidateQueries({
          queryKey: useQueryCacheKeys.commentsOfGuide(guide_id),
        });
      },
      onError: () => {
        toast.error("Failed to delete comment");
      },
    });

  const redirectToLogin = () => {
    router.push(`/sign-in?returnTo=%guides%${guide_id}`);
  };

  const handleAuthenticatedAction = () => {
    if (!isAuthenticated?.isAuthenticated) {
      toast.info("Authentication Required");
      redirectToLogin();
      return false;
    }
    return true;
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    if (handleAuthenticatedAction()) {
      await commentMutation({
        guide_id,
        comment: newComment.trim(),
        rating: newRating,
      });
    }
  };

  const handleDeleteComment = async (comment_id: number) => {
    if (handleAuthenticatedAction()) {
      await deleteCommentMutation({ comment_id });
    }
  };

  if (guideError) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Error loading guide details
        </h1>
        <p className="mt-2 text-gray-600">Please try again later</p>
        <Button className="mt-4" onClick={() => router.push("/guides")}>
          Back to Guides
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Guide Profile Section */}
        <div className="md:col-span-1">
          <Card className="h-full">
            {guideLoading ? (
              <CardContent className="flex flex-col items-center space-y-6 pt-6">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/4 mx-auto" />
                </div>
                <div className="space-y-4 w-full pt-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage
                        src={guide?.avatar_url || ""}
                        alt={guide?.full_name || "Guide"}
                      />
                      <AvatarFallback className="text-3xl">
                        {guide?.full_name
                          ?.split(" ")
                          .map((name) => name[0])
                          .join("") || "G"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        {guide?.full_name}
                      </CardTitle>
                      {guide?.rating && (
                        <div className="flex items-center justify-center mt-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="ml-1 text-lg font-semibold">
                            {guide.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Experience */}
                    {guide?.years_of_experience && (
                      <div className="flex items-center">
                        <Award className="w-5 h-5 mr-3 text-blue-500" />
                        <div>
                          <h3 className="text-sm text-muted-foreground">
                            Experience
                          </h3>
                          <p className="font-medium">
                            {guide.years_of_experience} years
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {guide?.price_per_hour && (
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-3 text-green-500" />
                        <div>
                          <h3 className="text-sm text-muted-foreground">
                            Hourly Rate
                          </h3>
                          <p className="font-medium">{guide.price_per_hour}DHS</p>
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <Button
                      className="w-full mt-6"
                      onClick={() => {
                        if (handleAuthenticatedAction()) {
                          // Handle booking logic here
                          toast.success("Booking initiated!");
                        }
                      }}
                    >
                      Book This Guide
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Comments Section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Reviews & Comments
                </CardTitle>
                {!commentsLoading && (
                  <Badge variant="secondary">
                    {comments?.length || 0}{" "}
                    {(comments?.length || 0) === 1 ? "Review" : "Reviews"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {commentsLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/6" />
                          </div>
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))
              ) : commentsError ? (
                <div className="text-center py-8">
                  <p className="text-red-500">
                    Failed to load comments. Please try again.
                  </p>
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={comment.creator_avatar || ""}
                          alt={comment.creator || "User"}
                        />
                        <AvatarFallback>
                          {comment.creator
                            ?.split(" ")
                            .map((name) => name[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {comment.creator || "Anonymous User"}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                comment.created_at!
                              ).toLocaleDateString()}
                            </p>

                            {/* Show delete button if user is the creator */}
                            {isAuthenticated?.user_id === comment.user_id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
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
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to leave a review!
                  </p>
                </div>
              )}

              {/* Add Comment Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
                <div className="mb-4">
                  <StarRating
                    rating={newRating}
                    onRatingChange={setNewRating}
                    disabled={isCommenting || !guide}
                  />
                </div>
                <textarea
                  className="w-full p-3 border rounded-md resize-none h-24 focus:outline-none focus:ring focus:ring-blue-200"
                  placeholder="Share your experience with this guide..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isCommenting || !guide}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleComment}
                    disabled={isCommenting || !newComment.trim() || !guide}
                  >
                    {isCommenting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
