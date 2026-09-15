import { Info } from "lucide-react";

export function InsufficientData({ reason }: { reason: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-surface-2/50 px-3 py-2.5 text-xs text-muted">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{reason}</span>
    </div>
  );
}
