import {
  LayoutDashboard,
  Map,
  Boxes,
  ClipboardList,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { RolUsuario } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Si se omite, el item es visible para todos los roles. */
  roles?: RolUsuario[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mapa", label: "Mapa", icon: Map },
  {
    href: "/inventario",
    label: "Inventario",
    icon: Boxes,
    roles: ["operador", "jefe_centro", "logistica"],
  },
  { href: "/necesidades", label: "Necesidades", icon: ClipboardList },
  {
    href: "/cobertura",
    label: "Cobertura",
    icon: Share2,
    roles: ["operador", "jefe_centro"],
  },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: ["operador"] },
];

export function navItemsParaRol(rol: RolUsuario): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(rol));
}
