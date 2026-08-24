import axios from "axios";
import { getSession } from "next-auth/react";
import { Env } from "@/lib/env";
import { ApiError, errorResponseSchema } from "@/lib/api/response";

export const apiClient = axios.create({
  baseURL: Env.NEXT_PUBLIC_API_URL,
});

let sessionPromise: ReturnType<typeof getSession> | null = null;

function getSharedSession() {
  if (!sessionPromise) {
    sessionPromise = getSession().finally(() => {
      sessionPromise = null;
    });
  }

  return sessionPromise;
}

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const session = await getSharedSession();
  if (session?.accessToken) {
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const parsed = errorResponseSchema.safeParse(error.response?.data);
      if (parsed.success) {
        return Promise.reject(new ApiError(parsed.data));
      }
    }

    return Promise.reject(
      error instanceof Error ? error : new Error("Unexpected error")
    );
  }
);
