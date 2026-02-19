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
import type { CategorySummary } from "@/lib/dataService";

interface CategoryChartProps {
  data: CategorySummary[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = [...data]
    .sort((a, b) => b.enrollmentRate - a.enrollmentRate)
    .map((d) => ({
      name: d.category,
      "Enrollment Rate": d.enrollmentRate,
      "Avg Attendance": d.avgAttendanceRate,
      enrolled: d.enrolled,
      totalStudents: d.totalStudents,
    }));

  const chartHeight = Math.max(320, chartData.length * 48 + 80);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data to display
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
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
                  if (name === "Enrollment Rate") {
                    return [`${value}%  (${d.enrolled} / ${d.totalStudents} students)`, String(name)];
                  }
                  return [`${value}%`, String(name)];
                }}
              />
              <Legend verticalAlign="top" />
              <Bar dataKey="Enrollment Rate" fill="#3e8ccc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Avg Attendance" fill="#53b078" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
