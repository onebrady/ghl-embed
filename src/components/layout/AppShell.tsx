"use client";

import { SubAccountSwitcher } from "./SubAccountSwitcher";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">
            Command Center
          </span>
        </div>
        <SubAccountSwitcher />
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
