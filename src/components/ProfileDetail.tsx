import { Activity, MapPin, Users, CheckCircle2, AlertTriangle, Circle } from "lucide-react";
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
            Select a solution to see details.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pilotRequirements = unique([
    ...(solution.pilotOffer?.requiredSystems ?? []),
    ...(solution.pilotOffer?.requiredData ?? []),
  ]);

  const match = solution.match;

  // "Why this match" positives and gaps — only shown when there's a match
  const positives: string[] = [];
  const gaps: string[] = [];

  if (match) {
    if (match.sharedCrops.length > 0) {
      positives.push(`Relevant to your ${match.sharedCrops.slice(0, 2).join(" and ")}`);
    }
    if (match.sharedContexts.length > 0) {
      positives.push(`Suited to ${match.sharedContexts[0]} context`);
    }
    if (match.components.geographyFitScore > 0) {
      positives.push("Available in your region");
    }
    if (solution.pilotOffer?.status === "Open") {
      positives.push("Active pilot opportunity");
    }
    if (solution.evidenceRecord?.quality === "High") {
      positives.push("High evidence quality");
    } else if (solution.evidenceRecord?.quality === "Medium") {
      positives.push("Good evidence quality");
    }

    // Gaps: required systems/data grower doesn't have
    const missingSystems = (solution.pilotOffer?.requiredSystems ?? solution.requiredSystems)
      .filter((s) => !match.matchedSystems.includes(s));
    const missingData = (solution.pilotOffer?.requiredData ?? solution.requiredData)
      .filter((d) => !match.matchedData.includes(d));
    gaps.push(...missingSystems.map((s) => `Requires ${s}`));
    gaps.push(...missingData.map((d) => `Needs ${d}`));
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        {solution.imageUrl && (
          <div className="mb-5 overflow-hidden rounded-2xl">
            <img
              src={solution.imageUrl}
              alt={solution.name}
              className="h-44 w-full object-cover"
            />
          </div>
        )}

        {/* Name + proposition + CTA */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              {solution.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-700">
              {solution.proposition}
            </p>
          </div>
          <Button
            onClick={onRequestIntro}
            className="shrink-0 rounded-xl bg-emerald-800 hover:bg-emerald-900"
          >
            Request intro
          </Button>
        </div>

        {/* 3 stat boxes */}
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
            <ul className="space-y-1">
              {solution.lookingFor.map((item) => (
                <li key={item} className="text-sm text-slate-700">{item}</li>
              ))}
              {solution.pilotOffer?.duration && (
                <li className="text-sm text-slate-500">{solution.pilotOffer.duration} pilot</li>
              )}
              {solution.pilotOffer?.requiredData?.[0] && (
                <li className="text-sm text-slate-500">{solution.pilotOffer.requiredData[0]}</li>
              )}
              {solution.geography.length > 0 && (
                <li className="text-sm text-slate-500">{solution.geography.join(", ")}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Validation stage progress bar */}
        <div className="mb-6">
          <StagePill stage={solution.stage} />
        </div>

        {/* Proof & availability (left) | Operational fit (right) */}
        <div className="mb-6 grid gap-5 md:grid-cols-2">
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
                <p className="text-xs text-slate-500">Measured / observed impact</p>
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
              {solution.pilotOffer?.includes && solution.pilotOffer.includes.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500">What&apos;s included</p>
                  <ul className="mt-1 space-y-1 text-sm text-slate-700">
                    {solution.pilotOffer.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {solution.pilotOffer?.responseTime && (
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
                  {solution.pilotOffer.responseTime}
                </div>
              )}
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle size={15} /> Validation note
                </div>
                Results should be reviewed per crop, region and disease pressure
                before implementation.
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-950">
              Operational fit
            </h4>
            <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
              {solution.contexts.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500">Works best in</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {solution.contexts.map((context) => (
                      <Tag
                        key={context}
                        active={match?.sharedContexts.includes(context)}
                      >
                        {context}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {solution.crops.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500">Relevant crops</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {solution.crops.map((crop) => (
                      <Tag
                        key={crop}
                        active={match?.sharedCrops.includes(crop)}
                      >
                        {crop}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {pilotRequirements.length > 0 && (
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
              )}
            </div>
          </section>
        </div>

        {/* Why this match — only shown when there's a grower match */}
        {match && positives.length > 0 && (
          <div className="mb-6 grid gap-5 md:grid-cols-2">
            <section>
              <h4 className="mb-3 text-sm font-semibold text-slate-950">
                Why this match
              </h4>
              <ul className="space-y-2">
                {positives.map((text) => (
                  <li key={text} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                    {text}
                  </li>
                ))}
              </ul>
            </section>
            {gaps.length > 0 && (
              <section>
                <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Potential gaps
                </h4>
                <ul className="space-y-2">
                  {gaps.map((text) => (
                    <li key={text} className="flex items-start gap-2 text-sm text-slate-400">
                      <Circle size={15} className="mt-0.5 shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* Score breakdown — always at the bottom */}
        {match && (
          <div className="rounded-2xl border border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-950">
                Score breakdown
              </h4>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                {match.score} score
              </span>
            </div>
            <ScoreBreakdown match={match} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
