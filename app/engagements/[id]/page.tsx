import { notFound } from "next/navigation";
import { OverviewView } from "@/app/engagements/[id]/_components/overview-view";
import { getEngagementDetailApi } from "@/lib/api/engagements";
import { ApiClientError } from "@/lib/api/types";

export default async function EngagementOverviewPage({
  params,
}: PageProps<"/engagements/[id]">) {
  const { id } = await params;

  try {
    const overview = await getEngagementDetailApi(id);
    return <OverviewView overview={overview} />;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
