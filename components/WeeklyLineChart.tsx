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
import type { WeeklyRecord, WeeklyMetric } from "@/lib/weeklyService";
import { getMetricValue, getMetricLabel, isPercentMetric, buildActivityColorMap } from "@/lib/weeklyService";

interface WeeklyLineChartProps {
  data: WeeklyRecord[];
  metric: WeeklyMetric;
  weekFrom: number;
  weekTo: number;
}

// Aggregate records by activity, averaging metric per week
function buildChartData(
  records: WeeklyRecord[],
  metric: WeeklyMetric,
  weekFrom: number,
  weekTo: number,
): { points: Record<string, string | number>[]; activities: string[] } {
  if (records.length === 0) return { points: [], activities: [] };

  const activities = Array.from(new Set(records.map((r) => r.activity))).sort();
  const allWeeks = records[0].weeks;
  const visibleWeeks = allWeeks.slice(weekFrom, weekTo + 1);

  const points = visibleWeeks.map((_, wi) => {
    const actualWi = weekFrom + wi;
    const point: Record<string, string | number> = {
      week: allWeeks[actualWi]?.weekLabel ?? `W${actualWi + 1}`,
    };
    activities.forEach((act) => {
      const actRecords = records.filter((r) => r.activity === act);
      if (actRecords.length === 0) {
        point[act] = 0;
        return;
      }
      const vals = actRecords.map((r) => getMetricValue(r.weeks[actualWi] ?? r.weeks[0], metric));
      point[act] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    });
    return point;
  });

  return { points, activities };
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
  colorMap,
  isPct,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  colorMap: Record<string, string>;
  isPct: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entries = payload.filter((p) => p.value !== 0 && p.value !== undefined);
  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {entries.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colorMap[p.name] ?? p.color }} />
          <span className="text-muted-foreground truncate max-w-[160px]">{p.name}:</span>
          <span className="font-medium ml-auto pl-2">
            {isPct ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyLineChart({ data, metric, weekFrom, weekTo }: WeeklyLineChartProps) {
  const { points, activities } = useMemo(
    () => buildChartData(data, metric, weekFrom, weekTo),
    [data, metric, weekFrom, weekTo],
  );

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

  const isPct = isPercentMetric(metric);
  const metricLabel = getMetricLabel(metric);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Weekly Trend Chart</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(300, activities.length * 24 + 200);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trend — {metricLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Custom legend */}
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
                  style={{ backgroundColor: colorMap[act] ?? "#999", opacity: isHidden ? 0.3 : 1 }}
                />
                {act}
              </button>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={points} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              angle={-40}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => (isPct ? `${v}%` : String(v))}
              domain={isPct ? [0, 100] : ["auto", "auto"]}
            />
            <Tooltip
              content={
                <CustomTooltip colorMap={colorMap} isPct={isPct} />
              }
            />
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
