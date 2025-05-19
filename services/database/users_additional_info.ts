"use server"

import { authenticatedAction } from "@/services/server-only";
import { z } from "zod";
import { users_additional_info } from "@/db/migrations/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { createClient } from "@/utils/supabase/server-client";

const updateAvatar = authenticatedAction.create(
    z.object({
        image: z.string(), // base64 image string
    }), 
    async ({ image }, context) => {
        const supabase = await createClient();
        
        // Convert base64 to file
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Upload to Supabase Storage
        const fileName = `avatar-${context.userId}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('profile_pictures') // Make sure this bucket exists
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            throw new Error('Failed to upload avatar: ' + uploadError.message);
        }

        // Get the public URL
        const { data: { publicUrl } } = await supabase
            .storage
            .from('profile_pictures')
            .getPublicUrl(fileName);

        // Update the user's avatar_url in the database
        await db
            .update(users_additional_info)
            .set({
                avatar_url: publicUrl
            })
            .where(eq(users_additional_info.id, context.userId));

        return { avatarUrl: publicUrl };
    }
);

const updateUserInfo = authenticatedAction.create(
    z.object({
        full_name: z.string(),
        bio: z.string(),
    }), 
    async ({ full_name, bio }, context) => {
        await db
            .update(users_additional_info)
            .set({
                full_name,
                bio
            })
            .where(eq(users_additional_info.id, context.userId));
    }
);

export { updateAvatar, updateUserInfo };