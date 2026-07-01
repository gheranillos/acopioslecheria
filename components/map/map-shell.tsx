"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { CentroPanel } from "./centro-panel";
import { ZonaPanel } from "./zona-panel";
import { MapLegend } from "./map-legend";
import type { CentroConDetalle, Perfil, ZonaConDetalle } from "@/types";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Cargando mapa...
    </div>
  ),
});

type Seleccion = { tipo: "centro"; id: string } | { tipo: "zona"; id: string } | null;

export function MapShell({
  centros,
  zonas,
  perfiles,
  centroInicialId,
  puedeEditarEstadoZona = false,
  esOperador = false,
  centroAcopioId = null,
}: {
  centros: CentroConDetalle[];
  zonas: ZonaConDetalle[];
  perfiles: Perfil[];
  centroInicialId?: string;
  puedeEditarEstadoZona?: boolean;
  esOperador?: boolean;
  centroAcopioId?: string | null;
}) {
  const isMobile = useIsMobile();
  const [seleccion, setSeleccion] = useState<Seleccion>(
    centroInicialId ? { tipo: "centro", id: centroInicialId } : null,
  );

  const centroSeleccionado =
    seleccion?.tipo === "centro"
      ? centros.find((c) => c.id === seleccion.id) ?? null
      : null;
  const zonaSeleccionada =
    seleccion?.tipo === "zona"
      ? zonas.find((z) => z.id === seleccion.id) ?? null
      : null;

  const hayDetalle = Boolean(centroSeleccionado || zonaSeleccionada);

  const detalle = centroSeleccionado ? (
    <CentroPanel centro={centroSeleccionado} />
  ) : zonaSeleccionada ? (
    <ZonaPanel
      zona={zonaSeleccionada}
      perfiles={perfiles}
      puedeEditarEstado={
        puedeEditarEstadoZona &&
        (esOperador ||
          Boolean(
            centroAcopioId &&
              zonaSeleccionada.centros.some((c) => c.id === centroAcopioId),
          ))
      }
    />
  ) : null;

  return (
    <div className="relative flex h-[100dvh] min-h-0 flex-col md:h-full md:flex-row">
      <div className="relative min-h-0 flex-1">
        <MapView
          centros={centros}
          zonas={zonas}
          centroSeleccionadoId={centroSeleccionado?.id ?? null}
          zonaSeleccionadaId={zonaSeleccionada?.id ?? null}
          onSelectCentro={(id) => setSeleccion({ tipo: "centro", id })}
          onSelectZona={(id) => setSeleccion({ tipo: "zona", id })}
        />

        <MapLegend />

        <Button
          size="icon"
          className="absolute bottom-4 left-4 z-[1000] h-12 w-12 rounded-full shadow-lg md:hidden"
          render={
            <Link href="/dashboard" aria-label="Volver al panel de datos">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          }
        />
      </div>

      {/* Panel desktop: columna fija a la derecha */}
      <aside className="hidden w-full max-w-sm shrink-0 overflow-y-auto border-l bg-background md:block">
        {detalle ?? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Selecciona un centro o una zona en el mapa para ver el detalle.
          </div>
        )}
      </aside>

      {/* Panel móvil: bottom sheet */}
      <Sheet
        open={Boolean(hayDetalle && isMobile)}
        onOpenChange={(open) => {
          if (!open) setSeleccion(null);
        }}
      >
        <SheetContent
          side="bottom"
          className="max-h-[78dvh] overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
        >
          <SheetTitle className="sr-only">
            {centroSeleccionado?.nombre ?? zonaSeleccionada?.nombre ?? "Detalle"}
          </SheetTitle>
          {detalle}
        </SheetContent>
      </Sheet>
    </div>
  );
}
