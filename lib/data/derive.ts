import type { MapaData } from "./queries";
import type { CentroConDetalle, ZonaConDetalle } from "@/types";

/** Reconstruye centros con sus depósitos+inventario y zonas cubiertas a partir del dataset plano. */
export function construirCentrosConDetalle(data: MapaData): CentroConDetalle[] {
  return data.centros.map((centro) => {
    const depositos = data.depositos
      .filter((d) => d.centro_acopio_id === centro.id)
      .map((d) => ({
        ...d,
        inventario: data.inventario.filter((i) => i.deposito_id === d.id),
      }));

    const zonaIds = new Set(
      data.cobertura
        .filter((c) => c.centro_acopio_id === centro.id)
        .map((c) => c.zona_refugio_id),
    );

    const zonas = data.zonas.filter((z) => zonaIds.has(z.id));

    return { ...centro, depositos, zonas };
  });
}

/** Reconstruye zonas con sus necesidades y los centros que las cubren. */
export function construirZonasConDetalle(data: MapaData): ZonaConDetalle[] {
  return data.zonas.map((zona) => {
    const necesidades = data.necesidades.filter(
      (n) => n.zona_refugio_id === zona.id,
    );

    const centroIds = new Set(
      data.cobertura
        .filter((c) => c.zona_refugio_id === zona.id)
        .map((c) => c.centro_acopio_id),
    );

    const centros = data.centros.filter((c) => centroIds.has(c.id));

    return { ...zona, necesidades, centros };
  });
}
