"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FindingListItem } from "@/lib/types/finding";
import type { ActionItemListItem } from "@/lib/types/remediation";
import type { Team } from "@/lib/types/org";
import { countOpenWork } from "./remediation-helpers";
import { RemediationCreateDialog } from "./remediation-create-dialog";

interface RemediationHubHeaderProps {
  engagementCode: string;
  findings: FindingListItem[];
  items: ActionItemListItem[];
  teams: Team[];
  canCreate: boolean;
}

export function RemediationHubHeader({
  engagementCode,
  findings,
  items,
  teams,
  canCreate,
}: RemediationHubHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const openCount = countOpenWork(items);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
            {engagementCode}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Remediation
          </h1>
          <p className="text-muted-foreground">
            {findings.length} findings · {items.length} action items ·{" "}
            {openCount} open
          </p>
        </div>
        {canCreate ? (
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" aria-hidden />
            Add action item
          </Button>
        ) : null}
      </div>

      <RemediationCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        teams={teams}
        items={items}
      />
    </>
  );
}
