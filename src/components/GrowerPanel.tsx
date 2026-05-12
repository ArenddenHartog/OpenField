import { Sprout } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "@/components/Tag";
import { CHALLENGES } from "@/data/seed";
import type { Grower } from "@/data/types";
import { namesFromIds } from "@/lib/utils";

interface GrowerPanelProps {
  grower: Grower;
}

export function GrowerPanel({ grower }: GrowerPanelProps) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Grower context
            </p>
            <h3 className="text-lg font-semibold text-slate-950">
              {grower.name}
            </h3>
            <p className="text-sm text-slate-500">
              {grower.operation} · {grower.region}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
            <Sprout size={20} />
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
              {grower.systems.slice(0, 2).join(", ")}
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
          <div>
            <p className="mb-2 text-xs text-slate-500">Pilot constraints</p>
            <div className="flex flex-wrap gap-2">
              {grower.constraints.map((constraint) => (
                <Tag key={constraint}>{constraint}</Tag>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
