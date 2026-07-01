"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItemsParaRol } from "@/lib/nav";
import type { Perfil } from "@/types";

export function MobileBottomNav({
  perfil,
  className,
}: {
  perfil: Perfil;
  className?: string;
}) {
  const pathname = usePathname();
  const items = navItemsParaRol(perfil.rol).slice(0, 5);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-white/95 shadow-[0_-4px_20px_rgba(0,29,61,0.08)] backdrop-blur md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
              active ? "text-brand-cyan" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
