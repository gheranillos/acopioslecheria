"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminApiConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { requireOperador } from "@/lib/auth/session";
import { slugifyCentro } from "@/lib/utils/slug";
import type { Ciudad, RolUsuario } from "@/types";

export interface ActionState {
  error?: string;
  success?: boolean;
}

const ROLES_CON_CENTRO: RolUsuario[] = ["jefe_centro", "logistica"];

function revalidarTrasUsuariosOCentros() {
  revalidatePath("/usuarios");
  revalidatePath("/dashboard");
  revalidatePath("/mapa");
  revalidatePath("/");
}

async function slugUnico(base: string): Promise<string> {
  const supabase = await createClient();
  let slug = slugifyCentro(base) || "centro";
  let candidato = slug;

  for (let i = 2; i < 50; i++) {
    const { data } = await supabase
      .from("centros_acopio")
      .select("id")
      .eq("slug", candidato)
      .maybeSingle();

    if (!data) return candidato;
    candidato = `${slug}-${i}`;
  }

  return `${slug}-${Date.now()}`;
}

export async function actualizarPerfil(
  id: string,
  cambios: { rol?: RolUsuario; centro_acopio_id?: string | null },
) {
  await requireOperador();
  const supabase = await createClient();
  const { error } = await supabase.from("perfiles").update(cambios).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarTrasUsuariosOCentros();
}

export async function crearUsuario(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOperador();

  if (!isAdminApiConfigured()) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor. Agrégala en Vercel o .env.local.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nombreCompleto = String(formData.get("nombre_completo") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol") ?? "") as RolUsuario;
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const centroRaw = String(formData.get("centro_acopio_id") ?? "");
  const centroAcopioId = centroRaw && centroRaw !== "sin_centro" ? centroRaw : null;

  if (!email || !nombreCompleto || !password || !rol) {
    return { error: "Completa correo, nombre, contraseña y rol." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const rolesValidos: RolUsuario[] = ["operador", "jefe_centro", "logistica", "voluntario"];
  if (!rolesValidos.includes(rol)) {
    return { error: "Rol no válido." };
  }

  if (ROLES_CON_CENTRO.includes(rol) && !centroAcopioId) {
    return { error: "Jefe de centro y logística deben tener un centro de acopio asignado." };
  }

  const admin = createAdminClient();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre_completo: nombreCompleto },
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return { error: "Ya existe una cuenta con ese correo." };
    }
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "No se pudo crear el usuario en Auth." };
  }

  // El trigger handle_new_user crea el perfil; actualizamos rol y centro de inmediato.
  const { data: actualizados, error: perfilError } = await admin
    .from("perfiles")
    .update({
      nombre_completo: nombreCompleto,
      rol,
      centro_acopio_id: centroAcopioId,
      telefono,
    })
    .eq("id", userId)
    .select("id");

  if (perfilError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: perfilError.message };
  }

  if (!actualizados?.length) {
    const { error: insertError } = await admin.from("perfiles").insert({
      id: userId,
      nombre_completo: nombreCompleto,
      rol,
      centro_acopio_id: centroAcopioId,
      telefono,
    });

    if (insertError) {
      await admin.auth.admin.deleteUser(userId);
      return { error: insertError.message };
    }
  }

  revalidarTrasUsuariosOCentros();
  return { success: true };
}

export async function crearCentroAcopio(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOperador();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const ciudad = String(formData.get("ciudad") ?? "") as Ciudad;
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));

  if (!nombre || !ciudad) {
    return { error: "Nombre y ciudad son obligatorios." };
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: "Ingresa coordenadas válidas (latitud y longitud)." };
  }

  const slug = await slugUnico(nombre);
  const supabase = await createClient();

  const { error } = await supabase.from("centros_acopio").insert({
    nombre,
    slug,
    ciudad,
    descripcion,
    lat,
    lng,
    estado: "activo",
  });

  if (error) {
    return { error: error.message };
  }

  revalidarTrasUsuariosOCentros();
  return { success: true };
}
