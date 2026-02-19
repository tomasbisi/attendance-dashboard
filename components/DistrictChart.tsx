"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import type { DistrictSummary } from "@/lib/dataService";

interface DistrictChartProps {
  data: DistrictSummary[];
}

export default function DistrictChart({ data }: DistrictChartProps) {
  const [metric, setMetric] = useState<"avgAttendanceRate" | "enrollmentRate">("avgAttendanceRate");

  const chartData = [...data]
    .sort((a, b) => b[metric] - a[metric])
    .map((d) => ({
      name: d.district,
      value: d[metric],
      totalStudents: d.totalStudents,
      enrolled: d.enrolled,
      avgAttendanceRate: d.avgAttendanceRate,
      enrollmentRate: d.enrollmentRate,
    }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>District Comparison</CardTitle>
        <div className="flex gap-2">
          <button
            onClick={() => setMetric("avgAttendanceRate")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              metric === "avgAttendanceRate"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Attendance Rate
          </button>
          <button
            onClick={() => setMetric("enrollmentRate")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              metric === "enrollmentRate"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Enrollment Rate
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  const d = props.payload;
                  if (metric === "avgAttendanceRate") return [`${value}%`, "Avg Attendance Rate"];
                  return [
                    [`${value}%`, "Enrollment Rate"],
                    [`${d.enrolled} / ${d.totalStudents}`, "Enrolled / Total"],
                  ].flat();
                }}
              />
              <Legend
                verticalAlign="top"
                formatter={() =>
                  metric === "avgAttendanceRate" ? "Avg Attendance Rate %" : "Enrollment Rate %"
                }
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
