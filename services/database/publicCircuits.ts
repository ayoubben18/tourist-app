"use server";

import { db } from "@/db";
import {
  circuit_points,
  circuits,
  cities,
  points_of_interest,
  users_additional_info,
} from "@/db/migrations/schema";
import { CircuitsDTO } from "@/dto/circuits-dto";
import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { z } from "zod";
import { publicAction } from "../server-only";
import { PointOfInterestDTO } from "@/dto/points-of-interest-dto";

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

const getCircuit = publicAction.create(
  z.object({
    circuit_id: z.string(),
  }),
  async ({ circuit_id }): Promise<CircuitsDTO> => {
    const circuit = await db
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
      .where(
        and(eq(circuits.is_public, true), eq(circuits.id, Number(circuit_id)))
      )
      .then((res) => res[0]);

    return circuit;
  }
);

const getPointsOfInterestOfCircuit = publicAction.create(
  z.object({
    circuit_id: z.string(),
  }),
  async ({ circuit_id }): Promise<PointOfInterestDTO[]> => {
    const pois = await db
      .select({
        poi_id: points_of_interest.poi_id,
        name: points_of_interest.name,
        description: points_of_interest.description,
        category: points_of_interest.category,
        coordinates: points_of_interest.coordinates,
        estimated_duration: points_of_interest.estimated_duration,
        opening_hours: points_of_interest.opening_hours,
        address: points_of_interest.address,
        sequence_order: circuit_points.sequence_order,
      })
      .from(circuit_points)
      .innerJoin(
        points_of_interest,
        eq(circuit_points.poi_id, points_of_interest.poi_id)
      )
      .where(eq(circuit_points.circuit_id, Number(circuit_id)))
      .orderBy(circuit_points.sequence_order);

    return pois;
  }
);

const getCircuitWithPOI = publicAction.create(
  z.object({
    circuit_id: z.string(),
  }),
  async ({
    circuit_id,
  }): Promise<(CircuitsDTO & { pois: PointOfInterestDTO[] }) | null> => {
    const [circuit, pois] = await Promise.all([
      // Get circuit details
      db
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
        .where(
          and(eq(circuits.is_public, true), eq(circuits.id, Number(circuit_id)))
        )
        .then((res) => res[0]),

      // Get points of interest
      db
        .select({
          poi_id: points_of_interest.poi_id,
          name: points_of_interest.name,
          description: points_of_interest.description,
          category: points_of_interest.category,
          coordinates: points_of_interest.coordinates,
          estimated_duration: points_of_interest.estimated_duration,
          opening_hours: points_of_interest.opening_hours,
          address: points_of_interest.address,
          sequence_order: circuit_points.sequence_order,
        })
        .from(circuit_points)
        .innerJoin(
          points_of_interest,
          eq(circuit_points.poi_id, points_of_interest.poi_id)
        )
        .where(eq(circuit_points.circuit_id, Number(circuit_id)))
        .orderBy(circuit_points.sequence_order),
    ]);

    // If circuit doesn't exist or isn't public, return null
    if (!circuit) {
      return null;
    }

    // Return combined result
    return {
      ...circuit,
      pois,
    };
  }
);

export {
  getPublicCircuits,
  getCircuit,
  getPointsOfInterestOfCircuit,
  getCircuitWithPOI,
};
