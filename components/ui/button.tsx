import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { controlFocusClass } from "./focus-styles";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-sm text-xs/relaxed font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 active:not-aria-[haspopup]:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border border-border bg-transparent hover:bg-primary/10 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-primary/10 hover:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "p-2.5 [&_svg]:size-3.5",
        sm: "p-2 text-xs [&_svg]:size-3",
        xs: "p-1.5 text-[0.625rem] gap-1 [&_svg]:size-2.5",
        icon: "p-2.5 [&_svg]:size-3.5",
        "icon-sm": "p-2 [&_svg]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), controlFocusClass, className)}
      {...props}
    />
  );
}
