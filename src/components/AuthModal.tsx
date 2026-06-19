"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { isValidEmail } from "@/lib/utils";

interface AuthModalProps {
  onClose: () => void;
}

type Status = "idle" | "submitting" | "sent" | "error";

const RESEND_COOLDOWN_SECONDS = 30;

export function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const containerRef = useFocusTrap<HTMLDivElement>(onClose);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendMagicLink() {
    if (!supabase) return;

    if (!isValidEmail(email)) {
      setErrorMessage("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMagicLink();
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.div
        ref={containerRef}
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
            <div className="mt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={sendMagicLink}
                disabled={cooldown > 0}
                className="rounded-xl disabled:opacity-60"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
              </Button>
              <Button
                onClick={onClose}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-900"
              >
                Done
              </Button>
            </div>
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
                {errorMessage || "Something went wrong. Please try again."}
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
