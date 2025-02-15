"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import { updateProfile } from "@/services/database/updateUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProfileFormProps {
  initialUser: {
    id: string;
    user_metadata: {
      firstName?: string;
      lastName?: string;
      avatar_url?: string;
      bio?: string;
    };
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(
    initialUser.user_metadata?.firstName || ""
  );
  const [lastName, setLastName] = useState(
    initialUser.user_metadata?.lastName || ""
  );
  const [bio, setBio] = useState(initialUser.user_metadata?.bio || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  console.log("User data:", initialUser);

  const validatePasswords = () => {
    if (password && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSave = async () => {
    if (password && !validatePasswords()) {
      return;
    }

    const updatePromise = updateProfile({
      firstName,
      lastName,
      bio,
      password,
      profile_picture: profilePicture,
    });

    toast.promise(updatePromise, {
      loading: "Updating profile...",
      success: () => {
        setPassword("");
        setConfirmPassword("");
        setPasswordError("");
        router.refresh();
        return "Profile updated successfully!";
      },
      error: "Failed to update profile.",
    });
  };

  return (
    <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Profile Settings
      </h2>

      {/* Profile Picture */}
      <div className="flex items-center justify-center gap-4">
        <div className="relative">
          <img
            src={initialUser.user_metadata?.avatar_url || "/me.webp"}
            alt="Profile picture"
            className="w-24 h-24 rounded-full object-cover border border-gray-200"
          />
          <label className="absolute -right-2 -bottom-2 p-2 bg-primary text-white rounded-full shadow cursor-pointer hover:bg-primary/90 transition">
            <Camera className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-4 mt-6">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (confirmPassword) validatePasswords();
            }}
            className="mt-2 w-full rounded-md border px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (password) validatePasswords();
            }}
            className="mt-2 w-full rounded-md border px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white font-medium rounded-md shadow hover:bg-primary/90 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
