"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { controlFocusClass } from "@/components/ui/focus-styles";
import { cn } from "@/lib/utils";
import type { RemediationRegisterPageData } from "@/lib/types/remediation";
import {
  buildRegisterHref,
  hasActiveRegisterFilters,
  REGISTER_STATUS_CHIPS,
} from "./remediation-register-helpers";

interface RemediationRegisterFilterBarProps {
  data: RemediationRegisterPageData;
}

export function RemediationRegisterFilterBar({
  data,
}: RemediationRegisterFilterBarProps) {
  const router = useRouter();
  const { params, engagementFilters, items, filteredItems } = data;
  const showCaption = hasActiveRegisterFilters(params);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("q") ?? "").trim().toLowerCase();
    router.push(
      buildRegisterHref({
        ...params,
        q: q || undefined,
      }),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-xs gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
              placeholder="Search action item…"
              aria-label="Search action items"
              className={cn("h-8 pl-8 text-sm", controlFocusClass)}
            />
          </div>
          <Button type="submit" size="sm" className="h-8 shrink-0">
            Search
          </Button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!params.engagementId ? "secondary" : "outline"}
            className={cn(
              "h-7 text-xs",
              params.engagementId && "text-muted-foreground",
            )}
            asChild
          >
            <Link href={buildRegisterHref({ ...params, engagementId: undefined })}>
              All engagements
            </Link>
          </Button>
          {engagementFilters.map((engagement) => {
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
                  href={buildRegisterHref({
                    ...params,
                    engagementId: engagement.id,
                  })}
                >
                  {engagement.code}
                </Link>
              </Button>
            );
          })}
        </div>

        <div
          className="flex w-max max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/50 p-0.5"
          role="tablist"
          aria-label="Filter by status"
        >
          {REGISTER_STATUS_CHIPS.map((chip) => {
            const active = params.status === chip.status || (!params.status && !chip.status);
            return (
              <Link
                key={chip.label}
                href={buildRegisterHref({
                  ...params,
                  status: chip.status,
                })}
                role="tab"
                aria-selected={active}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  controlFocusClass,
                  active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
                )}
              >
                {chip.label}
              </Link>
            );
          })}
        </div>
      </div>

      {showCaption ? (
        <p className="text-xs text-muted-foreground">
          Showing {filteredItems.length} of {items.length} action items
        </p>
      ) : null}
    </div>
  );
}
