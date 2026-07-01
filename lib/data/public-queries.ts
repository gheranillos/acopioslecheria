import { createPublicClient } from "@/lib/supabase/public-server";
import type { CentroAcopio, Necesidad, Prioridad, ZonaRefugio } from "@/types";

export interface NecesidadPublica extends Necesidad {
  zona: Pick<ZonaRefugio, "nombre" | "ciudad">;
}

export interface DonanteData {
  centros: CentroAcopio[];
  zonas: ZonaRefugio[];
  necesidades: NecesidadPublica[];
}

const ORDEN_PRIORIDAD: Record<Prioridad, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

/** Dataset de solo lectura para el home público (rol donante). */
export async function getDonanteData(): Promise<DonanteData | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const [centrosRes, zonasRes, necesidadesRes] = await Promise.all([
    supabase
      .from("centros_acopio")
      .select("*")
      .eq("estado", "activo")
      .order("nombre"),
    supabase.from("zonas_refugio").select("*").order("nombre"),
    supabase
      .from("necesidades")
      .select("*")
      .in("estado", ["abierta", "en_proceso"])
      .order("created_at", { ascending: false }),
  ]);

  if (centrosRes.error) throw centrosRes.error;
  if (zonasRes.error) throw zonasRes.error;
  if (necesidadesRes.error) throw necesidadesRes.error;

  const zonas = zonasRes.data ?? [];
  const zonasPorId = new Map(zonas.map((z) => [z.id, z]));

  const necesidades = (necesidadesRes.data ?? [])
    .map((n) => {
      const zona = zonasPorId.get(n.zona_refugio_id);
      if (!zona) return null;
      return {
        ...n,
        zona: { nombre: zona.nombre, ciudad: zona.ciudad },
      };
    })
    .filter((n): n is NecesidadPublica => n !== null)
    .sort((a, b) => {
      const diff = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
      if (diff !== 0) return diff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return {
    centros: centrosRes.data ?? [],
    zonas,
    necesidades,
  };
}
