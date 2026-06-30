"use client";

import { Pencil, Plus, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ItemFormDialog } from "./item-form-dialog";
import { EliminarItemButton } from "./eliminar-item-button";
import { tiempoRelativo } from "@/lib/utils/relative-time";
import { CATEGORIAS_INVENTARIO } from "@/types";
import type { DepositoConInventario } from "@/lib/data/queries";

const CATEGORIA_LABEL = Object.fromEntries(
  CATEGORIAS_INVENTARIO.map((c) => [c.value, c.label]),
);

export function DepositoSection({
  deposito,
  categoriaFiltro,
  puedeEditar,
  puedeEliminar,
}: {
  deposito: DepositoConInventario;
  categoriaFiltro: string;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}) {
  const items = [...deposito.inventario]
    .filter((i) => categoriaFiltro === "todas" || i.categoria === categoriaFiltro)
    .sort((a, b) => a.item.localeCompare(b.item));

  const mostrarAcciones = puedeEditar || puedeEliminar;

  return (
    <section className="rounded-xl border bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Warehouse className="h-4 w-4 text-muted-foreground" />
            {deposito.nombre}
          </h2>
          {deposito.ubicacion && (
            <p className="text-xs text-muted-foreground">{deposito.ubicacion}</p>
          )}
        </div>
        {puedeEditar && (
          <ItemFormDialog
            depositoId={deposito.id}
            trigger={
              <Button size="sm" className="h-10 gap-1.5">
                <Plus className="h-4 w-4" />
                Agregar item
              </Button>
            }
          />
        )}
      </header>

      {items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          No hay items{categoriaFiltro !== "todas" ? " en esta categoría" : ""} registrados
          en este depósito.
        </p>
      ) : (
        <>
          {/* Desktop / tablet: tabla */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Actualizado</TableHead>
                  {mostrarAcciones && <TableHead className="w-24" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {CATEGORIA_LABEL[item.categoria]}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.cantidad} {item.unidad}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tiempoRelativo(item.updated_at)}
                    </TableCell>
                    {mostrarAcciones && (
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {puedeEditar && (
                            <ItemFormDialog
                              depositoId={deposito.id}
                              item={item}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                          {puedeEliminar && (
                            <EliminarItemButton itemId={item.id} itemNombre={item.item} />
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Móvil: tarjetas apiladas, sin scroll horizontal */}
          <ul className="divide-y md:hidden">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.item}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORIA_LABEL[item.categoria]}
                  </p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">
                    {item.cantidad} {item.unidad}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Actualizado {tiempoRelativo(item.updated_at)}
                  </p>
                </div>
                {mostrarAcciones && (
                  <div className="flex shrink-0 flex-col gap-1">
                    {puedeEditar && (
                      <ItemFormDialog
                        depositoId={deposito.id}
                        item={item}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-10 w-10">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                    )}
                    {puedeEliminar && (
                      <EliminarItemButton itemId={item.id} itemNombre={item.item} />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
