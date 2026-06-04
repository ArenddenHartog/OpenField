import { Activity, MapPin, Users, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/Tag";
import { StagePill } from "@/components/StagePill";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import type { EnrichedSolution } from "@/data/types";
import { unique } from "@/lib/utils";

interface ProfileDetailProps {
  solution: EnrichedSolution | null;
  onRequestIntro: () => void;
}

export function ProfileDetail({ solution, onRequestIntro }: ProfileDetailProps) {
  if (!solution) {
    return (
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-slate-600">
            No matching crop protection solution found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pilotRequirements = unique([
    ...(solution.pilotOffer?.requiredSystems ?? []),
    ...(solution.pilotOffer?.requiredData ?? []),
  ]);

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Solution profile
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">
              {solution.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-700">
              {solution.proposition}
            </p>
          </div>
          <Button
            onClick={onRequestIntro}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900"
          >
            Request intro
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Activity size={16} /> Stage
            </div>
            <p className="text-sm text-slate-700">{solution.stage}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MapPin size={16} /> Tested in
            </div>
            <p className="text-sm text-slate-700">
              {solution.evidenceRecord?.geography ?? "Not specified"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users size={16} /> Looking for
            </div>
            <p className="text-sm text-slate-700">
              {solution.lookingFor.join(", ")}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <StagePill stage={solution.stage} />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-950">
              Calculated match breakdown
            </h4>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              {solution.match?.score ?? "—"} score
            </span>
          </div>
          <ScoreBreakdown match={solution.match} />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-950">
              Operational fit
            </h4>
            <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="text-xs text-slate-500">Works best in</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {solution.contexts.map((context) => (
                    <Tag
                      key={context}
                      active={solution.match?.sharedContexts.includes(context)}
                    >
                      {context}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Relevant crops</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {solution.crops.map((crop) => (
                    <Tag
                      key={crop}
                      active={solution.match?.sharedCrops.includes(crop)}
                    >
                      {crop}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pilot requirements</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {pilotRequirements.map((requirement) => (
                    <li key={requirement} className="flex gap-2">
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 text-emerald-700"
                      />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-950">
              Proof &amp; availability
            </h4>
            <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="text-xs text-slate-500">Evidence</p>
                <p className="mt-1 text-sm text-slate-700">
                  {solution.evidenceRecord?.tested ?? "No evidence record linked"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Measured / observed impact
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {solution.evidenceRecord?.impact ?? "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pilot offer</p>
                <p className="mt-1 text-sm text-slate-700">
                  {solution.pilotOffer
                    ? `${solution.pilotOffer.type} · ${solution.pilotOffer.duration}`
                    : "No active pilot offer"}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle size={15} /> Validation note
                </div>
                Results should be reviewed per crop, region and disease pressure
                before implementation.
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
