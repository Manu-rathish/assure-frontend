import type { InboxItemKind } from "@/lib/types/inbox";

const KIND_LABELS: Record<InboxItemKind, string> = {
  idr: "IDR",
  adr: "ADR",
  action_item: "Action",
};

export function InboxKindPill({ kind }: { kind: InboxItemKind }) {
  return (
    <span className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
      {KIND_LABELS[kind]}
    </span>
  );
}
