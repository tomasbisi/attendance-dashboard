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
import type { SchoolSummary } from "@/lib/dataService";

interface AttendanceChartProps {
  schoolData: SchoolSummary[];
}

export default function AttendanceChart({ schoolData }: AttendanceChartProps) {
  const data = schoolData.map((s) => ({
    name: s.school,
    "Avg Attendance %": s.avgAttendanceRate,
    Students: s.totalStudents,
    "Avg Last 5": s.avgLast5,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance by School</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
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
                yAxisId="rate"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="students"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value, name) => {
                  const v = value as number;
                  if (name === "Avg Attendance %") return [`${v}%`, name];
                  return [v, String(name)];
                }}
              />
              <Legend verticalAlign="top" />
              <Bar yAxisId="rate" dataKey="Avg Attendance %" fill="#3e8ccc" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="students" dataKey="Students" fill="#cce8ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
