"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnrichedSolution } from "@/data/types";

interface RequestIntroModalProps {
  solution: EnrichedSolution;
  onClose: () => void;
}

type Status = "idle" | "submitting" | "success" | "error";

// Replace with your Formspree form ID: https://formspree.io/forms
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdavojag";

export function RequestIntroModal({ solution, onClose }: RequestIntroModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email,
          solution: solution.name,
          solutionId: solution.id,
          message,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Request intro
            </p>
            <h2 className="text-xl font-semibold text-slate-950">
              {solution.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {solution.proposition}
            </p>
            {solution.pilotOffer?.responseTime && (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                {solution.pilotOffer.responseTime}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={40} className="text-emerald-700" />
            <p className="font-semibold text-slate-950">Request sent</p>
            <p className="text-sm text-slate-500">
              We&apos;ll connect you with the team behind {solution.name} shortly.
            </p>
            <Button onClick={onClose} className="mt-2 rounded-xl bg-emerald-800 hover:bg-emerald-900">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Your name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Jan de Vries"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="jan@example.com"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">
                Anything useful for the innovator to know?
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputClass} min-h-[80px] resize-none`}
                placeholder="e.g. crop type, scale, timeline..."
              />
            </label>

            {status === "error" && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                Something went wrong. Please try again or email us directly.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send request"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
