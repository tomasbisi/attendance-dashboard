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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildActivityColorMap } from "@/lib/weeklyService";
import type { DailyChartPoint } from "@/lib/dailyService";

interface DailyChartProps {
  data: DailyChartPoint[];
  activities: string[];
}

function CustomTooltip({
  active,
  payload,
  label,
  colorMap,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  colorMap: Record<string, string>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entries = payload.filter((p) => p.value !== undefined);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-semibold mb-1 text-foreground">Week of {label}</p>
      {entries.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: colorMap[p.name] ?? p.color }}
          />
          <span className="text-muted-foreground truncate max-w-[160px]">{p.name}:</span>
          <span className="font-medium ml-auto pl-2">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function DailyChart({ data, activities }: DailyChartProps) {
  const colorMap = useMemo(() => buildActivityColorMap(activities), [activities]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const toggleActivity = (act: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(act)) next.delete(act);
      else next.add(act);
      return next;
    });
  };

  if (data.length === 0 || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Attendance Trend — % per Week</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {activities.map((act) => {
            const isHidden = hidden.has(act);
            return (
              <button
                key={act}
                onClick={() => toggleActivity(act)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${
                  isHidden
                    ? "border-muted text-muted-foreground bg-transparent"
                    : "border-transparent text-white"
                }`}
                style={isHidden ? {} : { backgroundColor: colorMap[act] ?? "#999" }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: colorMap[act] ?? "#999",
                    opacity: isHidden ? 0.3 : 1,
                  }}
                />
                {act}
              </button>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              angle={-40}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip colorMap={colorMap} />} />
            {activities.map((act) => (
              <Line
                key={act}
                type="monotone"
                dataKey={act}
                stroke={colorMap[act] ?? "#999"}
                strokeWidth={hidden.has(act) ? 0 : 2}
                dot={{ r: hidden.has(act) ? 0 : 3, fill: colorMap[act] ?? "#999" }}
                activeDot={hidden.has(act) ? false : { r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
