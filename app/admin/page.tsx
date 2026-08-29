import Link from "next/link";
import { pageShellClass } from "@/components/app-shell/page-shell";

export default function AdminPage() {
  return (
    <main className={pageShellClass}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin</h1>
      <p className="text-muted-foreground">
        Tenant administration — coming soon.
      </p>
      <nav className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          href="/admin/users"
          className="text-primary hover:underline"
        >
          Users
        </Link>
        <Link
          href="/admin/teams"
          className="text-primary hover:underline"
        >
          Teams
        </Link>
      </nav>
    </main>
  );
}
