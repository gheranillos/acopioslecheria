import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
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
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ¿No tienes cuenta? Contacta al operador del sistema para que te dé acceso.
        </p>
      </div>
    </main>
  );
}
