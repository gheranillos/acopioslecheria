"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS_INVENTARIO } from "@/types";
import { DepositoSection } from "./deposito-section";
import type { DepositoConInventario } from "@/lib/data/queries";

export function InventarioBoard({
  depositos,
  puedeEditar,
  puedeEliminar,
}: {
  depositos: DepositoConInventario[];
  puedeEditar: boolean;
  puedeEliminar: boolean;
}) {
  const [categoria, setCategoria] = useState("todas");

  return (
    <div className="space-y-4">
      <Select value={categoria} onValueChange={(value) => setCategoria(value ?? "todas")}>
        <SelectTrigger className="h-11 w-full sm:w-56">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas las categorías</SelectItem>
          {CATEGORIAS_INVENTARIO.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-4">
        {depositos.map((deposito) => (
          <DepositoSection
            key={deposito.id}
            deposito={deposito}
            categoriaFiltro={categoria}
            puedeEditar={puedeEditar}
            puedeEliminar={puedeEliminar}
          />
        ))}
      </div>
    </div>
  );
}
