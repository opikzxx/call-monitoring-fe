import { SENTIMENT_FILTER } from "@/features/call-monitoring/schema";
import type { SentimentFilter } from "@/features/call-monitoring/schema";

export type CallMonitoringFilterState = {
  search: string;
  startDate: string;
  endDate: string;
  sentiment: SentimentFilter | "ALL";
  page: number;
};

export const EMPTY_CALL_MONITORING_FILTER: CallMonitoringFilterState = {
  search: "",
  startDate: "",
  endDate: "",
  sentiment: "ALL",
  page: 0,
};

function isSentimentFilter(value: string): value is SentimentFilter {
  return (
    value === SENTIMENT_FILTER.BELOW_70 || value === SENTIMENT_FILTER.AT_LEAST_70
  );
}

/**
 * Builds filter state from the URL so a filtered view survives a reload or share.
 */
export function parseCallMonitoringFilterFromSearchParams(
  searchParams: URLSearchParams
): CallMonitoringFilterState {
  const sentimentParam = searchParams.get("sentiment") ?? "";
  const pageParam = Number(searchParams.get("page"));

  return {
    search: searchParams.get("search") ?? "",
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
    sentiment: isSentimentFilter(sentimentParam) ? sentimentParam : "ALL",
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
  if (filters.page > 0) query.page = String(filters.page);

  return query;
}
