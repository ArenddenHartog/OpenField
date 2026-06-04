import { Sprout, Pencil, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/Tag";
import { CHALLENGES } from "@/data/seed";
import type { Grower } from "@/data/types";
import { namesFromIds } from "@/lib/utils";

interface GrowerPanelProps {
  grower: Grower | null;
  onEdit: () => void;
}

export function GrowerPanel({ grower, onEdit }: GrowerPanelProps) {
  if (!grower) {
    return (
      <Card className="h-full rounded-2xl border-dashed border-slate-300 bg-white shadow-sm">
        <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
            <UserPlus size={28} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Your operational profile
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">
              Tell us about your operation
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Solutions are ranked based on your crops, challenges, and existing
              systems. Add your details to see personalised matches.
            </p>
          </div>
          <Button
            onClick={onEdit}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900"
          >
            Create OpenField profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        {/* Image */}
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
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Your operational profile
            </p>
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
            <p className="text-xs text-slate-500">Existing systems</p>
            <p className="text-sm font-medium text-slate-900">
              {grower.systems.slice(0, 2).join(", ") || "—"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
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
        </div>
      </CardContent>
    </Card>
  );
}
