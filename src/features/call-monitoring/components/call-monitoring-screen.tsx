"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Frown,
  PhoneOff,
  Smile,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getInitials } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCallMonitoring } from "@/features/call-monitoring/hooks";
import { CallMonitoringFilterBar } from "@/features/call-monitoring/components/call-monitoring-filter-bar";
import { CallMonitoringFilterModal } from "@/features/call-monitoring/components/call-monitoring-filter-modal";
import {
  EMPTY_CALL_MONITORING_FILTER,
  callMonitoringFilterToQuery,
  hasActiveCallMonitoringFilter,
  parseCallMonitoringFilterFromSearchParams,
} from "@/features/call-monitoring/filters";
import { CALL_MONITORING_PAGE_SIZE } from "@/features/call-monitoring/schema";
import type {
  SentimentFilter,
  SortDirection,
  SortableField,
} from "@/features/call-monitoring/schema";

const LOADING_SKELETON_ROWS = CALL_MONITORING_PAGE_SIZE;
const TABLE_COLUMN_COUNT = 6;
const SELECTABLE_PERIOD_MONTHS = 3;

function getThreeMonthsAgo() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - SELECTABLE_PERIOD_MONTHS);
  return date;
}

function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function SentimentBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  const isGood = score >= 70;
  const Icon = isGood ? Smile : Frown;

  return (
    <Badge
      className={
        isGood
          ? "bg-success text-success-foreground"
          : "bg-destructive/10 text-destructive"
      }
    >
      <Icon className="size-3" />
      {score}%
    </Badge>
  );
}

function PersonCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-7">
        <AvatarFallback className="text-[11px]">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{name}</span>
    </div>
  );
}

type SortableHeaderProps = {
  label: string;
  field: SortableField;
  activeField: SortableField;
  direction: SortDirection;
  onSort: (field: SortableField) => void;
  className?: string;
};

function SortableHeader(props: SortableHeaderProps) {
  const isActive = props.activeField === props.field;
  const Icon = isActive ? (props.direction === "ASC" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={props.className}>
      <button
        type="button"
        onClick={() => props.onSort(props.field)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          isActive && "text-foreground font-semibold"
        )}
      >
        {props.label}
        <Icon
          className={cn(
            "size-3.5",
            isActive ? "text-foreground" : "text-muted-foreground/50"
          )}
        />
      </button>
    </TableHead>
  );
}

export function CallMonitoringScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFilter = parseCallMonitoringFilterFromSearchParams(searchParams);

  const [search, setSearch] = useState(initialFilter.search);
  const [startDate, setStartDate] = useState(initialFilter.startDate);
  const [endDate, setEndDate] = useState(initialFilter.endDate);
  const [sentiment, setSentiment] = useState<SentimentFilter | "ALL">(
    initialFilter.sentiment
  );
  const [sortBy, setSortBy] = useState<SortableField>(initialFilter.sortBy);
  const [sortDir, setSortDir] = useState<SortDirection>(initialFilter.sortDir);
  const [page, setPage] = useState(initialFilter.page);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    const nextQuery = callMonitoringFilterToQuery({
      search: debouncedSearch,
      startDate,
      endDate,
      sentiment,
      sortBy,
      sortDir,
      page,
    });
    const queryString = new URLSearchParams(nextQuery).toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, startDate, endDate, sentiment, sortBy, sortDir, page]);

  const query = useCallMonitoring({
    search: debouncedSearch.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sentiment: sentiment === "ALL" ? undefined : sentiment,
    sortBy,
    sortDir,
    page,
  });

  const data = query.data;
  const items = data?.content ?? [];
  const isFiltered = hasActiveCallMonitoringFilter({
    ...EMPTY_CALL_MONITORING_FILTER,
    search,
    startDate,
    endDate,
    sentiment,
  });
  const activeFilterCount = [
    startDate || endDate ? 1 : 0,
    sentiment !== "ALL" ? 1 : 0,
  ].reduce((total, value) => total + value, 0);

  function updateFilter(update: () => void) {
    update();
    setPage(0);
  }

  function handleApplyFilterModal(next: {
    startDate: string;
    endDate: string;
    sentiment: SentimentFilter | "ALL";
  }) {
    updateFilter(() => {
      setStartDate(next.startDate);
      setEndDate(next.endDate);
      setSentiment(next.sentiment);
    });
  }

  function handleSort(field: SortableField) {
    if (field === sortBy) {
      setSortDir((current) => (current === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortDir("ASC");
    }
    setPage(0);
  }

  function resetFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSentiment("ALL");
    setPage(0);
  }

  const today = getToday();
  const threeMonthsAgo = getThreeMonthsAgo();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Call Monitoring</h1>
        <p className="text-muted-foreground text-sm">
          Rekap panggilan customer service beserta skor sentimennya.
        </p>
      </div>

      <CallMonitoringFilterBar
        search={search}
        onSearchChange={(value) => updateFilter(() => setSearch(value))}
        onOpenFilters={() => setFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <CallMonitoringFilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        value={{ startDate, endDate, sentiment }}
        onApply={handleApplyFilterModal}
        fromDate={threeMonthsAgo}
        toDate={today}
      />

      <div className="overflow-x-auto rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12">No.</TableHead>
              <SortableHeader
                label="Call ID"
                field="callId"
                activeField={sortBy}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Call Timestamp"
                field="callTimestamp"
                activeField={sortBy}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="CS Name"
                field="csName"
                activeField={sortBy}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Nama Nasabah"
                field="customerName"
                activeField={sortBy}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Sentiment Score Nasabah"
                field="sentimentScore"
                activeField={sortBy}
                direction={sortDir}
                onSort={handleSort}
                className="text-right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: LOADING_SKELETON_ROWS }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={TABLE_COLUMN_COUNT}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length > 0 ? (
              <>
                {items.map((item, index) => (
                  <TableRow key={item.callId}>
                    <TableCell className="text-muted-foreground">
                      {page * CALL_MONITORING_PAGE_SIZE + index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.callId}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(item.callTimestamp),
                        "dd MMM yyyy, HH:mm"
                      )}
                    </TableCell>
                    <TableCell>
                      <PersonCell name={item.csName} />
                    </TableCell>
                    <TableCell>
                      <PersonCell name={item.customerName} />
                    </TableCell>
                    <TableCell className="text-right">
                      <SentimentBadge score={item.sentimentScore} />
                    </TableCell>
                  </TableRow>
                ))}
                {Array.from({
                  length: CALL_MONITORING_PAGE_SIZE - items.length,
                }).map((_, index) => (
                  <TableRow
                    key={`filler-${index}`}
                    aria-hidden="true"
                    className="hover:bg-transparent"
                  >
                    <TableCell colSpan={TABLE_COLUMN_COUNT}>
                      &nbsp;
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={TABLE_COLUMN_COUNT}
                  className="h-[15.5rem] text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                      <PhoneOff className="text-muted-foreground size-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Tidak ada data panggilan</p>
                      <p className="text-muted-foreground text-sm">
                        Coba ubah kata kunci atau filter tanggal.
                      </p>
                    </div>
                    {isFiltered ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                      >
                        Hapus filter
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {data?.totalElements ?? 0} panggilan &middot; Halaman{" "}
          {(data?.page ?? page) + 1} dari {Math.max(data?.totalPages ?? 1, 1)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={(data?.page ?? page) <= 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Sebelumnya
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={(data?.page ?? page) + 1 >= (data?.totalPages ?? 1)}
            onClick={() => setPage((current) => current + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
