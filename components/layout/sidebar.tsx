"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { BrandMark } from "@/components/shared/brand-mark";
import { ETIQUETA_ROL } from "@/lib/auth/roles";
import { navItemsParaRol } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Perfil } from "@/types";

export function Sidebar({ perfil }: { perfil: Perfil }) {
  const pathname = usePathname();
  const items = navItemsParaRol(perfil.rol);

  return (
    <aside className="hidden bg-sidebar text-sidebar-foreground md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-sidebar-border">
      <div className="flex h-[4.25rem] items-center border-b border-sidebar-border px-5">
        <BrandMark size="sm" variant="inverted" className="items-start" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 rounded-xl bg-sidebar-accent px-3 py-2">
          <p className="truncate text-[15px] font-medium text-white">{perfil.nombre_completo}</p>
          <p className="text-xs text-white/70">{ETIQUETA_ROL[perfil.rol]}</p>
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-white/75 hover:bg-sidebar-accent hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
