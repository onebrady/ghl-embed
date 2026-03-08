"use client";

import { useContact } from "@/hooks/useContact";
import { ContactDetailsPanel } from "./ContactDetailsPanel";
import { ContactAssociations } from "./ContactAssociations";
import { ContactTimeline } from "@/components/timeline/ContactTimeline";
import { ErrorFallback } from "@/components/ErrorFallback";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactRecordViewProps {
  contactId: string;
}

export function ContactRecordView({ contactId }: ContactRecordViewProps) {
  const { contact, isLoading, error, mutate } = useContact(contactId);

  if (error) {
    return (
      <ErrorFallback
        error={error}
        reset={() => mutate()}
        title="Failed to load contact"
      />
    );
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left Column — Contact Details */}
      <div className="w-full shrink-0 overflow-y-auto border-b lg:w-[380px] lg:border-b-0 lg:border-r">
        {isLoading || !contact ? (
          <ContactDetailsSkeleton />
        ) : (
          <ContactDetailsPanel contact={contact} mutate={mutate} />
        )}
      </div>

      {/* Center Column — Activity Timeline */}
      <div className="min-h-[400px] flex-1 overflow-hidden">
        <ContactTimeline contactId={contactId} />
      </div>

      {/* Right Column — Associations */}
      <div className="w-full shrink-0 overflow-y-auto border-t lg:w-[320px] lg:border-t-0 lg:border-l">
        {contact ? (
          <ContactAssociations contact={contact} />
        ) : null}
      </div>
    </div>
  );
}

function ContactDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
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
