"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { crearUsuario } from "@/app/(panel)/usuarios/actions";
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
import { ROLES_USUARIO } from "@/types";
import type { CentroAcopio, RolUsuario } from "@/types";
import { toast } from "sonner";

const SIN_CENTRO = "sin_centro";
const ROLES_CON_CENTRO: RolUsuario[] = ["jefe_centro", "logistica"];

export function CrearUsuarioDialog({
  centros,
  disabled,
}: {
  centros: CentroAcopio[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [rol, setRol] = useState<RolUsuario>("voluntario");
  const [centroId, setCentroId] = useState(SIN_CENTRO);
  const [pending, startTransition] = useTransition();

  const requiereCentro = ROLES_CON_CENTRO.includes(rol);

  function onSubmit(formData: FormData) {
    formData.set("rol", rol);
    formData.set("centro_acopio_id", centroId);
    startTransition(async () => {
      const result = await crearUsuario({}, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setOpen(false);
        setRol("voluntario");
        setCentroId(SIN_CENTRO);
        toast.success("Usuario creado. Comparte el correo y la contraseña con la persona.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(undefined);
          setRol("voluntario");
          setCentroId(SIN_CENTRO);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="h-11 gap-1.5" disabled={disabled}>
            <UserPlus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>
            Crea la cuenta con correo y contraseña temporal. La persona podrá iniciar
            sesión de inmediato con el rol que elijas.
          </DialogDescription>
        </DialogHeader>

        <form
          action={onSubmit}
          className="max-h-[65vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-2">
            <Label htmlFor="crear-email">Correo</Label>
            <Input
              id="crear-email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="persona@ejemplo.com"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crear-nombre">Nombre completo</Label>
            <Input
              id="crear-nombre"
              name="nombre_completo"
              required
              placeholder="Nombre y apellido"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crear-password">Contraseña temporal</Label>
            <Input
              id="crear-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              Compártela por un canal seguro (WhatsApp, en persona). La persona puede
              cambiarla después si habilitas esa opción en Supabase.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crear-telefono">Teléfono (opcional)</Label>
            <Input
              id="crear-telefono"
              name="telefono"
              type="tel"
              placeholder="0414-0000000"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={rol}
              onValueChange={(v) => v && setRol(v as RolUsuario)}
              disabled={pending}
            >
              <SelectTrigger className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES_USUARIO.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Centro de acopio
              {requiereCentro ? " (requerido)" : " (opcional)"}
            </Label>
            <Select
              value={centroId}
              onValueChange={(v) => v && setCentroId(v)}
              disabled={pending}
            >
              <SelectTrigger className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_CENTRO} disabled={requiereCentro}>
                  Sin centro
                </SelectItem>
                {centros.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre} · {c.ciudad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {requiereCentro && centros.length === 0 && (
              <p className="text-xs text-destructive">
                Crea un centro de acopio antes de asignar jefe o logística.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={pending || (requiereCentro && centros.length === 0)}
              className="h-12 w-full text-base"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
