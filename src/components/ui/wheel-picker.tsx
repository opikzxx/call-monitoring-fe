"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const SCROLL_SETTLE_MS = 120;

type WheelPickerOption<T extends string | number> = {
  value: T;
  label: string;
};

type WheelPickerColumnProps<T extends string | number> = {
  options: WheelPickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function WheelPickerColumn<T extends string | number>(
  props: WheelPickerColumnProps<T>,
) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hasMounted = React.useRef(false);
  const scrollTimeout = React.useRef<ReturnType<typeof setTimeout>>(null);
  const selectedIndex = props.options.findIndex(
    (option) => option.value === props.value,
  );

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || selectedIndex < 0) return;

    const targetTop = selectedIndex * ITEM_HEIGHT;
    el.scrollTo({
      top: targetTop,
      behavior: hasMounted.current ? "smooth" : "auto",
    });
    hasMounted.current = true;
  }, [selectedIndex]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.min(
        Math.max(index, 0),
        props.options.length - 1,
      );
      const option = props.options[clampedIndex];
      if (option && option.value !== props.value) {
        props.onChange(option.value);
      }
    }, SCROLL_SETTLE_MS);
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn(
        "h-(--wheel-height) snap-y snap-mandatory overflow-y-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        props.className,
      )}
      style={
        {
          "--wheel-height": `${ITEM_HEIGHT * VISIBLE_ROWS}px`,
          paddingBlock: (ITEM_HEIGHT * (VISIBLE_ROWS - 1)) / 2,
        } as React.CSSProperties
      }
    >
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => props.onChange(option.value)}
          className={cn(
            "flex h-11 w-full shrink-0 snap-center items-center justify-center text-base transition-colors",
            option.value === props.value
              ? "font-semibold text-foreground"
              : "text-muted-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
