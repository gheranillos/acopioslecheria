import Link from "next/link";
import { MapPin, Phone, User } from "lucide-react";
import {
  DatoDesactualizadoBadge,
  EstadoNecesidadBadge,
  EstadoZonaBadge,
  PrioridadBadge,
} from "@/components/shared/badges";
import { EstadoZonaQuickSelect } from "@/components/cobertura/estado-zona-quick-select";
import { esDatoDesactualizado, tiempoRelativo } from "@/lib/utils/relative-time";
import type { Perfil, ZonaConDetalle } from "@/types";

export function ZonaPanel({
  zona,
  perfiles,
  puedeEditarEstado = false,
}: {
  zona: ZonaConDetalle;
  perfiles: Perfil[];
  puedeEditarEstado?: boolean;
}) {
  const actualizadoPor = perfiles.find((p) => p.id === zona.updated_by);
  const desactualizado = esDatoDesactualizado(zona.updated_at);
  const necesidadesAbiertas = zona.necesidades.filter((n) => n.estado !== "cubierta");

  return (
    <div className="space-y-5 p-5 pt-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Zona de refugio
        </p>
        <h2 className="text-lg font-semibold">{zona.nombre}</h2>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {zona.ciudad}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {puedeEditarEstado ? (
          <EstadoZonaQuickSelect zonaId={zona.id} estadoInicial={zona.estado} />
        ) : (
          <EstadoZonaBadge estado={zona.estado} />
        )}
        {desactualizado && <DatoDesactualizadoBadge />}
      </div>

      <div className="space-y-1.5 rounded-lg border p-3 text-sm">
        {zona.encargado_nombre && (
          <p className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {zona.encargado_nombre}
          </p>
        )}
        {zona.encargado_contacto && (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {zona.encargado_contacto}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Actualizado {tiempoRelativo(zona.updated_at)}
          {actualizadoPor ? ` por ${actualizadoPor.nombre_completo}` : ""}
        </p>
      </div>

      {zona.centros.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Cubierta por</h3>
          <div className="flex flex-wrap gap-2">
            {zona.centros.map((c) => (
              <span
                key={c.id}
                className="rounded-full border bg-muted px-2.5 py-1 text-xs font-medium"
              >
                {c.nombre}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Necesidades abiertas
          {necesidadesAbiertas.length > 0 && ` (${necesidadesAbiertas.length})`}
        </h3>
        {necesidadesAbiertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay necesidades abiertas registradas para esta zona.
          </p>
        ) : (
          <ul className="space-y-2">
            {necesidadesAbiertas.map((n) => (
              <li key={n.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.item}</p>
                  <PrioridadBadge prioridad={n.prioridad} />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {n.cantidad_requerida} requeridas
                  </p>
                  <EstadoNecesidadBadge estado={n.estado} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/necesidades"
        className="block rounded-lg bg-muted py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/80"
      >
        Ver tablero de necesidades →
      </Link>
    </div>
  );
}
