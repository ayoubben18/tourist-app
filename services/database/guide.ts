"use server";

import { eq, ilike, and } from "drizzle-orm";
import { db } from "@/db";
import { authenticatedAction } from "../server-only";
import { guide_profiles, users_additional_info } from "@/db/migrations/schema";
import { GuideDTO } from "@/dto/guides-dto";
import { z } from "zod";

const getGuides = authenticatedAction.create(
  z.object({
    searchTerm: z.string().optional(),
  }),
  async ({ searchTerm }): Promise<GuideDTO[]> => {
    const guides = await db
      .select({
        id: guide_profiles.id,
        full_name: users_additional_info.full_name,
        avatar_url: users_additional_info.avatar_url,
        years_of_experience: guide_profiles.years_of_experience,
        rating: guide_profiles.rating,
        price_per_hour: guide_profiles.price_per_hour,
        verification_status: guide_profiles.verification_status,
        authorization_document: guide_profiles.authorization_document,
        verified_at: guide_profiles.verified_at,
      })
      .from(guide_profiles)
      .innerJoin(
        users_additional_info,
        eq(guide_profiles.id, users_additional_info.id)
      )
      .where(
        and(
          eq(guide_profiles.verification_status, "approved"),
          ilike(users_additional_info.full_name, `%${searchTerm}%`)
        )
      );

    return guides;
  }
);

export { getGuides };
