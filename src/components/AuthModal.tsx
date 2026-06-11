"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  onClose: () => void;
}

type Status = "idle" | "submitting" | "sent" | "error";

export function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setStatus("submitting");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    setStatus(error ? "error" : "sent");
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">
              We&apos;ll email you a sign-in link. No password needed.
            </p>
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

        {status === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={36} className="text-emerald-700" />
            <p className="font-semibold text-slate-950">Check your inbox</p>
            <p className="text-sm text-slate-500">
              Sent a sign-in link to <strong>{email}</strong>.
            </p>
            <Button
              onClick={onClose}
              className="mt-2 rounded-xl bg-emerald-800 hover:bg-emerald-900"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">
                Email address
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </label>
            {status === "error" && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                Something went wrong. Please try again.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send link"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
