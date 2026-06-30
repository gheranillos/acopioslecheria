import { Plus } from "lucide-react";
import { requireUsuario } from "@/lib/auth/session";
import { getMapaData } from "@/lib/data/queries";
import { construirZonasConDetalle } from "@/lib/data/derive";
import { NecesidadesBoard, type NecesidadItem } from "@/components/necesidades/necesidades-board";
import { NecesidadFormDialog } from "@/components/necesidades/necesidad-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { RolUsuario } from "@/types";

function puedeEditarCompletoFila(
  rol: RolUsuario,
  miCentroId: string | null,
  centrosCobertura: { id: string }[],
) {
  if (rol === "operador") return true;
  if (rol === "jefe_centro") {
    return Boolean(miCentroId) && centrosCobertura.some((c) => c.id === miCentroId);
  }
  return false;
}

function puedeCambiarEstadoFila(
  rol: RolUsuario,
  miCentroId: string | null,
  centrosCobertura: { id: string }[],
) {
  if (rol === "operador" || rol === "delivery") return true;
  if (rol === "jefe_centro" || rol === "logistica") {
    return Boolean(miCentroId) && centrosCobertura.some((c) => c.id === miCentroId);
  }
  return false;
}

export default async function NecesidadesPage() {
  const { perfil } = await requireUsuario();
  const data = await getMapaData();
  const zonasConDetalle = construirZonasConDetalle(data);

  const necesidades: NecesidadItem[] = zonasConDetalle.flatMap((zona) =>
    zona.necesidades.map((n) => ({
      ...n,
      zonaNombre: zona.nombre,
      zonaCiudad: zona.ciudad,
      centrosCobertura: zona.centros,
      puedeEditarCompleto: puedeEditarCompletoFila(
        perfil.rol,
        perfil.centro_acopio_id,
        zona.centros,
      ),
      puedeCambiarEstado: puedeCambiarEstadoFila(
        perfil.rol,
        perfil.centro_acopio_id,
        zona.centros,
      ),
    })),
  );

  necesidades.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const puedeCrear = perfil.rol === "operador" || perfil.rol === "jefe_centro";

  const zonasDisponiblesParaCrear =
    perfil.rol === "operador"
      ? data.zonas
      : zonasConDetalle.filter((z) =>
          z.centros.some((c) => c.id === perfil.centro_acopio_id),
        );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Necesidades"
        description="Tablero de lo que se necesita en cada zona de refugio."
        action={
          puedeCrear && zonasDisponiblesParaCrear.length > 0 ? (
            <NecesidadFormDialog
              zonas={zonasDisponiblesParaCrear}
              trigger={
                <Button className="h-11 gap-1.5">
                  <Plus className="h-4 w-4" />
                  Nueva necesidad
                </Button>
              }
            />
          ) : undefined
        }
      />

      <NecesidadesBoard
        necesidades={necesidades}
        zonasDisponiblesParaCrear={zonasDisponiblesParaCrear}
      />
    </div>
  );
}
