"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { agregarCobertura, quitarCobertura } from "@/app/(panel)/cobertura/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EstadoZonaBadge } from "@/components/shared/badges";
import type { CentroAcopio, ZonaRefugio } from "@/types";

export function CoberturaManager({
  centro,
  zonasCubiertas,
  zonasDisponibles,
}: {
  centro: CentroAcopio;
  zonasCubiertas: ZonaRefugio[];
  zonasDisponibles: ZonaRefugio[];
}) {
  const [seleccionada, setSeleccionada] = useState("");
  const [pending, startTransition] = useTransition();

  function onAgregar() {
    if (!seleccionada) return;
    const zonaId = seleccionada;
    startTransition(async () => {
      try {
        await agregarCobertura(centro.id, zonaId);
        setSeleccionada("");
        toast.success("Zona agregada a la cobertura");
      } catch {
        toast.error("No se pudo agregar la zona");
      }
    });
  }

  function onQuitar(zonaId: string) {
    startTransition(async () => {
      try {
        await quitarCobertura(centro.id, zonaId);
        toast.success("Zona removida de la cobertura");
      } catch {
        toast.error("No se pudo quitar la zona");
      }
    });
  }

  return (
    <div className="rounded-xl border bg-background p-4">
      <h3 className="text-base font-semibold">{centro.nombre}</h3>
      <p className="text-xs text-muted-foreground">{centro.ciudad}</p>

      <div className="mt-3 space-y-2">
        {zonasCubiertas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este centro no cubre ninguna zona todavía.
          </p>
        ) : (
          zonasCubiertas.map((z) => (
            <div
              key={z.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{z.nombre}</span>
                <EstadoZonaBadge estado={z.estado} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={pending}
                onClick={() => onQuitar(z.id)}
                aria-label={`Quitar ${z.nombre} de la cobertura`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {zonasDisponibles.length > 0 && (
        <div className="mt-4 flex gap-2">
          <Select value={seleccionada} onValueChange={(value) => setSeleccionada(value ?? "")}>
            <SelectTrigger className="h-11 flex-1">
              <SelectValue placeholder="Agregar zona..." />
            </SelectTrigger>
            <SelectContent>
              {zonasDisponibles.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={onAgregar}
            disabled={!seleccionada || pending}
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Agregar zona seleccionada"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
