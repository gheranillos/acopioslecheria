"use client";

import dynamic from "next/dynamic";
import type { CentroAcopio } from "@/types";

const DonanteMapView = dynamic(() => import("./donante-map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(420px,55dvh)] items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
      Cargando mapa...
    </div>
  ),
});

export function DonanteMap({ centros }: { centros: CentroAcopio[] }) {
  if (centros.length === 0) {
    return (
      <div className="flex h-[min(280px,40dvh)] items-center justify-center rounded-xl border bg-muted/50 px-6 text-center text-sm text-muted-foreground">
        No hay centros de acopio activos registrados por el momento.
      </div>
    );
  }

  return (
    <div className="relative h-[min(420px,55dvh)] overflow-hidden rounded-xl border shadow-sm">
      <DonanteMapView centros={centros} />
    </div>
  );
}
