import { cn } from "@/lib/utils";
import type { CheckinZone } from "@/lib/calculations/fatigue";

const ZONE_STYLES: Record<CheckinZone, string> = {
  GREEN: "bg-zone-green/15 text-zone-green border-zone-green/30",
  YELLOW: "bg-zone-yellow/15 text-zone-yellow border-zone-yellow/30",
  ORANGE: "bg-zone-orange/15 text-zone-orange border-zone-orange/30",
  RED: "bg-zone-red/15 text-zone-red border-zone-red/30",
};

const ZONE_EMOJI: Record<CheckinZone, string> = { GREEN: "🟢", YELLOW: "🟡", ORANGE: "🟠", RED: "🔴" };
const ZONE_LABEL: Record<CheckinZone, string> = { GREEN: "Verde", YELLOW: "Amarillo", ORANGE: "Naranja", RED: "Rojo" };

export function ZoneBadge({ zone, className }: { zone: CheckinZone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium", ZONE_STYLES[zone], className)}>
      <span>{ZONE_EMOJI[zone]}</span>
      <span>{ZONE_LABEL[zone]}</span>
    </span>
  );
}
