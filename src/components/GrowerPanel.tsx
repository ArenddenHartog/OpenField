import { Sprout, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/Tag";
import { CHALLENGES } from "@/data/seed";
import type { Grower } from "@/data/types";
import { namesFromIds } from "@/lib/utils";

interface GrowerPanelProps {
  grower: Grower | null;
  onCreateProfile: () => void;
  onEdit: () => void;
}

export function GrowerPanel({ grower, onCreateProfile, onEdit }: GrowerPanelProps) {
  if (!grower) {
    return (
      <Card className="relative h-full overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        {/* Ghost profile — blurred preview of what a filled card looks like */}
        <CardContent className="pointer-events-none select-none p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-5 w-32 rounded-full bg-slate-200 blur-[3px]" />
                <div className="h-4 w-16 rounded-full bg-slate-100 blur-[3px]" />
              </div>
              <div className="h-3.5 w-44 rounded-full bg-slate-100 blur-[3px]" />
            </div>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-100">
              <Sprout size={20} />
            </div>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="mb-1.5 h-2.5 w-12 rounded bg-slate-200 blur-[2px]" />
              <div className="h-4 w-24 rounded bg-slate-300 blur-[2px]" />
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="mb-1.5 h-2.5 w-16 rounded bg-slate-200 blur-[2px]" />
              <div className="h-4 w-20 rounded bg-slate-300 blur-[2px]" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="mb-2 h-2.5 w-28 rounded bg-slate-200 blur-[2px]" />
              <div className="flex flex-wrap gap-2">
                {[28, 24, 32].map((w) => (
                  <div key={w} className={`h-6 w-${w} rounded-full bg-emerald-100 blur-[3px]`} />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 h-2.5 w-16 rounded bg-slate-200 blur-[2px]" />
              <div className="flex flex-wrap gap-2">
                {[20, 16, 24].map((w) => (
                  <div key={w} className={`h-6 w-${w} rounded-full bg-slate-100 blur-[2px]`} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>

        {/* CTA overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="mx-4 w-full max-w-xs rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-lg">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
              Free · Takes 2 minutes
            </p>
            <h3 className="mb-1.5 text-base font-semibold text-slate-950">
              See which innovations fit your farm.
            </h3>
            <p className="mb-5 text-xs leading-relaxed text-slate-500">
              Add your profile and get a personalised, ranked list of matching innovations.
            </p>
            <Button
              onClick={onCreateProfile}
              className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900"
            >
              Create profile
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        {grower.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-xl">
            <img
              src={grower.imageUrl}
              alt={grower.name}
              className="h-36 w-full object-cover"
            />
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-950">
                {grower.name}
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {grower.role}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {grower.operation} · {grower.region}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Edit operational profile"
            >
              <Pencil size={15} />
            </button>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
              <Sprout size={20} />
            </div>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Openness</p>
            <p className="text-sm font-medium text-slate-900">
              {grower.openness}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Pilot types</p>
            <p className="text-sm font-medium text-slate-900">
              {grower.pilotTypes.length > 0 ? grower.pilotTypes.slice(0, 2).join(", ") : "—"}
            </p>
          </div>
        </div>

        {grower.operationScale && (
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Scale</p>
            <p className="text-sm font-medium text-slate-900">{grower.operationScale}</p>
          </div>
        )}

        <div className="space-y-3">
          {namesFromIds(grower.challengeIds, CHALLENGES).length > 0 && (
            <div>
              <p className="mb-2 text-xs text-slate-500">Current challenges</p>
              <div className="flex flex-wrap gap-2">
                {namesFromIds(grower.challengeIds, CHALLENGES).map((challenge) => (
                  <Tag key={challenge} active>
                    {challenge}
                  </Tag>
                ))}
              </div>
            </div>
          )}
          {grower.crops.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-slate-500">Crops</p>
              <div className="flex flex-wrap gap-2">
                {grower.crops.map((crop) => (
                  <Tag key={crop}>{crop}</Tag>
                ))}
              </div>
            </div>
          )}
          {grower.constraints.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-slate-500">Pilot constraints</p>
              <div className="flex flex-wrap gap-2">
                {grower.constraints.map((constraint) => (
                  <Tag key={constraint}>{constraint}</Tag>
                ))}
              </div>
            </div>
          )}
          {grower.systems.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-slate-500">Existing systems</p>
              <div className="flex flex-wrap gap-2">
                {grower.systems.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
