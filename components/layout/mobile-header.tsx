"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { logout } from "@/app/login/actions";
import { ETIQUETA_ROL } from "@/lib/auth/roles";
import { navItemsParaRol } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Perfil } from "@/types";

export function MobileHeader({
  perfil,
  className,
}: {
  perfil: Perfil;
  className?: string;
}) {
  const pathname = usePathname();
  const items = navItemsParaRol(perfil.rol);

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          AL
        </div>
        <span className="text-sm font-semibold">Acopios Lechería</span>
      </div>

      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              className="h-11 w-11"
            >
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent side="right" className="flex w-72 flex-col gap-0">
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>

          <div className="mx-4 rounded-lg bg-muted px-3 py-2.5">
            <p className="truncate text-sm font-medium">
              {perfil.nombre_completo}
            </p>
            <p className="text-xs text-muted-foreground">
              {ETIQUETA_ROL[perfil.rol]}
            </p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <SheetClose
                  key={item.href}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  }
                />
              );
            })}
          </nav>

          <div className="border-t p-4">
            <form action={logout}>
              <Button
                type="submit"
                variant="outline"
                className="h-12 w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
