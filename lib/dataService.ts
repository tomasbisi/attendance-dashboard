// Data Service — swap this layer when connecting to a real DB
// Currently reads from parsed Excel data passed in from the client

export interface AttendanceRecord {
  studentName: string;
  schoolName: string;
  activity: string;
  enrolled: boolean;
  totalClasses: number;
  totalAttendance: number;
  attendanceRate: number;
  last5Sessions: number;
  parent1Name: string;
  parent1Email: string;
  parent1Phone: string;
  parent2Name: string;
  parent2Email: string;
  parent2Phone: string;
  externalId: string;
}

export interface SchoolSummary {
  school: string;
  avgAttendanceRate: number;
  totalStudents: number;
  avgLast5: number;
}

export interface ActivitySummary {
  activity: string;
  totalStudents: number;
  enrolled: number;
  enrollmentRate: number;
  avgAttendanceRate: number;
}

export function getSchools(data: AttendanceRecord[]): string[] {
  return Array.from(new Set(data.map((r) => r.schoolName))).sort();
}

export function filterData(
  data: AttendanceRecord[],
  school: string
): AttendanceRecord[] {
  return data.filter((r) => school === "all" || r.schoolName === school);
}

export function getSchoolSummaries(data: AttendanceRecord[]): SchoolSummary[] {
  const bySchool: Record<string, AttendanceRecord[]> = {};
  data.forEach((r) => {
    if (!bySchool[r.schoolName]) bySchool[r.schoolName] = [];
    bySchool[r.schoolName].push(r);
  });

  return Object.entries(bySchool).map(([school, records]) => ({
    school,
    totalStudents: records.length,
    avgAttendanceRate: Math.round(
      records.reduce((sum, r) => sum + r.attendanceRate, 0) / records.length
    ),
    avgLast5: Math.round(
      records.reduce((sum, r) => sum + r.last5Sessions, 0) / records.length
    ),
  }));
}


export function getActivitySummaries(data: AttendanceRecord[]): ActivitySummary[] {
  const byActivity: Record<string, AttendanceRecord[]> = {};
  data.forEach((r) => {
    const key = r.activity || "Unknown";
    if (!byActivity[key]) byActivity[key] = [];
    byActivity[key].push(r);
  });

  return Object.entries(byActivity)
    .map(([activity, records]) => {
      const enrolled = records.filter((r) => r.enrolled).length;
      return {
        activity,
        totalStudents: records.length,
        enrolled,
        enrollmentRate: Math.round((enrolled / records.length) * 100),
        avgAttendanceRate: Math.round(
          records.reduce((sum, r) => sum + r.attendanceRate, 0) / records.length
        ),
      };
    })
    .sort((a, b) => b.enrollmentRate - a.enrollmentRate);
}

export function getMetrics(data: AttendanceRecord[]) {
  const totalStudents = data.length;
  const enrolled = data.filter((r) => r.enrolled).length;
  const avgRate =
    totalStudents > 0
      ? Math.round(data.reduce((sum, r) => sum + r.attendanceRate, 0) / totalStudents)
      : 0;
  const atRisk = data.filter((r) => r.attendanceRate < 60).length;
  const avgLast5 =
    totalStudents > 0
      ? Math.round(data.reduce((sum, r) => sum + r.last5Sessions, 0) / totalStudents)
      : 0;

  return {
    totalStudents,
    enrolled,
    avgAttendanceRate: avgRate,
    atRisk,
    avgLast5,
  };
}

// Parse raw Excel rows into AttendanceRecord[]
// Columns: Student Name, School Name, Enrolled?,
//          Total Classes, Total Attendance, % Attendance,
//          Attendance last 5 sessions, Parent 1 Name, Parent 1 Email,
//          Parent 1 Phone, Parent 2 Name, Parent 2 Email, Parent 2 Phone, External ID
export function parseExcelRows(rows: Record<string, unknown>[]): AttendanceRecord[] {
  // Normalize row keys by trimming whitespace to handle Excel column name inconsistencies
  const normalizeRow = (row: Record<string, unknown>): Record<string, unknown> =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), v]));

  const parseNum = (val: unknown): number => {
    if (val === null || val === undefined || val === "") return 0;
    const n = Number(String(val).replace(/,/g, "").trim());
    return isNaN(n) ? 0 : n;
  };

  return rows
    .map(normalizeRow)
    .filter((row) => row["Student Name"] || row["School Name"])
    .map((row) => {
      const rawRate = row["Total Attendance%"];
      let rate = 0;
      if (typeof rawRate === "number") {
        rate = rawRate > 1 ? Math.round(rawRate) : Math.round(rawRate * 100);
      } else if (typeof rawRate === "string") {
        const parsed = parseFloat(rawRate.replace("%", "").trim());
        rate = isNaN(parsed) ? 0 : (parsed > 1 ? Math.round(parsed) : Math.round(parsed * 100));
      }

      const enrolledRaw = String(row["Enrolled?"] ?? "").toLowerCase().trim();
      const enrolled = enrolledRaw === "yes" || enrolledRaw === "true" || enrolledRaw === "1";

      return {
        studentName: String(row["Student Name"] ?? ""),
        schoolName: String(row["School Name"] ?? "Unknown School"),
        activity: String(row["Activity"] ?? ""),
        enrolled,
        totalClasses: parseNum(row["Total Classes"]),
        totalAttendance: parseNum(row["Attendance"]),
        attendanceRate: rate,
        last5Sessions: parseNum(row["Attendance last 5 sessions"]),
        parent1Name: String(row["Parent 1 Name"] ?? ""),
        parent1Email: String(row["Parent 1 Email"] ?? ""),
        parent1Phone: String(row["Parent 1 Phone"] ?? ""),
        parent2Name: String(row["Parent 2 Name"] ?? ""),
        parent2Email: String(row["Parent 2 Email"] ?? ""),
        parent2Phone: String(row["Parent 2 Phone"] ?? ""),
        externalId: String(row["External ID"] ?? ""),
      };
    });
}
