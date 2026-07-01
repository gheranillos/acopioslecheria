import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo-acopios-lecheria.png";
const ISOTIPO_SRC = "/isotipo-acopios-lecheria.png";

export function BrandMark({
  size = "md",
  showSubtitle = false,
  layout = "row",
  variant = "default",
  mark = "full",
  className,
}: {
  size?: "sm" | "md" | "lg";
  /** Muestra "Anzoátegui" bajo el logo (el PNG ya incluye el nombre). */
  showSubtitle?: boolean;
  layout?: "row" | "stacked";
  /** default = fondo claro; inverted = sobre azul marino/cian (blend para quitar el negro del PNG) */
  variant?: "default" | "inverted";
  /** full = logo completo; isotipo = símbolo compacto (header, favicon) */
  mark?: "full" | "isotipo";
  className?: string;
}) {
  const sizes = {
    sm: {
      image: mark === "isotipo" ? "h-9 w-9" : "h-9 w-auto max-w-[7.5rem]",
      subtitle: "text-[10px]",
    },
    md: {
      image: mark === "isotipo" ? "h-11 w-11" : "h-11 w-auto max-w-[9rem]",
      subtitle: "text-[11px]",
    },
    lg: {
      image: mark === "isotipo" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-28 w-auto max-w-[14rem] sm:h-32",
      subtitle: "text-sm",
    },
  }[size];

  const inverted = variant === "inverted";
  const src = mark === "isotipo" ? ISOTIPO_SRC : LOGO_SRC;

  return (
    <div
      className={cn(
        layout === "stacked"
          ? "flex flex-col items-center gap-2 text-center"
          : "flex items-center gap-2.5",
        className,
      )}
    >
      <Image
        src={src}
        alt="Acopios Lechería"
        width={mark === "isotipo" ? 128 : 320}
        height={mark === "isotipo" ? 128 : 400}
        priority={size === "lg"}
        className={cn(
          "shrink-0 object-contain",
          mark === "isotipo" ? "object-center" : "object-left",
          sizes.image,
          inverted && "mix-blend-screen",
        )}
      />
      {showSubtitle && (
        <p
          className={cn(
            "font-semibold uppercase tracking-[0.2em]",
            sizes.subtitle,
            layout === "stacked" ? "text-center" : "leading-none",
            inverted ? "text-white/75" : "text-muted-foreground",
          )}
        >
          Anzoátegui
        </p>
      )}
    </div>
  );
}
