import type { SupabaseClient } from "@supabase/supabase-js";
import type { EstadoNecesidad, EstadoZona } from "@/types";
import type { Database } from "@/types/database.types";

/** Deriva el estado de abastecimiento de una zona según sus necesidades. */
export function derivarEstadoZona(
  necesidades: ReadonlyArray<{ estado: EstadoNecesidad }>,
): EstadoZona {
  if (necesidades.length === 0) return "abastecido";

  const pendientes = necesidades.filter(
    (n) => n.estado === "abierta" || n.estado === "en_proceso",
  );
  if (pendientes.length === 0) return "abastecido";

  const tieneCubiertas = necesidades.some((n) => n.estado === "cubierta");
  if (tieneCubiertas) return "parcialmente_abastecido";

  return "no_abastecido";
}

/** Recalcula y persiste el estado de una zona (respaldo si no está el trigger SQL). */
export async function sincronizarEstadoZona(
  supabase: SupabaseClient<Database>,
  zonaRefugioId: string,
  updatedBy?: string,
) {
  const { data: necesidades, error: readError } = await supabase
    .from("necesidades")
    .select("estado")
    .eq("zona_refugio_id", zonaRefugioId);

  if (readError) throw new Error(readError.message);

  const estado = derivarEstadoZona(necesidades ?? []);
  const { error: updateError } = await supabase
    .from("zonas_refugio")
    .update({
      estado,
      ...(updatedBy ? { updated_by: updatedBy } : {}),
    })
    .eq("id", zonaRefugioId);

  if (updateError) throw new Error(updateError.message);
}
