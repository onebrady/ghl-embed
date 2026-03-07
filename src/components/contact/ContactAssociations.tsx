"use client";

import { useOpportunities } from "@/hooks/useOpportunities";
import { usePipelines } from "@/hooks/usePipelines";
import { OpportunityStatusBadge } from "@/components/deal/OpportunityStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import type { GHLContact } from "@/lib/ghl/types";

interface ContactAssociationsProps {
  contact: GHLContact;
}

export function ContactAssociations({ contact }: ContactAssociationsProps) {
  const { opportunities, isLoading } = useOpportunities({
    contactId: contact.id,
  });
  const { getPipelineName, getStageName } = usePipelines();
  const router = useRouter();

  return (
    <div className="space-y-6 p-4">
      {/* Deals */}
      <AssociationSection
        title={`Deals${!isLoading ? ` (${opportunities.length})` : ""}`}
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deals found.</p>
        ) : (
          <div className="space-y-2">
            {opportunities.map((opp) => (
              <button
                key={opp.id}
                onClick={() => router.push(`/deals/${opp.id}`)}
                className="flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {opp.name}
                  </span>
                  <OpportunityStatusBadge status={opp.status} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{getPipelineName(opp.pipelineId ?? "")}</span>
                  <span>&middot;</span>
                  <span>
                    {getStageName(
                      opp.pipelineId ?? "",
                      opp.pipelineStageId ?? ""
                    )}
                  </span>
                </div>
                {opp.monetaryValue !== undefined && (
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    ${opp.monetaryValue.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </AssociationSection>

      {/* Company */}
      {contact.companyName && (
        <AssociationSection title="Company">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">{contact.companyName}</p>
            {contact.website && (
              <a
                href={
                  contact.website.startsWith("http")
                    ? contact.website
                    : `https://${contact.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {contact.website}
              </a>
            )}
          </div>
        </AssociationSection>
      )}

      {/* Custom Associations */}
      <AssociationSection title="Custom Associations">
        <p className="text-xs text-muted-foreground">
          No custom associations yet.
        </p>
      </AssociationSection>
    </div>
  );
}

function AssociationSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
