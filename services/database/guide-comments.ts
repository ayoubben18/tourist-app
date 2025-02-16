"use server";

import { z } from "zod";
import { authenticatedAction, publicAction } from "../server-only";
import { db } from "@/db";
import { guide_profiles, guides_comments, users_additional_info } from "../../db/migrations/schema";
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
    await db.transaction(async (tx) => {
      // Insert the new comment
      await tx.insert(guides_comments).values({
        guide_id,
        user_id: context.userId,
        comment,
        rating
      });

      // Update guide statistics
      await tx
        .update(guide_profiles)
        .set({
          number_of_reviews: sql`${guide_profiles.number_of_reviews} + 1`,
          rating: sql`
            (
              SELECT ROUND(AVG(rating)::numeric, 2)
              FROM ${guides_comments}
              WHERE guide_id = ${guide_id}
            )
          `
        })
        .where(eq(guide_profiles.id, guide_id));
    });
  }
);

const removeComment = authenticatedAction.create(
  z.object({
    comment_id: z.number().positive(),
    guide_id: z.string()
  }),
  async ({ comment_id, guide_id }, context) => {
    await db.transaction(async (tx) => {
      // Delete the comment
      await tx
        .delete(guides_comments)
        .where(
          and(
            eq(guides_comments.id, comment_id),
            eq(guides_comments.user_id, context.userId)
          )
        );

      // Update guide statistics
      await tx
        .update(guide_profiles)
        .set({
          number_of_reviews: sql`${guide_profiles.number_of_reviews} - 1`,
          rating: sql`
            CASE 
              WHEN (SELECT COUNT(*) FROM ${guides_comments} WHERE guide_id = ${guide_id}) = 0 
              THEN NULL 
              ELSE (
                SELECT ROUND(AVG(rating)::numeric, 2)
                FROM ${guides_comments}
                WHERE guide_id = ${guide_id}
              )
            END
          `
        })
        .where(eq(guide_profiles.id, guide_id));
    });
  }
);

export { getComments, addComment, removeComment };
