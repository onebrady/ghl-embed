"use client";

import type { GHLOpportunity } from "@/lib/ghl/types";
import { FieldGroup, type FieldDefinition } from "@/components/contact/FieldGroup";
import { usePipelines } from "@/hooks/usePipelines";
import { OpportunityStatusBadge } from "./OpportunityStatusBadge";
import { StageProgressBar } from "./StageProgressBar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface DealDetailsPanelProps {
  opportunity: GHLOpportunity;
}

export function DealDetailsPanel({ opportunity }: DealDetailsPanelProps) {
  const router = useRouter();
  const { getPipelineName, getStageName } = usePipelines();

  const dealInfoFields: FieldDefinition[] = [
    {
      label: "Value",
      value:
        opportunity.monetaryValue !== undefined
          ? `$${opportunity.monetaryValue.toLocaleString()}`
          : undefined,
    },
    { label: "Source", value: opportunity.source },
  ];

  const pipelineFields: FieldDefinition[] = [
    {
      label: "Pipeline",
      value: getPipelineName(opportunity.pipelineId ?? ""),
    },
    {
      label: "Stage",
      value: getStageName(
        opportunity.pipelineId ?? "",
        opportunity.pipelineStageId ?? ""
      ),
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-tight">
              {opportunity.name}
            </h2>
            {opportunity.monetaryValue !== undefined && (
              <p className="text-lg font-bold tabular-nums text-emerald-600">
                ${opportunity.monetaryValue.toLocaleString()}
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
      <FieldGroup title="Deal Information" fields={dealInfoFields} />

      <Separator />
      <FieldGroup title="Pipeline & Stage" fields={pipelineFields} />

      <Separator />
      <FieldGroup title="Dates" fields={dateFields} />

      <Separator />
      <FieldGroup title="Assignment" fields={assignmentFields} />

      <Separator />
      <FieldGroup title="System" fields={systemFields} />
    </div>
  );
}
