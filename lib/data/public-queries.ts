import { createPublicClient } from "@/lib/supabase/public-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CentroAcopio,
  CoberturaCentroZona,
  Necesidad,
  Prioridad,
  ZonaRefugio,
} from "@/types";
import type { Database } from "@/types/database.types";

export interface CentroNecesidadesDonante {
  centro: Pick<CentroAcopio, "id" | "nombre" | "ciudad">;
  necesidades: Necesidad[];
}

export interface DonanteData {
  centros: CentroAcopio[];
  zonas: ZonaRefugio[];
  necesidadesPorCentro: CentroNecesidadesDonante[];
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

function ordenarNecesidades(necesidades: Necesidad[]): Necesidad[] {
  return [...necesidades].sort((a, b) => {
    const diff = ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad];
    if (diff !== 0) return diff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function vacio(): DonanteData {
  return { centros: [], zonas: [], necesidadesPorCentro: [] };
}

function parseNecesidadesPorCentro(raw: unknown): CentroNecesidadesDonante[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const centro = o.centro;
      const necesidades = o.necesidades;
      if (!centro || typeof centro !== "object" || !Array.isArray(necesidades)) return null;
      const c = centro as Record<string, unknown>;
      if (typeof c.id !== "string" || typeof c.nombre !== "string" || typeof c.ciudad !== "string") {
        return null;
      }
      return {
        centro: { id: c.id, nombre: c.nombre, ciudad: c.ciudad },
        necesidades: necesidades as Necesidad[],
      };
    })
    .filter((g): g is CentroNecesidadesDonante => g !== null && g.necesidades.length > 0);
}

function parseDonantePayload(raw: unknown): DonanteData {
  if (!raw || typeof raw !== "object") return vacio();
  const o = raw as Record<string, unknown>;
  return {
    centros: (Array.isArray(o.centros) ? o.centros : []) as CentroAcopio[],
    zonas: (Array.isArray(o.zonas) ? o.zonas : []) as ZonaRefugio[],
    necesidadesPorCentro: parseNecesidadesPorCentro(o.necesidades_por_centro),
  };
}

function buildNecesidadesPorCentro(
  centros: CentroAcopio[],
  cobertura: CoberturaCentroZona[],
  necesidades: Necesidad[],
): CentroNecesidadesDonante[] {
  const zonasPorCentro = new Map<string, Set<string>>();
  for (const row of cobertura) {
    const zonas = zonasPorCentro.get(row.centro_acopio_id) ?? new Set<string>();
    zonas.add(row.zona_refugio_id);
    zonasPorCentro.set(row.centro_acopio_id, zonas);
  }

  return centros
    .map((centro) => {
      const zonaIds = zonasPorCentro.get(centro.id);
      if (!zonaIds || zonaIds.size === 0) return null;
      const items = ordenarNecesidades(
        necesidades.filter((n) => zonaIds.has(n.zona_refugio_id)),
      );
      if (items.length === 0) return null;
      return {
        centro: { id: centro.id, nombre: centro.nombre, ciudad: centro.ciudad },
        necesidades: items,
      };
    })
    .filter((g): g is CentroNecesidadesDonante => g !== null);
}

async function getDonanteDataDirect(
  supabase: SupabaseClient<Database>,
): Promise<DonanteData> {
  const [centrosRes, zonasRes, coberturaRes, necesidadesRes] = await Promise.all([
    supabase
      .from("centros_acopio")
      .select("*")
      .eq("estado", "activo")
      .order("nombre"),
    supabase.from("zonas_refugio").select("*").order("nombre"),
    supabase.from("cobertura_centro_zona").select("*"),
    supabase
      .from("necesidades")
      .select("*")
      .in("estado", ["abierta", "en_proceso"])
      .order("created_at", { ascending: false }),
  ]);

  if (centrosRes.error) throw centrosRes.error;
  if (zonasRes.error) throw zonasRes.error;
  if (coberturaRes.error) throw coberturaRes.error;
  if (necesidadesRes.error) throw necesidadesRes.error;

  const centros = centrosRes.data ?? [];
  const necesidadesPorCentro = buildNecesidadesPorCentro(
    centros,
    coberturaRes.data ?? [],
    necesidadesRes.data ?? [],
  );

  return {
    centros,
    zonas: zonasRes.data ?? [],
    necesidadesPorCentro,
  };
}

/** Total de necesidades visibles para donantes (puede repetirse si varios centros cubren la misma zona). */
export function countNecesidadesDonante(data: DonanteData): number {
  return data.necesidadesPorCentro.reduce((sum, g) => sum + g.necesidades.length, 0);
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
      parsed.necesidadesPorCentro.length === 0;
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
      direct.necesidadesPorCentro.length === 0;
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
