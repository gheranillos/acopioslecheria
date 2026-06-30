"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Perfil } from "@/types";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AppShell({
  perfil,
  children,
}: {
  perfil: Perfil;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // El mapa ocupa toda la pantalla en móvil (sin chrome); el botón flotante
  // de "volver al panel" vive dentro de la propia página del mapa.
  const mapaFullBleed = pathname?.startsWith("/mapa") ?? false;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 surface-paper md:flex-row">
      <Sidebar perfil={perfil} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MobileHeader perfil={perfil} className={cn(mapaFullBleed && "hidden")} />
        <main
          className={cn(
            "min-h-0 min-w-0 flex-1",
            mapaFullBleed ? "overflow-hidden p-0" : "p-4 pb-24 md:p-6 md:pb-6",
          )}
        >
          {children}
        </main>
      </div>
      <MobileBottomNav perfil={perfil} className={cn(mapaFullBleed && "hidden")} />
    </div>
  );
}
