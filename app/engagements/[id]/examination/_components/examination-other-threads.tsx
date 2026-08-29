import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExaminationThread } from "@/lib/types/examination";

interface ExaminationOtherThreadsProps {
  engagementId: string;
  threads: ExaminationThread[];
  activeThreadId: string;
}

export function ExaminationOtherThreads({
  engagementId,
  threads,
  activeThreadId,
}: ExaminationOtherThreadsProps) {
  const others = threads.filter((t) => t.id !== activeThreadId);
  if (others.length === 0) return null;

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
        <CardTitle className="text-sm">Other threads</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/40 px-0 py-0">
        {others.map((thread) => (
          <div
            key={thread.id}
            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{thread.name}</p>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {thread.askCount} asks
                {thread.concernCount > 0 ? (
                  <span className="text-destructive">
                    {" "}
                    · {thread.concernCount} concern
                  </span>
                ) : null}
              </p>
            </div>
            <Link
              href={`/engagements/${engagementId}/examination?thread=${thread.id}`}
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Open →
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
