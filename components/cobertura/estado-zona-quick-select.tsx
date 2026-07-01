"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { actualizarEstadoZona } from "@/app/(panel)/cobertura/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_ZONA } from "@/types";
import type { EstadoZona } from "@/types";

export function EstadoZonaQuickSelect({
  zonaId,
  estadoInicial,
  compact = false,
}: {
  zonaId: string;
  estadoInicial: EstadoZona;
  compact?: boolean;
}) {
  const [estado, setEstado] = useState<EstadoZona>(estadoInicial);
  const [pending, startTransition] = useTransition();

  function onChange(value: string | null) {
    if (!value) return;
    const nuevoEstado = value as EstadoZona;
    const anterior = estado;
    setEstado(nuevoEstado);

    startTransition(async () => {
      try {
        await actualizarEstadoZona(zonaId, nuevoEstado);
        toast.success("Estado de zona actualizado");
      } catch {
        setEstado(anterior);
        toast.error("No se pudo actualizar el estado de la zona");
      }
    });
  }

  return (
    <Select value={estado} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className={compact ? "h-8 w-full min-w-[10.5rem] text-xs" : "h-9 w-full sm:w-auto"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ESTADOS_ZONA.map((e) => (
          <SelectItem key={e.value} value={e.value}>
            {e.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
