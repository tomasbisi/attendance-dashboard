"use client";

import { useState, useMemo } from "react";
import FileUpload from "@/components/FileUpload";
import MetricCards from "@/components/MetricCards";
import AttendanceChart from "@/components/AttendanceChart";
import ActivityChart from "@/components/ActivityChart";
import Filters from "@/components/Filters";
import AttendanceTable from "@/components/AttendanceTable";
import {
  AttendanceRecord,
  filterData,
  getMetrics,
  getSchools,
  getSchoolSummaries,
  getActivitySummaries,
} from "@/lib/dataService";

export default function DashboardPage() {
  const [rawData, setRawData] = useState<AttendanceRecord[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("all");

  const schools = useMemo(() => getSchools(rawData), [rawData]);

  const filtered = useMemo(
    () => filterData(rawData, selectedSchool),
    [rawData, selectedSchool]
  );

  const metrics = useMemo(() => getMetrics(filtered), [filtered]);
  const schoolSummaries = useMemo(() => getSchoolSummaries(filtered), [filtered]);
  const activitySummaries = useMemo(() => getActivitySummaries(filtered), [filtered]);

  const handleDataLoaded = (data: AttendanceRecord[]) => {
    setRawData(data);
    setSelectedSchool("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold tracking-tight">Attendance Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor student attendance across schools &amp; activities
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* File Upload */}
        <FileUpload onDataLoaded={handleDataLoaded} />

        {rawData.length > 0 && (
          <>
            {/* Filters */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Filters
                schools={schools}
                selectedSchool={selectedSchool}
                onSchoolChange={setSelectedSchool}
              />
              <span className="text-xs text-muted-foreground">
                Showing {filtered.length} of {rawData.length} students
              </span>
            </div>

            {/* KPI Cards */}
            <MetricCards {...metrics} />

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AttendanceChart schoolData={schoolSummaries} />
              <ActivityChart data={activitySummaries} />
            </div>

            {/* Table */}
            <AttendanceTable data={filtered} />
          </>
        )}

        {rawData.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground text-sm">
              Upload your Excel or CSV file above to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
