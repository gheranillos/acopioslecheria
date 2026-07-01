import { MapPin } from "lucide-react";
import { DatoDesactualizadoBadge, EstadoZonaBadge } from "@/components/shared/badges";
import { esDatoDesactualizado } from "@/lib/utils/relative-time";
import type { ZonaRefugio } from "@/types";

export function DonanteZonaRow({ zona }: { zona: ZonaRefugio }) {
  const desactualizado = esDatoDesactualizado(zona.updated_at);

  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{zona.nombre}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {zona.ciudad}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <EstadoZonaBadge estado={zona.estado} />
        {desactualizado && <DatoDesactualizadoBadge />}
      </div>
    </li>
  );
}
