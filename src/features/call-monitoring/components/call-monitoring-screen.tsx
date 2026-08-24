"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { PhoneOff, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/shared/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCallMonitoring } from "@/features/call-monitoring/hooks";
import {
  callMonitoringFilterToQuery,
  parseCallMonitoringFilterFromSearchParams,
} from "@/features/call-monitoring/filters";
import { SENTIMENT_FILTER } from "@/features/call-monitoring/schema";
import type { SentimentFilter } from "@/features/call-monitoring/schema";

const SENTIMENT_OPTIONS: { value: SentimentFilter | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua sentimen" },
  { value: SENTIMENT_FILTER.AT_LEAST_70, label: "Baik (>= 70)" },
  { value: SENTIMENT_FILTER.BELOW_70, label: "Perlu perhatian (< 70)" },
];

const LOADING_SKELETON_ROWS = 5;

function SentimentBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  const isGood = score >= 70;

  return (
    <Badge
      className={
        isGood
          ? "bg-success text-success-foreground"
          : "bg-destructive/10 text-destructive"
      }
    >
      {score}
    </Badge>
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
  const [page, setPage] = useState(initialFilter.page);

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    const nextQuery = callMonitoringFilterToQuery({
      search: debouncedSearch,
      startDate,
      endDate,
      sentiment,
      page,
    });
    const queryString = new URLSearchParams(nextQuery).toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, startDate, endDate, sentiment, page]);

  const query = useCallMonitoring({
    search: debouncedSearch.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sentiment: sentiment === "ALL" ? undefined : sentiment,
    page,
  });

  const data = query.data;
  const items = data?.content ?? [];

  function updateFilter(update: () => void) {
    update();
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Call Monitoring</h1>
        <p className="text-muted-foreground text-sm">
          Rekap panggilan customer service beserta skor sentimennya.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-xs">
          <Input
            value={search}
            onChange={(event) =>
              updateFilter(() => setSearch(event.target.value))
            }
            placeholder="Cari nama CS atau customer"
            className="h-12 rounded-xl pr-11"
          />
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
        </div>

        <DatePicker
          value={startDate}
          onChange={(value) => updateFilter(() => setStartDate(value))}
          placeholder="Tanggal mulai"
          title="Pilih tanggal mulai"
          confirmLabel="Pilih"
          className="md:w-44"
        />
        <DatePicker
          value={endDate}
          onChange={(value) => updateFilter(() => setEndDate(value))}
          placeholder="Tanggal akhir"
          title="Pilih tanggal akhir"
          confirmLabel="Pilih"
          fromDate={startDate ? new Date(startDate) : undefined}
          className="md:w-44"
        />

        <Combobox
          options={SENTIMENT_OPTIONS}
          value={sentiment}
          onChange={(value) =>
            updateFilter(() => setSentiment(value as SentimentFilter | "ALL"))
          }
          placeholder="Semua sentimen"
          searchPlaceholder="Cari sentimen"
          emptyText="Tidak ditemukan"
          title="Pilih sentimen"
          triggerClassName="md:w-52"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu Panggilan</TableHead>
              <TableHead>CS</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Skor Sentimen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: LOADING_SKELETON_ROWS }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.callId}>
                  <TableCell>
                    {format(new Date(item.callTimestamp), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell>{item.csName}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell className="text-right">
                    <SentimentBadge score={item.sentimentScore} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                      <PhoneOff className="text-muted-foreground size-6" />
                    </div>
                    <div>
                      <p className="font-semibold">Tidak ada data panggilan</p>
                      <p className="text-muted-foreground text-sm">
                        Coba ubah kata kunci atau filter tanggal.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalElements > 0 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {data.totalElements} panggilan &middot; Halaman {data.page + 1} dari{" "}
            {data.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={data.page <= 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={data.page + 1 >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
