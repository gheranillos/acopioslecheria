import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EstadoNecesidad, EstadoZona, Prioridad } from "@/types";

const ESTADO_ZONA_ESTILOS: Record<EstadoZona, { label: string; className: string }> = {
  abastecido: {
    label: "Abastecido",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  parcialmente_abastecido: {
    label: "Parcial",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  no_abastecido: {
    label: "No abastecido",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function EstadoZonaBadge({ estado }: { estado: EstadoZona }) {
  const cfg = ESTADO_ZONA_ESTILOS[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

const PRIORIDAD_ESTILOS: Record<Prioridad, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-red-100 text-red-800 border-red-200" },
  media: { label: "Media", className: "bg-amber-100 text-amber-800 border-amber-200" },
  baja: { label: "Baja", className: "bg-slate-100 text-slate-700 border-slate-200" },
};

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  const cfg = PRIORIDAD_ESTILOS[prioridad];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

const ESTADO_NECESIDAD_ESTILOS: Record<
  EstadoNecesidad,
  { label: string; className: string }
> = {
  abierta: { label: "Abierta", className: "bg-blue-100 text-blue-800 border-blue-200" },
  en_proceso: {
    label: "En proceso",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  cubierta: {
    label: "Cubierta",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

export function EstadoNecesidadBadge({ estado }: { estado: EstadoNecesidad }) {
  const cfg = ESTADO_NECESIDAD_ESTILOS[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function DatoDesactualizadoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
      <AlertTriangle className="h-3 w-3" />
      Dato desactualizado
    </span>
  );
}
