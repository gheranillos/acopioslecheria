"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { actualizarEstadoNecesidad } from "@/app/(panel)/necesidades/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_NECESIDAD } from "@/types";
import type { EstadoNecesidad } from "@/types";

export function EstadoQuickSelect({
  necesidadId,
  estadoInicial,
}: {
  necesidadId: string;
  estadoInicial: EstadoNecesidad;
}) {
  const [estado, setEstado] = useState<EstadoNecesidad>(estadoInicial);
  const [pending, startTransition] = useTransition();

  function onChange(value: string | null) {
    if (!value) return;
    const nuevoEstado = value as EstadoNecesidad;
    const anterior = estado;
    setEstado(nuevoEstado);

    startTransition(async () => {
      try {
        await actualizarEstadoNecesidad(necesidadId, nuevoEstado);
        toast.success("Estado actualizado");
      } catch {
        setEstado(anterior);
        toast.error("No se pudo actualizar el estado");
      }
    });
  }

  return (
    <Select value={estado} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="h-9 w-full sm:w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ESTADOS_NECESIDAD.map((e) => (
          <SelectItem key={e.value} value={e.value}>
            {e.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
