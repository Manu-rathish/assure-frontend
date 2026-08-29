import type {
  AskReaction,
  ExaminationAsk,
  ExaminationDailyPulse,
  ExaminationThread,
} from "@/lib/types/examination";

const FMT_TIME = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const FMT_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const REACTIONS: { value: AskReaction; label: string }[] = [
  { value: "accepted", label: "Accepted" },
  { value: "probed_further", label: "Probed further" },
  { value: "concern", label: "Concern" },
  { value: "follow_up", label: "Follow-up" },
];

export function resolveActiveThreadId(
  threads: ExaminationThread[],
  threadParam: string | undefined,
): string | null {
  if (threads.length === 0) return null;
  if (threadParam && threads.some((t) => t.id === threadParam)) {
    return threadParam;
  }
  return threads[0].id;
}

export function sortAsksByRecency(asks: ExaminationAsk[]) {
  return [...asks].sort(
    (a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime(),
  );
}

export function formatAskTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return FMT_TIME.format(d);
}

export function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return FMT_DATE.format(d);
}

export function formatExamWindow(start: string | null, end: string | null) {
  const a = formatDate(start);
  const b = formatDate(end);
  if (a && b) return `${a} – ${b}`;
  if (a) return `From ${a}`;
  if (b) return `Until ${b}`;
  return null;
}

export function computeExamDay(start: string | null, now = Date.now()) {
  if (!start) return null;
  const startMs = new Date(start).getTime();
  if (Number.isNaN(startMs)) return null;
  const day = Math.ceil((now - startMs) / (1000 * 60 * 60 * 24));
  return Math.max(1, day);
}

export function suggestNextAskCode(allAsks: ExaminationAsk[]): string {
  let max = 0;
  for (const ask of allAsks) {
    const match = /^A-(\d+)$/i.exec(ask.askCode.trim());
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `A-${String(max + 1).padStart(3, "0")}`;
}

export function reactionLabel(reaction: string | null) {
  if (!reaction) return null;
  return (
    REACTIONS.find((r) => r.value === reaction)?.label ??
    reaction.replaceAll("_", " ")
  );
}

export function reactionRowBorder(reaction: string | null): string {
  switch (reaction) {
    case "accepted":
      return "border-l-emerald-500";
    case "probed_further":
      return "border-l-amber-500";
    case "concern":
      return "border-l-destructive";
    case "follow_up":
      return "border-l-primary";
    default:
      return "border-l-transparent";
  }
}

export function computeHeaderKpis(
  threads: ExaminationThread[],
  activeAsks: ExaminationAsk[],
  asksTotalFromOverview: number,
  pulse: ExaminationDailyPulse,
) {
  return {
    threads: threads.length,
    totalAsks: asksTotalFromOverview,
    activeThreadAsks: activeAsks.length,
    concerns: pulse.concerns,
  };
}
