import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "warning" && "text-amber-500",
            tone === "danger" && "text-red-500",
            tone === "default" && "text-muted-foreground",
          )}
        />
      </div>
      <p className="stat-value mt-2">{value}</p>
    </div>
  );
}
