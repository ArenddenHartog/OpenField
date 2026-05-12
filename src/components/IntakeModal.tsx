"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChallengePicker } from "@/components/ChallengePicker";
import { STAGES } from "@/data/types";
import {
  EMPTY_GROWER_FORM,
  EMPTY_INNOVATOR_FORM,
  SEED_SOLUTIONS,
} from "@/data/seed";
import type {
  EvidenceRecord,
  Grower,
  GrowerFormValues,
  InnovatorFormValues,
  PilotOffer,
  Solution,
} from "@/data/types";
import { listFromText, makeId } from "@/lib/utils";

type Role = "innovator" | "grower";

interface IntakeModalProps {
  role: Role;
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
  onClose,
  onCreateSolution,
  onCreateGrower,
}: IntakeModalProps) {
  const isInnovator = role === "innovator";
  const [form, setForm] = useState<InnovatorFormValues | GrowerFormValues>(
    isInnovator ? EMPTY_INNOVATOR_FORM : EMPTY_GROWER_FORM
  );

  function field<T extends InnovatorFormValues | GrowerFormValues>(
    key: keyof T,
    value: T[keyof T]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isInnovator) {
      const f = form as InnovatorFormValues;
      const solutionId = makeId("sol", f.solutionName);
      const solution: Solution = {
        id: solutionId,
        name: f.solutionName || "New crop protection solution",
        type: f.solutionType,
        proposition: f.proposition || "Crop protection solution ready for validation.",
        stage: f.stage,
        challengeIds: f.challengeIds,
        contexts: listFromText(f.contexts),
        crops: listFromText(f.crops),
        requiredSystems: listFromText(f.requiredSystems),
        requiredData: listFromText(f.requiredData),
        geography: listFromText(f.geography),
        lookingFor: listFromText(f.lookingFor),
      };
      const pilotOffer: PilotOffer = {
        id: makeId("pilot", f.pilotTitle || f.solutionName),
        solutionId,
        title: f.pilotTitle || `${solution.name} pilot`,
        type: f.pilotType,
        status: "Open",
        availability: f.pilotAvailability || "Open for pilot locations",
        duration: f.pilotDuration,
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
      region: f.region || "Region not specified",
      country: f.country || "NL",
      operation: f.operation || "Agricultural operation",
      contexts: listFromText(f.contexts),
      crops: listFromText(f.crops),
      openness: f.openness,
      challengeIds: f.challengeIds,
      constraints: listFromText(f.constraints),
      systems: listFromText(f.systems),
      availableData: listFromText(f.availableData),
      pilotTypes: listFromText(f.pilotTypes),
    };
    onCreateGrower(grower);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              OpenField intake
            </p>
            <h2 className="text-xl font-semibold text-slate-950">
              Create {isInnovator ? "a solution" : "a grower"} profile
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              New records are converted into the same data structure used by the
              matching layer.
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
          <InnovatorFields
            form={form as InnovatorFormValues}
            onChange={field}
          />
        ) : (
          <GrowerFields form={form as GrowerFormValues} onChange={field} />
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl bg-emerald-800 hover:bg-emerald-900">
            {isInnovator ? "Create solution" : "Create grower"}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}

// ─── Sub-forms ────────────────────────────────────────────────────────────────

function InnovatorFields({
  form,
  onChange,
}: {
  form: InnovatorFormValues;
  onChange: (key: keyof InnovatorFormValues, value: InnovatorFormValues[keyof InnovatorFormValues]) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Solution name">
        <input value={form.solutionName} onChange={(e) => onChange("solutionName", e.target.value)} className={INPUT_CLASS} placeholder="e.g. MildewSense" />
      </Field>
      <Field label="Solution type">
        <input value={form.solutionType} onChange={(e) => onChange("solutionType", e.target.value)} className={INPUT_CLASS} />
      </Field>
      <Field label="One-line proposition" full>
        <input value={form.proposition} onChange={(e) => onChange("proposition", e.target.value)} className={INPUT_CLASS} placeholder="What problem does it solve?" />
      </Field>
      <div className="space-y-2 md:col-span-2">
        <span className="text-xs font-medium text-slate-600">Challenges solved</span>
        <ChallengePicker selectedIds={form.challengeIds} onChange={(ids) => onChange("challengeIds", ids)} />
      </div>
      <Field label="Validation stage">
        <select value={form.stage} onChange={(e) => onChange("stage", e.target.value as InnovatorFormValues["stage"])} className={INPUT_CLASS}>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Geography">
        <input value={form.geography} onChange={(e) => onChange("geography", e.target.value)} className={INPUT_CLASS} placeholder="NL, BE" />
      </Field>
      <Field label="Contexts">
        <input value={form.contexts} onChange={(e) => onChange("contexts", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse, Open field" />
      </Field>
      <Field label="Crops">
        <input value={form.crops} onChange={(e) => onChange("crops", e.target.value)} className={INPUT_CLASS} placeholder="Tomato, Cucumber" />
      </Field>
      <Field label="Required systems">
        <input value={form.requiredSystems} onChange={(e) => onChange("requiredSystems", e.target.value)} className={INPUT_CLASS} placeholder="Stable internet, Sprayer" />
      </Field>
      <Field label="Required data">
        <input value={form.requiredData} onChange={(e) => onChange("requiredData", e.target.value)} className={INPUT_CLASS} placeholder="Disease observations" />
      </Field>
      <Field label="Looking for">
        <input value={form.lookingFor} onChange={(e) => onChange("lookingFor", e.target.value)} className={INPUT_CLASS} />
      </Field>
      <Field label="Pilot title">
        <input value={form.pilotTitle} onChange={(e) => onChange("pilotTitle", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse disease detection pilot" />
      </Field>
      <Field label="Pilot type">
        <input value={form.pilotType} onChange={(e) => onChange("pilotType", e.target.value)} className={INPUT_CLASS} />
      </Field>
      <Field label="Pilot duration">
        <input value={form.pilotDuration} onChange={(e) => onChange("pilotDuration", e.target.value)} className={INPUT_CLASS} />
      </Field>
      <Field label="Pilot availability" full>
        <input value={form.pilotAvailability} onChange={(e) => onChange("pilotAvailability", e.target.value)} className={INPUT_CLASS} />
      </Field>
      <Field label="Evidence type">
        <input value={form.evidenceType} onChange={(e) => onChange("evidenceType", e.target.value)} className={INPUT_CLASS} />
      </Field>
      <Field label="Evidence quality">
        <select value={form.evidenceQuality} onChange={(e) => onChange("evidenceQuality", e.target.value as InnovatorFormValues["evidenceQuality"])} className={INPUT_CLASS}>
          {(["Early", "Medium", "High"] as const).map((q) => <option key={q}>{q}</option>)}
        </select>
      </Field>
      <Field label="Evidence tested">
        <input value={form.evidenceTested} onChange={(e) => onChange("evidenceTested", e.target.value)} className={INPUT_CLASS} placeholder="2 pilots, 4 demo plots" />
      </Field>
      <Field label="Observed impact">
        <input value={form.evidenceImpact} onChange={(e) => onChange("evidenceImpact", e.target.value)} className={INPUT_CLASS} placeholder="Earlier detection, lower input use" />
      </Field>
    </div>
  );
}

function GrowerFields({
  form,
  onChange,
}: {
  form: GrowerFormValues;
  onChange: (key: keyof GrowerFormValues, value: GrowerFormValues[keyof GrowerFormValues]) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Grower name">
        <input value={form.name} onChange={(e) => onChange("name", e.target.value)} className={INPUT_CLASS} placeholder="e.g. Greenhouse grower" />
      </Field>
      <Field label="Operation">
        <input value={form.operation} onChange={(e) => onChange("operation", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse vegetables" />
      </Field>
      <Field label="Region">
        <input value={form.region} onChange={(e) => onChange("region", e.target.value)} className={INPUT_CLASS} placeholder="Westland, NL" />
      </Field>
      <Field label="Country code">
        <input value={form.country} onChange={(e) => onChange("country", e.target.value.toUpperCase())} className={INPUT_CLASS} placeholder="NL" />
      </Field>
      <div className="space-y-2 md:col-span-2">
        <span className="text-xs font-medium text-slate-600">Current challenges</span>
        <ChallengePicker selectedIds={form.challengeIds} onChange={(ids) => onChange("challengeIds", ids)} />
      </div>
      <Field label="Contexts">
        <input value={form.contexts} onChange={(e) => onChange("contexts", e.target.value)} className={INPUT_CLASS} placeholder="Greenhouse, Open field" />
      </Field>
      <Field label="Crops">
        <input value={form.crops} onChange={(e) => onChange("crops", e.target.value)} className={INPUT_CLASS} placeholder="Tomato, Pepper" />
      </Field>
      <Field label="Openness">
        <input value={form.openness} onChange={(e) => onChange("openness", e.target.value)} className={INPUT_CLASS} />
      </Field>
      <Field label="Pilot types">
        <input value={form.pilotTypes} onChange={(e) => onChange("pilotTypes", e.target.value)} className={INPUT_CLASS} placeholder="Paid pilot, Co-development" />
      </Field>
      <Field label="Systems">
        <input value={form.systems} onChange={(e) => onChange("systems", e.target.value)} className={INPUT_CLASS} placeholder="Scouting rounds, Stable internet" />
      </Field>
      <Field label="Available data">
        <input value={form.availableData} onChange={(e) => onChange("availableData", e.target.value)} className={INPUT_CLASS} placeholder="Disease observations" />
      </Field>
      <Field label="Pilot constraints" full>
        <input value={form.constraints} onChange={(e) => onChange("constraints", e.target.value)} className={INPUT_CLASS} placeholder="Low disruption, Seasonal window" />
      </Field>
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
    <label className={`space-y-1${full ? " md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
