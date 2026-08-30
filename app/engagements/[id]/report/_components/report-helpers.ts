import type { AuditReport, FindingListItem } from "@/lib/types/finding";

const fmt = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const ACCEPTED_STATUSES = new Set([
  "accepted",
  "in_remediation",
  "verified",
  "closed",
]);

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return fmt.format(d);
}

export function countAccepted(findings: FindingListItem[]) {
  return findings.filter((f) => ACCEPTED_STATUSES.has(f.status)).length;
}

export function countDisputed(findings: FindingListItem[]) {
  return findings.filter((f) => f.status === "disputed").length;
}

export function countRepeat(findings: FindingListItem[]) {
  return findings.filter((f) => f.isRepeat).length;
}

export function countInRemediation(findings: FindingListItem[]) {
  return findings.filter((f) => f.status === "in_remediation").length;
}

export function countPendingReview(findings: FindingListItem[]) {
  return findings.filter((f) => f.status === "draft").length;
}

export function sumOpenActionItems(findings: FindingListItem[]) {
  return findings.reduce((sum, f) => sum + f.actionItemsOpen, 0);
}

export function countOverdueFindings(findings: FindingListItem[], now = Date.now()) {
  return findings.filter((f) => {
    if (!f.targetCloseDate) return false;
    const due = new Date(f.targetCloseDate).getTime();
    if (Number.isNaN(due)) return false;
    return due < now && f.status !== "verified" && f.status !== "closed";
  }).length;
}

export function latestReport(reports: AuditReport[]) {
  if (reports.length === 0) return null;
  return [...reports].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  )[0];
}

export function reportFileTypeLabel(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "DOC";
  return "FILE";
}
