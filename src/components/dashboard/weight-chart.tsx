"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface WeightChartPoint {
  date: string;
  daily: number | null;
  rollingAvg: number | null;
}

export function WeightChart({ data }: { data: WeightChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-2)" }} />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11, fill: "var(--muted-2)" }} />
        <Tooltip
          contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
        />
        <Line type="monotone" dataKey="daily" stroke="var(--muted-2)" strokeWidth={1.5} dot={{ r: 2 }} name="Peso diario" connectNulls />
        <Line type="monotone" dataKey="rollingAvg" stroke="var(--brand)" strokeWidth={2.5} dot={false} name="Promedio 7 días" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
