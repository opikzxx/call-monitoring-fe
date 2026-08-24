import { describe, expect, it } from "vitest";
import { loginSchema, tokenResponseSchema } from "@/features/auth/schema";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Format email tidak valid");
    }
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password minimal 6 karakter"
      );
    }
  });
});

describe("tokenResponseSchema", () => {
  it("parses a valid token response", () => {
    const result = tokenResponseSchema.safeParse({
      accessToken: "abc123",
      tokenType: "Bearer",
      expiresInMs: 3600000,
    });

    expect(result.success).toBe(true);
  });

  it("fails when a required field is missing", () => {
    const result = tokenResponseSchema.safeParse({
      accessToken: "abc123",
      tokenType: "Bearer",
    });

    expect(result.success).toBe(false);
  });
});
