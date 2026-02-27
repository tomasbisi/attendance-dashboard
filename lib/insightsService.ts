import type { AttendanceRecord } from "./dataService";
import type { WeeklyRecord } from "./weeklyService";
import type { DailyRecord } from "./dailyService";

export type InsightSeverity = "critical" | "warning" | "opportunity";

export interface InsightItem {
  id: string;
  severity: InsightSeverity;
  pattern: string;
  finding: string;
  affected: string;
  studentsImpacted: number;
  action: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}

// ── detectors ────────────────────────────────────────────────────────────────

function detectDistrictGap(records: AttendanceRecord[]): InsightItem[] {
  const byDistrict = groupBy(records.filter(r => r.district), r => r.district);
  if (Object.keys(byDistrict).length < 2) return [];

  const districtAvgs = Object.entries(byDistrict).map(([d, recs]) => ({
    d,
    rate: avg(recs.map(r => r.attendanceRate)),
    count: recs.length,
  }));

  const best = districtAvgs.reduce((a, b) => (a.rate > b.rate ? a : b));
  const worst = districtAvgs.reduce((a, b) => (a.rate < b.rate ? a : b));
  const gap = best.rate - worst.rate;
  if (gap < 15) return [];

  return [{
    id: "district-gap",
    severity: "critical",
    pattern: "District Attendance Gap",
    finding: `${worst.d} averages ${Math.round(worst.rate)}% attendance — ${Math.round(gap)}pp below ${best.d} (${Math.round(best.rate)}%). All schools in the lower district are underperforming.`,
    affected: worst.d,
    studentsImpacted: worst.count,
    action: `Conduct a district-level program audit for ${worst.d}. Deploy a family engagement coordinator, introduce attendance incentive program, and investigate whether schedule or transportation barriers exist.`,
  }];
}

function detectHighRiskSchools(records: AttendanceRecord[]): InsightItem[] {
  const bySchool = groupBy(records, r => r.schoolName);
  const insights: InsightItem[] = [];

  for (const [school, recs] of Object.entries(bySchool)) {
    const atRisk = recs.filter(r => r.attendanceRate < 60).length;
    const rate = atRisk / recs.length;
    if (rate >= 0.35) {
      insights.push({
        id: `high-risk-${school}`,
        severity: "critical",
        pattern: "High At-Risk Concentration",
        finding: `${atRisk} of ${recs.length} students (${Math.round(rate * 100)}%) at ${school} have attendance below 60%.`,
        affected: school,
        studentsImpacted: atRisk,
        action: `Send targeted re-engagement outreach to at-risk students at ${school}. Offer make-up sessions, 1-on-1 check-ins, and remove any logistical barriers preventing attendance.`,
      });
    }
  }
  return insights;
}

function detectOpenSlotsWithWaitlist(weeklyRecords: WeeklyRecord[]): InsightItem[] {
  const insights: InsightItem[] = [];

  for (const r of weeklyRecords) {
    const openSlots = r.maxCapacity - r.totalEnrolled;
    if (openSlots > 0 && r.waitroom > 0) {
      const convertible = Math.min(openSlots, r.waitroom);
      insights.push({
        id: `open-slots-${r.schoolName}-${r.activity}`,
        severity: "critical",
        pattern: "Waitlisted Students Not Enrolled",
        finding: `${r.schoolName} — ${r.activity} has ${openSlots} open seat${openSlots > 1 ? "s" : ""} with ${r.waitroom} student${r.waitroom > 1 ? "s" : ""} on the waitlist. ${convertible} student${convertible > 1 ? "s" : ""} could enroll immediately.`,
        affected: `${r.schoolName} · ${r.activity}`,
        studentsImpacted: convertible,
        action: `Contact the ${r.waitroom} waitlisted students for ${r.activity} at ${r.schoolName} immediately to fill ${openSlots} open seats. Update enrollment records and confirm spots within 48 hours.`,
      });
    }
  }

  return insights;
}

function detectWeek2Drops(weeklyRecords: WeeklyRecord[]): InsightItem[] {
  const insights: InsightItem[] = [];
  const THRESHOLD = 15;

  for (const r of weeklyRecords) {
    if (r.weeks.length < 2) continue;
    const w1 = r.weeks[0].attPct;
    const w2 = r.weeks[1].attPct;
    if (w1 < 10 || w2 < 10) continue;
    const drop = w1 - w2;
    if (drop >= THRESHOLD) {
      insights.push({
        id: `week2-drop-${r.schoolName}-${r.activity}`,
        severity: "warning",
        pattern: "Early Disengagement",
        finding: `${r.schoolName} — ${r.activity} dropped from ${Math.round(w1)}% to ${Math.round(w2)}% attendance in week 2 (−${Math.round(drop)}pp). Strong start but rapid falloff signals retention issue.`,
        affected: `${r.schoolName} · ${r.activity}`,
        studentsImpacted: r.totalEnrolled,
        action: `Reach out to absent students after the first week drop at ${r.schoolName} — ${r.activity}. Send reminder communications to parents/guardians and consider adding an engagement hook (e.g., a milestone reward or class event) in week 3.`,
      });
    }
  }

  return insights;
}

function detectHighEnrollLowAttendance(records: AttendanceRecord[]): InsightItem[] {
  const byActivity = groupBy(records, r => r.activity);
  const overallAvgAtt = avg(records.map(r => r.attendanceRate));
  const overallEnrollRate = records.filter(r => r.enrolled).length / records.length * 100;
  const insights: InsightItem[] = [];

  for (const [activity, recs] of Object.entries(byActivity)) {
    const enrollRate = recs.filter(r => r.enrolled).length / recs.length * 100;
    const attRate = avg(recs.map(r => r.attendanceRate));
    // High enrollment but attendance well below average
    if (enrollRate > overallEnrollRate && attRate < overallAvgAtt - 8) {
      insights.push({
        id: `commit-gap-${activity}`,
        severity: "warning",
        pattern: "Commitment Gap",
        finding: `${activity} has ${Math.round(enrollRate)}% enrollment (above average) but only ${Math.round(attRate)}% attendance (${Math.round(overallAvgAtt - attRate)}pp below average). Students are signing up but not showing up.`,
        affected: activity,
        studentsImpacted: recs.filter(r => r.enrolled).length,
        action: `Audit the ${activity} program experience — check scheduling conflicts, instructor engagement, and activity format. Survey enrolled students to identify why they're missing sessions and adjust delivery accordingly.`,
      });
    }
  }

  return insights;
}

function detectLowEnrollLowAttend(records: AttendanceRecord[]): InsightItem[] {
  const byActivity = groupBy(records, r => r.activity);
  const overallAvgAtt = avg(records.map(r => r.attendanceRate));
  const overallEnrollRate = records.filter(r => r.enrolled).length / records.length * 100;
  const insights: InsightItem[] = [];

  for (const [activity, recs] of Object.entries(byActivity)) {
    const enrollRate = recs.filter(r => r.enrolled).length / recs.length * 100;
    const attRate = avg(recs.map(r => r.attendanceRate));
    const waitlist = recs.filter(r => r.waitlist).length;
    if (enrollRate < overallEnrollRate - 5 && attRate < overallAvgAtt - 5 && waitlist < 15) {
      insights.push({
        id: `weak-activity-${activity}`,
        severity: "warning",
        pattern: "Underperforming Activity",
        finding: `${activity} ranks lowest on both enrollment (${Math.round(enrollRate)}%) and attendance (${Math.round(attRate)}%) with only ${waitlist} students on the waitlist — low demand and poor retention.`,
        affected: activity,
        studentsImpacted: recs.length,
        action: `Evaluate whether to restructure or phase out ${activity}. If keeping it, rebrand with a new format, demo day, or trial offer to boost interest. Consider replacing with higher-demand alternatives like Cooking or Yoga.`,
      });
    }
  }

  return insights;
}

function detectOversubscribedActivities(weeklyRecords: WeeklyRecord[]): InsightItem[] {
  // Activities where multiple school/activity combos are at 100% enrollment with waitlist
  const byActivity = groupBy(weeklyRecords, r => r.activity);
  const insights: InsightItem[] = [];

  for (const [activity, recs] of Object.entries(byActivity)) {
    const atCapacity = recs.filter(r => r.totalEnrolled >= r.maxCapacity);
    const totalWaitroom = recs.reduce((s, r) => s + r.waitroom, 0);
    const schoolsAtCapacity = [...new Set(atCapacity.map(r => r.schoolName))];
    if (schoolsAtCapacity.length >= 2 && totalWaitroom >= 8) {
      insights.push({
        id: `oversubscribed-${activity}`,
        severity: "opportunity",
        pattern: "Oversubscribed Activity",
        finding: `${activity} is at full capacity at ${schoolsAtCapacity.length} schools with ${totalWaitroom} total students waitlisted. Demand exceeds supply.`,
        affected: schoolsAtCapacity.join(", "),
        studentsImpacted: totalWaitroom,
        action: `Add a second section of ${activity} at oversubscribed schools or open it at schools that currently don't offer it. Convert waitlisted students immediately upon adding capacity.`,
      });
    }
  }

  return insights;
}

function detectHighAttendLowReach(records: AttendanceRecord[], weeklyRecords: WeeklyRecord[]): InsightItem[] {
  const byActivity = groupBy(records, r => r.activity);
  const allActivities = Object.keys(byActivity);
  const overallAvgAtt = avg(records.map(r => r.attendanceRate));
  const insights: InsightItem[] = [];

  for (const [activity, recs] of Object.entries(byActivity)) {
    const attRate = avg(recs.map(r => r.attendanceRate));
    const schoolCount = new Set(recs.map(r => r.schoolName)).size;
    const totalSchools = new Set(records.map(r => r.schoolName)).size;
    // High attendance but appears in less than half of schools
    if (attRate > overallAvgAtt + 3 && schoolCount <= totalSchools / 2 && recs.length < 60) {
      const weeklyWaitlist = weeklyRecords.filter(r => r.activity === activity).reduce((s, r) => s + r.waitroom, 0);
      insights.push({
        id: `expand-${activity}`,
        severity: "opportunity",
        pattern: "Expansion Opportunity",
        finding: `${activity} has a ${Math.round(attRate)}% attendance rate (above average) but is only offered at ${schoolCount} of ${totalSchools} schools. ${weeklyWaitlist > 0 ? weeklyWaitlist + " students are already waitlisted." : "Unmet demand likely exists."}`,
        affected: `${schoolCount} schools currently`,
        studentsImpacted: totalSchools - schoolCount,
        action: `Expand ${activity} to the remaining ${totalSchools - schoolCount} schools. Given its high attendance rate, it is a proven draw. Prioritize schools with low overall attendance first to use it as an engagement lever.`,
      });
    }
  }

  return insights;
}

function detectIndependentSchoolPlateau(records: AttendanceRecord[]): InsightItem[] {
  const independent = records.filter(r => !r.district || r.district.trim() === "");
  if (independent.length === 0) return [];

  const districtRecords = records.filter(r => r.district && r.district.trim() !== "");
  if (districtRecords.length === 0) return [];

  const indAvg = avg(independent.map(r => r.attendanceRate));
  const distAvg = avg(districtRecords.map(r => r.attendanceRate));
  const indSchools = new Set(independent.map(r => r.schoolName)).size;

  // Only flag if there's a meaningful gap
  if (Math.abs(indAvg - distAvg) < 5) return [];

  const better = indAvg > distAvg ? "above" : "below";
  if (better === "above") return [];

  return [{
    id: "independent-plateau",
    severity: "warning",
    pattern: "Independent Schools Underperform",
    finding: `${indSchools} schools without district affiliation average ${Math.round(indAvg)}% attendance — ${Math.round(distAvg - indAvg)}pp below district-affiliated schools (${Math.round(distAvg)}%). They lack coordinated support.`,
    affected: `${indSchools} independent schools`,
    studentsImpacted: independent.length,
    action: `Form a peer network or resource-sharing group for independent schools. Assign a regional coordinator to provide the same programmatic support and accountability structures that district schools receive.`,
  }];
}

// ── main export ───────────────────────────────────────────────────────────────

export function generateInsights(
  records1to1: AttendanceRecord[],
  recordsDistricts: AttendanceRecord[],
  weeklyRecords: WeeklyRecord[],
  _dailyRecords: DailyRecord[],
): InsightItem[] {
  const allRecords = [...records1to1, ...recordsDistricts];

  const insights: InsightItem[] = [
    ...detectDistrictGap(recordsDistricts),
    ...detectHighRiskSchools(allRecords),
    ...detectOpenSlotsWithWaitlist(weeklyRecords),
    ...detectWeek2Drops(weeklyRecords),
    ...detectHighEnrollLowAttendance(allRecords),
    ...detectLowEnrollLowAttend(allRecords),
    ...detectOversubscribedActivities(weeklyRecords),
    ...detectHighAttendLowReach(allRecords, weeklyRecords),
    ...detectIndependentSchoolPlateau(allRecords),
  ];

  // Sort: critical → warning → opportunity, then by studentsImpacted desc
  const order: Record<InsightSeverity, number> = { critical: 0, warning: 1, opportunity: 2 };
  return insights.sort((a, b) =>
    order[a.severity] !== order[b.severity]
      ? order[a.severity] - order[b.severity]
      : b.studentsImpacted - a.studentsImpacted,
  );
}
