"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, SquarePen, Check, X } from "lucide-react";
import { updateAvatar } from "@/services/database/users_additional_info";
import { getGuide, updateGuideProfile } from "@/services/database/guide";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import GuideBookings from "../(guides)/guide-bookings";

// Type definitions
type DaysOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type AvailableHours = Record<DaysOfWeek, string[]>;

const DAYS_OF_WEEK: DaysOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
];

const compressImage = async (file: File): Promise<string> => {
  // Image compression function remains the same
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

const GuideProfileSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 animate-pulse">
      <div className="space-y-8">
        <div className="flex items-start gap-8">
          {/* Avatar Skeleton */}
          <Skeleton className="w-28 h-28 rounded-full" />

          <div className="space-y-4 flex-1">
            {/* Name and Verification Skeleton */}
            <div className="flex items-center gap-2 justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>

            {/* Bio Skeleton */}
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Additional Info Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

const VerificationBadge = ({ status }: { status: string }) => {
  const badgeVariant = (() => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  })();

  const Icon = status === "approved" ? Check : status === "rejected" ? X : null;

  return (
    <Badge variant={badgeVariant as any}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {status === "approved"
        ? "Verified Guide"
        : status === "pending"
        ? "Verification Pending"
        : status === "rejected"
        ? "Verification Rejected"
        : "Unverified"}
    </Badge>
  );
};

export function GuideProfile() {
  const queryClient = useQueryClient();
  const { userInfo, isUserInfoLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: guideProfile, isLoading: isGuideProfileLoading } = useQuery({
    queryKey: useQueryCacheKeys.guide(userInfo?.id || ""),
    queryFn: () => getGuide({ guide_id: userInfo?.id || "" }),
    enabled: !!userInfo?.id,
    retry: 3,
    staleTime: 60000,
  });

  const [profile, setProfile] = useState({
    name: "",
    avatar: "",
    years_of_experience: 0,
    price_per_hour: "0",
    available_hours: Object.fromEntries(
      DAYS_OF_WEEK.map((day) => [day, []])
    ) as unknown as AvailableHours,
    verification_status: "unverified",
  });

  const { mutateAsync: updateAvatarMutation, isPending: isUpdatingAvatar } =
    useMutation({
      mutationFn: updateAvatar,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["userInfo"],
        });
        queryClient.invalidateQueries({
          queryKey: useQueryCacheKeys.guide(userInfo?.id || ""),
        });
      },
    });

  const {
    mutateAsync: updateGuideInfoMutation,
    isPending: isUpdatingGuideInfo,
  } = useMutation({
    mutationFn: updateGuideProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userInfo"],
      });
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.guide(userInfo?.id || ""),
      });
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (guideProfile) {
      setProfile({
        name: guideProfile.full_name || "",
        avatar: guideProfile.avatar_url || "",
        years_of_experience: guideProfile.years_of_experience || 0,
        price_per_hour: guideProfile.price_per_hour || "0",
        available_hours:
          guideProfile.available_hours ||
          (Object.fromEntries(
            DAYS_OF_WEEK.map((day) => [day, []])
          ) as unknown as AvailableHours),
        verification_status: guideProfile.verification_status || "unverified",
      });
    }
  }, [guideProfile]);

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

  const handleTimeSlotToggle = (day: DaysOfWeek, timeSlot: string) => {
    setProfile((prev) => {
      const currentSlots = [...(prev.available_hours[day] || [])];
      const updatedSlots = currentSlots.includes(timeSlot)
        ? currentSlots.filter((slot) => slot !== timeSlot)
        : [...currentSlots, timeSlot].sort((a, b) => {
            return TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b);
          });

      return {
        ...prev,
        available_hours: {
          ...prev.available_hours,
          [day]: updatedSlots,
        },
      };
    });
  };

  const handleSave = async () => {
    if (isNaN(profile.years_of_experience) || profile.years_of_experience < 0) {
      toast.error("Years of experience must be a positive number");
      return;
    }

    if (
      isNaN(Number(profile.price_per_hour)) ||
      Number(profile.price_per_hour) <= 0
    ) {
      toast.error("Price per hour must be a positive number");
      return;
    }

    toast.promise(
      (async () => {
        await updateGuideInfoMutation({
          years_of_experience: profile.years_of_experience,
          price_per_hour: profile.price_per_hour,
          available_hours: profile.available_hours,
        });
      })(),
      {
        loading: "Saving profile changes...",
        success: "Profile updated successfully",
        error: "Failed to update profile",
      }
    );
  };

  // Fix 8: Add better loading state handling
  const isLoading = isUserInfoLoading || isGuideProfileLoading;
  const hasNoData =
    !isLoading && (!guideProfile || Object.keys(guideProfile).length === 0);

  if (isLoading) {
    return <GuideProfileSkeleton />;
  }

  if (hasNoData) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">No Guide Profile Found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find your guide profile information. Please make sure
            you're registered as a guide.
          </p>
          <Button>Set Up Guide Profile</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <Card className="overflow-hidden border-none shadow-md">
        <CardContent className="p-8">
          <div className="space-y-8">
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
                      <div className="">
                        <VerificationBadge
                          status={profile.verification_status}
                        />
                        <h1 className="text-xl lg:text-2xl font-bold">
                          {profile.name}
                        </h1>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="default"
                          onClick={handleSave}
                          disabled={isUpdatingGuideInfo}
                          className="rounded-full"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isUpdatingGuideInfo}
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label
                        htmlFor="years_of_experience"
                        className="text-sm font-medium text-gray-500"
                      >
                        Years of Experience
                      </Label>
                      {isEditing ? (
                        <Input
                          id="years_of_experience"
                          type="number"
                          value={profile.years_of_experience}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              years_of_experience: Number(e.target.value),
                            }))
                          }
                          className="mt-2"
                          disabled={isUpdatingGuideInfo}
                        />
                      ) : (
                        <p className="mt-1 text-xl font-bold">
                          {profile.years_of_experience}{" "}
                          <span className="text-sm font-normal text-gray-500">
                            years
                          </span>
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="price_per_hour"
                        className="text-sm font-medium text-gray-500"
                      >
                        Price per Hour
                      </Label>
                      {isEditing ? (
                        <div className="flex items-center mt-1">
                          <Input
                            id="price_per_hour"
                            type="number"
                            min="0"
                            step="0.01"
                            value={profile.price_per_hour}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                price_per_hour: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-xl font-bold">
                          {Number(profile.price_per_hour).toFixed(2)}{" "}
                          <span className="text-sm font-normal text-gray-500">
                            DHS/ hour
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-4 block">
                      Available Hours
                    </Label>
                    <div className="space-y-4 max-h-44 overflow-y-auto pr-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="space-y-2">
                          <Label className="font-medium">{day}</Label>
                          {isEditing ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {TIME_SLOTS.map((time) => (
                                <Badge
                                  key={`${day}-${time}`}
                                  variant={
                                    profile.available_hours[day]?.includes(time)
                                      ? "default"
                                      : "outline"
                                  }
                                  className="cursor-pointer transition-colors duration-200"
                                  onClick={() =>
                                    handleTimeSlotToggle(day, time)
                                  }
                                >
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          ) : profile.available_hours[day]?.length ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {profile.available_hours[day].map((time) => (
                                <Badge
                                  key={`${day}-${time}`}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500"
                                >
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm italic">
                              Not available
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <GuideBookings />
      </Card>
    </div>
  );
}
