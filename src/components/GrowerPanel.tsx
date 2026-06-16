import { Sprout, Pencil, ShieldCheck, Handshake, ArrowRight } from "lucide-react";
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
    const ghostCards = [
      {
        name: "SporeSight AI",
        type: "AI / Software",
        proposition: "Early mildew and fungal disease detection from greenhouse imagery.",
        tags: ["Disease detection", "Greenhouse", "Imaging"],
        stage: "Proven in production",
        stageIndex: 4,
        pilot: "Commercial rollout; pilots for new crops",
        score: 56,
      },
      {
        name: "BioShield Labs",
        type: "Biological / Biostimulants",
        proposition: "Beneficial microbe treatment to suppress soil-borne pathogens.",
        tags: ["Pest control", "Soil health"],
        stage: "Active pilots",
        stageIndex: 3,
        pilot: "Seeking pilot growers in NL, BE",
        score: 45,
      },
    ];

    return (
      <Card className="relative h-full overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
        {/* Ghost — two fake solution cards, blurred */}
        <div className="pointer-events-none select-none blur-[2px]">
          <div className="space-y-3 p-4">
            {ghostCards.map((card) => (
              <div key={card.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">{card.name}</h3>
                        <p className="text-xs text-slate-500">{card.type}</p>
                      </div>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-slate-700">{card.proposition}</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white shrink-0">
                    <div className="text-lg font-semibold">{card.score}</div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-300">score</div>
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">{tag}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Validation stage</span>
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-800">{card.stage}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`h-2 rounded-full ${i <= card.stageIndex ? "bg-emerald-700" : "bg-slate-200"}`} />
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Handshake size={14} />
                    {card.pilot}
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
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
