"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengePicker } from "@/components/ChallengePicker";
import { CropPicker } from "@/components/CropPicker";
import { ImageUpload } from "@/components/ImageUpload";
import { GROWER_ROLES } from "@/data/types";
import { EMPTY_GROWER_FORM } from "@/data/seed";
import type { Grower, GrowerFormValues, GrowerRole } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { saveGrowerProfile } from "@/lib/db";
import { cn, listFromText, makeId } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTRIES = ["NL", "BE", "DE", "FR", "DK", "ES", "PL", "UK", "IE", "IT", "PT", "Global"];

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
    role: g.role,
    imageUrl: g.imageUrl ?? "",
    operation: g.operation,
    region: g.region,
    countries: g.countries,
    contexts: g.contexts.join(", "),
    crops: g.crops,
    openness: g.openness,
    challengeIds: g.challengeIds,
    constraints: g.constraints,
    systems: g.systems,
    availableData: g.availableData,
    pilotTypes: g.pilotTypes,
    website: g.website ?? "",
    contactEmail: g.contactEmail ?? "",
    operationScale: g.operationScale ?? "",
    certifications: g.certifications?.join(", ") ?? "",
    preferredPilotSeason: g.preferredPilotSeason ?? "",
  };
}

function formToGrower(f: GrowerFormValues, existingId?: string): Grower {
  return {
    id: existingId ?? makeId("grower", f.name || f.operation),
    name: f.name || "My profile",
    role: f.role,
    imageUrl: f.imageUrl || undefined,
    region: f.region || "Region not specified",
    countries: f.countries.length > 0 ? f.countries : ["NL"],
    operation: f.operation || "Agricultural operation",
    contexts: listFromText(f.contexts),
    crops: f.crops,
    openness: f.openness,
    challengeIds: f.challengeIds,
    constraints: f.constraints,
    systems: f.systems,
    availableData: f.availableData,
    pilotTypes: f.pilotTypes,
    website: f.website || undefined,
    contactEmail: f.contactEmail || undefined,
    operationScale: f.operationScale || undefined,
    certifications: f.certifications ? listFromText(f.certifications) : undefined,
    preferredPilotSeason: f.preferredPilotSeason || undefined,
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
        <button
          type="button"
          className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-400 hover:border-slate-400"
          onClick={() => {
            const newText = otherText ? "" : "";
            setOtherText(newText);
          }}
        >
          + Other
        </button>
      )}
      {withOther && (
        <input
          value={otherText}
          onChange={(e) => {
            setOtherText(e.target.value);
            applyOther(e.target.value);
          }}
          className={cn(INPUT_CLASS, "text-xs")}
          placeholder="Type other values, comma-separated"
        />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [existingId, setExistingId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<GrowerFormValues>({ ...EMPTY_GROWER_FORM });
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    const grower = formToGrower(form, existingId);
    localStorage.setItem("openfield-grower", JSON.stringify(grower));

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await saveGrowerProfile(grower, session.user.id);
      }
    }

    setSaving(false);
    router.push("/");
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
            disabled={saving}
            className="rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Aggy profile
        </p>
        <h2 className="mb-1 text-3xl font-semibold text-slate-950">Edit profile</h2>
        <p className="mb-8 text-sm text-slate-500">
          Update your operational profile. This drives which innovations are most relevant for you.
        </p>

        <div className="space-y-8">
          {/* About you */}
          <Section label="About you">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name or organisation">
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT_CLASS} placeholder="e.g. Jan de Vries / Wageningen UR" />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={(e) => set("role", e.target.value as GrowerRole)} className={INPUT_CLASS}>
                  {GROWER_ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Operation description">
                <input value={form.operation} onChange={(e) => set("operation", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse vegetables, Tree nursery…" />
              </Field>
              <Field label="Scale">
                <input value={form.operationScale} onChange={(e) => set("operationScale", e.target.value)} className={INPUT_CLASS} placeholder="e.g. 4 ha greenhouse, 120 ha arable" />
              </Field>
              <Field label="Region">
                <input value={form.region} onChange={(e) => set("region", e.target.value)} className={INPUT_CLASS} placeholder="Westland, NL" />
              </Field>
              <Field label="Openness to pilots">
                <select value={form.openness} onChange={(e) => set("openness", e.target.value)} className={INPUT_CLASS}>
                  {["Open to pilots", "Active innovation partner", "Exploratory only"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <label className="block space-y-1 md:col-span-2">
                <span className="text-xs font-medium text-slate-600">Countries active in</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        const curr = form.countries;
                        set("countries", curr.includes(c) ? curr.filter((x) => x !== c) : [...curr, c]);
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        form.countries.includes(c)
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </label>
              <Field label="Contact email">
                <input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className={INPUT_CLASS} placeholder="you@operation.com" />
              </Field>
              <Field label="Website (optional)">
                <input value={form.website} onChange={(e) => set("website", e.target.value)} className={INPUT_CLASS} placeholder="https://yourfarm.com" />
              </Field>
              <Field label="Certifications (optional, comma-separated)" full>
                <input value={form.certifications} onChange={(e) => set("certifications", e.target.value)} className={INPUT_CLASS} placeholder="GlobalG.A.P., Organic, MPS…" />
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
                <Field label="Operational contexts (comma-separated)" full>
                  <input value={form.contexts} onChange={(e) => set("contexts", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse, Open field" />
                </Field>
                <Field label="Preferred pilot season">
                  <select value={form.preferredPilotSeason} onChange={(e) => set("preferredPilotSeason", e.target.value)} className={INPUT_CLASS}>
                    <option value="">Select…</option>
                    {PILOT_SEASONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          </Section>

          {/* What you bring */}
          <Section label="What you bring">
            <div className="space-y-5">
              <div>
                <span className="text-xs font-medium text-slate-600">Pilot types accepted</span>
                <div className="mt-2">
                  <ChipMultiSelect options={PILOT_TYPES_OPTIONS} value={form.pilotTypes} onChange={(v) => set("pilotTypes", v)} />
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-600">Pilot constraints</span>
                <div className="mt-2">
                  <ChipMultiSelect options={PILOT_CONSTRAINTS_OPTIONS} value={form.constraints} onChange={(v) => set("constraints", v)} />
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

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/")} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
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
