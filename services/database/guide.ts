"use server";

import { db } from "@/db";
import {
  bookings,
  guide_profiles,
  objectsInStorage,
  users_additional_info,
} from "@/db/migrations/schema";
import { GuideDTO } from "@/dto/guides-dto";
import {
  and,
  eq,
  gte,
  ilike,
  lte,
  arrayContains,
  not,
  exists,
  sql,
  or,
} from "drizzle-orm";
import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import { createClient } from "@/utils/supabase/server-client";

const getGuides = publicAction.create(
  z.object({
    searchTerm: z.string().optional(),
    yearsOfExperience: z.number().positive().optional(),
    pricePerHour: z.number().positive().optional(),
    rating: z.number().positive().optional(),
    city: z.string().optional(),
    startTime: z.date().optional(),
    duration: z.number().positive().optional(),
  }),
  async ({
    searchTerm,
    yearsOfExperience,
    pricePerHour,
    rating,
    city,
    startTime,
    duration,
  }): Promise<GuideDTO[]> => {
    const whereClause = and(
      city ? arrayContains(guide_profiles.cities, [city]) : undefined,
      eq(guide_profiles.verification_status, "approved"),
      searchTerm
        ? or(
            ilike(users_additional_info.full_name, "%" + searchTerm + "%"),
            ilike(guide_profiles.country, "%" + searchTerm + "%")
          )
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
      // startTime && duration
      //   ? not(
      //       exists(
      //         db
      //           .select()
      //           .from(bookings)
      //           .where(
      //             and(
      //               eq(bookings.guide_id, guide_profiles.id),
      //               or(
      //                 // Check if new booking overlaps with existing booking start
      //                 and(
      //                   lte(bookings.booking_date, startTime.toISOString()),
      //                   gte(
      //                     sql`${bookings.booking_date} + interval '1 minute' * ${bookings.estimated_duration}`,
      //                     startTime
      //                   )
      //                 ),
      //                 // Check if new booking overlaps with existing booking end
      //                 and(
      //                   lte(
      //                     bookings.booking_date,
      //                     sql`${startTime} + interval '1 minute' * ${duration}`
      //                   ),
      //                   gte(
      //                     sql`${bookings.booking_date} + interval '1 minute' * ${bookings.estimated_duration}`,
      //                     sql`${startTime} + interval '1 minute' * ${duration}`
      //                   )
      //                 )
      //               ),
      //               not(eq(bookings.status, "cancelled"))
      //             )
      //           )
      //       )
      //     )
      //   : undefined
    );
    const guides = await db
      .select({
        id: guide_profiles.id,
        full_name: users_additional_info.full_name,
        avatar_url: users_additional_info.avatar_url,
        years_of_experience: guide_profiles.years_of_experience,
        country: guide_profiles.country,
        rating: guide_profiles.rating,
        number_of_reviews: guide_profiles.number_of_reviews,
        price_per_hour: guide_profiles.price_per_hour,
        verification_status: guide_profiles.verification_status,
        authorization_document: guide_profiles.authorization_document,
        verified_at: guide_profiles.verified_at,
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
  async ({ guide_id }): Promise<GuideDTO> => {
    const guide = await db
      .select({
        id: guide_profiles.id,
        verification_status: guide_profiles.verification_status,
        full_name: users_additional_info.full_name,
        avatar_url: users_additional_info.avatar_url,
        years_of_experience: guide_profiles.years_of_experience,
        country: guide_profiles.country,
        rating: guide_profiles.rating,
        number_of_reviews: guide_profiles.number_of_reviews,
        price_per_hour: guide_profiles.price_per_hour,
        available_hours: guide_profiles.available_hours,
      })
      .from(guide_profiles)
      .innerJoin(
        users_additional_info,
        eq(guide_profiles.id, users_additional_info.id)
      )
      .where(eq(guide_profiles.id, guide_id))
      .then((res) => res[0]);

    return guide;
  }
);

const availableHoursSchema = z.object({
  Monday: z.array(z.string()),
  Tuesday: z.array(z.string()),
  Wednesday: z.array(z.string()),
  Thursday: z.array(z.string()),
  Friday: z.array(z.string()),
  Saturday: z.array(z.string()),
  Sunday: z.array(z.string()),
});

const updateGuideProfile = authenticatedAction.create(
  z.object({
    years_of_experience: z.number().optional(),
    price_per_hour: z.string().optional(),
    available_hours: availableHoursSchema.optional(),
  }),
  async ({ ...updateData }, context) => {
    const guide = await db
      .update(guide_profiles)
      .set(updateData)
      .where(eq(guide_profiles.id, context.userId))
      .returning();

    return guide[0];
  }
);

const getPendingGuides = publicAction.create(async () => {
  const supabase = await createClient();

  const getPublicUrl = (fileName: string): string => {
    return supabase.storage.from("documents").getPublicUrl(fileName).data.publicUrl;
  };
  const pendingGuides = await db
    .select({
      id: guide_profiles.id,
      full_name: users_additional_info.full_name,
      avatar_url: users_additional_info.avatar_url,
      years_of_experience: guide_profiles.years_of_experience,
      authorization_document: objectsInStorage.name,
      country: guide_profiles.country,
    })
    .from(guide_profiles)
    .innerJoin(users_additional_info, eq(guide_profiles.id, users_additional_info.id))
    .innerJoin(objectsInStorage, eq(guide_profiles.authorization_document, objectsInStorage.id))
    .where(eq(guide_profiles.verification_status, "pending"));
  return pendingGuides.map(guide => ({
    ...guide,
    authorization_document_url: getPublicUrl(guide.authorization_document!),
  }));
});

const approveGuide = authenticatedAction.create(
  z.object({
    guide_id: z.string(),
  }),
  async ({ guide_id }) => {
    await db
      .update(guide_profiles)
      .set({
        verification_status: "approved",
        verified_at: new Date().toISOString(),
      })
      .where(eq(guide_profiles.id, guide_id));
  }
);

const rejectGuide = authenticatedAction.create(
  z.object({
    guide_id: z.string(),
  }),
  async ({ guide_id }) => {
    await db
      .update(guide_profiles)
      .set({ verification_status: "rejected", verified_at: null })
      .where(eq(guide_profiles.id, guide_id));
  }
);

export {
  getGuides,
  getGuide,
  updateGuideProfile,
  getPendingGuides,
  approveGuide,
  rejectGuide,
};
