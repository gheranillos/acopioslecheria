"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { crearDeposito } from "@/app/(panel)/inventario/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CrearDepositoDialog({ centroAcopioId }: { centroAcopioId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await crearDeposito({}, formData);
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
          <Button variant="outline" className="h-11 gap-1.5">
            <Plus className="h-4 w-4" />
            Crear depósito
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear depósito</DialogTitle>
          <DialogDescription>
            Registra el primer depósito de tu centro de acopio para empezar a llevar
            inventario.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="centro_acopio_id" value={centroAcopioId} />

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              placeholder="Ej. Galpón Principal"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación / referencia</Label>
            <Input
              id="ubicacion"
              name="ubicacion"
              placeholder="Opcional"
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
              Crear depósito
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
