"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengePicker } from "@/components/ChallengePicker";
import { CropPicker } from "@/components/CropPicker";
import { CountryPicker } from "@/components/CountryPicker";
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
import { useFocusTrap } from "@/lib/useFocusTrap";

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
  const containerRef = useFocusTrap<HTMLFormElement>(onClose);
  const [form, setForm] = useState<InnovatorFormValues | GrowerFormValues>(
    isInnovator
      ? EMPTY_INNOVATOR_FORM
      : presetGrowerRole
        ? { ...EMPTY_GROWER_FORM, role: presetGrowerRole ? [presetGrowerRole] : [] }
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
      onCreateSolution({ solution, pilotOffer, evidenceRecord });
      return;
    }

    const f = form as GrowerFormValues;
    const grower: Grower = {
      id: makeId("grower", f.name || f.operation),
      name: f.name || "New grower",
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
    onCreateGrower(grower);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.form
        ref={containerRef}
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
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Solution type (multiple options possible)</span>
            <ChipMultiSelect options={SOLUTION_TYPES} value={form.solutionType} onChange={(v) => onChange("solutionType", v)} withOther />
          </div>
          <Field label="One-line proposition" full>
            <input value={form.proposition} onChange={(e) => onChange("proposition", e.target.value)} className={INPUT_CLASS} placeholder="What problem does it solve, and how?" />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Challenges addressed (multiple options possible)</span>
            <ChallengePicker selectedIds={form.challengeIds} onChange={(ids) => onChange("challengeIds", ids)} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Validation stage</span>
            <SingleChipSelect options={STAGES} value={form.stage} onChange={(v) => onChange("stage", v)} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Pricing model (multiple options possible)</span>
            <ChipMultiSelect options={PRICING_MODELS} value={form.pricingModel} onChange={(v) => onChange("pricingModel", v)} withOther />
          </div>
          <Field label="Geography">
            <CountryPicker value={form.geography} onChange={(v) => onChange("geography", v)} />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Growing environment (multiple options possible)</span>
            <ChipMultiSelect options={GROWING_ENVIRONMENT_OPTIONS} value={form.contexts} onChange={(v) => onChange("contexts", v)} withOther />
          </div>
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
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Pilot type</span>
            <SingleChipSelect options={["Free pilot", "Paid pilot", "Co-development", "Data partnership", "Observational"] as const} value={form.pilotType} onChange={(v) => onChange("pilotType", v)} />
          </div>
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
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Systems required</span>
            <ChipMultiSelect options={SYSTEMS_OPTIONS} value={form.requiredSystems} onChange={(v) => onChange("requiredSystems", v)} withOther />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Data required</span>
            <ChipMultiSelect options={AVAILABLE_DATA_OPTIONS} value={form.requiredData} onChange={(v) => onChange("requiredData", v)} withOther />
          </div>
        </div>
      </Section>

      <Section label="Evidence">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Evidence type">
            <input value={form.evidenceType} onChange={(e) => onChange("evidenceType", e.target.value)} className={INPUT_CLASS} placeholder="Field trial, Plot trial, Production use…" />
          </Field>
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Evidence quality</span>
            <SingleChipSelect options={["Early", "Medium", "High"] as const} value={form.evidenceQuality} onChange={(v) => onChange("evidenceQuality", v)} />
          </div>
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
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Role (multiple options possible)</span>
            <ChipMultiSelect options={GROWER_ROLES} value={form.role} onChange={(v) => onChange("role", v)} />
          </div>
          <Field label="Operation description">
            <input value={form.operation} onChange={(e) => onChange("operation", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse vegetables, Research institute…" />
          </Field>
          <Field label="Scale">
            <input value={form.operationScale} onChange={(e) => onChange("operationScale", e.target.value)} className={INPUT_CLASS} placeholder="e.g. 4 ha greenhouse, 120 ha arable" />
          </Field>
          <Field label="Region">
            <input value={form.region} onChange={(e) => onChange("region", e.target.value)} className={INPUT_CLASS} placeholder="Westland, NL" />
          </Field>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Openness to pilots (multiple options possible)</span>
            <ChipMultiSelect options={["Open to pilots", "Active innovation partner", "Exploratory only"] as const} value={form.openness} onChange={(v) => onChange("openness", v)} />
          </div>
          <div className="block space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Countries active in</span>
            <CountryPicker value={form.countries} onChange={(v) => onChange("countries", v)} />
          </div>
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
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Growing environment (multiple options possible)</span>
            <ChipMultiSelect options={GROWING_ENVIRONMENT_OPTIONS} value={form.contexts} onChange={(v) => onChange("contexts", v)} withOther />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-600">Preferred pilot season (multiple options possible)</span>
            <ChipMultiSelect options={PILOT_SEASONS} value={form.preferredPilotSeason} onChange={(v) => onChange("preferredPilotSeason", v)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Pilot types accepted (multiple options possible)</span>
            <ChipMultiSelect options={PILOT_TYPES_OPTIONS} value={form.pilotTypes} onChange={(v) => onChange("pilotTypes", v)} withOther />
          </div>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Pilot constraints (multiple options possible)</span>
            <ChipMultiSelect options={PILOT_CONSTRAINTS_OPTIONS} value={form.constraints} onChange={(v) => onChange("constraints", v)} withOther />
          </div>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Existing systems (multiple options possible)</span>
            <ChipMultiSelect options={SYSTEMS_OPTIONS} value={form.systems} onChange={(v) => onChange("systems", v)} withOther />
          </div>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Available data (multiple options possible)</span>
            <ChipMultiSelect options={AVAILABLE_DATA_OPTIONS} value={form.availableData} onChange={(v) => onChange("availableData", v)} withOther />
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Chip multi-select ────────────────────────────────────────────────────────

const PILOT_TYPES_OPTIONS = [
  "Free pilot",
  "Paid pilot",
  "Co-development",
  "Data partnership",
  "Observational",
] as const;

const PILOT_CONSTRAINTS_OPTIONS = [
  "Low disruption",
  "Seasonal windows",
  "Weather dependent",
  "Limited extra labour",
  "Data privacy important",
  "Practical setup only",
  "No chemical changes",
  "Certified operation restrictions",
] as const;

const SYSTEMS_OPTIONS = [
  "Climate computer",
  "Scouting rounds",
  "Sprayer",
  "GPS guidance",
  "Field maps",
  "Stable internet",
  "Basic sensor setup",
  "Manual scouting",
  "Camera system",
  "Weather station",
  "Irrigation system",
  "ERP / farm management software",
] as const;

const AVAILABLE_DATA_OPTIONS = [
  "Weekly image capture",
  "Disease observations",
  "Soil samples",
  "Control plot",
  "Field boundary data",
  "Weather data",
  "Yield records",
  "Spray logs",
  "Scouting reports",
  "Lab results",
] as const;

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
          className={INPUT_CLASS}
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
