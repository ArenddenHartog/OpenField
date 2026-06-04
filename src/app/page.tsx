"use client";

import { useMemo, useState } from "react";
import { Search, Leaf, Filter, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SolutionCard } from "@/components/SolutionCard";
import { ProfileDetail } from "@/components/ProfileDetail";
import { GrowerPanel } from "@/components/GrowerPanel";
import { IntakeModal } from "@/components/IntakeModal";
import { RequestIntroModal } from "@/components/RequestIntroModal";
import {
  CHALLENGES,
  SEED_EVIDENCE_RECORDS,
  SEED_PILOT_OFFERS,
  SEED_SOLUTIONS,
} from "@/data/seed";
import type {
  EvidenceRecord,
  Grower,
  Match,
  PilotOffer,
  Solution,
} from "@/data/types";
import { buildMatches, enrichSolution } from "@/lib/matching";
import { cn, namesFromIds } from "@/lib/utils";

type ModalRole = "innovator" | "grower" | null;

export default function OpenFieldPage() {
  const [solutions, setSolutions] = useState<Solution[]>(SEED_SOLUTIONS);
  const [pilotOffers, setPilotOffers] = useState<PilotOffer[]>(SEED_PILOT_OFFERS);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>(SEED_EVIDENCE_RECORDS);

  // null = anonymous visitor; set when grower completes their profile
  const [activeGrower, setActiveGrower] = useState<Grower | null>(null);
  const [selectedTag, setSelectedTag] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("sol-sporesight-ai");
  const [modalRole, setModalRole] = useState<ModalRole>(null);
  const [requestIntroOpen, setRequestIntroOpen] = useState(false);

  const matches = useMemo<Match[]>(
    () =>
      activeGrower
        ? buildMatches(activeGrower, solutions, pilotOffers, evidenceRecords)
        : [],
    [activeGrower, solutions, pilotOffers, evidenceRecords]
  );

  const enrichedSolutions = useMemo(
    () =>
      solutions.map((s) =>
        enrichSolution(s, matches, pilotOffers, evidenceRecords, CHALLENGES)
      ),
    [solutions, matches, pilotOffers, evidenceRecords]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrichedSolutions
      .filter((s) => {
        const tagMatch = selectedTag === "All" || s.tags.includes(selectedTag);
        const text = [
          s.name,
          s.proposition,
          s.type,
          s.stage,
          s.pilotOffer?.title,
          s.pilotOffer?.availability,
          s.evidenceRecord?.impact,
          ...s.tags,
          ...s.crops,
          ...s.contexts,
          ...s.lookingFor,
          ...s.requiredSystems,
          ...s.requiredData,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return tagMatch && (!q || text.includes(q));
      })
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  }, [selectedTag, query, enrichedSolutions]);

  const selected =
    filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? null;
  const bestMatch = filtered[0] ?? null;
  const sharedTags =
    activeGrower && selected
      ? namesFromIds(selected.match?.sharedChallengeIds ?? [], CHALLENGES)
      : [];
  const matchLabel =
    selected && bestMatch?.id === selected.id
      ? "Best current match"
      : "Selected match";

  function handleCreateSolution(payload: {
    solution: Solution;
    pilotOffer: PilotOffer;
    evidenceRecord: EvidenceRecord;
  }) {
    setSolutions((prev) => [...prev, payload.solution]);
    setPilotOffers((prev) => [...prev, payload.pilotOffer]);
    setEvidenceRecords((prev) => [...prev, payload.evidenceRecord]);
    setSelectedId(payload.solution.id);
    setModalRole(null);
  }

  function handleCreateGrower(grower: Grower) {
    setActiveGrower(grower);
    setModalRole(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f6ef] text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-[#fbfaf5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-800 p-2 text-white">
              <Leaf size={22} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">OpenField</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setModalRole("grower")}
              className="rounded-xl border-slate-300"
            >
              I am a grower
            </Button>
            <Button
              onClick={() => setModalRole("innovator")}
              className="rounded-xl bg-emerald-800 hover:bg-emerald-900"
            >
              I am an innovator
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero + grower sidebar */}
        <section
          id="challenges"
          className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Find field-ready crop protection innovations — and the growers to
              validate them.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
              OpenField connects practical crop protection challenges with
              innovators who are ready to test, prove, or scale their solutions
              in real agricultural conditions.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Tell us your context — crops, challenges, systems
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                We rank and match solutions to your situation
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Request an intro to start a pilot
              </li>
            </ul>
          </div>

          <div id="grower-context">
            <GrowerPanel
              grower={activeGrower}
              onEdit={() => setModalRole("grower")}
            />
          </div>
        </section>

        {/* Search + filter bar */}
        <section
          id="solutions"
          className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by disease, crop, solution type or requirement..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter size={16} className="text-slate-400" />
            {["All", ...CHALLENGES.map((c) => c.name)].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium",
                  selectedTag === tag
                    ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-600"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Solution list + detail panel */}
        <section id="pilots" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Crop protection solutions
                </h2>
                <p className="text-sm text-slate-500">
                  Filtered and ranked by calculated practical fit.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setModalRole("innovator")}
              >
                <Plus size={16} className="mr-2" /> Add
              </Button>
            </div>

            {filtered.length > 0 ? (
              filtered.map((s) => (
                <SolutionCard
                  key={s.id}
                  solution={s}
                  selected={selected?.id === s.id}
                  onClick={() => setSelectedId(s.id)}
                />
              ))
            ) : (
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-900">
                    No solutions found
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Try another challenge tag or search term.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sticky detail panel */}
          <div className="sticky top-6 h-fit space-y-4">
            <div className="rounded-2xl bg-emerald-900 p-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-100">
                    {matchLabel}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {selected
                      ? `${activeGrower?.name ?? "Your context"} × ${selected.name}`
                      : "Select a solution to see your match"}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-50">
                    {activeGrower
                      ? `Shared challenges: ${sharedTags.length > 0 ? sharedTags.join(", ") : "none yet"}`
                      : "Fill in your grower context to see personalised scores"}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-center text-emerald-950">
                  <div className="text-xl font-semibold">
                    {selected?.match?.score ?? "—"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide">
                    score
                  </div>
                </div>
              </div>
            </div>
            <ProfileDetail
              solution={selected}
              onRequestIntro={() => setRequestIntroOpen(true)}
            />
          </div>
        </section>
      </main>

      {modalRole && (
        <IntakeModal
          role={modalRole}
          onClose={() => setModalRole(null)}
          onCreateSolution={handleCreateSolution}
          onCreateGrower={handleCreateGrower}
        />
      )}

      {requestIntroOpen && selected && (
        <RequestIntroModal
          solution={selected}
          onClose={() => setRequestIntroOpen(false)}
        />
      )}
    </div>
  );
}
