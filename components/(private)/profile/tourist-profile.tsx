"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, SquarePen } from "lucide-react";
import {
  updateAvatar,
  updateUserInfo,
} from "@/services/database/users_additional_info";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import {
  getFavoriteCircuits,
  getLikedCircuits,
  getMyCircuits,
} from "@/services/database";
import { useRouter } from "next/navigation";
import { CircuitCard } from "@/components/(public)/public-circuits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with reduced quality
        const base64String = canvas.toDataURL("image/jpeg", 0.7);
        resolve(base64String);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ProfileSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 animate-pulse">
      <Card className="overflow-hidden border-none shadow-md">
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar Skeleton */}
              <Skeleton className="w-28 h-28 rounded-full" />

              <div className="space-y-4 flex-1">
                {/* Name Skeleton */}
                <div className="flex items-center gap-2 justify-between">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-8 w-32 rounded-full" />
                </div>

                {/* Bio Skeleton */}
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-8">
            <div className="px-2 max-w-fit flex mx-auto gap-4">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[300px] rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function TouristProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userInfo, isUserInfoLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    name: userInfo?.full_name || "",
    bio: userInfo?.bio || "",
    avatar: userInfo?.avatar_url || "",
  });

  const { mutateAsync: updateAvatarMutation, isPending: isUpdatingAvatar } =
    useMutation({
      mutationFn: updateAvatar,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["userInfo"],
        });
      },
    });

  const { mutateAsync: updateUserInfoMutation, isPending: isUpdatingUserInfo } =
    useMutation({
      mutationFn: updateUserInfo,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["userInfo"],
        });
        setIsEditing(false);
      },
    });

  const { data: myCircuits, isPending: isFetchingMyCircuits } = useQuery({
    queryKey: useQueryCacheKeys.myCircuits(userInfo?.id || ""),
    queryFn: () => getMyCircuits(),
    enabled: !!userInfo,
  });
  const { data: likedCircuits, isPending: isFetchingLikedCircuits } = useQuery({
    queryKey: useQueryCacheKeys.likedCircuits(userInfo?.id || ""),
    queryFn: () => getLikedCircuits(),
    enabled: !!userInfo,
  });
  const { data: favoriteCircuits, isPending: isFetchingFavorites } = useQuery({
    queryKey: useQueryCacheKeys.favoriteCircuits(userInfo?.id || ""),
    queryFn: () => getFavoriteCircuits(),
    enabled: !!userInfo,
  });

  // Update profile state when userInfo changes
  useEffect(() => {
    if (userInfo) {
      setProfile({
        name: userInfo.full_name || "",
        bio: userInfo.bio || "",
        avatar: userInfo.avatar_url || "",
      });
    }
  }, [userInfo]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.promise(
        (async () => {
          const compressedBase64 = await compressImage(file);
          const result = await updateAvatarMutation({
            image: compressedBase64,
          });
          setProfile((prev) => ({ ...prev, avatar: result.avatarUrl }));
        })(),
        {
          loading: "Updating avatar...",
          success: "Avatar updated successfully",
          error: "Failed to update avatar",
        }
      );
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    toast.promise(
      (async () => {
        await updateUserInfoMutation({
          full_name: profile.name.trim(),
          bio: profile.bio.trim(),
        });
      })(),
      {
        loading: "Saving profile changes...",
        success: "Profile updated successfully",
        error: "Failed to update profile",
      }
    );
  };

  if (
    isUserInfoLoading ||
    isFetchingMyCircuits ||
    isFetchingLikedCircuits ||
    isFetchingFavorites
  ) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <Card className="overflow-hidden border-none shadow-md">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div
                className="relative group"
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                <Avatar className="w-28 h-28 border-4 border-white shadow-md">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {avatarHover && !isUpdatingAvatar && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUpdatingAvatar}
                />
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Input
                        placeholder="Enter your name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="text-2xl font-semibold h-auto py-2"
                      />
                    ) : (
                      <h1 className="text-xl lg:text-2xl font-bold">
                        {profile.name}
                      </h1>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="default"
                          onClick={handleSave}
                          disabled={isUpdatingUserInfo}
                          className="rounded-full"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isUpdatingUserInfo}
                          className="rounded-full"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="rounded-full flex items-center gap-2"
                      >
                        <SquarePen className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                {isEditing ? (
                  <Textarea
                    placeholder="Write a bio..."
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="text-gray-700 min-h-[100px] resize-none"
                    disabled={isUpdatingUserInfo}
                  />
                ) : (
                  <p className="text-gray-700">
                    {profile.bio || (
                      <span className="text-gray-400 italic">
                        No bio added yet. Click edit to add your bio.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md">
        <CardContent className="p-6">
          <Tabs defaultValue="circuits" className="w-full">
            <TabsList className="px-4 py-2 mb-6 max-w-fit flex mx-auto bg-gray-100 rounded-full">
              <TabsTrigger value="circuits">My Circuits</TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="circuits" className="mt-6">
              {myCircuits && myCircuits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCircuits.map((circuit) => (
                    <CircuitCard key={circuit.id} circuit={circuit} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16 bg-gray-50 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      No circuits created yet
                    </p>
                    <Button variant="outline" className="rounded-full mt-2">
                      Create Your First Circuit
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="likes">
              {likedCircuits && likedCircuits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedCircuits.map((circuit) => (
                    <CircuitCard key={circuit.id} circuit={circuit} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16 bg-gray-50 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      No liked circuits yet
                    </p>
                    <Button variant="outline" className="rounded-full mt-2">
                      Explore Circuits
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {favoriteCircuits && favoriteCircuits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteCircuits.map((circuit) => (
                    <CircuitCard key={circuit.id} circuit={circuit} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16 bg-gray-50 rounded-lg">
                  <div className="flex flex-col items-center space-y-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      No favorite circuits yet
                    </p>
                    <Button variant="outline" className="rounded-full mt-2">
                      Browse Popular Circuits
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
