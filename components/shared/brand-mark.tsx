import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo-acopios-lecheria.png";

export function BrandMark({
  size = "md",
  showSubtitle = false,
  layout = "row",
  variant = "default",
  className,
}: {
  size?: "sm" | "md" | "lg";
  /** Muestra "Anzoátegui" bajo el logo (el PNG ya incluye el nombre). */
  showSubtitle?: boolean;
  layout?: "row" | "stacked";
  /** default = fondo claro; inverted = sobre azul marino/cian (blend para quitar el negro del PNG) */
  variant?: "default" | "inverted";
  className?: string;
}) {
  const sizes = {
    sm: { image: "h-9 w-auto max-w-[7.5rem]", subtitle: "text-[10px]" },
    md: { image: "h-11 w-auto max-w-[9rem]", subtitle: "text-[11px]" },
    lg: { image: "h-28 w-auto max-w-[14rem] sm:h-32", subtitle: "text-sm" },
  }[size];

  const inverted = variant === "inverted";

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
        src={LOGO_SRC}
        alt="Acopios Lechería"
        width={320}
        height={400}
        priority={size === "lg"}
        className={cn(
          "shrink-0 object-contain object-left",
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
