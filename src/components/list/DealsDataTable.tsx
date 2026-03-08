"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { preload } from "swr";
import { useOpportunities } from "@/hooks/useOpportunities";
import { usePipelines } from "@/hooks/usePipelines";
import { DealsFilterBar } from "./DealsFilterBar";
import { OpportunityStatusBadge } from "@/components/deal/OpportunityStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

function formatDate(iso?: string): string {
  if (!iso) return "\u2014";
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return "\u2014";
  return `$${value.toLocaleString()}`;
}

export function DealsDataTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pipelineId, setPipelineId] = useState<string | undefined>();
  const [stageId, setStageId] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const router = useRouter();

  const { opportunities, meta, isLoading, error } = useOpportunities({
    q: searchQuery || undefined,
    pipelineId,
    pipelineStageId: stageId,
    status,
    limit: 50,
  });

  const { getPipelineName, getStageName } = usePipelines();

  const fetcher = useCallback(
    (url: string) =>
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      }),
    []
  );

  const handleRowHover = useCallback(
    (oppId: string) => {
      preload(`/api/ghl/opportunities/${oppId}`, fetcher);
    },
    [fetcher]
  );

  return (
    <div className="space-y-4">
      <DealsFilterBar
        onSearch={setSearchQuery}
        onPipelineChange={setPipelineId}
        onStageChange={setStageId}
        onStatusChange={setStatus}
        selectedPipelineId={pipelineId}
        selectedStageId={stageId}
        selectedStatus={status}
        total={meta?.total}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load deals. Please try again.
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Pipeline</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : opportunities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {searchQuery || pipelineId || stageId || status
                    ? "No deals match your filters."
                    : "No deals found."}
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opp) => (
                <TableRow
                  key={opp.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/deals/${opp.id}`)}
                  onMouseEnter={() => handleRowHover(opp.id)}
                >
                  <TableCell className="font-medium">{opp.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getPipelineName(opp.pipelineId ?? "")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getStageName(
                      opp.pipelineId ?? "",
                      opp.pipelineStageId ?? ""
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(opp.monetaryValue)}
                  </TableCell>
                  <TableCell>
                    <OpportunityStatusBadge status={opp.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(opp.updatedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
