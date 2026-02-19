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
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import type { ActivitySummary } from "@/lib/dataService";

interface ActivityChartProps {
  data: ActivitySummary[];
}

const COLORS = ["#3e8ccc", "#e81e76", "#53b078", "#fd7723", "#c652ff", "#13c8ae", "#284ae3", "#daba00"];

export default function ActivityChart({ data }: ActivityChartProps) {
  const [metric, setMetric] = useState<"enrollmentRate" | "avgAttendanceRate">("enrollmentRate");

  const chartData = data.map((d) => ({
    name: d.activity,
    value: metric === "enrollmentRate" ? d.enrollmentRate : d.avgAttendanceRate,
    enrolled: d.enrolled,
    totalStudents: d.totalStudents,
    enrollmentRate: d.enrollmentRate,
    avgAttendanceRate: d.avgAttendanceRate,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Performance</CardTitle>
        <div className="flex gap-2">
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
                  if (metric === "enrollmentRate") {
                    return [
                      [`${value}%`, "Enrollment Rate"],
                      [`${d.enrolled} / ${d.totalStudents}`, "Enrolled / Total"],
                    ].flat();
                  }
                  return [`${value}%`, "Avg Attendance Rate"];
                }}
              />
              <Legend
                verticalAlign="top"
                formatter={() =>
                  metric === "enrollmentRate" ? "Enrollment Rate %" : "Avg Attendance Rate %"
                }
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
