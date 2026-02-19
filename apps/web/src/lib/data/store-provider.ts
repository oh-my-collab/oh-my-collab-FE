import { createSupabaseServerClient } from "@/lib/supabase/server";

import { collabStore, type CollabStore } from "./collab-store";
import { createSupabaseCollabStore } from "./supabase-collab-store";

function hasSupabaseRuntimeEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getRuntimeCollabStore(): Promise<CollabStore> {
  if (!hasSupabaseRuntimeEnv()) {
    return collabStore;
  }

  const client = await createSupabaseServerClient();
  return createSupabaseCollabStore(client);
}
