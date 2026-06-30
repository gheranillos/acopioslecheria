import { createClient } from "@/lib/supabase/server";
import type {
  CentroAcopio,
  CoberturaCentroZona,
  Deposito,
  Inventario,
  Necesidad,
  Perfil,
  ZonaRefugio,
} from "@/types";

export interface MapaData {
  centros: CentroAcopio[];
  zonas: ZonaRefugio[];
  depositos: Deposito[];
  inventario: Inventario[];
  cobertura: CoberturaCentroZona[];
  necesidades: Necesidad[];
  perfiles: Perfil[];
}

/**
 * Trae todo el dataset operativo en un solo round-trip (en paralelo).
 * Pensado para conexiones inestables: una vez cargado, el mapa y los paneles
 * interactúan sobre los datos ya en memoria sin hacer fetch por cada click.
 */
export async function getMapaData(): Promise<MapaData> {
  const supabase = await createClient();

  const [
    centrosRes,
    zonasRes,
    depositosRes,
    inventarioRes,
    coberturaRes,
    necesidadesRes,
    perfilesRes,
  ] = await Promise.all([
    supabase.from("centros_acopio").select("*").order("nombre"),
    supabase.from("zonas_refugio").select("*").order("nombre"),
    supabase.from("depositos").select("*").order("nombre"),
    supabase.from("inventario").select("*"),
    supabase.from("cobertura_centro_zona").select("*"),
    supabase.from("necesidades").select("*").order("created_at", { ascending: false }),
    supabase.from("perfiles").select("*"),
  ]);

  for (const res of [
    centrosRes,
    zonasRes,
    depositosRes,
    inventarioRes,
    coberturaRes,
    necesidadesRes,
    perfilesRes,
  ]) {
    if (res.error) throw res.error;
  }

  return {
    centros: centrosRes.data ?? [],
    zonas: zonasRes.data ?? [],
    depositos: depositosRes.data ?? [],
    inventario: inventarioRes.data ?? [],
    cobertura: coberturaRes.data ?? [],
    necesidades: necesidadesRes.data ?? [],
    perfiles: perfilesRes.data ?? [],
  };
}

export type DepositoConInventario = Deposito & { inventario: Inventario[] };

/** Depósitos con su inventario embebido. Si se pasa centroId, filtra por ese centro. */
export async function getDepositosConInventario(
  centroId?: string,
): Promise<DepositoConInventario[]> {
  const supabase = await createClient();
  let query = supabase
    .from("depositos")
    .select("*, inventario(*)")
    .order("nombre");

  if (centroId) {
    query = query.eq("centro_acopio_id", centroId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as DepositoConInventario[];
}

export type NecesidadConZona = Necesidad & {
  zona: Pick<ZonaRefugio, "id" | "nombre" | "ciudad"> | null;
};

export async function getNecesidadesConZona(): Promise<NecesidadConZona[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("necesidades")
    .select("*, zona:zonas_refugio(id, nombre, ciudad)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as NecesidadConZona[];
}

export async function getCentros(): Promise<CentroAcopio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("centros_acopio")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return data ?? [];
}

export async function getZonas(): Promise<ZonaRefugio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zonas_refugio")
    .select("*")
    .order("nombre");
  if (error) throw error;
  return data ?? [];
}

export async function getCobertura(): Promise<CoberturaCentroZona[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cobertura_centro_zona").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getPerfiles(): Promise<Perfil[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .order("nombre_completo");
  if (error) throw error;
  return data ?? [];
}
