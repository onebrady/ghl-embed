"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SubAccountSwitcher } from "./SubAccountSwitcher";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">
            Command Center
          </span>
          <nav className="ml-6 flex items-center gap-1">
            <Link
              href="/contacts"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith("/contacts")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              Contacts
            </Link>
            <Link
              href="/deals"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith("/deals")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              Deals
            </Link>
          </nav>
        </div>
        <SubAccountSwitcher />
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
