"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExaminationEmptyStateProps {
  onAddThread: () => void;
}

export function ExaminationEmptyState({ onAddThread }: ExaminationEmptyStateProps) {
  return (
    <Card className="gap-0 p-6 text-center sm:p-8">
      <CardHeader className="items-center px-0">
        <CardTitle>No examination threads yet</CardTitle>
        <CardDescription className="max-w-md text-balance">
          Examination rooms appear here when BDTS opens a journal for onsite
          sessions. Create the first thread to start capturing asks.
        </CardDescription>
        <Button type="button" className="mt-4" onClick={onAddThread}>
          Add thread
        </Button>
      </CardHeader>
    </Card>
  );
}
