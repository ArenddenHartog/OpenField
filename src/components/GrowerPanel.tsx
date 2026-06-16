import { Sprout, Pencil, Activity, MapPin, Users, CheckCircle2 } from "lucide-react";
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
        {/* Ghost — mirrors the actual detail card with fake data, softly blurred */}
        <div className="pointer-events-none select-none blur-[2px]">
          <CardContent className="p-6">
            {/* Name + CTA row */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">SporeSight AI</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Early mildew and fungal disease detection from greenhouse imagery.
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-emerald-800 px-3 py-2 text-sm font-medium text-white">
                Request intro
              </span>
            </div>

            {/* 3 stat boxes */}
            <div className="mb-6 grid gap-4 grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Activity size={16} /> Stage
                </div>
                <p className="text-sm text-slate-700">Active pilots</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin size={16} /> Tested in
                </div>
                <p className="text-sm text-slate-700">NL, BE</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Users size={16} /> Looking for
                </div>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>Pilot growers</li>
                  <li>Agronomic feedback</li>
                </ul>
              </div>
            </div>

            {/* Proof & fit */}
            <div className="grid gap-5 grid-cols-2">
              <section>
                <h4 className="mb-3 text-sm font-semibold text-slate-950">Proof &amp; availability</h4>
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Evidence</p>
                    <p className="mt-1 text-sm text-slate-700">3 greenhouse trials, 2023–24</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Measured impact</p>
                    <p className="mt-1 text-sm text-slate-700">Up to 40% earlier detection</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pilot offer</p>
                    <p className="mt-1 text-sm text-slate-700">Product trial · 10–12 weeks</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">What&apos;s included</p>
                    <ul className="mt-1 space-y-1 text-sm text-slate-700">
                      {["Camera setup", "Weekly reports", "Agronomist support"].map((i) => (
                        <li key={i} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" />{i}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
              <section>
                <h4 className="mb-3 text-sm font-semibold text-slate-950">Operational fit</h4>
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Works best in</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Greenhouse", "Vertical farming"].map((c) => <Tag key={c} active>{c}</Tag>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Relevant crops</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Tomatoes", "Cucumbers", "Peppers"].map((c) => <Tag key={c}>{c}</Tag>)}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </div>

        {/* CTA overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
          <div className="mx-4 w-full max-w-xs rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-lg">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
              Free · Takes 2 minutes
            </p>
            <h3 className="mb-1.5 text-base font-semibold text-slate-950">
              See innovations that work.
            </h3>
            <p className="mb-5 text-xs leading-relaxed text-slate-500">
              Add your profile and discover innovations that fit your operation.
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
