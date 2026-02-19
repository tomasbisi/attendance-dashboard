"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { parseExcelRows, AttendanceRecord } from "@/lib/dataService";

interface FileUploadProps {
  onDataLoaded: (data: AttendanceRecord[]) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [tabCount, setTabCount] = useState(0);

  const processFile = (file: File) => {
    setError(null);
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Please upload an Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        // Read all tabs and combine rows
        const allRows: Record<string, unknown>[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { raw: false }) as Record<string, unknown>[];
          allRows.push(...rows);
        });

        const parsed = parseExcelRows(allRows);
        if (parsed.length === 0) {
          setError("No valid rows found. Check column headers: Student Name · School Name · Activity · Enrolled? · Total Classes · Total Attendance% · Attendance · Attendance last 5 sessions.");
          return;
        }
        setFileName(file.name);
        setTabCount(workbook.SheetNames.length);
        onDataLoaded(parsed);
      } catch {
        setError("Failed to parse the file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clear = () => {
    setFileName(null);
    setError(null);
    setTabCount(0);
    onDataLoaded([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card
      className={`border-dashed border-2 transition-colors cursor-pointer ${
        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30"
      }`}
      onClick={() => !fileName && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
        {fileName ? (
          <>
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-700">{fileName}</span>
              <button
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              Data loaded from {tabCount} {tabCount === 1 ? "tab" : "tabs"}
            </span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Upload Excel or CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag &amp; drop or click to browse · All tabs will be combined
              </p>
              <p className="text-xs text-muted-foreground mt-3 font-mono bg-muted px-2 py-1 rounded">
                Columns: Student Name · School Name · Activity · Enrolled? · Total Classes · Total Attendance% · Attendance · Attendance last 5 sessions
              </p>
            </div>
          </>
        )}
        {error && (
          <p className="text-xs text-destructive text-center mt-1">{error}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
