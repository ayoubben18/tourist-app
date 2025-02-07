import { db } from "@/db";
import { publicAction } from "../server-only";
import { circuits, cities, users_additional_info } from "@/db/migrations/schema";
import { eq, and, or, gte, lte, desc, sql, SQL } from "drizzle-orm";
import { z } from "zod";

const getPublicCircuits = publicAction.create(
  z.object({
    searchTerm: z.string().optional(),
    duration: z.string().optional(),
    distance: z.string().optional(),
    rating: z.string().optional(),
    sortBy: z.string().optional()
  }),
  async ({
    searchTerm,
    duration,
    distance,
    rating,
    sortBy
  }) => {
    const conditions = [
      eq(circuits.is_public, true),
      searchTerm
        ? or(
            sql`LOWER(${circuits.name}) LIKE LOWER(${'%' + searchTerm + '%'})`,
            sql`LOWER(${circuits.description}) LIKE LOWER(${'%' + searchTerm + '%'})`
          )
        : undefined,
      duration
        ? (() => {
            const [min, max] = duration.split('-').map(Number);
            const minMinutes = min * 60;
            const maxMinutes = max === 8 ? Infinity : max * 60;
            return and(
              gte(circuits.estimated_duration, minMinutes),
              lte(circuits.estimated_duration, maxMinutes)
            );
          })()
        : undefined,
        distance
        ? (() => {
            const [min, max] = distance.split('-').map(Number);
            const conditions: SQL<unknown>[] = [
              gte(circuits.distance, String(min))
            ];
            if (max !== 20) { // use 20 as a flag for "no maximum"
              conditions.push(lte(circuits.distance, String(max)));
            }
            return and(...conditions);
          })()
        : undefined,
        rating 
        ? gte(circuits.rating, String(parseInt(rating.replace('+', '')))) 
        : undefined,
      
    ].filter(Boolean) as SQL<unknown>[];

    let query = db
      .select({
        circuit_id: circuits.circuit_id,
        name: circuits.name,
        description: circuits.description,
        estimated_duration: circuits.estimated_duration,
        distance: circuits.distance,
        rating: circuits.rating,
        creator_id: circuits.creator_id,
        creator_name: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
        city: cities.name,
        country: cities.country,
        city_image: cities.image_url
      })
      .from(circuits)
      .leftJoin(users_additional_info, eq(circuits.creator_id, users_additional_info.id))
      .leftJoin(cities, eq(cities.city_id, circuits.city_id))
      .where(and(...conditions));

    // Sorting
    switch (sortBy) {
      case 'rating':
        query.orderBy(desc(circuits.rating));
        break;
      case 'recent':
        query.orderBy(desc(circuits.created_at));
        break;
      default:
        query.orderBy(desc(circuits.created_at));
    }

    return await query;
  }
);

export { getPublicCircuits };
