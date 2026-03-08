# HOKALI Reporting Dashboard — Frontend

Next.js dashboard for uploading and analyzing HOKALI student attendance data. Users upload Excel files, the backend parses them, and the frontend displays interactive charts, tables, and automated insights. All filtering and aggregation happens client-side.

## Tech Stack

- Next.js 16 + TypeScript
- React 19 + Tailwind CSS 4
- Recharts (charts)
- Radix UI + shadcn (UI components)
- xlsx (client-side Excel export)

## Running Locally

Requires the backend to be running first (see `reporting_dashboard_service`).

```bash
npm install
npm run dev        # starts on http://localhost:3000
```

The frontend expects the backend at `http://localhost:3001` by default. To change this, update the fetch URLs in `app/page.tsx`.

---

## How to Use

1. Open the dashboard in the browser.
2. Click the upload area or drag and drop your Excel files:
   - **Attendance file** — overall per-student attendance records
   - **Weekly stats file** — week-by-week enrollment and attendance
   - **Daily attendance file** — per-session daily records by school
3. Files are auto-routed to the correct backend endpoint based on filename.
4. Once uploaded, use the tabs and filters to explore the data.

---

## Views

### Overall Stats
High-level attendance summary across all schools or districts.
- Switch between **1-to-1 Schools** and **Districts** subviews.
- Shows metric cards (total students, avg attendance rate, at-risk count).
- Charts by activity, category, type, and county.
- Sortable school/district summary tables.
- Zero attendance and low engagement tables.

### Weekly Stats
Week-by-week enrollment and attendance trends.
- Switch between **Enrollment**, **ADA** (Average Daily Attendance), and **Attendance %** metrics.
- Date range slider to focus on specific weeks.
- Toggle between table and line chart view.

### Daily Stats
Individual session attendance per student.
- Scrollable table with one column per date.
- Overall and in-range attendance rates per student.
- Day-of-week breakdown (which days have best/worst attendance).
- Toggle between table and chart view.

### Insights
Automated pattern detection across all data.
- Detects: district attendance gaps, high-risk schools, early disengagement, oversubscribed activities, expansion opportunities, and more.
- Severity levels: Critical, Warning, Opportunity.

---

## Filters

Each view has independent filters:
- School, District, Grade, Booking ID, Activity, Category
- Weekly: date range (week from / week to)
- Daily: date range slider (default: last 20 dates)

---

## Project Structure

```
app/
  page.tsx            # Main dashboard — all state, filters, and view routing
  layout.tsx          # Root layout with sidebar

components/
  FileUpload.tsx       # Drag-drop file upload, auto-routes by filename
  Sidebar.tsx          # Collapsible navigation
  Filters.tsx          # School/district dropdowns
  MultiSelect.tsx      # Multi-value filter dropdowns
  MetricCards.tsx      # Overall summary cards
  WeeklyMetricCards.tsx
  DailyMetricCards.tsx
  AttendanceTable.tsx  # Per-student overall attendance (multi-column sort)
  DailyTable.tsx       # Per-student daily attendance grid
  WeeklyTable.tsx      # Per-school weekly stats
  DistrictSummaryTable.tsx
  DayOfWeekTable.tsx
  InsightsTable.tsx    # Expandable insight alerts
  ZeroAttendanceTable.tsx
  LowEngagementTable.tsx
  AttendanceChart.tsx
  ActivityChart.tsx
  CategoryChart.tsx
  TypeChart.tsx
  CountyPieChart.tsx
  DistrictChart.tsx
  DistrictSchoolChart.tsx
  WeeklyLineChart.tsx
  DailyChart.tsx
  DayOfWeekChart.tsx
  CopyCell.tsx         # Click-to-copy table cell utility
  ui/                  # Base shadcn components

lib/
  dataService.ts       # Overall attendance types, filtering, aggregation
  weeklyService.ts     # Weekly stats types, parsing, filtering
  dailyService.ts      # Daily attendance types, parsing, date utilities
  insightsService.ts   # Automated pattern detectors
```

---

## Data Flow

```
User uploads Excel file
        ↓
FileUpload.tsx → POST /api/upload/{attendance|weekly|daily}
        ↓
Backend parses Excel → returns JSON
        ↓
page.tsx stores raw records in React state
        ↓
useMemo hooks filter and aggregate data based on active filters
        ↓
Components receive filtered data and render tables / charts
        ↓
User changes filters → state updates → useMemo recomputes → re-render
```

---

## Notes for Developers

- **No backend database.** All data lives in browser state and is lost on page refresh. Users must re-upload files each session.
- **Dual data paths.** The app distinguishes between 1-to-1 school partnerships (empty `district` field) and district programs (non-empty `district`). Most views have a subview toggle for each.
- **Year inference in date parsing.** `parseDateLabel` in `lib/dailyService.ts` hardcodes school year boundaries (Sep–Dec = 2025, Jan–Aug = 2026). This must be updated each school year.
- **Daily table row limit.** The daily table caps at 200 rows for performance. Use filters to narrow results if needed.
