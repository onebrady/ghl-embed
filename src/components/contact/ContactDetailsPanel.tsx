"use client";

import type { GHLContact } from "@/lib/ghl/types";
import { FieldGroup, type FieldDefinition } from "./FieldGroup";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFields";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContactDetailsPanelProps {
  contact: GHLContact;
}

export function ContactDetailsPanel({ contact }: ContactDetailsPanelProps) {
  const router = useRouter();
  const { fieldMap } = useCustomFieldDefinitions();

  const initials =
    [contact.firstName?.[0], contact.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  const displayName =
    contact.name ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    contact.email ||
    "Unknown Contact";

  const contactInfoFields: FieldDefinition[] = [
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone },
    { label: "Address", value: contact.address1 },
    { label: "City", value: contact.city },
    { label: "State", value: contact.state },
    { label: "Postal Code", value: contact.postalCode },
    { label: "Country", value: contact.country },
    { label: "Timezone", value: contact.timezone },
  ];

  const companyFields: FieldDefinition[] = [
    { label: "Company", value: contact.companyName },
    { label: "Website", value: contact.website, type: "link" },
  ];

  const attributionFields: FieldDefinition[] = [
    { label: "Source", value: contact.source },
  ];

  const systemFields: FieldDefinition[] = [
    { label: "ID", value: contact.id, mono: true },
    { label: "Date Added", value: contact.dateAdded, type: "date" },
    { label: "Last Updated", value: contact.dateUpdated, type: "date" },
    { label: "Last Activity", value: contact.lastActivity, type: "date" },
    { label: "Assigned To", value: contact.assignedTo, mono: true },
  ];

  // Resolve custom field labels from definitions
  const customFieldItems: FieldDefinition[] = (
    contact.customFields ?? []
  )
    .filter((cf) => cf.value)
    .map((cf) => {
      const def = fieldMap.get(cf.id);
      return {
        label: def?.name ?? cf.id,
        value: cf.value,
      };
    });

  return (
    <div className="space-y-5 p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/contacts")}
        className="-ml-2 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to contacts
      </Button>

      {/* Contact header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold leading-tight">
            {displayName}
          </h2>
          {contact.email && displayName !== contact.email && (
            <p className="truncate text-sm text-muted-foreground">
              {contact.email}
            </p>
          )}
        </div>
      </div>

      {/* DND indicator */}
      {contact.dnd && <Badge variant="destructive">Do Not Disturb</Badge>}

      <Separator />
      <FieldGroup title="Contact Information" fields={contactInfoFields} />

      <Separator />
      <FieldGroup title="Company" fields={companyFields} />

      <Separator />
      <FieldGroup title="Attribution" fields={attributionFields} />

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Custom Fields */}
      {customFieldItems.length > 0 && (
        <>
          <Separator />
          <FieldGroup title="Custom Fields" fields={customFieldItems} />
        </>
      )}

      <Separator />
      <FieldGroup title="System" fields={systemFields} />
    </div>
  );
}
