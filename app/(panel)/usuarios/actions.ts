"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/session";
import type { RolUsuario } from "@/types";

export async function actualizarPerfil(
  id: string,
  cambios: { rol?: RolUsuario; centro_acopio_id?: string | null },
) {
  await requireUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("perfiles").update(cambios).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/usuarios");
  revalidatePath("/dashboard");
}
