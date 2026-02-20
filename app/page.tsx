"use client";

import { useState, useMemo } from "react";
import FileUpload from "@/components/FileUpload";
import MetricCards from "@/components/MetricCards";
import AttendanceChart from "@/components/AttendanceChart";
import ActivityChart from "@/components/ActivityChart";
import CategoryChart from "@/components/CategoryChart";
import TypeChart from "@/components/TypeChart";
import CountyPieChart from "@/components/CountyPieChart";
import DistrictChart from "@/components/DistrictChart";
import DistrictSummaryTable from "@/components/DistrictSummaryTable";
import DistrictSchoolChart from "@/components/DistrictSchoolChart";
import Filters from "@/components/Filters";
import AttendanceTable from "@/components/AttendanceTable";
import ZeroAttendanceTable from "@/components/ZeroAttendanceTable";
import WeeklyTable from "@/components/WeeklyTable";
import WeeklyLineChart from "@/components/WeeklyLineChart";
import {
  AttendanceRecord,
  filterData,
  filterByDistrict,
  getMetrics,
  getSchools,
  getDistricts,
  getSchoolSummaries,
  getActivitySummaries,
  getCategorySummaries,
  getTypeSummaries,
  getDistrictSummaries,
  getCountySummaries,
  get1to1Data,
  getDistrictData,
} from "@/lib/dataService";
import {
  WeeklyRecord,
  WeeklyMetric,
  getWeeklyOptions,
  filterWeekly,
  getMetricLabel,
} from "@/lib/weeklyService";

type View = "1to1" | "districts" | "weekly";

export default function DashboardPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [rawData, setRawData] = useState<AttendanceRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyRecord[]>([]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>("1to1");

  // ── Attendance filters ───────────────────────────────────────────────────────
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  // ── Weekly filters ───────────────────────────────────────────────────────────
  const [wDistrict, setWDistrict] = useState("all");
  const [wSchool, setWSchool] = useState("all");
  const [wActivity, setWActivity] = useState("all");
  const [wCategory, setWCategory] = useState("all");
  const [wMetric, setWMetric] = useState<WeeklyMetric>("enrollment");
  const [wView, setWView] = useState<"table" | "chart">("table");
  const [wWeekFrom, setWWeekFrom] = useState(0);
  const [wWeekTo, setWWeekTo] = useState<number | null>(null); // null = last

  // ── Derived: attendance ──────────────────────────────────────────────────────
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
  const categorySummaries1to1 = useMemo(() => getCategorySummaries(filtered1to1), [filtered1to1]);
  const typeSummaries1to1 = useMemo(() => getTypeSummaries(filtered1to1), [filtered1to1]);
  const countySummaries = useMemo(() => getCountySummaries(filtered1to1), [filtered1to1]);

  const districtSummaries = useMemo(() => getDistrictSummaries(dataDistricts), [dataDistricts]);
  const districtSchoolSummaries = useMemo(() => getSchoolSummaries(filteredDistricts), [filteredDistricts]);
  const activitySummariesDistricts = useMemo(() => getActivitySummaries(filteredDistricts), [filteredDistricts]);
  const categorySummariesDistricts = useMemo(() => getCategorySummaries(filteredDistricts), [filteredDistricts]);
  const typeSummariesDistricts = useMemo(() => getTypeSummaries(filteredDistricts), [filteredDistricts]);

  // ── Derived: weekly ──────────────────────────────────────────────────────────
  const weeklyOptions = useMemo(() => getWeeklyOptions(weeklyRecords), [weeklyRecords]);
  const weekCount = weeklyOptions.weekLabels.length;
  const weekToActual = wWeekTo !== null ? wWeekTo : Math.max(0, weekCount - 1);

  const filteredWeekly = useMemo(
    () => filterWeekly(weeklyRecords, wDistrict, wSchool, wActivity, wCategory),
    [weeklyRecords, wDistrict, wSchool, wActivity, wCategory],
  );

  // ── Callbacks ────────────────────────────────────────────────────────────────
  const handleAttendanceLoaded = (data: AttendanceRecord[]) => {
    setRawData(data);
    setSelectedSchool("all");
    setSelectedDistrict("all");
  };

  const handleWeeklyLoaded = (records: WeeklyRecord[]) => {
    setWeeklyRecords(records);
    setWDistrict("all");
    setWSchool("all");
    setWActivity("all");
    setWCategory("all");
    setWWeekFrom(0);
    setWWeekTo(null);
    if (records.length > 0) setView("weekly");
  };

  const hasAttendance = rawData.length > 0;
  const hasWeekly = weeklyRecords.length > 0;
  const hasAny = hasAttendance || hasWeekly;

  // Keep view in sync with available data
  const safeView: View =
    view === "weekly" && !hasWeekly
      ? hasAttendance
        ? "1to1"
        : "1to1"
      : view === "1to1" && !hasAttendance
      ? hasWeekly
        ? "weekly"
        : "1to1"
      : view === "districts" && !hasAttendance
      ? hasWeekly
        ? "weekly"
        : "1to1"
      : view;

  const METRICS: WeeklyMetric[] = ["enrollment", "ada", "attPct"];
  const btnClass = (active: boolean) =>
    `px-4 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-transparent border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground"
    }`;

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
      {hasAny && (
        <div className="bg-muted border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 pt-2">
            {hasAttendance && (
              <button
                onClick={() => setView("1to1")}
                className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border border-b-0 ${
                  safeView === "1to1"
                    ? "bg-background text-foreground border-border"
                    : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
                }`}
              >
                1to1 Schools
              </button>
            )}
            {hasAttendance && (
              <button
                onClick={() => setView("districts")}
                className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border border-b-0 ${
                  safeView === "districts"
                    ? "bg-background text-foreground border-border"
                    : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
                }`}
              >
                Districts
              </button>
            )}
            {hasWeekly && (
              <button
                onClick={() => setView("weekly")}
                className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border border-b-0 ${
                  safeView === "weekly"
                    ? "bg-background text-foreground border-border"
                    : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-background/50"
                }`}
              >
                Weekly Stats
              </button>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* File Upload */}
        <FileUpload
          onAttendanceLoaded={handleAttendanceLoaded}
          onWeeklyLoaded={handleWeeklyLoaded}
        />

        {/* 1to1 Schools View */}
        {hasAttendance && safeView === "1to1" && (
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
            <AttendanceChart schoolData={schoolSummaries} />
            <ActivityChart data={activitySummaries1to1} />
            <CategoryChart data={categorySummaries1to1} />
            <TypeChart data={typeSummaries1to1} />
            <CountyPieChart data={countySummaries} />
            <AttendanceTable data={filtered1to1} />
            <ZeroAttendanceTable data={filtered1to1} />
          </>
        )}

        {/* Districts View */}
        {hasAttendance && safeView === "districts" && (
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
            <DistrictChart data={districtSummaries} />
            <DistrictSchoolChart data={districtSchoolSummaries} />
            <ActivityChart data={activitySummariesDistricts} />
            <CategoryChart data={categorySummariesDistricts} />
            <TypeChart data={typeSummariesDistricts} />
            <DistrictSummaryTable data={districtSummaries} />
            <AttendanceTable data={filteredDistricts} />
            <ZeroAttendanceTable data={filteredDistricts} />
          </>
        )}

        {/* Weekly Stats View */}
        {hasWeekly && safeView === "weekly" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {weeklyOptions.districts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">District:</span>
                  <select
                    value={wDistrict}
                    onChange={(e) => setWDistrict(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">All</option>
                    {weeklyOptions.districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">School:</span>
                <select
                  value={wSchool}
                  onChange={(e) => setWSchool(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All</option>
                  {weeklyOptions.schools.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Activity:</span>
                <select
                  value={wActivity}
                  onChange={(e) => setWActivity(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All</option>
                  {weeklyOptions.activities.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              {weeklyOptions.categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Category:</span>
                  <select
                    value={wCategory}
                    onChange={(e) => setWCategory(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="all">All</option>
                    {weeklyOptions.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Week range + metric + view toggles */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Week range */}
              {weekCount > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Weeks:</span>
                  <select
                    value={wWeekFrom}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setWWeekFrom(v);
                      if (wWeekTo !== null && wWeekTo < v) setWWeekTo(v);
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {weeklyOptions.weekLabels.map((label, i) => (
                      <option key={i} value={i}>{label}</option>
                    ))}
                  </select>
                  <span className="text-muted-foreground text-sm">to</span>
                  <select
                    value={weekToActual}
                    onChange={(e) => setWWeekTo(Number(e.target.value))}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {weeklyOptions.weekLabels.map((label, i) => (
                      <option key={i} value={i} disabled={i < wWeekFrom}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Metric toggle */}
              <div className="flex items-center gap-1">
                {METRICS.map((m) => (
                  <button key={m} onClick={() => setWMetric(m)} className={btnClass(wMetric === m)}>
                    {getMetricLabel(m)}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 ml-auto">
                <button onClick={() => setWView("table")} className={btnClass(wView === "table")}>Table</button>
                <button onClick={() => setWView("chart")} className={btnClass(wView === "chart")}>Chart</button>
              </div>

              <span className="text-xs text-muted-foreground">
                {filteredWeekly.length} of {weeklyRecords.length} rows
              </span>
            </div>

            {wView === "table" ? (
              <WeeklyTable
                data={filteredWeekly}
                metric={wMetric}
                weekFrom={wWeekFrom}
                weekTo={weekToActual}
              />
            ) : (
              <WeeklyLineChart
                data={filteredWeekly}
                metric={wMetric}
                weekFrom={wWeekFrom}
                weekTo={weekToActual}
              />
            )}
          </>
        )}

        {!hasAny && (
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
