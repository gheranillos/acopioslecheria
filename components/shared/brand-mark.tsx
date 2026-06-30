import { cn } from "@/lib/utils";

export function BrandMark({
  size = "md",
  showSubtitle = true,
  layout = "row",
  className,
}: {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  layout?: "row" | "stacked";
  className?: string;
}) {
  const sizes = {
    sm: {
      mark: "h-8 w-8 text-sm",
      title: "text-base",
      subtitle: "text-[11px]",
    },
    md: {
      mark: "h-10 w-10 text-base",
      title: "text-xl",
      subtitle: "text-xs",
    },
    lg: {
      mark: "h-14 w-14 text-xl",
      title: "text-3xl",
      subtitle: "text-sm",
    },
  }[size];

  return (
    <div
      className={cn(
        layout === "stacked"
          ? "flex flex-col items-center gap-3 text-center"
          : "flex items-center gap-3",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground",
          sizes.mark,
        )}
        aria-hidden
      >
        AL
      </div>
      <div className="min-w-0 leading-tight">
        <p className={cn("font-semibold tracking-tight", sizes.title)}>
          Acopios Lechería
        </p>
        {showSubtitle && (
          <p className={cn("text-muted-foreground", sizes.subtitle)}>Anzoátegui</p>
        )}
      </div>
    </div>
  );
}
