"use client";

import useSWR from "swr";
import { useSubAccount } from "./useSubAccount";
import type {
  GHLPipelinesResponse,
  GHLPipeline,
  GHLPipelineStage,
} from "@/lib/ghl/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  });

export function usePipelines() {
  const { locationId } = useSubAccount();

  const { data, error, isLoading } = useSWR<GHLPipelinesResponse>(
    locationId ? `/api/ghl/pipelines?locationId=${locationId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const pipelines = data?.pipelines ?? [];

  function getPipeline(pipelineId: string): GHLPipeline | undefined {
    return pipelines.find((p) => p.id === pipelineId);
  }

  function getStage(
    pipelineId: string,
    stageId: string
  ): GHLPipelineStage | undefined {
    return getPipeline(pipelineId)?.stages.find((s) => s.id === stageId);
  }

  function getPipelineName(pipelineId: string): string {
    return getPipeline(pipelineId)?.name ?? "Unknown Pipeline";
  }

  function getStageName(pipelineId: string, stageId: string): string {
    return getStage(pipelineId, stageId)?.name ?? "Unknown Stage";
  }

  return {
    pipelines,
    isLoading,
    error,
    getPipeline,
    getStage,
    getPipelineName,
    getStageName,
  };
}
