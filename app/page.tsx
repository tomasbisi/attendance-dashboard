"use client";

import { useState, useMemo } from "react";
import FileUpload from "@/components/FileUpload";
import MetricCards from "@/components/MetricCards";
import AttendanceChart from "@/components/AttendanceChart";
import ActivityChart from "@/components/ActivityChart";
import CountyPieChart from "@/components/CountyPieChart";
import DistrictChart from "@/components/DistrictChart";
import DistrictSummaryTable from "@/components/DistrictSummaryTable";
import Filters from "@/components/Filters";
import AttendanceTable from "@/components/AttendanceTable";
import {
  AttendanceRecord,
  filterData,
  filterByDistrict,
  getMetrics,
  getSchools,
  getDistricts,
  getSchoolSummaries,
  getActivitySummaries,
  getDistrictSummaries,
  getCountySummaries,
  get1to1Data,
  getDistrictData,
} from "@/lib/dataService";

type View = "1to1" | "districts";

export default function DashboardPage() {
  const [rawData, setRawData] = useState<AttendanceRecord[]>([]);
  const [view, setView] = useState<View>("1to1");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  const data1to1 = useMemo(() => get1to1Data(rawData), [rawData]);
  const dataDistricts = useMemo(() => getDistrictData(rawData), [rawData]);

  const schools = useMemo(() => getSchools(data1to1), [data1to1]);
  const districts = useMemo(() => getDistricts(dataDistricts), [dataDistricts]);

  const filtered1to1 = useMemo(() => filterData(data1to1, selectedSchool), [data1to1, selectedSchool]);
  const filteredDistricts = useMemo(() => filterByDistrict(dataDistricts, selectedDistrict), [dataDistricts, selectedDistrict]);

  const metrics1to1 = useMemo(() => getMetrics(filtered1to1), [filtered1to1]);
  const metricsDistricts = useMemo(() => getMetrics(filteredDistricts), [filteredDistricts]);

  const schoolSummaries = useMemo(() => getSchoolSummaries(filtered1to1), [filtered1to1]);
  const activitySummaries1to1 = useMemo(() => getActivitySummaries(filtered1to1), [filtered1to1]);
  const countySummaries = useMemo(() => getCountySummaries(filtered1to1), [filtered1to1]);

  const districtSummaries = useMemo(() => getDistrictSummaries(dataDistricts), [dataDistricts]);
  const activitySummariesDistricts = useMemo(() => getActivitySummaries(filteredDistricts), [filteredDistricts]);

  const handleDataLoaded = (data: AttendanceRecord[]) => {
    setRawData(data);
    setSelectedSchool("all");
    setSelectedDistrict("all");
  };

  const hasData = rawData.length > 0;

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

      {/* View Navigation */}
      {hasData && (
        <div className="bg-muted border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 pt-2">
            <button
              onClick={() => setView("1to1")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border border-b-0 ${
                view === "1to1"
                  ? "bg-background text-foreground border-border"
                  : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
              }`}
            >
              1to1 Schools
            </button>
            <button
              onClick={() => setView("districts")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border border-b-0 ${
                view === "districts"
                  ? "bg-background text-foreground border-border"
                  : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
              }`}
            >
              Districts
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* File Upload */}
        <FileUpload onDataLoaded={handleDataLoaded} />

        {/* 1to1 Schools View */}
        {hasData && view === "1to1" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Filters
                schools={schools}
                selectedSchool={selectedSchool}
                onSchoolChange={setSelectedSchool}
              />
              <span className="text-xs text-muted-foreground">
                Showing {filtered1to1.length} of {data1to1.length} students
              </span>
            </div>
            <MetricCards {...metrics1to1} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AttendanceChart schoolData={schoolSummaries} />
              <ActivityChart data={activitySummaries1to1} />
            </div>
            <CountyPieChart data={countySummaries} />
            <AttendanceTable data={filtered1to1} />
          </>
        )}

        {/* Districts View */}
        {hasData && view === "districts" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-muted-foreground">
                Showing {filteredDistricts.length} of {dataDistricts.length} students
              </span>
            </div>
            <MetricCards {...metricsDistricts} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <DistrictChart data={districtSummaries} />
              <ActivityChart data={activitySummariesDistricts} />
            </div>
            <DistrictSummaryTable data={districtSummaries} />
            <AttendanceTable data={filteredDistricts} />
          </>
        )}

        {!hasData && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <p className="text-muted-foreground text-sm">
              Upload your Excel or CSV file above to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
