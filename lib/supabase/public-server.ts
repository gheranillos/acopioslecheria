import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase sin sesión (rol `anon` en RLS).
 * Usar solo en Server Components del home público de donantes.
 */
export function createPublicClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  return createClient<Database>(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
