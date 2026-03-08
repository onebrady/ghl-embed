"use client";

import { useCallback } from "react";
import type { KeyedMutator } from "swr";
import type { GHLOpportunity, GHLOpportunityResponse } from "@/lib/ghl/types";
import {
  FieldGroup,
  type FieldDefinition,
} from "@/components/contact/FieldGroup";
import { usePipelines } from "@/hooks/usePipelines";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { StageProgressBar } from "./StageProgressBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DealDetailsPanelProps {
  opportunity: GHLOpportunity;
  mutate?: KeyedMutator<GHLOpportunityResponse>;
}

export function DealDetailsPanel({
  opportunity,
  mutate,
}: DealDetailsPanelProps) {
  const router = useRouter();
  const { getPipeline, getPipelineName, getStageName } = usePipelines();

  const handleSave = useCallback(
    async (fieldKey: string, newValue: string) => {
      if (!mutate) return;

      // Parse value for special fields
      let apiValue: string | number | undefined = newValue || undefined;
      if (fieldKey === "monetaryValue") {
        apiValue = parseFloat(newValue) || 0;
      }

      // Build optimistic data
      const optimisticOpportunity = { ...opportunity, [fieldKey]: apiValue };
      const optimisticData: GHLOpportunityResponse = {
        opportunity: optimisticOpportunity,
      };

      // For stage changes, also send pipelineId
      const body: Record<string, unknown> = { [fieldKey]: apiValue };
      if (fieldKey === "pipelineStageId" && opportunity.pipelineId) {
        body.pipelineId = opportunity.pipelineId;
      }

      try {
        await mutate(optimisticData, { revalidate: false });

        const res = await fetch(`/api/ghl/opportunities/${opportunity.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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
        await mutate(); // Rollback
        toast.error(
          err instanceof Error ? err.message : "Failed to save changes"
        );
        throw err;
      }
    },
    [opportunity, mutate]
  );

  const editable = !!mutate;

  // Build stage options from pipeline
  const pipeline = getPipeline(opportunity.pipelineId ?? "");
  const stageOptions =
    pipeline?.stages.map((s) => ({ value: s.id, label: s.name })) ?? [];

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
    { value: "abandoned", label: "Abandoned" },
  ];

  const dealInfoFields: FieldDefinition[] = [
    {
      label: "Value",
      value:
        opportunity.monetaryValue !== undefined
          ? String(opportunity.monetaryValue)
          : undefined,
      editable,
      fieldKey: "monetaryValue",
      inputType: "number",
    },
    { label: "Source", value: opportunity.source, editable, fieldKey: "source" },
    {
      label: "Status",
      value: opportunity.status,
      editable,
      fieldKey: "status",
      inputType: "select",
      selectOptions: statusOptions,
    },
  ];

  const pipelineFields: FieldDefinition[] = [
    {
      label: "Pipeline",
      value: getPipelineName(opportunity.pipelineId ?? ""),
    },
    {
      label: "Stage",
      value: opportunity.pipelineStageId ?? "",
      editable: editable && stageOptions.length > 0,
      fieldKey: "pipelineStageId",
      inputType: "select",
      selectOptions: stageOptions,
    },
  ];

  const dateFields: FieldDefinition[] = [
    { label: "Created", value: opportunity.createdAt, type: "date" },
    { label: "Last Updated", value: opportunity.updatedAt, type: "date" },
    {
      label: "Last Stage Change",
      value: opportunity.lastStageChangeAt,
      type: "date",
    },
    {
      label: "Last Status Change",
      value: opportunity.lastStatusChangeAt,
      type: "date",
    },
    {
      label: "Last Action",
      value: opportunity.lastActionDate,
      type: "date",
    },
  ];

  const assignmentFields: FieldDefinition[] = [
    { label: "Assigned To", value: opportunity.assignedTo, mono: true },
  ];

  const systemFields: FieldDefinition[] = [
    { label: "ID", value: opportunity.id, mono: true },
    { label: "Contact ID", value: opportunity.contactId, mono: true },
    { label: "Location ID", value: opportunity.locationId, mono: true },
  ];

  // Format monetary display value for header
  const displayValue =
    opportunity.monetaryValue !== undefined
      ? `$${opportunity.monetaryValue.toLocaleString()}`
      : null;

  return (
    <div className="space-y-5 p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/deals")}
        className="-ml-2 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to deals
      </Button>

      {/* Deal header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight">
              {opportunity.name}
            </h2>
            {displayValue && (
              <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {displayValue}
              </p>
            )}
          </div>
        </div>
        <OpportunityStatusBadge status={opportunity.status} />
      </div>

      {/* Stage progress bar */}
      {opportunity.pipelineId && opportunity.pipelineStageId && (
        <>
          <Separator />
          <StageProgressBar
            pipelineId={opportunity.pipelineId}
            currentStageId={opportunity.pipelineStageId}
          />
        </>
      )}

      <Separator />
      <FieldGroup
        title="Deal Information"
        fields={dealInfoFields}
        onSave={handleSave}
      />

      <Separator />
      <FieldGroup
        title="Pipeline & Stage"
        fields={pipelineFields}
        onSave={handleSave}
      />

      <Separator />
      <FieldGroup title="Dates" fields={dateFields} />

      <Separator />
      <FieldGroup title="Assignment" fields={assignmentFields} />

      <Separator />
      <FieldGroup title="System" fields={systemFields} />
    </div>
  );
}
