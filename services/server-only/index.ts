import "server-only";
import { createSafeAction } from "next-safe-fetch";
import { createClient } from "@/utils/supabase/server-client";
import { inspect } from "util";

export const authenticatedAction = createSafeAction.setMiddleware(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    userId: user.id,
    email: user.email,
  };
});

export const publicAction = createSafeAction.setMiddleware(async () => {
  return {
    success: true,
  };
});

export const consoleLogger = (data: any) => {
  console.log(
    inspect(data, { depth: Infinity, colors: true, numericSeparator: true })
  );
};
