import { requireUsuario } from "@/lib/auth/session";
import { getMapaData } from "@/lib/data/queries";
import {
  construirCentrosConDetalle,
  construirZonasConDetalle,
} from "@/lib/data/derive";
import { MapShell } from "@/components/map/map-shell";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ centro?: string }>;
}) {
  await requireUsuario();
  const [data, params] = await Promise.all([getMapaData(), searchParams]);

  const centros = construirCentrosConDetalle(data);
  const zonas = construirZonasConDetalle(data);

  return (
    <MapShell
      centros={centros}
      zonas={zonas}
      perfiles={data.perfiles}
      centroInicialId={params.centro}
    />
  );
}
