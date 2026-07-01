import { createPublicClient } from "@/lib/supabase/public-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CentroAcopio, Necesidad, Prioridad, ZonaRefugio } from "@/types";
import type { Database } from "@/types/database.types";

export interface NecesidadPublica extends Necesidad {
  zona: Pick<ZonaRefugio, "nombre" | "ciudad">;
}

export interface DonanteData {
  centros: CentroAcopio[];
  zonas: ZonaRefugio[];
  necesidades: NecesidadPublica[];
}

export interface DonanteFetchMeta {
  /** true si todas las listas vinieron vacías (p. ej. falta migración SQL en Supabase) */
  posibleConfigPendiente: boolean;
  /** Error al llamar RPC o consultas directas */
  errorConsulta?: string;
}

const ORDEN_PRIORIDAD: Record<Prioridad, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

function vacio(): DonanteData {
  return { centros: [], zonas: [], necesidades: [] };
}

function parseDonantePayload(raw: unknown): DonanteData {
  if (!raw || typeof raw !== "object") return vacio();
  const o = raw as Record<string, unknown>;
  return {
    centros: (Array.isArray(o.centros) ? o.centros : []) as CentroAcopio[],
    zonas: (Array.isArray(o.zonas) ? o.zonas : []) as ZonaRefugio[],
    necesidades: (Array.isArray(o.necesidades) ? o.necesidades : []) as NecesidadPublica[],
  };
}

async function getDonanteDataDirect(
  supabase: SupabaseClient<Database>,
): Promise<DonanteData> {
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

/** Dataset de solo lectura para el home público (rol donante). */
export async function getDonanteData(): Promise<{
  data: DonanteData | null;
  meta: DonanteFetchMeta;
}> {
  const supabase = createPublicClient();
  if (!supabase) {
    return { data: null, meta: { posibleConfigPendiente: false } };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("obtener_datos_donante");

  if (!rpcError && rpcData) {
    const parsed = parseDonantePayload(rpcData);
    const todoVacio =
      parsed.centros.length === 0 &&
      parsed.zonas.length === 0 &&
      parsed.necesidades.length === 0;
    return {
      data: parsed,
      meta: { posibleConfigPendiente: todoVacio },
    };
  }

  try {
    const direct = await getDonanteDataDirect(supabase);
    const todoVacio =
      direct.centros.length === 0 &&
      direct.zonas.length === 0 &&
      direct.necesidades.length === 0;
    return {
      data: direct,
      meta: {
        posibleConfigPendiente: todoVacio,
        errorConsulta: rpcError?.message,
      },
    };
  } catch (err) {
    return {
      data: vacio(),
      meta: {
        posibleConfigPendiente: true,
        errorConsulta:
          err instanceof Error ? err.message : rpcError?.message ?? "Error desconocido",
      },
    };
  }
}
