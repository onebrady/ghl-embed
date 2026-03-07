"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ContactsFilterBarProps {
  onSearch: (query: string) => void;
  total?: number;
}

export function ContactsFilterBar({ onSearch, total }: ContactsFilterBarProps) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(v);
    }, 300);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={value}
          onChange={handleChange}
          className="pl-9"
        />
      </div>
      {total !== undefined && (
        <span className="text-sm text-muted-foreground">
          {total} contact{total !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
