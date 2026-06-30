"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/session";
import type { CategoriaInventario, UnidadInventario } from "@/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function revalidarVistasAfectadas() {
  revalidatePath("/inventario");
  revalidatePath("/mapa");
  revalidatePath("/dashboard");
}

export async function crearDeposito(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUsuario();

  const centro_acopio_id = String(formData.get("centro_acopio_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();

  if (!centro_acopio_id || !nombre) {
    return { error: "El nombre del depósito es obligatorio." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("depositos").insert({
    centro_acopio_id,
    nombre,
    ubicacion: ubicacion || null,
  });

  if (error) return { error: error.message };

  revalidarVistasAfectadas();
  return { success: true };
}

export async function guardarItemInventario(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await requireUsuario();

  const id = String(formData.get("id") ?? "");
  const deposito_id = String(formData.get("deposito_id") ?? "");
  const categoria = String(formData.get("categoria") ?? "") as CategoriaInventario;
  const item = String(formData.get("item") ?? "").trim();
  const cantidad = Number(formData.get("cantidad"));
  const unidad = String(formData.get("unidad") ?? "") as UnidadInventario;

  if (!deposito_id || !categoria || !item || !unidad) {
    return { error: "Completa todos los campos." };
  }

  if (Number.isNaN(cantidad) || cantidad < 0) {
    return { error: "La cantidad debe ser un número mayor o igual a 0." };
  }

  const supabase = await createClient();
  const payload = {
    deposito_id,
    categoria,
    item,
    cantidad,
    unidad,
    updated_by: user.id,
  };

  const { error } = id
    ? await supabase.from("inventario").update(payload).eq("id", id)
    : await supabase.from("inventario").insert(payload);

  if (error) return { error: error.message };

  revalidarVistasAfectadas();
  return { success: true };
}

export async function eliminarItemInventario(id: string) {
  await requireUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("inventario").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarVistasAfectadas();
}
