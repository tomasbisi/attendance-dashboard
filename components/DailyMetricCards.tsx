"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, CalendarCheck } from "lucide-react";

interface DailyMetricCardsProps {
  totalStudents: number;
  overallRate: number;
  atRisk: number;
  totalPresent: number;
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  valueColor,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor ?? ""}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function DailyMetricCards({
  totalStudents,
  overallRate,
  atRisk,
  totalPresent,
}: DailyMetricCardsProps) {
  const rateColor =
    overallRate >= 80
      ? "text-[#53b078]"
      : overallRate >= 60
      ? "text-[#d97706]"
      : "text-destructive";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <MetricCard
        title="Total Students"
        value={totalStudents.toLocaleString()}
        sub="In selected view"
        icon={Users}
      />
      <MetricCard
        title="Overall Attendance"
        value={`${overallRate}%`}
        sub="Yes / (Yes + No)"
        icon={TrendingUp}
        valueColor={rateColor}
      />
      <MetricCard
        title="At-Risk Students"
        value={atRisk.toLocaleString()}
        sub="Below 60% attendance"
        icon={AlertTriangle}
        valueColor={atRisk > 0 ? "text-destructive" : ""}
      />
      <MetricCard
        title="Total Present"
        value={totalPresent.toLocaleString()}
        sub="Total attended sessions"
        icon={CalendarCheck}
      />
    </div>
  );
}
