"use client";

import * as React from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SENTIMENT_FILTER } from "@/features/call-monitoring/schema";
import type { SentimentFilter } from "@/features/call-monitoring/schema";

export type CallMonitoringFilterValue = {
  startDate: string;
  endDate: string;
  sentiment: SentimentFilter | "ALL";
};

type DateRangeValue = { from: Date | undefined; to: Date | undefined };

const SENTIMENT_PILLS: { value: SentimentFilter | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua sentimen" },
  { value: SENTIMENT_FILTER.BELOW_70, label: "Di bawah 70%" },
  { value: SENTIMENT_FILTER.AT_LEAST_70, label: "70% atau lebih" },
];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function subtractMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

function subtractDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

type PeriodPreset = {
  key: string;
  label: string;
  getRange: (today: Date) => { from: Date; to: Date };
};

const PERIOD_PRESETS: PeriodPreset[] = [
  {
    key: "3-months",
    label: "3 Bulan Terakhir",
    getRange: (today) => ({ from: subtractMonths(today, 3), to: today }),
  },
  {
    key: "1-month",
    label: "1 Bulan Terakhir",
    getRange: (today) => ({ from: subtractMonths(today, 1), to: today }),
  },
  {
    key: "7-days",
    label: "7 Hari Terakhir",
    getRange: (today) => ({ from: subtractDays(today, 6), to: today }),
  },
  {
    key: "1-day",
    label: "1 Hari Terakhir",
    getRange: (today) => ({ from: today, to: today }),
  },
];

type CallMonitoringFilterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: CallMonitoringFilterValue;
  onApply: (next: CallMonitoringFilterValue) => void;
  fromDate: Date;
  toDate: Date;
};

type CustomDateRangeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: DateRangeValue;
  onApply: (value: DateRangeValue) => void;
  fromDate: Date;
  toDate: Date;
};

function CustomDateRangeModal(props: CustomDateRangeModalProps) {
  const isMobile = useIsMobile();
  const [range, setRange] = React.useState<DateRangeValue>(props.value);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setRange(props.value);
    }
    props.onOpenChange(nextOpen);
  }

  function handleApply() {
    props.onApply(range);
    props.onOpenChange(false);
  }

  const calendar = (
    <Calendar
      mode="range"
      selected={range}
      defaultMonth={range.to ?? props.toDate}
      startMonth={props.fromDate}
      endMonth={props.toDate}
      disabled={[{ before: props.fromDate }, { after: props.toDate }]}
      onSelect={(next) => setRange({ from: next?.from, to: next?.to })}
      className="mx-auto"
    />
  );

  const footerButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => props.onOpenChange(false)}
      >
        Batal
      </Button>
      <Button
        type="button"
        className="flex-1"
        disabled={!range.from || !range.to}
        onClick={handleApply}
      >
        Pilih
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={props.open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Pilih rentang tanggal</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">{calendar}</div>
          <DrawerFooter className="flex-row gap-2">
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pilih rentang tanggal</DialogTitle>
        </DialogHeader>
        {calendar}
        <div className="flex flex-row justify-end gap-2 border-t border-border pt-4">
          {footerButtons}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type FilterFieldsProps = {
  pending: CallMonitoringFilterValue;
  onChange: (
    updater: (prev: CallMonitoringFilterValue) => CallMonitoringFilterValue
  ) => void;
  fromDate: Date;
  toDate: Date;
  className?: string;
};

function FilterFields(props: FilterFieldsProps) {
  const { pending, onChange } = props;
  const [customRangeOpen, setCustomRangeOpen] = React.useState(false);

  const activePreset = PERIOD_PRESETS.find((preset) => {
    const range = preset.getRange(props.toDate);
    return (
      pending.startDate === toIsoDate(range.from) &&
      pending.endDate === toIsoDate(range.to)
    );
  });
  const hasCustomRange =
    !activePreset && Boolean(pending.startDate && pending.endDate);

  function applyRange(range: { from: Date; to: Date }) {
    onChange((prev) => ({
      ...prev,
      startDate: toIsoDate(range.from),
      endDate: toIsoDate(range.to),
    }));
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-6 overflow-y-auto",
        props.className
      )}
    >
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Periode panggilan
          </h3>
          <p className="text-muted-foreground text-xs">
            Hanya tersedia untuk 3 bulan terakhir.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyRange(preset.getRange(props.toDate))}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                activePreset?.key === preset.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustomRangeOpen(true)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              hasCustomRange
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {hasCustomRange
              ? `${format(parseIsoDate(pending.startDate)!, "d MMM")} - ${format(
                  parseIsoDate(pending.endDate)!,
                  "d MMM yyyy"
                )}`
              : "Custom"}
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          Sentimen nasabah
        </h3>
        <div className="flex flex-wrap gap-2">
          {SENTIMENT_PILLS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onChange((prev) => ({ ...prev, sentiment: option.value }))
              }
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                pending.sentiment === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <CustomDateRangeModal
        open={customRangeOpen}
        onOpenChange={setCustomRangeOpen}
        value={{
          from: parseIsoDate(pending.startDate),
          to: parseIsoDate(pending.endDate),
        }}
        onApply={(range) => {
          if (range.from && range.to) {
            applyRange({ from: range.from, to: range.to });
          }
        }}
        fromDate={props.fromDate}
        toDate={props.toDate}
      />
    </div>
  );
}

export function CallMonitoringFilterModal(props: CallMonitoringFilterModalProps) {
  const isMobile = useIsMobile();
  const [pending, setPending] = React.useState(props.value);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setPending(props.value);
    }
    props.onOpenChange(nextOpen);
  }

  function handleReset() {
    setPending({ startDate: "", endDate: "", sentiment: "ALL" });
  }

  function handleApply() {
    props.onApply(pending);
    props.onOpenChange(false);
  }

  const footerButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={handleReset}
      >
        Hapus filter
      </Button>
      <Button type="button" className="flex-1" onClick={handleApply}>
        Terapkan
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={props.open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter</DrawerTitle>
          </DrawerHeader>
          <FilterFields
            pending={pending}
            onChange={setPending}
            fromDate={props.fromDate}
            toDate={props.toDate}
            className="px-4 pb-4"
          />
          <DrawerFooter className="flex-row gap-2">
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>
        <FilterFields
          pending={pending}
          onChange={setPending}
          fromDate={props.fromDate}
          toDate={props.toDate}
        />
        <div className="flex flex-row justify-end gap-2 border-t border-border pt-4">
          {footerButtons}
        </div>
      </DialogContent>
    </Dialog>
  );
}
