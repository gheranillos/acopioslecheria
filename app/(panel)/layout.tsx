import { requireUsuario } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { perfil } = await requireUsuario();

  return <AppShell perfil={perfil}>{children}</AppShell>;
}
