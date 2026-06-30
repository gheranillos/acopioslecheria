"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth/session";
import type { Ciudad } from "@/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

function revalidarVistasAfectadas() {
  revalidatePath("/cobertura");
  revalidatePath("/mapa");
  revalidatePath("/dashboard");
  revalidatePath("/necesidades");
}

export async function agregarCobertura(centroAcopioId: string, zonaRefugioId: string) {
  await requireUsuario();
  const supabase = await createClient();
  const { error } = await supabase.from("cobertura_centro_zona").insert({
    centro_acopio_id: centroAcopioId,
    zona_refugio_id: zonaRefugioId,
  });
  if (error) throw new Error(error.message);
  revalidarVistasAfectadas();
}

export async function quitarCobertura(centroAcopioId: string, zonaRefugioId: string) {
  await requireUsuario();
  const supabase = await createClient();
  const { error } = await supabase
    .from("cobertura_centro_zona")
    .delete()
    .eq("centro_acopio_id", centroAcopioId)
    .eq("zona_refugio_id", zonaRefugioId);
  if (error) throw new Error(error.message);
  revalidarVistasAfectadas();
}

export async function crearZona(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUsuario();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const ciudad = String(formData.get("ciudad") ?? "") as Ciudad;
  const encargado_nombre = String(formData.get("encargado_nombre") ?? "").trim();
  const encargado_contacto = String(formData.get("encargado_contacto") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const vincularCentroId = String(formData.get("vincular_centro_id") ?? "");

  if (!nombre || !ciudad) {
    return { error: "El nombre y la ciudad son obligatorios." };
  }
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: "Ingresa coordenadas válidas (latitud y longitud)." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zonas_refugio")
    .insert({
      nombre,
      ciudad,
      encargado_nombre: encargado_nombre || null,
      encargado_contacto: encargado_contacto || null,
      lat,
      lng,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (vincularCentroId && data) {
    const { error: coberturaError } = await supabase
      .from("cobertura_centro_zona")
      .insert({ centro_acopio_id: vincularCentroId, zona_refugio_id: data.id });
    if (coberturaError) return { error: coberturaError.message };
  }

  revalidarVistasAfectadas();
  return { success: true };
}
