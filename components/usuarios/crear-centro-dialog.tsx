"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { crearCentroAcopio } from "@/app/(panel)/usuarios/actions";
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
import { toast } from "sonner";

/** Centro aproximado de Lechería (Casco Central) como valor inicial del mapa. */
const LAT_DEFAULT = "10.1889";
const LNG_DEFAULT = "-64.6951";

export function CrearCentroDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await crearCentroAcopio({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setOpen(false);
        toast.success("Centro de acopio creado.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" className="h-11 gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo centro
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo centro de acopio</DialogTitle>
          <DialogDescription>
            Registra un punto de acopio en el mapa. Puedes afinar las coordenadas
            después si hace falta.
          </DialogDescription>
        </DialogHeader>

        <form
          action={onSubmit}
          className="max-h-[65vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-2">
            <Label htmlFor="centro-nombre">Nombre</Label>
            <Input
              id="centro-nombre"
              name="nombre"
              required
              placeholder="Ej. Puerto Príncipe"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="centro-ciudad">Ciudad</Label>
            <Select name="ciudad" defaultValue="Lechería" required>
              <SelectTrigger id="centro-ciudad" className="h-12 w-full">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="centro-lat">Latitud</Label>
              <Input
                id="centro-lat"
                name="lat"
                type="number"
                step="any"
                required
                defaultValue={LAT_DEFAULT}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="centro-lng">Longitud</Label>
              <Input
                id="centro-lng"
                name="lng"
                type="number"
                step="any"
                required
                defaultValue={LNG_DEFAULT}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="centro-descripcion">Descripción (opcional)</Label>
            <Input
              id="centro-descripcion"
              name="descripcion"
              placeholder="Referencia o notas para donantes"
              className="h-12"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending} className="h-12 w-full text-base">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear centro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
