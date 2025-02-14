"use server";

import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import { CommentsDTO } from "@/dto/comments-dto";
import { db } from "@/db";
import { comments, users_additional_info } from "./../../db/migrations/schema";
import { and, eq } from "drizzle-orm";

const getComments = publicAction.create(
  z.object({
    circuit_id: z.string(),
  }),
  async ({ circuit_id }): Promise<CommentsDTO[]> => {
    const commentsOfCircuit = db
      .select({
        id: comments.id,
        circuit_id: comments.circuit_id,
        comment: comments.comment,
        user_id: comments.user_id,
        created_at: comments.created_at,
        creator: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
      })
      .from(comments)
      .innerJoin(
        users_additional_info,
        eq(users_additional_info.id, comments.user_id)
      )
      .where(eq(comments.circuit_id, Number(circuit_id)));

    return commentsOfCircuit;
  }
);

const addComment = authenticatedAction.create(
  z.object({
    circuit_id: z.number().positive(),
    comment: z.string(),
  }),
  async ({ circuit_id, comment }, context) => {
    await db.insert(comments).values({
      circuit_id: Number(circuit_id),
      user_id: context.userId,
      comment,
    });
  }
);

const removeComment = authenticatedAction.create(
  z.object({
    comment_id: z.number().positive(),
  }),
  async ({ comment_id }, context) => {
    await db
      .delete(comments)
      .where(
        and(eq(comments.id, comment_id), eq(comments.user_id, context.userId))
      );
  }
);

export { getComments, addComment, removeComment };
