import { ghl } from "./client";
import type {
  GHLOpportunitiesSearchResponse,
  GHLOpportunityResponse,
  GHLUpdateOpportunityBody,
  GHLUpdateOpportunityResponse,
  GHLPipelinesResponse,
} from "./types";

// ─── Search ───

export interface SearchOpportunitiesParams {
  locationId: string;
  contactId?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function searchOpportunities(params: SearchOpportunitiesParams) {
  const { data } = await ghl.get<GHLOpportunitiesSearchResponse>(
    "/opportunities/search",
    {
      location_id: params.locationId,
      contact_id: params.contactId,
      pipeline_id: params.pipelineId,
      pipeline_stage_id: params.pipelineStageId,
      status: params.status ?? "all",
      q: params.q,
      page: params.page,
      limit: params.limit ?? 20,
    },
    params.locationId
  );
  return data;
}

// ─── CRUD ───

export async function getOpportunity(opportunityId: string, locationId?: string) {
  const { data } = await ghl.get<GHLOpportunityResponse>(
    `/opportunities/${opportunityId}`,
    undefined,
    locationId
  );
  return data;
}

export async function updateOpportunity(
  opportunityId: string,
  body: GHLUpdateOpportunityBody,
  locationId?: string
) {
  const { data } = await ghl.put<GHLUpdateOpportunityResponse>(
    `/opportunities/${opportunityId}`,
    body as unknown as Record<string, unknown>,
    locationId
  );
  return data;
}

// ─── Pipelines ───

export async function getPipelines(locationId: string) {
  const { data } = await ghl.get<GHLPipelinesResponse>(
    "/opportunities/pipelines",
    { locationId },
    locationId
  );
  return data;
}
