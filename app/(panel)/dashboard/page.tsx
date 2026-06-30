import Link from "next/link";
import { AlertTriangle, Boxes, ClipboardList, MapPin } from "lucide-react";
import { requireUsuario } from "@/lib/auth/session";
import { getMapaData } from "@/lib/data/queries";
import {
  construirCentrosConDetalle,
  construirZonasConDetalle,
} from "@/lib/data/derive";
import { ETIQUETA_ROL, veTodosLosCentros } from "@/lib/auth/roles";
import { StatCard } from "@/components/dashboard/stat-card";
import { CentroSummaryCard } from "@/components/dashboard/centro-summary-card";
import { PrioridadBadge } from "@/components/shared/badges";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const { perfil } = await requireUsuario();
  const data = await getMapaData();
  const centros = construirCentrosConDetalle(data);
  const zonas = construirZonasConDetalle(data);

  const verTodo = veTodosLosCentros(perfil.rol);

  const centrosVisibles = verTodo
    ? centros
    : centros.filter((c) => c.id === perfil.centro_acopio_id);

  const zonasVisibles = verTodo
    ? zonas
    : zonas.filter((z) => z.centros.some((c) => c.id === perfil.centro_acopio_id));

  const necesidadesAbiertas = zonasVisibles.flatMap((z) =>
    z.necesidades
      .filter((n) => n.estado !== "cubierta")
      .map((n) => ({ ...n, zonaNombre: z.nombre })),
  );

  const totalItems = centrosVisibles.reduce(
    (acc, c) => acc + c.depositos.reduce((a, d) => a + d.inventario.length, 0),
    0,
  );

  const necesidadesAltaPrioridad = necesidadesAbiertas
    .filter((n) => n.prioridad === "alta")
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <div className="space-y-8">
      <header className="border-b border-border/60 pb-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Panel operativo
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Hola, {perfil.nombre_completo.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          {ETIQUETA_ROL[perfil.rol]}
          {verTodo
            ? " · viendo todos los centros"
            : centrosVisibles[0]
              ? ` · ${centrosVisibles[0].nombre}`
              : " · sin centro asignado"}
        </p>
      </header>

      {!verTodo && centrosVisibles.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 pt-6 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Tu usuario todavía no tiene un centro de acopio asignado. Pide al
            operador que te lo asigne desde la gestión de usuarios.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={MapPin}
          label={verTodo ? "Centros activos" : "Tu centro"}
          value={verTodo ? centrosVisibles.length : centrosVisibles.length}
        />
        <StatCard
          icon={MapPin}
          label="Zonas cubiertas"
          value={zonasVisibles.length}
        />
        <StatCard
          icon={ClipboardList}
          label="Necesidades abiertas"
          value={necesidadesAbiertas.length}
          tone={necesidadesAbiertas.length > 0 ? "warning" : "default"}
        />
        <StatCard
          icon={Boxes}
          label="Items en inventario"
          value={totalItems}
        />
      </div>

      {necesidadesAltaPrioridad.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Necesidades de alta prioridad
          </h2>
            <Link
              href="/necesidades"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {necesidadesAltaPrioridad.slice(0, 6).map((n) => (
              <Card key={n.id} className="border-red-200">
                <CardContent className="space-y-2 pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{n.item}</p>
                    <PrioridadBadge prioridad={n.prioridad} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {n.cantidad_requerida} requeridas · {n.zonaNombre}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {verTodo ? "Centros de acopio" : "Tu centro de acopio"}
        </h2>
        {centrosVisibles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No hay centros en la base de datos.</p>
              {verTodo ? (
                <p>
                  Los centros semilla (Puerto Príncipe, Playa Mansa, Forum, Gestión Social)
                  están en <code className="text-xs">supabase/seed.sql</code>. Ejecuta ese
                  archivo en Supabase → SQL Editor y recarga esta página.
                </p>
              ) : (
                <p>
                  Pide al operador que te asigne un centro desde Usuarios, o que ejecute el
                  seed inicial en Supabase.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {centrosVisibles.map((centro) => (
              <CentroSummaryCard key={centro.id} centro={centro} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
