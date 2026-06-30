import { PackageOpen } from "lucide-react";
import { requireUsuario } from "@/lib/auth/session";
import { getCentros, getDepositosConInventario } from "@/lib/data/queries";
import { puedeEditarInventario, puedeEliminarEntidades, veTodosLosCentros } from "@/lib/auth/roles";
import { InventarioBoard } from "@/components/inventario/inventario-board";
import { CrearDepositoDialog } from "@/components/inventario/crear-deposito-dialog";
import { CentroFilterSelect } from "@/components/shared/centro-filter-select";
import { PageHeader } from "@/components/shared/page-header";

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ centro?: string }>;
}) {
  const { perfil } = await requireUsuario();
  const params = await searchParams;
  const verTodo = veTodosLosCentros(perfil.rol);
  const centroId = verTodo ? params.centro : perfil.centro_acopio_id ?? undefined;

  const [centros, depositos] = await Promise.all([
    verTodo ? getCentros() : Promise.resolve([]),
    getDepositosConInventario(centroId || undefined),
  ]);

  const puedeEditar = puedeEditarInventario(perfil.rol);
  const puedeEliminar = puedeEliminarEntidades(perfil.rol);
  const puedeCrearDeposito = puedeEditar && Boolean(perfil.centro_acopio_id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Stock disponible por depósito, organizado por categoría."
        action={verTodo ? <CentroFilterSelect centros={centros} valorActual={centroId} /> : undefined}
      />

      {depositos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <PackageOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {verTodo || centroId
              ? "Todavía no hay depósitos registrados."
              : "Tu centro todavía no tiene un depósito creado."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {puedeCrearDeposito
              ? "Crea tu primer depósito para empezar a registrar el inventario."
              : "Pide al jefe de tu centro que cree el primer depósito."}
          </p>
          {puedeCrearDeposito && perfil.centro_acopio_id && (
            <CrearDepositoDialog centroAcopioId={perfil.centro_acopio_id} />
          )}
        </div>
      ) : (
        <>
          <InventarioBoard
            depositos={depositos}
            puedeEditar={puedeEditar}
            puedeEliminar={puedeEliminar}
          />
          {puedeCrearDeposito && perfil.centro_acopio_id && (
            <div className="flex justify-end">
              <CrearDepositoDialog centroAcopioId={perfil.centro_acopio_id} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
