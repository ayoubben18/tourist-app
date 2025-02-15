"use client";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/services/database";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/(public)/account/Sidebar";
import { ProfileForm } from "@/components/(public)/account/ProfileForm";

export default function AccountPage() {
  const router = useRouter();

  const {
    data: user,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 60 * 60 * 1000, // Cache user data for 1 hour
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (isError || !user) {
    router.push("/sign-in");
    return null;
  }

  const formattedUser = {
    id: user.id,
    user_metadata: {
      firstName: user.full_name?.split(" ")[0] || "",
      lastName: user.full_name?.split(" ")[1] || "",
      avatar_url: user.avatar_url || "",
      bio: user.bio || "",
    },
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 justify-center items-center bg-gray-100 p-8">
        <ProfileForm initialUser={formattedUser} />
      </div>
    </div>
  );
}
