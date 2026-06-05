"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Leaf, Filter, LogIn, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SolutionCard } from "@/components/SolutionCard";
import { ProfileDetail } from "@/components/ProfileDetail";
import { GrowerPanel } from "@/components/GrowerPanel";
import { IntakeModal } from "@/components/IntakeModal";
import { ProfilePickerModal } from "@/components/ProfilePickerModal";
import { AuthModal } from "@/components/AuthModal";
import { RequestIntroModal } from "@/components/RequestIntroModal";
import {
  CHALLENGES,
  SEED_EVIDENCE_RECORDS,
  SEED_PILOT_OFFERS,
  SEED_SOLUTIONS,
  SOLUTION_TYPES,
} from "@/data/seed";
import type {
  EvidenceRecord,
  Grower,
  GrowerRole,
  Match,
  PilotOffer,
  Solution,
} from "@/data/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  loadAllSolutions,
  loadGrowerProfile,
  saveSolution,
  saveGrowerProfile,
} from "@/lib/db";
import { buildMatches, enrichSolution } from "@/lib/matching";
import { cn, namesFromIds } from "@/lib/utils";

type ModalRole = "innovator" | "grower" | null;

export default function OpenFieldPage() {
  const [solutions, setSolutions] = useState<Solution[]>(SEED_SOLUTIONS);
  const [pilotOffers, setPilotOffers] = useState<PilotOffer[]>(SEED_PILOT_OFFERS);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>(SEED_EVIDENCE_RECORDS);

  const [activeGrower, setActiveGrower] = useState<Grower | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("sol-sporesight-ai");
  const [profilePickerOpen, setProfilePickerOpen] = useState(false);
  const [modalRole, setModalRole] = useState<ModalRole>(null);
  const [presetGrowerRole, setPresetGrowerRole] = useState<GrowerRole | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestIntroOpen, setRequestIntroOpen] = useState(false);

  // ── Persist grower profile in localStorage (survives page refresh without sign-in) ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("openfield-grower");
      if (stored) setActiveGrower(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (activeGrower) {
      localStorage.setItem("openfield-grower", JSON.stringify(activeGrower));
    }
  }, [activeGrower]);

  // ── Supabase: auth + data loading ──────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    // Load existing session (handles magic link redirects too)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadGrowerProfile(session.user.id).then((profile) => {
          if (profile) setActiveGrower(profile);
        });
      }
    });

    // Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user && event === "SIGNED_IN") {
          const dbProfile = await loadGrowerProfile(session.user.id);
          if (dbProfile) {
            setActiveGrower(dbProfile);
          } else {
            // Migrate any localStorage profile to Supabase on first sign-in
            try {
              const stored = localStorage.getItem("openfield-grower");
              if (stored) {
                const localProfile = JSON.parse(stored) as Grower;
                await saveGrowerProfile(localProfile, session.user.id);
              }
            } catch {}
          }
        }
        if (event === "SIGNED_OUT") {
          setActiveGrower(null);
          localStorage.removeItem("openfield-grower");
        }
      }
    );

    // Load all solutions from Supabase (replaces seed data if successful)
    loadAllSolutions().then((data) => {
      if (data && data.solutions.length > 0) {
        setSolutions(data.solutions);
        setPilotOffers(data.pilotOffers);
        setEvidenceRecords(data.evidenceRecords);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Matching ───────────────────────────────────────────────────────────────
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
        const typeMatch = selectedType === "All" || s.type === selectedType;
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
        return tagMatch && typeMatch && (!q || text.includes(q));
      })
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  }, [selectedTag, selectedType, query, enrichedSolutions]);

  const selected =
    filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? null;
  const bestMatch = filtered[0] ?? null;
  const sharedTags =
    activeGrower && selected
      ? namesFromIds(selected.match?.sharedChallengeIds ?? [], CHALLENGES)
      : [];
  const matchLabel =
    selected && bestMatch?.id === selected.id
      ? "Worth exploring for your operation"
      : "Currently viewing";

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleProfileSelect(profileType: "innovator" | "grower", growerRole?: GrowerRole) {
    setProfilePickerOpen(false);
    setPresetGrowerRole(growerRole);
    setModalRole(profileType);
  }

  async function handleCreateSolution(payload: {
    solution: Solution;
    pilotOffer: PilotOffer;
    evidenceRecord: EvidenceRecord;
  }) {
    setSolutions((prev) => [...prev, payload.solution]);
    setPilotOffers((prev) => [...prev, payload.pilotOffer]);
    setEvidenceRecords((prev) => [...prev, payload.evidenceRecord]);
    setSelectedId(payload.solution.id);
    setModalRole(null);
    await saveSolution(
      payload.solution,
      payload.pilotOffer,
      payload.evidenceRecord,
      user?.id
    );
  }

  async function handleCreateGrower(grower: Grower) {
    setActiveGrower(grower);
    setModalRole(null);
    if (user) {
      await saveGrowerProfile(grower, user.id);
    }
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
          <div className="flex items-center gap-2">
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
            {isSupabaseConfigured && (
              user ? (
                <button
                  onClick={() => supabase?.auth.signOut()}
                  title={`Signed in as ${user.email}`}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                >
                  <LogIn size={13} />
                  Sign in
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero + grower sidebar */}
        <section
          id="challenges"
          className="mb-8 grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="flex flex-col justify-center py-4">
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
              Find field-ready innovations and the growers to validate them.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
              OpenField brings together growers&rsquo; real challenges and the innovators
              building solutions to solve them. Practical fit, not marketing.
            </p>
            <ul className="mt-6 divide-y divide-slate-200 border-t border-slate-200 text-sm text-slate-600">
              {[
                "Share your operational details",
                "We surface the most operationally relevant innovations",
                "Request an intro and start a pilot this season",
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 py-3">
                  <span className="h-2 w-2 shrink-0 bg-emerald-500" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div id="grower-context" className="h-full">
            <GrowerPanel
              grower={activeGrower}
              onCreateProfile={() => setProfilePickerOpen(true)}
              onEdit={() => setModalRole("grower")}
            />
          </div>
        </section>

        {/* Search + filter bar */}
        <section id="solutions" className="mb-6 space-y-3 rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by challenge, crop, solution type or requirement..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 pr-1">
              Solution
            </span>
            {["All", ...CHALLENGES.map((c) => c.name)].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedTag === tag
                    ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400 pr-1">
              <Filter size={12} className="inline mr-1" />Type
            </span>
            {["All", ...SOLUTION_TYPES].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedType === type
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        {/* Section header above grid */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-950">
            Innovations on OpenField
          </h2>
          <p className="text-sm text-slate-500">
            Ranked by operational relevance.
          </p>
        </div>

        {/* Solution list + detail panel */}
        <section id="pilots" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
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
                      : "Select a solution to see its score"}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-50">
                    {activeGrower
                      ? `Shared challenges: ${sharedTags.length > 0 ? sharedTags.join(", ") : "none yet"}`
                      : "Add your profile to unlock operational relevance scores"}
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

      <footer className="mt-16 border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        Initiated with love by{" "}
        <a
          href="https://www.linkedin.com/in/arenddenhartog/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
        >
          Arend den Hartog
        </a>
      </footer>

      {profilePickerOpen && (
        <ProfilePickerModal
          onClose={() => setProfilePickerOpen(false)}
          onSelect={handleProfileSelect}
        />
      )}

      {modalRole && (
        <IntakeModal
          role={modalRole}
          presetGrowerRole={presetGrowerRole}
          onClose={() => {
            setModalRole(null);
            setPresetGrowerRole(undefined);
          }}
          onCreateSolution={handleCreateSolution}
          onCreateGrower={handleCreateGrower}
        />
      )}

      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
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
