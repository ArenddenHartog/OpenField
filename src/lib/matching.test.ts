import { describe, expect, it } from "vitest";
import { buildMatches, calculateMatch, enrichSolution } from "./matching";
import type { EvidenceRecord, Grower, PilotOffer, Solution } from "@/data/types";

function makeSolution(overrides: Partial<Solution> = {}): Solution {
  return {
    id: "sol-1",
    name: "MildewSense",
    type: "AI / Software",
    proposition: "Detects mildew earlier.",
    stage: "Active pilots",
    challengeIds: ["disease-detection"],
    contexts: ["Greenhouse"],
    crops: ["Tomato"],
    requiredSystems: ["Camera system"],
    requiredData: ["Weekly image capture"],
    geography: ["Netherlands"],
    lookingFor: ["Pilot growers"],
    ...overrides,
  };
}

function makeGrower(overrides: Partial<Grower> = {}): Grower {
  return {
    id: "grower-1",
    name: "Jan",
    role: "Grower",
    region: "Westland",
    countries: ["Netherlands"],
    operation: "Tomato greenhouse",
    contexts: ["Greenhouse"],
    crops: ["Tomato"],
    openness: "High",
    challengeIds: ["disease-detection"],
    constraints: [],
    systems: ["Camera system"],
    availableData: ["Weekly image capture"],
    pilotTypes: ["Free pilot"],
    ...overrides,
  };
}

function makePilotOffer(overrides: Partial<PilotOffer> = {}): PilotOffer {
  return {
    id: "pilot-1",
    solutionId: "sol-1",
    title: "Greenhouse pilot",
    type: "Free pilot",
    status: "Open",
    availability: "Open",
    duration: "8 weeks",
    includes: [],
    responseTime: "3 days",
    requiredContext: [],
    requiredSystems: [],
    requiredData: [],
    ...overrides,
  };
}

function makeEvidenceRecord(overrides: Partial<EvidenceRecord> = {}): EvidenceRecord {
  return {
    id: "evidence-1",
    solutionId: "sol-1",
    type: "Field trial",
    tested: "2 pilots",
    geography: "Netherlands",
    impact: "Earlier detection",
    quality: "High",
    ...overrides,
  };
}

describe("calculateMatch", () => {
  it("scores a perfectly aligned solution/grower pair highly", () => {
    const match = calculateMatch(makeSolution(), makeGrower(), makePilotOffer(), makeEvidenceRecord());
    expect(match.score).toBeGreaterThanOrEqual(90);
    expect(match.sharedChallengeIds).toEqual(["disease-detection"]);
    expect(match.sharedCrops).toEqual(["Tomato"]);
    expect(match.sharedContexts).toEqual(["Greenhouse"]);
  });

  it("scores a fully misaligned pair much lower", () => {
    const grower = makeGrower({
      countries: ["Spain"],
      contexts: ["Open field"],
      crops: ["Lettuce"],
      challengeIds: ["irrigation"],
      systems: [],
      availableData: [],
      pilotTypes: ["Paid pilot"],
    });
    const aligned = calculateMatch(makeSolution(), makeGrower(), makePilotOffer(), makeEvidenceRecord());
    const misaligned = calculateMatch(makeSolution(), grower, makePilotOffer(), makeEvidenceRecord());
    expect(misaligned.score).toBeLessThan(aligned.score);
    expect(misaligned.sharedChallengeIds).toEqual([]);
    expect(misaligned.sharedCrops).toEqual([]);
  });

  it("falls back to the solution's own requirements when the pilot offer has none", () => {
    const pilotOffer = makePilotOffer({ requiredSystems: [], requiredData: [], requiredContext: [] });
    const match = calculateMatch(makeSolution(), makeGrower(), pilotOffer, makeEvidenceRecord());
    expect(match.matchedSystems).toEqual(["Camera system"]);
    expect(match.matchedData).toEqual(["Weekly image capture"]);
  });

  it("handles a missing pilot offer and evidence record without throwing", () => {
    expect(() => calculateMatch(makeSolution(), makeGrower(), undefined, undefined)).not.toThrow();
    const match = calculateMatch(makeSolution(), makeGrower(), undefined, undefined);
    expect(match.pilotOfferId).toBeNull();
    expect(match.evidenceRecordId).toBeNull();
  });
});

describe("buildMatches", () => {
  it("sorts matches by descending score", () => {
    const grower = makeGrower();
    const strongSolution = makeSolution({ id: "sol-strong" });
    const weakSolution = makeSolution({
      id: "sol-weak",
      challengeIds: ["irrigation"],
      crops: ["Lettuce"],
      contexts: ["Open field"],
      geography: ["Spain"],
    });
    const matches = buildMatches(
      grower,
      [weakSolution, strongSolution],
      [makePilotOffer({ id: "pilot-strong", solutionId: "sol-strong" })],
      [makeEvidenceRecord({ id: "evidence-strong", solutionId: "sol-strong" })]
    );
    expect(matches[0].solutionId).toBe("sol-strong");
    expect(matches[0].score).toBeGreaterThanOrEqual(matches[1].score);
  });
});

describe("enrichSolution", () => {
  it("attaches match, pilot offer, evidence record, and tag names", () => {
    const grower = makeGrower();
    const solution = makeSolution();
    const pilotOffer = makePilotOffer();
    const evidenceRecord = makeEvidenceRecord();
    const matches = buildMatches(grower, [solution], [pilotOffer], [evidenceRecord]);
    const enriched = enrichSolution(solution, matches, [pilotOffer], [evidenceRecord], [
      { id: "disease-detection", name: "Disease detection" },
    ]);

    expect(enriched.match?.solutionId).toBe(solution.id);
    expect(enriched.pilotOffer?.id).toBe(pilotOffer.id);
    expect(enriched.evidenceRecord?.id).toBe(evidenceRecord.id);
    expect(enriched.tags).toEqual(["Disease detection"]);
  });

  it("falls back to a solution-matched pilot offer/evidence record when there is no scored match", () => {
    const solution = makeSolution();
    const pilotOffer = makePilotOffer();
    const evidenceRecord = makeEvidenceRecord();
    const enriched = enrichSolution(solution, [], [pilotOffer], [evidenceRecord], []);

    expect(enriched.match).toBeUndefined();
    expect(enriched.pilotOffer?.id).toBe(pilotOffer.id);
    expect(enriched.evidenceRecord?.id).toBe(evidenceRecord.id);
  });
});
