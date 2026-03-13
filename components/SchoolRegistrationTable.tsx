"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BookingDetail {
  bookingId: string;
  activity: string;
  enrolled: number;
  waitlist: number;
  totalStudents: number;
}

export interface SchoolRow {
  school: string;
  totalStudents: number;
  district?: string;
  bookings: BookingDetail[];
}

interface SchoolRegistrationTableProps {
  data: SchoolRow[];
}

export default function SchoolRegistrationTable({ data }: SchoolRegistrationTableProps) {
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  const showDistrict = data.some((r) => r.district);
  const sorted = [...data].sort((a, b) =>
    showDistrict
      ? (a.district ?? "").localeCompare(b.district ?? "") || a.school.localeCompare(b.school)
      : b.totalStudents - a.totalStudents
  );

  const toggle = (school: string) =>
    setExpandedSchool((prev) => (prev === school ? null : school));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students Registered per School</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[480px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-accent">
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-left w-8" />
                {showDistrict && (
                  <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-left whitespace-nowrap">
                    District
                  </th>
                )}
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-left whitespace-nowrap">
                  School
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">
                  Total Students
                </th>
                <th className="px-4 py-2 text-xs font-semibold text-muted-foreground text-right whitespace-nowrap">
                  Active Bookings
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const isExpanded = expandedSchool === row.school;
                const hasLowBooking = row.bookings.some((b) => b.totalStudents < 10);
                return (
                  <React.Fragment key={row.school}>
                    <tr
                      className="border-b hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => toggle(row.school)}
                    >
                      <td className="px-4 py-2 text-muted-foreground">
                        {isExpanded
                          ? <ChevronDown size={14} />
                          : <ChevronRight size={14} />}
                      </td>
                      {showDistrict && (
                        <td className="px-4 py-2 text-muted-foreground text-xs">
                          {row.district ?? "—"}
                        </td>
                      )}
                      <td className="px-4 py-2 font-medium">
                        <span className="inline-flex items-center gap-2">
                          {row.school}
                          {hasLowBooking && (
                            <span
                              title="One or more bookings have fewer than 10 registered students"
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300"
                            >
                              ⚠ Low enrollment
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{row.totalStudents}</td>
                      <td className="px-4 py-2 text-right font-semibold">{row.bookings.length}</td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-accent/20 border-b">
                        <td colSpan={showDistrict ? 5 : 4} className="px-6 py-3">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-border/50">
                                <th className="pb-1.5 text-left font-semibold text-muted-foreground">Booking ID</th>
                                <th className="pb-1.5 text-left font-semibold text-muted-foreground">Activity</th>
                                <th className="pb-1.5 text-right font-semibold text-muted-foreground">Enrolled</th>
                                <th className="pb-1.5 text-right font-semibold text-muted-foreground">Waitlist</th>
                                <th className="pb-1.5 text-right font-semibold text-muted-foreground">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.bookings.map((b) => (
                                <tr key={b.bookingId} className={`border-b border-border/30 last:border-0 ${b.totalStudents < 10 ? "bg-yellow-50" : ""}`}>
                                  <td className="py-1.5 font-mono text-muted-foreground">{b.bookingId || "—"}</td>
                                  <td className="py-1.5">{b.activity || "—"}</td>
                                  <td className="py-1.5 text-right">{b.enrolled}</td>
                                  <td className="py-1.5 text-right">{b.waitlist}</td>
                                  <td className="py-1.5 text-right font-semibold">{b.totalStudents}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
