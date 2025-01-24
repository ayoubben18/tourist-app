import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    SUPABASE_URL: z.string().min(1),
    SUPABASE_ANON_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    NEO4J_PASSWORD: z.string().min(1),
    NEO4J_USERNAME: z.string().min(1),
    NEO4J_HOST: z.string().min(1),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  // runtimeEnv: {
  //   DATABASE_URL: process.env.DATABASE_URL,
  //   OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
  // },
  // For Next.js >= 13.4.4, you can just reference process.env:
  experimental__runtimeEnv: process.env,
});
