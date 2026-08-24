"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CallMonitoringFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
};

export function CallMonitoringFilterBar(props: CallMonitoringFilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 md:max-w-xs">
        <Input
          value={props.search}
          onChange={(event) => props.onSearchChange(event.target.value)}
          placeholder="Cari Call ID, CS, atau nasabah"
          className="h-12 rounded-xl pr-11"
        />
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
      </div>

      <button
        type="button"
        onClick={props.onOpenFilters}
        aria-label="Buka filter"
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted"
        )}
      >
        <SlidersHorizontal className="size-4" />
        {props.activeFilterCount > 0 ? (
          <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full text-[10px] font-semibold">
            {props.activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
