"use server";

import { db } from "@/db";
import {
  bookings,
  circuits,
  users_additional_info,
} from "@/db/migrations/schema";
import { GuideBookingsDTO } from "@/dto/bookings-dto";
import { and, eq } from "drizzle-orm";
import { authenticatedAction } from "../server-only";
import { z } from "zod";

const getBookings = authenticatedAction.create(
  z.object({
    status: z.enum(["pending", "confirmed"])
  }),
  async ({status}, context): Promise<GuideBookingsDTO[]> => {
    const pendingBookings = await db
      .select({
        status: bookings.status,
        guide_id: bookings.guide_id,
        booking_id: bookings.booking_id,
        circuit_id: bookings.circuit_id,
        created_at: bookings.created_at,
        tourist_id: bookings.tourist_id,
        booking_date: bookings.booking_date,
        total_price: bookings.total_price,
        creator_avatar: users_additional_info.avatar_url,
        creator: users_additional_info.full_name,
        circuit_name: circuits.name,
        circuit_duration: circuits.estimated_duration,
      })
      .from(bookings)
      .innerJoin(
        users_additional_info,
        eq(bookings.tourist_id, users_additional_info.id)
      )
      .innerJoin(circuits, eq(bookings.circuit_id, circuits.id))
      .where(
        and(
          eq(bookings.guide_id, context.userId),
          eq(bookings.status, status)
        )
      );

    return pendingBookings;
  }
);

const confirmBooking = authenticatedAction.create(
  z.object({
    booking_id: z.number().positive(),
  }),
  async ({ booking_id }, context) => {
    await db
     .update(bookings)
     .set({ status: "confirmed" })
     .where(
        and(
          eq(bookings.booking_id, booking_id),
          eq(bookings.guide_id, context.userId)
        )
      );
    }
)

const rejectBooking = authenticatedAction.create(
  z.object({
    booking_id: z.number().positive(),
  }),
  async ({ booking_id }, context) => {
    await db
    .update(bookings)
    .set({ status: "cancelled" })
     .where(
        and(
          eq(bookings.booking_id, booking_id),
          eq(bookings.guide_id, context.userId)
        )
      );
    }
)

export { getBookings, confirmBooking, rejectBooking };
