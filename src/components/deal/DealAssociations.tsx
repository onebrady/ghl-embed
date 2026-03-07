"use client";

import { useContact } from "@/hooks/useContact";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import type { GHLOpportunity } from "@/lib/ghl/types";

interface DealAssociationsProps {
  opportunity: GHLOpportunity;
}

export function DealAssociations({ opportunity }: DealAssociationsProps) {
  const { contact, isLoading } = useContact(opportunity.contactId ?? null);
  const router = useRouter();

  const initials = contact
    ? [contact.firstName?.[0], contact.lastName?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?"
    : "?";

  const contactDisplayName = contact
    ? contact.name ||
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      contact.email ||
      "Unknown"
    : null;

  return (
    <div className="space-y-6 p-4">
      {/* Primary Contact */}
      <AssociationSection title="Primary Contact">
        {isLoading ? (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ) : contact ? (
          <button
            onClick={() => router.push(`/contacts/${contact.id}`)}
            className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {contactDisplayName}
              </p>
              {contact.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {contact.email}
                </p>
              )}
              {contact.phone && (
                <p className="truncate text-xs text-muted-foreground">
                  {contact.phone}
                </p>
              )}
            </div>
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">No contact linked</p>
        )}
      </AssociationSection>

      {/* Company */}
      {contact?.companyName && (
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
