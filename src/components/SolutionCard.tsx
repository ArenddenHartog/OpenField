"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Handshake, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "@/components/Tag";
import { StagePill } from "@/components/StagePill";
import type { EnrichedSolution } from "@/data/types";
import { cn } from "@/lib/utils";

interface SolutionCardProps {
  solution: EnrichedSolution;
  selected: boolean;
  onClick: () => void;
}

export function SolutionCard({ solution, selected, onClick }: SolutionCardProps) {
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
          {solution.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-xl">
              <img
                src={solution.imageUrl}
                alt={solution.name}
                className="h-32 w-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">
                    {solution.name}
                  </h3>
                  <p className="text-xs text-slate-500">{solution.type}</p>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-700">
                {solution.proposition}
              </p>
            </div>
            <div
              title="Match score out of 100 — based on challenge, context, crop, pilot readiness, geography, and validation fit"
              className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white"
            >
              <div className="text-lg font-semibold">
                {solution.match?.score ?? "—"}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-slate-300">
                score
              </div>
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
              {solution.pilotOffer?.availability ??
                "Pilot availability not yet specified"}
            </div>
            <ArrowRight size={16} className="text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
