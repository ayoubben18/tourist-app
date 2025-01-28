"use server";

import { signInSchema } from "@/utils/schemas";
import { publicAction } from "../server-only";
import { createClient } from "@/utils/supabase/server-client";

const signIn = publicAction.create(
  signInSchema,
  async ({ email, password }, _) => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
);

const signOut = publicAction.create(async ({}) => {
  const supabase = await createClient();
  await supabase.auth.signOut();
});

export { signIn, signOut };
