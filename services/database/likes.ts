"use server";

import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import { db } from "@/db";
import {
  identitiesInAuth,
  likes,
  users_additional_info,
} from "./../../db/migrations/schema";
import { and, eq } from "drizzle-orm";
import { LikesDTO } from "@/dto/likes-dto";

const getLikesOfCircuit = publicAction.create(
  z.object({
    circuit_id: z.string(),
  }),
  async ({ circuit_id }): Promise<LikesDTO[]> => {
    const likesOfCircuit = db
      .select({
        id: likes.id,
        circuit_id: likes.circuit_id,
        user_id: likes.user_id,
        created_at: likes.created_at,
        creator: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
      })
      .from(likes)
      .innerJoin(
        users_additional_info,
        eq(users_additional_info.id, likes.user_id)
      )
      .where(eq(likes.circuit_id, Number(circuit_id)));

    return likesOfCircuit;
  }
);

const getLikesOfUser = authenticatedAction.create(
  async (context): Promise<Omit<LikesDTO, "creator" | "creator_avatar">[]> => {
    const likesOfUser = db
      .select({
        id: likes.id,
        circuit_id: likes.circuit_id,
        user_id: likes.user_id,
        created_at: likes.created_at,
      })
      .from(likes)
      .where(eq(likes.user_id, context.userId));

    return likesOfUser;
  }
);

const addToLikes = authenticatedAction.create(
  z.object({
    circuit_id: z.number().positive(),
  }),
  async ({ circuit_id }, context) => {
    const favorite = await db.insert(likes).values({
      circuit_id: circuit_id,
      user_id: context.userId,
    });
    return favorite;
  }
);

const removeFromLikes = authenticatedAction.create(
  z.object({
    like_id: z.number().positive(),
  }),
  async ({ like_id }, context) => {
    await db
      .delete(likes)
      .where(and(eq(likes.id, like_id), eq(likes.user_id, context.userId)));
    return { success: true };
  }
);

const isLiked = authenticatedAction.create(
  z.object({
    circuit_id: z.number().positive(),
  }),
  async ({ circuit_id }, context) => {
    const isLiked = await db
      .select()
      .from(likes)
      .where(
        and(eq(likes.circuit_id, circuit_id), eq(likes.user_id, context.userId))
      );

    if (isLiked.length > 0) {
      return {
        isLiked: true,
        like_id: isLiked[0].id,
      };
    }
    return {isLiked: false};
  }
);

export {
  getLikesOfCircuit,
  getLikesOfUser,
  addToLikes,
  removeFromLikes,
  isLiked,
};
