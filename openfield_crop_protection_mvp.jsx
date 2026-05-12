import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Sprout,
  ShieldCheck,
  MapPin,
  Users,
  Activity,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Radar,
  Handshake,
  BarChart3,
  Plus,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stages = [
  "Concept",
  "Prototype",
  "First field test",
  "Active pilots",
  "Proven in production",
  "Commercial rollout",
];

const challenges = [
  { id: "disease-detection", name: "Disease detection" },
  { id: "pesticide-reduction", name: "Pesticide reduction" },
  { id: "biological-control", name: "Biological control" },
  { id: "precision-spraying", name: "Precision spraying" },
  { id: "resistance-management", name: "Resistance management" },
  { id: "crop-scouting", name: "Crop scouting" },
];

const initialSolutions = [
  {
    id: "sol-sporesight-ai",
    name: "SporeSight AI",
    type: "AI / Computer vision",
    proposition: "Early mildew and fungal disease detection from greenhouse imagery.",
    stage: "Active pilots",
    challengeIds: ["disease-detection", "crop-scouting", "pesticide-reduction"],
    contexts: ["Greenhouse", "High-value crops"],
    crops: ["Tomato", "Cucumber", "Sweet pepper"],
    requiredSystems: ["Stable internet", "Scouting rounds", "Basic sensor setup"],
    requiredData: ["Weekly image capture", "Disease observations"],
    geography: ["NL", "BE"],
    lookingFor: ["Pilot growers", "Agronomic feedback", "Data partners"],
  },
  {
    id: "sol-bioshield-labs",
    name: "BioShield Labs",
    type: "Biological crop protection",
    proposition: "Beneficial microbe treatment to suppress soil-borne pathogens.",
    stage: "First field test",
    challengeIds: ["biological-control", "pesticide-reduction", "resistance-management"],
    contexts: ["Open field", "Nursery", "Organic systems"],
    crops: ["Strawberry", "Tree nursery", "Leafy greens", "Ornamental trees", "Shrubs"],
    requiredSystems: ["Manual scouting"],
    requiredData: ["Soil samples", "Control plot", "Disease observations"],
    geography: ["NL"],
    lookingFor: ["Trial locations", "Research partner", "Grower feedback"],
  },
  {
    id: "sol-spraywise-robotics",
    name: "SprayWise Robotics",
    type: "Precision machinery",
    proposition: "Spot-spraying module that reduces chemical use through plant-level targeting.",
    stage: "Proven in production",
    challengeIds: ["precision-spraying", "pesticide-reduction", "crop-scouting"],
    contexts: ["Open field", "Orchard", "Nursery"],
    crops: ["Potato", "Onion", "Fruit", "Tree nursery", "Ornamental trees", "Shrubs"],
    requiredSystems: ["Sprayer", "GPS guidance", "Field maps"],
    requiredData: ["Field boundary data"],
    geography: ["NL", "DE", "DK"],
    lookingFor: ["Launch customers", "Distribution partners"],
  },
];

const initialGrowers = [
  {
    id: "grower-greenhouse-westland",
    name: "Greenhouse grower",
    region: "Westland, NL",
    country: "NL",
    operation: "Greenhouse vegetables",
    contexts: ["Greenhouse", "High-value crops"],
    crops: ["Tomato", "Sweet pepper"],
    openness: "Open to pilots",
    challengeIds: ["disease-detection", "pesticide-reduction", "crop-scouting"],
    constraints: ["Low disruption", "Limited extra labour", "Data privacy important"],
    systems: ["Climate computer", "Scouting rounds", "Basic sensor setup", "Stable internet"],
    availableData: ["Weekly image capture", "Disease observations"],
    pilotTypes: ["Paid pilot", "Co-development"],
  },
  {
    id: "grower-tree-nursery-boskoop",
    name: "Tree nursery",
    region: "Boskoop, NL",
    country: "NL",
    operation: "Outdoor nursery",
    contexts: ["Open field", "Nursery"],
    crops: ["Ornamental trees", "Shrubs", "Tree nursery"],
    openness: "Active innovation partner",
    challengeIds: ["biological-control", "pesticide-reduction", "precision-spraying"],
    constraints: ["Seasonal windows", "Weather dependent", "Practical setup only"],
    systems: ["Sprayer", "Field maps", "Manual scouting", "GPS guidance"],
    availableData: ["Soil samples", "Control plot", "Disease observations", "Field boundary data"],
    pilotTypes: ["Free pilot", "Paid pilot", "Co-development"],
  },
];

const initialPilotOffers = [
  {
    id: "pilot-sporesight-2027",
    solutionId: "sol-sporesight-ai",
    title: "Greenhouse disease detection pilot",
    type: "Paid pilot",
    status: "Open",
    availability: "Looking for 3 pilot locations for next season",
    duration: "10–12 weeks",
    requiredContext: ["Greenhouse"],
    requiredSystems: ["Stable internet", "Scouting rounds"],
    requiredData: ["Weekly image capture", "Disease observations"],
  },
  {
    id: "pilot-bioshield-field-trial",
    solutionId: "sol-bioshield-labs",
    title: "Biological control commercial-scale trial",
    type: "Free pilot",
    status: "Open",
    availability: "Open for first commercial-scale trials",
    duration: "8–12 weeks",
    requiredContext: ["Open field", "Nursery", "Organic systems"],
    requiredSystems: ["Manual scouting"],
    requiredData: ["Soil samples", "Control plot", "Disease observations"],
  },
  {
    id: "pilot-spraywise-new-crops",
    solutionId: "sol-spraywise-robotics",
    title: "Precision spraying pilots for new crops",
    type: "Paid pilot",
    status: "Open",
    availability: "Commercial rollout; pilots for new crops",
    duration: "One spraying season",
    requiredContext: ["Open field", "Orchard", "Nursery"],
    requiredSystems: ["Sprayer", "GPS guidance", "Field maps"],
    requiredData: ["Field boundary data"],
  },
];

const initialEvidenceRecords = [
  {
    id: "evidence-sporesight-greenhouse",
    solutionId: "sol-sporesight-ai",
    type: "Active pilots",
    tested: "6 greenhouse pilots",
    geography: "NL, BE",
    impact: "Earlier disease alerts; pesticide applications reduced in selected test blocks",
    quality: "Medium",
  },
  {
    id: "evidence-bioshield-plot",
    solutionId: "sol-bioshield-labs",
    type: "Plot trial",
    tested: "Lab + 2 small plot trials",
    geography: "NL",
    impact: "Promising suppression of root disease pressure",
    quality: "Early",
  },
  {
    id: "evidence-spraywise-production",
    solutionId: "sol-spraywise-robotics",
    type: "Production use",
    tested: "25+ production farms",
    geography: "NL, DE, DK",
    impact: "Chemical use reduction in targeted applications",
    quality: "High",
  },
];

const emptyInnovatorForm = {
  solutionName: "",
  proposition: "",
  solutionType: "AI / Software",
  challengeIds: ["disease-detection"],
  stage: "Prototype",
  contexts: "Greenhouse",
  crops: "",
  requiredSystems: "",
  requiredData: "",
  geography: "NL",
  lookingFor: "Pilot growers, Grower feedback",
  pilotTitle: "",
  pilotType: "Paid pilot",
  pilotDuration: "8–12 weeks",
  pilotAvailability: "Open for pilot locations",
  evidenceType: "Field trial",
  evidenceTested: "",
  evidenceImpact: "",
  evidenceQuality: "Early",
};

const emptyGrowerForm = {
  name: "",
  operation: "",
  region: "",
  country: "NL",
  contexts: "Greenhouse",
  crops: "",
  openness: "Open to pilots",
  challengeIds: ["disease-detection"],
  constraints: "Low disruption",
  systems: "",
  availableData: "",
  pilotTypes: "Paid pilot, Co-development",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function namesFromIds(ids = [], source = []) {
  return ids.map((id) => source.find((item) => item.id === id)?.name).filter(Boolean);
}

function overlap(first = [], second = []) {
  return first.filter((item) => second.includes(item));
}

function unique(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function listFromText(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value = "item") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "item";
}

function makeId(prefix, label) {
  return `${prefix}-${slugify(label)}-${Date.now().toString(36)}`;
}

function ratioScore(matches, denominator) {
  if (!denominator || denominator <= 0) return 0;
  return Math.min((matches / denominator) * 100, 100);
}

function stageScore(stage) {
  const index = stages.indexOf(stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / stages.length) * 100);
}

function evidenceScore(quality) {
  if (quality === "High") return 100;
  if (quality === "Medium") return 70;
  if (quality === "Early") return 45;
  return 25;
}

function calculateMatch(solution, grower, pilotOffer, evidenceRecord) {
  const requiredSystems = pilotOffer?.requiredSystems?.length ? pilotOffer.requiredSystems : solution.requiredSystems;
  const requiredData = pilotOffer?.requiredData?.length ? pilotOffer.requiredData : solution.requiredData;
  const relevantContexts = pilotOffer?.requiredContext?.length ? pilotOffer.requiredContext : solution.contexts;

  const sharedChallengeIds = overlap(solution.challengeIds, grower.challengeIds);
  const sharedContexts = overlap(relevantContexts, grower.contexts);
  const sharedCrops = overlap(solution.crops, grower.crops);
  const matchedSystems = overlap(requiredSystems, grower.systems);
  const matchedData = overlap(requiredData, grower.availableData);

  const geographyFitScore = solution.geography.includes(grower.country) ? 100 : 0;
  const pilotTypeFitScore = pilotOffer && grower.pilotTypes.includes(pilotOffer.type) ? 100 : 40;
  const challengeFitScore = ratioScore(sharedChallengeIds.length, solution.challengeIds.length);
  const contextFitScore = ratioScore(sharedContexts.length, relevantContexts.length);
  const cropFitScore = sharedCrops.length > 0 ? 100 : 35;
  const systemsFitScore = requiredSystems.length ? ratioScore(matchedSystems.length, requiredSystems.length) : 60;
  const dataFitScore = requiredData.length ? ratioScore(matchedData.length, requiredData.length) : 60;

  const pilotReadinessScore = systemsFitScore * 0.45 + dataFitScore * 0.35 + pilotTypeFitScore * 0.2;
  const validationFitScore = stageScore(solution.stage) * 0.55 + evidenceScore(evidenceRecord?.quality) * 0.45;
  const score = Math.round(
    challengeFitScore * 0.35 +
      contextFitScore * 0.2 +
      cropFitScore * 0.15 +
      pilotReadinessScore * 0.15 +
      geographyFitScore * 0.1 +
      validationFitScore * 0.05
  );

  return {
    solutionId: solution.id,
    growerId: grower.id,
    pilotOfferId: pilotOffer?.id || null,
    evidenceRecordId: evidenceRecord?.id || null,
    score,
    components: {
      challengeFitScore: Math.round(challengeFitScore),
      contextFitScore: Math.round(contextFitScore),
      cropFitScore: Math.round(cropFitScore),
      pilotReadinessScore: Math.round(pilotReadinessScore),
      geographyFitScore: Math.round(geographyFitScore),
      validationFitScore: Math.round(validationFitScore),
    },
    sharedChallengeIds,
    sharedContexts,
    sharedCrops,
    matchedSystems,
    matchedData,
  };
}

function buildMatches(activeGrower, solutionRecords, pilotOfferRecords, evidenceRecordRecords) {
  return solutionRecords
    .map((solution) => {
      const pilotOffer = pilotOfferRecords.find((offer) => offer.solutionId === solution.id);
      const evidenceRecord = evidenceRecordRecords.find((record) => record.solutionId === solution.id);
      return calculateMatch(solution, activeGrower, pilotOffer, evidenceRecord);
    })
    .sort((first, second) => second.score - first.score);
}

function enrichSolution(solution, matches, pilotOfferRecords, evidenceRecordRecords) {
  const match = matches.find((item) => item.solutionId === solution.id);
  const pilotOffer = pilotOfferRecords.find((offer) => offer.id === match?.pilotOfferId) || pilotOfferRecords.find((offer) => offer.solutionId === solution.id) || null;
  const evidenceRecord = evidenceRecordRecords.find((record) => record.id === match?.evidenceRecordId) || evidenceRecordRecords.find((record) => record.solutionId === solution.id) || null;

  return {
    ...solution,
    tags: namesFromIds(solution.challengeIds, challenges),
    match,
    pilotOffer,
    evidenceRecord,
  };
}

function StagePill({ stage }) {
  const index = stages.indexOf(stage);
  const safeIndex = index >= 0 ? index : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Validation stage</span>
        <span className="font-medium text-slate-700">{stage}</span>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {stages.map((stageName, stageIndex) => (
          <div
            key={stageName}
            className={cn("h-2 rounded-full", stageIndex <= safeIndex ? "bg-emerald-700" : "bg-slate-200")}
            title={stageName}
          />
        ))}
      </div>
    </div>
  );
}

function Tag({ children, active = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        active ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"
      )}
    >
      {children}
    </span>
  );
}

function ChallengePicker({ selectedIds, onChange }) {
  function toggleChallenge(id) {
    const next = selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id];
    onChange(next.length ? next : [id]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {challenges.map((challenge) => (
        <button
          key={challenge.id}
          type="button"
          onClick={() => toggleChallenge(challenge.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            selectedIds.includes(challenge.id) ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"
          )}
        >
          {challenge.name}
        </button>
      ))}
    </div>
  );
}

function ScoreBreakdown({ match }) {
  if (!match) return null;

  const rows = [
    ["Challenge fit", match.components.challengeFitScore],
    ["Context fit", match.components.contextFitScore],
    ["Crop fit", match.components.cropFitScore],
    ["Pilot readiness", match.components.pilotReadinessScore],
    ["Geography", match.components.geographyFitScore],
    ["Validation", match.components.validationFitScore],
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-xl bg-slate-50 p-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>{label}</span>
            <span className="font-medium text-slate-700">{value}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200">
            <div className="h-1.5 rounded-full bg-emerald-700" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SolutionCard({ solution, selected, onClick }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        onClick={onClick}
        className={cn(
          "cursor-pointer rounded-2xl border bg-white shadow-sm transition hover:shadow-md",
          selected ? "border-emerald-700 ring-2 ring-emerald-100" : "border-slate-200"
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{solution.name}</h3>
                  <p className="text-xs text-slate-500">{solution.type}</p>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-700">{solution.proposition}</p>
            </div>
            <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white">
              <div className="text-lg font-semibold">{solution.match?.score ?? "—"}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-300">match</div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {solution.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>

          <StagePill stage={solution.stage} />

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Handshake size={14} />
              {solution.pilotOffer?.availability || "Pilot availability not yet specified"}
            </div>
            <ArrowRight size={16} className="text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProfileDetail({ solution }) {
  const pilotRequirements = unique([...(solution?.pilotOffer?.requiredSystems || []), ...(solution?.pilotOffer?.requiredData || [])]);

  if (!solution) {
    return (
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-slate-600">No matching crop protection solution found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800">Solution profile</p>
            <h2 className="text-2xl font-semibold text-slate-950">{solution.name}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-700">{solution.proposition}</p>
          </div>
          <Button className="rounded-xl bg-emerald-800 hover:bg-emerald-900">Request intro</Button>
        </div>

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
            <p className="text-sm text-slate-700">{solution.evidenceRecord?.geography || "Not specified"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users size={16} /> Looking for
            </div>
            <p className="text-sm text-slate-700">{solution.lookingFor.join(", ")}</p>
          </div>
        </div>

        <div className="mb-6">
          <StagePill stage={solution.stage} />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-950">Calculated match breakdown</h4>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{solution.match?.score ?? "—"} score</span>
          </div>
          <ScoreBreakdown match={solution.match} />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-950">Operational fit</h4>
            <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="text-xs text-slate-500">Works best in</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {solution.contexts.map((context) => (
                    <Tag key={context} active={solution.match?.sharedContexts.includes(context)}>
                      {context}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Relevant crops</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {solution.crops.map((crop) => (
                    <Tag key={crop} active={solution.match?.sharedCrops.includes(crop)}>
                      {crop}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pilot requirements</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {pilotRequirements.map((requirement) => (
                    <li key={requirement} className="flex gap-2">
                      <CheckCircle2 size={15} className="mt-0.5 text-emerald-700" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-950">Proof & availability</h4>
            <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="text-xs text-slate-500">Evidence</p>
                <p className="mt-1 text-sm text-slate-700">{solution.evidenceRecord?.tested || "No evidence record linked"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Measured / observed impact</p>
                <p className="mt-1 text-sm text-slate-700">{solution.evidenceRecord?.impact || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pilot offer</p>
                <p className="mt-1 text-sm text-slate-700">
                  {solution.pilotOffer ? `${solution.pilotOffer.type} · ${solution.pilotOffer.duration}` : "No active pilot offer"}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle size={15} /> Validation note
                </div>
                Results should be reviewed per crop, region and disease pressure before implementation.
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

function GrowerPanel({ grower }) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Grower context</p>
            <h3 className="text-lg font-semibold text-slate-950">{grower.name}</h3>
            <p className="text-sm text-slate-500">{grower.operation} · {grower.region}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
            <Sprout size={20} />
          </div>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Openness</p>
            <p className="text-sm font-medium text-slate-900">{grower.openness}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Existing systems</p>
            <p className="text-sm font-medium text-slate-900">{grower.systems.slice(0, 2).join(", ")}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs text-slate-500">Current challenges</p>
            <div className="flex flex-wrap gap-2">
              {namesFromIds(grower.challengeIds, challenges).map((challenge) => (
                <Tag key={challenge} active>
                  {challenge}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-500">Pilot constraints</p>
            <div className="flex flex-wrap gap-2">
              {grower.constraints.map((constraint) => (
                <Tag key={constraint}>{constraint}</Tag>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntakeModal({ role, onClose, onCreateSolution, onCreateGrower }) {
  const [form, setForm] = useState(role === "innovator" ? emptyInnovatorForm : emptyGrowerForm);
  const isInnovator = role === "innovator";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitForm(event) {
    event.preventDefault();

    if (isInnovator) {
      const solutionId = makeId("sol", form.solutionName);
      const solution = {
        id: solutionId,
        name: form.solutionName || "New crop protection solution",
        type: form.solutionType,
        proposition: form.proposition || "Crop protection solution ready for validation.",
        stage: form.stage,
        challengeIds: form.challengeIds,
        contexts: listFromText(form.contexts),
        crops: listFromText(form.crops),
        requiredSystems: listFromText(form.requiredSystems),
        requiredData: listFromText(form.requiredData),
        geography: listFromText(form.geography),
        lookingFor: listFromText(form.lookingFor),
      };
      const pilotOffer = {
        id: makeId("pilot", form.pilotTitle || form.solutionName),
        solutionId,
        title: form.pilotTitle || `${solution.name} pilot`,
        type: form.pilotType,
        status: "Open",
        availability: form.pilotAvailability || "Open for pilot locations",
        duration: form.pilotDuration,
        requiredContext: solution.contexts,
        requiredSystems: solution.requiredSystems,
        requiredData: solution.requiredData,
      };
      const evidenceRecord = {
        id: makeId("evidence", form.solutionName),
        solutionId,
        type: form.evidenceType,
        tested: form.evidenceTested || "Evidence not yet specified",
        geography: solution.geography.join(", ") || "Not specified",
        impact: form.evidenceImpact || "Impact to be validated during pilot",
        quality: form.evidenceQuality,
      };

      onCreateSolution({ solution, pilotOffer, evidenceRecord });
      return;
    }

    const grower = {
      id: makeId("grower", form.name || form.operation),
      name: form.name || "New grower",
      region: form.region || "Region not specified",
      country: form.country || "NL",
      operation: form.operation || "Agricultural operation",
      contexts: listFromText(form.contexts),
      crops: listFromText(form.crops),
      openness: form.openness,
      challengeIds: form.challengeIds,
      constraints: listFromText(form.constraints),
      systems: listFromText(form.systems),
      availableData: listFromText(form.availableData),
      pilotTypes: listFromText(form.pilotTypes),
    };

    onCreateGrower(grower);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.form
        onSubmit={submitForm}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">OpenField intake</p>
            <h2 className="text-xl font-semibold text-slate-950">
              Create {isInnovator ? "a solution" : "a grower"} profile
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              New records are converted into the same data structure used by the matching layer.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close intake modal">
            <X size={18} />
          </button>
        </div>

        {isInnovator ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Solution name</span>
              <input value={form.solutionName} onChange={(event) => updateField("solutionName", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="e.g. MildewSense" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Solution type</span>
              <input value={form.solutionType} onChange={(event) => updateField("solutionType", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-medium text-slate-600">One-line proposition</span>
              <input value={form.proposition} onChange={(event) => updateField("proposition", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="What problem does it solve?" />
            </label>
            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-medium text-slate-600">Challenges solved</span>
              <ChallengePicker selectedIds={form.challengeIds} onChange={(value) => updateField("challengeIds", value)} />
            </div>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Validation stage</span>
              <select value={form.stage} onChange={(event) => updateField("stage", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700">
                {stages.map((stage) => <option key={stage}>{stage}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Geography</span>
              <input value={form.geography} onChange={(event) => updateField("geography", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="NL, BE" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Contexts</span>
              <input value={form.contexts} onChange={(event) => updateField("contexts", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Greenhouse, Open field" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Crops</span>
              <input value={form.crops} onChange={(event) => updateField("crops", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Tomato, Cucumber" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Required systems</span>
              <input value={form.requiredSystems} onChange={(event) => updateField("requiredSystems", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Stable internet, Sprayer" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Required data</span>
              <input value={form.requiredData} onChange={(event) => updateField("requiredData", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Disease observations" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Looking for</span>
              <input value={form.lookingFor} onChange={(event) => updateField("lookingFor", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Pilot title</span>
              <input value={form.pilotTitle} onChange={(event) => updateField("pilotTitle", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Greenhouse disease detection pilot" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Pilot type</span>
              <input value={form.pilotType} onChange={(event) => updateField("pilotType", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Pilot duration</span>
              <input value={form.pilotDuration} onChange={(event) => updateField("pilotDuration", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-medium text-slate-600">Pilot availability</span>
              <input value={form.pilotAvailability} onChange={(event) => updateField("pilotAvailability", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Evidence type</span>
              <input value={form.evidenceType} onChange={(event) => updateField("evidenceType", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Evidence quality</span>
              <select value={form.evidenceQuality} onChange={(event) => updateField("evidenceQuality", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700">
                {[
                  "Early",
                  "Medium",
                  "High",
                ].map((quality) => <option key={quality}>{quality}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Evidence tested</span>
              <input value={form.evidenceTested} onChange={(event) => updateField("evidenceTested", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="2 pilots, 4 demo plots" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Observed impact</span>
              <input value={form.evidenceImpact} onChange={(event) => updateField("evidenceImpact", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Earlier detection, lower input use" />
            </label>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Grower name</span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="e.g. Greenhouse grower" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Operation</span>
              <input value={form.operation} onChange={(event) => updateField("operation", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Greenhouse vegetables" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Region</span>
              <input value={form.region} onChange={(event) => updateField("region", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Westland, NL" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Country code</span>
              <input value={form.country} onChange={(event) => updateField("country", event.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="NL" />
            </label>
            <div className="space-y-2 md:col-span-2">
              <span className="text-xs font-medium text-slate-600">Current challenges</span>
              <ChallengePicker selectedIds={form.challengeIds} onChange={(value) => updateField("challengeIds", value)} />
            </div>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Contexts</span>
              <input value={form.contexts} onChange={(event) => updateField("contexts", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Greenhouse, Open field" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Crops</span>
              <input value={form.crops} onChange={(event) => updateField("crops", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Tomato, Pepper" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Openness</span>
              <input value={form.openness} onChange={(event) => updateField("openness", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Pilot types</span>
              <input value={form.pilotTypes} onChange={(event) => updateField("pilotTypes", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Paid pilot, Co-development" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Systems</span>
              <input value={form.systems} onChange={(event) => updateField("systems", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Scouting rounds, Stable internet" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Available data</span>
              <input value={form.availableData} onChange={(event) => updateField("availableData", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Disease observations" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-medium text-slate-600">Pilot constraints</span>
              <input value={form.constraints} onChange={(event) => updateField("constraints", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700" placeholder="Low disruption, Seasonal window" />
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" className="rounded-xl bg-emerald-800 hover:bg-emerald-900">
            {isInnovator ? "Create solution" : "Create grower"}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}

export default function OpenFieldCropProtectionMVP() {
  const [solutionRecords, setSolutionRecords] = useState(initialSolutions);
  const [growerRecords, setGrowerRecords] = useState(initialGrowers);
  const [pilotOfferRecords, setPilotOfferRecords] = useState(initialPilotOffers);
  const [evidenceRecordRecords, setEvidenceRecordRecords] = useState(initialEvidenceRecords);
  const [selectedGrowerId, setSelectedGrowerId] = useState(initialGrowers[0].id);
  const [selectedTag, setSelectedTag] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("sol-sporesight-ai");
  const [modalRole, setModalRole] = useState(null);

  const grower = growerRecords.find((record) => record.id === selectedGrowerId) || growerRecords[0];
  const matches = useMemo(() => buildMatches(grower, solutionRecords, pilotOfferRecords, evidenceRecordRecords), [grower, solutionRecords, pilotOfferRecords, evidenceRecordRecords]);
  const enrichedSolutions = useMemo(
    () => solutionRecords.map((solution) => enrichSolution(solution, matches, pilotOfferRecords, evidenceRecordRecords)),
    [solutionRecords, matches, pilotOfferRecords, evidenceRecordRecords]
  );
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return enrichedSolutions
      .filter((solution) => {
        const tagMatch = selectedTag === "All" || solution.tags.includes(selectedTag);
        const searchableText = [
          solution.name,
          solution.proposition,
          solution.type,
          solution.stage,
          solution.pilotOffer?.title,
          solution.pilotOffer?.availability,
          solution.evidenceRecord?.impact,
          ...solution.tags,
          ...solution.crops,
          ...solution.contexts,
          ...solution.lookingFor,
          ...solution.requiredSystems,
          ...solution.requiredData,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const queryMatch = !normalizedQuery || searchableText.includes(normalizedQuery);

        return tagMatch && queryMatch;
      })
      .sort((first, second) => (second.match?.score || 0) - (first.match?.score || 0));
  }, [selectedTag, query, enrichedSolutions]);

  const selected = filtered.find((solution) => solution.id === selectedId) || filtered[0] || null;
  const bestMatch = filtered[0] || null;
  const sharedTags = selected ? namesFromIds(selected.match?.sharedChallengeIds || [], challenges) : [];
  const matchLabel = selected && bestMatch?.id === selected.id ? "Best current match" : "Selected match";

  function handleCreateSolution({ solution, pilotOffer, evidenceRecord }) {
    setSolutionRecords((current) => [...current, solution]);
    setPilotOfferRecords((current) => [...current, pilotOffer]);
    setEvidenceRecordRecords((current) => [...current, evidenceRecord]);
    setSelectedId(solution.id);
    setModalRole(null);
  }

  function handleCreateGrower(growerRecord) {
    setGrowerRecords((current) => [...current, growerRecord]);
    setSelectedGrowerId(growerRecord.id);
    setModalRole(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f6ef] text-slate-950">
      <header className="border-b border-slate-200 bg-[#fbfaf5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-800 p-2 text-white">
              <Leaf size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">OpenField</h1>
              <p className="text-xs text-slate-500">Crop protection innovation matching</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#challenges">Challenges</a>
            <a href="#solutions">Solutions</a>
            <a href="#pilots">Pilots</a>
            <a href="#grower-network">Grower network</a>
          </nav>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setModalRole("grower")} className="rounded-xl border-slate-300">Add grower</Button>
            <Button onClick={() => setModalRole("innovator")} className="rounded-xl bg-emerald-800 hover:bg-emerald-900">Add solution</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section id="challenges" className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-100">
              <Radar size={14} /> MVP wedge: Crop Protection
            </div>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Find field-ready crop protection innovations — and the growers to validate them.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
              OpenField connects practical crop protection challenges with innovators who are ready to test, prove, or scale their solutions in real agricultural conditions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setModalRole("grower")} className="rounded-xl bg-white text-slate-950 hover:bg-slate-100">I am a grower</Button>
              <Button onClick={() => setModalRole("innovator")} variant="outline" className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">I am an innovator</Button>
            </div>
          </div>

          <div id="grower-network" className="grid gap-4">
            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                    <BarChart3 size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">MVP signal</h3>
                    <p className="text-sm text-slate-500">Measure calculated matches, not traffic.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-2xl font-semibold">{solutionRecords.length}</div>
                    <div className="text-xs text-slate-500">solutions</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-2xl font-semibold">{growerRecords.length}</div>
                    <div className="text-xs text-slate-500">growers</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-2xl font-semibold">{matches.length}</div>
                    <div className="text-xs text-slate-500">matches</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Active grower context</span>
                <select value={selectedGrowerId} onChange={(event) => setSelectedGrowerId(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700">
                  {growerRecords.map((record) => (
                    <option key={record.id} value={record.id}>{record.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <GrowerPanel grower={grower} />
          </div>
        </section>

        <section id="solutions" className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by disease, crop, solution type or requirement..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter size={16} className="text-slate-400" />
            {["All", ...challenges.map((challenge) => challenge.name)].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium",
                  selectedTag === tag ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section id="pilots" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Crop protection solutions</h2>
                <p className="text-sm text-slate-500">Filtered and ranked by calculated practical fit.</p>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => setModalRole("innovator")}>
                <Plus size={16} className="mr-2" /> Add
              </Button>
            </div>

            {filtered.length > 0 ? (
              filtered.map((solution) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  selected={selected?.id === solution.id}
                  onClick={() => setSelectedId(solution.id)}
                />
              ))
            ) : (
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-900">No solutions found</p>
                  <p className="mt-1 text-sm text-slate-600">Try another challenge tag or search term.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="sticky top-6 h-fit space-y-4">
            <div className="rounded-2xl bg-emerald-900 p-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-100">{matchLabel}</p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {selected ? `${grower.name} × ${selected.name}` : `${grower.name} × no solution selected`}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-50">
                    Shared challenge tags: {sharedTags.length > 0 ? sharedTags.join(", ") : "needs review"}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-center text-emerald-950">
                  <div className="text-xl font-semibold">{selected?.match?.score ?? "—"}</div>
                  <div className="text-[10px] uppercase tracking-wide">score</div>
                </div>
              </div>
            </div>
            <ProfileDetail solution={selected} />
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
    </div>
  );
}
