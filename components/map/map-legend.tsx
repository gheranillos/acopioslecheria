export function MapLegend() {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[1000] rounded-lg border bg-background/95 p-3 text-xs shadow-md backdrop-blur">
      <p className="mb-1.5 font-semibold">Leyenda</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-brand-cyan" />
          Centro de acopio
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#16a34a]" />
          Zona abastecida
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#d97706]" />
          Zona parcial
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#dc2626]" />
          Zona no abastecida
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border-2 border-dashed border-amber-500" />
          Dato desactualizado (+24h)
        </div>
      </div>
    </div>
  );
}
