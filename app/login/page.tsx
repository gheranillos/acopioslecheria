import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/shared/brand-mark";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const supabaseOk = isSupabaseConfigured();

  return (
    <main className="surface-paper flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        {!supabaseOk && (
          <div className="rounded-md border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">Supabase no está configurado</p>
            <p className="mt-1 leading-relaxed text-amber-900/90">
              En Vercel, ve a Settings → Environment Variables y agrega{" "}
              <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        )}

        <div className="space-y-3 text-center">
          <BrandMark size="lg" layout="stacked" />
          <p className="mx-auto max-w-xs text-[15px] leading-relaxed text-muted-foreground">
            Coordinación de ayuda humanitaria en Anzoátegui
          </p>
        </div>

        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardContent className="pt-7">
            <LoginForm disabled={!supabaseOk} />
          </CardContent>
        </Card>

        <p className="text-center text-xs leading-relaxed tracking-wide text-muted-foreground">
          ¿No tienes cuenta? Contacta al operador del sistema para que te dé acceso.
        </p>
      </div>
    </main>
  );
}
