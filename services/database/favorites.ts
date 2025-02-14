"use server";

import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import { db } from "@/db";
import { favorites, users_additional_info } from "./../../db/migrations/schema";
import { and, eq } from "drizzle-orm";
import { FavoritesDTO } from "@/dto/favorites-dto";

const getFavoritesOfUser = authenticatedAction.create(
  async (context): Promise<FavoritesDTO[]> => {
    const favoritesOfUser = db
      .select({
        id: favorites.id,
        circuit_id: favorites.circuit_id,
        user_id: favorites.user_id,
        created_at: favorites.created_at,
      })
      .from(favorites)
      .where(eq(favorites.user_id, context.userId));

    return favoritesOfUser;
  }
);

const addToFavorites = authenticatedAction.create(
  z.object({
    circuit_id: z.number().positive(),
  }),
  async ({ circuit_id }, context) => {
    const favorite = await db.insert(favorites).values({
      circuit_id: circuit_id,
      user_id: context.userId,
    });
    return favorite;
  }
);

const removeFromFavorites = authenticatedAction.create(
  z.object({
    favorite_id: z.number().positive(),
  }),
  async ({favorite_id}, context) => {
    await db.delete(favorites).where(and(eq(favorites.id, favorite_id), eq(favorites.user_id, context.userId)));
    return { success: true };
  }
);

const isFavorite = authenticatedAction.create(
  z.object({
    circuit_id: z.number().positive(),
  }),
  async ({ circuit_id }, context) => {
    const isFavorite = await db
     .select()
     .from(favorites)
     .where(and(eq(favorites.circuit_id, circuit_id), eq(favorites.user_id, context.userId)));

     if (isFavorite.length > 0) {
      return {
        isFavorite: true,
        favorite_id: isFavorite[0].id,
      };
    }
    return {isFavorite: false};
})

export { getFavoritesOfUser, addToFavorites, removeFromFavorites, isFavorite };
