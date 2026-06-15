"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_COUNTRIES = [
  "Global", "AD", "AE", "AF", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN", "BO", "BR", "BS",
  "BT", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC",
  "EE", "EG", "ER", "ES", "ET", "FI", "FJ", "FR", "GA", "GB", "GD", "GE", "GH",
  "GM", "GN", "GQ", "GR", "GT", "GW", "GY", "HN", "HR", "HT", "HU", "ID", "IE",
  "IL", "IN", "IQ", "IR", "IS", "IT", "JM", "JO", "JP", "KE", "KG", "KH", "KI",
  "KM", "KN", "KP", "KR", "KW", "KZ", "LA", "LB", "LC", "LI", "LR", "LS", "LT",
  "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MG", "MH", "ML", "MM", "MN", "MR",
  "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NI", "NL", "NO",
  "NP", "NR", "NZ", "OM", "PA", "PE", "PG", "PH", "PK", "PL", "PT", "PW", "PY",
  "QA", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SI", "SK",
  "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SY", "SZ", "TD", "TG", "TH",
  "TJ", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TZ", "UA", "UG", "US", "UY",
  "UZ", "VC", "VE", "VN", "VU", "WS", "YE", "ZA", "ZM", "ZW",
];

interface CountryPickerProps {
  value: string[];
  onChange: (v: string[]) => void;
}

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(country: string) {
    if (value.includes(country)) {
      onChange(value.filter((c) => c !== country));
    } else {
      onChange([...value, country]);
    }
  }

  const q = query.toLowerCase().trim();
  const filtered = q
    ? ALL_COUNTRIES.filter((c) => {
        if (c === "Global") return "global".includes(q);
        return c.toLowerCase().includes(q);
      })
    : ALL_COUNTRIES;

  // Always keep Global first
  const sortedFiltered = filtered.includes("Global")
    ? ["Global", ...filtered.filter((c) => c !== "Global")]
    : filtered;

  // Summary label
  let summary: string;
  if (value.length === 0) {
    summary = "Select countries";
  } else if (value.length <= 3) {
    summary = value.join(", ");
  } else {
    summary = `${value.length} countries selected`;
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-left flex items-center justify-between outline-none focus:border-emerald-700"
      >
        <span className={value.length === 0 ? "text-slate-400" : "text-slate-900"}>
          {summary}
        </span>
        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-lg mt-1 z-20 absolute w-full">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="rounded-lg border-0 border-b border-slate-100 px-3 py-2 text-sm outline-none w-full"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto">
            {sortedFiltered.map((country) => {
              const checked = value.includes(country);
              return (
                <div
                  key={country}
                  onClick={() => toggle(country)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={checked}
                    className="accent-emerald-700 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>{country}</span>
                </div>
              );
            })}
            {sortedFiltered.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
