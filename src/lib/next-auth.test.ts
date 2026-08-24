// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { CredentialsConfig } from "next-auth/providers/credentials";
import { login } from "@/features/auth/api";
import { authOptions } from "@/lib/next-auth";

vi.mock("@/features/auth/api", () => ({
  login: vi.fn(),
}));

function getAuthorize() {
  const provider = authOptions.providers[0] as unknown as CredentialsConfig;
  const options = (provider as unknown as { options: CredentialsConfig })
    .options;
  return options.authorize!;
}

describe("authOptions credentials provider authorize", () => {
  beforeEach(() => {
    vi.mocked(login).mockReset();
  });

  it("returns null when email or password is missing", async () => {
    const authorize = getAuthorize();

    await expect(
      authorize({ email: "", password: "" }, {} as never)
    ).resolves.toBeNull();
    expect(login).not.toHaveBeenCalled();
  });

  it("returns a user with the access token on successful login", async () => {
    vi.mocked(login).mockResolvedValue({
      accessToken: "abc123",
      tokenType: "Bearer",
      expiresInMs: 3600000,
    });
    const authorize = getAuthorize();

    const user = await authorize(
      { email: "user@example.com", password: "password123" },
      {} as never
    );

    expect(login).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(user).toEqual({
      id: "user@example.com",
      email: "user@example.com",
      accessToken: "abc123",
    });
  });

  it("returns null when login throws", async () => {
    vi.mocked(login).mockRejectedValue(new Error("invalid credentials"));
    const authorize = getAuthorize();

    const user = await authorize(
      { email: "user@example.com", password: "wrong-password" },
      {} as never
    );

    expect(user).toBeNull();
  });
});

describe("authOptions callbacks", () => {
  it("jwt callback stores the access token from the user on sign in", async () => {
    const token = await authOptions.callbacks?.jwt?.({
      token: {},
      user: { id: "1", accessToken: "abc123" } as never,
    } as never);

    expect(token).toEqual({ accessToken: "abc123" });
  });

  it("jwt callback keeps the existing token when there is no user", async () => {
    const token = await authOptions.callbacks?.jwt?.({
      token: { accessToken: "existing-token" },
      user: undefined,
    } as never);

    expect(token).toEqual({ accessToken: "existing-token" });
  });

  it("session callback exposes the access token on the session", async () => {
    const session = await authOptions.callbacks?.session?.({
      session: { user: { email: "user@example.com" } },
      token: { accessToken: "abc123" },
    } as never);

    expect(session).toMatchObject({ accessToken: "abc123" });
  });
});
