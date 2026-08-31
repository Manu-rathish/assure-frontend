"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatActionItemStatus,
  getAllowedTransitions,
} from "./remediation-helpers";

interface RemediationStatusActionsProps {
  status: string;
}

export function RemediationStatusActions({
  status,
}: RemediationStatusActionsProps) {
  const transitions = getAllowedTransitions(status);

  if (status === "closed") {
    return (
      <Card className="gap-0 py-0 ring-1 ring-foreground/10">
        <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
          <CardTitle className="text-sm">Status workflow</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 text-sm text-muted-foreground sm:px-5">
          This action item is closed.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/40 px-4 py-4 sm:px-5">
        <CardTitle className="text-sm">Status workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4 sm:px-5">
        <p className="text-sm text-muted-foreground">
          Advance this action item through remediation stages.
        </p>
        <div className="flex flex-wrap gap-2">
          {transitions.map((next) => (
            <Button
              key={next}
              type="button"
              size="sm"
              variant={next === "closed" ? "outline" : "default"}
              disabled
              title="Coming soon"
            >
              Mark {formatActionItemStatus(next)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Coming soon</p>
      </CardContent>
    </Card>
  );
}
