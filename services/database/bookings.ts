"use server";

import { db } from "@/db";
import {
  bookings,
  circuits,
  users_additional_info,
  guide_profiles,
} from "@/db/migrations/schema";
import { GuideBookingsDTO } from "@/dto/bookings-dto";
import { and, eq } from "drizzle-orm";
import { authenticatedAction } from "../server-only";
import { z } from "zod";

const getBookings = authenticatedAction.create(
  z.object({
    status: z.enum(["pending", "confirmed"]),
  }),
  async ({ status }, context): Promise<GuideBookingsDTO[]> => {
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
        estimated_duration: circuits.estimated_duration,
      })
      .from(bookings)
      .innerJoin(
        users_additional_info,
        eq(bookings.tourist_id, users_additional_info.id)
      )
      .innerJoin(circuits, eq(bookings.circuit_id, circuits.id))
      .where(
        and(eq(bookings.guide_id, context.userId), eq(bookings.status, status))
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
);

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
);

const takeTrip = authenticatedAction.create(
  z.object({
    circuit_id: z.number().int().positive(),
    guide_id: z.string().uuid().optional(),
    booking_date: z.string(), // ISO string
  }),
  async (
    { circuit_id, guide_id, booking_date },
    context
  ) => {
    // Get circuit duration
    const circuit = await db
      .select({ estimated_duration: circuits.estimated_duration })
      .from(circuits)
      .where(eq(circuits.id, circuit_id))
      .then((rows) => rows[0]);

    if (!circuit || circuit.estimated_duration == null)
      throw new Error("Circuit duration not found");

    let guidePricePerHour: number = 0;

    // Get guide price per hour
    if (guide_id) {
      const guide = await db
        .select({ price_per_hour: guide_profiles.price_per_hour })
        .from(guide_profiles)
        .where(eq(guide_profiles.id, guide_id))
        .then((rows) => rows[0]);

      guidePricePerHour = Number(guide.price_per_hour);
    }


    // Calculate total price (duration in hours * price per hour)
    const durationHours = circuit.estimated_duration / 60;
    const totalPrice = (durationHours * guidePricePerHour).toFixed(
      2
    );

    // Insert booking
    const res = await db
      .insert(bookings)
      .values({
        circuit_id,
        tourist_id: context.userId,
        guide_id,
        booking_date,
        estimated_duration: circuit.estimated_duration,
        status: "pending",
        total_price: totalPrice,
      })
      .returning();

    return {
      data: res[0],
      success: true,
    };
  }
);

export { getBookings, confirmBooking, rejectBooking, takeTrip };
