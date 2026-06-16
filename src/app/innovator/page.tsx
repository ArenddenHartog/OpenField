"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengePicker } from "@/components/ChallengePicker";
import { CropPicker } from "@/components/CropPicker";
import { ImageUpload } from "@/components/ImageUpload";
import { STAGES } from "@/data/types";
import { EMPTY_INNOVATOR_FORM, SOLUTION_TYPES } from "@/data/seed";
import type { EvidenceRecord, InnovatorFormValues, PilotOffer, Solution } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { saveSolution } from "@/lib/db";
import { CountryPicker } from "@/components/CountryPicker";
import { cn, listFromText, makeId } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const GROWING_ENVIRONMENT_OPTIONS = [
  "Greenhouse",
  "Open field",
  "Polytunnel",
  "Nursery",
  "Orchard",
  "Vertical farming",
  "Indoor",
  "Aquaculture",
] as const;

const PRICING_MODELS = [
  "Free pilot",
  "Co-funded pilot",
  "Subscription",
  "One-time licence",
  "Pay-per-outcome",
  "To be discussed",
] as const;

const PILOT_TYPES_OPTIONS = [
  "Free pilot",
  "Paid pilot",
  "Co-development",
  "Data partnership",
  "Observational",
] as const;

const SYSTEMS_OPTIONS = [
  "Climate computer", "Scouting rounds", "Sprayer", "GPS guidance", "Field maps",
  "Stable internet", "Basic sensor setup", "Manual scouting", "Camera system",
  "Weather station", "Irrigation system", "ERP / farm management software",
] as const;

const AVAILABLE_DATA_OPTIONS = [
  "Weekly image capture", "Disease observations", "Soil samples", "Control plot",
  "Field boundary data", "Weather data", "Yield records", "Spray logs",
  "Scouting reports", "Lab results",
] as const;

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formToPayload(f: InnovatorFormValues): {
  solution: Solution;
  pilotOffer: PilotOffer;
  evidenceRecord: EvidenceRecord;
} {
  const solutionId = makeId("sol", f.solutionName);
  const solution: Solution = {
    id: solutionId,
    name: f.solutionName || "New solution",
    type: f.solutionType.length > 0 ? f.solutionType.join(" / ") : "AI / Software",
    imageUrl: f.imageUrl || undefined,
    proposition: f.proposition || "Solution ready for validation.",
    stage: f.stage,
    challengeIds: f.challengeIds,
    contexts: f.contexts,
    crops: f.crops,
    requiredSystems: f.requiredSystems,
    requiredData: f.requiredData,
    geography: f.geography,
    lookingFor: listFromText(f.lookingFor),
    website: f.website || undefined,
    contactEmail: f.contactEmail || undefined,
    pricingModel: f.pricingModel.length > 0 ? f.pricingModel.join(", ") : undefined,
  };
  const pilotOffer: PilotOffer = {
    id: makeId("pilot", f.pilotTitle || f.solutionName),
    solutionId,
    title: f.pilotTitle || `${solution.name} pilot`,
    type: f.pilotType,
    status: "Open",
    availability: f.pilotAvailability || "Open for pilot locations",
    duration: f.pilotDuration,
    includes: listFromText(f.pilotIncludes),
    responseTime: f.pilotResponseTime,
    requiredContext: solution.contexts,
    requiredSystems: solution.requiredSystems,
    requiredData: solution.requiredData,
  };
  const evidenceRecord: EvidenceRecord = {
    id: makeId("evidence", f.solutionName),
    solutionId,
    type: f.evidenceType,
    tested: f.evidenceTested || "Evidence not yet specified",
    geography: solution.geography.join(", ") || "Not specified",
    impact: f.evidenceImpact || "Impact to be validated during pilot",
    quality: f.evidenceQuality,
  };
  return { solution, pilotOffer, evidenceRecord };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "sent";

export default function InnovatorPage() {
  const router = useRouter();
  const [form, setForm] = useState<InnovatorFormValues>({ ...EMPTY_INNOVATOR_FORM });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.contactEmail) return;
    setSaveStatus("saving");
    const payload = formToPayload(form);
    localStorage.setItem("openfield-pending-solution", JSON.stringify(payload));

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      // Always save to Supabase (null user_id if not signed in)
      await saveSolution(payload.solution, payload.pilotOffer, payload.evidenceRecord, session?.user?.id);
      if (session?.user) {
        router.push("/");
        return;
      }
      // Not signed in: send magic link
      await supabase.auth.signInWithOtp({
        email: form.contactEmail,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
        },
      });
      setSaveStatus("sent");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6ef]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#fbfaf5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <h1 className="font-logo text-xl font-bold tracking-tight text-slate-950">Aggy</h1>
          <Button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60"
          >
            {saveStatus === "saving" ? "Saving…" : "Create solution"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {saveStatus === "sent" ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <CheckCircle2 size={44} className="text-emerald-700" />
            <h2 className="text-2xl font-semibold text-slate-950">Profile saved.</h2>
            <p className="max-w-sm text-sm text-slate-500">
              Check your inbox at <strong>{form.contactEmail}</strong> to activate your account and access your matches.
            </p>
            <Button onClick={() => router.push("/")} className="mt-2 rounded-xl bg-emerald-800 hover:bg-emerald-900">
              Back to Aggy
            </Button>
          </div>
        ) : (
          <>
            <h2 className="mb-1 text-3xl font-semibold text-slate-950">Add a solution</h2>
            <p className="mb-8 text-sm text-slate-500">
              The better we understand your solution, the better we can match relevant growers.
            </p>

            <div className="space-y-8">
              {/* General */}
              <Section label="General">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Contact email *">
                    <input required type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className={INPUT_CLASS} placeholder="hello@yourcompany.com" />
                  </Field>
                  <Field label="Website (optional)">
                    <input value={form.website} onChange={(e) => set("website", e.target.value)} className={INPUT_CLASS} placeholder="https://yourproduct.com" />
                  </Field>
                </div>
              </Section>

              {/* About your solution */}
              <Section label="About your solution">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Solution name">
                    <input value={form.solutionName} onChange={(e) => set("solutionName", e.target.value)} className={INPUT_CLASS} placeholder="e.g. MildewSense" />
                  </Field>
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-xs font-medium text-slate-600">Solution type (multiple options possible)</span>
                    <ChipMultiSelect options={SOLUTION_TYPES} value={form.solutionType} onChange={(v) => set("solutionType", v)} withOther />
                  </div>
                  <Field label="One-line proposition" full>
                    <input value={form.proposition} onChange={(e) => set("proposition", e.target.value)} className={INPUT_CLASS} placeholder="What problem does it solve, and how?" />
                  </Field>
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-xs font-medium text-slate-600">Challenges addressed</span>
                    <div className="mt-1">
                      <ChallengePicker selectedIds={form.challengeIds} onChange={(ids) => set("challengeIds", ids)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Validation stage</span>
                    <SingleChipSelect options={STAGES} value={form.stage} onChange={(v) => set("stage", v)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Pricing model (multiple options possible)</span>
                    <ChipMultiSelect options={PRICING_MODELS} value={form.pricingModel} onChange={(v) => set("pricingModel", v)} withOther />
                  </div>
                  <Field label="Geography">
                    <CountryPicker value={form.geography} onChange={(v) => set("geography", v)} />
                  </Field>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Growing environment (multiple options possible)</span>
                    <ChipMultiSelect options={GROWING_ENVIRONMENT_OPTIONS} value={form.contexts} onChange={(v) => set("contexts", v)} withOther />
                  </div>
                  <Field label="Looking for (comma-separated)">
                    <input value={form.lookingFor} onChange={(e) => set("lookingFor", e.target.value)} className={INPUT_CLASS} placeholder="Pilot growers, Researchers…" />
                  </Field>
                  <div className="md:col-span-2">
                    <span className="text-xs font-medium text-slate-600">Photo (optional)</span>
                    <div className="mt-1">
                      <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <span className="text-xs font-medium text-slate-600">Relevant crops</span>
                  <CropPicker selectedCrops={form.crops} onChange={(crops) => set("crops", crops)} />
                </div>
              </Section>

              {/* Pilot offer */}
              <Section label="Pilot offer">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Pilot title" full>
                    <input value={form.pilotTitle} onChange={(e) => set("pilotTitle", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse disease detection pilot" />
                  </Field>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Pilot type</span>
                    <SingleChipSelect options={PILOT_TYPES_OPTIONS} value={form.pilotType} onChange={(v) => set("pilotType", v)} />
                  </div>
                  <Field label="Duration">
                    <input value={form.pilotDuration} onChange={(e) => set("pilotDuration", e.target.value)} className={INPUT_CLASS} placeholder="8–12 weeks" />
                  </Field>
                  <Field label="Availability" full>
                    <input value={form.pilotAvailability} onChange={(e) => set("pilotAvailability", e.target.value)} className={INPUT_CLASS} placeholder="3 pilot locations available from March" />
                  </Field>
                  <Field label="What's included (comma-separated)" full>
                    <input value={form.pilotIncludes} onChange={(e) => set("pilotIncludes", e.target.value)} className={INPUT_CLASS} placeholder="Sensor kit, Platform access, Weekly review…" />
                  </Field>
                  <Field label="Response time">
                    <input value={form.pilotResponseTime} onChange={(e) => set("pilotResponseTime", e.target.value)} className={INPUT_CLASS} placeholder="Reply within 3 working days" />
                  </Field>
                  <Field label="Systems required">
                    <ChipMultiSelect options={SYSTEMS_OPTIONS} value={form.requiredSystems} onChange={(v) => set("requiredSystems", v)} withOther />
                  </Field>
                  <Field label="Data required">
                    <ChipMultiSelect options={AVAILABLE_DATA_OPTIONS} value={form.requiredData} onChange={(v) => set("requiredData", v)} withOther />
                  </Field>
                </div>
              </Section>

              {/* Evidence */}
              <Section label="Evidence">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Evidence type">
                    <input value={form.evidenceType} onChange={(e) => set("evidenceType", e.target.value)} className={INPUT_CLASS} placeholder="Field trial, Plot trial, Production use…" />
                  </Field>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Evidence quality</span>
                    <SingleChipSelect options={["Early", "Medium", "High"] as const} value={form.evidenceQuality} onChange={(v) => set("evidenceQuality", v)} />
                  </div>
                  <Field label="Tested on">
                    <input value={form.evidenceTested} onChange={(e) => set("evidenceTested", e.target.value)} className={INPUT_CLASS} placeholder="2 pilots, 4 demo plots…" />
                  </Field>
                  <Field label="Observed impact">
                    <input value={form.evidenceImpact} onChange={(e) => set("evidenceImpact", e.target.value)} className={INPUT_CLASS} placeholder="Earlier detection, lower input use…" />
                  </Field>
                </div>
              </Section>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/")} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveStatus === "saving"} className="rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60">
                {saveStatus === "saving" ? "Saving…" : "Create solution"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Chip selectors ───────────────────────────────────────────────────────────

function SingleChipSelect({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            value === opt
              ? "border-emerald-700 bg-emerald-50 text-emerald-900"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ChipMultiSelect({
  options,
  value,
  onChange,
  withOther = false,
}: {
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  withOther?: boolean;
}) {
  const knownSet = new Set(options);
  const otherValues = value.filter((v) => !knownSet.has(v));
  const [otherText, setOtherText] = useState(otherValues.join(", "));

  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }

  function applyOther(text: string) {
    const extra = text.split(",").map((s) => s.trim()).filter(Boolean);
    const known = value.filter((v) => knownSet.has(v));
    onChange([...known, ...extra]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              value.includes(opt)
                ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {withOther && (
        <input
          value={otherText}
          onChange={(e) => {
            setOtherText(e.target.value);
            applyOther(e.target.value);
          }}
          className={cn(INPUT_CLASS, "text-xs")}
          placeholder="+ Other (comma-separated)"
        />
      )}
    </div>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-slate-950">{label}</h3>
      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  full = false,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block space-y-1${full ? " md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
