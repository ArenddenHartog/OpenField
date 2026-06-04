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

// ─── Crop catalogue (grouped for the picker UI) ───────────────────────────────

export const CROP_GROUPS: { label: string; crops: string[] }[] = [
  {
    label: "Greenhouse vegetables",
    crops: [
      "Tomato", "Cucumber", "Sweet pepper", "Aubergine", "Courgette",
      "Lettuce", "Spinach", "Herbs", "Microgreens", "Radish", "Bok choy",
    ],
  },
  {
    label: "Open field vegetables",
    crops: [
      "Potato", "Onion", "Carrot", "Cabbage", "Broccoli", "Cauliflower",
      "Leek", "Beetroot", "Asparagus", "Peas", "Beans", "Broad beans",
      "Pumpkin", "Celery", "Garlic", "Fennel", "Kohlrabi", "Parsnip",
      "Swede", "Turnip",
    ],
  },
  {
    label: "Soft fruit & berries",
    crops: [
      "Strawberry", "Blueberry", "Raspberry", "Blackberry",
      "Redcurrant", "Blackcurrant", "Gooseberry", "Elderberry",
    ],
  },
  {
    label: "Orchard & vine",
    crops: [
      "Apple", "Pear", "Cherry", "Plum", "Peach", "Apricot",
      "Grape", "Kiwi", "Citrus", "Fig", "Walnut", "Hazelnut", "Almond",
    ],
  },
  {
    label: "Arable & field crops",
    crops: [
      "Wheat", "Barley", "Oats", "Rye", "Triticale", "Maize",
      "Sunflower", "Rapeseed", "Sugar beet", "Flaxseed",
      "Soybean", "Field peas", "Field beans",
    ],
  },
  {
    label: "Nursery & ornamentals",
    crops: [
      "Ornamental trees", "Shrubs", "Roses", "Cut flowers",
      "Potted plants", "Tree nursery", "Perennials",
      "Bedding plants", "Bulbs", "Conifers",
    ],
  },
  {
    label: "Specialty",
    crops: [
      "Hemp", "Cannabis", "Mushrooms", "Hops", "Lavender",
      "Tobacco", "Stevia", "Algae", "Chicory", "Artichoke",
    ],
  },
];

export const ALL_CROPS = CROP_GROUPS.flatMap((g) => g.crops);

// ─── Solution type catalogue ──────────────────────────────────────────────────

export const SOLUTION_TYPES = [
  "AI / Software",
  "Biological / Biostimulants",
  "Precision machinery",
  "Sensor / Hardware",
  "Data platform",
  "Robotics / Automation",
  "IPM / Scouting tools",
  "Genetics / Breeding support",
  "Monitoring / Remote sensing",
  "Decision support",
  "Crop nutrition",
  "Other",
] as const;

export type SolutionType = (typeof SOLUTION_TYPES)[number];

// ─── Seed solutions ───────────────────────────────────────────────────────────

export const SEED_SOLUTIONS: Solution[] = [
  {
    id: "sol-sporesight-ai",
    name: "SporeSight AI",
    type: "AI / Software",
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
    type: "Biological / Biostimulants",
    proposition:
      "Beneficial microbe treatment to suppress soil-borne pathogens.",
    stage: "First field test",
    challengeIds: [
      "biological-control",
      "pesticide-reduction",
      "resistance-management",
    ],
    contexts: ["Open field", "Nursery", "Organic systems"],
    crops: ["Strawberry", "Tree nursery", "Lettuce", "Ornamental trees", "Shrubs"],
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
    crops: ["Potato", "Onion", "Apple", "Pear", "Tree nursery", "Ornamental trees", "Shrubs"],
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
    role: "Grower",
    region: "Westland, NL",
    countries: ["NL"],
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
    role: "Grower",
    region: "Boskoop, NL",
    countries: ["NL"],
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
    includes: ["Camera kit (loan)", "Platform access", "Weekly agronomic review"],
    responseTime: "Reply within 3 working days",
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
    includes: ["Product supply", "Application guidance", "Trial design support", "End-of-season report"],
    responseTime: "Reply within 5 working days",
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
    includes: ["Sprayer module installation", "Operator training", "Field data analysis"],
    responseTime: "Reply within 2 working days",
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
  imageUrl: "",
  proposition: "",
  solutionType: "AI / Software",
  challengeIds: ["disease-detection"],
  stage: "Prototype",
  contexts: "Greenhouse",
  crops: [],
  requiredSystems: "",
  requiredData: "",
  geography: "NL",
  lookingFor: "Pilot growers, Grower feedback",
  pilotTitle: "",
  pilotType: "Paid pilot",
  pilotDuration: "8–12 weeks",
  pilotAvailability: "Open for pilot locations",
  pilotIncludes: "",
  pilotResponseTime: "Reply within 5 working days",
  evidenceType: "Field trial",
  evidenceTested: "",
  evidenceImpact: "",
  evidenceQuality: "Early",
};

export const EMPTY_GROWER_FORM: GrowerFormValues = {
  name: "",
  imageUrl: "",
  role: "Grower",
  operation: "",
  region: "",
  countries: ["NL"],
  contexts: "Greenhouse",
  crops: [],
  openness: "Open to pilots",
  challengeIds: ["disease-detection"],
  constraints: "Low disruption",
  systems: "",
  availableData: "",
  pilotTypes: "Paid pilot, Co-development",
};
