"use server";

import { authenticatedAction } from "../server-only";
import { db } from "@/db";
import { users_additional_info } from "@/db/migrations/schema";
import { eq } from "drizzle-orm";
import { updateProfileSchema } from "@/utils/schemas";
import { createClient } from "@/utils/supabase/server-client";

const updateProfile = authenticatedAction.create(
  updateProfileSchema,
  async ({ firstName, lastName, email, phone, password, profile_picture, bio }, context) => {
    console.log('🔥 Starting profile update');

    try {
      const supabase = await createClient();
      console.log('✅ Supabase client initialized');

      // 🚀 Initialize update object
      const updateData: { email?: string; phone?: string; data?: { firstName?: string; lastName?: string; bio?: string } } = {};  

      // ✅ Update password **only if provided**
      if (password && password.trim() !== "") {
        console.log('🔑 Password update requested');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          console.error('❌ Password update failed:', error);
          throw new Error(error.message);
        }
        console.log('✅ Password updated successfully');
      } else {
        console.log('⚠️ No password update needed');
      }

      // ✅ Update name, email, phone, and bio if provided
      if (email?.trim()) updateData.email = email.trim();
      if (phone?.trim()) updateData.phone = phone.trim();
      if (firstName?.trim() || lastName?.trim() || bio?.trim()) {
        updateData.data = {
          ...context.user_metadata,
          ...(firstName?.trim() && { firstName: firstName.trim() }),
          ...(lastName?.trim() && { lastName: lastName.trim() }),
          ...(bio?.trim() && { bio: bio.trim() }) // ← Added `bio`
        };
      }

      if (Object.keys(updateData).length > 0) {
        console.log('📡 Updating metadata:', updateData);
        const { error } = await supabase.auth.updateUser(updateData);
        if (error) {
          console.error('❌ Metadata update failed:', error);
          throw new Error(error.message);
        }
        console.log('✅ Metadata updated successfully');
      }

      // ✅ Handle profile picture upload (optional)
      let avatar_url: string | null = null;
      if (profile_picture && profile_picture instanceof File) {
        console.log('🖼 Uploading profile picture...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile_pictures")
          .upload(`${context.userId}`, profile_picture, { upsert: true });

        if (uploadError) {
          console.error('❌ Profile picture upload failed:', uploadError);
          throw new Error("Failed to upload profile picture");
        }

        console.log('✅ Profile picture uploaded successfully');
        const { data: pfp_url } = await supabase.storage
          .from("profile_pictures")
          .getPublicUrl(`${context.userId}`);

        avatar_url = pfp_url.publicUrl;
      }

      // ✅ Update database (now includes `bio`)
      if (firstName?.trim() || lastName?.trim() || avatar_url || bio?.trim()) {  // ← Added `bio` here
        console.log('🛠 Updating user info in database...');
        await db.transaction(async (tx) => {
          if (firstName?.trim() || lastName?.trim() || bio?.trim()) { // ← Added `bio` check
            const fullName = `${firstName?.trim() || context.user_metadata?.firstName || ''} ${lastName?.trim() || context.user_metadata?.lastName || ''}`.trim();
            await tx.update(users_additional_info)
              .set({ full_name: fullName, bio: bio?.trim() || context.user_metadata?.bio || "" })  // ← Added `bio`
              .where(eq(users_additional_info.id, context.userId));
          }

          if (avatar_url) {
            await tx.update(users_additional_info)
              .set({ avatar_url })
              .where(eq(users_additional_info.id, context.userId));
          }
        });
        console.log('✅ Database update completed');
      }

      console.log('🎉 Profile update successful!');
      return { success: true };
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  }
);


export { updateProfile };