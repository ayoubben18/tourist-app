"use server"

import { db } from "@/db";
import {
  circuits,
  cities,
  users_additional_info,
} from "@/db/migrations/schema";
import { CircuitsDTO } from "@/dto/circuits-dto";
import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { z } from "zod";
import { publicAction } from "../server-only";

const getPublicCircuits = publicAction.create(
  z.object({
    searchTerm: z.string().optional(),
    duration: z.number().positive().optional().nullable(),
    distance: z.number().positive().optional().nullable(),
    rating: z.number().positive().optional().nullable(),
    sortBy: z.string().optional(),
  }),
  async ({
    searchTerm,
    duration,
    distance,
    rating,
    sortBy,
  }): Promise<CircuitsDTO[]> => {
    const whereClause = and(
      eq(circuits.is_public, true),
      searchTerm
        ? or(
            ilike(circuits.name, "%" + searchTerm + "%"),
            ilike(circuits.description, "%" + searchTerm + "%")
          )
        : undefined,
      duration
        ? and(
            gte(circuits.estimated_duration, duration - 10),
            lte(circuits.estimated_duration, duration + 10)
          )
        : undefined,

      distance
        ? and(
            gte(circuits.distance, String(distance - 1)),
            lte(circuits.distance, String(distance + 1))
          )
        : undefined,
      rating ? gte(circuits.rating, String(rating)) : undefined
    );

    let query = db
      .select({
        id: circuits.id,
        name: circuits.name,
        description: circuits.description,
        estimated_duration: circuits.estimated_duration,
        distance: circuits.distance,
        rating: circuits.rating,
        creator: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
        city: cities.name,
        country: cities.country,
        image: cities.image_url,
      })
      .from(circuits)
      .innerJoin(
        users_additional_info,
        eq(circuits.creator_id, users_additional_info.id)
      )
      .innerJoin(cities, eq(cities.city_id, circuits.city_id))
      .where(whereClause);

    // Sorting
    switch (sortBy) {
      case "rating":
        query.orderBy(desc(circuits.rating));
        break;
      case "recent":
        query.orderBy(desc(circuits.created_at));
        break;
      default:
        query.orderBy(desc(circuits.created_at));
    }

    return await query;
  }
);

export { getPublicCircuits };
