import { z } from "zod";
import { pageResponseSchema } from "@/lib/api/response";

export const SENTIMENT_FILTER = {
  BELOW_70: "BELOW_70",
  AT_LEAST_70: "AT_LEAST_70",
} as const;

export type SentimentFilter =
  (typeof SENTIMENT_FILTER)[keyof typeof SENTIMENT_FILTER];

export const callMonitoringItemSchema = z.object({
  callId: z.string(),
  callTimestamp: z.string(),
  csName: z.string(),
  customerName: z.string(),
  sentimentScore: z.number().nullable(),
});

export type CallMonitoringItem = z.infer<typeof callMonitoringItemSchema>;

export const callMonitoringPageSchema = pageResponseSchema(
  callMonitoringItemSchema
);

export type CallMonitoringPage = z.infer<typeof callMonitoringPageSchema>;

export const CALL_MONITORING_PAGE_SIZE = 5;

export const SORTABLE_FIELDS = [
  "callId",
  "callTimestamp",
  "csName",
  "customerName",
  "sentimentScore",
] as const;

export type SortableField = (typeof SORTABLE_FIELDS)[number];

export type SortDirection = "ASC" | "DESC";

export type ListCallMonitoringParams = {
  search?: string;
  startDate?: string;
  endDate?: string;
  sentiment?: SentimentFilter;
  sortBy?: SortableField;
  sortDir?: SortDirection;
  page?: number;
};
