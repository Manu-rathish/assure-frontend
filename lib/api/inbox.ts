import { loadDummy } from "@/lib/data/dummy";
import type { InboxView } from "@/lib/types/inbox";

export async function getInboxApi(): Promise<InboxView> {
  const data = loadDummy();
  return data.views.inbox as InboxView;
}
