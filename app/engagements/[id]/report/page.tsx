import { pageShellClass } from "@/components/app-shell/page-shell";

export default async function ReportPage({
  params,
}: PageProps<"/engagements/[id]/report">) {
  const { id } = await params;
  return (
    <main className={pageShellClass}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Report</h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">{id}</p>
    </main>
  );
}
