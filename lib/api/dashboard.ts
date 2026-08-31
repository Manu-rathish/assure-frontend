import { loadDummy } from "@/lib/data/dummy";
import { buildOrgDashboardViewModel } from "@/app/dashboard/_components/dashboard-helpers";
import type { OrgDashboard } from "@/lib/types/dashboard";

export async function getDashboardApi(): Promise<OrgDashboard> {
  const data = loadDummy();
  return buildOrgDashboardViewModel(data);
}
