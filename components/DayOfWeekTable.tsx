"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DayOfWeekRow } from "@/lib/dailyService";
import { DAY_ORDER } from "@/lib/dailyService";

interface DayOfWeekTableProps {
  data: DayOfWeekRow[];
}

function RateCell({ rate, possible }: { rate: number; possible: number }) {
  if (possible === 0) return <span className="text-muted-foreground/40 text-xs">—</span>;
  if (rate >= 80) return <Badge variant="default" className="text-xs">{rate}%</Badge>;
  if (rate >= 60) return <Badge variant="secondary" className="text-xs">{rate}%</Badge>;
  return <Badge variant="destructive" className="text-xs">{rate}%</Badge>;
}

export default function DayOfWeekTable({ data }: DayOfWeekTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Day of Week Breakdown by School</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const thClass = "px-3 py-2 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day of Week Breakdown by School</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-left sticky left-0 bg-muted z-10 whitespace-nowrap" style={{ minWidth: 180 }}>
                  School
                </th>
                {DAY_ORDER.map((day) => (
                  <th key={day} className={thClass} style={{ minWidth: 80 }}>
                    {day}
                  </th>
                ))}
                <th className={`${thClass} border-l`} style={{ minWidth: 80 }}>
                  Best Day
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 font-medium sticky left-0 bg-background border-r" style={{ minWidth: 180 }}>
                    {row.school}
                  </td>
                  {DAY_ORDER.map((day) => {
                    const stat = row.days[day];
                    const isBest = row.bestDay === day;
                    return (
                      <td
                        key={day}
                        className={`px-3 py-2 text-right ${isBest ? "bg-primary/5" : ""}`}
                        style={{ minWidth: 80 }}
                      >
                        <RateCell rate={stat.rate} possible={stat.possible} />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right border-l" style={{ minWidth: 80 }}>
                    {row.bestDay ? (
                      <span className="text-xs font-semibold text-primary">{row.bestDay}</span>
                    ) : (
                      <span className="text-muted-foreground/40 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
