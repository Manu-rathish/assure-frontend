import { Suspense } from "react";
import { pageShellClass } from "@/components/app-shell/page-shell";
import { PageReveal, SectionItem, SectionStagger } from "@/lib/motion";
import type { RemediationRegisterPageData } from "@/lib/types/remediation";
import { RemediationRegisterHeader } from "./remediation-register-header";
import { RemediationRegisterKpiRow } from "./remediation-register-kpi-row";
import { RemediationRegisterFilterBar } from "./remediation-register-filter-bar";
import { RemediationRegisterTable } from "./remediation-register-table";

interface RemediationRegisterViewProps {
  data: RemediationRegisterPageData;
}

export function RemediationRegisterView({ data }: RemediationRegisterViewProps) {
  return (
    <main className="min-h-[calc(100dvh-3.5rem)] min-w-0">
      <PageReveal className={pageShellClass}>
        <SectionStagger className="flex min-w-0 flex-col gap-6">
          <SectionItem className="min-w-0">
            <RemediationRegisterHeader summary={data.summary} />
          </SectionItem>

          <SectionItem className="min-w-0">
            <RemediationRegisterKpiRow summary={data.summary} params={data.params} />
          </SectionItem>

          <SectionItem className="min-w-0 space-y-4">
            <Suspense fallback={null}>
              <RemediationRegisterFilterBar data={data} />
            </Suspense>
          </SectionItem>

          <SectionItem className="min-w-0">
            <RemediationRegisterTable items={data.filteredItems} />
          </SectionItem>
        </SectionStagger>
      </PageReveal>
    </main>
  );
}
