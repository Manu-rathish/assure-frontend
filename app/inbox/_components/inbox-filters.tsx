"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { InboxEngagementFilter, InboxSearchParams } from "@/lib/types/inbox";
import { buildInboxHref } from "./inbox-helpers";

interface InboxFiltersProps {
  params: InboxSearchParams;
  engagementFilters: InboxEngagementFilter[];
}

const VISIBLE_CHIP_COUNT = 5;

export function InboxFilters({
  params,
  engagementFilters,
}: InboxFiltersProps) {
  const router = useRouter();
  const hasFilters = Boolean(params.engagementId || params.q);
  const visible = engagementFilters.slice(0, VISIBLE_CHIP_COUNT);
  const overflow = engagementFilters.length - VISIBLE_CHIP_COUNT;

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("q") ?? "").trim().toLowerCase();
    router.push(
      buildInboxHref({
        tab: params.tab,
        engagementId: params.engagementId,
        q: q || undefined,
      }),
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <form
        onSubmit={handleSearch}
        className="flex w-full max-w-xs gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Search items…"
            aria-label="Search inbox items"
            className={cn("h-8 pl-8 text-sm", controlFocusClass)}
          />
        </div>
        <Button type="submit" size="sm" className="h-8 shrink-0">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={!params.engagementId ? "secondary" : "outline"}
          className={cn(
            "h-7 text-xs",
            params.engagementId && "text-muted-foreground",
          )}
          asChild
        >
          <Link
            href={buildInboxHref({
              tab: params.tab,
              q: params.q,
            })}
          >
            All
          </Link>
        </Button>

        {visible.map((engagement) => {
          const active = params.engagementId === engagement.id;
          return (
            <Button
              key={engagement.id}
              size="sm"
              variant={active ? "secondary" : "outline"}
              className={cn(
                "h-7 text-xs",
                !active && "text-muted-foreground",
              )}
              asChild
            >
              <Link
                href={buildInboxHref({
                  tab: params.tab,
                  engagementId: engagement.id,
                  q: params.q,
                })}
              >
                {engagement.code}
              </Link>
            </Button>
          );
        })}

        {overflow > 0 ? (
          <span className="text-xs text-muted-foreground">
            +{overflow} more
          </span>
        ) : null}

        {hasFilters ? (
          <Button variant="ghost" size="sm" className="h-7" asChild>
            <Link href={buildInboxHref({ tab: params.tab })}>
              <X className="size-3.5" aria-hidden />
              Clear
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
