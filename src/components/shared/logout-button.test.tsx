import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOut } from "next-auth/react";
import { LogoutButton } from "@/components/shared/logout-button";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.mocked(signOut).mockReset();
  });

  it("opens a confirmation modal before signing out", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Keluar" }));

    expect(
      await screen.findByText("Keluar dari akun?")
    ).toBeInTheDocument();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("signs out with the signin callback URL when confirmed", async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: "Keluar" }));
    await screen.findByText("Keluar dari akun?");

    const confirmButton = screen
      .getAllByRole("button", { name: "Keluar" })
      .at(-1);
    await user.click(confirmButton!);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/signin" });
  });
});
