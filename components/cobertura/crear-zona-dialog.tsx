"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { crearZona } from "@/app/(panel)/cobertura/actions";
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
import { CIUDADES } from "@/types";
import type { CentroAcopio } from "@/types";

export function CrearZonaDialog({
  centros,
  centroFijoId,
}: {
  centros: CentroAcopio[];
  centroFijoId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await crearZona({}, formData);
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
      <DialogTrigger
        render={
          <Button className="h-11 gap-1.5">
            <Plus className="h-4 w-4" />
            Nueva zona de refugio
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva zona de refugio</DialogTitle>
          <DialogDescription>
            Registra una comunidad que necesita ser abastecida. Puedes ajustar la
            ubicación exacta más adelante.
          </DialogDescription>
        </DialogHeader>

        <form
          action={onSubmit}
          className="max-h-[65vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              placeholder="Ej. Troconal 5to"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Select name="ciudad" defaultValue={CIUDADES[0]}>
              <SelectTrigger id="ciudad" className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CIUDADES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="encargado_nombre">Encargado(a) (opcional)</Label>
            <Input
              id="encargado_nombre"
              name="encargado_nombre"
              placeholder="Ej. Edith"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="encargado_contacto">Contacto (opcional)</Label>
            <Input
              id="encargado_contacto"
              name="encargado_contacto"
              placeholder="Teléfono"
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitud</Label>
              <Input
                id="lat"
                name="lat"
                type="number"
                step="any"
                required
                defaultValue={10.21}
                className="h-12"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitud</Label>
              <Input
                id="lng"
                name="lng"
                type="number"
                step="any"
                required
                defaultValue={-64.66}
                className="h-12"
                inputMode="decimal"
              />
            </div>
          </div>

          {centroFijoId ? (
            <input type="hidden" name="vincular_centro_id" value={centroFijoId} />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="vincular_centro_id">Vincular a un centro (opcional)</Label>
              <Select name="vincular_centro_id">
                <SelectTrigger id="vincular_centro_id" className="h-12 w-full">
                  <SelectValue placeholder="Sin vincular todavía" />
                </SelectTrigger>
                <SelectContent>
                  {centros.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending} className="h-12 w-full text-base">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear zona
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
