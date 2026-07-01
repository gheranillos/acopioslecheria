import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { getCentros, getPerfiles } from "@/lib/data/queries";
import { isAdminApiConfigured } from "@/lib/supabase/env";
import { CrearCentroDialog } from "@/components/usuarios/crear-centro-dialog";
import { CrearUsuarioDialog } from "@/components/usuarios/crear-usuario-dialog";
import { PerfilRow } from "@/components/usuarios/perfil-row";
import { PageHeader } from "@/components/shared/page-header";

export default async function UsuariosPage() {
  const { perfil, user } = await requireUsuario();
  if (perfil.rol !== "operador") redirect("/dashboard");

  const [perfiles, centros] = await Promise.all([getPerfiles(), getCentros()]);
  const adminOk = isAdminApiConfigured();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios y centros"
        description="Crea cuentas del equipo, asigna roles y registra centros de acopio sin entrar a Supabase."
        action={
          <div className="flex flex-wrap gap-2">
            <CrearCentroDialog />
            <CrearUsuarioDialog centros={centros} disabled={!adminOk} />
          </div>
        }
      />

      {!adminOk && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Falta la clave de administración</p>
          <p className="mt-1 leading-relaxed text-amber-900/90">
            Para crear usuarios desde aquí, agrega{" "}
            <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> en{" "}
            <code className="font-mono text-xs">.env.local</code> (local) o en Vercel →
            Environment Variables. La encuentras en Supabase → Settings → API →{" "}
            <strong>service_role</strong> (secret). No la compartas ni la subas al repo.
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cuentas ({perfiles.length})
        </h2>
        {perfiles.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aún no hay usuarios. Crea el primero con el botón de arriba.
          </p>
        ) : (
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
        )}
      </section>

      <section className="space-y-3 border-t pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Centros de acopio ({centros.length})
        </h2>
        {centros.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay centros registrados. Crea uno antes de asignar jefes o logística.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {centros.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border bg-card px-4 py-3 text-sm shadow-sm"
              >
                <p className="font-medium">{c.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {c.ciudad} · {c.estado === "activo" ? "Activo" : "Inactivo"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
