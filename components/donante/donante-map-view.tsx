"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { iconoCentro } from "@/components/map/icons";
import type { CentroAcopio } from "@/types";

const CENTRO_MAPA: [number, number] = [10.175, -64.685];
const ZOOM_INICIAL = 12;

export default function DonanteMapView({ centros }: { centros: CentroAcopio[] }) {
  return (
    <MapContainer
      center={CENTRO_MAPA}
      zoom={ZOOM_INICIAL}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {centros.map((centro) => (
        <Marker
          key={centro.id}
          position={[centro.lat, centro.lng]}
          icon={iconoCentro(false)}
        >
          <Popup>
            <div className="min-w-[140px] text-sm">
              <p className="font-semibold">{centro.nombre}</p>
              <p className="text-muted-foreground">{centro.ciudad}</p>
              {centro.descripcion && (
                <p className="mt-1 text-xs leading-snug">{centro.descripcion}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
