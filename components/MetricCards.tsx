"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertTriangle, CalendarCheck } from "lucide-react";

interface MetricCardsProps {
  totalStudents: number;
  enrolled: number;
  avgAttendanceRate: number;
  atRisk: number;
  avgLast5: number;
}

export default function MetricCards({
  totalStudents,
  enrolled,
  avgAttendanceRate,
  atRisk,
  avgLast5,
}: MetricCardsProps) {
  const rateColor =
    avgAttendanceRate >= 80
      ? "text-[#53b078]"
      : avgAttendanceRate >= 60
      ? "text-[#d97706]"
      : "text-destructive";

  const rateBadge =
    avgAttendanceRate >= 80
      ? "default"
      : avgAttendanceRate >= 60
      ? "secondary"
      : "destructive";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Total Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Students
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalStudents.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {enrolled} currently enrolled
          </p>
        </CardContent>
      </Card>

      {/* Avg Attendance Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Attendance Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${rateColor}`}>{avgAttendanceRate}%</div>
          <Badge variant={rateBadge} className="mt-2 text-xs">
            {avgAttendanceRate >= 80
              ? "On Track"
              : avgAttendanceRate >= 60
              ? "Needs Attention"
              : "Critical"}
          </Badge>
        </CardContent>
      </Card>

      {/* At Risk */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            At-Risk Students
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">{atRisk}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Below 60% attendance
          </p>
        </CardContent>
      </Card>

      {/* Avg Last 5 Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Last 5 Sessions
          </CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{avgLast5}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Classes attended recently
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
