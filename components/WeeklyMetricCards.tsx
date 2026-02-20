"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, Activity } from "lucide-react";

interface WeeklyMetricCardsProps {
  maxCapacity: number;
  totalEnrolled: number;
  waitroom: number;
  latestAttended: number;
  enrollmentRate: number;
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

export default function WeeklyMetricCards({
  maxCapacity,
  totalEnrolled,
  waitroom,
  latestAttended,
  enrollmentRate,
}: WeeklyMetricCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <MetricCard
        title="Max Capacity"
        value={maxCapacity.toLocaleString()}
        sub="Total seats available"
        icon={Users}
      />
      <MetricCard
        title="Total Enrolled"
        value={totalEnrolled.toLocaleString()}
        sub={`${enrollmentRate}% of capacity`}
        icon={UserCheck}
        valueColor={enrollmentRate >= 80 ? "text-[#53b078]" : enrollmentRate >= 60 ? "text-[#d97706]" : "text-destructive"}
      />
      <MetricCard
        title="Waitroom"
        value={waitroom.toLocaleString()}
        sub="Students waiting"
        icon={Clock}
        valueColor={waitroom > 0 ? "text-[#d97706]" : ""}
      />
      <MetricCard
        title="Attended (Latest)"
        value={latestAttended.toLocaleString()}
        sub="Most recent week ADA"
        icon={Activity}
      />
    </div>
  );
}
