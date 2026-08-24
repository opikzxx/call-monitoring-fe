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

export type ListCallMonitoringParams = {
  search?: string;
  startDate?: string;
  endDate?: string;
  sentiment?: SentimentFilter;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
  page?: number;
};
