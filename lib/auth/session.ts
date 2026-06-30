import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/types";
import type { User } from "@supabase/supabase-js";

export interface UsuarioActual {
  user: User;
  perfil: Perfil;
}

/** Devuelve el usuario autenticado y su perfil, o null si no hay sesión. */
export async function getUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!perfil) return null;

  return { user, perfil };
}

/** Igual que getUsuarioActual, pero redirige a /login si no hay sesión válida. */
export async function requireUsuario(): Promise<UsuarioActual> {
  const actual = await getUsuarioActual();
  if (!actual) redirect("/login");
  return actual;
}
