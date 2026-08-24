"use client";

import { Headset } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/shared/logout-button";
import { getInitials } from "@/lib/utils";

function DesktopSidebar({ email }: { email: string }) {
  return (
    <aside className="bg-primary/5 sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-10 py-10 md:flex">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <Avatar className="ring-primary/30 size-20 ring-4">
          <AvatarFallback>{getInitials(email)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-muted-foreground text-sm">Selamat datang kembali</p>
          <p className="text-sm font-bold break-all">{email}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <span className="relative flex items-center gap-3 bg-primary/10 py-3 pr-4 pl-6 text-sm font-semibold">
          <span className="bg-primary absolute inset-y-1 right-0 w-1 rounded-l-full" />
          <Headset className="size-5" />
          Call Monitoring
        </span>
      </nav>

      <LogoutButton className="mt-auto justify-center px-4" />
    </aside>
  );
}

type DashboardShellProps = {
  email: string;
  children: React.ReactNode;
};

export function DashboardShell(props: DashboardShellProps) {
  return (
    <div className="flex min-h-svh bg-background">
      <DesktopSidebar email={props.email} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 md:hidden">
          <p className="text-base font-semibold">Call Monitoring</p>
          <LogoutButton className="w-auto px-3 py-2" />
        </header>

        <main className="flex-1 p-4 md:p-8">{props.children}</main>
      </div>
    </div>
  );
}
