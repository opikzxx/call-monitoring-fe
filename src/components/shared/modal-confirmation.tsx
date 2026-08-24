"use client";

import { AlertDialog } from "radix-ui";
import { TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
};

function ModalConfirmation(props: ModalConfirmationProps) {
  const variant = props.variant ?? "default";

  return (
    <AlertDialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="bg-background fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialog.Cancel asChild>
            <Button
              type="button"
              variant="ghost"
              aria-label={props.cancelLabel ?? "Batal"}
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4"
            >
              <X className="size-5" />
            </Button>
          </AlertDialog.Cancel>

          <div
            className={cn(
              "mx-auto flex size-14 items-center justify-center rounded-full",
              variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"
            )}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full",
                variant === "destructive" ? "bg-destructive" : "bg-primary"
              )}
            >
              <TriangleAlert className="text-primary-foreground size-5" />
            </div>
          </div>

          <AlertDialog.Title className="mt-4 text-center text-lg font-semibold">
            {props.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground mt-2 text-center text-sm">
            {props.description}
          </AlertDialog.Description>

          <div className="mt-6 flex items-center gap-3">
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="flex-1 rounded-full"
              >
                {props.cancelLabel ?? "Batal"}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                type="button"
                size="lg"
                variant={variant === "destructive" ? "destructive" : "default"}
                disabled={props.isLoading}
                onClick={props.onConfirm}
                className="flex-1 rounded-full"
              >
                {props.confirmLabel ?? "Konfirmasi"}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export { ModalConfirmation };
