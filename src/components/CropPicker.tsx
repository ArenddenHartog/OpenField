"use client";

import { CROP_GROUPS } from "@/data/seed";
import { cn } from "@/lib/utils";

interface CropPickerProps {
  selectedCrops: string[];
  onChange: (crops: string[]) => void;
}

export function CropPicker({ selectedCrops, onChange }: CropPickerProps) {
  function toggle(crop: string) {
    onChange(
      selectedCrops.includes(crop)
        ? selectedCrops.filter((c) => c !== crop)
        : [...selectedCrops, crop]
    );
  }

  const count = selectedCrops.length;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Select all that apply
        </span>
        {count > 0 && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
            {count} selected
          </span>
        )}
      </div>

      {CROP_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.crops.map((crop) => (
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
      ))}
    </div>
  );
}
