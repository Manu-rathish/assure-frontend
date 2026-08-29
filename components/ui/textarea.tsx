import * as React from "react";
import { cn } from "@/lib/utils";
import { controlFocusClass } from "./focus-styles";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-16 w-full rounded-sm border border-input bg-input/20 px-2 py-2 text-sm md:text-xs/relaxed placeholder:text-muted-foreground resize-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        controlFocusClass,
        className,
      )}
      {...props}
    />
  );
}
