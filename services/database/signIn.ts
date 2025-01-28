"use server";

import { signInSchema } from "@/utils/schemas";
import { authenticatedAction, publicAction } from "../server-only";
import { createClient } from "@/utils/supabase/server-client";
import { db } from "@/db";
import { users_additional_info } from "@/db/migrations/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const signIn = publicAction.create(
  signInSchema,
  async ({ email, password }, _) => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if(data.user){
      const role = await getRole();
      console.log("User role: ", role);
    }

    if (error) {
      throw new Error(error.message);
    }
  }
);

const signOut = publicAction.create(async ({}) => {
  const supabase = await createClient();
  await supabase.auth.signOut();
});

const getRole = authenticatedAction.create(
  async (context) => {
    const role = await db
      .select({ role: users_additional_info.role })
      .from(users_additional_info)
      .where(eq(users_additional_info.id, context.userId))
      .then(res => res[0])
    
    return role;
  }
);

export { signIn, signOut, getRole };
