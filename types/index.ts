import type { Database } from "./database.types";

export * from "./database.types";

export type CentroAcopio = Database["public"]["Tables"]["centros_acopio"]["Row"];
export type Deposito = Database["public"]["Tables"]["depositos"]["Row"];
export type Inventario = Database["public"]["Tables"]["inventario"]["Row"];
export type ZonaRefugio = Database["public"]["Tables"]["zonas_refugio"]["Row"];
export type CoberturaCentroZona =
  Database["public"]["Tables"]["cobertura_centro_zona"]["Row"];
export type Necesidad = Database["public"]["Tables"]["necesidades"]["Row"];
export type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];

export const CIUDADES = [
  "Lechería",
  "Barcelona",
  "Puerto La Cruz",
  "Guanta",
] as const;

export const CATEGORIAS_INVENTARIO = [
  { value: "agua", label: "Agua" },
  { value: "alimentos_no_perecederos", label: "Alimentos no perecederos" },
  { value: "medicinas", label: "Medicinas" },
  { value: "higiene", label: "Higiene" },
  { value: "ropa", label: "Ropa" },
  { value: "otros", label: "Otros" },
] as const;

export const UNIDADES_INVENTARIO = ["kg", "litros", "unidades", "cajas"] as const;

export const PRIORIDADES = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
] as const;

export const ESTADOS_NECESIDAD = [
  { value: "abierta", label: "Abierta" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cubierta", label: "Cubierta" },
] as const;

export const ESTADOS_ZONA = [
  { value: "abastecido", label: "Abastecido" },
  { value: "parcialmente_abastecido", label: "Parcialmente abastecido" },
  { value: "no_abastecido", label: "No abastecido" },
] as const;

export const ROLES_USUARIO = [
  { value: "operador", label: "Operador" },
  { value: "jefe_centro", label: "Jefe de centro de acopio" },
  { value: "logistica", label: "Encargado de logística" },
  { value: "delivery", label: "Delivery" },
] as const;

/** Centro de acopio con sus depósitos, inventario y zonas que cubre (para el panel del mapa). */
export interface CentroConDetalle extends CentroAcopio {
  depositos: (Deposito & { inventario: Inventario[] })[];
  zonas: ZonaRefugio[];
}

/** Zona de refugio con sus necesidades abiertas y los centros que la cubren (para el panel del mapa). */
export interface ZonaConDetalle extends ZonaRefugio {
  necesidades: Necesidad[];
  centros: CentroAcopio[];
}
