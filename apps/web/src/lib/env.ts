import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

export const parseEnv = (input: NodeJS.ProcessEnv) => envSchema.parse(input);
