import { z } from "zod";

export const errorResponseSchema = z.object({
  timestamp: z.string(),
  status: z.number(),
  error: z.string(),
  message: z.string(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
});

export type ErrorResponseBody = z.infer<typeof errorResponseSchema>;

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(body: ErrorResponseBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = body.status;
    this.fieldErrors = body.fieldErrors;
  }
}

export function pageResponseSchema<DataSchema extends z.ZodTypeAny>(
  itemSchema: DataSchema
) {
  return z.object({
    content: itemSchema.array(),
    page: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
  });
}

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
