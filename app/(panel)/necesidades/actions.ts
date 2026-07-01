"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/session";
import { sincronizarEstadoZona } from "@/lib/data/zona-estado";
import type { EstadoNecesidad, Prioridad } from "@/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function revalidarVistasAfectadas() {
  revalidatePath("/necesidades");
  revalidatePath("/mapa");
  revalidatePath("/dashboard");
  revalidatePath("/cobertura");
  revalidatePath("/");
}

export async function guardarNecesidad(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await requireUsuario();

  const id = String(formData.get("id") ?? "");
  const zona_refugio_id = String(formData.get("zona_refugio_id") ?? "");
  const item = String(formData.get("item") ?? "").trim();
  const cantidad_requerida = Number(formData.get("cantidad_requerida"));
  const prioridad = String(formData.get("prioridad") ?? "") as Prioridad;
  const estado = String(formData.get("estado") ?? "abierta") as EstadoNecesidad;

  if (!zona_refugio_id || !item || !prioridad) {
    return { error: "Completa todos los campos." };
  }

  if (Number.isNaN(cantidad_requerida) || cantidad_requerida <= 0) {
    return { error: "La cantidad requerida debe ser mayor a 0." };
  }

  const supabase = await createClient();

  let zonaAnterior: string | null = null;
  if (id) {
    const { data: anterior } = await supabase
      .from("necesidades")
      .select("zona_refugio_id")
      .eq("id", id)
      .single();
    zonaAnterior = anterior?.zona_refugio_id ?? null;
  }

  const { error } = id
    ? await supabase
        .from("necesidades")
        .update({ zona_refugio_id, item, cantidad_requerida, prioridad, estado })
        .eq("id", id)
    : await supabase.from("necesidades").insert({
        zona_refugio_id,
        item,
        cantidad_requerida,
        prioridad,
        estado,
        created_by: user.id,
      });

  if (error) return { error: error.message };

  await sincronizarEstadoZona(supabase, zona_refugio_id, user.id);
  if (zonaAnterior && zonaAnterior !== zona_refugio_id) {
    await sincronizarEstadoZona(supabase, zonaAnterior, user.id);
  }

  revalidarVistasAfectadas();
  return { success: true };
}

export async function actualizarEstadoNecesidad(id: string, estado: EstadoNecesidad) {
  const { user } = await requireUsuario();
  const supabase = await createClient();

  const { data: necesidad, error: readError } = await supabase
    .from("necesidades")
    .select("zona_refugio_id")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);

  const { error } = await supabase.from("necesidades").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);

  await sincronizarEstadoZona(supabase, necesidad.zona_refugio_id, user.id);
  revalidarVistasAfectadas();
}

export async function eliminarNecesidad(id: string) {
  const { user } = await requireUsuario();
  const supabase = await createClient();

  const { data: necesidad, error: readError } = await supabase
    .from("necesidades")
    .select("zona_refugio_id")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);

  const { error } = await supabase.from("necesidades").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await sincronizarEstadoZona(supabase, necesidad.zona_refugio_id, user.id);
  revalidarVistasAfectadas();
}
