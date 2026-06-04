"use client";

import { motion } from "framer-motion";
import { X, Lightbulb, Sprout, FlaskConical, BookOpen, Cpu, Users } from "lucide-react";
import type { GrowerRole } from "@/data/types";

type ProfileType = "innovator" | "grower";

interface ProfileChoice {
  label: string;
  description: string;
  icon: React.ReactNode;
  profileType: ProfileType;
  growerRole?: GrowerRole;
  accent: string;
}

const PROFILES: ProfileChoice[] = [
  {
    label: "Innovator",
    description: "",
    icon: <Lightbulb size={22} />,
    profileType: "innovator",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Grower",
    description: "",
    icon: <Sprout size={22} />,
    profileType: "grower",
    growerRole: "Grower",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Breeder",
    description: "",
    icon: <FlaskConical size={22} />,
    profileType: "grower",
    growerRole: "Breeder",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Researcher",
    description: "",
    icon: <BookOpen size={22} />,
    profileType: "grower",
    growerRole: "Researcher",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Technology partner",
    description: "",
    icon: <Cpu size={22} />,
    profileType: "grower",
    growerRole: "Technology partner",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Other",
    description: "",
    icon: <Users size={22} />,
    profileType: "grower",
    growerRole: "Other",
    accent: "bg-emerald-50 text-emerald-700",
  },
];

interface ProfilePickerModalProps {
  onClose: () => void;
  onSelect: (profileType: ProfileType, growerRole?: GrowerRole) => void;
}

export function ProfilePickerModal({ onClose, onSelect }: ProfilePickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              OpenField
            </p>
            <h2 className="text-xl font-semibold text-slate-950">Who are you?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick the profile that best describes your role.
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROFILES.map((profile) => (
            <button
              key={profile.label}
              type="button"
              onClick={() => onSelect(profile.profileType, profile.growerRole)}
              className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 p-5 text-center transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className={`rounded-xl p-2.5 ${profile.accent}`}>
                {profile.icon}
              </div>
              <p className="text-sm font-semibold text-slate-950">{profile.label}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
