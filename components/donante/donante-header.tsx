import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";

export function DonanteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <BrandMark size="sm" showSubtitle={false} />
        <Link
          href="/login"
          className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-sm"
        >
          Acceso equipo
        </Link>
      </div>
    </header>
  );
}

export function DonanteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>Acopios Lechería · Coordinación humanitaria en Anzoátegui</p>
        <Link
          href="/login"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Acceso equipo
        </Link>
      </div>
    </footer>
  );
}
