"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayOfWeekRow } from "@/lib/dailyService";
import { DAY_ORDER } from "@/lib/dailyService";
import { buildActivityColorMap } from "@/lib/weeklyService";

interface DayOfWeekChartProps {
  data: DayOfWeekRow[]; // one row per school
}

function CustomTooltip({
  active,
  payload,
  label,
  colorMap,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
  colorMap: Record<string, string>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entries = payload.filter((p) => p.value > 0);
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {entries
        .sort((a, b) => b.value - a.value)
        .map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: colorMap[p.name] ?? "#999" }}
            />
            <span className="text-muted-foreground truncate max-w-[160px]">{p.name}:</span>
            <span className="font-medium ml-auto pl-2">{p.value}%</span>
          </div>
        ))}
    </div>
  );
}

export default function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const schools = useMemo(() => data.map((r) => r.school), [data]);
  const colorMap = useMemo(() => buildActivityColorMap(schools), [schools]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Build chart data: one point per day, one key per school
  const chartData = useMemo(() =>
    DAY_ORDER.map((day) => {
      const point: Record<string, string | number> = { day };
      for (const row of data) {
        const stat = row.days[day];
        point[row.school] = stat.possible > 0 ? stat.rate : 0;
      }
      return point;
    }),
    [data]
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Attendance by Day of Week</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggleSchool = (school: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(school)) next.delete(school);
      else next.add(school);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance by Day of Week — % per School</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {schools.map((school) => {
            const isHidden = hidden.has(school);
            return (
              <button
                key={school}
                onClick={() => toggleSchool(school)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${
                  isHidden
                    ? "border-muted text-muted-foreground bg-transparent"
                    : "border-transparent text-white"
                }`}
                style={isHidden ? {} : { backgroundColor: colorMap[school] ?? "#999" }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colorMap[school] ?? "#999", opacity: isHidden ? 0.3 : 1 }}
                />
                {school}
              </button>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <ReferenceLine y={80} stroke="var(--border)" strokeDasharray="4 4" label={{ value: "80%", position: "right", fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip content={<CustomTooltip colorMap={colorMap} />} />
            {schools.map((school) => (
              <Line
                key={school}
                type="monotone"
                dataKey={school}
                stroke={colorMap[school] ?? "#999"}
                strokeWidth={hidden.has(school) ? 0 : 2}
                dot={{ r: hidden.has(school) ? 0 : 4, fill: colorMap[school] ?? "#999" }}
                activeDot={hidden.has(school) ? false : { r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
