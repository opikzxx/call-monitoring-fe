import { SENTIMENT_FILTER, SORTABLE_FIELDS } from "@/features/call-monitoring/schema";
import type {
  SentimentFilter,
  SortDirection,
  SortableField,
} from "@/features/call-monitoring/schema";

export const DEFAULT_SORT_BY: SortableField = "callTimestamp";
export const DEFAULT_SORT_DIR: SortDirection = "DESC";

export type CallMonitoringFilterState = {
  search: string;
  startDate: string;
  endDate: string;
  sentiment: SentimentFilter | "ALL";
  sortBy: SortableField;
  sortDir: SortDirection;
  page: number;
};

export const EMPTY_CALL_MONITORING_FILTER: CallMonitoringFilterState = {
  search: "",
  startDate: "",
  endDate: "",
  sentiment: "ALL",
  sortBy: DEFAULT_SORT_BY,
  sortDir: DEFAULT_SORT_DIR,
  page: 0,
};

function isSentimentFilter(value: string): value is SentimentFilter {
  return (
    value === SENTIMENT_FILTER.BELOW_70 || value === SENTIMENT_FILTER.AT_LEAST_70
  );
}

function isSortableField(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

/**
 * Builds filter state from the URL so a filtered/sorted view survives a reload or share.
 */
export function parseCallMonitoringFilterFromSearchParams(
  searchParams: URLSearchParams
): CallMonitoringFilterState {
  const sentimentParam = searchParams.get("sentiment") ?? "";
  const sortByParam = searchParams.get("sortBy") ?? "";
  const sortDirParam = searchParams.get("sortDir") ?? "";
  const pageParam = Number(searchParams.get("page"));

  return {
    search: searchParams.get("search") ?? "",
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
    sentiment: isSentimentFilter(sentimentParam) ? sentimentParam : "ALL",
    sortBy: isSortableField(sortByParam) ? sortByParam : DEFAULT_SORT_BY,
    sortDir: sortDirParam === "ASC" ? "ASC" : DEFAULT_SORT_DIR,
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 0,
  };
}

export function callMonitoringFilterToQuery(
  filters: CallMonitoringFilterState
): Record<string, string> {
  const query: Record<string, string> = {};

  if (filters.search.trim()) query.search = filters.search.trim();
  if (filters.startDate) query.startDate = filters.startDate;
  if (filters.endDate) query.endDate = filters.endDate;
  if (filters.sentiment !== "ALL") query.sentiment = filters.sentiment;
  if (filters.sortBy !== DEFAULT_SORT_BY) query.sortBy = filters.sortBy;
  if (filters.sortDir !== DEFAULT_SORT_DIR) query.sortDir = filters.sortDir;
  if (filters.page > 0) query.page = String(filters.page);

  return query;
}

export function hasActiveCallMonitoringFilter(
  filters: CallMonitoringFilterState
) {
  return (
    filters.search.trim() !== "" ||
    filters.startDate !== "" ||
    filters.endDate !== "" ||
    filters.sentiment !== "ALL"
  );
}
