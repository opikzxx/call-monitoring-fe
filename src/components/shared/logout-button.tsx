"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { ModalConfirmation } from "@/components/shared/modal-confirmation";
import { cn } from "@/lib/utils";

function LogoutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
          className
        )}
      >
        <LogOut className="size-5" />
        Keluar
      </button>

      <ModalConfirmation
        open={open}
        onOpenChange={setOpen}
        title="Keluar dari akun?"
        description="Anda perlu masuk kembali untuk mengakses dashboard."
        confirmLabel="Keluar"
        variant="destructive"
        onConfirm={() => signOut({ callbackUrl: "/signin" })}
      />
    </>
  );
}

export { LogoutButton };
