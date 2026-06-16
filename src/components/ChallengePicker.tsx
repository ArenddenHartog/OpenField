"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeSubgroup, setActiveSubgroup] = useState<string | null>(null);

  function toggleItem(item: string) {
    const next = selectedIds.includes(item)
      ? selectedIds.filter((id) => id !== item)
      : [...selectedIds, item];
    onChange(next);
  }

  function toggleSubgroup(items: string[]) {
    const allSelected = items.every((item) => selectedIds.includes(item));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !items.includes(id)));
    } else {
      const toAdd = items.filter((item) => !selectedIds.includes(item));
      onChange([...selectedIds, ...toAdd]);
    }
  }

  function toggleGroup(groupId: string) {
    const group = CHALLENGE_GROUPS.find((g) => g.id === groupId);
    if (!group) return;
    const allItems = group.subgroups.flatMap((sg) => sg.items);
    const allSelected = allItems.every((item) => selectedIds.includes(item));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !allItems.includes(id)));
    } else {
      const toAdd = allItems.filter((item) => !selectedIds.includes(item));
      onChange([...selectedIds, ...toAdd]);
    }
    // Toggle expansion
    if (activeGroupId === groupId) {
      setActiveGroupId(null);
      setActiveSubgroup(null);
    } else {
      setActiveGroupId(groupId);
      setActiveSubgroup(null);
    }
  }

  const q = query.toLowerCase().trim();

  // ── Search mode ──────────────────────────────────────────────────────────────

  if (q) {
    const matchedSubgroups: Array<{ label: string; items: string[] }> = [];
    const matchedItems: Array<{ item: string; subgroupLabel: string }> = [];

    for (const group of CHALLENGE_GROUPS) {
      for (const sg of group.subgroups) {
        if (sg.label.toLowerCase().includes(q)) {
          matchedSubgroups.push(sg);
        } else {
          for (const item of sg.items) {
            if (item.toLowerCase().includes(q)) {
              matchedItems.push({ item, subgroupLabel: sg.label });
            }
          }
        }
      }
    }

    return (
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search challenges…"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-9 pr-9 text-sm outline-none focus:border-emerald-700"
          />
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search results */}
        {matchedSubgroups.length === 0 && matchedItems.length === 0 ? (
          <p className="text-xs text-slate-400">No results for &ldquo;{query}&rdquo;</p>
        ) : (
          <div className="space-y-3">
            {matchedSubgroups.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Subgroups</p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSubgroups.map((sg) => {
                    const count = sg.items.filter((i) => selectedIds.includes(i)).length;
                    const allSel = count === sg.items.length;
                    const someSel = count > 0 && !allSel;
                    return (
                      <button
                        key={sg.label}
                        type="button"
                        onClick={() => toggleSubgroup(sg.items)}
                        className={cn(
                          "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          allSel
                            ? "border border-emerald-700 bg-emerald-50 text-emerald-900"
                            : someSel
                              ? "border border-slate-300 bg-slate-50 text-slate-700"
                              : "border border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {sg.label}
                        {count > 0 && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                              allSel ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {matchedItems.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Items</p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedItems.map(({ item }) => {
                    const isSel = selectedIds.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          isSel
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Priority stars */}
        {onPriorityChange && selectedIds.length > 0 && (
          <PriorityStars
            selectedIds={selectedIds}
            challengePriority={challengePriority}
            onPriorityChange={onPriorityChange}
          />
        )}
      </div>
    );
  }

  function toggleSubgroupWithExpand(sg: { label: string; items: string[] }) {
    toggleSubgroup(sg.items);
    setActiveSubgroup((prev) => (prev === sg.label ? null : sg.label));
  }

  // ── Browse mode ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search challenges…"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-9 text-sm outline-none focus:border-emerald-700"
        />
      </div>

      {/* Group chips — inline */}
      <div className="flex flex-wrap gap-1.5">
        {CHALLENGE_GROUPS.map((group) => {
          const allItems = group.subgroups.flatMap((sg) => sg.items);
          const count = allItems.filter((i) => selectedIds.includes(i)).length;
          const allSel = count === allItems.length && allItems.length > 0;
          const someSel = count > 0 && !allSel;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                allSel
                  ? "border border-emerald-700 bg-emerald-50 text-emerald-900"
                  : someSel
                    ? "border border-slate-300 bg-slate-50 text-slate-700"
                    : "border border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              {group.label}
              {count > 0 && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", allSel ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subgroup chips — shown when a group is active */}
      {activeGroupId && (() => {
        const group = CHALLENGE_GROUPS.find((g) => g.id === activeGroupId);
        if (!group) return null;
        return (
          <div className="space-y-1.5 border-l-2 border-slate-200 pl-3">
            <div className="flex flex-wrap gap-1.5">
              {group.subgroups.map((sg) => {
                const sgCount = sg.items.filter((i) => selectedIds.includes(i)).length;
                const sgAllSel = sgCount === sg.items.length;
                const sgSomeSel = sgCount > 0 && !sgAllSel;
                return (
                  <button
                    key={sg.label}
                    type="button"
                    onClick={() => toggleSubgroupWithExpand(sg)}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      sgAllSel
                        ? "border border-emerald-700 bg-emerald-50 text-emerald-900"
                        : sgSomeSel
                          ? "border border-slate-300 bg-slate-50 text-slate-700"
                          : "border border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    {sg.label}
                    {sgCount > 0 && (
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", sgAllSel ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>
                        {sgCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Individual items — shown when a subgroup is active */}
            {activeSubgroup && (() => {
              const sg = group.subgroups.find((s) => s.label === activeSubgroup);
              if (!sg) return null;
              return (
                <div className="flex flex-wrap gap-1.5 border-l-2 border-slate-200 pl-3">
                  {sg.items.map((item) => {
                    const isSel = selectedIds.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          isSel ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Summary line */}
      {selectedIds.length > 0 && (
        <p className="text-xs text-slate-500">
          {selectedIds.length} selected —{" "}
          {selectedIds.slice(0, 3).join(", ")}
          {selectedIds.length > 3 && ` +${selectedIds.length - 3} more`}
        </p>
      )}

      {/* Priority stars */}
      {onPriorityChange && selectedIds.length > 0 && (
        <PriorityStars
          selectedIds={selectedIds}
          challengePriority={challengePriority}
          onPriorityChange={onPriorityChange}
        />
      )}
    </div>
  );
}

// ─── Priority stars sub-component ────────────────────────────────────────────

function PriorityStars({
  selectedIds,
  challengePriority,
  onPriorityChange,
}: {
  selectedIds: string[];
  challengePriority?: Array<{ challengeId: string; severity: 1 | 2 | 3 | 4 | 5 }>;
  onPriorityChange: (priority: Array<{ challengeId: string; severity: 1 | 2 | 3 | 4 | 5 }>) => void;
}) {
  return (
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
  );
}
