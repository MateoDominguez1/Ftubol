import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  trend?: "up" | "down" | "flat" | null;
  trendGood?: boolean; // si trend "up" es bueno o malo, para colorear
  className?: string;
}

export function StatTile({ label, value, sublabel, trend, trendGood = true, className }: StatTileProps) {
  const trendColor =
    trend == null || trend === "flat"
      ? "text-muted-2"
      : (trend === "up") === trendGood
        ? "text-zone-green"
        : "text-zone-red";

  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-xs text-muted">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-semibold tabular-nums">{value}</span>
        {trend ? <TrendIcon className={cn("h-3.5 w-3.5", trendColor)} /> : null}
      </div>
      {sublabel ? <span className="text-[11px] text-muted-2">{sublabel}</span> : null}
    </div>
  );
}
