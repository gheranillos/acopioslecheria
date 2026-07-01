import type { RolUsuario } from "@/types";

/**
 * Reglas de permisos del lado del cliente, usadas solo para mostrar/ocultar UI.
 * La fuente de verdad real son las políticas RLS en Supabase (ver supabase/policies.sql);
 * estas funciones nunca deben ser el único mecanismo de protección de datos.
 */

export function veTodosLosCentros(rol: RolUsuario) {
  return rol === "operador";
}

export function puedeGestionarUsuarios(rol: RolUsuario) {
  return rol === "operador";
}

export function puedeGestionarCentros(rol: RolUsuario) {
  return rol === "operador";
}

export function puedeCrearEntidades(rol: RolUsuario) {
  return rol === "operador" || rol === "jefe_centro";
}

export function puedeEliminarEntidades(rol: RolUsuario) {
  return rol === "operador" || rol === "jefe_centro";
}

export function puedeEditarInventario(rol: RolUsuario) {
  return rol === "operador" || rol === "jefe_centro" || rol === "logistica";
}

export function puedeEditarEstadoNecesidad(rol: RolUsuario) {
  return (
    rol === "operador" ||
    rol === "jefe_centro" ||
    rol === "logistica" ||
    rol === "voluntario"
  );
}

export function puedeGestionarCobertura(rol: RolUsuario) {
  return rol === "operador" || rol === "jefe_centro";
}

export function puedeEditarEstadoZona(rol: RolUsuario) {
  return rol === "operador" || rol === "jefe_centro";
}

export function esSoloLectura(rol: RolUsuario) {
  return rol === "voluntario";
}

export const ETIQUETA_ROL: Record<RolUsuario, string> = {
  operador: "Operador",
  jefe_centro: "Jefe de centro de acopio",
  logistica: "Encargado de logística",
  voluntario: "Voluntario",
};
