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
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm ring-1 ring-brand-cyan/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-navy/70">
          {label}
        </span>
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "warning" && "text-brand-orange",
            tone === "danger" && "text-red-500",
            tone === "default" && "text-brand-cyan",
          )}
        />
      </div>
      <p className="stat-value mt-2">{value}</p>
    </div>
  );
}
