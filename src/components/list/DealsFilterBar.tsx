"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePipelines } from "@/hooks/usePipelines";

interface DealsFilterBarProps {
  onSearch: (query: string) => void;
  onPipelineChange: (pipelineId: string | undefined) => void;
  onStageChange: (stageId: string | undefined) => void;
  onStatusChange: (status: string | undefined) => void;
  selectedPipelineId?: string;
  selectedStageId?: string;
  selectedStatus?: string;
  total?: number;
}

export function DealsFilterBar({
  onSearch,
  onPipelineChange,
  onStageChange,
  onStatusChange,
  selectedPipelineId,
  selectedStatus,
  total,
}: DealsFilterBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { pipelines, getPipeline } = usePipelines();

  const selectedPipeline = selectedPipelineId
    ? getPipeline(selectedPipelineId)
    : undefined;
  const stages = selectedPipeline
    ? [...selectedPipeline.stages].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      )
    : [];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setSearchValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(v), 300);
  }

  function handlePipelineChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value || undefined;
    onPipelineChange(val);
    onStageChange(undefined);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xs flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search deals..."
          value={searchValue}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      <select
        value={selectedPipelineId ?? ""}
        onChange={handlePipelineChange}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <option value="">All Pipelines</option>
        {pipelines.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={selectedPipelineId ? undefined : ""}
        onChange={(e) => onStageChange(e.target.value || undefined)}
        disabled={!selectedPipelineId}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">All Stages</option>
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus ?? ""}
        onChange={(e) => onStatusChange(e.target.value || undefined)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
        <option value="abandoned">Abandoned</option>
      </select>

      {total !== undefined && (
        <span className="ml-auto text-sm text-muted-foreground">
          {total} deal{total !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
