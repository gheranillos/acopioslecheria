import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const supabaseOk = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {!supabaseOk && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Supabase no está configurado</p>
            <p className="mt-1 text-amber-800">
              En Vercel, ve a Settings → Environment Variables y agrega{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> con
              los valores de tu proyecto Supabase. Luego redeploy.
            </p>
          </div>
        )}

        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            AL
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Acopios Lechería
          </h1>
          <p className="text-sm text-muted-foreground">
            Coordinación de ayuda humanitaria — Anzoátegui
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <LoginForm disabled={!supabaseOk} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ¿No tienes cuenta? Contacta al operador del sistema para que te dé acceso.
        </p>
      </div>
    </main>
  );
}
