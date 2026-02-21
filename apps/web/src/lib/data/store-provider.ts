import { createSupabaseServerClient } from "@/lib/supabase/server";

import { collabStore, type CollabStore } from "./collab-store";
import { createSupabaseCollabStore } from "./supabase-collab-store";

function hasSupabaseRuntimeEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

type InMemoryStoreDecisionInput = {
  nodeEnv: string | undefined;
  hasSupabaseEnv: boolean;
};

export function shouldUseInMemoryStore({
  nodeEnv,
  hasSupabaseEnv,
}: InMemoryStoreDecisionInput) {
  if (hasSupabaseEnv) return false;
  return nodeEnv !== "production";
}

export async function getRuntimeCollabStore(): Promise<CollabStore> {
  const hasSupabaseEnv = hasSupabaseRuntimeEnv();
  if (
    shouldUseInMemoryStore({
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseEnv,
    })
  ) {
    return collabStore;
  }

  if (!hasSupabaseEnv) {
    throw new Error("SUPABASE_RUNTIME_ENV_MISSING");
  }

  const client = await createSupabaseServerClient();
  return createSupabaseCollabStore(client);
}
