import { requireUsuario } from "@/lib/auth/session";
import { getMapaData } from "@/lib/data/queries";
import {
  construirCentrosConDetalle,
  construirZonasConDetalle,
} from "@/lib/data/derive";
import { puedeEditarEstadoZona } from "@/lib/auth/roles";
import { MapShell } from "@/components/map/map-shell";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ centro?: string }>;
}) {
  const { perfil } = await requireUsuario();
  const [data, params] = await Promise.all([getMapaData(), searchParams]);

  const centros = construirCentrosConDetalle(data);
  const zonas = construirZonasConDetalle(data);

  return (
    <MapShell
      centros={centros}
      zonas={zonas}
      perfiles={data.perfiles}
      centroInicialId={params.centro}
      puedeEditarEstadoZona={puedeEditarEstadoZona(perfil.rol)}
      esOperador={perfil.rol === "operador"}
      centroAcopioId={perfil.centro_acopio_id}
    />
  );
}
