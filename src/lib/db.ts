import { supabase } from "./supabase";
import type {
  ChallengeId,
  EvidenceRecord,
  Grower,
  PilotOffer,
  Solution,
} from "@/data/types";

// ── Load all solutions with related records ───────────────────────────────────

export async function loadAllSolutions(): Promise<{
  solutions: Solution[];
  pilotOffers: PilotOffer[];
  evidenceRecords: EvidenceRecord[];
} | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("solutions")
    .select("*, pilot_offers(*), evidence_records(*)")
    .order("created_at", { ascending: true });

  if (error || !data) return null;

  const solutions: Solution[] = data.map(rowToSolution);
  const pilotOffers: PilotOffer[] = data.flatMap((row) =>
    ((row.pilot_offers as unknown[]) ?? []).map((r) =>
      rowToPilotOffer(r as Record<string, unknown>)
    )
  );
  const evidenceRecords: EvidenceRecord[] = data.flatMap((row) =>
    ((row.evidence_records as unknown[]) ?? []).map((r) =>
      rowToEvidenceRecord(r as Record<string, unknown>)
    )
  );

  return { solutions, pilotOffers, evidenceRecords };
}

// ── Load grower profile for the signed-in user ───────────────────────────────

export async function loadGrowerProfile(userId: string): Promise<Grower | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("grower_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToGrower(data as Record<string, unknown>);
}

// ── Save solution + pilot offer + evidence record ─────────────────────────────

export async function saveSolution(
  solution: Solution,
  pilotOffer: PilotOffer,
  evidenceRecord: EvidenceRecord,
  userId?: string
): Promise<void> {
  if (!supabase) return;

  await supabase.from("solutions").upsert({
    id: solution.id,
    user_id: userId ?? null,
    name: solution.name,
    type: solution.type,
    image_url: solution.imageUrl ?? null,
    proposition: solution.proposition,
    stage: solution.stage,
    challenge_ids: solution.challengeIds,
    contexts: solution.contexts,
    crops: solution.crops,
    required_systems: solution.requiredSystems,
    required_data: solution.requiredData,
    geography: solution.geography,
    looking_for: solution.lookingFor,
    website: solution.website ?? null,
    contact_email: solution.contactEmail ?? null,
    pricing_model: solution.pricingModel ?? null,
  });

  await supabase.from("pilot_offers").upsert({
    id: pilotOffer.id,
    solution_id: pilotOffer.solutionId,
    title: pilotOffer.title,
    type: pilotOffer.type,
    status: pilotOffer.status,
    availability: pilotOffer.availability,
    duration: pilotOffer.duration,
    includes: pilotOffer.includes,
    response_time: pilotOffer.responseTime,
    required_context: pilotOffer.requiredContext,
    required_systems: pilotOffer.requiredSystems,
    required_data: pilotOffer.requiredData,
  });

  await supabase.from("evidence_records").upsert({
    id: evidenceRecord.id,
    solution_id: evidenceRecord.solutionId,
    type: evidenceRecord.type,
    tested: evidenceRecord.tested,
    geography: evidenceRecord.geography,
    impact: evidenceRecord.impact,
    quality: evidenceRecord.quality,
  });
}

// ── Save grower profile ───────────────────────────────────────────────────────

export async function saveGrowerProfile(
  grower: Grower,
  userId: string
): Promise<void> {
  if (!supabase) return;

  await supabase.from("grower_profiles").upsert({
    id: grower.id,
    user_id: userId,
    name: grower.name,
    role: grower.role,
    image_url: grower.imageUrl ?? null,
    region: grower.region,
    countries: grower.countries,
    operation: grower.operation,
    operation_scale: grower.operationScale ?? null,
    contexts: grower.contexts,
    crops: grower.crops,
    openness: grower.openness,
    challenge_ids: grower.challengeIds,
    constraints: grower.constraints,
    systems: grower.systems,
    available_data: grower.availableData,
    pilot_types: grower.pilotTypes,
    website: grower.website ?? null,
    contact_email: grower.contactEmail ?? null,
    certifications: grower.certifications ?? [],
    preferred_pilot_season: grower.preferredPilotSeason ?? null,
  });
}

// ── Row → TypeScript mappers ──────────────────────────────────────────────────

function rowToSolution(row: Record<string, unknown>): Solution {
  return {
    id: row.id as string,
    name: row.name as string,
    type: (row.type as string) ?? "",
    imageUrl: (row.image_url as string) ?? undefined,
    proposition: (row.proposition as string) ?? "",
    stage: row.stage as Solution["stage"],
    challengeIds: ((row.challenge_ids as ChallengeId[]) ?? []),
    contexts: ((row.contexts as string[]) ?? []),
    crops: ((row.crops as string[]) ?? []),
    requiredSystems: ((row.required_systems as string[]) ?? []),
    requiredData: ((row.required_data as string[]) ?? []),
    geography: ((row.geography as string[]) ?? []),
    lookingFor: ((row.looking_for as string[]) ?? []),
    website: (row.website as string) ?? undefined,
    contactEmail: (row.contact_email as string) ?? undefined,
    pricingModel: (row.pricing_model as string) ?? undefined,
  };
}

function rowToPilotOffer(row: Record<string, unknown>): PilotOffer {
  return {
    id: row.id as string,
    solutionId: row.solution_id as string,
    title: (row.title as string) ?? "",
    type: (row.type as string) ?? "",
    status: (row.status as PilotOffer["status"]) ?? "Open",
    availability: (row.availability as string) ?? "",
    duration: (row.duration as string) ?? "",
    includes: ((row.includes as string[]) ?? []),
    responseTime: (row.response_time as string) ?? "",
    requiredContext: ((row.required_context as string[]) ?? []),
    requiredSystems: ((row.required_systems as string[]) ?? []),
    requiredData: ((row.required_data as string[]) ?? []),
  };
}

function rowToEvidenceRecord(row: Record<string, unknown>): EvidenceRecord {
  return {
    id: row.id as string,
    solutionId: row.solution_id as string,
    type: (row.type as string) ?? "",
    tested: (row.tested as string) ?? "",
    geography: (row.geography as string) ?? "",
    impact: (row.impact as string) ?? "",
    quality: (row.quality as EvidenceRecord["quality"]) ?? "Early",
  };
}

function rowToGrower(row: Record<string, unknown>): Grower {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    role: row.role as Grower["role"],
    imageUrl: (row.image_url as string) ?? undefined,
    region: (row.region as string) ?? "",
    countries: ((row.countries as string[]) ?? []),
    operation: (row.operation as string) ?? "",
    operationScale: (row.operation_scale as string) ?? undefined,
    contexts: ((row.contexts as string[]) ?? []),
    crops: ((row.crops as string[]) ?? []),
    openness: (row.openness as string) ?? "",
    challengeIds: ((row.challenge_ids as ChallengeId[]) ?? []),
    constraints: ((row.constraints as string[]) ?? []),
    systems: ((row.systems as string[]) ?? []),
    availableData: ((row.available_data as string[]) ?? []),
    pilotTypes: ((row.pilot_types as string[]) ?? []),
    website: (row.website as string) ?? undefined,
    contactEmail: (row.contact_email as string) ?? undefined,
    certifications: ((row.certifications as string[]) ?? undefined),
    preferredPilotSeason: (row.preferred_pilot_season as string) ?? undefined,
  };
}
