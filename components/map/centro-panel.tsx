import Link from "next/link";
import { Boxes, MapPin, Warehouse } from "lucide-react";
import { EstadoZonaBadge } from "@/components/shared/badges";
import type { CentroConDetalle } from "@/types";

export function CentroPanel({ centro }: { centro: CentroConDetalle }) {
  const totalItems = centro.depositos.reduce(
    (acc, d) => acc + d.inventario.length,
    0,
  );

  return (
    <div className="space-y-5 p-5 pt-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Centro de acopio
        </p>
        <h2 className="text-lg font-semibold">{centro.nombre}</h2>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {centro.ciudad}
        </p>
        {centro.descripcion && (
          <p className="mt-2 text-sm text-muted-foreground">{centro.descripcion}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border p-3">
          <p className="text-lg font-semibold tabular-nums">{centro.depositos.length}</p>
          <p className="text-xs text-muted-foreground">
            {centro.depositos.length === 1 ? "Depósito" : "Depósitos"}
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-lg font-semibold tabular-nums">{totalItems}</p>
          <p className="text-xs text-muted-foreground">Items en inventario</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Depósitos</h3>
        {centro.depositos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este centro todavía no tiene depósitos registrados.
          </p>
        ) : (
          <ul className="space-y-2">
            {centro.depositos.map((d) => (
              <li key={d.id} className="rounded-lg border p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                  {d.nombre}
                </p>
                {d.ubicacion && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.ubicacion}</p>
                )}
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Boxes className="h-3 w-3" />
                  {d.inventario.length} items registrados
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Zonas que cubre</h3>
        {centro.zonas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este centro no cubre ninguna zona todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {centro.zonas.map((z) => (
              <li
                key={z.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <span className="text-sm font-medium">{z.nombre}</span>
                <EstadoZonaBadge estado={z.estado} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/inventario"
        className="block rounded-lg bg-muted py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/80"
      >
        Ver inventario completo →
      </Link>
    </div>
  );
}
