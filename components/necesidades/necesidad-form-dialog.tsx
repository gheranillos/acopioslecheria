"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { guardarNecesidad } from "@/app/(panel)/necesidades/actions";
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
import { ESTADOS_NECESIDAD, PRIORIDADES } from "@/types";
import type { Necesidad, ZonaRefugio } from "@/types";

export function NecesidadFormDialog({
  zonas,
  necesidad,
  trigger,
}: {
  zonas: Pick<ZonaRefugio, "id" | "nombre" | "ciudad">[];
  necesidad?: Necesidad;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await guardarNecesidad({}, formData);
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
          <DialogTitle>{necesidad ? "Editar necesidad" : "Nueva necesidad"}</DialogTitle>
          <DialogDescription>
            {necesidad
              ? "Actualiza los datos de esta necesidad."
              : "Publícala en el tablero para que los centros la cubran."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          {necesidad && <input type="hidden" name="id" value={necesidad.id} />}

          <div className="space-y-2">
            <Label htmlFor="zona_refugio_id">Zona de refugio</Label>
            <Select
              name="zona_refugio_id"
              defaultValue={necesidad?.zona_refugio_id ?? zonas[0]?.id}
            >
              <SelectTrigger id="zona_refugio_id" className="h-12 w-full">
                <SelectValue placeholder="Selecciona una zona" />
              </SelectTrigger>
              <SelectContent>
                {zonas.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item">Item / descripción</Label>
            <Input
              id="item"
              name="item"
              required
              defaultValue={necesidad?.item}
              placeholder="Ej. Agua potable"
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cantidad_requerida">Cantidad requerida</Label>
              <Input
                id="cantidad_requerida"
                name="cantidad_requerida"
                type="number"
                min={1}
                step="any"
                required
                defaultValue={necesidad?.cantidad_requerida}
                className="h-12"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select name="prioridad" defaultValue={necesidad?.prioridad ?? "media"}>
                <SelectTrigger id="prioridad" className="h-12 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select name="estado" defaultValue={necesidad?.estado ?? "abierta"}>
              <SelectTrigger id="estado" className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_NECESIDAD.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending} className="h-12 w-full text-base">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {necesidad ? "Guardar cambios" : "Publicar necesidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
