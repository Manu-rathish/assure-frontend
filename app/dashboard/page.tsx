import { DashboardView } from "@/app/dashboard/_components/dashboard-view";
import { getDashboardApi } from "@/lib/api/dashboard";

export default async function DashboardPage() {
  const dashboard = await getDashboardApi();
  return <DashboardView dashboard={dashboard} />;
}
