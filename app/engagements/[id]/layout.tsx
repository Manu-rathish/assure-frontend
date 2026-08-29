import { EngagementSubnav } from "@/app/engagements/[id]/_components/engagement-subnav";

export default async function EngagementLayout({
  children,
  params,
}: LayoutProps<"/engagements/[id]">) {
  const { id } = await params;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <EngagementSubnav engagementId={id} />
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}
