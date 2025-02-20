"use server";

import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import { db } from "@/db";
import {
  guide_profiles,
  guides_comments,
  users_additional_info,
} from "../../db/migrations/schema";
import { and, eq, sql } from "drizzle-orm";
import { GuideCommentsDTO } from "@/dto/guide-comments-dto";

const getComments = publicAction.create(
  z.object({
    guide_id: z.string(),
  }),
  async ({ guide_id }): Promise<GuideCommentsDTO[]> => {
    const commentsOfCircuit = db
      .select({
        id: guides_comments.id,
        guide_id: guides_comments.guide_id,
        comment: guides_comments.comment,
        rating: guides_comments.rating,
        user_id: guides_comments.user_id,
        created_at: guides_comments.created_at,
        creator: users_additional_info.full_name,
        creator_avatar: users_additional_info.avatar_url,
      })
      .from(guides_comments)
      .innerJoin(
        users_additional_info,
        eq(users_additional_info.id, guides_comments.user_id)
      )
      .where(eq(guides_comments.guide_id, guide_id));

    return commentsOfCircuit;
  }
);

const addComment = authenticatedAction.create(
  z.object({
    guide_id: z.string(),
    comment: z.string(),
    rating: z.number().min(1).max(5),
  }),
  async ({ guide_id, comment, rating }, context) => {
    await db.insert(guides_comments).values({
      guide_id,
      user_id: context.userId,
      comment,
      rating,
    });
  }
);

const removeComment = authenticatedAction.create(
  z.object({
    comment_id: z.number().positive(),
  }),
  async ({ comment_id }, context) => {
    await db
      .delete(guides_comments)
      .where(
        and(
          eq(guides_comments.id, comment_id),
          eq(guides_comments.user_id, context.userId)
        )
      );
  }
);

export { getComments, addComment, removeComment };
