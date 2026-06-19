import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EvidenceRecord, PilotOffer, Solution } from "@/data/types";

const upsertMock = vi.fn();
const deleteEqMock = vi.fn();
const captureExceptionMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      upsert: (...args: unknown[]) => upsertMock(table, ...args),
      delete: () => ({
        eq: (...args: unknown[]) => deleteEqMock(table, ...args),
      }),
    })),
  },
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureExceptionMock(...args),
}));

import { saveSolution } from "./db";

const solution: Solution = {
  id: "sol-1",
  name: "MildewSense",
  type: "AI / Software",
  proposition: "Detects mildew earlier.",
  stage: "Active pilots",
  challengeIds: ["disease-detection"],
  contexts: ["Greenhouse"],
  crops: ["Tomato"],
  requiredSystems: [],
  requiredData: [],
  geography: ["Netherlands"],
  lookingFor: [],
};

const pilotOffer: PilotOffer = {
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
};

const evidenceRecord: EvidenceRecord = {
  id: "evidence-1",
  solutionId: "sol-1",
  type: "Field trial",
  tested: "2 pilots",
  geography: "Netherlands",
  impact: "Earlier detection",
  quality: "High",
};

beforeEach(() => {
  upsertMock.mockReset();
  deleteEqMock.mockReset();
  captureExceptionMock.mockReset();
  upsertMock.mockResolvedValue({ error: null });
  deleteEqMock.mockResolvedValue({ error: null });
});

describe("saveSolution", () => {
  it("upserts solution, pilot offer, and evidence record in order when all succeed", async () => {
    await saveSolution(solution, pilotOffer, evidenceRecord, "user-1");

    expect(upsertMock).toHaveBeenCalledTimes(3);
    expect(upsertMock.mock.calls[0][0]).toBe("solutions");
    expect(upsertMock.mock.calls[1][0]).toBe("pilot_offers");
    expect(upsertMock.mock.calls[2][0]).toBe("evidence_records");
    expect(deleteEqMock).not.toHaveBeenCalled();
  });

  it("rolls back the solution row and rethrows when the pilot offer upsert fails", async () => {
    const pilotOfferError = new Error("pilot offer write failed");
    upsertMock.mockImplementation((table: string) => {
      if (table === "pilot_offers") return Promise.resolve({ error: pilotOfferError });
      return Promise.resolve({ error: null });
    });

    await expect(saveSolution(solution, pilotOffer, evidenceRecord, "user-1")).rejects.toBe(pilotOfferError);

    expect(deleteEqMock).toHaveBeenCalledTimes(1);
    expect(deleteEqMock.mock.calls[0]).toEqual(["solutions", "id", "sol-1"]);
    expect(captureExceptionMock).toHaveBeenCalledWith(
      pilotOfferError,
      expect.objectContaining({ tags: { op: "saveSolution.pilot_offers" } })
    );
    // evidence_records must never be written once pilot_offers has failed
    expect(upsertMock.mock.calls.some(([table]) => table === "evidence_records")).toBe(false);
  });

  it("rolls back the solution row and rethrows when the evidence record upsert fails", async () => {
    const evidenceError = new Error("evidence write failed");
    upsertMock.mockImplementation((table: string) => {
      if (table === "evidence_records") return Promise.resolve({ error: evidenceError });
      return Promise.resolve({ error: null });
    });

    await expect(saveSolution(solution, pilotOffer, evidenceRecord, "user-1")).rejects.toBe(evidenceError);

    expect(deleteEqMock).toHaveBeenCalledTimes(1);
    expect(deleteEqMock.mock.calls[0]).toEqual(["solutions", "id", "sol-1"]);
    expect(captureExceptionMock).toHaveBeenCalledWith(
      evidenceError,
      expect.objectContaining({ tags: { op: "saveSolution.evidence_records" } })
    );
  });

  it("rethrows immediately without attempting a rollback when the solution upsert itself fails", async () => {
    const solutionError = new Error("solution write failed");
    upsertMock.mockImplementation((table: string) => {
      if (table === "solutions") return Promise.resolve({ error: solutionError });
      return Promise.resolve({ error: null });
    });

    await expect(saveSolution(solution, pilotOffer, evidenceRecord, "user-1")).rejects.toBe(solutionError);

    expect(deleteEqMock).not.toHaveBeenCalled();
    expect(upsertMock).toHaveBeenCalledTimes(1);
  });
});
