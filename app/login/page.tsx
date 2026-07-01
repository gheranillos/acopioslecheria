import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/shared/brand-mark";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const supabaseOk = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="brand-hero px-4 py-10 text-center sm:py-12">
        <BrandMark size="lg" layout="stacked" variant="inverted" />
        <p className="mx-auto mt-4 max-w-sm text-sm text-white/90">
          Acceso para operadores, jefes de centro, logística y voluntarios.
        </p>
      </div>

      <div className="surface-paper flex flex-1 flex-col items-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          {!supabaseOk && (
            <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm text-brand-navy">
              <p className="font-bold">Supabase no está configurado</p>
              <p className="mt-1 leading-relaxed opacity-90">
                En Vercel, agrega{" "}
                <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
                <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </p>
            </div>
          )}

          <Card className="overflow-hidden rounded-2xl border-0 shadow-lg ring-1 ring-brand-cyan/20">
            <div className="bg-brand-cyan px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-white">
              Iniciar sesión
            </div>
            <CardContent className="pt-6">
              <LoginForm disabled={!supabaseOk} />
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            <Link
              href="/"
              className="font-semibold text-brand-cyan underline-offset-4 hover:underline"
            >
              ← Volver al inicio para donantes
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
