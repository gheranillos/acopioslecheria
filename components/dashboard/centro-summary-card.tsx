import Link from "next/link";
import { Boxes, ChevronRight, MapPin, Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CentroConDetalle } from "@/types";

export function CentroSummaryCard({ centro }: { centro: CentroConDetalle }) {
  const totalItems = centro.depositos.reduce(
    (acc, d) => acc + d.inventario.length,
    0,
  );

  return (
    <Link href={`/mapa?centro=${centro.id}`} className="block">
      <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/40">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-base">{centro.nombre}</CardTitle>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {centro.ciudad}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5" />
            {centro.depositos.length}{" "}
            {centro.depositos.length === 1 ? "depósito" : "depósitos"}
          </span>
          <span className="flex items-center gap-1.5">
            <Boxes className="h-3.5 w-3.5" />
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {centro.zonas.length} {centro.zonas.length === 1 ? "zona" : "zonas"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
