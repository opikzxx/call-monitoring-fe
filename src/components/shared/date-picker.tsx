"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateWheelPicker } from "@/components/shared/date-wheel-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const LOCALE = "id-ID";

type DatePickerProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  confirmLabel?: string;
  disabled?: boolean;
  ariaInvalid?: boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
  portalContainer?: HTMLElement | null;
};

function parseIsoDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePicker(props: DatePickerProps) {
  const isMobile = useIsMobile();
  const calendarId = React.useId();
  const [open, setOpen] = React.useState(false);
  const selected = parseIsoDate(props.value);

  const label = selected
    ? new Intl.DateTimeFormat(LOCALE, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(selected)
    : props.placeholder;

  const trigger = (
    <button
      id={props.id}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-controls={calendarId}
      disabled={props.disabled}
      aria-invalid={props.ariaInvalid}
      className={cn(
        "flex h-12 w-full min-w-0 items-center justify-between rounded-xl border border-transparent bg-black/[0.035] px-4 py-2 text-left text-sm shadow-none outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        !selected && "text-muted-foreground",
        props.className
      )}
    >
      <span className="truncate">{label}</span>
      <CalendarDays className="text-primary size-4 shrink-0" />
    </button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent id={calendarId}>
          {props.title ? (
            <DrawerHeader>
              <DrawerTitle>{props.title}</DrawerTitle>
            </DrawerHeader>
          ) : null}
          <DateWheelPicker
            value={selected ?? new Date()}
            locale={LOCALE}
            confirmLabel={props.confirmLabel ?? "Pilih"}
            onConfirm={(date) => {
              props.onChange(toIsoDate(date));
              setOpen(false);
            }}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        id={calendarId}
        align="start"
        className="w-auto p-0"
        container={props.portalContainer}
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? props.toDate}
          startMonth={props.fromDate}
          endMonth={props.toDate}
          disabled={[
            ...(props.fromDate ? [{ before: props.fromDate }] : []),
            ...(props.toDate ? [{ after: props.toDate }] : []),
          ]}
          onSelect={(date) => {
            if (!date) return;
            props.onChange(toIsoDate(date));
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
