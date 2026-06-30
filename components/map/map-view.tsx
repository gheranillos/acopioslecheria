"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { iconoCentro, iconoZona } from "./icons";
import { esDatoDesactualizado } from "@/lib/utils/relative-time";
import type { CentroConDetalle, ZonaConDetalle } from "@/types";

// Centrado aproximado sobre la bahía de Pozuelos: Lechería, Barcelona,
// Puerto La Cruz y Guanta (Anzoátegui, Venezuela).
const CENTRO_MAPA: [number, number] = [10.205, -64.66];
const ZOOM_INICIAL = 12;

interface MapViewProps {
  centros: CentroConDetalle[];
  zonas: ZonaConDetalle[];
  centroSeleccionadoId: string | null;
  zonaSeleccionadaId: string | null;
  onSelectCentro: (id: string) => void;
  onSelectZona: (id: string) => void;
}

export default function MapView({
  centros,
  zonas,
  centroSeleccionadoId,
  zonaSeleccionadaId,
  onSelectCentro,
  onSelectZona,
}: MapViewProps) {
  return (
    <MapContainer
      center={CENTRO_MAPA}
      zoom={ZOOM_INICIAL}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {centros
        .filter((c) => c.estado === "activo")
        .map((centro) => (
          <Marker
            key={centro.id}
            position={[centro.lat, centro.lng]}
            icon={iconoCentro(centro.id === centroSeleccionadoId)}
            eventHandlers={{ click: () => onSelectCentro(centro.id) }}
          />
        ))}

      {zonas.map((zona) => (
        <Marker
          key={zona.id}
          position={[zona.lat, zona.lng]}
          icon={iconoZona(
            zona.estado,
            esDatoDesactualizado(zona.updated_at),
            zona.id === zonaSeleccionadaId,
          )}
          eventHandlers={{ click: () => onSelectZona(zona.id) }}
        />
      ))}
    </MapContainer>
  );
}
