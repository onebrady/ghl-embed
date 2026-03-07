"use client";

import { usePipelines } from "@/hooks/usePipelines";
import { cn } from "@/lib/utils";

interface StageProgressBarProps {
  pipelineId: string;
  currentStageId: string;
}

export function StageProgressBar({
  pipelineId,
  currentStageId,
}: StageProgressBarProps) {
  const { getPipeline } = usePipelines();
  const pipeline = getPipeline(pipelineId);

  if (!pipeline) return null;

  const stages = [...pipeline.stages].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  const currentIndex = stages.findIndex((s) => s.id === currentStageId);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pipeline Progress
      </h3>
      <div className="flex items-start gap-1">
        {stages.map((stage, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div
              key={stage.id}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "h-2 w-full rounded-full transition-colors",
                  isPast && "bg-primary",
                  isCurrent && "bg-primary",
                  !isPast && !isCurrent && "bg-muted"
                )}
              />
              <span
                className={cn(
                  "text-center text-[10px] leading-tight",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
