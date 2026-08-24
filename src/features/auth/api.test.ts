import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api/client";
import { login } from "@/features/auth/api";

vi.mock("@/lib/api/client", () => ({
  apiClient: { post: vi.fn() },
}));

describe("login", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("posts credentials to the login endpoint", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        accessToken: "abc123",
        tokenType: "Bearer",
        expiresInMs: 3600000,
      },
    });

    await login({ email: "user@example.com", password: "password123" });

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "user@example.com",
      password: "password123",
    });
  });

  it("returns the parsed token response", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        accessToken: "abc123",
        tokenType: "Bearer",
        expiresInMs: 3600000,
      },
    });

    const result = await login({
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      accessToken: "abc123",
      tokenType: "Bearer",
      expiresInMs: 3600000,
    });
  });

  it("throws when the response does not match the expected shape", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { unexpected: true } });

    await expect(
      login({ email: "user@example.com", password: "password123" })
    ).rejects.toBeDefined();
  });

  it("propagates errors from the underlying request", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error("network error"));

    await expect(
      login({ email: "user@example.com", password: "password123" })
    ).rejects.toThrow("network error");
  });
});
