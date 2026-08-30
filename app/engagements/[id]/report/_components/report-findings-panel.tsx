"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FindingListItem } from "@/lib/types/finding";
import { FindingsToolbar } from "@/app/engagements/[id]/findings/_components/findings-toolbar";
import { FindingsTable } from "@/app/engagements/[id]/findings/_components/findings-table";
import {
  filterAndSortFindings,
  type FindingQuickFilter,
} from "@/app/engagements/[id]/findings/_components/findings-filters";

interface ReportFindingsPanelProps {
  engagementId: string;
  findings: FindingListItem[];
}

export function ReportFindingsPanel({
  engagementId,
  findings,
}: ReportFindingsPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FindingQuickFilter>("all");

  const visible = useMemo(
    () => filterAndSortFindings(findings, search, filter),
    [findings, search, filter],
  );

  const showClearFilters =
    findings.length > 0 &&
    visible.length === 0 &&
    (search !== "" || filter !== "all");

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <section id="findings-register" className="scroll-mt-24 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Findings</h2>
          <p className="text-sm text-muted-foreground">
            Register of auditor findings — review severity, dispute or accept,
            and trace sources to IDR and ADR.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            window.alert("Coming soon");
          }}
        >
          <Plus className="size-3.5" aria-hidden />
          Add finding
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
        <FindingsToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          visibleCount={visible.length}
          totalCount={findings.length}
          onClearFilters={clearFilters}
          showClearFilters={showClearFilters}
        />
        <div className="overflow-x-auto">
          <FindingsTable
            engagementId={engagementId}
            findings={visible}
            totalCount={findings.length}
            showClearFilters={showClearFilters}
            onClearFilters={clearFilters}
          />
        </div>
      </Card>
    </section>
  );
}
