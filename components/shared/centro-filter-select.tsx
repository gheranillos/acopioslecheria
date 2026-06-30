"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CentroAcopio } from "@/types";

export function CentroFilterSelect({
  centros,
  valorActual,
}: {
  centros: CentroAcopio[];
  valorActual?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todos") {
      params.delete("centro");
    } else {
      params.set("centro", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Select value={valorActual ?? "todos"} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full sm:w-64">
        <SelectValue placeholder="Todos los centros" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos los centros</SelectItem>
        {centros.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
