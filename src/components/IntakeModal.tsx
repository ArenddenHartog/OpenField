"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengePicker } from "@/components/ChallengePicker";
import { CropPicker } from "@/components/CropPicker";
import { STAGES, GROWER_ROLES } from "@/data/types";
import { EMPTY_GROWER_FORM, EMPTY_INNOVATOR_FORM, SOLUTION_TYPES } from "@/data/seed";
import type {
  EvidenceRecord,
  Grower,
  GrowerFormValues,
  GrowerRole,
  InnovatorFormValues,
  PilotOffer,
  Solution,
} from "@/data/types";
import { ImageUpload } from "@/components/ImageUpload";
import { cn, listFromText, makeId } from "@/lib/utils";

const COUNTRIES = ["NL", "BE", "DE", "FR", "DK", "ES", "PL", "UK", "IE", "IT", "PT", "Global"];

type Role = "innovator" | "grower";

interface IntakeModalProps {
  role: Role;
  presetGrowerRole?: GrowerRole;
  onClose: () => void;
  onCreateSolution: (payload: {
    solution: Solution;
    pilotOffer: PilotOffer;
    evidenceRecord: EvidenceRecord;
  }) => void;
  onCreateGrower: (grower: Grower) => void;
}

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700";

export function IntakeModal({
  role,
  presetGrowerRole,
  onClose,
  onCreateSolution,
  onCreateGrower,
}: IntakeModalProps) {
  const isInnovator = role === "innovator";
  const [form, setForm] = useState<InnovatorFormValues | GrowerFormValues>(
    isInnovator
      ? EMPTY_INNOVATOR_FORM
      : presetGrowerRole
        ? { ...EMPTY_GROWER_FORM, role: presetGrowerRole }
        : EMPTY_GROWER_FORM
  );

  function setField(key: string, value: unknown) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isInnovator) {
      const f = form as InnovatorFormValues;
      const solutionId = makeId("sol", f.solutionName);
      const solution: Solution = {
        id: solutionId,
        name: f.solutionName || "New solution",
        type: f.solutionType,
        imageUrl: f.imageUrl || undefined,
        proposition: f.proposition || "Solution ready for validation.",
        stage: f.stage,
        challengeIds: f.challengeIds,
        contexts: listFromText(f.contexts),
        crops: f.crops,
        requiredSystems: listFromText(f.requiredSystems),
        requiredData: listFromText(f.requiredData),
        geography: listFromText(f.geography),
        lookingFor: listFromText(f.lookingFor),
        website: f.website || undefined,
        contactEmail: f.contactEmail || undefined,
        pricingModel: f.pricingModel || undefined,
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
      onCreateSolution({ solution, pilotOffer, evidenceRecord });
      return;
    }

    const f = form as GrowerFormValues;
    const grower: Grower = {
      id: makeId("grower", f.name || f.operation),
      name: f.name || "New grower",
      role: f.role,
      imageUrl: f.imageUrl || undefined,
      region: f.region || "Region not specified",
      countries: f.countries.length > 0 ? f.countries : ["NL"],
      operation: f.operation || "Agricultural operation",
      contexts: listFromText(f.contexts),
      crops: f.crops,
      openness: f.openness,
      challengeIds: f.challengeIds,
      constraints: listFromText(f.constraints),
      systems: listFromText(f.systems),
      availableData: listFromText(f.availableData),
      pilotTypes: listFromText(f.pilotTypes),
      website: f.website || undefined,
      contactEmail: f.contactEmail || undefined,
      operationScale: f.operationScale || undefined,
      certifications: f.certifications ? listFromText(f.certifications) : undefined,
      preferredPilotSeason: f.preferredPilotSeason || undefined,
    };
    onCreateGrower(grower);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="scrollbar-thin max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {isInnovator ? "Add a solution" : "Create profile"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              More details means better recommendations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
            aria-label="Close intake modal"
          >
            <X size={18} />
          </button>
        </div>

        {isInnovator ? (
          <InnovatorFields form={form as InnovatorFormValues} onChange={setField} />
        ) : (
          <GrowerFields form={form as GrowerFormValues} onChange={setField} />
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl bg-emerald-800 hover:bg-emerald-900">
            {isInnovator ? "Create solution" : "Create profile"}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}

// ─── Sub-forms ────────────────────────────────────────────────────────────────

const PRICING_MODELS = [
  "Free pilot",
  "Co-funded pilot",
  "Subscription",
  "One-time licence",
  "Pay-per-outcome",
  "To be discussed",
] as const;

const PILOT_SEASONS = ["Spring", "Summer", "Autumn", "Winter", "Year-round"] as const;

function InnovatorFields({
  form,
  onChange,
}: {
  form: InnovatorFormValues;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <Section label="About your solution">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Solution name">
            <input value={form.solutionName} onChange={(e) => onChange("solutionName", e.target.value)} className={INPUT_CLASS} placeholder="e.g. MildewSense" />
          </Field>
          <Field label="Solution type">
            <select value={form.solutionType} onChange={(e) => onChange("solutionType", e.target.value)} className={INPUT_CLASS}>
              {SOLUTION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="One-line proposition" full>
            <input value={form.proposition} onChange={(e) => onChange("proposition", e.target.value)} className={INPUT_CLASS} placeholder="What problem does it solve, and how?" />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Challenges addressed (multiple options possible)</span>
            <ChallengePicker selectedIds={form.challengeIds} onChange={(ids) => onChange("challengeIds", ids)} />
          </div>
          <Field label="Validation stage">
            <select value={form.stage} onChange={(e) => onChange("stage", e.target.value)} className={INPUT_CLASS}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Pricing model">
            <select value={form.pricingModel} onChange={(e) => onChange("pricingModel", e.target.value)} className={INPUT_CLASS}>
              <option value="">Select…</option>
              {PRICING_MODELS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Geography (comma-separated)">
            <input value={form.geography} onChange={(e) => onChange("geography", e.target.value)} className={INPUT_CLASS} placeholder="NL, BE, DE" />
          </Field>
          <Field label="Operational contexts (comma-separated)">
            <input value={form.contexts} onChange={(e) => onChange("contexts", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse, Open field" />
          </Field>
          <Field label="Looking for (comma-separated)">
            <input value={form.lookingFor} onChange={(e) => onChange("lookingFor", e.target.value)} className={INPUT_CLASS} placeholder="Pilot growers, Researchers…" />
          </Field>
          <Field label="Website (optional)">
            <input value={form.website} onChange={(e) => onChange("website", e.target.value)} className={INPUT_CLASS} placeholder="https://yourproduct.com" />
          </Field>
          <Field label="Contact email" full>
            <input type="email" value={form.contactEmail} onChange={(e) => onChange("contactEmail", e.target.value)} className={INPUT_CLASS} placeholder="hello@yourcompany.com" />
          </Field>
          <div className="md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Photo (optional)</span>
            <div className="mt-1">
              <ImageUpload value={form.imageUrl} onChange={(url) => onChange("imageUrl", url)} />
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <span className="text-xs font-medium text-slate-600">Relevant crops</span>
          <CropPicker selectedCrops={form.crops} onChange={(crops) => onChange("crops", crops)} />
        </div>
      </Section>

      <Section label="Pilot offer">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Pilot title" full>
            <input value={form.pilotTitle} onChange={(e) => onChange("pilotTitle", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse disease detection pilot" />
          </Field>
          <Field label="Pilot type">
            <input value={form.pilotType} onChange={(e) => onChange("pilotType", e.target.value)} className={INPUT_CLASS} placeholder="Free pilot, Paid pilot…" />
          </Field>
          <Field label="Duration">
            <input value={form.pilotDuration} onChange={(e) => onChange("pilotDuration", e.target.value)} className={INPUT_CLASS} placeholder="8–12 weeks" />
          </Field>
          <Field label="Availability" full>
            <input value={form.pilotAvailability} onChange={(e) => onChange("pilotAvailability", e.target.value)} className={INPUT_CLASS} placeholder="3 pilot locations available from March" />
          </Field>
          <Field label="What's included (comma-separated)" full>
            <input value={form.pilotIncludes} onChange={(e) => onChange("pilotIncludes", e.target.value)} className={INPUT_CLASS} placeholder="Sensor kit, Platform access, Weekly review…" />
          </Field>
          <Field label="Response time">
            <input value={form.pilotResponseTime} onChange={(e) => onChange("pilotResponseTime", e.target.value)} className={INPUT_CLASS} placeholder="Reply within 3 working days" />
          </Field>
          <Field label="Systems required (comma-separated)">
            <input value={form.requiredSystems} onChange={(e) => onChange("requiredSystems", e.target.value)} className={INPUT_CLASS} placeholder="Stable internet, Sprayer…" />
          </Field>
          <Field label="Data required (comma-separated)">
            <input value={form.requiredData} onChange={(e) => onChange("requiredData", e.target.value)} className={INPUT_CLASS} placeholder="Disease observations, Soil samples…" />
          </Field>
        </div>
      </Section>

      <Section label="Evidence">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Evidence type">
            <input value={form.evidenceType} onChange={(e) => onChange("evidenceType", e.target.value)} className={INPUT_CLASS} placeholder="Field trial, Plot trial, Production use…" />
          </Field>
          <Field label="Evidence quality">
            <select value={form.evidenceQuality} onChange={(e) => onChange("evidenceQuality", e.target.value)} className={INPUT_CLASS}>
              {(["Early", "Medium", "High"] as const).map((q) => <option key={q}>{q}</option>)}
            </select>
          </Field>
          <Field label="Tested on">
            <input value={form.evidenceTested} onChange={(e) => onChange("evidenceTested", e.target.value)} className={INPUT_CLASS} placeholder="2 pilots, 4 demo plots…" />
          </Field>
          <Field label="Observed impact">
            <input value={form.evidenceImpact} onChange={(e) => onChange("evidenceImpact", e.target.value)} className={INPUT_CLASS} placeholder="Earlier detection, lower input use…" />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function GrowerFields({
  form,
  onChange,
}: {
  form: GrowerFormValues;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <Section label="About you">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name or organisation">
            <input value={form.name} onChange={(e) => onChange("name", e.target.value)} className={INPUT_CLASS} placeholder="e.g. Jan de Vries / Wageningen UR" />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => onChange("role", e.target.value)} className={INPUT_CLASS}>
              {GROWER_ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Operation description">
            <input value={form.operation} onChange={(e) => onChange("operation", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse vegetables, Research institute…" />
          </Field>
          <Field label="Scale">
            <input value={form.operationScale} onChange={(e) => onChange("operationScale", e.target.value)} className={INPUT_CLASS} placeholder="e.g. 4 ha greenhouse, 120 ha arable" />
          </Field>
          <Field label="Region">
            <input value={form.region} onChange={(e) => onChange("region", e.target.value)} className={INPUT_CLASS} placeholder="Westland, NL" />
          </Field>
          <Field label="Openness to pilots">
            <select value={form.openness} onChange={(e) => onChange("openness", e.target.value)} className={INPUT_CLASS}>
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
                    const current = form.countries;
                    onChange("countries", current.includes(c) ? current.filter((x) => x !== c) : [...current, c]);
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
            <input type="email" value={form.contactEmail} onChange={(e) => onChange("contactEmail", e.target.value)} className={INPUT_CLASS} placeholder="you@operation.com" />
          </Field>
          <Field label="Website (optional)">
            <input value={form.website} onChange={(e) => onChange("website", e.target.value)} className={INPUT_CLASS} placeholder="https://yourfarm.com" />
          </Field>
          <Field label="Certifications (optional, comma-separated)">
            <input value={form.certifications} onChange={(e) => onChange("certifications", e.target.value)} className={INPUT_CLASS} placeholder="GlobalG.A.P., Organic, MPS…" />
          </Field>
          <div className="md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Photo (optional)</span>
            <div className="mt-1">
              <ImageUpload value={form.imageUrl} onChange={(url) => onChange("imageUrl", url)} />
            </div>
          </div>
        </div>
      </Section>

      <Section label="Your operation">
        <div className="space-y-3 mb-4">
          <div>
            <span className="text-xs font-medium text-slate-600">Current challenges</span>
            <div className="mt-2">
              <ChallengePicker selectedIds={form.challengeIds} onChange={(ids) => onChange("challengeIds", ids)} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-600">Crops</span>
            <div className="mt-2">
              <CropPicker selectedCrops={form.crops} onChange={(crops) => onChange("crops", crops)} />
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Operational contexts (comma-separated)">
            <input value={form.contexts} onChange={(e) => onChange("contexts", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse, Open field" />
          </Field>
          <Field label="Preferred pilot season">
            <select value={form.preferredPilotSeason} onChange={(e) => onChange("preferredPilotSeason", e.target.value)} className={INPUT_CLASS}>
              <option value="">Select…</option>
              {PILOT_SEASONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Pilot types accepted">
            <input value={form.pilotTypes} onChange={(e) => onChange("pilotTypes", e.target.value)} className={INPUT_CLASS} placeholder="Free pilot, Paid pilot, Co-development…" />
          </Field>
          <Field label="Existing systems (comma-separated)">
            <input value={form.systems} onChange={(e) => onChange("systems", e.target.value)} className={INPUT_CLASS} placeholder="Climate computer, Scouting rounds…" />
          </Field>
          <Field label="Available data (comma-separated)">
            <input value={form.availableData} onChange={(e) => onChange("availableData", e.target.value)} className={INPUT_CLASS} placeholder="Disease records, Soil samples…" />
          </Field>
          <Field label="Pilot constraints (comma-separated)">
            <input value={form.constraints} onChange={(e) => onChange("constraints", e.target.value)} className={INPUT_CLASS} placeholder="Low disruption, Seasonal window…" />
          </Field>
        </div>
      </Section>
    </div>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </h3>
      <div className="rounded-2xl border border-slate-100 p-4">
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
