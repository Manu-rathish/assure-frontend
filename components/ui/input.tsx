import * as React from "react";
import { cn } from "@/lib/utils";
import { controlFocusClass } from "./focus-styles";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-7 w-full rounded-sm border border-input bg-input/20 px-2.5 text-sm md:text-xs/relaxed placeholder:text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        controlFocusClass,
        className,
      )}
      {...props}
    />
  );
}
