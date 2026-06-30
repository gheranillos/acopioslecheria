import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { getCentros, getPerfiles } from "@/lib/data/queries";
import { PerfilRow } from "@/components/usuarios/perfil-row";

export default async function UsuariosPage() {
  const { perfil, user } = await requireUsuario();
  if (perfil.rol !== "operador") redirect("/dashboard");

  const [perfiles, centros] = await Promise.all([getPerfiles(), getCentros()]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Asigna rol y centro de acopio a cada cuenta registrada. Las cuentas nuevas
          entran con rol &quot;Voluntario&quot; por defecto.
        </p>
      </div>

      <div className="space-y-3">
        {perfiles.map((p) => (
          <PerfilRow
            key={p.id}
            perfil={p}
            centros={centros}
            esUsuarioActual={p.id === user.id}
          />
        ))}
      </div>
    </div>
  );
}
