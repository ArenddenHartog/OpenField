// ─── Enumerations ────────────────────────────────────────────────────────────

export const STAGES = [
  "Concept",
  "Prototype",
  "First field test",
  "Active pilots",
  "Proven in production",
  "Commercial rollout",
] as const;

export type Stage = (typeof STAGES)[number];

export type EvidenceQuality = "High" | "Medium" | "Early";

export type ChallengeId = string;

export type PilotStatus = "Open" | "Closed";

export type GrowerRole =
  | "Grower"
  | "Researcher"
  | "Breeder"
  | "Technology partner"
  | "Other";

export const GROWER_ROLES: GrowerRole[] = [
  "Grower",
  "Researcher",
  "Breeder",
  "Technology partner",
  "Other",
];

// ─── Core domain records ──────────────────────────────────────────────────────

export interface Challenge {
  id: ChallengeId;
  name: string;
}

export interface Solution {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  proposition: string;
  stage: Stage;
  challengeIds: ChallengeId[];
  contexts: string[];
  crops: string[];
  requiredSystems: string[];
  requiredData: string[];
  geography: string[];
  lookingFor: string[];
  website?: string;
  contactEmail?: string;
  pricingModel?: string;
}

export interface Grower {
  id: string;
  name: string;
  role: GrowerRole;
  imageUrl?: string;
  region: string;
  countries: string[];
  operation: string;
  contexts: string[];
  crops: string[];
  openness: string;
  challengeIds: ChallengeId[];
  constraints: string[];
  systems: string[];
  availableData: string[];
  pilotTypes: string[];
  website?: string;
  contactEmail?: string;
  operationScale?: string;
  certifications?: string[];
  preferredPilotSeason?: string;
}

export interface PilotOffer {
  id: string;
  solutionId: string;
  title: string;
  type: string;
  status: PilotStatus;
  availability: string;
  duration: string;
  includes: string[];
  responseTime: string;
  requiredContext: string[];
  requiredSystems: string[];
  requiredData: string[];
}

export interface EvidenceRecord {
  id: string;
  solutionId: string;
  type: string;
  tested: string;
  geography: string;
  impact: string;
  quality: EvidenceQuality;
}

// ─── Match result ─────────────────────────────────────────────────────────────

export interface MatchComponents {
  challengeFitScore: number;
  contextFitScore: number;
  cropFitScore: number;
  pilotReadinessScore: number;
  geographyFitScore: number;
  validationFitScore: number;
}

export interface Match {
  solutionId: string;
  growerId: string;
  pilotOfferId: string | null;
  evidenceRecordId: string | null;
  score: number;
  components: MatchComponents;
  sharedChallengeIds: ChallengeId[];
  sharedContexts: string[];
  sharedCrops: string[];
  matchedSystems: string[];
  matchedData: string[];
}

// ─── View model ───────────────────────────────────────────────────────────────

export interface EnrichedSolution extends Solution {
  tags: string[];
  match: Match | undefined;
  pilotOffer: PilotOffer | null;
  evidenceRecord: EvidenceRecord | null;
}

// ─── Form shapes ──────────────────────────────────────────────────────────────

export interface InnovatorFormValues {
  solutionName: string;
  imageUrl: string;
  proposition: string;
  solutionType: string;
  challengeIds: ChallengeId[];
  stage: Stage;
  contexts: string;
  crops: string[];
  requiredSystems: string;
  requiredData: string;
  geography: string;
  lookingFor: string;
  website: string;
  contactEmail: string;
  pricingModel: string;
  pilotTitle: string;
  pilotType: string;
  pilotDuration: string;
  pilotAvailability: string;
  pilotIncludes: string;
  pilotResponseTime: string;
  evidenceType: string;
  evidenceTested: string;
  evidenceImpact: string;
  evidenceQuality: EvidenceQuality;
}

export interface GrowerFormValues {
  name: string;
  role: GrowerRole;
  imageUrl: string;
  operation: string;
  region: string;
  countries: string[];
  contexts: string;
  crops: string[];
  openness: string;
  challengeIds: ChallengeId[];
  constraints: string[];
  systems: string[];
  availableData: string[];
  pilotTypes: string[];
  website: string;
  contactEmail: string;
  operationScale: string;
  certifications: string;
  preferredPilotSeason: string;
}
