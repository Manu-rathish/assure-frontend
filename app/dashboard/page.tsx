import { pageShellClass } from "@/components/app-shell/page-shell";

export default function DashboardPage() {
  return (
    <main className={pageShellClass}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Dashboard
      </h1>
      <p className="text-muted-foreground">
        Security posture overview — coming soon.
      </p>
    </main>
  );
}
