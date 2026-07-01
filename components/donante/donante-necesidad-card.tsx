import {
  EstadoNecesidadBadge,
  PrioridadBadge,
} from "@/components/shared/badges";
import type { Necesidad } from "@/types";

export function DonanteNecesidadCard({ necesidad }: { necesidad: Necesidad }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border-0 bg-card p-4 shadow-sm ring-1 ring-brand-cyan/15">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold leading-snug">{necesidad.item}</h3>
        <PrioridadBadge prioridad={necesidad.prioridad} />
      </div>
      <p className="mt-3 text-sm">
        Faltan{" "}
        <span className="font-semibold tabular-nums">{necesidad.cantidad_requerida}</span>{" "}
        unidades
      </p>
      <div className="mt-3 border-t pt-3">
        <EstadoNecesidadBadge estado={necesidad.estado} />
      </div>
    </article>
  );
}
