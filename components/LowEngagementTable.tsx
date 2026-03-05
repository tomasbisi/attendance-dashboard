"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { SchoolSummary } from "@/lib/dataService";

interface LowEngagementTableProps {
  data: SchoolSummary[];
}

function RateCell({ value }: { value: number }) {
  const low = value <= 10;
  return (
    <Badge variant={low ? "destructive" : "secondary"} className="text-xs">
      {value}%
    </Badge>
  );
}

export default function LowEngagementTable({ data }: LowEngagementTableProps) {
  const lowSchools = data
    .filter((s) => s.enrollmentRate <= 10 || s.avgAttendanceRate <= 10)
    .sort((a, b) => (a.enrollmentRate + a.avgAttendanceRate) - (b.enrollmentRate + b.avgAttendanceRate));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <CardTitle>Low Enrollment &amp; Attendance (0–10%)</CardTitle>
        {lowSchools.length > 0 && (
          <Badge variant="destructive" className="text-xs ml-1">{lowSchools.length} school{lowSchools.length !== 1 ? "s" : ""}</Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {lowSchools.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No schools with 0–10% enrollment or attendance
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-left">School</th>
                  <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right">Total Students</th>
                  <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right">Enrolled</th>
                  <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right">Enrollment %</th>
                  <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {lowSchools.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-medium">{s.school}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{s.totalStudents}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{s.enrolled}</td>
                    <td className="px-4 py-2 text-right"><RateCell value={s.enrollmentRate} /></td>
                    <td className="px-4 py-2 text-right"><RateCell value={Math.round(s.avgAttendanceRate)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
