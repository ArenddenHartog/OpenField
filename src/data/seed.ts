import type {
  Challenge,
  Solution,
  Grower,
  PilotOffer,
  EvidenceRecord,
  InnovatorFormValues,
  GrowerFormValues,
} from "./types";

// ─── Static lookup tables ─────────────────────────────────────────────────────

export const CHALLENGES: Challenge[] = [
  { id: "disease-detection", name: "Disease detection" },
  { id: "pesticide-reduction", name: "Pesticide reduction" },
  { id: "biological-control", name: "Biological control" },
  { id: "precision-spraying", name: "Precision spraying" },
  { id: "resistance-management", name: "Resistance management" },
  { id: "crop-scouting", name: "Crop scouting" },
];

// ─── Seed solutions ───────────────────────────────────────────────────────────

export const SEED_SOLUTIONS: Solution[] = [
  {
    id: "sol-sporesight-ai",
    name: "SporeSight AI",
    type: "AI / Computer vision",
    proposition:
      "Early mildew and fungal disease detection from greenhouse imagery.",
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
    proposition:
      "Beneficial microbe treatment to suppress soil-borne pathogens.",
    stage: "First field test",
    challengeIds: [
      "biological-control",
      "pesticide-reduction",
      "resistance-management",
    ],
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
    proposition:
      "Spot-spraying module that reduces chemical use through plant-level targeting.",
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

// ─── Seed growers ─────────────────────────────────────────────────────────────

export const SEED_GROWERS: Grower[] = [
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
    challengeIds: [
      "biological-control",
      "pesticide-reduction",
      "precision-spraying",
    ],
    constraints: ["Seasonal windows", "Weather dependent", "Practical setup only"],
    systems: ["Sprayer", "Field maps", "Manual scouting", "GPS guidance"],
    availableData: [
      "Soil samples",
      "Control plot",
      "Disease observations",
      "Field boundary data",
    ],
    pilotTypes: ["Free pilot", "Paid pilot", "Co-development"],
  },
];

// ─── Seed pilot offers ────────────────────────────────────────────────────────

export const SEED_PILOT_OFFERS: PilotOffer[] = [
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

// ─── Seed evidence records ────────────────────────────────────────────────────

export const SEED_EVIDENCE_RECORDS: EvidenceRecord[] = [
  {
    id: "evidence-sporesight-greenhouse",
    solutionId: "sol-sporesight-ai",
    type: "Active pilots",
    tested: "6 greenhouse pilots",
    geography: "NL, BE",
    impact:
      "Earlier disease alerts; pesticide applications reduced in selected test blocks",
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

// ─── Empty form defaults ──────────────────────────────────────────────────────

export const EMPTY_INNOVATOR_FORM: InnovatorFormValues = {
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

export const EMPTY_GROWER_FORM: GrowerFormValues = {
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
