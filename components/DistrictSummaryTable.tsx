"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { DistrictSummary } from "@/lib/dataService";

type SortKey = keyof DistrictSummary;
type SortDir = "asc" | "desc";
interface SortConfig { key: SortKey; dir: SortDir; priority: number }

function SortIcon({ sortConfig, colKey }: { sortConfig: SortConfig[]; colKey: SortKey }) {
  const config = sortConfig.find((s) => s.key === colKey);
  const showPriority = sortConfig.length > 1 && config;
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {config ? (
        config.dir === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
      )}
      {showPriority && <span className="text-[10px] text-primary font-bold leading-none">{config.priority}</span>}
    </span>
  );
}

function RateBadge({ rate }: { rate: number }) {
  if (rate >= 80) return <Badge variant="default">{rate}%</Badge>;
  if (rate >= 60) return <Badge variant="secondary">{rate}%</Badge>;
  return <Badge variant="destructive">{rate}%</Badge>;
}

export default function DistrictSummaryTable({ data }: { data: DistrictSummary[] }) {
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (!existing) return [...prev, { key, dir: "asc", priority: prev.length + 1 }];
      if (existing.dir === "asc") return prev.map((s) => s.key === key ? { ...s, dir: "desc" } : s);
      const removed = prev.filter((s) => s.key !== key);
      return removed.map((s, i) => ({ ...s, priority: i + 1 }));
    });
  };

  const sorted = sortConfig.length === 0 ? data : [...data].sort((a, b) => {
    for (const { key, dir } of sortConfig) {
      const av = a[key]; const bv = b[key];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  const thClass = "cursor-pointer select-none hover:bg-muted/50 transition-colors";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>District Metrics</CardTitle>
        {sortConfig.length > 0 && (
          <button onClick={() => setSortConfig([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            Clear sorting
          </button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No data to display</div>
        ) : (
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass} onClick={() => handleSort("district")}>
                    District <SortIcon sortConfig={sortConfig} colKey="district" />
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => handleSort("schools")}>
                    Schools <SortIcon sortConfig={sortConfig} colKey="schools" />
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => handleSort("totalStudents")}>
                    Students <SortIcon sortConfig={sortConfig} colKey="totalStudents" />
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => handleSort("enrolled")}>
                    Enrolled <SortIcon sortConfig={sortConfig} colKey="enrolled" />
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => handleSort("enrollmentRate")}>
                    Enrollment % <SortIcon sortConfig={sortConfig} colKey="enrollmentRate" />
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => handleSort("avgAttendanceRate")}>
                    Avg Attendance <SortIcon sortConfig={sortConfig} colKey="avgAttendanceRate" />
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => handleSort("avgLast5")}>
                    Avg Last 5 <SortIcon sortConfig={sortConfig} colKey="avgLast5" />
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => handleSort("atRisk")}>
                    At-Risk <SortIcon sortConfig={sortConfig} colKey="atRisk" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.district}</TableCell>
                    <TableCell className="text-right">{row.schools}</TableCell>
                    <TableCell className="text-right">{row.totalStudents}</TableCell>
                    <TableCell className="text-right">{row.enrolled}</TableCell>
                    <TableCell className="text-right"><RateBadge rate={row.enrollmentRate} /></TableCell>
                    <TableCell className="text-right"><RateBadge rate={row.avgAttendanceRate} /></TableCell>
                    <TableCell className="text-right">{row.avgLast5}</TableCell>
                    <TableCell className="text-right">
                      <span className={row.atRisk > 0 ? "text-red-600 font-medium" : ""}>{row.atRisk}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
