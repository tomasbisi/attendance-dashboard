"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { parseExcelRows, AttendanceRecord } from "@/lib/dataService";
import { parseWeeklyStats, WeeklyRecord } from "@/lib/weeklyService";
import { parseDailyAttendance, DailyRecord } from "@/lib/dailyService";

interface FileUploadProps {
  onAttendanceLoaded: (data: AttendanceRecord[]) => void;
  onWeeklyLoaded: (records: WeeklyRecord[]) => void;
  onDailyLoaded: (records: DailyRecord[]) => void;
}

interface ZoneState {
  fileName: string | null;
  error: string | null;
  dragging: boolean;
}

function UploadZone({
  label,
  hint,
  state,
  inputRef,
  onFile,
  onClear,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  label: string;
  hint: string;
  state: ZoneState;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file: File) => void;
  onClear: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const loaded = !!state.fileName;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-5 transition-colors cursor-pointer
        ${state.dragging ? "border-primary bg-primary/5" : loaded ? "border-primary/40 bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50"}`}
      onClick={() => !loaded && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {loaded ? (
        <>
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary truncate max-w-[160px]">{state.fileName}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-primary font-medium">{label} loaded</span>
        </>
      ) : (
        <>
          <Upload className="h-6 w-6 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Drag &amp; drop or click to browse</p>
          </div>
        </>
      )}
      {state.error && (
        <p className="text-xs text-destructive text-center">{state.error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

export default function FileUpload({ onAttendanceLoaded, onWeeklyLoaded, onDailyLoaded }: FileUploadProps) {
  const attendanceRef = useRef<HTMLInputElement>(null);
  const weeklyRef = useRef<HTMLInputElement>(null);
  const dailyRef = useRef<HTMLInputElement>(null);

  const [attendanceState, setAttendanceState] = useState<ZoneState>({ fileName: null, error: null, dragging: false });
  const [weeklyState, setWeeklyState] = useState<ZoneState>({ fileName: null, error: null, dragging: false });
  const [dailyState, setDailyState] = useState<ZoneState>({ fileName: null, error: null, dragging: false });

  const processAttendance = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setAttendanceState((s) => ({ ...s, error: "Please upload an Excel (.xlsx, .xls) or CSV file." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const allRows: Record<string, unknown>[] = [];
        workbook.SheetNames.forEach((name) => {
          const sheet = workbook.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(sheet, { raw: false }) as Record<string, unknown>[];
          allRows.push(...rows);
        });
        const parsed = parseExcelRows(allRows);
        if (parsed.length === 0) {
          setAttendanceState((s) => ({ ...s, error: "No valid rows found. Check column headers." }));
          return;
        }
        setAttendanceState({ fileName: file.name, error: null, dragging: false });
        onAttendanceLoaded(parsed);
      } catch {
        setAttendanceState((s) => ({ ...s, error: "Failed to parse file." }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processWeekly = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setWeeklyState((s) => ({ ...s, error: "Please upload an Excel (.xlsx, .xls) or CSV file." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const records = workbook.SheetNames.flatMap((name) => {
          const sheet = workbook.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
          return parseWeeklyStats(rows);
        });
        if (records.length === 0) {
          setWeeklyState((s) => ({ ...s, error: "No valid rows found. Check the weekly_stats format." }));
          return;
        }
        setWeeklyState({ fileName: file.name, error: null, dragging: false });
        onWeeklyLoaded(records);
      } catch {
        setWeeklyState((s) => ({ ...s, error: "Failed to parse file." }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processDaily = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setDailyState((s) => ({ ...s, error: "Please upload an Excel (.xlsx, .xls) or CSV file." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheets = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
          return { name, rows };
        });
        const records = parseDailyAttendance(sheets);
        if (records.length === 0) {
          setDailyState((s) => ({ ...s, error: "No valid student rows found. Check the daily_attendance format." }));
          return;
        }
        setDailyState({ fileName: file.name, error: null, dragging: false });
        onDailyLoaded(records);
      } catch {
        setDailyState((s) => ({ ...s, error: "Failed to parse file." }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Auto-detect file type by name
  const autoRoute = (file: File, forceZone?: "attendance" | "weekly" | "daily") => {
    const name = file.name.toLowerCase();
    const zone =
      forceZone ??
      (name.includes("daily") ? "daily" : name.includes("weekly") ? "weekly" : "attendance");
    if (zone === "daily") processDaily(file);
    else if (zone === "weekly") processWeekly(file);
    else processAttendance(file);
  };

  const clearAttendance = () => {
    setAttendanceState({ fileName: null, error: null, dragging: false });
    if (attendanceRef.current) attendanceRef.current.value = "";
    onAttendanceLoaded([]);
  };
  const clearWeekly = () => {
    setWeeklyState({ fileName: null, error: null, dragging: false });
    if (weeklyRef.current) weeklyRef.current.value = "";
    onWeeklyLoaded([]);
  };
  const clearDaily = () => {
    setDailyState({ fileName: null, error: null, dragging: false });
    if (dailyRef.current) dailyRef.current.value = "";
    onDailyLoaded([]);
  };

  const makeDropHandler = (zone: "attendance" | "weekly" | "daily", setState: React.Dispatch<React.SetStateAction<ZoneState>>) =>
    (e: React.DragEvent) => {
      e.preventDefault();
      setState((s) => ({ ...s, dragging: false }));
      const f = e.dataTransfer.files?.[0];
      if (f) autoRoute(f, zone);
    };

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UploadZone
            label="School Records"
            hint="school_records.xlsx"
            state={attendanceState}
            inputRef={attendanceRef}
            onFile={(f) => autoRoute(f, "attendance")}
            onClear={clearAttendance}
            onDragOver={() => setAttendanceState((s) => ({ ...s, dragging: true }))}
            onDragLeave={() => setAttendanceState((s) => ({ ...s, dragging: false }))}
            onDrop={makeDropHandler("attendance", setAttendanceState)}
          />
          <UploadZone
            label="Weekly Stats"
            hint="weekly_stats.xlsx"
            state={weeklyState}
            inputRef={weeklyRef}
            onFile={(f) => autoRoute(f, "weekly")}
            onClear={clearWeekly}
            onDragOver={() => setWeeklyState((s) => ({ ...s, dragging: true }))}
            onDragLeave={() => setWeeklyState((s) => ({ ...s, dragging: false }))}
            onDrop={makeDropHandler("weekly", setWeeklyState)}
          />
          <UploadZone
            label="Daily Attendance"
            hint="daily_attendance.xlsx"
            state={dailyState}
            inputRef={dailyRef}
            onFile={(f) => autoRoute(f, "daily")}
            onClear={clearDaily}
            onDragOver={() => setDailyState((s) => ({ ...s, dragging: true }))}
            onDragLeave={() => setDailyState((s) => ({ ...s, dragging: false }))}
            onDrop={makeDropHandler("daily", setDailyState)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
