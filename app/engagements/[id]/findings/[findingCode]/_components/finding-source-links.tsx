import Link from "next/link";
import type { FindingSourceLink } from "@/lib/types/finding";

interface FindingSourceLinksProps {
  engagementId: string;
  sourceLinks: FindingSourceLink[];
}

export function FindingSourceLinks({
  engagementId,
  sourceLinks,
}: FindingSourceLinksProps) {
  if (sourceLinks.length === 0) return null;

  return (
    <div className="space-y-3">
      {sourceLinks.map((link) => {
        const body =
          link.note ?? link.idrQuestionText ?? link.adrQuestionText ?? "—";

        return (
          <div key={link.id} className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {link.idrLineRef ? (
                <Link
                  href={`/engagements/${engagementId}/idr/lines/${link.idrLineRef}`}
                  className="inline-flex rounded-sm border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary hover:bg-primary/10"
                >
                  IDR · {link.idrLineRef}
                </Link>
              ) : null}
              {link.adrLineRef ? (
                <Link
                  href={`/engagements/${engagementId}/adr/lines/${link.adrLineRef}`}
                  className="inline-flex rounded-sm border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary hover:bg-primary/10"
                >
                  ADR · {link.adrLineRef}
                </Link>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">{body}</p>
          </div>
        );
      })}
    </div>
  );
}
