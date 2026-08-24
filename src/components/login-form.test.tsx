import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("LoginForm", () => {
  const push = vi.fn();

  beforeEach(() => {
    vi.mocked(signIn).mockReset();
    push.mockReset();
    vi.mocked(useRouter).mockReturnValue({ push } as never);
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(
      await screen.findByText("Format email tidak valid")
    ).toBeInTheDocument();
    expect(screen.getByText("Password minimal 6 karakter")).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("signs in and redirects to the dashboard on success", async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: undefined,
      ok: true,
      status: 200,
      url: null,
    } as never);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "password123",
      redirect: false,
    });
  });

  it("shows a server error message when credentials are invalid", async () => {
    vi.mocked(signIn).mockResolvedValue({
      error: "CredentialsSignin",
      ok: false,
      status: 401,
      url: null,
    } as never);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(
      await screen.findByText("Email atau password salah.")
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
