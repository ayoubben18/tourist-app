"use client"

import React, { useState } from "react";
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { getCircuitWithPOI } from "@/services/database/circuits";
import { addToLikes, isLiked, removeFromLikes } from "@/services/database/likes";
import { addToFavorites, isFavorite, removeFromFavorites } from "@/services/database/favorites";
import { addComment, getComments, removeComment } from "@/services/database/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIsAuthenticated } from "@/hooks/use-auth";
import { toast } from "sonner";
import Comments from "@/components/(public)/public-circuits/Comments";

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
  const [newComment, setNewComment] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAuthenticatedLoading } = useIsAuthenticated();
  
  // Get current path for redirection after login
  const returnPath = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname) : '';
  
  const {
    data: circuitWithPOI,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
  } = useQuery({
    queryKey: useQueryCacheKeys.circuitWithPOI(circuit_id),
    queryFn: () => getCircuitWithPOI({ circuit_id: circuit_id.toString() }),
    enabled: !isNaN(circuit_id),
  });
  
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsError,
  } = useQuery({
    queryKey: useQueryCacheKeys.commentsOfCircuit(circuit_id),
    queryFn: () => getComments({ circuit_id: circuit_id.toString() }),
    enabled: !isNaN(circuit_id),
  });

  const {
    data: likeData,
    isLoading: isLikedLoading,
  } = useQuery({
    queryKey: useQueryCacheKeys.isLiked(circuit_id, isAuthenticated?.user_id || "0"),
    queryFn: () => isLiked({ circuit_id }),
    enabled: isAuthenticated && isAuthenticated.isAuthenticated && !isNaN(circuit_id),
  });

  const {
    data: favoriteData,
    isLoading: isFavoritedLoading,
  } = useQuery({
    queryKey: useQueryCacheKeys.isFavorite(circuit_id, isAuthenticated?.user_id || "0"),
    queryFn: () => isFavorite({ circuit_id }),
    enabled: isAuthenticated &&  isAuthenticated.isAuthenticated && !isNaN(circuit_id),
  });

  // const likeData = { isLiked: false, like_id: null}
  // const isLikedLoading = false
  // const favoriteData = { isFavorite: false, favorite_id: null}
  // const isFavoritedLoading = false

  const { mutateAsync: like, isPending: isLiking } = useMutation({
    mutationFn: addToLikes,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.isLiked(circuit_id, isAuthenticated?.user_id || "0"),
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
        queryKey: useQueryCacheKeys.isLiked(circuit_id, isAuthenticated?.user_id || "0"),
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
        queryKey: useQueryCacheKeys.isFavorite(circuit_id, isAuthenticated?.user_id || "0"),
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
        queryKey: useQueryCacheKeys.isFavorite(circuit_id, isAuthenticated?.user_id || "0"),
      });
      toast.success("Circuit removed from favorites!");
    },
    onError: () => {
      toast.error("Failed to remove from favorites");
    },
  });

  const { mutateAsync: commentMutation, isPending: isCommenting } = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      toast.success("Comment added successfully!");
      setNewComment("");
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.commentsOfCircuit(circuit_id),
      });
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const { mutateAsync: deleteCommentMutation} = useMutation({
    mutationFn: removeComment,
    onSuccess: () => {
      toast.success("Comment deleted successfully!");
      setNewComment("");
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
    if (handleAuthenticatedAction()) {
      if (likeData?.isLiked) {
        await unlike({ like_id: likeData.like_id! });
        queryClient.invalidateQueries({ queryKey: useQueryCacheKeys.isLiked });
      } else {
        await like({ circuit_id });
      }
    }
  };

  const handleSave = async () => {
    if (handleAuthenticatedAction()) {
      if (favoriteData?.isFavorite) {
        await unsave({ favorite_id: favoriteData.favorite_id! });
        queryClient.invalidateQueries({ queryKey: useQueryCacheKeys.isFavorite });
      } else {
        await save({ circuit_id });
      }
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    if (handleAuthenticatedAction()) {
      await commentMutation({
        circuit_id,
        comment: newComment.trim(),
      });
    }
  };

  const handleDeleteComment = async (comment_id: number) => {
    if (handleAuthenticatedAction()) {
      await deleteCommentMutation({ comment_id });
      queryClient.invalidateQueries({ queryKey: useQueryCacheKeys.isFavorite });
    }
  };

  if (isCircuitLoading || isAuthenticatedLoading) {
    return <div className="w-full p-6 text-center">Loading...</div>;
  }

  if (isCircuitError || !circuitWithPOI) {
    return <div className="w-full p-6 text-center">Error loading circuit data</div>;
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
          <h1 className="text-3xl font-bold">{circuitWithPOI.name}</h1>
          <h1 className="text-xl font-bold">{circuitWithPOI.city}, {circuitWithPOI.country}</h1>
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
            {circuitWithPOI.pois && circuitWithPOI.pois.map((poi, index) => (
              <div key={index} className="relative pl-16 pb-4">
                <div className="absolute left-4 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <div className="p-4 rounded-lg border hover:shadow-sm transition-shadow bg-background">
                  <div className="flex items-start flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{poi.name}</h3>
                      <p className="text-muted-foreground">{poi.description}</p>
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
          <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">
            Take this Trip
          </button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleLike}
              disabled={isAuthenticated?.isAuthenticated ? (isLikeLoading || isLikedLoading) : false}
            >
              <Heart className={`w-5 h-5 ${likeData?.isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              {isLikeLoading 
                ? (likeData?.isLiked ? "Unliking..." : "Liking...") 
                : (likeData?.isLiked ? "Unlike" : "Like")}
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleSave}
              disabled={isAuthenticated?.isAuthenticated ? (isFavoriteLoading || isFavoritedLoading) : false}
            >
              <Bookmark className={`w-5 h-5 ${favoriteData?.isFavorite ? "fill-primary text-primary" : ""}`} />
              {isFavoriteLoading 
                ? (favoriteData?.isFavorite ? "Removing..." : "Saving...") 
                : (favoriteData?.isFavorite ? "Remove from Favorites" : "Add to Favorites")}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-2xl font-semibold">Comments</h2>
          </div>

          {/* Comment Form */}
          <div className="flex flex-col space-y-3 p-4 rounded-lg border">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center py-4 space-y-3">
                <p className="text-muted-foreground">Sign in to leave a comment</p>
                <Button onClick={redirectToLogin} className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isCommenting || !newComment.trim()}
                    onClick={handleComment}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isCommenting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Existing Comments */}
          <Comments comments={comments} commentsLoading={commentsLoading} commentsError={commentsError} currentUser={isAuthenticated?.isAuthenticated ? isAuthenticated?.user_id : null} onDelete={handleDeleteComment} />
        </div>
      </main>
    </div>
  );
}