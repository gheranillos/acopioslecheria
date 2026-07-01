import { MapPin, Warehouse } from "lucide-react";
import { DonanteNecesidadCard } from "@/components/donante/donante-necesidad-card";
import type { CentroNecesidadesDonante } from "@/lib/data/public-queries";

export function DonanteCentroNecesidades({ grupo }: { grupo: CentroNecesidadesDonante }) {
  const { centro, necesidades } = grupo;

  return (
    <div className="rounded-2xl border border-brand-cyan/20 bg-card/50 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
          <Warehouse className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-brand-navy">{centro.nombre}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {centro.ciudad} · Lleva tu donación aquí
          </p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {necesidades.map((n) => (
          <li key={n.id}>
            <DonanteNecesidadCard necesidad={n} />
          </li>
        ))}
      </ul>
    </div>
  );
}
