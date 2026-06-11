"use client";

import { useState } from "react";
import { CHALLENGE_GROUPS } from "@/data/seed";
import { cn } from "@/lib/utils";

interface ChallengePickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  challengePriority?: Array<{ challengeId: string; severity: 1 | 2 | 3 | 4 | 5 }>;
  onPriorityChange?: (
    priority: Array<{ challengeId: string; severity: 1 | 2 | 3 | 4 | 5 }>
  ) => void;
}

export function ChallengePicker({
  selectedIds,
  onChange,
  challengePriority,
  onPriorityChange,
}: ChallengePickerProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSubgroup, setActiveSubgroup] = useState<string | null>(null);

  function toggleItem(item: string) {
    const next = selectedIds.includes(item)
      ? selectedIds.filter((id) => id !== item)
      : [...selectedIds, item];
    onChange(next);
  }

  function countInGroup(groupId: string) {
    const group = CHALLENGE_GROUPS.find((g) => g.id === groupId);
    if (!group) return 0;
    return group.subgroups.flatMap((sg) => sg.items).filter((item) => selectedIds.includes(item)).length;
  }

  function countInSubgroup(groupId: string, subgroupLabel: string) {
    const group = CHALLENGE_GROUPS.find((g) => g.id === groupId);
    if (!group) return 0;
    const sg = group.subgroups.find((s) => s.label === subgroupLabel);
    if (!sg) return 0;
    return sg.items.filter((item) => selectedIds.includes(item)).length;
  }

  const activeGroup = activeGroupId
    ? CHALLENGE_GROUPS.find((g) => g.id === activeGroupId) ?? null
    : null;
  const activeSubgroupData =
    activeGroup && activeSubgroup
      ? activeGroup.subgroups.find((sg) => sg.label === activeSubgroup) ?? null
      : null;

  return (
    <div className="space-y-2">
      {/* Level 1: Category chips */}
      <div className="flex flex-wrap gap-1.5">
        {CHALLENGE_GROUPS.map((group) => {
          const count = countInGroup(group.id);
          const isActive = activeGroupId === group.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                if (isActive) {
                  setActiveGroupId(null);
                  setActiveSubgroup(null);
                } else {
                  setActiveGroupId(group.id);
                  setActiveSubgroup(null);
                }
              }}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-emerald-800 text-white"
                  : count > 0
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {group.label}
              {count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive ? "bg-white text-emerald-800" : "bg-emerald-100 text-emerald-800"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Level 2: Subcategory chips */}
      {activeGroup && (
        <div className="flex flex-wrap gap-1.5 pl-2 border-l-2 border-emerald-200">
          {activeGroup.subgroups.map((sg) => {
            const count = countInSubgroup(activeGroup.id, sg.label);
            const isActive = activeSubgroup === sg.label;
            return (
              <button
                key={sg.label}
                type="button"
                onClick={() => {
                  setActiveSubgroup(isActive ? null : sg.label);
                }}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : count > 0
                      ? "bg-slate-100 text-slate-800 border border-slate-300"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {sg.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      isActive ? "bg-white text-slate-800" : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Level 3: Individual challenge items */}
      {activeSubgroupData && (
        <div className="flex flex-wrap gap-1.5 pl-4 border-l-2 border-slate-200">
          {activeSubgroupData.items.map((item) => {
            const isSelected = selectedIds.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleItem(item)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      {/* Summary line */}
      {selectedIds.length > 0 && !activeGroupId && (
        <p className="text-xs text-slate-500">
          {selectedIds.length} selected —{" "}
          {selectedIds.slice(0, 3).join(", ")}
          {selectedIds.length > 3 && ` +${selectedIds.length - 3} more`}
        </p>
      )}

      {/* Stars for selected items if onPriorityChange provided */}
      {onPriorityChange && selectedIds.length > 0 && (
        <div className="space-y-1 pt-1">
          {selectedIds.map((id) => {
            const priority = challengePriority?.find((p) => p.challengeId === id);
            const severity = priority?.severity ?? 3;
            return (
              <div key={id} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 min-w-0 flex-1 truncate">{id}</span>
                <div className="flex gap-0.5">
                  {([1, 2, 3, 4, 5] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        const next = (challengePriority ?? []).filter(
                          (p) => p.challengeId !== id
                        );
                        onPriorityChange([...next, { challengeId: id, severity: star }]);
                      }}
                      className={cn(
                        "text-base leading-none",
                        star <= severity ? "text-amber-400" : "text-slate-200"
                      )}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
