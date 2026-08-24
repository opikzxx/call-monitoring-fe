"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Leading icon shown in the option row. */
  icon?: React.ReactNode;
  /** Merged onto this option's row, e.g. to set it apart from regular options with a divider. */
  optionClassName?: string;
  /** Shown in the trigger instead of `label` once selected, e.g. to drop redundant text and keep only the icon. */
  triggerLabel?: string;
  /** Shown in the trigger instead of `icon` once selected, e.g. when the option's icon is styled for its row's background and needs different contrast on the trigger. */
  triggerIcon?: React.ReactNode;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
  /** Drawer header shown on mobile. Falls back to `placeholder` when omitted. */
  title?: string;
  /** Portal target for the options popover. Pass a dialog/drawer's content node so its scroll-lock recognizes the popover as an internal descendant. */
  portalContainer?: HTMLElement | null;
  /** Merged onto the trigger button, last, to override its default pill styling. */
  triggerClassName?: string;
  /** Merged onto the popover panel, last, to override its default trigger-matched width. */
  contentClassName?: string;
};

export function Combobox(props: ComboboxProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const listboxId = React.useId();
  const drawerContentRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = props.options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedOption = props.options.find(
    (option) => option.value === props.value,
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleSelect(value: string) {
    props.onChange(value);
    handleOpenChange(false);
  }

  const trigger = (
    <button
      id={props.id}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      aria-label={props.title ?? props.placeholder}
      disabled={props.disabled}
      aria-invalid={props["aria-invalid"]}
      className={cn(
        "flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-transparent bg-black/[0.035] px-4 py-2 text-sm whitespace-nowrap shadow-none outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5",
        !selectedOption && "text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        props.triggerClassName,
      )}
    >
      <span className="flex items-center gap-1.5 truncate">
        {selectedOption && (selectedOption.triggerIcon ?? selectedOption.icon)}
        {selectedOption
          ? (selectedOption.triggerLabel ?? selectedOption.label)
          : props.placeholder}
      </span>
      <ChevronDown className="size-4 shrink-0 opacity-50" />
    </button>
  );

  const optionsList = (
    <>
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus={!isMobile}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={props.searchPlaceholder}
          className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div
        id={listboxId}
        role="listbox"
        className="max-h-64 overflow-y-auto p-1"
      >
        {filteredOptions.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            {props.emptyText}
          </p>
        ) : (
          filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === props.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                option.optionClassName,
              )}
            >
              <span className="flex size-3.5 shrink-0 items-center justify-center">
                {option.value === props.value ? (
                  <Check className="size-4" />
                ) : null}
              </span>
              {option.icon}
              <span className="truncate">{option.label}</span>
            </button>
          ))
        )}
      </div>
    </>
  );

  if (isMobile) {
    const drawerTitle = props.title ?? props.placeholder;

    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent
          ref={drawerContentRef}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            drawerContentRef.current?.focus();
          }}
        >
          {drawerTitle ? (
            <DrawerHeader>
              <DrawerTitle>{drawerTitle}</DrawerTitle>
            </DrawerHeader>
          ) : null}
          <div className="flex max-h-[70vh] flex-col overflow-hidden pb-4">
            {optionsList}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        container={props.portalContainer}
        className={cn(
          "w-[var(--radix-popover-trigger-width)] p-0",
          props.contentClassName,
        )}
      >
        {optionsList}
      </PopoverContent>
    </Popover>
  );
}
