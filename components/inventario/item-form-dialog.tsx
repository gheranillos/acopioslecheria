"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { guardarItemInventario } from "@/app/(panel)/inventario/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORIAS_INVENTARIO, UNIDADES_INVENTARIO } from "@/types";
import type { Inventario } from "@/types";

export function ItemFormDialog({
  depositoId,
  item,
  trigger,
}: {
  depositoId: string;
  item?: Inventario;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await guardarItemInventario({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Editar item" : "Agregar item"}</DialogTitle>
          <DialogDescription>
            {item
              ? "Actualiza la cantidad o los datos de este item."
              : "Registra un nuevo item en el inventario de este depósito."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="deposito_id" value={depositoId} />
          {item && <input type="hidden" name="id" value={item.id} />}

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select
              name="categoria"
              defaultValue={item?.categoria ?? CATEGORIAS_INVENTARIO[0].value}
            >
              <SelectTrigger id="categoria" className="h-12 w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_INVENTARIO.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item">Item</Label>
            <Input
              id="item"
              name="item"
              required
              defaultValue={item?.item}
              placeholder="Ej. Agua embotellada 500ml"
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                min={0}
                step="any"
                required
                defaultValue={item?.cantidad}
                className="h-12"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidad">Unidad</Label>
              <Select name="unidad" defaultValue={item?.unidad ?? UNIDADES_INVENTARIO[0]}>
                <SelectTrigger id="unidad" className="h-12 w-full">
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_INVENTARIO.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending} className="h-12 w-full text-base">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {item ? "Guardar cambios" : "Agregar item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
