import { STAGES } from "@/data/types";
import type { Stage } from "@/data/types";
import { cn } from "@/lib/utils";

interface StagePillProps {
  stage: Stage;
}

export function StagePill({ stage }: StagePillProps) {
  const index = STAGES.indexOf(stage);
  const safeIndex = index >= 0 ? index : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Validation stage</span>
        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-800">
          {stage}
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {STAGES.map((stageName, stageIndex) => (
          <div
            key={stageName}
            className={cn(
              "h-2 rounded-full",
              stageIndex <= safeIndex ? "bg-emerald-700" : "bg-slate-200"
            )}
            title={stageName}
          />
        ))}
      </div>
    </div>
  );
}
