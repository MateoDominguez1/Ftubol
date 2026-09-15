import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number; // 0-100
  label: string;
  size?: number;
  colorVar?: string; // css var, e.g. "var(--brand)"
  className?: string;
}

export function ScoreRing({ value, label, size = 132, colorVar = "var(--brand)", className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--surface-2)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorVar}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tabular-nums">{Math.round(clamped)}</span>
        <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      </div>
    </div>
  );
}
