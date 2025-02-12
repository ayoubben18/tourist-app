"use server";

import {
  GuideOnboardingSchema,
  signInSchema,
  touristOnboardingSchema,
} from "@/utils/schemas";
import { publicAction, authenticatedAction } from "../server-only";
import { createClient } from "@/utils/supabase/server-client";
import { db } from "@/db";
import {
  guide_profiles,
  objectsInStorage,
  users_additional_info,
} from "@/db/migrations/schema";
import { and, eq } from "drizzle-orm";

const touristOnboarding = publicAction.create(
  touristOnboardingSchema,
  async (
    { firstName, lastName, email, phone, password, profile_picture },
    _
  ) => {
    const pfp = profile_picture as File | null;

    const supabase = await createClient();

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
      phone: phone,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("User not created");
    }

    const tourist_id = data.user.id;

    var avatar_url: string | null = null;

    if (pfp) {
      const { data: pfp_data, error: pfp_error } = await supabase.storage
        .from("profile_pictures")
        .upload(tourist_id, pfp);

      if (pfp_error) {
        console.error("Upload error:", pfp_error);
        throw new Error("profile picture upload failed");
      }

      const { data: pfp_url } = await supabase.storage
        .from("profile_pictures")
        .getPublicUrl(pfp_data.path);

      avatar_url = pfp_url.publicUrl;
    }

    await db.insert(users_additional_info).values({
      id: data.user!.id,
      avatar_url: avatar_url,
      full_name: `${firstName} ${lastName}`,
      role: "visitor",
    });
  }
);

const guideOnboarding = publicAction.create(
  GuideOnboardingSchema,
  async (
    {
      firstName,
      lastName,
      email,
      phone,
      yearsOfExperience,
      hourlyRate,
      password,
      profile_picture,
      authorization_document,
    },
    _
  ) => {
    const pfp = profile_picture as File | null;
    const authorization_doc = authorization_document as File;

    if (!authorization_doc) {
      throw new Error("Authorization document is required");
    }

    const supabase = await createClient();

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
      phone: phone,
    });
    // console.log("user: ",data);

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("User not created");
    }

    const guide_id = data.user.id;
    var avatar_url: string | null = null;

    if (pfp) {
      const { data: pfp_data, error: pfp_error } = await supabase.storage
        .from("profile_pictures")
        .upload(guide_id, pfp);

      if (pfp_error) {
        console.error("Upload error:", pfp_error);
        throw new Error("profile picture upload failed");
      }

      const { data: pfp_url } = await supabase.storage
        .from("profile_pictures")
        .getPublicUrl(pfp_data.path);

      avatar_url = pfp_url.publicUrl;
    }

    const { data: doc_data, error: doc_error } = await supabase.storage
      .from("documents")
      .upload(guide_id, authorization_doc);

    if (doc_error) {
      console.error("Upload error:", doc_error);
      throw new Error("authorization document upload failed");
    }

    const doc_object = await db
      .select()
      .from(objectsInStorage)
      .where(
        and(
          eq(objectsInStorage.path_tokens, [doc_data.path]),
          eq(objectsInStorage.bucket_id, "documents")
        )
      )
      .then((res) => res[0]);

    await db.transaction(async (tx) => {
      await tx.insert(users_additional_info).values({
        id: guide_id,
        avatar_url: avatar_url,
        full_name: `${firstName} ${lastName}`,
        role: "guide",
      });

      await tx.insert(guide_profiles).values({
        guide_id: guide_id,
        verification_status: "pending",
        authorization_document: doc_object.id,
        years_of_experience: yearsOfExperience,
        price_per_hour: hourlyRate,
      });
    });
  }
);

const signIn = publicAction.create(
  signInSchema,
  async ({ email, password }, _) => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      const userInfo = await getUserInfo();
      console.log("User role: ", userInfo);
    }

    if (error) {
      throw new Error(error.message);
    }
  }
);

const signOut = publicAction.create(async ({}) => {
  const supabase = await createClient();
  await supabase.auth.signOut();
});

const getUserInfo = authenticatedAction.create(async ({ userId, email }) => {
  const [userInfo] = await db
    .select({
      id: users_additional_info.id,
      full_name: users_additional_info.full_name,
      avatar_url: users_additional_info.avatar_url,
      role: users_additional_info.role,
    })
    .from(users_additional_info)
    .where(eq(users_additional_info.id, userId))
    .limit(1);

  return { ...userInfo, email: email };
});

const isUserAuthenticated = publicAction.create(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return data.user ? true : false;
});

export {
  touristOnboarding,
  guideOnboarding,
  signIn,
  signOut,
  getUserInfo,
  isUserAuthenticated,
};
