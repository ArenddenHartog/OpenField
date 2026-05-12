import { STAGES } from "@/data/types";
import type {
  ChallengeId,
  EnrichedSolution,
  EvidenceQuality,
  EvidenceRecord,
  Grower,
  Match,
  PilotOffer,
  Solution,
  Stage,
  Challenge,
} from "@/data/types";
import { namesFromIds, overlap } from "@/lib/utils";

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function ratioScore(matches: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return Math.min((matches / denominator) * 100, 100);
}

function stageScore(stage: Stage): number {
  const index = STAGES.indexOf(stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / STAGES.length) * 100);
}

function evidenceScore(quality: EvidenceQuality | undefined): number {
  if (quality === "High") return 100;
  if (quality === "Medium") return 70;
  if (quality === "Early") return 45;
  return 25;
}

// ─── Core match calculation ───────────────────────────────────────────────────

export function calculateMatch(
  solution: Solution,
  grower: Grower,
  pilotOffer: PilotOffer | undefined,
  evidenceRecord: EvidenceRecord | undefined
): Match {
  const requiredSystems =
    pilotOffer?.requiredSystems?.length
      ? pilotOffer.requiredSystems
      : solution.requiredSystems;
  const requiredData =
    pilotOffer?.requiredData?.length
      ? pilotOffer.requiredData
      : solution.requiredData;
  const relevantContexts =
    pilotOffer?.requiredContext?.length
      ? pilotOffer.requiredContext
      : solution.contexts;

  const sharedChallengeIds = overlap(
    solution.challengeIds,
    grower.challengeIds
  ) as ChallengeId[];
  const sharedContexts = overlap(relevantContexts, grower.contexts);
  const sharedCrops = overlap(solution.crops, grower.crops);
  const matchedSystems = overlap(requiredSystems, grower.systems);
  const matchedData = overlap(requiredData, grower.availableData);

  const geographyFitScore = solution.geography.includes(grower.country)
    ? 100
    : 0;
  const pilotTypeFitScore =
    pilotOffer && grower.pilotTypes.includes(pilotOffer.type) ? 100 : 40;
  const challengeFitScore = ratioScore(
    sharedChallengeIds.length,
    solution.challengeIds.length
  );
  const contextFitScore = ratioScore(
    sharedContexts.length,
    relevantContexts.length
  );
  const cropFitScore = sharedCrops.length > 0 ? 100 : 35;
  const systemsFitScore = requiredSystems.length
    ? ratioScore(matchedSystems.length, requiredSystems.length)
    : 60;
  const dataFitScore = requiredData.length
    ? ratioScore(matchedData.length, requiredData.length)
    : 60;

  const pilotReadinessScore =
    systemsFitScore * 0.45 + dataFitScore * 0.35 + pilotTypeFitScore * 0.2;
  const validationFitScore =
    stageScore(solution.stage) * 0.55 +
    evidenceScore(evidenceRecord?.quality) * 0.45;

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
    pilotOfferId: pilotOffer?.id ?? null,
    evidenceRecordId: evidenceRecord?.id ?? null,
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

// ─── Batch match builder ──────────────────────────────────────────────────────

export function buildMatches(
  activeGrower: Grower,
  solutions: Solution[],
  pilotOffers: PilotOffer[],
  evidenceRecords: EvidenceRecord[]
): Match[] {
  return solutions
    .map((solution) => {
      const pilotOffer = pilotOffers.find(
        (offer) => offer.solutionId === solution.id
      );
      const evidenceRecord = evidenceRecords.find(
        (record) => record.solutionId === solution.id
      );
      return calculateMatch(solution, activeGrower, pilotOffer, evidenceRecord);
    })
    .sort((a, b) => b.score - a.score);
}

// ─── Solution enrichment ──────────────────────────────────────────────────────

export function enrichSolution(
  solution: Solution,
  matches: Match[],
  pilotOffers: PilotOffer[],
  evidenceRecords: EvidenceRecord[],
  challenges: Challenge[]
): EnrichedSolution {
  const match = matches.find((item) => item.solutionId === solution.id);
  const pilotOffer =
    pilotOffers.find((offer) => offer.id === match?.pilotOfferId) ??
    pilotOffers.find((offer) => offer.solutionId === solution.id) ??
    null;
  const evidenceRecord =
    evidenceRecords.find((record) => record.id === match?.evidenceRecordId) ??
    evidenceRecords.find((record) => record.solutionId === solution.id) ??
    null;

  return {
    ...solution,
    tags: namesFromIds(solution.challengeIds, challenges),
    match,
    pilotOffer,
    evidenceRecord,
  };
}
