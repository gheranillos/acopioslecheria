import { MapPin } from "lucide-react";
import {
  EstadoNecesidadBadge,
  PrioridadBadge,
} from "@/components/shared/badges";
import type { NecesidadPublica } from "@/lib/data/public-queries";

export function DonanteNecesidadCard({ necesidad }: { necesidad: NecesidadPublica }) {
  return (
    <article className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug">{necesidad.item}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {necesidad.zona.nombre} · {necesidad.zona.ciudad}
          </p>
        </div>
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
