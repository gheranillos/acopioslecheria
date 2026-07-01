import { redirect } from "next/navigation";
import { Heart, MapPin, Package } from "lucide-react";
import { DonanteFooter, DonanteHeader } from "@/components/donante/donante-header";
import { DonanteMap } from "@/components/donante/donante-map";
import { DonanteNecesidadCard } from "@/components/donante/donante-necesidad-card";
import { DonanteZonaRow } from "@/components/donante/donante-zona-row";
import { getUsuarioActual } from "@/lib/auth/session";
import { getDonanteData } from "@/lib/data/public-queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  const actual = await getUsuarioActual();
  if (actual) redirect("/dashboard");

  const supabaseOk = isSupabaseConfigured();
  const data = supabaseOk ? await getDonanteData() : null;

  return (
    <div className="surface-paper flex min-h-screen flex-col">
      <DonanteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60 bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Ayuda humanitaria · Anzoátegui
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Tu donación llega donde hace falta
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Aquí puedes ver qué necesitan las comunidades afectadas y dónde llevar
                tu aporte. Los centros de acopio coordinan la entrega a las zonas de
                refugio.
              </p>
            </div>

            {data && (
              <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 text-center sm:max-w-xl">
                <div className="rounded-xl border bg-card px-3 py-4 shadow-sm">
                  <Package className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {data.necesidades.length}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Necesidades activas
                  </p>
                </div>
                <div className="rounded-xl border bg-card px-3 py-4 shadow-sm">
                  <Heart className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {data.zonas.length}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Zonas de refugio
                  </p>
                </div>
                <div className="rounded-xl border bg-card px-3 py-4 shadow-sm">
                  <MapPin className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {data.centros.length}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    Centros de acopio
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {!supabaseOk && (
          <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
              <p className="font-medium">Datos no disponibles temporalmente</p>
              <p className="mt-1 leading-relaxed text-amber-900/90">
                El sistema está en configuración. Vuelve a intentar más tarde.
              </p>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Necesidades */}
            <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
              <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-tight">
                  Qué se necesita ahora
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Publicado por los equipos de los centros de acopio y zonas de refugio.
                </p>
              </div>

              {data.necesidades.length === 0 ? (
                <p className="rounded-xl border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay necesidades abiertas en este momento. ¡Gracias por tu interés en
                  ayudar!
                </p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.necesidades.map((n) => (
                    <li key={n.id}>
                      <DonanteNecesidadCard necesidad={n} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Zonas */}
            <section className="border-y border-border/60 bg-muted/10">
              <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Estado de las zonas
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Situación de abastecimiento en cada comunidad atendida.
                  </p>
                </div>

                {data.zonas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay zonas registradas.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.zonas.map((z) => (
                      <DonanteZonaRow key={z.id} zona={z} />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Mapa centros */}
            <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
              <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-tight">
                  Dónde donar
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Centros de acopio activos. Toca un pin para ver el nombre y la ciudad.
                </p>
              </div>
              <DonanteMap centros={data.centros} />
            </section>
          </>
        )}

        {/* CTA donación */}
        <section className="border-t border-border/60 bg-primary/5">
          <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6">
            <h2 className="text-base font-semibold">¿Listo para donar?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Revisa qué falta arriba y lleva tu aporte al centro de acopio más cercano.
              No necesitas crear una cuenta.
            </p>
          </div>
        </section>
      </main>

      <DonanteFooter />
    </div>
  );
}
