import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { OrgDashboard } from "@/lib/types/dashboard";
import { formatHeaderDate } from "./dashboard-helpers";

interface DashboardHeaderProps {
  dashboard: OrgDashboard;
}

export function DashboardHeader({ dashboard }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-0.5">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Org risk pulse — jump into overdue work or open an engagement.
        </p>
        <p className="text-xs text-muted-foreground">
          {dashboard.tenant.name} · {formatHeaderDate()}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/engagements">Engagements</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/engagements/new">New engagement</Link>
        </Button>
      </div>
    </div>
  );
}
