"use client";

import { useMemo, useState } from "react";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { Card } from "@/components/ui/card";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { FindingListItem } from "@/lib/types/finding";
import { FindingsRegisterHeader } from "./findings-register-header";
import { FindingsToolbar } from "./findings-toolbar";
import { FindingsTable } from "./findings-table";
import {
  filterAndSortFindings,
  type FindingQuickFilter,
} from "./findings-filters";

export type FindingsRegisterProps = {
  engagementId: string;
  engagementCode: string;
  findings: FindingListItem[];
};

export function FindingsRegister({
  engagementId,
  engagementCode,
  findings,
}: FindingsRegisterProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FindingQuickFilter>("all");

  const visible = useMemo(
    () => filterAndSortFindings(findings, search, filter),
    [findings, search, filter],
  );

  const showClearFilters =
    findings.length > 0 && visible.length === 0 && (search !== "" || filter !== "all");

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <main className="min-h-[calc(100dvh-3.5rem-3rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <FindingsRegisterHeader
              engagementCode={engagementCode}
              findings={findings}
            />
          </SectionItem>

          <SectionItem className="min-w-0">
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
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
