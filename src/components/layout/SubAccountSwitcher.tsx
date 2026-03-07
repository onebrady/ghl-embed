"use client";

import { useSubAccount } from "@/hooks/useSubAccount";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Building2, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SubAccountSwitcher() {
  const { locationId, setLocationId, locations, isLoading, currentLocation } =
    useSubAccount();

  if (isLoading) {
    return <Skeleton className="h-9 w-48" />;
  }

  // If only one location, just show the name (no dropdown)
  if (locations.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>{currentLocation?.name ?? "Unknown"}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-8 cursor-pointer">
        <Building2 className="h-4 w-4" />
        <span className="max-w-[200px] truncate">
          {currentLocation?.name ?? "Select location"}
        </span>
        <ChevronsUpDown className="h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        {locations.map((loc) => (
          <DropdownMenuItem
            key={loc.id}
            onClick={() => setLocationId(loc.id)}
          >
            <Check
              className={`mr-2 h-4 w-4 ${loc.id === locationId ? "opacity-100" : "opacity-0"}`}
            />
            {loc.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
