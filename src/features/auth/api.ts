import { apiClient } from "@/lib/api/client";
import { tokenResponseSchema } from "@/features/auth/schema";
import type { LoginValues } from "@/features/auth/schema";

export async function login(values: LoginValues) {
  const response = await apiClient.post("/api/auth/login", values);
  return tokenResponseSchema.parse(response.data);
}
