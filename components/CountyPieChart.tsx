"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CountySummary } from "@/lib/dataService";

interface CountyPieChartProps {
  data: CountySummary[];
}

const COLORS = [
  "#3e8ccc", "#e81e76", "#53b078", "#fd7723",
  "#c652ff", "#13c8ae", "#284ae3", "#daba00",
];

const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
}) => {
  if (cx === undefined || cy === undefined || midAngle === undefined ||
      innerRadius === undefined || outerRadius === undefined || percent === undefined) return null;
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CountyPieChart({ data }: CountyPieChartProps) {
  const studentData = data.map((d) => ({
    name: d.county,
    value: d.totalStudents,
    avgAttendanceRate: d.avgAttendanceRate,
  }));

  const attendanceData = data.map((d) => ({
    name: d.county,
    value: d.avgAttendanceRate,
    totalStudents: d.totalStudents,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students by County</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data to display
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Students distribution */}
            <div>
              <p className="text-sm font-medium text-center text-muted-foreground mb-2">Student Distribution</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={studentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {studentData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const d = props.payload;
                      return [
                        [`${value} students`, "Total"],
                        [`${d.avgAttendanceRate}%`, "Avg Attendance"],
                      ].flat();
                    }}
                  />
                  <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Attendance % distribution */}
            <div>
              <p className="text-sm font-medium text-center text-muted-foreground mb-2">Attendance % by County</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {attendanceData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const d = props.payload;
                      return [
                        [`${value}%`, "Avg Attendance Rate"],
                        [`${d.totalStudents} students`, "Total"],
                      ].flat();
                    }}
                  />
                  <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
