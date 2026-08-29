export const easeOut = [0.23, 1, 0.32, 1] as const;

export const duration = {
  press: 0.14,
  hover: 0.16,
  snappy: 0.22,
  enter: 0.28,
  page: 0.3,
  chart: 0.36,
  barFill: 0.45,
} as const;

export const springUi = {
  type: "spring" as const,
  stiffness: 400,
  damping: 34,
};

export const stagger = {
  section: 0.05,
  sectionDelay: 0.04,
  list: 0.05,
  listDelay: 0.02,
};

export const ROW_HOVER_CLASS =
  "transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted/50 [@media(hover:hover)_and_(pointer:fine)]:hover:border-foreground/15 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-sm";

export const tableRowInteractiveClass = "hover:bg-primary/10";

export function tapScale(reduce: boolean | null) {
  return reduce ? undefined : { scale: 0.98 };
}

export const listContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger.list,
      delayChildren: stagger.listDelay,
    },
  },
};

export const listItem = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springUi,
  },
};

export const listItemReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } },
};
