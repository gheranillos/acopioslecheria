import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente con service role — bypass RLS. Solo en Server Actions verificadas
 * (p. ej. operador creando usuarios). Nunca importar en componentes cliente.
 */
export function createAdminClient() {
  const env = getSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();

  if (!env || !serviceRoleKey) {
    throw new Error(
      "Admin API no configurada. Define SUPABASE_SERVICE_ROLE_KEY en el servidor.",
    );
  }

  return createClient<Database>(env.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
