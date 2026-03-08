"use client";

import { useCallback } from "react";
import type { KeyedMutator } from "swr";
import type { GHLContact, GHLContactResponse } from "@/lib/ghl/types";
import { FieldGroup, type FieldDefinition } from "./FieldGroup";
import { useCustomFieldDefinitions } from "@/hooks/useCustomFields";
import { useSubAccount } from "@/hooks/useSubAccount";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ContactDetailsPanelProps {
  contact: GHLContact;
  mutate?: KeyedMutator<GHLContactResponse>;
}

export function ContactDetailsPanel({
  contact,
  mutate,
}: ContactDetailsPanelProps) {
  const router = useRouter();
  const { locationId } = useSubAccount();
  const { fieldMap } = useCustomFieldDefinitions();

  const handleSave = useCallback(
    async (fieldKey: string, newValue: string) => {
      if (!mutate) return;

      // Optimistic update
      const optimisticData: GHLContactResponse = {
        contact: { ...contact, [fieldKey]: newValue || undefined },
      };

      try {
        await mutate(optimisticData, { revalidate: false });

        const res = await fetch(`/api/ghl/contacts/${contact.id}?locationId=${locationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [fieldKey]: newValue || null }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error || `Save failed (${res.status})`
          );
        }

        await mutate();
        toast.success("Saved");
      } catch (err) {
        await mutate(); // Rollback to server truth
        toast.error(
          err instanceof Error ? err.message : "Failed to save changes"
        );
        throw err;
      }
    },
    [contact, mutate]
  );

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

  const editable = !!mutate;

  const contactInfoFields: FieldDefinition[] = [
    {
      label: "Email",
      value: contact.email,
      editable,
      fieldKey: "email",
      inputType: "email",
    },
    {
      label: "Phone",
      value: contact.phone,
      editable,
      fieldKey: "phone",
      inputType: "phone",
    },
    {
      label: "Address",
      value: contact.address1,
      editable,
      fieldKey: "address1",
    },
    { label: "City", value: contact.city, editable, fieldKey: "city" },
    { label: "State", value: contact.state, editable, fieldKey: "state" },
    {
      label: "Postal Code",
      value: contact.postalCode,
      editable,
      fieldKey: "postalCode",
    },
    { label: "Country", value: contact.country, editable, fieldKey: "country" },
    {
      label: "Timezone",
      value: contact.timezone,
      editable,
      fieldKey: "timezone",
    },
  ];

  const companyFields: FieldDefinition[] = [
    {
      label: "Company",
      value: contact.companyName,
      editable,
      fieldKey: "companyName",
    },
    {
      label: "Website",
      value: contact.website,
      type: "link",
      editable,
      fieldKey: "website",
      inputType: "url",
    },
  ];

  const attributionFields: FieldDefinition[] = [
    { label: "Source", value: contact.source, editable, fieldKey: "source" },
  ];

  const systemFields: FieldDefinition[] = [
    { label: "ID", value: contact.id, mono: true },
    { label: "Date Added", value: contact.dateAdded, type: "date" },
    { label: "Last Updated", value: contact.dateUpdated, type: "date" },
    { label: "Last Activity", value: contact.lastActivity, type: "date" },
    { label: "Assigned To", value: contact.assignedTo, mono: true },
  ];

  // Resolve custom field labels from definitions
  const customFieldItems: FieldDefinition[] = (contact.customFields ?? [])
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
      <FieldGroup
        title="Contact Information"
        fields={contactInfoFields}
        onSave={handleSave}
      />

      <Separator />
      <FieldGroup title="Company" fields={companyFields} onSave={handleSave} />

      <Separator />
      <FieldGroup
        title="Attribution"
        fields={attributionFields}
        onSave={handleSave}
      />

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
