"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengePicker } from "@/components/ChallengePicker";
import { CropPicker } from "@/components/CropPicker";
import { ImageUpload } from "@/components/ImageUpload";
import { GROWER_ROLES } from "@/data/types";
import { EMPTY_GROWER_FORM } from "@/data/seed";
import type { Grower, GrowerFormValues } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { saveGrowerProfile } from "@/lib/db";
import { CountryPicker } from "@/components/CountryPicker";
import { cn, isValidEmail, listFromText, makeId } from "@/lib/utils";

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

const PILOT_TYPES_OPTIONS = [
  "Free pilot", "Paid pilot", "Co-development", "Data partnership", "Observational",
] as const;

const PILOT_CONSTRAINTS_OPTIONS = [
  "Low disruption", "Seasonal windows", "Weather dependent", "Limited extra labour",
  "Data privacy important", "Practical setup only", "No chemical changes",
  "Certified operation restrictions",
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

const PILOT_SEASONS = ["Spring", "Summer", "Autumn", "Winter", "Year-round", "Flexible"] as const;

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function growerToForm(g: Grower): GrowerFormValues {
  return {
    name: g.name,
    role: g.role ? g.role.split(" / ").filter(Boolean) : [],
    imageUrl: g.imageUrl ?? "",
    operation: g.operation,
    region: g.region,
    countries: g.countries,
    contexts: g.contexts,
    crops: g.crops,
    openness: g.openness ? g.openness.split(" / ").filter(Boolean) : [],
    challengeIds: g.challengeIds,
    constraints: g.constraints,
    systems: g.systems,
    availableData: g.availableData,
    pilotTypes: g.pilotTypes,
    website: g.website ?? "",
    contactEmail: g.contactEmail ?? "",
    operationScale: g.operationScale ?? "",
    certifications: g.certifications?.join(", ") ?? "",
    preferredPilotSeason: g.preferredPilotSeason ? g.preferredPilotSeason.split(", ").filter(Boolean) : [],
  };
}

function formToGrower(f: GrowerFormValues, existingId?: string): Grower {
  return {
    id: existingId ?? makeId("grower", f.name || f.operation),
    name: f.name || "My profile",
    role: f.role.join(" / ") || "Grower",
    imageUrl: f.imageUrl || undefined,
    region: f.region || "Region not specified",
    countries: f.countries.length > 0 ? f.countries : ["NL"],
    operation: f.operation || "Agricultural operation",
    contexts: f.contexts,
    crops: f.crops,
    openness: f.openness.join(" / ") || "Open to pilots",
    challengeIds: f.challengeIds,
    constraints: f.constraints,
    systems: f.systems,
    availableData: f.availableData,
    pilotTypes: f.pilotTypes,
    website: f.website || undefined,
    contactEmail: f.contactEmail || undefined,
    operationScale: f.operationScale || undefined,
    certifications: f.certifications ? listFromText(f.certifications) : undefined,
    preferredPilotSeason: f.preferredPilotSeason.length > 0 ? f.preferredPilotSeason.join(", ") : undefined,
  };
}

// ─── Chip multi-select ────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "sent" | "error";

export default function ProfilePage() {
  const router = useRouter();
  const [existingId, setExistingId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<GrowerFormValues>({ ...EMPTY_GROWER_FORM });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("openfield-grower");
      if (stored) {
        const g = JSON.parse(stored) as Grower;
        setExistingId(g.id);
        setForm(growerToForm(g));
      }
    } catch {}
  }, []);

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.contactEmail) return;
    if (!isValidEmail(form.contactEmail)) {
      setErrorMessage("Enter a valid contact email address.");
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    const grower = formToGrower(form, existingId);

    if (!supabase) {
      localStorage.setItem("openfield-grower", JSON.stringify(grower));
      router.push("/");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await saveGrowerProfile(grower, session.user.id);
        localStorage.setItem("openfield-grower", JSON.stringify(grower));
        router.push("/");
        return;
      }
      // Not signed in: save to DB anonymously + send magic link
      await saveGrowerProfile(grower, null);
      localStorage.setItem("openfield-grower", JSON.stringify(grower));
      const { error } = await supabase.auth.signInWithOtp({
        email: form.contactEmail,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSaveStatus("sent");
    } catch (err) {
      Sentry.captureException(err, { tags: { op: "ProfilePage.handleSave" } });
      setErrorMessage("Something went wrong while saving your profile. Please try again.");
      setSaveStatus("error");
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
            {saveStatus === "saving" ? "Saving…" : existingId ? "Save changes" : "Create profile"}
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
            <h2 className="mb-1 text-3xl font-semibold text-slate-950">{existingId ? "Edit profile" : "Create profile"}</h2>
            <p className="mb-8 text-sm text-slate-500">
              {existingId ? "Update your operational profile. This drives which innovations are most relevant for you." : "The better we understand your operation, the better we can match relevant innovations."}
            </p>

            <div className="space-y-8">
              {/* General */}
              <Section label="General">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name or organisation">
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT_CLASS} placeholder="e.g. Jan de Vries / Wageningen UR" />
                  </Field>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Role (multiple options possible)</span>
                    <ChipMultiSelect options={GROWER_ROLES} value={form.role} onChange={(v) => set("role", v)} />
                  </div>
                  <Field label="Region">
                    <input value={form.region} onChange={(e) => set("region", e.target.value)} className={INPUT_CLASS} placeholder="Westland, NL" />
                  </Field>
                  <Field label="Countries active in" full>
                    <CountryPicker value={form.countries} onChange={(v) => set("countries", v)} />
                  </Field>
                  <Field label="Contact email *">
                    <input required type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className={INPUT_CLASS} placeholder="you@operation.com" />
                  </Field>
                  <Field label="Website (optional)">
                    <input value={form.website} onChange={(e) => set("website", e.target.value)} className={INPUT_CLASS} placeholder="https://yourfarm.com" />
                  </Field>
                  <div className="md:col-span-2">
                    <span className="text-xs font-medium text-slate-600">Photo (optional)</span>
                    <div className="mt-1">
                      <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
                    </div>
                  </div>
                </div>
              </Section>

              {/* Your operation */}
              <Section label="Your operation">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Operation description" full>
                      <input value={form.operation} onChange={(e) => set("operation", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse vegetables, Tree nursery…" />
                    </Field>
                    <Field label="Scale">
                      <input value={form.operationScale} onChange={(e) => set("operationScale", e.target.value)} className={INPUT_CLASS} placeholder="e.g. 4 ha greenhouse, 120 ha arable" />
                    </Field>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Openness to pilots (multiple options possible)</span>
                      <ChipMultiSelect options={["Open to pilots", "Active innovation partner", "Exploratory only"] as const} value={form.openness} onChange={(v) => set("openness", v)} />
                    </div>
                    <Field label="Certifications (optional, comma-separated)">
                      <input value={form.certifications} onChange={(e) => set("certifications", e.target.value)} className={INPUT_CLASS} placeholder="GlobalG.A.P., Organic, MPS…" />
                    </Field>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600">Current challenges</span>
                    <div className="mt-2">
                      <ChallengePicker selectedIds={form.challengeIds} onChange={(ids) => set("challengeIds", ids)} />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600">Crops</span>
                    <div className="mt-2">
                      <CropPicker selectedCrops={form.crops} onChange={(crops) => set("crops", crops)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium text-slate-600">Growing environment (multiple options possible)</span>
                      <ChipMultiSelect options={GROWING_ENVIRONMENT_OPTIONS} value={form.contexts} onChange={(v) => set("contexts", v)} withOther />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-slate-600">Preferred pilot season (multiple options possible)</span>
                      <ChipMultiSelect options={PILOT_SEASONS} value={form.preferredPilotSeason} onChange={(v) => set("preferredPilotSeason", v)} />
                    </div>
                  </div>
                </div>
              </Section>

              {/* What you bring */}
              <Section label="What you bring">
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-medium text-slate-600">Pilot types accepted</span>
                    <div className="mt-2">
                      <ChipMultiSelect options={PILOT_TYPES_OPTIONS} value={form.pilotTypes} onChange={(v) => set("pilotTypes", v)} withOther />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600">Pilot constraints</span>
                    <div className="mt-2">
                      <ChipMultiSelect options={PILOT_CONSTRAINTS_OPTIONS} value={form.constraints} onChange={(v) => set("constraints", v)} withOther />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600">Existing systems</span>
                    <div className="mt-2">
                      <ChipMultiSelect options={SYSTEMS_OPTIONS} value={form.systems} onChange={(v) => set("systems", v)} withOther />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-600">Available data</span>
                    <div className="mt-2">
                      <ChipMultiSelect options={AVAILABLE_DATA_OPTIONS} value={form.availableData} onChange={(v) => set("availableData", v)} withOther />
                    </div>
                  </div>
                </div>
              </Section>
            </div>

            {saveStatus === "error" && (
              <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/")} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveStatus === "saving"} className="rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60">
                {saveStatus === "saving" ? "Saving…" : existingId ? "Save changes" : "Create profile"}
              </Button>
            </div>
          </>
        )}
      </main>
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
