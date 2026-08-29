import { pageShellClass } from "@/components/app-shell/page-shell";

export default function InboxPage() {
  return (
    <main className={pageShellClass}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Inbox</h1>
      <p className="text-muted-foreground">
        Your assigned lines and approvals — coming soon.
      </p>
    </main>
  );
}
