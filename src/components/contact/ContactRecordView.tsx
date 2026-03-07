"use client";

import { useContact } from "@/hooks/useContact";
import { ContactDetailsPanel } from "./ContactDetailsPanel";
import { ContactTimeline } from "@/components/timeline/ContactTimeline";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactRecordViewProps {
  contactId: string;
}

export function ContactRecordView({ contactId }: ContactRecordViewProps) {
  const { contact, isLoading, error } = useContact(contactId);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Failed to load contact.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Column — Contact Details */}
      <div className="w-[380px] shrink-0 overflow-y-auto border-r">
        {isLoading || !contact ? (
          <ContactDetailsSkeleton />
        ) : (
          <ContactDetailsPanel contact={contact} />
        )}
      </div>

      {/* Center Column — Activity Timeline */}
      <div className="flex-1 overflow-hidden">
        <ContactTimeline contactId={contactId} />
      </div>

      {/* Right Column — Associations (Phase 3) */}
      <div className="w-[320px] shrink-0 overflow-y-auto border-l">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Associations coming in Phase 3
        </div>
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
