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

interface DistrictSchoolChartProps {
  data: SchoolSummary[];
}

export default function DistrictSchoolChart({ data }: DistrictSchoolChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.avgAttendanceRate - a.avgAttendanceRate)
    .map((d) => ({
      name: d.school,
      "Avg Attendance": d.avgAttendanceRate,
      "Enrollment Rate": d.enrollmentRate,
      enrolled: d.enrolled,
      totalStudents: d.totalStudents,
    }));

  const chartHeight = Math.max(320, chartData.length * 48 + 80);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance &amp; Enrollment by School</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                angle={-30}
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
                  if (name === "Enrollment Rate") {
                    return [`${value}%  (${d.enrolled} / ${d.totalStudents} students)`, String(name)];
                  }
                  return [`${value}%`, String(name)];
                }}
              />
              <Legend verticalAlign="top" />
              <Bar dataKey="Avg Attendance" fill="#3e8ccc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Enrollment Rate" fill="#c652ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
