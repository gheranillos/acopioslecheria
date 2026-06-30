"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { actualizarPerfil } from "@/app/(panel)/usuarios/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES_USUARIO } from "@/types";
import type { CentroAcopio, Perfil, RolUsuario } from "@/types";

const SIN_CENTRO = "sin_centro";

export function PerfilRow({
  perfil,
  centros,
  esUsuarioActual,
}: {
  perfil: Perfil;
  centros: CentroAcopio[];
  esUsuarioActual: boolean;
}) {
  const [rol, setRol] = useState<RolUsuario>(perfil.rol);
  const [centroId, setCentroId] = useState(perfil.centro_acopio_id ?? SIN_CENTRO);
  const [pending, startTransition] = useTransition();

  function onRolChange(value: string | null) {
    if (!value) return;
    const nuevoRol = value as RolUsuario;
    const anterior = rol;
    setRol(nuevoRol);
    startTransition(async () => {
      try {
        await actualizarPerfil(perfil.id, { rol: nuevoRol });
        toast.success(`Rol actualizado: ${perfil.nombre_completo}`);
      } catch {
        setRol(anterior);
        toast.error("No se pudo actualizar el rol");
      }
    });
  }

  function onCentroChange(value: string | null) {
    if (!value) return;
    const anterior = centroId;
    setCentroId(value);
    startTransition(async () => {
      try {
        await actualizarPerfil(perfil.id, {
          centro_acopio_id: value === SIN_CENTRO ? null : value,
        });
        toast.success(`Centro actualizado: ${perfil.nombre_completo}`);
      } catch {
        setCentroId(anterior);
        toast.error("No se pudo actualizar el centro");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {perfil.nombre_completo}
          {esUsuarioActual && <span className="ml-1.5 text-xs text-muted-foreground">(tú)</span>}
        </p>
        {perfil.telefono && (
          <p className="text-xs text-muted-foreground">{perfil.telefono}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={rol} onValueChange={onRolChange} disabled={pending}>
          <SelectTrigger className="h-10 w-full sm:w-48">
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
        <Select value={centroId} onValueChange={onCentroChange} disabled={pending}>
          <SelectTrigger className="h-10 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SIN_CENTRO}>Sin centro</SelectItem>
            {centros.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
