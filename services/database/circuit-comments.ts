"use server";

import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import { CircuitCommentsDTO } from "@/dto/circuit-comments-dto";
import { db } from "@/db";
import { circuit_comments, users_additional_info } from "../../db/migrations/schema";
import { and, eq } from "drizzle-orm";

const getComments = publicAction.create(
  z.object({
    circuit_id: z.string(),
  }),
  async ({ circuit_id }): Promise<CircuitCommentsDTO[]> => {
    const commentsOfCircuit = db
      .select({
        id: circuit_comments.id,
        circuit_id: circuit_comments.circuit_id,
        comment: circuit_comments.comment,
        rating: circuit_comments.rating,
        user_id: circuit_comments.user_id,
        created_at: circuit_comments.created_at,
        creator: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
      })
      .from(circuit_comments)
      .innerJoin(
        users_additional_info,
        eq(users_additional_info.id, circuit_comments.user_id)
      )
      .where(eq(circuit_comments.circuit_id, Number(circuit_id)));

    return commentsOfCircuit;
  }
);

const addComment = authenticatedAction.create(
  z.object({
    circuit_id: z.number().positive(),
    comment: z.string(),
    rating: z.number().min(1).max(5),
  }),
  async ({ circuit_id, comment, rating }, context) => {
    await db.insert(circuit_comments).values({
      circuit_id: Number(circuit_id),
      user_id: context.userId,
      comment,
      rating
    });
  }
);

const removeComment = authenticatedAction.create(
  z.object({
    comment_id: z.number().positive(),
  }),
  async ({ comment_id }, context) => {
    await db
      .delete(circuit_comments)
      .where(
        and(eq(circuit_comments.id, comment_id), eq(circuit_comments.user_id, context.userId))
      );
  }
);

export { getComments, addComment, removeComment };
