"use server";

import { eq, ilike, and, or, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { authenticatedAction, publicAction } from "../server-only";
import { guide_profiles, users_additional_info } from "@/db/migrations/schema";
import { GuideDTO } from "@/dto/guides-dto";
import { z } from "zod";

const getGuides = authenticatedAction.create(
  z.object({
    searchTerm: z.string().optional(),
    yearsOfExperience: z.number().positive().optional(),
    pricePerHour: z.number().positive().optional(),
    rating: z.number().positive().optional(),
  }),
  async ({
    searchTerm,
    yearsOfExperience,
    pricePerHour,
    rating,
  }): Promise<GuideDTO[]> => {
    const whereClause = and(
      eq(guide_profiles.verification_status, "approved"),
      searchTerm
        ? ilike(users_additional_info.full_name, "%" + searchTerm + "%")
        : undefined,
      yearsOfExperience
        ? yearsOfExperience == 4
          ? gte(guide_profiles.years_of_experience, 4)
          : eq(guide_profiles.years_of_experience, yearsOfExperience)
        : undefined,

      pricePerHour
        ? pricePerHour == 200
          ? gte(guide_profiles.price_per_hour, "200")
          : and(
              gte(guide_profiles.price_per_hour, String(pricePerHour - 25)),
              lte(guide_profiles.price_per_hour, String(pricePerHour + 25))
            )
        : undefined,
      rating ? gte(guide_profiles.rating, String(rating)) : undefined
    );
    const guides = await db
      .select({
        id: guide_profiles.id,
        full_name: users_additional_info.full_name,
        avatar_url: users_additional_info.avatar_url,
        years_of_experience: guide_profiles.years_of_experience,
        rating: guide_profiles.rating,
        number_of_reviews: guide_profiles.number_of_reviews,
        price_per_hour: guide_profiles.price_per_hour,
        verification_status: guide_profiles.verification_status,
        authorization_document: guide_profiles.authorization_document,
        verified_at: guide_profiles.verified_at,
        available_days: guide_profiles.available_days,
        available_hours: guide_profiles.available_hours,
      })
      .from(guide_profiles)
      .innerJoin(
        users_additional_info,
        eq(guide_profiles.id, users_additional_info.id)
      )
      .where(whereClause);

    return guides;
  }
);

const getGuide = publicAction.create(
  z.object({
    guide_id: z.string(),
  }),
  async ({ guide_id }) : Promise<GuideDTO>  => {
    const guide = await db
      .select({
        id: guide_profiles.id,
        full_name: users_additional_info.full_name,
        avatar_url: users_additional_info.avatar_url,
        years_of_experience: guide_profiles.years_of_experience,
        rating: guide_profiles.rating,
        number_of_reviews: guide_profiles.number_of_reviews,
        price_per_hour: guide_profiles.price_per_hour,
        available_days: guide_profiles.available_days,
        available_hours: guide_profiles.available_hours,
      })
      .from(guide_profiles)
      .innerJoin(
        users_additional_info,
        eq(guide_profiles.id, users_additional_info.id)
      )
      .where(
        and(
          eq(guide_profiles.id, guide_id),
          eq(guide_profiles.verification_status, "approved")
        )
      )
      .then((res) => res[0]);

    return guide
  }
);

export { getGuides, getGuide };
