import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/auth/session";

export default async function RootPage() {
  const actual = await getUsuarioActual();
  redirect(actual ? "/dashboard" : "/login");
}
