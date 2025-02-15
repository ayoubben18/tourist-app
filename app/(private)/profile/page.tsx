"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/(private)/profile/SideBar";
import { ProfileForm } from "@/components/(private)/profile/ProfileForm";
import { useAuth } from "@/hooks/use-auth";

export default function AccountPage() {
  const router = useRouter();

  const {userInfo: user, isUserInfoLoading} = useAuth();

  if (isUserInfoLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
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