"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESTADOS_NECESIDAD } from "@/types";
import { NecesidadCard } from "./necesidad-card";
import type { CentroAcopio, Necesidad, ZonaRefugio } from "@/types";

export interface NecesidadItem extends Necesidad {
  zonaNombre: string;
  zonaCiudad: string;
  centrosCobertura: CentroAcopio[];
  puedeEditarCompleto: boolean;
  puedeCambiarEstado: boolean;
}

export function NecesidadesBoard({
  necesidades,
  zonasDisponiblesParaCrear,
}: {
  necesidades: NecesidadItem[];
  zonasDisponiblesParaCrear: Pick<ZonaRefugio, "id" | "nombre" | "ciudad">[];
}) {
  const [estado, setEstado] = useState("todas");
  const [zona, setZona] = useState("todas");
  const [centro, setCentro] = useState("todos");

  const zonasOpciones = useMemo(() => {
    const mapa = new Map<string, string>();
    necesidades.forEach((n) => mapa.set(n.zona_refugio_id, n.zonaNombre));
    return Array.from(mapa.entries());
  }, [necesidades]);

  const centrosOpciones = useMemo(() => {
    const mapa = new Map<string, string>();
    necesidades.forEach((n) =>
      n.centrosCobertura.forEach((c) => mapa.set(c.id, c.nombre)),
    );
    return Array.from(mapa.entries());
  }, [necesidades]);

  const filtradas = necesidades.filter((n) => {
    if (estado !== "todas" && n.estado !== estado) return false;
    if (zona !== "todas" && n.zona_refugio_id !== zona) return false;
    if (centro !== "todos" && !n.centrosCobertura.some((c) => c.id === centro)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Select value={estado} onValueChange={(value) => setEstado(value ?? "todas")}>
          <SelectTrigger className="h-11 w-full sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            {ESTADOS_NECESIDAD.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={zona} onValueChange={(value) => setZona(value ?? "todas")}>
          <SelectTrigger className="h-11 w-full sm:w-48">
            <SelectValue placeholder="Zona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las zonas</SelectItem>
            {zonasOpciones.map(([id, nombre]) => (
              <SelectItem key={id} value={id}>
                {nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {centrosOpciones.length > 0 && (
          <Select value={centro} onValueChange={(value) => setCentro(value ?? "todos")}>
            <SelectTrigger className="h-11 w-full sm:w-48">
              <SelectValue placeholder="Centro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los centros</SelectItem>
              {centrosOpciones.map(([id, nombre]) => (
                <SelectItem key={id} value={id}>
                  {nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filtradas.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No hay necesidades que coincidan con los filtros.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((n) => (
            <NecesidadCard
              key={n.id}
              necesidad={n}
              zonasDisponibles={zonasDisponiblesParaCrear}
            />
          ))}
        </div>
      )}
    </div>
  );
}
