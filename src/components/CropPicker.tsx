"use client";

import { useState } from "react";
import { CROP_GROUPS } from "@/data/seed";
import { cn } from "@/lib/utils";

interface CropPickerProps {
  selectedCrops: string[];
  onChange: (crops: string[]) => void;
}

export function CropPicker({ selectedCrops, onChange }: CropPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  function toggle(crop: string) {
    onChange(
      selectedCrops.includes(crop)
        ? selectedCrops.filter((c) => c !== crop)
        : [...selectedCrops, crop]
    );
  }

  const count = selectedCrops.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Select all that apply</span>
        {count > 0 && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
            {count} selected
          </span>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CROP_GROUPS.map((group) => {
          const groupCount = group.crops.filter((c) => selectedCrops.includes(c)).length;
          const isActive = activeCategory === group.label;
          return (
            <button
              key={group.label}
              type="button"
              onClick={() => setActiveCategory(isActive ? null : group.label)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-emerald-700 bg-emerald-800 text-white"
                  : groupCount > 0
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              {group.label}
              {groupCount > 0 && !isActive && (
                <span className="ml-1.5 rounded-full bg-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900">
                  {groupCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Individual crops for active category */}
      {activeCategory && (
        <div className="ml-1 border-l-2 border-emerald-200 pl-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {(CROP_GROUPS.find((g) => g.label === activeCategory)?.crops ?? []).map((crop) => (
              <button
                key={crop}
                type="button"
                onClick={() => toggle(crop)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  selectedCrops.includes(crop)
                    ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary line */}
      {selectedCrops.length > 0 && !activeCategory && (
        <p className="text-xs text-slate-500">
          {selectedCrops.length} selected —{" "}
          {selectedCrops.slice(0, 3).join(", ")}
          {selectedCrops.length > 3 && ` +${selectedCrops.length - 3} more`}
        </p>
      )}
    </div>
  );
}
