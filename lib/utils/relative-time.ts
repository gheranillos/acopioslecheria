import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/** Ej: "hace 3 horas" */
export function tiempoRelativo(fecha: string | Date) {
  return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es });
}

/** Una zona se considera con dato desactualizado si no se actualiza en más de `horas`. */
export function esDatoDesactualizado(fecha: string | Date, horas = 24) {
  const diffMs = Date.now() - new Date(fecha).getTime();
  return diffMs > horas * 60 * 60 * 1000;
}
