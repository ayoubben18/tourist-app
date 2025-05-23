"use client";

import React, { startTransition, useOptimistic } from "react";
import dynamic from "next/dynamic";
import {
  Heart,
  Bookmark,
  MessageCircle,
  MapPin,
  Timer,
  Flag,
  Send,
  LogIn,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { getCircuitWithPOI } from "@/services/database/circuits";
import {
  addToLikes,
  isLiked,
  removeFromLikes,
} from "@/services/database/likes";
import {
  addToFavorites,
  isFavorite,
  removeFromFavorites,
} from "@/services/database/favorites";
import {
  addComment,
  getComments,
  removeComment,
} from "@/services/database/circuit-comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Comments from "@/components/(public)/public-circuits/circuit-comments";
import StarRating from "@/components/shared/StarRating";
import AddCircuitReviewForm from "@/components/(public)/public-circuits/circuit-review-form";
import { BookTripDialog } from "@/components/(public)/public-circuits/book-trip-dialog";

// Dynamically import the Map component with SSR disabled
const Map = dynamic(() => import("@/components/shared/Maps"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      Loading map...
    </div>
  ),
});

export default function App() {
  const { id } = useParams();
  const circuit_id = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isAuthenticated, isAuthenticatedLoading } = useIsAuthenticated();

  const {
    data: circuitWithPOI,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
  } = useQuery({
    queryKey: useQueryCacheKeys.circuitWithPOI(circuit_id),
    queryFn: () => getCircuitWithPOI({ circuit_id: circuit_id.toString() }),
    enabled: !isNaN(circuit_id),
  });
  console.log("circuit: ", circuitWithPOI);

  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsError,
  } = useQuery({
    queryKey: useQueryCacheKeys.commentsOfCircuit(circuit_id),
    queryFn: () => getComments({ circuit_id: circuit_id.toString() }),
    enabled: !isNaN(circuit_id),
  });

  const { data: likeData, isLoading: isLikedLoading } = useQuery({
    queryKey: useQueryCacheKeys.isLiked(
      circuit_id,
      isAuthenticated?.user_id || "0"
    ),
    queryFn: () => isLiked({ circuit_id }),
    enabled:
      isAuthenticated && isAuthenticated.isAuthenticated && !isNaN(circuit_id),
  });

  const { data: favoriteData, isLoading: isFavoritedLoading } = useQuery({
    queryKey: useQueryCacheKeys.isFavorite(
      circuit_id,
      isAuthenticated?.user_id || "0"
    ),
    queryFn: () => isFavorite({ circuit_id }),
    enabled:
      isAuthenticated && isAuthenticated.isAuthenticated && !isNaN(circuit_id),
  });

  //useOptimistic hooks

  const [optimisticLike, addOptimisticLike] = useOptimistic(
    likeData?.isLiked ?? false,
    (_, newLike: boolean) => newLike
  );

  const [optimisticFavorite, addOptimisticFavorite] = useOptimistic(
    favoriteData?.isFavorite ?? false,
    (_, newFavorite: boolean) => newFavorite
  );

  // const likeData = { isLiked: false, like_id: null}
  // const isLikedLoading = false
  // const favoriteData = { isFavorite: false, favorite_id: null}
  // const isFavoritedLoading = false

  const { mutateAsync: like, isPending: isLiking } = useMutation({
    mutationFn: addToLikes,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.isLiked(
          circuit_id,
          isAuthenticated?.user_id || "0"
        ),
      });
      toast.success("You've liked this circuit!");
    },
    onError: () => {
      toast.error("Failed to like this circuit");
    },
  });

  const { mutateAsync: unlike, isPending: isUnliking } = useMutation({
    mutationFn: removeFromLikes,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.isLiked(
          circuit_id,
          isAuthenticated?.user_id || "0"
        ),
      });
      toast.success("Circuit unliked!");
    },
    onError: () => {
      toast.error("Failed to unlike this circuit");
    },
  });

  const { mutateAsync: save, isPending: isSaving } = useMutation({
    mutationFn: addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.isFavorite(
          circuit_id,
          isAuthenticated?.user_id || "0"
        ),
      });
      toast.success("Circuit added to favorites!");
    },
    onError: () => {
      toast.error("Failed to add to favorites");
    },
  });

  const { mutateAsync: unsave, isPending: isUnsaving } = useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.isFavorite(
          circuit_id,
          isAuthenticated?.user_id || "0"
        ),
      });
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.circuitWithPOI(circuit_id),
      });
      toast.success("Circuit removed from favorites!");
    },
    onError: () => {
      toast.error("Failed to remove from favorites");
    },
  });

  const { mutateAsync: deleteCommentMutation } = useMutation({
    mutationFn: removeComment,
    onSuccess: () => {
      toast.success("Comment deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.commentsOfCircuit(circuit_id),
      });
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const redirectToLogin = () => {
    router.push(`/sign-in?returnTo=%public-circuits%${circuit_id}`);
  };

  const handleAuthenticatedAction = () => {
    if (!isAuthenticated?.isAuthenticated) {
      toast.info("Authentication Required");
      redirectToLogin();
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!handleAuthenticatedAction()) return;

    const newLikeStatus = !optimisticLike;
    startTransition(() => {
      addOptimisticLike(newLikeStatus);
    });

    try {
      if (newLikeStatus) {
        await like({ circuit_id });
      } else {
        await unlike({ like_id: likeData!.like_id! });
      }
    } catch (error) {
      startTransition(() => {
        addOptimisticLike(!newLikeStatus);
      });
      toast.error("Failed to update like");
    }
  };

  const handleSave = async () => {
    if (!handleAuthenticatedAction()) return;
    const newFavoriteStatus = !optimisticFavorite;
    startTransition(() => {
      addOptimisticFavorite(newFavoriteStatus);
    });

    try {
      if (newFavoriteStatus) {
        await save({ circuit_id });
      } else {
        await unsave({ favorite_id: favoriteData!.favorite_id! });
      }
    } catch (error) {
      startTransition(() => {
        addOptimisticFavorite(!newFavoriteStatus);
      });
      toast.error("Failed to update favorite");
    }
  };

  const handleDeleteComment = async (comment_id: number) => {
    if (handleAuthenticatedAction()) {
      await deleteCommentMutation({ comment_id });
    }
  };

  if (isCircuitLoading || isAuthenticatedLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" /> {/* Created by text */}
            <Skeleton className="h-6 w-[200px]" /> {/* Name */}
          </div>
        </div>

        {/* Title Section */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-[300px]" /> {/* Title */}
          <Skeleton className="h-6 w-[200px]" /> {/* Location */}
          <Skeleton className="h-4 w-full max-w-[600px]" /> {/* Description */}
        </div>

        {/* Map Placeholder */}
        <Skeleton className="h-[350px] w-full rounded-lg" />

        {/* Places to Visit Section */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-[200px]" /> {/* Section title */}
          {/* Place Cards */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-start space-x-4 border rounded-lg p-4"
            >
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-[200px]" /> {/* Place name */}
                <Skeleton className="h-4 w-full max-w-[400px]" />{" "}
                {/* Description */}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Skeleton className="h-4 w-[60px]" /> {/* Duration */}
                <Skeleton className="h-4 w-[80px]" /> {/* Category */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isCircuitError || !circuitWithPOI) {
    return (
      <div className="w-full p-6 text-center">Error loading circuit data</div>
    );
  }

  const isLikeLoading = isLiking || isUnliking;
  const isFavoriteLoading = isSaving || isUnsaving;

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Creator info */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">Created by:</span>
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                circuitWithPOI.creator_avatar ??
                "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
              }
              alt={circuitWithPOI.creator!}
            />
            <AvatarFallback>{circuitWithPOI.creator?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{circuitWithPOI.creator}</span>
        </div>

        {/* Circuit title and description */}
        <div className="space-y-2">
          <div className="flex items-center text-yellow-500 ">
            <Star className="w-5 h-5 fill-yellow-500" />
            <span className="ml-1 text-sm font-medium flex gap-1">
              {circuitWithPOI.rating ?? "No rating"}
              <p className="font-thin text-gray-700">
                ({circuitWithPOI.number_of_reviews})
              </p>
            </span>
          </div>
          <h1 className="text-3xl font-bold">{circuitWithPOI.name}</h1>
          <h1 className="text-xl font-bold">
            {circuitWithPOI.city}, {circuitWithPOI.country}
          </h1>
          <p className="text-muted-foreground">{circuitWithPOI.description}</p>
        </div>

        <div className="w-full h-[400px] rounded-lg overflow-hidden border">
          {circuitWithPOI.pois && circuitWithPOI.pois.length > 0 && (
            <Map
              places={circuitWithPOI.pois
                .filter((poi) => poi.coordinates !== null)
                .map((poi) => ({
                  name: poi.name,
                  description: poi.description || "",
                  estimated_duration: poi.estimated_duration!,
                  opening_hours: poi.opening_hours || "",
                  category: poi.category,
                  coordinates: poi.coordinates as [number, number],
                }))}
            />
          )}
        </div>

        {/* Places section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Places to Visit
          </h2>

          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
            {circuitWithPOI.pois &&
              circuitWithPOI.pois.map((poi, index) => (
                <div key={index} className="relative pl-16 pb-4">
                  <div className="absolute left-4 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  <div className="p-4 rounded-lg border hover:shadow-sm transition-shadow bg-background">
                    <div className="flex items-start flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{poi.name}</h3>
                        <p className="text-muted-foreground">
                          {poi.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground whitespace-nowrap">
                        {poi.estimated_duration && (
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            {poi.estimated_duration} min
                          </div>
                        )}
                        {poi.category && (
                          <div className="flex items-center gap-2 max-w-1/3">
                            <Flag className="w-4 h-4" />
                            {poi.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <BookTripDialog
            circuitId={Number(circuit_id)}
            circuitDuration={circuitWithPOI.estimated_duration || 0}
          />
          <div className="flex gap-4">
            {/* Like Button */}
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleLike}
              disabled={
                isAuthenticated?.isAuthenticated ? isLikedLoading : false
              }
            >
              <Heart
                className={`w-5 h-5 ${
                  optimisticLike ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              {optimisticLike ? "Unlike" : "Like"}
            </Button>
            {/* favorite button */}
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleSave}
              disabled={
                isAuthenticated?.isAuthenticated ? isFavoritedLoading : false
              }
            >
              <Bookmark
                className={`w-5 h-5 ${
                  optimisticFavorite ? "fill-primary text-primary" : ""
                }`}
              />
              {optimisticFavorite
                ? "Remove from Favorites"
                : "Add to Favorites"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-2xl font-semibold">Reviews</h2>
          </div>

          {/* Comment Form */}
          <div className="flex flex-col space-y-3 p-4 rounded-lg border">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center py-4 space-y-3">
                <p className="text-muted-foreground">
                  Sign in to leave a review
                </p>
                <Button
                  onClick={redirectToLogin}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </div>
            ) : (
              <AddCircuitReviewForm circuit_id={circuit_id} />
            )}
          </div>

          {/* Existing Comments */}
          <Comments
            comments={comments}
            commentsLoading={commentsLoading}
            commentsError={commentsError}
            currentUser={
              isAuthenticated?.isAuthenticated ? isAuthenticated?.user_id : null
            }
            onDelete={handleDeleteComment}
          />
        </div>
      </main>
    </div>
  );
}
