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
    description: "I have a solution ready to test or scale.",
    icon: <Lightbulb size={22} />,
    profileType: "innovator",
    accent: "bg-amber-50 text-amber-700",
  },
  {
    label: "Grower",
    description: "I run a farming or horticultural operation.",
    icon: <Sprout size={22} />,
    profileType: "grower",
    growerRole: "Grower",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Breeder",
    description: "I work on variety development and genetics.",
    icon: <FlaskConical size={22} />,
    profileType: "grower",
    growerRole: "Breeder",
    accent: "bg-purple-50 text-purple-700",
  },
  {
    label: "Researcher",
    description: "I conduct trials, studies, or applied research.",
    icon: <BookOpen size={22} />,
    profileType: "grower",
    growerRole: "Researcher",
    accent: "bg-blue-50 text-blue-700",
  },
  {
    label: "Technology partner",
    description: "I supply equipment, data, or digital services.",
    icon: <Cpu size={22} />,
    profileType: "grower",
    growerRole: "Technology partner",
    accent: "bg-slate-100 text-slate-700",
  },
  {
    label: "Other",
    description: "I have another role in the agri-food chain.",
    icon: <Users size={22} />,
    profileType: "grower",
    growerRole: "Other",
    accent: "bg-slate-100 text-slate-600",
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
              className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className={`rounded-xl p-2 ${profile.accent}`}>
                {profile.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">{profile.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">{profile.description}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
