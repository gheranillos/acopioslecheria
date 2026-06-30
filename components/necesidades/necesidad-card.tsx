"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadoNecesidadBadge, PrioridadBadge } from "@/components/shared/badges";
import { tiempoRelativo } from "@/lib/utils/relative-time";
import { EstadoQuickSelect } from "./estado-quick-select";
import { NecesidadFormDialog } from "./necesidad-form-dialog";
import { EliminarNecesidadButton } from "./eliminar-necesidad-button";
import type { NecesidadItem } from "./necesidades-board";
import type { ZonaRefugio } from "@/types";

export function NecesidadCard({
  necesidad,
  zonasDisponibles,
}: {
  necesidad: NecesidadItem;
  zonasDisponibles: Pick<ZonaRefugio, "id" | "nombre" | "ciudad">[];
}) {
  return (
    <div className="flex flex-col rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{necesidad.item}</p>
          <p className="truncate text-xs text-muted-foreground">
            {necesidad.zonaNombre} · {necesidad.zonaCiudad}
          </p>
        </div>
        <PrioridadBadge prioridad={necesidad.prioridad} />
      </div>

      <p className="mt-2 text-sm">
        <span className="font-medium tabular-nums">{necesidad.cantidad_requerida}</span>{" "}
        requeridas
      </p>

      {necesidad.centrosCobertura.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {necesidad.centrosCobertura.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {c.nombre}
            </span>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Creada {tiempoRelativo(necesidad.created_at)}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
        {necesidad.puedeCambiarEstado ? (
          <EstadoQuickSelect necesidadId={necesidad.id} estadoInicial={necesidad.estado} />
        ) : (
          <EstadoNecesidadBadge estado={necesidad.estado} />
        )}

        {necesidad.puedeEditarCompleto && (
          <div className="flex items-center gap-1">
            <NecesidadFormDialog
              zonas={zonasDisponibles}
              necesidad={necesidad}
              trigger={
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <EliminarNecesidadButton necesidadId={necesidad.id} itemNombre={necesidad.item} />
          </div>
        )}
      </div>
    </div>
  );
}
