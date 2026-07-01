import { redirect } from "next/navigation";
import { Heart, MapPin, Package } from "lucide-react";
import { DonanteFooter, DonanteHeader } from "@/components/donante/donante-header";
import { DonanteMap } from "@/components/donante/donante-map";
import { DonanteCentroNecesidades } from "@/components/donante/donante-centro-necesidades";
import { DonanteZonaRow } from "@/components/donante/donante-zona-row";
import { getUsuarioActual } from "@/lib/auth/session";
import { countNecesidadesDonante, getDonanteData } from "@/lib/data/public-queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  const actual = await getUsuarioActual();
  if (actual) redirect("/dashboard");

  const supabaseOk = isSupabaseConfigured();
  const { data, meta } = supabaseOk ? await getDonanteData() : { data: null, meta: { posibleConfigPendiente: false } };

  const sinDatosPublicos =
    supabaseOk &&
    data &&
    data.centros.length === 0 &&
    data.zonas.length === 0 &&
    data.necesidadesPorCentro.length === 0;

  return (
    <div className="surface-paper flex min-h-screen flex-col">
      <DonanteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="brand-hero">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-2xl text-center">
              <span className="brand-pill bg-white/15 text-white backdrop-blur-sm">
                Coordinación de ayuda
              </span>
              <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight sm:text-4xl">
                Tu donación llega donde hace falta
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/90 sm:text-base">
                Aquí puedes ver qué necesitan las comunidades afectadas y dónde llevar
                tu aporte. Los centros de acopio coordinan la entrega a las zonas de
                refugio.
              </p>
            </div>

            {data && (
              <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 sm:max-w-xl">
                <div className="brand-stat-card">
                  <Package className="mx-auto h-5 w-5 text-brand-cyan" />
                  <p className="stat-number">{countNecesidadesDonante(data)}</p>
                  <p className="stat-label">Necesidades activas</p>
                </div>
                <div className="brand-stat-card">
                  <Heart className="mx-auto h-5 w-5 text-brand-cyan" />
                  <p className="stat-number">{data.zonas.length}</p>
                  <p className="stat-label">Zonas de refugio</p>
                </div>
                <div className="brand-stat-card">
                  <MapPin className="mx-auto h-5 w-5 text-brand-cyan" />
                  <p className="stat-number">{data.centros.length}</p>
                  <p className="stat-label">Centros de acopio</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {sinDatosPublicos && (
          <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
              <p className="font-medium">No se pudieron cargar los datos públicos</p>
              <p className="mt-1 leading-relaxed text-amber-900/90">
                Si ya tienes centros y zonas en el panel operativo, ejecuta en Supabase →
                SQL Editor el archivo{" "}
                <code className="font-mono text-xs">supabase/migrate-public-donante-read.sql</code>.
                Eso habilita la lectura pública del home donante. Luego recarga esta página.
              </p>
              {meta.errorConsulta && (
                <p className="mt-2 font-mono text-xs text-amber-800/90">{meta.errorConsulta}</p>
              )}
            </div>
          </div>
        )}

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
                <h2 className="brand-section-title">Qué se necesita ahora</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Publicado por los centros de acopio. Lleva tu aporte al centro indicado;
                  ellos coordinan la entrega a las comunidades.
                </p>
              </div>

              {data.necesidadesPorCentro.length === 0 ? (
                <p className="rounded-xl border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay necesidades abiertas en este momento. ¡Gracias por tu interés en
                  ayudar!
                </p>
              ) : (
                <ul className="space-y-6">
                  {data.necesidadesPorCentro.map((grupo) => (
                    <li key={grupo.centro.id}>
                      <DonanteCentroNecesidades grupo={grupo} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Zonas */}
            <section className="border-y border-border/60 bg-muted/10">
              <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
                <div className="mb-6">
                  <h2 className="brand-section-title">Estado de las zonas</h2>
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
                <h2 className="brand-section-title">Dónde donar</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Centros de acopio activos. Toca un pin para ver el nombre y la ciudad.
                </p>
              </div>
              <DonanteMap centros={data.centros} />
            </section>
          </>
        )}

        {/* CTA donación */}
        <section className="bg-secondary py-10">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-brand-navy">
              ¿Listo para donar?
            </h2>
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
