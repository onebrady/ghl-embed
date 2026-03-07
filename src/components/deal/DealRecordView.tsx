"use client";

import { useOpportunity } from "@/hooks/useOpportunity";
import { DealDetailsPanel } from "./DealDetailsPanel";
import { DealTimeline } from "./DealTimeline";
import { DealAssociations } from "./DealAssociations";
import { Skeleton } from "@/components/ui/skeleton";

interface DealRecordViewProps {
  opportunityId: string;
}

export function DealRecordView({ opportunityId }: DealRecordViewProps) {
  const { opportunity, isLoading, error } = useOpportunity(opportunityId);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Failed to load deal.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Column — Deal Details */}
      <div className="w-[380px] shrink-0 overflow-y-auto border-r">
        {isLoading || !opportunity ? (
          <DealDetailsSkeleton />
        ) : (
          <DealDetailsPanel opportunity={opportunity} />
        )}
      </div>

      {/* Center Column — Activity Timeline */}
      <div className="flex-1 overflow-hidden">
        {opportunity ? (
          <DealTimeline opportunity={opportunity} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Skeleton className="h-8 w-48" />
          </div>
        )}
      </div>

      {/* Right Column — Associations */}
      <div className="w-[320px] shrink-0 overflow-y-auto border-l">
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
