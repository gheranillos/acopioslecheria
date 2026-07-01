"use client";

import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { AlertTriangle, Home, Warehouse } from "lucide-react";
import type { EstadoZona } from "@/types";

const ESTADO_COLOR: Record<EstadoZona, string> = {
  abastecido: "#16a34a",
  parcialmente_abastecido: "#d97706",
  no_abastecido: "#dc2626",
};

const SIZE = 32;

function crearDivIcon(html: string) {
  return L.divIcon({
    html,
    className: "",
    iconSize: [SIZE, SIZE],
    iconAnchor: [SIZE / 2, SIZE / 2],
    popupAnchor: [0, -SIZE / 2],
  });
}

export function iconoCentro(seleccionado = false) {
  const html = renderToStaticMarkup(
    <div
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 8,
        background: "#00aeef",
        border: seleccionado ? "3px solid #001d3d" : "2px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Warehouse color="white" size={16} />
    </div>,
  );
  return crearDivIcon(html);
}

export function iconoZona(
  estado: EstadoZona,
  desactualizado: boolean,
  seleccionado = false,
) {
  const color = ESTADO_COLOR[estado];
  const html = renderToStaticMarkup(
    <div style={{ position: "relative", width: SIZE, height: SIZE }}>
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          background: color,
          border: seleccionado
            ? "3px solid #1f2937"
            : desactualizado
              ? "2px dashed white"
              : "2px solid white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Home color="white" size={16} />
      </div>
      {desactualizado && (
        <div
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#f59e0b",
            border: "1px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle color="white" size={10} />
        </div>
      )}
    </div>,
  );
  return crearDivIcon(html);
}
