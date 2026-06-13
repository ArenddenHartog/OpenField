"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LogIn, LogOut, Pencil } from "lucide-react";
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
  CHALLENGE_GROUPS,
  CROP_GROUPS,
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
  const [selectedCropGroup, setSelectedCropGroup] = useState("All");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("sol-sporesight-ai");
  const router = useRouter();
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

  // ── Pick up solution created on the /innovator page ────────────────────────
  useEffect(() => {
    try {
      const pending = localStorage.getItem("openfield-pending-solution");
      if (pending) {
        const { solution, pilotOffer, evidenceRecord } = JSON.parse(pending);
        setSolutions((prev) => [solution, ...prev]);
        setPilotOffers((prev) => [...prev, pilotOffer]);
        setEvidenceRecords((prev) => [...prev, evidenceRecord]);
        setSelectedId(solution.id);
        localStorage.removeItem("openfield-pending-solution");
      }
    } catch {}
  }, []);

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
        if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
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
                setActiveGrower(localProfile);
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
    const cropGroupItems = selectedCropGroup !== "All"
      ? (CROP_GROUPS.find((g) => g.label === selectedCropGroup)?.crops ?? [])
      : [];
    return enrichedSolutions
      .filter((s) => {
        const tagMatch = selectedTag === "All" || s.challengeIds.some((id) => {
          const group = CHALLENGE_GROUPS.find((g) => g.subgroups.some((sg) => sg.items.includes(id)));
          return group?.label === selectedTag;
        });
        const typeMatch = selectedType === "All" || s.type.includes(selectedType);
        const cropMatch =
          selectedCropGroup === "All" ? true :
          selectedCrop !== "All" ? s.crops.includes(selectedCrop) :
          s.crops.some((c) => cropGroupItems.includes(c));
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
        return tagMatch && typeMatch && cropMatch && (!q || text.includes(q));
      })
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  }, [selectedTag, selectedType, selectedCropGroup, selectedCrop, query, enrichedSolutions]);

  const selected =
    filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? null;
  const bestMatch = filtered[0] ?? null;
  const sharedTags =
    activeGrower && selected
      ? namesFromIds(selected.match?.sharedChallengeIds ?? [], CHALLENGES)
      : [];
  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleProfileSelect(profileType: "innovator" | "grower") {
    setProfilePickerOpen(false);
    router.push(profileType === "grower" ? "/profile" : "/innovator");
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
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#fbfaf5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-logo text-2xl font-bold tracking-tight text-slate-950">Aggy</h1>
          </div>
          <div className="flex items-center gap-2">
            {activeGrower ? (
              /* Profile chip */
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs hover:bg-slate-200"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-semibold text-white">
                  {activeGrower.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-slate-800">{activeGrower.name}</span>
                <Pencil size={11} className="text-slate-400" />
              </button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  className="rounded-xl border-slate-300"
                >
                  I am a grower
                </Button>
                <Button
                  onClick={() => router.push("/innovator")}
                  className="rounded-xl bg-emerald-800 hover:bg-emerald-900"
                >
                  I am an innovator
                </Button>
              </>
            )}
            {user ? (
              <button
                onClick={() => supabase?.auth.signOut()}
                title={`Signed in as ${user.email}`}
                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
              >
                <LogOut size={13} />
                Sign out
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
              >
                <LogIn size={13} />
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero + grower sidebar — only shown to visitors without a profile */}
        {!activeGrower && (
          <section
            id="challenges"
            className="mb-12 grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]"
          >
            <div className="flex flex-col py-4">
              <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
                Find what's worth trying next season.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">
                Connecting growers and innovators. Getting innovations into the field.
              </p>
              <p className="mt-1 text-base font-semibold text-slate-950">
                Practical fit, not marketing.
              </p>
              <ul className="mt-auto pt-6">
                {[
                  "Share what you're trying to improve.",
                  "See which innovations fit your operation.",
                  "Connect and get a pilot running this season.",
                ].map((text, i, arr) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-[7px] h-2 w-2 shrink-0 bg-emerald-500" />
                      {i < arr.length - 1 && (
                        <span className="my-0.5 w-px flex-1 bg-slate-200" style={{ minHeight: 16 }} />
                      )}
                    </div>
                    <p className="pb-3 text-sm text-slate-600">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div id="grower-context" className="h-full">
              <GrowerPanel
                grower={activeGrower}
                onCreateProfile={() => setProfilePickerOpen(true)}
                onEdit={() => router.push("/profile")}
              />
            </div>
          </section>
        )}

        {/* Search + filter bar */}
        <section id="solutions" className="mb-10 rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking to improve? e.g. disease pressure, labour shortage, irrigation…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <span className="shrink-0 w-14 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Challenge</span>
              <div className="flex items-center gap-1">
                {["All", ...CHALLENGE_GROUPS.map((g) => g.label)].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => activeGrower ? setSelectedTag(tag) : setProfilePickerOpen(true)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                      selectedTag === tag
                        ? "bg-emerald-800 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            {/* Crop filter — category row */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <span className="shrink-0 w-14 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Crop</span>
              <div className="flex items-center gap-1">
                {["All", ...CROP_GROUPS.map((g) => g.label)].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => {
                      if (!activeGrower) { setProfilePickerOpen(true); return; }
                      setSelectedCropGroup(grp);
                      setSelectedCrop("All");
                    }}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                      selectedCropGroup === grp
                        ? "bg-emerald-700 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>
            {/* Crop filter — sub-crop row (appears when a group is selected) */}
            {selectedCropGroup !== "All" && (
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pl-[68px]">
                <div className="flex items-center gap-1 border-l-2 border-emerald-200 pl-3">
                  {["All", ...(CROP_GROUPS.find((g) => g.label === selectedCropGroup)?.crops ?? [])].map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => activeGrower ? setSelectedCrop(crop) : setProfilePickerOpen(true)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                        selectedCrop === crop
                          ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-600"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {crop === "All" ? `All ${selectedCropGroup}` : crop}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <span className="shrink-0 w-14 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Type</span>
              <div className="flex items-center gap-1">
                {["All", ...SOLUTION_TYPES].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => activeGrower ? setSelectedType(type) : setProfilePickerOpen(true)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                      selectedType === type
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section header above grid */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-950">
            Innovations ready for the field
          </h2>
          {activeGrower && (
            <p className="text-sm text-slate-500">
              Recommended by operational fit.
            </p>
          )}
        </div>

        {/* Solution list + detail panel */}
        {!activeGrower ? (
          /* ── Visitor preview: 3 cards + locked 4th ── */
          <section id="pilots">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.slice(0, 3).map((s) => (
                <Card key={s.id} className="rounded-2xl border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-4">
                    {s.imageUrl && (
                      <div className="mb-3 overflow-hidden rounded-xl">
                        <img src={s.imageUrl} alt={s.name} className="h-24 w-full object-cover" />
                      </div>
                    )}
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.type}</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-950">{s.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-3">{s.proposition}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {s.tags.slice(0, 2).map((t) => (
                        <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{t}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Locked 4th card */}
              <div className="relative">
                <div className="pointer-events-none select-none rounded-2xl border border-slate-200 bg-white shadow-sm blur-[2px] opacity-40 overflow-hidden">
                  <div className="p-4">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Sensor</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-950">Solution preview</h3>
                    <p className="mt-1 text-xs text-slate-600">Ranked by your challenges, crops, and context fit.</p>
                    <div className="mt-3 flex gap-1">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Water</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Labour</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 p-4 text-center">
                  <p className="text-sm font-semibold text-slate-950">
                    {filtered.length > 3 ? `+${filtered.length - 3} more` : "Find innovations that fit"}
                  </p>
                  <p className="text-xs text-slate-500">Create a profile and see which innovations best match your operation.</p>
                  <Button
                    onClick={() => router.push("/profile")}
                    className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-xs px-4 py-2"
                  >
                    Create profile
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : (
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
                    <h3 className="text-lg font-semibold">
                      {selected
                        ? `${activeGrower?.name ?? "Your context"} × ${selected.name}`
                        : "Select a solution to see its score"}
                    </h3>
                    <p className="mt-1 text-sm text-emerald-50">
                      {selected?.match?.score
                        ? sharedTags.length > 0
                          ? `Shared challenge: ${sharedTags.join(", ")}`
                          : "Recommended on context, crops & geography fit"
                        : "Add a profile to see recommended matches"}
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
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 py-4 text-center text-sm text-slate-400">
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
