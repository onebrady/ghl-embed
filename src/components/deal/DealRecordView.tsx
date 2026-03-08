"use client";

import { useOpportunity } from "@/hooks/useOpportunity";
import { DealDetailsPanel } from "./DealDetailsPanel";
import { DealTimeline } from "./DealTimeline";
import { DealAssociations } from "./DealAssociations";
import { ErrorFallback } from "@/components/ErrorFallback";
import { Skeleton } from "@/components/ui/skeleton";

interface DealRecordViewProps {
  opportunityId: string;
}

export function DealRecordView({ opportunityId }: DealRecordViewProps) {
  const { opportunity, isLoading, error, mutate } =
    useOpportunity(opportunityId);

  if (error) {
    return (
      <ErrorFallback
        error={error}
        reset={() => mutate()}
        title="Failed to load deal"
      />
    );
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left Column — Deal Details */}
      <div className="w-full shrink-0 overflow-y-auto border-b lg:w-[380px] lg:border-b-0 lg:border-r">
        {isLoading || !opportunity ? (
          <DealDetailsSkeleton />
        ) : (
          <DealDetailsPanel opportunity={opportunity} mutate={mutate} />
        )}
      </div>

      {/* Center Column — Activity Timeline */}
      <div className="min-h-[400px] flex-1 overflow-hidden">
        {opportunity ? (
          <DealTimeline opportunity={opportunity} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Skeleton className="h-8 w-48" />
          </div>
        )}
      </div>

      {/* Right Column — Associations */}
      <div className="w-full shrink-0 overflow-y-auto border-t lg:w-[320px] lg:border-t-0 lg:border-l">
        {opportunity ? (
          <DealAssociations opportunity={opportunity} />
        ) : null}
      </div>
    </div>
  );
}

function DealDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
