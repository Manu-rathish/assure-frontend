import { Suspense } from "react";
import { InboxView } from "@/app/inbox/_components/inbox-view";
import {
  buildInboxPageData,
  parseInboxSearchParams,
} from "@/app/inbox/_components/inbox-helpers";
import { getInboxApi } from "@/lib/api/inbox";

export default async function InboxPage({
  searchParams,
}: PageProps<"/inbox">) {
  const rawParams = await searchParams;
  const params = parseInboxSearchParams(rawParams);
  const raw = await getInboxApi();
  const data = buildInboxPageData(raw, params);

  return (
    <Suspense>
      <InboxView data={data} params={params} />
    </Suspense>
  );
}
