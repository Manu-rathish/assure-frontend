"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { duration, easeOut } from "./tokens";

export function PageReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("flex flex-col", className)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: duration.page, ease: easeOut }
      }
    >
      {children}
    </motion.div>
  );
}

export function SectionStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: reduce
            ? { duration: 0 }
            : {
                staggerChildren: 0.05,
                delayChildren: 0.04,
              },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function SectionItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduce
          ? {
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0 } },
            }
          : {
              hidden: { opacity: 0, y: 10 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: duration.enter, ease: easeOut },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function ChartReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, y: 10, scale: 0.98 }
      }
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={
        reduce
          ? { duration: 0 }
          : { duration: duration.chart, ease: easeOut }
      }
    >
      {children}
    </motion.div>
  );
}

export * from "./tokens";
