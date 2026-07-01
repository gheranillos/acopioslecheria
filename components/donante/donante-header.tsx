import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";

export function DonanteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-brand-navy shadow-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <BrandMark size="sm" showSubtitle={false} variant="inverted" />
        <Link
          href="/login"
          className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:bg-brand-cyan hover:text-white sm:text-sm"
        >
          Acceso equipo
        </Link>
      </div>
      <div className="bg-brand-cyan py-1.5 text-center text-[11px] font-bold uppercase tracking-widest text-white sm:text-xs">
        Ayuda humanitaria · Anzoátegui
      </div>
    </header>
  );
}

export function DonanteFooter() {
  return (
    <footer className="brand-cta-band">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-xs text-white/85 sm:flex-row sm:justify-between sm:text-left">
        <p>Acopios Lechería · Coordinación humanitaria en Anzoátegui</p>
        <Link
          href="/login"
          className="rounded-full border border-white/30 px-3 py-1 font-semibold text-white transition-colors hover:bg-brand-cyan hover:border-brand-cyan"
        >
          Acceso equipo
        </Link>
      </div>
    </footer>
  );
}
