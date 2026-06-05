import type { Match } from "@/data/types";

interface ScoreBreakdownProps {
  match: Match | undefined;
}

const SCORE_ROWS: [string, keyof Match["components"]][] = [
  ["Challenge fit", "challengeFitScore"],
  ["Context fit", "contextFitScore"],
  ["Crop fit", "cropFitScore"],
  ["Pilot readiness", "pilotReadinessScore"],
  ["Geography", "geographyFitScore"],
  ["Validation", "validationFitScore"],
];

export function ScoreBreakdown({ match }: ScoreBreakdownProps) {
  if (!match) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SCORE_ROWS.map(([label, key]) => {
        const value = match.components[key];
        return (
          <div key={label} className="rounded-xl bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>{label}</span>
              <span className="font-medium text-slate-700">{value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full bg-emerald-700"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
