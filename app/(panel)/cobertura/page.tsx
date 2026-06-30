import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { getCentros, getCobertura, getZonas } from "@/lib/data/queries";
import { puedeGestionarCobertura } from "@/lib/auth/roles";
import { CoberturaManager } from "@/components/cobertura/cobertura-manager";
import { CrearZonaDialog } from "@/components/cobertura/crear-zona-dialog";
import { PageHeader } from "@/components/shared/page-header";

export default async function CoberturaPage() {
  const { perfil } = await requireUsuario();
  if (!puedeGestionarCobertura(perfil.rol)) redirect("/dashboard");

  const [centrosTodos, zonas, cobertura] = await Promise.all([
    getCentros(),
    getZonas(),
    getCobertura(),
  ]);

  const centros =
    perfil.rol === "operador"
      ? centrosTodos
      : centrosTodos.filter((c) => c.id === perfil.centro_acopio_id);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Cobertura</h1>
          <p className="text-sm text-muted-foreground">
            Qué zonas de refugio cubre cada centro de acopio.
          </p>
        </div>
        <CrearZonaDialog
          centros={centrosTodos}
          centroFijoId={
            perfil.rol === "jefe_centro" ? perfil.centro_acopio_id ?? undefined : undefined
          }
        />
      </div>

      {centros.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No tienes un centro de acopio asignado todavía. Pide al operador que te lo
          asigne.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {centros.map((centro) => {
            const zonaIdsCubiertas = new Set(
              cobertura
                .filter((c) => c.centro_acopio_id === centro.id)
                .map((c) => c.zona_refugio_id),
            );
            const zonasCubiertas = zonas.filter((z) => zonaIdsCubiertas.has(z.id));
            const zonasDisponibles = zonas.filter((z) => !zonaIdsCubiertas.has(z.id));

            return (
              <CoberturaManager
                key={centro.id}
                centro={centro}
                zonasCubiertas={zonasCubiertas}
                zonasDisponibles={zonasDisponibles}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
