"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InsightItem, InsightSeverity } from "@/lib/insightsService";

const SEVERITY_CONFIG: Record<InsightSeverity, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical:    { label: "Critical",     bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",  dot: "bg-red-500" },
  warning:     { label: "Warning",      bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",dot: "bg-amber-500" },
  opportunity: { label: "Opportunity",  bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot:"bg-emerald-500"},
};

const PATTERN_ICONS: Record<string, string> = {
  "District Attendance Gap":        "🏫",
  "High At-Risk Concentration":     "⚠️",
  "Waitlisted Students Not Enrolled":"🎯",
  "Early Disengagement":            "📉",
  "Commitment Gap":                 "📋",
  "Underperforming Activity":       "🔻",
  "Oversubscribed Activity":        "🔥",
  "Expansion Opportunity":          "🚀",
  "Independent Schools Underperform":"📊",
};

function SeverityBadge({ severity }: { severity: InsightSeverity }) {
  const c = SEVERITY_CONFIG[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function InsightRow({ item }: { item: InsightItem }) {
  const [expanded, setExpanded] = useState(false);
  const icon = PATTERN_ICONS[item.pattern] ?? "💡";

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="px-4 py-3 whitespace-nowrap">
          <SeverityBadge severity={item.severity} />
        </td>
        <td className="px-4 py-3 text-sm font-medium">
          <span className="mr-1.5">{icon}</span>{item.pattern}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {item.finding}
        </td>
        <td className="px-4 py-3 text-sm">
          {item.affected}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-center whitespace-nowrap">
          {item.studentsImpacted}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-xs text-muted-foreground">{expanded ? "▲ Hide" : "▼ Show"} action</span>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-muted/20">
          <td />
          <td colSpan={5} className="px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">💊</span>
              <div>
                <p className="text-xs font-semibold text-foreground mb-0.5">Recommended Action</p>
                <p className="text-sm text-muted-foreground">{item.action}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface InsightsTableProps {
  insights: InsightItem[];
}

export default function InsightsTable({ insights }: InsightsTableProps) {
  const [filter, setFilter] = useState<InsightSeverity | "all">("all");

  const counts = {
    critical: insights.filter(i => i.severity === "critical").length,
    warning: insights.filter(i => i.severity === "warning").length,
    opportunity: insights.filter(i => i.severity === "opportunity").length,
  };

  const visible = filter === "all" ? insights : insights.filter(i => i.severity === filter);

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          No patterns detected yet — upload data to generate insights.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between flex-wrap gap-3 pb-3">
        <div>
          <CardTitle>Attendance Insights &amp; Recommendations</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {insights.length} pattern{insights.length !== 1 ? "s" : ""} detected · {insights.reduce((s, i) => s + i.studentsImpacted, 0)} students impacted · click a row to reveal the action
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "critical", "warning", "opportunity"] as const).map(f => {
            const count = f === "all" ? insights.length : counts[f];
            const active = filter === f;
            const colors: Record<typeof f, string> = {
              all:         active ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80",
              critical:    active ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
              warning:     active ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
              opportunity: active ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${colors[f]}`}
              >
                {f === "all" ? "All" : SEVERITY_CONFIG[f].label} ({count})
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <colgroup>
              <col className="w-28" />
              <col className="w-52" />
              <col />
              <col className="w-44" />
              <col className="w-20" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap">Severity</th>
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap">Pattern</th>
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground">Finding</th>
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground">Affected</th>
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-center whitespace-nowrap">Students</th>
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(item => (
                <InsightRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
