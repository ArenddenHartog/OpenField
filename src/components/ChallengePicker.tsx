import { CHALLENGES } from "@/data/seed";
import type { ChallengeId } from "@/data/types";
import { cn } from "@/lib/utils";

interface ChallengePickerProps {
  selectedIds: ChallengeId[];
  onChange: (ids: ChallengeId[]) => void;
}

export function ChallengePicker({ selectedIds, onChange }: ChallengePickerProps) {
  function toggle(id: ChallengeId) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    onChange(next.length ? next : [id]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CHALLENGES.map((challenge) => (
        <button
          key={challenge.id}
          type="button"
          onClick={() => toggle(challenge.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            selectedIds.includes(challenge.id)
              ? "border-emerald-700 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white text-slate-600"
          )}
        >
          {challenge.name}
        </button>
      ))}
    </div>
  );
}
