"use server";

import { z } from "zod";
import { authenticatedAction } from "../server-only";
import { db } from "@/db";
import { GuideBookingsDTO } from "@/dto/bookings-dto";
import {
  bookings,
  circuits,
  users_additional_info,
} from "@/db/migrations/schema";
import { and, eq } from "drizzle-orm";

const getPendingBookings = authenticatedAction.create(
  async (context): Promise<GuideBookingsDTO[]> => {
    const pendingBookings = await db
      .select({
        status: bookings.status,
        guide_id: bookings.guide_id,
        booking_id: bookings.booking_id,
        circuit_id: bookings.circuit_id,
        created_at: bookings.created_at,
        tourist_id: bookings.tourist_id,
        booking_date: bookings.booking_date,
        start_time: bookings.start_time,
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
          eq(bookings.status, "pending")
        )
      );

    return pendingBookings;
  }
);


const getConfirmedBookings = authenticatedAction.create(
  async (context): Promise<GuideBookingsDTO[]> => {
    const pendingBookings = await db
      .select({
        status: bookings.status,
        guide_id: bookings.guide_id,
        booking_id: bookings.booking_id,
        circuit_id: bookings.circuit_id,
        created_at: bookings.created_at,
        tourist_id: bookings.tourist_id,
        booking_date: bookings.booking_date,
        start_time: bookings.start_time,
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
          eq(bookings.status, "confirmed")
        )
      );

    return pendingBookings;
  }
);


export { getPendingBookings, getConfirmedBookings}