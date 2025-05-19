"use server";

import { db } from "@/db";
import {
  circuit_points,
  circuits,
  cities,
  favorites,
  likes,
  points_of_interest,
  users_additional_info,
} from "@/db/migrations/schema";
import type { CircuitsDTO } from "@/dto/circuits-dto";
import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import type { PointOfInterestDTO } from "@/dto/points-of-interest-dto";

const getPublicCircuits = publicAction.create(
  z.object({
    searchTerm: z.string().optional(),
    duration: z.number().positive().optional(),
    distance: z.number().positive().optional(),
    rating: z.number().positive().optional(),
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
          gte(circuits.estimated_duration, duration * 60 - 60),
          lte(circuits.estimated_duration, duration * 60 + 60)
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
        number_of_reviews: circuits.number_of_reviews,
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
      .innerJoin(cities, eq(cities.id, circuits.city_id))
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
        number_of_reviews: circuits.number_of_reviews,
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
      .innerJoin(cities, eq(cities.id, circuits.city_id))
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
        id: points_of_interest.id,
        name: points_of_interest.name,
        description: points_of_interest.description,
        category: points_of_interest.category,
        coordinates: points_of_interest.coordinates,
        estimated_duration: points_of_interest.estimated_duration,
        opening_hours: points_of_interest.opening_hours,
        address: points_of_interest.address,
        sequence_order: circuit_points.sequence_order,
        google_place_id: points_of_interest.google_place_id,
      })
      .from(circuit_points)
      .innerJoin(
        points_of_interest,
        eq(circuit_points.poi_id, points_of_interest.id)
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
          number_of_reviews: circuits.number_of_reviews,
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
        .innerJoin(cities, eq(cities.id, circuits.city_id))
        .where(
          and(eq(circuits.is_public, true), eq(circuits.id, Number(circuit_id)))
        )
        .then((res) => res[0]),

      // Get points of interest
      db
        .select({
          id: points_of_interest.id,
          name: points_of_interest.name,
          description: points_of_interest.description,
          category: points_of_interest.category,
          coordinates: points_of_interest.coordinates,
          estimated_duration: points_of_interest.estimated_duration,
          opening_hours: points_of_interest.opening_hours,
          address: points_of_interest.address,
          sequence_order: circuit_points.sequence_order,
          google_place_id: points_of_interest.google_place_id,
        })
        .from(circuit_points)
        .innerJoin(
          points_of_interest,
          eq(circuit_points.poi_id, points_of_interest.id)
        )
        .where(eq(circuit_points.circuit_id, Number(circuit_id)))
        .orderBy(circuit_points.sequence_order),
    ]);

    // If circuit doesn't exist or isn't public, return null
    if (!circuit) {
      return null;
    }

    const toReturn = {
      ...circuit,
      pois,
    };

    console.log("toReturn: ", toReturn);

    // Return combined result
    return toReturn;
  }
);

const getMyCircuits = authenticatedAction.create(
  async (context): Promise<CircuitsDTO[]> => {
    const myCircuits = await db
      .select({
        id: circuits.id,
        name: circuits.name,
        description: circuits.description,
        estimated_duration: circuits.estimated_duration,
        distance: circuits.distance,
        rating: circuits.rating,
        number_of_reviews: circuits.number_of_reviews,
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
      .innerJoin(cities, eq(cities.id, circuits.city_id))
      .where(eq(circuits.creator_id, context.userId));
    return myCircuits;
  }
);

const getLikedCircuits = authenticatedAction.create(
  async (context): Promise<CircuitsDTO[]> => {
    const likedCircuits = await db
      .select({
        id: circuits.id,
        name: circuits.name,
        description: circuits.description,
        estimated_duration: circuits.estimated_duration,
        distance: circuits.distance,
        rating: circuits.rating,
        number_of_reviews: circuits.number_of_reviews,
        creator: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
        city: cities.name,
        country: cities.country,
        image: cities.image_url,
      })
      .from(circuits)
      .innerJoin(likes, eq(likes.circuit_id, circuits.id))
      .innerJoin(
        users_additional_info,
        eq(circuits.creator_id, users_additional_info.id)
      )
      .innerJoin(cities, eq(cities.id, circuits.city_id))
      .where(eq(likes.user_id, context.userId));
    return likedCircuits;
  }
);

const getFavoriteCircuits = authenticatedAction.create(
  async (context): Promise<CircuitsDTO[]> => {
    const favoriteCircuits = await db
      .select({
        id: circuits.id,
        name: circuits.name,
        description: circuits.description,
        estimated_duration: circuits.estimated_duration,
        distance: circuits.distance,
        rating: circuits.rating,
        number_of_reviews: circuits.number_of_reviews,
        creator: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
        city: cities.name,
        country: cities.country,
        image: cities.image_url,
      })
      .from(circuits)
      .innerJoin(favorites, eq(favorites.circuit_id, circuits.id))
      .innerJoin(
        users_additional_info,
        eq(circuits.creator_id, users_additional_info.id)
      )
      .innerJoin(cities, eq(cities.id, circuits.city_id))
      .where(eq(favorites.user_id, context.userId));
    return favoriteCircuits;
  }
);

export {
  getPublicCircuits,
  getCircuit,
  getPointsOfInterestOfCircuit,
  getCircuitWithPOI,
  getMyCircuits,
  getLikedCircuits,
  getFavoriteCircuits,
};
