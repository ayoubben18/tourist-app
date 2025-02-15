import "server-only";
import { createSafeAction } from "next-safe-fetch";
import { createClient } from "@/utils/supabase/server-client";

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
      user_metadata: user.user_metadata
    };
  });
  
  export const publicAction = createSafeAction.setMiddleware(async () => {
    return {
      success: true,
    };
  });