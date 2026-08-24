"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { WheelPickerColumn } from "@/components/ui/wheel-picker";

const YEARS_BEFORE = 5;
const YEARS_AFTER = 10;

type DateWheelPickerProps = {
  value: Date;
  locale: string;
  confirmLabel: string;
  onConfirm: (date: Date) => void;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function DateWheelPicker(props: DateWheelPickerProps) {
  const [day, setDay] = React.useState(props.value.getDate());
  const [month, setMonth] = React.useState(props.value.getMonth());
  const [year, setYear] = React.useState(props.value.getFullYear());

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: index,
    label: new Intl.DateTimeFormat(props.locale, { month: "long" }).format(
      new Date(2000, index, 1),
    ),
  }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: YEARS_BEFORE + YEARS_AFTER + 1 },
    (_, index) => currentYear - YEARS_BEFORE + index,
  ).map((yearValue) => ({ value: yearValue, label: String(yearValue) }));

  const dayCount = daysInMonth(year, month);
  const dayOptions = Array.from({ length: dayCount }, (_, index) => ({
    value: index + 1,
    label: String(index + 1),
  }));
  // Clamp the displayed day so switching to a shorter month (e.g. Jan 31 -> Feb) can't select a day it doesn't have.
  const clampedDay = Math.min(day, dayCount);

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <div className="relative isolate flex">
        <div
          aria-hidden
          className="bg-accent pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-11 -translate-y-1/2 rounded-lg"
        />
        <WheelPickerColumn
          options={dayOptions}
          value={clampedDay}
          onChange={setDay}
          className="flex-1"
        />
        <WheelPickerColumn
          options={monthOptions}
          value={month}
          onChange={setMonth}
          className="flex-[2]"
        />
        <WheelPickerColumn
          options={yearOptions}
          value={year}
          onChange={setYear}
          className="flex-1"
        />
      </div>
      <Button
        type="button"
        size="lg"
        className="h-12 w-full rounded-xl"
        onClick={() => props.onConfirm(new Date(year, month, clampedDay))}
      >
        {props.confirmLabel}
      </Button>
    </div>
  );
}
